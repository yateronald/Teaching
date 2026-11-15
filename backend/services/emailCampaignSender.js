/**
 * Sends email campaigns in the background, at a steady pace.
 *
 *  · Every few seconds it takes the next few people of a campaign being sent
 *    (one statement claims them, so two servers never send the same email).
 *  · The pace is EMAIL_CAMPAIGN_PER_MINUTE (120 by default) and, when set,
 *    EMAIL_CAMPAIGN_DAILY_MAX for all campaigns together (a Brevo plan's daily
 *    allowance): sending stops for the day and goes on by itself the next day.
 *  · Before each email the address is checked again: someone who unsubscribed
 *    a minute ago is skipped.
 *  · A server stopped while an email was going out does not send it twice:
 *    that person is marked « interrupted », and « Retry the failed ones »
 *    sends it again on purpose.
 *  · Scheduled campaigns start by themselves at their time.
 */
const { brevoService } = require('../emails/brevoService');
const svc = require('./emailCampaignService');
const { renderEmail, formUrl } = require('./emailRender');

const TICK_MS = 3000;
const STALE_MINUTES = 10;
let timer = null;
let busy = false;

const perMinute = () => Math.max(1, Math.min(2000, Number(process.env.EMAIL_CAMPAIGN_PER_MINUTE) || 120));
const dailyMax = () => {
    const n = Number(process.env.EMAIL_CAMPAIGN_DAILY_MAX);
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : null;
};
const perTick = () => Math.max(1, Math.round((perMinute() * TICK_MS) / 60000));

/** The sender of every campaign: the verified Brevo sender, under the name chosen in the settings. */
function fromOf(settings) {
    const name = settings.sender_name || brevoService.fromName || 'Learn French with Natives';
    return { email: brevoService.fromEmail, name };
}

/** One person's email: subject, HTML, text and the headers mail programs use to unsubscribe in one click. */
function emailFor(campaign, recipient, links, settings) {
    const u = svc.urls(recipient.token);
    const idxOf = new Map(links.map(l => [l.url, l.idx]));
    const rendered = renderEmail(svc.contentOf(campaign), {
        lang: recipient.lang,
        firstName: svc.firstNameOf(recipient.name),
        source: recipient.source,
        postalAddress: settings.postal_address,
        unsubscribeUrl: u.unsubscribe,
        viewUrl: u.view,
        openUrl: u.open,
        // A link of the campaign goes through its tracking address; any other one is left as it is.
        link: (url) => (idxOf.has(url) ? u.click(idxOf.get(url)) : url),
    });
    const support = settings.reply_to || brevoService.fromEmail;
    return {
        ...rendered,
        headers: {
            'List-Unsubscribe': `<${u.unsubscribe}>, <mailto:${support}?subject=unsubscribe>`,
            'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
        },
    };
}

/** Sends one email; one more try only when Brevo was busy or unreachable. */
async function deliver(mail) {
    try {
        return await brevoService.sendEmail(mail);
    } catch (err) {
        const status = Number(err.status) || 0;
        if (status && status < 500 && status !== 429) throw err;
        await new Promise(r => setTimeout(r, 2500));
        return brevoService.sendEmail(mail);
    }
}

const reasonOf = (err) => String(err?.reason || err?.message || 'Unknown error').replace(/^Brevo email failed:\s*/, '').slice(0, 280);

async function sendTo(db, campaign, recipient, links, settings) {
    const blocked = await db.get('SELECT reason FROM email_suppressions WHERE email = $1', [svc.lower(recipient.email)]);
    if (blocked) {
        await db.run("UPDATE email_campaign_recipients SET status = 'skipped', error = $2 WHERE id = $1", [recipient.id, `Not sent: ${blocked.reason}`]);
        return;
    }
    const mail = emailFor(campaign, recipient, links, settings);
    try {
        const result = await deliver({
            to: recipient.name ? { email: recipient.email, name: recipient.name } : recipient.email,
            from: fromOf(settings),
            replyTo: settings.reply_to || undefined,
            subject: mail.subject,
            html: mail.html,
            text: mail.text,
            headers: mail.headers,
            tags: ['email-campaign', `ec-${campaign.id}`],
            quiet: true,
        });
        await db.run(
            "UPDATE email_campaign_recipients SET status = 'sent', sent_at = now(), message_id = $2, error = NULL WHERE id = $1",
            [recipient.id, result?.messageId ? String(result.messageId).slice(0, 200) : null]);
    } catch (err) {
        await db.run("UPDATE email_campaign_recipients SET status = 'failed', error = $2 WHERE id = $1", [recipient.id, reasonOf(err)]);
    }
}

/** One step of the work: start what is due, send a few emails, close what is done. */
async function tick(db) {
    if (busy) return;
    busy = true;
    try {
        if (!(await svc.ready(db))) return;
        // Scheduled campaigns whose time has come.
        await db.run(`UPDATE email_campaigns SET status = 'sending', started_at = COALESCE(started_at, now()), updated_at = now()
                       WHERE status = 'scheduled' AND scheduled_at <= now()`);
        // Emails caught by a stop of the server: never sent twice by surprise.
        await db.run(`UPDATE email_campaign_recipients SET status = 'failed', error = 'Interrupted while sending (server restart). Retry to send it.'
                       WHERE status = 'sending' AND claimed_at < now() - make_interval(mins => ${STALE_MINUTES})`);

        const campaign = await db.get(`SELECT * FROM email_campaigns WHERE status = 'sending' ORDER BY started_at NULLS LAST, id LIMIT 1`);
        if (!campaign) return;

        let take = perTick();
        const cap = dailyMax();
        if (cap) {
            const today = await db.get(`SELECT COUNT(*)::int AS n FROM email_campaign_recipients WHERE sent_at >= date_trunc('day', now())`);
            take = Math.min(take, cap - (today?.n || 0));
            if (take <= 0) {
                if (campaign.note !== 'daily_limit') await db.run("UPDATE email_campaigns SET note = 'daily_limit' WHERE id = $1", [campaign.id]);
                return;
            }
            if (campaign.note === 'daily_limit') await db.run('UPDATE email_campaigns SET note = NULL WHERE id = $1', [campaign.id]);
        }

        const claimed = await db.all(
            `UPDATE email_campaign_recipients SET status = 'sending', claimed_at = now()
              WHERE id IN (SELECT id FROM email_campaign_recipients WHERE campaign_id = $1 AND status = 'queued' ORDER BY id LIMIT $2)
              RETURNING *`, [campaign.id, take]);
        if (claimed.length) {
            const links = await db.all('SELECT idx, url FROM email_campaign_links WHERE campaign_id = $1 ORDER BY idx', [campaign.id]);
            const settings = await svc.settings(db);
            for (const r of claimed) await sendTo(db, campaign, r, links, settings);
        }
        const left = await db.get(
            "SELECT COUNT(*)::int AS n FROM email_campaign_recipients WHERE campaign_id = $1 AND status IN ('queued', 'sending')", [campaign.id]);
        if (!left?.n) {
            await db.run(`UPDATE email_campaigns SET status = 'sent', finished_at = now(), note = NULL, updated_at = now()
                           WHERE id = $1 AND status = 'sending'`, [campaign.id]);
        }
    } catch (err) {
        console.error('Email campaigns: sending step failed:', err.message);
    } finally {
        busy = false;
    }
}

function start(db) {
    if (timer) return;
    timer = setInterval(() => { tick(db); }, TICK_MS);
    if (timer.unref) timer.unref();
    console.log(`📨 Email campaigns sender ready (${perMinute()} per minute${dailyMax() ? `, ${dailyMax()} per day` : ''})`);
}
function stop() {
    if (timer) clearInterval(timer);
    timer = null;
}

/**
 * A test: the campaign as it will look, to a few addresses, with « [TEST] »
 * before the subject. Links are not tracked and unsubscribing does nothing.
 */
async function sendTest(db, campaign, { to, lang, firstName }) {
    const settings = await svc.settings(db);
    const c = svc.contentOf(campaign);
    // One test per version people will receive (both languages of an « each person's language » campaign).
    let langs;
    if (['fr', 'en', 'both'].includes(lang)) langs = [lang];
    else if (c.language_mode === 'auto') {
        langs = ['fr', 'en'].filter(l => c.content[l].subject && c.content[l].body);
        if (!langs.length) langs = [c.default_lang === 'en' ? 'en' : 'fr'];
    } else langs = [c.language_mode];
    const testUrl = svc.urls('test').unsubscribe;
    const sent = [];
    for (const l of langs) {
        // The form opens in preview: it can be filled, nothing is kept.
        const mail = renderEmail(c, {
            lang: l, firstName, source: 'test', postalAddress: settings.postal_address,
            unsubscribeUrl: testUrl, link: (url) => (url === 'form' ? formUrl(`preview-${c.id}`, l === 'en' ? 'en' : 'fr') : svc.withUtm(url, c)),
        });
        for (const address of to) {
            await deliver({
                to: address, from: fromOf(settings), replyTo: settings.reply_to || undefined,
                subject: `[TEST${l === 'both' ? '' : ` ${l.toUpperCase()}`}] ${mail.subject}`,
                html: mail.html, text: mail.text, tags: ['email-campaign-test'], quiet: true,
            });
            sent.push({ to: address, lang: l });
        }
    }
    return sent;
}

module.exports = { start, stop, tick, sendTest, emailFor, perMinute, dailyMax };
