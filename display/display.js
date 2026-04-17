const instructionsEl = document.getElementById("instructions");
const askBtn = document.getElementById("askBtn");
const resultBox = document.getElementById("resultBox");
const actionRow = document.getElementById("actionRow");
const copyBtn = document.getElementById("copyBtn");
const replyBtn = document.getElementById("replyBtn");

let lastResult = "";
let lastWasReply = false;
let currentMessage = null;

// Quick action buttons
document.querySelectorAll(".quick-btn").forEach(btn => {
  btn.addEventListener("click", () => runAction(btn.dataset.action));
});

askBtn.addEventListener("click", () => {
  const instruction = instructionsEl.value.trim();
  if (!instruction) {
    showError("Enter a question or instruction.");
    return;
  }
  runAction("custom", instruction);
});

copyBtn.addEventListener("click", () => {
  navigator.clipboard.writeText(lastResult);
  copyBtn.textContent = "Copied!";
  setTimeout(() => { copyBtn.textContent = "Copy"; }, 1500);
});

replyBtn.addEventListener("click", async () => {
  if (!currentMessage) return;
  await browser.compose.beginReply(currentMessage.id);
  // Brief delay then insert the drafted reply body
  setTimeout(async () => {
    const composeTabs = await browser.tabs.query({ type: "messageCompose" });
    if (composeTabs.length > 0) {
      await browser.compose.setComposeDetails(composeTabs[composeTabs.length - 1].id, {
        body: lastResult
      });
    }
  }, 800);
});

async function runAction(action, customInstruction) {
  const msg = await getDisplayedMessage();
  if (!msg) return;

  currentMessage = msg;

  const subject = msg.subject || "(no subject)";
  const from = msg.author || "";
  const body = await getMessageBody(msg);

  const emailContext = `From: ${from}\nSubject: ${subject}\n\nBody:\n${body}`;

  let systemPrompt, userPrompt;
  lastWasReply = false;

  switch (action) {
    case "summarize":
      systemPrompt = "You are an email assistant. Summarize the email concisely in 3-5 bullet points.";
      userPrompt = emailContext;
      break;
    case "actions":
      systemPrompt = "You are an email assistant. List only the action items and deadlines from this email as a bullet list. If there are none, say so briefly.";
      userPrompt = emailContext;
      break;
    case "reply":
      systemPrompt = "You are an email assistant. Draft a clear, helpful reply. Output only the reply body — no subject, no 'Here is a draft:' preamble.";
      userPrompt = emailContext;
      lastWasReply = true;
      break;
    case "formal-reply":
      systemPrompt = "You are an email assistant. Draft a formal, professional reply. Output only the reply body — no subject, no preamble.";
      userPrompt = emailContext;
      lastWasReply = true;
      break;
    case "tldr":
      systemPrompt = "You are an email assistant. Give a one-sentence TL;DR of this email.";
      userPrompt = emailContext;
      break;
    case "custom":
      systemPrompt = "You are an email assistant. Answer the user's question or follow their instruction based on the email provided. Be concise.";
      userPrompt = `Instruction: ${customInstruction}\n\nEmail:\n${emailContext}`;
      break;
  }

  setLoading(true);

  const response = await browser.runtime.sendMessage({ type: "claude", systemPrompt, userPrompt });

  setLoading(false);

  if (response.error) {
    showError(response.error);
    return;
  }

  lastResult = response.text;
  resultBox.textContent = lastResult;
  resultBox.className = "";
  resultBox.style.display = "block";
  actionRow.style.display = "flex";
  replyBtn.style.display = lastWasReply ? "block" : "none";
}

async function getDisplayedMessage() {
  try {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    if (!tabs[0]) return null;
    return await browser.messageDisplay.getDisplayedMessage(tabs[0].id);
  } catch (e) {
    showError("Could not read the displayed message.");
    return null;
  }
}

async function getMessageBody(msg) {
  try {
    const full = await browser.messages.getFull(msg.id);
    return extractText(full);
  } catch (e) {
    return "(could not read message body)";
  }
}

function extractText(part) {
  if (!part) return "";
  if (part.body && (part.contentType === "text/plain" || part.contentType === "text/html")) {
    // Strip basic HTML tags for cleaner text
    return part.body.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  }
  if (part.parts) {
    // Prefer text/plain, fall back to text/html
    const plain = part.parts.find(p => p.contentType === "text/plain");
    if (plain) return extractText(plain);
    const html = part.parts.find(p => p.contentType === "text/html");
    if (html) return extractText(html);
    return part.parts.map(extractText).join("\n").trim();
  }
  return "";
}

function setLoading(on) {
  if (on) {
    askBtn.disabled = true;
    askBtn.innerHTML = '<span class="spinner"></span>Thinking…';
    resultBox.style.display = "none";
    actionRow.style.display = "none";
  } else {
    askBtn.disabled = false;
    askBtn.textContent = "Ask Claude";
  }
}

function showError(msg) {
  resultBox.textContent = msg;
  resultBox.className = "error";
  resultBox.style.display = "block";
  actionRow.style.display = "none";
}
