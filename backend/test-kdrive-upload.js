/**
 * Test kDrive file upload
 */
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { getKDriveService } = require('./services/kdriveService');

async function main() {
    const kdrive = getKDriveService();
    console.log('Configured:', kdrive.isConfigured);
    console.log('Drive ID:', kdrive.driveId);
    console.log('Root folder:', kdrive.rootFolderId);
    
    // Create a small test file
    const testFile = path.join(__dirname, 'test-upload.txt');
    fs.writeFileSync(testFile, 'Hello from kDrive upload test! ' + new Date().toISOString());
    
    try {
        // Test connection first
        const conn = await kdrive.testConnection();
        console.log('Connection:', conn.ok ? 'OK' : 'FAILED');
        if (!conn.ok) { console.error(conn.error); return; }
        
        // Try uploading directly to root folder
        console.log('\nUploading test file to root folder (id:', kdrive.rootFolderId, ')...');
        const result = await kdrive.uploadFile(testFile, kdrive.rootFolderId, 'test-upload.txt');
        console.log('Upload result:', JSON.stringify(result, null, 2));
        
        if (result) {
            console.log('\n✅ Upload successful! File ID:', result.id);
            // Clean up - delete the test file from kDrive
            await kdrive.deleteFile(result.id);
            console.log('Cleaned up test file from kDrive');
        } else {
            console.log('\n❌ Upload returned null/undefined');
        }
    } catch (err) {
        console.error('\n❌ Upload error:');
        console.error('Status:', err.response?.status);
        console.error('Data:', JSON.stringify(err.response?.data, null, 2));
        console.error('Message:', err.message);
    } finally {
        // Clean up local test file
        if (fs.existsSync(testFile)) fs.unlinkSync(testFile);
    }
}

main();
