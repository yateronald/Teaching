import type { CourseAbout } from '../../types';
import { b, card, doc, exam, lesson, mc, P, pairs, sort, tip } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'The DELF B2 reading test asks you to understand long informative and argumentative texts (press articles, opinion pieces, reports) within a limited time. This course trains the strategies that make the difference: reading the questions first, skimming for structure, scanning for details, understanding the author’s viewpoint and tone, and avoiding answer traps such as paraphrases and partial truths.',
    'L’épreuve de compréhension des écrits du DELF B2 demande de comprendre des textes longs, informatifs et argumentatifs (articles de presse, tribunes, rapports) en temps limité. Ce cours entraîne les stratégies qui font la différence : lire d’abord les questions, survoler le texte pour sa structure, chercher les détails, comprendre le point de vue et le ton de l’auteur, et éviter les pièges des réponses (reformulations, vérités partielles).',
  ),
  outcomes: [
    b('Skim a text for structure', 'Survoler un texte pour sa structure'),
    b('Scan for precise information', 'Repérer des informations précises'),
    b('Identify the author’s viewpoint and tone', 'Identifier le point de vue et le ton de l’auteur'),
    b('Avoid answer traps', 'Éviter les pièges des réponses'),
  ],
};

const C = 'delf-b2-reading';
export default [
  lesson(C, 1, ['skimming-and-structure', 'survoler-et-structure'],
    b('Skimming and structure', 'Survoler et repérer la structure'),
    b('Get the main idea and the structure of a long text quickly.', 'Saisir rapidement l’idée principale et la structure d’un texte long.'),
    [b('Read title, chapeau and first sentences', 'Lire titre, chapeau et premières phrases'), b('Spot the structure through connectors', 'Repérer la structure grâce aux connecteurs'), b('Summarise in one sentence', 'Résumer en une phrase')],
    13,
    [
      exam(b('B2 reading', 'Compréhension des écrits B2'), b('About **1 hour**, **25 points**, two (or more) long texts of an **informative** and an **argumentative** nature, with mostly **multiple-choice** and some **true/false with justification** questions depending on the version. Strategy: **questions first**, then the text.', 'Environ **1 heure**, **25 points**, deux textes longs (ou plus), **informatif** et **argumentatif**, avec surtout des **QCM** et, selon les versions, des questions **vrai/faux avec justification**. Stratégie : **les questions d’abord**, puis le texte.')),
      card(b('Skimming', 'Survoler'), b('Read in this order: **title → chapeau (the introduction in bold) → first sentence of each paragraph → conclusion**. Connectors reveal the structure: **d’une part / d’autre part, en revanche, ainsi, pourtant, en définitive**.', 'Lisez dans cet ordre : **titre → chapeau → première phrase de chaque paragraphe → conclusion**. Les connecteurs révèlent la structure : **d’une part / d’autre part, en revanche, ainsi, pourtant, en définitive**.')),
      doc({ look: 'article', title: b('Le retour des jardins partagés', 'Le retour des jardins partagés'), text: 'Dans les grandes villes, les jardins partagés se multiplient. Sur des terrains vacants ou des toits, des habitants cultivent ensemble légumes et fleurs.\n\nD’une part, ces jardins répondent à un besoin de nature : en ville, de nombreux habitants n’ont ni balcon ni accès à un parc proche. D’autre part, ils créent du lien : on y croise des retraités, des familles, des étudiants, qui ne se seraient sans doute jamais parlé.\n\nPourtant, leur avenir reste fragile. Installés sur des terrains prêtés, ils peuvent disparaître dès qu’un projet immobilier se présente. En définitive, leur survie dépendra de la volonté des municipalités de les intégrer durablement dans l’urbanisme.' }, b('What is the main idea of the text?', 'Quelle est l’idée principale du texte ?'), [b('Shared gardens are useful but their future is fragile.', 'Les jardins partagés sont utiles, mais leur avenir est fragile.'), b('Gardens produce a lot of vegetables.', 'Les jardins produisent beaucoup de légumes.'), b('Cities should build more parking.', 'Les villes devraient construire plus de parkings.'), b('Students don’t like gardening.', 'Les étudiants n’aiment pas jardiner.')]),
      sort(b('Function of the connector in the text', 'Fonction du connecteur dans le texte'), [b('lists arguments', 'énumère des arguments'), b('introduces a contrast', 'introduit une opposition'), b('concludes', 'conclut')], [['D’une part', 0], ['Pourtant', 1], ['En définitive', 2], ['D’autre part', 0], ['En revanche', 1], ['Ainsi', 2]]),
      mc(P.choose, [b('the first sentence of each paragraph', 'la première phrase de chaque paragraphe'), b('the longest sentence', 'la phrase la plus longue'), b('the numbers', 'les chiffres'), b('the last word', 'le dernier mot')], { fr: 'Pour survoler un texte, que lit-on après le titre et le chapeau ?' }),
    ],
    [
      b('Questions first; then title, chapeau, first sentences, conclusion.', 'Les questions d’abord ; puis titre, chapeau, premières phrases, conclusion.'),
      b('Connectors reveal the structure.', 'Les connecteurs révèlent la structure.'),
      b('Summarise the text in one sentence before answering.', 'Résumez le texte en une phrase avant de répondre.'),
    ],
    [['un chapeau', b('a standfirst (article intro)', 'introduction d’article')], ['un terrain vacant', b('a vacant lot', 'espace libre')], ['l’urbanisme', b('urban planning', 'organisation de la ville')]],
  ),
  lesson(C, 2, ['viewpoint-and-tone', 'point-de-vue-et-ton'],
    b('The author’s viewpoint and tone', 'Le point de vue et le ton de l’auteur'),
    b('Identify what the author thinks and how they say it.', 'Identifier ce que pense l’auteur et comment il le dit.'),
    [b('Spot opinion markers', 'Repérer les marques d’opinion'), b('Identify the tone', 'Identifier le ton'), b('Distinguish facts and opinions', 'Distinguer faits et opinions')],
    13,
    [
      card(b('Viewpoint and tone', 'Point de vue et ton'), b('Opinion markers: **adjectives** (inquiétant, remarquable), **adverbs** (heureusement, malheureusement), **verbs** (dénoncer, saluer, regretter), the **conditional** (distance: « les résultats auraient baissé »), **rhetorical questions**. Tones: **neutre, enthousiaste, critique, ironique, inquiet, nuancé**.', 'Marques d’opinion : **adjectifs** (inquiétant, remarquable), **adverbes** (heureusement, malheureusement), **verbes** (dénoncer, saluer, regretter), le **conditionnel** (distance : « les résultats auraient baissé »), les **questions rhétoriques**. Tons : **neutre, enthousiaste, critique, ironique, inquiet, nuancé**.')),
      doc({ look: 'article', title: b('Opinion', 'Tribune'), text: 'On nous promettait des villes « intelligentes ». Voici des trottoirs encombrés de trottinettes abandonnées, des applications qui tombent en panne et des données personnelles collectées à notre insu. Belle intelligence, en vérité.' }, b('What is the tone of the author?', 'Quel est le ton de l’auteur ?'), [b('ironic and critical', 'ironique et critique'), b('enthusiastic', 'enthousiaste'), b('neutral', 'neutre'), b('indifferent', 'indifférent')]),
      sort(b('Fact or opinion?', 'Fait ou opinion ?'), [b('fact', 'fait'), b('opinion', 'opinion')], [['La ville compte 12 jardins partagés.', 0], ['Ces jardins sont une magnifique initiative.', 1], ['Le projet a été lancé en 2019.', 0], ['Il est regrettable que la mairie hésite.', 1], ['Le terrain appartient à la SNCF.', 0], ['Malheureusement, rien n’est garanti.', 1]]),
      mc(P.meaning, [b('The journalist reports it without confirming it.', 'Le journaliste le rapporte sans le confirmer.'), b('The journalist is sure of it.', 'Le journaliste en est sûr.'), b('It will happen in the future.', 'Cela arrivera dans le futur.'), b('It is a wish.', 'C’est un souhait.')], { fr: '« Selon l’étude, le nombre de lecteurs aurait doublé. »' }),
      pairs(P.match, [['dénoncer', b('to denounce', 'critiquer publiquement')], ['saluer', b('to welcome, praise', 'féliciter')], ['à notre insu', b('without our knowledge', 'sans que nous le sachions')], ['encombré', b('cluttered', 'plein d’objets gênants')]]),
    ],
    [
      b('Opinion markers: adjectives, adverbs, verbs like dénoncer / saluer.', 'Marques d’opinion : adjectifs, adverbes, verbes comme dénoncer / saluer.'),
      b('The conditional shows distance from a fact.', 'Le conditionnel marque une distance par rapport au fait.'),
      b('Tones: neutre, critique, ironique, enthousiaste, nuancé.', 'Tons : neutre, critique, ironique, enthousiaste, nuancé.'),
    ],
    [['une trottinette', b('a scooter (kick)', 'petit véhicule à guidon')], ['une tribune', b('an opinion piece', 'article d’opinion')], ['ironique', b('ironic', 'qui dit le contraire')]],
  ),
  lesson(C, 3, ['question-traps', 'les-pieges-des-questions'],
    b('Avoiding question traps', 'Éviter les pièges des questions'),
    b('Recognise paraphrases, partial truths and over-generalisations in answer options.', 'Reconnaître reformulations, vérités partielles et généralisations abusives dans les réponses proposées.'),
    [b('Match paraphrases', 'Associer les reformulations'), b('Spot partial truths', 'Repérer les vérités partielles'), b('Beware of absolute words', 'Se méfier des mots absolus')],
    13,
    [
      card(b('Three traps', 'Trois pièges'), b('1. **The same words, wrong meaning**: an option repeats words from the text but changes the meaning. 2. **Partial truth**: half right (« les jardins créent du lien et produisent beaucoup » → the second part is not in the text). 3. **Absolute words**: **toujours, jamais, tous, aucun, uniquement** often signal a wrong option. The right answer is usually a **paraphrase**.', '1. **Mêmes mots, sens faux** : une option reprend des mots du texte mais change le sens. 2. **Vérité partielle** : à moitié juste (« les jardins créent du lien et produisent beaucoup » → la deuxième partie n’est pas dans le texte). 3. **Mots absolus** : **toujours, jamais, tous, aucun, uniquement** signalent souvent une mauvaise option. La bonne réponse est généralement une **reformulation**.')),
      mc(P.choose, [b('Their existence depends on decisions by local authorities.', 'Leur existence dépend des décisions des pouvoirs locaux.'), b('They will all disappear soon.', 'Ils vont tous disparaître bientôt.'), b('They are protected by law forever.', 'Ils sont protégés par la loi pour toujours.'), b('Municipalities never support them.', 'Les municipalités ne les soutiennent jamais.')], { fr: 'D’après le texte sur les jardins partagés (leçon 1), que peut-on dire de leur avenir ?', explain: b('The text says « leur survie dépendra de la volonté des municipalités »: a paraphrase. The other options use absolute words not supported by the text.', 'Le texte dit « leur survie dépendra de la volonté des municipalités » : c’est une reformulation. Les autres options emploient des mots absolus non justifiés.') }),
      sort(b('Likely trap or likely correct?', 'Piège probable ou réponse probable ?'), [b('likely trap', 'piège probable'), b('possible correct answer', 'réponse possible')], [['Tous les habitants participent.', 0], ['Certains habitants s’y rencontrent.', 1], ['Les jardins n’ont aucun inconvénient.', 0], ['Les jardins présentent aussi des limites.', 1], ['La mairie refuse toujours ces projets.', 0], ['La mairie hésite encore.', 1]]),
      pairs(P.match, [['se multiplier', 'être de plus en plus nombreux'], ['fragile', 'menacé'], ['créer du lien', 'favoriser les rencontres'], ['durablement', 'sur le long terme']], true),
      tip(b('Justify with the text', 'Justifiez avec le texte'), b('For true/false questions, copy the **exact short passage** that proves your answer. A correct « vrai » without justification may earn no points.', 'Pour les questions vrai/faux, recopiez le **passage précis et court** qui prouve votre réponse. Un « vrai » correct sans justification peut ne rapporter aucun point.')),
    ],
    [
      b('Beware: same words / wrong meaning, partial truths, absolute words.', 'Attention : mêmes mots / sens faux, vérités partielles, mots absolus.'),
      b('The right answer is usually a paraphrase.', 'La bonne réponse est généralement une reformulation.'),
      b('Justify true/false with an exact quotation.', 'Justifiez vrai/faux par une citation exacte.'),
    ],
    [['une reformulation', b('a paraphrase', 'même idée, autres mots')], ['justifier', b('to justify', 'prouver')], ['les pouvoirs locaux', b('local authorities', 'mairie, région')]],
  ),
];
