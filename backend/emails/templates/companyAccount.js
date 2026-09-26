const { baseHtml, detailCard, infoStrip, ctaButton, escapeHtml } = require('./base');

/**
 * Emails of a company's space, in the language the company chose (fr or en):
 *  - the invitation of a new manager or learner, with a temporary password;
 *  - the notice that the company's access ends soon.
 */

const WORDS = {
    fr: {
        managerSubject: (org) => `${org} — votre espace entreprise`,
        learnerSubject: (org) => `${org} vous ouvre la préparation à l’examen`,
        managerTitle: 'Votre espace entreprise est prêt',
        learnerTitle: 'Votre préparation à l’examen est prête',
        preheader: 'Connectez-vous avec le mot de passe provisoire indiqué.',
        eyebrow: 'COMPTE',
        hi: (name) => `Bonjour <strong>${name}</strong>,`,
        managerIntro: (org) => `Un espace a été ouvert pour <strong>${org}</strong> sur Learn French with Natives. Vous pourrez y ajouter vos apprenants, leur attribuer des examens blancs, leur distribuer des crédits et suivre leurs résultats.`,
        learnerIntro: (org) => `<strong>${org}</strong> vous a ouvert un espace de préparation au TCF : examens blancs des quatre compétences, corrections et suivi de votre niveau.`,
        email: 'Email de connexion',
        until: 'Accès jusqu’au',
        password: 'Mot de passe provisoire',
        signIn: 'Se connecter',
        change: 'Pour votre sécurité, vous choisirez un nouveau mot de passe dès votre première connexion.',
        expirySubject: (org, days) => `${org} — votre accès se termine dans ${days} jour${days > 1 ? 's' : ''}`,
        expiryTitle: 'Votre accès se termine bientôt',
        expiryIntro: (org, date) => `L’accès de <strong>${org}</strong> se termine le <strong>${date}</strong>. Après cette date, vos apprenants pourront toujours se connecter et voir leurs résultats, mais plus démarrer d’examen, et vous ne pourrez plus attribuer d’examens ni distribuer de crédits.`,
        expiryAction: 'Pour prolonger l’accès ou ajouter des crédits, contactez l’administrateur en répondant à cet email.',
        open: 'Ouvrir mon espace',
    },
    en: {
        managerSubject: (org) => `${org} — your company space`,
        learnerSubject: (org) => `${org} opened your exam preparation`,
        managerTitle: 'Your company space is ready',
        learnerTitle: 'Your exam preparation is ready',
        preheader: 'Sign in with the temporary password inside.',
        eyebrow: 'ACCOUNT',
        hi: (name) => `Hi <strong>${name}</strong>,`,
        managerIntro: (org) => `A space has been opened for <strong>${org}</strong> on Learn French with Natives. There you add your learners, assign them practice exams, hand out credits and follow their results.`,
        learnerIntro: (org) => `<strong>${org}</strong> opened a TCF preparation space for you: practice exams in all four skills, corrections and a view of your level.`,
        email: 'Sign-in email',
        until: 'Access until',
        password: 'Temporary password',
        signIn: 'Sign in',
        change: 'For your security, you will choose a new password right after you sign in for the first time.',
        expirySubject: (org, days) => `${org} — your access ends in ${days} day${days > 1 ? 's' : ''}`,
        expiryTitle: 'Your access ends soon',
        expiryIntro: (org, date) => `Access for <strong>${org}</strong> ends on <strong>${date}</strong>. After that date your learners can still sign in and see their results, but cannot start an exam, and you can no longer assign exams or hand out credits.`,
        expiryAction: 'To extend the access or add credits, contact the administrator by replying to this email.',
        open: 'Open my space',
    },
};

const langOf = (lang) => (lang === 'en' ? 'en' : 'fr');
/** A sentence for the plain-text part: without its bold markers (names stay as typed). */
const plain = (html) => html.replace(/<\/?strong>/g, '');
const dateIn = (lang, value) => new Date(value).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-GB', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
});

/**
 * @param {{ lang: 'fr'|'en', kind: 'manager'|'learner', name: string, email: string,
 *   tempPassword: string, orgName: string, accessEndsAt: string|Date, loginUrl: string, logoUrl?: string|null }} args
 */
function buildCompanyInviteTemplate({ lang, kind, name, email, tempPassword, orgName, accessEndsAt, loginUrl, logoUrl = null }) {
    const l = langOf(lang);
    const w = WORDS[l];
    const org = escapeHtml(orgName);
    const subject = kind === 'manager' ? w.managerSubject(orgName) : w.learnerSubject(orgName);
    const title = kind === 'manager' ? w.managerTitle : w.learnerTitle;
    const intro = kind === 'manager' ? w.managerIntro(org) : w.learnerIntro(org);

    const bodyHtml = `
      <p style="margin:0 0 14px; font-size:15px; color:#0f172a;">${w.hi(escapeHtml(name || email))}</p>
      <p style="margin:0 0 22px; font-size:14.5px; color:#475569; line-height:1.65;">${intro}</p>
      ${detailCard({ rows: [
          { label: w.email, value: escapeHtml(email) },
          { label: w.until, value: escapeHtml(dateIn(l, accessEndsAt)) },
      ] })}
      <div style="margin: 0 0 8px; font-size: 11px; font-weight: 700; color: #4338ca; letter-spacing: 0.6px; text-transform: uppercase;">${w.password}</div>
      <div style="font-family: 'SFMono-Regular', Menlo, Consolas, monospace; background:#f1f5f9; border:1px solid #e2e8f0; border-radius:8px; padding:14px 16px; font-size:16px; font-weight:700; color:#0f172a; letter-spacing:1px; margin-bottom: 22px; word-break: break-all;">
        ${escapeHtml(tempPassword)}
      </div>
      ${ctaButton({ label: w.signIn, href: loginUrl })}
      ${infoStrip({ tone: 'warn', text: w.change })}
    `;

    const html = baseHtml({
        subject, preheader: w.preheader, eyebrow: w.eyebrow, title, bodyHtml,
        logo: logoUrl, logoAlt: orgName, lang: l,
    });
    const text = [
        `${l === 'fr' ? 'Bonjour' : 'Hi'} ${name || email},`,
        '',
        plain(kind === 'manager' ? w.managerIntro(orgName) : w.learnerIntro(orgName)),
        '',
        `${w.email}: ${email}`,
        `${w.until}: ${dateIn(l, accessEndsAt)}`,
        `${w.password}: ${tempPassword}`,
        '',
        `${w.signIn}: ${loginUrl}`,
        '',
        w.change,
    ].join('\n');
    return { subject, html, text };
}

/**
 * @param {{ lang: 'fr'|'en', name: string, orgName: string, accessEndsAt: string|Date,
 *   daysLeft: number, appUrl: string, logoUrl?: string|null }} args
 */
function buildCompanyExpiryTemplate({ lang, name, orgName, accessEndsAt, daysLeft, appUrl, logoUrl = null }) {
    const l = langOf(lang);
    const w = WORDS[l];
    const subject = w.expirySubject(orgName, daysLeft);
    const intro = w.expiryIntro(escapeHtml(orgName), escapeHtml(dateIn(l, accessEndsAt)));
    const bodyHtml = `
      <p style="margin:0 0 14px; font-size:15px; color:#0f172a;">${w.hi(escapeHtml(name))}</p>
      <p style="margin:0 0 22px; font-size:14.5px; color:#475569; line-height:1.65;">${intro}</p>
      ${infoStrip({ tone: 'warn', text: w.expiryAction })}
      ${ctaButton({ label: w.open, href: appUrl })}
    `;
    const html = baseHtml({
        subject, preheader: subject, eyebrow: w.eyebrow, title: w.expiryTitle, bodyHtml,
        logo: logoUrl, logoAlt: orgName, lang: l,
    });
    const text = [
        `${l === 'fr' ? 'Bonjour' : 'Hi'} ${name},`, '', plain(w.expiryIntro(orgName, dateIn(l, accessEndsAt))), '', w.expiryAction, '', appUrl,
    ].join('\n');
    return { subject, html, text };
}

module.exports = { buildCompanyInviteTemplate, buildCompanyExpiryTemplate };
