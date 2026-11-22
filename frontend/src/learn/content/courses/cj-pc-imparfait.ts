import type { CourseAbout } from '../../types';
import { b, card, dict, doc, gap, hear, lesson, mc, ord, P, say, sort, tip, trap, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Il pleuvait quand je suis sorti. Choosing between the passé composé and the imparfait is the question every learner asks. There is no single rule, but four reliable tests: event or background, once or habit, interrupted action, and states that change meaning. This course trains each test with real sentences, then puts them together to tell a story the way French speakers do.',
    'Il pleuvait quand je suis sorti. Choisir entre le passé composé et l’imparfait est la question que se pose chaque apprenant. Il n’y a pas une seule règle, mais quatre tests fiables : événement ou décor, une fois ou habitude, action interrompue, et les états qui changent de sens. Ce cours entraîne chaque test avec de vraies phrases, puis les réunit pour raconter une histoire comme le font les francophones.',
  ),
  outcomes: [
    b('Tell events from background', 'Distinguer événements et décor'),
    b('Tell a single action from a habit', 'Distinguer une action unique d’une habitude'),
    b('Combine an action in progress and an interruption', 'Combiner une action en cours et une interruption'),
    b('Tell a story with both tenses', 'Raconter une histoire avec les deux temps'),
  ],
};

const C = 'cj-pc-imparfait';

export default [
  lesson(C, 1, ['event-or-background', 'evenement-ou-decor'],
    b('Event or background?', 'Événement ou décor ?'),
    b('The passé composé moves the story forward; the imparfait paints the scene.', 'Le passé composé fait avancer l’histoire ; l’imparfait peint la scène.'),
    [b('Recognise events and background', 'Reconnaître les événements et le décor'), b('Use the « what happened next? » test', 'Employer le test « et ensuite ? »'), b('Write both tenses in one sentence', 'Employer les deux temps dans une phrase')],
    13,
    [
      card(b('Two roles in a story', 'Deux rôles dans un récit'), b('In a past story, the **passé composé** tells the events, the actions that move the story forward: **Il est entré, il a pris ses clés, il est reparti.** The **imparfait** paints the background: the scene, the weather, the situation, what was going on: **Il pleuvait, la rue était vide, tout le monde dormait.**', 'Dans un récit au passé, le **passé composé** raconte les événements, les actions qui font avancer l’histoire : **Il est entré, il a pris ses clés, il est reparti.** L’**imparfait** peint le décor : la scène, le temps qu’il faisait, la situation, ce qui se passait : **Il pleuvait, la rue était vide, tout le monde dormait.**'), {
        ex: [['Il faisait nuit et la rue était calme.', 'It was dark and the street was quiet.'], ['Soudain, une voiture s’est arrêtée devant la maison.', 'Suddenly, a car stopped in front of the house.']],
      }),
      tip(b('The test: « and then? »', 'Le test : « et ensuite ? »'), b('If the sentence answers **« And then what happened? »**, use the passé composé. If it answers **« What was it like? »** or **« What was going on? »**, use the imparfait.', 'Si la phrase répond à **« Et ensuite, que s’est-il passé ? »**, employez le passé composé. Si elle répond à **« Comment était-ce ? »** ou **« Que se passait-il ? »**, employez l’imparfait.')),
      sort(b('Event or background?', 'Événement ou décor ?'), [b('event: passé composé', 'événement : passé composé'), b('background: imparfait', 'décor : imparfait')], [['il a ouvert la porte', 0], ['il faisait nuit', 1], ['elle a crié', 0], ['tout le monde dormait', 1], ['le téléphone a sonné', 0], ['j’étais très fatigué', 1]]),
      mc(P.form, ['faisait', 'a fait', 'fait', 'fera'], { fr: 'Quand je suis sorti, il ___ très froid.' }),
      mc(P.form, ['a sonné', 'sonnait', 'sonne', 'sonnera'], { fr: 'Je lisais tranquillement quand le téléphone ___.' }),
      gap(P.complete, 'Il ___ (être) huit heures. Je ___ (prendre) mon café quand quelqu’un ___ (frapper) à la porte.', [['était'], ['prenais'], ['a frappé']]),
      hear('Il pleuvait quand je suis arrivé à la gare.', b('What is the background in this sentence?', 'Quel est le décor dans cette phrase ?'), [b('The rain', 'La pluie'), b('Arriving at the station', 'L’arrivée à la gare'), b('There is no background', 'Il n’y a pas de décor')]),
      dict('Quand nous sommes arrivés, la maison était vide et les fenêtres étaient ouvertes.'),
      say('Il faisait beau, alors nous avons mangé dans le jardin.', 'The weather was nice, so we ate in the garden.'),
    ],
    [
      b('Passé composé: events, actions that move the story forward.', 'Passé composé : les événements, les actions qui font avancer l’histoire.'),
      b('Imparfait: the background, the scene, the situation.', 'Imparfait : le décor, la scène, la situation.'),
      b('Test: « and then? » → passé composé; « what was it like? » → imparfait.', 'Test : « et ensuite ? » → passé composé ; « comment était-ce ? » → imparfait.'),
    ],
    [['frapper', b('to knock', 'taper à la porte')], ['soudain', b('suddenly', 'tout à coup')], ['vide', b('empty', 'sans personne')]],
  ),

  lesson(C, 2, ['once-or-habit', 'une-fois-ou-habitude'],
    b('Once, or a habit?', 'Une fois, ou une habitude ?'),
    b('Samedi, je suis allé au cinéma. Le samedi, j’allais au cinéma.', 'Samedi, je suis allé au cinéma. Le samedi, j’allais au cinéma.'),
    [b('Tell a single action from a repeated one', 'Distinguer une action unique d’une action répétée'), b('Use the right time markers', 'Employer les bons indicateurs de temps'), b('Handle closed periods (pendant dix ans)', 'Traiter les périodes fermées (pendant dix ans)')],
    13,
    [
      card(b('One time, or every time', 'Une fois, ou à chaque fois'), b('A single, finished action takes the **passé composé**: **Samedi, je suis allé au cinéma.** A repeated habit takes the **imparfait**: **Le samedi, j’allais au cinéma.** Single event: **un jour, soudain, tout à coup, hier, ce jour-là, une fois**. Habit: **chaque jour, le samedi, souvent, d’habitude, toujours**.', 'Une action unique et terminée prend le **passé composé** : **Samedi, je suis allé au cinéma.** Une habitude répétée prend l’**imparfait** : **Le samedi, j’allais au cinéma.** Événement unique : **un jour, soudain, tout à coup, hier, ce jour-là, une fois**. Habitude : **chaque jour, le samedi, souvent, d’habitude, toujours**.'), {
        ex: [['D’habitude, je prenais le bus, mais ce jour-là, j’ai pris un taxi.', 'I usually took the bus, but that day I took a taxi.']],
      }),
      trap(b('A closed period takes the passé composé', 'Une période fermée prend le passé composé'), b('A duration that is finished and counted takes the passé composé, even if it is long: **J’ai habité dix ans à Rome.** The imparfait describes the situation at a moment of the story: **J’habitais à Rome quand je l’ai rencontrée.**', 'Une durée terminée et comptée prend le passé composé, même si elle est longue : **J’ai habité dix ans à Rome.** L’imparfait décrit la situation à un moment du récit : **J’habitais à Rome quand je l’ai rencontrée.**')),
      sort(b('Single event or habit?', 'Événement unique ou habitude ?'), [b('single event: passé composé', 'événement unique : passé composé'), b('habit: imparfait', 'habitude : imparfait')], [['tout à coup', 0], ['chaque matin', 1], ['un jour', 0], ['d’habitude', 1], ['ce jour-là', 0], ['tous les étés', 1], ['soudain', 0], ['le dimanche', 1]]),
      mc(P.form, ['a trouvé', 'trouvait', 'trouve', 'trouvera'], { fr: 'Un jour, mon frère ___ un petit chat dans le jardin.' }),
      mc(P.form, ['allions', 'sommes allés', 'allons', 'irons'], { fr: 'Quand j’étais petit, chaque été, nous ___ en Espagne.' }),
      mc(P.form, ['ai travaillé', 'travaillais', 'travaille', 'travaillerai'], { fr: 'J’___ dix ans dans cette entreprise, puis je suis partie.' }),
      gap(P.complete, 'D’habitude, je ___ (rentrer) à pied, mais ce soir-là, je ___ (prendre) un taxi.', [['rentrais'], ['ai pris']]),
      hear('Le dimanche, on allait chez ma grand-mère.', b('Once or a habit?', 'Une fois ou une habitude ?'), [b('A habit: every Sunday', 'Une habitude : chaque dimanche'), b('Only one Sunday', 'Un seul dimanche'), b('Next Sunday', 'Dimanche prochain')]),
      dict('Tous les matins, il courait au bord du lac, mais un jour, il a croisé un orignal.'),
      say('Avant, je mangeais à la cantine, mais hier, j’ai déjeuné au restaurant.', 'I used to eat in the canteen, but yesterday I had lunch at a restaurant.'),
    ],
    [
      b('Once: un jour, soudain, hier, ce jour-là → passé composé.', 'Une fois : un jour, soudain, hier, ce jour-là → passé composé.'),
      b('Habit: chaque jour, le samedi, d’habitude, souvent → imparfait.', 'Habitude : chaque jour, le samedi, d’habitude, souvent → imparfait.'),
      b('A closed, counted period → passé composé (j’ai habité dix ans…).', 'Une période fermée et comptée → passé composé (j’ai habité dix ans…).'),
    ],
    [['la cantine', b('the canteen', 'le restaurant d’une école ou d’une entreprise')], ['croiser', b('to come across', 'rencontrer par hasard')], ['un orignal', b('a moose', 'un grand cerf du Canada')]],
  ),

  lesson(C, 3, ['interrupted-actions-and-states', 'actions-interrompues-et-etats'],
    b('Interrupted actions, states and feelings', 'Actions interrompues, états et sentiments'),
    b('Je dormais quand le réveil a sonné. J’avais peur, j’ai eu peur.', 'Je dormais quand le réveil a sonné. J’avais peur, j’ai eu peur.'),
    [b('Combine an action in progress and an interruption', 'Combiner une action en cours et une interruption'), b('Use pendant que', 'Employer pendant que'), b('Know the verbs that change meaning', 'Connaître les verbes qui changent de sens')],
    13,
    [
      card(b('In progress, then interrupted', 'En cours, puis interrompue'), b('**Imparfait + passé composé**: an action in progress is interrupted by an event: **Je dormais quand le réveil a sonné.** With **pendant que**, two actions in progress at the same time are both in the imparfait: **Pendant que je cuisinais, il lisait.**', '**Imparfait + passé composé** : une action en cours est interrompue par un événement : **Je dormais quand le réveil a sonné.** Avec **pendant que**, deux actions en cours en même temps sont toutes deux à l’imparfait : **Pendant que je cuisinais, il lisait.**'), {
        ex: [['Je traversais la rue quand j’ai vu l’accident.', 'I was crossing the street when I saw the accident.'], ['Pendant que les enfants jouaient, nous discutions.', 'While the children were playing, we were chatting.']],
      }),
      card(b('States that change meaning', 'Les états qui changent de sens'), b('With some verbs, the tense changes the meaning. Fear: **j’avais peur** (I was afraid, a state) and **j’ai eu peur** (I got a fright, a moment). Knowledge: **je savais** (I knew) and **j’ai su** (I found out). People: **je connaissais Paul** (I knew Paul) and **j’ai connu Paul en 2010** (I met Paul in 2010).', 'Avec certains verbes, le temps change le sens. La peur : **j’avais peur** (un état) et **j’ai eu peur** (un moment de frayeur). Le savoir : **je savais** (je connaissais l’information) et **j’ai su** (je l’ai appris). Les personnes : **je connaissais Paul** (nous nous connaissions) et **j’ai connu Paul en 2010** (je l’ai rencontré en 2010).')),
      mc(P.form, ['est entré', 'entrait', 'entre', 'entrera'], { fr: 'Nous étions en pleine réunion quand le directeur ___.' }),
      mc(P.meaning, [b('I found out the truth yesterday', 'J’ai appris la vérité hier'), b('I always knew the truth', 'J’ai toujours connu la vérité'), b('I will know the truth tomorrow', 'Je saurai la vérité demain'), b('I didn’t want to know the truth', 'Je ne voulais pas savoir la vérité')], { fr: 'Hier, j’ai su la vérité.' }),
      gap(P.complete, 'Pendant que nous ___ (dîner), il ___ (commencer) à pleuvoir.', [['dînions'], ['a commencé']]),
      ord(P.order, 'Je traversais le parc quand mon téléphone a sonné.', { tr: 'I was crossing the park when my phone rang.' }),
      hear('J’ai eu très peur.', P.meaning, [b('I got a real fright, at one moment', 'J’ai eu une grande frayeur, à un moment précis'), b('I was afraid for a long time', 'J’ai été inquiet pendant longtemps'), b('I am afraid now', 'J’ai peur maintenant')]),
      dict('Pendant que je cherchais mes clés, le bus est parti sans moi.'),
      say('Je dormais déjà quand tu as appelé.', 'I was already asleep when you called.'),
    ],
    [
      b('Interrupted action: imparfait + quand + passé composé.', 'Action interrompue : imparfait + quand + passé composé.'),
      b('pendant que + imparfait for two simultaneous actions.', 'pendant que + imparfait pour deux actions simultanées.'),
      b('avais peur / ai eu peur, savais / ai su, connaissais / ai connu.', 'avais peur / ai eu peur, savais / ai su, connaissais / ai connu.'),
    ],
    [['un réveil', b('an alarm clock', 'une horloge qui sonne pour réveiller')], ['en pleine réunion', b('in the middle of a meeting', 'au milieu d’une réunion')], ['une frayeur', b('a fright', 'une peur soudaine')]],
  ),

  lesson(C, 4, ['telling-a-story', 'raconter-une-histoire'],
    b('Telling a story: review', 'Raconter une histoire : bilan'),
    b('Setting, trigger, events, ending: the shape of a story in the past.', 'Décor, déclencheur, événements, fin : la forme d’un récit au passé.'),
    [b('Follow the shape of a past story', 'Suivre la structure d’un récit au passé'), b('Choose the tense in a full text', 'Choisir le temps dans un texte complet'), b('Tell an unexpected event', 'Raconter un événement inattendu')],
    13,
    [
      card(b('The shape of a story', 'La forme d’un récit'), b('Most stories follow four steps. Setting: **c’était un samedi, il faisait beau** (imparfait). Trigger: **soudain, un jour, tout à coup** + passé composé. Events: **il a couru, il a appelé** (passé composé). Ending: **j’étais soulagé** (imparfait) or **tout s’est bien terminé** (passé composé).', 'La plupart des récits suivent quatre étapes. Décor : **c’était un samedi, il faisait beau** (imparfait). Déclencheur : **soudain, un jour, tout à coup** + passé composé. Événements : **il a couru, il a appelé** (passé composé). Fin : **j’étais soulagé** (imparfait) ou **tout s’est bien terminé** (passé composé).')),
      doc({ title: 'Une drôle de matinée', text: 'C’était un lundi matin et il neigeait depuis la veille. Je marchais vers l’arrêt de bus quand j’ai vu un petit chien seul au milieu de la rue. Il tremblait. Je l’ai pris dans mes bras et j’ai lu son collier : il habitait dans l’immeuble d’en face. Sa propriétaire pleurait devant la porte. Quand elle l’a vu, elle a souri. Je suis arrivé en retard au travail, mais j’étais heureux.', look: 'article' }, b('Why was the narrator late for work?', 'Pourquoi le narrateur est-il arrivé en retard ?'), [b('He brought a lost dog back to its owner', 'Il a ramené un chien perdu à sa propriétaire'), b('The bus did not come because of the snow', 'Le bus n’est pas passé à cause de la neige'), b('He fell in the snow', 'Il est tombé dans la neige'), b('His dog ran away', 'Son chien s’est enfui')]),
      gap(P.completeText, 'C’___ (être) l’été et nous ___ (camper) au bord d’un lac. Une nuit, un bruit nous ___ (réveiller). Mon père ___ (sortir) de la tente : un raton laveur ___ (manger) nos provisions !', [['était'], ['campions'], ['a réveillés'], ['est sorti'], ['mangeait']], { explain: b('Nous is a direct object placed before avoir, so the participle agrees: nous a réveillés.', 'Nous est un COD placé avant avoir, donc le participe s’accorde : nous a réveillés.') }),
      mc(P.best, ['Pendant que je faisais la queue, quelqu’un m’a volé mon portefeuille.', 'Pendant que j’ai fait la queue, quelqu’un me volait mon portefeuille.', 'Pendant que je fais la queue, quelqu’un m’a volé mon portefeuille hier.', 'Pendant que j’ai fait la queue, quelqu’un m’a volé mon portefeuille chaque jour.']),
      hear('Il neigeait depuis le matin et soudain, la lumière s’est éteinte.', b('What happened suddenly?', 'Qu’est-ce qui s’est passé soudainement ?'), [b('The light went out', 'La lumière s’est éteinte'), b('It started to snow', 'Il a commencé à neiger'), b('Someone arrived', 'Quelqu’un est arrivé')]),
      write(b('An unexpected event', 'Un événement inattendu'), b('In 50 to 80 words, tell an unexpected event from your life (a meeting, a problem, a surprise). Set the scene in the imparfait, then tell the events in the passé composé.', 'En 50 à 80 mots, racontez un événement inattendu de votre vie (une rencontre, un problème, une surprise). Posez le décor à l’imparfait, puis racontez les événements au passé composé.'), 50, 80, [
        b('A setting in the imparfait (weather, place, situation)', 'Un décor à l’imparfait (temps, lieu, situation)'),
        b('A trigger: soudain, tout à coup, un jour', 'Un déclencheur : soudain, tout à coup, un jour'),
        b('Three events in the passé composé', 'Trois événements au passé composé'),
      ], 'C’était un vendredi soir et il pleuvait beaucoup. J’attendais le métro avec un livre à la main. Tout à coup, une femme m’a demandé si j’aimais ce roman. Nous avons commencé à parler et nous avons raté trois métros ! Elle était professeure de littérature et elle connaissait bien l’auteur. Nous sommes restés amis et nous nous voyons encore souvent.'),
      say('C’était un samedi, il faisait beau, et soudain, tout a changé.', 'It was a Saturday, the weather was nice, and suddenly everything changed.'),
    ],
    [
      b('Setting in the imparfait, trigger and events in the passé composé.', 'Décor à l’imparfait, déclencheur et événements au passé composé.'),
      b('Triggers: soudain, tout à coup, un jour, à ce moment-là.', 'Déclencheurs : soudain, tout à coup, un jour, à ce moment-là.'),
      b('Feelings at the end: imparfait (j’étais heureux).', 'Sentiments à la fin : imparfait (j’étais heureux).'),
    ],
    [['un collier', b('a (dog) collar', 'un cercle autour du cou d’un animal')], ['faire la queue', b('to queue', 'attendre son tour en file')], ['un raton laveur', b('a raccoon', 'un petit animal nocturne')]],
  ),
];
