// Level A2 — 10 elementary French dictations (~68–84 words each).
// Targets: passé composé (avoir/être), imparfait, futur proche/simple,
// pronominal verbs, core homophones (a/à, ou/où, son/sont, ces/ses, on/ont, ce/se).
import { b } from '../../types';
import type { DictationCourse } from './types';

export const A2_DICTATIONS: DictationCourse[] = [
  {
    id: 'visiter-un-appartement',
    slug: 'visiter-un-appartement',
    title: 'Visiter un appartement',
    subtitle: b(
      'Yesterday morning, Camille visited a bright two-room flat near the metro and fell in love with its balcony.',
      'Hier matin, Camille a visité un appartement lumineux près du métro avec un petit balcon.',
    ),
    level: 'A2',
    theme: b('Housing', 'Logement'),
    focus: [
      b('Passé composé (avoir & être)', 'Passé composé (avoir et être)'),
      b('Adjective agreements', 'Accords des adjectifs'),
      b('Everyday housing words', 'Vocabulaire du logement'),
    ],
    image: 'dialogue-visiter-un-appartement',
    minutes: 6,
    text: 'Hier matin, Camille est arrivée tôt devant un immeuble calme près du métro. Elle a visité un appartement clair au troisième étage. Le salon était spacieux et les grandes fenêtres donnaient sur une cour fleurie. Dans la cuisine, le propriétaire a montré des placards neufs et un petit balcon ensoleillé. Après la visite, Camille a appelé son ami pour lui dire qu’elle voulait déposer son dossier dès le soir même.',
    translation: 'Yesterday morning, Camille arrived early outside a quiet building near the metro. She visited a bright apartment on the third floor. The living room was spacious and the large windows looked onto a flower-filled courtyard. In the kitchen, the landlord showed her new cupboards and a small sunny balcony. After the visit, Camille called her friend to tell him she wanted to submit her application that very evening.',
    blanks: ['arrivée', 'immeuble', 'visité', 'troisième', 'spacieux', 'fleurie', 'propriétaire', 'ensoleillé', 'appelé', 'dossier'],
    traps: [
      { word: 'est arrivée', note: b('With être, the past participle agrees with feminine Camille → -ée.', 'Avec « être », le participe passé s’accorde avec Camille (féminin) → arrivée.') },
      { word: 'immeuble / appartement', note: b('Double m in immeuble, double p in appartement.', 'Deux m dans « immeuble » et deux p dans « appartement ».') },
      { word: 'troisième étage', note: b('Ordinal -ième always takes a grave accent è.', 'La terminaison -ième porte toujours un accent grave.') },
      { word: 'donnaient / voulait', note: b('Imparfait endings: -aient for plural fenêtres, -ait for elle.', 'À l’imparfait : -aient avec « les fenêtres », -ait avec « elle ».') },
      { word: 'a appelé', note: b('Past participle with avoir stays masculine singular; one l in appelé.', 'Avec « avoir », « appelé » ne s’accorde pas avec le sujet et ne prend qu’un seul l.') },
    ],
    rules: [
      {
        title: b('Passé composé agreement with être', 'L’accord du participe passé avec « être »'),
        body: b(
          'With auxiliary être (arriver, aller, venir, partir…), the past participle agrees in gender and number with the subject: Camille est arrivée.',
          'Avec l’auxiliaire « être », le participe passé s’accorde toujours avec le sujet : Camille est arrivée.',
        ),
        examples: [
          { fr: 'Camille est arrivée tôt.', note: b('Feminine subject → -ée.', 'Sujet féminin → arrivée.') },
        ],
      },
      {
        title: b('Ending -é vs infinitive -er', 'Choisir entre -é et -er'),
        body: b(
          'Replace the verb with vendre or vendu: elle a visité (vendu → -é), elle voulait déposer (vendre → -er).',
          'Remplacez par « vendu » ou « vendre » : elle a visité (vendu → -é), elle voulait déposer (vendre → -er).',
        ),
        examples: [
          { fr: 'Elle voulait déposer son dossier.', note: b('After vouloir, use the infinitive -er.', 'Après « voulait », on écrit l’infinitif en -er.') },
        ],
      },
    ],
  },
  {
    id: 'a-la-pharmacie',
    slug: 'a-la-pharmacie',
    title: 'Un passage à la pharmacie',
    subtitle: b(
      'Suffering from a sore throat, Romain stops by the neighbourhood pharmacy and gets clear advice.',
      'Avec un mal de gorge depuis la veille, Romain passe à la pharmacie et suit les conseils de la pharmacienne.',
    ),
    level: 'A2',
    theme: b('Health', 'Santé'),
    focus: [
      b('Homophones a vs à', 'Homophones a et à'),
      b('ph spelling [f]', 'Le son [f] écrit ph'),
      b('Passé composé', 'Passé composé'),
    ],
    image: 'dialogue-a-la-pharmacie',
    minutes: 6,
    text: 'Depuis deux jours, Romain a mal à la gorge et tousse beaucoup le soir. Ce matin, il est entré à la pharmacie de son quartier pour demander un conseil. La pharmacienne lui a posé quelques questions sur sa fièvre et lui a préparé un sirop au miel ainsi que des pastilles. Elle lui a conseillé de boire des tisanes chaudes, de bien se reposer et de consulter un médecin si la douleur ne passe pas.',
    translation: 'For two days, Romain has had a sore throat and has been coughing a lot in the evening. This morning, he went into his neighbourhood pharmacy to ask for advice. The pharmacist asked him a few questions about his fever and prepared honey syrup and lozenges for him. She advised him to drink hot herbal teas, get plenty of rest and see a doctor if the pain does not go away.',
    blanks: ['Depuis', 'gorge', 'pharmacie', 'conseil', 'fièvre', 'préparé', 'conseillé', 'tisanes', 'médecin', 'douleur'],
    traps: [
      { word: 'a mal à la gorge', note: b('a = verb avoir (had); à = preposition (to/in).', '« a » est le verbe avoir (on peut dire « avait ») ; « à » est la préposition.') },
      { word: 'pharmacie / pharmacienne', note: b('Both begin with ph; feminine -ienne doubles the n.', 'Les deux mots commencent par ph ; au féminin, « pharmacienne » prend deux n.') },
      { word: 'fièvre / médecin', note: b('Grave accent è in fièvre, acute accent é in médecin.', 'Accent grave dans « fièvre », accent aigu dans « médecin ».') },
      { word: 'quelques questions', note: b('Always plural -s on both quelques and the noun.', 'Toujours un -s à « quelques » et au nom qui suit.') },
      { word: 'sirop / conseil', note: b('Silent final -p in sirop; single -l in masculine conseil.', 'Le -p final de « sirop » est muet ; un seul l à la fin de « conseil ».') },
    ],
    rules: [
      {
        title: b('Distinguishing a and à', 'Distinguer « a » et « à »'),
        body: b(
          'Test by switching to the imperfect avait: if it works, write a without an accent (Romain a mal). Otherwise write à (à la gorge, à la pharmacie).',
          'Remplacez par « avait » : si la phrase a du sens, écrivez « a » sans accent. Sinon, écrivez « à ».',
        ),
        examples: [
          { fr: 'Romain a mal à la gorge.', note: b('a = avait (verb); à = preposition.', '« a » = avait ; « à » = préposition.') },
        ],
      },
      {
        title: b('Double consonants in feminine -ienne', 'Le doublement du n au féminin (-ienne)'),
        body: b(
          'Professions ending in -ien double the n in the feminine: un pharmacien → une pharmacienne, un musicien → une musicienne.',
          'Les noms de métiers en -ien doublent le n au féminin : un pharmacien → une pharmacienne.',
        ),
        examples: [
          { fr: 'La pharmacienne lui a conseillé du repos.', note: b('Feminine -ienne with double n.', 'Féminin en -ienne avec deux n.') },
        ],
      },
    ],
  },
  {
    id: 'le-concert-sous-la-pluie',
    slug: 'le-concert-sous-la-pluie',
    title: 'Le concert sous la pluie',
    subtitle: b(
      'An open-air summer concert is surprised by a sudden rain shower, yet everyone stays to listen.',
      'Une averse surprend un concert en plein air, mais le public reste sous les parapluies pour écouter la musique.',
    ),
    level: 'A2',
    theme: b('Going out', 'Sorties'),
    focus: [
      b('Descriptive imparfait', 'Imparfait de description'),
      b('Plural endings -aient', 'Terminaisons -aient'),
      b('Weather & scene words', 'Météo et ambiance'),
    ],
    image: 'mission-le-concert-sous-la-pluie',
    minutes: 6,
    text: 'Samedi soir, un concert gratuit avait lieu dans le parc municipal. Quand nous sommes arrivés, le ciel était gris et un vent frais soufflait dans les arbres. Soudain, une fine pluie a commencé à tomber sur la pelouse. Personne n’est parti : les spectateurs ouvraient leurs parapluies colorés et s’approchaient du kiosque éclairé. Les musiciens jouaient avec tant d’énergie que tout le public battait la mesure en souriant.',
    translation: 'On Saturday evening, a free concert was taking place in the town park. When we arrived, the sky was grey and a cool wind was blowing through the trees. Suddenly, a light rain started to fall on the lawn. Nobody left: the audience opened their colourful umbrellas and moved closer to the lit bandstand. The musicians played with so much energy that the whole crowd kept the beat with a smile.',
    blanks: ['gratuit', 'arrivés', 'soufflait', 'commencé', 'spectateurs', 'parapluies', 'kiosque', 'musiciens', 'énergie', 'souriant'],
    traps: [
      { word: 'sommes arrivés', note: b('With nous + être, past participle takes plural -s (arrivés).', 'Avec « nous sommes », le participe passé prend un -s : arrivés.') },
      { word: 'commencé', note: b('No cedilla before é; cedilla ç is only used before a, o, u.', 'Pas de cédille devant é : le c se prononce déjà [s] devant e ou i.') },
      { word: 'ouvraient / jouaient', note: b('Imparfait plural -aient is pronounced [ɛ], just like -ait.', 'À l’imparfait, -aient se prononce comme -ait mais s’écrit -aient au pluriel.') },
      { word: 'leurs parapluies colorés', note: b('Plural possessive leurs + plural noun & adjective (-s).', 'Déterminant pluriel « leurs » + -s sur le nom et l’adjectif.') },
      { word: 'en souriant', note: b('Gérondif en + -ant is always invariable.', 'Le gérondif en -ant est invariable.') },
    ],
    rules: [
      {
        title: b('Setting the scene with the imparfait', 'Décrire le décor à l’imparfait'),
        body: b(
          'Use the imparfait (-ais, -ait, -aient) for background weather and ongoing actions: le ciel était gris, le vent soufflait, les musiciens jouaient.',
          'On utilise l’imparfait pour le décor et les actions qui durent : le ciel était gris, les spectateurs ouvraient leurs parapluies.',
        ),
        examples: [
          { fr: 'Les spectateurs ouvraient leurs parapluies.', note: b('Plural subject → -aient.', 'Sujet pluriel → -aient.') },
        ],
      },
      {
        title: b('Imparfait vs passé composé in a story', 'Imparfait ou passé composé dans un récit'),
        body: b(
          'The imparfait sets the background (il faisait frais) while the passé composé marks the sudden event (la pluie a commencé).',
          'L’imparfait pose le décor et le passé composé marque l’événement soudain qui arrive.',
        ),
        examples: [
          { fr: 'Une fine pluie a commencé à tomber.', note: b('Sudden event → passé composé.', 'Événement ponctuel → passé composé.') },
        ],
      },
    ],
  },
  {
    id: 'un-diner-au-restaurant',
    slug: 'un-diner-au-restaurant',
    title: 'Un dîner au restaurant',
    subtitle: b(
      'For their anniversary, Marc and Sonia book a cosy bistro and discover local specialties.',
      'Pour leur anniversaire, Marc et Sonia réservent une table dans un bistrot et goûtent des plats régionaux.',
    ),
    level: 'A2',
    theme: b('Dining', 'Gastronomie'),
    focus: [
      b('ces vs ses', 'Homophones ces et ses'),
      b('Circumflex accents (î, ô, û)', 'Accents circonflexes (î, ô, û)'),
      b('Passé composé with nous', 'Passé composé avec nous'),
    ],
    image: 'dialogue-reserver-au-restaurant',
    minutes: 6,
    text: 'Pour fêter leur anniversaire, Marc et Sonia ont réservé une table dans un petit restaurant du centre. Le serveur les a conduits près de la cheminée et leur a apporté la carte des vins. Sonia a choisi un poisson grillé avec des légumes rôtis, tandis que Marc a goûté une soupe à l’oignon. À la fin du dîner, ils ont partagé une tarte au citron. Sonia a dit à ses amis que ces plats étaient délicieux.',
    translation: 'To celebrate their anniversary, Marc and Sonia booked a table at a small restaurant in the centre. The waiter led them near the fireplace and brought them the wine list. Sonia chose grilled fish with roasted vegetables, while Marc tasted French onion soup. At the end of dinner, they shared a lemon tart. Sonia told her friends that these dishes were delicious.',
    blanks: ['fêter', 'réservé', 'cheminée', 'poisson', 'rôtis', 'goûté', 'oignon', 'dîner', 'partagé', 'délicieux'],
    traps: [
      { word: 'fêter / rôtis / goûté / dîner', note: b('Four common dining words with circumflex accents (ê, ô, û, î).', 'Quatre mots courants de la table qui portent un accent circonflexe.') },
      { word: 'ses amis / ces plats', note: b('ses = her/his (possessive); ces = these/those (demonstrative).', '« ses » indique la possession (les siens) ; « ces » désigne quelque chose qu’on montre.') },
      { word: 'poisson / délicieux', note: b('Double s in poisson (fish) keeps the [s] sound; -eux in délicieux.', 'Deux s dans « poisson » pour garder le son [s] ; terminaison -eux dans « délicieux ».') },
      { word: 'les a conduits', note: b('Direct object les (Marc & Sonia) comes before avoir → conduits (-s).', 'Le COD « les » est placé avant le verbe : « conduits » prend un -s.') },
      { word: 'oignon', note: b('Traditional spelling oignon is pronounced [ɔɲɔ̃] (silent i).', 'Dans « oignon », le i ne se prononce pas : on dit [ɔɲɔ̃].') },
    ],
    rules: [
      {
        title: b('Choosing between ses and ces', 'Choisir entre « ses » et « ces »'),
        body: b(
          'Use ses when you can say “his/her” (ses amis = les siens). Use ces when you point to things (ces plats-là).',
          'On écrit « ses » pour la possession (ses amis = les siens) et « ces » pour montrer (ces plats-là).',
        ),
        examples: [
          { fr: 'Elle parle à ses amis de ces plats.', note: b('ses = her friends; ces = those dishes.', '« ses » = possession ; « ces » = démonstratif.') },
        ],
      },
      {
        title: b('Single s [z] vs double s [s]', 'Un s [z] ou deux s [s] entre deux voyelles'),
        body: b(
          'Between two vowels, a single s sounds like [z] (maison, cuisine). Write ss to keep the sharp [s] sound (poisson, dessert).',
          'Entre deux voyelles, un seul s se prononce [z]. Il faut deux s pour garder le son [s] : poisson, dessert.',
        ),
        examples: [
          { fr: 'Un poisson grillé et un dessert.', note: b('Double s keeps the [s] sound between vowels.', 'Deux s gardent le son [s] entre deux voyelles.') },
        ],
      },
    ],
  },
  {
    id: 'un-sac-oublie-dans-le-tram',
    slug: 'un-sac-oublie-dans-le-tram',
    title: 'Le sac oublié dans le tram',
    subtitle: b(
      'In a rush to get off the tram, Nadia leaves her tote bag behind and races to the lost-property desk.',
      'Pressée en descendant du tramway, Nadia oublie son sac et retourne vite au bureau des objets trouvés.',
    ),
    level: 'A2',
    theme: b('Transport', 'Transports'),
    focus: [
      b('Homophones ou vs où', 'Homophones ou et où'),
      b('Passé composé with être', 'Passé composé avec être'),
      b('Everyday problem solving', 'Vie pratique'),
    ],
    image: 'mission-le-sac-oublie-dans-le-tram',
    minutes: 6,
    text: 'Mardi après-midi, Nadia est descendue du tramway en courant parce qu’elle était en retard. Dix minutes plus tard, elle a remarqué que son sac n’était plus sur son épaule. Elle ne savait pas où elle l’avait oublié : sur le siège ou sur le quai ? Très inquiète, elle est retournée à la station centrale où un agent lui a souri. Un voyageur honnête venait juste de rapporter son sac avec ses clés et son portefeuille.',
    translation: 'On Tuesday afternoon, Nadia got off the tram running because she was late. Ten minutes later, she noticed that her bag was no longer on her shoulder. She did not know where she had left it: on the seat or on the platform? Very worried, she went back to the central station where a staff member smiled at her. An honest passenger had just handed in her bag with her keys and wallet.',
    blanks: ['descendue', 'retard', 'épaule', 'oublié', 'siège', 'inquiète', 'retournée', 'honnête', 'rapporter', 'portefeuille'],
    traps: [
      { word: 'où / ou', note: b('où (with accent) = where; ou (no accent) = or (ou bien).', '« où » avec accent indique le lieu ; « ou » sans accent signifie « ou bien ».') },
      { word: 'est descendue / est retournée', note: b('Both take être and agree with feminine Nadia (-e).', 'Accord au féminin avec Nadia : « descendue » et « retournée ».') },
      { word: 'siège / inquiète / honnête', note: b('Watch the accents: è in siège and inquiète, ê in honnête (plus silent h).', 'Attention aux accents : è dans « siège » et « inquiète », ê et h muet dans « honnête ».') },
      { word: 'lui a souri', note: b('Past participle of sourire is souri (no final -t).', 'Le participe passé de « sourire » est « souri » (sans -t final).') },
      { word: 'portefeuille', note: b('One single compound word without a hyphen.', 'Mot composé soudé en un seul mot : « portefeuille ».') },
    ],
    rules: [
      {
        title: b('Never confuse ou and où', 'Ne pas confondre « ou » et « où »'),
        body: b(
          'Try replacing the word with “ou bien” (or else). If it fits, write ou without an accent. For a place or time, always write où.',
          'Si l’on peut dire « ou bien », on écrit « ou » sans accent. Pour un lieu ou un moment, on écrit « où ».',
        ),
        examples: [
          { fr: 'Sur le siège ou sur le quai ?', note: b('Choice (or) → ou without accent.', 'Choix (ou bien) → « ou » sans accent.') },
          { fr: 'La station où elle est retournée.', note: b('Place (where) → où with grave accent.', 'Lieu → « où » avec accent grave.') },
        ],
      },
      {
        title: b('Silent h in honnête', 'Le h muet dans « honnête »'),
        body: b(
          'Un voyageur honnête: the h is silent and never pronounced, and the double n precedes the circumflex ê.',
          'Dans « honnête », le h initial est muet, suivi de deux n et d’un accent circonflexe sur le ê.',
        ),
        examples: [
          { fr: 'Un voyageur honnête a rapporté le sac.', note: b('h + nn + ê in honnête.', 'h muet, deux n et ê dans « honnête ».') },
        ],
      },
    ],
  },
  {
    id: 'les-crepes-du-dimanche',
    slug: 'les-crepes-du-dimanche',
    title: 'Les crêpes du dimanche',
    subtitle: b(
      'When it rains on Sunday afternoon, the children and their parents make warm crêpes in the kitchen.',
      'Quand il pleut le dimanche après-midi, parents et enfants préparent une pile de crêpes dans la cuisine.',
    ),
    level: 'A2',
    theme: b('Cooking', 'Cuisine'),
    focus: [
      b('Homophones on vs ont', 'Homophones on et ont'),
      b('Quantities & ingredients', 'Quantités et ingrédients'),
      b('Accents & oeufs', 'Accents et œufs'),
    ],
    image: 'text-crepes',
    minutes: 6,
    text: 'Chaque hiver, quand il pleut le dimanche après-midi, on prépare des crêpes à la maison. Les enfants ont sorti un grand saladier, de la farine, du lait et quatre œufs frais. Pendant qu’on mélange doucement la pâte pour éviter les grumeaux, la poêle chauffe sur le feu avec un peu de beurre. Bientôt, une odeur sucrée envahit toute la pièce. Les enfants ont hâte de goûter la première crêpe au chocolat chaud.',
    translation: 'Every winter, when it rains on Sunday afternoon, we make crêpes at home. The children have taken out a big mixing bowl, flour, milk and four fresh eggs. While we gently mix the batter to avoid lumps, the frying pan heats on the stove with a little butter. Soon, a sweet smell fills the whole room. The children cannot wait to taste the first crêpe with warm chocolate.',
    blanks: ['hiver', 'crêpes', 'saladier', 'œufs', 'mélange', 'pâte', 'poêle', 'Bientôt', 'pièce', 'première'],
    traps: [
      { word: 'on prépare / les enfants ont sorti', note: b('on = subject pronoun (we/one); ont = verb avoir (they have).', '« on » est un pronom sujet (comme « il ») ; « ont » est le verbe avoir (on peut dire « avaient »).') },
      { word: 'quatre œufs', note: b('Ligature œ and plural -s (in the plural, the f is silent: [ø]).', 'Ligature œ et -s du pluriel : au pluriel, le f de « œufs » ne se prononce pas.') },
      { word: 'pâte / poêle / crêpes / hâte', note: b('Circumflex accents on pâte, poêle, crêpes, bientôt and hâte.', 'Plusieurs mots de cuisine portent un accent circonflexe : crêpes, pâte, poêle, hâte.') },
      { word: 'un peu de beurre', note: b('Un peu (a little) never takes -x; double r in beurre.', '« Un peu » ne prend jamais de -x ; deux r dans « beurre ».') },
      { word: 'chocolat chaud', note: b('Silent -t in chocolat and silent -d in chaud.', 'Le -t de « chocolat » et le -d de « chaud » sont muets.') },
    ],
    rules: [
      {
        title: b('Distinguishing on and ont', 'Distinguer « on » et « ont »'),
        body: b(
          'Replace with il (if it works → on) or avaient (if it works → ont). On prépare (il prépare); les enfants ont sorti (avaient sorti).',
          'Remplacez par « il » (→ on) ou par « avaient » (→ ont) : on prépare / les enfants ont sorti.',
        ),
        examples: [
          { fr: 'On prépare des crêpes et les enfants ont faim.', note: b('on = il; ont = avaient.', '« on » = pronom sujet ; « ont » = verbe avoir.') },
        ],
      },
      {
        title: b('The circumflex accent on common nouns', 'L’accent circonflexe sur les mots du quotidien'),
        body: b(
          'In French cooking, several key nouns keep a circumflex accent: une crêpe, la pâte, la poêle, bientôt.',
          'Dans le vocabulaire quotidien, pensez à l’accent circonflexe : crêpe, pâte, poêle, bientôt.',
        ),
        examples: [
          { fr: 'La pâte cuit dans la poêle.', note: b('Both pâte and poêle carry a circumflex.', 'Accent circonflexe sur « pâte » et « poêle ».') },
        ],
      },
    ],
  },
  {
    id: 'une-carte-de-marseille',
    slug: 'une-carte-de-marseille',
    title: 'Une carte postale de Marseille',
    subtitle: b(
      'Writing from sunny Marseille, Thomas tells his sister about the Old Port and his plans for tomorrow.',
      'Depuis Marseille, Thomas écrit à sa sœur : le Vieux-Port, le soleil et son programme de demain.',
    ),
    level: 'A2',
    theme: b('Travel', 'Voyages'),
    focus: [
      b('Simple future (futur simple)', 'Futur simple'),
      b('Homophones son vs sont', 'Homophones son et sont'),
      b('Travel & sea vocabulary', 'Vocabulaire des vacances'),
    ],
    image: 'text-postcard-marseille',
    minutes: 6,
    text: 'Chère Léa, je t’écris de Marseille où nous passons des vacances magnifiques. Les rues du vieux quartier sont animées et le ciel est d’un bleu éclatant. Ce matin, nous avons visité le port avec son marché aux poissons. Demain, nous prendrons un petit bateau pour découvrir les calanques et nous mangerons sur la plage. Je rapporterai du savon de Marseille pour maman et nous rentrerons dimanche soir. Je t’embrasse bien fort.',
    translation: 'Dear Léa, I am writing to you from Marseille where we are spending a wonderful holiday. The streets of the old neighbourhood are lively and the sky is bright blue. This morning, we visited the harbour with its fish market. Tomorrow, we will take a little boat to discover the coves and we will eat on the beach. I will bring back Marseille soap for mum and we will come back Sunday evening. Lots of love.',
    blanks: ['Chère', 'vacances', 'magnifiques', 'animées', 'éclatant', 'prendrons', 'bateau', 'mangerons', 'rapporterai', 'rentrerons'],
    traps: [
      { word: 'sont animées / son marché', note: b('sont = verb être (they are); son = possessive (its/his).', '« sont » est le verbe être (étaient) ; « son » est un déterminant possessif.') },
      { word: 'Chère Léa', note: b('Feminine of cher takes grave accent è and final -e: chère.', 'Au féminin, « cher » devient « chère » avec un accent grave.') },
      { word: 'vacances magnifiques', note: b('Vacances is always feminine plural in French.', '« Vacances » est toujours féminin pluriel en français.') },
      { word: 'prendrons / mangerons / rapporterai', note: b('Future endings: -ai with je, -ons with nous (keep the -e- in mangerons!).', 'Au futur : -ai avec « je », -ons avec « nous » (gardez le e dans « mangerons »).') },
      { word: 'marché aux poissons', note: b('Plural aux + poissons (double s + plural -s).', '« aux » + « poissons » au pluriel (deux s et un -s final).') },
    ],
    rules: [
      {
        title: b('Distinguishing son and sont', 'Distinguer « son » et « sont »'),
        body: b(
          'Replace with étaient: if it makes sense, write sont (les rues sont animées). Before a noun, write son (son marché).',
          'Remplacez par « étaient » : si cela fonctionne, écrivez « sont ». Devant un nom, écrivez « son ».',
        ),
        examples: [
          { fr: 'Les rues sont animées près de son port.', note: b('sont = étaient; son = its/his.', '« sont » = verbe être ; « son » = possessif.') },
        ],
      },
      {
        title: b('Future tense endings (-ai, -ons)', 'Les terminaisons du futur simple'),
        body: b(
          'In the simple future, je always ends in -ai (never -ais!) and nous ends in -ons: je rapporterai, nous prendrons, nous mangerons.',
          'Au futur simple, « je » prend toujours -ai (jamais -ais) et « nous » prend -ons.',
        ),
        examples: [
          { fr: 'Demain, nous prendrons le bateau.', note: b('Simple future with nous → -rons.', 'Futur simple avec « nous » → -rons.') },
        ],
      },
    ],
  },
  {
    id: 'atelier-dessin-du-samedi',
    slug: 'atelier-dessin-du-samedi',
    title: 'L’atelier de dessin',
    subtitle: b(
      'On Saturday afternoon, Sami joins a neighbourhood drawing class for the first time and finds his rhythm.',
      'Le samedi après-midi, Sami découvre un atelier de dessin de quartier et apprend à esquisser un paysage.',
    ),
    level: 'A2',
    theme: b('Hobbies', 'Loisirs'),
    focus: [
      b('Homophones ce vs se', 'Homophones ce et se'),
      b('Pronominal verbs', 'Verbes pronominaux'),
      b('Art & studio words', 'Vocabulaire artistique'),
    ],
    image: 'mission-atelier-dessin-du-samedi',
    minutes: 6,
    text: 'Ce samedi, Sami se rend pour la première fois à l’atelier de dessin de son quartier. Dans cette salle lumineuse, chaque élève s’installe devant un chevalet en bois avec un carnet et des crayons gris. Au début, Sami se demande s’il va réussir, mais la professeure se montre très patiente. Elle explique comment observer la lumière et les ombres. Peu à peu, il se détend et dessine un arbre dont il est vraiment fier.',
    translation: 'This Saturday, Sami is going for the first time to his neighbourhood drawing workshop. In this bright room, each student sets up in front of a wooden easel with a sketchbook and grey pencils. At first, Sami wonders if he will succeed, but the teacher is very patient. She explains how to observe light and shadows. Little by little, he relaxes and draws a tree he is truly proud of.',
    blanks: ['samedi', 'lumineuse', 'élève', 'chevalet', 'crayons', 'réussir', 'patiente', 'lumière', 'détend', 'vraiment'],
    traps: [
      { word: 'Ce samedi / se rend / se demande', note: b('ce goes before a noun (ce samedi); se goes before a verb (se rend, se détend).', '« ce » se place devant un nom ; « se » se place devant un verbe pronominal.') },
      { word: 'cette salle lumineuse', note: b('Demonstrative cette (double t) + feminine adjective -euse.', 'Déterminant féminin « cette » (deux t) + adjectif en -euse.') },
      { word: 'élève / lumière', note: b('Notice é then è in élève; grave accent è in lumière.', 'Accent aigu puis grave dans « élève » ; accent grave dans « lumière ».') },
      { word: 'se rend / se détend', note: b('Both -dre verbs keep their silent final -d with il/elle.', 'Les verbes en -dre gardent leur -d final muet à la 3e personne.') },
      { word: 'vraiment', note: b('Adverb from vrai adds -ment directly (no -e).', 'L’adverbe « vraiment » se forme sans -e après « vrai ».') },
    ],
    rules: [
      {
        title: b('Choosing between ce and se', 'Choisir entre « ce » et « se »'),
        body: b(
          'Use ce before a masculine noun (ce samedi, ce carnet). Use se right before a verb (il se rend, il se détend).',
          'Devant un nom masculin, écrivez « ce ». Devant un verbe pronominal, écrivez « se ».',
        ),
        examples: [
          { fr: 'Ce samedi, il se détend à l’atelier.', note: b('ce + noun; se + verb.', '« ce » + nom ; « se » + verbe.') },
        ],
      },
      {
        title: b('Feminine adjectives ending in -euse', 'Le féminin en -euse (-eux → -euse)'),
        body: b(
          'Adjectives ending in -eux change to -euse in the feminine: lumineux → lumineuse, heureux → heureuse.',
          'Les adjectifs en -eux deviennent -euse au féminin : une salle lumineuse.',
        ),
        examples: [
          { fr: 'Une salle très lumineuse.', note: b('Feminine salle → lumineuse.', 'Féminin → lumineuse.') },
        ],
      },
    ],
  },
  {
    id: 'un-week-end-en-ville',
    slug: 'un-week-end-en-ville',
    title: 'Un week-end en ville',
    subtitle: b(
      'Two friends explore a new city on foot, from historic squares and local bookshops to evening lights.',
      'Deux amis explorent une nouvelle ville à pied, entre vieilles places, librairies locales et lumières du soir.',
    ),
    level: 'A2',
    theme: b('City life', 'Vie urbaine'),
    focus: [
      b('Irregular adjectives (beau, vieux)', 'Adjectifs (beau, vieux, nouveau)'),
      b('Plurals in -aux', 'Pluriels en -aux'),
      b('Accents & hyphens', 'Accents et traits d’union'),
    ],
    image: 'listen-ce-week-end-en-ville',
    minutes: 6,
    text: 'Pour ce long week-end, Inès et Hugo découvrent une nouvelle ville à pied. Ils traversent un vieux pont de pierre puis flânent sur les grands boulevards animés. Dans les petites rues, ils visitent deux musées régionaux et entrent dans une belle librairie ancienne. À midi, ils déjeunent dans un bistrot où le chef prépare des plats locaux. Le soir venu, les façades éclairées donnent à la place centrale un air de fête.',
    translation: 'For this long weekend, Inès and Hugo are discovering a new city on foot. They cross an old stone bridge then stroll along the wide lively boulevards. In the narrow streets, they visit two regional museums and step into a beautiful old bookshop. At noon, they have lunch in a bistro where the chef prepares local dishes. When evening comes, the lit facades give the central square a festive air.',
    blanks: ['découvrent', 'nouvelle', 'traversent', 'flânent', 'musées', 'régionaux', 'ancienne', 'déjeunent', 'locaux', 'façades'],
    traps: [
      { word: 'une nouvelle ville / une belle librairie', note: b('Irregular feminines: nouveau → nouvelle, beau → belle, ancien → ancienne.', 'Féminins à double consonne : nouvelle, belle, ancienne.') },
      { word: 'régionaux / locaux', note: b('Adjectives in -al become -aux in the masculine plural.', 'Les adjectifs en -al font leur pluriel masculin en -aux.') },
      { word: 'flânent / fête', note: b('Circumflex accents â in flânent and ê in fête.', 'Accent circonflexe sur « flânent » (â) et « fête » (ê).') },
      { word: 'façades éclairées', note: b('Cedilla ç before a in façades; feminine plural -ées on éclairées.', 'Cédille sur le ç devant a, et accord féminin pluriel sur « éclairées ».') },
      { word: 'musées', note: b('Musée is masculine even though it ends in -ée (deux musées).', 'Attention : « un musée » est masculin malgré sa terminaison en -ée.') },
    ],
    rules: [
      {
        title: b('Masculine plural -al → -aux', 'Le pluriel des mots en -al → -aux'),
        body: b(
          'Most masculine nouns and adjectives ending in -al form their plural in -aux: un plat local → des plats locaux, un musée régional → des musées régionaux.',
          'La plupart des mots en -al font leur pluriel en -aux : local → locaux, régional → régionaux.',
        ),
        examples: [
          { fr: 'Des plats locaux et des musées régionaux.', note: b('-al changes to -aux in the masculine plural.', '-al devient -aux au masculin pluriel.') },
        ],
      },
      {
        title: b('Feminine double-consonant adjectives', 'Les adjectifs qui doublent la consonne au féminin'),
        body: b(
          'Watch beau → belle, nouveau → nouvelle, ancien → ancienne before feminine nouns.',
          'Pensez à doubler la consonne au féminin : belle, nouvelle, ancienne.',
        ),
        examples: [
          { fr: 'Une belle librairie ancienne.', note: b('Both adjectives double their consonant.', 'Double consonne sur « belle » et « ancienne ».') },
        ],
      },
    ],
  },
  {
    id: 'la-visite-du-chateau',
    slug: 'la-visite-du-chateau',
    title: 'La visite du château',
    subtitle: b(
      'A guided tour through a hillside castle, its tapestries, stone staircase and forest view.',
      'Une visite guidée dans un château entouré de forêts, entre tapisseries anciennes et escalier de pierre.',
    ),
    level: 'A2',
    theme: b('Heritage', 'Patrimoine'),
    focus: [
      b('Circumflex accents (â, ê, î)', 'Accents circonflexes (â, ê, î)'),
      b('Imparfait vs passé composé', 'Imparfait et passé composé'),
      b('Silent letters & plurals', 'Lettres muettes et pluriels'),
    ],
    image: 'listen-la-visite-du-chateau',
    minutes: 7,
    text: 'Dimanche dernier, notre groupe a visité un château célèbre entouré d’une grande forêt. La guide nous a raconté l’histoire de ses anciens habitants pendant que nous montions un large escalier en pierre. Dans la salle principale, de magnifiques tapisseries couvraient les murs et une haute fenêtre donnait sur toute la vallée. Avant de repartir, nous avons pris plusieurs photos dans les jardins silencieux où l’automne colorait déjà les feuilles.',
    translation: 'Last Sunday, our group visited a famous castle surrounded by a large forest. The guide told us the story of its former inhabitants while we climbed a wide stone staircase. In the main hall, magnificent tapestries covered the walls and a tall window overlooked the whole valley. Before leaving, we took several photos in the quiet gardens where autumn was already colouring the leaves.',
    blanks: ['château', 'célèbre', 'forêt', 'raconté', 'escalier', 'tapisseries', 'fenêtre', 'vallée', 'plusieurs', 'feuilles'],
    traps: [
      { word: 'château / forêt / fenêtre', note: b('Three classic heritage words with circumflex accents (â, ê).', 'Trois mots classiques avec accent circonflexe : château, forêt, fenêtre.') },
      { word: 'célèbre', note: b('Acute é first, then grave è: célèbre.', 'D’abord un accent aigu é, puis un accent grave è : « célèbre ».') },
      { word: 'montions', note: b('Imparfait with nous ends in -ions (always keep the i!).', 'À l’imparfait avec « nous », n’oubliez pas le i : « montions ».') },
      { word: 'plusieurs photos', note: b('Plusieurs always ends in -s and takes a plural noun.', '« Plusieurs » prend toujours un -s et entraîne le pluriel.') },
      { word: 'silencieux / feuilles', note: b('Same form in singular/plural for -eux; -euill- in feuilles.', '« Silencieux » ne change pas au pluriel ; attention à -euill- dans « feuilles ».') },
    ],
    rules: [
      {
        title: b('The circumflex accent as a historical clue', 'L’accent circonflexe (trace d’un ancien s)'),
        body: b(
          'Often the circumflex marks an old s still visible in English: château (castle), forêt (forest), fenêtre (fenestra), fête (feast).',
          'Souvent, l’accent circonflexe rappelle un ancien s (cf. forestier, fenestration) : forêt, château, fenêtre.',
        ),
        examples: [
          { fr: 'Un château au milieu de la forêt.', note: b('château (â) and forêt (ê).', 'Accent circonflexe sur « château » et « forêt ».') },
        ],
      },
      {
        title: b('Imparfait -ions with nous', 'La terminaison -ions à l’imparfait'),
        body: b(
          'In the imparfait, nous always takes -ions (nous montions, nous visitions) to distinguish it clearly from the present tense (nous montons).',
          'À l’imparfait, on écrit toujours -ions avec « nous » pour le distinguer du présent.',
        ),
        examples: [
          { fr: 'Nous montions un large escalier.', note: b('Imparfait nous → -ions.', 'Imparfait avec « nous » → -ions.') },
        ],
      },
    ],
  },
];
