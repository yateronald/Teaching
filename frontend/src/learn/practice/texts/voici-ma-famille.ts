// A1 · Portrait. Aïcha describes her family from a photo: possessive
// adjectives (mon, ma, mes, son, sa, ses, nos, leur), describing people.
import { b } from '../../types';
import type { ReadingText } from '../types';

const text: ReadingText = {
  id: 'voici-ma-famille',
  warmup: b(
    'Look at the picture: who are these people? Read to find out how they are related.',
    'Regardez l’image : qui sont ces personnes ? Lisez pour découvrir leurs liens de famille.',
  ),
  paras: [
    { s: [
      ['Sur cette photo, voici ma famille.', 'In this photo, here is my family.'],
      ['Je m’appelle Aïcha et j’ai trente et un ans.', 'My name is Aïcha and I am thirty-one.'],
      ['J’habite à Sherbrooke, au Québec, avec mon mari et mes deux enfants.', 'I live in Sherbrooke, Québec, with my husband and my two children.'],
    ] },
    { s: [
      ['Mon mari s’appelle Omar.', 'My husband’s name is Omar.'],
      ['Il est grand, il a les cheveux courts et il porte des lunettes.', 'He is tall, he has short hair and he wears glasses.'],
      ['Il est cuisinier dans un restaurant.', 'He is a cook in a restaurant.'],
      ['Sa passion, c’est la musique : il joue de la guitare tous les soirs.', 'His passion is music: he plays the guitar every evening.'],
    ] },
    { s: [
      ['Nos enfants s’appellent Yanis et Lina.', 'Our children are called Yanis and Lina.'],
      ['Yanis a huit ans.', 'Yanis is eight.'],
      ['Il est très sportif et il adore le hockey.', 'He is very sporty and he loves hockey.'],
      ['Lina a cinq ans.', 'Lina is five.'],
      ['Elle est timide, mais elle chante tout le temps !', 'She is shy, but she sings all the time!'],
    ] },
    { s: [
      ['À droite, la dame aux cheveux blancs, c’est ma mère.', 'On the right, the lady with white hair is my mother.'],
      ['Elle habite au Sénégal, mais en ce moment, elle est chez nous pour l’été.', 'She lives in Senegal, but right now she is staying with us for the summer.'],
      ['Les enfants sont très contents : leur grand-mère raconte de belles histoires.', 'The children are very happy: their grandmother tells beautiful stories.'],
    ] },
    { s: [
      ['Et vous, votre famille est grande ou petite ?', 'And you, is your family big or small?'],
    ] },
  ],
  glossary: [
    { fr: 'mon mari', tr: b('my husband', 'l’homme avec qui je suis mariée') },
    { fr: 'les cheveux courts', tr: b('short hair', 'des cheveux qui ne sont pas longs') },
    { fr: 'il porte des lunettes', tr: b('he wears glasses', 'il a des lunettes sur les yeux') },
    { fr: 'cuisinier', tr: b('cook, chef', 'il prépare les repas dans un restaurant') },
    { fr: 'sportif', tr: b('sporty', 'qui aime faire du sport') },
    { fr: 'timide', tr: b('shy', 'qui n’ose pas parler aux gens') },
    { fr: 'tout le temps', tr: b('all the time', 'toujours, très souvent') },
    { fr: 'en ce moment', tr: b('right now, at the moment', 'maintenant, ces jours-ci') },
    { fr: 'raconte', tr: b('tells (a story)', 'dit une histoire à quelqu’un') },
  ],
  questions: [
    {
      q: 'Où habite la famille d’Aïcha ?',
      qEn: 'Where does Aïcha’s family live?',
      options: ['Au Sénégal', 'À Sherbrooke', 'À Montréal', 'Dans un restaurant'],
      answer: 1,
      evidence: 'J’habite à Sherbrooke, au Québec',
      explain: b(
        'They live in Sherbrooke, Québec. Senegal is where Aïcha’s mother lives.',
        'Ils habitent à Sherbrooke, au Québec. Le Sénégal, c’est le pays où habite la mère d’Aïcha.',
      ),
      skill: 'detail',
    },
    {
      q: 'Quel est le métier d’Omar ?',
      qEn: 'What is Omar’s job?',
      options: ['Musicien', 'Professeur', 'Cuisinier', 'Joueur de hockey'],
      answer: 2,
      evidence: 'Il est cuisinier dans un restaurant.',
      explain: b(
        '“Il est cuisinier dans un restaurant.” Music is his passion, not his job, and hockey is what his son loves.',
        '« Il est cuisinier dans un restaurant. » La musique est sa passion, pas son métier, et c’est son fils qui adore le hockey.',
      ),
      skill: 'detail',
    },
    {
      q: 'Comment est Lina ?',
      qEn: 'What is Lina like?',
      options: ['Sportive', 'Timide', 'Grande', 'Triste'],
      answer: 1,
      evidence: 'Elle est timide',
      explain: b(
        '“Elle est timide, mais elle chante tout le temps !” It is Yanis who is sporty.',
        '« Elle est timide, mais elle chante tout le temps ! » C’est Yanis qui est sportif.',
      ),
      skill: 'detail',
    },
    {
      q: 'Qui est la dame aux cheveux blancs ?',
      qEn: 'Who is the lady with white hair?',
      options: ['La sœur d’Aïcha', 'La mère d’Aïcha', 'Une voisine', 'La mère d’Omar'],
      answer: 1,
      evidence: 'c’est ma mère',
      explain: b(
        'Aïcha says “c’est ma mère”: ma refers to Aïcha. For the children, she is “leur grand-mère”.',
        'Aïcha dit « c’est ma mère » : ma renvoie à Aïcha. Pour les enfants, c’est « leur grand-mère ».',
      ),
      skill: 'inference',
    },
    {
      q: 'Pourquoi les enfants sont-ils contents ?',
      qEn: 'Why are the children happy?',
      options: ['Ils partent au Sénégal.', 'Leur grand-mère raconte de belles histoires.', 'Leur père joue de la guitare.', 'C’est leur anniversaire.'],
      answer: 1,
      evidence: 'leur grand-mère raconte de belles histoires',
      explain: b(
        '“Les enfants sont très contents : leur grand-mère raconte de belles histoires.” The colon introduces the reason.',
        '« Les enfants sont très contents : leur grand-mère raconte de belles histoires. » Les deux-points introduisent la raison.',
      ),
      skill: 'inference',
    },
  ],
  focus: {
    title: b('Mon, ma, mes: possessive adjectives', 'Mon, ma, mes : les adjectifs possessifs'),
    body: b(
      'The possessive agrees with the thing owned, not with the owner: __mon mari__ (masculine), __ma mère__ (feminine), __mes enfants__ (plural). For his or her, French uses **son, sa, ses**: __sa passion__ is Omar’s passion. For several owners: __nos enfants__ (our), __leur grand-mère__ (their). Before a feminine word starting with a vowel, ma becomes **mon**: __mon amie__.',
      'Le possessif s’accorde avec la chose possédée, pas avec le possesseur : __mon mari__ (masculin), __ma mère__ (féminin), __mes enfants__ (pluriel). Pour « à lui » ou « à elle », on utilise **son, sa, ses** : __sa passion__, c’est la passion d’Omar. Pour plusieurs possesseurs : __nos enfants__, __leur grand-mère__. Devant un mot féminin qui commence par une voyelle, ma devient **mon** : __mon amie__.',
    ),
    examples: [
      { fr: 'Voici ma famille.', tr: 'Here is my family.' },
      { fr: 'Mon mari s’appelle Omar.', tr: 'My husband’s name is Omar.' },
      { fr: 'Nos enfants s’appellent Yanis et Lina.', tr: 'Our children are called Yanis and Lina.' },
    ],
  },
};

export default text;
