import type { CourseAbout, Lesson } from '../../types';
import { b, card, dict, dlg, doc, gap, hear, lesson, mc, ord, P, pairs, say, sort, tip, trap, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Il est difficile de répondre or c’est difficile à expliquer? Fier de toi, prêt à partir, aimable envers tous. Choosing the right preposition after an adjective is one of the surest markers of natural B1 French. This course clears up the classic il est … de vs c’est … à distinction, maps feelings and habits with de and à, and contrasts pour, envers and bon à / bon pour / bon en.',
    'Il est difficile de répondre ou c’est difficile à expliquer ? Fier de toi, prêt à partir, aimable envers tous. Choisir la juste préposition après un adjectif est l’un des signes les plus nets d’un français naturel au niveau B1. Ce cours clarifie l’opposition il est … de / c’est … à, classe les adjectifs courants avec de et à, et distingue pour, envers et bon à / bon pour / bon en.',
  ),
  outcomes: [
    b('Choose accurately between il est + adj. + de and c’est / ce nom est + adj. + à', 'Choisir avec précision entre il est + adj. + de et c’est / ce nom est + adj. + à'),
    b('Pair key feelings, capabilities and responsibilities with de (fier de, capable de)', 'Associer sentiments, aptitudes et responsabilités à de (fier de, capable de)'),
    b('Use readiness, habit and utility adjectives with à (prêt à, habitué à, utile à)', 'Employer les adjectifs de disposition, d’habitude et d’utilité avec à'),
    b('Express attitude and benefit cleanly with envers, pour and bon à / pour / en', 'Exprimer attitude et bénéfice avec envers, pour et bon à / pour / en'),
  ],
};

const C = 'gr-adjectives-prepositions';

const lessons: Lesson[] = [
  lesson(C, 1, ['il-est-de-vs-cest-a', 'il-est-de-ou-cest-a'],
    b('Il est difficile de… vs C’est difficile à…', 'Il est difficile de… ou C’est difficile à… ?'),
    b('Know when an infinitive takes de (impersonal il est) and when it takes à (specific subject or c’est).', 'Sachez quand l’infinitif demande de (tournure impersonnelle il est) et quand il prend à (sujet précis ou c’est).'),
    [
      b('Build impersonal sentences with il est + adjective + de + infinitive', 'Construire des tournures impersonnelles avec il est + adjectif + de + infinitif'),
      b('Describe a noun or c’est as easy/hard to act on using à + infinitive', 'Qualifier un nom ou c’est avec à + infinitif'),
      b('Avoid mixing *il est facile à* or *ce livre est facile de*', 'Éviter les mélanges *il est facile à* ou *ce livre est facile de*'),
    ],
    13,
    [
      card(b('Two distinct frames: il est … de vs c’est … à', 'Deux cadres distincts : il est … de ou c’est … à'), b('When **il** is an empty impersonal pronoun introducing an action that comes **after**, use **de**: *Il est difficile de lire ce contrat.* When **c’est** or a specific **noun** refers to the **object** of the infinitive, use **à**: *Ce contrat est difficile à lire.* / *C’est difficile à lire.*\nImpersonal de: **il est utile de, il est possible de, il est urgent de**.\nSpecific object à: **c’est facile à, ce texte est simple à, une règle facile à retenir**.', 'Quand **il** est un sujet impersonnel neutre qui annonce l’action située **après**, employez **de** : *Il est difficile de lire ce contrat.* Quand **c’est** ou un **nom précis** représente l’objet sur lequel porte l’action, employez **à** : *Ce contrat est difficile à lire.* / *C’est difficile à lire.*\nImpersonnel en de : **il est utile de, il est possible de, il est urgent de**.\nObjet précis en à : **c’est facile à, ce texte est simple à, une règle facile à retenir**.'), {
        table: {
          head: [b('Frame', 'Cadre'), b('Preposition', 'Préposition'), b('Example', 'Exemple')],
          rows: [
            ['Il est + adj. + inf. (+ objet)', 'de / d’', 'Il est difficile de comprendre cette loi.'],
            ['Ce nom est + adj. + inf.', 'à', 'Cette loi est difficile à comprendre.'],
            ['C’est + adj. + inf. (referring back)', 'à', 'Cette loi ? C’est difficile à comprendre !'],
            ['Il est + adj. + de (moral/polite)', 'de', 'Il est gentil de nous prévenir.'],
          ],
        },
        ex: [
          ['Il est essentiel de vérifier les horaires avant de partir.', 'It is essential to check the timetable before leaving.'],
          ['Ces horaires sont parfois compliqués à déchiffrer.', 'These timetables are sometimes complicated to decipher.'],
          ['Votre explication est très claire et agréable à suivre.', 'Your explanation is very clear and pleasant to follow.'],
        ],
      }),
      trap(b('Spoken c’est … de vs standard c’est … à', 'À l’oral : c’est … de contre c’est … à'), b('In casual speech, people say **C’est gentil de venir** when **ce** introduces an idea that follows (*= Il est gentil de venir*). Yet whenever an object precedes or is implied (*Ce plat ? C’est long à cuire.*), **à** is mandatory—and **il est + adj. + à** is NEVER correct!\nAlways right: **Il est facile d’oublier ce détail.**\nAlways right: **Ce détail est facile à oublier.**', 'À l’oral, on entend **C’est gentil de venir** quand **ce** annonce une action à suivre (*= Il est gentil de venir*). Mais dès qu’un objet est repris ou qualifié (*Ce plat ? C’est long à cuire.*), **à** est obligatoire — et **il est + adj. + à** est toujours faux !\nToujours juste : **Il est facile d’oublier ce détail.**\nToujours juste : **Ce détail est facile à oublier.**')),
      mc(P.word, ['à', 'de', 'pour', 'par'], { fr: 'Ce problème technique semble presque impossible ___ résoudre.', explain: b('Ce problème is the object of résoudre, so a specific noun + adjective takes à.', 'Ce problème est l’objet de résoudre : nom précis + adjectif demande à.') }),
      hear('Il est parfois difficile de refuser une invitation sans blesser ses amis.', P.meaning, [
        b('Saying no to an invitation kindly can be hard.', 'Refuser une invitation sans vexer peut être délicat.'),
        b('Friends are hard to invite.', 'Les amis sont difficiles à inviter.'),
        b('It is impossible to accept any invitation.', 'Il est impossible d’accepter une invitation.'),
      ]),
      sort(b('Which preposition fits each blank?', 'Quelle préposition complète chaque début ?'), [
        b('de / d’ (impersonal il est)', 'de / d’ (tournure impersonnelle il est)'),
        b('à (specific noun / c’est referring back)', 'à (nom précis / c’est de reprise)'),
      ], [
        ['Il est important ___ réserver.', 0],
        ['Cette valise est lourde ___ porter.', 1],
        ['Il est prudent ___ attendre.', 0],
        ['Un numéro facile ___ retenir', 1],
        ['Il est interdit ___ fumer ici.', 0],
        ['Cette chanson est douce ___ écouter.', 1],
      ]),
      gap(P.complete, 'Il est indispensable ___ (de / à) relire ce dossier, même si certaines annexes sont longues ___ (de / à) parcourir.', [['de'], ['à']], {
        choices: [
          ['de', 'à', 'pour'],
          ['à', 'de', 'en'],
        ],
      }),
      pairs(P.match, [
        ['Il est facile d’apprendre.', b('It is easy to learn (general).', 'L’apprentissage en soi est facile.')],
        ['C’est facile à apprendre.', b('That (specific skill) is easy to learn.', 'Cet élément précis s’apprend facilement.')],
        ['prêt à partir', b('ready to leave', 'disposé à partir maintenant')],
        ['urgent de réagir', b('urgent to react', 'nécessaire d’agir vite')],
      ]),
      ord(P.order, 'Il est toujours utile de noter les consignes importantes.', {
        tr: b('It is always useful to write down important instructions.', 'Il est toujours utile de prendre en note les consignes importantes.'),
        extra: ['à', 'pour'],
      }),
      dlg(b('Setting up the new printer', 'Installer la nouvelle imprimante'), b('Yanis helps Eva connect an office printer.', 'Yanis aide Éva à brancher une imprimante de bureau.'), [['Éva', 'f2'], ['Yanis', 'm']], [
        [0, 'Je n’y arrive pas ! Ce mode d’emploi est impossible à comprendre.', 'I can’t manage it! This manual is impossible to understand.'],
        [1, { options: ['Attends, il est plus simple de passer par le câble au début.', 'Attends, il est plus simple à passer par le câble.', 'Attends, ce câble est simple de brancher.'], explain: b('Il est + adj. always takes de + infinitive (il est plus simple de).', 'Il est + adj. demande toujours de + infinitif (il est plus simple de).') }],
        [0, 'Tu as raison, comme ça c’est tout de suite plus facile à configurer !', 'You’re right, this way it’s immediately easier to set up!'],
      ]),
      dict('Il est préférable de partir tôt, car cette route est difficile à emprunter de nuit.'),
      say('Ce formulaire est rapide à remplir, mais il est essentiel de vérifier chaque date.', 'This form is quick to fill in, yet it is essential to check every date.'),
    ],
    [
      b('Il est + adjective + de + infinitive introduces the action (empty impersonal il).', 'Il est + adjectif + de + infinitif introduit l’action (il impersonnel).'),
      b('Noun (or c’est referring to it) + adjective + à + infinitive describes what is acted on.', 'Nom (ou c’est de reprise) + adjectif + à + infinitif qualifie l’objet de l’action.'),
      b('Never write *il est difficile à* or *ce livre est facile de*.', 'N’écrivez jamais *il est difficile à* ni *ce livre est facile de*.'),
    ],
    [
      ['il est difficile de', b('it is hard to (general action)', 'il est malaisé de (tournure impersonnelle)')],
      ['difficile à', b('hard to (specific object)', 'malaisé à (objet précis)')],
      ['agréable à lire', b('pleasant to read', 'plaisant à lire')],
      ['indispensable de', b('essential to', 'absolument nécessaire de')],
    ],
  ),

  lesson(C, 2, ['adjectives-with-de-and-a', 'adjectifs-avec-de-et-a'],
    b('Adjectives with de & à: fier de, capable de, prêt à, habitué à', 'Adjectifs avec de et à : fier de, capable de, prêt à, habitué à'),
    b('Group high-frequency B1 adjectives by meaning so you pick de or à naturally.', 'Regroupez les adjectifs fréquents par sens pour choisir de ou à avec naturel.'),
    [
      b('Use de with feelings, pride, capacity and responsibility', 'Employer de avec les sentiments, la fierté, la capacité et la responsabilité'),
      b('Use à with readiness, habit, attention and utility', 'Employer à avec la préparation, l’habitude, l’attention et l’utilité'),
      b('Contract de/à with le/les and replace complements with en or y', 'Contracter de/à avec le/les et pronominaliser par en ou y'),
    ],
    13,
    [
      card(b('De vs à: meaning families', 'De ou à : grandes familles de sens'), b('Most adjective prepositions follow clear semantic logic:\n- **de** marks the **source or cause** of a feeling, ability or duty.\n- **à** marks **orientation toward** a goal, habit, sensitivity or benefit.\nWith de: **fier de, content de, capable de, responsable de, sûr de**.\nWith à: **prêt à, habitué à, attentif à, sensible à, utile à**.', 'La plupart des prépositions après un adjectif suivent une logique claire :\n- **de** indique l’**origine ou la cause** d’un sentiment, d’une aptitude ou d’une charge.\n- **à** indique une **direction vers** un objectif, une habitude, une sensibilité ou un effet.\nAvec de : **fier de, content de, capable de, responsable de, sûr de**.\nAvec à : **prêt à, habitué à, attentif à, sensible à, utile à**.'), {
        table: {
          head: [b('Preposition', 'Préposition'), b('Core idea', 'Idée centrale'), b('Key adjectives', 'Adjectifs clés'), b('Example', 'Exemple')],
          rows: [
            ['de', b('Feelings & reactions', 'Sentiments et réactions'), 'content, fier, ravi, déçu, surpris', 'Je suis très fier de tes progrès.'],
            ['de', b('Ability & duty', 'Capacité et devoir'), 'capable, incapable, responsable, sûr', 'Elle est responsable du suivi client.'],
            ['à', b('Readiness & habit', 'Préparation et habitude'), 'prêt, disposé, habitué, opposé', 'Nous sommes prêts à signer.'],
            ['à', b('Sensitivity & use', 'Sensibilité et utilité'), 'attentif, sensible, utile, nuisible', 'Ce guide est utile aux débutants.'],
          ],
        },
        ex: [
          ['Es-tu vraiment sûr de ton choix ?', 'Are you really sure about your choice?'],
          ['Mon chat n’est pas habitué au bruit des feux d’artifice.', 'My cat isn’t used to the noise of fireworks.'],
          ['L’équipe est attentive à toutes vos remarques.', 'The team is attentive to all your comments.'],
        ],
      }),
      tip(b('Pronouns: en replaces de + thing; y replaces à + thing', 'Pronoms : en pour de + chose ; y pour à + chose'), b('Don’t forget contractions (**du, des, au, aux**) before masculine/plural nouns! When replacing a non-human phrase, **de + chose → en** (*Tu es fier de ce projet ? Oui, j’en suis fier.*) and **à + chose → y** (*Tu es habitué au froid ? Oui, j’y suis habitué.*). For a person, keep **de lui / à lui**.\nWith de → en: **j’en suis sûr, j’en suis ravi, elle en est capable**.\nWith à → y: **j’y suis prêt, nous y sommes habitués, j’y suis favorable**.', 'N’oubliez pas les contractions (**du, des, au, aux**) devant un nom masculin ou pluriel ! Pour remplacer une chose, **de + chose → en** (*Tu es fier de ce projet ? Oui, j’en suis fier.*) et **à + chose → y** (*Tu es habitué au froid ? Oui, j’y suis habitué.*). Pour une personne, gardez **de lui / à elle**.\nAvec de → en : **j’en suis sûr, j’en suis ravi, elle en est capable**.\nAvec à → y : **j’y suis prêt, nous y sommes habitués, j’y suis favorable**.')),
      mc(P.word, ['de', 'à', 'en', 'pour'], { fr: 'Malgré la pression, il s’est montré tout à fait capable ___ gérer la crise.' }),
      mc(P.word, ['aux', 'des', 'les', 'en'], { fr: 'Les habitants du quartier sont très favorables ___ nouveaux aménagements piétons.', explain: b('favorable à + les = favorable aux.', 'favorable à + les donne favorable aux.') }),
      sort(b('Sort each adjective by preposition: de or à.', 'Classez chaque adjectif : avec de ou avec à ?'), [
        b('Takes de (fier, capable, responsable…)', 'Prend de (fier, capable, responsable…)'),
        b('Takes à (prêt, habitué, utile…)', 'Prend à (prêt, habitué, utile…)'),
      ], [
        ['ravi ___', 0],
        ['habitué ___', 1],
        ['sûr ___', 0],
        ['prêt ___', 1],
        ['déçu ___', 0],
        ['sensible ___', 1],
      ]),
      gap(P.complete, 'Je suis très content ___ (de / à) mon nouveau poste. Au début, je n’étais pas habitué ___ (à le / au) rythme matinal, mais j’___ (en / y) suis habitué maintenant !', [['de'], ['au'], ['y']], {
        choices: [
          ['de', 'à', 'pour'],
          ['au', 'à le', 'du'],
          ['y', 'en', 'lui'],
        ],
      }),
      pairs(P.match, [
        ['responsable du projet', b('in charge of the project', 'chargé de la conduite du projet')],
        ['opposé à cette idée', b('opposed to this idea', 'en désaccord avec cette idée')],
        ['reconnaissant de votre aide', b('grateful for your help', 'plein de gratitude pour votre aide')],
        ['nuisible à la santé', b('harmful to health', 'mauvais pour la santé')],
      ]),
      ord(P.order, 'Mes collègues sont vraiment fiers de leur réussite collective.', {
        tr: b('My colleagues are truly proud of their collective achievement.', 'Mes collègues sont très fiers de leur succès commun.'),
        extra: ['à', 'aux'],
      }),
      dict('Elle est très attentive aux détails et capable de résoudre des pannes complexes.'),
      say('Nous sommes prêts à commencer dès que vous en serez sûrs.', 'We are ready to start as soon as you are sure about it.'),
    ],
    [
      b('de goes with feelings (fier, content, déçu), ability (capable) and duty (responsable, sûr).', 'de accompagne sentiments (fier, content, déçu), capacité (capable) et devoir (responsable, sûr).'),
      b('à goes with readiness (prêt), habit (habitué), attention (attentif, sensible) and benefit (utile, nuisible).', 'à accompagne préparation (prêt), habitude (habitué), attention (attentif, sensible) et effet (utile, nuisible).'),
      b('Use en for de + thing (j’en suis sûr) and y for à + thing (j’y suis habitué).', 'Employez en pour de + chose (j’en suis sûr) et y pour à + chose (j’y suis habitué).'),
    ],
    [
      ['fier de', b('proud of', 'satisfait avec fierté de')],
      ['capable de', b('capable of', 'en mesure de')],
      ['prêt à', b('ready to', 'préparé pour')],
      ['habitué à', b('used to', 'accoutumé à')],
      ['sensible à', b('sensitive / responsive to', 'touché par')],
    ],
  ),

  lesson(C, 3, ['pour-envers-attitude-adjectives', 'pour-et-envers-attitudes'],
    b('Envers, pour & bon à / bon pour / bon en', 'Envers, pour et bon à / bon pour / bon en'),
    b('Describe how people treat others with envers, express suitability with pour, and master the three sides of bon.', 'Décrivez les attitudes humaines avec envers, l’utilité avec pour et maîtrisez les trois constructions de bon.'),
    [
      b('Use envers for attitudes and behavior directed toward people', 'Employer envers pour les attitudes morales tournées vers autrui'),
      b('Use pour for beneficiaries, purpose and health or practical effects', 'Employer pour pour le bénéficiaire, le but et les effets pratiques'),
      b('Distinguish bon à, bon pour and bon en accurately', 'Distinguer avec précision bon à, bon pour et bon en'),
    ],
    13,
    [
      card(b('Envers (attitudes) vs pour (effects & targets)', 'Envers (attitudes) ou pour (effets et cibles) ?'), b('Use **envers** (or conversational **avec**) for how someone behaves toward another person or group: **aimable, poli, juste, sévère, généreux, indulgent**. Use **pour** when naming who benefits, suffers an effect, or has enough of something.\nMoral attitude (envers): **aimable envers, sévère envers, juste envers, reconnaissant envers**.\nEffect or adequacy (pour): **bon pour la santé, dangereux pour, suffisant pour, idéal pour**.', 'Employez **envers** (ou **avec** à l’oral) pour qualifier le comportement moral à l’égard de quelqu’un : **aimable, poli, juste, sévère, généreux, indulgent**. Employez **pour** pour indiquer le bénéficiaire, l’effet produit ou la suffisance.\nAttitude morale (envers) : **aimable envers, sévère envers, juste envers, reconnaissant envers**.\nEffet ou mesure (pour) : **bon pour la santé, dangereux pour, suffisant pour, idéal pour**.'), {
        table: {
          head: [b('Preposition', 'Préposition'), b('Use', 'Emploi'), b('Example', 'Exemple')],
          rows: [
            ['envers', b('Attitude toward someone', 'Comportement envers autrui'), 'Ce professeur est exigeant mais juste envers ses élèves.'],
            ['pour', b('Effect / adequacy', 'Effet / adéquation'), 'Ce trajet est trop long pour un enfant.'],
            ['bon à + inf.', b('Fit / worth doing', 'Propre à subir / valoir'), 'Ce vieux canapé est bon à jeter.'],
            ['bon pour + nom', b('Beneficial / valid for', 'Bénéfique / valable pour'), 'La marche rapide est bonne pour le cœur.'],
            ['bon en + matière', b('Skilled at a subject', 'Doué dans une discipline'), 'Elle est très bonne en chimie.'],
          ],
        },
        ex: [
          ['Il s’est toujours montré généreux envers les nouveaux arrivants.', 'He has always been generous toward newcomers.'],
          ['C’est une info bonne à savoir avant le départ.', 'That’s a useful piece of information to know before leaving.'],
          ['Un peu de calme serait bon pour toute l’équipe.', 'A bit of quiet would be good for the whole team.'],
        ],
      }),
      trap(b('Bon à vs bon pour vs bon en', 'Ne confondez pas bon à, bon pour et bon en !'), b('In English, “good” translates three ways! **Bon à + infinitif** means fit for an action (**bon à savoir, bon à manger**). **Bon pour + nom** means healthy or beneficial for someone (**bon pour le moral**). **Bon en + domaine** means skilled at a subject (**bon en langues** — never *bon à*!).\nSubject skill: **bon en mathématiques, fort en histoire, doué en dessin**.', 'L’anglais emploie *good* partout, mais le français sépare trois prépositions ! **Bon à + infinitif** indique l’aptitude à une action (**bon à savoir, bon à manger**). **Bon pour + nom** exprime le bienfait (**bon pour le moral**). **Bon en + domaine** indique une compétence (**bon en langues** — jamais *bon à* !).\nCompétence : **bon en mathématiques, fort en histoire, doué en dessin**.')),
      mc(P.word, ['envers', 'à', 'pour', 'de'], { fr: 'Même quand elle est pressée, la directrice reste toujours aimable ___ le personnel.', explain: b('Aimable envers expresses polite behavior toward people.', 'Aimable envers exprime une attitude polie à l’égard des personnes.') }),
      doc({
        look: 'letter',
        title: b('Letter of recommendation', 'Lettre de recommandation'),
        text: 'Madame, Monsieur,\n\nDurant son stage, Karim Benali s’est montré attentif aux attentes des clients et toujours patient envers les stagiaires plus jeunes.\nIl est particulièrement bon en gestion de projet et capable de mener une réunion seul.\nSa rigueur a été précieuse pour notre service.',
      }, b('Why does the manager use envers and en in this letter?', 'Pourquoi la responsable emploie-t-elle envers et en dans cette lettre ?'), [
        b('envers describes his attitude toward colleagues; en names his skill area', 'envers décrit son attitude envers ses collègues ; en désigne son domaine de compétence'),
        b('envers means “against”; en means “inside a room”', 'envers signifie « contre » ; en indique un lieu physique'),
        b('Both express a negative criticism', 'Les deux expriment un reproche'),
      ]),
      sort(b('Sort by preposition: envers, pour, or en.', 'Classez par préposition : envers, pour ou en ?'), [
        b('envers (attitude toward people)', 'envers (attitude envers des personnes)'),
        b('pour (benefit, danger, suitability)', 'pour (bienfait, danger, mesure)'),
        b('en (school subject / skill area)', 'en (matière / domaine de compétence)'),
      ], [
        ['sévère ___ ses enfants', 0],
        ['dangereux ___ les yeux', 1],
        ['doué ___ informatique', 2],
        ['tolérant ___ les erreurs', 0],
        ['suffisant ___ quatre personnes', 1],
        ['bon ___ orthographe', 2],
      ]),
      gap(P.complete, 'Nager le matin est excellent ___ la santé, même si je ne suis pas encore très bon ___ brasse. Mon coach reste toujours patient ___ moi.', [['pour'], ['en'], ['envers']], {
        choices: [
          ['pour', 'envers', 'en'],
          ['en', 'à', 'pour'],
          ['envers', 'en', 'à'],
        ],
      }),
      pairs(P.match, [
        ['c’est bon à savoir', b('that’s good to know', 'c’est une information utile')],
        ['bon pour le moral', b('good for morale', 'bénéfique pour le moral')],
        ['bon en géographie', b('good at geography', 'compétent en géographie')],
        ['indulgent envers quelqu’un', b('lenient toward someone', 'compréhensif à l’égard de quelqu’un')],
      ]),
      ord(P.order, 'Il est parfois trop sévère envers lui-même !', {
        tr: b('He is sometimes too hard on himself!', 'Il se montre parfois trop sévère à son propre égard !'),
        extra: ['en', 'de'],
      }),
      dlg(b('Choosing an evening activity', 'Choisir une activité du soir'), b('Amélie and Bastien talk about joining a choir.', 'Amélie et Bastien parlent de rejoindre une chorale.'), [['Amélie', 'f'], ['Bastien', 'm2']], [
        [0, 'Tu devrais venir à la chorale ce soir, c’est vraiment bon pour évacuer le stress !', 'You should come to choir tonight, it’s really good for releasing stress!'],
        [1, { options: ['Je veux bien essayer, même si je ne suis pas très bon en solfège. La cheffe est patiente envers les débutants ?', 'Je ne suis pas bon à solfège, elle est sévère pour les débutants ?'], explain: b('Skill in a discipline takes bon en; attitude toward people takes envers.', 'La maîtrise d’une discipline prend bon en ; l’attitude envers des personnes prend envers.') }],
        [0, 'Oui, elle est adorable envers tout le monde et les morceaux sont faciles à suivre.', 'Yes, she’s lovely toward everyone and the pieces are easy to follow.'],
      ]),
      write(
        b('Write a short personal profile.', 'Rédigez un court portrait personnel.'),
        b('Describe yourself or someone you admire in 3–4 sentences using: il est … de or c’est … à, one de/à adjective (fier de, habitué à…), envers, and bon en or bon pour.', 'Décrivez-vous ou décrivez une personne admirée en 3 à 4 phrases avec : il est … de ou c’est … à, un adjectif en de/à (fier de, habitué à…), envers, et bon en ou bon pour.'),
        28, 60,
        [
          b('Include il est + adj. + de or c’est + adj. + à', 'Inclure il est + adj. + de ou c’est … à'),
          b('Include a de/à adjective correctly', 'Utiliser justement un adjectif avec de ou à'),
          b('Use envers and bon en / bon pour', 'Employer envers et bon en / bon pour'),
        ],
        'Ma sœur Léa est très bonne en cuisine et toujours généreuse envers ses voisins. Il est facile de travailler avec elle, car elle reste attentive aux détails. Elle est particulièrement fière de son potager, qui est excellent pour le moral de toute la famille.',
        { phrases: ['il est … de…', 'attentif à / fier de…', 'envers…', 'bon en / bon pour…'] },
      ),
    ],
    [
      b('envers introduces a moral or polite attitude toward people (aimable envers, sévère envers).', 'envers exprime une attitude morale ou polie tournée vers autrui (aimable envers, sévère envers).'),
      b('pour marks the beneficiary, health effect, danger or adequacy (bon pour, suffisant pour).', 'pour indique le bénéficiaire, l’effet ou la mesure (bon pour, suffisant pour).'),
      b('bon à + infinitive (worth/fit doing), bon pour + noun (healthy/good for), bon en + domain (skilled at).', 'bon à + infinitif (bon à savoir), bon pour + nom (bénéfique), bon en + domaine (doué).'),
    ],
    [
      ['aimable envers', b('kind / polite toward', 'bienveillant à l’égard de')],
      ['sévère envers', b('strict / harsh toward', 'exigeant avec')],
      ['bon à savoir', b('good to know', 'utile à retenir')],
      ['bon en + matière', b('good at (a subject)', 'doué dans une matière')],
    ],
  ),
];

export default lessons;
