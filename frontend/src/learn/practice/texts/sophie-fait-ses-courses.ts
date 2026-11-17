// A2 · Dialogue at a market stall: asking for prices and quantities, paying.
// Language point: un kilo de, un peu de, du / de la / des, and de after a negation.
import { b } from '../../types';
import type { ReadingText } from '../types';

const SELLER = 0;
const SOPHIE = 1;

const text: ReadingText = {
  id: 'sophie-fait-ses-courses',
  speakers: [{ name: 'Le marchand', voice: 'm' }, { name: 'Sophie', voice: 'f' }],
  warmup: b(
    'At a market, what do you need to be able to say? Think of three phrases, then read the conversation.',
    'Au marché, que faut-il savoir dire ? Pensez à trois phrases, puis lisez la conversation.',
  ),
  paras: [
    { who: SELLER, s: [
      ['Bonjour madame !', 'Good morning, madam!'],
      ['Qu’est-ce que je vous sers aujourd’hui ?', 'What can I get you today?'],
    ] },
    { who: SOPHIE, s: [
      ['Bonjour !', 'Hello!'],
      ['Je voudrais un kilo de tomates, s’il vous plaît.', 'I would like a kilo of tomatoes, please.'],
    ] },
    { who: SELLER, s: [
      ['Voilà.', 'Here you are.'],
      ['Elles sont excellentes cette semaine : elles viennent d’une ferme à côté de Montréal.', 'They are excellent this week: they come from a farm near Montréal.'],
      ['Et avec ceci ?', 'Anything else?'],
    ] },
    { who: SOPHIE, s: [
      ['Combien coûtent les fraises ?', 'How much are the strawberries?'],
    ] },
    { who: SELLER, s: [
      ['Cinq dollars la barquette, ou deux barquettes pour neuf dollars.', 'Five dollars a basket, or two baskets for nine dollars.'],
    ] },
    { who: SOPHIE, s: [
      ['Alors je prends deux barquettes.', 'Then I will take two baskets.'],
      ['Vous avez aussi des pommes de terre ?', 'Do you also have potatoes?'],
    ] },
    { who: SELLER, s: [
      ['Oui, bien sûr.', 'Yes, of course.'],
      ['Le sac de deux kilos coûte quatre dollars.', 'The two-kilo bag costs four dollars.'],
    ] },
    { who: SOPHIE, s: [
      ['Parfait, je le prends.', 'Perfect, I will take it.'],
      ['Et un peu de persil, s’il vous plaît.', 'And a little parsley, please.'],
    ] },
    { who: SELLER, s: [
      ['Ah, désolé, je n’ai plus de persil.', 'Oh, sorry, I have no parsley left.'],
      ['Mais j’ai du basilic, très frais.', 'But I have some basil, very fresh.'],
    ] },
    { who: SOPHIE, s: [
      ['D’accord, je prends du basilic.', 'All right, I will take some basil.'],
      ['Ça fait combien ?', 'How much is that?'],
    ] },
    { who: SELLER, s: [
      ['Alors… les tomates, quatre dollars ; les fraises, neuf dollars ; les pommes de terre, quatre dollars ; et le basilic, deux dollars.', 'So… the tomatoes, four dollars; the strawberries, nine dollars; the potatoes, four dollars; and the basil, two dollars.'],
      ['Ça fait dix-neuf dollars.', 'That comes to nineteen dollars.'],
    ] },
    { who: SOPHIE, s: [
      ['Je peux payer par carte ?', 'Can I pay by card?'],
    ] },
    { who: SELLER, s: [
      ['Bien sûr.', 'Of course.'],
      ['Voilà votre sac.', 'Here is your bag.'],
      ['Bonne journée, madame !', 'Have a good day, madam!'],
    ] },
    { who: SOPHIE, s: [
      ['Merci, vous aussi !', 'Thank you, you too!'],
    ] },
  ],
  glossary: [
    { fr: 'Qu’est-ce que je vous sers', tr: b('What can I get you? (a shopkeeper’s phrase)', 'Que voulez-vous acheter ? (formule du commerçant)') },
    { fr: 'Je voudrais', tr: b('I would like (the polite way to ask)', 'je veux, dit poliment') },
    { fr: 'Et avec ceci ?', tr: b('Anything else? (a shopkeeper’s phrase)', 'Vous voulez autre chose ? (formule du commerçant)') },
    { fr: 'la barquette', tr: b('a small basket, a punnet (for berries)', 'une petite boîte pour les fruits') },
    { fr: 'des pommes de terre', tr: b('potatoes', 'un légume : on fait les frites avec') },
    { fr: 'je n’ai plus de persil', tr: b('I have no parsley left (ne… plus: no more)', 'il ne me reste pas de persil (ne… plus : plus du tout)') },
    { fr: 'frais', tr: b('fresh', 'cueilli ou préparé il y a peu de temps') },
    { fr: 'Ça fait combien ?', tr: b('How much is it altogether?', 'Quel est le prix total ?') },
    { fr: 'par carte', tr: b('by card', 'avec une carte bancaire') },
  ],
  questions: [
    {
      q: 'Où se passe cette conversation ?',
      qEn: 'Where does this conversation take place?',
      options: ['Dans un restaurant', 'Au marché', 'À la banque', 'Dans une ferme'],
      answer: 1,
      evidence: 'Qu’est-ce que je vous sers aujourd’hui ?',
      explain: b(
        'A seller, fruit and vegetables, prices: it is a market stall. The farm is only where the tomatoes come from.',
        'Un marchand, des fruits et légumes, des prix : c’est un étal de marché. La ferme est seulement l’endroit d’où viennent les tomates.',
      ),
      skill: 'global',
    },
    {
      q: 'D’où viennent les tomates ?',
      qEn: 'Where do the tomatoes come from?',
      options: ['D’un supermarché', 'D’une ferme à côté de Montréal', 'Du jardin de Sophie', 'D’un autre pays'],
      answer: 1,
      evidence: 'elles viennent d’une ferme à côté de Montréal',
      explain: b(
        '“Elles viennent d’une ferme à côté de Montréal.” Elles stands for les tomates, the subject of Sophie’s request.',
        '« Elles viennent d’une ferme à côté de Montréal. » Elles remplace les tomates, que Sophie vient de demander.',
      ),
      skill: 'detail',
    },
    {
      q: 'Combien de barquettes de fraises Sophie achète-t-elle ?',
      qEn: 'How many baskets of strawberries does Sophie buy?',
      options: ['Une', 'Deux', 'Cinq', 'Neuf'],
      answer: 1,
      evidence: 'je prends deux barquettes',
      explain: b(
        'She takes the offer “deux barquettes pour neuf dollars”. Five and nine are prices, not quantities.',
        'Elle profite de l’offre « deux barquettes pour neuf dollars ». Cinq et neuf sont des prix, pas des quantités.',
      ),
      skill: 'detail',
    },
    {
      q: 'Pourquoi Sophie n’achète-t-elle pas de persil ?',
      qEn: 'Why doesn’t Sophie buy any parsley?',
      options: ['Il est trop cher.', 'Elle n’aime pas le persil.', 'Le marchand n’en a plus.', 'Elle en a déjà à la maison.'],
      answer: 2,
      evidence: 'je n’ai plus de persil',
      explain: b(
        '“Je n’ai plus de persil”: there is none left. Ne… plus means no more, not any longer.',
        '« Je n’ai plus de persil » : il n’en reste pas. Ne… plus veut dire : plus du tout, à partir de maintenant.',
      ),
      skill: 'inference',
    },
    {
      q: 'Combien Sophie paie-t-elle en tout ?',
      qEn: 'How much does Sophie pay altogether?',
      options: ['Neuf dollars', 'Quinze dollars', 'Dix-neuf dollars', 'Vingt-trois dollars'],
      answer: 2,
      evidence: 'Ça fait dix-neuf dollars.',
      explain: b(
        '4 + 9 + 4 + 2 = 19. “Ça fait…” announces the total.',
        '4 + 9 + 4 + 2 = 19. « Ça fait… » annonce le total.',
      ),
      skill: 'detail',
    },
    {
      q: 'Comment Sophie paie-t-elle ?',
      qEn: 'How does Sophie pay?',
      options: ['En espèces', 'Par carte', 'Par chèque', 'Avec son téléphone'],
      answer: 1,
      evidence: 'Je peux payer par carte ?',
      explain: b(
        'She asks “Je peux payer par carte ?” and the seller answers “Bien sûr”.',
        'Elle demande « Je peux payer par carte ? » et le marchand répond « Bien sûr ».',
      ),
      skill: 'detail',
    },
  ],
  focus: {
    title: b('Quantities: un kilo de, un peu de, plus de', 'Les quantités : un kilo de, un peu de, plus de'),
    body: b(
      'After a quantity, French uses **de** alone, whatever the noun: __un kilo de tomates__, __deux barquettes de fraises__, __un peu de persil__. Without a quantity, use **du, de la, des**: __je prends du basilic__. After a negation, **du, de la, des** also become **de**: __je n’ai plus de persil__.',
      'Après une quantité, on utilise **de** seul, quel que soit le nom : __un kilo de tomates__, __deux barquettes de fraises__, __un peu de persil__. Sans quantité, on utilise **du, de la, des** : __je prends du basilic__. Après une négation, **du, de la, des** deviennent aussi **de** : __je n’ai plus de persil__.',
    ),
    examples: [
      { fr: 'Je voudrais un kilo de tomates.', tr: 'I would like a kilo of tomatoes.' },
      { fr: 'Je prends du basilic.', tr: 'I will take some basil.' },
      { fr: 'Je n’ai plus de persil.', tr: 'I have no parsley left.' },
    ],
  },
};

export default text;
