/**
 * Company logos: stored on kDrive, served publicly (the logo shows on the
 * company's sign-in page, before anyone is signed in).
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

const MAX_LOGO_BYTES = 1024 * 1024; // 1 MB

const upload = multer({ dest: os.tmpdir(), limits: { fileSize: MAX_LOGO_BYTES, files: 1 } });

/** The image type from the first bytes of the file, or null. */
function sniff(buffer) {
    if (buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'image/png';
    if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return 'image/jpeg';
    if (buffer.length >= 12 && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') return 'image/webp';
    return null;
}
const EXT = { 'image/png': '.png', 'image/jpeg': '.jpg', 'image/webp': '.webp' };

/** Express middleware: one file in the field "logo", with readable errors. */
function receive(req, res, next) {
    upload.single('logo')(req, res, (err) => {
        if (err) {
            const tooBig = err.code === 'LIMIT_FILE_SIZE';
            return res.status(400).json({ error: tooBig ? 'The logo must be 1 MB or less.' : 'The logo could not be read.', code: tooBig ? 'LOGO_TOO_BIG' : 'LOGO_UNREADABLE' });
        }
        next();
    });
}

const cleanup = (file) => { try { if (file?.path) fs.unlinkSync(file.path); } catch { /* already gone */ } };

// Served logos, kept in memory: they are small and asked for on every page.
const cache = new Map(); // org id → { version, mime, buffer }

/** Replaces the company's logo with the uploaded file. */
async function saveLogo(db, org, file) {
    try {
        if (!file) throw new OrgError('LOGO_MISSING', 'Choose an image file (PNG, JPG or WebP).');
        const head = Buffer.alloc(16);
        const fd = fs.openSync(file.path, 'r');
        try { fs.readSync(fd, head, 0, 16, 0); } finally { fs.closeSync(fd); }
        const mime = sniff(head);
        if (!mime) throw new OrgError('LOGO_TYPE', 'The logo must be a PNG, JPG or WebP image.');

        const kdrive = getKDriveService();
        if (!kdrive.isConfigured) throw new OrgError('STORAGE_UNAVAILABLE', 'File storage is not available right now.', 503);
        const folder = await kdrive.getOrCreateFolder(kdrive.rootFolderId, 'Company_Logos');
        if (!folder) throw new Error('Could not open the Company_Logos folder on kDrive');
        const uploaded = await kdrive.uploadFile(file.path, folder.id, `company_${org.id}_${Date.now()}${EXT[mime]}`);
        if (!uploaded?.id) throw new Error('kDrive returned no file id');

        await db.run(
            `UPDATE organizations SET logo_file_id = $1, logo_mime = $2, logo_updated_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = $3`,
            [String(uploaded.id), mime, org.id]
        );
        cache.delete(Number(org.id));
        if (org.logo_file_id && String(org.logo_file_id) !== String(uploaded.id)) {
            kdrive.deleteFile(org.logo_file_id).catch(e => console.warn('[organizations] old logo not deleted:', e.message));
        }
    } finally {
        cleanup(file);
    }
}

async function removeLogo(db, org) {
    await db.run(
        `UPDATE organizations SET logo_file_id = NULL, logo_mime = NULL, logo_updated_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
        [org.id]
    );
    cache.delete(Number(org.id));
    if (org.logo_file_id) {
        const kdrive = getKDriveService();
        if (kdrive.isConfigured) kdrive.deleteFile(org.logo_file_id).catch(e => console.warn('[organizations] logo not deleted:', e.message));
    }
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
    cache.set(Number(org.id), entry);
    return entry;
}

module.exports = { MAX_LOGO_BYTES, sniff, receive, saveLogo, removeLogo, loadLogo, cleanup };
