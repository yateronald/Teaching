// The free courses: what lists, course pages, search engines and the sitemap
// need to know about each one. The lessons themselves live in content/courses/
// and are downloaded only when a course is opened.
import { CATEGORIES, categoryPath } from './categories';
import { b, type CategoryId, type CourseMeta, type Lang } from './types';

const c = (m: Omit<CourseMeta, 'image' | 'lessonCount'> & { lessonCount?: number }): CourseMeta => ({ lessonCount: 3, image: `course-${m.id}`, ...m });

export const COURSES: CourseMeta[] = [
  // ── Beginner ──────────────────────────────────────────────────────────────
  c({
    id: 'first-steps', category: 'beginner', level: 'A1', levels: ['A1'], minutes: 39, popular: true,
    slug: { en: 'first-steps-in-french', fr: 'premiers-pas-en-francais' },
    title: b('First Steps in French', 'Premiers pas en français'),
    subtitle: b('Greet people, introduce yourself and ask simple questions.', 'Saluer, vous présenter et poser des questions simples.'),
    description: b(
      'Your very first French course. In three interactive lessons you learn to say hello and goodbye in the right register (tu or vous), to introduce yourself with your name, nationality and job, and to ask and answer the questions every first conversation contains. You hear every phrase spoken by native voices and practise saying it aloud.',
      'Votre tout premier cours de français. En trois leçons interactives, vous apprenez à dire bonjour et au revoir dans le bon registre (tu ou vous), à vous présenter avec votre nom, votre nationalité et votre métier, et à poser et répondre aux questions de toute première conversation. Chaque phrase est prononcée par des voix natives et vous la répétez à voix haute.',
    ),
    outcomes: [
      b('Greet and say goodbye, formally and informally', 'Saluer et prendre congé, de façon formelle et informelle'),
      b('Introduce yourself: name, origin, job, languages', 'Vous présenter : nom, origine, métier, langues'),
      b('Use the verb être and the pronouns je, tu, vous', 'Utiliser le verbe être et les pronoms je, tu, vous'),
      b('Ask and answer “How are you?”, “Where are you from?”', 'Poser et répondre à « Comment ça va ? », « D’où venez-vous ? »'),
    ],
  }),
  c({
    id: 'numbers-time', category: 'beginner', level: 'A1', levels: ['A1'], minutes: 39,
    slug: { en: 'french-numbers-time-dates', fr: 'nombres-heure-dates' },
    title: b('Numbers, Time & Dates', 'Nombres, heure et dates'),
    subtitle: b('Count, tell the time, give a date and understand prices.', 'Compter, dire l’heure, donner une date et comprendre les prix.'),
    description: b(
      'Numbers are everywhere: phone numbers, prices, appointments, birthdays. This course takes you from 0 to 100 (including the famous soixante-dix and quatre-vingts), then teaches you to tell the time the French way and to read days, months and dates. Listening exercises train you to catch numbers spoken at natural speed.',
      'Les nombres sont partout : numéros de téléphone, prix, rendez-vous, anniversaires. Ce cours vous emmène de 0 à 100 (avec les fameux soixante-dix et quatre-vingts), puis vous apprend à dire l’heure à la française et à lire les jours, les mois et les dates. Les exercices d’écoute vous entraînent à saisir les nombres prononcés à vitesse naturelle.',
    ),
    outcomes: [
      b('Count from 0 to 100 and understand prices', 'Compter de 0 à 100 et comprendre les prix'),
      b('Tell and ask the time, in everyday and official style', 'Dire et demander l’heure, à l’oral courant et officiel'),
      b('Say the days, the months and a full date', 'Dire les jours, les mois et une date complète'),
      b('Catch numbers in a phone message', 'Comprendre des nombres dans un message téléphonique'),
    ],
  }),
  c({
    id: 'everyday-life', category: 'beginner', level: 'A1', levels: ['A1'], minutes: 40,
    slug: { en: 'everyday-life-family-home-routine', fr: 'vie-quotidienne-famille-maison-routine' },
    title: b('Everyday Life: Family, Home & Routine', 'La vie quotidienne : famille, maison, routine'),
    subtitle: b('Talk about your family, your home and your day.', 'Parler de votre famille, de votre logement et de votre journée.'),
    description: b(
      'Describe the people and places of your daily life. You learn family vocabulary with the possessives (mon, ma, mes), explore an illustrated apartment room by room, and tell your daily routine with reflexive verbs like se lever and se coucher.',
      'Décrivez les personnes et les lieux de votre quotidien. Vous apprenez le vocabulaire de la famille avec les possessifs (mon, ma, mes), explorez un appartement illustré pièce par pièce et racontez votre routine avec les verbes pronominaux comme se lever et se coucher.',
    ),
    outcomes: [
      b('Present your family with mon, ma, mes', 'Présenter votre famille avec mon, ma, mes'),
      b('Describe your home and say what there is (il y a)', 'Décrire votre logement et dire ce qu’il y a (il y a)'),
      b('Tell your daily routine with reflexive verbs', 'Raconter votre routine avec les verbes pronominaux'),
    ],
  }),
  c({
    id: 'travel-french', category: 'beginner', level: 'A2', levels: ['A2'], minutes: 41, popular: true,
    slug: { en: 'french-for-travel', fr: 'francais-du-voyage' },
    title: b('French for Travel', 'Le français du voyage'),
    subtitle: b('Order at the café, find your way and check in at the hotel.', 'Commander au café, trouver votre chemin et arriver à l’hôtel.'),
    description: b(
      'Everything you need for a trip to France, Québec or any French-speaking country. Order politely with je voudrais, ask for directions and understand the answer, take public transport and solve a problem at the hotel. Animated dialogues let you choose your replies like in a real conversation.',
      'Tout ce qu’il faut pour un voyage en France, au Québec ou dans tout pays francophone. Commander poliment avec je voudrais, demander votre chemin et comprendre la réponse, prendre les transports et régler un problème à l’hôtel. Des dialogues animés vous font choisir vos répliques comme dans une vraie conversation.',
    ),
    outcomes: [
      b('Order food and drinks politely', 'Commander à manger et à boire poliment'),
      b('Ask for and understand directions', 'Demander et comprendre un itinéraire'),
      b('Buy a ticket and take public transport', 'Acheter un billet et prendre les transports'),
      b('Check in at a hotel and report a problem', 'Arriver à l’hôtel et signaler un problème'),
    ],
  }),

  c({
    id: 'alphabet-sounds', category: 'beginner', level: 'A1', levels: ['A1'], minutes: 37,
    slug: { en: 'french-alphabet-and-sounds', fr: 'alphabet-et-sons-du-francais' },
    title: b('The French Alphabet & Sounds', 'L’alphabet et les sons du français'),
    subtitle: b('Spell your name, hear the French vowels and link words like a native.', 'Épeler votre nom, entendre les voyelles françaises et enchaîner les mots comme un natif.'),
    description: b(
      'Understanding French starts with its sounds. Learn the alphabet the French way and spell your name and email, hear the vowels that do not exist in English (u, eu, the nasal sounds), and discover silent letters and liaisons, so that what you read finally matches what you hear.',
      'Comprendre le français commence par ses sons. Apprenez l’alphabet à la française et épelez votre nom et votre courriel, entendez les voyelles qui n’existent pas en anglais (u, eu, les nasales), et découvrez les lettres muettes et les liaisons, pour que ce que vous lisez corresponde enfin à ce que vous entendez.',
    ),
    outcomes: [b('Spell names and emails aloud', 'Épeler noms et courriels à voix haute'), b('Distinguish u / ou and the nasal sounds', 'Distinguer u / ou et les sons nasaux'), b('Know which final letters are silent', 'Savoir quelles lettres finales sont muettes'), b('Make the common liaisons', 'Faire les liaisons courantes')],
  }),
  c({
    id: 'colors-clothes', category: 'beginner', level: 'A1', levels: ['A1'], minutes: 38,
    slug: { en: 'colours-and-clothes', fr: 'couleurs-et-vetements' },
    title: b('Colours & Clothes', 'Couleurs et vêtements'),
    subtitle: b('Name colours and clothes, describe what you wear and buy clothes in a shop.', 'Nommer couleurs et vêtements, décrire ce que vous portez et acheter des vêtements en magasin.'),
    description: b(
      'Describe what you and others wear and shop for clothes with confidence. You learn the colours and how they agree, everyday clothes from the T-shirt to the tuque, the verbs porter and mettre, and the phrases to ask for a size, try something on and pay.',
      'Décrivez ce que vous et les autres portez et achetez des vêtements avec assurance. Vous apprenez les couleurs et leur accord, les vêtements du quotidien, du t-shirt à la tuque, les verbes porter et mettre, et les tournures pour demander une taille, essayer et payer.',
    ),
    outcomes: [b('Make colours agree with nouns', 'Accorder les couleurs avec les noms'), b('Name everyday clothes', 'Nommer les vêtements du quotidien'), b('Use porter and mettre', 'Employer porter et mettre'), b('Buy clothes in a shop', 'Acheter des vêtements en magasin')],
  }),
  c({
    id: 'food-shopping', category: 'beginner', level: 'A1', levels: ['A1'], minutes: 38, popular: true,
    slug: { en: 'food-and-grocery-shopping', fr: 'nourriture-et-courses' },
    title: b('Food & Grocery Shopping', 'Nourriture et courses'),
    subtitle: b('Food words, quantities and the phrases of the market and the grocery store.', 'Les mots de la nourriture, les quantités et les tournures du marché et de l’épicerie.'),
    description: b(
      'Eating is the first thing you do in French every day. Learn the names of food and drinks, the meals in France and in Québec, the partitives du / de la and the quantities (un kilo de, une bouteille de), then buy food at the market and the grocery store like a local.',
      'Manger est la première chose que vous faites en français chaque jour. Apprenez les noms des aliments et des boissons, les repas en France et au Québec, les partitifs du / de la et les quantités (un kilo de, une bouteille de), puis faites vos courses au marché et à l’épicerie comme un habitant.',
    ),
    outcomes: [b('Name common food and drinks', 'Nommer les aliments et boissons courants'), b('Use du, de la, des and quantities', 'Employer du, de la, des et les quantités'), b('Shop at the market and the grocery store', 'Faire ses courses au marché et à l’épicerie'), b('Know the meal names in France and Québec', 'Connaître le nom des repas en France et au Québec')],
  }),
  c({
    id: 'body-health', category: 'beginner', level: 'A1', levels: ['A1'], minutes: 38,
    slug: { en: 'the-body-and-health', fr: 'le-corps-et-la-sante' },
    title: b('The Body & Health', 'Le corps et la santé'),
    subtitle: b('Name the body, say where it hurts and get help at the doctor and the pharmacy.', 'Nommer le corps, dire où vous avez mal et vous faire aider chez le médecin et à la pharmacie.'),
    description: b(
      'When you are ill, you need simple, precise French. Learn the parts of the body, avoir mal à and the common symptoms, then make an appointment, understand the doctor’s instructions and ask the pharmacist for advice. Includes the emergency numbers in Canada and France.',
      'Quand on est malade, il faut un français simple et précis. Apprenez les parties du corps, avoir mal à et les symptômes courants, puis prenez rendez-vous, comprenez les consignes du médecin et demandez conseil au pharmacien. Avec les numéros d’urgence au Canada et en France.',
    ),
    outcomes: [b('Name the parts of the body', 'Nommer les parties du corps'), b('Say where it hurts and since when', 'Dire où vous avez mal et depuis quand'), b('Understand a doctor’s instructions', 'Comprendre les consignes d’un médecin'), b('Ask the pharmacist for help', 'Demander conseil au pharmacien')],
  }),
  c({
    id: 'weather-seasons', category: 'beginner', level: 'A1', levels: ['A1'], minutes: 38,
    slug: { en: 'weather-and-seasons', fr: 'meteo-et-saisons' },
    title: b('Weather & Seasons', 'Météo et saisons'),
    subtitle: b('Talk about the weather, the seasons and the forecast, from the heatwave to the snowstorm.', 'Parler du temps, des saisons et de la météo, de la canicule à la tempête de neige.'),
    description: b(
      'The weather is the favourite small talk of every French speaker, especially in Canada. Learn il fait, il y a, il pleut and il neige, the seasons and months with en and au, the activities of each season, and how to understand a simple weather forecast.',
      'La météo est le sujet de conversation préféré de tous les francophones, surtout au Canada. Apprenez il fait, il y a, il pleut et il neige, les saisons et les mois avec en et au, les activités de chaque saison, et comment comprendre un bulletin météo simple.',
    ),
    outcomes: [b('Describe the weather', 'Décrire le temps qu’il fait'), b('Name the seasons and months', 'Nommer les saisons et les mois'), b('Understand a weather forecast', 'Comprendre un bulletin météo'), b('Plan activities according to the weather', 'Prévoir des activités selon la météo')],
  }),
  c({
    id: 'town-transport', category: 'beginner', level: 'A1', levels: ['A1'], minutes: 38,
    slug: { en: 'in-town-places-and-transport', fr: 'en-ville-lieux-et-transports' },
    title: b('In Town: Places & Transport', 'En ville : lieux et transports'),
    subtitle: b('Name the places of a town, say where they are and take the bus or the metro.', 'Nommer les lieux d’une ville, dire où ils se trouvent et prendre l’autobus ou le métro.'),
    description: b(
      'Find your way around a French-speaking city. Learn the names of public places and services, the contractions au, à la, aux and chez, the prepositions of place (à côté de, en face de), and the vocabulary of public transport to buy a ticket and get off at the right station.',
      'Repérez-vous dans une ville francophone. Apprenez les noms des lieux publics et des services, les contractions au, à la, aux et chez, les prépositions de lieu (à côté de, en face de) et le vocabulaire des transports en commun pour acheter un titre et descendre à la bonne station.',
    ),
    outcomes: [b('Name places and services in town', 'Nommer les lieux et services de la ville'), b('Use au, à la, aux and chez', 'Employer au, à la, aux et chez'), b('Say where a place is', 'Dire où se trouve un lieu'), b('Take public transport', 'Prendre les transports en commun')],
  }),
  c({
    id: 'hobbies-likes', category: 'beginner', level: 'A1', levels: ['A1'], minutes: 38,
    slug: { en: 'likes-and-hobbies', fr: 'gouts-et-loisirs' },
    title: b('Likes & Hobbies', 'Goûts et loisirs'),
    subtitle: b('Say what you love and hate, talk about your hobbies and invite friends.', 'Dire ce que vous adorez et détestez, parler de vos loisirs et inviter des amis.'),
    description: b(
      'Make friends in French. Learn to express your likes on a scale from adorer to détester, talk about sports, music and hobbies with jouer à and faire de, say how often you do things, and invite, accept or refuse politely.',
      'Faites-vous des amis en français. Apprenez à exprimer vos goûts d’adorer à détester, à parler de sport, de musique et de loisirs avec jouer à et faire de, à dire à quelle fréquence vous faites les choses, et à inviter, accepter ou refuser poliment.',
    ),
    outcomes: [b('Express likes and dislikes', 'Exprimer vos goûts'), b('Use jouer à and faire de', 'Employer jouer à et faire de'), b('Say how often you do something', 'Dire à quelle fréquence vous faites quelque chose'), b('Invite, accept and refuse', 'Inviter, accepter et refuser')],
  }),
  c({
    id: 'jobs-work', category: 'beginner', level: 'A1 → A2', levels: ['A1', 'A2'], minutes: 38, popular: true,
    slug: { en: 'jobs-and-work', fr: 'metiers-et-travail' },
    title: b('Jobs & Work', 'Métiers et travail'),
    subtitle: b('Name jobs, talk about your work and take your first steps in a job search.', 'Nommer les métiers, parler de votre travail et faire vos premiers pas dans une recherche d’emploi.'),
    description: b(
      'Work is often the first reason to learn French in Canada. Learn the names of jobs in the masculine and feminine, describe your workplace, your tasks and your hours, then read a simple job ad and answer the first questions of an interview.',
      'Le travail est souvent la première raison d’apprendre le français au Canada. Apprenez les noms de métiers au masculin et au féminin, décrivez votre lieu de travail, vos tâches et vos horaires, puis lisez une offre d’emploi simple et répondez aux premières questions d’une entrevue.',
    ),
    outcomes: [b('Name jobs in the masculine and feminine', 'Nommer les métiers au masculin et au féminin'), b('Describe your work and hours', 'Décrire votre travail et vos horaires'), b('Understand a job ad', 'Comprendre une offre d’emploi'), b('Answer simple interview questions', 'Répondre à des questions d’entrevue simples')],
  }),
  c({
    id: 'asking-questions', category: 'beginner', level: 'A1', levels: ['A1'], minutes: 38,
    slug: { en: 'asking-questions-in-french', fr: 'poser-des-questions-en-francais' },
    title: b('Asking Questions', 'Poser des questions'),
    subtitle: b('Yes/no questions, question words and polite questions to strangers.', 'Questions fermées, mots interrogatifs et questions polies à des inconnus.'),
    description: b(
      'Asking questions is how you learn everything else. Master the three ways to ask a yes/no question, the answer si, the question words from où to pourquoi, quel and its agreement, and the polite formulas to ask strangers for help: excusez-moi, pourriez-vous, savez-vous.',
      'Poser des questions, c’est ce qui permet d’apprendre tout le reste. Maîtrisez les trois façons de poser une question fermée, la réponse si, les mots interrogatifs d’où à pourquoi, quel et son accord, et les formules polies pour demander de l’aide à des inconnus : excusez-moi, pourriez-vous, savez-vous.',
    ),
    outcomes: [b('Ask yes/no questions three ways', 'Poser une question fermée de trois façons'), b('Use question words correctly', 'Employer correctement les mots interrogatifs'), b('Answer “si” to a negative question', 'Répondre « si » à une question négative'), b('Ask strangers politely', 'Questionner poliment des inconnus')],
  }),
  c({
    id: 'feelings-personality', category: 'beginner', level: 'A2', levels: ['A2'], minutes: 38,
    slug: { en: 'feelings-and-personality', fr: 'sentiments-et-personnalite' },
    title: b('Feelings & Personality', 'Sentiments et personnalité'),
    subtitle: b('Say how you feel, describe someone’s character and paint a short portrait.', 'Dire comment vous vous sentez, décrire le caractère de quelqu’un et faire un court portrait.'),
    description: b(
      'Go beyond facts and talk about people. Learn to express emotions with être and avoir (je suis content, j’ai peur), describe personality with adjectives and their feminine forms, nuance with très, un peu, trop, and describe someone’s appearance in a short written portrait.',
      'Allez au-delà des faits et parlez des gens. Apprenez à exprimer vos émotions avec être et avoir (je suis content, j’ai peur), à décrire la personnalité avec des adjectifs et leur féminin, à nuancer avec très, un peu, trop, et à décrire l’apparence de quelqu’un dans un court portrait écrit.',
    ),
    outcomes: [b('Express feelings and emotions', 'Exprimer sentiments et émotions'), b('Describe personality with adjectives', 'Décrire la personnalité avec des adjectifs'), b('Form irregular feminines', 'Former les féminins irréguliers'), b('Write a short portrait', 'Écrire un court portrait')],
  }),
  c({
    id: 'appointments-services', category: 'beginner', level: 'A2', levels: ['A2'], minutes: 38,
    slug: { en: 'phone-appointments-and-services', fr: 'telephone-rendez-vous-et-services' },
    title: b('Phone, Appointments & Services', 'Téléphone, rendez-vous et services'),
    subtitle: b('Make phone calls, book appointments and deal with the bank and the post office.', 'Téléphoner, prendre rendez-vous et vous débrouiller à la banque et au bureau de poste.'),
    description: b(
      'The practical French of a new life. Learn the formulas of the phone (allô, c’est de la part de qui, ne quittez pas), how to make, move and cancel an appointment, and the vocabulary of the bank and the post office: open an account, withdraw money, send a parcel, provide the right documents.',
      'Le français pratique d’une nouvelle vie. Apprenez les formules du téléphone (allô, c’est de la part de qui, ne quittez pas), comment prendre, déplacer et annuler un rendez-vous, et le vocabulaire de la banque et de la poste : ouvrir un compte, retirer de l’argent, envoyer un colis, fournir les bons documents.',
    ),
    outcomes: [b('Make and answer phone calls', 'Passer et répondre à des appels'), b('Book, move and cancel appointments', 'Prendre, déplacer et annuler un rendez-vous'), b('Handle basic banking', 'Faire des démarches bancaires simples'), b('Send letters and parcels', 'Envoyer lettres et colis')],
  }),

  // ── Grammar ───────────────────────────────────────────────────────────────
  c({
    id: 'articles-gender', category: 'grammar', level: 'A1', levels: ['A1'], minutes: 40,
    slug: { en: 'french-articles-and-gender', fr: 'articles-et-genre' },
    title: b('Articles & Gender', 'Articles et genre des noms'),
    subtitle: b('Le, la, un, une, du, de la: choose the right one every time.', 'Le, la, un, une, du, de la : choisir le bon à chaque fois.'),
    description: b(
      'Every French noun is masculine or feminine, and the article tells you which. Learn the endings that reveal a noun’s gender, when to use definite, indefinite and partitive articles, and why “je ne bois pas de café” has no “du”. Sorting games and quick-fire choices make the rules automatic.',
      'Chaque nom français est masculin ou féminin, et l’article l’indique. Apprenez les terminaisons qui révèlent le genre, quand employer l’article défini, indéfini ou partitif, et pourquoi on dit « je ne bois pas de café » sans « du ». Des jeux de tri et des choix rapides rendent les règles automatiques.',
    ),
    outcomes: [
      b('Guess a noun’s gender from its ending', 'Deviner le genre d’un nom grâce à sa terminaison'),
      b('Use le, la, l’, les and un, une, des', 'Employer le, la, l’, les et un, une, des'),
      b('Master du, de la, des and de after a negation', 'Maîtriser du, de la, des et de après une négation'),
    ],
  }),
  c({
    id: 'present-tense', category: 'grammar', level: 'A1', levels: ['A1'], minutes: 40, popular: true,
    slug: { en: 'french-present-tense', fr: 'present-de-l-indicatif' },
    title: b('The Present Tense', 'Le présent de l’indicatif'),
    subtitle: b('Être, avoir, -er verbs and the irregulars you use every day.', 'Être, avoir, les verbes en -er et les irréguliers de tous les jours.'),
    description: b(
      'The present tense is the backbone of French. Conjugate être and avoir without hesitation, master the regular -er verbs (90% of French verbs), then the everyday irregulars aller, faire, venir and prendre, and use aller + infinitive to talk about the near future.',
      'Le présent est la colonne vertébrale du français. Conjuguez être et avoir sans hésiter, maîtrisez les verbes réguliers en -er (90 % des verbes), puis les irréguliers du quotidien aller, faire, venir et prendre, et utilisez aller + infinitif pour parler du futur proche.',
    ),
    outcomes: [
      b('Conjugate être and avoir in the present', 'Conjuguer être et avoir au présent'),
      b('Conjugate any regular -er verb', 'Conjuguer n’importe quel verbe régulier en -er'),
      b('Use aller, faire, venir, prendre and the near future', 'Utiliser aller, faire, venir, prendre et le futur proche'),
    ],
  }),
  c({
    id: 'past-tenses', category: 'grammar', level: 'A2', levels: ['A2'], minutes: 45, popular: true,
    slug: { en: 'passe-compose-vs-imparfait', fr: 'passe-compose-et-imparfait' },
    title: b('Passé composé vs Imparfait', 'Passé composé et imparfait'),
    subtitle: b('Tell what happened, and how things were.', 'Raconter ce qui s’est passé, et comment c’était.'),
    description: b(
      'The two past tenses every learner confuses. Build the passé composé with avoir and with être (and the agreement that goes with it), form the imparfait, then learn to choose between them on a story timeline: the background in the imparfait, the events in the passé composé.',
      'Les deux temps du passé que tous les apprenants confondent. Construisez le passé composé avec avoir et avec être (et l’accord qui l’accompagne), formez l’imparfait, puis apprenez à choisir sur la ligne du temps d’un récit : le décor à l’imparfait, les événements au passé composé.',
    ),
    outcomes: [
      b('Form the passé composé with avoir and être', 'Former le passé composé avec avoir et être'),
      b('Make the past participle agree', 'Accorder le participe passé'),
      b('Choose between passé composé and imparfait in a story', 'Choisir entre passé composé et imparfait dans un récit'),
    ],
  }),
  c({
    id: 'future-conditional', category: 'grammar', level: 'B1', levels: ['B1'], minutes: 43,
    slug: { en: 'french-future-and-conditional', fr: 'futur-et-conditionnel' },
    title: b('Future, Conditional & Hypotheses', 'Futur, conditionnel et hypothèses'),
    subtitle: b('Make plans, be polite and imagine with “si”.', 'Faire des projets, être poli et imaginer avec « si ».'),
    description: b(
      'Talk about the future, ask politely and imagine what you would do. You learn the futur simple and its irregular stems, the conditional for polite requests and wishes, and the hypothesis structure si + imparfait → conditionnel that examiners love to hear.',
      'Parlez de l’avenir, demandez poliment et imaginez ce que vous feriez. Vous apprenez le futur simple et ses radicaux irréguliers, le conditionnel pour les demandes polies et les souhaits, et la structure d’hypothèse si + imparfait → conditionnel que les examinateurs aiment entendre.',
    ),
    outcomes: [
      b('Form the futur simple, including irregular stems', 'Former le futur simple, radicaux irréguliers compris'),
      b('Use the conditional to ask politely and express wishes', 'Utiliser le conditionnel pour demander poliment et exprimer un souhait'),
      b('Build hypotheses with si + imparfait', 'Construire des hypothèses avec si + imparfait'),
    ],
  }),
  c({
    id: 'subjunctive', category: 'grammar', level: 'B2', levels: ['B2'], minutes: 45,
    slug: { en: 'french-subjunctive', fr: 'subjonctif' },
    title: b('The Subjunctive Made Simple', 'Le subjonctif sans peur'),
    subtitle: b('Form it, recognise its triggers and use it naturally.', 'Le former, reconnaître ses déclencheurs et l’employer naturellement.'),
    description: b(
      'The subjunctive is less scary than its reputation. Learn the simple way to form it, the expressions that trigger it (il faut que, vouloir que, avant que, bien que…), and the cases where the indicative stays, like “je pense que” versus “je ne pense pas que”.',
      'Le subjonctif est moins effrayant que sa réputation. Apprenez la façon simple de le former, les expressions qui le déclenchent (il faut que, vouloir que, avant que, bien que…) et les cas où l’indicatif reste, comme « je pense que » face à « je ne pense pas que ».',
    ),
    outcomes: [
      b('Form the present subjunctive of regular and key irregular verbs', 'Former le subjonctif présent des verbes réguliers et des grands irréguliers'),
      b('Recognise the expressions that trigger the subjunctive', 'Reconnaître les expressions qui déclenchent le subjonctif'),
      b('Choose between subjunctive and indicative', 'Choisir entre subjonctif et indicatif'),
    ],
  }),

  c({
    id: 'negation', category: 'grammar', level: 'A1 → A2', levels: ['A1', 'A2'], minutes: 38,
    slug: { en: 'french-negation', fr: 'la-negation-en-francais' },
    title: b('Negation: ne… pas, jamais, rien', 'La négation : ne… pas, jamais, rien'),
    subtitle: b('Say no correctly, from ne… pas to personne, in the present and the past.', 'Dire non correctement, de ne… pas à personne, au présent et au passé.'),
    description: b(
      'Negation looks simple but hides many traps. Learn where ne and pas go, the spoken negation without ne, the other negations (jamais, plus, rien, personne), rien and personne as subjects, and the position of the negation with the passé composé and object pronouns.',
      'La négation paraît simple mais cache de nombreux pièges. Apprenez où placer ne et pas, la négation orale sans ne, les autres négations (jamais, plus, rien, personne), rien et personne en sujet, et la place de la négation au passé composé et avec les pronoms.',
    ),
    outcomes: [b('Build negative sentences correctly', 'Construire correctement les phrases négatives'), b('Use jamais, plus, rien, personne', 'Employer jamais, plus, rien, personne'), b('Negate the passé composé', 'Mettre le passé composé à la négative'), b('Place pronouns inside the negation', 'Placer les pronoms dans la négation')],
  }),
  c({
    id: 'object-pronouns', category: 'grammar', level: 'A2', levels: ['A2'], minutes: 39, popular: true,
    slug: { en: 'object-pronouns-le-lui-y-en', fr: 'pronoms-complements-le-lui-y-en' },
    title: b('Object Pronouns: le, lui, y, en', 'Les pronoms compléments : le, lui, y, en'),
    subtitle: b('Stop repeating nouns: replace them with le, la, les, lui, leur, y and en.', 'Arrêtez de répéter les noms : remplacez-les par le, la, les, lui, leur, y et en.'),
    description: b(
      'Pronouns make your French fluent and natural. Learn the direct pronouns le, la, les, the indirect pronouns lui and leur with the verbs that need them, and the two little words y and en for places and quantities, with their position before the verb.',
      'Les pronoms rendent votre français fluide et naturel. Apprenez les pronoms directs le, la, les, les pronoms indirects lui et leur avec les verbes qui les demandent, et les deux petits mots y et en pour les lieux et les quantités, avec leur place devant le verbe.',
    ),
    outcomes: [b('Use le, la, les', 'Employer le, la, les'), b('Use lui and leur with the right verbs', 'Employer lui et leur avec les bons verbes'), b('Use y and en', 'Employer y et en'), b('Place pronouns correctly', 'Placer correctement les pronoms')],
  }),
  c({
    id: 'reflexive-verbs', category: 'grammar', level: 'A2 → B1', levels: ['A2', 'B1'], minutes: 38,
    slug: { en: 'reflexive-verbs', fr: 'les-verbes-pronominaux' },
    title: b('Reflexive Verbs', 'Les verbes pronominaux'),
    subtitle: b('Se lever, s’habiller, s’entendre: in the present, the past and their special meanings.', 'Se lever, s’habiller, s’entendre : au présent, au passé et dans leurs sens particuliers.'),
    description: b(
      'Reflexive verbs are everywhere in daily life. Learn to conjugate them with the right pronoun, use être and make the participle agree in the passé composé, express “each other”, and master idiomatic verbs whose meaning changes: s’entendre, se rendre compte, se tromper, se débrouiller.',
      'Les verbes pronominaux sont partout dans la vie quotidienne. Apprenez à les conjuguer avec le bon pronom, à employer être et accorder le participe au passé composé, à exprimer la réciprocité, et à maîtriser les verbes dont le sens change : s’entendre, se rendre compte, se tromper, se débrouiller.',
    ),
    outcomes: [b('Conjugate reflexive verbs', 'Conjuguer les verbes pronominaux'), b('Use them in the passé composé', 'Les employer au passé composé'), b('Express reciprocity', 'Exprimer la réciprocité'), b('Use idiomatic reflexive verbs', 'Employer les verbes pronominaux idiomatiques')],
  }),
  c({
    id: 'adjectives-comparison', category: 'grammar', level: 'A2 → B1', levels: ['A2', 'B1'], minutes: 39,
    slug: { en: 'adjectives-and-comparison', fr: 'adjectifs-et-comparaison' },
    title: b('Adjectives & Comparison', 'Adjectifs et comparaison'),
    subtitle: b('Place adjectives, compare with plus, moins, aussi, and say the best.', 'Placer les adjectifs, comparer avec plus, moins, aussi, et dire le meilleur.'),
    description: b(
      'Describe and compare like a native. Learn which adjectives go before the noun, the special forms bel, nouvel, vieil, the comparatives plus / moins / aussi… que, the trap of meilleur and mieux, and the superlative le plus, le moins, le meilleur.',
      'Décrivez et comparez comme un natif. Apprenez quels adjectifs se placent avant le nom, les formes bel, nouvel, vieil, les comparatifs plus / moins / aussi… que, le piège de meilleur et mieux, et le superlatif le plus, le moins, le meilleur.',
    ),
    outcomes: [b('Place adjectives correctly', 'Placer correctement les adjectifs'), b('Compare with plus, moins, aussi', 'Comparer avec plus, moins, aussi'), b('Choose meilleur or mieux', 'Choisir meilleur ou mieux'), b('Use the superlative', 'Employer le superlatif')],
  }),
  c({
    id: 'relative-pronouns', category: 'grammar', level: 'B1', levels: ['B1'], minutes: 39,
    slug: { en: 'relative-pronouns', fr: 'les-pronoms-relatifs' },
    title: b('Relative Pronouns: qui, que, où, dont', 'Les pronoms relatifs : qui, que, où, dont'),
    subtitle: b('Link your ideas in longer, richer sentences.', 'Reliez vos idées dans des phrases plus longues et plus riches.'),
    description: b(
      'Relative pronouns turn short sentences into fluent B1 French. Learn the quick test to choose qui or que, où for places and times, dont with verbs + de and for possession, ce qui / ce que, and lequel after a preposition with its contractions auquel and duquel.',
      'Les pronoms relatifs transforment des phrases courtes en français B1 fluide. Apprenez le test rapide pour choisir qui ou que, où pour les lieux et le temps, dont avec les verbes + de et pour la possession, ce qui / ce que, et lequel après une préposition avec ses contractions auquel et duquel.',
    ),
    outcomes: [b('Choose qui or que', 'Choisir qui ou que'), b('Use où and dont', 'Employer où et dont'), b('Use ce qui and ce que', 'Employer ce qui et ce que'), b('Use lequel after a preposition', 'Employer lequel après une préposition')],
  }),

  // ── Spelling ──────────────────────────────────────────────────────────────
  c({
    id: 'spelling-accents', category: 'spelling', level: 'A1', levels: ['A1'], minutes: 37,
    slug: { en: 'french-accents-and-spelling', fr: 'accents-et-orthographe' },
    title: b('Accents & Sound-Spelling', 'Les accents et les sons écrits'),
    subtitle: b('é, è, ê, ç, ï: what each accent does and how to hear it.', 'é, è, ê, ç, ï : ce que fait chaque accent et comment l’entendre.'),
    description: b(
      'French spelling is not random. Learn what each accent changes in pronunciation, the main ways of writing the same sound (o, au, eau; é, er, ez), and how to type accents on any keyboard. Dictations with native audio train you to write what you hear.',
      'L’orthographe française n’est pas un hasard. Apprenez ce que chaque accent change à la prononciation, les principales façons d’écrire un même son (o, au, eau ; é, er, ez) et comment taper les accents sur n’importe quel clavier. Des dictées avec audio natif vous entraînent à écrire ce que vous entendez.',
    ),
    outcomes: [
      b('Know what each accent does', 'Savoir ce que fait chaque accent'),
      b('Write the same sound in its different spellings', 'Écrire un même son dans ses différentes graphies'),
      b('Write short dictated sentences correctly', 'Écrire correctement de courtes phrases dictées'),
    ],
  }),
  c({
    id: 'spelling-homophones', category: 'spelling', level: 'A2', levels: ['A2'], minutes: 38, popular: true,
    slug: { en: 'french-homophones', fr: 'homophones-grammaticaux' },
    title: b('Homophones: a / à, et / est, son / sont…', 'Les homophones : a / à, et / est, son / sont…'),
    subtitle: b('The words that sound the same but are written differently.', 'Les mots qui se prononcent pareil mais s’écrivent autrement.'),
    description: b(
      'The most frequent spelling mistakes in French, even among natives. Learn a simple test for each pair (a / à, et / est, son / sont, ces / ses, on / ont, ou / où) and apply it in quick exercises until it becomes automatic.',
      'Les fautes d’orthographe les plus fréquentes en français, même chez les natifs. Apprenez un test simple pour chaque paire (a / à, et / est, son / sont, ces / ses, on / ont, ou / où) et appliquez-le dans des exercices rapides jusqu’à ce qu’il devienne automatique.',
    ),
    outcomes: [
      b('Tell a / à, et / est, ou / où apart', 'Distinguer a / à, et / est, ou / où'),
      b('Tell son / sont, on / ont, ces / ses apart', 'Distinguer son / sont, on / ont, ces / ses'),
      b('Proofread a short text', 'Relire et corriger un court texte'),
    ],
  }),
  c({
    id: 'spelling-agreement', category: 'spelling', level: 'B1', levels: ['B1'], minutes: 42,
    slug: { en: 'french-agreement-rules', fr: 'accords-en-francais' },
    title: b('Agreement: Plurals, Feminine & Past Participle', 'Les accords : pluriel, féminin et participe passé'),
    subtitle: b('The silent letters that examiners always check.', 'Les lettres muettes que les correcteurs vérifient toujours.'),
    description: b(
      'Much of French spelling cannot be heard: the s of the plural, the e of the feminine, the agreement of the past participle. Learn the rules that cover most cases, the frequent exceptions, and a proofreading method to use in every exam.',
      'Une grande partie de l’orthographe française ne s’entend pas : le s du pluriel, le e du féminin, l’accord du participe passé. Apprenez les règles qui couvrent la plupart des cas, les exceptions fréquentes et une méthode de relecture à appliquer à chaque examen.',
    ),
    outcomes: [
      b('Form the plural and feminine of nouns and adjectives', 'Former le pluriel et le féminin des noms et adjectifs'),
      b('Make the verb agree with its subject', 'Accorder le verbe avec son sujet'),
      b('Make the past participle agree with être and avoir', 'Accorder le participe passé avec être et avoir'),
    ],
  }),

  c({
    id: 'spelling-consonant-sounds', category: 'spelling', level: 'A2', levels: ['A2'], minutes: 38,
    slug: { en: 'spelling-s-c-g-sounds', fr: 'orthographe-des-sons-s-c-g' },
    title: b('Spelling the s, c and g Sounds', 'L’orthographe des sons s, c et g'),
    subtitle: b('s or ss, c or ç, g, ge or gu: the rules that decide.', 's ou ss, c ou ç, g, ge ou gu : les règles qui décident.'),
    description: b(
      'Why poisson but poison? Why garçon with a cedilla and mangeons with an e? Learn the simple rules that link letters and sounds for s, c and g, apply them to -cer and -ger verbs, and check yourself with dictations and proofreading.',
      'Pourquoi poisson mais poison ? Pourquoi garçon avec une cédille et mangeons avec un e ? Apprenez les règles simples qui relient lettres et sons pour s, c et g, appliquez-les aux verbes en -cer et -ger, et vérifiez-vous avec des dictées et de la relecture.',
    ),
    outcomes: [b('Choose s or ss', 'Choisir s ou ss'), b('Use c and ç correctly', 'Employer c et ç correctement'), b('Choose g, ge or gu', 'Choisir g, ge ou gu'), b('Conjugate -cer and -ger verbs', 'Conjuguer les verbes en -cer et -ger')],
  }),
  c({
    id: 'spelling-silent-letters', category: 'spelling', level: 'A2', levels: ['A2'], minutes: 38,
    slug: { en: 'silent-letters-in-spelling', fr: 'les-lettres-muettes' },
    title: b('Silent Letters', 'Les lettres muettes'),
    subtitle: b('Write the letters you do not hear: final consonants, h, feminine e and plural s.', 'Écrire les lettres qu’on n’entend pas : consonnes finales, h, e du féminin et s du pluriel.'),
    description: b(
      'French writes many letters it does not pronounce. Learn the two tests that reveal a silent final letter (the feminine and the word family), the difference between silent h and aspirated h, and the silent endings of the feminine, the plural and the verbs.',
      'Le français écrit beaucoup de lettres qu’il ne prononce pas. Apprenez les deux tests qui révèlent une lettre finale muette (le féminin et la famille de mots), la différence entre h muet et h aspiré, et les finales muettes du féminin, du pluriel et des verbes.',
    ),
    outcomes: [b('Find silent final letters', 'Trouver les lettres finales muettes'), b('Distinguish silent and aspirated h', 'Distinguer h muet et h aspiré'), b('Write silent feminine and plural endings', 'Écrire les finales muettes du féminin et du pluriel'), b('Write -ent for ils / elles', 'Écrire -ent pour ils / elles')],
  }),
  c({
    id: 'spelling-verb-endings', category: 'spelling', level: 'A2 → B1', levels: ['A2', 'B1'], minutes: 38, popular: true,
    slug: { en: 'verb-endings-spelling', fr: 'orthographe-des-terminaisons-verbales' },
    title: b('Verb Endings', 'Les terminaisons verbales'),
    subtitle: b('-s or -t, -ais or -ait, -rai or -rais: write the verb you hear correctly.', '-s ou -t, -ais ou -ait, -rai ou -rais : écrire correctement le verbe entendu.'),
    description: b(
      'Most spelling mistakes in French are on verbs, because many endings sound the same. Learn the present endings, the s of tu, the imparfait endings -ais / -ait / -aient, the difference between -ait and -é, and the nous test to choose between future and conditional.',
      'La plupart des fautes d’orthographe en français portent sur les verbes, car beaucoup de terminaisons se prononcent pareil. Apprenez les terminaisons du présent, le s de tu, les terminaisons de l’imparfait -ais / -ait / -aient, la différence entre -ait et -é, et le test du nous pour choisir entre futur et conditionnel.',
    ),
    outcomes: [b('Write present tense endings', 'Écrire les terminaisons du présent'), b('Write imparfait endings', 'Écrire les terminaisons de l’imparfait'), b('Choose -ait or -é', 'Choisir -ait ou -é'), b('Choose future or conditional', 'Choisir futur ou conditionnel')],
  }),
  c({
    id: 'spelling-capitals-punctuation', category: 'spelling', level: 'A2', levels: ['A2'], minutes: 38,
    slug: { en: 'capitals-and-punctuation', fr: 'majuscules-et-ponctuation' },
    title: b('Capitals & Punctuation', 'Majuscules et ponctuation'),
    subtitle: b('French capitals, spaces before ! and ?, quotation marks, apostrophes and hyphens.', 'Les majuscules françaises, les espaces avant ! et ?, les guillemets, l’apostrophe et le trait d’union.'),
    description: b(
      'French punctuation has its own rules, and they are visible in every text you write. Learn where French uses capitals (fewer than English), the spaces before double punctuation in France and Québec, French quotation marks, decimal commas, elision and the hyphen in questions and numbers.',
      'La ponctuation française a ses propres règles, visibles dans chaque texte. Apprenez où le français met des majuscules (moins qu’en anglais), les espaces avant la ponctuation double en France et au Québec, les guillemets français, la virgule décimale, l’élision et le trait d’union dans les questions et les nombres.',
    ),
    outcomes: [b('Use capitals the French way', 'Employer les majuscules à la française'), b('Punctuate with the right spaces', 'Ponctuer avec les bonnes espaces'), b('Write numbers and amounts', 'Écrire nombres et montants'), b('Use the apostrophe and the hyphen', 'Employer l’apostrophe et le trait d’union')],
  }),
  c({
    id: 'spelling-double-consonants', category: 'spelling', level: 'B1', levels: ['B1'], minutes: 39,
    slug: { en: 'double-consonants', fr: 'les-consonnes-doubles' },
    title: b('Double Consonants', 'Les consonnes doubles'),
    subtitle: b('Bonne, appelle, appartement, couramment: when to double and when not to.', 'Bonne, appelle, appartement, couramment : quand doubler et quand ne pas doubler.'),
    description: b(
      'One or two consonants? Learn the patterns of feminine endings (-onne, -enne, -elle), the words that double after a-, the false friends with English (adresse, appartement), the verbs appeler and jeter, m before b and p, -tion or -ssion, and adverbs in -amment and -emment.',
      'Une ou deux consonnes ? Apprenez les régularités des féminins (-onne, -enne, -elle), les mots qui doublent après a-, les faux amis de l’anglais (adresse, appartement), les verbes appeler et jeter, m devant b et p, -tion ou -ssion, et les adverbes en -amment et -emment.',
    ),
    outcomes: [b('Double feminine endings correctly', 'Doubler correctement les féminins'), b('Spell English look-alikes the French way', 'Écrire à la française les mots proches de l’anglais'), b('Conjugate appeler, jeter and acheter', 'Conjuguer appeler, jeter et acheter'), b('Write adverbs in -amment / -emment', 'Écrire les adverbes en -amment / -emment')],
  }),
  c({
    id: 'spelling-homophones-advanced', category: 'spelling', level: 'B1', levels: ['B1'], minutes: 39,
    slug: { en: 'advanced-homophones', fr: 'homophones-avances' },
    title: b('Advanced Homophones', 'Les homophones avancés'),
    subtitle: b('la / l’a / là, peu / peut, quand / quant, leur / leurs… and the tests to choose.', 'la / l’a / là, peu / peut, quand / quant, leur / leurs… et les tests pour choisir.'),
    description: b(
      'After a / à and son / sont, the next level of homophones. Learn the replacement tests for la / l’a / là, quel / qu’elle, peu / peut / peux, sans / s’en / c’en, quand / quant / qu’en, and the difference between the pronoun leur and the possessive leur(s).',
      'Après a / à et son / sont, le niveau suivant des homophones. Apprenez les tests de remplacement pour la / l’a / là, quel / qu’elle, peu / peut / peux, sans / s’en / c’en, quand / quant / qu’en, et la différence entre le pronom leur et le possessif leur(s).',
    ),
    outcomes: [b('Choose la, l’a or là', 'Choisir la, l’a ou là'), b('Choose peu, peut or peux', 'Choisir peu, peut ou peux'), b('Choose quand, quant or qu’en', 'Choisir quand, quant ou qu’en'), b('Distinguish leur and leurs', 'Distinguer leur et leurs')],
  }),
  c({
    id: 'spelling-plurals-numbers', category: 'spelling', level: 'B1 → B2', levels: ['B1', 'B2'], minutes: 39,
    slug: { en: 'tricky-plurals-and-numbers', fr: 'pluriels-difficiles-et-nombres' },
    title: b('Tricky Plurals & Numbers', 'Pluriels difficiles et nombres'),
    subtitle: b('Quatre-vingts, des grands-parents, bleu clair, tous les jours: the agreements that trap.', 'Quatre-vingts, des grands-parents, bleu clair, tous les jours : les accords qui piègent.'),
    description: b(
      'The agreements that even native speakers get wrong. Learn when vingt and cent take an s, the plural of compound nouns, which colours agree and which never do, and how to make tout and même agree, with the 1990 spelling reform where it simplifies the rules.',
      'Les accords que même les francophones ratent. Apprenez quand vingt et cent prennent un s, le pluriel des noms composés, quelles couleurs s’accordent et lesquelles jamais, et comment accorder tout et même, avec les rectifications de 1990 quand elles simplifient la règle.',
    ),
    outcomes: [b('Write numbers in letters correctly', 'Écrire correctement les nombres en lettres'), b('Make compound nouns plural', 'Mettre les noms composés au pluriel'), b('Make colours agree correctly', 'Accorder correctement les couleurs'), b('Use tout, tous, toute, toutes and même', 'Employer tout, tous, toute, toutes et même')],
  }),

  // ── Listening ─────────────────────────────────────────────────────────────
  c({
    id: 'listening-a2', category: 'listening', level: 'A2', levels: ['A2'], minutes: 37,
    slug: { en: 'french-listening-a2', fr: 'comprehension-orale-a2' },
    title: b('Listening A2: Everyday French', 'Compréhension orale A2 : le français du quotidien'),
    subtitle: b('Messages, announcements and short conversations.', 'Messages, annonces et courtes conversations.'),
    description: b(
      'Train your ear on the French you hear every day: voicemail messages, station and shop announcements, short exchanges between friends. Each audio comes with a question, then the transcript so you can check what you missed.',
      'Entraînez votre oreille au français que l’on entend tous les jours : messages vocaux, annonces en gare et en magasin, courts échanges entre amis. Chaque audio est suivi d’une question, puis de la transcription pour vérifier ce qui vous a échappé.',
    ),
    outcomes: [
      b('Understand a voicemail message', 'Comprendre un message vocal'),
      b('Catch the key information in an announcement', 'Saisir l’information clé d’une annonce'),
      b('Follow a short conversation between natives', 'Suivre une courte conversation entre natifs'),
    ],
  }),
  c({
    id: 'listening-b1', category: 'listening', level: 'B1', levels: ['B1'], minutes: 40,
    slug: { en: 'french-listening-b1', fr: 'comprehension-orale-b1' },
    title: b('Listening B1: Radio & Interviews', 'Compréhension orale B1 : radio et interviews'),
    subtitle: b('Follow a radio report, an interview and an opinion.', 'Suivre une chronique radio, une interview et une opinion.'),
    description: b(
      'Move on to longer recordings: a radio news item, an interview with a professional, a person giving their opinion. Learn to identify the main idea, the details and the speaker’s attitude, and to keep up with natural speed.',
      'Passez à des enregistrements plus longs : une brève à la radio, l’interview d’un professionnel, une personne qui donne son avis. Apprenez à repérer l’idée principale, les détails et l’attitude de la personne qui parle, et à suivre un débit naturel.',
    ),
    outcomes: [
      b('Identify the main idea of a radio report', 'Repérer l’idée principale d’une chronique radio'),
      b('Pick out details in an interview', 'Relever des détails dans une interview'),
      b('Recognise the speaker’s opinion and attitude', 'Reconnaître l’opinion et l’attitude de la personne'),
    ],
  }),

  // ── Pronunciation ─────────────────────────────────────────────────────────
  c({
    id: 'french-sounds', category: 'pronunciation', level: 'A1', levels: ['A1'], minutes: 35,
    slug: { en: 'sounds-of-french', fr: 'sons-du-francais' },
    title: b('The Sounds of French', 'Les sons du français'),
    subtitle: b('Vowels, nasal sounds, the French R and silent letters.', 'Voyelles, nasales, le R français et les lettres muettes.'),
    description: b(
      'Some French sounds do not exist in English and change the meaning of words: tu / tout, dessus / dessous, beau / bon. Listen to minimal pairs recorded by native voices, train your ear with quick quizzes, then say the words aloud and see what the speech recogniser understood.',
      'Certains sons du français changent le sens des mots : tu / tout, dessus / dessous, beau / bon. Écoutez des paires minimales enregistrées par des voix natives, entraînez votre oreille avec des quiz rapides, puis prononcez les mots et voyez ce que la reconnaissance vocale a compris.',
    ),
    outcomes: [
      b('Hear and say u / ou and é / è', 'Entendre et prononcer u / ou et é / è'),
      b('Produce the three nasal vowels', 'Produire les trois voyelles nasales'),
      b('Pronounce the French R and know which letters are silent', 'Prononcer le R français et savoir quelles lettres sont muettes'),
    ],
  }),
  c({
    id: 'liaison-intonation', category: 'pronunciation', level: 'A2', levels: ['A2'], minutes: 35,
    slug: { en: 'liaison-rhythm-intonation', fr: 'liaisons-rythme-intonation' },
    title: b('Liaison, Rhythm & Intonation', 'Liaisons, rythme et intonation'),
    subtitle: b('Link words like a native and give your sentences the right melody.', 'Enchaîner les mots comme un natif et donner la bonne mélodie à vos phrases.'),
    description: b(
      'Why does “les amis” sound like “lé-z-ami”? Learn the compulsory and forbidden liaisons, how French links words into one breath group, when the e is dropped in speech, and how intonation alone turns a statement into a question.',
      'Pourquoi « les amis » se prononce-t-il « lé-z-ami » ? Apprenez les liaisons obligatoires et interdites, comment le français relie les mots en un seul groupe, quand le e disparaît à l’oral, et comment l’intonation seule transforme une affirmation en question.',
    ),
    outcomes: [
      b('Make the compulsory liaisons and avoid the forbidden ones', 'Faire les liaisons obligatoires et éviter les interdites'),
      b('Link words and drop the e like natives do', 'Enchaîner les mots et laisser tomber le e comme les natifs'),
      b('Use rising and falling intonation', 'Utiliser l’intonation montante et descendante'),
    ],
  }),

  // ── Conversation ──────────────────────────────────────────────────────────
  c({
    id: 'small-talk', category: 'conversation', level: 'A2', levels: ['A2'], minutes: 39,
    slug: { en: 'french-small-talk', fr: 'small-talk-en-francais' },
    title: b('Small Talk & Meeting People', 'Small talk et rencontres'),
    subtitle: b('Break the ice, talk about your tastes and make plans.', 'Briser la glace, parler de vos goûts et proposer une sortie.'),
    description: b(
      'The everyday conversations that make friendships and networks: starting a chat with a neighbour or a colleague, talking about your hobbies and tastes, and inviting someone, accepting or politely declining. You choose your replies in animated dialogues.',
      'Les conversations du quotidien qui créent des amitiés et des réseaux : engager la discussion avec un voisin ou un collègue, parler de vos loisirs et de vos goûts, inviter quelqu’un, accepter ou refuser poliment. Vous choisissez vos répliques dans des dialogues animés.',
    ),
    outcomes: [
      b('Start and keep a casual conversation going', 'Engager et faire vivre une conversation détendue'),
      b('Talk about likes, dislikes and hobbies', 'Parler de vos goûts et de vos loisirs'),
      b('Invite, accept and decline politely', 'Inviter, accepter et refuser poliment'),
    ],
  }),
  c({
    id: 'opinions-debate', category: 'conversation', level: 'B2', levels: ['B2'], minutes: 42,
    slug: { en: 'giving-your-opinion-in-french', fr: 'donner-son-opinion-et-debattre' },
    title: b('Giving Your Opinion & Debating', 'Donner son opinion et débattre'),
    subtitle: b('Say what you think, argue a point and nuance it.', 'Dire ce que vous pensez, défendre une idée et la nuancer.'),
    description: b(
      'The skill every B1–B2 exam tests and every meeting requires. Express your opinion with varied phrases, organise your arguments with connectors, and concede a point before defending yours (certes… mais, il est vrai que…). Ideal preparation for the TCF and TEF speaking tasks.',
      'La compétence que tout examen B1–B2 évalue et que toute réunion exige. Exprimez votre opinion avec des tournures variées, organisez vos arguments avec des connecteurs et concédez un point avant de défendre le vôtre (certes… mais, il est vrai que…). Une préparation idéale pour l’oral du TCF et du TEF.',
    ),
    outcomes: [
      b('Express an opinion with ten different phrases', 'Exprimer une opinion avec dix tournures différentes'),
      b('Structure an argument with connectors', 'Structurer une argumentation avec des connecteurs'),
      b('Concede and nuance like a confident speaker', 'Concéder et nuancer avec aisance'),
    ],
  }),
  c({
    id: 'quebec-french', category: 'conversation', level: 'B1', levels: ['B1'], minutes: 37,
    slug: { en: 'quebec-french', fr: 'francais-quebecois' },
    title: b('Québec French in Everyday Life', 'Le français québécois au quotidien'),
    subtitle: b('The words, accent and habits you will meet in Québec.', 'Les mots, l’accent et les habitudes que vous rencontrerez au Québec.'),
    description: b(
      'Moving to Montréal or Québec City? Discover the everyday expressions (char, magasiner, dépanneur, bienvenue), the features of the Québec accent that surprise newcomers, and the vocabulary of daily life, from meals to paperwork.',
      'Vous partez pour Montréal ou Québec ? Découvrez les expressions du quotidien (char, magasiner, dépanneur, bienvenue), les traits de l’accent québécois qui surprennent les nouveaux arrivants et le vocabulaire de la vie pratique, des repas aux démarches.',
    ),
    outcomes: [
      b('Understand common Québec expressions', 'Comprendre les expressions québécoises courantes'),
      b('Recognise the main features of the Québec accent', 'Reconnaître les grands traits de l’accent québécois'),
      b('Handle everyday situations in Québec', 'Vous débrouiller dans les situations du quotidien au Québec'),
    ],
  }),

  // ── TCF Canada: five levelled courses, one per skill (A1 → C2) ─────────────
  c({
    id: 'tcf-listening', category: 'tcf', ladder: true, lessonCount: 6, level: 'A1 → C2', levels: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'], minutes: 84, popular: true, offer: 'TCF Canada',
    slug: { en: 'tcf-canada-listening-course', fr: 'cours-tcf-canada-comprehension-orale' },
    title: b('TCF Canada Listening: A1 to C2', 'TCF Canada Compréhension orale : du A1 au C2'),
    subtitle: b('Learn to understand spoken French, level by level, with exam-style recordings.', 'Apprenez à comprendre le français parlé, niveau par niveau, avec des enregistrements type examen.'),
    description: b(
      'A real listening course built on the TCF Canada: six levels, from prices and times in a station announcement (A1) to irony and implicit meaning in a radio debate (C2). At each level you learn the French you need to understand (numbers, connectors, idioms, intonation), then you answer questions like those of the exam, heard only once. An adaptive test places you at your level; 70% unlocks the next one.',
      'Un vrai cours de compréhension orale construit sur le TCF Canada : six niveaux, des prix et des horaires d’une annonce en gare (A1) à l’ironie et à l’implicite d’un débat radio (C2). À chaque niveau, vous apprenez le français qu’il faut comprendre (nombres, connecteurs, expressions, intonation), puis vous répondez à des questions comme celles de l’examen, entendues une seule fois. Un test adaptatif vous place à votre niveau ; 70 % débloque le suivant.',
    ),
    outcomes: [
      b('Catch numbers, times, places and prices at native speed', 'Saisir nombres, heures, lieux et prix à vitesse native'),
      b('Follow conversations, interviews and radio reports', 'Suivre des conversations, des interviews et des reportages radio'),
      b('Understand opinion, attitude, irony and implicit meaning', 'Comprendre l’opinion, l’attitude, l’ironie et l’implicite'),
      b('Answer TCF-style questions after a single listening', 'Répondre à des questions type TCF après une seule écoute'),
    ],
  }),
  c({
    id: 'tcf-reading', category: 'tcf', ladder: true, lessonCount: 6, level: 'A1 → C2', levels: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'], minutes: 84, offer: 'TCF Canada',
    slug: { en: 'tcf-canada-reading-course', fr: 'cours-tcf-canada-comprehension-ecrite' },
    title: b('TCF Canada Reading: A1 to C2', 'TCF Canada Compréhension écrite : du A1 au C2'),
    subtitle: b('From a notice on a door to an opinion column: read French faster and more precisely.', 'De l’affiche sur une porte à la tribune d’opinion : lire le français plus vite et plus juste.'),
    description: b(
      'Six levels of real reading practice built on the TCF Canada documents: signs and timetables, emails and ads, news articles, opinion pieces, essays and literary extracts. Each level teaches the vocabulary and the reading techniques of that level (scanning, reformulation, connectors, the author’s intention), then trains you with exam-style questions. The adaptive test sets your starting level.',
      'Six niveaux de vraie lecture construits sur les documents du TCF Canada : affiches et horaires, courriels et annonces, articles de presse, tribunes, essais et extraits littéraires. Chaque niveau enseigne le vocabulaire et les techniques de lecture du niveau (repérage, reformulation, connecteurs, intention de l’auteur), puis vous entraîne avec des questions type examen. Le test adaptatif fixe votre niveau de départ.',
    ),
    outcomes: [
      b('Find information quickly in everyday documents', 'Trouver vite une information dans les documents du quotidien'),
      b('Recognise reformulations between the text and the answers', 'Reconnaître les reformulations entre le texte et les réponses'),
      b('Follow an argument and identify the author’s intention', 'Suivre une argumentation et identifier l’intention de l’auteur'),
      b('Read demanding texts: register, irony, nuance', 'Lire des textes exigeants : registre, ironie, nuance'),
    ],
  }),
  c({
    id: 'tcf-writing', category: 'tcf', ladder: true, lessonCount: 6, level: 'A1 → C2', levels: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'], minutes: 96, popular: true, offer: 'TCF Canada',
    slug: { en: 'tcf-canada-writing-course', fr: 'cours-tcf-canada-expression-ecrite' },
    title: b('TCF Canada Writing: A1 to C2', 'TCF Canada Expression écrite : du A1 au C2'),
    subtitle: b('Write better French at every level, up to the three tasks of the exam.', 'Écrire un meilleur français à chaque niveau, jusqu’aux trois tâches de l’examen.'),
    description: b(
      'A writing course, not a description of the exam. You start with sentences and short messages (A1–A2), learn to tell a story and link your ideas (B1), to write a structured article (B2), to compare two opinions and argue with nuance (C1), and to write with precision and style (C2). Every level ends with a writing task of the TCF Canada type, a checklist and a model answer.',
      'Un cours d’écriture, pas une description de l’examen. Vous commencez par des phrases et des messages courts (A1–A2), apprenez à raconter et à relier vos idées (B1), à rédiger un article structuré (B2), à comparer deux opinions et à argumenter avec nuance (C1), puis à écrire avec précision et style (C2). Chaque niveau se termine par une tâche du type TCF Canada, une grille et un modèle.',
    ),
    outcomes: [
      b('Write correct sentences and short messages', 'Écrire des phrases correctes et des messages courts'),
      b('Tell, describe and link ideas with connectors', 'Raconter, décrire et relier ses idées avec des connecteurs'),
      b('Structure an article and an argued comparison', 'Structurer un article et une comparaison argumentée'),
      b('Reach C1–C2: concession, nominalisation, precise vocabulary', 'Atteindre C1–C2 : concession, nominalisation, vocabulaire précis'),
    ],
  }),
  c({
    id: 'tcf-speaking', category: 'tcf', ladder: true, lessonCount: 6, level: 'A1 → C2', levels: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'], minutes: 90, popular: true, offer: 'TCF Canada',
    slug: { en: 'tcf-canada-speaking-course', fr: 'cours-tcf-canada-expression-orale' },
    title: b('TCF Canada Speaking: A1 to C2', 'TCF Canada Expression orale : du A1 au C2'),
    subtitle: b('Speak French with more ease at each level, from introducing yourself to defending a view.', 'Parler français avec plus d’aisance à chaque niveau, de la présentation à la défense d’une opinion.'),
    description: b(
      'Six levels to learn to speak: introduce yourself (A1), talk about your life and your past (A2), ask the right questions in a role-play (B1), give and justify an opinion (B2), nuance, concede and handle objections (C1), and speak with the fluency and precision of an expert user (C2). You repeat native models, practise aloud with speech recognition and learn the phrases that raise your score in the three TCF tasks.',
      'Six niveaux pour apprendre à parler : vous présenter (A1), parler de votre vie et de votre passé (A2), poser les bonnes questions dans un jeu de rôle (B1), donner et justifier une opinion (B2), nuancer, concéder et répondre aux objections (C1), puis parler avec l’aisance et la précision d’un utilisateur expérimenté (C2). Vous répétez des modèles natifs, vous pratiquez à voix haute avec la reconnaissance vocale et apprenez les tournures qui font monter la note aux trois tâches du TCF.',
    ),
    outcomes: [
      b('Introduce yourself and talk about your daily life', 'Vous présenter et parler de votre quotidien'),
      b('Ask varied, polite questions in a role-play', 'Poser des questions variées et polies dans un jeu de rôle'),
      b('Give, justify and nuance an opinion', 'Donner, justifier et nuancer une opinion'),
      b('Sound natural: intonation, fillers, idiomatic phrases', 'Paraître naturel : intonation, mots de liaison, expressions'),
    ],
  }),
  c({
    id: 'tcf-grammar', category: 'tcf', ladder: true, lessonCount: 6, level: 'A1 → C2', levels: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'], minutes: 85, offer: 'TCF Canada',
    slug: { en: 'tcf-canada-grammar-and-vocabulary', fr: 'cours-tcf-canada-grammaire-et-vocabulaire' },
    title: b('TCF Canada Grammar & Vocabulary: A1 to C2', 'TCF Canada Grammaire et vocabulaire : du A1 au C2'),
    subtitle: b('The grammar and the words each TCF level expects, taught and practised.', 'La grammaire et les mots qu’attend chaque niveau du TCF, expliqués et pratiqués.'),
    description: b(
      'Every TCF paper relies on the same foundation: the language itself. This course teaches, level by level, the grammar and vocabulary that examiners expect: the present and articles (A1), past tenses and pronouns (A2), the conditional and relative pronouns (B1), the subjunctive and reported speech (B2), the passive, the gerund and nominalisation (C1), and the fine points of a C2 user. Each rule is explained simply, then practised until it sticks.',
      'Toutes les épreuves du TCF reposent sur la même base : la langue. Ce cours enseigne, niveau par niveau, la grammaire et le vocabulaire qu’attendent les correcteurs : présent et articles (A1), temps du passé et pronoms (A2), conditionnel et pronoms relatifs (B1), subjonctif et discours rapporté (B2), passif, gérondif et nominalisation (C1), puis les finesses de l’utilisateur C2. Chaque règle est expliquée simplement, puis pratiquée jusqu’à devenir un réflexe.',
    ),
    outcomes: [
      b('Master the tenses from the present to the subjunctive', 'Maîtriser les temps, du présent au subjonctif'),
      b('Use pronouns, relatives and connectors correctly', 'Employer correctement pronoms, relatifs et connecteurs'),
      b('Enrich your vocabulary with the words of each level', 'Enrichir votre vocabulaire avec les mots de chaque niveau'),
      b('Recognise the structures of formal written French', 'Reconnaître les structures du français écrit soutenu'),
    ],
  }),

  // ── TEF Canada & Québec: five levelled courses, one per skill (A1 → C2) ──
  c({
    id: 'tef-listening', category: 'tef-quebec', ladder: true, lessonCount: 6, level: 'A1 → C2', levels: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'], minutes: 86, popular: true, offer: 'TEF Canada',
    slug: { en: 'tef-canada-listening-course', fr: 'cours-tef-canada-comprehension-orale' },
    title: b('TEF Canada & TEFAQ Listening: A1 to C2', 'TEF Canada et TEFAQ Compréhension orale : du A1 au C2'),
    subtitle: b('Understand the voicemails, announcements, interviews and radio of the TEF, level by level.', 'Comprendre les messages, annonces, interviews et émissions du TEF, niveau par niveau.'),
    description: b(
      'The TEF Canada and the TEFAQ (Québec) test your listening with documents from everyday and working life: voicemails, public announcements, conversations, radio interviews and debates, some with a Québec accent. This course teaches you to understand them level by level, from A1 to C2, with the vocabulary of each situation, then trains you on TEF-style questions. An adaptive test places you; 70% unlocks the next level.',
      'Le TEF Canada et le TEFAQ (Québec) évaluent votre écoute avec des documents de la vie quotidienne et professionnelle : messages vocaux, annonces publiques, conversations, interviews et débats radio, parfois avec l’accent québécois. Ce cours vous apprend à les comprendre niveau par niveau, du A1 au C2, avec le vocabulaire de chaque situation, puis vous entraîne sur des questions type TEF. Un test adaptatif vous place ; 70 % débloque le niveau suivant.',
    ),
    outcomes: [
      b('Understand voicemails and public announcements', 'Comprendre les messages vocaux et les annonces publiques'),
      b('Follow everyday and workplace conversations', 'Suivre des conversations du quotidien et du travail'),
      b('Understand interviews and debates, including Québec French', 'Comprendre interviews et débats, y compris en français québécois'),
      b('Answer TEF-style questions with confidence', 'Répondre avec assurance aux questions type TEF'),
    ],
  }),
  c({
    id: 'tef-reading', category: 'tef-quebec', ladder: true, lessonCount: 6, level: 'A1 → C2', levels: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'], minutes: 84, offer: 'TEF Canada',
    slug: { en: 'tef-canada-reading-course', fr: 'cours-tef-canada-comprehension-ecrite' },
    title: b('TEF Canada Reading: A1 to C2', 'TEF Canada Compréhension écrite : du A1 au C2'),
    subtitle: b('Forms, ads, workplace emails, press articles: read like a professional.', 'Formulaires, annonces, courriels de travail, articles de presse : lire comme un professionnel.'),
    description: b(
      'The TEF Canada reading paper uses practical and professional documents: notices, forms, ads, workplace emails, press articles and opinion pieces. In six levels you learn the vocabulary and the reading strategies each level requires, from finding an opening time (A1) to analysing an argument and its implicit meaning (C2), with TEF-style questions at every step.',
      'L’épreuve de compréhension écrite du TEF Canada utilise des documents pratiques et professionnels : avis, formulaires, annonces, courriels de travail, articles de presse et tribunes. En six niveaux, vous apprenez le vocabulaire et les stratégies de lecture de chaque niveau, de l’horaire d’ouverture (A1) à l’analyse d’un argument et de son implicite (C2), avec des questions type TEF à chaque étape.',
    ),
    outcomes: [
      b('Understand practical documents: notices, forms, ads', 'Comprendre les documents pratiques : avis, formulaires, annonces'),
      b('Read workplace emails and letters', 'Lire des courriels et des lettres de travail'),
      b('Grasp the main idea and details of press articles', 'Saisir l’idée principale et les détails d’articles de presse'),
      b('Analyse arguments, tone and implicit meaning', 'Analyser arguments, ton et implicite'),
    ],
  }),
  c({
    id: 'tef-writing', category: 'tef-quebec', ladder: true, lessonCount: 6, level: 'A1 → C2', levels: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'], minutes: 94, popular: true, offer: 'TEF Canada',
    slug: { en: 'tef-canada-writing-course', fr: 'cours-tef-canada-expression-ecrite' },
    title: b('TEF Canada Writing: A1 to C2', 'TEF Canada Expression écrite : du A1 au C2'),
    subtitle: b('From your first messages to the news story (section A) and the argued letter (section B).', 'Des premiers messages au fait divers (section A) et à la lettre argumentée (section B).'),
    description: b(
      'Learn to write in French, level by level, towards the two TEF Canada writing sections. You start with forms, notes and short messages (A1–A2), then learn to narrate an event in the past like a journalist (B1–B2, section A) and to write a letter that defends a position (B2–C1, section B), up to the precision and style of C2. Every level ends with a timed writing task and a model answer.',
      'Apprenez à écrire en français, niveau par niveau, vers les deux sections de l’expression écrite du TEF Canada. Vous commencez par des formulaires, des mots et des messages courts (A1–A2), puis apprenez à raconter un événement au passé comme un journaliste (B1–B2, section A) et à écrire une lettre qui défend une position (B2–C1, section B), jusqu’à la précision et au style du C2. Chaque niveau se termine par une rédaction chronométrée et un modèle.',
    ),
    outcomes: [
      b('Write notes, messages and simple emails', 'Écrire des mots, des messages et des courriels simples'),
      b('Narrate an event in the past, news-story style', 'Raconter un événement au passé, à la manière d’un fait divers'),
      b('Write a structured letter that argues a position', 'Écrire une lettre structurée qui défend une position'),
      b('Reach C1–C2 precision and style', 'Atteindre la précision et le style du C1–C2'),
    ],
  }),
  c({
    id: 'tef-speaking', category: 'tef-quebec', ladder: true, lessonCount: 6, level: 'A1 → C2', levels: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'], minutes: 90, popular: true, offer: 'TEF Canada / TEFAQ',
    slug: { en: 'tef-canada-speaking-course', fr: 'cours-tef-canada-expression-orale' },
    title: b('TEF Canada & TEFAQ Speaking: A1 to C2', 'TEF Canada et TEFAQ Expression orale : du A1 au C2'),
    subtitle: b('Ask for information (section A), then present and convince (section B), level by level.', 'Obtenir des informations (section A), puis présenter et convaincre (section B), niveau par niveau.'),
    description: b(
      'The TEF Canada and the TEFAQ speaking test has two sections: getting information on the phone from an ad (section A) and presenting a document to convince a friend (section B). This course builds the speaking skills behind them, level by level: introducing yourself and asking simple questions (A1–A2), polite and varied questions (B1), presenting and arguing (B2), answering objections (C1) and persuading with ease (C2).',
      'L’expression orale du TEF Canada et du TEFAQ compte deux sections : obtenir des informations au téléphone à partir d’une annonce (section A) et présenter un document pour convaincre un ami (section B). Ce cours construit, niveau par niveau, les compétences qui sont derrière : vous présenter et poser des questions simples (A1–A2), des questions polies et variées (B1), présenter et argumenter (B2), répondre aux objections (C1) et persuader avec aisance (C2).',
    ),
    outcomes: [
      b('Ask clear, polite and varied questions', 'Poser des questions claires, polies et variées'),
      b('Present a document and highlight its advantages', 'Présenter un document et en souligner les avantages'),
      b('Answer objections and convince', 'Répondre aux objections et convaincre'),
      b('Understand and use Québec everyday expressions', 'Comprendre et employer des expressions québécoises du quotidien'),
    ],
  }),
  c({
    id: 'tef-grammar', category: 'tef-quebec', ladder: true, lessonCount: 6, level: 'A1 → C2', levels: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'], minutes: 85, offer: 'TEF Canada',
    slug: { en: 'tef-canada-grammar-and-vocabulary', fr: 'cours-tef-canada-grammaire-et-vocabulaire' },
    title: b('TEF Canada Grammar & Vocabulary: A1 to C2', 'TEF Canada Grammaire et vocabulaire : du A1 au C2'),
    subtitle: b('The language of everyday and working life, from the basics to formal French.', 'La langue de la vie quotidienne et professionnelle, des bases au français soutenu.'),
    description: b(
      'The TEF Canada is full of practical and professional situations: housing, work, administration, services. This course teaches the grammar and vocabulary of those situations, level by level: questions and the present (A1), past tenses and time markers (A2), pronouns and the conditional for polite requests (B1), the subjunctive and logical connectors (B2), formal register and the passive (C1), and the precision of C2. Every rule is practised in a real-life context.',
      'Le TEF Canada est rempli de situations pratiques et professionnelles : logement, travail, démarches, services. Ce cours enseigne la grammaire et le vocabulaire de ces situations, niveau par niveau : questions et présent (A1), temps du passé et indicateurs de temps (A2), pronoms et conditionnel de politesse (B1), subjonctif et connecteurs logiques (B2), registre soutenu et passif (C1), puis la précision du C2. Chaque règle est pratiquée dans un contexte réel.',
    ),
    outcomes: [
      b('Handle the vocabulary of housing, work and services', 'Maîtriser le vocabulaire du logement, du travail et des services'),
      b('Ask questions and make polite requests correctly', 'Poser des questions et formuler des demandes polies correctement'),
      b('Use the subjunctive, connectors and the passive', 'Employer le subjonctif, les connecteurs et le passif'),
      b('Switch between everyday and formal French', 'Passer du français courant au français soutenu'),
    ],
  }),

  // ── DELF & DALF ───────────────────────────────────────────────────────────
  c({
    id: 'delf-b1', category: 'delf-dalf', level: 'B1', levels: ['B1'], minutes: 42, offer: 'DELF',
    slug: { en: 'delf-b1-preparation', fr: 'preparation-delf-b1' },
    title: b('DELF B1: Pass the 4 Papers', 'DELF B1 : réussir les 4 épreuves'),
    subtitle: b('Format, marking and the written and oral productions.', 'Format, barème, production écrite et production orale.'),
    description: b(
      'The DELF B1 proves an independent level and never expires. Understand the marking (50/100 with at least 5/25 per paper), write the 160-word essay or letter examiners expect, and prepare the three parts of the oral: interview, interaction and the monologue on a document.',
      'Le DELF B1 atteste un niveau indépendant et n’expire jamais. Comprenez le barème (50/100 avec au moins 5/25 par épreuve), rédigez l’essai ou la lettre de 160 mots qu’attendent les correcteurs et préparez les trois parties de l’oral : entretien, exercice en interaction et monologue sur un document.',
    ),
    outcomes: [
      b('Know the DELF B1 papers and marking', 'Connaître les épreuves et le barème du DELF B1'),
      b('Write a structured 160-word text', 'Rédiger un texte structuré de 160 mots'),
      b('Prepare the three parts of the oral', 'Préparer les trois parties de l’oral'),
    ],
  }),
  c({
    id: 'delf-b2', category: 'delf-dalf', level: 'B2', levels: ['B2'], minutes: 44, offer: 'DELF B2',
    slug: { en: 'delf-b2-preparation', fr: 'preparation-delf-b2' },
    title: b('DELF B2: Argue and Convince', 'DELF B2 : argumenter et convaincre'),
    subtitle: b('The argued essay, connectors and the oral defence of an opinion.', 'L’essai argumenté, les connecteurs et la défense orale d’une opinion.'),
    description: b(
      'At B2, examiners grade the structure of your thinking as much as your French. Build the plan of an argued essay (250 words), link your ideas with precise connectors, and prepare the oral where you defend a point of view from a short article, then answer the examiner’s objections.',
      'Au niveau B2, les correcteurs évaluent la structure de votre pensée autant que votre français. Construisez le plan d’un essai argumenté (250 mots), reliez vos idées avec des connecteurs précis, et préparez l’oral où vous défendez un point de vue à partir d’un court article, puis répondez aux objections de l’examinateur.',
    ),
    outcomes: [
      b('Build the plan of a 250-word argued essay', 'Construire le plan d’un essai argumenté de 250 mots'),
      b('Use precise logical connectors', 'Employer des connecteurs logiques précis'),
      b('Defend a point of view orally and answer objections', 'Défendre un point de vue à l’oral et répondre aux objections'),
    ],
  }),
  c({
    id: 'dalf-c1', category: 'delf-dalf', level: 'C1', levels: ['C1'], minutes: 43, offer: 'DALF C1',
    slug: { en: 'dalf-c1-preparation', fr: 'preparation-dalf-c1' },
    title: b('DALF C1: Synthesis and Formal Register', 'DALF C1 : synthèse et registre soutenu'),
    subtitle: b('Summarise several documents and write in a formal style.', 'Synthétiser plusieurs documents et écrire dans un style soutenu.'),
    description: b(
      'The DALF C1 asks you to work from several documents: a synthesis without personal opinion, an argued essay in a formal register, and an oral presentation followed by a debate. Learn the method of the synthesis, the vocabulary of the formal register and the reformulation techniques that C1 graders reward.',
      'Le DALF C1 vous fait travailler à partir de plusieurs documents : une synthèse sans opinion personnelle, un essai argumenté au registre soutenu, et un exposé suivi d’un débat. Apprenez la méthode de la synthèse, le vocabulaire du registre soutenu et les techniques de reformulation que valorisent les correcteurs du C1.',
    ),
    outcomes: [
      b('Write a synthesis of several documents', 'Rédiger la synthèse de plusieurs documents'),
      b('Move from a standard to a formal register', 'Passer d’un registre courant à un registre soutenu'),
      b('Reformulate without copying the sources', 'Reformuler sans recopier les sources'),
    ],
  }),

  // ── Business French ───────────────────────────────────────────────────────
  c({
    id: 'pro-emails', category: 'business', level: 'B1', levels: ['B1'], minutes: 38,
    slug: { en: 'professional-emails-in-french', fr: 'e-mails-professionnels' },
    title: b('Professional Emails & Writing', 'E-mails et écrits professionnels'),
    subtitle: b('The right formulas, the right register, every time.', 'Les bonnes formules, le bon registre, à chaque fois.'),
    description: b(
      'French business emails follow precise conventions. Learn how to open and close them, how to request, follow up and apologise politely, and how to adapt your register between a colleague and a client. You assemble real emails and compare them with models.',
      'Les e-mails professionnels en français suivent des codes précis. Apprenez à les commencer et à les terminer, à demander, relancer et vous excuser poliment, et à adapter votre registre entre un collègue et un client. Vous construisez de vrais e-mails et les comparez à des modèles.',
    ),
    outcomes: [
      b('Open and close an email with the right formulas', 'Commencer et terminer un e-mail avec les bonnes formules'),
      b('Request, follow up and apologise politely', 'Demander, relancer et vous excuser poliment'),
      b('Adapt your register to the recipient', 'Adapter votre registre au destinataire'),
    ],
  }),
  c({
    id: 'job-interview', category: 'business', level: 'B2', levels: ['B2'], minutes: 43,
    slug: { en: 'job-interview-in-french', fr: 'entretien-d-embauche-et-reunions' },
    title: b('Job Interviews & Meetings in French', 'Entretien d’embauche et réunions'),
    subtitle: b('Present your career, answer the classic questions, speak up in meetings.', 'Présenter votre parcours, répondre aux questions classiques, prendre la parole en réunion.'),
    description: b(
      'Get ready for a job interview in French and for your first meetings. Present your background and skills, answer the questions every recruiter asks (strengths, weaknesses, why us?), then take the floor, agree, disagree and rephrase in a meeting.',
      'Préparez un entretien d’embauche en français et vos premières réunions. Présentez votre parcours et vos compétences, répondez aux questions que pose tout recruteur (qualités, défauts, pourquoi nous ?), puis prenez la parole, approuvez, objectez et reformulez en réunion.',
    ),
    outcomes: [
      b('Present your background and skills', 'Présenter votre parcours et vos compétences'),
      b('Answer the classic interview questions', 'Répondre aux questions classiques d’entretien'),
      b('Take part in a meeting with confidence', 'Participer à une réunion avec assurance'),
    ],
  }),
];

export const courseById = (id: string) => COURSES.find(x => x.id === id);
export const coursesOf = (cat: CategoryId) => COURSES.filter(x => x.category === cat);
export const coursePath = (course: CourseMeta, lang: Lang) => {
  const cat = CATEGORIES.find(x => x.id === course.category)!;
  return `${categoryPath(cat, lang)}${course.slug[lang]}/`;
};
