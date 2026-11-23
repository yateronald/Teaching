/**
 * Generates branded, print-ready A4 PDF invoices in USD (or the offer's invoice
 * currency) for website Premium purchases using PDFKit.
 */
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const BRAND_NAVY = '#0b1733';
const BRAND_BLUE = '#183961';
const BRAND_CRIMSON = '#a83342';
const PAPER_BG = '#fbf9f5';
const SLATE_BG = '#f8fafc';
const LINE_WARM = '#e6e0d4';
const LINE_COOL = '#cbd5e1';
const TEXT_MUTED = '#5d687d';
const TEXT_BODY = '#334155';
const GREEN_BG = '#e8f7ef';
const GREEN_BORDER = '#a7f3d0';
const GREEN_FG = '#067a4f';

function cleanWinAnsi(str) {
    // Strip characters unsupported by built-in PDF Helvetica WinAnsi (narrow/non-breaking spaces, zero-width, etc.)
    return String(str ?? '')
        .replace(/[\u00a0\u202f\u2007]/g, ' ')
        .replace(/[\u200b-\u200d\ufeff]/g, '');
}

function logoPath() {
    const candidates = [
        path.join(__dirname, '../assets/logo.png'),
        path.join(__dirname, '../../frontend/public/logo.png'),
    ];
    return candidates.find(p => fs.existsSync(p)) || null;
}

function formatMoney(subunits, currency = 'USD', lang = 'en') {
    const cur = String(currency || 'USD').toUpperCase();
    const major = Number(subunits || 0) / 100;
    const isWholeXof = cur === 'XOF' && Math.round(Number(subunits || 0)) % 100 === 0;
    try {
        const locale = lang === 'fr' ? 'fr-FR' : 'en-US';
        if (cur === 'XOF') {
            const num = new Intl.NumberFormat(locale, { maximumFractionDigits: isWholeXof ? 0 : 2 }).format(major);
            return cleanWinAnsi(`${num} XOF`);
        }
        const formatted = new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: cur,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(major);
        return cleanWinAnsi(formatted);
    } catch {
        return `${major.toFixed(cur === 'XOF' ? 0 : 2)} ${cur}`;
    }
}

function formatDate(iso, lang = 'en', shortMonth = false) {
    if (!iso) return '-';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '-';
    const raw = new Intl.DateTimeFormat(lang === 'fr' ? 'fr-FR' : 'en-US', {
        year: 'numeric',
        month: shortMonth ? 'short' : 'long',
        day: 'numeric',
        timeZone: 'UTC',
    }).format(d);
    return cleanWinAnsi(raw);
}

function formatInvoiceNumber(paymentId, dateValue = new Date()) {
    const d = new Date(dateValue);
    const year = Number.isNaN(d.getTime()) ? new Date().getUTCFullYear() : d.getUTCFullYear();
    return `LFWN-${year}-${String(paymentId).padStart(5, '0')}`;
}

function channelLabel(channel, lang = 'en') {
    const fr = lang === 'fr';
    const c = String(channel || '').toLowerCase();
    if (!c) return 'Paystack';
    if (c === 'card') return fr ? 'Paystack (Carte bancaire)' : 'Paystack (Card)';
    if (c === 'mobile_money') return 'Paystack (Mobile Money)';
    if (c === 'bank' || c === 'bank_transfer') return fr ? 'Paystack (Virement bancaire)' : 'Paystack (Bank Transfer)';
    return `Paystack (${c})`;
}

/**
 * Generates an A4 PDF buffer for a paid Premium invoice.
 */
function generateInvoicePdf(data) {
    return new Promise((resolve, reject) => {
        const lang = data.lang === 'fr' ? 'fr' : 'en';
        const fr = lang === 'fr';
        const pageW = 595.28;
        const pageH = 841.89;
        const M = 48;
        const W = pageW - M * 2; // 499.28 pt

        const doc = new PDFDocument({
            size: 'A4',
            margins: { top: M, left: M, right: M, bottom: 24 },
            info: {
                Title: `${fr ? 'Facture' : 'Invoice'} ${data.invoiceNumber}`,
                Author: 'Learn French with Natives',
                Subject: `${data.offer?.name || 'Premium'} (${data.displayCurrency || 'USD'})`,
            },
        });

        const chunks = [];
        doc.on('data', c => chunks.push(c));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        const displayCur = String(data.displayCurrency || data.chargeCurrency || 'USD').toUpperCase();
        const chargeCur = String(data.chargeCurrency || displayCur).toUpperCase();
        const displaySubunits = Number(data.displayAmount ?? data.chargeAmount ?? 0);
        const chargeSubunits = Number(data.chargeAmount ?? displaySubunits);
        const converted = displayCur !== chargeCur;

        const priceText = formatMoney(displaySubunits, displayCur, lang);
        const totalBadgeText = converted && displayCur === 'USD'
            ? (/USD|\$US/i.test(priceText) ? priceText : `${priceText} USD`)
            : priceText;
        const chargeText = formatMoney(chargeSubunits, chargeCur, lang);
        const zeroText = formatMoney(0, displayCur, lang);

        const issueDateText = formatDate(data.paidAt || new Date(), lang);
        const startText = formatDate(data.startsAt || data.paidAt || new Date(), lang, true);
        const endText = data.endsAt ? formatDate(data.endsAt, lang, true) : (fr ? 'Illimité' : 'No expiry');
        const accessDays = Number(data.offer?.days || 0);
        const accessDuration = accessDays > 0
            ? `${accessDays} ${fr ? 'jours' : 'days'}`
            : '-';

        // Top French tricolor accent strip
        const triW = pageW / 3;
        doc.rect(0, 0, triW, 5).fill(BRAND_BLUE);
        doc.rect(triW, 0, triW, 5).fill(LINE_WARM);
        doc.rect(triW * 2, 0, triW + 1, 5).fill(BRAND_CRIMSON);

        // Header: Left Brand Identity
        const logo = logoPath();
        const brandX = logo ? M + 52 : M;
        if (logo) {
            try {
                doc.save();
                doc.roundedRect(M, 30, 42, 42, 10).clip();
                doc.image(logo, M, 30, { width: 42, height: 42 });
                doc.restore();
                doc.roundedRect(M, 30, 42, 42, 10).lineWidth(0.75).stroke(LINE_WARM);
            } catch { /* ignore logo draw error */ }
        }
        doc.fillColor(BRAND_NAVY).font('Helvetica-Bold').fontSize(14.5)
            .text('Learn French with Natives', brandX, 31, { width: 250 });
        doc.fillColor(BRAND_BLUE).font('Helvetica-Bold').fontSize(8.5)
            .text(fr ? 'ACADÉMIE DE FRANÇAIS EN LIGNE' : 'ONLINE FRENCH ACADEMY', brandX, 50, { width: 250 });
        doc.fillColor(TEXT_MUTED).font('Helvetica').fontSize(8.5)
            .text('www.learnfrenchwithnatives.com   |   support@learnfrenchwithnatives.com', brandX, 64, { width: 290 });

        // Header: Right Invoice Title + Paid Badge + Numbers
        const rightColX = pageW - M - 205;
        doc.fillColor(BRAND_NAVY).font('Helvetica-Bold').fontSize(23)
            .text(fr ? 'FACTURE' : 'INVOICE', rightColX, 26, { width: 205, align: 'right' });

        // Paid pill with vector checkmark
        const pillW = 76;
        const pillX = pageW - M - pillW;
        doc.roundedRect(pillX, 56, pillW, 20, 10).fillAndStroke(GREEN_BG, GREEN_BORDER);
        doc.save();
        doc.moveTo(pillX + 12, 66.5).lineTo(pillX + 15.5, 70).lineTo(pillX + 22, 62.5)
            .lineWidth(1.6).strokeColor(GREEN_FG).stroke();
        doc.restore();
        doc.fillColor(GREEN_FG).font('Helvetica-Bold').fontSize(8.5)
            .text(fr ? 'PAYÉE' : 'PAID', pillX + 26, 61.5, { width: pillW - 32, align: 'left' });

        const metaY = 86;
        const metaRows = [
            [fr ? 'Facture N° :' : 'Invoice No.:', data.invoiceNumber],
            [fr ? 'Date d’émission :' : 'Issue Date:', issueDateText],
            [fr ? 'Référence :' : 'Reference:', cleanWinAnsi(data.reference || '-').slice(0, 30)],
        ];
        metaRows.forEach(([lbl, val], idx) => {
            const ry = metaY + idx * 14;
            doc.fillColor(TEXT_MUTED).font('Helvetica').fontSize(8.5).text(lbl, rightColX, ry, { width: 88, align: 'left' });
            doc.fillColor(BRAND_NAVY).font('Helvetica-Bold').fontSize(8.5).text(val, rightColX + 86, ry, { width: 119, align: 'right' });
        });

        // Header Billed-To & Payment Details rounded paper card
        const cardY = 144;
        const cardH = 114;
        doc.roundedRect(M, cardY, W, cardH, 8).fillAndStroke(PAPER_BG, LINE_WARM);

        // Vertical separator
        const midX = M + W / 2;
        doc.moveTo(midX, cardY + 14).lineTo(midX, cardY + cardH - 14).lineWidth(0.75).strokeColor(LINE_WARM).stroke();

        // Left: Billed To
        const leftBoxX = M + 16;
        const boxW = W / 2 - 28;
        doc.fillColor(BRAND_BLUE).font('Helvetica-Bold').fontSize(8)
            .text(fr ? 'FACTURÉ À' : 'BILLED TO', leftBoxX, cardY + 14, { width: boxW });
        doc.fillColor(BRAND_NAVY).font('Helvetica-Bold').fontSize(11)
            .text(cleanWinAnsi(data.customer?.name || 'Valued Learner'), leftBoxX, cardY + 29, { width: boxW });
        let cy = cardY + 46;
        if (data.customer?.email) {
            doc.fillColor(TEXT_BODY).font('Helvetica').fontSize(9)
                .text(cleanWinAnsi(data.customer.email), leftBoxX, cy, { width: boxW });
            cy += 14;
        }
        if (data.customer?.country) {
            doc.fillColor(TEXT_MUTED).font('Helvetica').fontSize(8.5)
                .text(`${fr ? 'Pays' : 'Country'}: ${cleanWinAnsi(data.customer.country)}`, leftBoxX, cy, { width: boxW });
            cy += 13;
        }
        if (data.customer?.whatsapp) {
            doc.fillColor(TEXT_MUTED).font('Helvetica').fontSize(8.5)
                .text(`WhatsApp: ${cleanWinAnsi(data.customer.whatsapp)}`, leftBoxX, cy, { width: boxW });
        }

        // Right: Payment & Access Details
        const rightBoxX = midX + 16;
        doc.fillColor(BRAND_BLUE).font('Helvetica-Bold').fontSize(8)
            .text(fr ? 'DÉTAILS DU PAIEMENT' : 'PAYMENT DETAILS', rightBoxX, cardY + 14, { width: boxW });
        const detailRows = [
            [fr ? 'Statut' : 'Status', fr ? 'Payé intégralement' : 'Paid in full'],
            [fr ? 'Méthode' : 'Method', cleanWinAnsi(channelLabel(data.channel, lang))],
            [fr ? 'Période' : 'Access', `${startText} - ${endText}`],
            [fr ? 'Devise' : 'Currency', `${displayCur}${displayCur === 'USD' ? ' ($)' : ''}`],
        ];
        detailRows.forEach(([k, v], i) => {
            const dy = cardY + 31 + i * 18;
            doc.fillColor(TEXT_MUTED).font('Helvetica').fontSize(8.5).text(k, rightBoxX, dy, { width: 52 });
            doc.fillColor(BRAND_NAVY).font('Helvetica-Bold').fontSize(8.5).text(v, rightBoxX + 50, dy, { width: boxW - 50, align: 'right' });
        });

        // Itemized Table Header
        const tblY = 278;
        const hdrH = 28;
        doc.roundedRect(M, tblY, W, hdrH, 6).fill(BRAND_NAVY);
        doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(8);
        doc.text(fr ? 'DESCRIPTION' : 'DESCRIPTION', M + 14, tblY + 10, { width: 220 });
        doc.text(fr ? 'DURÉE' : 'DURATION', M + 238, tblY + 10, { width: 66 });
        doc.text(fr ? 'QTÉ' : 'QTY', M + 306, tblY + 10, { width: 32, align: 'center' });
        doc.text(fr ? 'PRIX UNIT.' : 'UNIT PRICE', M + 344, tblY + 10, { width: 68, align: 'right' });
        doc.text(fr ? 'MONTANT' : 'AMOUNT', M + 418, tblY + 10, { width: 67, align: 'right' });

        // Itemized Row
        const rowY = tblY + hdrH + 4;
        const rowH = 82;
        doc.roundedRect(M, rowY, W, rowH, 6).fillAndStroke('#ffffff', LINE_WARM);

        const offerTitle = cleanWinAnsi(data.offer?.name || 'Learn French with Natives Premium');
        const defaultDesc = fr
            ? 'Accès illimité aux 464+ cours guidés (A1-C2), 186 dictées studio, ateliers d’écoute et préparations TCF/TEF.'
            : 'Unlimited access to 464+ guided French courses (A1-C2), 186 studio dictations, listening labs & TCF/TEF prep.';
        const offerDesc = cleanWinAnsi(data.offer?.description || defaultDesc);

        doc.fillColor(BRAND_NAVY).font('Helvetica-Bold').fontSize(10.5)
            .text(offerTitle, M + 14, rowY + 14, { width: 215 });
        doc.fillColor(TEXT_MUTED).font('Helvetica').fontSize(8.5)
            .text(offerDesc, M + 14, rowY + 32, { width: 215, height: 40, lineGap: 2 });

        doc.fillColor(TEXT_BODY).font('Helvetica').fontSize(9.5)
            .text(accessDuration, M + 238, rowY + 24, { width: 66 });
        doc.text('1', M + 306, rowY + 24, { width: 32, align: 'center' });
        doc.text(priceText, M + 344, rowY + 24, { width: 68, align: 'right' });
        doc.fillColor(BRAND_NAVY).font('Helvetica-Bold').fontSize(10)
            .text(priceText, M + 418, rowY + 24, { width: 67, align: 'right' });

        // Lower Two-Column Summary: Left Included Features, Right Totals Box
        const sumY = rowY + rowH + 22;

        // Left: Included Benefits Box
        const benW = 244;
        doc.roundedRect(M, sumY, benW, 92, 8).fillAndStroke(PAPER_BG, LINE_WARM);
        doc.fillColor(BRAND_BLUE).font('Helvetica-Bold').fontSize(8)
            .text(fr ? 'INCLUS DANS VOTRE ACCÈS' : 'INCLUDED IN YOUR ACCESS', M + 14, sumY + 12, { width: benW - 28 });
        const perks = fr
            ? ['464+ cours complets de A1 à C2', '186 dictées studio notées /20', 'Ateliers d’écoute, lecture & dialogues', 'Certificats et entraînements TCF / TEF']
            : ['464+ full guided courses (A1 to C2)', '186 studio dictations graded /20', 'Listening, reading & ear-training labs', 'TCF / TEF tracks & completion certificates'];
        perks.forEach((line, i) => {
            const py = sumY + 30 + i * 14;
            doc.save();
            doc.moveTo(M + 14, py + 4).lineTo(M + 17, py + 7).lineTo(M + 22, py + 1.5)
                .lineWidth(1.3).strokeColor(GREEN_FG).stroke();
            doc.restore();
            doc.fillColor(TEXT_BODY).font('Helvetica').fontSize(8.5).text(line, M + 27, py, { width: benW - 38 });
        });

        // Right: Totals
        const totX = M + W - 235;
        const totW = 235;
        doc.fillColor(TEXT_MUTED).font('Helvetica').fontSize(9.5)
            .text(fr ? 'Sous-total' : 'Subtotal', totX + 8, sumY + 6, { width: 110 });
        doc.fillColor(BRAND_NAVY).font('Helvetica-Bold').fontSize(9.5)
            .text(priceText, totX + 115, sumY + 6, { width: totW - 123, align: 'right' });

        doc.fillColor(TEXT_MUTED).font('Helvetica').fontSize(9.5)
            .text(fr ? 'Taxe / TVA (0 %)' : 'Tax / VAT (0%)', totX + 8, sumY + 26, { width: 110 });
        doc.fillColor(BRAND_NAVY).font('Helvetica').fontSize(9.5)
            .text(zeroText, totX + 115, sumY + 26, { width: totW - 123, align: 'right' });

        doc.moveTo(totX, sumY + 46).lineTo(totX + totW, sumY + 46).lineWidth(0.75).strokeColor(LINE_WARM).stroke();

        doc.roundedRect(totX, sumY + 54, totW, 38, 7).fill(BRAND_NAVY);
        doc.fillColor('#dbeafe').font('Helvetica-Bold').fontSize(8.5)
            .text(fr ? `TOTAL PAYÉ (${displayCur})` : `TOTAL PAID (${displayCur})`, totX + 12, sumY + 68, { width: 105 });
        doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(12)
            .text(totalBadgeText, totX + 112, sumY + 66, { width: totW - 124, align: 'right' });

        // FX Settlement Footnote (when invoiced in USD and settled in XOF)
        if (converted) {
            const fxY = sumY + 112;
            const rateNum = Number(data.fxRate || 0);
            const rateTxt = rateNum > 0
                ? (fr ? rateNum.toFixed(2).replace('.', ',') : rateNum.toFixed(2))
                : '';
            const txPart = data.providerTransactionId ? ` (Tx #${data.providerTransactionId})` : '';
            const fxTitle = fr ? 'NOTE DE RÈGLEMENT PAYSTACK' : 'PAYMENT SETTLEMENT REFERENCE';
            const fxNote = fr
                ? `Facture établie en ${displayCur} (${totalBadgeText}). Le règlement sécurisé via Paystack a été traité en Francs CFA pour un montant de ${chargeText}${rateTxt ? ` au taux appliqué de 1 ${displayCur} = ${rateTxt} ${chargeCur}` : ''}${txPart}.`
                : `Invoice issued in ${displayCur} (${totalBadgeText}). Online checkout via Paystack settled the equivalent charge of ${chargeText}${rateTxt ? ` at 1 ${displayCur} = ${rateTxt} ${chargeCur}` : ''}${txPart}.`;

            doc.roundedRect(M, fxY, W, 56, 8).fillAndStroke(SLATE_BG, LINE_COOL);
            doc.fillColor(BRAND_BLUE).font('Helvetica-Bold').fontSize(8).text(fxTitle, M + 14, fxY + 11, { width: W - 28 });
            doc.fillColor(TEXT_BODY).font('Helvetica').fontSize(8.5).text(cleanWinAnsi(fxNote), M + 14, fxY + 25, { width: W - 28, lineGap: 2 });
        }

        // Bottom Footer (pinned near bottom of A4 without creating a second page)
        const footY = 736;
        doc.moveTo(M, footY).lineTo(M + W, footY).lineWidth(0.75).strokeColor(LINE_WARM).stroke();
        doc.fillColor(BRAND_NAVY).font('Helvetica-Bold').fontSize(9.5)
            .text(
                fr ? 'Merci d’étudier le français avec Learn French with Natives !' : 'Thank you for learning French with Learn French with Natives!',
                M, footY + 13, { width: W, align: 'center', lineBreak: false },
            );
        doc.fillColor(TEXT_MUTED).font('Helvetica').fontSize(8.2)
            .text(
                fr
                    ? 'Ce document constitue votre facture officielle acquittée. Pour toute question : support@learnfrenchwithnatives.com'
                    : 'This document is your official paid invoice. Questions? Write to support@learnfrenchwithnatives.com',
                M, footY + 28, { width: W, align: 'center', lineBreak: false },
            );
        doc.fillColor('#94a3b8').font('Helvetica').fontSize(8)
            .text('Learn French with Natives  |  https://www.learnfrenchwithnatives.com', M, footY + 43, { width: W, align: 'center', lineBreak: false });

        // Bottom French tricolor accent strip
        doc.rect(0, pageH - 4, triW, 4).fill(BRAND_BLUE);
        doc.rect(triW, pageH - 4, triW, 4).fill(LINE_WARM);
        doc.rect(triW * 2, pageH - 4, triW + 1, 4).fill(BRAND_CRIMSON);

        doc.end();
    });
}

module.exports = { generateInvoicePdf, formatInvoiceNumber, formatMoney, formatDate };
