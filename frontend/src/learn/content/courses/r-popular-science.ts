import type { CourseAbout, Doc } from '../../types';
import { b, card, dict, doc, gap, lesson, mc, P, pairs, sort, tip } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Sleep, the brain, climate, artificial intelligence: popular-science articles explain complex topics with definitions, comparisons, figures and cautious conclusions. This course trains you on three original articles to understand how scientists’ findings are reported (une étude montre, les chercheurs suggèrent), to distinguish a correlation from a cause, and to master the vocabulary of health, environment and technology.',
    'Sommeil, cerveau, climat, intelligence artificielle : les articles de vulgarisation expliquent des sujets complexes avec des définitions, des comparaisons, des chiffres et des conclusions prudentes. Ce cours vous entraîne sur trois articles originaux pour comprendre comment on rapporte les résultats des chercheurs (une étude montre, les chercheurs suggèrent), distinguer une corrélation d’une cause, et maîtriser le vocabulaire de la santé, de l’environnement et de la technologie.',
  ),
  outcomes: [
    b('Understand definitions and explanations', 'Comprendre définitions et explications'),
    b('Recognise cautious scientific language', 'Reconnaître le langage prudent de la science'),
    b('Distinguish correlation and causation', 'Distinguer corrélation et causalité'),
    b('Use the vocabulary of health, environment and technology', 'Employer le vocabulaire de la santé, de l’environnement et des technologies'),
  ],
};

const SLEEP: Doc = { look: 'article', title: b('Health', 'Santé'), text: 'Pourquoi dormons-nous ?\n\nLongtemps considéré comme une simple pause, le sommeil est en réalité une période d’intense activité cérébrale. Pendant la nuit, le cerveau trie les informations de la journée et consolide les souvenirs utiles. Il évacue aussi certains déchets produits par les neurones, un peu comme une équipe de nettoyage qui travaillerait après la fermeture d’un bureau. Selon plusieurs études, dormir moins de six heures par nuit de façon régulière augmenterait le risque de maladies cardiovasculaires.' };
const CLIMATE: Doc = { look: 'article', title: b('Environment', 'Environnement'), text: 'Les villes face à la chaleur\n\nEn ville, la température peut dépasser de 5 à 10 degrés celle de la campagne environnante : c’est l’effet d’îlot de chaleur urbain. L’asphalte et le béton absorbent la chaleur le jour et la restituent la nuit. Pour lutter contre ce phénomène, les urbanistes misent sur la végétalisation : arbres, toits verts, parcs. Une étude menée dans cinq villes canadiennes montre que les quartiers les plus arborés sont nettement plus frais. Les chercheurs rappellent toutefois qu’un arbre met des années à produire tout son effet.' };
const AI: Doc = { look: 'article', title: b('Technology', 'Technologie'), text: 'Écrans et sommeil : un lien à nuancer\n\nUne vaste enquête auprès de 10 000 adolescents révèle que ceux qui utilisent leur téléphone au lit dorment en moyenne quarante minutes de moins. Faut-il en conclure que les écrans causent l’insomnie ? Pas si vite, préviennent les auteurs. Il s’agit d’une corrélation : il est possible que les jeunes qui dorment mal prennent leur téléphone parce qu’ils n’arrivent pas à dormir. D’autres études, menées sur une plus longue durée, seront nécessaires pour établir un lien de cause à effet.' };

const C = 'r-popular-science';
export default [
  lesson(C, 1, ['explaining-a-phenomenon', 'expliquer-un-phenomene'],
    b('Explaining a phenomenon: sleep', 'Expliquer un phénomène : le sommeil'),
    b('Understand how an article defines, explains and compares.', 'Comprendre comment un article définit, explique et compare.'),
    [b('Recognise a definition', 'Reconnaître une définition'), b('Understand an explanatory comparison', 'Comprendre une comparaison explicative'), b('Understand a risk stated cautiously', 'Comprendre un risque énoncé avec prudence')],
    13,
    [
      card(b('Tools of popular science', 'Les outils de la vulgarisation'), b('**Definition**: c’est…, on appelle… **Correction of a belief**: longtemps considéré comme…, en réalité… **Comparison**: comme, un peu comme si… **Figures and sources**: selon une étude, d’après les chercheurs.', '**Définition** : c’est…, on appelle… **Correction d’une idée reçue** : longtemps considéré comme…, en réalité… **Comparaison** : comme, un peu comme si… **Chiffres et sources** : selon une étude, d’après les chercheurs.')),
      doc(SLEEP, b('What old belief does the article correct?', 'Quelle idée reçue l’article corrige-t-il ?'), [b('That sleep is just a pause', 'Que le sommeil n’est qu’une simple pause'), b('That the brain never sleeps', 'Que le cerveau ne dort jamais'), b('That six hours is enough', 'Que six heures suffisent'), b('That neurons produce no waste', 'Que les neurones ne produisent aucun déchet')]),
      doc(SLEEP, b('What is the cleaning team compared to?', 'À quoi l’équipe de nettoyage est-elle comparée ?'), [b('The brain removing waste at night', 'Le cerveau qui évacue des déchets la nuit'), b('Doctors in a hospital', 'Des médecins à l’hôpital'), b('Memories', 'Les souvenirs'), b('An office opening', 'L’ouverture d’un bureau')]),
      doc(SLEEP, b('Why is the last sentence in the conditional?', 'Pourquoi la dernière phrase est-elle au conditionnel ?'), [b('The risk is reported from studies, with caution.', 'Le risque est rapporté d’après des études, avec prudence.'), b('It is a polite request.', 'C’est une demande polie.'), b('It is impossible.', 'C’est impossible.'), b('It is in the future.', 'C’est au futur.')]),
      pairs(P.match, [['le cerveau', b('the brain', 'organe de la pensée')], ['consolider', b('to strengthen', 'renforcer')], ['un souvenir', b('a memory', 'ce dont on se souvient')], ['cardiovasculaire', b('cardiovascular', 'du cœur et des vaisseaux')]]),
      gap(P.complete, 'Longtemps ___ comme une pause, le sommeil est en ___ une période d’activité intense.', ['considéré', 'réalité']),
      dict('Pendant la nuit, le cerveau trie les informations de la journée.', { voice: 'f' }),
    ],
    [
      b('Definition: c’est, on appelle. Belief corrected: longtemps considéré… en réalité.', 'Définition : c’est, on appelle. Idée reçue corrigée : longtemps considéré… en réalité.'),
      b('Comparison: comme, un peu comme si.', 'Comparaison : comme, un peu comme si.'),
      b('Caution: the conditional (augmenterait).', 'Prudence : le conditionnel (augmenterait).'),
    ],
    [['trier', b('to sort', 'classer')], ['évacuer', b('to remove, to clear out', 'faire sortir')], ['un neurone', b('a neuron', 'cellule nerveuse')]],
  ),
  lesson(C, 2, ['causes-and-solutions', 'causes-et-solutions'],
    b('Causes and solutions: urban heat', 'Causes et solutions : la chaleur en ville'),
    b('Follow a cause–effect–solution structure in an environment article.', 'Suivre une structure cause–effet–solution dans un article sur l’environnement.'),
    [b('Find the cause of a phenomenon', 'Trouver la cause d’un phénomène'), b('Understand the proposed solution', 'Comprendre la solution proposée'), b('Understand a limit (toutefois)', 'Comprendre une limite (toutefois)')],
    13,
    [
      tip(b('Look for the logic words', 'Cherchez les mots logiques'), b('**c’est-à-dire / c’est** (definition), **absorbent… et restituent** (mechanism), **pour lutter contre** (solution), **une étude montre** (evidence), **toutefois** (limit).', '**c’est-à-dire / c’est** (définition), **absorbent… et restituent** (mécanisme), **pour lutter contre** (solution), **une étude montre** (preuve), **toutefois** (limite).')),
      doc(CLIMATE, b('What is an urban heat island?', 'Qu’est-ce qu’un îlot de chaleur urbain ?'), [b('A city much hotter than the surrounding countryside', 'Une ville bien plus chaude que la campagne environnante'), b('A hot island in the sea', 'Une île chaude en mer'), b('A heated building', 'Un bâtiment chauffé'), b('A park in summer', 'Un parc en été')]),
      doc(CLIMATE, b('Why are cities hotter at night?', 'Pourquoi les villes sont-elles plus chaudes la nuit ?'), [b('Asphalt and concrete release the heat stored during the day.', 'L’asphalte et le béton restituent la chaleur accumulée le jour.'), b('There are more cars at night.', 'Il y a plus de voitures la nuit.'), b('Trees produce heat.', 'Les arbres produisent de la chaleur.'), b('People heat their homes.', 'Les gens chauffent leur logement.')]),
      doc(CLIMATE, b('What limit do the researchers point out?', 'Quelle limite les chercheurs rappellent-ils ?'), [b('A tree takes years to have its full effect.', 'Un arbre met des années à produire tout son effet.'), b('Trees are too expensive.', 'Les arbres coûtent trop cher.'), b('Green roofs do not work.', 'Les toits verts ne fonctionnent pas.'), b('The study is false.', 'L’étude est fausse.')]),
      sort(b('Cause, effect or solution?', 'Cause, effet ou solution ?'), [b('cause', 'cause'), b('effect', 'effet'), b('solution', 'solution')], [['le béton absorbe la chaleur', 0], ['+5 à 10 degrés en ville', 1], ['planter des arbres', 2], ['l’asphalte', 0], ['des nuits très chaudes', 1], ['les toits verts', 2]]),
      pairs(P.match, [['la végétalisation', b('greening', 'ajout de végétation')], ['un urbaniste', b('a town planner', 'spécialiste de la ville')], ['restituer', b('to give back, to release', 'rendre')], ['arboré', b('tree-lined, wooded', 'planté d’arbres')]]),
      gap(P.complete, 'Pour ___ contre la chaleur, les villes misent sur la ___ : arbres, parcs et toits verts.', ['lutter', 'végétalisation']),
    ],
    [
      b('Structure: phenomenon → cause → solution → limit.', 'Structure : phénomène → cause → solution → limite.'),
      b('Mechanism verbs: absorber, restituer, produire.', 'Verbes du mécanisme : absorber, restituer, produire.'),
      b('Limit: toutefois, cependant, reste à…', 'Limite : toutefois, cependant, reste à…'),
    ],
    [['le béton', b('concrete', 'matériau de construction')], ['miser sur', b('to bet on, to rely on', 'compter sur')], ['environnant', b('surrounding', 'qui entoure')]],
  ),
  lesson(C, 3, ['correlation-or-cause', 'correlation-ou-cause'],
    b('Correlation or cause? Screens and sleep', 'Corrélation ou cause ? Écrans et sommeil'),
    b('Understand why scientists are careful before concluding.', 'Comprendre pourquoi les scientifiques sont prudents avant de conclure.'),
    [b('Distinguish correlation and causation', 'Distinguer corrélation et causalité'), b('Recognise cautious verbs', 'Reconnaître les verbes prudents'), b('Evaluate a conclusion', 'Évaluer une conclusion')],
    13,
    [
      card(b('Correlation ≠ cause', 'Corrélation ≠ cause'), b('A **corrélation** = two things go together. A **lien de cause à effet** = one produces the other. Cautious verbs: **suggérer, laisser penser, être associé à, il est possible que**. Strong verbs: **démontrer, prouver, établir**.', 'Une **corrélation** = deux phénomènes vont ensemble. Un **lien de cause à effet** = l’un produit l’autre. Verbes prudents : **suggérer, laisser penser, être associé à, il est possible que**. Verbes forts : **démontrer, prouver, établir**.')),
      doc(AI, b('What did the survey find?', 'Qu’a révélé l’enquête ?'), [b('Teenagers using phones in bed sleep about 40 minutes less.', 'Les ados qui utilisent leur téléphone au lit dorment environ 40 minutes de moins.'), b('Phones cause insomnia.', 'Les téléphones causent l’insomnie.'), b('Teenagers sleep too much.', 'Les ados dorment trop.'), b('10,000 teenagers have no phone.', '10 000 ados n’ont pas de téléphone.')]),
      doc(AI, b('Why do the authors say « Pas si vite »?', 'Pourquoi les auteurs disent-ils « Pas si vite » ?'), [b('A correlation does not prove a cause.', 'Une corrélation ne prouve pas une cause.'), b('The survey was too small.', 'L’enquête était trop petite.'), b('Phones are harmless.', 'Les téléphones sont inoffensifs.'), b('Teenagers lied.', 'Les ados ont menti.')]),
      doc(AI, b('What alternative explanation is suggested?', 'Quelle autre explication est proposée ?'), [b('Teens who sleep badly may pick up their phone because they cannot sleep.', 'Les ados qui dorment mal prennent peut-être leur téléphone parce qu’ils n’arrivent pas à dormir.'), b('Phones make teens sleep better.', 'Les téléphones font mieux dormir.'), b('Parents take the phones.', 'Les parents confisquent les téléphones.'), b('Screens are too bright.', 'Les écrans sont trop lumineux.')]),
      sort(b('Cautious or strong claim?', 'Affirmation prudente ou forte ?'), [b('cautious', 'prudente'), b('strong', 'forte')], [['L’étude suggère que…', 0], ['L’étude démontre que…', 1], ['Ce facteur serait associé à…', 0], ['Les résultats prouvent que…', 1], ['Il est possible que…', 0], ['Les chercheurs ont établi que…', 1]]),
      pairs(P.match, [['une enquête', b('a survey', 'étude par questionnaire')], ['l’insomnie', b('insomnia', 'difficulté à dormir')], ['un lien de cause à effet', b('a causal link', 'relation de causalité')], ['nuancer', b('to qualify, to nuance', 'rendre moins absolu')]]),
      mc(P.best, ['Cette étude suggère un lien, mais ne prouve pas que les écrans causent l’insomnie.', 'Cette étude prouve que les écrans causent l’insomnie.', 'Les écrans n’ont aucun effet sur le sommeil.', 'Les adolescents dorment trop.'], { fr: 'Quelle conclusion est la plus juste ?' }),
    ],
    [
      b('Correlation = go together; cause = one produces the other.', 'Corrélation = vont ensemble ; cause = l’un produit l’autre.'),
      b('Cautious: suggérer, être associé à, il est possible que, conditional.', 'Prudent : suggérer, être associé à, il est possible que, conditionnel.'),
      b('Strong: démontrer, prouver, établir.', 'Fort : démontrer, prouver, établir.'),
    ],
    [['un adolescent', b('a teenager', 'jeune de 12 à 18 ans')], ['en moyenne', b('on average', 'en général')], ['établir', b('to establish', 'prouver')]],
  ),
];
