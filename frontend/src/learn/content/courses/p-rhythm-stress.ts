import type { CourseAbout } from '../../types';
import { b, card, dict, hear, lesson, mc, ord, P, say, sort } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'English stresses words (PHOtograph, phoTOgraphy); French stresses groups. In French, every syllable has almost the same length, and only the last syllable of each rhythmic group is longer. Applying English word stress to French is one of the main reasons for a foreign accent. This course retrains your rhythm: even syllables, final lengthening, groups of meaning and the emphatic stress French speakers use to insist.',
    'L’anglais accentue les mots (PHOtograph, phoTOgraphy) ; le français accentue les groupes. En français, toutes les syllabes ont presque la même durée, et seule la dernière syllabe de chaque groupe rythmique s’allonge. Appliquer l’accent de mot anglais au français est l’une des principales causes d’accent étranger. Ce cours rééduque votre rythme : syllabes régulières, allongement final, groupes de sens et accent d’insistance que les francophones utilisent pour souligner.',
  ),
  outcomes: [
    b('Give each syllable the same length', 'Donner la même durée à chaque syllabe'),
    b('Lengthen the last syllable of a group', 'Allonger la dernière syllabe du groupe'),
    b('Cut sentences into rhythmic groups', 'Découper les phrases en groupes rythmiques'),
    b('Use emphatic stress to insist', 'Utiliser l’accent d’insistance'),
  ],
};

const C = 'p-rhythm-stress';
export default [
  lesson(C, 1, ['even-syllables', 'des-syllabes-regulieres'],
    b('Even syllables', 'Des syllabes régulières'),
    b('Say every syllable with the same length and energy, like a metronome.', 'Dire chaque syllabe avec la même durée et la même énergie, comme un métronome.'),
    [b('Count syllables', 'Compter les syllabes'), b('Keep them even', 'Les garder régulières'), b('Avoid English word stress', 'Éviter l’accent de mot anglais')],
    13,
    [
      card(b('A syllable-timed language', 'Une langue syllabique'), b('French syllables are **equal**, like the ticks of a metronome: **pho-to-gra-phie** (4 equal beats), **in-for-ma-tion**, **ré-a-li-té**. Don’t say « PHO-to-graphie » or « in-for-MA-tion » with a strong beat. Each vowel is **clear and full**, never reduced to « uh ».', 'Les syllabes françaises sont **égales**, comme les battements d’un métronome : **pho-to-gra-phie** (4 temps égaux), **in-for-ma-tion**, **ré-a-li-té**. Ne dites pas « PHO-to-graphie » ou « in-for-MA-tion » avec un temps fort. Chaque voyelle est **claire et pleine**, jamais réduite à « euh ».'), {
        ex: [['pho-to-gra-phie', '4 syllabes égales'], ['u-ni-ver-si-té', '5 syllabes égales'], ['res-tau-rant', '3 syllabes égales']],
      }),
      hear('C’est une université internationale.', b('Listen. How are the syllables?', 'Écoutez. Comment sont les syllabes ?'), [b('Even, with a slightly longer last syllable', 'Régulières, avec la dernière un peu plus longue'), b('Strong first syllable of each word', 'Première syllabe forte dans chaque mot'), b('Very irregular', 'Très irrégulières'), b('Strong middle syllables', 'Syllabes du milieu fortes')]),
      sort(b('How many syllables (spoken)?', 'Combien de syllabes (à l’oral) ?'), [b('3', '3'), b('4', '4'), b('5', '5')], [['restaurant', 0], ['photographie', 1], ['université', 2], ['important', 0], ['information', 1], ['électricité', 2]]),
      mc(P.choose, [b('com-pré-hen-sion: four equal syllables', 'com-pré-hen-sion : quatre syllabes égales'), b('COM-pré-hen-sion: strong first syllable', 'COM-pré-hen-sion : première syllabe forte'), b('com-pré-HEN-sion: strong third syllable', 'com-pré-HEN-sion : troisième syllabe forte'), b('compr-hen-sion: three syllables', 'compr-hen-sion : trois syllabes')], { fr: 'Comment prononcer « compréhension » à la française ?' }),
      dict('La photographie est une information importante.', { hint: b('Every syllable is clear.', 'Chaque syllabe est claire.') }),
      say('Photographie, université, information, restaurant.', 'Photography, university, information, restaurant.', { tip: b('Tap the table on each syllable: every beat is equal.', 'Tapez sur la table à chaque syllabe : tous les temps sont égaux.') }),
    ],
    [
      b('French syllables are equal in length and energy.', 'Les syllabes françaises sont égales en durée et en énergie.'),
      b('No strong word stress like in English.', 'Pas d’accent de mot fort comme en anglais.'),
      b('Every vowel is full, never reduced.', 'Chaque voyelle est pleine, jamais réduite.'),
    ],
    [['un métronome', b('a metronome', 'appareil qui marque le temps')], ['un battement', b('a beat', 'coup régulier')], ['une syllabe', b('a syllable', 'groupe de sons')]],
  ),
  lesson(C, 2, ['final-stress', 'l-accent-final'],
    b('Final stress: the long last syllable', 'L’accent final : la dernière syllabe longue'),
    b('Lengthen the last syllable of each rhythmic group, not of each word.', 'Allonger la dernière syllabe de chaque groupe rythmique, pas de chaque mot.'),
    [b('Find the end of the group', 'Trouver la fin du groupe'), b('Lengthen the last syllable', 'Allonger la dernière syllabe'), b('Let the stress move as the group grows', 'Laisser l’accent se déplacer quand le groupe s’allonge')],
    13,
    [
      card(b('Stress at the end of the group', 'L’accent en fin de groupe'), b('French stress falls on the **last syllable of a rhythmic group**, and it is mainly **longer**, not louder: **un CAFÉ** → **un café NOIR** → **un café noir et SUCRÉ**. The stress **moves** when the group grows. Words lose their own stress inside the group.', 'L’accent français tombe sur **la dernière syllabe du groupe rythmique**, et il est surtout **plus long**, pas plus fort : **un caFÉ** → **un café NOIR** → **un café noir et suCRÉ**. L’accent **se déplace** quand le groupe s’allonge. Les mots perdent leur accent propre à l’intérieur du groupe.'), {
        ex: [['un café', 'accent sur -fé'], ['un café noir', 'accent sur noir'], ['un café noir et sucré', 'accent sur -cré']],
      }),
      hear('Je voudrais un café noir, sans sucre.', b('Listen. Which syllables are longer?', 'Écoutez. Quelles syllabes sont plus longues ?'), [b('noir and sucre (ends of groups)', 'noir et sucre (fins de groupes)'), b('je and un', 'je et un'), b('vou- and ca-', 'vou- et ca-'), b('all of them equally', 'toutes également')], { voice: 'm' }),
      mc(P.choose, [b('the last syllable: -tion', 'la dernière : -tion'), b('the first: or-', 'la première : or-'), b('the second: -ga-', 'la deuxième : -ga-'), b('none', 'aucune')], { fr: 'Dans le mot isolé « organisation », quelle syllabe est accentuée ?' }),
      mc(P.choose, [b('on -ment of appartement', 'sur -ment de appartement'), b('on -ti- of petit', 'sur -tit de petit'), b('on un', 'sur un'), b('on every word', 'sur chaque mot')], { fr: 'Dans le groupe « un petit appartement », où est l’accent ?' }),
      ord(P.order, 'Un petit café noir et bien sucré, s’il vous plaît.', { tr: 'A small black coffee, nicely sweet, please.' }),
      say('Un café. Un café noir. Un café noir et sucré.', 'A coffee. A black coffee. A black, sweet coffee.', { tip: b('Lengthen only the last syllable each time: -fé, noir, -cré.', 'N’allongez que la dernière syllabe à chaque fois : -fé, noir, -cré.') }),
    ],
    [
      b('Stress = last syllable of the rhythmic group.', 'Accent = dernière syllabe du groupe rythmique.'),
      b('It is a lengthening, not a loud beat.', 'C’est un allongement, pas un coup fort.'),
      b('The stress moves when the group grows.', 'L’accent se déplace quand le groupe s’allonge.'),
    ],
    [['sucré', b('sweet', 'avec du sucre')], ['allonger', b('to lengthen', 'rendre plus long')], ['un groupe rythmique', b('a rhythmic group', 'unité de rythme')]],
  ),
  lesson(C, 3, ['emphatic-stress', 'l-accent-d-insistance'],
    b('Emphatic stress', 'L’accent d’insistance'),
    b('Stress the first syllable of a word to insist or express emotion.', 'Accentuer la première syllabe d’un mot pour insister ou exprimer une émotion.'),
    [b('Recognise emphatic stress', 'Reconnaître l’accent d’insistance'), b('Use it to insist', 'L’utiliser pour insister'), b('Avoid overusing it', 'Éviter d’en abuser')],
    13,
    [
      card(b('Insisting', 'Insister'), b('To insist or show emotion, French speakers add a **strong, higher stress on the first syllable** (often the first consonant is lengthened): **C’est ffformidable !** · **C’est ab-solument faux !** · **Il est in-supportable !** · **Ja-mais !** It sits on top of the normal final stress.', 'Pour insister ou montrer une émotion, on ajoute un **accent fort et plus haut sur la première syllabe** (souvent en allongeant la consonne) : **C’est ffformidable !** · **C’est ab-solument faux !** · **Il est in-supportable !** · **Ja-mais !** Il s’ajoute à l’accent final normal.')),
      mc(P.choose, ['C’est AB-solument in-CROY-able !', 'C’est absoLUMENT incroyABLE (sans insistance)', 'C’EST absolument incroyable !', 'C’est absolument incroyable, rien de spécial.'], { fr: 'Comment marque-t-on l’insistance dans « C’est absolument incroyable ! » ?', explain: b('Emphatic stress falls on the first syllable: AB-solument, IN-croyable.', 'L’accent d’insistance porte sur la première syllabe : AB-solument, IN-croyable.') }),
      sort(b('Neutral or emphatic?', 'Neutre ou insistant ?'), [b('neutral statement', 'constat neutre'), b('emphatic (emotion)', 'insistance (émotion)')], [['C’est intéressant.', 0], ['C’est ab-solument génial !', 1], ['Il est en retard.', 0], ['Il est in-supportable !', 1], ['Le film est long.', 0], ['Ja-mais de la vie !', 1]]),
      mc(P.best, [b('To show strong emotion or to insist', 'Pour montrer une émotion forte ou insister'), b('In every sentence', 'Dans chaque phrase'), b('Only on the last word', 'Seulement sur le dernier mot'), b('Only in questions', 'Seulement dans les questions')], { fr: 'Quand utilise-t-on l’accent d’insistance ?' }),
      dict('Ce spectacle était absolument magnifique, vraiment formidable.', { hint: b('The speaker insists on absolument and formidable.', 'La personne insiste sur absolument et formidable.') }),
      say('C’est ab-solument formidable ! Ja-mais je n’ai vu ça !', 'It’s absolutely wonderful! Never have I seen that!', { tip: b('Strong, higher first syllable on absolument and jamais.', 'Première syllabe forte et haute sur absolument et jamais.') }),
    ],
    [
      b('Emphatic stress: first syllable, stronger and higher.', 'Accent d’insistance : première syllabe, plus forte et plus haute.'),
      b('It adds emotion: absolument, formidable, jamais.', 'Il ajoute de l’émotion : absolument, formidable, jamais.'),
      b('Use it sparingly; normal stress stays final.', 'Utilisez-le avec mesure ; l’accent normal reste final.'),
    ],
    [['insupportable', b('unbearable', 'qu’on ne peut supporter')], ['formidable', b('wonderful', 'excellent')], ['un spectacle', b('a show', 'représentation')]],
  ),
];
