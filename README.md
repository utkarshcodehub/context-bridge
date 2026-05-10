# Context Bridge

A Chrome extension that lets you save conversation context from one AI platform and inject it into another — so you never have to re-explain your project when switching between ChatGPT, Claude, and Gemini.

## The Problem

Every time you switch AI tools, you lose all context. You have to re-explain your goals, decisions, and progress from scratch. Context Bridge acts as an external memory layer between AI platforms.

## How It Works

1. **Save** — open any conversation on ChatGPT, Claude, or Gemini and click "Save Context". The extension extracts the conversation, summarises it using the Groq API, and stores it locally.
2. **Inject** — switch to a different AI platform, select a saved context, and click "Inject". The context is pasted into the input as a structured prompt so the AI knows exactly where you left off.

## Supported Platforms

| Platform | Save | Inject |
|----------|------|--------|
| ChatGPT  | ✓    | ✓      |
| Claude   | ✓    | ✓      |
| Gemini   | ✓    | ✓      |

## Features

- Extracts and compresses conversation history into structured summaries
- Stores topic, key facts, decisions, open questions, and user goal
- Shows token estimate per saved context
- Pin important contexts to keep them at the top
- All data stored locally — nothing leaves your device except the Groq API summarisation call
- Works across ChatGPT, Claude, and Gemini

## Setup

### 1. Get a free Groq API key

Sign up at [console.groq.com](https://console.groq.com) and create an API key. It's free.

### 2. Load the extension in Chrome

**Option A — Load from source:**

```bash
git clone https://github.com/YOUR_USERNAME/context-bridge.git
cd context-bridge
npm install
npm run build
```

Then go to `chrome://extensions/` → enable **Developer mode** → click **Load unpacked** → select the `.output/chrome-mv3/` folder.

**Option B — Download the build:**

Download the latest release zip, extract it, and load the folder as an unpacked extension.

### 3. Add your API key

Click the extension icon → go to **Settings** → paste your Groq API key.

## Tech Stack

| Layer | Choice |
|-------|--------|
| Extension framework | [WXT](https://wxt.dev) 0.20 (Manifest V3) |
| UI | React 18 + TypeScript |
| Styling | Tailwind CSS |
| Summarisation | Groq API (`llama-3.3-70b-versatile`) |
| Storage | `chrome.storage.local` (on-device, 10 MB limit) |

## Development

```bash
npm install
npm run dev      # opens Chrome with HMR
npm run build    # production build → .output/chrome-mv3/
```

## Privacy

- Conversation text is sent to the Groq API for summarisation only
- The summary (not the raw conversation) is stored in `chrome.storage.local`
- No data is synced, logged, or shared beyond the Groq API call
- Your API key is stored locally and never leaves your browser

## License

MIT
