import type { CourseAbout } from '../../types';
import { b, card, doc, exam, gap, lesson, mc, ord, P, sort, tip, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'The second part of the DALF C1 written test is an argumentative essay (essai argumenté) of about 250 words, on the same theme as the synthesis, in a given form: an article, an editorial, a formal letter or a speech. Here, your opinion is expected, supported by structured arguments, nuance and precise language. This course trains the C1 essay: understanding the angle of the instruction, building a nuanced argument, and writing with sophisticated connectors and style.',
    'La seconde partie de l’épreuve écrite du DALF C1 est un essai argumenté d’environ 250 mots, sur le même thème que la synthèse, sous une forme imposée : article, éditorial, lettre formelle ou discours. Ici, votre opinion est attendue, appuyée sur des arguments structurés, de la nuance et une langue précise. Ce cours entraîne l’essai du C1 : comprendre l’angle de la consigne, construire une argumentation nuancée et écrire avec des connecteurs et un style recherchés.',
  ),
  outcomes: [
    b('Understand the angle and form of the instruction', 'Comprendre l’angle et la forme de la consigne'),
    b('Build a nuanced argument', 'Construire une argumentation nuancée'),
    b('Use C1 connectors and style', 'Employer connecteurs et style du C1'),
    b('Write a complete 250-word essay', 'Rédiger un essai complet de 250 mots'),
  ],
};

const C = 'dalf-c1-essay';
export default [
  lesson(C, 1, ['the-instruction', 'la-consigne'],
    b('Reading the instruction', 'Lire la consigne'),
    b('Identify the form, the reader and the precise question to answer.', 'Identifier la forme, le destinataire et la question précise à traiter.'),
    [b('Identify the form', 'Identifier la forme'), b('Identify the angle', 'Identifier l’angle'), b('Choose a position', 'Choisir une position')],
    13,
    [
      exam(b('The argumentative essay', 'L’essai argumenté'), b('About **250 words**, written after the synthesis (total test **2 h 30**). Same theme, but a **precise angle** and a **given form**: **article** for a magazine, **éditorial**, **lettre** to a newspaper or an official, **contribution** to a forum, **discours**. Unlike the synthesis, you **take a stand**. Respect the **form codes** (title for an article, formulas for a letter).', 'Environ **250 mots**, rédigé après la synthèse (épreuve totale de **2 h 30**). Même thème, mais un **angle précis** et une **forme imposée** : **article** pour un magazine, **éditorial**, **lettre** à un journal ou à un responsable, **contribution** à un forum, **discours**. Contrairement à la synthèse, vous **prenez position**. Respectez les **codes de la forme** (titre pour un article, formules pour une lettre).')),
      doc({ look: 'page', title: b('Instruction', 'Consigne'), text: 'Votre entreprise envisage de généraliser le télétravail à quatre jours par semaine. Vous rédigez, pour le journal interne, un article dans lequel vous exprimez votre point de vue sur ce projet, en vous appuyant sur des arguments précis. (250 mots environ)' }, b('What is the precise angle?', 'Quel est l’angle précis ?'), [b('Is four-day remote work a good idea for this company?', 'Le télétravail quatre jours par semaine est-il une bonne idée pour cette entreprise ?'), b('The history of remote work', 'L’histoire du télétravail'), b('A neutral summary of documents', 'Un résumé neutre de documents'), b('A letter to a friend', 'Une lettre à un ami')]),
      sort(b('Synthesis or essay?', 'Synthèse ou essai ?'), [b('synthesis', 'synthèse'), b('essay', 'essai')], [['neutre, sans opinion', 0], ['prise de position', 1], ['uniquement les idées des documents', 0], ['exemples personnels possibles', 1], ['environ 220 mots', 0], ['forme imposée (article, lettre…)', 1]]),
      mc(P.best, [b('A clear but nuanced position: favourable, with conditions', 'Une position claire mais nuancée : favorable, sous conditions'), b('No position, to stay neutral', 'Aucune position, pour rester neutre'), b('Two opposite positions without choosing', 'Deux positions opposées sans choisir'), b('A position unrelated to the question', 'Une position sans rapport avec la question')], { fr: 'Quelle position est la plus efficace pour un essai de C1 ?' }),
      tip(b('A nuanced thesis', 'Une thèse nuancée'), b('At C1, the best essays defend **a clear thesis with conditions**: « favorable, à condition que… » or « opposé, sauf si… ». Pure enthusiasm or pure rejection sounds less mature.', 'Au C1, les meilleurs essais défendent **une thèse claire avec des conditions** : « favorable, à condition que… » ou « opposé, sauf si… ». L’enthousiasme pur ou le rejet total paraissent moins mûrs.')),
    ],
    [
      b('About 250 words; given form; personal position.', 'Environ 250 mots ; forme imposée ; position personnelle.'),
      b('Identify form, reader, angle.', 'Identifiez forme, destinataire, angle.'),
      b('Prefer a clear thesis with conditions.', 'Préférez une thèse claire avec des conditions.'),
    ],
    [['généraliser', b('to extend to all', 'appliquer à tous')], ['le journal interne', b('the company newsletter', 'journal de l’entreprise')], ['une thèse', b('a thesis, a position', 'idée défendue')]],
  ),
  lesson(C, 2, ['nuanced-argument', 'l-argumentation-nuancee'],
    b('A nuanced argument', 'Une argumentation nuancée'),
    b('Build a dialectical or progressive plan and enrich it with C1 connectors.', 'Construire un plan dialectique ou progressif et l’enrichir de connecteurs C1.'),
    [b('Choose a plan type', 'Choisir un type de plan'), b('Use C1 connectors', 'Employer les connecteurs C1'), b('Integrate a counter-argument', 'Intégrer un contre-argument')],
    13,
    [
      card(b('Plans and connectors', 'Plans et connecteurs'), b('**Dialectical**: thèse / antithèse / position nuancée. **Progressive**: argument 1 → stronger argument 2 → conditions. C1 connectors: **Force est de constater que · Il n’en demeure pas moins que · Loin de… · Dès lors · Aussi + inversion (Aussi convient-il de…) · À cet égard · Quand bien même + conditionnel**.', '**Dialectique** : thèse / antithèse / position nuancée. **Progressif** : argument 1 → argument 2 plus fort → conditions. Connecteurs C1 : **Force est de constater que · Il n’en demeure pas moins que · Loin de… · Dès lors · Aussi + inversion (Aussi convient-il de…) · À cet égard · Quand bien même + conditionnel**.')),
      sort(b('Function of the connector', 'Fonction du connecteur'), [b('concession / opposition', 'concession / opposition'), b('consequence', 'conséquence'), b('emphasis / observation', 'insistance / constat')], [['Il n’en demeure pas moins que', 0], ['Dès lors', 1], ['Force est de constater que', 2], ['Quand bien même', 0], ['Aussi convient-il de', 1], ['À cet égard', 2]]),
      mc(P.form, ['Aussi convient-il de fixer des règles claires.', 'Aussi il convient de fixer des règles claires.', 'Aussi convient il de fixer des règles claires.', 'Aussi conviendrait-ils de fixer des règles claires.'], { explain: b('« Aussi » at the start of a sentence (= therefore) triggers inversion in formal writing.', '« Aussi » en tête de phrase (= c’est pourquoi) entraîne l’inversion à l’écrit soutenu.') }),
      gap(P.complete, 'Le télétravail réduit la fatigue. Il n’en ___ pas moins qu’il isole certains salariés. ___ convient-il de garder des jours de présence.', ['demeure', 'Aussi']),
      ord(P.order, 'Quand bien même la productivité augmenterait, le lien social en souffrirait.', { tr: 'Even if productivity increased, social ties would suffer.' }),
    ],
    [
      b('Plans: dialectical or progressive, ending with a nuanced position.', 'Plans : dialectique ou progressif, avec une position nuancée.'),
      b('C1 connectors: force est de constater, il n’en demeure pas moins, dès lors.', 'Connecteurs C1 : force est de constater, il n’en demeure pas moins, dès lors.'),
      b('Aussi + inversion; quand bien même + conditionnel.', 'Aussi + inversion ; quand bien même + conditionnel.'),
    ],
    [['à cet égard', b('in this respect', 'sur ce point')], ['dès lors', b('therefore, from then on', 'par conséquent')], ['souffrir de', b('to suffer from', 'être affecté par')]],
  ),
  lesson(C, 3, ['writing-the-essay', 'rediger-l-essai'],
    b('Writing the essay', 'Rédiger l’essai'),
    b('Write a complete 250-word article respecting the form and the angle.', 'Rédiger un article complet de 250 mots en respectant la forme et l’angle.'),
    [b('Write a catchy title and introduction', 'Rédiger un titre et une introduction accrocheurs'), b('Develop arguments with examples', 'Développer des arguments avec exemples'), b('Conclude with a proposal', 'Conclure par une proposition')],
    13,
    [
      card(b('Article codes', 'Les codes de l’article'), b('**Title** (catchy, sometimes a question). **Introduction**: context + question + your position. **Body**: 2–3 paragraphs, each with a topic sentence, an argument, an example. **Conclusion**: answer + **proposal** or **opening**. Style: varied sentences, precise vocabulary, no « je pense que » repeated every line.', '**Titre** (accrocheur, parfois une question). **Introduction** : contexte + question + votre position. **Développement** : 2 ou 3 paragraphes, chacun avec une idée directrice, un argument, un exemple. **Conclusion** : réponse + **proposition** ou **ouverture**. Style : phrases variées, vocabulaire précis, pas de « je pense que » à chaque ligne.')),
      write(b('Your essay', 'Votre essai'), b('Write the article for the company newsletter (about 230–280 words) on four-day remote work: title, introduction with your position, two or three argued paragraphs, conclusion with a proposal.', 'Rédigez l’article pour le journal interne (environ 230–280 mots) sur le télétravail quatre jours par semaine : titre, introduction avec votre position, deux ou trois paragraphes argumentés, conclusion avec une proposition.'), 220, 300, [
        b('Title and clear position', 'Titre et position claire'),
        b('Arguments with examples and a counter-argument', 'Arguments avec exemples et un contre-argument'),
        b('Conclusion with a concrete proposal', 'Conclusion avec une proposition concrète'),
      ], 'Télétravail : oui, mais pas à n’importe quel prix\n\nNotre direction envisage de généraliser le télétravail à quatre jours par semaine. Si cette évolution répond à une attente réelle des équipes, elle mérite d’être encadrée pour ne pas se retourner contre nous.\n\nForce est de constater, d’abord, que le télétravail a fait ses preuves. Moins de trajets, c’est moins de fatigue et davantage de temps pour la vie personnelle ; nombre d’entre nous se disent plus concentrés chez eux, loin des interruptions de l’open space. À cet égard, refuser toute évolution serait un contresens.\n\nIl n’en demeure pas moins que quatre jours à distance risquent de distendre les liens qui font la force d’une équipe. Les échanges informels, l’entraide spontanée, l’accueil des nouveaux arrivants supposent une présence régulière. Les plus jeunes, qui apprennent leur métier au contact des plus expérimentés, en seraient les premiers pénalisés.\n\nAussi convient-il de chercher un équilibre. Plutôt qu’une règle uniforme, je propose trois jours de télétravail au maximum, avec deux jours de présence communs à chaque équipe, consacrés aux réunions et aux projets collectifs. Un bilan après six mois permettrait d’ajuster le dispositif. Il conviendrait enfin d’associer les représentants du personnel à cette évaluation, afin que les règles retenues soient comprises et acceptées par tous, et non perçues comme imposées d’en haut.\n\nLe télétravail peut être une chance, à condition de ne pas oublier que travailler ensemble, c’est aussi se rencontrer.'),
      tip(b('Final check', 'Vérification finale'), b('Check the **form** (title for an article), the **angle** (this company, four days), the **length** (about 250), **one clear position**, and **C1 language** (connectors, subjunctive, inversion, precise vocabulary).', 'Vérifiez la **forme** (titre pour un article), l’**angle** (cette entreprise, quatre jours), la **longueur** (environ 250), **une position claire**, et une **langue de C1** (connecteurs, subjonctif, inversion, vocabulaire précis).')),
      mc(P.best, ['Télétravail : oui, mais pas à n’importe quel prix', 'Article', 'Mon avis sur le télétravail', 'Le télétravail, c’est bien'], { fr: 'Quel titre est le plus efficace pour l’article ?' }),
    ],
    [
      b('Title, introduction with position, 2–3 paragraphs, conclusion with proposal.', 'Titre, introduction avec position, 2 ou 3 paragraphes, conclusion avec proposition.'),
      b('Integrate a counter-argument (il n’en demeure pas moins…).', 'Intégrez un contre-argument (il n’en demeure pas moins…).'),
      b('Check form, angle, length and C1 language.', 'Vérifiez forme, angle, longueur et langue de C1.'),
    ],
    [['encadrer', b('to regulate, frame', 'fixer des règles')], ['un contresens', b('a misinterpretation, a mistake', 'erreur de sens')], ['distendre', b('to loosen, stretch', 'relâcher')]],
  ),
];
