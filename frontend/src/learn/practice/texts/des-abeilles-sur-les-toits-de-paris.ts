// B1 · Interview. An urban beekeeper explains how she started, why bees can
// thrive in a city, and the limits of the trend. Relative pronouns qui, que, où.
import { b } from '../../types';
import type { ReadingText } from '../types';

const text: ReadingText = {
  id: 'des-abeilles-sur-les-toits-de-paris',
  speakers: [{ name: 'Le journaliste', voice: 'm' }, { name: 'Claire Vasseur', voice: 'f' }],
  warmup: b(
    'Can bees live in a big city? What could help them, and what could be a problem?',
    'Des abeilles peuvent-elles vivre dans une grande ville ? Qu’est-ce qui pourrait les aider, et qu’est-ce qui pourrait poser problème ?',
  ),
  paras: [
    { who: 0, s: [
      ['Claire Vasseur, vous installez des ruches sur les toits de Paris depuis dix ans.', 'Claire Vasseur, you have been setting up beehives on the roofs of Paris for ten years.'],
      ['Comment cette aventure a-t-elle commencé ?', 'How did this adventure begin?'],
    ] },
    { who: 1, s: [
      ['Par hasard !', 'By chance!'],
      ['J’étais comptable dans une grande entreprise et je m’ennuyais un peu.', 'I was an accountant in a large company and I was a little bored.'],
      ['Un jour, un collègue qui avait une ruche à la campagne m’a proposé de l’accompagner.', 'One day, a colleague who had a hive in the countryside suggested I go with him.'],
      ['J’ai découvert un monde fascinant, et deux ans plus tard, j’ai changé de métier.', 'I discovered a fascinating world, and two years later, I changed careers.'],
    ] },
    { who: 0, s: [
      ['Pourquoi mettre des abeilles en ville ?', 'Why put bees in the city?'],
      ['On imagine que la campagne est plus adaptée.', 'You would think the countryside is better suited.'],
    ] },
    { who: 1, s: [
      ['Ce n’est pas toujours vrai.', 'That is not always true.'],
      ['Dans les champs où on utilise beaucoup de pesticides, les abeilles souffrent.', 'In fields where a lot of pesticides are used, bees suffer.'],
      ['À Paris, il y a des parcs, des jardins et des fleurs sur les balcons : les plantes que les abeilles trouvent sont très variées.', 'In Paris, there are parks, gardens and flowers on balconies: the plants that bees find are very varied.'],
      ['Et on n’utilise plus de pesticides dans les espaces verts de la ville.', 'And pesticides are no longer used in the city’s green spaces.'],
    ] },
    { who: 0, s: [['Et le miel parisien, il est bon ?', 'And is Parisian honey good?']] },
    { who: 1, s: [
      ['Il est excellent !', 'It is excellent!'],
      ['Comme les fleurs changent d’un quartier à l’autre, chaque miel a un goût différent.', 'As the flowers change from one district to another, each honey has a different taste.'],
      ['Le miel que je récolte près du jardin du Luxembourg n’a pas le même parfum que celui de Belleville.', 'The honey I harvest near the Luxembourg Gardens does not have the same flavour as the one from Belleville.'],
    ] },
    { who: 0, s: [['Est-ce qu’il y a des risques à installer trop de ruches en ville ?', 'Are there risks in setting up too many hives in the city?']] },
    { who: 1, s: [
      ['Oui, et c’est un point important.', 'Yes, and it is an important point.'],
      ['Les abeilles des ruches sont en concurrence avec les abeilles sauvages, qui ont besoin des mêmes fleurs.', 'Hive bees compete with wild bees, which need the same flowers.'],
      ['C’est pourquoi je conseille aux entreprises qui veulent une ruche de planter d’abord des fleurs.', 'That is why I advise companies that want a hive to plant flowers first.'],
      ['Une ruche sans fleurs autour, c’est une mauvaise idée.', 'A hive with no flowers around it is a bad idea.'],
    ] },
    { who: 0, s: [['Un dernier conseil pour nos lecteurs ?', 'One last piece of advice for our readers?']] },
    { who: 1, s: [
      ['Mettez sur votre balcon des plantes que les abeilles aiment, comme la lavande ou le romarin.', 'Put plants that bees like on your balcony, such as lavender or rosemary.'],
      ['C’est simple, et c’est un vrai cadeau pour elles.', 'It is simple, and it is a real gift for them.'],
    ] },
  ],
  glossary: [
    { fr: 'des ruches', tr: b('beehives', 'les maisons des abeilles, où elles font le miel') },
    { fr: 'Par hasard', tr: b('by chance', 'sans l’avoir prévu') },
    { fr: 'comptable', tr: b('accountant', 'personne qui s’occupe des comptes d’une entreprise') },
    { fr: 'je m’ennuyais', tr: b('I was bored', 'je trouvais le temps long, je n’avais pas d’intérêt') },
    { fr: 'fascinant', tr: b('fascinating', 'très intéressant, captivant') },
    { fr: 'adaptée', tr: b('suited', 'qui convient bien') },
    { fr: 'pesticides', tr: b('pesticides', 'produits chimiques contre les insectes et les mauvaises herbes') },
    { fr: 'souffrent', tr: b('suffer', 'vont mal, sont en danger') },
    { fr: 'espaces verts', tr: b('green spaces (parks, gardens)', 'parcs et jardins publics') },
    { fr: 'je récolte', tr: b('I harvest', 'je ramasse, je prends le miel des ruches') },
    { fr: 'parfum', tr: b('flavour, scent', 'le goût et l’odeur') },
    { fr: 'en concurrence', tr: b('competing', 'qui cherchent la même chose en même temps') },
    { fr: 'sauvages', tr: b('wild', 'qui vivent dans la nature, sans l’aide de l’homme') },
    { fr: 'la lavande', tr: b('lavender', 'plante aux fleurs violettes, au parfum fort') },
    { fr: 'le romarin', tr: b('rosemary', 'plante aromatique utilisée en cuisine') },
  ],
  questions: [
    {
      q: 'Quel est le sujet principal de cette interview ?',
      qEn: 'What is the main topic of this interview?',
      options: ['Le métier de comptable', 'L’apiculture en ville, ses avantages et ses limites', 'Les parcs de Paris', 'La recette du miel'],
      answer: 1,
      evidence: 'vous installez des ruches sur les toits de Paris depuis dix ans',
      explain: b(
        'The journalist talks to a beekeeper about bees in the city: why it works, the honey, and the risks.',
        'Le journaliste interroge une apicultrice sur les abeilles en ville : pourquoi ça marche, le miel, et les risques.',
      ),
      skill: 'global',
    },
    {
      q: 'Quel était le métier de Claire avant ?',
      qEn: 'What was Claire’s job before?',
      options: ['Journaliste', 'Agricultrice', 'Comptable', 'Jardinière'],
      answer: 2,
      evidence: 'J’étais comptable dans une grande entreprise',
      explain: b(
        '“J’étais comptable dans une grande entreprise”: the imparfait describes her past situation.',
        '« J’étais comptable dans une grande entreprise » : l’imparfait décrit sa situation passée.',
      ),
      skill: 'detail',
    },
    {
      q: 'Comment Claire a-t-elle découvert les abeilles ?',
      qEn: 'How did Claire discover bees?',
      options: ['Dans un livre', 'Grâce à un collègue qui avait une ruche', 'Pendant ses études', 'Sur son balcon'],
      answer: 1,
      evidence: 'un collègue qui avait une ruche à la campagne m’a proposé de l’accompagner',
      explain: b(
        'A colleague who had a hive in the countryside invited her to come with him.',
        'Un collègue qui avait une ruche à la campagne lui a proposé de l’accompagner.',
      ),
      skill: 'detail',
    },
    {
      q: 'Selon Claire, pourquoi la ville peut-elle être bonne pour les abeilles ?',
      qEn: 'According to Claire, why can the city be good for bees?',
      options: ['Il fait plus chaud qu’à la campagne', 'Les plantes sont variées et il n’y a plus de pesticides dans les espaces verts', 'Il y a moins d’abeilles sauvages', 'Les toits sont plus hauts'],
      answer: 1,
      evidence: ['les plantes que les abeilles trouvent sont très variées', 'on n’utilise plus de pesticides dans les espaces verts de la ville'],
      explain: b(
        'Two reasons: varied plants (parks, gardens, balconies) and no pesticides in the city’s green spaces.',
        'Deux raisons : des plantes variées (parcs, jardins, balcons) et pas de pesticides dans les espaces verts de la ville.',
      ),
      skill: 'detail',
    },
    {
      q: 'Pourquoi le miel n’a-t-il pas le même goût dans tous les quartiers ?',
      qEn: 'Why does the honey not taste the same in every district?',
      options: ['Parce que les fleurs changent d’un quartier à l’autre', 'Parce que Claire utilise des recettes différentes', 'Parce que certaines ruches sont plus vieilles', 'Parce qu’il pleut plus à Belleville'],
      answer: 0,
      evidence: 'Comme les fleurs changent d’un quartier à l’autre',
      explain: b(
        '“Comme” at the start of a sentence gives the cause: the flowers differ, so the taste differs.',
        '« Comme » en début de phrase donne la cause : les fleurs sont différentes, donc le goût aussi.',
      ),
      skill: 'inference',
    },
    {
      q: 'Quel risque Claire mentionne-t-elle ?',
      qEn: 'What risk does Claire mention?',
      options: ['Les abeilles piquent les habitants', 'Le miel est pollué', 'Les abeilles des ruches prennent les fleurs dont les abeilles sauvages ont besoin', 'Les ruches tombent des toits'],
      answer: 2,
      evidence: 'en concurrence avec les abeilles sauvages, qui ont besoin des mêmes fleurs',
      explain: b(
        'Hive bees and wild bees need the same flowers: with too many hives, wild bees lose out.',
        'Les abeilles des ruches et les abeilles sauvages ont besoin des mêmes fleurs : avec trop de ruches, les sauvages en manquent.',
      ),
      skill: 'detail',
    },
    {
      q: 'Que pense Claire d’une entreprise qui installe une ruche sans planter de fleurs ?',
      qEn: 'What does Claire think of a company that installs a hive without planting flowers?',
      options: ['C’est une bonne idée pour les salariés', 'C’est une mauvaise idée', 'C’est obligatoire à Paris', 'Elle n’a pas d’avis'],
      answer: 1,
      evidence: 'Une ruche sans fleurs autour, c’est une mauvaise idée.',
      explain: b(
        'She advises planting flowers first: “Une ruche sans fleurs autour, c’est une mauvaise idée.”',
        'Elle conseille de planter d’abord des fleurs : « Une ruche sans fleurs autour, c’est une mauvaise idée. »',
      ),
      skill: 'inference',
    },
  ],
  focus: {
    title: b('Relative pronouns qui, que, où', 'Les pronoms relatifs qui, que, où'),
    body: b(
      'A relative pronoun links two ideas about the same noun. __Qui__ is the subject of the verb that follows: un collègue **qui avait** une ruche. __Que__ is the object: le miel **que je récolte** (je récolte le miel). __Où__ refers to a place or a time: les champs **où on utilise** des pesticides. Tip: after que there is a new subject (je, les abeilles…); after qui there is directly a verb.',
      'Un pronom relatif relie deux idées sur le même nom. __Qui__ est le sujet du verbe qui suit : un collègue **qui avait** une ruche. __Que__ est le complément d’objet : le miel **que je récolte** (je récolte le miel). __Où__ renvoie à un lieu ou à un moment : les champs **où on utilise** des pesticides. Astuce : après que, il y a un nouveau sujet (je, les abeilles…) ; après qui, il y a directement un verbe.',
    ),
    examples: [
      { fr: 'Un collègue qui avait une ruche m’a proposé de l’accompagner.', tr: 'A colleague who had a hive suggested I go with him.' },
      { fr: 'Le miel que je récolte a un goût différent.', tr: 'The honey I harvest has a different taste.' },
      { fr: 'Dans les champs où on utilise des pesticides, les abeilles souffrent.', tr: 'In fields where pesticides are used, bees suffer.' },
    ],
  },
};

export default text;
