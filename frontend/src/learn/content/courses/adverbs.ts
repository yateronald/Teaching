import type { CourseAbout } from '../../types';
import { b, card, dict, gap, lesson, mc, ord, P, pairs, say, sort, tip, trap } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Adverbs add precision: how, how often, how well. This course shows how to build adverbs in -ment from adjectives (lent → lentement, évident → évidemment), the frequent irregular ones (bien, mal, vite, mieux), and where to place them, which is different from English: after the verb in simple tenses (je parle souvent), between the auxiliary and the participle in compound tenses (j’ai bien dormi).',
    'Les adverbes apportent de la précision : comment, à quelle fréquence, à quel point. Ce cours montre comment former les adverbes en -ment à partir des adjectifs (lent → lentement, évident → évidemment), les irréguliers fréquents (bien, mal, vite, mieux), et leur place, différente de l’anglais : après le verbe aux temps simples (je parle souvent), entre l’auxiliaire et le participe aux temps composés (j’ai bien dormi).',
  ),
  outcomes: [
    b('Form adverbs in -ment, -amment and -emment', 'Former les adverbes en -ment, -amment et -emment'),
    b('Use bien, mal, vite, mieux and frequency adverbs', 'Employer bien, mal, vite, mieux et les adverbes de fréquence'),
    b('Place adverbs in simple and compound tenses', 'Placer les adverbes aux temps simples et composés'),
    b('Describe how you do things', 'Décrire sa manière de faire'),
  ],
};

const C = 'adverbs';
export default [
  lesson(C, 1, ['adverbs-in-ment', 'adverbes-en-ment'],
    b('Forming adverbs in -ment', 'Former les adverbes en -ment'),
    b('Build adverbs from the feminine adjective, and the -amment / -emment endings.', 'Former les adverbes à partir de l’adjectif féminin, et les terminaisons -amment / -emment.'),
    [b('Add -ment to the feminine', 'Ajouter -ment au féminin'), b('Use the vowel-ending rule', 'Appliquer la règle des adjectifs à voyelle finale'), b('Spell -amment and -emment', 'Écrire -amment et -emment')],
    13,
    [
      card(b('Feminine + -ment', 'Féminin + -ment'), b('Most adverbs = **feminine adjective + -ment**: **lente → lentement, heureuse → heureusement, douce → doucement**. If the masculine ends in a vowel, use the masculine: **vrai → vraiment, poli → poliment, absolu → absolument**.', 'La plupart des adverbes = **adjectif féminin + -ment** : **lente → lentement, heureuse → heureusement, douce → doucement**. Si le masculin finit par une voyelle, on part du masculin : **vrai → vraiment, poli → poliment, absolu → absolument**.'), {
        ex: [['Parlez lentement, s’il vous plaît.', 'Please speak slowly.'], ['Heureusement, il ne pleut pas.', 'Luckily, it isn’t raining.'], ['C’est vraiment délicieux.', 'It’s really delicious.']],
      }),
      tip(b('-ant → -amment, -ent → -emment', '-ant → -amment, -ent → -emment'), b('Adjectives in **-ant** give **-amment**: **courant → couramment, constant → constamment**. In **-ent** give **-emment** (same sound [amɑ̃]): **évident → évidemment, prudent → prudemment**. Exception: **lent → lentement**.', 'Les adjectifs en **-ant** donnent **-amment** : **courant → couramment, constant → constamment**. En **-ent** : **-emment** (même son [amɑ̃]) : **évident → évidemment, prudent → prudemment**. Exception : **lent → lentement**.')),
      pairs(P.match, [['sérieux', 'sérieusement'], ['gentil', 'gentiment'], ['patient', 'patiemment'], ['bruyant', 'bruyamment']], true),
      mc(P.spelling, ['couramment', 'courament', 'couremment', 'courrament'], { fr: 'Elle parle ___ quatre langues.' }),
      mc(P.spelling, ['évidemment', 'évidament', 'évidamment', 'évidemmant'], { fr: '___, tu es invité !' }),
      mc(P.form, ['poliment', 'polimment', 'poliement', 'polement'], { fr: 'Il a répondu très ___.' }),
      gap(P.complete, 'Conduis ___ (prudent) et rentre ___ (rapide).', ['prudemment', 'rapidement'], { strict: true }),
      dict('Heureusement, elle parle couramment français.', { voice: 'f', strict: true }),
    ],
    [
      b('Feminine adjective + -ment: lentement, heureusement.', 'Adjectif féminin + -ment : lentement, heureusement.'),
      b('Masculine in a vowel + -ment: vraiment, poliment.', 'Masculin à voyelle finale + -ment : vraiment, poliment.'),
      b('-ant → -amment, -ent → -emment (both [amɑ̃]); lent → lentement.', '-ant → -amment, -ent → -emment (même son) ; lent → lentement.'),
    ],
    [['couramment', b('fluently', 'avec aisance')], ['bruyant', b('noisy', 'qui fait du bruit')], ['prudent', b('careful', 'qui fait attention')]],
  ),
  lesson(C, 2, ['frequent-adverbs', 'adverbes-frequents'],
    b('Bien, mal, vite, souvent, toujours', 'Bien, mal, vite, souvent, toujours'),
    b('Use the most frequent adverbs of manner, frequency and degree.', 'Employer les adverbes de manière, de fréquence et d’intensité les plus fréquents.'),
    [b('Use bien / mal / vite / mieux', 'Employer bien / mal / vite / mieux'), b('Express frequency', 'Exprimer la fréquence'), b('Avoid confusing bon and bien', 'Ne pas confondre bon et bien')],
    13,
    [
      card(b('Short, frequent and irregular', 'Courts, fréquents, irréguliers'), b('Manner: **bien, mal, vite, mieux** (better), **plus mal** (worse). Frequency: **toujours, souvent, parfois, rarement, jamais**. Degree: **très, trop, assez, plutôt, tellement**.', 'Manière : **bien, mal, vite, mieux**, **plus mal**. Fréquence : **toujours, souvent, parfois, rarement, jamais**. Intensité : **très, trop, assez, plutôt, tellement**.'), {
        ex: [['Tu parles bien français !', 'You speak French well!'], ['Je vais mieux, merci.', 'I’m better, thanks.'], ['On mange rarement au restaurant.', 'We rarely eat out.']],
      }),
      trap(b('Bon or bien?', 'Bon ou bien ?'), b('**bon** is an adjective (it describes a noun): **un bon repas**. **bien** is an adverb (it describes a verb): **elle cuisine bien**. Same for **mauvais / mal** and **meilleur / mieux**.', '**bon** est un adjectif (il qualifie un nom) : **un bon repas**. **bien** est un adverbe (il modifie un verbe) : **elle cuisine bien**. De même pour **mauvais / mal** et **meilleur / mieux**.')),
      mc(P.word, ['bien', 'bon', 'bonne', 'meilleur'], { fr: 'Ce chanteur chante vraiment ___.' }),
      mc(P.word, ['mieux', 'meilleur', 'plus bien', 'bon'], { fr: 'Depuis ses vacances, il dort ___.' }),
      mc(P.word, ['meilleure', 'mieux', 'plus bonne', 'bien'], { fr: 'C’est la ___ boulangerie du quartier.' }),
      sort(b('Adjective or adverb?', 'Adjectif ou adverbe ?'), [b('adjective', 'adjectif'), b('adverb', 'adverbe')], [['bon', 0], ['bien', 1], ['mauvais', 0], ['mal', 1], ['meilleur', 0], ['mieux', 1]]),
      gap(P.complete, 'Je vais ___ au cinéma : deux ou trois fois par an seulement.', ['rarement'], { choices: [['rarement', 'souvent', 'toujours']] }),
      say('Je cuisine assez bien, mais je mange souvent trop vite.', 'I cook quite well, but I often eat too fast.'),
    ],
    [
      b('bien / mal / vite / mieux modify verbs; bon / mauvais / meilleur modify nouns.', 'bien / mal / vite / mieux modifient le verbe ; bon / mauvais / meilleur qualifient le nom.'),
      b('Frequency: toujours, souvent, parfois, rarement, ne… jamais.', 'Fréquence : toujours, souvent, parfois, rarement, ne… jamais.'),
      b('Degree: très, trop, assez, plutôt, tellement.', 'Intensité : très, trop, assez, plutôt, tellement.'),
    ],
    [['plutôt', b('rather', 'assez, dans une certaine mesure')], ['tellement', b('so (much)', 'à un très haut degré')], ['parfois', b('sometimes', 'de temps en temps')]],
  ),
  lesson(C, 3, ['where-to-put-the-adverb', 'la-place-de-l-adverbe'],
    b('Where does the adverb go?', 'Où placer l’adverbe ?'),
    b('Place the adverb after the verb, between auxiliary and participle, or at the start of the sentence.', 'Placer l’adverbe après le verbe, entre l’auxiliaire et le participe, ou en tête de phrase.'),
    [b('Place adverbs in simple tenses', 'Placer l’adverbe aux temps simples'), b('Place short adverbs in compound tenses', 'Placer les adverbes courts aux temps composés'), b('Use sentence adverbs at the start', 'Employer les adverbes de phrase en tête')],
    13,
    [
      card(b('Simple tenses: after the verb', 'Temps simples : après le verbe'), b('Unlike English, the adverb goes **after the conjugated verb**: **Je parle souvent français** (not « je souvent parle »). **Elle travaille beaucoup.**', 'Contrairement à l’anglais, l’adverbe se place **après le verbe conjugué** : **Je parle souvent français** (et non « je souvent parle »). **Elle travaille beaucoup.**'), {
        ex: [['Il arrive toujours en retard.', 'He always arrives late.'], ['Nous mangeons rarement de la viande.', 'We rarely eat meat.']],
      }),
      card(b('Compound tenses: between', 'Temps composés : entre les deux'), b('Short frequent adverbs go **between the auxiliary and the participle**: **J’ai bien dormi. Il a déjà mangé. Tu as beaucoup travaillé.** Long adverbs in -ment usually go after: **Il a répondu calmement.**', 'Les adverbes courts et fréquents se placent **entre l’auxiliaire et le participe** : **J’ai bien dormi. Il a déjà mangé. Tu as beaucoup travaillé.** Les adverbes longs en -ment se placent plutôt après : **Il a répondu calmement.**'), {
        ex: [['Vous avez bien compris ?', 'Did you understand properly?'], ['J’ai toujours aimé la musique.', 'I have always loved music.'], ['Elle a parlé très lentement.', 'She spoke very slowly.']],
      }),
      mc(P.best, ['Je bois souvent du thé.', 'Je souvent bois du thé.', 'Souvent je du thé bois.', 'Je bois du thé souvent toujours.']),
      mc(P.best, ['Nous avons bien mangé.', 'Nous avons mangé bien.', 'Nous bien avons mangé.', 'Bien nous avons mangé.']),
      mc(P.best, ['Il a déjà fini.', 'Il déjà a fini.', 'Il a fini déjà avant.', 'Déjà il a fini a.']),
      ord(P.order, 'J’ai toujours voulu visiter le Québec.', { tr: 'I’ve always wanted to visit Québec.' }),
      gap(P.complete, 'Tu as ___ dormi ? – Non, j’ai ___ dormi, les voisins ont fait la fête !', ['bien', 'mal']),
      dict('Malheureusement, je n’ai pas encore trouvé de travail.', { voice: 'm' }),
      say('Hier, j’ai beaucoup travaillé, mais j’ai bien dormi.', 'Yesterday I worked a lot, but I slept well.'),
    ],
    [
      b('Simple tense: verb + adverb (Je parle souvent).', 'Temps simple : verbe + adverbe (Je parle souvent).'),
      b('Compound tense: auxiliary + short adverb + participle (J’ai bien dormi).', 'Temps composé : auxiliaire + adverbe court + participe (J’ai bien dormi).'),
      b('Sentence adverbs at the start: Heureusement, Malheureusement, Finalement.', 'Adverbes de phrase en tête : Heureusement, Malheureusement, Finalement.'),
    ],
    [['déjà', b('already', 'avant maintenant')], ['pas encore', b('not yet', 'pas jusqu’à maintenant')], ['malheureusement', b('unfortunately', 'par malchance')]],
  ),
];
