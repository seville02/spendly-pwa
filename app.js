// ═══════════════════════════════════════════════════════
// app.js — Spendly v4
// ═══════════════════════════════════════════════════════

const CATEGORIES = [
  {id:'Food',icon:'🍽️',color:'#f6ad55'},{id:'Groceries',icon:'🛒',color:'#68d391'},
  {id:'Transport',icon:'🚌',color:'#63b3ed'},{id:'Fuel',icon:'⛽',color:'#e8a030'},
  {id:'Shopping',icon:'🛍️',color:'#f687b3'},{id:'Health',icon:'💊',color:'#48bb78'},
  {id:'Doctor',icon:'🏥',color:'#fc8181'},{id:'Fitness',icon:'🏃',color:'#4fd1c5'},
  {id:'Entertainment',icon:'🎮',color:'#b794f4'},{id:'Movies',icon:'🎬',color:'#9f7aea'},
  {id:'Dining Out',icon:'🍕',color:'#ed8936'},{id:'Coffee',icon:'☕',color:'#b07d50'},
  {id:'Utilities',icon:'💡',color:'#4fd1c5'},{id:'Rent',icon:'🏠',color:'#fc8181'},
  {id:'Education',icon:'📚',color:'#76e4f7'},{id:'Subscriptions',icon:'📱',color:'#b794f4'},
  {id:'Travel',icon:'✈️',color:'#63b3ed'},{id:'Hotel',icon:'🏨',color:'#f687b3'},
  {id:'EMI / Loan',icon:'🏦',color:'#fc8181'},{id:'Insurance',icon:'🛡️',color:'#4299e1'},
  {id:'Gifts',icon:'🎁',color:'#f687b3'},{id:'Savings',icon:'💰',color:'#68d391'},
  {id:'Investment',icon:'📈',color:'#4fd1c5'},{id:'Other',icon:'📌',color:'#8896b3'},
];

const CURRENCIES = [
  {code:'INR', symbol:'₹',   name:'Indian Rupee',         flag:'🇮🇳'},
  {code:'USD', symbol:'$',   name:'US Dollar',             flag:'🇺🇸'},
  {code:'EUR', symbol:'€',   name:'Euro',                  flag:'🇪🇺'},
  {code:'GBP', symbol:'£',   name:'British Pound',         flag:'🇬🇧'},
  {code:'AED', symbol:'د.إ', name:'UAE Dirham',            flag:'🇦🇪'},
  {code:'SAR', symbol:'﷼',  name:'Saudi Riyal',           flag:'🇸🇦'},
  {code:'QAR', symbol:'﷼',  name:'Qatari Riyal',          flag:'🇶🇦'},
  {code:'KWD', symbol:'KD',  name:'Kuwaiti Dinar',         flag:'🇰🇼'},
  {code:'SGD', symbol:'S$',  name:'Singapore Dollar',      flag:'🇸🇬'},
  {code:'MYR', symbol:'RM',  name:'Malaysian Ringgit',     flag:'🇲🇾'},
  {code:'AUD', symbol:'A$',  name:'Australian Dollar',     flag:'🇦🇺'},
  {code:'CAD', symbol:'C$',  name:'Canadian Dollar',       flag:'🇨🇦'},
  {code:'HKD', symbol:'HK$', name:'Hong Kong Dollar',      flag:'🇭🇰'},
  {code:'TWD', symbol:'NT$', name:'New Taiwan Dollar',     flag:'🇹🇼'},
  {code:'JPY', symbol:'¥',   name:'Japanese Yen',          flag:'🇯🇵'},
  {code:'CNY', symbol:'¥',   name:'Chinese Yuan',          flag:'🇨🇳'},
  {code:'KRW', symbol:'₩',   name:'South Korean Won',      flag:'🇰🇷'},
  {code:'THB', symbol:'฿',   name:'Thai Baht',             flag:'🇹🇭'},
  {code:'IDR', symbol:'Rp',  name:'Indonesian Rupiah',     flag:'🇮🇩'},
  {code:'PHP', symbol:'₱',   name:'Philippine Peso',       flag:'🇵🇭'},
  {code:'PKR', symbol:'₨',   name:'Pakistani Rupee',       flag:'🇵🇰'},
  {code:'BDT', symbol:'৳',   name:'Bangladeshi Taka',      flag:'🇧🇩'},
  {code:'LKR', symbol:'Rs',  name:'Sri Lankan Rupee',      flag:'🇱🇰'},
  {code:'NPR', symbol:'रू', name:'Nepalese Rupee',         flag:'🇳🇵'},
  {code:'BRL', symbol:'R$',  name:'Brazilian Real',        flag:'🇧🇷'},
  {code:'MXN', symbol:'MX$', name:'Mexican Peso',          flag:'🇲🇽'},
  {code:'ZAR', symbol:'R',   name:'South African Rand',    flag:'🇿🇦'},
  {code:'NGN', symbol:'₦',   name:'Nigerian Naira',        flag:'🇳🇬'},
  {code:'EGP', symbol:'E£',  name:'Egyptian Pound',        flag:'🇪🇬'},
  {code:'TRY', symbol:'₺',   name:'Turkish Lira',          flag:'🇹🇷'},
  {code:'RUB', symbol:'₽',   name:'Russian Ruble',         flag:'🇷🇺'},
  {code:'CHF', symbol:'Fr',  name:'Swiss Franc',           flag:'🇨🇭'},
  {code:'SEK', symbol:'kr',  name:'Swedish Krona',         flag:'🇸🇪'},
  {code:'NOK', symbol:'kr',  name:'Norwegian Krone',       flag:'🇳🇴'},
  {code:'DKK', symbol:'kr',  name:'Danish Krone',          flag:'🇩🇰'},
];

// ─────────────────────────────────────────────────────
// STATE
// ─────────────────────────────────────────────────────
let currentUser   = null;
let appData       = { transactions:[], budgets:{}, catBudgets:{}, debts:[], profile:{} };
let localSettings = { theme:'dark', pinEnabled:false, pinHash:'', currency:'₹', summaryDismissed:'' };
let editingTxId   = null;

let viewYear      = new Date().getFullYear();
let viewMonth     = new Date().getMonth();
let selectedType  = 'expense';
let selectedCat   = 'Food';
let filterCategory= 'all';
let filterTimeScope= 'month';
let activeStatsTab= 'overview';
let debtType          = 'owe';
let charts            = { donut:null, bar:null, line:null, compare:null };
let currentEventId    = null;
let editingEventId    = null;
let editingEventItemId= null;
let activeHeroTab     = 'budget';

const MONTHS      = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const MONTHS_FULL = ['January','February','March','April','May','June','July','August','September','October','November','December'];

// Settings live in localStorage (device-specific, not synced)
function getLocalSettings() {
  try { return JSON.parse(localStorage.getItem('spendly_settings')||'{}'); } catch(e) { return {}; }
}
function saveLocalSettings(s) { localStorage.setItem('spendly_settings', JSON.stringify(s)); }

// ─────────────────────────────────────────────────────
// CURRENCY — dynamic detection
// ─────────────────────────────────────────────────────
function detectCurrency() {
  const saved = localSettings.currency;
  if (saved && saved !== '₹') return saved; // user overrode
  try {
    const locale = navigator.language || 'en-IN';
    const fmt = new Intl.NumberFormat(locale, { style:'currency', currency: getCurrencyCode(locale), minimumFractionDigits:0 });
    const parts = fmt.formatToParts(0);
    const sym = parts.find(p => p.type === 'currency');
    return sym ? sym.value : '₹';
  } catch(e) { return '₹'; }
}
function getCurrencyCode(locale) {
  const map = {
    'en-IN':'INR','hi':'INR','en-US':'USD','en-GB':'GBP','en-AU':'AUD',
    'de':'EUR','fr':'EUR','es':'EUR','it':'EUR','ja':'JPY','zh':'CNY',
    'ko':'KRW','pt-BR':'BRL','en-SG':'SGD','en-AE':'AED','en-CA':'CAD',
  };
  return map[locale] || map[locale.split('-')[0]] || 'INR';
}
function getCurrencySymbol() { return localSettings.currency || detectCurrency(); }

// ─────────────────────────────────────────────────────
// FORMATTERS
// ─────────────────────────────────────────────────────
function monthKey(y,m)  { return `${y}-${String(m+1).padStart(2,'0')}`; }
function currentKey()   { return monthKey(viewYear, viewMonth); }
function getMonthLabel(){ return `${MONTHS[viewMonth]} ${viewYear}`; }
function getResetMonthLabel(){ return `${MONTHS[viewMonth + 1]} ${viewYear}`; }

function updateMonthLabels() {
  const l = getMonthLabel();
  ['nav-month-label','nav-month-label-2','nav-month-label-3'].forEach(id => {
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
    return sym + (v % 1 === 0 ? v.toFixed(0) : v.toFixed(1)) + 'L';
  }
  if (n >= 1000) {
    const v = n / 1000;
    return sym + (v % 1 === 0 ? v.toFixed(0) : v.toFixed(1)) + 'K';
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
function uid() { return Date.now().toString(36)+Math.random().toString(36).slice(2); }
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

function switchHeroTab(tab) {
  activeHeroTab = tab;
  const tabBudget = document.getElementById('hero-tab-budget');
  const tabWallet = document.getElementById('hero-tab-wallet');
  if (tabBudget) tabBudget.className = 'hero-toggle-tab' + (tab === 'budget' ? ' active' : '');
  if (tabWallet) tabWallet.className = 'hero-toggle-tab' + (tab === 'wallet' ? ' active' : '');
  renderHome();
}

function hashPin(p) {
  let h=0; for(let i=0;i<p.length;i++){h=((h<<5)-h)+p.charCodeAt(i);h|=0;} return h.toString(36);
}

// ─────────────────────────────────────────────────────
// SYNC INDICATOR
// ─────────────────────────────────────────────────────
function setSyncing(state) { // 'syncing' | 'error' | 'ok'
  const el = document.getElementById('sync-indicator');
  if (!el) return;
  el.className = 'sync-indicator' + (state==='ok' ? '' : ' '+state);
}

// ─────────────────────────────────────────────────────
// THEME
// ─────────────────────────────────────────────────────
function applyTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
  document.getElementById('theme-meta').setAttribute('content', t==='light' ? '#f0f4f8' : '#0a0f1e');
}
function toggleTheme() {
  const s = getLocalSettings();
  const t = s.theme === 'dark' ? 'light' : 'dark';
  s.theme = t; saveLocalSettings(s); localSettings = s; applyTheme(t);
  showToast(t==='light' ? 'Light mode ☀️' : 'Dark mode 🌙');
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
function pinDel() { pinBuffer = pinBuffer.slice(0,-1); updatePinDots('pd', pinBuffer.length, false); }
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
  for (let i=0;i<4;i++) {
    const el = document.getElementById(prefix+i); if (!el) return;
    el.classList.toggle('filled', i<count);
    el.classList.toggle('error', error && i<count);
  }
}
function openPinSetup() {
  const s = getLocalSettings();
  setupBuffer=''; setupStep=0; setupFirst='';
  updatePinDots('spd', 0, false);
  document.getElementById('pin-setup-error').textContent='';
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
function setupPinDel() { setupBuffer=setupBuffer.slice(0,-1); updatePinDots('spd', setupBuffer.length, false); }
function processSetupPin() {
  if (setupStep === 0) {
    setupFirst=setupBuffer; setupBuffer=''; setupStep=1;
    updatePinDots('spd',0,false);
    document.getElementById('pin-modal-sub').textContent='Confirm your PIN';
  } else {
    if (setupBuffer === setupFirst) {
      const s=getLocalSettings(); s.pinEnabled=true; s.pinHash=hashPin(setupBuffer);
      saveLocalSettings(s); localSettings=s;
      closeModal('modal-pin'); resetSetupPin(); renderProfile(); showToast('PIN lock enabled 🔒');
    } else {
      updatePinDots('spd',4,true);
      document.getElementById('pin-setup-error').textContent="PINs don't match";
      setTimeout(()=>{setupBuffer='';setupStep=0;setupFirst='';updatePinDots('spd',0,false);document.getElementById('pin-setup-error').textContent='';document.getElementById('pin-modal-sub').textContent='Choose a 4-digit PIN';},1000);
    }
  }
}
function disablePin() {
  if (!confirm('Disable PIN lock?')) return;
  const s=getLocalSettings(); s.pinEnabled=false; s.pinHash=''; saveLocalSettings(s); localSettings=s;
  closeModal('modal-pin'); resetSetupPin(); renderProfile(); showToast('PIN lock disabled');
}
function resetSetupPin() { setupBuffer='';setupStep=0;setupFirst='';updatePinDots('spd',0,false); }

// ─────────────────────────────────────────────────────
// AUTH SCREEN
// ─────────────────────────────────────────────────────
let authMode = 'signin'; // 'signin' | 'signup'

function showAuthScreen() {
  document.getElementById('auth-screen').classList.add('show');
}
function hideAuthScreen() {
  document.getElementById('auth-screen').classList.remove('show');
}
function setAuthTab(mode) {
  authMode = mode;
  const isForgot = mode === 'forgot';
  
  document.getElementById('auth-tab-signin').className = 'auth-tab'+(mode==='signin'?' active':'');
  document.getElementById('auth-tab-signup').className = 'auth-tab'+(mode==='signup'?' active':'');
  document.getElementById('auth-tabs-container').style.display = isForgot ? 'none' : 'flex';
  document.getElementById('auth-back-link').style.display = isForgot ? 'block' : 'none';
  
  document.getElementById('auth-name-wrap').style.display = mode==='signup' ? 'block' : 'none';
  document.getElementById('auth-password').style.display = isForgot ? 'none' : 'block';
  document.getElementById('auth-forgot-link').style.display = mode==='signin' ? 'block' : 'none';
  
  document.getElementById('auth-btn').textContent = isForgot ? 'Send Reset Link' : mode==='signup' ? 'Create Account' : 'Sign In';
  document.getElementById('auth-title').textContent = isForgot ? 'Reset Password' : mode==='signup' ? 'Create account' : 'Welcome back';
  document.getElementById('auth-sub').textContent = isForgot ? 'Enter your email to receive a reset link' : mode==='signup' ? 'Start tracking your money' : 'Sign in to your Spendly account';
  document.getElementById('auth-error').textContent = '';
}

async function handleAuth() {
  const email = document.getElementById('auth-email').value.trim();
  const password = document.getElementById('auth-password').value;
  const name = document.getElementById('auth-name').value.trim();
  const btn = document.getElementById('auth-btn');
  const errEl = document.getElementById('auth-error');

  if (authMode === 'forgot') {
    if (!email) { errEl.textContent='Enter your email address'; return; }
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
    } catch(e) {
      errEl.textContent = e.message;
      btn.disabled = false;
      btn.textContent = 'Send Reset Link';
    }
    return;
  }

  if (!email || !password) { errEl.textContent='Enter email and password'; return; }
  if (authMode==='signup' && password.length<6) { errEl.textContent='Password must be at least 6 characters'; return; }

  btn.disabled = true;
  btn.textContent = authMode==='signup' ? 'Creating...' : 'Signing in...';
  errEl.textContent = '';

  try {
    if (authMode==='signup') {
      await dbSignUp(email, password, name);
      // Auto sign in after signup
      await dbSignIn(email, password);
    } else {
      await dbSignIn(email, password);
    }
    // onAuthChange will handle the rest
  } catch(e) {
    errEl.textContent = friendlyAuthError(e.message);
    btn.disabled = false;
    btn.textContent = authMode==='signup' ? 'Create Account' : 'Sign In';
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
  appData = { transactions:[], budgets:{}, catBudgets:{}, debts:[], profile:{} };
  showAuthScreen();
  navigate('home');
  showToast('Signed out');
}

async function clearAllTransactions() {
  if (!confirm('⚠️ Delete ALL transactions?\n\nThis will permanently delete your entire transaction history. Your budgets, category limits, debts, and profile settings will be kept.')) return;
  if (!confirm('Are you absolutely sure? This cannot be undone.')) return;
  setSyncing('syncing');
  try {
    if (useLocalDB) {
      const cached = localStorage.getItem(`spendly_data_local-user`);
      if (cached) {
        const data = JSON.parse(cached);
        data.transactions = [];
        localStorage.setItem(`spendly_data_local-user`, JSON.stringify(data));
      }
    } else {
      await _sb.from('transactions').delete().eq('user_id', currentUser.id);
    }
    setSyncing('ok');
  } catch(e) {
    setSyncing('error');
    showToast('Sync error — transactions deleted locally');
  }
  appData.transactions = [];
  renderHome();
  const active = document.querySelector('.screen.active');
  if (active && active.id === 'screen-transactions') renderTransactions();
  if (active && active.id === 'screen-stats') renderStats();
  showToast('All transactions deleted 🗑️');
}

async function clearAllData() {
  if (!confirm('⚠️ Clear ALL data?\n\nThis will permanently delete all your transactions, budgets, and debts.\n\nYour profile settings will be kept.')) return;
  if (!confirm('Are you absolutely sure? This cannot be undone.')) return;
  setSyncing('syncing');
  try {
    await dbClearAllData(currentUser.id);
    setSyncing('ok');
  } catch(e) {
    setSyncing('error');
    showToast('Sync error — local data cleared, remote may need retry');
  }
  // Reset in-memory state (keep profile)
  const profile = appData.profile;
  appData = { transactions:[], budgets:{}, catBudgets:{}, debts:[], profile };
  navigate('home');
  renderProfile();
  showToast('All data cleared 🗑️');
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
      id:          t.id,
      type:        t.type,
      amount:      Number(t.amount),
      description: t.description,
      category:    t.category,
      notes:       t.notes,
      recur:       t.recur,
      recurParent: t.recur_parent || t.recurParent,
      monthKey:    t.month_key || t.monthKey,
      datetime:    t.datetime,
    }));
    appData.budgets    = budgets;
    appData.catBudgets = catBudgets;
    appData.debts      = debts.map(d => ({
      id: d.id, type: d.type, person: d.person,
      amount: Number(d.amount), note: d.note,
      settled: d.settled, date: d.date,
    }));
    appData.profile = profile || {};
    setSyncing('ok');
    setTimeout(() => setSyncing('ok'), 2000);
  } catch(e) {
    console.error('Load error', e);
    setSyncing('error');
    showToast('Sync error — working offline');
  }
}

// ─────────────────────────────────────────────────────
// NAVIGATE
// ─────────────────────────────────────────────────────
function navigate(screen) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('screen-'+screen).classList.add('active');
  const n = document.getElementById('nav-'+screen); if (n) n.classList.add('active');
  document.getElementById('screen-'+screen).scrollTop = 0;
  if (screen==='home')         renderHome();
  if (screen==='transactions') renderTransactions();
  if (screen==='stats')        renderStats();
  if (screen==='debts')        renderDebts();
  if (screen==='profile')      renderProfile();
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
  if (nextId) { const el=document.getElementById(nextId); if(el) el.focus(); }
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
  const txs    = getMonthTx();
  const budget = appData.budgets[currentKey()] || 0;
  const spent  = txs.filter(t=>t.type==='expense').reduce((s,t)=>s + getTxMonthAmount(t, viewYear, viewMonth), 0);
  const income = txs.filter(t=>t.type==='income').reduce((s,t)=>s + getTxMonthAmount(t, viewYear, viewMonth), 0);
  
  const currencySymbol = getCurrencySymbol();
  document.getElementById('hero-currency').textContent = currencySymbol;

  const heroLabel = document.querySelector('.hero-card .hero-label');
  const heroNum = document.getElementById('remaining-amt');
  const heroSub = document.getElementById('hero-sub');
  const fill = document.getElementById('progress-fill');
  
  const statLabels = document.querySelectorAll('.hero-card .hero-stat-label');
  const statVals = document.querySelectorAll('.hero-card .hero-stat-val');

  if (activeHeroTab === 'budget') {
    const remaining = budget - spent;
    const pct = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
    
    heroNum.textContent = Math.abs(remaining).toLocaleString('en-IN', {
      minimumFractionDigits: remaining % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2
    });
    
    if (budget > 0) {
      if (remaining < 0) {
        heroSub.textContent = '⚠️ Over budget by ' + fmt(Math.abs(remaining));
        heroNum.style.color = 'var(--red)';
      } else {
        heroSub.textContent = fmt(spent) + ' spent · ' + fmt(remaining) + ' left';
        heroNum.style.color = 'var(--hero-text)';
      }
    } else {
      heroSub.textContent = 'Tap "Set Budget" to get started';
      heroNum.style.color = 'var(--hero-text)';
    }

    fill.style.width = pct + '%';
    fill.className = 'progress-fill' + (pct > 80 ? ' warn' : '');

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
    
    if (isCurrentMonth && budget > 0 && remaining > 0 && daysLeft > 0) {
      pill.style.display = 'inline-flex';
      document.getElementById('daily-limit-text').textContent = fmt(remaining / daysLeft) + '/day left';
      
      statLabels[2].textContent = 'Daily Limit';
      statVals[2].textContent = fmt(remaining / daysLeft);
      statVals[2].className = 'hero-stat-val green';
    } else {
      pill.style.display = 'none';
      
      statLabels[2].textContent = 'Income';
      statVals[2].textContent = fmt(income);
      statVals[2].className = 'hero-stat-val green';
    }

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
  } else {
    const balance = income - spent;
    const pct = income > 0 ? Math.min((spent / income) * 100, 100) : 0;
    
    heroNum.textContent = Math.abs(balance).toLocaleString('en-IN', {
      minimumFractionDigits: balance % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2
    });
    
    if (balance < 0) {
      heroSub.textContent = '⚠️ Cash flow negative by ' + fmt(Math.abs(balance));
      heroNum.style.color = 'var(--red)';
    } else {
      heroSub.textContent = fmt(income) + ' earned · ' + fmt(spent) + ' spent';
      heroNum.style.color = 'var(--hero-text)';
    }

    document.getElementById('daily-limit-pill').style.display = 'none';

    fill.style.width = pct + '%';
    fill.className = 'progress-fill' + (pct > 80 ? ' warn' : '');

    statLabels[0].textContent = 'Income';
    statVals[0].textContent = fmt(income);
    statVals[0].className = 'hero-stat-val green';

    statLabels[1].textContent = 'Spent';
    statVals[1].textContent = fmt(spent);
    statVals[1].className = 'hero-stat-val red';

    statLabels[2].textContent = 'Savings';
    const savingsPct = income > 0 ? Math.round(((income - spent) / income) * 100) : 0;
    statVals[2].textContent = savingsPct > 0 ? savingsPct + '% saved' : '0%';
    statVals[2].className = 'hero-stat-val blue';

    document.getElementById('budget-banner').classList.remove('show');
  }

  renderSummaryBanner();
  renderStreak();
  renderCatBudgetHome(txs);
  renderAISummarySection();

  const recent = [...txs].sort((a,b)=>parseDate(b.datetime)-parseDate(a.datetime)).slice(0,5);
  document.getElementById('recent-list').innerHTML = recent.length===0
    ? `<div class="empty-state"><div class="empty-icon">💸</div><div class="empty-title">No transactions yet</div><div class="empty-sub">Tap + to add your first expense</div></div>`
    : recent.map(t=>txHTML(t,false)).join('');
}

function renderSummaryBanner() {
  const now=new Date(), day=now.getDate();
  if (day>5) { document.getElementById('summary-banner').classList.remove('show'); return; }
  const pm    = new Date(now.getFullYear(),now.getMonth()-1,1);
  const pmKey = monthKey(pm.getFullYear(),pm.getMonth());
  const s     = getLocalSettings();
  if (s.summaryDismissed===pmKey) { document.getElementById('summary-banner').classList.remove('show'); return; }
  const pmTxs   = appData.transactions.filter(t=>t.monthKey===pmKey&&t.type==='expense');
  if (!pmTxs.length) { document.getElementById('summary-banner').classList.remove('show'); return; }
  const pmSpent  = pmTxs.reduce((s,t)=>s+t.amount,0);
  const pmBudget = appData.budgets[pmKey]||0;
  const catTot   = {};
  pmTxs.forEach(t=>{ catTot[t.category]=(catTot[t.category]||0)+t.amount; });
  const topCat = Object.entries(catTot).sort((a,b)=>b[1]-a[1])[0];
  document.getElementById('sb-spent').textContent   = fmt(pmSpent);
  document.getElementById('sb-top-cat').textContent = topCat ? `${CATEGORIES.find(c=>c.id===topCat[0])?.icon||''} ${topCat[0]}` : '—';
  document.getElementById('sb-vs-budget').textContent = pmBudget>0 ? (pmSpent<=pmBudget?'✅ Under budget':'⚠️ Over budget') : 'No budget set';
  document.getElementById('summary-banner').classList.add('show');
}

function dismissSummaryBanner() {
  const now=new Date(), pm=new Date(now.getFullYear(),now.getMonth()-1,1);
  const s=getLocalSettings();
  s.summaryDismissed=monthKey(pm.getFullYear(),pm.getMonth());
  saveLocalSettings(s);
  document.getElementById('summary-banner').classList.remove('show');
}

function renderStreak() {
  let streak=0;
  const now=new Date();
  for (let i=1;i<=12;i++) {
    const d=new Date(now.getFullYear(),now.getMonth()-i,1);
    const k=monthKey(d.getFullYear(),d.getMonth());
    const budget=appData.budgets[k]||0;
    if (!budget) break;
    const spent=appData.transactions.filter(t=>t.monthKey===k&&t.type==='expense').reduce((s,t)=>s+t.amount,0);
    if (spent<=budget) streak++; else break;
  }
  const card=document.getElementById('streak-card');
  if (streak>=2) {
    card.style.display='flex';
    document.getElementById('streak-emoji').textContent = streak>=6?'🏆':streak>=3?'🔥':'⭐';
    document.getElementById('streak-title').textContent = streak+' month streak!';
    document.getElementById('streak-sub').textContent   = 'Under budget '+streak+' months in a row';
  } else { card.style.display='none'; }
}

function renderCatBudgetHome(txs) {
  const cb = appData.catBudgets||{};
  const has = Object.keys(cb).length>0;
  document.getElementById('cat-budget-home').style.display = has ? 'block' : 'none';
  if (!has) return;
  const spent={};
  txs.filter(t=>t.type==='expense').forEach(t=>{ spent[t.category]=(spent[t.category]||0)+t.amount; });
  document.getElementById('cat-budget-home-list').innerHTML =
    Object.entries(cb).slice(0,4).map(([cat,limit])=>{
      const s=spent[cat]||0, pct=Math.min((s/limit)*100,100);
      const c=CATEGORIES.find(x=>x.id===cat)||{icon:'📌',color:'#8896b3'};
      const warn=pct>=80;
      return `<div class="cat-budget-row">
        <div class="cat-budget-icon">${c.icon}</div>
        <div class="cat-budget-info">
          <div class="cat-budget-name">${cat}</div>
          <div class="cat-budget-progress"><div class="cat-budget-bar" style="width:${pct}%;background:${warn?'var(--red)':c.color}"></div></div>
        </div>
        <div class="cat-budget-right">
          <div class="cat-budget-amt" style="color:${warn?'var(--red)':'var(--text)'}">${fmt(s)}</div>
          <div class="cat-budget-limit">of ${fmt(limit)}</div>
        </div>
      </div>`;
    }).join('');
}

// ─────────────────────────────────────────────────────
// AI SUMMARY
// ─────────────────────────────────────────────────────
function renderAISummarySection() {
  const now=new Date(), daysInMonth=new Date(viewYear,viewMonth+1,0).getDate();
  const today=now.getDate(), isCurrentMonth=(viewYear===now.getFullYear()&&viewMonth===now.getMonth());
  // Show on last 2 days of current month OR any past month with data
  const txs=getMonthTx();
  const hasData=txs.filter(t=>t.type==='expense').length>0;
  const show=hasData && (!isCurrentMonth || today>=daysInMonth-1);
  document.getElementById('ai-summary-section').style.display=show?'block':'none';
}

function generateLocalSummary(txs, totalSpent, budget) {
  const catTotals = {};
  txs.forEach(t => { catTotals[t.category] = (catTotals[t.category] || 0) + t.amount; });
  const sorted = Object.entries(catTotals).sort((a,b) => b[1]-a[1]);
  
  let summary = `For this month, you have spent a total of ${fmtFull(totalSpent)}. `;
  if (budget > 0) {
    const diff = budget - totalSpent;
    summary += diff >= 0 
      ? `You are currently under your budget by ${fmtFull(diff)}.` 
      : `You have exceeded your monthly budget by ${fmtFull(Math.abs(diff))}! Try to scale back.`;
  } else {
    summary += `Consider setting a monthly budget to track your spending limits.`;
  }
  
  if (sorted.length > 0) {
    const [topCat, topAmt] = sorted[0];
    const pct = Math.round((topAmt / totalSpent) * 100);
    summary += ` Your top spending category is <strong>${topCat}</strong>, accounting for ${fmtFull(topAmt)} (${pct}% of your total spending).`;
  }
  
  summary += ` Tip: Review your transactions regularly to identify areas where you can save.`;
  return summary;
}

async function generateAISummary() {
  const txs=getMonthTx().filter(t=>t.type==='expense');
  if (!txs.length) { showToast('No expenses to summarise'); return; }

  const btn=document.getElementById('ai-generate-btn');
  const body=document.getElementById('ai-summary-body');
  btn.style.display='none';
  body.innerHTML='<div class="ai-loading"><div class="ai-dot"></div><div class="ai-dot"></div><div class="ai-dot"></div><span>Analysing your spending…</span></div>';

  const totalSpent=txs.reduce((s,t)=>s+t.amount,0);
  const budget=appData.budgets[currentKey()]||0;

  // Local fallback if no Gemini key is provided
  if (!GEMINI_KEY || GEMINI_KEY.trim() === '') {
    const text = generateLocalSummary(txs, totalSpent, budget);
    const s = getLocalSettings();
    s['aiSummary_' + currentKey()] = text;
    saveLocalSettings(s);
    body.innerHTML = text;
    btn.style.display = 'none';
    return;
  }

  const catTotals={};
  txs.forEach(t=>{ catTotals[t.category]=(catTotals[t.category]||0)+t.amount; });
  const catSummary=Object.entries(catTotals).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`${k}: ${fmtFull(v)}`).join(', ');
  const merchantTotals={};
  txs.forEach(t=>{ const m=t.description||t.category; merchantTotals[m]=(merchantTotals[m]||0)+t.amount; });
  const topMerchants=Object.entries(merchantTotals).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([k,v])=>`${k} (${fmtFull(v)})`).join(', ');

  const prompt=`You are a friendly personal finance advisor. Analyse this spending data for ${MONTHS_FULL[viewMonth]} ${viewYear} and give a warm, concise summary (3-4 sentences max). Be specific, use the actual numbers, and give one actionable tip.

Total spent: ${fmtFull(totalSpent)}
Monthly budget: ${budget>0?fmtFull(budget):'not set'}
Budget status: ${budget>0?(totalSpent<=budget?'under budget by '+fmtFull(budget-totalSpent):'over budget by '+fmtFull(totalSpent-budget)):'no budget set'}
Spending by category: ${catSummary}
Top merchants/payees: ${topMerchants}
Total transactions: ${txs.length}

Write in plain conversational text, no markdown, no bullet points.`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 300, temperature: 0.7 }
        })
      }
    );
    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Could not generate summary.';
    // Cache so it doesn't re-generate on every render
    const s=getLocalSettings(); s['aiSummary_'+currentKey()]=text; saveLocalSettings(s);
    body.innerHTML=text.replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>');
    btn.style.display='none';
  } catch(e) {
    console.warn('Gemini API call failed, generating local summary fallback', e);
    const text = generateLocalSummary(txs, totalSpent, budget);
    body.innerHTML = text + `<br><small style="color:var(--text3);margin-top:6px;display:block">⚠️ Offline local summary (Gemini unavailable)</small>`;
    btn.style.display = 'none';
  }
}

function loadCachedAISummary() {
  const s=getLocalSettings();
  const cached=s['aiSummary_'+currentKey()];
  const body=document.getElementById('ai-summary-body');
  const btn=document.getElementById('ai-generate-btn');
  if (cached) {
    body.innerHTML=cached.replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>');
    btn.style.display='none';
  } else {
    body.innerHTML='';
    btn.style.display='flex';
  }
}

// ─────────────────────────────────────────────────────
// TX HTML + SWIPE
// ─────────────────────────────────────────────────────
function txHTML(tx, showSwipe=true) {
  const cat = CATEGORIES.find(c=>c.id===tx.category)||{icon:'📌',color:'#8896b3'};
  const hasTime = tx.datetime && tx.datetime.includes('T');
  const d   = parseDate(tx.datetime);
  const ds  = d.toLocaleDateString('en-IN',{day:'numeric',month:'short'});
  const ts  = hasTime ? d.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit',hour12:true}) : '';
  const timeStr = ts ? `, ${ts}` : '';
  const note= tx.notes ? ` · ${tx.notes}` : '';
  const recur= tx.recur&&tx.recur!=='none' ? `<span class="tx-recur-badge">🔄 ${tx.recur}</span>` : '';
  
  const isWeekly = tx.recur === 'weekly';
  const totalAmt = getTxMonthAmount(tx, viewYear, viewMonth);
  const amountStr = isWeekly
    ? `${tx.type==='expense'?'-':'+'}${fmt(tx.amount)}<span style="font-size:10px;font-weight:400;color:var(--text3)">/wk (total ${tx.type==='expense'?'-':'+'}${fmt(totalAmt)})</span>`
    : `${tx.type==='expense'?'-':'+'}${fmt(tx.amount)}`;

  const inner = `
    <div class="tx-item" data-id="${tx.id}" onclick="showDetail('${tx.id}')">
      <div class="tx-icon" style="background:${cat.color}22;color:${cat.color}">${cat.icon}</div>
      <div class="tx-info">
        <div class="tx-desc">${tx.description||tx.category}</div>
        <div class="tx-meta">${tx.category} · ${ds}${timeStr}${note}</div>
      </div>
      <div class="tx-right">
        <div class="tx-amount ${tx.type}">${amountStr}</div>
        ${recur}
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

function initSwipe(container) {
  container.querySelectorAll('.tx-wrap').forEach(wrap=>{
    const item=wrap.querySelector('.tx-item');
    let startX=0, startY=0, swiping=false, activated=false;
    item.addEventListener('touchstart',e=>{startX=e.touches[0].clientX;startY=e.touches[0].clientY;swiping=false;activated=false;},{passive:true});
    item.addEventListener('touchmove',e=>{
      const dx=e.touches[0].clientX-startX, dy=e.touches[0].clientY-startY;
      if(!swiping&&Math.abs(dy)>Math.abs(dx)) return;
      swiping=true;
      const cur=Math.min(0,dx);
      if(cur<-10) e.preventDefault();
      item.style.transform=`translateX(${cur}px)`;
      activated=cur<-60;
    },{passive:false});
    item.addEventListener('touchend',()=>{
      if(activated){item.style.transform='translateX(-80px)';setTimeout(()=>{if(confirm('Delete this transaction?')){deleteTransaction(wrap.dataset.id);}else{item.style.transform='';}},100);}
      else{item.style.transform='';}
    },{passive:true});
  });
}

// ─────────────────────────────────────────────────────
// TRANSACTIONS SCREEN
// ─────────────────────────────────────────────────────
function renderTransactions() {
  const search = (document.getElementById('search-input')?.value||'').toLowerCase().trim();
  const dataset = filterTimeScope === 'all' ? [...appData.transactions] : getMonthTx();
  let txs = [...dataset].sort((a,b)=>parseDate(b.datetime)-parseDate(a.datetime));

  const labelEl = document.getElementById('nav-month-label-2');
  if (labelEl) {
    labelEl.textContent = filterTimeScope === 'all' ? 'All Time' : getMonthLabel();
  }

  // Rebuild chips
  const usedCats=[...new Set(dataset.map(t=>t.category))];
  const hasRecur=dataset.some(t=>t.recur&&t.recur!=='none');

  if (filterCategory !== 'all' && filterCategory !== 'expense' && filterCategory !== 'income' && filterCategory !== 'recurring' && !usedCats.includes(filterCategory)) {
    filterCategory = 'all';
  }

  if (filterCategory==='expense')   txs=txs.filter(t=>t.type==='expense');
  else if (filterCategory==='income')    txs=txs.filter(t=>t.type==='income');
  else if (filterCategory==='recurring') txs=txs.filter(t=>t.recur&&t.recur!=='none');
  else if (filterCategory!=='all')       txs=txs.filter(t=>t.category===filterCategory);

  if (search) txs=txs.filter(t=>(t.description||'').toLowerCase().includes(search)||(t.category||'').toLowerCase().includes(search)||(t.notes||'').toLowerCase().includes(search)||String(t.amount).includes(search));

  const catChips=CATEGORIES.filter(c=>usedCats.includes(c.id)).map(c=>
    `<div class="cat-chip ${filterCategory===c.id?'active':''}" onclick="filterCat(this,'${c.id}')">${c.icon} ${c.id}</div>`).join('');
  document.getElementById('filter-chips').innerHTML=`
    <div class="cat-chip ${filterCategory==='all'?'active':''}" onclick="filterCat(this,'all')">📋 All</div>
    <div class="cat-chip ${filterCategory==='expense'?'active':''}" onclick="filterCat(this,'expense')">📤 Expenses</div>
    <div class="cat-chip ${filterCategory==='income'?'active':''}" onclick="filterCat(this,'income')">💰 Income</div>
    ${hasRecur?`<div class="cat-chip ${filterCategory==='recurring'?'active':''}" onclick="filterCat(this,'recurring')">🔄 Recurring</div>`:''}
    ${catChips}`;

  const container=document.getElementById('all-tx-list');
  if (!txs.length) {
    container.innerHTML=`<div class="empty-state"><div class="empty-icon">🔍</div><div class="empty-title">No transactions</div><div class="empty-sub">${search?'No results for "'+search+'"':'Nothing matches this filter'}</div></div>`;
    return;
  }
  const groups={};
  txs.forEach(tx=>{
    const k=parseDate(tx.datetime).toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short'});
    if(!groups[k])groups[k]=[];groups[k].push(tx);
  });
  container.innerHTML=Object.entries(groups).map(([date,items])=>{
    const dayTotal=items.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0);
    return `<div style="display:flex;justify-content:space-between;align-items:center;padding:12px 16px 6px"><span style="font-size:10px;font-weight:600;letter-spacing:.07em;text-transform:uppercase;color:var(--text3)">${date}</span><span style="font-size:11px;font-family:var(--mono);color:var(--text3)">${dayTotal>0?'-'+fmt(dayTotal):''}</span></div><div style="padding:0 16px"><div class="tx-list">${items.map(t=>txHTML(t,true)).join('')}</div></div>`;
  }).join('');
  setTimeout(()=>initSwipe(container),50);
}

function filterCat(el,cat){filterCategory=cat;renderTransactions();}

// ─────────────────────────────────────────────────────
// STATS
// ─────────────────────────────────────────────────────
function setStatsTab(el,tab){
  document.querySelectorAll('.stats-tab').forEach(t=>t.classList.remove('active'));
  el.classList.add('active'); activeStatsTab=tab;
  ['overview','categories','merchants','daily','compare'].forEach(id=>document.getElementById('stats-'+id).style.display=id===tab?'block':'none');
  renderStats();
}
function destroyChart(k){if(charts[k]){charts[k].destroy();charts[k]=null;}}

function renderStats(){
  const txs=getMonthTx(), expenses=txs.filter(t=>t.type==='expense'), incomes=txs.filter(t=>t.type==='income');
  const totalSpent=expenses.reduce((s,t)=>s+getTxMonthAmount(t, viewYear, viewMonth),0), totalIncome=incomes.reduce((s,t)=>s+getTxMonthAmount(t, viewYear, viewMonth),0);
  const daysInMonth=new Date(viewYear,viewMonth+1,0).getDate();
  const maxTx=expenses.reduce((m,t)=>t.amount>m?t.amount:m,0);

  if(activeStatsTab==='overview'){
    document.getElementById('s-spent').textContent=fmt(totalSpent);
    document.getElementById('s-income').textContent=fmt(totalIncome);
    document.getElementById('s-count').textContent=txs.length;
    document.getElementById('s-avg').textContent=fmt(totalSpent/daysInMonth);
    document.getElementById('s-max').textContent=fmt(maxTx);
    document.getElementById('s-net').textContent=fmt(totalIncome-totalSpent);
    const catTotals={};expenses.forEach(t=>{catTotals[t.category]=(catTotals[t.category]||0)+getTxMonthAmount(t, viewYear, viewMonth);});
    const topCat=Object.entries(catTotals).sort((a,b)=>b[1]-a[1])[0];
    let insight='Add some transactions to see insights.';
    if(topCat){
      const pct=Math.round((topCat[1]/totalSpent)*100);
      insight=`Biggest spend: <strong>${topCat[0]}</strong> at ${fmt(topCat[1])} (${pct}%). `;
      if(totalIncome>0){const sv=totalIncome-totalSpent;insight+=sv>=0?`Saving <strong>${fmt(sv)}</strong> this month 🎉`:`Over income by <strong>${fmt(Math.abs(sv))}</strong>.`}
    }
    document.getElementById('insight-text').innerHTML=insight;
    const sorted=Object.entries(catTotals).filter(([,v])=>v>0).sort((a,b)=>b[1]-a[1]);
    destroyChart('donut');
    if(sorted.length>0){charts.donut=new Chart(document.getElementById('donut-chart').getContext('2d'),{type:'doughnut',data:{labels:sorted.map(([k])=>k),datasets:[{data:sorted.map(([,v])=>v),backgroundColor:sorted.map(([k])=>CATEGORIES.find(c=>c.id===k)?.color||'#8896b3'),borderWidth:0,spacing:2}]},options:{responsive:true,maintainAspectRatio:false,cutout:'68%',plugins:{legend:{position:'bottom',labels:{color:'var(--text2)',font:{size:10},padding:8,boxWidth:8}},tooltip:{callbacks:{label:c=>` ${c.label}: ${fmt(c.raw)}`}}}}});}
  }
  if(activeStatsTab==='categories'){
    const catTotals={};expenses.forEach(t=>{catTotals[t.category]=(catTotals[t.category]||0)+getTxMonthAmount(t, viewYear, viewMonth);});
    const sorted=Object.entries(catTotals).filter(([,v])=>v>0).sort((a,b)=>b[1]-a[1]);
    const maxAmt=sorted[0]?.[1]||1, cb=appData.catBudgets||{};
    document.getElementById('cat-bars').innerHTML=sorted.map(([id,amt])=>{
      const cat=CATEGORIES.find(c=>c.id===id)||{icon:'📌',color:'#8896b3'};
      const pct=totalSpent>0?Math.round((amt/totalSpent)*100):0;
      const limit=cb[id];
      const limitStr=limit?`<span class="cat-budget-left">${amt<=limit?fmt(limit-amt)+' left':'over by '+fmt(amt-limit)}</span>`:'';
      return `<div class="cat-bar-row"><div class="cat-bar-header"><div class="cat-bar-name">${cat.icon} ${id}</div><div class="cat-bar-right">${limitStr}<div class="cat-bar-pct">${pct}%</div><div class="cat-bar-amt">${fmt(amt)}</div></div></div><div class="cat-bar-track"><div class="cat-bar-fill" style="width:${(amt/maxAmt)*100}%;background:${limit&&amt>limit?'var(--red)':cat.color}"></div></div></div>`;
    }).join('')||'<div class="empty-state"><div class="empty-icon">📊</div><div class="empty-title">No data</div></div>';
  }
  if(activeStatsTab==='merchants'){
    const mt={};expenses.forEach(t=>{const m=(t.description||t.category).trim();mt[m]=mt[m]||{total:0,count:0};mt[m].total+=getTxMonthAmount(t, viewYear, viewMonth);mt[m].count++;});
    const sorted=Object.entries(mt).sort((a,b)=>b[1].total-a[1].total).slice(0,10);
    document.getElementById('merchant-list').innerHTML=sorted.length===0
      ?'<div class="empty-state"><div class="empty-icon">🏪</div><div class="empty-title">No data yet</div></div>'
      :sorted.map(([name,{total,count}],i)=>`<div class="merchant-item"><div><div class="merchant-name">${i+1}. ${name}</div><div class="merchant-meta">${count} transaction${count>1?'s':''}</div></div><div class="merchant-amt">${fmt(total)}</div></div>`).join('');
  }
  if(activeStatsTab==='daily'){
    const dt={};for(let i=1;i<=daysInMonth;i++)dt[i]=0;
    expenses.forEach(t=>{
      if (t.recur === 'weekly') {
        const weekday = parseDate(t.datetime).getDay();
        for (let date = 1; date <= daysInMonth; date++) {
          if (new Date(viewYear, viewMonth, date).getDay() === weekday) {
            dt[date] = (dt[date] || 0) + t.amount;
          }
        }
      } else {
        const d=parseDate(t.datetime).getDate();
        dt[d]=(dt[d]||0)+t.amount;
      }
    });
    const days=Object.keys(dt).map(Number), vals=Object.values(dt);
    destroyChart('bar');
    charts.bar=new Chart(document.getElementById('bar-chart').getContext('2d'),{type:'bar',data:{labels:days,datasets:[{data:vals,backgroundColor:'rgba(79,209,197,.3)',borderColor:'rgba(79,209,197,.8)',borderWidth:1,borderRadius:3}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>` ${fmt(c.raw)}`}}},scales:{x:{ticks:{color:'var(--text3)',font:{size:9}},grid:{display:false}},y:{ticks:{color:'var(--text3)',font:{size:9},callback:v=>fmt(v)},grid:{color:'var(--border)'}}}}});
    let cum=0;const cumVals=vals.map(v=>{cum+=v;return cum;});
    destroyChart('line');
    charts.line=new Chart(document.getElementById('line-chart').getContext('2d'),{type:'line',data:{labels:days,datasets:[{data:cumVals,borderColor:'#4fd1c5',backgroundColor:'rgba(79,209,197,.07)',borderWidth:2,pointRadius:0,fill:true,tension:.4}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>` ${fmt(c.raw)}`}}},scales:{x:{ticks:{color:'var(--text3)',font:{size:9}},grid:{display:false}},y:{ticks:{color:'var(--text3)',font:{size:9},callback:v=>fmt(v)},grid:{color:'var(--border)'}}}}});
  }
  if(activeStatsTab==='compare'){
    const m6=[];for(let i=5;i>=0;i--){const d=new Date(viewYear,viewMonth-i,1);m6.push({y:d.getFullYear(),m:d.getMonth(),label:MONTHS[d.getMonth()]+"'"+(d.getFullYear().toString().slice(2))});}
    
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

    const spentA=m6.map(({y,m})=>appData.transactions.filter(t=>t.type==='expense').reduce((s,t)=>s+getMonthAmountForComparison(t,y,m),0));
    const incA=m6.map(({y,m})=>appData.transactions.filter(t=>t.type==='income').reduce((s,t)=>s+getMonthAmountForComparison(t,y,m),0));
    const budA=m6.map(({y,m})=>appData.budgets[monthKey(y,m)]||0);
    destroyChart('compare');
    charts.compare=new Chart(document.getElementById('compare-chart').getContext('2d'),{type:'bar',data:{labels:m6.map(x=>x.label),datasets:[{label:'Spent',data:spentA,backgroundColor:'rgba(252,129,129,.65)',borderRadius:4},{label:'Income',data:incA,backgroundColor:'rgba(104,211,145,.55)',borderRadius:4},{label:'Budget',data:budA,backgroundColor:'rgba(79,209,197,.25)',borderRadius:4}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{color:'var(--text2)',font:{size:10},boxWidth:10,padding:10}},tooltip:{callbacks:{label:c=>` ${c.dataset.label}: ${fmt(c.raw)}`}}},scales:{x:{ticks:{color:'var(--text3)',font:{size:10}},grid:{display:false}},y:{ticks:{color:'var(--text3)',font:{size:9},callback:v=>fmt(v)},grid:{color:'var(--border)'}}}}});
    const rows=m6.map(({label},i)=>{const net=incA[i]-spentA[i],nc=net>=0?'var(--green)':'var(--red)';return `<tr><td style="color:var(--text2)">${label}</td><td style="color:var(--red)">${spentA[i]>0?fmt(spentA[i]):'-'}</td><td style="color:var(--green)">${incA[i]>0?fmt(incA[i]):'-'}</td><td style="color:${nc}">${(incA[i]+spentA[i])>0?fmt(net):'-'}</td></tr>`;}).join('');
    document.getElementById('compare-table-wrap').innerHTML=`<table class="compare-table"><thead><tr><th>Month</th><th>Spent</th><th>Income</th><th>Net</th></tr></thead><tbody>${rows}</tbody></table>`;
  }
}

// ─────────────────────────────────────────────────────
// DEBTS
// ─────────────────────────────────────────────────────
function renderDebts(){
  const debts=appData.debts||[];
  const totalOwe=debts.filter(d=>d.type==='owe'&&!d.settled).reduce((s,d)=>s+d.amount,0);
  const totalLent=debts.filter(d=>d.type==='lent'&&!d.settled).reduce((s,d)=>s+d.amount,0);
  document.getElementById('debt-total-owe').textContent=fmt(totalOwe);
  document.getElementById('debt-total-lent').textContent=fmt(totalLent);
  const list=document.getElementById('debt-list');
  const active=debts.filter(d=>!d.settled), settled=debts.filter(d=>d.settled);
  if(!debts.length){list.innerHTML='<div class="empty-state"><div class="empty-icon">🤝</div><div class="empty-title">No debts tracked</div><div class="empty-sub">Tap + to add who owes who</div></div>';return;}
  const renderDebt=d=>`<div class="debt-item" onclick="showDebtDetail('${d.id}')" style="opacity:${d.settled?.5:1}">
    <div class="debt-avatar" style="background:${d.type==='owe'?'var(--red-dim)':'var(--green-dim)'};color:${d.type==='owe'?'var(--red)':'var(--green)'}">${(d.person||'?')[0].toUpperCase()}</div>
    <div class="debt-info"><div class="debt-name">${d.person}${d.settled?' <span style="font-size:10px;color:var(--text3)">(settled)</span>':''}</div><div class="debt-note">${d.note||''}</div></div>
    <div style="text-align:right"><div class="debt-amount ${d.type}">${d.type==='owe'?'-':'+'}${fmt(d.amount)}</div><div class="debt-badge ${d.type}" style="margin-top:3px;display:inline-block">${d.type==='owe'?'I owe':'Lent'}</div></div>
  </div>`;
  list.innerHTML=active.map(renderDebt).join('')+(settled.length?`<div style="font-size:10px;text-transform:uppercase;letter-spacing:.07em;color:var(--text3);padding:12px 0 6px">Settled</div>${settled.map(renderDebt).join('')}`:'');
}

function openAddDebt(){
  setDebtType('owe');
  ['debt-person','debt-amount','debt-note'].forEach(id=>document.getElementById(id).value='');
  openModal('modal-debt');
  setTimeout(()=>document.getElementById('debt-person').focus(),350);
}
function setDebtType(t){
  debtType=t;
  document.getElementById('debt-type-owe').className='type-btn'+(t==='owe'?' active-expense':'');
  document.getElementById('debt-type-lent').className='type-btn'+(t==='lent'?' active-income':'');
}
async function submitDebt(){
  const person=document.getElementById('debt-person').value.trim();
  const amount=parseFloat(document.getElementById('debt-amount').value);
  const note=document.getElementById('debt-note').value.trim();
  if(!person){showToast('Enter a name');return;}
  if(!amount||amount<=0){showToast('Enter a valid amount');return;}
  const debt={id:uid(),type:debtType,person,amount,note,settled:false,date:new Date().toISOString()};
  setSyncing('syncing');
  try {
    await dbInsertDebt(currentUser.id, debt);
    appData.debts.unshift(debt);
    setSyncing('ok');
  } catch(e) { setSyncing('error'); showToast('Sync error'); }
  closeModal('modal-debt'); renderDebts();
  showToast(debtType==='owe'?`You owe ${person} ${fmt(amount)}`:`${person} owes you ${fmt(amount)}`);
}
function showDebtDetail(id){
  const d=appData.debts.find(x=>x.id===id); if(!d) return;
  document.getElementById('debt-detail-content').innerHTML=`
    <div style="text-align:center;padding:14px 0 20px">
      <div style="font-size:42px;margin-bottom:10px">${d.type==='owe'?'😬':'💪'}</div>
      <div style="font-size:12px;color:var(--text3);margin-bottom:6px;text-transform:uppercase;letter-spacing:.07em">${d.type==='owe'?'You Owe':'You Lent'}</div>
      <div style="font-size:30px;font-weight:600;font-family:var(--mono);color:${d.type==='owe'?'var(--red)':'var(--green)'}">${d.type==='owe'?'-':'+'}${fmtFull(d.amount)}</div>
      <div style="font-size:16px;font-weight:500;margin-top:8px">${d.person}</div>
      ${d.note?`<div style="font-size:13px;color:var(--text3);margin-top:4px">${d.note}</div>`:''}
      ${d.settled?'<div style="margin-top:8px;font-size:12px;color:var(--green)">✅ Settled</div>':''}
    </div>
    ${!d.settled?`<button class="submit-btn" style="background:var(--green-dim);color:var(--green);border:1px solid var(--green)" onclick="settleDebt('${d.id}')">✅ Mark as Settled</button><div style="height:8px"></div>`:''}
    <button class="submit-btn danger" onclick="deleteDebt('${d.id}')">Delete</button>`;
  openModal('modal-debt-detail');
}
async function settleDebt(id){
  setSyncing('syncing');
  try { await dbUpdateDebt(currentUser.id, id, {settled:true}); } catch(e) { setSyncing('error'); }
  const d=appData.debts.find(x=>x.id===id); if(d) d.settled=true;
  setSyncing('ok'); closeModal('modal-debt-detail'); renderDebts(); showToast('Settled ✅');
}
async function deleteDebt(id){
  setSyncing('syncing');
  try { await dbDeleteDebt(currentUser.id, id); } catch(e) { setSyncing('error'); }
  appData.debts=appData.debts.filter(x=>x.id!==id);
  setSyncing('ok'); closeModal('modal-debt-detail'); renderDebts(); showToast('Deleted');
}

// ─────────────────────────────────────────────────────
// PROFILE
// ─────────────────────────────────────────────────────
function renderProfile(){
  const p=appData.profile||{}, s=getLocalSettings();
  document.getElementById('profile-name-input').value=p.name||'';
  // Currency display — show flag + name
  const curSym = s.currency || detectCurrency();
  const curObj = CURRENCIES.find(c=>c.symbol===curSym);
  const curLabel = curObj ? `${curObj.flag} ${curObj.name} (${curSym})` : curSym;
  document.getElementById('profile-currency-display').textContent = curLabel;
  document.getElementById('profile-display-name').textContent=p.name||currentUser?.email||'My Account';
  document.getElementById('profile-email').textContent=currentUser?.email||'';
  const avatarTxt = document.getElementById('profile-avatar-txt');
  if (avatarTxt) {
    if (p.avatar) {
      avatarTxt.innerHTML = `<img src="${p.avatar}" alt="Avatar" style="width:100%;height:100%;object-fit:cover;border-radius:20px">`;
    } else {
      avatarTxt.textContent = p.name ? p.name[0].toUpperCase() : '💼';
    }
  }
  document.getElementById('profile-sub').textContent=`Budget resets on the 1st · ${getResetMonthLabel()}`;
  document.getElementById('profile-budget-val').textContent=(appData.budgets[currentKey()]||0)>0?fmtFull(appData.budgets[currentKey()])+' / month':'Not set';
  const activeDebts=(appData.debts||[]).filter(d=>!d.settled).length;
  document.getElementById('debt-tracker-val').textContent=activeDebts>0?`${activeDebts} active debt${activeDebts>1?'s':''}`:'Track who owes who';
  const pinOn=s.pinEnabled;
  document.getElementById('pin-toggle').className='toggle'+(pinOn?' on':'');
  document.getElementById('pin-status-label').textContent=pinOn?'Enabled':'Disabled';
  
  const cpEl = document.getElementById('settings-change-password-item');
  if (cpEl) cpEl.style.display = useLocalDB ? 'none' : 'flex';
  
  renderCatBudgetSettings();
}

function uploadAvatar(event) {
  const file = event.target.files[0];
  if (!file) return;
  if (file.size > 500 * 1024) {
    showToast('Image must be under 500KB 📸');
    return;
  }
  const reader = new FileReader();
  reader.onload = async function(e) {
    const base64 = e.target.result;
    appData.profile = appData.profile || {};
    appData.profile.avatar = base64;
    setSyncing('syncing');
    try {
      await dbSaveProfile(currentUser.id, appData.profile);
      setSyncing('ok');
      renderProfile();
      showToast('Profile picture updated! 📸');
    } catch (err) {
      setSyncing('error');
      showToast('Failed to save profile picture');
    }
  };
  reader.readAsDataURL(file);
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

function renderCatBudgetSettings(){
  const cb=appData.catBudgets||{};
  const top=['Food','Groceries','Transport','Dining Out','Entertainment','Shopping','Utilities','Rent','EMI / Loan'];
  document.getElementById('cat-budget-settings').innerHTML=top.map(cat=>{
    const c=CATEGORIES.find(x=>x.id===cat)||{icon:'📌'};
    return `<div class="edit-field" style="margin-bottom:8px">
      <span class="edit-field-label" style="width:120px">${c.icon} ${cat}</span>
      <input type="number" placeholder="No limit" step="any" value="${cb[cat]||''}" style="flex:1;background:none;border:none;outline:none;padding:11px 0;font-size:13px;font-family:var(--font);color:var(--text)" onblur="saveCatBudget('${cat}',this.value)" onkeydown="if(event.key==='Enter')this.blur()">
    </div>`;
  }).join('');
}

async function autoSaveProfile(){
  const p={
    name: document.getElementById('profile-name-input').value.trim(),
    settings: appData.profile?.settings||{}
  };
  // Currency is saved separately by selectCurrency() — don't overwrite it here
  appData.profile={...appData.profile,...p};
  setSyncing('syncing');
  try { await dbSaveProfile(currentUser.id, p); setSyncing('ok'); } catch(e) { setSyncing('error'); }
  document.getElementById('profile-display-name').textContent=p.name||currentUser?.email||'My Account';
  document.getElementById('profile-avatar').textContent=p.name?p.name[0].toUpperCase():'💼';
  showToast('Saved ✓');
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
      <div class="settings-item" onclick="selectCurrency('${c.symbol.replace(/'/g, "\\'")}',' ${c.name}')" style="${c.symbol===current?'background:var(--surface2)':''};border-radius:12px;margin-bottom:2px">
        <div class="settings-left">
          <div class="settings-icon" style="font-size:20px">${c.flag}</div>
          <div>
            <div class="settings-label" style="${c.symbol===current?'color:var(--accent)':''}">${c.name}</div>
            <div class="settings-val">${c.code} &nbsp;·&nbsp; ${c.symbol}</div>
          </div>
        </div>
        ${c.symbol===current ? checkSvg : ''}
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

async function saveCatBudget(cat, val){
  const n=parseFloat(val);
  setSyncing('syncing');
  try {
    await dbSaveCatBudget(currentUser.id, cat, n||0);
    if(n>0) appData.catBudgets[cat]=n; else delete appData.catBudgets[cat];
    setSyncing('ok');
    showToast(n>0?`${cat} budget: ${fmt(n)}`:`${cat} budget removed`);
  } catch(e) { 
    setSyncing('error'); 
    showToast('Sync error'); 
    if(n>0) appData.catBudgets[cat]=n; else delete appData.catBudgets[cat];
  }
  renderHome();
  renderProfile();
}

// ─────────────────────────────────────────────────────
// ADD TRANSACTION
// ─────────────────────────────────────────────────────
function openAddExpense(){
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

  ['input-amount','input-desc','input-notes'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('input-recur').value='none';
  setType('expense'); selectedCat='Food'; renderCatGrid();
  document.querySelector('#modal-add .sheet-title').textContent = 'Add Transaction';
  document.querySelector('#modal-add .submit-btn').textContent = 'Add Transaction';
  openModal('modal-add');
  setTimeout(()=>document.getElementById('input-amount').focus(),350);
}
function setType(type){
  selectedType=type;
  document.getElementById('type-expense').className='type-btn'+(type==='expense'?' active-expense':'');
  document.getElementById('type-income').className='type-btn'+(type==='income'?' active-income':'');
  document.getElementById('cat-group').style.display=type==='income'?'none':'block';
}
function renderCatGrid(){
  document.getElementById('cat-grid').innerHTML=CATEGORIES.map(c=>
    `<div class="cat-option ${c.id===selectedCat?'selected':''}" onclick="selectCat('${c.id}')"><div class="cat-option-icon">${c.icon}</div><div class="cat-option-label">${c.id}</div></div>`).join('');
}
function selectCat(id){selectedCat=id;renderCatGrid();}
function setQuickAmt(n){document.getElementById('input-amount').value=n;document.getElementById('input-desc').focus();}

async function submitTransaction(){
  const amount=parseFloat(document.getElementById('input-amount').value);
  const desc=document.getElementById('input-desc').value.trim();
  const notes=document.getElementById('input-notes').value.trim();
  const dateVal=document.getElementById('input-date').value;
  const timeVal=document.getElementById('input-time').value;
  const recur=document.getElementById('input-recur').value;
  
  if(!amount||amount<=0){showToast('Enter a valid amount');return;}
  if(!dateVal){showToast('Select a date');return;}
  
  const datetime = timeVal ? `${dateVal}T${timeVal}` : dateVal;
  const d = parseDate(datetime);
  const key = monthKey(d.getFullYear(), d.getMonth());

  if (editingTxId) {
    const tx = appData.transactions.find(t => t.id === editingTxId);
    if (!tx) return;
    tx.type = selectedType;
    tx.amount = amount;
    tx.description = desc || (selectedType === 'income' ? 'Income' : selectedCat);
    tx.category = selectedType === 'income' ? 'Income' : selectedCat;
    tx.datetime = datetime;
    tx.monthKey = key;
    tx.notes = notes;
    tx.recur = recur;

    setSyncing('syncing');
    try {
      await dbUpdateTransaction(currentUser.id, editingTxId, tx);
      setSyncing('ok');
    } catch(e) { 
      setSyncing('error'); 
      showToast('Sync error — saved locally'); 
      updateLocalCache(currentUser.id, 'update_tx', { id: editingTxId, updates: tx });
    }
    closeModal('modal-add');
    if(navigator.vibrate) navigator.vibrate(50);
    showToast('Transaction updated');
    viewYear=d.getFullYear(); viewMonth=d.getMonth();
    updateMonthLabels(); renderHome();
    editingTxId = null;
    return;
  }

  const tx={
    id:uid(), type:selectedType, amount,
    description:desc||(selectedType==='income'?'Income':selectedCat),
    category:selectedType==='income'?'Income':selectedCat,
    datetime, monthKey:key, notes, recur, recurParent:''
  };
  setSyncing('syncing');
  try {
    await dbInsertTransaction(currentUser.id, tx);
    appData.transactions.unshift(tx);
    setSyncing('ok');
  } catch(e) { setSyncing('error'); showToast('Sync error — saved locally'); appData.transactions.unshift(tx); }
  closeModal('modal-add');
  if(navigator.vibrate) navigator.vibrate(50);
  showToast(selectedType==='expense'?`-${fmt(amount)} recorded`:`+${fmt(amount)} added`);
  viewYear=d.getFullYear(); viewMonth=d.getMonth();
  updateMonthLabels(); renderHome();
}

// ─────────────────────────────────────────────────────
// BUDGET
// ─────────────────────────────────────────────────────
function openSetBudget(){
  document.getElementById('input-budget').value=appData.budgets[currentKey()]||'';
  openModal('modal-budget');
  setTimeout(()=>document.getElementById('input-budget').focus(),350);
}
async function saveBudget(){
  const val=parseFloat(document.getElementById('input-budget').value);
  if(!val||val<=0){showToast('Enter a valid budget');return;}
  // Optimistically update in-memory state first so renderHome() sees the new value
  // regardless of whether the DB call succeeds (same pattern as saveCatBudget)
  appData.budgets[currentKey()]=val;
  setSyncing('syncing');
  try {
    await dbSaveBudget(currentUser.id, currentKey(), val);
    setSyncing('ok');
  } catch(e) { setSyncing('error'); }
  closeModal('modal-budget'); showToast(`Budget: ${fmtFull(val)}`);
  renderHome(); renderProfile();
}

// ─────────────────────────────────────────────────────
// MONTH SELECTOR
// ─────────────────────────────────────────────────────
function openMonthSelector(){
  const list=document.getElementById('month-list'), now=new Date(), items=[];
  // Add All Time option at the top of the month list picker
  const allTimeActive = filterTimeScope === 'all';
  items.push(`<div class="month-option ${allTimeActive?'active':''}" onclick="selectAllTime()">📅 All Time${allTimeActive?' <span style="color:var(--accent)">✓</span>':''}</div>`);

  for(let i=-6;i<=1;i++){
    const d=new Date(now.getFullYear(),now.getMonth()+i,1), y=d.getFullYear(), m=d.getMonth();
    const active=!allTimeActive && y===viewYear && m===viewMonth;
    items.push(`<div class="month-option ${active?'active':''}" onclick="selectMonth(${y},${m})">${MONTHS_FULL[m]} ${y}${active?' <span style="color:var(--accent)">✓</span>':''}</div>`);
  }
  list.innerHTML=items.join('');
  openModal('modal-month');
  setTimeout(()=>{const a=list.querySelector('.active');if(a)a.scrollIntoView({block:'center'});},60);
}
function selectMonth(y,m){
  viewYear=y; viewMonth=m; updateMonthLabels(); closeModal('modal-month');
  filterTimeScope = 'month';
  const a=document.querySelector('.screen.active');
  if(a.id==='screen-home') renderHome();
  if(a.id==='screen-transactions') renderTransactions();
  if(a.id==='screen-stats') renderStats();
}
function selectAllTime(){
  filterTimeScope = 'all';
  closeModal('modal-month');
  ['nav-month-label','nav-month-label-2','nav-month-label-3'].forEach(id => {
    const e = document.getElementById(id); if (e) e.textContent = 'All Time';
  });
  navigate('transactions');
}

// ─────────────────────────────────────────────────────
// TX DETAIL
// ─────────────────────────────────────────────────────
function showDetail(id){
  const tx=appData.transactions.find(t=>t.id===id); if(!tx) return;
  const cat=CATEGORIES.find(c=>c.id===tx.category)||{icon:'📌',color:'#8896b3'};
  const hasTime = tx.datetime && tx.datetime.includes('T');
  const d=parseDate(tx.datetime), isExp=tx.type==='expense';
  const rows=[['Date',d.toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})]];
  if (hasTime) {
    rows.push(['Time',d.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit',hour12:true})]);
  }
  rows.push(['Category',tx.category],['Type',`<span style="color:${isExp?'var(--red)':'var(--green)'}">${isExp?'Expense':'Income'}</span>`]);
  if(tx.notes) rows.push(['Notes',tx.notes]);
  if(tx.recur&&tx.recur!=='none') rows.push(['Recurring',tx.recur]);
  document.getElementById('detail-content').innerHTML=`
    <div style="text-align:center;padding:14px 0 18px">
      <div style="font-size:44px;margin-bottom:8px">${cat.icon}</div>
      <div style="font-size:30px;font-weight:600;font-family:var(--mono);color:${isExp?'var(--red)':'var(--green)'};letter-spacing:-1px">${isExp?'-':'+'}${fmtFull(tx.amount)}</div>
      <div style="font-size:15px;color:var(--text);margin-top:7px;font-weight:500">${tx.description}</div>
    </div>
    <div style="background:var(--surface2);border-radius:14px;padding:4px 14px;margin-bottom:14px">
      ${rows.map(([l,v],i,a)=>`<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;${i<a.length-1?'border-bottom:1px solid var(--border)':''}"><span style="color:var(--text3);font-size:12px">${l}</span><span style="font-size:13px;font-weight:500;text-align:right">${v}</span></div>`).join('')}
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
      history.replaceState({modal: 'modal-add'}, '');
    } else {
      history.pushState({modal: 'modal-add'}, '');
    }
  } else {
    history.pushState({modal: 'modal-add'}, '');
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

async function deleteTransaction(id){
  setSyncing('syncing');
  try { await dbDeleteTransaction(currentUser.id, id); } catch(e) { setSyncing('error'); }
  appData.transactions=appData.transactions.filter(t=>t.id!==id);
  setSyncing('ok'); closeModal('modal-detail'); showToast('Deleted');
  const a=document.querySelector('.screen.active');
  if(a.id==='screen-home') renderHome();
  if(a.id==='screen-transactions') renderTransactions();
}

// ─────────────────────────────────────────────────────
// RECURRING
// ─────────────────────────────────────────────────────
async function processRecurring(){
  if(!currentUser) return;
  const now=new Date(), key=monthKey(now.getFullYear(),now.getMonth());
  const templates=appData.transactions.filter(t=>t.recur&&t.recur!=='none');
  const newTxs=[];
  templates.forEach(t=>{
    if(t.recur==='monthly'){
      const alreadyExists=appData.transactions.some(x=>x.recurParent===t.id&&x.monthKey===key);
      if(!alreadyExists&&t.monthKey!==key){
        const orig=parseDate(t.datetime);
        const newDate=new Date(now.getFullYear(),now.getMonth(),Math.min(orig.getDate(),new Date(now.getFullYear(),now.getMonth()+1,0).getDate()));
        if(newDate<=now){
          newTxs.push({...t,id:uid(),monthKey:key,datetime:newDate.toISOString().slice(0,16),recur:'none',recurParent:t.id});
        }
      }
    }
  });
  if(newTxs.length){
    try { await dbBulkInsertTransactions(currentUser.id, newTxs); } catch(e){}
    appData.transactions.unshift(...newTxs);
    showToast(`${newTxs.length} recurring transaction${newTxs.length>1?'s':''} auto-logged 🔄`);
  }
}

// ─────────────────────────────────────────────────────
// EXPORT / IMPORT
// ─────────────────────────────────────────────────────
let pendingExport = null;

async function handleFileExport(blob, filename, title, text, successMsg) {
  const file = new File([blob], filename, { type: blob.type });
  
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    pendingExport = { blob, filename, title, text, successMsg, file };
    openModal('modal-export-action');
    return;
  }

  const url=URL.createObjectURL(blob), a=document.createElement('a');
  a.href=url; a.download=filename; a.click();
  URL.revokeObjectURL(url);
  showToast(successMsg);
}

async function executeExportAction(action) {
  if (!pendingExport) return;
  const { blob, filename, title, text, successMsg, file } = pendingExport;
  closeModal('modal-export-action');
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
    const url=URL.createObjectURL(blob), a=document.createElement('a');
    a.href=url; a.download=filename; a.click();
    URL.revokeObjectURL(url);
    showToast(successMsg);
  }
}

function exportCSV(){
  openModal('modal-export-csv');
}

function triggerExportCSV(exportAll) {
  closeModal('modal-export-csv');
  const curMonthLabel = getMonthLabel();
  let txs = appData.transactions;
  let filename = `spendly-all-${new Date().toISOString().slice(0,10)}.csv`;
  
  if (!exportAll) {
    txs = txs.filter(t => t.monthKey === currentKey());
    filename = `spendly-${currentKey()}-${new Date().toISOString().slice(0,10)}.csv`;
  }
  
  const rows=[['Date','Time','Type','Amount','Category','Description','Notes','Recurring','Month']];
  txs.forEach(t=>{
    const hasTime = t.datetime && t.datetime.includes('T');
    const d=parseDate(t.datetime);
    const timeVal = hasTime ? d.toLocaleTimeString('en-IN',{hour12:true}) : '';
    rows.push([d.toLocaleDateString('en-IN'),timeVal,t.type,t.amount,t.category,t.description||'',t.notes||'',t.recur||'none',t.monthKey]);
  });
  const csv=rows.map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
  const blob=new Blob([csv],{type:'text/csv'});
  const successMsg = exportAll ? 'All-time CSV downloaded' : `${curMonthLabel} CSV downloaded`;
  handleFileExport(blob, filename, 'Spendly Expense Report CSV', 'Here is my Spendly expense report.', successMsg);
}
async function importData(e){
  const file=e.target.files[0]; if(!file) return;
  const reader=new FileReader();
  reader.onload=async ev=>{
    try{
      const text=ev.target.result.trim();
      const lines=text.split(/\r?\n/).filter(l=>l.trim());
      if(lines.length<2){ showToast('CSV is empty'); return; }

      // Validate header row matches our export format
      const header=parseCSVRow(lines[0]).map(h=>h.toLowerCase());
      const expected=['date','time','type','amount','category','description','notes','recurring','month'];
      const isOurCSV=expected.every((h,i)=>header[i]===h);
      if(!isOurCSV){ showToast('Unrecognised CSV format'); return; }

      const newTxs=[];
      for(let i=1;i<lines.length;i++){
        const cols=parseCSVRow(lines[i]);
        if(cols.length<5) continue;
        const [dateStr,timeStr,type,amount,category,description='',notes='',recur='none',mKey='']= cols;
        const n=parseFloat(amount);
        if(!n||n<=0) continue;
        const datetime=parseDateFromCSV(dateStr,timeStr);
        const d=parseDate(datetime);
        const key=mKey||monthKey(d.getFullYear(),d.getMonth());
        newTxs.push({
          id:uid(), type:type==='income'?'income':'expense', amount:n,
          description:description||category, category:category||'Other',
          notes:notes||'', recur:recur==='none'?'none':(recur||'none'),
          recurParent:'', monthKey:key, datetime,
        });
      }

      if(!newTxs.length){ showToast('No valid transactions found in CSV'); return; }
      await dbBulkInsertTransactions(currentUser.id,newTxs);
      appData.transactions=[...appData.transactions,...newTxs];
      showToast(`Imported ${newTxs.length} transaction${newTxs.length>1?'s':''} ✅`);
      renderHome();
    }catch(err){ console.error(err); showToast('Import failed — check file format'); }
  };
  reader.readAsText(file); e.target.value='';
}

// Parse a single CSV line, respecting quoted fields and escaped double-quotes
function parseCSVRow(line){
  const cols=[]; let cur='', inQ=false;
  for(let i=0;i<line.length;i++){
    const ch=line[i];
    if(ch==='"'){
      if(inQ&&line[i+1]==='"'){cur+='"';i++;} else inQ=!inQ;
    } else if(ch===','&&!inQ){
      cols.push(cur.trim()); cur='';
    } else { cur+=ch; }
  }
  cols.push(cur.trim());
  return cols;
}

// Convert "DD/MM/YYYY" + "12:21:00 am" back to ISO datetime string
function parseDateFromCSV(dateStr,timeStr){
  const dm=dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  const base=dm?`${dm[3]}-${dm[2].padStart(2,'0')}-${dm[1].padStart(2,'0')}`:new Date().toISOString().slice(0,10);
  if(!timeStr) return base;
  const tm=timeStr.trim().match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(am|pm)$/i);
  if(!tm) return base;
  let h=parseInt(tm[1]);
  const period=tm[3].toLowerCase();
  if(period==='am'&&h===12) h=0;
  if(period==='pm'&&h!==12) h+=12;
  return `${base}T${String(h).padStart(2,'0')}:${tm[2]}`;
}



// ─────────────────────────────────────────────────────
// MODALS + ANDROID BACK
// ─────────────────────────────────────────────────────
function openModal(id){
  document.getElementById(id).classList.add('open');
  history.pushState({modal:id},'');
}
function closeModal(id){
  const el=document.getElementById(id);
  if(!el.classList.contains('open')) return;
  if(history.state&&history.state.modal===id) {
    history.back();
  } else {
    el.classList.remove('open');
  }
}
window.addEventListener('popstate',function(){
  const open=document.querySelector('.modal-overlay.open');
  if(open){open.classList.remove('open');return;}
  const active=document.querySelector('.screen.active');
  if(active&&active.id!=='screen-home'){navigate('home');history.pushState({},'');}
});
history.pushState({},'');
document.querySelectorAll('.modal-overlay').forEach(el=>el.addEventListener('click',function(e){
  if(e.target===this){
    closeModal(this.id);
  }
}));

// ─────────────────────────────────────────────────────
// TOAST
// ─────────────────────────────────────────────────────
let toastTimer;
function showToast(msg){
  const el=document.getElementById('toast');
  el.textContent=msg;
  el.classList.remove('show'); void el.offsetWidth; el.classList.add('show');
  clearTimeout(toastTimer); toastTimer=setTimeout(()=>el.classList.remove('show'),2500);
}

// ─────────────────────────────────────────────────────
// INIT
// ─────────────────────────────────────────────────────
(async function init(){
  // Load local settings first
  localSettings = getLocalSettings();
  applyTheme(localSettings.theme||'dark');
  updateCurrencyUI();

  // Check auth state
  dbOnAuthChange(async (event, session) => {
    if (session) {
      currentUser = session.user;
      hideAuthScreen();
      await loadAllData(currentUser.id);
      await processRecurring();
      updateMonthLabels();
      renderHome();
      checkLock();

      // Trigger password change modal if returning from a recovery email link
      if (event === 'PASSWORD_RECOVERY') {
        openChangePassword();
        showToast('Please set your new password 🔑');
      }
    } else {
      currentUser = null;
      showAuthScreen();
    }
  });

  // Check existing session immediately
  const session = await dbGetSession();
  if (!session) showAuthScreen();

  updateMonthLabels();
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(()=>{});
})();

// ═══════════════════════════════════════════════════════
// EVENT PLANNER MODULE
// ═══════════════════════════════════════════════════════

function navigateEvents() {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('screen-events').classList.add('active');
  renderEvents();
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

function renderEvents() {
  const events = dbGetEvents(currentUser.id);
  const allItems = dbGetEventItems(currentUser.id);
  const container = document.getElementById('events-list');
  if (!events.length) {
    container.innerHTML = `<div class="empty-state" style="padding-top:60px"><div class="empty-icon">🎯</div><div class="empty-title">No events yet</div><div class="empty-sub">Tap + to plan your first event</div></div>`;
    return;
  }
  const cur = getCurrencySymbol();
  container.innerHTML = events.map((ev, idx) => {
    const items = allItems.filter(i => i.eventId === ev.id);
    const totalPaid = items.reduce((s,i) => s + (i.amountPaid||0), 0);
    const totalItemEst = items.reduce((s,i) => s + (i.totalCost||0), 0);
    const budget = ev.estimatedBudget || totalItemEst;
    const pct = budget > 0 ? Math.min((totalPaid/budget)*100, 100) : 0;
    const stillOwed = items.reduce((s,i) => s + Math.max(0,(i.totalCost||0)-(i.amountPaid||0)), 0);
    return `<div class="event-card ev-animate" style="animation-delay: ${idx * 60}ms" onclick="navigateEventDetail('${ev.id}')">
      <div class="ev-card-header">
        <div style="display:flex;align-items:center;gap:12px;min-width:0">
          <div class="ev-icon-wrapper">${getEventIcon(ev.name)}</div>
          <div style="min-width:0">
            <div class="ev-card-name" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${ev.name}</div>
            ${ev.targetDate ? `<div class="ev-date">📅 ${new Date(ev.targetDate+'T12:00').toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</div>` : ''}
          </div>
        </div>
        <span class="ev-badge">${items.length} item${items.length!==1?'s':''}</span>
      </div>
      <div class="ev-stats-row">
        <div class="ev-stat-item"><div class="ev-stat-val green">${fmt(totalPaid)}</div><div class="ev-stat-lbl">Paid</div></div>
        ${stillOwed>0 ? `<div class="ev-stat-item"><div class="ev-stat-val red">${fmt(stillOwed)}</div><div class="ev-stat-lbl">Still Owed</div></div>` : ''}
        ${budget>0 ? `<div class="ev-stat-item"><div class="ev-stat-val accent">${fmt(budget)}</div><div class="ev-stat-lbl">${ev.estimatedBudget?'Est. Budget':'Items Est.'}</div></div>` : ''}
      </div>
      ${budget>0 ? `<div class="progress-bar" style="margin-top:12px"><div class="progress-fill${pct>80?' warn':''}" style="width:${pct}%"></div></div>
      <div style="font-size:11px;color:var(--text3);text-align:right;margin-top:4px">${Math.round(pct)}% funded</div>` : ''}
    </div>`;
  }).join('<div class="event-separator"></div>');
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
  const totalPaid = items.reduce((s,i) => s + (i.amountPaid||0), 0);
  const totalOwed = items.reduce((s,i) => s + Math.max(0,(i.totalCost||0)-(i.amountPaid||0)), 0);
  const budget = ev.estimatedBudget || items.reduce((s,i) => s + (i.totalCost||0), 0);
  const pct = budget > 0 ? Math.min((totalPaid/budget)*100,100) : 0;

  document.getElementById('ev-detail-name').textContent = ev.name;
  document.getElementById('ev-detail-date').textContent = ev.targetDate
    ? `📅 ${new Date(ev.targetDate+'T12:00').toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})}`
    : '';

  document.getElementById('ev-summary').innerHTML = `
    <div class="ev-hero-stats">
      <div class="ev-hero-card paid">
        <div class="ev-hero-val green">${fmt(totalPaid)}</div>
        <div class="ev-hero-lbl">Paid</div>
      </div>
      ${totalOwed > 0 ? `<div class="ev-hero-card owed">
        <div class="ev-hero-val red">${fmt(totalOwed)}</div>
        <div class="ev-hero-lbl">Still Owed</div>
      </div>` : ''}
      ${budget > 0 ? `<div class="ev-hero-card budget">
        <div class="ev-hero-val accent">${fmt(budget)}</div>
        <div class="ev-hero-lbl">${ev.estimatedBudget?'Est. Budget':'Items Est.'}</div>
      </div>` : ''}
    </div>
    ${budget > 0 ? `
      <div class="progress-bar" style="margin:14px 0 4px">
        <div class="progress-fill${pct>80?' warn':''}" style="width:${pct}%"></div>
      </div>
      <div style="font-size:11px;color:var(--text3);text-align:right;margin-bottom:12px">${Math.round(pct)}% funded</div>
    ` : ''}`;

  document.getElementById('ev-items-list').innerHTML = items.length === 0
    ? `<div class="empty-state"><div class="empty-icon">📋</div><div class="empty-title">No expenses yet</div><div class="empty-sub">Tap "Add Expense" to start tracking</div></div>`
    : items.map((item, idx) => {
        const rem = item.totalCost > 0 ? Math.max(0, item.totalCost - (item.amountPaid||0)) : 0;
        const ipct = item.totalCost > 0 ? Math.min(((item.amountPaid||0)/item.totalCost)*100, 100) : 0;
        const isPaid = item.totalCost > 0 && rem === 0;
        const statusClass = item.totalCost > 0 ? (isPaid ? 'paid' : 'owed') : '';
        return `<div class="ev-item-card ev-animate ${statusClass}" style="animation-delay: ${idx * 40}ms" onclick="openEditEventItem('${item.id}')">
          <div class="ev-item-row">
            <div class="ev-item-name">${item.name}</div>
            <div style="text-align:right;flex-shrink:0">
              <div style="font-size:15px;font-weight:600;font-family:var(--mono);color:var(--green)">${fmt(item.amountPaid||0)}</div>
              ${item.totalCost>0 ? `<div style="font-size:10px;color:var(--text3)">of ${fmt(item.totalCost)}</div>` : `<div style="font-size:10px;color:var(--text3)">paid</div>`}
            </div>
          </div>
          ${item.totalCost > 0 ? `
            <div class="progress-bar" style="margin:8px 0 5px">
              <div class="progress-fill${ipct>80?' warn':''}" style="width:${ipct}%"></div>
            </div>
            ${rem > 0 ? `<div style="font-size:11px;color:var(--red)">⏳ ${fmt(rem)} remaining</div>`
                      : `<div style="font-size:11px;color:var(--green)">✅ Fully paid</div>`}
          ` : ''}
          ${item.notes ? `<div style="font-size:11px;color:var(--text3);margin-top:6px">💬 ${item.notes}</div>` : ''}
        </div>`;
      }).join('');
}

// ─── Add / Edit Event ─────────────────────────────────
function openAddEvent() {
  editingEventId = null;
  document.getElementById('input-event-name').value = '';
  document.getElementById('input-event-budget').value = '';
  document.getElementById('input-event-date').value = '';
  document.getElementById('modal-add-event').querySelector('.sheet-title').textContent = 'New Event';
  document.getElementById('ev-submit-btn').textContent = 'Create Event';
  document.getElementById('ev-delete-btn').style.display = 'none';
  openModal('modal-add-event');
  setTimeout(()=>document.getElementById('input-event-name').focus(), 350);
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
  openModal('modal-add-event');
}

function submitEvent() {
  const name = document.getElementById('input-event-name').value.trim();
  if (!name) { showToast('Enter an event name'); return; }
  const budget = parseFloat(document.getElementById('input-event-budget').value) || 0;
  const targetDate = document.getElementById('input-event-date').value;
  const event = { id: editingEventId||uid(), name, estimatedBudget: budget, targetDate, createdAt: new Date().toISOString() };
  dbSaveEvent(currentUser.id, event);
  closeModal('modal-add-event');
  if (editingEventId) { renderEventDetail(); showToast('Event updated'); }
  else { navigateEventDetail(event.id); showToast(`"${name}" created 🎉`); }
}

function deleteEvent() {
  const ev = dbGetEvents(currentUser.id).find(e => e.id === currentEventId);
  if (!ev || !confirm(`Delete "${ev.name}" and all its expenses?`)) return;
  dbDeleteEvent(currentUser.id, currentEventId);
  closeModal('modal-add-event');
  navigateEvents();
  showToast('Event deleted');
}

// ─── Add / Edit Event Item ────────────────────────────
function openAddEventItem() {
  editingEventItemId = null;
  ['input-ei-name','input-ei-paid','input-ei-total','input-ei-notes'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('modal-add-event-item').querySelector('.sheet-title').textContent = 'Add Expense';
  document.getElementById('ei-submit-btn').textContent = 'Add';
  document.getElementById('ei-delete-btn').style.display = 'none';
  openModal('modal-add-event-item');
  setTimeout(()=>document.getElementById('input-ei-name').focus(), 350);
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
  const item = { id: editingEventItemId||uid(), eventId: currentEventId, name, amountPaid, totalCost, notes, updatedAt: new Date().toISOString() };
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

