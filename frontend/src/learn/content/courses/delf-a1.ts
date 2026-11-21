import type { CourseAbout } from '../../types';
import { b, dlg, doc, exam, hear, lesson, mc, P, say, sort, tip, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'The DELF A1 is the first official French diploma, recognised worldwide and valid for life. This course walks you through its four tests (listening, reading, writing, speaking), shows what examiners expect at A1, and trains each task with realistic practice: understanding short announcements and messages, filling in a form, writing a short message, and the three parts of the oral test. Check the official exam centre for the latest format details.',
    'Le DELF A1 est le premier diplôme officiel de français, reconnu dans le monde entier et valable à vie. Ce cours vous présente ses quatre épreuves (compréhension de l’oral, des écrits, production écrite, production orale), montre ce qu’attendent les correcteurs au niveau A1, et entraîne chaque tâche avec des exercices réalistes : comprendre de courtes annonces et messages, remplir un formulaire, écrire un court message, et les trois parties de l’oral. Vérifiez auprès du centre d’examen les derniers détails du format.',
  ),
  outcomes: [
    b('Know the format and scoring of the DELF A1', 'Connaître le format et la notation du DELF A1'),
    b('Handle the listening and reading tasks', 'Réussir les tâches de compréhension'),
    b('Fill in a form and write a short message', 'Remplir un formulaire et écrire un court message'),
    b('Succeed in the three parts of the oral', 'Réussir les trois parties de l’oral'),
  ],
};

const C = 'delf-a1';
export default [
  lesson(C, 1, ['format-and-comprehension', 'format-et-comprehension'],
    b('The exam and the comprehension tests', 'L’examen et les épreuves de compréhension'),
    b('Understand the four tests, the scoring and strategies for listening and reading.', 'Comprendre les quatre épreuves, la notation et les stratégies de compréhension.'),
    [b('Know the four tests', 'Connaître les quatre épreuves'), b('Know the pass mark', 'Connaître le seuil de réussite'), b('Use strategies for short documents', 'Utiliser des stratégies pour les documents courts')],
    13,
    [
      exam(b('The DELF A1 in brief', 'Le DELF A1 en bref'), b('Four tests, each marked **out of 25** (total /100): **compréhension de l’oral** (about 20 min), **compréhension des écrits** (about 30 min), **production écrite** (about 30 min), **production orale** (5–7 min, with preparation for one part). To pass: **50/100**, with **at least 5/25** in each test.', 'Quatre épreuves, chacune notée **sur 25** (total /100) : **compréhension de l’oral** (environ 20 min), **compréhension des écrits** (environ 30 min), **production écrite** (environ 30 min), **production orale** (5 à 7 min, avec préparation pour une partie). Pour réussir : **50/100**, avec **au moins 5/25** dans chaque épreuve.')),
      tip(b('Read the questions first', 'Lisez d’abord les questions'), b('Before each recording, **read the questions** and underline the key words (heure, prix, lieu). You then know what to listen for. Recordings are usually played **twice**.', 'Avant chaque enregistrement, **lisez les questions** et soulignez les mots clés (heure, prix, lieu). Vous savez alors quoi écouter. Les enregistrements passent généralement **deux fois**.')),
      hear('Mesdames et messieurs, le train pour Lyon partira avec vingt minutes de retard, à dix heures quarante, voie six.', b('What time will the train leave?', 'À quelle heure partira le train ?'), [b('10:40', '10 h 40'), b('10:20', '10 h 20'), b('6:40', '6 h 40'), b('10:00', '10 h')], { voice: 'f' }),
      doc({ look: 'notice', title: b('Notice', 'Affiche'), text: 'BIBLIOTHÈQUE MUNICIPALE\nOuverte du mardi au samedi, de 10 h à 18 h\nFermée le dimanche et le lundi\nAtelier lecture pour enfants : mercredi à 15 h' }, b('When is the children’s reading workshop?', 'Quand a lieu l’atelier lecture pour enfants ?'), [b('Wednesday at 3 p.m.', 'mercredi à 15 h'), b('Monday at 10 a.m.', 'lundi à 10 h'), b('Saturday at 6 p.m.', 'samedi à 18 h'), b('Sunday', 'dimanche')]),
      sort(b('Which test?', 'Quelle épreuve ?'), [b('comprehension', 'compréhension'), b('production', 'production')], [['écouter une annonce', 0], ['remplir un formulaire', 1], ['lire une affiche', 0], ['parler de soi', 1], ['lire un message', 0], ['écrire une carte postale', 1]]),
      mc(P.choose, [b('50/100, with at least 5/25 in each test', '50/100, avec au moins 5/25 dans chaque épreuve'), b('60/100', '60/100'), b('25/100', '25/100'), b('50/100, even with 0 in one test', '50/100, même avec 0 dans une épreuve')], { fr: 'Pour obtenir le DELF A1, il faut :' }),
    ],
    [
      b('4 tests × 25 points; pass = 50/100 and 5/25 minimum per test.', '4 épreuves × 25 points ; réussite = 50/100 et 5/25 minimum par épreuve.'),
      b('Read questions before listening; recordings are played twice.', 'Lisez les questions avant d’écouter ; deux écoutes.'),
      b('Look for numbers, times, places and prices.', 'Repérez nombres, heures, lieux et prix.'),
    ],
    [['une épreuve', b('a test (part of an exam)', 'partie d’un examen')], ['un atelier', b('a workshop', 'activité pratique')], ['une voie', b('a platform (train)', 'quai')]],
  ),
  lesson(C, 2, ['the-writing-test', 'la-production-ecrite'],
    b('The writing test', 'La production écrite'),
    b('Fill in a form and write a short personal message.', 'Remplir un formulaire et écrire un court message personnel.'),
    [b('Fill in a form correctly', 'Remplir correctement un formulaire'), b('Write a short message (about 40 words)', 'Écrire un court message (environ 40 mots)'), b('Respect the instructions', 'Respecter la consigne')],
    13,
    [
      exam(b('Two tasks', 'Deux tâches'), b('**Exercise 1**: fill in a **form** (fiche d’inscription, hotel, club): nom, prénom, nationalité, adresse, date de naissance, profession… **Exercise 2**: write a short **message, postcard or invitation** (around 40 words) on a familiar topic. The examiner checks: **the instructions are followed**, simple sentences are correct, basic vocabulary is appropriate.', '**Exercice 1** : remplir un **formulaire** (fiche d’inscription, hôtel, club) : nom, prénom, nationalité, adresse, date de naissance, profession… **Exercice 2** : écrire un court **message, une carte postale ou une invitation** (environ 40 mots) sur un sujet familier. Le correcteur vérifie : **la consigne est respectée**, les phrases simples sont correctes, le vocabulaire de base est adapté.')),
      doc({ look: 'page', title: b('Registration form (practice)', 'Fiche d’inscription (entraînement)'), text: 'CLUB DE TENNIS — INSCRIPTION\nNom : ……\nPrénom : ……\nDate de naissance : ……\nNationalité : ……\nAdresse : ……\nCourriel : ……\nJours souhaités : ……' }, b('What do you write after « Date de naissance » ?', 'Que faut-il écrire après « Date de naissance » ?'), [b('the day, month and year you were born', 'le jour, le mois et l’année où vous êtes né(e)'), b('today’s date', 'la date d’aujourd’hui'), b('your age', 'votre âge'), b('your city', 'votre ville')]),
      mc(P.best, ['Salut Marie ! Je suis à Nice avec ma sœur. Il fait beau et chaud. Le matin, on va à la plage et le soir, on mange au restaurant. C’est super ! Bisous, Ana', 'Nice. Plage. Beau. Ana.', 'Je suis Ana. Je m’appelle Ana. J’ai 25 ans. J’habite à Lima.', 'Nice est une ville de France située au bord de la mer Méditerranée.'], { fr: 'Consigne : « Vous êtes en vacances. Écrivez une carte postale à une amie (40 mots environ) : où vous êtes, le temps, vos activités. » Quelle réponse est la meilleure ?' }),
      write(b('A1 writing task', 'Tâche écrite A1'), b('Instruction: You invite a friend to your birthday party. Write a message (35–50 words): day, time, place, what to bring.', 'Consigne : Vous invitez un ami à votre fête d’anniversaire. Écrivez un message (35–50 mots) : jour, heure, lieu, ce qu’il faut apporter.'), 35, 50, [
        b('Greeting and closing', 'Salutation et formule finale'),
        b('Day, time, place', 'Jour, heure, lieu'),
        b('What to bring', 'Ce qu’il faut apporter'),
      ], 'Salut Tom ! Samedi 12 mai, je fête mon anniversaire chez moi, 5 rue des Lilas, à partir de 19 heures. Il y a de la musique et un grand gâteau. Tu peux apporter une boisson ? Réponds-moi vite ! À samedi, Léa', { phrases: ['Salut…', 'samedi … à … heures', 'Tu peux apporter… ?', 'À samedi !'] }),
      tip(b('Count your words', 'Comptez vos mots'), b('Respect the **length** (« 40 mots environ ») and **every point** of the instruction. Missing a point (e.g. the time) costs points even if your French is correct.', 'Respectez la **longueur** (« 40 mots environ ») et **chaque point** de la consigne. Oublier un point (par ex. l’heure) coûte des points même si votre français est correct.')),
    ],
    [
      b('Exercise 1: a form; Exercise 2: a message of about 40 words.', 'Exercice 1 : un formulaire ; exercice 2 : un message d’environ 40 mots.'),
      b('Answer every point of the instruction.', 'Répondez à chaque point de la consigne.'),
      b('Greeting + content + closing.', 'Salutation + contenu + formule finale.'),
    ],
    [['une consigne', b('an instruction (exam)', 'ce qu’il faut faire')], ['une fiche', b('a form, a card', 'formulaire')], ['apporter', b('to bring', 'venir avec')]],
  ),
  lesson(C, 3, ['the-speaking-test', 'la-production-orale'],
    b('The speaking test', 'La production orale'),
    b('Prepare the three parts: guided interview, exchange of information, simulated dialogue.', 'Préparer les trois parties : entretien dirigé, échange d’informations, dialogue simulé.'),
    [b('Introduce yourself (guided interview)', 'Se présenter (entretien dirigé)'), b('Ask questions from word cards', 'Poser des questions à partir de cartes'), b('Role-play a shopping situation', 'Jouer une situation d’achat')],
    13,
    [
      exam(b('Three parts', 'Trois parties'), b('1. **Entretien dirigé** (about 1 min): the examiner asks about you: name, age, family, job, hobbies. 2. **Échange d’informations** (about 2 min): you take cards with words (« Profession ? », « Sport ? ») and **ask the examiner questions**. 3. **Dialogue simulé** (about 2 min, after a short preparation): a role-play, e.g. buying something, with pictures of objects and prices.', '1. **Entretien dirigé** (environ 1 min) : l’examinateur vous pose des questions sur vous : nom, âge, famille, travail, loisirs. 2. **Échange d’informations** (environ 2 min) : vous tirez des cartes avec des mots (« Profession ? », « Sport ? ») et vous **posez des questions à l’examinateur**. 3. **Dialogue simulé** (environ 2 min, après une courte préparation) : un jeu de rôle, par ex. un achat, avec des images d’objets et des prix.')),
      say('Je m’appelle Ana, j’ai vingt-huit ans, je suis péruvienne. J’habite à Paris depuis un an. Je suis infirmière et j’aime la danse.', 'My name is Ana, I’m twenty-eight, I’m Peruvian. I’ve lived in Paris for a year. I’m a nurse and I like dancing.'),
      sort(b('Card word → question', 'Mot de la carte → question'), [b('Profession ?', 'Profession ?'), b('Sport ?', 'Sport ?'), b('Habiter ?', 'Habiter ?')], [['Qu’est-ce que vous faites dans la vie ?', 0], ['Vous faites du sport ?', 1], ['Où est-ce que vous habitez ?', 2], ['Quel est votre métier ?', 0], ['Quel sport préférez-vous ?', 1], ['Vous habitez en ville ?', 2]]),
      dlg(b('Simulated dialogue: at the market', 'Dialogue simulé : au marché'), undefined, [['Examinateur (vendeur)', 'm'], ['Vous', 'f']], [
        [0, 'Bonjour madame, vous désirez ?', 'Hello madam, what would you like?'],
        [1, { options: ['Bonjour, je voudrais un kilo de tomates, s’il vous plaît. C’est combien ?', 'Tomates.', 'Je veux.'] }],
        [0, 'Trois euros le kilo. Et avec ça ?', 'Three euros a kilo. Anything else?'],
        [1, { options: ['Deux melons, s’il vous plaît. Ça fait combien en tout ?', 'Rien. Au revoir.', 'C’est cher, non.'] }],
        [0, 'Ça fait sept euros.', 'That’s seven euros.'],
        [1, { options: ['Voilà dix euros. Merci, bonne journée !', 'Je ne paie pas.', 'Sept ?'] }],
      ]),
      tip(b('Vous with the examiner', 'Vous avec l’examinateur'), b('Use **vous** with the examiner (except if the role-play is with a friend). Greet (**Bonjour**) and thank (**Merci, au revoir**): politeness is part of the mark.', 'Utilisez **vous** avec l’examinateur (sauf si le jeu de rôle est avec un ami). Saluez (**Bonjour**) et remerciez (**Merci, au revoir**) : la politesse fait partie de la note.')),
      mc(P.best, ['Vous avez des enfants ?', 'Enfants ?', 'Tu as enfants ?', 'Des enfants vous ?'], { fr: 'Vous tirez la carte « Enfants ? ». Quelle question posez-vous à l’examinateur ?' }),
    ],
    [
      b('Part 1: present yourself (name, age, job, family, hobbies).', 'Partie 1 : se présenter (nom, âge, métier, famille, loisirs).'),
      b('Part 2: turn card words into questions with vous.', 'Partie 2 : transformer les mots des cartes en questions avec vous.'),
      b('Part 3: role-play with greetings, prices and thanks.', 'Partie 3 : jeu de rôle avec salutations, prix et remerciements.'),
    ],
    [['un examinateur', b('an examiner', 'qui fait passer l’oral')], ['tirer une carte', b('to draw a card', 'prendre une carte')], ['un jeu de rôle', b('a role-play', 'simulation')]],
  ),
];
