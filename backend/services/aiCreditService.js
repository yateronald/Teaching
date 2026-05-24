/**
 * AI Credit Service — manages per-student EE/EO credit balances.
 * All mutations go through here so the audit log stays consistent.
 */

const VALID_TYPES = ['ee', 'eo'];

/** Read a user's current balance. Auto-creates a row if missing. */
async function getBalance(db, userId) {
  let row = await db.get(
    `SELECT ee_credits, eo_credits, updated_at FROM student_ai_credits WHERE user_id = $1`,
    [userId]
  );
  if (!row) {
    await db.run(
      `INSERT INTO student_ai_credits (user_id, ee_credits, eo_credits) VALUES ($1, 0, 0) ON CONFLICT DO NOTHING`,
      [userId]
    );
    row = { ee_credits: 0, eo_credits: 0, updated_at: new Date().toISOString() };
  }
  return {
    ee_credits: Number(row.ee_credits) || 0,
    eo_credits: Number(row.eo_credits) || 0,
    updated_at: row.updated_at,
  };
}

/** Add credits (positive). Used for admin grants. */
async function grantCredits(db, userId, type, amount, opts = {}) {
  if (!VALID_TYPES.includes(type)) throw new Error(`Invalid credit type: ${type}`);
  const n = Math.max(0, Math.floor(Number(amount) || 0));
  if (n === 0) return; // no-op
  // Upsert balance
  await db.run(
    `INSERT INTO student_ai_credits (user_id, ee_credits, eo_credits)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id) DO UPDATE
     SET ee_credits = student_ai_credits.ee_credits + EXCLUDED.ee_credits,
         eo_credits = student_ai_credits.eo_credits + EXCLUDED.eo_credits,
         updated_at = CURRENT_TIMESTAMP`,
    [userId, type === 'ee' ? n : 0, type === 'eo' ? n : 0]
  );
  // Audit log
  await db.run(
    `INSERT INTO ai_credit_transactions
       (user_id, credit_type, delta, reason, actor_id, related_entity_type, related_entity_id, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      userId, type, n,
      opts.reason || 'admin_grant',
      opts.actor_id || null,
      opts.related_entity_type || null,
      opts.related_entity_id || null,
      opts.notes || null,
    ]
  );
}

/** Consume 1 credit. Throws if insufficient. Returns the new balance. */
async function consumeCredit(db, userId, type, opts = {}) {
  if (!VALID_TYPES.includes(type)) throw new Error(`Invalid credit type: ${type}`);
  const balance = await getBalance(db, userId);
  const current = type === 'ee' ? balance.ee_credits : balance.eo_credits;
  if (current <= 0) {
    const err = new Error('INSUFFICIENT_CREDITS');
    err.code = 'INSUFFICIENT_CREDITS';
    err.creditType = type;
    throw err;
  }
  const column = type === 'ee' ? 'ee_credits' : 'eo_credits';
  await db.run(
    `UPDATE student_ai_credits
     SET ${column} = ${column} - 1,
         updated_at = CURRENT_TIMESTAMP
     WHERE user_id = $1`,
    [userId]
  );
  await db.run(
    `INSERT INTO ai_credit_transactions
       (user_id, credit_type, delta, reason, actor_id, related_entity_type, related_entity_id, notes)
     VALUES ($1, $2, -1, $3, $4, $5, $6, $7)`,
    [
      userId, type,
      opts.reason || `${type}_attempt`,
      opts.actor_id || userId,
      opts.related_entity_type || null,
      opts.related_entity_id || null,
      opts.notes || null,
    ]
  );
  return {
    ee_credits: type === 'ee' ? current - 1 : balance.ee_credits,
    eo_credits: type === 'eo' ? current - 1 : balance.eo_credits,
  };
}

/** Bulk grant for many students. Used during admin assignment. */
async function bulkGrant(db, userIds, eeAmount, eoAmount, opts = {}) {
  if (!Array.isArray(userIds) || userIds.length === 0) return 0;
  const ee = Math.max(0, Math.floor(Number(eeAmount) || 0));
  const eo = Math.max(0, Math.floor(Number(eoAmount) || 0));
  if (ee === 0 && eo === 0) return 0;
  let count = 0;
  for (const uid of userIds) {
    if (ee > 0) await grantCredits(db, uid, 'ee', ee, opts);
    if (eo > 0) await grantCredits(db, uid, 'eo', eo, opts);
    count++;
  }
  return count;
}

/** Get recent transactions for a user (for transparency in UI). */
async function getRecentTransactions(db, userId, limit = 20) {
  return db.all(
    `SELECT id, credit_type, delta, reason, related_entity_type, related_entity_id, notes, created_at
     FROM ai_credit_transactions
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT $2`,
    [userId, limit]
  );
}

module.exports = {
  getBalance,
  grantCredits,
  consumeCredit,
  bulkGrant,
  getRecentTransactions,
};
