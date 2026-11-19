// A2 · The three nasal vowels: [ɑ̃] an / en, [ɔ̃] on, [ɛ̃] in / ain, and nasal or not (Jean / Jeanne).
import { ear, ex, fill, pick, situation } from '../authoring';

const PIQUE = 'Pour le pique-nique, on prend du pain, du jambon, du melon et un peu de vin blanc.';
const PIQUE_SHOW = 'Pour le pique-nique, on prend du {pain}, du {jambon}, du {melon} et un peu de {vin} {blanc}.';

export default ear('vent-vont-vin', {
  rule: [
    ['Trois voyelles nasales : an, on, in', 'Three nasal vowels: an, on, in'],
    [
      'Le français a trois voyelles nasales, où l’air passe aussi par le nez : **[ɑ̃]** (an, en : __vent__, __temps__, __blanc__), **[ɔ̃]** (on : __vont__, __bon__, __long__) et **[ɛ̃]** (in, ain : __vin__, __pain__, __cinq__). Bouche ouverte pour an, lèvres arrondies pour on, lèvres étirées pour in.\n\nAttention au féminin : __Jean__ [ʒɑ̃] / __Jeanne__ [ʒan], __bon__ / __bonne__. Quand on entend la consonne, la voyelle n’est plus nasale.',
      'French has three nasal vowels, where air also flows through the nose: **[ɑ̃]** (an, en: __vent__, __temps__, __blanc__), **[ɔ̃]** (on: __vont__, __bon__, __long__) and **[ɛ̃]** (in, ain: __vin__, __pain__, __cinq__). Mouth open for an, lips rounded for on, lips spread for in.\n\nWatch the feminine: __Jean__ [ʒɑ̃] / __Jeanne__ [ʒan], __bon__ / __bonne__. When you hear the consonant, the vowel is no longer nasal.',
    ],
  ],
  goal: ['Distinguer an, on et in, et une voyelle nasale d’une voyelle suivie d’un n.', 'Tell an, on and in apart, and a nasal vowel from a vowel followed by n.'],
  examples: [
    ex('Le vent.', 'le {vent} [ɑ̃]', ['Bouche ouverte.', 'Mouth open.']),
    ex('Ils vont.', 'ils {vont} [ɔ̃]', ['Lèvres arrondies.', 'Lips rounded.']),
    ex('Le vin.', 'le {vin} [ɛ̃]', ['Lèvres étirées.', 'Lips spread.']),
  ],
  items: [
    pick('Il y a du vent.', ['Il y a du vent.', 'Il y a du vin.'], 0, 'Il y a du {vent}.', [
      '[ɑ̃], bouche ouverte : le vent. « Le vin » se dit [vɛ̃], lèvres étirées.',
      '[ɑ̃], mouth open: the wind. « Le vin » is [vɛ̃], lips spread.',
    ]),
    pick('Il est blond.', ['Il est blanc.', 'Il est blond.'], 1, 'Il est {blond}.', [
      '[ɔ̃], lèvres arrondies : blond (les cheveux). « Blanc » se dit [blɑ̃].',
      '[ɔ̃], lips rounded: blond (hair). « Blanc » is [blɑ̃].',
    ]),
    pick('C’est lent.', ['C’est long.', 'C’est lent.'], 1, 'C’est {lent}.', [
      '[lɑ̃] : lent, pas rapide. « Long » se dit [lɔ̃].',
      '[lɑ̃]: slow. « Long » is [lɔ̃].',
    ]),
    pick('Il a cent ans.', ['Il a cinq ans.', 'Il a cent ans.'], 1, 'Il a {cent}‿ans.', [
      '[sɑ̃] : cent, 100 ! « Cinq ans » se dirait [sɛ̃kɑ̃], avec un [k].',
      '[sɑ̃]: a hundred! « Cinq ans » would be [sɛ̃kɑ̃], with a [k].',
    ]),
    pick('On attend Jeanne.', ['On attend Jean.', 'On attend Jeanne.'], 1, 'On attend {Jeanne}.', [
      'On entend le [n] final : [ʒan], Jeanne. « Jean » se dit [ʒɑ̃], sans consonne.',
      'You hear the final [n]: [ʒan], Jeanne. « Jean » is [ʒɑ̃], with no consonant.',
    ]),
    fill('Il fait beau, mais il y a beaucoup de vent.', 'Il fait beau, mais il y a beaucoup de ___.', 'vent', 'Il fait beau, mais il y a beaucoup de {vent}.', [
      '[vɑ̃] : le vent. Le contexte (le temps qu’il fait) confirme ce que l’oreille entend.',
      '[vɑ̃]: the wind. The context (the weather) confirms what the ear hears.',
    ]),
    fill('Nous partons à la montagne en janvier.', 'Nous partons à la montagne en ___.', 'janvier', 'Nous part{on}s à la m{on}tagne {en} j{an}vier.', [
      'Quatre nasales dans la phrase : partons [ɔ̃], montagne [ɔ̃], en [ɑ̃], janvier [ɑ̃].',
      'Four nasal vowels in the sentence: partons [ɔ̃], montagne [ɔ̃], en [ɑ̃], janvier [ɑ̃].',
    ]),
    fill('Mon cousin a vingt et un ans.', 'Mon cousin a ___ et un ans.', ['vingt', '20'], 'Mon cous{in} a {vingt} et {un}‿ans.', [
      '[vɛ̃] : vingt. Pour la plupart des Français, « cousin » et « un » ont le même son [ɛ̃].',
      '[vɛ̃]: twenty. For most French speakers, « cousin » and « un » share the same [ɛ̃] sound.',
    ]),
    situation(PIQUE, 'Qu’est-ce qu’on ne prend pas ?', ['Du pain', 'Du thon', 'Du melon'], 1, PIQUE_SHOW, [
      'On entend « jambon », pas « thon » : le [ɔ̃] final de jambon peut tromper, mais le thon n’est pas dans la liste.',
      'You hear « jambon », not « thon »: the final [ɔ̃] of jambon can mislead, but tuna is not on the list.',
    ]),
    situation(PIQUE, 'Quel vin prend-on ?', ['Du vin blanc', 'Du vin rouge', 'Pas de vin'], 0, PIQUE_SHOW, [
      '« Un peu de vin blanc » : [vɛ̃] puis [blɑ̃], deux nasales différentes.',
      '« Un peu de vin blanc »: [vɛ̃] then [blɑ̃], two different nasal vowels.',
    ]),
  ],
  takeaway: [
    'An [ɑ̃] bouche ouverte, on [ɔ̃] lèvres arrondies, in [ɛ̃] lèvres étirées. Et si l’on entend un [n] (Jeanne, bonne), la voyelle n’est plus nasale.',
    'An [ɑ̃] mouth open, on [ɔ̃] lips rounded, in [ɛ̃] lips spread. And when you hear an [n] (Jeanne, bonne), the vowel is no longer nasal.',
  ],
});
