// Français pour la santé: for nurses, orderlies and care assistants. Welcoming
// a patient, explaining care, reassuring, and passing on information.
import { b, type Lesson } from '../../types';
import { card, listen, pick } from '../kit';

const lessons: Lesson[] = [
  {
    id: 'healthcare-french-1',
    slug: { en: 'welcoming-and-questioning-a-patient', fr: 'accueillir-et-questionner-un-patient' },
    title: b('Welcoming and questioning a patient', 'Accueillir et questionner un patient'),
    summary: b('Introduce yourself, ask where it hurts, since when, how much, and about allergies.', 'Vous présenter, demander où le patient a mal, depuis quand, à quel point, et s’il a des allergies.'),
    objectives: [b('Introduce yourself to a patient', 'Vous présenter à un patient'), b('Ask the key assessment questions', 'Poser les questions d’évaluation essentielles'), b('Understand a patient’s answers', 'Comprendre les réponses d’un patient')],
    minutes: 14,
    steps: [
      card(b('Introducing yourself', 'Se présenter'), b('Always say who you are and what you are going to do: **Bonjour, madame Roy. Je m’appelle Samira, je suis votre infirmière aujourd’hui.** Use **vous**, the patient’s family name, and **monsieur / madame**.', 'Dites toujours qui vous êtes et ce que vous allez faire : **Bonjour, madame Roy. Je m’appelle Samira, je suis votre infirmière aujourd’hui.** Employez **vous**, le nom de famille du patient, et **monsieur / madame**.'), {
        examples: [{ fr: 'Bonjour, madame Roy. Je suis votre infirmière aujourd’hui.', tr: 'Hello, Mrs Roy. I am your nurse today.' }, { fr: 'Comment vous sentez-vous ce matin ?', tr: 'How are you feeling this morning?' }],
      }),
      card(b('The five questions', 'Les cinq questions'), b('**Qu’est-ce qui vous amène ?** (What brings you here?) · **Où avez-vous mal ?** · **Depuis quand ?** · **Sur une échelle de zéro à dix, à combien évaluez-vous votre douleur ?** · **Avez-vous des allergies ? Prenez-vous des médicaments ?**', '**Qu’est-ce qui vous amène ?** · **Où avez-vous mal ?** · **Depuis quand ?** · **Sur une échelle de zéro à dix, à combien évaluez-vous votre douleur ?** · **Avez-vous des allergies ? Prenez-vous des médicaments ?**'), {
        examples: [{ fr: 'Où avez-vous mal exactement ?', tr: 'Where exactly does it hurt?' }, { fr: 'Depuis quand avez-vous cette douleur ?', tr: 'How long have you had this pain?' }, { fr: 'Sur une échelle de zéro à dix, à combien évaluez-vous votre douleur ?', tr: 'On a scale of zero to ten, how would you rate your pain?' }, { fr: 'Avez-vous des allergies ?', tr: 'Do you have any allergies?' }],
      }),
      listen('B1', 'm2', 'J’ai une douleur dans la poitrine depuis ce matin. Ça serre, surtout quand je monte les escaliers.', 'Où le patient a-t-il mal ?', ['Dans la poitrine', 'Dans le dos', 'À la tête', 'Au ventre']),
      listen('B1', 'f', 'Je suis allergique à la pénicilline, et je prends un médicament pour la tension tous les matins.', 'Quelle information est vraie ?', ['Elle est allergique à la pénicilline', 'Elle n’a aucune allergie', 'Elle ne prend aucun médicament', 'Elle est allergique à son médicament pour la tension']),
      pick('B1', b('Which question asks about the duration?', 'Quelle question porte sur la durée ?'), ['Depuis quand avez-vous mal ?', 'Où avez-vous mal ?', 'Avez-vous des allergies ?', 'Comment vous appelez-vous ?']),
      { kind: 'match', prompt: b('Match each kind of pain with its description.', 'Associez chaque douleur à sa description.'), pairs: [['Ça brûle.', b('It burns.', 'comme une chaleur forte')], ['Ça serre.', b('It feels tight.', 'comme une pression')], ['Ça pique.', b('It stings.', 'comme une aiguille')], ['Ça lance.', b('It throbs.', 'par vagues')], ['C’est engourdi.', b('It is numb.', 'on ne sent plus rien')]] },
      pick('B1', b('Choose the right word.', 'Choisissez le bon mot.'), ['Prenez-vous', 'Prendre-vous', 'Prenez-tu', 'Prends-vous'], { fr: '___ des médicaments tous les jours ?' }),
      { kind: 'dialogue', title: b('At triage', 'Au triage'), scene: b('You are the nurse. Choose your best questions.', 'Vous êtes l’infirmier ou l’infirmière. Choisissez vos meilleures questions.'), speakers: [{ name: 'Patient', voice: 'm', side: 'l' }, { name: 'Vous', voice: 'f', side: 'r' }], lines: [
        { s: 1, choose: { options: ['Bonjour, monsieur. Je suis l’infirmière au triage. Qu’est-ce qui vous amène aujourd’hui ?', 'Salut. C’est quoi ton problème ?', 'Suivant !'], answer: 0 } },
        { s: 0, fr: 'Je suis tombé dans l’escalier et j’ai très mal au poignet.', tr: 'I fell down the stairs and my wrist hurts a lot.' },
        { s: 1, choose: { options: ['Je vois. Sur une échelle de zéro à dix, à combien évaluez-vous votre douleur ?', 'Vous avez mal ?', 'C’est grave ?'], answer: 0 } },
        { s: 0, fr: 'Sept, je dirais. Et ma main est engourdie.', tr: 'Seven, I would say. And my hand is numb.' },
      ] },
      { kind: 'speak', prompt: b('Say it aloud.', 'Dites-le à voix haute.'), text: 'Sur une échelle de zéro à dix, à combien évaluez-vous votre douleur ?', tr: 'On a scale of zero to ten, how would you rate your pain?' },
    ],
    notes: {
      points: [
        b('Introduce yourself: Bonjour, madame… Je suis votre infirmière / votre préposé aujourd’hui.', 'Présentez-vous : Bonjour, madame… Je suis votre infirmière / votre préposé aujourd’hui.'),
        b('Five questions: what brings you, where, since when, how much (0–10), allergies and medication.', 'Cinq questions : motif, où, depuis quand, intensité (0 à 10), allergies et médicaments.'),
        b('Kinds of pain: ça brûle, ça serre, ça pique, ça lance, c’est engourdi.', 'Types de douleur : ça brûle, ça serre, ça pique, ça lance, c’est engourdi.'),
        b('Formal questions use inversion: Avez-vous… ? Prenez-vous… ?', 'Les questions soutenues emploient l’inversion : Avez-vous… ? Prenez-vous… ?'),
      ],
      vocab: [['la douleur', b('pain', 'sensation de mal')], ['la poitrine', b('chest', 'partie avant du haut du corps')], ['le poignet', b('wrist', 'entre la main et le bras')], ['la tension', b('blood pressure', 'pression du sang')], ['le triage', b('triage', 'évaluation à l’arrivée aux urgences')]],
    },
  },
  {
    id: 'healthcare-french-2',
    slug: { en: 'explaining-care-and-reassuring', fr: 'expliquer-un-soin-et-rassurer' },
    title: b('Explaining care and reassuring', 'Expliquer un soin et rassurer'),
    summary: b('Announce what you are going to do, give clear instructions and reassure an anxious patient.', 'Annoncer ce que vous allez faire, donner des consignes claires et rassurer un patient inquiet.'),
    objectives: [b('Announce a procedure with je vais + infinitive', 'Annoncer un soin avec je vais + infinitif'), b('Give instructions politely', 'Donner des consignes poliment'), b('Reassure with the right words', 'Rassurer avec les bons mots')],
    minutes: 14,
    steps: [
      card(b('Announce before you act', 'Annoncez avant d’agir'), b('**Je vais** + infinitive tells the patient what comes next: **Je vais prendre votre tension.** · **Je vais vous faire une prise de sang.** · **Je vais changer votre pansement.** It reduces anxiety and shows respect.', '**Je vais** + infinitif annonce au patient ce qui va se passer : **Je vais prendre votre tension.** · **Je vais vous faire une prise de sang.** · **Je vais changer votre pansement.** Cela diminue l’anxiété et marque le respect.'), {
        examples: [{ fr: 'Je vais prendre votre tension et votre température.', tr: 'I am going to take your blood pressure and your temperature.' }, { fr: 'Je vais vous faire une prise de sang.', tr: 'I am going to take a blood sample.' }, { fr: 'Ça va piquer un peu.', tr: 'It will sting a little.' }],
      }),
      card(b('Instructions, gently', 'Des consignes, en douceur'), b('The imperative with **vous**, softened by **s’il vous plaît** or **pouvez-vous**: **Respirez profondément.** · **Tendez le bras, s’il vous plaît.** · **Pouvez-vous vous allonger sur le dos ?** · **Ne bougez pas.** · **Détendez-vous.**', 'L’impératif avec **vous**, adouci par **s’il vous plaît** ou **pouvez-vous** : **Respirez profondément.** · **Tendez le bras, s’il vous plaît.** · **Pouvez-vous vous allonger sur le dos ?** · **Ne bougez pas.** · **Détendez-vous.**'), {
        examples: [{ fr: 'Respirez profondément.', tr: 'Breathe deeply.' }, { fr: 'Tendez le bras, s’il vous plaît.', tr: 'Hold out your arm, please.' }, { fr: 'Pouvez-vous vous allonger sur le dos ?', tr: 'Can you lie on your back?' }],
      }),
      listen('B1', 'f2', 'Je vais vous faire une prise de sang. Tendez le bras gauche et serrez le poing, s’il vous plaît.', 'Que doit faire le patient ?', ['Tendre le bras gauche et serrer le poing', 'Se coucher sur le côté gauche', 'Lever le bras droit', 'Ouvrir la bouche']),
      pick('B1', b('Which sentence announces a procedure?', 'Quelle phrase annonce un soin ?'), ['Je vais changer votre pansement.', 'Changez votre pansement.', 'Votre pansement est changé ?', 'Le pansement change.']),
      card(b('Reassuring', 'Rassurer'), b('**Ne vous inquiétez pas.** · **C’est tout à fait normal.** · **Ça ne durera pas longtemps.** · **Je reste avec vous.** · **Vous faites ça très bien.** · **Si vous avez mal, dites-le-moi.**', '**Ne vous inquiétez pas.** · **C’est tout à fait normal.** · **Ça ne durera pas longtemps.** · **Je reste avec vous.** · **Vous faites ça très bien.** · **Si vous avez mal, dites-le-moi.**'), {
        variant: 'tip',
        examples: [{ fr: 'Ne vous inquiétez pas, c’est tout à fait normal.', tr: 'Don’t worry, it is perfectly normal.' }, { fr: 'Si vous avez mal, dites-le-moi.', tr: 'If it hurts, tell me.' }],
      }),
      pick('B1', b('A patient is afraid of the needle. What do you say?', 'Un patient a peur de la piqûre. Que dites-vous ?'), ['Ne vous inquiétez pas, ça va piquer un peu, mais c’est très rapide.', 'Ce n’est rien, arrêtez.', 'Tout le monde y passe.', 'Dépêchez-vous.']),
      { kind: 'categorize', prompt: b('Instruction or reassurance?', 'Consigne ou parole rassurante ?'), buckets: [b('Instruction', 'Consigne'), b('Reassurance', 'Parole rassurante')], items: [{ text: 'Respirez profondément.', bucket: 0 }, { text: 'Ne vous inquiétez pas.', bucket: 1 }, { text: 'Tendez le bras.', bucket: 0 }, { text: 'Je reste avec vous.', bucket: 1 }, { text: 'Ne bougez pas.', bucket: 0 }, { text: 'C’est tout à fait normal.', bucket: 1 }] },
      { kind: 'fill', prompt: b('Complete the sentences.', 'Complétez les phrases.'), text: 'Je ___ prendre votre température. Ne vous ___ pas, c’est rapide.', answers: [['vais'], ['inquiétez']], choices: [['vais', 'suis', 'veux'], ['inquiétez', 'inquiète', 'inquiéter']] },
      { kind: 'speak', prompt: b('Say it aloud.', 'Dites-le à voix haute.'), text: 'Je vais prendre votre tension. Détendez-vous et respirez profondément.', tr: 'I am going to take your blood pressure. Relax and breathe deeply.' },
    ],
    notes: {
      points: [
        b('Announce: **Je vais** + infinitive (Je vais prendre votre tension).', 'Annoncer : **Je vais** + infinitif (Je vais prendre votre tension).'),
        b('Instructions: imperative with vous + s’il vous plaît; or Pouvez-vous… ?', 'Consignes : impératif avec vous + s’il vous plaît ; ou Pouvez-vous… ?'),
        b('Reassure: Ne vous inquiétez pas. C’est normal. Je reste avec vous.', 'Rassurer : Ne vous inquiétez pas. C’est normal. Je reste avec vous.'),
        b('Warn about pain honestly: Ça va piquer un peu.', 'Prévenez de la douleur avec honnêteté : Ça va piquer un peu.'),
      ],
      vocab: [['la prise de sang', b('blood test', 'prélèvement de sang')], ['le pansement', b('dressing, bandage', 'protection sur une plaie')], ['s’allonger', b('to lie down', 'se mettre à l’horizontale')], ['serrer le poing', b('to make a fist', 'fermer la main fort')], ['la piqûre', b('injection', 'injection avec une aiguille')]],
    },
  },
  {
    id: 'healthcare-french-3',
    slug: { en: 'passing-on-information', fr: 'transmettre-des-informations' },
    title: b('Passing on information: reports and handover', 'Transmettre des informations : rapport et relève'),
    summary: b('Describe a patient’s state to a colleague, read a care note and speak with the family.', 'Décrire l’état d’un patient à un collègue, lire une note au dossier et parler avec la famille.'),
    objectives: [b('Describe a patient’s condition', 'Décrire l’état d’un patient'), b('Understand a handover report', 'Comprendre un rapport de relève'), b('Inform a family simply', 'Informer simplement une famille')],
    minutes: 14,
    steps: [
      card(b('The handover', 'La relève'), b('At shift change, the report follows a fixed order: **who** (Monsieur Tremblay, chambre 12), **why** (admis pour une pneumonie), **state** (stable, il a bien dormi), **care done** (pansement refait à 6 h), **to watch** (à surveiller : la température).', 'Au changement de quart, le rapport suit un ordre fixe : **qui** (Monsieur Tremblay, chambre 12), **pourquoi** (admis pour une pneumonie), **état** (stable, il a bien dormi), **soins faits** (pansement refait à 6 h), **à surveiller** (la température).'), {
        examples: [{ fr: 'Madame Gagnon, chambre huit, a été admise hier pour une fracture de la hanche.', tr: 'Mrs Gagnon, room eight, was admitted yesterday for a hip fracture.' }, { fr: 'Son état est stable. Elle se plaint de douleurs la nuit.', tr: 'Her condition is stable. She complains of pain at night.' }, { fr: 'À surveiller : la tension et la température.', tr: 'To monitor: blood pressure and temperature.' }],
      }),
      listen('B1', 'f', 'Monsieur Tremblay, chambre douze. Il a été opéré hier. Il a peu dormi et il se plaint de nausées. Il n’a pas encore mangé ce matin.', 'Quel problème le patient signale-t-il ?', ['Des nausées', 'Des maux de tête', 'De la fièvre', 'Une douleur au bras']),
      listen('B1', 'm2', 'Pour madame Roy : pansement refait à six heures, pas de fièvre. À surveiller : elle est tombée hier, donc ne la laissez pas se lever seule.', 'Que faut-il surveiller ?', ['Qu’elle ne se lève pas seule', 'Sa température', 'Son pansement', 'Ses repas']),
      card(b('Useful structures', 'Les structures utiles'), b('**se plaindre de** + noun: il se plaint de douleurs. **avoir de la difficulté à** + infinitive: elle a de la difficulté à respirer. The **passive** for care: le pansement **a été changé**; le médecin **a été avisé**. **Aucun(e)** for “no”: aucune allergie connue.', '**se plaindre de** + nom : il se plaint de douleurs. **avoir de la difficulté à** + infinitif : elle a de la difficulté à respirer. Le **passif** pour les soins : le pansement **a été changé** ; le médecin **a été avisé**. **Aucun(e)** : aucune allergie connue.'), { variant: 'tip' }),
      pick('B1', b('Choose the right form.', 'Choisissez la bonne forme.'), ['a été avisé', 'a avisé', 'est avisant', 'avise'], { fr: 'Le médecin ___ du changement à 14 h.' }),
      pick('B1', b('Choose the right word.', 'Choisissez le bon mot.'), ['se plaint de', 'se plaint à', 'plaint de', 'se plaindre'], { fr: 'Le patient ___ maux de tête depuis hier.' }),
      { kind: 'mcq', prompt: b('Read the note. What must be done?', 'Lisez la note. Que faut-il faire ?'), level: 'B1', doc: { title: b('Care note', 'Note au dossier'), text: 'Ch. 5 — Mme Lavoie, 82 ans. Diabétique. Glycémie à vérifier avant chaque repas. Marche avec une aide. Aucune allergie connue. Famille à prévenir en cas de changement.' }, options: ['Vérifier la glycémie avant chaque repas', 'Vérifier la glycémie une fois par semaine', 'La laisser marcher seule', 'Éviter de prévenir la famille'], answer: 0 },
      { kind: 'dialogue', title: b('Speaking with the family', 'Parler avec la famille'), scene: b('You are the nurse. Choose your best replies.', 'Vous êtes l’infirmier ou l’infirmière. Choisissez vos meilleures répliques.'), speakers: [{ name: 'Fille de la patiente', voice: 'f2', side: 'l' }, { name: 'Vous', voice: 'm', side: 'r' }], lines: [
        { s: 0, fr: 'Bonjour, je suis la fille de madame Lavoie. Comment va-t-elle aujourd’hui ?', tr: 'Hello, I am Mrs Lavoie’s daughter. How is she today?' },
        { s: 1, choose: { options: ['Bonjour, madame. Son état est stable : elle a bien dormi et elle a mangé ce matin.', 'Ça va.', 'Je ne peux rien dire.'], answer: 0 } },
        { s: 0, fr: 'Est-ce que je peux la voir ?', tr: 'May I see her?' },
        { s: 1, choose: { options: ['Bien sûr. Elle est dans sa chambre. Elle sera contente de vous voir.', 'Non, pas maintenant, revenez.', 'Elle dort, au revoir.'], answer: 0 } },
      ] },
      { kind: 'speak', prompt: b('Give this report aloud.', 'Donnez ce rapport à voix haute.'), text: 'Son état est stable. Elle a bien dormi et elle ne se plaint d’aucune douleur.', tr: 'Her condition is stable. She slept well and does not complain of any pain.' },
    ],
    notes: {
      points: [
        b('Handover order: who, why admitted, state, care done, what to watch.', 'Ordre de la relève : qui, motif d’admission, état, soins faits, à surveiller.'),
        b('se plaindre de + noun; avoir de la difficulté à + infinitive.', 'se plaindre de + nom ; avoir de la difficulté à + infinitif.'),
        b('Passive for care: a été changé, a été avisé, a été admis(e).', 'Passif pour les soins : a été changé, a été avisé, a été admis(e).'),
        b('With families: clear, simple, kind. Son état est stable.', 'Avec les familles : clair, simple, bienveillant. Son état est stable.'),
      ],
      vocab: [['la relève', b('handover', 'passage d’informations entre équipes')], ['le quart de travail', b('shift (Québec)', 'période de travail')], ['surveiller', b('to monitor', 'observer avec attention')], ['aviser', b('to notify', 'informer')], ['la glycémie', b('blood sugar', 'taux de sucre dans le sang')]],
    },
  },
];

export default lessons;
