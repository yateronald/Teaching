/**
 * base.js — Shared email layout (professional, minimal).
 *
 * Design philosophy:
 *   - One brand color: indigo #4338ca (no gradients, no rainbow).
 *   - Hosted logo via <img src="…/assets/Logo.png"> — NO inline attachments.
 *   - System fonts; clear typography hierarchy; light grey cards.
 *   - No emoji icons in the layout chrome (templates may use them sparingly
 *     in body copy where appropriate, but avoid them in headers/cards).
 *   - Mobile-friendly with @media query and stacked tables.
 *   - Bullet-proof for major mail clients (Gmail, Outlook, Apple Mail).
 */

const BRAND = {
    primary: '#4338ca',
    primaryDark: '#3730a3',
    text: '#0f172a',
    textMuted: '#64748b',
    textLight: '#94a3b8',
    border: '#e2e8f0',
    cardBg: '#f8fafc',
    surface: '#ffffff',
    pageBg: '#f5f6fa',
};

function getLogoUrl() {
    if (process.env.EMAIL_LOGO_URL) return process.env.EMAIL_LOGO_URL;
    const base = (process.env.FRONTEND_URL || 'https://learnfrenchwithnatives.com').replace(/\/$/, '');
    return `${base}/assets/Logo.png`;
}

function getSupportEmail() {
    const raw = process.env.EMAIL_FROM || 'support@learnfrenchwithnatives.com';
    const m = /<([^>]+)>/.exec(raw);
    return m ? m[1] : raw;
}

/**
 * Build a row for a key/value detail card — used by every template that
 * needs to show "fact lists" (date, time, host, etc.) without emoji icons.
 *
 * @param {{ label: string, value: string|number|null|undefined, isLast?: boolean }} opts
 */
function detailRow({ label, value, isLast = false }) {
    if (value === null || value === undefined || value === '') return '';
    const borderStyle = isLast ? '' : `border-bottom: 1px solid ${BRAND.border};`;
    return `
      <tr>
        <td style="padding: 14px 0; ${borderStyle}">
          <table width="100%" cellspacing="0" cellpadding="0" role="presentation">
            <tr>
              <td style="font-size: 11px; font-weight: 600; color: ${BRAND.textLight}; letter-spacing: 0.6px; text-transform: uppercase; padding-bottom: 4px;">
                ${escapeHtml(label)}
              </td>
            </tr>
            <tr>
              <td style="font-size: 14.5px; color: ${BRAND.text}; font-weight: 600; line-height: 1.5;">
                ${value}
              </td>
            </tr>
          </table>
        </td>
      </tr>`;
}

/**
 * Build a key/value card from an array of { label, value } objects.
 * Empty values are skipped so we never show "undefined" or empty rows.
 */
function detailCard({ title, rows }) {
    const filtered = rows.filter(r => r.value !== null && r.value !== undefined && r.value !== '');
    if (filtered.length === 0) return '';
    const inner = filtered
        .map((r, i) => detailRow({ label: r.label, value: r.value, isLast: i === filtered.length - 1 }))
        .join('');
    return `
      <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="margin: 0 0 24px;">
        <tr>
          <td style="background: ${BRAND.cardBg}; border: 1px solid ${BRAND.border}; border-radius: 12px; padding: 4px 22px;">
            ${title ? `
              <table width="100%" cellspacing="0" cellpadding="0" role="presentation">
                <tr>
                  <td style="padding: 16px 0 4px; font-size: 11px; font-weight: 700; color: ${BRAND.primary}; letter-spacing: 0.8px; text-transform: uppercase; border-bottom: 1px solid ${BRAND.border};">
                    ${escapeHtml(title)}
                  </td>
                </tr>
              </table>` : ''}
            <table width="100%" cellspacing="0" cellpadding="0" role="presentation">
              ${inner}
            </table>
          </td>
        </tr>
      </table>`;
}

/**
 * Build a primary CTA button.
 */
function ctaButton({ label, href, color = BRAND.primary }) {
    return `
      <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="margin: 8px 0 24px;">
        <tr>
          <td align="center">
            <a href="${href}"
               style="display: inline-block; background: ${color}; color: #ffffff; text-decoration: none; padding: 13px 32px; border-radius: 10px; font-weight: 600; font-size: 14px; letter-spacing: 0.2px; box-shadow: 0 2px 6px rgba(67, 56, 202, 0.18);">
              ${escapeHtml(label)}
            </a>
          </td>
        </tr>
      </table>`;
}

/**
 * Build a small alert/info strip — minimal, no emoji.
 */
function infoStrip({ tone = 'info', text }) {
    const palette = {
        info:    { bg: '#eef2ff', border: '#c7d2fe', fg: '#3730a3' },
        warn:    { bg: '#fff7ed', border: '#fed7aa', fg: '#9a3412' },
        success: { bg: '#ecfdf5', border: '#a7f3d0', fg: '#065f46' },
        muted:   { bg: '#f8fafc', border: '#e2e8f0', fg: '#475569' },
    }[tone] || { bg: '#eef2ff', border: '#c7d2fe', fg: '#3730a3' };
    return `
      <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="margin: 0 0 24px;">
        <tr>
          <td style="background: ${palette.bg}; border: 1px solid ${palette.border}; border-radius: 10px; padding: 14px 18px;">
            <span style="color: ${palette.fg}; font-size: 13.5px; line-height: 1.55;">${text}</span>
          </td>
        </tr>
      </table>`;
}

function escapeHtml(s) {
    if (s === null || s === undefined) return '';
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

/**
 * Format a UTC timestamp in the recipient's timezone, with a clear timezone
 * label (e.g. "GMT-4") appended so the time is unambiguous in inboxes that
 * don't render JavaScript. Falls back to UTC if no zone is provided.
 *
 * @param {string|Date|number} when  UTC moment (TIMESTAMPTZ ISO string is fine)
 * @param {string} tz                IANA zone identifier
 * @param {object} [opts]            Intl.DateTimeFormat options to override
 */
function formatRecipientTime(when, tz, opts = {}) {
    if (when === null || when === undefined || when === '') return '';
    const d = when instanceof Date ? when : new Date(when);
    if (isNaN(d.getTime())) return String(when);
    const safeTz = tz && (() => {
        try { new Intl.DateTimeFormat('en-US', { timeZone: tz }).format(); return true; } catch { return false; }
    })() ? tz : 'UTC';
    const formatOpts = {
        weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
        hour: 'numeric', minute: '2-digit', hour12: true, timeZone: safeTz,
        ...opts,
    };
    const datePart = new Intl.DateTimeFormat('en-US', formatOpts).format(d);
    if (formatOpts.timeZoneName) return datePart;
    // Get short offset (e.g. "GMT-4"). Some zero-offset zones render just
    // "GMT" — normalize those to "GMT+0" so every email reliably shows
    // an offset (no ambiguity for recipients comparing time zones).
    let abbr = safeTz;
    try {
        const parts = new Intl.DateTimeFormat('en-US', { timeZone: safeTz, timeZoneName: 'shortOffset' }).formatToParts(d);
        const tzPart = parts.find(p => p.type === 'timeZoneName');
        if (tzPart) abbr = tzPart.value;
        if (abbr === 'GMT') abbr = 'GMT+0';
    } catch {}
    return `${datePart} · ${abbr}`;
}

/**
 * Master shell: renders header (logo + title), body, and footer.
 *
 * @param {{
 *   subject: string,
 *   preheader?: string,         // hidden preview text
 *   eyebrow?: string,           // small caps label above title (e.g. "ACCOUNT")
 *   title: string,              // main H1 ("Welcome to the platform")
 *   bodyHtml: string,           // main body content
 * }} opts
 */
function baseHtml({ subject, preheader, eyebrow, title, bodyHtml }) {
    const logoUrl = getLogoUrl();
    const supportEmail = getSupportEmail();
    const year = new Date().getFullYear();

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>${escapeHtml(subject)}</title>
  <style>
    @media (max-width: 600px) {
      .email-container { width: 100% !important; padding: 16px !important; border-radius: 0 !important; }
      .email-body { padding: 28px 22px !important; }
      .email-header { padding: 26px 22px !important; }
    }
    /* Dark mode hints (Apple Mail / iOS) */
    @media (prefers-color-scheme: dark) {
      .email-bg { background: #0f172a !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background: ${BRAND.pageBg}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: ${BRAND.text}; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;">
  <!-- Hidden preheader -->
  ${preheader ? `<div style="display: none; max-height: 0; overflow: hidden; font-size: 1px; line-height: 1px; color: ${BRAND.pageBg}; opacity: 0;">${escapeHtml(preheader)}</div>` : ''}

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" class="email-bg" style="background: ${BRAND.pageBg}; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table width="600" class="email-container" cellspacing="0" cellpadding="0" role="presentation"
          style="width: 600px; max-width: 600px; background: ${BRAND.surface}; border-radius: 14px; overflow: hidden; box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04), 0 8px 24px rgba(15, 23, 42, 0.06); border: 1px solid ${BRAND.border};">

          <!-- Header: white background with logo and title -->
          <tr>
            <td class="email-header" style="padding: 32px 40px 0; text-align: left;">
              <a href="${(process.env.FRONTEND_URL || 'https://learnfrenchwithnatives.com').replace(/\/$/, '')}" target="_blank" style="text-decoration: none;">
                <img src="${logoUrl}" alt="Learn French with Natives" height="40" style="display: block; height: 40px; width: auto; margin-bottom: 24px; border: 0;" />
              </a>
              ${eyebrow ? `<div style="font-size: 11px; font-weight: 700; color: ${BRAND.primary}; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 8px;">${escapeHtml(eyebrow)}</div>` : ''}
              <h1 style="margin: 0 0 8px; font-size: 24px; font-weight: 700; color: ${BRAND.text}; letter-spacing: -0.4px; line-height: 1.3;">
                ${escapeHtml(title)}
              </h1>
              <div style="height: 1px; background: ${BRAND.border}; margin: 24px 0 0;"></div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td class="email-body" style="padding: 28px 40px 36px;">
              ${bodyHtml}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 22px 40px 26px; background: ${BRAND.cardBg}; border-top: 1px solid ${BRAND.border};">
              <table width="100%" cellspacing="0" cellpadding="0" role="presentation">
                <tr>
                  <td align="left" style="font-size: 12px; color: ${BRAND.textMuted}; line-height: 1.6;">
                    Need help? Reply to this email or write to
                    <a href="mailto:${supportEmail}" style="color: ${BRAND.primary}; text-decoration: none; font-weight: 600;">${supportEmail}</a>
                  </td>
                </tr>
                <tr>
                  <td align="left" style="font-size: 11px; color: ${BRAND.textLight}; padding-top: 10px;">
                    © ${year} Learn French with Natives. All rights reserved.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

module.exports = {
    baseHtml,
    detailCard,
    detailRow,
    ctaButton,
    infoStrip,
    escapeHtml,
    formatRecipientTime,
    getLogoUrl,
    getSupportEmail,
    BRAND,
};
