import type { CourseAbout, Lesson } from '../../types';
import { P, b, card, dict, dlg, gap, hear, lesson, mc, ord, pairs, say, sort, trap, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Quand j’arriverai, pendant que je cuisine, depuis que j’habite ici. Time clauses work differently in French and English: after quand you often need the future, pendant splits into pendant que + clause vs pendant/pour + duration, and depuis takes the present—not the past—for anything still happening now. This course makes every time link intuitive.',
    'Quand j’arriverai, pendant que je cuisine, depuis que j’habite ici. Les repères temporels suivent une logique propre au français : le futur après quand, la différence entre pendant que, pendant et pour, et le présent avec depuis pour ce qui dure encore. Ce cours clarifie chaque emploi en contexte.',
  ),
  outcomes: [
    b('Use quand and lorsque accurately across present, past and future', 'Employer quand et lorsque au présent, au passé et surtout au futur'),
    b('Distinguish pendant que + clause from pendant and pour + duration', 'Distinguer pendant que + verbe de pendant et pour + durée'),
    b('Use depuis and depuis que with present or imparfait for ongoing states', 'Employer depuis et depuis que avec le présent ou l’imparfait pour une durée en cours'),
  ],
};

const C = 'gr-quand-pendant-que';

const lessons: Lesson[] = [
  lesson(C, 1, ['quand-and-lorsque', 'quand-et-lorsque'],
    b('Quand & lorsque: present, past and the future rule', 'Quand et lorsque : présent, passé et règle du futur'),
    b('Why French puts the future tense after quand—and when to choose lorsque.', 'Pourquoi le français met le futur après quand — et quand préférer lorsque.'),
    [
      b('Use the future after quand / lorsque / dès que when talking about the future', 'Employer le futur après quand / lorsque / dès que pour un événement à venir'),
      b('Combine quand with présent (habits) and imparfait / passé composé (past)', 'Associer quand au présent d’habitude ainsi qu’à l’imparfait et au passé composé'),
      b('Know why lorsque never introduces a direct question', 'Savoir que lorsque ne sert jamais à poser une question'),
    ],
    13,
    [
      card(
        b('The golden rule: future after quand / lorsque / dès que', 'La règle d’or : le futur après quand / lorsque / dès que'),
        b(
          'In English, we say *"When I arrive, I’ll call you"* using the present after *when*. In French, if BOTH actions are in the future, **BOTH verbs take the future**! That same rule applies after **lorsque** (a slightly more formal synonym of *quand*) and **dès que** (*as soon as*). Only **quand** can ask a question (`Quand viens-tu ?`); never use **lorsque** in a question.\n\nTime connectors: **quand, lorsque, dès que**.\nPresent habits: **Quand il pleut, Quand j’ai faim, Lorsqu’on voyage**.\nFuture pairs: **Quand j’arriverai, Dès que tu pourras, Lorsqu’il fera beau**.',
          'En français, si deux actions sont dans l’avenir, **les deux verbes se mettent au futur** après **quand**, **lorsque** (un peu plus soutenu) et **dès que**. Attention aussi : seul **quand** sert à poser une question (`Quand pars-tu ?`), jamais **lorsque** !\n\nConnecteurs temporels : **quand, lorsque, dès que**.\nHabitudes au présent : **Quand il pleut, Quand j’ai faim, Lorsqu’on voyage**.\nActions futures : **Quand j’arriverai, Dès que tu pourras, Lorsqu’il fera beau**.',
        ),
        {
          table: {
            head: [b('Time frame', 'Époque'), b('Clause 1 (quand / lorsque)', 'Proposition avec quand / lorsque'), b('Main clause', 'Proposition principale')],
            rows: [
              [b('Habit (present)', 'Habitude (présent)'), 'Quand il fait beau,', 'je vais au travail à vélo.'],
              [b('Past background + event', 'Passé (cadre + événement)'), 'Quand je dormais,', 'le téléphone a sonné.'],
              [b('Future (both!)', 'Futur (les deux !)'), 'Quand tu arriveras à la gare,', 'je viendrai te chercher.'],
            ],
          },
          ex: [
            ['Dès que j’aurai des nouvelles, je t’enverrai un message.', 'As soon as I have news, I’ll send you a message.'],
            ['Lorsque nous étions étudiants, nous habitions tout près d’ici.', 'When we were students, we lived right near here.'],
          ],
        },
      ),
      trap(
        b('Two quick checks: future after quand, and élision with lorsque', 'Deux réflexes : le futur après quand, et lorsqu’il / lorsqu’elle'),
        b(
          'Never say « Quand j’arrive à Lyon demain, je t’appellerai » in standard French—both actions happen tomorrow, so say **Quand j’arriverai…, je t’appellerai**. Also remember that **lorsque** drops its **-e** before **il, elle, on, un, une** (`lorsqu’il`, `lorsqu’elle`), whereas **quand** NEVER drops `-d` (`quand il`, pronounced with a [t] liaison: *quand‿il*).\n\nElided lorsque: **lorsqu’il arrive, lorsqu’elle part, lorsqu’on rentre**.\nFull quand: **quand il arrive, quand elle part, quand on rentre**.',
          'Ne dites pas « Quand j’arrive à Lyon demain, je t’appellerai » : les deux verbes étant futurs, dites **Quand j’arriverai…, je t’appellerai**. De plus, **lorsque** s’élide devant **il, elle, on, un, une** (`lorsqu’il`, `lorsqu’elle`), alors que **quand** ne s’apostrophe jamais (`quand il`, liaison en [t]).\n\nÉlision de lorsque : **lorsqu’il arrive, lorsqu’elle part, lorsqu’on rentre**.\nQuand intact : **quand il arrive, quand elle part, quand on rentre**.',
        ),
      ),
      mc(P.form, ['finirai', 'finis', 'finissais', 'finirais'], {
        fr: 'Quand je ___ ce rapport demain matin, je te l’enverrai.',
      }),
      mc(P.form, ['Quand', 'Lorsque', 'Lorsqu’', 'Dès que'], {
        fr: '___ partez-vous en vacances cet été ?',
        explain: b('Only quand can introduce a direct question; lorsque is never an interrogative word.', 'Seul quand permet de poser une question ; lorsque n’est jamais interrogatif.'),
      }),
      gap(P.complete, 'Dès qu’elle ___ (sortir) de la réunion, elle nous ___ (appeler). Hier soir, quand il ___ (pleuvoir), nous ___ (prendre) un taxi.', [['sortira'], ['appellera'], ['pleuvait'], ['avons pris']], {
        choices: [['sortira', 'sort'], ['appellera', 'appelle'], ['pleuvait', 'pleut'], ['avons pris', 'prendrons']],
      }),
      ord(P.order, 'Quand nous serons à Nice, nous irons voir la mer.', {
        tr: 'When we are in Nice, we will go and see the sea.',
        extra: ['sommes', 'allons'],
      }),
      pairs(
        b('Match each time clause with its logical continuation.', 'Associez chaque début de phrase à sa suite logique.'),
        [
          ['Quand j’aurai mon permis,', 'j’achèterai une petite voiture.'],
          ['Quand j’avais dix ans,', 'je faisais du judo le mercredi.'],
          ['Quand il fait très chaud,', 'nous fermons les volets l’après-midi.'],
          ['Quand le train est entré en gare,', 'tous les voyageurs se sont levés.'],
        ],
        true,
      ),
      hear('Lorsqu’il aura reçu sa confirmation, il réservera tout de suite les billets de train.', b('When will he book the train tickets?', 'Quand réservera-t-il les billets de train ?'), [
        b('As soon as he gets his confirmation', 'Dès qu’il aura reçu sa confirmation'),
        b('Before asking for confirmation', 'Avant de demander la confirmation'),
        b('Only if the train is already full', 'Seulement si le train est complet'),
      ]),
      dict('Quand tu arriveras à l’aéroport, appelle-moi et j’irai te chercher devant la sortie.'),
      say('Lorsque j’aurai fini mes études, je travaillerai peut-être à Montréal.', 'When I finish my studies, I might work in Montreal.'),
    ],
    [
      b('After quand, lorsque and dès que, use the FUTURE when both actions lie in the future.', 'Après quand, lorsque et dès que, employez le FUTUR quand les deux actions sont à venir.'),
      b('Only quand works in questions (Quand arrives-tu ?); lorsque elides to lorsqu’il/lorsqu’elle.', 'Seul quand s’emploie dans les questions ; lorsque devient lorsqu’il/lorsqu’elle.'),
      b('In the past: quand + imparfait (background) + passé composé (sudden event).', 'Au passé : quand + imparfait (décor) + passé composé (événement).'),
    ],
    [
      ['dès que', b('as soon as', 'aussitôt que')],
      ['un volet', b('a window shutter', 'un panneau qui ferme une fenêtre de l’extérieur')],
      ['un permis de conduire', b('a driving licence', 'le titre officiel pour conduire')],
    ],
  ),

  lesson(C, 2, ['pendant-que-vs-pendant-pour', 'pendant-que-pendant-pour'],
    b('Pendant que (simultaneous) vs pendant and pour (duration)', 'Pendant que, pendant et pour'),
    b('Connect two actions happening at once with pendant que—and choose between pendant and pour for durations.', 'Relier deux actions simultanées avec pendant que, et distinguer pendant et pour devant une durée.'),
    [
      b('Use pendant que + subject + verb for two simultaneous actions', 'Employer pendant que + sujet + verbe pour deux actions simultanées'),
      b('Use pendant + duration for a completed or bounded period', 'Employer pendant + durée pour une période délimitée ou achevée'),
      b('Use pour + duration for planned stays, loans and reservations', 'Employer pour + durée pour un séjour, un prêt ou une réservation prévus'),
    ],
    13,
    [
      card(
        b('Pendant que vs pendant vs pour', 'Pendant que, pendant ou pour ?'),
        b(
          'Even though they look similar, these three words serve three distinct jobs. **Pendant que** joins **two verbs** happening at the same time (*while*). **Pendant** goes before a **noun or time length** (*during / for* a completed block). **Pour** introduces a **planned future duration**—usually after verbs like **partir, venir, réserver, prêter, louer**.\n\nSimultaneous actions: **pendant que je lis, pendant qu’il cuisine, tandis que tu travailles**.\nBounded duration: **pendant deux heures, pendant l’hiver, pendant le film**.\nPlanned duration: **pour trois jours, pour une semaine, pour les vacances**.',
          'Même s’ils se ressemblent, ces trois mots ont chacun un rôle précis. **Pendant que** relie **deux actions simultanées** (*en même temps*). **Pendant** précède un **nom ou une durée** (souvent achevée ou globale). **Pour** indique une **durée prévue à l’avance** après des verbes comme **partir, venir, réserver, prêter, louer**.\n\nActions simultanées : **pendant que je lis, pendant qu’il cuisine, tandis que tu travailles**.\nDurée délimitée : **pendant deux heures, pendant l’hiver, pendant le film**.\nDurée prévue : **pour trois jours, pour une semaine, pour les vacances**.',
        ),
        {
          table: {
            head: [b('Word', 'Mot'), b('Followed by', 'Suivi de'), b('Example', 'Exemple')],
            rows: [
              ['pendant que', b('subject + verb (while)', 'sujet + verbe (simultané)'), 'Pendant que tu conduis, je regarde la carte.'],
              ['pendant', b('noun / duration (during / for)', 'nom / durée (bloc mesuré)'), 'J’ai attendu le bus pendant vingt minutes.'],
              ['pour', b('planned duration (for)', 'durée prévue (séjour / prêt)'), 'Nous partons à Rome pour quatre jours.'],
            ],
          },
          ex: [
            ['Pendant que les enfants jouaient dans le jardin, nous préparions le goûter.', 'While the children were playing in the garden, we were making snacks.'],
            ['J’ai loué ce vélo pour tout le week-end.', 'I rented this bike for the whole weekend.'],
          ],
        },
      ),
      trap(
        b('Never use pour for a completed past duration!', 'Jamais pour pour une durée passée achevée !'),
        b(
          'English speakers often use "for" in *"I lived in Lyon for two years"* and mistakenly write « J’ai habité à Lyon *pour* deux ans ». In French, use **pendant** (or omit it altogether): **J’ai habité à Lyon pendant deux ans** (or **J’ai habité à Lyon deux ans**). Also, **pendant que** can express contrast just like **tandis que** (*whereas*): « Elle travaille, **pendant que** lui se repose. »\n\nPast completed: **pendant deux ans, pendant trois heures, pendant tout le mois**.\nPlanned stay/loan: **partir pour trois jours, prêter pour une heure, réserver pour deux nuits**.',
          'Ne traduisez jamais *« I lived there for two years »* par « pour deux ans » ! Pour une durée passée mesurée, dites **pendant deux ans** (ou rien du tout : **J’ai habité à Lyon deux ans**). Réservez **pour** aux séjours, réservations ou prêts prévus à l’avance.\n\nDurée passée : **pendant deux ans, pendant trois heures, pendant tout le mois**.\nSéjour / prêt prévu : **partir pour trois jours, prêter pour une heure, réserver pour deux nuits**.',
        ),
      ),
      mc(P.form, ['pendant', 'pour', 'pendant que', 'depuis'], {
        fr: 'Avant de changer de métier, elle a été professeure ___ dix ans.',
        explain: b('Ten years is a finished past duration → pendant (never pour).', 'Dix ans est une durée passée achevée → pendant (jamais pour).'),
      }),
      mc(P.form, ['pendant que', 'pendant', 'pour', 'lorsque'], {
        fr: '___ je fais la vaisselle, tu peux ranger les courses dans le placard ?',
      }),
      gap(P.complete, 'Nous avons réservé une chambre ___ (pour / trois nuits). Hier soir, j’ai révisé ___ (pendant / deux heures) ___ (pendant que) ma sœur écoutait de la musique.', [['pour trois nuits'], ['pendant deux heures'], ['pendant que']], {
        choices: [['pour trois nuits', 'pendant que trois nuits'], ['pendant deux heures', 'pour deux heures'], ['pendant que', 'pendant', 'pour']],
      }),
      ord(P.order, 'Je te prête cet appareil photo pour le week-end.', {
        tr: 'I’m lending you this camera for the weekend.',
        extra: ['pendant', 'que'],
      }),
      sort(
        b('Sort by whether you need pendant que, pendant, or pour.', 'Classez selon qu’il faut pendant que, pendant ou pour.'),
        [b('pendant que (+ clause)', 'pendant que (+ verbe)'), b('pendant (+ past/general duration)', 'pendant (+ durée mesurée)'), b('pour (+ planned stay/loan)', 'pour (+ séjour/prêt prévu)')],
        [['___ il dormait, le téléphone a sonné.', 0], ['J’ai travaillé à Lille ___ six mois.', 1], ['Je pars en stage à Genève ___ deux semaines.', 2], ['___ nous dînons, éteignons les écrans.', 0], ['Il a neigé ___ toute la matinée.', 1], ['Ils ont réservé cette table ___ vingt heures trente.', 2]],
      ),
      hear('Pendant que tu finissais ton appel, j’ai préparé du thé et j’ai réservé les billets pour trois jours à Bordeaux.', b('What happened at the same time?', 'Que s’est-il passé en même temps ?'), [
        b('One person made tea and booked a 3-day trip while the other finished a call', 'L’un a préparé le thé et réservé un séjour pendant que l’autre finissait un appel'),
        b('They spent three days drinking tea in Bordeaux', 'Ils ont passé trois jours à boire du thé à Bordeaux'),
        b('The call lasted three hours on the train', 'L’appel a duré trois heures dans le train'),
      ]),
      dict('Il a étudié le droit pendant quatre ans, puis il est parti à Québec pour six mois.'),
      say('Pendant que je prépare le café, tu peux ouvrir les fenêtres ?', 'While I make the coffee, can you open the windows?'),
    ],
    [
      b('pendant que + subject + verb links two simultaneous actions ("while").', 'pendant que + sujet + verbe relie deux actions simultanées.'),
      b('pendant + noun/duration expresses a bounded or completed duration (never use pour for past durations).', 'pendant + nom/durée exprime une durée mesurée ou achevée (jamais pour au passé).'),
      b('pour + duration expresses a planned duration after partir, réserver, prêter, louer.', 'pour + durée indique une durée prévue avec partir, réserver, prêter, louer.'),
    ],
    [
      ['un stage', b('an internship / training course', 'une période de formation en entreprise')],
      ['faire la vaisselle', b('to do the dishes', 'laver les assiettes et les verres')],
      ['éteindre', b('to switch off', 'couper un appareil ou une lumière')],
    ],
  ),

  lesson(C, 3, ['depuis-que-and-ongoing-states', 'depuis-que-duree-en-cours'],
    b('Depuis and depuis que for ongoing states', 'Depuis et depuis que pour ce qui dure encore'),
    b('Why French uses the present tense with depuis—and the imparfait when looking back to a past moment.', 'Pourquoi le français utilise le présent avec depuis — et l’imparfait pour une durée en cours dans le passé.'),
    [
      b('Use depuis (+ noun/time) and depuis que (+ clause) with the present tense for ongoing situations', 'Employer depuis et depuis que au présent pour une situation qui continue aujourd’hui'),
      b('Switch to the imparfait when the ongoing state led up to a past moment', 'Passer à l’imparfait quand la situation durait jusqu’à un moment du passé'),
      b('Know when negative sentences with depuis take the passé composé', 'Comprendre pourquoi une phrase négative avec depuis accepte le passé composé'),
    ],
    13,
    [
      card(
        b('Started in the past, STILL true now → Present tense!', 'Commencé avant, TOUJOURS vrai maintenant → Présent !'),
        b(
          'English uses *"I have lived / have been living here for three years"*. French looks at the fact that the action is **still going on right now**, so it uses the **PRESENT tense** with **depuis** (followed by a duration or starting point) and **depuis que** (followed by a subject + verb)! When talking about a situation that **had been going on** up to a moment in the past, use the **imparfait**.\n\nPresent with depuis: **depuis trois ans, depuis lundi, depuis ce matin**.\nWith depuis que: **Depuis que j’habite ici, Depuis qu’il travaille, Depuis qu’elle court**.\nPast ongoing (imparfait): **Il pleuvait depuis deux heures, J’attendais depuis midi**.',
          'En français, une action commencée dans le passé qui **continue encore aujourd’hui** s’exprime au **PRÉSENT** avec **depuis** (devant une durée ou une date) et **depuis que** (devant un sujet + verbe) ! Si cette action durait déjà jusqu’à un moment précis du passé, on emploie l’**imparfait**.\n\nPrésent avec depuis : **depuis trois ans, depuis lundi, depuis ce matin**.\nAvec depuis que : **Depuis que j’habite ici, Depuis qu’il travaille, Depuis qu’elle court**.\nEn cours dans le passé (imparfait) : **Il pleuvait depuis deux heures, J’attendais depuis midi**.',
        ),
        {
          table: {
            head: [b('Time anchor', 'Repère'), b('Tense with depuis / depuis que', 'Temps avec depuis / depuis que'), b('Example', 'Exemple')],
            rows: [
              [b('Ongoing NOW', 'Continue MAINTENANT'), b('Présent', 'Présent'), 'J’apprends le français depuis deux ans.'],
              [b('Ongoing THEN (past)', 'Durait ALORS (passé)'), b('Imparfait', 'Imparfait'), 'Il attendait depuis une heure quand je suis arrivé.'],
              [b('Negative (not since…)', 'Négatif (pas depuis…)'), b('Passé composé (natural!)', 'Passé composé (naturel !)'), 'Je ne l’ai pas vu depuis mardi.'],
            ],
          },
          ex: [
            ['Depuis que nous avons un vélo, nous prenons rarement la voiture.', 'Since we got a bike, we rarely take the car.'],
            ['Elle dormait depuis dix minutes quand le réveil a sonné.', 'She had been sleeping for ten minutes when the alarm rang.'],
          ],
        },
      ),
      trap(
        b('Notice the verb inside depuis que—and the negative exception!', 'Observez le verbe dans depuis que — et l’exception négative !'),
        b(
          'In **depuis que + clause**, choose the tense carefully: if the starting event happened once in the past (`since he arrived`, `since she left`), put **passé composé** inside `depuis que` and **présent** in the main clause: « Depuis qu’il **est arrivé**, il **fait** plus doux. » If it’s an ongoing habit, both can be **présent**: « Depuis qu’elle **travaille** ici, elle **est** plus calme. » Also remember: with a **negative**, **passé composé** is completely natural because the action hasn’t happened at all: « Il **n’a pas appelé** depuis Noël. »\n\nOne-time start: **Depuis qu’il est parti, Depuis que j’ai déménagé**.\nOngoing state: **Depuis qu’elle habite à Lyon, Depuis qu’il fait beau**.\nNegative with depuis: **Je n’ai pas dormi depuis hier, Il n’a rien mangé depuis ce matin**.',
          'Dans **depuis que**, choisissez le temps avec justesse : si le point de départ est un événement ponctuel passé, on met le **passé composé** après `depuis que` et le **présent** dans la principale : « Depuis qu’il **est arrivé**, il **fait** plus doux. » Pour une situation durable, les deux verbes sont au **présent**. Et dans une phrase **négative**, le **passé composé** est naturel : « Il **n’a pas appelé** depuis Noël. »\n\nDébut ponctuel : **Depuis qu’il est parti, Depuis que j’ai déménagé**.\nSituation durable : **Depuis qu’elle habite à Lyon, Depuis qu’il fait beau**.\nNégatif avec depuis : **Je n’ai pas dormi depuis hier, Il n’a rien mangé depuis ce matin**.',
        ),
      ),
      mc(P.form, ['travaille', 'a travaillé', 'travaillerai', 'travaillait'], {
        fr: 'Ma sœur ___ dans cette librairie depuis quatre ans et elle adore toujours son poste.',
        explain: b('Still working there now → présent (`travaille`).', 'Elle y travaille encore aujourd’hui → présent (`travaille`).'),
      }),
      mc(P.form, ['neigeait', 'a neigé', 'neigera', 'neige'], {
        fr: 'Quand nous avons ouvert les volets hier matin, il ___ déjà depuis deux heures.',
      }),
      gap(P.complete, 'Depuis qu’elle ___ (changer) de quartier, Léa ___ (se sentir) beaucoup mieux. Et toi, tu n’___ (voir / pas) Paul depuis lundi ?', [['a changé'], ['se sent'], ['as pas vu']], {
        choices: [['a changé', 'changeait'], ['se sent', 's’est sentie'], ['as pas vu', 'vois pas']],
      }),
      ord(P.order, 'Nous habitons dans cet immeuble depuis que je travaille ici.', {
        tr: 'We have been living in this building since I started working here.',
        extra: ['pendant', 'pour'],
      }),
      sort(
        b('Sort by meaning: ongoing with depuis, or finished block with pendant?', 'Classez : action toujours en cours (depuis) ou période terminée (pendant) ?'),
        [b('depuis / depuis que (still ongoing or up to then)', 'depuis / depuis que (en cours)'), b('pendant (finished or bounded block)', 'pendant (durée délimitée)')],
        [['J’étudie le piano ___ trois ans et je continue.', 0], ['J’ai étudié le piano ___ trois ans au collège.', 1], ['___ qu’elle habite ici, elle va au marché à pied.', 0], ['Nous avons marché ___ quarante minutes ce matin.', 1], ['Il pleuvait ___ une heure quand je suis rentré.', 0]],
      ),
      hear('Depuis que j’ai commencé ce cours de cuisine, je prépare de vrais dîners tous les soirs, alors qu’avant je cuisinais à peine.', b('What changed for the speaker?', 'Qu’est-ce qui a changé pour la personne ?'), [
        b('Since starting the cooking class, they cook proper dinners every night', 'Depuis le début du cours, elle cuisine de vrais dîners tous les soirs'),
        b('They stopped cooking after finishing the class', 'Elle a arrêté de cuisiner après la fin du cours'),
        b('They only cook on weekends now', 'Elle cuisine seulement le week-end maintenant'),
      ]),
      dlg(b('Catching up at a café', 'Retrouvailles au café'), b('Nassim and Claire talk about their lives since last year.', 'Nassim et Claire parlent de ce qui a changé depuis l’an dernier.'), [['Nassim', 'm'], ['Claire', 'f']], [
        [0, 'Ça fait longtemps ! Depuis combien de temps tu travailles dans ce studio ?', 'It’s been a long time! How long have you been working in this studio?'],
        [1, { options: ['J’y travaille depuis deux ans maintenant, et depuis que j’ai déménagé, je viens à pied !', 'J’y ai travaillé depuis deux ans maintenant, et depuis que j’ai déménagé, je suis venue à pied !', 'J’y travaille pour deux ans maintenant, et pendant que j’ai déménagé, je viens à pied !'], explain: b('Still working there and still walking now → présent with depuis.', 'Action toujours en cours aujourd’hui → présent avec depuis.') }],
        [0, 'Quelle chance ! Moi, j’ai habité à Lyon pendant six mois pour un stage, et je suis rentré hier.', 'Lucky you! As for me, I lived in Lyon for six months for an internship, and I came back yesterday.'],
        [1, { options: ['Bienvenue à la maison ! On ne s’était pas vus depuis Noël !', 'Bienvenue à la maison ! On ne se voit pas pendant Noël !', 'Bienvenue à la maison ! On ne s’est pas vus pour Noël !'], explain: b('Negative gap from a past point until now → depuis.', 'Absence d’un événement jusqu’à aujourd’hui → depuis.') }],
      ]),
      write(
        b('Compare your past and current routines using quand, pendant and depuis', 'Comparer vos habitudes d’hier et d’aujourd’hui avec quand, pendant et depuis'),
        b('Write 40 to 70 words about a hobby, a move or a job change. Include at least one quand + future (or past), one pendant or pendant que, and one depuis / depuis que with the present tense.', 'Écrivez 40 à 70 mots sur un loisir, un déménagement ou un changement d’activité. Employez au moins un quand (au futur ou au passé), un pendant ou pendant que, et un depuis / depuis que au présent.'),
        40,
        70,
        [
          b('Correct tense after quand / lorsque', 'Temps juste après quand / lorsque'),
          b('Accurate choice between pendant que, pendant and pour', 'Bon choix entre pendant que, pendant et pour'),
          b('Present tense with depuis / depuis que for an ongoing situation', 'Présent avec depuis / depuis que pour ce qui dure encore'),
        ],
        'J’ai travaillé dans un grand hôtel pendant deux ans, mais je suis installé à Nantes depuis six mois. Depuis que j’habite près du fleuve, je cours tous les matins pendant que la ville se réveille. Quand mes amis viendront me voir en juillet, nous irons à la plage pour quatre jours.',
      ),
    ],
    [
      b('Ongoing action continuing now → present tense with depuis / depuis que.', 'Action encore en cours aujourd’hui → présent avec depuis / depuis que.'),
      b('Ongoing action in the past up to a past event → imparfait with depuis.', 'Action en cours dans le passé → imparfait avec depuis.'),
      b('Negative statements ("haven’t seen him since…") naturally take passé composé with depuis.', 'À la négation (« ne pas voir depuis… »), le passé composé s’emploie naturellement avec depuis.'),
    ],
    [
      ['une librairie', b('a bookshop', 'un magasin qui vend des livres')],
      ['à peine', b('barely, hardly', 'presque pas')],
      ['se sentir mieux', b('to feel better', 'être en meilleure forme')],
    ],
  ),
];

export default lessons;
