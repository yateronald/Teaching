const PostgreSQLDatabase = require('../database/init-postgres');
require('dotenv').config();

async function run() {
  process.env.TZ = 'UTC';
  const db = new PostgreSQLDatabase();
  await db.initialize();

  await db.run('BEGIN');
  try {
    const groupId = 'single_4';
    console.log('Testing delete logic for legacy group:', groupId);

    const existing = await db.get('SELECT * FROM tcf_exam_assignments WHERE id = 4');
    console.log('Existing assignment ID 4:', existing);

    if (groupId.startsWith('single_')) {
      const id = parseInt(groupId.replace('single_', ''), 10);
      const result = await db.run('DELETE FROM tcf_exam_assignments WHERE id = $1', [id]);
      console.log('Delete result:', result);
    } else {
      const result = await db.run('DELETE FROM tcf_exam_assignments WHERE group_id = $1', [groupId]);
      console.log('Delete result:', result);
    }

    const after = await db.get('SELECT * FROM tcf_exam_assignments WHERE id = 4');
    console.log('After delete check (should be undefined):', after);
  } catch (error) {
    console.error('Test failed with error:', error);
  } finally {
    await db.run('ROLLBACK');
    console.log('Transaction rolled back.');
  }

  await db.close();
}

run().catch(console.error);
