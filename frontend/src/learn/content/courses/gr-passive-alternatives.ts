import type { CourseAbout, Lesson } from '../../types';
import { b, card, dict, dlg, doc, gap, hear, lesson, mc, ord, P, pairs, say, sort, tip, trap, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Ce mot s’écrit ainsi, on m’a volé mon vélo, elle s’est fait couper les cheveux. French uses the formal passive (être + past participle) far less often than English, preferring brisk, natural alternatives. This course teaches you the four idiomatic substitutes you hear and read every day: active on, the pronominal passive for inanimate things, se faire + infinitive for services and mishaps, and cleft sentences (c’est … qui / que) for emphasis.',
    'Ce mot s’écrit ainsi, on m’a volé mon vélo, elle s’est fait couper les cheveux. Le français évite souvent le passif lourd avec être + participe passé au profit de tournures beaucoup plus naturelles. Ce cours vous apprend les quatre alternatives idiomatiques du quotidien : le pronom actif on, le passif pronominal pour les objets et les règles générales, se faire + infinitif pour les services ou mésaventures, et la mise en relief avec c’est … qui / que.',
  ),
  outcomes: [
    b('Replace impersonal passives with active on naturally', 'Remplacer naturellement le passif impersonnel par on actif'),
    b('Use the pronominal passive (cela se vend, ce mot s’écrit) on inanimate subjects', 'Employer le passif pronominal (cela se vend, ce mot s’écrit) avec un sujet inanimé'),
    b('Express arranged services and unwelcome outcomes with se faire + infinitive', 'Exprimer services reçus et mésaventures avec se faire + infinitif'),
    b('Highlight the agent or object using clefts (c’est … qui / que) instead of a stiff passive', 'Mettre en relief l’agent ou l’objet avec c’est … qui / que au lieu d’un passif lourd'),
  ],
};

const C = 'gr-passive-alternatives';

const lessons: Lesson[] = [
  lesson(C, 1, ['active-on-and-pronominal-passive', 'on-actif-et-pronominal-passif'],
    b('Active on & pronominal passive (cela se vend bien)', 'On actif et passif pronominal (cela se vend bien)'),
    b('Avoid heavy passives: use active on when the agent is unknown, and se + verb when describing how things work.', 'Évitez les passifs lourds : utilisez on quand l’agent reste vague, et se + verbe pour décrire une règle ou propriété.'),
    [
      b('Turn an agentless passive into active on', 'Transformer un passif sans agent en phrase active avec on'),
      b('Use the pronominal passive on inanimate subjects', 'Utiliser le passif pronominal avec un sujet inanimé'),
      b('Avoid using the pronominal passive with human victims of single events', 'Éviter le passif pronominal pour un événement ponctuel subi par une personne'),
    ],
    13,
    [
      card(b('Two light alternatives to être + past participle', 'Deux alternatives légères à être + participe passé'), b('When no specific agent is named, French normally avoids **est + participe passé**.\n1. **Active on**: use **on** + active verb when someone unknown or people in general act.\n2. **Pronominal passive**: use **se + 3rd person verb** with an **inanimate** subject to describe a general rule, spelling, habit or commercial success.\nActive on: **on parle français, on m’a prévenu, on répare la route**.\nPronominal passive: **cela se dit, ce vin se boit frais, cette veste se vend bien**.', 'Quand aucun agent précis n’est nommé, le français évite souvent **être + participe passé**.\n1. **On actif** : employez **on** + verbe actif quand l’auteur est inconnu ou général.\n2. **Passif pronominal** : employez **se + verbe à la 3e personne** avec un sujet **inanimé** pour énoncer une règle, une orthographe ou un usage courant.\nAvec on : **on parle français, on m’a prévenu, on répare la route**.\nPassif pronominal : **cela se dit, ce vin se boit frais, cette veste se vend bien**.'), {
        table: {
          head: [b('Stiff passive', 'Passif lourd'), b('Natural French', 'Français naturel'), b('Type', 'Procédé')],
          rows: [
            ['Le français est parlé ici.', 'On parle français ici.', b('Active on', 'On actif')],
            ['Mon vélo a été volé.', 'On m’a volé mon vélo.', b('Active on', 'On actif')],
            ['Ce mot est écrit avec deux l.', 'Ce mot s’écrit avec deux l.', b('Pronominal passive', 'Passif pronominal')],
            ['Ces billets sont vendus en ligne.', 'Ces billets se vendent en ligne.', b('Pronominal passive', 'Passif pronominal')],
          ],
        },
        ex: [
          ['Comment se prononce le nom de cette rue ?', 'How is the name of this street pronounced?'],
          ['On nous a demandé d’attendre dans le hall.', 'We were asked to wait in the lobby.'],
          ['Cette soupe se sert très chaude avec du pain grillé.', 'This soup is served piping hot with toast.'],
        ],
      }),
      trap(b('Only for inanimate subjects & general rules!', 'Seulement pour l’inanimé et les règles générales !'), b('Never use **se + verbe** for a single event happening to a person—that turns reflexive or absurd! For “The suspect was arrested”, say **On a arrêté le suspect**, NOT *Le suspect s’est arrêté* (which means he stopped walking!).\nUse active on: **on a arrêté le suspect, on m’a invité, on a annulé le vol**.\nUse pronominal passive: **la porte s’ouvre, la règle s’applique, ce plat se prépare vite**.', 'N’utilisez jamais **se + verbe** pour un événement ponctuel subi par une personne : le sens deviendrait réfléchi ! Pour « Le suspect a été arrêté », dites **On a arrêté le suspect**, jamais *Le suspect s’est arrêté* (qui voudrait dire qu’il a cessé de marcher !).\nAvec on : **on a arrêté le suspect, on m’a invité, on a annulé le vol**.\nPassif pronominal : **la porte s’ouvre, la règle s’applique, ce plat se prépare vite**.')),
      mc(P.best, [
        'Ce fromage se mange surtout à la fin du repas.',
        'Ce fromage se mange lui-même à la fin du repas.',
        'On se mange ce fromage à la fin du repas.',
      ], { fr: 'Comment dire naturellement « This cheese is usually eaten at the end of the meal » ?' }),
      hear('On nous a annoncé ce matin que la salle avait changé.', P.meaning, [
        b('We were told this morning that the room had changed.', 'On nous a prévenus ce matin du changement de salle.'),
        b('We announced the room change ourselves.', 'Nous avons annoncé nous-mêmes le changement de salle.'),
        b('The room closes automatically every morning.', 'La salle se ferme toute seule chaque matin.'),
      ]),
      sort(b('Sort by pattern: active on vs pronominal passive.', 'Classez : on actif ou passif pronominal ?'), [
        b('Active on (human / one-off action)', 'On actif (action humaine / ponctuelle)'),
        b('Pronominal passive (inanimate rule / property)', 'Passif pronominal (objet / règle générale)'),
      ], [
        ['On a déplacé la réunion à jeudi.', 0],
        ['Cette adresse se trouve facilement.', 1],
        ['Ce pull se lave à l’eau froide.', 1],
        ['On m’a volé mon portefeuille.', 0],
        ['La consonne finale ne se prononce pas.', 1],
        ['On sert le petit déjeuner dès sept heures.', 0],
      ]),
      gap(P.complete, 'En français, « hôtel » ___ (s’écrire) avec un accent circonflexe, mais ___ (on — ne pas entendre) le h initial.', [['s’écrit'], ['on n’entend pas']], {
        choices: [
          ['s’écrit', 'écrit', 'se fait écrire'],
          ['on n’entend pas', 'ne s’entend', 'n’entend pas'],
        ],
      }),
      pairs(P.match, [
        ['Cela ne se fait pas.', b('That isn’t done / That’s rude.', 'Ce n’est pas convenable.')],
        ['On m’a conseillé ce livre.', b('I was recommended this book.', 'Quelqu’un m’a recommandé ce livre.')],
        ['Cette porte s’ouvre vers l’extérieur.', b('This door opens outward.', 'Le sens d’ouverture est vers le dehors.')],
        ['Comment cela se dit-il ?', b('How is that said?', 'Quelle est l’expression courante ?')],
      ]),
      ord(P.order, 'Ces produits locaux se vendent très bien au marché.', {
        tr: b('These local products sell very well at the market.', 'Ces produits locaux connaissent un grand succès au marché.'),
        extra: ['sont', 'on'],
      }),
      dlg(b('At the cheese counter', 'À la fromagerie'), b('Marc asks the cheesemonger how to serve a local cheese.', 'Marc demande à la fromagère comment déguster un fromage régional.'), [['Marc', 'm'], ['Fromagère', 'f']], [
        [0, 'Bonjour, comment se prépare ce fromage ? Faut-il le cuire ?', 'Hello, how is this cheese prepared? Does it need to be cooked?'],
        [1, { options: ['Non, il se déguste nature, avec du pain aux noix !', 'Non, on se déguste nature !', 'Non, il s’est arrêté au frais !'], explain: b('Pronominal passive il se déguste describes how the cheese is normally eaten.', 'Le passif pronominal il se déguste indique la manière habituelle de le manger.') }],
        [0, 'Parfait, on m’avait justement conseillé de le goûter.', 'Perfect, I had in fact been advised to try it.'],
      ]),
      dict('Ce mot s’écrit avec un seul trait d’union, mais on l’oublie très souvent.'),
      say('Ce genre de chaussure ne se fabrique presque plus ici.', 'This kind of shoe is hardly made here anymore.'),
    ],
    [
      b('Use active on when an unknown person acts (On m’a volé mon sac).', 'Employez on actif quand l’auteur reste inconnu (On m’a volé mon sac).'),
      b('Use se + 3rd person verb on inanimate nouns for rules, spelling or traits (Ce mot s’écrit…).', 'Employez se + verbe à la 3e personne avec un sujet inanimé pour les règles ou propriétés (Ce mot s’écrit…).'),
      b('Never use a pronominal passive for a human victim of a single event.', 'N’employez jamais le passif pronominal pour une personne subissant un événement ponctuel.'),
    ],
    [
      ['s’écrire', b('to be spelled / written', 'avoir telle orthographe')],
      ['se vendre', b('to be sold / sell well', 'trouver des acheteurs')],
      ['se dire', b('to be said (idiomatic)', 's’employer dans la langue')],
      ['on m’a prévenu', b('I was warned / notified', 'quelqu’un m’a averti')],
    ],
  ),

  lesson(C, 2, ['se-faire-infinitive', 'se-faire-infinitif'],
    b('Se faire + infinitive: services & unpleasant outcomes', 'Se faire + infinitif : services et mésaventures'),
    b('Say “I got my hair cut” or “she got fined” with se faire + infinitive—and keep fait invariable.', 'Dites « je me suis fait couper les cheveux » ou « elle s’est fait verbaliser » avec se faire + infinitif — sans jamais accorder fait.'),
    [
      b('Use se faire + infinitive for arranged services and mishaps', 'Employer se faire + infinitif pour un service ou une mésaventure'),
      b('Keep fait strictly invariable before an infinitive', 'Laisser fait strictement invariable devant un infinitif'),
      b('Contrast faire + infinitive with se faire + infinitive', 'Opposer faire + infinitif à se faire + infinitif'),
    ],
    13,
    [
      card(b('Se faire + infinitive: two opposite moods', 'Se faire + infinitif : deux nuances opposées'), b('With **se faire + infinitif**, the subject does not perform the action directly: either the subject **arranges** a service for themselves, or **suffers** an unpleasant event caused by someone else.\nArranged services: **se faire couper les cheveux, se faire livrer, se faire rembourser**.\nUnwelcome events: **se faire voler, se faire gronder, se faire piéger**.', 'Avec **se faire + infinitif**, le sujet n’exécute pas l’action lui-même : soit il **fait réaliser** un service pour lui, soit il **subit** un événement désagréable provoqué par autrui.\nServices voulus : **se faire couper les cheveux, se faire livrer, se faire rembourser**.\nMésaventures subies : **se faire voler, se faire gronder, se faire piéger**.'), {
        table: {
          head: [b('Nuance', 'Nuance'), b('French structure', 'Structure'), b('Example', 'Exemple')],
          rows: [
            [b('Arranged service', 'Service demandé'), 'se faire + inf. (+ COD)', 'Je me suis fait livrer mes courses.'],
            [b('Unpleasant event', 'Mésaventure subie'), 'se faire + inf.', 'Il s’est fait renvoyer dès le premier mois.'],
            [b('Caused to someone else', 'Faire faire à autrui'), 'faire + inf. + objet', 'J’ai fait réparer la chaudière.'],
          ],
        },
        ex: [
          ['Elle s’est fait couper les cheveux juste avant son mariage.', 'She got her hair cut right before her wedding.'],
          ['Nous nous sommes fait bloquer à l’entrée du parking.', 'We got blocked at the parking entrance.'],
          ['Tu vas te faire remarquer si tu arrives si tard.', 'You are going to draw attention to yourself if you arrive so late.'],
        ],
      }),
      trap(b('Fait NEVER agrees before an infinitive!', 'Fait ne s’accorde JAMAIS devant un infinitif !'), b('Even with a feminine or plural subject (**elle, elles, nous**), **fait** in **se faire + infinitif** stays masculine singular (**fait**). Write **Elles se sont fait opérer** — NEVER *faites*!\nAlways invariable: **elle s’est fait opérer, elles se sont fait rembourser, nous nous sommes fait piéger**.', 'Même avec un sujet féminin ou pluriel (**elle, elles, nous**), **fait** dans **se faire + infinitif** reste toujours invariable (**fait**). Écrivez **Elles se sont fait opérer** — jamais *faites* !\nToujours invariable : **elle s’est fait opérer, elles se sont fait rembourser, nous nous sommes fait piéger**.'), {
        ex: [
          ['Marie s’est fait installer la fibre hier matin.', 'Marie had fiber internet installed yesterday morning.'],
          ['Mes sœurs se sont fait doubler dans la file.', 'My sisters got cut in front of in the line.'],
        ],
      }),
      mc(P.spelling, [
        'Elles se sont fait accompagner jusqu’à la sortie.',
        'Elles se sont faites accompagner jusqu’à la sortie.',
        'Elles se sont faits accompagner jusqu’à la sortie.',
        'Elles ont fait s’accompagner jusqu’à la sortie.',
      ], { fr: 'Choisissez la phrase correcte au féminin pluriel.' }),
      hear('Le mois dernier, je me suis fait pirater ma boîte mail pendant les vacances.', P.meaning, [
        b('Someone hacked my email account while I was away.', 'Quelqu’un a piraté ma messagerie pendant mon absence.'),
        b('I paid someone to test my email security.', 'J’ai payé quelqu’un pour tester ma messagerie.'),
        b('I deleted my email account on purpose.', 'J’ai supprimé ma messagerie exprès.'),
      ]),
      sort(b('Arranged service or unpleasant mishap?', 'Service voulu ou mésaventure subie ?'), [
        b('Arranged / desired service', 'Service demandé / voulu'),
        b('Unpleasant / accidental outcome', 'Mésaventure / situation subie'),
      ], [
        ['Il s’est fait couper la barbe.', 0],
        ['Elle s’est fait voler son sac.', 1],
        ['Nous nous sommes fait rembourser.', 0],
        ['Tu vas te faire gronder !', 1],
        ['Je me suis fait poser une étagère.', 0],
        ['Ils se sont fait bloquer par la neige.', 1],
      ]),
      gap(P.complete, 'Ma tante ___ (se faire — passé composé) livrer un canapé, mais les livreurs ___ (se faire — passé composé) arrêter par un sens interdit.', [['s’est fait'], ['se sont fait']], {
        explain: b('Both s’est fait and se sont fait remain invariable before the infinitives livrer and arrêter.', 's’est fait et se sont fait restent invariables devant les infinitifs livrer et arrêter.'),
      }),
      pairs(P.match, [
        ['se faire rembourser', b('to get a refund', 'obtenir le remboursement')],
        ['se faire gronder', b('to get scolded', 'recevoir une réprimande')],
        ['se faire opérer', b('to have surgery', 'subir une opération médicale')],
        ['se faire piéger', b('to get tricked / trapped', 'tomber dans un piège')],
      ]),
      ord(P.order, 'Elle s’est fait voler son téléphone dans le métro.', {
        tr: b('She had her phone stolen on the subway.', 'On lui a volé son téléphone dans le métro.'),
        extra: ['faite', 'a'],
      }),
      dlg(b('Broken glasses', 'Lunettes cassées'), b('Claire explains why she is wearing an old pair of glasses.', 'Claire explique pourquoi elle porte une vieille paire de lunettes.'), [['Paul', 'm'], ['Claire', 'f2']], [
        [0, 'Tiens, tu as changé de lunettes aujourd’hui ?', 'Hey, did you change glasses today?'],
        [1, { options: ['Oui, je me suis fait marcher dessus à la piscine, alors je me suis fait réparer la monture.', 'Oui, je me suis faite marcher dessus, je fais réparer.', 'Oui, j’ai marché sur moi-même.'], explain: b('Invariable fait with both se faire marcher dessus (mishap) and se faire réparer (service).', 'Fait invariable avec se faire marcher dessus (mésaventure) et se faire réparer (service).') }],
        [0, 'Quelle malchance ! Au moins l’opticien a été rapide.', 'What bad luck! At least the optician was fast.'],
      ]),
      dict('Mes voisines se sont fait installer des volets neufs sans se faire tromper sur le prix.'),
      say('Je préfère me faire livrer ce meuble plutôt que de le porter seul.', 'I’d rather have this piece of furniture delivered than carry it alone.'),
    ],
    [
      b('se faire + infinitive expresses both arranged services and unwanted events.', 'se faire + infinitif exprime à la fois un service obtenu et une mésaventure subie.'),
      b('In se faire + infinitive, fait is ALWAYS invariable (elles se sont fait aider).', 'Dans se faire + infinitif, fait reste TOUJOURS invariable (elles se sont fait aider).'),
      b('Use faire + infinitive when someone else receives the action (j’ai fait réparer le toit).', 'Employez faire + infinitif quand la chose est confiée à autrui (j’ai fait réparer le toit).'),
    ],
    [
      ['se faire couper les cheveux', b('to get one’s hair cut', 'aller chez le coiffeur')],
      ['se faire livrer', b('to have something delivered', 'recevoir à domicile')],
      ['se faire rembourser', b('to get refunded', 'récupérer son argent')],
      ['se faire piéger', b('to get caught / tricked', 'se laisser prendre au piège')],
    ],
  ),

  lesson(C, 3, ['cleft-cest-qui-que', 'mise-en-relief-cest'],
    b('Cleft emphasis (c’est … qui / que) & choosing the right structure', 'Mise en relief (c’est … qui / que) et choix de structure'),
    b('Highlight who did what with c’est … qui / que, and know when the real passive (être + par) still shines.', 'Mettez en valeur l’auteur ou l’objet avec c’est … qui / que, et sachez quand garder le vrai passif avec par.'),
    [
      b('Use c’est … qui (subject) and c’est … que (object) to replace passive focus', 'Employer c’est … qui (sujet) et c’est … que (objet) pour déplacer l’accent'),
      b('Recognize when the formal passive with par or de is natural', 'Savoir quand le passif classique avec par ou de reste naturel'),
      b('Select fluently among all four passive alternatives', 'Choisir avec naturel entre les quatre alternatives au passif'),
    ],
    13,
    [
      card(b('C’est … qui / que: shifting the spotlight', 'C’est … qui / que : déplacer le projecteur'), b('English often uses the passive just to put the main actor at the end (“This bridge was designed by Eiffel”) or the focus at the start. French prefers a **cleft sentence**:\n- **C’est + sujet + qui** highlights who acted.\n- **C’est + objet + que** highlights what underwent the action.\n- **Ce qui / Ce que …, c’est** frames a whole idea.\nSpotlight tools: **c’est … qui, c’est … que, ce qui … c’est**.', 'L’anglais emploie souvent le passif uniquement pour placer l’auteur à la fin ou le thème au début. Le français préfère la **phrase clivée** :\n- **C’est + sujet + qui** met en avant l’auteur.\n- **C’est + objet + que** met en avant l’objet.\n- **Ce qui / Ce que …, c’est** encadre une idée entière.\nOutils de mise en relief : **c’est … qui, c’est … que, ce qui … c’est**.'), {
        table: {
          head: [b('Focus', 'Élément mis en relief'), b('Pattern', 'Construction'), b('Example', 'Exemple')],
          rows: [
            [b('Subject (agent)', 'Sujet (auteur)'), 'C’est X qui + verb', 'C’est Nora qui a rédigé l’article.'],
            [b('Plural subject', 'Sujet pluriel'), 'Ce sont X qui + verb', 'Ce sont eux qui ont gagné.'],
            [b('Direct object', 'Objet direct'), 'C’est X que + subject + verb', 'C’est ce rapport qu’elle relit.'],
            [b('Preposition + noun', 'Complément prépositionnel'), 'C’est + prep. + X que', 'C’est de ce bruit dont on parle / de ce bruit qu’on parle.'],
          ],
        },
        ex: [
          ['C’est mon collègue qui a trouvé la solution.', 'It was my colleague who found the solution.'],
          ['C’est cette lettre que le directeur attendait.', 'It’s this letter that the director was waiting for.'],
        ],
      }),
      tip(b('When IS the real passive still good?', 'Quand garder le vrai passif ?'), b('Keep **être + participe passé** in formal journalism, history or official announcements **when the agent is named with par** (action) or **de** (feeling/accompaniment), or when the patient is the clear topic of a paragraph.\nNatural real passive: **conçu par, voté par, entouré de, accompagné de**.', 'Gardez **être + participe passé** dans la presse, l’histoire ou les avis officiels **quand l’agent est nommé avec par** (action) ou **de** (sentiment, accompagnement), ou quand le patient reste le thème du texte.\nPassifs naturels : **conçu par, voté par, entouré de, accompagné de**.'), {
        ex: [
          ['Le musée a été restauré par une équipe de Lille.', 'The museum was restored by a team from Lille.'],
          ['La place était entourée d’arbres centenaires.', 'The square was surrounded by century-old trees.'],
        ],
      }),
      mc(P.best, [
        'C’est Julie qui a organisé toute la soirée.',
        'La soirée a été par Julie organisée.',
        'C’est Julie que a organisé toute la soirée.',
      ], { fr: 'Comment mettre en relief que Julie est l’autrice de la soirée ?' }),
      doc({
        look: 'article',
        title: b('Local heritage reopening', 'Réouverture du théâtre municipal'),
        text: 'Après deux ans de travaux, le théâtre municipal rouvre samedi.\nOn y jouera d’abord une pièce contemporaine. C’est l’architecte Claire Vidal qui a supervisé la rénovation de la grande salle, tandis que les anciens sièges ont été remplacés par des fauteuils plus confortables.\nLes billets se réservent dès maintenant à l’accueil.',
      }, b('Which two passive alternatives appear in this short article?', 'Quelles deux alternatives au passif figurent dans ce court article ?'), [
        b('Active on (on y jouera) and pronominal passive (se réservent)', 'On actif (on y jouera) et passif pronominal (se réservent)'),
        b('Se faire + infinitive and passive with de', 'Se faire + infinitif et passif avec de'),
        b('Only formal passives with être', 'Uniquement des passifs classiques avec être'),
      ]),
      sort(b('Which structure fits best?', 'Quelle structure convient le mieux ?'), [
        b('c’est … qui / que (highlight actor/object)', 'c’est … qui / que (mise en relief)'),
        b('se faire + inf. (service / mishap)', 'se faire + inf. (service / mésaventure)'),
        b('se + verbe (general rule / property)', 'se + verbe (règle / propriété)'),
      ], [
        ['Ce mot s’accorde au pluriel.', 2],
        ['C’est elle qui gère ce dossier.', 0],
        ['Il s’est fait rembourser son billet.', 1],
        ['Cette sauce se prépare à froid.', 2],
        ['C’est ce film que je voulais voir.', 0],
        ['Tu vas te faire remarquer.', 1],
      ]),
      gap(P.complete, '___ (c’est / ce sont) mes voisins ___ m’ont prévenu. Ensuite, ___ (on / se) a appelé un plombier qui ___ (s’occuper / se faire) du problème.', [['Ce sont'], ['qui'], ['on'], ['s’est occupé']], {
        choices: [
          ['Ce sont', 'C’est', 'Il est'],
          ['qui', 'que', 'dont'],
          ['on', 'se', 'il'],
          ['s’est occupé', 's’est fait occupé', 'est occupé par'],
        ],
      }),
      pairs(P.match, [
        ['C’est lui qui paie.', b('He is the one paying.', 'L’auteur du paiement, c’est lui.')],
        ['C’est ce train que je prends.', b('This is the train I’m taking.', 'Je prends précisément ce train.')],
        ['entouré de collines', b('surrounded by hills', 'bordé de collines tout autour')],
        ['voté par le conseil', b('passed by the council', 'adopté lors du vote du conseil')],
      ]),
      ord(P.order, 'C’est cette erreur que nous devons corriger ensemble.', {
        tr: b('It is this mistake that we must correct together.', 'Voici précisément l’erreur que nous devons corriger ensemble.'),
        extra: ['qui', 'par'],
      }),
      dict('Ce sont ces bénévoles qui ont nettoyé le parc, et l’accès se fait désormais par le nord.'),
      write(
        b('Rewrite passive facts into natural French.', 'Réécrivez des faits passifs en français naturel.'),
        b('Write a short neighborhood update (3–4 sentences) avoiding stiff agentless passives: use active on, a pronominal passive (se + verb), se faire + infinitive, and a c’est … qui cleft.', 'Rédigez une courte brève de quartier (3 à 4 phrases) en évitant les passifs lourds : utilisez on actif, un passif pronominal (se + verbe), se faire + infinitif et une phrase avec c’est … qui.'),
        28, 60,
        [
          b('Include active on for an action by unknown people', 'Inclure on actif pour une action anonyme'),
          b('Include a pronominal passive on an inanimate noun', 'Inclure un passif pronominal sur un sujet inanimé'),
          b('Include se faire + infinitive and c’est … qui', 'Inclure se faire + infinitif et c’est … qui'),
        ],
        'Bonne nouvelle dans la rue : on a enfin réparé les lampadaires. C’est la mairie qui a financé les travaux, même si les habitants se sont fait attendre pendant plusieurs semaines. Désormais, le passage se traverse sans risque le soir.',
        { phrases: ['On a enfin…', 'C’est … qui…', 'se faire + infinitif', 'se + verbe'] },
      ),
    ],
    [
      b('Use c’est … qui (subject) and c’est … que (object) to highlight a key participant.', 'Utilisez c’est … qui (sujet) et c’est … que (objet) pour mettre un élément en relief.'),
      b('Use ce sont … qui for plural nouns and eux / elles.', 'Employez ce sont … qui devant un pluriel ou eux / elles.'),
      b('Keep real passive être + p.p. mainly when par or de introduces a meaningful agent.', 'Gardez le passif classique surtout quand par ou de introduit un agent utile.'),
    ],
    [
      ['c’est … qui', b('it is … who (subject focus)', 'mise en relief du sujet')],
      ['c’est … que', b('it is … that (object focus)', 'mise en relief de l’objet')],
      ['entouré de', b('surrounded by (state)', 'bordé par (état)')],
      ['conçu par', b('designed by (agent)', 'créé par (agent)')],
    ],
  ),
];

export default lessons;
