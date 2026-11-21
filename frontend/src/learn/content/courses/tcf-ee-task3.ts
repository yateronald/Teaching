import type { CourseAbout } from '../../types';
import { b, card, doc, exam, gap, lesson, mc, P, pairs, sort, tip, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Task 3 is the most demanding writing task of the TCF: from two short documents presenting opposite views on a topic, you write a text of about 120 to 180 words in two parts: first, you present the two viewpoints in your own words (about 40–60 words), then you give and justify your own opinion (about 80–120 words). This course trains each part: neutral reformulation, comparison, argument and B2 connectors.',
    'La tâche 3 est la tâche écrite la plus exigeante du TCF : à partir de deux courts documents présentant des points de vue opposés sur un sujet, vous rédigez un texte d’environ 120 à 180 mots en deux parties : d’abord, vous présentez les deux points de vue avec vos propres mots (environ 40 à 60 mots), puis vous donnez et justifiez votre opinion (environ 80 à 120 mots). Ce cours entraîne chaque partie : reformulation neutre, comparaison, argumentation et connecteurs du B2.',
  ),
  outcomes: [
    b('Understand the two-part format', 'Comprendre le format en deux parties'),
    b('Summarise two opposite views neutrally', 'Résumer neutrement deux points de vue opposés'),
    b('Give and justify your opinion', 'Donner et justifier son opinion'),
    b('Use B2 connectors', 'Employer les connecteurs du B2'),
  ],
};

const C = 'tcf-ee-task3';
export default [
  lesson(C, 1, ['format-and-documents', 'format-et-documents'],
    b('The format and the documents', 'Le format et les documents'),
    b('Read two opposite documents and identify each thesis and argument.', 'Lire deux documents opposés et repérer chaque thèse et argument.'),
    [b('Know the two-part format', 'Connaître le format en deux parties'), b('Identify each thesis', 'Repérer chaque thèse'), b('Identify the key arguments', 'Repérer les arguments clés')],
    13,
    [
      exam(b('Task 3', 'Tâche 3'), b('**About 120–180 words** in **two parts**: **Part 1** (about 40–60 words): **present the two opposing viewpoints** neutrally, without copying. **Part 2** (about 80–120 words): **give your opinion** with arguments and examples. Allow about **25 minutes**. A common mistake: forgetting part 1, or copying sentences from the documents.', '**Environ 120 à 180 mots** en **deux parties** : **partie 1** (environ 40–60 mots) : **présenter les deux points de vue opposés** de façon neutre, sans recopier. **Partie 2** (environ 80–120 mots) : **donner son opinion** avec arguments et exemples. Prévoyez environ **25 minutes**. Erreur fréquente : oublier la partie 1, ou recopier des phrases des documents.')),
      doc({ look: 'article', title: b('Document 1', 'Document 1'), text: 'Pour : « Les devoirs à la maison permettent aux élèves de revoir ce qu’ils ont appris et de devenir autonomes. Sans entraînement régulier, les connaissances s’effacent vite. » — Marc, enseignant' }, b('What is Marc’s main argument?', 'Quel est l’argument principal de Marc ?'), [b('Homework consolidates learning and builds autonomy.', 'Les devoirs consolident les apprentissages et développent l’autonomie.'), b('Homework is useless.', 'Les devoirs sont inutiles.'), b('Teachers are tired.', 'Les enseignants sont fatigués.'), b('Children need more holidays.', 'Les enfants ont besoin de plus de vacances.')]),
      doc({ look: 'article', title: b('Document 2', 'Document 2'), text: 'Contre : « Les devoirs creusent les inégalités : certains enfants sont aidés par leurs parents, d’autres non. Et après une longue journée d’école, les enfants ont besoin de jouer et de se reposer. » — Sarah, mère de deux enfants' }, b('What are Sarah’s two arguments?', 'Quels sont les deux arguments de Sarah ?'), [b('inequality between families, and children’s need for rest', 'les inégalités entre familles, et le besoin de repos des enfants'), b('homework is too easy', 'les devoirs sont trop faciles'), b('teachers give no homework', 'les enseignants ne donnent pas de devoirs'), b('parents love homework', 'les parents adorent les devoirs')]),
      sort(b('For or against homework?', 'Pour ou contre les devoirs ?'), [b('for', 'pour'), b('against', 'contre')], [['consolider les connaissances', 0], ['creuser les inégalités', 1], ['développer l’autonomie', 0], ['besoin de repos', 1], ['entraînement régulier', 0], ['pas d’aide à la maison pour tous', 1]]),
      tip(b('Note, don’t copy', 'Notez, ne recopiez pas'), b('For each document, note the **thesis in 3–4 words** and **1–2 arguments** in your own words. This prepares the reformulation of part 1.', 'Pour chaque document, notez la **thèse en 3 ou 4 mots** et **1 ou 2 arguments** avec vos propres mots. Cela prépare la reformulation de la partie 1.')),
    ],
    [
      b('Two parts: present both views (~40–60 words), then your opinion (~80–120).', 'Deux parties : présenter les deux avis (~40–60 mots), puis votre opinion (~80–120).'),
      b('Identify each thesis and its arguments.', 'Repérez chaque thèse et ses arguments.'),
      b('Never copy sentences from the documents.', 'Ne recopiez jamais de phrases des documents.'),
    ],
    [['consolider', b('to consolidate', 'renforcer')], ['creuser les inégalités', b('to widen inequalities', 'augmenter les écarts')], ['s’effacer', b('to fade', 'disparaître')]],
  ),
  lesson(C, 2, ['part-1-presenting-views', 'partie-1-presenter-les-avis'],
    b('Part 1: presenting both views', 'Partie 1 : présenter les deux avis'),
    b('Summarise both documents neutrally with comparison connectors.', 'Résumer neutrement les deux documents avec des connecteurs de comparaison.'),
    [b('Reformulate the theses', 'Reformuler les thèses'), b('Use comparison connectors', 'Employer les connecteurs de comparaison'), b('Stay neutral', 'Rester neutre')],
    13,
    [
      card(b('Neutral presentation', 'Présentation neutre'), b('**La question des devoirs à la maison divise. Selon Marc, enseignant, ils permettent de… En revanche, Sarah, mère de famille, estime qu’ils… et rappelle que…** Connectors: **alors que, tandis que, en revanche, à l’inverse, d’un côté… de l’autre**. Neutral verbs: **estimer, affirmer, souligner, rappeler, considérer**. **No « je »** in this part.', '**La question des devoirs à la maison divise. Selon Marc, enseignant, ils permettent de… En revanche, Sarah, mère de famille, estime qu’ils… et rappelle que…** Connecteurs : **alors que, tandis que, en revanche, à l’inverse, d’un côté… de l’autre**. Verbes neutres : **estimer, affirmer, souligner, rappeler, considérer**. **Pas de « je »** dans cette partie.')),
      mc(P.best, ['Les devoirs à la maison divisent. Pour Marc, enseignant, ils consolident les apprentissages et rendent les élèves autonomes. À l’inverse, Sarah, mère de deux enfants, estime qu’ils aggravent les inégalités et privent les enfants d’un repos nécessaire.', 'Marc dit : « Les devoirs à la maison permettent aux élèves de revoir ce qu’ils ont appris. » Sarah dit : « Les devoirs creusent les inégalités. »', 'Je pense que Marc a raison et que Sarah se trompe.', 'Il y a deux documents sur les devoirs.'], { fr: 'Quelle partie 1 est la meilleure ?' }),
      sort(b('Good or bad for part 1?', 'Bon ou mauvais pour la partie 1 ?'), [b('good', 'bon'), b('bad', 'mauvais')], [['Selon Marc, …', 0], ['À mon avis, Marc a raison.', 1], ['En revanche, Sarah estime que…', 0], ['« Les devoirs creusent les inégalités »', 1], ['tandis que la seconde souligne…', 0], ['Je suis contre les devoirs.', 1]]),
      gap(P.complete, 'Marc ___ que les devoirs développent l’autonomie, ___ que Sarah souligne leur coût pour les familles.', [['estime', 'affirme', 'considère'], ['tandis', 'alors']]),
      pairs(P.match, [['estimer', 'penser, juger'], ['souligner', 'mettre en avant'], ['à l’inverse', 'au contraire'], ['aggraver', 'rendre plus grave']], true),
    ],
    [
      b('Present both views neutrally, without « je ».', 'Présentez les deux avis neutrement, sans « je ».'),
      b('Verbs: estimer, affirmer, souligner, rappeler.', 'Verbes : estimer, affirmer, souligner, rappeler.'),
      b('Connectors: alors que, tandis que, en revanche, à l’inverse.', 'Connecteurs : alors que, tandis que, en revanche, à l’inverse.'),
    ],
    [['diviser', b('to divide (opinion)', 'opposer')], ['priver de', b('to deprive of', 'enlever')], ['juger', b('to judge, consider', 'estimer')]],
  ),
  lesson(C, 3, ['part-2-your-opinion', 'partie-2-votre-avis'],
    b('Part 2: your opinion, and the full text', 'Partie 2 : votre avis, et le texte complet'),
    b('Give a clear, nuanced opinion with arguments and write the full task 3.', 'Donner un avis clair et nuancé avec arguments et rédiger la tâche 3 complète.'),
    [b('State a clear position', 'Énoncer une position claire'), b('Support it with arguments and examples', 'L’appuyer sur des arguments et exemples'), b('Write the full two-part text', 'Rédiger le texte complet en deux parties')],
    13,
    [
      card(b('Your opinion', 'Votre avis'), b('**Pour ma part, je pense que… · Personnellement, je partage plutôt l’avis de… · Il me semble que la meilleure solution serait de…** Arguments: **D’abord… De plus… Par exemple, dans mon pays…** Nuance: **Certes…, mais… · à condition que + subjonctif**. Conclusion: **C’est pourquoi… · En somme…**', '**Pour ma part, je pense que… · Personnellement, je partage plutôt l’avis de… · Il me semble que la meilleure solution serait de…** Arguments : **D’abord… De plus… Par exemple, dans mon pays…** Nuance : **Certes…, mais… · à condition que + subjonctif**. Conclusion : **C’est pourquoi… · En somme…**')),
      write(b('Your task 3', 'Votre tâche 3'), b('Using documents 1 and 2 (homework), write the full task 3 (120–180 words): part 1 presenting both views neutrally, part 2 with your argued opinion.', 'À partir des documents 1 et 2 (les devoirs), rédigez la tâche 3 complète (120–180 mots) : partie 1 présentant neutrement les deux avis, partie 2 avec votre opinion argumentée.'), 120, 180, [
        b('Part 1: both views, neutral, reformulated', 'Partie 1 : les deux avis, neutres, reformulés'),
        b('Part 2: clear opinion + 2 arguments + example', 'Partie 2 : avis clair + 2 arguments + exemple'),
        b('Connectors and a conclusion', 'Connecteurs et conclusion'),
      ], 'Les devoirs à la maison font débat. Pour Marc, enseignant, ils permettent de consolider les apprentissages et de rendre les élèves autonomes. À l’inverse, Sarah, mère de deux enfants, estime qu’ils aggravent les inégalités entre familles et privent les enfants d’un repos nécessaire.\n\nPour ma part, je partage en partie l’avis de Sarah. D’abord, tous les parents n’ont pas le temps ni les connaissances pour aider leurs enfants : les devoirs avantagent donc ceux qui sont déjà favorisés. De plus, après six heures de cours, un enfant a besoin de jouer et de bouger. Certes, un peu d’entraînement est utile. C’est pourquoi je propose des devoirs courts, faits à l’école pendant une étude encadrée, comme cela se fait dans certaines écoles de ma ville. En somme, l’entraînement oui, mais à l’école.'),
      sort(b('Part 1 or part 2?', 'Partie 1 ou partie 2 ?'), [b('part 1 (neutral)', 'partie 1 (neutre)'), b('part 2 (opinion)', 'partie 2 (avis)')], [['Selon Marc, …', 0], ['Pour ma part, …', 1], ['Sarah estime que…', 0], ['Je propose des devoirs courts.', 1], ['Les avis divergent.', 0], ['En somme, l’entraînement oui, mais à l’école.', 1]]),
      tip(b('Balance the two parts', 'Équilibrez les deux parties'), b('Part 1 ≈ **one third**, part 2 ≈ **two thirds**. Separate them with a **blank line**. Total **120–180 words**: count before handing in.', 'Partie 1 ≈ **un tiers**, partie 2 ≈ **deux tiers**. Séparez-les par une **ligne blanche**. Total **120–180 mots** : comptez avant de rendre.')),
    ],
    [
      b('Opinion: Pour ma part, … Personnellement, je partage l’avis de…', 'Avis : Pour ma part, … Personnellement, je partage l’avis de…'),
      b('2 arguments + example + nuance (certes…, mais…).', '2 arguments + exemple + nuance (certes…, mais…).'),
      b('Part 1 ≈ 1/3, part 2 ≈ 2/3; total 120–180 words.', 'Partie 1 ≈ 1/3, partie 2 ≈ 2/3 ; total 120–180 mots.'),
    ],
    [['favorisé', b('privileged', 'avantagé')], ['une étude encadrée', b('a supervised study period', 'temps de travail surveillé')], ['en somme', b('in short', 'en résumé')]],
  ),
];
