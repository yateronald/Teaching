import type { CourseAbout, Doc } from '../../types';
import { b, card, doc, gap, lesson, mc, P, pairs, sort, tip, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Executive summaries, methodology sections, tables of results, recommendations: reports and studies are the formal texts of professional and academic life. This course trains you on three original documents (a public consultation report, a study on remote work, a set of recommendations) to read a methodology critically, interpret results and their limits, and understand the formal vocabulary of recommendations (il est recommandé de, il conviendrait de, à cet égard).',
    'Résumés, sections méthodologiques, tableaux de résultats, recommandations : les rapports et les études sont les textes formels de la vie professionnelle et universitaire. Ce cours vous entraîne sur trois documents originaux (un rapport de consultation publique, une étude sur le télétravail, une série de recommandations) pour lire une méthodologie avec un œil critique, interpréter des résultats et leurs limites, et comprendre le vocabulaire soutenu des recommandations (il est recommandé de, il conviendrait de, à cet égard).',
  ),
  outcomes: [
    b('Understand the structure of a report', 'Comprendre la structure d’un rapport'),
    b('Read a methodology critically', 'Lire une méthodologie avec un œil critique'),
    b('Interpret results and their limits', 'Interpréter des résultats et leurs limites'),
    b('Understand and write formal recommendations', 'Comprendre et rédiger des recommandations soutenues'),
  ],
};

const SUMMARY: Doc = { look: 'page', title: b('Report: executive summary', 'Rapport : résumé'), text: 'RÉSUMÉ\n\nLa présente consultation visait à recueillir l’avis des résidents sur le réaménagement du parc riverain. Au total, 1 240 personnes ont répondu au questionnaire en ligne et 85 ont participé aux ateliers. Une large majorité (72 %) se prononce en faveur d’un accès élargi à la rivière, tandis que 54 % s’opposent à l’ajout de stationnements. Les préoccupations principales portent sur la sécurité des enfants et la préservation des arbres matures. Le rapport formule sept recommandations à l’intention du conseil municipal.' };
const STUDY: Doc = { look: 'page', title: b('Study: method and results', 'Étude : méthode et résultats'), text: 'Méthodologie : l’étude repose sur un questionnaire administré à 600 employés de trois entreprises de services, complété par 20 entretiens semi-dirigés. Les participants étaient volontaires.\n\nRésultats : 68 % des répondants déclarent être plus productifs en télétravail, mais 41 % font état d’un sentiment d’isolement. Les employés ayant de jeunes enfants signalent davantage de difficultés à séparer vie professionnelle et vie privée.\n\nLimites : l’échantillon, composé de volontaires issus du seul secteur des services, ne saurait être considéré comme représentatif de l’ensemble des travailleurs.' };
const RECO: Doc = { look: 'page', title: b('Recommendations', 'Recommandations'), text: 'Recommandation 1 : Il est recommandé d’instaurer au moins deux journées de présence commune par semaine afin de préserver la cohésion des équipes.\nRecommandation 2 : Il conviendrait de former les gestionnaires à l’encadrement à distance.\nRecommandation 3 : À cet égard, un droit à la déconnexion devrait être inscrit dans la politique interne, en particulier après 18 h.\nRecommandation 4 : Une évaluation des mesures sera réalisée au terme d’une période de douze mois.' };

const C = 'r-reports-studies';
export default [
  lesson(C, 1, ['executive-summary', 'le-resume'],
    b('The executive summary', 'Le résumé d’un rapport'),
    b('Extract the purpose, method, main results and outputs from a summary.', 'Extraire l’objectif, la méthode, les principaux résultats et les suites d’un résumé.'),
    [b('Find the purpose and the method', 'Repérer l’objectif et la méthode'), b('Read percentages accurately', 'Lire les pourcentages avec précision'), b('Understand formal reporting verbs', 'Comprendre les verbes soutenus du rapport')],
    13,
    [
      card(b('A formal register', 'Un registre soutenu'), b('Reports use: **la présente consultation / étude** (this), **visait à** (aimed to), **recueillir** (to collect), **se prononcer en faveur de / contre** (to be in favour of / against), **porter sur** (to concern), **formuler des recommandations**, **à l’intention de** (for, addressed to).', 'Les rapports emploient : **la présente consultation / étude**, **visait à**, **recueillir**, **se prononcer en faveur de / contre**, **porter sur**, **formuler des recommandations**, **à l’intention de**.')),
      doc(SUMMARY, b('What was the purpose of the consultation?', 'Quel était l’objectif de la consultation ?'), [b('To collect residents’ opinions on redesigning the riverside park', 'Recueillir l’avis des résidents sur le réaménagement du parc riverain'), b('To build a car park', 'Construire un stationnement'), b('To cut down trees', 'Abattre des arbres'), b('To elect a council', 'Élire un conseil')]),
      doc(SUMMARY, b('What do 54% of respondents oppose?', 'À quoi 54 % des répondants s’opposent-ils ?'), [b('Adding parking spaces', 'L’ajout de stationnements'), b('Access to the river', 'L’accès à la rivière'), b('Children’s safety', 'La sécurité des enfants'), b('The workshops', 'Les ateliers')]),
      doc(SUMMARY, b('To whom are the recommendations addressed?', 'À qui les recommandations sont-elles destinées ?'), [b('The city council', 'Au conseil municipal'), b('The residents', 'Aux résidents'), b('The children', 'Aux enfants'), b('The journalists', 'Aux journalistes')]),
      pairs(P.match, [['viser à', b('to aim to', 'avoir pour but de')], ['recueillir', b('to collect, to gather', 'rassembler')], ['se prononcer en faveur de', b('to come out in favour of', 'soutenir')], ['à l’intention de', b('for, addressed to', 'destiné à')]]),
      gap(P.complete, 'Les préoccupations ___ sur la sécurité des enfants ; le rapport ___ sept recommandations.', ['portent', 'formule']),
    ],
    [
      b('Summary = purpose, method, results, recommendations.', 'Résumé = objectif, méthode, résultats, recommandations.'),
      b('viser à, recueillir, porter sur, se prononcer en faveur de.', 'viser à, recueillir, porter sur, se prononcer en faveur de.'),
      b('à l’intention de = addressed to.', 'à l’intention de = destiné à.'),
    ],
    [['le réaménagement', b('redesign, redevelopment', 'nouvel aménagement')], ['riverain', b('riverside', 'au bord de la rivière')], ['une préoccupation', b('a concern', 'inquiétude')]],
  ),
  lesson(C, 2, ['method-results-limits', 'methode-resultats-limites'],
    b('Method, results and limits', 'Méthode, résultats et limites'),
    b('Evaluate how a study was conducted and how far its results can be generalised.', 'Évaluer la conduite d’une étude et la portée de ses résultats.'),
    [b('Understand the sample and the tools', 'Comprendre l’échantillon et les outils'), b('Interpret results with nuance', 'Interpréter les résultats avec nuance'), b('Understand the limits of a study', 'Comprendre les limites d’une étude')],
    13,
    [
      tip(b('Always read the limits', 'Lisez toujours les limites'), b('A study is only as good as its **échantillon** (sample). Is it **représentatif**? Were participants **volontaires** (self-selected)? **ne saurait être considéré comme** = cannot be considered as.', 'Une étude ne vaut que par son **échantillon**. Est-il **représentatif** ? Les participants étaient-ils **volontaires** ? **ne saurait être considéré comme** = ne peut être considéré comme.')),
      doc(STUDY, b('Which tools did the study use?', 'Quels outils l’étude a-t-elle utilisés ?'), [b('A questionnaire and semi-structured interviews', 'Un questionnaire et des entretiens semi-dirigés'), b('Only interviews', 'Seulement des entretiens'), b('Medical tests', 'Des tests médicaux'), b('Observation in homes', 'Une observation à domicile')]),
      doc(STUDY, b('Which result is a drawback of remote work?', 'Quel résultat est un inconvénient du télétravail ?'), [b('41% report feeling isolated.', '41 % font état d’un sentiment d’isolement.'), b('68% feel more productive.', '68 % se disent plus productifs.'), b('600 employees answered.', '600 employés ont répondu.'), b('Participants were volunteers.', 'Les participants étaient volontaires.')]),
      doc(STUDY, b('Why can the results not be generalised?', 'Pourquoi les résultats ne peuvent-ils pas être généralisés ?'), [b('The sample is made of volunteers from one sector only.', 'L’échantillon ne comprend que des volontaires d’un seul secteur.'), b('There were too many participants.', 'Il y avait trop de participants.'), b('The questions were in English.', 'Les questions étaient en anglais.'), b('The study lasted too long.', 'L’étude a duré trop longtemps.')]),
      sort(b('Method, result or limit?', 'Méthode, résultat ou limite ?'), [b('method', 'méthode'), b('result', 'résultat'), b('limit', 'limite')], [['un questionnaire à 600 employés', 0], ['68 % se disent plus productifs', 1], ['un échantillon non représentatif', 2], ['20 entretiens semi-dirigés', 0], ['41 % se sentent isolés', 1], ['des participants volontaires', 2]]),
      pairs(P.match, [['un échantillon', b('a sample', 'groupe étudié')], ['représentatif', b('representative', 'qui reflète l’ensemble')], ['un entretien semi-dirigé', b('a semi-structured interview', 'entretien guidé mais ouvert')], ['faire état de', b('to report', 'mentionner')]]),
      mc(P.meaning, [b('cannot be considered as', 'ne peut pas être considéré comme'), b('does not know how to be', 'ne sait pas comment être'), b('should be considered as', 'doit être considéré comme'), b('is clearly', 'est clairement')], { fr: 'ne saurait être considéré comme représentatif' }),
    ],
    [
      b('Method: échantillon, questionnaire, entretiens, volontaires.', 'Méthode : échantillon, questionnaire, entretiens, volontaires.'),
      b('Results: déclarent, font état de, signalent (self-reported).', 'Résultats : déclarent, font état de, signalent (déclaratifs).'),
      b('Limits: non représentatif, ne saurait être considéré comme…', 'Limites : non représentatif, ne saurait être considéré comme…'),
    ],
    [['un répondant', b('a respondent', 'personne qui répond')], ['l’isolement', b('isolation', 'solitude')], ['issu de', b('coming from', 'provenant de')]],
  ),
  lesson(C, 3, ['recommendations', 'les-recommandations'],
    b('Formal recommendations', 'Les recommandations'),
    b('Understand and write recommendations in a formal register.', 'Comprendre et rédiger des recommandations dans un registre soutenu.'),
    [b('Understand il est recommandé de, il conviendrait de', 'Comprendre il est recommandé de, il conviendrait de'), b('Understand purpose and follow-up', 'Comprendre le but et le suivi'), b('Write two recommendations', 'Rédiger deux recommandations')],
    13,
    [
      card(b('Recommending formally', 'Recommander de façon soutenue'), b('**Il est recommandé de / Il est proposé de** + infinitive; **Il conviendrait de** (it would be appropriate to); **devrait être** + participle; **afin de / afin que** (purpose); **à cet égard** (in this respect); **au terme de** (at the end of).', '**Il est recommandé de / Il est proposé de** + infinitif ; **Il conviendrait de** ; **devrait être** + participe ; **afin de / afin que** (but) ; **à cet égard** ; **au terme de**.')),
      doc(RECO, b('Why maintain two shared office days?', 'Pourquoi maintenir deux journées de présence commune ?'), [b('To preserve team cohesion', 'Pour préserver la cohésion des équipes'), b('To save money', 'Pour économiser de l’argent'), b('To train managers', 'Pour former les gestionnaires'), b('To stop remote work', 'Pour arrêter le télétravail')]),
      doc(RECO, b('What is the « droit à la déconnexion »?', 'Qu’est-ce que le « droit à la déconnexion » ?'), [b('The right not to answer work messages outside hours', 'Le droit de ne pas répondre aux messages professionnels hors des heures'), b('The right to cancel internet', 'Le droit de résilier internet'), b('The right to leave the company', 'Le droit de quitter l’entreprise'), b('The right to work at night', 'Le droit de travailler la nuit')]),
      doc(RECO, b('When will the measures be evaluated?', 'Quand les mesures seront-elles évaluées ?'), [b('After twelve months', 'Au terme de douze mois'), b('Immediately', 'Immédiatement'), b('Every week', 'Chaque semaine'), b('Never', 'Jamais')]),
      pairs(P.match, [['il conviendrait de', b('it would be appropriate to', 'il serait souhaitable de')], ['à cet égard', b('in this respect', 'sur ce point')], ['au terme de', b('at the end of', 'à la fin de')], ['instaurer', b('to introduce, to establish', 'mettre en place')]]),
      write(b('Write recommendations.', 'Rédigez des recommandations.'), b('Based on the study, write two formal recommendations for a company that is introducing remote work.', 'À partir de l’étude, rédigez deux recommandations soutenues pour une entreprise qui met en place le télétravail.'), 40, 80,
        [b('Il est recommandé de / Il conviendrait de', 'Il est recommandé de / Il conviendrait de'), b('A purpose (afin de, afin que)', 'Un but (afin de, afin que)'), b('A formal connector (à cet égard, en outre)', 'Un connecteur soutenu (à cet égard, en outre)'), b('A follow-up or evaluation', 'Un suivi ou une évaluation')],
        'Il est recommandé de prévoir des rencontres d’équipe régulières en présentiel afin de limiter le sentiment d’isolement signalé par 41 % des répondants. En outre, il conviendrait d’offrir un soutien particulier aux parents de jeunes enfants, par exemple des horaires flexibles. Ces mesures devraient faire l’objet d’une évaluation au terme de six mois.',
        { phrases: ['Il est recommandé de…', 'afin de…', 'En outre, il conviendrait de…', 'devraient faire l’objet de…', 'au terme de…'] }),
    ],
    [
      b('Il est recommandé de / Il conviendrait de + infinitive.', 'Il est recommandé de / Il conviendrait de + infinitif.'),
      b('Purpose: afin de / afin que (+ subjunctive).', 'But : afin de / afin que (+ subjonctif).'),
      b('à cet égard, en outre, au terme de.', 'à cet égard, en outre, au terme de.'),
    ],
    [['la cohésion', b('cohesion', 'unité')], ['l’encadrement', b('management, supervision', 'direction d’une équipe')], ['la déconnexion', b('disconnection', 'fait de se déconnecter')]],
  ),
];
