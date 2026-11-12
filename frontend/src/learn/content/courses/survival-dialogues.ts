// Dialogues de survie (A1): the sentences that get you out of trouble when
// you understand almost nothing yet.
import { b, type Lesson } from '../../types';
import { card, pick } from '../kit';

const lessons: Lesson[] = [
  {
    id: 'survival-dialogues-1',
    slug: { en: 'i-dont-understand', fr: 'je-ne-comprends-pas' },
    title: b('“I don’t understand”: keeping a conversation alive', '« Je ne comprends pas » : ne pas perdre le fil'),
    summary: b('Ask people to repeat, slow down or explain a word, and say that you are learning.', 'Faire répéter, faire ralentir, demander le sens d’un mot et dire que vous apprenez.'),
    objectives: [b('Say that you do not understand', 'Dire que vous ne comprenez pas'), b('Ask to repeat and to speak slowly', 'Faire répéter et faire parler lentement'), b('Ask what a word means', 'Demander le sens d’un mot')],
    minutes: 12,
    steps: [
      card(b('Six sentences that save you', 'Six phrases qui vous sauvent'), b('Learn them by heart: they work everywhere, with everyone. And people are always kinder when you say **“J’apprends le français”**.', 'Apprenez-les par cœur : elles fonctionnent partout, avec tout le monde. Et les gens sont toujours plus patients quand vous dites **« J’apprends le français »**.'), {
        examples: [
          { fr: 'Pardon, je ne comprends pas.', tr: 'Sorry, I don’t understand.' },
          { fr: 'Pouvez-vous répéter, s’il vous plaît ?', tr: 'Can you repeat, please?' },
          { fr: 'Plus lentement, s’il vous plaît.', tr: 'More slowly, please.' },
          { fr: 'Qu’est-ce que ça veut dire ?', tr: 'What does that mean?' },
          { fr: 'Comment dit-on « bus » en français ?', tr: 'How do you say “bus” in French?' },
          { fr: 'J’apprends le français.', tr: 'I am learning French.' },
        ],
      }),
      { kind: 'match', prompt: b('Match each sentence with its use.', 'Associez chaque phrase à son emploi.'), pairs: [['Pouvez-vous répéter ?', b('You did not hear', 'Vous n’avez pas entendu')], ['Plus lentement, s’il vous plaît.', b('It is too fast', 'C’est trop rapide')], ['Qu’est-ce que ça veut dire ?', b('You do not know a word', 'Vous ne connaissez pas un mot')], ['Comment dit-on… ?', b('You are looking for a word', 'Vous cherchez un mot')], ['Vous parlez anglais ?', b('Last resort', 'En dernier recours')]] },
      pick('A1', b('Someone speaks very fast. What do you say?', 'Quelqu’un parle très vite. Que dites-vous ?'), ['Plus lentement, s’il vous plaît.', 'Plus vite, s’il vous plaît.', 'Je comprends très bien.', 'Au revoir.']),
      pick('A1', b('You hear a word you do not know: “dépanneur”. You ask:', 'Vous entendez un mot inconnu : « dépanneur ». Vous demandez :'), ['Qu’est-ce que ça veut dire, « dépanneur » ?', 'Comment allez-vous, dépanneur ?', 'Où est dépanneur vous ?', 'Je suis dépanneur.']),
      { kind: 'order', prompt: b('Build the sentence.', 'Construisez la phrase.'), words: ['Pouvez-vous', 'répéter,', 's’il', 'vous', 'plaît', '?'], tr: 'Can you repeat, please?' },
      { kind: 'dialogue', title: b('At the information desk', 'Au comptoir d’information'), scene: b('Choose your best replies.', 'Choisissez vos meilleures répliques.'), speakers: [{ name: 'Employé', voice: 'm2', side: 'l' }, { name: 'Vous', voice: 'f', side: 'r' }], lines: [
        { s: 0, fr: 'Pour le formulaire, il faut aller au troisième guichet, puis revenir ici avec le reçu.', tr: 'For the form, you have to go to the third counter, then come back here with the receipt.' },
        { s: 1, choose: { options: ['Pardon, je ne comprends pas. Pouvez-vous répéter plus lentement ?', 'Oui, oui, d’accord.', 'Vous parlez mal.'], answer: 0, explain: b('Never say “oui, oui” when you did not understand: ask again.', 'Ne dites jamais « oui, oui » si vous n’avez pas compris : redemandez.') } },
        { s: 0, fr: 'Bien sûr. Allez au guichet numéro trois. Ensuite, revenez ici.', tr: 'Of course. Go to counter number three. Then come back here.' },
        { s: 1, choose: { options: ['Merci beaucoup, c’est plus clair !', 'Je ne comprends pas.', 'Non.'], answer: 0 } },
      ] },
      { kind: 'speak', prompt: b('Say it aloud.', 'Dites-le à voix haute.'), text: 'Pardon, je ne comprends pas. Pouvez-vous répéter, s’il vous plaît ?', tr: 'Sorry, I don’t understand. Can you repeat, please?' },
      { kind: 'speak', prompt: b('Say it aloud.', 'Dites-le à voix haute.'), text: 'J’apprends le français. Plus lentement, s’il vous plaît.', tr: 'I am learning French. More slowly, please.' },
    ],
    notes: {
      points: [
        b('**Je ne comprends pas. Pouvez-vous répéter ?** works in every situation.', '**Je ne comprends pas. Pouvez-vous répéter ?** fonctionne dans toutes les situations.'),
        b('**Plus lentement, s’il vous plaît.** People slow down gladly.', '**Plus lentement, s’il vous plaît.** Les gens ralentissent volontiers.'),
        b('A word you do not know: **Qu’est-ce que ça veut dire ?** A word you need: **Comment dit-on… ?**', 'Un mot inconnu : **Qu’est-ce que ça veut dire ?** Un mot qui vous manque : **Comment dit-on… ?**'),
        b('Never pretend to understand: ask again.', 'Ne faites jamais semblant de comprendre : redemandez.'),
      ],
      vocab: [['répéter', b('to repeat', 'dire encore une fois')], ['lentement', b('slowly', 'pas vite')], ['le guichet', b('counter', 'comptoir d’un service')], ['clair', b('clear', 'facile à comprendre')]],
    },
  },
  {
    id: 'survival-dialogues-2',
    slug: { en: 'ordering-and-buying', fr: 'commander-et-acheter' },
    title: b('Ordering and buying with ten words', 'Commander et acheter avec dix mots'),
    summary: b('Get what you need in a café, a shop or a pharmacy, even with a tiny vocabulary.', 'Obtenir ce qu’il vous faut au café, au magasin ou à la pharmacie, même avec très peu de vocabulaire.'),
    objectives: [b('Order with je voudrais', 'Commander avec je voudrais'), b('Point and ask with ça', 'Montrer et demander avec ça'), b('Ask the price and pay', 'Demander le prix et payer')],
    minutes: 12,
    steps: [
      card(b('The magic of “ça”', 'La magie de « ça »'), b('You do not know the word? Point and say **ça** (that): **Je voudrais ça, s’il vous plaît.** **C’est combien, ça ?** With **je voudrais**, **ça**, **combien** and **merci**, you can buy almost anything.', 'Vous ne connaissez pas le mot ? Montrez et dites **ça** : **Je voudrais ça, s’il vous plaît.** **C’est combien, ça ?** Avec **je voudrais**, **ça**, **combien** et **merci**, vous pouvez presque tout acheter.'), {
        examples: [{ fr: 'Je voudrais ça, s’il vous plaît.', tr: 'I would like that, please.' }, { fr: 'C’est combien ?', tr: 'How much is it?' }, { fr: 'Je peux payer par carte ?', tr: 'Can I pay by card?' }, { fr: 'L’addition, s’il vous plaît.', tr: 'The bill, please.' }],
      }),
      pick('A1', b('You want the cake in the window but do not know its name. You say:', 'Vous voulez le gâteau en vitrine, mais vous ne connaissez pas son nom. Vous dites :'), ['Je voudrais ça, s’il vous plaît.', 'Donne-moi.', 'Je suis ça.', 'Gâteau moi.']),
      pick('A1', b('You have finished eating at the restaurant. You ask for:', 'Vous avez fini de manger au restaurant. Vous demandez :'), ['L’addition, s’il vous plaît.', 'La carte, s’il vous plaît.', 'Le menu du jour.', 'Une table pour deux.']),
      { kind: 'dialogue', title: b('At the bakery', 'À la boulangerie'), scene: b('Choose your best replies.', 'Choisissez vos meilleures répliques.'), speakers: [{ name: 'Boulangère', voice: 'f2', side: 'l' }, { name: 'Vous', voice: 'm', side: 'r' }], lines: [
        { s: 0, fr: 'Bonjour ! Qu’est-ce que je vous sers ?', tr: 'Hello! What can I get you?' },
        { s: 1, choose: { options: ['Bonjour. Je voudrais une baguette et ça, s’il vous plaît.', 'Baguette.', 'Je veux tout.'], answer: 0 } },
        { s: 0, fr: 'Une baguette et un pain au chocolat. Ce sera tout ?', tr: 'A baguette and a pain au chocolat. Will that be all?' },
        { s: 1, choose: { options: ['Oui, c’est tout, merci. C’est combien ?', 'Non, c’est tout.', 'Oui, je suis tout.'], answer: 0 } },
        { s: 0, fr: 'Quatre dollars vingt, s’il vous plaît.', tr: 'Four dollars twenty, please.' },
      ] },
      card(b('Polite in three words', 'Poli en trois mots'), b('In French-speaking countries, a request without **bonjour** is rude, even a short one. Always: **Bonjour** → your request → **s’il vous plaît** → **merci, bonne journée**.', 'Dans les pays francophones, une demande sans **bonjour** est impolie, même très courte. Toujours : **Bonjour** → votre demande → **s’il vous plaît** → **merci, bonne journée**.'), { variant: 'culture' }),
      { kind: 'order', prompt: b('Build the sentence.', 'Construisez la phrase.'), words: ['Je', 'peux', 'payer', 'par', 'carte', '?'], tr: 'Can I pay by card?' },
      { kind: 'fill', prompt: b('Complete the request.', 'Complétez la demande.'), text: 'Bonjour, je ___ un café, s’il vous ___.', answers: [['voudrais'], ['plaît']], choices: [['voudrais', 'veux', 'suis'], ['plaît', 'merci', 'voulez']] },
      { kind: 'speak', prompt: b('Say it aloud.', 'Dites-le à voix haute.'), text: 'Bonjour, je voudrais ça, s’il vous plaît. C’est combien ?', tr: 'Hello, I would like that, please. How much is it?' },
    ],
    notes: {
      points: [
        b('**Je voudrais…, s’il vous plaît.** The polite way to ask for anything.', '**Je voudrais…, s’il vous plaît.** La façon polie de tout demander.'),
        b('No word? Point and say **ça**: Je voudrais ça.', 'Pas le mot ? Montrez et dites **ça** : Je voudrais ça.'),
        b('**C’est combien ?** / **Je peux payer par carte ?** / **L’addition, s’il vous plaît.**', '**C’est combien ?** / **Je peux payer par carte ?** / **L’addition, s’il vous plaît.**'),
        b('Always start with bonjour and end with merci.', 'Commencez toujours par bonjour et finissez par merci.'),
      ],
      vocab: [['l’addition', b('the bill (restaurant)', 'ce qu’on paie au restaurant')], ['la vitrine', b('shop window', 'vitre où l’on montre les produits')], ['c’est tout', b('that’s all', 'rien d’autre')], ['servir', b('to serve', 'donner ce qui est demandé')]],
    },
  },
  {
    id: 'survival-dialogues-3',
    slug: { en: 'problems-and-emergencies', fr: 'problemes-et-urgences' },
    title: b('Problems and emergencies', 'Problèmes et urgences'),
    summary: b('Say that you are lost, that you have lost something or that you need help, and call 911.', 'Dire que vous êtes perdu, que vous avez perdu quelque chose ou que vous avez besoin d’aide, et appeler le 911.'),
    objectives: [b('Ask for help', 'Demander de l’aide'), b('Explain a simple problem', 'Expliquer un problème simple'), b('Give key information in an emergency', 'Donner les informations clés en cas d’urgence')],
    minutes: 13,
    steps: [
      card(b('Asking for help', 'Demander de l’aide'), b('**Excusez-moi, j’ai besoin d’aide.** **Je cherche…** (I am looking for). **J’ai perdu mon…** (I have lost my). **Je me suis trompé de…** (I took the wrong…). In real danger: **Au secours !** and call **911**.', '**Excusez-moi, j’ai besoin d’aide.** **Je cherche…** **J’ai perdu mon…** **Je me suis trompé de…** En cas de vrai danger : **Au secours !** et appelez le **911**.'), {
        examples: [{ fr: 'Excusez-moi, j’ai besoin d’aide.', tr: 'Excuse me, I need help.' }, { fr: 'J’ai perdu mon téléphone.', tr: 'I have lost my phone.' }, { fr: 'Je cherche la station de métro.', tr: 'I am looking for the metro station.' }, { fr: 'Où sont les toilettes, s’il vous plaît ?', tr: 'Where are the toilets, please?' }],
      }),
      pick('A1', b('You cannot find your wallet. You say:', 'Vous ne trouvez plus votre portefeuille. Vous dites :'), ['J’ai perdu mon portefeuille.', 'Je suis perdu mon portefeuille.', 'Mon portefeuille est content.', 'J’ai un portefeuille.']),
      pick('A1', b('You do not know where you are. You say:', 'Vous ne savez plus où vous êtes. Vous dites :'), ['Excusez-moi, je ne sais pas où je suis. Pouvez-vous m’aider ?', 'Excusez-moi, vous êtes où ?', 'J’ai perdu.', 'Je suis ici, merci.']),
      card(b('Calling 911', 'Appeler le 911'), b('The operator asks three things: **Quelle est votre urgence ?** (police, fire, ambulance), **Où êtes-vous ?** (your address) and **Que se passe-t-il ?**. Short sentences are enough: **J’ai besoin d’une ambulance. Je suis au 250, rue Sherbrooke. Une personne est tombée.**', 'On vous pose trois questions : **Quelle est votre urgence ?** (police, pompiers, ambulance), **Où êtes-vous ?** (votre adresse) et **Que se passe-t-il ?** Des phrases courtes suffisent : **J’ai besoin d’une ambulance. Je suis au 250, rue Sherbrooke. Une personne est tombée.**'), { variant: 'tip' }),
      { kind: 'mcq', prompt: b('Listen. What does the operator ask?', 'Écoutez. Que demande l’opératrice ?'), audio: 'Neuf un un, quelle est votre urgence ? Avez-vous besoin de la police, des pompiers ou d’une ambulance ?', listen: true, voice: 'f2', options: [b('Which service you need', 'De quel service vous avez besoin'), b('Your name', 'Votre nom'), b('Your phone number', 'Votre numéro de téléphone')], answer: 0 },
      { kind: 'categorize', prompt: b('Which service do you ask for?', 'Quel service demandez-vous ?'), buckets: [b('Ambulance', 'Ambulance'), b('Police', 'Police'), b('Fire service', 'Pompiers')], items: [{ text: 'Une personne est tombée.', bucket: 0 }, { text: 'On a volé mon sac.', bucket: 1 }, { text: 'Il y a de la fumée.', bucket: 2 }, { text: 'Il ne respire plus.', bucket: 0 }, { text: 'Il y a le feu dans la cuisine.', bucket: 2 }, { text: 'Quelqu’un est entré chez moi.', bucket: 1 }] },
      { kind: 'dialogue', title: b('Lost in the city', 'Perdu en ville'), scene: b('Choose your best replies.', 'Choisissez vos meilleures répliques.'), speakers: [{ name: 'Passante', voice: 'f', side: 'l' }, { name: 'Vous', voice: 'm', side: 'r' }], lines: [
        { s: 1, choose: { options: ['Excusez-moi, madame. Je suis perdu. Je cherche la rue Saint-Denis.', 'Hé ! Rue Saint-Denis ?', 'Madame, je suis la rue Saint-Denis.'], answer: 0 } },
        { s: 0, fr: 'La rue Saint-Denis ? C’est tout droit, à deux rues d’ici.', tr: 'Saint-Denis Street? It is straight on, two streets from here.' },
        { s: 1, choose: { options: ['Tout droit, deux rues. Merci beaucoup, madame !', 'Je ne veux pas.', 'D’accord, au revoir tout droit.'], answer: 0, explain: b('Repeating the key information is a good way to check you understood.', 'Répéter l’information clé permet de vérifier que vous avez compris.') } },
      ] },
      { kind: 'speak', prompt: b('Say it aloud.', 'Dites-le à voix haute.'), text: 'Excusez-moi, j’ai besoin d’aide. J’ai perdu mon téléphone.', tr: 'Excuse me, I need help. I have lost my phone.' },
    ],
    notes: {
      points: [
        b('**J’ai besoin d’aide. Pouvez-vous m’aider ?**', '**J’ai besoin d’aide. Pouvez-vous m’aider ?**'),
        b('**J’ai perdu mon / ma…** (lost something) ≠ **Je suis perdu(e)** (lost in a place).', '**J’ai perdu mon / ma…** (un objet) ≠ **Je suis perdu(e)** (dans un lieu).'),
        b('911: which service, where you are, what is happening. Short sentences.', '911 : quel service, où vous êtes, ce qui se passe. Des phrases courtes.'),
        b('Repeat key information to check: “Tout droit, deux rues ?”', 'Répétez l’information clé pour vérifier : « Tout droit, deux rues ? »'),
      ],
      vocab: [['le portefeuille', b('wallet', 'on y range l’argent et les cartes')], ['voler', b('to steal', 'prendre ce qui n’est pas à soi')], ['les pompiers', b('fire service', 'ils éteignent les feux')], ['la fumée', b('smoke', 'elle sort d’un feu')], ['au secours', b('help!', 'cri pour appeler à l’aide')]],
    },
  },
];

export default lessons;
