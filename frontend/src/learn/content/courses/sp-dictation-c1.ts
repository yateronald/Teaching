import type { CourseAbout } from '../../types';
import { b, card, dict, gap, lesson, mc, P, sort, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Three demanding dictations at C1 level, built around the traps that cost the most points in DALF and university writing: past participle agreement, subjunctive endings, homophones, plural of compound words, and the subtle accents of formal vocabulary. Each lesson prepares the traps first, then dictates the text in short sentences and finishes with a full dictation and a proofreading checklist.',
    'Trois dictées exigeantes de niveau C1, construites autour des pièges qui coûtent le plus de points au DALF et dans l’écrit universitaire : accord du participe passé, terminaisons du subjonctif, homophones, pluriel des mots composés et accents subtils du vocabulaire soutenu. Chaque leçon prépare d’abord les pièges, puis dicte le texte par courtes phrases et se termine par une dictée complète et une grille de relecture.',
  ),
  outcomes: [
    b('Anticipate the classic traps', 'Anticiper les pièges classiques'),
    b('Write long sentences accurately', 'Écrire avec exactitude des phrases longues'),
    b('Proofread with a checklist', 'Relire avec une grille'),
    b('Explain each correction', 'Justifier chaque correction'),
  ],
};

const C = 'sp-dictation-c1';
export default [
  lesson(C, 1, ['dictation-the-old-house', 'dictee-la-vieille-maison'],
    b('Dictation 1: the old house', 'Dictée 1 : la vieille maison'),
    b('Participle agreements and descriptive vocabulary.', 'Accords du participe et vocabulaire descriptif.'),
    [b('Prepare the traps', 'Préparer les pièges'), b('Write sentence by sentence', 'Écrire phrase par phrase'), b('Proofread the whole text', 'Relire le texte complet')],
    13,
    [
      card(b('The traps of this text', 'Les pièges de ce texte'), b('**Les volets que le vent avait arrachés** (COD before) · **les années qu’ils y avaient passées** (passer = spend: real COD) · **s’étaient succédé** (se = COI: invariable) · **quelque cinquante ans** (= environ) · **des bric-à-brac** (invariable).', '**Les volets que le vent avait arrachés** (COD avant) · **les années qu’ils y avaient passées** (passer du temps : vrai COD) · **s’étaient succédé** (se = COI : invariable) · **quelque cinquante ans** (= environ) · **des bric-à-brac** (invariable).')),
      gap(P.complete, 'Les volets que le vent avait ___ (arracher) battaient encore, et les générations qui s’étaient ___ (succéder) dans la maison semblaient la hanter.', ['arrachés', 'succédé'], { strict: true }),
      dict('La vieille maison, abandonnée depuis quelque cinquante ans, se dressait au bout du chemin.', { strict: true }),
      dict('Les volets que le vent avait arrachés battaient contre les murs lézardés.', { strict: true }),
      dict('Les familles qui s’y étaient succédé avaient laissé derrière elles des bric-à-brac poussiéreux.', { strict: true }),
      dict('Nul ne savait combien d’années heureuses elles y avaient passées, ni pourquoi elles étaient parties si brusquement.', { strict: true }),
      mc(P.choose, [b('passées: COD « que/combien d’années » placed before', 'passées : COD « combien d’années » placé avant'), b('passé: measure of time, always invariable', 'passé : mesure de temps, toujours invariable'), b('passés: masculine plural', 'passés : masculin pluriel'), b('passer: infinitive', 'passer : infinitif')], { fr: 'Pourquoi « les années heureuses qu’elles y avaient passées » ?' }),
    ],
    [
      b('COD before avoir → agreement (arrachés, passées).', 'COD avant avoir → accord (arrachés, passées).'),
      b('se succéder: se is COI → invariable.', 'se succéder : se est COI → invariable.'),
      b('quelque + number = environ: invariable.', 'quelque + nombre = environ : invariable.'),
    ],
    [['lézardé', b('cracked', 'fissuré')], ['un bric-à-brac', b('jumble, odds and ends', 'objets divers entassés')], ['hanter', b('to haunt', 'occuper en esprit')]],
  ),
  lesson(C, 2, ['dictation-the-meeting', 'dictee-la-reunion'],
    b('Dictation 2: the meeting', 'Dictée 2 : la réunion'),
    b('Subjunctive, homophones and professional vocabulary.', 'Subjonctif, homophones et vocabulaire professionnel.'),
    [b('Spell subjunctive forms', 'Écrire les formes du subjonctif'), b('Choose the right homophones', 'Choisir les bons homophones'), b('Proofread verb endings', 'Relire les terminaisons verbales')],
    13,
    [
      card(b('The traps of this text', 'Les pièges de ce texte'), b('**Bien qu’elle ait** (subjonctif, not « est ») · **quelles que soient** (two words, agreement) · **quoi qu’il en soit** (two words: = whatever the case) · **il a fallu** (invariable) · **la plupart des participants ont** (verb in the plural) · **davantage** (one word).', '**Bien qu’elle ait** (subjonctif, et non « est ») · **quelles que soient** (deux mots, accord) · **quoi qu’il en soit** (deux mots : « quelle que soit la chose ») · **il a fallu** (invariable) · **la plupart des participants ont** (verbe au pluriel) · **davantage** (un mot).')),
      mc(P.form, ['Quoi qu’il en soit, la décision est prise.', 'Quoiqu’il en soit, la décision est prise.', 'Quoi qu’il en est, la décision est prise.', 'Quoiqu’il en est, la décision est prise.']),
      dict('Bien qu’elle ait préparé la réunion avec soin, la directrice craignait que les échanges ne soient tendus.', { strict: true }),
      dict('Quelles que soient les objections, il a fallu trancher avant la fin du trimestre.', { strict: true }),
      dict('La plupart des participants ont souhaité davantage de transparence sur les budgets alloués.', { strict: true }),
      dict('Quoi qu’il en soit, les décisions qu’on a prises engageront l’entreprise pour plusieurs années.', { strict: true }),
      sort(b('Which form?', 'Quelle forme ?'), [b('subjunctive', 'subjonctif'), b('indicative', 'indicatif')], [['bien qu’elle ait', 0], ['parce qu’elle a', 1], ['craindre que ce soit', 0], ['penser que c’est', 1], ['avant qu’il parte', 0], ['après qu’il est parti', 1]]),
    ],
    [
      b('bien que, craindre que, avant que + subjunctive; après que + indicative.', 'bien que, craindre que, avant que + subjonctif ; après que + indicatif.'),
      b('quoi qu’il en soit: two words.', 'quoi qu’il en soit : deux mots.'),
      b('la plupart des + plural verb.', 'la plupart des + verbe au pluriel.'),
    ],
    [['trancher', b('to decide, settle', 'prendre une décision')], ['un trimestre', b('a quarter (3 months)', 'période de trois mois')], ['alloué', b('allocated', 'attribué')]],
  ),
  lesson(C, 3, ['dictation-the-festival', 'dictee-le-festival'],
    b('Dictation 3: the festival', 'Dictée 3 : le festival'),
    b('Compound words, numbers, colours and a final full dictation.', 'Mots composés, nombres, couleurs et dictée complète finale.'),
    [b('Write compound words and colours', 'Écrire mots composés et couleurs'), b('Write numbers in letters', 'Écrire les nombres en lettres'), b('Do a full dictation', 'Faire une dictée complète')],
    13,
    [
      card(b('The traps of this text', 'Les pièges de ce texte'), b('**des chapiteaux bleu marine** (compound colour: invariable) · **des robes orange** (noun-colour: invariable) · **quatre-vingts musiciens** (s when nothing follows) but **quatre-vingt-deux** · **deux mille** (mille invariable) · **des arcs-en-ciel** · **demi-heure** (demi before: invariable) · **une heure et demie**.', '**des chapiteaux bleu marine** (couleur composée : invariable) · **des robes orange** (nom de couleur : invariable) · **quatre-vingts musiciens** (s quand rien ne suit) mais **quatre-vingt-deux** · **deux mille** (mille invariable) · **des arcs-en-ciel** · **une demi-heure** (demi devant : invariable) · **une heure et demie**.')),
      mc(P.form, ['Elles portaient des écharpes orange et des gants bleu clair.', 'Elles portaient des écharpes oranges et des gants bleus clairs.', 'Elles portaient des écharpes orange et des gants bleus clair.', 'Elles portaient des écharpes oranges et des gants bleu clair.']),
      dict('Sous des chapiteaux bleu marine, quatre-vingts musiciens vêtus de tuniques orange jouaient depuis une demi-heure.', { strict: true }),
      dict('Plus de deux mille spectateurs, venus parfois de très loin, applaudissaient à tout rompre.', { strict: true }),
      dict('Quand la pluie cessa, deux arcs-en-ciel apparurent au-dessus des collines, et la fête reprit pour une heure et demie.', { strict: true }),
      gap(P.complete, 'quatre-___ (80) musiciens, quatre-___-deux (82) spectateurs, deux ___ (2000) personnes, une ___-heure.', ['vingts', 'vingt', 'mille', 'demi'], { strict: true }),
      write(b('Proofread and explain.', 'Relisez et justifiez.'), b('Write the full festival dictation from memory or from the audio (60–90 words), then list three traps you avoided and explain each in one line.', 'Réécrivez la dictée du festival de mémoire ou d’après l’audio (60–90 mots), puis indiquez trois pièges évités en les justifiant en une ligne chacun.'), 60, 110, [
        b('Compound colours invariable', 'Couleurs composées invariables'),
        b('quatre-vingts / mille', 'quatre-vingts / mille'),
        b('demi-heure / heure et demie', 'demi-heure / heure et demie'),
      ], 'Sous des chapiteaux bleu marine, quatre-vingts musiciens vêtus de tuniques orange jouaient depuis une demi-heure. Plus de deux mille spectateurs, venus parfois de très loin, applaudissaient à tout rompre. Quand la pluie cessa, deux arcs-en-ciel apparurent au-dessus des collines, et la fête reprit pour une heure et demie. Pièges : « bleu marine » est une couleur composée, donc invariable ; « quatre-vingts » prend un s car rien ne suit ; « demi » placé devant le nom est invariable.'),
    ],
    [
      b('Compound colours and noun-colours: invariable.', 'Couleurs composées et noms de couleur : invariables.'),
      b('quatre-vingts (nothing follows) / quatre-vingt-deux; mille invariable.', 'quatre-vingts (rien ne suit) / quatre-vingt-deux ; mille invariable.'),
      b('demi- before: invariable; et demie after a feminine noun.', 'demi- devant : invariable ; et demie après un nom féminin.'),
    ],
    [['un chapiteau', b('a big top, marquee', 'grande tente de cirque')], ['à tout rompre', b('wildly (applause)', 'très fort')], ['une colline', b('a hill', 'petite montagne')]],
  ),
];
