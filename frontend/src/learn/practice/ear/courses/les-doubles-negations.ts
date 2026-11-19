// C2 · Double negatives that affirm: non sans mal, ne pas manquer de, pas sans savoir.
import { ear, ex, fill, pick, situation } from '../authoring';

const PROJET = 'Vous n’êtes pas sans savoir que le projet a pris du retard. Nous l’avons relancé, non sans difficulté, et je ne manquerai pas de vous tenir informés.';
const PROJET_SHOW = 'Vous {n’êtes pas sans savoir} que le projet a pris du retard. Nous l’avons relancé, {non sans difficulté}, et je {ne manquerai pas de} vous tenir informés.';

export default ear('les-doubles-negations', {
  rule: [
    ['Deux négations qui font un oui', 'Two negatives that make a yes'],
    [
      'Dans la langue soutenue, deux négations s’annulent et affirment, souvent avec nuance :\n\n__non sans mal__ (avec difficulté), __non sans regret__ (avec regret), __vous n’êtes pas sans savoir__ (vous savez sûrement), __je ne manquerai pas de__ (je vais certainement), __on ne peut pas ne pas__ (on est obligé de), __je ne dis pas non__ (j’accepte volontiers), __ce n’est pas impossible__ (c’est possible).\n\nAttention à une faute fréquente, même chez les orateurs : __il n’est pas sans ignorer__ veut logiquement dire « il ignore », le contraire de ce qu’on veut dire.',
      'In formal French, two negatives cancel out and affirm, often with nuance:\n\n__non sans mal__ (with difficulty), __non sans regret__ (with regret), __vous n’êtes pas sans savoir__ (you surely know), __je ne manquerai pas de__ (I will certainly), __on ne peut pas ne pas__ (one has to), __je ne dis pas non__ (I would happily accept), __ce n’est pas impossible__ (it is possible).\n\nBeware a frequent mistake, even among speakers: __il n’est pas sans ignorer__ logically means « he does not know », the opposite of what is meant.',
    ],
  ],
  goal: ['Comprendre une double négation et son sens affirmatif.', 'Understand a double negative and its affirmative meaning.'],
  examples: [
    ex('Il a réussi, non sans mal.', 'Il a réussi, {non sans mal}.', ['= Avec difficulté.', '= With difficulty.']),
    ex('Vous n’êtes pas sans savoir que la date a changé.', 'Vous {n’êtes pas sans savoir} que la date a changé.', ['= Vous savez sûrement.', '= You surely know.']),
    ex('Je ne manquerai pas de vous appeler.', 'Je {ne manquerai pas de} vous appeler.', ['= Je vous appellerai, c’est certain.', '= I will certainly call you.']),
  ],
  items: [
    pick('Vous n’êtes pas sans savoir que la réunion est annulée.', ['Non, vous l’ignorez', 'Oui, vous le savez'], 1, 'Vous {n’êtes pas sans savoir} que la réunion est annulée.', [
      'Pas sans savoir = vous savez.', 'Not without knowing = you know.',
    ], ['La personne pense-t-elle que vous le savez ?', 'Does the speaker think you know?']),
    pick('Il a fini, non sans mal.', ['Très facilement', 'Avec difficulté'], 1, 'Il a fini, {non sans mal}.', [
      'Non sans mal = avec du mal.', 'Not without trouble = with difficulty.',
    ], ['Comment a-t-il fini ?', 'How did he finish?']),
    pick('Je ne manquerai pas de vous écrire.', ['Je vous écrirai, c’est sûr', 'Je ne vous écrirai pas'], 0, 'Je {ne manquerai pas de} vous écrire.', [
      'Ne pas manquer de = faire sans faute.', 'I will be sure to.',
    ], ['Que promet la personne ?', 'What is the speaker promising?']),
    pick('Un café ? Je ne dis pas non.', ['Non merci', 'Oui, volontiers'], 1, 'Un café ? {Je ne dis pas non}.', [
      'Je ne dis pas non = j’accepte avec plaisir.', 'I would not say no.',
    ], ['Veut-il un café ?', 'Does he want a coffee?']),
    pick('Ce n’est pas impossible.', ['C’est possible', 'C’est impossible'], 0, 'Ce n’est {pas impossible}.', [
      'Pas impossible = possible, avec prudence.', 'Not impossible = possible.',
    ], ['Que veut dire la personne ?', 'What does the speaker mean?']),
    fill('Il est parti, non sans regret.', 'Il est parti, non sans ___.', 'regret', 'Il est parti, non sans {regret}.', [
      'Non sans regret = avec regret.', 'With regret.',
    ]),
    fill('On ne peut pas ne pas en parler.', 'On ne peut pas ___ pas en parler.', 'ne', 'On ne peut pas {ne} pas en parler.', [
      'On ne peut pas ne pas = on doit.', 'One cannot not = one must.',
    ]),
    fill('Je ne manquerai pas de le lui dire.', 'Je ne ___ pas de le lui dire.', 'manquerai', 'Je ne {manquerai} pas de le lui dire.', [
      'Je ne manquerai pas de = je le ferai.', 'I will be sure to.',
    ]),
    situation(PROJET, 'Que sait l’auditoire, selon l’orateur ?', ['Rien du tout', 'Que le projet est terminé', 'Que le projet a pris du retard'], 2, PROJET_SHOW, [
      '« Vous n’êtes pas sans savoir » = vous savez.', '« You are surely aware ».',
    ]),
    situation(PROJET, 'Comment le projet a-t-il été relancé ?', ['Avec difficulté', 'Facilement', 'Il n’a pas été relancé'], 0, PROJET_SHOW, [
      '« Non sans difficulté » = avec difficulté.', '« Not without difficulty ».',
    ]),
  ],
  takeaway: [
    'Non sans mal, pas sans savoir, ne pas manquer de, je ne dis pas non, pas impossible : deux négations affirment. Comptez-les : deux négations, un oui.',
    'Non sans mal, pas sans savoir, ne pas manquer de, je ne dis pas non, pas impossible: two negatives affirm. Count them: two negatives, one yes.',
  ],
});
