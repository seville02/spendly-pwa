// ═══════════════════════════════════════════════════════
// db.js — Supabase database layer with Local Fallback & Offline Caching
// All auth + data operations live here.
// app.js calls these functions; never calls Supabase directly.
// ═══════════════════════════════════════════════════════

// Detect if we should run in Local-Only Mode
const useLocalDB = !SUPABASE_URL || !SUPABASE_ANON;

// ── Init Supabase client (only if credentials are provided) ─────────────────
let _sb = null;
if (!useLocalDB) {
  try {
    _sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON, {
      auth: {
        persistSession: true,          // keeps user logged in across app restarts
        autoRefreshToken: true,        // silently refreshes token before expiry
        detectSessionInUrl: false,
        storage: localStorage,
      }
    });
  } catch (e) {
    console.error("Failed to initialize Supabase client. Falling back to Local-Only mode.", e);
  }
}

// ── Local Storage Caching & Sync Queue ──────────────────────────────────────
let syncQueue = [];
let authCallback = null;
let isSyncingQueue = false;

function loadSyncQueue(userId) {
  try {
    syncQueue = JSON.parse(localStorage.getItem(`spendly_pending_${userId}`) || '[]');
  } catch (e) {
    syncQueue = [];
  }
}

function saveSyncQueue(userId) {
  localStorage.setItem(`spendly_pending_${userId}`, JSON.stringify(syncQueue));
}

function queueSyncOperation(userId, op) {
  syncQueue.push(op);
  saveSyncQueue(userId);
  attemptSync(userId);
}

function updateLocalCache(userId, action, data) {
  const cached = localStorage.getItem(`spendly_data_${userId}`);
  const cache = cached ? JSON.parse(cached) : { transactions: [], budgets: {}, catBudgets: {}, debts: [], profile: {} };
  
  switch (action) {
    case 'insert_tx':
      cache.transactions = (cache.transactions || []).filter(t => t.id !== data.id);
      cache.transactions.unshift(data);
      break;
    case 'delete_tx':
      cache.transactions = (cache.transactions || []).filter(t => t.id !== data.id);
      break;
    case 'update_tx':
      cache.transactions = (cache.transactions || []).map(t => t.id === data.id ? { ...t, ...data.updates } : t);
      break;
    case 'save_budget':
      cache.budgets = cache.budgets || {};
      cache.budgets[data.monthKey] = data.amount;
      break;
    case 'save_cat_budget':
      cache.catBudgets = cache.catBudgets || {};
      if (data.amount > 0) {
        cache.catBudgets[data.category] = data.amount;
      } else {
        delete cache.catBudgets[data.category];
      }
      break;
    case 'insert_debt':
      cache.debts = (cache.debts || []).filter(d => d.id !== data.id);
      cache.debts.unshift(data);
      break;
    case 'update_debt':
      cache.debts = (cache.debts || []).map(d => d.id === data.id ? { ...d, ...data.updates } : d);
      break;
    case 'delete_debt':
      cache.debts = (cache.debts || []).filter(d => d.id !== data.id);
      break;
    case 'save_profile':
      cache.profile = { ...cache.profile, ...data };
      break;
  }
  
  localStorage.setItem(`spendly_data_${userId}`, JSON.stringify(cache));
}

function getLocalSession() {
  const email = localStorage.getItem('spendly_local_user');
  if (email) {
    return { user: { id: 'local-user', email } };
  }
  return null;
}

// Background sync function
async function attemptSync(userId) {
  if (useLocalDB || !_sb || isSyncingQueue || !navigator.onLine) return;
  loadSyncQueue(userId);
  if (syncQueue.length === 0) return;

  isSyncingQueue = true;
  if (typeof setSyncing === 'function') setSyncing('syncing');

  try {
    while (syncQueue.length > 0) {
      const op = syncQueue[0];
      let success = false;
      
      try {
        switch (op.type) {
          case 'insert_tx':
            await _dbInsertTransactionRaw(userId, op.tx);
            break;
          case 'delete_tx':
            await _dbDeleteTransactionRaw(userId, op.id);
            break;
          case 'update_tx':
            await _dbUpdateTransactionRaw(userId, op.id, op.updates);
            break;
          case 'save_budget':
            await _dbSaveBudgetRaw(userId, op.monthKey, op.amount);
            break;
          case 'save_cat_budget':
            await _dbSaveCatBudgetRaw(userId, op.category, op.amount);
            break;
          case 'insert_debt':
            await _dbInsertDebtRaw(userId, op.debt);
            break;
          case 'update_debt':
            await _dbUpdateDebtRaw(userId, op.id, op.updates);
            break;
          case 'delete_debt':
            await _dbDeleteDebtRaw(userId, op.id);
            break;
          case 'save_profile':
            await _dbSaveProfileRaw(userId, op.profile);
            break;
        }
        success = true;
      } catch (err) {
        console.error('Failed to sync operation', op, err);
        if (err.status >= 400 && err.status < 500) {
          success = true; 
        } else {
          break; // Stop and retry later
        }
      }

      if (success) {
        syncQueue.shift();
        saveSyncQueue(userId);
      }
    }

    if (typeof setSyncing === 'function') {
      setSyncing(syncQueue.length === 0 ? 'ok' : 'error');
    }
  } finally {
    isSyncingQueue = false;
  }
}

window.addEventListener('online', () => {
  const session = getLocalSession();
  if (session) attemptSync(session.user.id);
});

// ─────────────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────────────

async function dbSignUp(email, password, name) {
  if (useLocalDB) {
    localStorage.setItem('spendly_local_user', email);
    // Only initialise fresh data if nothing exists yet — preserve any existing data
    if (!localStorage.getItem('spendly_data_local-user')) {
      const profile = { name, budget_day: 1 };
      localStorage.setItem('spendly_data_local-user', JSON.stringify({ transactions: [], budgets: {}, catBudgets: {}, debts: [], profile }));
    }
    if (authCallback) authCallback(getLocalSession());
    return { user: { id: 'local-user', email } };
  }
  const { data, error } = await _sb.auth.signUp({
    email,
    password,
    options: { data: { name } }
  });
  if (error) throw error;
  return data;
}

async function dbSignIn(email, password) {
  if (useLocalDB) {
    localStorage.setItem('spendly_local_user', email);
    if (authCallback) authCallback(getLocalSession());
    return { user: { id: 'local-user', email } };
  }
  const { data, error } = await _sb.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

async function dbSignOut() {
  if (useLocalDB) {
    localStorage.removeItem('spendly_local_user');
    if (authCallback) authCallback(null);
    return;
  }
  const { error } = await _sb.auth.signOut();
  if (error) throw error;
}

async function dbGetSession() {
  if (useLocalDB) {
    return getLocalSession();
  }
  const { data } = await _sb.auth.getSession();
  return data?.session ?? null;
}

async function dbGetUser() {
  if (useLocalDB) {
    const session = getLocalSession();
    return session ? session.user : null;
  }
  const { data } = await _sb.auth.getUser();
  return data?.user ?? null;
}

// Listen for auth state changes (login / logout / token refresh)
function dbOnAuthChange(callback) {
  if (useLocalDB) {
    authCallback = callback;
    const session = getLocalSession();
    setTimeout(() => callback(session), 0);
    return { data: { subscription: { unsubscribe: () => { authCallback = null; } } } };
  }
  return _sb.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
}

// ─────────────────────────────────────────────────────
// PROFILE
// ─────────────────────────────────────────────────────

async function dbGetProfile(userId) {
  if (useLocalDB) {
    const cached = localStorage.getItem(`spendly_data_${userId}`);
    return cached ? (JSON.parse(cached).profile || {}) : {};
  }
  const { data, error } = await _sb
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

async function dbSaveProfile(userId, profile) {
  updateLocalCache(userId, 'save_profile', profile);
  if (useLocalDB) return;
  try {
    await _dbSaveProfileRaw(userId, profile);
  } catch (e) {
    console.warn('Supabase save profile failed, queueing', e);
    queueSyncOperation(userId, { type: 'save_profile', profile });
  }
}

async function _dbSaveProfileRaw(userId, profile) {
  const { error } = await _sb
    .from('profiles')
    .upsert({ id: userId, ...profile }, { onConflict: 'id' });
  if (error) throw error;
}

// ─────────────────────────────────────────────────────
// TRANSACTIONS
// ─────────────────────────────────────────────────────

async function dbGetTransactions(userId) {
  if (useLocalDB) {
    const cached = localStorage.getItem(`spendly_data_${userId}`);
    return cached ? (JSON.parse(cached).transactions || []) : [];
  }
  const { data, error } = await _sb
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('datetime', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

async function dbGetTransactionsByMonth(userId, monthKey) {
  if (useLocalDB) {
    const txs = await dbGetTransactions(userId);
    return txs.filter(t => t.month_key === monthKey || t.monthKey === monthKey);
  }
  const { data, error } = await _sb
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .eq('month_key', monthKey)
    .order('datetime', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

async function dbInsertTransaction(userId, tx) {
  updateLocalCache(userId, 'insert_tx', tx);
  if (useLocalDB) return;
  try {
    await _dbInsertTransactionRaw(userId, tx);
  } catch (e) {
    console.warn('Supabase insert transaction failed, queueing', e);
    queueSyncOperation(userId, { type: 'insert_tx', tx });
  }
}

async function _dbInsertTransactionRaw(userId, tx) {
  const { error } = await _sb
    .from('transactions')
    .insert({
      id:           tx.id,
      user_id:      userId,
      type:         tx.type,
      amount:       tx.amount,
      description:  tx.description || '',
      category:     tx.category || '',
      notes:        tx.notes || '',
      recur:        tx.recur || 'none',
      recur_parent: tx.recurParent || '',
      month_key:    tx.monthKey,
      datetime:     tx.datetime,
    });
  if (error) throw error;
}

async function dbDeleteTransaction(userId, txId) {
  updateLocalCache(userId, 'delete_tx', { id: txId });
  if (useLocalDB) return;
  try {
    await _dbDeleteTransactionRaw(userId, txId);
  } catch (e) {
    console.warn('Supabase delete transaction failed, queueing', e);
    queueSyncOperation(userId, { type: 'delete_tx', id: txId });
  }
}

async function _dbDeleteTransactionRaw(userId, txId) {
  const { error } = await _sb
    .from('transactions')
    .delete()
    .eq('id', txId)
    .eq('user_id', userId);
  if (error) throw error;
}

async function dbUpdateTransaction(userId, txId, updates) {
  updateLocalCache(userId, 'update_tx', { id: txId, updates });
  if (useLocalDB) return;
  try {
    await _dbUpdateTransactionRaw(userId, txId, updates);
  } catch (e) {
    console.warn('Supabase update transaction failed, queueing', e);
    queueSyncOperation(userId, { type: 'update_tx', id: txId, updates });
  }
}

async function _dbUpdateTransactionRaw(userId, txId, updates) {
  const { error } = await _sb
    .from('transactions')
    .update({
      type:         updates.type,
      amount:       updates.amount,
      description:  updates.description || '',
      category:     updates.category || '',
      notes:        updates.notes || '',
      recur:        updates.recur || 'none',
      recur_parent: updates.recurParent || '',
      month_key:    updates.monthKey,
      datetime:     updates.datetime,
    })
    .eq('id', txId)
    .eq('user_id', userId);
  if (error) throw error;
}

// Bulk insert for import / recurring
async function dbBulkInsertTransactions(userId, txList) {
  if (!txList.length) return;
  txList.forEach(tx => updateLocalCache(userId, 'insert_tx', tx));
  if (useLocalDB) return;
  try {
    const rows = txList.map(tx => ({
      id:           tx.id,
      user_id:      userId,
      type:         tx.type,
      amount:       tx.amount,
      description:  tx.description || '',
      category:     tx.category || '',
      notes:        tx.notes || '',
      recur:        tx.recur || 'none',
      recur_parent: tx.recurParent || '',
      month_key:    tx.monthKey,
      datetime:     tx.datetime,
    }));
    const { error } = await _sb
      .from('transactions')
      .upsert(rows, { onConflict: 'id', ignoreDuplicates: true });
    if (error) throw error;
  } catch (e) {
    console.warn('Supabase bulk insert transactions failed, queueing each', e);
    txList.forEach(tx => queueSyncOperation(userId, { type: 'insert_tx', tx }));
  }
}

// ─────────────────────────────────────────────────────
// BUDGETS
// ─────────────────────────────────────────────────────

async function dbGetBudgets(userId) {
  if (useLocalDB) {
    const cached = localStorage.getItem(`spendly_data_${userId}`);
    return cached ? (JSON.parse(cached).budgets || {}) : {};
  }
  const { data, error } = await _sb
    .from('budgets')
    .select('*')
    .eq('user_id', userId);
  if (error) throw error;
  const map = {};
  (data ?? []).forEach(b => { map[b.month_key] = Number(b.amount); });
  return map;
}

async function dbSaveBudget(userId, monthKey, amount) {
  updateLocalCache(userId, 'save_budget', { monthKey, amount });
  if (useLocalDB) return;
  try {
    await _dbSaveBudgetRaw(userId, monthKey, amount);
  } catch (e) {
    console.warn('Supabase save budget failed, queueing', e);
    queueSyncOperation(userId, { type: 'save_budget', monthKey, amount });
  }
}

async function _dbSaveBudgetRaw(userId, monthKey, amount) {
  const { error } = await _sb
    .from('budgets')
    .upsert({ user_id: userId, month_key: monthKey, amount },
            { onConflict: 'user_id,month_key' });
  if (error) throw error;
}

// ─────────────────────────────────────────────────────
// CATEGORY BUDGETS
// ─────────────────────────────────────────────────────

async function dbGetCatBudgets(userId) {
  if (useLocalDB) {
    const cached = localStorage.getItem(`spendly_data_${userId}`);
    return cached ? (JSON.parse(cached).catBudgets || {}) : {};
  }
  const { data, error } = await _sb
    .from('cat_budgets')
    .select('*')
    .eq('user_id', userId);
  if (error) throw error;
  const map = {};
  (data ?? []).forEach(b => { map[b.category] = Number(b.amount); });
  return map;
}

async function dbSaveCatBudget(userId, category, amount) {
  updateLocalCache(userId, 'save_cat_budget', { category, amount });
  if (useLocalDB) return;
  try {
    await _dbSaveCatBudgetRaw(userId, category, amount);
  } catch (e) {
    console.warn('Supabase save category budget failed, queueing', e);
    queueSyncOperation(userId, { type: 'save_cat_budget', category, amount });
  }
}

async function _dbSaveCatBudgetRaw(userId, category, amount) {
  if (amount > 0) {
    const { error } = await _sb
      .from('cat_budgets')
      .upsert({ user_id: userId, category, amount },
              { onConflict: 'user_id,category' });
    if (error) throw error;
  } else {
    const { error } = await _sb
      .from('cat_budgets')
      .delete()
      .eq('user_id', userId)
      .eq('category', category);
    if (error) throw error;
  }
}

// ─────────────────────────────────────────────────────
// DEBTS
// ─────────────────────────────────────────────────────

async function dbGetDebts(userId) {
  if (useLocalDB) {
    const cached = localStorage.getItem(`spendly_data_${userId}`);
    return cached ? (JSON.parse(cached).debts || []) : [];
  }
  const { data, error } = await _sb
    .from('debts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

async function dbInsertDebt(userId, debt) {
  updateLocalCache(userId, 'insert_debt', debt);
  if (useLocalDB) return;
  try {
    await _dbInsertDebtRaw(userId, debt);
  } catch (e) {
    console.warn('Supabase insert debt failed, queueing', e);
    queueSyncOperation(userId, { type: 'insert_debt', debt });
  }
}

async function _dbInsertDebtRaw(userId, debt) {
  const { error } = await _sb
    .from('debts')
    .insert({
      id:      debt.id,
      user_id: userId,
      type:    debt.type,
      person:  debt.person,
      amount:  debt.amount,
      note:    debt.note || '',
      settled: debt.settled || false,
      date:    debt.date || new Date().toISOString(),
    });
  if (error) throw error;
}

async function dbUpdateDebt(userId, debtId, updates) {
  updateLocalCache(userId, 'update_debt', { id: debtId, updates });
  if (useLocalDB) return;
  try {
    await _dbUpdateDebtRaw(userId, debtId, updates);
  } catch (e) {
    console.warn('Supabase update debt failed, queueing', e);
    queueSyncOperation(userId, { type: 'update_debt', id: debtId, updates });
  }
}

async function _dbUpdateDebtRaw(userId, debtId, updates) {
  const { error } = await _sb
    .from('debts')
    .update(updates)
    .eq('id', debtId)
    .eq('user_id', userId);
  if (error) throw error;
}

async function dbDeleteDebt(userId, debtId) {
  updateLocalCache(userId, 'delete_debt', { id: debtId });
  if (useLocalDB) return;
  try {
    await _dbDeleteDebtRaw(userId, debtId);
  } catch (e) {
    console.warn('Supabase delete debt failed, queueing', e);
    queueSyncOperation(userId, { type: 'delete_debt', id: debtId });
  }
}

async function _dbDeleteDebtRaw(userId, debtId) {
  const { error } = await _sb
    .from('debts')
    .delete()
    .eq('id', debtId)
    .eq('user_id', userId);
  if (error) throw error;
}

// ─────────────────────────────────────────────────────
// CLEAR ALL DATA (transactions, budgets, catBudgets, debts — keeps profile)
// ─────────────────────────────────────────────────────

async function dbClearAllData(userId) {
  // Always wipe local cache first
  const cached = localStorage.getItem(`spendly_data_${userId}`);
  const profile = cached ? (JSON.parse(cached).profile || {}) : {};
  const empty = { transactions: [], budgets: {}, catBudgets: {}, debts: [], profile };
  localStorage.setItem(`spendly_data_${userId}`, JSON.stringify(empty));
  // Clear sync queue too
  syncQueue = [];
  saveSyncQueue(userId);

  if (useLocalDB) return;

  // Delete all rows for this user in each table (Supabase)
  try {
    await Promise.all([
      _sb.from('transactions').delete().eq('user_id', userId),
      _sb.from('budgets').delete().eq('user_id', userId),
      _sb.from('cat_budgets').delete().eq('user_id', userId),
      _sb.from('debts').delete().eq('user_id', userId),
    ]);
  } catch (e) {
    console.warn('Supabase clear all data failed (local cache was wiped)', e);
    throw e;
  }
}

// ─────────────────────────────────────────────────────
// LOAD ALL DATA for a user (called on login)
// Returns everything in one parallel fetch
// ─────────────────────────────────────────────────────

async function dbLoadAll(userId) {
  loadSyncQueue(userId);
  
  // Try syncing pending operations first if online
  if (!useLocalDB && syncQueue.length > 0 && navigator.onLine) {
    await attemptSync(userId);
  }

  const cached = localStorage.getItem(`spendly_data_${userId}`);
  const localData = cached ? JSON.parse(cached) : null;

  if (useLocalDB) {
    return localData || { transactions: [], budgets: {}, catBudgets: {}, debts: [], profile: {} };
  }

  try {
    const [transactions, budgets, catBudgets, debts, profile] = await Promise.all([
      dbGetTransactions(userId),
      dbGetBudgets(userId),
      dbGetCatBudgets(userId),
      dbGetDebts(userId),
      dbGetProfile(userId),
    ]);
    const data = { transactions, budgets, catBudgets, debts, profile };
    localStorage.setItem(`spendly_data_${userId}`, JSON.stringify(data));
    return data;
  } catch (e) {
    console.warn('Failed to load from Supabase, returning local cache if available', e);
    if (localData) {
      return localData;
    }
    throw e;
  }
}

// ─────────────────────────────────────────────────────
// EVENTS (localStorage-only — isolated from main data)
// ─────────────────────────────────────────────────────

function dbGetEvents(userId) {
  try { return JSON.parse(localStorage.getItem(`spendly_events_${userId}`) || '[]'); } catch(e) { return []; }
}

function dbSaveEvent(userId, event) {
  const events = dbGetEvents(userId);
  const idx = events.findIndex(e => e.id === event.id);
  if (idx >= 0) events[idx] = event; else events.unshift(event);
  localStorage.setItem(`spendly_events_${userId}`, JSON.stringify(events));
}

function dbDeleteEvent(userId, eventId) {
  localStorage.setItem(`spendly_events_${userId}`, JSON.stringify(dbGetEvents(userId).filter(e => e.id !== eventId)));
  localStorage.setItem(`spendly_event_items_${userId}`, JSON.stringify(dbGetEventItems(userId).filter(i => i.eventId !== eventId)));
}

function dbGetEventItems(userId) {
  try { return JSON.parse(localStorage.getItem(`spendly_event_items_${userId}`) || '[]'); } catch(e) { return []; }
}

function dbSaveEventItem(userId, item) {
  const items = dbGetEventItems(userId);
  const idx = items.findIndex(i => i.id === item.id);
  if (idx >= 0) items[idx] = item; else items.unshift(item);
  localStorage.setItem(`spendly_event_items_${userId}`, JSON.stringify(items));
}

function dbDeleteEventItem(userId, itemId) {
  localStorage.setItem(`spendly_event_items_${userId}`, JSON.stringify(dbGetEventItems(userId).filter(i => i.id !== itemId)));
}
