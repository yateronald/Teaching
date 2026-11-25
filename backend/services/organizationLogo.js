/**
 * Company logos and portal cover images: stored on kDrive, served publicly
 * (for the company's sign-in page `/o/<slug>` and email headers).
 *
 * Only PNG, JPEG and WebP are accepted, recognised from the file's own bytes —
 * never from its name or the type the browser claims. SVG is refused: it can
 * carry script.
 */
const fs = require('fs');
const multer = require('multer');
const os = require('os');
const { getKDriveService } = require('./kdriveService');
const { OrgError } = require('./organizationService');
const { hasColumn } = require('./schemaFeatures');

const MAX_LOGO_BYTES = 1024 * 1024; // 1 MB
const MAX_COVER_BYTES = 2 * 1024 * 1024; // 2 MB
const MAX_CACHE_ENTRIES = 30;

const uploadLogo = multer({
    dest: os.tmpdir(),
    limits: { fileSize: MAX_LOGO_BYTES + 1, files: 1, fields: 1, fieldSize: 256 * 1024 },
});

const uploadCover = multer({
    dest: os.tmpdir(),
    limits: { fileSize: MAX_COVER_BYTES + 1, files: 1, fields: 1, fieldSize: 256 * 1024 },
});

/** The image type from the first bytes of the file, or null. */
function sniff(buffer) {
    if (!buffer || buffer.length < 3) return null;
    if (buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'image/png';
    if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return 'image/jpeg';
    if (buffer.length >= 12 && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') return 'image/webp';
    return null;
}
const EXT = { 'image/png': '.png', 'image/jpeg': '.jpg', 'image/webp': '.webp' };

/** Express middleware: one file in the field "logo", with readable errors. */
function receive(req, res, next) {
    uploadLogo.single('logo')(req, res, (err) => {
        if (err) {
            const tooBig = err.code === 'LIMIT_FILE_SIZE';
            return res.status(400).json({ error: tooBig ? 'The logo must be 1 MB or less.' : 'The logo could not be read.', code: tooBig ? 'LOGO_TOO_BIG' : 'LOGO_UNREADABLE' });
        }
        next();
    });
}

/** Express middleware: one file in the field "cover", with readable errors. */
function receiveCover(req, res, next) {
    uploadCover.single('cover')(req, res, (err) => {
        if (err) {
            const tooBig = err.code === 'LIMIT_FILE_SIZE';
            return res.status(400).json({ error: tooBig ? 'The cover image must be 2 MB or less.' : 'The cover image could not be read.', code: tooBig ? 'COVER_TOO_BIG' : 'COVER_UNREADABLE' });
        }
        next();
    });
}

const cleanup = (file) => { try { if (file?.path) fs.unlinkSync(file.path); } catch { /* already gone */ } };

// Served assets, kept in memory with bounded size: fast for login & shell pages.
const cache = new Map(); // org id → { version, mime, buffer }
const coverCache = new Map(); // org id → { version, mime, buffer }

function setBounded(map, key, val) {
    if (map.has(key)) map.delete(key);
    map.set(key, val);
    while (map.size > MAX_CACHE_ENTRIES) {
        const oldest = map.keys().next().value;
        map.delete(oldest);
    }
}

function readHeadMime(filePath) {
    const head = Buffer.alloc(16);
    const fd = fs.openSync(filePath, 'r');
    try { fs.readSync(fd, head, 0, 16, 0); } finally { fs.closeSync(fd); }
    return sniff(head);
}

/** Replaces the company's logo with the uploaded file. */
async function saveLogo(db, org, file) {
    try {
        if (!file) throw new OrgError('LOGO_MISSING', 'Choose an image file (PNG, JPG or WebP).');
        if (file.size > MAX_LOGO_BYTES) throw new OrgError('LOGO_TOO_BIG', 'The logo must be 1 MB or less.');
        const mime = readHeadMime(file.path);
        if (!mime) throw new OrgError('LOGO_TYPE', 'The logo must be a PNG, JPG or WebP image.');

        const kdrive = getKDriveService();
        if (!kdrive.isConfigured) throw new OrgError('STORAGE_UNAVAILABLE', 'File storage is not available right now.', 503);
        const folder = await kdrive.getOrCreateFolder(kdrive.rootFolderId, 'Company_Logos');
        if (!folder) throw new Error('Could not open the Company_Logos folder on kDrive');
        const uploaded = await kdrive.uploadFile(file.path, folder.id, `company_${org.id}_${Date.now()}${EXT[mime]}`);
        if (!uploaded?.id) throw new Error('kDrive returned no file id');

        let updated;
        try {
            updated = await db.get(
                `UPDATE organizations SET logo_file_id = $1, logo_mime = $2, logo_updated_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
                 WHERE id = $3 RETURNING *`,
                [String(uploaded.id), mime, org.id]
            );
            if (!updated) throw new OrgError('ORG_NOT_FOUND', 'Company not found.', 404);
        } catch (err) {
            await deleteStoredLogo(uploaded.id);
            throw err;
        }
        cache.delete(Number(org.id));
        if (org.logo_file_id && String(org.logo_file_id) !== String(uploaded.id)) {
            void deleteStoredLogo(org.logo_file_id);
        }
        return updated;
    } finally {
        cleanup(file);
    }
}

/** Replaces the company's portal cover/background image with the uploaded file. */
async function saveCover(db, org, file) {
    try {
        if (!(await hasColumn(db, 'organizations', 'cover_file_id'))) {
            throw new OrgError('MIGRATION_PENDING', 'Portal cover images require migration 037.', 503);
        }
        if (!file) throw new OrgError('COVER_MISSING', 'Choose an image file (PNG, JPG or WebP).');
        if (file.size > MAX_COVER_BYTES) throw new OrgError('COVER_TOO_BIG', 'The cover image must be 2 MB or less.');
        const mime = readHeadMime(file.path);
        if (!mime) throw new OrgError('COVER_TYPE', 'The cover image must be a PNG, JPG or WebP image.');

        const kdrive = getKDriveService();
        if (!kdrive.isConfigured) throw new OrgError('STORAGE_UNAVAILABLE', 'File storage is not available right now.', 503);
        const folder = await kdrive.getOrCreateFolder(kdrive.rootFolderId, 'Company_Covers');
        if (!folder) throw new Error('Could not open the Company_Covers folder on kDrive');
        const uploaded = await kdrive.uploadFile(file.path, folder.id, `company_${org.id}_cover_${Date.now()}${EXT[mime]}`);
        if (!uploaded?.id) throw new Error('kDrive returned no file id');

        let updated;
        try {
            updated = await db.get(
                `UPDATE organizations SET cover_file_id = $1, cover_mime = $2, cover_updated_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
                 WHERE id = $3 RETURNING *`,
                [String(uploaded.id), mime, org.id]
            );
            if (!updated) throw new OrgError('ORG_NOT_FOUND', 'Company not found.', 404);
        } catch (err) {
            await deleteStoredLogo(uploaded.id);
            throw err;
        }
        coverCache.delete(Number(org.id));
        if (org.cover_file_id && String(org.cover_file_id) !== String(uploaded.id)) {
            void deleteStoredLogo(org.cover_file_id);
        }
        return updated;
    } finally {
        cleanup(file);
    }
}

async function deleteStoredLogo(id) {
    if (!id) return;
    const kdrive = getKDriveService();
    if (kdrive.isConfigured) await kdrive.deleteFile(id).catch(e => console.warn('[organizations] file not deleted:', e.message));
}

async function removeLogo(db, org) {
    await db.run(
        `UPDATE organizations SET logo_file_id = NULL, logo_mime = NULL, logo_updated_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
        [org.id]
    );
    cache.delete(Number(org.id));
    void deleteStoredLogo(org.logo_file_id);
}

async function removeCover(db, org) {
    if (!(await hasColumn(db, 'organizations', 'cover_file_id'))) {
        throw new OrgError('MIGRATION_PENDING', 'Portal cover images require migration 037.', 503);
    }
    await db.run(
        `UPDATE organizations SET cover_file_id = NULL, cover_mime = NULL, cover_updated_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
        [org.id]
    );
    coverCache.delete(Number(org.id));
    void deleteStoredLogo(org.cover_file_id);
}

/** The logo bytes of a company (by slug), or null. */
async function loadLogo(db, slug) {
    const org = await db.get(
        `SELECT id, logo_file_id, logo_mime, logo_updated_at FROM organizations WHERE lower(slug) = lower($1)`, [slug]);
    if (!org?.logo_file_id) return null;
    const version = new Date(org.logo_updated_at || 0).getTime();
    const hit = cache.get(Number(org.id));
    if (hit && hit.version === version) return hit;
    const kdrive = getKDriveService();
    if (!kdrive.isConfigured) return null;
    const buffer = await kdrive.downloadFileAsBuffer(org.logo_file_id);
    const mime = sniff(buffer);
    if (!mime) return null; // never serve something that is not one of the accepted images
    const entry = { version, mime, buffer };
    setBounded(cache, Number(org.id), entry);
    return entry;
}

/** The cover background bytes of a company (by slug), or null. */
async function loadCover(db, slug) {
    if (!(await hasColumn(db, 'organizations', 'cover_file_id'))) return null;
    const org = await db.get(
        `SELECT id, cover_file_id, cover_mime, cover_updated_at FROM organizations WHERE lower(slug) = lower($1)`, [slug]);
    if (!org?.cover_file_id) return null;
    const version = new Date(org.cover_updated_at || 0).getTime();
    const hit = coverCache.get(Number(org.id));
    if (hit && hit.version === version) return hit;
    const kdrive = getKDriveService();
    if (!kdrive.isConfigured) return null;
    const buffer = await kdrive.downloadFileAsBuffer(org.cover_file_id);
    const mime = sniff(buffer);
    if (!mime) return null;
    const entry = { version, mime, buffer };
    setBounded(coverCache, Number(org.id), entry);
    return entry;
}

module.exports = {
    MAX_LOGO_BYTES, MAX_COVER_BYTES,
    sniff, receive, receiveCover,
    saveLogo, saveCover,
    removeLogo, removeCover,
    loadLogo, loadCover,
    cleanup, deleteStoredLogo,
};
