# Claude Mail Assistant

A free, open-source Thunderbird add-on that brings [Claude AI](https://www.anthropic.com/claude) into your email workflow. Compose better emails, summarize long threads, and draft replies — without leaving Thunderbird.

> **Not affiliated with or endorsed by Anthropic.** This is an independent community project.

---

## Features

**In the compose window:**
- Improve clarity and flow
- Make tone formal or casual
- Shorten the email
- Fix grammar and spelling
- Draft a reply to the email you're responding to
- Custom instructions (translate, rewrite, add subject line, etc.)

**In the reading pane:**
- Summarize in bullet points
- Extract action items and deadlines
- Draft a reply or formal reply
- TL;DR (one sentence)
- Ask anything about the email

---

## Installation

### From addons.thunderbird.net (recommended)
Search for **Claude Mail Assistant** on [addons.thunderbird.net](https://addons.thunderbird.net) and click Install.

### Manual install
1. Download `claude-assistant.xpi` from the [latest release](https://github.com/sbelcl/claude-mail-assistant/releases/latest)
2. In Thunderbird: **Tools → Add-on Manager → gear icon → Install Add-on From File…**
3. Select the downloaded `.xpi` file

---

## Setup

1. After installing, open **Add-on Settings** (gear icon in Add-on Manager → Preferences)
2. Enter your [Anthropic API key](https://console.anthropic.com/account/keys)
3. Choose a model (Sonnet 4.6 recommended)
4. Click **Save**, then **Test connection**

**Tip:** Set a monthly usage limit for your API key at [console.anthropic.com](https://console.anthropic.com/account/keys) to avoid unexpected charges.

### Pricing
You pay only for your own Anthropic API usage. See [anthropic.com/pricing](https://www.anthropic.com/pricing) for current rates. For typical email use, costs are very low (a few cents per day).

---

## Privacy

When you use any AI feature, the content of the active email is sent directly from your machine to Anthropic's API. No data passes through any third-party server. Your API key is stored locally in Thunderbird only.

See the full [Privacy Policy](privacy.html).

---

## Requirements

- Thunderbird 102 or later
- An [Anthropic API key](https://console.anthropic.com/account/keys)

---

## Contributing

Issues and pull requests are welcome. Please open an issue before submitting large changes.

## License

MIT
