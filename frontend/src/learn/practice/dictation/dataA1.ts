// Level A1 — 6 beginner French dictations (43–78 words, progressive difficulty).
import { b } from '../../types';
import type { DictationCourse } from './types';

export const A1_DICTATIONS: DictationCourse[] = [
  {
    id: 'un-cafe-en-terrasse',
    slug: 'un-cafe-en-terrasse',
    title: 'Un café en terrasse',
    subtitle: b(
      'Julie enjoys a sunny morning coffee and croissant on a quiet café terrace.',
      'Julie profite d’un café et d’un croissant au soleil sur la terrasse de sa rue.',
    ),
    level: 'A1',
    theme: b('Daily life', 'Vie quotidienne'),
    focus: [
      b('Acute accent é', 'Accent aigu é'),
      b('Silent final letters', 'Lettres finales muettes'),
      b('Simple present', 'Présent simple'),
    ],
    image: 'text-cafe-terrace',
    minutes: 4,
    text: 'Le matin, Julie va au café de sa rue. Il fait beau et le soleil brille. Elle prend une petite table sur la terrasse. Le serveur arrive avec un café chaud, un jus d’orange et un croissant. Julie sourit et lit un livre.',
    translation: 'In the morning, Julie goes to the café on her street. The weather is nice and the sun is shining. She takes a small table on the terrace. The waiter arrives with a hot coffee, an orange juice and a croissant. Julie smiles and reads a book.',
    blanks: ['matin', 'café', 'soleil', 'petite', 'terrasse', 'chaud', 'croissant', 'livre'],
    traps: [
      {
        word: 'café',
        note: b('Acute accent é gives the clear [e] sound at the end.', 'L’accent aigu sur le é donne le son [e] à la fin du mot.'),
      },
      {
        word: 'fait / prend / sourit / lit',
        note: b('Present-tense verbs with il/elle often end in a silent -t or -d.', 'Au présent avec il ou elle, la lettre finale (-t ou -d) est souvent muette.'),
      },
      {
        word: 'une petite table',
        note: b('Table is feminine, so petit takes -e (petite) and you hear the t.', '« Table » est féminin : on ajoute un -e à « petite » et on entend le t.'),
      },
      {
        word: 'terrasse / arrive',
        note: b('Double r in both terrasse and arrive.', 'Deux r dans « terrasse » et dans « arrive ».'),
      },
      {
        word: 'chaud / jus',
        note: b('Silent final -d in chaud (think chaude) and silent -s in jus.', 'Le -d de « chaud » (pensez à « chaude ») et le -s de « jus » sont muets.'),
      },
    ],
    rules: [
      {
        title: b('The acute accent é', 'L’accent aigu (é)'),
        body: b(
          'At the end of a French word, an e without an accent is usually silent (rue, table, livre). With an acute accent (é), it is pronounced clearly like in café.',
          'À la fin d’un mot, un e sans accent est presque toujours muet (rue, table, livre). Avec un accent aigu (é), il se prononce clairement, comme dans café.',
        ),
        examples: [
          { fr: 'Un café chaud.', note: b('Clear é sound at the end of café.', 'Son [e] clair à la fin de « café ».') },
          { fr: 'Julie va au café.', note: b('Contrast silent -e in Julie with é in café.', 'Comparez le -e muet de « Julie » et le é de « café ».') },
        ],
      },
      {
        title: b('Silent final letters in A1 verbs', 'Les lettres finales muettes des verbes'),
        body: b(
          'With il or elle in the present tense, many everyday verbs end in a silent -t or -d: il fait, elle prend, elle sourit, elle lit.',
          'Avec il ou elle au présent, beaucoup de verbes courants finissent par un -t ou un -d muet : il fait, elle prend, elle sourit, elle lit.',
        ),
        examples: [
          { fr: 'Il fait beau.', note: b('Silent -t at the end of fait.', 'Le -t final de « fait » ne se prononce pas.') },
          { fr: 'Elle prend un croissant.', note: b('Silent -d in prend and silent -t in croissant.', 'Le -d de « prend » et le -t de « croissant » sont muets.') },
        ],
      },
    ],
  },
  {
    id: 'le-petit-dejeuner-en-famille',
    slug: 'le-petit-dejeuner-en-famille',
    title: 'Le petit-déjeuner en famille',
    subtitle: b(
      'At eight o’clock, the whole family gathers in the bright kitchen for breakfast.',
      'À huit heures, toute la famille se retrouve dans la grande cuisine pour le petit-déjeuner.',
    ),
    level: 'A1',
    theme: b('Family', 'Famille'),
    focus: [
      b('est vs et', 'est ou et'),
      b('Silent h & plurals', 'h muet et pluriels'),
      b('être & avoir', 'Verbes être et avoir'),
    ],
    image: 'course-everyday-life',
    minutes: 4,
    text: 'Il est huit heures. La famille est dans la grande cuisine. Sur la table, il y a du pain, du beurre et des fruits frais. Papa verse un verre de jus d’orange. Léo a faim et il rit avec sa maman. Tout le monde est content.',
    translation: 'It is eight o’clock. The family is in the big kitchen. On the table, there is bread, butter and fresh fruit. Dad pours a glass of orange juice. Léo is hungry and laughs with his mum. Everyone is happy.',
    blanks: ['heures', 'famille', 'grande', 'cuisine', 'pain', 'fruits', 'verre', 'content'],
    traps: [
      {
        word: 'est / et',
        note: b('est is the verb être (is); et means and.', '« est » est le verbe être ; « et » sert à relier deux mots (comme « et aussi »).'),
      },
      {
        word: 'huit heures',
        note: b('Silent h in both words, plus plural -s on heures after huit.', 'Un h muet au début des deux mots, et un -s à « heures » après huit.'),
      },
      {
        word: 'la grande cuisine',
        note: b('Cuisine is feminine → grande ends in -e.', '« Cuisine » est féminin : « grande » prend un -e.'),
      },
      {
        word: 'des fruits frais',
        note: b('Plural -s on fruits; frais already ends in -s even in the singular.', 'Un -s du pluriel à « fruits » ; « frais » garde son -s au singulier comme au pluriel.'),
      },
      {
        word: 'verse / verre',
        note: b('One r in the verb verse (pours), double r in the noun verre (glass).', 'Un seul r pour le verbe « verse », deux r pour le nom « un verre ».'),
      },
    ],
    rules: [
      {
        title: b('Never mix up est and et', 'Ne pas confondre « est » et « et »'),
        body: b(
          'They sound almost identical to beginners, but est is the verb être (replace with était to test) while et links two ideas (and).',
          '« est » est le verbe être (on peut dire « était ») ; « et » relie deux éléments (on peut dire « et aussi »).',
        ),
        examples: [
          { fr: 'La famille est dans la cuisine.', note: b('est = verb être (is).', '« est » = verbe être.') },
          { fr: 'Du pain et du beurre.', note: b('et = and.', '« et » relie deux aliments.') },
        ],
      },
      {
        title: b('Telling the time: silent h and plural -s', 'Dire l’heure : h muet et -s au pluriel'),
        body: b(
          'Heure always begins with a silent h, and takes a silent -s from 2 o’clock onwards: une heure, huit heures.',
          '« Heure » commence toujours par un h muet et prend un -s dès 2 heures : une heure, huit heures.',
        ),
        examples: [
          { fr: 'Il est huit heures.', note: b('Silent h in huit and heures, plural -s on heures.', 'h muet et -s du pluriel à « heures ».') },
          { fr: 'Des fruits frais.', note: b('Plural determiner des adds silent -s to fruits.', 'Après « des », on met un -s à « fruits ».') },
        ],
      },
    ],
  },
  {
    id: 'un-pique-nique-au-parc',
    slug: 'un-pique-nique-au-parc',
    title: 'Un pique-nique au parc',
    subtitle: b(
      'Emma and Lucas walk in the park on Sunday and share a simple picnic on a bench.',
      'Dimanche, Emma et Lucas se promènent au parc et partagent un pique-nique sur un banc.',
    ),
    level: 'A1',
    theme: b('Leisure', 'Loisirs'),
    focus: [
      b('Silent -ent verb ending', 'Terminaison -ent (ils)'),
      b('Plurals (-s, -x)', 'Pluriels (-s, -x)'),
      b('Silent consonants', 'Consonnes muettes'),
    ],
    image: 'text-un-pique-nique-pour-deux',
    minutes: 4,
    text: 'C’est dimanche. Emma et Lucas marchent dans le grand parc près du pont. Ils posent leur sac sur un banc en bois. Dans le sac, il y a deux pommes rouges, du bon pain et une bouteille de limonade. Ils mangent au soleil et regardent les oiseaux.',
    translation: 'It is Sunday. Emma and Lucas walk in the big park near the bridge. They put their bag on a wooden bench. In the bag, there are two red apples, good bread and a bottle of lemonade. They eat in the sun and watch the birds.',
    blanks: ['dimanche', 'marchent', 'grand', 'banc', 'pommes', 'rouges', 'mangent', 'oiseaux'],
    traps: [
      {
        word: 'marchent / posent / mangent / regardent',
        note: b('With ils/elles, regular verbs end in -ent, which is completely silent.', 'Avec « ils » ou « elles », la terminaison -ent ne se prononce jamais.'),
      },
      {
        word: 'grand / pont / banc / bois',
        note: b('Four everyday nouns/adjectives with a silent final letter (-d, -t, -c, -s).', 'Quatre mots très courants avec une lettre finale muette (-d, -t, -c, -s).'),
      },
      {
        word: 'près',
        note: b('Grave accent è and silent final -s in près (near).', 'Accent grave sur le è et -s final muet dans « près ».'),
      },
      {
        word: 'deux pommes rouges',
        note: b('Both the noun (pommes) and the colour (rouges) take a silent plural -s.', 'Le nom « pommes » et l’adjectif « rouges » prennent tous les deux un -s.'),
      },
      {
        word: 'les oiseaux',
        note: b('Nouns ending in -eau form their plural with -x (un oiseau → des oiseaux).', 'Les noms en -eau prennent un -x au pluriel : un oiseau → des oiseaux.'),
      },
    ],
    rules: [
      {
        title: b('The silent -ent with ils / elles', 'Le -ent muet avec « ils / elles »'),
        body: b(
          'Even though il marche and ils marchent sound identical, always write -ent when the subject is plural (Emma et Lucas, ils, elles).',
          'Même si « il marche » et « ils marchent » se prononcent pareil, on écrit toujours -ent quand le sujet est au pluriel.',
        ),
        examples: [
          { fr: 'Ils marchent dans le parc.', note: b('Plural subject ils → marchent (-ent).', 'Sujet pluriel « ils » → marchent (-ent).') },
          { fr: 'Ils regardent les oiseaux.', note: b('Silent -ent on regardent.', 'Le -ent de « regardent » est muet.') },
        ],
      },
      {
        title: b('Basic plurals: -s and -x', 'Les pluriels simples en -s et en -x'),
        body: b(
          'Most French nouns and adjectives add -s in the plural (deux pommes rouges). Words ending in -eau add -x instead (des oiseaux).',
          'La plupart des mots prennent un -s au pluriel (deux pommes rouges). Les mots en -eau prennent un -x (des oiseaux).',
        ),
        examples: [
          { fr: 'Deux pommes rouges.', note: b('Both noun and adjective take -s.', 'Accord au pluriel sur les deux mots.') },
          { fr: 'Un oiseau, des oiseaux.', note: b('-eau becomes -eaux in the plural.', '-eau devient -eaux au pluriel.') },
        ],
      },
    ],
  },
  {
    id: 'les-courses-au-marche',
    slug: 'les-courses-au-marche',
    title: 'Les courses au marché',
    subtitle: b(
      'On Thursday morning, Sarah buys fresh pears, green apples and a baguette at the market.',
      'Le jeudi matin, Sarah achète des poires, des pommes vertes et une baguette au marché.',
    ),
    level: 'A1',
    theme: b('Shopping', 'Courses'),
    focus: [
      b('Accents é vs è', 'Accents é et è'),
      b('Numbers & colours', 'Nombres et couleurs'),
      b('Feminine plural -es', 'Féminin pluriel -es'),
    ],
    image: 'mission-un-gouter-au-marche',
    minutes: 5,
    text: 'Le jeudi matin, Sarah va au marché avec son grand sac en tissu. Elle achète deux poires jaunes, quatre pommes vertes et une petite baguette. Elle dit bonjour à la vendeuse et paie six euros. Sarah rentre à la maison pour préparer le repas avec ses amis.',
    translation: 'On Thursday morning, Sarah goes to the market with her big cloth bag. She buys two yellow pears, four green apples and a small baguette. She says hello to the shopkeeper and pays six euros. Sarah goes home to prepare the meal with her friends.',
    blanks: ['jeudi', 'marché', 'achète', 'jaunes', 'vertes', 'vendeuse', 'maison', 'amis'],
    traps: [
      {
        word: 'marché / préparer',
        note: b('Acute accent é in both marché and préparer.', 'Accent aigu sur le é dans « marché » et « préparer ».'),
      },
      {
        word: 'elle achète',
        note: b('Grave accent è opens the vowel sound [ɛ] in achète.', 'Accent grave sur le è pour le son ouvert [ɛ] dans « achète ».'),
      },
      {
        word: 'poires jaunes / pommes vertes',
        note: b('Both fruits are feminine plural: jaunes (-s) and vertes (-e + -s).', 'Deux noms féminins pluriels : « jaunes » (-s) et « vertes » (-es).'),
      },
      {
        word: 'à la vendeuse / à la maison',
        note: b('Always put a grave accent on the preposition à.', 'La préposition « à » prend toujours un accent grave.'),
      },
      {
        word: 'six euros / ses amis',
        note: b('Liaison [z] is heard before a vowel, and both nouns take plural -s.', 'On entend la liaison [z] devant la voyelle et on met un -s au pluriel.'),
      },
    ],
    rules: [
      {
        title: b('Acute é vs grave è', 'Accent aigu (é) ou accent grave (è)'),
        body: b(
          'Use é for the closed sound (marché, préparer) and è for the open sound before a silent -e (elle achète).',
          'On écrit é pour le son fermé (marché, préparer) et è pour le son ouvert devant un -e muet (elle achète).',
        ),
        examples: [
          { fr: 'Sarah va au marché.', note: b('Closed [e] sound → é.', 'Son [e] fermé → é.') },
          { fr: 'Elle achète des poires.', note: b('Open [ɛ] sound before -te → è.', 'Son [ɛ] ouvert devant -te → è.') },
        ],
      },
      {
        title: b('Feminine plural colours', 'Les couleurs au féminin pluriel'),
        body: b(
          'With feminine plural nouns (poires, pommes), add -e if needed and then -s: vert → vertes; jaune already ends in -e → jaunes.',
          'Avec un nom féminin pluriel (poires, pommes), on ajoute -e puis -s : vert → vertes ; jaune finit déjà par -e → jaunes.',
        ),
        examples: [
          { fr: 'Quatre pommes vertes.', note: b('Feminine + plural: -e + -s → vertes.', 'Féminin + pluriel : -e + -s → vertes.') },
          { fr: 'Deux poires jaunes.', note: b('Jaune already has -e, so just add -s.', '« Jaune » a déjà un -e : on ajoute seulement -s.') },
        ],
      },
    ],
  },
  {
    id: 'le-depart-a-la-gare',
    slug: 'le-depart-a-la-gare',
    title: 'Le départ à la gare',
    subtitle: b(
      'Karim arrives at the station for a weekend trip, picks up his ticket and boards his train.',
      'Karim arrive à la gare pour le week-end, récupère son billet et monte dans son train.',
    ),
    level: 'A1',
    theme: b('Travel', 'Transports'),
    focus: [
      b('Preposition à', 'Préposition à'),
      b('qu spelling (quai, quatre)', 'Son [k] avec qu'),
      b('Double l (gentille, billet)', 'Double l (gentille, billet)'),
    ],
    image: 'text-station',
    minutes: 5,
    text: 'Vendredi matin, Karim part en voyage pour le week-end. Il arrive à la gare avec son sac à dos noir. Une dame gentille lui donne son billet pour Lyon. Le train part à dix heures sur le quai numéro quatre. Karim monte dans le wagon et trouve sa place près de la fenêtre.',
    translation: 'On Friday morning, Karim leaves on a trip for the weekend. He arrives at the station with his black backpack. A kind woman gives him his ticket for Lyon. The train leaves at ten o’clock from platform four. Karim gets into the carriage and finds his seat near the window.',
    blanks: ['Vendredi', 'voyage', 'gare', 'gentille', 'billet', 'heures', 'quai', 'quatre', 'fenêtre'],
    traps: [
      {
        word: 'à la gare / sac à dos / à dix heures',
        note: b('Preposition à always takes a grave accent (unlike verb a from avoir).', 'La préposition « à » porte toujours un accent grave (contrairement au verbe « a »).'),
      },
      {
        word: 'gentille / billet',
        note: b('Both words use -ill- for the soft [j] sound (and billet ends in silent -t).', 'Les deux mots s’écrivent avec -ill- pour le son [j] (et un -t muet à « billet »).'),
      },
      {
        word: 'quai / quatre',
        note: b('Before a or e, French often spells the [k] sound with qu (quai, quatre).', 'Le son [k] s’écrit souvent « qu » devant a ou e : quai, quatre.'),
      },
      {
        word: 'numéro',
        note: b('Acute accent é in numéro.', 'Accent aigu sur le é dans « numéro ».'),
      },
      {
        word: 'près de la fenêtre',
        note: b('Grave accent è in près and circumflex ê in fenêtre.', 'Accent grave sur « près » et accent circonflexe sur « fenêtre ».'),
      },
      {
        word: 'part / dos',
        note: b('Silent final -t in part (il/elle) and silent final -s in dos.', 'Un -t final muet dans « part » et un -s final muet dans « dos ».'),
      },
    ],
    rules: [
      {
        title: b('The preposition à (places & times)', 'La préposition « à » (lieu et heure)'),
        body: b(
          'Whenever à introduces a place (à la gare), a time (à dix heures) or a purpose (sac à dos), write à with a grave accent.',
          'Devant un lieu (à la gare), une heure (à dix heures) ou dans « sac à dos », on écrit toujours « à » avec un accent grave.',
        ),
        examples: [
          { fr: 'Il arrive à la gare.', note: b('Place → à with grave accent.', 'Lieu → « à » avec accent grave.') },
          { fr: 'Le train part à dix heures.', note: b('Time → à with grave accent.', 'Heure → « à » avec accent grave.') },
        ],
      },
      {
        title: b('Spelling the [k] sound with qu', 'Écrire le son [k] avec « qu »'),
        body: b(
          'The letter q in French is almost always followed by a silent u: le quai, quatre, qui, que.',
          'En français, la lettre q est presque toujours suivie d’un u muet : le quai, quatre, qui, que.',
        ),
        examples: [
          { fr: 'Le quai numéro quatre.', note: b('qu sounds like [k] in quai and quatre.', '« qu » se prononce [k] dans « quai » et « quatre ».') },
          { fr: 'Sa place près de la fenêtre.', note: b('Watch both accents: près (è) and fenêtre (ê).', 'Attention aux deux accents : près (è) et fenêtre (ê).') },
        ],
      },
    ],
  },
  {
    id: 'un-matin-a-la-boulangerie',
    slug: 'un-matin-a-la-boulangerie',
    title: 'Un matin à la boulangerie',
    subtitle: b(
      'A Saturday morning walk to the neighbourhood bakery: accents, silent letters and feminine plurals.',
      'Un samedi matin à la boulangerie du quartier : accents courants, lettres muettes et accords.',
    ),
    level: 'A1',
    theme: b('Daily life', 'Vie quotidienne'),
    focus: [
      b('Accents & cedilla (é, è, ç)', 'Accents et cédille (é, è, ç)'),
      b('Silent letters', 'Lettres muettes'),
      b('Plurals (-s, -ées)', 'Pluriels (-s, -ées)'),
    ],
    image: 'dialogue-a-la-boulangerie',
    minutes: 6,
    text: 'Chaque samedi matin, Claire descend dans la rue encore calme de son quartier. Elle pousse la porte de la petite boulangerie au coin de la place. Une bonne odeur de pain chaud et de croissants remplit déjà la boutique. Derrière le comptoir, le boulanger sourit et prépare deux baguettes dorées ainsi que des tartes aux pommes. Claire paie avec quelques pièces, remercie le commerçant et rentre chez elle sous le soleil d’automne pour partager le petit-déjeuner en famille.',
    translation: 'Every Saturday morning, Claire walks down the still-quiet street of her neighbourhood. She pushes open the door of the little bakery on the corner of the square. A warm smell of fresh bread and croissants already fills the shop. Behind the counter, the baker smiles and packs two golden baguettes as well as apple tarts. Claire pays with a few coins, thanks the shopkeeper and heads home under the autumn sun to share breakfast with her family.',
    blanks: [
      'descend', 'quartier', 'chaud', 'croissants', 'déjà',
      'Derrière', 'prépare', 'dorées', 'pièces', 'commerçant',
      'automne', 'famille',
    ],
    traps: [
      {
        word: 'descend',
        note: b('3rd-person singular of descendre keeps its silent final -d.', 'À la 3e personne du singulier, « descend » garde son -d final muet.'),
      },
      {
        word: 'pain chaud / croissants',
        note: b('Silent -d in chaud (masculine of chaude) and silent plural -s in croissants.', 'Le -d final de « chaud » est muet (pensez à « chaude »), et « croissants » prend un -s au pluriel.'),
      },
      {
        word: 'déjà / Derrière / prépare',
        note: b('Watch the direction of the accents: é (acute) vs è / à (grave).', 'Attention au sens des accents : é (aigu) dans « déjà » et « prépare », è / à (grave) dans « déjà » et « Derrière ».'),
      },
      {
        word: 'deux baguettes dorées',
        note: b('Feminine plural agreement: baguette is feminine → dorées (-ées).', 'Accord au féminin pluriel : « baguette » est féminin → « dorées » (-ées).'),
      },
      {
        word: 'quelques pièces',
        note: b('Grave accent è and plural -s after quelques.', 'Accent grave sur le è et -s du pluriel après « quelques ».'),
      },
      {
        word: 'le commerçant',
        note: b('Cedilla ç is required before a to keep the [s] sound.', 'La cédille sur le ç est indispensable devant le a pour garder le son [s].'),
      },
      {
        word: 'd’automne',
        note: b('The m in automne is completely silent (pronounced [otɔn]).', 'Le m de « automne » est muet (on prononce [otɔn]).'),
      },
      {
        word: 'petit-déjeuner',
        note: b('Hyphenated compound noun with acute accent é.', 'Nom composé avec trait d’union et accent aigu sur le é.'),
      },
    ],
    rules: [
      {
        title: b('Finding silent final letters using the feminine', 'Retrouver les lettres muettes grâce au féminin'),
        body: b(
          'Many silent final consonants become audible in the feminine or in related words: chaud → chaude, descend → descendre, commerçant → commerçante.',
          'Beaucoup de consonnes finales muettes s’entendent au féminin ou dans un mot de la même famille : chaud → chaude, descend → descendre, commerçant → commerçante.',
        ),
        examples: [
          { fr: 'Du pain chaud.', note: b('Chaud ends in silent -d (cf. chaude).', '« Chaud » se termine par un -d muet (cf. chaude).') },
          { fr: 'Le boulanger sourit.', note: b('Sourit ends in silent -t (il/elle).', '« Sourit » prend un -t final muet à la 3e personne.') },
        ],
      },
      {
        title: b('Feminine plural adjectives (-ées, -es)', 'Les accords au féminin pluriel (-ées, -es)'),
        body: b(
          'When a feminine noun is plural, adjectives and past participles used as adjectives take -es: une baguette dorée → deux baguettes dorées.',
          'Quand un nom féminin est au pluriel, l’adjectif prend -es : une baguette dorée → deux baguettes dorées.',
        ),
        examples: [
          { fr: 'Deux baguettes dorées.', note: b('Feminine + plural: -e + -s → -ées.', 'Féminin + pluriel : -e + -s → -ées.') },
          { fr: 'Des tartes aux pommes.', note: b('Plural determiner des / aux triggers -s on both nouns.', 'Les déterminants « des » et « aux » imposent le -s.') },
        ],
      },
      {
        title: b('The cedilla (ç) before a, o, u', 'La cédille (ç) devant a, o, u'),
        body: b(
          'Before a, o or u, the letter c sounds like [k]. Add a cedilla (ç) whenever you hear [s]: un commerçant, un garçon, ça va.',
          'Devant a, o ou u, la lettre c se prononce [k]. On ajoute une cédille (ç) dès qu’on entend le son [s] : un commerçant, un garçon.',
        ),
        examples: [
          { fr: 'Le commerçant sourit.', note: b('ç before a keeps the soft [s] sound.', 'Le ç devant a garde le son [s].') },
        ],
      },
    ],
  },
];
