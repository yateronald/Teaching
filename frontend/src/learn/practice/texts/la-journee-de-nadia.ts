// A1 · Story. A baker’s day, hour by hour: reflexive verbs (se lever,
// s’habiller, se coucher), telling the time and d’abord / ensuite / puis.
import { b } from '../../types';
import type { ReadingText } from '../types';

const text: ReadingText = {
  id: 'la-journee-de-nadia',
  warmup: b(
    'What time do you get up? Read about someone whose day starts long before the sun.',
    'Et vous, à quelle heure vous levez-vous ? Lisez la journée de quelqu’un qui commence bien avant le soleil.',
  ),
  paras: [
    { s: [
      ['Nadia a trente-cinq ans.', 'Nadia is thirty-five years old.'],
      ['Elle est boulangère à Lyon, en France.', 'She is a baker in Lyon, in France.'],
      ['Son travail commence très tôt : elle se lève à quatre heures du matin !', 'Her work starts very early: she gets up at four in the morning!'],
    ] },
    { s: [
      ['D’abord, elle prend une douche rapide et elle s’habille.', 'First, she takes a quick shower and gets dressed.'],
      ['Ensuite, elle boit un grand café noir.', 'Then she drinks a large black coffee.'],
      ['Elle ne mange pas : elle n’a pas faim si tôt.', 'She does not eat: she is not hungry so early.'],
      ['À quatre heures et demie, elle part à pied.', 'At half past four, she leaves on foot.'],
      ['La boulangerie est à dix minutes de chez elle.', 'The bakery is ten minutes from her home.'],
    ] },
    { s: [
      ['À cinq heures, Nadia prépare le pain, les croissants et les pains au chocolat.', 'At five o’clock, Nadia makes the bread, the croissants and the pains au chocolat.'],
      ['La boulangerie ouvre à sept heures.', 'The bakery opens at seven o’clock.'],
      ['Les premiers clients arrivent tout de suite : ils achètent une baguette avant d’aller au travail.', 'The first customers arrive right away: they buy a baguette before going to work.'],
    ] },
    { s: [
      ['À midi, Nadia déjeune avec ses collègues.', 'At noon, Nadia has lunch with her colleagues.'],
      ['Puis elle rentre à la maison et elle fait la sieste.', 'Then she goes home and takes a nap.'],
      ['Le soir, elle dîne avec son mari et ses deux enfants.', 'In the evening, she has dinner with her husband and her two children.'],
    ] },
    { s: [
      ['Nadia se couche à neuf heures du soir.', 'Nadia goes to bed at nine in the evening.'],
      ['C’est tôt, mais elle est heureuse : elle adore son métier.', 'It is early, but she is happy: she loves her job.'],
    ] },
  ],
  glossary: [
    { fr: 'boulangère', tr: b('baker (for a man: un boulanger)', 'elle fait le pain (au masculin : boulanger)') },
    { fr: 'tôt', tr: b('early', 'au début de la journée, avant l’heure habituelle') },
    { fr: 'elle se lève', tr: b('she gets up', 'elle sort du lit') },
    { fr: 'elle s’habille', tr: b('she gets dressed', 'elle met ses vêtements') },
    { fr: 'à pied', tr: b('on foot', 'en marchant') },
    { fr: 'chez elle', tr: b('her home', 'sa maison, son appartement') },
    { fr: 'tout de suite', tr: b('right away', 'immédiatement') },
    { fr: 'déjeune', tr: b('has lunch (in Québec: dîne)', 'prend le repas de midi (au Québec : dîne)') },
    { fr: 'fait la sieste', tr: b('takes a nap', 'dort un peu l’après-midi') },
    { fr: 'dîne', tr: b('has dinner (in Québec: soupe)', 'prend le repas du soir (au Québec : soupe)') },
  ],
  questions: [
    {
      q: 'À quelle heure Nadia se lève-t-elle ?',
      qEn: 'What time does Nadia get up?',
      options: ['À quatre heures', 'À cinq heures', 'À sept heures', 'À neuf heures'],
      answer: 0,
      evidence: 'elle se lève à quatre heures du matin',
      explain: b(
        '“Elle se lève à quatre heures du matin.” At five she makes the bread, at seven the bakery opens, at nine (in the evening) she goes to bed.',
        '« Elle se lève à quatre heures du matin. » À cinq heures, elle prépare le pain ; à sept heures, la boulangerie ouvre ; à neuf heures du soir, elle se couche.',
      ),
      skill: 'detail',
    },
    {
      q: 'Comment Nadia va-t-elle à la boulangerie ?',
      qEn: 'How does Nadia get to the bakery?',
      options: ['En bus', 'À vélo', 'À pied', 'En voiture'],
      answer: 2,
      evidence: 'elle part à pied',
      explain: b(
        '“Elle part à pied”: she walks. The bakery is ten minutes from her home.',
        '« Elle part à pied » : elle marche. La boulangerie est à dix minutes de chez elle.',
      ),
      skill: 'detail',
    },
    {
      q: 'Que fait Nadia avant de partir ?',
      qEn: 'What does Nadia do before she leaves?',
      options: ['Elle mange un croissant.', 'Elle boit un café.', 'Elle fait la sieste.', 'Elle prépare le pain.'],
      answer: 1,
      evidence: 'elle boit un grand café noir',
      explain: b(
        'She drinks a black coffee, but she does not eat: “elle n’a pas faim si tôt”. She makes the bread later, at the bakery.',
        'Elle boit un café noir, mais elle ne mange pas : « elle n’a pas faim si tôt ». Elle prépare le pain plus tard, à la boulangerie.',
      ),
      skill: 'detail',
    },
    {
      q: 'Qui achète une baguette avant d’aller au travail ?',
      qEn: 'Who buys a baguette before going to work?',
      options: ['Nadia', 'Le mari de Nadia', 'Les premiers clients', 'Les collègues de Nadia'],
      answer: 2,
      evidence: 'Les premiers clients arrivent tout de suite',
      explain: b(
        '“Ils achètent une baguette”: ils stands for “les premiers clients”, the subject just before. Finding who a pronoun refers to is a key reading skill.',
        '« Ils achètent une baguette » : ils remplace « les premiers clients », le sujet juste avant. Retrouver ce que remplace un pronom est une compétence clé en lecture.',
      ),
      skill: 'inference',
    },
    {
      q: 'Que fait Nadia l’après-midi ?',
      qEn: 'What does Nadia do in the afternoon?',
      options: ['Elle travaille à la boulangerie.', 'Elle fait la sieste.', 'Elle fait du sport.', 'Elle dîne avec sa famille.'],
      answer: 1,
      evidence: 'elle fait la sieste',
      explain: b(
        'After lunch, she goes home and “fait la sieste”: she sleeps a little. She has dinner with her family in the evening.',
        'Après le déjeuner, elle rentre et « fait la sieste » : elle dort un peu. Elle dîne avec sa famille le soir.',
      ),
      skill: 'detail',
    },
  ],
  focus: {
    title: b('Telling your day: reflexive verbs', 'Raconter sa journée : les verbes pronominaux'),
    body: b(
      'Many daily-routine verbs take a pronoun that matches the subject: __je me lève__, __tu te lèves__, __elle se lève__, __nous nous levons__. Before a vowel, me, te and se become m’, t’, s’: __elle s’habille__. To give the order of actions, use **d’abord**, **ensuite**, **puis** and **enfin**.',
      'Beaucoup de verbes de la routine se conjuguent avec un pronom qui correspond au sujet : __je me lève__, __tu te lèves__, __elle se lève__, __nous nous levons__. Devant une voyelle, me, te et se deviennent m’, t’, s’ : __elle s’habille__. Pour donner l’ordre des actions : **d’abord**, **ensuite**, **puis**, **enfin**.',
    ),
    examples: [
      { fr: 'Elle se lève à quatre heures.', tr: 'She gets up at four.' },
      { fr: 'D’abord, elle s’habille.', tr: 'First, she gets dressed.' },
      { fr: 'Nadia se couche à neuf heures du soir.', tr: 'Nadia goes to bed at nine in the evening.' },
    ],
  },
};

export default text;
