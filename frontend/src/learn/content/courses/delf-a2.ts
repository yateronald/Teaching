// DELF A2: the four papers, with practice in the format of the exam.
import { b, type Lesson } from '../../types';
import { card, listen, pick, read } from '../kit';

const lessons: Lesson[] = [
  {
    id: 'delf-a2-1',
    slug: { en: 'listening-and-reading-papers', fr: 'comprehension-orale-et-ecrite' },
    title: b('The listening and reading papers', 'La compréhension de l’oral et des écrits'),
    summary: b('What the DELF A2 tests, how it is marked, and practice on announcements, messages and short texts.', 'Ce qu’évalue le DELF A2, son barème, et un entraînement sur des annonces, des messages et de courts textes.'),
    objectives: [b('Know the four papers and the pass mark', 'Connaître les quatre épreuves et la note de réussite'), b('Understand short announcements and messages', 'Comprendre des annonces et des messages courts'), b('Read everyday documents', 'Lire des documents du quotidien')],
    minutes: 14,
    steps: [
      card(b('The DELF A2 in one table', 'Le DELF A2 en un tableau'), b('Four papers, each marked out of 25. You pass with **50 out of 100**, and at least **5 out of 25** in every paper. The diploma is valid **for life**.', 'Quatre épreuves, chacune notée sur 25. Vous réussissez avec **50 sur 100**, et au moins **5 sur 25** à chaque épreuve. Le diplôme est valable **à vie**.'), {
        variant: 'exam',
        table: {
          head: [b('Paper', 'Épreuve'), b('Duration', 'Durée'), b('Marks', 'Note')],
          rows: [
            [b('Listening', 'Compréhension de l’oral'), b('about 25 min', 'environ 25 min'), '/25'],
            [b('Reading', 'Compréhension des écrits'), '30 min', '/25'],
            [b('Writing', 'Production écrite'), '45 min', '/25'],
            [b('Speaking', 'Production orale'), b('6–8 min (10 min preparation)', '6 à 8 min (10 min de préparation)'), '/25'],
          ],
        },
      }),
      pick('A2', b('What is the pass mark of the DELF A2?', 'Quelle est la note de réussite au DELF A2 ?'), [b('50/100, with at least 5/25 in each paper', '50/100, avec au moins 5/25 à chaque épreuve'), b('60/100 in total', '60/100 au total'), b('10/25 in each paper', '10/25 à chaque épreuve'), b('75/100 in total', '75/100 au total')]),
      card(b('Listening: what to expect', 'L’oral : à quoi s’attendre'), b('Short recordings from daily life, each **heard twice**: public announcements, voicemail messages, radio extracts and conversations. Read the questions during the pause before the first listening.', 'De courts enregistrements de la vie quotidienne, chacun **entendu deux fois** : annonces publiques, messages sur répondeur, extraits de radio et conversations. Lisez les questions pendant la pause avant la première écoute.'), { variant: 'tip' }),
      listen('A2', 'f2', 'Mesdames et messieurs, le train numéro huit cent quinze à destination de Lyon partira avec vingt minutes de retard. Départ voie cinq.', 'Que se passe-t-il ?', ['Le train a vingt minutes de retard', 'Le train est annulé', 'Le train part de la voie quinze', 'Le train arrive de Lyon']),
      listen('A2', 'm', 'Salut Camille, c’est Théo. Pour la fête de samedi, tu peux apporter des boissons ? Moi, je m’occupe du gâteau. Rappelle-moi !', 'Que doit apporter Camille ?', ['Des boissons', 'Un gâteau', 'De la musique', 'Des chaises']),
      read('A2', { title: b('Notice', 'Affiche'), text: 'Médiathèque municipale\nInscription gratuite pour les habitants de la ville, sur présentation d’un justificatif de domicile.\nPrêt : 5 livres et 2 films pour 3 semaines.' }, 'Que faut-il pour s’inscrire gratuitement ?', ['Habiter la ville et le prouver', 'Payer cinq euros', 'Avoir moins de 18 ans', 'Emprunter cinq livres']),
      read('A2', { title: b('Email', 'Courriel'), text: 'Bonjour Léa,\nMerci pour ton invitation ! Malheureusement, je travaille samedi soir. Est-ce qu’on peut se voir dimanche midi à la place ? Je t’invite au restaurant.\nBises,\nNora' }, 'Que propose Nora ?', ['De se voir dimanche midi', 'De venir samedi soir', 'D’annuler la rencontre', 'De travailler ensemble']),
      { kind: 'match', prompt: b('Match each document with where you find it.', 'Associez chaque document à son lieu.'), pairs: [['une annonce de retard', b('at the station', 'à la gare')], ['un message sur répondeur', b('on a phone', 'sur un téléphone')], ['une affiche d’horaires', b('on a shop door', 'sur la porte d’un magasin')], ['une petite annonce', b('on a website', 'sur un site internet')]] },
    ],
    notes: {
      points: [
        b('Four papers out of 25. Pass: 50/100, minimum 5/25 per paper. Valid for life.', 'Quatre épreuves sur 25. Réussite : 50/100, minimum 5/25 par épreuve. Valable à vie.'),
        b('Listening: daily-life recordings, each heard twice.', 'Oral : enregistrements du quotidien, chacun entendu deux fois.'),
        b('Reading: signs, messages, emails, short articles. Find the key information.', 'Écrits : panneaux, messages, courriels, courts articles. Trouvez l’information clé.'),
        b('Read the questions before the recording starts.', 'Lisez les questions avant le début de l’enregistrement.'),
      ],
      vocab: [['le retard', b('delay', 'arrivée après l’heure')], ['le répondeur', b('voicemail', 'messagerie du téléphone')], ['le justificatif de domicile', b('proof of address', 'document qui prouve l’adresse')], ['le prêt', b('loan', 'ce qu’on emprunte')]],
    },
  },
  {
    id: 'delf-a2-2',
    slug: { en: 'writing-paper', fr: 'production-ecrite' },
    title: b('The writing paper: two short texts', 'La production écrite : deux textes courts'),
    summary: b('Describe an event, then write a message to invite, thank, apologise or ask: at least 60 words each.', 'Décrire un événement, puis écrire un message pour inviter, remercier, s’excuser ou demander : au moins 60 mots chacun.'),
    objectives: [b('Describe an experience in the past', 'Décrire une expérience au passé'), b('Write a message with the right formulas', 'Écrire un message avec les bonnes formules'), b('Reach 60 words with simple connectors', 'Atteindre 60 mots avec des connecteurs simples')],
    minutes: 15,
    steps: [
      card(b('Two exercises, 45 minutes', 'Deux exercices, 45 minutes'), b('**Exercise 1**: describe an event or a personal experience (a trip, a party, a weekend): **at least 60 words**, in the past. **Exercise 2**: write to invite, thank, apologise, ask, inform or congratulate: **at least 60 words**. The examiners count the words: below 60, you lose marks.', '**Exercice 1** : décrire un événement ou une expérience personnelle (un voyage, une fête, un week-end) : **au moins 60 mots**, au passé. **Exercice 2** : écrire pour inviter, remercier, s’excuser, demander, informer ou féliciter : **au moins 60 mots**. Les correcteurs comptent les mots : en dessous de 60, vous perdez des points.'), { variant: 'exam' }),
      card(b('The A2 toolbox', 'La boîte à outils A2'), b('**Passé composé** for what happened (je suis allé, j’ai visité), **imparfait** for descriptions (il faisait beau, c’était super). Connectors: **d’abord, ensuite, après, enfin, mais, parce que**. Feelings: **j’ai adoré, c’était magnifique, j’étais fatigué(e)**.', '**Passé composé** pour les actions (je suis allé, j’ai visité), **imparfait** pour les descriptions (il faisait beau, c’était super). Connecteurs : **d’abord, ensuite, après, enfin, mais, parce que**. Sentiments : **j’ai adoré, c’était magnifique, j’étais fatigué(e)**.'), {
        examples: [{ fr: 'Samedi dernier, je suis allé à Québec avec des amis.', tr: 'Last Saturday, I went to Québec City with friends.' }, { fr: 'Il faisait beau et c’était magnifique.', tr: 'The weather was nice and it was magnificent.' }],
      }),
      pick('A2', b('Choose the right form.', 'Choisissez la bonne forme.'), ['sommes allés', 'avons allé', 'sommes allé', 'allons'], { fr: 'Dimanche, nous ___ au musée.' }),
      pick('A2', b('Which connector introduces a reason?', 'Quel connecteur introduit une raison ?'), ['parce que', 'ensuite', 'mais', 'd’abord']),
      { kind: 'categorize', prompt: b('Which message does each formula belong to?', 'À quel message appartient chaque formule ?'), buckets: [b('Invite', 'Inviter'), b('Thank', 'Remercier'), b('Apologise', 'S’excuser')], items: [{ text: 'Est-ce que tu veux venir… ?', bucket: 0 }, { text: 'Merci beaucoup pour…', bucket: 1 }, { text: 'Je suis vraiment désolé…', bucket: 2 }, { text: 'Je t’invite à…', bucket: 0 }, { text: 'C’est très gentil de ta part.', bucket: 1 }, { text: 'Excuse-moi pour mon retard.', bucket: 2 }] },
      { kind: 'write', prompt: b('Exercise 1: describe an event.', 'Exercice 1 : décrire un événement.'), task: 'Vous avez passé un week-end dans une ville que vous ne connaissiez pas. Vous écrivez à un ami français pour raconter : où vous êtes allé, ce que vous avez fait, vos impressions. (60 à 80 mots)', min: 60, max: 80, checklist: [b('Passé composé and imparfait', 'Passé composé et imparfait'), b('Where, what, impressions', 'Où, quoi, impressions'), b('At least three connectors', 'Au moins trois connecteurs'), b('A greeting and a closing', 'Une salutation et une formule de fin')], phrases: ['Le week-end dernier,', 'D’abord, … Ensuite, …', 'C’était…', 'J’ai adoré…', 'À bientôt,'], model: 'Salut Julien,\nLe week-end dernier, je suis allé à Québec avec ma sœur. D’abord, nous avons visité la vieille ville : c’était magnifique ! Ensuite, nous avons mangé dans un petit restaurant près du fleuve. Il faisait froid, mais il y avait du soleil. Le soir, nous avons écouté un concert dans un café. J’ai adoré cette ville, parce que les gens sont très gentils. Et toi, ton week-end ?\nÀ bientôt,\nSami' },
      { kind: 'write', prompt: b('Exercise 2: reply to an invitation.', 'Exercice 2 : répondre à une invitation.'), task: 'Votre amie Chloé vous invite à son anniversaire samedi. Vous ne pouvez pas venir. Répondez-lui : remerciez-la, excusez-vous, expliquez pourquoi et proposez une autre rencontre. (60 à 80 mots)', min: 60, max: 80, checklist: [b('Thank her', 'La remercier'), b('Apologise and explain why', 'S’excuser et expliquer pourquoi'), b('Suggest another meeting', 'Proposer une autre rencontre'), b('Friendly register (tu)', 'Registre amical (tu)')], phrases: ['Merci beaucoup pour ton invitation !', 'Malheureusement,', 'parce que', 'Est-ce qu’on peut… ?', 'Bises,'], model: 'Salut Chloé,\nMerci beaucoup pour ton invitation, c’est très gentil ! Malheureusement, je ne peux pas venir samedi, parce que je travaille au restaurant jusqu’à minuit. Je suis vraiment désolée. Est-ce qu’on peut se voir dimanche après-midi ? Je t’invite au café près de chez toi, et j’apporte ton cadeau ! Je te souhaite un très bon anniversaire et une belle fête avec tes amis.\nBises,\nMaya' },
    ],
    notes: {
      points: [
        b('Two texts of at least 60 words each, in 45 minutes.', 'Deux textes d’au moins 60 mots chacun, en 45 minutes.'),
        b('Exercise 1: narrate in the past (passé composé + imparfait) with impressions.', 'Exercice 1 : raconter au passé (passé composé + imparfait) avec des impressions.'),
        b('Exercise 2: invite, thank, apologise, ask. Use the right formulas and register.', 'Exercice 2 : inviter, remercier, s’excuser, demander. Employez les bonnes formules et le bon registre.'),
        b('Connectors add words and marks: d’abord, ensuite, mais, parce que, enfin.', 'Les connecteurs ajoutent des mots et des points : d’abord, ensuite, mais, parce que, enfin.'),
      ],
      vocab: [['malheureusement', b('unfortunately', 'par malchance')], ['le fleuve', b('river', 'grand cours d’eau')], ['souhaiter', b('to wish', 'exprimer un vœu')], ['les impressions', b('impressions', 'ce qu’on a ressenti')]],
    },
  },
  {
    id: 'delf-a2-3',
    slug: { en: 'speaking-paper', fr: 'production-orale' },
    title: b('The speaking paper: three parts', 'La production orale : trois parties'),
    summary: b('The guided interview, the monologue on a topic and the role-play, with model answers to repeat.', 'L’entretien dirigé, le monologue suivi et l’exercice en interaction, avec des réponses modèles à répéter.'),
    objectives: [b('Present yourself in the guided interview', 'Vous présenter à l’entretien dirigé'), b('Speak for two minutes on a familiar topic', 'Parler deux minutes d’un sujet familier'), b('Handle an everyday role-play', 'Réussir un jeu de rôle du quotidien')],
    minutes: 14,
    steps: [
      card(b('Three parts, six to eight minutes', 'Trois parties, six à huit minutes'), b('**1. Entretien dirigé** (about 1 min 30): you introduce yourself and answer questions. **2. Monologue suivi** (about 2 min): you talk about a familiar topic drawn at random. **3. Exercice en interaction** (3–4 min): a role-play with the examiner (buy, organise, ask for information). You have **10 minutes** to prepare parts 2 and 3.', '**1. Entretien dirigé** (environ 1 min 30) : vous vous présentez et répondez à des questions. **2. Monologue suivi** (environ 2 min) : vous parlez d’un sujet familier tiré au sort. **3. Exercice en interaction** (3 à 4 min) : un jeu de rôle avec l’examinateur (acheter, organiser, se renseigner). Vous avez **10 minutes** pour préparer les parties 2 et 3.'), { variant: 'exam' }),
      { kind: 'speak', prompt: b('Part 1: introduce yourself aloud.', 'Partie 1 : présentez-vous à voix haute.'), text: 'Je m’appelle Maya, j’ai vingt-huit ans. Je viens du Liban et j’habite à Montréal depuis deux ans.', tr: 'My name is Maya, I am twenty-eight. I come from Lebanon and I have lived in Montréal for two years.' },
      pick('A2', b('The examiner asks: “Qu’est-ce que vous faites le week-end ?” Best answer:', 'L’examinateur demande : « Qu’est-ce que vous faites le week-end ? » Meilleure réponse :'), ['Le samedi, je fais du sport, et le dimanche, je vois mes amis ou je cuisine.', 'Le week-end.', 'Oui, j’aime.', 'Samedi dimanche.'], { explain: b('Give two or three pieces of information: never one word.', 'Donnez deux ou trois informations : jamais un seul mot.') }),
      card(b('Part 2: a plan for the monologue', 'Partie 2 : un plan pour le monologue'), b('For any topic (your town, your job, your last holiday, your family): **1.** say what you will talk about, **2.** describe (who, where, when), **3.** give two details, **4.** give your opinion (**J’aime… parce que…**). Four steps fill two minutes.', 'Pour tout sujet (votre ville, votre travail, vos dernières vacances, votre famille) : **1.** annoncez le sujet, **2.** décrivez (qui, où, quand), **3.** donnez deux détails, **4.** donnez votre avis (**J’aime… parce que…**). Quatre étapes remplissent deux minutes.'), { variant: 'tip' }),
      { kind: 'order', prompt: b('Put the monologue in order (start to finish).', 'Remettez le monologue dans l’ordre.'), words: ['Je vais parler de ma ville.', 'Elle est petite et calme.', 'Il y a un grand parc.', 'Je l’aime beaucoup !'], tr: 'I am going to talk about my town. It is small and quiet. There is a big park. I like it a lot!' },
      { kind: 'speak', prompt: b('Part 2: say this monologue aloud.', 'Partie 2 : dites ce monologue à voix haute.'), text: 'Je vais parler de mon travail. Je suis vendeuse dans une librairie. J’aime mon travail parce que je rencontre beaucoup de gens.', tr: 'I am going to talk about my job. I am a shop assistant in a bookshop. I like my job because I meet lots of people.' },
      { kind: 'dialogue', title: b('Part 3: buying a train ticket', 'Partie 3 : acheter un billet de train'), scene: b('You are the customer. Choose your best replies.', 'Vous êtes le client. Choisissez vos meilleures répliques.'), speakers: [{ name: 'Examinatrice', voice: 'f2', side: 'l' }, { name: 'Vous', voice: 'm', side: 'r' }], lines: [
        { s: 0, fr: 'Bonjour, je peux vous aider ?', tr: 'Hello, can I help you?' },
        { s: 1, choose: { options: ['Bonjour, madame. Je voudrais un billet pour Marseille, pour demain matin, s’il vous plaît.', 'Marseille.', 'Je veux partir.'], answer: 0 } },
        { s: 0, fr: 'Il y a un train à huit heures et un autre à onze heures.', tr: 'There is a train at eight and another at eleven.' },
        { s: 1, choose: { options: ['Je préfère celui de huit heures. Combien coûte le billet ?', 'Oui.', 'Huit heures onze heures.'], answer: 0 } },
        { s: 0, fr: 'Quarante-cinq euros en seconde classe.', tr: 'Forty-five euros in second class.' },
        { s: 1, choose: { options: ['Très bien, je le prends. Je peux payer par carte ?', 'C’est cher, non merci, au revoir.', 'Quarante-cinq.'], answer: 0 } },
      ] },
      pick('A2', b('In the role-play, what do examiners value most?', 'Dans le jeu de rôle, qu’est-ce que les examinateurs valorisent le plus ?'), [b('Polite, complete sentences and real questions', 'Des phrases polies et complètes, et de vraies questions'), b('Speaking very fast', 'Parler très vite'), b('Using difficult words', 'Employer des mots difficiles'), b('Short yes / no answers', 'De courtes réponses par oui ou non')]),
    ],
    notes: {
      points: [
        b('Three parts: guided interview, monologue, role-play. 10 minutes to prepare parts 2 and 3.', 'Trois parties : entretien dirigé, monologue suivi, exercice en interaction. 10 minutes pour préparer les parties 2 et 3.'),
        b('Never answer in one word: add a detail and a reason.', 'Ne répondez jamais en un mot : ajoutez un détail et une raison.'),
        b('Monologue plan: announce, describe, two details, opinion.', 'Plan du monologue : annoncer, décrire, deux détails, avis.'),
        b('Role-play: bonjour, je voudrais…, combien…, merci. Ask questions too.', 'Jeu de rôle : bonjour, je voudrais…, combien…, merci. Posez aussi des questions.'),
      ],
      vocab: [['l’entretien', b('interview', 'échange de questions et réponses')], ['le monologue', b('monologue', 'on parle seul sur un sujet')], ['tirer au sort', b('to draw at random', 'choisir au hasard')], ['la seconde classe', b('second class', 'les places les moins chères')]],
    },
  },
];

export default lessons;
