import type { CourseAbout } from '../../types';
import { b, dlg, doc, hear, lesson, mc, P, say, tip, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'A complete practice set at B2 level, the target for NCLC 7: timed listening and reading questions on opinions, arguments and implicit meaning, the three writing tasks with demanding topics, and the three speaking tasks with model answers. Treat it as a real exam: one listening, strict timing, then compare with the models. All documents are original practice material.',
    'Un entraînement complet de niveau B2, l’objectif du NCLC 7 : questions chronométrées de compréhension orale et écrite sur les opinions, les arguments et l’implicite, les trois tâches écrites sur des sujets exigeants, et les trois tâches orales avec des réponses modèles. Traitez-le comme un vrai examen : une seule écoute, un temps strict, puis comparez avec les modèles. Tous les documents sont des supports d’entraînement originaux.',
  ),
  outcomes: [
    b('Practise B2 comprehension under time pressure', 'S’entraîner à la compréhension B2 en temps limité'),
    b('Write the three tasks at B2 level', 'Rédiger les trois tâches au niveau B2'),
    b('Practise demanding speaking tasks', 'S’entraîner à des tâches orales exigeantes'),
    b('Measure your distance to NCLC 7', 'Mesurer la distance au NCLC 7'),
  ],
};

const C = 'tcf-mock-b2';
export default [
  lesson(C, 1, ['listening-and-reading', 'comprehension-orale-et-ecrite'],
    b('Listening and reading (timed)', 'Compréhension orale et écrite (chronométrée)'),
    b('Answer B2 questions on opinions, arguments and purpose within the time limit.', 'Répondre à des questions B2 sur opinions, arguments et objectifs dans le temps imparti.'),
    [b('Identify attitudes', 'Identifier les attitudes'), b('Identify arguments and purpose', 'Identifier arguments et objectifs'), b('Manage time', 'Gérer le temps')],
    13,
    [
      hear('On présente souvent la voiture électrique comme la solution miracle. Elle réduit certes la pollution en ville, mais sa fabrication, et surtout celle des batteries, reste très gourmande en ressources. Le vrai progrès, ce serait d’avoir moins de voitures, pas seulement des voitures différentes.', b('What is the speaker’s main idea?', 'Quelle est l’idée principale du locuteur ?'), [b('Electric cars are not enough; we need fewer cars.', 'La voiture électrique ne suffit pas ; il faut moins de voitures.'), b('Electric cars are a miracle solution.', 'La voiture électrique est la solution miracle.'), b('Batteries are cheap to make.', 'Les batteries sont bon marché à fabriquer.'), b('Pollution in cities has disappeared.', 'La pollution en ville a disparu.')], { voice: 'm', timer: 60 }),
      hear('Je me réjouis que la ville ouvre enfin des pistes cyclables protégées. Encore faudrait-il qu’elles soient reliées entre elles : pour l’instant, on passe d’une piste magnifique à un carrefour dangereux.', b('What is the speaker’s attitude?', 'Quelle est l’attitude de la locutrice ?'), [b('pleased but critical about the lack of continuity', 'contente mais critique sur le manque de continuité'), b('totally opposed to bike lanes', 'totalement opposée aux pistes cyclables'), b('indifferent', 'indifférente'), b('fully satisfied', 'entièrement satisfaite')], { voice: 'f', timer: 60 }),
      hear('Contrairement à ce qu’on pourrait croire, ce ne sont pas les jeunes qui passent le plus de temps devant les écrans en semaine, mais les adultes de trente-cinq à cinquante ans, à cause du travail.', b('According to the speaker, who spends the most screen time on weekdays?', 'Selon le locuteur, qui passe le plus de temps devant les écrans en semaine ?'), [b('adults aged 35–50, because of work', 'les adultes de 35 à 50 ans, à cause du travail'), b('young people', 'les jeunes'), b('retired people', 'les retraités'), b('children', 'les enfants')], { voice: 'm', timer: 60 }),
      doc({ look: 'article', title: b('Opinion', 'Tribune'), text: 'On reproche souvent aux réseaux sociaux de diviser la société. Il est vrai que leurs algorithmes favorisent les contenus qui suscitent l’indignation. Mais accuser l’outil revient à oublier ceux qui l’utilisent : les polémiques existaient bien avant internet. Plutôt que d’interdire, apprenons à lire, à vérifier et à débattre.' }, b('What does the author propose?', 'Que propose l’auteur ?'), [b('to educate users rather than ban', 'éduquer les utilisateurs plutôt qu’interdire'), b('to ban social networks', 'interdire les réseaux sociaux'), b('to stop debating', 'arrêter de débattre'), b('to change algorithms only', 'changer seulement les algorithmes')], { timer: 90 }),
      doc({ look: 'article', title: b('Report', 'Reportage'), text: 'Depuis deux ans, la commune de Saint-Lys propose des « repair cafés » mensuels. Des bénévoles y réparent gratuitement grille-pain, vélos et vêtements. Au-delà des économies, les organisateurs insistent sur un autre bénéfice : « On répare des objets, mais surtout des liens entre voisins. »' }, b('What other benefit do the organisers emphasise?', 'Quel autre bénéfice les organisateurs soulignent-ils ?'), [b('creating ties between neighbours', 'créer des liens entre voisins'), b('saving money', 'faire des économies'), b('selling repaired objects', 'vendre des objets réparés'), b('training professionals', 'former des professionnels')], { timer: 90 }),
      doc({ look: 'email', title: b('Email', 'Courriel'), text: 'Madame la Directrice,\n\nParents d’élèves de l’école Jacques-Cartier, nous souhaitons attirer votre attention sur la sécurité aux abords de l’établissement. Chaque matin, des voitures stationnent sur le trottoir, obligeant les enfants à marcher sur la chaussée. Nous vous demandons d’intervenir auprès de la municipalité afin qu’un agent soit présent aux heures d’entrée.' }, b('What is the purpose of this email?', 'Quel est l’objectif de ce courriel ?'), [b('to ask the principal to act with the city for safety', 'demander à la directrice d’agir auprès de la ville pour la sécurité'), b('to complain about teachers', 'se plaindre des enseignants'), b('to thank the city', 'remercier la ville'), b('to invite parents to a party', 'inviter les parents à une fête')], { timer: 90 }),
    ],
    [
      b('B2 questions: main idea, attitude, purpose, proposal.', 'Questions B2 : idée principale, attitude, objectif, proposition.'),
      b('Watch for concessions: certes…, mais…; encore faudrait-il…', 'Repérez les concessions : certes…, mais… ; encore faudrait-il…'),
      b('Note the questions you missed and their type.', 'Notez les questions manquées et leur type.'),
    ],
    [['susciter', b('to arouse, provoke', 'provoquer')], ['l’indignation', b('outrage', 'colère morale')], ['aux abords de', b('around, near', 'autour de')]],
  ),
  lesson(C, 2, ['writing-tasks', 'expression-ecrite'],
    b('The three writing tasks (B2)', 'Les trois tâches écrites (B2)'),
    b('Write tasks 1, 2 and 3 at B2 level in about 60 minutes.', 'Rédiger les tâches 1, 2 et 3 au niveau B2 en environ 60 minutes.'),
    [b('Task 1 with precise vocabulary', 'Tâche 1 avec un lexique précis'), b('Task 2 with rich narration', 'Tâche 2 avec une narration riche'), b('Task 3 with nuanced argument', 'Tâche 3 avec une argumentation nuancée')],
    13,
    [
      write(b('Task 1 (60–120 words)', 'Tâche 1 (60–120 mots)'), b('You organise a farewell party for a colleague who is retiring. Write to your team: date, place, the gift you plan, and ask for contributions.', 'Vous organisez un pot de départ pour un collègue qui part à la retraite. Écrivez à l’équipe : date, lieu, le cadeau prévu, et demandez une participation.'), 60, 120, [
        b('Date, place, gift', 'Date, lieu, cadeau'),
        b('Request for contributions', 'Demande de participation'),
        b('Appropriate register for colleagues', 'Registre adapté à des collègues'),
      ], 'Bonjour à toutes et à tous,\n\nComme vous le savez, Gérard prendra sa retraite à la fin du mois après vingt-cinq ans parmi nous. Pour lui dire au revoir comme il se doit, je vous propose un pot de départ le vendredi 28 juin à 16 h, dans la salle de réunion du troisième étage.\n\nNous aimerions lui offrir un vélo électrique, lui qui rêve de parcourir la route des vins. Si vous souhaitez participer, vous pouvez déposer votre contribution dans l’enveloppe à mon bureau avant le 21 juin.\n\nMerci d’avance,\nCamille'),
      write(b('Task 2 (120–150 words)', 'Tâche 2 (120–150 mots)'), b('You attended a public meeting about a project in your neighbourhood (a new tramway). Write an article for the local newspaper: tell what happened and give your impressions.', 'Vous avez assisté à une réunion publique sur un projet dans votre quartier (un nouveau tramway). Écrivez un article pour le journal local : racontez ce qui s’est passé et donnez vos impressions.'), 120, 150, [
        b('Events in the past', 'Événements au passé'),
        b('Different viewpoints heard', 'Points de vue entendus'),
        b('Your impressions', 'Vos impressions'),
      ], 'Tramway : un débat animé mais constructif\n\nMardi soir, plus de deux cents habitants se sont réunis au centre communautaire pour découvrir le projet de tramway. Après une présentation des ingénieurs de la ville, la parole a été donnée au public. Les commerçants de la rue principale se sont inquiétés des deux années de travaux, tandis que de nombreux parents ont salué une solution plus sûre et moins polluante que les autobus actuels.\n\nCe qui m’a frappé, c’est la qualité des échanges : malgré quelques moments tendus, chacun a pu s’exprimer. La mairie a promis des compensations pour les commerces touchés. Reste à voir si ces promesses seront tenues, mais j’ai quitté la salle plutôt optimiste. Une nouvelle réunion est prévue en janvier pour présenter le calendrier des travaux.'),
      write(b('Task 3 (120–180 words)', 'Tâche 3 (120–180 mots)'), b('Document 1: « La semaine de quatre jours améliore le bien-être et la productivité. » Document 2: « Concentrer le travail sur quatre jours épuise les salariés et désorganise les services. » Present both views, then give your opinion.', 'Document 1 : « La semaine de quatre jours améliore le bien-être et la productivité. » Document 2 : « Concentrer le travail sur quatre jours épuise les salariés et désorganise les services. » Présentez les deux avis, puis donnez votre opinion.'), 120, 180, [
        b('Part 1: both views, reformulated', 'Partie 1 : les deux avis, reformulés'),
        b('Part 2: nuanced opinion with examples', 'Partie 2 : avis nuancé avec exemples'),
        b('B2 connectors', 'Connecteurs B2'),
      ], 'La semaine de quatre jours suscite le débat. Pour le premier document, elle améliore à la fois le bien-être des salariés et leur efficacité. Le second, à l’inverse, estime que des journées plus longues fatiguent les employés et compliquent le fonctionnement des services.\n\nPour ma part, je pense que cette organisation peut être bénéfique, à condition d’être adaptée à chaque métier. D’une part, un jour de repos supplémentaire permet de mieux concilier travail et vie familiale : une amie infirmière, qui travaille désormais quatre jours, affirme être moins stressée. D’autre part, je reconnais que dans certains services, comme l’accueil du public, l’absence d’un jour peut poser problème. Une rotation des équipes serait alors une solution. En somme, la semaine de quatre jours n’est ni une panacée ni une menace : tout dépend de sa mise en œuvre.'),
    ],
    [
      b('B2 writing: precise vocabulary, complex sentences, nuance.', 'Écrit B2 : lexique précis, phrases complexes, nuance.'),
      b('Task 3: balance both parts; nuanced position.', 'Tâche 3 : équilibre des deux parties ; position nuancée.'),
      b('Compare each text with the model.', 'Comparez chaque texte avec le modèle.'),
    ],
    [['un pot de départ', b('a farewell drink', 'petite fête de départ')], ['une panacée', b('a cure-all', 'solution à tout')], ['la mise en œuvre', b('implementation', 'réalisation')]],
  ),
  lesson(C, 3, ['speaking-tasks', 'expression-orale'],
    b('The three speaking tasks (B2)', 'Les trois tâches orales (B2)'),
    b('Practise demanding versions of tasks 1, 2 and 3.', 'S’entraîner à des versions exigeantes des tâches 1, 2 et 3.'),
    [b('Task 1 with depth', 'Tâche 1 approfondie'), b('Task 2 with negotiation', 'Tâche 2 avec négociation'), b('Task 3 with nuance', 'Tâche 3 avec nuance')],
    13,
    [
      mc(P.best, ['Ce qui me motive, c’est d’abord la qualité de vie : j’ai visité Québec il y a deux ans et j’ai été séduite par l’équilibre entre ville et nature. Professionnellement, mon domaine, l’informatique de santé, y est en pleine croissance.', 'Parce que c’est bien.', 'Le Canada, c’est grand.', 'Je ne sais pas trop.'], { fr: 'Tâche 1 — « Pourquoi souhaitez-vous vous installer au Canada ? »' }),
      dlg(b('Task 2: organising a team event', 'Tâche 2 : organiser un événement d’équipe'), undefined, [['Vous', 'm'], ['Examinatrice (traiteur)', 'f']], [
        [0, { options: ['Bonjour, nous organisons un repas pour quarante collègues et j’aimerais connaître vos conditions.', 'Repas. Quarante. Prix ?', 'Vous faites à manger ?'] }],
        [1, 'Volontiers. Nous proposons des menus à partir de 30 dollars par personne.', 'Gladly. We offer menus from 30 dollars per person.'],
        [0, { options: ['Est-il possible d’adapter le menu pour les personnes végétariennes et celles qui ont des allergies ?', 'D’accord. Au revoir.', 'C’est trop.'] }],
        [1, 'Bien sûr, il suffit de nous le signaler une semaine à l’avance.', 'Of course, just tell us a week in advance.'],
        [0, { options: ['Parfait. Et pour un groupe de cette taille, accordez-vous une remise si nous réservons dès maintenant ?', 'Bon, merci.', 'Ok.'] }],
      ]),
      say('Disons que je suis partagé. Certes, l’intelligence artificielle peut faire gagner un temps précieux aux médecins ; cela dit, la décision finale doit rester humaine.', 'Let’s say I’m torn. Admittedly, AI can save doctors precious time; that said, the final decision must remain human.', { tip: b('Task 3 at B2: concede, then take a clear position.', 'Tâche 3 au B2 : concédez, puis prenez une position claire.') }),
      tip(b('Self-assessment', 'Auto-évaluation'), b('After recording, rate yourself from 1 to 5 on: **structure, fluency, precision, nuance, interaction**. Below 3 on one criterion? Make it your priority for next week.', 'Après l’enregistrement, notez-vous de 1 à 5 sur : **structure, fluidité, précision, nuance, interaction**. Moins de 3 sur un critère ? Faites-en votre priorité de la semaine.')),
    ],
    [
      b('Task 1: reasons and personal examples.', 'Tâche 1 : raisons et exemples personnels.'),
      b('Task 2: precise questions and negotiation.', 'Tâche 2 : questions précises et négociation.'),
      b('Task 3: concession + clear position.', 'Tâche 3 : concession + position claire.'),
    ],
    [['un traiteur', b('a caterer', 'qui prépare des repas')], ['séduit', b('charmed, won over', 'attiré')], ['partagé', b('torn, of two minds', 'hésitant')]],
  ),
];
