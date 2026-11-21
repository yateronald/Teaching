import type { CourseAbout } from '../../types';
import { b, dlg, doc, hear, lesson, say, tip, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'A complete practice set at B1 level in the spirit of the TCF: timed listening and reading questions on everyday and work situations, the three writing tasks and the three speaking tasks, with model answers. Use it as a dress rehearsal: respect the timing, then compare your answers with the models. All documents are original practice material.',
    'Un entraînement complet de niveau B1 dans l’esprit du TCF : questions chronométrées de compréhension orale et écrite sur des situations quotidiennes et professionnelles, les trois tâches d’expression écrite et les trois tâches d’expression orale, avec des réponses modèles. Utilisez-le comme une répétition générale : respectez le temps, puis comparez vos réponses avec les modèles. Tous les documents sont des supports d’entraînement originaux.',
  ),
  outcomes: [
    b('Practise B1 comprehension under time pressure', 'S’entraîner à la compréhension B1 en temps limité'),
    b('Write the three tasks at B1 level', 'Rédiger les trois tâches au niveau B1'),
    b('Practise the three speaking tasks', 'S’entraîner aux trois tâches orales'),
    b('Compare with model answers', 'Comparer avec des réponses modèles'),
  ],
};

const C = 'tcf-mock-b1';
export default [
  lesson(C, 1, ['listening-and-reading', 'comprehension-orale-et-ecrite'],
    b('Listening and reading (timed)', 'Compréhension orale et écrite (chronométrée)'),
    b('Answer B1 questions within the time limit.', 'Répondre à des questions B1 dans le temps imparti.'),
    [b('Listen once and answer', 'Écouter une fois et répondre'), b('Read and answer quickly', 'Lire et répondre vite'), b('Respect the timing', 'Respecter le temps')],
    13,
    [
      tip(b('Exam conditions', 'Conditions d’examen'), b('Each question has a **timer**. Listen **once**, answer, move on. Don’t look at the transcripts until the end.', 'Chaque question a un **chronomètre**. Écoutez **une fois**, répondez, passez à la suite. Ne regardez pas les transcriptions avant la fin.')),
      hear('Bonjour, c’est Thomas de la garderie Les Petits Pas. Votre fils a un peu de fièvre. Ce n’est rien de grave, mais pourriez-vous venir le chercher avant quinze heures ?', b('What does Thomas ask?', 'Que demande Thomas ?'), [b('to pick up the child before 3 p.m.', 'venir chercher l’enfant avant 15 h'), b('to bring medicine', 'apporter des médicaments'), b('to call the doctor', 'appeler le médecin'), b('to pay the fees', 'payer les frais')], { voice: 'm', timer: 45 }),
      hear('Pour votre sécurité, nous vous rappelons que le stationnement est interdit devant l’entrée de l’hôpital. Un parking gratuit est à votre disposition au niveau moins un.', b('Where can visitors park?', 'Où les visiteurs peuvent-ils se garer ?'), [b('in the free car park on level −1', 'au parking gratuit du niveau −1'), b('in front of the entrance', 'devant l’entrée'), b('in the street', 'dans la rue'), b('nowhere', 'nulle part')], { voice: 'f', timer: 45 }),
      hear('Moi, je préfère travailler de chez moi deux jours par semaine. Je suis plus concentrée, mais le contact avec l’équipe me manque un peu, alors je viens au bureau le reste du temps.', b('What does she miss when working from home?', 'Qu’est-ce qui lui manque en télétravail ?'), [b('contact with the team', 'le contact avec l’équipe'), b('concentration', 'la concentration'), b('her computer', 'son ordinateur'), b('the commute', 'le trajet')], { voice: 'f', timer: 45 }),
      doc({ look: 'notice', title: b('Notice', 'Avis'), text: 'AVIS AUX LOCATAIRES\nL’eau sera coupée le mardi 9 mai de 9 h à 13 h pour des travaux sur les canalisations. Nous vous conseillons de prévoir des réserves d’eau. Merci de votre compréhension. — La gestion de l’immeuble' }, b('What does the notice advise?', 'Que conseille l’avis ?'), [b('to keep some water in reserve', 'de prévoir des réserves d’eau'), b('to leave the building', 'de quitter l’immeuble'), b('to call a plumber', 'd’appeler un plombier'), b('to pay for the works', 'de payer les travaux')], { timer: 60 }),
      doc({ look: 'email', title: b('Email', 'Courriel'), text: 'Bonjour à toutes et à tous,\n\nLa formation sur le nouveau logiciel de facturation, prévue jeudi, est reportée à la semaine prochaine, car le formateur est malade. La nouvelle date vous sera communiquée demain. En attendant, vous pouvez consulter le guide en ligne.\n\nBonne journée,\nNathalie, RH' }, b('Why is the training postponed?', 'Pourquoi la formation est-elle reportée ?'), [b('the trainer is ill', 'le formateur est malade'), b('the software is not ready', 'le logiciel n’est pas prêt'), b('the room is unavailable', 'la salle n’est pas disponible'), b('nobody registered', 'personne n’est inscrit')], { timer: 60 }),
      doc({ look: 'ad', title: b('Ad', 'Annonce'), text: 'Cours de conversation gratuits à la bibliothèque du quartier !\nTous les mardis de 18 h à 19 h 30. Niveau intermédiaire. Inscription obligatoire à l’accueil (places limitées à 12 personnes).' }, b('What is required?', 'Qu’est-ce qui est obligatoire ?'), [b('registering at reception', 'l’inscription à l’accueil'), b('paying a fee', 'payer des frais'), b('being a beginner', 'être débutant'), b('bringing a book', 'apporter un livre')], { timer: 60 }),
    ],
    [
      b('Listen once, answer, move on.', 'Écoutez une fois, répondez, passez.'),
      b('Read the question first, then scan.', 'Lisez d’abord la question, puis repérez.'),
      b('Note which question types you missed.', 'Notez les types de questions manquées.'),
    ],
    [['une garderie', b('a daycare', 'lieu d’accueil des petits')], ['les canalisations', b('the pipes', 'tuyaux d’eau')], ['reporter', b('to postpone', 'remettre à plus tard')]],
  ),
  lesson(C, 2, ['writing-tasks', 'expression-ecrite'],
    b('The three writing tasks', 'Les trois tâches d’expression écrite'),
    b('Write tasks 1, 2 and 3 at B1 level in about 60 minutes.', 'Rédiger les tâches 1, 2 et 3 au niveau B1 en environ 60 minutes.'),
    [b('Task 1: a message', 'Tâche 1 : un message'), b('Task 2: an experience', 'Tâche 2 : une expérience'), b('Task 3: two views and your opinion', 'Tâche 3 : deux avis et votre opinion')],
    13,
    [
      write(b('Task 1 (60–120 words)', 'Tâche 1 (60–120 mots)'), b('Your neighbour is going on holiday and asked you to water her plants. Write her a message: confirm, ask practical questions (keys, how often, which plants).', 'Votre voisine part en vacances et vous a demandé d’arroser ses plantes. Écrivez-lui un message : confirmez et posez des questions pratiques (clés, fréquence, quelles plantes).'), 60, 120, [
        b('Confirmation', 'Confirmation'),
        b('Three practical questions', 'Trois questions pratiques'),
        b('Friendly greeting and closing', 'Salutation et clôture amicales'),
      ], 'Bonjour Hélène,\n\nPas de problème, je m’occupe de tes plantes avec plaisir pendant tes vacances ! J’ai juste quelques questions : quand est-ce que je peux passer prendre les clés ? Combien de fois par semaine faut-il les arroser ? Et est-ce qu’il y a des plantes plus fragiles, qui ont besoin d’une attention particulière ?\n\nProfite bien de ton voyage !\n\nÀ bientôt,\nAmir'),
      write(b('Task 2 (120–150 words)', 'Tâche 2 (120–150 mots)'), b('You recently moved to a new city. Write a blog post telling your first week and giving your impressions.', 'Vous avez récemment déménagé dans une nouvelle ville. Écrivez un billet de blog racontant votre première semaine et donnant vos impressions.'), 120, 150, [
        b('Context and events in the past', 'Contexte et événements au passé'),
        b('Impressions', 'Impressions'),
        b('A sentence for the readers', 'Une phrase pour les lecteurs'),
      ], 'Ma première semaine à Sherbrooke\n\nLa semaine dernière, je suis arrivée à Sherbrooke avec deux valises et beaucoup de questions. Il faisait déjà froid, mais les gens étaient très accueillants. Le premier jour, j’ai visité mon nouveau quartier et j’ai découvert un grand parc au bord d’une rivière. Ensuite, je me suis inscrite à la bibliothèque et à des cours de conversation. Vendredi, mes voisins m’ont invitée à manger une poutine !\n\nCe qui m’a le plus surprise, c’est la gentillesse des habitants : tout le monde m’aide quand je cherche mon chemin. Je pense que je vais vite me sentir chez moi ici. J’ai déjà hâte de découvrir mon premier vrai hiver québécois !\n\nEt vous, comment s’est passée votre arrivée dans une nouvelle ville ?'),
      write(b('Task 3 (120–180 words)', 'Tâche 3 (120–180 mots)'), b('Document 1: « Les supermarchés devraient supprimer tous les emballages plastiques. » Document 2: « Sans emballage, les produits se conservent moins bien et on gaspille plus de nourriture. » Present both views, then give your opinion.', 'Document 1 : « Les supermarchés devraient supprimer tous les emballages plastiques. » Document 2 : « Sans emballage, les produits se conservent moins bien et on gaspille plus de nourriture. » Présentez les deux avis, puis donnez votre opinion.'), 120, 180, [
        b('Part 1: both views, reformulated', 'Partie 1 : les deux avis, reformulés'),
        b('Part 2: your opinion with arguments', 'Partie 2 : votre avis argumenté'),
      ], 'La question des emballages plastiques divise. Selon le premier document, les supermarchés devraient les supprimer complètement. À l’inverse, le second rappelle que les emballages protègent les aliments et limitent le gaspillage.\n\nPour ma part, je pense qu’il faut réduire fortement le plastique, mais pas le supprimer partout. D’abord, beaucoup de produits, comme les fruits ou les pâtes, peuvent être vendus en vrac sans problème : dans mon quartier, une épicerie le fait déjà et les clients apportent leurs propres sacs. Ensuite, pour la viande ou le fromage, un emballage reste utile pour la conservation. On pourrait alors utiliser des matériaux recyclables. En somme, il faut supprimer le plastique inutile tout en évitant de gaspiller la nourriture. C’est un effort que chacun, consommateur comme commerçant, peut faire.'),
    ],
    [
      b('Task 1 ≈ 10 min, task 2 ≈ 20 min, task 3 ≈ 25 min, + re-reading.', 'Tâche 1 ≈ 10 min, tâche 2 ≈ 20 min, tâche 3 ≈ 25 min, + relecture.'),
      b('Respect each word range.', 'Respectez chaque fourchette de mots.'),
      b('Compare with the models and note your errors.', 'Comparez avec les modèles et notez vos erreurs.'),
    ],
    [['arroser', b('to water', 'donner de l’eau')], ['en vrac', b('loose, unpackaged', 'sans emballage')], ['le gaspillage', b('waste', 'fait de jeter inutilement')]],
  ),
  lesson(C, 3, ['speaking-tasks', 'expression-orale'],
    b('The three speaking tasks', 'Les trois tâches d’expression orale'),
    b('Practise tasks 1, 2 and 3 aloud, then compare with models.', 'S’entraîner à voix haute aux tâches 1, 2 et 3, puis comparer avec les modèles.'),
    [b('Task 1: present yourself', 'Tâche 1 : se présenter'), b('Task 2: ask for information', 'Tâche 2 : demander des informations'), b('Task 3: give your view', 'Tâche 3 : donner son avis')],
    13,
    [
      say('Je m’appelle Sofia, j’ai vingt-neuf ans et je viens du Brésil. Je suis graphiste et j’apprends le français parce que je souhaite travailler à Montréal.', 'My name is Sofia, I’m twenty-nine and from Brazil. I’m a graphic designer and I’m learning French because I want to work in Montreal.', { tip: b('Task 1: identity, job, reason for French, a project.', 'Tâche 1 : identité, métier, raison du français, un projet.') }),
      dlg(b('Task 2: a gym membership', 'Tâche 2 : un abonnement à la salle de sport'), undefined, [['Vous', 'f'], ['Examinateur (employé)', 'm']], [
        [0, { options: ['Bonjour, je souhaiterais m’inscrire à la salle de sport. J’aurais quelques questions.', 'Sport. Combien ?', 'Je veux du sport.'] }],
        [1, 'Bien sûr, je vous écoute.', 'Of course, go ahead.'],
        [0, { options: ['Quels sont les tarifs, et est-ce qu’il y a un abonnement sans engagement ?', 'C’est cher ?', 'Prix ?'] }],
        [1, 'C’est 45 dollars par mois sans engagement, ou 35 avec un engagement d’un an.', 'It’s 45 dollars a month with no commitment, or 35 with a one-year commitment.'],
        [0, { options: ['D’accord. Et les cours collectifs sont-ils compris ? Quels sont les horaires ?', 'Bon. Merci. Au revoir.', 'Trop cher.'] }],
      ]),
      say('La question est de savoir s’il faut rendre les transports en commun gratuits. Personnellement, j’y suis plutôt favorable, d’abord pour l’environnement, ensuite pour aider les familles modestes.', 'The question is whether public transport should be free. Personally, I’m rather in favour, first for the environment, then to help low-income families.', { tip: b('Task 3: rephrase, position, two arguments, nuance.', 'Tâche 3 : reformuler, position, deux arguments, nuance.') }),
      tip(b('Record yourself', 'Enregistrez-vous'), b('Record your three tasks with your phone, then listen: did you **develop**, **vary your questions**, **give examples**? Repeat the exercise a week later to measure your progress.', 'Enregistrez vos trois tâches avec votre téléphone, puis écoutez-vous : avez-vous **développé**, **varié vos questions**, **donné des exemples** ? Refaites l’exercice une semaine plus tard pour mesurer vos progrès.')),
    ],
    [
      b('Task 1: developed self-presentation.', 'Tâche 1 : présentation développée.'),
      b('Task 2: many varied questions, react, close.', 'Tâche 2 : beaucoup de questions variées, réagir, conclure.'),
      b('Task 3: position + arguments + examples + nuance.', 'Tâche 3 : position + arguments + exemples + nuance.'),
    ],
    [['un graphiste', b('a graphic designer', 'créateur d’images')], ['les cours collectifs', b('group classes', 'cours en groupe')], ['modeste', b('low-income', 'aux revenus faibles')]],
  ),
];
