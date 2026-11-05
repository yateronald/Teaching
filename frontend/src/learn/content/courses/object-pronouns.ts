import { b, type Lesson } from '../../types';
import { card, pick } from '../kit';

const choose = b('Choose the right pronoun.', 'Choisissez le bon pronom.');

const lessons: Lesson[] = [
  {
    id: 'object-pronouns-1',
    slug: { en: 'le-la-les', fr: 'le-la-les' },
    title: b('Direct pronouns: le, la, les', 'Les pronoms directs : le, la, les'),
    summary: b('Replace a direct object with le, la, l’, les and place it before the verb.', 'Remplacer un complément direct par le, la, l’, les et le placer devant le verbe.'),
    objectives: [b('Recognise a direct object', 'Reconnaître un complément direct'), b('Replace it with le, la, l’, les', 'Le remplacer par le, la, l’, les'), b('Place the pronoun before the verb', 'Placer le pronom devant le verbe')],
    minutes: 13,
    steps: [
      card(b('Direct object = no preposition', 'Complément direct = sans préposition'), b('A direct object follows the verb **without** à or de: Je regarde **la télé**. Replace it with **le** (masc.), **la** (fem.), **l’** (vowel), **les** (plural), placed **before** the verb: Je **la** regarde. Also **me, te, nous, vous**: Tu **me** vois ?', 'Le complément direct suit le verbe **sans** à ni de : Je regarde **la télé**. On le remplace par **le**, **la**, **l’**, **les**, placé **devant** le verbe : Je **la** regarde. Aussi **me, te, nous, vous** : Tu **me** vois ?'), {
        examples: [{ fr: 'Tu connais Marc ? Oui, je le connais.', tr: 'Do you know Marc? Yes, I know him.' }, { fr: 'Où sont mes clés ? Je les cherche partout.', tr: 'Where are my keys? I’m looking for them everywhere.' }, { fr: 'Cette chanson, je l’adore !', tr: 'This song, I love it!' }],
      }),
      pick('A2', choose, ['la', 'le', 'les', 'lui'], { fr: 'Tu prends la voiture ? Oui, je ___ prends.' }),
      pick('A2', choose, ['les', 'la', 'leur', 'des'], { fr: 'Tu as tes billets ? Oui, je ___ ai.' }),
      pick('A2', choose, ['l’', 'le', 'la', 'lui'], { fr: 'Ce film, je ___ aime beaucoup.' }),
      card(b('With an infinitive', 'Avec un infinitif'), b('With two verbs (aller, vouloir, pouvoir + infinitive), the pronoun goes **before the infinitive**: Je vais **le** faire. Tu peux **les** appeler ?', 'Avec deux verbes (aller, vouloir, pouvoir + infinitif), le pronom se place **devant l’infinitif** : Je vais **le** faire. Tu peux **les** appeler ?'), { variant: 'tip' }),
      pick('A2', b('Which sentence is correct?', 'Quelle phrase est correcte ?'), ['Je vais la voir demain.', 'Je la vais voir demain.', 'Je vais voir la demain.', 'Je vais lui voir demain.']),
      { kind: 'fill', prompt: b('Replace the underlined words.', 'Remplacez les mots soulignés.'), text: 'Je lis le journal. → Je ___ lis. J’invite mes amis. → Je ___ invite.', answers: [['le'], ['les']] },
      { kind: 'speak', prompt: b('Say it aloud.', 'Dites-le à voix haute.'), text: 'Mes clés ? Je les cherche partout !', tr: 'My keys? I’m looking for them everywhere!' },
    ],
    notes: {
      points: [
        b('Direct object (no preposition) → le, la, l’, les; me, te, nous, vous.', 'Complément direct (sans préposition) → le, la, l’, les ; me, te, nous, vous.'),
        b('The pronoun goes before the conjugated verb: je la regarde.', 'Le pronom se place devant le verbe conjugué : je la regarde.'),
        b('With an infinitive: before the infinitive: je vais le faire.', 'Avec un infinitif : devant l’infinitif : je vais le faire.'),
        b('Le / la → l’ before a vowel: je l’aime.', 'Le / la → l’ devant une voyelle : je l’aime.'),
      ],
      vocab: [['chercher', b('to look for', 'essayer de trouver')], ['partout', b('everywhere', 'dans tous les endroits')], ['inviter', b('to invite', 'proposer de venir')]],
    },
  },
  {
    id: 'object-pronouns-2',
    slug: { en: 'lui-and-leur', fr: 'lui-et-leur' },
    title: b('Indirect pronouns: lui, leur', 'Les pronoms indirects : lui, leur'),
    summary: b('Replace à + person with lui and leur, and know which verbs take them.', 'Remplacer à + personne par lui et leur, et savoir quels verbes les demandent.'),
    objectives: [b('Recognise verbs + à + person', 'Reconnaître les verbes + à + personne'), b('Use lui and leur', 'Employer lui et leur'), b('Choose between le / la and lui', 'Choisir entre le / la et lui')],
    minutes: 13,
    steps: [
      card(b('À + person → lui / leur', 'À + personne → lui / leur'), b('Verbs like **parler à**, **téléphoner à**, **écrire à**, **répondre à**, **demander à**, **donner à** take an indirect object. Replace **à + one person** with **lui** (him or her), **à + several** with **leur**: Je parle **à ma mère** → Je **lui** parle.', 'Les verbes comme **parler à**, **téléphoner à**, **écrire à**, **répondre à**, **demander à**, **donner à** prennent un complément indirect. Remplacez **à + une personne** par **lui** (homme ou femme), **à + plusieurs** par **leur** : Je parle **à ma mère** → Je **lui** parle.'), {
        examples: [{ fr: 'Tu as téléphoné à Sophie ? Oui, je lui ai téléphoné hier.', tr: 'Did you call Sophie? Yes, I called her yesterday.' }, { fr: 'J’écris souvent à mes parents. Je leur écris chaque dimanche.', tr: 'I often write to my parents. I write to them every Sunday.' }],
      }),
      pick('A2', choose, ['lui', 'la', 'le', 'leur'], { fr: 'Tu réponds à ta sœur ? Oui, je ___ réponds.' }),
      pick('A2', choose, ['leur', 'les', 'lui', 'leurs'], { fr: 'Je donne des bonbons aux enfants. → Je ___ donne des bonbons.' }),
      card(b('The classic trap', 'Le piège classique'), b('Same English verb, different French construction: **aider quelqu’un** (direct → **le / la**): je **l’**aide. **téléphoner à quelqu’un** (indirect → **lui**): je **lui** téléphone. **Regarder, écouter, attendre, appeler** are direct; **parler, répondre, téléphoner, sourire** take à.', 'Même idée, construction différente : **aider quelqu’un** (direct → **le / la**) : je **l’**aide. **téléphoner à quelqu’un** (indirect → **lui**) : je **lui** téléphone. **Regarder, écouter, attendre, appeler** sont directs ; **parler, répondre, téléphoner, sourire** prennent à.'), { variant: 'trap' }),
      { kind: 'categorize', prompt: b('Direct (le / la) or indirect (lui)?', 'Direct (le / la) ou indirect (lui) ?'), buckets: [b('le / la', 'le / la'), b('lui', 'lui')], items: [{ text: 'aider', bucket: 0 }, { text: 'téléphoner', bucket: 1 }, { text: 'attendre', bucket: 0 }, { text: 'répondre', bucket: 1 }, { text: 'appeler', bucket: 0 }, { text: 'sourire', bucket: 1 }] },
      pick('A2', choose, ['l’', 'lui', 'leur', 'la lui'], { fr: 'J’attends Marie depuis une heure. Je ___ attends encore.' }),
      { kind: 'fill', prompt: b('Replace with a pronoun.', 'Remplacez par un pronom.'), text: 'Je parle à mon directeur. → Je ___ parle. J’appelle mon directeur. → Je ___ appelle.', answers: [['lui'], ['l’', 'l\'']] },
      { kind: 'speak', prompt: b('Say it aloud.', 'Dites-le à voix haute.'), text: 'Je leur écris chaque dimanche et je leur téléphone le mercredi.', tr: 'I write to them every Sunday and call them on Wednesdays.' },
    ],
    notes: {
      points: [
        b('À + one person → lui (him / her); à + several → leur.', 'À + une personne → lui ; à + plusieurs → leur.'),
        b('Indirect verbs: parler, téléphoner, écrire, répondre, demander, donner, sourire à.', 'Verbes indirects : parler, téléphoner, écrire, répondre, demander, donner, sourire à.'),
        b('Direct verbs: aider, appeler, attendre, regarder, écouter quelqu’un.', 'Verbes directs : aider, appeler, attendre, regarder, écouter quelqu’un.'),
        b('Leur (pronoun) never takes s; leurs (possessive) can: je leur parle / leurs enfants.', 'Leur (pronom) ne prend jamais de s ; leurs (possessif) oui : je leur parle / leurs enfants.'),
      ],
      vocab: [['répondre à', b('to answer', 'donner une réponse')], ['sourire à', b('to smile at', 'faire un sourire')], ['le bonbon', b('sweet, candy', 'friandise')]],
    },
  },
  {
    id: 'object-pronouns-3',
    slug: { en: 'y-and-en', fr: 'y-et-en' },
    title: b('Y and en', 'Y et en'),
    summary: b('Use y for places and à + thing, and en for quantities and de + thing.', 'Employer y pour les lieux et à + chose, et en pour les quantités et de + chose.'),
    objectives: [b('Replace a place with y', 'Remplacer un lieu par y'), b('Replace a quantity with en', 'Remplacer une quantité par en'), b('Keep the number with en', 'Garder le nombre avec en')],
    minutes: 13,
    steps: [
      card(b('Y = there / about it', 'Y = là / à cela'), b('**Y** replaces a **place** (à, en, dans, chez…): Tu vas **à la banque** ? Oui, j’**y** vais. It also replaces **à + thing**: Tu penses **à ton examen** ? Oui, j’**y** pense.', '**Y** remplace un **lieu** (à, en, dans, chez…) : Tu vas **à la banque** ? Oui, j’**y** vais. Il remplace aussi **à + chose** : Tu penses **à ton examen** ? Oui, j’**y** pense.'), {
        examples: [{ fr: 'Tu habites au Canada depuis longtemps ? J’y habite depuis trois ans.', tr: 'Have you lived in Canada long? I’ve lived there for three years.' }, { fr: 'On y va !', tr: 'Let’s go!' }],
      }),
      card(b('En = some / of it', 'En = en quantité / de cela'), b('**En** replaces **du, de la, des + noun** and quantities: Tu veux **du café** ? Oui, j’**en** veux. With a number or quantity, **keep it**: Tu as **des enfants** ? J’**en** ai **deux**. Tu as **beaucoup de travail** ? J’**en** ai **beaucoup**.', '**En** remplace **du, de la, des + nom** et les quantités : Tu veux **du café** ? Oui, j’**en** veux. Avec un nombre ou une quantité, **gardez-le** : Tu as **des enfants** ? J’**en** ai **deux**. J’**en** ai **beaucoup**.'), { variant: 'tip' }),
      pick('A2', b('Choose y or en.', 'Choisissez y ou en.'), ['y', 'en', 'le', 'lui'], { fr: 'Tu vas au marché samedi ? Oui, j’___ vais.' }),
      pick('A2', b('Choose y or en.', 'Choisissez y ou en.'), ['en', 'y', 'les', 'leur'], { fr: 'Tu as des frères ? Oui, j’___ ai trois.' }),
      pick('A2', b('Choose y or en.', 'Choisissez y ou en.'), ['en', 'y', 'la', 'lui'], { fr: 'Elle parle souvent de son voyage ? Oui, elle ___ parle tout le temps.' }),
      pick('A2', b('Which answer is correct?', 'Quelle réponse est correcte ?'), ['J’en ai deux.', 'J’en ai.', 'Je les ai deux.', 'J’y ai deux.'], { fr: 'Tu as combien de voitures ?' }),
      { kind: 'fill', prompt: b('Answer with y or en.', 'Répondez avec y ou en.'), text: 'Tu manges de la viande ? — Non, je n’___ mange pas. Tu vas à Québec ? — Oui, j’___ vais demain.', answers: [['en'], ['y']] },
      { kind: 'speak', prompt: b('Say it aloud.', 'Dites-le à voix haute.'), text: 'Des enfants ? J’en ai deux. Le Canada ? J’y habite depuis trois ans.', tr: 'Children? I have two. Canada? I’ve lived there for three years.' },
    ],
    notes: {
      points: [
        b('Y = place (à, en, dans, chez + place) or à + thing: j’y vais, j’y pense.', 'Y = lieu (à, en, dans, chez + lieu) ou à + chose : j’y vais, j’y pense.'),
        b('En = du / de la / des + noun, de + thing, quantities: j’en veux, j’en parle.', 'En = du / de la / des + nom, de + chose, quantités : j’en veux, j’en parle.'),
        b('Keep the number with en: j’en ai deux, j’en ai beaucoup.', 'Gardez le nombre avec en : j’en ai deux, j’en ai beaucoup.'),
        b('Y is for things and places, not people: je pense à mon examen → j’y pense; je pense à ma mère → je pense à elle.', 'Y remplace des choses et des lieux, pas des personnes : je pense à mon examen → j’y pense ; je pense à ma mère → je pense à elle.'),
      ],
      vocab: [['penser à', b('to think about', 'avoir en tête')], ['longtemps', b('a long time', 'beaucoup de temps')], ['tout le temps', b('all the time', 'toujours')]],
    },
  },
];

export default lessons;
