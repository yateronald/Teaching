import type { CourseAbout } from '../../types';
import { b, card, hear, lesson, mc, P, say, sort } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Even advanced learners stumble on words whose pronunciation does not follow the spelling: fils, os, août, second, monsieur, oignon, femme, gars, Saint-Saëns, Montaigne, or acronyms like SNCF, ONU, PDG. This C1 course gathers the most frequent pronunciation traps: irregular words, words with two pronunciations, proper names of people and places, loanwords, and acronyms that are spelled out or read as words.',
    'Même les apprenants avancés trébuchent sur des mots dont la prononciation ne suit pas l’orthographe : fils, os, août, second, monsieur, oignon, femme, gars, Saint-Saëns, Montaigne, ou des sigles comme SNCF, ONU, PDG. Ce cours de niveau C1 rassemble les pièges de prononciation les plus fréquents : mots irréguliers, mots à double prononciation, noms propres de personnes et de lieux, emprunts, et sigles épelés ou lus comme des mots.',
  ),
  outcomes: [
    b('Pronounce frequent irregular words', 'Prononcer les mots irréguliers fréquents'),
    b('Handle words with two pronunciations', 'Gérer les mots à double prononciation'),
    b('Say common proper names correctly', 'Dire correctement des noms propres courants'),
    b('Read acronyms and loanwords', 'Lire sigles et emprunts'),
  ],
};

const C = 'p-tricky-words';
export default [
  lesson(C, 1, ['irregular-everyday-words', 'mots-courants-irreguliers'],
    b('Irregular everyday words', 'Les mots courants irréguliers'),
    b('Master the frequent words whose spelling misleads.', 'Maîtriser les mots fréquents dont l’orthographe trompe.'),
    [b('Know the classic traps', 'Connaître les pièges classiques'), b('Distinguish homographs', 'Distinguer les homographes'), b('Say them in context', 'Les dire en contexte')],
    13,
    [
      card(b('Spelling ≠ sound', 'Orthographe ≠ son'), b('**monsieur** [məsjø] · **femme** [fam] · **second** [səɡɔ̃] · **oignon** [ɔɲɔ̃] · **août** [u] or [ut] · **gars** [ɡa] · **le fils** [fis] (son) / **les fils** [fil] (threads) · **un os** [ɔs] / **des os** [o] · **les poules du couvent couvent** · **le cerf** [sɛʁ] · **le tabac** [taba] · **l’estomac** [ɛstɔma].', '**monsieur** [məsjø] · **femme** [fam] · **second** [səɡɔ̃] · **oignon** [ɔɲɔ̃] · **août** [u] ou [ut] · **gars** [ɡa] · **le fils** [fis] (enfant) / **les fils** [fil] (de fer) · **un os** [ɔs] / **des os** [o] · **le cerf** [sɛʁ] · **le tabac** [taba] · **l’estomac** [ɛstɔma].'), {
        ex: [['Monsieur, votre femme vous attend.', '[məsjø] [fam]'], ['Il est arrivé second en août.', '[səɡɔ̃] [u]'], ['Une soupe à l’oignon', '[ɔɲɔ̃]']],
      }),
      mc(P.choose, ['[səɡɔ̃]', '[sekɔ̃]', '[səkɔnd]', '[seɡɔnd]'], { fr: 'Comment se prononce « second » ?' }),
      mc(P.choose, ['[fam]', '[fɛm]', '[fəm]', '[fem]'], { fr: 'Comment se prononce « femme » ?' }),
      sort(b('Which meaning? (les fils)', 'Quel sens ? (les fils)'), [b('[fis]: sons', '[fis] : enfants'), b('[fil]: threads, wires', '[fil] : fils de fer, électriques')], [['Ses deux fils sont médecins.', 0], ['Les fils électriques sont dénudés.', 1], ['Mon fils a dix ans.', 0], ['Des fils de laine colorés.', 1]]),
      hear('Monsieur Durand et sa femme arrivent en août avec leur fils.', b('Listen. Which pronunciation of « fils » do you hear?', 'Écoutez. Quelle prononciation de « fils » entendez-vous ?'), [b('[fis]: their son', '[fis] : leur fils (enfant)'), b('[fil]: threads', '[fil] : des fils')], { voice: 'm' }),
      say('Monsieur, votre femme et votre fils vous attendent depuis le second rendez-vous, en août.', 'Sir, your wife and son have been waiting for you since the second appointment, in August.'),
    ],
    [
      b('monsieur [məsjø], femme [fam], second [səɡɔ̃], oignon [ɔɲɔ̃].', 'monsieur [məsjø], femme [fam], second [səɡɔ̃], oignon [ɔɲɔ̃].'),
      b('fils: [fis] = son(s), [fil] = threads.', 'fils : [fis] = enfant(s), [fil] = fils de fer.'),
      b('un os [ɔs] / des os [o]; août [u] or [ut].', 'un os [ɔs] / des os [o] ; août [u] ou [ut].'),
    ],
    [['un cerf', b('a stag', 'grand animal de la forêt')], ['dénudé', b('stripped, bare', 'sans protection')], ['la laine', b('wool', 'poil du mouton')]],
  ),
  lesson(C, 2, ['proper-names', 'les-noms-propres'],
    b('Proper names: people and places', 'Les noms propres : personnes et lieux'),
    b('Pronounce well-known French names and place names.', 'Prononcer des noms de personnes et de lieux connus.'),
    [b('Say famous surnames', 'Dire des noms célèbres'), b('Say place names', 'Dire des noms de lieux'), b('Know silent and sounded final letters', 'Connaître les lettres finales muettes ou prononcées')],
    13,
    [
      card(b('Names that surprise', 'Des noms qui surprennent'), b('**Saint-Saëns** [sɛ̃sɑ̃s] · **Montaigne** [mɔ̃tɛɲ] · **Victor Hugo** [yɡo] (silent h) · **Camus** [kamy] · **Proust** [pʁust] · **Toulouse-Lautrec** [lotʁɛk] · **Reims** [ʁɛ̃s] · **Metz** [mɛs] · **Auxerre** [osɛʁ] · **Bruxelles** [bʁysɛl] · **Laon** [lɑ̃] · **Montréal** [mɔ̃ʁeal] · **Gatineau** [ɡatino].', '**Saint-Saëns** [sɛ̃sɑ̃s] · **Montaigne** [mɔ̃tɛɲ] · **Victor Hugo** [yɡo] (h muet) · **Camus** [kamy] · **Proust** [pʁust] · **Toulouse-Lautrec** [lotʁɛk] · **Reims** [ʁɛ̃s] · **Metz** [mɛs] · **Auxerre** [osɛʁ] · **Bruxelles** [bʁysɛl] · **Laon** [lɑ̃] · **Montréal** [mɔ̃ʁeal] · **Gatineau** [ɡatino].')),
      mc(P.choose, ['[bʁysɛl]', '[bʁyksɛl]', '[bʁyɡzɛl]', '[bʁuksɛl]'], { fr: 'Comment se prononce « Bruxelles » ?' }),
      mc(P.choose, ['[ʁɛ̃s]', '[ʁɛms]', '[ʁajms]', '[ʁim]'], { fr: 'Comment se prononce « Reims » ?' }),
      sort(b('Final s pronounced or silent?', 's final prononcé ou muet ?'), [b('pronounced', 'prononcé'), b('silent', 'muet')], [['Reims', 0], ['Paris', 1], ['Saint-Saëns', 0], ['Camus', 1], ['Metz (z → [s])', 0], ['Nantes', 1]]),
      hear('Nous irons de Bruxelles à Reims, puis à Metz.', b('Listen. In which city name is the x pronounced [s]?', 'Écoutez. Dans quel nom de ville le x se prononce-t-il [s] ?'), [b('Bruxelles', 'Bruxelles'), b('Reims', 'Reims'), b('Metz', 'Metz'), b('none', 'aucune')]),
      say('De Bruxelles à Reims, en passant par Metz, avec un livre de Camus et un disque de Saint-Saëns.', 'From Brussels to Reims via Metz, with a book by Camus and a record by Saint-Saëns.'),
    ],
    [
      b('Bruxelles [bʁysɛl], Reims [ʁɛ̃s], Metz [mɛs], Laon [lɑ̃].', 'Bruxelles [bʁysɛl], Reims [ʁɛ̃s], Metz [mɛs], Laon [lɑ̃].'),
      b('Saint-Saëns [sɛ̃sɑ̃s], Montaigne [mɔ̃tɛɲ], Camus [kamy].', 'Saint-Saëns [sɛ̃sɑ̃s], Montaigne [mɔ̃tɛɲ], Camus [kamy].'),
      b('When unsure, check a pronunciation dictionary.', 'En cas de doute, consultez un dictionnaire de prononciation.'),
    ],
    [['un disque', b('a record', 'enregistrement musical')], ['en passant par', b('via', 'par le chemin de')], ['un nom propre', b('a proper noun', 'nom de personne ou de lieu')]],
  ),
  lesson(C, 3, ['acronyms-and-loanwords', 'sigles-et-emprunts'],
    b('Acronyms and loanwords', 'Sigles et emprunts'),
    b('Know which acronyms are spelled and which are read, and how French speakers say English words.', 'Savoir quels sigles s’épellent et lesquels se lisent, et comment les francophones disent les mots anglais.'),
    [b('Spell or read acronyms', 'Épeler ou lire les sigles'), b('Say letters the French way', 'Dire les lettres à la française'), b('Pronounce frequent loanwords', 'Prononcer les emprunts fréquents')],
    13,
    [
      card(b('Spelled or read?', 'Épelé ou lu ?'), b('**Spelled** letter by letter: **SNCF** [ɛs ɛn se ɛf], **PDG**, **TGV**, **RATP**, **CV**, **HLM**, **SVP**. **Read** as a word: **ONU** [ɔny], **OTAN** [ɔtɑ̃], **Unesco**, **SIDA**, **ZUP**. Mixed: **CNRS** spelled, **INSEE** [inse] read. Letters: **G** [ʒe], **J** [ʒi], **W** [dubləve], **Y** [iɡʁɛk].', '**Épelés** lettre par lettre : **SNCF** [ɛs ɛn se ɛf], **PDG**, **TGV**, **RATP**, **CV**, **HLM**, **SVP**. **Lus** comme un mot : **ONU** [ɔny], **OTAN** [ɔtɑ̃], **Unesco**, **SIDA**. **CNRS** épelé, **INSEE** [inse] lu. Lettres : **G** [ʒe], **J** [ʒi], **W** [dubləve], **Y** [iɡʁɛk].')),
      sort(b('Spelled or read as a word?', 'Épelé ou lu comme un mot ?'), [b('spelled', 'épelé'), b('read as a word', 'lu comme un mot')], [['SNCF', 0], ['ONU', 1], ['TGV', 0], ['OTAN', 1], ['PDG', 0], ['INSEE', 1]]),
      card(b('Loanwords', 'Les emprunts'), b('English words are **frenchified**: stress on the **last syllable**, French vowels and R: **le week-end** [wikɛnd], **le parking** [paʁkiŋ], **un e-mail** [imɛl], **le football** [futbol], **un sandwich** [sɑ̃dwitʃ], **le shampoing** [ʃɑ̃pwɛ̃]. Pronouncing them « too English » can sound affected.', 'Les mots anglais sont **francisés** : accent sur la **dernière syllabe**, voyelles et R français : **le week-end** [wikɛnd], **le parking** [paʁkiŋ], **un e-mail** [imɛl], **le football** [futbol], **un sandwich** [sɑ̃dwitʃ], **le shampoing** [ʃɑ̃pwɛ̃]. Les prononcer « trop anglais » peut sembler affecté.')),
      hear('Le PDG de la SNCF a pris le TGV pour aller à l’ONU.', b('Listen. Which acronym is read as a word?', 'Écoutez. Quel sigle est lu comme un mot ?'), [b('ONU', 'ONU'), b('PDG', 'PDG'), b('SNCF', 'SNCF'), b('TGV', 'TGV')], { voice: 'm' }),
      mc(P.choose, ['[ʃɑ̃pwɛ̃]', '[ʃampuŋ]', '[ʃɑ̃pwiŋ]', '[ʃampwa]'], { fr: 'Comment se prononce « shampoing » ?' }),
      say('Le PDG a envoyé un e-mail pendant le week-end, depuis le parking de l’ONU.', 'The CEO sent an email over the weekend, from the UN car park.'),
    ],
    [
      b('Spelled: SNCF, TGV, PDG, CV. Read: ONU, OTAN, Unesco, INSEE.', 'Épelés : SNCF, TGV, PDG, CV. Lus : ONU, OTAN, Unesco, INSEE.'),
      b('Letters: G [ʒe], J [ʒi], W [dubləve], Y [iɡʁɛk].', 'Lettres : G [ʒe], J [ʒi], W [dubləve], Y [iɡʁɛk].'),
      b('Loanwords are frenchified: shampoing [ʃɑ̃pwɛ̃], parking.', 'Les emprunts sont francisés : shampoing [ʃɑ̃pwɛ̃], parking.'),
    ],
    [['un sigle', b('an acronym', 'mot formé d’initiales')], ['un PDG', b('a CEO', 'président-directeur général')], ['affecté', b('affected, unnatural', 'peu naturel')]],
  ),
];
