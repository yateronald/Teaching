import type { CourseAbout } from '../../types';
import { b, card, dict, doc, gap, hear, lesson, mc, P, pairs, say, sort, tip, trap, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Bien qu’il fût tard… Il eût été préférable… Qui l’eût cru ? The imperfect and pluperfect subjunctive belong to classic literature and to very formal writing. Nobody uses them in conversation, but a C2 reader must recognise them instantly, understand their modern equivalent, and know the set phrases that are still alive today. This course trains recognition first, then meaning, then a careful pastiche.',
    'Bien qu’il fût tard… Il eût été préférable… Qui l’eût cru ? Le subjonctif imparfait et le subjonctif plus-que-parfait appartiennent à la littérature classique et à l’écrit très soutenu. Personne ne les emploie dans la conversation, mais un lecteur de niveau C2 doit les reconnaître immédiatement, comprendre leur équivalent moderne et connaître les tournures figées qui vivent encore aujourd’hui. Ce cours entraîne d’abord la reconnaissance, puis le sens, puis un pastiche soigné.',
  ),
  outcomes: [
    b('Recognise the imperfect subjunctive', 'Reconnaître le subjonctif imparfait'),
    b('Recognise the pluperfect subjunctive and its conditional use', 'Reconnaître le subjonctif plus-que-parfait et son emploi conditionnel'),
    b('Give the modern equivalent of a literary sentence', 'Donner l’équivalent moderne d’une phrase littéraire'),
    b('Use the set phrases still alive today', 'Employer les tournures figées encore vivantes'),
  ],
};

const C = 'cj-subjonctif-imparfait';

export default [
  lesson(C, 1, ['imperfect-subjunctive', 'subjonctif-imparfait'],
    b('The imperfect subjunctive', 'Le subjonctif imparfait'),
    b('Qu’il fût, qu’il eût, qu’il vînt: built on the passé simple.', 'Qu’il fût, qu’il eût, qu’il vînt : construit sur le passé simple.'),
    [b('Know when classic texts use it', 'Savoir quand les textes classiques l’emploient'), b('Build it from the passé simple', 'Le construire à partir du passé simple'), b('Tell qu’il fût from il fut', 'Distinguer qu’il fût de il fut')],
    13,
    [
      card(b('A subjunctive for the past', 'Un subjonctif pour le passé'), b('In classic texts, after a main verb in the past, the subjunctive goes into the imperfect: **Je voulais qu’il vînt.** (Modern French: qu’il vienne.) To build it, take the passé simple at **tu** and add **-se**: **tu parlas → que je parlasse**, **tu fus → que je fusse**. You will mostly meet the third person singular, with a circumflex: **qu’il parlât, qu’il finît, qu’il fût, qu’il eût, qu’il fît, qu’il vînt**.', 'Dans les textes classiques, après un verbe principal au passé, le subjonctif passe à l’imparfait : **Je voulais qu’il vînt.** (Français moderne : qu’il vienne.) Pour le former, prenez le passé simple à **tu** et ajoutez **-se** : **tu parlas → que je parlasse**, **tu fus → que je fusse**. Vous rencontrerez surtout la troisième personne du singulier, avec un accent circonflexe : **qu’il parlât, qu’il finît, qu’il fût, qu’il eût, qu’il fît, qu’il vînt**.'), {
        table: {
          head: ['', 'être', 'avoir', 'parler'],
          rows: [['que je / j’', 'fusse', 'eusse', 'parlasse'], ['que tu', 'fusses', 'eusses', 'parlasses'], ['qu’il / elle', 'fût', 'eût', 'parlât'], ['que nous', 'fussions', 'eussions', 'parlassions'], ['que vous', 'fussiez', 'eussiez', 'parlassiez'], ['qu’ils / elles', 'fussent', 'eussent', 'parlassent']],
        },
      }),
      trap(b('Qu’il fût or il fut?', 'Qu’il fût ou il fut ?'), b('The circumflex makes the difference: **il fut surpris** (passé simple, an event) and **bien qu’il fût surpris** (imperfect subjunctive, after a trigger). The same goes for **il eut / qu’il eût**, **il fit / qu’il fît**, **il vint / qu’il vînt**.', 'L’accent circonflexe fait la différence : **il fut surpris** (passé simple, un événement) et **bien qu’il fût surpris** (subjonctif imparfait, après un déclencheur). Il en va de même pour **il eut / qu’il eût**, **il fit / qu’il fît**, **il vint / qu’il vînt**.')),
      sort(b('Passé simple or imperfect subjunctive?', 'Passé simple ou subjonctif imparfait ?'), [b('passé simple', 'passé simple'), b('imperfect subjunctive', 'subjonctif imparfait')], [['il fut', 0], ['qu’il fût', 1], ['il eut', 0], ['qu’il eût', 1], ['il vint', 0], ['qu’il vînt', 1]]),
      pairs(b('Match each form with its infinitive.', 'Associez chaque forme à son infinitif.'), [['qu’il fît', 'faire'], ['qu’il pût', 'pouvoir'], ['qu’il sût', 'savoir'], ['qu’il dît', 'dire'], ['qu’il allât', 'aller'], ['qu’il prît', 'prendre']], true),
      mc(b('Which is the modern equivalent?', 'Quel est l’équivalent moderne ?'), ['Il fallait qu’elle parte.', 'Il fallait qu’elle partait.', 'Il faut qu’elle partira.', 'Il fallait qu’elle partirait.'], { fr: 'Il fallait qu’elle partît.' }),
      mc(b('Which is the imperfect subjunctive?', 'Laquelle est au subjonctif imparfait ?'), ['qu’il chantât', 'qu’il chanta', 'qu’il chantait', 'qu’il chantera']),
      hear('Bien qu’il fût tard, elle continuait à lire.', P.meaning, [b('Although it was late, she kept reading', 'Bien qu’il soit tard, elle continuait à lire'), b('Because it was late, she stopped reading', 'Parce qu’il était tard, elle arrêta de lire'), b('It will be late when she reads', 'Il sera tard quand elle lira')]),
      dict('Bien qu’il fût tard, elle voulut qu’on l’attendît.'),
      say('Il aurait fallu qu’il vînt plus tôt.', 'He should have come earlier.'),
    ],
    [
      b('Imperfect subjunctive: passé simple (tu) + -se: que je parlasse, que je fusse.', 'Subjonctif imparfait : passé simple (tu) + -se : que je parlasse, que je fusse.'),
      b('Third person singular with a circumflex: qu’il fût, qu’il eût, qu’il vînt.', 'Troisième personne du singulier avec circonflexe : qu’il fût, qu’il eût, qu’il vînt.'),
      b('Modern French uses the present subjunctive instead.', 'Le français moderne emploie le subjonctif présent à la place.'),
    ],
    [['un déclencheur', b('a trigger', 'ce qui provoque')], ['soutenu', b('formal (register)', 'd’un registre élevé')], ['continuer à', b('to keep on', 'ne pas s’arrêter de')]],
  ),

  lesson(C, 2, ['pluperfect-subjunctive', 'subjonctif-plus-que-parfait'],
    b('The pluperfect subjunctive', 'Le subjonctif plus-que-parfait'),
    b('Qu’il eût fini, qu’elle fût partie, and the literary conditional: il eût été préférable.', 'Qu’il eût fini, qu’elle fût partie, et le conditionnel littéraire : il eût été préférable.'),
    [b('Form the pluperfect subjunctive', 'Former le subjonctif plus-que-parfait'), b('Recognise it as a literary past conditional', 'Le reconnaître comme conditionnel passé littéraire'), b('Understand qui l’eût cru and eût-il su', 'Comprendre qui l’eût cru et eût-il su')],
    13,
    [
      card(b('A compound literary subjunctive', 'Un subjonctif littéraire composé'), b('The pluperfect subjunctive is the auxiliary in the imperfect subjunctive + the participle: **qu’il eût fini, qu’elle fût partie**. In classic texts, it also replaces the past conditional, the « second form »: **Il eût été préférable de partir.** (= il aurait été préférable) **Qui l’eût cru ?** (= qui l’aurait cru ?) **Eût-il su, il serait venu.** (= s’il avait su)', 'Le subjonctif plus-que-parfait, c’est l’auxiliaire au subjonctif imparfait + le participe : **qu’il eût fini, qu’elle fût partie**. Dans les textes classiques, il remplace aussi le conditionnel passé, la « deuxième forme » : **Il eût été préférable de partir.** (= il aurait été préférable) **Qui l’eût cru ?** (= qui l’aurait cru ?) **Eût-il su, il serait venu.** (= s’il avait su)')),
      tip(b('Read it in modern French', 'Lisez-le en français moderne'), b('Two translations cover almost every case. After que: the past subjunctive (**qu’il eût fini → qu’il ait fini**). In the main clause or with inversion: the past conditional or si + plus-que-parfait (**il eût fallu → il aurait fallu**, **eût-il su → s’il avait su**).', 'Deux traductions couvrent presque tous les cas. Après que : le subjonctif passé (**qu’il eût fini → qu’il ait fini**). Dans la principale ou avec l’inversion : le conditionnel passé ou si + plus-que-parfait (**il eût fallu → il aurait fallu**, **eût-il su → s’il avait su**).')),
      mc(P.meaning, [b('Who would have believed it?', 'Qui l’aurait cru ?'), b('Who believed it?', 'Qui l’a cru ?'), b('Who will believe it?', 'Qui le croira ?'), b('Who believes it?', 'Qui le croit ?')], { fr: 'Qui l’eût cru ?' }),
      mc(b('Which is the modern equivalent?', 'Quel est l’équivalent moderne ?'), ['Il aurait mieux valu attendre.', 'Il a mieux valu attendre.', 'Il vaudra mieux attendre.', 'Il valait mieux attendre demain.'], { fr: 'Il eût mieux valu attendre.' }),
      mc(b('Which is the modern equivalent?', 'Quel est l’équivalent moderne ?'), ['S’il avait su, il serait venu.', 'S’il savait, il viendrait.', 'Il sut et il vint.', 'S’il aurait su, il serait venu.'], { fr: 'Eût-il su, il serait venu.' }),
      sort(b('Imperfect or pluperfect subjunctive?', 'Subjonctif imparfait ou plus-que-parfait ?'), [b('imperfect: qu’il vînt', 'imparfait : qu’il vînt'), b('pluperfect: qu’il fût venu', 'plus-que-parfait : qu’il fût venu')], [['qu’il vînt', 0], ['qu’il fût venu', 1], ['qu’elle eût', 0], ['qu’elle eût dit', 1], ['qu’ils fussent', 0], ['qu’ils fussent partis', 1]]),
      gap(P.complete, 'Il eût été plus sage de refuser. → Il ___ plus sage de refuser.', [['aurait été']], { hint: b('Give the modern past conditional.', 'Donnez le conditionnel passé moderne.') }),
      hear('Il eût été plus simple de tout dire.', P.meaning, [b('It would have been simpler to tell everything', 'Il aurait été plus simple de tout dire'), b('It was simple to tell everything', 'C’était simple de tout dire'), b('It will be simple to tell everything', 'Ce sera simple de tout dire')]),
      dict('Qui l’eût cru ? Il eût suffi d’un mot pour tout changer.'),
      say('Il eût été préférable d’attendre le printemps.', 'It would have been better to wait for spring.'),
    ],
    [
      b('Pluperfect subjunctive = auxiliary in the imperfect subjunctive + participle.', 'Subjonctif plus-que-parfait = auxiliaire au subjonctif imparfait + participe.'),
      b('Literary past conditional: il eût été = il aurait été.', 'Conditionnel passé littéraire : il eût été = il aurait été.'),
      b('Inversion: eût-il su = s’il avait su.', 'Inversion : eût-il su = s’il avait su.'),
    ],
    [['sage', b('wise', 'raisonnable')], ['suffire', b('to be enough', 'être assez')], ['préférable', b('preferable, better', 'meilleur')]],
  ),

  lesson(C, 3, ['reading-classic-prose', 'lire-la-prose-classique'],
    b('Reading classic prose: review', 'Lire la prose classique : bilan'),
    b('A classic-style passage, the set phrases still alive today, and a careful pastiche.', 'Un passage de style classique, les tournures figées encore vivantes, et un pastiche soigné.'),
    [b('Read a passage with literary subjunctives', 'Lire un passage avec des subjonctifs littéraires'), b('Use the living set phrases', 'Employer les tournures figées vivantes'), b('Write a short pastiche', 'Écrire un court pastiche')],
    13,
    [
      card(b('Still alive today', 'Encore vivantes aujourd’hui'), b('A few phrases survive in careful modern French, in speeches, essays and the press. Living phrases: **ne fût-ce que** (if only, even just), **fût-ce** (even), **qui l’eût cru**, **il eût fallu**, **dussé-je** (even if I had to). Example: **Accordez-moi un instant, ne fût-ce qu’une minute.**', 'Quelques tournures survivent dans le français moderne soigné, dans les discours, les essais et la presse. Tournures vivantes : **ne fût-ce que** (ne serait-ce que), **fût-ce** (même), **qui l’eût cru**, **il eût fallu**, **dussé-je** (même si je devais). Exemple : **Accordez-moi un instant, ne fût-ce qu’une minute.**'), {
        ex: [['Il faut lire chaque jour, ne fût-ce que quelques pages.', 'You should read every day, even just a few pages.'], ['Je dirai la vérité, dussé-je tout perdre.', 'I will tell the truth, even if I had to lose everything.']],
      }),
      doc({ title: 'La comtesse', text: 'Bien qu’il fût déjà tard, la comtesse voulut qu’on attelât les chevaux. Il fallait qu’elle arrivât au château avant l’aube, dût-elle voyager toute la nuit. Son frère eût préféré qu’elle attendît le matin, mais elle ne voulut rien entendre. Qui l’eût cru ? Elle arriva la première.', look: 'page' }, b('What did her brother wish?', 'Que souhaitait son frère ?'), [b('That she wait until the morning', 'Qu’elle attende le matin'), b('That she leave at once', 'Qu’elle parte tout de suite'), b('That she arrive first', 'Qu’elle arrive la première'), b('That she sell the horses', 'Qu’elle vende les chevaux')]),
      mc(b('Which is the modern equivalent?', 'Quel est l’équivalent moderne ?'), ['Son frère aurait préféré qu’elle attende le matin.', 'Son frère a préféré qu’elle attendait le matin.', 'Son frère préférera qu’elle attende le matin.', 'Son frère préférait qu’elle attendra le matin.'], { fr: 'Son frère eût préféré qu’elle attendît le matin.' }),
      mc(P.meaning, [b('Even if only for an hour', 'Ne serait-ce que pour une heure'), b('Never for an hour', 'Jamais pour une heure'), b('Exactly one hour', 'Exactement une heure'), b('After an hour', 'Après une heure')], { fr: 'ne fût-ce que pour une heure' }),
      sort(b('Modern or literary form?', 'Forme moderne ou littéraire ?'), [b('modern', 'moderne'), b('literary', 'littéraire')], [['qu’il vienne', 0], ['qu’il vînt', 1], ['il aurait fallu', 0], ['il eût fallu', 1], ['même si je devais', 0], ['dussé-je', 1]]),
      write(b('A short pastiche', 'Un court pastiche'), b('In 50 to 80 words, write a short scene in the classic style: use the passé simple for the events and at least three literary subjunctives (qu’il fût, qu’elle eût, il eût fallu, qui l’eût cru…).', 'En 50 à 80 mots, écrivez une courte scène dans le style classique : employez le passé simple pour les événements et au moins trois subjonctifs littéraires (qu’il fût, qu’elle eût, il eût fallu, qui l’eût cru…).'), 50, 80, [
        b('Events in the passé simple', 'Des événements au passé simple'),
        b('Three literary subjunctives', 'Trois subjonctifs littéraires'),
        b('One living set phrase (ne fût-ce que, qui l’eût cru…)', 'Une tournure vivante (ne fût-ce que, qui l’eût cru…)'),
      ], 'Bien que la nuit fût tombée, le jeune peintre refusa de quitter son atelier. Il voulait que le portrait fût achevé avant le retour de la duchesse. Il eût fallu, disait son maître, qu’il dormît ne fût-ce que quelques heures. Il ne l’écouta point. À l’aube, la toile était terminée. Qui l’eût cru ? Ce fut son chef-d’œuvre.'),
      say('Accordez-moi un instant, ne fût-ce qu’une minute.', 'Give me a moment, if only a minute.'),
    ],
    [
      b('Living phrases: ne fût-ce que, fût-ce, qui l’eût cru, il eût fallu, dussé-je.', 'Tournures vivantes : ne fût-ce que, fût-ce, qui l’eût cru, il eût fallu, dussé-je.'),
      b('To read: imperfect subjunctive → present subjunctive; pluperfect → past subjunctive or past conditional.', 'Pour lire : subjonctif imparfait → subjonctif présent ; plus-que-parfait → subjonctif passé ou conditionnel passé.'),
      b('Use them only in very formal writing or for style.', 'Ne les employez qu’à l’écrit très soutenu ou pour le style.'),
    ],
    [['atteler', b('to harness (horses)', 'attacher des chevaux à une voiture')], ['un atelier', b('a studio, a workshop', 'le lieu de travail d’un artiste')], ['un chef-d’œuvre', b('a masterpiece', 'l’œuvre la plus réussie')]],
  ),
];
