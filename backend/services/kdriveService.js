const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

/**
 * kDrive Service — Manages file operations on Infomaniak kDrive
 * 
 * Folder structure on kDrive:
 *   Root (KDRIVE_FOLDER_ID)
 *   └── Teacher_{id}_{firstName}_{lastName}/
 *       └── Batch_{id}_{name}/
 *           └── uploaded files...
 */
class KDriveService {
    constructor() {
        this.token = process.env.KDRIVE_TOKEN;
        this.driveId = process.env.KDRIVE_ID;
        this.rootFolderId = process.env.KDRIVE_FOLDER_ID;
        this.baseUrl = `https://api.infomaniak.com/2/drive/${this.driveId}`;
        
        if (!this.token || !this.driveId || !this.rootFolderId) {
            console.warn('⚠️  kDrive: Missing KDRIVE_TOKEN, KDRIVE_ID, or KDRIVE_FOLDER_ID in .env');
        }
    }

    get headers() {
        return {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json',
        };
    }

    get isConfigured() {
        return !!(this.token && this.driveId && this.rootFolderId
            && this.token !== 'your-kdrive-api-token-here');
    }

    /**
     * Test the connection to kDrive API
     */
    async testConnection() {
        try {
            const resp = await axios.get(`${this.baseUrl}/files/${this.rootFolderId}`, {
                headers: this.headers,
            });
            if (resp.data?.result === 'success') {
                console.log('✅ kDrive: Connection successful');
                return { ok: true, folder: resp.data.data };
            }
            return { ok: false, error: 'Unexpected response' };
        } catch (err) {
            const msg = err.response?.data?.error?.description || err.message;
            console.error('❌ kDrive: Connection failed —', msg);
            return { ok: false, error: msg };
        }
    }

    /**
     * List files in a folder
     */
    async listFiles(folderId) {
        const id = folderId || this.rootFolderId;
        const resp = await axios.get(`${this.baseUrl}/files/${id}/files`, {
            headers: this.headers,
            params: { order_by: 'last_modified_at', order: 'desc', with: 'capabilities' },
        });
        return resp.data?.data || [];
    }

    /**
     * Create a folder inside a parent folder
     * Returns the created folder object
     */
    async createFolder(parentFolderId, name) {
        try {
            const resp = await axios.post(
                `${this.baseUrl}/files/${parentFolderId}/directory`,
                { name, conflict: 'rename' },
                { headers: this.headers }
            );
            return resp.data?.data || null;
        } catch (err) {
            // If folder already exists, try to find it
            if (err.response?.status === 409 || err.response?.data?.error?.code === 'conflict') {
                return this.findFolder(parentFolderId, name);
            }
            throw err;
        }
    }

    /**
     * Find a folder by name inside a parent
     */
    async findFolder(parentFolderId, name) {
        const files = await this.listFiles(parentFolderId);
        return files.find(f => f.type === 'dir' && f.name === name) || null;
    }

    /**
     * Get or create a folder (idempotent)
     */
    async getOrCreateFolder(parentFolderId, name) {
        const existing = await this.findFolder(parentFolderId, name);
        if (existing) return existing;
        return this.createFolder(parentFolderId, name);
    }

    /**
     * Get or create the teacher's folder structure:
     *   Root / Teacher_{id}_{name} / Batch_{id}_{name}
     * 
     * Returns { teacherFolder, batchFolder } with kDrive IDs
     */
    async ensureTeacherBatchFolder(teacherId, teacherName, batchId, batchName) {
        // Teacher folder
        const teacherFolderName = `Teacher_${teacherId}_${this.sanitizeName(teacherName)}`;
        const teacherFolder = await this.getOrCreateFolder(this.rootFolderId, teacherFolderName);
        if (!teacherFolder) throw new Error('Failed to create teacher folder on kDrive');

        // Batch folder inside teacher folder
        if (batchId && batchName) {
            const batchFolderName = `Batch_${batchId}_${this.sanitizeName(batchName)}`;
            const batchFolder = await this.getOrCreateFolder(teacherFolder.id, batchFolderName);
            return { teacherFolder, batchFolder };
        }

        return { teacherFolder, batchFolder: teacherFolder };
    }

    /**
     * Upload a file to kDrive
     * @param {string} localFilePath - Path to the local temp file
     * @param {number} targetFolderId - kDrive folder ID to upload into
     * @param {string} fileName - Original file name
     * @returns {object} kDrive file object with id, name, etc.
     */
    async uploadFile(localFilePath, targetFolderId, fileName) {
        const form = new FormData();
        form.append('file', fs.createReadStream(localFilePath), fileName);

        const resp = await axios.post(
            `${this.baseUrl}/files/${targetFolderId}/upload`,
            form,
            {
                headers: {
                    ...form.getHeaders(),
                    'Authorization': `Bearer ${this.token}`,
                },
                maxContentLength: Infinity,
                maxBodyLength: Infinity,
            }
        );

        return resp.data?.data || null;
    }

    /**
     * Get a temporary download URL for a file
     */
    async getDownloadUrl(fileId) {
        const resp = await axios.get(`${this.baseUrl}/files/${fileId}/download`, {
            headers: this.headers,
            maxRedirects: 0,
            validateStatus: (status) => status >= 200 && status < 400,
        });
        // The API may return a redirect URL or a direct download link
        if (resp.headers.location) return resp.headers.location;
        if (resp.data?.data) return resp.data.data;
        // If response is the file itself, return the request URL
        return `${this.baseUrl}/files/${fileId}/download`;
    }

    /**
     * Get file metadata
     */
    async getFileInfo(fileId) {
        const resp = await axios.get(`${this.baseUrl}/files/${fileId}`, {
            headers: this.headers,
        });
        return resp.data?.data || null;
    }

    /**
     * Delete a file from kDrive
     */
    async deleteFile(fileId) {
        await axios.delete(`${this.baseUrl}/files/${fileId}`, {
            headers: this.headers,
        });
        return true;
    }

    /**
     * Rename a file on kDrive
     */
    async renameFile(fileId, newName) {
        const resp = await axios.post(
            `${this.baseUrl}/files/${fileId}/rename`,
            { name: newName },
            { headers: this.headers }
        );
        return resp.data?.data || null;
    }

    /**
     * Move a file to a different folder
     */
    async moveFile(fileId, destinationFolderId) {
        const resp = await axios.post(
            `${this.baseUrl}/files/${fileId}/move/${destinationFolderId}`,
            {},
            { headers: this.headers }
        );
        return resp.data?.data || null;
    }

    /**
     * Get a public share link for a file
     */
    async getShareLink(fileId) {
        try {
            const resp = await axios.post(
                `${this.baseUrl}/files/${fileId}/access/public_share_link`,
                { 
                    right: 'read',
                    can_download: true,
                    can_edit: false,
                    can_see_stats: false,
                },
                { headers: this.headers }
            );
            return resp.data?.data?.url || null;
        } catch (err) {
            // If share link already exists, try to get it
            if (err.response?.status === 409) {
                try {
                    const getResp = await axios.get(
                        `${this.baseUrl}/files/${fileId}/access/public_share_link`,
                        { headers: this.headers }
                    );
                    return getResp.data?.data?.url || null;
                } catch { return null; }
            }
            console.error('kDrive share link error:', err.response?.data || err.message);
            return null;
        }
    }

    /**
     * Proxy-stream a file from kDrive to the HTTP response
     * (avoids exposing kDrive tokens to the client)
     */
    async streamFile(fileId, res) {
        const resp = await axios.get(`${this.baseUrl}/files/${fileId}/download`, {
            headers: { 'Authorization': `Bearer ${this.token}` },
            responseType: 'stream',
        });
        // Forward content headers
        if (resp.headers['content-type']) res.setHeader('Content-Type', resp.headers['content-type']);
        if (resp.headers['content-length']) res.setHeader('Content-Length', resp.headers['content-length']);
        if (resp.headers['content-disposition']) res.setHeader('Content-Disposition', resp.headers['content-disposition']);
        resp.data.pipe(res);
    }

    /** Sanitize a name for use as a folder name */
    sanitizeName(name) {
        return (name || 'Unknown').replace(/[^a-zA-Z0-9_\-\s]/g, '').replace(/\s+/g, '_').substring(0, 50);
    }
}

// Singleton
let instance = null;
function getKDriveService() {
    if (!instance) instance = new KDriveService();
    return instance;
}

module.exports = { KDriveService, getKDriveService };
