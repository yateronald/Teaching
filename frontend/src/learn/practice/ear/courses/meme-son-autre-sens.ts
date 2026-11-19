// B1 · Homophones: vert / verre / vers, cent / sans / sang, mer / mère / maire. The sentence decides.
import { ear, ex, fill, pick, situation } from '../authoring';

const WORD: [string, string] = ['Quel mot avez-vous entendu ?', 'Which word did you hear?'];
const FETE = 'Ma mère travaille à la mairie. Elle connaît bien le maire, et chaque été, ils organisent ensemble une fête au bord de la mer.';
const FETE_SHOW = 'Ma {mère} travaille à la mairie. Elle connaît bien le {maire}, et chaque été, ils organisent ensemble une fête au bord de la {mer}.';

export default ear('meme-son-autre-sens', {
  rule: [
    ['Même son, autre sens : la phrase décide', 'Same sound, different meaning: the sentence decides'],
    [
      'Beaucoup de mots français se prononcent **exactement pareil** : __vert__, __verre__, __vers__ [vɛʁ] ; __cent__, __sans__, __sang__ [sɑ̃] ; __mer__, __mère__, __maire__ [mɛʁ] ; __cours__, __court__, __cour__ [kuʁ].\n\nL’oreille seule ne suffit pas : écoutez **toute la phrase**, l’article (le, la, un), le verbe, ce qui suit, avant de choisir le mot.',
      'Many French words sound **exactly the same**: __vert__, __verre__, __vers__ [vɛʁ]; __cent__, __sans__, __sang__ [sɑ̃]; __mer__, __mère__, __maire__ [mɛʁ]; __cours__, __court__, __cour__ [kuʁ].\n\nThe ear alone is not enough: listen to **the whole sentence**, the article (le, la, un), the verb, what follows, before choosing the word.',
    ],
  ],
  goal: ['Choisir le bon mot quand plusieurs mots ont le même son.', 'Choose the right word when several words share one sound.'],
  examples: [
    ex('Un verre vert.', 'un {verre} {vert}', ['Deux mots, un seul son [vɛʁ] : l’objet, puis la couleur.', 'Two words, one sound [vɛʁ]: the object, then the colour.']),
    ex('Un café sans sucre.', 'un café {sans} sucre', ['[sɑ̃] : sans, « without ».', '[sɑ̃]: sans, « without ».']),
    ex('La mer, la mère, le maire.', 'la {mer}, la {mère}, le {maire}', ['Trois mots [mɛʁ] : seul le contexte les distingue.', 'Three [mɛʁ] words: only the context tells them apart.']),
  ],
  items: [
    pick('Je voudrais un verre d’eau.', ['un verre (pour boire)', 'vert (une couleur)', 'vers (une direction)'], 0, 'Je voudrais un {verre} d’eau.', [
      '« Un… d’eau » : c’est un nom, l’objet pour boire.',
      '« Un… d’eau »: a noun, the object you drink from.',
    ], WORD),
    pick('Il marche vers la gare.', ['un verre', 'vers', 'vert'], 1, 'Il marche {vers} la gare.', [
      'Après « marche » et devant « la gare » : une direction, « vers ».',
      'After « marche » and before « la gare »: a direction, « vers ».',
    ], WORD),
    pick('Elle est partie sans son manteau.', ['sans (sans son manteau)', 'cent (le nombre 100)', 'sang (le liquide rouge)'], 0, 'Elle est partie {sans} son manteau.', [
      '« … son manteau » : elle ne l’a pas pris. C’est « sans ».',
      '« … son manteau »: she did not take it. It is « sans ».',
    ], WORD),
    pick('Il a couru pendant cent mètres.', ['sans', 'cent', 'sang'], 1, 'Il a couru pendant {cent} mètres.', [
      'Devant « mètres », une quantité : cent, 100.',
      'Before « mètres », a quantity: cent, 100.',
    ], WORD),
    pick('Le maire a fait un discours.', ['la mer', 'la mère', 'le maire'], 2, '{Le} {maire} a fait un discours.', [
      '« Le » (masculin) et « un discours » : le maire de la ville.',
      '« Le » (masculine) and « un discours »: the mayor of the town.',
    ], WORD),
    fill('Ils passent leurs vacances au bord de la mer.', 'Ils passent leurs vacances au bord de la ___.', 'mer', 'Ils passent leurs vacances au bord de la {mer}.', [
      '« Au bord de la… » et les vacances : la mer, pas la mère.',
      '« Au bord de la… » and holidays: the sea, not the mother.',
    ]),
    fill('Le cours de français commence à neuf heures.', 'Le ___ de français commence à neuf heures.', 'cours', 'Le {cours} de français commence à neuf heures.', [
      '« Le … de français » : la leçon, « cours » avec un s (à distinguer de « court » et de « la cour »).',
      '« Le … de français »: the class, « cours » with an s (not « court » or « la cour »).',
    ]),
    fill('Il fait beau, mais nous n’avons pas le temps de sortir.', 'Il fait beau, mais nous n’avons pas le ___ de sortir.', 'temps', 'Il fait beau, mais nous n’avons pas le {temps} de sortir.', [
      '[tɑ̃] : « avoir le temps de ». Même son que « tant » et « il tend ».',
      '[tɑ̃]: « avoir le temps de ». Same sound as « tant » and « il tend ».',
    ]),
    situation(FETE, 'Où travaille la mère ?', ['À la mairie', 'Au bord de la mer', 'Chez le maire'], 0, FETE_SHOW, [
      '« Ma mère travaille à la mairie » : la mère (la maman) travaille à la mairie, le bâtiment de la ville.',
      '« Ma mère travaille à la mairie »: the mother works at the town hall.',
    ]),
    situation(FETE, 'Qui organise la fête ?', ['La mère et le maire', 'Le maire seul', 'Les habitants de la ville'], 0, FETE_SHOW, [
      '« Ils organisent ensemble » : « ils », c’est la mère et le maire. La fête a lieu au bord de la mer.',
      '« Ils organisent ensemble »: « ils » is the mother and the mayor. The party is by the sea.',
    ]),
  ],
  takeaway: [
    'Quand plusieurs mots ont le même son, ne décidez pas trop vite : l’article, le verbe et la suite de la phrase indiquent le bon mot.',
    'When several words share a sound, do not decide too fast: the article, the verb and the rest of the sentence point to the right word.',
  ],
});
