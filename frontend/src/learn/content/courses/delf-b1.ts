import { b, type Lesson } from '../../types';

const lessons: Lesson[] = [
  {
    id: 'delf-b1-1',
    slug: { en: 'format-and-marking', fr: 'format-et-bareme' },
    title: b('The DELF B1: format and marking', 'Le DELF B1 : format et barème'),
    summary: b('Four papers marked out of 25 each: how to pass with 50/100 and why every paper needs at least 5/25.', 'Quatre épreuves notées sur 25 : comment réussir avec 50/100 et pourquoi chaque épreuve exige au moins 5/25.'),
    objectives: [b('Know the four papers and their timing', 'Connaître les quatre épreuves et leur durée'), b('Understand the pass mark and the minimum per paper', 'Comprendre la note de réussite et le minimum par épreuve'), b('Know what B1 means', 'Savoir ce que signifie B1')],
    minutes: 11,
    steps: [
      {
        kind: 'concept',
        variant: 'exam',
        title: b('A diploma for life', 'Un diplôme à vie'),
        body: b('The DELF (Diplôme d’études en langue française) is awarded by the French Ministry of Education and **never expires**. The B1 level proves you are an **independent user**: you can handle most everyday situations and express opinions simply.', 'Le DELF (Diplôme d’études en langue française) est délivré par le ministère français de l’Éducation nationale et **n’expire jamais**. Le niveau B1 atteste un **utilisateur indépendant** : vous gérez la plupart des situations du quotidien et exprimez simplement une opinion.'),
        table: {
          head: [b('Paper', 'Épreuve'), b('Duration', 'Durée'), b('Mark', 'Note')],
          rows: [[b('Listening', 'Compréhension de l’oral'), b('about 25 min', 'environ 25 min'), '/25'], [b('Reading', 'Compréhension des écrits'), '45 min', '/25'], [b('Writing', 'Production écrite'), '45 min', '/25'], [b('Speaking', 'Production orale'), b('15 min (+10 min preparation)', '15 min (+10 min de préparation)'), '/25']],
          caption: b('Check the current format on the official France Éducation international website.', 'Vérifiez le format en vigueur sur le site officiel de France Éducation international.'),
        },
      },
      {
        kind: 'concept',
        variant: 'trap',
        title: b('50/100… and at least 5/25 everywhere', '50/100… et au moins 5/25 partout'),
        body: b('To pass, you need **50 out of 100** in total **and at least 5 out of 25** in each paper. A candidate with 70/100 but 4/25 in writing **fails**. Never neglect a paper.', 'Pour réussir, il faut **50 sur 100** au total **et au moins 5 sur 25** à chaque épreuve. Un candidat avec 70/100 mais 4/25 en production écrite **échoue**. Ne négligez aucune épreuve.'),
      },
      {
        kind: 'mcq',
        prompt: b('Scores: listening 18, reading 20, writing 4, speaking 16. Result?', 'Notes : oral 18, écrit 20, production écrite 4, production orale 16. Résultat ?'),
        options: [b('Failed: writing is below 5/25', 'Échec : la production écrite est sous 5/25'), b('Passed with 58/100', 'Réussi avec 58/100'), b('Passed with honours', 'Réussi avec mention'), b('Partially passed', 'Partiellement réussi')],
        answer: 0,
      },
      {
        kind: 'mcq',
        prompt: b('How long is the DELF B1 valid?', 'Combien de temps le DELF B1 est-il valable ?'),
        options: [b('For life', 'À vie'), b('2 years', '2 ans'), b('5 years', '5 ans'), b('1 year', '1 an')],
        answer: 0,
      },
      {
        kind: 'categorize',
        prompt: b('DELF or TCF?', 'DELF ou TCF ?'),
        buckets: ['DELF', 'TCF'],
        items: [{ text: 'Valable à vie', bucket: 0 }, { text: 'On réussit ou on échoue', bucket: 0 }, { text: 'Un niveau précis (B1)', bucket: 0 }, { text: 'Valable 2 ans', bucket: 1 }, { text: 'Un score sur 699', bucket: 1 }, { text: 'Situe du A1 au C2 en une session', bucket: 1 }],
      },
    ],
    notes: {
      points: [
        b('DELF B1: listening (~25 min), reading (45 min), writing (45 min), speaking (15 min + 10 min prep), each /25.', 'DELF B1 : compréhension de l’oral (~25 min), des écrits (45 min), production écrite (45 min), orale (15 min + 10 min de préparation), chacune /25.'),
        b('Pass: 50/100 and at least 5/25 in every paper.', 'Réussite : 50/100 et au moins 5/25 à chaque épreuve.'),
        b('The DELF is valid for life; the TCF/TEF are valid 2 years.', 'Le DELF est valable à vie ; le TCF/TEF 2 ans.'),
      ],
      vocab: [['le barème', b('marking scheme', 'grille de notation')], ['une note éliminatoire', b('a failing mark', 'note qui fait échouer')], ['un utilisateur indépendant', b('independent user', 'niveau B1–B2')]],
    },
  },
  {
    id: 'delf-b1-2',
    slug: { en: 'the-written-production', fr: 'la-production-ecrite' },
    title: b('The written production: a 160-word essay or letter', 'La production écrite : un essai ou une lettre de 160 mots'),
    summary: b('Express your opinion on a familiar topic in a structured text: introduction, arguments, examples, conclusion.', 'Exprimer votre opinion sur un sujet familier dans un texte structuré : introduction, arguments, exemples, conclusion.'),
    objectives: [b('Understand the instructions and the expected genre', 'Comprendre la consigne et le genre attendu'), b('Structure a 160-word text', 'Structurer un texte de 160 mots'), b('Use B1 tools: connectors, tenses, opinion phrases', 'Utiliser les outils du B1 : connecteurs, temps, expressions d’opinion')],
    minutes: 16,
    steps: [
      {
        kind: 'concept',
        variant: 'exam',
        title: b('The task', 'La tâche'),
        body: b('You write **at least 160 words**: an essay, a letter or a forum post giving your opinion on a general topic (studies, work, environment, technology…). Graders check that you respect the **genre** and the **instructions**, the **coherence** of your ideas, and the **vocabulary and grammar**.', 'Vous écrivez **au moins 160 mots** : un essai, une lettre ou un message de forum donnant votre opinion sur un sujet général (études, travail, environnement, technologie…). Les correcteurs vérifient le respect du **genre** et de la **consigne**, la **cohérence** des idées, le **vocabulaire** et la **grammaire**.'),
      },
      {
        kind: 'concept',
        title: b('A reliable plan', 'Un plan fiable'),
        points: [
          b('**Introduction**: present the topic and your opinion in 2 sentences.', '**Introduction** : présentez le sujet et votre opinion en 2 phrases.'),
          b('**Argument 1 + example** (D’abord… Par exemple…).', '**Argument 1 + exemple** (D’abord… Par exemple…).'),
          b('**Argument 2 + example** (Ensuite / De plus…).', '**Argument 2 + exemple** (Ensuite / De plus…).'),
          b('**Conclusion**: sum up and open (En conclusion… / Pour toutes ces raisons…).', '**Conclusion** : résumez et ouvrez (En conclusion… / Pour toutes ces raisons…).'),
        ],
      },
      {
        kind: 'mcq',
        prompt: b('Instructions: “Write a letter to the editor of a magazine.” Which detail is compulsory?', 'Consigne : « Écrivez une lettre au rédacteur d’un magazine. » Quel élément est obligatoire ?'),
        options: [b('Letter conventions: greeting, closing formula, signature', 'Les codes de la lettre : formule d’appel, formule finale, signature'), b('A title in capital letters', 'Un titre en majuscules'), b('Bullet points', 'Des listes à puces'), b('A drawing', 'Un dessin')],
        answer: 0,
      },
      {
        kind: 'fill',
        prompt: b('Choose the right connectors.', 'Choisissez les bons connecteurs.'),
        text: '___ , le vélo est bon pour la santé. ___ , il ne pollue pas. ___ , je pense que les villes devraient l’encourager.',
        answers: [['D’abord'], ['De plus'], ['C’est pourquoi']],
        choices: [['D’abord', 'Cependant', 'Donc'], ['De plus', 'Par exemple', 'Bien que'], ['C’est pourquoi', 'Pourtant', 'D’abord']],
      },
      {
        kind: 'write',
        prompt: b('Your turn: a DELF B1 production.', 'À vous : une production du DELF B1.'),
        task: b('On a forum, someone writes: “Studying online is better than going to class.” You answer and give your opinion with arguments and examples. (at least 160 words)', 'Sur un forum, quelqu’un écrit : « Étudier en ligne, c’est mieux qu’aller en cours. » Vous répondez et donnez votre opinion avec des arguments et des exemples. (160 mots minimum)'),
        min: 160,
        max: 220,
        checklist: [b('Introduction with your opinion', 'Introduction avec votre opinion'), b('Two arguments, each with an example', 'Deux arguments, chacun avec un exemple'), b('Connectors (d’abord, de plus, cependant…)', 'Des connecteurs (d’abord, de plus, cependant…)'), b('A conclusion', 'Une conclusion'), b('At least 160 words', 'Au moins 160 mots')],
        phrases: ['À mon avis,', 'D’abord,', 'Par exemple,', 'De plus,', 'Cependant,', 'En conclusion,', 'Pour toutes ces raisons,'],
        model: 'Bonjour à tous,\n\nJe ne suis pas tout à fait d’accord avec cette idée. À mon avis, les cours en ligne sont pratiques, mais ils ne remplacent pas complètement les cours en classe.\n\nD’abord, il est vrai qu’étudier en ligne fait gagner du temps. Par exemple, l’année dernière, j’ai suivi un cours d’anglais depuis chez moi et je n’avais plus deux heures de transport par jour. C’est un vrai avantage pour les personnes qui travaillent.\n\nCependant, en classe, on apprend aussi grâce aux autres. On peut poser des questions directement au professeur, travailler en groupe et rester motivé. Quand j’étudiais seul devant mon ordinateur, j’avais souvent du mal à me concentrer.\n\nPour toutes ces raisons, je pense que la meilleure solution est de combiner les deux : quelques cours en ligne pour la flexibilité, et des cours en présentiel pour l’échange et la motivation.\n\nÀ bientôt,\nYasmine',
        modelNote: b('About 180 words: forum genre respected (greeting, signature), clear opinion, two arguments with personal examples, connectors, past tenses for examples, balanced conclusion.', 'Environ 180 mots : genre du forum respecté (salutation, signature), opinion claire, deux arguments avec exemples personnels, connecteurs, temps du passé pour les exemples, conclusion équilibrée.'),
      },
    ],
    notes: {
      points: [
        b('Write at least 160 words; respect the genre (letter, forum post, essay).', 'Écrivez au moins 160 mots ; respectez le genre (lettre, message de forum, essai).'),
        b('Plan: introduction + opinion → argument 1 + example → argument 2 + example → conclusion.', 'Plan : introduction + opinion → argument 1 + exemple → argument 2 + exemple → conclusion.'),
        b('Show B1 tools: connectors, opinion phrases, past tenses in examples, a conditional.', 'Montrez les outils du B1 : connecteurs, expressions d’opinion, temps du passé dans les exemples, un conditionnel.'),
      ],
      vocab: [['le rédacteur', b('editor', 'responsable d’un journal')], ['en présentiel', b('in person', 'sur place')], ['avoir du mal à', b('to struggle to', 'avoir des difficultés à')], ['combiner', b('to combine', 'associer')]],
    },
  },
  {
    id: 'delf-b1-3',
    slug: { en: 'the-oral-production', fr: 'la-production-orale' },
    title: b('The oral production: three parts', 'La production orale : trois parties'),
    summary: b('The guided interview, the interaction exercise and the monologue on a document: what the examiner expects in each.', 'L’entretien dirigé, l’exercice en interaction et le monologue sur un document : ce que l’examinateur attend dans chacun.'),
    objectives: [b('Know the three parts of the oral', 'Connaître les trois parties de l’oral'), b('Handle a role-play with a problem to solve', 'Mener un jeu de rôle avec un problème à résoudre'), b('Present a point of view from a document', 'Présenter un point de vue à partir d’un document')],
    minutes: 15,
    steps: [
      {
        kind: 'concept',
        variant: 'exam',
        title: b('Three parts in about 15 minutes', 'Trois parties en 15 minutes environ'),
        table: {
          head: [b('Part', 'Partie'), b('What happens', 'Déroulement')],
          rows: [[b('1. Guided interview (2–3 min)', '1. Entretien dirigé (2–3 min)'), b('You talk about yourself, your activities, your projects. No preparation.', 'Vous parlez de vous, de vos activités, de vos projets. Sans préparation.')], [b('2. Interaction (3–4 min)', '2. Exercice en interaction (3–4 min)'), b('A role-play with a problem to solve (complaining, negotiating, convincing).', 'Un jeu de rôle avec un problème à résoudre (réclamer, négocier, convaincre).')], [b('3. Point of view (5–7 min)', '3. Expression d’un point de vue (5–7 min)'), b('From a short document (you choose one of two drawn at random), you present the topic and your opinion, then discuss. 10 minutes of preparation.', 'À partir d’un court document (vous choisissez entre deux sujets tirés au sort), vous présentez le sujet et votre opinion, puis échangez. 10 minutes de préparation.')]],
        },
      },
      {
        kind: 'dialogue',
        title: b('Part 2: returning a faulty product', 'Partie 2 : rapporter un produit défectueux'),
        scene: b('You bought a phone that does not work. The examiner is the shop assistant. Solve the problem.', 'Vous avez acheté un téléphone qui ne fonctionne pas. L’examinateur joue le vendeur. Résolvez le problème.'),
        speakers: [{ name: 'Vendeur', voice: 'm', side: 'l' }, { name: 'Vous', voice: 'f', side: 'r' }],
        lines: [
          { s: 0, fr: 'Bonjour, je peux vous aider ?', tr: 'Hello, can I help you?' },
          { s: 1, choose: { options: ['Bonjour, j’ai acheté ce téléphone la semaine dernière et l’écran ne s’allume plus.', 'Votre téléphone est nul.', 'Je veux l’argent.'], answer: 0 } },
          { s: 0, fr: 'Vous avez votre ticket de caisse ?', tr: 'Do you have your receipt?' },
          { s: 1, choose: { options: ['Oui, le voici. Je souhaiterais l’échanger ou être remboursée.', 'Non, pourquoi ?', 'Le ticket est dans le téléphone.'], answer: 0 } },
          { s: 0, fr: 'Nous pouvons l’envoyer en réparation, cela prend trois semaines.', tr: 'We can send it for repair, it takes three weeks.' },
          { s: 1, choose: { options: ['Trois semaines, c’est long : j’en ai besoin pour mon travail. Ne serait-il pas possible de l’échanger tout de suite ?', 'D’accord, au revoir.', 'C’est inacceptable, je pars.'], answer: 0, explain: b('Negotiate politely: explain your need and propose a solution.', 'Négociez poliment : expliquez votre besoin et proposez une solution.') } },
          { s: 0, fr: 'Bon, puisqu’il est sous garantie, je vous l’échange.', tr: 'Well, since it is under warranty, I’ll exchange it for you.' },
        ],
      },
      {
        kind: 'concept',
        variant: 'tip',
        title: b('Part 3: present a document in 4 steps', 'Partie 3 : présenter un document en 4 étapes'),
        points: [
          b('**Introduce** the document: Ce document, tiré de…, parle de…', '**Présentez** le document : Ce document, tiré de…, parle de…'),
          b('**Raise the question**: Il pose la question de savoir si…', '**Posez la problématique** : Il pose la question de savoir si…'),
          b('**Give your opinion** with two arguments and examples.', '**Donnez votre opinion** avec deux arguments et des exemples.'),
          b('**Conclude** and be ready for the examiner’s questions.', '**Concluez** et préparez-vous aux questions de l’examinateur.'),
        ],
      },
      {
        kind: 'order',
        prompt: b('Build the introduction of a document presentation.', 'Construisez l’introduction d’une présentation de document.'),
        words: ['Ce', 'document,', 'tiré', 'd’un', 'magazine,', 'parle', 'du', 'travail', 'à', 'distance.'],
      },
      {
        kind: 'speak',
        prompt: b('Present the problem of a document aloud.', 'Présentez la problématique d’un document à voix haute.'),
        text: 'Ce document pose la question de savoir si les jeunes passent trop de temps sur leur téléphone.',
        tr: 'This document raises the question of whether young people spend too much time on their phones.',
      },
    ],
    notes: {
      points: [
        b('Part 1: guided interview (2–3 min). Part 2: role-play with a problem (3–4 min). Part 3: point of view from a document (5–7 min, 10 min prep).', 'Partie 1 : entretien dirigé (2–3 min). Partie 2 : jeu de rôle avec un problème (3–4 min). Partie 3 : point de vue sur un document (5–7 min, 10 min de préparation).'),
        b('In the role-play: explain, negotiate politely, propose a solution.', 'Dans le jeu de rôle : expliquer, négocier poliment, proposer une solution.'),
        b('Document presentation: introduce → problem → opinion + 2 arguments → conclusion.', 'Présentation du document : présenter → problématique → opinion + 2 arguments → conclusion.'),
      ],
      vocab: [['le ticket de caisse', b('receipt', 'preuve d’achat')], ['être remboursé', b('to get a refund', 'récupérer son argent')], ['sous garantie', b('under warranty', 'couvert par la garantie')], ['la problématique', b('the central question', 'question posée par le document')]],
    },
  },
];

export default lessons;
