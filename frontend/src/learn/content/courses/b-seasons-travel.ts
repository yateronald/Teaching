import type { CourseAbout } from '../../types';
import { b, card, dict, dlg, doc, flash, gap, hear, lesson, mc, ord, P, pairs, say, sort } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Ready for a trip by train or plane? This beginner course walks you through every step from packing at home to arriving at the station or airport. You will learn seasonal clothes and travel essentials, how to buy a train ticket and read platform and seat details, and how to check in a bag and understand boarding information.',
    'Prêt pour un départ en train ou en avion ? Ce cours pour débutants vous accompagne de la valise à la maison jusqu’à la gare et à l’aéroport. Vous apprendrez les vêtements selon la saison et les indispensables du voyage, comment acheter un billet de train et lire voie, voiture et place, ainsi que comment enregistrer un bagage et lire une carte d’embarquement.',
  ),
  outcomes: [
    b('Pack clothes and essentials by season', 'Préparer sa valise selon la saison'),
    b('Buy a train ticket and ask for connections', 'Acheter un billet de train et vérifier les correspondances'),
    b('Read train tickets and boarding passes', 'Lire billets de train et cartes d’embarquement'),
    b('Check luggage at the airport counter', 'Enregistrer un bagage au comptoir de l’aéroport'),
  ],
};

const C = 'b-seasons-travel';
export default [
  lesson(C, 1, ['packing-for-the-trip', 'faire-sa-valise'],
    b('Packing for the trip', 'Faire sa valise'),
    b('Pack clothes for the season and check your travel essentials.', 'Choisir des vêtements adaptés à la saison et vérifier ses indispensables.'),
    [b('Name the four seasons', 'Nommer les quatre saisons'), b('Pack clothes for heat or cold', 'Choisir des vêtements selon la météo'), b('Check essential travel items', 'Vérifier les objets indispensables')],
    13,
    [
      card(b('Seasons & suitcase', 'Saisons et valise'), b('Seasons: **au printemps, en été, en automne, en hiver**. Clothes: **un manteau, un pull, un imperméable, des lunettes de soleil, un maillot de bain, une écharpe, des gants**. Essentials: **le passeport, le billet, le chargeur, un parapluie, la trousse de toilette**.', 'Saisons : **au printemps, en été, en automne, en hiver**. Vêtements : **un manteau, un pull, un imperméable, des lunettes de soleil, un maillot de bain, une écharpe, des gants**. Indispensables : **le passeport, le billet, le chargeur, un parapluie, la trousse de toilette**.'), {
        ex: [['En hiver à Québec, je prends un manteau chaud et des gants.', 'In winter in Québec, I pack a warm coat and gloves.'], ['J’ai mis mon passeport et mon chargeur dans mon sac à dos.', 'I put my passport and charger in my backpack.']],
      }),
      sort(b('Summer or winter suitcase?', 'Valise d’été ou d’hiver ?'), [b('summer', 'été'), b('winter', 'hiver')], [['un maillot de bain', 0], ['un gros pull en laine', 1], ['des lunettes de soleil', 0], ['une écharpe et des gants', 1], ['des sandales', 0], ['un manteau chaud', 1]]),
      hear('N’oublie pas ton passeport, ton chargeur de téléphone et un parapluie : il pleut souvent en automne.', b('Which three items are mentioned?', 'Quels trois objets sont mentionnés ?'), [b('passport, charger and umbrella', 'passeport, chargeur et parapluie'), b('train ticket, coat and gloves', 'billet de train, manteau et gants'), b('sunglasses, towel and hat', 'lunettes de soleil, serviette et chapeau'), b('keys, wallet and swimsuit', 'clés, portefeuille et maillot')], { voice: 'f' }),
      pairs(P.match, [['une valise', b('a suitcase', 'grand bagage de voyage')], ['un sac à dos', b('a backpack', 'sac porté sur le dos')], ['un imperméable', b('a raincoat', 'manteau contre la pluie')], ['une trousse de toilette', b('a toiletry bag', 'sac pour brosse et savon')]]),
      gap(P.complete, 'Il fait froid à Montréal en hiver : je prends un ___ chaud et des ___.', ['manteau', 'gants'], { choices: [['manteau', 'maillot', 'parapluie'], ['gants', 'sandales', 'lunettes']] }),
      ord(P.order, 'J’ai mis mon passeport et mon chargeur dans mon sac à dos.', { tr: 'I put my passport and charger in my backpack.', extra: ['valise'] }),
      say('Je fais ma valise pour quatre jours : je prends un pull, un imperméable et mon passeport.', 'I’m packing my suitcase for four days: I’m taking a jumper, a raincoat and my passport.'),
    ],
    [
      b('au printemps, en été, en automne, en hiver.', 'au printemps, en été, en automne, en hiver.'),
      b('faire sa valise · un sac à dos · un imperméable.', 'faire sa valise · un sac à dos · un imperméable.'),
      b('N’oublie pas ton passeport et ton chargeur !', 'N’oublie pas ton passeport et ton chargeur !'),
    ],
    [['un imperméable', b('a raincoat', 'vêtement contre la pluie')], ['le chargeur', b('the charger', 'câble pour la batterie')], ['faire sa valise', b('to pack one’s suitcase', 'préparer ses bagages')]],
  ),
  lesson(C, 2, ['buying-a-train-ticket', 'acheter-un-billet-de-train'],
    b('Buying a train ticket', 'Acheter un billet de train'),
    b('Ask for a single or return ticket, check connections and read car and platform info.', 'Demander un aller simple ou aller-retour, vérifier les correspondances et lire voie et voiture.'),
    [b('Buy a single or return ticket', 'Acheter un aller simple ou aller-retour'), b('Ask about connections and seat choice', 'Demander correspondance et place'), b('Read a train ticket', 'Lire un billet de train')],
    13,
    [
      card(b('At the station', 'À la gare'), b('Tickets: **un aller simple / un aller-retour pour Lyon**. Questions: **C’est direct ou il y a une correspondance ? · Le train part de quelle voie / de quel quai ?** Seats: **voiture 4, place 27, côté fenêtre / côté couloir, première ou deuxième classe**.', 'Billets : **un aller simple / un aller-retour pour Lyon**. Questions : **C’est direct ou il y a une correspondance ? · Le train part de quelle voie / de quel quai ?** Places : **voiture 4, place 27, côté fenêtre / côté couloir, première ou deuxième classe**.'), {
        ex: [['Un aller-retour pour Lyon, côté fenêtre, s’il vous plaît.', 'A return ticket to Lyon, window seat, please.'], ['Le train part voie D à neuf heures vingt.', 'The train leaves from track D at nine twenty.']],
      }),
      doc({ look: 'notice', title: b('Train ticket', 'Billet de train'), text: 'TRAIN GRANDE VITESSE 6214 — Paris → Marseille\nDépart : 09 h 18 · Arrivée : 12 h 32 (Direct)\nVoiture 4 · Place 27 (côté fenêtre, 2e classe)\nVoie affichée 20 minutes avant le départ.\nPrésentez votre billet lors du contrôle.' }, b('Where is seat 27 located?', 'Où se trouve la place 27 ?'), [b('car 4, window seat', 'voiture 4, côté fenêtre'), b('car 27, aisle seat', 'voiture 27, côté couloir'), b('car 4, first class', 'voiture 4, première classe'), b('platform 20', 'voie 20')]),
      dlg(b('At the ticket counter', 'Au guichet de la gare'), undefined, [['Vous', 'm'], ['Agent', 'f']], [
        [0, { options: ['Bonjour, je voudrais un aller-retour pour Bordeaux pour demain matin, s’il vous plaît.', 'Bordeaux demain billet.', 'Je vais dans un train.'] }],
        [1, 'Oui, il y a un train direct à huit heures trente. Vous préférez côté fenêtre ou côté couloir ?', 'Yes, there’s a direct train at eight thirty. Do you prefer window or aisle?'],
        [0, { options: ['Côté fenêtre, s’il vous plaît. C’est à quel quai ?', 'Oui, les deux.', 'Non, pas de train.'] }],
        [1, 'La voie est affichée vingt minutes avant le départ. Bon voyage !', 'The platform is displayed twenty minutes before departure. Have a good trip!'],
      ]),
      mc(P.best, ['Est-ce que le train est direct ou il y a une correspondance ?', 'Le train change ?', 'Où est l’autre train ?', 'Direct ou pas train ?'], { fr: 'Vous voulez savoir s’il faut changer de train :' }),
      dict('Le train pour Bordeaux part voie G à quatorze heures dix.', { voice: 'f' }),
      say('Un aller-retour pour Lyon, s’il vous plaît, plutôt côté fenêtre.', 'A return ticket to Lyon, please, preferably a window seat.'),
    ],
    [
      b('un aller simple / un aller-retour · direct ou correspondance.', 'un aller simple / un aller-retour · direct ou correspondance.'),
      b('voiture (carriage), place (seat), voie / quai (track / platform).', 'voiture, place, voie / quai.'),
      b('côté fenêtre / côté couloir.', 'côté fenêtre / côté couloir.'),
    ],
    [['une correspondance', b('a connection / transfer', 'changement de train')], ['un aller-retour', b('a return ticket', 'billet pour aller et revenir')], ['la voie', b('the track / platform', 'endroit où arrive le train')]],
  ),
  lesson(C, 3, ['at-the-airport', 'a-l-aeroport'],
    b('At the airport', 'À l’aéroport'),
    b('Check in luggage, read a boarding pass and understand gate announcements.', 'Enregistrer un bagage, lire une carte d’embarquement et comprendre les annonces.'),
    [b('Check in cabin and hold luggage', 'Enregistrer bagage en soute et cabine'), b('Read a boarding pass', 'Lire une carte d’embarquement'), b('Understand gate and delay announcements', 'Comprendre porte d’embarquement et retard')],
    13,
    [
      card(b('Check-in & boarding', 'Enregistrement et embarquement'), b('Key steps: **le comptoir d’enregistrement, enregistrer une valise en soute, un bagage cabine, le contrôle de sécurité, la carte d’embarquement, la porte d’embarquement, le décollage**. Status: **le vol est à l’heure / retardé / annulé**.', 'Étapes clés : **le comptoir d’enregistrement, enregistrer une valise en soute, un bagage cabine, le contrôle de sécurité, la carte d’embarquement, la porte d’embarquement, le décollage**. État du vol : **le vol est à l’heure / retardé / annulé**.'), {
        ex: [['J’ai une valise à enregistrer en soute et un sac en cabine.', 'I have a suitcase to check in and a cabin bag.'], ['L’embarquement commence porte quarante-deux.', 'Boarding starts at gate forty-two.']],
      }),
      doc({ look: 'notice', title: b('Boarding pass', 'Carte d’embarquement'), text: 'VOL AF 342 — Paris → Montréal\nPassagère : Nadia Benali\nEmbarquement : 13 h 15 · Décollage : 14 h 05\nPorte : K42 · Siège : 18A\n1 bagage en soute (23 kg) + 1 bagage cabine' }, b('At what time does boarding begin?', 'À quelle heure commence l’embarquement ?'), [b('1:15 p.m.', '13 h 15'), b('2:05 p.m.', '14 h 05'), b('1:42 p.m.', '13 h 42'), b('6:00 p.m.', '18 h 00')]),
      hear('Attention, les passagers du vol à destination de Québec : l’embarquement commence porte quatorze dans dix minutes. Préparez votre passeport et votre carte d’embarquement.', b('Which gate should passengers go to?', 'À quelle porte les passagers doivent-ils aller ?'), [b('gate 14', 'porte 14'), b('gate 10', 'porte 10'), b('gate 40', 'porte 40'), b('gate 4', 'porte 4')], { voice: 'm' }),
      pairs(P.match, [['un bagage en soute', b('checked luggage', 'valise mise dans l’avion')], ['un bagage cabine', b('carry-on bag', 'petit sac gardé avec soi')], ['la carte d’embarquement', b('the boarding pass', 'billet pour monter dans l’avion')], ['le décollage', b('take-off', 'moment où l’avion part')]]),
      mc(P.best, ['Bonjour, voici mon passeport. J’ai une valise à enregistrer en soute.', 'Prenez mon sac vite.', 'Je monte dans l’avion avec ma grande valise.', 'Où est la gare ?'], { fr: 'Au comptoir d’enregistrement à l’aéroport :' }),
      flash(b('Quick revision', 'Révision express'), [['Un aller-retour pour Lyon, s’il vous plaît.', b('A return ticket to Lyon, please.', 'billet aller et retour')], ['Il y a une correspondance ?', b('Is there a connection?', 'changement de train')], ['De quelle voie part le train ?', b('Which platform does the train leave from?', 'numéro de voie')], ['J’ai une valise à enregistrer.', b('I have a suitcase to check in.', 'déposer en soute')], ['Où est la porte d’embarquement ?', b('Where is the boarding gate?', 'accès à l’avion')]]),
      say('Bonjour, voici mon passeport. J’ai une valise à enregistrer en soute.', 'Hello, here is my passport. I have a suitcase to check in.'),
    ],
    [
      b('bagage en soute (checked) vs bagage cabine (carry-on).', 'bagage en soute (enregistré) / bagage cabine (avec soi).'),
      b('carte d’embarquement · contrôle de sécurité · porte.', 'carte d’embarquement · contrôle de sécurité · porte.'),
      b('le vol est à l’heure / retardé.', 'le vol est à l’heure / retardé.'),
    ],
    [['la soute', b('the luggage hold', 'partie inférieure de l’avion')], ['embarquer', b('to board', 'monter dans l’avion')], ['retardé', b('delayed', 'qui part plus tard que prévu')]],
  ),
];
