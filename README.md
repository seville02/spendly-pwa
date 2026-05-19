# Spendly PWA

A mobile-first Progressive Web App for tracking budget spending and managing personal finances.

![License](https://img.shields.io/badge/license-MIT-green)
![Status](https://img.shields.io/badge/status-active-blue)

## 🎯 Overview

Spendly is a lightweight, installable web application designed to help users track their spending in real-time. Built with a focus on simplicity and offline functionality, it provides an intuitive interface for managing transactions, monitoring budgets, and analyzing spending patterns.

## ✨ Features

- **📊 Dashboard** - Real-time balance display with key spending metrics
- **🔐 PIN-Protected Access** - Secure your financial data with a custom PIN
- **💳 Transaction Management** - Add, view, search, and delete transactions with ease
- **🏷️ Category Filtering** - Organize transactions by customizable categories
- **💰 Budget Tracking** - Monitor spending against budget limits with visual progress indicators
- **📈 Analytics & Charts** - Comprehensive spending analysis with category breakdowns and merchant insights
- **🔥 Streak Counter** - Gamified tracking to encourage consistent financial discipline
- **🌓 Dark & Light Themes** - Toggle between themes for comfortable viewing anytime
- **📴 Offline Support** - Full offline functionality with service worker integration
- **📱 PWA Ready** - Install as a native-like app on any device

## 🚀 Quick Start

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/shawnfeds/spendly-pwa.git
   cd spendly-pwa
   ```

2. **Open in browser:**
   - Open `index.html` in your web browser
   - Or serve locally with any HTTP server:
     ```bash
     python -m http.server 8000
     # or
     npx http-server
     ```

3. **Install as PWA:**
   - Visit the app URL in a modern browser
   - Click the "Install" button (or menu option)
   - Access from your home screen or app drawer

## 💻 Technology Stack

- **Frontend:** Vanilla JavaScript (no frameworks)
- **Styling:** CSS3 with CSS custom properties (variables)
- **Charts:** Chart.js 4.4.0
- **Fonts:** DM Sans & DM Mono (Google Fonts)
- **Storage:** Browser LocalStorage API
- **PWA:** Service Worker with offline support
- **Design System:** Custom theme tokens with light/dark mode

## 📁 Project Structure

```
spendly-pwa/
├── index.html          # Main application file (HTML, CSS, JS)
├── sw.js              # Service worker for offline support
├── manifest.json      # PWA manifest configuration
├── icons/             # App icons for different devices
├── README.md          # Documentation (this file)
└── LICENSE            # MIT License
```

## 🎨 Color Palette

| Token | Light | Dark |
|-------|-------|------|
| **Accent** | #0ea5a0 | #4fd1c5 |
| **Green** | #2d9e5f | #68d391 |
| **Red** | #e05353 | #fc8181 |
| **Amber** | #c07c20 | #f6ad55 |
| **Purple** | #7c4fc4 | #b794f4 |
| **Blue** | #2b6cb0 | #63b3ed |

## 🔑 Key Components

### Screens
- **Home** - Dashboard with balance overview
- **Transactions** - Browse and manage all transactions
- **Stats** - Detailed spending analytics
- **Settings** - Configure app preferences and security

### UI Elements
- **Hero Card** - Primary balance display with stats
- **Transaction List** - Swipeable transaction items
- **Category Filters** - Quick filtering by spending category
- **Charts** - Spending breakdowns and trends
- **Budget Banners** - Alerts when approaching limits

## 🔒 Security

- PIN-protected access with visual feedback
- All data stored locally (no cloud sync)
- Service worker isolation for offline operations
- No external API calls for sensitive data

## 📱 Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile, Samsung Internet)

## 🛠️ Development

To modify or extend Spendly:

1. **Edit styles** - Modify CSS custom properties in `:root` or `[data-theme="light"]`
2. **Add features** - JavaScript is integrated in `index.html`
3. **Update icons** - Replace files in `icons/` directory
4. **Service worker** - Modify `sw.js` for offline functionality

### Building Locally

```bash
# No build process required - just open index.html
# For development server:
npx http-server --cors
```

## 📊 Data Storage

All user data is stored locally in the browser using:
- **localStorage** - Preferences, settings, theme
- **IndexedDB** (optional) - For larger transaction datasets

*Note: Data is not synced across devices. Each installation is independent.*

## 🤝 Contributing

Contributions are welcome! Please feel free to:
- Report bugs and request features via GitHub Issues
- Submit pull requests with improvements
- Share feedback and suggestions

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

Created by [shawnfeds](https://github.com/shawnfeds)

## 🎓 Tips for Users

- **Set a daily limit** to get personalized spending alerts
- **Use categories** to understand your spending patterns
- **Check streaks** to stay motivated about financial discipline
- **Review monthly summaries** to track progress over time
- **Toggle themes** for comfortable viewing in different lighting

---

**Happy spending tracking! 💚**
