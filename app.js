// ═══════════════════════════════════════════════════════
// app.js — Spendly v4.56.0
// ═══════════════════════════════════════════════════════


// ── Clean up legacy local storage to fulfill request to "erase local data" ──
try {
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('spendly_') && !key.startsWith('spendly_trash_') && key !== 'spendly_theme') {
      localStorage.removeItem(key);
    }
  });
} catch (e) { console.warn('Local storage cleanup failed', e); }
const CATEGORIES = [
  { id: 'Food', icon: '🍽️', color: '#f6ad55' }, { id: 'Groceries', icon: '🛒', color: '#68d391' },
  { id: 'Transport', icon: '🚌', color: '#63b3ed' }, { id: 'Fuel', icon: '⛽', color: '#e8a030' },
  { id: 'Shopping', icon: '🛍️', color: '#f687b3' }, { id: 'Health', icon: '💊', color: '#48bb78' },
  { id: 'Doctor', icon: '🏥', color: '#fc8181' }, { id: 'Fitness', icon: '🏃', color: '#4fd1c5' },
  { id: 'Entertainment', icon: '🎮', color: '#b794f4' }, { id: 'Movies', icon: '🎬', color: '#9f7aea' },
  { id: 'Dining Out', icon: '🍕', color: '#ed8936' }, { id: 'Coffee', icon: '☕', color: '#b07d50' },
  { id: 'Utilities', icon: '💡', color: '#4fd1c5' }, { id: 'Rent', icon: '🏠', color: '#fc8181' },
  { id: 'Education', icon: '📚', color: '#76e4f7' }, { id: 'Subscriptions', icon: '📱', color: '#b794f4' },
  { id: 'Travel', icon: '✈️', color: '#63b3ed' }, { id: 'Hotel', icon: '🏨', color: '#f687b3' },
  { id: 'EMI / Loan', icon: '🏦', color: '#fc8181' }, { id: 'Insurance', icon: '🛡️', color: '#4299e1' },
  { id: 'Gifts', icon: '🎁', color: '#f687b3' }, { id: 'Savings', icon: '💰', color: '#68d391' },
  { id: 'Investment', icon: '📈', color: '#4fd1c5' }, { id: 'Other', icon: '📌', color: '#8896b3' },
  { id: 'Lotto', icon: '🎰', color: '#b17424' }, { id: 'Pets', icon: '🐾', color: '#e53e3e' },
  { id: 'Beauty', icon: '💅', color: '#ed64a6' }, { id: 'Hobbies', icon: '🎨', color: '#38b2ac' }
];

const INCOME_CATEGORIES = [
  { id: 'Salary', icon: '💼', color: '#68d391' },
  { id: 'Investments', icon: '📈', color: '#4fd1c5' },
  { id: 'Dividends', icon: '💹', color: '#04300dff' },
  { id: 'Freelance / Side Hustle', icon: '💻', color: '#b794f4' },
  { id: 'Gifts / Grants', icon: '🎁', color: '#f687b3' },
  { id: 'Refunds', icon: '🔄', color: '#76e4f7' },
  { id: 'Rental Income', icon: '🏠', color: '#ed8936' },
  { id: 'Business', icon: '🏢', color: '#4299e1' },
  { id: 'Lotto', icon: '🎰', color: '#b17424ff' },
  { id: 'Bonuses', icon: '⭐', color: '#33968dff' },
  { id: 'Tips', icon: '💵', color: '#259bafff' },
  { id: 'Extra Cash', icon: '💰', color: '#bd3614ff' },
  { id: 'Winnings', icon: '🏆', color: '#0fbb0aff' },
  { id: 'Sale of Items', icon: '🏷️', color: '#aa1f93ff' },
  { id: 'Other Income', icon: '📌', color: '#8896b3' },
];

const CURRENCIES = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', flag: '🇮🇳' },
  { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸' },
  { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺' },
  { code: 'GBP', symbol: '£', name: 'British Pound', flag: '🇬🇧' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', flag: '🇦🇪' },
  { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal', flag: '🇸🇦' },
  { code: 'QAR', symbol: '﷼', name: 'Qatari Riyal', flag: '🇶🇦' },
  { code: 'KWD', symbol: 'KD', name: 'Kuwaiti Dinar', flag: '🇰🇼' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', flag: '🇸🇬' },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit', flag: '🇲🇾' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', flag: '🇦🇺' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', flag: '🇨🇦' },
  { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar', flag: '🇭🇰' },
  { code: 'TWD', symbol: 'NT$', name: 'New Taiwan Dollar', flag: '🇹🇼' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', flag: '🇯🇵' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', flag: '🇨🇳' },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won', flag: '🇰🇷' },
  { code: 'THB', symbol: '฿', name: 'Thai Baht', flag: '🇹🇭' },
  { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah', flag: '🇮🇩' },
  { code: 'PHP', symbol: '₱', name: 'Philippine Peso', flag: '🇵🇭' },
  { code: 'PKR', symbol: '₨', name: 'Pakistani Rupee', flag: '🇵🇰' },
  { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka', flag: '🇧🇩' },
  { code: 'LKR', symbol: 'Rs', name: 'Sri Lankan Rupee', flag: '🇱🇰' },
  { code: 'NPR', symbol: 'रू', name: 'Nepalese Rupee', flag: '🇳🇵' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', flag: '🇧🇷' },
  { code: 'MXN', symbol: 'MX$', name: 'Mexican Peso', flag: '🇲🇽' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand', flag: '🇿🇦' },
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', flag: '🇳🇬' },
  { code: 'EGP', symbol: 'E£', name: 'Egyptian Pound', flag: '🇪🇬' },
  { code: 'TRY', symbol: '₺', name: 'Turkish Lira', flag: '🇹🇷' },
  { code: 'RUB', symbol: '₽', name: 'Russian Ruble', flag: '🇷🇺' },
  { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc', flag: '🇨🇭' },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona', flag: '🇸🇪' },
  { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone', flag: '🇳🇴' },
  { code: 'DKK', symbol: 'kr', name: 'Danish Krone', flag: '🇩🇰' },
];

// ─────────────────────────────────────────────────────
// STATE
// ─────────────────────────────────────────────────────
let currentUser = null;
let appData = { transactions: [], budgets: {}, catBudgets: {}, debts: [], profile: {} };
let localSettings = { theme: 'dark', pinEnabled: false, pinHash: '', currency: '₹', summaryDismissed: '' };
let editingTxId = null;
let transactionsPage = 1;
const PAGE_SIZE = 15;
let invoicesPage = 1;
const INVOICES_PAGE_SIZE = 15;
let notificationsPage = 1;
let notificationsList = [];
const NOTIFICATIONS_PAGE_SIZE = 15;
let isSyncingPending = false;

// ─────────────────────────────────────────────────────
// XP / RANK SYSTEM
// ─────────────────────────────────────────────────────
const XP_RANKS = [
  { label: 'Beginner', badge: '🌱', min: 0, max: 50 },
  { label: 'Bronze', badge: '🥉', min: 50, max: 170 },
  { label: 'Silver', badge: '🥈', min: 170, max: 350 },
  { label: 'Gold', badge: '🥇', min: 350, max: 700 },
  { label: 'Platinum', badge: '💠', min: 700, max: 1800 },
  { label: 'Diamond', badge: '💎', min: 1800, max: 3200 },
  { label: 'Mythic', badge: '🌟', min: 3200, max: 7000 },
  { label: 'Legend', badge: '👑', min: 7000, max: 10000 },
];
const XP_KEY = () => `spendly_xp_${currentUser?.id || 'local'}`;
const XP_LASTMONTH_KEY = () => `spendly_xp_lastmonth_${currentUser?.id || 'local'}`;

function getXP() { return parseInt(localStorage.getItem(XP_KEY()) || '0'); }
function setXP(v) { localStorage.setItem(XP_KEY(), Math.max(0, v)); }

function addXP(amount, reason) {
  const prev = getXP();
  const next = Math.min(10000, prev + amount);
  setXP(next);
  const prevRank = getRankInfo(prev);
  const nextRank = getRankInfo(next);
  if (nextRank.label !== prevRank.label) {
    showToast(`🎉 Rank Up! You are now ${nextRank.badge} ${nextRank.label}!`);
  } else if (amount > 0) {
    showToast(`+${amount} XP · ${nextRank.badge} ${nextRank.label}`);
  }
  renderXPBar();
}

function getRankInfo(xp) {
  for (let i = XP_RANKS.length - 1; i >= 0; i--) {
    if (xp >= XP_RANKS[i].min) return XP_RANKS[i];
  }
  return XP_RANKS[0];
}

function renderXPBar() {
  const xp = getXP();
  const rank = getRankInfo(xp);
  const nextRank = XP_RANKS[XP_RANKS.indexOf(rank) + 1];
  const pct = nextRank
    ? Math.min(100, ((xp - rank.min) / (rank.max - rank.min)) * 100)
    : 100;

  const badge = document.getElementById('xp-rank-badge');
  const label = document.getElementById('xp-rank-label');
  const fill = document.getElementById('xp-bar-fill');
  const pts = document.getElementById('xp-points-label');
  const next = document.getElementById('xp-next-label');
  const need = document.getElementById('xp-needed-label');

  if (!badge) return;
  badge.textContent = rank.badge;
  label.textContent = rank.label;
  pts.textContent = `${xp.toLocaleString()} XP`;
  fill.style.width = `${pct}%`;
  if (nextRank) {
    next.textContent = `Next: ${nextRank.badge} ${nextRank.label}`;
    need.textContent = `${(rank.max - xp).toLocaleString()} XP to go`;
  } else {
    next.textContent = '👑 Max Rank Achieved!';
    need.textContent = `${xp.toLocaleString()} XP`;
  }
}

function checkMonthEndXPBonus() {
  // Award bonus XP at month-end based on budget status
  const key = XP_LASTMONTH_KEY();
  const lastKey = monthKey(viewYear, viewMonth);
  const done = localStorage.getItem(key);
  if (done === lastKey) return; // already awarded this month

  const now = new Date();
  if (now.getDate() !== 1) return; // only runs on 1st of each month

  // Check previous month spending
  const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevKey = monthKey(prev.getFullYear(), prev.getMonth());
  const budget = appData.budgets[prevKey] || 0;
  if (!budget) return;
  const spent = appData.transactions
    .filter(t => t.monthKey === prevKey && t.type === 'expense')
    .reduce((s, t) => s + t.amount, 0);
  const pct = budget > 0 ? spent / budget : 0;

  let bonus = 0;
  let msg = '';
  if (pct >= 1) { bonus = -50; msg = '⚠️ Over budget! -50 XP'; }
  else if (pct >= 0.8) { bonus = 10; msg = '🟠 Orange zone: +10 XP'; }
  else { bonus = 100; msg = '🟢 Green zone: +100 XP bonus!'; }

  const prev2 = getXP();
  setXP(prev2 + bonus);
  localStorage.setItem(key, lastKey);
  setTimeout(() => showToast(`Month-end: ${msg}`), 2000);
  renderXPBar();
}

let viewYear = new Date().getFullYear();
let viewMonth = new Date().getMonth();
let selectedType = 'expense';
let selectedCat = 'Food';
let filterCategory = 'all';
let filterTimeScope = 'month';
let activeStatsTab = 'overview';
let activeStatsCatTab = 'expense';
let debtType = 'owe';
let charts = { donut: null, bar: null, line: null, compare: null };
let currentEventId = null;
let editingEventId = null;
let editingEventItemId = null;

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// Settings (UI preferences only — theme is stored locally, data is in Supabase)
function getLocalSettings() {
  try {
    const theme = localStorage.getItem('spendly_theme') || 'dark';
    return { ...localSettings, theme };
  } catch (e) { return localSettings; }
}
function saveLocalSettings(s) {
  try {
    if (s.theme) localStorage.setItem('spendly_theme', s.theme);
  } catch (e) { /* ignore */ }
}

// ─────────────────────────────────────────────────────
// HIDE AMOUNTS TOGGLE
// ─────────────────────────────────────────────────────
const HIDE_KEY = 'spendly_hide_amounts';
let isAmountsHidden = (() => {
  try { return localStorage.getItem(HIDE_KEY) === 'true'; } catch (e) { return false; }
})();

const EYE_OPEN_SVG = `<svg fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24" width="14" height="14"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
const EYE_CLOSED_SVG = `<svg fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24" width="14" height="14"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`;

function toggleHideAmounts(e) {
  if (e) e.stopPropagation();
  isAmountsHidden = !isAmountsHidden;
  try { localStorage.setItem(HIDE_KEY, isAmountsHidden); } catch (err) { }
  applyHideAmountsUI();
}


// ─────────────────────────────────────────────────────
// BUG 3 FIX: IMPROVED SAVINGS DISPLAY FOR MOBILE
// ─────────────────────────────────────────────────────
function initSavingsResponsiveFix() {
  const style = document.createElement('style');
  style.textContent = `
    @media (max-width: 768px) {
      .savings-hero-num {
        font-size: clamp(18px, 6vw, 32px) !important;
        letter-spacing: 0px;
        word-break: break-word;
        overflow: visible !important;
        text-overflow: unset !important;
        white-space: normal !important;
      }
      
      .savings-hero-amount {
        flex-wrap: wrap;
        gap: 2px;
      }
      
      .savings-hero-currency {
        font-size: 16px !important;
      }
    }
    
    @media (max-width: 480px) {
      .savings-hero-num {
        font-size: clamp(16px, 5vw, 24px) !important;
      }
      
      .savings-hero-currency {
        font-size: 14px !important;
      }
    }
  `;
  document.head.appendChild(style);
}

function applyHideAmountsUI() {
  const MASK = '••••••';
  const eyeIcons = document.querySelectorAll('.eye-toggle-icon');
  eyeIcons.forEach(icon => { icon.innerHTML = isAmountsHidden ? EYE_CLOSED_SVG : EYE_OPEN_SVG; });

  // Budget remaining hero
  const heroAmt = document.getElementById('remaining-amt');
  const heroCur = document.getElementById('hero-currency');
  if (heroAmt) {

    // Save the real value only once
    if (!heroAmt.dataset.real || heroAmt.dataset.real === MASK) {
      heroAmt.dataset.real = heroAmt.textContent;
    }

    if (heroCur) {
      heroCur.style.visibility = isAmountsHidden ? "hidden" : "visible";
    }

    heroAmt.textContent = isAmountsHidden
      ? MASK
      : heroAmt.dataset.real;
  }

  // Savings hero - IMPROVED FOR MOBILE
  const savAmt = document.getElementById('savings-hero-total');
  const savCur = document.getElementById('savings-hero-currency');
  if (savAmt) {
    if (!savAmt.dataset.real || savAmt.dataset.real === MASK) {
      savAmt.dataset.real = savAmt.textContent;
    }
    if (savCur) {
      savCur.style.visibility = isAmountsHidden ? "hidden" : "visible";
    }

    const displayValue = isAmountsHidden ? MASK : savAmt.dataset.real;
    savAmt.textContent = displayValue;

    // Ensure text doesn't overflow on mobile
    if (displayValue !== MASK && displayValue.length > 10) {
      savAmt.style.fontSize = 'clamp(16px, 5vw, 32px)';
    }
  }
}


// ─────────────────────────────────────────────────────
// CURRENCY — dynamic detection
// ─────────────────────────────────────────────────────
function detectCurrency() {
  const saved = localSettings.currency;
  if (saved && saved !== '₹') return saved; // user overrode
  try {
    const locale = navigator.language || 'en-IN';
    const fmt = new Intl.NumberFormat(locale, { style: 'currency', currency: getCurrencyCode(locale), minimumFractionDigits: 0 });
    const parts = fmt.formatToParts(0);
    const sym = parts.find(p => p.type === 'currency');
    return sym ? sym.value : '₹';
  } catch (e) { return '₹'; }
}
function getCurrencyCode(locale) {
  const map = {
    'en-IN': 'INR', 'hi': 'INR', 'en-US': 'USD', 'en-GB': 'GBP', 'en-AU': 'AUD',
    'de': 'EUR', 'fr': 'EUR', 'es': 'EUR', 'it': 'EUR', 'ja': 'JPY', 'zh': 'CNY',
    'ko': 'KRW', 'pt-BR': 'BRL', 'en-SG': 'SGD', 'en-AE': 'AED', 'en-CA': 'CAD',
  };
  return map[locale] || map[locale.split('-')[0]] || 'INR';
}
function getCurrencySymbol() { return localSettings.currency || detectCurrency(); }

// ─────────────────────────────────────────────────────
// FORMATTERS
// ─────────────────────────────────────────────────────
function monthKey(y, m) { return `${y}-${String(m + 1).padStart(2, '0')}`; }
function currentKey() { return monthKey(viewYear, viewMonth); }
function getMonthLabel() { return `${MONTHS[viewMonth]} ${viewYear}`; }
function getResetMonthLabel() { return `${MONTHS[viewMonth + 1]} ${viewYear}`; }

function updateMonthLabels() {
  const l = getMonthLabel();
  ['nav-month-label', 'nav-month-label-2', 'nav-month-label-3'].forEach(id => {
    const e = document.getElementById(id); if (e) e.textContent = l;
  });
}

function fmt(n) {
  const sym = getCurrencySymbol();
  // Do not abbreviate or round numbers with decimal parts
  if (n % 1 !== 0) {
    return sym + Number(n).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }
  if (n >= 100000) {
    const v = n / 100000;
    return sym + Number(v.toFixed(3)) + 'L';
  }
  if (n >= 1000) {
    const v = n / 1000;
    return sym + Number(v.toFixed(3)) + 'K';
  }
  return sym + Number(n).toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
}
function fmtFull(n) {
  return getCurrencySymbol() + Number(n).toLocaleString('en-IN', {
    minimumFractionDigits: n % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2
  });
}

// Format with a specific event-scoped currency symbol (not profile currency)
function fmtEvent(n, sym) {
  if (!sym) sym = getCurrencySymbol();
  if (n % 1 !== 0) {
    return sym + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  if (n >= 100000) return sym + Number((n / 100000).toFixed(3)) + 'L';
  if (n >= 1000) return sym + Number((n / 1000).toFixed(3)) + 'K';
  return sym + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2); }
function parseDate(str) {
  if (!str) return new Date();
  return new Date(str.includes('T') ? str : str + 'T12:00');
}

function getWeekdayOccurrencesInMonth(datetimeStr, year, month) {
  const d = parseDate(datetimeStr);
  const targetDay = d.getDay(); // 0 (Sunday) to 6 (Saturday)

  let count = 0;
  const numDays = new Date(year, month + 1, 0).getDate();
  for (let date = 1; date <= numDays; date++) {
    const day = new Date(year, month, date).getDay();
    if (day === targetDay) {
      count++;
    }
  }
  return count;
}

function getTxMonthAmount(tx, year, month) {
  if (tx.recur === 'weekly') {
    const count = getWeekdayOccurrencesInMonth(tx.datetime, year, month);
    return tx.amount * count;
  }
  return tx.amount;
}

function hashPin(p) {
  let h = 0; for (let i = 0; i < p.length; i++) { h = ((h << 5) - h) + p.charCodeAt(i); h |= 0; } return h.toString(36);
}

// ─────────────────────────────────────────────────────
// SYNC INDICATOR
// ─────────────────────────────────────────────────────
function setSyncing(state) { // 'syncing' | 'error' | 'ok'
  const el = document.getElementById('sync-indicator');
  if (!el) return;
  el.className = 'sync-indicator' + (state === 'ok' ? '' : ' ' + state);
}

// ─────────────────────────────────────────────────────
// THEME
// ─────────────────────────────────────────────────────
function applyTheme(t) {
  // Set both data-theme attribute AND html element class
  document.documentElement.setAttribute('data-theme', t);
  document.documentElement.classList.toggle('dark-mode', t === 'dark');
  document.documentElement.classList.toggle('light-mode', t === 'light');

  // Force CSS variable update
  document.documentElement.style.colorScheme = t;

  // Update meta theme color
  const metaTheme = document.getElementById('theme-meta');
  if (metaTheme) {
    metaTheme.setAttribute('content', t === 'light' ? '#f0f4f8' : '#0a0f1e');
  }

  // Store in localStorage to persist
  try {
    localStorage.setItem('spendly_theme', t);
  } catch (e) { }

  // Trigger any theme-dependent elements to re-render
  setTimeout(() => {
    document.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme: t } }));
  }, 0);
}
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme') || localStorage.getItem('spendly_theme') || 'dark';
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

  applyTheme(newTheme);

  // Update localSettings object
  const s = getLocalSettings();
  s.theme = newTheme;
  saveLocalSettings(s);
  localSettings = s;

  showToast(newTheme === 'light' ? 'Light mode ☀️' : 'Dark mode 🌙');
}

// ─────────────────────────────────────────────────────
// PIN LOCK
// ─────────────────────────────────────────────────────
let pinBuffer = '';
let setupBuffer = '', setupStep = 0, setupFirst = '';

function checkLock() {
  const s = getLocalSettings();
  if (s.pinEnabled && s.pinHash) {
    document.getElementById('lock-screen').classList.add('show');
  }
}

function pinPress(d) {
  if (pinBuffer.length >= 4) return;
  pinBuffer += d;
  updatePinDots('pd', pinBuffer.length, false);
  if (pinBuffer.length === 4) setTimeout(checkPin, 100);
}
function pinDel() { pinBuffer = pinBuffer.slice(0, -1); updatePinDots('pd', pinBuffer.length, false); }
function checkPin() {
  const s = getLocalSettings();
  if (hashPin(pinBuffer) === s.pinHash) {
    document.getElementById('lock-screen').classList.remove('show');
    pinBuffer = ''; updatePinDots('pd', 0, false);
  } else {
    updatePinDots('pd', 4, true);
    document.getElementById('pin-error').textContent = 'Incorrect PIN';
    setTimeout(() => {
      pinBuffer = ''; updatePinDots('pd', 0, false);
      document.getElementById('pin-error').textContent = '';
    }, 1000);
  }
}
function updatePinDots(prefix, count, error) {
  for (let i = 0; i < 4; i++) {
    const el = document.getElementById(prefix + i); if (!el) return;
    el.classList.toggle('filled', i < count);
    el.classList.toggle('error', error && i < count);
  }
}
function openPinSetup() {
  const s = getLocalSettings();
  setupBuffer = ''; setupStep = 0; setupFirst = '';
  updatePinDots('spd', 0, false);
  document.getElementById('pin-setup-error').textContent = '';
  document.getElementById('pin-modal-title').textContent = s.pinEnabled ? 'Change / Remove PIN' : 'Set PIN Lock';
  document.getElementById('pin-modal-sub').textContent = 'Choose a 4-digit PIN';
  document.getElementById('disable-pin-btn').style.display = s.pinEnabled ? 'block' : 'none';
  openModal('modal-pin');
}
function setupPinPress(d) {
  if (setupBuffer.length >= 4) return;
  setupBuffer += d; updatePinDots('spd', setupBuffer.length, false);
  if (setupBuffer.length === 4) setTimeout(processSetupPin, 100);
}
function setupPinDel() { setupBuffer = setupBuffer.slice(0, -1); updatePinDots('spd', setupBuffer.length, false); }
function processSetupPin() {
  if (setupStep === 0) {
    setupFirst = setupBuffer; setupBuffer = ''; setupStep = 1;
    updatePinDots('spd', 0, false);
    document.getElementById('pin-modal-sub').textContent = 'Confirm your PIN';
  } else {
    if (setupBuffer === setupFirst) {
      const s = getLocalSettings(); s.pinEnabled = true; s.pinHash = hashPin(setupBuffer);
      saveLocalSettings(s); localSettings = s;
      closeModal('modal-pin'); resetSetupPin(); renderProfile(); showToast('PIN lock enabled 🔒');
    } else {
      updatePinDots('spd', 4, true);
      document.getElementById('pin-setup-error').textContent = "PINs don't match";
      setTimeout(() => { setupBuffer = ''; setupStep = 0; setupFirst = ''; updatePinDots('spd', 0, false); document.getElementById('pin-setup-error').textContent = ''; document.getElementById('pin-modal-sub').textContent = 'Choose a 4-digit PIN'; }, 1000);
    }
  }
}
function disablePin() {
  if (!confirm('Disable PIN lock?')) return;
  const s = getLocalSettings(); s.pinEnabled = false; s.pinHash = ''; saveLocalSettings(s); localSettings = s;
  closeModal('modal-pin'); resetSetupPin(); renderProfile(); showToast('PIN lock disabled');
}
function resetSetupPin() { setupBuffer = ''; setupStep = 0; setupFirst = ''; updatePinDots('spd', 0, false); }

// ─────────────────────────────────────────────────────
// AUTH SCREEN
// ─────────────────────────────────────────────────────
let authMode = 'signin'; // 'signin' | 'signup'

function showAuthScreen() {
  document.getElementById('auth-screen').classList.add('show');
  const btn = document.getElementById('auth-btn');
  if (btn) {
    btn.disabled = false;
    btn.textContent = authMode === 'signup' ? 'Create Account' : 'Sign In';
  }
}
function hideAuthScreen() {
  document.getElementById('auth-screen').classList.remove('show');
}
function setAuthTab(mode) {
  authMode = mode;
  const isForgot = mode === 'forgot';

  document.getElementById('auth-tab-signin').className = 'auth-tab' + (mode === 'signin' ? ' active' : '');
  document.getElementById('auth-tab-signup').className = 'auth-tab' + (mode === 'signup' ? ' active' : '');
  document.getElementById('auth-tabs-container').style.display = isForgot ? 'none' : 'flex';
  document.getElementById('auth-back-link').style.display = isForgot ? 'block' : 'none';

  document.getElementById('auth-name-wrap').style.display = mode === 'signup' ? 'block' : 'none';
  document.getElementById('auth-password-wrap').style.display = isForgot ? 'none' : 'block';
  document.getElementById('auth-forgot-link').style.display = mode === 'signin' ? 'block' : 'none';

  const btn = document.getElementById('auth-btn');
  if (btn) {
    btn.disabled = false;
    btn.textContent = isForgot ? 'Send Reset Link' : mode === 'signup' ? 'Create Account' : 'Sign In';
  }
  document.getElementById('auth-title').textContent = isForgot ? 'Reset Password' : mode === 'signup' ? 'Create account' : 'Welcome back';
  document.getElementById('auth-sub').textContent = isForgot ? 'Enter your email to receive a reset link' : mode === 'signup' ? 'Start tracking your money' : 'Sign in to your Spendly account';
  document.getElementById('auth-error').textContent = '';
}

async function handleAuth() {
  const email = document.getElementById('auth-email').value.trim();
  const password = document.getElementById('auth-password').value;
  const name = document.getElementById('auth-name').value.trim();
  const btn = document.getElementById('auth-btn');
  const errEl = document.getElementById('auth-error');

  if (authMode === 'forgot') {
    if (!email) { errEl.textContent = 'Enter your email address'; return; }
    btn.disabled = true;
    btn.textContent = 'Sending...';
    errEl.textContent = '';
    try {
      await dbResetPassword(email);
      showToast('Reset email sent! ✉️');
      errEl.style.color = 'var(--green)';
      errEl.textContent = 'A reset link has been sent to your email address.';
      setTimeout(() => {
        errEl.style.color = '';
        setAuthTab('signin');
      }, 5000);
    } catch (e) {
      errEl.textContent = e.message;
      btn.disabled = false;
      btn.textContent = 'Send Reset Link';
    }
    return;
  }

  if (!email || !password) { errEl.textContent = 'Enter email and password'; return; }
  if (authMode === 'signup' && password.length < 6) { errEl.textContent = 'Password must be at least 6 characters'; return; }

  btn.disabled = true;
  btn.textContent = authMode === 'signup' ? 'Creating...' : 'Signing in...';
  errEl.textContent = '';

  try {
    if (authMode === 'signup') {
      await dbSignUp(email, password, name);
      btn.disabled = false;
      btn.textContent = 'Create Account';
      showToast('Account successfully created! Please sign in. 🎉');
      setAuthTab('signin');
      // Clear password field for safety
      document.getElementById('auth-password').value = '';
      return;
    } else {
      let loginEmail = email.trim();
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginEmail);
      if (!isEmail) {
        const fetchedEmail = await dbGetEmailByUsername(loginEmail);
        if (!fetchedEmail) {
          throw new Error('Username not found. Please sign in with your email address.');
        }
        loginEmail = fetchedEmail;
      }
      await dbSignIn(loginEmail, password);
    }
    // Re-enable and reset button text in case they log out later
    btn.disabled = false;
    btn.textContent = authMode === 'signup' ? 'Create Account' : 'Sign In';
  } catch (e) {
    errEl.textContent = friendlyAuthError(e.message);
    btn.disabled = false;
    btn.textContent = authMode === 'signup' ? 'Create Account' : 'Sign In';
  }
}

function friendlyAuthError(msg) {
  if (msg.includes('Invalid login')) return 'Incorrect email or password';
  if (msg.includes('Email not confirmed')) return 'Check your email to confirm signup';
  if (msg.includes('already registered')) return 'Account already exists — sign in instead';
  if (msg.includes('Password should')) return 'Password must be at least 6 characters';
  return msg;
}

async function signOut() {
  if (!confirm('Sign out of Spendly?')) return;
  await dbSignOut();
  currentUser = null;
  appData = { transactions: [], budgets: {}, catBudgets: {}, debts: [], profile: {} };
  showAuthScreen();
  navigate('home');
  showToast('Signed out');
}

async function clearAllTransactions() {
  if (!confirm('⚠️ Delete ALL transactions?\n\nThis will permanently delete your entire transaction history. Your budgets, category limits, debts, and profile settings will be kept.')) return;
  if (!confirm('Are you absolutely sure? This cannot be undone.')) return;

  // ── Snapshot for 30-day recovery ──
  try {
    const snap = { ts: Date.now(), transactions: JSON.parse(JSON.stringify(appData.transactions)) };
    localStorage.setItem(`spendly_trash_${currentUser.id}`, JSON.stringify(snap));
  } catch (e) { console.warn('Could not save recovery snapshot', e); }

  setSyncing('syncing');
  try {
    await dbClearAllTransactions(currentUser.id);
    setSyncing('ok');
    appData.transactions = [];
    renderHome();
    const active = document.querySelector('.screen.active');
    if (active && active.id === 'screen-transactions') renderTransactions();
    if (active && active.id === 'screen-stats') renderStats();
    showToast('All transactions deleted 🗑️');
  } catch (e) {
    setSyncing('error');
    showToast('Failed to delete transactions: ' + e.message);
  }
}

async function recoverTransactions() {
  try {
    const raw = localStorage.getItem(`spendly_trash_${currentUser.id}`);
    if (!raw) { showToast('No recovery snapshot found'); return; }
    const snap = JSON.parse(raw);
    const ageMs = Date.now() - snap.ts;
    if (ageMs > 30 * 24 * 60 * 60 * 1000) {
      localStorage.removeItem(`spendly_trash_${currentUser.id}`);
      showToast('Recovery window expired (30 days)');
      return;
    }
    if (!snap.transactions || !snap.transactions.length) { showToast('Snapshot is empty'); return; }

    if (!confirm(`Restore ${snap.transactions.length} deleted transaction${snap.transactions.length > 1 ? 's' : ''}?`)) return;

    setSyncing('syncing');
    try {
      await dbBulkInsertTransactions(currentUser.id, snap.transactions);
      setSyncing('ok');

      // Merge back into in-memory state (avoid duplicates by id)
      const existingIds = new Set(appData.transactions.map(t => t.id));
      snap.transactions.forEach(t => { if (!existingIds.has(t.id)) appData.transactions.push(t); });

      // Clear the snapshot so it can't be restored twice
      localStorage.removeItem(`spendly_trash_${currentUser.id}`);

      renderHome();
      renderTransactions();
      showToast(`✅ ${snap.transactions.length} transaction${snap.transactions.length > 1 ? 's' : ''} recovered!`);
    } catch (e) {
      setSyncing('error');
      showToast('Recovery failed: ' + e.message);
    }
  } catch (e) {
    console.error(e);
    showToast('Recovery failed');
  }
}

async function clearAllData() {
  if (!confirm('⚠️ Clear ALL data?\n\nThis will permanently delete all your transactions, budgets, and debts.\n\nYour profile settings will be kept.')) return;
  if (!confirm('Are you absolutely sure? This cannot be undone.')) return;
  setSyncing('syncing');
  try {
    await dbClearAllData(currentUser.id);
    setSyncing('ok');
    // Reset in-memory state (keep profile)
    const profile = appData.profile;
    appData = { transactions: [], budgets: {}, catBudgets: {}, debts: [], profile };
    navigate('home');
    renderProfile();
    showToast('All data cleared 🗑️');
  } catch (e) {
    setSyncing('error');
    showToast('Failed to clear data: ' + e.message);
  }
}

// ─────────────────────────────────────────────────────
// LOAD DATA
// ─────────────────────────────────────────────────────
async function loadAllData(userId) {
  setSyncing('syncing');
  try {
    const { transactions, budgets, catBudgets, debts, profile } = await dbLoadAll(userId);

    // Normalise DB row → app format
    appData.transactions = transactions.map(t => ({
      id: t.id,
      type: t.type,
      amount: Number(t.amount),
      description: t.description,
      category: t.category,
      notes: t.notes,
      recur: t.recur,
      recurParent: t.recur_parent || t.recurParent,
      monthKey: t.month_key || t.monthKey,
      datetime: t.datetime,
    }));
    appData.budgets = budgets;
    appData.catBudgets = catBudgets;
    appData.debts = debts.map(d => ({
      id: d.id, type: d.type, person: d.person,
      amount: Number(d.amount), note: d.note,
      settled: d.settled, date: d.date,
    }));
    appData.profile = profile || {};
    if (currentUser?.email && appData.profile.email !== currentUser.email) {
      appData.profile.email = currentUser.email;
      dbSaveProfile(userId, appData.profile).catch(console.error);
    }
    checkAndGenerateUsername();
    dbUpdateLastActive(userId);

    saveAppDataLocally();

    setSyncing('ok');
    setTimeout(() => setSyncing('ok'), 2000);
    setTimeout(() => { renderXPBar(); checkMonthEndXPBonus(); }, 500);

    updateNotifBellCount();
    syncPendingTransactions();
  } catch (e) {
    console.error('Load error', e);
    if (loadAppDataLocally()) {
      setSyncing('error');
      showToast('Offline mode: loaded cached data');
      renderHome();
      const active = document.querySelector('.screen.active');
      if (active && active.id === 'screen-transactions') renderTransactions();
      if (active && active.id === 'screen-stats') renderStats();
      updateNotifBellCount();
    } else {
      setSyncing('error');
      showToast('Failed to load data. Please check connection.');
    }
  }
}

// ─────────────────────────────────────────────────────
// NAVIGATE
// ─────────────────────────────────────────────────────
const _screenHistory = ['home'];

function navigate(screen) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('screen-' + screen).classList.add('active');
  const n = document.getElementById('nav-' + screen); if (n) n.classList.add('active');
  document.getElementById('screen-' + screen).scrollTop = 0;
  if (screen === 'home') renderHome();
  if (screen === 'transactions') { transactionsPage = 1; renderTransactions(); }
  if (screen === 'stats') renderStats();
  if (screen === 'debts') renderDebts();
  if (screen === 'profile') renderProfile();
  if (screen === 'bill-splitter') renderBillSplitter();
  if (screen === 'savings') renderSavingsScreen();
  if (screen === 'invoices') renderInvoicesScreen();
  // Track for Android back
  if (_screenHistory[_screenHistory.length - 1] !== screen) {
    _screenHistory.push(screen);
    history.pushState({ screen }, '');
  }
}

function focusSearch() {
  navigate('transactions');
  setTimeout(() => {
    const input = document.getElementById('search-input');
    if (input) {
      input.focus();
    }
  }, 150);
}

function handleEnter(e, nextId) {
  if (e.key !== 'Enter') return;
  e.preventDefault();
  if (nextId) { const el = document.getElementById(nextId); if (el) el.focus(); }
  else submitTransaction();
}

// ─────────────────────────────────────────────────────
// HOME
// ─────────────────────────────────────────────────────
function getMonthTx() {
  const curKey = currentKey();
  const viewEnd = new Date(viewYear, viewMonth + 1, 0, 23, 59, 59);

  return appData.transactions.filter(t => {
    if (t.monthKey === curKey) return true;

    if (t.recur === 'weekly') {
      const start = parseDate(t.datetime);
      if (start <= viewEnd) return true;
    }
    return false;
  });
}

function renderHome() {
  const txs = getMonthTx();
  const budget = appData.budgets[currentKey()] || 0;
  const spent = txs.filter(t => t.type === 'expense').reduce((s, t) => s + getTxMonthAmount(t, viewYear, viewMonth), 0);
  const income = txs.filter(t => t.type === 'income').reduce((s, t) => s + getTxMonthAmount(t, viewYear, viewMonth), 0);

  const currencySymbol = getCurrencySymbol();
  document.getElementById('hero-currency').textContent = currencySymbol;

  const heroLabel = document.querySelector('.hero-card .hero-label');
  const heroNum = document.getElementById('remaining-amt');
  const heroSub = document.getElementById('hero-sub');
  const fill = document.getElementById('progress-fill');

  const statLabels = document.querySelectorAll('.hero-card .hero-stat-label');
  const statVals = document.querySelectorAll('.hero-card .hero-stat-val');

  const remaining = budget - spent;
  const truePct = budget > 0 ? (spent / budget) * 100 : 0;
  const pct = Math.min(truePct, 100);

  let formattedRemaining = '';
  if (budget > 0) {
    formattedRemaining = Math.abs(remaining).toLocaleString('en-IN', {
      minimumFractionDigits: remaining % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2
    });
    if (remaining < 0) {
      heroSub.textContent = '⚠️ Over budget by ' + fmt(Math.abs(remaining));
      heroNum.style.color = 'var(--red)';
    } else {
      heroSub.textContent = fmt(spent) + ' spent · ' + fmt(remaining) + ' left';
      heroNum.style.color = 'var(--hero-text)';
    }
  } else {
    formattedRemaining = remaining.toLocaleString('en-IN', {
      minimumFractionDigits: remaining % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2
    });
    heroSub.textContent = 'No budget set for this month';
    heroNum.style.color = remaining < 0 ? 'var(--red)' : 'var(--hero-text)';
  }
  heroNum.textContent = formattedRemaining;
  heroNum.setAttribute('data-real', formattedRemaining);

  fill.style.width = pct + '%';
  fill.className = 'progress-fill' + (truePct >= 100 ? ' over' : truePct >= 80 ? ' warn' : '');

  statLabels[0].textContent = 'Budget';
  statVals[0].textContent = fmt(budget);
  statVals[0].className = 'hero-stat-val accent';

  statLabels[1].textContent = 'Spent';
  statVals[1].textContent = fmt(spent);
  statVals[1].className = 'hero-stat-val red';

  const today = new Date();
  // Days remaining in standard calendar month (including today)
  const daysInCurrentMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const daysLeft = daysInCurrentMonth - today.getDate() + 1;
  const isCurrentMonth = (viewYear === today.getFullYear() && viewMonth === today.getMonth());
  const pill = document.getElementById('daily-limit-pill');
  if (pill) pill.style.display = 'none'; // pill replaced by Income stat

  // 3rd stat — always show total income for the month
  statLabels[2].textContent = 'Savings';
  statVals[2].textContent = fmt(income);
  statVals[2].className = 'hero-stat-val green';


  const banner = document.getElementById('budget-banner');
  if (budget > 0 && remaining < 0) {
    banner.classList.add('show');
    document.getElementById('budget-banner-text').textContent = 'Over budget — spent ' + fmt(Math.abs(remaining)) + ' extra';
  } else if (budget > 0 && pct >= 80) {
    banner.classList.add('show');
    document.getElementById('budget-banner-text').textContent = Math.round(pct) + '% used · ' + fmt(remaining) + ' remaining';
  } else {
    banner.classList.remove('show');
  }

  renderSummaryBanner();
  renderStreak();
  renderCatBudgetHome(txs);
  renderAISummarySection();

  const recent = [...txs].sort((a, b) => parseDate(b.datetime) - parseDate(a.datetime)).slice(0, 5);
  document.getElementById('recent-list').innerHTML = recent.length === 0
    ? `<div class="empty-state"><div class="empty-icon">💸</div><div class="empty-title">No transactions yet</div><div class="empty-sub">Tap + to add your first expense</div></div>`
    : recent.map(t => txHTML(t, false)).join('');

  // Apply hidden preference to new values
  applyHideAmountsUI();
}

function renderSummaryBanner() {
  const now = new Date(), day = now.getDate();
  if (day > 5) { document.getElementById('summary-banner').classList.remove('show'); return; }
  const pm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const pmKey = monthKey(pm.getFullYear(), pm.getMonth());
  const s = getLocalSettings();
  if (s.summaryDismissed === pmKey) { document.getElementById('summary-banner').classList.remove('show'); return; }
  const pmTxs = appData.transactions.filter(t => t.monthKey === pmKey && t.type === 'expense');
  if (!pmTxs.length) { document.getElementById('summary-banner').classList.remove('show'); return; }
  const pmSpent = pmTxs.reduce((s, t) => s + t.amount, 0);
  const pmBudget = appData.budgets[pmKey] || 0;
  const catTot = {};
  pmTxs.forEach(t => { catTot[t.category] = (catTot[t.category] || 0) + t.amount; });
  const topCat = Object.entries(catTot).sort((a, b) => b[1] - a[1])[0];
  document.getElementById('sb-spent').textContent = fmt(pmSpent);
  document.getElementById('sb-top-cat').textContent = topCat ? `${CATEGORIES.find(c => c.id === topCat[0])?.icon || ''} ${topCat[0]}` : '—';
  document.getElementById('sb-vs-budget').textContent = pmBudget > 0 ? (pmSpent <= pmBudget ? '✅ Under budget' : '⚠️ Over budget') : 'No budget set';
  document.getElementById('summary-banner').classList.add('show');
}

function dismissSummaryBanner() {
  const now = new Date(), pm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const s = getLocalSettings();
  s.summaryDismissed = monthKey(pm.getFullYear(), pm.getMonth());
  saveLocalSettings(s);
  document.getElementById('summary-banner').classList.remove('show');
}

function renderStreak() {
  let streak = 0;
  const now = new Date();
  for (let i = 1; i <= 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const k = monthKey(d.getFullYear(), d.getMonth());
    const budget = appData.budgets[k] || 0;
    if (!budget) break;
    const spent = appData.transactions.filter(t => t.monthKey === k && t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    if (spent <= budget) streak++; else break;
  }
  const card = document.getElementById('streak-card');
  if (streak >= 2) {
    card.style.display = 'flex';
    document.getElementById('streak-emoji').textContent = streak >= 6 ? '🏆' : streak >= 3 ? '🔥' : '⭐';
    document.getElementById('streak-title').textContent = streak + ' month streak!';
    document.getElementById('streak-sub').textContent = 'Under budget ' + streak + ' months in a row';
  } else { card.style.display = 'none'; }
}

function closeAISummary() {
  document.getElementById('ai-summary-section').style.display = 'none';

  const card = document.querySelector('.ai-summary-card');
  if (card) card.classList.remove('has-summary');
}

function renderCatBudgetHome(txs) {
  const cb = (appData.catBudgets || {})[currentKey()] || {};
  const has = Object.keys(cb).length > 0;
  document.getElementById('cat-budget-home').style.display = has ? 'block' : 'none';
  if (!has) return;
  const spent = {};
  txs.filter(t => t.type === 'expense').forEach(t => { spent[t.category] = (spent[t.category] || 0) + t.amount; });
  document.getElementById('cat-budget-home-list').innerHTML =
    Object.entries(cb).slice(0, 4).map(([cat, limit]) => {
      const s = spent[cat] || 0, pct = Math.min((s / limit) * 100, 100);
      const c = CATEGORIES.find(x => x.id === cat) || { icon: '📌', color: '#8896b3' };
      const rawPct = (s / limit) * 100;
      const isOver = rawPct >= 100;
      const isWarn = !isOver && rawPct >= 80;
      const barColor = isOver ? 'var(--red)' : isWarn ? '#ed8936' : c.color;
      const amtColor = isOver ? 'var(--red)' : isWarn ? 'var(--amber)' : 'var(--text)';
      return `<div class="cat-budget-row">
        <div class="cat-budget-icon">${c.icon}</div>
        <div class="cat-budget-info">
          <div class="cat-budget-name">${cat}</div>
          <div class="cat-budget-progress"><div class="cat-budget-bar" style="width:${pct}%;background:${barColor}"></div></div>
        </div>
        <div class="cat-budget-right">
          <div class="cat-budget-amt" style="color:${amtColor}">${fmt(s)}</div>
          <div class="cat-budget-limit">of ${fmt(limit)}</div>
        </div>
      </div>`;
    }).join('');
}

// ─────────────────────────────────────────────────────
// AI SUMMARY
// ─────────────────────────────────────────────────────

let aiSummaryOpen = false;

function renderAISummarySection() {
  const now = new Date(),
    daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const today = now.getDate(),
    isCurrentMonth =
      viewYear === now.getFullYear() && viewMonth === now.getMonth();

  const txs = getMonthTx();
  const hasData = txs.filter((t) => t.type === "expense").length > 0;

  const show = hasData && (!isCurrentMonth || today >= daysInMonth - 1);

  const section = document.getElementById("ai-summary-section");

  // ONLY auto-hide if user hasn't opened it manually
  if (section && !aiSummaryOpen) {
    if (!aiSummaryOpen) {
      section.style.display = show ? 'block' : 'none';
    }
  }

  // Reset expanded state when switching months
  aiSummaryExpanded = false;

  const summaryBody = document.getElementById("ai-summary-body");
  if (summaryBody) {
    summaryBody.style.display = "block";
  }
}

function generateLocalSummary(txs, totalSpent, budget) {
  const catTotals = {};
  txs.forEach((t) => {
    catTotals[t.category] = (catTotals[t.category] || 0) + t.amount;
  });

  const sorted = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);

  let summary = `For this month, you have spent a total of ${fmtFull(
    totalSpent
  )}. `;

  if (budget > 0) {
    const diff = budget - totalSpent;
    summary +=
      diff >= 0
        ? `You are currently under your budget by ${fmtFull(diff)}.`
        : `You have exceeded your monthly budget by ${fmtFull(
          Math.abs(diff)
        )}! Try to scale back.`;
  } else {
    summary += `Consider setting a monthly budget to track your spending limits.`;
  }

  if (sorted.length > 0) {
    const [topCat, topAmt] = sorted[0];
    const pct = Math.round((topAmt / totalSpent) * 100);
    summary += ` Your top spending category is <strong>${topCat}</strong>, accounting for ${fmtFull(
      topAmt
    )} (${pct}% of your total spending).`;
  }

  summary += ` Tip: Review your transactions regularly to identify areas where you can save.`;

  return summary;
}

async function generateAISummary() {
  const txs = getMonthTx().filter((t) => t.type === "expense");

  if (!txs.length) {
    showToast("No expenses to summarise");
    return;
  }

  aiSummaryOpen = true;

  const btn = document.getElementById("ai-generate-btn");
  const body = document.getElementById("ai-summary-body");

  if (btn) {
    btn.style.display = aiSummaryOpen ? 'none' : 'flex';
  }

  const section = document.getElementById("ai-summary-section");
  if (section) section.style.display = "block";

  const card = document.querySelector(".ai-summary-card");
  if (card) card.classList.add("has-summary");

  body.innerHTML =
    '<div class="ai-loading"><div class="ai-dot"></div><div class="ai-dot"></div><div class="ai-dot"></div><span>Analysing your spending…</span></div>';

  const totalSpent = txs.reduce((s, t) => s + t.amount, 0);
  const budget = appData.budgets[currentKey()] || 0;

  // Local fallback if no Gemini key is provided
  if (!GEMINI_KEY || GEMINI_KEY.trim() === "") {
    const text = generateLocalSummary(txs, totalSpent, budget);

    const s = getLocalSettings();
    s["aiSummary_" + currentKey()] = text;
    saveLocalSettings(s);

    body.innerHTML = text;
    btn.style.display = "none";

    return;
  }

  const catTotals = {};
  txs.forEach((t) => {
    catTotals[t.category] = (catTotals[t.category] || 0) + t.amount;
  });

  const catSummary = Object.entries(catTotals)
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => `${k}: ${fmtFull(v)}`)
    .join(", ");

  const merchantTotals = {};
  txs.forEach((t) => {
    const m = t.description || t.category;
    merchantTotals[m] = (merchantTotals[m] || 0) + t.amount;
  });

  const topMerchants = Object.entries(merchantTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([k, v]) => `${k} (${fmtFull(v)})`)
    .join(", ");

  const prompt = `You are a friendly personal finance advisor. Analyse this spending data for ${MONTHS_FULL[viewMonth]} ${viewYear} and give a warm, concise summary (3-4 sentences max). Be specific, use the actual numbers, and give one actionable tip.

Total spent: ${fmtFull(totalSpent)}
Monthly budget: ${budget > 0 ? fmtFull(budget) : "not set"}
Budget status: ${budget > 0
      ? totalSpent <= budget
        ? "under budget by " + fmtFull(budget - totalSpent)
        : "over budget by " + fmtFull(totalSpent - budget)
      : "no budget set"
    }
Spending by category: ${catSummary}
Top merchants/payees: ${topMerchants}
Total transactions: ${txs.length}

Write in plain conversational text, no markdown, no bullet points.`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            maxOutputTokens: 300,
            temperature: 0.7,
          },
        }),
      }
    );

    const data = await response.json();
    const text =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Could not generate summary.";

    const s = getLocalSettings();
    s["aiSummary_" + currentKey()] = text;
    saveLocalSettings(s);

    body.innerHTML = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

    btn.style.display = "none";
    aiSummaryOpen = true;
  } catch (e) {
    console.warn(
      "Gemini API call failed, generating local summary fallback",
      e
    );

    const text = generateLocalSummary(txs, totalSpent, budget);

    body.innerHTML =
      text +
      `<br><small style="color:var(--text3);margin-top:6px;display:block">⚠️ Offline local summary (Gemini unavailable)</small>`;

    btn.style.display = "none";
    aiSummaryOpen = true;
  }
}

function loadCachedAISummary() {
  const s = getLocalSettings();
  const cached = s["aiSummary_" + currentKey()];

  const body = document.getElementById("ai-summary-body");
  const btn = document.getElementById("ai-generate-btn");

  if (cached) {
    body.innerHTML = cached.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

    btn.style.display = "none";
    aiSummaryOpen = true;
  } else {
    body.innerHTML = "";

    btn.style.display = "flex";
    aiSummaryOpen = false;
  }
}

// ─────────────────────────────────────────────────────
// TX HTML + SWIPE
// ─────────────────────────────────────────────────────
function txHTML(tx, showSwipe = true) {
  const cat = (tx.type === 'income' ? INCOME_CATEGORIES.find(c => c.id === tx.category) : CATEGORIES.find(c => c.id === tx.category)) || { icon: '📌', color: '#8896b3' };
  const hasTime = tx.datetime && tx.datetime.includes('T');
  const d = parseDate(tx.datetime);
  const ds = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  const ts = hasTime ? d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : '';
  const timeStr = ts ? `, ${ts}` : '';
  const note = tx.notes ? ` · ${tx.notes}` : '';
  const recur = tx.recur && tx.recur !== 'none' ? `<span class="tx-recur-badge">🔄 ${tx.recur}</span>` : '';

  const isWeekly = tx.recur === 'weekly';
  const totalAmt = getTxMonthAmount(tx, viewYear, viewMonth);
  const amountStr = isWeekly
    ? `${tx.type === 'expense' ? '-' : '+'}${fmt(tx.amount)}<span style="font-size:10px;font-weight:400;color:var(--text3)">/wk (total ${tx.type === 'expense' ? '-' : '+'}${fmt(totalAmt)})</span>`
    : `${tx.type === 'expense' ? '-' : '+'}${fmt(tx.amount)}`;

  const inner = `
    <div class="tx-item" data-id="${tx.id}" onclick="showDetail('${tx.id}')">
      <div class="tx-icon" style="background:${cat.color}22;color:${cat.color}">${cat.icon}</div>
      <div class="tx-info">
        <div class="tx-desc">${tx.description || tx.category}</div>
        <div class="tx-meta">${tx.category} · ${ds}${timeStr}${note}</div>
      </div>
      <div class="tx-right">
        <div class="tx-amount ${tx.type}">${amountStr}</div>
        <div style="display:flex;align-items:center;justify-content:flex-end;gap:6px;margin-top:4px">
          ${recur}
          <div class="tx-delete-icon" onclick="event.stopPropagation(); deleteTxDirect('${tx.id}')" title="Delete transaction" style="color:var(--red);opacity:.45;padding:4px;margin-right:-4px;border-radius:6px;transition:opacity .15s,background .15s;display:flex;align-items:center;justify-content:center">
            <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="13" height="13"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
          </div>
        </div>
      </div>
    </div>`;
  if (!showSwipe) return inner;
  return `<div class="tx-wrap" data-id="${tx.id}">
    <div class="tx-delete-bg">
      <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
      Delete
    </div>
    ${inner}
  </div>`;
}

async function deleteTxDirect(id) {
  const tx = appData.transactions.find(t => t.id === id);
  if (!tx || !confirm(`Delete "${tx.description || tx.category}"?`)) return;

  setSyncing('syncing');
  try {
    await dbDeleteTransaction(currentUser.id, id);
    setSyncing('ok');
    appData.transactions = appData.transactions.filter(t => t.id !== id);
    showToast('Transaction deleted');
    const a = document.querySelector('.screen.active');
    if (a && a.id === 'screen-home') renderHome();
    if (a && a.id === 'screen-transactions') renderTransactions();
  } catch (e) {
    setSyncing('error');
    showToast('Failed to delete transaction: ' + e.message);
  }
}

function initSwipe(container) {
  container.querySelectorAll('.tx-wrap').forEach(wrap => {
    const item = wrap.querySelector('.tx-item');
    let startX = 0, startY = 0, swiping = false, activated = false;
    item.addEventListener('touchstart', e => { startX = e.touches[0].clientX; startY = e.touches[0].clientY; swiping = false; activated = false; }, { passive: true });
    item.addEventListener('touchmove', e => {
      const dx = e.touches[0].clientX - startX, dy = e.touches[0].clientY - startY;
      if (!swiping && Math.abs(dy) > Math.abs(dx)) return;
      swiping = true;
      const cur = Math.min(0, dx);
      if (cur < -10) e.preventDefault();
      item.style.transform = `translateX(${cur}px)`;
      activated = cur < -60;
    }, { passive: false });
    item.addEventListener('touchend', () => {
      if (activated) { item.style.transform = 'translateX(-80px)'; setTimeout(() => { if (confirm('Delete this transaction?')) { deleteTransaction(wrap.dataset.id); } else { item.style.transform = ''; } }, 100); }
      else { item.style.transform = ''; }
    }, { passive: true });
  });
}

// ─────────────────────────────────────────────────────
// TRANSACTIONS SCREEN
// ─────────────────────────────────────────────────────
function renderTransactions() {
  const search = (document.getElementById('search-input')?.value || '').toLowerCase().trim();
  const dataset = filterTimeScope === 'all' ? [...appData.transactions] : getMonthTx();
  let txs = [...dataset].sort((a, b) => parseDate(b.datetime) - parseDate(a.datetime));

  const labelEl = document.getElementById('nav-month-label-2');
  if (labelEl) {
    labelEl.textContent = filterTimeScope === 'all' ? 'All Time' : getMonthLabel();
  }

  // Rebuild chips
  const usedCats = [...new Set(dataset.map(t => t.category))];
  const hasRecur = dataset.some(t => t.recur && t.recur !== 'none');

  if (filterCategory !== 'all' && filterCategory !== 'expense' && filterCategory !== 'income' && filterCategory !== 'recurring' && !usedCats.includes(filterCategory)) {
    filterCategory = 'all';
  }

  if (filterCategory === 'expense') txs = txs.filter(t => t.type === 'expense');
  else if (filterCategory === 'income') txs = txs.filter(t => t.type === 'income');
  else if (filterCategory === 'recurring') txs = txs.filter(t => t.recur && t.recur !== 'none');
  else if (filterCategory !== 'all') txs = txs.filter(t => t.category === filterCategory);

  if (search) txs = txs.filter(t => (t.description || '').toLowerCase().includes(search) || (t.category || '').toLowerCase().includes(search) || (t.notes || '').toLowerCase().includes(search) || String(t.amount).includes(search));

  const catChips = [...CATEGORIES, ...INCOME_CATEGORIES].filter(c => usedCats.includes(c.id)).map(c =>
    `<div class="cat-chip ${filterCategory === c.id ? 'active' : ''}" onclick="filterCat(this,'${c.id}')">${c.icon} ${c.id}</div>`).join('');
  document.getElementById('filter-chips').innerHTML = `
    <div class="cat-chip ${filterCategory === 'all' ? 'active' : ''}" onclick="filterCat(this,'all')">📋 All</div>
    <div class="cat-chip ${filterCategory === 'expense' ? 'active' : ''}" onclick="filterCat(this,'expense')">📤 Expenses</div>
    <div class="cat-chip ${filterCategory === 'income' ? 'active' : ''}" onclick="filterCat(this,'income')">💰 Income</div>
    ${hasRecur ? `<div class="cat-chip ${filterCategory === 'recurring' ? 'active' : ''}" onclick="filterCat(this,'recurring')">🔄 Recurring</div>` : ''}
    ${catChips}`;

  const container = document.getElementById('all-tx-list');
  if (!txs.length) {
    // Check for a recoverable snapshot within 30 days
    let recoverBanner = '';
    try {
      const raw = localStorage.getItem(`spendly_trash_${currentUser.id}`);
      if (raw) {
        const snap = JSON.parse(raw);
        const ageMs = Date.now() - snap.ts;
        const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
        if (ageMs < THIRTY_DAYS && snap.transactions && snap.transactions.length > 0) {
          const daysLeft = Math.ceil((THIRTY_DAYS - ageMs) / (24 * 60 * 60 * 1000));
          recoverBanner = `
            <div style="margin:16px;background:var(--accent-dim);border:1px solid var(--accent);border-radius:14px;padding:14px 16px;display:flex;align-items:center;justify-content:space-between;gap:12px">
              <div>
                <div style="font-size:13px;font-weight:600;color:var(--accent)">🔄 Recover Deleted Transactions</div>
                <div style="font-size:11px;color:var(--text2);margin-top:3px">${snap.transactions.length} transaction${snap.transactions.length > 1 ? 's' : ''} · expires in ${daysLeft} day${daysLeft > 1 ? 's' : ''}</div>
              </div>
              <button onclick="recoverTransactions()" style="background:var(--accent);color:#0a0f1e;border:none;border-radius:10px;padding:8px 14px;font-size:12px;font-weight:700;cursor:pointer;white-space:nowrap;touch-action:manipulation">Recover</button>
            </div>`;
        }
      }
    } catch (e) { console.warn(e); }
    container.innerHTML = recoverBanner + `<div class="empty-state"><div class="empty-icon">🔍</div><div class="empty-title">No transactions</div><div class="empty-sub">${search ? 'No results for "' + search + '"' : 'Nothing matches this filter'}</div></div>`;
    return;
  }
  const paginatedTxs = txs.slice(0, transactionsPage * PAGE_SIZE);
  const groups = {};
  paginatedTxs.forEach(tx => {
    const k = parseDate(tx.datetime).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
    if (!groups[k]) groups[k] = []; groups[k].push(tx);
  });
  let html = Object.entries(groups).map(([date, items]) => {
    const dayTotal = items.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    return `<div style="display:flex;justify-content:space-between;align-items:center;padding:12px 16px 6px"><span style="font-size:10px;font-weight:600;letter-spacing:.07em;text-transform:uppercase;color:var(--text3)">${date}</span><span style="font-size:11px;font-family:var(--mono);color:var(--text3)">${dayTotal > 0 ? '-' + fmt(dayTotal) : ''}</span></div><div style="padding:0 16px"><div class="tx-list">${items.map(t => txHTML(t, true)).join('')}</div></div>`;
  }).join('');

  if (transactionsPage * PAGE_SIZE < txs.length) {
    html += `
      <div style="padding: 16px; text-align: center;">
        <button onclick="loadMoreTransactions()" style="background:var(--surface2);color:var(--text);border:1px solid var(--border);border-radius:10px;padding:8px 24px;font-size:13px;font-weight:600;cursor:pointer;touch-action:manipulation">Load More</button>
      </div>`;
  }
  container.innerHTML = html;
  setTimeout(() => initSwipe(container), 50);
}

function loadMoreTransactions() {
  transactionsPage++;
  renderTransactions();
}

function filterCat(el, cat) { transactionsPage = 1; filterCategory = cat; renderTransactions(); }

// ─────────────────────────────────────────────────────
// STATS
// ─────────────────────────────────────────────────────
function setStatsTab(el, tab) {
  document.querySelectorAll('.stats-tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active'); activeStatsTab = tab;
  ['overview', 'categories', 'merchants', 'daily', 'compare'].forEach(id => document.getElementById('stats-' + id).style.display = id === tab ? 'block' : 'none');
  renderStats();
}
function switchStatsCatTab(tab) {
  activeStatsCatTab = tab;
  const btnExpense = document.getElementById('stats-cat-toggle-expense');
  const btnIncome = document.getElementById('stats-cat-toggle-income');
  if (btnExpense && btnIncome) {
    if (tab === 'expense') {
      btnExpense.style.background = 'var(--accent)';
      btnExpense.style.color = '#0a0f1e';
      btnIncome.style.background = 'none';
      btnIncome.style.color = 'var(--text3)';
    } else {
      btnIncome.style.background = 'var(--accent)';
      btnIncome.style.color = '#0a0f1e';
      btnExpense.style.background = 'none';
      btnExpense.style.color = 'var(--text3)';
    }
  }
  renderStats();
}
function destroyChart(k) { if (charts[k]) { charts[k].destroy(); charts[k] = null; } }

function renderStats() {
  const txs = getMonthTx(), expenses = txs.filter(t => t.type === 'expense'), incomes = txs.filter(t => t.type === 'income');
  const totalSpent = expenses.reduce((s, t) => s + getTxMonthAmount(t, viewYear, viewMonth), 0), totalIncome = incomes.reduce((s, t) => s + getTxMonthAmount(t, viewYear, viewMonth), 0);
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const maxTx = expenses.reduce((m, t) => t.amount > m ? t.amount : m, 0);

  if (activeStatsTab === 'overview') {
    document.getElementById('s-spent').textContent = fmt(totalSpent);
    document.getElementById('s-income').textContent = fmt(totalIncome);
    document.getElementById('s-count').textContent = txs.length;
    document.getElementById('s-avg').textContent = fmt(totalSpent / daysInMonth);
    document.getElementById('s-max').textContent = fmt(maxTx);
    const budget = appData.budgets[monthKey(viewYear, viewMonth)] || 0;
    const remainingBudget = budget - totalSpent;
    document.getElementById('s-net').textContent = fmt(remainingBudget + totalIncome);
    const catTotals = {}; expenses.forEach(t => { catTotals[t.category] = (catTotals[t.category] || 0) + getTxMonthAmount(t, viewYear, viewMonth); });
    const topCat = Object.entries(catTotals).sort((a, b) => b[1] - a[1])[0];
    let insight = 'Add some transactions to see insights.';
    if (topCat) {
      const pct = Math.round((topCat[1] / totalSpent) * 100);
      insight = `Biggest spend: <strong>${topCat[0]}</strong> at ${fmt(topCat[1])} (${pct}%). `;
      if (totalIncome > 0) { const sv = totalIncome - totalSpent; insight += sv >= 0 ? `Saving <strong>${fmt(sv)}</strong> this month 🎉` : `Over income by <strong>${fmt(Math.abs(sv))}</strong>.` }
    }
    document.getElementById('insight-text').innerHTML = insight;
    const sorted = Object.entries(catTotals).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]);
    destroyChart('donut');
    if (sorted.length > 0) { charts.donut = new Chart(document.getElementById('donut-chart').getContext('2d'), { type: 'doughnut', data: { labels: sorted.map(([k]) => k), datasets: [{ data: sorted.map(([, v]) => v), backgroundColor: sorted.map(([k]) => CATEGORIES.find(c => c.id === k)?.color || '#8896b3'), borderWidth: 0, spacing: 2 }] }, options: { responsive: true, maintainAspectRatio: false, cutout: '68%', plugins: { legend: { position: 'bottom', labels: { color: 'var(--text2)', font: { size: 10 }, padding: 8, boxWidth: 8 } }, tooltip: { callbacks: { label: c => ` ${c.label}: ${fmt(c.raw)}` } } } } }); }
  }
  if (activeStatsTab === 'categories') {
    const isIncome = activeStatsCatTab === 'income';
    const targetTxs = isIncome ? incomes : expenses;
    const catList = isIncome ? INCOME_CATEGORIES : CATEGORIES;
    const totalAmt = isIncome ? totalIncome : totalSpent;
    const catTotals = {};
    targetTxs.forEach(t => { catTotals[t.category] = (catTotals[t.category] || 0) + getTxMonthAmount(t, viewYear, viewMonth); });
    const sorted = Object.entries(catTotals).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]);
    const maxAmt = sorted[0]?.[1] || 1, cb = (appData.catBudgets || {})[currentKey()] || {};
    document.getElementById('cat-bars').innerHTML = sorted.map(([id, amt]) => {
      const cat = catList.find(c => c.id === id) || { icon: '📌', color: '#8896b3' };
      const pct = totalAmt > 0 ? Math.round((amt / totalAmt) * 100) : 0;
      const limit = !isIncome ? cb[id] : null;
      const limitStr = limit ? `<span class="cat-budget-left">${amt <= limit ? fmt(limit - amt) + ' left' : 'over by ' + fmt(amt - limit)}</span>` : '';
      return `<div class="cat-bar-row"><div class="cat-bar-header"><div class="cat-bar-name">${cat.icon} ${id}</div><div class="cat-bar-right">${limitStr}<div class="cat-bar-pct">${pct}%</div><div class="cat-bar-amt">${fmt(amt)}</div></div></div><div class="cat-bar-track"><div class="cat-bar-fill" style="width:${(amt / maxAmt) * 100}%;background:${limit && amt > limit ? 'var(--red)' : cat.color}"></div></div></div>`;
    }).join('') || `<div class="empty-state"><div class="empty-icon">📊</div><div class="empty-title">No ${isIncome ? 'income' : 'expense'} data</div></div>`;
  }
  if (activeStatsTab === 'merchants') {
    const mt = {}; expenses.forEach(t => { const m = (t.description || t.category).trim(); mt[m] = mt[m] || { total: 0, count: 0 }; mt[m].total += getTxMonthAmount(t, viewYear, viewMonth); mt[m].count++; });
    const sorted = Object.entries(mt).sort((a, b) => b[1].total - a[1].total).slice(0, 10);
    document.getElementById('merchant-list').innerHTML = sorted.length === 0
      ? '<div class="empty-state"><div class="empty-icon">🏪</div><div class="empty-title">No data yet</div></div>'
      : sorted.map(([name, { total, count }], i) => `<div class="merchant-item"><div><div class="merchant-name">${i + 1}. ${name}</div><div class="merchant-meta">${count} transaction${count > 1 ? 's' : ''}</div></div><div class="merchant-amt">${fmt(total)}</div></div>`).join('');
  }
  if (activeStatsTab === 'daily') {
    const dt = {}; for (let i = 1; i <= daysInMonth; i++)dt[i] = 0;
    expenses.forEach(t => {
      if (t.recur === 'weekly') {
        const weekday = parseDate(t.datetime).getDay();
        for (let date = 1; date <= daysInMonth; date++) {
          if (new Date(viewYear, viewMonth, date).getDay() === weekday) {
            dt[date] = (dt[date] || 0) + t.amount;
          }
        }
      } else {
        const d = parseDate(t.datetime).getDate();
        dt[d] = (dt[d] || 0) + t.amount;
      }
    });
    const days = Object.keys(dt).map(Number), vals = Object.values(dt);
    destroyChart('bar');
    charts.bar = new Chart(document.getElementById('bar-chart').getContext('2d'), { type: 'bar', data: { labels: days, datasets: [{ data: vals, backgroundColor: 'rgba(79,209,197,.3)', borderColor: 'rgba(79,209,197,.8)', borderWidth: 1, borderRadius: 3 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => ` ${fmt(c.raw)}` } } }, scales: { x: { ticks: { color: 'var(--text3)', font: { size: 9 } }, grid: { display: false } }, y: { ticks: { color: 'var(--text3)', font: { size: 9 }, callback: v => fmt(v) }, grid: { color: 'var(--border)' } } } } });
    let cum = 0; const cumVals = vals.map(v => { cum += v; return cum; });
    destroyChart('line');
    charts.line = new Chart(document.getElementById('line-chart').getContext('2d'), { type: 'line', data: { labels: days, datasets: [{ data: cumVals, borderColor: '#4fd1c5', backgroundColor: 'rgba(79,209,197,.07)', borderWidth: 2, pointRadius: 0, fill: true, tension: .4 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => ` ${fmt(c.raw)}` } } }, scales: { x: { ticks: { color: 'var(--text3)', font: { size: 9 } }, grid: { display: false } }, y: { ticks: { color: 'var(--text3)', font: { size: 9 }, callback: v => fmt(v) }, grid: { color: 'var(--border)' } } } } });
  }
  if (activeStatsTab === 'compare') {
    const m6 = []; for (let i = 5; i >= 0; i--) { const d = new Date(viewYear, viewMonth - i, 1); m6.push({ y: d.getFullYear(), m: d.getMonth(), label: MONTHS[d.getMonth()] + "'" + (d.getFullYear().toString().slice(2)) }); }

    const getMonthAmountForComparison = (t, year, month) => {
      const key = monthKey(year, month);
      if (t.monthKey === key && t.recur !== 'weekly') {
        return t.amount;
      }
      if (t.recur === 'weekly') {
        const start = parseDate(t.datetime);
        const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59);
        if (start <= endOfMonth) {
          return getTxMonthAmount(t, year, month);
        }
      }
      return 0;
    };

    const spentA = m6.map(({ y, m }) => appData.transactions.filter(t => t.type === 'expense').reduce((s, t) => s + getMonthAmountForComparison(t, y, m), 0));
    const incA = m6.map(({ y, m }) => appData.transactions.filter(t => t.type === 'income').reduce((s, t) => s + getMonthAmountForComparison(t, y, m), 0));
    const budA = m6.map(({ y, m }) => appData.budgets[monthKey(y, m)] || 0);
    destroyChart('compare');
    charts.compare = new Chart(document.getElementById('compare-chart').getContext('2d'), { type: 'bar', data: { labels: m6.map(x => x.label), datasets: [{ label: 'Spent', data: spentA, backgroundColor: 'rgba(252,129,129,.65)', borderRadius: 4 }, { label: 'Income', data: incA, backgroundColor: 'rgba(104,211,145,.55)', borderRadius: 4 }, { label: 'Budget', data: budA, backgroundColor: 'rgba(79,209,197,.25)', borderRadius: 4 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: 'var(--text2)', font: { size: 10 }, boxWidth: 10, padding: 10 } }, tooltip: { callbacks: { label: c => ` ${c.dataset.label}: ${fmt(c.raw)}` } } }, scales: { x: { ticks: { color: 'var(--text3)', font: { size: 10 } }, grid: { display: false } }, y: { ticks: { color: 'var(--text3)', font: { size: 9 }, callback: v => fmt(v) }, grid: { color: 'var(--border)' } } } } });
    const rows = m6.map(({ label }, i) => { const net = incA[i] - spentA[i], nc = net >= 0 ? 'var(--green)' : 'var(--red)'; return `<tr><td style="color:var(--text2)">${label}</td><td style="color:var(--red)">${spentA[i] > 0 ? fmt(spentA[i]) : '-'}</td><td style="color:var(--green)">${incA[i] > 0 ? fmt(incA[i]) : '-'}</td><td style="color:${nc}">${(incA[i] + spentA[i]) > 0 ? fmt(net) : '-'}</td></tr>`; }).join('');
    document.getElementById('compare-table-wrap').innerHTML = `<table class="compare-table"><thead><tr><th>Month</th><th>Spent</th><th>Income</th><th>Net</th></tr></thead><tbody>${rows}</tbody></table>`;
  }
}

// ─────────────────────────────────────────────────────
// DEBTS
// ─────────────────────────────────────────────────────
function renderDebts() {
  const debts = appData.debts || [];
  const totalOwe = debts.filter(d => d.type === 'owe' && !d.settled).reduce((s, d) => s + d.amount, 0);
  const totalLent = debts.filter(d => d.type === 'lent' && !d.settled).reduce((s, d) => s + d.amount, 0);
  document.getElementById('debt-total-owe').textContent = fmt(totalOwe);
  document.getElementById('debt-total-lent').textContent = fmt(totalLent);
  const list = document.getElementById('debt-list');
  const active = debts.filter(d => !d.settled), settled = debts.filter(d => d.settled);
  if (!debts.length) { list.innerHTML = '<div class="empty-state"><div class="empty-icon">🤝</div><div class="empty-title">No debts tracked</div><div class="empty-sub">Tap + to add who owes who</div></div>'; return; }
  const renderDebt = d => `<div class="debt-item" onclick="showDebtDetail('${d.id}')" style="opacity:${d.settled ? .5 : 1}">
    <div class="debt-avatar" style="background:${d.type === 'owe' ? 'var(--red-dim)' : 'var(--green-dim)'};color:${d.type === 'owe' ? 'var(--red)' : 'var(--green)'}">${(d.person || '?')[0].toUpperCase()}</div>
    <div class="debt-info"><div class="debt-name">${d.person}${d.settled ? ' <span style="font-size:10px;color:var(--text3)">(settled)</span>' : ''}</div><div class="debt-note">${d.note || ''}</div></div>
    <div style="text-align:right"><div class="debt-amount ${d.type}">${d.type === 'owe' ? '-' : '+'}${fmt(d.amount)}</div><div class="debt-badge ${d.type}" style="margin-top:3px;display:inline-block">${d.type === 'owe' ? 'I owe' : 'Lent'}</div></div>
  </div>`;
  list.innerHTML = active.map(renderDebt).join('') + (settled.length ? `<div style="font-size:10px;text-transform:uppercase;letter-spacing:.07em;color:var(--text3);padding:12px 0 6px">Settled</div>${settled.map(renderDebt).join('')}` : '');
}

function openAddDebt() {
  setDebtType('owe');
  ['debt-person', 'debt-amount', 'debt-note'].forEach(id => document.getElementById(id).value = '');
  openModal('modal-debt');
  setTimeout(() => document.getElementById('debt-person').focus(), 350);
}
function setDebtType(t) {
  debtType = t;
  document.getElementById('debt-type-owe').className = 'type-btn' + (t === 'owe' ? ' active-expense' : '');
  document.getElementById('debt-type-lent').className = 'type-btn' + (t === 'lent' ? ' active-income' : '');
}
async function submitDebt() {
  const person = document.getElementById('debt-person').value.trim();
  const amount = parseFloat(document.getElementById('debt-amount').value);
  const note = document.getElementById('debt-note').value.trim();
  if (!person) { showToast('Enter a name'); return; }
  if (!amount || amount <= 0) { showToast('Enter a valid amount'); return; }
  const debt = { id: uid(), type: debtType, person, amount, note, settled: false, date: new Date().toISOString() };
  setSyncing('syncing');
  try {
    await dbInsertDebt(currentUser.id, debt);
    appData.debts.unshift(debt);
    setSyncing('ok');
    closeModal('modal-debt'); renderDebts();
    showToast(debtType === 'owe' ? `You owe ${person} ${fmt(amount)}` : `${person} owes you ${fmt(amount)}`);
  } catch (e) {
    setSyncing('error');
    showToast('Failed to save debt: ' + e.message);
  }
}
function showDebtDetail(id) {
  const d = appData.debts.find(x => x.id === id); if (!d) return;
  document.getElementById('debt-detail-content').innerHTML = `
    <div style="text-align:center;padding:14px 0 20px">
      <div style="font-size:42px;margin-bottom:10px">${d.type === 'owe' ? '😬' : '💪'}</div>
      <div style="font-size:12px;color:var(--text3);margin-bottom:6px;text-transform:uppercase;letter-spacing:.07em">${d.type === 'owe' ? 'You Owe' : 'You Lent'}</div>
      <div style="font-size:30px;font-weight:600;font-family:var(--mono);color:${d.type === 'owe' ? 'var(--red)' : 'var(--green)'}">${d.type === 'owe' ? '-' : '+'}${fmtFull(d.amount)}</div>
      <div style="font-size:16px;font-weight:500;margin-top:8px">${d.person}</div>
      ${d.note ? `<div style="font-size:13px;color:var(--text3);margin-top:4px">${d.note}</div>` : ''}
      ${d.settled ? '<div style="margin-top:8px;font-size:12px;color:var(--green)">✅ Settled</div>' : ''}
    </div>
    ${!d.settled ? `<button class="submit-btn" style="background:var(--green-dim);color:var(--green);border:1px solid var(--green)" onclick="settleDebt('${d.id}')">✅ Mark as Settled</button><div style="height:8px"></div>` : ''}
    <button class="submit-btn danger" onclick="deleteDebt('${d.id}')">Delete</button>`;
  openModal('modal-debt-detail');
}
async function settleDebt(id) {
  setSyncing('syncing');
  try {
    await dbUpdateDebt(currentUser.id, id, { settled: true });
    const d = appData.debts.find(x => x.id === id); if (d) d.settled = true;
    setSyncing('ok'); closeModal('modal-debt-detail'); renderDebts(); showToast('Settled ✅');
    addXP(5, 'debt_settled');
  } catch (e) {
    setSyncing('error');
    showToast('Failed to settle debt: ' + e.message);
  }
}
async function deleteDebt(id) {
  setSyncing('syncing');
  try {
    await dbDeleteDebt(currentUser.id, id);
    appData.debts = appData.debts.filter(x => x.id !== id);
    setSyncing('ok'); closeModal('modal-debt-detail'); renderDebts(); showToast('Deleted');
  } catch (e) {
    setSyncing('error');
    showToast('Failed to delete debt: ' + e.message);
  }
}

// ─────────────────────────────────────────────────────
// PROFILE
// ─────────────────────────────────────────────────────
function renderProfile() {
  checkAndGenerateUsername();
  const p = appData.profile || {}, s = getLocalSettings();

  document.getElementById('profile-name-input').value = p.name || '';
  // Username field
  const unameInput = document.getElementById('profile-username-input');
  const unameBadge = document.getElementById('profile-username-badge');
  if (unameInput) {
    unameInput.value = p.username || '';
    if (p.username_locked) {
      unameInput.disabled = true;
      unameInput.style.opacity = '0.6';
      unameInput.style.cursor = 'not-allowed';
      const parent = unameInput.parentElement;
      if (parent) {
        let lockIcon = parent.querySelector('.username-lock-icon');
        if (!lockIcon) {
          lockIcon = document.createElement('span');
          lockIcon.className = 'username-lock-icon';
          lockIcon.innerHTML = '🔒';
          lockIcon.style.fontSize = '12px';
          lockIcon.style.marginRight = '4px';
          parent.insertBefore(lockIcon, unameInput);
        }
      }
    } else {
      unameInput.disabled = false;
      unameInput.style.opacity = '';
      unameInput.style.cursor = '';
      const parent = unameInput.parentElement;
      if (parent) {
        const lockIcon = parent.querySelector('.username-lock-icon');
        if (lockIcon) lockIcon.remove();
      }
    }
  }
  if (unameBadge) {
    if (p.username) {
      unameBadge.textContent = '@' + p.username;
      unameBadge.style.display = 'inline-block';
    } else {
      unameBadge.style.display = 'none';
    }
  }
  // Currency display — show flag + name
  const curSym = s.currency || detectCurrency();
  const curObj = CURRENCIES.find(c => c.symbol === curSym);
  const curLabel = curObj ? `${curObj.flag} ${curObj.name} (${curSym})` : curSym;
  document.getElementById('profile-currency-display').textContent = curLabel;
  document.getElementById('profile-display-name').textContent = p.name || currentUser?.email || 'My Account';
  document.getElementById('profile-email').textContent = currentUser?.email || '';
  const avatarTxt = document.getElementById('profile-avatar-txt');
  if (avatarTxt) {
    if (p.avatar) {
      avatarTxt.innerHTML = `<img src="${p.avatar}" alt="Avatar" style="width:100%;height:100%;object-fit:cover;border-radius:20px">`;
    } else {
      avatarTxt.textContent = p.name ? p.name[0].toUpperCase() : '💼';
    }
  }
  document.getElementById('profile-sub').textContent = `Budget resets on the 1st · ${getResetMonthLabel()}`;
  const activeDebts = (appData.debts || []).filter(d => !d.settled).length;
  document.getElementById('debt-tracker-val').textContent = activeDebts > 0 ? `${activeDebts} active debt${activeDebts > 1 ? 's' : ''}` : 'Track who owes who';
  const pinOn = s.pinEnabled;
  document.getElementById('pin-toggle').className = 'toggle' + (pinOn ? ' on' : '');
  document.getElementById('pin-status-label').textContent = pinOn ? 'Enabled' : 'Disabled';

  const cpEl = document.getElementById('settings-change-password-item');
  if (cpEl) cpEl.style.display = (typeof useLocalDB !== 'undefined' && useLocalDB) ? 'none' : 'flex';

  renderCatBudgetSettings();
  renderSavingsAccounts(); // updates profile button label
  renderXPBar();
}
// ─── AUTOMATIC SILENT USERNAME GENERATION ───
async function checkAndGenerateUsername() {
  if (!appData.profile || !currentUser?.email) return;

  const currentUsername = appData.profile.username;

  // Already has a generated/custom username
  if (
    currentUsername &&
    currentUsername !== currentUser.email &&
    !currentUsername.includes('@')
  ) {
    return;
  }

  try {
    let baseUsername = currentUser.email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (baseUsername.length < 3) baseUsername += '321';
    let finalUsername = baseUsername;

    // Check database for duplicates
    let attempts = 0;
    let isDuplicate = true;
    while (isDuplicate && attempts < 10) {
      const duplicate = await dbLookupByUsername(finalUsername);
      if (duplicate && duplicate.id !== currentUser.id) {
        finalUsername = `${baseUsername}${Math.floor(1000 + Math.random() * 9000)}`;
        attempts++;
      } else {
        isDuplicate = false;
      }
    }

    // Save quietly to database without locking
    await dbUpdateUsername(currentUser.id, finalUsername);

    // Update app memory & UI immediately (do NOT set username_locked to true for auto-gen)
    appData.profile.username = finalUsername;
    appData.profile.username_locked = false;
    renderProfile();
  } catch (e) {
    console.error("Auto-username error:", e);
  }
}


// ─────────────────────────────────────────────────────
// SAVINGS SCREEN
// ─────────────────────────────────────────────────────

const SAVINGS_ACCOUNT_ICONS = {
  bank: '🏦', savings: '💰', fd: '📈', rd: '🗓️',
  mutual_fund: '📊', ppf: '🏛️', crypto: '🪙', gold: '🥇', other: '📌'
};
const SAVINGS_ACCOUNT_LABELS = {
  bank: 'Bank Account', savings: 'Savings Account', fd: 'Fixed Deposit',
  rd: 'Recurring Deposit', mutual_fund: 'Mutual Fund', ppf: 'PPF / NPS',
  crypto: 'Crypto', gold: 'Gold / Jewellery', other: 'Other'
};

let savingsTxType = 'deposit';

function getSavingsData() {
  if (!appData.profile) appData.profile = {};
  if (!appData.profile.budgetMeta) appData.profile.budgetMeta = {};
  if (!appData.profile.budgetMeta.savingsAccounts) appData.profile.budgetMeta.savingsAccounts = [];
  if (!appData.profile.budgetMeta.savingsTxs) appData.profile.budgetMeta.savingsTxs = [];
  if (appData.profile.budgetMeta.inHandCash === undefined) appData.profile.budgetMeta.inHandCash = 0;
  return appData.profile.budgetMeta;
}

function renderSavingsScreen() {
  const data = getSavingsData();
  const curSym = getCurrencySymbol();
  const accounts = data.savingsAccounts || [];
  const txs = data.savingsTxs || [];
  const inHand = parseFloat(data.inHandCash) || 0;

  const accountsTotal = accounts.reduce((s, a) => {
    const parentBal = parseFloat(a.balance) || 0;
    const fdsBal = (a.fds || []).reduce((fs, f) => fs + (parseFloat(f.balance) || 0), 0);
    return s + parentBal + fdsBal;
  }, 0);
  const total = accountsTotal + inHand;

  // Hero
  document.getElementById('savings-hero-currency').textContent = curSym;
  const formattedTotal = total.toLocaleString('en-IN', {
    minimumFractionDigits: total % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2
  });
  const savTotalEl = document.getElementById('savings-hero-total');
  savTotalEl.textContent = formattedTotal;
  savTotalEl.setAttribute('data-real', formattedTotal);
  document.getElementById('savings-count').textContent = accounts.length;
  document.getElementById('savings-inhand-display').textContent = fmt(inHand);
  document.getElementById('savings-hero-sub').textContent =
    accounts.length > 0
      ? `${accounts.length} account${accounts.length > 1 ? 's' : ''} + cash in hand`
      : 'Add your accounts to get started';

  // Apply hidden preference to new values
  applyHideAmountsUI();

  // In-hand cash input
  const inHandInput = document.getElementById('savings-inhand-input');
  if (inHandInput) inHandInput.value = inHand > 0 ? inHand : '';

  // Accounts list
  const accList = document.getElementById('savings-accounts-list');
  if (accList) {
    if (accounts.length === 0) {
      accList.innerHTML = `<div style="text-align:center;padding:16px;color:var(--text3);font-size:12px;border:1px dashed var(--border2);border-radius:14px">No accounts yet. Tap + Add Account.</div>`;
    } else {
      accList.innerHTML = accounts.map((acc, i) => {
        const fds = (acc.fds || []);
        const isExpanded = expandedSavingsAccounts.has(i);
        const hasFds = fds.length > 0;

        const fdsHtml = fds.map((fd, fdIdx) => `
          <div class="savings-account-row fd-sub-row" style="margin-left: 20px; margin-top: 4px; background: rgba(79,209,197,0.03); border-color: rgba(79,209,197,0.15); padding: 10px 14px; display: flex; align-items: center; justify-content: space-between;">
            <div style="display:flex; align-items:center; gap:8px;">
              <div class="savings-account-icon" style="width:32px; height:32px; font-size:14px; display:flex; align-items:center; justify-content:center; background:var(--accent-dim); border-radius:8px;">📈</div>
              <div class="savings-account-info">
                <div class="savings-account-name" style="font-size:13px; font-weight:600;">${fd.name || 'Fixed Deposit'}</div>
                <div class="savings-account-type" style="font-size:10px;">Fixed Deposit</div>
              </div>
            </div>
            <div style="display:flex; align-items:center; gap:10px;">
              <div class="savings-account-balance" style="font-size:14px; font-weight:600; color: var(--accent);">${curSym}${(parseFloat(fd.balance) || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
              <div class="savings-account-actions" style="display: flex; gap: 4px;" onclick="event.stopPropagation();">
                <button class="savings-account-edit" onclick="openEditSavingsFDModal(${i}, ${fdIdx})" title="Edit FD" style="background:none; border:none; color:var(--text2); cursor:pointer; padding: 4px;">
                  <svg fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" width="14" height="14"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button class="savings-account-delete" onclick="deleteSavingsFD(${i}, ${fdIdx})" title="Delete FD" style="background:none; border:none; color:var(--text2); cursor:pointer; padding: 4px;">
                  <svg fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" width="14" height="14"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
                </button>
              </div>
            </div>
          </div>
        `).join('');

        const toggleHtml = hasFds ? `
          <span class="expand-icon" style="margin-left: 6px; font-size: 10px; color: var(--text3); transition: transform 0.2s; display: inline-block; transform: ${isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'}">
            ▼
          </span>
        ` : '';

        return `
          <div style="margin-bottom: 12px;">
            <div class="savings-account-row" style="margin-bottom: 0; cursor: ${hasFds ? 'pointer' : 'default'};" onclick="${hasFds ? `toggleAccountExpanded(${i})` : ''}">
              <div style="display:flex; align-items:center; gap:8px;">
                <div class="savings-account-icon">${SAVINGS_ACCOUNT_ICONS[acc.type] || '📌'}</div>
                <div class="savings-account-info">
                  <div class="savings-account-name" style="font-weight:600; display:flex; align-items:center;">${acc.name || 'Unnamed Account'}${toggleHtml}</div>
                  <div class="savings-account-type">${SAVINGS_ACCOUNT_LABELS[acc.type] || 'Account'}</div>
                </div>
              </div>
              <div style="display:flex; align-items:center; gap:10px;">
                <div class="savings-account-balance" style="font-weight:600;">${curSym}${(parseFloat(acc.balance) || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
                <div class="savings-account-actions" style="display: flex; gap: 4px;" onclick="event.stopPropagation();">
                  <button class="savings-account-edit" onclick="openEditSavingsAccountModal(${i})" title="Edit" style="background:none; border:none; color:var(--text2); cursor:pointer; padding: 4px;">
                    <svg fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" width="16" height="16"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                  <button class="savings-account-delete" onclick="deleteSavingsAccountById(${i})" title="Delete" style="background:none; border:none; color:var(--text2); cursor:pointer; padding: 4px;">
                    <svg fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" width="16" height="16"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
                  </button>
                </div>
              </div>
            </div>
            ${isExpanded ? fdsHtml : ''}
          </div>
        `;
      }).join('');
    }
  }

  // Transactions log
  const txList = document.getElementById('savings-transactions-list');
  if (txList) {
    if (txs.length === 0) {
      txList.innerHTML = `<div style="text-align:center;padding:16px;color:var(--text3);font-size:12px;border:1px dashed var(--border2);border-radius:14px">No entries yet. Tap + Add Entry.</div>`;
    } else {
      txList.innerHTML = [...txs].reverse().slice(0, 30).map(tx => {
        const sign = tx.type === 'deposit' ? '+' : '-';
        const d = new Date(tx.date);
        const dateStr = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
        const accName = accounts[tx.accountIdx]?.name || tx.accountName || 'Account';
        return `<div class="savings-tx-row">
          <div class="savings-tx-icon ${tx.type}">${tx.type === 'deposit' ? '💰' : '💸'}</div>
          <div class="savings-tx-info">
            <div class="savings-tx-name">${tx.note || (tx.type === 'deposit' ? 'Deposit' : 'Withdrawal')}</div>
            <div class="savings-tx-meta">${accName} · ${dateStr}</div>
          </div>
          <div class="savings-tx-amount ${tx.type}">${sign}${fmt(tx.amount)}</div>
        </div>`;
      }).join('');
    }
  }

  // Update profile button label
  const profileVal = document.getElementById('savings-profile-val');
  if (profileVal) {
    const totalFmt = fmt(total);
    profileVal.textContent = accounts.length > 0 ? `${totalFmt} across ${accounts.length} account${accounts.length > 1 ? 's' : ''}` : 'Manage your accounts & cash';
  }
  const homeSavingsVal = document.getElementById('home-savings-val');
  if (homeSavingsVal) {
    homeSavingsVal.textContent = fmt(total);
  }
}

let expandedSavingsAccounts = new Set();
let editingSavingsAccountIdx = null;
let editingFD = null; // { parentIdx, fdIdx }

function toggleAccountExpanded(idx) {
  if (expandedSavingsAccounts.has(idx)) {
    expandedSavingsAccounts.delete(idx);
  } else {
    expandedSavingsAccounts.add(idx);
  }
  renderSavingsScreen();
}

function openAddSavingsAccountModal() {
  editingSavingsAccountIdx = null;
  const titleEl = document.getElementById('savings-modal-title');
  if (titleEl) titleEl.textContent = 'Add Savings Account';

  document.getElementById('savings-acc-name-input').value = '';
  document.getElementById('savings-acc-balance-input').value = '';
  document.getElementById('savings-acc-type-input').value = 'bank';
  document.getElementById('savings-modal-currency').textContent = getCurrencySymbol();
  openModal('modal-savings-account');
  setTimeout(() => document.getElementById('savings-acc-name-input').focus(), 350);
}

function openEditSavingsAccountModal(idx) {
  const data = getSavingsData();
  const acc = data.savingsAccounts[idx];
  if (!acc) return;

  editingSavingsAccountIdx = idx;
  const titleEl = document.getElementById('savings-modal-title');
  if (titleEl) titleEl.textContent = 'Edit Savings Account';

  document.getElementById('savings-acc-name-input').value = acc.name || '';
  document.getElementById('savings-acc-balance-input').value = acc.balance || '';
  document.getElementById('savings-acc-type-input').value = acc.type || 'bank';
  document.getElementById('savings-modal-currency').textContent = getCurrencySymbol();
  openModal('modal-savings-account');
}

async function submitSavingsAccount() {
  const name = document.getElementById('savings-acc-name-input').value.trim();
  const balance = parseFloat(document.getElementById('savings-acc-balance-input').value) || 0;
  const type = document.getElementById('savings-acc-type-input').value;

  if (!name) { showToast('Please enter an account name'); return; }

  const data = getSavingsData();
  if (editingSavingsAccountIdx !== null) {
    const oldAcc = data.savingsAccounts[editingSavingsAccountIdx];
    data.savingsAccounts[editingSavingsAccountIdx] = {
      ...oldAcc,
      name,
      balance,
      type
    };
  } else {
    data.savingsAccounts.push({ name, balance, type, fds: [] });
  }

  setSyncing('syncing');
  try {
    await dbSaveProfile(currentUser.id, appData.profile);
    setSyncing('ok');
    closeModal('modal-savings-account');
    renderSavingsScreen();
    showToast(editingSavingsAccountIdx !== null ? `✓ Account "${name}" updated` : `✓ ${name} added`);
  } catch (e) {
    setSyncing('error');
    showToast('Failed to save: ' + e.message);
  }
}

async function deleteSavingsAccountById(index) {
  const data = getSavingsData();
  const acc = data.savingsAccounts[index];
  if (!acc) return;
  if (!confirm(`Delete "${acc.name}"? This cannot be undone.`)) return;
  data.savingsAccounts.splice(index, 1);
  setSyncing('syncing');
  try {
    await dbSaveProfile(currentUser.id, appData.profile);
    setSyncing('ok');
    renderSavingsScreen();
    showToast(`✓ Account removed`);
  } catch (e) {
    setSyncing('error');
    showToast('Failed: ' + e.message);
  }
}

function openAddSavingsFDModal() {
  editingFD = null;
  const titleEl = document.getElementById('savings-fd-modal-title');
  if (titleEl) titleEl.textContent = 'Add Fixed Deposit';

  const data = getSavingsData();
  const accounts = data.savingsAccounts || [];
  const parentSelect = document.getElementById('savings-fd-parent-select');

  // Filter for bank/savings account types
  const parentAccounts = accounts.map((acc, idx) => ({ acc, idx })).filter(item => item.acc.type === 'bank' || item.acc.type === 'savings');

  if (parentAccounts.length === 0) {
    showToast('Please add a Bank or Savings account first!');
    return;
  }

  parentSelect.innerHTML = parentAccounts.map(item => `
    <option value="${item.idx}">${SAVINGS_ACCOUNT_ICONS[item.acc.type] || '🏦'} ${item.acc.name}</option>
  `).join('');

  document.getElementById('savings-fd-name-input').value = '';
  document.getElementById('savings-fd-amount-input').value = '';
  document.getElementById('savings-fd-currency').textContent = getCurrencySymbol();
  openModal('modal-savings-fd');
  setTimeout(() => document.getElementById('savings-fd-name-input').focus(), 350);
}

function openEditSavingsFDModal(parentIdx, fdIdx) {
  const data = getSavingsData();
  const parentAcc = data.savingsAccounts[parentIdx];
  if (!parentAcc || !parentAcc.fds || !parentAcc.fds[fdIdx]) return;
  const fd = parentAcc.fds[fdIdx];

  editingFD = { parentIdx, fdIdx };

  const titleEl = document.getElementById('savings-fd-modal-title');
  if (titleEl) titleEl.textContent = 'Edit Fixed Deposit';

  const parentSelect = document.getElementById('savings-fd-parent-select');
  const accounts = data.savingsAccounts || [];
  const parentAccounts = accounts.map((acc, idx) => ({ acc, idx })).filter(item => item.acc.type === 'bank' || item.acc.type === 'savings');

  parentSelect.innerHTML = parentAccounts.map(item => `
    <option value="${item.idx}">${SAVINGS_ACCOUNT_ICONS[item.acc.type] || '🏦'} ${item.acc.name}</option>
  `).join('');
  parentSelect.value = parentIdx;

  document.getElementById('savings-fd-name-input').value = fd.name || '';
  document.getElementById('savings-fd-amount-input').value = fd.balance || '';
  document.getElementById('savings-fd-currency').textContent = getCurrencySymbol();
  openModal('modal-savings-fd');
  setTimeout(() => document.getElementById('savings-fd-name-input').focus(), 350);
}

async function submitSavingsFD() {
  const name = document.getElementById('savings-fd-name-input').value.trim();
  const balance = parseFloat(document.getElementById('savings-fd-amount-input').value) || 0;
  const parentIdx = parseInt(document.getElementById('savings-fd-parent-select').value);

  if (!name) { showToast('Please enter an FD name'); return; }
  if (balance <= 0) { showToast('Please enter a valid amount'); return; }

  const data = getSavingsData();
  const parentAcc = data.savingsAccounts[parentIdx];
  if (!parentAcc) { showToast('Parent account not found'); return; }

  if (editingFD !== null) {
    const oldParentAcc = data.savingsAccounts[editingFD.parentIdx];
    if (editingFD.parentIdx === parentIdx) {
      oldParentAcc.fds[editingFD.fdIdx] = { name, balance };
    } else {
      // Moved to different parent bank account
      oldParentAcc.fds.splice(editingFD.fdIdx, 1);
      if (!parentAcc.fds) parentAcc.fds = [];
      parentAcc.fds.push({ name, balance });
      // Keep it expanded
      expandedSavingsAccounts.add(parentIdx);
    }
  } else {
    if (!parentAcc.fds) parentAcc.fds = [];
    parentAcc.fds.push({ name, balance });
    // Expand to show the newly added FD
    expandedSavingsAccounts.add(parentIdx);
  }

  setSyncing('syncing');
  try {
    await dbSaveProfile(currentUser.id, appData.profile);
    setSyncing('ok');
    closeModal('modal-savings-fd');
    renderSavingsScreen();
    showToast(editingFD !== null ? `✓ FD "${name}" updated` : `✓ FD "${name}" added`);
  } catch (e) {
    setSyncing('error');
    showToast('Failed to save FD: ' + e.message);
  }
}

async function deleteSavingsFD(parentIdx, fdIdx) {
  const data = getSavingsData();
  const parentAcc = data.savingsAccounts[parentIdx];
  if (!parentAcc || !parentAcc.fds || !parentAcc.fds[fdIdx]) return;

  const fd = parentAcc.fds[fdIdx];
  if (!confirm(`Delete FD "${fd.name}"? This cannot be undone.`)) return;

  parentAcc.fds.splice(fdIdx, 1);

  setSyncing('syncing');
  try {
    await dbSaveProfile(currentUser.id, appData.profile);
    setSyncing('ok');
    renderSavingsScreen();
    showToast(`✓ FD removed`);
  } catch (e) {
    setSyncing('error');
    showToast('Failed: ' + e.message);
  }
}

async function saveInHandCash(val) {
  const n = parseFloat(val) || 0;
  const data = getSavingsData();
  data.inHandCash = n;
  setSyncing('syncing');
  try {
    await dbSaveProfile(currentUser.id, appData.profile);
    setSyncing('ok');
    renderSavingsScreen();
    showToast(`✓ Cash in hand: ${fmt(n)}`);
  } catch (e) {
    setSyncing('error');
    showToast('Failed: ' + e.message);
  }
}

function openAddSavingsTransactionModal() {
  const data = getSavingsData();
  const accounts = data.savingsAccounts || [];
  const select = document.getElementById('savings-tx-account-select');
  select.innerHTML = accounts.length > 0
    ? accounts.map((a, i) => `<option value="${i}">${SAVINGS_ACCOUNT_ICONS[a.type] || '📌'} ${a.name}</option>`).join('')
    : '<option value="">No accounts added yet</option>';
  document.getElementById('savings-tx-amount').value = '';
  document.getElementById('savings-tx-note').value = '';
  document.getElementById('savings-tx-currency').textContent = getCurrencySymbol();
  setSavingsTxType('deposit');
  openModal('modal-savings-tx');
  setTimeout(() => document.getElementById('savings-tx-amount').focus(), 350);
}

function setSavingsTxType(type) {
  savingsTxType = type;
  const depBtn = document.getElementById('savings-tx-type-deposit');
  const witBtn = document.getElementById('savings-tx-type-withdraw');
  if (type === 'deposit') {
    depBtn.className = 'submit-btn';
    witBtn.className = 'submit-btn secondary';
  } else {
    witBtn.className = 'submit-btn';
    depBtn.className = 'submit-btn secondary';
  }
}

async function submitSavingsTransaction() {
  const amount = parseFloat(document.getElementById('savings-tx-amount').value);
  const note = document.getElementById('savings-tx-note').value.trim();
  const accountIdx = parseInt(document.getElementById('savings-tx-account-select').value);
  const data = getSavingsData();

  if (!amount || amount <= 0) { showToast('Please enter a valid amount'); return; }
  if (data.savingsAccounts.length === 0) { showToast('Please add an account first'); return; }

  const acc = data.savingsAccounts[accountIdx];
  if (!acc) { showToast('Invalid account'); return; }

  // Update account balance
  const current = parseFloat(acc.balance) || 0;
  acc.balance = savingsTxType === 'deposit' ? current + amount : Math.max(0, current - amount);

  // Log transaction
  data.savingsTxs.push({
    type: savingsTxType,
    accountIdx,
    accountName: acc.name,
    amount,
    note,
    date: new Date().toISOString()
  });

  setSyncing('syncing');
  try {
    await dbSaveProfile(currentUser.id, appData.profile);
    setSyncing('ok');
    closeModal('modal-savings-tx');
    renderSavingsScreen();
    const sign = savingsTxType === 'deposit' ? '+' : '-';
    showToast(`✓ ${sign}${fmt(amount)} ${savingsTxType === 'deposit' ? 'deposited' : 'withdrawn'}`);
  } catch (e) {
    setSyncing('error');
    showToast('Failed: ' + e.message);
  }
}

// Legacy stubs kept so no breakage
function renderSavingsAccounts() { renderSavingsScreen(); }
function addSavingsAccount() { openAddSavingsAccountModal(); }
function deleteSavingsAccount(index) { deleteSavingsAccountById(index); }
async function saveSavingsAccounts() { /* no-op, replaced */ }


async function uploadAvatar(event) {
  const file = event.target.files[0];
  if (!file) return;

  // 10MB limit
  if (file.size > 10 * 1024 * 1024) {
    showToast('Image must be under 10MB 📸');
    return;
  }

  // Support jpg, jpeg, heic, png
  const ext = file.name.split('.').pop().toLowerCase();
  if (!['jpg', 'jpeg', 'heic', 'png'].includes(ext)) {
    showToast('Only JPG, JPEG, HEIC, and PNG images are supported 📸');
    return;
  }

  setSyncing('syncing');
  try {
    const publicUrl = await dbUploadAvatarFile(currentUser.id, file);
    appData.profile = appData.profile || {};
    appData.profile.avatar = publicUrl;

    await dbSaveProfile(currentUser.id, appData.profile);
    setSyncing('ok');
    renderProfile();
    showToast('Profile picture updated! 📸');
  } catch (err) {
    setSyncing('error');
    showToast('Failed to save profile picture: ' + err.message);
  }
}

function openChangePassword() {
  document.getElementById('input-new-password').value = '';
  openModal('modal-change-password');
  setTimeout(() => document.getElementById('input-new-password').focus(), 350);
}

async function submitChangePassword() {
  const newPassword = document.getElementById('input-new-password').value;
  if (!newPassword || newPassword.length < 6) {
    showToast('Password must be at least 6 characters');
    return;
  }
  setSyncing('syncing');
  try {
    await dbUpdatePassword(newPassword);
    setSyncing('ok');
    closeModal('modal-change-password');
    showToast('Password updated successfully! 🔐');
  } catch (e) {
    setSyncing('error');
    showToast(e.message);
  }
}

function renderCatBudgetSettings() {
  const cb = (appData.catBudgets || {})[currentKey()] || {};
  const top = ['Food', 'Groceries', 'Transport', 'Dining Out', 'Entertainment', 'Shopping', 'Utilities', 'Rent', 'EMI / Loan'];
  document.getElementById('cat-budget-settings').innerHTML = top.map(cat => {
    const c = CATEGORIES.find(x => x.id === cat) || { icon: '📌' };
    return `<div class="edit-field" style="margin-bottom:8px">
      <span class="edit-field-label" style="width:120px">${c.icon} ${cat}</span>
      <input type="number" placeholder="No limit" step="any" value="${cb[cat] || ''}" style="flex:1;background:none;border:none;outline:none;padding:11px 0;font-size:13px;font-family:var(--font);color:var(--text)" onblur="saveCatBudget('${cat}',this.value)" onkeydown="if(event.key==='Enter')this.blur()">
    </div>`;
  }).join('');
}

async function autoSaveProfile() {
  const p = {
    name: document.getElementById('profile-name-input').value.trim(),
  };
  // Currency is saved separately by selectCurrency() — don't overwrite it here
  const oldProfile = { ...appData.profile };
  appData.profile = { ...appData.profile, ...p };
  setSyncing('syncing');
  try {
    await dbSaveProfile(currentUser.id, p);
    setSyncing('ok');
    document.getElementById('profile-display-name').textContent = p.name || currentUser?.email || 'My Account';
    document.getElementById('profile-avatar').textContent = p.name ? p.name[0].toUpperCase() : '💼';
    showToast('Saved ✓');
  } catch (e) {
    setSyncing('error');
    showToast('Failed to save profile: ' + e.message);
    appData.profile = oldProfile;
  }
}

async function saveUsername() {
  if (!currentUser) return;
  if (appData.profile?.username_locked) {
    return;
  }
  const input = document.getElementById('profile-username-input');
  const badge = document.getElementById('profile-username-badge');
  const raw = (input?.value || '').trim().toLowerCase().replace(/[^a-z0-9_]/g, '');

  // Enforce minimum length
  if (raw && raw.length < 3) {
    showToast('Username must be at least 3 characters');
    if (input) input.value = appData.profile?.username || '';
    return;
  }

  const current = appData.profile?.username || '';
  if (raw === current) return; // no change

  setSyncing('syncing');
  try {
    if (raw) {
      // Check uniqueness — look up if another user already has this username
      const existing = await dbLookupByUsername(raw);
      if (existing && existing.id !== currentUser.id) {
        showToast(`@${raw} is already taken — try another`);
        if (input) input.value = current;
        setSyncing('ok');
        return;
      }
    }

    // Save to Supabase and lock it
    await dbSaveProfile(currentUser.id, { username: raw || null, username_locked: true });
    appData.profile = { ...appData.profile, username: raw || null, username_locked: true };

    // Update badge
    if (badge) {
      if (raw) {
        badge.textContent = '@' + raw;
        badge.style.display = 'inline-block';
      } else {
        badge.style.display = 'none';
      }
    }
    setSyncing('ok');
    showToast(raw ? `✓ Username set to @${raw} (Locked)` : 'Username cleared');
    renderProfile();
  } catch (e) {
    setSyncing('error');
    showToast('Failed to save username: ' + e.message);
    if (input) input.value = current;
  }
}

function copyUsername() {
  const input = document.getElementById('profile-username-input');
  const username = (input?.value || '').trim();
  if (!username) {
    showToast('No username to copy!');
    return;
  }
  const clean = username.replace(/^@/, '');
  navigator.clipboard.writeText(clean).then(() => {
    showToast('Username copied! ✓');
  }).catch(err => {
    showToast('Failed to copy username');
  });
}


// ─────────────────────────────────────────────────────
// CURRENCY PICKER
// ─────────────────────────────────────────────────────
function openCurrencyPicker() {
  const searchEl = document.getElementById('currency-search');
  if (searchEl) searchEl.value = '';
  renderCurrencyList();
  openModal('modal-currency');
}

function renderCurrencyList() {
  const search = (document.getElementById('currency-search')?.value || '').toLowerCase().trim();
  const current = getCurrencySymbol();
  const filtered = search
    ? CURRENCIES.filter(c => c.name.toLowerCase().includes(search) || c.code.toLowerCase().includes(search) || c.symbol.includes(search))
    : CURRENCIES;
  const checkSvg = `<svg fill="none" stroke="var(--accent)" stroke-width="2.5" viewBox="0 0 24 24" width="18" height="18"><polyline points="20 6 9 17 4 12"/></svg>`;
  document.getElementById('currency-list').innerHTML = filtered.length === 0
    ? `<div class="empty-state"><div class="empty-icon">🔍</div><div class="empty-title">No results</div></div>`
    : filtered.map(c => `
      <div class="settings-item" onclick="selectCurrency('${c.symbol.replace(/'/g, "\\'")}',' ${c.name}')" style="${c.symbol === current ? 'background:var(--surface2)' : ''};border-radius:12px;margin-bottom:2px">
        <div class="settings-left">
          <div class="settings-icon" style="font-size:20px">${c.flag}</div>
          <div>
            <div class="settings-label" style="${c.symbol === current ? 'color:var(--accent)' : ''}">${c.name}</div>
            <div class="settings-val">${c.code} &nbsp;·&nbsp; ${c.symbol}</div>
          </div>
        </div>
        ${c.symbol === current ? checkSvg : ''}
      </div>`).join('');
}

function selectCurrency(symbol, name) {
  const s = getLocalSettings();
  s.currency = symbol;
  saveLocalSettings(s);
  localSettings = s;
  closeModal('modal-currency');
  renderProfile();
  renderHome();
  updateCurrencyUI();
  showToast(`Currency set to ${symbol.trim()} ${name.trim()}`);
}

function updateCurrencyUI() {
  const sym = getCurrencySymbol();
  document.querySelectorAll('.amount-prefix').forEach(el => {
    el.textContent = sym;
  });

  const quickAmts = [100, 200, 500, 1000, 2000, 5000];
  const quickLabels = ['100', '200', '500', '1K', '2K', '5K'];
  const quickContainer = document.querySelector('.quick-amounts');
  if (quickContainer) {
    quickContainer.innerHTML = quickAmts.map((val, idx) =>
      `<div class="quick-amt" onclick="setQuickAmt(${val})">${sym}${quickLabels[idx]}</div>`
    ).join('');
  }
}

async function saveCatBudget(cat, val) {
  const n = parseFloat(val);
  const key = currentKey();
  setSyncing('syncing');
  try {
    await dbSaveCatBudget(currentUser.id, key, cat, n || 0);
    if (!appData.catBudgets[key]) appData.catBudgets[key] = {};
    if (n > 0) appData.catBudgets[key][cat] = n; else delete appData.catBudgets[key][cat];
    setSyncing('ok');
    showToast(n > 0 ? `✓ Saved — ${cat}: ${fmt(n)}` : `✓ ${cat} budget removed`);
    renderHome();
    renderProfile();
  } catch (e) {
    setSyncing('error');
    showToast('Failed to save category budget: ' + e.message);
  }
}

// ─────────────────────────────────────────────────────
// ADD TRANSACTION
// ─────────────────────────────────────────────────────
function openAddExpense() {
  editingTxId = null;
  const now = new Date();
  let defaultDate = new Date();
  if (viewYear !== now.getFullYear() || viewMonth !== now.getMonth()) {
    const daysInSelMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const day = Math.min(now.getDate(), daysInSelMonth);
    defaultDate = new Date(viewYear, viewMonth, day, now.getHours(), now.getMinutes());
  }
  const yyyy = defaultDate.getFullYear();
  const mm = String(defaultDate.getMonth() + 1).padStart(2, '0');
  const dd = String(defaultDate.getDate()).padStart(2, '0');
  document.getElementById('input-date').value = `${yyyy}-${mm}-${dd}`;

  const hh = String(defaultDate.getHours()).padStart(2, '0');
  const min = String(defaultDate.getMinutes()).padStart(2, '0');
  document.getElementById('input-time').value = `${hh}:${min}`;

  ['input-amount', 'input-desc', 'input-notes'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('input-recur').value = 'none';
  selectedCat = 'Food'; setType('expense');
  document.querySelector('#modal-add .sheet-title').textContent = 'Add Transaction';
  document.querySelector('#modal-add .submit-btn').textContent = 'Add Transaction';
  openModal('modal-add');
  setTimeout(() => document.getElementById('input-amount').focus(), 350);
}
function setType(type) {
  selectedType = type;
  document.getElementById('type-expense').className = 'type-btn' + (type === 'expense' ? ' active-expense' : '');
  document.getElementById('type-income').className = 'type-btn' + (type === 'income' ? ' active-income' : '');
  // Always show the category group; just render the appropriate categories
  document.getElementById('cat-group').style.display = 'block';
  // Update description placeholder based on type
  const descInput = document.getElementById('input-desc');
  if (descInput) {
    descInput.placeholder = type === 'income'
      ? 'Where did this income come from?'
      : 'Who / what did you pay?';
  }
  // Reset to first category of the new type
  if (type === 'income') {
    if (!INCOME_CATEGORIES.find(c => c.id === selectedCat)) selectedCat = INCOME_CATEGORIES[0].id;
  } else {
    if (!CATEGORIES.find(c => c.id === selectedCat)) selectedCat = 'Food';
  }
  renderCatGrid();
}
function renderCatGrid() {
  const cats = selectedType === 'income' ? INCOME_CATEGORIES : CATEGORIES;
  document.getElementById('cat-grid').innerHTML = cats.map(c =>
    `<div class="cat-option ${c.id === selectedCat ? 'selected' : ''}" onclick="selectCat('${c.id}')"><div class="cat-option-icon">${c.icon}</div><div class="cat-option-label">${c.id}</div></div>`).join('');
}
function selectCat(id) { selectedCat = id; renderCatGrid(); }
function setQuickAmt(n) { document.getElementById('input-amount').value = n; document.getElementById('input-desc').focus(); }

async function submitTransaction() {
  const amount = parseFloat(document.getElementById('input-amount').value);
  const desc = document.getElementById('input-desc').value.trim();
  const notes = document.getElementById('input-notes').value.trim();
  const dateVal = document.getElementById('input-date').value;
  const timeVal = document.getElementById('input-time').value;
  const recur = document.getElementById('input-recur').value;

  if (!amount || amount <= 0) { showToast('Enter a valid amount'); return; }
  if (!dateVal) { showToast('Select a date'); return; }

  const datetime = timeVal ? `${dateVal}T${timeVal}` : dateVal;
  const d = parseDate(datetime);
  const key = monthKey(d.getFullYear(), d.getMonth());

  if (editingTxId) {
    const tx = appData.transactions.find(t => t.id === editingTxId);
    if (!tx) return;
    const oldTx = { ...tx };
    tx.type = selectedType;
    tx.amount = amount;
    tx.description = desc || selectedCat;
    tx.category = selectedCat;
    tx.datetime = datetime;
    tx.monthKey = key;
    tx.notes = notes;
    tx.recur = recur;

    setSyncing('syncing');
    try {
      await dbUpdateTransaction(currentUser.id, editingTxId, tx);
      setSyncing('ok');
      closeModal('modal-add');
      if (navigator.vibrate) navigator.vibrate(50);
      showToast('Transaction updated');
      viewYear = d.getFullYear(); viewMonth = d.getMonth();
      updateMonthLabels(); renderHome();
      editingTxId = null;
    } catch (e) {
      setSyncing('error');
      showToast('Failed to update transaction: ' + e.message);
      Object.assign(tx, oldTx); // Revert memory
    }
    return;
  }

  const tx = {
    id: uid(), type: selectedType, amount,
    description: desc || selectedCat,
    category: selectedCat,
    datetime, monthKey: key, notes, recur, recurParent: ''
  };
  setSyncing('syncing');
  try {
    if (!navigator.onLine) {
      throw new Error('offline');
    }
    await dbInsertTransaction(currentUser.id, tx);
    appData.transactions.unshift(tx);
    saveAppDataLocally();
    setSyncing('ok');
    closeModal('modal-add');
    if (navigator.vibrate) navigator.vibrate(50);
    showToast(selectedType === 'expense' ? `-${fmt(amount)} recorded` : `+${fmt(amount)} added`);
    addXP(2, 'transaction');
    viewYear = d.getFullYear(); viewMonth = d.getMonth();
    updateMonthLabels(); renderHome();
  } catch (e) {
    const isOffline = e.message === 'offline' || e.message?.includes('fetch') || e.status === 0 || !navigator.onLine;
    if (isOffline) {
      const pendingKey = `spendly_pending_tx_${currentUser.id}`;
      let pending = [];
      try {
        pending = JSON.parse(localStorage.getItem(pendingKey) || '[]');
      } catch (err) { }
      if (!pending.some(p => p.id === tx.id)) {
        pending.push(tx);
        localStorage.setItem(pendingKey, JSON.stringify(pending));
      }
      appData.transactions.unshift(tx);
      saveAppDataLocally();
      setSyncing('error');
      closeModal('modal-add');
      if (navigator.vibrate) navigator.vibrate(50);
      showToast('Offline: transaction saved locally');
      addXP(2, 'transaction');
      viewYear = d.getFullYear(); viewMonth = d.getMonth();
      updateMonthLabels(); renderHome();
    } else {
      setSyncing('error');
      showToast('Failed to record transaction: ' + e.message);
    }
  }
}

let activeBudgetModalTab = 'budget';

function switchBudgetModalTab(tab) {
  activeBudgetModalTab = tab;
  const tabBudgetBtn = document.getElementById('btn-tab-budget');
  const tabSalaryBtn = document.getElementById('btn-tab-salary');
  const tabBudgetContent = document.getElementById('tab-content-budget');
  const tabSalaryContent = document.getElementById('tab-content-salary');

  if (tab === 'budget') {
    tabBudgetBtn.classList.add('active');
    tabSalaryBtn.classList.remove('active');
    tabBudgetContent.style.display = 'block';
    tabSalaryContent.style.display = 'none';
    setTimeout(() => document.getElementById('input-budget').focus(), 50);
  } else {
    tabBudgetBtn.classList.remove('active');
    tabSalaryBtn.classList.add('active');
    tabBudgetContent.style.display = 'none';
    tabSalaryContent.style.display = 'block';
    setTimeout(() => document.getElementById('input-salary').focus(), 50);
  }
}

function toggleSalaryFreq() {
  const freq = document.getElementById('select-salary-freq').value;
  const paydayGroup = document.getElementById('group-salary-payday');
  if (freq === 'weekly') {
    paydayGroup.style.display = 'block';
  } else {
    paydayGroup.style.display = 'none';
  }
}

function countWeekdayInMonth(year, month, weekday) {
  let count = 0;
  const d = new Date(year, month, 1);
  while (d.getMonth() === month) {
    if (d.getDay() === weekday) {
      count++;
    }
    d.setDate(d.getDate() + 1);
  }
  return count;
}

function openSetBudget() {
  const key = currentKey();
  let meta = null;
  try {
    const allMeta = appData.profile?.budgetMeta || {};
    meta = allMeta[key];
  } catch (e) { console.error(e); }

  if (meta && meta.type === 'salary') {
    document.getElementById('input-budget').value = '';
    document.getElementById('input-salary').value = meta.salaryAmount || '';
    document.getElementById('select-salary-freq').value = meta.frequency || 'monthly';
    document.getElementById('select-salary-payday').value = (meta.payday !== undefined) ? meta.payday : '5';
    switchBudgetModalTab('salary');
    toggleSalaryFreq();
  } else {
    document.getElementById('input-budget').value = appData.budgets[key] || '';
    document.getElementById('input-salary').value = '';
    document.getElementById('select-salary-freq').value = 'monthly';
    document.getElementById('select-salary-payday').value = '5';
    switchBudgetModalTab('budget');
    toggleSalaryFreq();
  }

  openModal('modal-budget');
}

async function saveBudget() {
  const key = currentKey();
  let calculatedAmount = 0;
  let metaObj = {};

  if (activeBudgetModalTab === 'budget') {
    const val = parseFloat(document.getElementById('input-budget').value);
    calculatedAmount = isNaN(val) || val < 0 ? 0 : val;
    metaObj = { type: 'budget', budgetVal: calculatedAmount };
  } else {
    const salaryVal = parseFloat(document.getElementById('input-salary').value);
    const validSalary = isNaN(salaryVal) || salaryVal < 0 ? 0 : salaryVal;
    const freq = document.getElementById('select-salary-freq').value;
    const payday = parseInt(document.getElementById('select-salary-payday').value, 10);

    if (freq === 'monthly') {
      calculatedAmount = validSalary;
      metaObj = { type: 'salary', salaryAmount: validSalary, frequency: 'monthly' };
    } else {
      // weekly
      const paydayCount = countWeekdayInMonth(viewYear, viewMonth, payday);
      calculatedAmount = validSalary * paydayCount;
      metaObj = { type: 'salary', salaryAmount: validSalary, frequency: 'weekly', payday: payday };
    }
  }
  // Save metadata to Supabase profile
  try {
    if (!appData.profile) appData.profile = {};
    const allMeta = appData.profile.budgetMeta || {};
    allMeta[key] = metaObj;
    appData.profile.budgetMeta = allMeta;
    dbSaveProfile(currentUser.id, appData.profile);
  } catch (e) { console.error(e); }

  // Save calculated budget
  appData.budgets[key] = calculatedAmount;
  setSyncing('syncing');
  try {
    await dbSaveBudget(currentUser.id, key, calculatedAmount);
    setSyncing('ok');
  } catch (e) { setSyncing('error'); }

  closeModal('modal-budget');
  showToast(activeBudgetModalTab === 'budget' ? `Budget: ${fmtFull(calculatedAmount)}` : `Salary Budget: ${fmtFull(calculatedAmount)}`);
  renderHome();
  renderProfile();
}

function switchBudgetModalTab(tab) {
  activeBudgetModalTab = tab;

  const tabBudgetBtn = document.getElementById('btn-tab-budget');
  const tabSalaryBtn = document.getElementById('btn-tab-salary');
  const tabBudgetContent = document.getElementById('tab-content-budget');
  const tabSalaryContent = document.getElementById('tab-content-salary');
  const saveBtn = document.getElementById('save-btn');

  if (tab === 'budget') {
    tabBudgetBtn.classList.add('active');
    tabSalaryBtn.classList.remove('active');

    tabBudgetContent.style.display = 'block';
    tabSalaryContent.style.display = 'none';

    saveBtn.textContent = 'Save Budget';

    setTimeout(() => document.getElementById('input-budget').focus(), 50);
  } else {
    tabBudgetBtn.classList.remove('active');
    tabSalaryBtn.classList.add('active');

    tabBudgetContent.style.display = 'none';
    tabSalaryContent.style.display = 'block';

    saveBtn.textContent = 'Save Salary';

    setTimeout(() => document.getElementById('input-salary').focus(), 50);
  }
}
// ─────────────────────────────────────────────────────
// MONTH SELECTOR
// ─────────────────────────────────────────────────────
function openMonthSelector() {
  const list = document.getElementById('month-list'), now = new Date(), items = [];
  // Add All Time option at the top of the month list picker
  const allTimeActive = filterTimeScope === 'all';
  items.push(`<div class="month-option ${allTimeActive ? 'active' : ''}" onclick="selectAllTime()">📅 All Time${allTimeActive ? ' <span style="color:var(--accent)">✓</span>' : ''}</div>`);

  for (let i = -6; i <= 1; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1), y = d.getFullYear(), m = d.getMonth();
    const active = !allTimeActive && y === viewYear && m === viewMonth;
    items.push(`<div class="month-option ${active ? 'active' : ''}" onclick="selectMonth(${y},${m})">${MONTHS_FULL[m]} ${y}${active ? ' <span style="color:var(--accent)">✓</span>' : ''}</div>`);
  }
  list.innerHTML = items.join('');
  openModal('modal-month');
  setTimeout(() => { const a = list.querySelector('.active'); if (a) a.scrollIntoView({ block: 'center' }); }, 60);
}
function selectMonth(y, m) {
  transactionsPage = 1;
  viewYear = y; viewMonth = m; updateMonthLabels(); closeModal('modal-month');
  filterTimeScope = 'month';
  const a = document.querySelector('.screen.active');
  if (a.id === 'screen-home') renderHome();
  if (a.id === 'screen-transactions') renderTransactions();
  if (a.id === 'screen-stats') renderStats();
}
function selectAllTime() {
  transactionsPage = 1;
  filterTimeScope = 'all';
  closeModal('modal-month');
  ['nav-month-label', 'nav-month-label-2', 'nav-month-label-3'].forEach(id => {
    const e = document.getElementById(id); if (e) e.textContent = 'All Time';
  });
  navigate('transactions');
}

// ─────────────────────────────────────────────────────
// TX DETAIL
// ─────────────────────────────────────────────────────
function showDetail(id) {
  const tx = appData.transactions.find(t => t.id === id); if (!tx) return;
  const cat = CATEGORIES.find(c => c.id === tx.category) || { icon: '📌', color: '#8896b3' };
  const hasTime = tx.datetime && tx.datetime.includes('T');
  const d = parseDate(tx.datetime), isExp = tx.type === 'expense';
  const rows = [['Date', d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })]];
  if (hasTime) {
    rows.push(['Time', d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })]);
  }
  rows.push(['Category', tx.category], ['Type', `<span style="color:${isExp ? 'var(--red)' : 'var(--green)'}">${isExp ? 'Expense' : 'Income'}</span>`]);
  if (tx.notes) rows.push(['Notes', tx.notes]);
  if (tx.recur && tx.recur !== 'none') rows.push(['Recurring', tx.recur]);
  document.getElementById('detail-content').innerHTML = `
    <div style="text-align:center;padding:14px 0 18px">
      <div style="font-size:44px;margin-bottom:8px">${cat.icon}</div>
      <div style="font-size:30px;font-weight:600;font-family:var(--mono);color:${isExp ? 'var(--red)' : 'var(--green)'};letter-spacing:-1px">${isExp ? '-' : '+'}${fmtFull(tx.amount)}</div>
      <div style="font-size:15px;color:var(--text);margin-top:7px;font-weight:500">${tx.description}</div>
    </div>
    <div style="background:var(--surface2);border-radius:14px;padding:4px 14px;margin-bottom:14px">
      ${rows.map(([l, v], i, a) => `<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;${i < a.length - 1 ? 'border-bottom:1px solid var(--border)' : ''}"><span style="color:var(--text3);font-size:12px">${l}</span><span style="font-size:13px;font-weight:500;text-align:right">${v}</span></div>`).join('')}
    </div>
    <button class="submit-btn" style="margin-bottom:8px" onclick="editTransaction('${tx.id}')">Edit Transaction</button>
    <button class="submit-btn danger" onclick="deleteTransaction('${tx.id}')">Delete Transaction</button>`;
  openModal('modal-detail');
}

function editTransaction(id) {
  const tx = appData.transactions.find(t => t.id === id);
  if (!tx) return;

  editingTxId = tx.id;

  // Close details modal and transition history state directly to modal-add to prevent popstate race condition
  const detailModal = document.getElementById('modal-detail');
  if (detailModal && detailModal.classList.contains('open')) {
    detailModal.classList.remove('open');
    if (history.state && history.state.modal === 'modal-detail') {
      history.replaceState({ modal: 'modal-add' }, '');
    } else {
      history.pushState({ modal: 'modal-add' }, '');
    }
  } else {
    history.pushState({ modal: 'modal-add' }, '');
  }

  document.getElementById('input-amount').value = tx.amount;
  document.getElementById('input-desc').value = tx.description;
  document.getElementById('input-notes').value = tx.notes || '';

  if (tx.datetime.includes('T')) {
    const parts = tx.datetime.split('T');
    document.getElementById('input-date').value = parts[0];
    document.getElementById('input-time').value = parts[1] || '';
  } else {
    document.getElementById('input-date').value = tx.datetime;
    document.getElementById('input-time').value = '';
  }

  document.getElementById('input-recur').value = tx.recur || 'none';

  setType(tx.type);
  selectedCat = tx.category;
  renderCatGrid();

  document.querySelector('#modal-add .sheet-title').textContent = 'Edit Transaction';
  document.querySelector('#modal-add .submit-btn').textContent = 'Save Changes';

  document.getElementById('modal-add').classList.add('open');
}

async function deleteTransaction(id) {
  setSyncing('syncing');
  try {
    await dbDeleteTransaction(currentUser.id, id);
    setSyncing('ok');
    appData.transactions = appData.transactions.filter(t => t.id !== id);
    closeModal('modal-detail'); showToast('Deleted');
    const a = document.querySelector('.screen.active');
    if (a && a.id === 'screen-home') renderHome();
    if (a && a.id === 'screen-transactions') renderTransactions();
  } catch (e) {
    setSyncing('error');
    showToast('Failed to delete transaction: ' + e.message);
  }
}

// ─────────────────────────────────────────────────────
// RECURRING
// ─────────────────────────────────────────────────────
async function processRecurring() {
  if (!currentUser) return;
  const now = new Date(), key = monthKey(now.getFullYear(), now.getMonth());
  const templates = appData.transactions.filter(t => t.recur && t.recur !== 'none');
  const newTxs = [];
  templates.forEach(t => {
    if (t.recur === 'monthly') {
      const alreadyExists = appData.transactions.some(x => x.recurParent === t.id && x.monthKey === key);
      if (!alreadyExists && t.monthKey !== key) {
        const orig = parseDate(t.datetime);
        const newDate = new Date(now.getFullYear(), now.getMonth(), Math.min(orig.getDate(), new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()));
        if (newDate <= now) {
          newTxs.push({ ...t, id: uid(), monthKey: key, datetime: newDate.toISOString().slice(0, 16), recur: 'none', recurParent: t.id });
        }
      }
    }
  });
  if (newTxs.length) {
    try { await dbBulkInsertTransactions(currentUser.id, newTxs); } catch (e) { }
    appData.transactions.unshift(...newTxs);
    showToast(`${newTxs.length} recurring transaction${newTxs.length > 1 ? 's' : ''} auto-logged 🔄`);
  }
}

// ─────────────────────────────────────────────────────
// EXPORT / IMPORT
// ─────────────────────────────────────────────────────
let pendingExport = null;

async function handleFileExport(blob, filename, title, text, successMsg) {
  const file = new File([blob], filename, { type: blob.type });
  // Always show action modal so user can choose email / share / download
  pendingExport = { blob, filename, title, text, successMsg, file };
  // Hide the 'share' button on platforms that don't support Web Share API
  const shareBtn = document.getElementById('export-share-btn');
  if (shareBtn) shareBtn.style.display = (navigator.canShare && navigator.canShare({ files: [file] })) ? '' : 'none';
  openModal('modal-export-action');
}

async function executeExportAction(action) {
  if (!pendingExport) return;
  const { blob, filename, title, text, successMsg, file } = pendingExport;
  closeModal('modal-export-action');

  if (action === 'email') {
    // 1. Download the file so the user can attach it
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);

    // 2. Open mailto: pre-filled with the user's registered email
    const toEmail = currentUser?.email || '';
    const subject = encodeURIComponent('Spendly Expense Report');
    const body = encodeURIComponent(
      `Hi,\n\nPlease find attached my Spendly expense report (${filename}).\n\nGenerated on ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}.\n\n— Sent via Spendly`
    );
    setTimeout(() => {
      window.location.href = `mailto:${toEmail}?subject=${subject}&body=${body}`;
    }, 400); // slight delay so download triggers first

    // 3. Show confirmation modal
    const addrEl = document.getElementById('email-sent-address');
    if (addrEl) addrEl.textContent = toEmail || 'your registered email';
    pendingExport = null;
    openModal('modal-email-sent');
    return;
  }

  pendingExport = null;

  if (action === 'share') {
    try {
      await navigator.share({
        files: [file],
        title: title,
        text: text
      });
      showToast('Shared successfully! ✉️');
    } catch (e) {
      if (e.name !== 'AbortError') {
        console.error('Error sharing file', e);
        showToast('Sharing failed');
      }
    }
  } else if (action === 'download') {
    const url = URL.createObjectURL(blob), a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
    showToast(successMsg);
  }
}


function exportCSV() {
  openModal('modal-export-csv');
}

function triggerExportCSV(exportAll) {
  closeModal('modal-export-csv');
  const curMonthLabel = getMonthLabel();
  let txs = appData.transactions;
  let filename = `spendly-all-${new Date().toISOString().slice(0, 10)}.csv`;

  if (!exportAll) {
    txs = txs.filter(t => t.monthKey === currentKey());
    filename = `spendly-${currentKey()}-${new Date().toISOString().slice(0, 10)}.csv`;
  }

  const rows = [['Date', 'Time', 'Type', 'Amount', 'Category', 'Description', 'Notes', 'Recurring', 'Month']];
  txs.forEach(t => {
    const hasTime = t.datetime && t.datetime.includes('T');
    const d = parseDate(t.datetime);
    const timeVal = hasTime ? d.toLocaleTimeString('en-IN', { hour12: true }) : '';
    rows.push([d.toLocaleDateString('en-IN'), timeVal, t.type, t.amount, t.category, t.description || '', t.notes || '', t.recur || 'none', t.monthKey]);
  });
  const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const successMsg = exportAll ? 'All-time CSV downloaded' : `${curMonthLabel} CSV downloaded`;
  handleFileExport(blob, filename, 'Spendly Expense Report CSV', 'Here is my Spendly expense report.', successMsg);
}
async function importData(e) {
  const file = e.target.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = async ev => {
    try {
      const text = ev.target.result.trim();
      const lines = text.split(/\r?\n/).filter(l => l.trim());
      if (lines.length < 2) { showToast('CSV is empty'); return; }

      // Validate header row matches our export format
      const header = parseCSVRow(lines[0]).map(h => h.toLowerCase());
      const expected = ['date', 'time', 'type', 'amount', 'category', 'description', 'notes', 'recurring', 'month'];
      const isOurCSV = expected.every((h, i) => header[i] === h);
      if (!isOurCSV) { showToast('Unrecognised CSV format'); return; }

      const newTxs = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = parseCSVRow(lines[i]);
        if (cols.length < 5) continue;
        const [dateStr, timeStr, type, amount, category, description = '', notes = '', recur = 'none', mKey = ''] = cols;
        const n = parseFloat(amount);
        if (!n || n <= 0) continue;
        const datetime = parseDateFromCSV(dateStr, timeStr);
        const d = parseDate(datetime);
        const key = mKey || monthKey(d.getFullYear(), d.getMonth());
        newTxs.push({
          id: uid(), type: type === 'income' ? 'income' : 'expense', amount: n,
          description: description || category, category: category || 'Other',
          notes: notes || '', recur: recur === 'none' ? 'none' : (recur || 'none'),
          recurParent: '', monthKey: key, datetime,
        });
      }

      if (!newTxs.length) { showToast('No valid transactions found in CSV'); return; }
      await dbBulkInsertTransactions(currentUser.id, newTxs);
      appData.transactions = [...appData.transactions, ...newTxs];
      showToast(`Imported ${newTxs.length} transaction${newTxs.length > 1 ? 's' : ''} ✅`);
      renderHome();
    } catch (err) { console.error(err); showToast('Import failed — check file format'); }
  };
  reader.readAsText(file); e.target.value = '';
}

// Parse a single CSV line, respecting quoted fields and escaped double-quotes
function parseCSVRow(line) {
  const cols = []; let cur = '', inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQ && line[i + 1] === '"') { cur += '"'; i++; } else inQ = !inQ;
    } else if (ch === ',' && !inQ) {
      cols.push(cur.trim()); cur = '';
    } else { cur += ch; }
  }
  cols.push(cur.trim());
  return cols;
}

// Convert "DD/MM/YYYY" + "12:21:00 am" back to ISO datetime string
function parseDateFromCSV(dateStr, timeStr) {
  const dm = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  const base = dm ? `${dm[3]}-${dm[2].padStart(2, '0')}-${dm[1].padStart(2, '0')}` : new Date().toISOString().slice(0, 10);
  if (!timeStr) return base;
  const tm = timeStr.trim().match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(am|pm)$/i);
  if (!tm) return base;
  let h = parseInt(tm[1]);
  const period = tm[3].toLowerCase();
  if (period === 'am' && h === 12) h = 0;
  if (period === 'pm' && h !== 12) h += 12;
  return `${base}T${String(h).padStart(2, '0')}:${tm[2]}`;
}

// ─────────────────────────────────────────────────────
// MODALS + ANDROID BACK
// ─────────────────────────────────────────────────────
function openModal(id) {
  document.getElementById(id).classList.add('open');
  history.pushState({ modal: id }, '');
}
function closeModal(id) {
  const el = document.getElementById(id);
  if (!el.classList.contains('open')) return;
  if (history.state && history.state.modal === id) {
    history.back();
  } else {
    el.classList.remove('open');
  }
}

window.addEventListener('popstate', function (e) {
  // 1. Close any open modal first
  const openOverlay = document.querySelector('.modal-overlay.open');
  if (openOverlay) {
    openOverlay.classList.remove('open');
    return;
  }

  // 2. Retrace screen history
  if (_screenHistory.length > 1) {
    _screenHistory.pop();
    const prev = _screenHistory[_screenHistory.length - 1];
    history.pushState({ screen: prev }, '');
    if (prev === 'events') {
      // raw navigate to events without re-pushing to _screenHistory
      document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
      document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
      document.getElementById('screen-events').classList.add('active');
      if (typeof renderEvents === 'function') renderEvents();
    } else {
      // raw navigate without re-pushing to _screenHistory
      document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
      document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
      const sc = document.getElementById('screen-' + prev);
      if (sc) { sc.classList.add('active'); sc.scrollTop = 0; }
      const ni = document.getElementById('nav-' + prev); if (ni) ni.classList.add('active');
      if (prev === 'home') renderHome();
      if (prev === 'transactions') { transactionsPage = 1; renderTransactions(); }
      if (prev === 'stats') renderStats();
      if (prev === 'debts') renderDebts();
      if (prev === 'profile') renderProfile();
      if (prev === 'bill-splitter' && typeof renderBillSplitter === 'function') renderBillSplitter();
      if (prev === 'savings' && typeof renderSavingsScreen === 'function') renderSavingsScreen();
      if (prev === 'invoices' && typeof renderInvoicesScreen === 'function') renderInvoicesScreen();
    }
    return;
  }

  // 3. Already at home root — re-push so next back press may exit
  history.pushState({ screen: 'home' }, '');
});

// Prime history so first back press doesn't exit directly
history.pushState({ screen: 'home' }, '');
document.querySelectorAll('.modal-overlay').forEach(el => el.addEventListener('click', function (e) {
  if (e.target === this) {
    closeModal(this.id);
  }
}));

// ─────────────────────────────────────────────────────
// TOAST
// ─────────────────────────────────────────────────────
let toastTimer;
function showToast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.remove('show'); void el.offsetWidth; el.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'), 2500);
}

// INIT
// ─────────────────────────────────────────────────────
(async function init() {
  // Load local settings first
  localSettings = getLocalSettings();
  applyTheme(localSettings.theme || 'dark');
  updateCurrencyUI();

  const isSplitRoute = handleSplitBillRouting();

  // Check auth state
  dbOnAuthChange(async (event, session) => {
    if (session) {
      currentUser = session.user;
      if (!isSplitRoute) {
        hideAuthScreen();
        await loadAllData(currentUser.id);
        await processRecurring();
        updateMonthLabels();
        renderHome();
        applyHideAmountsUI();
        checkLock();

        // Trigger password change modal if returning from a recovery email link
        if (event === 'PASSWORD_RECOVERY') {
          openChangePassword();
          showToast('Please set your new password 🔑');
        }
      } else {
        await loadAllData(currentUser.id);
      }
    } else {
      currentUser = null;
      if (!isSplitRoute) {
        showAuthScreen();
      }
    }
  });

  // Check existing session immediately
  const session = await dbGetSession();
  if (!session && !isSplitRoute) {
    showAuthScreen();
  }

  updateMonthLabels();
})();

// ═══════════════════════════════════════════════════════
// EVENT PLANNER MODULE
// ═══════════════════════════════════════════════════════

function navigateEvents() {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('screen-events').classList.add('active');
  renderEvents();
  if (_screenHistory[_screenHistory.length - 1] !== 'events') {
    _screenHistory.push('events');
    history.pushState({ screen: 'events' }, '');
  }
}

function getEventIcon(name) {
  const n = name.toLowerCase();
  if (n.includes('wedding') || n.includes('marriage')) return '💍';
  if (n.includes('trip') || n.includes('travel') || n.includes('goa') || n.includes('tour') || n.includes('flight') || n.includes('vacation') || n.includes('road')) return '🌴';
  if (n.includes('birthday') || n.includes('bday') || n.includes('party') || n.includes('celebration') || n.includes('anniversary')) return '🎉';
  if (n.includes('christmas') || n.includes('xmas') || n.includes('diwali') || n.includes('festival') || n.includes('holiday')) return '🎄';
  if (n.includes('gig') || n.includes('concert') || n.includes('show') || n.includes('movie') || n.includes('music')) return '🎸';
  if (n.includes('shopping') || n.includes('buy') || n.includes('gift')) return '🛍️';
  if (n.includes('renovation') || n.includes('home') || n.includes('house') || n.includes('car')) return '🏠';
  return '🎯';
}

let currentEventsTab = 'active';

function switchEventsTab(tab) {
  currentEventsTab = tab;
  document.getElementById('ev-tab-active').className = 'stats-tab' + (tab === 'active' ? ' active' : '');
  document.getElementById('ev-tab-history').className = 'stats-tab' + (tab === 'history' ? ' active' : '');

  if (tab === 'active') {
    document.getElementById('events-list').style.display = 'block';
    document.getElementById('events-history-list').style.display = 'none';
  } else {
    document.getElementById('events-list').style.display = 'none';
    document.getElementById('events-history-list').style.display = 'block';
  }
  renderEvents();
}

function renderEvents() {
  const events = dbGetEvents(currentUser.id);
  const allItems = dbGetEventItems(currentUser.id);

  // Split events based on completed status
  const activeEvents = events.filter(e => !e.completed);
  const historyEvents = events.filter(e => e.completed);

  const activeContainer = document.getElementById('events-list');
  const historyContainer = document.getElementById('events-history-list');

  // Render helper
  const makeListHtml = (list, type) => {
    if (!list.length) {
      return `<div class="empty-state" style="padding-top:60px">
        <div class="empty-icon">🎯</div>
        <div class="empty-title">No ${type} events yet</div>
        <div class="empty-sub">${type === 'active' ? 'Tap + to plan your first event' : 'Completed events will appear here'}</div>
      </div>`;
    }
    return list.map((ev, idx) => {
      const sym = ev.currency || getCurrencySymbol();
      const curObj = CURRENCIES.find(c => c.symbol === sym);
      const curLabel = curObj ? `${curObj.flag} ${curObj.code}` : sym;
      const items = allItems.filter(i => i.eventId === ev.id);
      const totalPaid = items.reduce((s, i) => s + (i.amountPaid || 0), 0);
      const totalItemEst = items.reduce((s, i) => s + (i.totalCost || 0), 0);
      const budget = ev.estimatedBudget || totalItemEst;
      const pct = budget > 0 ? Math.min((totalPaid / budget) * 100, 100) : 0;
      const stillOwed = items.reduce((s, i) => s + Math.max(0, (i.totalCost || 0) - (i.amountPaid || 0)), 0);
      return `<div class="event-card ev-animate" style="animation-delay: ${idx * 60}ms" onclick="navigateEventDetail('${ev.id}')">
        <div class="ev-card-header">
          <div style="display:flex;align-items:center;gap:12px;min-width:0">
            <div class="ev-icon-wrapper">${getEventIcon(ev.name)}</div>
            <div style="min-width:0">
              <div class="ev-card-name" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${ev.name}</div>
              <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
                ${ev.targetDate ? `<div class="ev-date">📅 ${new Date(ev.targetDate + 'T12:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>` : ''}
                <div class="ev-date" style="color:var(--accent)">${curLabel}</div>
              </div>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:8px;flex-shrink:0">
            <span class="ev-badge">${items.length} item${items.length !== 1 ? 's' : ''}</span>
            <div class="ev-delete-btn-direct" onclick="event.stopPropagation(); deleteEventDirect('${ev.id}', '${ev.name.replace(/'/g, "\\'")}')" title="Delete event">
              <svg fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" width="14" height="14"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
            </div>
          </div>
        </div>
        <div class="ev-stats-row">
          <div class="ev-stat-item"><div class="ev-stat-val green">${fmtEvent(totalPaid, sym)}</div><div class="ev-stat-lbl">Paid</div></div>
          ${stillOwed > 0 ? `<div class="ev-stat-item"><div class="ev-stat-val red">${fmtEvent(stillOwed, sym)}</div><div class="ev-stat-lbl">Still Owed</div></div>` : ''}
          ${budget > 0 ? `<div class="ev-stat-item"><div class="ev-stat-val accent">${fmtEvent(budget, sym)}</div><div class="ev-stat-lbl">${ev.estimatedBudget ? 'Est. Budget' : 'Items Est.'}</div></div>` : ''}
        </div>
        ${budget > 0 ? `<div class="progress-bar" style="margin-top:12px"><div class="progress-fill${pct >= 100 ? ' over' : pct >= 80 ? ' warn' : ''}" style="width:${Math.min(pct, 100)}%"></div></div>
        <div style="font-size:11px;color:var(--text3);text-align:right;margin-top:4px">${Math.round(pct)}% funded</div>` : ''}
      </div>`;
    }).join('<div class="event-separator"></div>');
  };

  activeContainer.innerHTML = makeListHtml(activeEvents, 'active');
  historyContainer.innerHTML = makeListHtml(historyEvents, 'completed');
}

function navigateEventDetail(eventId) {
  currentEventId = eventId;
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-event-detail').classList.add('active');
  renderEventDetail();
}

function renderEventDetail() {
  const ev = dbGetEvents(currentUser.id).find(e => e.id === currentEventId);
  if (!ev) { navigateEvents(); return; }
  const items = dbGetEventItems(currentUser.id).filter(i => i.eventId === currentEventId);
  const totalPaid = items.reduce((s, i) => s + (i.amountPaid || 0), 0);
  const totalOwed = items.reduce((s, i) => s + Math.max(0, (i.totalCost || 0) - (i.amountPaid || 0)), 0);
  const budget = ev.estimatedBudget || items.reduce((s, i) => s + (i.totalCost || 0), 0);
  const pct = budget > 0 ? Math.min((totalPaid / budget) * 100, 100) : 0;

  document.getElementById('ev-detail-name').textContent = ev.name;
  document.getElementById('ev-detail-date').textContent = ev.targetDate
    ? `📅 ${new Date(ev.targetDate + 'T12:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`
    : '';

  const completeBtn = document.getElementById('ev-complete-btn');
  if (completeBtn) {
    completeBtn.style.display = ev.completed ? 'none' : 'block';
  }

  const sym = ev.currency || getCurrencySymbol();
  const curObj = CURRENCIES.find(c => c.symbol === sym);
  const curLabel = curObj ? `${curObj.flag} ${curObj.name} (${sym})` : sym;

  document.getElementById('ev-summary').innerHTML = `
    <div style="font-size:11px;color:var(--accent);margin-bottom:10px;font-weight:600">${curLabel}</div>
    <div class="ev-hero-stats">
      <div class="ev-hero-card paid">
        <div class="ev-hero-val green">${fmtEvent(totalPaid, sym)}</div>
        <div class="ev-hero-lbl">Paid</div>
      </div>
      ${totalOwed > 0 ? `<div class="ev-hero-card owed">
        <div class="ev-hero-val red">${fmtEvent(totalOwed, sym)}</div>
        <div class="ev-hero-lbl">Still Owed</div>
      </div>` : ''}
      ${budget > 0 ? `<div class="ev-hero-card budget">
        <div class="ev-hero-val accent">${fmtEvent(budget, sym)}</div>
        <div class="ev-hero-lbl">${ev.estimatedBudget ? 'Est. Budget' : 'Items Est.'}</div>
      </div>` : ''}
    </div>
    ${budget > 0 ? `
      <div class="progress-bar" style="margin:14px 0 4px">
        <div class="progress-fill${pct >= 100 ? ' over' : pct >= 80 ? ' warn' : ''}" style="width:${Math.min(pct, 100)}%"></div>
      </div>
      <div style="font-size:11px;color:var(--text3);text-align:right;margin-bottom:12px">${Math.round(pct)}% funded</div>
    ` : ''}
    ${!ev.completed ? `
      <button class="submit-btn" style="background:rgba(104,211,145,.1);color:var(--green);border:1px solid rgba(104,211,145,.25);margin-bottom:16px;font-size:13px;height:40px;display:flex;align-items:center;justify-content:center;gap:6px;width:100%" onclick="markEventComplete()">
        <svg fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" width="16" height="16"><polyline points="20 6 9 17 4 12"/></svg>
        Mark Event as Completed
      </button>
    ` : ''}`;

  document.getElementById('ev-items-list').innerHTML = items.length === 0
    ? `<div class="empty-state"><div class="empty-icon">📋</div><div class="empty-title">No expenses yet</div><div class="empty-sub">Tap "Add Expense" to start tracking</div></div>`
    : items.map((item, idx) => {
      const rem = item.totalCost > 0 ? Math.max(0, item.totalCost - (item.amountPaid || 0)) : 0;
      const ipct = item.totalCost > 0 ? Math.min(((item.amountPaid || 0) / item.totalCost) * 100, 100) : 0;
      const isPaid = item.totalCost > 0 && rem === 0;
      const statusClass = item.totalCost > 0 ? (isPaid ? 'paid' : 'owed') : '';
      return `<div class="ev-item-card ev-animate ${statusClass}" style="animation-delay: ${idx * 40}ms" onclick="openEditEventItem('${item.id}')">
          <div class="ev-item-row">
            <div class="ev-item-name">${item.name}</div>
            <div style="text-align:right;flex-shrink:0">
              <div style="font-size:15px;font-weight:600;font-family:var(--mono);color:var(--green)">${fmtEvent(item.amountPaid || 0, sym)}</div>
              ${item.totalCost > 0 ? `<div style="font-size:10px;color:var(--text3)">of ${fmtEvent(item.totalCost, sym)}</div>` : `<div style="font-size:10px;color:var(--text3)">paid</div>`}
            </div>
          </div>
          ${item.totalCost > 0 ? `
            <div class="progress-bar" style="margin:8px 0 5px">
              <div class="progress-fill${ipct >= 100 ? ' over' : ipct >= 80 ? ' warn' : ''}" style="width:${Math.min(ipct, 100)}%"></div>
            </div>
            ${rem > 0 ? `<div style="font-size:11px;color:var(--red)">⏳ ${fmtEvent(rem, sym)} remaining</div>`
            : `<div style="font-size:11px;color:var(--green)">✅ Fully paid</div>`}
          ` : ''}
          ${item.notes ? `<div style="font-size:11px;color:var(--text3);margin-top:6px">💬 ${item.notes}</div>` : ''}
        </div>`;
    }).join('');
}

// ─── Add / Edit Event ─────────────────────────────────
// Tracks the currency chosen in the event modal
let eventModalCurrency = null;

function _setEventCurrencyDisplay(sym) {
  eventModalCurrency = sym;
  const obj = CURRENCIES.find(c => c.symbol === sym);
  const label = obj ? `${obj.flag} ${obj.name} (${sym})` : sym;
  const el = document.getElementById('event-currency-display');
  if (el) el.textContent = label;
  const prefix = document.getElementById('event-budget-prefix');
  if (prefix) prefix.textContent = sym;
}

function openEventCurrencyPicker() {
  // Store context so currency-picker saves back to event modal
  window._eventCurrencyPickerMode = true;
  openCurrencyPicker();
}

function openAddEvent() {
  editingEventId = null;
  document.getElementById('input-event-name').value = '';
  document.getElementById('input-event-budget').value = '';
  document.getElementById('input-event-date').value = '';
  document.getElementById('modal-add-event').querySelector('.sheet-title').textContent = 'New Event';
  document.getElementById('ev-submit-btn').textContent = 'Create Event';
  document.getElementById('ev-delete-btn').style.display = 'none';
  // Default to the user's profile currency
  _setEventCurrencyDisplay(getCurrencySymbol());
  openModal('modal-add-event');
  setTimeout(() => document.getElementById('input-event-name').focus(), 350);
}

function openEditEvent() {
  const ev = dbGetEvents(currentUser.id).find(e => e.id === currentEventId);
  if (!ev) return;
  editingEventId = currentEventId;
  document.getElementById('input-event-name').value = ev.name;
  document.getElementById('input-event-budget').value = ev.estimatedBudget || '';
  document.getElementById('input-event-date').value = ev.targetDate || '';
  document.getElementById('modal-add-event').querySelector('.sheet-title').textContent = 'Edit Event';
  document.getElementById('ev-submit-btn').textContent = 'Save Changes';
  document.getElementById('ev-delete-btn').style.display = 'block';
  // Use the event's saved currency (fall back to profile currency)
  _setEventCurrencyDisplay(ev.currency || getCurrencySymbol());
  openModal('modal-add-event');
}

function submitEvent() {
  const name = document.getElementById('input-event-name').value.trim();
  if (!name) { showToast('Enter an event name'); return; }
  const budget = parseFloat(document.getElementById('input-event-budget').value) || 0;
  const targetDate = document.getElementById('input-event-date').value;
  const currency = eventModalCurrency || getCurrencySymbol();
  const event = { id: editingEventId || uid(), name, estimatedBudget: budget, targetDate, currency, createdAt: new Date().toISOString() };
  dbSaveEvent(currentUser.id, event);
  closeModal('modal-add-event');
  if (editingEventId) { renderEventDetail(); showToast('Event updated'); }
  else { addXP(5, 'event_created'); navigateEventDetail(event.id); showToast(`"${name}" created 🎉`); }
}

function deleteEvent() {
  const ev = dbGetEvents(currentUser.id).find(e => e.id === currentEventId);
  if (!ev || !confirm(`Delete "${ev.name}" and all its expenses?`)) return;
  dbDeleteEvent(currentUser.id, currentEventId);
  closeModal('modal-add-event');
  navigateEvents();
  showToast('Event deleted');
}

function markEventComplete() {
  const ev = dbGetEvents(currentUser.id).find(e => e.id === currentEventId);
  if (!ev) return;
  if (!confirm(`Mark "${ev.name}" as completed? It will move to history.`)) return;
  ev.completed = true;
  ev.completedAt = new Date().toISOString();
  dbSaveEvent(currentUser.id, ev);
  addXP(50, 'event_completed');
  navigateEvents();
  showToast('🎉 Event completed! +50 XP');
}

function deleteEventDirect(eventId, eventName) {
  if (!confirm(`Delete event "${eventName}" and all its expenses?`)) return;
  dbDeleteEvent(currentUser.id, eventId);
  renderEvents();
  renderProfile();
  showToast('Event deleted');
}

// ─── Add / Edit Event Item ────────────────────────────
function openAddEventItem() {
  editingEventItemId = null;
  ['input-ei-name', 'input-ei-paid', 'input-ei-total', 'input-ei-notes'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('modal-add-event-item').querySelector('.sheet-title').textContent = 'Add Expense';
  document.getElementById('ei-submit-btn').textContent = 'Add';
  document.getElementById('ei-delete-btn').style.display = 'none';
  openModal('modal-add-event-item');
  setTimeout(() => document.getElementById('input-ei-name').focus(), 350);
}

function openEditEventItem(itemId) {
  const item = dbGetEventItems(currentUser.id).find(i => i.id === itemId);
  if (!item) return;
  editingEventItemId = itemId;
  document.getElementById('input-ei-name').value = item.name;
  document.getElementById('input-ei-paid').value = item.amountPaid || '';
  document.getElementById('input-ei-total').value = item.totalCost || '';
  document.getElementById('input-ei-notes').value = item.notes || '';
  document.getElementById('modal-add-event-item').querySelector('.sheet-title').textContent = 'Edit Expense';
  document.getElementById('ei-submit-btn').textContent = 'Save';
  document.getElementById('ei-delete-btn').style.display = 'block';
  openModal('modal-add-event-item');
}

function submitEventItem() {
  const name = document.getElementById('input-ei-name').value.trim();
  if (!name) { showToast('Enter a name'); return; }
  const amountPaid = parseFloat(document.getElementById('input-ei-paid').value) || 0;
  const totalCost = parseFloat(document.getElementById('input-ei-total').value) || 0;
  const notes = document.getElementById('input-ei-notes').value.trim();
  const item = { id: editingEventItemId || uid(), eventId: currentEventId, name, amountPaid, totalCost, notes, updatedAt: new Date().toISOString() };
  dbSaveEventItem(currentUser.id, item);
  closeModal('modal-add-event-item');
  renderEventDetail();
  showToast(editingEventItemId ? 'Updated ✓' : `${name} added`);
}

function deleteEventItem() {
  const item = dbGetEventItems(currentUser.id).find(i => i.id === editingEventItemId);
  if (!item || !confirm(`Remove "${item.name}"?`)) return;
  dbDeleteEventItem(currentUser.id, editingEventItemId);
  closeModal('modal-add-event-item');
  renderEventDetail();
  showToast('Removed');
}

function togglePasswordVisibility() {
  const input = document.getElementById('auth-password');
  const toggle = document.getElementById('auth-password-toggle');
  if (!input || !toggle) return;
  const isPass = input.type === 'password';
  input.type = isPass ? 'text' : 'password';

  toggle.style.color = isPass ? 'var(--accent)' : 'var(--text3)';

  const line = toggle.querySelector('line');
  if (!isPass) {
    if (!line) {
      const newLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      newLine.setAttribute('x1', '2');
      newLine.setAttribute('y1', '2');
      newLine.setAttribute('x2', '22');
      newLine.setAttribute('y2', '22');
      newLine.setAttribute('stroke', 'currentColor');
      newLine.setAttribute('stroke-width', '2.2');
      newLine.setAttribute('stroke-linecap', 'round');
      toggle.querySelector('svg').appendChild(newLine);
    }
  } else {
    if (line) line.remove();
  }
}

function toggleNewPasswordVisibility() {
  const input = document.getElementById('input-new-password');
  const toggle = document.getElementById('new-password-toggle');
  if (!input || !toggle) return;
  const isPass = input.type === 'password';
  input.type = isPass ? 'text' : 'password';

  toggle.style.color = isPass ? 'var(--accent)' : 'var(--text3)';

  const line = toggle.querySelector('line');
  if (!isPass) {
    if (!line) {
      const newLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      newLine.setAttribute('x1', '2');
      newLine.setAttribute('y1', '2');
      newLine.setAttribute('x2', '22');
      newLine.setAttribute('y2', '22');
      newLine.setAttribute('stroke', 'currentColor');
      newLine.setAttribute('stroke-width', '2.2');
      newLine.setAttribute('stroke-linecap', 'round');
      toggle.querySelector('svg').appendChild(newLine);
    }
  } else {
    if (line) line.remove();
  }
}


// ═══════════════════════════════════════════════════════
// BILL SPLITTER MODULE
// ═══════════════════════════════════════════════════════
let bsItems = [];
let tesseractScriptLoaded = false;

function renderBillSplitter() {
  switchBillSplitterTab('groups');
  // Reset scanner UI
  document.getElementById('bs-scan-status').style.display = 'none';
  document.getElementById('bs-scanner-beam').style.display = 'none';
  document.getElementById('bs-link-box').style.display = 'none';

  // Set default payer values
  let defaultName = 'Me';
  if (appData.profile && appData.profile.name) {
    defaultName = appData.profile.name;
  } else if (currentUser && currentUser.email) {
    defaultName = currentUser.email.split('@')[0];
  }

  document.getElementById('bs-payer-name').value = defaultName;
  document.getElementById('bs-payer-upi').value = appData.profile?.upi || '';
  document.getElementById('bs-extra-charges').value = '';
  document.getElementById('bs-bill-name').value = 'Dinner Split';

  bsItems = [];
  renderBsItems();
}

function renderBsItems() {
  const container = document.getElementById('bs-items-list');
  if (bsItems.length === 0) {
    container.innerHTML = `<div style="text-align:center;padding:20px 0;color:var(--text3);font-size:12px">No items yet. Upload a receipt or add manually.</div>`;
    return;
  }

  container.innerHTML = bsItems.map((item, idx) => `
    <div class="bs-item-edit-row">
      <input class="form-input" type="text" placeholder="Item name" value="${item.name}" oninput="updateBsItemName(${idx}, this.value)">
      <div class="amount-wrap" style="width: 120px;">
        <span class="amount-prefix">₹</span>
        <input class="form-input with-prefix" type="number" placeholder="0.00" value="${item.price || ''}" step="any" inputmode="decimal" oninput="updateBsItemPrice(${idx}, this.value)">
      </div>
      <div class="bs-delete-btn" onclick="deleteBsItem(${idx})">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
      </div>
    </div>
  `).join('');
}

function addBsItem(name = '', price = '') {
  bsItems.push({ name, price: price ? parseFloat(price) : '' });
  renderBsItems();
}

function updateBsItemName(idx, val) {
  bsItems[idx].name = val;
}

function updateBsItemPrice(idx, val) {
  bsItems[idx].price = parseFloat(val) || 0;
}

function deleteBsItem(idx) {
  bsItems.splice(idx, 1);
  renderBsItems();
}

// Dynamic Tesseract Loader
function loadTesseractLibrary() {
  if (tesseractScriptLoaded) return Promise.resolve();
  return new Promise((resolve, reject) => {
    document.getElementById('bs-status-text').textContent = 'Downloading OCR Engine (Tesseract.js)...';
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
    script.onload = () => {
      tesseractScriptLoaded = true;
      resolve();
    };
    script.onerror = () => reject(new Error('Tesseract script failed to load'));
    document.head.appendChild(script);
  });
}

async function handleBillUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  // Show visual scanning beam
  const beam = document.getElementById('bs-scanner-beam');
  const statusDiv = document.getElementById('bs-scan-status');
  beam.style.display = 'block';
  statusDiv.style.display = 'block';

  try {
    await loadTesseractLibrary();
    document.getElementById('bs-status-text').textContent = 'Scanning receipt text (OCR running)...';

    const result = await Tesseract.recognize(file, 'eng', {
      logger: m => {
        if (m.status === 'recognizing text') {
          document.getElementById('bs-status-text').textContent = `Scanning: ${Math.round(m.progress * 100)}%`;
        }
      }
    });

    const parsed = parseReceiptText(result.data.text);
    if (parsed.items && parsed.items.length > 0) {
      bsItems = bsItems.concat(parsed.items);
      renderBsItems();

      if (parsed.companyName) {
        document.getElementById('bs-bill-name').value = parsed.companyName;
      }
      if (parsed.extraCharges > 0) {
        document.getElementById('bs-extra-charges').value = parsed.extraCharges;
      }

      showToast(`Extracted ${parsed.items.length} items successfully! 🧾`);
    } else {
      showToast('Could not extract items automatically. Please add manually or try another receipt.');
    }
  } catch (err) {
    console.error(err);
    showToast('OCR failed. Please add items manually.');
  } finally {
    beam.style.display = 'none';
    statusDiv.style.display = 'none';
  }
}

function simulateBillScan() {
  const beam = document.getElementById('bs-scanner-beam');
  const statusDiv = document.getElementById('bs-scan-status');
  beam.style.display = 'block';
  statusDiv.style.display = 'block';
  document.getElementById('bs-status-text').textContent = 'Initializing simulated OCR camera...';

  const mockItems = [
    { name: 'Margarita Pizza Large', price: 380 },
    { name: 'Double Cheese Burger', price: 180 },
    { name: 'Garlic Bread w/ Cheese', price: 120 },
    { name: 'Crispy French Fries', price: 90 },
    { name: 'Coca Cola Cans x2', price: 120 },
    { name: 'Hot Chocolate Fudge', price: 150 }
  ];

  let progress = 0;
  const interval = setInterval(() => {
    progress += 20;
    document.getElementById('bs-status-text').textContent = `Extracting items: ${progress}%`;
    if (progress >= 100) {
      clearInterval(interval);
      beam.style.display = 'none';
      statusDiv.style.display = 'none';
      bsItems = mockItems;
      renderBsItems();
      document.getElementById('bs-bill-name').value = 'Pizza Corner';
      document.getElementById('bs-extra-charges').value = 45;
      showToast('Extracted 6 items from demo receipt! 🧾');
    }
  }, 350);
}

function parseReceiptText(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const items = [];
  let companyName = '';
  let extraCharges = 0;
  let detectedTotal = 0;

  // 1. Try to find the company/merchant name at the very top (first 5 non-empty lines)
  for (let i = 0; i < Math.min(lines.length, 5); i++) {
    const line = lines[i];
    if (
      !/(\d{4}[-/]\d{2}[-/]\d{2})|(\d{2}[-/]\d{2}[-/]\d{4})/i.test(line) &&
      !/\d{10}/.test(line) &&
      !/@/.test(line) &&
      !/www\.|http/i.test(line) &&
      !/invoice|receipt|cashier|order|tax|date|tel|phone/i.test(line) &&
      /^[a-zA-Z\s'&.-]{3,35}$/.test(line)
    ) {
      companyName = line;
      break;
    }
  }

  // 2. Parse items and extra charges
  const priceRegex = /(?:rs\.?|inr|₹|usd|\$)?\s*(\d+(?:\.\d{1,2})?)\s*$/i;

  for (let line of lines) {
    line = line.replace(/^[*\s•-]+/, '').trim();
    if (!line) continue;

    // Filter out date, time, receipt ID metadata completely
    if (
      /(\d{4}[-/]\d{2}[-/]\d{2})|(\d{2}[-/]\d{2}[-/]\d{4})/i.test(line) ||
      /\b\d{2}:\d{2}(:\d{2})?\b/i.test(line) ||
      /invoice|receipt|order\s+#|cashier|terminal|auth\s+code|card|visa|mc|amex|merchant\s+id/i.test(line)
    ) {
      continue;
    }

    const match = line.match(priceRegex);
    if (match) {
      const priceVal = parseFloat(match[1]);
      let nameVal = line.replace(match[0], '').trim();
      nameVal = nameVal.replace(/[\s\.\:\-\=\+]+$/, '').trim();

      // Clean up quantity prefixes like "1x", "2 x", "3 ", "4pcs "
      nameVal = nameVal.replace(/^\d+\s*(?:x|pcs|qty)?\s+/i, '').trim();

      if (nameVal && priceVal > 0) {
        // Check if this is an extra charge line
        if (/tax|gst|cgst|sgst|vat|service\s+charge|delivery\s+fee|tip|surcharge/i.test(nameVal)) {
          extraCharges += priceVal;
        } else if (/total|grand\s+total|net\s+amount/i.test(nameVal)) {
          detectedTotal = priceVal;
        } else if (!/subtotal|discount/i.test(nameVal)) {
          // Normal item
          items.push({ name: nameVal, price: priceVal });
        }
      }
    }
  }

  return {
    items,
    companyName: companyName || 'Dinner Split',
    extraCharges: extraCharges > 0 ? parseFloat(extraCharges.toFixed(2)) : 0,
    total: detectedTotal
  };
}

function generateSplitLink() {
  const billName = document.getElementById('bs-bill-name').value.trim();
  const payerName = document.getElementById('bs-payer-name').value.trim();
  const upi = document.getElementById('bs-payer-upi').value.trim();
  const extra = parseFloat(document.getElementById('bs-extra-charges').value) || 0;

  if (!billName) { showToast('Please enter a bill name'); return; }
  if (!payerName) { showToast('Please enter your name'); return; }
  if (!upi) { showToast('Please enter your UPI ID'); return; }
  if (!upi.includes('@')) { showToast('Invalid UPI ID address format'); return; }

  const validItems = bsItems
    .filter(item => item.name.trim() !== '' && parseFloat(item.price) > 0)
    .map(item => ({ n: item.name.trim(), p: parseFloat(item.price) }));
  if (validItems.length === 0) { showToast('Please add at least one item'); return; }

  // Save UPI to Supabase profile
  if (!appData.profile) appData.profile = {};
  if (appData.profile.upi !== upi) {
    appData.profile.upi = upi;
    dbSaveProfile(currentUser.id, appData.profile).catch(console.error);
  }

  const billData = {
    n: billName,
    p: payerName,
    u: upi,
    t: extra,
    i: validItems,
    d: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  };

  try {
    const jsonStr = JSON.stringify(billData);
    const b64 = btoa(unescape(encodeURIComponent(jsonStr)));
    const shareUrl = window.location.origin + window.location.pathname + '#split-bill?b=' + b64;

    document.getElementById('bs-generated-url').textContent = shareUrl;
    document.getElementById('bs-link-box').style.display = 'block';
    document.getElementById('bs-link-box').scrollIntoView({ behavior: 'smooth' });
    showToast('Split link generated! 🔗');
  } catch (e) {
    console.error(e);
    showToast('Failed to generate link');
  }
}

function copyBsLink() {
  const urlText = document.getElementById('bs-generated-url').textContent;
  navigator.clipboard.writeText(urlText).then(() => {
    showToast('Link copied to clipboard! 📋');
  });
}

function shareBsLink() {
  const urlText = document.getElementById('bs-generated-url').textContent;
  const billName = document.getElementById('bs-bill-name').value.trim();

  if (navigator.share) {
    navigator.share({
      title: `Split Bill: ${billName}`,
      text: `Select your items from this receipt and pay your share directly:`,
      url: urlText
    }).catch(() => { });
  } else {
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent('Hi friends, please click the link to select your items and split the bill: ' + urlText)}`;
    window.open(whatsappUrl, '_blank');
  }
}

// ─────────────────────────────────────────────────────
// GUEST FLOW LOGIC
// ─────────────────────────────────────────────────────
let guestBillData = null;
let selectedItemIndices = new Set();

function handleSplitBillRouting() {
  const hash = window.location.hash;
  if (hash.startsWith('#split-bill')) {
    const query = hash.split('?')[1];
    if (query) {
      const params = new URLSearchParams(query);
      const billDataB64 = params.get('b');
      if (billDataB64) {
        try {
          const jsonStr = decodeURIComponent(escape(atob(billDataB64)));
          const billData = JSON.parse(jsonStr);

          // Render guest screen
          document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
          document.getElementById('screen-guest-split').classList.add('active');

          guestBillData = billData;
          selectedItemIndices.clear();

          document.getElementById('gs-payer-title').textContent = `${billData.p} shared a bill`;
          document.getElementById('gs-bill-title').textContent = billData.n;
          document.getElementById('gs-date-label').textContent = billData.d || '';

          // Render items grid
          const itemsContainer = document.getElementById('gs-items-container');
          itemsContainer.innerHTML = billData.i.map((item, idx) => `
            <div class="guest-item-card" id="gs-card-${idx}" onclick="toggleGuestItemSelection(${idx})">
              <div class="guest-item-card-left">
                <div class="guest-checkbox">
                  <div class="guest-checkbox-check"></div>
                </div>
                <div class="guest-item-name">${item.n}</div>
              </div>
              <div class="guest-item-price">₹${item.p.toFixed(2)}</div>
            </div>
          `).join('');

          document.getElementById('gs-guest-name').value = '';
          updateGuestTotals();

          // Reset pay buttons
          document.getElementById('gs-pay-confirm-btn').textContent = 'I Have Transferred the Money';
          document.getElementById('gs-pay-confirm-btn').style.background = 'var(--green-dim)';
          document.getElementById('gs-pay-confirm-btn').style.color = 'var(--green)';
          document.getElementById('gs-pay-confirm-btn').style.borderColor = 'var(--green)';
          document.getElementById('gs-pay-confirm-btn').disabled = false;

          return true;
        } catch (e) {
          console.error('Failed to parse guest bill data', e);
          showToast('Invalid split bill URL link ⚠️');
        }
      }
    }
  }
  return false;
}

function toggleGuestItemSelection(idx) {
  const card = document.getElementById(`gs-card-${idx}`);
  if (selectedItemIndices.has(idx)) {
    selectedItemIndices.delete(idx);
    card.classList.remove('selected');
  } else {
    selectedItemIndices.add(idx);
    card.classList.add('selected');
  }
  updateGuestTotals();
}

function updateGuestTotals() {
  if (!guestBillData) return;

  const subtotal = Array.from(selectedItemIndices).reduce((sum, idx) => sum + guestBillData.i[idx].p, 0);
  const totalBillItemsCost = guestBillData.i.reduce((sum, item) => sum + item.p, 0);

  // Proportionate tax/tip share
  let taxShare = 0;
  if (totalBillItemsCost > 0) {
    taxShare = (subtotal / totalBillItemsCost) * (guestBillData.t || 0);
  }

  const totalShare = subtotal + taxShare;

  document.getElementById('gs-items-cost').textContent = `₹${subtotal.toFixed(2)}`;
  document.getElementById('gs-tax-share').textContent = `₹${taxShare.toFixed(2)}`;
  document.getElementById('gs-share-total').textContent = totalShare.toFixed(2);

  const paySection = document.getElementById('gs-pay-section');
  const fallback = document.getElementById('gs-unselected-fallback');

  if (totalShare > 0) {
    paySection.style.display = 'block';
    fallback.style.display = 'none';

    // Generate UPI Payment Link
    // Format: upi://pay?pa=address@upi&pn=Payee%20Name&am=Amount&tn=Note&cu=INR
    const guestName = document.getElementById('gs-guest-name').value.trim() || 'Guest';
    const upiUri = `upi://pay?pa=${encodeURIComponent(guestBillData.u)}&pn=${encodeURIComponent(guestBillData.p)}&am=${totalShare.toFixed(2)}&tn=${encodeURIComponent('Split: ' + guestBillData.n + ' - ' + guestName)}&cu=INR`;

    document.getElementById('gs-upi-link').href = upiUri;
    document.getElementById('gs-qr-img').src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiUri)}`;
  } else {
    paySection.style.display = 'none';
    fallback.style.display = 'block';
  }
}

function copyGsSummary() {
  if (!guestBillData) return;
  const guestName = document.getElementById('gs-guest-name').value.trim() || 'Guest';
  const total = document.getElementById('gs-share-total').textContent;
  const selectedNames = Array.from(selectedItemIndices).map(idx => guestBillData.i[idx].n).join(', ');

  const msg = `Hi ${guestBillData.p}, I've split the bill "${guestBillData.n}" on Spendly. My share for: [${selectedNames}] is ₹${total}. Paid you via UPI! (From: ${guestName})`;

  navigator.clipboard.writeText(msg).then(() => {
    showToast('Payment confirmation text copied! 📋');
  });
}

function confirmGsPayment() {
  const btn = document.getElementById('gs-pay-confirm-btn');
  btn.textContent = 'Payment Notified ✅';
  btn.style.background = 'rgba(104,211,145,0.2)';
  btn.style.color = '#81e6d9';
  btn.style.borderColor = 'transparent';
  btn.disabled = true;
  showToast('Split payment transfer logged! Thank you.');
}

// ─────────────────────────────────────────────────────
// INVOICES VAULT SCREEN
// ─────────────────────────────────────────────────────
let invoicesList = [];
let selectedInvoiceFile = null;

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

async function renderInvoicesScreen() {
  if (!currentUser) {
    showToast('Please sign in to manage invoices');
    navigate('profile');
    return;
  }
  invoicesPage = 1;
  setSyncing('syncing');
  try {
    invoicesList = await dbGetInvoices(currentUser.id);
    renderInvoices();
    setSyncing('ok');
  } catch (e) {
    console.error('Failed to load invoices', e);
    setSyncing('error');
    // Gracefully fall back to empty list if table doesn't exist yet
    const isTableMissing = e && (e.code === '42P01' || (e.message && e.message.includes('does not exist')));
    if (isTableMissing) {
      invoicesList = [];
      renderInvoices();
      showToast('Invoices table not set up yet — see SUPABASE_SETUP.md');
    } else {
      showToast('Failed to load invoices: ' + (e.message || e));
    }
  }
}

function renderInvoices() {
  const query = document.getElementById('invoice-search-input').value.toLowerCase().trim();
  const listContainer = document.getElementById('invoice-list');
  if (!listContainer) return;

  // Filter
  const filtered = invoicesList.filter(inv => {
    return (inv.name && inv.name.toLowerCase().includes(query)) ||
      (inv.details && inv.details.toLowerCase().includes(query));
  });

  // Update badge count
  document.getElementById('invoice-count-label').textContent = `${filtered.length} Invoice${filtered.length === 1 ? '' : 's'}`;

  // Update profile settings badge if element exists
  const profileVal = document.getElementById('profile-invoices-val');
  if (profileVal) {
    profileVal.textContent = invoicesList.length > 0 ? `${invoicesList.length} invoice${invoicesList.length === 1 ? '' : 's'} stored` : 'Store & view your bills';
  }

  if (filtered.length === 0) {
    listContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📁</div>
        <div class="empty-title">No invoices found</div>
        <div class="empty-sub">${query ? 'Try searching another keyword' : 'Tap + to upload your first bill or invoice'}</div>
      </div>
    `;
    return;
  }

  const paginated = filtered.slice(0, invoicesPage * INVOICES_PAGE_SIZE);

  let html = paginated.map(inv => {
    const ext = inv.file_name.split('.').pop().toLowerCase();
    let icon = '📄';
    let colorClass = 'other';

    if (['png', 'jpg', 'jpeg', 'heic'].includes(ext)) {
      icon = '🖼️';
      colorClass = 'image';
    } else if (ext === 'pdf') {
      icon = '📕';
      colorClass = 'pdf';
    } else if (['xls', 'xlsx'].includes(ext)) {
      icon = '📗';
      colorClass = 'excel';
    } else if (['doc', 'docx'].includes(ext)) {
      icon = '📘';
      colorClass = 'word';
    }

    const dateStr = inv.date ? new Date(inv.date).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    }) : 'No Date';

    return `
      <div class="invoice-card" onclick="if(!event.target.closest('.delete')) window.open('${inv.file_url}', '_blank');" style="cursor: pointer;">
        <div class="invoice-icon-wrap ${colorClass}">
          <span style="font-size: 20px;">${icon}</span>
          <span class="invoice-ext-badge">${ext.toUpperCase()}</span>
        </div>
        <div class="invoice-info" style="flex: 1;">
          <div class="invoice-name">${escapeHtml(inv.name)}</div>
          <div class="invoice-date">${dateStr}</div>
          ${inv.details ? `<div class="invoice-details">${escapeHtml(inv.details)}</div>` : ''}
        </div>
        <div class="invoice-actions" style="margin-left: auto;">
          <button class="invoice-action-btn delete" onclick="event.stopPropagation(); deleteInvoiceById('${inv.id}', '${inv.file_name}')" title="Delete">
            <svg fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" width="16" height="16"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
          </button>
        </div>
      </div>
    `;
  }).join('');

  if (invoicesPage * INVOICES_PAGE_SIZE < filtered.length) {
    html += `
      <div style="padding: 16px; text-align: center;">
        <button onclick="loadMoreInvoices()" style="background:var(--surface2);color:var(--text);border:1px solid var(--border);border-radius:10px;padding:8px 24px;font-size:13px;font-weight:600;cursor:pointer;touch-action:manipulation">Load More</button>
      </div>`;
  }
  listContainer.innerHTML = html;
}

function loadMoreInvoices() {
  invoicesPage++;
  renderInvoices();
}

function openAddInvoiceModal() {
  document.getElementById('invoice-name-input').value = '';
  document.getElementById('invoice-date-input').value = new Date().toISOString().split('T')[0];
  document.getElementById('invoice-details-input').value = '';
  document.getElementById('invoice-file-input').value = '';
  document.getElementById('invoice-file-label').textContent = 'Tap to choose file';

  // Reset preview
  const previewContainer = document.getElementById('invoice-preview-container');
  if (previewContainer) previewContainer.style.display = 'none';
  const previewImg = document.getElementById('invoice-preview-img');
  if (previewImg) { previewImg.src = ''; previewImg.style.display = 'none'; }
  const previewInfo = document.getElementById('invoice-preview-fileinfo');
  if (previewInfo) previewInfo.textContent = '';

  selectedInvoiceFile = null;
  openModal('modal-add-invoice');
}

function handleInvoiceFileSelected(e) {
  const file = e.target.files[0];
  if (!file) return;
  selectedInvoiceFile = file;
  document.getElementById('invoice-file-label').textContent = file.name;

  // Show preview
  const previewContainer = document.getElementById('invoice-preview-container');
  const previewImg = document.getElementById('invoice-preview-img');
  const previewInfo = document.getElementById('invoice-preview-fileinfo');

  if (previewContainer) {
    previewContainer.style.display = 'block';

    // Check if it's an image
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      if (previewImg) {
        previewImg.src = url;
        previewImg.style.display = 'inline-block';
      }
      if (previewInfo) {
        previewInfo.innerHTML = `🖼️ <strong>Image selected</strong> (${(file.size / 1024).toFixed(1)} KB)`;
      }
    } else {
      if (previewImg) {
        previewImg.src = '';
        previewImg.style.display = 'none';
      }
      let icon = '📄';
      if (file.name.endsWith('.pdf')) icon = '📕';
      else if (file.name.endsWith('.xls') || file.name.endsWith('.xlsx')) icon = '📗';
      else if (file.name.endsWith('.doc') || file.name.endsWith('.docx')) icon = '📘';

      if (previewInfo) {
        previewInfo.innerHTML = `${icon} <strong>${file.name}</strong> (${(file.size / 1024).toFixed(1)} KB)`;
      }
    }
  }
}

async function submitInvoice() {
  const name = document.getElementById('invoice-name-input').value.trim();
  const date = document.getElementById('invoice-date-input').value;
  const details = document.getElementById('invoice-details-input').value.trim();

  if (!name) { showToast('Please enter an invoice name'); return; }
  if (!date) { showToast('Please choose a date'); return; }
  if (!selectedInvoiceFile) { showToast('Please select a file to upload'); return; }

  const submitBtn = document.getElementById('invoice-submit-btn');
  const submitText = document.getElementById('invoice-submit-text');
  submitBtn.disabled = true;
  submitText.textContent = 'Uploading file...';

  try {
    const uploadResult = await dbUploadInvoiceFile(currentUser.id, selectedInvoiceFile);
    await dbSaveInvoice(currentUser.id, {
      name,
      date,
      details,
      fileUrl: uploadResult.url,
      fileName: uploadResult.path,
      fileType: selectedInvoiceFile.type
    });

    closeModal('modal-add-invoice');
    showToast('Invoice uploaded successfully 🎉');
    await renderInvoicesScreen();
  } catch (err) {
    console.error('Invoice upload failed', err);
    if (err.message && err.message.includes('Bucket not found')) {
      showToast('Storage bucket missing — create "invoices" bucket in Supabase Storage settings');
    } else {
      showToast(`Upload failed: ${err.message}`);
    }
  } finally {
    submitBtn.disabled = false;
    submitText.textContent = 'Upload & Save';
  }
}

async function deleteInvoiceById(id, filePath) {
  if (!confirm('Are you sure you want to delete this invoice document?')) return;
  setSyncing('syncing');
  try {
    await dbDeleteInvoice(currentUser.id, id, filePath);
    showToast('Invoice deleted');
    await renderInvoicesScreen();
  } catch (e) {
    console.error(e);
    setSyncing('error');
    showToast('Failed to delete invoice');
  }
}

async function confirmDeleteAllInvoices() {
  if (invoicesList.length === 0) {
    showToast('No invoices to delete');
    return;
  }
  if (!confirm('🚨 WARNING: Are you sure you want to delete ALL invoices? This action cannot be undone and will delete all files permanently.')) return;

  setSyncing('syncing');
  try {
    await dbDeleteAllInvoices(currentUser.id);
    showToast('All invoices deleted successfully');
    await renderInvoicesScreen();
  } catch (e) {
    console.error(e);
    setSyncing('error');
    showToast('Failed to delete all invoices');
  }
}

// ─────────────────────────────────────────────────────
// GROUP TRIP SPLITTER INTERFACE AND ENGINE
// ─────────────────────────────────────────────────────
let activeTripsList = [];
let currentTripData = null;
let tripPendingMembers = []; // { user_id, username, display_name, email }
let tripSearchResult = null;  // last looked-up user from dbLookupByUsername

function switchBillSplitterTab(tab) {
  const tabGroups = document.getElementById('bs-tab-groups');
  const tabScan = document.getElementById('bs-tab-scan');
  const panelGroups = document.getElementById('bs-panel-groups');
  const panelScan = document.getElementById('bs-panel-scan');

  if (!tabGroups || !tabScan || !panelGroups || !panelScan) return;

  if (tab === 'groups') {
    tabGroups.classList.add('active');
    tabScan.classList.remove('active');
    panelGroups.style.display = 'block';
    panelScan.style.display = 'none';
    renderTripGroupsScreen();
  } else {
    tabScan.classList.add('active');
    tabGroups.classList.remove('active');
    panelScan.style.display = 'block';
    panelGroups.style.display = 'none';
  }
}

async function renderTripGroupsScreen() {
  if (!currentUser) {
    document.getElementById('trip-groups-list').innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">✈️</div>
        <div class="empty-title">Sign in required</div>
        <div class="empty-sub">Please sign in from the Profile page to manage shared Trip Splitter groups.</div>
      </div>
    `;
    return;
  }

  setSyncing('syncing');
  try {
    activeTripsList = await dbGetTrips(currentUser.id, currentUser.email);
    renderTripGroups();
    setSyncing('ok');
  } catch (e) {
    console.error('Failed to load trips', e);
    setSyncing('error');
  }
}

function renderTripGroups() {
  const container = document.getElementById('trip-groups-list');
  if (!container) return;

  if (activeTripsList.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="padding: 20px 0;">
        <div class="empty-icon">🏕️</div>
        <div class="empty-title">No trips yet</div>
        <div class="empty-sub">Tap "+ New Trip" to create your first shared group trip!</div>
      </div>
    `;
    return;
  }

  container.innerHTML = activeTripsList.map(trip => {
    const dateStr = new Date(trip.created_at).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    });

    return `
      <div class="settings-item" onclick="selectTrip('${trip.id}')" style="margin-bottom: 8px; border-radius: var(--r); background: var(--surface); border: 1px solid var(--border);">
        <div class="settings-left">
          <div class="settings-icon" style="background: rgba(183,148,244,.12); color: var(--purple);">✈️</div>
          <div>
            <div class="settings-label" style="font-weight:600;">${escapeHtml(trip.name)}</div>
            <div class="settings-val">Created ${dateStr}</div>
          </div>
        </div>
        <svg class="chevron" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
      </div>
    `;
  }).join('');
}

function openCreateTripModal() {
  if (!currentUser) {
    showToast('Please sign in first');
    return;
  }
  // Reset state
  tripPendingMembers = [];
  tripSearchResult = null;
  document.getElementById('trip-name-input').value = '';
  document.getElementById('trip-username-search').value = '';
  document.getElementById('trip-user-search-result').innerHTML = '';
  renderTripMemberChips();
  openModal('modal-create-trip');
}

let _tripSearchDebounce = null;

// ─────────────────────────────────────────────────────
// BUG 4 FIX: IMPROVED USERNAME SEARCH
// Note: dbLookupByUsernamePartial() function is defined in db.js
// ─────────────────────────────────────────────────────

async function searchTripUser() {
  clearTimeout(_tripSearchDebounce);
  const raw = document.getElementById('trip-username-search').value.trim();
  const resultEl = document.getElementById('trip-user-search-result');
  tripSearchResult = null;

  if (!raw || raw.replace(/^@/, '').length < 1) {
    resultEl.innerHTML = '';
    return;
  }

  _tripSearchDebounce = setTimeout(async () => {
    try {
      // Try exact username first
      let found = await dbLookupByUsername(raw);

      // If not found and input is short, try partial match
      if (!found && raw.replace(/^@/, '').length >= 2) {
        found = await dbLookupByUsernamePartial(raw);
      }

      if (!found) {
        resultEl.innerHTML = `<span style="color:var(--red)">❌ No user found for @${raw.replace(/^@/, '')}</span>`;
        tripSearchResult = null;
        return;
      }

      // Don't allow adding yourself
      if (found.id === currentUser.id) {
        resultEl.innerHTML = `<span style="color:var(--text3)">That's you — you're added automatically ✓</span>`;
        tripSearchResult = null;
        return;
      }

      // Don't allow duplicates
      if (tripPendingMembers.some(m => m.user_id === found.id)) {
        resultEl.innerHTML = `<span style="color:var(--text3)">@${found.username} is already added</span>`;
        tripSearchResult = null;
        return;
      }

      tripSearchResult = found;
      resultEl.innerHTML = `<span style="color:var(--green)">✓ Found: <strong>${escapeHtml(found.name || found.username)}</strong> (@${escapeHtml(found.username)}) — tap Add</span>`;
    } catch (e) {
      console.error('User search error:', e);
      resultEl.innerHTML = `<span style="color:var(--red)">Error looking up user: ${e.message}</span>`;
      tripSearchResult = null;
    }
  }, 350);
}

function addSearchedUser() {
  if (!tripSearchResult) {
    showToast('Search for a valid @username first');
    return;
  }
  tripPendingMembers.push({
    user_id: tripSearchResult.id,
    username: tripSearchResult.username,
    display_name: tripSearchResult.name || tripSearchResult.username,
    email: null
  });
  tripSearchResult = null;
  document.getElementById('trip-username-search').value = '';
  document.getElementById('trip-user-search-result').innerHTML = '';
  renderTripMemberChips();
}

function removeTripMember(userId) {
  tripPendingMembers = tripPendingMembers.filter(m => m.user_id !== userId);
  renderTripMemberChips();
}

function renderTripMemberChips() {
  const container = document.getElementById('trip-added-members');
  if (!container) return;
  if (tripPendingMembers.length === 0) {
    container.innerHTML = '';
    return;
  }
  container.innerHTML = tripPendingMembers.map(m => `
    <div style="display:inline-flex;align-items:center;gap:6px;background:var(--accent-dim);border:1px solid var(--accent);border-radius:20px;padding:4px 10px;font-size:12px;color:var(--accent)">
      <span>@${escapeHtml(m.username)}</span>
      <button onclick="removeTripMember('${m.user_id}')" style="background:none;border:none;color:var(--accent);cursor:pointer;font-size:13px;line-height:1;padding:0">&times;</button>
    </div>
  `).join('');
}

async function submitCreateTrip() {
  const name = document.getElementById('trip-name-input').value.trim();
  if (!name) { showToast('Please enter a trip name'); return; }

  // Build members array — always include self
  const selfMember = {
    user_id: currentUser.id,
    username: appData.profile?.username || null,
    display_name: appData.profile?.name || currentUser.email?.split('@')[0] || 'You',
    email: currentUser.email
  };
  const allMembers = [selfMember, ...tripPendingMembers];

  setSyncing('syncing');
  try {
    const group = await dbCreateTrip(currentUser.id, name, allMembers);

    // Send in-app notification to each invited member (not self)
    const notifMsg = `${selfMember.display_name} added you to a trip group: "${name}" ✈️`;
    for (const m of tripPendingMembers) {
      try {
        await dbSendNotification(m.user_id, 'trip_invite', notifMsg, { group_id: group.id, trip_name: name });
      } catch (ne) {
        console.warn('Failed to notify', m.username, ne);
      }
    }

    closeModal('modal-create-trip');
    showToast(`"${name}" created — ${tripPendingMembers.length} member(s) notified 🎉`);
    await selectTrip(group.id);
  } catch (e) {
    console.error(e);
    setSyncing('error');
    showToast('Failed to create trip group');
  }
}

async function selectTrip(groupId) {
  setSyncing('syncing');
  try {
    currentTripData = await dbGetTripDetails(groupId);

    document.getElementById('trip-groups-list-container').style.display = 'none';
    document.getElementById('trip-details-panel').style.display = 'block';

    document.getElementById('selected-trip-name').textContent = currentTripData.group.name;

    const deleteBtn = document.getElementById('trip-delete-btn');
    if (currentUser.id === currentTripData.group.created_by) {
      deleteBtn.style.display = 'block';
    } else {
      deleteBtn.style.display = 'none';
    }

    renderTripExpenses();
    calculateTripBalances();

    setSyncing('ok');
  } catch (e) {
    console.error('Failed to load trip details', e);
    setSyncing('error');
    showToast('Failed to load trip details');
  }
}

function closeTripDetails() {
  document.getElementById('trip-details-panel').style.display = 'none';
  document.getElementById('trip-groups-list-container').style.display = 'block';
  currentTripData = null;
  renderTripGroupsScreen();
}

function renderTripExpenses() {
  const container = document.getElementById('trip-expenses-list');
  if (!container) return;

  const expenses = currentTripData.expenses || [];
  if (expenses.length === 0) {
    container.innerHTML = `<div style="text-align:center;padding:12px;color:var(--text3);font-size:12px">No expenses logged yet.</div>`;
    return;
  }

  container.innerHTML = expenses.map(exp => {
    const dateStr = new Date(exp.date).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short'
    });
    // Resolve payer display name from members list
    const payerMember = (currentTripData.members || []).find(m => m.user_id === exp.paid_by);
    let payerName;
    if (exp.paid_by === currentUser.id) {
      payerName = 'You';
    } else if (payerMember) {
      payerName = payerMember.display_name || payerMember.username || payerMember.email?.split('@')[0] || exp.paid_by;
    } else {
      // Legacy fallback: paid_by was an email
      payerName = exp.paid_by.includes('@') ? exp.paid_by.split('@')[0] : exp.paid_by;
    }

    return `
      <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border)">
        <div style="min-width:0;flex:1;">
          <div style="font-size:13px;font-weight:600;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${escapeHtml(exp.description)}</div>
          <div style="font-size:11px;color:var(--text3);margin-top:2px">Paid by <strong>${escapeHtml(payerName)}</strong> · ${dateStr}</div>
        </div>
        <div style="display:flex;align-items:center;gap:10px">
          <span style="font-family:var(--mono);font-size:14px;font-weight:700;color:var(--text)">₹${parseFloat(exp.amount).toLocaleString('en-IN')}</span>
          <button onclick="deleteTripExpense('${exp.id}')" style="background:none;border:none;color:var(--text3);cursor:pointer;padding:4px;font-size:12px">✕</button>
        </div>
      </div>
    `;
  }).join('');
}

function openAddTripExpenseModal() {
  if (!currentTripData) return;
  document.getElementById('trip-exp-desc').value = '';
  document.getElementById('trip-exp-amount').value = '';
  document.getElementById('trip-exp-date').value = new Date().toISOString().split('T')[0];

  const select = document.getElementById('trip-exp-payer');
  select.innerHTML = (currentTripData.members || []).map(m => {
    const isMe = m.user_id === currentUser.id;
    const label = isMe ? 'You' : (m.display_name || m.username || m.email?.split('@')[0] || m.user_id);
    const tag = m.username ? ` (@${m.username})` : (m.email ? ` (${m.email.split('@')[0]})` : '');
    return `<option value="${m.user_id}">${label}${tag}</option>`;
  }).join('');

  openModal('modal-add-trip-expense');
}

async function submitTripExpense() {
  const desc = document.getElementById('trip-exp-desc').value.trim();
  const amt = parseFloat(document.getElementById('trip-exp-amount').value);
  const paidBy = document.getElementById('trip-exp-payer').value;
  const date = document.getElementById('trip-exp-date').value;

  if (!desc) { showToast('Please enter a description'); return; }
  if (isNaN(amt) || amt <= 0) { showToast('Please enter a valid amount'); return; }

  setSyncing('syncing');
  try {
    await dbAddTripExpense(currentTripData.group.id, desc, amt, paidBy, date);
    closeModal('modal-add-trip-expense');
    showToast('Trip expense added');
    await selectTrip(currentTripData.group.id);
  } catch (e) {
    console.error(e);
    setSyncing('error');
    showToast('Failed to add trip expense');
  }
}

async function deleteTripExpense(expenseId) {
  if (!confirm('Delete this expense?')) return;
  setSyncing('syncing');
  try {
    await dbDeleteTripExpense(expenseId);
    showToast('Expense deleted');
    await selectTrip(currentTripData.group.id);
  } catch (e) {
    console.error(e);
    setSyncing('error');
    showToast('Failed to delete expense');
  }
}

async function deleteCurrentTrip() {
  if (!confirm('🚨 Are you sure you want to delete this entire trip group? This deletes all group expenses and cannot be undone.')) return;
  setSyncing('syncing');
  try {
    await dbDeleteTripGroup(currentTripData.group.id);
    showToast('Trip group deleted');
    closeTripDetails();
  } catch (e) {
    console.error(e);
    setSyncing('error');
    showToast('Failed to delete trip');
  }
}

function calculateTripBalances() {
  const settlementsContainer = document.getElementById('trip-settlements-list');
  if (!settlementsContainer) return;

  const members = currentTripData.members || [];
  const expenses = currentTripData.expenses || [];

  if (members.length === 0) {
    settlementsContainer.innerHTML = '';
    return;
  }

  // Key balances by user_id (or email for legacy)
  const memberKey = m => m.user_id || m.email;
  const memberLabel = m => {
    if (m.user_id === currentUser.id) return 'You';
    return m.display_name || m.username || m.email?.split('@')[0] || m.user_id;
  };

  const balances = {};
  members.forEach(m => {
    balances[memberKey(m)] = 0;
  });

  const totalSpent = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
  const sharePerPerson = totalSpent / members.length;

  expenses.forEach(exp => {
    // paid_by is now user_id; support legacy email fallback
    const key = exp.paid_by;
    if (balances[key] !== undefined) {
      balances[key] += parseFloat(exp.amount);
    } else {
      // Legacy: paid_by was email — find matching member
      const legacyMember = members.find(m => m.email === exp.paid_by);
      if (legacyMember) balances[memberKey(legacyMember)] += parseFloat(exp.amount);
    }
  });

  members.forEach(m => {
    balances[memberKey(m)] -= sharePerPerson;
  });

  const debtors = [];
  const creditors = [];

  Object.keys(balances).forEach(key => {
    const bal = balances[key];
    const member = members.find(m => memberKey(m) === key);
    if (bal < -0.01) {
      debtors.push({ key, label: member ? memberLabel(member) : key, amount: -bal });
    } else if (bal > 0.01) {
      creditors.push({ key, label: member ? memberLabel(member) : key, amount: bal });
    }
  });

  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const transactions = [];
  let dIdx = 0;
  let cIdx = 0;

  while (dIdx < debtors.length && cIdx < creditors.length) {
    const debtor = debtors[dIdx];
    const creditor = creditors[cIdx];
    const amount = Math.min(debtor.amount, creditor.amount);

    transactions.push({
      key: debtor.key,
      label: debtor.label,
      toKey: creditor.key,
      toLabel: creditor.label,
      amount: amount
    });

    debtor.amount -= amount;
    creditor.amount -= amount;

    if (debtor.amount < 0.01) dIdx++;
    if (creditor.amount < 0.01) cIdx++;
  }

  let html = `
    <div style="font-size:12px;color:var(--text2);margin-bottom:12px">
      Total trip spent: <strong>₹${totalSpent.toLocaleString('en-IN')}</strong> · Share per person: <strong>₹${Math.round(sharePerPerson).toLocaleString('en-IN')}</strong>
    </div>
  `;

  const myKey = currentUser.id;
  const myBal = balances[myKey] || 0;
  if (myBal > 0.01) {
    html += `<div style="background:rgba(104,211,145,.1);color:var(--green);padding:10px;border-radius:10px;font-size:12px;font-weight:600;margin-bottom:12px;display:flex;justify-content:space-between"><span>You are owed:</span> <span>₹${myBal.toFixed(2)}</span></div>`;
  } else if (myBal < -0.01) {
    html += `<div style="background:rgba(252,129,129,.1);color:var(--red);padding:10px;border-radius:10px;font-size:12px;font-weight:600;margin-bottom:12px;display:flex;justify-content:space-between"><span>You owe:</span> <span>₹${Math.abs(myBal).toFixed(2)}</span></div>`;
  } else {
    html += `<div style="background:var(--surface2);color:var(--text3);padding:10px;border-radius:10px;font-size:12px;margin-bottom:12px;text-align:center">You are all settled! 🤝</div>`;
  }

  if (transactions.length === 0) {
    html += `<div style="font-size:12px;color:var(--text3);text-align:center;padding:10px 0">No settlements needed.</div>`;
  } else {
    html += `
      <div style="font-size:11px;text-transform:uppercase;color:var(--text3);margin-bottom:6px;font-weight:600">Suggested Payments</div>
      <div style="display:flex;flex-direction:column;gap:8px">
    `;

    html += transactions.map(tx => {
      const fromName = tx.label || (tx.key === currentUser.id ? 'You' : tx.key);
      const toName = tx.toLabel || (tx.toKey === currentUser.id ? 'You' : tx.toKey);

      return `
        <div style="display:flex;justify-content:space-between;align-items:center;font-size:12px;background:var(--surface2);padding:8px 12px;border-radius:8px">
          <div>
            <strong>${escapeHtml(fromName)}</strong> owes <strong>${escapeHtml(toName)}</strong>
          </div>
          <span style="font-family:var(--mono);font-weight:700;color:var(--accent)">₹${Math.round(tx.amount).toLocaleString('en-IN')}</span>
        </div>
      `;
    }).join('');

    html += `</div>`;
  }

  settlementsContainer.innerHTML = html;
}

// ─────────────────────────────────────────────────────
// NOTIFICATIONS & OFFLINE SYNC
// ─────────────────────────────────────────────────────

async function openNotifications() {
  if (!currentUser) {
    showToast('Please sign in to view notifications');
    return;
  }
  notificationsPage = 1;
  openModal('modal-notifications');
  setSyncing('syncing');
  try {
    notificationsList = await dbGetNotifications(currentUser.id);
    renderNotifications();
    setSyncing('ok');
    await dbMarkAllNotifsRead(currentUser.id);
    updateNotifBellCount();
  } catch (e) {
    console.error('Failed to load notifications', e);
    setSyncing('error');
    notificationsList = [];
    renderNotifications();
  }
}

function renderNotifications() {
  const container = document.getElementById('notifications-list');
  if (!container) return;

  const paginated = notificationsList.slice(0, notificationsPage * NOTIFICATIONS_PAGE_SIZE);

  if (!paginated.length) {
    container.innerHTML = `<div style="text-align:center;color:var(--text3);font-size:14px;padding:32px 0 16px"><div style="font-size:28px;margin-bottom:8px">🔔</div>No notifications yet</div>`;
    return;
  }

  let html = paginated.map(notif => {
    const isUnread = !notif.is_read;
    const dateStr = new Date(notif.created_at).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
    });
    return `
      <div style="background:${isUnread ? 'rgba(79,209,197,0.06)' : 'var(--surface2)'};border:1px solid ${isUnread ? 'rgba(79,209,197,0.2)' : 'var(--border)'};border-radius:12px;padding:12px;display:flex;flex-direction:column;gap:4px;position:relative">
        ${isUnread ? `<div style="position:absolute;top:12px;right:12px;width:6px;height:6px;background:var(--accent);border-radius:50%"></div>` : ''}
        <div style="font-size:13px;color:var(--text);padding-right:12px">${escapeHtml(notif.message)}</div>
        <div style="font-size:10px;color:var(--text3)">${dateStr}</div>
      </div>
    `;
  }).join('');

  if (notificationsPage * NOTIFICATIONS_PAGE_SIZE < notificationsList.length) {
    html += `
      <div style="padding: 12px 0 0; text-align: center;">
        <button onclick="loadMoreNotifications()" style="width:100%;background:var(--surface2);color:var(--text);border:1px solid var(--border);border-radius:10px;padding:10px;font-size:13px;font-weight:600;cursor:pointer;touch-action:manipulation">Load More</button>
      </div>`;
  }

  container.innerHTML = html;
}

function loadMoreNotifications() {
  notificationsPage++;
  renderNotifications();
}

async function markAllNotifsRead() {
  if (!currentUser) return;
  try {
    await dbMarkAllNotifsRead(currentUser.id);
    notificationsList.forEach(n => n.is_read = true);
    renderNotifications();
    updateNotifBellCount();
    showToast('All notifications marked as read');
  } catch (e) {
    console.error('Failed to mark all read', e);
  }
}

async function updateNotifBellCount() {
  if (!currentUser) return;
  try {
    const unread = await dbCountUnreadNotifs(currentUser.id);
    const badge = document.getElementById('notif-badge');
    if (badge) {
      if (unread > 0) {
        badge.style.display = 'block';
        badge.textContent = unread > 9 ? '9+' : unread;
      } else {
        badge.style.display = 'none';
      }
    }
  } catch (e) {
    console.error('Failed to count unread notifications', e);
  }
}

function saveAppDataLocally() {
  if (currentUser) {
    localStorage.setItem(`spendly_appdata_${currentUser.id}`, JSON.stringify(appData));
  }
}

function loadAppDataLocally() {
  if (currentUser) {
    const raw = localStorage.getItem(`spendly_appdata_${currentUser.id}`);
    if (raw) {
      try {
        appData = JSON.parse(raw);
        return true;
      } catch (e) { }
    }
  }
  return false;
}

async function syncPendingTransactions() {
  if (isSyncingPending) return;
  if (!navigator.onLine || !currentUser) return;
  const pendingKey = `spendly_pending_tx_${currentUser.id}`;
  let pending = [];
  try {
    const raw = localStorage.getItem(pendingKey);
    if (raw) pending = JSON.parse(raw);
  } catch (e) {
    console.error("Failed to parse pending transactions", e);
  }
  if (!pending.length) return;

  isSyncingPending = true;
  setSyncing('syncing');

  let successCount = 0;
  let failed = [];

  for (const tx of pending) {
    try {
      await dbBulkInsertTransactions(currentUser.id, [tx]);
      successCount++;
    } catch (e) {
      if (e.code === '23505') {
        successCount++;
      } else {
        console.error("Failed to sync transaction", tx.id, e);
        failed.push(tx);
      }
    }
  }

  if (failed.length > 0) {
    localStorage.setItem(pendingKey, JSON.stringify(failed));
    setSyncing('error');
  } else {
    localStorage.removeItem(pendingKey);
    setSyncing('ok');
    showToast(`Synced ${successCount} offline transaction(s)`);
  }
  isSyncingPending = false;
}

window.addEventListener('online', () => {
  showToast('Connection restored. Syncing...');
  syncPendingTransactions();
});
window.addEventListener('offline', () => {
  showToast('You are offline. Transactions will be saved locally.');
});