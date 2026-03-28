/**
 * Quick test script for kDrive API connection
 * Run: node test-kdrive.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const { getKDriveService } = require('./services/kdriveService');

async function main() {
    const kdrive = getKDriveService();
    
    console.log('🔧 Config:');
    console.log('  KDRIVE_ID:', process.env.KDRIVE_ID);
    console.log('  KDRIVE_FOLDER_ID:', process.env.KDRIVE_FOLDER_ID);
    console.log('  KDRIVE_TOKEN:', process.env.KDRIVE_TOKEN ? `${process.env.KDRIVE_TOKEN.substring(0, 10)}...` : 'NOT SET');
    console.log('  Configured:', kdrive.isConfigured);
    console.log('');

    if (!kdrive.isConfigured) {
        console.error('❌ kDrive is not configured. Please set KDRIVE_TOKEN in .env');
        process.exit(1);
    }

    // Test connection
    console.log('📡 Testing connection...');
    const result = await kdrive.testConnection();
    console.log('  Result:', result);
    
    if (!result.ok) {
        console.error('❌ Connection failed. Check your token and drive ID.');
        process.exit(1);
    }

    // List root folder
    console.log('\n📂 Listing root folder...');
    const files = await kdrive.listFiles();
    console.log(`  Found ${files.length} items`);
    files.forEach(f => console.log(`    ${f.type === 'dir' ? '📁' : '📄'} ${f.name} (id: ${f.id})`));

    // Test creating a folder
    console.log('\n📁 Creating test folder...');
    const testFolder = await kdrive.getOrCreateFolder(process.env.KDRIVE_FOLDER_ID, 'Teacher_test_TestTeacher');
    console.log('  Created/found:', testFolder?.name, '(id:', testFolder?.id, ')');

    console.log('\n✅ All tests passed!');
}

main().catch(err => {
    console.error('❌ Error:', err.response?.data || err.message);
    process.exit(1);
});
