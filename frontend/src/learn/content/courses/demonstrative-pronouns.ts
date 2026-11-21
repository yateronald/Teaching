import type { CourseAbout } from '../../types';
import { b, card, dict, dlg, gap, lesson, mc, ord, P, pairs, say, sort } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Celui-ci ou celui-là? Celle de ma sœur? Ceux qui veulent participer… Demonstrative pronouns replace a noun to avoid repeating it, and they are essential to compare, to choose and to define. This course teaches celui, celle, ceux, celles with -ci / -là, with de (celle de Marie) and with relative pronouns (ceux qui, celle que, celui dont), then the neutral ce, ceci, cela and ça.',
    'Celui-ci ou celui-là ? Celle de ma sœur ? Ceux qui veulent participer… Les pronoms démonstratifs remplacent un nom pour éviter de le répéter : ils sont indispensables pour comparer, choisir et définir. Ce cours présente celui, celle, ceux, celles avec -ci / -là, avec de (celle de Marie) et avec les relatifs (ceux qui, celle que, celui dont), puis les neutres ce, ceci, cela et ça.',
  ),
  outcomes: [
    b('Use celui, celle, ceux, celles', 'Employer celui, celle, ceux, celles'),
    b('Combine them with -ci / -là and with de', 'Les combiner avec -ci / -là et avec de'),
    b('Combine them with qui, que, dont', 'Les combiner avec qui, que, dont'),
    b('Use ce, ceci, cela and ça', 'Employer ce, ceci, cela et ça'),
  ],
};

const C = 'demonstrative-pronouns';
export default [
  lesson(C, 1, ['celui-ci-celle-la', 'celui-ci-celle-la'],
    b('Celui-ci, celle-là: choosing and comparing', 'Celui-ci, celle-là : choisir et comparer'),
    b('Replace a noun with celui, celle, ceux, celles + -ci or -là.', 'Remplacer un nom par celui, celle, ceux, celles + -ci ou -là.'),
    [b('Choose the right form', 'Choisir la bonne forme'), b('Contrast -ci and -là', 'Opposer -ci et -là'), b('Choose between two products', 'Choisir entre deux produits')],
    13,
    [
      card(b('Four forms', 'Quatre formes'), b('**celui** (m. sing.), **celle** (f. sing.), **ceux** (m. pl.), **celles** (f. pl.). They cannot stand alone: add **-ci / -là**, **de**, or a relative pronoun. **Quel gâteau ? – Celui-ci.**', '**celui** (m. sing.), **celle** (f. sing.), **ceux** (m. pl.), **celles** (f. pl.). Jamais seuls : ajoutez **-ci / -là**, **de** ou un relatif. **Quel gâteau ? – Celui-ci.**'), {
        ex: [['Quelle robe tu préfères ? – Celle-là.', 'Which dress do you prefer? – That one.'], ['Ces chaussures sont jolies, mais celles-ci sont plus confortables.', 'These shoes are pretty, but these ones are more comfortable.']],
      }),
      mc(P.word, ['Celui-ci', 'Celle-ci', 'Ceux-ci', 'Celles-ci'], { fr: 'Quel téléphone voulez-vous ? – ___, le noir.' }),
      mc(P.word, ['celles-là', 'ceux-là', 'celle-là', 'celui-là'], { fr: 'Ces pommes sont trop vertes, prenez plutôt ___.' }),
      sort(b('Which pronoun replaces the noun?', 'Quel pronom remplace le nom ?'), ['celui', 'celle', 'ceux', 'celles'], [['le livre', 0], ['la voiture', 1], ['les gants', 2], ['les clés', 3], ['le quartier', 0], ['les idées', 3]]),
      gap(P.complete, 'Entre ces deux ordinateurs, ___-ci est plus léger, mais ___-là est moins cher.', ['celui', 'celui']),
      dlg(b('Choosing an apartment', 'Choisir un appartement'), undefined, [['Agente', 'f'], ['Vous', 'm']], [
        [0, 'J’ai deux appartements à vous proposer : un 4 ½ au centre et un 5 ½ en banlieue.', 'I have two apartments: a 4½ downtown and a 5½ in the suburbs.'],
        [1, { options: ['Celui du centre m’intéresse. Il est près du métro ?', 'Celle du centre m’intéresse.', 'Ceux du centre m’intéresse.'] }],
        [0, 'Oui, à deux minutes. Mais celui-là est plus petit.', 'Yes, two minutes away. But that one is smaller.'],
        [1, { options: ['Ce n’est pas grave, je préfère celui-là quand même.', 'Ce n’est pas grave, je préfère celle-là.', 'Ce n’est pas grave, je préfère celui.'] }],
      ]),
      say('Ces deux vestes sont belles, mais je vais prendre celle-ci.', 'These two jackets are nice, but I’ll take this one.'),
    ],
    [
      b('celui, celle, ceux, celles replace a noun; never alone.', 'celui, celle, ceux, celles remplacent un nom ; jamais seuls.'),
      b('+ -ci (near) / -là (far, or both in speech).', '+ -ci (proche) / -là (éloigné, ou les deux à l’oral).'),
      b('In Québec, a 4 ½ = a two-bedroom apartment.', 'Au Québec, un 4 ½ = un appartement à deux chambres.'),
    ],
    [['la banlieue', b('the suburbs', 'zone autour d’une ville')], ['léger', b('light', 'qui pèse peu')], ['quand même', b('all the same', 'malgré tout')]],
  ),
  lesson(C, 2, ['celui-de-celui-qui', 'celui-de-celui-qui'],
    b('Celle de Marie, ceux qui…', 'Celle de Marie, ceux qui…'),
    b('Use the demonstrative pronoun with de and with qui, que, dont, où.', 'Employer le pronom démonstratif avec de et avec qui, que, dont, où.'),
    [b('Show possession with celui de', 'Exprimer l’appartenance avec celui de'), b('Define with celui qui / que / dont', 'Définir avec celui qui / que / dont'), b('Make general statements with ceux qui', 'Faire des généralités avec ceux qui')],
    13,
    [
      card(b('Celui de', 'Celui de'), b('**celui / celle de** + noun = the one of: **Ce n’est pas mon manteau, c’est celui de Marc.** **La cuisine française et celle du Québec.**', '**celui / celle de** + nom = l’appartenance : **Ce n’est pas mon manteau, c’est celui de Marc.** **La cuisine française et celle du Québec.**'), {
        ex: [['Mon vélo est cassé, je prends celui de mon frère.', 'My bike is broken, I’ll take my brother’s.']],
      }),
      card(b('Celui qui, que, dont, où', 'Celui qui, que, dont, où'), b('**Ceux qui** veulent venir sont les bienvenus. **Celle que** tu as achetée est parfaite. **Celui dont** je t’ai parlé arrive demain. **Ceux qui** + verb is very common for general statements.', '**Ceux qui** veulent venir sont les bienvenus. **Celle que** tu as achetée est parfaite. **Celui dont** je t’ai parlé arrive demain. **Ceux qui** + verbe sert souvent aux généralités.'), {
        ex: [['Ceux qui le souhaitent peuvent partir plus tôt.', 'Those who wish can leave earlier.'], ['C’est celle que je préfère.', 'It’s the one I prefer.']],
      }),
      mc(P.best, ['Ce n’est pas ma valise, c’est celle de Julie.', 'Ce n’est pas ma valise, c’est celui de Julie.', 'Ce n’est pas ma valise, c’est la de Julie.', 'Ce n’est pas ma valise, c’est celle à Julie de.']),
      mc(P.word, ['dont', 'que', 'qui', 'où'], { fr: 'Ce n’est pas ce livre : celui ___ je t’ai parlé est rouge.' }),
      mc(P.word, ['qui', 'que', 'dont', 'de'], { fr: 'Ceux ___ arrivent en retard doivent attendre la pause.' }),
      gap(P.complete, 'Cette chanson est ___ ___ je préfère.', ['celle', 'que']),
      pairs(P.match, [['ceux qui', b('those who (subject)', 'les personnes qui')], ['celle que', b('the one (that) (object)', 'celle qu’on…')], ['celui dont', b('the one (that) … of / about', 'celui de qui')], ['celle de', b('the one of, …’s', 'celle qui appartient à')]]),
      dict('Ceux qui ont oublié leur badge doivent passer à l’accueil.', { voice: 'm' }),
    ],
    [
      b('celui / celle de + noun = …’s (celle de Julie).', 'celui / celle de + nom = appartenance (celle de Julie).'),
      b('celui qui (subject), celui que (object), celui dont (de), celui où (place / time).', 'celui qui (sujet), celui que (COD), celui dont (de), celui où (lieu / temps).'),
      b('Ceux qui… = general statements about people.', 'Ceux qui… = généralités sur les personnes.'),
    ],
    [['le badge', b('the badge, ID card', 'carte d’accès')], ['l’accueil', b('reception', 'lieu où l’on reçoit')], ['les bienvenus', b('welcome', 'reçus avec plaisir')]],
  ),
  lesson(C, 3, ['ce-ceci-cela-ca', 'ce-ceci-cela-ca'],
    b('Ce, ceci, cela, ça', 'Ce, ceci, cela, ça'),
    b('Use the neutral demonstratives for ideas, situations and unnamed things.', 'Employer les démonstratifs neutres pour les idées, les situations et les choses non nommées.'),
    [b('Use ça in speech and cela in writing', 'Employer ça à l’oral et cela à l’écrit'), b('Use ce qui / ce que', 'Employer ce qui / ce que'), b('Use common expressions with ça', 'Employer les expressions courantes avec ça')],
    13,
    [
      card(b('Neutral: no gender', 'Neutres : sans genre'), b('For an idea or an unnamed thing: **ça** (spoken), **cela** (written), **ceci** (this, what follows). **Ça me plaît. Cela dit, … Retenez ceci : …** And **ce qui / ce que** = what: **Ce qui m’inquiète, c’est le prix.**', 'Pour une idée ou une chose non nommée : **ça** (oral), **cela** (écrit), **ceci** (ce qui suit). **Ça me plaît. Cela dit, … Retenez ceci : …** Et **ce qui / ce que** : **Ce qui m’inquiète, c’est le prix.**'), {
        ex: [['Ça ne fait rien.', 'It doesn’t matter.'], ['Cela dit, je comprends votre point de vue.', 'That said, I understand your point of view.'], ['Ce que je veux, c’est un travail stable.', 'What I want is a stable job.']],
      }),
      pairs(P.match, [['Ça dépend.', b('It depends.', 'cela varie')], ['Ça m’est égal.', b('I don’t mind.', 'je n’ai pas de préférence')], ['Ça vaut la peine.', b('It’s worth it.', 'cela mérite l’effort')], ['Ça tombe bien !', b('That’s good timing!', 'c’est opportun')]]),
      mc(P.best, ['Ce qui me plaît, c’est l’ambiance.', 'Ce que me plaît, c’est l’ambiance.', 'Ça qui me plaît, c’est l’ambiance.', 'Celui qui me plaît, c’est l’ambiance.']),
      mc(P.best, ['Cela dit, le projet reste intéressant.', 'Ça dit, le projet reste intéressant.', 'Celui dit, le projet reste intéressant.', 'Ceci disant, le projet reste intéressant.'], { fr: 'Dans un rapport écrit :' }),
      sort(b('Spoken or written style?', 'Oral ou écrit ?'), [b('spoken', 'oral'), b('written', 'écrit')], [['Ça marche !', 0], ['Cela me semble juste.', 1], ['C’est quoi, ça ?', 0], ['Cela étant, …', 1], ['Ça va pas ?', 0], ['Cela ne change rien.', 1]]),
      gap(P.complete, '___ que je ne comprends pas, c’est pourquoi il est parti. ___ m’étonne beaucoup.', ['Ce', 'Ça']),
      ord(P.order, 'Ce qui compte, c’est de participer.', { tr: 'What matters is taking part.' }),
      say('Ça m’est égal, choisis ce que tu préfères.', 'I don’t mind, choose what you prefer.'),
    ],
    [
      b('ça (spoken) = cela (written); ceci announces what follows.', 'ça (oral) = cela (écrit) ; ceci annonce ce qui suit.'),
      b('ce qui (subject) / ce que (object) = what.', 'ce qui (sujet) / ce que (COD) = la chose qui / que.'),
      b('Ça dépend, ça m’est égal, ça vaut la peine, cela dit.', 'Ça dépend, ça m’est égal, ça vaut la peine, cela dit.'),
    ],
    [['l’ambiance', b('the atmosphere', 'le climat d’un lieu')], ['étonner', b('to surprise', 'surprendre')], ['valoir la peine', b('to be worth it', 'mériter l’effort')]],
  ),
];
