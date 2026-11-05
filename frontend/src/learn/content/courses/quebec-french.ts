import { b, type Lesson } from '../../types';

const lessons: Lesson[] = [
  {
    id: 'quebec-french-1',
    slug: { en: 'everyday-quebec-expressions', fr: 'expressions-quebecoises' },
    title: b('Everyday Québec expressions', 'Les expressions québécoises du quotidien'),
    summary: b('The words you will hear on your first day in Québec: char, magasiner, dépanneur, bienvenue, c’est correct…', 'Les mots que vous entendrez dès votre premier jour au Québec : char, magasiner, dépanneur, bienvenue, c’est correct…'),
    objectives: [b('Understand common Québec words', 'Comprendre les mots québécois courants'), b('Know their equivalent in France', 'Connaître leur équivalent en France'), b('Avoid misunderstandings', 'Éviter les malentendus')],
    minutes: 12,
    steps: [
      {
        kind: 'concept',
        variant: 'culture',
        title: b('One language, several accents', 'Une langue, plusieurs accents'),
        body: b('About 8 million people speak French in Québec. It is the same French, with its own words, expressions and accent, just as British and American English differ. Québec French is not “old French”: it is a modern, living variety.', 'Environ 8 millions de personnes parlent français au Québec. C’est le même français, avec ses mots, ses expressions et son accent, comme l’anglais britannique et l’américain diffèrent. Le français québécois n’est pas du « vieux français » : c’est une variété moderne et vivante.'),
        image: 'course-quebec-french',
      },
      {
        kind: 'flashcards',
        title: b('Québec words', 'Mots québécois'),
        cards: [
          { fr: 'un char', tr: b('a car (France: une voiture)', 'une voiture') },
          { fr: 'magasiner', tr: b('to go shopping (France: faire du shopping)', 'faire les magasins') },
          { fr: 'un dépanneur', tr: b('a corner store', 'une épicerie de quartier') },
          { fr: 'Bienvenue !', tr: b('You’re welcome! (after merci)', 'De rien !') },
          { fr: 'C’est correct.', tr: b('It’s OK / fine', 'Ça va, pas de problème') },
          { fr: 'un chum / une blonde', tr: b('a boyfriend / a girlfriend', 'un petit ami / une petite amie') },
          { fr: 'le déjeuner, le dîner, le souper', tr: b('breakfast, lunch, dinner', 'petit-déjeuner, déjeuner, dîner (France)') },
        ],
      },
      {
        kind: 'match',
        prompt: b('Québec ↔ France.', 'Québec ↔ France.'),
        pairs: [['un char', 'une voiture'], ['magasiner', 'faire les magasins'], ['le souper', 'le dîner'], ['un dépanneur', 'une épicerie de quartier'], ['une blonde', 'une petite amie']],
      },
      {
        kind: 'concept',
        variant: 'trap',
        title: b('Meal times: a classic confusion', 'Les repas : la confusion classique'),
        body: b('In Québec: **déjeuner** = breakfast, **dîner** = lunch, **souper** = dinner. In France: **petit-déjeuner**, **déjeuner**, **dîner**. If a Québec colleague invites you “pour dîner”, it is at noon!', 'Au Québec : **déjeuner** = le matin, **dîner** = le midi, **souper** = le soir. En France : **petit-déjeuner**, **déjeuner**, **dîner**. Si un collègue québécois vous invite « pour dîner », c’est à midi !'),
      },
      {
        kind: 'mcq',
        prompt: b('Your Québec colleague says “On va dîner ensemble ?” at 11:30. When?', 'Votre collègue québécois dit « On va dîner ensemble ? » à 11 h 30. Quand ?'),
        options: [b('Now, at lunchtime', 'Maintenant, le midi'), b('Tonight', 'Ce soir'), b('Tomorrow morning', 'Demain matin'), b('Next week', 'La semaine prochaine')],
        answer: 0,
      },
      {
        kind: 'dialogue',
        title: b('At the dépanneur', 'Au dépanneur'),
        scene: b('You work in a corner store in Montréal. A customer comes in.', 'Vous travaillez dans un dépanneur à Montréal. Une cliente entre.'),
        speakers: [{ name: 'Cliente', voice: 'f', side: 'l' }, { name: 'Vous', voice: 'm2', side: 'r' }],
        lines: [
          { s: 1, fr: 'Bonsoir ! Je peux vous aider ?', tr: 'Good evening! Can I help you?' },
          { s: 0, fr: 'Oui, vous avez du lait et du pain ?', tr: 'Yes, do you have milk and bread?' },
          { s: 1, fr: 'Le lait est dans le frigo au fond, pis le pain, juste à côté.', tr: 'The milk is in the fridge at the back, and the bread is right next to it.' },
          { s: 0, fr: 'Parfait, merci beaucoup !', tr: 'Perfect, thanks a lot!' },
          { s: 1, choose: { options: ['Bienvenue ! Bonne soirée !', 'Merci ! Bonne nuit pour dîner !', 'C’est mon char !'], answer: 0, explain: b('In Québec, **bienvenue** answers **merci**.', 'Au Québec, **bienvenue** répond à **merci**.') } },
        ],
      },
      {
        kind: 'mcq',
        prompt: b('Listen. What is Kevin going to do on Saturday?', 'Écoutez. Que va faire Kevin samedi ?'),
        audio: 'Samedi, je vais magasiner avec ma blonde, pis le soir, on va souper chez mes parents.',
        listen: true,
        voice: 'm',
        options: [b('Shopping with his girlfriend, then dinner at his parents’', 'Les magasins avec sa copine, puis souper chez ses parents'), b('Repair his car', 'Réparer son auto'), b('Lunch with his blond sister', 'Dîner avec sa sœur blonde'), b('Go to the corner store', 'Aller au dépanneur')],
        answer: 0,
      },
    ],
    notes: {
      points: [
        b('Québec: un char (car), magasiner (shopping), un dépanneur (corner store), bienvenue (you’re welcome), c’est correct (it’s OK).', 'Québec : un char (voiture), magasiner (faire les magasins), un dépanneur (épicerie de quartier), bienvenue (de rien), c’est correct (ça va).'),
        b('Meals in Québec: déjeuner (morning), dîner (noon), souper (evening).', 'Repas au Québec : déjeuner (matin), dîner (midi), souper (soir).'),
        b('Un chum, une blonde = boyfriend, girlfriend; pis = puis (and then).', 'Un chum, une blonde = petit ami, petite amie ; pis = puis.'),
      ],
      vocab: [['un char', b('car', 'voiture')], ['magasiner', b('to shop', 'faire les magasins')], ['le dépanneur', b('corner store', 'épicerie')], ['bienvenue', b('you’re welcome', 'de rien')], ['le souper', b('dinner (evening)', 'repas du soir')], ['pis', b('and then (informal)', 'puis')]],
    },
  },
  {
    id: 'quebec-french-2',
    slug: { en: 'the-quebec-accent', fr: 'l-accent-quebecois' },
    title: b('Understanding the Québec accent', 'Comprendre l’accent québécois'),
    summary: b('Four features that surprise newcomers: tsi / dzu, the open vowels, the questions with -tu, and the dropped words.', 'Quatre traits qui surprennent les nouveaux arrivants : tsi / dzu, les voyelles ouvertes, les questions en -tu et les mots avalés.'),
    objectives: [b('Recognise the affrication tu → tsu, di → dzi', 'Reconnaître l’affrication tu → tsu, di → dzi'), b('Understand questions with -tu', 'Comprendre les questions en -tu'), b('Get used to fast colloquial speech', 'S’habituer au parler familier rapide')],
    minutes: 12,
    steps: [
      {
        kind: 'concept',
        title: b('Tu → “tsu”, dis → “dzi”', 'Tu → « tsu », dis → « dzi »'),
        body: b('Before **i** and **u**, Québec speakers pronounce **t** as [ts] and **d** as [dz]: *petit* → “p’tsi”, *tu dis* → “tsu dzi”, *mardi* → “mardzi”. It is the most recognisable feature of the accent.', 'Devant **i** et **u**, on prononce au Québec le **t** [ts] et le **d** [dz] : *petit* → « p’tsi », *tu dis* → « tsu dzi », *mardi* → « mardzi ». C’est le trait le plus reconnaissable de l’accent.'),
      },
      {
        kind: 'concept',
        title: b('Questions with -tu', 'Les questions en -tu'),
        body: b('In informal Québec speech, a **-tu** after the verb turns a sentence into a yes/no question, whatever the subject: **Tu viens-tu ?** (Are you coming?), **C’est-tu loin ?** (Is it far?). It is not the pronoun tu!', 'En québécois familier, un **-tu** après le verbe transforme la phrase en question fermée, quel que soit le sujet : **Tu viens-tu ?**, **C’est-tu loin ?**. Ce n’est pas le pronom tu !'),
        examples: [{ fr: 'C’est-tu loin ?', tr: 'Is it far?' }, { fr: 'Vous êtes-tu prêts ?', tr: 'Are you ready?' }],
      },
      {
        kind: 'match',
        prompt: b('Colloquial Québec ↔ standard French.', 'Québécois familier ↔ français standard.'),
        pairs: [['C’est-tu loin ?', 'Est-ce que c’est loin ?'], ['Chu fatigué.', 'Je suis fatigué.'], ['Y fait frette !', 'Il fait très froid !'], ['Ben oui !', 'Bien sûr !']],
      },
      {
        kind: 'mcq',
        prompt: b('What does “Y fait frette à matin !” mean?', 'Que signifie « Y fait frette à matin ! » ?'),
        options: [b('It’s really cold this morning!', 'Il fait vraiment froid ce matin !'), b('It’s hot this morning!', 'Il fait chaud ce matin !'), b('He is making fries this morning!', 'Il fait des frites ce matin !'), b('It will snow tonight!', 'Il va neiger ce soir !')],
        answer: 0,
      },
      {
        kind: 'concept',
        variant: 'tip',
        title: b('Strategy: ask, people are friendly', 'Stratégie : demandez, les gens sont accueillants'),
        body: b('If you do not understand, simply say **Pardon, pouvez-vous répéter plus lentement ?** Québec speakers adapt easily and will often switch to a more standard French with you.', 'Si vous ne comprenez pas, dites simplement **Pardon, pouvez-vous répéter plus lentement ?** Les Québécois s’adaptent facilement et passeront souvent à un français plus standard avec vous.'),
      },
      {
        kind: 'speak',
        prompt: b('Ask someone to repeat politely.', 'Demandez poliment de répéter.'),
        text: 'Pardon, pouvez-vous répéter un peu plus lentement, s’il vous plaît ?',
        tr: 'Sorry, could you repeat a little more slowly, please?',
      },
    ],
    notes: {
      points: [
        b('t / d before i, u → [ts] / [dz]: petit → “p’tsi”, mardi → “mardzi”.', 't / d devant i, u → [ts] / [dz] : petit → « p’tsi », mardi → « mardzi ».'),
        b('Question marker -tu: C’est-tu loin ? = Est-ce que c’est loin ?', 'Marqueur de question -tu : C’est-tu loin ? = Est-ce que c’est loin ?'),
        b('Colloquial: chu (je suis), y (il), frette (froid), à matin (ce matin), ben (bien).', 'Familier : chu (je suis), y (il), frette (froid), à matin (ce matin), ben (bien).'),
      ],
      vocab: [['frette', b('very cold (Québec)', 'très froid')], ['à matin', b('this morning (Québec)', 'ce matin')], ['ben oui', b('of course', 'bien sûr')], ['plus lentement', b('more slowly', 'moins vite')]],
    },
  },
  {
    id: 'quebec-french-3',
    slug: { en: 'daily-life-in-quebec', fr: 'la-vie-pratique-au-quebec' },
    title: b('Daily life in Québec: practical vocabulary', 'La vie pratique au Québec : vocabulaire utile'),
    summary: b('Housing, transport, health and paperwork: the words and situations of your first months in Québec.', 'Logement, transport, santé et démarches : les mots et les situations de vos premiers mois au Québec.'),
    objectives: [b('Understand housing vocabulary (un 4 et demi, le bail)', 'Comprendre le vocabulaire du logement (un 4 et demi, le bail)'), b('Handle health and administrative situations', 'Gérer les situations de santé et administratives'), b('Read a typical rental ad', 'Lire une annonce de location typique')],
    minutes: 13,
    steps: [
      {
        kind: 'concept',
        variant: 'culture',
        title: b('A “4 et demi”?', 'Un « 4 et demi » ?'),
        body: b('In Québec, apartments are counted in **rooms + half** (the bathroom): a **3 et demi** has a kitchen, a living room and one bedroom; a **4 et demi** has two bedrooms. The lease is **le bail**, and many leases start on **1st July**, moving day!', 'Au Québec, on compte les logements en **pièces + demie** (la salle de bains) : un **3 et demi** a une cuisine, un salon et une chambre ; un **4 et demi** a deux chambres. Le contrat de location est **le bail**, et beaucoup de baux commencent le **1er juillet**, le jour du déménagement !'),
      },
      {
        kind: 'mcq',
        prompt: b('Read the ad. How many bedrooms?', 'Lisez l’annonce. Combien de chambres ?'),
        doc: { title: b('Rental ad', 'Annonce de location'), text: '4 ½ à louer — Rosemont. Rénové, lumineux, près du métro. Chauffé, eau chaude incluse. Libre le 1er juillet. Bail de 12 mois. Non-fumeur, pas d’animaux.' },
        options: ['2', '4', '1', '3'],
        answer: 0,
        explain: b('A 4 ½ = kitchen + living room + 2 bedrooms + bathroom.', 'Un 4 ½ = cuisine + salon + 2 chambres + salle de bains.'),
      },
      {
        kind: 'mcq',
        prompt: b('What is included in the rent?', 'Qu’est-ce qui est compris dans le loyer ?'),
        doc: { title: b('Rental ad', 'Annonce de location'), text: '4 ½ à louer — Rosemont. Rénové, lumineux, près du métro. Chauffé, eau chaude incluse. Libre le 1er juillet. Bail de 12 mois. Non-fumeur, pas d’animaux.' },
        options: [b('Heating and hot water', 'Le chauffage et l’eau chaude'), b('Internet and electricity', 'Internet et l’électricité'), b('Parking', 'Le stationnement'), b('Furniture', 'Les meubles')],
        answer: 0,
      },
      {
        kind: 'flashcards',
        title: b('Paperwork and health', 'Démarches et santé'),
        cards: [
          { fr: 'la carte d’assurance maladie (RAMQ)', tr: b('health insurance card', 'carte pour se faire soigner') },
          { fr: 'le NAS (numéro d’assurance sociale)', tr: b('social insurance number', 'numéro pour travailler') },
          { fr: 'une clinique sans rendez-vous', tr: b('walk-in clinic', 'consultation sans rendez-vous') },
          { fr: 'le permis de conduire', tr: b('driver’s licence', 'autorisation de conduire') },
          { fr: 'la francisation', tr: b('French courses for newcomers', 'cours de français pour immigrants') },
        ],
      },
      {
        kind: 'dialogue',
        title: b('At a walk-in clinic', 'À la clinique sans rendez-vous'),
        scene: b('You arrive at reception.', 'Vous arrivez à l’accueil.'),
        speakers: [{ name: 'Réceptionniste', voice: 'f2', side: 'l' }, { name: 'Vous', voice: 'm', side: 'r' }],
        lines: [
          { s: 0, fr: 'Bonjour ! Avez-vous votre carte d’assurance maladie ?', tr: 'Hello! Do you have your health insurance card?' },
          { s: 1, choose: { options: ['Oui, la voici. Je suis arrivé il y a trois mois.', 'Oui, voici mon char.', 'Non, je suis la carte.'], answer: 0 } },
          { s: 0, fr: 'Merci. Quel est le motif de votre visite ?', tr: 'Thank you. What is the reason for your visit?' },
          { s: 1, choose: { options: ['J’ai mal au dos depuis une semaine.', 'Je vais magasiner.', 'C’est mardi.'], answer: 0 } },
          { s: 0, fr: 'D’accord. L’attente est d’environ une heure. Assoyez-vous, on va vous appeler.', tr: 'OK. The wait is about an hour. Have a seat, we’ll call you.' },
        ],
      },
      {
        kind: 'concept',
        variant: 'exam',
        title: b('Useful for the TCF Québec and TEFAQ', 'Utile pour le TCF Québec et le TEFAQ'),
        body: b('The speaking tasks of the Québec exams often use daily-life situations: renting an apartment, a clinic, a school registration. Knowing this vocabulary gives you confidence on the day.', 'Les tâches orales des examens québécois reprennent souvent des situations du quotidien : louer un logement, une clinique, une inscription scolaire. Connaître ce vocabulaire vous donne de l’assurance le jour J.'),
      },
      {
        kind: 'speak',
        prompt: b('Ask about an apartment.', 'Renseignez-vous sur un logement.'),
        text: 'Bonjour, j’appelle pour le 4 et demi. Est-ce que le chauffage est inclus ?',
        tr: 'Hello, I’m calling about the 4½. Is heating included?',
      },
    ],
    notes: {
      points: [
        b('Housing: un 3 ½ (1 bedroom), un 4 ½ (2 bedrooms); le bail = the lease; moving day: 1st July.', 'Logement : un 3 ½ (1 chambre), un 4 ½ (2 chambres) ; le bail ; jour du déménagement : 1er juillet.'),
        b('Paperwork: carte d’assurance maladie (RAMQ), NAS, permis de conduire, francisation.', 'Démarches : carte d’assurance maladie (RAMQ), NAS, permis de conduire, francisation.'),
        b('Health: une clinique sans rendez-vous, le motif de la visite.', 'Santé : une clinique sans rendez-vous, le motif de la visite.'),
      ],
      vocab: [['un 4 et demi', b('a 2-bedroom apartment', 'logement de deux chambres')], ['le bail', b('the lease', 'contrat de location')], ['chauffé', b('heated (heating included)', 'chauffage compris')], ['la francisation', b('French for newcomers', 'cours de français pour immigrants')]],
    },
  },
];

export default lessons;
