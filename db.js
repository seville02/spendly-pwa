// ═══════════════════════════════════════════════════════
// db.js — Supabase database layer
// All auth + data operations live here.
// app.js calls these functions; never calls Supabase directly.
// ═══════════════════════════════════════════════════════


// ── Init Supabase client ─────────────────────────────────────────────────────
let _sb = null;
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
  console.error("Failed to initialize Supabase client.", e);
}

// ─────────────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────────────

async function dbSignUp(email, password, name) {
  const { data, error } = await _sb.auth.signUp({
    email,
    password,
    options: { data: { name } }
  });
  if (error) throw error;
  return data;
}

async function dbSignIn(email, password) {
  const { data, error } = await _sb.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

async function dbSignOut() {
  const { error } = await _sb.auth.signOut();
  if (error) throw error;
}

async function dbResetPassword(email) {
  const { data, error } = await _sb.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin + window.location.pathname
  });
  if (error) throw error;
  return data;
}

async function dbUpdatePassword(newPassword) {
  const { data, error } = await _sb.auth.updateUser({ password: newPassword });
  if (error) throw error;
  return data;
}

async function dbGetSession() {
  if (!_sb) return null;
  const { data } = await _sb.auth.getSession();
  return data?.session ?? null;
}

async function dbGetUser() {
  if (!_sb) return null;
  const { data } = await _sb.auth.getUser();
  return data?.user ?? null;
}

// Listen for auth state changes (login / logout / token refresh)
function dbOnAuthChange(callback) {
  if (!_sb) return { data: { subscription: { unsubscribe: () => {} } } };
  return _sb.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
}

// ─────────────────────────────────────────────────────
// PROFILE
// ─────────────────────────────────────────────────────

async function dbGetProfile(userId) {
  const { data, error } = await _sb
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data || {};
}

async function dbSaveProfile(userId, profile) {
  await _dbSaveProfileRaw(userId, profile);
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
  const { data, error } = await _sb
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('datetime', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

async function dbGetTransactionsByMonth(userId, monthKey) {
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
  await _dbInsertTransactionRaw(userId, tx);
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
  await _dbDeleteTransactionRaw(userId, txId);
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
  await _dbUpdateTransactionRaw(userId, txId, updates);
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
}

// ─────────────────────────────────────────────────────
// BUDGETS
// ─────────────────────────────────────────────────────

async function dbGetBudgets(userId) {
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
  await _dbSaveBudgetRaw(userId, monthKey, amount);
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
  const { data, error } = await _sb
    .from('cat_budgets')
    .select('*')
    .eq('user_id', userId);
  if (error) throw error;
  const map = {};
  (data ?? []).forEach(b => {
    const mk = b.month_key;
    if (mk) {
      if (!map[mk]) map[mk] = {};
      map[mk][b.category] = Number(b.amount);
    }
  });
  return map;
}

async function dbSaveCatBudget(userId, monthKey, category, amount) {
  await _dbSaveCatBudgetRaw(userId, monthKey, category, amount);
}

async function _dbSaveCatBudgetRaw(userId, monthKey, category, amount) {
  if (amount > 0) {
    const { error } = await _sb
      .from('cat_budgets')
      .upsert({ user_id: userId, month_key: monthKey, category, amount },
              { onConflict: 'user_id,month_key,category' });
    if (error) throw error;
  } else {
    const { error } = await _sb
      .from('cat_budgets')
      .delete()
      .eq('user_id', userId)
      .eq('month_key', monthKey)
      .eq('category', category);
    if (error) throw error;
  }
}

// ─────────────────────────────────────────────────────
// DEBTS
// ─────────────────────────────────────────────────────

async function dbGetDebts(userId) {
  const { data, error } = await _sb
    .from('debts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

async function dbInsertDebt(userId, debt) {
  await _dbInsertDebtRaw(userId, debt);
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
  await _dbUpdateDebtRaw(userId, debtId, updates);
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
  await _dbDeleteDebtRaw(userId, debtId);
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
  // Delete all rows for this user in each table (Supabase)
  await Promise.all([
    _sb.from('transactions').delete().eq('user_id', userId),
    _sb.from('budgets').delete().eq('user_id', userId),
    _sb.from('cat_budgets').delete().eq('user_id', userId),
    _sb.from('debts').delete().eq('user_id', userId),
  ]);
}

async function dbClearAllTransactions(userId) {
  // Clear from Supabase
  const { error } = await _sb.from('transactions').delete().eq('user_id', userId);
  if (error) throw error;
}

// ─────────────────────────────────────────────────────
// LOAD ALL DATA for a user (called on login)
// Returns everything in one parallel fetch
// ─────────────────────────────────────────────────────

async function dbLoadAll(userId) {
  const [transactions, budgets, catBudgets, debts, profile] = await Promise.all([
    dbGetTransactions(userId),
    dbGetBudgets(userId),
    dbGetCatBudgets(userId),
    dbGetDebts(userId),
    dbGetProfile(userId),
  ]);
  return { transactions, budgets, catBudgets, debts, profile };
}

// ─────────────────────────────────────────────────────
// EVENTS (Local storage removed as per request)
// ─────────────────────────────────────────────────────

function dbGetEvents(userId) {
  return [];
}

function dbSaveEvent(userId, event) {
  // Local storage removed
}

function dbDeleteEvent(userId, eventId) {
  // Local storage removed
}

function dbGetEventItems(userId) {
  return [];
}

function dbSaveEventItem(userId, item) {
  // Local storage removed
}

function dbDeleteEventItem(userId, itemId) {
  // Local storage removed
}

