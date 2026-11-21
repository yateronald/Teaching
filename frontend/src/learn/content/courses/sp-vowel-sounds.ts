import type { CourseAbout } from '../../types';
import { b, card, dict, flash, gap, lesson, mc, P, sort, trap, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'In French, one vowel sound can be written in several ways: [o] is o, ô, au or eau; [ɛ] is è, ê, ai, ei or e; [ɑ̃] is an, en, am or em. This first spelling course gives you the most frequent spellings of each vowel sound, the clues that help you choose (position in the word, word families) and lots of short dictations of everyday words, so you write what you hear with confidence.',
    'En français, un même son voyelle peut s’écrire de plusieurs façons : [o] s’écrit o, ô, au ou eau ; [ɛ] s’écrit è, ê, ai, ei ou e ; [ɑ̃] s’écrit an, en, am ou em. Ce premier cours d’orthographe présente les graphies les plus fréquentes de chaque son voyelle, les indices qui aident à choisir (place dans le mot, familles de mots) et de nombreuses petites dictées de mots courants, pour écrire ce que vous entendez avec assurance.',
  ),
  outcomes: [
    b('Know the spellings of [o], [ɛ] and [ɑ̃]', 'Connaître les graphies de [o], [ɛ] et [ɑ̃]'),
    b('Use position clues', 'Utiliser les indices de position'),
    b('Use word families', 'Utiliser les familles de mots'),
    b('Write everyday words correctly', 'Écrire correctement les mots courants'),
  ],
};

const C = 'sp-vowel-sounds';
export default [
  lesson(C, 1, ['the-o-sound', 'le-son-o'],
    b('The [o] sound: o, au, eau, ô', 'Le son [o] : o, au, eau, ô'),
    b('Choose between o, au, eau and ô.', 'Choisir entre o, au, eau et ô.'),
    [b('Know the four spellings', 'Connaître les quatre graphies'), b('Use eau at the end of nouns', 'Utiliser eau en fin de nom'), b('Use word families', 'Utiliser les familles de mots')],
    13,
    [
      card(b('Four spellings of [o]', 'Quatre graphies de [o]'), b('**o**: the most common: **vélo, moto, photo, dos**. **au**: **auto, chaud, jaune, aussi**. **eau**: often at the **end of a noun**: **beau, gâteau, bateau, cadeau, l’eau**. **ô**: in a few words: **hôpital, côte, tôt, bientôt, drôle**. Tip: **-eau** nouns make their plural with **-x**: **des gâteaux**.', '**o** : la plus fréquente : **vélo, moto, photo, dos**. **au** : **auto, chaud, jaune, aussi**. **eau** : souvent en **fin de nom** : **beau, gâteau, bateau, cadeau, l’eau**. **ô** : dans quelques mots : **hôpital, côte, tôt, bientôt, drôle**. Astuce : les noms en **-eau** font leur pluriel en **-x** : **des gâteaux**.'), {
        ex: [['un beau cadeau', 'eau'], ['il fait chaud', 'au'], ['à bientôt', 'ô']],
      }),
      mc(P.spelling, ['un gâteau', 'un gâtau', 'un gâto', 'un gâtôt']),
      mc(P.spelling, ['il fait chaud', 'il fait cheau', 'il fait chôt', 'il fait chot']),
      gap(P.complete, 'Mon frère a un nouveau vél___ et un petit bat___ .', ['o', 'eau'], { strict: true }),
      sort(b('Which spelling of [o]?', 'Quelle graphie de [o] ?'), [b('au', 'au'), b('eau', 'eau'), b('ô', 'ô')], [['jaune', 0], ['le manteau', 1], ['l’hôpital', 2], ['aussi', 0], ['le château', 1], ['bientôt', 2]]),
      dict('Il fait chaud, je mange un gâteau au bord de l’eau.', { strict: true, hint: b('Three spellings of [o]: au, eau, eau.', 'Trois graphies de [o] : au, eau, eau.') }),
      flash(b('Words with [o]', 'Mots avec [o]'), [['le bateau', b('the boat', 'le bateau')], ['jaune', b('yellow', 'couleur')], ['tôt', b('early', 'de bonne heure')], ['le dos', b('the back', 'partie du corps')], ['le cadeau', b('the present', 'ce qu’on offre')]]),
    ],
    [
      b('[o] = o (vélo), au (chaud), eau (gâteau), ô (hôpital).', '[o] = o (vélo), au (chaud), eau (gâteau), ô (hôpital).'),
      b('-eau often ends nouns; plural -eaux.', '-eau termine souvent les noms ; pluriel -eaux.'),
      b('When in doubt, check the dictionary and learn the word whole.', 'En cas de doute, vérifiez dans le dictionnaire et apprenez le mot entier.'),
    ],
    [['un château', b('a castle', 'grande demeure')], ['un manteau', b('a coat', 'vêtement chaud')], ['drôle', b('funny', 'amusant')]],
  ),
  lesson(C, 2, ['the-e-sound', 'le-son-e-ouvert'],
    b('The [ɛ] sound: è, ê, ai, ei, e', 'Le son [ɛ] : è, ê, ai, ei, e'),
    b('Choose between è, ê, ai, ei and e + double consonant.', 'Choisir entre è, ê, ai, ei et e + consonne double.'),
    [b('Know the five spellings', 'Connaître les cinq graphies'), b('Use e before two consonants', 'Utiliser e devant deux consonnes'), b('Recognise ai and ei words', 'Reconnaître les mots en ai et ei')],
    13,
    [
      card(b('Five spellings of [ɛ]', 'Cinq graphies de [ɛ]'), b('**è**: **mère, père, très, après**. **ê**: **fête, tête, forêt, être**. **ai**: **maison, lait, faire, j’aimais**. **ei**: **neige, seize, treize, reine**. **e + two consonants** (no accent!): **belle, merci, cette, terre, elle**. Rule: **never an accent on e before two consonants or a final consonant**: **mer, chef, sec**.', '**è** : **mère, père, très, après**. **ê** : **fête, tête, forêt, être**. **ai** : **maison, lait, faire, j’aimais**. **ei** : **neige, seize, treize, reine**. **e + deux consonnes** (sans accent !) : **belle, merci, cette, terre, elle**. Règle : **jamais d’accent sur e devant deux consonnes ou une consonne finale** : **mer, chef, sec**.')),
      trap(b('No accent before two consonants', 'Pas d’accent devant deux consonnes'), b('Write **belle**, **merci**, **cette**, never « bèlle » or « mèrci ». The double consonant already gives the sound [ɛ].', 'Écrivez **belle**, **merci**, **cette**, jamais « bèlle » ou « mèrci ». La consonne double donne déjà le son [ɛ].')),
      mc(P.spelling, ['la neige', 'la nège', 'la naige', 'la nêge']),
      mc(P.spelling, ['merci beaucoup', 'mèrci beaucoup', 'mairci beaucoup', 'mêrci beaucoup']),
      sort(b('Which spelling of [ɛ]?', 'Quelle graphie de [ɛ] ?'), [b('è / ê', 'è / ê'), b('ai / ei', 'ai / ei'), b('e + 2 consonants', 'e + 2 consonnes')], [['la fête', 0], ['la maison', 1], ['la terre', 2], ['après', 0], ['treize', 1], ['elle', 2]]),
      gap(P.complete, 'Ma m___re pr___pare une f___te pour mes tr___ze ans.', ['è', 'é', 'ê', 'ei'], { strict: true, hint: b('Careful: prépare has [e].', 'Attention : prépare a le son [e].') }),
      dict('Après la fête, mon père fait une belle promenade dans la neige.', { strict: true }),
    ],
    [
      b('[ɛ] = è (mère), ê (fête), ai (maison), ei (neige), e + 2 consonants (belle).', '[ɛ] = è (mère), ê (fête), ai (maison), ei (neige), e + 2 consonnes (belle).'),
      b('No accent before two consonants or a final consonant.', 'Pas d’accent devant deux consonnes ou une consonne finale.'),
      b('Learn ei words as a small list: neige, seize, treize, reine, peine.', 'Apprenez les mots en ei comme une petite liste : neige, seize, treize, reine, peine.'),
    ],
    [['la forêt', b('the forest', 'beaucoup d’arbres')], ['la reine', b('the queen', 'femme du roi')], ['une promenade', b('a walk', 'balade')]],
  ),
  lesson(C, 3, ['the-an-sound', 'le-son-an'],
    b('The [ɑ̃] sound: an, en, am, em', 'Le son [ɑ̃] : an, en, am, em'),
    b('Choose between an and en, and use m before p and b.', 'Choisir entre an et en, et utiliser m devant p et b.'),
    [b('Apply m before p, b', 'Appliquer m devant p, b'), b('Use word families', 'Utiliser les familles de mots'), b('Learn frequent en words', 'Apprendre les mots fréquents en en')],
    13,
    [
      card(b('an or en?', 'an ou en ?'), b('Both are very common: **maman, grand, chanter, France** / **enfant, vent, temps, souvent**. **Rule 1**: **m before p and b**: **chambre, jambe, temps, emporter**. **Rule 2**: think of the **family**: **chant → chanter, chanteur**; **dent → dentiste**. **Rule 3**: adverbs in **-ment** and nouns in **-ment** use **en**: **lentement, le moment**.', 'Les deux sont très fréquents : **maman, grand, chanter, France** / **enfant, vent, temps, souvent**. **Règle 1** : **m devant p et b** : **chambre, jambe, temps, emporter**. **Règle 2** : pensez à la **famille** : **chant → chanter, chanteur** ; **dent → dentiste**. **Règle 3** : les adverbes et noms en **-ment** s’écrivent avec **en** : **lentement, le moment**.')),
      mc(P.spelling, ['la chambre', 'la chanbre', 'la chembre', 'la chambbre']),
      mc(P.spelling, ['doucement', 'doucemant', 'doucemment', 'doussement']),
      gap(P.complete, 'L’___fant ch___te dans la ch___bre.', ['en', 'an', 'am'], { strict: true }),
      sort(b('an/am or en/em?', 'an/am ou en/em ?'), [b('an / am', 'an / am'), b('en / em', 'en / em')], [['la jambe', 0], ['le temps', 1], ['grand', 0], ['le dentiste', 1], ['la France', 0], ['souvent', 1]]),
      dict('Mes enfants chantent souvent dans leur chambre en même temps.', { strict: true, hint: b('chantent: the final -ent is silent.', 'chantent : le -ent final est muet.') }),
      write(b('Write five words.', 'Écrivez cinq mots.'), b('Write a short sentence (10–25 words) about your home using at least three words with [ɑ̃] (chambre, grand, enfant, temps, souvent…).', 'Écrivez une courte phrase (10–25 mots) sur votre logement avec au moins trois mots contenant [ɑ̃] (chambre, grand, enfant, temps, souvent…).'), 10, 25, [
        b('At least three [ɑ̃] words', 'Au moins trois mots en [ɑ̃]'),
        b('m before p and b', 'm devant p et b'),
      ], 'Dans mon grand appartement, la chambre des enfants est souvent pleine de jouets, mais elle est lumineuse en même temps.'),
    ],
    [
      b('[ɑ̃] = an, en, am, em.', '[ɑ̃] = an, en, am, em.'),
      b('m before p and b: chambre, temps, emporter.', 'm devant p et b : chambre, temps, emporter.'),
      b('Use word families: chant → chanter; dent → dentiste.', 'Utilisez les familles : chant → chanter ; dent → dentiste.'),
    ],
    [['la jambe', b('the leg', 'partie du corps')], ['emporter', b('to take away', 'prendre avec soi')], ['lumineux', b('bright', 'plein de lumière')]],
  ),
];
