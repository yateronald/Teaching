const path = require('path');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const token = process.env.KDRIVE_TOKEN;
const driveId = process.env.KDRIVE_ID;
const folderId = process.env.KDRIVE_FOLDER_ID;

async function main() {
    const testFile = path.join(__dirname, 'test-upload.txt');
    fs.writeFileSync(testFile, 'Test upload ' + Date.now());
    const fileSize = fs.statSync(testFile).size;

    console.log(`File size: ${fileSize} bytes`);

    // v2 /upload with query params including total_size
    console.log('\nTest: v2 POST /upload with directory_id + file_name + total_size as query params...');
    try {
        const form = new FormData();
        form.append('file', fs.createReadStream(testFile), 'test-upload.txt');
        const resp = await axios.post(
            `https://api.infomaniak.com/2/drive/${driveId}/upload?directory_id=${folderId}&file_name=test-upload.txt&total_size=${fileSize}&conflict=rename`,
            form,
            { headers: { ...form.getHeaders(), 'Authorization': `Bearer ${token}` }, maxContentLength: Infinity, maxBodyLength: Infinity }
        );
        console.log('✅ SUCCESS!');
        console.log(JSON.stringify(resp.data, null, 2).substring(0, 600));
    } catch (err) {
        console.log('❌ FAILED:', err.response?.status);
        console.log(JSON.stringify(err.response?.data, null, 2)?.substring(0, 500));
    }

    fs.unlinkSync(testFile);
}

main();
