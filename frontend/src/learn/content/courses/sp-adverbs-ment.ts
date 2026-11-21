import type { CourseAbout } from '../../types';
import { b, card, dict, gap, lesson, mc, P, pairs, sort } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Lentement, vraiment, gentiment, couramment, évidemment, précisément: adverbs in -ment follow clear rules, but their spelling traps catch everyone (évidement or évidemment? couramment or courament?). This course teaches how adverbs are formed from the feminine adjective, the special endings -amment and -emment (both pronounced [amɑ̃]), the -ément adverbs and the irregular ones (gentiment, brièvement), with targeted practice.',
    'Lentement, vraiment, gentiment, couramment, évidemment, précisément : les adverbes en -ment suivent des règles claires, mais leurs pièges orthographiques piègent tout le monde (évidement ou évidemment ? couramment ou courament ?). Ce cours explique la formation à partir de l’adjectif féminin, les terminaisons spéciales -amment et -emment (prononcées toutes deux [amɑ̃]), les adverbes en -ément et les irréguliers (gentiment, brièvement), avec un entraînement ciblé.',
  ),
  outcomes: [
    b('Form adverbs from the feminine adjective', 'Former les adverbes à partir de l’adjectif féminin'),
    b('Spell -amment and -emment', 'Écrire -amment et -emment'),
    b('Know the -ément adverbs', 'Connaître les adverbes en -ément'),
    b('Remember the irregular adverbs', 'Retenir les adverbes irréguliers'),
  ],
};

const C = 'sp-adverbs-ment';
export default [
  lesson(C, 1, ['the-basic-formation', 'la-formation-de-base'],
    b('The basic formation', 'La formation de base'),
    b('Build adverbs from the feminine adjective, and from adjectives ending in a vowel.', 'Former les adverbes à partir de l’adjectif féminin, et des adjectifs terminés par une voyelle.'),
    [b('Feminine + -ment', 'Féminin + -ment'), b('Vowel adjectives: masculine + -ment', 'Adjectifs en voyelle : masculin + -ment'), b('Irregular: gentiment, brièvement', 'Irréguliers : gentiment, brièvement')],
    13,
    [
      card(b('Feminine + -ment', 'Féminin + -ment'), b('Most adverbs = **feminine adjective + -ment**: **lent → lente → lentement**, **heureux → heureuse → heureusement**, **doux → douce → doucement**. If the masculine adjective ends in a **vowel** (é, i, u), use the **masculine**: **vrai → vraiment, poli → poliment, absolu → absolument**. Irregular: **gentil → gentiment, bref → brièvement, gai → gaiement**.', 'La plupart des adverbes = **adjectif féminin + -ment** : **lent → lente → lentement**, **heureux → heureuse → heureusement**, **doux → douce → doucement**. Si l’adjectif masculin finit par une **voyelle** (é, i, u), on prend le **masculin** : **vrai → vraiment, poli → poliment, absolu → absolument**. Irréguliers : **gentil → gentiment, bref → brièvement, gai → gaiement**.')),
      mc(P.spelling, ['vraiment', 'vraiement', 'vraimment', 'vrèment']),
      mc(P.spelling, ['heureusement', 'heureuxment', 'heureusemant', 'heureusment']),
      gap(P.complete, 'Parlez douc___ , conduisez lent___ et répondez pol___ .', ['ement', 'ement', 'iment'], { strict: true }),
      pairs(P.match, [['doux', 'doucement'], ['vrai', 'vraiment'], ['gentil', 'gentiment'], ['bref', 'brièvement']], true),
      dict('Heureusement, il a répondu poliment et très gentiment.', { strict: true }),
    ],
    [
      b('Feminine adjective + -ment: lente → lentement.', 'Adjectif féminin + -ment : lente → lentement.'),
      b('Adjective ending in a vowel: masculine + -ment: vrai → vraiment.', 'Adjectif terminé par une voyelle : masculin + -ment : vrai → vraiment.'),
      b('Irregular: gentiment, brièvement.', 'Irréguliers : gentiment, brièvement.'),
    ],
    [['poliment', b('politely', 'avec politesse')], ['absolument', b('absolutely', 'tout à fait')], ['brièvement', b('briefly', 'en peu de mots')]],
  ),
  lesson(C, 2, ['amment-and-emment', 'amment-et-emment'],
    b('-amment and -emment', '-amment et -emment'),
    b('Spell adverbs from adjectives in -ant and -ent.', 'Écrire les adverbes formés sur des adjectifs en -ant et -ent.'),
    [b('-ant → -amment', '-ant → -amment'), b('-ent → -emment', '-ent → -emment'), b('Pronounce both [amɑ̃]', 'Prononcer les deux [amɑ̃]')],
    13,
    [
      card(b('-ant → -amment, -ent → -emment', '-ant → -amment, -ent → -emment'), b('Adjectives in **-ant** → **-amment**: **courant → couramment, brillant → brillamment, constant → constamment**. Adjectives in **-ent** → **-emment**: **évident → évidemment, récent → récemment, prudent → prudemment, patient → patiemment**. Both are pronounced **[amɑ̃]**: only the adjective tells you the spelling. Exception: **lent → lentement**, **présent → présentement**.', 'Adjectifs en **-ant** → **-amment** : **courant → couramment, brillant → brillamment, constant → constamment**. Adjectifs en **-ent** → **-emment** : **évident → évidemment, récent → récemment, prudent → prudemment, patient → patiemment**. Les deux se prononcent **[amɑ̃]** : seul l’adjectif indique l’orthographe. Exception : **lent → lentement**, **présent → présentement**.')),
      sort(b('-amment or -emment?', '-amment ou -emment ?'), [b('-amment (from -ant)', '-amment (de -ant)'), b('-emment (from -ent)', '-emment (de -ent)')], [['cour…', 0], ['évid…', 1], ['const…', 0], ['réc…', 1], ['abond…', 0], ['pati…', 1]]),
      mc(P.spelling, ['évidemment', 'évidement', 'évidamment', 'évidemmant']),
      mc(P.spelling, ['Elle parle couramment trois langues.', 'Elle parle courament trois langues.', 'Elle parle couremment trois langues.', 'Elle parle couramant trois langues.']),
      gap(P.complete, 'Il a récem___ déménagé et attend pati___ ses meubles.', ['ment', 'emment'], { strict: true, hint: b('récent → récemment; patient → patiemment.', 'récent → récemment ; patient → patiemment.') }),
      dict('Évidemment, elle parle couramment l’anglais et conduit prudemment.', { strict: true }),
    ],
    [
      b('-ant → -amment (couramment); -ent → -emment (évidemment).', '-ant → -amment (couramment) ; -ent → -emment (évidemment).'),
      b('Both sound [amɑ̃]: think of the adjective.', 'Les deux se prononcent [amɑ̃] : pensez à l’adjectif.'),
      b('Exception: lent → lentement.', 'Exception : lent → lentement.'),
    ],
    [['couramment', b('fluently', 'sans difficulté')], ['prudemment', b('carefully', 'avec prudence')], ['abondamment', b('abundantly', 'en grande quantité')]],
  ),
  lesson(C, 3, ['ement-adverbs-and-practice', 'les-adverbes-en-ement'],
    b('-ément adverbs and review', 'Les adverbes en -ément et révision'),
    b('Learn the adverbs that take -ément and review all the patterns.', 'Apprendre les adverbes en -ément et réviser toutes les règles.'),
    [b('Learn the -ément list', 'Apprendre la liste en -ément'), b('Review all patterns', 'Réviser toutes les règles'), b('Use adverbs in sentences', 'Employer les adverbes en phrase')],
    13,
    [
      card(b('-ément', '-ément'), b('Some adverbs take **-ément** (with an accent): **précisément, profondément, énormément, confusément, aveuglément, intensément, communément, immensément, conformément**. Tip: these must simply be learned, there is no sound clue.', 'Certains adverbes prennent **-ément** (avec accent) : **précisément, profondément, énormément, confusément, aveuglément, intensément, communément, immensément, conformément**. Astuce : il faut simplement les apprendre, aucun indice sonore ne les signale.')),
      mc(P.spelling, ['énormément', 'énormement', 'énorment', 'énormémant']),
      mc(P.spelling, ['précisément', 'précisement', 'précisémment', 'précisamment']),
      sort(b('Which pattern?', 'Quelle règle ?'), [b('feminine + -ment', 'féminin + -ment'), b('-amment / -emment', '-amment / -emment'), b('-ément', '-ément')], [['heureusement', 0], ['récemment', 1], ['profondément', 2], ['doucement', 0], ['brillamment', 1], ['énormément', 2]]),
      gap(P.completeText, 'Il a travaillé ___ (énorme) et a ___ (brillant) réussi. ___ (évident), il est ___ (profond) heureux.', ['énormément', 'brillamment', 'Évidemment', 'profondément'], { strict: true }),
      dict('Elle a répondu précisément, calmement et très intelligemment.', { strict: true, hint: b('intelligent → intelligemment.', 'intelligent → intelligemment.') }),
    ],
    [
      b('-ément: précisément, énormément, profondément, intensément.', '-ément : précisément, énormément, profondément, intensément.'),
      b('Feminine + -ment / -amment / -emment / -ément: four patterns.', 'Féminin + -ment / -amment / -emment / -ément : quatre règles.'),
      b('Learn -ément adverbs as a list.', 'Apprenez les adverbes en -ément comme une liste.'),
    ],
    [['profondément', b('deeply', 'de façon profonde')], ['aveuglément', b('blindly', 'sans réfléchir')], ['intelligemment', b('intelligently', 'avec intelligence')]],
  ),
];
