import type { CourseAbout } from '../../types';
import { b, card, dlg, doc, exam, gap, hear, lesson, mc, P, pairs, say, sort, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Several residence and citizenship procedures require proof of French at an everyday level (often around A2–B1, depending on the country, the procedure and the date). Tests such as the TEF Canada, TCF Canada, TEF IRN or TCF IRN may be accepted. This course trains the everyday communication these tests evaluate: talking about your life and your projects, understanding public services, and explaining a situation clearly. It is a language course: always check the current official requirements for your procedure.',
    'Plusieurs démarches de résidence et de citoyenneté exigent une preuve de français à un niveau quotidien (souvent autour de A2–B1, selon le pays, la démarche et la date). Des tests comme le TEF Canada, le TCF Canada, le TEF IRN ou le TCF IRN peuvent être acceptés. Ce cours entraîne la communication quotidienne évaluée par ces tests : parler de sa vie et de ses projets, comprendre les services publics, expliquer clairement une situation. C’est un cours de langue : vérifiez toujours les exigences officielles en vigueur pour votre démarche.',
  ),
  outcomes: [
    b('Know where to check official requirements', 'Savoir où vérifier les exigences officielles'),
    b('Talk about your life and projects', 'Parler de sa vie et de ses projets'),
    b('Understand public services documents', 'Comprendre les documents des services publics'),
    b('Explain a situation clearly', 'Expliquer clairement une situation'),
  ],
};

const C = 'tef-citizenship';
export default [
  lesson(C, 1, ['requirements-and-yourself', 'exigences-et-presentation'],
    b('Requirements and talking about yourself', 'Exigences et parler de soi'),
    b('Know where to check requirements and talk about your life in clear sentences.', 'Savoir où vérifier les exigences et parler de sa vie en phrases claires.'),
    [b('Check the official requirements', 'Vérifier les exigences officielles'), b('Talk about your life', 'Parler de sa vie'), b('Talk about your history in the country', 'Parler de son parcours dans le pays')],
    13,
    [
      exam(b('Check official requirements', 'Vérifiez les exigences officielles'), b('**Canada** (citizenship): IRCC sets the required level and the accepted tests (for example TEF Canada, TCF Canada) for **listening and speaking**. **France** (residence card, naturalisation): the required level and accepted tests (for example TEF IRN, TCF IRN) are set by law and **have changed in recent years**. **Always check the official government website** before booking a test.', '**Canada** (citoyenneté) : IRCC fixe le niveau exigé et les tests acceptés (par exemple TEF Canada, TCF Canada) pour la **compréhension et l’expression orales**. **France** (carte de résident, naturalisation) : le niveau exigé et les tests acceptés (par exemple TEF IRN, TCF IRN) sont fixés par la loi et **ont changé ces dernières années**. **Consultez toujours le site officiel du gouvernement** avant de réserver un test.')),
      say('Je m’appelle Aminata, je suis arrivée au Canada il y a quatre ans. Je travaille comme aide-soignante dans une résidence pour personnes âgées, et j’habite à Gatineau avec mon mari et nos deux enfants.', 'My name is Aminata, I arrived in Canada four years ago. I work as a care aide in a seniors’ residence, and I live in Gatineau with my husband and our two children.'),
      sort(b('Past, present or future?', 'Passé, présent ou futur ?'), [b('past (parcours)', 'passé (parcours)'), b('present (life now)', 'présent (vie actuelle)'), b('future (projects)', 'futur (projets)')], [['Je suis arrivé en 2021.', 0], ['Je travaille dans un hôpital.', 1], ['Je voudrais ouvrir mon entreprise.', 2], ['J’ai suivi des cours de français.', 0], ['Mes enfants vont à l’école du quartier.', 1], ['Je compte devenir citoyen.', 2]]),
      mc(P.best, [b('On the official government website (IRCC, or the French administration)', 'Sur le site officiel du gouvernement (IRCC, ou l’administration française)'), b('On a forum', 'Sur un forum'), b('From a friend', 'Auprès d’un ami'), b('Nowhere, all tests are accepted', 'Nulle part, tous les tests sont acceptés')], { fr: 'Où vérifier le niveau et le test exigés pour votre démarche ?' }),
      gap(P.complete, 'Je ___ arrivée en France il y a cinq ans. Depuis, je ___ dans une boulangerie et je ___ ouvrir ma propre boutique.', ['suis', 'travaille', ['voudrais', 'souhaite', 'aimerais']]),
    ],
    [
      b('Requirements differ by country and change: check officially.', 'Les exigences varient selon le pays et évoluent : vérifiez officiellement.'),
      b('Talk about past (parcours), present (life), future (projects).', 'Parlez du passé (parcours), du présent (vie), du futur (projets).'),
      b('Use clear, complete sentences.', 'Employez des phrases claires et complètes.'),
    ],
    [['une démarche', b('a procedure', 'étapes administratives')], ['la naturalisation', b('naturalisation', 'obtenir la nationalité')], ['un parcours', b('a path, background', 'chemin de vie')]],
  ),
  lesson(C, 2, ['public-services', 'les-services-publics'],
    b('Understanding public services', 'Comprendre les services publics'),
    b('Understand letters, forms and notices from public services.', 'Comprendre courriers, formulaires et avis des services publics.'),
    [b('Understand an official letter', 'Comprendre un courrier officiel'), b('Understand a form', 'Comprendre un formulaire'), b('Ask for help at a service counter', 'Demander de l’aide à un guichet')],
    13,
    [
      doc({ look: 'letter', title: b('Official letter (fictional)', 'Courrier officiel (fictif)'), text: 'Objet : Convocation à un entretien\n\nMadame,\n\nDans le cadre de votre demande, vous êtes convoquée à un entretien le mardi 14 mai à 10 h 30, au bureau situé 12, rue de la République.\nMerci de vous présenter avec votre passeport, votre titre de séjour et la présente convocation.\n\nLe service des étrangers' }, b('What must she bring?', 'Que doit-elle apporter ?'), [b('her passport, residence permit and this letter', 'son passeport, son titre de séjour et la convocation'), b('only a photo', 'seulement une photo'), b('a friend', 'un ami'), b('nothing', 'rien')]),
      card(b('At the service counter', 'Au guichet'), b('**Bonjour, j’ai reçu cette convocation, pourriez-vous m’expliquer… ? · Je ne comprends pas ce que je dois remplir ici. · Quels documents dois-je fournir ? · Combien de temps prend le traitement du dossier ? · Est-ce que je peux faire la demande en ligne ?**', '**Bonjour, j’ai reçu cette convocation, pourriez-vous m’expliquer… ? · Je ne comprends pas ce que je dois remplir ici. · Quels documents dois-je fournir ? · Combien de temps prend le traitement du dossier ? · Est-ce que je peux faire la demande en ligne ?**')),
      pairs(P.match, [['une convocation', b('a summons, an appointment letter', 'lettre qui fixe un rendez-vous')], ['un titre de séjour', b('a residence permit', 'autorisation de séjour')], ['le traitement du dossier', b('processing of the file', 'examen de la demande')], ['fournir', b('to provide', 'donner')]]),
      mc(P.best, ['Bonjour, pourriez-vous m’expliquer quels documents je dois fournir pour renouveler mon titre de séjour ?', 'Titre de séjour. Documents.', 'Je veux mes papiers.', 'C’est quoi, ça ?'], { fr: 'Au guichet de la préfecture :' }),
      hear('Pour votre demande, il faut le formulaire rempli et signé, deux photos d’identité récentes, un justificatif de domicile de moins de trois mois et une copie de votre passeport.', b('How old can the proof of address be?', 'De quand peut dater le justificatif de domicile ?'), [b('less than three months', 'moins de trois mois'), b('less than one year', 'moins d’un an'), b('any date', 'n’importe quelle date'), b('less than one week', 'moins d’une semaine')], { voice: 'f' }),
    ],
    [
      b('Letters: objet, date, place, documents to bring.', 'Courriers : objet, date, lieu, documents à apporter.'),
      b('Counter: Pourriez-vous m’expliquer… ? Quels documents dois-je fournir ?', 'Guichet : Pourriez-vous m’expliquer… ? Quels documents dois-je fournir ?'),
      b('Keep copies and note deadlines.', 'Gardez des copies et notez les délais.'),
    ],
    [['un justificatif de domicile', b('proof of address', 'document prouvant l’adresse')], ['renouveler', b('to renew', 'prolonger un document')], ['la préfecture', b('the prefecture (France)', 'administration de l’État')]],
  ),
  lesson(C, 3, ['explaining-a-situation', 'expliquer-une-situation'],
    b('Explaining a situation clearly', 'Expliquer clairement une situation'),
    b('Explain a personal or administrative situation in speaking and writing.', 'Expliquer une situation personnelle ou administrative à l’oral et à l’écrit.'),
    [b('Explain a problem in order', 'Expliquer un problème dans l’ordre'), b('Ask for a solution', 'Demander une solution'), b('Write a short formal message', 'Écrire un court message formel')],
    13,
    [
      card(b('Clear explanation', 'Une explication claire'), b('**What happened** (j’ai perdu mon titre de séjour la semaine dernière), **what you did** (j’ai fait une déclaration de perte au commissariat), **what you need** (je voudrais savoir comment obtenir un duplicata), **thanks**. Short sentences, logical order: **d’abord, ensuite, maintenant**.', '**Ce qui s’est passé** (j’ai perdu mon titre de séjour la semaine dernière), **ce que vous avez fait** (j’ai fait une déclaration de perte au commissariat), **ce dont vous avez besoin** (je voudrais savoir comment obtenir un duplicata), **remerciements**. Phrases courtes, ordre logique : **d’abord, ensuite, maintenant**.')),
      dlg(b('At the counter', 'Au guichet'), undefined, [['Agente', 'f'], ['Vous', 'm']], [
        [0, 'Bonjour, je vous écoute.', 'Hello, how can I help?'],
        [1, { options: ['Bonjour. J’ai perdu mon titre de séjour la semaine dernière. J’ai déjà fait une déclaration de perte au commissariat. Je voudrais savoir comment obtenir un duplicata.', 'Papiers perdus.', 'Je n’ai plus mes papiers, il faut faire quoi ?'] }],
        [0, 'Vous avez la déclaration de perte avec vous ?', 'Do you have the loss declaration with you?'],
        [1, { options: ['Oui, la voici, avec une copie de mon passeport.', 'Non, c’est quoi ?', 'Pourquoi ?'] }],
        [0, 'Très bien. Remplissez ce formulaire, et vous recevrez un rendez-vous par courriel.', 'Very good. Fill in this form, and you’ll receive an appointment by email.'],
      ]),
      write(b('A short formal message', 'Un court message formel'), b('Write a message (50–90 words) to a public service: you moved, you want to update your address, and you ask which documents to send.', 'Écrivez un message (50–90 mots) à un service public : vous avez déménagé, vous voulez mettre à jour votre adresse et vous demandez quels documents envoyer.'), 40, 90, [
        b('What happened', 'Ce qui s’est passé'),
        b('What you need', 'Ce dont vous avez besoin'),
        b('Formal greeting and closing', 'Formules de politesse'),
      ], 'Madame, Monsieur,\n\nJ’ai déménagé le 1er juillet et j’habite maintenant au 45, rue des Érables, à Laval. Je souhaiterais mettre à jour mon adresse dans mon dossier, numéro 2024-58712. Pourriez-vous m’indiquer quels documents je dois vous envoyer ?\n\nJe vous remercie par avance.\n\nCordialement,\nKarim Haddad'),
      say('J’ai déménagé le mois dernier. Je voudrais mettre à jour mon adresse. Quels documents dois-je fournir ?', 'I moved last month. I’d like to update my address. What documents do I need to provide?'),
    ],
    [
      b('Explain: what happened → what you did → what you need.', 'Expliquer : ce qui s’est passé → ce que vous avez fait → ce dont vous avez besoin.'),
      b('Short sentences, logical order.', 'Phrases courtes, ordre logique.'),
      b('Formal message: Madame, Monsieur… Cordialement.', 'Message formel : Madame, Monsieur… Cordialement.'),
    ],
    [['un duplicata', b('a duplicate', 'copie officielle')], ['mettre à jour', b('to update', 'actualiser')], ['par avance', b('in advance', 'avant')]],
  ),
];
