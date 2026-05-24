const path = require('path');
const fs = require('fs');
const axios = require('axios');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const token = process.env.KDRIVE_TOKEN;
const driveId = process.env.KDRIVE_ID;
const folderId = process.env.KDRIVE_FOLDER_ID;

async function main() {
    const testFile = path.join(__dirname, 'test-upload.txt');
    fs.writeFileSync(testFile, 'Test upload ' + Date.now());
    const fileBuffer = fs.readFileSync(testFile);
    const fileSize = fileBuffer.length;

    console.log(`File size: ${fileSize} bytes`);

    // Send raw binary body with params in query string
    console.log('\nTest: v2 POST /upload with raw binary body...');
    try {
        const resp = await axios.post(
            `https://api.infomaniak.com/2/drive/${driveId}/upload?directory_id=${folderId}&file_name=test-upload.txt&total_size=${fileSize}&conflict=rename`,
            fileBuffer,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/octet-stream',
                    'Content-Length': fileSize,
                },
                maxContentLength: Infinity,
                maxBodyLength: Infinity,
            }
        );
        console.log('✅ SUCCESS!');
        console.log(JSON.stringify(resp.data, null, 2).substring(0, 600));
        
        // Clean up - delete the uploaded file
        if (resp.data?.data?.id) {
            console.log('\nCleaning up test file (id:', resp.data.data.id, ')...');
            await axios.delete(`https://api.infomaniak.com/2/drive/${driveId}/files/${resp.data.data.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            console.log('Cleaned up.');
        }
    } catch (err) {
        console.log('❌ FAILED:', err.response?.status);
        console.log(JSON.stringify(err.response?.data, null, 2)?.substring(0, 500));
    }

    fs.unlinkSync(testFile);
}

main();
