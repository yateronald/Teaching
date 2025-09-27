const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

function getSourceConfig() {
  const url = process.env.SOURCE_DATABASE_URL || process.env.DATABASE_URL;
  if (url) {
    return { connectionString: url };
  }
  return {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'Teaching',
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432', 10),
  };
}

async function fetchTables(client) {
  const res = await client.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type='BASE TABLE'
    ORDER BY table_name
  `);
  return res.rows.map(r => r.table_name);
}

async function fetchColumns(client, table) {
  const res = await client.query(`
    SELECT column_name, data_type, is_nullable, column_default,
           character_maximum_length, numeric_precision, numeric_scale
    FROM information_schema.columns
    WHERE table_schema='public' AND table_name=$1
    ORDER BY ordinal_position
  `, [table]);
  return res.rows;
}

async function fetchPrimaryKey(client, table) {
  const res = await client.query(`
    SELECT kcu.column_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
     AND tc.table_schema = kcu.table_schema
     AND tc.table_name = kcu.table_name
    WHERE tc.table_schema='public' AND tc.table_name=$1 AND tc.constraint_type='PRIMARY KEY'
    ORDER BY kcu.ordinal_position
  `, [table]);
  return res.rows.map(r => r.column_name);
}

async function fetchUniqueConstraints(client, table) {
  const res = await client.query(`
    SELECT tc.constraint_name, kcu.column_name, kcu.ordinal_position
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
     AND tc.table_schema = kcu.table_schema
     AND tc.table_name = kcu.table_name
    WHERE tc.table_schema='public' AND tc.table_name=$1 AND tc.constraint_type='UNIQUE'
    ORDER BY tc.constraint_name, kcu.ordinal_position
  `, [table]);
  
  // Group by constraint name
  const constraints = {};
  res.rows.forEach(row => {
    if (!constraints[row.constraint_name]) {
      constraints[row.constraint_name] = {
        constraint_name: row.constraint_name,
        columns: []
      };
    }
    constraints[row.constraint_name].columns.push(row.column_name);
  });
  
  return Object.values(constraints);
}

async function fetchForeignKeys(client, table) {
  const res = await client.query(`
    SELECT tc.constraint_name,
           kcu.column_name,
           kcu.ordinal_position,
           ccu.table_name AS foreign_table_name,
           ccu.column_name AS foreign_column_name,
           rc.update_rule, rc.delete_rule
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
     AND tc.table_schema = kcu.table_schema
     AND tc.table_name = kcu.table_name
    JOIN information_schema.referential_constraints rc
      ON tc.constraint_name = rc.constraint_name
     AND tc.table_schema = rc.constraint_schema
    JOIN information_schema.constraint_column_usage ccu
      ON ccu.constraint_name = tc.constraint_name
     AND ccu.constraint_schema = tc.table_schema
    WHERE tc.table_schema='public' AND tc.table_name=$1 AND tc.constraint_type='FOREIGN KEY'
    ORDER BY tc.constraint_name, kcu.ordinal_position
  `, [table]);
  
  // Group by constraint name
  const constraints = {};
  res.rows.forEach(row => {
    if (!constraints[row.constraint_name]) {
      constraints[row.constraint_name] = {
        constraint_name: row.constraint_name,
        columns: [],
        foreign_table_name: row.foreign_table_name,
        foreign_columns: [],
        update_rule: row.update_rule,
        delete_rule: row.delete_rule
      };
    }
    constraints[row.constraint_name].columns.push(row.column_name);
    constraints[row.constraint_name].foreign_columns.push(row.foreign_column_name);
  });
  
  return Object.values(constraints);
}

async function fetchIndexes(client, table) {
  const res = await client.query(`
    SELECT indexname, indexdef
    FROM pg_indexes
    WHERE schemaname='public' AND tablename=$1
  `, [table]);
  return res.rows;
}

async function fetchSequences(client) {
  const res = await client.query(`
    SELECT schemaname, sequencename, start_value, min_value, max_value, increment_by
    FROM pg_sequences
    WHERE schemaname='public'
  `);
  return res.rows;
}

function typeWithLength(c) {
  const t = c.data_type;
  if (t === 'character varying' || t === 'varchar') {
    return c.character_maximum_length ? `${t}(${c.character_maximum_length})` : 'text';
  }
  if (t === 'character') {
    return c.character_maximum_length ? `${t}(${c.character_maximum_length})` : t;
  }
  if (t === 'numeric') {
    if (c.numeric_precision != null && c.numeric_scale != null) {
      return `numeric(${c.numeric_precision},${c.numeric_scale})`;
    }
    if (c.numeric_precision != null) {
      return `numeric(${c.numeric_precision})`;
    }
    return 'numeric';
  }
  return t; // e.g., integer, bigint, boolean, timestamp without time zone, etc.
}

function buildCreateTable(table, columns, pkCols, uniqueCons) {
  const defs = columns.map(c => {
    const colType = typeWithLength(c);
    const nullable = c.is_nullable === 'NO' ? 'NOT NULL' : '';
    const deflt = c.column_default ? `DEFAULT ${c.column_default}` : '';
    return `"${c.column_name}" ${colType} ${deflt} ${nullable}`.trim();
  });
  if (pkCols.length) {
    defs.push(`PRIMARY KEY (${pkCols.map(c => `"${c}"`).join(', ')})`);
  }
  uniqueCons.forEach(u => {
    defs.push(`CONSTRAINT "${u.constraint_name}" UNIQUE (${u.columns.map(c => `"${c}"`).join(', ')})`);
  });
  return `CREATE TABLE IF NOT EXISTS public."${table}" (\n  ${defs.join(',\n  ')}\n);`;
}

function buildForeignKeyAlter(table, fk) {
  const cols = fk.columns.map(c => `"${c}"`).join(', ');
  const fcols = fk.foreign_columns.map(c => `"${c}"`).join(', ');
  const onUpd = fk.update_rule && fk.update_rule !== 'NO ACTION' ? ` ON UPDATE ${fk.update_rule}` : '';
  const onDel = fk.delete_rule && fk.delete_rule !== 'NO ACTION' ? ` ON DELETE ${fk.delete_rule}` : '';
  return `ALTER TABLE public."${table}" ADD CONSTRAINT "${fk.constraint_name}" FOREIGN KEY (${cols}) REFERENCES public."${fk.foreign_table_name}" (${fcols})${onUpd}${onDel};`;
}

async function main() {
  const srcCfg = getSourceConfig();
  const client = new Client(srcCfg);
  await client.connect();
  console.log('✅ Connected to source PostgreSQL');

  const tables = await fetchTables(client);
  console.log(`📋 Found ${tables.length} tables in public schema`);

  const sequences = await fetchSequences(client);
  console.log(`🔢 Found ${sequences.length} sequences in public schema`);

  const sequenceStatements = [];
  const createStatements = [];
  const fkStatements = [];
  const indexStatements = [];

  // Create sequences
  sequences.forEach(seq => {
    sequenceStatements.push(`CREATE SEQUENCE IF NOT EXISTS public."${seq.sequencename}" START WITH ${seq.start_value} INCREMENT BY ${seq.increment_by} MINVALUE ${seq.min_value} MAXVALUE ${seq.max_value};`);
  });

  for (const table of tables) {
    const cols = await fetchColumns(client, table);
    const pk = await fetchPrimaryKey(client, table);
    const uniques = await fetchUniqueConstraints(client, table);
    const fks = await fetchForeignKeys(client, table);
    const idxs = await fetchIndexes(client, table);

    createStatements.push(buildCreateTable(table, cols, pk, uniques));
    fks.forEach(fk => fkStatements.push(buildForeignKeyAlter(table, fk)));
    idxs.forEach(ix => indexStatements.push(ix.indexdef.endsWith(';') ? ix.indexdef : ix.indexdef + ';'));
  }

  const fullSql = [
    '-- Generated schema (sequences)',
    ...sequenceStatements,
    '',
    '-- Generated schema (tables)',
    ...createStatements,
    '',
    '-- Foreign keys',
    ...fkStatements,
    '',
    '-- Indexes',
    ...indexStatements,
    ''
  ].join('\n');

  const outDir = path.join(__dirname, '..', 'database', 'migrations');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, 'neon-schema.sql');
  fs.writeFileSync(outFile, fullSql, 'utf8');
  console.log(`📝 Schema exported to ${outFile}`);

  await client.end();
  console.log('🔌 Source connection closed');
}

if (require.main === module) {
  main().catch(err => {
    console.error('❌ Failed to extract schema:', err.message || err);
    process.exit(1);
  });
}