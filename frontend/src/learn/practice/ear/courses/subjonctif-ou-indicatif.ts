// C1 · Hearing the subjunctive: qu’il fasse, qu’il vienne, qu’il soit, qu’il aille.
import { ear, ex, fill, pick, situation } from '../authoring';

const PROJET = 'Je ne crois pas qu’il puisse finir à temps. Il faudrait qu’on lui donne un coup de main, avant que le client ne s’impatiente.';
const PROJET_SHOW = 'Je ne crois pas qu’il {puisse} finir à temps. Il faudrait qu’on lui {donne} un coup de main, avant que le client ne s’{impatiente}.';

export default ear('subjonctif-ou-indicatif', {
  rule: [
    ['Le subjonctif à l’oral', 'The subjunctive by ear'],
    [
      'Le subjonctif s’entend surtout avec les verbes irréguliers : __qu’il fasse__ (≠ il fait), __qu’il vienne__ (≠ il vient), __qu’il soit__, __qu’il ait__, __qu’il aille__, __qu’il puisse__, __qu’il sache__.\n\nIl apparaît après la volonté (__je veux que__), la nécessité (__il faut que__), le doute (__je doute que__), l’émotion (__je suis content que__) et certaines conjonctions (__bien que, pour que, avant que__). Après une opinion affirmée, on garde l’indicatif : __je pense qu’il vient__. Le verbe vous dit donc si l’on parle d’un fait ou d’un souhait, d’un doute, d’une nécessité.',
      'The subjunctive is heard mostly with irregular verbs: __qu’il fasse__ (≠ il fait), __qu’il vienne__ (≠ il vient), __qu’il soit__, __qu’il ait__, __qu’il aille__, __qu’il puisse__, __qu’il sache__.\n\nIt follows will (__je veux que__), necessity (__il faut que__), doubt (__je doute que__), emotion (__je suis content que__) and some conjunctions (__bien que, pour que, avant que__). After an opinion stated as such, the indicative stays: __je pense qu’il vient__. So the verb tells you whether it is a fact or a wish, a doubt, a necessity.',
    ],
  ],
  goal: ['Entendre le subjonctif et comprendre ce qu’il exprime.', 'Hear the subjunctive and understand what it expresses.'],
  examples: [
    ex('Il faut qu’il vienne.', 'Il faut qu’il {vienne}.', ['Subjonctif : une nécessité.', 'Subjunctive: a necessity.']),
    ex('Je sais qu’il vient.', 'Je sais qu’il {vient}.', ['Indicatif : un fait.', 'Indicative: a fact.']),
    ex('Bien qu’il soit tard, on continue.', 'Bien qu’il {soit} tard, on continue.', ['Subjonctif après « bien que ».', 'Subjunctive after « bien que ».']),
  ],
  items: [
    pick('Je veux qu’il fasse ses devoirs.', ['Je vois qu’il fait ses devoirs.', 'Je veux qu’il fasse ses devoirs.'], 1, 'Je veux qu’il {fasse} ses devoirs.', [
      '« Fasse » [fas] : un souhait. « Il fait » [fɛ] serait un fait observé.', '« Fasse » [fas]: a wish. « Il fait » [fɛ] would be an observed fact.',
    ]),
    pick('Je pense qu’il vient demain.', ['Une opinion présentée comme probable', 'Un souhait', 'Un doute fort'], 0, 'Je pense qu’il {vient} demain.', [
      'Indicatif après « je pense » : on présente la chose comme probable.', 'Indicative after « je pense »: presented as likely.',
    ], ['La personne exprime…', 'The speaker expresses…']),
    pick('Je doute qu’il vienne.', ['Une certitude', 'Une promesse', 'Un doute'], 2, 'Je doute qu’il {vienne}.', [
      'Subjonctif après le doute.', 'Subjunctive after doubt.',
    ], ['La personne exprime…', 'The speaker expresses…']),
    pick('Il faut que tu saches la vérité.', ['Tu connais déjà la vérité', 'Tu dois connaître la vérité'], 1, 'Il faut que tu {saches} la vérité.', [
      '« Que tu saches » [saʃ] : subjonctif de savoir, une nécessité.', '« Que tu saches »: subjunctive of savoir, a necessity.',
    ], ['Que dit la personne ?', 'What is the speaker saying?']),
    pick('Je suis content que tu sois là.', ['Je suis content que tu sois là.', 'Je suis content, tu es là.'], 0, 'Je suis content que tu {sois} là.', [
      '« Que tu sois » [swa] après une émotion.', '« Que tu sois » [swa] after an emotion.',
    ]),
    fill('Il faut que j’aille à la banque.', 'Il faut que j’___ à la banque.', 'aille', 'Il faut que j’{aille} à la banque.', [
      'J’aille [aj] : subjonctif d’aller.', 'J’aille [aj]: subjunctive of aller.',
    ]),
    fill('Bien qu’elle soit fatiguée, elle continue.', 'Bien qu’elle ___ fatiguée, elle continue.', 'soit', 'Bien qu’elle {soit} fatiguée, elle continue.', [
      '« Bien que » + subjonctif.', '« Bien que » + subjunctive.',
    ]),
    fill('Je voudrais que vous puissiez venir.', 'Je voudrais que vous ___ venir.', 'puissiez', 'Je voudrais que vous {puissiez} venir.', [
      'Puissiez : subjonctif de pouvoir.', 'Puissiez: subjunctive of pouvoir.',
    ]),
    situation(PROJET, 'Que pense la personne ?', ['Qu’il a déjà fini', 'Qu’il ne pourra probablement pas finir à temps', 'Qu’il finira en avance'], 1, PROJET_SHOW, [
      '« Je ne crois pas qu’il puisse » : un doute.', '« I doubt he can »: a doubt.',
    ]),
    situation(PROJET, 'Que propose-t-elle ?', ['De l’aider', 'De prévenir le client du retard', 'De changer de client'], 0, PROJET_SHOW, [
      '« Il faudrait qu’on lui donne un coup de main. »', '« We should give him a hand. »',
    ]),
  ],
  takeaway: [
    'Qu’il fasse, vienne, soit, ait, aille, puisse, sache : le subjonctif signale un souhait, un doute, une nécessité ou une émotion. L’indicatif présente un fait.',
    'Qu’il fasse, vienne, soit, ait, aille, puisse, sache: the subjunctive signals a wish, a doubt, a necessity or an emotion. The indicative presents a fact.',
  ],
});
