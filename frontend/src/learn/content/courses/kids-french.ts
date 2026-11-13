// Le français pour les enfants (6 à 10 ans, A1): very short steps, pictures,
// sounds and repetition. Colours and animals, numbers with a traditional
// rhyme, family and toys, then school and feelings. A note for parents opens
// each lesson.
import { b, type DialogueStep, type Lesson, type McqStep, type T, type Voice } from '../../types';
import { card } from '../kit';

const hear = (voice: Voice, audio: string, prompt: T, options: T[], explain?: T): McqStep =>
  ({ kind: 'mcq', voice, audio, listen: true, prompt, options, answer: 0, ...(explain ? { explain } : {}) });

type Speaker = DialogueStep['speakers'][number];
const LISTEN = b('Listen! What do you hear?', 'Écoute ! Qu’est-ce que tu entends ?');

const lessons: Lesson[] = [
  {
    id: 'kids-french-1',
    slug: { en: 'hello-colours-and-animals', fr: 'bonjour-les-couleurs-et-les-animaux' },
    title: b('Hello! Colours and animals', 'Bonjour ! Les couleurs et les animaux'),
    summary: b('Say hello and your name, learn eight colours and the animals of the farm, and what they say in French.', 'Dire bonjour et son prénom, apprendre huit couleurs et les animaux de la ferme, et ce qu’ils disent en français.'),
    objectives: [b('Say hello and your name', 'Dire bonjour et son prénom'), b('Know eight colours', 'Connaître huit couleurs'), b('Name eight animals', 'Nommer huit animaux')],
    minutes: 11,
    steps: [
      card(b('For parents', 'Pour les parents'), b('Sit next to your child, with the sound on. Each lesson takes about ten minutes: let your child touch, listen and **repeat aloud**: speaking is the most important part. Celebrate every answer, right or wrong, and come back to the lesson another day: children learn by repetition.', 'Asseyez-vous à côté de votre enfant, le son allumé. Chaque leçon dure une dizaine de minutes : laissez-le toucher, écouter et **répéter à voix haute** : parler est le plus important. Félicitez chaque réponse, juste ou non, et revenez à la leçon un autre jour : les enfants apprennent en répétant.'), { variant: 'tip' }),
      card(b('Hello!', 'Bonjour !'), b('Touch each sentence to hear it, then say it like a parrot!', 'Touche chaque phrase pour l’écouter, puis répète-la comme un perroquet !'), { examples: [
        { fr: 'Bonjour !', tr: 'Hello!' },
        { fr: 'Je m’appelle Léo.', tr: 'My name is Léo.' },
        { fr: 'J’ai sept ans.', tr: 'I am seven.' },
        { fr: 'Au revoir !', tr: 'Goodbye!' },
      ] }),
      { kind: 'speak', prompt: b('Your turn! Say hello and your name.', 'À toi ! Dis bonjour et ton prénom.'), text: 'Bonjour ! Je m’appelle Léo.', tr: 'Hello! My name is Léo.', tip: b('Say your own name instead of Léo!', 'Dis ton prénom à la place de Léo !') },
      { kind: 'flashcards', title: b('The colours', 'Les couleurs'), cards: [
        { fr: 'rouge', tr: b('red', 'comme une fraise') },
        { fr: 'bleu', tr: b('blue', 'comme le ciel') },
        { fr: 'jaune', tr: b('yellow', 'comme le soleil') },
        { fr: 'vert', tr: b('green', 'comme l’herbe') },
        { fr: 'orange', tr: b('orange', 'comme une orange') },
        { fr: 'rose', tr: b('pink', 'comme une fleur') },
        { fr: 'noir', tr: b('black', 'comme la nuit') },
        { fr: 'blanc', tr: b('white', 'comme la neige') },
      ] },
      hear('f', 'C’est bleu !', LISTEN, ['bleu', 'rouge', 'vert']),
      hear('m', 'C’est jaune !', LISTEN, ['jaune', 'blanc', 'rose']),
      card(b('At the farm', 'À la ferme'), b('Look at the animals and touch each name to hear it.', 'Regarde les animaux et touche chaque nom pour l’écouter.'), { image: 'kids-animals', examples: [
        { fr: 'le chat', tr: 'the cat' }, { fr: 'le chien', tr: 'the dog' }, { fr: 'la vache', tr: 'the cow' }, { fr: 'le cheval', tr: 'the horse' },
        { fr: 'le lapin', tr: 'the rabbit' }, { fr: 'le cochon', tr: 'the pig' }, { fr: 'le canard', tr: 'the duck' }, { fr: 'le mouton', tr: 'the sheep' },
      ] }),
      { kind: 'match', prompt: b('What does each animal say in French?', 'Que dit chaque animal en français ?'), pairs: [['le chat', 'miaou'], ['le chien', 'ouaf ouaf'], ['la vache', 'meuh'], ['le canard', 'coin-coin'], ['le coq', 'cocorico']] },
      { kind: 'categorize', listen: true, prompt: b('Animal or colour? Touch a word to hear it.', 'Animal ou couleur ? Touche un mot pour l’écouter.'), buckets: [b('Animal', 'Animal'), b('Colour', 'Couleur')], items: [{ text: 'le chat', bucket: 0 }, { text: 'la vache', bucket: 0 }, { text: 'le lapin', bucket: 0 }, { text: 'rouge', bucket: 1 }, { text: 'jaune', bucket: 1 }, { text: 'vert', bucket: 1 }] },
      hear('f2', 'Le chat est noir.', b('What colour is the cat?', 'De quelle couleur est le chat ?'), [b('black', 'noir'), b('white', 'blanc'), b('orange', 'orange')]),
      { kind: 'speak', prompt: b('Say your favourite animal.', 'Dis ton animal préféré.'), text: 'Mon animal préféré, c’est le chien.', tr: 'My favourite animal is the dog.' },
    ],
    notes: {
      points: [
        b('Bonjour ! Je m’appelle… J’ai … ans. Au revoir !', 'Bonjour ! Je m’appelle… J’ai … ans. Au revoir !'),
        b('Colours: rouge, bleu, jaune, vert, orange, rose, noir, blanc.', 'Couleurs : rouge, bleu, jaune, vert, orange, rose, noir, blanc.'),
        b('Animals: le chat, le chien, la vache, le cheval, le lapin, le cochon, le canard, le mouton.', 'Animaux : le chat, le chien, la vache, le cheval, le lapin, le cochon, le canard, le mouton.'),
        b('In French, the dog says “ouaf” and the rooster “cocorico”!', 'En français, le chien fait « ouaf » et le coq « cocorico » !'),
      ],
      vocab: [['la ferme', b('the farm', 'là où vivent la vache et le cochon')], ['préféré', b('favourite', 'celui qu’on aime le plus')], ['le coq', b('the rooster', 'il chante le matin')]],
    },
  },
  {
    id: 'kids-french-2',
    slug: { en: 'numbers-family-and-toys', fr: 'les-nombres-la-famille-et-les-jouets' },
    title: b('Numbers, family and toys', 'Les nombres, la famille et les jouets'),
    summary: b('Count to twelve with a traditional French rhyme, present your family and talk about your toys and their colours.', 'Compter jusqu’à douze avec une comptine traditionnelle, présenter sa famille et parler de ses jouets et de leurs couleurs.'),
    objectives: [b('Count from 1 to 12', 'Compter de 1 à 12'), b('Present your family', 'Présenter sa famille'), b('Describe a toy with its colour', 'Décrire un jouet avec sa couleur')],
    minutes: 11,
    steps: [
      card(b('For parents', 'Pour les parents'), b('This lesson starts with a rhyme every French child knows. Say it together several times, clapping on each number. Then let your child show you real toys and name them in French.', 'Cette leçon commence par une comptine que connaissent tous les enfants francophones. Dites-la ensemble plusieurs fois, en tapant dans les mains à chaque nombre. Puis laissez votre enfant vous montrer de vrais jouets et les nommer en français.'), { variant: 'tip' }),
      card(b('A rhyme to count', 'Une comptine pour compter'), b('Touch each line, listen, and repeat. Clap your hands on every number!', 'Touche chaque ligne, écoute et répète. Tape dans tes mains à chaque nombre !'), { examples: [
        { fr: 'Un, deux, trois, nous irons au bois,', tr: 'One, two, three, we will go to the woods,' },
        { fr: 'Quatre, cinq, six, cueillir des cerises,', tr: 'four, five, six, to pick cherries,' },
        { fr: 'Sept, huit, neuf, dans mon panier neuf,', tr: 'seven, eight, nine, in my new basket,' },
        { fr: 'Dix, onze, douze, elles seront toutes rouges.', tr: 'ten, eleven, twelve, they will all be red.' },
      ] }),
      hear('m', 'J’ai huit ans.', b('How old is the child?', 'Quel âge a l’enfant ?'), ['8', '3', '10']),
      hear('f', 'J’ai trois lapins et deux chats.', b('How many rabbits?', 'Combien de lapins ?'), ['3', '2', '5']),
      { kind: 'flashcards', title: b('My family', 'Ma famille'), cards: [
        { fr: 'maman', tr: b('mum', 'ma mère') },
        { fr: 'papa', tr: b('dad', 'mon père') },
        { fr: 'mon frère', tr: b('my brother', 'un garçon de ma famille') },
        { fr: 'ma sœur', tr: b('my sister', 'une fille de ma famille') },
        { fr: 'mamie', tr: b('grandma', 'ma grand-mère') },
        { fr: 'papi', tr: b('grandpa', 'mon grand-père') },
      ] },
      { kind: 'match', prompt: b('Match the family.', 'Associe la famille.'), pairs: [['maman', b('mum', 'la mère')], ['papa', b('dad', 'le père')], ['mon frère', b('my brother', 'un garçon de la famille')], ['ma sœur', b('my sister', 'une fille de la famille')]] },
      { kind: 'flashcards', title: b('My toys', 'Mes jouets'), cards: [
        { fr: 'le ballon', tr: b('the ball', 'on joue au soccer avec') },
        { fr: 'la poupée', tr: b('the doll', 'un petit bébé en jouet') },
        { fr: 'le vélo', tr: b('the bike', 'il a deux roues') },
        { fr: 'la voiture', tr: b('the car', 'une petite auto') },
        { fr: 'le livre', tr: b('the book', 'on le lit') },
        { fr: 'les blocs', tr: b('the building blocks', 'pour construire') },
      ] },
      card(b('The colour comes after', 'La couleur vient après'), b('In French, the colour comes **after** the thing: **un ballon rouge**, **un vélo vert**. With a **la** word, many colours take an **e**: **une voiture bleue**, **une poupée verte**.', 'En français, la couleur se place **après** la chose : **un ballon rouge**, **un vélo vert**. Avec un mot en **la**, beaucoup de couleurs prennent un **e** : **une voiture bleue**, **une poupée verte**.')),
      { kind: 'order', prompt: b('Build the sentence.', 'Construis la phrase.'), words: ['J’ai', 'un', 'ballon', 'rouge.'], tr: 'I have a red ball.' },
      { kind: 'fill', prompt: b('Choose the right colour.', 'Choisis la bonne couleur.'), text: 'J’ai une voiture ___ et un vélo ___.', answers: [['bleue'], ['vert']], choices: [['bleue', 'bleu'], ['vert', 'verte']], explain: b('La voiture → bleue (with e); le vélo → vert.', 'La voiture → bleue (avec e) ; le vélo → vert.') },
      { kind: 'speak', prompt: b('Say the rhyme!', 'Dis la comptine !'), text: 'Un, deux, trois, nous irons au bois.', tr: 'One, two, three, we will go to the woods.' },
    ],
    notes: {
      points: [
        b('Numbers: un, deux, trois, quatre, cinq, six, sept, huit, neuf, dix, onze, douze.', 'Nombres : un, deux, trois, quatre, cinq, six, sept, huit, neuf, dix, onze, douze.'),
        b('Family: maman, papa, mon frère, ma sœur, mamie, papi.', 'Famille : maman, papa, mon frère, ma sœur, mamie, papi.'),
        b('The colour comes after: un ballon rouge, une voiture bleue.', 'La couleur vient après : un ballon rouge, une voiture bleue.'),
      ],
      vocab: [['la comptine', b('nursery rhyme', 'une petite chanson pour enfants')], ['cueillir', b('to pick', 'prendre une fleur, un fruit')], ['le panier', b('basket', 'on y met les fruits')], ['le jouet', b('toy', 'on joue avec')]],
    },
  },
  {
    id: 'kids-french-3',
    slug: { en: 'my-day-at-school', fr: 'ma-journee-a-l-ecole' },
    title: b('My day at school', 'Ma journée à l’école'),
    summary: b('The words of the classroom, how you feel (hungry, tired, happy) and a little conversation with a new friend.', 'Les mots de la classe, comment on se sent (faim, fatigue, joie) et une petite conversation avec un nouvel ami.'),
    objectives: [b('Name ten things at school', 'Nommer dix choses de l’école'), b('Say how you feel', 'Dire comment on se sent'), b('Talk to a new friend', 'Parler à un nouvel ami')],
    minutes: 11,
    steps: [
      card(b('For parents', 'Pour les parents'), b('Ask your child to show you their real pencil case and school bag, and name each object in French. In the conversation at the end, your child chooses the answers: read the options together if needed.', 'Demandez à votre enfant de vous montrer sa vraie trousse et son sac d’école, et de nommer chaque objet en français. Dans la conversation de la fin, c’est votre enfant qui choisit les réponses : lisez les choix ensemble si besoin.'), { variant: 'tip' }),
      card(b('In the classroom', 'Dans la classe'), b('Touch each word to hear it.', 'Touche chaque mot pour l’écouter.'), { image: 'kids-classroom', examples: [
        { fr: 'le crayon', tr: 'the pencil' }, { fr: 'la gomme', tr: 'the eraser' }, { fr: 'le cahier', tr: 'the exercise book' }, { fr: 'les ciseaux', tr: 'the scissors' },
        { fr: 'le sac d’école', tr: 'the school bag' }, { fr: 'la récré', tr: 'break time' }, { fr: 'l’enseignante', tr: 'the teacher' },
      ] }),
      hear('f2', 'Prends ton crayon et ton cahier.', b('What must you take?', 'Que dois-tu prendre ?'), [b('your pencil and your exercise book', 'ton crayon et ton cahier'), b('your bag and your eraser', 'ton sac et ta gomme'), b('your scissors', 'tes ciseaux')]),
      { kind: 'categorize', listen: true, prompt: b('At school or at home? Touch a word to hear it.', 'À l’école ou à la maison ? Touche un mot pour l’écouter.'), buckets: [b('At school', 'À l’école'), b('At home', 'À la maison')], items: [{ text: 'la récré', bucket: 0 }, { text: 'l’enseignante', bucket: 0 }, { text: 'le tableau', bucket: 0 }, { text: 'mon lit', bucket: 1 }, { text: 'la cuisine', bucket: 1 }, { text: 'mamie', bucket: 1 }] },
      card(b('How do you feel?', 'Comment tu te sens ?'), b('Touch and repeat. With feelings, girls often add an **e**: *je suis content* (boy), *je suis contente* (girl).', 'Touche et répète. Pour les émotions, les filles ajoutent souvent un **e** : *je suis content* (garçon), *je suis contente* (fille).'), { examples: [
        { fr: 'Je suis content !', tr: 'I am happy!' }, { fr: 'Je suis triste.', tr: 'I am sad.' }, { fr: 'Je suis fatigué.', tr: 'I am tired.' },
        { fr: 'J’ai faim !', tr: 'I am hungry!' }, { fr: 'J’ai soif.', tr: 'I am thirsty.' },
      ] }),
      hear('m', 'J’ai faim ! On mange quand ?', b('How does the boy feel?', 'Comment se sent le garçon ?'), [b('hungry', 'il a faim'), b('sad', 'il est triste'), b('thirsty', 'il a soif')]),
      hear('f', 'Je suis fatiguée, je vais dormir.', b('How does the girl feel?', 'Comment se sent la fille ?'), [b('tired', 'fatiguée'), b('happy', 'contente'), b('hungry', 'elle a faim')]),
      {
        kind: 'dialogue',
        title: b('A new friend at break time', 'Un nouvel ami à la récré'),
        speakers: [{ name: 'Emma', voice: 'f2', side: 'l' }, { name: 'Toi', voice: 'f', side: 'r' }] as Speaker[],
        lines: [
          { s: 0, fr: 'Salut ! Comment tu t’appelles ?', tr: 'Hi! What’s your name?' },
          { s: 1, choose: { options: ['Je m’appelle Sam. Et toi ?', 'J’ai un ballon rouge.', 'Au revoir !'], answer: 0 } },
          { s: 0, fr: 'Moi, c’est Emma. Tu as quel âge ?', tr: 'I’m Emma. How old are you?' },
          { s: 1, choose: { options: ['J’ai huit ans.', 'J’ai faim.', 'Je suis un chat.'], answer: 0 } },
          { s: 0, fr: 'Moi aussi ! Tu veux jouer au ballon avec moi ?', tr: 'Me too! Do you want to play ball with me?' },
          { s: 1, choose: { options: ['Oui, super !', 'Non, je suis une vache.', 'Le crayon est bleu.'], answer: 0 } },
        ],
      },
      { kind: 'order', prompt: b('Build the sentence.', 'Construis la phrase.'), words: ['Tu', 'veux', 'jouer', 'avec', 'moi ?'], tr: 'Do you want to play with me?' },
      { kind: 'speak', prompt: b('Say goodbye to your teacher.', 'Dis au revoir à ton enseignante.'), text: 'Au revoir, madame ! À demain !', tr: 'Goodbye, Miss! See you tomorrow!' },
    ],
    notes: {
      points: [
        b('School: le crayon, la gomme, le cahier, les ciseaux, le sac d’école, la récré.', 'L’école : le crayon, la gomme, le cahier, les ciseaux, le sac d’école, la récré.'),
        b('Feelings: je suis content(e), triste, fatigué(e); j’ai faim, j’ai soif.', 'Émotions : je suis content(e), triste, fatigué(e) ; j’ai faim, j’ai soif.'),
        b('Meeting a friend: Comment tu t’appelles ? Tu as quel âge ? Tu veux jouer ?', 'Rencontrer un ami : Comment tu t’appelles ? Tu as quel âge ? Tu veux jouer ?'),
      ],
      vocab: [['la récré', b('break time', 'la pause dans la cour')], ['la trousse', b('pencil case', 'on y range les crayons')], ['le tableau', b('the board', 'l’enseignante écrit dessus')], ['jouer', b('to play', 's’amuser')]],
    },
  },
];

export default lessons;
