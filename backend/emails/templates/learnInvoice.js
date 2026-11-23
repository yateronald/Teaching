// Payment receipt & attached official USD PDF invoice email for website Premium.
const { baseHtml, detailCard, ctaButton, infoStrip, escapeHtml } = require('./base');

/**
 * Builds the payment confirmation + attached PDF invoice email in English or French.
 */
function paymentInvoice({
    lang,
    name,
    invoiceNumber,
    offerName,
    amountLabel,
    chargedLabel,
    paidDate,
    validUntil,
    reference,
    coursesUrl,
    subscriptionUrl,
}) {
    const fr = lang === 'fr';
    const subject = fr
        ? `Paiement confirmé — Facture ${invoiceNumber}`
        : `Payment confirmed — Invoice ${invoiceNumber}`;
    const preheader = fr
        ? `Votre accès Premium (${offerName}) est actif. Votre facture PDF en USD est jointe.`
        : `Your Premium access (${offerName}) is now active. Your official USD PDF invoice is attached.`;
    const title = fr ? 'Paiement confirmé' : 'Payment confirmed';
    const eyebrow = fr ? 'FACTURE ET ACCÈS PREMIUM' : 'INVOICE & PREMIUM ACCESS';

    const rows = [
        { label: fr ? 'Numéro de facture' : 'Invoice number', value: `<span style="font-family: 'SFMono-Regular', Menlo, Consolas, monospace;">${escapeHtml(invoiceNumber)}</span>` },
        { label: fr ? 'Formule' : 'Plan', value: escapeHtml(offerName) },
        { label: fr ? 'Montant facturé (USD)' : 'Amount billed (USD)', value: escapeHtml(amountLabel) },
        ...(chargedLabel ? [{ label: fr ? 'Règlement Paystack' : 'Paystack settlement', value: escapeHtml(chargedLabel) }] : []),
        { label: fr ? 'Date de paiement' : 'Payment date', value: escapeHtml(paidDate) },
        ...(validUntil ? [{ label: fr ? 'Accès Premium actif jusqu’au' : 'Premium valid until', value: escapeHtml(validUntil) }] : []),
        { label: fr ? 'Référence de transaction' : 'Transaction reference', value: `<span style="font-family: 'SFMono-Regular', Menlo, Consolas, monospace; font-size:12.5px;">${escapeHtml(reference)}</span>` },
    ];

    const bodyHtml = `
      <p style="margin:0 0 14px; font-size:15px; color:#0f172a;">
        ${fr ? 'Bonjour' : 'Hi'} <strong>${escapeHtml(name || (fr ? '' : 'there'))}</strong>,
      </p>
      <p style="margin:0 0 20px; font-size:14.5px; color:#475569; line-height:1.65;">
        ${fr
            ? 'Merci pour votre paiement ! Votre accès Premium Learn French with Natives est désormais actif sur l’ensemble de nos parcours, ateliers d’écoute, dictées et préparations aux examens.'
            : 'Thank you for your payment! Your Learn French with Natives Premium membership is now active across every study path, audio lab, studio dictation and exam prep track.'}
      </p>
      ${detailCard({ title: fr ? 'Récapitulatif de la facture' : 'Invoice summary', rows })}
      ${infoStrip({
          tone: 'success',
          text: fr
              ? `Votre facture officielle en PDF (<strong>Invoice-${escapeHtml(invoiceNumber)}.pdf</strong>) est jointe à cet email et reste téléchargeable à tout moment depuis votre page Abonnement.`
              : `Your official PDF invoice (<strong>Invoice-${escapeHtml(invoiceNumber)}.pdf</strong>) is attached to this email and remains available anytime on your Subscription page.`,
      })}
      ${ctaButton({ label: fr ? 'Accéder à mes cours' : 'Start learning now', href: coursesUrl })}
      <p style="margin:0; font-size:13px; color:#64748b; text-align:center;">
        <a href="${escapeHtml(subscriptionUrl)}" style="color:#4338ca; text-decoration:underline;">
          ${fr ? 'Voir mon abonnement et télécharger mes factures' : 'View subscription & download invoices'}
        </a>
      </p>`;

    const text = fr
        ? `Bonjour ${name || ''},\n\nMerci pour votre paiement ! Votre accès Premium (${offerName}) est maintenant actif.\n\nFacture : ${invoiceNumber}\nMontant : ${amountLabel}${chargedLabel ? `\nRèglement Paystack : ${chargedLabel}` : ''}\nDate : ${paidDate}${validUntil ? `\nValide jusqu’au : ${validUntil}` : ''}\nRéférence : ${reference}\n\nVotre facture PDF est jointe à cet email.\nCours : ${coursesUrl}\nAbonnement : ${subscriptionUrl}`
        : `Hi ${name || 'there'},\n\nThank you for your payment! Your Premium access (${offerName}) is now active.\n\nInvoice: ${invoiceNumber}\nAmount: ${amountLabel}${chargedLabel ? `\nPaystack settlement: ${chargedLabel}` : ''}\nDate: ${paidDate}${validUntil ? `\nValid until: ${validUntil}` : ''}\nReference: ${reference}\n\nYour official PDF invoice is attached to this email.\nCourses: ${coursesUrl}\nSubscription: ${subscriptionUrl}`;

    return {
        subject,
        html: baseHtml({ subject, preheader, eyebrow, title, bodyHtml, lang }),
        text,
    };
}

module.exports = { paymentInvoice };
