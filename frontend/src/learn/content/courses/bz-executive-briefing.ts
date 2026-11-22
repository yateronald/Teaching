import type { CourseAbout } from '../../types';
import { b, card, dlg, doc, gap, hear, lesson, mc, P, pairs, say, sort, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'At the C1 executive level, senior leaders expect clarity within thirty seconds: the core strategic stake upfront, crisp trade-offs backed by risk awareness, and a decisive path to alignment. Long chronological preambles lose the boardroom. This course trains you to read and structure executive briefing notes, align diverging directors in high-stakes meetings, use C-suite verbs (acter, entériner, arbitrer) and draft concise board memos.',
    'Au niveau C1 en direction, vos interlocuteurs attendent l’essentiel dès les trente premières secondes : l’enjeu stratégique d’emblée, des arbitrages nets éclairés par les risques et une feuille de route fédératrice. Les longs préambules chronologiques diluent l’impact. Ce cours vous forme à structurer une note de synthèse pour comité de direction, aligner des parties prenantes et rédiger un briefing stratégique.',
  ),
  outcomes: [
    b('Structure executive briefings using conclusion-first pyramid logic', 'Structurer une note de direction en commençant par l’essentiel'),
    b('Synthesise competing views and steer boardroom alignment', 'Synthétiser des avis divergents et obtenir un arbitrage en comité'),
    b('Master high-register leadership verbs (acter, entériner, diligenter)', 'Maîtriser le lexique de direction (acter, entériner, diligenter)'),
    b('Draft concise C1 strategic decision memos for senior leadership', 'Rédiger une note décisionnelle C1 concise et percutante'),
  ],
};

const C = 'bz-executive-briefing';
export default [
  lesson(C, 1, ['the-executive-summary', 'la-note-de-synthese'],
    b('The executive briefing: conclusion first', 'La note de synthèse : l’essentiel d’emblée'),
    b('Lead with the strategic decision, key trade-offs and financial horizon.', 'Ouvrir par la décision attendue, les arbitrages et l’horizon financier.'),
    [b('Apply conclusion-first executive framing', 'Placer enjeu et arbitrage dès l’introduction'), b('Read a board briefing note cleanly', 'Analyser une note à l’attention du Comité de direction'), b('Master board vocabulary (enjeu, horizon, cap)', 'Maîtriser enjeu, cap stratégique, horizon, levier')],
    13,
    [
      card(b('Conclusion-first executive framing', 'L’art de la synthèse de direction'), b('Boards reject suspense: put **l’objet et l’arbitrage attendu** first (**L’enjeu consiste à… · La présente note vise à soumettre au Comité…**). Then summarise **trois options** with **impact financier**, **risque majeur** and **recommandation** (*Option B privilégiée à horizon 18 mois*).', 'En direction, bannissez le suspense : placez **l’objet et l’arbitrage** en tête (**La présente note soumet au Comité…**). Présentez ensuite **options**, **impact**, **risque majeur** et **recommandation** (*à horizon 18 mois*).')),
      doc({ look: 'page', title: b('Board briefing note', 'Note au Comité de direction'), text: 'OBJET : Arbitrage — Implantation d’un pôle logistique à Lyon\n\nDécision attendue : autoriser un investissement de 1,8 M€ d’ici le 15 juin pour sécuriser notre capacité à horizon 24 mois.\n\nConstat : nos deux sites actuels saturent à 94 % de capacité, entraînant 180 k€ de surcoûts trimestriels.\nOptions : A) Sous-traiter à court terme (flexible mais coûteux) ; B) Louer et équiper un site dédié à Lyon (seuil de rentabilité à 16 mois).\nRecommandation : retenir l’option B sous réserve d’un bail assorti d’une clause de sortie à trois ans.' }, b('Why is Option B recommended over Option A?', 'Pourquoi l’option B est-elle recommandée plutôt que l’option A ?'), [b('It pays off within 16 months while resolving structural capacity limits.', 'Elle devient rentable en 16 mois tout en réglant durablement la saturation.'), b('It requires zero initial investment.', 'Elle n’exige aucun investissement initial.'), b('It avoids signing any commercial lease.', 'Elle dispense de signer un bail commercial.'), b('It eliminates 94% of Lyon staff.', 'Elle supprime 94 % des effectifs.')]),
      hear('Avant d’entrer dans le détail financier, je rappelle l’enjeu : sans extension de capacité d’ici l’automne, nous ne pourrons pas absorber la hausse prévue des commandes. Nous proposons donc d’acter dès ce matin le principe d’un troisième site, à horizon dix-huit mois.', b('What does the speaker want the board to agree on this morning?', 'Que demande l’orateur au comité dès ce matin ?'), [b('Approving in principle a third site within an 18-month horizon', 'Acter le principe d’un troisième site à horizon 18 mois'), b('Postponing the financial analysis until autumn', 'Reporter l’analyse financière à l’automne'), b('Rejecting incoming orders this quarter', 'Refuser la hausse des commandes ce trimestre'), b('Examining every technical invoice first', 'Analyser d’abord chaque facture technique')], { voice: 'm' }),
      pairs(P.match, [['en amont', b('upfront, ahead of time', 'dès le début / en préparation')], ['à horizon 18 mois', b('over an 18-month timeframe', 'd’ici dix-huit mois')], ['le seuil de rentabilité', b('break-even point', 'moment où l’investissement est couvert')], ['assorti d’une clause', b('paired with / subject to a clause', 'accompagné d’une condition')]]),
      gap(P.complete, 'La présente note vise à ___ au Comité l’arbitrage relatif à notre capacité à ___ deux ans.', ['soumettre', 'horizon']),
      say('L’essentiel en amont : nos sites saturent et nous recommandons d’acter l’option B dès aujourd’hui.', 'The bottom line upfront: our sites are saturated and we recommend approving Option B today.'),
    ],
    [
      b('Open board notes with expected decision + timeframe + core stake.', 'Ouvrez par : décision attendue + horizon + enjeu central.'),
      b('Seuil de rentabilité = break-even; assorti de = accompanied by a condition.', 'Seuil de rentabilité ; assorti d’une clause.'),
      b('Compare options crisply against risk and payback rather than listing anecdotes.', 'Comparez les options sur coût, risque et rentabilité, sans détails superflus.'),
    ],
    [['un enjeu', b('a strategic stake, challenge', 'ce qui est en jeu')], ['le seuil de rentabilité', b('break-even point', 'point d’équilibre financier')], ['en amont', b('upstream, upfront', 'avant la mise en œuvre')]],
  ),
  lesson(C, 2, ['aligning-stakeholders-and-steering-decisions', 'aligner-et-trancher'],
    b('Aligning stakeholders and steering decisions', 'Aligner les parties prenantes et trancher'),
    b('Bridge opposing executive priorities and lock in clear board decisions.', 'Concilier des priorités opposées et faire adopter une décision claire.'),
    [b('Reframe divergent C-suite priorities cleanly', 'Reformuler les priorités divergentes de la direction'), b('Propose staged governance gates (clause de revoyure)', 'Proposer des jalons de contrôle (point d’étape, revoyure)'), b('Master executive verbs (acter, entériner, diligenter)', 'Employer acter, entériner, diligenter avec justesse')],
    13,
    [
      card(b('Boardroom alignment language', 'Aligner et formaliser une décision'), b('Bridge views: **Si je synthétise les deux impératifs — maîtrise de la trésorerie et rapidité commerciale — …** Steer decision: **Pouvons-nous acter le principe sous réserve d’une clause de revoyure à 90 jours ? · Nous entérinons cette feuille de route. · Je demande que l’on diligente un audit rapide.**', 'Concilier : **Si je croise vos deux impératifs…** Trancher : **Pouvons-nous acter le principe avec clause de revoyure ? · Entériner la feuille de route · Diligenter un audit.**')),
      dlg(b('Executive committee alignment', 'Comité de direction'), undefined, [['Directrice financière', 'f'], ['Vous (Directeur des opérations)', 'm']], [
        [0, 'Je soutiens le projet de Lyon, mais immobiliser 1,8 M€ dès juin fragiliserait notre trésorerie estivale.', 'I support the Lyon project, but tying up 1.8 M€ in June would weaken our summer cash flow.'],
        [1, { options: ['Votre vigilance sur la trésorerie est essentielle. Pour concilier nos deux impératifs, nous pourrions échelonner les investissements en deux tranches et acter la première dès maintenant.', 'Non, la logistique passe avant les finances.', 'On verra bien si la trésorerie suffit.'] }],
        [0, 'Un déploiement en deux tranches serait beaucoup plus sain. Que déclencherait la seconde ?', 'A two-stage rollout would be much healthier. What would trigger the second stage?'],
        [1, { options: ['Une clause de revoyure à 90 jours : si le taux d’utilisation dépasse 80 %, nous entérinons la tranche deux en septembre.', 'Rien de précis, on décidera à l’instinct.', 'Elle sera automatique quoi qu’il arrive.'] }],
      ]),
      sort(b('Executive alignment move or unhelpful stalemate?', 'Formule d’alignement ou blocage stérile ?'), [b('constructively aligns', 'aligne et fait avancer'), b('creates stalemate', 'bloque la décision')], [['concilier vos deux impératifs', 0], ['c’est impossible, un point c’est tout', 1], ['acter le principe sous réserve d’un bilan à 90 jours', 0], ['ce n’est pas mon département', 1], ['échelonner l’investissement en deux tranches', 0]]),
      pairs(P.match, [['acter une décision', b('to formally record/approve a decision', 'valider officiellement')], ['entériner', b('to ratify, confirm formally', 'ratifier officiellement')], ['diligenter', b('to commission promptly', 'lancer rapidement une mission')], ['une clause de revoyure', b('a scheduled review gate', 'réexamen prévu à une date')]]),
      mc(P.meaning, [b('spread investments out over staggered instalments', 'répartir les dépenses sur plusieurs phases'), b('cancel every planned expense permanently', 'annuler toutes les dépenses prévues'), b('double the initial budget immediately', 'doubler le budget dès le départ'), b('borrow funds from a competitor', 'emprunter à un concurrent')], { fr: 'échelonner les investissements en deux tranches' }),
      gap(P.complete, 'Afin d’aligner finances et opérations, nous proposons d’___ la première tranche et de fixer une ___ à 90 jours.', ['acter', 'revoyure']),
    ],
    [
      b('Validate the opposing executive concern (« Votre vigilance est essentielle ») before bridging.', 'Reconnaissez l’impératif de l’autre direction avant de proposer un pont.'),
      b('Staged rollouts (échelonner) + review gates (clause de revoyure) unlock gridlock.', 'L’échelonnement et la clause de revoyure débloquent les arbitrages.'),
      b('Acter = put on record / agree; entériner = ratify; diligenter = trigger promptly.', 'Acter, entériner, diligenter : trois verbes clés du comité de direction.'),
    ],
    [['acter', b('to officially approve / put on record', 'enregistrer une décision')], ['entériner', b('to ratify, endorse formally', 'confirmer officiellement')], ['diligenter', b('to expedite, launch formally', 'faire exécuter sans délai')]],
  ),
  lesson(C, 3, ['crisis-and-strategy-memos', 'rediger-un-briefing-de-direction'],
    b('Drafting concise C1 executive decision memos', 'Rédiger un briefing stratégique C1'),
    b('Synthesise stakes, risk mitigation and governance in tight executive prose.', 'Condenser enjeux, maîtrise des risques et gouvernance en style C1.'),
    [b('Replace wordy narrative with executive nominalisation', 'Remplacer les récits verbeux par des tournures synthétiques'), b('Balance strategic ambition with clear governance guardrails', 'Allier ambition stratégique et garde-fous'), b('Write a C1 executive decision brief', 'Rédiger une note décisionnelle de niveau C1')],
    13,
    [
      card(b('C1 executive economy of style', 'Sobriété et densité du style C1'), b('Replace loose clauses with tight C1 syntax: instead of *« Comme nos clients se plaignent souvent parce que ça met trop de temps »*, write **Face à l’allongement des délais qui pénalise la satisfaction client…** Pair ambition with guardrails: **sous le pilotage de**, **assorti de garde-fous budgétaires**, **à due concurrence**.', 'Préférez les tournures denses : **Face à l’allongement des délais…**, **sous le pilotage de…**, **assorti de garde-fous budgétaires**, **à due concurrence**. Chaque mot doit éclairer la décision.')),
      mc(P.best, ['Afin de préserver la trésorerie tout en sécurisant notre croissance, nous recommandons un déploiement phasé assorti d’un comité mensuel de suivi.', 'On pense que ce serait peut-être pas mal d’y aller doucement si tout le monde veut bien.', 'Il y a beaucoup de problèmes mais aussi des idées sympas pour demain.', 'Nous attendons que la direction nous dise quoi faire sans proposition.'], { fr: 'Quelle conclusion convient le mieux à une note au Comité de direction ?' }),
      pairs(P.match, [['un déploiement phasé', b('a phased rollout', 'mise en œuvre par étapes')], ['un garde-fou', b('a safeguard, guardrail', 'limite protectrice')], ['piloter la transformation', b('to steer the transformation', 'diriger le changement')], ['à due concurrence', b('up to the corresponding amount', 'à hauteur de ce montant')]]),
      write(b('Executive decision brief', 'Note décisionnelle de direction'), b('Draft a concise C1 executive briefing memo (75–120 words) proposing the phased launch of an AI customer-support assistant: state the strategic objective (cutting ticket wait times by 40%), identify the main risk (inaccurate replies on sensitive cases) and guardrail (human validation mandatory), and propose a 90-day pilot for 20% of traffic before full rollout.', 'Rédigez une note de synthèse C1 (75–120 mots) proposant le lancement phasé d’un assistant support client : précisez l’enjeu (réduire de 40 % le délai de traitement), le risque majeur (réponses imprécises sur dossiers sensibles) avec son garde-fou (validation humaine obligatoire), puis proposez un pilote de 90 jours sur 20 % des flux avant généralisation.'), 75, 120, [
        b('Subject line and clear upfront strategic goal', 'Objet et enjeu stratégique dès l’ouverture'),
        b('Primary risk paired with concrete guardrail', 'Risque majeur associé à un garde-fou clair'),
        b('Phased pilot decision (90 days, 20%) + C1 economy', 'Pilote phasé et style soutenu concis'),
      ], 'Objet : Arbitrage — Déploiement phasé d’un assistant support client\n\nEnjeu : face à la hausse des demandes, l’intégration d’un assistant automatisé vise à réduire de 40 % les délais de traitement dès le second semestre.\n\nMaîtrise des risques : le principal écueil résidant dans le traitement de dossiers sensibles, l’outil se limitera à préparer des projets de réponse soumis à validation humaine obligatoire.\n\nDécision proposée : nous soumettons au Comité le lancement d’un pilote de 90 jours sur 20 % des flux entrants, assorti d’une clause de revoyure trimestrielle avant toute généralisation.'),
      gap(P.complete, 'Le pilote sera ___ de garde-fous stricts avant toute ___ à l’ensemble du réseau.', ['assorti', 'généralisation']),
      say('Nous soumettons au Comité un pilote de quatre-vingt-dix jours assorti d’une validation humaine systématique.', 'We are submitting to the Board a ninety-day pilot paired with systematic human review.'),
    ],
    [
      b('Nominalisation (« face à l’allongement des délais ») packs clarity into fewer words.', 'La nominalisation condense la cause sans alourdir la note.'),
      b('Boards approve bold moves much faster when paired with explicit guardrails.', 'Un garde-fou explicite rassure le comité et facilite la validation.'),
      b('Close with a concrete decision proposal: scope, duration and review gate.', 'Terminez par une proposition nette : périmètre, durée et revoyure.'),
    ],
    [['un garde-fou', b('a safeguard, guardrail', 'mesure de contrôle préventive')], ['phasé', b('phased, staged', 'réalisé par étapes')], ['la généralisation', b('company-wide rollout', 'extension à tout le périmètre')]],
  ),
];
