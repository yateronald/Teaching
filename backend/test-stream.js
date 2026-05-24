const { getKDriveService } = require('./services/kdriveService');
const axios = require('axios');
const http = require('http');
require('dotenv').config();

async function run() {
    const kdrive = getKDriveService();
    const server = http.createServer(async (req, res) => {
        try {
            console.log(req.method, req.url, req.headers.range);
            const files = await kdrive.listFiles();
            const fileId = files[0].id;
            
            const headers = { 'Authorization': `Bearer ${kdrive.token}` };
            if (req.headers.range) {
                headers['Range'] = req.headers.range;
            }
            
            const resp = await axios.get(`${kdrive.baseUrl}/files/${fileId}/download`, {
                headers,
                responseType: 'stream',
                validateStatus: status => status < 400
            });
            
            res.statusCode = resp.status;
            ['content-type', 'content-length', 'content-range', 'accept-ranges'].forEach(h => {
                if (resp.headers[h]) res.setHeader(h, resp.headers[h]);
            });
            res.setHeader('Content-Disposition', 'inline');
            resp.data.pipe(res);
            
        } catch (e) {
            console.error(e.message);
            res.statusCode = 500;
            res.end();
        }
    });
    server.listen(4000, () => console.log('Test proxy on 4000'));
}
run();
