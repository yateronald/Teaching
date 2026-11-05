import { b, type Lesson } from '../../types';
import { card, pick } from '../kit';

const choose = b('Choose the right spelling.', 'Choisissez la bonne orthographe.');

const lessons: Lesson[] = [
  {
    id: 'spelling-consonant-sounds-1',
    slug: { en: 'the-s-sound', fr: 'le-son-s' },
    title: b('The [s] sound: s, ss, c, ç, t', 'Le son [s] : s, ss, c, ç, t'),
    summary: b('Write the [s] sound correctly: s, ss between vowels, c before e / i, ç before a / o / u, t in -tion.', 'Écrire correctement le son [s] : s, ss entre deux voyelles, c devant e / i, ç devant a / o / u, t dans -tion.'),
    objectives: [b('Write ss between two vowels', 'Écrire ss entre deux voyelles'), b('Use c and ç correctly', 'Employer correctement c et ç'), b('Spell the -tion ending', 'Écrire la terminaison -tion')],
    minutes: 12,
    steps: [
      card(b('One s between vowels sounds [z]', 'Un s entre deux voyelles fait [z]'), b('A single **s** between two vowels is pronounced **[z]**: **rose**, **maison**. To keep [s], double it: **poisson** (fish) vs **poison** (poison), **dessert** vs **désert**.', 'Un seul **s** entre deux voyelles se prononce **[z]** : **rose**, **maison**. Pour garder [s], on le double : **poisson** / **poison**, **dessert** / **désert**.'), {
        examples: [{ fr: 'un poisson, un poison', tr: 'a fish, a poison' }, { fr: 'le dessert, le désert', tr: 'dessert, desert' }, { fr: 'une maison, une tasse', tr: '[z] and [s]' }],
      }),
      card(b('C, ç and t', 'C, ç et t'), b('**c** sounds [s] before **e, i, y**: ceci, cinéma. Before **a, o, u**, add a cedilla: **ç**: ça, garçon, reçu. In **-tion**, t sounds [s]: nation, attention, station.', '**c** se prononce [s] devant **e, i, y** : ceci, cinéma. Devant **a, o, u**, on ajoute une cédille : **ç** : ça, garçon, reçu. Dans **-tion**, t se prononce [s] : nation, attention.'), { variant: 'tip' }),
      pick('A2', choose, ['poisson', 'poison', 'poisçon', 'poiçon'], { fr: 'Au restaurant, j’ai mangé du ___.' }),
      pick('A2', choose, ['garçon', 'garcon', 'garsson', 'garsçon'], { fr: 'Ils ont un ___ et une fille.' }),
      pick('A2', choose, ['reçu', 'recu', 'ressu', 'resu'], { fr: 'J’ai ___ ton message.' }),
      pick('A2', choose, ['attention', 'attension', 'atantion', 'attenssion'], { fr: 'Faites ___ à la marche !' }),
      { kind: 'fill', prompt: b('Write c or ç.', 'Écrivez c ou ç.'), text: 'Nous commen___ons à huit heures. Elle a re___u une lettre de son on___le.', answers: [['ç'], ['ç'], ['c']], strict: true },
      { kind: 'dictation', prompt: b('Write what you hear.', 'Écrivez ce que vous entendez.'), text: 'Le garçon a reçu un poisson rouge.', voice: 'f', strict: true },
    ],
    notes: {
      points: [
        b('s between two vowels = [z] (rose); ss = [s] (tasse).', 's entre deux voyelles = [z] (rose) ; ss = [s] (tasse).'),
        b('c = [s] before e, i, y; ç = [s] before a, o, u.', 'c = [s] devant e, i, y ; ç = [s] devant a, o, u.'),
        b('-tion = [sjɔ̃]: nation, station, attention.', '-tion = [sjɔ̃] : nation, station, attention.'),
        b('Never ç before e or i.', 'Jamais de ç devant e ou i.'),
      ],
      vocab: [['le poisson', b('fish', 'animal aquatique')], ['le poison', b('poison', 'substance mortelle')], ['la marche', b('step', 'degré d’escalier')], ['l’oncle', b('uncle', 'frère d’un parent')]],
    },
  },
  {
    id: 'spelling-consonant-sounds-2',
    slug: { en: 'the-k-and-g-sounds', fr: 'les-sons-k-et-g' },
    title: b('The [k], [g] and [ʒ] sounds', 'Les sons [k], [g] et [ʒ]'),
    summary: b('Write c / qu / k and g / gu / ge correctly according to the next vowel.', 'Écrire correctement c / qu / k et g / gu / ge selon la voyelle qui suit.'),
    objectives: [b('Choose c or qu for [k]', 'Choisir c ou qu pour [k]'), b('Choose g, gu or ge', 'Choisir g, gu ou ge'), b('Keep the sound when conjugating', 'Garder le son en conjuguant')],
    minutes: 13,
    steps: [
      card(b('The [k] sound', 'Le son [k]'), b('**c** before **a, o, u** and consonants: café, comme, culture, classe. **qu** before **e, i**: quelque, qui, musique. **k** in a few foreign words: kilo, kayak.', '**c** devant **a, o, u** et les consonnes : café, comme, culture, classe. **qu** devant **e, i** : quelque, qui, musique. **k** dans quelques mots étrangers : kilo, kayak.')),
      card(b('G: [g] or [ʒ]?', 'G : [g] ou [ʒ] ?'), b('**g** before **a, o, u** = [g]: gare, gomme. Before **e, i, y** = [ʒ]: genou, girafe. To get [g] before e / i, add **u**: **guerre**, **guide**. To get [ʒ] before a / o, add **e**: **mangeons**, **nageait**.', '**g** devant **a, o, u** = [g] : gare, gomme. Devant **e, i, y** = [ʒ] : genou, girafe. Pour avoir [g] devant e / i, ajoutez **u** : **guerre**, **guide**. Pour avoir [ʒ] devant a / o, ajoutez **e** : **mangeons**, **nageait**.'), { variant: 'tip' }),
      pick('A2', choose, ['musique', 'musike', 'musice', 'musiqe'], { fr: 'J’adore la ___ québécoise.' }),
      pick('A2', choose, ['guide', 'gide', 'ghide', 'gyde'], { fr: 'Le ___ nous a fait visiter le musée.' }),
      pick('A2', choose, ['mangeons', 'mangons', 'manjons', 'mangéons'], { fr: 'Nous ___ à midi.', explain: b('Keep [ʒ] before o: add e (mangeons).', 'Pour garder [ʒ] devant o, ajoutez e (mangeons).') }),
      pick('A2', choose, ['commençons', 'commencons', 'commenssons', 'commenceons'], { fr: 'Nous ___ le cours à 9 h.', explain: b('Keep [s] before o: ç (commençons).', 'Pour garder [s] devant o : ç (commençons).') }),
      { kind: 'fill', prompt: b('Complete with g, ge or gu.', 'Complétez avec g, ge ou gu.'), text: 'Nous voya___ons en été. La ___erre est finie. Il porte des ___ants.', answers: [['ge'], ['gu'], ['g']], strict: true },
      { kind: 'dictation', prompt: b('Write what you hear.', 'Écrivez ce que vous entendez.'), text: 'Nous mangeons quelque chose au café de la gare.', voice: 'm', strict: true },
    ],
    notes: {
      points: [
        b('[k]: c + a / o / u; qu + e / i; k in foreign words.', '[k] : c + a / o / u ; qu + e / i ; k dans les mots étrangers.'),
        b('[g]: g + a / o / u; gu + e / i (guerre, guide).', '[g] : g + a / o / u ; gu + e / i (guerre, guide).'),
        b('[ʒ]: g + e / i; ge + a / o (mangeons, nageait).', '[ʒ] : g + e / i ; ge + a / o (mangeons, nageait).'),
        b('Verbs in -cer and -ger keep their sound: commençons, mangeons.', 'Les verbes en -cer et -ger gardent leur son : commençons, mangeons.'),
      ],
      vocab: [['la guerre', b('war', 'conflit armé')], ['le gant', b('glove', 'pour la main')], ['voyager', b('to travel', 'faire un voyage')], ['quelque chose', b('something', 'une chose')]],
    },
  },
  {
    id: 'spelling-consonant-sounds-3',
    slug: { en: 'consonant-sounds-practice', fr: 'entrainement-sons-consonnes' },
    title: b('Practice: dictation and proofreading', 'Entraînement : dictée et relecture'),
    summary: b('Apply the s / c / g rules in dictations and correct a text full of mistakes.', 'Appliquer les règles de s / c / g en dictée et corriger un texte plein d’erreurs.'),
    objectives: [b('Write dictated sentences without errors', 'Écrire des phrases dictées sans erreur'), b('Spot spelling mistakes', 'Repérer les fautes d’orthographe'), b('Conjugate -cer and -ger verbs', 'Conjuguer les verbes en -cer et -ger')],
    minutes: 13,
    steps: [
      { kind: 'conjugate', prompt: b('Conjugate manger in the present.', 'Conjuguez manger au présent.'), verb: 'manger', tense: b('present', 'présent'), forms: [['je', 'mange'], ['tu', 'manges'], ['il / elle', 'mange'], ['nous', 'mangeons'], ['vous', 'mangez'], ['ils / elles', 'mangent']], given: [0] },
      { kind: 'conjugate', prompt: b('Conjugate lancer in the imparfait.', 'Conjuguez lancer à l’imparfait.'), verb: 'lancer', tense: b('imparfait', 'imparfait'), forms: [['je', 'lançais'], ['tu', 'lançais'], ['il / elle', 'lançait'], ['nous', 'lancions'], ['vous', 'lanciez'], ['ils / elles', 'lançaient']], given: [0] },
      pick('A2', b('Which sentence has NO mistake?', 'Quelle phrase ne contient AUCUNE faute ?'), ['Le garçon a reçu un cadeau.', 'Le garcon a reçu un cadeau.', 'Le garçon a recu un cadeau.', 'Le garsson a reçu un cadeau.']),
      pick('A2', b('Which word is spelled correctly?', 'Quel mot est bien écrit ?'), ['la boisson', 'la boison', 'la boiçon', 'la boisçon']),
      pick('A2', b('Which word is spelled correctly?', 'Quel mot est bien écrit ?'), ['la langue', 'la lange', 'la lanque', 'la langeu']),
      { kind: 'dictation', prompt: b('Write what you hear.', 'Écrivez ce que vous entendez.'), text: 'Nous commençons la leçon de français.', voice: 'f2', strict: true },
      { kind: 'dictation', prompt: b('Write what you hear.', 'Écrivez ce que vous entendez.'), text: 'Les garçons nageaient dans la piscine.', voice: 'm2', strict: true },
    ],
    notes: {
      points: [
        b('-cer verbs: ç before a / o (nous commençons, il lançait).', 'Verbes en -cer : ç devant a / o (nous commençons, il lançait).'),
        b('-ger verbs: ge before a / o (nous mangeons, elle nageait).', 'Verbes en -ger : ge devant a / o (nous mangeons, elle nageait).'),
        b('Reread each word with c, g or s and check the next vowel.', 'Relisez chaque mot avec c, g ou s et vérifiez la voyelle qui suit.'),
        b('In the TCF and TEF, these mistakes cost points in writing.', 'Au TCF et au TEF, ces fautes coûtent des points à l’écrit.'),
      ],
      vocab: [['la boisson', b('drink', 'ce qu’on boit')], ['la leçon', b('lesson', 'cours')], ['la piscine', b('swimming pool', 'bassin pour nager')], ['lancer', b('to throw', 'jeter')]],
    },
  },
];

export default lessons;
