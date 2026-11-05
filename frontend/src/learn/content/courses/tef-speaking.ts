// TEF Canada & TEFAQ · Expression orale, A1 → C2. The skills behind the two
// TEF sections: getting information on the phone (A) and convincing (B).
import { b, type Lesson } from '../../types';
import { card, pick } from '../kit';

const lessons: Lesson[] = [
  // ── A1 ──
  {
    id: 'tef-speaking-1',
    level: 'A1',
    slug: { en: 'a1-on-the-phone-first-questions', fr: 'a1-au-telephone-premieres-questions' },
    title: b('A1 · On the phone: first questions', 'A1 · Au téléphone : premières questions'),
    summary: b('Greet, say who you are and ask the simplest questions: price, place, time.', 'Saluer, dire qui vous êtes et poser les questions les plus simples : prix, lieu, heure.'),
    objectives: [b('Start and end a phone call politely', 'Commencer et terminer un appel poliment'), b('Ask: combien, où, quand, à quelle heure', 'Demander : combien, où, quand, à quelle heure'), b('Spell your name', 'Épeler votre nom')],
    minutes: 14,
    steps: [
      card(b('A phone call in four lines', 'Un appel en quatre répliques'), b('**Bonjour, je m’appelle…** → **J’appelle pour…** (the reason) → your questions → **Merci beaucoup, bonne journée !** These four moves are the base of TEF speaking section A.', '**Bonjour, je m’appelle…** → **J’appelle pour…** (la raison) → vos questions → **Merci beaucoup, bonne journée !** Ces quatre temps sont la base de la section A de l’oral du TEF.'), {
        examples: [
          { fr: 'Bonjour, je m’appelle Sara. J’appelle pour l’annonce du cours de natation.', tr: 'Hello, my name is Sara. I’m calling about the swimming class ad.' },
          { fr: 'C’est combien ?', tr: 'How much is it?' },
          { fr: 'C’est où, exactement ?', tr: 'Where is it exactly?' },
          { fr: 'Merci beaucoup, bonne journée !', tr: 'Thank you very much, have a nice day!' },
        ],
      }),
      { kind: 'speak', prompt: b('Say it aloud.', 'Dites-le à voix haute.'), text: 'Bonjour, je m’appelle Sara. J’appelle pour l’annonce du cours de natation.', tr: 'Hello, my name is Sara. I’m calling about the swimming class ad.' },
      pick('A1', b('You want to know the price. You ask:', 'Vous voulez connaître le prix. Vous demandez :'), ['C’est combien ?', 'C’est où ?', 'C’est quand ?', 'C’est qui ?']),
      pick('A1', b('You want to know the time. You ask:', 'Vous voulez connaître l’heure. Vous demandez :'), ['Le cours commence à quelle heure ?', 'Le cours est combien ?', 'Le cours est où ?', 'Le cours est qui ?']),
      pick('A1', b('How do you end the call?', 'Comment terminez-vous l’appel ?'), ['Merci beaucoup, bonne journée !', 'Bon appétit !', 'Bonne nuit, à demain !', 'Salut, ça va ?']),
      pick('A1', b('The person asks “Vous pouvez épeler votre nom ?” You…', 'La personne demande « Vous pouvez épeler votre nom ? » Vous…'), ['dites les lettres de votre nom', 'dites votre âge', 'donnez votre adresse', 'répétez votre prénom']),
      { kind: 'speak', prompt: b('Spell this name aloud.', 'Épelez ce nom à voix haute.'), text: 'Diallo : D, I, A, L, L, O.', tr: 'Diallo: D-I-A-L-L-O.', tip: b('Say “deux L” for LL: D, I, A, deux L, O.', 'Pour LL, dites « deux L » : D, I, A, deux L, O.') },
      { kind: 'speak', prompt: b('Ask the question aloud.', 'Posez la question à voix haute.'), text: 'Le cours commence à quelle heure ?', tr: 'What time does the class start?' },
    ],
    notes: {
      points: [
        b('Phone call: Bonjour, je m’appelle… → J’appelle pour… → questions → Merci, bonne journée !', 'Appel : Bonjour, je m’appelle… → J’appelle pour… → questions → Merci, bonne journée !'),
        b('Question words: combien (price), où (place), quand / à quelle heure (time), comment (how).', 'Mots interrogatifs : combien (prix), où (lieu), quand / à quelle heure (temps), comment (manière).'),
        b('Spelling: deux L, deux S; accents: e accent aigu (é), e accent grave (è).', 'Épeler : deux L, deux S ; accents : e accent aigu (é), e accent grave (è).'),
        b('Intonation: your voice rises at the end of a question.', 'Intonation : la voix monte à la fin d’une question.'),
      ],
      vocab: [['l’annonce (f.)', b('ad', 'texte qui propose quelque chose')], ['la natation', b('swimming', 'sport dans l’eau')], ['épeler', b('to spell', 'dire les lettres')], ['commencer', b('to start', 'débuter')]],
    },
  },

  // ── A2 ──
  {
    id: 'tef-speaking-2',
    level: 'A2',
    slug: { en: 'a2-ask-for-practical-information', fr: 'a2-demander-des-informations-pratiques' },
    title: b('A2 · Ask for practical information', 'A2 · Demander des informations pratiques'),
    summary: b('Ask about schedules, prices, conditions and how to register, and understand the answers.', 'Se renseigner sur les horaires, les prix, les conditions et l’inscription, et comprendre les réponses.'),
    objectives: [b('Ask six different practical questions', 'Poser six questions pratiques différentes'), b('Use est-ce que and question words', 'Employer est-ce que et les mots interrogatifs'), b('Ask someone to repeat politely', 'Faire répéter poliment')],
    minutes: 15,
    steps: [
      card(b('The six topics of any ad', 'Les six thèmes de toute annonce'), b('Whatever the ad (a gym, a room, a trip), you can always ask about: **le prix**, **les horaires**, **le lieu**, **les conditions** (âge, documents), **l’inscription** (comment, quand), **ce qui est compris**. Six topics = six questions.', 'Quelle que soit l’annonce (salle de sport, chambre, voyage), vous pouvez toujours demander : **le prix**, **les horaires**, **le lieu**, **les conditions** (âge, documents), **l’inscription** (comment, quand), **ce qui est compris**. Six thèmes = six questions.'), { variant: 'tip' }),
      { kind: 'categorize', prompt: b('Which topic does each question cover?', 'Quel thème couvre chaque question ?'), buckets: [b('Price', 'Prix'), b('Schedule', 'Horaires'), b('Registration', 'Inscription')], items: [{ text: 'Est-ce qu’il y a une réduction pour les étudiants ?', bucket: 0 }, { text: 'C’est ouvert le dimanche ?', bucket: 1 }, { text: 'Comment est-ce qu’on s’inscrit ?', bucket: 2 }, { text: 'Le matériel est compris dans le prix ?', bucket: 0 }, { text: 'Les cours durent combien de temps ?', bucket: 1 }, { text: 'Quels documents faut-il apporter ?', bucket: 2 }] },
      pick('A2', b('Which question is correct?', 'Quelle question est correcte ?'), ['Est-ce qu’il faut apporter une photo ?', 'Est-ce que il faut apporter une photo ?', 'Il faut est-ce que apporter une photo ?', 'Est-ce qu’il faut apporter une photo est-ce que ?'], { explain: b('Est-ce que → est-ce qu’ before a vowel.', 'Est-ce que → est-ce qu’ devant une voyelle.') }),
      pick('A2', b('You did not understand. You say:', 'Vous n’avez pas compris. Vous dites :'), ['Pardon, vous pouvez répéter, s’il vous plaît ?', 'Quoi ?', 'Hein ?', 'Je comprends pas, au revoir.']),
      pick('A2', b('Choose the right question word.', 'Choisissez le bon mot interrogatif.'), ['Combien de', 'Quel', 'Où', 'Quand'], { fr: '___ personnes il y a dans un groupe ?' }),
      pick('A2', b('Choose the right question word.', 'Choisissez le bon mot interrogatif.'), ['Quels', 'Quelle', 'Quel', 'Quelles'], { fr: '___ sont les horaires d’ouverture ?' }),
      { kind: 'speak', prompt: b('Ask the question aloud.', 'Posez la question à voix haute.'), text: 'Est-ce qu’il y a une réduction pour les étudiants ?', tr: 'Is there a student discount?' },
      { kind: 'speak', prompt: b('Ask the question aloud.', 'Posez la question à voix haute.'), text: 'Pardon, vous pouvez répéter, s’il vous plaît ?', tr: 'Sorry, could you repeat that, please?' },
      { kind: 'speak', prompt: b('Ask the question aloud.', 'Posez la question à voix haute.'), text: 'Comment est-ce qu’on s’inscrit ?', tr: 'How do you register?' },
    ],
    notes: {
      points: [
        b('Six topics of any ad: prix, horaires, lieu, conditions, inscription, ce qui est compris.', 'Six thèmes de toute annonce : prix, horaires, lieu, conditions, inscription, ce qui est compris.'),
        b('Est-ce que / est-ce qu’ + subject + verb: Est-ce qu’il faut…?', 'Est-ce que / est-ce qu’ + sujet + verbe : Est-ce qu’il faut… ?'),
        b('Quel / quelle / quels / quelles agree with the noun: Quels sont les horaires ?', 'Quel / quelle / quels / quelles s’accordent avec le nom : Quels sont les horaires ?'),
        b('Ask to repeat: Pardon, vous pouvez répéter, s’il vous plaît ?', 'Faire répéter : Pardon, vous pouvez répéter, s’il vous plaît ?'),
      ],
      vocab: [['la réduction', b('discount', 'baisse de prix')], ['s’inscrire', b('to register', 'donner son nom pour participer')], ['le matériel', b('equipment', 'objets nécessaires')], ['durer', b('to last', 'prendre du temps')]],
    },
  },

  // ── B1 ──
  {
    id: 'tef-speaking-3',
    level: 'B1',
    slug: { en: 'b1-section-a-ten-varied-questions', fr: 'b1-section-a-dix-questions-variees' },
    title: b('B1 · Section A: ten varied, polite questions', 'B1 · Section A : dix questions variées et polies'),
    summary: b('Lead the section A phone call: about ten relevant questions in 5 minutes, varied forms and polite register.', 'Mener l’appel de la section A : une dizaine de questions pertinentes en 5 minutes, des formes variées et un registre poli.'),
    objectives: [b('Ask about ten relevant questions', 'Poser une dizaine de questions pertinentes'), b('Vary the question forms', 'Varier la forme des questions'), b('React to the answers naturally', 'Réagir naturellement aux réponses')],
    minutes: 15,
    steps: [
      card(b('Section A of the TEF', 'La section A du TEF'), b('You read an ad and call to **get information**: about **ten questions in 5 minutes**. The examiner answers like a real person. Graders reward **relevance**, **variety** of forms (intonation, est-ce que, inversion, indirect questions) and **politeness**.', 'Vous lisez une annonce et appelez pour **obtenir des informations** : une **dizaine de questions en 5 minutes**. L’examinateur répond comme une vraie personne. Les correcteurs valorisent la **pertinence**, la **variété** des formes (intonation, est-ce que, inversion, questions indirectes) et la **politesse**.'), { variant: 'exam' }),
      card(b('React, then ask', 'Réagir, puis demander'), b('A natural call is not an interrogation. After each answer, react briefly (**D’accord. Ah, très bien. C’est parfait.**) and link to the next question (**Et pour ce qui est de… ? Une dernière question :**).', 'Un appel naturel n’est pas un interrogatoire. Après chaque réponse, réagissez brièvement (**D’accord. Ah, très bien. C’est parfait.**) et enchaînez (**Et pour ce qui est de… ? Une dernière question :**).'), {
        examples: [
          { fr: 'D’accord. Et pour ce qui est du stationnement, est-ce qu’il y en a un ?', tr: 'OK. And as for parking, is there any?' },
          { fr: 'Très bien. Pourriez-vous me dire si le petit-déjeuner est compris ?', tr: 'Very good. Could you tell me if breakfast is included?' },
          { fr: 'Parfait. Une dernière question : peut-on annuler sans frais ?', tr: 'Perfect. One last question: can you cancel free of charge?' },
        ],
      }),
      { kind: 'speak', prompt: b('Say it aloud.', 'Dites-le à voix haute.'), text: 'D’accord. Et pour ce qui est du stationnement, est-ce qu’il y en a un ?', tr: 'OK. And as for parking, is there any?' },
      pick('B1', b('Which question is an indirect question?', 'Quelle question est une question indirecte ?'), ['Pourriez-vous me dire si le petit-déjeuner est compris ?', 'Le petit-déjeuner est compris ?', 'Est-ce que le petit-déjeuner est compris ?', 'Le petit-déjeuner est-il compris ?']),
      pick('B1', b('The ad is for a guided tour of Québec City. Which question is the most relevant?', 'L’annonce propose une visite guidée de Québec. Quelle question est la plus pertinente ?'), ['La visite est-elle offerte en français et en anglais ?', 'Quel temps fait-il à Paris ?', 'Aimez-vous les visites ?', 'Où habitez-vous ?']),
      pick('B1', b('Choose the correct indirect question.', 'Choisissez la question indirecte correcte.'), ['J’aimerais savoir ce qui est compris dans le prix.', 'J’aimerais savoir qu’est-ce qui est compris dans le prix.', 'J’aimerais savoir est-ce que compris le prix.', 'J’aimerais savoir quoi est compris.'], { explain: b('Qu’est-ce qui → ce qui in an indirect question.', 'Qu’est-ce qui → ce qui dans une question indirecte.') }),
      pick('B1', b('Which reaction sounds natural before the next question?', 'Quelle réaction sonne naturelle avant la question suivante ?'), ['Ah, c’est parfait. Et pour les enfants, y a-t-il un tarif réduit ?', 'Question numéro six.', 'OK OK OK.', 'Je pose une autre question maintenant.']),
      { kind: 'dialogue', title: b('Section A: a yoga studio ad', 'Section A : l’annonce d’un studio de yoga'), scene: b('Choose your best question each time.', 'Choisissez chaque fois votre meilleure question.'), speakers: [{ name: 'Studio', voice: 'f2', side: 'l' }, { name: 'Vous', voice: 'm', side: 'r' }], lines: [
        { s: 0, fr: 'Studio Zen, bonjour !', tr: 'Studio Zen, hello!' },
        { s: 1, choose: { options: ['Bonjour, j’appelle au sujet de votre annonce. Pourriez-vous me dire quels types de cours vous proposez ?', 'Allô, yoga ?', 'Bonjour, c’est combien ?'], answer: 0 } },
        { s: 0, fr: 'Nous avons du yoga doux, du yoga dynamique et de la méditation.', tr: 'We have gentle yoga, dynamic yoga and meditation.' },
        { s: 1, choose: { options: ['Très bien. Et est-ce qu’il faut avoir de l’expérience pour le yoga dynamique ?', 'OK.', 'Je préfère le football.'], answer: 0 } },
        { s: 0, fr: 'Non, les débutants sont les bienvenus. Le premier cours est d’ailleurs gratuit.', tr: 'No, beginners are welcome. The first class is free, by the way.' },
        { s: 1, choose: { options: ['C’est parfait. Faut-il réserver ce premier cours à l’avance ?', 'Gratuit ? Au revoir.', 'Pourquoi gratuit ?'], answer: 0 } },
      ] },
    ],
    notes: {
      points: [
        b('Section A: about ten relevant questions in 5 minutes, on the ad’s topics.', 'Section A : une dizaine de questions pertinentes en 5 minutes, sur les thèmes de l’annonce.'),
        b('Vary: intonation, est-ce que, inversion (Le prix est-il… ?), indirect (Pourriez-vous me dire si…).', 'Variez : intonation, est-ce que, inversion (Le prix est-il… ?), indirecte (Pourriez-vous me dire si…).'),
        b('Indirect questions: qu’est-ce que → ce que; qu’est-ce qui → ce qui; est-ce que → si.', 'Questions indirectes : qu’est-ce que → ce que ; qu’est-ce qui → ce qui ; est-ce que → si.'),
        b('React then link: D’accord. Et pour ce qui est de… ? Une dernière question : …', 'Réagir puis enchaîner : D’accord. Et pour ce qui est de… ? Une dernière question : …'),
      ],
      vocab: [['pour ce qui est de', b('as for', 'concernant')], ['sans frais', b('free of charge', 'gratuitement')], ['le tarif réduit', b('reduced rate', 'prix plus bas')], ['réserver', b('to book', 'retenir une place')], ['le débutant', b('beginner', 'personne qui commence')]],
    },
  },

  // ── B2 ──
  {
    id: 'tef-speaking-4',
    level: 'B2',
    slug: { en: 'b2-section-b-present-and-convince', fr: 'b2-section-b-presenter-et-convaincre' },
    title: b('B2 · Section B: present a document and convince', 'B2 · Section B : présenter un document et convaincre'),
    summary: b('Present an ad to a friend, highlight its advantages and persuade them to join you.', 'Présenter une annonce à un ami, en souligner les avantages et le persuader de vous accompagner.'),
    objectives: [b('Present a document clearly', 'Présenter clairement un document'), b('Turn features into advantages for the listener', 'Transformer des caractéristiques en avantages pour l’interlocuteur'), b('Persuade with enthusiasm and arguments', 'Persuader avec enthousiasme et arguments')],
    minutes: 15,
    steps: [
      card(b('Section B of the TEF', 'La section B du TEF'), b('In about **10 minutes**, you present a document (an ad for an activity, a trip, a service) to a friend played by the examiner, and you try to **convince** them to take part. The friend is hesitant and raises objections. Your job: present, argue, and adapt.', 'En une **dizaine de minutes**, vous présentez un document (une annonce d’activité, de voyage, de service) à un ami joué par l’examinateur, et vous essayez de le **convaincre** d’y participer. L’ami hésite et soulève des objections. Votre rôle : présenter, argumenter, vous adapter.'), { variant: 'exam' }),
      card(b('From feature to advantage', 'De la caractéristique à l’avantage'), b('A feature is in the ad; an advantage is **what it brings your friend**. “Le cours a lieu le samedi” → “**Comme tu travailles en semaine, c’est idéal pour toi.**” Always connect the ad to the friend’s life.', 'Une caractéristique est dans l’annonce ; un avantage, c’est **ce qu’elle apporte à votre ami**. « Le cours a lieu le samedi » → « **Comme tu travailles en semaine, c’est idéal pour toi.** » Reliez toujours l’annonce à la vie de votre ami.'), {
        examples: [
          { fr: 'Écoute, j’ai trouvé une annonce qui devrait te plaire.', tr: 'Listen, I found an ad you should like.' },
          { fr: 'Comme tu travailles en semaine, le samedi, c’est idéal pour toi.', tr: 'Since you work during the week, Saturday is ideal for you.' },
          { fr: 'En plus, ça te permettrait de rencontrer du monde.', tr: 'What’s more, it would let you meet people.' },
        ],
      }),
      { kind: 'speak', prompt: b('Say it with enthusiasm.', 'Dites-le avec enthousiasme.'), text: 'Écoute, j’ai trouvé une annonce qui devrait te plaire.', tr: 'Listen, I found an ad you should like.' },
      pick('B2', b('Which sentence turns a feature into an advantage?', 'Quelle phrase transforme une caractéristique en avantage ?'), ['Le club est à cinq minutes de chez toi, donc tu n’auras même pas besoin de prendre ta voiture.', 'Le club est à cinq minutes.', 'Il y a un club.', 'Le club a une adresse.']),
      pick('B2', b('Your friend says: “Je n’ai pas le temps.” Best answer:', 'Votre ami dit : « Je n’ai pas le temps. » Meilleure réponse :'), ['Je comprends, mais c’est seulement une heure par semaine, et ça t’aiderait justement à décompresser.', 'Tant pis pour toi.', 'Moi non plus.', 'Ce n’est pas vrai.']),
      pick('B2', b('Choose the right form.', 'Choisissez la bonne forme.'), ['permettrait', 'permet', 'permettra', 'permettait'], { fr: 'Ce voyage te ___ de découvrir la Gaspésie.', explain: b('Conditional: a gentle, persuasive suggestion.', 'Conditionnel : une suggestion douce et persuasive.') }),
      pick('B2', b('Which phrase checks your friend’s interest?', 'Quelle formule vérifie l’intérêt de votre ami ?'), ['Qu’est-ce que tu en penses ? Ça te tente ?', 'Tu viens, point final.', 'Je m’en fiche de ton avis.', 'Voilà.']),
      { kind: 'speak', prompt: b('Say it aloud.', 'Dites-le à voix haute.'), text: 'Comme tu travailles en semaine, le samedi, c’est idéal pour toi.', tr: 'Since you work during the week, Saturday is ideal for you.' },
      { kind: 'speak', prompt: b('Say it aloud.', 'Dites-le à voix haute.'), text: 'Qu’est-ce que tu en penses ? Ça te tente ?', tr: 'What do you think? Are you tempted?', tip: b('“Ça te tente ?” is very common in Québec.', '« Ça te tente ? » est très courant au Québec.') },
    ],
    notes: {
      points: [
        b('Section B: about 10 minutes; present a document and convince a hesitant friend.', 'Section B : une dizaine de minutes ; présenter un document et convaincre un ami hésitant.'),
        b('Feature → advantage for the friend: Comme tu…, c’est idéal pour toi.', 'Caractéristique → avantage pour l’ami : Comme tu…, c’est idéal pour toi.'),
        b('Persuasive conditional: ça te permettrait de…, tu pourrais…, on pourrait…', 'Conditionnel persuasif : ça te permettrait de…, tu pourrais…, on pourrait…'),
        b('Check interest: Qu’est-ce que tu en penses ? Ça te tente ?', 'Vérifier l’intérêt : Qu’est-ce que tu en penses ? Ça te tente ?'),
      ],
      vocab: [['décompresser', b('to unwind', 'se détendre')], ['ça te tente ?', b('do you feel like it? (Québec)', 'as-tu envie ?')], ['rencontrer du monde', b('to meet people', 'faire des connaissances')], ['tant pis', b('too bad', 'dommage')]],
    },
  },

  // ── C1 ──
  {
    id: 'tef-speaking-5',
    level: 'C1',
    slug: { en: 'c1-answer-objections-and-persuade', fr: 'c1-repondre-aux-objections-et-persuader' },
    title: b('C1 · Answer objections and persuade', 'C1 · Répondre aux objections et persuader'),
    summary: b('Handle every objection of section B: acknowledge, reframe, propose a solution, and keep the friendly tone.', 'Gérer chaque objection de la section B : reconnaître, recadrer, proposer une solution, en gardant un ton amical.'),
    objectives: [b('Use the acknowledge–reframe–solve method', 'Employer la méthode reconnaître–recadrer–résoudre'), b('Anticipate typical objections', 'Anticiper les objections typiques'), b('Persuade without pressure', 'Persuader sans forcer')],
    minutes: 15,
    steps: [
      card(b('Acknowledge, reframe, solve', 'Reconnaître, recadrer, résoudre'), b('For each objection: **acknowledge** it (Je comprends que…; Tu as raison sur un point…), **reframe** it (Mais vois-le autrement…), **solve** it (Et si on… ? Je pourrais…). This is what turns a B2 answer into a C1 one.', 'Pour chaque objection : **reconnaissez-la** (Je comprends que… ; Tu as raison sur un point…), **recadrez-la** (Mais vois-le autrement…), **résolvez-la** (Et si on… ? Je pourrais…). C’est ce qui fait passer une réponse B2 au niveau C1.'), {
        examples: [
          { fr: 'Je comprends que le prix te fasse hésiter.', tr: 'I understand that the price makes you hesitate.' },
          { fr: 'Mais vois-le plutôt comme un investissement pour ta santé.', tr: 'But see it rather as an investment in your health.' },
          { fr: 'Et si on partageait les frais de transport ?', tr: 'And what if we shared the transport costs?' },
        ],
      }),
      { kind: 'match', prompt: b('Match each typical objection with a good reply.', 'Associez chaque objection typique à une bonne réponse.'), pairs: [['C’est trop cher.', b('Vois-le comme un investissement, et on partage les frais.', 'Vois-le comme un investissement, et on partage les frais.')], ['Je n’ai pas le temps.', b('C’est une heure par semaine, le samedi.', 'C’est une heure par semaine, le samedi.')], ['C’est trop loin.', b('Je t’emmène en voiture.', 'Je t’emmène en voiture.')], ['Je ne connais personne.', b('Justement, c’est l’occasion de rencontrer du monde.', 'Justement, c’est l’occasion de rencontrer du monde.')]] },
      pick('C1', b('Which reply follows acknowledge–reframe–solve?', 'Quelle réplique suit la méthode reconnaître–recadrer–résoudre ?'), ['Tu as raison, c’est un peu loin. Mais le trajet est magnifique, et je pourrais passer te prendre.', 'Ce n’est pas loin.', 'Tu exagères toujours.', 'Bon, tant pis, j’irai seul.']),
      pick('C1', b('Choose the right form.', 'Choisissez la bonne forme.'), ['fasse', 'fait', 'fera', 'ferait'], { fr: 'Je comprends que le prix te ___ hésiter.', explain: b('Comprendre que (= accept a feeling) + subjunctive.', 'Comprendre que (= admettre un sentiment) + subjonctif.') }),
      pick('C1', b('Your friend says: “Et si je n’aime pas ?” Best answer:', 'Votre ami dit : « Et si je n’aime pas ? » Meilleure réponse :'), ['C’est une vraie question. Justement, le premier cours est à l’essai : tu ne t’engages à rien.', 'Tu vas aimer, c’est sûr.', 'C’est ton problème.', 'Alors ne viens pas.']),
      pick('C1', b('Which sentence persuades without pressure?', 'Quelle phrase persuade sans forcer ?'), ['Je ne veux pas te forcer, mais je pense sincèrement que ça te ferait du bien.', 'Tu dois venir, c’est obligatoire.', 'Si tu ne viens pas, je suis fâché.', 'Tout le monde y va sauf toi.']),
      { kind: 'dialogue', title: b('Section B: a weekend in the Laurentides', 'Section B : un week-end dans les Laurentides'), scene: b('Convince your friend. Choose your best reply.', 'Convainquez votre ami. Choisissez votre meilleure réplique.'), speakers: [{ name: 'Ami', voice: 'm2', side: 'l' }, { name: 'Vous', voice: 'f', side: 'r' }], lines: [
        { s: 0, fr: 'Un week-end en chalet ? Bof, ça coûte sûrement une fortune.', tr: 'A weekend in a cabin? Meh, it surely costs a fortune.' },
        { s: 1, choose: { options: ['Je comprends que le prix te fasse peur. Mais divisé entre six, ça revient à soixante dollars chacun, repas compris.', 'Non, pas du tout.', 'Tu dis toujours ça.'], answer: 0 } },
        { s: 0, fr: 'Mouais… Et je n’ai pas de voiture.', tr: 'Hmm… And I don’t have a car.' },
        { s: 1, choose: { options: ['Pas de souci, je passe te prendre vendredi soir, il me reste une place.', 'Prends l’autobus.', 'C’est dommage.'], answer: 0 } },
        { s: 0, fr: 'Bon… Tu me tentes, là.', tr: 'Well… You’re tempting me now.' },
      ] },
      { kind: 'speak', prompt: b('Say it aloud.', 'Dites-le à voix haute.'), text: 'Je ne veux pas te forcer, mais je pense sincèrement que ça te ferait du bien.', tr: 'I don’t want to push you, but I sincerely think it would do you good.' },
    ],
    notes: {
      points: [
        b('Method: acknowledge (Je comprends que + subj.) → reframe (Mais vois-le autrement) → solve (Et si on… ?).', 'Méthode : reconnaître (Je comprends que + subj.) → recadrer (Mais vois-le autrement) → résoudre (Et si on… ?).'),
        b('Typical objections: price, time, distance, not knowing anyone, fear of not liking it.', 'Objections typiques : prix, temps, distance, ne connaître personne, peur de ne pas aimer.'),
        b('Persuade without pressure: Je ne veux pas te forcer, mais…; Tu ne t’engages à rien.', 'Persuader sans forcer : Je ne veux pas te forcer, mais… ; Tu ne t’engages à rien.'),
        b('Concrete figures convince: “divisé entre six, ça revient à…”.', 'Les chiffres concrets convainquent : « divisé entre six, ça revient à… ».'),
      ],
      vocab: [['le chalet', b('cabin, cottage', 'maison de campagne')], ['ça revient à', b('it comes to', 'cela coûte au final')], ['à l’essai', b('on a trial basis', 'pour essayer')], ['s’engager', b('to commit', 'promettre')], ['passer prendre quelqu’un', b('to pick someone up', 'aller chercher en voiture')]],
    },
  },

  // ── C2 ──
  {
    id: 'tef-speaking-6',
    level: 'C2',
    slug: { en: 'c2-ease-humour-and-register', fr: 'c2-aisance-humour-et-registre' },
    title: b('C2 · Ease, humour and register', 'C2 · Aisance, humour et registre'),
    summary: b('Speak like an expert user: switch register at will, use humour and Québec expressions, and stay convincing.', 'Parler comme un utilisateur expérimenté : changer de registre à volonté, utiliser l’humour et des expressions québécoises, et rester convaincant.'),
    objectives: [b('Switch between familiar and formal registers', 'Passer du registre familier au registre soutenu'), b('Use humour to persuade', 'Utiliser l’humour pour persuader'), b('Use common Québec expressions appropriately', 'Employer à bon escient des expressions québécoises courantes')],
    minutes: 16,
    steps: [
      card(b('One idea, three registers', 'Une idée, trois registres'), b('A C2 speaker adapts: **familiar** (C’est super le fun, faut que tu viennes !), **standard** (C’est vraiment agréable, tu devrais venir), **formal** (Je ne saurais trop vous recommander d’y participer). The TEF friend is familiar; a formal role-play needs the third.', 'Un locuteur C2 s’adapte : **familier** (C’est super le fun, faut que tu viennes !), **courant** (C’est vraiment agréable, tu devrais venir), **soutenu** (Je ne saurais trop vous recommander d’y participer). L’ami du TEF est familier ; un jeu de rôle formel exige le troisième.')),
      { kind: 'categorize', prompt: b('Familiar, standard or formal?', 'Familier, courant ou soutenu ?'), buckets: [b('Familiar', 'Familier'), b('Standard', 'Courant'), b('Formal', 'Soutenu')], items: [{ text: 'C’est super le fun !', bucket: 0 }, { text: 'C’est très agréable.', bucket: 1 }, { text: 'Je ne saurais trop vous le recommander.', bucket: 2 }, { text: 'Ça vaut la peine en masse.', bucket: 0 }, { text: 'Tu devrais essayer.', bucket: 1 }, { text: 'Permettez-moi d’insister sur ce point.', bucket: 2 }] },
      card(b('Québec expressions in conversation', 'Les expressions québécoises en conversation'), b('With a Québec friend, a few expressions sound warm and natural: **c’est le fun** (it’s fun), **en masse** (a lot), **ça vaut la peine** (it’s worth it), **pas de trouble** (no problem), **on va avoir du plaisir** (we’ll have fun). Use them sparingly and only in a familiar register.', 'Avec un ami québécois, quelques expressions sonnent chaleureuses et naturelles : **c’est le fun**, **en masse**, **ça vaut la peine**, **pas de trouble**, **on va avoir du plaisir**. Employez-les avec mesure et seulement en registre familier.'), { variant: 'culture' }),
      pick('C2', b('In a formal meeting, which sentence fits?', 'Dans une réunion formelle, quelle phrase convient ?'), ['Je ne saurais trop vous recommander de saisir cette occasion.', 'C’est super le fun, faut le faire !', 'Ça vaut la peine en masse.', 'Envoye, embarque !']),
      pick('C2', b('Which sentence uses humour to defuse an objection?', 'Quelle phrase utilise l’humour pour désamorcer une objection ?'), ['Trop froid pour faire du ski ? Voyons, c’est justement pour ça qu’on a inventé le chocolat chaud au chalet !', 'Il ne fait pas froid.', 'Le froid, ce n’est pas grave.', 'Tu as tort, il fait chaud.']),
      pick('C2', b('What does “pas de trouble” mean in Québec?', 'Que signifie « pas de trouble » au Québec ?'), ['No problem', 'No worries about health', 'There is a problem', 'Do not disturb']),
      pick('C2', b('Choose the formal equivalent of “Faut que tu viennes !”', 'Choisissez l’équivalent soutenu de « Faut que tu viennes ! »'), ['Votre présence serait vivement souhaitée.', 'Tu dois venir, OK ?', 'Viens, là !', 'Faut venir.']),
      { kind: 'speak', prompt: b('Say it with a smile.', 'Dites-le avec le sourire.'), text: 'Trop froid ? Voyons, c’est justement pour ça qu’on a inventé le chocolat chaud au chalet !', tr: 'Too cold? Come on, that’s exactly why hot chocolate at the cabin was invented!' },
      { kind: 'speak', prompt: b('Say it in a formal tone.', 'Dites-le sur un ton soutenu.'), text: 'Je ne saurais trop vous recommander de saisir cette occasion.', tr: 'I cannot recommend strongly enough that you seize this opportunity.' },
    ],
    notes: {
      points: [
        b('Three registers: familiar (le fun, faut que), standard (tu devrais), formal (je ne saurais trop vous recommander).', 'Trois registres : familier (le fun, faut que), courant (tu devrais), soutenu (je ne saurais trop vous recommander).'),
        b('Québec familiar: c’est le fun, en masse, ça vaut la peine, pas de trouble, on va avoir du plaisir.', 'Québécois familier : c’est le fun, en masse, ça vaut la peine, pas de trouble, on va avoir du plaisir.'),
        b('Humour defuses an objection and keeps the friendly tone.', 'L’humour désamorce une objection et garde le ton amical.'),
        b('Never mix registers in the same reply.', 'Ne mélangez jamais les registres dans la même réplique.'),
      ],
      vocab: [['désamorcer', b('to defuse', 'calmer, neutraliser')], ['en masse (Québec)', b('a lot', 'beaucoup')], ['saisir une occasion', b('to seize an opportunity', 'profiter d’une chance')], ['vivement', b('strongly', 'fortement')], ['avoir du plaisir (Québec)', b('to have fun', 's’amuser')]],
    },
  },
];

export default lessons;
