const apiKeyEl = document.getElementById("apiKey");
const modelEl = document.getElementById("model");
const saveBtn = document.getElementById("saveBtn");
const testBtn = document.getElementById("testBtn");
const statusEl = document.getElementById("status");

// Load saved settings
browser.storage.local.get(["apiKey", "model"]).then(({ apiKey, model }) => {
  if (apiKey) apiKeyEl.value = apiKey;
  if (model) modelEl.value = model;
});

saveBtn.addEventListener("click", async () => {
  const apiKey = apiKeyEl.value.trim();
  const model = modelEl.value;

  if (!apiKey) {
    showStatus("Please enter an API key.", "error");
    return;
  }

  await browser.storage.local.set({ apiKey, model });
  showStatus("Settings saved.", "success");
});

testBtn.addEventListener("click", async () => {
  const apiKey = apiKeyEl.value.trim();
  if (!apiKey) {
    showStatus("Enter an API key first.", "error");
    return;
  }

  testBtn.disabled = true;
  testBtn.textContent = "Testing…";
  statusEl.style.display = "none";

  // Save first so the background script can use the current values
  await browser.storage.local.set({ apiKey, model: modelEl.value });

  const response = await browser.runtime.sendMessage({
    type: "claude",
    systemPrompt: "You are a helpful assistant.",
    userPrompt: "Reply with exactly: Connection successful."
  });

  testBtn.disabled = false;
  testBtn.textContent = "Test connection";

  if (response.error) {
    showStatus("Error: " + response.error, "error");
  } else {
    showStatus("Connection successful! Model: " + modelEl.value, "success");
  }
});

function showStatus(msg, type) {
  statusEl.textContent = msg;
  statusEl.className = type;
  statusEl.style.display = "block";
}
