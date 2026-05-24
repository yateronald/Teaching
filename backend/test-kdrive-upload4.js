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

    // v2 /upload with file_name field
    console.log('Test 1: v2 /upload with file_name + directory_id...');
    try {
        const form = new FormData();
        form.append('file', fs.createReadStream(testFile), 'test-upload.txt');
        form.append('file_name', 'test-upload.txt');
        form.append('directory_id', String(folderId));
        const resp = await axios.post(
            `https://api.infomaniak.com/2/drive/${driveId}/upload`,
            form,
            { headers: { ...form.getHeaders(), 'Authorization': `Bearer ${token}` }, maxContentLength: Infinity, maxBodyLength: Infinity }
        );
        console.log('✅ SUCCESS!');
        console.log(JSON.stringify(resp.data, null, 2).substring(0, 500));
    } catch (err) {
        console.log('❌ FAILED:', err.response?.status);
        console.log(JSON.stringify(err.response?.data, null, 2)?.substring(0, 500));
    }

    fs.unlinkSync(testFile);
}

main();
