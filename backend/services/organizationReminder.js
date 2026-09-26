/**
 * Warns before a company's access ends: its managers and the administrators
 * get an email (and an in-app notification) once, EXPIRY_NOTICE_DAYS before
 * the end date. Extending the date allows a new warning for the new date.
 */
const orgs = require('./organizationService');
const { sendCompanyExpiryNotice } = require('../emails/emailService');
const { createNotification } = require('./notificationService');

const EVERY_MS = 6 * 60 * 60 * 1000;
let timer = null;

async function runOnce(db) {
    if (!(await orgs.ready(db))) return 0;
    const due = await db.all(
        `SELECT * FROM organizations
          WHERE status = 'active' AND access_starts_at <= CURRENT_TIMESTAMP AND access_ends_at > CURRENT_TIMESTAMP
            AND access_ends_at <= CURRENT_TIMESTAMP + make_interval(days => $1)
            AND expiry_notice_for IS DISTINCT FROM access_ends_at`,
        [orgs.EXPIRY_NOTICE_DAYS]
    );
    let sent = 0;
    for (const candidate of due) {
        // Claim the notice first, so it goes out once even with several servers.
        const org = await db.get(
            `UPDATE organizations SET expiry_notice_for = access_ends_at
              WHERE id = $1 AND expiry_notice_for IS DISTINCT FROM access_ends_at RETURNING *`,
            [candidate.id]
        );
        if (!org) continue;
        const daysLeft = Math.max(1, orgs.daysLeft(org));
        const people = await db.all(
            `SELECT id, email, first_name, last_name, role FROM users
              WHERE is_active AND ((organization_id = $1 AND role = 'org_admin') OR role = 'admin')`,
            [org.id]
        );
        for (const p of people) {
            const lang = p.role === 'admin' ? 'en' : org.default_language;
            try {
                await sendCompanyExpiryNotice({ to: p.email, name: `${p.first_name} ${p.last_name}`, org, daysLeft, lang });
                sent += 1;
            } catch (err) {
                console.error('[organizations] expiry notice email failed for user', p.id, err && err.message);
            }
            await createNotification(db, {
                user_id: p.id,
                type: 'company_expiring',
                title: lang === 'fr' ? 'Accès bientôt terminé' : 'Access ends soon',
                message: lang === 'fr'
                    ? `L’accès de ${org.display_name || org.name} se termine dans ${daysLeft} jour${daysLeft > 1 ? 's' : ''}.`
                    : `Access for ${org.display_name || org.name} ends in ${daysLeft} day${daysLeft > 1 ? 's' : ''}.`,
                link: p.role === 'admin' ? `/app/companies/${org.id}` : '/app/org',
            }).catch(() => {});
        }
        await orgs.audit(db, org.id, null, 'expiry_notice_sent', { days_left: daysLeft, recipients: people.length });
    }
    return sent;
}

function start(db) {
    if (timer) return;
    const tick = () => runOnce(db).catch(err => console.error('[organizations] expiry check failed:', err.message));
    timer = setInterval(tick, EVERY_MS);
    setTimeout(tick, 60 * 1000); // shortly after start, not during it
}

function stop() {
    if (timer) clearInterval(timer);
    timer = null;
}

module.exports = { runOnce, start, stop };
