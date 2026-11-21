import type { CourseAbout } from '../../types';
import { b, card, culture, dlg, doc, gap, hear, lesson, mc, P, pairs, say, sort, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Budgets, invoices, margins, cash flow, quarterly results: finance has a precise vocabulary in French, and figures are written and read differently (1 234,56 € with a space and a comma). This course trains the language of accounting documents and financial discussions: reading an invoice and a budget, describing results and key ratios, and following up on payments with the right level of firmness. It is a language course, not financial advice.',
    'Budgets, factures, marges, trésorerie, résultats trimestriels : la finance a un vocabulaire précis en français, et les chiffres s’écrivent et se lisent autrement (1 234,56 € avec une espace et une virgule). Ce cours entraîne la langue des documents comptables et des échanges financiers : lire une facture et un budget, décrire des résultats et des indicateurs clés, et relancer un paiement avec le bon degré de fermeté. C’est un cours de langue, pas un conseil financier.',
  ),
  outcomes: [
    b('Read and write figures the French way', 'Lire et écrire les chiffres à la française'),
    b('Understand an invoice and a budget', 'Comprendre une facture et un budget'),
    b('Describe financial results', 'Décrire des résultats financiers'),
    b('Follow up on an unpaid invoice', 'Relancer une facture impayée'),
  ],
};

const C = 'bz-finance';
export default [
  lesson(C, 1, ['invoices-and-figures', 'factures-et-chiffres'],
    b('Invoices and figures', 'Factures et chiffres'),
    b('Read an invoice and write figures with French conventions.', 'Lire une facture et écrire les chiffres selon les conventions françaises.'),
    [b('Write decimals and thousands', 'Écrire décimales et milliers'), b('Read HT, TVA, TTC', 'Lire HT, TVA, TTC'), b('Understand payment terms', 'Comprendre les conditions de paiement')],
    13,
    [
      card(b('French number conventions', 'Les conventions des nombres'), b('Decimal **comma**, thousands **space**: **1 234,56 €** (« mille deux cent trente-quatre euros cinquante-six »). The € sign goes **after** the number. Invoice terms: **HT** (hors taxes, before tax), **TVA** (VAT; Québec: **TPS/TVQ**), **TTC** (toutes taxes comprises), **échéance**, **conditions de paiement : 30 jours fin de mois**, **acompte** (deposit).', 'Virgule **décimale**, **espace** pour les milliers : **1 234,56 €**. Le signe € se place **après** le nombre. Termes de facture : **HT** (hors taxes), **TVA** (Québec : **TPS/TVQ**), **TTC** (toutes taxes comprises), **échéance**, **conditions de paiement : 30 jours fin de mois**, **acompte**.')),
      doc({ look: 'receipt', title: b('Invoice (fictional)', 'Facture (fictive)'), text: 'FACTURE N° 2025-118\nPrestation de traduction — 12 000 mots | 1 800,00 €\nRemise 5 % | – 90,00 €\nTotal HT | 1 710,00 €\nTVA 20 % | 342,00 €\nTotal TTC | 2 052,00 €\nAcompte versé | – 500,00 €\nReste à payer | 1 552,00 €\nÉchéance : 30 jours à réception' }, b('How much is still to be paid?', 'Combien reste-t-il à payer ?'), [b('€1,552.00', '1 552,00 €'), b('€2,052.00', '2 052,00 €'), b('€1,710.00', '1 710,00 €'), b('€342.00', '342,00 €')]),
      mc(P.choose, ['12 450,75 €', '12,450.75 €', '€12.450,75', '12.450,75€'], { fr: 'Écrivez « douze mille quatre cent cinquante euros soixante-quinze » :' }),
      pairs(P.match, [['HT', b('before tax', 'hors taxes')], ['TTC', b('all taxes included', 'toutes taxes comprises')], ['un acompte', b('a deposit', 'paiement partiel à l’avance')], ['l’échéance', b('the due date', 'date limite de paiement')]]),
      hear('Le montant total s’élève à trois mille quatre cent vingt euros toutes taxes comprises, payable à trente jours.', b('What is the amount?', 'Quel est le montant ?'), [b('€3,420 including tax', '3 420 € TTC'), b('€3,420 before tax', '3 420 € HT'), b('€4,320 including tax', '4 320 € TTC'), b('€3,020', '3 020 €')], { voice: 'f' }),
      say('Le total s’élève à mille sept cent dix euros hors taxes, soit deux mille cinquante-deux euros toutes taxes comprises.', 'The total comes to one thousand seven hundred and ten euros before tax, i.e. two thousand and fifty-two euros including tax.'),
    ],
    [
      b('1 234,56 €: space for thousands, comma for decimals, € after.', '1 234,56 € : espace pour les milliers, virgule pour les décimales, € après.'),
      b('HT + TVA = TTC.', 'HT + TVA = TTC.'),
      b('Acompte, reste à payer, échéance, 30 jours fin de mois.', 'Acompte, reste à payer, échéance, 30 jours fin de mois.'),
    ],
    [['une prestation', b('a service (billed)', 'service fourni')], ['s’élever à', b('to amount to', 'atteindre un montant')], ['une remise', b('a discount', 'réduction')]],
  ),
  lesson(C, 2, ['budgets-and-results', 'budgets-et-resultats'],
    b('Budgets and results', 'Budgets et résultats'),
    b('Describe a budget, variances and the key figures of a financial statement.', 'Décrire un budget, des écarts et les chiffres clés d’un état financier.'),
    [b('Talk about budget and variance', 'Parler de budget et d’écart'), b('Name key indicators', 'Nommer les indicateurs clés'), b('Comment on results', 'Commenter des résultats')],
    13,
    [
      card(b('Key vocabulary', 'Vocabulaire clé'), b('**le budget prévisionnel, le réel, un écart, un dépassement** · **le chiffre d’affaires** (revenue), **les charges** (expenses), **la marge** (margin), **le résultat net** (net income), **la trésorerie** (cash flow), **un bénéfice / une perte**. Comment: **Nous avons dépassé le budget de 8 %. · La marge s’est améliorée de deux points. · Le résultat est en hausse / en recul.**', '**le budget prévisionnel, le réel, un écart, un dépassement** · **le chiffre d’affaires**, **les charges**, **la marge**, **le résultat net**, **la trésorerie**, **un bénéfice / une perte**. Commenter : **Nous avons dépassé le budget de 8 %. · La marge s’est améliorée de deux points. · Le résultat est en hausse / en recul.**')),
      doc({ look: 'page', title: b('Budget vs actual (k€)', 'Budget et réel (k€)'), text: 'Poste | Budget | Réel | Écart\nSalaires | 420 | 428 | + 8\nMarketing | 60 | 75 | + 15\nDéplacements | 30 | 22 | – 8\nTotal | 510 | 525 | + 15' }, b('Which item has the largest overrun?', 'Quel poste a le plus fort dépassement ?'), [b('Marketing (+15 k€)', 'Marketing (+ 15 k€)'), b('Salaries (+8 k€)', 'Salaires (+ 8 k€)'), b('Travel (−8 k€)', 'Déplacements (– 8 k€)'), b('None', 'Aucun')]),
      sort(b('Revenue side or cost side?', 'Côté recettes ou côté dépenses ?'), [b('revenue / result', 'recettes / résultat'), b('costs', 'dépenses')], [['le chiffre d’affaires', 0], ['les charges', 1], ['un bénéfice', 0], ['les salaires', 1], ['la marge', 0], ['les frais de déplacement', 1]]),
      mc(P.best, ['Nous avons dépassé le budget marketing de 25 %, principalement à cause de la campagne de printemps.', 'Le marketing a trop dépensé, c’est leur faute.', 'On a un peu dépassé, mais ce n’est pas grave.', 'Les chiffres sont faux.'], { fr: 'Vous commentez l’écart du poste marketing :' }),
      gap(P.complete, 'Le résultat net est en ___ de 12 %, et la marge s’est ___ de deux points.', ['hausse', 'améliorée']),
      say('Nous avons dépassé le budget de trois pour cent, mais le chiffre d’affaires est en hausse de douze pour cent.', 'We exceeded the budget by three per cent, but revenue is up twelve per cent.'),
    ],
    [
      b('Budget prévisionnel vs réel: écart, dépassement.', 'Budget prévisionnel et réel : écart, dépassement.'),
      b('Chiffre d’affaires – charges = résultat; marge; trésorerie.', 'Chiffre d’affaires – charges = résultat ; marge ; trésorerie.'),
      b('Comment: en hausse, en recul, de X points.', 'Commenter : en hausse, en recul, de X points.'),
    ],
    [['un poste (budgétaire)', b('a budget line', 'catégorie de dépenses')], ['un déplacement', b('a business trip', 'voyage professionnel')], ['un écart', b('a variance', 'différence')]],
  ),
  lesson(C, 3, ['chasing-payments', 'relancer-un-paiement'],
    b('Chasing an unpaid invoice', 'Relancer une facture impayée'),
    b('Write reminders with increasing firmness while keeping the relationship.', 'Rédiger des relances de plus en plus fermes tout en préservant la relation.'),
    [b('Write a friendly first reminder', 'Rédiger une première relance aimable'), b('Write a firmer second reminder', 'Rédiger une deuxième relance plus ferme'), b('Talk about a payment plan', 'Parler d’un échéancier')],
    13,
    [
      card(b('Three levels of reminder', 'Trois niveaux de relance'), b('**1. Friendly**: **Sauf erreur de notre part, la facture n° … n’a pas encore été réglée. Il s’agit sans doute d’un oubli.** **2. Firm**: **Malgré notre précédent courriel, la facture reste impayée. Nous vous remercions de procéder au règlement sous huit jours.** **3. Formal**: **À défaut de règlement avant le…, nous nous verrons contraints d’engager une procédure de recouvrement.**', '**1. Aimable** : **Sauf erreur de notre part, la facture n° … n’a pas encore été réglée. Il s’agit sans doute d’un oubli.** **2. Ferme** : **Malgré notre précédent courriel, la facture reste impayée. Nous vous remercions de procéder au règlement sous huit jours.** **3. Formelle** : **À défaut de règlement avant le…, nous nous verrons contraints d’engager une procédure de recouvrement.**')),
      sort(b('Friendly, firm or formal?', 'Aimable, ferme ou formelle ?'), [b('friendly', 'aimable'), b('firm', 'ferme'), b('formal', 'formelle')], [['Il s’agit sans doute d’un oubli.', 0], ['Malgré notre précédent courriel…', 1], ['À défaut de règlement…', 2], ['Sauf erreur de notre part…', 0], ['Merci de procéder au règlement sous huit jours.', 1], ['… une procédure de recouvrement.', 2]]),
      culture(b('Tone matters', 'Le ton compte'), b('The first reminder assumes **good faith** (« sauf erreur de notre part », « sans doute un oubli »). Jumping to threats damages the relationship. Always mention the **invoice number, amount and due date**.', 'La première relance suppose la **bonne foi** (« sauf erreur de notre part », « sans doute un oubli »). Passer directement aux menaces abîme la relation. Indiquez toujours le **numéro de facture, le montant et l’échéance**.'), { variant: 'culture' }),
      dlg(b('A payment plan', 'Un échéancier'), undefined, [['Client', 'm'], ['Vous (comptabilité)', 'f']], [
        [0, 'Je suis désolé pour le retard, nous avons des difficultés de trésorerie ce mois-ci.', 'I’m sorry for the delay, we have cash-flow difficulties this month.'],
        [1, { options: ['Je comprends. Pourrions-nous convenir d’un échéancier, par exemple en trois versements ?', 'Ce n’est pas notre problème.', 'Payez demain ou on vous poursuit.'] }],
        [0, 'Ce serait très bien. Trois versements mensuels ?', 'That would be great. Three monthly instalments?'],
        [1, { options: ['Parfait. Je vous envoie une proposition d’échéancier par courriel aujourd’hui.', 'Non, un seul versement.', 'On verra.'] }],
      ]),
      write(b('First reminder', 'Première relance'), b('Write a friendly first reminder (40–70 words) for invoice n° 2025-118 (1 552 €), due on 15 May.', 'Rédigez une première relance aimable (40–70 mots) pour la facture n° 2025-118 (1 552 €), échue le 15 mai.'), 40, 70, [
        b('Assume good faith', 'Supposer la bonne foi'),
        b('Invoice number, amount, due date', 'Numéro, montant, échéance'),
        b('Polite request and closing', 'Demande polie et formule finale'),
      ], 'Bonjour Monsieur Gagnon,\n\nSauf erreur de notre part, la facture n° 2025-118 d’un montant de 1 552 €, arrivée à échéance le 15 mai, n’a pas encore été réglée. Il s’agit sans doute d’un oubli. Pourriez-vous procéder au règlement dans les meilleurs délais ?\n\nBien cordialement,\nNadia Saïdi, service comptabilité'),
    ],
    [
      b('1st: Sauf erreur de notre part… sans doute un oubli.', '1re : Sauf erreur de notre part… sans doute un oubli.'),
      b('2nd: Malgré notre précédent courriel… sous huit jours.', '2e : Malgré notre précédent courriel… sous huit jours.'),
      b('Offer solutions: un échéancier, des versements.', 'Proposer des solutions : un échéancier, des versements.'),
    ],
    [['régler', b('to pay, settle', 'payer')], ['un versement', b('an instalment, a payment', 'paiement partiel')], ['le recouvrement', b('debt collection', 'récupération d’une dette')]],
  ),
];
