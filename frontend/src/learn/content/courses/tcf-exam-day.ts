import type { CourseAbout } from '../../types';
import { b, card, doc, exam, hear, lesson, mc, P, pairs, say, sort, tip } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Before training, know the exam. This course explains the TCF (Test de connaissance du français) and its main versions (TCF tout public, TCF Canada, TCF Québec, TCF IRN), the four tests, their timing and number of questions, how scores translate into CEFR levels and Canadian NCLC levels, and how to prepare practically for exam day. Formats can evolve: always confirm details with France Éducation international and your test centre.',
    'Avant de s’entraîner, il faut connaître l’examen. Ce cours présente le TCF (Test de connaissance du français) et ses principales versions (TCF tout public, TCF Canada, TCF Québec, TCF IRN), les quatre épreuves, leur durée et leur nombre de questions, la correspondance des scores avec les niveaux du CECRL et les NCLC canadiens, et la préparation pratique du jour J. Les formats peuvent évoluer : vérifiez toujours les détails auprès de France Éducation international et de votre centre d’examen.',
  ),
  outcomes: [
    b('Know the TCF versions and their uses', 'Connaître les versions du TCF et leurs usages'),
    b('Know the four tests and their timing', 'Connaître les quatre épreuves et leur durée'),
    b('Understand scores, CEFR and NCLC levels', 'Comprendre les scores, le CECRL et les NCLC'),
    b('Prepare for exam day', 'Préparer le jour J'),
  ],
};

const C = 'tcf-exam-day';
export default [
  lesson(C, 1, ['versions-and-tests', 'versions-et-epreuves'],
    b('Versions and tests', 'Versions et épreuves'),
    b('Choose the right TCF and know what each test involves.', 'Choisir le bon TCF et savoir ce que comporte chaque épreuve.'),
    [b('Know the main versions', 'Connaître les principales versions'), b('Know the four tests', 'Connaître les quatre épreuves'), b('Know the timing', 'Connaître la durée')],
    13,
    [
      exam(b('The TCF Canada format', 'Le format du TCF Canada'), b('Four compulsory tests: **compréhension orale** (about 35 min, 39 multiple-choice questions), **compréhension écrite** (about 60 min, 39 questions), **expression écrite** (about 60 min, 3 tasks), **expression orale** (about 12 min, 3 tasks, face to face with an examiner). Questions in comprehension go from **easy to difficult** (A1 → C2).', 'Quatre épreuves obligatoires : **compréhension orale** (environ 35 min, 39 questions à choix multiple), **compréhension écrite** (environ 60 min, 39 questions), **expression écrite** (environ 60 min, 3 tâches), **expression orale** (environ 12 min, 3 tâches, en face à face avec un examinateur). En compréhension, les questions vont **du plus facile au plus difficile** (A1 → C2).')),
      card(b('Main versions', 'Les principales versions'), b('**TCF tout public**: general certificate (studies, work, personal goals). **TCF Canada**: accepted for **Canadian** immigration and citizenship (IRCC). **TCF Québec**: for **Québec** immigration (MIFI). **TCF IRN**: for some **French** residence and nationality applications. Choose according to **the authority that will receive your result**.', '**TCF tout public** : attestation générale (études, travail, projets personnels). **TCF Canada** : accepté pour l’immigration et la citoyenneté **canadiennes** (IRCC). **TCF Québec** : pour l’immigration au **Québec** (MIFI). **TCF IRN** : pour certaines démarches de résidence et de nationalité en **France**. Choisissez selon **l’organisme qui recevra votre résultat**.')),
      sort(b('Which version?', 'Quelle version ?'), [b('TCF Canada', 'TCF Canada'), b('TCF Québec', 'TCF Québec'), b('TCF IRN', 'TCF IRN')], [['Entrée express (fédéral)', 0], ['Programme d’immigration du Québec', 1], ['Carte de résident en France', 2], ['Citoyenneté canadienne', 0], ['Certificat de sélection du Québec', 1], ['Naturalisation française', 2]]),
      mc(P.choose, [b('from easiest to most difficult', 'du plus facile au plus difficile'), b('in random order', 'dans un ordre aléatoire'), b('from most difficult to easiest', 'du plus difficile au plus facile'), b('all at the same level', 'toutes au même niveau')], { fr: 'Dans les épreuves de compréhension du TCF, les questions vont…' }),
      tip(b('Check before booking', 'Vérifiez avant de réserver'), b('Requirements change. Before booking, check on the official website of the **receiving authority** (IRCC, MIFI, French prefecture…) **which version** and **which tests** you need, and the **minimum level** required.', 'Les exigences évoluent. Avant de réserver, vérifiez sur le site officiel de **l’organisme destinataire** (IRCC, MIFI, préfecture…) **quelle version** et **quelles épreuves** il vous faut, ainsi que le **niveau minimum** requis.')),
    ],
    [
      b('TCF Canada: CO ~35 min/39 Q; CE ~60 min/39 Q; EE ~60 min/3 tasks; EO ~12 min/3 tasks.', 'TCF Canada : CO ~35 min/39 Q ; CE ~60 min/39 Q ; EE ~60 min/3 tâches ; EO ~12 min/3 tâches.'),
      b('Comprehension questions get harder as you go.', 'Les questions de compréhension sont de plus en plus difficiles.'),
      b('Choose the version required by the receiving authority.', 'Choisissez la version exigée par l’organisme destinataire.'),
    ],
    [['une épreuve', b('a test (section)', 'partie de l’examen')], ['obligatoire', b('compulsory', 'exigé')], ['un organisme', b('an organisation, body', 'institution')]],
  ),
  lesson(C, 2, ['scores-and-levels', 'scores-et-niveaux'],
    b('Scores and levels', 'Scores et niveaux'),
    b('Understand how TCF scores become CEFR and NCLC levels.', 'Comprendre comment les scores du TCF deviennent des niveaux CECRL et NCLC.'),
    [b('Read a TCF score report', 'Lire une attestation de résultats'), b('Link CEFR and NCLC', 'Relier CECRL et NCLC'), b('Set a realistic target', 'Fixer un objectif réaliste')],
    13,
    [
      card(b('Scores', 'Les scores'), b('**Compréhension** (oral and written): a score on a scale up to **699**, converted into a **CEFR level** (A1 → C2). **Expression** (oral and written): a mark **out of 20**, also converted into a level. For Canada, IRCC converts each skill into an **NCLC** level (Niveaux de compétence linguistique canadiens). Roughly: **NCLC 7 ≈ B2 threshold in each skill**, required by many immigration programs.', '**Compréhension** (orale et écrite) : un score sur une échelle allant jusqu’à **699**, converti en **niveau du CECRL** (A1 → C2). **Expression** (orale et écrite) : une note **sur 20**, convertie elle aussi en niveau. Pour le Canada, IRCC convertit chaque compétence en niveau **NCLC**. En gros : **NCLC 7 ≈ seuil du B2 dans chaque compétence**, exigé par de nombreux programmes d’immigration.')),
      tip(b('Use the official table', 'Utilisez le tableau officiel'), b('The exact score bands for each NCLC level are published by **IRCC** and may change. Always check the **current equivalence table** on the Government of Canada website before setting your target.', 'Les fourchettes exactes de scores pour chaque niveau NCLC sont publiées par **IRCC** et peuvent changer. Consultez toujours le **tableau d’équivalence en vigueur** sur le site du gouvernement du Canada avant de fixer votre objectif.')),
      doc({ look: 'page', title: b('Score report (fictional)', 'Attestation de résultats (fictive)'), text: 'Compréhension orale | 471 | B2\nCompréhension écrite | 438 | B1\nExpression écrite | 11/20 | B2\nExpression orale | 9/20 | B1' }, b('Which skills need the most work to reach B2 everywhere?', 'Quelles compétences faut-il travailler en priorité pour atteindre le B2 partout ?'), [b('reading and speaking', 'la compréhension écrite et l’expression orale'), b('listening and writing', 'la compréhension orale et l’expression écrite'), b('all four equally', 'les quatre de la même façon'), b('none', 'aucune')]),
      sort(b('Comprehension or expression score?', 'Score de compréhension ou d’expression ?'), [b('score up to 699', 'score sur 699'), b('mark out of 20', 'note sur 20')], [['compréhension orale', 0], ['expression orale', 1], ['compréhension écrite', 0], ['expression écrite', 1]]),
      mc(P.best, [b('Focus first on the weakest skills required by your program.', 'Travailler d’abord les compétences les plus faibles exigées par son programme.'), b('Only practise the skill you already master.', 'S’entraîner seulement dans la compétence déjà maîtrisée.'), b('Ignore the expression tests.', 'Ignorer les épreuves d’expression.'), b('Take the test without preparing.', 'Passer le test sans préparation.')], { fr: 'Quelle stratégie est la plus efficace ?' }),
    ],
    [
      b('Comprehension: score up to 699 → CEFR level.', 'Compréhension : score sur 699 → niveau CECRL.'),
      b('Expression: mark /20 → CEFR level.', 'Expression : note /20 → niveau CECRL.'),
      b('NCLC 7 ≈ B2 threshold; check IRCC’s current table.', 'NCLC 7 ≈ seuil du B2 ; vérifiez le tableau actuel d’IRCC.'),
    ],
    [['une attestation', b('a certificate, a report', 'document officiel de résultats')], ['une fourchette', b('a range', 'entre deux valeurs')], ['en vigueur', b('in force, current', 'actuel')]],
  ),
  lesson(C, 3, ['exam-day', 'le-jour-j'],
    b('Exam day', 'Le jour J'),
    b('Prepare documents, manage time and stress, and understand the examiner’s instructions.', 'Préparer ses documents, gérer temps et stress, et comprendre les consignes.'),
    [b('Prepare documents and logistics', 'Préparer documents et logistique'), b('Manage time in each test', 'Gérer le temps dans chaque épreuve'), b('Understand oral instructions', 'Comprendre les consignes orales')],
    13,
    [
      card(b('Checklist', 'Liste de contrôle'), b('**The day before**: convocation, **valid ID** (the same as at registration), route and timing. **On the day**: arrive early; phones are switched off and collected. **Comprehension**: no going back to previous questions in some computer versions — answer every question (no penalty for a wrong answer, so **never leave a blank**). **Expression**: watch the clock, keep a few minutes to re-read.', '**La veille** : convocation, **pièce d’identité valide** (la même qu’à l’inscription), trajet et horaires. **Le jour même** : arrivez en avance ; les téléphones sont éteints et déposés. **Compréhension** : selon les versions informatiques, on ne peut pas revenir en arrière — répondez à toutes les questions (une mauvaise réponse n’est pas pénalisée, donc **ne laissez jamais de blanc**). **Expression** : surveillez l’heure, gardez quelques minutes pour relire.')),
      hear('Bonjour à tous. Veuillez éteindre vos téléphones et les déposer dans le bac à l’entrée. Vous avez votre pièce d’identité sur la table. L’épreuve de compréhension orale va commencer : chaque document sera diffusé une seule fois.', b('How many times is each document played?', 'Combien de fois chaque document est-il diffusé ?'), [b('once', 'une seule fois'), b('twice', 'deux fois'), b('three times', 'trois fois'), b('as many times as you want', 'autant de fois que vous voulez')], { voice: 'f' }),
      mc(P.best, [b('Answer anyway: wrong answers are not penalised.', 'Répondre quand même : les mauvaises réponses ne sont pas pénalisées.'), b('Leave it blank.', 'Laisser la question vide.'), b('Ask the examiner for the answer.', 'Demander la réponse à l’examinateur.'), b('Stop the test.', 'Arrêter le test.')], { fr: 'Vous ne connaissez pas la réponse à une question de compréhension :' }),
      sort(b('Do or don’t?', 'À faire ou à éviter ?'), [b('do', 'à faire'), b('avoid', 'à éviter')], [['apporter la même pièce d’identité qu’à l’inscription', 0], ['garder son téléphone allumé', 1], ['répondre à toutes les questions', 0], ['passer trop de temps sur une question', 1], ['relire son texte à la fin', 0], ['arriver juste à l’heure', 1]]),
      pairs(P.match, [['la convocation', b('the exam notice', 'lettre qui convoque')], ['diffuser', b('to play, broadcast', 'faire entendre')], ['un bac', b('a tray, a box', 'récipient')], ['pénaliser', b('to penalise', 'enlever des points')]]),
      say('Pardon, pourriez-vous répéter la consigne, s’il vous plaît ?', 'Sorry, could you repeat the instructions, please?'),
    ],
    [
      b('Valid ID (same as registration), convocation, arrive early.', 'Pièce d’identité valide (la même qu’à l’inscription), convocation, en avance.'),
      b('Answer every comprehension question: no penalty.', 'Répondez à toutes les questions de compréhension : pas de pénalité.'),
      b('Watch the clock and keep time to re-read.', 'Surveillez l’heure et gardez du temps pour relire.'),
    ],
    [['éteindre', b('to switch off', 'arrêter un appareil')], ['déposer', b('to leave, drop off', 'poser à un endroit')], ['un blanc', b('a blank (unanswered)', 'réponse vide')]],
  ),
];
