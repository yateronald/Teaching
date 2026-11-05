import { b, type Lesson } from '../../types';

const lessons: Lesson[] = [
  {
    id: 'dalf-c1-1',
    slug: { en: 'the-dalf-c1-at-a-glance', fr: 'le-dalf-c1-en-bref' },
    title: b('The DALF C1 at a glance', 'Le DALF C1 en bref'),
    summary: b('Long recordings, a file of documents, a synthesis and an essay, and an oral presentation followed by a debate.', 'De longs enregistrements, un dossier de documents, une synthèse et un essai, et un exposé oral suivi d’un débat.'),
    objectives: [b('Know the DALF C1 papers', 'Connaître les épreuves du DALF C1'), b('Understand what “C1” means', 'Comprendre ce que signifie « C1 »'), b('Choose your domain', 'Choisir votre domaine')],
    minutes: 11,
    steps: [
      {
        kind: 'concept',
        variant: 'exam',
        title: b('An experienced user', 'Un utilisateur expérimenté'),
        body: b('The DALF (Diplôme approfondi de langue française) C1 certifies an **experienced user**: you understand long, demanding texts, express yourself fluently and spontaneously, and use the language effectively for academic and professional purposes. It is often required for French universities and some professional bodies.', 'Le DALF (Diplôme approfondi de langue française) C1 atteste un **utilisateur expérimenté** : vous comprenez des textes longs et exigeants, vous vous exprimez couramment et spontanément, et utilisez la langue efficacement dans les études et le travail. Il est souvent exigé par les universités françaises et certains ordres professionnels.'),
        table: {
          head: [b('Paper', 'Épreuve'), b('Duration', 'Durée'), b('Task', 'Tâche')],
          rows: [[b('Listening', 'Compréhension de l’oral'), b('about 40 min', 'environ 40 min'), b('A long document and short radio extracts', 'Un document long et de courts extraits radio')], [b('Reading', 'Compréhension des écrits'), '50 min', b('A long literary or journalistic text', 'Un long texte littéraire ou journalistique')], [b('Writing', 'Production écrite'), '2 h 30', b('Synthesis of documents (~220 words) + argued essay (~250 words)', 'Synthèse de documents (~220 mots) + essai argumenté (~250 mots)')], [b('Speaking', 'Production orale'), b('30 min (+1 h preparation)', '30 min (+1 h de préparation)'), b('Presentation from documents + debate', 'Exposé à partir de documents + débat')]],
          caption: b('Writing and speaking are taken in a domain of your choice: humanities or sciences. Check the official France Éducation international website.', 'L’écrit et l’oral se passent dans un domaine au choix : lettres et sciences humaines, ou sciences. Vérifiez le site officiel de France Éducation international.'),
        },
      },
      {
        kind: 'mcq',
        prompt: b('What does the DALF C1 written production contain?', 'Que contient la production écrite du DALF C1 ?'),
        options: [b('A synthesis of documents and an argued essay', 'Une synthèse de documents et un essai argumenté'), b('A personal letter only', 'Seulement une lettre personnelle'), b('A dictation', 'Une dictée'), b('A grammar test', 'Un test de grammaire')],
        answer: 0,
      },
      {
        kind: 'categorize',
        prompt: b('Synthesis or essay?', 'Synthèse ou essai ?'),
        buckets: [b('Synthesis', 'Synthèse'), b('Essay', 'Essai')],
        items: [{ text: 'Aucune opinion personnelle', bucket: 0 }, { text: 'Confronter les documents', bucket: 0 }, { text: 'Un titre et un plan organisé par idées', bucket: 0 }, { text: 'Donner et défendre son avis', bucket: 1 }, { text: 'Exemples personnels possibles', bucket: 1 }, { text: 'Prendre position', bucket: 1 }],
      },
    ],
    notes: {
      points: [
        b('DALF C1: listening (~40 min), reading (50 min), writing (2 h 30: synthesis + essay), speaking (30 min + 1 h prep).', 'DALF C1 : compréhension de l’oral (~40 min), des écrits (50 min), production écrite (2 h 30 : synthèse + essai), orale (30 min + 1 h de préparation).'),
        b('Writing and speaking in a chosen domain: humanities or sciences.', 'Écrit et oral dans un domaine choisi : lettres et sciences humaines, ou sciences.'),
        b('Synthesis = no personal opinion; essay = argued personal position.', 'Synthèse = aucune opinion personnelle ; essai = position personnelle argumentée.'),
      ],
      vocab: [['approfondi', b('advanced, in-depth', 'poussé')], ['un dossier', b('a file of documents', 'ensemble de documents')], ['confronter', b('to compare / set against each other', 'mettre face à face')]],
    },
  },
  {
    id: 'dalf-c1-2',
    slug: { en: 'the-synthesis-method', fr: 'la-methode-de-la-synthese' },
    title: b('The synthesis: method and reformulation', 'La synthèse : méthode et reformulation'),
    summary: b('Summarise several documents in one organised text, without opinion and without copying: the signature skill of C1.', 'Résumer plusieurs documents en un texte organisé, sans opinion et sans recopier : la compétence phare du C1.'),
    objectives: [b('Identify the common theme and the ideas of each document', 'Repérer le thème commun et les idées de chaque document'), b('Organise by ideas, not by document', 'Organiser par idées, et non document par document'), b('Reformulate with your own words', 'Reformuler avec vos propres mots')],
    minutes: 17,
    steps: [
      {
        kind: 'concept',
        title: b('The four golden rules', 'Les quatre règles d’or'),
        points: [
          b('**No personal opinion**: you report, you do not judge.', '**Aucune opinion personnelle** : vous rapportez, vous ne jugez pas.'),
          b('**Organise by ideas**, cross-referencing the documents (not doc 1, then doc 2).', '**Organisez par idées**, en croisant les documents (pas doc 1, puis doc 2).'),
          b('**Reformulate**: copying sentences from the documents is penalised.', '**Reformulez** : recopier des phrases des documents est pénalisé.'),
          b('**Give a title** and respect the word count (about 220 words).', '**Donnez un titre** et respectez le nombre de mots (environ 220 mots).'),
        ],
      },
      {
        kind: 'mcq',
        prompt: b('Which sentence is acceptable in a synthesis?', 'Quelle phrase est acceptable dans une synthèse ?'),
        options: ['Si le premier auteur voit dans le télétravail un gain de liberté, la seconde y décèle surtout un risque d’isolement.', 'Je pense que le télétravail est une excellente chose.', 'Le document 1 dit que le télétravail est bien. Le document 2 dit que non.', 'Personnellement, je préfère travailler au bureau.'],
        answer: 0,
        explain: b('It cross-references the documents and reports their views without personal opinion.', 'Elle croise les documents et rapporte leurs points de vue sans opinion personnelle.'),
      },
      {
        kind: 'match',
        prompt: b('Verbs to report an author’s view (instead of “dire”).', 'Des verbes pour rapporter un point de vue (au lieu de « dire »).'),
        pairs: [['souligner', b('to stress', 'mettre en évidence')], ['déplorer', b('to deplore', 'regretter')], ['nuancer', b('to qualify', 'modérer')], ['mettre en garde contre', b('to warn against', 'alerter sur')], ['préconiser', b('to recommend', 'recommander')]],
      },
      {
        kind: 'concept',
        variant: 'tip',
        title: b('Connectors that cross documents', 'Les connecteurs qui croisent les documents'),
        examples: [{ fr: 'Les deux auteurs s’accordent sur…', tr: 'Both authors agree on…' }, { fr: 'Alors que le premier document insiste sur…, le second met l’accent sur…', tr: 'Whereas the first document insists on…, the second emphasises…' }, { fr: 'Ce constat est partagé par…', tr: 'This observation is shared by…' }, { fr: 'À l’inverse, …', tr: 'Conversely, …' }],
      },
      {
        kind: 'fill',
        prompt: b('Reformulate with a reporting verb.', 'Reformulez avec un verbe introducteur.'),
        text: 'L’auteure ___ les dangers d’une utilisation excessive des écrans chez les enfants.',
        answers: [['met en garde contre']],
        choices: [['met en garde contre', 'pense', 'dit', 'aime']],
      },
      {
        kind: 'mcq',
        prompt: b('Two documents on urban cycling. How should you organise the synthesis?', 'Deux documents sur le vélo en ville. Comment organiser la synthèse ?'),
        doc: { title: b('Document summaries', 'Résumés des documents'), text: 'Document 1 : le vélo réduit la pollution et améliore la santé, mais les pistes cyclables manquent.\n\nDocument 2 : le vélo est rapide en ville, mais dangereux à cause du trafic ; il faut des aménagements sécurisés.' },
        options: [b('Part 1: the benefits (environment, health, speed) · Part 2: the obstacles and the need for infrastructure', 'Partie 1 : les bienfaits (environnement, santé, rapidité) · Partie 2 : les obstacles et le besoin d’aménagements'), b('Part 1: document 1 · Part 2: document 2', 'Partie 1 : document 1 · Partie 2 : document 2'), b('My opinion, then the documents', 'Mon opinion, puis les documents'), b('A list of the sentences I liked', 'Une liste des phrases que j’ai aimées')],
        answer: 0,
      },
      {
        kind: 'write',
        prompt: b('Write a short synthesis.', 'Rédigez une courte synthèse.'),
        task: b('Using the two document summaries about urban cycling above, write a synthesis of about 100 words with a title. No personal opinion; cross-reference the documents; reformulate.', 'À partir des deux résumés de documents sur le vélo en ville ci-dessus, rédigez une synthèse d’environ 100 mots avec un titre. Aucune opinion personnelle ; croisez les documents ; reformulez.'),
        min: 80,
        max: 130,
        checklist: [b('A title', 'Un titre'), b('Organised by ideas, not by document', 'Organisée par idées, pas par document'), b('Reporting verbs and cross-referencing connectors', 'Des verbes introducteurs et des connecteurs de confrontation'), b('No personal opinion', 'Aucune opinion personnelle')],
        phrases: ['Les deux documents s’accordent sur', 'souligne', 'insiste sur', 'Toutefois,', 'tous deux', 'préconise'],
        model: 'Le vélo en ville : un potentiel freiné par le manque d’aménagements\n\nLes deux documents s’accordent sur les nombreux atouts du vélo en milieu urbain. Le premier souligne ses bienfaits pour l’environnement et la santé, tandis que le second insiste sur sa rapidité dans les déplacements quotidiens.\n\nToutefois, tous deux mettent en évidence un même obstacle : l’insuffisance des infrastructures. Si le premier déplore le manque de pistes cyclables, le second met en garde contre les dangers liés à la circulation et préconise des aménagements sécurisés.',
      },
    ],
    notes: {
      points: [
        b('Synthesis: no opinion, organised by ideas, reformulated, with a title (~220 words in the exam).', 'Synthèse : sans opinion, organisée par idées, reformulée, avec un titre (~220 mots à l’examen).'),
        b('Reporting verbs: souligner, insister sur, déplorer, nuancer, mettre en garde contre, préconiser.', 'Verbes introducteurs : souligner, insister sur, déplorer, nuancer, mettre en garde contre, préconiser.'),
        b('Cross-referencing: les deux auteurs s’accordent sur…, alors que…, à l’inverse…', 'Confrontation : les deux auteurs s’accordent sur…, alors que…, à l’inverse…'),
      ],
      vocab: [['préconiser', b('to recommend', 'recommander')], ['déplorer', b('to deplore', 'regretter vivement')], ['s’accorder sur', b('to agree on', 'être d’accord sur')], ['l’insuffisance', b('inadequacy', 'manque')]],
    },
  },
  {
    id: 'dalf-c1-3',
    slug: { en: 'the-formal-register', fr: 'le-registre-soutenu' },
    title: b('Moving to a formal register', 'Passer au registre soutenu'),
    summary: b('Replace everyday words with precise, formal equivalents, use nominalisation and avoid colloquial turns.', 'Remplacer les mots courants par des équivalents précis et soutenus, utiliser la nominalisation et éviter les tournures familières.'),
    objectives: [b('Replace common verbs with precise ones', 'Remplacer les verbes courants par des verbes précis'), b('Use nominalisation', 'Utiliser la nominalisation'), b('Avoid colloquial expressions', 'Éviter les expressions familières')],
    minutes: 15,
    steps: [
      {
        kind: 'concept',
        title: b('Precise verbs instead of “faire, dire, avoir, mettre”', 'Des verbes précis au lieu de « faire, dire, avoir, mettre »'),
        table: {
          head: [b('Common', 'Courant'), b('Formal', 'Soutenu')],
          rows: [['faire un projet', 'élaborer / mener un projet'], ['dire que', 'affirmer / soutenir que'], ['avoir des problèmes', 'rencontrer / se heurter à des difficultés'], ['mettre en place', 'instaurer / instituer'], ['il y a beaucoup de', 'on dénombre de nombreux…'], ['donner', 'fournir / octroyer']],
        },
      },
      {
        kind: 'match',
        prompt: b('Common → formal.', 'Courant → soutenu.'),
        pairs: [['montrer', 'mettre en évidence'], ['augmenter', 'croître'], ['parler de', 'aborder'], ['empêcher', 'entraver'], ['important', 'considérable']],
      },
      {
        kind: 'concept',
        variant: 'tip',
        title: b('Nominalisation: a C1 marker', 'La nominalisation : un marqueur du C1'),
        body: b('Turning a verb into a noun makes your style more concise and formal: **les prix augmentent** → **l’augmentation des prix**; **on a réduit les budgets** → **la réduction des budgets**.', 'Transformer un verbe en nom rend le style plus concis et soutenu : **les prix augmentent** → **l’augmentation des prix** ; **on a réduit les budgets** → **la réduction des budgets**.'),
        examples: [{ fr: 'Parce que les loyers augmentent, … → En raison de l’augmentation des loyers, …' }, { fr: 'Quand le projet a été lancé, … → Dès le lancement du projet, …' }],
      },
      {
        kind: 'fill',
        prompt: b('Nominalise.', 'Nominalisez.'),
        text: 'Les villes développent les transports en commun. → Le ___ des transports en commun.',
        answers: [['développement']],
      },
      {
        kind: 'categorize',
        prompt: b('Colloquial or formal?', 'Familier ou soutenu ?'),
        buckets: [b('Colloquial', 'Familier'), b('Formal', 'Soutenu')],
        items: [{ text: 'un truc', bucket: 0 }, { text: 'plein de gens', bucket: 0 }, { text: 'c’est pas évident', bucket: 0 }, { text: 'un phénomène', bucket: 1 }, { text: 'de nombreuses personnes', bucket: 1 }, { text: 'cela s’avère délicat', bucket: 1 }],
      },
      {
        kind: 'mcq',
        prompt: b('Which version fits a C1 essay?', 'Quelle version convient à un essai de niveau C1 ?'),
        options: ['Face à la hausse des loyers, de nombreux ménages se voient contraints de quitter les centres urbains.', 'Les loyers montent et plein de gens doivent partir du centre.', 'C’est trop cher, donc les gens s’en vont.', 'Il y a des gens qui partent car le loyer, c’est cher.'],
        answer: 0,
      },
      {
        kind: 'write',
        prompt: b('Rewrite in a formal register.', 'Réécrivez dans un registre soutenu.'),
        task: b('Rewrite this paragraph in a formal C1 style: “Il y a plein de jeunes qui ont des problèmes pour trouver un logement. Les prix montent tout le temps, et l’État fait pas grand-chose. Il faudrait mettre en place des aides.”', 'Réécrivez ce paragraphe dans un style soutenu de niveau C1 : « Il y a plein de jeunes qui ont des problèmes pour trouver un logement. Les prix montent tout le temps, et l’État fait pas grand-chose. Il faudrait mettre en place des aides. »'),
        min: 30,
        max: 70,
        checklist: [b('No colloquial words (plein de, fait pas)', 'Aucun mot familier (plein de, fait pas)'), b('Precise verbs (rencontrer, instaurer…)', 'Des verbes précis (rencontrer, instaurer…)'), b('At least one nominalisation', 'Au moins une nominalisation')],
        phrases: ['De nombreux jeunes', 'se heurtent à', 'la hausse constante', 'les pouvoirs publics', 'il conviendrait d’instaurer'],
        model: 'De nombreux jeunes se heurtent à d’importantes difficultés pour se loger. Face à la hausse constante des loyers, les pouvoirs publics semblent n’apporter que des réponses limitées. Il conviendrait donc d’instaurer des aides ciblées afin de faciliter l’accès au logement de cette population.',
      },
    ],
    notes: {
      points: [
        b('Replace faire, dire, avoir, mettre with precise verbs: élaborer, affirmer, rencontrer, instaurer.', 'Remplacez faire, dire, avoir, mettre par des verbes précis : élaborer, affirmer, rencontrer, instaurer.'),
        b('Nominalisation: les prix augmentent → l’augmentation des prix.', 'Nominalisation : les prix augmentent → l’augmentation des prix.'),
        b('Avoid colloquialisms: un truc → un élément, plein de → de nombreux, c’est pas → ce n’est pas.', 'Évitez le familier : un truc → un élément, plein de → de nombreux, c’est pas → ce n’est pas.'),
      ],
      vocab: [['se heurter à', b('to come up against', 'rencontrer un obstacle')], ['instaurer', b('to establish', 'mettre en place')], ['il conviendrait de', b('it would be advisable to', 'il faudrait')], ['entraver', b('to hinder', 'empêcher')]],
    },
  },
];

export default lessons;
