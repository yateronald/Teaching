import type { CourseAbout } from '../../types';
import { b, card, dict, gap, lesson, mc, P, pairs, say, sort, tip, trap } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'French nasal vowels sound simple to the ear, yet each one can be spelled several ways: [ɑ̃] as an or en, [ɛ̃] as in, ain or ein, and [ɔ̃] as on or om. On top of that, a strict orthographic rule replaces n with m before b and p — with four famous exceptions (bonbon, bonbonnière, embonpoint, néanmoins). This A1 course gives you clear patterns, word-family clues and dictation practice to spell every nasal vowel cleanly.',
    'Les voyelles nasales du français paraissent simples à l’oreille, mais chacune s’écrit de plusieurs façons : [ɑ̃] avec an ou en, [ɛ̃] avec in, ain ou ein, et [ɔ̃] avec on ou om. De plus, une règle orthographique stricte remplace n par m devant b et p — avec quatre exceptions célèbres (bonbon, bonbonnière, embonpoint, néanmoins). Ce cours A1 vous donne les repères fiables et les dictées pour écrire juste.',
  ),
  outcomes: [
    b('Choose accurately between an and en in common words and endings', 'Choisir entre an et en dans les mots courants et les terminaisons'),
    b('Spell [ɛ̃] (in, ain, ein) and [ɔ̃] (on, om) using feminine and word-family clues', 'Écrire [ɛ̃] (in, ain, ein) et [ɔ̃] (on, om) grâce aux familles de mots'),
    b('Apply the m-before-b, p and m rule consistently', 'Appliquer la règle du m devant b, p et m'),
    b('Memorise the exceptions: bonbon, bonbonnière, embonpoint, néanmoins', 'Retenir les exceptions : bonbon, bonbonnière, embonpoint, néanmoins'),
  ],
};

const C = 'sp-nasal-spellings';
export default [
  lesson(C, 1, ['nasal-an-and-en', 'ecrire-an-et-en'],
    b('The [ɑ̃] sound: an or en?', 'Le son [ɑ̃] : écrire an ou en ?'),
    b('Recognise common words and reliable suffixes spelled with an or en.', 'Reconnaître les mots fréquents et les terminaisons sûres avec an ou en.'),
    [b('Spell common words in an and en', 'Écrire les mots usuels avec an et en'), b('Know that adverbs and nouns in -ment always take en', 'Savoir que les adverbes et noms en -ment prennent toujours en'), b('Know that adjectives and participles in -ant take an', 'Savoir que les adjectifs et participes en -ant prennent an')],
    13,
    [
      card(b('Two spellings for one sound [ɑ̃]', 'Deux graphies pour un même son [ɑ̃]'), b('In French, **an** and **en** sound identical in standard speech: **maman, la France, grand, blanc, un restaurant** (**an**) vs **le vent, comment, souvent, cent, un client** (**en**). Reliable ending rules help: **-ment** (adverbs and nouns like *lentement, document, appartement*) is **always en**; **-ant** (verb participles and adjectives like *charmant, brillant, étudiant*) is **always an**.', 'En français standard, **an** et **en** se prononcent pareil : **maman, la France, grand, blanc, un restaurant** (**an**) contre **le vent, comment, souvent, cent, un client** (**en**). Deux repères sûrs : **-ment** (adverbes et noms comme *lentement, document, appartement*) prend **toujours en** ; **-ant** (participes et adjectifs comme *charmant, brillant, étudiant*) prend **toujours an**.'), {
        ex: [['Mon appartement est très grand.', 'My flat is very big.'], ['Le client parle lentement.', 'The customer speaks slowly.'], ['Pendant les vacances, il y a du vent.', 'During the holidays, it is windy.']],
      }),
      tip(b('Watch words with both: enfant, pendant', 'Attention aux mots qui mélangent les deux'), b('A few everyday words contain both spellings: **un enfant** (*en-* first, *-ant* second), **pendant** (*en* then *an*), **cependant** (*en* then *an*), **argent** (*ar-* then *en*). Group them together so your eye checks both syllables!', 'Quelques mots très courants réunissent les deux graphies : **un enfant** (*en-* puis *-ant*), **pendant** (*en* puis *an*), **cependant**, **argent**. Mémorisez-les ensemble !')),
      sort(b('Spelled with an or en?', 'S’écrit avec an ou en ?'), ['an', 'en'], [['un restaurant', 0], ['lentement', 1], ['grand', 0], ['un appartement', 1], ['charmant', 0], ['le vent', 1]]),
      mc(P.spelling, ['Un étudiant entre dans un restaurant.', 'Un étudient antre dans un restaurent.', 'Un étudiant antre dans un restaurant.', 'Un étudient entre dans un restaurent.']),
      mc(P.spelling, ['Pendant l’hiver, il travaille tranquillement.', 'Pandant l’hiver, il travaille tranquillemant.', 'Pendant l’hiver, il travaille tranquillemant.', 'Pandant l’hiver, il travaille tranquillement.']),
      gap(P.complete, 'Les enf___ts jouent d___s le gr___d jardin, souv___t au v___t.', ['an', 'an', 'an', 'en', 'en'], { choices: [['an', 'en'], ['an', 'en'], ['an', 'en'], ['en', 'an'], ['en', 'an']], strict: true }),
      dict('Maman attend souvent le client devant le grand restaurant.', { voice: 'f', strict: true }),
    ],
    [
      b('an and en sound identical [ɑ̃]: -ment is always en, -ant is always an.', 'an et en ont le même son [ɑ̃] : -ment s’écrit toujours en, -ant toujours an.'),
      b('Dual words to lock in: enfant, pendant, cependant, argent.', 'Mots mixtes à retenir : enfant, pendant, cependant, argent.'),
      b('Check feminine/derived words to hear silent final consonants: grand/grande, lent/lente.', 'Pensez au féminin pour les consonnes finales : grand/grande, lent/lente.'),
    ],
    [['lentement', b('slowly', 'avec lenteur')], ['un appartement', b('an apartment, flat', 'logement dans un immeuble')], ['cependant', b('however', 'pourtant')]],
  ),
  lesson(C, 2, ['nasal-in-and-on', 'ecrire-in-et-on'],
    b('The [ɛ̃] & [ɔ̃] sounds: in, ain, ein, on', 'Les sons [ɛ̃] et [ɔ̃] : in, ain, ein, on'),
    b('Distinguish in, ain and ein using feminine forms and word families, and spell [ɔ̃].', 'Choisir entre in, ain et ein grâce au féminin et aux familles de mots, et écrire [ɔ̃].'),
    [b('Use the feminine test for in / ain / ein', 'Utiliser le test du féminin pour in / ain / ein'), b('Spot common words in ain and ein', 'Reconnaître les mots usuels en ain et ein'), b('Spell [ɔ̃] as on in everyday words', 'Écrire [ɔ̃] avec on dans les mots courants')],
    13,
    [
      card(b('One sound [ɛ̃], three main spellings', 'Un son [ɛ̃], trois graphies principales'), b('**[ɛ̃]** is most often **in** (*matin, jardin, voisin, cinq, vin*), **ain** (*pain, main, train, demain, bain, faim*), or **ein** (*plein, peinture, ceinture, frein, éteindre*). For **[ɔ̃]**, write **on** (*maison, garçon, ballon, melon, pont, long*).', 'Le son **[ɛ̃]** s’écrit surtout **in** (*matin, jardin, voisin, cinq, vin*), **ain** (*pain, main, train, demain, bain*) ou **ein** (*plein, peinture, ceinture, frein*). Pour le son **[ɔ̃]**, écrivez **on** (*maison, garçon, ballon, melon, pont, long*).'), {
        ex: [['Le matin, j’achète du pain frais.', 'In the morning, I buy fresh bread.'], ['Le train est plein de voyageurs.', 'The train is full of travellers.'], ['Mon voisin habite une maison blanche.', 'My neighbour lives in a white house.']],
      }),
      tip(b('The feminine and word-family clue', 'L’indice du féminin et de la famille'), b('Put an adjective in the **feminine** or look for a related word where the **n** is pronounced! **voisin → voisine** shows **in**; **prochain → prochaine** and **sain → saine** show **ain**; **plein → pleine** and **peinture** (*peintre*) show **ein**. Also remember **un / une** (*lundi, brun/brune*) and **faim** (*affamé*, ends in **-m**!).', 'Mettez l’adjectif au **féminin** ou cherchez un mot de la même famille : **voisin → voisine** confirme **in** ; **prochain → prochaine** confirme **ain** ; **plein → pleine** confirme **ein**. Et souvenez-vous de **la faim** (*affamé* → **m** final !).')),
      pairs(P.match, [['voisin', 'voisine'], ['prochain', 'prochaine'], ['plein', 'pleine'], ['certain', 'certaine']], true),
      mc(P.spelling, ['Demain matin, je prends le train avec mon voisin.', 'Demin matin, je prends le trin avec mon voisain.', 'Demain matain, je prends le train avec mon voisin.', 'Demein matin, je prends le trein avec mon voisin.']),
      mc(P.spelling, ['Ce panier est plein de bon pain.', 'Ce panier est plain de bon pein.', 'Ce panier est plein de bon pin.', 'Ce panier est plin de bon pain.']),
      gap(P.complete, 'Le garç___ a f___ : il mange du p___ dans le jard___.', ['on', 'aim', 'ain', 'in'], { choices: [['on', 'om'], ['aim', 'ain', 'in'], ['ain', 'in', 'ein'], ['in', 'ain', 'ein']], strict: true }),
      dict('Demain matin, mon voisin prendra le train avec son cousin.', { voice: 'm', strict: true }),
    ],
    [
      b('[ɛ̃] = in (matin, jardin), ain (pain, train, demain), ein (plein, ceinture).', '[ɛ̃] = in (matin, jardin), ain (pain, train, demain), ein (plein, ceinture).'),
      b('Check the feminine to hear the spelling: voisine (in), certaine (ain), pleine (ein).', 'Vérifiez le féminin : voisine (in), certaine (ain), pleine (ein).'),
      b('faim ends in -m (word family: affamé).', 'faim se termine par -m (famille : affamé).'),
    ],
    [['la ceinture', b('the belt', 'bande autour de la taille')], ['le frein', b('the brake', 'mécanisme pour ralentir')], ['prochain', b('next', 'qui vient juste après')]],
  ),
  lesson(C, 3, ['m-before-b-p-rule', 'regle-du-m-devant-b-p'],
    b('Why m replaces n before b and p', 'Pourquoi m remplace n devant b et p'),
    b('Apply the m-before-b/p/m spelling rule and lock in its four classic exceptions.', 'Appliquer la règle du m devant b, p et m, et retenir ses quatre exceptions classiques.'),
    [b('Replace n with m before b and p', 'Remplacer n par m devant b et p'), b('Spell words with emm- (emmener, immense)', 'Écrire les mots avec emm- (emmener, immense)'), b('Know the exceptions: bonbon, bonbonnière, embonpoint, néanmoins', 'Connaître les exceptions : bonbon, bonbonnière, embonpoint, néanmoins')],
    13,
    [
      card(b('The golden rule: m before b, p, m', 'La règle d’or : m devant b, p, m'), b('Before the letters **b** and **p** (and usually **m**), **n turns into m**: **an → am** (*une chambre, une lampe, un champ*), **en → em** (*le temps, ensemble, décembre, emmener*), **in → im** (*important, impossible, timbre, immobile*), **on → om** (*tomber, le nombre, compter, une ombre, pompier*).', 'Devant les lettres **b** et **p** (et le plus souvent **m**), **n devient m** : **an → am** (*une chambre, une lampe, un champ*), **en → em** (*le temps, ensemble, décembre*), **in → im** (*important, impossible, timbre, immobile*), **on → om** (*tomber, le nombre, compter, pompier*).'), {
        ex: [['Il fait mauvais temps en novembre et décembre.', 'The weather is bad in November and December.'], ['C’est un message très important.', 'It’s a very important message.'], ['Nous mangeons ensemble dans la chambre.', 'We eat together in the room.']],
      }),
      trap(b('Only four real exceptions!', 'Seulement quatre vraies exceptions !'), b('Four words keep **n** before **b** or **p**: **un bonbon** (*candy*), **une bonbonnière** (*sweet jar*), **l’embonpoint** (*plumpness*, notice *em-* before *b*, then *on-* before *p*!), and **néanmoins** (*nevertheless*). Elsewhere, always write **m**!', 'Quatre mots gardent **n** devant **b** ou **p** : **un bonbon**, **une bonbonnière**, **l’embonpoint** (*em-* devant *b*, puis *on-* devant *p* !) et **néanmoins**. Partout ailleurs, écrivez **m** !')),
      sort(b('Write n or m before the consonant?', 'Écrire n ou m devant la consonne ?'), [b('m (before b / p / m)', 'm (devant b / p / m)'), b('n (other letters or exception)', 'n (autre lettre ou exception)')], [['cha…bre', 0], ['ch…ter (chanter)', 1], ['im…ossible', 0], ['bo…bon', 1], ['dece…bre', 0], ['mo…ter (monter)', 1]]),
      mc(P.spelling, ['En novembre, il est impossible de camper sans lampe.', 'En novenbre, il est inpossible de canper sans lanpe.', 'En novembre, il est inpossible de camper sans lampe.', 'En novenbre, il est impossible de canper sans lanpe.']),
      mc(P.spelling, ['Néanmoins, il a offert des bonbons aux enfants.', 'Néamoins, il a offert des bombons aux enfants.', 'Néanmoins, il a offert des bombons aux enfants.', 'Néanmoin, il a offert des bonbons aux enfants.']),
      gap(P.complete, 'En déce___bre, j’ai acheté un ti___bre i___portant et un bo___bon à la menthe.', ['m', 'm', 'm', 'n'], { choices: [['m', 'n'], ['m', 'n'], ['m', 'n'], ['n', 'm']], strict: true }),
      dict('En novembre, nous comptons acheter une lampe et des timbres ensemble.', { voice: 'f', strict: true }),
      say('C’est simple : en décembre, on reste ensemble dans une chambre chaude.', 'It’s simple: in December, we stay together in a warm room.'),
    ],
    [
      b('Before b, p (and usually m), write m instead of n: chambre, temps, timbre, compter.', 'Devant b, p (et souvent m), écrivez m au lieu de n : chambre, temps, timbre, compter.'),
      b('Memorise the exceptions: bonbon, bonbonnière, embonpoint, néanmoins.', 'Exceptions à retenir : bonbon, bonbonnière, embonpoint, néanmoins.'),
      b('Watch emmener, immense, immobile (double m).', 'Attention à emmener, immense, immobile (double m).'),
    ],
    [['un timbre', b('a postage stamp', 'vignette pour envoyer une lettre')], ['néanmoins', b('nevertheless', 'pourtant, malgré cela')], ['ensemble', b('together', 'les uns avec les autres')]],
  ),
];
