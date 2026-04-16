/**
 * Background script — handles Claude API calls on behalf of popups.
 * Popups send a message: { type: "claude", systemPrompt, userPrompt }
 * and receive back: { text } or { error }
 */

browser.runtime.onMessage.addListener(async (message) => {
  if (message.type !== "claude") return;

  const { apiKey: rawKey, model } = await browser.storage.local.get(["apiKey", "model"]);

  if (!rawKey) {
    return { error: "No API key set. Open Add-on Settings to add your Anthropic API key." };
  }

  // Strip any non-ASCII characters (e.g. bullet dots from password managers)
  const apiKey = rawKey.replace(/[^\x20-\x7E]/g, "").trim();

  if (!apiKey) {
    return { error: "API key contains only invalid characters. Please re-enter it in Settings." };
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true"
      },
      body: JSON.stringify({
        model: model || "claude-sonnet-4-6",
        max_tokens: 2048,
        system: message.systemPrompt || "You are a helpful email assistant.",
        messages: [{ role: "user", content: message.userPrompt }]
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return { error: `API error ${response.status}: ${err?.error?.message || response.statusText}` };
    }

    const data = await response.json();
    return { text: data.content?.[0]?.text ?? "" };
  } catch (e) {
    return { error: `Request failed: ${e.message}` };
  }
});
