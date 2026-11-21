import type { CourseAbout } from '../../types';
import { b, dlg, doc, hear, lesson, mc, P, say, sort, tip, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'A complete B2 practice set, the NCLC 7 target, in the spirit of the TEF: timed comprehension on radio programmes, opinion articles and professional letters; writing sections A and B with demanding topics; speaking sections A and B with negotiation and strong objections. Model answers show what B2 performance looks like. All documents are original practice material.',
    'Un entraînement complet de niveau B2, l’objectif du NCLC 7, dans l’esprit du TEF : compréhension chronométrée sur des émissions de radio, des articles d’opinion et des lettres professionnelles ; sections écrites A et B sur des sujets exigeants ; sections orales A et B avec négociation et objections fortes. Les réponses modèles montrent à quoi ressemble une performance B2. Tous les documents sont des supports d’entraînement originaux.',
  ),
  outcomes: [
    b('Practise B2 comprehension under time pressure', 'S’entraîner à la compréhension B2 en temps limité'),
    b('Write B2 sections A and B', 'Rédiger les sections A et B au B2'),
    b('Handle strong objections in speaking', 'Gérer des objections fortes à l’oral'),
    b('Measure your distance to NCLC 7', 'Mesurer la distance au NCLC 7'),
  ],
};

const C = 'tef-mock-b2';
export default [
  lesson(C, 1, ['comprehension', 'comprehension'],
    b('B2 listening and reading (timed)', 'Compréhension B2 (chronométrée)'),
    b('Answer B2 questions on opinions, purposes and implicit meaning.', 'Répondre à des questions B2 sur opinions, objectifs et implicite.'),
    [b('Identify nuanced opinions', 'Repérer les opinions nuancées'), b('Identify the purpose of a letter', 'Identifier l’objectif d’une lettre'), b('Infer implicit meaning', 'Inférer l’implicite')],
    13,
    [
      hear('Le nouveau programme d’aide à la rénovation est une bonne idée sur le papier. Encore faut-il que les propriétaires en entendent parler : la campagne d’information, elle, est presque inexistante.', b('What does the speaker criticise?', 'Que critique le locuteur ?'), [b('the lack of information about the programme', 'le manque d’information sur le programme'), b('the programme itself', 'le programme lui-même'), b('the owners', 'les propriétaires'), b('the cost of renovations', 'le coût des rénovations')], { voice: 'm', timer: 60 }),
      hear('On parle beaucoup de pénurie de main-d’œuvre. Pourtant, des milliers de personnes immigrantes qualifiées occupent des emplois bien en dessous de leurs compétences, faute de reconnaissance de leurs diplômes.', b('What does the speaker imply?', 'Que sous-entend la locutrice ?'), [b('Recognising diplomas would help solve the labour shortage.', 'Reconnaître les diplômes aiderait à résoudre la pénurie.'), b('There is no labour shortage.', 'Il n’y a pas de pénurie.'), b('Immigrants are not qualified.', 'Les immigrants ne sont pas qualifiés.'), b('Companies refuse to hire.', 'Les entreprises refusent d’embaucher.')], { voice: 'f', timer: 60 }),
      doc({ look: 'letter', title: b('Professional letter', 'Lettre professionnelle'), text: 'Madame,\n\nNous accusons réception de votre candidature au poste de coordonnatrice de projets et vous en remercions. Votre profil a retenu toute notre attention. Toutefois, le poste ayant été pourvu en interne, nous ne sommes pas en mesure de donner une suite favorable à votre demande. Nous conservons néanmoins votre dossier pour de futures opportunités.' }, b('What is the purpose of the letter?', 'Quel est l’objectif de la lettre ?'), [b('to politely reject the application', 'refuser poliment la candidature'), b('to offer the job', 'proposer le poste'), b('to invite her to an interview', 'l’inviter à un entretien'), b('to ask for more documents', 'demander plus de documents')], { timer: 90 }),
      mc(P.meaning, [b('the position was given to someone already in the company', 'le poste a été attribué à quelqu’un de l’entreprise'), b('the position was cancelled', 'le poste a été supprimé'), b('the position is still open', 'le poste est toujours ouvert'), b('the position is outside the city', 'le poste est hors de la ville')], { fr: '« le poste ayant été pourvu en interne » :', timer: 45 }),
      doc({ look: 'article', title: b('Opinion', 'Tribune'), text: 'Chaque été, on s’étonne de voir les plages bondées et les sentiers de randonnée saturés. Mais à force de promouvoir les mêmes destinations sur les réseaux sociaux, que pouvait-on espérer d’autre ? Le tourisme de masse n’est pas une fatalité : c’est le résultat de nos choix.' }, b('What is the author’s thesis?', 'Quelle est la thèse de l’auteur ?'), [b('Mass tourism results from our choices, not fate.', 'Le tourisme de masse résulte de nos choix, pas d’une fatalité.'), b('Beaches should be closed.', 'Il faut fermer les plages.'), b('Social media are useless.', 'Les réseaux sociaux sont inutiles.'), b('Hiking is dangerous.', 'La randonnée est dangereuse.')], { timer: 90 }),
    ],
    [
      b('B2: criticisms behind positive words (encore faut-il…).', 'B2 : critiques derrière des mots positifs (encore faut-il…).'),
      b('Formal letters: polite refusal formulas.', 'Lettres formelles : formules de refus poli.'),
      b('Rhetorical questions reveal the thesis.', 'Les questions rhétoriques révèlent la thèse.'),
    ],
    [['accuser réception', b('to acknowledge receipt', 'confirmer avoir reçu')], ['pourvoir un poste', b('to fill a position', 'attribuer un poste')], ['saturé', b('overcrowded, saturated', 'trop plein')]],
  ),
  lesson(C, 2, ['writing', 'expression-ecrite'],
    b('B2 writing sections A and B', 'Expression écrite B2 : sections A et B'),
    b('Write a rich news story continuation and an argued B2 letter.', 'Rédiger une suite de fait divers riche et une lettre argumentée de B2.'),
    [b('Section A with journalistic style', 'Section A en style journalistique'), b('Section B with concession and nuance', 'Section B avec concession et nuance'), b('Compare with models', 'Comparer avec les modèles')],
    13,
    [
      write(b('Section A (100–150 words)', 'Section A (100–150 mots)'), b('Beginning: « Un autobus scolaire bloqué par la neige : les élèves passent la nuit dans une ferme. Mercredi soir, en pleine tempête, un autobus transportant quinze élèves s’est retrouvé immobilisé sur une route de campagne près de Saint-Hyacinthe. » Continue the article.', 'Début : « Un autobus scolaire bloqué par la neige : les élèves passent la nuit dans une ferme. Mercredi soir, en pleine tempête, un autobus transportant quinze élèves s’est retrouvé immobilisé sur une route de campagne près de Saint-Hyacinthe. » Poursuivez l’article.'), 100, 150, [
        b('Consistent and well sequenced', 'Cohérent et bien enchaîné'),
        b('Journalistic vocabulary and testimony', 'Lexique journalistique et témoignage'),
        b('A satisfying ending', 'Un dénouement satisfaisant'),
      ], 'Face à la visibilité nulle, le chauffeur a préféré ne prendre aucun risque. Il a aussitôt prévenu l’école, puis frappé à la porte de la ferme la plus proche. Les propriétaires, un couple d’agriculteurs, ont immédiatement accueilli les enfants, âgés de 9 à 12 ans. « On a sorti toutes les couvertures de la maison et préparé une grande soupe », a raconté l’agricultrice. Les parents, prévenus par téléphone, ont pu parler à leurs enfants dans la soirée. Jeudi matin, une fois les routes dégagées, les élèves ont été reconduits sains et saufs à l’école. La commission scolaire a tenu à remercier publiquement la famille pour son hospitalité.'),
      write(b('Section B (220–280 words)', 'Section B (220–280 mots)'), b('React to: « Le télétravail devrait devenir un droit pour tous les salariés dont le poste le permet. » Write a letter to a newspaper with at least three arguments and a concession.', 'Réagissez à : « Le télétravail devrait devenir un droit pour tous les salariés dont le poste le permet. » Écrivez une lettre à un journal avec au moins trois arguments et une concession.'), 220, 290, [
        b('Clear position', 'Position claire'),
        b('Three developed arguments + concession', 'Trois arguments développés + concession'),
        b('Formal register and conclusion', 'Registre soutenu et conclusion'),
      ], 'Madame, Monsieur,\n\nVotre article sur le télétravail a retenu toute mon attention. Selon certains, il devrait devenir un droit pour tous les salariés dont le poste le permet. Je partage largement cet avis.\n\nTout d’abord, le télétravail améliore la qualité de vie. En supprimant les trajets quotidiens, il libère un temps précieux pour la famille ou le sport. Une de mes collègues gagne ainsi près de deux heures par jour.\n\nEnsuite, il présente des avantages environnementaux indéniables : moins de déplacements, c’est moins d’embouteillages et moins de pollution, en particulier dans les grandes villes.\n\nEnfin, en faire un droit protégerait les salariés de l’arbitraire. Aujourd’hui, l’accès au télétravail dépend trop souvent de la bonne volonté d’un responsable, ce qui crée des inégalités au sein d’une même équipe. Deux collègues occupant le même poste peuvent ainsi être traités de façon très différente, ce qui nuit à l’ambiance de travail.\n\nCertes, le travail à distance comporte des risques, notamment l’isolement et la difficulté de déconnecter. Il n’en reste pas moins que ces risques peuvent être limités par des règles claires : deux ou trois jours par semaine au maximum, un droit à la déconnexion et des moments de présence collective.\n\nEn définitive, le télétravail ne devrait pas être un privilège, mais une possibilité encadrée, accessible à tous ceux dont le métier le permet.\n\nVeuillez agréer, Madame, Monsieur, mes salutations distinguées.\n\nYasmine Lefort'),
    ],
    [
      b('Section A B2: rich narration, testimony, clear ending.', 'Section A B2 : narration riche, témoignage, dénouement clair.'),
      b('Section B B2: three arguments, concession, formal register.', 'Section B B2 : trois arguments, concession, registre soutenu.'),
      b('Compare with the models and list your gaps.', 'Comparez avec les modèles et listez vos lacunes.'),
    ],
    [['immobilisé', b('stranded, immobilised', 'qui ne peut plus avancer')], ['sain et sauf', b('safe and sound', 'sans blessure')], ['l’arbitraire', b('arbitrariness', 'décision sans règle')]],
  ),
  lesson(C, 3, ['speaking', 'expression-orale'],
    b('B2 speaking sections A and B', 'Expression orale B2 : sections A et B'),
    b('Ask precise questions with follow-ups and convince against strong objections.', 'Poser des questions précises avec relances et convaincre face à des objections fortes.'),
    [b('Section A: precise questions and follow-ups', 'Section A : questions précises et relances'), b('Section B: strong objections', 'Section B : objections fortes'), b('Self-assess', 'S’auto-évaluer')],
    13,
    [
      sort(b('B1 or B2 question?', 'Question B1 ou B2 ?'), [b('B1', 'B1'), b('B2', 'B2')], [['C’est cher ?', 0], ['Le tarif inclut-il l’assurance annulation ?', 1], ['Il y a des places ?', 0], ['Dans le cas où le groupe serait complet, existe-t-il une liste d’attente ?', 1], ['C’est où ?', 0], ['Le lieu est-il accessible aux personnes à mobilité réduite ?', 1]]),
      dlg(b('Section B: a strong objection', 'Section B : une objection forte'), undefined, [['Examinateur (ami)', 'm'], ['Vous', 'f']], [
        [0, 'Un voyage solidaire pour construire une école ? Franchement, ce n’est pas mon truc, et puis je ne sais rien faire de mes mains.', 'A volunteer trip to build a school? Honestly, it’s not my thing, and I’m useless with my hands.'],
        [1, { options: ['Je te comprends, mais l’association forme tous les participants sur place, et il y a aussi des tâches d’organisation et d’animation avec les enfants, toi qui adores ça.', 'Alors reste chez toi.', 'Moi non plus, je ne sais rien faire.'] }],
        [0, 'Et ça coûte une fortune, ce genre de voyage.', 'And that kind of trip costs a fortune.'],
        [1, { options: ['C’est vrai que ce n’est pas donné. Mais l’association propose de financer une partie du voyage grâce à des collectes, et on pourrait organiser une vente de gâteaux ensemble.', 'Non, ce n’est pas cher.', 'Tant pis.'] }],
        [0, 'Bon… tu sais me convaincre. On en reparle ce week-end ?', 'Well… you know how to convince me. Let’s talk about it this weekend?'],
      ]),
      say('Dans le cas où je devrais annuler pour raisons médicales, serais-je remboursé ?', 'If I had to cancel for medical reasons, would I be refunded?'),
      tip(b('B2 self-check', 'Auto-évaluation B2'), b('Rate yourself 1–5: **question variety, follow-ups, persuasion strategy, answers to objections, nuance, fluency**. Below 3? Make it next week’s priority.', 'Notez-vous de 1 à 5 : **variété des questions, relances, stratégie de persuasion, réponses aux objections, nuance, aisance**. Moins de 3 ? Priorité de la semaine prochaine.')),
    ],
    [
      b('Section A B2: precise, varied questions; hypothetical follow-ups.', 'Section A B2 : questions précises et variées ; relances hypothétiques.'),
      b('Section B B2: adapted arguments, concrete solutions.', 'Section B B2 : arguments adaptés, solutions concrètes.'),
      b('Self-assess on six criteria.', 'Auto-évaluez-vous sur six critères.'),
    ],
    [['à mobilité réduite', b('with reduced mobility', 'qui se déplace difficilement')], ['ce n’est pas donné', b('it’s not cheap', 'c’est cher')], ['une collecte', b('a fundraiser', 'récolte d’argent')]],
  ),
];
