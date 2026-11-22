import type { CourseAbout } from '../../types';
import { b, card, dict, dlg, hear, lesson, P, pairs, sort, tip, trap } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'When you are unwell, understanding instructions accurately matters: which day your appointment was moved to, whether to fast before a blood test, or how many tablets to take and when. This course trains your ear on clinic receptions, medical consultations and pharmacy counters so you follow appointment details, examination prompts, care advice and dosage warnings clearly.',
    'Quand on ne se sent pas bien, comprendre chaque consigne avec précision est essentiel : à quel jour le rendez-vous a été déplacé, s’il faut être à jeun pour une prise de sang, ou combien de comprimés prendre. Ce cours entraîne votre oreille à l’accueil des cliniques, en consultation et au comptoir de la pharmacie pour suivre rendez-vous, examens, conseils et posologies sans ambiguïté.',
  ),
  outcomes: [
    b('Confirm, reschedule or check in for a medical appointment', 'Confirmer, déplacer ou enregistrer un rendez-vous médical'),
    b('Follow physical exam prompts and lab test instructions', 'Suivre les consignes pendant l’examen et pour les analyses'),
    b('Catch exact dosage schedules, durations and food rules', 'Saisir posologies exactes, durées et consignes alimentaires'),
    b('Understand side-effect warnings and generic substitutions', 'Comprendre précautions, effets secondaires et génériques'),
  ],
};

const C = 'l-clinic-pharmacy';
export default [
  lesson(C, 1, ['booking-and-confirming-appointments', 'prendre-et-confirmer-rendez-vous'],
    b('Appointment confirmations and reception', 'Confirmations de rendez-vous et accueil'),
    b('Understand clinic receptionists, phone confirmations and waiting-room directions.', 'Comprendre secrétaires médicales, confirmations téléphoniques et consignes d’accueil.'),
    [b('Catch confirmed dates, times and room numbers', 'Saisir dates, heures et numéros de salle'), b('Understand required documents (carte Vitale / RAMQ)', 'Comprendre les documents demandés'), b('Follow rescheduling calls', 'Suivre un appel pour déplacer un rendez-vous')],
    13,
    [
      card(b('At clinic reception', 'À l’accueil du cabinet'), b('Listen for standard intake questions: **Vous avez rendez-vous avec quel médecin ?** (Which doctor?), **Votre carte vitale / d’assurance maladie ?** (Your health card?), **Quel est le motif de votre visite ?** (Reason for your visit?), **Veuillez patienter en salle d’attente** (Please wait in the waiting room).', 'Repérez les questions d’accueil : **Vous avez rendez-vous avec quel médecin ?**, **Votre carte vitale / d’assurance maladie ?**, **Quel est le motif de votre visite ?**, **Veuillez patienter en salle d’attente**.'), {
        ex: [['Le docteur Garnier a vingt minutes de retard.', 'Doctor Garnier is running twenty minutes late.'], ['Apportez vos derniers résultats d’analyse.', 'Bring your latest test results.']],
      }),
      hear('Bonjour, ici le secrétariat du docteur Moreau. Nous confirmons votre rendez-vous de jeudi à neuf heures trente. Merci d’arriver dix minutes en avance avec votre carte d’assurance.', b('When should you arrive?', 'Quand devez-vous arriver ?'), [b('At 9:20 on Thursday, with your health card', 'Jeudi à 9 h 20, avec votre carte d’assurance'), b('At 9:30 on Tuesday', 'Mardi à 9 h 30'), b('At 9:40 on Thursday', 'Jeudi à 9 h 40'), b('At 10:00 on Friday', 'Vendredi à 10 h')], { voice: 'f' }),
      hear('Le cabinet est fermé exceptionnellement demain matin. Pouvons-nous reporter votre consultation à lundi prochain à seize heures ?', b('Why is the clinic calling?', 'Pourquoi la clinique appelle-t-elle ?'), [b('To move tomorrow’s appointment to Monday at 4 p.m.', 'Pour déplacer le rendez-vous de demain à lundi 16 h'), b('To cancel your prescription', 'Pour annuler votre ordonnance'), b('To ask for your test results', 'Pour demander vos résultats d’analyse'), b('To confirm tomorrow at 10 a.m.', 'Pour confirmer demain à 10 h')], { voice: 'm2' }),
      dlg(b('Confirming by phone', 'Confirmation par téléphone'), b('The medical secretary calls to adjust your appointment.', 'La secrétaire médicale vous appelle pour ajuster votre rendez-vous.'), [['Secrétaire', 'f2'], ['Vous', 'm']], [
        [0, 'Bonjour, c’est le cabinet médical Saint-Luc. Le docteur a une urgence ce matin.', 'Hello, this is Saint-Luc medical clinic. The doctor has an emergency this morning.'],
        [1, 'D’accord, mon rendez-vous de onze heures est maintenu ou décalé ?', 'Okay, is my 11 a.m. appointment still on or pushed back?'],
        [0, { options: ['Il est décalé à quatorze heures quinze, si cela vous convient.', 'Il est dans la salle d’attente.', 'Votre carte vitale est malade.'] }],
        [1, 'Oui, quatorze heures quinze, c’est parfait.', 'Yes, 2:15 p.m. works well.'],
        [0, { options: ['Très bien, pensez à apporter votre ordonnance précédente.', 'Apportez vingt minutes de retard.', 'Rappelez hier matin.'] }],
      ], true),
      sort(b('Admin / booking or medical care?', 'Accueil / rendez-vous ou soin ?'), [b('admin / booking', 'accueil / rendez-vous'), b('medical exam', 'examen médical')], [['salle d’attente', 0], ['prendre la tension', 1], ['reporter un rendez-vous', 0], ['ausculter les poumons', 1], ['carte d’assurance maladie', 0], ['faire une prise de sang', 1]], { listen: true }),
      pairs(P.match, [['reporter un rendez-vous', b('to reschedule an appointment', 'déplacer à une autre date')], ['en avance', b('early, ahead of time', 'avant l’heure prévue')], ['la salle d’attente', b('the waiting room', 'salle où l’on patiente')], ['décalé', b('pushed back, shifted', 'remis plus tard')]]),
      dict('Merci d’arriver dix minutes en avance avec votre carte d’assurance.', { voice: 'f' }),
    ],
    [
      b('reporter / décaler un rendez-vous = reschedule / push back.', 'reporter / décaler un rendez-vous = déplacer plus tard.'),
      b('dix minutes en avance = 10 minutes early.', 'dix minutes en avance = avant l’heure.'),
      b('salle d’attente = waiting room.', 'salle d’attente = pièce d’accueil.'),
    ],
    [['le secrétariat', b('the reception / admin office', 'accueil administratif')], ['reporter', b('to postpone, reschedule', 'déplacer à une date ultérieure')], ['le motif', b('the reason', 'cause de la visite')]],
  ),
  lesson(C, 2, ['doctor-exam-and-care-advice', 'consultation-et-conseils-de-soin'],
    b('During the consultation: advice and tests', 'Pendant la consultation : conseils et examens'),
    b('Understand physical exam prompts, rest advice and lab referrals.', 'Comprendre les consignes d’examen, conseils de repos et examens prescrits.'),
    [b('Follow instructions during the physical exam', 'Suivre les consignes pendant l’examen'), b('Understand care advice and warning signs', 'Comprendre les conseils de soin et signaux d’alerte'), b('Catch test instructions like à jeun', 'Comprendre les consignes d’analyse comme à jeun')],
    13,
    [
      card(b('In the consultation room', 'Dans le bureau du médecin'), b('Doctors use clear imperatives: **Respirez profondément** (Breathe deeply), **Toussez un peu** (Cough a little), **Tendez le bras** (Hold out your arm — for blood pressure), **Relevez votre manche** (Roll up your sleeve). For tests: **à jeun** means **on an empty stomach** (no food before the blood test).', 'Les médecins utilisent des consignes claires : **Respirez profondément**, **Toussez un peu**, **Tendez le bras**, **Relevez votre manche**. Pour les analyses : **à jeun** signifie **sans avoir mangé**.'), {
        ex: [['Respirez fort et bloquez votre souffle.', 'Breathe in deeply and hold your breath.'], ['Faites cette prise de sang demain matin, à jeun.', 'Get this blood test done tomorrow morning, fasting.']],
      }),
      tip(b('When to come back', 'Quand revenir consulter'), b('Watch for **Si la fièvre persiste au-delà de trois jours** (If the fever lasts beyond three days) or **Consultez sans attendre si…** (Seek care right away if…).', 'Repérez **Si la fièvre persiste au-delà de trois jours** ou **Consultez sans attendre si…**.')),
      hear('Relevez votre manche gauche, je vais prendre votre tension. Détendez le bras sur le bureau.', b('What is the doctor going to do?', 'Que va faire le médecin ?'), [b('Check your blood pressure on your left arm', 'Prendre votre tension au bras gauche'), b('Give you an injection in your leg', 'Faire une piqûre dans la jambe'), b('Examine your throat', 'Examiner votre gorge'), b('Write a sick note', 'Rédiger un arrêt de travail')], { voice: 'm' }),
      hear('Je vous prescris une prise de sang à faire demain matin à jeun : vous pouvez boire un peu d’eau, mais pas de café ni de petit-déjeuner.', b('What may you have before tomorrow’s blood test?', 'Que pouvez-vous prendre avant la prise de sang ?'), [b('A little water only', 'Un peu d’eau seulement'), b('Black coffee without sugar', 'Un café noir sans sucre'), b('Orange juice and toast', 'Un jus d’orange et du pain'), b('Nothing at all, not even water', 'Rien du tout, pas même de l’eau')], { voice: 'f2' }),
      hear('Reposez-vous pendant quarante-huit heures, buvez beaucoup d’eau et évitez tout effort physique cette semaine. Revenez me voir si la douleur augmente.', b('What should you avoid this week?', 'Que devez-vous éviter cette semaine ?'), [b('Any physical exertion', 'Tout effort physique'), b('Drinking water', 'Boire de l’eau'), b('Resting for two days', 'Vous reposer deux jours'), b('Calling the clinic', 'Appeler la clinique')], { voice: 'f' }),
      pairs(P.match, [['à jeun', b('fasting, on an empty stomach', 'sans avoir mangé')], ['prendre la tension', b('to check blood pressure', 'mesurer la pression artérielle')], ['une prise de sang', b('a blood test', 'prélèvement sanguin')], ['au-delà de', b('beyond, longer than', 'plus longtemps que')]]),
      dict('Faites cette prise de sang demain matin, à jeun.', { voice: 'm2' }),
    ],
    [
      b('à jeun = fasting (usually water allowed, no food/coffee).', 'à jeun = sans manger avant l’examen.'),
      b('prendre la tension = take blood pressure; prise de sang = blood test.', 'prendre la tension ; prise de sang.'),
      b('si la fièvre persiste = if the fever continues.', 'si la fièvre persiste = si la fièvre dure encore.'),
    ],
    [['à jeun', b('on an empty stomach', 'sans avoir mangé')], ['la tension', b('blood pressure', 'pression artérielle')], ['persister', b('to persist, continue', 'durer dans le temps')]],
  ),
  lesson(C, 3, ['pharmacy-dosage-and-warnings', 'pharmacie-posologie-et-precautions'],
    b('Dosage instructions and pharmacy warnings', 'Posologie et précautions à la pharmacie'),
    b('Understand how often to take medicine, safety limits and pharmacist advice.', 'Comprendre fréquence des prises, limites de sécurité et conseils du pharmacien.'),
    [b('Catch exact frequency and dosage', 'Saisir fréquence et quantité exactes'), b('Understand food and driving warnings', 'Comprendre les précautions alimentaires et de conduite'), b('Recognise generic vs brand-name offers', 'Comprendre les propositions de générique')],
    13,
    [
      card(b('Reading & hearing dosage', 'Comprendre la posologie à l’oral'), b('Pharmacists give precise schedules: **un comprimé matin et soir** (one tablet morning and evening), **toutes les six heures** (every 6 hours), **au milieu du repas** (mid-meal), **en cas de douleur** (if in pain), **sans dépasser trois par jour** (not exceeding 3 a day).', 'Les pharmaciens donnent un rythme précis : **un comprimé matin et soir**, **toutes les six heures**, **au milieu du repas**, **en cas de douleur**, **sans dépasser trois par jour**.'), {
        ex: [['Prenez deux gélules au milieu du repas.', 'Take two capsules in the middle of a meal.'], ['Ce médicament peut provoquer une légère somnolence.', 'This medicine may cause slight drowsiness.']],
      }),
      trap(b('Ne pas dépasser & générique', 'Ne pas dépasser et générique'), b('**Ne pas dépasser** = do not exceed (maximum safe dose). Also, French pharmacists routinely ask: **Vous acceptez le générique ?** (Is the generic equivalent okay? — same active ingredient, usually covered without extra cost).', '**Ne pas dépasser** indique la dose maximale. De plus, on vous demande souvent : **Vous acceptez le générique ?** (même molécule active, souvent mieux remboursée).')),
      hear('Prenez un sachet dissous dans un grand verre d’eau toutes les huit heures, sans dépasser trois sachets par jour.', b('What is the maximum daily dose?', 'Quelle est la dose maximale par jour ?'), [b('Three sachets per day', 'Trois sachets par jour'), b('Eight sachets per day', 'Huit sachets par jour'), b('One sachet per day', 'Un sachet par jour'), b('Six sachets per day', 'Six sachets par jour')], { voice: 'f2' }),
      hear('Attention, ce sirop entraîne un risque de somnolence : évitez de conduire juste après la prise. Vous acceptez le générique ?', b('What warning does the pharmacist give?', 'Quelle précaution donne le pharmacien ?'), [b('Avoid driving right after taking it because it causes drowsiness', 'Éviter de conduire juste après car il donne sommeil'), b('Take it only on an empty stomach', 'Le prendre uniquement à jeun'), b('Drink two litres of coffee', 'Boire deux litres de café'), b('Keep it in the freezer', 'Le garder au congélateur')], { voice: 'm' }),
      sort(b('Schedule or warning?', 'Rythme de prise ou précaution ?'), [b('schedule / dosage', 'rythme / dose'), b('warning / restriction', 'précaution / limite')], [['matin et soir', 0], ['ne pas dépasser quatre comprimés', 1], ['au cours du repas', 0], ['risque de somnolence', 1], ['pendant cinq jours', 0], ['déconseillé avant de conduire', 1]], { listen: true }),
      pairs(P.match, [['un comprimé', b('a tablet, pill', 'médicament solide')], ['toutes les six heures', b('every six hours', 'à six heures d’intervalle')], ['la somnolence', b('drowsiness, sleepiness', 'envie de dormir')], ['en cas de douleur', b('in case of pain', 'si vous avez mal')]]),
      dict('Prenez un comprimé au milieu du repas, sans dépasser trois par jour.', { voice: 'f' }),
    ],
    [
      b('toutes les X heures = every X hours; sans dépasser = maximum limit.', 'toutes les X heures ; sans dépasser = dose maximale.'),
      b('au milieu du repas = with food; somnolence = drowsiness.', 'au milieu du repas = en mangeant ; somnolence = envie de dormir.'),
      b('Vous acceptez le générique ? = generic equivalent with same active molecule.', 'Vous acceptez le générique ? = équivalent même molécule.'),
    ],
    [['la posologie', b('dosage instructions', 'dose et fréquence du médicament')], ['la somnolence', b('drowsiness', 'état d’endormissement')], ['un générique', b('a generic medicine', 'équivalent d’un médicament de marque')]],
  ),
];
