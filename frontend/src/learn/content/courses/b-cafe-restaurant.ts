import type { CourseAbout } from '../../types';
import { b, card, culture, dict, dlg, doc, flash, gap, hear, lesson, mc, ord, P, pairs, say, sort } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'From morning croissants at the bakery to lunch at a lively bistro, this beginner course gives you the everyday French to order drinks, pastries and meals with confidence. You will learn polite counter expressions, how to read a set-menu board (formule du midi), how to ask for tap water or seat preferences, and how to read a receipt and pay smoothly by card or cash.',
    'Du croissant du matin à la boulangerie au déjeuner dans un bistrot animé, ce cours pour débutants vous donne le français du quotidien pour commander boissons, viennoiseries et repas avec aisance. Vous apprendrez les formules polies au comptoir, la lecture d’une ardoise et d’une formule du midi, comment demander une carafe d’eau et comment vérifier un ticket et payer par carte ou en espèces.',
  ),
  outcomes: [
    b('Order bread, pastries and coffee politely', 'Commander pain, viennoiseries et café poliment'),
    b('Read a bistro menu and daily specials', 'Lire une carte de bistrot et une formule du midi'),
    b('Ask for tap water and table preferences', 'Demander une carafe d’eau et choisir sa place'),
    b('Ask for the bill and pay smoothly', 'Demander l’addition et payer sans hésiter'),
  ],
};

const C = 'b-cafe-restaurant';
export default [
  lesson(C, 1, ['at-the-bakery', 'a-la-boulangerie'],
    b('At the bakery & coffee counter', 'À la boulangerie et au comptoir'),
    b('Greet politely, order bread, pastries and hot drinks, and close your order.', 'Saluer poliment, commander pain, viennoiseries et boissons chaudes, et conclure sa commande.'),
    [b('Order bread and pastries', 'Commander pain et viennoiseries'), b('Order a coffee or tea', 'Commander un café ou un thé'), b('Answer « Et avec ceci ? »', 'Répondre à « Et avec ceci ? »')],
    13,
    [
      card(b('Ordering at the counter', 'Commander au comptoir'), b('Always begin with **Bonjour**, then say **Je voudrais…** or **Je vais prendre…** Pastries & bread: **une baguette tradition, un croissant, un pain au chocolat, une tartelette aux fraises**. Drinks: **un café allongé, un café crème, un thé à la menthe, un chocolat chaud**. To finish: **Ce sera tout, merci.**', 'Commencez toujours par **Bonjour**, puis dites **Je voudrais…** ou **Je vais prendre…** Pain et viennoiseries : **une baguette tradition, un croissant, un pain au chocolat, une tartelette aux fraises**. Boissons : **un café allongé, un café crème, un thé à la menthe, un chocolat chaud**. Pour finir : **Ce sera tout, merci.**'), {
        ex: [['Bonjour, je voudrais une baguette tradition et deux croissants, s’il vous plaît.', 'Hello, I’d like a traditional baguette and two croissants, please.'], ['Et avec ceci ? — Ce sera tout, merci.', 'Anything else? — That will be all, thank you.']],
      }),
      culture(b('Counter, room or terrace?', 'Comptoir, salle ou terrasse ?'), b('In French cafés, **Bonjour** is essential before ordering. Notice that sitting **en salle** (inside) or **en terrasse** (outside) can cost a little more than standing **au comptoir** (at the bar).', 'Dans les cafés francophones, dire **Bonjour** avant de commander est essentiel. S’asseoir **en salle** ou **en terrasse** coûte parfois un peu plus cher que de boire son café **au comptoir**.'), { variant: 'culture' }),
      dlg(b('Morning at the bakery', 'Le matin à la boulangerie'), undefined, [['Boulangère', 'f'], ['Vous', 'm']], [
        [0, 'Bonjour ! Qu’est-ce qu’il vous faut aujourd’hui ?', 'Hello! What can I get you today?'],
        [1, { options: ['Bonjour madame, je voudrais une baguette tradition et un pain au chocolat, s’il vous plaît.', 'Donne du pain.', 'Baguette et chocolat, vite.'] }],
        [0, 'Très bien. Et avec ceci ?', 'Very well. Anything else?'],
        [1, { options: ['Ce sera tout, merci ! Ça fait combien ?', 'Rien, je pars.', 'Encore de la boulangerie ?'] }],
        [0, 'Deux euros soixante, s’il vous plaît.', 'Two euros sixty, please.'],
      ]),
      hear('Bonjour, je vais prendre deux pains au chocolat, une tartelette aux fraises et un café crème, s’il vous plaît.', b('What pastries are ordered?', 'Quelles pâtisseries sont commandées ?'), [b('two pains au chocolat and a strawberry tartlet', 'deux pains au chocolat et une tartelette aux fraises'), b('two croissants and an apple tart', 'deux croissants et une tarte aux pommes'), b('one baguette and two brioches', 'une baguette et deux brioches'), b('only a coffee with milk', 'seulement un café crème')], { voice: 'f2' }),
      pairs(P.match, [['une baguette tradition', b('a crusty artisan baguette', 'baguette de qualité')], ['un café allongé', b('a long black coffee', 'café avec plus d’eau')], ['un pain au chocolat', b('a chocolate pastry', 'viennoiserie au chocolat')], ['ce sera tout', b('that will be all', 'rien d’autre à ajouter')]]),
      ord(P.order, 'Je voudrais deux croissants et un café, s’il vous plaît.', { tr: 'I’d like two croissants and a coffee, please.', extra: ['merci'] }),
      say('Bonjour, je voudrais une baguette tradition et deux croissants, s’il vous plaît.', 'Hello, I’d like a traditional baguette and two croissants, please.'),
    ],
    [
      b('Start with Bonjour, then Je voudrais… / Je vais prendre…', 'Commencez par Bonjour, puis Je voudrais… / Je vais prendre…'),
      b('Close your order with Ce sera tout, merci.', 'Terminez votre commande par Ce sera tout, merci.'),
      b('au comptoir, en salle, en terrasse.', 'au comptoir, en salle, en terrasse.'),
    ],
    [['la viennoiserie', b('pastry (croissant, brioche)', 'croissant ou pain au chocolat')], ['un café crème', b('coffee with steamed milk', 'café au lait mousseux')], ['à emporter', b('to take away', 'pour manger dehors')]],
  ),
  lesson(C, 2, ['reading-the-menu', 'lire-le-menu'],
    b('Reading the menu & ordering lunch', 'Lire le menu et commander un repas'),
    b('Understand set menus, order a starter and main, and ask for tap water.', 'Comprendre les formules, commander entrée et plat, et demander de l’eau.'),
    [b('Tell la formule from à la carte', 'Distinguer la formule et à la carte'), b('Order a starter, main or dessert', 'Commander entrée, plat ou dessert'), b('Ask for tap water politely', 'Demander une carafe d’eau poliment')],
    13,
    [
      card(b('At the bistro', 'Au bistrot'), b('A **menu** or **formule du midi** combines two or three courses for one set price. Key words: **l’entrée, le plat du jour, le dessert, la carte, sur place / à emporter**. For free tap water in France, ask for **une carafe d’eau**.', 'Un **menu** ou une **formule du midi** réunit deux ou trois plats à prix fixe. Mots clés : **l’entrée, le plat du jour, le dessert, la carte, sur place / à emporter**. Pour de l’eau du robinet gratuite, demandez **une carafe d’eau**.'), {
        table: { head: [b('term', 'terme'), b('meaning', 'sens')], rows: [['formule complète', 'entrée + plat + dessert'], ['plat du jour', 'daily special'], ['carafe d’eau', 'free tap water'], ['à emporter', 'takeaway']] },
      }),
      doc({ look: 'menu', title: b('Bistro du Marché — Lunch menu', 'Bistro du Marché — Formule du midi'), text: 'FORMULE DU MIDI (12 h – 14 h 30)\nEntrée + Plat ou Plat + Dessert | 18,50 €\nFormule complète (Entrée + Plat + Dessert) | 23,00 €\n\nSoupe de légumes de saison | 7,00 €\nSalade de chèvre chaud | 9,50 €\nQuiche lorraine et salade verte | 14,50 €\nPoulet rôti, pommes de terre | 16,50 €\nTarte aux pommes maison | 6,50 €\n\nCarafe d’eau offerte sur demande.' }, b('How much is a starter plus a main course?', 'Combien coûte une entrée avec un plat ?'), [b('18.50 €', '18,50 €'), b('23.00 €', '23,00 €'), b('16.50 €', '16,50 €'), b('21.50 €', '21,50 €')]),
      sort(b('Starter, main or dessert?', 'Entrée, plat ou dessert ?'), [b('starter', 'entrée'), b('main course', 'plat'), b('dessert', 'dessert')], [['la soupe de légumes', 0], ['le poulet rôti', 1], ['la tarte aux pommes', 2], ['la salade de chèvre chaud', 0], ['la quiche lorraine', 1], ['la mousse au chocolat', 2]]),
      mc(P.best, ['Nous voudrions aussi une carafe d’eau, s’il vous plaît.', 'Donnez de l’eau gratuite !', 'L’eau du robinet maintenant.', 'Je ne paie pas pour l’eau.'], { fr: 'Vous voulez de l’eau gratuite avec votre repas :' }),
      gap(P.complete, 'Pour moi, ce sera la ___ du midi avec une ___ lorraine et une carafe d’eau.', ['formule', 'quiche'], { choices: [['formule', 'carte', 'addition'], ['quiche', 'tarte', 'carafe']] }),
      dict('Pour commencer, je prends la soupe du jour, et ensuite le poulet rôti.', { voice: 'm' }),
      say('Je voudrais le plat du jour et une carafe d’eau, s’il vous plaît.', 'I’d like the daily special and a jug of tap water, please.'),
    ],
    [
      b('formule du midi: fixed-price combo (entrée + plat / plat + dessert).', 'formule du midi : menu à prix fixe (entrée + plat / plat + dessert).'),
      b('Une carafe d’eau = free tap water.', 'Une carafe d’eau = eau du robinet gratuite.'),
      b('Pour commencer… et ensuite…', 'Pour commencer… et ensuite…'),
    ],
    [['une entrée', b('a starter', 'premier plat du repas')], ['une carafe d’eau', b('a jug of tap water', 'eau du robinet gratuite')], ['le plat du jour', b('today’s special', 'plat proposé le jour même')]],
  ),
  lesson(C, 3, ['asking-for-the-bill', 'demander-l-addition'],
    b('Asking for the bill & paying', 'Demander l’addition et payer'),
    b('Ask for the bill, check a receipt and pay by card or cash.', 'Demander l’addition, vérifier un ticket et payer par carte ou en espèces.'),
    [b('Ask for the bill politely', 'Demander l’addition poliment'), b('Read a restaurant receipt', 'Lire un ticket de restaurant'), b('Choose card, contactless or cash', 'Choisir carte, sans contact ou espèces')],
    13,
    [
      card(b('Time to pay', 'Au moment de payer'), b('Call the server politely: **Excusez-moi, l’addition, s’il vous plaît.** Choose how to pay: **Je peux payer par carte / sans contact / en espèces ?** In France, **le service est compris** (service is included), so a **pourboire** (tip) is optional for good service.', 'Appelez poliment le serveur : **Excusez-moi, l’addition, s’il vous plaît.** Mode de paiement : **Je peux payer par carte / sans contact / en espèces ?** En France, **le service est compris**, le **pourboire** reste donc facultatif pour remercier d’un bon service.'), {
        ex: [['Excusez-moi, l’addition, s’il vous plaît.', 'Excuse me, the bill, please.'], ['Je peux payer sans contact ?', 'Can I pay contactless?']],
      }),
      doc({ look: 'receipt', title: b('Café des Arts — Receipt', 'Café des Arts — Ticket'), text: 'TABLE 7 — 13 h 40\n2 × Café crème | 7,60 €\n1 × Croissant | 1,60 €\n1 × Quiche et salade | 14,50 €\n1 × Tarte aux pommes | 6,50 €\n\nTOTAL TTC (service compris) | 30,20 €\nPayé par carte bancaire sans contact' }, b('How much did the two coffees cost in total?', 'Combien ont coûté les deux cafés au total ?'), [b('7.60 €', '7,60 €'), b('3.80 €', '3,80 €'), b('14.50 €', '14,50 €'), b('30.20 €', '30,20 €')]),
      dlg(b('Paying at the café', 'Payer au café'), undefined, [['Vous', 'f'], ['Serveur', 'm']], [
        [0, { options: ['Excusez-moi, l’addition, s’il vous plaît.', 'L’argent !', 'Combien je donne ?'] }],
        [1, 'Tout de suite, madame. Ça fait dix-huit euros cinquante. Vous réglez comment ?', 'Right away, madam. That comes to eighteen euros fifty. How are you paying?'],
        [0, { options: ['Par carte sans contact, s’il vous plaît.', 'Sans rien.', 'La table sept.'] }],
        [1, 'Parfait, vous pouvez poser votre carte ici. Bonne journée !', 'Perfect, you can tap your card here. Have a great day!'],
      ]),
      mc(P.best, ['Est-ce que je peux payer par carte bancaire ?', 'Carte ici oui ?', 'Donnez-moi une carte.', 'Je n’ai pas de billet de carte.'], { fr: 'Vous voulez savoir si la carte est acceptée :' }),
      flash(b('Quick revision', 'Révision express'), [['L’addition, s’il vous plaît.', b('The bill, please.', 'pour payer au restaurant')], ['Une carafe d’eau, s’il vous plaît.', b('A jug of tap water, please.', 'eau gratuite en France')], ['Sur place ou à emporter ?', b('Eat in or takeaway?', 'manger ici ou dehors')], ['Je peux payer sans contact ?', b('Can I pay contactless?', 'approcher sa carte')], ['C’était délicieux, merci !', b('It was delicious, thank you!', 'compliment au serveur')]]),
      say('Excusez-moi, l’addition, s’il vous plaît. Je peux payer par carte sans contact ?', 'Excuse me, the bill, please. Can I pay by contactless card?'),
    ],
    [
      b('Excusez-moi, l’addition, s’il vous plaît.', 'Excusez-moi, l’addition, s’il vous plaît.'),
      b('payer par carte / sans contact / en espèces.', 'payer par carte / sans contact / en espèces.'),
      b('Le service est compris ; le pourboire est facultatif.', 'Le service est compris ; le pourboire est facultatif.'),
    ],
    [['l’addition (f)', b('the restaurant bill', 'note du repas')], ['sans contact', b('contactless', 'paiement sans code')], ['un pourboire', b('a tip', 'petite somme laissée en plus')]],
  ),
];
