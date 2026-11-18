// B2 · Article. Night trains come back in Europe: why they disappeared, why
// travellers want them again, and why their future is still fragile.
// The passive voice.
import { b } from '../../types';
import type { ReadingText } from '../types';

const text: ReadingText = {
  id: 'le-retour-des-trains-de-nuit',
  warmup: b(
    'Have you ever travelled by night train? Why might someone choose it over a plane today?',
    'Avez-vous déjà pris un train de nuit ? Pourquoi pourrait-on le préférer à l’avion aujourd’hui ?',
  ),
  paras: [
    { lead: true, s: [
      ['Longtemps jugés trop lents et peu rentables, les trains de nuit font leur retour en Europe.', 'Long considered too slow and unprofitable, night trains are making a comeback in Europe.'],
      ['Une petite révolution, portée par un nouveau rapport au voyage.', 'A small revolution, driven by a new relationship with travel.'],
    ] },
    { s: [
      ['Au milieu des années deux mille dix, la plupart des lignes de nuit avaient été supprimées en France.', 'By the mid-2010s, most night lines had been closed in France.'],
      ['Les voyageurs leur préféraient l’avion à bas prix ou le train à grande vitesse, et les voitures-couchettes, souvent anciennes, étaient de moins en moins bien entretenues.', 'Travellers preferred low-cost flights or high-speed trains, and the sleeper cars, often old, were less and less well maintained.'],
      ['Depuis quelques années, pourtant, plusieurs lignes ont été rouvertes, et de nouvelles liaisons vers d’autres pays européens ont été lancées.', 'In recent years, however, several lines have been reopened, and new routes to other European countries have been launched.'],
    ] },
    { s: [
      ['Ce retour s’explique d’abord par la préoccupation écologique.', 'This comeback is explained first of all by environmental concern.'],
      ['Un trajet en train émet beaucoup moins de gaz à effet de serre qu’un vol équivalent, et de nombreux voyageurs, en particulier les jeunes, cherchent à réduire leur empreinte carbone.', 'A train journey emits far fewer greenhouse gases than an equivalent flight, and many travellers, young people in particular, are trying to reduce their carbon footprint.'],
      ['À cela s’ajoute un argument pratique : on part le soir du centre-ville et on arrive le matin à destination, sans perdre une journée ni payer une nuit d’hôtel.', 'Added to this is a practical argument: you leave the city centre in the evening and arrive at your destination in the morning, without losing a day or paying for a hotel night.'],
    ] },
    { s: [
      ['Le succès reste pourtant fragile.', 'Yet this success remains fragile.'],
      ['Faire circuler un train de nuit coûte cher : les voitures doivent être rénovées ou achetées, et chaque voyageur occupe une couchette pendant toute la nuit, alors que, dans la journée, plusieurs passagers pourraient se succéder sur le même siège.', 'Running a night train is expensive: the cars have to be renovated or bought, and each traveller occupies a berth for the whole night, whereas during the day several passengers could use the same seat one after another.'],
      ['Sans le soutien financier des États, la plupart de ces lignes ne seraient pas rentables, et certaines liaisons ont d’ailleurs été suspendues peu de temps après leur lancement.', 'Without financial support from governments, most of these lines would not be profitable, and some routes have in fact been suspended shortly after their launch.'],
    ] },
    { s: [
      ['Le train de nuit ne remplacera donc pas l’avion du jour au lendemain.', 'So the night train will not replace the plane overnight.'],
      ['Mais il rappelle qu’un voyage peut aussi être vécu comme un moment à part entière, et non comme une simple perte de temps entre deux lieux.', 'But it reminds us that a journey can also be experienced as a moment in its own right, and not just as time lost between two places.'],
    ] },
  ],
  glossary: [
    { fr: 'jugés', tr: b('considered, judged', 'considérés') },
    { fr: 'peu rentables', tr: b('unprofitable', 'qui rapportent peu d’argent') },
    { fr: 'un nouveau rapport au voyage', tr: b('a new relationship with travel', 'une nouvelle façon de voir et de vivre le voyage') },
    { fr: 'avaient été supprimées', tr: b('had been closed down (pluperfect passive)', 'n’existaient plus (plus-que-parfait passif)') },
    { fr: 'l’avion à bas prix', tr: b('low-cost flights', 'les compagnies aériennes très bon marché') },
    { fr: 'voitures-couchettes', tr: b('sleeper cars', 'wagons avec des lits pour dormir') },
    { fr: 'entretenues', tr: b('maintained, looked after', 'réparées et nettoyées régulièrement') },
    { fr: 'ont été rouvertes', tr: b('have been reopened', 'fonctionnent à nouveau') },
    { fr: 'liaisons', tr: b('routes, connections', 'lignes entre deux villes') },
    { fr: 'la préoccupation écologique', tr: b('environmental concern', 'l’inquiétude pour l’environnement') },
    { fr: 'gaz à effet de serre', tr: b('greenhouse gases', 'gaz qui réchauffent la planète') },
    { fr: 'empreinte carbone', tr: b('carbon footprint', 'quantité de CO₂ produite par nos activités') },
    { fr: 'À cela s’ajoute', tr: b('added to this is', 'il y a aussi, en plus') },
    { fr: 'fragile', tr: b('fragile, uncertain', 'qui peut facilement disparaître') },
    { fr: 'une couchette', tr: b('a berth (bed in a train)', 'un lit dans un train de nuit') },
    { fr: 'se succéder', tr: b('to follow one another', 'venir l’un après l’autre') },
    { fr: 'le soutien financier', tr: b('financial support', 'l’aide en argent') },
    { fr: 'suspendues', tr: b('suspended', 'arrêtées pour un temps') },
    { fr: 'du jour au lendemain', tr: b('overnight, suddenly', 'très rapidement, d’un coup') },
    { fr: 'à part entière', tr: b('in its own right', 'complet, qui a sa propre valeur') },
  ],
  questions: [
    {
      q: 'Quelle est l’idée principale de l’article ?',
      qEn: 'What is the main idea of the article?',
      options: [
        'Les trains de nuit vont bientôt remplacer l’avion',
        'Les trains de nuit reviennent, mais leur avenir reste fragile',
        'Les trains de nuit ont disparu pour toujours',
        'Les trains de nuit sont réservés aux jeunes',
      ],
      answer: 1,
      evidence: ['les trains de nuit font leur retour en Europe', 'Le succès reste pourtant fragile.'],
      explain: b(
        'The article explains the comeback, then its limits: “le succès reste pourtant fragile”.',
        'L’article explique le retour, puis ses limites : « le succès reste pourtant fragile ».',
      ),
      skill: 'global',
    },
    {
      q: 'Pourquoi beaucoup de lignes de nuit avaient-elles été supprimées ?',
      qEn: 'Why had many night lines been closed?',
      options: [
        'Les voyageurs préféraient l’avion bon marché ou le TGV',
        'Les gares étaient fermées la nuit',
        'Elles polluaient trop',
        'Les États les avaient interdites',
      ],
      answer: 0,
      evidence: 'Les voyageurs leur préféraient l’avion à bas prix ou le train à grande vitesse',
      explain: b(
        'Competition from low-cost flights and high-speed trains, plus old, poorly maintained sleeper cars.',
        'La concurrence de l’avion à bas prix et du train à grande vitesse, et des voitures-couchettes anciennes et mal entretenues.',
      ),
      skill: 'detail',
    },
    {
      q: 'Quel est le premier argument qui explique le retour des trains de nuit ?',
      qEn: 'What is the first argument explaining the comeback of night trains?',
      options: ['Le prix', 'La vitesse', 'L’écologie', 'Le confort'],
      answer: 2,
      evidence: 'Ce retour s’explique d’abord par la préoccupation écologique.',
      explain: b(
        '“D’abord” introduces the first reason: environmental concern. Practicality comes next (“À cela s’ajoute”).',
        '« D’abord » introduit la première raison : la préoccupation écologique. L’argument pratique vient ensuite (« À cela s’ajoute »).',
      ),
      skill: 'detail',
    },
    {
      q: 'Quel avantage pratique l’article mentionne-t-il ?',
      qEn: 'What practical advantage does the article mention?',
      options: [
        'Les billets sont toujours moins chers que l’avion',
        'On voyage la nuit sans perdre une journée ni payer d’hôtel',
        'Les trains de nuit vont plus vite',
        'On peut choisir son siège',
      ],
      answer: 1,
      evidence: 'sans perdre une journée ni payer une nuit d’hôtel',
      explain: b(
        'You travel while you sleep: no day lost, no hotel night to pay.',
        'On voyage pendant qu’on dort : pas de journée perdue, pas de nuit d’hôtel à payer.',
      ),
      skill: 'detail',
    },
    {
      q: 'Pourquoi un train de nuit coûte-t-il plus cher à faire circuler par voyageur ?',
      qEn: 'Why does a night train cost more to run per traveller?',
      options: [
        'Parce que les conducteurs sont mieux payés la nuit',
        'Parce que chaque voyageur occupe une couchette toute la nuit',
        'Parce que l’électricité est plus chère la nuit',
        'Parce que les gares sont plus loin',
      ],
      answer: 1,
      evidence: 'chaque voyageur occupe une couchette pendant toute la nuit',
      explain: b(
        'By day, several passengers can use the same seat one after the other; at night, one berth = one traveller for the whole journey.',
        'Le jour, plusieurs passagers peuvent se succéder sur un même siège ; la nuit, une couchette = un voyageur pour tout le trajet.',
      ),
      skill: 'inference',
    },
    {
      q: 'Que se passerait-il sans l’aide financière des États ?',
      qEn: 'What would happen without financial support from governments?',
      options: [
        'Les billets seraient gratuits',
        'La plupart des lignes ne seraient pas rentables',
        'Les trains iraient plus vite',
        'Il y aurait plus de lignes',
      ],
      answer: 1,
      evidence: 'la plupart de ces lignes ne seraient pas rentables',
      explain: b(
        'Sans + noun followed by the conditional describes a hypothesis: without support, they would not be profitable. Some have already been suspended.',
        'Sans + nom suivi du conditionnel exprime une hypothèse : sans aide, elles ne seraient pas rentables. Certaines ont d’ailleurs déjà été suspendues.',
      ),
      skill: 'detail',
    },
    {
      q: 'Dans la conclusion, que suggère l’auteur ?',
      qEn: 'In the conclusion, what does the author suggest?',
      options: [
        'Qu’il faut interdire l’avion',
        'Qu’un voyage peut avoir une valeur en lui-même',
        'Que le train de nuit est une perte de temps',
        'Que les trains de nuit sont trop chers pour durer',
      ],
      answer: 1,
      evidence: 'un voyage peut aussi être vécu comme un moment à part entière',
      explain: b(
        'The journey is “un moment à part entière”: an experience in itself, not just time lost between two places.',
        'Le trajet est « un moment à part entière » : une expérience en soi, pas seulement du temps perdu entre deux lieux.',
      ),
      skill: 'inference',
    },
  ],
  focus: {
    title: b('The passive voice', 'La voix passive'),
    body: b(
      'The passive puts the result first: __être__ + past participle, which agrees with the subject. Les lignes **ont été rouvertes** (passé composé), **avaient été supprimées** (plus-que-parfait), les voitures **doivent être rénovées** (infinitive). Who does the action is often left out, or introduced by __par__. The press likes the passive when the action matters more than who did it.',
      'Le passif met le résultat en avant : __être__ + participe passé, accordé avec le sujet. Les lignes **ont été rouvertes** (passé composé), **avaient été supprimées** (plus-que-parfait), les voitures **doivent être rénovées** (infinitif). L’auteur de l’action est souvent absent, ou introduit par __par__. La presse aime le passif quand l’action compte plus que celui qui la fait.',
    ),
    examples: [
      { fr: 'Plusieurs lignes ont été rouvertes.', tr: 'Several lines have been reopened.' },
      { fr: 'La plupart des lignes avaient été supprimées.', tr: 'Most lines had been closed.' },
      { fr: 'Les voitures doivent être rénovées.', tr: 'The cars have to be renovated.' },
    ],
  },
};

export default text;
