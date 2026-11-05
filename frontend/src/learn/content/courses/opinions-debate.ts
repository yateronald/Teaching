import { b, type Lesson } from '../../types';

const lessons: Lesson[] = [
  {
    id: 'opinions-debate-1',
    slug: { en: 'expressing-an-opinion', fr: 'exprimer-son-opinion' },
    title: b('Expressing your opinion with variety', 'Exprimer son opinion avec variété'),
    summary: b('Ten ways to give your opinion beyond “je pense que”, from neutral to strong, as B2 examiners expect.', 'Dix façons de donner votre avis au-delà de « je pense que », du neutre au plus affirmé, comme l’attendent les examinateurs du B2.'),
    objectives: [b('Vary the phrases you use to give your opinion', 'Varier les tournures pour donner votre avis'), b('Graduate the strength of your opinion', 'Graduer la force de votre opinion'), b('Agree and disagree politely', 'Approuver et contester poliment')],
    minutes: 14,
    steps: [
      {
        kind: 'concept',
        title: b('Beyond “je pense que”', 'Au-delà de « je pense que »'),
        table: {
          head: [b('Strength', 'Force'), b('Phrases', 'Tournures')],
          rows: [[b('Cautious', 'Prudent'), 'Il me semble que… · J’ai l’impression que… · Je dirais que…'], [b('Neutral', 'Neutre'), 'À mon avis,… · Selon moi,… · D’après moi,… · Je trouve que…'], [b('Strong', 'Affirmé'), 'Je suis convaincu(e) que… · Je suis persuadé(e) que… · Il est évident que…']],
        },
        examples: [{ fr: 'À mon avis, le télétravail améliore la qualité de vie.' }, { fr: 'J’ai l’impression que les jeunes lisent moins qu’avant.' }, { fr: 'Je suis convaincu que l’éducation doit rester gratuite.' }],
      },
      {
        kind: 'categorize',
        prompt: b('Cautious or strong opinion?', 'Opinion prudente ou affirmée ?'),
        buckets: [b('Cautious', 'Prudente'), b('Strong', 'Affirmée')],
        items: [{ text: 'Il me semble que…', bucket: 0 }, { text: 'Je dirais que…', bucket: 0 }, { text: 'J’ai l’impression que…', bucket: 0 }, { text: 'Je suis persuadé que…', bucket: 1 }, { text: 'Il est évident que…', bucket: 1 }, { text: 'Je suis convaincue que…', bucket: 1 }],
      },
      {
        kind: 'concept',
        title: b('Agreeing and disagreeing', 'Approuver et contester'),
        table: {
          head: [b('Agree', 'Accord'), b('Partly', 'Accord partiel'), b('Disagree', 'Désaccord')],
          rows: [['Je suis tout à fait d’accord.', 'Je suis d’accord, mais…', 'Je ne suis pas d’accord.'], ['Vous avez raison.', 'Dans une certaine mesure.', 'Je ne partage pas cet avis.'], ['C’est exactement ça.', 'Oui et non.', 'Au contraire, je pense que…']],
        },
      },
      {
        kind: 'mcq',
        prompt: b('Which answer disagrees politely?', 'Quelle réponse exprime un désaccord poli ?'),
        options: ['Je comprends votre point de vue, mais je ne le partage pas.', 'C’est n’importe quoi.', 'Vous avez tort, c’est tout.', 'Je suis tout à fait d’accord.'],
        answer: 0,
      },
      {
        kind: 'dialogue',
        title: b('A debate at work', 'Un débat au travail'),
        scene: b('Your team discusses a four-day week.', 'Votre équipe discute de la semaine de quatre jours.'),
        speakers: [{ name: 'Julien', voice: 'm', side: 'l' }, { name: 'Vous', voice: 'f', side: 'r' }],
        lines: [
          { s: 0, fr: 'Moi, je suis persuadé que la semaine de quatre jours augmenterait la productivité.', tr: 'I’m convinced a four-day week would increase productivity.' },
          { s: 1, choose: { options: ['Je suis d’accord dans une certaine mesure, mais certains services doivent rester ouverts cinq jours.', 'Tu as tort, c’est tout.', 'Je suis persuadé que oui non.'], answer: 0 } },
          { s: 0, fr: 'C’est vrai, il faudrait organiser des rotations.', tr: 'True, we would need to organise rotations.' },
          { s: 1, choose: { options: ['Exactement. À mon avis, il faudrait d’abord faire un essai de six mois.', 'Au contraire, je suis d’accord.', 'Il me semble que tu as l’impression.'], answer: 0 } },
        ],
      },
      {
        kind: 'fill',
        prompt: b('Choose the right phrase.', 'Choisissez la bonne tournure.'),
        text: '___ , les transports en commun devraient être gratuits.',
        answers: [['À mon avis']],
        choices: [['À mon avis', 'Je pense', 'Selon que', 'D’accord']],
      },
      {
        kind: 'speak',
        prompt: b('Give your opinion aloud.', 'Donnez votre opinion à voix haute.'),
        text: 'Selon moi, apprendre une langue étrangère ouvre beaucoup de portes.',
        tr: 'In my opinion, learning a foreign language opens many doors.',
      },
    ],
    notes: {
      points: [
        b('Cautious: il me semble que, j’ai l’impression que, je dirais que.', 'Prudent : il me semble que, j’ai l’impression que, je dirais que.'),
        b('Neutral: à mon avis, selon moi, d’après moi, je trouve que.', 'Neutre : à mon avis, selon moi, d’après moi, je trouve que.'),
        b('Strong: je suis convaincu(e) / persuadé(e) que, il est évident que.', 'Affirmé : je suis convaincu(e) / persuadé(e) que, il est évident que.'),
        b('Disagree politely: je comprends votre point de vue, mais je ne le partage pas.', 'Désaccord poli : je comprends votre point de vue, mais je ne le partage pas.'),
      ],
      vocab: [['à mon avis', b('in my opinion', 'selon moi')], ['je suis persuadé(e) que', b('I am convinced that', 'certitude')], ['dans une certaine mesure', b('to some extent', 'partiellement')], ['partager un avis', b('to share an opinion', 'être du même avis')]],
    },
  },
  {
    id: 'opinions-debate-2',
    slug: { en: 'structuring-an-argument', fr: 'structurer-une-argumentation' },
    title: b('Structuring an argument', 'Structurer une argumentation'),
    summary: b('Organise your ideas with connectors: introduce, add, give a cause, a consequence, an example, and conclude.', 'Organiser vos idées avec des connecteurs : introduire, ajouter, donner une cause, une conséquence, un exemple, et conclure.'),
    objectives: [b('Use connectors of addition, cause and consequence', 'Utiliser les connecteurs d’addition, de cause et de conséquence'), b('Illustrate with examples', 'Illustrer par des exemples'), b('Conclude clearly', 'Conclure clairement')],
    minutes: 14,
    steps: [
      {
        kind: 'concept',
        title: b('The connectors that structure', 'Les connecteurs qui structurent'),
        table: {
          head: [b('Function', 'Fonction'), b('Connectors', 'Connecteurs')],
          rows: [[b('Order', 'Ordre'), 'D’abord · Ensuite · Enfin · Premièrement'], [b('Addition', 'Ajout'), 'De plus · En outre · Par ailleurs'], [b('Cause', 'Cause'), 'parce que · car · puisque · étant donné que'], [b('Consequence', 'Conséquence'), 'donc · par conséquent · c’est pourquoi'], [b('Example', 'Exemple'), 'par exemple · notamment · comme'], [b('Conclusion', 'Conclusion'), 'En conclusion · Pour conclure · Bref']],
        },
      },
      {
        kind: 'categorize',
        prompt: b('Cause or consequence?', 'Cause ou conséquence ?'),
        buckets: [b('Cause', 'Cause'), b('Consequence', 'Conséquence')],
        items: [{ text: 'car', bucket: 0 }, { text: 'puisque', bucket: 0 }, { text: 'étant donné que', bucket: 0 }, { text: 'donc', bucket: 1 }, { text: 'par conséquent', bucket: 1 }, { text: 'c’est pourquoi', bucket: 1 }],
      },
      {
        kind: 'fill',
        prompt: b('Choose the right connector.', 'Choisissez le bon connecteur.'),
        text: 'Les loyers augmentent ; ___, beaucoup de familles quittent le centre-ville.',
        answers: [['par conséquent']],
        choices: [['par conséquent', 'parce que', 'par exemple', 'pourtant']],
      },
      {
        kind: 'order',
        prompt: b('Put the argument in order.', 'Remettez l’argument dans l’ordre.'),
        words: ['D’abord,', 'le', 'vélo', 'est', 'écologique.', 'De', 'plus,', 'il', 'est', 'bon', 'pour', 'la', 'santé.'],
      },
      {
        kind: 'concept',
        variant: 'exam',
        title: b('The 3-part answer for oral exams', 'La réponse en 3 parties pour l’oral'),
        body: b('For TCF task 3 or the DELF B2 oral: **1. Position** (À mon avis, …) → **2. Two arguments with examples** (D’abord… par exemple… De plus…) → **3. Conclusion** (C’est pourquoi je pense que…). Simple, but examiners reward it.', 'Pour la tâche 3 du TCF ou l’oral du DELF B2 : **1. Position** (À mon avis, …) → **2. Deux arguments avec exemples** (D’abord… par exemple… De plus…) → **3. Conclusion** (C’est pourquoi je pense que…). Simple, mais les examinateurs le valorisent.'),
      },
      {
        kind: 'mcq',
        prompt: b('Listen. Which connector introduces the example?', 'Écoutez. Quel connecteur introduit l’exemple ?'),
        audio: 'Le télétravail réduit la fatigue. Par exemple, je gagne une heure et demie de transport chaque jour. C’est pourquoi je le recommande.',
        listen: true,
        voice: 'm2',
        options: ['par exemple', 'c’est pourquoi', 'chaque jour', 'je recommande'],
        answer: 0,
      },
      {
        kind: 'write',
        prompt: b('Write a short argument.', 'Rédigez une courte argumentation.'),
        task: b('“Should every student learn a second language at school?” Give your position, two arguments with an example each, and a conclusion (80–120 words).', '« Chaque élève devrait-il apprendre une deuxième langue à l’école ? » Donnez votre position, deux arguments avec un exemple chacun, et une conclusion (80 à 120 mots).'),
        min: 80,
        max: 120,
        checklist: [b('A clear position', 'Une position claire'), b('Two arguments introduced by connectors', 'Deux arguments introduits par des connecteurs'), b('An example for each', 'Un exemple pour chacun'), b('A conclusion (c’est pourquoi, en conclusion)', 'Une conclusion (c’est pourquoi, en conclusion)')],
        phrases: ['À mon avis,', 'D’abord,', 'De plus,', 'par exemple', 'notamment', 'C’est pourquoi', 'En conclusion,'],
        model: 'À mon avis, chaque élève devrait apprendre une deuxième langue dès l’école primaire. D’abord, c’est un atout pour l’avenir professionnel : par exemple, au Canada, beaucoup d’emplois exigent le français et l’anglais. De plus, apprendre une langue ouvre l’esprit sur d’autres cultures, notamment grâce aux échanges scolaires. Certes, les programmes sont déjà chargés, mais quelques heures par semaine suffisent pour progresser. C’est pourquoi je pense que les langues devraient être une priorité de l’éducation.',
      },
    ],
    notes: {
      points: [
        b('Order: d’abord, ensuite, enfin. Addition: de plus, en outre, par ailleurs.', 'Ordre : d’abord, ensuite, enfin. Ajout : de plus, en outre, par ailleurs.'),
        b('Cause: car, puisque, étant donné que. Consequence: donc, par conséquent, c’est pourquoi.', 'Cause : car, puisque, étant donné que. Conséquence : donc, par conséquent, c’est pourquoi.'),
        b('Oral exams: position → two arguments + examples → conclusion.', 'À l’oral : position → deux arguments + exemples → conclusion.'),
      ],
      vocab: [['de plus', b('moreover', 'en plus')], ['par conséquent', b('consequently', 'donc')], ['étant donné que', b('given that', 'puisque')], ['notamment', b('in particular', 'en particulier')]],
    },
  },
  {
    id: 'opinions-debate-3',
    slug: { en: 'conceding-and-nuancing', fr: 'conceder-et-nuancer' },
    title: b('Conceding and nuancing', 'Concéder et nuancer'),
    summary: b('Acknowledge the other side before defending yours: certes… mais, il est vrai que… cependant, bien que + subjunctive.', 'Reconnaître l’autre point de vue avant de défendre le vôtre : certes… mais, il est vrai que… cependant, bien que + subjonctif.'),
    objectives: [b('Use concession structures', 'Employer les structures de concession'), b('Oppose ideas with cependant, toutefois, en revanche', 'Opposer des idées avec cependant, toutefois, en revanche'), b('Sound balanced and convincing', 'Paraître équilibré et convaincant')],
    minutes: 14,
    steps: [
      {
        kind: 'concept',
        title: b('Concede first, then defend', 'Concéder d’abord, défendre ensuite'),
        body: b('A convincing speaker shows they understand the other side. Grant a point, then bring your counter-argument: the structure makes your opinion stronger.', 'Un orateur convaincant montre qu’il comprend l’autre point de vue. Accordez un point, puis apportez votre contre-argument : la structure renforce votre opinion.'),
        examples: [{ fr: 'Certes, la voiture est pratique, mais elle pollue énormément.' }, { fr: 'Il est vrai que les réseaux sociaux rapprochent les gens ; cependant, ils créent aussi de l’isolement.' }, { fr: 'Bien que ce projet coûte cher, il rapportera beaucoup à long terme.', note: b('bien que + subjunctive', 'bien que + subjonctif') }],
      },
      {
        kind: 'match',
        prompt: b('Concession and opposition.', 'Concession et opposition.'),
        pairs: [['Certes, …', b('… mais …', '… mais …')], ['Il est vrai que …', b('… cependant …', '… cependant …')], ['Bien que …', b('+ subjunctive', '+ subjonctif')], ['Même si …', b('+ indicative', '+ indicatif')]],
      },
      {
        kind: 'mcq',
        prompt: b('Choose the right form.', 'Choisissez la bonne forme.'),
        fr: 'Bien que le métro ___ rapide, je préfère marcher.',
        options: ['soit', 'est', 'sera', 'serait'],
        answer: 0,
      },
      {
        kind: 'fill',
        prompt: b('Complete the concession.', 'Complétez la concession.'),
        text: '___ , le travail à distance offre de la liberté, ___ il peut isoler les salariés.',
        answers: [['Certes'], ['mais']],
        choices: [['Certes', 'Donc', 'Car'], ['mais', 'donc', 'car']],
      },
      {
        kind: 'concept',
        variant: 'tip',
        title: b('Opposition connectors', 'Les connecteurs d’opposition'),
        body: b('**Cependant, toutefois, néanmoins** (however) start a new idea in opposition. **En revanche, par contre** compare two different situations. **Alors que, tandis que** (whereas) link two contrasting facts in one sentence.', '**Cependant, toutefois, néanmoins** introduisent une idée opposée. **En revanche, par contre** comparent deux situations différentes. **Alors que, tandis que** relient deux faits contrastés dans une même phrase.'),
        examples: [{ fr: 'Le centre-ville est animé ; en revanche, il est bruyant.' }, { fr: 'Mon frère adore la ville, alors que moi, je préfère la campagne.' }],
      },
      {
        kind: 'order',
        prompt: b('Build a nuanced sentence.', 'Construisez une phrase nuancée.'),
        words: ['Il', 'est', 'vrai', 'que', 'c’est', 'cher', ';', 'toutefois,', 'la', 'qualité', 'est', 'excellente.'],
      },
      {
        kind: 'speak',
        prompt: b('Concede and defend, aloud.', 'Concédez et défendez, à voix haute.'),
        text: 'Certes, apprendre le français demande du temps, mais c’est un investissement qui en vaut la peine.',
        tr: 'Admittedly, learning French takes time, but it is an investment worth making.',
      },
      {
        kind: 'write',
        prompt: b('Nuance your opinion.', 'Nuancez votre opinion.'),
        task: b('“Big cities are better places to live than the countryside.” Write 80–120 words with at least one concession (certes / il est vrai que / bien que) and one opposition connector.', '« Les grandes villes sont de meilleurs lieux de vie que la campagne. » Écrivez 80 à 120 mots avec au moins une concession (certes / il est vrai que / bien que) et un connecteur d’opposition.'),
        min: 80,
        max: 120,
        checklist: [b('A concession', 'Une concession'), b('An opposition connector (cependant, en revanche…)', 'Un connecteur d’opposition (cependant, en revanche…)'), b('A personal conclusion', 'Une conclusion personnelle')],
        phrases: ['Certes,', 'Il est vrai que', 'Bien que', 'cependant', 'en revanche', 'alors que', 'Pour ma part,'],
        model: 'Il est vrai que les grandes villes offrent de nombreux avantages : des emplois variés, des transports en commun et une vie culturelle riche. Cependant, elles présentent aussi des inconvénients importants. Les loyers y sont très élevés et la pollution affecte la santé des habitants. À la campagne, en revanche, on profite du calme et de la nature, bien que les services soient plus éloignés. Pour ma part, je pense que le meilleur choix dépend de l’étape de la vie : la ville pour étudier, la campagne pour élever ses enfants.',
      },
    ],
    notes: {
      points: [
        b('Concession: certes… mais, il est vrai que… cependant, bien que + subjunctive, même si + indicative.', 'Concession : certes… mais, il est vrai que… cependant, bien que + subjonctif, même si + indicatif.'),
        b('Opposition: cependant, toutefois, néanmoins; en revanche, par contre; alors que, tandis que.', 'Opposition : cependant, toutefois, néanmoins ; en revanche, par contre ; alors que, tandis que.'),
        b('Concede first, then defend: it makes your opinion more convincing.', 'Concéder d’abord, défendre ensuite : l’opinion devient plus convaincante.'),
      ],
      vocab: [['certes', b('admittedly', 'il est vrai')], ['toutefois', b('however', 'cependant')], ['en revanche', b('on the other hand', 'par contre')], ['tandis que', b('whereas', 'alors que')], ['en valoir la peine', b('to be worth it', 'mériter l’effort')]],
    },
  },
];

export default lessons;
