/**
 * Daily tidy-up of the website accounts' tables: finished or expired sign-ups
 * and codes are forgotten after two days, protected-content history after 180
 * days, and the throw-away email list is read again (after its weekly refresh).
 */
const { ready } = require('./learnAccess');
const { reloadDomainLists } = require('./emailIdentity');

async function sweep(db) {
    if (!(await ready(db))) return;
    await db.run("DELETE FROM learn_pending_signups WHERE expires_at < now() - INTERVAL '2 days' OR used_at < now() - INTERVAL '2 days'");
    await db.run("DELETE FROM learn_codes WHERE expires_at < now() - INTERVAL '2 days'");
    await db.run("DELETE FROM learn_content_log WHERE created_at < now() - INTERVAL '180 days'");
    reloadDomainLists();
}

function start(db) {
    const tick = () => sweep(db).catch(err => console.error('[learn] housekeeping failed:', err.message));
    tick();
    const timer = setInterval(tick, 24 * 60 * 60 * 1000);
    timer.unref?.();
    return timer;
}

module.exports = { start, sweep };
