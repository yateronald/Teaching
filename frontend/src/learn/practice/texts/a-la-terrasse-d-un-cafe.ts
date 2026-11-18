// A1 · Dialogue. Julie orders at a café terrace, asks a price and pays:
// ordering politely with je voudrais and je vais prendre.
import { b } from '../../types';
import type { ReadingText } from '../types';

const text: ReadingText = {
  id: 'a-la-terrasse-d-un-cafe',
  speakers: [{ name: 'Le serveur', voice: 'm' }, { name: 'Julie', voice: 'f' }],
  warmup: b(
    'You sit down at a café in France. What do you say to order a drink, and to pay?',
    'Vous êtes assis à la terrasse d’un café. Que dites-vous pour commander une boisson, puis pour payer ?',
  ),
  paras: [
    { who: 0, s: [['Bonjour, madame. Vous désirez ?', 'Hello, madam. What would you like?']] },
    { who: 1, s: [['Bonjour. Je voudrais un café et un croissant, s’il vous plaît.', 'Hello. I would like a coffee and a croissant, please.']] },
    { who: 0, s: [['Un expresso ou un café crème ?', 'An espresso or a white coffee?']] },
    { who: 1, s: [
      ['Un café crème, s’il vous plaît.', 'A white coffee, please.'],
      ['Et vous avez du jus d’orange ?', 'And do you have orange juice?'],
    ] },
    { who: 0, s: [
      ['Oui, nous avons du jus d’orange pressé.', 'Yes, we have freshly squeezed orange juice.'],
      ['Il coûte quatre euros.', 'It costs four euros.'],
    ] },
    { who: 1, s: [['D’accord, je vais prendre un jus d’orange aussi.', 'All right, I’ll have an orange juice too.']] },
    { who: 0, s: [['Très bien. Et avec ça ?', 'Very good. Anything else?']] },
    { who: 1, s: [['C’est tout, merci.', 'That’s all, thank you.']] },
    { who: 0, s: [['Je vous apporte ça tout de suite.', 'I’ll bring it to you right away.']] },
    { who: 1, s: [['Excusez-moi ! L’addition, s’il vous plaît.', 'Excuse me! The bill, please.']] },
    { who: 0, s: [
      ['Alors, un café crème, trois euros, un croissant, un euro cinquante, et un jus d’orange, quatre euros.', 'So, a white coffee, three euros, a croissant, one euro fifty, and an orange juice, four euros.'],
      ['Ça fait huit euros cinquante.', 'That comes to eight euros fifty.'],
    ] },
    { who: 1, s: [['Je peux payer par carte ?', 'Can I pay by card?']] },
    { who: 0, s: [['Bien sûr. Merci, et bonne journée !', 'Of course. Thank you, and have a nice day!']] },
    { who: 1, s: [['Merci, au revoir !', 'Thank you, goodbye!']] },
  ],
  glossary: [
    { fr: 'Vous désirez ?', tr: b('What would you like? (said by a waiter)', 'question du serveur : qu’est-ce que vous voulez ?') },
    { fr: 'Je voudrais', tr: b('I would like (polite)', 'forme polie de « je veux »') },
    { fr: 'expresso', tr: b('an espresso: a small, strong black coffee', 'un petit café noir et fort') },
    { fr: 'un café crème', tr: b('a coffee with hot frothy milk', 'un café avec du lait chaud') },
    { fr: 'pressé', tr: b('freshly squeezed', 'fait avec des oranges fraîches, devant vous') },
    { fr: 'je vais prendre', tr: b('I’ll have', 'je choisis, je commande') },
    { fr: 'Et avec ça ?', tr: b('Anything else?', 'vous voulez autre chose ?') },
    { fr: 'C’est tout', tr: b('That’s all', 'je ne veux rien d’autre') },
    { fr: 'L’addition', tr: b('the bill', 'le papier avec la somme à payer') },
    { fr: 'Ça fait', tr: b('That comes to (a total)', 'le total est de') },
    { fr: 'par carte', tr: b('by card', 'avec une carte bancaire') },
  ],
  questions: [
    {
      q: 'Où se passe la conversation ?',
      qEn: 'Where does the conversation take place?',
      options: ['Dans un café', 'Dans une boulangerie', 'Au marché', 'À la gare'],
      answer: 0,
      evidence: 'Je voudrais un café et un croissant, s’il vous plaît.',
      explain: b(
        'A waiter (le serveur) takes Julie’s order, and she asks for the bill at the end: she is in a café.',
        'Un serveur prend la commande de Julie et elle demande l’addition à la fin : elle est dans un café.',
      ),
      skill: 'global',
    },
    {
      q: 'Quel café Julie choisit-elle ?',
      qEn: 'Which coffee does Julie choose?',
      options: ['Un expresso', 'Un café crème', 'Un café au chocolat', 'Elle ne prend pas de café'],
      answer: 1,
      evidence: 'Un café crème, s’il vous plaît.',
      explain: b(
        'The waiter offers two coffees; Julie answers “Un café crème, s’il vous plaît.”',
        'Le serveur propose deux cafés ; Julie répond : « Un café crème, s’il vous plaît. »',
      ),
      skill: 'detail',
    },
    {
      q: 'Combien coûte le jus d’orange ?',
      qEn: 'How much is the orange juice?',
      options: ['Un euro cinquante', 'Trois euros', 'Quatre euros', 'Huit euros cinquante'],
      answer: 2,
      evidence: 'Il coûte quatre euros.',
      explain: b(
        '“Il coûte quatre euros”: il is the orange juice.',
        '« Il coûte quatre euros » : il, c’est le jus d’orange.',
      ),
      skill: 'detail',
    },
    {
      q: 'Que veut dire « Et avec ça ? » ?',
      qEn: 'What does “Et avec ça ?” mean?',
      options: ['Vous voulez autre chose ?', 'Vous payez comment ?', 'Vous êtes combien ?', 'C’est bon ?'],
      answer: 0,
      evidence: 'Et avec ça ?',
      explain: b(
        'The waiter asks if Julie wants anything else. She answers “C’est tout, merci”: nothing more.',
        'Le serveur demande si Julie veut autre chose. Elle répond « C’est tout, merci » : rien d’autre.',
      ),
      skill: 'vocab',
    },
    {
      q: 'Combien Julie paie-t-elle en tout ?',
      qEn: 'How much does Julie pay in total?',
      options: ['Quatre euros', 'Sept euros', 'Huit euros cinquante', 'Neuf euros cinquante'],
      answer: 2,
      evidence: 'Ça fait huit euros cinquante.',
      explain: b(
        'Three euros + one euro fifty + four euros: “Ça fait huit euros cinquante.”',
        'Trois euros + un euro cinquante + quatre euros : « Ça fait huit euros cinquante. »',
      ),
      skill: 'detail',
    },
    {
      q: 'Comment Julie paie-t-elle ?',
      qEn: 'How does Julie pay?',
      options: ['En espèces', 'Par carte', 'Par chèque', 'Elle ne paie pas'],
      answer: 1,
      evidence: ['Je peux payer par carte ?', 'Bien sûr.'],
      explain: b(
        'Julie asks “Je peux payer par carte ?” and the waiter says “Bien sûr”: yes, of course.',
        'Julie demande « Je peux payer par carte ? » et le serveur répond « Bien sûr » : oui.',
      ),
      skill: 'inference',
    },
  ],
  focus: {
    title: b('Ordering politely', 'Commander poliment'),
    body: b(
      'To order, say __je voudrais__ (I would like) or __je vais prendre__ (I’ll have), and add **s’il vous plaît**. “Je veux” sounds too direct to a waiter. To ask for the total: __ça fait combien ?__ The answer is __ça fait__ + the price. At the end: __l’addition, s’il vous plaît__.',
      'Pour commander, dites __je voudrais__ ou __je vais prendre__, et ajoutez **s’il vous plaît**. « Je veux » est trop direct avec un serveur. Pour demander le total : __ça fait combien ?__ La réponse est __ça fait__ + le prix. À la fin : __l’addition, s’il vous plaît__.',
    ),
    examples: [
      { fr: 'Je voudrais un café, s’il vous plaît.', tr: 'I would like a coffee, please.' },
      { fr: 'Je vais prendre un jus d’orange.', tr: 'I’ll have an orange juice.' },
      { fr: 'L’addition, s’il vous plaît !', tr: 'The bill, please!' },
    ],
  },
};

export default text;
