// B2 · Article. Phones at school: following a nuanced argument, finding
// each side and the author’s position; the subjunctive after il faut que,
// il est essentiel que and bien que.
import { b } from '../../types';
import type { ReadingText } from '../types';

const text: ReadingText = {
  id: 'faut-il-interdire-le-telephone-a-l-ecole',
  warmup: b(
    'Should phones be banned at school? Decide what you think before reading, then see if the article changes your mind.',
    'Faut-il interdire le téléphone à l’école ? Faites-vous une opinion avant de lire, puis voyez si l’article vous fait changer d’avis.',
  ),
  paras: [
    { lead: true, s: [
      ['Notifications, réseaux sociaux, vidéos : le téléphone accompagne les élèves partout, jusque dans la salle de classe.', 'Notifications, social media, videos: phones follow pupils everywhere, even into the classroom.'],
      ['En France comme au Québec, de plus en plus d’écoles en limitent l’usage.', 'In France as in Québec, more and more schools are restricting their use.'],
      ['Une bonne idée ?', 'A good idea?'],
    ] },
    { s: [
      ['Pour les partisans de l’interdiction, la question ne se pose même pas.', 'For supporters of a ban, the question does not even arise.'],
      ['Selon eux, il faut que les élèves puissent se concentrer sans être interrompus toutes les cinq minutes.', 'In their view, pupils must be able to concentrate without being interrupted every five minutes.'],
      ['Beaucoup d’enseignants affirment aussi que, sans téléphone, les élèves se parlent davantage pendant la récréation.', 'Many teachers also say that, without phones, pupils talk to each other more during break time.'],
    ] },
    { s: [
      ['D’autres voix sont plus nuancées.', 'Other voices are more nuanced.'],
      ['Bien que le téléphone soit une source de distraction, il peut aussi devenir un outil d’apprentissage : un dictionnaire, une calculatrice ou une caméra pour une expérience de sciences.', 'Although the phone is a source of distraction, it can also become a learning tool: a dictionary, a calculator or a camera for a science experiment.'],
      ['« Interdire ne suffit pas, estime une directrice d’école.', '“Banning is not enough,” says a school principal.'],
      ['Il est essentiel que l’école apprenne aux jeunes à utiliser les écrans de manière responsable, car ils les retrouveront partout en sortant. »', '“It is essential that school teaches young people to use screens responsibly, because they will find them everywhere once they leave.”'],
    ] },
    { s: [
      ['Les parents, eux, sont partagés.', 'Parents, for their part, are divided.'],
      ['Beaucoup approuvent l’interdiction, mais certains s’inquiètent : comment joindre leur enfant en cas d’urgence ?', 'Many approve of the ban, but some worry: how can they reach their child in an emergency?'],
      ['Les écoles leur rappellent que le secrétariat reste joignable à tout moment.', 'Schools remind them that the school office can be reached at any time.'],
    ] },
    { s: [
      ['Entre ces deux positions, beaucoup d’établissements choisissent une voie médiane : le téléphone reste éteint dans le sac, sauf quand l’enseignant demande qu’on s’en serve pour une activité précise.', 'Between these two positions, many schools choose a middle way: the phone stays switched off in the bag, except when the teacher asks for it to be used for a specific activity.'],
    ] },
    { s: [
      ['Au fond, le débat ne porte pas seulement sur un objet.', 'Basically, the debate is not just about an object.'],
      ['Il pose une question plus large : quelle place voulons-nous donner aux écrans dans la vie des enfants ?', 'It raises a wider question: what place do we want screens to have in children’s lives?'],
    ] },
  ],
  glossary: [
    { fr: 'en limitent l’usage', tr: b('restrict their use', 'permettent de les utiliser moins (en = des téléphones)') },
    { fr: 'les partisans', tr: b('the supporters', 'les personnes qui sont pour') },
    { fr: 'ne se pose même pas', tr: b('does not even arise', 'la réponse leur paraît évidente') },
    { fr: 'interrompus', tr: b('interrupted', 'arrêtés au milieu de ce qu’ils font') },
    { fr: 'davantage', tr: b('more', 'plus') },
    { fr: 'la récréation', tr: b('break time', 'la pause des élèves, dans la cour') },
    { fr: 'nuancées', tr: b('nuanced', 'ni totalement pour, ni totalement contre') },
    { fr: 'Bien que', tr: b('although (+ subjunctive)', 'même si (suivi du subjonctif)') },
    { fr: 'estime', tr: b('believes, considers', 'pense, juge') },
    { fr: 'partagés', tr: b('divided (in opinion)', 'qui n’ont pas tous le même avis') },
    { fr: 'joignable', tr: b('reachable', 'qu’on peut appeler ou contacter') },
    { fr: 'établissements', tr: b('schools (institutions)', 'les écoles, les collèges, les lycées') },
    { fr: 'Au fond', tr: b('basically, at heart', 'pour l’essentiel, en réalité') },
  ],
  questions: [
    {
      q: 'Quel est le sujet de l’article ?',
      qEn: 'What is the article about?',
      options: ['Les limites imposées au téléphone à l’école, et le débat qu’elles suscitent', 'Les meilleurs téléphones pour les élèves', 'Les réseaux sociaux des enseignants', 'Le prix des téléphones'],
      answer: 0,
      evidence: 'de plus en plus d’écoles en limitent l’usage',
      explain: b(
        'The lead states the fact (more and more schools restrict phones) and asks the question the article explores: “Une bonne idée ?”',
        'Le chapeau pose le fait (de plus en plus d’écoles limitent le téléphone) et la question que l’article examine : « Une bonne idée ? »',
      ),
      skill: 'global',
    },
    {
      q: 'Selon les partisans de l’interdiction, pourquoi faut-il interdire le téléphone ?',
      qEn: 'According to supporters of the ban, why should phones be banned?',
      options: ['Pour que les élèves puissent se concentrer', 'Pour faire des économies', 'Parce que les téléphones sont dangereux pour la santé', 'Pour punir les élèves'],
      answer: 0,
      evidence: 'il faut que les élèves puissent se concentrer',
      explain: b(
        '“Il faut que les élèves puissent se concentrer sans être interrompus.” Puissent is the subjunctive of pouvoir, after il faut que.',
        '« Il faut que les élèves puissent se concentrer sans être interrompus. » Puissent est le subjonctif de pouvoir, après il faut que.',
      ),
      skill: 'detail',
    },
    {
      q: 'D’après l’article, le téléphone peut aussi être :',
      qEn: 'According to the article, the phone can also be:',
      options: ['un outil d’apprentissage', 'un cadeau pour les bons élèves', 'un moyen de tricher', 'un objet interdit partout'],
      answer: 0,
      evidence: 'il peut aussi devenir un outil d’apprentissage',
      explain: b(
        'After bien que (although), the writer gives the other side: a dictionary, a calculator, a camera for science.',
        'Après bien que, l’auteur donne l’autre côté : un dictionnaire, une calculatrice, une caméra pour les sciences.',
      ),
      skill: 'detail',
    },
    {
      q: 'Que pense la directrice d’école ?',
      qEn: 'What does the school principal think?',
      options: ['Il faut interdire tous les écrans.', 'L’école doit apprendre aux jeunes à bien utiliser les écrans.', 'Le téléphone ne pose aucun problème.', 'Les parents doivent décider seuls.'],
      answer: 1,
      evidence: 'Il est essentiel que l’école apprenne aux jeunes à utiliser les écrans de manière responsable',
      explain: b(
        '“Interdire ne suffit pas”: banning is not enough, school must also teach responsible use, because screens are everywhere outside.',
        '« Interdire ne suffit pas » : il faut aussi que l’école apprenne un bon usage, car les écrans sont partout à l’extérieur.',
      ),
      skill: 'inference',
    },
    {
      q: 'Qu’ont choisi beaucoup d’établissements ?',
      qEn: 'What have many schools chosen?',
      options: ['Interdire le téléphone à la maison', 'Un téléphone éteint, sauf pour une activité demandée par l’enseignant', 'Laisser les élèves utiliser leur téléphone librement', 'Donner un téléphone à chaque élève'],
      answer: 1,
      evidence: 'le téléphone reste éteint dans le sac, sauf quand l’enseignant demande qu’on s’en serve',
      explain: b(
        'Une voie médiane, a middle way between the two positions: off in the bag, except for a specific activity.',
        'Une voie médiane, c’est un chemin entre les deux positions : éteint dans le sac, sauf pour une activité précise.',
      ),
      skill: 'detail',
    },
    {
      q: 'Dans la conclusion, l’auteur :',
      qEn: 'In the conclusion, the author:',
      options: ['prend clairement parti pour l’interdiction', 'élargit le débat à la place des écrans dans la vie des enfants', 'donne la parole aux élèves', 'critique les parents'],
      answer: 1,
      evidence: 'quelle place voulons-nous donner aux écrans dans la vie des enfants ?',
      explain: b(
        '“Au fond, le débat ne porte pas seulement sur un objet”: the author does not choose a side but opens a wider question. Ending on a question is a common way to conclude a B2 article.',
        '« Au fond, le débat ne porte pas seulement sur un objet » : l’auteur ne choisit pas de camp, il ouvre une question plus large. Finir sur une question est une conclusion courante dans un article de niveau B2.',
      ),
      skill: 'inference',
    },
  ],
  focus: {
    title: b('The subjunctive after necessity and concession', 'Le subjonctif après la nécessité et la concession'),
    body: b(
      'After expressions of necessity or importance, French uses the **subjunctive**: __il faut que les élèves puissent__, __il est essentiel que l’école apprenne__. After **bien que** (although) too: __bien que le téléphone soit une source de distraction__. Watch the irregular forms: être → **soit**, pouvoir → **puisse**, faire → **fasse**, aller → **aille**.',
      'Après une expression de nécessité ou d’importance, on emploie le **subjonctif** : __il faut que les élèves puissent__, __il est essentiel que l’école apprenne__. Après **bien que** aussi : __bien que le téléphone soit une source de distraction__. Attention aux formes irrégulières : être → **soit**, pouvoir → **puisse**, faire → **fasse**, aller → **aille**.',
    ),
    examples: [
      { fr: 'Il faut que les élèves puissent se concentrer.', tr: 'Pupils must be able to concentrate.' },
      { fr: 'Bien que le téléphone soit une source de distraction, il peut être utile.', tr: 'Although the phone is a distraction, it can be useful.' },
      { fr: 'Il est essentiel que l’école apprenne aux jeunes à utiliser les écrans.', tr: 'It is essential that school teaches young people to use screens.' },
    ],
  },
};

export default text;
