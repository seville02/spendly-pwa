# Spendly PWA

A mobile-first Progressive Web App for tracking budget spending and managing personal finances.

![License](https://img.shields.io/badge/license-MIT-green)
![Status](https://img.shields.io/badge/status-active-blue)
![Hosting](https://img.shields.io/badge/hosting-GitHub%20Pages-blueviolet)

---

## ⚡ Static vs Dynamic — Know Before You Deploy

> This app is a **fully static PWA** (no server, no build step).
> However, some features reach out to external services. These are clearly listed below.

| Feature | Type | Requires |
|---------|------|----------|
| Transactions, budgets, stats, events | ✅ **Static / Local** | Nothing — stored in `localStorage` |
| Offline support, home-screen install | ✅ **Static / Local** | Service worker (built-in) |
| PIN lock, themes, categories | ✅ **Static / Local** | Nothing |
| **User accounts & cross-device sync** | ⚠️ **DYNAMIC** | **Supabase credentials in `config.js`** |
| **AI spending summary** | ⚠️ **DYNAMIC** | **Google Gemini API key in `config.js`** |

### 🟢 Works with zero config (Local-Only Mode)
Leave `SUPABASE_URL` and `SUPABASE_ANON` blank in `config.js` — the app automatically falls back to **Local-Only Mode**. All data stays in your browser. No account required.

### 🔴 Dynamic features that need credentials

> **⚠️ SIGN IN / SIGN UP / CLOUD SYNC — These features require a Supabase project.**
> Without credentials, authentication is disabled and all data is local only.

> **⚠️ AI SPENDING SUMMARY — This feature requires a Google Gemini API key.**
> Without a key, the AI summary section will not appear.

---

## 🎯 Overview

Spendly is a lightweight, installable PWA for tracking spending in real-time. Built with vanilla JS and no frameworks — just open `index.html` and go.

## ✨ Features

- **📊 Dashboard** — Real-time balance, remaining budget, spending hero card
- **💳 Transactions** — Add, search, swipe-to-delete, filter by category
- **📈 Stats & Charts** — Spending breakdowns, merchant insights, daily & monthly trends
- **💰 Budget & Salary** — Set a flat budget or calculate from a monthly/weekly salary
- **🎯 Event Planner** — Plan events with per-event currency, expense tracking, and progress bars
- **🗑️ 30-Day Recovery** — Deleted transactions can be recovered within 30 days
- **🤝 Debts** — Track who owes you and who you owe
- **🧾 Bill Splitter** — OCR scan a bill and split it between people
- **🔥 Streaks** — Gamified daily tracking motivation
- **🌓 Dark / Light Theme** — Toggle anytime
- **📴 Offline** — Full offline support via service worker
- **📱 PWA** — Installable on any device from the browser

## 🚀 Quick Start

### Option A — Local Only (zero config)

```bash
git clone https://github.com/seville02/spendly-pwa.git
cd spendly-pwa
# Open index.html in your browser — that's it
```

Leave `config.js` credentials empty. All data stays in your browser.

### Option B — With Cloud Sync (Supabase)

1. Create a free project at [supabase.com](https://supabase.com)
2. Copy your `Project URL` and `anon public` key
3. Edit `config.js`:

```js
const SUPABASE_URL  = 'https://your-project.supabase.co';
const SUPABASE_ANON = 'your-anon-key';
```

4. **DYNAMIC:** Sign up / sign in will now work and your data syncs across devices.

### Option C — With AI Summary (Gemini)

1. Get a free API key at [aistudio.google.com](https://aistudio.google.com)
2. Edit `config.js`:

```js
const GEMINI_KEY = 'your-gemini-api-key';
```

3. **DYNAMIC:** The AI spending summary section will appear on your Home screen.

## 💻 Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vanilla JavaScript (no frameworks) |
| Styling | CSS3 with custom properties |
| Charts | Chart.js 4.4.0 |
| Fonts | DM Sans & DM Mono (Google Fonts) |
| Storage (local) | `localStorage` |
| Storage (cloud) | Supabase (optional) |
| OCR | Google Gemini Vision (optional) |
| PWA | Service Worker + Web App Manifest |

## 📁 Project Structure

```
spendly-pwa/
├── index.html       # App shell — all screens and modals
├── app.js           # All UI logic, rendering, routing
├── db.js            # Supabase database layer + local fallback
├── style.css        # Design system and component styles
├── config.js        # ← PUT YOUR CREDENTIALS HERE
├── sw.js            # Service worker (offline caching)
├── manifest.json    # PWA install metadata
└── icons/           # App icons
```

## 🔒 Security & Privacy

- **Local-Only Mode**: zero data leaves your device
- PIN-protected access
- No tracking, no analytics, no ads
- Supabase data is tied to your own project — you own it

## 📱 Browser Support

- Chrome / Edge 90+
- Firefox 88+
- Safari 14+
- iOS Safari, Chrome Mobile, Samsung Internet

## 🛠️ Development

No build process. Edit files, refresh browser.

```bash
# Optional local dev server
npx http-server --cors
```

## 🤝 Contributing

Issues and PRs are welcome via [GitHub](https://github.com/seville02/spendly-pwa).

## 📄 License

MIT — see [LICENSE](LICENSE)

---

**Happy spending tracking! 💚**
