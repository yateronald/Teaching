/**
 * Refreshes the list of throw-away email domains refused at website sign-up.
 *
 *   node scripts/update-disposable-domains.js
 *
 * Downloads the community-maintained list (disposable-email-domains project)
 * into data/disposable-domains.community.txt. Run it weekly from cron on the
 * server; the API reads the new list within a day (or at its next restart).
 * A failed or suspicious download changes nothing: the previous list stays.
 * Your own additions belong in data/disposable-domains.local.txt.
 */
const fs = require('fs');
const path = require('path');

const SOURCE = process.env.DISPOSABLE_LIST_URL
    || 'https://raw.githubusercontent.com/disposable-email-domains/disposable-email-domains/main/disposable_email_blocklist.conf';
const OUT = path.join(__dirname, '..', 'data', 'disposable-domains.community.txt');
// Domains that must never be refused, whatever a list says.
const NEVER = new Set(['gmail.com', 'googlemail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com', 'live.com', 'proton.me', 'protonmail.com']);

async function main() {
    const res = await fetch(SOURCE, { signal: AbortSignal.timeout(30000) });
    if (!res.ok) throw new Error(`download failed: HTTP ${res.status}`);
    const text = await res.text();
    const domains = [...new Set(text.split(/\r?\n/).map(l => l.trim().toLowerCase())
        .filter(l => l && !l.startsWith('#') && /^[a-z0-9.-]+\.[a-z]{2,}$/.test(l) && !NEVER.has(l)))].sort();
    // A list that suddenly shrinks or explodes is more likely a broken download than news.
    if (domains.length < 1000 || domains.length > 500000) throw new Error(`unexpected list size (${domains.length}); keeping the previous list`);
    const tmp = `${OUT}.tmp`;
    fs.writeFileSync(tmp, `# Downloaded ${new Date().toISOString()} from ${SOURCE}\n${domains.join('\n')}\n`);
    fs.renameSync(tmp, OUT);
    console.log(`✅ ${domains.length} throw-away domains saved to ${path.relative(process.cwd(), OUT)}`);
}

main().catch(err => {
    console.error(`❌ ${err.message}`);
    process.exit(1);
});
