import { b, type Lesson } from '../../types';
import { card, pick } from '../kit';

const choose = b('Choose the right spelling.', 'Choisissez la bonne orthographe.');

const lessons: Lesson[] = [
  {
    id: 'spelling-silent-letters-1',
    slug: { en: 'finding-the-silent-final-letter', fr: 'trouver-la-lettre-muette-finale' },
    title: b('Finding the silent final letter', 'Trouver la lettre muette finale'),
    summary: b('Use the feminine or a related word to find the silent letter: grand → grande, lait → laitier.', 'Utiliser le féminin ou un mot de la même famille pour trouver la lettre muette : grand → grande, lait → laitier.'),
    objectives: [b('Use the feminine to find the letter', 'Utiliser le féminin pour trouver la lettre'), b('Use a word of the same family', 'Utiliser un mot de la même famille'), b('Write common words with silent endings', 'Écrire les mots courants à finale muette')],
    minutes: 12,
    steps: [
      card(b('The feminine test', 'Le test du féminin'), b('Put the adjective in the feminine: the silent letter appears. grand → **grande** (d), petit → **petite** (t), gris → **grise** (s), long → **longue** (g), heureux → **heureuse** (x → s).', 'Mettez l’adjectif au féminin : la lettre muette apparaît. grand → **grande** (d), petit → **petite** (t), gris → **grise** (s), long → **longue** (g).'), {
        examples: [{ fr: 'un grand jardin, une grande maison', tr: 'd is heard in the feminine' }, { fr: 'un chat gris, une souris grise', tr: 's is heard in the feminine' }],
      }),
      card(b('The family test', 'Le test de la famille'), b('A related word reveals the letter: lait → **laitier** (t), chant → **chanter** (t), bord → **border** (d), sirop → **siroter** (p), gros → **grosse** (s).', 'Un mot de la même famille révèle la lettre : lait → **laitier** (t), chant → **chanter** (t), bord → **border** (d), sirop → **siroter** (p), gros → **grosse** (s).'), { variant: 'tip' }),
      pick('A2', choose, ['le lait', 'le lai', 'le laid', 'le lais'], { fr: 'Je bois du ___ le matin.' }),
      pick('A2', choose, ['le chant', 'le chan', 'le champ', 'le chand'], { fr: 'Le ___ des oiseaux me réveille.', explain: b('chant → chanter (t). Le champ (field) is another word.', 'chant → chanter (t). Le champ est un autre mot.') }),
      pick('A2', choose, ['le bord', 'le bor', 'le bort', 'le bords'], { fr: 'Nous marchons au ___ de l’eau.' }),
      pick('A2', choose, ['le sirop', 'le siro', 'le sirot', 'le siros'], { fr: 'Au Québec, on adore le ___ d’érable.' }),
      { kind: 'fill', prompt: b('Find the silent letter.', 'Trouvez la lettre muette.'), text: 'Un enfan___ (enfance), un ran___ (ranger), un retar___ (retarder).', answers: [['t'], ['g'], ['d']], strict: true },
      { kind: 'dictation', prompt: b('Write what you hear.', 'Écrivez ce que vous entendez.'), text: 'Le petit enfant boit du lait chaud.', voice: 'f', strict: true },
    ],
    notes: {
      points: [
        b('Feminine test: grand(e), petit(e), gris(e), long(ue).', 'Test du féminin : grand(e), petit(e), gris(e), long(ue).'),
        b('Family test: lait → laitier, chant → chanter, bord → border, rang → ranger.', 'Test de la famille : lait → laitier, chant → chanter, bord → border, rang → ranger.'),
        b('When no test works, learn the word: le temps, le corps, le poids.', 'Si aucun test ne marche, apprenez le mot : le temps, le corps, le poids.'),
        b('Sirop d’érable = maple syrup.', 'Sirop d’érable = spécialité du Québec.'),
      ],
      vocab: [['le champ', b('field', 'terrain cultivé')], ['l’érable (m.)', b('maple', 'arbre du Canada')], ['le retard', b('delay', 'arrivée tardive')], ['le rang', b('row, rank', 'ligne')]],
    },
  },
  {
    id: 'spelling-silent-letters-2',
    slug: { en: 'silent-h-and-aspirated-h', fr: 'h-muet-et-h-aspire' },
    title: b('The silent h and the aspirated h', 'Le h muet et le h aspiré'),
    summary: b('The h is never pronounced, but it changes elision and liaison: l’homme but le héros.', 'Le h ne se prononce jamais, mais il change l’élision et la liaison : l’homme mais le héros.'),
    objectives: [b('Know that h is never pronounced', 'Savoir que le h ne se prononce jamais'), b('Elide before a silent h', 'Élider devant un h muet'), b('Recognise common aspirated h words', 'Reconnaître les mots courants à h aspiré')],
    minutes: 13,
    steps: [
      card(b('Silent h: like a vowel', 'H muet : comme une voyelle'), b('Most words with h behave as if they began with a vowel: **l’**homme, **l’**hôpital, **l’**hiver, **les_**hommes (liaison z), **un_**hôtel.', 'La plupart des mots en h se comportent comme s’ils commençaient par une voyelle : **l’**homme, **l’**hôpital, **l’**hiver, **les_**hommes (liaison z), **un_**hôtel.'), {
        examples: [{ fr: 'l’homme, les hommes', tr: 'elision and liaison' }, { fr: 'Il travaille à l’hôpital.', tr: 'He works at the hospital.' }],
      }),
      card(b('Aspirated h: like a consonant', 'H aspiré : comme une consonne'), b('A short list blocks elision and liaison (still silent!): **le** héros, **la** honte, **le** hockey, **le** hamburger, **la** hauteur, **le** haricot, **les** | haricots (no liaison). Dictionaries mark it with an asterisk (*).', 'Une petite liste empêche l’élision et la liaison (toujours muet !) : **le** héros, **la** honte, **le** hockey, **le** hamburger, **la** hauteur, **le** haricot, **les** | haricots (pas de liaison). Les dictionnaires le marquent d’un astérisque.'), { variant: 'tip' }),
      pick('A2', choose, ['le hockey', 'l’hockey', 'lhockey', 'le l’hockey'], { fr: 'Au Canada, ___ est très populaire.' }),
      pick('A2', choose, ['l’hiver', 'le hiver', 'lhiver', 'la hiver'], { fr: '___ est long au Québec.' }),
      pick('A2', choose, ['l’heure', 'la heure', 'le heure', 'lheure'], { fr: 'Tu as vu ___ ?' }),
      { kind: 'categorize', prompt: b('Silent h (l’) or aspirated h (le / la)?', 'H muet (l’) ou h aspiré (le / la) ?'), buckets: [b('l’…', 'l’…'), b('le / la…', 'le / la…')], items: [{ text: 'homme', bucket: 0 }, { text: 'héros', bucket: 1 }, { text: 'hôtel', bucket: 0 }, { text: 'hamburger', bucket: 1 }, { text: 'histoire', bucket: 0 }, { text: 'honte', bucket: 1 }] },
      { kind: 'dictation', prompt: b('Write what you hear.', 'Écrivez ce que vous entendez.'), text: 'L’hiver, les enfants jouent au hockey.', voice: 'm', strict: true },
    ],
    notes: {
      points: [
        b('The h is never pronounced in French.', 'Le h ne se prononce jamais en français.'),
        b('Silent h: elision and liaison (l’homme, les_hommes).', 'H muet : élision et liaison (l’homme, les_hommes).'),
        b('Aspirated h: no elision, no liaison (le héros, les | haricots).', 'H aspiré : ni élision ni liaison (le héros, les | haricots).'),
        b('Common aspirated h: héros, honte, hockey, hamburger, haricot, hauteur, hibou.', 'H aspirés courants : héros, honte, hockey, hamburger, haricot, hauteur, hibou.'),
      ],
      vocab: [['le héros', b('hero', 'personne admirée')], ['la honte', b('shame', 'gêne')], ['le haricot', b('bean', 'légume')], ['l’histoire (f.)', b('history, story', 'récit')]],
    },
  },
  {
    id: 'spelling-silent-letters-3',
    slug: { en: 'silent-e-and-plural-endings', fr: 'e-muet-et-finales-du-pluriel' },
    title: b('Silent e and silent plural endings', 'Le e muet et les finales muettes du pluriel'),
    summary: b('Write the letters you do not hear: the e of the feminine, the s and x of the plural, the -ent of verbs.', 'Écrire les lettres qu’on n’entend pas : le e du féminin, le s et le x du pluriel, le -ent des verbes.'),
    objectives: [b('Write the silent feminine e', 'Écrire le e muet du féminin'), b('Write the silent plural s or x', 'Écrire le s ou le x muet du pluriel'), b('Write -ent for ils / elles', 'Écrire -ent pour ils / elles')],
    minutes: 13,
    steps: [
      card(b('You don’t hear it, you write it', 'On ne l’entend pas, on l’écrit'), b('Many endings are silent but essential: **-e** of the feminine (une amie **contente**), **-s / -x** of the plural (des **amis**, des **gâteaux**), **-ent** of verbs with ils / elles (ils **parlent**). Ask: who is the subject? Is it plural? Feminine?', 'Beaucoup de finales sont muettes mais indispensables : **-e** du féminin (une amie **contente**), **-s / -x** du pluriel (des **amis**, des **gâteaux**), **-ent** des verbes avec ils / elles (ils **parlent**). Demandez-vous : qui est le sujet ? Pluriel ? Féminin ?'), {
        examples: [{ fr: 'Mes amies sont arrivées hier.', tr: 'Five silent letters: s, e, s, e, s' }, { fr: 'Ils mangent des gâteaux.', tr: '-ent and -x are silent' }],
      }),
      pick('A2', choose, ['parlent', 'parle', 'parles', 'parlents'], { fr: 'Mes voisins ___ trois langues.' }),
      pick('A2', choose, ['gâteaux', 'gâteaus', 'gâteau', 'gâtaux'], { fr: 'J’ai acheté deux ___.' }),
      pick('A2', choose, ['fatiguée', 'fatigué', 'fatigués', 'fatiguer'], { fr: 'Ma sœur est très ___.' }),
      pick('A2', choose, ['jouent', 'joue', 'jouant', 'jouents'], { fr: 'Les enfants ___ dans le parc.' }),
      { kind: 'fill', prompt: b('Write the silent endings.', 'Écrivez les finales muettes.'), text: 'Les petit___ fille___ chant___ une chanson.', answers: [['es'], ['s'], ['ent']], strict: true },
      { kind: 'dictation', prompt: b('Write what you hear.', 'Écrivez ce que vous entendez.'), text: 'Mes amies sont contentes et elles chantent.', voice: 'f2', strict: true },
    ],
    notes: {
      points: [
        b('Feminine -e is silent but compulsory: une amie contente.', 'Le -e du féminin est muet mais obligatoire : une amie contente.'),
        b('Plural -s / -x: des amis, des gâteaux, des jeux.', 'Pluriel -s / -x : des amis, des gâteaux, des jeux.'),
        b('Verbs with ils / elles end in -ent (silent): ils parlent.', 'Les verbes avec ils / elles finissent en -ent (muet) : ils parlent.'),
        b('Find the subject first, then write the ending.', 'Trouvez d’abord le sujet, puis écrivez la terminaison.'),
      ],
      vocab: [['la chanson', b('song', 'musique avec paroles')], ['content', b('happy', 'satisfait')], ['le jeu', b('game', 'divertissement')]],
    },
  },
];

export default lessons;
