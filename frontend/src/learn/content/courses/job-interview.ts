import { b, type Lesson } from '../../types';

const lessons: Lesson[] = [
  {
    id: 'job-interview-1',
    slug: { en: 'presenting-your-background', fr: 'presenter-son-parcours' },
    title: b('Presenting your background and skills', 'Présenter son parcours et ses compétences'),
    summary: b('The “tell me about yourself” answer: a two-minute pitch linking your experience to the job.', 'La réponse à « parlez-moi de vous » : une présentation de deux minutes qui relie votre expérience au poste.'),
    objectives: [b('Structure a professional pitch', 'Structurer une présentation professionnelle'), b('Describe experience and achievements', 'Décrire votre expérience et vos réalisations'), b('Use the right tenses and action verbs', 'Utiliser les bons temps et des verbes d’action')],
    minutes: 14,
    steps: [
      {
        kind: 'concept',
        title: b('The present–past–future pitch', 'La présentation présent–passé–futur'),
        points: [
          b('**Present**: who you are today (Je suis développeuse web, spécialisée en…).', '**Présent** : qui vous êtes aujourd’hui (Je suis développeuse web, spécialisée en…).'),
          b('**Past**: your key experiences and one achievement (Pendant cinq ans, j’ai… J’ai notamment…).', '**Passé** : vos expériences clés et une réussite (Pendant cinq ans, j’ai… J’ai notamment…).'),
          b('**Future**: why this job (Aujourd’hui, je souhaite… c’est pourquoi votre entreprise…).', '**Futur** : pourquoi ce poste (Aujourd’hui, je souhaite… c’est pourquoi votre entreprise…).'),
        ],
      },
      {
        kind: 'flashcards',
        title: b('Action verbs for your CV and interview', 'Verbes d’action pour le CV et l’entretien'),
        cards: [
          { fr: 'gérer', tr: b('to manage', 'diriger, administrer'), ex: 'J’ai géré une équipe de six personnes.' },
          { fr: 'piloter un projet', tr: b('to lead a project', 'conduire un projet') },
          { fr: 'mettre en place', tr: b('to set up, implement', 'installer, instaurer') },
          { fr: 'améliorer', tr: b('to improve', 'rendre meilleur') },
          { fr: 'négocier', tr: b('to negotiate', 'discuter un accord') },
          { fr: 'former', tr: b('to train (people)', 'enseigner à des collègues') },
        ],
      },
      {
        kind: 'concept',
        variant: 'tip',
        title: b('Quantify your achievements', 'Chiffrez vos réussites'),
        body: b('Recruiters remember numbers: **J’ai réduit les délais de livraison de 20 %**, **J’ai formé quinze nouveaux employés**, **J’ai géré un budget de 200 000 $**.', 'Les recruteurs retiennent les chiffres : **J’ai réduit les délais de livraison de 20 %**, **J’ai formé quinze nouveaux employés**, **J’ai géré un budget de 200 000 $**.'),
      },
      {
        kind: 'mcq',
        prompt: b('Which sentence is the strongest in an interview?', 'Quelle phrase est la plus forte en entretien ?'),
        options: ['Dans mon dernier poste, j’ai mis en place un nouvel outil qui a réduit les erreurs de facturation de 30 %.', 'J’ai travaillé beaucoup dans mon ancien travail.', 'Je suis quelqu’un de bien.', 'J’ai fait des choses dans la comptabilité.'],
        answer: 0,
      },
      {
        kind: 'order',
        prompt: b('Build the sentence.', 'Construisez la phrase.'),
        tr: 'For four years I managed a team of eight technicians.',
        words: ['Pendant', 'quatre', 'ans,', 'j’ai', 'géré', 'une', 'équipe', 'de', 'huit', 'techniciens.'],
      },
      {
        kind: 'speak',
        prompt: b('Say the opening of your pitch.', 'Dites le début de votre présentation.'),
        text: 'Je suis ingénieure en logistique, avec six ans d’expérience dans l’optimisation des chaînes d’approvisionnement.',
        tr: 'I am a logistics engineer with six years of experience in supply chain optimisation.',
      },
      {
        kind: 'write',
        prompt: b('Write your pitch.', 'Rédigez votre présentation.'),
        task: b('Write your answer to “Parlez-moi de vous” (80–120 words) using the present–past–future structure and at least one figure.', 'Rédigez votre réponse à « Parlez-moi de vous » (80 à 120 mots) avec la structure présent–passé–futur et au moins un chiffre.'),
        min: 80,
        max: 120,
        checklist: [b('Present: your current role', 'Présent : votre poste actuel'), b('Past: experience + a quantified achievement', 'Passé : expérience + une réussite chiffrée'), b('Future: why this job', 'Futur : pourquoi ce poste'), b('Action verbs', 'Des verbes d’action')],
        phrases: ['Je suis', 'Pendant', 'j’ai notamment', 'ce qui a permis de', 'Aujourd’hui, je souhaite', 'C’est pourquoi'],
        model: 'Je suis comptable de formation et je travaille depuis six ans dans le secteur de la distribution. Dans mon poste actuel, à Casablanca, je gère la paie de 250 employés et je prépare les déclarations fiscales de l’entreprise. J’ai notamment mis en place un logiciel de facturation qui a réduit les erreurs de 30 %. Depuis mon arrivée au Canada, j’ai suivi une formation sur les normes comptables canadiennes. Aujourd’hui, je souhaite rejoindre une entreprise en pleine croissance comme la vôtre, où je pourrai mettre mon expérience au service d’une équipe dynamique.',
      },
    ],
    notes: {
      points: [
        b('Pitch: present (current role) → past (experience + achievement) → future (why this job).', 'Présentation : présent (poste actuel) → passé (expérience + réussite) → futur (pourquoi ce poste).'),
        b('Action verbs: gérer, piloter, mettre en place, améliorer, négocier, former.', 'Verbes d’action : gérer, piloter, mettre en place, améliorer, négocier, former.'),
        b('Quantify: réduit de 20 %, formé quinze personnes, géré un budget de…', 'Chiffrez : réduit de 20 %, formé quinze personnes, géré un budget de…'),
      ],
      vocab: [['le parcours', b('career path', 'ensemble des expériences')], ['une réalisation', b('an achievement', 'résultat obtenu')], ['la chaîne d’approvisionnement', b('supply chain', 'logistique')], ['en pleine croissance', b('fast-growing', 'qui se développe')]],
    },
  },
  {
    id: 'job-interview-2',
    slug: { en: 'classic-interview-questions', fr: 'les-questions-classiques' },
    title: b('Answering the classic interview questions', 'Répondre aux questions classiques'),
    summary: b('Strengths, weaknesses, why us, salary expectations: prepared, honest answers that convince.', 'Qualités, défauts, pourquoi nous, prétentions salariales : des réponses préparées et sincères qui convainquent.'),
    objectives: [b('Present strengths with proof', 'Présenter des qualités avec des preuves'), b('Talk about a weakness positively', 'Parler d’un défaut de façon constructive'), b('Explain your motivation', 'Expliquer votre motivation')],
    minutes: 15,
    steps: [
      {
        kind: 'concept',
        title: b('Strengths: always with proof', 'Les qualités : toujours avec une preuve'),
        body: b('Do not just list adjectives. Give **one quality + one concrete example**: **Je suis rigoureux : dans mon dernier poste, j’étais chargé de vérifier tous les contrats avant signature.**', 'Ne vous contentez pas d’une liste d’adjectifs. Donnez **une qualité + un exemple concret** : **Je suis rigoureux : dans mon dernier poste, j’étais chargé de vérifier tous les contrats avant signature.**'),
      },
      {
        kind: 'match',
        prompt: b('Qualities and meanings.', 'Qualités et sens.'),
        pairs: [['rigoureux', b('rigorous, careful', 'précis et méthodique')], ['polyvalent', b('versatile', 'capable de faire plusieurs tâches')], ['autonome', b('independent', 'qui travaille seul')], ['force de proposition', b('proactive, full of ideas', 'qui propose des idées')], ['à l’écoute', b('a good listener', 'attentif aux autres')]],
      },
      {
        kind: 'concept',
        variant: 'tip',
        title: b('The weakness question', 'La question du défaut'),
        body: b('Choose a **real but manageable** weakness, then show **what you do about it**: **J’ai parfois du mal à déléguer ; j’ai appris à mieux répartir les tâches en utilisant un outil de gestion de projet.** Avoid fake answers like “je suis trop perfectionniste”.', 'Choisissez un défaut **réel mais maîtrisable**, puis montrez **ce que vous faites pour l’améliorer** : **J’ai parfois du mal à déléguer ; j’ai appris à mieux répartir les tâches grâce à un outil de gestion de projet.** Évitez les fausses réponses comme « je suis trop perfectionniste ».'),
      },
      {
        kind: 'mcq',
        prompt: b('Which answer to “Quel est votre principal défaut ?” is best?', 'Quelle réponse à « Quel est votre principal défaut ? » est la meilleure ?'),
        options: ['Je suis parfois impatient quand un projet avance lentement. J’ai appris à fixer des étapes intermédiaires pour que tout le monde reste motivé.', 'Je n’ai aucun défaut.', 'Je suis souvent en retard.', 'Je suis trop parfait.'],
        answer: 0,
      },
      {
        kind: 'dialogue',
        title: b('Simulation: the interview', 'Simulation : l’entretien'),
        scene: b('A job interview for a project coordinator position in Montréal.', 'Un entretien pour un poste de coordonnateur de projets à Montréal.'),
        speakers: [{ name: 'Recruteuse', voice: 'f', side: 'l' }, { name: 'Vous', voice: 'm', side: 'r' }],
        lines: [
          { s: 0, fr: 'Pourquoi souhaitez-vous rejoindre notre entreprise ?', tr: 'Why do you want to join our company?' },
          { s: 1, choose: { options: ['J’apprécie vos projets dans les énergies renouvelables, et je pense que mon expérience en gestion de chantiers vous serait utile.', 'Parce que j’ai besoin d’un travail.', 'Parce que le bureau est près de chez moi.'], answer: 0 } },
          { s: 0, fr: 'Quelles sont vos principales qualités ?', tr: 'What are your main strengths?' },
          { s: 1, choose: { options: ['Je suis organisé et à l’écoute : par exemple, j’ai coordonné une équipe de dix personnes sur trois chantiers en même temps.', 'Je suis gentil.', 'Toutes les qualités.'], answer: 0 } },
          { s: 0, fr: 'Quelles sont vos prétentions salariales ?', tr: 'What are your salary expectations?' },
          { s: 1, choose: { options: ['Selon mes recherches pour ce type de poste, je vise une fourchette entre soixante-cinq et soixante-dix mille dollars, mais je reste ouvert à la discussion.', 'Le plus possible.', 'Je ne sais pas, vous décidez.'], answer: 0, explain: b('Give a researched range and stay open.', 'Donnez une fourchette documentée et restez ouvert.') } },
          { s: 0, fr: 'Avez-vous des questions pour nous ?', tr: 'Do you have any questions for us?' },
          { s: 1, choose: { options: ['Oui : comment se compose l’équipe avec laquelle je travaillerais, et quels seraient les objectifs des six premiers mois ?', 'Non, merci.', 'Combien de vacances ?'], answer: 0 } },
        ],
      },
      {
        kind: 'speak',
        prompt: b('Present a strength with proof.', 'Présentez une qualité avec une preuve.'),
        text: 'Je suis polyvalente : dans mon dernier poste, je gérais à la fois les achats et la relation avec les fournisseurs.',
        tr: 'I am versatile: in my last job I handled both purchasing and supplier relations.',
      },
    ],
    notes: {
      points: [
        b('Strengths: one quality + one concrete example.', 'Qualités : une qualité + un exemple concret.'),
        b('Weakness: real but manageable + what you do to improve.', 'Défaut : réel mais maîtrisable + ce que vous faites pour progresser.'),
        b('Motivation: link the company’s projects to your experience. Salary: a researched range.', 'Motivation : reliez les projets de l’entreprise à votre expérience. Salaire : une fourchette documentée.'),
        b('Always ask a question at the end (team, objectives).', 'Posez toujours une question à la fin (équipe, objectifs).'),
      ],
      vocab: [['les prétentions salariales', b('salary expectations', 'salaire souhaité')], ['une fourchette', b('a range', 'intervalle')], ['déléguer', b('to delegate', 'confier des tâches')], ['polyvalent', b('versatile', 'capable de faire plusieurs choses')]],
    },
  },
  {
    id: 'job-interview-3',
    slug: { en: 'taking-part-in-meetings', fr: 'participer-aux-reunions' },
    title: b('Taking part in meetings', 'Participer aux réunions'),
    summary: b('Take the floor, agree, disagree diplomatically, rephrase and summarise decisions in French.', 'Prendre la parole, approuver, objecter avec diplomatie, reformuler et résumer les décisions en français.'),
    objectives: [b('Take and keep the floor politely', 'Prendre et garder la parole poliment'), b('Disagree diplomatically', 'Exprimer un désaccord avec diplomatie'), b('Rephrase and summarise', 'Reformuler et résumer')],
    minutes: 14,
    steps: [
      {
        kind: 'concept',
        title: b('Meeting phrases', 'Les formules de réunion'),
        table: {
          head: [b('Function', 'Fonction'), b('Phrases', 'Formules')],
          rows: [[b('Take the floor', 'Prendre la parole'), 'Si je peux me permettre… · J’aimerais ajouter quelque chose.'], [b('Agree', 'Approuver'), 'Je rejoins tout à fait Marc sur ce point.'], [b('Disagree diplomatically', 'Objecter avec diplomatie'), 'Je vois les choses un peu différemment. · Je me demande si…'], [b('Rephrase', 'Reformuler'), 'Si je comprends bien, tu proposes de… ?'], [b('Summarise', 'Résumer'), 'Pour résumer, nous avons décidé de…']],
        },
      },
      {
        kind: 'categorize',
        prompt: b('Diplomatic or too direct?', 'Diplomatique ou trop direct ?'),
        buckets: [b('Diplomatic', 'Diplomatique'), b('Too direct', 'Trop direct')],
        items: [{ text: 'Je vois les choses un peu différemment.', bucket: 0 }, { text: 'Je me demande si ce délai est réaliste.', bucket: 0 }, { text: 'C’est une piste intéressante, mais…', bucket: 0 }, { text: 'C’est complètement faux.', bucket: 1 }, { text: 'Ton idée ne marchera jamais.', bucket: 1 }, { text: 'N’importe quoi.', bucket: 1 }],
      },
      {
        kind: 'mcq',
        prompt: b('A colleague proposes an unrealistic deadline. What do you say?', 'Un collègue propose un délai irréaliste. Que dites-vous ?'),
        options: ['C’est ambitieux ; je me demande si on aura le temps de tester. Est-ce qu’on pourrait prévoir une semaine de plus ?', 'C’est impossible.', 'Tu ne sais pas planifier.', 'D’accord, même si c’est faux.'],
        answer: 0,
      },
      {
        kind: 'dialogue',
        title: b('Simulation: team meeting', 'Simulation : réunion d’équipe'),
        scene: b('Your team plans the launch of a new service.', 'Votre équipe prépare le lancement d’un nouveau service.'),
        speakers: [{ name: 'Chef de projet', voice: 'm2', side: 'l' }, { name: 'Vous', voice: 'f2', side: 'r' }],
        lines: [
          { s: 0, fr: 'Je propose de lancer le service le premier mars. Qu’en pensez-vous ?', tr: 'I suggest launching the service on 1 March. What do you think?' },
          { s: 1, choose: { options: ['Si je peux me permettre, je me demande si on aura assez de temps pour former l’équipe du service client.', 'Non, c’est trop tôt.', 'Je n’ai pas d’avis.'], answer: 0 } },
          { s: 0, fr: 'Bonne remarque. Tu proposerais quoi ?', tr: 'Good point. What would you suggest?' },
          { s: 1, choose: { options: ['On pourrait garder le premier mars pour un lancement test, puis ouvrir à tous les clients le quinze.', 'De tout annuler.', 'Je ne sais pas, c’est votre problème.'], answer: 0 } },
          { s: 0, fr: 'Ça me semble raisonnable. Tout le monde est d’accord ?', tr: 'That seems reasonable. Does everyone agree?' },
          { s: 1, choose: { options: ['Parfait. Pour résumer : lancement test le premier mars, ouverture générale le quinze, et formation de l’équipe d’ici là.', 'Oui.', 'On verra.'], answer: 0 } },
        ],
      },
      {
        kind: 'speak',
        prompt: b('Summarise a decision aloud.', 'Résumez une décision à voix haute.'),
        text: 'Pour résumer, nous avons décidé de reporter le lancement de deux semaines et de renforcer l’équipe de test.',
        tr: 'To sum up, we decided to postpone the launch by two weeks and strengthen the testing team.',
      },
      {
        kind: 'concept',
        variant: 'culture',
        title: b('Meeting culture', 'La culture des réunions'),
        body: b('In France, debate and disagreement in meetings are normal and can be lively. In Québec, the style is often more consensual and informal. In both cases, **rephrasing** and **summarising** show professionalism and avoid misunderstandings.', 'En France, débattre et contredire en réunion est normal et parfois animé. Au Québec, le style est souvent plus consensuel et informel. Dans les deux cas, **reformuler** et **résumer** montrent votre professionnalisme et évitent les malentendus.'),
      },
    ],
    notes: {
      points: [
        b('Take the floor: si je peux me permettre…, j’aimerais ajouter…', 'Prendre la parole : si je peux me permettre…, j’aimerais ajouter…'),
        b('Disagree diplomatically: je vois les choses un peu différemment, je me demande si…', 'Objecter avec diplomatie : je vois les choses un peu différemment, je me demande si…'),
        b('Rephrase (si je comprends bien…) and summarise (pour résumer…).', 'Reformuler (si je comprends bien…) et résumer (pour résumer…).'),
      ],
      vocab: [['prendre la parole', b('to take the floor', 'commencer à parler')], ['une piste', b('a lead, an option', 'une idée à explorer')], ['reporter', b('to postpone', 'remettre à plus tard')], ['consensuel', b('consensual', 'qui recherche l’accord')]],
    },
  },
];

export default lessons;
