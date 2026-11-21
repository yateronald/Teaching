import type { CourseAbout, Doc } from '../../types';
import { b, card, dict, doc, gap, lesson, mc, P, pairs, sort, tip } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Headlines without verbs, quotes, figures, the conditional for unconfirmed facts: news articles follow codes that make them hard at first and easy once you know them. This course trains you on news-style articles about society, the economy and the environment: understanding headlines, separating facts from opinions and quotes, reading figures and percentages, and recognising the reporting verbs that reveal a journalist’s distance.',
    'Titres sans verbe, citations, chiffres, conditionnel pour les faits non confirmés : les articles de presse obéissent à des codes qui les rendent difficiles au début et faciles une fois connus. Ce cours vous entraîne sur des articles de type journalistique consacrés à la société, à l’économie et à l’environnement : comprendre les titres, distinguer faits, opinions et citations, lire les chiffres et les pourcentages, et reconnaître les verbes introducteurs qui révèlent la distance du journaliste.',
  ),
  outcomes: [
    b('Understand nominal headlines', 'Comprendre les titres nominaux'),
    b('Distinguish facts, quotes and opinions', 'Distinguer faits, citations et opinions'),
    b('Read figures, percentages and trends', 'Lire chiffres, pourcentages et tendances'),
    b('Recognise the news conditional and reporting verbs', 'Reconnaître le conditionnel journalistique et les verbes introducteurs'),
  ],
};

const A1: Doc = { look: 'article', title: b('Society', 'Société'), text: 'Hausse record du nombre de cyclistes à Montréal\n\nLe nombre de déplacements à vélo a augmenté de 18 % en un an dans la métropole, selon un rapport publié mardi par la Ville. Cette hausse s’explique notamment par l’ouverture de 40 kilomètres de nouvelles pistes cyclables. « Les citoyens adoptent le vélo quand ils se sentent en sécurité », affirme la responsable du dossier, Nadia Roy. Certains commerçants s’inquiètent toutefois de la disparition de places de stationnement.' };
const A2: Doc = { look: 'article', title: b('Economy', 'Économie'), text: 'Le prix des loyers continue de grimper\n\nLe loyer moyen d’un appartement de deux chambres a atteint 1 650 $ par mois, soit une augmentation de 9 % par rapport à l’an dernier. Le taux d’inoccupation reste très bas, à 1,5 %. Selon plusieurs associations de locataires, la situation serait particulièrement difficile pour les familles et les étudiants. Le gouvernement promet la construction de 5 000 logements abordables d’ici 2028.' };
const A3: Doc = { look: 'article', title: b('Environment', 'Environnement'), text: 'Les abeilles de retour en ville\n\nDe plus en plus d’entreprises installent des ruches sur leurs toits. On compterait aujourd’hui plus de 300 ruches dans le centre-ville, contre une cinquantaine il y a dix ans. Pour les apiculteurs, ce phénomène reste positif à condition de planter suffisamment de fleurs. « Une ruche sans fleurs autour, c’est une ruche qui meurt », rappelle l’apiculteur Marc Lefebvre.' };

const C = 'r-news-articles';
export default [
  lesson(C, 1, ['headlines-and-facts', 'titres-et-faits'],
    b('Headlines, facts and quotes', 'Titres, faits et citations'),
    b('Understand nominal headlines and separate facts from quotes and opinions.', 'Comprendre les titres nominaux et séparer les faits des citations et des opinions.'),
    [b('Decode a headline without a verb', 'Décoder un titre sans verbe'), b('Find the source of an information', 'Trouver la source d’une information'), b('Distinguish fact, quote and opinion', 'Distinguer fait, citation et opinion')],
    13,
    [
      card(b('Nominal headlines', 'Les titres nominaux'), b('Headlines often replace the verb with a **noun**: **Hausse record du nombre de cyclistes** = le nombre de cyclistes a fortement augmenté. Common nouns: **hausse / baisse** (rise / fall), **ouverture / fermeture**, **grève**, **adoption**, **démission**.', 'Les titres remplacent souvent le verbe par un **nom** : **Hausse record du nombre de cyclistes** = le nombre de cyclistes a fortement augmenté. Noms fréquents : **hausse / baisse**, **ouverture / fermeture**, **grève**, **adoption**, **démission**.')),
      doc(A1, b('What does the headline say?', 'Que dit le titre ?'), [b('Cycling has never been so popular in Montréal.', 'Le vélo n’a jamais été aussi populaire à Montréal.'), b('Bikes are now forbidden.', 'Les vélos sont maintenant interdits.'), b('Cyclists are protesting.', 'Les cyclistes manifestent.'), b('Fewer people cycle.', 'Moins de gens font du vélo.')]),
      doc(A1, b('Where does the 18% figure come from?', 'D’où vient le chiffre de 18 % ?'), [b('A report published by the City', 'Un rapport publié par la Ville'), b('A shopkeeper', 'Un commerçant'), b('The journalist’s opinion', 'L’opinion du journaliste'), b('A cyclists’ association', 'Une association de cyclistes')]),
      doc(A1, b('Who is worried, and why?', 'Qui s’inquiète, et pourquoi ?'), [b('Some shopkeepers, about losing parking spaces', 'Certains commerçants, de la perte de places de stationnement'), b('Cyclists, about safety', 'Les cyclistes, de la sécurité'), b('The City, about costs', 'La Ville, des coûts'), b('Nadia Roy, about the report', 'Nadia Roy, du rapport')]),
      sort(b('Fact, quote or opinion?', 'Fait, citation ou opinion ?'), [b('fact', 'fait'), b('quote', 'citation')], [['Les déplacements ont augmenté de 18 %.', 0], ['« Les citoyens adoptent le vélo… »', 1], ['40 km de pistes ont ouvert.', 0], ['« Une ruche sans fleurs… »', 1]]),
      pairs(P.match, [['une hausse', b('a rise', 'augmentation')], ['une baisse', b('a fall', 'diminution')], ['selon', b('according to', 'd’après')], ['s’inquiéter de', b('to worry about', 'avoir peur de')]]),
      dict('Selon un rapport publié mardi, le nombre de cyclistes a augmenté de dix-huit pour cent.', { voice: 'f' }),
    ],
    [
      b('Nominal headline: noun instead of verb (Hausse de…, Fermeture de…).', 'Titre nominal : un nom au lieu d’un verbe (Hausse de…, Fermeture de…).'),
      b('Find the source: selon, d’après, affirme, indique.', 'Trouvez la source : selon, d’après, affirme, indique.'),
      b('Quotes are between « » and attributed.', 'Les citations sont entre « » et attribuées.'),
    ],
    [['un commerçant', b('a shopkeeper', 'personne qui tient un commerce')], ['la métropole', b('the metropolis, big city', 'grande ville')], ['notamment', b('notably, in particular', 'en particulier')]],
  ),
  lesson(C, 2, ['figures-and-trends', 'chiffres-et-tendances'],
    b('Figures, percentages and trends', 'Chiffres, pourcentages et tendances'),
    b('Read figures and comparisons accurately in an economic article.', 'Lire avec précision les chiffres et comparaisons d’un article économique.'),
    [b('Read prices, rates and percentages', 'Lire prix, taux et pourcentages'), b('Understand par rapport à, soit', 'Comprendre par rapport à, soit'), b('Describe a trend', 'Décrire une tendance')],
    13,
    [
      card(b('Trend vocabulary', 'Le vocabulaire des tendances'), b('**augmenter, grimper, progresser** (go up), **baisser, diminuer, chuter** (go down), **se stabiliser**. **soit** = that is / i.e., **par rapport à** = compared with, **le taux** = the rate, **en moyenne** = on average. Numbers: **1,5 %** (comma for decimals), **1 650 $** (space for thousands).', '**augmenter, grimper, progresser**, **baisser, diminuer, chuter**, **se stabiliser**. **soit** = c’est-à-dire, **par rapport à** = en comparaison avec, **le taux**, **en moyenne**. Nombres : **1,5 %** (virgule décimale), **1 650 $** (espace pour les milliers).')),
      doc(A2, b('By how much have rents risen?', 'De combien les loyers ont-ils augmenté ?'), [b('9% in one year', '9 % en un an'), b('1.5%', '1,5 %'), b('1,650 dollars', '1 650 dollars'), b('5,000 dollars', '5 000 dollars')]),
      doc(A2, b('What does a very low vacancy rate mean?', 'Que signifie un taux d’inoccupation très bas ?'), [b('It is hard to find an empty apartment.', 'Il est difficile de trouver un appartement libre.'), b('Many apartments are empty.', 'Beaucoup d’appartements sont vides.'), b('Rents are falling.', 'Les loyers baissent.'), b('Tenants are leaving the city.', 'Les locataires quittent la ville.')]),
      doc(A2, b('Why does the journalist write « la situation serait difficile »?', 'Pourquoi le journaliste écrit-il « la situation serait difficile » ?'), [b('It is the associations’ view, not a confirmed fact.', 'C’est l’avis des associations, pas un fait confirmé.'), b('It is a hypothesis about the future.', 'C’est une hypothèse sur l’avenir.'), b('It is a polite form.', 'C’est une forme de politesse.'), b('It is an error.', 'C’est une erreur.')]),
      sort(b('Going up or going down?', 'Hausse ou baisse ?'), [b('going up', 'hausse'), b('going down', 'baisse')], [['grimper', 0], ['chuter', 1], ['progresser', 0], ['reculer', 1], ['s’envoler', 0], ['diminuer', 1]]),
      gap(P.complete, 'Le loyer moyen a atteint 1 650 $, ___ une hausse de 9 % par ___ à l’an dernier.', ['soit', 'rapport']),
      mc(P.meaning, [b('affordable housing', 'des logements à prix accessible'), b('luxury housing', 'des logements de luxe'), b('temporary housing', 'des logements temporaires'), b('empty housing', 'des logements vides')], { fr: 'des logements abordables' }),
    ],
    [
      b('Trends: augmenter, grimper / baisser, chuter, reculer.', 'Tendances : augmenter, grimper / baisser, chuter, reculer.'),
      b('soit = that is; par rapport à = compared with.', 'soit = c’est-à-dire ; par rapport à = en comparaison avec.'),
      b('French numbers: 1,5 % ; 1 650 $.', 'Nombres : 1,5 % ; 1 650 $.'),
    ],
    [['le taux d’inoccupation', b('the vacancy rate', 'part des logements libres')], ['abordable', b('affordable', 'à prix raisonnable')], ['grimper', b('to climb', 'monter')]],
  ),
  lesson(C, 3, ['distance-and-conditional', 'distance-et-conditionnel'],
    b('The journalist’s distance', 'La distance du journaliste'),
    b('Recognise the news conditional and the verbs that show distance or agreement.', 'Reconnaître le conditionnel journalistique et les verbes qui marquent la distance ou l’adhésion.'),
    [b('Recognise the news conditional', 'Reconnaître le conditionnel journalistique'), b('Interpret reporting verbs', 'Interpréter les verbes introducteurs'), b('Understand conditions and nuances', 'Comprendre les conditions et les nuances')],
    13,
    [
      tip(b('Reporting verbs are not neutral', 'Les verbes introducteurs ne sont pas neutres'), b('**affirmer, indiquer, préciser** report neutrally; **prétendre** suggests doubt; **reconnaître** = admit; **rappeler** = remind; **dénoncer** = condemn. Together with the conditional (**on compterait**), they show how sure the journalist is.', '**affirmer, indiquer, préciser** rapportent de façon neutre ; **prétendre** suggère le doute ; **reconnaître** = admettre ; **rappeler** ; **dénoncer**. Avec le conditionnel (**on compterait**), ils montrent le degré de certitude du journaliste.')),
      doc(A3, b('Why « on compterait » and not « on compte »?', 'Pourquoi « on compterait » et non « on compte » ?'), [b('The figure is an estimate, not verified.', 'Le chiffre est une estimation, non vérifiée.'), b('It is in the future.', 'C’est au futur.'), b('It is a polite request.', 'C’est une demande polie.'), b('It is a quote.', 'C’est une citation.')]),
      doc(A3, b('Under what condition is the phenomenon positive?', 'À quelle condition le phénomène est-il positif ?'), [b('If enough flowers are planted', 'Si l’on plante assez de fleurs'), b('If there are fewer hives', 'S’il y a moins de ruches'), b('If companies pay beekeepers', 'Si les entreprises paient les apiculteurs'), b('Never', 'Jamais')]),
      doc(A3, b('How many hives were there ten years ago?', 'Combien de ruches y avait-il il y a dix ans ?'), [b('About fifty', 'Une cinquantaine'), b('More than 300', 'Plus de 300'), b('Ten', 'Dix'), b('None', 'Aucune')]),
      pairs(P.match, [['prétendre', b('to claim (doubt)', 'affirmer sans preuve')], ['reconnaître', b('to admit', 'admettre')], ['dénoncer', b('to condemn', 'critiquer publiquement')], ['rappeler', b('to remind, to point out', 'faire souvenir')]]),
      mc(P.meaning, [b('The journalist doubts the minister’s claim.', 'Le journaliste doute de l’affirmation du ministre.'), b('The minister is surely right.', 'Le ministre a sûrement raison.'), b('The minister admits a mistake.', 'Le ministre reconnaît une erreur.'), b('The minister is quoted neutrally.', 'Le ministre est cité de façon neutre.')], { fr: 'Le ministre prétend que la crise est terminée.' }),
      gap(P.complete, 'Le maire ___ (admettre) son erreur, mais l’opposition ___ (condamner publiquement) sa gestion.', ['reconnaît', 'dénonce']),
      dict('Selon les experts, il y aurait plus de trois cents ruches dans le centre-ville.', { voice: 'm' }),
    ],
    [
      b('News conditional = unconfirmed (on compterait, il y aurait).', 'Conditionnel journalistique = non confirmé (on compterait, il y aurait).'),
      b('prétendre = doubt; reconnaître = admit; affirmer, indiquer = neutral.', 'prétendre = doute ; reconnaître = admettre ; affirmer, indiquer = neutre.'),
      b('à condition de / que = provided that.', 'à condition de / que = si et seulement si.'),
    ],
    [['une ruche', b('a beehive', 'abri des abeilles')], ['un apiculteur', b('a beekeeper', 'éleveur d’abeilles')], ['une estimation', b('an estimate', 'évaluation approximative')]],
  ),
];
