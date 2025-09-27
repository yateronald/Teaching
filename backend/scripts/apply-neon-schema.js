const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

function getTargetConfig() {
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

function parseStatements(sqlText) {
  // Remove single-line comments
  const cleaned = sqlText.replace(/--.*$/gm, '').trim();
  // Split on semicolons; statements are DDL only in our generated file
  const parts = cleaned.split(';').map(s => s.trim()).filter(s => s.length > 0);
  return parts;
}

async function applySchema() {
  const migrationsDir = path.join(__dirname, '..', 'database', 'migrations');
  const schemaFile = path.join(migrationsDir, 'neon-schema.sql');
  if (!fs.existsSync(schemaFile)) {
    throw new Error(`Schema file not found: ${schemaFile}. Run \"npm run db:extract-schema\" first to generate it.`);
  }
  const sql = fs.readFileSync(schemaFile, 'utf8');
  const statements = parseStatements(sql);
  console.log(`📝 Applying ${statements.length} statements to Neon...`);

  const cfg = getTargetConfig();
  const client = new Client(cfg);
  await client.connect();
  console.log('✅ Connected to Neon PostgreSQL');

  try {
    // Execute CREATE SEQUENCE statements first, then CREATE TABLE, then FKs, then indexes
    const seqStmts = statements.filter(s => s.toUpperCase().startsWith('CREATE SEQUENCE'));
    const createStmts = statements.filter(s => s.toUpperCase().startsWith('CREATE TABLE'));
    const fkStmts = statements.filter(s => s.toUpperCase().startsWith('ALTER TABLE'));
    const idxStmts = statements.filter(s => s.toUpperCase().startsWith('CREATE INDEX'));

    const ordered = [...seqStmts, ...createStmts, ...fkStmts, ...idxStmts];

    for (let i = 0; i < ordered.length; i++) {
      const stmt = ordered[i];
      try {
        await client.query(stmt);
        const preview = stmt.length > 80 ? stmt.slice(0, 80) + '...' : stmt;
        console.log(`✅ [${i + 1}/${ordered.length}] ${preview}`);
      } catch (err) {
        console.error(`❌ Failed on statement [${i + 1}/${ordered.length}]: ${err.message}`);
        console.error('   Statement preview:', stmt.slice(0, 200));
        throw err;
      }
    }

    console.log('🎉 Schema applied successfully to Neon.');
  } finally {
    await client.end();
    console.log('🔌 Neon connection closed');
  }
}

if (require.main === module) {
  applySchema().catch(err => {
    console.error('❌ Schema apply failed:', err.message || err);
    process.exit(1);
  });
}