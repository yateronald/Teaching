import { b } from '../../types';
import type { ReadingText } from '../types';

const text: ReadingText = {
  id: 'le-velo-qui-attendait-au-sous-sol',
  warmup: b(
    'Think of something you have put off repairing. What would make you give it a try yourself?',
    'Pensez à un objet que vous aimeriez réparer. Qu’est-ce qui vous donnerait envie d’essayer par vous-même ?',
  ),
  paras: [
    { s: [
      ['Pendant presque un an, mon vélo rouge est resté au sous-sol.', 'For almost a year, my red bike stayed in the basement.'],
      ['Le pneu arrière était à plat et, chaque fois que je passais devant, je me promettais de le réparer le week-end suivant.', 'The rear tyre was flat, and every time I walked past it, I promised myself I would fix it the following weekend.'],
      ['Au bout de quelques mois, la chaîne avait même commencé à rouiller.', 'After a few months, even the chain had started to rust.'],
    ] },
    { s: [
      ['Un jeudi, en rentrant du travail, j’ai remarqué une affiche à l’entrée de mon immeuble.', 'One Thursday, coming home from work, I noticed a poster at the entrance to my building.'],
      ['Un atelier du quartier ouvrait le samedi : on pouvait y emprunter des outils et apprendre à réparer son vélo.', 'A neighbourhood workshop was open on Saturdays: you could borrow tools there and learn to fix your bike.'],
      ['J’y suis allée en pensant qu’on s’occuperait de mon vélo pendant que j’attendrais.', 'I went there thinking someone would take care of my bike while I waited.'],
    ] },
    { s: [
      ['À l’atelier, une bénévole qui s’appelait Samira m’a demandé ce qui n’allait pas.', 'At the workshop, a volunteer named Samira asked me what was wrong.'],
      ['Je lui ai montré la roue et j’ai fait un pas en arrière pour lui laisser la place.', 'I showed her the wheel and took a step back to give her room.'],
      ['Elle m’a tendu une clé et m’a dit en souriant : « Ici, c’est toi qui répares. »', 'She handed me a spanner and smiled. “Here, you’re the one who does the fixing.”'],
      ['La première fois, j’ai tourné la clé dans le mauvais sens.', 'The first time, I turned the spanner the wrong way.'],
      ['Samira n’a pas repris l’outil : elle m’a simplement montré dans quel sens tourner.', 'Samira didn’t take back the tool: she simply showed me which way to turn it.'],
    ] },
    { s: [
      ['Une heure plus tard, je suis rentrée à vélo, les doigts encore noirs de graisse.', 'An hour later I rode home, my fingers still black with grease.'],
      ['J’avais payé la chambre à air, mais pas le temps que Samira avait passé avec moi.', 'I had paid for the inner tube, but not for the time Samira had spent with me.'],
    ] },
    { s: [
      ['Deux semaines plus tard, j’y suis retournée pour nettoyer la chaîne.', 'Two weeks later, I went back to clean the chain.'],
      ['À côté de moi, un homme attendait qu’on s’occupe de son vélo.', 'Beside me, a man was waiting for someone to take care of his bike.'],
      ['Il avait l’air aussi perdu que moi la première fois.', 'He looked just as lost as I had the first time.'],
      ['Je lui ai tendu une clé : « Tu veux essayer ? »', 'I handed him a spanner. “Want to give it a try?”'],
    ] },
  ],
  glossary: [
    { fr: 'sous-sol', tr: b('basement', 'l’étage situé sous le niveau de la rue') },
    { fr: 'à plat', tr: b('flat (of a tyre)', 'dégonflé, sans assez d’air') },
    { fr: 'rouiller', tr: b('to rust', 'se couvrir d’une couche brun-orange, comme du fer exposé à l’humidité') },
    { fr: 'emprunter', tr: b('to borrow', 'utiliser quelque chose, puis le rendre') },
    { fr: 'bénévole', tr: b('volunteer', 'personne qui donne de son temps sans être payée') },
    { fr: 'une clé', tr: b('a spanner, a wrench', 'ici, un outil qui sert à serrer ou à desserrer une pièce') },
    { fr: 'dans le mauvais sens', tr: b('the wrong way', 'dans la direction opposée à celle qu’il fallait prendre') },
    { fr: 'chambre à air', tr: b('inner tube', 'la partie gonflable à l’intérieur du pneu') },
    { fr: 'perdu', tr: b('unsure, a bit lost', 'ici, qui ne sait pas quoi faire') },
  ],
  questions: [
    {
      q: 'Quelle phrase résume le mieux le récit ?',
      qEn: 'Which sentence best sums up the story?',
      options: ['Une cycliste découvre qu’il est plus simple de faire réparer son vélo par quelqu’un.', 'Une cycliste apprend à réparer son vélo, puis encourage quelqu’un d’autre à essayer.', 'Une bénévole remet un vieux vélo en état pour le prêter à un voisin.', 'Deux voisins décident d’ouvrir leur propre atelier de réparation.'],
      answer: 1,
      evidence: ['Ici, c’est toi qui répares.', 'Je lui ai tendu une clé : « Tu veux essayer ? »'],
      explain: b('At first, Samira hands her the tool. At the end, the narrator does the same for another person.', 'Au début, Samira lui tend l’outil. À la fin, la narratrice fait le même geste pour quelqu’un d’autre.'),
      skill: 'global',
    },
    {
      q: 'Pourquoi le vélo est-il resté si longtemps au sous-sol ?',
      qEn: 'Why did the bike stay in the basement for so long?',
      options: ['La narratrice ne trouvait plus la clé du sous-sol.', 'Elle attendait que l’atelier du quartier ouvre.', 'Elle ne savait pas où acheter un pneu neuf.', 'Elle repoussait sans cesse le moment de le réparer.'],
      answer: 3,
      evidence: 'chaque fois que je passais devant, je me promettais de le réparer le week-end suivant',
      explain: b('“Chaque fois” and “le week-end suivant” show a promise she kept making without acting on it.', '« Chaque fois » et « le week-end suivant » montrent qu’elle se faisait la même promesse sans passer à l’action.'),
      skill: 'inference',
    },
    {
      q: 'Dans ce texte, que veut dire « emprunter des outils » ?',
      qEn: 'In this text, what does “emprunter des outils” mean?',
      options: ['Utiliser les outils puis les rendre.', 'Acheter les outils à un prix réduit.', 'Apporter ses outils pour les donner.', 'Échanger ses outils contre des pièces.'],
      answer: 0,
      evidence: 'on pouvait y emprunter des outils',
      explain: b('When you borrow a tool, you can use it for a time but it still belongs to someone else.', 'Quand on emprunte un outil, on peut l’utiliser un moment, mais il appartient toujours à quelqu’un d’autre.'),
      skill: 'vocab',
    },
    {
      q: 'Que pensait faire la narratrice en arrivant à l’atelier ?',
      qEn: 'What did the narrator think she would do when she arrived at the workshop?',
      options: ['Demander à Samira de lui montrer comment nettoyer la chaîne.', 'Emprunter une clé pour terminer la réparation chez elle.', 'Attendre que quelqu’un répare son vélo.', 'Changer la roue seule avec les outils sur place.'],
      answer: 2,
      evidence: 'en pensant qu’on s’occuperait de mon vélo pendant que j’attendrais',
      explain: b('She expects the workshop to work like a repair shop: someone else does the job while she waits.', 'Elle croit qu’on va réparer le vélo pour elle. La suite montre que l’atelier est là pour lui apprendre à le faire elle-même.'),
      skill: 'detail',
    },
    {
      q: 'Comment Samira réagit-elle quand la narratrice se trompe ?',
      qEn: 'How does Samira react when the narrator makes a mistake?',
      options: ['Elle termine elle-même la réparation.', 'Elle lui demande d’observer un autre cycliste.', 'Elle lui donne un outil plus facile à utiliser.', 'Elle lui montre le bon geste sans faire le travail à sa place.'],
      answer: 3,
      evidence: 'Samira n’a pas repris l’outil : elle m’a simplement montré dans quel sens tourner.',
      explain: b('Samira corrects the gesture, but leaves the spanner in the narrator’s hands.', 'Samira corrige le geste, mais laisse la clé entre les mains de la narratrice.'),
      skill: 'detail',
    },
    {
      q: 'Qu’est-ce que la narratrice a payé lors de sa première visite ?',
      qEn: 'What did the narrator pay for on her first visit?',
      options: ['Une heure d’aide.', 'La pièce utilisée pour la réparation.', 'L’emprunt des outils.', 'Une inscription à l’atelier.'],
      answer: 1,
      evidence: 'J’avais payé la chambre à air, mais pas le temps que Samira avait passé avec moi.',
      explain: b('She pays for the inner tube, not for Samira’s help.', 'Elle paie la chambre à air, pas l’aide de Samira.'),
      skill: 'detail',
    },
    {
      q: 'Pourquoi la narratrice tend-elle une clé à l’homme à la fin ?',
      qEn: 'Why does the narrator hand the man a spanner at the end?',
      options: ['Elle veut lui demander de réparer sa chaîne.', 'Elle pense que l’homme travaille à l’atelier.', 'Elle reconnaît son hésitation et l’invite à essayer, comme Samira l’a fait avec elle.', 'Elle ne sait plus dans quel sens tourner la clé.'],
      answer: 2,
      evidence: ['Elle m’a tendu une clé', 'Il avait l’air aussi perdu que moi la première fois.', 'Je lui ai tendu une clé : « Tu veux essayer ? »'],
      explain: b('She recognises how she felt on her first visit and passes on what helped her: a tool and an invitation to try.', 'Elle reconnaît l’hésitation de sa première visite et partage ce qui l’a aidée : un outil et une invitation à essayer.'),
      skill: 'inference',
    },
    {
      q: 'Quel événement met fin à la routine décrite au début du récit ?',
      qEn: 'Which event breaks the routine described at the start of the story?',
      options: ['La narratrice remarque une affiche en rentrant du travail.', 'La narratrice se fait une nouvelle promesse.', 'La chaîne commence à rouiller.', 'La narratrice constate que son pneu est à plat.'],
      answer: 0,
      evidence: 'Un jeudi, en rentrant du travail, j’ai remarqué une affiche à l’entrée de mon immeuble.',
      explain: b('The first paragraph sets the scene. The poster tells her where to go and leads to her first visit.', 'Le premier paragraphe pose le décor. L’affiche lui indique où aller et déclenche sa première visite.'),
      skill: 'inference',
    },
  ],
  focus: {
    title: b('Telling a story: imparfait and passé composé', 'Raconter une histoire : imparfait et passé composé'),
    body: b(
      'Use the **imparfait** for a background situation or a habit: the tyre **était** flat and the narrator **passait** it regularly. Use the **passé composé** for an event that moves the story forward: one Thursday, she **a remarqué** a poster. Try retelling the story in two sentences: what was the situation, and what happened next?',
      'L’**imparfait** pose le décor ou décrit une habitude : le pneu **était** à plat et la narratrice **passait** régulièrement devant. Le **passé composé** fait avancer le récit : un jeudi, elle **a remarqué** une affiche. Résumez l’histoire en deux phrases : quelle était la situation au départ, et que s’est-il passé ensuite ?',
    ),
    examples: [
      { fr: 'Le pneu arrière était à plat.', tr: 'The rear tyre was flat.' },
      { fr: 'J’ai remarqué une affiche à l’entrée de mon immeuble.', tr: 'I noticed a poster at the entrance to my building.' },
    ],
  },
};

export default text;
