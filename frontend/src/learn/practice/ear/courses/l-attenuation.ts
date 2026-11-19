// C1 · Softening: polite requests and veiled criticism.
import { ear, ex, fill, pick, situation } from '../authoring';

const DEVIS = 'Merci pour votre devis, très clair. Je me demandais simplement s’il serait possible de revoir un peu le prix : il est légèrement au-dessus de notre budget.';
const DEVIS_SHOW = 'Merci pour votre devis, très clair. Je {me demandais} simplement s’il {serait possible} de revoir {un peu} le prix : il est {légèrement} au-dessus de notre budget.';

export default ear('l-attenuation', {
  rule: [
    ['L’art d’adoucir', 'The art of softening'],
    [
      'Pour demander ou critiquer poliment, le français adoucit. Le **conditionnel** (__je voudrais, pourriez-vous, j’aurais aimé__), l’**imparfait de politesse** (__je voulais vous demander, je me demandais si__ : on parle du présent), les **petits mots** (__un petit souci, un peu, légèrement, peut-être__) et la **question négative** (__ce ne serait pas plutôt mardi ?__ = je pense que c’est mardi).\n\nDerrière la douceur, le message est souvent net : __ce n’est pas tout à fait ce que j’attendais__ signifie « je suis déçu ».',
      'To ask or criticise politely, French softens. The **conditional** (__je voudrais, pourriez-vous, j’aurais aimé__), the **polite imperfect** (__je voulais vous demander, je me demandais si__: about the present), **little words** (__un petit souci, un peu, légèrement, peut-être__) and the **negative question** (__ce ne serait pas plutôt mardi ?__ = I think it is Tuesday).\n\nBehind the softness, the message is often clear: __ce n’est pas tout à fait ce que j’attendais__ means « I am disappointed ».',
    ],
  ],
  goal: ['Comprendre ce que dit vraiment une demande ou une critique adoucie.', 'Understand what a softened request or criticism really says.'],
  examples: [
    ex('Je me demandais si vous pourriez m’aider.', 'Je {me demandais} si vous {pourriez} m’aider.', ['Une demande polie, au présent.', 'A polite request, about now.']),
    ex('On a un petit souci avec votre commande.', 'On a un {petit souci} avec votre commande.', ['Il y a un problème, présenté avec douceur.', 'There is a problem, put gently.']),
    ex('Ce n’est pas tout à fait ce que j’attendais.', 'Ce n’est {pas tout à fait} ce que j’attendais.', ['= Je suis déçu.', '= I am disappointed.']),
  ],
  items: [
    pick('Ce ne serait pas plutôt mardi, la réunion ?', ['Qu’elle ne sait pas du tout', 'Que la réunion est mardi'], 1, 'Ce ne serait pas {plutôt mardi}, la réunion ?', [
      'La question négative propose poliment une correction : « je crois que c’est mardi ».', 'The negative question politely suggests a correction: « I think it is Tuesday ».',
    ], ['Que pense la personne ?', 'What does the speaker think?']),
    pick('Votre rapport est intéressant, mais peut-être un peu long.', ['Le rapport est trop long', 'Le rapport est parfait'], 0, 'Votre rapport est intéressant, mais {peut-être un peu} long.', [
      '« Peut-être un peu » adoucit une critique : il est trop long.', '« Perhaps a little » softens a criticism: it is too long.',
    ], ['Que pense vraiment le chef ?', 'What does the boss really think?']),
    pick('Je voulais vous demander un petit service.', ['Elle parle d’une demande passée', 'Elle fait une demande polie, maintenant'], 1, 'Je {voulais} vous demander un {petit} service.', [
      'Imparfait de politesse : la demande est actuelle.', 'Polite imperfect: the request is about now.',
    ], ['Que fait la personne ?', 'What is the speaker doing?']),
    pick('Il se pourrait que le train ait du retard.', ['C’est certain', 'C’est possible'], 1, 'Il {se pourrait} que le train ait du retard.', [
      'Il se pourrait que = c’est possible, sans certitude.', 'Il se pourrait que = it is possible.',
    ], ['Le retard est-il certain ?', 'Is the delay certain?']),
    pick('J’aurais aimé être prévenu.', ['De l’avoir prévenu trop tôt', 'De ne pas l’avoir prévenu'], 1, 'J’{aurais aimé} être prévenu.', [
      'Le conditionnel passé exprime poliment un reproche : on ne l’a pas prévenu.', 'The past conditional politely expresses a reproach: he was not told.',
    ], ['Que reproche la personne ?', 'What is the speaker complaining about?']),
    fill('Pourriez-vous fermer la fenêtre ?', '___-vous fermer la fenêtre ?', ['Pourriez', 'pourriez'], '{Pourriez}-vous fermer la fenêtre ?', [
      'Le conditionnel rend la demande polie.', 'The conditional makes the request polite.',
    ]),
    fill('Je voudrais un renseignement.', 'Je ___ un renseignement.', 'voudrais', 'Je {voudrais} un renseignement.', [
      'Je voudrais : plus poli que « je veux ».', 'Je voudrais: more polite than « je veux ».',
    ]),
    fill('Il me semble qu’il y a une erreur.', 'Il me ___ qu’il y a une erreur.', 'semble', 'Il me {semble} qu’il y a une erreur.', [
      'Il me semble que : on signale une erreur sans accuser.', 'Il me semble que: pointing out an error without accusing.',
    ]),
    situation(DEVIS, 'Que demande vraiment la cliente ?', ['Un délai supplémentaire', 'Une baisse du prix', 'Un devis plus détaillé'], 1, DEVIS_SHOW, [
      '« Revoir un peu le prix » = le baisser.', '« Revise the price a little » = lower it.',
    ]),
    situation(DEVIS, 'Comment présente-t-elle le problème ?', ['Avec colère', 'Avec beaucoup de précautions', 'Avec humour'], 1, DEVIS_SHOW, [
      'Imparfait de politesse, conditionnel, « un peu », « légèrement » : tout adoucit.', 'Polite imperfect, conditional, « a little », « slightly »: everything softens.',
    ]),
  ],
  takeaway: [
    'Conditionnel, imparfait de politesse, petits mots (un peu, légèrement) et questions négatives adoucissent. Le message, lui, reste net : écoutez ce qui est demandé ou reproché.',
    'Conditional, polite imperfect, little words (un peu, légèrement) and negative questions soften. The message stays clear: listen for what is asked or criticised.',
  ],
});
