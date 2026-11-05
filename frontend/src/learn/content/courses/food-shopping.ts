import { b, type Lesson } from '../../types';
import { card, pick } from '../kit';

const lessons: Lesson[] = [
  {
    id: 'food-shopping-1',
    slug: { en: 'food-and-drinks', fr: 'aliments-et-boissons' },
    title: b('Food and drinks', 'Les aliments et les boissons'),
    summary: b('Learn the everyday food words and say what you like to eat and drink.', 'Apprendre les mots des aliments du quotidien et dire ce que vous aimez manger et boire.'),
    objectives: [b('Name thirty common foods', 'Nommer trente aliments courants'), b('Sort food into families', 'Classer les aliments par familles'), b('Say what you eat for each meal', 'Dire ce que vous mangez à chaque repas')],
    minutes: 12,
    steps: [
      { kind: 'flashcards', title: b('Food', 'Les aliments'), cards: [{ fr: 'le pain', tr: 'bread' }, { fr: 'le fromage', tr: 'cheese' }, { fr: 'la viande', tr: 'meat' }, { fr: 'le poulet', tr: 'chicken' }, { fr: 'le poisson', tr: 'fish' }, { fr: 'le riz', tr: 'rice' }, { fr: 'les pâtes', tr: 'pasta' }, { fr: 'les légumes', tr: 'vegetables' }, { fr: 'les fruits', tr: 'fruit' }, { fr: 'les œufs', tr: 'eggs' }, { fr: 'le lait', tr: 'milk' }, { fr: 'l’eau', tr: 'water' }] },
      { kind: 'categorize', prompt: b('Fruit or vegetable?', 'Fruit ou légume ?'), buckets: [b('Fruit', 'Fruit'), b('Vegetable', 'Légume')], items: [{ text: 'la pomme', bucket: 0 }, { text: 'la carotte', bucket: 1 }, { text: 'la banane', bucket: 0 }, { text: 'la pomme de terre', bucket: 1 }, { text: 'la fraise', bucket: 0 }, { text: 'l’oignon', bucket: 1 }] },
      card(b('The three meals', 'Les trois repas'), b('In France: **le petit-déjeuner** (morning), **le déjeuner** (noon), **le dîner** (evening). In Québec: **le déjeuner** (morning), **le dîner** (noon), **le souper** (evening). Same meals, different names!', 'En France : **le petit-déjeuner** (matin), **le déjeuner** (midi), **le dîner** (soir). Au Québec : **le déjeuner** (matin), **le dîner** (midi), **le souper** (soir). Mêmes repas, autres noms !'), {
        variant: 'culture',
        examples: [{ fr: 'Au petit-déjeuner, je mange du pain et je bois du café.', tr: 'For breakfast I eat bread and drink coffee.' }, { fr: 'Au Québec, on soupe vers dix-huit heures.', tr: 'In Québec, people have supper around 6 p.m.' }],
      }),
      pick('A1', b('In Québec, “le dîner” is the meal at…', 'Au Québec, « le dîner » est le repas…'), [b('noon', 'de midi'), b('breakfast time', 'du matin'), b('evening', 'du soir'), b('midnight', 'de minuit')]),
      pick('A1', b('Which one is a drink?', 'Lequel est une boisson ?'), ['le jus d’orange', 'le fromage', 'le riz', 'le poulet']),
      pick('A1', b('Choose the right word.', 'Choisissez le bon mot.'), ['aime', 'aimes', 'aimer', 'aiment'], { fr: 'J’___ beaucoup le poisson.' }),
      { kind: 'match', prompt: b('Match each food with its English name.', 'Associez chaque aliment à son équivalent.'), pairs: [['la pomme', 'apple'], ['la fraise', 'strawberry'], ['les haricots', 'beans'], ['le beurre', 'butter'], ['la confiture', 'jam']] },
      { kind: 'speak', prompt: b('Say it aloud.', 'Dites-le à voix haute.'), text: 'Au petit-déjeuner, je mange du pain et je bois du café.', tr: 'For breakfast I eat bread and drink coffee.' },
    ],
    notes: {
      points: [
        b('Learn food with its article: le pain, la viande, les pâtes, l’eau.', 'Apprenez les aliments avec leur article : le pain, la viande, les pâtes, l’eau.'),
        b('France: petit-déjeuner, déjeuner, dîner. Québec: déjeuner, dîner, souper.', 'France : petit-déjeuner, déjeuner, dîner. Québec : déjeuner, dîner, souper.'),
        b('Likes take le / la / les: j’aime le fromage.', 'Les goûts prennent le / la / les : j’aime le fromage.'),
        b('Eating takes du / de la / des: je mange du fromage.', 'Manger prend du / de la / des : je mange du fromage.'),
      ],
      vocab: [['le repas', b('meal', 'moment où l’on mange')], ['la boisson', b('drink', 'ce qu’on boit')], ['le légume', b('vegetable', 'plante qu’on mange')], ['manger / boire', b('to eat / to drink', 'se nourrir')]],
    },
  },
  {
    id: 'food-shopping-2',
    slug: { en: 'quantities-and-partitives', fr: 'quantites-et-partitifs' },
    title: b('Quantities: du, de la, un kilo de…', 'Les quantités : du, de la, un kilo de…'),
    summary: b('Say how much you want: some bread, a kilo of apples, a bottle of water, not any meat.', 'Dire combien vous voulez : du pain, un kilo de pommes, une bouteille d’eau, pas de viande.'),
    objectives: [b('Use du, de la, de l’, des', 'Employer du, de la, de l’, des'), b('Use precise quantities with de', 'Employer les quantités précises avec de'), b('Say “not any”: pas de', 'Dire « pas de »')],
    minutes: 13,
    steps: [
      card(b('Some: du, de la, de l’, des', 'Une partie : du, de la, de l’, des'), b('For an unspecified amount, French needs a partitive: **du** pain (masc.), **de la** confiture (fem.), **de l’**eau (vowel), **des** légumes (plural). English often says nothing: “I eat bread” = je mange **du** pain.', 'Pour une quantité non précisée, le français utilise un partitif : **du** pain, **de la** confiture, **de l’**eau, **des** légumes.'), {
        examples: [{ fr: 'Je voudrais du pain et de la confiture.', tr: 'I’d like some bread and jam.' }, { fr: 'Tu bois de l’eau ?', tr: 'Are you drinking water?' }],
      }),
      card(b('Precise quantities + de', 'Quantités précises + de'), b('After a quantity, only **de** (or **d’**): un kilo **de** pommes, une bouteille **d’**eau, un paquet **de** riz, beaucoup **de** sucre, un peu **de** lait. And after a negation: je **ne** mange **pas de** viande.', 'Après une quantité, seulement **de** (ou **d’**) : un kilo **de** pommes, une bouteille **d’**eau, un paquet **de** riz, beaucoup **de** sucre, un peu **de** lait. Et après une négation : je **ne** mange **pas de** viande.'), {
        variant: 'tip',
        examples: [{ fr: 'Un kilo de tomates, s’il vous plaît.', tr: 'A kilo of tomatoes, please.' }, { fr: 'Je ne mange pas de viande.', tr: 'I don’t eat meat.' }, { fr: 'Il y a beaucoup de monde au marché.', tr: 'There are a lot of people at the market.' }],
      }),
      pick('A1', b('Choose the right word.', 'Choisissez le bon mot.'), ['de la', 'du', 'des', 'de l’'], { fr: 'Je mange ___ salade.' }),
      pick('A1', b('Choose the right word.', 'Choisissez le bon mot.'), ['de', 'des', 'du', 'les'], { fr: 'Je voudrais un kilo ___ pommes.' }),
      pick('A1', b('Choose the right word.', 'Choisissez le bon mot.'), ['d’', 'de l’', 'du', 'des'], { fr: 'Une bouteille ___ eau, s’il vous plaît.' }),
      pick('A1', b('Choose the right word.', 'Choisissez le bon mot.'), ['de', 'du', 'des', 'la'], { fr: 'Je ne bois pas ___ café le soir.' }),
      { kind: 'match', prompt: b('Match the container with what it holds.', 'Associez le contenant à son contenu.'), pairs: [['une bouteille d’eau', b('a bottle of water', 'eau en bouteille')], ['un pot de confiture', b('a jar of jam', 'confiture en pot')], ['une boîte de thon', b('a tin of tuna', 'thon en boîte')], ['un paquet de pâtes', b('a packet of pasta', 'pâtes en paquet')], ['une douzaine d’œufs', b('a dozen eggs', 'douze œufs')]] },
      { kind: 'fill', prompt: b('Complete the shopping list.', 'Complétez la liste de courses.'), text: 'Acheter ___ lait, un kilo ___ carottes et ___ fromage.', answers: [['du'], ['de'], ['du']] },
    ],
    notes: {
      points: [
        b('Some: du (masc.), de la (fem.), de l’ (vowel), des (plural).', 'Partitifs : du (masc.), de la (fém.), de l’ (voyelle), des (pluriel).'),
        b('After a quantity: de / d’: un kilo de, une bouteille d’, beaucoup de.', 'Après une quantité : de / d’ : un kilo de, une bouteille d’, beaucoup de.'),
        b('After a negation: pas de: je ne mange pas de viande.', 'Après une négation : pas de : je ne mange pas de viande.'),
        b('Likes keep le / la: j’aime le café, mais je bois du café.', 'Les goûts gardent le / la : j’aime le café, mais je bois du café.'),
      ],
      vocab: [['un kilo', b('a kilo', 'mille grammes')], ['une bouteille', b('a bottle', 'contenant en verre ou plastique')], ['une douzaine', b('a dozen', 'douze')], ['beaucoup de', b('a lot of', 'une grande quantité de')], ['un peu de', b('a little', 'une petite quantité de')]],
    },
  },
  {
    id: 'food-shopping-3',
    slug: { en: 'at-the-market-and-supermarket', fr: 'au-marche-et-a-l-epicerie' },
    title: b('At the market and the grocery store', 'Au marché et à l’épicerie'),
    summary: b('Buy food: ask for what you want, ask the price, and understand the vendor.', 'Acheter à manger : demander ce que vous voulez, le prix, et comprendre le vendeur.'),
    objectives: [b('Ask for products politely', 'Demander des produits poliment'), b('Ask and understand prices', 'Demander et comprendre les prix'), b('Answer “Et avec ceci ?”', 'Répondre à « Et avec ceci ? »')],
    minutes: 13,
    steps: [
      card(b('The vendor’s questions', 'Les questions du vendeur'), b('At the market you will hear: **Qu’est-ce que je vous sers ?** (What can I get you?), **Et avec ceci ?** (Anything else?), **Ce sera tout ?** (Will that be all?), **Ça fait…** (That comes to…). Answer: **Je voudrais…**, **C’est tout, merci.**', 'Au marché, vous entendrez : **Qu’est-ce que je vous sers ?**, **Et avec ceci ?**, **Ce sera tout ?**, **Ça fait…** Répondez : **Je voudrais…**, **C’est tout, merci.**'), {
        examples: [{ fr: 'Qu’est-ce que je vous sers ?', tr: 'What can I get you?' }, { fr: 'Je voudrais un kilo de tomates, s’il vous plaît.', tr: 'I’d like a kilo of tomatoes, please.' }, { fr: 'Et avec ceci ?', tr: 'Anything else?' }, { fr: 'C’est tout, merci. Ça fait combien ?', tr: 'That’s all, thanks. How much is it?' }],
      }),
      { kind: 'dialogue', title: b('At the market', 'Au marché'), scene: b('Choose the client’s best reply.', 'Choisissez la meilleure réponse du client.'), speakers: [{ name: 'Marchande', voice: 'f2', side: 'l' }, { name: 'Client', voice: 'm', side: 'r' }], lines: [
        { s: 0, fr: 'Bonjour monsieur, qu’est-ce que je vous sers ?', tr: 'Hello sir, what can I get you?' },
        { s: 1, choose: { options: ['Bonjour, je voudrais un kilo de pommes, s’il vous plaît.', 'Pommes.', 'Je veux pommes.'], answer: 0 } },
        { s: 0, fr: 'Voilà. Et avec ceci ?', tr: 'Here you are. Anything else?' },
        { s: 1, choose: { options: ['Une barquette de fraises. Ce sera tout.', 'Avec ceci oui.', 'Ceci.'], answer: 0 } },
        { s: 0, fr: 'Alors, ça fait sept dollars cinquante.', tr: 'So that comes to seven fifty.' },
        { s: 1, fr: 'Voilà. Merci, bonne journée !', tr: 'Here you are. Thanks, have a nice day!' },
      ] },
      pick('A1', b('The vendor asks “Et avec ceci ?”. She wants to know…', 'La vendeuse demande « Et avec ceci ? ». Elle veut savoir…'), [b('if you want anything else', 'si vous voulez autre chose'), b('the price', 'le prix'), b('your name', 'votre nom'), b('if you want a bag', 'si vous voulez un sac')]),
      pick('A1', b('How do you ask the price?', 'Comment demander le prix ?'), ['Ça fait combien ?', 'Ça fait quoi ?', 'C’est qui ?', 'Combien vous êtes ?']),
      pick('A1', b('You have everything. You say:', 'Vous avez tout. Vous dites :'), ['C’est tout, merci.', 'Et avec ceci ?', 'Je voudrais encore.', 'Qu’est-ce que je vous sers ?']),
      card(b('At the grocery store', 'À l’épicerie'), b('At the till: **Vous avez un sac ?** (Do you have a bag?), **Vous payez comment ?** — **Par carte / en argent comptant (Québec) / en espèces**. **Le reçu** = the receipt.', 'À la caisse : **Vous avez un sac ?**, **Vous payez comment ?** — **Par carte / en argent comptant (Québec) / en espèces**. **Le reçu** = le ticket.'), { variant: 'culture' }),
      { kind: 'speak', prompt: b('Say it aloud.', 'Dites-le à voix haute.'), text: 'C’est tout, merci. Ça fait combien ?', tr: 'That’s all, thanks. How much is it?' },
    ],
    notes: {
      points: [
        b('Vendor: Qu’est-ce que je vous sers ? Et avec ceci ? Ce sera tout ? Ça fait…', 'Vendeur : Qu’est-ce que je vous sers ? Et avec ceci ? Ce sera tout ? Ça fait…'),
        b('Client: Je voudrais… s’il vous plaît. C’est tout, merci. Ça fait combien ?', 'Client : Je voudrais… s’il vous plaît. C’est tout, merci. Ça fait combien ?'),
        b('Paying: par carte, en espèces (France), en argent comptant (Québec).', 'Payer : par carte, en espèces (France), en argent comptant (Québec).'),
        b('Always greet first: Bonjour madame / monsieur.', 'Saluez toujours d’abord : Bonjour madame / monsieur.'),
      ],
      vocab: [['la barquette', b('punnet, small tray', 'petit contenant')], ['la caisse', b('checkout', 'endroit où l’on paie')], ['le reçu', b('receipt', 'preuve d’achat')], ['l’argent comptant (Québec)', b('cash', 'billets et pièces')], ['le marchand', b('stallholder', 'vendeur au marché')]],
    },
  },
];

export default lessons;
