// A1 · Hearing gender: the final consonant that comes back (petit / petite), and the article when nothing changes (ami / amie).
import { ear, ex, fill, pick, situation } from '../authoring';

export default ear('masculin-ou-feminin', {
  rule: [
    ['Masculin ou féminin : ce que l’oreille entend', 'Masculine or feminine: what the ear hears'],
    [
      'À l’écrit, le féminin ajoute souvent un **e** ; à l’oral, on l’entend parfois, parfois non. On l’**entend** quand une consonne finale réapparaît : __petit__ [pəti] / __petite__ [pətit], __grand__ / __grande__, __content__ / __contente__, __voisin__ [vwazɛ̃] / __voisine__ [vwazin].\n\nOn ne l’**entend pas** avec __joli__ / __jolie__ ou __ami__ / __amie__ : il faut alors écouter l’article (__un__ / __une__, __mon__ / __ma__) ou le pronom (__il__ / __elle__).',
      'In writing, the feminine often adds an **e**; in speech, you sometimes hear it and sometimes not. You **hear** it when a final consonant comes back: __petit__ [pəti] / __petite__ [pətit], __grand__ / __grande__, __content__ / __contente__, __voisin__ [vwazɛ̃] / __voisine__ [vwazin].\n\nYou do **not** hear it with __joli__ / __jolie__ or __ami__ / __amie__: then listen to the article (__un__ / __une__, __mon__ / __ma__) or the pronoun (__il__ / __elle__).',
    ],
  ],
  goal: ['Entendre si l’on parle d’un homme ou d’une femme.', 'Hear whether a man or a woman is meant.'],
  examples: [
    ex('Il est petit.', 'Il est peti~t~.', ['Masculin : le t final est muet.', 'Masculine: the final t is silent.']),
    ex('Elle est petite.', 'Elle est peti{t}e.', ['Féminin : on entend le [t].', 'Feminine: you hear the [t].']),
    ex('Un ami, une amie.', '{un}‿ami, {une}‿amie', ['Ami et amie se prononcent pareil : seul l’article change.', 'Ami and amie sound the same: only the article changes.']),
  ],
  items: [
    pick('Elle est très contente.', ['Il est très content.', 'Elle est très contente.'], 1, '{Elle} est très conten{t}e.', [
      '« Elle » et le [t] final de « contente » : deux indices du féminin.',
      '« Elle » and the final [t] of « contente »: two clues of the feminine.',
    ]),
    pick('C’est mon voisin.', ['C’est mon voisin.', 'C’est ma voisine.'], 0, 'C’est {mon} {voisin}.', [
      '[vwazɛ̃], une voyelle nasale : voisin. « Voisine » se dit [vwazin], avec un [n].',
      '[vwazɛ̃], a nasal vowel: voisin. « Voisine » is [vwazin], with an [n].',
    ]),
    pick('Il est grand.', ['Il est grand.', 'Elle est grande.'], 0, '{Il} est gran~d~.', [
      '[gʁɑ̃], sans [d] à la fin : masculin. « Grande » se dit [gʁɑ̃d].',
      '[gʁɑ̃], with no final [d]: masculine. « Grande » is [gʁɑ̃d].',
    ]),
    pick('Ma cousine habite à Nice.', ['Mon cousin habite à Nice.', 'Ma cousine habite à Nice.'], 1, '{Ma} {cousine} habite à Nice.', [
      '« Ma » [ma] et [kuzin] : une cousine. « Mon cousin » se dit [mɔ̃kuzɛ̃].',
      '« Ma » [ma] and [kuzin]: a female cousin. « Mon cousin » is [mɔ̃kuzɛ̃].',
    ]),
    pick('C’est une étudiante.', ['C’est un étudiant.', 'C’est une étudiante.'], 1, 'C’est {une}‿étudian{t}e.', [
      '[yn] et le [t] final : une étudiante. « Un étudiant » se dit [œ̃netydjɑ̃].',
      '[yn] and the final [t]: a female student. « Un étudiant » is [œ̃netydjɑ̃].',
    ]),
    fill('Elle est française.', 'Elle est ___.', 'française', 'Elle est françai{s}e.', [
      'On entend [z] à la fin : française. Au masculin, « français » se termine par [ɛ].',
      'You hear [z] at the end: française. In the masculine, « français » ends in [ɛ].',
    ]),
    fill('Mon frère est très gentil.', 'Mon frère est très ___.', 'gentil', 'Mon frère est très genti~l~.', [
      '[ʒɑ̃ti] : gentil, le l final est muet. Au féminin, « gentille » se dit [ʒɑ̃tij].',
      '[ʒɑ̃ti]: gentil, the final l is silent. In the feminine, « gentille » is [ʒɑ̃tij].',
    ]),
    fill('Sa sœur est infirmière.', 'Sa sœur est ___.', 'infirmière', 'Sa sœur est infirmi{ère}.', [
      '[ɛʁ] à la fin : infirmière. Au masculin, « infirmier » se termine par [je].',
      '[ɛʁ] at the end: infirmière. In the masculine, « infirmier » ends in [je].',
    ]),
    situation('Je vous présente Camille. Elle est canadienne, elle est arrivée hier, et elle est très contente d’être ici.', 'Camille est…', ['un homme', 'une femme', 'on ne sait pas'], 1,
      'Je vous présente Camille. {Elle} est canadie{nn}e, {elle} est arrivée hier, et {elle} est très conten{t}e d’être ici.', [
        'Camille est un prénom mixte : ce sont « elle », « canadienne » [kanadjɛn] et « contente » qui montrent une femme.',
        'Camille is a unisex name: « elle », « canadienne » [kanadjɛn] and « contente » show it is a woman.',
      ]),
    situation('Mon nouveau collègue est sympa, mais il est souvent en retard.', 'De qui parle-t-on ?', ['D’un homme', 'D’une femme', 'De plusieurs personnes'], 0,
      '{Mon} {nouveau} collègue est sympa, mais {il} est souvent en retard.', [
        '« Mon nouveau » et « il » : un homme. « Collègue » se dit pareil au masculin et au féminin.',
        '« Mon nouveau » and « il »: a man. « Collègue » sounds the same in both genders.',
      ]),
  ],
  takeaway: [
    'Écoutez la fin des adjectifs (petit / petite, voisin / voisine) et, quand elle ne change pas, l’article ou le pronom (un / une, il / elle).',
    'Listen to the end of adjectives (petit / petite, voisin / voisine) and, when it does not change, the article or pronoun (un / une, il / elle).',
  ],
});
