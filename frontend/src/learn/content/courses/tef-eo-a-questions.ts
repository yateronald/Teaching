import type { CourseAbout } from '../../types';
import { b, card, dlg, doc, gap, hear, lesson, mc, ord, P, pairs, say, sort, tip, trap, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'In TEF Speaking Section A, you have roughly five minutes to phone an advertiser and ask around ten relevant questions about a short ad. Candidates stuck at A2–B1 repeat « Est-ce que… ? » eight times in a row and read off a rigid checklist without listening to the answers. This course gives you a 10+ question bank across four varied structures plus natural follow-up reflexes so your call sounds fluent and spontaneous.',
    'En section A de l’expression orale du TEF, vous avez environ cinq minutes pour téléphoner à un annonceur et poser une dizaine de questions pertinentes. Trop de candidats répètent « Est-ce que… ? » huit fois de suite et récitent une liste sans écouter les réponses. Ce cours vous donne une banque de plus de 10 questions en quatre structures variées ainsi que des réflexes de relance naturelle.',
  ),
  outcomes: [
    b('Vary four French question structures and drop repetitive est-ce que', 'Varier quatre structures interrogatives sans abuser de est-ce que'),
    b('Eliminate double-inversion grammar mistakes in oral questions', 'Éviter les fautes de double inversion à l’oral'),
    b('React spontaneously to answers with immediate follow-ups (relances)', 'Réagir aux réponses par des relances naturelles et ciblées'),
    b('Generate 10–12 non-redundant questions for any TEF Section A ad', 'Produire 10 à 12 questions pertinentes sur n’importe quelle annonce'),
  ],
};

const C = 'tef-eo-a-questions';
export default [
  lesson(C, 1, ['breaking-the-est-ce-que-habit', 'varier-ses-tournures-interrogatives'],
    b('Never repeating « est-ce que »', 'Varier ses questions sans « est-ce que »'),
    b('Rotate four natural question patterns and avoid double-subject errors.', 'Alterner quatre formes de questions et éviter les fautes d’inversion.'),
    [b('Rotate four French question structures smoothly', 'Alterner quatre structures de questions'), b('Avoid the classic « est-ce que + inversion » mistake', 'Éviter le mélange « est-ce que + inversion »'), b('Upgrade basic questions into polite B1–B2 forms', 'Transformer des questions simples en tournures B1–B2')],
    13,
    [
      trap(b('The « est-ce que » loop', 'Le piège du « est-ce que » en boucle'), b('Asking « Est-ce que c’est cher ? Est-ce que c’est le soir ? Est-ce que je dois payer ? » signals limited syntax. Rotate four forms instead, and **never mix est-ce que with inversion** (say **Le tarif inclut-il… ?**, NOT « Est-ce que le tarif inclut-il… ? »).', 'Enchaîner « Est-ce que c’est cher ? Est-ce que c’est le soir ? » révèle une syntaxe limitée. Alternez quatre formes et **ne combinez jamais est-ce que avec l’inversion** (dites **Le tarif inclut-il… ?**, jamais « Est-ce que le tarif inclut-il… ? »).')),
      card(b('Four structures to rotate', 'Quatre tournures à alterner'), b('1. **Inversion**: **Le matériel est-il fourni ?** 2. **Indirect polite**: **Pourriez-vous me dire si… ? / J’aimerais savoir combien…** 3. **Targeted word + inversion**: **À quelle fréquence ont lieu les séances ?** 4. **Polite conditional**: **Serait-il possible de faire un essai ?**', '1. **Inversion** : **Le matériel est-il fourni ?** 2. **Question indirecte** : **Pourriez-vous me dire si… ? / J’aimerais savoir combien…** 3. **Mot interrogatif + inversion** : **À quelle fréquence ont lieu les séances ?** 4. **Conditionnel poli** : **Serait-il possible de faire un essai ?**')),
      pairs(P.match, [['Est-ce que le prix comprend le repas ?', 'Le prix comprend-il les repas ?'], ['Est-ce que je peux payer en deux fois ?', 'Serait-il possible de régler en deux versements ?'], ['Est-ce que c’est près du métro ?', 'Pourriez-vous m’indiquer la station la plus proche ?'], ['Est-ce que vous avez d’autres horaires ?', 'À quelles autres heures proposez-vous ce cours ?']], true),
      mc(P.form, ['Les frais d’inscription sont-ils remboursables en cas d’annulation ?', 'Est-ce que les frais d’inscription sont-ils remboursables ?', 'Est-ce que sont les frais d’inscription remboursables ?', 'Pourriez-vous me dire sont-ils les frais remboursables ?']),
      gap(P.completeText, 'Le tarif ___ le déjeuner ? Par ailleurs, ___ m’indiquer à quelle heure termine l’atelier et ___ il est possible d’apporter un invité ?', ['inclut-il', 'pourriez-vous', 'si'], { choices: [['inclut-il', 'est-ce que inclut', 'inclut'], ['pourriez-vous', 'pouvoir', 'est-ce que'], ['si', 'que', 'quand']] }),
      ord(P.order, 'Le cours comprend-il tout le matériel nécessaire ?', { tr: 'Does the course include all the necessary equipment?' }),
    ],
    [
      b('Rotate inversion, indirect questions (Pourriez-vous me dire…), question words and polite conditionals.', 'Alternez inversion, questions indirectes, mots interrogatifs et conditionnel poli.'),
      b('Never combine est-ce que with inversion (-t-il) in the same clause.', 'Ne mettez jamais est-ce que et l’inversion (-t-il) dans la même phrase.'),
      b('Keep indirect questions in normal subject-verb order (J’aimerais savoir si le prix est fixe).', 'Gardez l’ordre sujet-verbe normal après J’aimerais savoir si / Pourriez-vous me dire si.'),
    ],
    [['un versement', b('an instalment / payment', 'partie d’un paiement')], ['remboursable', b('refundable', 'qui peut être rendu')], ['à quelle fréquence', b('how often', 'tous les combien de temps')]],
  ),
  lesson(C, 2, ['reacting-and-following-up', 'reagir-et-relancer'],
    b('Reacting and asking natural follow-ups', 'Réagir et poser des relances naturelles'),
    b('Listen closely to the examiner’s answers and turn surprises into sharp follow-up questions.', 'Écouter les réponses de l’examinateur et rebondir par des relances logiques.'),
    [b('Acknowledge every reply naturally before the next question', 'Réagir naturellement avant d’enchaîner'), b('Launch immediate follow-up questions from new clues', 'Rebondir aussitôt sur un indice donné par l’interlocuteur'), b('Transition smoothly between different question topics', 'Passer avec aisance d’un thème à l’autre')],
    13,
    [
      card(b('Don’t read a dead checklist', 'Écoutez pour mieux relancer'), b('Examiners penalise candidates who ignore their replies and jump straight to Question 4. React briefly (**D’accord, c’est noté. / Ah, vraiment ?**) and bounce off any new detail (**Justement, dans ce cas… / Et si jamais… ?**).', 'Les examinateurs sanctionnent ceux qui récitent leur liste sans écouter. Réagissez brièvement (**D’accord, c’est noté. / Ah, vraiment ?**) et rebondissez sur chaque détail nouveau (**Justement, dans ce cas… / Et si jamais… ?**).')),
      hear('Pour l’abonnement mensuel, c’est quarante-cinq dollars, mais nous appliquons une réduction spéciale pour certaines personnes et aussi si vous vous inscrivez à deux.', b('Which immediate follow-up shows active listening?', 'Quelle relance immédiate montre que vous avez bien écouté ?'), [b('Justement, qui peut bénéficier de cette réduction, et quel est le tarif pour deux personnes ?', 'Justement, qui peut bénéficier de cette réduction, et quel est le tarif pour deux personnes ?'), b('Quel est le prix de l’abonnement mensuel déjà ?', 'Quel est le prix de l’abonnement mensuel déjà ?'), b('D’accord. Votre adresse est bien dans le centre-ville ?', 'D’accord. Votre adresse est bien dans le centre-ville ?'), b('Merci pour tout, je vais réfléchir, bonne journée !', 'Merci pour tout, je vais réfléchir, bonne journée !')], { voice: 'f', timer: 40 }),
      dlg(b('Calling a coworking space', 'Appeler un espace de coworking'), undefined, [['Vous', 'm'], ['Responsable', 'f']], [
        [0, { options: ['Bonjour Madame, je vous appelle au sujet de votre annonce pour l’espace de coworking. Auriez-vous deux minutes pour quelques précisions ?', 'Allô, c’est combien votre coworking ?', 'Bonjour, je lis dix questions maintenant.'] }],
        [1, 'Oui, bien sûr ! Nous proposons des bureaux partagés à la journée ou au mois.', 'Yes, of course! We offer shared desks by the day or by the month.'],
        [0, { options: ['Très bien, je note. Quelle est la différence de tarif entre le forfait journée et l’abonnement mensuel ?', 'D’accord. Y a-t-il une cuisine ?', 'Merci, vous êtes ouvert quel jour ?'] }],
        [1, 'Le forfait journée coûte vingt dollars, et le mensuel inclut en plus l’accès 24 heures sur 24 et deux salles de réunion.', 'The day pass costs twenty dollars, and the monthly plan also includes 24/7 access and two meeting rooms.'],
        [0, { options: ['Ah, intéressant ! Concernant les salles de réunion, faut-il les réserver longtemps à l’avance ?', 'C’est trop cher. Au revoir.', 'Est-ce que le mensuel est cher ?'] }],
      ], true),
      sort(b('Natural follow-up or robotic jump?', 'Relance naturelle ou liste mécanique ?'), [b('natural reaction + follow-up', 'réaction naturelle + relance'), b('ignores what was just said', 'ignore la réponse reçue')], [['Ah, parfait ! Et dans ce cas, est-ce que je peux venir le samedi ?', 0], ['D’accord. Question numéro quatre : y a-t-il un parking ?', 1], ['Je vois. Et s’il pleut ce jour-là, avez-vous une salle intérieure ?', 0], ['Bien. Autre chose sans rapport : le nom du directeur ?', 1]]),
      say('Ah, c’est très clair, merci ! Et en ce qui concerne l’annulation, jusqu’à combien de jours avant peut-on reporter ?', 'Ah, that’s very clear, thank you! And regarding cancellation, up to how many days ahead can one reschedule?'),
      mc(P.best, ['Très bien, merci pour ces précisions sur les horaires. J’aurais maintenant une question concernant le mode de paiement.', 'Question suivante : paiement.', 'Bon, changeons de sujet vite fait, l’argent maintenant.', 'Fini les horaires ! Vous prenez la carte ?'], { fr: 'Comment passer poliment des horaires aux modalités de paiement ?' }),
    ],
    [
      b('Always react in 3–4 words (Très bien, Ah intéressant) before asking your next question.', 'Réagissez toujours en quelques mots (Très bien, Ah intéressant) avant la question suivante.'),
      b('Listen for hints like « certaines conditions » or « sauf » and probe them immediately.', 'Guettez les indices (« certaines conditions », « sauf ») pour poser une relance immédiate.'),
      b('Use clean bridges (Concernant…, Et au sujet de…) when shifting to a new theme.', 'Utilisez des transitions claires (Concernant…, Et au sujet de…) pour changer de thème.'),
    ],
    [['bénéficier de', b('to qualify for / benefit from', 'profiter d’un avantage')], ['un forfait', b('a pass / package rate', 'tarif fixe pour un usage')], ['en ce qui concerne', b('regarding / as for', 'à propos de')]],
  ),
  lesson(C, 3, ['building-a-12-question-bank', 'banque-de-douze-questions'],
    b('Your 12-question bank for any ad', 'Banque de 12 questions pour toute annonce'),
    b('Generate 10+ varied, non-redundant questions on any TEF ad and cover every angle smoothly.', 'Préparer 10+ questions variées sans répétition sur n’importe quelle annonce du TEF.'),
    [b('Draw 10–12 non-redundant questions across 6 categories', 'Trouver 10–12 questions nouvelles sur 6 axes'), b('Keep calls fluent from greeting to warm close', 'Tenir 5 minutes avec politesse et fluidité'), b('Use backup angles if you run short mid-call', 'Avoir 3 angles de secours en cas de blanc')],
    13,
    [
      card(b('Six axes for 10+ questions', 'Six axes pour trouver 10+ questions'), b('For any TEF Section A ad, scan six reliable angles: **1. Exact schedule**, **2. Price & hidden inclusions**, **3. Required level / prerequisites**, **4. Group size**, **5. Equipment & access**, **6. Payment & cancellation**. Probe vague adjectives like « petits groupes » for exact numbers.', 'Sur toute annonce de section A, balayez six axes : **1. Horaires précis**, **2. Tarif et inclus**, **3. Niveau ou prérequis**, **4. Effectif**, **5. Matériel et accès**, **6. Paiement et annulation**. Précisez les adjectifs flous (« petits groupes ») par des chiffres.')),
      doc({ look: 'ad', title: b('Section A ad', 'Annonce section A'), text: 'STAGE INTENSIF DE PHOTOGRAPHIE URBAINE\nWeek-end des 18 et 19 septembre — Vieux-Port\nEncadré par un photographe professionnel\nPetits groupes conviviaux — Inscriptions ouvertes' }, b('Which question wastes time by repeating the ad?', 'Quelle question est inutile car déjà dans l’annonce ?'), [b('Dans quel quartier et à quelles dates se déroule le stage ?', 'Dans quel quartier et à quelles dates se déroule le stage ?'), b('Quel type d’appareil photo faut-il posséder pour participer ?', 'Quel type d’appareil photo faut-il posséder pour participer ?'), b('Le tarif comprend-il l’impression de quelques tirages ?', 'Le tarif comprend-il l’impression de quelques tirages ?'), b('Combien de participants compte au maximum chaque groupe ?', 'Combien de participants compte au maximum chaque groupe ?')]),
      sort(b('Which question category?', 'Quelle famille de questions ?'), [b('price & payment', 'prix et paiement'), b('logistics & equipment', 'logistique et matériel'), b('conditions & cancellation', 'conditions et annulation')], [['Acceptez-vous le paiement en plusieurs fois ?', 0], ['Un appareil hybride est-il exigé ou un téléphone suffit-il ?', 1], ['En cas de forte pluie, le stage est-il reporté ?', 2], ['Proposez-vous un tarif étudiant ?', 0], ['À quelle heure commence la journée de samedi ?', 1], ['Quel est le délai limite pour annuler sans frais ?', 2]]),
      mc(P.best, ['Combien de personnes au maximum accueillez-vous par groupe ? (« petits groupes » reste flou)', 'Le stage dure-t-il le week-end des 18 et 19 septembre ?', 'Est-ce qu’un photographe encadre le stage ?', 'Le stage a-t-il bien lieu au Vieux-Port ?'], { fr: 'L’annonce dit « Petits groupes conviviaux ». Quelle question précise un point resté vague ?' }),
      dlg(b('Full varied exchange on the photo workshop', 'Échange varié sur le stage photo'), undefined, [['Vous', 'f'], ['Photographe', 'm']], [
        [0, { options: ['Bonjour Monsieur, je vous appelle à propos du stage de photographie urbaine. Pourriez-vous m’indiquer le tarif du week-end ?', 'Bonjour, c’est quand le stage photo ?', 'Allô, quel est le thème du stage ?'] }],
        [1, 'Bonjour ! Le stage coûte 160 dollars pour les deux jours, et nous prêtons un trépied si besoin.', 'Hello! The workshop costs 160 dollars for both days, and we lend a tripod if needed.'],
        [0, { options: ['Parfait, c’est bon à savoir pour le trépied. Un appareil photo réflex est-il indispensable, ou un modèle compact convient-il ?', 'D’accord, c’est cher. Merci beaucoup.', 'Est-ce que le photographe est professionnel ?'] }],
        [1, 'Un compact ou même un bon téléphone récent convient tout à fait aux débutants.', 'A compact or even a good recent phone works fine for beginners.'],
        [0, { options: ['Rassurant ! Et s’il pleut tout le samedi, prévoyez-vous une solution en intérieur ou un report ?', 'Bien, bon week-end alors.', 'Est-ce que vous êtes au Vieux-Port ?'] }],
      ], true),
      write(b('Draft 10 varied questions (60–115 words)', 'Préparer 10 questions variées (60–115 mots)'), b('Write 10 relevant questions for the urban photography workshop ad (60–115 words). Do not ask anything already answered in the ad, and never use « est-ce que » twice in a row.', 'Rédigez 10 questions pertinentes sur l’annonce du stage photo (60–115 mots) sans redemander ce qui est écrit ni répéter « est-ce que » de suite.'), 60, 115, [
        b('10 distinct, relevant questions', '10 questions distinctes et utiles'),
        b('Nothing already written in the ad', 'Rien de déjà indiqué dans l’annonce'),
        b('Varied structures (inversion, indirect, question words)', 'Structures variées (inversion, indirecte, mots interrogatifs)'),
      ], 'Quel est le tarif complet pour les deux jours ? Ce prix inclut-il les repas du midi ou une pause café ? À quelles heures précises débutent et se terminent les séances ? Combien de participants accueillez-vous au maximum par groupe ? Quel matériel faut-il apporter le premier matin ? Faut-il déjà connaître les réglages manuels pour suivre le stage ? Pourriez-vous me dire où nous nous retrouvons exactement au Vieux-Port ? En cas d’orage, le stage est-il maintenu en intérieur ou reporté ? Serait-il possible de payer par carte ou virement ? Jusqu’à quelle date peut-on annuler avec remboursement ?'),
      tip(b('Three instant backup angles at 3:30', 'Trois angles de secours à 3 min 30'), b('If you run out of ideas before 5 minutes, check these three rarely printed topics: **1. Payment methods / deposit**, **2. Cancellation or bad-weather policy**, **3. Access (parking, transit, wheelchair accessibility)**.', 'À court d’idées avant la fin ? Pensez à trois angles presque toujours absents : **1. Paiement et acompte**, **2. Annulation ou météo**, **3. Accès (stationnement, transport, accessibilité)**.')) ,
    ],
    [
      b('Cover 6 categories easily: schedule, price/inclusions, level, group size, logistics, cancellation.', 'Couvrez 6 axes : horaires, prix/inclus, niveau, effectif, logistique, annulation.'),
      b('Probe vague marketing adjectives (« petits groupes », « tous niveaux ») for exact numbers.', 'Précisez les mots vagues (« petits groupes », « tous niveaux ») par des chiffres exacts.'),
      b('Vary structures across every single question to prove B1–B2 grammatical range.', 'Variez vos formes d’interrogation à chaque question pour valoriser votre niveau.'),
    ],
    [['un trépied', b('a tripod', 'support à trois pieds pour appareil photo')], ['un tirage', b('a photo print', 'photo imprimée sur papier')], ['un acompte', b('a deposit', 'somme versée à l’avance')]],
  ),
];
