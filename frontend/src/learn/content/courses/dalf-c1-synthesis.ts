import type { CourseAbout } from '../../types';
import { b, card, doc, exam, lesson, mc, P, pairs, sort, tip, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'The synthesis is the first part of the DALF C1 written test: from two or three documents (about 1,000 words in total), you write a single, neutral, structured text of about 220 words, with a title, without adding your opinion or copying sentences. This course teaches the method step by step: reading for ideas, building a comparison grid, finding a problématique, organising a thematic plan and reformulating with precision.',
    'La synthèse est la première partie de l’épreuve écrite du DALF C1 : à partir de deux ou trois documents (environ 1 000 mots au total), vous rédigez un texte unique, neutre et structuré d’environ 220 mots, avec un titre, sans ajouter votre opinion ni recopier de phrases. Ce cours enseigne la méthode pas à pas : lire pour dégager les idées, construire un tableau de confrontation, trouver une problématique, organiser un plan thématique et reformuler avec précision.',
  ),
  outcomes: [
    b('Know the rules of the synthesis', 'Connaître les règles de la synthèse'),
    b('Build a comparison grid', 'Construire un tableau de confrontation'),
    b('Organise a thematic plan', 'Organiser un plan thématique'),
    b('Reformulate without copying', 'Reformuler sans recopier'),
  ],
};

const C = 'dalf-c1-synthesis';
export default [
  lesson(C, 1, ['rules-and-reading', 'regles-et-lecture'],
    b('The rules and the reading phase', 'Les règles et la phase de lecture'),
    b('Know what is forbidden and read the documents to extract the ideas.', 'Savoir ce qui est interdit et lire les documents pour en extraire les idées.'),
    [b('Know the rules', 'Connaître les règles'), b('Extract the main ideas', 'Extraire les idées principales'), b('Spot convergences and divergences', 'Repérer convergences et divergences')],
    13,
    [
      exam(b('The synthesis', 'La synthèse'), b('About **220 words** (a margin of ±10 % is usually tolerated), from **2–3 documents**. Rules: **a title**; **no personal opinion**; **no quotations or copied sentences**; **no information outside the documents**; **don’t summarise documents one after another**: combine them by theme. Part of a 2 h 30 writing test with the argumentative essay.', 'Environ **220 mots** (une marge d’environ 10 % est généralement tolérée), à partir de **2 ou 3 documents**. Règles : **un titre** ; **pas d’opinion personnelle** ; **pas de citations ni de phrases recopiées** ; **aucune information extérieure** ; **ne pas résumer les documents l’un après l’autre** : il faut les croiser par thème. Partie d’une épreuve écrite de 2 h 30 avec l’essai argumenté.')),
      sort(b('Allowed or forbidden in a synthesis?', 'Permis ou interdit dans une synthèse ?'), [b('allowed', 'permis'), b('forbidden', 'interdit')], [['un titre', 0], ['« À mon avis… »', 1], ['reformuler les idées des documents', 0], ['recopier une phrase du texte', 1], ['comparer les points de vue', 0], ['ajouter un exemple personnel', 1]]),
      doc({ look: 'article', title: b('Document 1 (extract)', 'Document 1 (extrait)'), text: 'Le télétravail a profondément modifié notre rapport au temps. Les salariés gagnent en moyenne une heure par jour de transport, temps qu’ils consacrent à leur famille ou au sport. Les entreprises, de leur côté, constatent une hausse de la productivité.' }, b('What is the main idea of document 1?', 'Quelle est l’idée principale du document 1 ?'), [b('Remote work saves time and increases productivity.', 'Le télétravail fait gagner du temps et augmente la productivité.'), b('Remote work isolates employees.', 'Le télétravail isole les salariés.'), b('Transport is becoming cheaper.', 'Les transports deviennent moins chers.'), b('Companies refuse remote work.', 'Les entreprises refusent le télétravail.')]),
      doc({ look: 'article', title: b('Document 2 (extract)', 'Document 2 (extrait)'), text: 'Derrière l’enthousiasme, un malaise grandit. Privés des échanges informels de la machine à café, de nombreux télétravailleurs disent se sentir seuls. Les plus jeunes, surtout, regrettent de ne pas apprendre au contact de collègues expérimentés.' }, b('How does document 2 relate to document 1?', 'Quel est le rapport entre le document 2 et le document 1 ?'), [b('It presents a limit: isolation and less learning.', 'Il présente une limite : isolement et moins d’apprentissage.'), b('It says exactly the same thing.', 'Il dit exactement la même chose.'), b('It talks about a different topic.', 'Il parle d’un autre sujet.'), b('It gives productivity figures.', 'Il donne des chiffres de productivité.')]),
      tip(b('Read with a pen', 'Lisez avec un crayon'), b('For each document, note **the theme, the thesis, the main arguments** in a few key words. Then look for **convergences** (they agree) and **divergences** (they disagree or add a nuance).', 'Pour chaque document, notez **le thème, la thèse, les principaux arguments** en quelques mots clés. Cherchez ensuite les **convergences** (accord) et les **divergences** (désaccord ou nuance).')),
    ],
    [
      b('About 220 words, a title, no opinion, no quotations, no outside information.', 'Environ 220 mots, un titre, pas d’opinion, pas de citations, aucune information extérieure.'),
      b('Combine documents by theme, never one after another.', 'Croisez les documents par thème, jamais l’un après l’autre.'),
      b('Note theme, thesis, arguments; find convergences and divergences.', 'Notez thème, thèse, arguments ; repérez convergences et divergences.'),
    ],
    [['la productivité', b('productivity', 'efficacité au travail')], ['un malaise', b('a malaise, unease', 'sentiment de gêne')], ['informel', b('informal', 'sans cadre officiel')]],
  ),
  lesson(C, 2, ['grid-and-plan', 'tableau-et-plan'],
    b('The comparison grid and the plan', 'Le tableau de confrontation et le plan'),
    b('Organise ideas by theme in a grid and build a two-part plan.', 'Organiser les idées par thème dans un tableau et construire un plan en deux parties.'),
    [b('Build a comparison grid', 'Construire un tableau de confrontation'), b('Formulate a problématique', 'Formuler une problématique'), b('Choose a thematic plan', 'Choisir un plan thématique')],
    13,
    [
      card(b('The grid', 'Le tableau'), b('Rows = **themes** (gain de temps, productivité, isolement, apprentissage…); columns = **documents**. Fill each cell with key words. Then: **problématique** (the question the documents answer together): **Le télétravail améliore-t-il vraiment la vie professionnelle ?** Plan (often 2 parts): **I. Des avantages réels** / **II. Des limites humaines**, or **I. Constat / II. Enjeux et solutions**.', 'Lignes = **thèmes** (gain de temps, productivité, isolement, apprentissage…) ; colonnes = **documents**. Remplissez chaque case par des mots clés. Puis : **problématique** (la question à laquelle les documents répondent ensemble) : **Le télétravail améliore-t-il vraiment la vie professionnelle ?** Plan (souvent en 2 parties) : **I. Des avantages réels** / **II. Des limites humaines**, ou **I. Constat / II. Enjeux et solutions**.')),
      doc({ look: 'page', title: b('Comparison grid', 'Tableau de confrontation'), text: 'Thème | Document 1 | Document 2\nTemps | + 1 h / jour, famille, sport | —\nTravail | productivité en hausse | —\nLien social | — | solitude, fin des échanges informels\nApprentissage | — | jeunes moins formés' }, b('Which plan follows the grid best?', 'Quel plan suit le mieux le tableau ?'), [b('I. Benefits (time, productivity) / II. Human limits (isolation, learning)', 'I. Bénéfices (temps, productivité) / II. Limites humaines (isolement, apprentissage)'), b('I. Document 1 / II. Document 2', 'I. Document 1 / II. Document 2'), b('I. My opinion / II. Examples from my life', 'I. Mon opinion / II. Exemples de ma vie'), b('I. History of work / II. Future of transport', 'I. Histoire du travail / II. Avenir des transports')]),
      sort(b('Good or bad plan for a synthesis?', 'Bon ou mauvais plan de synthèse ?'), [b('good (thematic)', 'bon (thématique)'), b('bad', 'mauvais')], [['I. Avantages / II. Limites', 0], ['I. Document 1 / II. Document 2 / III. Document 3', 1], ['I. Constat / II. Solutions', 0], ['I. Ce que je pense / II. Ce que les autres pensent', 1], ['I. Causes / II. Conséquences', 0], ['I. Résumé du texte le plus long', 1]]),
      mc(P.best, ['Le télétravail constitue-t-il un progrès pour tous les salariés ?', 'Je pense que le télétravail est bien.', 'Combien de salariés télétravaillent ?', 'Le document 1 parle du temps.'], { fr: 'Quelle problématique convient aux deux documents ?' }),
      write(b('Your grid', 'Votre tableau'), b('Using documents 1 and 2, write your problématique and your two-part plan with key ideas (40–70 words).', 'À partir des documents 1 et 2, rédigez votre problématique et votre plan en deux parties avec les idées clés (40–70 mots).'), 40, 70, [
        b('A problématique (question)', 'Une problématique (question)'),
        b('Two thematic parts', 'Deux parties thématiques'),
        b('Key ideas from both documents in each part', 'Des idées des deux documents dans chaque partie'),
      ], 'Problématique : le télétravail améliore-t-il réellement la vie professionnelle ? I. Des bénéfices concrets : gain de temps quotidien, meilleur équilibre personnel, productivité accrue (doc. 1). II. Un coût humain : isolement, disparition des échanges informels, apprentissage plus difficile pour les jeunes salariés (doc. 2).'),
    ],
    [
      b('Grid: themes × documents.', 'Tableau : thèmes × documents.'),
      b('Problématique: the shared question.', 'Problématique : la question commune.'),
      b('Thematic plan in 2 parts, never document by document.', 'Plan thématique en 2 parties, jamais document par document.'),
    ],
    [['la confrontation', b('comparison (of documents)', 'mise en regard')], ['un enjeu', b('a stake, an issue', 'ce qui est en jeu')], ['accru', b('increased', 'augmenté')]],
  ),
  lesson(C, 3, ['writing-and-reformulating', 'rediger-et-reformuler'],
    b('Writing and reformulating', 'Rédiger et reformuler'),
    b('Write a neutral 220-word synthesis, reformulating and attributing ideas.', 'Rédiger une synthèse neutre de 220 mots, en reformulant et en attribuant les idées.'),
    [b('Reformulate ideas', 'Reformuler les idées'), b('Attribute ideas neutrally', 'Attribuer les idées de façon neutre'), b('Write the full synthesis', 'Rédiger la synthèse complète')],
    13,
    [
      card(b('Neutral attribution and reformulation', 'Attribution neutre et reformulation'), b('Attribute without quoting: **Selon le premier document… · Les deux auteurs s’accordent sur… · En revanche, le second texte souligne… · Si certains insistent sur…, d’autres mettent en garde contre…** Reformulate: **« les salariés gagnent une heure de transport »** → **le temps de trajet économisé**. Neutral verbs: **souligner, constater, relever, mettre en évidence, nuancer**.', 'Attribuer sans citer : **Selon le premier document… · Les deux auteurs s’accordent sur… · En revanche, le second texte souligne… · Si certains insistent sur…, d’autres mettent en garde contre…** Reformuler : **« les salariés gagnent une heure de transport »** → **le temps de trajet économisé**. Verbes neutres : **souligner, constater, relever, mettre en évidence, nuancer**.')),
      pairs(P.match, [['les salariés se sentent seuls', 'l’isolement des salariés'], ['la productivité augmente', 'la hausse de la productivité'], ['ils gagnent une heure', 'le temps de trajet économisé'], ['les jeunes apprennent moins', 'la formation des jeunes est fragilisée']], true),
      mc(P.best, ['Si le premier document met en évidence les gains de temps et de productivité, le second souligne le risque d’isolement.', 'Je trouve que le premier document a raison.', '« Les salariés gagnent en moyenne une heure par jour. »', 'Le document 1 dit une chose, puis le document 2 dit autre chose.'], { fr: 'Quelle phrase convient à une synthèse ?' }),
      write(b('Your synthesis', 'Votre synthèse'), b('Write the synthesis of documents 1 and 2 (about 200–240 words), with a title, an introduction with the problématique, two parts and a short conclusion. No opinion, no quotation.', 'Rédigez la synthèse des documents 1 et 2 (environ 200–240 mots), avec un titre, une introduction avec la problématique, deux parties et une courte conclusion. Ni opinion ni citation.'), 180, 250, [
        b('Title and problématique', 'Titre et problématique'),
        b('Two thematic parts combining the documents', 'Deux parties thématiques qui croisent les documents'),
        b('Neutral tone, no quotation', 'Ton neutre, aucune citation'),
      ], 'Le télétravail, entre liberté et solitude\n\nDepuis sa généralisation, le télétravail transforme l’organisation du travail. Les documents proposés s’interrogent sur ses effets réels : constitue-t-il un progrès pour les salariés ?\n\nLe premier document met d’abord en évidence des bénéfices concrets. Le temps de trajet économisé, estimé à une heure par jour, permettrait aux salariés de mieux concilier vie professionnelle et vie personnelle, notamment en consacrant davantage de temps à leur famille ou à des activités physiques. Les employeurs, de leur côté, constateraient une amélioration de la productivité, ce qui expliquerait l’engouement pour ce mode d’organisation.\n\nLe second document nuance cependant ce constat en soulignant le coût humain du télétravail. La disparition des échanges informels entre collègues favoriserait un sentiment d’isolement chez de nombreux salariés. Les plus jeunes en seraient les premières victimes : privés du contact quotidien avec des professionnels expérimentés, ils apprendraient moins vite leur métier.\n\nAinsi, si le télétravail apporte des avantages indéniables en termes de temps et d’efficacité, il fragilise le lien social et la transmission des savoirs au sein de l’entreprise. Son succès durable semble donc dépendre de la capacité des organisations à préserver des moments de rencontre.'),
      tip(b('Count and check neutrality', 'Comptez et vérifiez la neutralité'), b('Check: **title? problématique? two parts? no « je »? no quotation? no outside example?** Count your words and write the total at the end, as requested in the exam.', 'Vérifiez : **titre ? problématique ? deux parties ? pas de « je » ? pas de citation ? pas d’exemple extérieur ?** Comptez vos mots et indiquez le total à la fin, comme demandé à l’examen.')),
    ],
    [
      b('Attribute neutrally: selon le premier document, les deux auteurs s’accordent…', 'Attribuer neutrement : selon le premier document, les deux auteurs s’accordent…'),
      b('Reformulate with nouns and synonyms; no quotation.', 'Reformulez avec des noms et des synonymes ; aucune citation.'),
      b('Check title, problématique, structure, neutrality, word count.', 'Vérifiez titre, problématique, structure, neutralité, nombre de mots.'),
    ],
    [['l’engouement', b('enthusiasm, craze', 'grand intérêt')], ['la transmission', b('the passing on (of knowledge)', 'fait de transmettre')], ['fragiliser', b('to weaken', 'rendre fragile')]],
  ),
];
