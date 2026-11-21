import type { CourseAbout } from '../../types';
import { b, card, dlg, doc, exam, gap, hear, lesson, mc, P, say, sort, tip, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'The DELF A2 speaking test lasts about 6 to 8 minutes, with 10 minutes of preparation, and has three parts: a guided interview, a short monologue and an interaction (role-play). This course trains each part with model answers, useful phrases and the criteria examiners use, so you can speak with confidence and collect every possible point. Check your exam centre for the latest details.',
    'L’épreuve orale du DELF A2 dure environ 6 à 8 minutes, avec 10 minutes de préparation, et comporte trois parties : un entretien dirigé, un monologue suivi et un exercice en interaction (jeu de rôle). Ce cours entraîne chaque partie avec des réponses modèles, des formules utiles et les critères des examinateurs, pour parler avec assurance et obtenir tous les points possibles. Vérifiez les derniers détails auprès de votre centre d’examen.',
  ),
  outcomes: [
    b('Answer personal questions fluently', 'Répondre avec aisance aux questions personnelles'),
    b('Speak for about 2 minutes on a topic', 'Parler environ 2 minutes sur un sujet'),
    b('Succeed in the role-play', 'Réussir le jeu de rôle'),
    b('Know the assessment criteria', 'Connaître les critères d’évaluation'),
  ],
};

const C = 'delf-a2-oral';
export default [
  lesson(C, 1, ['guided-interview', 'l-entretien-dirige'],
    b('Part 1: the guided interview', 'Partie 1 : l’entretien dirigé'),
    b('Introduce yourself and answer questions about your life, without preparation.', 'Se présenter et répondre aux questions sur sa vie, sans préparation.'),
    [b('Present yourself in several sentences', 'Se présenter en plusieurs phrases'), b('Develop answers with parce que, et, mais', 'Développer avec parce que, et, mais'), b('Talk about past and future', 'Parler du passé et du futur')],
    13,
    [
      exam(b('The guided interview', 'L’entretien dirigé'), b('About **1.5 minutes**, no preparation. The examiner asks about you: **family, work or studies, home, hobbies, last holidays, plans**. Give **developed answers** (2–3 sentences), not just « oui » or « non ».', 'Environ **1 min 30**, sans préparation. L’examinateur vous interroge : **famille, travail ou études, logement, loisirs, dernières vacances, projets**. Donnez des **réponses développées** (2 ou 3 phrases), pas seulement « oui » ou « non ».')),
      mc(P.best, ['Oui, j’adore le sport. Je fais du vélo le week-end avec mes amis, et l’hiver, je vais à la piscine deux fois par semaine.', 'Oui.', 'Oui, sport.', 'Je ne sais pas.'], { fr: '— Vous faites du sport ?' }),
      mc(P.best, ['L’été dernier, je suis allée en Espagne avec ma famille. Nous avons visité Barcelone et nous avons beaucoup mangé !', 'Espagne.', 'Je vais en Espagne.', 'Les vacances, c’est bien.'], { fr: '— Parlez-moi de vos dernières vacances.' }),
      say('Je m’appelle Karim. Je suis marié et j’ai deux enfants. Je travaille dans un hôpital, je suis aide-soignant. Le week-end, j’aime cuisiner pour ma famille.', 'My name is Karim. I’m married with two children. I work in a hospital as a care assistant. At weekends I like cooking for my family.'),
      gap(P.complete, 'J’habite à Lyon ___ trois ans. J’aime ma ville ___ elle est animée, ___ les loyers sont chers.', ['depuis', 'parce qu’', 'mais']),
      tip(b('Expand your answers', 'Développez vos réponses'), b('A simple formula: **answer + detail + example** — « Oui, j’aime cuisiner (answer), surtout des plats de mon pays (detail) : hier, j’ai fait un couscous (example). »', 'Une formule simple : **réponse + détail + exemple** — « Oui, j’aime cuisiner (réponse), surtout des plats de mon pays (détail) : hier, j’ai fait un couscous (exemple). »')),
    ],
    [
      b('About 1.5 min, no preparation, questions about you.', 'Environ 1 min 30, sans préparation, questions sur vous.'),
      b('Answer + detail + example.', 'Réponse + détail + exemple.'),
      b('Use past (passé composé) and future (je vais…).', 'Employez le passé (passé composé) et le futur (je vais…).'),
    ],
    [['un aide-soignant', b('a care assistant', 'aide à l’hôpital')], ['un loyer', b('a rent', 'prix du logement')], ['développer', b('to expand', 'donner plus de détails')]],
  ),
  lesson(C, 2, ['the-monologue', 'le-monologue-suivi'],
    b('Part 2: the monologue', 'Partie 2 : le monologue suivi'),
    b('Talk for about 2 minutes on a familiar topic drawn at random.', 'Parler environ 2 minutes sur un sujet familier tiré au sort.'),
    [b('Plan in 3 points', 'Planifier en 3 points'), b('Link ideas', 'Enchaîner les idées'), b('Give examples from your life', 'Donner des exemples personnels')],
    13,
    [
      exam(b('The monologue', 'Le monologue suivi'), b('You draw **two topics** and choose one, then talk for about **2 minutes** (preparation is shared with part 3). Typical topics: **Parlez de votre meilleur ami. · Décrivez votre ville. · Racontez une fête importante. · Quel est votre plat préféré ?** The examiner may ask one or two questions.', 'Vous tirez **deux sujets** et en choisissez un, puis vous parlez environ **2 minutes** (préparation commune avec la partie 3). Sujets typiques : **Parlez de votre meilleur ami. · Décrivez votre ville. · Racontez une fête importante. · Quel est votre plat préféré ?** L’examinateur peut poser une ou deux questions.')),
      card(b('A simple plan', 'Un plan simple'), b('**Introduction**: Je vais vous parler de… **Point 1**: description (qui / quoi / où). **Point 2**: an anecdote in the past (une fois, l’année dernière…). **Point 3**: your feelings / opinion (j’aime…, parce que…). **Conclusion**: Voilà, c’est pour ça que… Connectors: **d’abord, ensuite, aussi, par exemple, enfin**.', '**Introduction** : Je vais vous parler de… **Point 1** : description (qui / quoi / où). **Point 2** : une anecdote au passé (une fois, l’année dernière…). **Point 3** : vos sentiments / votre avis (j’aime…, parce que…). **Conclusion** : Voilà, c’est pour ça que… Connecteurs : **d’abord, ensuite, aussi, par exemple, enfin**.')),
      sort(b('Which part of the plan?', 'Quelle partie du plan ?'), [b('introduction', 'introduction'), b('anecdote', 'anecdote'), b('conclusion', 'conclusion')], [['Je vais vous parler de ma grand-mère.', 0], ['Un jour, elle m’a appris à faire du pain.', 1], ['Voilà, c’est pour ça qu’elle est importante pour moi.', 2], ['Mon sujet, c’est mon quartier.', 0], ['L’année dernière, il y a eu une grande fête.', 1], ['Pour conclure, j’adore mon quartier.', 2]]),
      hear('Je vais vous parler de mon plat préféré : le mafé. C’est un plat du Sénégal, avec de la viande, des légumes et une sauce à l’arachide. Ma mère le prépare le dimanche. La dernière fois, j’ai invité des amis français et ils ont adoré !', b('When does her mother cook it?', 'Quand sa mère le prépare-t-elle ?'), [b('on Sundays', 'le dimanche'), b('every day', 'tous les jours'), b('for birthdays only', 'seulement pour les anniversaires'), b('never', 'jamais')], { voice: 'f' }),
      write(b('Plan your monologue', 'Préparez votre monologue'), b('Topic: « Parlez d’un lieu que vous aimez. » Write the notes for your 2-minute talk (40–70 words) in 3 points.', 'Sujet : « Parlez d’un lieu que vous aimez. » Rédigez les notes de votre exposé de 2 minutes (40–70 mots) en 3 points.'), 40, 70, [
        b('Description', 'Description'),
        b('An anecdote in the past', 'Une anecdote au passé'),
        b('Why you like it', 'Pourquoi vous l’aimez'),
      ], 'Je vais vous parler du parc près de chez moi. D’abord, c’est un grand parc avec un lac et beaucoup d’arbres. Ensuite, l’été dernier, j’y ai fait un pique-nique avec mes collègues : c’était très sympa. Enfin, j’aime ce parc parce que c’est calme et je peux lire au soleil. Voilà !'),
      say('Je vais vous parler de mon meilleur ami. Il s’appelle Paul, il est drôle et très généreux.', 'I’m going to talk about my best friend. His name is Paul, he is funny and very generous.'),
    ],
    [
      b('Choose one of two topics; about 2 minutes.', 'Choisissez un des deux sujets ; environ 2 minutes.'),
      b('Plan: introduction, description, anecdote, opinion, conclusion.', 'Plan : introduction, description, anecdote, avis, conclusion.'),
      b('Connectors: d’abord, ensuite, par exemple, enfin.', 'Connecteurs : d’abord, ensuite, par exemple, enfin.'),
    ],
    [['tirer au sort', b('to draw at random', 'choisir au hasard')], ['une anecdote', b('an anecdote', 'petite histoire vraie')], ['généreux', b('generous', 'qui donne facilement')]],
  ),
  lesson(C, 3, ['the-interaction', 'l-exercice-en-interaction'],
    b('Part 3: the interaction', 'Partie 3 : l’exercice en interaction'),
    b('Play an everyday situation with the examiner: ask, explain, negotiate, conclude.', 'Jouer une situation du quotidien avec l’examinateur : demander, expliquer, négocier, conclure.'),
    [b('Understand the role card', 'Comprendre la carte de jeu de rôle'), b('Ask questions and react', 'Poser des questions et réagir'), b('Conclude the exchange politely', 'Conclure poliment l’échange')],
    13,
    [
      exam(b('The interaction', 'L’exercice en interaction'), b('About **3–4 minutes**. You choose one of two situations: **buy a train ticket, return an item, organise an outing with a friend, book a hotel room…** The examiner plays the other person. Assessment: **politeness and register, ability to ask for and give information, vocabulary and grammar adapted to A2**.', 'Environ **3 à 4 minutes**. Vous choisissez une des deux situations : **acheter un billet de train, rapporter un article, organiser une sortie avec un ami, réserver une chambre…** L’examinateur joue l’autre personne. Critères : **politesse et registre, capacité à demander et donner des informations, lexique et grammaire adaptés au niveau A2**.')),
      doc({ look: 'page', title: b('Role card', 'Carte de jeu de rôle'), text: 'Vous avez acheté un pull hier dans un magasin. Il est trop petit. Vous retournez au magasin pour l’échanger. L’examinateur joue le rôle du vendeur.' }, b('What must you do?', 'Que devez-vous faire ?'), [b('exchange a sweater that is too small', 'échanger un pull trop petit'), b('buy a new sweater', 'acheter un nouveau pull'), b('complain about the price', 'se plaindre du prix'), b('book a fitting room', 'réserver une cabine')]),
      dlg(b('Returning a sweater', 'Rapporter un pull'), undefined, [['Examinateur (vendeur)', 'm'], ['Vous', 'f']], [
        [0, 'Bonjour madame, je peux vous aider ?', 'Hello madam, can I help you?'],
        [1, { options: ['Bonjour, j’ai acheté ce pull hier, mais il est trop petit. Est-ce que je peux l’échanger ?', 'Pull petit.', 'Je veux un autre.'] }],
        [0, 'Bien sûr. Vous avez le ticket de caisse ?', 'Of course. Do you have the receipt?'],
        [1, { options: ['Oui, le voici. Vous l’avez en taille M, en bleu ?', 'Non.', 'Pourquoi un ticket ?'] }],
        [0, 'En bleu, non, mais en gris, oui.', 'Not in blue, but in grey, yes.'],
        [1, { options: ['D’accord, je prends le gris. Merci beaucoup, au revoir !', 'Non, bleu ou rien.', 'Gris, c’est moche.'] }],
      ]),
      sort(b('Which phase of the role-play?', 'Quelle phase du jeu de rôle ?'), [b('opening', 'ouverture'), b('request / negotiation', 'demande / négociation'), b('closing', 'clôture')], [['Bonjour, excusez-moi…', 0], ['Est-ce que je peux l’échanger ?', 1], ['Merci beaucoup, au revoir !', 2], ['Bonjour monsieur.', 0], ['Vous l’avez dans une autre couleur ?', 1], ['Parfait, bonne journée !', 2]]),
      tip(b('Keep the conversation going', 'Faites vivre l’échange'), b('Don’t wait for the examiner to do everything: **ask questions**, **react** (D’accord, Ah bon ?, Très bien) and **propose solutions**. Finish with a polite closing.', 'N’attendez pas que l’examinateur fasse tout : **posez des questions**, **réagissez** (D’accord, Ah bon ?, Très bien) et **proposez des solutions**. Terminez par une formule de politesse.')),
      say('Bonjour, j’ai acheté ce pull hier, mais il est trop petit. Est-ce que je peux l’échanger contre une taille M ?', 'Hello, I bought this sweater yesterday but it’s too small. Can I exchange it for a size M?'),
    ],
    [
      b('3–4 minutes; choose one of two situations.', '3 à 4 minutes ; choisissez une des deux situations.'),
      b('Opening, requests and questions, reactions, closing.', 'Ouverture, demandes et questions, réactions, clôture.'),
      b('Politeness and initiative earn points.', 'La politesse et l’initiative rapportent des points.'),
    ],
    [['le ticket de caisse', b('the receipt', 'preuve d’achat')], ['échanger', b('to exchange', 'changer contre un autre')], ['moche', b('ugly (informal)', 'laid')]],
  ),
];
