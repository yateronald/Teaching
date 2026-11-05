import { b, type Lesson } from '../../types';
import { card, pick } from '../kit';

const choose = b('Choose the right spelling.', 'Choisissez la bonne orthographe.');

const lessons: Lesson[] = [
  {
    id: 'spelling-plurals-numbers-1',
    slug: { en: 'writing-numbers', fr: 'ecrire-les-nombres' },
    title: b('Writing numbers in letters', 'Écrire les nombres en lettres'),
    summary: b('Know when vingt and cent take an s, and why mille never does.', 'Savoir quand vingt et cent prennent un s, et pourquoi mille n’en prend jamais.'),
    objectives: [b('Make vingt and cent plural correctly', 'Mettre vingt et cent au pluriel correctement'), b('Keep mille invariable', 'Laisser mille invariable'), b('Write cheques and amounts in letters', 'Écrire des montants en lettres')],
    minutes: 13,
    steps: [
      card(b('Vingt and cent', 'Vingt et cent'), b('**vingt** and **cent** take an **s** when they are **multiplied and end the number**: quatre-vingt**s**, deux cent**s**. If another number follows, **no s**: quatre-vingt-trois, deux cent dix. **mille** never takes s: trois **mille**.', '**vingt** et **cent** prennent un **s** quand ils sont **multipliés et terminent le nombre** : quatre-vingt**s**, deux cent**s**. Si un autre nombre suit, **pas de s** : quatre-vingt-trois, deux cent dix. **mille** est invariable : trois **mille**.'), {
        examples: [{ fr: 'quatre-vingts, quatre-vingt-cinq', tr: '80, 85' }, { fr: 'trois cents, trois cent vingt', tr: '300, 320' }, { fr: 'deux mille vingt-six', tr: '2026' }],
      }),
      pick('B1', choose, ['quatre-vingts', 'quatre-vingt', 'quatres-vingts', 'quatre-vingt-s'], { fr: 'Ma grand-mère a ___ ans.' }),
      pick('B1', choose, ['deux cent cinquante', 'deux cents cinquante', 'deux-cents-cinquante', 'deux cent cinquantes'], { fr: 'Le loyer augmente de ___ dollars.' }),
      pick('B1', choose, ['cinq mille', 'cinq milles', 'cinq mil', 'cinq-milles'], { fr: 'La ville compte ___ habitants.' }),
      card(b('The 1990 spelling reform', 'Les rectifications de 1990'), b('Since 1990, you may link **all** parts of a number with hyphens: **deux-cent-cinquante**, **trois-mille-vingt**. Both spellings are accepted in exams; just be consistent.', 'Depuis 1990, on peut relier **toutes** les parties d’un nombre par des traits d’union : **deux-cent-cinquante**, **trois-mille-vingt**. Les deux graphies sont acceptées aux examens ; soyez simplement cohérent.'), { variant: 'tip' }),
      { kind: 'fill', prompt: b('Write the numbers in letters.', 'Écrivez les nombres en lettres.'), text: '200 = deux ___ ; 280 = deux cent quatre-___ ; 1000 = ___.', answers: [['cents'], ['vingts'], ['mille']], strict: true },
      { kind: 'dictation', prompt: b('Write the numbers in letters.', 'Écrivez les nombres en lettres.'), text: 'Il a payé trois cents dollars pour quatre-vingts livres.', voice: 'm2', strict: true },
    ],
    notes: {
      points: [
        b('vingt / cent + s when multiplied and final: quatre-vingts, deux cents.', 'vingt / cent + s quand multipliés et en fin de nombre : quatre-vingts, deux cents.'),
        b('No s if a number follows: quatre-vingt-trois, deux cent dix.', 'Pas de s si un nombre suit : quatre-vingt-trois, deux cent dix.'),
        b('Mille is invariable: trois mille.', 'Mille est invariable : trois mille.'),
        b('1990 reform: hyphens everywhere are accepted (deux-cent-dix).', 'Rectifications de 1990 : les traits d’union partout sont acceptés (deux-cent-dix).'),
      ],
      vocab: [['le montant', b('amount', 'somme')], ['l’habitant', b('inhabitant', 'résident')], ['augmenter', b('to increase', 'monter')]],
    },
  },
  {
    id: 'spelling-plurals-numbers-2',
    slug: { en: 'plural-of-compound-nouns-and-colours', fr: 'pluriel-des-noms-composes-et-des-couleurs' },
    title: b('Plural of compound nouns and colours', 'Le pluriel des noms composés et des couleurs'),
    summary: b('Make compound nouns plural (des grands-parents, des porte-clés) and know which colours agree.', 'Mettre au pluriel les noms composés (des grands-parents, des porte-clés) et savoir quelles couleurs s’accordent.'),
    objectives: [b('Make compound nouns plural', 'Mettre les noms composés au pluriel'), b('Know when colours agree', 'Savoir quand les couleurs s’accordent'), b('Keep compound colours invariable', 'Laisser invariables les couleurs composées')],
    minutes: 13,
    steps: [
      card(b('Compound nouns', 'Les noms composés'), b('Only **nouns and adjectives** take the plural; **verbs, adverbs and prepositions** never do: des **grands-parents** (adj + noun), des **choux-fleurs** (noun + noun), des **porte-clés** (verb + noun: only the noun), des **arrière-grands-mères**. With the 1990 reform, verb + noun takes s only at the end: un porte-clé, des porte-clés.', 'Seuls les **noms et adjectifs** prennent la marque du pluriel ; les **verbes, adverbes et prépositions** jamais : des **grands-parents**, des **choux-fleurs**, des **porte-clés** (verbe + nom : seul le nom), des **arrière-grands-mères**.')),
      pick('B1', choose, ['des grands-parents', 'des grand-parents', 'des grands-parent', 'des grand-parent'], { fr: 'Ils vivent avec ___.' }),
      pick('B1', choose, ['des ouvre-boîtes', 'des ouvres-boîtes', 'des ouvres-boîte', 'des ouvre-boîte'], { fr: 'Le magasin vend ___.' }),
      card(b('Colours', 'Les couleurs'), b('Simple colour adjectives agree: des robes **vertes**. Colours from nouns are **invariable**: des yeux **marron**, des pulls **orange** (except rose, mauve, fauve). **Compound colours** never agree: des chemises **bleu clair**, des yeux **vert foncé**.', 'Les adjectifs de couleur simples s’accordent : des robes **vertes**. Les couleurs issues de noms sont **invariables** : des yeux **marron**, des pulls **orange** (sauf rose, mauve, fauve). Les **couleurs composées** ne s’accordent jamais : des chemises **bleu clair**, des yeux **vert foncé**.'), { variant: 'trap' }),
      pick('B1', choose, ['bleu clair', 'bleues claires', 'bleus clairs', 'bleue claire'], { fr: 'Elle porte des chaussures ___.' }),
      pick('B1', choose, ['roses', 'rose', 'rosées', 'rosse'], { fr: 'Il a acheté des fleurs ___.' }),
      { kind: 'fill', prompt: b('Write the plural.', 'Écrivez le pluriel.'), text: 'des chou___-fleur___ et des yeux vert foncé', answers: [['x'], ['s']], strict: true },
      { kind: 'dictation', prompt: b('Write what you hear.', 'Écrivez ce que vous entendez.'), text: 'Mes grands-parents ont des yeux bleu clair.', voice: 'f', strict: true },
    ],
    notes: {
      points: [
        b('Compound nouns: nouns and adjectives take the plural, verbs and adverbs do not.', 'Noms composés : noms et adjectifs prennent le pluriel, verbes et adverbes non.'),
        b('des grands-parents, des choux-fleurs, des porte-clés.', 'des grands-parents, des choux-fleurs, des porte-clés.'),
        b('Colours from nouns are invariable (marron, orange), except rose, mauve, fauve.', 'Les couleurs issues de noms sont invariables (marron, orange), sauf rose, mauve, fauve.'),
        b('Compound colours never agree: bleu clair, vert foncé.', 'Les couleurs composées ne s’accordent jamais : bleu clair, vert foncé.'),
      ],
      vocab: [['le chou-fleur', b('cauliflower', 'légume blanc')], ['l’ouvre-boîte (m.)', b('can opener', 'outil pour ouvrir les conserves')], ['foncé', b('dark (colour)', 'sombre')]],
    },
  },
  {
    id: 'spelling-plurals-numbers-3',
    slug: { en: 'tout-tous-toute-toutes-and-meme', fr: 'tout-tous-toute-toutes-et-meme' },
    title: b('Tout, tous, toute, toutes and même', 'Tout, tous, toute, toutes et même'),
    summary: b('Make tout agree correctly, and know when même takes an s.', 'Accorder correctement tout, et savoir quand même prend un s.'),
    objectives: [b('Choose tout, tous, toute, toutes', 'Choisir tout, tous, toute, toutes'), b('Recognise tout as an adverb', 'Reconnaître tout adverbe'), b('Make même agree or not', 'Accorder ou non même')],
    minutes: 13,
    steps: [
      card(b('Tout before a noun', 'Tout devant un nom'), b('Before a noun, **tout** agrees like an adjective: **tout** le temps, **toute** la journée, **tous** les jours, **toutes** les semaines. Pronoun **tous** pronounces the s: Ils sont **tous** [tus] venus.', 'Devant un nom, **tout** s’accorde comme un adjectif : **tout** le temps, **toute** la journée, **tous** les jours, **toutes** les semaines. Le pronom **tous** fait entendre le s : Ils sont **tous** venus.'), {
        examples: [{ fr: 'Je travaille tous les jours, toute la journée.', tr: 'I work every day, all day long.' }, { fr: 'Mes amis sont tous venus.', tr: 'My friends all came.' }],
      }),
      pick('B1', choose, ['toute', 'tout', 'tous', 'toutes'], { fr: 'Il a plu ___ la nuit.' }),
      pick('B1', choose, ['tous', 'tout', 'toute', 'toutes'], { fr: 'Je fais du sport ___ les matins.' }),
      card(b('Tout = completely (adverb)', 'Tout = complètement (adverbe)'), b('Before an adjective, **tout** means **completely** and does not change: ils sont **tout** contents. Exception: before a **feminine adjective starting with a consonant**, it agrees for the sound: elle est **toute** petite, elles sont **toutes** surprises (but elle est **tout** heureuse).', 'Devant un adjectif, **tout** signifie **complètement** et reste invariable : ils sont **tout** contents. Exception : devant un **adjectif féminin commençant par une consonne**, il s’accorde : elle est **toute** petite, elles sont **toutes** surprises (mais elle est **tout** heureuse).'), { variant: 'trap' }),
      pick('B1', choose, ['toute', 'tout', 'tous', 'toutes'], { fr: 'Ma fille est ___ fière de son dessin.' }),
      pick('B1', choose, ['tout', 'tous', 'toute', 'toutes'], { fr: 'Les enfants sont ___ heureux.' }),
      card(b('Même', 'Même'), b('**même** before or after a noun = same / itself → agrees: les **mêmes** questions, eux-**mêmes**. **même** = even (adverb) → invariable: **même** les enfants ont compris.', '**même** avant ou après un nom = identique / en personne → s’accorde : les **mêmes** questions, eux-**mêmes**. **même** = jusqu’à (adverbe) → invariable : **même** les enfants ont compris.')),
      { kind: 'fill', prompt: b('Write tout, tous, toute, toutes or même(s).', 'Écrivez tout, tous, toute, toutes ou même(s).'), text: '___ les élèves ont les ___ livres, ___ les plus jeunes.', answers: [['Tous'], ['mêmes'], ['même']], strict: true },
    ],
    notes: {
      points: [
        b('Before a noun: tout le, toute la, tous les, toutes les.', 'Devant un nom : tout le, toute la, tous les, toutes les.'),
        b('Adverb tout (= completely) is invariable: ils sont tout contents.', 'Tout adverbe (= complètement) est invariable : ils sont tout contents.'),
        b('Exception: toute / toutes before a feminine adjective starting with a consonant.', 'Exception : toute / toutes devant un adjectif féminin commençant par une consonne.'),
        b('même = same → agrees (les mêmes); même = even → invariable.', 'même = identique → s’accorde (les mêmes) ; même = jusqu’à → invariable.'),
      ],
      vocab: [['fier / fière', b('proud', 'content de soi')], ['le dessin', b('drawing', 'image faite à la main')], ['surpris', b('surprised', 'étonné')]],
    },
  },
];

export default lessons;
