import { b, type Lesson } from '../../types';
import { card, pick } from '../kit';

const choose = b('Choose the right word.', 'Choisissez le bon mot.');

const lessons: Lesson[] = [
  {
    id: 'spelling-homophones-advanced-1',
    slug: { en: 'la-la-la-and-quel-quelle-qu-elle', fr: 'la-l-a-la-et-quel-qu-elle' },
    title: b('La / l’a / là and quel / quelle / qu’elle', 'La / l’a / là et quel / quelle / qu’elle'),
    summary: b('Tell apart words that sound identical with simple replacement tests.', 'Distinguer des mots qui se prononcent pareil grâce à des tests de remplacement simples.'),
    objectives: [b('Choose la, l’a or là', 'Choisir la, l’a ou là'), b('Choose quel(le) or qu’elle', 'Choisir quel(le) ou qu’elle'), b('Use replacement tests', 'Employer les tests de remplacement')],
    minutes: 13,
    steps: [
      card(b('La, l’a, là', 'La, l’a, là'), b('**la** = article or pronoun (la maison; je la vois). **l’a** = l’ + verb avoir → test: replace with **l’avait**: il **l’a** vu (il l’avait vu). **là** = place → test: replace with **ici**: je suis **là**.', '**la** = article ou pronom (la maison ; je la vois). **l’a** = l’ + verbe avoir → test : remplacez par **l’avait** : il **l’a** vu. **là** = lieu → test : remplacez par **ici** : je suis **là**.'), {
        examples: [{ fr: 'La clé ? Il l’a posée là, sur la table.', tr: 'The key? He put it there, on the table.' }],
      }),
      pick('B1', choose, ['l’a', 'la', 'là', 'l’as'], { fr: 'Ce film, elle ___ déjà vu deux fois.' }),
      pick('B1', choose, ['là', 'la', 'l’a', 'las'], { fr: 'Pose ton sac ___, près de la porte.' }),
      card(b('Quel, quelle, qu’elle', 'Quel, quelle, qu’elle'), b('**quel / quelle / quels / quelles** + noun (agrees): **Quelle** heure est-il ? **qu’elle** = que + elle → test: replace with **qu’il**: Je pense **qu’elle** viendra (qu’il viendra).', '**quel / quelle / quels / quelles** + nom (s’accorde) : **Quelle** heure est-il ? **qu’elle** = que + elle → test : remplacez par **qu’il** : Je pense **qu’elle** viendra (qu’il viendra).'), { variant: 'tip' }),
      pick('B1', choose, ['qu’elle', 'quelle', 'quel', 'quelles'], { fr: 'Je crois ___ a raison.' }),
      pick('B1', choose, ['Quelles', 'Quelle', 'Qu’elles', 'Quels'], { fr: '___ langues parlez-vous ?' }),
      { kind: 'fill', prompt: b('Write la, l’a or là.', 'Écrivez la, l’a ou là.'), text: 'Ma voiture ? Mon frère ___ empruntée ce matin. Elle n’est pas ___.', answers: [['l’a', 'l\'a'], ['là']], strict: true },
      { kind: 'dictation', prompt: b('Write what you hear.', 'Écrivez ce que vous entendez.'), text: 'Je pense qu’elle l’a oubliée là-bas.', voice: 'f2', strict: true },
    ],
    notes: {
      points: [
        b('la (article / pronoun), l’a (= l’avait), là (= ici).', 'la (article / pronom), l’a (= l’avait), là (= ici).'),
        b('quel(le)(s) + noun; qu’elle = qu’il in the feminine.', 'quel(le)(s) + nom ; qu’elle = qu’il au féminin.'),
        b('Always test by replacing: l’avait, ici, qu’il.', 'Testez toujours en remplaçant : l’avait, ici, qu’il.'),
        b('Là-bas, celle-là, ce jour-là: là with a hyphen.', 'Là-bas, celle-là, ce jour-là : là avec un trait d’union.'),
      ],
      vocab: [['emprunter', b('to borrow', 'prendre pour un temps')], ['avoir raison', b('to be right', 'dire vrai')], ['là-bas', b('over there', 'à cet endroit éloigné')]],
    },
  },
  {
    id: 'spelling-homophones-advanced-2',
    slug: { en: 'peu-peut-peux-and-sans-s-en-c-en', fr: 'peu-peut-peux-et-sans-s-en-c-en' },
    title: b('Peu / peut / peux and sans / s’en / c’en', 'Peu / peut / peux et sans / s’en / c’en'),
    summary: b('Master two tricky groups of homophones with quick tests.', 'Maîtriser deux groupes d’homophones difficiles avec des tests rapides.'),
    objectives: [b('Choose peu, peut or peux', 'Choisir peu, peut ou peux'), b('Choose sans, s’en, c’en or sens', 'Choisir sans, s’en, c’en ou sens'), b('Check the subject before the verb', 'Vérifier le sujet avant le verbe')],
    minutes: 13,
    steps: [
      card(b('Peu, peut, peux', 'Peu, peut, peux'), b('**peu** = little, not much (un **peu**, **peu** de temps). **peut** = il / elle / on (pouvoir) → test: **pouvait**. **peux** = je / tu (pouvoir): je **peux**, tu **peux**.', '**peu** = pas beaucoup (un **peu**, **peu** de temps). **peut** = il / elle / on (pouvoir) → test : **pouvait**. **peux** = je / tu (pouvoir) : je **peux**, tu **peux**.'), {
        examples: [{ fr: 'Tu peux venir ? Il peut, mais il a peu de temps.', tr: 'Can you come? He can, but he has little time.' }],
      }),
      pick('B1', choose, ['peu', 'peut', 'peux', 'peus'], { fr: 'Il parle un ___ français.' }),
      pick('B1', choose, ['peut', 'peu', 'peux', 'peuvent'], { fr: 'On ___ partir maintenant ?' }),
      pick('B1', choose, ['peux', 'peut', 'peu', 'peus'], { fr: 'Est-ce que je ___ vous aider ?' }),
      card(b('Sans, s’en, c’en, sens', 'Sans, s’en, c’en, sens'), b('**sans** = without (**sans** sucre). **s’en** = se + en, before a verb: il **s’en** va (test: **m’en**: je m’en vais). **c’en** = cela + en, in “**c’en est trop**”. **sens** = verb sentir or the noun (le **sens**).', '**sans** = absence (**sans** sucre). **s’en** = se + en, devant un verbe : il **s’en** va (test : **m’en** : je m’en vais). **c’en** = cela + en, dans « **c’en est trop** ». **sens** = verbe sentir ou nom (le **sens**).'), { variant: 'tip' }),
      pick('B1', choose, ['sans', 's’en', 'c’en', 'sens'], { fr: 'Un café ___ sucre, s’il vous plaît.' }),
      pick('B1', choose, ['s’en', 'sans', 'c’en', 'sent'], { fr: 'Elle a fini son travail et elle ___ va.' }),
      { kind: 'fill', prompt: b('Write peu, peut or peux.', 'Écrivez peu, peut ou peux.'), text: 'Tu ___ m’aider ? J’ai ___ de temps et Marc ne ___ pas venir.', answers: [['peux'], ['peu'], ['peut']], strict: true },
      { kind: 'dictation', prompt: b('Write what you hear.', 'Écrivez ce que vous entendez.'), text: 'Il peut partir sans payer, il s’en va.', voice: 'm', strict: true },
    ],
    notes: {
      points: [
        b('peu (not much), peut (il / elle / on = pouvait), peux (je / tu).', 'peu (pas beaucoup), peut (il / elle / on = pouvait), peux (je / tu).'),
        b('sans (without), s’en (se + en, before a verb), c’en (c’en est trop), sens (sentir / le sens).', 'sans (absence), s’en (se + en, devant un verbe), c’en (c’en est trop), sens (sentir / le sens).'),
        b('Test s’en with m’en / t’en: je m’en vais → il s’en va.', 'Testez s’en avec m’en / t’en : je m’en vais → il s’en va.'),
        b('Find the subject before writing a verb.', 'Trouvez le sujet avant d’écrire un verbe.'),
      ],
      vocab: [['s’en aller', b('to go away', 'partir')], ['c’en est trop', b('that’s too much', 'ça suffit')], ['le sens', b('meaning, direction', 'signification')]],
    },
  },
  {
    id: 'spelling-homophones-advanced-3',
    slug: { en: 'quand-quant-qu-en-and-leur-leurs', fr: 'quand-quant-qu-en-et-leur-leurs' },
    title: b('Quand / quant / qu’en and leur / leurs', 'Quand / quant / qu’en et leur / leurs'),
    summary: b('Tell apart quand, quant à, qu’en, and the pronoun leur from the possessive leur(s).', 'Distinguer quand, quant à, qu’en, et le pronom leur du possessif leur(s).'),
    objectives: [b('Choose quand, quant à or qu’en', 'Choisir quand, quant à ou qu’en'), b('Distinguish leur (pronoun) and leur(s) (possessive)', 'Distinguer leur (pronom) et leur(s) (possessif)'), b('Proofread a short text', 'Relire un court texte')],
    minutes: 13,
    steps: [
      card(b('Quand, quant, qu’en', 'Quand, quant, qu’en'), b('**quand** = when (**Quand** pars-tu ?). **quant à** = as for, always followed by à / au / aux (**Quant à** moi, je reste). **qu’en** = que + en (**Qu’en** penses-tu ? Je ne bois **qu’en** été).', '**quand** = moment (**Quand** pars-tu ?). **quant à** = en ce qui concerne, toujours suivi de à / au / aux (**Quant à** moi, je reste). **qu’en** = que + en (**Qu’en** penses-tu ?).'), {
        examples: [{ fr: 'Quand il pleut, je reste chez moi. Quant à mon frère, il sort.', tr: 'When it rains I stay home. As for my brother, he goes out.' }],
      }),
      pick('B1', choose, ['Quant', 'Quand', 'Qu’en', 'Camp'], { fr: '___ aux enfants, ils dorment déjà.' }),
      pick('B1', choose, ['Qu’en', 'Quand', 'Quant', 'Qu’an'], { fr: '___ pensez-vous ?' }),
      card(b('Leur or leurs?', 'Leur ou leurs ?'), b('**leur** before a **verb** = pronoun (to them), **never s**: je **leur** parle. **leur / leurs** before a **noun** = possessive (their): **leur** maison (one), **leurs** enfants (several).', '**leur** devant un **verbe** = pronom, **jamais de s** : je **leur** parle. **leur / leurs** devant un **nom** = possessif : **leur** maison (une seule), **leurs** enfants (plusieurs).'), { variant: 'trap' }),
      pick('B1', choose, ['leur', 'leurs', 'leure', 'l’heure'], { fr: 'J’ai téléphoné à mes parents et je ___ ai dit bonjour.' }),
      pick('B1', choose, ['leurs', 'leur', 'leures', 'l’heurs'], { fr: 'Les voisins promènent ___ deux chiens.' }),
      { kind: 'fill', prompt: b('Write leur or leurs.', 'Écrivez leur ou leurs.'), text: 'Mes amis ont vendu ___ voiture ; je ___ ai prêté la mienne pour ___ vacances.', answers: [['leur'], ['leur'], ['leurs']], strict: true },
      { kind: 'dictation', prompt: b('Write what you hear.', 'Écrivez ce que vous entendez.'), text: 'Quand ils arrivent, je leur montre leurs chambres.', voice: 'f', strict: true },
    ],
    notes: {
      points: [
        b('quand (when), quant à / au / aux (as for), qu’en (que + en).', 'quand (moment), quant à / au / aux (en ce qui concerne), qu’en (que + en).'),
        b('leur + verb = pronoun, never s (je leur parle).', 'leur + verbe = pronom, jamais de s (je leur parle).'),
        b('leur + singular noun, leurs + plural noun (possessive).', 'leur + nom singulier, leurs + nom pluriel (possessif).'),
        b('Proofread: for each homophone, apply the test.', 'Relecture : pour chaque homophone, appliquez le test.'),
      ],
      vocab: [['quant à', b('as for', 'en ce qui concerne')], ['montrer', b('to show', 'faire voir')], ['prêter', b('to lend', 'donner pour un temps')]],
    },
  },
];

export default lessons;
