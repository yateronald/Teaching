// Emails of website accounts (the courses): sign-up code, "you already have
// an account", Google sign-in added, password reset code. English or French,
// in the language the person used on the website.
const { baseHtml, ctaButton, infoStrip, escapeHtml } = require('./base');

const codeBox = (code) => `
  <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="margin: 0 0 22px;">
    <tr>
      <td align="center">
        <div style="font-family: 'SFMono-Regular', Menlo, Consolas, monospace; background:#f1f5f9; border:1px solid #e2e8f0; border-radius:10px; padding:18px 24px; font-size:32px; font-weight:700; color:#0f172a; letter-spacing:8px;">
          ${escapeHtml(String(code).replace(/\D/g, '').slice(0, 6))}
        </div>
      </td>
    </tr>
  </table>`;

const p = (html) => `<p style="margin:0 0 16px; font-size:14.5px; color:#475569; line-height:1.65;">${html}</p>`;
const hello = (name, fr) => `<p style="margin:0 0 14px; font-size:15px; color:#0f172a;">${fr ? 'Bonjour' : 'Hi'} <strong>${escapeHtml(name || (fr ? '' : 'there'))}</strong>,</p>`;

/** The 6-digit code that confirms a new account's email (and a button doing the same). */
function signupCode({ lang, name, code, confirmUrl }) {
    const fr = lang === 'fr';
    const subject = fr ? `${code} : votre code Learn French with Natives` : `${code} is your Learn French with Natives code`;
    const preheader = fr ? 'Confirmez votre adresse pour créer votre compte.' : 'Confirm your email to create your account.';
    const bodyHtml = `
      ${hello(name, fr)}
      ${p(fr ? 'Pour créer votre compte, saisissez ce code sur la page d’inscription :' : 'To create your account, enter this code on the sign-up page:')}
      ${codeBox(code)}
      ${p(fr ? 'Ou confirmez votre adresse en un clic :' : 'Or confirm your email in one click:')}
      ${ctaButton({ label: fr ? 'Confirmer mon adresse' : 'Confirm my email', href: confirmUrl })}
      ${infoStrip({ tone: 'muted', text: fr ? 'Ce code est valable 15 minutes. Si vous n’avez pas demandé de compte, ignorez cet email : rien ne sera créé.' : 'This code is valid for 15 minutes. If you did not ask for an account, ignore this email: nothing will be created.' })}`;
    const text = fr
        ? `Bonjour ${name || ''},\n\nVotre code : ${code}\nOu confirmez votre adresse : ${confirmUrl}\n\nValable 15 minutes. Si vous n’avez pas demandé de compte, ignorez cet email.`
        : `Hi ${name || 'there'},\n\nYour code: ${code}\nOr confirm your email: ${confirmUrl}\n\nValid for 15 minutes. If you did not ask for an account, ignore this email.`;
    return { subject, html: baseHtml({ subject, preheader, title: fr ? 'Confirmez votre adresse' : 'Confirm your email', bodyHtml, lang }), text };
}

/**
 * Someone tried to create an account with an email that already has one. Only
 * the owner of the inbox reads this, so the sign-up page never has to say it.
 * `portalOnly`: the account belongs to a class or a company and the online
 * courses are not enabled on it.
 */
function existingAccount({ lang, name, signInUrl, resetUrl, portalOnly = false }) {
    const fr = lang === 'fr';
    const subject = fr ? 'Vous avez déjà un compte' : 'You already have an account';
    const preheader = fr ? 'Quelqu’un a voulu créer un compte avec votre adresse.' : 'Someone tried to create an account with your email.';
    const body = portalOnly
        ? `${p(fr ? 'Quelqu’un (peut-être vous) a voulu créer un compte avec cette adresse. Elle a déjà un compte chez nous, celui de vos cours. Les cours en ligne ne sont pas encore activés sur ce compte : demandez-les à votre école ou au responsable de votre entreprise.' : 'Someone (maybe you) tried to create an account with this email. It already has an account with us, the one of your classes. Online courses are not enabled on it yet: ask your school or your company manager.')}`
        : `${p(fr ? 'Quelqu’un (peut-être vous) a voulu créer un compte avec cette adresse. Vous avez déjà un compte : connectez-vous, ou choisissez un nouveau mot de passe.' : 'Someone (maybe you) tried to create an account with this email. You already have one: sign in, or choose a new password.')}
           ${ctaButton({ label: fr ? 'Me connecter' : 'Sign in', href: signInUrl })}
           ${p(`<a href="${resetUrl}" style="color:#4338ca;">${fr ? 'J’ai oublié mon mot de passe' : 'I forgot my password'}</a>`)}`;
    const bodyHtml = `${hello(name, fr)}${body}
      ${infoStrip({ tone: 'muted', text: fr ? 'Si ce n’était pas vous, ignorez cet email : votre compte n’a pas changé.' : 'If this was not you, ignore this email: nothing changed on your account.' })}`;
    const text = portalOnly
        ? (fr ? 'Cette adresse a déjà un compte chez nous (vos cours). Les cours en ligne ne sont pas encore activés : demandez-les à votre école ou à votre entreprise.' : 'This email already has an account with us (your classes). Online courses are not enabled on it yet: ask your school or your company.')
        : (fr ? `Vous avez déjà un compte. Connexion : ${signInUrl}\nMot de passe oublié : ${resetUrl}` : `You already have an account. Sign in: ${signInUrl}\nForgot your password: ${resetUrl}`);
    return { subject, html: baseHtml({ subject, preheader, title: subject, bodyHtml, lang }), text };
}

/** Google sign-in was added to an existing account. */
function googleLinked({ lang, name, resetUrl }) {
    const fr = lang === 'fr';
    const subject = fr ? 'Connexion avec Google ajoutée à votre compte' : 'Google sign-in was added to your account';
    const bodyHtml = `
      ${hello(name, fr)}
      ${p(fr ? 'Vous pouvez maintenant vous connecter avec votre compte Google, en plus de votre mot de passe.' : 'You can now sign in with your Google account, as well as with your password.')}
      ${infoStrip({ tone: 'warn', text: fr ? `Ce n’était pas vous ? <a href="${resetUrl}" style="color:#9a3412;">Changez votre mot de passe</a> et répondez à cet email.` : `This was not you? <a href="${resetUrl}" style="color:#9a3412;">Change your password</a> and reply to this email.` })}`;
    const text = fr ? `Connexion avec Google ajoutée. Ce n’était pas vous ? ${resetUrl}` : `Google sign-in was added. Not you? ${resetUrl}`;
    return { subject, html: baseHtml({ subject, preheader: subject, title: subject, bodyHtml, lang }), text };
}

/** The 6-digit code to choose a new password. */
function resetCode({ lang, name, code }) {
    const fr = lang === 'fr';
    const subject = fr ? `${code} : votre code pour un nouveau mot de passe` : `${code} is your password reset code`;
    const bodyHtml = `
      ${hello(name, fr)}
      ${p(fr ? 'Saisissez ce code pour choisir un nouveau mot de passe :' : 'Enter this code to choose a new password:')}
      ${codeBox(code)}
      ${infoStrip({ tone: 'muted', text: fr ? 'Valable 15 minutes. Si vous n’avez rien demandé, ignorez cet email : votre mot de passe ne change pas.' : 'Valid for 15 minutes. If you did not ask for it, ignore this email: your password stays the same.' })}`;
    const text = fr ? `Votre code : ${code} (15 minutes).` : `Your code: ${code} (15 minutes).`;
    return { subject, html: baseHtml({ subject, preheader: subject, title: fr ? 'Nouveau mot de passe' : 'New password', bodyHtml, lang }), text };
}

module.exports = { signupCode, existingAccount, googleLinked, resetCode };
