import type { CourseAbout } from '../../types';
import { b, card, dict, hear, lesson, P, pairs, sort, tip } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'A press review summarises and compares how several newspapers cover the same news; a radio column adds the commentator’s personal, often ironic, point of view. This course trains you on original press-review and column extracts to identify the sources, compare the angles of different media, and separate information from commentary.',
    'Une revue de presse résume et compare la façon dont plusieurs journaux traitent une même actualité ; une chronique radio y ajoute le point de vue personnel, souvent ironique, du chroniqueur. Ce cours vous entraîne sur des extraits originaux de revues de presse et de chroniques pour repérer les sources, comparer les angles des médias et séparer l’information du commentaire.',
  ),
  outcomes: [
    b('Identify the sources quoted', 'Identifier les sources citées'),
    b('Compare the angles of different media', 'Comparer les angles des différents médias'),
    b('Separate information from commentary', 'Séparer information et commentaire'),
    b('Understand a columnist’s irony', 'Comprendre l’ironie d’un chroniqueur'),
  ],
};

const C = 'l-press-review';
export default [
  lesson(C, 1, ['sources-and-headlines', 'sources-et-unes'],
    b('Sources and front pages', 'Sources et unes'),
    b('Catch which newspaper says what in a press review.', 'Saisir quel journal dit quoi dans une revue de presse.'),
    [b('Recognise how sources are quoted', 'Reconnaître la citation des sources'), b('Catch each front page', 'Saisir chaque une'), b('Keep track of several sources', 'Suivre plusieurs sources')],
    13,
    [
      card(b('Quoting the press', 'Citer la presse'), b('**À la une du Quotidien des Rives…** (on the front page of), **Le Phare titre…** (headlines), **Pour L’Horizon…**, **Du côté de…** (as for), **On lit dans… que…**, **Le quotidien parle de…**', '**À la une du Quotidien des Rives…**, **Le Phare titre…**, **Pour L’Horizon…**, **Du côté de…**, **On lit dans… que…**, **Le quotidien parle de…**')),
      hear('À la une ce matin, Le Quotidien des Rives titre sur la hausse des loyers, tandis que La Voix des Monts consacre sa une au festival d’été.', b('What is on the front page of La Voix des Monts?', 'Qu’y a-t-il à la une de La Voix des Monts ?'), [b('The summer festival', 'Le festival d’été'), b('Rent increases', 'La hausse des loyers'), b('Sport', 'Le sport'), b('The weather', 'La météo')]),
      hear('Du côté de L’Écho des marchés, on parle d’un « tournant historique » pour l’industrie automobile.', b('How does L’Écho des marchés describe the news?', 'Comment L’Écho des marchés qualifie-t-il l’actualité ?'), [b('As a historic turning point for the car industry', 'Comme un tournant historique pour l’industrie automobile'), b('As a disaster', 'Comme une catastrophe'), b('As minor news', 'Comme une nouvelle mineure'), b('It does not mention it', 'Il n’en parle pas')]),
      hear('On lit dans Le Matinal que le projet de tramway coûterait finalement deux fois plus cher que prévu.', b('What does Le Matinal report?', 'Que rapporte Le Matinal ?'), [b('The tram project would cost twice as much as planned', 'Le tramway coûterait deux fois plus cher que prévu'), b('The tram is cancelled', 'Le tramway est annulé'), b('The tram is cheaper', 'Le tramway coûte moins cher'), b('The tram opens today', 'Le tramway ouvre aujourd’hui')]),
      tip(b('Build a small table', 'Faites un petit tableau'), b('With several sources, note **journal → sujet → angle** in three columns. The press reviewer moves fast from one to the next with **tandis que, du côté de, quant à**.', 'Avec plusieurs sources, notez **journal → sujet → angle** en trois colonnes. Le revuiste passe vite de l’un à l’autre avec **tandis que, du côté de, quant à**.')),
      pairs(P.match, [['à la une', b('on the front page', 'en première page')], ['titrer sur', b('to headline on', 'faire son titre sur')], ['du côté de', b('as for, on the side of', 'en ce qui concerne')], ['un quotidien', b('a daily newspaper', 'journal de chaque jour')]]),
      dict('À la une ce matin, le journal titre sur la hausse des loyers.', { voice: 'm' }),
    ],
    [
      b('À la une de…, X titre sur…, Du côté de…, On lit dans… que…', 'À la une de…, X titre sur…, Du côté de…, On lit dans… que…'),
      b('Note journal → topic → angle.', 'Notez journal → sujet → angle.'),
      b('tandis que / quant à: moving between sources.', 'tandis que / quant à : passage d’une source à l’autre.'),
    ],
    [['un tournant', b('a turning point', 'changement important')], ['un tramway', b('a tram', 'transport sur rails en ville')], ['prévu', b('planned, expected', 'envisagé')]],
  ),
  lesson(C, 2, ['comparing-angles', 'comparer-les-angles'],
    b('Comparing media angles', 'Comparer les angles des médias'),
    b('Understand how two media present the same fact differently.', 'Comprendre comment deux médias présentent différemment un même fait.'),
    [b('Recognise a positive or negative angle', 'Reconnaître un angle positif ou négatif'), b('Notice word choices', 'Remarquer le choix des mots'), b('Compare two treatments', 'Comparer deux traitements')],
    13,
    [
      card(b('Same fact, different words', 'Même fait, mots différents'), b('A media angle shows in **word choices**: **une réforme courageuse** vs **une réforme brutale**, **les manifestants** vs **les casseurs**, **une hausse modérée** vs **une flambée**. Listen for these evaluative words.', 'L’angle d’un média se voit dans le **choix des mots** : **une réforme courageuse** / **une réforme brutale**, **les manifestants** / **les casseurs**, **une hausse modérée** / **une flambée**. Écoutez ces mots évaluatifs.')),
      hear('Pour Le Phare, c’est une réforme courageuse et attendue depuis longtemps ; L’Horizon, lui, dénonce une réforme brutale imposée sans consultation.', b('How do the two papers differ?', 'En quoi les deux journaux diffèrent-ils ?'), [b('One praises the reform, the other condemns it', 'L’un salue la réforme, l’autre la dénonce'), b('They both praise it', 'Ils la saluent tous les deux'), b('They both criticise it', 'Ils la critiquent tous les deux'), b('Neither mentions it', 'Aucun n’en parle')]),
      hear('Une hausse modérée des prix, selon le ministère ; une véritable flambée, selon les associations de consommateurs.', b('Who describes the price rise as dramatic?', 'Qui présente la hausse des prix comme spectaculaire ?'), [b('Consumer associations', 'Les associations de consommateurs'), b('The ministry', 'Le ministère'), b('Both', 'Les deux'), b('Neither', 'Aucun des deux')]),
      sort(b('Positive or negative angle?', 'Angle positif ou négatif ?'), [b('positive', 'positif'), b('negative', 'négatif')], [['une réforme courageuse', 0], ['une réforme brutale', 1], ['une hausse modérée', 0], ['une flambée des prix', 1], ['un succès historique', 0], ['un fiasco', 1]], { listen: true }),
      pairs(P.match, [['une flambée', b('a surge, a spike', 'hausse brutale')], ['dénoncer', b('to condemn', 'critiquer publiquement')], ['attendu', b('long-awaited', 'espéré')], ['un fiasco', b('a fiasco', 'échec total')]]),
      hear('Les deux journaux s’accordent toutefois sur un point : le calendrier est beaucoup trop serré.', b('On what do they agree?', 'Sur quoi sont-ils d’accord ?'), [b('The timetable is far too tight', 'Le calendrier est beaucoup trop serré'), b('The reform is excellent', 'La réforme est excellente'), b('Prices will fall', 'Les prix vont baisser'), b('Nothing', 'Sur rien')]),
      dict('Les deux journaux s’accordent sur un point : le calendrier est trop serré.', { voice: 'f' }),
    ],
    [
      b('The angle shows in evaluative words.', 'L’angle se voit dans les mots évaluatifs.'),
      b('selon X / pour X = attributing a view.', 'selon X / pour X = attribution d’un point de vue.'),
      b('s’accorder sur = to agree on.', 's’accorder sur = être d’accord sur.'),
    ],
    [['une réforme', b('a reform', 'changement de loi')], ['serré', b('tight', 'sans marge')], ['un consommateur', b('a consumer', 'acheteur')]],
  ),
  lesson(C, 3, ['the-columnist', 'le-chroniqueur'],
    b('The columnist’s commentary', 'Le commentaire du chroniqueur'),
    b('Separate the facts from the columnist’s ironic commentary.', 'Séparer les faits du commentaire ironique du chroniqueur.'),
    [b('Recognise the columnist’s opinion', 'Reconnaître l’opinion du chroniqueur'), b('Understand irony', 'Comprendre l’ironie'), b('Separate fact and comment', 'Séparer fait et commentaire')],
    13,
    [
      tip(b('Fact or comment?', 'Fait ou commentaire ?'), b('A columnist mixes **facts** (the bridge will close for six months) and **comments** (imagine the joy of drivers…). Comments use **irony, exaggeration, je, on, rhetorical questions**.', 'Un chroniqueur mêle **faits** (le pont fermera six mois) et **commentaires** (imaginez la joie des automobilistes…). Les commentaires emploient **ironie, exagération, je, on, questions rhétoriques**.')),
      hear('Le pont fermera pendant six mois pour des travaux. Imaginez la joie des automobilistes : six mois de bouchons, quel beau cadeau de Noël !', b('Which part is a fact?', 'Quelle partie est un fait ?'), [b('The bridge will close for six months', 'Le pont fermera pendant six mois'), b('Drivers will be joyful', 'Les automobilistes seront ravis'), b('It is a Christmas present', 'C’est un cadeau de Noël'), b('There will be no traffic jams', 'Il n’y aura pas de bouchons')]),
      hear('Quarante millions pour une nouvelle signalisation. Je suis sûr que nos nids-de-poule apprécieront d’être si bien indiqués.', b('What does the columnist criticise?', 'Que critique le chroniqueur ?'), [b('Spending on signs while the potholes stay', 'Dépenser pour des panneaux alors que les nids-de-poule restent'), b('Potholes are fixed', 'Les nids-de-poule sont réparés'), b('Signs are too cheap', 'Les panneaux sont trop bon marché'), b('He praises the project', 'Il salue le projet')]),
      hear('Bref, encore une décision prise loin des citoyens. Mais rassurez-vous : on nous consultera… une fois les travaux terminés.', b('What is the tone of the ending?', 'Quel est le ton de la fin ?'), [b('Ironic and critical', 'Ironique et critique'), b('Enthusiastic', 'Enthousiaste'), b('Neutral', 'Neutre'), b('Sad and resigned', 'Triste et résigné')]),
      sort(b('Fact or comment?', 'Fait ou commentaire ?'), [b('fact', 'fait'), b('comment', 'commentaire')], [['Le pont fermera six mois.', 0], ['Quel beau cadeau de Noël !', 1], ['Le budget est de quarante millions.', 0], ['Nos nids-de-poule apprécieront.', 1]]),
      pairs(P.match, [['un nid-de-poule', b('a pothole', 'trou dans la chaussée')], ['la signalisation', b('road signs', 'panneaux routiers')], ['rassurez-vous', b('rest assured (often ironic)', 'ne vous inquiétez pas')], ['un chroniqueur', b('a columnist', 'auteur de chroniques')]]),
      dict('Imaginez la joie des automobilistes : six mois de bouchons !', { voice: 'm' }),
    ],
    [
      b('Facts: neutral, verifiable. Comments: irony, exaggeration, je / on.', 'Faits : neutres, vérifiables. Commentaires : ironie, exagération, je / on.'),
      b('Imaginez la joie de… = ironic.', 'Imaginez la joie de… = ironique.'),
      b('rassurez-vous… + absurd consequence = irony.', 'rassurez-vous… + conséquence absurde = ironie.'),
    ],
    [['un cadeau', b('a present, a gift', 'présent')], ['consulter', b('to consult', 'demander l’avis')], ['apprécier', b('to appreciate', 'aimer')]],
  ),
];
