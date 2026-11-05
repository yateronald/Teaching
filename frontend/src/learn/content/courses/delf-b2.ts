import { b, type Lesson } from '../../types';

const lessons: Lesson[] = [
  {
    id: 'delf-b2-1',
    slug: { en: 'the-delf-b2-and-its-expectations', fr: 'le-delf-b2-et-ses-attentes' },
    title: b('The DELF B2 and what examiners expect', 'Le DELF B2 et les attentes des examinateurs'),
    summary: b('Format, marking and the jump from B1 to B2: argue, nuance and adapt your register.', 'Format, barème et le saut du B1 au B2 : argumenter, nuancer et adapter son registre.'),
    objectives: [b('Know the DELF B2 papers', 'Connaître les épreuves du DELF B2'), b('Understand the difference between B1 and B2', 'Comprendre la différence entre B1 et B2'), b('Recognise B2-level answers', 'Reconnaître une production de niveau B2')],
    minutes: 12,
    steps: [
      {
        kind: 'concept',
        variant: 'exam',
        title: b('Four papers, the same pass rule', 'Quatre épreuves, la même règle de réussite'),
        table: {
          head: [b('Paper', 'Épreuve'), b('Duration', 'Durée'), b('Task', 'Tâche')],
          rows: [[b('Listening', 'Compréhension de l’oral'), b('about 30 min', 'environ 30 min'), b('Interviews, reports, lectures', 'Interviews, reportages, conférences')], [b('Reading', 'Compréhension des écrits'), '1 h', b('Informative and argumentative texts', 'Textes informatifs et argumentatifs')], [b('Writing', 'Production écrite'), '1 h', b('Argued text of about 250 words', 'Texte argumenté d’environ 250 mots')], [b('Speaking', 'Production orale'), b('20 min (+30 min preparation)', '20 min (+30 min de préparation)'), b('Defend a point of view from a short document, then debate', 'Défendre un point de vue à partir d’un court document, puis débattre')]],
          caption: b('Each paper /25; pass with 50/100 and at least 5/25 per paper. Check the official France Éducation international website.', 'Chaque épreuve /25 ; réussite avec 50/100 et au moins 5/25 par épreuve. Vérifiez le site officiel de France Éducation international.'),
        },
      },
      {
        kind: 'concept',
        title: b('From B1 to B2: what changes', 'Du B1 au B2 : ce qui change'),
        table: {
          head: ['B1', 'B2'],
          rows: [[b('Gives an opinion simply', 'Donne son avis simplement'), b('Builds an argument and nuances it', 'Construit une argumentation et la nuance')], [b('Familiar topics', 'Sujets familiers'), b('Social and abstract topics', 'Sujets de société, abstraits')], [b('Basic connectors (mais, parce que)', 'Connecteurs simples (mais, parce que)'), b('Precise connectors (néanmoins, dès lors, en effet)', 'Connecteurs précis (néanmoins, dès lors, en effet)')], [b('Mostly one register', 'Un registre principal'), b('Adapts the register to the situation', 'Adapte son registre à la situation')]],
        },
      },
      {
        kind: 'mcq',
        prompt: b('Which sentence is typical of B2?', 'Quelle phrase est typique du B2 ?'),
        options: ['Certes, le télétravail offre une grande souplesse ; néanmoins, il risque d’accentuer l’isolement des salariés les plus jeunes.', 'Le télétravail, c’est bien parce que c’est pratique.', 'J’aime le télétravail et mon ami aussi.', 'Le télétravail est bien mais pas bien.'],
        answer: 0,
      },
      {
        kind: 'categorize',
        prompt: b('B1 or B2 connector?', 'Connecteur B1 ou B2 ?'),
        buckets: ['B1', 'B2'],
        items: [{ text: 'mais', bucket: 0 }, { text: 'parce que', bucket: 0 }, { text: 'et puis', bucket: 0 }, { text: 'néanmoins', bucket: 1 }, { text: 'dès lors', bucket: 1 }, { text: 'en revanche', bucket: 1 }],
      },
    ],
    notes: {
      points: [
        b('DELF B2: listening (~30 min), reading (1 h), writing (1 h, ~250 words), speaking (20 min + 30 min prep).', 'DELF B2 : compréhension de l’oral (~30 min), des écrits (1 h), production écrite (1 h, ~250 mots), orale (20 min + 30 min de préparation).'),
        b('Pass: 50/100 and at least 5/25 per paper.', 'Réussite : 50/100 et au moins 5/25 par épreuve.'),
        b('B2 = argue, nuance, use precise connectors, adapt the register.', 'B2 = argumenter, nuancer, utiliser des connecteurs précis, adapter le registre.'),
      ],
      vocab: [['néanmoins', b('nevertheless', 'cependant')], ['dès lors', b('therefore, from then on', 'par conséquent')], ['accentuer', b('to increase, worsen', 'renforcer')], ['la souplesse', b('flexibility', 'flexibilité')]],
    },
  },
  {
    id: 'delf-b2-2',
    slug: { en: 'the-argued-essay', fr: 'l-essai-argumente' },
    title: b('The argued essay (about 250 words)', 'L’essai argumenté (environ 250 mots)'),
    summary: b('Build a dialectical or thematic plan, write a strong introduction and conclusion, and link your paragraphs.', 'Construire un plan dialectique ou thématique, rédiger une introduction et une conclusion solides, et relier vos paragraphes.'),
    objectives: [b('Choose between dialectical and thematic plans', 'Choisir entre plan dialectique et plan thématique'), b('Write an introduction in three moves', 'Rédiger une introduction en trois temps'), b('Link paragraphs with transitions', 'Relier les paragraphes par des transitions')],
    minutes: 17,
    steps: [
      {
        kind: 'concept',
        title: b('Two plans that work', 'Deux plans qui fonctionnent'),
        table: {
          head: [b('Plan', 'Plan'), b('When', 'Quand'), b('Structure', 'Structure')],
          rows: [[b('Dialectical', 'Dialectique'), b('A yes/no question (“Should…?”)', 'Une question fermée (« Faut-il… ? »)'), b('Advantages → limits → your position', 'Avantages → limites → votre position')], [b('Thematic', 'Thématique'), b('An open question (“What are the effects of…?”)', 'Une question ouverte (« Quels sont les effets de… ? »)'), b('Aspect 1 (economic) → aspect 2 (social) → aspect 3 (environmental)', 'Aspect 1 (économique) → aspect 2 (social) → aspect 3 (environnemental)')]],
        },
      },
      {
        kind: 'mcq',
        prompt: b('Topic: “Should cars be banned from city centres?” Which plan fits?', 'Sujet : « Faut-il interdire les voitures dans les centres-villes ? » Quel plan convient ?'),
        options: [b('Dialectical: advantages, limits, position', 'Dialectique : avantages, limites, position'), b('Thematic only on the history of cars', 'Thématique uniquement sur l’histoire de l’automobile'), b('A list of car brands', 'Une liste de marques de voitures'), b('A personal story only', 'Un récit personnel uniquement')],
        answer: 0,
      },
      {
        kind: 'concept',
        variant: 'tip',
        title: b('The introduction in three moves', 'L’introduction en trois temps'),
        points: [
          b('**Hook**: a fact or observation (De plus en plus de villes européennes…).', '**Accroche** : un fait ou une observation (De plus en plus de villes européennes…).'),
          b('**Question**: reformulate the topic (Faut-il pour autant interdire… ?).', '**Problématique** : reformulez le sujet (Faut-il pour autant interdire… ?).'),
          b('**Plan**: announce your parts (Nous verrons d’abord…, puis…).', '**Annonce du plan** : présentez vos parties (Nous verrons d’abord…, puis…).'),
        ],
      },
      {
        kind: 'order',
        prompt: b('Put the introduction in order.', 'Remettez l’introduction dans l’ordre.'),
        words: ['Accroche', '→', 'problématique', '→', 'annonce', 'du', 'plan'],
      },
      {
        kind: 'match',
        prompt: b('Transitions between parts.', 'Les transitions entre les parties.'),
        pairs: [['Si ces avantages sont réels, …', b('moving to the limits', 'passer aux limites')], ['Au-delà de cet aspect économique, …', b('moving to another aspect', 'passer à un autre aspect')], ['Pour toutes ces raisons, …', b('moving to the conclusion', 'passer à la conclusion')], ['Il convient toutefois de nuancer…', b('introducing a nuance', 'introduire une nuance')]],
      },
      {
        kind: 'write',
        prompt: b('Your turn: a DELF B2 essay.', 'À vous : un essai du DELF B2.'),
        task: b('“Should children learn to code at primary school?” You write an article for your city’s magazine giving your argued opinion. (about 250 words)', '« Faut-il apprendre à coder aux enfants dès l’école primaire ? » Vous écrivez un article pour le magazine de votre ville en donnant votre opinion argumentée. (environ 250 mots)'),
        min: 220,
        max: 300,
        checklist: [b('Introduction: hook, question, plan', 'Introduction : accroche, problématique, plan'), b('Two or three structured parts with examples', 'Deux ou trois parties structurées avec des exemples'), b('Transitions between parts', 'Des transitions entre les parties'), b('A nuanced conclusion', 'Une conclusion nuancée'), b('Precise B2 connectors', 'Des connecteurs précis de niveau B2')],
        phrases: ['À l’heure où', 'Faut-il pour autant', 'Nous verrons d’abord', 'En effet,', 'Si ces avantages sont réels,', 'néanmoins', 'En définitive,'],
        model: 'À l’heure où le numérique transforme tous les métiers, plusieurs pays ont introduit la programmation dès l’école primaire. Faut-il pour autant apprendre à coder aux enfants de sept ans ? Nous verrons d’abord les atouts de cet apprentissage, avant d’en souligner les limites.\n\nEn effet, coder développe des compétences précieuses. Les enfants apprennent à décomposer un problème, à tester des solutions et à persévérer face à l’erreur. En Estonie, par exemple, l’initiation à la programmation à l’école est souvent citée comme un facteur de réussite du secteur technologique. De plus, ces cours permettent de comprendre les outils numériques plutôt que de simplement les consommer.\n\nSi ces avantages sont réels, il convient néanmoins de nuancer. Les journées des élèves sont déjà chargées, et le temps consacré au code ne doit pas se faire au détriment de la lecture, de l’écriture ou du jeu. Par ailleurs, de nombreuses écoles manquent d’enseignants formés et de matériel.\n\nEn définitive, apprendre à coder à l’école primaire me semble pertinent, à condition qu’il s’agisse d’une initiation ludique, intégrée aux autres matières, et que les enseignants soient formés. Le code ne doit pas devenir une fin en soi, mais un moyen d’apprendre à penser.',
        modelNote: b('About 250 words, dialectical plan; introduction with hook, question and plan; precise connectors (en effet, de plus, néanmoins, par ailleurs, en définitive); a conditional conclusion.', 'Environ 250 mots, plan dialectique ; introduction avec accroche, problématique et annonce du plan ; connecteurs précis (en effet, de plus, néanmoins, par ailleurs, en définitive) ; conclusion conditionnelle.'),
      },
    ],
    notes: {
      points: [
        b('Yes/no question → dialectical plan (advantages, limits, position); open question → thematic plan.', 'Question fermée → plan dialectique (avantages, limites, position) ; question ouverte → plan thématique.'),
        b('Introduction: hook → question → plan. Conclusion: answer + nuance + opening.', 'Introduction : accroche → problématique → plan. Conclusion : réponse + nuance + ouverture.'),
        b('Transitions: si ces avantages sont réels…, au-delà de…, il convient toutefois de nuancer…', 'Transitions : si ces avantages sont réels…, au-delà de…, il convient toutefois de nuancer…'),
      ],
      vocab: [['une accroche', b('a hook', 'phrase d’ouverture')], ['la problématique', b('the central question', 'question posée')], ['au détriment de', b('at the expense of', 'en nuisant à')], ['une fin en soi', b('an end in itself', 'un but ultime')]],
    },
  },
  {
    id: 'delf-b2-3',
    slug: { en: 'defending-a-point-of-view-orally', fr: 'defendre-un-point-de-vue-a-l-oral' },
    title: b('The oral: defending a point of view and debating', 'L’oral : défendre un point de vue et débattre'),
    summary: b('Thirty minutes to prepare a short article, then a structured monologue and a debate where the examiner challenges you.', 'Trente minutes pour préparer un court article, puis un monologue structuré et un débat où l’examinateur vous contredit.'),
    objectives: [b('Use the 30-minute preparation efficiently', 'Utiliser efficacement les 30 minutes de préparation'), b('Structure a 5–7 minute monologue', 'Structurer un monologue de 5 à 7 minutes'), b('Defend your opinion in a debate', 'Défendre votre opinion lors d’un débat')],
    minutes: 15,
    steps: [
      {
        kind: 'concept',
        variant: 'exam',
        title: b('How the oral works', 'Le déroulement de l’oral'),
        body: b('You draw a short article raising a debate. You have **30 minutes** to prepare. Then you **present** the problem and **defend your point of view** for about 5 to 7 minutes, before a **debate** with the examiner, who will challenge your arguments.', 'Vous tirez un court article qui soulève un débat. Vous avez **30 minutes** de préparation. Puis vous **présentez** la problématique et **défendez votre point de vue** pendant 5 à 7 minutes environ, avant un **débat** avec l’examinateur, qui contestera vos arguments.'),
      },
      {
        kind: 'concept',
        variant: 'tip',
        title: b('Your 30 minutes', 'Vos 30 minutes'),
        points: [
          b('**5 min**: read, identify the topic and the problem.', '**5 min** : lire, identifier le thème et la problématique.'),
          b('**15 min**: find 2–3 arguments with examples; note **key words**, not sentences.', '**15 min** : trouver 2 à 3 arguments avec exemples ; notez des **mots-clés**, pas des phrases.'),
          b('**5 min**: prepare the introduction and conclusion (you may write them).', '**5 min** : préparer l’introduction et la conclusion (vous pouvez les rédiger).'),
          b('**5 min**: anticipate the examiner’s objections.', '**5 min** : anticiper les objections de l’examinateur.'),
        ],
      },
      {
        kind: 'mcq',
        prompt: b('During the preparation, what should you write?', 'Pendant la préparation, que faut-il écrire ?'),
        options: [b('Key words and a plan; write out only the introduction and conclusion', 'Des mots-clés et un plan ; rédiger seulement l’introduction et la conclusion'), b('The whole speech word for word', 'Tout le discours mot à mot'), b('Nothing at all', 'Rien du tout'), b('A summary of the article only', 'Seulement un résumé de l’article')],
        answer: 0,
      },
      {
        kind: 'dialogue',
        title: b('The debate with the examiner', 'Le débat avec l’examinateur'),
        scene: b('You defended limiting tourism in historic city centres. The examiner challenges you.', 'Vous avez défendu la limitation du tourisme dans les centres historiques. L’examinateur vous contredit.'),
        speakers: [{ name: 'Examinatrice', voice: 'f2', side: 'l' }, { name: 'Vous', voice: 'm', side: 'r' }],
        lines: [
          { s: 0, fr: 'Mais limiter le tourisme, c’est aussi priver les commerçants de revenus, non ?', tr: 'But limiting tourism also deprives shopkeepers of income, doesn’t it?' },
          { s: 1, choose: { options: ['Vous avez raison de le souligner. C’est pourquoi je ne propose pas d’interdire, mais de mieux répartir les visiteurs dans le temps et l’espace.', 'Non, ce n’est pas vrai.', 'Je ne sais pas.'], answer: 0 } },
          { s: 0, fr: 'Comment concrètement ?', tr: 'How, concretely?' },
          { s: 1, choose: { options: ['Par exemple, avec des réservations obligatoires pour certains sites, comme à Venise, et en valorisant des quartiers moins connus.', 'Concrètement, c’est compliqué.', 'Il faut fermer la ville.'], answer: 0 } },
          { s: 0, fr: 'Et vous ne craignez pas de réserver le patrimoine à ceux qui peuvent payer ?', tr: 'And aren’t you afraid of reserving heritage for those who can pay?' },
          { s: 1, choose: { options: ['C’est un vrai risque. On pourrait prévoir des tarifs réduits ou des jours gratuits pour les habitants et les étudiants.', 'Non, ce n’est pas un problème.', 'Les pauvres n’aiment pas le patrimoine.'], answer: 0 } },
        ],
      },
      {
        kind: 'concept',
        title: b('Defending without being defensive', 'Défendre sans être sur la défensive'),
        examples: [{ fr: 'Vous avez raison de le souligner, mais…' }, { fr: 'Je comprends cette objection ; cependant, il me semble que…' }, { fr: 'C’est un argument intéressant, que je nuancerais de la façon suivante…' }],
      },
      {
        kind: 'speak',
        prompt: b('Answer an objection aloud.', 'Répondez à une objection à voix haute.'),
        text: 'Je comprends cette objection ; cependant, il me semble que les avantages l’emportent sur les inconvénients.',
        tr: 'I understand this objection; however, it seems to me that the advantages outweigh the disadvantages.',
      },
    ],
    notes: {
      points: [
        b('30 min preparation → 5–7 min monologue → debate with the examiner.', '30 min de préparation → monologue de 5 à 7 min → débat avec l’examinateur.'),
        b('Prepare key words and a plan; write only the introduction and conclusion.', 'Préparez des mots-clés et un plan ; rédigez seulement l’introduction et la conclusion.'),
        b('In the debate: acknowledge the objection, then defend with an example or an adjustment.', 'Dans le débat : reconnaître l’objection, puis défendre avec un exemple ou un ajustement.'),
      ],
      vocab: [['soulever un débat', b('to raise a debate', 'provoquer une discussion')], ['une objection', b('an objection', 'argument contraire')], ['l’emporter sur', b('to outweigh', 'être plus fort que')], ['le patrimoine', b('heritage', 'biens culturels hérités')]],
    },
  },
];

export default lessons;
