import type { CourseAbout } from '../../types';
import { b, card, culture, dict, hear, lesson, mc, P, say, sort } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Notre and nôtre, jeune and jeûne, la sole and le saule: French distinguishes open and closed versions of o and eu, and partly of é/è. These contrasts carry meaning in a few words and above all make your French sound precise. This course trains the closed o [o] and open o [ɔ], the position rules (open before a pronounced consonant, closed at the end of a syllable), the accent circumflex and the au spelling, with plenty of minimal pairs.',
    'Notre et nôtre, jeune et jeûne, la sole et le saule : le français distingue des versions ouvertes et fermées de o et de eu, et en partie de é/è. Ces contrastes portent le sens dans quelques mots et rendent surtout votre français plus précis. Ce cours entraîne le o fermé [o] et le o ouvert [ɔ], les règles de position (ouvert devant une consonne prononcée, fermé en fin de syllabe), l’accent circonflexe et la graphie au, avec de nombreuses paires minimales.',
  ),
  outcomes: [
    b('Produce closed o [o] and open o [ɔ]', 'Produire le o fermé [o] et le o ouvert [ɔ]'),
    b('Apply the position rules', 'Appliquer les règles de position'),
    b('Use spelling clues: ô, au, eau', 'Utiliser les indices graphiques : ô, au, eau'),
    b('Hear minimal pairs', 'Entendre les paires minimales'),
  ],
};

const W = b('Listen. Which word do you hear?', 'Écoutez. Quel mot entendez-vous ?');
const C = 'p-open-closed-vowels';
export default [
  lesson(C, 1, ['closed-o-and-open-o', 'o-ferme-et-o-ouvert'],
    b('Closed o and open o', 'Le o fermé et le o ouvert'),
    b('Produce [o] as in beau and [ɔ] as in bol.', 'Produire [o] comme dans beau et [ɔ] comme dans bol.'),
    [b('Produce closed [o]', 'Produire le [o] fermé'), b('Produce open [ɔ]', 'Produire le [ɔ] ouvert'), b('Apply the position rule', 'Appliquer la règle de position')],
    13,
    [
      card(b('Two o’s', 'Deux o'), b('**Closed [o]**: small round lips, tense, like a whistle: **beau, mot, trop, vélo, chaud**. **Open [ɔ]**: mouth more open, relaxed: **bol, porte, robe, école, homme**. **Position rule**: at the **end of a syllable** → closed (**mot, vélo**); **before a pronounced consonant** → usually open (**porte, robe, sol**).', '**[o] fermé** : petites lèvres rondes, tendues, comme pour siffler : **beau, mot, trop, vélo, chaud**. **[ɔ] ouvert** : bouche plus ouverte, détendue : **bol, porte, robe, école, homme**. **Règle de position** : en **fin de syllabe** → fermé (**mot, vélo**) ; **devant une consonne prononcée** → en général ouvert (**porte, robe, sol**).'), {
        ex: [['un mot, un vélo, trop beau', '[o]'], ['une porte, une robe, l’école', '[ɔ]']],
      }),
      sort(b('Closed [o] or open [ɔ]?', '[o] fermé ou [ɔ] ouvert ?'), [b('closed [o]', '[o] fermé'), b('open [ɔ]', '[ɔ] ouvert')], [['le vélo', 0], ['la porte', 1], ['trop', 0], ['la robe', 1], ['le dos', 0], ['l’école', 1]], { listen: true }),
      mc(P.choose, [b('open [ɔ]: before a pronounced consonant (l)', '[ɔ] ouvert : devant une consonne prononcée (l)'), b('closed [o]: at the end of a word', '[o] fermé : en fin de mot'), b('nasal [ɔ̃]', 'nasal [ɔ̃]'), b('silent', 'muet')], { fr: 'Le o de « bol » :' }),
      hear('C’est un beau vélo.', b('Listen. Are the o sounds open or closed?', 'Écoutez. Les o sont-ils ouverts ou fermés ?'), [b('closed: beau [o], vélo [o]', 'fermés : beau [o], vélo [o]'), b('open', 'ouverts'), b('one open, one closed', 'un ouvert, un fermé')]),
      dict('Ma robe est trop chaude pour l’école.', { hint: b('robe, école: open [ɔ]; trop, chaude: closed [o].', 'robe, école : [ɔ] ouvert ; trop, chaude : [o] fermé.') }),
      say('Un beau vélo, une belle robe, un bol de chocolat chaud.', 'A nice bike, a beautiful dress, a bowl of hot chocolate.'),
    ],
    [
      b('Closed [o]: tense round lips — end of syllable (mot, vélo).', '[o] fermé : lèvres rondes tendues — fin de syllabe (mot, vélo).'),
      b('Open [ɔ]: relaxed — before a pronounced consonant (porte, bol).', '[ɔ] ouvert : détendu — devant une consonne prononcée (porte, bol).'),
      b('Practise the contrast in one sentence: beau vélo / belle robe.', 'Entraînez le contraste dans une phrase : beau vélo / belle robe.'),
    ],
    [['le dos', b('the back', 'partie du corps')], ['un bol', b('a bowl', 'récipient rond')], ['chaud', b('hot, warm', 'à haute température')]],
  ),
  lesson(C, 2, ['spelling-clues', 'les-indices-graphiques'],
    b('Spelling clues: ô, au, eau', 'Les indices graphiques : ô, au, eau'),
    b('Use ô, au and eau to predict a closed o, even before a consonant.', 'Utiliser ô, au et eau pour prévoir un o fermé, même devant une consonne.'),
    [b('Read ô as closed', 'Lire ô fermé'), b('Read au, eau as closed', 'Lire au, eau fermé'), b('Hear the minimal pairs', 'Entendre les paires minimales')],
    13,
    [
      card(b('Spellings that close the o', 'Les graphies qui ferment le o'), b('**ô**, **au** and **eau** are usually **closed [o]**, even before a pronounced consonant: **la côte, l’hôpital, le pôle, chaude, la sauce, la Beauce**. Minimal pairs: **notre [ɔ] / le nôtre [o]**, **votre / le vôtre**, **la cote / la côte**, **la sole [ɔ] / le saule [o]**. Exception: **Paul** has an open o in most of France.', '**ô**, **au** et **eau** sont en général **[o] fermé**, même devant une consonne prononcée : **la côte, l’hôpital, le pôle, chaude, la sauce**. Paires minimales : **notre [ɔ] / le nôtre [o]**, **votre / le vôtre**, **la cote / la côte**, **la sole [ɔ] / le saule [o]**. Exception : **Paul** a un o ouvert dans la plupart de la France.')),
      culture(b('Regional variation', 'Variation régionale'), b('In the **south of France**, many speakers use open [ɔ] everywhere (**rose** [ʁɔz]); in **Québec**, some vowels are also pronounced differently. The northern standard described here is the reference for exams and the media, but all varieties are correct French.', 'Dans le **sud de la France**, beaucoup emploient le [ɔ] ouvert partout (**rose** [ʁɔz]) ; au **Québec**, certaines voyelles se prononcent aussi autrement. La norme du nord décrite ici sert de référence aux examens et aux médias, mais toutes les variétés sont du français correct.'), { variant: 'culture' }),
      hear('C’est notre maison.', W, ['notre', 'nôtre']),
      hear('Ce n’est pas la vôtre.', W, ['la vôtre', 'votre'], { voice: 'm' }),
      sort(b('Closed [o] or open [ɔ]?', '[o] fermé ou [ɔ] ouvert ?'), [b('closed [o]', '[o] fermé'), b('open [ɔ]', '[ɔ] ouvert')], [['la côte', 0], ['la cote', 1], ['le saule', 0], ['la sole', 1], ['le nôtre', 0], ['notre', 1]], { listen: true }),
      say('C’est notre voiture, pas la vôtre. Elle est à l’hôpital, sur la côte.', 'It’s our car, not yours. She is at the hospital, on the coast.'),
    ],
    [
      b('ô, au, eau → closed [o] (côte, chaude, beau).', 'ô, au, eau → [o] fermé (côte, chaude, beau).'),
      b('notre [ɔ] / le nôtre [o]; votre / le vôtre.', 'notre [ɔ] / le nôtre [o] ; votre / le vôtre.'),
      b('Southern France often uses [ɔ] everywhere: also correct.', 'Le sud de la France emploie souvent [ɔ] partout : c’est correct aussi.'),
    ],
    [['la côte', b('the coast', 'bord de mer')], ['un saule', b('a willow', 'arbre près de l’eau')], ['une sole', b('a sole (fish)', 'poisson plat')]],
  ),
  lesson(C, 3, ['eu-and-e-in-detail', 'eu-et-e-en-detail'],
    b('Fine contrasts: eu and é/è', 'Contrastes fins : eu et é/è'),
    b('Refine the open/closed contrast of eu and é/è in careful speech.', 'Affiner le contraste ouvert/fermé de eu et de é/è dans un français soigné.'),
    [b('Contrast jeune / jeûne', 'Opposer jeune / jeûne'), b('Contrast é / è at the end of words', 'Opposer é / è en fin de mot'), b('Apply the same position logic', 'Appliquer la même logique de position')],
    13,
    [
      card(b('The same logic', 'La même logique'), b('**eu**: open [œ] before a pronounced consonant (**jeune, peur, seul**), closed [ø] at the end of a syllable (**peu, deux**), and closed with **eû** or before [z] (**jeûne, heureuse, sérieuse**). **é/è** at the end of words: careful speech distinguishes **j’irai** [e] (future) / **j’irais** [ɛ] (conditional), **fée** / **fait**.', '**eu** : [œ] ouvert devant une consonne prononcée (**jeune, peur, seul**), [ø] fermé en fin de syllabe (**peu, deux**), et fermé avec **eû** ou devant [z] (**jeûne, heureuse, sérieuse**). **é/è** en fin de mot : le français soigné distingue **j’irai** [e] (futur) / **j’irais** [ɛ] (conditionnel), **fée** / **fait**.')),
      mc(P.choose, [b('le jeûne: closed [ø] (eû); un jeune: open [œ]', 'le jeûne : [ø] fermé (eû) ; un jeune : [œ] ouvert'), b('Both are open [œ].', 'Les deux sont ouverts [œ].'), b('Both are closed [ø].', 'Les deux sont fermés [ø].'), b('jeune is closed, jeûne is open.', 'jeune est fermé, jeûne est ouvert.')], { fr: '« un jeune » et « le jeûne » :' }),
      sort(b('eu: open [œ] or closed [ø]?', 'eu : [œ] ouvert ou [ø] fermé ?'), [b('open [œ]', '[œ] ouvert'), b('closed [ø]', '[ø] fermé')], [['seul', 0], ['heureuse', 1], ['la peur', 0], ['sérieuse', 1], ['un œuf', 0], ['des œufs', 1]], { listen: true }),
      mc(P.choose, [b('j’irai = future [e]; j’irais = conditional [ɛ]', 'j’irai = futur [e] ; j’irais = conditionnel [ɛ]'), b('They are spelled differently but always sound the same.', 'Ils s’écrivent différemment mais sonnent toujours pareil.'), b('j’irai is the conditional', 'j’irai est le conditionnel'), b('Both are the future', 'Les deux sont au futur')], { fr: 'En français soigné, « j’irai » et « j’irais » :' }),
      dict('Demain, j’irai voir ma sœur ; si j’avais le temps, j’irais aussi chez ma cousine.', { hint: b('Future (j’irai) then conditional (j’irais).', 'Futur (j’irai) puis conditionnel (j’irais).') }),
      say('Ce jeune homme est seul mais heureux. Demain, j’irai ; s’il faisait beau, j’irais.', 'This young man is alone but happy. Tomorrow I will go; if the weather were nice, I would go.'),
    ],
    [
      b('eu: [œ] before a pronounced consonant; [ø] at syllable end, with eû or before [z].', 'eu : [œ] devant consonne prononcée ; [ø] en fin de syllabe, avec eû ou devant [z].'),
      b('Careful speech: j’irai [e] / j’irais [ɛ].', 'Français soigné : j’irai [e] / j’irais [ɛ].'),
      b('Context usually disambiguates in everyday speech.', 'Le contexte lève en général l’ambiguïté à l’oral courant.'),
    ],
    [['le jeûne', b('fasting', 'fait de ne pas manger')], ['sérieux', b('serious', 'grave, appliqué')], ['seul', b('alone', 'sans personne')]],
  ),
];
