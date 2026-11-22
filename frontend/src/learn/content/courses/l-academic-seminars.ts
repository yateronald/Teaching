import type { CourseAbout } from '../../types';
import { b, card, dict, dlg, hear, lesson, mc, P, pairs, sort, tip } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'University seminars, doctoral roundtables and research panels pack abstract concepts, methodological cautions and polite academic sparring into fast spoken turns. A speaker may praise a study in one breath before dismantling its sample bias in the next. This C1 course trains you to follow research hypotheses, scholarly debate and questions from the floor.',
    'Les séminaires universitaires, colloques et tables rondes condensent concepts abstraits, précautions méthodologiques et échanges courtois mais incisifs. Un chercheur peut saluer une étude avant d’en critiquer le biais d’échantillonnage la seconde suivante. Ce cours de niveau C1 vous entraîne à suivre hypothèses, débats académiques et questions du public.',
  ),
  outcomes: [
    b('Identify research hypotheses, variables and methodological limits', 'Repérer hypothèses, variables et limites méthodologiques'),
    b('Follow scholarly hedging, concessions and polite refutations', 'Suivre nuances académiques, concessions et réfutations polies'),
    b('Decode multi-part audience questions and how speakers pivot', 'Décoder les questions à plusieurs volets et les réponses des intervenants'),
    b('Synthesise competing academic stances cleanly', 'Synthétiser avec précision des positions scientifiques divergentes'),
  ],
};

const C = 'l-academic-seminars';
export default [
  lesson(C, 1, ['framing-hypotheses-and-methodology', 'formuler-hypotheses-et-methodologie'],
    b('Framing hypotheses and research methodology', 'Hypothèses et méthodologie de recherche'),
    b('Track starting assumptions, sample limits and correlation vs causation in seminars.', 'Suivre postulats, limites d’échantillon et corrélation vs causalité en séminaire.'),
    [b('Identify the speaker’s central hypothesis (postulat)', 'Identifier le postulat ou l’hypothèse centrale'), b('Catch methodological caveats (biais, corpus)', 'Saisir les réserves méthodologiques (biais, corpus)'), b('Distinguish correlation from causation', 'Distinguer corrélation et lien de causalité')],
    13,
    [
      card(b('Academic framing language', 'Le cadrage scientifique à l’oral'), b('Researchers signal scope carefully: **notre postulat de départ** (starting premise), **à titre d’hypothèse** (as a working hypothesis), **un biais d’échantillonnage** (sampling bias), **corrélation n’est pas causalité** (correlation isn’t causation), **dans la limite de notre corpus** (within the scope of our dataset).', 'Les chercheurs délimitent leur propos : **notre postulat de départ**, **à titre d’hypothèse**, **un biais d’échantillonnage**, **corrélation n’est pas causalité**, **dans la limite de notre corpus**.'), {
        ex: [['Les données suggèrent une corrélation sans établir de causalité directe.', 'The data suggest a correlation without establishing direct causation.'], ['Notre échantillon surreprésente les grandes métropoles.', 'Our sample overrepresents major cities.']],
      }),
      hear('Notre étude part d’un postulat simple : l’accès aux bibliothèques de quartier favoriserait la réussite scolaire. Toutefois, notre échantillon ne couvrant que trois villes moyennes, il serait imprudent d’extrapoler à l’échelle nationale.', b('What limitation does the researcher underline?', 'Quelle limite la chercheuse souligne-t-elle ?'), [b('The sample covers only three mid-sized towns and cannot be generalised nationwide', 'L’échantillon ne couvre que trois villes moyennes et ne peut être généralisé'), b('The libraries refused to share attendance records', 'Les bibliothèques ont refusé de fournir leurs données'), b('The premise was disproven before data collection started', 'Le postulat a été réfuté avant la collecte'), b('Only rural villages were surveyed in the study', 'Seuls des villages ruraux ont été enquêtés')], { voice: 'f' }),
      hear('On observe certes une corrélation nette entre ces deux variables, mais garder en tête qu’un tiers facteur, comme le niveau socio-économique, pourrait expliquer l’ensemble du phénomène.', b('What methodological caution is given here?', 'Quelle prudence méthodologique est rappelée ici ?'), [b('A third factor such as socioeconomic status may explain both variables', 'Un troisième facteur comme le statut socio-économique peut tout expliquer'), b('The first variable definitely causes the second', 'La première variable cause à coup sûr la seconde'), b('Statistical correlations are always invalid in sociology', 'Les corrélations statistiques sont toujours fausses'), b('The dataset contains calculation errors', 'Les données contiennent des erreurs de calcul')], { voice: 'm' }),
      hear('Avant de conclure, je voudrais souligner un biais de sélection majeur : seuls les volontaires déjà intéressés par la transition écologique ont répondu au questionnaire.', b('What caused the selection bias?', 'D’où vient le biais de sélection ?'), [b('Only volunteers already interested in ecology filled in the survey', 'Seuls des volontaires déjà sensibles à l’écologie ont répondu'), b('The questions were translated poorly', 'Les questions étaient mal traduites'), b('Half the questionnaires were lost in transit', 'La moitié des questionnaires a été perdue'), b('Respondents lied about their ages', 'Les répondants ont menti sur leur âge')], { voice: 'f2' }),
      sort(b('Research claim or methodological limit?', 'Hypothèse / résultat ou limite méthodologique ?'), [b('hypothesis / finding', 'hypothèse / constat'), b('methodological limit', 'limite méthodologique')], [['à titre d’hypothèse de travail', 0], ['un biais d’échantillonnage manifeste', 1], ['les résultats convergent vers un modèle', 0], ['il faut se garder d’extrapoler', 1], ['notre postulat initial se vérifie', 0], ['le corpus reste trop restreint', 1]], { listen: true }),
      pairs(P.match, [['un postulat', b('a premise / starting assumption', 'principe posé au départ')], ['un biais de sélection', b('selection bias', 'déformation de l’échantillon')], ['extrapoler', b('to extrapolate, overgeneralise', 'étendre au-delà des données')], ['un corpus', b('a body of data / texts', 'ensemble de documents étudiés')]]),
      dict('À ce stade, gardons-nous d’extrapoler au-delà de notre corpus.', { voice: 'm2' }),
    ],
    [
      b('postulat = premise; corpus = dataset/text collection.', 'postulat = hypothèse de départ ; corpus = ensemble étudié.'),
      b('corrélation ≠ causalité: look for third confounding factors.', 'corrélation ≠ causalité : guettez le tiers facteur.'),
      b('se garder d’extrapoler = avoid overgeneralising.', 'se garder d’extrapoler = ne pas généraliser trop vite.'),
    ],
    [['un postulat', b('a premise, postulate', 'proposition admise au départ')], ['un biais', b('a bias, skew', 'distorsion systématique')], ['extrapoler', b('to extrapolate', 'généraliser hors du cadre')]],
  ),
  lesson(C, 2, ['panel-exchanges-and-nuance', 'echanges-en-table-ronde'],
    b('Navigating panel exchanges and scholarly nuance', 'Suivre une table ronde et ses nuances'),
    b('Catch polite disagreement, partial concessions and conceptual reframing in roundtables.', 'Repérer désaccords polis, concessions partielles et recadrages conceptuels.'),
    [b('Hear polite rebuttal markers (loin de moi l’idée)', 'Repérer les formules de réfutation courtoise'), b('Track how speakers build on or pivot from a colleague', 'Suivre rebonds et recentrages entre intervenants'), b('Identify fine distinctions in register and stance', 'Cerner nuances et réserves académiques')],
    13,
    [
      card(b('Academic diplomacy', 'La diplomatie universitaire'), b('Scholars rarely shout « You’re wrong! ». Instead listen for: **Loin de moi l’idée de contester…** (Far be it from me to dispute…), **Pour rebondir sur ce que disait…** (Building on what X said…), **Je nuancerais toutefois ce constat** (I would qualify that observation), **Sous réserve que…** (Provided that…).', 'À l’université, on dit rarement « Vous avez tort ! ». Repérez : **Loin de moi l’idée de contester…**, **Pour rebondir sur ce que disait…**, **Je nuancerais toutefois ce constat**, **Sous réserve que…**.'), {
        ex: [['Dans une certaine mesure, cet argument tient.', 'To a certain extent, that argument holds.'], ['Encore faut-il préciser à quelle échelle on se place.', 'One must still clarify which scale we are looking at.']],
      }),
      tip(b('Watch for « toutefois »', 'Guettez le « toutefois »'), b('When a panelist spends ten seconds praising a colleague’s data, wait for **toutefois / néanmoins / en revanche**: the real disagreement always starts right after that pivot!', 'Lorsqu’un intervenant loue les travaux d’un collègue pendant dix secondes, attendez **toutefois / néanmoins / en revanche** : le véritable désaccord commence juste après ce pivot !')),
      hear('Loin de moi l’idée de minimiser l’apport des travaux de Claire sur la mobilité urbaine ; je nuancerais toutefois son optimisme quant à l’effet immédiat des pistes cyclables en périphérie.', b('What is the speaker’s stance toward Claire’s work?', 'Quelle est la position de l’intervenant face aux travaux de Claire ?'), [b('Respectful of her contribution, but sceptical about rapid suburban bike-lane impact', 'Respectueux de son apport, mais sceptique sur l’effet rapide en périphérie'), b('Completely dismissive of her entire research career', 'Totalement méprisant envers l’ensemble de ses travaux'), b('In full agreement without any reservation', 'Totalement d’accord sans aucune réserve'), b('Critical because she forgot to study urban transport', 'Critique parce qu’elle aurait oublié la mobilité urbaine')], { voice: 'm2' }),
      hear('Pour rebondir sur l’intervention précédente, j’ajouterais que la gratuité des transports ne suffit pas, sous réserve qu’on améliore d’abord la fréquence des rames.', b('What condition does she attach to free transit?', 'Quelle condition pose-t-elle à la gratuité des transports ?'), [b('Train frequency must be improved first', 'Il faut d’abord améliorer la fréquence des rames'), b('Ticket prices should actually double', 'Les billets devraient en réalité doubler'), b('Only night buses should be free', 'Seuls les bus de nuit devraient être gratuits'), b('Nothing else is needed beyond zero fares', 'Rien d’autre n’est nécessaire')], { voice: 'f' }),
      dlg(b('Roundtable on urban heat', 'Table ronde sur la chaleur urbaine'), b('Two researchers exchange views at an architecture symposium.', 'Deux chercheurs échangent lors d’un colloque d’architecture.'), [['Modératrice', 'f2'], ['Chercheur', 'm']], [
        [0, 'Monsieur Delacroix, les toits végétalisés suffisent-ils à rafraîchir nos centres-villes ?', 'Mr Delacroix, are green roofs enough to cool our city centres?'],
        [1, 'Ils y contribuent, c’est indéniable. Toutefois, à l’échelle d’une rue entière, l’ombre des arbres reste bien plus décisive.', 'They help, undeniably. However, at street level, tree shade remains far more decisive.'],
        [0, { options: ['Vous proposez donc de combiner les deux approches plutôt que de les opposer ?', 'Vous démentez donc l’utilité des arbres en ville ?', 'Alors il faut supprimer tous les toits ?'] }],
        [1, 'Exactement : aucune solution isolée ne règle l’îlot de chaleur à elle seule.', 'Exactly: no single measure solves the urban heat island on its own.'],
      ]),
      pairs(P.match, [['loin de moi l’idée de', b('far be it from me to', 'je ne cherche nullement à')], ['rebondir sur', b('to build on, follow up on', 'enchaîner à partir de')], ['nuancer', b('to qualify, temper', 'apporter des précisions modérées')], ['sous réserve que', b('provided that, subject to', 'à la condition que')]]),
      dict('Je nuancerais toutefois ce constat à l’échelle régionale.', { voice: 'f2' }),
    ],
    [
      b('Loin de moi l’idée de… + toutefois = polite pivot into disagreement.', 'Loin de moi l’idée de… + toutefois = pivot poli vers la critique.'),
      b('rebondir sur = pick up and extend a previous point.', 'rebondir sur = prolonger le propos précédent.'),
      b('sous réserve que (+ subjunctive) = on condition that.', 'sous réserve que (+ subjonctif) = à condition que.'),
    ],
    [['nuancer', b('to qualify, add nuance', 'modérer un jugement')], ['indéniable', b('undeniable', 'qu’on ne peut nier')], ['à l’échelle de', b('at the scale of', 'au niveau de')]],
  ),
  lesson(C, 3, ['questions-from-the-floor', 'questions-du-public-et-synthese'],
    b('Handling questions from the floor and synthesising', 'Questions du public et synthèse'),
    b('Follow complex audience questions, multi-part answers and closing summaries.', 'Suivre questions du public en plusieurs volets, réponses et synthèses finales.'),
    [b('Unpack two-part questions from the floor', 'Décomposer une question à deux volets'), b('Recognise how speakers narrow scope or admit gaps', 'Repérer quand l’orateur recentre ou admet une limite'), b('Capture the closing takeaway (en guise de synthèse)', 'Saisir la conclusion (en guise de synthèse)')],
    13,
    [
      card(b('Q&A and closing summaries', 'Questions du public et synthèse'), b('Audience members often bundle remarks before their real question: **Ma question comporte deux volets** (My question has two parts), **Vous avez brièvement évoqué…** (You briefly touched on…). Speakers respond cleanly with: **Sur le premier point…**, **Faute de données probantes** (for lack of conclusive data), **En guise de synthèse** (by way of synthesis).', 'Dans le public, on enrobe souvent la vraie question : **Ma question comporte deux volets**, **Vous avez brièvement évoqué…**. Les orateurs répondent par : **Sur le premier point…**, **Faute de données probantes**, **En guise de synthèse**.'), {
        ex: [['Vous m’avez posé deux questions : je commence par la seconde.', 'You asked me two questions: I’ll start with the second.'], ['Faute de données longitudinales, la prudence s’impose.', 'Lacking longitudinal data, caution is required.']],
      }),
      hear('Ma question s’adresse aux deux intervenants et comporte deux volets : d’abord, comment financez-vous la numérisation de ces archives, et ensuite, qui en gardera l’accès libre ?', b('What two topics does the audience member ask about?', 'Sur quels deux points porte la question du public ?'), [b('Funding for digitisation and free access governance', 'Le financement de la numérisation et le maintien de l’accès libre'), b('Staff salaries and building heating costs', 'Les salaires et le chauffage du bâtiment'), b('Copyright law in cinema and radio ads', 'Le droit d’auteur au cinéma et la radio'), b('Ticket prices and seminar registration deadlines', 'Le tarif d’entrée et les inscriptions au colloque')], { voice: 'm2' }),
      hear('Votre remarque sur les archives sonores est tout à fait pertinente. Cela dit, faute de données probantes sur la période antérieure à 1980, je me garderai d’avancer un chiffre précis aujourd’hui.', b('How does the speaker handle the question?', 'Comment l’intervenante répond-elle à la question ?'), [b('She validates the point, then declines to give a figure for lack of solid pre-1980 data', 'Elle salue la remarque puis refuse de chiffrer faute de données solides avant 1980'), b('She claims the question is completely off-topic', 'Elle juge la question totalement hors sujet'), b('She provides exact figures going back to 1950', 'Elle cite des chiffres exacts depuis 1950'), b('She promises to email the audience member yesterday', 'Elle promet d’écrire hier au participant')], { voice: 'f' }),
      mc(P.best, [b('« En guise de synthèse, retenons que l’outil numérique complète l’archive papier sans jamais la remplacer. »', '« En guise de synthèse, retenons que l’outil numérique complète l’archive papier sans jamais la remplacer. »'), b('« Sur le premier volet, vous n’avez pas écouté ma diapositive. »', '« Sur le premier volet, vous n’avez pas écouté ma diapositive. »'), b('« Bon, j’ai oublié la deuxième partie de votre question. »', '« Bon, j’ai oublié la deuxième partie de votre question. »'), b('« Au revoir, le café vous attend dans le hall. »', '« Au revoir, le café vous attend dans le hall. »')], { fr: 'Quelle phrase convient pour conclure une table ronde ?' }),
      sort(b('Audience question move or speaker response move?', 'Mouvement de question ou de réponse ?'), [b('audience question', 'question du public'), b('speaker response', 'réponse de l’orateur')], [['Ma question comporte deux volets.', 0], ['Sur le premier point, je dirais que…', 1], ['Vous avez brièvement évoqué ce cas.', 0], ['Faute de données probantes, restons prudents.', 1], ['Ne craignez-vous pas un biais inverse ?', 0], ['En guise de synthèse, trois points dominent.', 1]], { listen: true }),
      pairs(P.match, [['un volet', b('a part, facet (of a question)', 'partie d’une question ou d’un plan')], ['probant', b('conclusive, convincing (evidence)', 'qui prouve clairement')], ['en guise de synthèse', b('by way of synthesis / summary', 'pour résumer l’ensemble')], ['pertinent', b('relevant, on point', 'juste et adapté au sujet')]]),
      dict('Faute de données probantes, je me garderai d’avancer un chiffre.', { voice: 'm' }),
    ],
    [
      b('un volet = one prong/part of a question or report.', 'un volet = une composante d’une question.'),
      b('faute de données probantes = lacking conclusive evidence.', 'faute de données probantes = par manque de preuves solides.'),
      b('en guise de synthèse = signalling the final takeaway.', 'en guise de synthèse = annonce du bilan final.'),
    ],
    [['probant', b('conclusive, convincing', 'qui constitue une preuve')], ['un volet', b('a part, facet', 'aspect ou partie')], ['en guise de', b('by way of, as', 'pour servir de')]],
  ),
];
