import type { CourseAbout } from '../../types';
import { b, card, dlg, exam, gap, lesson, mc, P, say, sort } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Task 3 of the TCF speaking test (about 4 minutes 30, no preparation) asks you to express and defend a point of view on a question of general interest: « Faut-il interdire les téléphones à l’école ? », « Le télétravail est-il l’avenir ? ». You must take a position, argue with examples, and answer the examiner’s follow-up questions. This course gives you a fast structure, B2 opinion phrases and techniques to think while speaking.',
    'La tâche 3 de l’expression orale du TCF (environ 4 min 30, sans préparation) demande d’exprimer et de défendre un point de vue sur une question d’intérêt général : « Faut-il interdire les téléphones à l’école ? », « Le télétravail est-il l’avenir ? ». Il faut prendre position, argumenter avec des exemples et répondre aux relances de l’examinateur. Ce cours vous donne une structure rapide, les formules d’opinion du B2 et des techniques pour réfléchir en parlant.',
  ),
  outcomes: [
    b('Take a position immediately', 'Prendre position immédiatement'),
    b('Argue with structure and examples', 'Argumenter avec structure et exemples'),
    b('Answer follow-up questions', 'Répondre aux relances'),
    b('Gain time while thinking', 'Gagner du temps en réfléchissant'),
  ],
};

const C = 'tcf-eo-task3';
export default [
  lesson(C, 1, ['instant-structure', 'la-structure-immediate'],
    b('An instant structure', 'Une structure immédiate'),
    b('Use a 4-step structure you can apply to any question without preparation.', 'Utiliser une structure en 4 étapes applicable à toute question sans préparation.'),
    [b('Know task 3', 'Connaître la tâche 3'), b('Rephrase the question', 'Reformuler la question'), b('Apply the 4-step structure', 'Appliquer la structure en 4 étapes')],
    13,
    [
      exam(b('Task 3', 'Tâche 3'), b('About **4 min 30**, **no preparation**. The examiner reads a question of general interest. You speak, then answer **follow-up questions**. Assessed: **clear position, arguments, examples, connectors, vocabulary and grammar** (B1–C1 range).', 'Environ **4 min 30**, **sans préparation**. L’examinateur lit une question d’intérêt général. Vous parlez, puis vous répondez aux **relances**. Critères : **position claire, arguments, exemples, connecteurs, lexique et grammaire** (niveaux B1 à C1).')),
      card(b('The 4 steps', 'Les 4 étapes'), b('1. **Rephrase** the question (it gives you time): **La question est de savoir si…** 2. **Position**: **Personnellement, je suis plutôt favorable / opposé(e) à…** 3. **Two arguments + examples**: **D’abord… Par exemple… Ensuite…** 4. **Nuance + conclusion**: **Cela dit, … · Donc, pour moi, …**', '1. **Reformulez** la question (cela vous donne du temps) : **La question est de savoir si…** 2. **Position** : **Personnellement, je suis plutôt favorable / opposé(e) à…** 3. **Deux arguments + exemples** : **D’abord… Par exemple… Ensuite…** 4. **Nuance + conclusion** : **Cela dit, … · Donc, pour moi, …**')),
      say('La question est de savoir s’il faut interdire les téléphones à l’école. Personnellement, je suis plutôt favorable à cette interdiction, pour deux raisons.', 'The question is whether phones should be banned at school. Personally, I’m rather in favour of this ban, for two reasons.'),
      sort(b('Which step?', 'Quelle étape ?'), [b('rephrase / position', 'reformuler / position'), b('argument / example', 'argument / exemple'), b('nuance / conclusion', 'nuance / conclusion')], [['La question est de savoir si…', 0], ['Par exemple, dans l’école de ma fille…', 1], ['Cela dit, il faut reconnaître que…', 2], ['Je suis plutôt opposé à cette idée.', 0], ['D’abord, les élèves se concentrent mieux.', 1], ['Donc, pour moi, c’est une bonne mesure.', 2]]),
      mc(P.best, ['La question est de savoir si le télétravail est l’avenir. Personnellement, je pense qu’il le sera en partie, pour deux raisons…', 'Télétravail, je ne sais pas.', 'Oui.', 'C’est une question difficile, je n’ai pas d’avis.'], { fr: '— Le télétravail est-il l’avenir du travail ?' }),
    ],
    [
      b('About 4 min 30, no preparation, then follow-up questions.', 'Environ 4 min 30, sans préparation, puis relances.'),
      b('Rephrase → position → 2 arguments + examples → nuance + conclusion.', 'Reformuler → position → 2 arguments + exemples → nuance + conclusion.'),
      b('Rephrasing gives you thinking time.', 'Reformuler vous donne du temps de réflexion.'),
    ],
    [['être favorable à', b('to be in favour of', 'être pour')], ['une interdiction', b('a ban', 'fait d’interdire')], ['une relance', b('a follow-up question', 'nouvelle question')]],
  ),
  lesson(C, 2, ['arguments-and-examples', 'arguments-et-exemples'],
    b('Arguments and examples on frequent topics', 'Arguments et exemples sur les sujets fréquents'),
    b('Build a bank of arguments on recurring themes: technology, environment, work, education.', 'Construire une banque d’arguments sur les thèmes récurrents : technologie, environnement, travail, éducation.'),
    [b('Prepare arguments by theme', 'Préparer des arguments par thème'), b('Give concrete examples', 'Donner des exemples concrets'), b('Use cause and consequence', 'Employer cause et conséquence')],
    13,
    [
      card(b('Argument bank', 'Banque d’arguments'), b('**Santé** (stress, sommeil, activité physique) · **Économie** (coût, emploi, pouvoir d’achat) · **Environnement** (pollution, ressources) · **Société** (lien social, inégalités, sécurité) · **Éducation** (concentration, autonomie, égalité des chances). Almost any question can be answered with **two of these angles**. Cause/consequence: **grâce à, à cause de, c’est pourquoi, ce qui entraîne**.', '**Santé** (stress, sommeil, activité physique) · **Économie** (coût, emploi, pouvoir d’achat) · **Environnement** (pollution, ressources) · **Société** (lien social, inégalités, sécurité) · **Éducation** (concentration, autonomie, égalité des chances). On peut répondre à presque toute question avec **deux de ces angles**. Cause/conséquence : **grâce à, à cause de, c’est pourquoi, ce qui entraîne**.')),
      sort(b('Which angle?', 'Quel angle ?'), [b('health', 'santé'), b('economy', 'économie'), b('society', 'société')], [['moins de stress', 0], ['des économies pour les familles', 1], ['moins de liens entre collègues', 2], ['un meilleur sommeil', 0], ['la création d’emplois', 1], ['plus d’inégalités', 2]]),
      mc(P.best, ['D’abord, le télétravail réduit le stress, grâce à la fin des trajets quotidiens. Par exemple, mon frère gagne deux heures par jour, ce qui lui permet de faire du sport.', 'Le télétravail, c’est bien parce que c’est bien.', 'Beaucoup de gens font du télétravail.', 'Je ne fais pas de télétravail.'], { fr: 'Quel argument est le mieux construit ?' }),
      gap(P.complete, 'Les écrans perturbent le sommeil des enfants, ___ entraîne des difficultés de concentration. C’est ___ je suis pour une limite.', ['ce qui', 'pourquoi']),
      say('D’abord, cette mesure protège la santé des élèves. Par exemple, ils dorment mieux, ce qui améliore leur concentration.', 'First, this measure protects pupils’ health. For example, they sleep better, which improves their concentration.'),
    ],
    [
      b('Angles: santé, économie, environnement, société, éducation.', 'Angles : santé, économie, environnement, société, éducation.'),
      b('Argument + concrete example (family, country, job).', 'Argument + exemple concret (famille, pays, travail).'),
      b('Cause/consequence: grâce à, à cause de, ce qui entraîne, c’est pourquoi.', 'Cause/conséquence : grâce à, à cause de, ce qui entraîne, c’est pourquoi.'),
    ],
    [['le pouvoir d’achat', b('purchasing power', 'capacité à acheter')], ['l’égalité des chances', b('equal opportunities', 'mêmes chances pour tous')], ['perturber', b('to disrupt', 'déranger')]],
  ),
  lesson(C, 3, ['follow-up-questions', 'les-relances'],
    b('Handling follow-up questions', 'Gérer les relances'),
    b('Answer the examiner’s counter-arguments and extend your view.', 'Répondre aux contre-arguments de l’examinateur et prolonger son point de vue.'),
    [b('Answer a counter-argument', 'Répondre à un contre-argument'), b('Gain time naturally', 'Gagner du temps naturellement'), b('Extend to a new angle', 'Élargir à un nouvel angle')],
    13,
    [
      card(b('Follow-up techniques', 'Techniques de relance'), b('Gain time: **C’est une question intéressante… · Je n’y avais pas pensé, mais…** Counter-argument: **C’est vrai, mais… · Je comprends cet argument, cependant…** Extend: **D’ailleurs, on pourrait aussi parler de… · Dans mon pays, par exemple…** Keep your position consistent, but **nuance** it if needed.', 'Gagner du temps : **C’est une question intéressante… · Je n’y avais pas pensé, mais…** Contre-argument : **C’est vrai, mais… · Je comprends cet argument, cependant…** Élargir : **D’ailleurs, on pourrait aussi parler de… · Dans mon pays, par exemple…** Gardez une position cohérente, mais **nuancez**-la si besoin.')),
      dlg(b('Follow-up questions', 'Les relances'), undefined, [['Examinateur', 'm'], ['Vous', 'f']], [
        [0, 'Mais si on interdit les téléphones, comment les parents peuvent-ils joindre leurs enfants en cas d’urgence ?', 'But if phones are banned, how can parents reach their children in an emergency?'],
        [1, { options: ['C’est vrai, c’est un argument important. Mais en cas d’urgence, les parents peuvent appeler l’école, comme avant. Et les élèves pourraient garder le téléphone dans leur sac, éteint.', 'Ce n’est pas important.', 'Je ne sais pas.'] }],
        [0, 'Et les téléphones peuvent aussi servir à apprendre, non ?', 'And phones can also be used for learning, can’t they?'],
        [1, { options: ['Je comprends, cependant l’école peut utiliser des tablettes encadrées pour ça. D’ailleurs, dans mon pays, plusieurs écoles le font déjà avec succès.', 'Non, jamais.', 'Oui, vous avez raison, j’ai changé d’avis.'] }],
      ]),
      sort(b('Gain time, answer or extend?', 'Gagner du temps, répondre ou élargir ?'), [b('gain time', 'gagner du temps'), b('answer', 'répondre'), b('extend', 'élargir')], [['C’est une question intéressante…', 0], ['C’est vrai, mais…', 1], ['D’ailleurs, on pourrait aussi parler de…', 2], ['Je n’y avais pas pensé, mais…', 0], ['Je comprends cet argument, cependant…', 1], ['Dans mon pays, par exemple…', 2]]),
      say('C’est une question intéressante. Je comprends cet argument, cependant je pense que les avantages restent plus importants.', 'That’s an interesting question. I understand that argument; however, I think the advantages remain greater.'),
    ],
    [
      b('Gain time: C’est une question intéressante… Je n’y avais pas pensé…', 'Gagner du temps : C’est une question intéressante… Je n’y avais pas pensé…'),
      b('Answer: C’est vrai, mais… Je comprends, cependant…', 'Répondre : C’est vrai, mais… Je comprends, cependant…'),
      b('Extend: D’ailleurs… Dans mon pays…', 'Élargir : D’ailleurs… Dans mon pays…'),
    ],
    [['joindre', b('to reach (by phone)', 'contacter')], ['encadré', b('supervised', 'avec des règles')], ['une urgence', b('an emergency', 'situation grave')]],
  ),
];
