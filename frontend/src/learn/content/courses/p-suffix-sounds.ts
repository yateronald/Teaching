import type { CourseAbout } from '../../types';
import { b, card, dict, hear, lesson, mc, P, pairs, say, sort, trap } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Nation, télévision, question, ville vs fille, président vs ils président: French suffixes look deceptive when you know English or read literally. Pronouncing -tion like « shun », turning ville into fille, or sounding -ent on a plural verb instantly marks a learner’s reading. This A2 course locks in the exact pronunciation of -tion, -sion, -ille and -ent so you read aloud with confidence.',
    'Nation, télévision, question, ville contre fille, président contre ils président : les terminaisons françaises tendent de vrais pièges à la lecture. Dire -tion à l’anglaise, confondre ville et fille ou prononcer le -ent d’un verbe au pluriel trahit aussitôt l’apprenant. Ce cours A2 fixe la prononciation exacte de -tion, -sion, -ille et -ent pour lire sans hésiter.',
  ),
  outcomes: [
    b('Pronounce -tion [sjɔ̃], -sion [zjɔ̃] and -stion [tjɔ̃] accurately', 'Prononcer avec justesse -tion [sjɔ̃], -sion [zjɔ̃] et -stion [tjɔ̃]'),
    b('Avoid English « shun » and keep final nasal [ɔ̃] pure', 'Éviter le « shun » anglais et garder une nasale [ɔ̃] pure'),
    b('Distinguish -ille [ij] (fille, famille) from [il] (ville, mille, tranquille)', 'Distinguer -ille [ij] (fille) et [il] (ville, mille, tranquille)'),
    b('Separate silent verb -ent from nasal [ɑ̃] in nouns, adjectives and adverbs', 'Séparer -ent muet des verbes et -ent [ɑ̃] des noms, adjectifs et adverbes'),
  ],
};

const C = 'p-suffix-sounds';
export default [
  lesson(C, 1, ['tion-and-sion-endings', 'terminaisons-tion-et-sion'],
    b('-tion [sjɔ̃] vs -sion [zjɔ̃] and -stion [tjɔ̃]', '-tion [sjɔ̃] contre -sion [zjɔ̃] et -stion [tjɔ̃]'),
    b('Say -tion and -sion with crisp French [s]/[z] + [jɔ̃] instead of English « shun ».', 'Dire -tion et -sion avec [s]/[z] + [jɔ̃] français, jamais comme « shun ».'),
    [b('Pronounce -tion as [sjɔ̃] (nation, station)', 'Prononcer -tion en [sjɔ̃] (nation, station)'), b('Pronounce vowel + -sion as [zjɔ̃] (décision, télévision)', 'Prononcer voyelle + -sion en [zjɔ̃] (décision, télévision)'), b('Keep [t] in -stion (question, suggestion)', 'Garder le [t] dans -stion (question, suggestion)')],
    13,
    [
      card(b('Three rules for -tion and -sion', 'Trois règles pour -tion et -sion'), b('**-tion** almost always sounds **[sjɔ̃]** (**une nation, la station, l’attention**)—never « ch/sh »! Exception after **s**: **-stion = [stjɔ̃]** (**la question, une suggestion, la digestion**). **-sion** after a vowel sounds **[zjɔ̃]** (**la décision, la télévision, une occasion**), while **-ssion** stays **[sjɔ̃]** (**la mission, une passion**).', '**-tion** se dit presque toujours **[sjɔ̃]** (**une nation, la station, l’attention**) — jamais « ch » ! Exception après **s** : **-stion = [stjɔ̃]** (**la question, une suggestion, la digestion**). **-sion** après une voyelle se dit **[zjɔ̃]** (**la décision, la télévision, une occasion**), tandis que **-ssion** reste **[sjɔ̃]** (**la mission, une passion**).'), {
        ex: [['la nation, la station, la mission', '[sjɔ̃]'], ['la décision, la télévision, l’occasion', '[zjɔ̃]'], ['la question, la suggestion', '[stjɔ̃]']],
      }),
      trap(b('Never say « -shun »!', 'Jamais de « ch » anglais !'), b('English speakers often turn *nation* or *télévision* into « nay-shun ». Keep the tongue behind the teeth for crisp **[s]** or voiced **[z]**, add a quick **y** [j], and finish on rounded nasal **[ɔ̃]**!', 'Évitez le « ch » anglais dans *nation* ou *télévision*. Gardez la langue derrière les dents pour un **[s]** ou **[z]** net, ajoutez un léger **y** [j], et terminez sur la nasale ronde **[ɔ̃]** !')),
      hear('C’est une excellente décision pour l’éducation nationale.', b('Listen. Does « décision » end with [zjɔ̃] or [sjɔ̃]?', 'Écoutez. « décision » finit-il par [zjɔ̃] ou [sjɔ̃] ?'), [b('[zjɔ̃]: voiced z + [jɔ̃]', '[zjɔ̃] : z sonore + [jɔ̃]'), b('[sjɔ̃]: unvoiced s + [jɔ̃]', '[sjɔ̃] : s sourd + [jɔ̃]'), b('[ʃɔ̃]: English-style ch', '[ʃɔ̃] : chuintante ch'), b('[tjɔ̃]: pronounced t', '[tjɔ̃] : t prononcé')], { voice: 'f' }),
      sort(b('Sort by ending sound: [sjɔ̃], [zjɔ̃] or [stjɔ̃]?', 'Classez par son final : [sjɔ̃], [zjɔ̃] ou [stjɔ̃] ?'), [b('[sjɔ̃] (-tion / -ssion)', '[sjɔ̃] (-tion / -ssion)'), b('[zjɔ̃] (vowel + -sion)', '[zjɔ̃] (voyelle + -sion)'), b('[stjɔ̃] (-stion)', '[stjɔ̃] (-stion)')], [['la nation', 0], ['la décision', 1], ['la question', 2], ['la mission', 0], ['la télévision', 1], ['la suggestion', 2]], { listen: true }),
      mc(P.choose, [b('[kɛstjɔ̃]: t is pronounced after s', '[kɛstjɔ̃] : le t se prononce après s'), b('[kɛsjɔ̃]: t is silent as in nation', '[kɛsjɔ̃] : le t est muet comme dans nation'), b('[kɛʃɔ̃]: pronounced like English sh', '[kɛʃɔ̃] : comme en anglais'), b('[kɛstjɑ̃]: ends in [ɑ̃]', '[kɛstjɑ̃] : finit en [ɑ̃]')], { fr: 'Comment se prononce « la question » ?' }),
      dict('La télévision pose une question sur cette décision nationale.', { voice: 'm' }),
      say('J’ai une question importante sur la décision et la mission de la station.', 'I have an important question about the station’s decision and mission.', { tip: b('Keep [t] in question; crisp [s] in station/mission; voiced [z] in décision.', 'Gardez [t] dans question ; [s] dans station/mission ; [z] sonore dans décision.') }),
    ],
    [
      b('-tion and -ssion → [sjɔ̃] (never English -shun).', '-tion et -ssion → [sjɔ̃] (jamais « ch » anglais).'),
      b('Vowel + -sion → [zjɔ̃] (décision, télévision, occasion).', 'Voyelle + -sion → [zjɔ̃] (décision, télévision, occasion).'),
      b('-stion keeps [t] → [stjɔ̃] (question, suggestion).', '-stion garde le [t] → [stjɔ̃] (question, suggestion).'),
    ],
    [['une décision', b('a decision', 'choix arrêté')], ['une suggestion', b('a suggestion', 'proposition soumise')], ['une occasion', b('an opportunity', 'moment favorable')]],
  ),
  lesson(C, 2, ['the-ille-trap-fille-vs-ville', 'le-piege-de-ille-fille-ou-ville'],
    b('-ille: [ij] (fille) vs [il] (ville, mille, tranquille)', '-ille : [ij] (fille) contre [il] (ville, mille, tranquille)'),
    b('Stop pronouncing a hard l in fille while keeping crisp [l] in ville, mille and tranquille.', 'Éviter le l dans fille tout en gardant un [l] net dans ville, mille et tranquille.'),
    [b('Hear and say -ille = [ij] (fille, bille, famille)', 'Entendre et dire -ille = [ij] (fille, bille, famille)'), b('Keep [il] in the key exceptions (ville, mille, tranquille)', 'Garder [il] dans les exceptions (ville, mille, tranquille)'), b('Contrast gentil (silent l) with gentille ([j])', 'Distinguer gentil (l muet) et gentille ([j])')],
    13,
    [
      card(b('Fille [ij] vs Ville [il]', 'Fille [ij] contre Ville [il]'), b('In most words, **-ille** sounds **[ij]**—no [l] sound at all: **une fille, la famille, une bille, briller, habiller**. A small, high-frequency group keeps **[il]**: **la ville, le village, mille, tranquille, un million, Lille**. Notice **gentil**: masculine ends in silent *l* (**[ʒɑ̃ti]**), while feminine **gentille** adds **[j]** (**[ʒɑ̃tij]**)!', 'Dans la plupart des mots, **-ille** se dit **[ij]** sans aucun [l] : **une fille, la famille, une bille, briller, habiller**. Quelques mots fréquents gardent **[il]** : **la ville, le village, mille, tranquille, un million, Lille**. Notez **gentil** [ʒɑ̃ti] (l muet) contre **gentille** [ʒɑ̃tij] !'), {
        ex: [['une fille, la famille, une bille', '[ij]'], ['une ville, mille, tranquille', '[il]'], ['un garçon gentil / une fille gentille', '[i] vs [ij]']],
      }),
      trap(b('One letter changes daughter into city!', 'Une lettre change la fille en ville !'), b('Saying *la fille* with an [l] sounds like *la ville*; saying *la ville* with [j] sounds like *la vie* (life) or *la fille*! Drill the pair **la fille / la ville** aloud.', 'Dire *la fille* avec un [l] la fait ressembler à *la ville* ; dire *la ville* avec [j] brouille *la vie* et *la fille* ! Travaillez la paire **la fille / la ville**.')),
      hear('Ma fille préfère vivre dans un village tranquille.', b('Listen. How many words here use [ij] vs [il]?', 'Écoutez. Quels mots ont [ij] et lesquels ont [il] ?'), [b('fille has [ij]; village and tranquille have [il]', 'fille a [ij] ; village et tranquille ont [il]'), b('All three have [ij]', 'Tous trois ont [ij]'), b('All three have [il]', 'Tous trois ont [il]'), b('fille has [il]; village and tranquille have [ij]', 'fille a [il] ; village et tranquille ont [ij]')], { voice: 'm2' }),
      sort(b('Sort by ending sound: [ij] or [il]?', 'Classez par son : [ij] ou [il] ?'), [b('[ij] (like fille)', '[ij] (comme fille)'), b('[il] (like ville)', '[il] (comme ville)')], [['une fille', 0], ['une ville', 1], ['la famille', 0], ['tranquille', 1], ['s’habiller', 0], ['un village', 1]], { listen: true }),
      pairs(b('Match each word with its minimal or grammar pair.', 'Associez chaque mot à sa paire sonore ou grammaticale.'), [['la fille', 'la ville'], ['un garçon gentil', 'une fille gentille'], ['une bille', 'un village'], ['briller', 'tranquille']], true),
      dict('La gentille fille habite dans une petite ville tranquille.', { voice: 'f2' }),
      say('Mille familles vivent dans cette ville tranquille, et ma gentille fille y travaille.', 'A thousand families live in this quiet city, and my kind daughter works there.', { tip: b('Keep [l] in mille, ville, tranquille; glide [j] in familles, gentille, fille, travaille.', 'Gardez [l] dans mille, ville, tranquille ; glissez [j] dans familles, gentille, fille, travaille.') }),
    ],
    [
      b('Most -ille words sound [ij] (fille, famille, bille, briller).', 'La plupart des mots en -ille se disent [ij] (fille, famille, bille).'),
      b('Key [il] words: ville, village, mille, tranquille, million, Lille.', 'Mots en [il] : ville, village, mille, tranquille, million, Lille.'),
      b('gentil [ʒɑ̃ti] (silent l) vs gentille [ʒɑ̃tij] ([j] sound).', 'gentil [ʒɑ̃ti] (l muet) contre gentille [ʒɑ̃tij] (son [j]).'),
    ],
    [['une bille', b('a marble (toy)', 'petite boule en verre')], ['briller', b('to shine', 'émettre de la lumière')], ['tranquille', b('quiet, calm', 'calme, paisible')]],
  ),
  lesson(C, 3, ['silent-ent-vs-nasal-ent', 'ent-muet-contre-ent-nasal'],
    b('-ent: silent in verbs vs [ɑ̃] in nouns and adverbs', '-ent : muet dans les verbes, [ɑ̃] dans noms et adverbes'),
    b('Never pronounce -ent in ils/elles verbs, even when an identical noun or adjective uses [ɑ̃].', 'Ne jamais dire -ent dans les verbes en ils/elles, même face à un nom ou adjectif identique.'),
    [b('Silence -ent in 3rd-person plural verbs (ils président)', 'Taire -ent dans les verbes à la 3e personne du pluriel'), b('Keep nasal [ɑ̃] in nouns, adjectives and adverbs (président, souvent)', 'Garder [ɑ̃] dans les noms, adjectifs et adverbes'), b('Read famous homograph traps aloud accurately', 'Lire juste les célèbres homographes pièges')],
    13,
    [
      card(b('Same letters, two worlds', 'Mêmes lettres, deux prononciations'), b('In **ils/elles verbs**, **-ent** is **100% silent**: **ils président** = *il préside* [pʁezid], **ils excellent** = *il excelle* [ɛksɛl], **elles résident** = *elle réside* [ʁezid], **ils négligent** = *il néglige*. In **nouns, adjectives and adverbs**, **-ent** sounds **[ɑ̃]**: **un président** [pʁezidɑ̃], **excellent** [ɛksɛlɑ̃], **un résident** [ʁezidɑ̃], **lentement** [lɑ̃tmɑ̃].', 'Dans un **verbe (ils/elles)**, **-ent** est **100 % muet** : **ils président** [pʁezid], **ils excellent** [ɛksɛl], **elles résident** [ʁezid]. Dans un **nom, adjectif ou adverbe**, **-ent** se dit **[ɑ̃]** : **un président** [pʁezidɑ̃], **excellent** [ɛksɛlɑ̃], **un résident** [ʁezidɑ̃], **lentement** [lɑ̃tmɑ̃].'), {
        ex: [['le président / ils président', '[pʁezidɑ̃] vs [pʁezid]'], ['un repas excellent / ils excellent', '[ɛksɛlɑ̃] vs [ɛksɛl]'], ['un étudiant négligent / ils négligent', '[neɡliʒɑ̃] vs [neɡliʒ]']],
      }),
      trap(b('Sometimes the vowel before -ent shifts too!', 'Parfois la voyelle précédente change aussi !'), b('In **ils précèdent** (verb, *they precede*), the accent becomes **è** [ɛ] and **-ent** is silent (**[pʁesɛd]**). In **le précédent** (noun/adjective), **é** stays closed [e] and **-ent** is **[ɑ̃]** (**[pʁesedɑ̃]**)!', 'Dans **ils précèdent** (verbe), on prononce **è** [ɛ] avec **-ent** muet (**[pʁesɛd]**). Dans **le précédent** (nom/adjectif), **é** reste fermé [e] et **-ent** se dit **[ɑ̃]** (**[pʁesedɑ̃]**) !')),
      hear('Les anciens présidents président souvent la cérémonie.', b('Listen. How are « présidents » and « président » pronounced?', 'Écoutez. Comment se prononcent « présidents » et « président » ?'), [b('présidents ends in [ɑ̃]; président ends in [d] (silent -ent)', 'présidents finit en [ɑ̃] ; président finit en [d] (-ent muet)'), b('Both words end in [ɑ̃]', 'Les deux mots finissent en [ɑ̃]'), b('présidents ends in [d]; président ends in [ɑ̃]', 'présidents finit en [d] ; président finit en [ɑ̃]'), b('Both words end in [t]', 'Les deux mots finissent en [t]')], { voice: 'f' }),
      sort(b('Silent -ent (verb) or nasal [ɑ̃] (noun/adj/adv)?', '-ent muet (verbe) ou nasal [ɑ̃] (nom/adj/adv) ?'), [b('silent (verb)', 'muet (verbe)'), b('[ɑ̃] (noun / adj / adv)', '[ɑ̃] (nom / adj / adv)')], [['ils décident', 0], ['souvent', 1], ['elles résident', 0], ['le président', 1], ['ils excellent', 0], ['vraiment', 1]], { listen: true }),
      mc(P.choose, [b('[ɛksɛlɑ̃] for the adjective; [ɛksɛl] for the verb', '[ɛksɛlɑ̃] pour l’adjectif ; [ɛksɛl] pour le verbe'), b('Both sound [ɛksɛlɑ̃]', 'Les deux sonnent [ɛksɛlɑ̃]'), b('Both sound [ɛksɛl]', 'Les deux sonnent [ɛksɛl]'), b('The verb adds a final [t] sound: [ɛksɛlɑ̃t]', 'Le verbe ajoute un [t] final : [ɛksɛlɑ̃t]')], { fr: 'Comment distinguer « un film excellent » et « ils excellent en musique » ?' }),
      dict('Nos voisins excellent en cuisine et reçoivent souvent leurs amis.', { voice: 'm' }),
      say('Les résidents résident ici, et les présidents président vraiment la séance.', 'The residents reside here, and the presidents truly chair the session.', { tip: b('Silence -ent on résident (verb) and président (verb); resonate [ɑ̃] on résidents, présidents and vraiment.', 'Coupez le -ent des verbes résident et président ; gardez [ɑ̃] sur résidents, présidents et vraiment.') }),
    ],
    [
      b('Verb -ent (ils/elles) is always silent: ils président [pʁezid].', 'Le -ent d’un verbe (ils/elles) est toujours muet : ils président.'),
      b('Noun/adjective/adverb -ent sounds [ɑ̃]: un président, vraiment.', 'Le -ent d’un nom, adjectif ou adverbe sonne [ɑ̃] : un président, vraiment.'),
      b('Watch stem shifts too: le précédent [e...ɑ̃] vs ils précèdent [ɛ].', 'Attention aussi au radical : le précédent contre ils précèdent.'),
    ],
    [['présider', b('to chair, preside over', 'diriger une réunion')], ['résider', b('to reside, live', 'habiter quelque part')], ['exceller', b('to excel', 'être très bon en quelque chose')]],
  ),
];
