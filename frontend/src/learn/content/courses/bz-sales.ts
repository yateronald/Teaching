import type { CourseAbout } from '../../types';
import { b, card, dlg, gap, lesson, mc, ord, P, say, sort, tip, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Selling in French follows the same steps as anywhere: build rapport, discover the customer’s needs, present a solution in terms of benefits, handle objections and close. But the words, the level of formality and the cultural expectations are specific. This course trains each step of the sales conversation in French, in a shop, by phone or in a B2B meeting, with honest, customer-centred techniques.',
    'Vendre en français suit les mêmes étapes qu’ailleurs : créer le contact, découvrir les besoins du client, présenter une solution en termes de bénéfices, traiter les objections et conclure. Mais les mots, le niveau de formalité et les attentes culturelles sont propres au français. Ce cours entraîne chaque étape de l’entretien de vente, en magasin, au téléphone ou en rendez-vous professionnel, avec des techniques honnêtes et centrées sur le client.',
  ),
  outcomes: [
    b('Ask open questions to discover needs', 'Poser des questions ouvertes pour découvrir les besoins'),
    b('Present features as benefits', 'Présenter les caractéristiques comme des bénéfices'),
    b('Handle common objections', 'Traiter les objections courantes'),
    b('Close and follow up', 'Conclure et assurer le suivi'),
  ],
};

const C = 'bz-sales';
export default [
  lesson(C, 1, ['discovering-needs', 'decouvrir-les-besoins'],
    b('Discovering needs', 'Découvrir les besoins'),
    b('Use open questions and active listening before presenting anything.', 'Utiliser les questions ouvertes et l’écoute active avant de présenter quoi que ce soit.'),
    [b('Ask open questions', 'Poser des questions ouvertes'), b('Rephrase to check', 'Reformuler pour vérifier'), b('Identify the real need', 'Identifier le vrai besoin')],
    13,
    [
      card(b('Open questions', 'Les questions ouvertes'), b('Open questions make the customer talk: **Qu’est-ce qui vous amène ? · Comment utilisez-vous actuellement… ? · Qu’est-ce qui est le plus important pour vous ? · Quels problèmes rencontrez-vous ?** Rephrase: **Si je comprends bien, vous cherchez une solution simple, que toute l’équipe puisse utiliser, c’est bien ça ?**', 'Les questions ouvertes font parler le client : **Qu’est-ce qui vous amène ? · Comment utilisez-vous actuellement… ? · Qu’est-ce qui est le plus important pour vous ? · Quels problèmes rencontrez-vous ?** Reformuler : **Si je comprends bien, vous cherchez une solution simple, que toute l’équipe puisse utiliser, c’est bien ça ?**')),
      sort(b('Open or closed question?', 'Question ouverte ou fermée ?'), [b('open', 'ouverte'), b('closed (yes/no)', 'fermée (oui/non)')], [['Qu’est-ce qui est important pour vous ?', 0], ['Vous voulez la version pro ?', 1], ['Comment travaillez-vous aujourd’hui ?', 0], ['Vous avez un budget ?', 1], ['Quels problèmes rencontrez-vous ?', 0], ['C’est pour vous ?', 1]]),
      mc(P.best, ['Si je comprends bien, la priorité, c’est un appareil léger avec une longue autonomie, c’est bien ça ?', 'D’accord, prenez celui-là.', 'Tout le monde dit ça.', 'Vous ne savez pas ce que vous voulez.'], { fr: '— Je voyage beaucoup, et mon ordinateur actuel est lourd et ne tient pas deux heures.' }),
      dlg(b('In a bike shop', 'Dans un magasin de vélos'), undefined, [['Vous', 'm'], ['Client', 'm']], [
        [0, { options: ['Bonjour ! Qu’est-ce qui vous amène aujourd’hui ?', 'Vous achetez quoi ?', 'On a des promos, prenez-en un.'] }],
        [1, 'Je cherche un vélo pour aller au travail.', 'I’m looking for a bike to get to work.'],
        [0, { options: ['Très bien. Vous faites combien de kilomètres, et le trajet est plutôt plat ou en côte ?', 'Prenez le plus cher.', 'D’accord, celui-là.'] }],
        [1, 'Douze kilomètres, avec une grosse côte à la fin.', 'Twelve kilometres, with a big hill at the end.'],
        [0, { options: ['Si je comprends bien, un vélo à assistance électrique pourrait vous éviter d’arriver épuisé, c’est ça ?', 'Ah, c’est loin, bon courage.', 'Alors prenez un vélo d’enfant.'] }],
      ]),
      say('Qu’est-ce qui est le plus important pour vous ? Comment travaillez-vous actuellement ?', 'What matters most to you? How do you work at the moment?'),
    ],
    [
      b('Start with open questions: Qu’est-ce qui… ? Comment… ? Quels… ?', 'Commencez par des questions ouvertes : Qu’est-ce qui… ? Comment… ? Quels… ?'),
      b('Listen more than you talk.', 'Écoutez plus que vous ne parlez.'),
      b('Rephrase: Si je comprends bien, … c’est bien ça ?', 'Reformulez : Si je comprends bien, … c’est bien ça ?'),
    ],
    [['l’autonomie', b('battery life', 'durée de la batterie')], ['une côte', b('a hill, a slope', 'montée')], ['un trajet', b('a journey, a commute', 'parcours')]],
  ),
  lesson(C, 2, ['presenting-benefits', 'presenter-les-benefices'],
    b('Presenting benefits', 'Présenter les bénéfices'),
    b('Turn product features into concrete benefits for this customer.', 'Transformer les caractéristiques du produit en bénéfices concrets pour ce client.'),
    [b('Distinguish feature and benefit', 'Distinguer caractéristique et bénéfice'), b('Use « ce qui vous permet de… »', 'Utiliser « ce qui vous permet de… »'), b('Link to the customer’s need', 'Relier au besoin du client')],
    13,
    [
      card(b('Feature → benefit', 'Caractéristique → bénéfice'), b('A **feature** describes the product; a **benefit** says what it changes for the customer. Link them with **ce qui vous permet de… · grâce à… · concrètement, pour vous, ça veut dire que…**: **La batterie dure 12 heures, ce qui vous permet de travailler toute la journée sans chargeur.**', 'Une **caractéristique** décrit le produit ; un **bénéfice** dit ce qu’il change pour le client. Reliez-les avec **ce qui vous permet de… · grâce à… · concrètement, pour vous, ça veut dire que…** : **La batterie dure 12 heures, ce qui vous permet de travailler toute la journée sans chargeur.**')),
      sort(b('Feature or benefit?', 'Caractéristique ou bénéfice ?'), [b('feature', 'caractéristique'), b('benefit', 'bénéfice')], [['Il pèse 1,1 kg.', 0], ['Vous le glissez dans votre sac sans le sentir.', 1], ['Le logiciel est en ligne.', 0], ['Votre équipe y accède de partout.', 1], ['Garantie trois ans.', 0], ['Vous êtes tranquille jusqu’en 2029.', 1]]),
      mc(P.best, ['Ce vélo a une assistance jusqu’à 25 km/h, ce qui vous permet de monter votre côte sans transpirer et d’arriver frais au bureau.', 'Ce vélo a une assistance de 25 km/h.', 'C’est le meilleur vélo du monde, croyez-moi.', 'Il est rouge et très joli.'], { fr: 'Présentez le bénéfice pour le client qui a une grosse côte :' }),
      gap(P.complete, 'Le logiciel se met à jour automatiquement, ce qui vous ___ de gagner du temps. ___ , vous n’avez plus rien à installer.', ['permet', 'Concrètement']),
      ord(P.order, 'Grâce à cette option, vous gagnez une heure par jour.', { tr: 'Thanks to this option, you save an hour a day.' }),
      say('La batterie dure douze heures, ce qui vous permet de travailler toute la journée sans chargeur.', 'The battery lasts twelve hours, which lets you work all day without a charger.'),
    ],
    [
      b('Feature = what it is; benefit = what it changes for the customer.', 'Caractéristique = ce que c’est ; bénéfice = ce que ça change pour le client.'),
      b('Link: ce qui vous permet de…, grâce à…, concrètement…', 'Lien : ce qui vous permet de…, grâce à…, concrètement…'),
      b('Choose the benefits that match the needs you heard.', 'Choisissez les bénéfices qui répondent aux besoins entendus.'),
    ],
    [['une caractéristique', b('a feature', 'propriété du produit')], ['un bénéfice', b('a benefit', 'avantage pour le client')], ['transpirer', b('to sweat', 'avoir chaud et mouillé')]],
  ),
  lesson(C, 3, ['objections-and-closing', 'objections-et-conclusion'],
    b('Objections and closing', 'Objections et conclusion'),
    b('Welcome objections, answer them honestly and propose a clear next step.', 'Accueillir les objections, y répondre honnêtement et proposer une prochaine étape claire.'),
    [b('Welcome the objection', 'Accueillir l’objection'), b('Answer price objections', 'Répondre à l’objection du prix'), b('Close and follow up', 'Conclure et faire le suivi')],
    13,
    [
      card(b('The objection method', 'La méthode de l’objection'), b('1. **Welcome**: **Je comprends tout à fait. · C’est une question légitime.** 2. **Clarify**: **Qu’est-ce qui vous fait hésiter exactement ?** 3. **Answer** with facts: **C’est vrai, c’est un investissement. Mais sur trois ans, cela représente…** 4. **Close**: **Qu’en pensez-vous ? · Je vous propose de l’essayer cette semaine. · Je vous envoie la proposition aujourd’hui ?**', '1. **Accueillir** : **Je comprends tout à fait. · C’est une question légitime.** 2. **Préciser** : **Qu’est-ce qui vous fait hésiter exactement ?** 3. **Répondre** avec des faits : **C’est vrai, c’est un investissement. Mais sur trois ans, cela représente…** 4. **Conclure** : **Qu’en pensez-vous ? · Je vous propose de l’essayer cette semaine. · Je vous envoie la proposition aujourd’hui ?**')),
      tip(b('Honesty sells', 'L’honnêteté fait vendre'), b('If your product does not fit the need, say so: **« Pour votre usage, ce modèle-ci serait plus adapté, et il est moins cher. »** A customer who trusts you comes back and recommends you.', 'Si votre produit ne répond pas au besoin, dites-le : **« Pour votre usage, ce modèle-ci serait plus adapté, et il est moins cher. »** Un client qui vous fait confiance revient et vous recommande.')),
      mc(P.best, ['Je comprends tout à fait. C’est un investissement, mais vous économisez environ 90 € par mois de transport : il est remboursé en moins de deux ans.', 'Non, ce n’est pas cher.', 'Si vous n’avez pas d’argent, ce n’est pas pour vous.', 'Tout le monde l’achète quand même.'], { fr: '— 2 000 €, c’est trop cher pour moi.' }),
      sort(b('Which step?', 'Quelle étape ?'), [b('welcome', 'accueillir'), b('clarify', 'préciser'), b('close', 'conclure')], [['C’est une question légitime.', 0], ['Qu’est-ce qui vous fait hésiter ?', 1], ['Je vous envoie la proposition aujourd’hui ?', 2], ['Je comprends tout à fait.', 0], ['C’est le prix ou le délai qui vous inquiète ?', 1], ['Je vous propose un essai gratuit.', 2]]),
      write(b('Follow-up email', 'Courriel de suivi'), b('Write a short follow-up email (40–70 words) after a sales meeting: thank the client, recall their need and the benefit, propose a concrete next step.', 'Rédigez un court courriel de suivi (40–70 mots) après un rendez-vous commercial : remerciez le client, rappelez son besoin et le bénéfice, proposez une prochaine étape concrète.'), 40, 70, [
        b('Thanks', 'Remerciement'),
        b('Need + benefit', 'Besoin + bénéfice'),
        b('Concrete next step with a date', 'Prochaine étape concrète avec une date'),
      ], 'Bonjour Madame Lefort, merci pour notre échange de ce matin. Vous cherchez un outil simple pour suivre les commandes de vos trois boutiques : notre logiciel vous permettrait de tout voir sur un seul écran. Je vous propose un essai gratuit de deux semaines à partir de lundi. Je vous appelle jeudi pour en parler. Bien cordialement, Malik Diop'),
    ],
    [
      b('Welcome → clarify → answer with facts → close.', 'Accueillir → préciser → répondre avec des faits → conclure.'),
      b('Close with a concrete step: essai, proposition, rendez-vous.', 'Conclure par une étape concrète : essai, proposition, rendez-vous.'),
      b('Be honest: recommend what really fits.', 'Soyez honnête : recommandez ce qui convient vraiment.'),
    ],
    [['légitime', b('legitimate', 'justifié')], ['hésiter', b('to hesitate', 'ne pas être sûr')], ['un essai gratuit', b('a free trial', 'test sans payer')]],
  ),
];
