import type { CourseAbout } from '../../types';
import { b, card, dict, hear, lesson, P, pairs, sort, tip, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'At university, in a professional conference or a TED-style talk, the speaker builds an argument over several minutes with an announced plan, transitions, examples and a conclusion. This course trains you to use the speaker’s signposts to anticipate the structure, to take efficient notes with abbreviations and symbols, and to reconstruct the outline of a talk from your notes.',
    'À l’université, dans une conférence professionnelle ou un exposé de type TED, l’orateur construit un raisonnement sur plusieurs minutes avec un plan annoncé, des transitions, des exemples et une conclusion. Ce cours vous entraîne à utiliser les balises de l’orateur pour anticiper la structure, à prendre des notes efficaces avec abréviations et symboles, et à reconstituer le plan d’un exposé à partir de vos notes.',
  ),
  outcomes: [
    b('Recognise the announced plan and transitions', 'Reconnaître le plan annoncé et les transitions'),
    b('Distinguish main ideas and examples', 'Distinguer idées principales et exemples'),
    b('Take notes with abbreviations and symbols', 'Prendre des notes avec abréviations et symboles'),
    b('Reconstruct the outline of a talk', 'Reconstituer le plan d’un exposé'),
  ],
};

const C = 'l-lectures';
export default [
  lesson(C, 1, ['signposts', 'les-balises-de-l-orateur'],
    b('The speaker’s signposts', 'Les balises de l’orateur'),
    b('Use the announced plan and transitions to follow a talk.', 'Utiliser le plan annoncé et les transitions pour suivre un exposé.'),
    [b('Recognise the plan announcement', 'Reconnaître l’annonce du plan'), b('Recognise transitions', 'Reconnaître les transitions'), b('Recognise the conclusion', 'Reconnaître la conclusion')],
    13,
    [
      card(b('Signposts', 'Les balises'), b('Plan: **Je commencerai par…, puis j’aborderai…, enfin je conclurai sur…** Transitions: **Passons maintenant à…, J’en viens à mon deuxième point…, Après avoir vu…, examinons…** Conclusion: **Pour conclure…, En somme…, Retenons que…**', 'Plan : **Je commencerai par…, puis j’aborderai…, enfin je conclurai sur…** Transitions : **Passons maintenant à…, J’en viens à mon deuxième point…, Après avoir vu…, examinons…** Conclusion : **Pour conclure…, En somme…, Retenons que…**')),
      hear('Je commencerai par définir ce qu’est l’économie circulaire, puis j’en présenterai trois exemples québécois, avant de m’interroger sur ses limites.', b('How many parts does the talk have?', 'Combien de parties compte l’exposé ?'), [b('Three: definition, examples, limits', 'Trois : définition, exemples, limites'), b('Two', 'Deux'), b('One', 'Une'), b('Four', 'Quatre')]),
      hear('Après avoir défini la notion, j’en viens maintenant à des exemples concrets.', b('Where are we in the talk?', 'Où en est l’exposé ?'), [b('Moving from the definition to examples', 'Passage de la définition aux exemples'), b('At the conclusion', 'À la conclusion'), b('At the very beginning', 'Au tout début'), b('In the questions', 'Aux questions')]),
      hear('En somme, retenons que l’économie circulaire n’est pas une solution miracle, mais un changement de logique.', b('What is the conclusion?', 'Quelle est la conclusion ?'), [b('It is not a miracle solution, but a change of logic', 'Ce n’est pas une solution miracle, mais un changement de logique'), b('It solves everything', 'Elle résout tout'), b('It is useless', 'Elle est inutile'), b('It is too expensive', 'Elle coûte trop cher')]),
      sort(b('Plan, transition or conclusion?', 'Plan, transition ou conclusion ?'), [b('plan', 'plan'), b('transition', 'transition'), b('conclusion', 'conclusion')], [['Je commencerai par…', 0], ['Passons maintenant à…', 1], ['En somme…', 2], ['puis j’aborderai…', 0], ['J’en viens à…', 1], ['Retenons que…', 2]], { listen: true }),
      pairs(P.match, [['aborder', b('to tackle, address', 'traiter')], ['j’en viens à', b('I now come to', 'je passe à')], ['en somme', b('in short', 'en résumé')], ['une solution miracle', b('a miracle cure, silver bullet', 'remède universel')]]),
      dict('Je commencerai par définir la notion, puis j’en présenterai trois exemples.', { voice: 'm' }),
    ],
    [
      b('Plan: Je commencerai par…, puis…, enfin…', 'Plan : Je commencerai par…, puis…, enfin…'),
      b('Transition: Passons à…, J’en viens à…, Après avoir vu…', 'Transition : Passons à…, J’en viens à…, Après avoir vu…'),
      b('Conclusion: En somme, Pour conclure, Retenons que…', 'Conclusion : En somme, Pour conclure, Retenons que…'),
    ],
    [['l’économie circulaire', b('the circular economy', 'modèle de réutilisation')], ['une notion', b('a concept', 'idée')], ['s’interroger sur', b('to question', 'se poser des questions sur')]],
  ),
  lesson(C, 2, ['main-ideas-and-examples', 'idees-et-exemples'],
    b('Main ideas and examples', 'Idées principales et exemples'),
    b('Separate the main idea from illustrations, figures and digressions.', 'Séparer l’idée principale des illustrations, chiffres et digressions.'),
    [b('Recognise example markers', 'Reconnaître les marqueurs d’exemple'), b('Recognise digressions', 'Reconnaître les digressions'), b('Keep the main idea', 'Garder l’idée principale')],
    13,
    [
      tip(b('Main idea or example?', 'Idée ou exemple ?'), b('Examples: **par exemple, prenons le cas de, c’est le cas de, ainsi**. Digressions: **soit dit en passant, d’ailleurs, je fais une parenthèse**. Return to the main idea: **pour revenir à notre sujet, bref**.', 'Exemples : **par exemple, prenons le cas de, c’est le cas de, ainsi**. Digressions : **soit dit en passant, d’ailleurs, je fais une parenthèse**. Retour à l’idée : **pour revenir à notre sujet, bref**.')),
      hear('Prenons le cas d’une entreprise de Laval qui récupère les palettes de bois usagées pour fabriquer des meubles.', b('What is this?', 'De quoi s’agit-il ?'), [b('An example illustrating the idea', 'Un exemple qui illustre l’idée'), b('The main thesis', 'La thèse principale'), b('The conclusion', 'La conclusion'), b('A digression', 'Une digression')]),
      hear('Je fais une petite parenthèse : j’ai moi-même acheté une de ces tables, elle est magnifique. Bref, pour revenir à notre sujet…', b('What is the speaker doing?', 'Que fait l’orateur ?'), [b('Making a personal digression, then returning to the topic', 'Il fait une digression personnelle, puis revient au sujet'), b('Giving the main idea', 'Il donne l’idée principale'), b('Concluding', 'Il conclut'), b('Answering a question', 'Il répond à une question')]),
      hear('L’idée centrale est la suivante : un déchet n’est qu’une ressource mal placée.', b('What is the main idea?', 'Quelle est l’idée principale ?'), [b('Waste is a misplaced resource', 'Un déchet est une ressource mal placée'), b('Waste must be burned', 'Les déchets doivent être brûlés'), b('Furniture is expensive', 'Les meubles coûtent cher'), b('Laval is a big city', 'Laval est une grande ville')]),
      sort(b('Main idea, example or digression?', 'Idée, exemple ou digression ?'), [b('main idea', 'idée principale'), b('example', 'exemple'), b('digression', 'digression')], [['L’idée centrale est…', 0], ['Prenons le cas de…', 1], ['Je fais une parenthèse…', 2], ['Retenons que…', 0], ['C’est le cas de…', 1], ['Soit dit en passant…', 2]]),
      pairs(P.match, [['prenons le cas de', b('take the case of', 'considérons l’exemple de')], ['soit dit en passant', b('incidentally', 'en passant')], ['une palette', b('a pallet', 'support de bois')], ['usagé', b('used, worn', 'déjà utilisé')]]),
      dict('L’idée centrale est la suivante : un déchet n’est qu’une ressource mal placée.', { voice: 'f' }),
    ],
    [
      b('Examples: par exemple, prenons le cas de, ainsi.', 'Exemples : par exemple, prenons le cas de, ainsi.'),
      b('Digressions: je fais une parenthèse, soit dit en passant.', 'Digressions : je fais une parenthèse, soit dit en passant.'),
      b('Main idea: L’idée centrale est…, Retenons que…', 'Idée principale : L’idée centrale est…, Retenons que…'),
    ],
    [['un déchet', b('a piece of waste', 'reste inutilisé')], ['une ressource', b('a resource', 'richesse utilisable')], ['récupérer', b('to recover, reclaim', 'récupérer pour réutiliser')]],
  ),
  lesson(C, 3, ['note-taking', 'la-prise-de-notes'],
    b('Efficient note-taking', 'La prise de notes efficace'),
    b('Use abbreviations and symbols, then rebuild the outline of a talk.', 'Utiliser abréviations et symboles, puis reconstituer le plan d’un exposé.'),
    [b('Use standard abbreviations', 'Employer les abréviations usuelles'), b('Use logical symbols', 'Employer les symboles logiques'), b('Rebuild the outline', 'Reconstituer le plan')],
    13,
    [
      card(b('Abbreviations and symbols', 'Abréviations et symboles'), b('**pcq** (parce que), **qd** (quand), **ds** (dans), **tt** (tout), **gvt** (gouvernement), **dvlpt** (développement), **ex.** (exemple). Symbols: **→** (entraîne), **≠** (différent de), **+ / –** (plus / moins), **↑ / ↓** (hausse / baisse), **∴** (donc).', '**pcq** (parce que), **qd** (quand), **ds** (dans), **tt** (tout), **gvt** (gouvernement), **dvlpt** (développement), **ex.** (exemple). Symboles : **→** (entraîne), **≠**, **+ / –**, **↑ / ↓** (hausse / baisse), **∴** (donc).')),
      pairs(b('Match each abbreviation with its meaning.', 'Associez chaque abréviation à son sens.'), [['parce que', 'pcq'], ['gouvernement', 'gvt'], ['développement', 'dvlpt'], ['quand', 'qd']]),
      hear('La consommation de plastique a augmenté de trente pour cent, ce qui entraîne une hausse importante des déchets dans les océans.', b('Which note is best?', 'Quelle note est la meilleure ?'), ['conso plastique ↑ 30 % → déchets océans ↑', 'plastique ↓ 30 %', 'océans ≠ déchets', 'conso → ↓ océans']),
      hear('Contrairement à ce qu’on pense, recycler ne suffit pas : il faut d’abord réduire.', b('Which note is best?', 'Quelle note est la meilleure ?'), ['recycler ≠ suffisant → 1° réduire', 'recycler = suffisant', 'réduire ↓ recycler', 'tt recycler'], { explain: b('≠ marks the contrast, 1° the priority.', '≠ marque l’opposition, 1° la priorité.') }),
      tip(b('Write ideas, not sentences', 'Notez des idées, pas des phrases'), b('Write **key words**, use **symbols** for logic, leave **space** for each part of the plan, and **rewrite** your notes right after the talk while you still remember.', 'Notez des **mots clés**, utilisez des **symboles** pour la logique, laissez de l’**espace** pour chaque partie du plan, et **réécrivez** vos notes juste après l’exposé, tant que vous vous souvenez.')),
      write(b('Rebuild the outline.', 'Reconstituez le plan.'), b('From these notes, write the outline of the talk in full sentences: « Éco. circulaire : 1) déf. : déchet = ressource mal placée ; 2) ex. : palettes → meubles (Laval) ; 3) limites : ≠ miracle, 1° réduire ; concl. : chgt de logique ».', 'À partir de ces notes, rédigez le plan de l’exposé en phrases complètes : « Éco. circulaire : 1) déf. : déchet = ressource mal placée ; 2) ex. : palettes → meubles (Laval) ; 3) limites : ≠ miracle, 1° réduire ; concl. : chgt de logique ».'), 50, 90,
        [b('Three parts in order', 'Trois parties dans l’ordre'), b('The definition and the example', 'La définition et l’exemple'), b('The limits', 'Les limites'), b('The conclusion', 'La conclusion')],
        'L’exposé porte sur l’économie circulaire. D’abord, l’orateur la définit : un déchet n’est qu’une ressource mal placée. Ensuite, il présente l’exemple d’une entreprise de Laval qui transforme des palettes usagées en meubles. Enfin, il en souligne les limites : ce n’est pas une solution miracle, et il faut avant tout réduire notre consommation. Il conclut qu’il s’agit surtout d’un changement de logique.',
        { phrases: ['L’exposé porte sur…', 'D’abord…', 'Ensuite…', 'Enfin…', 'Il conclut que…'] }),
    ],
    [
      b('Abbreviations: pcq, qd, ds, tt, gvt, dvlpt, ex.', 'Abréviations : pcq, qd, ds, tt, gvt, dvlpt, ex.'),
      b('Symbols: → ≠ ↑ ↓ ∴ + –', 'Symboles : → ≠ ↑ ↓ ∴ + –'),
      b('Note key words; rewrite your notes right after.', 'Notez les mots clés ; réécrivez vos notes juste après.'),
    ],
    [['la consommation', b('consumption', 'fait de consommer')], ['entraîner', b('to lead to, cause', 'provoquer')], ['réduire', b('to reduce', 'diminuer')]],
  ),
];
