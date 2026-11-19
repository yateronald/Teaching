// C2 · Prosody: pauses and melody carry the punctuation, and change who does what.
import { ear, ex, fill, pick, situation } from '../authoring';

const PROCES = 'Mon associé, prétend mon avocat, a menti au tribunal. Mais mon avocat, lui, n’était pas présent à l’audience.';
const PROCES_SHOW = 'Mon associé, {prétend mon avocat}, a menti au tribunal. Mais mon avocat, lui, {n’était pas présent} à l’audience.';

export default ear('la-ponctuation-qui-s-entend', {
  rule: [
    ['La ponctuation s’entend', 'You can hear punctuation'],
    [
      'À l’oral, la ponctuation devient pauses et mélodie, et elle peut changer qui fait quoi :\n\n__Le professeur, dit l’élève, est absent.__ (l’élève parle : le professeur est absent)\n__Le professeur dit : l’élève est absent.__ (le professeur parle : l’élève est absent)\n\nDe même, __Les élèves, qui étaient malades, sont restés__ (tous les élèves, tous malades) n’est pas __Les élèves qui étaient malades sont restés__ (seulement ceux qui étaient malades). Écoutez où la voix s’arrête et où elle descend : une incise se dit plus bas et plus vite, entre deux pauses.',
      'In speech, punctuation becomes pauses and melody, and it can change who does what:\n\n__Le professeur, dit l’élève, est absent.__ (the pupil speaks: the teacher is absent)\n__Le professeur dit : l’élève est absent.__ (the teacher speaks: the pupil is absent)\n\nLikewise, __Les élèves, qui étaient malades, sont restés__ (all the pupils, all ill) is not __Les élèves qui étaient malades sont restés__ (only those who were ill). Listen to where the voice stops and drops: an aside is said lower and faster, between two pauses.',
    ],
  ],
  goal: ['Utiliser les pauses et la mélodie pour comprendre qui fait quoi.', 'Use pauses and melody to work out who does what.'],
  examples: [
    ex('Le professeur, dit l’élève, est absent.', 'Le professeur, {dit l’élève}, est absent.', ['L’élève parle : le professeur est absent.', 'The pupil speaks: the teacher is absent.']),
    ex('Le professeur dit : l’élève est absent.', '{Le professeur dit} : l’élève est absent.', ['Le professeur parle : l’élève est absent.', 'The teacher speaks: the pupil is absent.']),
    ex('On mange, les enfants !', 'On mange, {les enfants} !', ['On appelle les enfants à table.', 'Calling the children to the table.']),
  ],
  items: [
    pick('Le directeur, dit le secrétaire, est en retard.', ['Le secrétaire', 'Le directeur'], 1, 'Le directeur, {dit le secrétaire}, est en retard.', [
      'L’incise « dit le secrétaire » est entre deux pauses : c’est lui qui parle, du directeur.', 'The aside is between pauses: the secretary is speaking, about the director.',
    ], ['Qui est en retard ?', 'Who is late?']),
    pick('Le directeur dit : le secrétaire est en retard.', ['Le secrétaire', 'Le directeur'], 0, '{Le directeur dit} : le secrétaire est en retard.', [
      'Sans pause après « directeur » : c’est le directeur qui parle.', 'No pause after « directeur »: the director is speaking.',
    ], ['Qui est en retard ?', 'Who is late?']),
    pick('Les élèves, qui étaient malades, sont restés chez eux.', ['Seulement les élèves malades', 'Tous les élèves, qui étaient tous malades'], 1, 'Les élèves, {qui étaient malades}, sont restés chez eux.', [
      'Entre pauses : une précision sur tous les élèves.', 'Between pauses: extra information about all the pupils.',
    ], ['Qui est resté chez soi ?', 'Who stayed at home?']),
    pick('Les élèves qui étaient malades sont restés chez eux.', ['Seulement les élèves malades', 'Tous les élèves, qui étaient tous malades'], 0, 'Les élèves {qui étaient malades} sont restés chez eux.', [
      'Sans pause : on sélectionne les élèves malades.', 'No pause: only the ill pupils are meant.',
    ], ['Qui est resté chez soi ?', 'Who stayed at home?']),
    pick('On mange, les enfants !', ['On mange les enfants !', 'On mange, les enfants !'], 1, 'On mange, {les enfants} !', [
      'La pause avant « les enfants » : on les appelle.', 'The pause before « les enfants »: they are being called.',
    ]),
    fill('Pierre, dit Marie, est parti.', 'Pierre, dit ___, est parti.', 'Marie', 'Pierre, {dit Marie}, est parti.', [
      'C’est Marie qui parle : Pierre est parti.', 'Marie is speaking: Pierre has left.',
    ]),
    fill('Il est parti, hélas.', 'Il est parti, ___.', 'hélas', 'Il est parti, {hélas}.', [
      'Après la pause, un commentaire du locuteur.', 'After the pause, the speaker’s comment.',
    ]),
    fill('Mon frère, qui vit à Lyon, arrive demain.', 'Mon frère, qui vit à ___, arrive demain.', 'Lyon', 'Mon frère, {qui vit à Lyon}, arrive demain.', [
      'Entre pauses : une simple précision sur le frère.', 'Between pauses: just extra information about the brother.',
    ]),
    situation(PROCES, 'Selon qui l’associé a-t-il menti ?', ['Selon l’associé', 'Selon le juge', 'Selon l’avocat'], 2, PROCES_SHOW, [
      '« Prétend mon avocat », entre deux pauses : c’est l’avocat qui l’affirme.', 'The lawyer is the one claiming it.',
    ]),
    situation(PROCES, 'Qui n’était pas présent à l’audience ?', ['L’avocat', 'L’associé', 'Le narrateur'], 0, PROCES_SHOW, [
      '« Mon avocat, lui, n’était pas présent » : d’où le doute.', 'The lawyer was not there: hence the doubt.',
    ]),
  ],
  takeaway: [
    'Une incise se dit entre deux pauses, plus bas : « le professeur, dit l’élève, est absent ». Les pauses changent qui parle et qui est concerné.',
    'An aside is said between two pauses, lower: « le professeur, dit l’élève, est absent ». Pauses change who is speaking and who is meant.',
  ],
});
