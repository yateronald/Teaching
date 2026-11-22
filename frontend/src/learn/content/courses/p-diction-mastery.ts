import type { CourseAbout } from '../../types';
import { b, card, culture, dict, doc, gap, hear, lesson, mc, P, pairs, say, sort, trap } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'At C2 level, pronunciation shifts from « being understood » to broadcast-grade precision: choosing refined optional liaisons without slipping into pedantry, mastering silent letters in learned words like aspect and instinct, handling diérèse and plural -es in classical verse, and nailing tricky orthoepy like gageure and ambiguïté.',
    'Au niveau C2, la prononciation passe de la simple intelligibilité à la maîtrise radiophonique : doser les liaisons savantes sans pédanterie, maîtriser les lettres muettes des mots abstraits (aspect, instinct), respecter diérèse et -es pluriel en poésie, et déjouer les pièges d’orthoépie comme gageure ou ambiguïté.',
  ),
  outcomes: [
    b('Dose formal and literary liaisons accurately (quant‿à, tout‿entier, neuf‿heures)', 'Doser les liaisons soutenues avec justesse (quant‿à, tout‿entier)'),
    b('Avoid pronouncing silent letters in learned vocabulary (aspect, instinct, dompter)', 'Éviter de prononcer les lettres muettes des mots savants (aspect, instinct, dompter)'),
    b('Count and perform diérèse, e caduc and plural -es in classical verse', 'Réaliser diérèse, e caduc et -es pluriel dans le vers classique'),
    b('Produce standard educated orthoepy (gageure, aiguille, mœurs) with broadcast clarity', 'Maîtriser l’orthoépie exigeante (gageure, aiguille, mœurs) avec clarté'),
  ],
};

const C = 'p-diction-mastery';
export default [
  lesson(C, 1, ['learned-and-literary-liaisons', 'liaisons-savantes-et-pieges'],
    b('Learned liaisons and silent-letter traps', 'Liaisons savantes et pièges de diction'),
    b('Master elevated liaisons, neuf [v] vs [f], and silent consonants in abstract nouns.', 'Maîtriser liaisons soutenues, neuf [v]/[f] et consonnes muettes des mots abstraits.'),
    [b('Place literary liaisons cleanly (quant‿à, tout‿entier, faut-il‿y)', 'Placer les liaisons soutenues (quant‿à, tout‿entier, faut-il‿y)'), b('Distinguish neuf‿ans [v] from neuf‿euros [f]', 'Distinguer neuf‿ans [v] et neuf‿euros [f]'), b('Keep final -ct / -pt silent in aspect, respect, instinct, prompt', 'Taire -ct / -pt dans aspect, respect, instinct, prompt')],
    13,
    [
      card(b('Register, liaisons and silent clusters', 'Registre, liaisons et groupes muets'), b('Formal French welcomes **quant‿à** [kɑ̃ta], **tout‿entier** [tutɑ̃tje], **sans‿aucun doute** [sɑ̃zokœ̃], **de plus‿en plus** and verb inversions (**faut-il‿espérer ?**). Recall **neuf**: **f → [v]** only before **ans, heures** (**neuf‿ans, neuf‿heures**), while keeping **[f]** elsewhere (**neuf‿euros** [nœføʁo], **neuf‿autres**). Meanwhile, never sound the final letters in **l’aspect** [aspɛ], **le respect** [ʁɛspɛ], **l’instinct** [ɛ̃stɛ̃], **prompt** [pʁɔ̃], **dompter** [dɔ̃te], **un sculpteur** [skyltœʁ].', 'Le registre soutenu pratique volontiers **quant‿à**, **tout‿entier**, **sans‿aucun doute**, **de plus‿en plus** et **faut-il‿espérer ?**. Pour **neuf**, **f → [v]** uniquement devant **ans, heures** (**neuf‿ans, neuf‿heures**), et garde **[f]** ailleurs (**neuf‿euros**). Par ailleurs, gardez muettes les finales de **l’aspect** [aspɛ], **le respect** [ʁɛspɛ], **l’instinct** [ɛ̃stɛ̃], **prompt** [pʁɔ̃], **dompter** [dɔ̃te], **un sculpteur** [skyltœʁ].'), {
        ex: [['quant à ce point, tout entier', 'quant‿à, tout‿entier'], ['neuf heures, neuf euros', '[v] in neuf‿heures vs [f] in neuf‿euros'], ['le respect, exact', 'silent -ct [ʁɛspɛ] vs [ɛɡzakt]']],
      }),
      trap(b('Silent -ct vs sounded -ct!', '-ct muet contre -ct prononcé !'), b('Don’t confuse **aspect, respect, suspect, instinct** (where **-ct is silent**: [aspɛ], [ʁɛspɛ], [syspɛ], [ɛ̃stɛ̃]) with **direct, exact, intact, contact** (where **[kt] is pronounced**!).', 'Ne confondez pas **aspect, respect, suspect, instinct** (où **-ct est muet** : [aspɛ], [ʁɛspɛ], [syspɛ], [ɛ̃stɛ̃]) avec **direct, exact, intact, contact** (où **[kt] se prononce** !).')),
      hear('Cet aspect mérite un respect absolu, même si le délai reste strict.', b('Listen. In which word are the final consonants pronounced?', 'Écoutez. Dans quel mot les consonnes finales se prononcent-elles ?'), [b('strict [stʁikt]: c and t pronounced', 'strict [stʁikt] : c et t prononcés'), b('aspect: c and t pronounced', 'aspect : c et t prononcés'), b('respect: c and t pronounced', 'respect : c et t prononcés'), b('None, all three end in a vowel sound', 'Aucun, les trois finissent sur une voyelle')], { voice: 'm' }),
      sort(b('Final -ct: silent or pronounced [kt]?', '-ct final : muet ou prononcé [kt] ?'), [b('-ct silent', '-ct muet'), b('-ct pronounced [kt]', '-ct prononcé [kt]')], [['le respect', 0], ['direct', 1], ['l’instinct', 0], ['exact', 1], ['l’aspect', 0], ['le contact', 1]], { listen: true }),
      mc(P.choose, [b('[nœvɑ̃] and [nœføʁo]', '[nœvɑ̃] et [nœføʁo]'), b('[nœfɑ̃] and [nœvøʁo]', '[nœfɑ̃] et [nœvøʁo]'), b('[nœvɑ̃] and [nœvøʁo]', '[nœvɑ̃] et [nœvøʁo]'), b('[nøzɑ̃] and [nøzøʁo]', '[nøzɑ̃] et [nøzøʁo]')], { fr: 'Comment se lient « neuf ans » et « neuf euros » ?' }),
      dict('Quant à ce sculpteur, son instinct et son respect restent intacts.', { voice: 'f' }),
      say('Quant à cet aspect précis, il faut dompter son instinct et garder un respect intact.', 'As for this specific aspect, one must tame one’s instinct and keep intact respect.', { tip: b('Link quant‿à; silence p in dompter and ct in aspect, instinct, respect; sound [kt] in intact.', 'Liez quant‿à ; taisez p dans dompter et ct dans aspect, instinct, respect ; dites [kt] dans intact.') }),
    ],
    [
      b('Formal liaisons: quant‿à, tout‿entier, sans‿aucun, de plus‿en plus.', 'Liaisons soutenues : quant‿à, tout‿entier, sans‿aucun, de plus‿en plus.'),
      b('neuf → [v] only in neuf ans / neuf heures; [f] in neuf euros.', 'neuf → [v] devant ans/heures seulement ; [f] dans neuf euros.'),
      b('Silent -ct: aspect, respect, instinct, suspect; sounded -ct: exact, direct, strict, intact.', '-ct muet : aspect, respect, instinct, suspect ; -ct prononcé : exact, direct, strict, intact.'),
    ],
    [['l’aspect', b('aspect, appearance', 'apparence ou angle d’analyse')], ['dompter', b('to tame, subdue', 'maîtriser par la force')], ['un sculpteur', b('a sculptor', 'artiste qui façonne la pierre ou le bois')]],
  ),
  lesson(C, 2, ['e-caduc-and-dieresis-in-verse', 'e-caduc-et-dierese-en-poesie'],
    b('E caduc, diérèse and plural -es in classical verse', 'E caduc, diérèse et -es pluriel en poésie'),
    b('Handle poetic syllable counts, plural -es liaisons and diérèse without sing-song monotony.', 'Maîtriser décompte syllabique, -es pluriel et diérèse sans psalmodier le vers.'),
    [b('Keep plural -es sounded and linked before vowels in verse (vastes‿oiseaux)', 'Maintenir le -es pluriel compté et lié devant voyelle en poésie'), b('Distinguish poetic diérèse (li-on, na-ti-on) from prose synérèse', 'Distinguer diérèse poétique (li-on, na-ti-on) et synérèse courante'), b('Respect enjambement across line breaks without robotic pauses', 'Respecter l’enjambement sans hacher le sens')],
    13,
    [
      card(b('Diérèse and plural -es in verse', 'Diérèse et -es pluriel dans le vers'), b('Classical French poetry reveals two C2 subtleties: **1. Plural -es before a vowel**: unlike singular *-e* (which elides before a vowel), plural **-es** **cannot elide** because of the *s*, so it **counts as a syllable and links in [z]**: **vastes‿oiseaux** = *vas-te-zoi-seaux* (4 syllables!). **2. Diérèse**: clusters like *io, ia, uie* often split into **two syllables** in verse: **na-ti-on** (3), **pas-si-on** (3), **li-on** (2).', 'La poésie classique révèle deux finesses C2 : **1. Le -es pluriel devant voyelle** ne peut pas s’élider à cause du *s* : il **compte comme une syllabe et fait la liaison [z]** (**vastes‿oiseaux** = *vas-te-zoi-seaux*). **2. La diérèse** sépare deux voyelles réunies : **na-ti-on**, **pas-si-on**, **li-on**.'), {
        ex: [['vastes oiseaux, gouffres amers', 'plural -es stays (4 syllables) + links [z]'], ['un lion, une passion', 'diérèse splits glide (li-on, pas-si-on)']],
      }),
      culture(b('Don’t chant the rhyme!', 'Évitez de psalmodier !'), b('Bad verse reading drops like a hammer after every line break. When **enjambement** carries grammar onto the next line (*les hommes d’équipage / Prennent des albatros*), sustain the pitch gently across the line break instead of dropping as if there were a full stop.', 'Ne tombez pas comme un couperet à chaque fin de vers ! Quand un **enjambement** prolonge la phrase au vers suivant (*les hommes d’équipage / Prennent des albatros*), gardez un léger suspens de voix au bout du vers.')),
      doc({ look: 'page', title: b('Charles Baudelaire, 1857 (public domain)', 'Charles Baudelaire, 1857 (domaine public)'), text: 'Souvent, pour s’amuser, les hommes d’équipage\nPrennent des albatros, vastes oiseaux des mers,\nQui suivent, indolents compagnons de voyage,\nLe navire glissant sur les gouffres amers.', source: b('Les Fleurs du mal, « L’Albatros »', 'Les Fleurs du mal, « L’Albatros »') }, b('In line 2, why do « vastes » and « gouffres » (line 4) keep their e pronounced before « oiseaux » and « amers »?', 'Pourquoi les e de « vastes » (v. 2) et « gouffres » (v. 4) restent-ils prononcés devant « oiseaux » et « amers » ?'), [b('Because the plural -s prevents elision and creates a [z] liaison', 'Parce que le -s du pluriel empêche l’élision et entraîne une liaison [z]'), b('Because « oiseaux » and « amers » start with an h aspiré', 'Parce que « oiseaux » et « amers » ont un h aspiré'), b('Because poetic metre never drops any e anywhere', 'Parce que la poésie ne supprime jamais aucun e'), b('Because singular feminine endings always stay before vowels', 'Parce que tout e singulier reste toujours devant une voyelle')], { }),
      mc(P.choose, [b('Splitting a glide into two syllables for the metre (e.g. pas-si-on = 3 syllables)', 'Séparer une semi-voyelle en deux syllabes pour le mètre (ex. pas-si-on)'), b('Dropping an unaccented final e at the end of an alexandrine', 'Supprimer un e final en fin d’alexandrin'), b('Adding a false [t] consonant between two words', 'Ajouter un [t] fautif entre deux mots'), b('Replacing a formal liaison with a silent pause', 'Remplacer une liaison soutenue par une pause')], { fr: 'Qu’est-ce que la « diérèse » en diction poétique ?' }),
      gap(P.complete, 'Dans un alexandrin, la liaison du pluriel « les gouffres amers » fait entendre le son ___ et compte ___ syllabes.', ['[z]', '4'], { choices: [['[z]', '[s]', '[t]'], ['4', '3', '5']] }),
      dict('Souvent, pour s’amuser, les hommes d’équipage prennent des albatros.', { voice: 'm2' }),
      say('Prennent des albatros, vastes oiseaux des mers, sur les gouffres amers.', 'Catch albatrosses, vast birds of the seas, over the bitter chasms.', { tip: b('Sound vastes‿oiseaux [vastəzwazo] and gouffres‿amers [ɡufʁəzamɛʁ] smoothly.', 'Réalisez sans lourdeur vastes‿oiseaux [vastəzwazo] et gouffres‿amers [ɡufʁəzamɛʁ].') }),
    ],
    [
      b('Plural -es before a vowel stays counted and triggers a [z] liaison (vastes‿oiseaux).', 'Le -es pluriel devant voyelle reste compté et fait la liaison [z].'),
      b('Diérèse expands a glide into two syllables when the verse requires it (li-on).', 'La diérèse dédouble une semi-voyelle selon le mètre (li-on).'),
      b('Respect enjambement: carry breath gently across the line break.', 'Respectez l’enjambement : gardez un léger suspens en fin de vers.'),
    ],
    [['la diérèse', b('diaeresis (splitting vowels into 2 syllables)', 'prononciation en deux syllabes de deux voyelles')], ['l’enjambement', b('enjambement (sentence running across line break)', 'rejet syntaxique au vers suivant')], ['un gouffre', b('an abyss, chasm', 'abîme profond')]],
  ),
  lesson(C, 3, ['broadcast-clarity-and-orthoepy', 'clarte-radiophonique-et-orthoepie'],
    b('Broadcast-grade diction and orthoepy', 'Clarté radiophonique et orthoépie'),
    b('Nail rare orthoepic traps (gageure, aiguille, mœurs) and sustain crisp studio diction.', 'Déjouer les pièges d’orthoépie (gageure, aiguille, mœurs) avec une diction nette.'),
    [b('Pronounce classic orthoepic traps (gageure, aiguille, mœurs, linguiste)', 'Prononcer sans faute les pièges d’orthoépie (gageure, aiguille, mœurs)'), b('Keep crisp consonant release in long periodic sentences', 'Maintenir la netteté des consonnes en phrase longue'), b('Avoid slurring unstressed endings in formal reading', 'Éviter d’avaler les fins de phrases soutenues')],
    13,
    [
      card(b('Orthoepy: the finest traps', 'Orthoépie : les pièges de haut niveau'), b('Even native broadcasters pause over **orthoépie** (standard learned pronunciation): **une gageure** = **[ɡaʒyʁ]** (the *eu* is actually pure **[y]**—*u* marks hard *g* before *e*, NOT the vowel *eu*!), **l’aiguille** = **[eɡɥij]** (*ui* after *g* is pronounced **[ɥi]**, just like **un linguiste** [lɛ̃ɡɥist] and **l’ambiguïté** [ɑ̃biɡɥite]), **les mœurs** = **[mœʁs]** (or [mœʁ]), **quasi** = **[kazi]**, **omnibus** = **[ɔmnibys]**.', 'Même les présentateurs surveillent l’**orthoépie** : **une gageure** = **[ɡaʒyʁ]** (le *e* adoucit *g*, la voyelle reste **[y]** !), **l’aiguille** = **[eɡɥij]** (*ui* s’entend **[ɥi]**, comme dans **un linguiste** et **l’ambiguïté**), **les mœurs** = **[mœʁs]**, **quasi** = **[kazi]**, **omnibus** = **[ɔmnibys]**.'), {
        ex: [['une gageure', '[ɡaʒyʁ]: rhymes with « figure », NOT « heure »'], ['une aiguille, un linguiste', '[eɡɥij], [lɛ̃ɡɥist]: [ɥ] after g'], ['les mœurs, quasi', '[mœʁs], [kazi]: voiced/clear endings']],
      }),
      trap(b('Why « gageure » is NOT « ga-jeur »!', 'Pourquoi « gageure » ne rime pas avec « heure » !'), b('In French spelling, **ge + a/o/u** only puts an *e* after *g* so *g* sounds **[ʒ]** (like *mangeons* or *il nagea*). So **gageure** is *gaj + ure* = **[ɡaʒyʁ]**, rhyming with **nature**! Today, the 1990 spelling *gageüre* clarifies it visually.', 'Dans **gageure**, le *e* sert uniquement à adoucir le *g* en **[ʒ]** (comme *mangeons*). Le suffixe reste **-ure** : **[ɡaʒyʁ]**, comme **nature** (rectifié en *gageüre* en 1990).')),
      hear('Ce linguiste relève sans ambiguïté la gageure d’un tel chantier.', b('Listen. How is « linguiste » pronounced?', 'Écoutez. Comment se prononce « linguiste » ?'), [b('[lɛ̃ɡɥist]: both g and [ɥi] are heard', '[lɛ̃ɡɥist] : g et [ɥi] s’entendent'), b('[lɛ̃ɡist]: silent u, like guitare', '[lɛ̃ɡist] : u muet comme dans guitare'), b('[lɛ̃ʒist]: soft g [ʒ]', '[lɛ̃ʒist] : g doux [ʒ]'), b('[lɛ̃ɡwist]: back glide [w]', '[lɛ̃ɡwist] : glissement arrière [w]')], { voice: 'f2' }),
      mc(P.choose, [b('[ɡaʒyʁ]: rhymes with « la nature »', '[ɡaʒyʁ] : rime avec « la nature »'), b('[ɡaʒœʁ]: rhymes with « la chaleur »', '[ɡaʒœʁ] : rime avec « la chaleur »'), b('[ɡaɡœʁ]: hard g + [œʁ]', '[ɡaɡœʁ] : g dur + [œʁ]'), b('[ɡaʒøʁ]: closed [ø]', '[ɡaʒøʁ] : [ø] fermé')], { fr: 'Quelle est la prononciation de référence de « une gageure » ?' }),
      pairs(b('Match each orthoepy trap with a word sharing its exact vowel/glide.', 'Associez chaque mot piège à un mot partageant exactement sa voyelle ou son glissement.'), [['une gageure', 'la nature'], ['une aiguille', 'la cuisine'], ['un linguiste', 'la nuit'], ['quasi', 'le casier']], true),
      dict('Ce linguiste lève toute ambiguïté sur nos mœurs et ce défi.', { voice: 'm' }),
      say('Tenir ce pari sans aucune ambiguïté est une véritable gageure pour ce linguiste.', 'Keeping this bet without any ambiguity is a real challenge for this linguist.', { tip: b('Hear [ɑ̃biɡɥite], [ɡaʒyʁ] (pure [y]!), and [lɛ̃ɡɥist] clearly at studio pace.', 'Détachez nettement [ɑ̃biɡɥite], [ɡaʒyʁ] ([y] pur !) et [lɛ̃ɡɥist] à débit radiophonique.') }),
    ],
    [
      b('gageure = [ɡaʒyʁ] (rhymes with nature—e only softens the g).', 'gageure = [ɡaʒyʁ] (rime avec nature — le e adoucit seulement g).'),
      b('aiguille [eɡɥij], linguiste [lɛ̃ɡɥist], ambiguïté [ɑ̃biɡɥite] all pronounce [ɥ].', 'aiguille, linguiste et ambiguïté font tous entendre [ɥ].'),
      b('Broadcast clarity relies on crisp consonant release through the very last syllable.', 'La clarté radiophonique exige des consonnes nettes jusqu’à la dernière syllabe.'),
    ],
    [['une gageure', b('a bold gamble, near-impossible feat', 'pari difficile, défi risqué')], ['une aiguille', b('a needle / clock hand', 'fine tige métallique')], ['les mœurs', b('customs, morals', 'habitudes morales et sociales')]],
  ),
];
