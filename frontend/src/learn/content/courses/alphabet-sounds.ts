import { b, type Lesson } from '../../types';
import { card, pick } from '../kit';

const lessons: Lesson[] = [
  {
    id: 'alphabet-sounds-1',
    slug: { en: 'the-french-alphabet', fr: 'l-alphabet-francais' },
    title: b('The French alphabet and spelling your name', 'L’alphabet français et épeler son nom'),
    summary: b('Learn the 26 letters the French way and spell your name, your email and your street.', 'Apprendre les 26 lettres à la française et épeler votre nom, votre courriel et votre rue.'),
    objectives: [b('Say the 26 letters', 'Dire les 26 lettres'), b('Spell your name and email', 'Épeler votre nom et votre courriel'), b('Name the accents and signs', 'Nommer les accents et les signes')],
    minutes: 12,
    steps: [
      card(b('Letters that surprise', 'Les lettres qui surprennent'), b('Most letters sound close to English, but some are tricky: **E** (like “uh”), **I** (like “ee”), **G** (zhé) and **J** (zhee) are often swapped, **H** is “ash”, **W** is “double vé”, **Y** is “i grec”.', 'La plupart des lettres ressemblent à l’anglais, mais certaines piègent : **E**, **I**, **G** (gé) et **J** (ji) qu’on confond souvent, **H** (ache), **W** (double vé), **Y** (i grec).'), {
        examples: [{ fr: 'A, B, C, D, E, F, G', tr: 'a, bé, cé, dé, e, effe, gé' }, { fr: 'H, I, J, K, L, M, N', tr: 'ache, i, ji, ka, elle, emme, enne' }, { fr: 'O, P, Q, R, S, T, U', tr: 'o, pé, ku, erre, esse, té, u' }, { fr: 'V, W, X, Y, Z', tr: 'vé, double vé, iks, i grec, zède' }],
      }),
      { kind: 'match', prompt: b('Match each letter with how it is said.', 'Associez chaque lettre à sa prononciation.'), pairs: [['G', 'gé'], ['J', 'ji'], ['H', 'ache'], ['W', 'double vé'], ['Y', 'i grec']] },
      card(b('Spelling on the phone', 'Épeler au téléphone'), b('For double letters say **deux**: Pierre = P, I, E, deux R, E. Accents: **e accent aigu** (é), **e accent grave** (è), **c cédille** (ç). Email: **arobase** (@), **point** (.), **tiret** (-), **tiret bas** (_).', 'Pour une lettre double, dites **deux** : Pierre = P, I, E, deux R, E. Accents : **e accent aigu** (é), **e accent grave** (è), **c cédille** (ç). Courriel : **arobase** (@), **point** (.), **tiret** (-), **tiret bas** (_).'), {
        variant: 'tip',
        examples: [{ fr: 'Martin : M, A, R, T, I, N.', tr: 'Martin: M-A-R-T-I-N' }, { fr: 'Hélène : H, E accent aigu, L, E accent grave, N, E.', tr: 'Hélène with its accents' }, { fr: 'paul point roy arobase exemple point ca', tr: 'paul.roy@exemple.ca' }],
      }),
      pick('A1', b('How do you say “@” in an email address?', 'Comment dit-on « @ » dans une adresse courriel ?'), ['arobase', 'point', 'tiret', 'accent']),
      pick('A1', b('How do you spell “Anna” aloud?', 'Comment épeler « Anna » à voix haute ?'), ['A, deux N, A', 'A, N, A', 'A, N, N, N, A', 'deux A, N']),
      pick('A1', b('Which letter is “i grec”?', 'Quelle lettre est « i grec » ?'), ['Y', 'I', 'J', 'G']),
      { kind: 'dictation', prompt: b('Write the name you hear spelled.', 'Écrivez le nom que vous entendez épeler.'), text: 'Lucas', voice: 'm', hint: b('Listen: L, U, C, A, S.', 'Écoutez : L, U, C, A, S.') },
      { kind: 'speak', prompt: b('Spell this name aloud.', 'Épelez ce nom à voix haute.'), text: 'Diallo : D, I, A, deux L, O.', tr: 'Diallo: D-I-A-LL-O' },
    ],
    notes: {
      points: [
        b('Tricky letters: E, I, G (gé), J (ji), H (ache), W (double vé), Y (i grec).', 'Lettres piégeuses : E, I, G (gé), J (ji), H (ache), W (double vé), Y (i grec).'),
        b('Double letters: deux R, deux L, deux S.', 'Lettres doubles : deux R, deux L, deux S.'),
        b('Accents: e accent aigu (é), e accent grave (è), c cédille (ç).', 'Accents : e accent aigu (é), e accent grave (è), c cédille (ç).'),
        b('Email: arobase (@), point (.), tiret (-), tiret bas (_).', 'Courriel : arobase (@), point (.), tiret (-), tiret bas (_).'),
      ],
      vocab: [['épeler', b('to spell', 'dire les lettres')], ['l’arobase (f.)', b('at sign @', 'le signe @')], ['le tiret', b('hyphen, dash', 'le signe -')], ['la lettre', b('letter', 'signe de l’alphabet')]],
    },
  },
  {
    id: 'alphabet-sounds-2',
    slug: { en: 'french-vowels-and-nasal-sounds', fr: 'voyelles-et-sons-nasaux' },
    title: b('Vowels and nasal sounds', 'Les voyelles et les sons nasaux'),
    summary: b('Hear and say the vowels that do not exist in English: u, eu, ou, and the nasal sounds an, on, in.', 'Entendre et dire les voyelles qui n’existent pas en anglais : u, eu, ou, et les sons nasaux an, on, in.'),
    objectives: [b('Distinguish u and ou', 'Distinguer u et ou'), b('Recognise the three nasal sounds', 'Reconnaître les trois sons nasaux'), b('Read common letter groups: ou, au, oi, ai', 'Lire les groupes de lettres courants : ou, au, oi, ai')],
    minutes: 13,
    steps: [
      card(b('u or ou?', 'u ou ou ?'), b('**ou** is like “oo” in food: **vous**, **tout**. **u** does not exist in English: say “ee” with rounded lips: **tu**, **rue**. The difference changes the meaning: **dessous** (under) / **dessus** (on top).', '**ou** se prononce comme dans **vous**, **tout**. **u** n’existe pas en anglais : dites « i » en arrondissant les lèvres : **tu**, **rue**. La différence change le sens : **dessous** / **dessus**.'), {
        examples: [{ fr: 'vous, tout, nous', tr: 'ou sound' }, { fr: 'tu, rue, salut', tr: 'u sound' }, { fr: 'Le chat est dessus, pas dessous.', tr: 'The cat is on top, not underneath.' }],
      }),
      card(b('Letter groups, one sound', 'Groupes de lettres, un seul son'), b('In French, several letters often make **one** sound: **ou** (vous), **au / eau** = o (chaud, beau), **ai** = è (lait), **oi** = wa (moi, trois), **eu** (deux, bleu).', 'En français, plusieurs lettres font souvent **un seul** son : **ou** (vous), **au / eau** = o (chaud, beau), **ai** = è (lait), **oi** = oa (moi, trois), **eu** (deux, bleu).'), {
        examples: [{ fr: 'beau, chaud, gâteau', tr: 'o sound' }, { fr: 'moi, toi, trois', tr: 'wa sound' }, { fr: 'deux, bleu, peu', tr: 'eu sound' }],
      }),
      { kind: 'categorize', prompt: b('Which sound do you hear?', 'Quel son entendez-vous ?'), buckets: [b('ou (vous)', 'ou (vous)'), b('u (tu)', 'u (tu)')], items: [{ text: 'rouge', bucket: 0 }, { text: 'lune', bucket: 1 }, { text: 'jour', bucket: 0 }, { text: 'bus', bucket: 1 }, { text: 'soupe', bucket: 0 }, { text: 'musique', bucket: 1 }] },
      card(b('Three nasal sounds', 'Trois sons nasaux'), b('Air goes through the nose and the n / m is not pronounced: **an / en** (enfant, temps), **on** (bonjour, nom), **in / ain / un** (vin, pain, un). Add a vowel and the nasal disappears: **bon** / **bonne**.', 'L’air passe par le nez et le n / m ne se prononce pas : **an / en** (enfant, temps), **on** (bonjour, nom), **in / ain / un** (vin, pain, un). Ajoutez une voyelle et la nasale disparaît : **bon** / **bonne**.'), {
        examples: [{ fr: 'enfant, maman, temps', tr: 'an sound' }, { fr: 'bonjour, maison, nom', tr: 'on sound' }, { fr: 'vin, pain, matin', tr: 'in sound' }, { fr: 'bon, bonne', tr: 'nasal / not nasal' }],
      }),
      pick('A1', b('Which word has the same vowel as “vous”?', 'Quel mot a la même voyelle que « vous » ?'), ['jour', 'rue', 'deux', 'vin']),
      pick('A1', b('How is “oi” pronounced in “moi”?', 'Comment se prononce « oi » dans « moi » ?'), [b('wa', 'oa'), b('oy as in “boy”', 'o-i séparés'), b('o', 'o'), b('i', 'i')]),
      pick('A1', b('In which word is the n NOT pronounced?', 'Dans quel mot le n ne se prononce-t-il PAS ?'), ['pain', 'bonne', 'année', 'fini']),
      { kind: 'speak', prompt: b('Say it aloud.', 'Dites-le à voix haute.'), text: 'Bonjour, je voudrais du pain, s’il vous plaît.', tr: 'Hello, I’d like some bread, please.', tip: b('Three nasals: bon-, pain, (s’il) vous plaît has none.', 'Trois nasales : bon-, pain ; « vous plaît » n’en a pas.') },
    ],
    notes: {
      points: [
        b('ou (vous) ≠ u (tu): rounded lips for u.', 'ou (vous) ≠ u (tu) : lèvres arrondies pour u.'),
        b('One sound, several letters: au / eau = o, ai = è, oi = wa, eu.', 'Un son, plusieurs lettres : au / eau = o, ai = è, oi = oa, eu.'),
        b('Nasals: an / en, on, in / ain / un. The n is not pronounced.', 'Nasales : an / en, on, in / ain / un. Le n ne se prononce pas.'),
        b('A vowel after n cancels the nasal: bon / bonne, an / année.', 'Une voyelle après le n supprime la nasale : bon / bonne, an / année.'),
      ],
      vocab: [['dessus', b('on top', 'en haut')], ['dessous', b('underneath', 'en bas')], ['la lune', b('moon', 'astre de la nuit')], ['le pain', b('bread', 'aliment de base')], ['le temps', b('time / weather', 'durée ou météo')]],
    },
  },
  {
    id: 'alphabet-sounds-3',
    slug: { en: 'silent-letters-and-liaison', fr: 'lettres-muettes-et-liaisons' },
    title: b('Silent letters and liaison', 'Lettres muettes et liaisons'),
    summary: b('Know which final letters you do not pronounce, and link words together like a native.', 'Savoir quelles lettres finales ne se prononcent pas, et enchaîner les mots comme un natif.'),
    objectives: [b('Recognise silent final letters', 'Reconnaître les lettres finales muettes'), b('Make the common liaisons', 'Faire les liaisons courantes'), b('Read a short sentence fluently', 'Lire une phrase courte avec fluidité')],
    minutes: 12,
    steps: [
      card(b('Silent endings', 'Les finales muettes'), b('Most final consonants are silent: **petit**, **grand**, **trois**, **vous**, **ils parlent**. The final **-e** is usually silent too: **table**, **rue**. Often pronounced: final **c, r, f, l** (avec, bonjour, neuf, sel).', 'La plupart des consonnes finales sont muettes : **petit**, **grand**, **trois**, **vous**, **ils parlent**. Le **-e** final aussi, en général : **table**, **rue**. Souvent prononcées : **c, r, f, l** finales (avec, bonjour, neuf, sel).'), {
        examples: [{ fr: 'un petit garçon', tr: 'a little boy (t and s silent)' }, { fr: 'Ils parlent français.', tr: 'They speak French (-ent silent)' }, { fr: 'avec, bonjour, neuf, sel', tr: 'c, r, f, l pronounced' }],
      }),
      { kind: 'categorize', prompt: b('Is the last consonant pronounced?', 'La dernière consonne se prononce-t-elle ?'), buckets: [b('Silent', 'Muette'), b('Pronounced', 'Prononcée')], items: [{ text: 'petit', bucket: 0 }, { text: 'avec', bucket: 1 }, { text: 'grand', bucket: 0 }, { text: 'bonjour', bucket: 1 }, { text: 'trois', bucket: 0 }, { text: 'neuf', bucket: 1 }] },
      card(b('Liaison: words that hold hands', 'La liaison : des mots qui se donnent la main'), b('A silent final consonant is pronounced when the next word starts with a vowel: **vous_avez** (z), **les_amis** (z), **un_enfant** (n), **petit_ami** (t). Liaison is compulsory after **les, des, vous, nous, un, mon**.', 'Une consonne finale muette se prononce si le mot suivant commence par une voyelle : **vous_avez** (z), **les_amis** (z), **un_enfant** (n), **petit_ami** (t). La liaison est obligatoire après **les, des, vous, nous, un, mon**.'), {
        variant: 'tip',
        examples: [{ fr: 'Vous avez des enfants ?', tr: 'Do you have children? (z, z)' }, { fr: 'les amis, un ami', tr: 'friends, a friend' }, { fr: 'Nous habitons ici.', tr: 'We live here. (z)' }],
      }),
      pick('A1', b('In “vous avez”, which sound links the two words?', 'Dans « vous avez », quel son relie les deux mots ?'), ['z', 's', 't', b('none', 'aucun')]),
      pick('A1', b('In “ils parlent”, how many letters of -ent do you pronounce?', 'Dans « ils parlent », combien de lettres de -ent prononce-t-on ?'), [b('none', 'aucune'), b('one', 'une'), b('two', 'deux'), b('three', 'trois')]),
      pick('A1', b('Which phrase has a liaison?', 'Quelle expression a une liaison ?'), ['les enfants', 'les parents', 'un garçon', 'vous parlez']),
      { kind: 'dictation', prompt: b('Write what you hear.', 'Écrivez ce que vous entendez.'), text: 'Nous avons deux enfants.', voice: 'f' },
      { kind: 'speak', prompt: b('Say it aloud with the liaisons.', 'Dites-le avec les liaisons.'), text: 'Vous avez des amis ici ?', tr: 'Do you have friends here?', tip: b('vous_avez, des_amis: two z sounds.', 'vous_avez, des_amis : deux sons z.') },
    ],
    notes: {
      points: [
        b('Final consonants are usually silent; c, r, f, l are often pronounced.', 'Les consonnes finales sont en général muettes ; c, r, f, l se prononcent souvent.'),
        b('Verb ending -ent (ils parlent) is completely silent.', 'La terminaison -ent (ils parlent) est entièrement muette.'),
        b('Liaison: silent consonant + vowel → pronounced: vous_avez (z), un_ami (n).', 'Liaison : consonne muette + voyelle → prononcée : vous_avez (z), un_ami (n).'),
        b('s and x make a z in liaison: les_amis, deux_enfants.', 's et x font un z en liaison : les_amis, deux_enfants.'),
      ],
      vocab: [['la liaison', b('linking sound', 'enchaînement de deux mots')], ['muet', b('silent', 'qui ne se prononce pas')], ['un ami', b('a friend', 'un copain')], ['ici', b('here', 'à cet endroit')]],
    },
  },
];

export default lessons;
