const instructionsEl = document.getElementById("instructions");
const askBtn = document.getElementById("askBtn");
const resultBox = document.getElementById("resultBox");
const actionRow = document.getElementById("actionRow");
const replaceBtn = document.getElementById("replaceBtn");
const appendBtn = document.getElementById("appendBtn");
const copyBtn = document.getElementById("copyBtn");

let lastResult = "";

// Quick action buttons
document.querySelectorAll(".quick-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const prompt = btn.dataset.prompt;
    const action = btn.dataset.action;
    if (action === "reply") {
      runClaude(null, true);
    } else {
      instructionsEl.value = prompt;
      runClaude(prompt, false);
    }
  });
});

askBtn.addEventListener("click", () => {
  const instruction = instructionsEl.value.trim();
  if (!instruction) {
    showError("Enter an instruction or use a quick action button.");
    return;
  }
  runClaude(instruction, false);
});

replaceBtn.addEventListener("click", async () => {
  const tab = await getActiveTab();
  if (!tab) return;
  await browser.compose.setComposeDetails(tab.id, { body: lastResult });
});

appendBtn.addEventListener("click", async () => {
  const tab = await getActiveTab();
  if (!tab) return;
  const details = await browser.compose.getComposeDetails(tab.id);
  const current = details.body || details.plainTextBody || "";
  await browser.compose.setComposeDetails(tab.id, {
    body: current + "\n\n---\n" + lastResult
  });
});

copyBtn.addEventListener("click", () => {
  navigator.clipboard.writeText(lastResult);
  copyBtn.textContent = "Copied!";
  setTimeout(() => { copyBtn.textContent = "Copy"; }, 1500);
});

async function runClaude(instruction, isDraftReply) {
  const tab = await getActiveTab();
  if (!tab) return;

  let details;
  try {
    details = await browser.compose.getComposeDetails(tab.id);
  } catch (e) {
    showError("Could not read compose window: " + e.message);
    return;
  }

  const body = details.body || details.plainTextBody || "(empty)";
  const subject = details.subject || "(no subject)";

  let systemPrompt, userPrompt;

  if (isDraftReply) {
    systemPrompt = "You are an email assistant. Draft a clear, helpful reply to the email provided. Output only the reply body — no subject line, no 'Here is a draft:' preamble.";
    userPrompt = `Subject: ${subject}\n\nEmail content:\n${body}`;
  } else {
    systemPrompt = "You are an email assistant. Follow the user's instruction and output only the resulting email text — no preamble, no explanation.";
    userPrompt = `Instruction: ${instruction}\n\nSubject: ${subject}\n\nEmail body:\n${body}`;
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
  resultBox.style.display = "block";
  actionRow.style.display = "flex";
}

async function getActiveTab() {
  const tabs = await browser.tabs.query({ active: true, currentWindow: true });
  return tabs[0] || null;
}

function setLoading(on) {
  if (on) {
    askBtn.disabled = true;
    askBtn.innerHTML = '<span class="spinner"></span>Thinking…';
    resultBox.style.display = "none";
    actionRow.style.display = "none";
    resultBox.className = "";
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
