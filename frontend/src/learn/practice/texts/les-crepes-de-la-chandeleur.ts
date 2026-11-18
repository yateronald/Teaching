// A2 · Recipe. The crêpes of la Chandeleur (2 February): a French tradition,
// the ingredients and the steps. The imperative for instructions.
import { b } from '../../types';
import type { ReadingText } from '../types';

const text: ReadingText = {
  id: 'les-crepes-de-la-chandeleur',
  warmup: b(
    'Do you know a dish that people make on a special day in your country? How is a recipe usually organised?',
    'Connaissez-vous un plat qu’on prépare un jour de fête dans votre pays ? Comment une recette est-elle organisée, en général ?',
  ),
  paras: [
    { lead: true, s: [
      ['Le deux février, en France, c’est la Chandeleur : ce jour-là, beaucoup de familles font des crêpes.', 'On the second of February, in France, it is la Chandeleur: on that day, many families make crêpes.'],
      ['Voici une recette simple pour quatre personnes.', 'Here is a simple recipe for four people.'],
    ] },
    { s: [
      ['Il faut deux cent cinquante grammes de farine, quatre œufs, un demi-litre de lait, une pincée de sel et cinquante grammes de beurre fondu.', 'You need two hundred and fifty grams of flour, four eggs, half a litre of milk, a pinch of salt and fifty grams of melted butter.'],
    ] },
    { s: [
      ['Dans un grand saladier, mettez la farine et le sel.', 'In a large bowl, put the flour and the salt.'],
      ['Ajoutez les œufs et mélangez.', 'Add the eggs and mix.'],
      ['Versez le lait petit à petit, sans arrêter de mélanger : la pâte doit être lisse, sans grumeaux.', 'Pour in the milk little by little, without stopping mixing: the batter must be smooth, with no lumps.'],
      ['Ajoutez enfin le beurre fondu.', 'Finally, add the melted butter.'],
    ] },
    { s: [
      ['Laissez reposer la pâte une heure.', 'Leave the batter to rest for an hour.'],
      ['Ensuite, faites chauffer une poêle avec un peu de beurre.', 'Then heat a frying pan with a little butter.'],
      ['Versez une petite louche de pâte et tournez la poêle pour bien l’étaler.', 'Pour in a small ladle of batter and tilt the pan to spread it well.'],
      ['Après une minute, retournez la crêpe et attendez encore une minute.', 'After a minute, turn the crêpe over and wait one more minute.'],
    ] },
    { s: [
      ['Servez les crêpes avec du sucre, de la confiture ou du chocolat.', 'Serve the crêpes with sugar, jam or chocolate.'],
      ['Selon une vieille tradition, si vous faites sauter la première crêpe avec une pièce dans l’autre main, vous aurez de l’argent toute l’année !', 'According to an old tradition, if you flip the first crêpe with a coin in your other hand, you will have money all year!'],
    ] },
  ],
  glossary: [
    { fr: 'la Chandeleur', tr: b('Candlemas, 2 February, the day of crêpes in France', 'fête du deux février, le jour des crêpes en France') },
    { fr: 'farine', tr: b('flour', 'poudre blanche faite avec du blé, pour le pain et les gâteaux') },
    { fr: 'une pincée de sel', tr: b('a pinch of salt', 'un tout petit peu de sel, pris entre deux doigts') },
    { fr: 'beurre fondu', tr: b('melted butter', 'beurre chauffé qui devient liquide') },
    { fr: 'saladier', tr: b('large bowl', 'grand bol pour mélanger ou servir') },
    { fr: 'mélangez', tr: b('mix', 'tournez pour faire un seul produit') },
    { fr: 'petit à petit', tr: b('little by little', 'doucement, une petite quantité après l’autre') },
    { fr: 'lisse', tr: b('smooth', 'régulier, sans morceaux') },
    { fr: 'grumeaux', tr: b('lumps', 'petites boules de farine dans la pâte') },
    { fr: 'reposer', tr: b('to rest', 'attendre sans toucher') },
    { fr: 'une poêle', tr: b('a frying pan', 'ustensile plat avec un manche, pour cuire') },
    { fr: 'une petite louche', tr: b('a small ladle', 'grande cuillère profonde pour servir un liquide') },
    { fr: 'étaler', tr: b('to spread', 'mettre partout, en couche fine') },
    { fr: 'retournez', tr: b('turn over', 'mettez l’autre côté en bas') },
    { fr: 'faites sauter', tr: b('flip (by tossing it in the air)', 'lancez en l’air pour la retourner') },
    { fr: 'une pièce', tr: b('a coin', 'de l’argent en métal') },
  ],
  questions: [
    {
      q: 'À quoi sert ce texte ?',
      qEn: 'What is this text for?',
      options: ['À raconter l’histoire d’une famille', 'À expliquer comment préparer des crêpes', 'À vendre de la farine', 'À présenter un restaurant'],
      answer: 1,
      evidence: 'Voici une recette simple pour quatre personnes.',
      explain: b(
        'A list of ingredients, then steps with verbs like mettez, ajoutez, versez: it is a recipe.',
        'Une liste d’ingrédients, puis des étapes avec des verbes comme mettez, ajoutez, versez : c’est une recette.',
      ),
      skill: 'global',
    },
    {
      q: 'Quand est la Chandeleur ?',
      qEn: 'When is la Chandeleur?',
      options: ['Le vingt-cinq décembre', 'Le premier janvier', 'Le deux février', 'Le quatorze juillet'],
      answer: 2,
      evidence: 'Le deux février',
      explain: b(
        '“Le deux février, en France, c’est la Chandeleur.”',
        '« Le deux février, en France, c’est la Chandeleur. »',
      ),
      skill: 'detail',
    },
    {
      q: 'Combien d’œufs faut-il ?',
      qEn: 'How many eggs do you need?',
      options: ['Deux', 'Quatre', 'Cinq', 'Cinquante'],
      answer: 1,
      evidence: 'quatre œufs',
      explain: b(
        '“Quatre œufs.” Fifty is the grams of butter.',
        '« Quatre œufs. » Cinquante, ce sont les grammes de beurre.',
      ),
      skill: 'detail',
    },
    {
      q: 'Que veut dire « sans grumeaux » ?',
      qEn: 'What does “sans grumeaux” mean?',
      options: ['Sans sucre', 'Sans petites boules de farine', 'Sans œufs', 'Sans lait froid'],
      answer: 1,
      evidence: 'la pâte doit être lisse, sans grumeaux',
      explain: b(
        'The batter must be “lisse” (smooth): grumeaux are the little lumps of flour that form if you add the milk too fast.',
        'La pâte doit être « lisse » : les grumeaux sont les petites boules de farine qui se forment si on verse le lait trop vite.',
      ),
      skill: 'vocab',
    },
    {
      q: 'Que faut-il faire avant de cuire les crêpes ?',
      qEn: 'What must you do before cooking the crêpes?',
      options: ['Laisser reposer la pâte une heure', 'Mettre la pâte au four', 'Ajouter du chocolat dans la pâte', 'Faire sauter une pièce'],
      answer: 0,
      evidence: 'Laissez reposer la pâte une heure.',
      explain: b(
        '“Laissez reposer la pâte une heure”, then “ensuite, faites chauffer une poêle”: the rest comes first.',
        '« Laissez reposer la pâte une heure », puis « ensuite, faites chauffer une poêle » : le repos vient d’abord.',
      ),
      skill: 'detail',
    },
    {
      q: 'Selon la tradition, que se passe-t-il si on fait sauter la première crêpe avec une pièce dans la main ?',
      qEn: 'According to the tradition, what happens if you flip the first crêpe with a coin in your hand?',
      options: ['La crêpe est meilleure', 'On aura de l’argent toute l’année', 'On doit offrir la crêpe', 'La pièce tombe dans la poêle'],
      answer: 1,
      evidence: 'vous aurez de l’argent toute l’année',
      explain: b(
        '“Si vous faites sauter la première crêpe avec une pièce dans l’autre main, vous aurez de l’argent toute l’année.” It is a lucky tradition.',
        '« Si vous faites sauter la première crêpe avec une pièce dans l’autre main, vous aurez de l’argent toute l’année. » C’est une tradition porte-bonheur.',
      ),
      skill: 'inference',
    },
  ],
  focus: {
    title: b('The imperative for instructions', 'L’impératif pour donner des consignes'),
    body: b(
      'A recipe gives orders with the __imperative__: the present tense with vous, without the subject. Vous mélangez → __mélangez__; vous ajoutez → __ajoutez__. Faire is irregular: __faites__. With tu, -er verbs lose their s: tu ajoutes → **ajoute**. Verbs in the text: mettez, ajoutez, mélangez, versez, laissez, faites, tournez, retournez, attendez, servez.',
      'Une recette donne des consignes à l’__impératif__ : le présent avec vous, sans le sujet. Vous mélangez → __mélangez__ ; vous ajoutez → __ajoutez__. Faire est irrégulier : __faites__. Avec tu, les verbes en -er perdent leur s : tu ajoutes → **ajoute**. Les verbes du texte : mettez, ajoutez, mélangez, versez, laissez, faites, tournez, retournez, attendez, servez.',
    ),
    examples: [
      { fr: 'Ajoutez les œufs et mélangez.', tr: 'Add the eggs and mix.' },
      { fr: 'Laissez reposer la pâte une heure.', tr: 'Leave the batter to rest for an hour.' },
      { fr: 'Faites chauffer une poêle.', tr: 'Heat a frying pan.' },
    ],
  },
};

export default text;
