import type { CourseAbout } from '../../types';
import { b, card, dlg, doc, hear, lesson, mc, P, say, sort, tip, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'For candidates aiming for the highest scores (C1 and above, NCLC 9–10 and beyond): a demanding practice set with implicit and ironic listening documents, complex argumentative texts, writing tasks requiring sophisticated structure and style, and speaking tasks where nuance and rhetorical precision make the difference. All documents are original practice material.',
    'Pour les candidats qui visent les meilleurs scores (C1 et au-delà, NCLC 9–10 et plus) : un entraînement exigeant avec des documents oraux implicites et ironiques, des textes argumentatifs complexes, des tâches écrites exigeant une structure et un style recherchés, et des tâches orales où la nuance et la précision rhétorique font la différence. Tous les documents sont des supports d’entraînement originaux.',
  ),
  outcomes: [
    b('Understand implicit and ironic speech', 'Comprendre l’implicite et l’ironie'),
    b('Analyse complex argumentative texts', 'Analyser des textes argumentatifs complexes'),
    b('Write with C1 structure and style', 'Écrire avec la structure et le style du C1'),
    b('Speak with nuance and precision', 'S’exprimer avec nuance et précision'),
  ],
};

const C = 'tcf-mock-c1';
export default [
  lesson(C, 1, ['listening-and-reading', 'comprehension-orale-et-ecrite'],
    b('C1 listening and reading (timed)', 'Compréhension C1 (chronométrée)'),
    b('Infer attitudes, irony and the function of arguments.', 'Inférer attitudes, ironie et fonction des arguments.'),
    [b('Understand irony', 'Comprendre l’ironie'), b('Identify the function of a statement', 'Identifier la fonction d’un énoncé'), b('Infer the implicit', 'Inférer l’implicite')],
    13,
    [
      hear('Formidable : après trois ans de concertation, deux cabinets de conseil et un budget triplé, le nouveau logo de la région ressemble trait pour trait à l’ancien. On mesure l’audace.', b('What is the speaker’s attitude?', 'Quelle est l’attitude du locuteur ?'), [b('ironic, critical of wasted money', 'ironique, critique envers l’argent gaspillé'), b('sincerely enthusiastic', 'sincèrement enthousiaste'), b('neutral, purely informative', 'neutre, purement informatif'), b('admiring of the designers’ boldness', 'admiratif de l’audace des créateurs')], { voice: 'm', timer: 60 }),
      hear('Je ne dis pas que la réforme est inutile. Je dis qu’on nous la présente comme une révolution alors qu’elle ne touche qu’une infime partie du problème, et qu’elle évite soigneusement la question du financement.', b('What does the speaker reproach the reform for?', 'Que reproche la locutrice à la réforme ?'), [b('being oversold and avoiding the funding issue', 'd’être survendue et d’éviter la question du financement'), b('being completely useless', 'd’être complètement inutile'), b('being too expensive', 'd’être trop chère'), b('being too revolutionary', 'd’être trop révolutionnaire')], { voice: 'f', timer: 60 }),
      doc({ look: 'article', title: b('Essay extract', 'Extrait d’essai'), text: 'Il serait tentant de voir dans la multiplication des applications de méditation le signe d’une société enfin attentive au bien-être. On peut pourtant y lire l’inverse : la preuve d’un épuisement collectif que l’on prétend soigner avec les outils mêmes qui l’ont produit. Car que propose-t-on à l’employé surmené, sinon dix minutes de respiration guidée… sur son téléphone ?' }, b('What is the author’s thesis?', 'Quelle est la thèse de l’auteur ?'), [b('Meditation apps reveal collective exhaustion and use the very tools that caused it.', 'Les applis de méditation révèlent un épuisement collectif et utilisent les outils mêmes qui l’ont causé.'), b('Meditation apps prove society cares about well-being.', 'Les applis prouvent que la société se soucie du bien-être.'), b('Phones are good for health.', 'Les téléphones sont bons pour la santé.'), b('Employees should meditate more.', 'Les employés devraient méditer davantage.')], { timer: 120 }),
      mc(P.choose, [b('a rhetorical question that reinforces the criticism', 'une question rhétorique qui renforce la critique'), b('a real question to the reader', 'une vraie question au lecteur'), b('a concession', 'une concession'), b('a neutral example', 'un exemple neutre')], { fr: 'Dans l’extrait, la dernière phrase (« que propose-t-on… sur son téléphone ? ») est…', timer: 60 }),
      doc({ look: 'article', title: b('Column', 'Chronique'), text: 'Chaque rentrée apporte son lot de « méthodes miracles » pour apprendre plus vite. Gageons que celle de cette année, comme les précédentes, aura surtout enrichi ses auteurs.' }, b('What does the columnist imply?', 'Que sous-entend le chroniqueur ?'), [b('These methods mainly benefit their sellers.', 'Ces méthodes profitent surtout à leurs vendeurs.'), b('This year’s method really works.', 'La méthode de cette année fonctionne vraiment.'), b('Students learn faster each year.', 'Les élèves apprennent plus vite chaque année.'), b('Authors should be paid more.', 'Les auteurs devraient être mieux payés.')], { timer: 60 }),
    ],
    [
      b('C1: irony, implicit meaning, rhetorical questions.', 'C1 : ironie, implicite, questions rhétoriques.'),
      b('Distinguish what is said from what is meant.', 'Distinguez ce qui est dit de ce qui est signifié.'),
      b('Identify the function: concede, refute, mock, illustrate.', 'Identifiez la fonction : concéder, réfuter, ironiser, illustrer.'),
    ],
    [['trait pour trait', b('exactly, feature for feature', 'identique')], ['surmené', b('overworked', 'trop fatigué par le travail')], ['gageons que', b('let’s bet that', 'on peut parier que')]],
  ),
  lesson(C, 2, ['writing-at-c1', 'ecrire-au-c1'],
    b('Writing task 3 at C1', 'La tâche 3 écrite au C1'),
    b('Write a sophisticated task 3 with precise reformulation and refined argument.', 'Rédiger une tâche 3 raffinée avec reformulation précise et argumentation fine.'),
    [b('Reformulate with precision', 'Reformuler avec précision'), b('Argue with refinement', 'Argumenter avec finesse'), b('Polish style', 'Soigner le style')],
    13,
    [
      card(b('C1 writing markers', 'Marqueurs de l’écrit C1'), b('**Precise reformulation** (nominalisation: la généralisation du télétravail). **Refined connectors** (dès lors, il n’en demeure pas moins, à cet égard). **Varied syntax** (participiales, inversion après « aussi », mise en relief: c’est… que). **Nuanced modality** (il semble que, il est probable que, dans une certaine mesure). **No vague words**.', '**Reformulation précise** (nominalisation : la généralisation du télétravail). **Connecteurs raffinés** (dès lors, il n’en demeure pas moins, à cet égard). **Syntaxe variée** (participiales, inversion après « aussi », mise en relief : c’est… que). **Modalisation nuancée** (il semble que, il est probable que, dans une certaine mesure). **Aucun mot vague**.')),
      write(b('Task 3 at C1 (150–180 words)', 'Tâche 3 au C1 (150–180 mots)'), b('Document 1: « L’intelligence artificielle libérera les salariés des tâches répétitives. » Document 2: « L’intelligence artificielle menace des millions d’emplois qualifiés. » Present both views, then give a nuanced opinion.', 'Document 1 : « L’intelligence artificielle libérera les salariés des tâches répétitives. » Document 2 : « L’intelligence artificielle menace des millions d’emplois qualifiés. » Présentez les deux avis, puis donnez une opinion nuancée.'), 140, 180, [
        b('Precise, nominalised reformulation', 'Reformulation précise et nominalisée'),
        b('Refined connectors and varied syntax', 'Connecteurs raffinés et syntaxe variée'),
        b('Nuanced, clearly stated position', 'Position nuancée et clairement énoncée'),
      ], 'L’essor de l’intelligence artificielle suscite des lectures opposées. Le premier document y voit une libération : les salariés seraient débarrassés des tâches répétitives. Le second, à l’inverse, redoute la disparition de nombreux emplois qualifiés.\n\nCes deux visions me paraissent moins contradictoires qu’il n’y paraît. Certes, l’automatisation de certaines tâches, comme la rédaction de comptes rendus, permet de consacrer davantage de temps au contact humain ; c’est d’ailleurs ce qu’observent déjà de nombreux cabinets comptables. Il n’en demeure pas moins que des métiers entiers risquent d’être profondément transformés, et que la transition sera brutale pour ceux qui ne seront pas formés. Dès lors, la véritable question n’est pas de savoir si l’intelligence artificielle détruira ou créera des emplois, mais qui en supportera le coût. Aussi convient-il d’investir massivement dans la formation continue, faute de quoi le progrès technique deviendra une source d’inégalités.'),
      tip(b('Re-read like an examiner', 'Relisez comme un correcteur'), b('Underline in your text: **one nominalisation, three refined connectors, one inversion or mise en relief, one modaliser**. If you can’t find them, your text is probably B2, not C1.', 'Soulignez dans votre texte : **une nominalisation, trois connecteurs raffinés, une inversion ou mise en relief, un modalisateur**. Si vous ne les trouvez pas, votre texte est sans doute B2, pas C1.')),
    ],
    [
      b('C1: nominalisation, refined connectors, varied syntax, modalisation.', 'C1 : nominalisation, connecteurs raffinés, syntaxe variée, modalisation.'),
      b('Reframe the question: la véritable question n’est pas…, mais…', 'Recadrez : la véritable question n’est pas…, mais…'),
      b('End with a precise proposal.', 'Terminez par une proposition précise.'),
    ],
    [['l’essor', b('the rise, boom', 'développement rapide')], ['redouter', b('to fear', 'craindre')], ['la formation continue', b('lifelong learning, continuing education', 'formation des adultes')]],
  ),
  lesson(C, 3, ['speaking-at-c1', 'parler-au-c1'],
    b('Speaking task 3 at C1', 'La tâche 3 orale au C1'),
    b('Speak with rhetorical precision, reframe the question and handle subtle objections.', 'Parler avec précision rhétorique, recadrer la question et gérer des objections subtiles.'),
    [b('Reframe the question', 'Recadrer la question'), b('Use nuance and modalisation', 'Employer nuance et modalisation'), b('Handle a subtle objection', 'Gérer une objection subtile')],
    13,
    [
      say('Je crois que la question est mal posée. Il ne s’agit pas de choisir entre la croissance et l’écologie, mais de redéfinir ce que nous appelons la croissance.', 'I think the question is badly framed. It isn’t about choosing between growth and ecology, but about redefining what we call growth.', { tip: b('Reframing the question is a strong C1 move.', 'Recadrer la question est un geste fort au C1.') }),
      dlg(b('A subtle objection', 'Une objection subtile'), undefined, [['Examinateur', 'm'], ['Vous', 'f']], [
        [0, 'Vous défendez la gratuité des musées. Mais ce qui est gratuit n’est-il pas souvent perçu comme sans valeur ?', 'You defend free museums. But isn’t what is free often perceived as worthless?'],
        [1, { options: ['L’objection est pertinente, et certaines études vont dans ce sens. Toutefois, l’expérience des musées nationaux britanniques suggère plutôt l’inverse : la gratuité a élargi le public sans dévaloriser les collections.', 'Non, c’est faux.', 'Oui, vous avez raison, j’abandonne.'] }],
        [0, 'Et le coût pour la collectivité ?', 'And the cost for the community?'],
        [1, { options: ['C’est un choix politique : on peut considérer la culture comme une dépense, ou comme un investissement dont les bénéfices, éducatifs et sociaux, sont simplement moins visibles.', 'Ce n’est pas mon problème.', 'Ça coûte cher, c’est tout.'] }],
      ]),
      sort(b('Which C1 move?', 'Quel geste C1 ?'), [b('reframe', 'recadrer'), b('concede and refute', 'concéder et réfuter'), b('modalise', 'modaliser')], [['La question est mal posée.', 0], ['L’objection est pertinente ; toutefois…', 1], ['Il est probable que…', 2], ['Il ne s’agit pas de…, mais de…', 0], ['Certes…, il n’en reste pas moins que…', 1], ['Dans une certaine mesure…', 2]]),
      tip(b('References and precision', 'Références et précision'), b('At C1, a **precise reference** (a policy, a country’s experience, a study, a historical precedent) is worth more than three general arguments. Prepare a few references on frequent themes.', 'Au C1, une **référence précise** (une politique, l’expérience d’un pays, une étude, un précédent historique) vaut plus que trois arguments généraux. Préparez quelques références sur les thèmes fréquents.')),
    ],
    [
      b('Reframe: La question est mal posée. Il ne s’agit pas de…, mais de…', 'Recadrer : La question est mal posée. Il ne s’agit pas de…, mais de…'),
      b('Concede and refute with references.', 'Concédez et réfutez avec des références.'),
      b('Modalise: il est probable que, dans une certaine mesure.', 'Modalisez : il est probable que, dans une certaine mesure.'),
    ],
    [['la gratuité', b('being free of charge', 'fait d’être gratuit')], ['dévaloriser', b('to devalue', 'faire perdre de la valeur')], ['la collectivité', b('the community, the public', 'ensemble des citoyens')]],
  ),
];
