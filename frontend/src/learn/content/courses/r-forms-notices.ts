import type { CourseAbout, Doc } from '../../types';
import { b, card, dict, doc, gap, lesson, mc, P, pairs, say, sort, tip } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Nom, prénom, date de naissance, pièce justificative: forms and official notices follow fixed formulas that you must understand to register a child at school, open an account, get a health card or answer a letter from the city. This course teaches the vocabulary of forms, the formal phrases of administrative notices (veuillez, à compter du, sous peine de) and the strategy to find deadlines and required documents.',
    'Nom, prénom, date de naissance, pièce justificative : les formulaires et les avis officiels suivent des formules fixes qu’il faut comprendre pour inscrire un enfant à l’école, ouvrir un compte, obtenir une carte santé ou répondre à une lettre de la ville. Ce cours présente le vocabulaire des formulaires, les tournures soutenues des avis administratifs (veuillez, à compter du, sous peine de) et la stratégie pour repérer les délais et les documents exigés.',
  ),
  outcomes: [
    b('Understand and fill in a form', 'Comprendre et remplir un formulaire'),
    b('Understand formal notices and their formulas', 'Comprendre les avis officiels et leurs formules'),
    b('Find deadlines and required documents', 'Repérer les délais et les documents exigés'),
    b('Ask for help with a form', 'Demander de l’aide pour un formulaire'),
  ],
};

const FORM: Doc = { look: 'page', title: b('Registration form', 'Formulaire d’inscription'), text: 'INSCRIPTION – BIBLIOTHÈQUE MUNICIPALE\n\nNom : …………………… Prénom : ……………………\nDate de naissance (JJ/MM/AAAA) : ……………………\nAdresse : …………………… Code postal : ……………\nCourriel : …………………… Téléphone : ……………\n\nPièces justificatives : une pièce d’identité avec photo et une preuve de résidence de moins de trois mois (facture, bail).\nSignature : ……………………' };
const NOTICE: Doc = { look: 'letter', title: b('Notice from the City', 'Avis de la Ville'), text: 'AVIS AUX CITOYENS\n\nÀ compter du 1er mai, la collecte des déchets aura lieu le mardi, et celle du recyclage le jeudi. Veuillez déposer vos bacs en bordure de rue la veille au soir, après 19 h. Les bacs déposés trop tôt pourront faire l’objet d’une amende.\n\nPour toute question : 311' };
const HEALTH: Doc = { look: 'letter', title: b('Health card renewal', 'Renouvellement de la carte santé'), text: 'Madame,\n\nVotre carte d’assurance maladie expire le 30 juin. Afin d’éviter toute interruption de couverture, veuillez nous retourner le formulaire ci-joint, dûment rempli et signé, avant le 31 mai, accompagné d’une photo récente. Sans réponse de votre part, votre carte ne pourra être renouvelée.\n\nLe Service à la clientèle' };

const C = 'r-forms-notices';
export default [
  lesson(C, 1, ['understanding-a-form', 'comprendre-un-formulaire'],
    b('Understanding a form', 'Comprendre un formulaire'),
    b('Learn the fields of a form and the documents you are asked for.', 'Connaître les rubriques d’un formulaire et les documents demandés.'),
    [b('Understand nom, prénom, JJ/MM/AAAA', 'Comprendre nom, prénom, JJ/MM/AAAA'), b('Understand pièce justificative', 'Comprendre « pièce justificative »'), b('Fill in your details', 'Remplir ses coordonnées')],
    13,
    [
      card(b('Form vocabulary', 'Le vocabulaire des formulaires'), b('**nom** (surname), **prénom** (first name), **date de naissance (JJ/MM/AAAA)** (day/month/year), **adresse, code postal, courriel**, **pièce d’identité** (ID), **preuve de résidence** (proof of address), **pièce justificative** (supporting document), **signature**.', '**nom**, **prénom**, **date de naissance (JJ/MM/AAAA)**, **adresse, code postal, courriel**, **pièce d’identité**, **preuve de résidence**, **pièce justificative**, **signature**.')),
      trap2(),
      doc(FORM, b('Which documents must you bring?', 'Quels documents faut-il apporter ?'), [b('Photo ID and a recent proof of address', 'Une pièce d’identité avec photo et une preuve de résidence récente'), b('A passport only', 'Seulement un passeport'), b('A bank card', 'Une carte bancaire'), b('A diploma', 'Un diplôme')]),
      doc(FORM, b('Which document is accepted as proof of address?', 'Quel document est accepté comme preuve de résidence ?'), [b('A recent bill or a lease', 'Une facture récente ou un bail'), b('A library card', 'Une carte de bibliothèque'), b('A photo', 'Une photo'), b('A birth certificate', 'Un acte de naissance')]),
      pairs(P.match, [['le nom', b('surname, family name', 'nom de famille')], ['le prénom', b('first name', 'nom individuel')], ['le bail', b('the lease', 'contrat de location')], ['une facture', b('a bill, an invoice', 'document de paiement')]]),
      mc(P.best, ['14/03/1992', '03/14/1992', '1992/14/03', '14 mars 92 h'], { fr: 'Date de naissance (JJ/MM/AAAA) : vous êtes né le 14 mars 1992.' }),
      gap(P.complete, 'Mon ___ est Rodriguez et mon ___ est Ana.', ['nom', 'prénom']),
      say('Excusez-moi, quelle pièce justificative dois-je fournir ?', 'Excuse me, which supporting document must I provide?'),
    ],
    [
      b('nom = surname; prénom = first name.', 'nom = nom de famille ; prénom = nom individuel.'),
      b('Dates: JJ/MM/AAAA = day/month/year.', 'Dates : JJ/MM/AAAA = jour/mois/année.'),
      b('pièce justificative = supporting document (ID, bill, lease).', 'pièce justificative = document à fournir (identité, facture, bail).'),
    ],
    [['fournir', b('to provide', 'donner')], ['une pièce d’identité', b('an ID document', 'document d’identité')], ['le code postal', b('the postal code', 'code de l’adresse')]],
  ),
  lesson(C, 2, ['official-notices', 'avis-officiels'],
    b('Official notices', 'Les avis officiels'),
    b('Understand the formal formulas of a public notice.', 'Comprendre les formules soutenues d’un avis public.'),
    [b('Understand à compter du, veuillez', 'Comprendre à compter du, veuillez'), b('Find what changes and when', 'Repérer ce qui change et quand'), b('Understand a possible penalty', 'Comprendre une sanction possible')],
    13,
    [
      card(b('Administrative formulas', 'Les formules administratives'), b('**À compter du** (as of), **veuillez** (please), **la veille** (the day before), **faire l’objet de** (to be subject to), **une amende** (a fine), **sous peine de** (or else, under penalty of), **pour toute question** (for any question).', '**À compter du**, **veuillez**, **la veille**, **faire l’objet de**, **une amende**, **sous peine de**, **pour toute question**.')),
      doc(NOTICE, b('What changes on 1 May?', 'Qu’est-ce qui change le 1er mai ?'), [b('The collection days', 'Les jours de collecte'), b('The price of the bins', 'Le prix des bacs'), b('The phone number', 'Le numéro de téléphone'), b('The recycling rules', 'Les règles du recyclage')]),
      doc(NOTICE, b('When should you put out your rubbish bin?', 'Quand faut-il sortir son bac à déchets ?'), [b('Monday evening after 7 p.m.', 'Le lundi soir après 19 h'), b('Tuesday morning before 7 a.m.', 'Le mardi matin avant 7 h'), b('Thursday evening', 'Le jeudi soir'), b('Any time', 'N’importe quand')]),
      doc(NOTICE, b('What can happen if you put your bin out too early?', 'Que peut-il arriver si l’on dépose son bac trop tôt ?'), [b('You may get a fine.', 'On peut recevoir une amende.'), b('The bin is taken away.', 'Le bac est enlevé.'), b('Nothing.', 'Rien.'), b('The collection is cancelled.', 'La collecte est annulée.')]),
      pairs(P.match, [['à compter du', b('as of, starting from', 'à partir du')], ['la veille', b('the day before', 'le jour précédent')], ['une amende', b('a fine', 'somme à payer en punition')], ['en bordure de rue', b('at the curb', 'au bord de la rue')]]),
      sort(b('Obligation, deadline or penalty?', 'Obligation, délai ou sanction ?'), [b('obligation', 'obligation'), b('deadline / date', 'délai / date'), b('penalty', 'sanction')], [['Veuillez déposer…', 0], ['À compter du 1er mai', 1], ['… sous peine d’amende', 2], ['Merci de signer…', 0], ['avant le 31 mai', 1], ['… pourront être refusés', 2]]),
      dict('À compter du premier mai, la collecte aura lieu le mardi.', { voice: 'm' }),
    ],
    [
      b('à compter du = as of; veuillez = please (formal).', 'à compter du = à partir du ; veuillez = formule de demande polie.'),
      b('faire l’objet d’une amende = to be fined.', 'faire l’objet d’une amende = être sanctionné.'),
      b('Pour toute question = for any question.', 'Pour toute question = si vous avez une question.'),
    ],
    [['la collecte', b('collection (of rubbish)', 'ramassage')], ['un bac', b('a bin', 'contenant pour déchets')], ['le recyclage', b('recycling', 'tri des déchets')]],
  ),
  lesson(C, 3, ['renewals-and-deadlines', 'renouvellements-et-delais'],
    b('Renewals and deadlines', 'Renouvellements et délais'),
    b('Understand a renewal letter and act before the deadline.', 'Comprendre une lettre de renouvellement et agir avant l’échéance.'),
    [b('Find the deadline', 'Repérer l’échéance'), b('Understand ci-joint, dûment rempli', 'Comprendre ci-joint, dûment rempli'), b('Understand the consequence of no reply', 'Comprendre la conséquence d’une absence de réponse')],
    13,
    [
      tip(b('Two dates, two meanings', 'Deux dates, deux sens'), b('In a renewal letter, there are often **two dates**: the **expiry date** (expire le…) and the **deadline** to answer (avant le…). Act before the earlier one.', 'Une lettre de renouvellement contient souvent **deux dates** : la **date d’expiration** (expire le…) et la **date limite** de réponse (avant le…). Agissez avant la plus proche.')),
      doc(HEALTH, b('When must the form be sent back?', 'Quand faut-il renvoyer le formulaire ?'), [b('Before 31 May', 'Avant le 31 mai'), b('Before 30 June', 'Avant le 30 juin'), b('After 30 June', 'Après le 30 juin'), b('Any time', 'N’importe quand')]),
      doc(HEALTH, b('What must be sent with the form?', 'Que faut-il joindre au formulaire ?'), [b('A recent photo', 'Une photo récente'), b('A cheque', 'Un chèque'), b('The old card', 'L’ancienne carte'), b('A lease', 'Un bail')]),
      doc(HEALTH, b('What happens if she does not reply?', 'Que se passe-t-il sans réponse ?'), [b('The card cannot be renewed.', 'La carte ne pourra pas être renouvelée.'), b('The card is renewed automatically.', 'La carte est renouvelée automatiquement.'), b('She receives a new card.', 'Elle reçoit une nouvelle carte.'), b('She pays a fine.', 'Elle paie une amende.')]),
      pairs(P.match, [['ci-joint', b('enclosed, attached', 'joint à la lettre')], ['dûment rempli', b('duly completed', 'complété correctement')], ['expirer', b('to expire', 'ne plus être valide')], ['la couverture', b('(insurance) coverage', 'protection de l’assurance')]]),
      gap(P.complete, 'Votre carte ___ le 30 juin. Veuillez retourner le formulaire ___-joint avant le 31 mai.', ['expire', 'ci']),
      mc(P.best, ['Bonjour, j’ai reçu une lettre pour renouveler ma carte santé. Pouvez-vous m’aider à remplir le formulaire ?', 'Bonjour, ma carte expire, donnez-moi une autre.', 'Bonjour, je refuse le formulaire.', 'Bonjour, c’est quoi une carte ?'], { fr: 'Vous demandez de l’aide au guichet :' }),
      say('Je voudrais renouveler ma carte d’assurance maladie, s’il vous plaît.', 'I’d like to renew my health insurance card, please.'),
    ],
    [
      b('Two dates: expiry (expire le…) and deadline (avant le…).', 'Deux dates : expiration (expire le…) et date limite (avant le…).'),
      b('ci-joint = enclosed; dûment rempli et signé = duly completed and signed.', 'ci-joint = joint ; dûment rempli et signé = complété correctement.'),
      b('Sans réponse de votre part… = if you do not reply…', 'Sans réponse de votre part… = si vous ne répondez pas…'),
    ],
    [['renouveler', b('to renew', 'prolonger la validité')], ['un guichet', b('a counter, a desk', 'comptoir de service')], ['récent', b('recent', 'nouveau')]],
  ),
];

function trap2() {
  return card(b('Nom ≠ name', 'Nom ≠ name'), b('On a French form, **nom** is your **family name**. Your first name is the **prénom**. Write the nom first, often in capitals: **RODRIGUEZ Ana**.', 'Sur un formulaire, le **nom** est le **nom de famille**. Le **prénom** est le nom individuel. On écrit souvent le nom en premier, en majuscules : **RODRIGUEZ Ana**.'), { variant: 'trap' });
}
