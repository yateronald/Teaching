import type { CourseAbout } from '../../types';
import { b, card, dlg, doc, exam, gap, hear, lesson, mc, P, say, sort, tip, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Ready to test your A2 readiness under exam-like conditions? This complete practice set simulates the opening A2 band of the TCF across all four skills: timed everyday listening clips, short practical reading documents, Writing Tasks 1 and 2 with realistic word counts and annotated models, and Speaking Tasks 1, 2 and 3. Use the timers strictly, check your answers against the models and spot any remaining A2 gaps.',
    'Prêt à tester votre niveau A2 en conditions réelles ? Cet entraînement complet simule le palier A2 du TCF dans les quatre compétences : extraits audio chronométrés du quotidien, documents de lecture courts, tâches écrites 1 et 2 avec fourchettes de mots et modèles, et tâches orales 1, 2 et 3. Respectez les chronomètres, comparez vos productions aux modèles et repérez vos dernières lacunes.',
  ),
  outcomes: [
    b('Answer timed A2 listening and reading questions', 'Répondre en temps limité en écoute et lecture A2'),
    b('Complete Writing Tasks 1 and 2 at A2 level', 'Réussir les tâches écrites 1 et 2 au niveau A2'),
    b('Handle all three A2 speaking tasks smoothly', 'Gérer les trois tâches orales au niveau A2'),
    b('Compare your work with authentic models', 'Comparer ses productions aux modèles'),
  ],
};

const C = 'tcf-mock-a2';
export default [
  lesson(C, 1, ['listening-and-reading-a2', 'comprehension-a2'],
    b('Listening and reading (timed)', 'Compréhension orale et écrite (chronométrée)'),
    b('Practise A2 listening and reading items under realistic exam timers.', 'S’entraîner aux questions A2 d’écoute et de lecture sous chronomètre.'),
    [b('Answer three A2 listening clips in one play', 'Répondre à trois extraits audio en une écoute'), b('Read three everyday A2 documents fast', 'Lire vite trois documents du quotidien'), b('Keep within the suggested timer', 'Respecter le temps indiqué')],
    13,
    [
      exam(b('A2 mock conditions', 'Conditions du test A2'), b('Listen **once** to each audio item before choosing. For reading, respect the **45-second** timer so you save energy for harder questions later.', 'Écoutez **une seule fois** chaque extrait audio avant de choisir. En lecture, respectez le chronomètre de **45 secondes** pour garder du temps pour la suite.')),
      hear('Bonjour, ici la boulangerie du Coin. Nous sommes exceptionnellement fermés ce mercredi pour travaux, mais nous rouvrons jeudi dès six heures trente avec nos croissants chauds.', b('When does the bakery reopen?', 'Quand la boulangerie rouvre-t-elle ?'), [b('Thursday at 6:30 a.m.', 'jeudi à 6 h 30'), b('Wednesday morning', 'mercredi matin'), b('Thursday afternoon', 'jeudi après-midi'), b('next Monday', 'lundi prochain')], { voice: 'f', timer: 35 }),
      hear('Salut Romain, c’est Claire ! Mon bus vient d’arriver à l’heure, donc je t’attends déjà devant l’entrée principale du parc, près de la fontaine.', b('Where is Claire waiting?', 'Où Claire attend-elle ?'), [b('near the fountain at the main park entrance', 'près de la fontaine, à l’entrée principale du parc'), b('at the bus stop', 'à l’arrêt de bus'), b('inside a café', 'dans un café'), b('at Romain’s house', 'chez Romain')], { voice: 'f2', timer: 35 }),
      hear('Chers abonnés, le grand bassin de la piscine sera réservé aux écoles vendredi matin de neuf heures à onze heures. Le petit bassin reste ouvert à tous.', b('Who can use the small pool on Friday morning?', 'Qui peut utiliser le petit bassin vendredi matin ?'), [b('everyone', 'tout le monde'), b('school groups only', 'seulement les écoles'), b('nobody', 'personne'), b('swimming teachers only', 'seulement les maîtres-nageurs')], { voice: 'm', timer: 35 }),
      doc({ look: 'ad', title: b('Classified ad', 'Petite annonce'), text: 'À LOUER : Chambre meublée chez l’habitant.\nQuartier calme, à 5 min du tramway.\n420 €/mois, eau et internet compris.\nCuisine partagée. Non-fumeur uniquement.' }, b('What is NOT included in the 420 € rent?', 'Qu’est-ce qui n’est PAS mentionné comme compris dans les 420 € ?'), [b('meals', 'les repas'), b('water', 'l’eau'), b('internet', 'internet'), b('furniture', 'les meubles')], { timer: 45 }),
      doc({ look: 'email', title: b('Clinic confirmation', 'Confirmation du cabinet'), text: 'Bonjour Monsieur Diallo,\n\nVotre rendez-vous avec le docteur Blanc est confirmé pour le jeudi 14 novembre à 15 h 20. Merci d’arriver dix minutes avant avec votre carte vitale et vos anciens examens.\n\nSecrétariat médical' }, b('What must Mr Diallo bring?', 'Que doit apporter M. Diallo ?'), [b('his health card and previous test results', 'sa carte vitale et ses anciens examens'), b('cash payment only', 'un paiement en espèces uniquement'), b('a letter from his employer', 'une lettre de son employeur'), b('nothing at all', 'rien du tout')], { timer: 45 }),
      doc({ look: 'sms', text: 'Bonjour Paul, désolée pour ce soir : je finis plus tard au magasin. Est-ce que tu peux garder ma place au cours de guitare de 18 h ? J’arrive à 18 h 15 ! Sonia' }, b('Why does Sonia text Paul?', 'Pourquoi Sonia écrit-elle à Paul ?'), [b('to say she will be 15 minutes late for guitar class', 'pour prévenir qu’elle aura 15 minutes de retard au cours de guitare'), b('to cancel the guitar class', 'pour annuler le cours de guitare'), b('to ask Paul to drive her to work', 'pour demander à Paul de l’emmener au travail'), b('to invite Paul to the shop', 'pour inviter Paul au magasin')], { timer: 45 }),
    ],
    [
      b('Catch exact time and place modifiers: dès, avant, près de, reste ouvert.', 'Repérez les précisions : dès, avant, près de, reste ouvert.'),
      b('In ads, check what is explicitly included vs left out.', 'Dans les annonces, distinguez ce qui est inclus de ce qui manque.'),
      b('Respect 35–45 s per A2 item to build speed.', 'Tenez 35–45 s par question A2 pour gagner en vitesse.'),
    ],
    [['meublé', b('furnished', 'avec les meubles')], ['un abonné', b('a member / subscriber', 'personne inscrite')], ['partagé', b('shared', 'utilisé à plusieurs')]],
  ),
  lesson(C, 2, ['writing-tasks-a2', 'expression-ecrite-a2'],
    b('Writing Tasks 1 and 2 (A2)', 'Expression écrite : tâches 1 et 2 (A2)'),
    b('Practise Task 1 and Task 2 with clear structure, chronology and models.', 'S’entraîner aux tâches 1 et 2 avec structure claire, chronologie et modèles.'),
    [b('Choose the right greeting and closing', 'Choisir la bonne salutation et clôture'), b('Order past events in Task 2', 'Enchaîner les événements au passé'), b('Write Tasks 1 and 2 within word limits', 'Respecter les fourchettes de mots')],
    13,
    [
      card(b('A2 writing targets', 'Objectifs écrits au A2'), b('**Task 1** (60–120 words): answer every point in simple, clear sentences (**présent / futur proche**). **Task 2** (120–150 words): tell an experience in the **passé composé** and **imparfait** with simple feelings (**c’était génial, j’ai beaucoup aimé**).', '**Tâche 1** (60–120 mots) : répondez à chaque point avec des phrases simples et claires (**présent / futur proche**). **Tâche 2** (120–150 mots) : racontez une expérience au **passé composé** et à l’**imparfait** avec des impressions simples (**c’était génial, j’ai beaucoup aimé**).')),
      mc(P.best, ['Bonjour Madame Mercier, … Cordialement,', 'Coucou Madame Mercier ! … Bisous,', 'Salut Mercier, … À plus,', 'Chère collègue amie, … Grosses bises,'], { fr: 'Vous écrivez à la directrice d’une école de langue :' }),
      gap(P.completeText, '___ , nous avons pris le train très tôt. ___ , nous avons visité le château pendant deux heures. ___ , nous avons dîné dans un petit restaurant.', ['D’abord', 'Ensuite', 'Finalement'], { choices: [['D’abord', 'Cependant', 'Malgré'], ['Ensuite', 'Pourtant', 'Donc'], ['Finalement', 'Avant', 'Car']] }),
      write(b('Task 1 (60–110 words)', 'Tâche 1 (60–110 mots)'), b('Write an email to your cousin Julie inviting her to a family meal at your flat next Sunday: give the time, address and say what she can bring.', 'Écrivez un courriel à votre cousine Julie pour l’inviter à un repas en famille chez vous dimanche prochain : donnez l’heure, l’adresse et dites ce qu’elle peut apporter.'), 60, 110, [
        b('Friendly greeting and closing (tu)', 'Salutation et clôture amicales (tu)'),
        b('Day, time and address', 'Jour, heure et adresse'),
        b('Suggestion of what to bring', 'Proposition de ce qu’elle peut apporter'),
      ], 'Coucou Julie !\n\nJ’espère que tu vas bien ! Toute la famille vient manger chez moi dimanche prochain, le 12 mai, à 12 h 30, et je serais vraiment contente que tu viennes aussi.\n\nJ’habite maintenant au 18, rue des Lilas, au deuxième étage. C’est juste en face de l’arrêt de bus Mairie. Je prépare un grand couscous pour tout le monde. Si tu veux, tu peux apporter un dessert ou du jus de fruits.\n\nDis-moi avant vendredi si tu es libre !\n\nBisous,\nInès'),
      write(b('Task 2 (120–150 words)', 'Tâche 2 (120–150 mots)'), b('Write a short blog post telling about a pleasant day trip you took last weekend: where you went, what you did and what you liked.', 'Écrivez un court billet de blog pour raconter une belle journée d’excursion le week-end dernier : où vous êtes allé(e), ce que vous avez fait et ce qui vous a plu.'), 120, 150, [
        b('Past tenses (passé composé and imparfait)', 'Temps du passé (passé composé et imparfait)'),
        b('Chronological connectors', 'Connecteurs chronologiques'),
        b('Your impressions at the end', 'Vos impressions à la fin'),
      ], 'Une journée magnifique au bord de la mer\n\nSamedi dernier, je suis parti à Saint-Malo avec deux amis pour passer la journée au bord de la mer. Le matin, il faisait un peu frais, mais le soleil brillait et il n’y avait pas beaucoup de vent.\n\nD’abord, nous avons marché sur les remparts de la vieille ville et nous avons pris beaucoup de photos. À midi, nous avons mangé des crêpes délicieuses dans une petite rue calme. Ensuite, l’après-midi, nous sommes descendus sur la grande plage et nous avons bu un chocolat chaud face à l’océan.\n\nCe que j’ai préféré, c’était le coucher du soleil sur l’eau : les couleurs étaient superbes. Je suis rentré chez moi très fatigué, mais vraiment heureux. Je conseille cette visite à tout le monde !\n\nEt vous, quelle est votre dernière belle sortie ?'),
      tip(b('Check every point + word count', 'Vérifiez points et nombre de mots'), b('Before moving on, count your words: **Task 1 ≥ 60 words** and **Task 2 ≥ 120 words**. Texts under the minimum lose easy points even with good grammar.', 'Avant de finir, comptez vos mots : **tâche 1 ≥ 60 mots** et **tâche 2 ≥ 120 mots**. Un texte trop court perd des points faciles même sans fautes.')),
    ],
    [
      b('Match greeting and closing to the recipient (tu vs vous).', 'Adaptez salutation et clôture au destinataire (tu ou vous).'),
      b('Use d’abord, ensuite, à midi, finalement to structure Task 2.', 'Utilisez d’abord, ensuite, à midi, finalement pour rythmer la tâche 2.'),
      b('Always meet the minimum word counts (60 and 120).', 'Respectez toujours les seuils de mots (60 et 120).'),
    ],
    [['une excursion', b('a day trip / outing', 'courte sortie de loisir')], ['les remparts', b('city walls / ramparts', 'grands murs anciens')], ['le coucher du soleil', b('sunset', 'moment où le soleil disparaît')]],
  ),
  lesson(C, 3, ['speaking-tasks-a2', 'expression-orale-a2'],
    b('Speaking Tasks 1, 2 and 3 (A2)', 'Expression orale : tâches 1, 2 et 3 (A2)'),
    b('Practise all three speaking tasks with simple, clear A2 structures.', 'S’entraîner aux trois tâches orales avec des phrases simples et claires de niveau A2.'),
    [b('Introduce yourself clearly in Task 1', 'Se présenter clairement en tâche 1'), b('Ask polite everyday questions in Task 2', 'Poser des questions simples en tâche 2'), b('State a simple opinion with a reason in Task 3', 'Donner un avis simple avec une raison en tâche 3')],
    13,
    [
      card(b('What A2 speaking looks like', 'L’oral au niveau A2'), b('In **Task 1**, answer with 2–3 connected sentences. In **Task 2**, ask 6–8 clear questions politely (**Est-ce que… ? Combien coûte… ?**). In **Task 3**, give a simple opinion (**Je pense que… parce que…**) plus one example.', 'En **tâche 1**, répondez par 2 ou 3 phrases liées. En **tâche 2**, posez 6 à 8 questions claires et polies (**Est-ce que… ? Combien coûte… ?**). En **tâche 3**, donnez un avis simple (**Je pense que… parce que…**) avec un exemple.')),
      say('Bonjour, je m’appelle Lucas, j’ai vingt-cinq ans et je suis informaticien. Pendant mon temps libre, j’aime cuisiner et faire du vélo avec mes amis.', 'Hello, my name is Lucas, I am twenty-five and I am an IT specialist. In my free time, I like cooking and cycling with my friends.'),
      dlg(b('Task 2: asking about a yoga class', 'Tâche 2 : renseignements sur un cours de yoga'), undefined, [['Réceptionniste', 'f'], ['Vous', 'm']], [
        [0, 'Bonjour Monsieur, le studio Équilibre à l’appareil.', 'Hello Sir, Équilibre studio speaking.'],
        [1, { options: ['Bonjour Madame, je voudrais des renseignements sur vos cours de yoga du soir, s’il vous plaît.', 'Yoga, c’est quand ?', 'Allô, donne-moi le prix du yoga.'] }],
        [0, 'Avec plaisir. Nous avons un cours débutant le mardi à 18 h 30.', 'With pleasure. We have a beginner class on Tuesdays at 6:30 p.m.'],
        [1, { options: ['Super ! Combien coûte un cours, et faut-il apporter son propre tapis ?', 'Bon. Merci, au revoir.', 'C’est trop cher.'] }],
        [0, 'C’est 15 euros la séance, et nous prêtons les tapis gratuitement.', 'It’s 15 euros per session, and we lend mats for free.'],
      ]),
      mc(P.best, ['Je préfère vivre près d’un parc parce que c’est plus calme pour marcher. Par exemple, le dimanche, j’aime lire sur un banc.', 'Parc, oui.', 'Je ne sais pas, peut-être les magasins.', 'Parce que c’est bien, voilà.'], { fr: 'Tâche 3 — « Préférez-vous habiter près d’un parc ou d’un centre commercial ? »' }),
      say('À mon avis, les parcs sont très importants en ville parce que les familles peuvent se reposer et les enfants jouent dehors.', 'In my opinion, parks are very important in a city because families can rest and children play outside.'),
      sort(b('Good A2 habit or mistake?', 'Bon réflexe A2 ou erreur ?'), [b('wins A2 points', 'rapporte des points A2'), b('loses points', 'fait perdre des points')], [['développer sa réponse avec « parce que »', 0], ['répondre uniquement par « oui » ou « non »', 1], ['utiliser « bonjour » et « s’il vous plaît »', 0], ['oublier de poser des questions en tâche 2', 1], ['donner un exemple simple en tâche 3', 0], ['tutoyer un inconnu en tâche 2', 1]]),
    ],
    [
      b('Task 1: add one extra detail (where, since when, why) to every answer.', 'Tâche 1 : ajoutez un détail (où, depuis quand, pourquoi) à chaque réponse.'),
      b('Task 2: stay polite with vous and ask about price, schedule and equipment.', 'Tâche 2 : gardez le vous poli et demandez prix, horaire et matériel.'),
      b('Task 3: state a preference + parce que + one simple example.', 'Tâche 3 : donnez une préférence + parce que + un exemple simple.'),
    ],
    [['le temps libre', b('free time', 'heures sans travail')], ['prêter', b('to lend', 'donner temporairement')], ['un tapis', b('a mat', 'tapis de sport')]],
  ),
];
