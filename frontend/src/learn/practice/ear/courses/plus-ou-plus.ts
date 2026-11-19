// C1 · Plus [ply] (no more) or [plys] (more), and tous [tu] or [tus].
import { ear, ex, fill, pick, situation } from '../authoring';

const AMIS = 'Avant, on se voyait tous les week-ends. Maintenant, on ne se voit plus beaucoup : il travaille plus qu’avant, et ses enfants sont tous partis faire leurs études ailleurs.';
const AMIS_SHOW = 'Avant, on se voyait {tous} les week-ends. Maintenant, on ne se voit {plus} beaucoup : il travaille {plus} qu’avant, et ses enfants sont {tous} partis faire leurs études ailleurs.';

export default ear('plus-ou-plus', {
  rule: [
    ['Plus et tous : le s qui change tout', 'Plus and tous: the s that changes everything'],
    [
      '__Plus__ se prononce [ply] dans la négation (__je ne fume plus__, __il n’y a plus de pain__) et [plys] quand il veut dire **davantage**, surtout devant __que__ ou en fin de phrase (__il travaille plus que moi__). Devant une voyelle, on entend [plyz] : __de plus‿en plus__.\n\nMême piège avec __tous__ : [tu] devant un nom (__tous les jours__), [tus] quand il est seul, comme pronom (__ils sont tous venus__ [tus]). Le contexte et ce petit [s] vous disent de quoi on parle.',
      '__Plus__ is pronounced [ply] in negation (__je ne fume plus__, __il n’y a plus de pain__) and [plys] when it means **more**, especially before __que__ or at the end of a sentence (__il travaille plus que moi__). Before a vowel you hear [plyz]: __de plus‿en plus__.\n\nSame trap with __tous__: [tu] before a noun (__tous les jours__), [tus] when it stands alone as a pronoun (__ils sont tous venus__ [tus]). The context and that little [s] tell you what is meant.',
    ],
  ],
  goal: ['Distinguer « plus du tout » de « davantage », et les deux tous.', 'Tell « no more » from « more », and the two tous.'],
  examples: [
    ex('Il ne fume plus.', 'Il ne fume {plus} [ply].', ['Négation : il a arrêté.', 'Negation: he has stopped.']),
    ex('Il travaille plus que moi.', 'Il travaille {plus} [plys] que moi.', ['Comparaison : davantage.', 'Comparison: more.']),
    ex('Ils sont tous là.', 'Ils sont {tous} [tus] là.', ['Pronom : on prononce le s.', 'Pronoun: the s is pronounced.']),
  ],
  items: [
    pick('Il n’y a plus de pain.', ['Il n’y a plus de pain.', 'Il y a plus de pain.'], 0, 'Il {n’}y a {plus} de pain.', [
      'On entend le « n’ » et [ply] : il n’y en a plus du tout.', 'You hear « n’ » and [ply]: there is none left.',
    ]),
    pick('Elle mange plus que lui.', ['Lui', 'Elle'], 1, 'Elle mange {plus} [plys] que lui.', [
      '[plys] devant « que » : elle mange davantage.', '[plys] before « que »: she eats more.',
    ], ['Qui mange davantage ?', 'Who eats more?']),
    pick('Je ne veux plus de dessert.', ['Non, plus du tout', 'Oui, davantage'], 0, 'Je ne veux {plus} [ply] de dessert.', [
      'Le « ne » et [ply] : il n’en veut plus.', '« Ne » and [ply]: he wants no more.',
    ], ['Veut-il du dessert ?', 'Does he want dessert?']),
    pick('Ils sont tous partis.', ['Aucun', 'Quelques-uns', 'Tous'], 2, 'Ils sont {tous} [tus] partis.', [
      '[tus] : tous, sans exception.', '[tus]: all of them.',
    ], ['Combien sont partis ?', 'How many have left?']),
    pick('Il lit plus qu’avant.', ['Il a arrêté de lire', 'Il lit davantage'], 1, 'Il lit {plus} [plys] qu’avant.', [
      '[plys] devant « que » : davantage.', '[plys] before « que »: more.',
    ], ['Lit-il davantage, ou plus du tout ?', 'Does he read more, or not at all?']),
    fill('Ils sont tous d’accord.', 'Ils sont ___ d’accord.', 'tous', 'Ils sont {tous} [tus] d’accord.', [
      'Tous pronom : [tus].', 'Tous as a pronoun: [tus].',
    ]),
    fill('Je ne travaille plus le samedi.', 'Je ne travaille ___ le samedi.', 'plus', 'Je ne travaille {plus} [ply] le samedi.', [
      'Négation : [ply].', 'Negation: [ply].',
    ]),
    fill('C’est de plus en plus cher.', 'C’est de plus en ___ cher.', 'plus', 'C’est de plus‿en {plus} cher.', [
      '[dəplyzɑ̃ply] : la liaison en [z], puis « plus » sans s.', '[dəplyzɑ̃ply]: a [z] liaison, then « plus » without s.',
    ]),
    situation(AMIS, 'Se voient-ils toujours autant ?', ['Oui, tous les week-ends', 'Non, ils se voient moins', 'Oui, plus qu’avant'], 1, AMIS_SHOW, [
      '« On ne se voit plus beaucoup » [ply] : moins qu’avant.', '« We no longer see each other much »: less than before.',
    ]),
    situation(AMIS, 'Que font ses enfants ?', ['Un seul est parti', 'Ils ne font plus d’études', 'Ils sont tous partis étudier ailleurs'], 2, AMIS_SHOW, [
      '« Sont tous partis » [tus] : tous.', '« Sont tous partis » [tus]: all of them.',
    ]),
  ],
  takeaway: [
    'Plus [ply] avec ne = plus du tout ; plus [plys] devant que = davantage. Tous [tu] devant un nom, [tus] quand il est seul.',
    'Plus [ply] with ne = no more; plus [plys] before que = more. Tous [tu] before a noun, [tus] on its own.',
  ],
});
