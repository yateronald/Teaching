import type { CourseAbout } from '../../types';
import { b, dict, doc, exam, gap, hear, lesson, mc, P, pairs, sort, tip } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Moving from A2 to DELF B1 means moving from simple facts to understanding opinions, reasons, comparisons and attitude across longer radio reports, workplace discussions and press articles. This course trains every B1 comprehension strategy: separating facts from feelings, reading comparison and contrast signals (cependant, alors que, contrairement à), and decoding multi-speaker interviews.',
    'Passer du A2 au DELF B1 signifie passer des faits simples à la compréhension des opinions, causes, comparaisons et attitudes dans des chroniques radio plus longues, des échanges professionnels et des articles de presse. Ce cours entraîne chaque stratégie B1 : distinguer faits et sentiments, repérer les marqueurs d’opposition (cependant, alors que, contrairement à) et suivre des entretiens à plusieurs voix.',
  ),
  outcomes: [
    b('Identify speaker feelings, satisfaction and criticism in B1 audio', 'Repérer satisfaction, hésitation et critique dans l’oral B1'),
    b('Track causes, consequences and contrast markers in articles', 'Suivre causes, conséquences et oppositions dans un article'),
    b('Recognise indirect opinions and nuanced answers', 'Reconnaître opinions nuancées et accords partiels'),
    b('Pace the 25-minute listening and 45-minute reading papers', 'Gérer les 25 min d’écoute et 45 min de lecture'),
  ],
};

const C = 'delf-b1-comprehension';
export default [
  lesson(C, 1, ['tracking-opinions-in-b1-audio', 'reperer-les-opinions-a-l-oral-b1'],
    b('Listening: speakers, attitudes and reasons', 'Écoute : intervenants, attitudes et raisons'),
    b('Follow longer B1 interviews and identify whether a speaker approves, doubts or disagrees.', 'Suivre des entretiens B1 plus longs et cerner accord, doute ou désaccord.'),
    [b('Identify positive, mixed or negative tone', 'Identifier un ton positif, mitigé ou critique'), b('Hear contrast signals: certes, mais, pourtant', 'Repérer certes, mais, pourtant à l’oral'), b('Summarise the main reason given', 'Résumer la raison principale donnée')],
    13,
    [
      exam(b('What DELF B1 listening tests', 'Ce qu’évalue l’oral du DELF B1'), b('Expect three recordings of **1 to 3 minutes**: an **everyday conversation**, a **radio interview or report**, and a **short talk**. Questions no longer just ask *when* or *where*: they ask **what a speaker thinks**, **why something changed**, and **what the speaker’s attitude is** (**satisfait, inquiet, déçu, hésitant**).', 'Trois enregistrements d’**1 à 3 minutes** : une **conversation courante**, un **entretien ou reportage radio**, et un **exposé**. Les questions ne demandent plus seulement *où* ou *quand*, mais **ce que pense le locuteur**, **pourquoi la situation a changé** et **son attitude** (**satisfait, inquiet, déçu, hésitant**).')),
      hear('Honnêtement, l’ouverture de la piste cyclable a rendu le quartier beaucoup plus calme. Cela dit, plusieurs commerçants perdent des clients parce qu’il n’y a plus de places pour se garer juste devant leurs vitrines.', b('What is the speaker’s view on the bike lane?', 'Quel est l’avis du locuteur sur la piste cyclable ?'), [b('Mixed: quieter street, but fewer nearby parking spots for shops', 'Mitigé : rue plus calme, mais moins de stationnement pour les commerces'), b('Fully enthusiastic with no drawbacks', 'Totalement enthousiaste sans aucune réserve'), b('He thinks bicycles should be banned', 'Il pense qu’il faut interdire les vélos'), b('Shopkeepers asked for the lane themselves', 'Ce sont les commerçants qui ont demandé la piste')], { voice: 'm' }),
      hear('Avant, je travaillais quarante-cinq heures au bureau et je passais dix heures dans les embouteillages. Depuis que je fais deux jours de télétravail, j’ai retrouvé de l’énergie et je dîne enfin avec mes enfants.', b('What has changed since she started working remotely two days a week?', 'Qu’est-ce qui a changé depuis qu’elle télétravaille deux jours par semaine ?'), [b('She feels more energetic and has family dinners again.', 'Elle a plus d’énergie et retrouve ses dîners en famille.'), b('She works forty-five hours exclusively from home.', 'Elle travaille quarante-cinq heures uniquement de chez elle.'), b('Traffic jams got worse near her office.', 'Les embouteillages ont empiré près de son bureau.'), b('She changed companies completely.', 'Elle a changé complètement d’entreprise.')], { voice: 'f' }),
      sort(b('Speaker attitude', 'Attitude du locuteur'), [b('satisfied / supportive', 'satisfait / favorable'), b('mixed / cautious', 'nuancé / réservé'), b('critical / disappointed', 'critique / déçu')], [['C’est une vraie réussite !', 0], ['C’est utile, cela dit…', 1], ['On nous avait promis bien mieux.', 2], ['J’avoue que je reste sceptique.', 1], ['Je suis ravi du résultat.', 0], ['C’est une perte de temps totale.', 2]]),
      pairs(P.match, [['cela dit', b('that said', 'néanmoins')], ['mitigé', b('mixed (feelings)', 'partagé, ni tout pour ni tout contre')], ['un embouteillage', b('a traffic jam', 'bouchon sur la route')], ['rester sceptique', b('to remain sceptical', 'douter encore')]]),
      dict('Cela dit, je reste un peu sceptique quant aux résultats annoncés ce matin.', { voice: 'f2' }),
    ],
    [
      b('Words like « cela dit », « certes… mais », « en revanche » signal a nuanced/mixed opinion.', '« Cela dit », « certes… mais », « en revanche » annoncent un avis nuancé.'),
      b('Listen for before/after markers (« avant… depuis que… ») to track changes.', 'Repérez les marqueurs avant/après (« avant… depuis que… »).'),
      b('Do not decide from the first sentence alone—the twist often follows « mais ».', 'Ne concluez pas dès la première phrase : le tournant arrive souvent après « mais ».'),
    ],
    [['une vitrine', b('a shop window', 'fenêtre d’un magasin')], ['le télétravail', b('remote work', 'travail à distance')], ['retrouver de l’énergie', b('to regain energy', 'se sentir plus en forme')]],
  ),
  lesson(C, 2, ['reading-comparisons-and-arguments-b1', 'lire-comparaisons-et-arguments-b1'],
    b('Reading: comparing options and following arguments', 'Lecture : comparer et suivre un texte argumentatif'),
    b('Read workplace procedures, articles and reviews, spotting advantages, drawbacks and author purpose.', 'Lire articles, modes d’emploi pro et critiques en repérant avantages, limites et but.'),
    [b('Track cause and contrast connectors', 'Suivre connecteurs de cause et d’opposition'), b('Spot advantages vs drawbacks', 'Distinguer avantages et inconvénients'), b('Understand the author’s main purpose', 'Cerner l’objectif principal d’un texte')],
    13,
    [
      doc({ look: 'article', title: b('Four-day workweek trial', 'L’essai de la semaine de quatre jours'), text: 'Soixante entreprises de la région ont testé la semaine de trente-deux heures sans baisse de salaire. Après six mois, l’absentéisme a diminué de 22 % et les employés se disent moins stressés. Cependant, dans les services d’accueil ouverts six jours sur sept, l’organisation des plannings demande davantage de personnel, ce qui augmente les coûts.' }, b('What problem does the article mention for customer-facing desks?', 'Quelle difficulté l’article signale-t-il pour les services d’accueil ?'), [b('Scheduling requires extra staff, increasing costs.', 'Organiser les plannings demande plus de personnel, ce qui coûte plus cher.'), b('Salaries were cut by twenty-two per cent.', 'Les salaires ont baissé de 22 %.'), b('Employees became more stressed after six months.', 'Les employés sont devenus plus stressés.'), b('None of the sixty companies finished the trial.', 'Aucune des soixante entreprises n’a fini l’essai.')]),
      doc({ look: 'article', title: b('Critique de film — Le Dernier Train', 'Critique de film — Le Dernier Train'), text: 'Le réalisateur filme avec sensibilité le quotidien d’une petite gare de province. Les acteurs sont touchants et la musique accompagne discrètement chaque scène. On regrettera toutefois une dernière demi-heure beaucoup trop lente, qui affaiblit l’émotion construite au début.' }, b('What weakness does the reviewer point out?', 'Quel défaut le critique relève-t-il ?'), [b('The final half-hour slows down too much and weakens the emotion.', 'La dernière demi-heure est trop lente et affaiblit l’émotion.'), b('The actors lack emotion throughout the film.', 'Les acteurs manquent d’émotion pendant tout le film.'), b('The music is far too loud.', 'La musique est beaucoup trop forte.'), b('The story moves too quickly from start to finish.', 'L’histoire va beaucoup trop vite du début à la fin.')]),
      tip(b('Spot the concession structure', 'Repérer la structure concessive'), b('In B1 reviews and press articles, **praise often comes first**, then **« toutefois / cependant / on regrettera »** introduces the **limitation**. That second half is frequently tested!', 'Dans les critiques et articles B1, **l’éloge vient souvent d’abord**, puis **« toutefois / cependant / on regrettera »** introduit la **réserve**. C’est souvent ce point qui est interrogé !')),
      gap(P.complete, 'Les résultats sont encourageants ; ___ (however), le coût reste élevé, ___ (because) il faut embaucher deux personnes ___ (without) réduire les horaires d’ouverture.', ['cependant', 'car', 'sans'], { choices: [['cependant', 'donc', 'd’ailleurs'], ['car', 'mais', 'bien que'], ['sans', 'pour', 'malgré']] }),
      pairs(P.match, [['davantage de', b('more (of)', 'plus de')], ['affaiblir', b('to weaken', 'rendre moins fort')], ['toutefois', b('however', 'cependant')], ['l’absentéisme', b('absenteeism', 'fait d’être souvent absent')]]),
    ],
    [
      b('Contrast markers (« cependant, toutefois, on regrettera ») point straight to limits or exceptions.', '« Cependant, toutefois, on regrettera » signalent directement limites ou réserves.'),
      b('Distinguish overall positive judgment from specific criticism.', 'Séparez le bilan global positif d’une critique précise.'),
      b('Trace pronoun links (« ce qui augmente… ») back to their full clause.', 'Reliez les pronoms (« ce qui augmente… ») à l’idée qui précède.'),
    ],
    [['une baisse de salaire', b('a pay cut', 'diminution du salaire')], ['un planning', b('a work schedule', 'emploi du temps')], ['un réalisateur', b('a film director', 'celui qui dirige le film')]],
  ),
  lesson(C, 3, ['full-b1-reading-drills', 'entrainement-lecture-b1-complet'],
    b('Exam timing and full B1 reading drills', 'Gestion du temps et lecture B1'),
    b('Synthesise workplace emails and informational articles within the 45-minute window.', 'Analyser courriels de travail et textes informatifs dans les 45 minutes de l’épreuve.'),
    [b('Handle long B1 procedural documents', 'Lire des documents pratiques longs'), b('Separate fact from hypothesis', 'Distinguer fait et hypothèse'), b('Keep calm on dense questions', 'Rester méthodique sur les questions denses')],
    13,
    [
      doc({ look: 'email', title: b('Note RH — Nouveau logiciel de congés', 'Note RH — Nouveau logiciel de congés'), text: 'Bonjour à toute l’équipe,\nÀ partir du 1er mars, toutes les demandes de congés passeront par l’outil « MonEspace ». Les demandes envoyées par courriel ne seront plus traitées après le 28 février. En cas de problème de connexion, contactez le support informatique avant d’envoyer votre dossier papier au service RH.\nMerci de votre collaboration.' }, b('What happens if you email a leave request on March 3rd?', 'Que se passe-t-il si vous envoyez une demande de congé par courriel le 3 mars ?'), [b('It will not be processed; you must use MonEspace.', 'Elle ne sera pas traitée ; il faut utiliser MonEspace.'), b('HR will manually convert it into MonEspace.', 'Les RH la saisiront dans MonEspace.'), b('It takes priority over online requests.', 'Elle est prioritaire sur le portail en ligne.'), b('Only IT support can approve your leave.', 'Seul le support informatique valide les congés.')]),
      doc({ look: 'article', title: b('Réparer plutôt que jeter', 'Réparer plutôt que jeter'), text: 'De plus en plus de communes ouvrent des « cafés de réparation » un samedi par mois. Des bénévoles aident gratuitement les habitants à réparer grille-pain, vélos ou vêtements. Selon l’association locale, près de 65 % des appareils apportés repartent en état de marche, ce qui évite des tonnes de déchets et crée du lien entre générations.' }, b('Who carries out the repairs in these cafés?', 'Qui aide à faire les réparations dans ces cafés ?'), [b('Volunteers working free of charge', 'Des bénévoles qui interviennent gratuitement'), b('Paid municipal mechanics', 'Des techniciens payés par la mairie'), b('Shop owners selling spare parts', 'Des vendeurs de pièces détachées'), b('Students passing an electronics test', 'Des étudiants en examen')], { explain: b('« Des bénévoles aident gratuitement les habitants ».', '« Des bénévoles aident gratuitement les habitants ».') }),
      mc(P.best, ['Part 1 (matching criteria, ~10 min) → Part 2 (main informative text, ~20 min) → quick 5-min check of justifications', 'Spend 35 minutes translating Part 1 word by word', 'Do the justifications without checking the line in the text', 'Skip Part 1 completely until 2 minutes remain'], { fr: 'Quelle stratégie gère le mieux les 45 minutes de compréhension des écrits B1 ?' }),
      sort(b('Purpose of each B1 text', 'Intention de chaque texte B1'), [b('explain a new rule', 'expliquer une règle'), b('report a social trend', 'décrire une tendance'), b('weigh pros & cons', 'peser le pour et le contre')], [['Note RH : nouveau portail obligatoire dès mars.', 0], ['Cafés de réparation : 65 % d’appareils sauvés.', 1], ['La semaine de 4 jours réduit le stress mais coûte plus cher.', 2], ['Les courriels envoyés après le 28 février sont refusés.', 0], ['Critique de film : beaux acteurs mais fin lente.', 2]]),
      dict('Près de soixante-cinq pour cent des appareils repartent en état de marche grâce aux bénévoles.', { voice: 'f' }),
    ],
    [
      b('In Part 1 of DELF B1 reading (~10 min), lock in all matching criteria cleanly.', 'En partie 1 du DELF B1 (~10 min), validez chaque critère avant de passer.'),
      b('Notice deadlines like « après le 28 février » and exceptions like « en cas de… ».', 'Repérez dates limites (« après le 28 février ») et exceptions (« en cas de… »).'),
      b('Use the last 5 minutes strictly to re-check copied justifications and tricky options.', 'Gardez 5 minutes à la fin pour vérifier justifications et questions délicates.'),
    ],
    [['un bénévole', b('a volunteer', 'personne qui aide sans être payée')], ['traiter une demande', b('to process a request', 'examiner un dossier')], ['en état de marche', b('in working order', 'qui fonctionne bien')]],
  ),
];
