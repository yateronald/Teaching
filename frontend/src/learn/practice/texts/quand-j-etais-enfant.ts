// A2 · Story. Childhood summers at the grandparents’ house in Brittany:
// the imparfait for descriptions and habits in the past.
import { b } from '../../types';
import type { ReadingText } from '../types';

const text: ReadingText = {
  id: 'quand-j-etais-enfant',
  warmup: b(
    'Think of a place you loved as a child. Then read this memory: what did the writer do there every day?',
    'Pensez à un lieu que vous aimiez quand vous étiez enfant. Puis lisez ce souvenir : que faisait l’auteur là-bas chaque jour ?',
  ),
  paras: [
    { s: [
      ['Quand j’étais enfant, je passais tous mes étés chez mes grands-parents, dans un petit village de Bretagne.', 'When I was a child, I spent all my summers at my grandparents’ house, in a small village in Brittany.'],
      ['Leur maison était vieille et un peu froide, mais j’adorais cet endroit.', 'Their house was old and a bit cold, but I loved that place.'],
    ] },
    { s: [
      ['Chaque matin, mon grand-père me réveillait très tôt.', 'Every morning, my grandfather woke me up very early.'],
      ['Nous allions ensemble à la boulangerie, puis nous donnions à manger aux poules.', 'We went to the bakery together, then we fed the hens.'],
      ['Ma grand-mère, elle, préparait des crêpes pour le goûter.', 'My grandmother, for her part, made crêpes for the afternoon snack.'],
    ] },
    { s: [
      ['L’après-midi, s’il faisait beau, j’allais à la plage avec les enfants du village.', 'In the afternoon, if the weather was nice, I went to the beach with the village children.'],
      ['Nous construisions des châteaux de sable et nous cherchions des coquillages.', 'We built sandcastles and looked for shells.'],
      ['Quand il pleuvait, je lisais des bandes dessinées dans le grenier.', 'When it rained, I read comics in the attic.'],
    ] },
    { s: [
      ['Il n’y avait pas de télévision chez eux, et pourtant, je ne m’ennuyais jamais.', 'There was no television at their house, and yet I was never bored.'],
      ['Le soir, mon grand-père racontait des histoires de marins pendant que nous mangions la soupe.', 'In the evening, my grandfather told sailors’ stories while we ate our soup.'],
    ] },
    { s: [
      ['Aujourd’hui, mes grands-parents ne sont plus là, mais chaque fois que je mange une crêpe, je pense à ces étés.', 'Today my grandparents are no longer here, but every time I eat a crêpe, I think of those summers.'],
    ] },
  ],
  glossary: [
    { fr: 'je passais tous mes étés', tr: b('I spent all my summers', 'chaque été, j’allais là-bas') },
    { fr: 'cet endroit', tr: b('that place', 'ce lieu') },
    { fr: 'me réveillait', tr: b('woke me up', 'me faisait sortir du sommeil') },
    { fr: 'poules', tr: b('hens', 'des oiseaux de la ferme qui pondent des œufs') },
    { fr: 'le goûter', tr: b('the afternoon snack', 'le petit repas de l’après-midi, vers seize heures') },
    { fr: 's’il faisait beau', tr: b('if the weather was nice', 'quand il y avait du soleil') },
    { fr: 'des coquillages', tr: b('shells', 'les petites maisons dures de certains animaux de la mer') },
    { fr: 'des bandes dessinées', tr: b('comics', 'des histoires en images (on dit aussi BD)') },
    { fr: 'le grenier', tr: b('the attic', 'la pièce sous le toit') },
    { fr: 'marins', tr: b('sailors', 'les personnes qui travaillent sur un bateau') },
  ],
  questions: [
    {
      q: 'De quoi parle ce texte ?',
      qEn: 'What is this text about?',
      options: ['D’un voyage en Bretagne l’année dernière', 'De souvenirs d’enfance chez les grands-parents', 'De la vie dans une grande ville', 'D’un métier à la ferme'],
      answer: 1,
      evidence: ['Quand j’étais enfant', 'je pense à ces étés'],
      explain: b(
        '“Quand j’étais enfant…” opens a memory, and the imparfait describes what usually happened during those summers.',
        '« Quand j’étais enfant… » ouvre un souvenir, et l’imparfait décrit ce qui se passait d’habitude pendant ces étés.',
      ),
      skill: 'global',
    },
    {
      q: 'Que faisait le grand-père chaque matin ?',
      qEn: 'What did the grandfather do every morning?',
      options: ['Préparer des crêpes', 'Réveiller l’enfant très tôt', 'Aller à la plage', 'Regarder la télévision'],
      answer: 1,
      evidence: 'mon grand-père me réveillait très tôt',
      explain: b(
        '“Chaque matin, mon grand-père me réveillait très tôt.” The crêpes were the grandmother’s job.',
        '« Chaque matin, mon grand-père me réveillait très tôt. » Les crêpes, c’était la grand-mère.',
      ),
      skill: 'detail',
    },
    {
      q: 'Quand il pleuvait, que faisait l’enfant ?',
      qEn: 'When it rained, what did the child do?',
      options: ['Aller à la plage', 'Lire des bandes dessinées', 'Regarder la télévision', 'Faire des crêpes'],
      answer: 1,
      evidence: 'Quand il pleuvait, je lisais des bandes dessinées dans le grenier.',
      explain: b(
        '“Quand il pleuvait, je lisais des bandes dessinées dans le grenier.” The beach was for sunny days.',
        '« Quand il pleuvait, je lisais des bandes dessinées dans le grenier. » La plage, c’était quand il faisait beau.',
      ),
      skill: 'detail',
    },
    {
      q: 'Il y avait une télévision chez les grands-parents.',
      qEn: 'There was a television at the grandparents’ house.',
      options: ['Vrai', 'Faux', 'Le texte ne le dit pas'],
      answer: 1,
      evidence: 'Il n’y avait pas de télévision chez eux',
      explain: b(
        '“Il n’y avait pas de télévision chez eux.” Il n’y avait pas is the imparfait of il n’y a pas.',
        '« Il n’y avait pas de télévision chez eux. » Il n’y avait pas est l’imparfait de il n’y a pas.',
      ),
      skill: 'detail',
    },
    {
      q: '« Je ne m’ennuyais jamais » veut dire :',
      qEn: 'What does “je ne m’ennuyais jamais” mean?',
      options: ['Je trouvais toujours quelque chose à faire.', 'J’avais toujours sommeil.', 'Je voulais rentrer chez moi.', 'Je n’aimais pas le village.'],
      answer: 0,
      evidence: 'je ne m’ennuyais jamais',
      explain: b(
        'S’ennuyer means to be bored. With et pourtant (and yet), the writer says that even without television, there was always something to do.',
        'S’ennuyer, c’est ne pas savoir quoi faire. Avec et pourtant, l’auteur dit que même sans télévision, il y avait toujours quelque chose à faire.',
      ),
      skill: 'vocab',
    },
    {
      q: 'Aujourd’hui, qu’est-ce qui rappelle ces étés à l’auteur ?',
      qEn: 'Today, what reminds the writer of those summers?',
      options: ['Les coquillages', 'Les crêpes', 'La soupe', 'La plage'],
      answer: 1,
      evidence: 'chaque fois que je mange une crêpe, je pense à ces étés',
      explain: b(
        '“Chaque fois que je mange une crêpe, je pense à ces étés.” The crêpes were the grandmother’s afternoon snack.',
        '« Chaque fois que je mange une crêpe, je pense à ces étés. » Les crêpes, c’était le goûter de la grand-mère.',
      ),
      skill: 'inference',
    },
  ],
  focus: {
    title: b('The imparfait: describing the past and habits', 'L’imparfait : décrire le passé et les habitudes'),
    body: b(
      'The imparfait describes how things were (__la maison était vieille__) and what used to happen again and again (__chaque matin, mon grand-père me réveillait__). Take the **nous** form of the present, remove -ons and add **-ais, -ais, -ait, -ions, -iez, -aient**: nous allons → __j’allais__. Only être is irregular: __j’étais__. Words like **chaque matin**, **quand** and **souvent** often go with it.',
      'L’imparfait décrit comment étaient les choses (__la maison était vieille__) et ce qui se répétait (__chaque matin, mon grand-père me réveillait__). On prend la forme **nous** du présent, on enlève -ons et on ajoute **-ais, -ais, -ait, -ions, -iez, -aient** : nous allons → __j’allais__. Seul être est irrégulier : __j’étais__. Des mots comme **chaque matin**, **quand** et **souvent** l’accompagnent souvent.',
    ),
    examples: [
      { fr: 'Leur maison était vieille.', tr: 'Their house was old.' },
      { fr: 'Chaque matin, mon grand-père me réveillait.', tr: 'Every morning, my grandfather woke me up.' },
      { fr: 'Quand il pleuvait, je lisais.', tr: 'When it rained, I read.' },
    ],
  },
};

export default text;
