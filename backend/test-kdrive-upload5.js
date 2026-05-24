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
    const fileBuffer = fs.readFileSync(testFile);

    // Test: PUT binary upload with query params (like some cloud APIs)
    console.log('Test 1: v2 PUT /files/{folderId}/upload with binary body...');
    try {
        const resp = await axios.put(
            `https://api.infomaniak.com/2/drive/${driveId}/files/${folderId}/upload`,
            fileBuffer,
            { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/octet-stream' }, params: { file_name: 'test-upload.txt' } }
        );
        console.log('✅ SUCCESS!', JSON.stringify(resp.data).substring(0, 300));
    } catch (err) {
        console.log('❌ FAILED:', err.response?.status, JSON.stringify(err.response?.data).substring(0, 300));
    }

    // Test: POST with all params as query string
    console.log('\nTest 2: v2 POST /upload with query params...');
    try {
        const form = new FormData();
        form.append('file', fs.createReadStream(testFile), 'test-upload.txt');
        const resp = await axios.post(
            `https://api.infomaniak.com/2/drive/${driveId}/upload?directory_id=${folderId}&file_name=test-upload.txt&conflict=rename`,
            form,
            { headers: { ...form.getHeaders(), 'Authorization': `Bearer ${token}` }, maxContentLength: Infinity, maxBodyLength: Infinity }
        );
        console.log('✅ SUCCESS!', JSON.stringify(resp.data).substring(0, 300));
    } catch (err) {
        console.log('❌ FAILED:', err.response?.status, JSON.stringify(err.response?.data).substring(0, 300));
    }

    // Test: v3 with name, type as JSON body (not multipart)
    console.log('\nTest 3: v3 POST /files/{id}/file as JSON + binary...');
    try {
        const resp = await axios.post(
            `https://api.infomaniak.com/3/drive/${driveId}/files/${folderId}/file`,
            fileBuffer,
            { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'text/plain' }, params: { name: 'test-upload.txt', type: 'file' } }
        );
        console.log('✅ SUCCESS!', JSON.stringify(resp.data).substring(0, 300));
    } catch (err) {
        console.log('❌ FAILED:', err.response?.status, JSON.stringify(err.response?.data).substring(0, 300));
    }

    fs.unlinkSync(testFile);
}

main();
