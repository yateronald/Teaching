// TCF Canada · Expression orale, A1 → C2. A speaking course: model phrases
// with native audio, repetition with speech recognition, and the strategies of
// the three TCF tasks (interview, role-play, point of view).
import { b, type Lesson } from '../../types';
import { card, pick } from '../kit';

const lessons: Lesson[] = [
  // ── A1 ──
  {
    id: 'tcf-speaking-1',
    level: 'A1',
    slug: { en: 'a1-introduce-yourself', fr: 'a1-se-presenter' },
    title: b('A1 · Introduce yourself', 'A1 · Se présenter'),
    summary: b('Say who you are in simple sentences: name, age, origin, job, family, hobbies.', 'Dire qui vous êtes en phrases simples : nom, âge, origine, métier, famille, loisirs.'),
    objectives: [b('Give your identity in six sentences', 'Donner votre identité en six phrases'), b('Pronounce the key sounds of a self-introduction', 'Prononcer les sons clés d’une présentation'), b('Answer the first questions of the examiner', 'Répondre aux premières questions de l’examinateur')],
    minutes: 14,
    steps: [
      card(b('Six sentences to introduce yourself', 'Six phrases pour vous présenter'), b('The TCF interview (task 1) always starts with you. Prepare six sentences you can say without thinking: **name, age, country, city, job, family**. Then add one hobby.', 'L’entretien du TCF (tâche 1) commence toujours par vous. Préparez six phrases que vous dites sans réfléchir : **nom, âge, pays, ville, métier, famille**. Ajoutez ensuite un loisir.'), {
        examples: [
          { fr: 'Je m’appelle Daniel Okafor.', tr: 'My name is Daniel Okafor.' },
          { fr: 'J’ai trente-deux ans.', tr: 'I am thirty-two.' },
          { fr: 'Je viens du Nigeria et j’habite à Ottawa.', tr: 'I come from Nigeria and I live in Ottawa.' },
          { fr: 'Je suis comptable.', tr: 'I am an accountant.' },
          { fr: 'Je suis marié et j’ai deux enfants.', tr: 'I am married and I have two children.' },
          { fr: 'J’aime la cuisine et le football.', tr: 'I like cooking and football.' },
        ],
      }),
      { kind: 'speak', prompt: b('Say it aloud.', 'Dites-le à voix haute.'), text: 'Je m’appelle Daniel et j’ai trente-deux ans.', tr: 'My name is Daniel and I am thirty-two.' },
      { kind: 'speak', prompt: b('Say it aloud.', 'Dites-le à voix haute.'), text: 'Je viens du Nigeria et j’habite à Ottawa.', tr: 'I come from Nigeria and I live in Ottawa.', tip: b('Du Nigeria, du Mexique (masculine countries); de France, d’Italie (feminine).', 'Du Nigeria, du Mexique (pays masculins) ; de France, d’Italie (pays féminins).') },
      pick('A1', b('The examiner asks: “Quel âge avez-vous ?” Your answer:', 'L’examinateur demande : « Quel âge avez-vous ? » Votre réponse :'), ['J’ai vingt-huit ans.', 'Je suis vingt-huit ans.', 'Mon âge vingt-huit.', 'J’ai vingt-huit.']),
      pick('A1', b('Choose the right word.', 'Choisissez le bon mot.'), ['du', 'de', 'des', 'en'], { fr: 'Je viens ___ Maroc.', explain: b('Le Maroc is masculine: de + le = du.', 'Le Maroc est masculin : de + le = du.') }),
      pick('A1', b('The examiner asks: “Qu’est-ce que vous faites dans la vie ?” He wants to know…', 'L’examinateur demande : « Qu’est-ce que vous faites dans la vie ? » Il veut savoir…'), ['votre métier', 'votre adresse', 'votre âge', 'vos loisirs']),
      pick('A1', b('Choose the right answer to “Vous avez des enfants ?”', 'Choisissez la bonne réponse à « Vous avez des enfants ? »'), ['Oui, j’ai une fille de cinq ans.', 'Oui, je suis une fille.', 'Oui, j’ai cinq ans.', 'Oui, je enfants.']),
      { kind: 'dialogue', title: b('The start of the interview', 'Le début de l’entretien'), scene: b('Choose your best answer.', 'Choisissez votre meilleure réponse.'), speakers: [{ name: 'Examinatrice', voice: 'f2', side: 'l' }, { name: 'Vous', voice: 'm', side: 'r' }], lines: [
        { s: 0, fr: 'Bonjour. Vous pouvez vous présenter ?', tr: 'Hello. Can you introduce yourself?' },
        { s: 1, choose: { options: ['Bonjour ! Je m’appelle Daniel, je viens du Nigeria et je suis comptable.', 'Oui.', 'Daniel.'], answer: 0, explain: b('Never answer in one word: give several pieces of information.', 'Ne répondez jamais en un mot : donnez plusieurs informations.') } },
        { s: 0, fr: 'Et qu’est-ce que vous aimez faire le week-end ?', tr: 'And what do you like doing at the weekend?' },
        { s: 1, choose: { options: ['J’aime faire du vélo et cuisiner avec mes enfants.', 'Le week-end.', 'J’aime week-end vélo.'], answer: 0 } },
      ] },
      { kind: 'speak', prompt: b('Say it aloud.', 'Dites-le à voix haute.'), text: 'Je suis marié et j’ai deux enfants.', tr: 'I am married and I have two children.' },
    ],
    notes: {
      points: [
        b('Six sentences: je m’appelle, j’ai … ans, je viens de / du, j’habite à, je suis + job, j’ai + family.', 'Six phrases : je m’appelle, j’ai … ans, je viens de / du, j’habite à, je suis + métier, j’ai + famille.'),
        b('Age with avoir; job without article: je suis comptable.', 'L’âge avec avoir ; le métier sans article : je suis comptable.'),
        b('Countries: du (masculine), de / d’ (feminine), des (plural): du Canada, de France, des États-Unis.', 'Pays : du (masculin), de / d’ (féminin), des (pluriel) : du Canada, de France, des États-Unis.'),
        b('Never answer in one word: add a detail.', 'Ne répondez jamais en un mot : ajoutez un détail.'),
      ],
      vocab: [['comptable', b('accountant', 'métier des chiffres')], ['marié(e)', b('married', 'qui a un époux')], ['les loisirs (m.)', b('hobbies', 'activités de temps libre')], ['dans la vie', b('for a living', 'comme métier')], ['le week-end', b('weekend', 'samedi et dimanche')]],
    },
  },

  // ── A2 ──
  {
    id: 'tcf-speaking-2',
    level: 'A2',
    slug: { en: 'a2-daily-life-and-past', fr: 'a2-quotidien-et-passe' },
    title: b('A2 · Talk about your daily life and your past', 'A2 · Parler de son quotidien et de son passé'),
    summary: b('Develop task 1: describe your routine, your home, your last holiday, and give simple reasons.', 'Développer la tâche 1 : décrire votre routine, votre logement, vos dernières vacances, et donner des raisons simples.'),
    objectives: [b('Describe a routine with time markers', 'Décrire une routine avec des indicateurs de temps'), b('Talk about a past event with the passé composé', 'Raconter un événement passé au passé composé'), b('Extend your answers with “parce que” and “mais”', 'Développer vos réponses avec « parce que » et « mais »')],
    minutes: 15,
    steps: [
      card(b('Task 1: the guided interview', 'La tâche 1 : l’entretien dirigé'), b('Task 1 lasts **2 minutes**, without preparation. The examiner asks about your life: work, family, home, hobbies, plans. Aim for **three sentences per answer**: the answer, a detail, a reason.', 'La tâche 1 dure **2 minutes**, sans préparation. L’examinateur vous interroge sur votre vie : travail, famille, logement, loisirs, projets. Visez **trois phrases par réponse** : la réponse, un détail, une raison.'), { variant: 'exam' }),
      card(b('Your day, step by step', 'Votre journée, étape par étape'), b('Routine = present tense + time markers: **le matin, d’habitude, ensuite, vers midi, le soir, en général**. Reflexive verbs: je me lève, je me prépare, je me couche.', 'Routine = présent + indicateurs de temps : **le matin, d’habitude, ensuite, vers midi, le soir, en général**. Verbes pronominaux : je me lève, je me prépare, je me couche.'), {
        examples: [
          { fr: 'D’habitude, je me lève à six heures et demie.', tr: 'I usually get up at half past six.' },
          { fr: 'Le soir, je cuisine et je joue avec mes enfants.', tr: 'In the evening I cook and play with my children.' },
          { fr: 'L’été dernier, je suis allé au Sénégal pour voir ma famille.', tr: 'Last summer I went to Senegal to see my family.' },
        ],
      }),
      { kind: 'speak', prompt: b('Say it aloud.', 'Dites-le à voix haute.'), text: 'D’habitude, je me lève à six heures et demie.', tr: 'I usually get up at half past six.' },
      pick('A2', b('Choose the right auxiliary.', 'Choisissez le bon auxiliaire.'), ['suis', 'ai', 'es', 'avons'], { fr: 'L’été dernier, je ___ allé au Sénégal.', explain: b('Aller takes être in the passé composé.', 'Aller se conjugue avec être au passé composé.') }),
      pick('A2', b('Which answer is the most developed?', 'Quelle réponse est la plus développée ?'), ['J’habite dans un petit appartement près du métro. C’est pratique parce que je travaille au centre-ville, mais c’est un peu bruyant.', 'Un appartement.', 'J’habite appartement petit.', 'Oui, j’habite.']),
      pick('A2', b('Choose the right word.', 'Choisissez le bon mot.'), ['me', 'se', 'te', 'm’en'], { fr: 'Le dimanche, je ___ repose.' }),
      pick('A2', b('The examiner asks: “Qu’est-ce que vous avez fait le week-end dernier ?” Which tense?', 'L’examinateur demande : « Qu’est-ce que vous avez fait le week-end dernier ? » Quel temps ?'), ['Le passé composé', 'Le présent', 'Le futur', 'L’impératif']),
      { kind: 'order', prompt: b('Build the sentence.', 'Construisez la phrase.'), words: ['Samedi', 'dernier,', 'nous', 'avons', 'visité', 'le', 'Vieux-Québec.'], tr: 'Last Saturday we visited Old Quebec.' },
      { kind: 'speak', prompt: b('Answer aloud with a reason.', 'Répondez à voix haute avec une raison.'), text: 'J’aime mon quartier parce qu’il est calme et qu’il y a beaucoup de parcs.', tr: 'I like my neighbourhood because it is quiet and has lots of parks.' },
      { kind: 'speak', prompt: b('Say it aloud.', 'Dites-le à voix haute.'), text: 'L’été dernier, je suis allé au Sénégal pour voir ma famille.', tr: 'Last summer I went to Senegal to see my family.' },
    ],
    notes: {
      points: [
        b('Task 1: 2 minutes, no preparation; aim for three sentences per answer.', 'Tâche 1 : 2 minutes, sans préparation ; visez trois phrases par réponse.'),
        b('Routine: present + d’habitude, le matin, ensuite, le soir; je me lève, je me couche.', 'Routine : présent + d’habitude, le matin, ensuite, le soir ; je me lève, je me couche.'),
        b('Past: passé composé; aller, venir, partir, arriver, rester take **être**.', 'Passé : passé composé ; aller, venir, partir, arriver, rester se conjuguent avec **être**.'),
        b('Develop: answer + detail + **parce que / mais**.', 'Développez : réponse + détail + **parce que / mais**.'),
      ],
      vocab: [['d’habitude', b('usually', 'en général')], ['bruyant', b('noisy', 'qui fait du bruit')], ['se reposer', b('to rest', 'ne rien faire')], ['le quartier', b('neighbourhood', 'partie de la ville')], ['pratique', b('convenient', 'commode')]],
    },
  },

  // ── B1 ──
  {
    id: 'tcf-speaking-3',
    level: 'B1',
    slug: { en: 'b1-role-play-ask-questions', fr: 'b1-jeu-de-role-poser-des-questions' },
    title: b('B1 · Role-play: ask the right questions', 'B1 · Jeu de rôle : poser les bonnes questions'),
    summary: b('Prepare task 2: you get information from the examiner by asking varied, polite and relevant questions.', 'Préparer la tâche 2 : obtenir des informations de l’examinateur en posant des questions variées, polies et pertinentes.'),
    objectives: [b('Use three ways of asking a question', 'Employer trois façons de poser une question'), b('Be polite with the conditional', 'Être poli avec le conditionnel'), b('Cover all the useful topics of a situation', 'Couvrir tous les sujets utiles d’une situation')],
    minutes: 15,
    steps: [
      card(b('Task 2: you lead the conversation', 'La tâche 2 : c’est vous qui menez'), b('Task 2 lasts **5 min 30** (with 2 minutes of preparation). A situation card: you want to rent a room, join a sports club, organise a trip… The examiner plays the other person. **You ask the questions**: aim for 8 to 10, on different topics (price, schedule, conditions, place…).', 'La tâche 2 dure **5 min 30** (dont 2 minutes de préparation). Une situation : vous voulez louer une chambre, vous inscrire à un club, organiser un voyage… L’examinateur joue l’autre personne. **C’est vous qui posez les questions** : visez 8 à 10 questions sur des sujets différents (prix, horaires, conditions, lieu…).'), { variant: 'exam' }),
      card(b('Three ways to ask', 'Trois façons de demander'), b('**Intonation** (oral, familiar): Vous êtes libre ? **Est-ce que** (neutral): Est-ce que le prix comprend l’électricité ? **Inversion** (formal): Proposez-vous des cours le soir ? Polite openers: **Pourriez-vous me dire… ? J’aimerais savoir si…**', '**Intonation** (oral, familier) : Vous êtes libre ? **Est-ce que** (neutre) : Est-ce que le prix comprend l’électricité ? **Inversion** (soutenu) : Proposez-vous des cours le soir ? Formules polies : **Pourriez-vous me dire… ? J’aimerais savoir si…**'), {
        examples: [
          { fr: 'Est-ce que le loyer comprend le chauffage ?', tr: 'Does the rent include heating?' },
          { fr: 'Pourriez-vous me dire à quelle heure commencent les cours ?', tr: 'Could you tell me what time the classes start?' },
          { fr: 'J’aimerais savoir s’il y a une réduction pour les étudiants.', tr: 'I would like to know if there is a student discount.' },
        ],
      }),
      { kind: 'speak', prompt: b('Ask the question aloud.', 'Posez la question à voix haute.'), text: 'Pourriez-vous me dire à quelle heure commencent les cours ?', tr: 'Could you tell me what time the classes start?' },
      pick('B1', b('Which question is correct and polite?', 'Quelle question est correcte et polie ?'), ['Pourriez-vous m’indiquer le prix de l’inscription ?', 'C’est combien l’inscription toi ?', 'Pourriez-vous me dire combien coûte-t-il ?', 'Combien est-ce que coûte-t-il ?'], { explain: b('In an indirect question (“me dire combien…”), no inversion: combien il coûte.', 'Dans une question indirecte (« me dire combien… »), pas d’inversion : combien il coûte.') }),
      pick('B1', b('Choose the right word.', 'Choisissez le bon mot.'), ['si', 'est-ce que', 'que', 'qu’est-ce que'], { fr: 'J’aimerais savoir ___ les animaux sont acceptés.' }),
      pick('B1', b('You want to join a gym. Which question is NOT useful?', 'Vous voulez vous inscrire à une salle de sport. Quelle question n’est PAS utile ?'), ['Quelle est votre couleur préférée ?', 'Quels sont les horaires d’ouverture ?', 'Est-ce qu’il y a des cours collectifs ?', 'Faut-il s’engager pour un an ?']),
      pick('B1', b('Which is the correct inversion?', 'Quelle est l’inversion correcte ?'), ['Acceptez-vous les paiements par carte ?', 'Vous acceptez-vous les paiements par carte ?', 'Accepte-vous les paiements par carte ?', 'Est-ce acceptez-vous les paiements ?']),
      { kind: 'dialogue', title: b('Renting a room', 'Louer une chambre'), scene: b('You call about a room for rent. Choose your best questions.', 'Vous appelez pour une chambre à louer. Choisissez vos meilleures questions.'), speakers: [{ name: 'Propriétaire', voice: 'm2', side: 'l' }, { name: 'Vous', voice: 'f', side: 'r' }], lines: [
        { s: 0, fr: 'Bonjour, oui, la chambre est toujours disponible.', tr: 'Hello, yes, the room is still available.' },
        { s: 1, choose: { options: ['Très bien ! Pourriez-vous me dire quel est le montant du loyer ?', 'Combien ?', 'Je veux la chambre.'], answer: 0 } },
        { s: 0, fr: 'C’est sept cents dollars par mois.', tr: 'It’s seven hundred dollars a month.' },
        { s: 1, choose: { options: ['Est-ce que l’électricité et internet sont compris ?', 'Ah.', 'C’est cher, au revoir.'], answer: 0 } },
        { s: 0, fr: 'Oui, tout est compris. Vous voulez la visiter ?', tr: 'Yes, everything is included. Would you like to see it?' },
        { s: 1, choose: { options: ['Avec plaisir. Seriez-vous disponible samedi matin ?', 'Oui.', 'Peut-être, je ne sais pas.'], answer: 0 } },
      ] },
      { kind: 'speak', prompt: b('Ask the question aloud.', 'Posez la question à voix haute.'), text: 'J’aimerais savoir s’il y a une réduction pour les étudiants.', tr: 'I would like to know if there is a student discount.' },
    ],
    notes: {
      points: [
        b('Task 2: 5 min 30 (2 min preparation). You ask 8–10 questions on different topics.', 'Tâche 2 : 5 min 30 (2 min de préparation). Vous posez 8 à 10 questions sur des sujets différents.'),
        b('Three forms: intonation, est-ce que, inversion. Vary them.', 'Trois formes : intonation, est-ce que, inversion. Variez-les.'),
        b('Polite: **Pourriez-vous me dire… ? J’aimerais savoir si…**', 'Politesse : **Pourriez-vous me dire… ? J’aimerais savoir si…**'),
        b('Indirect question: no inversion (« me dire combien il coûte »).', 'Question indirecte : pas d’inversion (« me dire combien il coûte »).'),
      ],
      vocab: [['l’inscription (f.)', b('registration', 'fait de s’inscrire')], ['compris', b('included', 'inclus')], ['s’engager', b('to commit', 'promettre de rester')], ['le montant', b('the amount', 'la somme')], ['disponible', b('available', 'libre')]],
    },
  },

  // ── B2 ──
  {
    id: 'tcf-speaking-4',
    level: 'B2',
    slug: { en: 'b2-give-and-justify-an-opinion', fr: 'b2-donner-et-justifier-une-opinion' },
    title: b('B2 · Give and justify an opinion', 'B2 · Donner et justifier une opinion'),
    summary: b('Prepare task 3: answer a question of society with a clear plan, arguments and examples.', 'Préparer la tâche 3 : répondre à une question de société avec un plan clair, des arguments et des exemples.'),
    objectives: [b('Organise a spoken answer in three moves', 'Organiser une réponse orale en trois temps'), b('Present arguments with oral connectors', 'Présenter des arguments avec des connecteurs oraux'), b('Illustrate with a concrete example', 'Illustrer avec un exemple concret')],
    minutes: 15,
    steps: [
      card(b('Task 3: your point of view', 'La tâche 3 : votre point de vue'), b('Task 3 lasts **4 min 30**, without preparation. The examiner reads a question (“Faut-il interdire les voitures en centre-ville ?”). You give **your opinion**, argue, and discuss with the examiner. A clear plan matters more than complex vocabulary.', 'La tâche 3 dure **4 min 30**, sans préparation. L’examinateur lit une question (« Faut-il interdire les voitures en centre-ville ? »). Vous donnez **votre opinion**, vous argumentez et vous discutez avec l’examinateur. Un plan clair compte plus qu’un vocabulaire compliqué.'), { variant: 'exam' }),
      card(b('The three-move answer', 'La réponse en trois temps'), b('**1. Position**: À mon avis / Personnellement, je pense que… **2. Arguments + example**: D’abord… Ensuite… Par exemple, dans ma ville… **3. Conclusion**: Donc, pour moi… / C’est pour ça que…', '**1. Position** : À mon avis / Personnellement, je pense que… **2. Arguments + exemple** : D’abord… Ensuite… Par exemple, dans ma ville… **3. Conclusion** : Donc, pour moi… / C’est pour ça que…'), {
        examples: [
          { fr: 'Personnellement, je pense qu’il faut limiter les voitures en centre-ville.', tr: 'Personally, I think cars should be limited in city centres.' },
          { fr: 'D’abord, ça réduit la pollution. Ensuite, les rues deviennent plus agréables.', tr: 'First, it reduces pollution. Then, the streets become more pleasant.' },
          { fr: 'Par exemple, à Montréal, l’été, certaines rues sont réservées aux piétons.', tr: 'For example, in Montreal, in summer, some streets are pedestrian-only.' },
        ],
      }),
      { kind: 'speak', prompt: b('Say it aloud.', 'Dites-le à voix haute.'), text: 'Personnellement, je pense qu’il faut limiter les voitures en centre-ville.', tr: 'Personally, I think cars should be limited in city centres.' },
      pick('B2', b('Which opening states a clear position?', 'Quelle ouverture annonce une position claire ?'), ['À mon avis, c’est une bonne idée, pour deux raisons principales.', 'Euh… c’est une question.', 'Je ne sais pas trop, ça dépend.', 'Oui.']),
      pick('B2', b('Choose the right form.', 'Choisissez la bonne forme.'), ['soit', 'est', 'sera', 'serait'], { fr: 'Je ne pense pas que ce ___ la meilleure solution.', explain: b('Je ne pense pas que + subjunctive.', 'Je ne pense pas que + subjonctif.') }),
      pick('B2', b('Which sentence gives a concrete example?', 'Quelle phrase donne un exemple concret ?'), ['Par exemple, dans mon quartier, la piste cyclable a réduit les accidents.', 'Les exemples sont nombreux.', 'C’est un exemple important.', 'Prenons des exemples en général.']),
      pick('B2', b('The examiner objects: “Mais les commerçants vont perdre des clients !” Best reaction:', 'L’examinateur objecte : « Mais les commerçants vont perdre des clients ! » Meilleure réaction :'), ['C’est vrai que c’est un risque, mais l’expérience montre souvent l’inverse : les piétons achètent davantage.', 'Non.', 'Ce n’est pas mon problème.', 'Je ne suis pas d’accord, c’est tout.']),
      { kind: 'order', prompt: b('Build the argument.', 'Construisez l’argument.'), words: ['C’est', 'pour', 'ça', 'que', 'je', 'suis', 'favorable', 'à', 'cette', 'mesure.'], tr: 'That is why I am in favour of this measure.' },
      { kind: 'speak', prompt: b('Say it aloud.', 'Dites-le à voix haute.'), text: 'D’abord, ça réduit la pollution. Ensuite, les rues deviennent plus agréables.', tr: 'First, it reduces pollution. Then, the streets become more pleasant.' },
      { kind: 'speak', prompt: b('React to an objection aloud.', 'Réagissez à une objection à voix haute.'), text: 'C’est vrai que c’est un risque, mais je reste convaincu que c’est la bonne décision.', tr: 'It is true that it is a risk, but I remain convinced it is the right decision.' },
    ],
    notes: {
      points: [
        b('Task 3: 4 min 30, no preparation; opinion + discussion with the examiner.', 'Tâche 3 : 4 min 30, sans préparation ; opinion + discussion avec l’examinateur.'),
        b('Plan: position → 2 arguments + example → conclusion.', 'Plan : position → 2 arguments + exemple → conclusion.'),
        b('Opinion: à mon avis, je pense que (+ indicative); je ne pense pas que (+ subjunctive).', 'Opinion : à mon avis, je pense que (+ indicatif) ; je ne pense pas que (+ subjonctif).'),
        b('Objection: **C’est vrai que…, mais…** then a new argument.', 'Objection : **C’est vrai que…, mais…** puis un nouvel argument.'),
      ],
      vocab: [['favorable à', b('in favour of', 'pour')], ['le piéton', b('pedestrian', 'personne à pied')], ['convaincu', b('convinced', 'sûr de son idée')], ['réduire', b('to reduce', 'diminuer')], ['davantage', b('more', 'plus')]],
    },
  },

  // ── C1 ──
  {
    id: 'tcf-speaking-5',
    level: 'C1',
    slug: { en: 'c1-nuance-concede-handle-objections', fr: 'c1-nuancer-conceder-repondre-aux-objections' },
    title: b('C1 · Nuance, concede and handle objections', 'C1 · Nuancer, concéder et répondre aux objections'),
    summary: b('Speak like a C1 user: qualify your opinion, admit the other side, reformulate and keep control of the discussion.', 'Parler comme un utilisateur C1 : nuancer votre opinion, reconnaître l’autre point de vue, reformuler et garder le contrôle de la discussion.'),
    objectives: [b('Qualify an opinion: it depends, to some extent', 'Nuancer une opinion : ça dépend, dans une certaine mesure'), b('Concede and counter-argue', 'Concéder et contre-argumenter'), b('Gain time and reformulate naturally', 'Gagner du temps et reformuler naturellement')],
    minutes: 15,
    steps: [
      card(b('Nuance is the C1 signal', 'La nuance, signal du C1'), b('A C1 speaker rarely says “c’est bien / c’est mal”. They qualify: **dans une certaine mesure**, **tout dépend de**, **à condition que** (+ subj.), **dans la plupart des cas**, **je serais plutôt favorable à**.', 'Un locuteur C1 dit rarement « c’est bien / c’est mal ». Il nuance : **dans une certaine mesure**, **tout dépend de**, **à condition que** (+ subj.), **dans la plupart des cas**, **je serais plutôt favorable à**.'), {
        examples: [
          { fr: 'Je serais plutôt favorable à cette idée, à condition qu’elle soit bien encadrée.', tr: 'I would be rather in favour of the idea, provided it is well regulated.' },
          { fr: 'Dans une certaine mesure, je comprends cet argument.', tr: 'To some extent, I understand that argument.' },
          { fr: 'Si je comprends bien, vous voulez dire que le coût est trop élevé ?', tr: 'If I understand correctly, you mean the cost is too high?' },
        ],
      }),
      { kind: 'speak', prompt: b('Say it aloud.', 'Dites-le à voix haute.'), text: 'Je serais plutôt favorable à cette idée, à condition qu’elle soit bien encadrée.', tr: 'I would be rather in favour of the idea, provided it is well regulated.' },
      pick('C1', b('Which reply concedes and counter-argues?', 'Quelle réplique concède puis contre-argumente ?'), ['Je vous accorde que le coût est élevé ; il n’empêche que les bénéfices à long terme sont considérables.', 'Vous avez tort.', 'Oui, vous avez raison, j’ai changé d’avis.', 'Le coût, je ne sais pas.']),
      pick('C1', b('Choose the right form.', 'Choisissez la bonne forme.'), ['soit', 'est', 'sera', 'serait'], { fr: 'J’accepterais cette réforme à condition qu’elle ___ temporaire.' }),
      pick('C1', b('You need a few seconds to think. Which phrase sounds natural?', 'Vous avez besoin de quelques secondes pour réfléchir. Quelle formule sonne naturelle ?'), ['C’est une question délicate… Laissez-moi y réfléchir un instant.', 'Euh… euh… euh…', 'Je ne réponds pas.', 'Question suivante.']),
      pick('C1', b('Which phrase reformulates the examiner’s idea?', 'Quelle formule reformule l’idée de l’examinateur ?'), ['Si je vous suis bien, vous estimez que la mesure serait injuste ?', 'Répétez.', 'Quoi ?', 'Je n’ai pas compris votre question, c’est trop difficile.']),
      { kind: 'match', prompt: b('Match each phrase with its function.', 'Associez chaque formule à sa fonction.'), pairs: [['Je vous accorde que…', b('concede', 'concéder')], ['Il n’empêche que…', b('counter-argue', 'contre-argumenter')], ['Tout dépend de…', b('qualify', 'nuancer')], ['Si je vous suis bien…', b('reformulate', 'reformuler')], ['Laissez-moi y réfléchir.', b('gain time', 'gagner du temps')]] },
      { kind: 'dialogue', title: b('An objection in task 3', 'Une objection en tâche 3'), scene: b('Topic: should university be free? Choose your best reply.', 'Sujet : l’université doit-elle être gratuite ? Choisissez votre meilleure réplique.'), speakers: [{ name: 'Examinateur', voice: 'm2', side: 'l' }, { name: 'Vous', voice: 'f', side: 'r' }], lines: [
        { s: 0, fr: 'Mais si l’université est gratuite, qui va payer ? Les contribuables ?', tr: 'But if university is free, who will pay? Taxpayers?' },
        { s: 1, choose: { options: ['Je vous accorde que cela a un coût pour la collectivité. Il n’empêche qu’un pays qui forme bien ses jeunes y gagne à long terme.', 'Les contribuables, oui, c’est comme ça.', 'Je ne sais pas qui va payer.'], answer: 0 } },
        { s: 0, fr: 'Donc vous seriez pour une gratuité totale ?', tr: 'So you would be in favour of it being completely free?' },
        { s: 1, choose: { options: ['Pas forcément totale : tout dépend des revenus des familles. On pourrait imaginer des frais proportionnels.', 'Oui, totale, pour tout le monde, toujours.', 'Non.'], answer: 0, explain: b('The C1 answer qualifies and proposes a solution.', 'La réponse C1 nuance et propose une solution.') } },
      ] },
      { kind: 'speak', prompt: b('Say it aloud.', 'Dites-le à voix haute.'), text: 'Je vous accorde que cela a un coût. Il n’empêche que les bénéfices sont considérables.', tr: 'I grant you that it has a cost. Nevertheless, the benefits are considerable.' },
    ],
    notes: {
      points: [
        b('Qualify: dans une certaine mesure, tout dépend de, à condition que (+ subjunctive), plutôt.', 'Nuancer : dans une certaine mesure, tout dépend de, à condition que (+ subjonctif), plutôt.'),
        b('Concede + counter: **Je vous accorde que… Il n’empêche que…**', 'Concéder + contrer : **Je vous accorde que… Il n’empêche que…**'),
        b('Reformulate: **Si je vous suis bien… / Si je comprends bien, vous voulez dire que…**', 'Reformuler : **Si je vous suis bien… / Si je comprends bien, vous voulez dire que…**'),
        b('Gain time elegantly: **C’est une question délicate… Laissez-moi y réfléchir.**', 'Gagner du temps avec élégance : **C’est une question délicate… Laissez-moi y réfléchir.**'),
      ],
      vocab: [['encadré', b('regulated', 'contrôlé, organisé')], ['le contribuable', b('taxpayer', 'personne qui paie des impôts')], ['la collectivité', b('the community, the public', 'l’ensemble des citoyens')], ['il n’empêche que', b('nevertheless', 'malgré tout')], ['proportionnel', b('proportional', 'qui varie selon')]],
    },
  },

  // ► C2
  {
    id: 'tcf-speaking-6',
    level: 'C2',
    slug: { en: 'c2-fluency-idioms-persuasion', fr: 'c2-aisance-expressions-persuasion' },
    title: b('C2 · Fluency, idioms and persuasion', 'C2 · Aisance, expressions et persuasion'),
    summary: b('Speak with ease and precision: idiomatic expressions, rhetorical devices, and the natural rhythm of French.', 'Parler avec aisance et précision : expressions idiomatiques, procédés rhétoriques et rythme naturel du français.'),
    objectives: [b('Use idiomatic expressions accurately', 'Employer des expressions idiomatiques à bon escient'), b('Persuade with rhetorical devices', 'Persuader avec des procédés rhétoriques'), b('Adapt your register to the situation', 'Adapter votre registre à la situation')],
    minutes: 16,
    steps: [
      card(b('Idioms, used sparingly', 'Des expressions, avec mesure'), b('One well-placed idiom shows mastery; five sound memorised. Learn a few that fit a debate: **mettre le doigt sur** (to put one’s finger on), **à double tranchant** (double-edged), **ce n’est pas la panacée** (not a cure-all), **jeter le bébé avec l’eau du bain** (throw the baby out with the bathwater).', 'Une expression bien placée montre la maîtrise ; cinq sonnent appris par cœur. Retenez celles qui servent dans un débat : **mettre le doigt sur**, **à double tranchant**, **ce n’est pas la panacée**, **jeter le bébé avec l’eau du bain**.'), {
        examples: [
          { fr: 'Vous mettez le doigt sur le vrai problème.', tr: 'You have put your finger on the real problem.' },
          { fr: 'Les réseaux sociaux sont une arme à double tranchant.', tr: 'Social media are a double-edged sword.' },
          { fr: 'Supprimer le programme, ce serait jeter le bébé avec l’eau du bain.', tr: 'Scrapping the programme would be throwing the baby out with the bathwater.' },
        ],
      }),
      { kind: 'match', prompt: b('Match each idiom with its meaning.', 'Associez chaque expression à son sens.'), pairs: [['à double tranchant', b('with good and bad effects', 'avec des effets positifs et négatifs')], ['ce n’est pas la panacée', b('it does not solve everything', 'cela ne résout pas tout')], ['mettre le doigt sur', b('to identify precisely', 'identifier précisément')], ['enfoncer une porte ouverte', b('to state the obvious', 'dire une évidence')], ['avoir le dernier mot', b('to win the argument', 'l’emporter dans la discussion')]] },
      card(b('Rhetoric that persuades', 'La rhétorique qui persuade'), b('Three devices work well orally: the **rhetorical question** (“Qui peut sérieusement croire que… ?”), the **rule of three** (“plus juste, plus efficace, plus durable”), and **anticipating the objection** (“On me dira que… Je répondrai que…”).', 'Trois procédés fonctionnent bien à l’oral : la **question rhétorique** (« Qui peut sérieusement croire que… ? »), le **rythme ternaire** (« plus juste, plus efficace, plus durable »), et l’**anticipation de l’objection** (« On me dira que… Je répondrai que… »).'), { variant: 'tip' }),
      pick('C2', b('Which sentence anticipates an objection?', 'Quelle phrase anticipe une objection ?'), ['On me dira que cette mesure coûte cher ; je répondrai que l’inaction coûte bien davantage.', 'Cette mesure coûte cher.', 'Je pense que c’est cher.', 'Le coût, on verra plus tard.']),
      pick('C2', b('Which idiom fits?', 'Quelle expression convient ?'), ['enfoncer une porte ouverte', 'avoir le dernier mot', 'mettre le doigt sur', 'jeter l’éponge'], { fr: 'Dire que l’éducation est importante, c’est ___ : la vraie question est comment la financer.' }),
      pick('C2', b('Which sentence uses the rule of three?', 'Quelle phrase utilise le rythme ternaire ?'), ['Cette réforme serait plus juste, plus efficace et plus durable.', 'Cette réforme serait bien.', 'Cette réforme, je l’aime beaucoup beaucoup.', 'Elle est juste, la réforme.']),
      pick('C2', b('In a formal debate, which register fits?', 'Dans un débat formel, quel registre convient ?'), ['Permettez-moi de nuancer votre propos.', 'Attends, t’as tort là.', 'Ouais mais non.', 'Bof, pas d’accord.']),
      { kind: 'speak', prompt: b('Say it with conviction.', 'Dites-le avec conviction.'), text: 'On me dira que cette mesure coûte cher ; je répondrai que l’inaction coûte bien davantage.', tr: 'People will say this measure is expensive; I will answer that doing nothing costs far more.', tip: b('Pause after “cher”; stress “l’inaction” and “bien davantage”.', 'Marquez une pause après « cher » ; accentuez « l’inaction » et « bien davantage ».') },
      { kind: 'speak', prompt: b('Say it aloud.', 'Dites-le à voix haute.'), text: 'Les réseaux sociaux sont une arme à double tranchant.', tr: 'Social media are a double-edged sword.' },
      { kind: 'speak', prompt: b('Say it aloud.', 'Dites-le à voix haute.'), text: 'Permettez-moi de nuancer votre propos.', tr: 'Allow me to qualify what you said.' },
    ],
    notes: {
      points: [
        b('One well-placed idiom > five memorised ones. Debate idioms: à double tranchant, pas la panacée, mettre le doigt sur.', 'Une expression bien placée > cinq apprises par cœur. Pour débattre : à double tranchant, pas la panacée, mettre le doigt sur.'),
        b('Rhetoric: rhetorical question, rule of three, anticipating the objection (On me dira que… Je répondrai que…).', 'Rhétorique : question rhétorique, rythme ternaire, anticipation de l’objection (On me dira que… Je répondrai que…).'),
        b('Formal debate register: **Permettez-moi de nuancer votre propos.**', 'Registre du débat formel : **Permettez-moi de nuancer votre propos.**'),
        b('C2 fluency = pauses at the right place, not speed.', 'L’aisance C2 = des pauses au bon endroit, pas la vitesse.'),
      ],
      vocab: [['la panacée', b('cure-all', 'remède universel')], ['l’inaction (f.)', b('inaction', 'le fait de ne rien faire')], ['le propos', b('what someone said', 'les paroles')], ['enfoncer une porte ouverte', b('to state the obvious', 'dire une évidence')], ['à bon escient', b('appropriately', 'avec raison')]],
    },
  },
];

export default lessons;
