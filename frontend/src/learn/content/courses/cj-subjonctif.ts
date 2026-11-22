import type { CourseAbout } from '../../types';
import { b, card, conj, dict, dlg, gap, hear, lesson, mc, P, pairs, say, sort, tip, trap, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Il faut que tu viennes. Je suis content que vous soyez là. Bien qu’il soit tard… The subjunctive is not a tense of the past or the future: it is the mood of necessity, will, feelings and doubt. Its forms are more regular than they look, and only a dozen verbs are irregular. This course builds the forms first, then the expressions that call for it, one family at a time, and the conjunctions that always take it.',
    'Il faut que tu viennes. Je suis content que vous soyez là. Bien qu’il soit tard… Le subjonctif n’est pas un temps du passé ni du futur : c’est le mode de la nécessité, de la volonté, des sentiments et du doute. Ses formes sont plus régulières qu’il n’y paraît, et seule une douzaine de verbes sont irréguliers. Ce cours construit d’abord les formes, puis les expressions qui l’appellent, famille par famille, et les conjonctions qui le prennent toujours.',
  ),
  outcomes: [
    b('Form the present subjunctive of regular verbs', 'Former le subjonctif présent des verbes réguliers'),
    b('Know the irregular subjunctives', 'Connaître les subjonctifs irréguliers'),
    b('Use it after necessity, will, feelings and doubt', 'L’employer après la nécessité, la volonté, les sentiments et le doute'),
    b('Choose between infinitive, indicative and subjunctive', 'Choisir entre infinitif, indicatif et subjonctif'),
  ],
};

const C = 'cj-subjonctif';
const SUBJ = b('subjonctif présent', 'subjonctif présent');

export default [
  lesson(C, 1, ['forming-the-subjunctive', 'former-le-subjonctif'],
    b('Forming the subjunctive', 'Former le subjonctif'),
    b('Ils parlent → que je parle; nous prenons → que nous prenions.', 'Ils parlent → que je parle ; nous prenons → que nous prenions.'),
    [b('Find the stem from ils in the present', 'Trouver le radical à partir de ils au présent'), b('Take nous and vous from nous', 'Prendre nous et vous à partir de nous'), b('Hear the subjunctive after que', 'Entendre le subjonctif après que')],
    13,
    [
      card(b('Two stems, one set of endings', 'Deux radicaux, une série de terminaisons'), b('Take **ils** in the present and remove **-ent**: **ils parlent → parl-**, **ils finissent → finiss-**, **ils prennent → prenn-**. Endings: **-e, -es, -e, -ions, -iez, -ent**. For **nous** and **vous**, use the stem of nous in the present: **que nous prenions, que vous veniez**.', 'Prenez **ils** au présent et enlevez **-ent** : **ils parlent → parl-**, **ils finissent → finiss-**, **ils prennent → prenn-**. Terminaisons : **-e, -es, -e, -ions, -iez, -ent**. Pour **nous** et **vous**, prenez le radical de nous au présent : **que nous prenions, que vous veniez**.'), {
        table: {
          head: ['', 'parler', 'finir', 'prendre', 'venir'],
          rows: [['que je', 'parle', 'finisse', 'prenne', 'vienne'], ['que tu', 'parles', 'finisses', 'prennes', 'viennes'], ['qu’il / elle', 'parle', 'finisse', 'prenne', 'vienne'], ['que nous', 'parlions', 'finissions', 'prenions', 'venions'], ['que vous', 'parliez', 'finissiez', 'preniez', 'veniez'], ['qu’ils / elles', 'parlent', 'finissent', 'prennent', 'viennent']],
        },
      }),
      tip(b('Listen to nous and vous', 'Écoutez nous et vous'), b('The subjunctive almost always follows **que**. For many verbs, je, tu, il and ils sound like the present; the difference shows with **nous** and **vous**: **il faut que nous partions**, **il faut que vous lisiez**.', 'Le subjonctif suit presque toujours **que**. Pour beaucoup de verbes, je, tu, il et ils se prononcent comme au présent ; la différence s’entend avec **nous** et **vous** : **il faut que nous partions**, **il faut que vous lisiez**.')),
      conj('finir', SUBJ, [['que je', 'finisse'], ['que tu', 'finisses'], ['qu’il / elle', 'finisse'], ['que nous', 'finissions'], ['que vous', 'finissiez'], ['qu’ils / elles', 'finissent']], { given: [0] }),
      conj('prendre', SUBJ, [['que je', 'prenne'], ['que tu', 'prennes'], ['qu’il / elle', 'prenne'], ['que nous', 'prenions'], ['que vous', 'preniez'], ['qu’ils / elles', 'prennent']], { given: [0] }),
      pairs(b('Match the present (ils) with the subjunctive.', 'Associez le présent (ils) au subjonctif.'), [['ils lisent', 'que je lise'], ['ils écrivent', 'que j’écrive'], ['ils dorment', 'que je dorme'], ['ils boivent', 'que je boive'], ['ils mettent', 'que je mette'], ['ils connaissent', 'que je connaisse']], true),
      mc(P.form, ['parte', 'part', 'partira', 'partir'], { fr: 'Il faut que je ___ avant six heures.' }),
      mc(P.form, ['receviez', 'recevez', 'reçoiviez', 'recevrez'], { fr: 'Il est important que vous ___ ce document aujourd’hui.' }),
      gap(P.complete, 'Il faut que tu ___ (attendre) un peu. Il faut que nous ___ (choisir) une date.', [['attendes'], ['choisissions']]),
      hear('Il faut que nous partions tout de suite.', b('Which form do you hear after « il faut que » ?', 'Quelle forme entendez-vous après « il faut que » ?'), [b('Subjunctive: « partions »', 'Subjonctif : « partions »'), b('Present: « partons »', 'Présent : « partons »'), b('Future: « partirons »', 'Futur : « partirons »')]),
      dict('Il faut que vous lisiez ce livre et que vous me disiez ce que vous en pensez.'),
      say('Il faut que je finisse ce rapport ce soir.', 'I have to finish this report tonight.'),
    ],
    [
      b('Stem: ils in the present minus -ent; endings -e, -es, -e, -ions, -iez, -ent.', 'Radical : ils au présent sans -ent ; terminaisons -e, -es, -e, -ions, -iez, -ent.'),
      b('nous and vous: stem of nous in the present (que nous prenions).', 'nous et vous : radical de nous au présent (que nous prenions).'),
      b('Almost always after que.', 'Presque toujours après que.'),
    ],
    [['un rapport', b('a report', 'un document qui rend compte')], ['choisir une date', b('to set a date', 'fixer un jour')], ['tout de suite', b('right away', 'immédiatement')]],
  ),

  lesson(C, 2, ['irregular-subjunctives', 'subjonctifs-irreguliers'],
    b('The irregular subjunctives', 'Les subjonctifs irréguliers'),
    b('Que je sois, que j’aie, que j’aille, que je fasse, que je puisse, que je sache, que je veuille.', 'Que je sois, que j’aie, que j’aille, que je fasse, que je puisse, que je sache, que je veuille.'),
    [b('Know être and avoir in the subjunctive', 'Connaître être et avoir au subjonctif'), b('Learn the one-stem and two-stem irregulars', 'Apprendre les irréguliers à un et à deux radicaux'), b('Tell qu’il ait from il est', 'Distinguer qu’il ait de il est')],
    13,
    [
      card(b('Être and avoir', 'Être et avoir'), b('The two auxiliaries are completely irregular. Learn them as a pair; you will need them for the past subjunctive too.', 'Les deux auxiliaires sont complètement irréguliers. Apprenez-les ensemble ; vous en aurez besoin aussi pour le subjonctif passé.'), {
        table: {
          head: ['', 'être', 'avoir'],
          rows: [['que je / j’', 'sois', 'aie'], ['que tu', 'sois', 'aies'], ['qu’il / elle', 'soit', 'ait'], ['que nous', 'soyons', 'ayons'], ['que vous', 'soyez', 'ayez'], ['qu’ils / elles', 'soient', 'aient']],
        },
      }),
      card(b('Five more irregular verbs', 'Cinq autres verbes irréguliers'), b('Some verbs keep one irregular stem at every person. One stem: **faire → que je fasse, pouvoir → que je puisse, savoir → que je sache**. Others change with nous and vous. Two stems: **aller → que j’aille, que nous allions**, **vouloir → que je veuille, que nous voulions**. Impersonal: **il faut → qu’il faille**, **il pleut → qu’il pleuve**.', 'Certains verbes gardent un seul radical irrégulier à toutes les personnes. Un radical : **faire → que je fasse, pouvoir → que je puisse, savoir → que je sache**. D’autres changent avec nous et vous. Deux radicaux : **aller → que j’aille, que nous allions**, **vouloir → que je veuille, que nous voulions**. Impersonnels : **il faut → qu’il faille**, **il pleut → qu’il pleuve**.')),
      trap(b('Qu’il ait or il est?', 'Qu’il ait ou il est ?'), b('**qu’il ait** (avoir, subjunctive) and **il est** (être, present) sound the same. After **il faut que, je veux que…**, write **ait**: **Il faut qu’il ait son passeport.**', '**qu’il ait** (avoir, subjonctif) et **il est** (être, présent) se prononcent pareil. Après **il faut que, je veux que…**, écrivez **ait** : **Il faut qu’il ait son passeport.**')),
      conj('faire', SUBJ, [['que je', 'fasse'], ['que tu', 'fasses'], ['qu’il / elle', 'fasse'], ['que nous', 'fassions'], ['que vous', 'fassiez'], ['qu’ils / elles', 'fassent']], { given: [0] }),
      conj('aller', SUBJ, [['que j’', 'aille'], ['que tu', 'ailles'], ['qu’il / elle', 'aille'], ['que nous', 'allions'], ['que vous', 'alliez'], ['qu’ils / elles', 'aillent']], { given: [0] }),
      mc(P.form, ['soit', 'est', 'sera', 'soient'], { fr: 'Je veux que tout ___ prêt à midi.' }),
      mc(P.form, ['puisses', 'peux', 'pourras', 'pouvais'], { fr: 'Il faut que tu ___ venir demain.' }),
      mc(P.form, ['aille', 'va', 'alle', 'aie'], { fr: 'Il est temps que j’___ me coucher.' }),
      gap(P.complete, 'Il faut qu’il ___ (avoir) de la patience. Je voudrais que vous ___ (savoir) la vérité.', [['ait'], ['sachiez']]),
      dict('Il faut que nous fassions attention et que nous soyons à l’heure.'),
      say('Il faut que j’aille à la banque avant midi.', 'I have to go to the bank before noon.'),
    ],
    [
      b('être: sois, sois, soit, soyons, soyez, soient; avoir: aie, aies, ait, ayons, ayez, aient.', 'être : sois, sois, soit, soyons, soyez, soient ; avoir : aie, aies, ait, ayons, ayez, aient.'),
      b('One stem: fasse, puisse, sache. Two stems: aille / allions, veuille / voulions.', 'Un radical : fasse, puisse, sache. Deux radicaux : aille / allions, veuille / voulions.'),
      b('qu’il ait (avoir) ≠ il est (être), same sound.', 'qu’il ait (avoir) ≠ il est (être), même son.'),
    ],
    [['la patience', b('patience', 'la capacité d’attendre')], ['faire attention', b('to be careful', 'être prudent')], ['il est temps', b('it is time', 'c’est le moment')]],
  ),

  lesson(C, 3, ['necessity-and-will', 'necessite-et-volonte'],
    b('Necessity and will', 'La nécessité et la volonté'),
    b('Il faut que, je veux que, je préfère que, and when to use the infinitive instead.', 'Il faut que, je veux que, je préfère que, et quand employer l’infinitif à la place.'),
    [b('Use the subjunctive after necessity', 'Employer le subjonctif après la nécessité'), b('Use it after will and wishes', 'L’employer après la volonté et les souhaits'), b('Use the infinitive when the subject is the same', 'Employer l’infinitif quand le sujet est le même')],
    13,
    [
      card(b('Must, want, prefer', 'Devoir, vouloir, préférer'), b('The subjunctive follows expressions of necessity and of will when the two subjects are **different**. Necessity: **il faut que, il est nécessaire que, il est important que**. Will: **je veux que, je voudrais que, je préfère que, j’exige que, je souhaite que**.', 'Le subjonctif suit les expressions de nécessité et de volonté quand les deux sujets sont **différents**. Nécessité : **il faut que, il est nécessaire que, il est important que**. Volonté : **je veux que, je voudrais que, je préfère que, j’exige que, je souhaite que**.'), {
        ex: [['Il est important que vous dormiez assez.', 'It is important that you get enough sleep.'], ['Je préfère que tu me dises la vérité.', 'I’d rather you told me the truth.']],
      }),
      trap(b('Same subject: the infinitive', 'Même sujet : l’infinitif'), b('When the subject is the same, use the infinitive: **Je veux partir.** (I want to leave.) With a different subject, que + subjunctive: **Je veux que tu partes.** (I want you to leave.) Never « je veux que je parte ».', 'Quand le sujet est le même, employez l’infinitif : **Je veux partir.** Avec un sujet différent, que + subjonctif : **Je veux que tu partes.** Jamais « je veux que je parte ».')),
      mc(P.form, ['viennes', 'viens', 'venir', 'viendras'], { fr: 'Je voudrais que tu ___ avec moi.' }),
      mc(P.form, ['partir', 'que je parte', 'que je pars', 'je pars'], { fr: 'Je préfère ___ tôt demain.' }),
      mc(P.form, ['fassiez', 'faites', 'ferez', 'faisiez'], { fr: 'Le médecin exige que vous ___ du sport.' }),
      sort(b('Infinitive or que + subjunctive?', 'Infinitif ou que + subjonctif ?'), [b('same subject: infinitive', 'même sujet : infinitif'), b('two subjects: que + subjunctive', 'deux sujets : que + subjonctif')], [['Je veux sortir.', 0], ['Je veux que tu sortes.', 1], ['Elle préfère attendre.', 0], ['Elle préfère que nous attendions.', 1], ['Nous souhaitons réussir.', 0], ['Nous souhaitons que vous réussissiez.', 1]]),
      gap(P.complete, 'Ma mère veut que je ___ (finir) mes études. Il est important que nous ___ (écrire) à nos grands-parents.', [['finisse'], ['écrivions']]),
      hear('Il faut que tu sois patient.', P.meaning, [b('You must be patient', 'Tu dois être patient'), b('You were patient', 'Tu as été patient'), b('You will be patient', 'Tu seras patient')]),
      dict('Le directeur souhaite que chaque employé prenne ses congés avant décembre.'),
      say('Je voudrais que vous m’expliquiez la situation.', 'I’d like you to explain the situation to me.'),
    ],
    [
      b('Necessity: il faut que, il est important que + subjunctive.', 'Nécessité : il faut que, il est important que + subjonctif.'),
      b('Will: je veux que, je préfère que, je souhaite que + subjunctive.', 'Volonté : je veux que, je préfère que, je souhaite que + subjonctif.'),
      b('Same subject → infinitive: je veux partir.', 'Même sujet → infinitif : je veux partir.'),
    ],
    [['exiger', b('to demand', 'réclamer fermement')], ['souhaiter', b('to wish', 'désirer')], ['les congés', b('days off, leave', 'les jours de vacances')]],
  ),

  lesson(C, 4, ['feelings-and-doubt', 'sentiments-et-doute'],
    b('Feelings and doubt', 'Les sentiments et le doute'),
    b('Je suis content que…, j’ai peur que…, je doute que…, and why je pense que takes the indicative.', 'Je suis content que…, j’ai peur que…, je doute que…, et pourquoi je pense que prend l’indicatif.'),
    [b('Use the subjunctive after feelings', 'Employer le subjonctif après les sentiments'), b('Use it after doubt', 'L’employer après le doute'), b('Keep the indicative after certainty', 'Garder l’indicatif après la certitude')],
    13,
    [
      card(b('Feelings, doubt and certainty', 'Sentiments, doute et certitude'), b('After a feeling, the subjunctive. Feelings: **je suis content que, je suis triste que, j’ai peur que, je regrette que, c’est dommage que**. After doubt, too. Doubt: **je doute que, je ne pense pas que, je ne crois pas que, il est possible que**. But certainty takes the indicative. Certainty: **je pense que, je crois que, je suis sûr que, il est probable que, j’espère que**.', 'Après un sentiment, le subjonctif. Sentiments : **je suis content que, je suis triste que, j’ai peur que, je regrette que, c’est dommage que**. Après le doute aussi. Doute : **je doute que, je ne pense pas que, je ne crois pas que, il est possible que**. Mais la certitude prend l’indicatif. Certitude : **je pense que, je crois que, je suis sûr que, il est probable que, j’espère que**.'), {
        ex: [['Je suis ravie que vous soyez venus.', 'I’m delighted you came.'], ['Je doute qu’il réponde avant lundi.', 'I doubt he’ll answer before Monday.']],
      }),
      trap(b('Je pense que / je ne pense pas que', 'Je pense que / je ne pense pas que'), b('**Je pense qu’il viendra** takes the indicative: you believe it. **Je ne pense pas qu’il vienne** takes the subjunctive: the negative turns belief into doubt. The same goes for **croire**.', '**Je pense qu’il viendra** prend l’indicatif : vous y croyez. **Je ne pense pas qu’il vienne** prend le subjonctif : la négation transforme la croyance en doute. Il en va de même pour **croire**.')),
      sort(b('Subjunctive or indicative after it?', 'Subjonctif ou indicatif après ?'), [b('+ subjunctive', '+ subjonctif'), b('+ indicative', '+ indicatif')], [['je doute que', 0], ['je pense que', 1], ['je suis content que', 0], ['je suis sûr que', 1], ['il est possible que', 0], ['il est probable que', 1], ['j’ai peur que', 0], ['j’espère que', 1]]),
      mc(P.form, ['puisses', 'peux', 'pourras', 'pouvoir'], { fr: 'Je suis désolé que tu ne ___ pas venir.' }),
      mc(P.form, ['viendra', 'vienne', 'venir', 'viennes'], { fr: 'Je suis sûr qu’elle ___ demain.' }),
      mc(P.form, ['ait', 'a', 'aura', 'avait'], { fr: 'Je ne crois pas qu’il ___ raison.' }),
      gap(P.complete, 'C’est dommage que vous ___ (partir) si tôt. J’ai peur qu’il ___ (pleuvoir) pendant le mariage.', [['partiez'], ['pleuve']]),
      hear('Je doute qu’ils soient à l’heure.', P.meaning, [b('I don’t think they will be on time', 'Je ne pense pas qu’ils seront à l’heure'), b('I’m sure they will be on time', 'Je suis sûr qu’ils seront à l’heure'), b('They were on time', 'Ils étaient à l’heure')]),
      dict('Nous sommes heureux que vous puissiez venir et nous espérons que le voyage se passera bien.'),
      say('Je ne pense pas que ce soit une bonne idée.', 'I don’t think it’s a good idea.'),
    ],
    [
      b('Feelings and doubt → subjunctive (je suis content que tu sois là).', 'Sentiments et doute → subjonctif (je suis content que tu sois là).'),
      b('Certainty → indicative (je pense que, je suis sûr que, j’espère que).', 'Certitude → indicatif (je pense que, je suis sûr que, j’espère que).'),
      b('Je ne pense pas que + subjunctive.', 'Je ne pense pas que + subjonctif.'),
    ],
    [['ravi', b('delighted', 'très content')], ['c’est dommage', b('it’s a pity', 'c’est regrettable')], ['avoir raison', b('to be right', 'dire vrai')]],
  ),

  lesson(C, 5, ['conjunctions-and-review', 'conjonctions-et-bilan'],
    b('Conjunctions and review', 'Les conjonctions et bilan'),
    b('Pour que, avant que, bien que, à condition que: and everything together in a conversation.', 'Pour que, avant que, bien que, à condition que : et tout ensemble dans une conversation.'),
    [b('Use the conjunctions that take the subjunctive', 'Employer les conjonctions qui prennent le subjonctif'), b('Tell avant que from après que', 'Distinguer avant que de après que'), b('Give instructions with the subjunctive', 'Donner des consignes avec le subjonctif')],
    13,
    [
      card(b('Conjunctions that always take it', 'Les conjonctions qui le prennent toujours'), b('Some conjunctions always call for the subjunctive. Purpose: **pour que, afin que**. Time: **avant que, jusqu’à ce que**. Concession: **bien que, quoique**. Condition: **à condition que, pourvu que, sans que**. But **après que** takes the indicative: **après qu’il est parti**.', 'Certaines conjonctions appellent toujours le subjonctif. But : **pour que, afin que**. Temps : **avant que, jusqu’à ce que**. Concession : **bien que, quoique**. Condition : **à condition que, pourvu que, sans que**. Mais **après que** prend l’indicatif : **après qu’il est parti**.'), {
        ex: [['Je parle lentement pour que tout le monde comprenne.', 'I speak slowly so that everyone understands.'], ['Bien qu’il soit fatigué, il continue.', 'Although he is tired, he keeps going.']],
      }),
      mc(P.form, ['comprennes', 'comprends', 'comprendras', 'comprenais'], { fr: 'Je t’explique encore une fois pour que tu ___ bien.' }),
      mc(P.form, ['soit', 'est', 'sera', 'était'], { fr: 'Bien qu’il ___ tard, nous continuons à travailler.' }),
      mc(P.form, ['commence', 'commencera', 'commençait', 'commencer'], { fr: 'Rentrons avant qu’il ___ à pleuvoir.' }),
      gap(P.complete, 'Je resterai jusqu’à ce que tu ___ (revenir). Tu peux sortir à condition que tu ___ (être) rentré à minuit.', [['reviennes'], ['sois']]),
      dlg(b('A new team member', 'Une nouvelle recrue'), b('Sophie welcomes Karim, who starts on Monday.', 'Sophie accueille Karim, qui commence lundi.'), [['Sophie', 'f'], ['Karim', 'm']], [
        [0, 'Bienvenue, Karim ! Il faut que vous passiez au service informatique ce matin.', 'Welcome, Karim! You need to go to the IT department this morning.'],
        [1, { options: ['D’accord. Faut-il que j’apporte une pièce d’identité ?', 'D’accord. Faut-il que j’apporte-je une pièce d’identité ?', 'D’accord. Faut-il que j’apporterai une pièce d’identité ?'] }],
        [0, 'Oui, pour qu’ils puissent créer votre badge.', 'Yes, so that they can create your badge.'],
        [1, { options: ['Très bien. Je voudrais aussi que vous me présentiez l’équipe.', 'Très bien. Je voudrais aussi que vous me présentez l’équipe.', 'Très bien. Je voudrais aussi vous me présentiez l’équipe.'] }],
        [0, 'Avec plaisir, avant que la réunion commence.', 'With pleasure, before the meeting starts.'],
      ]),
      write(b('House rules', 'Les règles de la maison'), b('A friend will look after your flat for two weeks. In 40 to 70 words, write your instructions using the subjunctive at least four times (il faut que, je voudrais que, pour que, avant que…).', 'Un ami va garder votre appartement pendant deux semaines. En 40 à 70 mots, écrivez vos consignes en employant le subjonctif au moins quatre fois (il faut que, je voudrais que, pour que, avant que…).'), 40, 70, [
        b('Four verbs in the subjunctive', 'Quatre verbes au subjonctif'),
        b('One conjunction (pour que, avant que…)', 'Une conjonction (pour que, avant que…)'),
        b('One irregular subjunctive (sois, aies, fasses…)', 'Un subjonctif irrégulier (sois, aies, fasses…)'),
      ], 'Merci de garder mon appartement ! Il faut que tu donnes à manger au chat matin et soir. Je voudrais que tu arroses les plantes deux fois par semaine. Ferme bien la fenêtre pour que le chat ne sorte pas. Avant que tu partes, il faut que tu fasses la vaisselle et que tu sois sûr que tout est éteint.'),
      say('Je t’attendrai jusqu’à ce que tu sois prêt.', 'I’ll wait for you until you’re ready.'),
    ],
    [
      b('Always + subjunctive: pour que, avant que, bien que, à condition que, sans que.', 'Toujours + subjonctif : pour que, avant que, bien que, à condition que, sans que.'),
      b('après que + indicative (après qu’il est parti).', 'après que + indicatif (après qu’il est parti).'),
      b('Same subject: pour + infinitive, avant de + infinitive.', 'Même sujet : pour + infinitif, avant de + infinitif.'),
    ],
    [['une recrue', b('a new recruit', 'une personne qui vient d’être embauchée')], ['arroser', b('to water (plants)', 'donner de l’eau aux plantes')], ['éteint', b('switched off', 'qui ne fonctionne plus')]],
  ),
];
