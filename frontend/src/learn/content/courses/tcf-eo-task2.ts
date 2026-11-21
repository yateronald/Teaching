import type { CourseAbout } from '../../types';
import { b, card, dlg, doc, exam, lesson, mc, ord, P, say, sort, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'In task 2 of the TCF speaking test (about 5 minutes 30, including 2 minutes of preparation), you play a role in an everyday situation and you must obtain information from the examiner by asking questions: renting a flat, enrolling in a course, organising a trip, buying a product. The more relevant and varied your questions, the better your score. This course trains question forms, registers and the flow of the interaction.',
    'Dans la tâche 2 de l’expression orale du TCF (environ 5 min 30, dont 2 minutes de préparation), vous jouez un rôle dans une situation du quotidien et vous devez obtenir des informations de l’examinateur en posant des questions : louer un appartement, s’inscrire à un cours, organiser un voyage, acheter un produit. Plus vos questions sont pertinentes et variées, meilleure est votre note. Ce cours entraîne les formes de questions, les registres et le déroulement de l’interaction.',
  ),
  outcomes: [
    b('Use varied question forms', 'Employer des formes de questions variées'),
    b('Prepare relevant questions in 2 minutes', 'Préparer des questions pertinentes en 2 minutes'),
    b('React to answers and follow up', 'Réagir aux réponses et relancer'),
    b('Open and close the interaction', 'Ouvrir et conclure l’interaction'),
  ],
};

const C = 'tcf-eo-task2';
export default [
  lesson(C, 1, ['question-forms', 'les-formes-de-questions'],
    b('Question forms', 'Les formes de questions'),
    b('Vary your questions: intonation, est-ce que, inversion, question words.', 'Varier ses questions : intonation, est-ce que, inversion, mots interrogatifs.'),
    [b('Know task 2', 'Connaître la tâche 2'), b('Use three question structures', 'Employer trois structures de question'), b('Use question words', 'Employer les mots interrogatifs')],
    13,
    [
      exam(b('Task 2', 'Tâche 2'), b('About **5 min 30**, with **2 minutes of preparation**. You read a situation: **« Vous souhaitez louer un appartement. Vous appelez l’agence pour obtenir des informations (prix, quartier, disponibilité…). »** The examiner plays the agent. You lead: **ask many varied, relevant questions**, react, and close politely.', 'Environ **5 min 30**, avec **2 minutes de préparation**. Vous lisez une situation : **« Vous souhaitez louer un appartement. Vous appelez l’agence pour obtenir des informations (prix, quartier, disponibilité…). »** L’examinateur joue l’agent. C’est vous qui menez : **posez beaucoup de questions variées et pertinentes**, réagissez, et concluez poliment.')),
      card(b('Three structures', 'Trois structures'), b('**Intonation** (oral, simple): **L’appartement est meublé ?** **Est-ce que** (neutral): **Est-ce que les charges sont comprises ?** **Inversion** (formal, B2): **Les animaux sont-ils acceptés ? · Pourriez-vous me dire… ?** Question words: **combien, quand, où, comment, pourquoi, quel(le)(s), lequel**. Polite openers: **J’aimerais savoir si… · Pourriez-vous m’indiquer… ?**', '**Intonation** (oral, simple) : **L’appartement est meublé ?** **Est-ce que** (neutre) : **Est-ce que les charges sont comprises ?** **Inversion** (soutenu, B2) : **Les animaux sont-ils acceptés ? · Pourriez-vous me dire… ?** Mots interrogatifs : **combien, quand, où, comment, pourquoi, quel(le)(s), lequel**. Formules polies : **J’aimerais savoir si… · Pourriez-vous m’indiquer… ?**')),
      sort(b('Which structure?', 'Quelle structure ?'), [b('intonation', 'intonation'), b('est-ce que', 'est-ce que'), b('inversion / indirect', 'inversion / indirecte')], [['C’est loin du métro ?', 0], ['Est-ce qu’il y a un balcon ?', 1], ['Le chauffage est-il inclus ?', 2], ['Il y a une laverie ?', 0], ['Est-ce que je peux visiter samedi ?', 1], ['J’aimerais savoir si le bail est d’un an.', 2]]),
      mc(P.form, ['Pourriez-vous m’indiquer le montant du dépôt de garantie ?', 'Pourriez-vous m’indiquer quel est le montant du dépôt de garantie est ?', 'Vous pourriez m’indiquer combien est-ce que le dépôt ?', 'Pourriez-vous indiquer moi le dépôt ?']),
      ord(P.order, 'J’aimerais savoir si les animaux sont acceptés.', { tr: 'I’d like to know if pets are allowed.' }),
    ],
    [
      b('About 5 min 30 including 2 min preparation; you ask the questions.', 'Environ 5 min 30 dont 2 min de préparation ; c’est vous qui questionnez.'),
      b('Vary: intonation, est-ce que, inversion, indirect questions.', 'Variez : intonation, est-ce que, inversion, questions indirectes.'),
      b('Polite openers: J’aimerais savoir si… Pourriez-vous m’indiquer… ?', 'Formules polies : J’aimerais savoir si… Pourriez-vous m’indiquer… ?'),
    ],
    [['meublé', b('furnished', 'avec des meubles')], ['les charges', b('service charges', 'frais en plus du loyer')], ['le dépôt de garantie', b('the deposit', 'somme versée en garantie')]],
  ),
  lesson(C, 2, ['preparing-in-2-minutes', 'preparer-en-2-minutes'],
    b('Preparing in 2 minutes', 'Préparer en 2 minutes'),
    b('Use a question map (price, place, time, conditions, practical details) to prepare quickly.', 'Utiliser une carte des questions (prix, lieu, horaires, conditions, détails pratiques) pour préparer vite.'),
    [b('Use the question map', 'Utiliser la carte des questions'), b('Prepare 8–10 questions', 'Préparer 8 à 10 questions'), b('Order them logically', 'Les ordonner logiquement')],
    13,
    [
      card(b('The question map', 'La carte des questions'), b('For any situation, think of 5 families: **1. What / description** (Qu’est-ce que… comprend ?) **2. Price / payment** (Combien… ? On peut payer en plusieurs fois ?) **3. Place / access** (Où… ? C’est accessible en transport ?) **4. Time / dates** (Quand… ? Quels sont les horaires ?) **5. Conditions / practical** (Il faut… ? Qu’est-ce que je dois apporter ? Et si j’annule ?).', 'Pour toute situation, pensez à 5 familles : **1. Quoi / description** (Qu’est-ce que… comprend ?) **2. Prix / paiement** (Combien… ? On peut payer en plusieurs fois ?) **3. Lieu / accès** (Où… ? C’est accessible en transport ?) **4. Temps / dates** (Quand… ? Quels sont les horaires ?) **5. Conditions / pratique** (Il faut… ? Qu’est-ce que je dois apporter ? Et si j’annule ?).')),
      doc({ look: 'page', title: b('Situation', 'Situation'), text: 'Vous voulez vous inscrire à un cours de cuisine dans un centre communautaire. Vous posez des questions à l’employé(e) pour obtenir toutes les informations nécessaires.' }, b('Which question does NOT fit the situation?', 'Quelle question ne convient PAS à la situation ?'), [b('Le loyer est-il chauffé ?', 'Le loyer est-il chauffé ?'), b('Combien coûte la session ?', 'Combien coûte la session ?'), b('Les ingrédients sont-ils fournis ?', 'Les ingrédients sont-ils fournis ?'), b('Les cours ont lieu quels jours ?', 'Les cours ont lieu quels jours ?')]),
      sort(b('Which family of questions?', 'Quelle famille de questions ?'), [b('price', 'prix'), b('time', 'temps'), b('conditions / practical', 'conditions / pratique')], [['Combien coûte la session complète ?', 0], ['Les cours ont lieu le soir ?', 1], ['Faut-il apporter son tablier ?', 2], ['Il y a un tarif réduit ?', 0], ['Quand commence la prochaine session ?', 1], ['Que se passe-t-il si je manque un cours ?', 2]]),
      write(b('Your question list', 'Votre liste de questions'), b('Situation: you want to rent a bike for a week during a holiday. Write 8 varied questions (40–80 words) covering the five families.', 'Situation : vous voulez louer un vélo pour une semaine pendant les vacances. Écrivez 8 questions variées (40–80 mots) couvrant les cinq familles.'), 40, 80, [
        b('8 questions', '8 questions'),
        b('The five families covered', 'Les cinq familles couvertes'),
        b('At least two different structures', 'Au moins deux structures différentes'),
      ], 'Quels types de vélos proposez-vous ? Est-ce qu’il y a des vélos électriques ? Combien coûte la location pour une semaine ? Faut-il laisser une caution ? Où se trouve votre magasin ? Pourriez-vous me dire vos horaires d’ouverture ? Le casque et le cadenas sont-ils compris ? Que se passe-t-il en cas de crevaison ?'),
    ],
    [
      b('Five families: what, price, place, time, conditions.', 'Cinq familles : quoi, prix, lieu, temps, conditions.'),
      b('Prepare 8–10 questions in 2 minutes.', 'Préparez 8 à 10 questions en 2 minutes.'),
      b('Order them from general to specific.', 'Ordonnez-les du général au particulier.'),
    ],
    [['une caution', b('a deposit', 'somme de garantie')], ['un tablier', b('an apron', 'pour cuisiner')], ['une crevaison', b('a puncture', 'pneu percé')]],
  ),
  lesson(C, 3, ['running-the-interaction', 'mener-l-interaction'],
    b('Running the interaction', 'Mener l’interaction'),
    b('Open, ask, react, follow up and close like a real conversation.', 'Ouvrir, demander, réagir, relancer et conclure comme une vraie conversation.'),
    [b('Open the conversation', 'Ouvrir la conversation'), b('React and follow up', 'Réagir et relancer'), b('Close politely', 'Conclure poliment')],
    13,
    [
      card(b('A real conversation', 'Une vraie conversation'), b('Open: **Bonjour, je vous appelle au sujet de… J’aurais quelques questions.** React: **D’accord. · Ah, très bien. · Ah bon ? C’est un peu cher…** Follow up: **Et dans ce cas, … ? · Vous voulez dire que… ?** Close: **Parfait, merci pour toutes ces informations. Je vais réfléchir / Je vais m’inscrire. Bonne journée !**', 'Ouvrir : **Bonjour, je vous appelle au sujet de… J’aurais quelques questions.** Réagir : **D’accord. · Ah, très bien. · Ah bon ? C’est un peu cher…** Relancer : **Et dans ce cas, … ? · Vous voulez dire que… ?** Conclure : **Parfait, merci pour toutes ces informations. Je vais réfléchir / Je vais m’inscrire. Bonne journée !**')),
      dlg(b('Renting a flat', 'Louer un appartement'), undefined, [['Vous', 'f'], ['Examinateur (agent)', 'm']], [
        [0, { options: ['Bonjour, je vous appelle au sujet de l’appartement de la rue Saint-Denis. J’aurais quelques questions.', 'Allô, appartement ?', 'Je veux un appartement.'] }],
        [1, 'Oui, bien sûr. Je vous écoute.', 'Yes, of course. I’m listening.'],
        [0, { options: ['Quel est le montant du loyer, et les charges sont-elles comprises ?', 'C’est combien ?', 'Loyer ?'] }],
        [1, 'Le loyer est de 1 200 dollars, chauffage compris, mais pas l’électricité.', 'The rent is 1,200 dollars, heating included, but not electricity.'],
        [0, { options: ['D’accord. Et est-ce que l’appartement est proche des transports en commun ?', 'Trop cher, au revoir.', 'Ok.'] }],
        [1, 'Oui, il est à deux minutes du métro.', 'Yes, it’s two minutes from the metro.'],
        [0, { options: ['Parfait. Serait-il possible de le visiter samedi matin ?', 'Bien. Fin.', 'Merci, c’est tout.'] }],
      ], true),
      sort(b('Open, react or close?', 'Ouvrir, réagir ou conclure ?'), [b('open', 'ouvrir'), b('react / follow up', 'réagir / relancer'), b('close', 'conclure')], [['Je vous appelle au sujet de…', 0], ['Ah bon ? Et dans ce cas…', 1], ['Merci pour toutes ces informations.', 2], ['J’aurais quelques questions.', 0], ['Vous voulez dire que… ?', 1], ['Je vais réfléchir, bonne journée !', 2]]),
      say('Parfait, merci pour toutes ces informations. Je vais réfléchir et je vous rappelle demain. Bonne journée !', 'Perfect, thanks for all this information. I’ll think about it and call you back tomorrow. Have a nice day!'),
    ],
    [
      b('Open: Je vous appelle au sujet de… J’aurais quelques questions.', 'Ouvrir : Je vous appelle au sujet de… J’aurais quelques questions.'),
      b('React and follow up between questions.', 'Réagissez et relancez entre les questions.'),
      b('Close: Merci pour toutes ces informations…', 'Conclure : Merci pour toutes ces informations…'),
    ],
    [['au sujet de', b('about, regarding', 'concernant')], ['proche de', b('close to', 'pas loin de')], ['rappeler', b('to call back', 'téléphoner de nouveau')]],
  ),
];
