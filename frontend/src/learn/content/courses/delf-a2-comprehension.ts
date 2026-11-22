import type { CourseAbout } from '../../types';
import { b, dict, doc, exam, gap, hear, lesson, mc, P, pairs, sort, tip } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'At DELF A2, recordings and reading texts get slightly longer and test real-life understanding: radio ads, voicemails with excuses, travel updates, workplace emails, restaurant reviews and civic leaflets. This course trains you to recognise paraphrases—where the right option uses different words from the text—and avoid tempting distractors under exam time pressure.',
    'Au DELF A2, les enregistrements et les textes deviennent un peu plus longs et évaluent une compréhension concrète : publicités radio, messages d’excuse, infos voyage, courriels professionnels, critiques et dépliants. Ce cours vous entraîne à reconnaître les reformulations — quand la bonne réponse dit la même idée avec d’autres mots — et à éviter les pièges dans le temps imparti.',
  ),
  outcomes: [
    b('Identify paraphrases in A2 comprehension options', 'Repérer les reformulations dans les questions A2'),
    b('Catch changing plans and causes in longer A2 audio', 'Saisir changements de programme et raisons à l’oral'),
    b('Compare documents to choose what fits criteria', 'Comparer plusieurs documents selon des critères'),
    b('Work calmly through the 30-minute reading paper', 'Gérer sereinement les 30 minutes de lecture'),
  ],
};

const C = 'delf-a2-comprehension';
export default [
  lesson(C, 1, ['paraphrases-in-listening-a2', 'reformulations-a-l-oral-a2'],
    b('Listening: catching paraphrases and reasons', 'Écoute : reformulations et raisons'),
    b('Recognise the same idea expressed differently in everyday voicemails and radio spots.', 'Reconnaître une même idée exprimée autrement dans messages vocaux et annonces radio.'),
    [b('Expect synonyms in the answer', 'Attendre des synonymes dans les choix'), b('Catch changes of time or place', 'Repérer un changement d’heure ou de lieu'), b('Understand the reason behind an event', 'Comprendre le motif d’une décision')],
    13,
    [
      exam(b('How A2 distractors work', 'Comment fonctionnent les pièges au DELF A2'), b('At A2, the **wrong choices** often repeat **exact words from the audio**, while the **right answer paraphrases** the meaning (**« il est malade » → « il a un problème de santé »** ; **« gratuit » → « sans payer »**). Focus on **meaning**, not matching a single word.', 'Au DELF A2, les **mauvais choix** répètent souvent des **mots exacts de l’audio**, alors que la **bonne réponse reformule** le sens (**« il est malade » → « problème de santé »** ; **« gratuit » → « sans payer »**). Écoutez le **sens**, pas un mot isolé.')),
      hear('Salut Nadia, c’est Thomas. Je suis coincé dans le métro à cause d’une panne. Je ne pourrai pas arriver à 19 h pour le film. Prends ta place sans moi, on mange ensemble après la séance vers 21 h 15 !', b('Why will Thomas miss the beginning of the film?', 'Pourquoi Thomas va-t-il manquer le début du film ?'), [b('There is a metro breakdown delaying him', 'Il est retardé par un problème de transport'), b('He forgot to buy his ticket online', 'Il a oublié d’acheter son billet'), b('He is still eating at a restaurant', 'Il dîne encore au restaurant'), b('The cinema cancelled the 7 p.m. showing', 'Le cinéma a annulé la séance de 19 h')], { voice: 'm' }),
      hear('Cette semaine dans votre cinéma Le Royal : profitez de toutes les séances du matin à moitié prix avant midi, et d’un tarif réduit toute la journée le mercredi pour les étudiants.', b('When do non-students get a discount?', 'Quand tout le monde peut-il payer moins cher ?'), [b('Before noon on any day this week', 'Aux séances du matin avant midi'), b('All day on Wednesday', 'Toute la journée du mercredi'), b('Only on Friday evenings', 'Uniquement le vendredi soir'), b('Only if they buy two tickets', 'Seulement pour deux billets achetés')], { voice: 'f' }),
      hear('Allô, ici l’agence ImmoPlus. Pour visiter l’appartement rue des Écoles demain matin, passez d’abord prendre les clés à notre bureau à 9 h 30, puis nous irons sur place ensemble.', b('Where must the visitor go first at 9:30 a.m.?', 'Où le visiteur doit-il aller d’abord à 9 h 30 ?'), [b('To the real estate agency office', 'Au bureau de l’agence immobilière'), b('Directly in front of the apartment', 'Directement devant l’appartement'), b('To the town hall', 'À la mairie'), b('To the current tenant’s workplace', 'Au travail du locataire actuel')], { voice: 'f2' }),
      pairs(P.match, [['à moitié prix', b('half price', '50 % moins cher')], ['une panne', b('a breakdown / outage', 'arrêt technique')], ['sur place', b('on site, there', 'au lieu prévu')], ['profiter de', b('to take advantage of', 'bénéficier de')]]),
      dict('Passez d’abord à notre bureau à neuf heures trente, puis nous irons visiter ensemble.', { voice: 'f' }),
    ],
    [
      b('Exact repeated words in an option are often traps; look for the synonym/paraphrase.', 'Les mots exacts recopiés dans une option sont souvent des pièges : cherchez la reformulation.'),
      b('Notice connectors of sequence like « d’abord… puis… ».', 'Repérez la chronologie : « d’abord… puis… ».'),
      b('Check who a discount or condition applies to (everyone vs students).', 'Vérifiez qui est concerné par une condition ou réduction.'),
    ],
    [['une séance', b('a film screening', 'projection de film')], ['coincé', b('stuck', 'bloqué')], ['réduit', b('reduced, discounted', 'baissé')]],
  ),
  lesson(C, 2, ['matching-people-to-offers-a2', 'comparer-des-annonces-a2'],
    b('Reading: comparing ads and matching criteria', 'Lecture : comparer des annonces'),
    b('Compare sports classes, holiday rentals or job ads against three or four personal criteria.', 'Comparer annonces de loisirs, logements ou emplois selon plusieurs critères précis.'),
    [b('List every criterion before reading', 'Lister chaque critère avant de lire'), b('Eliminate options one constraint at a time', 'Éliminer une contrainte après l’autre'), b('Spot hidden limits or extra fees', 'Repérer limites et frais cachés')],
    13,
    [
      doc({ look: 'ad', title: b('Compare two summer courses', 'Comparer deux stages d’été'), text: 'STAGE A — Atelier Théâtre en plein air\nDu 6 au 10 juillet, 10 h – 13 h · Parc Montsouris\nOuvert aux adultes débutants · 90 € (matériel inclus)\n\nSTAGE B — Théâtre et improvisation (soir)\nDu 13 au 17 juillet, 18 h – 21 h · Centre Jean-Vilar\nNiveau intermédiaire demandé · 110 €\n\nSTAGE C — Atelier Photographie du matin\nDu 6 au 10 juillet, 9 h – 12 h · Jardin des Plantes\nAdultes débutants · 85 € (appareil photo personnel nécessaire)' }, b('Lucas wants a morning beginner theatre workshop in early July. Which fits?', 'Lucas veut un stage de théâtre du matin, niveau débutant, début juillet. Lequel choisir ?'), [b('Workshop A', 'Le stage A'), b('Workshop B', 'Le stage B'), b('Workshop C', 'Le stage C'), b('None of them fit', 'Aucun ne convient')]),
      doc({ look: 'email', title: b('Work message — Building access', 'Message pro — Accès au bâtiment'), text: 'Chers collègues,\nEn raison de travaux sur l’entrée principale mardi et mercredi, l’accès se fera uniquement par la porte B, côté parking. Le restaurant d’entreprise reste ouvert normalement aux étages. Merci de garder votre badge visible.\nLa direction' }, b('What remains unchanged on Tuesday and Wednesday?', 'Qu’est-ce qui ne change pas mardi et mercredi ?'), [b('The staff restaurant stays open as usual.', 'Le restaurant d’entreprise reste ouvert normalement.'), b('Everyone enters through the main door.', 'On entre par la porte principale.'), b('No badge is needed this week.', 'Le badge n’est pas utile cette semaine.'), b('Work moves to another building.', 'Les bureaux déménagent.')]),
      sort(b('Positive fit or disqualifier?', 'Compatible ou éliminatoire ?'), [b('fits a morning beginner budget <100 €', 'convient (matin, débutant, < 100 €)'), b('disqualified by a criterion', 'éliminé par un critère')], [['10 h – 13 h, débutants, 90 €', 0], ['niveau intermédiaire, 18 h – 21 h', 1], ['stage de photographie (pas théâtre)', 1], ['tout matériel inclus, 80 €', 0]]),
      mc(P.meaning, [b('because of renovation work', 'à cause de travaux'), b('thanks to a holiday', 'grâce à un jour férié'), b('until further notice', 'jusqu’à nouvel ordre'), b('at the main reception', 'à l’accueil principal')], { fr: 'Que veut dire « en raison de travaux » ?' }),
      gap(P.complete, 'En ___ de travaux, l’entrée ___ se fera ___ par la porte B.', ['raison', 'seule', 'uniquement'], { choices: [['raison', 'temps', 'cas'], ['seule', 'normale', 'principale'], ['uniquement', 'jamais', 'gratuitement']] }),
    ],
    [
      b('In DELF A2 reading Part 1, check each candidate’s constraints (budget, schedule, level, topic).', 'En lecture A2 partie 1, cochez chaque critère (budget, horaire, niveau, thème).'),
      b('A single mismatched constraint eliminates an ad, even if four other words match.', 'Un seul critère incompatible élimine l’annonce, même si le reste correspond.'),
      b('Watch expressions like « en raison de », « uniquement », « nécessaire ».', 'Repérez « en raison de », « uniquement », « nécessaire ».'),
    ],
    [['en plein air', b('outdoors', 'dehors')], ['en raison de', b('because of', 'à cause de')], ['un critère', b('a criterion', 'condition à remplir')]],
  ),
  lesson(C, 3, ['longer-articles-and-exam-timing-a2', 'articles-courts-et-timing-a2'],
    b('Reading: longer notices, true/false and timing', 'Lecture : textes informatifs et gestion du temps'),
    b('Read 150-word informative texts with true/false justifications and manage the 30-minute clock.', 'Lire de courts articles avec vrai/faux justifié et gérer les 30 minutes d’épreuve.'),
    [b('Decide True/False from the text only', 'Répondre Vrai/Faux selon le texte seul'), b('Copy clean justification lines', 'Citer une justification claire du texte'), b('Pace the 30 minutes cleanly', 'Répartir les 30 minutes d’épreuve')],
    13,
    [
      tip(b('Copy short phrases accurately when asked to justify', 'Justifier en recopiant juste'), b('When an exam item asks to **justify True or False**, copy the **exact relevant sentence or clause** from the text—do not invent an opinion from outside knowledge.', 'Quand on demande de **justifier Vrai ou Faux**, recopiez **la phrase ou proposition exacte** du texte : n’ajoutez pas d’idée extérieure au document.')),
      doc({ look: 'article', title: b('Bibliothèque de quartier : les samedis sans écran', 'Bibliothèque de quartier : les samedis sans écran'), text: 'Depuis janvier, la médiathèque centrale propose chaque samedi après-midi des jeux de société gratuits pour les familles. L’objectif est simple : offrir un moment calme sans téléphone ni tablette. Les enfants de moins de dix ans doivent être accompagnés d’un adulte. Plus de quatre-vingts habitants viennent déjà chaque semaine.' }, b('According to the article, can an 8-year-old come alone?', 'D’après l’article, un enfant de huit ans peut-il venir seul ?'), [b('No: children under ten must come with an adult.', 'Non : les moins de dix ans doivent être accompagnés d’un adulte.'), b('Yes: entry is free for everyone.', 'Oui : l’entrée est gratuite pour tous.'), b('Yes, if they bring a board game.', 'Oui, s’il apporte un jeu de société.'), b('Only in January.', 'Seulement en janvier.')]),
      doc({ look: 'article', title: b('Vélo-partage en ville', 'Vélo-partage en ville'), text: 'La mairie installe vingt nouvelles stations de vélos électriques dans le centre et près des universités. Les trente premières minutes restent gratuites pour les abonnés annuels. Les touristes peuvent payer directement par carte bancaire à la borne, sans créer de compte.' }, b('How can tourists rent a bike easily?', 'Comment les touristes peuvent-ils louer un vélo simplement ?'), [b('By paying by bank card at the terminal without creating an account', 'En payant par carte bancaire à la borne, sans créer de compte'), b('By buying an annual subscription at the university', 'En prenant un abonnement annuel à l’université'), b('Only at the town hall desk', 'Uniquement au guichet de la mairie'), b('They cannot use electric bikes', 'Ils ne peuvent pas utiliser les vélos électriques')]),
      mc(P.choose, ['About 7 minutes per exercise, keeping 3–4 minutes to review all answers', '20 minutes on Exercise 1 and 2 minutes each for the rest', 'Read every single word aloud three times first', 'Leave True/False blank if one word is unknown'], { fr: 'Comment répartir les 30 minutes de compréhension écrite au DELF A2 ?' }),
      pairs(P.match, [['être accompagné de', b('to be accompanied by', 'venir avec quelqu’un')], ['un jeu de société', b('a board game', 'jeu à plusieurs autour d’une table')], ['un abonné', b('a subscriber', 'personne avec un abonnement')], ['une borne', b('a kiosk / terminal', 'appareil libre-service')]]),
      dict('Plus de quatre-vingts habitants participent chaque samedi aux jeux de société.', { voice: 'm' }),
    ],
    [
      b('Base True/False strictly on what is printed in the text.', 'Fondez Vrai/Faux uniquement sur ce qui est écrit dans le texte.'),
      b('Watch age limits (« moins de dix ans ») and conditions (« sans créer de compte »).', 'Repérez limites d’âge (« moins de dix ans ») et conditions (« sans créer de compte »).'),
      b('Split 30 minutes evenly across the 4 exercises and save 3 minutes to check.', 'Divisez les 30 minutes sur les 4 exercices avec 3 minutes de relecture.'),
    ],
    [['une médiathèque', b('a multimedia library', 'bibliothèque avec livres et médias')], ['un habitant', b('a resident', 'personne qui vit là')], ['gratuit', b('free of charge', 'sans payer')]],
  ),
];
