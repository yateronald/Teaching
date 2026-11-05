import { b, type Lesson } from '../../types';

const lessons: Lesson[] = [
  {
    id: 'spelling-agreement-1',
    slug: { en: 'plural-and-feminine', fr: 'pluriel-et-feminin' },
    title: b('Plural and feminine of nouns and adjectives', 'Pluriel et féminin des noms et adjectifs'),
    summary: b('The general rules and the endings that change: -al → -aux, -eau → -eaux, -eux → -euse, -if → -ive.', 'Les règles générales et les terminaisons qui changent : -al → -aux, -eau → -eaux, -eux → -euse, -if → -ive.'),
    objectives: [b('Form regular and irregular plurals', 'Former les pluriels réguliers et irréguliers'), b('Form the feminine of adjectives', 'Former le féminin des adjectifs'), b('Make adjectives agree with nouns', 'Accorder les adjectifs avec les noms')],
    minutes: 14,
    steps: [
      {
        kind: 'concept',
        title: b('The plural: s, and some exceptions', 'Le pluriel : s, et quelques exceptions'),
        body: b('Most nouns and adjectives add a silent **-s**. Words ending in **-s, -x, -z** do not change.', 'La plupart des noms et adjectifs prennent un **-s** muet. Les mots terminés par **-s, -x, -z** ne changent pas.'),
        table: { head: [b('Ending', 'Terminaison'), b('Plural', 'Pluriel'), b('Example', 'Exemple')], rows: [['-al', '-aux', 'un journal → des journ**aux**'], ['-eau, -au', '+ x', 'un gâteau → des gâteau**x**'], ['-eu', '+ x', 'un jeu → des jeu**x**'], ['-ou', '+ s (7 en -oux)', 'un trou → des trou**s** · un bijou → des bijou**x**'], ['-ail', '+ s (quelques -aux)', 'un détail → des détail**s** · un travail → des trav**aux**']] },
      },
      {
        kind: 'match',
        prompt: b('Singular and plural.', 'Singulier et pluriel.'),
        pairs: [['un animal', 'des animaux'], ['un bureau', 'des bureaux'], ['un prix', 'des prix'], ['un cheveu', 'des cheveux'], ['un festival', 'des festivals']],
      },
      {
        kind: 'concept',
        variant: 'trap',
        title: b('Festivals, bals, carnavals', 'Festivals, bals, carnavals'),
        body: b('A few -al nouns take a simple s: **des festivals, des bals, des carnavals, des récitals**. And note: **un œil → des yeux**.', 'Quelques noms en -al prennent un simple s : **des festivals, des bals, des carnavals, des récitals**. Et retenez : **un œil → des yeux**.'),
      },
      {
        kind: 'concept',
        title: b('The feminine of adjectives', 'Le féminin des adjectifs'),
        body: b('General rule: add **-e** (grand → grande). Adjectives already ending in -e do not change (jeune). Some endings change more:', 'Règle générale : on ajoute **-e** (grand → grande). Les adjectifs déjà terminés par -e ne changent pas (jeune). Certaines terminaisons changent davantage :'),
        table: { head: [b('Masculine', 'Masculin'), b('Feminine', 'Féminin')], rows: [['-eux : heureux', '-euse : heureuse'], ['-if : sportif', '-ive : sportive'], ['-er : cher', '-ère : chère'], ['-en : canadien', '-enne : canadienne'], ['-el : naturel', '-elle : naturelle'], ['beau, nouveau, vieux', 'belle, nouvelle, vieille']] },
      },
      {
        kind: 'fill',
        prompt: b('Make the adjective agree.', 'Accordez l’adjectif.'),
        text: 'Ma voisine est très ___ (sportif) et toujours ___ (heureux).',
        answers: [['sportive'], ['heureuse']],
        strict: true,
      },
      {
        kind: 'fill',
        prompt: b('Write the plural.', 'Écrivez le pluriel.'),
        text: 'Les ___ (journal) parlent des ___ (nouveau) ___ (hôpital).',
        answers: [['journaux'], ['nouveaux'], ['hôpitaux']],
        strict: true,
      },
      {
        kind: 'mcq',
        prompt: b('Which group is correct?', 'Quel groupe est correct ?'),
        options: ['de belles maisons anciennes', 'de beaux maisons anciens', 'de belle maisons anciennes', 'de belles maison ancienne'],
        answer: 0,
      },
      {
        kind: 'dictation',
        prompt: b('Write what you hear. Think about agreement!', 'Écrivez ce que vous entendez. Pensez aux accords !'),
        text: 'Les nouvelles voisines sont très gentilles.',
        strict: true,
      },
    ],
    notes: {
      points: [
        b('Plural: + s; -s, -x, -z unchanged; -al → -aux (except festivals, bals…); -eau, -eu → + x.', 'Pluriel : + s ; -s, -x, -z invariables ; -al → -aux (sauf festivals, bals…) ; -eau, -eu → + x.'),
        b('Feminine: + e; -eux → -euse, -if → -ive, -er → -ère, -en → -enne, -el → -elle.', 'Féminin : + e ; -eux → -euse, -if → -ive, -er → -ère, -en → -enne, -el → -elle.'),
        b('Irregular: beau → belle, nouveau → nouvelle, vieux → vieille; un œil → des yeux.', 'Irréguliers : beau → belle, nouveau → nouvelle, vieux → vieille ; un œil → des yeux.'),
      ],
      vocab: [['un journal, des journaux', b('newspaper(s)', 'publication')], ['heureux, heureuse', b('happy', 'content')], ['sportif, sportive', b('sporty', 'qui fait du sport')], ['nouveau, nouvelle', b('new', 'récent')]],
    },
  },
  {
    id: 'spelling-agreement-2',
    slug: { en: 'subject-verb-agreement', fr: 'accord-sujet-verbe' },
    title: b('Subject–verb agreement', 'L’accord du sujet et du verbe'),
    summary: b('Find the real subject, even when it is far from the verb or after it, and avoid the classic traps.', 'Trouver le vrai sujet, même éloigné du verbe ou placé après, et éviter les pièges classiques.'),
    objectives: [b('Find the subject with “qui est-ce qui ?”', 'Trouver le sujet avec « qui est-ce qui ? »'), b('Agree with a distant subject', 'Accorder avec un sujet éloigné'), b('Handle on, la plupart, chacun', 'Gérer on, la plupart, chacun')],
    minutes: 13,
    steps: [
      {
        kind: 'concept',
        title: b('Find the subject first', 'D’abord, trouver le sujet'),
        body: b('Ask **“qui est-ce qui + verb?”**. Watch out for words between the subject and the verb: they do not change the agreement.', 'Posez la question **« qui est-ce qui + verbe ? »**. Attention aux mots placés entre le sujet et le verbe : ils ne changent pas l’accord.'),
        examples: [{ fr: 'Les enfants de ma voisine jouent dehors.', tr: 'Qui est-ce qui joue ? les enfants → jouent' }, { fr: 'Le bruit des voitures me dérange.', tr: 'Qui est-ce qui dérange ? le bruit → dérange' }, { fr: 'Je les regarde.', tr: 'les is not the subject: je regarde' }],
      },
      {
        kind: 'mcq',
        prompt: b('Choose the right form.', 'Choisissez la bonne forme.'),
        fr: 'La liste des candidats ___ affichée à l’entrée.',
        options: ['est', 'sont', 'es', 'étaient'],
        answer: 0,
        explain: b('The subject is **la liste**, not les candidats.', 'Le sujet est **la liste**, pas les candidats.'),
      },
      {
        kind: 'concept',
        variant: 'trap',
        title: b('Traps', 'Les pièges'),
        points: [
          b('**On** takes a singular verb: on **va**, on **est** (even if it means “we”).', '**On** se conjugue au singulier : on **va**, on **est** (même s’il signifie « nous »).'),
          b('**La plupart des** + plural verb: la plupart des étudiants **réussissent**.', '**La plupart des** + verbe au pluriel : la plupart des étudiants **réussissent**.'),
          b('**Chacun**, **tout le monde** + singular: tout le monde **est** là.', '**Chacun**, **tout le monde** + singulier : tout le monde **est** là.'),
          b('After **qui**, agree with the antecedent: c’est moi qui **suis** responsable.', 'Après **qui**, accord avec l’antécédent : c’est moi qui **suis** responsable.'),
        ],
      },
      {
        kind: 'fill',
        prompt: b('Conjugate in the present.', 'Conjuguez au présent.'),
        text: 'Tout le monde ___ (être) prêt, mais la plupart des invités ___ (arriver) en retard.',
        answers: [['est'], ['arrivent']],
        strict: true,
      },
      {
        kind: 'categorize',
        prompt: b('Singular or plural verb?', 'Verbe au singulier ou au pluriel ?'),
        buckets: [b('Singular', 'Singulier'), b('Plural', 'Pluriel')],
        items: [{ text: 'On…', bucket: 0 }, { text: 'Chacun…', bucket: 0 }, { text: 'Le groupe d’amis…', bucket: 0 }, { text: 'La plupart des gens…', bucket: 1 }, { text: 'Mon frère et moi…', bucket: 1 }, { text: 'Beaucoup de touristes…', bucket: 1 }],
      },
      {
        kind: 'fill',
        prompt: b('Agree with the antecedent of qui.', 'Accordez avec l’antécédent de qui.'),
        text: 'C’est toi qui ___ (avoir) les clés ? Non, c’est nous qui les ___ (avoir).',
        answers: [['as'], ['avons']],
        strict: true,
      },
      {
        kind: 'dictation',
        prompt: b('Write what you hear.', 'Écrivez ce que vous entendez.'),
        text: 'Les élèves de cette classe préparent un spectacle.',
        strict: true,
        voice: 'm',
      },
    ],
    notes: {
      points: [
        b('Find the subject with “qui est-ce qui… ?”; words in between do not count.', 'Trouvez le sujet avec « qui est-ce qui… ? » ; les mots intercalés ne comptent pas.'),
        b('On, chacun, tout le monde, un groupe de → singular.', 'On, chacun, tout le monde, un groupe de → singulier.'),
        b('La plupart des, beaucoup de + plural noun → plural.', 'La plupart des, beaucoup de + nom pluriel → pluriel.'),
        b('qui agrees with its antecedent: c’est moi qui suis, c’est nous qui avons.', 'qui s’accorde avec son antécédent : c’est moi qui suis, c’est nous qui avons.'),
      ],
      vocab: [['la plupart des', b('most (of)', 'la majorité des')], ['tout le monde', b('everyone', 'toutes les personnes')], ['chacun', b('each one', 'chaque personne')]],
    },
  },
  {
    id: 'spelling-agreement-3',
    slug: { en: 'past-participle-agreement', fr: 'accord-du-participe-passe' },
    title: b('Past participle agreement', 'L’accord du participe passé'),
    summary: b('With être it agrees with the subject; with avoir, only with a direct object placed before.', 'Avec être, il s’accorde avec le sujet ; avec avoir, seulement avec un COD placé avant.'),
    objectives: [b('Agree with être', 'Accorder avec être'), b('Recognise a direct object placed before avoir', 'Reconnaître un COD placé avant avoir'), b('Proofread participles in a text', 'Relire les participes dans un texte')],
    minutes: 15,
    steps: [
      {
        kind: 'concept',
        title: b('With être: like an adjective', 'Avec être : comme un adjectif'),
        examples: [{ fr: 'Elle est partie.' }, { fr: 'Nous sommes arrivés à l’heure.' }, { fr: 'Les lettres sont envoyées.' }],
      },
      {
        kind: 'concept',
        title: b('With avoir: no agreement… except one case', 'Avec avoir : pas d’accord… sauf un cas'),
        body: b('With avoir, the participle does **not** agree with the subject: elles **ont mangé**. It agrees only with a **direct object placed before** the verb (often a pronoun **la, les, l’** or **que**).', 'Avec avoir, le participe ne s’accorde **pas** avec le sujet : elles **ont mangé**. Il s’accorde seulement avec un **COD placé avant** le verbe (souvent un pronom **la, les, l’** ou **que**).'),
        examples: [{ fr: 'J’ai acheté une robe.', tr: 'object after: no agreement' }, { fr: 'Je l’ai achetée hier.', tr: 'l’ (= la robe) before: agreement' }, { fr: 'Les photos que j’ai prises sont belles.', tr: 'que (= les photos) before: agreement' }],
      },
      {
        kind: 'categorize',
        prompt: b('Agreement or not?', 'Accord ou pas ?'),
        buckets: [b('Agreement', 'Accord'), b('No agreement', 'Pas d’accord')],
        items: [{ text: 'Elles sont venu… ', bucket: 0 }, { text: 'Ces fleurs, je les ai cueilli…', bucket: 0 }, { text: 'la lettre que j’ai écrit…', bucket: 0 }, { text: 'Elles ont dansé…', bucket: 1 }, { text: 'J’ai lu… la lettre.', bucket: 1 }, { text: 'Nous avons fini… le travail.', bucket: 1 }],
      },
      {
        kind: 'fill',
        prompt: b('Write the participle with the right agreement.', 'Écrivez le participe avec le bon accord.'),
        text: 'Où sont mes clés ? Je les ai ___ (perdre) ce matin.',
        answers: [['perdues']],
        strict: true,
      },
      {
        kind: 'fill',
        prompt: b('Write the participle.', 'Écrivez le participe.'),
        text: 'Mes cousines ont ___ (visiter) Québec et elles sont ___ (rentrer) hier.',
        answers: [['visité'], ['rentrées']],
        strict: true,
      },
      {
        kind: 'mcq',
        prompt: b('Which sentence is correct?', 'Quelle phrase est correcte ?'),
        options: ['La maison qu’ils ont achetée est grande.', 'La maison qu’ils ont acheté est grande.', 'La maison qu’ils ont achetés est grande.', 'La maison qu’ils ont achetées est grande.'],
        answer: 0,
      },
      {
        kind: 'concept',
        variant: 'exam',
        title: b('A three-question proofreading method', 'Une méthode de relecture en trois questions'),
        points: [
          b('Is the auxiliary **être**? → agree with the subject.', 'L’auxiliaire est-il **être** ? → accord avec le sujet.'),
          b('Is it **avoir**? → look for a direct object **before** (la, les, l’, que).', 'Est-ce **avoir** ? → cherchez un COD **avant** (la, les, l’, que).'),
          b('No object before? → no agreement.', 'Pas de COD avant ? → pas d’accord.'),
        ],
      },
      {
        kind: 'dictation',
        prompt: b('Write what you hear.', 'Écrivez ce que vous entendez.'),
        text: 'Les lettres que nous avons écrites sont arrivées.',
        strict: true,
      },
      {
        kind: 'write',
        prompt: b('Proofread the participles.', 'Corrigez les participes.'),
        task: b('Rewrite with correct agreements: “Hier, Sarah et Léa sont allé au marché. Elles ont acheté des pommes, puis elles les ont mangé dans le parc. Les photos qu’elles ont pris sont superbes.”', 'Réécrivez avec les bons accords : « Hier, Sarah et Léa sont allé au marché. Elles ont acheté des pommes, puis elles les ont mangé dans le parc. Les photos qu’elles ont pris sont superbes. »'),
        min: 25,
        max: 50,
        checklist: [b('sont allées (être → subject)', 'sont allées (être → sujet)'), b('les ont mangées (les = pommes, before)', 'les ont mangées (les = pommes, avant)'), b('qu’elles ont prises (que = photos, before)', 'qu’elles ont prises (que = photos, avant)'), b('ont acheté stays (object after)', 'ont acheté reste invariable (COD après)')],
        model: 'Hier, Sarah et Léa sont allées au marché. Elles ont acheté des pommes, puis elles les ont mangées dans le parc. Les photos qu’elles ont prises sont superbes.',
      },
    ],
    notes: {
      points: [
        b('Être: the participle agrees with the subject (elles sont parties).', 'Être : le participe s’accorde avec le sujet (elles sont parties).'),
        b('Avoir: no agreement with the subject; agreement only with a direct object placed before (la, les, l’, que).', 'Avoir : pas d’accord avec le sujet ; accord seulement avec un COD placé avant (la, les, l’, que).'),
        b('Method: être? → subject. Avoir? → object before? → otherwise invariable.', 'Méthode : être ? → sujet. Avoir ? → COD avant ? → sinon invariable.'),
      ],
      vocab: [['le COD', b('direct object', 'complément d’objet direct')], ['l’auxiliaire', b('auxiliary verb', 'être ou avoir')], ['invariable', b('unchanged', 'qui ne s’accorde pas')]],
    },
  },
];

export default lessons;
