import type { CourseAbout, Doc } from '../../types';
import { b, card, doc, gap, lesson, mc, P, pairs, sort, tip, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'At C1, you read essays that build a reasoning over several paragraphs, with implicit premises, irony, refutations and nuanced conclusions. This course trains you on three original argumentative texts (attention in the digital age, the value of work, translation and machines) to map the reasoning, identify the implicit, recognise refutation strategies and reformulate an argument precisely.',
    'Au niveau C1, on lit des essais qui construisent un raisonnement sur plusieurs paragraphes, avec des prémisses implicites, de l’ironie, des réfutations et des conclusions nuancées. Ce cours vous entraîne sur trois textes argumentatifs originaux (l’attention à l’ère numérique, la valeur du travail, la traduction et les machines) pour cartographier le raisonnement, repérer l’implicite, reconnaître les stratégies de réfutation et reformuler un argument avec précision.',
  ),
  outcomes: [
    b('Map the reasoning of an essay', 'Cartographier le raisonnement d’un essai'),
    b('Identify implicit premises', 'Repérer les prémisses implicites'),
    b('Recognise refutation strategies', 'Reconnaître les stratégies de réfutation'),
    b('Reformulate an argument precisely', 'Reformuler un argument avec précision'),
  ],
};

const E1: Doc = { look: 'page', title: b('Essay extract', 'Extrait d’essai'), text: 'On déplore volontiers que nous ne sachions plus nous concentrer. Le diagnostic est juste ; l’explication, souvent paresseuse. Accuser les écrans revient à confondre l’outil et l’usage. Car ce n’est pas la technique qui fragmente notre attention, mais un modèle économique qui en a fait sa matière première : chaque minute de regard captée se vend. Dès lors, réclamer aux individus davantage de « discipline » relève de l’hypocrisie, comme si l’on exigeait du nageur qu’il reste immobile au milieu du courant.' };
const E2: Doc = { look: 'page', title: b('Essay extract', 'Extrait d’essai'), text: 'Il est devenu banal d’affirmer que le travail ne serait plus une valeur pour les jeunes générations. Rien n’est moins sûr. Les enquêtes montrent au contraire un attachement fort au travail « qui a du sens » ; ce qui recule, c’est la tolérance à l’égard du travail qui n’en a pas. Interpréter ce refus comme de la paresse, c’est prendre le symptôme pour la maladie. La question n’est donc pas de savoir si l’on veut encore travailler, mais à quelles conditions le travail mérite encore qu’on lui consacre sa vie.' };
const E3: Doc = { look: 'page', title: b('Essay extract', 'Extrait d’essai'), text: 'Les machines traduisent désormais en une seconde ce qui demandait une journée. Faut-il en conclure que le traducteur appartient au passé ? Ce serait réduire la traduction à un transfert de mots, alors qu’elle est un acte d’interprétation. Traduire un contrat, un poème ou une plaisanterie, c’est choisir, trancher, assumer une lecture. La machine propose ; seul l’humain répond de ce qu’il signe. Paradoxalement, plus les outils progressent, plus cette responsabilité devient visible.' };

const C = 'r-essays';
export default [
  lesson(C, 1, ['mapping-the-reasoning', 'cartographier-le-raisonnement'],
    b('Mapping the reasoning', 'Cartographier le raisonnement'),
    b('Follow a thesis built against a common explanation.', 'Suivre une thèse construite contre une explication répandue.'),
    [b('Identify the rejected explanation', 'Identifier l’explication rejetée'), b('Identify the author’s explanation', 'Identifier l’explication de l’auteur'), b('Interpret an analogy', 'Interpréter une analogie')],
    13,
    [
      card(b('Concede, refute, replace', 'Concéder, réfuter, remplacer'), b('A classic C1 move: **grant** part of a common view (le diagnostic est juste), **refute** its explanation (l’explication, souvent paresseuse), then **replace** it with one’s own (ce n’est pas X, mais Y). Watch for **car, dès lors, revient à, relève de**.', 'Mouvement classique au C1 : **accorder** une partie de l’opinion commune (le diagnostic est juste), **réfuter** son explication (l’explication, souvent paresseuse), puis **la remplacer** (ce n’est pas X, mais Y). Repérez **car, dès lors, revient à, relève de**.')),
      doc(E1, b('What does the author agree with?', 'Avec quoi l’auteur est-il d’accord ?'), [b('That we struggle to concentrate', 'Que nous avons du mal à nous concentrer'), b('That screens are the cause', 'Que les écrans en sont la cause'), b('That we need more discipline', 'Qu’il faut plus de discipline'), b('That technology is evil', 'Que la technique est mauvaise')]),
      doc(E1, b('What is the real cause according to the author?', 'Quelle est la vraie cause selon l’auteur ?'), [b('An economic model that sells our attention', 'Un modèle économique qui vend notre attention'), b('Screens themselves', 'Les écrans eux-mêmes'), b('Lazy individuals', 'La paresse des individus'), b('The education system', 'Le système éducatif')]),
      doc(E1, b('What does the swimmer analogy mean?', 'Que signifie l’analogie du nageur ?'), [b('Asking individuals to resist a powerful system alone is unfair.', 'Demander aux individus de résister seuls à un système puissant est injuste.'), b('People should swim more.', 'Les gens devraient nager davantage.'), b('Discipline is easy.', 'La discipline est facile.'), b('Rivers are dangerous.', 'Les rivières sont dangereuses.')]),
      pairs(P.match, [['déplorer', b('to lament', 'regretter vivement')], ['paresseux', b('lazy, facile', 'sans effort')], ['revenir à', b('to amount to', 'équivaloir à')], ['relever de', b('to be a matter of', 'appartenir au domaine de')]]),
      gap(P.complete, 'Ce n’est pas la technique qui fragmente notre attention, ___ un modèle économique. ___ lors, exiger plus de discipline est hypocrite.', ['mais', 'Dès']),
    ],
    [
      b('C1 structure: concede → refute → replace (ce n’est pas X, mais Y).', 'Structure C1 : concéder → réfuter → remplacer (ce n’est pas X, mais Y).'),
      b('revient à = amounts to; relève de = is a matter of; dès lors = therefore.', 'revient à = équivaut à ; relève de ; dès lors = par conséquent.'),
      b('An analogy illustrates the reasoning (le nageur et le courant).', 'Une analogie illustre le raisonnement (le nageur et le courant).'),
    ],
    [['la matière première', b('raw material', 'ressource de base')], ['capter', b('to capture', 'attirer et retenir')], ['l’hypocrisie', b('hypocrisy', 'fausseté')]],
  ),
  lesson(C, 2, ['implicit-and-refutation', 'implicite-et-refutation'],
    b('The implicit and the refutation', 'L’implicite et la réfutation'),
    b('Identify what is presupposed and how a received idea is refuted.', 'Repérer ce qui est présupposé et comment une idée reçue est réfutée.'),
    [b('Spot the conditional of distance', 'Repérer le conditionnel de distance'), b('Identify the refuted idea', 'Identifier l’idée réfutée'), b('Reformulate the real question', 'Reformuler la vraie question')],
    13,
    [
      tip(b('Signals of refutation', 'Les signaux de la réfutation'), b('**Il est devenu banal d’affirmer que…** (a common view the author will attack), **ne serait plus** (conditional = distance), **Rien n’est moins sûr** (strong doubt), **au contraire**, **c’est prendre X pour Y** (a confusion).', '**Il est devenu banal d’affirmer que…** (idée commune que l’auteur va attaquer), **ne serait plus** (conditionnel de distance), **Rien n’est moins sûr**, **au contraire**, **c’est prendre X pour Y** (une confusion).')),
      doc(E2, b('Which idea does the author refute?', 'Quelle idée l’auteur réfute-t-il ?'), [b('That work is no longer a value for young people', 'Que le travail ne serait plus une valeur pour les jeunes'), b('That surveys are useless', 'Que les enquêtes sont inutiles'), b('That work must have meaning', 'Que le travail doit avoir du sens'), b('That young people are tolerant', 'Que les jeunes sont tolérants')]),
      doc(E2, b('What is actually declining, according to the author?', 'Qu’est-ce qui recule réellement selon l’auteur ?'), [b('Tolerance for meaningless work', 'La tolérance envers le travail dénué de sens'), b('The desire to work', 'L’envie de travailler'), b('The number of jobs', 'Le nombre d’emplois'), b('Salaries', 'Les salaires')]),
      doc(E2, b('« C’est prendre le symptôme pour la maladie » means…', '« C’est prendre le symptôme pour la maladie » signifie…'), [b('confusing the visible sign with its deep cause', 'confondre le signe visible et sa cause profonde'), b('young people are ill', 'les jeunes sont malades'), b('doctors are wrong', 'les médecins se trompent'), b('work makes people ill', 'le travail rend malade')]),
      sort(b('Common view or author’s view?', 'Idée reçue ou position de l’auteur ?'), [b('common view (refuted)', 'idée reçue (réfutée)'), b('author’s view', 'position de l’auteur')], [['Les jeunes ne veulent plus travailler.', 0], ['Les jeunes refusent le travail sans sens.', 1], ['C’est de la paresse.', 0], ['Il faut repenser les conditions du travail.', 1]]),
      pairs(P.match, [['Rien n’est moins sûr.', b('That is far from certain.', 'C’est très douteux.')], ['banal', b('commonplace', 'ordinaire')], ['l’attachement', b('attachment, commitment', 'lien fort')], ['consacrer', b('to devote', 'dédier')]]),
      mc(P.best, ['La vraie question porte sur les conditions qui donnent du sens au travail.', 'La vraie question est de savoir si les jeunes sont paresseux.', 'La vraie question concerne le nombre d’heures.', 'Il n’y a pas de vraie question.'], { fr: 'Reformulez la conclusion de l’auteur :' }),
    ],
    [
      b('Distance: conditional (ne serait plus), Il est devenu banal d’affirmer…', 'Distance : conditionnel (ne serait plus), Il est devenu banal d’affirmer…'),
      b('Refutation: Rien n’est moins sûr, au contraire, c’est prendre X pour Y.', 'Réfutation : Rien n’est moins sûr, au contraire, c’est prendre X pour Y.'),
      b('Reformulation: La question n’est pas de savoir si…, mais…', 'Reformulation : La question n’est pas de savoir si…, mais…'),
    ],
    [['une enquête', b('a survey', 'étude')], ['un symptôme', b('a symptom', 'signe')], ['mériter', b('to deserve', 'valoir')]],
  ),
  lesson(C, 3, ['paradox-and-reformulation', 'paradoxe-et-reformulation'],
    b('Paradox and precise reformulation', 'Paradoxe et reformulation précise'),
    b('Understand a paradoxical conclusion and reformulate an argument in your own words.', 'Comprendre une conclusion paradoxale et reformuler un argument avec ses propres mots.'),
    [b('Understand a rhetorical question', 'Comprendre une question rhétorique'), b('Understand a paradox', 'Comprendre un paradoxe'), b('Reformulate an argument', 'Reformuler un argument')],
    13,
    [
      doc(E3, b('How does the author answer his own question?', 'Comment l’auteur répond-il à sa propre question ?'), [b('No: translation is interpretation, not word transfer.', 'Non : traduire est un acte d’interprétation, pas un transfert de mots.'), b('Yes: translators are useless.', 'Oui : les traducteurs sont inutiles.'), b('He does not answer.', 'Il ne répond pas.'), b('Machines are always wrong.', 'Les machines se trompent toujours.')]),
      doc(E3, b('« La machine propose ; seul l’humain répond de ce qu’il signe » means…', '« La machine propose ; seul l’humain répond de ce qu’il signe » signifie…'), [b('Only a human can take responsibility for a translation.', 'Seul un humain peut assumer la responsabilité d’une traduction.'), b('Machines sign contracts.', 'Les machines signent des contrats.'), b('Humans must answer machines.', 'Les humains doivent répondre aux machines.'), b('Machines refuse to translate.', 'Les machines refusent de traduire.')]),
      doc(E3, b('What is the paradox in the last sentence?', 'Quel est le paradoxe de la dernière phrase ?'), [b('Better tools make human responsibility more visible.', 'Plus les outils progressent, plus la responsabilité humaine devient visible.'), b('Machines are getting worse.', 'Les machines régressent.'), b('Translators are getting faster.', 'Les traducteurs deviennent plus rapides.'), b('Nobody uses machines.', 'Personne n’utilise les machines.')]),
      card(b('Reformulating', 'Reformuler'), b('To reformulate: keep the **logic**, change the **words**. Use **autrement dit, en d’autres termes, ce qui revient à dire que, l’auteur soutient que…, selon lui…**. Avoid copying expressions from the text.', 'Pour reformuler : gardez la **logique**, changez les **mots**. Employez **autrement dit, en d’autres termes, ce qui revient à dire que, l’auteur soutient que…, selon lui…**. Évitez de recopier les expressions du texte.')),
      write(b('Reformulate the argument.', 'Reformulez l’argument.'), b('Reformulate the author’s argument about translation in 3 or 4 sentences, without copying his phrases.', 'Reformulez en 3 ou 4 phrases l’argument de l’auteur sur la traduction, sans recopier ses formules.'), 50, 90,
        [b('The question raised', 'La question posée'), b('The author’s answer and reason', 'La réponse de l’auteur et sa raison'), b('The paradox', 'Le paradoxe'), b('A reformulation connector (autrement dit…)', 'Un connecteur de reformulation (autrement dit…)')],
        'Face aux progrès fulgurants de la traduction automatique, l’auteur se demande si le métier de traducteur va disparaître. Il soutient que non, car traduire ne consiste pas à remplacer des mots par d’autres, mais à interpréter un texte et à faire des choix. Autrement dit, l’outil suggère, mais c’est la personne qui engage sa responsabilité. Selon lui, l’amélioration des machines met même davantage en lumière ce rôle humain.',
        { phrases: ['L’auteur se demande si…', 'Il soutient que…', 'Autrement dit…', 'Selon lui…', 'met en lumière…'] }),
      pairs(P.match, [['désormais', b('from now on, now', 'à partir de maintenant')], ['trancher', b('to decide, to settle', 'décider nettement')], ['assumer', b('to take on, to own', 'prendre la responsabilité de')], ['répondre de', b('to answer for', 'être responsable de')]]),
    ],
    [
      b('Rhetorical question: asked to be answered by the author.', 'Question rhétorique : posée pour être réfutée par l’auteur.'),
      b('Paradox: plus… plus… (an unexpected link).', 'Paradoxe : plus… plus… (un lien inattendu).'),
      b('Reformulate: autrement dit, en d’autres termes, l’auteur soutient que…', 'Reformuler : autrement dit, en d’autres termes, l’auteur soutient que…'),
    ],
    [['un transfert', b('a transfer', 'déplacement')], ['l’interprétation', b('interpretation', 'lecture personnelle')], ['paradoxalement', b('paradoxically', 'de façon contradictoire')]],
  ),
];
