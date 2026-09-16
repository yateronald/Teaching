const PostgreSQLDatabase = require('../database/init-postgres');
require('dotenv').config();

async function run() {
  process.env.TZ = 'UTC';
  const db = new PostgreSQLDatabase();
  await db.initialize();

  // Try to delete a test assignment group inside a transaction so we can rollback
  await db.run('BEGIN');
  try {
    const groupId = 'f1ddee86-58ed-4eab-b8f7-f6608d4bd730';
    console.log('Attempting dry-run delete for group:', groupId);
    const existing = await db.all('SELECT * FROM tcf_exam_assignments WHERE group_id = $1', [groupId]);
    console.log('Existing assignments in group:', existing);

    const result = await db.run('DELETE FROM tcf_exam_assignments WHERE group_id = $1', [groupId]);
    console.log('Delete result:', result);
  } catch (error) {
    console.error('Delete failed with error:', error);
  } finally {
    await db.run('ROLLBACK');
    console.log('Transaction rolled back.');
  }

  await db.close();
}

run().catch(console.error);
