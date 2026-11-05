// TCF Canada · Expression écrite, A1 → C2. A writing course: each level
// teaches what to write and how, then ends with a timed TCF-type task.
import { b, type Lesson } from '../../types';
import { card, pick } from '../kit';

const lessons: Lesson[] = [
  // ── A1 ──
  {
    id: 'tcf-writing-1',
    level: 'A1',
    slug: { en: 'a1-first-sentences-short-notes', fr: 'a1-premieres-phrases-mots-courts' },
    title: b('A1 · First sentences and short notes', 'A1 · Premières phrases et mots courts'),
    summary: b('Write simple, correct sentences about yourself and leave a short note.', 'Écrire des phrases simples et correctes sur vous-même et laisser un mot court.'),
    objectives: [b('Build a correct sentence: subject + verb + complement', 'Construire une phrase correcte : sujet + verbe + complément'), b('Introduce yourself in writing', 'Vous présenter par écrit'), b('Write a short note with a greeting and a signature', 'Écrire un mot court avec une salutation et une signature')],
    minutes: 15,
    steps: [
      card(b('The basic sentence', 'La phrase de base'), b('A French sentence starts with a **capital letter**, contains a **subject** and a **conjugated verb**, and ends with a **full stop**. Before ? and ! leave a space in French: “Tu viens ?”', 'Une phrase française commence par une **majuscule**, contient un **sujet** et un **verbe conjugué**, et se termine par un **point**. Avant ? et ! on met une espace : « Tu viens ? »'), {
        examples: [
          { fr: 'Je m’appelle Amina.', tr: 'My name is Amina.' },
          { fr: 'J’habite à Toronto avec ma famille.', tr: 'I live in Toronto with my family.' },
          { fr: 'Je suis infirmière.', tr: 'I am a nurse.' },
        ],
      }),
      pick('A1', b('Which sentence is correct?', 'Quelle phrase est correcte ?'), ['J’ai trente ans.', 'Je suis trente ans.', 'J’ai trente années vieux.', 'Je trente ans.'], { explain: b('Age uses **avoir**: j’ai trente ans.', 'L’âge se dit avec **avoir** : j’ai trente ans.') }),
      pick('A1', b('Choose the right word.', 'Choisissez le bon mot.'), ['habite', 'habiter', 'habites', 'habitons'], { fr: 'J’___ à Montréal.' }),
      pick('A1', b('Choose the right word.', 'Choisissez le bon mot.'), ['une', 'un', 'des', 'le'], { fr: 'J’ai ___ sœur et deux frères.' }),
      pick('A1', b('How do you end a note to a friend?', 'Comment terminer un mot à un ami ?'), ['Bisous, Léa', 'Veuillez agréer mes salutations, Léa', 'Monsieur, Léa', 'Cordialement, Madame Léa'], { explain: b('With a friend: Bisous, À plus, À bientôt. Formal endings are for letters to strangers.', 'Entre amis : Bisous, À plus, À bientôt. Les formules soutenues sont pour les inconnus.') }),
      { kind: 'order', prompt: b('Build the sentence.', 'Construisez la phrase.'), words: ['Je', 'travaille', 'dans', 'un', 'hôpital.'], tr: 'I work in a hospital.' },
      { kind: 'fill', prompt: b('Complete the note.', 'Complétez le mot.'), text: 'Salut Paul, je suis ___ supermarché. Je reviens à 18 h. Nadia', answers: [['au']], choices: [['au', 'à la', 'en']], explain: b('à + le = **au** (le supermarché).', 'à + le = **au** (le supermarché).') },
      card(b('A note in three lines', 'Un mot en trois lignes'), b('**Greeting** (Salut / Bonjour + name) → **message** (where you are, what to do, when) → **signature** (À plus, Bisous + name).', '**Salutation** (Salut / Bonjour + prénom) → **message** (où vous êtes, quoi faire, quand) → **signature** (À plus, Bisous + prénom).'), { variant: 'tip' }),
      { kind: 'write', prompt: b('Introduce yourself to a new neighbour.', 'Présentez-vous à un nouveau voisin.'), task: 'Vous venez d’arriver dans un immeuble. Écrivez un mot à votre voisin pour vous présenter : votre nom, votre pays, votre travail, votre famille. (30 à 50 mots)', min: 30, max: 50, checklist: [b('A greeting and a signature', 'Une salutation et une signature'), b('Name, country, job, family', 'Nom, pays, travail, famille'), b('Capital letters and full stops', 'Majuscules et points')], phrases: ['Je m’appelle…', 'Je viens de…', 'Je suis…', 'J’habite au…'], model: 'Bonjour,\nJe m’appelle Carlos. Je viens du Mexique et je suis cuisinier. J’habite au troisième étage avec ma femme et ma fille. Nous sommes arrivés lundi. Au plaisir de vous rencontrer !\nCarlos' },
    ],
    notes: {
      points: [
        b('A sentence = capital letter + subject + conjugated verb + full stop.', 'Une phrase = majuscule + sujet + verbe conjugué + point.'),
        b('Age with avoir: **j’ai trente ans**. Job without article: **je suis infirmière**.', 'L’âge avec avoir : **j’ai trente ans**. Le métier sans article : **je suis infirmière**.'),
        b('à + le = **au**, à + les = **aux**: au supermarché, aux États-Unis.', 'à + le = **au**, à + les = **aux** : au supermarché, aux États-Unis.'),
        b('A note: greeting → message → signature.', 'Un mot : salutation → message → signature.'),
      ],
      vocab: [['le voisin / la voisine', b('neighbour', 'personne qui habite à côté')], ['l’étage (m.)', b('floor', 'niveau d’un immeuble')], ['revenir', b('to come back', 'rentrer')], ['au plaisir', b('hope to see you', 'à bientôt (poli)')]],
    },
  },

  // ── A2 ──
  {
    id: 'tcf-writing-2',
    level: 'A2',
    slug: { en: 'a2-messages-invite-reply-ask', fr: 'a2-messages-inviter-repondre-demander' },
    title: b('A2 · Messages: invite, reply, ask', 'A2 · Messages : inviter, répondre, demander'),
    summary: b('Write the short message of task 1: invite, accept or refuse, ask for information, with the right register.', 'Écrire le message court de la tâche 1 : inviter, accepter ou refuser, demander une information, dans le bon registre.'),
    objectives: [b('Choose tu or vous and the right opening and closing', 'Choisir tu ou vous et les bonnes formules d’ouverture et de clôture'), b('Invite, accept and refuse politely', 'Inviter, accepter et refuser poliment'), b('Write a 60–80 word message with all the information asked', 'Écrire un message de 60 à 80 mots avec toutes les informations demandées')],
    minutes: 16,
    steps: [
      card(b('Task 1 of the TCF', 'La tâche 1 du TCF'), b('Task 1 asks for a **message** (60 to 120 words) to a friend, a colleague or a service: invite, inform, ask. The task lists points to cover: **every point is graded**. Forgetting one costs more than a small grammar mistake.', 'La tâche 1 demande un **message** (60 à 120 mots) à un ami, un collègue ou un service : inviter, informer, demander. La consigne liste des points à traiter : **chaque point est noté**. En oublier un coûte plus cher qu’une petite faute.'), { variant: 'exam' }),
      card(b('Register: tu or vous', 'Le registre : tu ou vous'), b('To a friend: **Salut / Coucou**, **tu**, **Bises / À bientôt**. To a stranger or an office: **Bonjour Madame / Monsieur**, **vous**, **Cordialement / Bien à vous**. Never mix the two.', 'À un ami : **Salut / Coucou**, **tu**, **Bises / À bientôt**. À un inconnu ou un service : **Bonjour Madame / Monsieur**, **vous**, **Cordialement / Bien à vous**. Ne mélangez jamais les deux.')),
      { kind: 'categorize', prompt: b('Friend or formal message?', 'Message amical ou formel ?'), buckets: [b('To a friend', 'À un ami'), b('Formal', 'Formel')], items: [{ text: 'Coucou !', bucket: 0 }, { text: 'Cordialement', bucket: 1 }, { text: 'Tu es libre samedi ?', bucket: 0 }, { text: 'Pourriez-vous me dire…', bucket: 1 }, { text: 'Grosses bises', bucket: 0 }, { text: 'Madame, Monsieur,', bucket: 1 }] },
      pick('A2', b('Which sentence invites a friend?', 'Quelle phrase invite un ami ?'), ['Ça te dirait de venir dîner samedi soir ?', 'Je vous prie de venir samedi.', 'Tu viens pas samedi.', 'Samedi dîner venir ?']),
      pick('A2', b('Which sentence refuses politely?', 'Quelle phrase refuse poliment ?'), ['Merci beaucoup, mais je ne suis pas libre ce jour-là.', 'Non, je ne veux pas.', 'C’est nul, je ne viens pas.', 'Je refuse votre invitation.']),
      pick('A2', b('Choose the right word.', 'Choisissez le bon mot.'), ['Pourriez-vous', 'Peux-tu', 'Tu peux', 'Pouvez-tu'], { fr: 'Bonjour Madame, ___ m’envoyer les horaires du cours ?' }),
      pick('A2', b('Choose the right word.', 'Choisissez le bon mot.'), ['vais', 'vas', 'va', 'aller'], { fr: 'Samedi, je ___ fêter mon anniversaire au parc.', explain: b('Futur proche: aller (conjugated) + infinitive: je vais fêter.', 'Futur proche : aller conjugué + infinitif : je vais fêter.') }),
      { kind: 'fill', prompt: b('Complete the invitation.', 'Complétez l’invitation.'), text: 'Rendez-vous ___ moi à 19 h. Apporte ___ boisson si tu veux !', answers: [['chez'], ['une']], choices: [['chez', 'à', 'en'], ['une', 'la', 'de']] },
      { kind: 'write', prompt: b('TCF task 1: an invitation.', 'Tâche 1 du TCF : une invitation.'), task: 'Vous organisez un pique-nique pour votre anniversaire. Écrivez un message à vos amis : dites où et quand a lieu le pique-nique, ce que chacun doit apporter et comment répondre. (60 à 80 mots)', min: 60, max: 80, checklist: [b('Place, day and time', 'Lieu, jour et heure'), b('What to bring', 'Ce qu’il faut apporter'), b('How to reply', 'Comment répondre'), b('Friendly register throughout (tu)', 'Registre amical du début à la fin (tu)')], phrases: ['Ça vous dirait de…', 'Rendez-vous à…', 'N’oubliez pas d’apporter…', 'Dites-moi avant…'], model: 'Salut tout le monde !\nPour mon anniversaire, j’organise un pique-nique au parc Jarry samedi prochain, à partir de midi. On se retrouve près de l’étang. Chacun apporte quelque chose : un plat, des boissons ou un dessert. Moi, je m’occupe du gâteau ! S’il pleut, on ira chez moi. Dites-moi avant jeudi si vous venez, par message ou par téléphone.\nÀ samedi !\nInès' },
    ],
    notes: {
      points: [
        b('Task 1: a 60–120 word message; every point of the task is graded.', 'Tâche 1 : un message de 60 à 120 mots ; chaque point de la consigne est noté.'),
        b('Friend: Salut, tu, Bises. Formal: Bonjour Madame, vous, Cordialement. Never mix.', 'Ami : Salut, tu, Bises. Formel : Bonjour Madame, vous, Cordialement. Ne jamais mélanger.'),
        b('Invite: **Ça te dirait de…?** Refuse: **Merci, mais je ne suis pas libre…**', 'Inviter : **Ça te dirait de… ?** Refuser : **Merci, mais je ne suis pas libre…**'),
        b('Polite request: **Pourriez-vous…?** (conditional).', 'Demande polie : **Pourriez-vous… ?** (conditionnel).'),
      ],
      vocab: [['le pique-nique', b('picnic', 'repas dehors')], ['s’occuper de', b('to take care of', 'se charger de')], ['avoir lieu', b('to take place', 'se passer')], ['être libre', b('to be free', 'disponible')], ['Cordialement', b('Kind regards', 'formule de politesse')]],
    },
  },

  // ── B1 ──
  {
    id: 'tcf-writing-3',
    level: 'B1',
    slug: { en: 'b1-tell-a-story-link-ideas', fr: 'b1-raconter-relier-ses-idees' },
    title: b('B1 · Tell a story and link your ideas', 'B1 · Raconter et relier ses idées'),
    summary: b('Narrate an experience in the past with the passé composé and the imparfait, and organise it with time connectors.', 'Raconter une expérience au passé avec le passé composé et l’imparfait, et l’organiser avec des connecteurs de temps.'),
    objectives: [b('Use the passé composé for events and the imparfait for the setting', 'Employer le passé composé pour les événements et l’imparfait pour le décor'), b('Organise a story with time connectors', 'Organiser un récit avec des connecteurs de temps'), b('Express feelings and a short opinion', 'Exprimer des sentiments et une courte opinion')],
    minutes: 16,
    steps: [
      card(b('Two past tenses, two roles', 'Deux temps du passé, deux rôles'), b('**Imparfait** = the setting, descriptions, habits (il faisait beau, j’étais fatigué). **Passé composé** = the events that move the story forward (soudain, j’ai entendu un bruit). A B1 text that mixes them well immediately sounds more natural.', '**Imparfait** = le décor, les descriptions, les habitudes (il faisait beau, j’étais fatigué). **Passé composé** = les événements qui font avancer l’histoire (soudain, j’ai entendu un bruit). Un texte B1 qui les combine bien paraît tout de suite plus naturel.'), {
        examples: [
          { fr: 'Il pleuvait et je rentrais du travail quand j’ai vu l’accident.', tr: 'It was raining and I was coming home from work when I saw the accident.' },
          { fr: 'Nous étions en vacances quand nous avons rencontré nos voisins.', tr: 'We were on holiday when we met our neighbours.' },
        ],
      }),
      pick('B1', b('Choose the right tense.', 'Choisissez le bon temps.'), ['faisait', 'a fait', 'fera', 'fait'], { fr: 'Ce jour-là, il ___ très froid à Québec.', explain: b('Weather in the background: imparfait.', 'La météo, c’est le décor : imparfait.') }),
      pick('B1', b('Choose the right tense.', 'Choisissez le bon temps.'), ['ai reçu', 'recevais', 'reçois', 'recevrai'], { fr: 'Je dormais quand j’___ ton message.', explain: b('A sudden event interrupts the action: passé composé.', 'Un événement soudain interrompt l’action : passé composé.') }),
      pick('B1', b('Which connector introduces the end of a story?', 'Quel connecteur introduit la fin d’un récit ?'), ['Finalement', 'D’abord', 'Ensuite', 'Soudain']),
      pick('B1', b('Which sentence expresses a feeling correctly?', 'Quelle phrase exprime correctement un sentiment ?'), ['J’étais vraiment ému de revoir mes parents.', 'J’ai été vraiment émotion de revoir mes parents.', 'Je suis ému revoir mes parents.', 'J’étais émouvoir mes parents.']),
      { kind: 'order', prompt: b('Put the story in order.', 'Remettez le récit dans l’ordre.'), words: ['D’abord,', 'nous', 'avons', 'visité', 'le', 'musée,', 'ensuite', 'nous', 'avons', 'dîné.'], tr: 'First we visited the museum, then we had dinner.' },
      card(b('The story skeleton', 'Le squelette du récit'), b('**D’abord / Au début** (setting) → **Ensuite / Puis / Après** (events) → **Soudain / Tout à coup** (the key moment) → **Finalement / Au final** (the outcome) → a sentence of **feeling or opinion**.', '**D’abord / Au début** (décor) → **Ensuite / Puis / Après** (événements) → **Soudain / Tout à coup** (le moment clé) → **Finalement / Au final** (le résultat) → une phrase de **sentiment ou d’avis**.'), { variant: 'tip' }),
      { kind: 'fill', prompt: b('Complete with imparfait or passé composé.', 'Complétez avec l’imparfait ou le passé composé.'), text: 'Quand je suis arrivé au Canada, je ne ___ personne. Mais très vite, j’___ des amis au travail.', answers: [['connaissais'], ['ai rencontré', 'ai trouvé', 'ai eu', 'ai fait']], hint: b('connaître (imparfait), rencontrer (passé composé)', 'connaître (imparfait), rencontrer (passé composé)') },
      { kind: 'write', prompt: b('Tell a memorable day.', 'Racontez une journée marquante.'), task: 'Sur un forum, des internautes racontent leur première journée dans un nouveau pays ou une nouvelle ville. Racontez la vôtre : ce qui s’est passé, ce que vous avez ressenti. (90 à 120 mots)', min: 90, max: 120, checklist: [b('Imparfait for the setting, passé composé for events', 'Imparfait pour le décor, passé composé pour les événements'), b('At least four time connectors', 'Au moins quatre connecteurs de temps'), b('A feeling or opinion at the end', 'Un sentiment ou un avis à la fin')], phrases: ['Je me souviens de…', 'Au début,', 'Tout à coup,', 'Finalement,', 'Je me sentais…'], model: 'Je me souviens très bien de ma première journée à Montréal. C’était en janvier et il faisait moins vingt degrés. Je n’avais pas de bottes d’hiver ! D’abord, je suis allé à la banque pour ouvrir un compte. Ensuite, j’ai cherché un magasin de vêtements, mais je me suis perdu dans le métro. Tout à coup, une dame m’a demandé si j’avais besoin d’aide. Elle m’a accompagné jusqu’au magasin et m’a même donné l’adresse d’un bon restaurant. Finalement, cette journée difficile s’est bien terminée. Je me sentais fatigué, mais rassuré : les gens étaient vraiment accueillants.' },
    ],
    notes: {
      points: [
        b('Imparfait: setting, description, habit. Passé composé: events, actions that move the story.', 'Imparfait : décor, description, habitude. Passé composé : événements, actions qui font avancer l’histoire.'),
        b('“Je dormais quand j’ai reçu…”: imparfait (ongoing) + passé composé (interruption).', '« Je dormais quand j’ai reçu… » : imparfait (en cours) + passé composé (interruption).'),
        b('Story skeleton: D’abord → Ensuite → Soudain → Finalement → feeling.', 'Squelette : D’abord → Ensuite → Soudain → Finalement → sentiment.'),
        b('Feelings: j’étais ému / soulagé / déçu / fier; je me sentais…', 'Sentiments : j’étais ému / soulagé / déçu / fier ; je me sentais…'),
      ],
      vocab: [['ému', b('moved (emotionally)', 'touché')], ['soulagé', b('relieved', 'libéré d’une inquiétude')], ['se perdre', b('to get lost', 'ne plus trouver son chemin')], ['accueillant', b('welcoming', 'qui reçoit bien')], ['tout à coup', b('suddenly', 'soudain')]],
    },
  },

  // ── B2 ──
  {
    id: 'tcf-writing-4',
    level: 'B2',
    slug: { en: 'b2-structured-article', fr: 'b2-article-structure' },
    title: b('B2 · Write a structured article', 'B2 · Rédiger un article structuré'),
    summary: b('Write the article of task 2: an introduction, organised paragraphs, logical connectors and a conclusion.', 'Rédiger l’article de la tâche 2 : une introduction, des paragraphes organisés, des connecteurs logiques et une conclusion.'),
    objectives: [b('Plan a text in three parts', 'Planifier un texte en trois parties'), b('Use logical connectors (cause, consequence, opposition)', 'Employer des connecteurs logiques (cause, conséquence, opposition)'), b('Write a 120–150 word article for task 2', 'Rédiger un article de 120 à 150 mots pour la tâche 2')],
    minutes: 16,
    steps: [
      card(b('Task 2: the article', 'La tâche 2 : l’article'), b('Task 2 (120 to 150 words) asks you to **describe, tell and comment** for readers: a blog post, an article for a newsletter, a testimony. Graders look for a **clear structure**, varied vocabulary and logical links, more than for long sentences.', 'La tâche 2 (120 à 150 mots) demande de **décrire, raconter et commenter** pour des lecteurs : un billet de blog, un article pour un bulletin, un témoignage. Les correcteurs cherchent une **structure claire**, un vocabulaire varié et des liens logiques, plus que des phrases longues.'), { variant: 'exam' }),
      card(b('The three-part plan', 'Le plan en trois parties'), b('**Introduction** (1–2 sentences): the topic and why it matters. **Development** (2 paragraphs): facts, experience, examples, each paragraph = one idea. **Conclusion** (1–2 sentences): your opinion or advice.', '**Introduction** (1 à 2 phrases) : le sujet et son intérêt. **Développement** (2 paragraphes) : faits, expérience, exemples ; un paragraphe = une idée. **Conclusion** (1 à 2 phrases) : votre avis ou un conseil.'), { variant: 'tip' }),
      pick('B2', b('Which sentence is the best introduction for an article on community gardens?', 'Quelle phrase est la meilleure introduction pour un article sur les jardins communautaires ?'), ['Depuis quelques années, les jardins communautaires se multiplient dans nos quartiers : pourquoi un tel succès ?', 'Les tomates sont rouges.', 'Je vais parler des jardins.', 'Voici mon texte sur le sujet demandé.']),
      pick('B2', b('Choose the connector.', 'Choisissez le connecteur.'), ['si bien que', 'bien que', 'pourtant', 'alors que'], { fr: 'Les loyers ont beaucoup augmenté, ___ de nombreuses familles quittent le centre-ville.' }),
      pick('B2', b('Choose the connector.', 'Choisissez le connecteur.'), ['En revanche', 'C’est pourquoi', 'Ainsi', 'De plus'], { fr: 'Le vélo est idéal l’été. ___, l’hiver, il devient plus dangereux.' }),
      pick('B2', b('Which sentence avoids repetition best?', 'Quelle phrase évite le mieux la répétition ?'), ['Ce projet a séduit les habitants, qui y voient une façon de se rencontrer.', 'Le projet a séduit les habitants et les habitants voient le projet comme une façon de se rencontrer.', 'Le projet, le projet a séduit les habitants.', 'Les habitants aiment le projet, le projet est aimé.']),
      { kind: 'categorize', prompt: b('Which part of the article?', 'Quelle partie de l’article ?'), buckets: [b('Introduction', 'Introduction'), b('Development', 'Développement'), b('Conclusion', 'Conclusion')], items: [{ text: 'De plus en plus de familles adoptent un chien. Mais est-ce toujours une bonne idée ?', bucket: 0 }, { text: 'D’une part, un animal apporte de la compagnie et encourage à sortir.', bucket: 1 }, { text: 'D’autre part, il demande du temps et coûte cher.', bucket: 1 }, { text: 'En somme, adopter un animal est une belle aventure, à condition d’y être préparé.', bucket: 2 }] },
      { kind: 'fill', prompt: b('Complete with connectors.', 'Complétez avec des connecteurs.'), text: '___ part, le télétravail fait gagner du temps ; ___ part, il isole certains salariés.', answers: [['D’une'], ['d’autre']], choices: [['D’une', 'Une', 'De'], ['d’autre', 'autre', 'l’autre']] },
      { kind: 'write', prompt: b('TCF task 2: an article.', 'Tâche 2 du TCF : un article.'), task: 'Le bulletin de votre quartier publie des témoignages sur le thème « Ma façon de me déplacer en ville ». Écrivez un article : présentez votre moyen de transport, ses avantages et ses inconvénients, et donnez un conseil aux lecteurs. (120 à 150 mots)', min: 120, max: 150, checklist: [b('Introduction, two paragraphs, conclusion', 'Introduction, deux paragraphes, conclusion'), b('Advantages AND disadvantages', 'Avantages ET inconvénients'), b('At least four logical connectors', 'Au moins quatre connecteurs logiques'), b('A piece of advice at the end', 'Un conseil à la fin')], phrases: ['D’une part… d’autre part…', 'En revanche,', 'C’est pourquoi', 'En somme,', 'Je vous conseille de…'], model: 'Depuis trois ans, je me déplace presque uniquement à vélo, même en hiver. Voici pourquoi.\n\nD’une part, le vélo me fait gagner un temps précieux : je ne cherche jamais de place de stationnement et j’évite les bouchons du matin. De plus, il me permet de faire du sport sans y penser, ce qui est excellent pour le moral.\n\nEn revanche, tout n’est pas parfait. Les jours de tempête, rouler devient dangereux, c’est pourquoi je prends alors le métro. Il faut également investir dans un bon équipement : des pneus d’hiver, des lumières et des vêtements chauds.\n\nEn somme, le vélo a changé ma vie en ville. Si vous hésitez, je vous conseille de commencer au printemps, sur de courts trajets : vous ne pourrez plus vous en passer !' },
    ],
    notes: {
      points: [
        b('Task 2: 120–150 words to describe, tell and comment for readers.', 'Tâche 2 : 120 à 150 mots pour décrire, raconter et commenter pour des lecteurs.'),
        b('Plan: introduction (topic) → 2 paragraphs (one idea each) → conclusion (opinion / advice).', 'Plan : introduction (sujet) → 2 paragraphes (une idée chacun) → conclusion (avis / conseil).'),
        b('Connectors: d’une part… d’autre part, de plus, en revanche, c’est pourquoi, si bien que, en somme.', 'Connecteurs : d’une part… d’autre part, de plus, en revanche, c’est pourquoi, si bien que, en somme.'),
        b('Avoid repetition with pronouns (qui, y, le, en) and synonyms.', 'Évitez les répétitions avec les pronoms (qui, y, le, en) et des synonymes.'),
      ],
      vocab: [['le bulletin', b('newsletter', 'petit journal')], ['les bouchons (m.)', b('traffic jams', 'embouteillages')], ['se passer de', b('to do without', 'vivre sans')], ['en somme', b('in short', 'pour résumer')], ['séduire', b('to appeal to', 'plaire à')]],
    },
  },

  // ── C1 ──
  {
    id: 'tcf-writing-5',
    level: 'C1',
    slug: { en: 'c1-compare-views-argue-with-nuance', fr: 'c1-comparer-des-points-de-vue-argumenter' },
    title: b('C1 · Compare two views and argue with nuance', 'C1 · Comparer deux points de vue et argumenter avec nuance'),
    summary: b('Write task 3: summarise two opposing documents, compare them and defend a nuanced position.', 'Rédiger la tâche 3 : résumer deux documents opposés, les comparer et défendre une position nuancée.'),
    objectives: [b('Reformulate two opinions without copying', 'Reformuler deux opinions sans recopier'), b('Use concession: certes… mais, bien que + subjunctive', 'Employer la concession : certes… mais, bien que + subjonctif'), b('Write a 120–180 word argued comparison', 'Rédiger une comparaison argumentée de 120 à 180 mots')],
    minutes: 16,
    steps: [
      card(b('Task 3: the argued comparison', 'La tâche 3 : la comparaison argumentée'), b('Task 3 (120 to 180 words) gives two short documents with **opposing opinions**. You must (1) **present** both views in your own words, (2) **compare** them, (3) give **your position**. Copying sentences from the documents is penalised.', 'La tâche 3 (120 à 180 mots) donne deux courts documents aux **opinions opposées**. Vous devez (1) **présenter** les deux points de vue avec vos mots, (2) les **comparer**, (3) donner **votre position**. Recopier les documents est pénalisé.'), { variant: 'exam' }),
      card(b('Concession: the C1 marker', 'La concession : la marque du C1'), b('Admit the other side before answering it: **Certes / Il est vrai que** + point, **mais / toutefois** + your view. **Bien que / Quoique** + subjunctive. **Même si** + indicative. **Il n’en demeure pas moins que** = nevertheless.', 'Reconnaissez l’autre point de vue avant d’y répondre : **Certes / Il est vrai que** + argument, **mais / toutefois** + votre avis. **Bien que / Quoique** + subjonctif. **Même si** + indicatif. **Il n’en demeure pas moins que**.'), {
        examples: [
          { fr: 'Bien que le projet soit coûteux, il me paraît indispensable.', tr: 'Although the project is costly, it seems essential to me.' },
          { fr: 'Certes, les écrans facilitent l’apprentissage ; toutefois, ils ne remplacent pas l’enseignant.', tr: 'Admittedly, screens make learning easier; however, they do not replace the teacher.' },
        ],
      }),
      pick('C1', b('Choose the right form.', 'Choisissez la bonne forme.'), ['soit', 'est', 'sera', 'était'], { fr: 'Bien que cette mesure ___ impopulaire, elle est nécessaire.', explain: b('Bien que + subjunctive: soit.', 'Bien que + subjonctif : soit.') }),
      pick('C1', b('Which sentence reformulates “Les jeunes ne lisent plus” without copying?', 'Quelle phrase reformule « Les jeunes ne lisent plus » sans recopier ?'), ['Selon le premier document, la lecture aurait perdu sa place chez les jeunes.', 'Le document dit que les jeunes ne lisent plus.', 'Les jeunes ne lisent plus, dit le document.', 'Le premier document : « les jeunes ne lisent plus ».']),
      pick('C1', b('Which sentence best compares the two documents?', 'Quelle phrase compare le mieux les deux documents ?'), ['Alors que le premier auteur voit dans le télétravail une liberté, le second y décèle une source d’isolement.', 'Le premier document parle du télétravail. Le deuxième aussi.', 'Les deux documents sont intéressants.', 'Je préfère le document 1.']),
      pick('C1', b('Which phrase introduces a nuanced personal position?', 'Quelle expression introduit une position personnelle nuancée ?'), ['Pour ma part, j’estime que la vérité se situe entre ces deux positions.', 'Moi je pense que c’est bien.', 'Le deuxième a raison et le premier a tort, point.', 'Je ne sais pas.']),
      { kind: 'match', prompt: b('Match each verb with its use when reporting an opinion.', 'Associez chaque verbe à son emploi pour rapporter une opinion.'), pairs: [['soutenir', b('to defend a thesis', 'défendre une thèse')], ['déplorer', b('to regret, criticise', 'regretter, critiquer')], ['nuancer', b('to qualify', 'apporter des réserves')], ['mettre en garde', b('to warn', 'avertir d’un danger')], ['plaider pour', b('to argue for', 'défendre une solution')]] },
      { kind: 'fill', prompt: b('Complete with a concession.', 'Complétez avec une concession.'), text: '___, les voitures électriques polluent moins en ville ; il n’en demeure pas ___ que leurs batteries posent problème.', answers: [['Certes'], ['moins']], choices: [['Certes', 'Donc', 'Car'], ['moins', 'plus', 'pas']] },
      { kind: 'write', prompt: b('TCF task 3: an argued comparison.', 'Tâche 3 du TCF : une comparaison argumentée.'), task: 'Document 1 : « Interdire les téléphones à l’école est indispensable : les élèves n’arrivent plus à se concentrer. »\nDocument 2 : « Le téléphone est un outil pédagogique ; il faut apprendre à s’en servir, pas l’interdire. »\nPrésentez ces deux points de vue, comparez-les, puis donnez votre opinion argumentée. (120 à 180 mots)', min: 120, max: 180, checklist: [b('Both views reformulated, not copied', 'Les deux points de vue reformulés, pas recopiés'), b('An explicit comparison (alors que, tandis que)', 'Une comparaison explicite (alors que, tandis que)'), b('A concession', 'Une concession'), b('A clear personal position with an argument', 'Une position personnelle claire et argumentée')], phrases: ['Selon le premier document,', 'Le second, en revanche,', 'Alors que… ,', 'Certes… toutefois…', 'Pour ma part,'], model: 'La place du téléphone portable à l’école divise. Selon le premier document, il faudrait l’interdire, car il empêcherait les élèves de se concentrer. Le second, en revanche, y voit un outil d’apprentissage et plaide pour une éducation à son usage plutôt que pour une interdiction.\n\nAlors que le premier auteur met l’accent sur les dangers immédiats, le second s’intéresse aux compétences dont les jeunes auront besoin plus tard. Les deux positions partagent toutefois un constat : l’usage actuel pose problème.\n\nPour ma part, j’estime qu’une interdiction totale serait contre-productive. Certes, les notifications distraient les élèves ; il n’en demeure pas moins que le téléphone permet de chercher une information, de filmer une expérience ou de travailler en groupe. Je plaiderais donc pour une solution intermédiaire : des téléphones rangés pendant les cours, mais utilisés lors d’activités encadrées par l’enseignant.' },
    ],
    notes: {
      points: [
        b('Task 3: present both views (in your words) → compare → give your position.', 'Tâche 3 : présenter les deux avis (avec vos mots) → comparer → donner votre position.'),
        b('Concession: certes… mais / toutefois; bien que + subjunctive; même si + indicative.', 'Concession : certes… mais / toutefois ; bien que + subjonctif ; même si + indicatif.'),
        b('Comparison: alors que, tandis que, contrairement à, de même que.', 'Comparaison : alors que, tandis que, contrairement à, de même que.'),
        b('Reporting verbs: soutenir, déplorer, nuancer, mettre en garde, plaider pour.', 'Verbes pour rapporter : soutenir, déplorer, nuancer, mettre en garde, plaider pour.'),
      ],
      vocab: [['contre-productif', b('counterproductive', 'qui produit l’effet inverse')], ['encadré', b('supervised', 'surveillé, organisé')], ['déceler', b('to detect', 'découvrir')], ['mettre l’accent sur', b('to emphasise', 'insister sur')], ['un constat', b('an observation', 'une observation')]],
    },
  },

  // ── C2 ──
  {
    id: 'tcf-writing-6',
    level: 'C2',
    slug: { en: 'c2-precision-style-nominalisation', fr: 'c2-precision-style-nominalisation' },
    title: b('C2 · Precision, style and nominalisation', 'C2 · Précision, style et nominalisation'),
    summary: b('Write like an expert user: precise verbs, nominalisation, varied syntax and a controlled formal register.', 'Écrire comme un utilisateur expérimenté : verbes précis, nominalisation, syntaxe variée et registre soutenu maîtrisé.'),
    objectives: [b('Replace general verbs with precise ones', 'Remplacer les verbes généraux par des verbes précis'), b('Use nominalisation to condense ideas', 'Employer la nominalisation pour condenser les idées'), b('Vary sentence structure for style', 'Varier la construction des phrases pour le style')],
    minutes: 17,
    steps: [
      card(b('Precise verbs', 'Des verbes précis'), b('C2 writing replaces **faire, dire, avoir, mettre, il y a** with precise verbs: faire un effort → **fournir** un effort; dire son désaccord → **exprimer** son désaccord; il y a des risques → **cela comporte** des risques; avoir un rôle → **jouer** un rôle.', 'L’écrit C2 remplace **faire, dire, avoir, mettre, il y a** par des verbes précis : faire un effort → **fournir** un effort ; dire son désaccord → **exprimer** son désaccord ; il y a des risques → **cela comporte** des risques ; avoir un rôle → **jouer** un rôle.')),
      { kind: 'match', prompt: b('Match each general phrase with a precise verb.', 'Associez chaque tournure générale à un verbe précis.'), pairs: [['faire une erreur', 'commettre une erreur'], ['dire une opinion', 'émettre une opinion'], ['mettre en place une loi', 'instaurer une loi'], ['avoir des conséquences', 'entraîner des conséquences'], ['faire un projet', 'élaborer un projet']] },
      card(b('Nominalisation', 'La nominalisation'), b('Turning a verb into a noun condenses an idea and gives a formal tone: “Les prix ont augmenté, ce qui inquiète” → **La hausse des prix inquiète.** “On a fermé l’usine, donc 200 personnes ont perdu leur emploi” → **La fermeture de l’usine a entraîné la suppression de 200 emplois.**', 'Transformer un verbe en nom condense l’idée et donne un ton soutenu : « Les prix ont augmenté, ce qui inquiète » → **La hausse des prix inquiète.** « On a fermé l’usine, donc 200 personnes ont perdu leur emploi » → **La fermeture de l’usine a entraîné la suppression de 200 emplois.**'), { variant: 'tip' }),
      pick('C2', b('Which is the nominalised version?', 'Quelle est la version nominalisée ?'), ['L’allongement de la durée de vie pose de nouveaux défis.', 'On vit plus longtemps et ça pose de nouveaux défis.', 'Les gens vivent plus longtemps, il y a des défis.', 'Vivre longtemps, c’est des défis nouveaux.']),
      pick('C2', b('Choose the most precise verb.', 'Choisissez le verbe le plus précis.'), ['susciter', 'faire', 'avoir', 'mettre'], { fr: 'Cette décision risque de ___ de vives réactions.' }),
      pick('C2', b('Which sentence has the most controlled formal register?', 'Quelle phrase a le registre soutenu le plus maîtrisé ?'), ['Encore faut-il que les moyens suivent : sans financement pérenne, la réforme restera lettre morte.', 'Mais bon, s’il n’y a pas d’argent, la réforme, elle va pas marcher.', 'Il faut de l’argent sinon c’est fichu pour la réforme.', 'La réforme, faut des sous, sinon rien.']),
      pick('C2', b('Choose the correct form.', 'Choisissez la forme correcte.'), ['Encore faut-il', 'Encore il faut', 'Encore faut il', 'Il encore faut'], { fr: '___ que les citoyens soient informés.', explain: b('After “encore” at the start of a sentence (= but still), the subject is inverted: encore faut-il.', 'Après « encore » en tête de phrase (= mais il faut aussi), on inverse le sujet : encore faut-il.') }),
      { kind: 'fill', prompt: b('Nominalise the verb in brackets.', 'Nominalisez le verbe entre parenthèses.'), text: 'La ___ (réduire) du temps de travail a entraîné la ___ (créer) de nouveaux emplois.', answers: [['réduction'], ['création']] },
      { kind: 'write', prompt: b('A C2 opinion piece.', 'Une tribune de niveau C2.'), task: 'Un magazine vous demande une courte tribune sur la question : « Faut-il limiter le tourisme dans les villes historiques ? » Exposez la question, discutez-la avec nuance et concluez par une proposition. Soignez la précision du vocabulaire et le registre. (130 à 180 mots)', min: 130, max: 180, checklist: [b('Nominalisations and precise verbs', 'Nominalisations et verbes précis'), b('A concession and a nuanced conclusion', 'Une concession et une conclusion nuancée'), b('Varied sentence structures', 'Des phrases de construction variée'), b('A concrete proposal', 'Une proposition concrète')], phrases: ['Force est de constater que…', 'Encore faut-il…', 'Loin de…', 'Il ne s’agit pas de…, mais de…'], model: 'Venise, Barcelone, Québec : chaque été, l’afflux de visiteurs transforme les centres historiques en décors saturés. Force est de constater que la croissance du tourisme a entraîné la hausse des loyers, la disparition des commerces de proximité et l’exaspération des habitants.\n\nFaut-il pour autant fermer les portes ? Ce serait oublier que le tourisme fait vivre des milliers de familles et contribue à l’entretien du patrimoine. Il ne s’agit donc pas de le restreindre aveuglément, mais d’en maîtriser les excès.\n\nPlusieurs leviers existent : la limitation des locations de courte durée, l’instauration d’une taxe modulée selon la saison ou encore la mise en valeur de quartiers moins fréquentés. Encore faut-il que ces mesures s’inscrivent dans une stratégie cohérente, élaborée avec les habitants plutôt qu’imposée par les seuls intérêts économiques.\n\nLoin d’être un renoncement, une telle régulation serait la condition même d’un tourisme durable.' },
    ],
    notes: {
      points: [
        b('Replace faire / dire / avoir / mettre / il y a with precise verbs: commettre, émettre, instaurer, entraîner, comporter.', 'Remplacez faire / dire / avoir / mettre / il y a par des verbes précis : commettre, émettre, instaurer, entraîner, comporter.'),
        b('Nominalisation: augmenter → la hausse; fermer → la fermeture; créer → la création.', 'Nominalisation : augmenter → la hausse ; fermer → la fermeture ; créer → la création.'),
        b('Formal structures: **encore faut-il que** + subjunctive, **force est de constater**, **il ne s’agit pas de… mais de…**', 'Structures soutenues : **encore faut-il que** + subjonctif, **force est de constater**, **il ne s’agit pas de… mais de…**'),
        b('Vary rhythm: a short sentence after long ones gives strength.', 'Variez le rythme : une phrase courte après des phrases longues donne de la force.'),
      ],
      vocab: [['l’afflux (m.)', b('influx', 'arrivée massive')], ['pérenne', b('lasting', 'durable')], ['rester lettre morte', b('to remain a dead letter', 'ne pas être appliqué')], ['un levier', b('a lever (means of action)', 'un moyen d’agir')], ['s’inscrire dans', b('to be part of', 'faire partie de')]],
    },
  },
];

export default lessons;
