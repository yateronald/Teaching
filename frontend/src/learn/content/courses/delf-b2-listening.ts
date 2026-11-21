import type { CourseAbout } from '../../types';
import { b, card, dict, exam, hear, lesson, mc, P, pairs, sort, tip } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'The DELF B2 listening test (about 30 minutes) includes interviews, reports, radio programmes and announcements, some heard twice and some only once. This course trains the B2 listening strategies: anticipating with the questions, noting key words in a smart way, following the structure of an interview, identifying opinions and nuances, and handling documents heard only once. All recordings are original practice material.',
    'L’épreuve de compréhension de l’oral du DELF B2 (environ 30 minutes) comprend des interviews, des reportages, des émissions de radio et des annonces, certains entendus deux fois, d’autres une seule. Ce cours entraîne les stratégies d’écoute du B2 : anticiper grâce aux questions, prendre des notes efficaces, suivre la structure d’une interview, repérer opinions et nuances, et gérer les documents entendus une seule fois. Tous les enregistrements sont des supports d’entraînement originaux.',
  ),
  outcomes: [
    b('Anticipate content from the questions', 'Anticiper le contenu grâce aux questions'),
    b('Take efficient notes', 'Prendre des notes efficaces'),
    b('Follow an interview and identify opinions', 'Suivre une interview et repérer les opinions'),
    b('Handle documents heard once', 'Gérer les documents entendus une seule fois'),
  ],
};

const C = 'delf-b2-listening';
export default [
  lesson(C, 1, ['anticipating-and-notes', 'anticiper-et-prendre-des-notes'],
    b('Anticipating and taking notes', 'Anticiper et prendre des notes'),
    b('Use the questions to predict, and note only what matters.', 'Utiliser les questions pour prévoir, et ne noter que l’essentiel.'),
    [b('Predict from the questions', 'Prévoir à partir des questions'), b('Use abbreviations and symbols', 'Utiliser abréviations et symboles'), b('Catch figures and names', 'Saisir chiffres et noms')],
    13,
    [
      exam(b('B2 listening', 'Compréhension de l’oral B2'), b('About **30 minutes**, **25 points**, mostly **multiple-choice** questions. Longer documents (interview, report) are often heard **twice**; short ones (announcements, flashes) may be heard **once**. You get time to **read the questions** before each recording: use it.', 'Environ **30 minutes**, **25 points**, surtout des **QCM**. Les documents longs (interview, reportage) sont souvent entendus **deux fois** ; les courts (annonces, flashs) peuvent l’être **une seule fois**. Vous avez du temps pour **lire les questions** avant chaque enregistrement : utilisez-le.')),
      card(b('Smart notes', 'Des notes efficaces'), b('Note **key words, not sentences**. Symbols: **↑** (hausse), **↓** (baisse), **=** (égal), **≠** (différent), **→** (conséquence), **+** (avantage), **–** (inconvénient). Abbreviations: **gvt** (gouvernement), **pb** (problème), **qd** (quand), **pcq** (parce que), **ds** (dans). Always write **figures and names** immediately.', 'Notez des **mots clés, pas des phrases**. Symboles : **↑** (hausse), **↓** (baisse), **=** (égal), **≠** (différent), **→** (conséquence), **+** (avantage), **–** (inconvénient). Abréviations : **gvt**, **pb**, **qd**, **pcq**, **ds**. Notez toujours **chiffres et noms** immédiatement.')),
      hear('Selon une enquête publiée ce matin, quarante-deux pour cent des salariés télétravaillent au moins un jour par semaine, contre seulement quinze pour cent il y a cinq ans. Les cadres sont les plus concernés.', b('What has changed in five years?', 'Qu’est-ce qui a changé en cinq ans ?'), [b('Remote work rose from 15% to 42%.', 'Le télétravail est passé de 15 % à 42 %.'), b('Remote work fell from 42% to 15%.', 'Le télétravail est passé de 42 % à 15 %.'), b('Managers stopped remote work.', 'Les cadres ont arrêté le télétravail.'), b('Nothing changed.', 'Rien n’a changé.')], { voice: 'm' }),
      pairs(P.match, [['↑', b('rise', 'hausse')], ['→', b('consequence', 'conséquence')], ['≠', b('different, contrast', 'différent')], ['pcq', b('because', 'parce que')]]),
      mc(P.choose, [b('a report on transport, with figures and opinions', 'un reportage sur les transports, avec chiffres et opinions'), b('a recipe', 'une recette'), b('a weather forecast', 'un bulletin météo'), b('a song', 'une chanson')], { fr: 'Les questions parlent de « fréquentation du métro », de « pourcentage » et de « réaction des usagers ». Que va-t-on probablement entendre ?' }),
    ],
    [
      b('Read questions first and predict the content.', 'Lisez les questions d’abord et prévoyez le contenu.'),
      b('Notes: key words, symbols, abbreviations.', 'Notes : mots clés, symboles, abréviations.'),
      b('Write figures and names immediately.', 'Notez chiffres et noms immédiatement.'),
    ],
    [['une enquête', b('a survey', 'étude par questions')], ['un cadre', b('an executive, a manager', 'salarié à responsabilités')], ['un usager', b('a user (of a service)', 'utilisateur')]],
  ),
  lesson(C, 2, ['following-an-interview', 'suivre-une-interview'],
    b('Following an interview', 'Suivre une interview'),
    b('Follow questions and answers, and identify the guest’s opinion and nuances.', 'Suivre questions et réponses, et repérer l’opinion et les nuances de l’invité.'),
    [b('Follow the journalist’s questions', 'Suivre les questions du journaliste'), b('Identify the guest’s position', 'Identifier la position de l’invité'), b('Spot nuances and reservations', 'Repérer nuances et réserves')],
    13,
    [
      card(b('Interview structure', 'Structure d’une interview'), b('The **journalist’s questions** structure the interview: listen to them carefully, they often match the exam questions. The guest’s opinion: **Je suis convaincu que… · Je reste prudent… · C’est une bonne nouvelle, mais… · Il ne faut pas exagérer…** Reservations come after **mais, cependant, à condition que**.', 'Les **questions du journaliste** structurent l’interview : écoutez-les bien, elles correspondent souvent aux questions de l’examen. L’opinion de l’invité : **Je suis convaincu que… · Je reste prudent… · C’est une bonne nouvelle, mais… · Il ne faut pas exagérer…** Les réserves arrivent après **mais, cependant, à condition que**.')),
      hear('— Le télétravail est-il une bonne chose pour les salariés ? — Globalement, oui : on gagne du temps de transport et on est souvent plus concentré. Mais je reste prudente. Sans règles claires, certains salariés ne déconnectent plus et finissent par travailler davantage.', b('What is the guest’s position?', 'Quelle est la position de l’invitée ?'), [b('Generally positive, with a reservation about disconnecting', 'Globalement positive, avec une réserve sur la déconnexion'), b('Totally against remote work', 'Totalement contre le télétravail'), b('Enthusiastic without any reservation', 'Enthousiaste sans aucune réserve'), b('She has no opinion', 'Elle n’a pas d’avis')], { voice: 'f' }),
      sort(b('Positive, reservation or negative?', 'Positif, réserve ou négatif ?'), [b('positive', 'positif'), b('reservation', 'réserve'), b('negative', 'négatif')], [['C’est une excellente nouvelle.', 0], ['Je reste prudent.', 1], ['C’est une grave erreur.', 2], ['Je m’en réjouis.', 0], ['À condition que les règles soient claires.', 1], ['Je m’y oppose fermement.', 2]]),
      mc(P.meaning, [b('The guest partly agrees but has doubts.', 'L’invité est en partie d’accord mais a des doutes.'), b('The guest totally agrees.', 'L’invité est tout à fait d’accord.'), b('The guest refuses to answer.', 'L’invité refuse de répondre.'), b('The guest changes the subject.', 'L’invité change de sujet.')], { fr: '« C’est une avancée, je ne dis pas le contraire, mais il ne faut pas exagérer ses effets. »' }),
      dict('Globalement, c’est une bonne chose, mais je reste prudente.', {}),
    ],
    [
      b('The journalist’s questions mirror the exam questions.', 'Les questions du journaliste reflètent celles de l’examen.'),
      b('Opinion markers: je suis convaincu, je reste prudent, il ne faut pas exagérer.', 'Marques d’opinion : je suis convaincu, je reste prudent, il ne faut pas exagérer.'),
      b('Reservations follow mais, cependant, à condition que.', 'Les réserves suivent mais, cependant, à condition que.'),
    ],
    [['déconnecter', b('to switch off (from work)', 'arrêter de travailler')], ['une avancée', b('a step forward', 'progrès')], ['se réjouir', b('to be glad', 'être content')]],
  ),
  lesson(C, 3, ['documents-heard-once', 'documents-entendus-une-fois'],
    b('Documents heard once', 'Les documents entendus une seule fois'),
    b('Train for short announcements and flashes heard only once.', 'S’entraîner aux annonces et flashs courts entendus une seule fois.'),
    [b('Focus on the question’s target', 'Se concentrer sur la cible de la question'), b('Recognise information types', 'Reconnaître les types d’informations'), b('Stay calm if you miss a word', 'Garder son calme si un mot échappe')],
    13,
    [
      tip(b('One listening only', 'Une seule écoute'), b('For short documents heard once, **read the questions** and decide **what type of information** you need (a date? a reason? a place?). Listen **only for that**. If you miss a word, **don’t stop**: the answer is often repeated or paraphrased.', 'Pour les documents courts entendus une fois, **lisez les questions** et décidez **quel type d’information** vous cherchez (une date ? une raison ? un lieu ?). Écoutez **seulement cela**. Si un mot vous échappe, **ne vous arrêtez pas** : la réponse est souvent répétée ou reformulée.')),
      hear('Information voyageurs : en raison d’un mouvement social, le trafic sera fortement perturbé jeudi sur les lignes régionales. Un train sur trois circulera. Nous vous conseillons de reporter vos déplacements.', b('Why will traffic be disrupted?', 'Pourquoi le trafic sera-t-il perturbé ?'), [b('because of a strike', 'à cause d’une grève'), b('because of the weather', 'à cause de la météo'), b('because of works', 'à cause de travaux'), b('because of an accident', 'à cause d’un accident')], { voice: 'f' }),
      hear('Le musée des Beaux-Arts rouvre ses portes samedi après deux ans de travaux. L’entrée sera gratuite tout le week-end, et une nocturne est prévue jusqu’à vingt-deux heures.', b('What is special this weekend?', 'Qu’y a-t-il de particulier ce week-end ?'), [b('free entry and a late opening', 'entrée gratuite et nocturne'), b('the museum closes for works', 'le musée ferme pour travaux'), b('tickets cost double', 'les billets coûtent le double'), b('only groups are admitted', 'seuls les groupes sont admis')], { voice: 'm' }),
      pairs(P.match, [['un mouvement social', b('a strike, industrial action', 'grève')], ['perturbé', b('disrupted', 'pas normal')], ['reporter', b('to postpone', 'remettre à plus tard')], ['une nocturne', b('a late opening', 'ouverture le soir')]]),
      sort(b('What type of information?', 'Quel type d’information ?'), [b('cause', 'cause'), b('consequence', 'conséquence'), b('advice', 'conseil')], [['en raison d’un mouvement social', 0], ['un train sur trois circulera', 1], ['nous vous conseillons de reporter', 2], ['à cause de la neige', 0], ['les écoles seront fermées', 1], ['évitez la route A6', 2]]),
    ],
    [
      b('One listening: decide the information type before listening.', 'Une écoute : décidez du type d’information avant d’écouter.'),
      b('Cause: en raison de, à cause de; consequence; advice.', 'Cause : en raison de, à cause de ; conséquence ; conseil.'),
      b('Don’t freeze on a missed word.', 'Ne bloquez pas sur un mot manqué.'),
    ],
    [['le trafic', b('traffic, service (trains)', 'circulation des trains')], ['un déplacement', b('a journey', 'voyage')], ['rouvrir', b('to reopen', 'ouvrir de nouveau')]],
  ),
];
