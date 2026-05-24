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

    // Try v3 with name field
    console.log('Test 1: v3 /files/{id}/file with name field...');
    try {
        const form1 = new FormData();
        form1.append('file', fs.createReadStream(testFile), 'test-upload.txt');
        form1.append('name', 'test-upload.txt');
        const resp1 = await axios.post(
            `https://api.infomaniak.com/3/drive/${driveId}/files/${folderId}/file`,
            form1,
            { headers: { ...form1.getHeaders(), 'Authorization': `Bearer ${token}` }, maxContentLength: Infinity, maxBodyLength: Infinity }
        );
        console.log('✅ SUCCESS!', JSON.stringify(resp1.data?.data || resp1.data, null, 2).substring(0, 500));
    } catch (err) {
        console.log('❌ FAILED:', err.response?.status, JSON.stringify(err.response?.data).substring(0, 300));
    }

    // Try v2 /upload with directory_id as query param
    console.log('\nTest 2: v2 /upload with directory_id as query param...');
    try {
        const form2 = new FormData();
        form2.append('file', fs.createReadStream(testFile), 'test-upload.txt');
        const resp2 = await axios.post(
            `https://api.infomaniak.com/2/drive/${driveId}/upload?directory_id=${folderId}`,
            form2,
            { headers: { ...form2.getHeaders(), 'Authorization': `Bearer ${token}` }, maxContentLength: Infinity, maxBodyLength: Infinity }
        );
        console.log('✅ SUCCESS!', JSON.stringify(resp2.data?.data || resp2.data, null, 2).substring(0, 500));
    } catch (err) {
        console.log('❌ FAILED:', err.response?.status, JSON.stringify(err.response?.data).substring(0, 300));
    }

    // Try v3 with just the file and conflict param
    console.log('\nTest 3: v3 /files/{id}/file with name + conflict...');
    try {
        const form3 = new FormData();
        form3.append('file', fs.createReadStream(testFile), 'test-upload.txt');
        form3.append('name', 'test-upload.txt');
        form3.append('conflict', 'rename');
        const resp3 = await axios.post(
            `https://api.infomaniak.com/3/drive/${driveId}/files/${folderId}/file`,
            form3,
            { headers: { ...form3.getHeaders(), 'Authorization': `Bearer ${token}` }, maxContentLength: Infinity, maxBodyLength: Infinity }
        );
        console.log('✅ SUCCESS!', JSON.stringify(resp3.data?.data || resp3.data, null, 2).substring(0, 500));
    } catch (err) {
        console.log('❌ FAILED:', err.response?.status, JSON.stringify(err.response?.data).substring(0, 300));
    }

    fs.unlinkSync(testFile);
}

main();
