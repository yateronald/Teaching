import type { CourseAbout } from '../../types';
import { b, card, dict, dlg, hear, lesson, P, pairs, tip } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'At the bakery, the pharmacy, the bank or the post office, staff ask quick questions that you must understand on the spot: Avec ceci ? Sur place ou pour emporter ? Vous avez la carte de fidélité ? This course trains your ear on the typical questions and answers of shops and services, at natural speed, with Québec and France variants.',
    'À la boulangerie, à la pharmacie, à la banque ou au bureau de poste, les employés posent des questions rapides qu’il faut comprendre sur le moment : Avec ceci ? Sur place ou pour emporter ? Vous avez la carte de fidélité ? Ce cours entraîne votre oreille aux questions et réponses typiques des commerces et des services, à vitesse naturelle, avec les variantes du Québec et de France.',
  ),
  outcomes: [
    b('Understand staff questions in shops', 'Comprendre les questions des employés en magasin'),
    b('Understand payment questions', 'Comprendre les questions de paiement'),
    b('Understand pharmacy and bank exchanges', 'Comprendre les échanges à la pharmacie et à la banque'),
    b('Answer quickly and politely', 'Répondre rapidement et poliment'),
  ],
};

const C = 'l-shops-services';
export default [
  lesson(C, 1, ['food-shops-and-cafes', 'commerces-et-cafes'],
    b('Food shops and cafés', 'Commerces alimentaires et cafés'),
    b('Understand the quick questions of bakeries, cafés and grocery stores.', 'Comprendre les questions rapides des boulangeries, cafés et épiceries.'),
    [b('Understand Avec ceci ? Ce sera tout ?', 'Comprendre Avec ceci ? Ce sera tout ?'), b('Understand sur place ou pour emporter', 'Comprendre sur place ou pour emporter'), b('Answer briefly', 'Répondre brièvement')],
    13,
    [
      card(b('Counter questions', 'Les questions du comptoir'), b('**Qu’est-ce que je vous sers ?** (What can I get you?) **Avec ceci ? / Et avec ça ?** (Anything else?) **Ce sera tout ?** (Is that all?) **Sur place ou pour emporter ?** (Eat in or take away?) In Québec: **pour emporter** also, and **un sac ?** (do you want a bag?).', '**Qu’est-ce que je vous sers ?** **Avec ceci ? / Et avec ça ?** **Ce sera tout ?** **Sur place ou pour emporter ?** Au Québec : **pour emporter** aussi, et **un sac ?**.')),
      hear('Bonjour ! Qu’est-ce que je vous sers ?', b('What does the baker ask?', 'Que demande la boulangère ?'), [b('What you would like', 'Ce que vous voulez'), b('If you want a bag', 'Si vous voulez un sac'), b('How you will pay', 'Comment vous allez payer'), b('Your name', 'Votre nom')]),
      hear('Un croissant et un café, très bien. Sur place ou pour emporter ?', b('What must you choose?', 'Que devez-vous choisir ?'), [b('Eat in or take away', 'Manger sur place ou emporter'), b('Small or large', 'Petit ou grand'), b('Cash or card', 'Comptant ou carte'), b('Sugar or not', 'Sucre ou non')]),
      hear('Ce sera tout ? Alors ça vous fait six dollars vingt.', b('How much do you pay?', 'Combien payez-vous ?'), ['6,20 $', '6,02 $', '20,60 $', '16,20 $']),
      dlg(b('At the café', 'Au café'), undefined, [['Barista', 'f'], ['Vous', 'm']], [
        [0, 'Bonjour ! Qu’est-ce que je vous sers ?', 'Hello! What can I get you?'],
        [1, 'Un grand latte, s’il vous plaît.', 'A large latte, please.'],
        [0, 'Avec ceci ?', 'Anything else?'],
        [1, { options: ['Non, ce sera tout, merci.', 'Oui, ce sera ceci.', 'Avec ceci, merci.'] }],
        [0, 'Sur place ou pour emporter ?', 'Eat in or take away?'],
        [1, { options: ['Pour emporter, s’il vous plaît.', 'Sur emporter.', 'Pour place.'] }],
      ]),
      pairs(P.match, [['Avec ceci ?', b('Anything else?', 'autre chose ?')], ['Ce sera tout ?', b('Is that all?', 'c’est fini ?')], ['pour emporter', b('to take away', 'à emporter')], ['sur place', b('to eat in', 'manger ici')]]),
      dict('Un pain aux raisins et deux croissants, s’il vous plaît.', { voice: 'm' }),
    ],
    [
      b('Qu’est-ce que je vous sers ? Avec ceci ? Ce sera tout ?', 'Qu’est-ce que je vous sers ? Avec ceci ? Ce sera tout ?'),
      b('Sur place ou pour emporter ?', 'Sur place ou pour emporter ?'),
      b('Ça vous fait… = That comes to…', 'Ça vous fait… = le total est de…'),
    ],
    [['un comptoir', b('a counter', 'meuble de service')], ['servir', b('to serve', 'donner au client')], ['emporter', b('to take away', 'prendre avec soi')]],
  ),
  lesson(C, 2, ['paying', 'payer'],
    b('Paying', 'Payer'),
    b('Understand the payment questions at the checkout.', 'Comprendre les questions de paiement à la caisse.'),
    [b('Understand card, cash and contactless', 'Comprendre carte, comptant et sans contact'), b('Understand loyalty and receipt questions', 'Comprendre les questions de fidélité et de reçu'), b('Understand a refused payment', 'Comprendre un paiement refusé')],
    13,
    [
      card(b('At the checkout', 'À la caisse'), b('**Vous payez comment ?** **Débit ou crédit ?** (Québec) **Comptant / en espèces** (cash). **Vous pouvez taper / passer votre carte** (contactless). **Vous avez la carte de fidélité ?** **Vous voulez votre reçu / votre facture ?** **Insérez votre carte.**', '**Vous payez comment ?** **Débit ou crédit ?** (Québec) **Comptant / en espèces**. **Vous pouvez taper / passer votre carte** (sans contact). **Vous avez la carte de fidélité ?** **Vous voulez votre reçu / votre facture ?** **Insérez votre carte.**')),
      hear('Débit ou crédit ? Vous pouvez taper votre carte.', b('What can you do?', 'Que pouvez-vous faire ?'), [b('Pay contactless with your card', 'Payer sans contact avec votre carte'), b('Pay only cash', 'Payer seulement en espèces'), b('Sign a cheque', 'Signer un chèque'), b('Come back later', 'Revenir plus tard')]),
      hear('Vous avez notre carte de fidélité ? Vous accumulez des points à chaque achat.', b('What is the cashier asking?', 'Que demande le caissier ?'), [b('If you have the loyalty card', 'Si vous avez la carte de fidélité'), b('If you want a bag', 'Si vous voulez un sac'), b('If you are a student', 'Si vous êtes étudiant'), b('If you paid', 'Si vous avez payé')]),
      hear('Désolée, le paiement a été refusé. Vous voulez réessayer ou payer autrement ?', b('What happened?', 'Que s’est-il passé ?'), [b('The payment was declined.', 'Le paiement a été refusé.'), b('The payment worked.', 'Le paiement a fonctionné.'), b('The shop is closed.', 'Le magasin est fermé.'), b('The price changed.', 'Le prix a changé.')]),
      tip(b('Québec vs France', 'Québec ou France'), b('Québec: **débit / crédit**, **taper sa carte**, **la facture** (receipt). France: **carte bancaire**, **sans contact**, **le ticket de caisse**. Both: **en espèces / comptant**.', 'Québec : **débit / crédit**, **taper sa carte**, **la facture**. France : **carte bancaire**, **sans contact**, **le ticket de caisse**. Partout : **en espèces / comptant**.')),
      pairs(P.match, [['comptant / en espèces', b('cash', 'billets et pièces')], ['taper sa carte', b('to tap (contactless)', 'payer sans contact')], ['le reçu', b('the receipt', 'preuve d’achat')], ['refusé', b('declined', 'non accepté')]]),
      dict('Vous voulez votre reçu dans le sac ?', { voice: 'f' }),
    ],
    [
      b('Débit ou crédit ? Comptant ? Vous pouvez taper votre carte.', 'Débit ou crédit ? Comptant ? Vous pouvez taper votre carte.'),
      b('carte de fidélité = loyalty card; reçu / facture = receipt.', 'carte de fidélité ; reçu / facture.'),
      b('paiement refusé = payment declined.', 'paiement refusé = non accepté.'),
    ],
    [['un achat', b('a purchase', 'ce qu’on achète')], ['accumuler', b('to collect, accumulate', 'amasser')], ['réessayer', b('to try again', 'essayer de nouveau')]],
  ),
  lesson(C, 3, ['pharmacy-and-bank', 'pharmacie-et-banque'],
    b('At the pharmacy and the bank', 'À la pharmacie et à la banque'),
    b('Understand the pharmacist’s questions and a bank teller’s instructions.', 'Comprendre les questions du pharmacien et les consignes d’un guichetier.'),
    [b('Understand dosage instructions', 'Comprendre la posologie'), b('Understand questions about symptoms', 'Comprendre les questions sur les symptômes'), b('Understand bank instructions', 'Comprendre les consignes bancaires')],
    13,
    [
      hear('Vous avez une ordonnance ? Sinon, je peux vous conseiller quelque chose pour la toux.', b('What does the pharmacist ask first?', 'Que demande d’abord la pharmacienne ?'), [b('If you have a prescription', 'Si vous avez une ordonnance'), b('If you have a cough', 'Si vous toussez'), b('If you are allergic', 'Si vous êtes allergique'), b('Your age', 'Votre âge')]),
      hear('Prenez un comprimé matin et soir, pendant sept jours, toujours en mangeant.', b('How should you take the medicine?', 'Comment faut-il prendre le médicament ?'), [b('One tablet morning and evening, with food, for 7 days', 'Un comprimé matin et soir, en mangeant, pendant 7 jours'), b('Seven tablets a day', 'Sept comprimés par jour'), b('One tablet at night only', 'Un comprimé le soir seulement'), b('Without eating', 'Sans manger')]),
      hear('Depuis combien de temps avez-vous de la fièvre ? Vous avez d’autres symptômes ?', b('What does the pharmacist want to know?', 'Que veut savoir le pharmacien ?'), [b('How long you have had a fever and other symptoms', 'Depuis quand vous avez de la fièvre et d’autres symptômes'), b('Your address', 'Votre adresse'), b('Your doctor’s name', 'Le nom de votre médecin'), b('The price', 'Le prix')]),
      hear('Pour ouvrir un compte, j’ai besoin de deux pièces d’identité et d’une preuve d’adresse.', b('What do you need to open an account?', 'De quoi avez-vous besoin pour ouvrir un compte ?'), [b('Two IDs and a proof of address', 'Deux pièces d’identité et une preuve d’adresse'), b('One ID only', 'Une seule pièce d’identité'), b('A job contract', 'Un contrat de travail'), b('Cash', 'De l’argent comptant')]),
      tip(b('Ask to repeat', 'Demandez de répéter'), b('For medicine and money, never guess: **Pardon, vous pouvez répéter la posologie ? Combien de fois par jour ?**', 'Pour les médicaments et l’argent, ne devinez jamais : **Pardon, vous pouvez répéter la posologie ? Combien de fois par jour ?**')),
      pairs(P.match, [['une ordonnance', b('a prescription', 'papier du médecin')], ['la toux', b('a cough', 'fait de tousser')], ['un compte', b('an account', 'compte bancaire')], ['en mangeant', b('with food', 'pendant le repas')]]),
      dict('Prenez un comprimé matin et soir pendant sept jours.', { voice: 'm' }),
    ],
    [
      b('Pharmacy: ordonnance, posologie, matin et soir, en mangeant.', 'Pharmacie : ordonnance, posologie, matin et soir, en mangeant.'),
      b('Symptoms: Depuis combien de temps… ? Vous avez d’autres symptômes ?', 'Symptômes : Depuis combien de temps… ? Vous avez d’autres symptômes ?'),
      b('Bank: ouvrir un compte, pièce d’identité, preuve d’adresse.', 'Banque : ouvrir un compte, pièce d’identité, preuve d’adresse.'),
    ],
    [['un symptôme', b('a symptom', 'signe de maladie')], ['la fièvre', b('fever', 'température élevée')], ['conseiller', b('to recommend, advise', 'recommander')]],
  ),
];
