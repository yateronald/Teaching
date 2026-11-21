import type { CourseAbout } from '../../types';
import { b, card, dict, hear, lesson, mc, P, say, sort, trap } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Why is the t of petit silent but the c of sac pronounced? Why do parle and parlent sound the same? Final consonants are one of the biggest pronunciation traps in French. This course gives you the reliable rules: the CaReFuL mnemonic, the silent plural -s and -x, the silent -ent of verbs, the masculine/feminine contrast (petit / petite) and the common exceptions you need to know (le bus, le sens, l’ours, un os).',
    'Pourquoi le t de petit est-il muet, alors que le c de sac se prononce ? Pourquoi parle et parlent se prononcent-ils pareil ? Les consonnes finales sont l’un des plus grands pièges de la prononciation française. Ce cours vous donne des règles fiables : le moyen mnémotechnique CaReFuL, le -s et le -x muets du pluriel, le -ent muet des verbes, le contraste masculin / féminin (petit / petite) et les exceptions courantes à connaître (le bus, le sens, l’ours, un os).',
  ),
  outcomes: [
    b('Apply the CaReFuL rule', 'Appliquer la règle CaReFuL'),
    b('Never pronounce the plural -s and verb -ent', 'Ne jamais prononcer le -s du pluriel et le -ent verbal'),
    b('Hear masculine vs feminine adjectives', 'Distinguer à l’oreille adjectifs masculins et féminins'),
    b('Know the main exceptions', 'Connaître les principales exceptions'),
  ],
};

const C = 'p-final-consonants';
export default [
  lesson(C, 1, ['the-careful-rule', 'la-regle-careful'],
    b('The CaReFuL rule', 'La règle CaReFuL'),
    b('Know which final consonants are usually pronounced.', 'Savoir quelles consonnes finales se prononcent en général.'),
    [b('Apply CaReFuL', 'Appliquer CaReFuL'), b('Know the silent ones', 'Connaître les muettes'), b('Spot the -er exception', 'Repérer l’exception -er')],
    13,
    [
      card(b('CaReFuL', 'CaReFuL'), b('Most final consonants are **silent**: **petit, grand, trop, deux, nez**. The letters of **C-R-F-L** are usually **pronounced**: **sac, avec, mer, bonjour, neuf, actif, sel, avril**. Big exception: the **-er** of infinitives and many nouns is [e], r silent: **parler, le boulanger, le premier**.', 'La plupart des consonnes finales sont **muettes** : **petit, grand, trop, deux, nez**. Les lettres de **C-R-F-L** se **prononcent** en général : **sac, avec, mer, bonjour, neuf, actif, sel, avril**. Grande exception : le **-er** des infinitifs et de nombreux noms se dit [e], r muet : **parler, le boulanger, le premier**.'), {
        ex: [['un sac, avec, le parc', 'c pronounced'], ['la mer, le soir', 'r pronounced'], ['neuf, le chef', 'f pronounced'], ['le sel, le ciel', 'l pronounced']],
      }),
      sort(b('Is the final consonant pronounced?', 'La consonne finale se prononce-t-elle ?'), [b('pronounced', 'prononcée'), b('silent', 'muette')], [['le sac', 0], ['le lit', 1], ['le chef', 0], ['grand', 1], ['le ciel', 0], ['le riz', 1]], { listen: true }),
      mc(P.choose, [b('silent: [paʁle]', 'muet : [paʁle]'), b('pronounced: [paʁlɛʁ]', 'prononcé : [paʁlɛʁ]'), b('it depends on the speaker', 'ça dépend du locuteur'), b('pronounced only in Québec', 'prononcé seulement au Québec')], { fr: 'Le r de « parler » :' }),
      sort(b('-er: [e] or [ɛʁ]?', '-er : [e] ou [ɛʁ] ?'), [b('-er = [e] (r silent)', '-er = [e] (r muet)'), b('-er = [ɛʁ] (r pronounced)', '-er = [ɛʁ] (r prononcé)')], [['chanter', 0], ['la mer', 1], ['le boulanger', 0], ['hier', 1], ['le premier', 0], ['fier', 1]], { listen: true }),
      dict('Avec un sac neuf, le chef part au parc.', { hint: b('c, f, f, c are pronounced; the t of part is silent.', 'Les c et f se prononcent ; le t de part est muet.') }),
      say('Le chef met du sel dans le bol avec un sac neuf.', 'The chef puts salt in the bowl with a new bag.'),
    ],
    [
      b('Final consonants are usually silent.', 'Les consonnes finales sont généralement muettes.'),
      b('CaReFuL (c, r, f, l) are usually pronounced.', 'CaReFuL (c, r, f, l) se prononcent généralement.'),
      b('-er of verbs = [e]: parler, manger.', '-er des verbes = [e] : parler, manger.'),
    ],
    [['le chef', b('the chef, the boss', 'cuisinier, responsable')], ['le ciel', b('the sky', 'au-dessus de nous')], ['fier', b('proud', 'content de soi')]],
  ),
  lesson(C, 2, ['silent-plurals-and-verb-endings', 'pluriels-et-terminaisons-muets'],
    b('Silent plurals and verb endings', 'Pluriels et terminaisons muets'),
    b('Never pronounce the plural -s/-x or the -ent of verbs.', 'Ne jamais prononcer le -s/-x du pluriel ni le -ent des verbes.'),
    [b('Silence plural -s and -x', 'Taire le -s et le -x du pluriel'), b('Silence verb -ent', 'Taire le -ent verbal'), b('Keep -ent in adverbs and nouns', 'Garder -ent dans les adverbes et les noms')],
    13,
    [
      card(b('Silent endings', 'Les terminaisons muettes'), b('Plural **-s, -x** are silent: **les chats, des gâteaux**. Verb ending **-ent** (ils/elles) is completely silent: **ils parlent** = **il parle**; **elles chantent** = **elle chante**. But **-ent** in **nouns and adverbs** is [ɑ̃]: **le vent, souvent, lentement, un client**.', 'Les **-s, -x** du pluriel sont muets : **les chats, des gâteaux**. La terminaison verbale **-ent** (ils/elles) est totalement muette : **ils parlent** = **il parle** ; **elles chantent** = **elle chante**. Mais **-ent** dans les **noms et adverbes** se dit [ɑ̃] : **le vent, souvent, lentement, un client**.')),
      trap(b('« Les poules du couvent couvent »', '« Les poules du couvent couvent »'), b('A famous sentence: **le couvent** [kuvɑ̃] (convent, noun) and **elles couvent** [kuv] (they brood, verb). Same spelling, different sound.', 'Une phrase célèbre : **le couvent** [kuvɑ̃] (nom) et **elles couvent** [kuv] (verbe couver). Même orthographe, son différent.')),
      sort(b('-ent: silent or [ɑ̃]?', '-ent : muet ou [ɑ̃] ?'), [b('silent (verb)', 'muet (verbe)'), b('[ɑ̃] (noun/adverb)', '[ɑ̃] (nom/adverbe)')], [['ils mangent', 0], ['souvent', 1], ['elles arrivent', 0], ['le moment', 1], ['ils travaillent', 0], ['lentement', 1]], { listen: true }),
      mc(P.choose, [b('They sound exactly the same.', 'Ils se prononcent exactement pareil.'), b('The plural has an extra [ɑ̃].', 'Le pluriel a un [ɑ̃] en plus.'), b('The plural ends with [t].', 'Le pluriel finit par [t].'), b('The singular ends with [ə].', 'Le singulier finit par [ə].')], { fr: '« Il chante » et « Ils chantent » :' }),
      dict('Les enfants chantent souvent dans le jardin.', { hint: b('chantent: silent -ent; souvent: -ent = [ɑ̃].', 'chantent : -ent muet ; souvent : -ent = [ɑ̃].') }),
      say('Ils parlent souvent lentement à leurs clients.', 'They often speak slowly to their customers.'),
    ],
    [
      b('Plural -s and -x: silent.', '-s et -x du pluriel : muets.'),
      b('Verb -ent (ils/elles): silent.', '-ent verbal (ils/elles) : muet.'),
      b('-ent in nouns/adverbs: [ɑ̃] (souvent, le vent).', '-ent des noms/adverbes : [ɑ̃] (souvent, le vent).'),
    ],
    [['un couvent', b('a convent', 'maison de religieuses')], ['couver', b('to brood (eggs)', 'garder les œufs au chaud')], ['lentement', b('slowly', 'sans se presser')]],
  ),
  lesson(C, 3, ['feminine-and-exceptions', 'feminin-et-exceptions'],
    b('Feminine forms and exceptions', 'Le féminin et les exceptions'),
    b('Hear the consonant that appears in the feminine, and learn the classic exceptions.', 'Entendre la consonne qui apparaît au féminin, et apprendre les exceptions classiques.'),
    [b('Hear petit / petite', 'Distinguer petit / petite'), b('Learn pronounced final s', 'Apprendre les s finaux prononcés'), b('Know changing words: os, œuf', 'Connaître les mots qui changent : os, œuf')],
    13,
    [
      card(b('The feminine consonant', 'La consonne du féminin'), b('The feminine **-e** makes the previous consonant **audible**: **petit / petite** [pəti / pətit], **grand / grande**, **français / française**, **gris / grise** [z]. Often the only audible difference!', 'Le **-e** du féminin rend la consonne précédente **audible** : **petit / petite** [pəti / pətit], **grand / grande**, **français / française**, **gris / grise** [z]. C’est souvent la seule différence audible !')),
      card(b('Exceptions to learn', 'Exceptions à retenir'), b('Final **s** pronounced: **le bus, le sens, l’ours, le fils, l’autobus, un as, mars, un virus**. **Tous** (pronoun): **Ils sont tous là** [tus]. Changing words: **un os** [ɔs] / **des os** [o], **un œuf** [œf] / **des œufs** [ø], **un bœuf** / **des bœufs**.', '**s** final prononcé : **le bus, le sens, l’ours, le fils, l’autobus, un as, mars, un virus**. **Tous** (pronom) : **Ils sont tous là** [tus]. Mots qui changent : **un os** [ɔs] / **des os** [o], **un œuf** [œf] / **des œufs** [ø], **un bœuf** / **des bœufs**.')),
      hear('Elle est petite.', b('Listen. Masculine or feminine adjective?', 'Écoutez. Adjectif masculin ou féminin ?'), [b('feminine: petite', 'féminin : petite'), b('masculine: petit', 'masculin : petit')]),
      hear('C’est un grand appartement.', b('Listen. Is the d of grand heard?', 'Écoutez. Entend-on le d de grand ?'), [b('Yes, as [t], linked to appartement', 'Oui, en [t], lié à appartement'), b('No, never', 'Non, jamais'), b('Yes, as [d]', 'Oui, en [d]'), b('Only in the feminine', 'Seulement au féminin')], { voice: 'm' }),
      sort(b('Final s: pronounced or silent?', 's final : prononcé ou muet ?'), [b('pronounced', 'prononcé'), b('silent', 'muet')], [['le bus', 0], ['le bras', 1], ['l’ours', 0], ['le repas', 1], ['le fils', 0], ['le pas', 1]], { listen: true }),
      dict('Mon fils prend le bus avec sa petite sœur.', { hint: b('fils, bus: s pronounced; petite: t pronounced.', 'fils, bus : s prononcé ; petite : t prononcé.') }),
      say('Un petit ours, une petite ourse, et tous les deux prennent le bus.', 'A little bear, a little she-bear, and both take the bus.'),
    ],
    [
      b('Feminine -e reveals the consonant: petit / petite.', 'Le -e du féminin révèle la consonne : petit / petite.'),
      b('Pronounced s: bus, sens, ours, fils, mars, virus, tous (pronoun).', 's prononcé : bus, sens, ours, fils, mars, virus, tous (pronom).'),
      b('un os [ɔs] / des os [o]; un œuf [œf] / des œufs [ø].', 'un os [ɔs] / des os [o] ; un œuf [œf] / des œufs [ø].'),
    ],
    [['un os', b('a bone', 'partie du squelette')], ['un ours', b('a bear', 'grand animal')], ['un fils', b('a son', 'enfant garçon')]],
  ),
];
