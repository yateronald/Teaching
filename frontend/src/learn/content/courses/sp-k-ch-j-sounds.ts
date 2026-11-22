import type { CourseAbout } from '../../types';
import { b, card, dict, gap, lesson, mc, P, pairs, say, sort, tip, trap } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Three French consonant sounds trip up learners because one sound maps to multiple spellings — and one letter can produce two different sounds! The [k] sound is written c, qu or k depending on the next vowel; [ʃ] is almost always ch (except when Greek words turn ch into [k]); and [ʒ] switches between j, g and ge. This A1 course gives you the exact vowel triggers so you spell every word with confidence.',
    'Trois sons consonnes déroutent les apprenants car un même son correspond à plusieurs graphies — et une même lettre change de son selon la voyelle qui suit ! Le son [k] s’écrit c, qu ou k ; le son [ʃ] s’écrit presque toujours ch (sauf dans les mots d’origine grecque où ch vaut [k]) ; et le son [ʒ] alterne entre j, g et ge. Ce cours A1 vous donne les déclencheurs précis pour ne plus hésiter.',
  ),
  outcomes: [
    b('Choose between c, qu and k for the [k] sound', 'Choisir entre c, qu et k pour écrire le son [k]'),
    b('Spell [ʃ] with ch and spot Greek words where ch sounds [k]', 'Écrire [ʃ] avec ch et repérer les mots où ch se prononce [k]'),
    b('Spell [ʒ] accurately with j, g or ge before a, o, u', 'Écrire le son [ʒ] avec j, g ou ge devant a, o, u'),
    b('Keep verb stems consistent in -ger verbs (mangeons, nageais)', 'Garder le son doux dans les verbes en -ger (mangeons, nageais)'),
  ],
};

const C = 'sp-k-ch-j-sounds';
export default [
  lesson(C, 1, ['spelling-the-k-sound', 'ecrire-le-son-k'],
    b('The [k] sound: c, qu or k?', 'Le son [k] : c, qu ou k ?'),
    b('Use the following vowel to choose between c and qu, and spot k words.', 'Choisir c ou qu selon la voyelle qui suit, et repérer les mots avec k.'),
    [b('Use c before a, o, u and consonants', 'Écrire c devant a, o, u et les consonnes'), b('Use qu before e and i', 'Écrire qu devant e et i'), b('Recognise common words in k and final -c', 'Reconnaître les mots usuels avec k et -c final')],
    13,
    [
      card(b('Vowel triggers for [k]', 'Les voyelles qui décident pour [k]'), b('**c** sounds **[k]** before **a, o, u**, before a **consonant**, or at the **end** of many words: **café, école, cuisine, classe, parc, sac**. Before **e, i, y**, **c** turns into **[s]** (*cerise, cinéma*), so to write **[k]** before **e, i**, French uses **qu**: **qui, que, quel, quatre, musique, banque, paquet, cirque** (*qu-* at start, *-que* at end). **k** appears mainly in loanwords and metric units: **kilo, kilomètre, kiwi, ski, kayak, ticket**.', '**c** se prononce **[k]** devant **a, o, u**, devant une **consonne**, ou à la **fin** d’un mot : **café, école, cuisine, classe, parc, sac**. Devant **e, i, y**, **c** se prononce **[s]** (*cerise, cinéma*) ; pour garder le son **[k]** devant **e, i**, on écrit **qu** : **qui, que, quel, quatre, musique, banque, paquet, cirque**. **k** s’emploie surtout dans les emprunts et unités : **kilo, kilomètre, kiwi, ski, kayak**.'), {
        table: { head: [b('letter after [k]', 'lettre après [k]'), b('spelling', 'graphie'), b('examples', 'exemples')], rows: [['a, o, u + consonne', 'c', 'café, chocolat, cube, crème'], ['e, i', 'qu', 'quel, qui, banque, musique'], [b('loanwords / units', 'emprunts / unités'), 'k', 'kilo, kiwi, ski, ticket']] },
      }),
      tip(b('Keep the « u » silent after « q »!', 'Le « u » de « qu » ne s’entend pas'), b('In French, **qu** before **e, i, a** is usually just **[k]**: **quatre** [katʁ], **qui** [ki], **musique** [myzik]. Never drop the **u** after **q** inside French words (only a handful of final words like **coq** and **cinq** end in bare **-q**).', 'En français, **qu** se prononce généralement **[k]** sans faire entendre le **u** : **quatre** [katʁ], **qui** [ki], **musique** [myzik]. On n’écrit jamais **q** sans **u** à l’intérieur d’un mot (seuls **coq** et **cinq** finissent par **-q**).')),
      sort(b('How is [k] spelled?', 'Comment s’écrit le son [k] ?'), ['c', 'qu', 'k'], [['…afé', 0], ['musi…e', 1], ['…ilo', 2], ['…uisine', 0], ['ban…e', 1], ['s…i', 2]]),
      mc(P.spelling, ['J’achète quatre kilos de carottes à la boutique.', 'J’achète catre quilos de qarottes à la boutic.', 'J’achète quatre kilots de karottes à la boutique.', 'J’achète quattre kilos de carottes à la boutike.']),
      mc(P.spelling, ['Quel paquet de biscuits veux-tu ?', 'Cel paquet de bisquits veux-tu ?', 'Quel pacquet de biscuits veux-tu ?', 'Kel paquet de biscuis veux-tu ?']),
      gap(P.complete, 'À la ban___e, il a acheté quatre ___iwis et un sa___ à la bouti___e.', ['qu', 'k', 'c', 'qu'], { choices: [['qu', 'c', 'k'], ['k', 'c', 'qu'], ['c', 'qu', 'k'], ['qu', 'c', 'k']], strict: true }),
      dict('Chaque matin, Lucas écoute de la musique dans la cuisine.', { voice: 'f', strict: true }),
      say('Quel café calme ! On commande quatre croissants et un kilo de kiwis ?', 'What a quiet café! Shall we order four croissants and a kilo of kiwis?'),
    ],
    [
      b('c = [k] before a, o, u and consonants (café, école, classe).', 'c = [k] devant a, o, u et les consonnes (café, école, classe).'),
      b('qu = [k] before e, i (quel, qui, banque, musique).', 'qu = [k] devant e, i (quel, qui, banque, musique).'),
      b('k appears in loanwords and metric prefixes (kilo, kiwi, ski).', 'k apparaît dans les emprunts et les unités (kilo, kiwi, ski).'),
    ],
    [['une boutique', b('a small shop', 'petit magasin')], ['un paquet', b('a parcel, packet', 'boîte ou sachet fermé')], ['chaque', b('each, every', 'pris un par un')]],
  ),
  lesson(C, 2, ['spelling-the-ch-sound', 'ecrire-le-son-ch'],
    b('The [ʃ] sound: ch (and when ch sounds [k])', 'Le son [ʃ] : ch (et quand ch vaut [k])'),
    b('Spell [ʃ] reliably with ch and avoid traps where ch is pronounced [k].', 'Écrire [ʃ] avec ch et repérer les mots d’origine grecque où ch se prononce [k].'),
    [b('Use ch for the French [ʃ] sound', 'Écrire ch pour le son français [ʃ]'), b('Distinguish ch [ʃ] from c [s] / [k]', 'Distinguer ch [ʃ] de c [s] / [k]'), b('Recognise Greek words where ch sounds [k]', 'Reconnaître les mots grecs où ch vaut [k]')],
    13,
    [
      card(b('One simple spelling: ch', 'Une graphie simple : ch'), b('Unlike English (*sh*) or German (*sch*), French spells the **[ʃ]** sound **ch**: **un chat, un chien, une chaise, une chemise, acheter, chercher, marcher, dimanche, une poche, une machine**. Only a few English borrowings keep **sh**: **un tee-shirt, un short, le shampooing**.', 'Contrairement à l’anglais (*sh*) ou à l’allemand (*sch*), le français écrit le son **[ʃ]** avec **ch** : **un chat, un chien, une chaise, une chemise, acheter, chercher, marcher, dimanche, une poche, une machine**. Seuls quelques emprunts gardent **sh** : **un tee-shirt, un short, le shampooing**.'), {
        ex: [['Le chat dort sur la chaise blanche.', 'The cat is sleeping on the white chair.'], ['Dimanche, nous cherchons une chemise chaude.', 'On Sunday, we’re looking for a warm shirt.'], ['J’ai oublié ma clé dans ma poche.', 'I forgot my key in my pocket.']],
      }),
      trap(b('When « ch » sounds like [k]!', 'Quand « ch » se prononce [k] !'), b('In words borrowed from Ancient Greek, **ch** sounds **[k]**, NOT **[ʃ]**: **une chorale** (*choir*), **un orchestre** (*orchestra*), **un écho** (*echo*), **la psychologie**, **technique**, **chronique**, **chaos**. Notice **architecte** has **[ʃ]**!', 'Dans des mots d’origine grecque, **ch** se prononce **[k]**, et non **[ʃ]** : **une chorale**, **un orchestre**, **un écho**, **la psychologie**, **technique**, **chronique**, **chaos**. Attention : **architecte** garde **[ʃ]** !')),
      sort(b('How is ch pronounced?', 'Comment se prononce ch ?'), ['[ʃ] (chat)', '[k] (chorale)'], [['une chemise', 0], ['un orchestre', 1], ['chercher', 0], ['un écho', 1], ['une machine', 0], ['la technique', 1]]),
      mc(P.spelling, ['Chaque dimanche, elle achète du chocolat chaud.', 'Chake dimanshe, elle achète du shocolat chaud.', 'Chaque dimanche, elle ashète du chocolat chaud.', 'Shaque dimanche, elle achète du chocolat shaud.']),
      mc(P.choose, [b('ch is pronounced [k] in both chorale and orchestre.', 'ch se prononce [k] dans chorale comme dans orchestre.'), b('ch is pronounced [ʃ] in both words.', 'ch se prononce [ʃ] dans les deux mots.'), b('chorale should be spelled korale.', 'chorale s’écrit korale.'), b('orchestre has a silent h and silent c.', 'orchestre a un h et un c muets.')], { fr: 'Dans « La chorale chante avec l’orchestre », comment se prononce ch ?' }),
      gap(P.complete, 'Le ___at mar___e sur la ___aise pendant que la ___orale répète.', ['ch', 'ch', 'ch', 'ch'], { tr: 'The cat walks on the chair while the choir rehearses.', choices: [['ch', 'sh'], ['ch', 'sh'], ['ch', 'sh'], ['ch', 'k']], strict: true }),
      dict('Dimanche, nous cherchons une chemise blanche et un short noir.', { voice: 'm', strict: true }),
    ],
    [
      b('French [ʃ] is spelled ch (chat, chaise, chercher, machine).', 'Le son [ʃ] s’écrit ch (chat, chaise, chercher, machine).'),
      b('Only a few English loanwords use sh (short, shampooing, tee-shirt).', 'Seuls quelques emprunts gardent sh (short, shampooing, tee-shirt).'),
      b('Greek words often spell [k] with ch: chorale, orchestre, écho, technique.', 'Mots d’origine grecque : ch = [k] dans chorale, orchestre, écho, technique.'),
    ],
    [['une chorale', b('a choir', 'groupe de chanteurs')], ['une chemise', b('a button-up shirt', 'vêtement à col et manches')], ['un écho', b('an echo', 'répétition d’un son')]],
  ),
  lesson(C, 3, ['spelling-the-j-sound', 'ecrire-le-son-j'],
    b('The [ʒ] sound: j, g or ge?', 'Le son [ʒ] : j, g ou ge ?'),
    b('Choose accurately between j, g and ge according to the following vowel.', 'Choisir avec précision j, g ou ge selon la voyelle qui suit.'),
    [b('Use g before e, i, y', 'Écrire g devant e, i, y'), b('Use ge before a, o, u to keep [ʒ]', 'Écrire ge devant a, o, u pour garder [ʒ]'), b('Use j in common words before a, o, u', 'Employer j dans les mots usuels devant a, o, u')],
    13,
    [
      card(b('How to keep the soft [ʒ] sound', 'Garder le son doux [ʒ]'), b('**j** ALWAYS sounds **[ʒ]** before any vowel (**jardin, jeudi, jouer, jus, déjà, toujours, bijou**). **g** sounds **[ʒ]** ONLY before **e, i, y** (**manger, rouge, girafe, bougie, gymnase, fromage**). Before **a, o, u**, **g** sounds **[g]** (*gare, gomme*), so to keep **[ʒ]** in **-ger** verbs and nouns like *pigeon*, insert a silent **e**: **ge** (**nous mangeons, je nageais, un pigeon, une nageoire, l’orangeade**).', '**j** se prononce toujours **[ʒ]** devant toute voyelle (**jardin, jeudi, jouer, jus, déjà, toujours**). **g** se prononce **[ʒ]** uniquement devant **e, i, y** (**manger, rouge, girafe, bougie, fromage**). Devant **a, o, u**, **g** vaut **[g]** (*gare, gomme*) ; on ajoute donc un **e** muet (**ge**) pour garder **[ʒ]** : **nous mangeons, je nageais, un pigeon, une nageoire**.'), {
        table: { head: [b('before', 'devant'), b('sound of g', 'son de g'), b('to write [ʒ]', 'pour écrire [ʒ]')], rows: [['e, i, y', '[ʒ] (fromage, girafe)', 'g or j (fromage, jeudi)'], ['a, o, u', '[g] (gare, goût)', 'j or ge (jardin, pigeon)']] },
      }),
      trap(b('Never add « e » before e or i!', 'Jamais « ge » devant e ou i !'), b('In **-ger** verbs, add **e** ONLY before **a** and **o** (**nous mangeons, il mangeait**). Before **e** or **i**, write plain **g**: **nous mangions** (never « mangeions »), **vous mangez**.', 'Dans les verbes en **-ger**, n’ajoutez **e** que devant **a** et **o** (**nous mangeons, il mangeait**). Devant **e** ou **i**, **g** suffit : **nous mangions** (jamais « mangeions »), **vous mangez**.')),
      pairs(P.match, [['manger', 'nous mangeons'], ['nager', 'je nageais'], ['voyager', 'en voyageant'], ['partager', 'nous partagions']], true),
      sort(b('Which spelling gives [ʒ]?', 'Quelle graphie donne [ʒ] ?'), ['j', 'g', 'ge'], [['…ardin', 0], ['froma…e', 1], ['pi…on', 2], ['tou…ours', 0], ['…irafe', 1], ['nous man…ons', 2]]),
      mc(P.spelling, ['Jeudi, nous mangeons des oranges et du fromage dans le jardin.', 'Geudi, nous mangons des oranjes et du fromaje dans le jardin.', 'Jeudi, nous mangons des oranges et du fromage dans le jardin.', 'Jeudi, nous mangeons des oranjes et du fromaje dans le jardin.']),
      gap(P.complete, 'Un pi___on rou___e boit de l’oran___ade dans le ___ardin.', ['ge', 'g', 'ge', 'j'], { tr: 'A red pigeon drinks orangeade in the garden.', choices: [['ge', 'g', 'j'], ['g', 'ge', 'j'], ['ge', 'g', 'j'], ['j', 'g', 'ge']], strict: true }),
      dict('Jeudi, nous partageons une orangeade et un fromage rouge dans le jardin.', { voice: 'f', strict: true }),
    ],
    [
      b('j always gives [ʒ] before any vowel (jardin, jouer, jus, jeudi).', 'j donne toujours [ʒ] devant toute voyelle (jardin, jouer, jus, jeudi).'),
      b('g gives [ʒ] before e, i, y (fromage, girafe, gymnase).', 'g donne [ʒ] devant e, i, y (fromage, girafe, gymnase).'),
      b('Add silent e (ge) before a or o to keep [ʒ]: pigeon, nous mangeons, je nageais.', 'Ajoutez un e muet (ge) devant a ou o pour garder [ʒ] : pigeon, nous mangeons, je nageais.'),
    ],
    [['un pigeon', b('a pigeon', 'oiseau des villes')], ['une nageoire', b('a fin (of a fish)', 'membre du poisson pour nager')], ['une bougie', b('a candle', 'cire à allumer')]],
  ),
];
