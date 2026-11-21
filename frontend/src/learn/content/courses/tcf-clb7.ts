import type { CourseAbout } from '../../types';
import { b, card, doc, hear, lesson, mc, P, pairs, say, sort, tip, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'For many Canadian immigration programs, the key target is NCLC 7 in each skill, which roughly corresponds to the B2 threshold. This course explains concretely what separates a B1 from a B2 performance in each test of the TCF: the type of questions you must answer in comprehension, and the features examiners look for in writing and speaking (structure, connectors, complex sentences, precise vocabulary, nuance), with before/after examples. Always check the official IRCC equivalence table for exact scores.',
    'Pour de nombreux programmes d’immigration canadiens, l’objectif clé est le NCLC 7 dans chaque compétence, ce qui correspond à peu près au seuil du B2. Ce cours explique concrètement ce qui sépare une performance B1 d’une performance B2 dans chaque épreuve du TCF : le type de questions à réussir en compréhension, et les éléments recherchés par les correcteurs à l’écrit et à l’oral (structure, connecteurs, phrases complexes, lexique précis, nuance), avec des exemples avant/après. Vérifiez toujours le tableau d’équivalence officiel d’IRCC pour les scores exacts.',
  ),
  outcomes: [
    b('Know what B2 means in each skill', 'Savoir ce que signifie B2 dans chaque compétence'),
    b('Upgrade a B1 text to B2', 'Faire passer un texte du B1 au B2'),
    b('Upgrade a B1 oral answer to B2', 'Faire passer une réponse orale du B1 au B2'),
    b('Build a study plan toward NCLC 7', 'Construire un plan de travail vers le NCLC 7'),
  ],
};

const C = 'tcf-clb7';
export default [
  lesson(C, 1, ['what-b2-means', 'ce-que-signifie-b2'],
    b('What B2 means in comprehension', 'Ce que signifie B2 en compréhension'),
    b('Understand the B2 questions you must get right in listening and reading.', 'Comprendre les questions de niveau B2 à réussir en compréhension orale et écrite.'),
    [b('Know B2 comprehension tasks', 'Connaître les tâches de compréhension B2'), b('Understand opinions and arguments', 'Comprendre opinions et arguments'), b('Spot your weak question types', 'Repérer ses types de questions faibles')],
    13,
    [
      card(b('B2 comprehension', 'Compréhension B2'), b('At B2, you must understand **the main ideas of complex texts** and **detailed arguments**: a speaker’s **opinion and attitude**, **the difference between facts and views**, **reasons and consequences**, the **purpose** of a text. In the TCF, these are roughly the **middle-to-upper questions**: you need to answer most A1–B1 questions correctly **and** a good share of B2 ones.', 'Au B2, il faut comprendre **les idées principales de textes complexes** et **le détail des arguments** : **l’opinion et l’attitude** d’un locuteur, **la différence entre faits et points de vue**, **causes et conséquences**, **l’objectif** d’un texte. Au TCF, ce sont à peu près les **questions du milieu et du haut** : il faut réussir l’essentiel des questions A1–B1 **et** une bonne part des questions B2.')),
      hear('Les chiffres sont encourageants, je ne le nie pas : le chômage baisse depuis trois trimestres. Mais attention à ne pas crier victoire trop vite : une grande partie des emplois créés sont temporaires.', b('What is the speaker’s position?', 'Quelle est la position du locuteur ?'), [b('cautiously positive: good figures, but many jobs are temporary', 'positive avec prudence : bons chiffres, mais beaucoup d’emplois temporaires'), b('totally enthusiastic', 'totalement enthousiaste'), b('very negative: unemployment is rising', 'très négative : le chômage augmente'), b('no opinion', 'sans opinion')], { voice: 'm' }),
      sort(b('B1 or B2 question?', 'Question de niveau B1 ou B2 ?'), [b('B1 (explicit information)', 'B1 (information explicite)'), b('B2 (opinion, argument, purpose)', 'B2 (opinion, argument, objectif)')], [['À quelle heure part le train ?', 0], ['Quelle est l’attitude du journaliste ?', 1], ['Où se trouve le magasin ?', 0], ['Quel argument l’auteur réfute-t-il ?', 1], ['Combien coûte l’inscription ?', 0], ['Quel est l’objectif principal du texte ?', 1]]),
      tip(b('Train the right questions', 'Entraînez les bonnes questions'), b('If you are at B1, don’t only practise easy questions: spend most of your practice time on **opinion, argument and purpose** questions (see the TCF listening and reading strategy courses).', 'Si vous êtes au B1, ne vous entraînez pas seulement sur les questions faciles : consacrez l’essentiel de votre temps aux questions d’**opinion, d’argument et d’objectif** (voir les cours de stratégies de compréhension du TCF).')),
      mc(P.choose, [b('roughly the B2 threshold in each skill', 'à peu près le seuil du B2 dans chaque compétence'), b('A2 level', 'le niveau A2'), b('C2 level', 'le niveau C2'), b('only the speaking skill', 'seulement la compétence orale')], { fr: 'Le NCLC 7 correspond…' }),
    ],
    [
      b('NCLC 7 ≈ B2 threshold in each skill (check IRCC’s table).', 'NCLC 7 ≈ seuil du B2 dans chaque compétence (vérifiez le tableau d’IRCC).'),
      b('B2 comprehension: opinions, arguments, facts vs views, purpose.', 'Compréhension B2 : opinions, arguments, faits/points de vue, objectif.'),
      b('Practise mainly the B2-type questions.', 'Entraînez-vous surtout aux questions de type B2.'),
    ],
    [['le chômage', b('unemployment', 'absence d’emploi')], ['crier victoire', b('to claim victory', 'se réjouir trop tôt')], ['temporaire', b('temporary', 'pour un temps limité')]],
  ),
  lesson(C, 2, ['b1-to-b2-writing', 'du-b1-au-b2-a-l-ecrit'],
    b('From B1 to B2 in writing', 'Du B1 au B2 à l’écrit'),
    b('Transform a B1 paragraph into a B2 paragraph.', 'Transformer un paragraphe de B1 en paragraphe de B2.'),
    [b('Use precise connectors', 'Employer des connecteurs précis'), b('Write complex sentences', 'Écrire des phrases complexes'), b('Use precise vocabulary', 'Employer un lexique précis')],
    13,
    [
      card(b('B1 → B2', 'B1 → B2'), b('**B1**: « Le télétravail est bien. On ne prend pas le métro. On a plus de temps. Mais on est seul. » **B2**: « Le télétravail présente des avantages indéniables : en supprimant les trajets quotidiens, il libère du temps pour la vie personnelle. **Néanmoins**, il peut **entraîner** un sentiment d’isolement, **surtout chez** les nouveaux salariés. » → connectors, relative/participle clauses, precise verbs (supprimer, libérer, entraîner), nuance.', '**B1** : « Le télétravail est bien. On ne prend pas le métro. On a plus de temps. Mais on est seul. » **B2** : « Le télétravail présente des avantages indéniables : en supprimant les trajets quotidiens, il libère du temps pour la vie personnelle. **Néanmoins**, il peut **entraîner** un sentiment d’isolement, **surtout chez** les nouveaux salariés. » → connecteurs, propositions relatives et gérondif, verbes précis (supprimer, libérer, entraîner), nuance.')),
      sort(b('B1 or B2 style?', 'Style B1 ou B2 ?'), [b('B1', 'B1'), b('B2', 'B2')], [['C’est bien.', 0], ['Cela présente des avantages indéniables.', 1], ['Il y a beaucoup de problèmes.', 0], ['Cela soulève plusieurs difficultés.', 1], ['Mais c’est cher.', 0], ['Néanmoins, le coût reste élevé.', 1]]),
      pairs(P.match, [['c’est bien', 'c’est bénéfique'], ['il y a des problèmes', 'cela pose des difficultés'], ['faire', 'réaliser, effectuer'], ['dire', 'affirmer, souligner']], true),
      write(b('Upgrade this paragraph', 'Améliorez ce paragraphe'), b('Rewrite at B2 level (50–80 words): « Les réseaux sociaux sont bien. On parle avec la famille. Mais il y a des fausses nouvelles. Et on passe trop de temps. »', 'Réécrivez au niveau B2 (50–80 mots) : « Les réseaux sociaux sont bien. On parle avec la famille. Mais il y a des fausses nouvelles. Et on passe trop de temps. »'), 50, 80, [
        b('Precise connectors (néanmoins, en outre…)', 'Connecteurs précis (néanmoins, en outre…)'),
        b('At least one complex sentence', 'Au moins une phrase complexe'),
        b('Precise vocabulary', 'Lexique précis'),
      ], 'Les réseaux sociaux présentent des avantages réels : ils permettent notamment de garder un lien quotidien avec des proches éloignés. Néanmoins, ils favorisent la diffusion de fausses informations, que beaucoup d’utilisateurs partagent sans les vérifier. En outre, leur conception, qui vise à capter l’attention, conduit souvent à y passer un temps excessif, au détriment du sommeil ou des activités sociales réelles.'),
      tip(b('Five B2 markers', 'Cinq marqueurs du B2'), b('Check your text for: **1. a clear structure** (paragraphs), **2. varied connectors**, **3. complex sentences** (qui, que, dont, gérondif, subjonctif), **4. precise vocabulary** (no « chose », « bien », « faire » everywhere), **5. nuance** (certes, néanmoins, dans une certaine mesure).', 'Vérifiez dans votre texte : **1. une structure claire** (paragraphes), **2. des connecteurs variés**, **3. des phrases complexes** (qui, que, dont, gérondif, subjonctif), **4. un lexique précis** (pas de « chose », « bien », « faire » partout), **5. de la nuance** (certes, néanmoins, dans une certaine mesure).')),
    ],
    [
      b('B2 = structure + varied connectors + complex sentences + precise words + nuance.', 'B2 = structure + connecteurs variés + phrases complexes + mots précis + nuance.'),
      b('Replace vague words: bien, chose, faire, dire.', 'Remplacez les mots vagues : bien, chose, faire, dire.'),
      b('Rewrite your old texts at B2 level.', 'Réécrivez vos anciens textes au niveau B2.'),
    ],
    [['indéniable', b('undeniable', 'qu’on ne peut nier')], ['au détriment de', b('at the expense of', 'en nuisant à')], ['la diffusion', b('the spread', 'propagation')]],
  ),
  lesson(C, 3, ['b1-to-b2-speaking-and-plan', 'du-b1-au-b2-a-l-oral-et-plan'],
    b('From B1 to B2 in speaking, and your study plan', 'Du B1 au B2 à l’oral, et votre plan de travail'),
    b('Upgrade your oral answers and build a realistic study plan toward NCLC 7.', 'Améliorer ses réponses orales et construire un plan de travail réaliste vers le NCLC 7.'),
    [b('Speak with structure and nuance', 'Parler avec structure et nuance'), b('Reduce hesitations', 'Réduire les hésitations'), b('Plan your preparation', 'Planifier sa préparation')],
    13,
    [
      card(b('B2 speaking', 'L’oral au B2'), b('A B2 answer is **structured** (position, arguments, examples, conclusion), **fluent** (few long pauses; fillers like « euh » replaced by **alors, en fait, disons que**), **precise** and **nuanced**, and **reacts** to the examiner’s arguments. Record yourself on task 3 questions and listen: count hesitations, repetitions and vague words.', 'Une réponse B2 est **structurée** (position, arguments, exemples, conclusion), **fluide** (peu de longues pauses ; les « euh » remplacés par **alors, en fait, disons que**), **précise** et **nuancée**, et **réagit** aux arguments de l’examinateur. Enregistrez-vous sur des questions de tâche 3 et écoutez : comptez hésitations, répétitions et mots vagues.')),
      mc(P.best, ['Disons que je suis plutôt favorable, pour deux raisons. D’abord, cela réduit la pollution en ville ; ensuite, cela encourage l’activité physique. Cela dit, il faudrait améliorer les transports pour les personnes âgées.', 'Euh… oui… c’est bien… euh… pour la pollution… voilà.', 'Je suis pour. C’est tout.', 'Je ne sais pas, peut-être, ça dépend, je ne sais pas.'], { fr: '— Êtes-vous favorable à la fermeture des centres-villes aux voitures ?' }),
      say('Disons que je suis plutôt favorable, pour deux raisons. Cela dit, il faudrait certaines conditions.', 'Let’s say I’m rather in favour, for two reasons. That said, certain conditions would be needed.'),
      doc({ look: 'page', title: b('An 8-week plan (example)', 'Un plan sur 8 semaines (exemple)'), text: 'Semaines 1–2 : test blanc + diagnostic des points faibles\nSemaines 3–4 : compréhension (questions B2 : opinion, argument, objectif) — 30 min/jour\nSemaines 5–6 : expression écrite (tâche 3) — 2 textes corrigés/semaine\nSemaines 7–8 : expression orale (tâches 2 et 3) — enregistrement quotidien + nouveau test blanc' }, b('What should you do first?', 'Que faut-il faire en premier ?'), [b('a practice test and a diagnosis of weak points', 'un test blanc et un diagnostic des points faibles'), b('only speaking practice', 'seulement de l’oral'), b('memorise model essays', 'apprendre des textes par cœur'), b('book the exam without practising', 'réserver l’examen sans s’entraîner')]),
      sort(b('Helpful or not for reaching B2?', 'Utile ou non pour atteindre le B2 ?'), [b('helpful', 'utile'), b('not helpful', 'peu utile')], [['s’enregistrer et s’écouter', 0], ['apprendre des textes par cœur', 1], ['faire corriger ses écrits', 0], ['ne travailler que les questions faciles', 1], ['faire des tests blancs chronométrés', 0], ['éviter l’oral par peur', 1]]),
    ],
    [
      b('B2 oral: structured, fluent, precise, nuanced, interactive.', 'Oral B2 : structuré, fluide, précis, nuancé, interactif.'),
      b('Replace « euh » with alors, en fait, disons que.', 'Remplacez « euh » par alors, en fait, disons que.'),
      b('Plan: diagnose → target weaknesses → timed practice tests.', 'Plan : diagnostic → points faibles → tests blancs chronométrés.'),
    ],
    [['un test blanc', b('a practice test', 'examen d’entraînement')], ['chronométré', b('timed', 'avec un chronomètre')], ['un point faible', b('a weak point', 'faiblesse')]],
  ),
];
