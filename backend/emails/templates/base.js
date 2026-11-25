/**
 * base.js - Shared editorial email layout for Learn French with Natives.
 *
 * Design philosophy:
 *   - Authentic brand palette matching the website: warm paper #fbf9f5 / #f4f0e8,
 *     deep navy ink #0b1733, French blue #183961, restrained crimson #a83342,
 *     warm stone border #e6e0d4.
 *   - 3px tricolor hairline at the top of the card; hosted PNG logo + wordmark.
 *   - Mobile-first fluid table shell (100% up to 580px, MSO-guarded for Outlook)
 *     so Gmail, Apple Mail, Android, and desktop clients never zoom out or clip.
 *   - Zero em-dashes and zero emoji chrome.
 */

const BRAND = {
    primary: '#183961',
    primaryDark: '#102b4a',
    accentRed: '#a83342',
    text: '#0b1733',
    textBody: '#334155',
    textMuted: '#5d687d',
    textLight: '#7c879c',
    border: '#e6e0d4',
    cardBg: '#fbf9f5',
    surface: '#ffffff',
    pageBg: '#f4f0e8',
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
 * Render a clean key/value row inside a detailCard.
 */
function detailRow({ label, value, isLast = false }) {
    if (value === null || value === undefined || value === '') return '';
    const borderStyle = isLast ? '' : `border-bottom: 1px solid ${BRAND.border};`;
    return `
      <tr>
        <td style="padding: 12px 0; ${borderStyle}">
          <table width="100%" cellspacing="0" cellpadding="0" border="0" role="presentation">
            <tr>
              <td style="font-size: 11px; font-weight: 700; color: ${BRAND.textLight}; letter-spacing: 0.7px; text-transform: uppercase; padding-bottom: 4px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                ${escapeHtml(label)}
              </td>
            </tr>
            <tr>
              <td style="font-size: 14.5px; color: ${BRAND.text}; font-weight: 600; line-height: 1.5; word-break: break-word; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                ${value}
              </td>
            </tr>
          </table>
        </td>
      </tr>`;
}

/**
 * Key/value summary card in warm paper (#fbf9f5) with stone border (#e6e0d4).
 */
function detailCard({ title, rows }) {
    const filtered = rows.filter(r => r.value !== null && r.value !== undefined && r.value !== '');
    if (filtered.length === 0) return '';
    const inner = filtered
        .map((r, i) => detailRow({ label: r.label, value: r.value, isLast: i === filtered.length - 1 }))
        .join('');
    return `
      <table width="100%" cellspacing="0" cellpadding="0" border="0" role="presentation" style="margin: 0 0 22px; border-collapse: separate; border-spacing: 0;">
        <tr>
          <td class="email-card-pad" style="background: ${BRAND.cardBg}; border: 1px solid ${BRAND.border}; border-radius: 10px; padding: 6px 20px;">
            ${title ? `
              <table width="100%" cellspacing="0" cellpadding="0" border="0" role="presentation">
                <tr>
                  <td style="padding: 14px 0 8px; font-size: 11px; font-weight: 700; color: ${BRAND.primary}; letter-spacing: 0.9px; text-transform: uppercase; border-bottom: 1px solid ${BRAND.border}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                    ${escapeHtml(title)}
                  </td>
                </tr>
              </table>` : ''}
            <table width="100%" cellspacing="0" cellpadding="0" border="0" role="presentation">
              ${inner}
            </table>
          </td>
        </tr>
      </table>`;
}

/**
 * Format an availability option `{ date: 'YYYY-MM-DD', end_date?: 'YYYY-MM-DD', start: 'HH:mm', end: 'HH:mm' }`
 * into human-readable date (or range) and 12-hour time strings without timezone shift.
 */
function formatSlotHuman(slot) {
    const dateStr = String(slot?.date || '').trim();
    const endDateStr = String(slot?.end_date || '').trim();
    const startStr = String(slot?.start || '').trim();
    const endStr = String(slot?.end || '').trim();

    const formatIso = (iso, opts) => {
        const dm = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
        if (!dm) return { label: iso, year: null };
        const dt = new Date(Date.UTC(Number(dm[1]), Number(dm[2]) - 1, Number(dm[3]), 12, 0, 0));
        if (Number.isNaN(dt.getTime())) return { label: iso, year: null };
        return {
            year: Number(dm[1]),
            label: new Intl.DateTimeFormat('en-US', { ...opts, timeZone: 'UTC' }).format(dt),
        };
    };

    const hasRange = Boolean(endDateStr && endDateStr !== dateStr);
    let dateLabel;
    if (hasRange) {
        const startYear = Number(dateStr.slice(0, 4));
        const endYear = Number(endDateStr.slice(0, 4));
        const sameYear = startYear === endYear;
        const startFmt = formatIso(dateStr, {
            weekday: 'long',
            month: 'short',
            day: 'numeric',
            ...(sameYear ? {} : { year: 'numeric' }),
        });
        const endFmt = formatIso(endDateStr, {
            weekday: 'long',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
        dateLabel = `${startFmt.label} to ${endFmt.label}`;
    } else {
        dateLabel = formatIso(dateStr, {
            weekday: 'long',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        }).label;
    }

    const fmtHm = (hm) => {
        const tm = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(hm);
        if (!tm) return hm;
        const h24 = Number(tm[1]);
        const min = tm[2];
        const period = h24 >= 12 ? 'PM' : 'AM';
        const h12 = h24 % 12 || 12;
        return `${h12}:${min} ${period}`;
    };

    const baseTime = startStr && endStr ? `${fmtHm(startStr)} - ${fmtHm(endStr)}` : (startStr || '');
    return {
        dateLabel,
        timeLabel: hasRange && baseTime ? `${baseTime} (daily)` : baseTime,
    };
}

/**
 * Crisp mobile-safe table displaying proposed date + time options.
 */
function slotListCard({ title, subtitle, slots }) {
    if (!Array.isArray(slots) || slots.length === 0) return '';
    const rowsHtml = slots.map((slot, idx) => {
        const { dateLabel, timeLabel } = formatSlotHuman(slot);
        const isLast = idx === slots.length - 1;
        return `
          <tr>
            <td style="padding: 13px 0; ${isLast ? '' : `border-bottom: 1px solid ${BRAND.border};`}">
              <table width="100%" cellspacing="0" cellpadding="0" border="0" role="presentation">
                <tr>
                  <td style="font-size: 14.5px; font-weight: 700; color: ${BRAND.text}; line-height: 1.4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                    ${escapeHtml(dateLabel)}
                  </td>
                </tr>
                <tr>
                  <td style="font-size: 13.5px; font-weight: 600; color: ${BRAND.primary}; padding-top: 2px; line-height: 1.45; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                    ${escapeHtml(timeLabel)}
                  </td>
                </tr>
              </table>
            </td>
          </tr>`;
    }).join('');

    return `
      <table width="100%" cellspacing="0" cellpadding="0" border="0" role="presentation" style="margin: 0 0 22px; border-collapse: separate; border-spacing: 0;">
        <tr>
          <td class="email-card-pad" style="background: ${BRAND.cardBg}; border: 1px solid ${BRAND.border}; border-radius: 10px; padding: 6px 20px;">
            ${(title || subtitle) ? `
              <table width="100%" cellspacing="0" cellpadding="0" border="0" role="presentation">
                <tr>
                  <td style="padding: 14px 0 10px; border-bottom: 1px solid ${BRAND.border};">
                    ${title ? `<div style="font-size: 11px; font-weight: 700; color: ${BRAND.primary}; letter-spacing: 0.9px; text-transform: uppercase; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">${escapeHtml(title)}</div>` : ''}
                    ${subtitle ? `<div style="font-size: 12.5px; color: ${BRAND.textMuted}; margin-top: 4px; line-height: 1.45; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">${escapeHtml(subtitle)}</div>` : ''}
                  </td>
                </tr>
              </table>` : ''}
            <table width="100%" cellspacing="0" cellpadding="0" border="0" role="presentation">
              ${rowsHtml}
            </table>
          </td>
        </tr>
      </table>`;
}

/**
 * Primary CTA button in French blue (#183961), full-width on mobile via .email-cta.
 */
function ctaButton({ label, href, color = BRAND.primary }) {
    return `
      <table width="100%" cellspacing="0" cellpadding="0" border="0" role="presentation" style="margin: 6px 0 22px;">
        <tr>
          <td align="center">
            <a href="${href}" class="email-cta"
               style="display: inline-block; background: ${color}; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 14.5px; line-height: 1.25; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
              ${escapeHtml(label)}
            </a>
          </td>
        </tr>
      </table>`;
}

/**
 * Understated editorial notice box with left border accent.
 */
function infoStrip({ tone = 'info', text }) {
    const palette = {
        info:    { bg: '#f4f7fb', border: BRAND.border, accent: BRAND.primary, fg: BRAND.textBody },
        warn:    { bg: '#fbf9f5', border: BRAND.border, accent: BRAND.accentRed, fg: BRAND.textBody },
        success: { bg: '#f2f9f6', border: '#cde7da', accent: '#166534', fg: '#1e3a2f' },
        muted:   { bg: BRAND.cardBg, border: BRAND.border, accent: BRAND.textMuted, fg: BRAND.textBody },
    }[tone] || { bg: '#f4f7fb', border: BRAND.border, accent: BRAND.primary, fg: BRAND.textBody };
    return `
      <table width="100%" cellspacing="0" cellpadding="0" border="0" role="presentation" style="margin: 0 0 22px; border-collapse: separate; border-spacing: 0;">
        <tr>
          <td style="background: ${palette.bg}; border: 1px solid ${palette.border}; border-left: 3px solid ${palette.accent}; border-radius: 8px; padding: 14px 16px;">
            <span style="color: ${palette.fg}; font-size: 13.5px; line-height: 1.55; word-break: break-word; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">${text}</span>
          </td>
        </tr>
      </table>`;
}

/**
 * Format a UTC timestamp in the recipient's timezone with an unambiguous GMT offset.
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
    let abbr = safeTz;
    try {
        const parts = new Intl.DateTimeFormat('en-US', { timeZone: safeTz, timeZoneName: 'shortOffset' }).formatToParts(d);
        const tzPart = parts.find(p => p.type === 'timeZoneName');
        if (tzPart) abbr = tzPart.value;
        if (abbr === 'GMT') abbr = 'GMT+0';
    } catch {}
    return `${datePart} (${abbr})`;
}

/**
 * Master mobile-responsive editorial HTML email wrapper.
 */
function baseHtml({ subject, preheader, eyebrow, title, bodyHtml, logo = null, logoAlt = null, lang = 'en' }) {
    const logoUrl = logo || getLogoUrl();
    const supportEmail = getSupportEmail();
    const year = new Date().getFullYear();
    const fr = lang === 'fr';
    const siteUrl = (process.env.FRONTEND_URL || 'https://learnfrenchwithnatives.com').replace(/\/$/, '');

    return `<!DOCTYPE html>
<html lang="${fr ? 'fr' : 'en'}" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="x-apple-disable-message-reformatting" />
  <title>${escapeHtml(subject)}</title>
  <style>
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    body { margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: ${BRAND.pageBg}; }
    @media only screen and (max-width: 600px) {
      .email-bg-td { padding: 12px 10px !important; }
      .email-container { width: 100% !important; max-width: 100% !important; border-radius: 10px !important; }
      .email-header { padding: 22px 20px 0 !important; }
      .email-body { padding: 20px 20px 26px !important; }
      .email-footer { padding: 18px 20px 22px !important; }
      .email-h1 { font-size: 20px !important; line-height: 1.3 !important; }
      .email-card-pad { padding: 4px 16px !important; }
      .email-cta { display: block !important; width: 100% !important; box-sizing: border-box !important; text-align: center !important; padding: 14px 18px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: ${BRAND.pageBg}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: ${BRAND.text};">
  ${preheader ? `<div style="display: none; max-height: 0; overflow: hidden; font-size: 1px; line-height: 1px; color: ${BRAND.pageBg}; opacity: 0;">${escapeHtml(preheader)}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>` : ''}

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: ${BRAND.pageBg};">
    <tr>
      <td align="center" class="email-bg-td" style="padding: 28px 16px;">
        <!--[if (gte mso 9)|(IE)]>
        <table align="center" border="0" cellspacing="0" cellpadding="0" width="580">
        <tr>
        <td align="center" valign="top" width="580">
        <![endif]-->
        <table width="100%" class="email-container" cellspacing="0" cellpadding="0" border="0" role="presentation"
          style="width: 100%; max-width: 580px; margin: 0 auto; background-color: ${BRAND.surface}; border-radius: 12px; overflow: hidden; border: 1px solid ${BRAND.border};">

          <!-- French tricolor top hairline -->
          <tr>
            <td style="padding: 0; line-height: 0; font-size: 0;">
              <table width="100%" cellspacing="0" cellpadding="0" border="0" role="presentation">
                <tr>
                  <td width="34%" height="3" style="background-color: ${BRAND.primary}; font-size: 0; line-height: 0;">&nbsp;</td>
                  <td width="33%" height="3" style="background-color: #ffffff; font-size: 0; line-height: 0;">&nbsp;</td>
                  <td width="33%" height="3" style="background-color: ${BRAND.accentRed}; font-size: 0; line-height: 0;">&nbsp;</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Header -->
          <tr>
            <td class="email-header" style="padding: 28px 36px 0; text-align: left;">
              <table cellspacing="0" cellpadding="0" border="0" role="presentation" style="margin-bottom: 22px;">
                <tr>
                  <td style="vertical-align: middle; padding-right: 11px;">
                    <a href="${siteUrl}" target="_blank" style="text-decoration: none;">
                      <img src="${logoUrl}" alt="${escapeHtml(logoAlt || 'Learn French with Natives')}" width="36" height="36" style="display: block; width: 36px; height: 36px; border-radius: 50%;" />
                    </a>
                  </td>
                  <td style="vertical-align: middle;">
                    <a href="${siteUrl}" target="_blank" style="text-decoration: none; color: ${BRAND.text};">
                      <div style="font-size: 15px; font-weight: 800; color: ${BRAND.text}; letter-spacing: -0.25px; line-height: 1.15; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                        ${escapeHtml(logoAlt || 'Learn French')}
                      </div>
                      ${!logoAlt ? `<div style="font-size: 11.5px; font-weight: 600; color: ${BRAND.accentRed}; line-height: 1.2; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">with Natives</div>` : ''}
                    </a>
                  </td>
                </tr>
              </table>
              ${eyebrow ? `<div style="font-size: 11px; font-weight: 700; color: ${BRAND.primary}; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 8px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">${escapeHtml(eyebrow)}</div>` : ''}
              <h1 class="email-h1" style="margin: 0; font-size: 22px; font-weight: 800; color: ${BRAND.text}; letter-spacing: -0.4px; line-height: 1.3; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                ${escapeHtml(title)}
              </h1>
              <div style="height: 1px; background-color: ${BRAND.border}; margin: 20px 0 0;"></div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td class="email-body" style="padding: 24px 36px 32px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
              ${bodyHtml}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td class="email-footer" style="padding: 20px 36px 24px; background-color: ${BRAND.cardBg}; border-top: 1px solid ${BRAND.border};">
              <table width="100%" cellspacing="0" cellpadding="0" border="0" role="presentation">
                <tr>
                  <td align="left" style="font-size: 12.5px; color: ${BRAND.textMuted}; line-height: 1.6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                    ${fr ? 'Besoin d\'aide ? Répondez directement à cet email ou écrivez à' : 'Questions or need to reschedule? Reply to this email or write to'}
                    <a href="mailto:${escapeHtml(supportEmail)}" style="color: ${BRAND.primary}; text-decoration: none; font-weight: 600;">${escapeHtml(supportEmail)}</a>.
                  </td>
                </tr>
                <tr>
                  <td align="left" style="font-size: 11px; color: ${BRAND.textLight}; padding-top: 8px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                    © ${year} Learn French with Natives. ${fr ? 'Tous droits réservés.' : 'All rights reserved.'}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        <!--[if (gte mso 9)|(IE)]>
        </td>
        </tr>
        </table>
        <![endif]-->
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
    slotListCard,
    formatSlotHuman,
    ctaButton,
    infoStrip,
    escapeHtml,
    formatRecipientTime,
    getLogoUrl,
    getSupportEmail,
    BRAND,
};
