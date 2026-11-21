import type { CourseAbout } from '../../types';
import { b, card, doc, exam, gap, lesson, mc, P, pairs, sort, tip, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Section B of the TEF writing test asks you to react to a statement (often a quotation or a short opinion from a newspaper or a forum) by writing a letter or a contribution of at least 200 words, defending your point of view with at least three arguments. This course teaches you to analyse the statement, choose a clear position, organise three developed arguments and write a convincing, well-connected text.',
    'La section B de l’expression écrite du TEF demande de réagir à une affirmation (souvent une citation ou une courte opinion tirée d’un journal ou d’un forum) en rédigeant une lettre ou une contribution d’au moins 200 mots, qui défend votre point de vue avec au moins trois arguments. Ce cours vous apprend à analyser l’affirmation, choisir une position claire, organiser trois arguments développés et rédiger un texte convaincant et bien articulé.',
  ),
  outcomes: [
    b('Analyse the statement', 'Analyser l’affirmation'),
    b('Organise three developed arguments', 'Organiser trois arguments développés'),
    b('Write a 200-word argued text', 'Rédiger un texte argumenté de 200 mots'),
    b('Use connectors and examples', 'Employer connecteurs et exemples'),
  ],
};

const C = 'tef-ee-b';
export default [
  lesson(C, 1, ['the-statement', 'l-affirmation'],
    b('Understanding the statement', 'Comprendre l’affirmation'),
    b('Identify the claim, choose a position and find three arguments.', 'Identifier l’idée défendue, choisir une position et trouver trois arguments.'),
    [b('Know section B', 'Connaître la section B'), b('Rephrase the claim', 'Reformuler l’affirmation'), b('Brainstorm three arguments', 'Trouver trois arguments')],
    13,
    [
      exam(b('Section B', 'Section B'), b('You read a **statement** (e.g. « Les jeux vidéo rendent les jeunes violents »). You write **a letter to the newspaper or a forum post**, **at least 200 words**, in about **35 minutes**, giving **your opinion with at least three arguments**. Assessed: **clear position, number and development of arguments, coherence, vocabulary, grammar**.', 'Vous lisez une **affirmation** (par ex. « Les jeux vidéo rendent les jeunes violents »). Vous rédigez **une lettre au journal ou un message de forum**, **200 mots minimum**, en environ **35 minutes**, donnant **votre opinion avec au moins trois arguments**. Critères : **position claire, nombre et développement des arguments, cohérence, lexique, grammaire**.')),
      doc({ look: 'article', title: b('Statement', 'Affirmation'), text: '« Avec internet, les bibliothèques publiques n’ont plus aucune utilité. » — Lu sur un forum' }, b('Which position is the clearest?', 'Quelle position est la plus claire ?'), [b('I disagree: libraries remain essential, for three reasons.', 'Je ne suis pas d’accord : les bibliothèques restent indispensables, pour trois raisons.'), b('Maybe yes, maybe no.', 'Peut-être que oui, peut-être que non.'), b('Internet exists.', 'Internet existe.'), b('I like books.', 'J’aime les livres.')]),
      sort(b('Argument for libraries or not relevant?', 'Argument pour les bibliothèques ou hors sujet ?'), [b('relevant argument', 'argument pertinent'), b('off topic', 'hors sujet')], [['accès gratuit pour tous', 0], ['le prix des téléphones en 1990', 1], ['lieu calme pour étudier', 0], ['mon chat aime dormir', 1], ['ateliers et lien social', 0], ['la météo de demain', 1]]),
      tip(b('The 3-argument rule', 'La règle des 3 arguments'), b('The instruction usually asks for **at least three arguments**. Plan them before writing, from the **strongest to the weakest** or the reverse (keep a strong one for the end).', 'La consigne demande en général **au moins trois arguments**. Planifiez-les avant d’écrire, du **plus fort au plus faible** ou l’inverse (gardez un argument fort pour la fin).')),
      write(b('Your plan', 'Votre plan'), b('Write your position and three arguments with an example each (40–70 words) on: « Avec internet, les bibliothèques publiques n’ont plus aucune utilité. »', 'Rédigez votre position et trois arguments avec un exemple chacun (40–70 mots) sur : « Avec internet, les bibliothèques publiques n’ont plus aucune utilité. »'), 40, 70, [
        b('A clear position', 'Une position claire'),
        b('Three arguments', 'Trois arguments'),
        b('An example for each', 'Un exemple pour chacun'),
      ], 'Position : en désaccord. 1. Accès gratuit pour tous (ex. : familles sans ordinateur, impression de documents). 2. Lieu calme pour étudier et travailler (ex. : étudiants en période d’examens). 3. Lien social : ateliers, clubs de lecture, aide aux nouveaux arrivants (ex. : cours de conversation dans ma bibliothèque).'),
    ],
    [
      b('200 words minimum, about 35 minutes, at least 3 arguments.', '200 mots minimum, environ 35 minutes, au moins 3 arguments.'),
      b('Rephrase the claim and take a clear position.', 'Reformulez l’affirmation et prenez une position claire.'),
      b('Plan three arguments with examples before writing.', 'Planifiez trois arguments avec exemples avant d’écrire.'),
    ],
    [['une affirmation', b('a statement, a claim', 'idée affirmée')], ['indispensable', b('essential', 'nécessaire')], ['hors sujet', b('off topic', 'sans rapport')]],
  ),
  lesson(C, 2, ['developing-arguments', 'developper-les-arguments'],
    b('Developing arguments', 'Développer les arguments'),
    b('Turn each argument into a full paragraph: idea, explanation, example.', 'Transformer chaque argument en paragraphe complet : idée, explication, exemple.'),
    [b('Use the IEE structure', 'Employer la structure IEE'), b('Link paragraphs', 'Relier les paragraphes'), b('Vary connectors', 'Varier les connecteurs')],
    13,
    [
      card(b('Idea – Explanation – Example', 'Idée – Explication – Exemple'), b('Each paragraph: **Idea** (topic sentence) → **Explanation** (why / how) → **Example** (concrete). **Tout d’abord, les bibliothèques garantissent un accès gratuit au savoir. En effet, tout le monde n’a pas d’ordinateur ni de connexion fiable. Par exemple, dans mon quartier, de nombreuses familles y impriment leurs documents administratifs.**', 'Chaque paragraphe : **Idée** (phrase d’annonce) → **Explication** (pourquoi / comment) → **Exemple** (concret). **Tout d’abord, les bibliothèques garantissent un accès gratuit au savoir. En effet, tout le monde n’a pas d’ordinateur ni de connexion fiable. Par exemple, dans mon quartier, de nombreuses familles y impriment leurs documents administratifs.**')),
      sort(b('Idea, explanation or example?', 'Idée, explication ou exemple ?'), [b('idea', 'idée'), b('explanation', 'explication'), b('example', 'exemple')], [['Ensuite, la bibliothèque est un lieu de travail précieux.', 0], ['En effet, beaucoup d’étudiants vivent dans des logements bruyants.', 1], ['Ainsi, ma cousine y a préparé tous ses examens.', 2], ['Enfin, elle crée du lien social.', 0], ['Car on y rencontre des gens de tous âges.', 1], ['Par exemple, un club de lecture réunit chaque mois trente personnes.', 2]]),
      gap(P.complete, 'Tout ___ , l’accès est gratuit. En ___ , tout le monde n’a pas internet. Par ___ , ma voisine y imprime ses factures.', ['d’abord', 'effet', 'exemple']),
      mc(P.best, ['Enfin, et c’est peut-être l’essentiel, les bibliothèques créent du lien social : on y propose des ateliers, des clubs de lecture et même des cours de conversation pour les nouveaux arrivants.', 'Enfin, bibliothèque, lien.', 'Les bibliothèques sont bien aussi pour autre chose.', 'Et c’est tout.'], { fr: 'Quel paragraphe d’argument est le mieux développé ?' }),
      pairs(P.match, [['en effet', b('indeed (explains)', 'introduit une explication')], ['ainsi', b('thus, for instance', 'introduit une conséquence ou un exemple')], ['de surcroît', b('moreover', 'de plus')], ['c’est pourquoi', b('that’s why', 'conséquence')]]),
    ],
    [
      b('Each paragraph: idea → explanation → example.', 'Chaque paragraphe : idée → explication → exemple.'),
      b('Explain with en effet, car; illustrate with par exemple, ainsi.', 'Expliquez avec en effet, car ; illustrez avec par exemple, ainsi.'),
      b('Order: tout d’abord, ensuite, enfin.', 'Ordre : tout d’abord, ensuite, enfin.'),
    ],
    [['garantir', b('to guarantee', 'assurer')], ['précieux', b('valuable', 'de grande valeur')], ['fiable', b('reliable', 'sûr')]],
  ),
  lesson(C, 3, ['writing-section-b', 'rediger-la-section-b'],
    b('Writing section B', 'Rédiger la section B'),
    b('Write a complete 200-word letter to the newspaper.', 'Rédiger une lettre complète de 200 mots au journal.'),
    [b('Write the introduction and conclusion', 'Rédiger introduction et conclusion'), b('Write three developed paragraphs', 'Rédiger trois paragraphes développés'), b('Check length and coherence', 'Vérifier longueur et cohérence')],
    13,
    [
      write(b('Your letter', 'Votre lettre'), b('Write a letter to the newspaper (200–260 words) reacting to: « Avec internet, les bibliothèques publiques n’ont plus aucune utilité. » Give your position and three developed arguments.', 'Rédigez une lettre au journal (200–260 mots) en réaction à : « Avec internet, les bibliothèques publiques n’ont plus aucune utilité. » Donnez votre position et trois arguments développés.'), 200, 260, [
        b('Introduction with a clear position', 'Introduction avec une position claire'),
        b('Three developed arguments (idea, explanation, example)', 'Trois arguments développés (idée, explication, exemple)'),
        b('Conclusion', 'Conclusion'),
      ], 'Madame, Monsieur,\n\nJ’ai lu avec étonnement l’affirmation selon laquelle les bibliothèques publiques n’auraient plus aucune utilité à l’ère d’internet. Je ne partage absolument pas cet avis, et je souhaiterais expliquer pourquoi.\n\nTout d’abord, les bibliothèques garantissent un accès gratuit au savoir. En effet, tout le monde ne dispose pas d’un ordinateur ou d’une connexion fiable. Dans mon quartier, par exemple, de nombreuses familles viennent y imprimer leurs documents administratifs ou y faire leurs recherches d’emploi.\n\nEnsuite, la bibliothèque reste un lieu de travail précieux. Beaucoup d’étudiants vivent dans des logements petits ou bruyants ; ils trouvent là le calme nécessaire pour se concentrer. Ma cousine y a d’ailleurs préparé tous ses examens.\n\nEnfin, et c’est peut-être l’essentiel, les bibliothèques créent du lien social. Clubs de lecture, ateliers pour enfants, cours de conversation pour les nouveaux arrivants : elles sont devenues de véritables lieux de vie, ouverts à tous.\n\nC’est pourquoi, loin d’être dépassées, les bibliothèques me semblent plus utiles que jamais. Plutôt que de les fermer, il faudrait au contraire les soutenir davantage. Pourquoi ne pas allonger leurs horaires d’ouverture le soir et le week-end, pour permettre aux travailleurs d’en profiter eux aussi ?\n\nVeuillez agréer, Madame, Monsieur, mes salutations distinguées.\n\nNadia Benali'),
      tip(b('Final checklist', 'Liste finale'), b('**200+ words? Clear position in the introduction? Three arguments, each with an example? Connectors? Conclusion? Letter formulas (if a letter)?** Then grammar: agreements, verb endings, accents.', '**200 mots ou plus ? Position claire dans l’introduction ? Trois arguments, chacun avec un exemple ? Connecteurs ? Conclusion ? Formules de lettre (si c’est une lettre) ?** Puis la grammaire : accords, terminaisons verbales, accents.')),
      mc(P.best, ['C’est pourquoi, loin d’être dépassées, les bibliothèques me semblent plus utiles que jamais.', 'Voilà mes trois arguments.', 'Les bibliothèques, voilà.', 'Je n’ai plus rien à dire, merci.'], { fr: 'Quelle phrase de conclusion est la meilleure ?' }),
    ],
    [
      b('Introduction: react to the statement + position.', 'Introduction : réagir à l’affirmation + position.'),
      b('Three IEE paragraphs + conclusion.', 'Trois paragraphes IEE + conclusion.'),
      b('Check 200+ words and formulas.', 'Vérifiez 200 mots minimum et les formules.'),
    ],
    [['l’étonnement', b('astonishment', 'surprise')], ['dépassé', b('outdated', 'démodé')], ['à l’ère de', b('in the age of', 'à l’époque de')]],
  ),
];
