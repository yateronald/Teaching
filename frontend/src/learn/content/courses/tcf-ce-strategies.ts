import type { CourseAbout } from '../../types';
import { b, card, doc, lesson, mc, P, pairs, sort, tip } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'The TCF reading test gives you about 60 minutes for 39 questions, from short notices (A1) to complex argumentative texts (C2). Time management is the key: the first questions must be answered quickly to keep time for the difficult ones. This course trains scanning, reading the question first, identifying the text type and purpose, and understanding argumentative and implicit texts at B2–C1.',
    'L’épreuve de compréhension écrite du TCF donne environ 60 minutes pour 39 questions, des annonces courtes (A1) aux textes argumentatifs complexes (C2). La gestion du temps est la clé : il faut répondre vite aux premières questions pour garder du temps pour les plus difficiles. Ce cours entraîne le repérage, la lecture de la question d’abord, l’identification du type et de l’objectif du texte, et la compréhension des textes argumentatifs et implicites au niveau B2–C1.',
  ),
  outcomes: [
    b('Manage 60 minutes for 39 questions', 'Gérer 60 minutes pour 39 questions'),
    b('Scan short documents quickly', 'Repérer rapidement dans les documents courts'),
    b('Identify text type and purpose', 'Identifier type et objectif du texte'),
    b('Understand argumentative and implicit texts', 'Comprendre les textes argumentatifs et l’implicite'),
  ],
};

const C = 'tcf-ce-strategies';
export default [
  lesson(C, 1, ['time-and-scanning', 'temps-et-reperage'],
    b('Time management and scanning', 'Gestion du temps et repérage'),
    b('Answer the first questions fast by scanning for the target information.', 'Répondre vite aux premières questions en repérant l’information ciblée.'),
    [b('Plan your 60 minutes', 'Planifier ses 60 minutes'), b('Scan for numbers, names, dates', 'Repérer nombres, noms, dates'), b('Don’t read everything', 'Ne pas tout lire')],
    13,
    [
      card(b('Time plan', 'Plan de temps'), b('Roughly: **questions 1–10** (A1–A2): about **30 seconds each**; **11–25** (B1–B2): about **1 min 30**; **26–39** (C1–C2): **2–3 minutes**. Watch the clock: if a question takes too long, **choose the most likely answer and move on**.', 'En gros : **questions 1 à 10** (A1–A2) : environ **30 secondes chacune** ; **11 à 25** (B1–B2) : environ **1 min 30** ; **26 à 39** (C1–C2) : **2 à 3 minutes**. Surveillez l’heure : si une question prend trop de temps, **choisissez la réponse la plus probable et passez à la suite**.')),
      doc({ look: 'notice', title: b('Notice', 'Avis'), text: 'PISCINE MUNICIPALE\nFermeture pour entretien du 3 au 16 août inclus.\nRéouverture le lundi 17 août à 7 h.\nLes abonnements seront prolongés de deux semaines.' }, b('What happens to season tickets?', 'Que se passe-t-il pour les abonnements ?'), [b('they are extended by two weeks', 'ils sont prolongés de deux semaines'), b('they are cancelled', 'ils sont annulés'), b('they are refunded', 'ils sont remboursés'), b('nothing', 'rien')], { timer: 40 }),
      doc({ look: 'sms', text: 'Salut ! Je suis coincée au bureau jusqu’à 19 h. On se retrouve directement au resto à 19 h 30 au lieu de 19 h ? Bisous, Nadia' }, b('What does Nadia propose?', 'Que propose Nadia ?'), [b('to meet at the restaurant at 7:30', 'se retrouver au restaurant à 19 h 30'), b('to cancel dinner', 'annuler le dîner'), b('to meet at her office', 'se retrouver à son bureau'), b('to eat at 7', 'manger à 19 h')], { timer: 30 }),
      sort(b('Read fully or scan?', 'Lire en entier ou repérer ?'), [b('scan for one detail', 'repérer un détail'), b('read more carefully', 'lire plus attentivement')], [['Quel est le prix du billet ?', 0], ['Quelle est l’opinion de l’auteur ?', 1], ['À quelle heure ouvre le musée ?', 0], ['Que suggère l’auteur dans la conclusion ?', 1], ['Quel jour a lieu la réunion ?', 0], ['Quel est le ton du texte ?', 1]]),
      tip(b('Question first', 'La question d’abord'), b('Always read **the question before the text**. For short documents, look directly for the **key word** (a date, a price, a place). You don’t need to understand every word.', 'Lisez toujours **la question avant le texte**. Pour les documents courts, cherchez directement le **mot clé** (une date, un prix, un lieu). Inutile de comprendre chaque mot.')),
    ],
    [
      b('Fast on easy questions; keep time for C1–C2.', 'Rapide sur les questions faciles ; gardez du temps pour le C1–C2.'),
      b('Question first, then scan for the key word.', 'La question d’abord, puis repérez le mot clé.'),
      b('If stuck, choose and move on.', 'En cas de blocage, choisissez et passez.'),
    ],
    [['l’entretien', b('maintenance', 'réparations régulières')], ['un abonnement', b('a season ticket, subscription', 'accès payé à l’avance')], ['prolonger', b('to extend', 'rendre plus long')]],
  ),
  lesson(C, 2, ['type-and-purpose', 'type-et-objectif'],
    b('Text type and purpose', 'Type et objectif du texte'),
    b('Identify who writes, to whom and why: inform, persuade, complain, advise.', 'Identifier qui écrit, à qui et pourquoi : informer, convaincre, se plaindre, conseiller.'),
    [b('Identify the text type', 'Identifier le type de texte'), b('Identify the purpose', 'Identifier l’objectif'), b('Identify the target reader', 'Identifier le lecteur visé')],
    13,
    [
      card(b('Who, to whom, why?', 'Qui, à qui, pourquoi ?'), b('Many B1–B2 questions ask: **Quel est l’objectif de ce texte ?** Typical answers: **informer, annoncer, convaincre, mettre en garde, se plaindre, remercier, recommander, inviter**. Clues: the **form** (courriel, article, annonce), **verbs** (nous vous informons, je tiens à protester, n’oubliez pas) and the **tone**.', 'De nombreuses questions B1–B2 demandent : **Quel est l’objectif de ce texte ?** Réponses typiques : **informer, annoncer, convaincre, mettre en garde, se plaindre, remercier, recommander, inviter**. Indices : la **forme** (courriel, article, annonce), les **verbes** (nous vous informons, je tiens à protester, n’oubliez pas) et le **ton**.')),
      doc({ look: 'email', title: b('Email', 'Courriel'), text: 'Madame, Monsieur,\n\nJe tiens à vous faire part de mon profond mécontentement. Le canapé commandé le 2 mars, et payé intégralement, devait être livré le 20. Nous sommes le 5 avril et je n’ai reçu aucune nouvelle malgré trois appels.\n\nJe vous demande de me communiquer une date de livraison sous 48 heures, faute de quoi je demanderai le remboursement.' }, b('What is the purpose of this email?', 'Quel est l’objectif de ce courriel ?'), [b('to complain and demand a delivery date', 'se plaindre et exiger une date de livraison'), b('to order a sofa', 'commander un canapé'), b('to thank the company', 'remercier l’entreprise'), b('to cancel immediately', 'annuler immédiatement')]),
      sort(b('Which purpose?', 'Quel objectif ?'), [b('inform', 'informer'), b('warn', 'mettre en garde'), b('persuade', 'convaincre')], [['Nous vous informons que les bureaux seront fermés lundi.', 0], ['Attention : ne cliquez pas sur ce lien.', 1], ['Rejoignez-nous : ensemble, changeons notre quartier !', 2], ['Le musée ouvrira à 10 h.', 0], ['Méfiez-vous des faux sites de réservation.', 1], ['Essayez-le, vous ne le regretterez pas.', 2]]),
      mc(P.choose, [b('to warn residents', 'mettre en garde les habitants'), b('to sell a product', 'vendre un produit'), b('to invite to a party', 'inviter à une fête'), b('to thank volunteers', 'remercier des bénévoles')], { fr: '« Des personnes se présentant comme agents de la compagnie d’électricité sonnent chez les personnes âgées. Ne les laissez pas entrer sans vérifier leur carte. » Objectif :' }),
      pairs(P.match, [['faire part de', b('to express, inform of', 'communiquer')], ['le mécontentement', b('dissatisfaction', 'fait d’être mécontent')], ['faute de quoi', b('failing which', 'sinon')], ['intégralement', b('in full', 'totalement')]]),
    ],
    [
      b('Ask: who writes, to whom, why?', 'Demandez-vous : qui écrit, à qui, pourquoi ?'),
      b('Purposes: informer, convaincre, mettre en garde, se plaindre, remercier.', 'Objectifs : informer, convaincre, mettre en garde, se plaindre, remercier.'),
      b('Clues: form, verbs, tone.', 'Indices : forme, verbes, ton.'),
    ],
    [['exiger', b('to demand', 'réclamer')], ['un canapé', b('a sofa', 'siège pour plusieurs')], ['se présenter comme', b('to claim to be', 'dire être')]],
  ),
  lesson(C, 3, ['argumentative-texts', 'textes-argumentatifs'],
    b('Argumentative and implicit texts', 'Textes argumentatifs et implicite'),
    b('Understand the thesis, the structure and the implicit meaning of C1–C2 texts.', 'Comprendre la thèse, la structure et l’implicite des textes C1–C2.'),
    [b('Find the thesis', 'Trouver la thèse'), b('Understand the role of a sentence', 'Comprendre le rôle d’une phrase'), b('Infer implicit meaning', 'Inférer l’implicite')],
    13,
    [
      card(b('C1–C2 reading', 'Lecture C1–C2'), b('Questions ask: **la thèse de l’auteur**, **le rôle d’un paragraphe** (illustrer, nuancer, réfuter, concéder), **le sens d’une expression en contexte**, **ce que l’auteur sous-entend**. Method: read the **first and last paragraphs** for the thesis, then the question, then the relevant passage. Beware of options that state **the opposite** of the author’s view, quoted from a view he refutes.', 'Les questions portent sur : **la thèse de l’auteur**, **le rôle d’un paragraphe** (illustrer, nuancer, réfuter, concéder), **le sens d’une expression en contexte**, **ce que l’auteur sous-entend**. Méthode : lisez **le premier et le dernier paragraphe** pour la thèse, puis la question, puis le passage concerné. Attention aux options qui énoncent **le contraire** de l’avis de l’auteur, tiré d’une thèse qu’il réfute.')),
      doc({ look: 'article', title: b('Opinion', 'Tribune'), text: 'On répète volontiers que la lecture recule chez les jeunes. Les chiffres semblent le confirmer : moins de romans achetés, moins d’heures passées avec un livre. Pourtant, ce constat repose sur une définition étroite de la lecture. Jamais les adolescents n’ont autant lu de textes — messages, forums, articles, sous-titres. La vraie question n’est donc pas de savoir s’ils lisent, mais ce qu’ils lisent, et comment l’école peut les conduire de ces lectures fragmentées vers des textes longs et exigeants.' }, b('What is the author’s thesis?', 'Quelle est la thèse de l’auteur ?'), [b('Young people read a lot, but differently; school must lead them to long texts.', 'Les jeunes lisent beaucoup, mais autrement ; l’école doit les mener vers les textes longs.'), b('Young people no longer read at all.', 'Les jeunes ne lisent plus du tout.'), b('Novels are better than forums.', 'Les romans valent mieux que les forums.'), b('Figures about reading are false.', 'Les chiffres sur la lecture sont faux.')]),
      mc(P.choose, [b('to introduce the opposing view he will refute', 'introduire l’opinion adverse qu’il va réfuter'), b('to give his own thesis', 'donner sa propre thèse'), b('to conclude', 'conclure'), b('to give an example', 'donner un exemple')], { fr: 'Quel est le rôle de la première phrase (« On répète volontiers que la lecture recule… ») ?' }),
      mc(P.meaning, [b('limited, too restrictive', 'limitée, trop restrictive'), b('wide, generous', 'large, généreuse'), b('modern', 'moderne'), b('official', 'officielle')], { fr: '« une définition étroite de la lecture » :' }),
      sort(b('Role of the sentence', 'Rôle de la phrase'), [b('opposing view', 'thèse adverse'), b('refutation', 'réfutation'), b('author’s proposal', 'proposition de l’auteur')], [['On répète volontiers que…', 0], ['Pourtant, ce constat repose sur…', 1], ['La vraie question est de savoir…', 2], ['Certains affirment que…', 0], ['Or, rien n’est moins sûr.', 1], ['Il conviendrait donc de…', 2]]),
    ],
    [
      b('Find the thesis in the first and last paragraphs.', 'Trouvez la thèse dans le premier et le dernier paragraphe.'),
      b('Roles: opposing view, refutation, concession, proposal.', 'Rôles : thèse adverse, réfutation, concession, proposition.'),
      b('Beware options that state the refuted view.', 'Méfiez-vous des options qui énoncent la thèse réfutée.'),
    ],
    [['fragmenté', b('fragmented', 'en morceaux')], ['exigeant', b('demanding', 'difficile')], ['reculer', b('to decline', 'diminuer')]],
  ),
];
