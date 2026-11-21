import type { CourseAbout } from '../../types';
import { b, card, gap, lesson, mc, ord, P, sort, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Logical connectors are the backbone of a good TEF performance: they structure your writing sections, make your speaking arguments clear, and help you follow complex texts in comprehension. This course organises connectors by function (adding, opposing, conceding, explaining, concluding), clarifies the grammar that follows some of them (bien que + subjonctif, malgré + nom) and trains you to use them precisely.',
    'Les connecteurs logiques sont la colonne vertébrale d’une bonne performance au TEF : ils structurent vos productions écrites, clarifient vos arguments à l’oral et vous aident à suivre les textes complexes en compréhension. Ce cours organise les connecteurs par fonction (ajouter, opposer, concéder, expliquer, conclure), précise la grammaire qui suit certains d’entre eux (bien que + subjonctif, malgré + nom) et vous entraîne à les employer avec précision.',
  ),
  outcomes: [
    b('Use connectors by function', 'Employer les connecteurs par fonction'),
    b('Apply the grammar after connectors', 'Appliquer la grammaire après les connecteurs'),
    b('Distinguish opposition and concession', 'Distinguer opposition et concession'),
    b('Structure a text with connectors', 'Structurer un texte avec des connecteurs'),
  ],
};

const C = 'tef-connectors';
export default [
  lesson(C, 1, ['adding-and-explaining', 'ajouter-et-expliquer'],
    b('Adding, explaining, illustrating', 'Ajouter, expliquer, illustrer'),
    b('Use connectors of addition, cause and example correctly.', 'Employer correctement les connecteurs d’addition, de cause et d’exemple.'),
    [b('Add ideas', 'Ajouter des idées'), b('Explain causes', 'Expliquer les causes'), b('Give examples', 'Donner des exemples')],
    13,
    [
      card(b('Three functions', 'Trois fonctions'), b('**Add**: de plus, en outre, par ailleurs, de surcroît, non seulement… mais aussi. **Cause**: car, parce que, puisque, en effet, étant donné que, grâce à (positive) / à cause de (negative) + nom. **Example**: par exemple, notamment, ainsi, à titre d’exemple.', '**Ajouter** : de plus, en outre, par ailleurs, de surcroît, non seulement… mais aussi. **Cause** : car, parce que, puisque, en effet, étant donné que, grâce à (positif) / à cause de (négatif) + nom. **Exemple** : par exemple, notamment, ainsi, à titre d’exemple.')),
      mc(P.choose, ['grâce à', 'à cause de', 'malgré', 'bien que'], { fr: 'Le projet a réussi ___ l’aide des bénévoles.' }),
      mc(P.choose, ['à cause de', 'grâce à', 'pourtant', 'ainsi'], { fr: 'Le vol a été annulé ___ la tempête.' }),
      sort(b('Add, cause or example?', 'Ajouter, cause ou exemple ?'), [b('add', 'ajouter'), b('cause', 'cause'), b('example', 'exemple')], [['en outre', 0], ['étant donné que', 1], ['notamment', 2], ['par ailleurs', 0], ['puisque', 1], ['à titre d’exemple', 2]]),
      gap(P.complete, 'Le télétravail réduit les trajets. ___ outre, il permet une meilleure concentration, ___ les employés sont moins dérangés.', ['En', ['car', 'puisque', 'parce que']]),
    ],
    [
      b('Add: de plus, en outre, par ailleurs, non seulement… mais aussi.', 'Ajouter : de plus, en outre, par ailleurs, non seulement… mais aussi.'),
      b('Cause: car, puisque, étant donné que; grâce à (+) / à cause de (–).', 'Cause : car, puisque, étant donné que ; grâce à (+) / à cause de (–).'),
      b('Example: par exemple, notamment, ainsi.', 'Exemple : par exemple, notamment, ainsi.'),
    ],
    [['étant donné que', b('given that', 'puisque')], ['de surcroît', b('furthermore', 'de plus')], ['une tempête', b('a storm', 'mauvais temps violent')]],
  ),
  lesson(C, 2, ['opposing-and-conceding', 'opposer-et-conceder'],
    b('Opposing and conceding', 'Opposer et concéder'),
    b('Distinguish opposition from concession and apply the right grammar.', 'Distinguer opposition et concession et appliquer la bonne grammaire.'),
    [b('Use opposition connectors', 'Employer les connecteurs d’opposition'), b('Use concession connectors', 'Employer les connecteurs de concession'), b('Apply bien que + subjonctif, malgré + nom', 'Appliquer bien que + subjonctif, malgré + nom')],
    13,
    [
      card(b('Opposition vs concession', 'Opposition et concession'), b('**Opposition** (two contrasting facts): **mais, cependant, en revanche, alors que, tandis que**. **Concession** (a fact that should prevent something, but doesn’t): **bien que / quoique + subjonctif**, **malgré + nom**, **même si + indicatif**, **certes… mais**, **pourtant**. **Bien qu’il pleuve, nous sortons. · Malgré la pluie, nous sortons. · Même s’il pleut, nous sortons.**', '**Opposition** (deux faits qui contrastent) : **mais, cependant, en revanche, alors que, tandis que**. **Concession** (un fait qui devrait empêcher quelque chose, mais ne l’empêche pas) : **bien que / quoique + subjonctif**, **malgré + nom**, **même si + indicatif**, **certes… mais**, **pourtant**. **Bien qu’il pleuve, nous sortons. · Malgré la pluie, nous sortons. · Même s’il pleut, nous sortons.**')),
      mc(P.form, ['Bien qu’il soit fatigué, il continue à travailler.', 'Bien qu’il est fatigué, il continue à travailler.', 'Malgré qu’il est fatigué, il continue.', 'Même s’il soit fatigué, il continue.']),
      mc(P.form, ['Malgré les difficultés, le projet avance.', 'Malgré que les difficultés, le projet avance.', 'Bien que les difficultés, le projet avance.', 'Même si les difficultés, le projet avance.']),
      sort(b('Followed by…', 'Suivi de…'), [b('subjunctive', 'subjonctif'), b('noun', 'nom'), b('indicative', 'indicatif')], [['bien que', 0], ['malgré', 1], ['même si', 2], ['quoique', 0], ['en dépit de', 1], ['alors que', 2]]),
      gap(P.complete, 'Le loyer a augmenté ; ___ , les locataires sont restés. ___ le bruit, ils aiment leur quartier.', [['pourtant', 'cependant', 'néanmoins', 'toutefois'], 'Malgré']),
    ],
    [
      b('Opposition: mais, cependant, en revanche, alors que.', 'Opposition : mais, cependant, en revanche, alors que.'),
      b('Concession: bien que + subj., malgré + nom, même si + ind., pourtant.', 'Concession : bien que + subj., malgré + nom, même si + ind., pourtant.'),
      b('Never « malgré que » in careful writing.', 'Jamais « malgré que » à l’écrit soigné.'),
    ],
    [['en dépit de', b('despite', 'malgré')], ['un locataire', b('a tenant', 'qui loue')], ['avancer', b('to progress', 'progresser')]],
  ),
  lesson(C, 3, ['concluding-and-structuring', 'conclure-et-structurer'],
    b('Concluding and structuring a whole text', 'Conclure et structurer un texte entier'),
    b('Use consequence and conclusion connectors and structure a full paragraph.', 'Employer les connecteurs de conséquence et de conclusion et structurer un paragraphe complet.'),
    [b('Express consequence', 'Exprimer la conséquence'), b('Conclude', 'Conclure'), b('Structure a full paragraph', 'Structurer un paragraphe complet')],
    13,
    [
      card(b('Consequence and conclusion', 'Conséquence et conclusion'), b('**Consequence**: donc, ainsi, c’est pourquoi, par conséquent, si bien que, de sorte que. **Conclusion**: en somme, en conclusion, pour conclure, en définitive, finalement. **Structure**: d’abord / tout d’abord → ensuite → de plus → enfin → en somme.', '**Conséquence** : donc, ainsi, c’est pourquoi, par conséquent, si bien que, de sorte que. **Conclusion** : en somme, en conclusion, pour conclure, en définitive, finalement. **Structure** : d’abord / tout d’abord → ensuite → de plus → enfin → en somme.')),
      ord(P.order, 'Les transports sont gratuits, si bien que de plus en plus d’habitants laissent leur voiture.', { tr: 'Public transport is free, so more and more residents leave their cars.' }),
      sort(b('Consequence or conclusion?', 'Conséquence ou conclusion ?'), [b('consequence', 'conséquence'), b('conclusion', 'conclusion')], [['par conséquent', 0], ['en somme', 1], ['si bien que', 0], ['en définitive', 1], ['c’est pourquoi', 0], ['pour conclure', 1]]),
      write(b('A connected paragraph', 'Un paragraphe articulé'), b('Write a paragraph (70–110 words) on « Faut-il rendre les transports en commun gratuits ? » using at least six connectors from three different functions.', 'Rédigez un paragraphe (70–110 mots) sur « Faut-il rendre les transports en commun gratuits ? » avec au moins six connecteurs de trois fonctions différentes.'), 70, 110, [
        b('Six connectors', 'Six connecteurs'),
        b('Three different functions', 'Trois fonctions différentes'),
        b('A conclusion', 'Une conclusion'),
      ], 'Rendre les transports en commun gratuits présente plusieurs avantages. Tout d’abord, cette mesure aide les ménages modestes, puisque le coût des déplacements pèse lourd dans leur budget. De plus, elle encourage les automobilistes à laisser leur voiture, si bien que la pollution diminue. Certes, la gratuité a un coût pour la collectivité ; cependant, plusieurs villes, notamment en Europe, montrent qu’elle peut être financée. En somme, je suis favorable à cette mesure, à condition qu’elle s’accompagne d’une amélioration du service.'),
    ],
    [
      b('Consequence: donc, c’est pourquoi, par conséquent, si bien que.', 'Conséquence : donc, c’est pourquoi, par conséquent, si bien que.'),
      b('Conclusion: en somme, en définitive, pour conclure.', 'Conclusion : en somme, en définitive, pour conclure.'),
      b('Aim for varied functions, not just « et » and « mais ».', 'Visez des fonctions variées, pas seulement « et » et « mais ».'),
    ],
    [['un ménage', b('a household', 'famille, foyer')], ['peser lourd', b('to weigh heavily', 'coûter beaucoup')], ['s’accompagner de', b('to come with', 'aller avec')]],
  ),
];
