import type { CourseAbout } from '../../types';
import { b, card, dlg, exam, gap, lesson, mc, P, say, sort, tip } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Task 1 of the TCF speaking test is a short guided interview (about 2 minutes, no preparation): the examiner asks you to introduce yourself and talk about your life, family, work, studies, interests and projects. It sets the tone for the whole test. This course helps you prepare a flexible self-presentation, develop your answers naturally and avoid sounding memorised.',
    'La tâche 1 de l’expression orale du TCF est un court entretien dirigé (environ 2 minutes, sans préparation) : l’examinateur vous demande de vous présenter et de parler de votre vie, votre famille, votre travail, vos études, vos centres d’intérêt et vos projets. Elle donne le ton de toute l’épreuve. Ce cours vous aide à préparer une présentation souple, à développer naturellement vos réponses et à éviter l’effet « récité ».',
  ),
  outcomes: [
    b('Introduce yourself fluently', 'Se présenter avec aisance'),
    b('Develop answers about your life', 'Développer ses réponses sur sa vie'),
    b('Talk about projects and reasons', 'Parler de ses projets et de ses motivations'),
    b('Sound natural, not memorised', 'Parler naturellement, sans réciter'),
  ],
};

const C = 'tcf-eo-task1';
export default [
  lesson(C, 1, ['self-presentation', 'se-presenter'],
    b('A flexible self-presentation', 'Une présentation souple'),
    b('Prepare blocks of information you can combine in any order.', 'Préparer des blocs d’informations combinables dans n’importe quel ordre.'),
    [b('Know task 1', 'Connaître la tâche 1'), b('Prepare information blocks', 'Préparer des blocs d’information'), b('Link the blocks naturally', 'Enchaîner naturellement les blocs')],
    13,
    [
      exam(b('Task 1', 'Tâche 1'), b('About **2 minutes**, **no preparation**. The examiner asks questions like: **Pouvez-vous vous présenter ? · Parlez-moi de votre famille. · Que faites-vous dans la vie ? · Pourquoi apprenez-vous le français ? · Quels sont vos projets ?** Goal: show you can talk about yourself in **clear, connected sentences** (A2–B1 range).', 'Environ **2 minutes**, **sans préparation**. L’examinateur pose des questions comme : **Pouvez-vous vous présenter ? · Parlez-moi de votre famille. · Que faites-vous dans la vie ? · Pourquoi apprenez-vous le français ? · Quels sont vos projets ?** Objectif : montrer que vous savez parler de vous en **phrases claires et liées** (niveau A2–B1).')),
      card(b('Information blocks', 'Les blocs d’information'), b('Prepare 5 blocks of 2–3 sentences: **identity** (nom, âge, origine, ville), **family**, **work / studies**, **interests**, **projects + reason for French** (Je souhaite immigrer au Canada pour… · Je voudrais travailler comme…). Don’t memorise a speech: memorise **ideas and key phrases**, then speak.', 'Préparez 5 blocs de 2 ou 3 phrases : **identité** (nom, âge, origine, ville), **famille**, **travail / études**, **loisirs**, **projets + raison d’apprendre le français** (Je souhaite immigrer au Canada pour… · Je voudrais travailler comme…). N’apprenez pas un discours par cœur : retenez **des idées et des expressions clés**, puis parlez.')),
      say('Je m’appelle Diego, j’ai trente-deux ans et je viens de Bogotá, en Colombie. Je suis ingénieur civil et je travaille dans une entreprise de construction depuis six ans.', 'My name is Diego, I’m thirty-two and I come from Bogotá, Colombia. I’m a civil engineer and I’ve worked for a construction company for six years.'),
      sort(b('Which block?', 'Quel bloc ?'), [b('identity / family', 'identité / famille'), b('work / studies', 'travail / études'), b('projects / French', 'projets / français')], [['Je suis mariée et j’ai une fille de cinq ans.', 0], ['Je suis comptable dans un cabinet.', 1], ['Je souhaite m’installer à Québec l’année prochaine.', 2], ['Je viens du Maroc, de Rabat.', 0], ['J’ai fait des études d’informatique.', 1], ['J’apprends le français pour travailler au Canada.', 2]]),
      mc(P.best, ['Je m’appelle Lina, j’ai vingt-sept ans et je viens du Liban. Je suis infirmière, et j’apprends le français parce que je voudrais travailler à Montréal.', 'Lina. Vingt-sept. Liban.', 'Je suis Lina, voilà.', 'Mon nom, c’est Lina, et… euh… c’est tout.'], { fr: '— Pouvez-vous vous présenter ?' }),
    ],
    [
      b('About 2 minutes, no preparation, questions about you.', 'Environ 2 minutes, sans préparation, questions sur vous.'),
      b('Prepare 5 blocks: identity, family, work, interests, projects.', 'Préparez 5 blocs : identité, famille, travail, loisirs, projets.'),
      b('Memorise ideas, not a text.', 'Retenez des idées, pas un texte.'),
    ],
    [['s’installer', b('to settle', 'aller vivre durablement')], ['un ingénieur civil', b('a civil engineer', 'ingénieur en construction')], ['un cabinet', b('a firm, an office', 'bureau professionnel')]],
  ),
  lesson(C, 2, ['developing-answers', 'developper-ses-reponses'],
    b('Developing your answers', 'Développer ses réponses'),
    b('Turn short answers into rich ones with reasons, examples and time markers.', 'Transformer des réponses courtes en réponses riches avec raisons, exemples et repères temporels.'),
    [b('Add a reason', 'Ajouter une raison'), b('Add an example or anecdote', 'Ajouter un exemple ou une anecdote'), b('Use past, present and future', 'Utiliser passé, présent et futur')],
    13,
    [
      card(b('From short to rich', 'Du court au riche'), b('**Short**: « J’aime le sport. » **Rich**: « J’adore le sport, **surtout** la course à pied. **Depuis deux ans**, je cours trois fois par semaine **parce que** ça m’aide à décompresser. **L’année dernière**, j’ai même participé à un semi-marathon. **Plus tard**, j’aimerais rejoindre un club au Canada. » → present + past + future + reason + example.', '**Court** : « J’aime le sport. » **Riche** : « J’adore le sport, **surtout** la course à pied. **Depuis deux ans**, je cours trois fois par semaine **parce que** ça m’aide à décompresser. **L’année dernière**, j’ai même participé à un semi-marathon. **Plus tard**, j’aimerais rejoindre un club au Canada. » → présent + passé + futur + raison + exemple.')),
      mc(P.best, ['Oui, j’adore cuisiner, surtout les plats de mon pays. Le week-end dernier, j’ai préparé un tajine pour mes voisins. Plus tard, j’aimerais suivre un cours de cuisine québécoise.', 'Oui.', 'Oui, j’aime cuisiner.', 'Cuisine, oui, bien.'], { fr: '— Vous aimez cuisiner ?' }),
      sort(b('Which time?', 'Quel temps ?'), [b('past', 'passé'), b('present', 'présent'), b('future / wish', 'futur / souhait')], [['l’année dernière, j’ai…', 0], ['depuis deux ans, je…', 1], ['plus tard, j’aimerais…', 2], ['quand j’étais petit, je…', 0], ['en ce moment, je…', 1], ['dans cinq ans, je vais…', 2]]),
      gap(P.complete, 'J’apprends le français ___ un an ___ je voudrais immigrer au Québec. Plus tard, j’___ travailler dans un hôpital.', ['depuis', 'parce que', 'aimerais']),
      say('J’adore le sport, surtout la course à pied. Depuis deux ans, je cours trois fois par semaine parce que ça m’aide à décompresser.', 'I love sport, especially running. For two years I’ve run three times a week because it helps me unwind.'),
    ],
    [
      b('Answer + reason (parce que) + example/anecdote.', 'Réponse + raison (parce que) + exemple/anecdote.'),
      b('Mix present, past and future.', 'Mêlez présent, passé et futur.'),
      b('Time markers: depuis, l’année dernière, plus tard.', 'Repères : depuis, l’année dernière, plus tard.'),
    ],
    [['décompresser', b('to unwind', 'se détendre')], ['un semi-marathon', b('a half marathon', 'course de 21 km')], ['rejoindre', b('to join', 'entrer dans')]],
  ),
  lesson(C, 3, ['simulation', 'simulation'],
    b('Simulation of task 1', 'Simulation de la tâche 1'),
    b('Practise a full guided interview and handle unexpected questions.', 'S’entraîner à un entretien dirigé complet et gérer les questions inattendues.'),
    [b('Answer a series of questions', 'Répondre à une série de questions'), b('Handle an unexpected question', 'Gérer une question inattendue'), b('Ask for repetition politely', 'Faire répéter poliment')],
    13,
    [
      dlg(b('Guided interview', 'Entretien dirigé'), undefined, [['Examinatrice', 'f'], ['Vous', 'm']], [
        [0, 'Bonjour. Pouvez-vous vous présenter, s’il vous plaît ?', 'Hello. Can you introduce yourself, please?'],
        [1, { options: ['Bonjour. Je m’appelle Omar, j’ai trente ans et je viens de Tunis. Je suis développeur web et je vis actuellement à Paris.', 'Omar.', 'Je suis Omar, au revoir.'] }],
        [0, 'Pourquoi apprenez-vous le français ?', 'Why are you learning French?'],
        [1, { options: ['Je parle déjà français au quotidien, mais je veux améliorer mon niveau parce que je souhaite m’installer à Montréal et y travailler dans une entreprise technologique.', 'Pour le test.', 'Parce que.'] }],
        [0, 'Et qu’est-ce que vous faites pendant votre temps libre ?', 'And what do you do in your free time?'],
        [1, { options: ['Je fais de la photo. Le week-end, je me promène dans Paris pour photographier les vieux quartiers. J’ai même exposé quelques photos l’an dernier.', 'Rien.', 'Du temps libre, oui.'] }],
      ]),
      card(b('Unexpected questions', 'Les questions inattendues'), b('If you need time: **C’est une bonne question… · Laissez-moi réfléchir un instant…** If you didn’t understand: **Pardon, pourriez-vous répéter la question ? · Vous voulez dire… ?** Never stay silent: say something simple, then develop.', 'Si vous avez besoin de temps : **C’est une bonne question… · Laissez-moi réfléchir un instant…** Si vous n’avez pas compris : **Pardon, pourriez-vous répéter la question ? · Vous voulez dire… ?** Ne restez jamais silencieux : dites quelque chose de simple, puis développez.')),
      mc(P.best, ['C’est une bonne question… Je dirais l’hiver, parce que j’adore la neige et les sports d’hiver, même si je n’ai pas encore essayé le ski.', '…', 'Je ne sais pas.', 'Question suivante, s’il vous plaît.'], { fr: '— Quelle est votre saison préférée, et pourquoi ?' }),
      say('Pardon, pourriez-vous répéter la question, s’il vous plaît ?', 'Sorry, could you repeat the question, please?'),
      tip(b('Eye contact and pace', 'Regard et débit'), b('Look at the examiner, speak at a **calm pace**, and don’t rush to finish: 2 minutes is short, but **quality of answers** matters more than quantity.', 'Regardez l’examinateur, parlez à un **débit calme**, et ne vous précipitez pas : 2 minutes, c’est court, mais la **qualité des réponses** compte plus que la quantité.')),
    ],
    [
      b('Answer every question with 2–3 developed sentences.', 'Répondez à chaque question par 2 ou 3 phrases développées.'),
      b('Gain time: C’est une bonne question… Laissez-moi réfléchir…', 'Gagner du temps : C’est une bonne question… Laissez-moi réfléchir…'),
      b('Ask for repetition politely; never stay silent.', 'Faites répéter poliment ; ne restez jamais silencieux.'),
    ],
    [['exposer', b('to exhibit', 'montrer au public')], ['actuellement', b('currently', 'en ce moment')], ['le temps libre', b('free time', 'loisirs')]],
  ),
];
