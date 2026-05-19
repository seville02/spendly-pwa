// ═══════════════════════════════════════════════════════
// db.js — Supabase database layer
// All auth + data operations live here.
// app.js calls these functions; never calls Supabase directly.
// ═══════════════════════════════════════════════════════

// ── Init Supabase client ──────────────────────────────
const _sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON, {
  auth: {
    persistSession: true,          // keeps user logged in across app restarts
    autoRefreshToken: true,        // silently refreshes token before expiry
    detectSessionInUrl: false,
    storage: localStorage,
  }
});

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

async function dbGetSession() {
  const { data } = await _sb.auth.getSession();
  return data?.session ?? null;
}

async function dbGetUser() {
  const { data } = await _sb.auth.getUser();
  return data?.user ?? null;
}

// Listen for auth state changes (login / logout / token refresh)
function dbOnAuthChange(callback) {
  return _sb.auth.onAuthStateChange((_event, session) => {
    callback(session);
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
  return data;
}

async function dbSaveProfile(userId, profile) {
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
  const { error } = await _sb
    .from('transactions')
    .delete()
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
  // Return as { monthKey: amount } map
  const map = {};
  (data ?? []).forEach(b => { map[b.month_key] = Number(b.amount); });
  return map;
}

async function dbSaveBudget(userId, monthKey, amount) {
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
  (data ?? []).forEach(b => { map[b.category] = Number(b.amount); });
  return map;
}

async function dbSaveCatBudget(userId, category, amount) {
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
  const { data, error } = await _sb
    .from('debts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

async function dbInsertDebt(userId, debt) {
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
  const { error } = await _sb
    .from('debts')
    .update(updates)
    .eq('id', debtId)
    .eq('user_id', userId);
  if (error) throw error;
}

async function dbDeleteDebt(userId, debtId) {
  const { error } = await _sb
    .from('debts')
    .delete()
    .eq('id', debtId)
    .eq('user_id', userId);
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
