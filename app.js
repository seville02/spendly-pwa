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

// ─────────────────────────────────────────────────────
// STATE
// ─────────────────────────────────────────────────────
let currentUser   = null;
let appData       = { transactions:[], budgets:{}, catBudgets:{}, debts:[], profile:{} };
let localSettings = { theme:'dark', pinEnabled:false, pinHash:'', currency:'₹', summaryDismissed:'' };

let viewYear      = new Date().getFullYear();
let viewMonth     = new Date().getMonth();
let selectedType  = 'expense';
let selectedCat   = 'Food';
let filterCategory= 'all';
let activeStatsTab= 'overview';
let debtType      = 'owe';
let charts        = { donut:null, bar:null, line:null, compare:null };

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
  n = Math.round(n);
  if (n >= 100000) return sym+(n/100000).toFixed(1)+'L';
  if (n >= 1000)   return sym+(n/1000).toFixed(1)+'K';
  return sym+n.toLocaleString('en-IN');
}
function fmtFull(n) {
  return getCurrencySymbol()+Number(n).toLocaleString('en-IN',{maximumFractionDigits:2});
}
function uid() { return Date.now().toString(36)+Math.random().toString(36).slice(2); }

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
  document.getElementById('auth-tab-signin').className = 'auth-tab'+(mode==='signin'?' active':'');
  document.getElementById('auth-tab-signup').className = 'auth-tab'+(mode==='signup'?' active':'');
  document.getElementById('auth-name-wrap').style.display = mode==='signup' ? 'block' : 'none';
  document.getElementById('auth-btn').textContent = mode==='signup' ? 'Create Account' : 'Sign In';
  document.getElementById('auth-title').textContent = mode==='signup' ? 'Create account' : 'Welcome back';
  document.getElementById('auth-sub').textContent = mode==='signup' ? 'Start tracking your money' : 'Sign in to your Spendly account';
  document.getElementById('auth-error').textContent = '';
}

async function handleAuth() {
  const email = document.getElementById('auth-email').value.trim();
  const password = document.getElementById('auth-password').value;
  const name = document.getElementById('auth-name').value.trim();
  const btn = document.getElementById('auth-btn');
  const errEl = document.getElementById('auth-error');

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
      recurParent: t.recur_parent,
      monthKey:    t.month_key,
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
  return appData.transactions.filter(t => t.monthKey === currentKey());
}

function renderHome() {
  const txs    = getMonthTx();
  const budget = appData.budgets[currentKey()] || 0;
  const spent  = txs.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0);
  const income = txs.filter(t=>t.type==='income').reduce((s,t)=>s+t.amount,0);
  const remaining = budget - spent;
  const pct = budget>0 ? Math.min((spent/budget)*100,100) : 0;

  document.getElementById('remaining-amt').textContent =
    Math.abs(remaining).toLocaleString('en-IN',{maximumFractionDigits:0});
  document.getElementById('hero-currency').textContent = getCurrencySymbol();
  document.getElementById('hero-sub').textContent = budget>0
    ? (remaining<0 ? '⚠️ Over budget by '+fmt(Math.abs(remaining)) : fmt(spent)+' spent · '+fmt(remaining)+' left')
    : 'Tap "Set Budget" to get started';
  document.getElementById('stat-budget').textContent = fmt(budget);
  document.getElementById('stat-spent').textContent  = fmt(spent);
  document.getElementById('stat-income').textContent = fmt(income);

  // Daily limit
  const today    = new Date();
  const daysLeft = new Date(viewYear,viewMonth+1,0).getDate() - today.getDate() + 1;
  const pill     = document.getElementById('daily-limit-pill');
  if (budget>0 && remaining>0 && daysLeft>0) {
    pill.style.display = 'inline-flex';
    document.getElementById('daily-limit-text').textContent = fmt(remaining/daysLeft)+'/day left';
  } else { pill.style.display='none'; }

  const fill = document.getElementById('progress-fill');
  fill.style.width = pct+'%';
  fill.className   = 'progress-fill'+(pct>80?' warn':'');

  const banner = document.getElementById('budget-banner');
  if (budget>0 && remaining<0) {
    banner.classList.add('show');
    document.getElementById('budget-banner-text').textContent = 'Over budget — spent '+fmt(Math.abs(remaining))+' extra';
  } else if (budget>0 && pct>=80) {
    banner.classList.add('show');
    document.getElementById('budget-banner-text').textContent = Math.round(pct)+'% used · '+fmt(remaining)+' remaining';
  } else { banner.classList.remove('show'); }

  renderSummaryBanner();
  renderStreak();
  renderCatBudgetHome(txs);
  renderAISummarySection();

  const recent = [...txs].sort((a,b)=>new Date(b.datetime)-new Date(a.datetime)).slice(0,5);
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
  const d   = new Date(tx.datetime);
  const ds  = d.toLocaleDateString('en-IN',{day:'numeric',month:'short'});
  const ts  = d.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit',hour12:true});
  const note= tx.notes ? ` · ${tx.notes}` : '';
  const recur= tx.recur&&tx.recur!=='none' ? `<span class="tx-recur-badge">🔄 ${tx.recur}</span>` : '';
  const inner = `
    <div class="tx-item" data-id="${tx.id}" onclick="showDetail('${tx.id}')">
      <div class="tx-icon" style="background:${cat.color}22;color:${cat.color}">${cat.icon}</div>
      <div class="tx-info">
        <div class="tx-desc">${tx.description||tx.category}</div>
        <div class="tx-meta">${tx.category} · ${ds}, ${ts}${note}</div>
      </div>
      <div class="tx-right">
        <div class="tx-amount ${tx.type}">${tx.type==='expense'?'-':'+'}${fmt(tx.amount)}</div>
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
  let txs = getMonthTx().sort((a,b)=>new Date(b.datetime)-new Date(a.datetime));

  if (filterCategory==='expense')   txs=txs.filter(t=>t.type==='expense');
  else if (filterCategory==='income')    txs=txs.filter(t=>t.type==='income');
  else if (filterCategory==='recurring') txs=txs.filter(t=>t.recur&&t.recur!=='none');
  else if (filterCategory!=='all')       txs=txs.filter(t=>t.category===filterCategory);

  if (search) txs=txs.filter(t=>(t.description||'').toLowerCase().includes(search)||(t.category||'').toLowerCase().includes(search)||(t.notes||'').toLowerCase().includes(search)||String(t.amount).includes(search));

  // Rebuild chips
  const usedCats=[...new Set(getMonthTx().map(t=>t.category))];
  const hasRecur=getMonthTx().some(t=>t.recur&&t.recur!=='none');
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
    const k=new Date(tx.datetime).toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short'});
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
  const totalSpent=expenses.reduce((s,t)=>s+t.amount,0), totalIncome=incomes.reduce((s,t)=>s+t.amount,0);
  const daysInMonth=new Date(viewYear,viewMonth+1,0).getDate();
  const maxTx=expenses.reduce((m,t)=>t.amount>m?t.amount:m,0);

  if(activeStatsTab==='overview'){
    document.getElementById('s-spent').textContent=fmt(totalSpent);
    document.getElementById('s-income').textContent=fmt(totalIncome);
    document.getElementById('s-count').textContent=txs.length;
    document.getElementById('s-avg').textContent=fmt(totalSpent/daysInMonth);
    document.getElementById('s-max').textContent=fmt(maxTx);
    document.getElementById('s-net').textContent=fmt(totalIncome-totalSpent);
    const catTotals={};expenses.forEach(t=>{catTotals[t.category]=(catTotals[t.category]||0)+t.amount;});
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
    const catTotals={};expenses.forEach(t=>{catTotals[t.category]=(catTotals[t.category]||0)+t.amount;});
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
    const mt={};expenses.forEach(t=>{const m=(t.description||t.category).trim();mt[m]=mt[m]||{total:0,count:0};mt[m].total+=t.amount;mt[m].count++;});
    const sorted=Object.entries(mt).sort((a,b)=>b[1].total-a[1].total).slice(0,10);
    document.getElementById('merchant-list').innerHTML=sorted.length===0
      ?'<div class="empty-state"><div class="empty-icon">🏪</div><div class="empty-title">No data yet</div></div>'
      :sorted.map(([name,{total,count}],i)=>`<div class="merchant-item"><div><div class="merchant-name">${i+1}. ${name}</div><div class="merchant-meta">${count} transaction${count>1?'s':''}</div></div><div class="merchant-amt">${fmt(total)}</div></div>`).join('');
  }
  if(activeStatsTab==='daily'){
    const dt={};for(let i=1;i<=daysInMonth;i++)dt[i]=0;
    expenses.forEach(t=>{const d=new Date(t.datetime).getDate();dt[d]=(dt[d]||0)+t.amount;});
    const days=Object.keys(dt).map(Number), vals=Object.values(dt);
    destroyChart('bar');
    charts.bar=new Chart(document.getElementById('bar-chart').getContext('2d'),{type:'bar',data:{labels:days,datasets:[{data:vals,backgroundColor:'rgba(79,209,197,.3)',borderColor:'rgba(79,209,197,.8)',borderWidth:1,borderRadius:3}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>` ${fmt(c.raw)}`}}},scales:{x:{ticks:{color:'var(--text3)',font:{size:9}},grid:{display:false}},y:{ticks:{color:'var(--text3)',font:{size:9},callback:v=>fmt(v)},grid:{color:'var(--border)'}}}}});
    let cum=0;const cumVals=vals.map(v=>{cum+=v;return cum;});
    destroyChart('line');
    charts.line=new Chart(document.getElementById('line-chart').getContext('2d'),{type:'line',data:{labels:days,datasets:[{data:cumVals,borderColor:'#4fd1c5',backgroundColor:'rgba(79,209,197,.07)',borderWidth:2,pointRadius:0,fill:true,tension:.4}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>` ${fmt(c.raw)}`}}},scales:{x:{ticks:{color:'var(--text3)',font:{size:9}},grid:{display:false}},y:{ticks:{color:'var(--text3)',font:{size:9},callback:v=>fmt(v)},grid:{color:'var(--border)'}}}}});
  }
  if(activeStatsTab==='compare'){
    const m6=[];for(let i=5;i>=0;i--){const d=new Date(viewYear,viewMonth-i,1);m6.push({y:d.getFullYear(),m:d.getMonth(),label:MONTHS[d.getMonth()]+"'"+(d.getFullYear().toString().slice(2))});}
    const spentA=m6.map(({y,m})=>appData.transactions.filter(t=>t.monthKey===monthKey(y,m)&&t.type==='expense').reduce((s,t)=>s+t.amount,0));
    const incA=m6.map(({y,m})=>appData.transactions.filter(t=>t.monthKey===monthKey(y,m)&&t.type==='income').reduce((s,t)=>s+t.amount,0));
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
  document.getElementById('profile-day-input').value=p.budget_day||6;
  document.getElementById('profile-currency-input').value=s.currency||detectCurrency();
  document.getElementById('profile-display-name').textContent=p.name||currentUser?.email||'My Account';
  document.getElementById('profile-email').textContent=currentUser?.email||'';
  document.getElementById('profile-avatar').textContent=p.name?p.name[0].toUpperCase():'💼';
  const day=p.budget_day||6;
  let sfx='th';
  if(day%10===1 && day!==11) sfx='st';
  else if(day%10===2 && day!==12) sfx='nd';
  else if(day%10===3 && day!==13) sfx='rd';
  document.getElementById('profile-sub').textContent=`Budget resets on the ${day}${sfx} · ${getResetMonthLabel()}`;
  document.getElementById('budget-day-label').textContent=day+sfx;
  document.getElementById('profile-budget-val').textContent=(appData.budgets[currentKey()]||0)>0?fmtFull(appData.budgets[currentKey()])+' / month':'Not set';
  const activeDebts=(appData.debts||[]).filter(d=>!d.settled).length;
  document.getElementById('debt-tracker-val').textContent=activeDebts>0?`${activeDebts} active debt${activeDebts>1?'s':''}`:'Track who owes who';
  const pinOn=s.pinEnabled;
  document.getElementById('pin-toggle').className='toggle'+(pinOn?' on':'');
  document.getElementById('pin-status-label').textContent=pinOn?'Enabled':'Disabled';
  renderCatBudgetSettings();
}

function renderCatBudgetSettings(){
  const cb=appData.catBudgets||{};
  const top=['Food','Groceries','Transport','Dining Out','Entertainment','Shopping','Utilities','Rent','EMI / Loan'];
  document.getElementById('cat-budget-settings').innerHTML=top.map(cat=>{
    const c=CATEGORIES.find(x=>x.id===cat)||{icon:'📌'};
    return `<div class="edit-field" style="margin-bottom:8px">
      <span class="edit-field-label" style="width:120px">${c.icon} ${cat}</span>
      <input type="number" placeholder="No limit" value="${cb[cat]||''}" style="flex:1;background:none;border:none;outline:none;padding:11px 0;font-size:13px;font-family:var(--font);color:var(--text)" onblur="saveCatBudget('${cat}',this.value)" onkeydown="if(event.key==='Enter')this.blur()">
    </div>`;
  }).join('');
}

async function autoSaveProfile(){
  const p={
    name: document.getElementById('profile-name-input').value.trim(),
    budget_day: Math.max(1, Math.min(28, parseInt(document.getElementById('profile-day-input').value)||6)),
    settings: appData.profile?.settings||{}
  };
  const s=getLocalSettings();
  s.currency=document.getElementById('profile-currency-input').value.trim()||detectCurrency();
  saveLocalSettings(s); localSettings=s;
  appData.profile={...appData.profile,...p};
  setSyncing('syncing');
  try { await dbSaveProfile(currentUser.id, p); setSyncing('ok'); } catch(e) { setSyncing('error'); }
  document.getElementById('profile-display-name').textContent=p.name||currentUser?.email||'My Account';
  document.getElementById('profile-avatar').textContent=p.name?p.name[0].toUpperCase():'💼';
  showToast('Saved ✓');
}

async function saveCatBudget(cat, val){
  const n=parseFloat(val);
  setSyncing('syncing');
  try {
    await dbSaveCatBudget(currentUser.id, cat, n||0);
    if(n>0) appData.catBudgets[cat]=n; else delete appData.catBudgets[cat];
    setSyncing('ok');
    showToast(n>0?`${cat} budget: ${fmt(n)}`:`${cat} budget removed`);
  } catch(e) { setSyncing('error'); showToast('Sync error'); }
}

// ─────────────────────────────────────────────────────
// ADD TRANSACTION
// ─────────────────────────────────────────────────────
function openAddExpense(){
  const now=new Date(), local=new Date(now.getTime()-now.getTimezoneOffset()*60000);
  document.getElementById('input-datetime').value=local.toISOString().slice(0,16);
  ['input-amount','input-desc','input-notes'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('input-recur').value='none';
  setType('expense'); selectedCat='Food'; renderCatGrid();
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
  const datetime=document.getElementById('input-datetime').value;
  const recur=document.getElementById('input-recur').value;
  if(!amount||amount<=0){showToast('Enter a valid amount');return;}
  if(!datetime){showToast('Select date & time');return;}
  const d=new Date(datetime), key=monthKey(d.getFullYear(),d.getMonth());
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
  setSyncing('syncing');
  try {
    await dbSaveBudget(currentUser.id, currentKey(), val);
    appData.budgets[currentKey()]=val;
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
  for(let i=-6;i<=1;i++){
    const d=new Date(now.getFullYear(),now.getMonth()+i,1), y=d.getFullYear(), m=d.getMonth();
    const active=y===viewYear&&m===viewMonth;
    items.push(`<div class="month-option ${active?'active':''}" onclick="selectMonth(${y},${m})">${MONTHS_FULL[m]} ${y}${active?'<span style="color:var(--accent)">✓</span>':''}</div>`);
  }
  list.innerHTML=items.join('');
  openModal('modal-month');
  setTimeout(()=>{const a=list.querySelector('.active');if(a)a.scrollIntoView({block:'center'});},60);
}
function selectMonth(y,m){
  viewYear=y; viewMonth=m; updateMonthLabels(); closeModal('modal-month');
  const a=document.querySelector('.screen.active');
  if(a.id==='screen-home') renderHome();
  if(a.id==='screen-transactions') renderTransactions();
  if(a.id==='screen-stats') renderStats();
}

// ─────────────────────────────────────────────────────
// TX DETAIL
// ─────────────────────────────────────────────────────
function showDetail(id){
  const tx=appData.transactions.find(t=>t.id===id); if(!tx) return;
  const cat=CATEGORIES.find(c=>c.id===tx.category)||{icon:'📌',color:'#8896b3'};
  const d=new Date(tx.datetime), isExp=tx.type==='expense';
  const rows=[['Date',d.toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})],['Time',d.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit',hour12:true})],['Category',tx.category],['Type',`<span style="color:${isExp?'var(--red)':'var(--green)'}">${isExp?'Expense':'Income'}</span>`]];
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
    <button class="submit-btn danger" onclick="deleteTransaction('${tx.id}')">Delete Transaction</button>`;
  openModal('modal-detail');
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
        const orig=new Date(t.datetime);
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
async function handleFileExport(blob, filename, title, text, successMsg) {
  const file = new File([blob], filename, { type: blob.type });
  
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    const shareChoice = confirm(`Do you want to Email / Share this report?\n\nClick OK to share via Email, WhatsApp, or other apps.\nClick Cancel to download directly to your device.`);
    if (shareChoice) {
      try {
        await navigator.share({
          files: [file],
          title: title,
          text: text
        });
        showToast('Shared successfully!');
        return;
      } catch (e) {
        if (e.name !== 'AbortError') {
          console.error('Error sharing file', e);
        }
      }
    }
  }

  const url=URL.createObjectURL(blob), a=document.createElement('a');
  a.href=url; a.download=filename; a.click();
  URL.revokeObjectURL(url);
  showToast(successMsg);
}
function exportJSON(){
  const curMonthLabel = getMonthLabel();
  const exportAll = !confirm(`Do you want to export only the data for ${curMonthLabel}?\n\nClick OK for ${curMonthLabel} only.\nClick Cancel for a Full Backup.`);
  
  let dataToExport = appData;
  let filename = `spendly-backup-${new Date().toISOString().slice(0,10)}.json`;
  
  if (!exportAll) {
    dataToExport = {
      transactions: appData.transactions.filter(t => t.monthKey === currentKey()),
      budgets: { [currentKey()]: appData.budgets[currentKey()] || 0 },
      catBudgets: appData.catBudgets,
      debts: appData.debts,
      profile: appData.profile
    };
    filename = `spendly-backup-${currentKey()}-${new Date().toISOString().slice(0,10)}.json`;
  }
  
  const blob=new Blob([JSON.stringify(dataToExport,null,2)],{type:'application/json'});
  const successMsg = exportAll ? 'Full JSON backup downloaded' : `${curMonthLabel} JSON downloaded`;
  handleFileExport(blob, filename, 'Spendly Backup JSON', 'Here is my Spendly backup file.', successMsg);
}
function exportCSV(){
  const curMonthLabel = getMonthLabel();
  const exportAll = !confirm(`Do you want to export only the transactions for ${curMonthLabel}?\n\nClick OK for ${curMonthLabel} only.\nClick Cancel for All Time.`);
  
  let txs = appData.transactions;
  let filename = `spendly-all-${new Date().toISOString().slice(0,10)}.csv`;
  
  if (!exportAll) {
    txs = txs.filter(t => t.monthKey === currentKey());
    filename = `spendly-${currentKey()}-${new Date().toISOString().slice(0,10)}.csv`;
  }
  
  const rows=[['Date','Time','Type','Amount','Category','Description','Notes','Recurring','Month']];
  txs.forEach(t=>{
    const d=new Date(t.datetime);
    rows.push([d.toLocaleDateString('en-IN'),d.toLocaleTimeString('en-IN',{hour12:true}),t.type,t.amount,t.category,t.description||'',t.notes||'',t.recur||'none',t.monthKey]);
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
      const imp=JSON.parse(ev.target.result);
      if(!imp.transactions) throw new Error();
      const ids=new Set(appData.transactions.map(t=>t.id));
      const newTxs=imp.transactions.filter(t=>!ids.has(t.id));
      await dbBulkInsertTransactions(currentUser.id, newTxs);
      appData.transactions=[...appData.transactions,...newTxs];
      if(imp.budgets) { for(const[k,v] of Object.entries(imp.budgets)){await dbSaveBudget(currentUser.id,k,v);appData.budgets[k]=v;} }
      showToast(`Imported ${newTxs.length} transactions`);
      renderHome();
    }catch(err){showToast('Invalid backup file');}
  };
  reader.readAsText(file); e.target.value='';
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
  el.classList.remove('open');
  if(history.state&&history.state.modal===id) history.back();
}
window.addEventListener('popstate',function(){
  const open=document.querySelector('.modal-overlay.open');
  if(open){open.classList.remove('open');return;}
  const active=document.querySelector('.screen.active');
  if(active&&active.id!=='screen-home'){navigate('home');history.pushState({},'');}
});
history.pushState({},'');
document.querySelectorAll('.modal-overlay').forEach(el=>el.addEventListener('click',function(e){if(e.target===this){this.classList.remove('open');if(history.state&&history.state.modal===this.id)history.back();}}));

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

  // Check auth state
  dbOnAuthChange(async session => {
    if (session) {
      currentUser = session.user;
      hideAuthScreen();
      await loadAllData(currentUser.id);
      await processRecurring();
      updateMonthLabels();
      renderHome();
      checkLock();
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
