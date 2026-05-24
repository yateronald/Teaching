const { getKDriveService } = require('./services/kdriveService');
const axios = require('axios');
require('dotenv').config();

async function run() {
    const kdrive = getKDriveService();
    await kdrive.testConnection();
    
    const files = await kdrive.listFiles();
    if (files.length > 0) {
        const fileId = files[0].id;
        const url = await kdrive.getDownloadUrl(fileId);
        console.log('Download URL:', url);
        
        try {
            const resp = await axios.head(url);
            console.log('HEADERS:', resp.headers);
        } catch (e) {
            console.error('Error fetching headers:', e.message);
        }
    }
}
run();
