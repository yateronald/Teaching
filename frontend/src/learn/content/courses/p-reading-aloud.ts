import type { CourseAbout } from '../../types';
import { b, card, dict, doc, lesson, mc, P, say } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Reading aloud well, a poem, a passage of a novel, a speech or a children’s story, brings together everything in French pronunciation: liaisons, the e muet, rhythm, breath and expression. This C2 course works on public-domain texts by La Fontaine, Hugo and Verlaine and on prose, and trains you to prepare a text (marking pauses, liaisons and stresses), to count syllables in verse, and to read with breath control and expression.',
    'Bien lire à voix haute, un poème, un passage de roman, un discours ou une histoire pour enfants, mobilise toute la prononciation française : liaisons, e muet, rythme, souffle et expression. Ce cours de niveau C2 travaille sur des textes du domaine public de La Fontaine, Hugo et Verlaine et sur de la prose, et vous entraîne à préparer un texte (marquer pauses, liaisons et accents), à compter les syllabes d’un vers, et à lire avec maîtrise du souffle et expressivité.',
  ),
  outcomes: [
    b('Prepare a text for reading aloud', 'Préparer un texte pour la lecture à voix haute'),
    b('Count syllables in French verse', 'Compter les syllabes d’un vers français'),
    b('Manage breath and pauses', 'Gérer le souffle et les pauses'),
    b('Read with expression', 'Lire avec expressivité'),
  ],
};

const C = 'p-reading-aloud';
export default [
  lesson(C, 1, ['preparing-a-text', 'preparer-un-texte'],
    b('Preparing a text', 'Préparer un texte'),
    b('Mark breath groups, liaisons and key words before you read.', 'Marquer les groupes de souffle, les liaisons et les mots clés avant de lire.'),
    [b('Mark pauses ( / and // )', 'Marquer les pauses ( / et // )'), b('Mark liaisons (‿)', 'Marquer les liaisons (‿)'), b('Underline key words', 'Souligner les mots clés')],
    13,
    [
      card(b('A reader’s score', 'La partition du lecteur'), b('Like a musician, prepare a **score**: **/** short pause (comma, end of group), **//** long pause (full stop, change of idea), **‿** liaison, and **bold** for the words to stress. Read the text silently first to understand it: you cannot read well what you have not understood.', 'Comme un musicien, préparez une **partition** : **/** pause courte (virgule, fin de groupe), **//** pause longue (point, changement d’idée), **‿** liaison, et **gras** pour les mots à mettre en valeur. Lisez d’abord le texte en silence pour le comprendre : on ne lit bien que ce qu’on a compris.')),
      doc({ look: 'page', title: b('Prepared text', 'Texte préparé'), text: 'Le soir tombait / sur le petit port. // Les‿enfants rentraient / en courant, / et les pêcheurs, / fatigués, / rangeaient leurs filets. // Au loin, / un seul bateau / tardait‿encore.' }, b('Where is the longest pause?', 'Où se trouve la pause la plus longue ?'), [b('after « port » and « filets » (//)', 'après « port » et « filets » (//)'), b('after « soir »', 'après « soir »'), b('between « les » and « enfants »', 'entre « les » et « enfants »'), b('there are no pauses', 'il n’y a pas de pauses')]),
      mc(P.choose, [b('Les‿enfants (required liaison)', 'Les‿enfants (liaison obligatoire)'), b('pêcheurs‿fatigués', 'pêcheurs‿fatigués'), b('soir‿tombait', 'soir‿tombait'), b('port‿Les', 'port‿Les')], { fr: 'Quelle liaison est obligatoire dans ce texte ?' }),
      dict('Le soir tombait sur le petit port. Les enfants rentraient en courant.', { hint: b('Notice the pauses and the liaison les‿enfants.', 'Remarquez les pauses et la liaison les‿enfants.') }),
      say('Le soir tombait sur le petit port. Les enfants rentraient en courant, et les pêcheurs, fatigués, rangeaient leurs filets.', 'Evening was falling on the little harbour. The children were running home, and the fishermen, tired, were putting away their nets.', { tip: b('Respect the score: short pauses at commas, long ones at full stops.', 'Respectez la partition : pauses courtes aux virgules, longues aux points.') }),
    ],
    [
      b('Understand the text before reading it aloud.', 'Comprenez le texte avant de le lire à voix haute.'),
      b('Mark / short and // long pauses, ‿ liaisons, key words.', 'Marquez / pauses courtes et // longues, ‿ liaisons, mots clés.'),
      b('Breathe at the long pauses.', 'Respirez aux pauses longues.'),
    ],
    [['un pêcheur', b('a fisherman', 'qui pêche')], ['un filet', b('a net', 'pour attraper les poissons')], ['tarder', b('to be late, to linger', 'mettre du temps')]],
  ),
  lesson(C, 2, ['reading-verse', 'lire-un-vers'],
    b('Reading verse: counting syllables', 'Lire un vers : compter les syllabes'),
    b('Count syllables in French poetry and pronounce the e muet as verse requires.', 'Compter les syllabes en poésie et prononcer le e muet comme le vers l’exige.'),
    [b('Count syllables in a line', 'Compter les syllabes d’un vers'), b('Pronounce the e muet before a consonant', 'Prononcer le e muet devant une consonne'), b('Respect the caesura', 'Respecter la césure')],
    13,
    [
      card(b('Verse rules', 'Les règles du vers'), b('In classical verse, the **e muet is pronounced before a consonant** and **elided before a vowel**; it is never counted at the end of the line. The **alexandrine** has **12 syllables**, usually with a pause (**caesura**) after the 6th: **Demain, dès l’aube, à l’heure // où blanchit la campagne** (Hugo). Hugo’s line: De-main-dès-l’au-be-à… → the e of aube is elided before à.', 'En vers classique, **le e muet se prononce devant une consonne** et **s’élide devant une voyelle** ; il ne compte jamais en fin de vers. L’**alexandrin** a **12 syllabes**, en général avec une pause (**césure**) après la 6e : **Demain, dès l’aube, à l’heure // où blanchit la campagne** (Hugo). Le e de aube s’élide devant à.')),
      doc({ look: 'page', title: b('Victor Hugo, 1856 (public domain)', 'Victor Hugo, 1856 (domaine public)'), text: 'Demain, dès l’aube, à l’heure où blanchit la campagne,\nJe partirai. Vois-tu, je sais que tu m’attends.\nJ’irai par la forêt, j’irai par la montagne.\nJe ne puis demeurer loin de toi plus longtemps.', source: b('Les Contemplations', 'Les Contemplations') }, b('How many syllables in each line?', 'Combien de syllabes dans chaque vers ?'), [b('12 (alexandrines)', '12 (alexandrins)'), b('8', '8'), b('10', '10'), b('it varies', 'cela varie')]),
      mc(P.choose, [b('It is elided before « à » (a vowel).', 'Il s’élide devant « à » (voyelle).'), b('It is pronounced and counted.', 'Il est prononcé et compté.'), b('It is counted at the end.', 'Il est compté à la fin.'), b('It becomes a liaison.', 'Il devient une liaison.')], { fr: 'Dans « dès l’aube, à l’heure », que devient le e de « aube » ?' }),
      mc(P.choose, [b('No: a final e muet is never counted at the end of a line.', 'Non : un e muet final ne compte jamais en fin de vers.'), b('The final e of montagne is counted.', 'Le e final de montagne est compté.'), b('The line has 13 syllables.', 'Le vers a 13 syllabes.'), b('There is no rule.', 'Il n’y a pas de règle.')], { fr: '« J’irai par la forêt, j’irai par la montagne » : le e final de « montagne » compte-t-il ?' }),
      say('Demain, dès l’aube, à l’heure où blanchit la campagne, je partirai.', 'Tomorrow, at dawn, at the hour when the countryside whitens, I will leave.', { tip: b('Pause slightly after « l’heure » (caesura), breathe at the full stop.', 'Légère pause après « l’heure » (césure), respirez au point.') }),
      dict('J’irai par la forêt, j’irai par la montagne.', { hint: b('Victor Hugo, Les Contemplations.', 'Victor Hugo, Les Contemplations.') }),
    ],
    [
      b('Alexandrine = 12 syllables, caesura after the 6th.', 'Alexandrin = 12 syllabes, césure après la 6e.'),
      b('e muet: pronounced before a consonant, elided before a vowel, not counted at line end.', 'e muet : prononcé devant consonne, élidé devant voyelle, non compté en fin de vers.'),
      b('Read slower than prose; breathe at the punctuation.', 'Lisez plus lentement que la prose ; respirez à la ponctuation.'),
    ],
    [['l’aube', b('dawn', 'début du jour')], ['demeurer', b('to remain', 'rester')], ['une césure', b('a caesura', 'pause au milieu du vers')]],
  ),
  lesson(C, 3, ['reading-with-expression', 'lire-avec-expressivite'],
    b('Reading with expression', 'Lire avec expressivité'),
    b('Give voices, tempo and emotion to a fable and a poem.', 'Donner des voix, un tempo et une émotion à une fable et un poème.'),
    [b('Change voice for characters', 'Changer de voix pour les personnages'), b('Vary tempo and volume', 'Varier le tempo et le volume'), b('Convey the mood of a poem', 'Rendre l’atmosphère d’un poème')],
    13,
    [
      card(b('Expression', 'L’expressivité'), b('In a **fable**, give each character a voice: the **Fox** smooth and flattering, the **Crow** proud. Slow down for suspense, speed up for action, lower your voice for a secret. In a **lyric poem**, the mood guides you: Verlaine’s **Chanson d’automne** is slow, soft and melancholic.', 'Dans une **fable**, donnez une voix à chaque personnage : le **Renard** doucereux et flatteur, le **Corbeau** fier. Ralentissez pour le suspense, accélérez pour l’action, baissez la voix pour un secret. Dans un **poème lyrique**, l’atmosphère vous guide : la **Chanson d’automne** de Verlaine est lente, douce et mélancolique.')),
      doc({ look: 'page', title: b('Jean de La Fontaine, 1668 (public domain)', 'Jean de La Fontaine, 1668 (domaine public)'), text: 'Maître Corbeau, sur un arbre perché,\nTenait en son bec un fromage.\nMaître Renard, par l’odeur alléché,\nLui tint à peu près ce langage :\n« Hé ! bonjour, Monsieur du Corbeau.\nQue vous êtes joli ! que vous me semblez beau ! »', source: b('Fables, « Le Corbeau et le Renard »', 'Fables, « Le Corbeau et le Renard »') }, b('How should the Fox’s words be read?', 'Comment lire les paroles du Renard ?'), [b('smooth, flattering, a little exaggerated', 'doucereuses, flatteuses, un peu exagérées'), b('angry and loud', 'en colère et fortes'), b('sad and slow', 'tristes et lentes'), b('flat, without expression', 'plates, sans expression')]),
      doc({ look: 'page', title: b('Paul Verlaine, 1866 (public domain)', 'Paul Verlaine, 1866 (domaine public)'), text: 'Les sanglots longs\nDes violons\nDe l’automne\nBlessent mon cœur\nD’une langueur\nMonotone.', source: b('Poèmes saturniens, « Chanson d’automne »', 'Poèmes saturniens, « Chanson d’automne »') }, b('Which reading suits this poem?', 'Quelle lecture convient à ce poème ?'), [b('slow, soft, melancholic', 'lente, douce, mélancolique'), b('fast and cheerful', 'rapide et joyeuse'), b('loud, like a speech', 'forte, comme un discours'), b('mechanical, word by word', 'mécanique, mot à mot')]),
      say('Hé ! bonjour, Monsieur du Corbeau. Que vous êtes joli ! que vous me semblez beau !', 'Hey! Good day, Master Crow. How handsome you are! How beautiful you seem to me!', { tip: b('The Fox flatters: smooth, rising, a little theatrical.', 'Le Renard flatte : voix douce, montante, un peu théâtrale.') }),
      say('Les sanglots longs des violons de l’automne blessent mon cœur d’une langueur monotone.', 'The long sobs of the violins of autumn wound my heart with a monotonous languor.', { tip: b('Slow and soft; let the nasal vowels resonate.', 'Lentement et doucement ; laissez résonner les nasales.') }),
      dict('Maître Corbeau, sur un arbre perché, tenait en son bec un fromage.', { hint: b('La Fontaine, Le Corbeau et le Renard.', 'La Fontaine, Le Corbeau et le Renard.') }),
    ],
    [
      b('Fables: a distinct voice for each character.', 'Fables : une voix distincte pour chaque personnage.'),
      b('Vary tempo and volume with the action.', 'Variez tempo et volume selon l’action.'),
      b('Poems: let the mood set the pace and the colour of the voice.', 'Poèmes : laissez l’atmosphère fixer le rythme et la couleur de la voix.'),
    ],
    [['alléché', b('lured, tempted', 'attiré par l’odeur')], ['un sanglot', b('a sob', 'pleur bruyant')], ['la langueur', b('languor', 'mélancolie douce')]],
  ),
];
