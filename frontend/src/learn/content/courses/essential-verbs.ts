// Les 50 verbes essentiels: ten pillars, twenty everyday -er verbs and twenty
// irregular verbs, with their present tense.
import { b, type Lesson } from '../../types';
import { card, pick } from '../kit';

const choose = b('Choose the right form.', 'Choisissez la bonne forme.');
const present = b('present', 'présent');

const lessons: Lesson[] = [
  {
    id: 'essential-verbs-1',
    slug: { en: 'the-ten-pillars', fr: 'les-dix-piliers' },
    title: b('The ten pillars: être, avoir, aller, faire…', 'Les dix piliers : être, avoir, aller, faire…'),
    summary: b('The ten verbs you use in almost every sentence, and their present tense.', 'Les dix verbes que vous employez dans presque chaque phrase, et leur présent.'),
    objectives: [b('Know the ten most used verbs', 'Connaître les dix verbes les plus employés'), b('Conjugate dire and savoir', 'Conjuguer dire et savoir'), b('Choose between savoir and connaître', 'Choisir entre savoir et connaître')],
    minutes: 13,
    steps: [
      { kind: 'flashcards', title: b('The ten pillars', 'Les dix piliers'), cards: [
        { fr: 'être', tr: 'to be', ex: 'Je suis à la maison.' }, { fr: 'avoir', tr: 'to have', ex: 'J’ai deux enfants.' },
        { fr: 'aller', tr: 'to go', ex: 'Je vais au travail.' }, { fr: 'faire', tr: 'to do, to make', ex: 'Je fais du sport.' },
        { fr: 'dire', tr: 'to say', ex: 'Il dit bonjour.' }, { fr: 'pouvoir', tr: 'can, to be able to', ex: 'Je peux vous aider.' },
        { fr: 'vouloir', tr: 'to want', ex: 'Je veux apprendre.' }, { fr: 'savoir', tr: 'to know (a fact)', ex: 'Je sais nager.' },
        { fr: 'venir', tr: 'to come', ex: 'Je viens du Sénégal.' }, { fr: 'devoir', tr: 'must, to have to', ex: 'Je dois partir.' },
      ] },
      card(b('Irregular, but in families', 'Irréguliers, mais par familles'), b('These verbs are irregular, yet patterns help. **je / tu** forms sound the same: je peux, tu peux; je veux, tu veux; je dois, tu dois. **nous / vous** keep the stem of the infinitive: nous **pouv**ons, vous **voul**ez, nous **dev**ons, vous **sav**ez.', 'Ces verbes sont irréguliers, mais des régularités aident. Les formes **je / tu** se prononcent pareil : je peux, tu peux ; je veux, tu veux ; je dois, tu dois. **nous / vous** gardent le radical de l’infinitif : nous **pouv**ons, vous **voul**ez, nous **dev**ons, vous **sav**ez.'), { variant: 'tip' }),
      { kind: 'conjugate', prompt: b('Conjugate dire in the present.', 'Conjuguez dire au présent.'), verb: 'dire', tense: present, forms: [['je', 'dis'], ['tu', 'dis'], ['il / elle', 'dit'], ['nous', 'disons'], ['vous', 'dites'], ['ils / elles', 'disent']], given: [0], explain: b('Careful: vous **dites** (not “disez”), like vous faites and vous êtes.', 'Attention : vous **dites** (pas « disez »), comme vous faites et vous êtes.') },
      { kind: 'conjugate', prompt: b('Conjugate savoir in the present.', 'Conjuguez savoir au présent.'), verb: 'savoir', tense: present, forms: [['je', 'sais'], ['tu', 'sais'], ['il / elle', 'sait'], ['nous', 'savons'], ['vous', 'savez'], ['ils / elles', 'savent']], given: [0] },
      pick('A1', choose, ['faites', 'faisez', 'faitez', 'font'], { fr: 'Qu’est-ce que vous ___ ce soir ?' }),
      pick('A1', choose, ['viennent', 'venent', 'vient', 'venons'], { fr: 'Mes parents ___ du Cameroun.' }),
      card(b('Savoir or connaître?', 'Savoir ou connaître ?'), b('**Savoir** = to know a fact, or how to do something: je **sais** où il habite; je **sais** conduire. **Connaître** = to know a person or a place: je **connais** Marie; je **connais** Montréal.', '**Savoir** = connaître un fait, ou être capable de : je **sais** où il habite ; je **sais** conduire. **Connaître** = une personne ou un lieu : je **connais** Marie ; je **connais** Montréal.'), {
        examples: [{ fr: 'Je sais parler trois langues.', tr: 'I can speak three languages.' }, { fr: 'Tu connais ce restaurant ?', tr: 'Do you know this restaurant?' }],
      }),
      pick('A1', choose, ['sais', 'connais', 'sait', 'connaît'], { fr: 'Je ___ nager depuis l’âge de six ans.' }),
      pick('A1', choose, ['connais', 'sais', 'connaît', 'savez'], { fr: 'Tu ___ bien ce quartier ?' }),
      { kind: 'speak', prompt: b('Say it aloud.', 'Dites-le à voix haute.'), text: 'Je veux apprendre le français et je sais que je peux réussir.', tr: 'I want to learn French and I know that I can succeed.' },
    ],
    notes: {
      points: [
        b('The ten pillars: être, avoir, aller, faire, dire, pouvoir, vouloir, savoir, venir, devoir.', 'Les dix piliers : être, avoir, aller, faire, dire, pouvoir, vouloir, savoir, venir, devoir.'),
        b('je / tu sound alike: je peux, tu peux; je veux, tu veux; je dois, tu dois.', 'je / tu se prononcent pareil : je peux, tu peux ; je veux, tu veux ; je dois, tu dois.'),
        b('Three exceptions with vous: vous **êtes**, vous **faites**, vous **dites**.', 'Trois exceptions avec vous : vous **êtes**, vous **faites**, vous **dites**.'),
        b('Savoir: a fact, a skill. Connaître: a person, a place.', 'Savoir : un fait, une capacité. Connaître : une personne, un lieu.'),
      ],
      vocab: [['réussir', b('to succeed', 'arriver à son but')], ['conduire', b('to drive', 'diriger une voiture')], ['nager', b('to swim', 'se déplacer dans l’eau')], ['le quartier', b('neighbourhood', 'partie d’une ville')]],
    },
  },
  {
    id: 'essential-verbs-2',
    slug: { en: 'twenty-everyday-er-verbs', fr: 'vingt-verbes-en-er-du-quotidien' },
    title: b('Twenty everyday -er verbs', 'Vingt verbes en -er du quotidien'),
    summary: b('One pattern, twenty verbs: parler, habiter, travailler, chercher, trouver… and their small traps.', 'Un seul modèle, vingt verbes : parler, habiter, travailler, chercher, trouver… et leurs petits pièges.'),
    objectives: [b('Conjugate any regular -er verb', 'Conjuguer tout verbe régulier en -er'), b('Use j’ before a vowel', 'Employer j’ devant une voyelle'), b('Avoid the traps of acheter, appeler and payer', 'Éviter les pièges d’acheter, appeler et payer')],
    minutes: 13,
    steps: [
      card(b('One pattern for 90% of verbs', 'Un seul modèle pour 90 % des verbes'), b('Remove **-er** and add **-e, -es, -e, -ons, -ez, -ent**. Four forms sound exactly the same: je parl**e**, tu parl**es**, il parl**e**, ils parl**ent**. Before a vowel or h, **je → j’**: j’habite, j’aime, j’écoute.', 'Retirez **-er** et ajoutez **-e, -es, -e, -ons, -ez, -ent**. Quatre formes se prononcent exactement pareil : je parl**e**, tu parl**es**, il parl**e**, ils parl**ent**. Devant une voyelle ou un h, **je → j’** : j’habite, j’aime, j’écoute.')),
      { kind: 'conjugate', prompt: b('Conjugate travailler in the present.', 'Conjuguez travailler au présent.'), verb: 'travailler', tense: present, forms: [['je', 'travaille'], ['tu', 'travailles'], ['il / elle', 'travaille'], ['nous', 'travaillons'], ['vous', 'travaillez'], ['ils / elles', 'travaillent']], given: [0] },
      { kind: 'flashcards', title: b('Ten verbs for every day', 'Dix verbes pour tous les jours'), cards: [
        { fr: 'parler', tr: 'to speak', ex: 'Je parle un peu français.' }, { fr: 'habiter', tr: 'to live (somewhere)', ex: 'J’habite à Laval.' },
        { fr: 'travailler', tr: 'to work', ex: 'Elle travaille à l’hôpital.' }, { fr: 'aimer', tr: 'to like, to love', ex: 'J’aime cette ville.' },
        { fr: 'manger', tr: 'to eat', ex: 'Nous mangeons à midi.' }, { fr: 'regarder', tr: 'to watch, to look at', ex: 'Il regarde un film.' },
        { fr: 'écouter', tr: 'to listen to', ex: 'J’écoute la radio.' }, { fr: 'chercher', tr: 'to look for', ex: 'Je cherche un appartement.' },
        { fr: 'trouver', tr: 'to find', ex: 'J’ai trouvé un emploi.' }, { fr: 'donner', tr: 'to give', ex: 'Je donne mon adresse.' },
      ] },
      { kind: 'flashcards', title: b('Ten more', 'Dix de plus'), cards: [
        { fr: 'demander', tr: 'to ask', ex: 'Je demande mon chemin.' }, { fr: 'penser', tr: 'to think', ex: 'Je pense que oui.' },
        { fr: 'acheter', tr: 'to buy', ex: 'J’achète du pain.' }, { fr: 'payer', tr: 'to pay', ex: 'Je paie par carte.' },
        { fr: 'arriver', tr: 'to arrive', ex: 'Le train arrive à midi.' }, { fr: 'rester', tr: 'to stay', ex: 'Je reste à la maison.' },
        { fr: 'appeler', tr: 'to call', ex: 'J’appelle le médecin.' }, { fr: 'commencer', tr: 'to start', ex: 'Le cours commence à neuf heures.' },
        { fr: 'jouer', tr: 'to play', ex: 'Les enfants jouent dehors.' }, { fr: 'étudier', tr: 'to study', ex: 'J’étudie le français.' },
      ] },
      pick('A1', choose, ['J’habite', 'Je habite', 'J’habites', 'Je habites'], { fr: '___ à Québec depuis un an.' }),
      pick('A1', choose, ['cherchent', 'cherche', 'cherchons', 'cherchez'], { fr: 'Mes amis ___ un appartement.' }),
      card(b('Three small traps', 'Trois petits pièges'), b('**acheter** takes an accent when the ending is silent: j’ach**è**te, but nous achetons. **appeler** doubles the l: j’appe**ll**e, but nous appelons. **manger** and **commencer** keep their sound with nous: nous mang**e**ons, nous commen**ç**ons.', '**acheter** prend un accent quand la terminaison est muette : j’ach**è**te, mais nous achetons. **appeler** double le l : j’appe**ll**e, mais nous appelons. **manger** et **commencer** gardent leur son avec nous : nous mang**e**ons, nous commen**ç**ons.'), { variant: 'trap' }),
      pick('A1', choose, ['achète', 'achete', 'achette', 'achètes'], { fr: 'Elle ___ des fruits au marché.' }),
      pick('A1', choose, ['mangeons', 'mangons', 'manjons', 'mangez'], { fr: 'Nous ___ ensemble le dimanche.' }),
      { kind: 'fill', prompt: b('Conjugate the verbs.', 'Conjuguez les verbes.'), text: 'Tu ___ (parler) français ? — Oui, et j’___ (étudier) tous les jours.', answers: [['parles'], ['étudie']] },
    ],
    notes: {
      points: [
        b('-er verbs: -e, -es, -e, -ons, -ez, -ent. Je, tu, il and ils forms sound the same.', 'Verbes en -er : -e, -es, -e, -ons, -ez, -ent. Les formes je, tu, il et ils se prononcent pareil.'),
        b('je → j’ before a vowel or h: j’habite, j’aime, j’écoute, j’arrive.', 'je → j’ devant une voyelle ou un h : j’habite, j’aime, j’écoute, j’arrive.'),
        b('acheter → j’achète; appeler → j’appelle; payer → je paie.', 'acheter → j’achète ; appeler → j’appelle ; payer → je paie.'),
        b('nous mangeons, nous commençons (to keep the sound).', 'nous mangeons, nous commençons (pour garder le son).'),
      ],
      vocab: [['ensemble', b('together', 'l’un avec l’autre')], ['dehors', b('outside', 'à l’extérieur')], ['l’emploi', b('job', 'travail')], ['le chemin', b('way, path', 'la route à suivre')]],
    },
  },
  {
    id: 'essential-verbs-3',
    slug: { en: 'twenty-irregular-verbs', fr: 'vingt-verbes-irreguliers' },
    title: b('Twenty irregular verbs you cannot avoid', 'Vingt verbes irréguliers incontournables'),
    summary: b('Prendre, mettre, voir, partir, finir, attendre… grouped by families so that they stick.', 'Prendre, mettre, voir, partir, finir, attendre… regroupés par familles pour mieux les retenir.'),
    objectives: [b('Conjugate prendre and its family', 'Conjuguer prendre et sa famille'), b('Conjugate -ir verbs like finir and partir', 'Conjuguer les verbes en -ir comme finir et partir'), b('Conjugate -re verbs like attendre', 'Conjuguer les verbes en -re comme attendre')],
    minutes: 14,
    steps: [
      card(b('Learn them by families', 'Apprenez-les par familles'), b('**prendre**, **comprendre**, **apprendre** share one pattern. **partir**, **sortir**, **dormir** share another (je pars, je sors, je dors). **finir** and **choisir** add **-iss-** in the plural (nous finissons). **attendre**, **répondre**, **vendre** keep their **d** (il attend).', '**prendre**, **comprendre**, **apprendre** ont le même modèle. **partir**, **sortir**, **dormir** en partagent un autre (je pars, je sors, je dors). **finir** et **choisir** ajoutent **-iss-** au pluriel (nous finissons). **attendre**, **répondre**, **vendre** gardent leur **d** (il attend).')),
      { kind: 'conjugate', prompt: b('Conjugate prendre in the present.', 'Conjuguez prendre au présent.'), verb: 'prendre', tense: present, forms: [['je', 'prends'], ['tu', 'prends'], ['il / elle', 'prend'], ['nous', 'prenons'], ['vous', 'prenez'], ['ils / elles', 'prennent']], given: [0] },
      { kind: 'conjugate', prompt: b('Conjugate finir in the present.', 'Conjuguez finir au présent.'), verb: 'finir', tense: present, forms: [['je', 'finis'], ['tu', 'finis'], ['il / elle', 'finit'], ['nous', 'finissons'], ['vous', 'finissez'], ['ils / elles', 'finissent']], given: [0] },
      { kind: 'flashcards', title: b('Ten irregular verbs', 'Dix verbes irréguliers'), cards: [
        { fr: 'prendre', tr: 'to take', ex: 'Je prends le métro.' }, { fr: 'comprendre', tr: 'to understand', ex: 'Je ne comprends pas.' },
        { fr: 'apprendre', tr: 'to learn', ex: 'J’apprends le français.' }, { fr: 'mettre', tr: 'to put (on)', ex: 'Je mets mon manteau.' },
        { fr: 'voir', tr: 'to see', ex: 'Je vois la montagne.' }, { fr: 'lire', tr: 'to read', ex: 'Je lis le journal.' },
        { fr: 'écrire', tr: 'to write', ex: 'J’écris un courriel.' }, { fr: 'boire', tr: 'to drink', ex: 'Je bois de l’eau.' },
        { fr: 'dormir', tr: 'to sleep', ex: 'Je dors huit heures.' }, { fr: 'partir', tr: 'to leave', ex: 'Je pars à huit heures.' },
      ] },
      { kind: 'flashcards', title: b('Ten more', 'Dix de plus'), cards: [
        { fr: 'sortir', tr: 'to go out', ex: 'Je sors ce soir.' }, { fr: 'finir', tr: 'to finish', ex: 'Je finis à cinq heures.' },
        { fr: 'choisir', tr: 'to choose', ex: 'Je choisis un dessert.' }, { fr: 'attendre', tr: 'to wait (for)', ex: 'J’attends le bus.' },
        { fr: 'répondre', tr: 'to answer', ex: 'Je réponds au téléphone.' }, { fr: 'vendre', tr: 'to sell', ex: 'Il vend sa voiture.' },
        { fr: 'ouvrir', tr: 'to open', ex: 'J’ouvre la fenêtre.' }, { fr: 'connaître', tr: 'to know (a person, a place)', ex: 'Je connais ce quartier.' },
        { fr: 'vivre', tr: 'to live', ex: 'Je vis au Canada.' }, { fr: 'recevoir', tr: 'to receive', ex: 'Je reçois un colis.' },
      ] },
      pick('A2', choose, ['comprennent', 'comprendent', 'comprenent', 'comprend'], { fr: 'Ils ne ___ pas la question.' }),
      pick('A2', choose, ['pars', 'parts', 'part', 'partis'], { fr: 'Je ___ en vacances demain.' }),
      pick('A2', choose, ['attend', 'attent', 'attends', 'attende'], { fr: 'Elle ___ son amie devant le cinéma.' }),
      pick('A2', choose, ['choisissez', 'choisez', 'choisirez', 'choisissent'], { fr: 'Vous ___ quel dessert ?' }),
      { kind: 'fill', prompt: b('Conjugate the verbs.', 'Conjuguez les verbes.'), text: 'Je ___ (prendre) un café et je ___ (lire) mes messages.', answers: [['prends'], ['lis']] },
    ],
    notes: {
      points: [
        b('prendre family: je prends, il prend, nous prenons, ils prennent (comprendre, apprendre).', 'Famille de prendre : je prends, il prend, nous prenons, ils prennent (comprendre, apprendre).'),
        b('partir, sortir, dormir: je pars, je sors, je dors; nous partons, sortons, dormons.', 'partir, sortir, dormir : je pars, je sors, je dors ; nous partons, sortons, dormons.'),
        b('finir, choisir: -is, -is, -it, -issons, -issez, -issent.', 'finir, choisir : -is, -is, -it, -issons, -issez, -issent.'),
        b('attendre, répondre, vendre: j’attends, il attend (no t after d).', 'attendre, répondre, vendre : j’attends, il attend (pas de t après le d).'),
      ],
      vocab: [['le courriel', b('email', 'message électronique')], ['le colis', b('parcel', 'paquet')], ['le manteau', b('coat', 'vêtement chaud d’extérieur')], ['devant', b('in front of', 'face à')]],
    },
  },
];

export default lessons;
