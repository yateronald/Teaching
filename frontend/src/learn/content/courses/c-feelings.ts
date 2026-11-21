import type { CourseAbout } from '../../types';
import { b, card, dlg, gap, lesson, mc, P, pairs, say, sort, tip } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Je suis ravi que tu viennes ! J’ai peur de rater mon examen. Ça m’énerve quand… Saying how you feel, and reacting to other people’s feelings, is what turns a polite exchange into a real conversation. This course covers joy, worry, disappointment, anger and surprise, the structures that follow them (de + infinitive, que + subjunctive) and the right words to comfort or congratulate.',
    'Je suis ravi que tu viennes ! J’ai peur de rater mon examen. Ça m’énerve quand… Dire ce que l’on ressent et réagir aux émotions des autres, c’est ce qui transforme un échange poli en vraie conversation. Ce cours couvre la joie, l’inquiétude, la déception, la colère et la surprise, les structures qui les suivent (de + infinitif, que + subjonctif) et les mots justes pour consoler ou féliciter.',
  ),
  outcomes: [
    b('Name your feelings precisely', 'Nommer ses émotions avec précision'),
    b('Use de + infinitive and que + subjunctive', 'Employer de + infinitif et que + subjonctif'),
    b('Comfort someone', 'Consoler quelqu’un'),
    b('Congratulate and share joy', 'Féliciter et partager la joie'),
  ],
};

const C = 'c-feelings';
export default [
  lesson(C, 1, ['joy-and-surprise', 'la-joie-et-la-surprise'],
    b('Joy and surprise', 'La joie et la surprise'),
    b('Express happiness and surprise, and congratulate.', 'Exprimer la joie et la surprise, et féliciter.'),
    [b('Say you are happy', 'Dire que vous êtes heureux'), b('Use content de / content que', 'Employer content de / content que'), b('Congratulate warmly', 'Féliciter chaleureusement')],
    13,
    [
      card(b('Joy', 'La joie'), b('**Je suis ravi(e) / content(e) / heureux(-se) de te voir.** (same subject → **de + infinitif**) · **Je suis ravi(e) que tu viennes.** (different subject → **que + subjonctif**). Surprise: **Ça alors ! Je n’en reviens pas ! Quelle surprise !** Congratulate: **Félicitations ! Bravo ! Je suis super contente pour toi !**', '**Je suis ravi(e) / content(e) / heureux(-se) de te voir.** (même sujet → **de + infinitif**) · **Je suis ravi(e) que tu viennes.** (sujet différent → **que + subjonctif**). Surprise : **Ça alors ! Je n’en reviens pas ! Quelle surprise !** Féliciter : **Félicitations ! Bravo ! Je suis super contente pour toi !**'), {
        ex: [['Je suis ravie de faire ta connaissance.', 'I’m delighted to meet you.'], ['Je suis content que tu aies trouvé un travail.', 'I’m glad you’ve found a job.']],
      }),
      mc(P.form, ['Je suis heureuse que tu sois là.', 'Je suis heureuse que tu es là.', 'Je suis heureuse de tu sois là.', 'Je suis heureuse que tu seras là.']),
      gap(P.complete, 'Je suis ravi ___ vous rencontrer. Et je suis content ___ vous ayez pu venir.', ['de', 'que']),
      mc(P.best, ['Félicitations ! Je suis vraiment contente pour toi !', 'Ah bon. Et alors ?', 'Moi aussi, j’ai réussi un examen une fois.', 'Ça n’a pas dû être facile.'], { fr: '— J’ai eu mon permis de conduire !' }),
      dlg(b('Good news', 'Une bonne nouvelle'), undefined, [['Amélie', 'f'], ['Vous', 'm']], [
        [0, 'Tu sais quoi ? On attend un bébé !', 'You know what? We’re expecting a baby!'],
        [1, { options: ['Ça alors ! Félicitations ! Je suis tellement content pour vous !', 'Oh non, pauvre toi.', 'D’accord.'] }],
        [0, 'Merci ! On est fous de joie.', 'Thanks! We’re over the moon.'],
        [1, { options: ['Je n’en reviens pas ! C’est prévu pour quand ?', 'Ah, je m’en doutais, c’est nul.', 'Bof.'] }],
      ]),
      pairs(P.match, [['ravi', b('delighted', 'très content')], ['Je n’en reviens pas !', b('I can’t believe it!', 'grande surprise')], ['fou de joie', b('over the moon', 'extrêmement heureux')], ['Félicitations !', b('Congratulations!', 'bravo')]]),
      say('Ça alors, félicitations ! Je suis vraiment ravie pour toi !', 'Wow, congratulations! I’m really delighted for you!'),
    ],
    [
      b('Same subject: content de + infinitif.', 'Même sujet : content de + infinitif.'),
      b('Different subject: content que + subjonctif.', 'Sujet différent : content que + subjonctif.'),
      b('Félicitations ! Je suis content(e) pour toi !', 'Félicitations ! Je suis content(e) pour toi !'),
    ],
    [['le permis de conduire', b('the driving licence', 'autorisation de conduire')], ['attendre un bébé', b('to be expecting a baby', 'être enceinte')], ['prévu', b('due, planned', 'attendu')]],
  ),
  lesson(C, 2, ['worry-and-disappointment', 'l-inquietude-et-la-deception'],
    b('Worry and disappointment', 'L’inquiétude et la déception'),
    b('Say you are worried or disappointed, and comfort someone.', 'Dire que l’on est inquiet ou déçu, et consoler quelqu’un.'),
    [b('Express worry and fear', 'Exprimer l’inquiétude et la peur'), b('Express disappointment', 'Exprimer la déception'), b('Comfort and reassure', 'Consoler et rassurer')],
    13,
    [
      card(b('Worry and fear', 'Inquiétude et peur'), b('**Je suis inquiet / inquiète.** · **J’ai peur de rater mon entretien.** · **J’ai peur qu’il soit trop tard.** · **Ça me stresse.** Disappointment: **Je suis déçu(e).** · **C’est dommage que tu ne puisses pas venir.** · **Quelle déception !**', '**Je suis inquiet / inquiète.** · **J’ai peur de rater mon entretien.** · **J’ai peur qu’il soit trop tard.** · **Ça me stresse.** Déception : **Je suis déçu(e).** · **C’est dommage que tu ne puisses pas venir.** · **Quelle déception !**')),
      card(b('Comforting', 'Consoler'), b('**Ne t’inquiète pas.** · **Ça va aller.** · **Je suis sûr(e) que tout va bien se passer.** · **Je comprends, c’est frustrant.** · **Si tu as besoin de parler, je suis là.**', '**Ne t’inquiète pas.** · **Ça va aller.** · **Je suis sûr(e) que tout va bien se passer.** · **Je comprends, c’est frustrant.** · **Si tu as besoin de parler, je suis là.**')),
      mc(P.form, ['C’est dommage que tu ne puisses pas venir.', 'C’est dommage que tu ne peux pas venir.', 'C’est dommage de tu ne peux pas venir.', 'C’est dommage que tu ne pourras pas venir hier.']),
      mc(P.best, ['Je comprends, c’est stressant. Mais tu t’es bien préparée, ça va aller !', 'Tu vas sûrement rater.', 'Moi, je n’ai jamais peur.', 'Pourquoi tu stresses pour ça ?'], { fr: '— J’ai très peur de rater mon entretien demain.' }),
      sort(b('Feeling or comfort?', 'Émotion ou consolation ?'), [b('expressing a feeling', 'exprimer une émotion'), b('comforting', 'consoler')], [['Je suis tellement déçue.', 0], ['Ne t’inquiète pas.', 1], ['Ça me stresse beaucoup.', 0], ['Je suis là si tu veux parler.', 1], ['J’ai peur qu’il soit trop tard.', 0], ['Tout va bien se passer.', 1]]),
      dlg(b('A disappointment', 'Une déception'), undefined, [['Yanis', 'm'], ['Vous', 'f']], [
        [0, 'Je n’ai pas été pris pour le poste. Je suis vraiment déçu.', 'I didn’t get the job. I’m really disappointed.'],
        [1, { options: ['Oh, je suis désolée. Je comprends, c’est frustrant après tous tes efforts.', 'Félicitations !', 'Normal, tu n’étais pas assez bon.'] }],
        [0, 'J’avais tellement envie de ce travail.', 'I wanted that job so much.'],
        [1, { options: ['Je sais. Mais tu vas trouver mieux, j’en suis sûre. Si tu veux en parler, je suis là.', 'Tant mieux.', 'Bon, on mange ?'] }],
      ]),
      say('Ne t’inquiète pas, ça va aller. Je suis sûre que tout va bien se passer.', 'Don’t worry, it’ll be OK. I’m sure everything will go well.'),
    ],
    [
      b('J’ai peur de + infinitif / J’ai peur que + subjonctif.', 'J’ai peur de + infinitif / J’ai peur que + subjonctif.'),
      b('Je suis déçu(e). C’est dommage que + subjonctif.', 'Je suis déçu(e). C’est dommage que + subjonctif.'),
      b('Comfort: Ne t’inquiète pas. Ça va aller. Je suis là.', 'Consoler : Ne t’inquiète pas. Ça va aller. Je suis là.'),
    ],
    [['rater', b('to fail, to miss', 'échouer')], ['un entretien', b('an interview', 'rencontre pour un emploi')], ['déçu', b('disappointed', 'qui n’a pas eu ce qu’il espérait')]],
  ),
  lesson(C, 3, ['anger-and-annoyance', 'la-colere-et-l-agacement'],
    b('Annoyance and anger, calmly', 'L’agacement et la colère, calmement'),
    b('Say what annoys you without exploding, and calm a tense situation.', 'Dire ce qui vous agace sans exploser, et apaiser une situation tendue.'),
    [b('Say what annoys you', 'Dire ce qui vous agace'), b('Express anger with control', 'Exprimer la colère avec maîtrise'), b('Calm someone down', 'Calmer quelqu’un')],
    13,
    [
      card(b('Annoyance', 'L’agacement'), b('**Ça m’énerve quand…** · **Ça m’agace que…** (subjonctif) · **J’en ai marre de…** (informal: I’m fed up with) · **Je suis un peu fâché(e).** · **Ça me met en colère.** Calm down: **Calme-toi.** · **On en reparlera à tête reposée.** · **Je comprends que tu sois énervé.**', '**Ça m’énerve quand…** · **Ça m’agace que…** (subjonctif) · **J’en ai marre de…** (familier) · **Je suis un peu fâché(e).** · **Ça me met en colère.** Calmer : **Calme-toi.** · **On en reparlera à tête reposée.** · **Je comprends que tu sois énervé.**')),
      tip(b('« Je » rather than « tu »', '« Je » plutôt que « tu »'), b('**« Je suis contrarié quand la réunion commence en retard »** is easier to hear than **« Tu es toujours en retard ! »** Speak about your feeling, not about the other person’s faults.', '**« Je suis contrarié quand la réunion commence en retard »** est plus facile à entendre que **« Tu es toujours en retard ! »** Parlez de votre émotion, pas des défauts de l’autre.')),
      mc(P.best, ['Ça m’agace un peu quand on change le planning à la dernière minute.', 'Vous êtes nuls avec ce planning !', 'J’en ai marre de vous tous.', 'Je démissionne !'], { fr: 'Vous parlez calmement à votre responsable :' }),
      gap(P.complete, 'J’en ai ___ de ces embouteillages ! Ça m’___ tous les matins.', ['marre', 'énerve']),
      mc(P.best, ['Je comprends que tu sois énervé. On en reparle à tête reposée ce soir ?', 'Calme-toi, tu exagères toujours.', 'C’est ta faute.', 'Moi aussi, je suis énervé, tant pis.'], { fr: 'Votre ami est très en colère après une dispute :' }),
      pairs(P.match, [['J’en ai marre.', b('I’m fed up.', 'c’est assez (familier)')], ['agacer', b('to annoy', 'énerver un peu')], ['à tête reposée', b('with a clear head', 'calmement, plus tard')], ['un embouteillage', b('a traffic jam', 'bouchon')]]),
      say('Je comprends que tu sois énervée. On en reparlera à tête reposée, d’accord ?', 'I understand that you’re upset. We’ll talk about it again with a clear head, OK?'),
    ],
    [
      b('Ça m’énerve quand… Ça m’agace que + subjonctif.', 'Ça m’énerve quand… Ça m’agace que + subjonctif.'),
      b('Speak with « je », not « tu ».', 'Parlez en « je », pas en « tu ».'),
      b('Calm: Je comprends que tu sois… On en reparlera à tête reposée.', 'Calmer : Je comprends que tu sois… On en reparlera à tête reposée.'),
    ],
    [['fâché', b('angry, cross', 'en colère')], ['une dispute', b('an argument', 'conflit verbal')], ['contrarié', b('upset, annoyed', 'mécontent')]],
  ),
];
