import type { CourseAbout, Lesson } from '../../types';
import { P, b, card, dict, dlg, gap, hear, lesson, mc, ord, pairs, say, sort, tip, trap, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Je veux partir, je commence à comprendre, j’ai décidé d’essayer. In English, "to" appears before almost every second verb; in French, verbs split into three clear families: zero preposition, à, or de. This course helps you sort the most useful A2 verbs into each pattern and avoid mix-ups like penser à vs penser de or jouer à vs jouer de.',
    'Je veux partir, je commence à comprendre, j’ai décidé d’essayer. En français, le premier verbe commande la suite : rien du tout, la préposition à, ou la préposition de. Ce cours classe les verbes les plus utiles du niveau A2 dans chaque famille et lève les confusions classiques comme penser à / penser de ou jouer à / jouer de.',
  ),
  outcomes: [
    b('Chain verbs directly without à or de when no preposition is needed', 'Enchaîner directement un verbe et un infinitif sans préposition'),
    b('Use à and de accurately before an infinitive (réussir à, décider de, oublier de)', 'Employer à et de correctement devant un infinitif (réussir à, décider de, oublier de)'),
    b('Choose à or de before noun objects (penser à/de, s’occuper de, jouer à/du)', 'Choisir à ou de devant un nom (penser à/de, s’occuper de, jouer à/du)'),
  ],
};

const C = 'gr-prepositions-de-a';

const lessons: Lesson[] = [
  lesson(C, 1, ['verb-plus-infinitive-direct', 'verbe-sans-preposition'],
    b('Direct link: verb + infinitive with no preposition', 'Lien direct : verbe + infinitif sans préposition'),
    b('Vouloir, pouvoir, devoir, espérer, aimer, aller: the verbs that connect straight to an infinitive.', 'Vouloir, pouvoir, devoir, espérer, aimer, aller : les verbes suivis directement de l’infinitif.'),
    [
      b('Link modals, feelings and plans straight to an infinitive', 'Relier directement les verbes modaux, de goût et de projet à l’infinitif'),
      b('Avoid adding English-style à or de where French uses nothing', 'Éviter d’ajouter à ou de là où le français n’en met pas'),
      b('Place negation cleanly around the first conjugated verb', 'Placer la négation autour du premier verbe conjugué'),
    ],
    13,
    [
      card(
        b('Verb + Ø + infinitive', 'Verbe + Ø + infinitif'),
        b(
          'A huge group of everyday verbs goes straight into the infinitive with **no preposition** at all. Conjugate the first verb and leave the second in its dictionary form.\n\nModals: **vouloir, pouvoir, devoir, savoir**.\nFeelings: **aimer, adorer, préférer, détester**.\nPlans and movement: **espérer, compter, aller, venir**.',
          'Un grand nombre de verbes courants s’enchaînent directement à l’infinitif **sans aucune préposition**. On conjugue le premier verbe et on laisse le second à l’infinitif.\n\nModaux : **vouloir, pouvoir, devoir, savoir**.\nGoûts : **aimer, adorer, préférer, détester**.\nProjets et mouvement : **espérer, compter, aller, venir**.',
        ),
        {
          ex: [
            ['J’espère partir en Bretagne vendredi matin.', 'I hope to leave for Brittany on Friday morning.'],
            ['Nous préférons rester ici ce soir.', 'We prefer to stay here tonight.'],
          ],
        },
      ),
      trap(
        b('Do not translate English "to" as à or de!', 'N’ajoutez ni à ni de après ces verbes !'),
        b(
          'English writes *want to, hope to, prefer to*, which tempts learners to insert **à** or **de**. In French, say **je veux partir**, **j’espère réussir**, **il pense déménager** (when **penser** + infinitive means "to plan to"). Negation wraps only the first verb: **Je ne peux pas venir**.\n\nNo preposition: **vouloir partir, espérer réussir, penser voyager**.\nPerception verbs: **voir arriver, entendre chanter, regarder jouer**.',
          'Ne traduisez pas le « to » anglais par **à** ou **de** : on dit **je veux partir**, **j’espère réussir**, **il pense déménager** (au sens d’avoir l’intention de). La négation entoure seulement le premier verbe : **Je ne peux pas venir**.\n\nSans préposition : **vouloir partir, espérer réussir, penser voyager**.\nVerbes de perception : **voir arriver, entendre chanter, regarder jouer**.',
        ),
        {
          ex: [
            ['Elle compte changer de travail l’année prochaine.', 'She plans to change jobs next year.'],
            ['J’entends les voisins parler dans le couloir.', 'I hear the neighbours talking in the corridor.'],
          ],
        },
      ),
      mc(P.form, ['j’espère trouver', 'j’espère à trouver', 'j’espère de trouver', 'j’espère pour trouver'], {
        fr: 'Bientôt, ___ un appartement près du parc.',
      }),
      mc(P.form, ['préfère prendre', 'préfère à prendre', 'préfère de prendre', 'préfère prendre à'], {
        fr: 'Quand il pleut, il ___ le métro plutôt que le vélo.',
      }),
      gap(P.complete, 'Nous ___ (vouloir / partir) tôt, mais je ___ (ne pas pouvoir / finir) ce dossier ce soir. Tu ___ (compter / venir) demain ?', [['voulons partir'], ['ne peux pas finir'], ['comptes venir']]),
      ord(P.order, 'Ils espèrent pouvoir visiter le musée dimanche matin.', {
        tr: 'They hope to be able to visit the museum on Sunday morning.',
        extra: ['de', 'à'],
      }),
      pairs(
        b('Match each French expression with its meaning.', 'Associez chaque expression française à son sens.'),
        [
          ['elle compte partir', b('she plans to leave', 'elle a l’intention de partir')],
          ['il sait nager', b('he knows how to swim', 'il est capable de nager')],
          ['nous osons demander', b('we dare to ask', 'nous avons le courage de demander')],
          ['je pense rentrer', b('I plan to head home', 'j’envisage de rentrer')],
        ],
      ),
      hear('Je ne veux pas déranger, je vais juste déposer les clés sur la table.', b('What is the speaker going to do?', 'Que va faire la personne ?'), [
        b('Just leave the keys on the table without disturbing', 'Juste poser les clés sur la table sans déranger'),
        b('Wait inside until everyone comes back', 'Attendre à l’intérieur le retour de tout le monde'),
        b('Ask a neighbour to keep the keys', 'Demander à un voisin de garder les clés'),
      ]),
      dict('Nous devons partir à huit heures si nous voulons attraper le premier train.'),
      say('J’espère pouvoir vous voir la semaine prochaine.', 'I hope to be able to see you next week.'),
    ],
    [
      b('Modals, taste verbs, plans (espérer, compter, penser) and perception verbs take NO preposition.', 'Les verbes modaux, de goût, de projet (espérer, compter, penser) et de perception ne prennent pas de préposition.'),
      b('Conjugate only the first verb and put ne… pas around it: je ne veux pas partir.', 'On conjugue seulement le premier verbe et on l’entoure avec ne… pas : je ne veux pas partir.'),
      b('Penser + infinitive means "to plan / intend to" (Je pense partir demain).', 'Penser + infinitif signifie « avoir l’intention de » (Je pense partir demain).'),
    ],
    [
      ['compter + inf.', b('to plan to, intend to', 'avoir l’intention de')],
      ['oser + inf.', b('to dare to', 'avoir le courage de')],
      ['attraper le train', b('to catch the train', 'monter dans le train à temps')],
    ],
  ),

  lesson(C, 2, ['verb-plus-a-infinitive', 'verbe-plus-a-infinitif'],
    b('Verb + à + infinitive: starting, learning, succeeding', 'Verbe + à + infinitif : commencer, apprendre, réussir'),
    b('The core verbs that connect to an infinitive with à—and how to add a person in between.', 'Les principaux verbes construits avec à + infinitif — et ceux qui prennent d’abord une personne.'),
    [
      b('Master high-frequency verb + à + infinitive pairs', 'Maîtriser les principaux verbes suivis de à + infinitif'),
      b('Use aider / inviter / encourager quelqu’un à faire quelque chose', 'Employer aider / inviter / encourager quelqu’un à faire quelque chose'),
      b('Spot the difference between commencer à and hésiter à', 'Employer avec aisance commencer à, réussir à et hésiter à'),
    ],
    13,
    [
      card(
        b('Verbs followed by à + infinitive', 'Les verbes suivis de à + infinitif'),
        b(
          'Many verbs dealing with starting, continuing, effort, learning or hesitation need **à** before an infinitive.\n\nStart and continue: **commencer à, continuer à, se mettre à**.\nEffort and success: **réussir à, arriver à, chercher à**.\nLearning and habit: **apprendre à, hésiter à, s’habituer à**.',
          'De nombreux verbes liés au début, à la durée, à l’effort, à l’apprentissage ou à l’hésitation demandent **à** devant l’infinitif.\n\nDébut et suite : **commencer à, continuer à, se mettre à**.\nEffort et réussite : **réussir à, arriver à, chercher à**.\nApprentissage : **apprendre à, hésiter à, s’habituer à**.',
        ),
        {
          table: {
            head: [b('Verb + à', 'Verbe + à'), b('Meaning', 'Sens'), b('Example', 'Exemple')],
            rows: [
              ['commencer à', b('to start to', 'débuter'), 'Il commence à pleuvoir.'],
              ['réussir à / arriver à', b('to manage to', 'parvenir à'), 'J’arrive enfin à dormir.'],
              ['apprendre à', b('to learn to', 'acquérir un savoir-faire'), 'Elle apprend à conduire.'],
              ['hésiter à', b('to hesitate to', 'ne pas se décider tout de suite'), 'N’hésite pas à appeler !'],
              ['s’habituer à', b('to get used to', 'prendre l’habitude de'), 'Je m’habitue à vivre ici.'],
            ],
          },
          ex: [
            ['Nous commençons à comprendre cette règle.', 'We are starting to understand this rule.'],
            ['Tu as réussi à ouvrir la porte ?', 'Did you manage to open the door?'],
          ],
        },
      ),
      tip(
        b('Person + à + infinitive', 'Quelqu’un + à + infinitif'),
        b(
          'Several social verbs take a **person** first, then **à + infinitive**: **aider quelqu’un à**, **inviter quelqu’un à**, **encourager quelqu’un à**, **autoriser quelqu’un à**. Also remember **passer du temps à** and **s’amuser à**.\n\nWith a person: **aider Paul à déménager, inviter Léa à dîner, encourager les élèves à parler**.',
          'Plusieurs verbes prennent d’abord une **personne**, puis **à + infinitif** : **aider quelqu’un à**, **inviter quelqu’un à**, **encourager quelqu’un à**, **autoriser quelqu’un à**. Retenez aussi **passer du temps à** et **s’amuser à**.\n\nAvec une personne : **aider Paul à déménager, inviter Léa à dîner, encourager les élèves à parler**.',
        ),
        {
          ex: [
            ['Elle m’aide à préparer le dîner ce soir.', 'She is helping me make dinner tonight.'],
            ['Nous passons le dimanche à cuisiner ensemble.', 'We spend Sunday cooking together.'],
          ],
        },
      ),
      mc(P.form, ['à comprendre', 'de comprendre', 'comprendre', 'pour comprendre'], {
        fr: 'Peu à peu, je commence ___ les journaux français.',
      }),
      mc(P.form, ['à ouvrir', 'd’ouvrir', 'ouvrir', 'en ouvrir'], {
        fr: 'Il n’arrive pas ___ ce bocal de confiture.',
      }),
      gap(P.complete, 'Tu m’aides ___ (à / ranger) le salon ? J’ai invité mes cousins ___ (à / déjeuner) et j’ai appris ___ (à / faire) des crêpes.', [['à ranger'], ['à déjeuner'], ['à faire']], {
        choices: [['à ranger', 'de ranger', 'ranger'], ['à déjeuner', 'de déjeuner', 'déjeuner'], ['à faire', 'de faire', 'faire']],
      }),
      ord(P.order, 'N’hésitez pas à me poser vos questions !', {
        tr: 'Don’t hesitate to ask me your questions!',
        extra: ['de', 'pour'],
      }),
      sort(
        b('Direct (Ø) or with à?', 'Sans préposition (Ø) ou avec à ?'),
        [b('Verb + Ø + infinitive', 'Verbe + Ø + infinitif'), b('Verb + à + infinitive', 'Verbe + à + infinitif')],
        [['vouloir', 0], ['réussir', 1], ['espérer', 0], ['hésiter', 1], ['compter', 0], ['apprendre', 1]],
      ),
      hear('Après trois mois à Montréal, je commence enfin à m’habituer au froid.', b('What is changing for the speaker?', 'Qu’est-ce qui change pour la personne ?'), [
        b('They are starting to get used to the cold', 'Elle commence enfin à s’habituer au froid'),
        b('They are planning to leave Montreal soon', 'Elle compte bientôt quitter Montréal'),
        b('They have forgotten how cold winter is', 'Elle a oublié le froid de l’hiver'),
      ]),
      dict('Elle passe deux heures par jour à apprendre à jouer du violon.'),
      say('Merci beaucoup de m’aider à porter ces valises !', 'Thank you very much for helping me carry these suitcases!'),
    ],
    [
      b('Use à before an infinitive after commencer, continuer, réussir, arriver, apprendre, hésiter, s’habituer.', 'Employez à devant l’infinitif après commencer, continuer, réussir, arriver, apprendre, hésiter, s’habituer.'),
      b('Aider / inviter / encourager + person + à + infinitive.', 'Aider / inviter / encourager + personne + à + infinitif.'),
      b('Passer du temps à + infinitive means "to spend time doing something".', 'Passer du temps à + infinitif signifie « consacrer du temps à faire quelque chose ».'),
    ],
    [
      ['parvenir à', b('to manage to, succeed in', 'réussir après un effort')],
      ['se mettre à', b('to start, set about', 'commencer soudainement ou activement')],
      ['un bocal', b('a jar', 'un récipient en verre avec couvercle')],
    ],
  ),

  lesson(C, 3, ['verb-plus-de-infinitive', 'verbe-plus-de-infinitif'],
    b('Verb + de + infinitive: deciding, trying, forgetting', 'Verbe + de + infinitif : décider, essayer, oublier'),
    b('The large family of verbs with de + infinitive, including demander à quelqu’un de and venir de.', 'La grande famille des verbes suivis de de + infinitif, y compris demander à quelqu’un de et venir de.'),
    [
      b('Use de (or d’) accurately after décider, essayer, oublier, finir, refuser', 'Employer de (ou d’) après décider, essayer, oublier, finir, refuser'),
      b('Combine indirect person + de + infinitive (demander à, dire à, conseiller à)', 'Construire demander à / dire à / conseiller à quelqu’un de faire'),
      b('Use avoir besoin / envie / peur de and venir de naturally', 'Utiliser avoir besoin / envie / peur de et venir de'),
    ],
    13,
    [
      card(
        b('Verbs followed by de + infinitive', 'Les verbes suivis de de + infinitif'),
        b(
          'Decisions, attempts, stopping, forgetting and many feelings take **de** (or **d’** before a vowel or silent h) before an infinitive.\n\nDecisions and attempts: **décider de, essayer de, choisir de, refuser de, accepter de**.\nStopping and memory: **finir de, arrêter de, oublier de, regretter de**.\nExpressions with avoir/être: **avoir besoin de, avoir envie de, avoir peur de, être content de**.',
          'Les verbes de décision, de tentative, d’arrêt, d’oubli et de sentiment demandent **de** (ou **d’** devant une voyelle ou un h muet) devant l’infinitif.\n\nDécisions et essais : **décider de, essayer de, choisir de, refuser de, accepter de**.\nArrêt et mémoire : **finir de, arrêter de, oublier de, regretter de**.\nAvec avoir ou être : **avoir besoin de, avoir envie de, avoir peur de, être content de**.',
        ),
        {
          table: {
            head: [b('Verb + de', 'Verbe + de'), b('Meaning', 'Sens'), b('Example', 'Exemple')],
            rows: [
              ['décider de', b('to decide to', 'prendre une décision'), 'Nous avons décidé de partir.'],
              ['essayer de', b('to try to', 'tenter'), 'J’essaie d’arriver à l’heure.'],
              ['oublier de', b('to forget to', 'ne pas penser à'), 'N’oublie pas de fermer à clé !'],
              ['arrêter de / finir de', b('to stop / finish doing', 'cesser / terminer'), 'Il a fini de travailler.'],
              ['venir de', b('to have just done', 'passé récent'), 'Le train vient de partir.'],
            ],
          },
          ex: [
            ['J’ai envie de prendre un grand bol d’air.', 'I feel like getting some fresh air.'],
            ['Elle a accepté de nous prêter son appartement.', 'She agreed to lend us her flat.'],
          ],
        },
      ),
      trap(
        b('Demander à quelqu’un de faire… (both prepositions!)', 'Demander à quelqu’un de faire… (les deux prépositions !)'),
        b(
          'When asking, telling or advising someone to do something, French uses **à** before the person AND **de** before the infinitive: **demander à Paul de venir**, **dire aux enfants de se calmer**, **conseiller à mon ami de réserver**. Never mix up **décider de** and **essayer de** with **à**!\n\nTwo-preposition verbs: **demander à … de, dire à … de, conseiller à … de, promettre à … de**.',
          'Quand on demande, dit ou conseille à quelqu’un de faire quelque chose, le français utilise **à** devant la personne ET **de** devant l’infinitif : **demander à Paul de venir**, **dire aux enfants de se calmer**, **conseiller à mon ami de réserver**. Ne dites jamais « décider à » ni « essayer à » !\n\nDouble préposition : **demander à … de, dire à … de, conseiller à … de, promettre à … de**.',
        ),
      ),
      mc(P.form, ['d’ouvrir', 'à ouvrir', 'ouvrir', 'pour ouvrir'], {
        fr: 'Avant de sortir, n’oublie pas ___ la fenêtre cinq minutes.',
      }),
      mc(P.form, ['de déménager', 'à déménager', 'déménager', 'en déménager'], {
        fr: 'Finalement, ils ont décidé ___ à Toulouse cet été.',
      }),
      gap(P.complete, 'Le médecin conseille ___ (à / ma mère) ___ (de / marcher) chaque jour. Moi, je viens ___ (d’ / appeler) la pharmacie.', [['à ma mère'], ['de marcher'], ['d’appeler']], {
        choices: [['à ma mère', 'de ma mère'], ['de marcher', 'à marcher', 'marcher'], ['d’appeler', 'à appeler', 'appeler']],
      }),
      ord(P.order, 'J’ai demandé au serveur de nous apporter de l’eau.', {
        tr: 'I asked the waiter to bring us some water.',
        extra: ['à', 'pour'],
      }),
      pairs(
        b('Match each verb phrase with its meaning.', 'Associez chaque tournure à son sens.'),
        [
          ['je viens d’arriver', b('I have just arrived', 'je suis arrivé il y a un instant')],
          ['elle refuse d’attendre', b('she refuses to wait', 'elle ne veut pas attendre')],
          ['nous essayons de comprendre', b('we are trying to understand', 'nous faisons l’effort de comprendre')],
          ['il regrette d’avoir parlé', b('he regrets having spoken', 'il est désolé d’avoir parlé')],
        ],
      ),
      hear('La voisine m’a demandé de garder son chat pendant le week-end.', b('What did the neighbour ask?', 'Qu’a demandé la voisine ?'), [
        b('To look after her cat over the weekend', 'De garder son chat pendant le week-end'),
        b('To water her plants on Monday', 'D’arroser ses plantes lundi'),
        b('To move her car before Friday', 'De déplacer sa voiture avant vendredi'),
      ]),
      dict('Nous avons fini de dîner et nous avons décidé de rentrer à pied.'),
      say('Essaie de dormir tôt ce soir, tu as besoin de te reposer.', 'Try to go to sleep early tonight, you need to rest.'),
    ],
    [
      b('Use de/d’ after décider, essayer, oublier, finir, arrêter, refuser, accepter, avoir envie/besoin.', 'Employez de/d’ après décider, essayer, oublier, finir, arrêter, refuser, accepter, avoir envie/besoin.'),
      b('Venir de + infinitive expresses the recent past: je viens de finir.', 'Venir de + infinitif exprime le passé récent : je viens de finir.'),
      b('Asking/advising someone: demander/dire/conseiller à quelqu’un de + infinitive.', 'Pour demander ou conseiller : demander/dire/conseiller à quelqu’un de + infinitif.'),
    ],
    [
      ['refuser de', b('to refuse to', 'dire non à une proposition')],
      ['promettre de', b('to promise to', 'donner sa parole de')],
      ['prendre un bol d’air', b('to get some fresh air', 'sortir respirer dehors')],
    ],
  ),

  lesson(C, 4, ['verbs-with-a-or-de-objects', 'verbes-avec-a-ou-de'],
    b('Verbs with à or de + nouns: penser à, s’occuper de, jouer à/de', 'Verbes avec à ou de + nom : penser à, s’occuper de, jouer à/de'),
    b('Same verb, different preposition—and everyday verbs that lock onto à or de before a noun.', 'Même verbe, préposition différente — et les verbes courants qui exigent à ou de devant un nom.'),
    [
      b('Contrast penser à vs penser de, jouer à vs jouer de, manquer à vs manquer de', 'Distinguer penser à / penser de, jouer à / jouer de et manquer à / manquer de'),
      b('Use à + noun verbs (téléphoner à, répondre à, s’intéresser à) and de + noun verbs (s’occuper de, se souvenir de)', 'Employer les verbes en à + nom et en de + nom'),
      b('Contract à/de with le and les automatically (au, aux, du, des)', 'Contracter naturellement à/de avec le et les (au, aux, du, des)'),
    ],
    13,
    [
      card(
        b('One verb, two prepositions, two meanings', 'Un même verbe, deux prépositions, deux sens'),
        b(
          'Before a noun, changing **à** to **de** completely changes the meaning of **penser**, **jouer** and **manquer**.\n\nWith à: **penser à Paul, jouer au tennis, tu me manques**.\nWith de: **penser de ce film, jouer du piano, manquer de temps**.',
          'Devant un nom, passer de **à** à **de** change tout le sens pour **penser**, **jouer** et **manquer**.\n\nAvec à : **penser à Paul, jouer au tennis, tu me manques**.\nAvec de : **penser de ce film, jouer du piano, manquer de temps**.',
        ),
        {
          table: {
            head: [b('With à', 'Avec à'), b('Meaning', 'Sens'), b('With de', 'Avec de'), b('Meaning', 'Sens')],
            rows: [
              ['penser à', b('to think about / remember', 'avoir en tête'), 'penser de', b('to have an opinion on', 'trouver, juger')],
              ['jouer à (+ sport/game)', b('to play a sport or game', 'sport ou jeu'), 'jouer de (+ instrument)', b('to play an instrument', 'instrument de musique')],
              ['manquer à', b('to be missed by', 'causer un manque à'), 'manquer de', b('to lack / run short of', 'ne pas avoir assez de')],
            ],
          },
          ex: [
            ['Qu’est-ce que tu penses de notre nouveau quartier ?', 'What do you think of our new neighbourhood?'],
            ['Le samedi, il joue au foot et sa sœur joue de la guitare.', 'On Saturdays, he plays football and his sister plays the guitar.'],
          ],
        },
      ),
      tip(
        b('Everyday à + noun and de + noun verbs + contractions', 'Verbes courants avec à ou de + contractions'),
        b(
          'Memorise these pairs with their contractions: **à + le → au**, **à + les → aux**, **de + le → du**, **de + les → des**. Notice that **téléphoner à** and **répondre à** take **à** even when English has no preposition!\n\nVerbs with à: **téléphoner à, répondre à, s’intéresser à, ressembler à**.\nVerbs with de: **s’occuper de, se souvenir de, parler de, profiter de**.',
          'Retenez ces verbes avec les contractions : **à + le → au**, **à + les → aux**, **de + le → du**, **de + les → des**. Attention : **téléphoner à** et **répondre à** exigent **à** !\n\nVerbes avec à : **téléphoner à, répondre à, s’intéresser à, ressembler à**.\nVerbes avec de : **s’occuper de, se souvenir de, parler de, profiter de**.',
        ),
        {
          ex: [
            ['Je m’occupe des billets et tu téléphones au restaurant.', 'I’ll take care of the tickets and you call the restaurant.'],
            ['Tu te souviens du nom de cette rue ?', 'Do you remember the name of this street?'],
          ],
        },
      ),
      mc(P.form, ['du piano', 'au piano', 'le piano', 'de piano'], {
        fr: 'Depuis l’enfance, Clara joue très bien ___.',
      }),
      mc(P.form, ['à mon examen', 'de mon examen', 'mon examen', 'sur mon examen'], {
        fr: 'Je suis un peu nerveux parce que je pense souvent ___ de vendredi.',
        explain: b('Penser à = to think about / have on one’s mind.', 'Penser à = avoir à l’esprit.'),
      }),
      gap(P.complete, 'Tu manques ___ (de) patience parfois ! Moi, je m’intéresse ___ (à + le) cinéma et je m’occupe ___ (de + les) inscriptions au club.', [['de'], ['au'], ['des']], {
        choices: [['de', 'à', 'du'], ['au', 'du', 'à'], ['des', 'aux', 'de']],
      }),
      sort(
        b('Sort by required preposition: à or de?', 'Classez selon la préposition demandée : à ou de ?'),
        [b('Takes à (+ au / aux)', 'Prend à (+ au / aux)'), b('Takes de (+ du / des)', 'Prend de (+ du / des)')],
        [['téléphoner ___ directeur', 0], ['s’occuper ___ jardin', 1], ['jouer ___ échecs', 0], ['se souvenir ___ voyage', 1], ['répondre ___ message', 0], ['profiter ___ soleil', 1]],
      ),
      hear('Nous profitons du beau temps pour jouer au tennis avant de rentrer.', b('What are they doing?', 'Que font-ils ?'), [
        b('Making the most of the good weather to play tennis', 'Ils profitent du beau temps pour jouer au tennis'),
        b('Staying indoors to practise the piano', 'Ils restent dedans pour jouer du piano'),
        b('Calling the club to cancel their booking', 'Ils téléphonent au club pour annuler'),
      ]),
      dlg(b('Planning a weekend concert', 'Préparer un week-end musical'), b('Inès and Hugo split up the tasks before Saturday.', 'Inès et Hugo se partagent les préparatifs avant samedi.'), [['Inès', 'f'], ['Hugo', 'm']], [
        [0, 'Qu’est-ce que tu penses du programme de samedi ?', 'What do you think of Saturday’s programme?'],
        [1, { options: ['Je trouve ça super ! Je dois juste téléphoner au bassiste ce soir.', 'Je trouve ça super ! Je dois juste téléphoner le bassiste ce soir.', 'Je trouve ça super ! Je dois juste téléphoner du bassiste ce soir.'], explain: b('Téléphoner takes à (+ le = au).', 'On dit téléphoner à quelqu’un (+ le = au).') }],
        [0, 'D’accord, et qui s’occupe des affiches ?', 'Okay, and who is taking care of the posters?'],
        [1, { options: ['Léa s’en occupe, mais nous manquons encore de chaises pour le public.', 'Léa s’en occupe, mais nous manquons encore à chaises pour le public.', 'Léa s’en occupe, mais nous manquons encore des chaises pour le public.'], explain: b('Manquer de + noun without article means to lack / run short of.', 'Manquer de + nom sans article exprime le manque.') }],
      ]),
      say('Je me souviens très bien du concert où tu jouais de la flûte.', 'I remember very well the concert where you were playing the flute.'),
      write(
        b('Write about your hobbies and plans', 'Décrire vos loisirs et projets'),
        b('Write 40 to 70 words about your hobbies, habits and plans for this week. Include at least one verb with Ø + infinitive, one with à + infinitive, one with de + infinitive, and one with à or de + noun (like jouer à/de or s’occuper de).', 'Écrivez 40 à 70 mots sur vos loisirs, vos habitudes et vos projets de la semaine. Employez au moins un verbe sans préposition + infinitif, un avec à + infinitif, un avec de + infinitif et un avec à ou de + nom (comme jouer à/de ou s’occuper de).'),
        40,
        70,
        [
          b('Correct prepositions before infinitives (Ø, à, de)', 'Prépositions correctes devant l’infinitif (Ø, à, de)'),
          b('Correct à/de + noun contraction (au, aux, du, des)', 'Contractions correctes avec à/de + nom'),
          b('Clear, natural everyday sentences', 'Phrases naturelles et claires'),
        ],
        'Cette semaine, je veux finir de lire un roman policier. Le soir, j’essaie de jouer de la guitare pendant trente minutes, puis je téléphone à mes parents. Samedi matin, je compte aider mon frère à ranger son garage et, l’après-midi, nous allons jouer au tennis si nous avons assez de temps.',
      ),
    ],
    [
      b('penser à = think about; penser de = have an opinion about.', 'penser à = avoir à l’esprit ; penser de = avoir une opinion sur.'),
      b('jouer à (+ sport/game) vs jouer de (+ musical instrument).', 'jouer à (+ sport/jeu) contre jouer de (+ instrument de musique).'),
      b('Remember contractions: à + le/les → au/aux; de + le/les → du/des.', 'Pensez aux contractions : à + le/les → au/aux ; de + le/les → du/des.'),
    ],
    [
      ['s’occuper de', b('to take care of, look after', 'gérer ou prendre soin de')],
      ['se souvenir de', b('to remember', 'garder en mémoire')],
      ['profiter de', b('to make the most of, enjoy', 'tirer parti de')],
    ],
  ),
];

export default lessons;
