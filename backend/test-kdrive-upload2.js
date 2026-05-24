const path = require('path');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const token = process.env.KDRIVE_TOKEN;
const driveId = process.env.KDRIVE_ID;
const folderId = process.env.KDRIVE_FOLDER_ID;

async function tryUpload(label, url, formBuilder) {
    try {
        const form = formBuilder();
        const resp = await axios.post(url, form, {
            headers: { ...form.getHeaders(), 'Authorization': `Bearer ${token}` },
            maxContentLength: Infinity, maxBodyLength: Infinity,
        });
        console.log(`✅ ${label}: SUCCESS (status ${resp.status})`);
        console.log('   Response:', JSON.stringify(resp.data?.data || resp.data, null, 2).substring(0, 300));
        return true;
    } catch (err) {
        console.log(`❌ ${label}: FAILED (${err.response?.status || err.message})`);
        if (err.response?.data) console.log('   Error:', JSON.stringify(err.response.data).substring(0, 200));
        return false;
    }
}

async function main() {
    const testFile = path.join(__dirname, 'test-upload.txt');
    fs.writeFileSync(testFile, 'Test upload ' + Date.now());

    console.log(`Token: ${token?.substring(0, 10)}...`);
    console.log(`Drive: ${driveId}, Folder: ${folderId}\n`);

    // Try various URL patterns
    const urls = [
        ['v2 /files/{id}/upload', `https://api.infomaniak.com/2/drive/${driveId}/files/${folderId}/upload`],
        ['v2 /upload (with dir param)', `https://api.infomaniak.com/2/drive/${driveId}/upload`],
        ['v3 /files/{id}/file', `https://api.infomaniak.com/3/drive/${driveId}/files/${folderId}/file`],
        ['v2 /files/upload', `https://api.infomaniak.com/2/drive/${driveId}/files/upload`],
        ['v1 /drive/{id}/files/{id}/upload', `https://api.infomaniak.com/1/drive/${driveId}/files/${folderId}/upload`],
        ['v2 /files/{id}/import', `https://api.infomaniak.com/2/drive/${driveId}/files/${folderId}/import`],
    ];

    for (const [label, url] of urls) {
        const ok = await tryUpload(label, url, () => {
            const form = new FormData();
            form.append('file', fs.createReadStream(testFile), 'test-upload.txt');
            return form;
        });
        if (ok) break;
    }

    // Also try with directory_id in form data
    console.log('\n--- With directory_id in form ---');
    await tryUpload('v2 /upload + directory_id', `https://api.infomaniak.com/2/drive/${driveId}/upload`, () => {
        const form = new FormData();
        form.append('file', fs.createReadStream(testFile), 'test-upload.txt');
        form.append('directory_id', String(folderId));
        return form;
    });

    fs.unlinkSync(testFile);
}

main();
