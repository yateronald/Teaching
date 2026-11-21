import type { CourseAbout } from '../../types';
import { b, card, dict, gap, hear, lesson, mc, P, say, sort } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'French has three e sounds: the closed é [e] of été, the open è [ɛ] of mère and the neutral e [ə] of le. Mixing them changes meaning (le / les, fée / fait in careful speech) and grammar (je parlai / je parlais in formal speech, je fais / j’ai fait). This course trains the mouth positions, the spelling patterns (é, er, ez, et / è, ê, ai, ei, e + two consonants) and the crucial difference between le and les.',
    'Le français a trois sons e : le é fermé [e] de été, le è ouvert [ɛ] de mère et le e neutre [ə] de le. Les confondre change le sens (le / les) et parfois la grammaire (je fais / j’ai fait). Ce cours entraîne les positions de la bouche, les graphies (é, er, ez, et / è, ê, ai, ei, e + deux consonnes) et la différence capitale entre le et les.',
  ),
  outcomes: [
    b('Produce é, è and e distinctly', 'Produire é, è et e distinctement'),
    b('Hear le / les and de / des', 'Distinguer le / les et de / des'),
    b('Connect sounds and spellings', 'Relier sons et graphies'),
    b('Hear present vs passé composé', 'Distinguer présent et passé composé à l’oreille'),
  ],
};

const W = b('Listen. Which word do you hear?', 'Écoutez. Quel mot entendez-vous ?');
const C = 'p-e-sounds';
export default [
  lesson(C, 1, ['closed-and-open-e', 'e-ferme-et-e-ouvert'],
    b('Closed é and open è', 'Le é fermé et le è ouvert'),
    b('Produce the smiling é and the more open è.', 'Produire le é souriant et le è plus ouvert.'),
    [b('Produce é [e]', 'Produire é [e]'), b('Produce è [ɛ]', 'Produire è [ɛ]'), b('Match sounds and spellings', 'Associer sons et graphies')],
    13,
    [
      card(b('Two mouth positions', 'Deux positions de bouche'), b('**é** [e]: lips spread, mouth almost closed, like a tense smile: **été, café, parler, nez**. **è** [ɛ]: mouth more open, jaw lower: **mère, fête, lait, neige**. Spellings: [e] = **é, er, ez, et** (and **es** in les, des, mes); [ɛ] = **è, ê, ai, ei, e + two consonants** (belle, merci).', '**é** [e] : lèvres étirées, bouche presque fermée, comme un sourire tendu : **été, café, parler, nez**. **è** [ɛ] : bouche plus ouverte, mâchoire plus basse : **mère, fête, lait, neige**. Graphies : [e] = **é, er, ez, et** (et **es** dans les, des, mes) ; [ɛ] = **è, ê, ai, ei, e + deux consonnes** (belle, merci).'), {
        ex: [['été, café, parler, chez', '[e]'], ['mère, fête, lait, merci', '[ɛ]']],
      }),
      sort(b('Listen and sort.', 'Écoutez et classez.'), [b('é [e]', 'é [e]'), b('è [ɛ]', 'è [ɛ]')], [['le café', 0], ['la fête', 1], ['le nez', 0], ['la neige', 1], ['parler', 0], ['la mer', 1]], { listen: true }),
      sort(b('Which sound does the spelling make?', 'Quel son fait la graphie ?'), [b('é [e]', 'é [e]'), b('è [ɛ]', 'è [ɛ]')], [['chantez', 0], ['la tête', 1], ['manger', 0], ['la reine', 1], ['et', 0], ['elle', 1]]),
      hear('Mon frère aime le café.', b('Listen. Which words have the open è?', 'Écoutez. Quels mots ont le è ouvert ?'), [b('frère, aime', 'frère, aime'), b('café', 'café'), b('mon, le', 'mon, le'), b('none', 'aucun')]),
      mc(P.choose, [b('e + two consonants sounds è: belle, merci, cette', 'e + deux consonnes se prononce è : belle, merci, cette'), b('e + two consonants is silent', 'e + deux consonnes est muet'), b('e + two consonants sounds é', 'e + deux consonnes se prononce é'), b('It depends on the word', 'Cela dépend du mot')], { fr: 'Quelle règle s’applique à « belle » et « merci » ?' }),
      say('L’été, mon frère boit un café près de la mer.', 'In summer, my brother drinks a coffee by the sea.'),
    ],
    [
      b('é [e]: spread lips, almost closed — é, er, ez, et.', 'é [e] : lèvres étirées, presque fermée — é, er, ez, et.'),
      b('è [ɛ]: more open — è, ê, ai, ei, e + 2 consonants.', 'è [ɛ] : plus ouvert — è, ê, ai, ei, e + 2 consonnes.'),
      b('Many speakers relax the contrast at the end of words; keep it in è / é stressed syllables.', 'Beaucoup relâchent le contraste en fin de mot ; gardez-le dans les syllabes accentuées.'),
    ],
    [['la neige', b('snow', 'eau gelée qui tombe')], ['la reine', b('the queen', 'femme du roi')], ['la fête', b('the party', 'célébration')]],
  ),
  lesson(C, 2, ['le-or-les', 'le-ou-les'],
    b('le or les? de or des?', 'le ou les ? de ou des ?'),
    b('Hear and say the difference between singular and plural determiners.', 'Entendre et dire la différence entre déterminants singulier et pluriel.'),
    [b('Produce neutral e [ə]', 'Produire le e neutre [ə]'), b('Hear le / les, de / des, ce / ces', 'Distinguer le / les, de / des, ce / ces'), b('Find the number from the sound', 'Trouver le nombre grâce au son')],
    13,
    [
      card(b('The plural is in the determiner', 'Le pluriel est dans le déterminant'), b('In speech, **livre** and **livres** sound the same. Only the determiner tells you the number: **le** [lə] (neutral, rounded, relaxed) vs **les** [le] (smiling é). Same with **de / des** and **ce / ces**.', 'À l’oral, **livre** et **livres** se prononcent pareil. Seul le déterminant indique le nombre : **le** [lə] (neutre, arrondi, détendu) contre **les** [le] (é souriant). De même : **de / des** et **ce / ces**.'), {
        ex: [['le livre / les livres', '[lə] / [le]'], ['ce garçon / ces garçons', '[sə] / [se]'], ['je cherche de l’eau / des amis', '[də] / [de]']],
      }),
      hear('Je prends les clés.', W, ['les clés', 'la clé']),
      hear('Tu as vu ce film ?', W, ['ce film', 'ces films'], { voice: 'm' }),
      hear('J’achète des pommes.', W, ['des pommes', 'deux pommes']),
      sort(b('Singular or plural?', 'Singulier ou pluriel ?'), [b('singular', 'singulier'), b('plural', 'pluriel')], [['le livre', 0], ['les livres', 1], ['ce stylo', 0], ['ces stylos', 1], ['le sac', 0], ['les sacs', 1]], { listen: true }),
      dict('Je cherche les clés de la voiture et le sac de ma sœur.', { hint: b('Listen carefully to le / les and de / des.', 'Écoutez bien le / les et de / des.') }),
      say('Le livre, les livres. Ce garçon, ces garçons.', 'The book, the books. This boy, these boys.'),
    ],
    [
      b('le, de, ce: neutral e [ə], relaxed and rounded.', 'le, de, ce : e neutre [ə], détendu et arrondi.'),
      b('les, des, ces (and mes, tes, ses): smiling é [e].', 'les, des, ces (et mes, tes, ses) : é souriant [e].'),
      b('The determiner carries the plural you can hear.', 'Le déterminant porte le pluriel audible.'),
    ],
    [['une clé', b('a key', 'pour ouvrir')], ['un stylo', b('a pen', 'pour écrire')], ['chercher', b('to look for', 'essayer de trouver')]],
  ),
  lesson(C, 3, ['present-or-past', 'present-ou-passe'],
    b('Present or past? Hearing the tense', 'Présent ou passé ? Entendre le temps'),
    b('Use the e sounds to hear je fais / j’ai fait and je parle / j’ai parlé.', 'Utiliser les sons e pour distinguer je fais / j’ai fait et je parle / j’ai parlé.'),
    [b('Hear je / j’ai', 'Distinguer je / j’ai'), b('Hear parle / parlé', 'Distinguer parle / parlé'), b('Write the right tense', 'Écrire le bon temps')],
    13,
    [
      card(b('A small sound, a big difference', 'Un petit son, une grande différence'), b('**je** [ʒə] vs **j’ai** [ʒe]: **je fais** (present) / **j’ai fait** (past). **parle** (silent e) vs **parlé** [e]: **je parle** / **j’ai parlé**. The ending **-er, -é, -ez** all sound [e]: **parler, parlé, parlez**.', '**je** [ʒə] contre **j’ai** [ʒe] : **je fais** (présent) / **j’ai fait** (passé). **parle** (e muet) contre **parlé** [e] : **je parle** / **j’ai parlé**. Les terminaisons **-er, -é, -ez** sonnent toutes [e] : **parler, parlé, parlez**.')),
      hear('J’ai fini mon travail.', b('Listen. Present or past?', 'Écoutez. Présent ou passé ?'), [b('past: j’ai fini', 'passé : j’ai fini'), b('present: je finis', 'présent : je finis')]),
      hear('Je regarde la télé.', b('Listen. Present or past?', 'Écoutez. Présent ou passé ?'), [b('present: je regarde', 'présent : je regarde'), b('past: j’ai regardé', 'passé : j’ai regardé')], { voice: 'm' }),
      hear('J’ai mangé une pomme.', b('Listen. Present or past?', 'Écoutez. Présent ou passé ?'), [b('past: j’ai mangé', 'passé : j’ai mangé'), b('present: je mange', 'présent : je mange')]),
      gap(P.complete, 'Hier, j’___ parl___ avec ma mère. Aujourd’hui, je lui parl___ encore.', ['ai', 'é', 'e']),
      dict('Hier, j’ai parlé avec Léa, et ce matin je lui parle encore.', { hint: b('Past then present: j’ai parlé / je parle.', 'Passé puis présent : j’ai parlé / je parle.') }),
      say('Je fais mes devoirs. Hier, j’ai fait mes devoirs.', 'I do my homework. Yesterday I did my homework.'),
    ],
    [
      b('je [ʒə] (present) vs j’ai [ʒe] (passé composé).', 'je [ʒə] (présent) contre j’ai [ʒe] (passé composé).'),
      b('parle (silent e) vs parlé [e].', 'parle (e muet) contre parlé [e].'),
      b('-er, -é, -ez sound the same [e].', '-er, -é, -ez se prononcent [e].'),
    ],
    [['les devoirs', b('homework', 'travail scolaire à la maison')], ['encore', b('again, still', 'de nouveau')], ['hier', b('yesterday', 'le jour d’avant')]],
  ),
];
