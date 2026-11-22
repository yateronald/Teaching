import type { CourseAbout } from '../../types';
import { b, card, conj, dict, doc, gap, hear, lesson, mc, ord, P, pairs, say, sort, tip, trap, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Il faisait beau, nous habitions à la campagne, je lisais tous les soirs. The imparfait describes the past: places, people, weather, feelings and habits. Good news: one rule works for almost every verb, with a single exception. This course trains the forms, then the three main uses (description, habit, action in progress), the imparfait in everyday conversation (Si on allait… ? Je voulais vous demander…), and ends with a childhood memory.',
    'Il faisait beau, nous habitions à la campagne, je lisais tous les soirs. L’imparfait décrit le passé : les lieux, les personnes, le temps qu’il faisait, les sentiments et les habitudes. Bonne nouvelle : une seule règle fonctionne pour presque tous les verbes, avec une seule exception. Ce cours entraîne les formes, puis les trois emplois principaux (description, habitude, action en cours), l’imparfait dans la conversation (Si on allait… ? Je voulais vous demander…), et se termine par un souvenir d’enfance.',
  ),
  outcomes: [
    b('Form the imparfait of any verb', 'Former l’imparfait de n’importe quel verbe'),
    b('Describe a place, a person and the weather in the past', 'Décrire un lieu, une personne et le temps dans le passé'),
    b('Talk about past habits', 'Parler des habitudes passées'),
    b('Make suggestions and polite requests with the imparfait', 'Faire des suggestions et des demandes polies avec l’imparfait'),
  ],
};

const C = 'cj-imparfait';
const IMP = b('imparfait', 'imparfait');

export default [
  lesson(C, 1, ['forming-the-imparfait', 'former-l-imparfait'],
    b('One rule for almost every verb', 'Une règle pour presque tous les verbes'),
    b('Take the nous form of the present, remove -ons, add the endings.', 'Prenez la forme nous du présent, enlevez -ons, ajoutez les terminaisons.'),
    [b('Find the imparfait stem', 'Trouver le radical de l’imparfait'), b('Add the six endings', 'Ajouter les six terminaisons'), b('Know the être exception', 'Connaître l’exception être')],
    13,
    [
      card(b('From nous in the present', 'À partir de nous au présent'), b('Take **nous** in the present, remove **-ons**, and add the endings. Endings: **-ais, -ais, -ait, -ions, -iez, -aient**. It works even for irregular verbs: **nous faisons → je faisais**, **nous prenons → je prenais**.', 'Prenez **nous** au présent, enlevez **-ons** et ajoutez les terminaisons. Terminaisons : **-ais, -ais, -ait, -ions, -iez, -aient**. Cela marche même pour les verbes irréguliers : **nous faisons → je faisais**, **nous prenons → je prenais**.'), {
        table: {
          head: ['', 'parler (nous parlons)', 'finir (nous finissons)', 'prendre (nous prenons)'],
          rows: [['je', 'parlais', 'finissais', 'prenais'], ['tu', 'parlais', 'finissais', 'prenais'], ['il / elle', 'parlait', 'finissait', 'prenait'], ['nous', 'parlions', 'finissions', 'prenions'], ['vous', 'parliez', 'finissiez', 'preniez'], ['ils / elles', 'parlaient', 'finissaient', 'prenaient']],
        },
      }),
      trap(b('One exception, and two spellings', 'Une exception, et deux orthographes'), b('Only **être** has another stem: **ét-**: **j’étais, nous étions**. And the -ger and -cer verbs keep their sound before a, but not before i: **je mangeais, je commençais**, but **nous mangions, nous commencions**.', 'Seul **être** a un autre radical : **ét-** : **j’étais, nous étions**. Et les verbes en -ger et -cer gardent leur son devant a, mais pas devant i : **je mangeais, je commençais**, mais **nous mangions, nous commencions**.')),
      conj('être', IMP, [['j’', 'étais'], ['tu', 'étais'], ['il / elle', 'était'], ['nous', 'étions'], ['vous', 'étiez'], ['ils / elles', 'étaient']], { given: [0] }),
      conj('avoir', IMP, [['j’', 'avais'], ['tu', 'avais'], ['il / elle', 'avait'], ['nous', 'avions'], ['vous', 'aviez'], ['ils / elles', 'avaient']], { given: [0] }),
      mc(P.form, ['faisait', 'faisais', 'fesait', 'fasait'], { fr: 'Quand j’étais petit, il ___ très froid en hiver.' }),
      mc(P.spelling, ['mangeais', 'mangais', 'mangeait', 'mangai'], { fr: 'Enfant, je ___ beaucoup de bonbons.' }),
      gap(P.complete, 'Avant, nous ___ (habiter) à la campagne. Mon père ___ (prendre) le bus et ma mère ___ (finir) tard.', [['habitions'], ['prenait'], ['finissait']]),
      sort(b('Which ending?', 'Quelle terminaison ?'), [b('-ais: je, tu', '-ais : je, tu'), b('-ait: il, elle, on', '-ait : il, elle, on'), b('-aient: ils, elles', '-aient : ils, elles')], [['tu dormais', 0], ['elle chantait', 1], ['ils jouaient', 2], ['je lisais', 0], ['on attendait', 1], ['elles savaient', 2]]),
      hear('Nous habitions près de la mer.', b('Which tense do you hear?', 'Quel temps entendez-vous ?'), [b('Imparfait: you hear « -ions »', 'Imparfait : on entend « -ions »'), b('Present', 'Présent'), b('Passé composé', 'Passé composé')]),
      dict('Quand nous étions enfants, nous passions tous nos étés chez notre grand-mère.'),
      say('Avant, je travaillais à Lyon et je prenais le train tous les jours.', 'I used to work in Lyon and take the train every day.'),
    ],
    [
      b('Stem: nous in the present minus -ons (nous faisons → fais-).', 'Radical : nous au présent sans -ons (nous faisons → fais-).'),
      b('Endings: -ais, -ais, -ait, -ions, -iez, -aient.', 'Terminaisons : -ais, -ais, -ait, -ions, -iez, -aient.'),
      b('Exception: être → ét- (j’étais).', 'Exception : être → ét- (j’étais).'),
    ],
    [['la campagne', b('the countryside', 'la région hors des villes')], ['un bonbon', b('a sweet, a candy', 'une petite friandise')], ['passer l’été', b('to spend the summer', 'rester tout l’été')]],
  ),

  lesson(C, 2, ['description-and-habits', 'description-et-habitudes'],
    b('Describing the past and past habits', 'Décrire le passé et les habitudes passées'),
    b('The setting, the people, the weather, the feelings, and what you used to do.', 'Le décor, les personnes, le temps, les sentiments, et ce que l’on faisait d’habitude.'),
    [b('Describe a scene in the past', 'Décrire une scène au passé'), b('Talk about past habits', 'Parler des habitudes passées'), b('Use time markers of habit', 'Employer les indicateurs d’habitude')],
    13,
    [
      card(b('Three uses', 'Trois emplois'), b('The imparfait paints the background of the past. It describes a scene: **il faisait beau, la maison était grande, j’étais heureux**. It tells habits: **le dimanche, nous allions chez mes grands-parents**. It shows an action in progress: **je lisais quand le téléphone a sonné**.', 'L’imparfait peint le décor du passé. Il décrit une scène : **il faisait beau, la maison était grande, j’étais heureux**. Il raconte les habitudes : **le dimanche, nous allions chez mes grands-parents**. Il montre une action en cours : **je lisais quand le téléphone a sonné**.'), {
        ex: [['La rue était calme et il neigeait doucement.', 'The street was quiet and it was snowing gently.'], ['Tous les étés, nous allions au bord de la mer.', 'Every summer, we used to go to the seaside.']],
      }),
      tip(b('The words of habit', 'Les mots de l’habitude'), b('These markers often call for the imparfait. Habit markers: **avant, autrefois, d’habitude, souvent, tous les jours, le dimanche, quand j’étais petit**.', 'Ces indicateurs appellent souvent l’imparfait. Indicateurs d’habitude : **avant, autrefois, d’habitude, souvent, tous les jours, le dimanche, quand j’étais petit**.')),
      mc(P.form, ['allions', 'sommes allés', 'allons', 'irons'], { fr: 'Quand j’étais petite, nous ___ à la plage tous les dimanches.' }),
      mc(P.form, ['était', 'a été', 'est', 'sera'], { fr: 'La maison de mes grands-parents ___ grande et lumineuse.' }),
      gap(P.completeText, 'Autrefois, il n’y ___ (avoir) pas de supermarché dans le village. Les gens ___ (faire) leurs courses au marché et ils ___ (connaître) tous les commerçants.', [['avait'], ['faisaient'], ['connaissaient']]),
      pairs(b('Match each sentence with its use.', 'Associez chaque phrase à son emploi.'), [['Il pleuvait et il faisait froid.', b('description', 'description')], ['Chaque soir, je lisais une histoire.', b('habit', 'habitude')], ['Je dormais quand tu as appelé.', b('action in progress', 'action en cours')]]),
      doc({ title: 'Mon quartier il y a trente ans', text: 'Quand j’étais enfant, mon quartier était très différent. Il y avait une boulangerie à chaque coin de rue et les enfants jouaient dehors jusqu’au soir. Le samedi, mon père achetait le journal et nous allions au cinéma du centre. Personne n’avait de téléphone portable, mais tout le monde se connaissait.', look: 'article' }, b('What did the family do on Saturdays?', 'Que faisait la famille le samedi ?'), [b('The father bought the paper and they went to the cinema', 'Le père achetait le journal et ils allaient au cinéma'), b('They played outside until the evening', 'Ils jouaient dehors jusqu’au soir'), b('They went to the bakery', 'Ils allaient à la boulangerie'), b('They called their friends', 'Ils appelaient leurs amis')]),
      hear('D’habitude, je me levais à six heures.', b('What does the person describe?', 'Que décrit la personne ?'), [b('A habit in the past', 'Une habitude passée'), b('A plan for tomorrow', 'Un projet pour demain'), b('One morning only', 'Un seul matin')]),
      dict('Le soir, mon grand-père racontait des histoires et nous l’écoutions en silence.'),
      say('Quand j’étais petit, je voulais être pilote.', 'When I was little, I wanted to be a pilot.'),
    ],
    [
      b('Description: il faisait beau, j’étais fatigué.', 'Description : il faisait beau, j’étais fatigué.'),
      b('Habit: tous les jours, le dimanche, avant + imparfait.', 'Habitude : tous les jours, le dimanche, avant + imparfait.'),
      b('Action in progress: je lisais quand…', 'Action en cours : je lisais quand…'),
    ],
    [['autrefois', b('in the past, formerly', 'dans le passé')], ['un commerçant', b('a shopkeeper', 'une personne qui tient un magasin')], ['lumineux', b('bright, full of light', 'plein de lumière')]],
  ),

  lesson(C, 3, ['imparfait-in-conversation', 'l-imparfait-dans-la-conversation'],
    b('The imparfait in conversation', 'L’imparfait dans la conversation'),
    b('Si on allait au cinéma ?, Si seulement j’avais le temps !, Je voulais vous demander…', 'Si on allait au cinéma ?, Si seulement j’avais le temps !, Je voulais vous demander…'),
    [b('Make a suggestion with si + imparfait', 'Faire une suggestion avec si + imparfait'), b('Express a wish or a regret', 'Exprimer un souhait ou un regret'), b('Soften a request', 'Adoucir une demande')],
    13,
    [
      card(b('Three everyday uses', 'Trois emplois du quotidien'), b('Spoken French uses the imparfait for more than the past. A suggestion: **Si on allait au cinéma ?** (How about going to the cinema?). A wish: **Si seulement j’avais plus de temps !** A polite request: **Je voulais vous demander un service.** The imparfait makes the request softer.', 'Le français parlé emploie l’imparfait pour autre chose que le passé. Une suggestion : **Si on allait au cinéma ?** Un souhait : **Si seulement j’avais plus de temps !** Une demande polie : **Je voulais vous demander un service.** L’imparfait adoucit la demande.'), {
        ex: [['Si on prenait un café avant la réunion ?', 'How about having a coffee before the meeting?'], ['Si seulement il faisait plus chaud !', 'If only it were warmer!'], ['Je venais pour l’annonce de l’appartement.', 'I’m here about the flat advert.']],
      }),
      tip(b('Si + imparfait, then the conditional', 'Si + imparfait, puis le conditionnel'), b('With a consequence, si + imparfait makes a hypothesis: **Si j’avais une voiture, je partirais en week-end.** You will study the conditional in the B1 courses; for now, notice that **si** is followed by the imparfait.', 'Avec une conséquence, si + imparfait exprime une hypothèse : **Si j’avais une voiture, je partirais en week-end.** Vous étudierez le conditionnel dans les cours de B1 ; pour l’instant, remarquez que **si** est suivi de l’imparfait.')),
      mc(P.best, ['Si on allait au parc cet après-midi ?', 'Si on va au parc hier ?', 'Si on est allés au parc cet après-midi ?', 'Si on ira au parc cet après-midi ?']),
      mc(P.form, ['avais', 'ai', 'aurai', 'avoir'], { fr: 'Ah, si seulement j’___ un jardin !' }),
      mc(P.best, ['Je voulais savoir si vous aviez encore des places.', 'Je veux savoir si vous aviez encore des places, vite.', 'Je voudrai savoir si vous avez encore des places hier.', 'Je savais si vous aviez des places.']),
      gap(P.complete, 'Si on ___ (partir) un peu plus tôt ? Si seulement nous ___ (être) en vacances !', [['partait'], ['étions']]),
      ord(P.order, 'Je voulais vous demander un petit service.', { tr: 'I wanted to ask you a small favour.' }),
      hear('Si on faisait une pause ?', b('What is the person doing?', 'Que fait la personne ?'), [b('Suggesting a break', 'Proposer une pause'), b('Talking about a past break', 'Parler d’une pause passée'), b('Refusing a break', 'Refuser une pause')]),
      dict('Si on invitait nos voisins samedi soir ? Ils étaient si gentils avec nous.'),
      say('Je voulais savoir si la réunion était toujours à dix heures.', 'I wanted to know if the meeting was still at ten.'),
    ],
    [
      b('Suggestion: Si on + imparfait ? (Si on allait… ?)', 'Suggestion : Si on + imparfait ? (Si on allait… ?)'),
      b('Wish or regret: Si seulement + imparfait !', 'Souhait ou regret : Si seulement + imparfait !'),
      b('Politeness: Je voulais vous demander…', 'Politesse : Je voulais vous demander…'),
    ],
    [['rendre un service', b('to do a favour', 'aider quelqu’un')], ['une annonce', b('an advert, a listing', 'un texte qui propose quelque chose')], ['faire une pause', b('to take a break', 's’arrêter un moment')]],
  ),

  lesson(C, 4, ['childhood-memories-review', 'souvenirs-d-enfance-bilan'],
    b('A childhood memory', 'Un souvenir d’enfance'),
    b('Put everything together: description, habits and feelings in one memory.', 'Tout réunir : description, habitudes et sentiments dans un souvenir.'),
    [b('Read a memory in the imparfait', 'Lire un souvenir à l’imparfait'), b('Conjugate frequent irregular verbs', 'Conjuguer les irréguliers fréquents'), b('Write your own memory', 'Écrire votre propre souvenir')],
    13,
    [
      card(b('A memory in the imparfait', 'Un souvenir à l’imparfait'), b('A memory is often a picture: where you were, what it looked like, what people used to do, how you felt. Useful openings: **Quand j’étais petit, À cette époque, Chaque été, Je me souviens que…**', 'Un souvenir est souvent un tableau : où l’on était, à quoi cela ressemblait, ce que les gens faisaient, ce que l’on ressentait. Débuts utiles : **Quand j’étais petit, À cette époque, Chaque été, Je me souviens que…**'), {
        ex: [['À cette époque, nous n’avions pas de télévision.', 'Back then, we didn’t have a television.'], ['Je me souviens que ma mère chantait en cuisinant.', 'I remember my mother singing while she cooked.']],
      }),
      conj('faire', IMP, [['je', 'faisais'], ['tu', 'faisais'], ['il / elle', 'faisait'], ['nous', 'faisions'], ['vous', 'faisiez'], ['ils / elles', 'faisaient']], { given: [3] }),
      conj('aller', IMP, [['j’', 'allais'], ['tu', 'allais'], ['il / elle', 'allait'], ['nous', 'allions'], ['vous', 'alliez'], ['ils / elles', 'allaient']], { given: [3] }),
      gap(P.completeText, 'Chaque été, nous ___ (aller) chez ma tante en Bretagne. Sa maison ___ (être) près de la mer et il y ___ (avoir) toujours du vent. Le matin, mon cousin et moi, nous ___ (pêcher) avec mon oncle.', [['allions'], ['était'], ['avait'], ['pêchions']]),
      mc(P.form, ['savait', 'savais', 'a su', 'sait'], { fr: 'Ma grand-mère ___ faire les meilleures crêpes du monde.' }),
      mc(P.form, ['voyions', 'voyons', 'voyiions', 'vions'], { fr: 'De notre fenêtre, nous ___ les montagnes.' }),
      say('À cette époque, nous habitions dans un petit village et nous allions à l’école à pied.', 'Back then, we lived in a small village and walked to school.'),
      write(b('Your childhood memory', 'Votre souvenir d’enfance'), b('In 40 to 70 words, describe a place you loved as a child: what it looked like, what you used to do there, and how you felt. Use the imparfait.', 'En 40 à 70 mots, décrivez un lieu que vous aimiez enfant : à quoi il ressemblait, ce que vous y faisiez, et ce que vous ressentiez. Employez l’imparfait.'), 40, 70, [
        b('Description of the place (il y avait, c’était…)', 'Description du lieu (il y avait, c’était…)'),
        b('Two habits (chaque jour, le dimanche…)', 'Deux habitudes (chaque jour, le dimanche…)'),
        b('One feeling (j’étais heureux, j’avais peur…)', 'Un sentiment (j’étais heureux, j’avais peur…)'),
      ], 'Quand j’étais petit, je passais mes vacances dans la ferme de mes grands-parents. Il y avait des vaches, un grand jardin et une rivière derrière la maison. Chaque matin, j’aidais mon grand-père et l’après-midi, je nageais avec mes cousins. Le soir, nous mangions tous dehors. J’étais libre et très heureux.'),
      dict('Je me souviens que nous mangions dehors quand il faisait beau.'),
    ],
    [
      b('Openings: Quand j’étais petit, À cette époque, Chaque été.', 'Débuts : Quand j’étais petit, À cette époque, Chaque été.'),
      b('voir: nous voyions, vous voyiez (y + i).', 'voir : nous voyions, vous voyiez (y + i).'),
      b('A memory mixes description, habits and feelings.', 'Un souvenir mêle description, habitudes et sentiments.'),
    ],
    [['à cette époque', b('back then', 'en ce temps-là')], ['pêcher', b('to fish', 'attraper des poissons')], ['se souvenir', b('to remember', 'garder en mémoire')]],
  ),
];
