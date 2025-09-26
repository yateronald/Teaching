const sqlite3 = require('sqlite3').verbose();
const { Client } = require('pg');
const path = require('path');
const fs = require('fs');

function getSqlitePath() {
  // Try to read from env DB_PATH, else fallback to default path
  const envPath = process.env.DB_PATH;
  if (envPath && fs.existsSync(envPath)) return envPath;
  const defaultPath = path.join(__dirname, '..', 'database', 'french_teaching.db');
  if (!fs.existsSync(defaultPath)) {
    throw new Error(`SQLite database not found. Set DB_PATH or place file at ${defaultPath}`);
  }
  return defaultPath;
}

function getNeonConfig() {
  const url = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;
  if (!url) {
    throw new Error('Missing NEON_DATABASE_URL (or DATABASE_URL). Please set your Neon connection string in the environment.');
  }
  const isNeon = url.includes('neon.tech');
  const sslmodeRequire = url.includes('sslmode=require');
  return {
    connectionString: url,
    ssl: (isNeon || sslmodeRequire) ? { rejectUnauthorized: false } : undefined,
  };
}

async function migrateUsers() {
  const sqlitePath = getSqlitePath();
  const neonCfg = getNeonConfig();

  console.log('🔄 Starting user migration');
  console.log('   SQLite:', sqlitePath);
  console.log('   Neon:', neonCfg.connectionString.replace(/:[^@]+@/, ':****@'));

  const sqlite = new sqlite3.Database(sqlitePath);
  const pgClient = new Client(neonCfg);
  await pgClient.connect();
  console.log('✅ Connected to Neon');

  try {
    // Ensure users table exists on Neon
    const check = await pgClient.query("SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='users'");
    if (check.rowCount === 0) {
      throw new Error('Users table does not exist on Neon. Apply schema first (npm run db:apply-neon).');
    }

    // Fetch users from SQLite
    const users = await new Promise((resolve, reject) => {
      sqlite.all('SELECT id, username, email, password_hash, role, first_name, last_name, created_at, updated_at, must_change_password, password_changed_at, password_expires_at, is_active, failed_login_attempts, last_failed_login, account_locked_until FROM users', (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });
    console.log(`📋 Found ${users.length} users in SQLite`);

    // Insert into Neon (upsert by unique email/username)
    let inserted = 0;
    for (const u of users) {
      try {
        await pgClient.query(
          `INSERT INTO users (username, email, password_hash, role, first_name, last_name, created_at, updated_at, must_change_password, password_changed_at, password_expires_at, is_active, failed_login_attempts, last_failed_login, account_locked_until)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8, COALESCE($9,0), $10, $11, COALESCE($12, TRUE), COALESCE($13,0), $14, $15)
           ON CONFLICT (email) DO UPDATE SET
             username=EXCLUDED.username,
             password_hash=EXCLUDED.password_hash,
             role=EXCLUDED.role,
             first_name=EXCLUDED.first_name,
             last_name=EXCLUDED.last_name,
             updated_at=EXCLUDED.updated_at,
             must_change_password=EXCLUDED.must_change_password,
             password_changed_at=EXCLUDED.password_changed_at,
             password_expires_at=EXCLUDED.password_expires_at,
             is_active=EXCLUDED.is_active,
             failed_login_attempts=EXCLUDED.failed_login_attempts,
             last_failed_login=EXCLUDED.last_failed_login,
             account_locked_until=EXCLUDED.account_locked_until`,
          [
            u.username,
            u.email,
            u.password_hash,
            u.role,
            u.first_name,
            u.last_name,
            u.created_at,
            u.updated_at,
            u.must_change_password,
            u.password_changed_at,
            u.password_expires_at,
            u.is_active,
            u.failed_login_attempts,
            u.last_failed_login,
            u.account_locked_until,
          ]
        );
        inserted += 1;
      } catch (err) {
        console.error('❌ Failed to insert user:', u.email, err.message);
        throw err;
      }
    }

    console.log(`🎉 Migrated ${inserted} users to Neon successfully.`);
  } finally {
    await pgClient.end();
    sqlite.close();
    console.log('🔌 Connections closed');
  }
}

if (require.main === module) {
  migrateUsers().catch(err => {
    console.error('❌ User migration failed:', err.message || err);
    process.exit(1);
  });
}