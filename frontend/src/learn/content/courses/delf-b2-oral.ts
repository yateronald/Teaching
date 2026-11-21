import type { CourseAbout } from '../../types';
import { b, card, dlg, doc, exam, lesson, mc, P, say, sort, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'In the DELF B2 speaking test, you have 30 minutes to prepare, then about 20 minutes with the examiners: you present and defend a point of view based on a short document that raises a debate, then you discuss and defend your position. This course trains you to identify the problem raised (la problématique), build a structured argument, use B2 connectors and nuance, and resist the examiner’s objections with confidence.',
    'À l’oral du DELF B2, vous avez 30 minutes de préparation, puis environ 20 minutes avec le jury : vous présentez et défendez un point de vue à partir d’un court document qui pose un débat, puis vous discutez et défendez votre position. Ce cours vous entraîne à dégager la problématique, construire une argumentation structurée, employer les connecteurs et la nuance du niveau B2, et résister avec assurance aux objections de l’examinateur.',
  ),
  outcomes: [
    b('Identify the problem raised by a document', 'Dégager la problématique d’un document'),
    b('Build a structured presentation', 'Construire un exposé structuré'),
    b('Use B2 connectors and nuance', 'Employer connecteurs et nuances du B2'),
    b('Defend your position in the debate', 'Défendre sa position dans le débat'),
  ],
};

const C = 'delf-b2-oral';
export default [
  lesson(C, 1, ['the-problematique', 'la-problematique'],
    b('From document to problem statement', 'Du document à la problématique'),
    b('Read a short document and turn its topic into a debatable question.', 'Lire un court document et transformer son thème en question débattable.'),
    [b('Find the topic', 'Trouver le thème'), b('Formulate the problématique', 'Formuler la problématique'), b('Announce your plan', 'Annoncer son plan')],
    13,
    [
      exam(b('The B2 oral', 'L’oral du B2'), b('**30 minutes of preparation**, then about **20 minutes**: **monologue** (present the topic, the problem and your argued opinion) then **debate** with the examiners. Assessment: **presenting the problem, structured argument, clear position, interaction, vocabulary, grammar, pronunciation**.', '**30 minutes de préparation**, puis environ **20 minutes** : **monologue** (présenter le thème, la problématique et votre opinion argumentée) puis **débat** avec le jury. Critères : **présentation de la problématique, argumentation structurée, position claire, interaction, lexique, grammaire, phonologie**.')),
      card(b('Problématique and plan', 'Problématique et plan'), b('Topic → **question**: **Ce document évoque… · Il pose la question suivante : faut-il… ? / Dans quelle mesure… ?** Plan: **Dans un premier temps, j’examinerai…, puis je montrerai que…, avant de conclure.** Avoid simply summarising the document: the examiners want **your** argument.', 'Thème → **question** : **Ce document évoque… · Il pose la question suivante : faut-il… ? / Dans quelle mesure… ?** Plan : **Dans un premier temps, j’examinerai…, puis je montrerai que…, avant de conclure.** Évitez de simplement résumer le document : le jury attend **votre** argumentation.')),
      doc({ look: 'article', title: b('Document', 'Document'), text: 'Écrans à l’école : plusieurs pays reviennent en arrière\nAprès avoir équipé les classes de tablettes, certains pays européens réintroduisent les manuels papier et l’écriture à la main. Les résultats en lecture auraient baissé. Les défenseurs du numérique dénoncent un retour en arrière.' }, b('Which problématique fits best?', 'Quelle problématique convient le mieux ?'), [b('Should schools limit screens to improve learning?', 'Faut-il limiter les écrans à l’école pour mieux apprendre ?'), b('How many tablets exist in Europe?', 'Combien de tablettes existe-t-il en Europe ?'), b('Do children like tablets?', 'Les enfants aiment-ils les tablettes ?'), b('What is a textbook?', 'Qu’est-ce qu’un manuel ?')]),
      sort(b('Summary or problématique?', 'Résumé ou problématique ?'), [b('just a summary', 'simple résumé'), b('real problématique', 'vraie problématique')], [['Le document parle des tablettes.', 0], ['Dans quelle mesure le numérique aide-t-il vraiment à apprendre ?', 1], ['Certains pays reviennent aux manuels.', 0], ['Faut-il revenir au papier pour améliorer la lecture ?', 1], ['Les résultats auraient baissé.', 0], ['L’école doit-elle résister à la technologie ?', 1]]),
      say('Ce document évoque le retour du papier dans les écoles. Il pose une question essentielle : dans quelle mesure les écrans aident-ils vraiment les élèves à apprendre ?', 'This document mentions the return of paper in schools. It raises an essential question: to what extent do screens really help pupils learn?'),
    ],
    [
      b('30 min preparation, about 20 min: monologue + debate.', '30 min de préparation, environ 20 min : monologue + débat.'),
      b('Topic → debatable question: Faut-il… ? Dans quelle mesure… ?', 'Thème → question débattable : Faut-il… ? Dans quelle mesure… ?'),
      b('Announce your plan; don’t just summarise.', 'Annoncez votre plan ; ne résumez pas seulement.'),
    ],
    [['la problématique', b('the problem statement', 'question centrale')], ['un manuel', b('a textbook', 'livre scolaire')], ['revenir en arrière', b('to go backwards', 'reculer')]],
  ),
  lesson(C, 2, ['building-the-argument', 'construire-l-argumentation'],
    b('Building the argument', 'Construire l’argumentation'),
    b('Organise two or three arguments with examples, concessions and a conclusion.', 'Organiser deux ou trois arguments avec exemples, concessions et conclusion.'),
    [b('Use B2 connectors', 'Employer les connecteurs B2'), b('Make a concession', 'Faire une concession'), b('Conclude with an opening', 'Conclure par une ouverture')],
    13,
    [
      card(b('B2 connectors', 'Connecteurs B2'), b('Add: **En outre, Par ailleurs, De surcroît**. Cause/consequence: **En effet, Étant donné que, C’est pourquoi, Par conséquent**. Concession: **Certes…, mais / Bien que + subjonctif / Il n’en reste pas moins que**. Opposition: **En revanche, Toutefois, Néanmoins**. Conclusion: **En définitive, Tout bien considéré**. Opening: **On pourrait aussi se demander si…**', 'Ajouter : **En outre, Par ailleurs, De surcroît**. Cause/conséquence : **En effet, Étant donné que, C’est pourquoi, Par conséquent**. Concession : **Certes…, mais / Bien que + subjonctif / Il n’en reste pas moins que**. Opposition : **En revanche, Toutefois, Néanmoins**. Conclusion : **En définitive, Tout bien considéré**. Ouverture : **On pourrait aussi se demander si…**')),
      sort(b('Function of the connector', 'Fonction du connecteur'), [b('add', 'ajouter'), b('concede', 'concéder'), b('consequence', 'conséquence')], [['Par ailleurs', 0], ['Certes', 1], ['Par conséquent', 2], ['En outre', 0], ['Bien que', 1], ['C’est pourquoi', 2]]),
      mc(P.form, ['Bien que les tablettes soient pratiques, elles distraient les élèves.', 'Bien que les tablettes sont pratiques, elles distraient les élèves.', 'Bien que les tablettes seront pratiques, elles distraient les élèves.', 'Bien que les tablettes étant pratiques, elles distraient les élèves.']),
      write(b('Your argument outline', 'Votre plan d’argumentation'), b('Write your outline (70–110 words) for the screens-at-school document: problématique, two arguments with examples, a concession, a conclusion with an opening.', 'Rédigez votre plan (70–110 mots) pour le document sur les écrans à l’école : problématique, deux arguments avec exemples, une concession, une conclusion avec ouverture.'), 70, 110, [
        b('Problématique', 'Problématique'),
        b('Two arguments + examples', 'Deux arguments + exemples'),
        b('Concession and conclusion with an opening', 'Concession et conclusion avec ouverture'),
      ], 'Problématique : faut-il limiter les écrans à l’école ? 1. Les écrans peuvent nuire à la concentration et à la lecture longue (ex. : notifications, lecture en diagonale). 2. L’écriture manuscrite aide à mémoriser (études récentes, mon expérience d’étudiant). Concession : certes, le numérique est indispensable (recherche, accessibilité pour les élèves dyslexiques). Conclusion : limiter sans interdire, former les élèves à un usage critique. Ouverture : et les écrans à la maison ?'),
      say('Certes, le numérique est indispensable aujourd’hui. Il n’en reste pas moins que l’écriture à la main aide à mémoriser.', 'Admittedly, digital tools are essential today. The fact remains that handwriting helps memorisation.'),
    ],
    [
      b('Add: en outre, par ailleurs. Consequence: c’est pourquoi, par conséquent.', 'Ajouter : en outre, par ailleurs. Conséquence : c’est pourquoi, par conséquent.'),
      b('Concede: certes… mais, bien que + subjonctif, il n’en reste pas moins que.', 'Concéder : certes… mais, bien que + subjonctif, il n’en reste pas moins que.'),
      b('Conclude: en définitive + opening question.', 'Conclure : en définitive + question d’ouverture.'),
    ],
    [['nuire à', b('to harm', 'faire du tort')], ['manuscrit', b('handwritten', 'écrit à la main')], ['distraire', b('to distract', 'détourner l’attention')]],
  ),
  lesson(C, 3, ['the-debate', 'le-debat-avec-le-jury'],
    b('The debate with the examiners', 'Le débat avec le jury'),
    b('Answer objections, ask for clarification and keep your position with nuance.', 'Répondre aux objections, demander des précisions et maintenir sa position avec nuance.'),
    [b('Rephrase the question', 'Reformuler la question'), b('Answer an objection', 'Répondre à une objection'), b('Keep or adjust your position', 'Maintenir ou ajuster sa position')],
    13,
    [
      card(b('Debate techniques', 'Techniques du débat'), b('Gain time: **C’est une question intéressante… · Si je comprends bien, vous me demandez si…** Answer: **Je vous rejoins en partie, mais… · Je maintiens que… · Prenons un exemple concret : …** Adjust: **Vous avez raison de souligner ce point, je nuancerais donc mon propos : …** The examiner **plays devil’s advocate**: it is not personal.', 'Gagner du temps : **C’est une question intéressante… · Si je comprends bien, vous me demandez si…** Répondre : **Je vous rejoins en partie, mais… · Je maintiens que… · Prenons un exemple concret : …** Ajuster : **Vous avez raison de souligner ce point, je nuancerais donc mon propos : …** L’examinateur **joue l’avocat du diable** : ce n’est pas personnel.')),
      dlg(b('Debate', 'Débat'), undefined, [['Examinateur', 'm'], ['Vous', 'f']], [
        [0, 'Mais les élèves d’aujourd’hui vivront dans un monde numérique. Limiter les écrans, ce n’est pas les désavantager ?', 'But today’s pupils will live in a digital world. Isn’t limiting screens a disadvantage for them?'],
        [1, { options: ['Je vous rejoins en partie : ils doivent maîtriser le numérique. Mais justement, apprendre à s’en servir de manière critique suppose de savoir aussi s’en passer.', 'Non, ce n’est pas vrai.', 'Je ne sais pas, peut-être.'] }],
        [0, 'Concrètement, que proposeriez-vous ?', 'Concretely, what would you propose?'],
        [1, { options: ['Par exemple, des cours d’éducation au numérique, mais des cahiers pour l’écriture et la lecture longue.', 'Rien de spécial.', 'Supprimer tous les ordinateurs.'] }],
      ]),
      mc(P.best, ['Si je comprends bien, vous me demandez si cette mesure ne risque pas d’accroître les inégalités ?', 'Quoi ?', 'Je n’ai pas compris, question suivante.', 'Pas d’avis.'], { fr: 'La question de l’examinateur est longue et complexe. Vous reformulez :' }),
      sort(b('Gain time, answer or adjust?', 'Gagner du temps, répondre ou ajuster ?'), [b('gain time', 'gagner du temps'), b('answer', 'répondre'), b('adjust', 'ajuster')], [['C’est une question intéressante…', 0], ['Je maintiens que…', 1], ['Je nuancerais donc mon propos.', 2], ['Si je comprends bien…', 0], ['Prenons un exemple concret.', 1], ['Vous avez raison de souligner ce point.', 2]]),
      say('Je vous rejoins en partie, mais je maintiens que l’école doit aussi apprendre à se passer des écrans.', 'I partly agree with you, but I maintain that school must also teach how to do without screens.'),
    ],
    [
      b('Gain time: C’est une question intéressante… Si je comprends bien…', 'Gagner du temps : C’est une question intéressante… Si je comprends bien…'),
      b('Answer: Je vous rejoins en partie, mais… Je maintiens que…', 'Répondre : Je vous rejoins en partie, mais… Je maintiens que…'),
      b('Adjust with nuance: je nuancerais mon propos.', 'Ajuster avec nuance : je nuancerais mon propos.'),
    ],
    [['l’avocat du diable', b('devil’s advocate', 'celui qui contredit exprès')], ['se passer de', b('to do without', 'vivre sans')], ['accroître', b('to increase', 'augmenter')]],
  ),
];
