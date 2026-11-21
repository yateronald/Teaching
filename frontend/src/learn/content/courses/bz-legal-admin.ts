import type { CourseAbout } from '../../types';
import { b, card, doc, gap, lesson, mc, P, pairs, sort, tip, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Contracts, terms and conditions, formal notices, official letters to an administration: legal and administrative French uses fixed formulas, specific connectors and a very precise vocabulary (ci-après, sous réserve de, à compter de, le cas échéant). This C1 course teaches you to read a contract clause, understand administrative letters and write a formal letter to an administration. It is a language course, not legal advice.',
    'Contrats, conditions générales, mises en demeure, courriers officiels à une administration : le français juridique et administratif emploie des formules figées, des connecteurs particuliers et un vocabulaire très précis (ci-après, sous réserve de, à compter de, le cas échéant). Ce cours de niveau C1 vous apprend à lire une clause de contrat, à comprendre un courrier administratif et à rédiger une lettre formelle à une administration. C’est un cours de langue, pas un conseil juridique.',
  ),
  outcomes: [
    b('Understand legal connectors and formulas', 'Comprendre les connecteurs et formules juridiques'),
    b('Read a contract clause', 'Lire une clause de contrat'),
    b('Understand an administrative letter', 'Comprendre un courrier administratif'),
    b('Write a formal letter to an administration', 'Rédiger une lettre formelle à une administration'),
  ],
};

const C = 'bz-legal-admin';
export default [
  lesson(C, 1, ['legal-formulas', 'les-formules-juridiques'],
    b('Legal formulas and connectors', 'Formules et connecteurs juridiques'),
    b('Understand the fixed expressions of contracts and official texts.', 'Comprendre les expressions figées des contrats et textes officiels.'),
    [b('Understand time expressions', 'Comprendre les expressions de temps'), b('Understand conditions and exceptions', 'Comprendre conditions et exceptions'), b('Understand reference words', 'Comprendre les mots de renvoi')],
    13,
    [
      card(b('Fixed legal expressions', 'Expressions juridiques figées'), b('Time: **à compter de** (from), **dans un délai de** (within), **au plus tard le** (no later than), **à l’expiration de**. Conditions: **sous réserve de** (subject to), **à défaut de** (failing), **le cas échéant** (where applicable), **sauf disposition contraire** (unless otherwise stated). Reference: **ci-après dénommé** (hereinafter called), **ledit / ladite** (the said), **susmentionné** (above-mentioned), **les présentes** (this agreement).', 'Temps : **à compter de**, **dans un délai de**, **au plus tard le**, **à l’expiration de**. Conditions : **sous réserve de**, **à défaut de**, **le cas échéant**, **sauf disposition contraire**. Renvoi : **ci-après dénommé**, **ledit / ladite**, **susmentionné**, **les présentes**.')),
      pairs(P.match, [['à compter de', b('from (a date)', 'à partir de')], ['sous réserve de', b('subject to', 'à condition de')], ['le cas échéant', b('where applicable', 'si cela arrive')], ['à défaut de', b('failing', 'en l’absence de')]]),
      sort(b('Time, condition or reference?', 'Temps, condition ou renvoi ?'), [b('time', 'temps'), b('condition', 'condition'), b('reference', 'renvoi')], [['dans un délai de 15 jours', 0], ['sous réserve d’acceptation', 1], ['ci-après dénommé « le Client »', 2], ['au plus tard le 31 mars', 0], ['sauf disposition contraire', 1], ['ladite prestation', 2]]),
      mc(P.meaning, [b('If the payment is not made within 30 days, penalties apply.', 'Si le paiement n’est pas fait sous 30 jours, des pénalités s’appliquent.'), b('Penalties are always applied.', 'Des pénalités sont toujours appliquées.'), b('Payment is optional.', 'Le paiement est facultatif.'), b('The client receives penalties after 30 days of payment.', 'Le client reçoit des pénalités 30 jours après le paiement.')], { fr: '« À défaut de règlement dans un délai de 30 jours, des pénalités de retard seront exigibles. »' }),
      gap(P.complete, 'Le contrat prend effet à ___ du 1er janvier et sera renouvelé, le cas ___ , pour un an.', ['compter', 'échéant']),
    ],
    [
      b('Time: à compter de, dans un délai de, au plus tard le.', 'Temps : à compter de, dans un délai de, au plus tard le.'),
      b('Condition: sous réserve de, à défaut de, le cas échéant.', 'Condition : sous réserve de, à défaut de, le cas échéant.'),
      b('Reference: ci-après dénommé, ledit, les présentes.', 'Renvoi : ci-après dénommé, ledit, les présentes.'),
    ],
    [['exigible', b('payable, due', 'qui peut être réclamé')], ['prendre effet', b('to take effect', 'commencer à s’appliquer')], ['une disposition', b('a provision, a clause', 'règle d’un texte')]],
  ),
  lesson(C, 2, ['reading-a-contract', 'lire-un-contrat'],
    b('Reading a contract and an official letter', 'Lire un contrat et un courrier officiel'),
    b('Identify obligations, deadlines and consequences in contract clauses and administrative letters.', 'Repérer obligations, délais et conséquences dans des clauses et des courriers administratifs.'),
    [b('Find obligations and rights', 'Trouver obligations et droits'), b('Find deadlines and conditions', 'Trouver délais et conditions'), b('Understand what to do next', 'Comprendre ce qu’il faut faire')],
    13,
    [
      card(b('Reading method', 'Méthode de lecture'), b('Look for: **who** (le Prestataire, le Client, l’Administration), **must do what** (**s’engage à, est tenu de, doit**), **by when** (**dans un délai de, au plus tard**), **under which condition** (**sous réserve de, à condition que**), and **what happens otherwise** (**à défaut, faute de quoi**).', 'Cherchez : **qui** (le Prestataire, le Client, l’Administration), **doit faire quoi** (**s’engage à, est tenu de, doit**), **quand** (**dans un délai de, au plus tard**), **à quelle condition** (**sous réserve de, à condition que**), et **ce qui se passe sinon** (**à défaut, faute de quoi**).')),
      doc({ look: 'page', title: b('Service contract (fictional extract)', 'Contrat de prestation (extrait fictif)'), text: 'Article 4 — Obligations du Prestataire\nLe Prestataire, ci-après dénommé « le Prestataire », s’engage à livrer les traductions dans un délai de dix jours ouvrés à compter de la réception des documents.\nArticle 7 — Résiliation\nChacune des parties peut résilier les présentes par lettre recommandée, moyennant un préavis de trente jours. À défaut de préavis, la partie défaillante sera redevable d’une indemnité équivalente à un mois de prestations.' }, b('What happens if a party ends the contract without notice?', 'Que se passe-t-il si une partie résilie sans préavis ?'), [b('It owes compensation equal to one month of services.', 'Elle doit une indemnité équivalente à un mois de prestations.'), b('Nothing.', 'Rien.'), b('The contract is renewed automatically.', 'Le contrat est renouvelé automatiquement.'), b('It must deliver within ten days.', 'Elle doit livrer sous dix jours.')]),
      doc({ look: 'letter', title: b('Administrative letter (fictional)', 'Courrier administratif (fictif)'), text: 'Objet : Demande de pièces complémentaires — Dossier n° 2025-4471\n\nMadame,\n\nVotre demande a bien été enregistrée. Toutefois, afin de poursuivre son instruction, nous vous prions de bien vouloir nous transmettre, au plus tard le 30 juin, un justificatif de domicile de moins de trois mois.\n\nFaute de quoi, votre dossier sera classé sans suite.\n\nVeuillez agréer, Madame, l’expression de nos salutations distinguées.' }, b('What must the person do?', 'Que doit faire la personne ?'), [b('Send proof of address dated within 3 months by 30 June', 'Envoyer un justificatif de domicile de moins de 3 mois avant le 30 juin'), b('Nothing, the file is complete', 'Rien, le dossier est complet'), b('Pay a fine', 'Payer une amende'), b('Come to an interview on 30 June', 'Venir à un entretien le 30 juin')]),
      mc(P.meaning, [b('the file will be closed without action', 'le dossier sera fermé sans suite donnée'), b('the file will be accepted', 'le dossier sera accepté'), b('the file will be sent to another office', 'le dossier sera envoyé à un autre bureau'), b('the file will be urgent', 'le dossier sera urgent')], { fr: '« Votre dossier sera classé sans suite. »' }),
      sort(b('Obligation, deadline or consequence?', 'Obligation, délai ou conséquence ?'), [b('obligation', 'obligation'), b('deadline', 'délai'), b('consequence', 'conséquence')], [['s’engage à livrer', 0], ['dans un délai de dix jours ouvrés', 1], ['sera redevable d’une indemnité', 2], ['est tenu de transmettre', 0], ['au plus tard le 30 juin', 1], ['sera classé sans suite', 2]]),
    ],
    [
      b('Who? s’engage à / est tenu de… — by when? — on what condition?', 'Qui ? s’engage à / est tenu de… — quand ? — à quelle condition ?'),
      b('Consequences: à défaut, faute de quoi.', 'Conséquences : à défaut, faute de quoi.'),
      b('Classé sans suite = closed without action.', 'Classé sans suite = fermé sans suite.'),
    ],
    [['résilier', b('to terminate (a contract)', 'mettre fin')], ['un justificatif de domicile', b('proof of address', 'document prouvant l’adresse')], ['l’instruction (d’un dossier)', b('the processing of a file', 'examen du dossier')]],
  ),
  lesson(C, 3, ['writing-to-an-administration', 'ecrire-a-une-administration'],
    b('Writing to an administration', 'Écrire à une administration'),
    b('Write a formal letter: references, object, request, attachments and closing.', 'Rédiger une lettre formelle : références, objet, demande, pièces jointes et formule finale.'),
    [b('Lay out a formal letter', 'Présenter une lettre formelle'), b('State a request precisely', 'Formuler une demande avec précision'), b('Use formal closing formulas', 'Employer les formules finales soutenues')],
    13,
    [
      card(b('Formal letter', 'La lettre formelle'), b('**Références** (dossier n°…) · **Objet** · **Madame, Monsieur,** · Reference: **Par la présente, je me permets de… / Suite à votre courrier du…** · Request: **Je vous saurais gré de bien vouloir… · Je sollicite…** · Attachments: **Vous trouverez ci-joint… / Pièces jointes : …** · Closing: **Dans l’attente de votre réponse, je vous prie d’agréer, Madame, Monsieur, l’expression de mes salutations distinguées.**', '**Références** (dossier n°…) · **Objet** · **Madame, Monsieur,** · Renvoi : **Par la présente, je me permets de… / Suite à votre courrier du…** · Demande : **Je vous saurais gré de bien vouloir… · Je sollicite…** · Pièces jointes : **Vous trouverez ci-joint… / Pièces jointes : …** · Formule finale : **Dans l’attente de votre réponse, je vous prie d’agréer, Madame, Monsieur, l’expression de mes salutations distinguées.**')),
      tip(b('« Je vous saurais gré »', '« Je vous saurais gré »'), b('**Je vous saurais gré de bien vouloir…** = I would be grateful if you could… It is the most elegant formal request. Never « Je vous serais gré » (a classic mistake).', '**Je vous saurais gré de bien vouloir…** = Je vous serais reconnaissant(e) de… C’est la demande formelle la plus élégante. Jamais « Je vous serais gré » (faute classique).')),
      mc(P.form, ['Je vous saurais gré de bien vouloir me transmettre l’attestation.', 'Je vous serais gré de bien vouloir me transmettre l’attestation.', 'Je vous saurai gré de bien vouloir me transmettre l’attestation demain hier.', 'Je vous sauriez gré de bien vouloir me transmettre l’attestation.']),
      mc(P.best, ['Suite à votre courrier du 12 juin, vous trouverez ci-joint le justificatif de domicile demandé.', 'Voilà le papier que vous voulez.', 'Je vous envoie le truc pour l’adresse.', 'Coucou, c’est pour mon dossier.'], { fr: 'Première phrase d’une réponse à l’administration :' }),
      write(b('Your formal letter', 'Votre lettre formelle'), b('Write a formal letter (90–140 words) answering the administrative letter of lesson 2: references, object, reference to their letter, attachment, request for confirmation, formal closing.', 'Rédigez une lettre formelle (90–140 mots) en réponse au courrier administratif de la leçon 2 : références, objet, rappel de leur courrier, pièce jointe, demande de confirmation, formule finale.'), 90, 140, [
        b('References and object', 'Références et objet'),
        b('Reference to their letter and attachment', 'Rappel de leur courrier et pièce jointe'),
        b('Formal request and closing', 'Demande soutenue et formule finale'),
      ], 'Dossier n° 2025-4471\nObjet : Transmission de pièce complémentaire\n\nMadame, Monsieur,\n\nSuite à votre courrier du 12 juin, je vous prie de trouver ci-joint un justificatif de domicile datant de moins de trois mois, comme demandé.\n\nJe vous saurais gré de bien vouloir me confirmer la bonne réception de ce document et de m’informer, le cas échéant, de toute autre pièce nécessaire à l’instruction de mon dossier.\n\nDans l’attente de votre réponse, je vous prie d’agréer, Madame, Monsieur, l’expression de mes salutations distinguées.\n\nAmina Toure\n\nPièce jointe : facture d’électricité du 2 juin', { phrases: ['Suite à votre courrier du…', 'Vous trouverez ci-joint…', 'Je vous saurais gré de bien vouloir…', 'le cas échéant'] }),
    ],
    [
      b('Layout: références, objet, appel, corps, formule finale, pièces jointes.', 'Mise en page : références, objet, appel, corps, formule finale, pièces jointes.'),
      b('Request: Je vous saurais gré de bien vouloir…', 'Demande : Je vous saurais gré de bien vouloir…'),
      b('Closing: Dans l’attente de votre réponse, je vous prie d’agréer…', 'Formule finale : Dans l’attente de votre réponse, je vous prie d’agréer…'),
    ],
    [['ci-joint', b('attached', 'joint à la lettre')], ['une attestation', b('a certificate', 'document officiel')], ['savoir gré', b('to be grateful (formal)', 'être reconnaissant')]],
  ),
];
