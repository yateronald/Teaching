// A1 · Portrait. Lucas introduces himself: avoir for age, être for
// nationality and job, à + city and au + country.
import { b } from '../../types';
import type { ReadingText } from '../types';

const text: ReadingText = {
  id: 'je-m-appelle-lucas',
  warmup: b(
    'Look at the picture and the title. What do you think Lucas will tell you about himself?',
    'Regardez l’image et le titre. À votre avis, qu’est-ce que Lucas va raconter sur lui ?',
  ),
  paras: [
    { s: [
      ['Bonjour !', 'Hello!'],
      ['Je m’appelle Lucas Ferreira.', 'My name is Lucas Ferreira.'],
      ['J’ai vingt-huit ans et je suis brésilien.', 'I am twenty-eight years old and I am Brazilian.'],
      ['Je viens de Recife, une grande ville au bord de la mer, au Brésil.', 'I come from Recife, a big city by the sea, in Brazil.'],
    ] },
    { s: [
      ['Depuis six mois, j’habite à Montréal, au Canada.', 'I have been living in Montréal, Canada, for six months.'],
      ['J’ai un petit appartement dans le quartier Rosemont.', 'I have a small apartment in the Rosemont neighbourhood.'],
      ['J’habite avec mon ami Karim.', 'I live with my friend Karim.'],
      ['Il est marocain et il est très drôle.', 'He is Moroccan and he is very funny.'],
    ] },
    { s: [
      ['Je suis infirmier.', 'I am a nurse.'],
      ['Je travaille dans un grand hôpital, la nuit, trois jours par semaine.', 'I work in a big hospital, at night, three days a week.'],
      ['C’est fatigant, mais j’aime beaucoup mon travail.', 'It is tiring, but I really like my job.'],
    ] },
    { s: [
      ['Je parle portugais, anglais et un peu espagnol.', 'I speak Portuguese, English and a little Spanish.'],
      ['Maintenant, j’apprends le français.', 'Now I am learning French.'],
      ['C’est difficile, mais j’adore cette langue !', 'It is difficult, but I love this language!'],
      ['J’ai des cours deux fois par semaine, le mardi et le jeudi.', 'I have classes twice a week, on Tuesdays and Thursdays.'],
    ] },
    { s: [
      ['Le samedi, je joue au soccer dans un parc avec des collègues.', 'On Saturdays, I play soccer in a park with colleagues.'],
      ['Au Québec, on dit « soccer » et pas « football » !', 'In Québec, people say “soccer”, not “football”!'],
      ['Et vous, comment vous appelez-vous ?', 'And you, what is your name?'],
    ] },
  ],
  glossary: [
    { fr: 'brésilien', tr: b('Brazilian', 'qui vient du Brésil') },
    { fr: 'au bord de la mer', tr: b('by the sea', 'à côté de la mer') },
    { fr: 'Depuis six mois', tr: b('for six months (and it is still true now)', 'il y a six mois, et c’est toujours vrai aujourd’hui') },
    { fr: 'le quartier', tr: b('the neighbourhood', 'une partie de la ville') },
    { fr: 'drôle', tr: b('funny', 'qui fait rire') },
    { fr: 'infirmier', tr: b('nurse (for a woman: une infirmière)', 'il soigne les malades à l’hôpital (au féminin : infirmière)') },
    { fr: 'fatigant', tr: b('tiring', 'qui fatigue') },
    { fr: 'un peu', tr: b('a little', 'pas beaucoup') },
    { fr: 'deux fois par semaine', tr: b('twice a week', 'deux jours chaque semaine') },
    { fr: 'des collègues', tr: b('colleagues, coworkers', 'des personnes qui travaillent avec moi') },
  ],
  questions: [
    {
      q: 'Quel âge a Lucas ?',
      qEn: 'How old is Lucas?',
      options: ['18 ans', '28 ans', '38 ans', '20 ans'],
      answer: 1,
      evidence: 'J’ai vingt-huit ans',
      explain: b(
        '“Vingt-huit” is 28. In French, age goes with avoir: j’ai 28 ans (never “je suis 28 ans”).',
        '« Vingt-huit », c’est 28. En français, l’âge se dit avec avoir : j’ai 28 ans (jamais « je suis 28 ans »).',
      ),
      skill: 'detail',
    },
    {
      q: 'De quel pays vient Lucas ?',
      qEn: 'Which country does Lucas come from?',
      options: ['Du Maroc', 'Du Portugal', 'Du Brésil', 'Du Canada'],
      answer: 2,
      evidence: 'au Brésil',
      explain: b(
        'He comes from Recife, in Brazil. Morocco is Karim’s country, Portuguese is a language Lucas speaks, and Canada is where he lives now.',
        'Il vient de Recife, au Brésil. Le Maroc est le pays de Karim, le portugais est une langue que Lucas parle et le Canada est le pays où il habite maintenant.',
      ),
      skill: 'detail',
    },
    {
      q: 'Avec qui Lucas habite-t-il ?',
      qEn: 'Who does Lucas live with?',
      options: ['Seul', 'Avec sa famille', 'Avec son ami Karim', 'Avec des collègues'],
      answer: 2,
      evidence: 'J’habite avec mon ami Karim.',
      explain: b(
        '“J’habite avec mon ami Karim.” He plays soccer with colleagues, but he does not live with them.',
        '« J’habite avec mon ami Karim. » Il joue au soccer avec des collègues, mais il n’habite pas avec eux.',
      ),
      skill: 'detail',
    },
    {
      q: 'Quel est le métier de Lucas ?',
      qEn: 'What is Lucas’s job?',
      options: ['Il est cuisinier.', 'Il est infirmier.', 'Il est professeur.', 'Il est joueur de soccer.'],
      answer: 1,
      evidence: 'Je suis infirmier.',
      explain: b(
        '“Je suis infirmier”: he works in a hospital. Soccer is what he does on Saturdays. Note: no article before a job after être (je suis infirmier).',
        '« Je suis infirmier » : il travaille dans un hôpital. Le soccer, c’est son loisir du samedi. Attention : pas d’article devant un métier après être (je suis infirmier).',
      ),
      skill: 'detail',
    },
    {
      q: 'Quand Lucas a-t-il ses cours de français ?',
      qEn: 'When does Lucas have his French classes?',
      options: ['Le samedi', 'Le mardi et le jeudi', 'Tous les jours', 'La nuit'],
      answer: 1,
      evidence: 'le mardi et le jeudi',
      explain: b(
        '“Deux fois par semaine, le mardi et le jeudi.” Le + a day means every week on that day. He works at night and plays soccer on Saturdays.',
        '« Deux fois par semaine, le mardi et le jeudi. » Le + jour veut dire : chaque semaine, ce jour-là. Il travaille la nuit et joue au soccer le samedi.',
      ),
      skill: 'detail',
    },
  ],
  focus: {
    title: b('Introducing yourself: avoir or être?', 'Se présenter : avoir ou être ?'),
    body: b(
      'To give your **age**, French uses **avoir**: __j’ai 28 ans__. For your **nationality** or your **job**, use **être**, with no article before the job: __je suis brésilien__, __je suis infirmier__. Before a city, say **à**: __j’habite à Montréal__; before a masculine country, **au**: __au Canada__, __au Brésil__.',
      'Pour dire son **âge**, on utilise **avoir** : __j’ai 28 ans__. Pour la **nationalité** ou le **métier**, on utilise **être**, sans article devant le métier : __je suis brésilien__, __je suis infirmier__. Devant une ville, on dit **à** : __j’habite à Montréal__ ; devant un pays masculin, **au** : __au Canada__, __au Brésil__.',
    ),
    examples: [
      { fr: 'J’ai vingt-huit ans.', tr: 'I am twenty-eight.' },
      { fr: 'Je suis brésilien.', tr: 'I am Brazilian.' },
      { fr: 'J’habite à Montréal, au Canada.', tr: 'I live in Montréal, in Canada.' },
    ],
  },
};

export default text;
