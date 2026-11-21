import type { CourseAbout } from '../../types';
import { b, card, dict, hear, lesson, mc, P, say, sort } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Tu or tout? Dessus or dessous? Deux or doux? The rounded vowels u [y], ou [u] and eu [ø / œ] are where English speakers most often lose meaning. This course gives you a precise mouth recipe for each sound, trains your ear with minimal pairs in real sentences, and builds the reflex in short phrases you use every day (salut, vous voulez, un peu, deux heures).',
    'Tu ou tout ? Dessus ou dessous ? Deux ou doux ? Les voyelles arrondies u [y], ou [u] et eu [ø / œ] sont celles où les anglophones perdent le plus souvent le sens. Ce cours vous donne une recette de bouche précise pour chaque son, entraîne votre oreille avec des paires minimales en contexte, et installe le réflexe dans de petites phrases du quotidien (salut, vous voulez, un peu, deux heures).',
  ),
  outcomes: [
    b('Hear u, ou and eu apart', 'Distinguer u, ou et eu à l’oreille'),
    b('Produce u [y] reliably', 'Produire le u [y] de façon fiable'),
    b('Produce eu in peu and peur', 'Produire le eu de peu et de peur'),
    b('Use them in common phrases', 'Les employer dans des phrases courantes'),
  ],
};

const W = b('Listen. Which word do you hear?', 'Écoutez. Quel mot entendez-vous ?');
const C = 'p-u-ou';
export default [
  lesson(C, 1, ['u-versus-ou', 'u-contre-ou'],
    b('u versus ou', 'u contre ou'),
    b('Master the difference that separates tu and tout, rue and roue.', 'Maîtriser la différence qui sépare tu et tout, rue et roue.'),
    [b('Feel the tongue position', 'Sentir la position de la langue'), b('Hear minimal pairs in sentences', 'Entendre des paires minimales en contexte'), b('Say u without sliding to ou', 'Dire u sans glisser vers ou')],
    13,
    [
      card(b('Same lips, different tongue', 'Mêmes lèvres, langue différente'), b('Both sounds have **rounded lips**. The difference is the **tongue**: for **u** [y], the tongue is **forward**, touching the lower teeth (say « i », then round your lips). For **ou** [u], the tongue is **pulled back**. Test: say « iiii-uuuu » without moving your tongue.', 'Les deux sons ont les **lèvres arrondies**. La différence, c’est la **langue** : pour **u** [y], la langue est **en avant**, contre les dents du bas (dites « i », puis arrondissez les lèvres). Pour **ou** [u], la langue **recule**. Test : dites « iiii-uuuu » sans bouger la langue.'), {
        ex: [['tu / tout', '[y] / [u]'], ['la rue / la roue', '[y] / [u]'], ['dessus / dessous', '[y] / [u]']],
      }),
      hear('Le livre est dessus.', W, ['dessus', 'dessous']),
      hear('Tout est prêt.', W, ['Tout', 'Tu'], { voice: 'm' }),
      hear('Il a vu le film.', W, ['vu', 'vous']),
      hear('C’est une roue de vélo.', W, ['roue', 'rue'], { voice: 'm' }),
      sort(b('Listen and sort.', 'Écoutez et classez.'), [b('u [y]', 'u [y]'), b('ou [u]', 'ou [u]')], [['salut', 0], ['bonjour', 1], ['la lune', 0], ['la loupe', 1], ['bu', 0], ['bout', 1]], { listen: true }),
      say('Tu as vu la rue ? Vous voulez tout ?', 'Did you see the street? Do you want everything?', { tip: b('Alternate tongue forward (tu, vu, rue) and back (vous, voulez, tout).', 'Alternez langue en avant (tu, vu, rue) et en arrière (vous, voulez, tout).') }),
    ],
    [
      b('u [y]: lips rounded, tongue forward (say i, round the lips).', 'u [y] : lèvres arrondies, langue en avant (dites i, arrondissez).'),
      b('ou [u]: lips rounded, tongue back.', 'ou [u] : lèvres arrondies, langue en arrière.'),
      b('Pairs: tu/tout, rue/roue, dessus/dessous, vu/vous.', 'Paires : tu/tout, rue/roue, dessus/dessous, vu/vous.'),
    ],
    [['une roue', b('a wheel', 'partie ronde d’un vélo')], ['dessus / dessous', b('on top / underneath', 'en haut / en bas')], ['la loupe', b('the magnifying glass', 'verre grossissant')]],
  ),
  lesson(C, 2, ['the-sounds-of-eu', 'les-sons-de-eu'],
    b('The two sounds of eu', 'Les deux sons de eu'),
    b('Produce the closed eu of peu and the open eu of peur.', 'Produire le eu fermé de peu et le eu ouvert de peur.'),
    [b('Produce closed eu [ø]', 'Produire le eu fermé [ø]'), b('Produce open eu [œ]', 'Produire le eu ouvert [œ]'), b('Know which one to use', 'Savoir lequel employer')],
    13,
    [
      card(b('Closed and open eu', 'Le eu fermé et le eu ouvert'), b('**Closed eu** [ø]: say « é » and round your lips: **deux, peu, bleu, heureux**. It is used at the **end of a syllable**. **Open eu** [œ]: say « è » and round your lips: **peur, sœur, heure, jeune**. It is used **before a pronounced consonant**.', '**Eu fermé** [ø] : dites « é » et arrondissez les lèvres : **deux, peu, bleu, heureux**. On l’emploie **en fin de syllabe**. **Eu ouvert** [œ] : dites « è » et arrondissez les lèvres : **peur, sœur, heure, jeune**. On l’emploie **devant une consonne prononcée**.'), {
        ex: [['deux, un peu, bleu', '[ø]'], ['la peur, ma sœur, une heure', '[œ]']],
      }),
      hear('Il a un peu peur.', b('Listen. How many different eu sounds?', 'Écoutez. Combien de sons eu différents ?'), [b('two: peu [ø] and peur [œ]', 'deux : peu [ø] et peur [œ]'), b('only one', 'un seul'), b('none', 'aucun'), b('three', 'trois')]),
      hear('Il est deux heures.', W, ['deux heures', 'douze heures']),
      sort(b('Closed [ø] or open [œ]?', 'Fermé [ø] ou ouvert [œ] ?'), [b('closed [ø] (peu)', 'fermé [ø] (peu)'), b('open [œ] (peur)', 'ouvert [œ] (peur)')], [['bleu', 0], ['fleur', 1], ['heureux', 0], ['jeune', 1], ['des œufs', 0], ['un œuf', 1]], { listen: true }),
      mc(P.choose, [b('Before a pronounced consonant (r, l, f…)', 'Devant une consonne prononcée (r, l, f…)'), b('At the end of a word', 'En fin de mot'), b('After a vowel', 'Après une voyelle'), b('Never', 'Jamais')], { fr: 'Quand emploie-t-on en général le eu ouvert [œ] ?' }),
      dict('Ma sœur est heureuse, elle a deux fleurs bleues.', { hint: b('Listen for the difference between sœur, fleurs (open) and heureuse, deux, bleues (closed).', 'Écoutez la différence entre sœur, fleurs (ouvert) et heureuse, deux, bleues (fermé).') }),
      say('Ma sœur a deux fleurs bleues.', 'My sister has two blue flowers.'),
    ],
    [
      b('Closed eu [ø]: « é » + rounded lips; end of syllable (deux, peu).', 'Eu fermé [ø] : « é » + lèvres arrondies ; fin de syllabe (deux, peu).'),
      b('Open eu [œ]: « è » + rounded lips; before a consonant (peur, sœur).', 'Eu ouvert [œ] : « è » + lèvres arrondies ; devant une consonne (peur, sœur).'),
      b('un œuf [œ] but des œufs [ø].', 'un œuf [œ] mais des œufs [ø].'),
    ],
    [['heureux', b('happy', 'content')], ['une fleur', b('a flower', 'plante colorée')], ['un œuf', b('an egg', 'aliment de la poule')]],
  ),
  lesson(C, 3, ['u-ou-eu-in-everyday-phrases', 'u-ou-eu-au-quotidien'],
    b('u, ou, eu in everyday phrases', 'u, ou, eu au quotidien'),
    b('Combine the three rounded vowels in fluent everyday sentences.', 'Combiner les trois voyelles arrondies dans des phrases fluides du quotidien.'),
    [b('Distinguish u, ou and eu', 'Distinguer u, ou et eu'), b('Say common phrases fluently', 'Dire des phrases courantes avec fluidité'), b('Write what you hear', 'Écrire ce que vous entendez')],
    13,
    [
      card(b('Three neighbours', 'Trois voisins'), b('**u** [y]: tongue forward, lips rounded — **salut, sur, du jus**. **ou** [u]: tongue back — **vous, pour, beaucoup**. **eu** [ø/œ]: in between — **deux, peu, leur, heure**. Practise them together: **Vous voulez du jus ? Un peu, pour deux.**', '**u** [y] : langue en avant, lèvres arrondies — **salut, sur, du jus**. **ou** [u] : langue en arrière — **vous, pour, beaucoup**. **eu** [ø/œ] : entre les deux — **deux, peu, leur, heure**. Entraînez-les ensemble : **Vous voulez du jus ? Un peu, pour deux.**')),
      sort(b('Listen and sort.', 'Écoutez et classez.'), [b('u', 'u'), b('ou', 'ou'), b('eu', 'eu')], [['sur', 0], ['sourd', 1], ['sœur', 2], ['du', 0], ['doux', 1], ['deux', 2]], { listen: true }),
      hear('C’est doux.', W, ['doux', 'deux', 'du']),
      hear('Il y en a deux.', W, ['deux', 'doux', 'du'], { voice: 'm' }),
      dict('Vous voulez du jus ? Oui, un peu, pour nous deux.', { hint: b('u, ou and eu all appear.', 'u, ou et eu sont tous présents.') }),
      mc(P.choose, ['Je voudrais un jus, s’il vous plaît.', 'Je voudrais un jous, s’il vous plaît.', 'Je voudrais un jeus, s’il vous plaît.', 'Je voudrais un jis, s’il vous plaît.'], { fr: 'Au café, vous commandez un jus d’orange :' }),
      say('Salut ! Vous voulez du jus ? Un peu, pour nous deux.', 'Hi! Do you want some juice? A little, for the two of us.'),
    ],
    [
      b('u: salut, sur, du · ou: vous, pour, beaucoup · eu: deux, peu, heure.', 'u : salut, sur, du · ou : vous, pour, beaucoup · eu : deux, peu, heure.'),
      b('du / doux / deux are three different words.', 'du / doux / deux sont trois mots différents.'),
      b('Keep your lips rounded and move only the tongue.', 'Gardez les lèvres arrondies et ne bougez que la langue.'),
    ],
    [['sourd', b('deaf', 'qui n’entend pas')], ['doux', b('soft, gentle', 'agréable au toucher')], ['un jus', b('a juice', 'boisson de fruits')]],
  ),
];
