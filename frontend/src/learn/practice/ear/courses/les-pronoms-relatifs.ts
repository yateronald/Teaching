// C1 · Relative pronouns by ear: qui, que, dont, où, auquel, pour laquelle.
import { ear, ex, fill, pick, situation } from '../authoring';

const COLLEGUE = 'Le collègue dont je t’ai parlé, celui avec qui je travaille sur le projet, part à Lyon, la ville où il a grandi. C’est la raison pour laquelle il démissionne.';
const COLLEGUE_SHOW = 'Le collègue {dont} je t’ai parlé, celui avec {qui} je travaille sur le projet, part à Lyon, la ville {où} il a grandi. C’est la raison pour {laquelle} il démissionne.';

export default ear('les-pronoms-relatifs', {
  rule: [
    ['Les petits mots qui relient', 'The little linking words'],
    [
      'Les pronoms relatifs relient deux idées et vous disent quel rôle joue le mot repris : __qui__ (sujet : l’homme qui parle), __que__ (complément : le livre que je lis), __dont__ (= de + : le film __dont__ tout le monde parle, ce __dont__ j’ai besoin), __où__ (lieu ou moment : la ville où, le jour où), __lequel, auquel, duquel__ après une préposition (le projet __auquel__ je pense, la raison __pour laquelle__).\n\n__Dont__ est court et vite dit : s’il vous échappe, la phrase perd son sens.',
      'Relative pronouns link two ideas and tell you the role of the word picked up: __qui__ (subject: l’homme qui parle), __que__ (object: le livre que je lis), __dont__ (= de +: le film __dont__ tout le monde parle, ce __dont__ j’ai besoin), __où__ (place or time: la ville où, le jour où), __lequel, auquel, duquel__ after a preposition (le projet __auquel__ je pense, la raison __pour laquelle__).\n\n__Dont__ is short and said fast: miss it and the sentence loses its meaning.',
    ],
  ],
  goal: ['Entendre le pronom relatif et comprendre ce qu’il relie.', 'Hear the relative pronoun and understand what it links.'],
  examples: [
    ex('C’est ce dont j’ai besoin.', 'C’est ce {dont} j’ai besoin.', ['Dont = de cela (avoir besoin de).', 'Dont = of it (avoir besoin de).']),
    ex('Le jour où je l’ai rencontré.', 'Le jour {où} je l’ai rencontré.', ['Où : un moment, pas un lieu.', 'Où: a time, not a place.']),
    ex('Le projet auquel je pense.', 'Le projet {auquel} je pense.', ['Auquel = à + lequel (penser à).', 'Auquel = à + lequel (penser à).']),
  ],
  items: [
    pick('La personne dont je t’ai parlé arrive.', ['La personne que je t’ai présentée arrive.', 'La personne dont je t’ai parlé arrive.'], 1, 'La personne {dont} je t’ai parlé arrive.', [
      'Dont : parler de quelqu’un.', 'Dont: to talk about someone.',
    ]),
    pick('Le jour où il est parti, il pleuvait.', ['Un lieu', 'Un moment'], 1, 'Le jour {où} il est parti, il pleuvait.', [
      'Après « le jour », où désigne un moment.', 'After « le jour », où refers to a time.',
    ], ['Que désigne « où » ici ?', 'What does « où » refer to here?']),
    pick('C’est la raison pour laquelle je suis venu.', ['C’est pourquoi je suis venu', 'Je ne sais pas pourquoi je suis venu'], 0, 'C’est la raison pour {laquelle} je suis venu.', [
      'La raison pour laquelle = c’est pourquoi.', 'The reason why.',
    ], ['Que veut dire la phrase ?', 'What does the sentence mean?']),
    pick('Le film dont tout le monde parle.', ['Regarde ce film', 'Parle de ce film', 'Déteste ce film'], 1, 'Le film {dont} tout le monde parle.', [
      'Dont = de ce film : tout le monde parle de ce film.', 'Dont = about this film.',
    ], ['Que fait tout le monde ?', 'What is everyone doing?']),
    pick('Ce à quoi je pense, c’est le budget.', ['Au budget', 'À ses vacances', 'À son équipe'], 0, 'Ce à {quoi} je pense, c’est le budget.', [
      'Ce à quoi… c’est : la chose à laquelle on pense.', 'What I am thinking about is…',
    ], ['À quoi pense la personne ?', 'What is the speaker thinking about?']),
    fill('Voici ce dont j’ai besoin.', 'Voici ce ___ j’ai besoin.', 'dont', 'Voici ce {dont} j’ai besoin.', [
      'Avoir besoin de → ce dont.', 'Avoir besoin de → ce dont.',
    ]),
    fill('La ville où je suis né est petite.', 'La ville ___ je suis né est petite.', 'où', 'La ville {où} je suis né est petite.', [
      'Où : le lieu.', 'Où: the place.',
    ]),
    fill('C’est le projet auquel je travaille.', 'C’est le projet ___ je travaille.', 'auquel', 'C’est le projet {auquel} je travaille.', [
      'Travailler à → auquel (à + lequel).', 'Travailler à → auquel.',
    ]),
    situation(COLLEGUE, 'Où part le collègue ?', ['À Paris', 'À Lyon, la ville où il a grandi', 'Il ne part pas'], 1, COLLEGUE_SHOW, [
      '« La ville où il a grandi » : Lyon.', '« The city where he grew up »: Lyon.',
    ]),
    situation(COLLEGUE, 'Pourquoi démissionne-t-il ?', ['Parce qu’il n’aime pas le projet', 'Parce qu’il est malade', 'Parce qu’il part à Lyon'], 2, COLLEGUE_SHOW, [
      '« C’est la raison pour laquelle il démissionne » : son départ à Lyon.', '« That is why he is resigning »: his move to Lyon.',
    ]),
  ],
  takeaway: [
    'Qui sujet, que complément, dont = de +, où = lieu ou moment, auquel / pour laquelle après une préposition. Le petit « dont » est le plus facile à manquer.',
    'Qui subject, que object, dont = de +, où = place or time, auquel / pour laquelle after a preposition. Little « dont » is the easiest to miss.',
  ],
});
