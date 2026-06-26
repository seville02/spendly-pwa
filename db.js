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

async function dbUpdateLastActive(userId) {
  if (!userId) return;
  const { error } = await _sb
    .from('profiles')
    .update({ last_active_at: new Date().toISOString(), inactive_email_sent: false })
    .eq('id', userId);
  if (error) console.error('Failed to update last active timestamp', error);
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
  _initEventCaches(profile);
  return { transactions, budgets, catBudgets, debts, profile };
}

// ─────────────────────────────────────────────────────
// EVENTS (stored as JSON in the profiles table)
// ─────────────────────────────────────────────────────

// In-memory cache — loaded from profile on login
let _eventsCache = null;
let _eventItemsCache = null;

function _getEventsFromProfile(profile) {
  try { return Array.isArray(profile?.events) ? profile.events : []; } catch (e) { return []; }
}
function _getEventItemsFromProfile(profile) {
  try { return Array.isArray(profile?.event_items) ? profile.event_items : []; } catch (e) { return []; }
}

function dbGetEvents(userId) {
  // Return from in-memory cache (populated on login via dbLoadAll)
  if (_eventsCache !== null) return _eventsCache;
  return [];
}

function dbGetEventItems(userId) {
  if (_eventItemsCache !== null) return _eventItemsCache;
  return [];
}

async function _persistEvents(userId) {
  const { error } = await _sb
    .from('profiles')
    .upsert({ id: userId, events: _eventsCache, event_items: _eventItemsCache }, { onConflict: 'id' });
  if (error) console.error('Failed to save events', error);
}

function dbSaveEvent(userId, event) {
  if (_eventsCache === null) _eventsCache = [];
  const idx = _eventsCache.findIndex(e => e.id === event.id);
  if (idx >= 0) _eventsCache[idx] = event;
  else _eventsCache.push(event);
  _persistEvents(userId);
}

function dbDeleteEvent(userId, eventId) {
  if (_eventsCache === null) return;
  _eventsCache = _eventsCache.filter(e => e.id !== eventId);
  if (_eventItemsCache) _eventItemsCache = _eventItemsCache.filter(i => i.eventId !== eventId);
  _persistEvents(userId);
}

function dbSaveEventItem(userId, item) {
  if (_eventItemsCache === null) _eventItemsCache = [];
  const idx = _eventItemsCache.findIndex(i => i.id === item.id);
  if (idx >= 0) _eventItemsCache[idx] = item;
  else _eventItemsCache.push(item);
  _persistEvents(userId);
}

function dbDeleteEventItem(userId, itemId) {
  if (_eventItemsCache === null) return;
  _eventItemsCache = _eventItemsCache.filter(i => i.id !== itemId);
  _persistEvents(userId);
}

// Called during dbLoadAll to seed the caches
function _initEventCaches(profile) {
  _eventsCache = _getEventsFromProfile(profile);
  _eventItemsCache = _getEventItemsFromProfile(profile);
}

// ─────────────────────────────────────────────────────
// INVOICES (Supabase Database & Storage)
// ─────────────────────────────────────────────────────
async function dbGetInvoices(userId) {
  const { data, error } = await _sb
    .from('invoices')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });
  if (error) throw error;
  return data || [];
}

async function dbUploadInvoiceFile(userId, file) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
  
  const { data, error } = await _sb.storage
    .from('invoices')
    .upload(fileName, file, { cacheControl: '3600', upsert: true });

  if (error) throw error;

  const { data: urlData } = _sb.storage
    .from('invoices')
    .getPublicUrl(fileName);

  return {
    url: urlData.publicUrl,
    path: fileName
  };
}

async function dbSaveInvoice(userId, invoice) {
  const { data, error } = await _sb
    .from('invoices')
    .insert({
      user_id: userId,
      name: invoice.name,
      date: invoice.date,
      details: invoice.details,
      file_url: invoice.fileUrl,
      file_name: invoice.fileName,
      file_type: invoice.fileType
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function dbDeleteInvoice(userId, invoiceId, filePath) {
  const { error: dbError } = await _sb
    .from('invoices')
    .delete()
    .eq('id', invoiceId)
    .eq('user_id', userId);

  if (dbError) throw dbError;

  if (filePath) {
    const { error: storageError } = await _sb.storage
      .from('invoices')
      .remove([filePath]);
    if (storageError) console.error('Storage deletion failed', storageError);
  }
}

async function dbDeleteAllInvoices(userId) {
  const { data: list, error: listError } = await _sb
    .from('invoices')
    .select('file_name')
    .eq('user_id', userId);

  if (listError) throw listError;

  const { error: dbError } = await _sb
    .from('invoices')
    .delete()
    .eq('user_id', userId);

  if (dbError) throw dbError;

  if (list && list.length > 0) {
    const filePaths = list.map(item => item.file_name);
    const { error: storageError } = await _sb.storage
      .from('invoices')
      .remove(filePaths);
    if (storageError) console.error('Storage clean up failed', storageError);
  }
}

// ─────────────────────────────────────────────────────
// GROUP TRIP SPLITTER (Supabase Database)
// ─────────────────────────────────────────────────────
async function dbGetTrips(userId, email) {
  if (!userId && !email) return [];

  // Query by user_id (new) or email (legacy)
  let groupIds = [];

  if (userId) {
    const { data: byId } = await _sb
      .from('trip_members')
      .select('group_id')
      .eq('user_id', userId);
    if (byId) groupIds.push(...byId.map(m => m.group_id));
  }

  if (email) {
    // Legacy fallback: look up by email
    const { data: byEmail } = await _sb
      .from('trip_members')
      .select('group_id')
      .eq('email', email);
    if (byEmail) groupIds.push(...byEmail.map(m => m.group_id));
  }

  if (groupIds.length === 0) return [];

  // Deduplicate
  groupIds = [...new Set(groupIds)];

  // Fetch the trip group details
  const { data: groups, error: groupError } = await _sb
    .from('trip_groups')
    .select('*')
    .in('id', groupIds)
    .order('created_at', { ascending: false });

  if (groupError) throw groupError;
  return groups || [];
}

async function dbCreateTrip(userId, name, members) {
  // 1. Insert group record
  const { data: group, error: groupError } = await _sb
    .from('trip_groups')
    .insert({ name, created_by: userId })
    .select()
    .single();

  if (groupError) throw groupError;

  // 2. Insert member records — members is array of { user_id, username, display_name, email }
  const memberRows = members.map(m => ({
    group_id: group.id,
    user_id: m.user_id || null,
    username: m.username || null,
    display_name: m.display_name || m.username || m.email || 'Unknown',
    email: m.email || ''   // empty string satisfies NOT NULL if no email provided
  }));

  const { error: memError } = await _sb
    .from('trip_members')
    .insert(memberRows);

  if (memError) throw memError;
  return group;
}

async function dbGetTripDetails(groupId) {
  // Fetch group, members, and expenses parallelly
  const [groupRes, membersRes, expensesRes] = await Promise.all([
    _sb.from('trip_groups').select('*').eq('id', groupId).single(),
    _sb.from('trip_members').select('*').eq('group_id', groupId),
    _sb.from('trip_expenses').select('*').eq('group_id', groupId).order('date', { ascending: false })
  ]);

  if (groupRes.error) throw groupRes.error;
  if (membersRes.error) throw membersRes.error;
  if (expensesRes.error) throw expensesRes.error;

  return {
    group: groupRes.data,
    members: membersRes.data || [],
    expenses: expensesRes.data || []
  };
}

async function dbAddTripExpense(groupId, description, amount, paidBy, date) {
  const { data, error } = await _sb
    .from('trip_expenses')
    .insert({
      group_id: groupId,
      description,
      amount,
      paid_by: paidBy,  // user_id (UUID) for new trips; email string for legacy
      date: date || new Date().toISOString().split('T')[0]
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function dbDeleteTripExpense(expenseId) {
  const { error } = await _sb
    .from('trip_expenses')
    .delete()
    .eq('id', expenseId);
  if (error) throw error;
}

async function dbDeleteTripGroup(groupId) {
  const { error } = await _sb
    .from('trip_groups')
    .delete()
    .eq('id', groupId);
  if (error) throw error;
}

// ─────────────────────────────────────────────────────
// USERNAME LOOKUP
// ─────────────────────────────────────────────────────

/** Find a user profile by their @username handle. Returns { id, username, name } or null. */
async function dbLookupByUsername(username) {
  const handle = username.replace(/^@/, '').trim().toLowerCase();
  if (!handle) return null;
  const { data, error } = await _sb
    .from('profiles')
    .select('id, username, name')
    .eq('username', handle)
    .maybeSingle();
  if (error) throw error;
  return data || null;
}

/** Update the username for a user profile. */
async function dbUpdateUsername(userId, username) {
  const { error } = await _sb
    .from('profiles')
    .update({ username: username })
    .eq('id', userId);
  if (error) throw error;
}


// ─────────────────────────────────────────────────────
// NOTIFICATIONS
// ─────────────────────────────────────────────────────

/** Send an in-app notification to a specific user. */
async function dbSendNotification(toUserId, type, message, metadata) {
  const { error } = await _sb
    .from('notifications')
    .insert({
      user_id: toUserId,
      type: type,
      message: message,
      metadata: metadata || {},
      is_read: false
    });
  if (error) console.error('Failed to send notification:', error);
}

/** Get all notifications for the current user. */
async function dbGetNotifications(userId) {
  const { data, error } = await _sb
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);
  if (error && error.code === '42P01') return []; // table doesn't exist yet
  if (error) throw error;
  return data || [];
}

/** Mark all notifications as read for a user. */
async function dbMarkAllNotifsRead(userId) {
  const { error } = await _sb
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false);
  if (error) console.error('Failed to mark notifications read:', error);
}

/** Count unread notifications. */
async function dbCountUnreadNotifs(userId) {
  const { count, error } = await _sb
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false);
  if (error) return 0;
  return count || 0;
}

