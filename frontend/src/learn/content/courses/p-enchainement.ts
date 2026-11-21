import type { CourseAbout } from '../../types';
import { b, card, dict, gap, hear, lesson, mc, ord, P, say, sort } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'French is not spoken word by word but in smooth groups where words flow into each other. A pronounced final consonant moves to the next vowel (enchaînement: il‿arrive, avec‿elle), vowels drop before another vowel (élision: l’ami, j’ai, qu’il) and the voice never stops between words of the same group. This course trains these linking habits that make French sound fluent, and help you understand fast speech.',
    'Le français ne se parle pas mot à mot, mais par groupes fluides où les mots coulent les uns dans les autres. Une consonne finale prononcée passe à la voyelle suivante (enchaînement : il‿arrive, avec‿elle), les voyelles tombent devant une autre voyelle (élision : l’ami, j’ai, qu’il) et la voix ne s’arrête jamais entre les mots d’un même groupe. Ce cours entraîne ces habitudes de liaison qui rendent le français fluide, et qui aident à comprendre l’oral rapide.',
  ),
  outcomes: [
    b('Make the enchaînement of final consonants', 'Faire l’enchaînement des consonnes finales'),
    b('Apply elision automatically', 'Appliquer l’élision automatiquement'),
    b('Speak in rhythmic groups', 'Parler par groupes rythmiques'),
    b('Understand where words begin and end', 'Comprendre où commencent et finissent les mots'),
  ],
};

const C = 'p-enchainement';
export default [
  lesson(C, 1, ['consonant-linking', 'l-enchainement-consonantique'],
    b('Consonant linking: enchaînement', 'L’enchaînement consonantique'),
    b('Move a pronounced final consonant onto the next vowel.', 'Faire passer une consonne finale prononcée sur la voyelle suivante.'),
    [b('Spot pronounced final consonants', 'Repérer les consonnes finales prononcées'), b('Link them to the next vowel', 'Les lier à la voyelle suivante'), b('Hear new syllables', 'Entendre les nouvelles syllabes')],
    13,
    [
      card(b('The consonant moves', 'La consonne se déplace'), b('When a word ends with a **pronounced consonant** and the next starts with a **vowel**, the consonant **moves** to the next syllable: **il‿arrive** [i-la-ʁiv], **avec‿elle** [a-vɛ-kɛl], **une‿amie** [y-na-mi], **quatre‿enfants** [ka-tʁɑ̃-fɑ̃]. It is not a liaison: the consonant is always pronounced anyway.', 'Quand un mot finit par une **consonne prononcée** et que le suivant commence par une **voyelle**, la consonne **passe** à la syllabe suivante : **il‿arrive** [i-la-ʁiv], **avec‿elle** [a-vɛ-kɛl], **une‿amie** [y-na-mi], **quatre‿enfants** [ka-tʁɑ̃-fɑ̃]. Ce n’est pas une liaison : la consonne se prononce de toute façon.'), {
        ex: [['Il arrive avec elle.', '[i-la-ʁi-va-vɛ-kɛl]'], ['Une amie américaine', '[y-na-mi-a-me-ʁi-kɛn]']],
      }),
      hear('Elle habite à Paris.', b('Listen. How are elle and habite linked?', 'Écoutez. Comment elle et habite sont-ils liés ?'), [b('[ɛ-la-bit]: the l moves to habite', '[ɛ-la-bit] : le l passe sur habite'), b('A pause between them', 'Une pause entre les deux'), b('The l is silent', 'Le l est muet'), b('An extra [z] is added', 'Un [z] est ajouté')]),
      hear('Il a une idée.', b('Listen. What do you hear?', 'Écoutez. Qu’entendez-vous ?'), [b('[i-la-y-ni-de]', '[i-la-y-ni-de]'), b('[il / a / yn / ide]', '[il / a / yn / ide]'), b('[i-a-y-de]', '[i-a-y-de]')], { voice: 'm' }),
      ord(P.order, 'Il arrive avec une amie.', { tr: 'He’s arriving with a friend.' }),
      dict('Elle arrive avec une amie italienne.', { hint: b('All the words flow together.', 'Tous les mots s’enchaînent.') }),
      say('Il arrive avec une amie à Avignon.', 'He arrives with a friend in Avignon.', { tip: b('No pause: il‿arrive‿avec‿une‿amie‿à‿Avignon.', 'Sans pause : il‿arrive‿avec‿une‿amie‿à‿Avignon.') }),
    ],
    [
      b('Pronounced final consonant + vowel → the consonant moves.', 'Consonne finale prononcée + voyelle → la consonne se déplace.'),
      b('il‿arrive [i-la-ʁiv], avec‿elle [a-vɛ-kɛl].', 'il‿arrive [i-la-ʁiv], avec‿elle [a-vɛ-kɛl].'),
      b('No pause between words of the same group.', 'Pas de pause entre les mots d’un même groupe.'),
    ],
    [['habiter', b('to live (somewhere)', 'avoir son domicile')], ['une idée', b('an idea', 'pensée')], ['arriver', b('to arrive', 'venir')]],
  ),
  lesson(C, 2, ['elision', 'l-elision'],
    b('Elision: l’, j’, qu’, n’', 'L’élision : l’, j’, qu’, n’'),
    b('Drop the vowel before another vowel or a silent h.', 'Faire tomber la voyelle devant une autre voyelle ou un h muet.'),
    [b('Apply elision to le, la, je, ne, de, que, se', 'Appliquer l’élision à le, la, je, ne, de, que, se'), b('Recognise h muet and h aspiré', 'Reconnaître h muet et h aspiré'), b('Hear elided forms', 'Entendre les formes élidées')],
    13,
    [
      card(b('Elision', 'L’élision'), b('Before a vowel or a **silent h**, the final vowel of **le, la, je, me, te, se, ne, de, que** drops: **l’ami, l’heure, j’aime, je n’ai pas, qu’il, s’il** (si + il only). **h aspiré** blocks elision: **le héros, la hauteur, le haricot** (no l’).', 'Devant une voyelle ou un **h muet**, la voyelle finale de **le, la, je, me, te, se, ne, de, que** tombe : **l’ami, l’heure, j’aime, je n’ai pas, qu’il, s’il** (si + il seulement). Le **h aspiré** bloque l’élision : **le héros, la hauteur, le haricot** (pas de l’).'), {
        ex: [['J’aime l’hiver.', 'élision ×2'], ['Je n’ai pas d’argent.', 'élision ×3'], ['le héros, la honte', 'h aspiré']],
      }),
      mc(P.form, ['Je n’ai pas d’amis ici.', 'Je ne ai pas de amis ici.', 'J’ne ai pas d’amis ici.', 'Je n’ai pas de amis ici.']),
      sort(b('Elision or not?', 'Élision ou non ?'), [b('elision (l’)', 'élision (l’)'), b('no elision (le / la)', 'pas d’élision (le / la)')], [['… hôtel', 0], ['… héros', 1], ['… heure', 0], ['… haricot', 1], ['… homme', 0], ['… hibou', 1]]),
      hear('Qu’est-ce qu’il a dit ?', b('Listen. How many elisions?', 'Écoutez. Combien d’élisions ?'), [b('two: qu’est-ce, qu’il', 'deux : qu’est-ce, qu’il'), b('none', 'aucune'), b('one', 'une'), b('four', 'quatre')]),
      gap(P.complete, '___ aime beaucoup ___ hiver, mais je ___ ai pas de bottes.', ['J’', 'l’', 'n’']),
      say('J’aime l’hiver, mais je n’ai pas d’écharpe.', 'I love winter, but I don’t have a scarf.'),
    ],
    [
      b('le, la, je, me, te, se, ne, de, que + vowel or silent h → l’, j’, n’…', 'le, la, je, me, te, se, ne, de, que + voyelle ou h muet → l’, j’, n’…'),
      b('si → s’ only before il / ils.', 'si → s’ seulement devant il / ils.'),
      b('h aspiré blocks elision: le héros, le haricot.', 'Le h aspiré bloque l’élision : le héros, le haricot.'),
    ],
    [['un héros', b('a hero', 'personne admirable')], ['un haricot', b('a bean', 'légume')], ['une écharpe', b('a scarf', 'pour le cou')]],
  ),
  lesson(C, 3, ['speaking-in-groups', 'parler-par-groupes'],
    b('Speaking in rhythmic groups', 'Parler par groupes rythmiques'),
    b('Group words by meaning and say each group in one breath.', 'Regrouper les mots par le sens et dire chaque groupe d’un souffle.'),
    [b('Cut a sentence into groups', 'Découper une phrase en groupes'), b('Link inside a group', 'Lier à l’intérieur d’un groupe'), b('Pause only between groups', 'Faire une pause seulement entre les groupes')],
    13,
    [
      card(b('Rhythmic groups', 'Les groupes rythmiques'), b('A French sentence is a series of **groups of meaning** (3–7 syllables). Inside a group, everything is linked; a short pause comes **between** groups: **Ce matin | mon voisin | est parti au travail | à vélo.** Never pause between an article and its noun, or a pronoun and its verb.', 'Une phrase française est une suite de **groupes de sens** (3 à 7 syllabes). À l’intérieur d’un groupe, tout est lié ; une courte pause vient **entre** les groupes : **Ce matin | mon voisin | est parti au travail | à vélo.** Jamais de pause entre un article et son nom, ni entre un pronom et son verbe.')),
      mc(P.choose, ['Le week-end dernier | nous sommes allés | chez nos amis | à la campagne.', 'Le | week-end dernier nous | sommes allés chez | nos amis à la | campagne.', 'Le week-end | dernier nous sommes | allés chez nos | amis à la campagne.', 'Le week-end dernier nous | sommes allés chez nos amis | à la campagne.'], { fr: 'Quel découpage est naturel ?' }),
      hear('Tous les matins, elle prend un café avec une amie, au coin de la rue.', b('Listen. How many groups?', 'Écoutez. Combien de groupes ?'), [b('three', 'trois'), b('one', 'un'), b('six', 'six'), b('ten', 'dix')]),
      dict('Tous les matins, elle prend un café avec une amie.', { hint: b('Two groups: Tous les matins | elle prend un café avec une amie.', 'Deux groupes : Tous les matins | elle prend un café avec une amie.') }),
      ord(P.order, 'Ce matin, mon voisin est parti au travail à vélo.', { tr: 'This morning my neighbour left for work by bike.' }),
      say('Ce matin, mon voisin est parti au travail à vélo, avec un ami.', 'This morning my neighbour left for work by bike, with a friend.', { tip: b('Pauses only at the commas.', 'Des pauses seulement aux virgules.') }),
    ],
    [
      b('Speak in groups of meaning (3–7 syllables).', 'Parlez par groupes de sens (3 à 7 syllabes).'),
      b('Inside a group: no pause, everything linked.', 'Dans un groupe : pas de pause, tout est lié.'),
      b('Never pause between article + noun or pronoun + verb.', 'Jamais de pause entre article + nom ou pronom + verbe.'),
    ],
    [['le coin', b('the corner', 'angle de la rue')], ['un souffle', b('a breath', 'respiration')], ['la campagne', b('the countryside', 'hors de la ville')]],
  ),
];
