import type { CourseAbout, Doc } from '../../types';
import { b, card, dict, doc, gap, lesson, mc, P, pairs, sort, trap } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Letters from your bank, insurer or phone provider always hide the essential deadline inside polite administrative French: « à compter du », « sauf opposition de votre part », « sous cinq jours ouvrés ». Missing one line can cost money or automatic renewal. This B1 course trains you to read fee-change notices, insurance claim rules, warranties and cancellation deadlines calmly and accurately.',
    'Les courriers de votre banque, de votre assureur ou d’un opérateur glissent toujours la date décisive au milieu de formules polies : « à compter du », « sauf opposition de votre part », « sous cinq jours ouvrés ». Rater une ligne peut entraîner des frais ou un renouvellement automatique. Ce cours de niveau B1 vous entraîne à lire avis de tarifs, règles de sinistre, garanties et délais de résiliation avec précision.',
  ),
  outcomes: [
    b('Identify fee changes, effective dates and refusal options in bank letters', 'Repérer hausses de tarifs, dates d’effet et droit de refus bancaire'),
    b('Read insurance cover, deductibles (franchise) and claim deadlines', 'Comprendre garanties, franchise et délais de déclaration de sinistre'),
    b('Master cancellation windows, cooling-off rights and automatic renewal', 'Maîtriser préavis, délai de rétractation et reconduction tacite'),
    b('Know which documents and delivery proof protect consumer rights', 'Savoir quels justificatifs et preuves d’envoi protègent vos droits'),
  ],
};

const BANK_LETTER: Doc = { look: 'letter', title: b('Bank notice', 'Courrier bancaire'), text: 'BANQUE DU NORD — Avis de modification tarifaire\n\nMadame, Monsieur,\n\nNous vous informons qu’à compter du 1er juillet, les frais de tenue de compte passeront de 2,50 € à 3,20 € par mois. Le plafond de paiement de votre carte reste inchangé (2 000 € sur 30 jours).\n\nConformément à la réglementation, vous disposez d’un délai de deux mois pour refuser cette modification et clôturer votre compte sans frais. À défaut d’opposition avant le 30 juin, les nouveaux tarifs s’appliqueront automatiquement.' };
const INS_LETTER: Doc = { look: 'letter', title: b('Insurance notice', 'Courrier d’assurance'), text: 'ASSURANCES HORIZON — Garantie habitation\n\nEn cas de sinistre (dégât des eaux, vol, incendie), vous devez déclarer l’incident dans un délai de 5 jours ouvrés (2 jours pour un vol) via votre espace client.\n\nPour tout appareil endommagé, conservez les factures d’achat et prenez des photos avant réparation. Une franchise de 150 € reste à votre charge sur chaque indemnisation. L’usure normale n’est pas couverte.' };
const CANCEL_EMAIL: Doc = { look: 'email', title: b('Renewal notice', 'Avis d’échéance'), text: 'Objet : Renouvellement annuel de votre abonnement ÉnergiePlus\n\nVotre contrat arrive à échéance le 30 septembre. Sans démarche de votre part, il sera reconduit tacitement pour douze mois.\n\nVous pouvez toutefois le résilier sans pénalité au plus tard un mois avant cette date (soit avant le 31 août), par courriel ou par lettre recommandée avec accusé de réception (LRAR). Pour toute nouvelle souscription en ligne, un délai de rétractation de 14 jours s’applique.' };

const C = 'r-consumer-letters';
export default [
  lesson(C, 1, ['bank-notices-and-fee-changes', 'avis-bancaires-et-tarifs'],
    b('Bank notices and fee changes', 'Avis bancaires et tarifs'),
    b('Read effective dates, fee increases and your right to refuse without charge.', 'Lire dates d’effet, hausses tarifaires et droit de clôturer sans frais.'),
    [b('Understand à compter du and à défaut de', 'Comprendre à compter du et à défaut de'), b('Spot what changes and what stays the same', 'Distinguer ce qui change de ce qui reste fixe'), b('Check deadlines to object', 'Vérifier les délais d’opposition')],
    13,
    [
      card(b('Bank letter phrases', 'Les formules bancaires'), b('**À compter du** = starting from · **Les frais de tenue de compte** = monthly account fees · **Le plafond** = spending / withdrawal limit · **À défaut d’opposition** = unless you object · **Clôturer sans frais** = close free of charge.', '**À compter du** (à partir du) · **Les frais de tenue de compte** · **Le plafond** (limite) · **À défaut d’opposition** (si vous ne refusez pas) · **Clôturer sans frais**.')),
      doc(BANK_LETTER, b('What changes on 1 July?', 'Qu’est-ce qui change le 1er juillet ?'), [b('Monthly account fees rise by 0.70 €.', 'Les frais de tenue de compte augmentent de 0,70 €.'), b('The card payment limit drops to 2 000 €.', 'Le plafond de la carte baisse à 2 000 €.'), b('Closing the account costs 3.20 €.', 'La clôture du compte coûte 3,20 €.'), b('All transfers become paid.', 'Tous les virements deviennent payants.')]),
      doc(BANK_LETTER, b('What happens if you do not reply before 30 June?', 'Que se passe-t-il si vous ne répondez pas avant le 30 juin ?'), [b('The new fee applies automatically.', 'Le nouveau tarif s’applique automatiquement.'), b('Your bank account is closed.', 'Votre compte bancaire est fermé.'), b('Your card is blocked.', 'Votre carte est bloquée.'), b('You pay a penalty of 2 000 €.', 'Vous payez une pénalité de 2 000 €.')]),
      doc(BANK_LETTER, b('If you refuse the new fee within two months, what can you do?', 'Si vous refusez le nouveau tarif sous deux mois, que pouvez-vous faire ?'), [b('Close the account without paying closing fees', 'Clôturer le compte sans frais'), b('Keep the old fee forever', 'Garder l’ancien tarif à vie'), b('Increase your card limit', 'Augmenter le plafond de votre carte'), b('Receive a refund of past fees', 'Obtenir le remboursement des anciens frais')]),
      pairs(P.match, [['à compter du', b('starting from', 'à partir de')], ['le plafond', b('spending limit', 'montant maximal')], ['clôturer sans frais', b('to close free of charge', 'fermer gratuitement')], ['à défaut de', b('failing, unless', 'en l’absence de')]]),
      gap(P.complete, 'Les nouveaux tarifs s’appliquent à ___ du 1er juillet, à ___ d’opposition avant le 30 juin.', ['compter', 'défaut']),
    ],
    [
      b('À compter du = starting on; à défaut d’opposition = unless you object.', 'À compter du = à partir du ; à défaut d’opposition = sans refus de votre part.'),
      b('Separate unchanged terms (reste inchangé) from new fees.', 'Séparez ce qui reste inchangé des hausses.'),
      b('You normally have a deadline to refuse and close sans frais.', 'Un délai légal permet souvent de refuser et clôturer sans frais.'),
    ],
    [['les frais de tenue', b('account maintenance fees', 'coût mensuel du compte')], ['inchangé', b('unchanged', 'qui reste identique')], ['une opposition', b('an objection, card block', 'refus ou blocage')]],
  ),
  lesson(C, 2, ['insurance-and-warranties', 'assurances-et-garanties'],
    b('Insurance claims and deductibles', 'Assurances, sinistres et garanties'),
    b('Know deadlines, required proof and what stays out of your own pocket.', 'Connaître délais, justificatifs exigés et montant restant à votre charge.'),
    [b('Understand sinistre, franchise and indemnisation', 'Comprendre sinistre, franchise et indemnisation'), b('Check reporting deadlines (jours ouvrés)', 'Vérifier les délais de déclaration'), b('Identify exclusions such as normal wear', 'Repérer les exclusions comme l’usure normale')],
    13,
    [
      trap(b('Read « franchise » and « jours ouvrés » carefully', 'Attention à « franchise » et « jours ouvrés »'), b('In French insurance, **la franchise** is NOT a business franchise: it is the **deductible** you still pay yourself! **Un sinistre** = an insured incident (leak, theft, fire). **Jours ouvrés** = working days (usually Monday–Friday, excluding public holidays).', 'En assurance, **la franchise** est la somme qui **reste à votre charge** après un remboursement. **Un sinistre** = un incident couvert (dégât des eaux, vol, incendie). **Jours ouvrés** = jours travaillés (du lundi au vendredi hors fériés).')),
      doc(INS_LETTER, b('Your bike is stolen from your locked cellar on Monday. When is the latest you can report it?', 'Votre vélo est volé lundi dans votre cave fermée. Quel est le délai maximal pour déclarer le vol ?'), [b('Within 2 working days', 'Sous 2 jours ouvrés'), b('Within 5 working days', 'Sous 5 jours ouvrés'), b('Within 14 days', 'Sous 14 jours'), b('At the end of the month', 'À la fin du mois')]),
      doc(INS_LETTER, b('A water leak ruins a 650 € washing machine (you have the receipt). How much will the insurer reimburse?', 'Un dégât des eaux abîme une machine à 650 € (avec facture). Combien l’assureur rembourse-t-il au maximum ?'), ['500 €', '650 €', '150 €', '0 €']),
      doc(INS_LETTER, b('Which situation is NOT covered by this policy?', 'Quelle situation n’est PAS couverte par ce contrat ?'), [b('An old tap leaking from normal wear and tear', 'Un vieux robinet qui fuit par usure normale'), b('A sudden burst pipe causing water damage', 'Une fuite soudaine provoquant un dégât des eaux'), b('A burglary with receipts and photos', 'Un cambriolage avec factures et photos'), b('Fire damage to appliances', 'Des appareils abîmés par un incendie')]),
      sort(b('Covered / required or excluded?', 'Exigé / couvert ou exclu ?'), [b('required for a claim', 'exigé pour être indemnisé'), b('excluded / paid by you', 'exclu / à votre charge')], [['conserver les factures', 0], ['franchise de 150 €', 1], ['prendre des photos avant réparation', 0], ['usure normale', 1], ['déclarer sous 5 jours ouvrés', 0]]),
      dict('Conservez vos factures et déclarez tout sinistre sous cinq jours ouvrés.', { voice: 'm' }),
    ],
    [
      b('Franchise = deductible you pay; indemnisation = compensation paid to you.', 'Franchise = somme à votre charge ; indemnisation = remboursement.'),
      b('Theft often has a shorter deadline (2 jours ouvrés) than water damage (5 jours).', 'Le vol a souvent un délai plus court (2 jours ouvrés) qu’un dégât des eaux (5 jours).'),
      b('Keep receipts (factures) and take photos before repairing.', 'Gardez factures et photos avant toute réparation.'),
    ],
    [['un sinistre', b('an insured incident, damage', 'événement couvert : vol, fuite…')], ['la franchise', b('the deductible', 'part non remboursée')], ['un jour ouvré', b('a working day', 'jour normalement travaillé')]],
  ),
  lesson(C, 3, ['cancellations-and-consumer-rights', 'resiliation-et-droits'],
    b('Cancellations, renewals and consumer rights', 'Résiliation, reconduction et droits'),
    b('Stop automatic renewals on time and use your 14-day cooling-off right.', 'Arrêter une reconduction automatique à temps et utiliser son droit de rétractation.'),
    [b('Understand reconduction tacite', 'Comprendre la reconduction tacite'), b('Distinguish résiliation and rétractation', 'Distinguer résiliation et rétractation'), b('Know when LRAR or written proof matters', 'Savoir quand utiliser une LRAR ou trace écrite')],
    13,
    [
      card(b('Renewal vs cancellation', 'Reconduction et résiliation'), b('**La reconduction tacite** = automatic renewal if you say nothing · **Résilier** = cancel an ongoing contract (watch **au plus tard** = no later than!) · **Le délai de rétractation** = cooling-off period (14 days after online purchase) · **LRAR** = registered letter with proof of receipt.', '**La reconduction tacite** (renouvellement automatique) · **Résilier** (mettre fin à un contrat) · **Au plus tard** (date limite) · **Le délai de rétractation** (14 jours après un achat en ligne) · **LRAR** (lettre recommandée avec accusé de réception).')),
      doc(CANCEL_EMAIL, b('What happens if you do nothing before 30 September?', 'Que se passe-t-il si vous ne faites rien avant le 30 septembre ?'), [b('The contract renews automatically for one year.', 'Le contrat est renouvelé automatiquement pour un an.'), b('The contract stops on 30 September.', 'Le contrat s’arrête le 30 septembre.'), b('You pay a late penalty.', 'Vous payez une pénalité de retard.'), b('You get a 14-day free trial.', 'Vous obtenez 14 jours gratuits.')]),
      doc(CANCEL_EMAIL, b('What is the deadline to cancel without penalty?', 'Quelle est la date limite pour résilier sans pénalité ?'), [b('31 August at the latest', 'Le 31 août au plus tard'), b('30 September', 'Le 30 septembre'), b('14 September', 'Le 14 septembre'), b('1 October', 'Le 1er octobre')]),
      doc(CANCEL_EMAIL, b('You subscribed online five days ago and changed your mind. Which right applies?', 'Vous avez souscrit en ligne il y a cinq jours et changez d’avis. Quel droit s’applique ?'), [b('The 14-day cooling-off period (rétractation)', 'Le délai de rétractation de 14 jours'), b('Automatic renewal (reconduction tacite)', 'La reconduction tacite'), b('One-month notice before 30 September', 'Le préavis d’un mois avant septembre'), b('No cancellation is possible.', 'Aucune annulation n’est possible.')]),
      pairs(P.match, [['la reconduction tacite', b('automatic renewal', 'renouvellement automatique')], ['résilier un contrat', b('to cancel a contract', 'mettre fin au contrat')], ['le délai de rétractation', b('cooling-off period', 'délai pour changer d’avis')], ['accusé de réception', b('proof of delivery', 'preuve que la lettre a été reçue')]]),
      mc(P.best, ['Conformément à notre contrat, je souhaite résilier mon abonnement avant la date d’échéance du 30 septembre.', 'Arrêtez tout tout de suite merci.', 'Je ne paie plus rien à partir d’hier.', 'Votre contrat est très méchant.'], { fr: 'Vous écrivez pour annuler votre abonnement dans les délais :' }),
      gap(P.complete, 'Pour éviter la reconduction ___, envoyez votre demande au plus ___ un mois avant l’échéance.', ['tacite', 'tard']),
    ],
    [
      b('Reconduction tacite = automatic renewal unless you cancel.', 'Reconduction tacite = renouvellement automatique sans action de votre part.'),
      b('Résilier = end an ongoing contract; se rétracter = cancel a recent online purchase (14 days).', 'Résilier = arrêter un contrat ; se rétracter = annuler sous 14 jours.'),
      b('Keep proof of sending (courriel or LRAR) before the deadline.', 'Gardez une preuve d’envoi (courriel ou LRAR) avant la date limite.'),
    ],
    [['la résiliation', b('cancellation of a contract', 'fin d’un contrat')], ['tacite', b('implied, automatic', 'sans accord explicite')], ['l’échéance', b('due date, expiry date', 'date limite ou de fin')]],
  ),
];
