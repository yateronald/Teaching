import type { CourseAbout } from '../../types';
import { b, card, dlg, doc, exam, lesson, mc, P, say, sort, tip, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Section A of the TEF speaking test lasts about 5 minutes: you read a short advertisement (a course, an apartment, a trip, a job) and you call to obtain information, asking the examiner around ten relevant questions. Success depends on the number, variety and correctness of your questions, and on a polite, natural phone conversation. This course trains exactly that.',
    'La section A de l’expression orale du TEF dure environ 5 minutes : vous lisez une courte annonce (un cours, un appartement, un voyage, un emploi) et vous appelez pour obtenir des informations, en posant à l’examinateur une dizaine de questions pertinentes. La réussite dépend du nombre, de la variété et de la correction de vos questions, et d’une conversation téléphonique polie et naturelle. Ce cours entraîne exactement cela.',
  ),
  outcomes: [
    b('Read an ad and find what to ask', 'Lire une annonce et trouver quoi demander'),
    b('Ask about ten varied questions', 'Poser une dizaine de questions variées'),
    b('Use phone conversation routines', 'Employer les routines du téléphone'),
    b('Avoid asking what the ad already says', 'Éviter de demander ce que dit déjà l’annonce'),
  ],
};

const C = 'tef-eo-a';
export default [
  lesson(C, 1, ['reading-the-ad', 'lire-l-annonce'],
    b('Reading the ad', 'Lire l’annonce'),
    b('Spot what is given and what is missing, to prepare your questions.', 'Repérer ce qui est donné et ce qui manque, pour préparer ses questions.'),
    [b('Know section A', 'Connaître la section A'), b('Spot missing information', 'Repérer les informations manquantes'), b('Avoid redundant questions', 'Éviter les questions inutiles')],
    13,
    [
      exam(b('Section A', 'Section A'), b('About **5 minutes**. You get **a short ad** and you **phone** to obtain information; the examiner plays the advertiser. Aim for **about 10 questions**, varied and correct. Big mistake: asking for information **already written in the ad**.', 'Environ **5 minutes**. Vous recevez **une courte annonce** et vous **téléphonez** pour obtenir des informations ; l’examinateur joue l’annonceur. Visez **une dizaine de questions**, variées et correctes. Grosse erreur : demander une information **déjà écrite dans l’annonce**.')),
      doc({ look: 'ad', title: b('Ad', 'Annonce'), text: 'COURS DE POTERIE POUR ADULTES\nAtelier Terre & Feu — Vieux-Montréal\nSession de 10 semaines, le jeudi soir\nTous niveaux bienvenus\nInscriptions ouvertes !' }, b('Which question is NOT useful (already answered)?', 'Quelle question est INUTILE (réponse déjà donnée) ?'), [b('Les cours ont lieu quel jour ?', 'Les cours ont lieu quel jour ?'), b('Combien coûte la session ?', 'Combien coûte la session ?'), b('À quelle heure commencent les cours ?', 'À quelle heure commencent les cours ?'), b('Le matériel est-il fourni ?', 'Le matériel est-il fourni ?')]),
      sort(b('Given in the ad or to ask?', 'Donné dans l’annonce ou à demander ?'), [b('given', 'donné'), b('to ask', 'à demander')], [['le jour des cours', 0], ['le prix', 1], ['le quartier', 0], ['l’horaire précis', 1], ['la durée de la session', 0], ['le nombre de participants', 1]]),
      tip(b('Questions on what is missing', 'Questionnez sur ce qui manque'), b('For each ad, check the 5 families: **description, price, place/access, time, conditions**. What is **missing** becomes your questions; what is **vague** (« tous niveaux ») can become a precision question (« Concrètement, est-ce adapté aux débutants complets ? »).', 'Pour chaque annonce, vérifiez les 5 familles : **description, prix, lieu/accès, horaires, conditions**. Ce qui **manque** devient vos questions ; ce qui est **vague** (« tous niveaux ») peut devenir une question de précision (« Concrètement, est-ce adapté aux débutants complets ? »).')),
      write(b('Your questions', 'Vos questions'), b('Write 10 questions for the pottery class ad (50–100 words), without asking what the ad already says.', 'Écrivez 10 questions pour l’annonce du cours de poterie (50–100 mots), sans demander ce que dit déjà l’annonce.'), 50, 100, [
        b('10 questions', '10 questions'),
        b('Nothing already in the ad', 'Rien de déjà présent dans l’annonce'),
        b('Varied structures', 'Structures variées'),
      ], 'À quelle heure commencent et finissent les cours ? Combien coûte la session complète ? Le matériel et l’argile sont-ils fournis ? Combien de personnes y a-t-il par groupe ? Est-ce vraiment adapté aux débutants complets ? Pourrons-nous emporter nos créations ? Est-il possible de faire un cours d’essai ? Que se passe-t-il si je manque un cours ? Faut-il apporter un tablier ? Comment puis-je m’inscrire et payer ?'),
    ],
    [
      b('About 5 min; about 10 questions; you phone the advertiser.', 'Environ 5 min ; une dizaine de questions ; vous téléphonez à l’annonceur.'),
      b('Ask what is missing or vague; never what is written.', 'Demandez ce qui manque ou est vague ; jamais ce qui est écrit.'),
      b('Use the 5 families: description, price, place, time, conditions.', 'Utilisez les 5 familles : description, prix, lieu, horaires, conditions.'),
    ],
    [['la poterie', b('pottery', 'objets en terre cuite')], ['l’argile', b('clay', 'terre pour la poterie')], ['un annonceur', b('an advertiser', 'qui publie l’annonce')]],
  ),
  lesson(C, 2, ['phone-routines', 'les-routines-du-telephone'],
    b('Phone routines', 'Les routines du téléphone'),
    b('Open, sustain and close a phone call naturally.', 'Ouvrir, entretenir et conclure naturellement un appel.'),
    [b('Open the call', 'Ouvrir l’appel'), b('React between questions', 'Réagir entre les questions'), b('Close the call', 'Conclure l’appel')],
    13,
    [
      card(b('Phone routines', 'Routines du téléphone'), b('Open: **Bonjour, je vous appelle au sujet de votre annonce pour… J’aurais quelques questions, si vous avez un moment.** React: **D’accord. · Très bien, merci. · Ah, c’est intéressant. · Je note.** Transition: **J’aurais une autre question… · Et en ce qui concerne… ?** Close: **Merci beaucoup pour ces renseignements. Je vais réfléchir et je vous rappelle. Bonne journée !**', 'Ouvrir : **Bonjour, je vous appelle au sujet de votre annonce pour… J’aurais quelques questions, si vous avez un moment.** Réagir : **D’accord. · Très bien, merci. · Ah, c’est intéressant. · Je note.** Transition : **J’aurais une autre question… · Et en ce qui concerne… ?** Conclure : **Merci beaucoup pour ces renseignements. Je vais réfléchir et je vous rappelle. Bonne journée !**')),
      dlg(b('Calling about the pottery class', 'Appel pour le cours de poterie'), undefined, [['Vous', 'm'], ['Examinatrice (atelier)', 'f']], [
        [0, { options: ['Bonjour, je vous appelle au sujet de votre annonce pour les cours de poterie. J’aurais quelques questions, si vous avez un moment.', 'Allô, poterie ?', 'Oui, bonjour, c’est combien ?'] }],
        [1, 'Bien sûr, je vous écoute.', 'Of course, I’m listening.'],
        [0, { options: ['À quelle heure commencent les cours le jeudi ?', 'Les cours sont quel jour ?', 'C’est où ?'] }],
        [1, 'De 19 h à 21 h.', 'From 7 to 9 p.m.'],
        [0, { options: ['Très bien. Et en ce qui concerne le prix, combien coûte la session complète ?', 'Ok. Fin.', 'Bon.'] }],
        [1, 'Elle coûte 280 dollars, matériel compris.', 'It costs 280 dollars, materials included.'],
        [0, { options: ['D’accord, je note. J’aurais une autre question : combien de participants y a-t-il par groupe ?', 'C’est cher, au revoir.', 'Merci, c’est tout.'] }],
      ], true),
      sort(b('Open, react/transition or close?', 'Ouvrir, réagir/transition ou conclure ?'), [b('open', 'ouvrir'), b('react / transition', 'réagir / transition'), b('close', 'conclure')], [['Je vous appelle au sujet de votre annonce.', 0], ['Et en ce qui concerne le prix… ?', 1], ['Merci beaucoup pour ces renseignements.', 2], ['J’aurais quelques questions.', 0], ['D’accord, je note.', 1], ['Je vous rappelle, bonne journée !', 2]]),
      say('Merci beaucoup pour tous ces renseignements. Je vais réfléchir et je vous rappelle demain. Bonne journée !', 'Thank you very much for all this information. I’ll think about it and call you back tomorrow. Have a good day!'),
    ],
    [
      b('Open: Je vous appelle au sujet de votre annonce…', 'Ouvrir : Je vous appelle au sujet de votre annonce…'),
      b('React and transition: D’accord, je note. Et en ce qui concerne… ?', 'Réagir et enchaîner : D’accord, je note. Et en ce qui concerne… ?'),
      b('Close: Merci pour ces renseignements…', 'Conclure : Merci pour ces renseignements…'),
    ],
    [['les renseignements', b('information', 'informations')], ['en ce qui concerne', b('regarding', 'au sujet de')], ['noter', b('to note down', 'écrire')]],
  ),
  lesson(C, 3, ['full-simulation', 'simulation-complete'],
    b('Full simulation', 'Simulation complète'),
    b('Practise a complete section A on a new ad.', 'S’entraîner à une section A complète sur une nouvelle annonce.'),
    [b('Prepare quickly from a new ad', 'Préparer vite à partir d’une nouvelle annonce'), b('Ask 10 correct questions', 'Poser 10 questions correctes'), b('Self-assess', 'S’auto-évaluer')],
    13,
    [
      doc({ look: 'ad', title: b('Ad', 'Annonce'), text: 'À LOUER POUR L’ÉTÉ\nChalet au bord du lac Memphrémagog\n3 chambres, grand terrain, quai privé\nDisponible de juin à septembre\nIdéal pour les familles' }, b('Which question is the most relevant?', 'Quelle question est la plus pertinente ?'), [b('Quel est le prix à la semaine, et faut-il verser un dépôt ?', 'Quel est le prix à la semaine, et faut-il verser un dépôt ?'), b('Le chalet a combien de chambres ?', 'Le chalet a combien de chambres ?'), b('Il est disponible en été ?', 'Il est disponible en été ?'), b('Il est près d’un lac ?', 'Il est près d’un lac ?')]),
      mc(P.form, ['Les animaux de compagnie sont-ils acceptés ?', 'Les animaux de compagnie sont acceptés-ils ?', 'Est-ce que les animaux sont-ils acceptés ?', 'Acceptez les animaux ?']),
      say('Bonjour, je vous appelle au sujet du chalet à louer au bord du lac. Pourriez-vous me dire quel est le prix à la semaine en juillet ?', 'Hello, I’m calling about the cottage for rent by the lake. Could you tell me the weekly price in July?'),
      write(b('Your 10 questions', 'Vos 10 questions'), b('Write 10 varied questions for the cottage ad (50–110 words), not asking what is already written.', 'Écrivez 10 questions variées pour l’annonce du chalet (50–110 mots), sans demander ce qui est déjà écrit.'), 50, 110, [
        b('10 varied questions', '10 questions variées'),
        b('Nothing already in the ad', 'Rien de déjà présent dans l’annonce'),
      ], 'Quel est le prix à la semaine en juillet ? Faut-il verser un dépôt de garantie ? Le chalet est-il équipé d’une cuisine complète ? Y a-t-il internet ? Les draps et les serviettes sont-ils fournis ? Peut-on se baigner dans le lac depuis le quai ? Y a-t-il un canot ou des kayaks à disposition ? Les animaux sont-ils acceptés ? Quelle est la durée minimale de location ? À quelle distance se trouve l’épicerie la plus proche ?'),
      tip(b('Self-assessment', 'Auto-évaluation'), b('Count your questions (**10?**), check their **variety** (est-ce que, inversion, quel, combien, indirect) and that **none** repeats the ad. Record the call and listen to your **politeness and fluency**.', 'Comptez vos questions (**10 ?**), vérifiez leur **variété** (est-ce que, inversion, quel, combien, indirect) et qu’**aucune** ne répète l’annonce. Enregistrez l’appel et écoutez votre **politesse et votre fluidité**.')),
    ],
    [
      b('Prepare 10 questions from what is missing.', 'Préparez 10 questions à partir de ce qui manque.'),
      b('Vary structures; check inversion.', 'Variez les structures ; vérifiez l’inversion.'),
      b('Open and close politely; react between questions.', 'Ouvrez et concluez poliment ; réagissez entre les questions.'),
    ],
    [['un quai', b('a dock, a jetty', 'plateforme au bord de l’eau')], ['un canot', b('a canoe', 'petit bateau')], ['à disposition', b('available (for use)', 'disponible')]],
  ),
];
