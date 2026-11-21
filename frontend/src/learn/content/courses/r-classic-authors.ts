import type { CourseAbout, Doc } from '../../types';
import { b, card, dict, doc, gap, lesson, mc, P, pairs, sort, tip } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Victor Hugo, Gustave Flaubert and Guy de Maupassant shaped the French novel and short story. This course offers short passages from Les Misérables, Madame Bovary and La Parure, with the context you need, the vocabulary and the literary tenses (passé simple, imparfait), and questions that help you appreciate their style: Hugo’s grandeur, Flaubert’s irony and precision, Maupassant’s sense of the twist.',
    'Victor Hugo, Gustave Flaubert et Guy de Maupassant ont façonné le roman et la nouvelle en français. Ce cours propose de courts passages des Misérables, de Madame Bovary et de La Parure, avec le contexte nécessaire, le vocabulaire et les temps littéraires (passé simple, imparfait), et des questions qui aident à apprécier leur style : la grandeur de Hugo, l’ironie et la précision de Flaubert, l’art de la chute chez Maupassant.',
  ),
  outcomes: [
    b('Read short classic passages with context', 'Lire de courts passages classiques avec leur contexte'),
    b('Recognise the passé simple in narration', 'Reconnaître le passé simple dans la narration'),
    b('Appreciate an author’s style', 'Apprécier le style d’un auteur'),
    b('Understand a famous twist ending', 'Comprendre une chute célèbre'),
  ],
};

const HUGO: Doc = { look: 'page', title: b('Victor Hugo, Les Misérables (1862), opening', 'Victor Hugo, Les Misérables (1862), incipit'), text: 'En 1815, M. Charles-François-Bienvenu Myriel était évêque de Digne. C’était un vieillard d’environ soixante-quinze ans ; il occupait le siège de Digne depuis 1806.', source: b('Public domain', 'Domaine public') };
const FLAUBERT: Doc = { look: 'page', title: b('Gustave Flaubert, Madame Bovary (1857), opening', 'Gustave Flaubert, Madame Bovary (1857), incipit'), text: 'Nous étions à l’Étude, quand le Proviseur entra, suivi d’un nouveau habillé en bourgeois et d’un garçon de classe qui portait un grand pupitre.', source: b('Public domain', 'Domaine public') };
const PARURE1: Doc = { look: 'page', title: b('Guy de Maupassant, La Parure (1884), opening', 'Guy de Maupassant, La Parure (1884), incipit'), text: 'C’était une de ces jolies et charmantes filles, nées, comme par une erreur du destin, dans une famille d’employés.', source: b('Public domain', 'Domaine public') };
const PARURE2: Doc = { look: 'page', title: b('Guy de Maupassant, La Parure, last lines', 'Guy de Maupassant, La Parure, dernières lignes'), text: '— Oh ! ma pauvre Mathilde ! Mais la mienne était fausse. Elle valait au plus cinq cents francs !...', source: b('Public domain', 'Domaine public') };

const C = 'r-classic-authors';
export default [
  lesson(C, 1, ['victor-hugo', 'victor-hugo'],
    b('Victor Hugo: Les Misérables', 'Victor Hugo : Les Misérables'),
    b('Read the opening of Les Misérables and discover Hugo’s narrative world.', 'Lire l’incipit des Misérables et découvrir l’univers narratif de Hugo.'),
    [b('Understand the context of the novel', 'Comprendre le contexte du roman'), b('Read an opening sentence closely', 'Lire de près une phrase d’ouverture'), b('Recognise imparfait and plus-que-parfait in description', 'Reconnaître imparfait et plus-que-parfait dans la description')],
    13,
    [
      card(b('Context', 'Contexte'), b('**Les Misérables** (1862) follows Jean Valjean, a former convict, in a France marked by poverty and injustice. The novel opens not with him, but with **Monseigneur Myriel**, the bishop of Digne, whose kindness will change Valjean’s life. Hugo writes with **grandeur**: long sentences, moral reflection, social commitment.', '**Les Misérables** (1862) suit Jean Valjean, ancien forçat, dans une France marquée par la misère et l’injustice. Le roman s’ouvre non sur lui, mais sur **Monseigneur Myriel**, évêque de Digne, dont la bonté va changer la vie de Valjean. Hugo écrit avec **grandeur** : longues phrases, réflexion morale, engagement social.')),
      doc(HUGO, b('Who is introduced first?', 'Qui est présenté en premier ?'), [b('The bishop of Digne', 'L’évêque de Digne'), b('Jean Valjean', 'Jean Valjean'), b('A young soldier', 'Un jeune soldat'), b('The narrator', 'Le narrateur')]),
      doc(HUGO, b('Since when had he been bishop of Digne?', 'Depuis quand était-il évêque de Digne ?'), [b('Since 1806', 'Depuis 1806'), b('Since 1815', 'Depuis 1815'), b('For 75 years', 'Depuis 75 ans'), b('Since 1862', 'Depuis 1862')]),
      mc(P.meaning, [b('an old man', 'un homme âgé'), b('a young man', 'un jeune homme'), b('a priest’s house', 'la maison d’un prêtre'), b('a soldier', 'un soldat')], { fr: 'un vieillard' }),
      tip(b('A sober opening', 'Une ouverture sobre'), b('The opening uses the **imparfait** (était, occupait) to describe a situation, with precise **dates** and names: Hugo anchors his epic in history before telling the events in the **passé simple**.', 'L’incipit emploie l’**imparfait** (était, occupait) pour décrire une situation, avec des **dates** et des noms précis : Hugo ancre son épopée dans l’histoire avant de raconter les événements au **passé simple**.')),
      pairs(P.match, [['un évêque', b('a bishop', 'chef religieux d’un diocèse')], ['un forçat', b('a convict (forced labourer)', 'condamné aux travaux forcés')], ['la misère', b('poverty, destitution', 'grande pauvreté')], ['le siège (épiscopal)', b('the see, the seat', 'fonction d’évêque')]]),
      dict('En 1815, M. Charles-François-Bienvenu Myriel était évêque de Digne.', { voice: 'm' }),
    ],
    [
      b('Les Misérables (1862): Jean Valjean, Monseigneur Myriel, social injustice.', 'Les Misérables (1862) : Jean Valjean, Monseigneur Myriel, injustice sociale.'),
      b('Description in the imparfait, events in the passé simple.', 'Description à l’imparfait, événements au passé simple.'),
      b('Hugo: grandeur, moral reflection, commitment.', 'Hugo : grandeur, réflexion morale, engagement.'),
    ],
    [['un vieillard', b('an old man', 'homme très âgé')], ['occuper (un poste)', b('to hold (a position)', 'exercer une fonction')], ['l’engagement', b('commitment', 'prise de position')]],
  ),
  lesson(C, 2, ['gustave-flaubert', 'gustave-flaubert'],
    b('Gustave Flaubert: Madame Bovary', 'Gustave Flaubert : Madame Bovary'),
    b('Read the opening of Madame Bovary and notice Flaubert’s precision and irony.', 'Lire l’incipit de Madame Bovary et remarquer la précision et l’ironie de Flaubert.'),
    [b('Understand the context of the novel', 'Comprendre le contexte du roman'), b('Notice the mysterious « nous »', 'Remarquer le « nous » énigmatique'), b('Distinguish passé simple and imparfait', 'Distinguer passé simple et imparfait')],
    13,
    [
      card(b('Context', 'Contexte'), b('**Madame Bovary** (1857) tells the story of Emma, a provincial woman who dreams of passion and luxury and is crushed by reality. The novel starts at school with **Charles Bovary**, her future husband, mocked by his classmates. Flaubert is famous for his **exact word** (le mot juste) and his discreet **irony**.', '**Madame Bovary** (1857) raconte l’histoire d’Emma, provinciale qui rêve de passion et de luxe et que la réalité écrase. Le roman commence au collège avec **Charles Bovary**, son futur mari, moqué par ses camarades. Flaubert est célèbre pour son **mot juste** et son **ironie** discrète.')),
      doc(FLAUBERT, b('Where does the scene take place?', 'Où se passe la scène ?'), [b('In a school study room', 'Dans une salle d’étude d’un collège'), b('In a church', 'Dans une église'), b('In a shop', 'Dans un magasin'), b('In a café', 'Dans un café')]),
      doc(FLAUBERT, b('Who comes in with the head teacher?', 'Qui entre avec le proviseur ?'), [b('A new pupil and a school servant carrying a desk', 'Un nouvel élève et un garçon de classe portant un pupitre'), b('Emma Bovary', 'Emma Bovary'), b('A priest', 'Un prêtre'), b('The narrator’s father', 'Le père du narrateur')]),
      sort(b('Imparfait or passé simple?', 'Imparfait ou passé simple ?'), [b('imparfait (background)', 'imparfait (arrière-plan)'), b('passé simple (event)', 'passé simple (événement)')], [['nous étions', 0], ['le Proviseur entra', 1], ['qui portait', 0]]),
      mc(P.meaning, [b('A group of pupils, a narrator who later disappears from the novel', 'Un groupe d’élèves, un narrateur qui disparaît ensuite du roman'), b('Flaubert and his wife', 'Flaubert et sa femme'), b('The readers of the novel', 'Les lecteurs du roman'), b('Emma and Charles', 'Emma et Charles')], { fr: '« Nous étions à l’Étude… » : qui est ce « nous » ?' }),
      pairs(P.match, [['le proviseur', b('the head teacher', 'directeur de lycée')], ['un pupitre', b('a school desk', 'table d’écolier')], ['habillé en bourgeois', b('in ordinary (non-uniform) clothes', 'en vêtements civils')], ['le mot juste', b('the exact word', 'le terme précis')]]),
      gap(P.complete, 'Le Proviseur ___ (passé simple d’entrer), suivi d’un nouveau qui ___ (imparfait d’être) habillé en bourgeois.', ['entra', 'était']),
    ],
    [
      b('Madame Bovary (1857): Emma’s dreams vs provincial reality.', 'Madame Bovary (1857) : les rêves d’Emma face à la réalité provinciale.'),
      b('Flaubert: le mot juste, precision, discreet irony.', 'Flaubert : le mot juste, la précision, l’ironie discrète.'),
      b('entra (passé simple) = event; étions, portait (imparfait) = background.', 'entra (passé simple) = événement ; étions, portait (imparfait) = arrière-plan.'),
    ],
    [['provincial', b('provincial', 'de province')], ['se moquer de', b('to make fun of', 'ridiculiser')], ['un camarade', b('a classmate', 'compagnon d’école')]],
  ),
  lesson(C, 3, ['maupassant-la-parure', 'maupassant-la-parure'],
    b('Maupassant: La Parure and the art of the twist', 'Maupassant : La Parure et l’art de la chute'),
    b('Read the opening and the last lines of La Parure and understand its famous twist.', 'Lire l’incipit et les dernières lignes de La Parure et comprendre sa chute célèbre.'),
    [b('Understand the story of La Parure', 'Comprendre l’histoire de La Parure'), b('Interpret the narrator’s judgment', 'Interpréter le jugement du narrateur'), b('Understand the final twist', 'Comprendre la chute finale')],
    13,
    [
      card(b('The story', 'L’histoire'), b('Mathilde Loisel, a modest clerk’s wife, borrows a **diamond necklace** from a rich friend, Mme Forestier, for a ball. She loses it, buys an identical one on credit and spends **ten years** in poverty to repay the debt. Then she meets her friend again…', 'Mathilde Loisel, épouse d’un modeste employé, emprunte une **rivière de diamants** à une amie riche, Mme Forestier, pour un bal. Elle la perd, en achète une identique à crédit et passe **dix ans** dans la misère pour rembourser. Puis elle revoit son amie…')),
      doc(PARURE1, b('What does « comme par une erreur du destin » suggest about Mathilde?', 'Que suggère « comme par une erreur du destin » à propos de Mathilde ?'), [b('She feels she was born for a richer life.', 'Elle a le sentiment d’être née pour une vie plus riche.'), b('She was adopted.', 'Elle a été adoptée.'), b('She is unhappy at work.', 'Elle est malheureuse au travail.'), b('She hates her family.', 'Elle déteste sa famille.')]),
      doc(PARURE2, b('What does Mme Forestier reveal?', 'Que révèle Mme Forestier ?'), [b('The necklace was a fake, worth at most 500 francs.', 'La rivière était fausse, elle valait au plus 500 francs.'), b('She found the necklace.', 'Elle a retrouvé la rivière.'), b('She wants the money back.', 'Elle veut être remboursée.'), b('The necklace was stolen.', 'La rivière a été volée.')]),
      mc(P.meaning, [b('Ten years of sacrifice were for nothing: a cruel irony.', 'Dix ans de sacrifices pour rien : une ironie cruelle.'), b('A happy ending', 'Une fin heureuse'), b('A love story', 'Une histoire d’amour'), b('A mystery solved by the police', 'Un mystère résolu par la police')], { fr: 'Pourquoi cette chute est-elle si forte ?' }),
      tip(b('The art of the twist', 'L’art de la chute'), b('Maupassant’s short stories often end with a **chute**: a final sentence that **overturns** everything the reader thought. It is short, in direct speech, and leaves the reader alone with its consequences.', 'Les nouvelles de Maupassant se terminent souvent par une **chute** : une dernière phrase qui **renverse** tout ce que le lecteur croyait. Elle est courte, au discours direct, et laisse le lecteur seul face à ses conséquences.')),
      pairs(P.match, [['une parure', b('a piece of jewellery, finery', 'bijou, ornement')], ['emprunter', b('to borrow', 'prendre en prêt')], ['rembourser', b('to pay back', 'rendre l’argent')], ['une chute', b('a twist ending', 'fin inattendue')]]),
      sort(b('Before or after the loss of the necklace?', 'Avant ou après la perte de la rivière ?'), [b('before', 'avant'), b('after', 'après')], [['Mathilde rêve de luxe.', 0], ['Elle vit dix ans dans la misère.', 1], ['Elle emprunte la rivière.', 0], ['Elle apprend que la rivière était fausse.', 1]]),
      dict('Oh ! ma pauvre Mathilde ! Mais la mienne était fausse.', { voice: 'f' }),
    ],
    [
      b('La Parure (1884): a borrowed necklace, ten years of debt, a fake.', 'La Parure (1884) : une rivière empruntée, dix ans de dettes, un faux.'),
      b('La chute: a short final reversal.', 'La chute : un renversement final bref.'),
      b('Maupassant: realism, irony, concise style.', 'Maupassant : réalisme, ironie, style concis.'),
    ],
    [['une rivière de diamants', b('a diamond necklace', 'collier de diamants')], ['un employé', b('a clerk', 'petit fonctionnaire')], ['le destin', b('fate', 'la destinée')]],
  ),
];
