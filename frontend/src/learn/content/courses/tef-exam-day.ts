import type { CourseAbout } from '../../types';
import { b, card, dlg, doc, exam, gap, hear, lesson, mc, P, pairs, say, sort, tip } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Before diving into TEF practice, know exactly what awaits you on test day. Whether you are taking TEF Canada for Express Entry and citizenship or TEFAQ for Québec immigration, knowing paper timings, how scores map to CEFR and NCLC levels, and how the computer-based interface behaves prevents costly surprises. Always verify current test requirements directly on the official CCI Paris Île-de-France, IRCC or MIFI websites before booking.',
    'Avant de s’entraîner au TEF, il faut maîtriser les règles de l’épreuve. Que vous passiez le TEF Canada pour Entrée express et la citoyenneté ou le TEFAQ pour le Québec, connaître les durées, le passage des scores aux niveaux CECRL et NCLC ainsi que les réflexes du jour J évite les mauvaises surprises. Vérifiez toujours les exigences en vigueur sur les sites officiels de la CCI Paris Île-de-France, d’IRCC ou du MIFI avant de réserver.',
  ),
  outcomes: [
    b('Tell TEF Canada, TEFAQ and citizenship rules apart', 'Distinguer TEF Canada, TEFAQ et test de citoyenneté'),
    b('Know the structure and timing of all four papers', 'Connaître structure et durée des quatre épreuves'),
    b('Read TEF score reports and NCLC bands accurately', 'Lire une attestation TEF et les équivalences NCLC'),
    b('Apply calm exam-day logistics and time splits', 'Appliquer une logistique sûre et gérer son temps le jour J'),
  ],
};

const C = 'tef-exam-day';
export default [
  lesson(C, 1, ['tef-canada-vs-tefaq', 'tef-canada-et-tefaq'],
    b('TEF Canada vs TEFAQ and paper timings', 'TEF Canada, TEFAQ et format des épreuves'),
    b('Know which version fits your immigration goal and what each test asks.', 'Choisir la bonne version selon son projet et connaître chaque épreuve.'),
    [b('Distinguish TEF Canada and TEFAQ', 'Distinguer TEF Canada et TEFAQ'), b('Know the four papers and their timings', 'Connaître les quatre épreuves et leurs durées'), b('Recognise Section A vs Section B tasks', 'Différencier section A et section B à l’écrit et à l’oral')],
    13,
    [
      exam(b('The four TEF papers', 'Les quatre épreuves du TEF'), b('**Compréhension orale** (~40 min): everyday & radio clips, increasing difficulty. **Compréhension écrite** (~60 min): signs, forms, articles, logic gaps. **Expression écrite** (60 min): **Section A** (news story continuation, 80+ words) + **Section B** (argued letter, 200+ words). **Expression orale** (15 min): **Section A** (~5 min, ask ~10 questions) + **Section B** (~10 min, convince a friend).', '**Compréhension orale** (~40 min) : messages et extraits radio progressifs. **Compréhension écrite** (~60 min) : panneaux, formulaires, articles, logique. **Expression écrite** (60 min) : **Section A** (fait divers, 80+ mots) + **Section B** (lettre argumentée, 200+ mots). **Expression orale** (15 min) : **Section A** (~5 min, ~10 questions) + **Section B** (~10 min, convaincre un ami).'), {
        table: {
          head: [b('Paper', 'Épreuve'), b('Duration', 'Durée'), b('Key tasks', 'Contenu clé')],
          rows: [
            [b('Listening (CO)', 'Compréhension orale'), '~40 min', b('MCQ A1 → C2, often one play', 'QCM A1 → C2, souvent 1 écoute')],
            [b('Reading (CE)', 'Compréhension écrite'), '~60 min', b('Docs, press articles, text logic', 'Documents, presse, logique')],
            [b('Writing (EE)', 'Expression écrite'), '60 min', b('Sec A (80+ w) & Sec B (200+ w)', 'Sec A (80+ m.) et Sec B (200+ m.)')],
            [b('Speaking (EO)', 'Expression orale'), '15 min', b('Sec A (~5 min) & Sec B (~10 min)', 'Sec A (~5 min) et Sec B (~10 min)')],
          ],
        },
      }),
      card(b('TEF Canada vs TEFAQ', 'TEF Canada ou TEFAQ ?'), b('**TEF Canada**: all four papers are taken in **one sitting** for IRCC permanent residence (Express Entry); citizenship usually focuses on oral skills (verify current IRCC rules). **TEFAQ**: designed for **Québec (MIFI)**, where required papers depend on your specific Québec program.', '**TEF Canada** : les quatre épreuves se passent en **une seule session** pour la résidence permanente (Entrée express) ; la citoyenneté vise surtout l’oral (vérifiez les règles IRCC). **TEFAQ** : adapté au **Québec (MIFI)**, les épreuves requises dépendent du programme visé.')),
      sort(b('Which exam or rule?', 'Quel examen ou quelle règle ?'), [b('TEF Canada (IRCC)', 'TEF Canada (IRCC)'), b('TEFAQ (Québec / MIFI)', 'TEFAQ (Québec / MIFI)')], [['Entrée express fédérale (4 épreuves obligatoires)', 0], ['Programme québécois vérifié auprès du MIFI', 1], ['Une seule séance pour les quatre épreuves', 0], ['Inscription modulaire selon les exigences du Québec', 1]]),
      mc(P.choose, [b('asking ~10 questions on an ad (EO Sec A) and continuing a news story (EE Sec A)', 'poser ~10 questions sur une annonce (EO Sec A) et poursuivre un fait divers (EE Sec A)'), b('writing an essay first and chatting about hobbies second', 'rédiger une dissertation puis parler de ses loisirs'), b('reading a poem aloud and translating two texts', 'lire un poème à voix haute et traduire deux textes'), b('answering 40 grammar drills before speaking', 'faire 40 exercices de grammaire avant de parler')], { fr: 'Dans le TEF, que demandent les sections A de l’oral et de l’écrit ?' }),
      pairs(P.match, [['une séance unique', b('a single test sitting', 'session passée en une fois')], ['un fait divers', b('a short news story', 'récit journalistique d’un événement')], ['le barème', b('scoring scale / marking scheme', 'grille de notation')], ['le seuil requis', b('required threshold', 'niveau minimum demandé')]]),
      tip(b('Always verify official updates', 'Vérifiez toujours les sites officiels'), b('CCI Paris Île-de-France updates timings and question counts periodically, and IRCC / MIFI set which skills apply to each immigration stream. Always confirm on their official websites before paying exam fees.', 'La CCI Paris Île-de-France ajuste parfois durées et nombres de questions, et IRCC ou le MIFI fixent les épreuves exigées. Vérifiez toujours leurs sites officiels avant de réserver.')),
    ],
    [
      b('TEF Canada assesses 4 skills in one sitting; TEFAQ targets Québec MIFI requirements.', 'Le TEF Canada évalue 4 compétences en une séance ; le TEFAQ répond aux règles du MIFI.'),
      b('EO lasts ~15 min (5 min Section A + 10 min Section B); EE lasts 60 min (Section A + Section B).', 'EO dure ~15 min (5 min Sec A + 10 min Sec B) ; EE dure 60 min (Sec A + Sec B).'),
      b('Confirm exact paper counts and durations on the official CCI / IRCC / MIFI pages.', 'Confirmez toujours les modalités à jour sur les pages officielles CCI / IRCC / MIFI.'),
    ],
    [['modulaire', b('modular (taken by skill)', 'par épreuve choisie')], ['la résidence permanente', b('permanent residence', 'statut d’installation durable')], ['en une fois', b('in one sitting', 'sans séparer les épreuves')]],
  ),
  lesson(C, 2, ['scoring-and-nclc-bands', 'notation-et-niveaux-nclc'],
    b('Scoring grids and NCLC bands', 'Notation, CECRL et niveaux NCLC'),
    b('Understand how TEF scores convert into CEFR and Canadian NCLC bands.', 'Comprendre comment les scores du TEF deviennent des niveaux CECRL et NCLC.'),
    [b('Read a TEF score attestation accurately', 'Lire une attestation de résultats du TEF'), b('Understand why no-penalty MCQs mean never leaving blanks', 'Comprendre l’absence de points négatifs au QCM'), b('Identify which skill restricts your NCLC band', 'Repérer la compétence qui freine votre NCLC')],
    13,
    [
      card(b('How scoring works', 'Comment fonctionne le barème'), b('TEF uses a standardised scale up to **699** across skills, mapped to **CEFR A1–C2** and converted by **IRCC** into **NCLC 1–12**. Crucially, **wrong MCQ answers carry zero penalty** (since the 2020s scoring update) — never leave an item blank! For NCLC 7, **all four skills** must clear the B2 threshold individually.', 'Le TEF attribue un score harmonisé sur **699**, converti en **CECRL A1–C2** puis en **NCLC 1–12** par **IRCC**. Point essentiel : **les mauvaises réponses au QCM ne retirent aucun point** — ne laissez jamais de vide ! Pour le NCLC 7, **chaque compétence** doit atteindre le seuil B2.')),
      doc({ look: 'page', title: b('Score report (example)', 'Attestation TEF (exemple)'), text: 'Compréhension orale | 485 | B2 (NCLC 8)\nCompréhension écrite | 462 | B2 (NCLC 7)\nExpression écrite | 450 | B2 (NCLC 7)\nExpression orale | 390 | B1 (NCLC 6)' }, b('Which test must this candidate improve to qualify with NCLC 7 across all skills?', 'Quelle épreuve ce candidat doit-il améliorer pour obtenir le NCLC 7 partout ?'), [b('Speaking (Expression orale)', 'l’expression orale'), b('Listening (Compréhension orale)', 'la compréhension orale'), b('Reading (Compréhension écrite)', 'la compréhension écrite'), b('Writing (Expression écrite)', 'l’expression écrite')]),
      mc(P.best, [b('Select your best educated guess immediately because wrong answers are not penalised.', 'Cocher votre meilleure estimation sans attendre, car les erreurs ne sont pas pénalisées.'), b('Leave the question blank to avoid losing points.', 'Laisser la question vide pour éviter une pénalité.'), b('Stay on that screen for three minutes until you feel certain.', 'Rester trois minutes sur l’écran jusqu’à être certain.'), b('Ask the invigilator to replay the audio clip.', 'Demander au surveillant de rejouer l’extrait.')], { fr: 'En compréhension orale du TEF, vous doutez entre deux réponses :' }),
      sort(b('Comprehension MCQ or Production criteria?', 'QCM de compréhension ou grille d’expression ?'), [b('CO / CE (computer MCQ)', 'CO / CE (QCM sur ordinateur)'), b('EE / EO (human assessment)', 'EE / EO (grille d’évaluation)')], [['repérer mots clés et implicite sans pénalité', 0], ['respecter 80+ mots et 200+ mots', 1], ['éviter de laisser une question sans réponse', 0], ['varier questions et répondre aux objections', 1]]),
      gap(P.completeText, 'Le TEF Canada évalue ___ compétences. L’épreuve orale dure environ ___ minutes, et aucune mauvaise réponse au QCM n’entraîne de ___ . Consultez toujours le tableau officiel d’___ d’IRCC.', ['quatre', 'quinze', 'pénalité', 'équivalence'], { choices: [['quatre', 'deux', 'six'], ['quinze', 'soixante', 'trente'], ['pénalité', 'note', 'pause'], ['équivalence', 'inscription', 'horaire']] }),
      say('Excusez-moi, pourriez-vous vérifier le son de mon casque avant le début de l’épreuve ?', 'Excuse me, could you check the sound of my headphones before the test begins?'),
    ],
    [
      b('IRCC evaluates each skill separately — one weak B1 paper lowers your overall eligibility.', 'IRCC regarde chaque compétence séparément : une seule note B1 suffit à bloquer le NCLC 7.'),
      b('Zero negative marking in CO and CE: answer every single item before moving on.', 'Zéro point négatif en CO et CE : répondez à chaque question sans exception.'),
      b('Always check IRCC’s live conversion table for current score thresholds.', 'Consultez toujours le tableau d’équivalence IRCC en vigueur pour les seuils exacts.'),
    ],
    [['une pénalité', b('a penalty (deducted points)', 'retrait de points')], ['harmonisé', b('standardised', 'ramené sur une même échelle')], ['viser un palier', b('to target a band / level', 'chercher à atteindre un niveau')]],
  ),
  lesson(C, 3, ['exam-day-checklist', 'reflexes-du-jour-j'],
    b('Exam-day checklist and timing splits', 'Réflexes du jour J et gestion du temps'),
    b('Prepare documents, handle the computer test interface and split your 60 writing minutes.', 'Préparer ses papiers, gérer l’interface informatique et répartir les 60 minutes à l’écrit.'),
    [b('Run a reliable night-before and morning checklist', 'Suivre une liste de contrôle veille et matin'), b('Split the 60-minute writing test between Sections A and B', 'Répartir les 60 minutes entre section A et section B'), b('Follow proctor instructions cleanly', 'Suivre les consignes de salle sans stress')],
    13,
    [
      card(b('Your TEF day-of playbook', 'Plan d’action du jour J'), b('**Documents**: official **passport/ID matching registration** + convocation. **Arrival**: 30 min early; lockers hold phones & smartwatches. **Writing split (60 min)**: **20–25 min** on Section A (80+ words), **35–40 min** on Section B (200+ words), saving **5 min** to proofread and check the on-screen word counter.', '**Papiers** : **pièce d’identité exacte de l’inscription** + convocation. **Arrivée** : 30 min avant ; téléphones et montres connectées au vestiaire. **Écrit (60 min)** : **20–25 min** sur la section A (80+ mots), **35–40 min** sur la section B (200+ mots), dont **5 min** de relecture avec le compteur de mots.')),
      hear('Bonjour et bienvenue au centre d’examen. Avant de lancer l’épreuve de compréhension orale, veuillez ajuster votre casque et tester le volume avec la phrase d’essai. N’oubliez pas : en écoute, chaque extrait ne passe qu’une fois et vous ne pourrez pas revenir en arrière.', b('What should candidates do right now?', 'Que doivent faire les candidats maintenant ?'), [b('put on their headphones and test the audio volume', 'ajuster leur casque et tester le volume sonore'), b('start writing Section A immediately', 'commencer aussitôt la section A écrite'), b('turn on their mobile phones on silent', 'garder leur téléphone allumé en mode silencieux'), b('go back to check previous answers', 'revenir en arrière sur les questions')], { voice: 'f', timer: 45 }),
      sort(b('Smart exam-day reflex or mistake?', 'Bon réflexe ou erreur du jour J ?'), [b('smart exam-day reflex', 'bon réflexe'), b('costly mistake', 'erreur coûteuse')], [['tester le casque pendant la phase d’essai', 0], ['passer 38 minutes sur la section A écrite', 1], ['surveiller le compteur de mots pour dépasser 80 et 200', 0], ['rester bloqué mentalement sur une écoute ratée', 1], ['arriver 30 minutes avant l’heure convoquée', 0], ['apporter une autre pièce d’identité qu’à l’inscription', 1]]),
      mc(P.best, [b('about 20–25 minutes on Section A, and 35–40 minutes on Section B including proofreading', 'environ 20–25 minutes sur la section A, puis 35–40 minutes sur la section B relecture incluse'), b('45 minutes on Section A and 15 minutes on Section B', '45 minutes sur la section A et 15 minutes sur la section B'), b('30 minutes on each section without checking word counts', '30 minutes par section sans regarder les mots'), b('write Section B first in 10 minutes then edit Section A', 'rédiger la section B en 10 minutes puis corriger la A')], { fr: 'Comment répartir au mieux les 60 minutes de l’expression écrite ?' }),
      dlg(b('Checking in with the proctor', 'À l’accueil du centre d’examen'), undefined, [['Surveillant', 'm'], ['Vous', 'f']], [
        [0, 'Bonjour Madame, puis-je voir votre convocation et votre passeport ?', 'Hello Madam, may I see your exam notice and passport?'],
        [1, { options: ['Bonjour, les voici. Où dois-je déposer mon sac et mon téléphone, s’il vous plaît ?', 'Tiens, j’ai oublié ma convocation mais j’ai une photo.', 'Bonjour, mon téléphone reste dans ma poche éteint, c’est bon ?'] }],
        [0, 'Dans le casier numéro douze. Pour l’épreuve écrite, utilisez-vous un clavier QWERTY ou AZERTY ?', 'In locker twelve. For the writing test, do you use a QWERTY or AZERTY keyboard?'],
        [1, { options: ['Un clavier QWERTY, merci ! Pouvez-vous me montrer où régler les accents si besoin ?', 'N’importe lequel, ça n’a pas d’importance.', 'Je peux écrire à la main sur une feuille ?'] }],
      ]),
      tip(b('Reset after a fast audio clip', 'Tourner la page après un extrait rapide'), b('If an audio clip finishes faster than expected, **click your best guess within 3 seconds** and focus immediately on the next screen — carrying regret into the next recording costs two questions instead of one.', 'Si un extrait audio file trop vite, **validez votre meilleur choix en 3 secondes** et passez mentalement au suivant : regretter une question fait manquer la suivante.')),
    ],
    [
      b('Split 60 writing minutes wisely: ~22 min Section A, ~38 min Section B (including 5 min edit).', 'Répartissez les 60 min d’écrit : ~22 min section A, ~38 min section B (dont 5 min de relecture).'),
      b('Check keyboard layout (AZERTY vs QWERTY) and accent keys before the timer starts.', 'Vérifiez le clavier (AZERTY/QWERTY) et les touches d’accents avant le lancement.'),
      b('Bring the exact ID used during registration and never carry a phone into the room.', 'Apportez la pièce d’identité exacte de l’inscription et laissez le téléphone au casier.'),
    ],
    [['un surveillant', b('an invigilator / proctor', 'personne qui supervise l’examen')], ['un casier', b('a locker', 'petit coffre fermé à clé')], ['un compteur de mots', b('a word counter', 'outil affichant le nombre de mots')]],
  ),
];
