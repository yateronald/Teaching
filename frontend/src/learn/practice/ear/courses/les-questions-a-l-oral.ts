// B2 · Spoken questions: intonation, the question word at the end, reduced est-ce que.
import { ear, ex, fill, pick, situation } from '../authoring';

const TEL = 'Allô ? T’es où, là ? On t’attend depuis vingt minutes. Tu arrives quand ? Et tu viens avec qui, finalement ?';
const TEL_SHOW = 'Allô ? T’es {où}, là ? On t’attend depuis vingt minutes. Tu arrives {quand} ? Et tu viens avec {qui}, finalement ?';

export default ear('les-questions-a-l-oral', {
  rule: [
    ['Les questions de tous les jours', 'Everyday questions'],
    [
      'À l’écrit, on apprend __Où vas-tu ?__ ou __Est-ce que tu viens ?__. À l’oral, on dit surtout : __Tu vas où ?__, __Tu viens ?__ avec une voix qui monte, __C’est qui ?__, __Tu fais quoi ?__. Le mot interrogatif (où, quand, qui, quoi, comment) se place souvent **à la fin**.\n\nEt __qu’est-ce que__ se réduit : __Qu’est-ce que tu fais ?__ se dit [kɛsktyfɛ]. Pour comprendre la question, écoutez le dernier mot.',
      'In writing you learn __Où vas-tu ?__ or __Est-ce que tu viens ?__. In speech people mostly say: __Tu vas où ?__, __Tu viens ?__ with a rising voice, __C’est qui ?__, __Tu fais quoi ?__. The question word (où, quand, qui, quoi, comment) often comes **at the end**.\n\nAnd __qu’est-ce que__ shrinks: __Qu’est-ce que tu fais ?__ sounds like [kɛsktyfɛ]. To understand the question, listen to the last word.',
    ],
  ],
  goal: ['Comprendre une question orale, même sans inversion ni est-ce que.', 'Understand a spoken question, even without inversion or est-ce que.'],
  examples: [
    ex('Tu fais quoi ce soir ?', 'Tu fais {quoi} ce soir ?', ['Le mot de la question est à la fin.', 'The question word comes last.']),
    ex('C’est qui, ce monsieur ?', 'C’est {qui}, ce monsieur ?', ['= Qui est ce monsieur ?', '= Who is that man?']),
    ex('Qu’est-ce que tu en penses ?', '{Qu’est-ce que} tu en penses ?', ['Prononcé très vite : [kɛsk].', 'Said very fast: [kɛsk].'], 'Qu’est-c’que t’en penses ?'),
  ],
  items: [
    pick('Tu pars quand ?', ['Il demande la date du départ', 'Il demande la destination', 'Il demande avec qui'], 0, 'Tu pars {quand} ?', [
      'Quand = le moment.', 'Quand = when.',
    ], ['Que demande-t-il ?', 'What is he asking?']),
    pick('Il s’appelle comment, ton frère ?', ['Le nom du frère', 'L’âge du frère', 'Le métier du frère'], 0, 'Il s’appelle {comment}, ton frère ?', [
      'Comment il s’appelle = quel est son nom.', 'What is his name.',
    ], ['Que veut-on savoir ?', 'What do they want to know?']),
    pick('Ça coûte combien ?', ['Le prix', 'La taille', 'L’heure'], 0, 'Ça coûte {combien} ?', [
      'Combien = la quantité, ici le prix.', 'Combien = how much.',
    ], ['Que demande-t-on ?', 'What is being asked?']),
    pick('Tu viens ?', ['Tu viens ?', 'Tu viens.'], 0, 'Tu viens ? ↗', [
      'La voix monte à la fin : c’est une question.', 'The voice rises at the end: it is a question.',
    ]),
    pick('On mange où ?', ['Le lieu du repas', 'L’heure du repas', 'Le menu'], 0, 'On mange {où} ?', [
      'Où = le lieu.', 'Où = where.',
    ], ['Que veut-on savoir ?', 'What do they want to know?']),
    fill('Tu fais quoi demain ?', 'Tu fais ___ demain ?', 'quoi', 'Tu fais {quoi} demain ?', [
      'Quoi à la fin = qu’est-ce que tu fais.', 'Quoi at the end = what are you doing.',
    ]),
    fill('C’est qui, au téléphone ?', 'C’est ___, au téléphone ?', 'qui', 'C’est {qui}, au téléphone ?', [
      'C’est qui = qui est-ce.', 'C’est qui = who is it.',
    ]),
    fill('Tu rentres à quelle heure ?', 'Tu rentres à ___ heure ?', 'quelle', 'Tu rentres à {quelle} heure ?', [
      'À quelle heure : la question sur l’horaire.', 'At what time.',
    ]),
    situation(TEL, 'Que demande la personne en premier ?', ['Où se trouve son ami', 'Avec qui il vient', 'L’heure qu’il est'], 0, TEL_SHOW, [
      '« T’es où, là ? » = où es-tu ?', '« T’es où, là ? » = where are you?',
    ]),
    situation(TEL, 'Quelle est la dernière question ?', ['Avec qui il vient', 'Quand il arrive', 'Pourquoi il est en retard'], 0, TEL_SHOW, [
      '« Et tu viens avec qui, finalement ? »', '« And who are you coming with, in the end? »',
    ]),
  ],
  takeaway: [
    'À l’oral, la question se fait souvent par l’intonation (Tu viens ?) ou avec le mot interrogatif à la fin (Tu vas où ? C’est qui ?). Qu’est-ce que se réduit à [kɛsk].',
    'In speech, questions are often made by intonation (Tu viens ?) or with the question word at the end (Tu vas où ? C’est qui ?). Qu’est-ce que shrinks to [kɛsk].',
  ],
});
