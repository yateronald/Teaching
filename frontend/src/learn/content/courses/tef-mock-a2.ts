import type { CourseAbout } from '../../types';
import { b, card, dlg, doc, exam, gap, hear, lesson, mc, P, say, sort, tip, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Ready to check your A2 readiness in the TEF format? This full A2 practice set takes you through all four papers: timed everyday listening messages, practical reading notices and emails, guided A2 writing practice toward Sections A and B, and A2 speaking routines for asking information (Section A) and inviting a friend (Section B). Follow the timers, compare with the complete models and spot what to review next.',
    'Prêt à tester votre niveau A2 au format du TEF ? Cet entraînement complet couvre les quatre compétences : messages audio du quotidien chronométrés, panneaux et annonces pratiques en lecture, pratique écrite A2 vers les sections A et B, et entraînement oral pour poser des questions (section A) et convaincre un ami (section B). Respectez les temps et comparez vos réponses aux modèles.',
  ),
  outcomes: [
    b('Answer timed A2 listening and reading questions accurately', 'Réussir les questions A2 d’écoute et de lecture sous chrono'),
    b('Continue a simple news story in the past tense (Section A)', 'Poursuivre un fait divers simple au passé (section A)'),
    b('Give clear everyday reasons in a short opinion reply', 'Donner des raisons simples dans une courte lettre d’opinion'),
    b('Handle basic TEF speaking Section A and Section B exchanges', 'Mener les échanges de base des sections A et B à l’oral'),
  ],
};

const C = 'tef-mock-a2';
export default [
  lesson(C, 1, ['listening-and-reading-a2', 'comprehension-a2'],
    b('Listening and reading (timed)', 'Compréhension orale et écrite (chronométrée)'),
    b('Practise everyday TEF A2 listening clips and short practical documents under time pressure.', 'S’entraîner aux extraits audio et documents pratiques A2 du TEF sous chronomètre.'),
    [b('Catch hours, locations and instructions on one listen', 'Saisir heures, lieux et consignes en une écoute'), b('Read ads, emails and notices within 45 seconds', 'Lire annonces, courriels et avis en 45 secondes'), b('Notice changes introduced by mais or sauf', 'Repérer les précisions après mais ou sauf')],
    13,
    [
      exam(b('A2 mock briefing', 'Consignes du test A2'), b('Play each audio **once only** and read each short document within its **45-second timer**. Read the question before scanning the document.', 'Écoutez chaque extrait **une seule fois** et lisez chaque document dans le temps de **45 secondes**. Lisez toujours la question avant de parcourir le texte.')),
      hear('Bonjour, ici la pharmacie Saint-Jean. Votre commande de médicaments est arrivée. Vous pouvez passer la chercher aujourd’hui jusqu’à dix-neuf heures, ou demain matin dès neuf heures.', b('Until what time can you pick up the order today?', 'Jusqu’à quelle heure peut-on récupérer la commande aujourd’hui ?'), [b('7:00 p.m.', '19 h'), b('9:00 a.m.', '9 h'), b('noon', 'midi'), b('tomorrow evening', 'demain soir')], { voice: 'f', timer: 35 }),
      hear('— Tu prends le métro pour rentrer ce soir ? — Non, la station est fermée pour travaux cette semaine, alors je prends le bus 24 juste devant la mairie.', b('How is the speaker going home tonight?', 'Comment le locuteur rentre-t-il ce soir ?'), [b('by bus 24', 'en bus 24'), b('by metro', 'en métro'), b('on foot', 'à pied'), b('by taxi', 'en taxi')], { voice: 'm', timer: 35 }),
      hear('Attention, passagers du traversier de seize heures : en raison d’un vent fort, l’embarquement se fera au quai numéro deux au lieu du quai un.', b('What has changed for the 4 p.m. ferry?', 'Qu’est-ce qui a changé pour le traversier de 16 h ?'), [b('the boarding dock', 'le quai d’embarquement'), b('the departure time', 'l’heure de départ'), b('the destination', 'la destination'), b('the ticket price', 'le prix du billet')], { voice: 'f2', timer: 35 }),
      doc({ look: 'ad', title: b('Bike rental shop', 'Location de vélos'), text: 'VÉLO-PARC\nOuvert samedi et dimanche de 9 h à 18 h.\n15 $ la demi-journée / 25 $ la journée.\nCasque et cadenas fournis gratuitement.' }, b('What is included for free?', 'Qu’est-ce qui est prêté gratuitement ?'), [b('helmet and lock', 'le casque et le cadenas'), b('a half-day extension', 'une demi-journée en plus'), b('a picnic basket', 'un panier pique-nique'), b('a rain jacket', 'un imperméable')], { timer: 45 }),
      doc({ look: 'email', title: b('Club welcome email', 'Courriel du club'), text: 'Bonjour Karim,\n\nVotre inscription au club de badminton est validée ! Le premier cours aura lieu mercredi à 19 h au gymnase Nord. Apportez des chaussures propres pour l’intérieur ; les raquettes sont prêtées sur place.\n\nL’équipe du club' }, b('What must Karim bring on Wednesday?', 'Que doit apporter Karim mercredi ?'), [b('clean indoor shoes', 'des chaussures propres pour l’intérieur'), b('his own racket', 'sa propre raquette'), b('a registration fee in cash', 'les frais d’inscription en espèces'), b('a medical certificate', 'un certificat médical')], { timer: 45 }),
      doc({ look: 'notice', title: b('Library notice', 'Avis de la bibliothèque'), text: 'BIBLIOTHÈQUE MUNICIPALE\nVous pouvez emprunter jusqu’à 8 livres pour 3 semaines.\nLes jeux vidéo et les revues se prêtent pour 1 semaine seulement.' }, b('How long can you borrow a magazine?', 'Combien de temps peut-on emprunter une revue ?'), [b('1 week', '1 semaine'), b('3 weeks', '3 semaines'), b('8 days', '8 jours'), b('2 weeks', '2 semaines')], { timer: 45 }),
    ],
    [
      b('Track time words carefully: jusqu’à (until), dès (from), au lieu de (instead of).', 'Repérez bien jusqu’à, dès et au lieu de.'),
      b('In ads and notices, separate what is free/provided from what you must bring.', 'Dans les annonces, distinguez ce qui est fourni de ce que vous devez apporter.'),
      b('Check exact rules for different categories (books vs magazines).', 'Vérifiez si une règle change selon l’objet (livres vs revues).'),
    ],
    [['un traversier', b('a ferry (Québec)', 'bateau de passage')], ['un cadenas', b('a padlock / bike lock', 'fermeture de sécurité')], ['emprunter', b('to borrow', 'prendre pour un temps')]],
  ),
  lesson(C, 2, ['writing-a2-practice', 'expression-ecrite-a2'],
    b('Writing practice at A2', 'Pratique de l’expression écrite (A2)'),
    b('Practise continuing a simple news story and writing a clear everyday opinion.', 'S’entraîner à poursuivre un fait divers simple et à donner un avis clair au niveau A2.'),
    [b('Continue a short news story in past tenses', 'Poursuivre un fait divers simple au passé'), b('Keep details consistent with the prompt', 'Rester cohérent avec le début donné'), b('State an everyday opinion with two simple reasons', 'Donner un avis avec deux raisons simples')],
    13,
    [
      card(b('A2 in TEF writing', 'Le niveau A2 à l’écrit du TEF'), b('In **Section A**, use **passé composé** and **imparfait** accurately, keep names/places consistent and write a clear ending (80+ words). In **Section B**, state clearly whether you agree and support your view with **deux raisons simples** and examples.', 'En **section A**, employez bien **passé composé** et **imparfait**, gardez les mêmes lieux/noms et terminez l’histoire (80+ mots). En **section B**, dites clairement votre avis avec **deux raisons simples** et des exemples.')),
      doc({ look: 'article', title: b('News lead', 'Début d’article'), text: 'Un sac à dos oublié dans le bus rend le sourire à une étudiante\nMardi matin, à Québec, Paul Gagnon, chauffeur d’autobus, a trouvé un sac à dos bleu sur le dernier siège après son service. À l’intérieur, il y avait un ordinateur portable et un cahier de notes sans numéro de téléphone.' }, b('Why was it hard to contact the owner right away?', 'Pourquoi était-il difficile de joindre la propriétaire tout de suite ?'), [b('there was no phone number in the notebook', 'il n’y avait pas de numéro de téléphone dans le cahier'), b('the bus was out of service all week', 'le bus était en panne toute la semaine'), b('the backpack was completely empty', 'le sac à dos était totalement vide'), b('Paul Gagnon was on holiday', 'Paul Gagnon était en vacances')]),
      gap(P.completeText, 'Paul ___ le cahier et ___ une carte d’étudiante de l’université Laval. Il ___ très tard, mais il ___ l’accueil de l’université le lendemain matin.', ['a ouvert', 'a vu', 'était', 'a appelé'], { choices: [['a ouvert', 'ouvrait', 'ouvrira'], ['a vu', 'voyait', 'verra'], ['était', 'a été', 'est'], ['a appelé', 'appelait', 'appelle']] }),
      write(b('Section A practice (80–120 words)', 'Section A (80–120 mots)'), b('Continue the news story about Paul Gagnon and the blue backpack found on the bus in Québec City: say how he found the student and how she reacted.', 'Poursuivez le fait divers sur Paul Gagnon et le sac à dos bleu trouvé dans le bus à Québec : racontez comment il a retrouvé l’étudiante et sa réaction.'), 80, 120, [
        b('Same city, name and backpack colour', 'Même ville, même nom et sac bleu'),
        b('Clear passé composé and imparfait', 'Passé composé et imparfait clairs'),
        b('Logical, positive ending', 'Fin logique et claire'),
      ], 'En regardant la première page du cahier, Paul a vu le nom d’une étudiante : Sarah Tremblay, inscrite à l’université Laval. Le lendemain matin, avant de commencer sa journée, le chauffeur est allé déposer le sac au bureau des objets trouvés du campus.\n\nUne heure plus tard, Sarah a reçu un courriel de l’université. Elle était très inquiète parce que son travail de fin de session se trouvait dans l’ordinateur. « Je suis tellement soulagée, merci infiniment à ce chauffeur honnête ! », a-t-elle dit avec un grand sourire. Elle a envoyé une carte de remerciement à Paul le soir même.'),
      write(b('Simple opinion letter (90–140 words)', 'Courte lettre d’opinion (90–140 mots)'), b('React to: « Il faudrait proposer du sport tous les jours à l’école. » Write a short letter giving your opinion with two clear reasons and an example.', 'Réagissez à : « Il faudrait proposer du sport tous les jours à l’école. » Écrivez une courte lettre avec votre avis, deux raisons simples et un exemple.'), 90, 140, [
        b('Clear agreement or disagreement', 'Position claire pour ou contre'),
        b('Two simple, explained reasons', 'Deux raisons simples et expliquées'),
        b('Friendly/polite greeting and closing', 'Salutation et clôture adaptées'),
      ], 'Bonjour Madame, Monsieur,\n\nJe vous écris parce que j’ai lu votre article sur le sport à l’école. À mon avis, faire un peu de sport tous les jours est une très bonne idée pour les enfants.\n\nD’abord, c’est excellent pour la santé. Aujourd’hui, beaucoup de jeunes restent assis devant les écrans après les cours. Bouger trente minutes chaque jour leur donne plus d’énergie.\n\nEnsuite, le sport aide les élèves à se concentrer en classe. Par exemple, mon petit frère est beaucoup plus calme et attentif quand il a eu cours de natation ou de football le matin.\n\nBien sûr, il faut garder assez de temps pour les mathématiques et le français, mais une courte activité quotidienne est possible. C’est pourquoi je suis tout à fait pour.\n\nCordialement,\nYasmine Benali'),
      tip(b('Check verb endings before finishing', 'Vérifiez les terminaisons avant de finir'), b('Make sure past actions in Section A stay in **passé composé / imparfait** without jumping randomly to the present tense.', 'Vérifiez que les actions passées en section A restent bien au **passé composé / à l’imparfait** sans sauter au présent par erreur.')),
    ],
    [
      b('Stay faithful to every clue in the news lead (city, colour, object, names).', 'Respectez chaque détail du début d’article (ville, couleur, objet, noms).'),
      b('Use passé composé for actions and imparfait for feelings or background.', 'Passé composé pour les actions ; imparfait pour les émotions ou le décor.'),
      b('In opinion writing, give a clear stance + d’abord + ensuite + simple example.', 'En opinion, donnez un avis net + d’abord + ensuite + exemple simple.'),
    ],
    [['soulagé', b('relieved', 'rassuré après une peur')], ['les objets trouvés', b('lost property', 'bureau des objets perdus')], ['attentif', b('attentive / focused', 'bien concentré')]],
  ),
  lesson(C, 3, ['speaking-a2-practice', 'expression-orale-a2'],
    b('Speaking practice at A2', 'Pratique de l’expression orale (A2)'),
    b('Ask clear Section A questions on an ad and persuade a friend warmly in Section B.', 'Poser des questions claires en section A et convaincre un ami simplement en section B.'),
    [b('Ask 6–8 clear questions on missing details in Section A', 'Poser 6 à 8 questions simples sur l’annonce en section A'), b('Use polite vous on the phone in Section A', 'Employer le vous poli au téléphone en section A'), b('Invite and reassure a friend using tu in Section B', 'Inviter et rassurer un ami avec tu en section B')],
    13,
    [
      card(b('A2 speaking priorities', 'Priorités orales au niveau A2'), b('In **Section A**, stay polite (**vous**), ask clear questions with **combien, quand, où, est-ce que**, and react simply (**D’accord, merci**). In **Section B**, use **tu**, present the event warmly and give one simple answer to each hesitation.', 'En **section A**, restez poli (**vous**), posez des questions simples avec **combien, quand, où, est-ce que** et réagissez (**D’accord, merci**). En **section B**, utilisez **tu**, présentez l’activité avec enthousiasme et répondez simplement à chaque hésitation.')),
      doc({ look: 'ad', title: b('Section A ad', 'Annonce section A'), text: 'CLUB DE CONVERSATION EN FRANÇAIS\nTous les mercredis de 18 h à 19 h 30\nCafé du Parc — 12, rue Saint-Denis\nAmbiance détendue, café inclus !' }, b('Which information is missing and useful to ask?', 'Quelle information manque et mérite une question ?'), [b('the price and the required French level', 'le prix et le niveau de français demandé'), b('the day of the week', 'le jour de la semaine'), b('the street address', 'l’adresse exacte'), b('the closing time', 'l’heure de fin')]),
      dlg(b('Section A: calling the conversation club', 'Section A : appeler le club de conversation'), undefined, [['Vous', 'm'], ['Organisatrice', 'f']], [
        [0, { options: ['Bonjour Madame, je vous appelle pour le club de conversation du mercredi. J’ai quelques questions, s’il vous plaît.', 'Allô, c’est combien le café mercredi ?', 'Salut, je veux venir parler français.'] }],
        [1, 'Bonjour Monsieur, je vous écoute avec plaisir.', 'Hello Sir, go right ahead.'],
        [0, { options: ['Combien coûte une séance, et quel niveau faut-il pour participer ?', 'C’est quel jour déjà ?', 'C’est dans quel café ?'] }],
        [1, 'C’est dix dollars par séance, et tous les niveaux à partir d’A2 sont bienvenus.', 'It’s ten dollars per session, and all levels from A2 up are welcome.'],
        [0, { options: ['Parfait ! Faut-il réserver sa place avant de venir ?', 'D’accord, fin de l’appel.', 'Dix dollars, c’est bon.'] }],
      ], true),
      say('Salut Maya ! J’ai vu une annonce super pour un atelier de cuisine italienne samedi matin. Ça te dirait de venir avec moi ?', 'Hi Maya! I saw a great ad for an Italian cooking workshop on Saturday morning. Would you like to come with me?'),
      mc(P.best, ['Je comprends que tu sois fatiguée, mais le cours commence seulement à 10 h 30, et après on mange ensemble !', 'Tu es toujours fatiguée, viens quand même !', 'Bon, alors je vais y aller tout seul.', 'Ce n’est pas vrai, tu as plein de temps libre.'], { fr: 'Section B — votre amie dit : « Samedi matin, je suis un peu fatiguée… » Que répondez-vous au niveau A2 ?' }),
      sort(b('Section A (vous) or Section B (tu)?', 'Section A (vous) ou Section B (tu) ?'), [b('Section A (ask info, vous)', 'Section A (s’informer, vous)'), b('Section B (convince friend, tu)', 'Section B (convaincre un ami, tu)')], [['Est-ce que le matériel est compris ?', 0], ['Tu vas adorer, il y a une super ambiance !', 1], ['Pouvez-vous me dire si je dois réserver ?', 0], ['On pourrait partager le trajet en voiture.', 1], ['Combien de places reste-t-il ?', 0], ['Ça te ferait vraiment plaisir de sortir !', 1]]),
    ],
    [
      b('Keep Section A in polite vous and never ask facts already printed in the ad.', 'Gardez le vous poli en section A sans demander ce que l’annonce indique déjà.'),
      b('Switch cleanly to friendly tu in Section B when speaking to a friend.', 'Passez naturellement au tu amical en section B face à l’ami.'),
      b('Use simple, positive solutions (share transport, go together, start later) for objections.', 'Proposez des solutions simples (covoiturage, y aller ensemble) face aux hésitations.'),
    ],
    [['détendu', b('relaxed', 'calme et agréable')], ['ça te dirait de…', b('would you feel like…', 'est-ce que tu aurais envie de…')], ['une séance', b('a session', 'un cours ou une rencontre')]],
  ),
];
