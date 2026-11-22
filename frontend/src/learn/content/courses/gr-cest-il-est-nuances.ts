import type { CourseAbout, Lesson } from '../../types';
import { P, b, card, dict, dlg, gap, hear, lesson, mc, ord, pairs, say, sort, tip, trap, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Finally clear up one of the classic A2 hurdles: c’est vs. il est / elle est. Learn when a determiner, name, or pronoun forces c’est, why bare professions and adjectives take il est / elle est, how general judgements differ from impersonal il est + adj + de/que, and how to handle clock times and days smoothly.',
    'Levez enfin l’un des grands pièges du niveau A2 : c’est contre il est / elle est. Voyez quand un déterminant, un nom propre ou un pronom impose c’est, pourquoi les professions sans article et les adjectifs seuls prennent il est / elle est, et comment distinguer jugement général et tournure impersonnelle il est + adjectif + de/que.',
  ),
  outcomes: [
    b('Identify people and things with c’est / ce sont and describe them with il est / elle est', 'Identifier avec c’est / ce sont et décrire avec il est / elle est'),
    b('Distinguish bare professions (Elle est médecin) from modified nouns (C’est un bon médecin)', 'Distinguer profession seule (Elle est médecin) et nom déterminé (C’est un bon médecin)'),
    b('Contrast general reactions (C’est vrai) with impersonal il est + adj + de / que and time/day rules', 'Distinguer réactions générales (C’est vrai), tournures il est + adj + de/que, heures et jours'),
  ],
};

const C = 'gr-cest-il-est-nuances';

const lessons: Lesson[] = [
  lesson(
    C,
    1,
    ['identifying-vs-describing', 'c-est-identifier-vs-il-est-decrire'],
    b('Identifying with c’est vs. describing with il est', 'Identifier avec c’est ou décrire avec il est'),
    b('Use c’est / ce sont before determiners, names, and pronouns; use il est / elle est before bare adjectives, nationalities, and professions.', 'Utilisez c’est / ce sont devant un déterminant, un nom propre ou un pronom ; utilisez il est / elle est devant un adjectif seul, une nationalité ou une profession sans article.'),
    [
      b('Put c’est / ce sont before nouns with an article, possessive, or demonstrative', 'Employer c’est / ce sont devant un nom précédé d’un déterminant'),
      b('Drop the article after il est / elle est for professions and nationalities', 'Supprimer l’article après il est / elle est pour les métiers et nationalités'),
      b('Flip back to c’est as soon as a profession gets an article or adjective', 'Revenir à c’est dès qu’un métier prend un article ou un adjectif'),
    ],
    13,
    [
      card(
        b('The determiner rule: c’est vs. il est', 'La règle du déterminant : c’est vs il est'),
        b(
          'Look at what follows the verb **être**. If there is a **determiner + noun** (*un, une, des, le, mon, ce*), a **proper name**, or a **stressed pronoun**, use **c’est** (plural **ce sont**). If you are describing a specific person or thing with a **bare adjective**, **nationality**, or **bare profession** (no article!), use **il est / elle est / ils sont / elles sont**.\nTriggers for c’est: **un livre, mon voisin, Paul, moi**.\nTriggers for il est: **grand, canadien, médecin, étudiante**.',
          'Regardez ce qui suit le verbe **être**. S’il y a un **déterminant + nom** (*un, une, des, le, mon, ce*), un **nom propre** ou un **pronom tonique**, employez **c’est** (pluriel **ce sont**). Si vous décrivez une personne ou une chose précise avec un **adjectif seul**, une **nationalité** ou une **profession sans article**, employez **il est / elle est / ils sont / elles sont**.\nDéclencheurs de c’est : **un livre, mon voisin, Paul, moi**.\nDéclencheurs de il est : **grand, canadien, médecin, étudiante**.',
        ),
        {
          table: {
            head: [b('What follows?', 'Ce qui suit'), b('Structure', 'Structure'), b('Example', 'Exemple')],
            rows: [
              [b('Determiner + noun', 'Déterminant + nom'), 'c’est / ce sont', 'C’est une bonne idée. / Ce sont mes clés.'],
              [b('Proper name / stressed pronoun', 'Nom propre / pronom'), 'c’est', 'C’est Nadia. / C’est moi !'],
              [b('Bare adjective (specific subject)', 'Adjectif seul (sujet précis)'), 'il / elle est', 'Regarde ce sac : il est léger.'],
              [b('Bare profession / nationality', 'Métier / nationalité sans article'), 'il / elle est', 'Elle est architecte. Il est suisse.'],
            ],
          },
          ex: [
            ['Voici Karim : il est journaliste et il est tunisien.', 'Here is Karim: he is a journalist and he is Tunisian.'],
            ['C’est un collègue très fiable.', 'He is a very reliable colleague.'],
            ['Ce sont les étudiants de ma classe de français.', 'They are the students from my French class.'],
          ],
        },
      ),
      trap(
        b('Add an article or adjective → switch back to c’est!', 'Ajoutez un article ou adjectif → passez à c’est !'),
        b(
          'Compare these two sentences side by side: **Elle est avocate.** (no article → *elle est*) vs. **C’est une avocate brillante.** (article *une* + adjective → *c’est*!). Never write *Elle est une avocate* or *Il est un ami*.\nBare profession: **il est serveur, elle est ingénieure, ils sont médecins**.\nWith article: **c’est un bon serveur, c’est une ingénieure, ce sont des médecins**.',
          'Comparez ces deux phrases : **Elle est avocate.** (sans article → *elle est*) contre **C’est une avocate brillante.** (article *une* + adjectif → *c’est* !). N’écrivez jamais *Elle est une avocate* ni *Il est un ami*.\nMétier sans article : **il est serveur, elle est ingénieure, ils sont médecins**.\nAvec article : **c’est un bon serveur, c’est une ingénieure, ce sont des médecins**.',
        ),
      ),
      mc(
        P.form,
        ['C’est', 'Il est', 'Elle est', 'Ce sont'],
        {
          fr: 'Je vous présente Antoine : ___ un ami d’enfance.',
          explain: b('Because un ami includes the determiner un, you must use C’est.', 'Comme un ami comporte le déterminant un, il faut obligatoirement C’est.'),
        },
      ),
      mc(
        P.choose,
        [
          'Ma voisine ? Elle est pharmacienne.',
          'Ma voisine ? C’est pharmacienne.',
          'Ma voisine ? Elle est une pharmacienne.',
          'Ma voisine ? Ce sont pharmacienne.',
        ],
        {
          explain: b('Bare profession with no article uses elle est (Elle est pharmacienne).', 'Une profession employée sans article demande elle est (Elle est pharmacienne).'),
        },
      ),
      gap(
        P.complete,
        'Voici Camille et Léo : ___ mes cousins. Camille, ___ graphiste, mais Léo, ___ un étudiant en musique. Leur studio ? ___ très lumineux.',
        [['ce sont'], ['elle est'], ['c’est'], ['Il est']],
        {
          choices: [
            ['ce sont', 'ils sont', 'c’est'],
            ['elle est', 'c’est', 'il est'],
            ['c’est', 'il est', 'elle est'],
            ['Il est', 'C’est', 'Elle est'],
          ],
        },
      ),
      sort(
        b('Sort each ending by whether it goes after c’est / ce sont or il est / elle est.', 'Classez chaque suite selon qu’elle va après c’est / ce sont ou il est / elle est.'),
        ['c’est / ce sont', 'il est / elle est'],
        [
          ['un bon professeur', 0],
          ['professeur', 1],
          ['mes lunettes', 0],
          ['belge', 1],
          ['très patiente', 1],
          ['Madame Martin', 0],
        ],
      ),
      ord(
        P.order,
        'C’est une excellente musicienne, mais elle est timide.',
        {
          tr: 'She is an excellent musician, but she is shy.',
          extra: ['sont'],
        },
      ),
      dict('Voici mes voisins : ce sont des retraités, mais ils sont très actifs.'),
      say('Elle est cuisinière : c’est une vraie passionnée !', 'She is a chef: she is a true enthusiast!'),
    ],
    [
      b('Use c’est / ce sont before determiner + noun, proper names, and stressed pronouns.', 'Utilisez c’est / ce sont devant déterminant + nom, nom propre et pronom tonique.'),
      b('Use il / elle est + bare adjective, nationality, or profession without an article.', 'Utilisez il / elle est + adjectif seul, nationalité ou métier sans article.'),
      b('Once a profession has an article (un/une) or modifier, switch to c’est.', 'Dès que le métier prend un article ou un adjectif, passez à c’est.'),
    ],
    [
      ['un ami d’enfance', b('childhood friend', 'ami depuis le jeune âge')],
      ['fiable', b('reliable', 'sur qui on peut compter')],
      ['le retraité / la retraitée', b('retiree', 'personne qui ne travaille plus après sa carrière')],
      ['timide', b('shy', 'réservé avec les autres')],
    ],
  ),

  lesson(
    C,
    2,
    ['general-judgements-vs-impersonal-il-est', 'c-est-adjectif-vs-il-est-adjectif-de-que'],
    b('C’est + adj vs. Il est + adj + de / que', 'C’est + adjectif vs Il est + adjectif + de / que'),
    b('Separate general reactions (C’est vrai ! C’est dommage.) from formal impersonal sentences introducing de + infinitive or que + clause.', 'Distinguez les réactions générales (C’est vrai ! C’est dommage.) des phrases impersonnelles qui introduisent de + infinitif ou que + proposition.'),
    [
      b('React to a situation or whole idea with c’est + masculine singular adjective', 'Réagir à une situation avec c’est + adjectif masculin singulier'),
      b('Introduce de + infinitive or que + clause with impersonal il est + adj', 'Introduire de + infinitif ou que + proposition avec il est + adjectif'),
      b('Choose between à + infinitive (after specific/c’est reaction) and de + infinitive (anticipatory il est)', 'Choisir entre à + infinitif et de + infinitif selon la structure'),
    ],
    13,
    [
      card(
        b('General reaction vs. impersonal il est', 'Réaction générale vs il est impersonnel'),
        b(
          'To react to an idea, event, or previous sentence, French uses **c’est + masculine singular adjective** (*C’est vrai !*, *C’est génial !*, *C’est facile à faire*). Never say *Il est vrai !* on its own! On the other hand, when **il est + adjective** acts as an **impersonal opener** announcing what comes NEXT (**de + infinitive** or **que + clause**), French favors **il est**—especially in signs, rules, and formal prose (*Il est important de vérifier*, *Il est possible qu’il neige*).\nGeneral reactions: **c’est vrai, c’est super, c’est dommage**.\nImpersonal openers: **il est important de, il est interdit de, il est possible que**.',
          'Pour réagir à une idée, un fait ou une phrase précédente, le français emploie **c’est + adjectif masculin singulier** (*C’est vrai !*, *C’est génial !*, *C’est facile à faire*). Ne dites jamais *Il est vrai !* tout seul ! En revanche, quand **il est + adjectif** sert de **tournure impersonnelle** qui annonce la suite (**de + infinitif** ou **que + proposition**), le français privilégie **il est**, surtout dans les règles et à l’écrit (*Il est important de vérifier*, *Il est possible qu’il neige*).\nRéactions générales : **c’est vrai, c’est super, c’est dommage**.\nTournures impersonnelles : **il est important de, il est interdit de, il est possible que**.',
        ),
        {
          table: {
            head: [b('Function', 'Fonction'), b('Structure', 'Structure'), b('Example', 'Exemple')],
            rows: [
              [b('Reaction to a situation/idea', 'Réaction à une situation'), 'c’est + masc. sg. adj.', 'Tu pars déjà ? C’est dommage !'],
              [b('Specific person/object', 'Personne ou objet précis'), 'il / elle est + agreed adj.', 'Ce livre ? Il est passionnant !'],
              [b('Impersonal rule + infinitive', 'Règle + infinitif'), 'il est + adj. + de + inf.', 'Il est interdit de stationner ici.'],
              [b('Impersonal clause', 'Proposition annoncée'), 'il est + adj. + que…', 'Il est clair que nous devons agir.'],
            ],
          },
          ex: [
            ['Le musée est fermé aujourd’hui ? C’est dommage !', 'The museum is closed today? That is a shame!'],
            ['Il est indispensable de réserver à l’avance.', 'It is essential to book in advance.'],
            ['Cette recette ? Elle est très simple à préparer.', 'This recipe? It is very simple to prepare.'],
          ],
        },
      ),
      tip(
        b('À + infinitive vs. de + infinitive', 'À + infinitif ou de + infinitif ?'),
        b(
          'Notice the tiny preposition clue! When the infinitive refers **back** to an already-named noun (*Ce texte est facile **à** lire* or *C’est difficile **à** expliquer*), use **à**. When impersonal **il est** announces an infinitive **ahead**, use **de** (*Il est facile **de** lire ce texte*, *Il est utile **de** noter*).\nBack-reference à: **facile à lire, prêt à partir, bon à savoir**.\nForward il est de: **facile de comprendre, interdit de fumer, utile de noter**.',
          'Observez l’indice de la préposition ! Quand l’infinitif renvoie à un élément **déjà mentionné** (*Ce texte est facile **à** lire* ou *C’est difficile **à** expliquer*), employez **à**. Quand **il est** impersonnel annonce l’infinitif **qui suit**, employez **de** (*Il est facile **de** lire ce texte*, *Il est utile **de** noter*).\nRenvoi avec à : **facile à lire, prêt à partir, bon à savoir**.\nAnnonce avec de : **facile de comprendre, interdit de fumer, utile de noter**.',
        ),
      ),
      mc(
        b('Someone tells you a piece of good news. How do you react naturally?', 'On vous annonce une bonne nouvelle. Comment réagissez-vous naturellement ?'),
        [
          'Il arrive demain ? C’est super !',
          'Il arrive demain ? Il est super !',
          'Il arrive demain ? Ce sont super !',
          'Il arrive demain ? Elle est super !',
        ],
        {
          explain: b('Reacting to a whole event or statement uses c’est + masculine singular adjective (C’est super !).', 'Réagir à un événement ou une phrase entière se fait avec c’est + adjectif masculin singulier.'),
        },
      ),
      mc(
        P.form,
        ['Il est interdit de', 'C’est interdit à', 'Il est interdit à', 'Elle est interdite de'],
        {
          fr: 'Dans le parc, ___ marcher sur la pelouse.',
          explain: b('Official notices introducing an infinitive take impersonal Il est + adj + de.', 'Les règles et panneaux introduisant un infinitif emploient la tournure impersonnelle Il est + adjectif + de.'),
        },
      ),
      hear(
        'Tu as trouvé ce roman intéressant ? — Oui, il est court, mais il est vraiment émouvant.',
        b('Why does the speaker say il est instead of c’est here?', 'Pourquoi la personne dit-elle il est au lieu de c’est ici ?'),
        [
          b('She is describing the specific noun ce roman (masculine).', 'Elle décrit le nom précis ce roman (masculin).'),
          b('She is giving a general rule about reading.', 'Elle formule une règle générale sur la lecture.'),
          b('She is introducing a new verb with de.', 'Elle introduit un infinitif avec de.'),
        ],
      ),
      gap(
        P.complete,
        'Cette lettre ? Elle est difficile ___ comprendre ! ___ vrai que l’écriture est petite, donc ___ important ___ relire lentement.',
        [['à'], ['Il est'], ['il est'], ['de']],
        {
          choices: [
            ['à', 'de', 'pour'],
            ['Il est', 'C’est', 'Elle est'],
            ['il est', 'c’est', 'elle est'],
            ['de', 'à', 'que'],
          ],
        },
      ),
      pairs(
        b('Match each French starter with the ending that fits its grammar.', 'Associez chaque début de phrase à la suite grammaticale qui lui correspond.'),
        [
          ['Il est nécessaire', 'de confirmer votre présence.'],
          ['Il est évident', 'que ce train va partir à l’heure.'],
          ['Ce problème est', 'simple à résoudre.'],
          ['Tu viens avec nous ?', 'C’est parfait !'],
        ],
        true,
      ),
      ord(
        P.order,
        'Il est essentiel de vérifier les horaires avant de partir.',
        {
          tr: 'It is essential to check the schedule before leaving.',
          extra: ['c’est'],
        },
      ),
      dict('C’est dommage, mais il est impossible de changer le billet aujourd’hui.'),
    ],
    [
      b('React to a situation or whole idea with c’est + masculine singular adjective (C’est vrai, C’est dommage).', 'Réagissez à une situation ou idée avec c’est + adjectif masculin singulier (C’est vrai, C’est dommage).'),
      b('Use impersonal il est + adjective + de + infinitive or que + clause for rules and formal statements.', 'Utilisez il est + adjectif + de + infinitif ou que + proposition pour les règles et constats formels.'),
      b('Use à after an adjective pointing back (facile à lire); use de after impersonal il est pointing ahead (il est facile de lire).', 'Employez à quand on renvoie en arrière (facile à lire) et de quand il est annonce l’infinitif (il est facile de lire).'),
    ],
    [
      ['la pelouse', b('lawn / grass', 'espace couvert d’herbe')],
      ['émouvant / émouvante', b('moving / touching', 'qui touche les émotions')],
      ['indispensable', b('essential / indispensable', 'absolument nécessaire')],
      ['résoudre', b('to solve', 'trouver la solution à un problème')],
    ],
  ),

  lesson(
    C,
    3,
    ['cest-il-est-in-real-a2-contexts', 'c-est-et-il-est-en-contexte-a2'],
    b('Time, dates & real A2 nuances', 'L’heure, la date et les nuances au niveau A2'),
    b('Master the time-vs-day contrast (Il est huit heures vs. C’est lundi), plural ce sont, and all A2 c’est / il est choices in context.', 'Maîtrisez le contraste heure vs jour (Il est huit heures vs C’est lundi), le pluriel ce sont et tous les choix c’est / il est en contexte A2.'),
    [
      b('Express clock time with il est and days/dates with c’est', 'Dire l’heure avec il est et les jours ou dates avec c’est'),
      b('Use ce sont in standard French before plural nouns', 'Employer ce sont en français standard devant un nom pluriel'),
      b('Combine all c’est vs. il est rules smoothly in conversation and writing', 'Combiner toutes les nuances c’est / il est à l’oral comme à l’écrit'),
    ],
    13,
    [
      card(
        b('Time, days, plurals & review', 'Heures, jours, pluriel et synthèse'),
        b(
          'Two more high-frequency rules complete the picture! **Clock time** always uses **il est** (*Il est huit heures*, *Il est midi*), NEVER *C’est huit heures*. **Days, dates, and seasons** as present identifiers take **c’est** (*C’est lundi*, *C’est le 14 juillet*, *C’est l’été*). Before plural nouns or pronouns, standard French uses **ce sont** (*Ce sont mes collègues*), though casual speech often keeps *c’est*.\nWith il est: **Il est midi, Il est dix heures, Il est tôt**.\nWith c’est / ce sont: **C’est mardi, C’est le 8 mai, Ce sont eux**.',
          'Deux dernières règles très fréquentes complètent l’ensemble ! **L’heure** prend toujours **il est** (*Il est huit heures*, *Il est midi*), JAMAIS *C’est huit heures*. **Les jours, dates et saisons** prennent **c’est** (*C’est lundi*, *C’est le 14 juillet*, *C’est l’été*). Devant un nom ou pronom pluriel, le français soigné emploie **ce sont** (*Ce sont mes collègues*), même si l’oral familier garde parfois *c’est*.\nAvec il est : **Il est midi, Il est dix heures, Il est tôt**.\nAvec c’est / ce sont : **C’est mardi, C’est le 8 mai, Ce sont eux**.',
        ),
        {
          table: {
            head: [b('Context', 'Contexte'), b('Form', 'Forme'), b('Example', 'Exemple')],
            rows: [
              [b('Clock time', 'Heure'), 'il est', 'Il est quinze heures vingt.'],
              [b('Day / date / holiday', 'Jour / date / fête'), 'c’est', 'C’est mercredi. C’est Noël.'],
              [b('Plural identifier', 'Nom / pronom pluriel'), 'ce sont', 'Ce sont de bonnes nouvelles.'],
              [b('Time judgement', 'Appréciation du moment'), 'il est (tôt / tard)', 'Dépêchons-nous, il est tard !'],
            ],
          },
          ex: [
            ['Dépêche-toi, il est déjà huit heures moins dix !', 'Hurry up, it is already ten to eight!'],
            ['Aujourd’hui, c’est vendredi : la semaine est presque finie.', 'Today is Friday: the week is almost over.'],
            ['Ce sont des amis que j’ai connus à Montréal.', 'They are friends whom I met in Montreal.'],
          ],
        },
      ),
      trap(
        b('Hour = il est, Day = c’est, Tard = il est', 'Heure = il est, Jour = c’est, Tard = il est'),
        b(
          'Even though both translate “It is…”, French splits **Il est neuf heures** (clock time) and **Il est tard** (early/late) from **C’est lundi** (calendar day) and **C’est le 10 juin** (date). Watch out for plural subjects too: say **Ce sont mes parents**, not *Ils sont mes parents*.\nNever mix up: **Il est midi, C’est jeudi, Ce sont mes amis**.',
          'Même si tout commence par « It is… » en anglais, séparez bien **Il est neuf heures** et **Il est tard** de **C’est lundi** et **C’est le 10 juin**. Attention aussi au pluriel : dites **Ce sont mes parents**, jamais *Ils sont mes parents*.\nRepères sûrs : **Il est midi, C’est jeudi, Ce sont mes amis**.',
        ),
      ),
      mc(
        P.choose,
        [
          'Il est dix-huit heures, et c’est déjà vendredi !',
          'C’est dix-huit heures, et il est déjà vendredi !',
          'Il est dix-huit heures, et il est déjà vendredi !',
          'C’est dix-huit heures, et c’est déjà vendredi !',
        ],
        {
          explain: b('Clock time takes il est (Il est dix-huit heures), while calendar days take c’est (c’est vendredi).', 'L’heure prend il est (Il est dix-huit heures) et le jour de la semaine prend c’est (c’est vendredi).'),
        },
      ),
      mc(
        P.best,
        [
          'Ce sont les valises de nos invités.',
          'Elles sont les valises de nos invités.',
          'Ils sont les valises de nos invités.',
          'Il est les valises de nos invités.',
        ],
        {
          explain: b('Before determiner + plural noun (les valises), use ce sont.', 'Devant déterminant + nom pluriel (les valises), utilisez ce sont.'),
        },
      ),
      gap(
        P.complete,
        'Regarde ta montre : ___ midi ! Aujourd’hui, ___ jeudi, donc la banque ferme tôt. Tu connais ces deux personnes ? — Oui, ___ des chercheurs : ___ canadiens.',
        [['il est'], ['c’est'], ['ce sont'], ['ils sont']],
        {
          choices: [
            ['il est', 'c’est', 'elle est'],
            ['c’est', 'il est', 'ce sont'],
            ['ce sont', 'ils sont', 'c’est'],
            ['ils sont', 'ce sont', 'c’est'],
          ],
        },
      ),
      sort(
        b('Sort each expression by whether it uses il est / elle est / ils sont or c’est / ce sont.', 'Classez chaque expression selon qu’elle emploie il/elle est / ils sont ou c’est / ce sont.'),
        ['il est / ils sont', 'c’est / ce sont'],
        [
          ['dix heures trente', 0],
          ['samedi soir', 1],
          ['important de dormir', 0],
          ['une belle photo', 1],
          ['ingénieurs', 0],
          ['mes collègues', 1],
        ],
      ),
      ord(
        P.order,
        'Ce sont des exercices faciles à faire le matin.',
        {
          tr: 'These are easy exercises to do in the morning.',
          extra: ['ils'],
        },
      ),
      dlg(
        b('Before the morning meeting', 'Avant la réunion du matin'),
        b('Claire and Samir check the time and talk about a new teammate.', 'Claire et Samir vérifient l’heure et parlent d’une nouvelle collègue.'),
        [['Claire', 'f'], ['Samir', 'm']],
        [
          [0, 'Quelle heure est-il ? On commence bientôt ?', 'What time is it? Are we starting soon?'],
          [1, {
            options: [
              'Il est neuf heures moins cinq. D’ailleurs, c’est aujourd’hui qu’arrive Sofia !',
              'C’est neuf heures moins cinq. D’ailleurs, il est aujourd’hui qu’arrive Sofia !',
              'Il est neuf heures moins cinq. D’ailleurs, elle est aujourd’hui qu’arrive Sofia !',
            ],
          }],
          [0, 'Sofia ? Elle fait quoi exactement ?', 'Sofia? What does she do exactly?'],
          [1, {
            options: [
              'Elle est analyste, et c’est une spécialiste très appréciée.',
              'C’est analyste, et elle est une spécialiste très appréciée.',
              'Elle est une analyste, et il est une spécialiste très appréciée.',
            ],
          }],
          [0, {
            options: [
              'Chouette ! Il est toujours agréable d’accueillir quelqu’un de nouveau.',
              'Chouette ! Elle est toujours agréable d’accueillir quelqu’un de nouveau.',
              'Chouette ! Ce sont toujours agréable d’accueillir quelqu’un de nouveau.',
            ],
          }],
        ],
      ),
      dict('Il est vingt heures : c’est l’heure du journal, et ce sont mes émissions préférées.'),
      write(
        b('Introduce a colleague and give an opinion.', 'Présentez un collègue et donnez votre avis.'),
        b('Write 4–5 sentences stating the day and clock time (c’est / il est), introducing someone with bare profession/nationality (il/elle est) and a determiner+noun (c’est), and adding one impersonal judgement (il est important de or c’est + adj).', 'Écrivez 4 ou 5 phrases en donnant le jour et l’heure (c’est / il est), en présentant quelqu’un avec un métier ou une nationalité sans article puis avec un déterminant (c’est un/une…), et en ajoutant un jugement (il est important de ou c’est + adjectif).'),
        38,
        65,
        [
          b('Give both the day (c’est) and the hour (il est)', 'Indiquer le jour (c’est) et l’heure (il est)'),
          b('Contrast il/elle est + bare profession/nationality with c’est + determiner + noun', 'Opposer il/elle est + métier/nationalité sans article et c’est + déterminant + nom'),
          b('Include il est + adj + de or c’est + adj reaction', 'Inclure il est + adjectif + de ou une réaction en c’est + adjectif'),
        ],
        'C’est vendredi et il est neuf heures du matin. Je vous présente Karim. Il est ingénieur et il est marocain. C’est un collègue très patient et c’est une personne brillante. Dans ce métier, il est important d’écouter l’équipe, mais c’est parfois difficile de tout finir vite.',
      ),
    ],
    [
      b('Use il est for clock time (Il est midi) and early/late (Il est tard); use c’est for days and dates (C’est mardi).', 'Employez il est pour l’heure (Il est midi) et tôt/tard ; employez c’est pour les jours et dates (C’est mardi).'),
      b('Use ce sont before plural nouns and stressed pronouns in standard French.', 'Utilisez ce sont devant les noms et pronoms pluriels en français standard.'),
      b('Always check whether a determiner follows être before choosing c’est or il est.', 'Vérifiez toujours la présence d’un déterminant après être pour choisir c’est ou il est.'),
    ],
    [
      ['la montre', b('wristwatch', 'objet au poignet pour lire l’heure')],
      ['moins cinq', b('five to (the hour)', 'cinq minutes avant l’heure')],
      ['l’émission (f.)', b('TV / radio show', 'programme diffusé à la radio ou à la télé')],
      ['le chercheur', b('researcher', 'personne qui fait de la recherche')],
    ],
  ),
];

export default lessons;
