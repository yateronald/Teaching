import type { CourseAbout } from '../../types';
import { b, doc, exam, hear, lesson, mc, P, say, sort, tip, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Put all four skills together in one realistic DELF B1 practice set before exam day. Across three structured lessons you complete B1 listening items heard like a single broadcast, reading analysis and matching tasks, a 160-word opinion forum post with checklist and model, and a realistic interactive oral role-play and monologue defence.',
    'Réunissez les quatre compétences dans un entraînement complet au DELF B1 avant le jour J. Au fil de trois leçons structurées, vous enchaînez écoutes B1, tâches de lecture et d’analyse, une production écrite d’environ 160 mots avec grille et modèle, puis un jeu de rôle et une défense de point de vue à l’oral.',
  ),
  outcomes: [
    b('Complete timed B1 listening and reading tasks accurately', 'Réussir des épreuves B1 de compréhension en temps réel'),
    b('Write a cohesive 160-word opinion message for DELF B1', 'Rédiger un texte d’opinion cohérent de 160 mots pour le DELF B1'),
    b('Solve an unexpected problem politely in the B1 oral interaction', 'Résoudre un imprévu poliment dans l’exercice en interaction B1'),
    b('Present an opinion clearly from a short press article', 'Exposer un point de vue clair à partir d’un court article'),
  ],
};

const C = 'delf-b1-mock';
export default [
  lesson(C, 1, ['b1-mock-listening-and-reading', 'b1-bilan-comprehensions'],
    b('Paper 1 & 2: listening and reading', 'Épreuves 1 et 2 : écoute et lecture'),
    b('Test yourself on B1 radio reports, practical comparisons and an opinion article.', 'S’entraîner sur une chronique radio B1, un comparatif pratique et un article d’opinion.'),
    [b('Handle B1 listening under exam focus', 'Gérer une écoute B1 en conditions d’examen'), b('Solve a B1 matching grid accurately', 'Réussir une grille de comparaison B1'), b('Detect an author’s nuanced stance', 'Repérer la nuance d’un auteur')],
    13,
    [
      exam(b('Scoring reminder: 50/100 to pass', 'Rappel du barème : 50/100 pour réussir'), b('Each of the four papers counts for **25 points**. To earn the DELF B1 diploma, you need **at least 50/100 overall** and **no score below 5/25** in any single paper. Strong comprehension gives you a wide safety margin.', 'Chacune des quatre épreuves vaut **25 points**. Pour obtenir le DELF B1, il faut **au moins 50/100 au total** et **aucune note sous 5/25**. De bons points en compréhension offrent une grande marge de sécurité.')),
      hear('Depuis trois ans, notre ville encourage le covoiturage entre voisins grâce à une application locale. Les trajets vers la zone industrielle ont baissé le nombre de voitures individuelles aux heures de pointe. Certains usagers regrettent pourtant le manque de places réservées devant la gare.', b('What limitation do some users still point out?', 'Quelle limite certains usagers signalent-ils encore ?'), [b('Too few reserved carpool parking spots near the station', 'Le manque de places réservées devant la gare'), b('The local app is expensive to download', 'L’application coûte trop cher'), b('Too few drivers live in the city', 'Trop peu de conducteurs habitent en ville'), b('Carpooling increased rush-hour traffic', 'Le covoiturage a augmenté les bouchons')], { voice: 'm', timer: 30 }),
      hear('Bonjour, vous êtes bien sur le répondeur du centre culturel. Exceptionnellement ce jeudi, le guichet ferme à 16 h au lieu de 18 h pour une réunion d’équipe. Les billets achetés en ligne restent bien valables pour la pièce de ce soir à 20 h.', b('Can someone still attend tonight’s play at 8 p.m. with an online ticket?', 'Peut-on assister au spectacle de 20 h avec un billet acheté en ligne ?'), [b('Yes, online tickets remain completely valid', 'Oui, les billets en ligne restent bien valables'), b('No, the play is cancelled tonight', 'Non, la pièce est annulée ce soir'), b('Only if they arrive at the desk before 4 p.m.', 'Seulement si on passe au guichet avant 16 h'), b('No, there is a team meeting at 8 p.m.', 'Non, la réunion a lieu à 20 h')], { voice: 'f', timer: 25 }),
      doc({ look: 'article', title: b('Les bibliothèques ouvertes le dimanche ?', 'Les bibliothèques ouvertes le dimanche ?'), text: 'Faut-il ouvrir les bibliothèques municipales le dimanche ? Pour les étudiants et les salariés à temps plein, c’est souvent le seul jour libre de la semaine. D’autres rappellent toutefois qu’ouvrir sept jours sur sept coûte cher et complique l’équilibre de vie des équipes. Une solution consiste à ouvrir seulement de 13 h à 18 h avec des volontaires.' }, b('Why do some people hesitate about opening on Sundays?', 'Pourquoi certaines personnes hésitent-elles à ouvrir le dimanche ?'), [b('Higher costs and work-life balance for staff', 'Le coût élevé et l’équilibre de vie du personnel'), b('No students visit libraries on weekends', 'Aucun étudiant ne vient le week-end'), b('Books cannot be borrowed on Sundays', 'On ne peut pas emprunter de livres le dimanche'), b('Opening on Sunday afternoons is impossible', 'Ouvrir l’après-midi est impossible')], { timer: 45 }),
      mc(P.choose, ['Both 50/100 overall and at least 5/25 in every paper', '50/100 even with 2/25 in writing', '60/100 overall with 10/25 minimum', '40/100 overall'], { fr: 'Que faut-il au minimum pour obtenir le DELF B1 ?' }),
    ],
    [
      b('Listen once for the big picture and once for exact details and reservations.', 'Écoutez une fois pour le sens général, une seconde pour détails et réserves.'),
      b('Always check minimum score thresholds (50/100 total, 5/25 per skill).', 'Vérifiez toujours les seuils : 50/100 au total et 5/25 minimum par épreuve.'),
      b('Look for compromise solutions at the end of opinion articles.', 'Cherchez la solution de compromis à la fin des articles d’opinion.'),
    ],
    [['le covoiturage', b('carpooling', 'partager un trajet en voiture')], ['les heures de pointe', b('rush hour', 'heures de fort trafic')], ['un usager', b('a user (service)', 'personne qui utilise un service')]],
  ),
  lesson(C, 2, ['b1-mock-writing', 'b1-bilan-production-ecrite'],
    b('Paper 3: the 160-word opinion post', 'Épreuve 3 : le texte de 160 mots'),
    b('Plan, write and check a 160-word essay or forum reply giving a clear personal viewpoint.', 'Structurer, rédiger et vérifier une réponse de forum ou lettre d’environ 160 mots.'),
    [b('Build a 3-part B1 plan in 5 minutes', 'Construire un plan B1 en 5 minutes'), b('Express personal opinion and examples', 'Exprimer avis personnel et exemples'), b('Write 150–180 words cleanly', 'Rédiger 150 à 180 mots clairement')],
    13,
    [
      tip(b('160 words = 4 clean short blocks', '160 mots = 4 paragraphes courts'), b('Keep B1 writing tight and clear: **1. Intro + position (~30 words)**, **2. Argument 1 + example (~50 words)**, **3. Nuance / Argument 2 (~50 words)**, **4. Conclusion (~25 words)**. Every paragraph earns marks when linked cleanly (**À mon avis, d’abord, cependant, en conclusion**).', 'Gardez votre texte net : **1. Intro + position (~30 mots)**, **2. Argument 1 + exemple (~50 mots)**, **3. Nuance / Argument 2 (~50 mots)**, **4. Conclusion (~25 mots)**. Chaque bloc marque des points avec des liens clairs (**À mon avis, d’abord, cependant, en conclusion**).')),
      sort(b('Where does each sentence go?', 'Où placer chaque phrase ?'), [b('introduction', 'introduction'), b('argument + example', 'argument + exemple'), b('conclusion', 'conclusion')], [['J’ai lu avec intérêt votre article sur le télétravail.', 0], ['D’un côté, on gagne un temps précieux chaque matin ; par exemple, je passe deux heures de plus en famille.', 1], ['En conclusion, un équilibre entre bureau et maison reste la meilleure formule.', 2], ['Je souhaite partager mon expérience à ce sujet.', 0], ['Pour résumer, il faut encourager cette pratique avec souplesse.', 2]]),
      write(b('DELF B1 Writing Practice', 'Sujet écrit DELF B1'), b('On a French community forum, a neighbour asks whether cars should be banned from the town centre on Sundays. Write a reply (145–185 words): give your opinion, explain two arguments with an example, and propose a practical solution.', 'Sur un forum municipal, un habitant demande s’il faut interdire les voitures au centre-ville le dimanche. Répondez (145–185 mots) : donnez votre avis, deux arguments avec un exemple, et proposez une solution pratique.'), 145, 185, [
        b('Clear opinion from the start', 'Position claire dès le début'),
        b('Two developed arguments + real example', 'Deux arguments développés + un exemple'),
        b('Balanced conclusion / practical proposal', 'Conclusion équilibrée / proposition concrète'),
        b('145–185 words with varied connectors', '145 à 185 mots avec connecteurs variés'),
      ], 'Bonjour à tous,\n\nJe trouve l’idée de fermer le centre-ville aux voitures le dimanche très intéressante. À mon avis, cela améliorerait vraiment la qualité de vie et le dynamisme dans notre quartier.\n\nD’abord, les rues seraient plus sûres et plus agréables pour les familles, les enfants et les personnes âgées. Par exemple, le mois dernier, pendant la journée sans voiture, les terrasses étaient pleines et tout le monde marchait tranquillement sans bruit ni pollution, tout en soutenant les cafés et les artisans.\n\nCependant, je comprends l’inquiétude des commerçants et des habitants qui ont besoin de leur véhicule pour travailler ou transporter des courses lourdes, surtout les personnes à mobilité réduite. Il ne faut pas les pénaliser.\n\nPour cette raison, je propose de faire un essai sur quatre rues seulement, d’avril à septembre, de 10 h à 18 h, tout en maintenant l’accès pour les résidents et les livraisons le matin. Ainsi, chacun pourrait profiter d’un centre-ville plus vivant et convivial !', { phrases: ['À mon avis…', 'D’abord… Par exemple…', 'Cependant, je comprends…', 'Pour cette raison, je propose…'] }),
      mc(P.best, ['150 to 175 words', '60 words minimum', '300 words minimum', '25 words maximum'], { fr: 'Quelle longueur viser pour réussir la production écrite du DELF B1 (consigne : « 160 mots environ ») ?' }),
    ],
    [
      b('160 words = intro + 2 developed paragraphs + conclusion.', '160 mots = introduction + 2 paragraphes développés + conclusion.'),
      b('Always back one argument with « par exemple… ».', 'Appuyez toujours un argument par un exemple concret (« par exemple… »).'),
      b('Propose a practical middle ground when nuances exist.', 'Proposez un compromis concret quand il y a des réserves.'),
    ],
    [['la qualité de vie', b('quality of life', 'bien-être au quotidien')], ['mobilité réduite', b('reduced mobility', 'difficulté à se déplacer')], ['un essai', b('a trial', 'test temporaire')]],
  ),
  lesson(C, 3, ['b1-mock-speaking', 'b1-bilan-production-orale'],
    b('Paper 4: interaction and monologue', 'Épreuve 4 : interaction et point de vue'),
    b('Rehearse a B1 problem-solving dialogue and express an organised point of view from a short document.', 'S’exercer au jeu de rôle imprévu et à l’exposé organisé d’un point de vue à partir d’un texte.'),
    [b('Handle an everyday problem calmly', 'Gérer un imprévu poliment'), b('Structure a 3-minute B1 monologue', 'Structurer un exposé B1 de 3 minutes'), b('Respond smoothly to follow-up questions', 'Répondre naturellement aux relances')],
    13,
    [
      exam(b('B1 Speaking: 3 parts (~15 min)', 'Oral B1 : 3 parties (~15 min)'), b('1. **Guided interview** (2–3 min): present yourself, projects and past experiences. 2. **Interactive role-play** (3–4 min): resolve a practical situation or disagreement (**no preparation**, draw two cards and pick one). 3. **Monologue + discussion** (5–7 min, **10 min prep**): summarise a short article, state your opinion, then discuss with the examiner.', '1. **Entretien dirigé** (2–3 min) : se présenter, projets, expériences. 2. **Exercice en interaction** (3–4 min) : résoudre un problème ou désaccord (**sans préparation**, deux sujets tirés au sort). 3. **Point de vue + discussion** (5–7 min, **10 min de prép.**) : résumer un court article, donner votre avis, puis échanger.')),
      tip(b('Do not recite Part 3 — summarise and react', 'Ne récitez pas le texte en partie 3'), b('Mention the **topic and main idea in 2 sentences**, then spend most of your time on **your opinion, personal examples and reasons**.', 'Résumez le **thème et l’idée clé en 2 phrases**, puis consacrez l’essentiel de votre temps à **votre opinion, vos exemples et arguments**.')),
      doc({ look: 'article', title: b('Article sujet — Les devoirs à l’école primaire', 'Article sujet — Les devoirs à l’école primaire'), text: 'Faut-il supprimer les devoirs écrits le soir à l’école primaire ? Certains parents pensent que les enfants sont déjà fatigués après la classe et ont besoin de jouer. D’autres estiment au contraire que relire sa leçon dix minutes aide à mémoriser et permet aux parents de suivre les progrès.' }, b('How do you open a strong 3-minute B1 monologue on this article?', 'Comment bien ouvrir votre exposé B1 sur ce texte ?'), [b('State the topic, mention both views in the text, then announce your own opinion.', 'Présenter le thème, résumer les deux avis du texte, puis annoncer son propre point de vue.'), b('Read the whole text word for word from start to finish.', 'Lire tout le texte mot à mot du début à la fin.'), b('Simply say “I agree” and wait for questions.', 'Dire juste « Je suis d’accord » et attendre les questions.'), b('Talk for three minutes about your weekend instead.', 'Parler pendant trois minutes de son dernier week-end.')]),
      say('Ce texte pose la question des devoirs à la maison. Personnellement, je pense que dix minutes de lecture suffisent pour réviser sans fatiguer les enfants.', 'This text raises the question of homework. Personally, I think ten minutes of reading is enough to revise without tiring children.'),
      say('Bonjour, je vous appelle parce que le colis commandé la semaine dernière n’est toujours pas arrivé. Serait-il possible de vérifier où il se trouve ou d’envoyer un nouvel article ?', 'Hello, I’m calling because the parcel ordered last week still hasn’t arrived. Could you check where it is or send a new item?'),
    ],
    [
      b('In Part 2 (role-play), clarify the problem, react to the examiner’s excuses and reach an agreement.', 'En partie 2 (jeu de rôle), posez le problème, réagissez aux réponses et trouvez un accord.'),
      b('In Part 3 (monologue), summarise briefly (20%) and argue personally (80%).', 'En partie 3 (exposé), résumez brièvement (20 %) et donnez votre avis (80 %).'),
      b('Ask politely if you miss a question: « Pourriez-vous reformuler, s’il vous plaît ? »', 'Demandez poliment si besoin : « Pourriez-vous reformuler, s’il vous plaît ? »'),
    ],
    [['une relance', b('a follow-up question', 'question pour approfondir')], ['parvenir à un accord', b('to reach an agreement', 'se mettre d’accord')], ['en résumé', b('to sum up', 'en bref')]],
  ),
];
