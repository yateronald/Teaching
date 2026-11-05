import { b, type Lesson } from '../../types';

const lessons: Lesson[] = [
  {
    id: 'liaison-intonation-1',
    slug: { en: 'liaisons', fr: 'les-liaisons' },
    title: b('Liaisons: compulsory and forbidden', 'Les liaisons : obligatoires et interdites'),
    summary: b('Why “les amis” sounds like “lé-z-ami”, the liaisons you must make and the ones you must never make.', 'Pourquoi « les amis » se prononce « lé-z-ami », les liaisons à faire et celles à ne jamais faire.'),
    objectives: [b('Make the compulsory liaisons', 'Faire les liaisons obligatoires'), b('Know the sounds of liaison: [z], [t], [n]', 'Connaître les sons de liaison : [z], [t], [n]'), b('Avoid the forbidden liaisons', 'Éviter les liaisons interdites')],
    minutes: 12,
    steps: [
      {
        kind: 'concept',
        title: b('A silent letter wakes up', 'Une lettre muette se réveille'),
        body: b('A final consonant that is normally silent is pronounced when the next word starts with a vowel or a silent h. The **s** and **x** become **[z]**, the **d** becomes **[t]**.', 'Une consonne finale normalement muette se prononce quand le mot suivant commence par une voyelle ou un h muet. Le **s** et le **x** deviennent **[z]**, le **d** devient **[t]**.'),
        examples: [{ fr: 'les amis', tr: '[le‿z‿ami]' }, { fr: 'deux heures', tr: '[dø‿z‿œʁ]' }, { fr: 'un grand homme', tr: '[œ̃ ɡʁɑ̃‿t‿ɔm]' }, { fr: 'mon ami', tr: '[mɔ̃‿n‿ami]' }],
      },
      {
        kind: 'concept',
        title: b('Compulsory liaisons', 'Les liaisons obligatoires'),
        table: {
          head: [b('Between…', 'Entre…'), b('Example', 'Exemple')],
          rows: [[b('article + noun', 'article + nom'), 'les‿enfants, un‿ami'], [b('pronoun + verb', 'pronom + verbe'), 'nous‿avons, ils‿ont, on‿arrive'], [b('adjective + noun', 'adjectif + nom'), 'de petits‿enfants, un bon‿ami'], [b('after short words', 'après les mots courts'), 'très‿important, chez‿eux, en‿avance']],
        },
      },
      {
        kind: 'mcq',
        prompt: b('Listen. Do you hear the liaison?', 'Écoutez. Entendez-vous la liaison ?'),
        audio: 'Ils ont un appartement.',
        listen: true,
        options: [b('Yes, two liaisons: ils‿ont, un‿appartement', 'Oui, deux liaisons : ils‿ont, un‿appartement'), b('No liaison', 'Aucune liaison')],
        fixedOrder: true,
        answer: 0,
      },
      {
        kind: 'concept',
        variant: 'trap',
        title: b('Forbidden liaisons', 'Les liaisons interdites'),
        points: [
          b('After **et**: un homme et‿ une femme ✗ → “et / une”.', 'Après **et** : un homme et / une femme (jamais de liaison).'),
          b('Before an **aspirated h**: les / héros, les / haricots (no liaison!).', 'Devant un **h aspiré** : les / héros, les / haricots (pas de liaison !).'),
          b('After a singular noun: un étudiant / intelligent.', 'Après un nom singulier : un étudiant / intelligent.'),
        ],
        examples: [{ fr: 'les héros', tr: 'no liaison: [le eʁo]' }, { fr: 'les hôtels', tr: 'liaison: [le‿z‿otɛl] (silent h)' }],
      },
      {
        kind: 'categorize',
        prompt: b('Liaison or no liaison?', 'Liaison ou pas ?'),
        buckets: [b('Liaison', 'Liaison'), b('No liaison', 'Pas de liaison')],
        items: [{ text: 'nous avons', bucket: 0 }, { text: 'les hôpitaux', bucket: 0 }, { text: 'très utile', bucket: 0 }, { text: 'les haricots', bucket: 1 }, { text: 'Paul et Anne', bucket: 1 }, { text: 'un enfant / adorable', bucket: 1 }],
      },
      {
        kind: 'speak',
        prompt: b('Say it with the liaisons.', 'Dites-le avec les liaisons.'),
        text: 'Mes amis ont deux enfants très intelligents.',
        tr: 'My friends have two very intelligent children.',
        tip: b('mes‿amis, ont, deux‿enfants, très‿intelligents: three [z] liaisons.', 'mes‿amis, deux‿enfants, très‿intelligents : trois liaisons en [z].'),
      },
      {
        kind: 'dictation',
        prompt: b('Write what you hear.', 'Écrivez ce que vous entendez.'),
        text: 'Nous avons trois enfants.',
        voice: 'm',
      },
    ],
    notes: {
      points: [
        b('Liaison: a silent final consonant is pronounced before a vowel or silent h; s/x → [z], d → [t].', 'Liaison : une consonne finale muette se prononce devant une voyelle ou un h muet ; s/x → [z], d → [t].'),
        b('Compulsory: article + noun, pronoun + verb, adjective + noun, after short words (très, chez, en).', 'Obligatoire : article + nom, pronom + verbe, adjectif + nom, après les mots courts (très, chez, en).'),
        b('Forbidden: after et, before an aspirated h (les héros), after a singular noun.', 'Interdite : après et, devant un h aspiré (les héros), après un nom singulier.'),
      ],
      vocab: [['les amis', '[le‿z‿ami]'], ['nous avons', '[nu‿z‿avɔ̃]'], ['les héros', b('no liaison', 'pas de liaison')], ['très important', '[tʁɛ‿z‿ɛ̃pɔʁtɑ̃]']],
    },
  },
  {
    id: 'liaison-intonation-2',
    slug: { en: 'linking-and-the-silent-e', fr: 'l-enchainement-et-le-e-muet' },
    title: b('Linking words and the dropped e', 'L’enchaînement et le e muet'),
    summary: b('French flows as one block of sound: enchaînement, and the e that disappears in everyday speech.', 'Le français coule comme un bloc de son : l’enchaînement, et le e qui disparaît dans la conversation.'),
    objectives: [b('Link words in a breath group', 'Enchaîner les mots dans un groupe de souffle'), b('Understand je suis → “chui”, je ne sais pas → “chais pas”', 'Comprendre je suis → « chui », je ne sais pas → « chais pas »'), b('Speak at a more natural rhythm', 'Parler à un rythme plus naturel')],
    minutes: 12,
    steps: [
      {
        kind: 'concept',
        title: b('Enchaînement: one long word', 'L’enchaînement : un seul long mot'),
        body: b('French does not separate words: a pronounced final consonant links to the next vowel. **Il habite à Paris** sounds like [i-la-bi-ta-pa-ʁi]. This is why spoken French seems so fast.', 'Le français ne sépare pas les mots : une consonne finale prononcée s’enchaîne avec la voyelle suivante. **Il habite à Paris** se prononce [i-la-bi-ta-pa-ʁi]. C’est pour cela que le français parlé semble si rapide.'),
        examples: [{ fr: 'Il habite à Paris.' }, { fr: 'Elle arrive avec une amie.' }, { fr: 'Pour aller à la gare ?' }],
      },
      {
        kind: 'concept',
        title: b('The disappearing e', 'Le e qui disparaît'),
        body: b('In conversation, natives drop many unstressed **e** and the **ne** of negation. You do not have to speak like this, but you must **understand** it.', 'Dans la conversation, les natifs suppriment beaucoup de **e** non accentués et le **ne** de la négation. Vous n’êtes pas obligé de parler ainsi, mais vous devez le **comprendre**.'),
        table: {
          head: [b('Written', 'Écrit'), b('Heard', 'Entendu')],
          rows: [['je ne sais pas', '« chais pas »'], ['je suis', '« chui »'], ['il y a', '« y a »'], ['tu es', '« t’es »'], ['petit', '« p’tit »'], ['je me lève', '« j’me lève »']],
        },
      },
      {
        kind: 'mcq',
        prompt: b('Listen. What does she say?', 'Écoutez. Que dit-elle ?'),
        audio: 'Chais pas, j’suis un peu fatiguée.',
        listen: true,
        voice: 'f2',
        options: ['Je ne sais pas, je suis un peu fatiguée.', 'Je sais, je suis un peu fatiguée.', 'C’est pas, je suis fatiguée.', 'Je sais pas pourquoi elle est fatiguée.'],
        answer: 0,
      },
      {
        kind: 'match',
        prompt: b('Match the spoken form and the written form.', 'Associez la forme orale et la forme écrite.'),
        pairs: [['« y a »', 'il y a'], ['« t’es »', 'tu es'], ['« p’tit »', 'petit'], ['« chais pas »', 'je ne sais pas']],
      },
      {
        kind: 'mcq',
        prompt: b('Listen. What is the problem?', 'Écoutez. Quel est le problème ?'),
        audio: 'Y a plus de lait dans l’frigo, t’as pas pensé à en acheter ?',
        listen: true,
        voice: 'm',
        options: [b('There is no more milk in the fridge', 'Il n’y a plus de lait dans le frigo'), b('The fridge is broken', 'Le frigo est en panne'), b('There is too much milk', 'Il y a trop de lait'), b('He bought milk', 'Il a acheté du lait')],
        answer: 0,
      },
      {
        kind: 'speak',
        prompt: b('Say it in one breath, linking the words.', 'Dites-le d’un seul souffle, en enchaînant.'),
        text: 'Elle habite avec une amie à Ottawa.',
        tr: 'She lives with a friend in Ottawa.',
      },
    ],
    notes: {
      points: [
        b('Enchaînement: a pronounced final consonant links to the next vowel (il‿habite‿à…).', 'Enchaînement : une consonne finale prononcée se lie à la voyelle suivante (il‿habite‿à…).'),
        b('Spoken French drops e and ne: je ne sais pas → « chais pas », il y a → « y a ».', 'Le français parlé supprime e et ne : je ne sais pas → « chais pas », il y a → « y a ».'),
        b('Understand these forms; in exams, speak clearly but naturally.', 'Comprenez ces formes ; à l’examen, parlez clairement mais naturellement.'),
      ],
      vocab: [['« chais pas »', b('I don’t know (spoken)', 'je ne sais pas')], ['« y a »', b('there is (spoken)', 'il y a')], ['« t’es »', b('you are (spoken)', 'tu es')]],
    },
  },
  {
    id: 'liaison-intonation-3',
    slug: { en: 'intonation', fr: 'l-intonation' },
    title: b('Intonation: questions, lists and emotions', 'L’intonation : questions, énumérations et émotions'),
    summary: b('How the melody of your voice turns a statement into a question, structures a list and expresses surprise or doubt.', 'Comment la mélodie de la voix transforme une affirmation en question, organise une énumération et exprime la surprise ou le doute.'),
    objectives: [b('Use rising intonation for questions', 'Utiliser l’intonation montante pour les questions'), b('Use falling intonation at the end of statements', 'Utiliser l’intonation descendante en fin d’affirmation'), b('Express surprise and doubt', 'Exprimer la surprise et le doute')],
    minutes: 11,
    steps: [
      {
        kind: 'concept',
        title: b('Up for a question, down for a statement', 'Montante pour une question, descendante pour une affirmation'),
        body: b('**Tu viens ↗ ?** (question) / **Tu viens ↘.** (statement). With the same words, only the melody changes the meaning. French stresses the **last syllable** of each group.', '**Tu viens ↗ ?** (question) / **Tu viens ↘.** (affirmation). Avec les mêmes mots, seule la mélodie change le sens. Le français accentue la **dernière syllabe** de chaque groupe.'),
        examples: [{ fr: 'Tu viens ?', tr: 'rising: a question' }, { fr: 'Tu viens.', tr: 'falling: a statement' }, { fr: 'Vous êtes canadien ?', tr: 'rising' }],
      },
      {
        kind: 'mcq',
        prompt: b('Listen. Question or statement?', 'Écoutez. Question ou affirmation ?'),
        audio: 'Vous habitez à Montréal ?',
        listen: true,
        voice: 'm',
        options: [b('Question (rising)', 'Question (montante)'), b('Statement (falling)', 'Affirmation (descendante)')],
        fixedOrder: true,
        answer: 0,
      },
      {
        kind: 'mcq',
        prompt: b('Listen. Question or statement?', 'Écoutez. Question ou affirmation ?'),
        audio: 'Vous habitez à Montréal.',
        listen: true,
        voice: 'm',
        options: [b('Question (rising)', 'Question (montante)'), b('Statement (falling)', 'Affirmation (descendante)')],
        fixedOrder: true,
        answer: 1,
      },
      {
        kind: 'concept',
        variant: 'tip',
        title: b('Lists: up, up, up… down', 'Les énumérations : monte, monte, monte… descend'),
        body: b('In a list, the voice rises on each item and falls on the last one, to show the list is finished.', 'Dans une énumération, la voix monte sur chaque élément et descend sur le dernier, pour montrer que la liste est terminée.'),
        examples: [{ fr: 'J’ai acheté du pain, du fromage, des tomates et du vin.' }],
      },
      {
        kind: 'speak',
        prompt: b('Say the list: rise, rise, fall.', 'Dites la liste : monte, monte, descend.'),
        text: 'Je parle français, anglais et espagnol.',
        tr: 'I speak French, English and Spanish.',
      },
      {
        kind: 'concept',
        title: b('Emotions in the voice', 'Les émotions dans la voix'),
        examples: [{ fr: 'C’est vrai ?! Tu as réussi ?!', tr: 'surprise: high and rising' }, { fr: 'Bof… je ne sais pas.', tr: 'doubt: low and flat' }, { fr: 'C’est génial !', tr: 'enthusiasm: high then falling' }],
      },
      {
        kind: 'speak',
        prompt: b('Express surprise.', 'Exprimez la surprise.'),
        text: 'C’est vrai ? Tu pars vivre au Canada ?',
        tr: 'Really? You’re moving to Canada?',
      },
    ],
    notes: {
      points: [
        b('Rising intonation = question (Tu viens ↗ ?); falling = statement (Tu viens ↘.).', 'Intonation montante = question (Tu viens ↗ ?) ; descendante = affirmation (Tu viens ↘.).'),
        b('French stresses the last syllable of each word group.', 'Le français accentue la dernière syllabe de chaque groupe de mots.'),
        b('Lists: rise on each item, fall on the last.', 'Énumérations : montée sur chaque élément, descente sur le dernier.'),
      ],
      vocab: [['bof', b('meh (doubt)', 'hésitation')], ['C’est génial !', b('It’s great!', 'enthousiasme')], ['C’est vrai ?', b('Really?', 'surprise')]],
    },
  },
];

export default lessons;
