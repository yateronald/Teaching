import type { CourseAbout } from '../../types';
import { b, card, conj, dict, dlg, gap, hear, lesson, mc, ord, P, pairs, say, sort, tip, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Qu’est-ce que tu as fait hier ? This course is your first practical step into the past: the passé composé with avoir and être, the most common irregular participles (fait, vu, pris, eu, été), time words (hier, ce matin, la semaine dernière) and the negation (je n’ai pas vu). You will tell your day, ask others about theirs and understand short spoken stories.',
    'Qu’est-ce que tu as fait hier ? Ce cours est votre premier pas pratique vers le passé : le passé composé avec avoir et être, les participes irréguliers les plus courants (fait, vu, pris, eu, été), les mots de temps (hier, ce matin, la semaine dernière) et la négation (je n’ai pas vu). Vous raconterez votre journée, interrogerez les autres sur la leur et comprendrez de courts récits oraux.',
  ),
  outcomes: [
    b('Form the passé composé with avoir', 'Former le passé composé avec avoir'),
    b('Use être with movement verbs', 'Employer être avec les verbes de mouvement'),
    b('Use common irregular participles', 'Employer les participes irréguliers courants'),
    b('Tell and ask about yesterday', 'Raconter sa journée d’hier et interroger les autres'),
  ],
};

const C = 'b-yesterday';
export default [
  lesson(C, 1, ['passe-compose-with-avoir', 'le-passe-compose-avec-avoir'],
    b('The passé composé with avoir', 'Le passé composé avec avoir'),
    b('Say what you did with avoir + past participle.', 'Dire ce qu’on a fait avec avoir + participe passé.'),
    [b('Form regular participles', 'Former les participes réguliers'), b('Learn frequent irregular participles', 'Apprendre les participes irréguliers fréquents'), b('Use time words', 'Employer les mots de temps')],
    13,
    [
      card(b('avoir + participle', 'avoir + participe'), b('**j’ai mangé, tu as fini, il a vendu**. Regular: **-er → -é** (parler → parlé), **-ir → -i** (finir → fini), **-re → -u** (attendre → attendu). Irregular: **faire → fait, voir → vu, prendre → pris, avoir → eu, être → été, boire → bu, lire → lu, écrire → écrit**. Time: **hier, hier soir, ce matin, la semaine dernière, il y a deux jours**.', '**j’ai mangé, tu as fini, il a vendu**. Réguliers : **-er → -é** (parler → parlé), **-ir → -i** (finir → fini), **-re → -u** (attendre → attendu). Irréguliers : **faire → fait, voir → vu, prendre → pris, avoir → eu, être → été, boire → bu, lire → lu, écrire → écrit**. Temps : **hier, hier soir, ce matin, la semaine dernière, il y a deux jours**.')),
      conj('faire', b('passé composé', 'passé composé'), [['j’', 'ai fait'], ['tu', 'as fait'], ['il/elle', 'a fait'], ['nous', 'avons fait'], ['vous', 'avez fait'], ['ils/elles', 'ont fait']], { given: [0] }),
      pairs(P.match, [['voir', 'vu'], ['prendre', 'pris'], ['boire', 'bu'], ['écrire', 'écrit']], true),
      gap(P.complete, 'Hier soir, j’ai ___ (regarder) un film et j’ai ___ (boire) un thé.', ['regardé', 'bu']),
      hear('Ce matin, j’ai pris le bus, j’ai acheté un croissant et j’ai lu le journal.', b('What did he NOT do?', 'Qu’est-ce qu’il n’a PAS fait ?'), [b('call a friend', 'appeler un ami'), b('take the bus', 'prendre le bus'), b('buy a croissant', 'acheter un croissant'), b('read the paper', 'lire le journal')], { voice: 'm' }),
      say('Hier, j’ai travaillé, j’ai fait les courses et j’ai vu un film.', 'Yesterday I worked, did the shopping and saw a film.'),
    ],
    [
      b('avoir + participle: j’ai mangé, j’ai fini, j’ai attendu.', 'avoir + participe : j’ai mangé, j’ai fini, j’ai attendu.'),
      b('Irregular: fait, vu, pris, eu, été, bu, lu, écrit.', 'Irréguliers : fait, vu, pris, eu, été, bu, lu, écrit.'),
      b('hier, ce matin, la semaine dernière, il y a…', 'hier, ce matin, la semaine dernière, il y a…'),
    ],
    [['le journal', b('the newspaper', 'quotidien')], ['attendre', b('to wait', 'rester jusqu’à')], ['il y a deux jours', b('two days ago', 'avant-hier')]],
  ),
  lesson(C, 2, ['passe-compose-with-etre', 'le-passe-compose-avec-etre'],
    b('The passé composé with être', 'Le passé composé avec être'),
    b('Use être with movement and change verbs, and agree the participle.', 'Employer être avec les verbes de mouvement et de changement, et accorder le participe.'),
    [b('Know the être verbs', 'Connaître les verbes avec être'), b('Agree the participle', 'Accorder le participe'), b('Use reflexive verbs in the past', 'Employer les verbes pronominaux au passé')],
    13,
    [
      card(b('The être verbs', 'Les verbes avec être'), b('Movement and change: **aller, venir, partir, arriver, entrer, sortir, monter, descendre, tomber, rester, naître, mourir, devenir, retourner** + all reflexive verbs (**se lever, se coucher**). The participle **agrees with the subject**: **Elle est allée au marché. · Nous sommes partis tôt. · Elles se sont levées à 7 h.**', 'Mouvement et changement : **aller, venir, partir, arriver, entrer, sortir, monter, descendre, tomber, rester, naître, mourir, devenir, retourner** + tous les verbes pronominaux (**se lever, se coucher**). Le participe **s’accorde avec le sujet** : **Elle est allée au marché. · Nous sommes partis tôt. · Elles se sont levées à 7 h.**')),
      tip(b('A memory trick', 'Un moyen mnémotechnique'), b('Imagine a **house**: you **arrive**, **enter**, **go up** the stairs, **come down**, **stay**, **go out**, **fall**, **leave**… All these movements use **être**.', 'Imaginez une **maison** : on **arrive**, on **entre**, on **monte** l’escalier, on **descend**, on **reste**, on **sort**, on **tombe**, on **part**… Tous ces mouvements se conjuguent avec **être**.')),
      sort(b('avoir or être?', 'avoir ou être ?'), [b('avoir', 'avoir'), b('être', 'être')], [['manger', 0], ['aller', 1], ['regarder', 0], ['arriver', 1], ['faire', 0], ['se lever', 1]]),
      mc(P.form, ['Ma sœur est arrivée hier soir.', 'Ma sœur a arrivé hier soir.', 'Ma sœur est arrivé hier soir.', 'Ma sœur a arrivée hier soir.']),
      gap(P.complete, 'Samedi, nous ___ allés au cinéma, puis nous ___ rentrés à minuit.', ['sommes', 'sommes']),
      say('Ce matin, je me suis levée à sept heures et je suis partie au travail à huit heures.', 'This morning I got up at seven and left for work at eight.'),
    ],
    [
      b('être + movement/change verbs and reflexive verbs.', 'être + verbes de mouvement/changement et verbes pronominaux.'),
      b('Agreement: elle est allée, ils sont partis.', 'Accord : elle est allée, ils sont partis.'),
      b('Most other verbs: avoir.', 'La plupart des autres verbes : avoir.'),
    ],
    [['rentrer', b('to go home', 'revenir chez soi')], ['tomber', b('to fall', 'chuter')], ['naître', b('to be born', 'venir au monde')]],
  ),
  lesson(C, 3, ['telling-your-day', 'raconter-sa-journee'],
    b('Telling your day', 'Raconter sa journée'),
    b('Tell your day in order, use the negative and ask questions about the past.', 'Raconter sa journée dans l’ordre, employer la négation et poser des questions au passé.'),
    [b('Sequence with d’abord, ensuite, après', 'Enchaîner avec d’abord, ensuite, après'), b('Use the negative: je n’ai pas…', 'Employer la négation : je n’ai pas…'), b('Ask: Qu’est-ce que tu as fait ?', 'Demander : Qu’est-ce que tu as fait ?')],
    13,
    [
      card(b('Telling and asking', 'Raconter et demander'), b('Sequence: **D’abord, … Ensuite, … Après, … Finalement, …** Negative: **Je n’ai pas vu le film. · Je ne suis pas sorti(e).** (ne… pas around the auxiliary). Questions: **Qu’est-ce que tu as fait hier ? · Tu es allé(e) où ? · Tu as bien dormi ? · C’était comment ?**', 'Enchaîner : **D’abord, … Ensuite, … Après, … Finalement, …** Négation : **Je n’ai pas vu le film. · Je ne suis pas sorti(e).** (ne… pas autour de l’auxiliaire). Questions : **Qu’est-ce que tu as fait hier ? · Tu es allé(e) où ? · Tu as bien dormi ? · C’était comment ?**')),
      mc(P.form, ['Je n’ai pas mangé ce matin.', 'Je n’ai mangé pas ce matin.', 'Je ne pas ai mangé ce matin.', 'Je ai pas mangé ce matin.']),
      dlg(b('Monday morning', 'Lundi matin'), undefined, [['Paul', 'm'], ['Vous', 'f']], [
        [0, 'Qu’est-ce que tu as fait ce week-end ?', 'What did you do this weekend?'],
        [1, { options: ['Samedi, je suis allée au marché, ensuite j’ai cuisiné pour des amis.', 'Samedi, je vais au marché.', 'J’ai allé au marché.'] }],
        [0, 'Et dimanche ?', 'And Sunday?'],
        [1, { options: ['Je ne suis pas sortie : j’ai lu et j’ai dormi. Et toi ?', 'Je n’ai sortie pas.', 'Dimanche, je sortirai.'] }],
      ]),
      ord(P.order, 'D’abord, j’ai pris un café, ensuite je suis parti.', { tr: 'First I had a coffee, then I left.' }),
      dict('Hier, je suis allée au travail en bus, puis j’ai mangé avec une collègue.', { hint: b('allée: feminine agreement with être.', 'allée : accord au féminin avec être.') }),
      write(b('Your yesterday', 'Votre journée d’hier'), b('Write about your day yesterday (35–60 words): at least four actions in order, with avoir and être, and one negative sentence.', 'Racontez votre journée d’hier (35–60 mots) : au moins quatre actions dans l’ordre, avec avoir et être, et une phrase négative.'), 35, 60, [
        b('Four actions in order', 'Quatre actions dans l’ordre'),
        b('avoir and être', 'avoir et être'),
        b('One negative sentence', 'Une phrase négative'),
      ], 'Hier, je me suis levé à sept heures. D’abord, j’ai pris une douche et un café. Ensuite, je suis allé au travail en métro. À midi, j’ai mangé avec mes collègues. Le soir, je ne suis pas sorti : j’ai regardé une série et je me suis couché tôt.'),
    ],
    [
      b('D’abord, ensuite, après, finalement.', 'D’abord, ensuite, après, finalement.'),
      b('Negative: je n’ai pas…, je ne suis pas…', 'Négation : je n’ai pas…, je ne suis pas…'),
      b('Qu’est-ce que tu as fait ? Tu es allé(e) où ?', 'Qu’est-ce que tu as fait ? Tu es allé(e) où ?'),
    ],
    [['cuisiner', b('to cook', 'faire la cuisine')], ['une douche', b('a shower', 'se laver sous l’eau')], ['se coucher', b('to go to bed', 'aller au lit')]],
  ),
];
