import type { CourseAbout } from '../../types';
import { b, card, dlg, doc, gap, hear, lesson, mc, P, pairs, say, sort, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Presenting numbers in a business review requires more than translating figures: you must comment on dashboards accurately (points de pourcentage vs pour cent), separate seasonal drivers from structural trends, handle sceptical finance questions and link insights to actionable recommendations. This B2 course trains analysts, managers and consultants to turn data into persuasive French.',
    'Présenter des chiffres en comité exige bien plus que lire un tableau : il faut commenter des indicateurs avec exactitude (points de pourcentage ou pour cent), isoler l’effet saisonnier de la tendance de fond, répondre aux objections d’un directeur financier et relier chaque constat à une recommandation. Ce cours de niveau B2 prépare analystes, cadres et consultants à faire parler les données en français.',
  ),
  outcomes: [
    b('Read KPI dashboards and comment precisely on charts and margins', 'Lire un tableau de bord et commenter courbes, marges et ratios'),
    b('Distinguish percentage changes from percentage-point gaps', 'Distinguer variation relative (%) et écart en points de pourcentage'),
    b('Explain drivers, seasonality and offsetting effects to tough questions', 'Expliquer facteurs, saisonnalité et effets compensateurs face aux questions'),
    b('Frame strategic recommendations with ROI and trade-offs', 'Formuler des recommandations chiffrées avec retour sur investissement'),
  ],
};

const C = 'bz-data-consulting';
export default [
  lesson(C, 1, ['kpis-and-chart-commentary', 'indicateurs-et-graphiques'],
    b('KPIs and precise chart commentary', 'Indicateurs clés et commentaire de graphiques'),
    b('Describe margins, conversion rates and multi-year trends accurately in French.', 'Commenter chiffre d’affaires, marge, conversion et tendances avec précision.'),
    [b('Use core KPI vocabulary (CA, marge brute, attrition)', 'Maîtriser CA, marge brute, conversion, attrition'), b('Distinguish pour cent (%) and points de pourcentage', 'Distinguer % et points de pourcentage'), b('Read a quarterly dashboard summary', 'Lire un tableau de bord trimestriel')],
    13,
    [
      card(b('KPI and precision traps', 'Indicateurs et piège des pourcentages'), b('Key KPIs: **le chiffre d’affaires (CA)** = revenue · **la marge brute** = gross margin · **le taux de conversion / d’attrition** = conversion / churn rate · **en glissement annuel** = year-on-year. Watch **pour cent** vs **points** : moving from 20 % to 23 % is **+3 points de pourcentage** (a +15 % relative rise)!', 'Indicateurs : **chiffre d’affaires (CA)**, **marge brute**, **taux de conversion / d’attrition**, **en glissement annuel**. Attention : passer de 20 % à 23 % représente **+3 points de pourcentage** (et +15 % en relatif) !')),
      doc({ look: 'page', title: b('Q3 Commercial Dashboard', 'Tableau de bord — T3'), text: 'PERFORMANCE T3 (en glissement annuel)\n\n• Chiffre d’affaires | 4,2 M€ (+11 %)\n• Marge brute | 38 % (-2 points vs T3 N-1)\n• Taux de conversion en ligne | 3,6 % (+0,6 point)\n• Taux d’attrition clients | 4,1 % (stable)\n\nNote : hausse du coût logistique compensée partiellement par un panier moyen supérieur.' }, b('What happened to the gross margin compared with last year’s Q3?', 'Comment a évolué la marge brute par rapport au T3 de l’an dernier ?'), [b('It fell by 2 percentage points (from 40% to 38%).', 'Elle a reculé de 2 points (passant de 40 % à 38 %).'), b('It rose by 11% year-on-year.', 'Elle a augmenté de 11 % en glissement annuel.'), b('It remained completely flat at 4.1%.', 'Elle est restée stable à 4,1 %.'), b('It doubled thanks to online conversion.', 'Elle a doublé grâce à la conversion en ligne.')]),
      hear('En glissement annuel, notre chiffre d’affaires progresse de onze pour cent pour atteindre quatre millions deux, mais notre marge brute recule de deux points en raison des coûts de transport.', b('What explains the two-point dip in gross margin?', 'Qu’est-ce qui explique le recul de deux points de la marge brute ?'), [b('Transport costs', 'Les coûts de transport'), b('A drop in online conversion', 'Une baisse de la conversion en ligne'), b('Higher customer churn', 'Une hausse de l’attrition client'), b('Lower average basket size', 'Une baisse du panier moyen')], { voice: 'f' }),
      pairs(P.match, [['le chiffre d’affaires', b('revenue, turnover', 'total des ventes')], ['en glissement annuel', b('year-on-year (YoY)', 'comparé au même trimestre N-1')], ['le taux d’attrition', b('customer churn rate', 'part des clients perdus')], ['le panier moyen', b('average order value', 'montant moyen d’un achat')]]),
      gap(P.complete, 'Le taux de conversion est passé de 3,0 % à 3,6 %, soit une hausse de 0,6 ___ de ___.', ['point', 'pourcentage']),
      say('En glissement annuel, le chiffre d’affaires progresse de onze pour cent, malgré un recul de deux points de marge.', 'Year-on-year, revenue grows by eleven per cent, despite a two-point margin dip.'),
    ],
    [
      b('Use « points de pourcentage » when comparing two percentages (38 % vs 40 % = -2 points).', 'Dites « points » pour comparer deux pourcentages (40 % → 38 % = -2 points).'),
      b('En glissement annuel = year-on-year comparison (T3 N vs T3 N-1).', 'En glissement annuel = comparaison sur la même période un an avant.'),
      b('Marge brute = gross margin; panier moyen = average basket; attrition = churn.', 'Marge brute, panier moyen, taux d’attrition.'),
    ],
    [['le chiffre d’affaires', b('revenue, sales turnover', 'montant total des ventes')], ['la marge brute', b('gross margin', 'écart entre ventes et coût direct')], ['l’attrition', b('churn, attrition', 'perte de clients')]],
  ),
  lesson(C, 2, ['explaining-variances-and-drivers', 'expliquer-les-ecarts'],
    b('Explaining variances, seasonality and drivers', 'Expliquer écarts, saisonnalité et facteurs'),
    b('Attribute causes cleanly, separate one-off effects and answer CFO scrutiny.', 'Expliquer les facteurs d’un écart et répondre aux questions d’un comité.'),
    [b('Use causal connectors (s’expliquer par, tenir à)', 'Employer s’expliquer par, découler de, tenir à'), b('Separate structural trends from seasonal / one-off effects', 'Distinguer tendance de fond et effet ponctuel'), b('Defend data nuance under questioning', 'Répondre avec précision aux questions financières')],
    13,
    [
      card(b('Analytical connectors', 'Relier causes, compensations et nuances'), b('Attribute: **Cet écart s’explique principalement par… · Ce recul tient à un effet saisonnier.** Offset: **Cette baisse est en partie compensée / contrebalancée par…** Baseline: **À périmètre constant** (on a like-for-like basis) · **Hors effet exceptionnel** (excluding one-off items).', 'Cause : **S’expliquer principalement par… · Tenir à un effet saisonnier.** Compensation : **Compensé / contrebalancé par…** Base comparable : **À périmètre constant** · **Hors effet exceptionnel**.')),
      dlg(b('Quarterly business review', 'Revue trimestrielle avec la direction financière'), undefined, [['Directeur financier', 'm'], ['Vous (consultante)', 'f']], [
        [0, 'Votre graphique montre un décrochage en août sur le segment entreprises. Faut-il s’inquiéter ?', 'Your chart shows a drop in August on the enterprise segment. Should we worry?'],
        [1, { options: ['À périmètre constant, la tendance reste positive : le creux d’août tient surtout à un effet saisonnier, compensé dès septembre par la signature de trois grands comptes.', 'Oui, c’est terrible, tout s’effondre.', 'Je n’ai pas regardé les chiffres d’août.'] }],
        [0, 'Et la hausse des coûts de livraison, est-elle ponctuelle ou durable ?', 'And the rise in delivery costs—is it one-off or lasting?'],
        [1, { options: ['Environ la moitié résulte de la hausse tarifaire du transporteur, qui est structurelle ; le reste vient d’envois express exceptionnels.', 'Tout va baisser tout seul l’an prochain.', 'C’est impossible à savoir.'] }],
      ]),
      sort(b('Temporary / one-off or structural driver?', 'Facteur ponctuel ou tendance structurelle ?'), [b('seasonal / one-off', 'ponctuel / saisonnier'), b('structural / lasting', 'structurel / durable')], [['un effet saisonnier d’août', 0], ['une hausse tarifaire durable du transporteur', 1], ['un envoi express exceptionnel', 0], ['une progression continue de la conversion', 1]]),
      mc(P.meaning, [b('on a like-for-like basis (same store / scope)', 'à base comparable, sans nouveau périmètre'), b('with twice as many offices added', 'en doublant le nombre de filiales'), b('without checking past years', 'sans comparer aux années précédentes'), b('at fixed winter prices', 'à prix d’hiver fixes')], { fr: 'à périmètre constant' }),
      pairs(P.match, [['un décrochage', b('a sharp drop-off', 'chute nette')], ['contrebalancé par', b('offset by', 'compensé par')], ['tenir à', b('to stem from, be due to', 'avoir pour cause')], ['ponctuel', b('one-off, temporary', 'limité dans le temps')]]),
      gap(P.complete, 'À périmètre ___, ce creux saisonnier est largement ___ par les ventes de septembre.', ['constant', 'compensé']),
    ],
    [
      b('À périmètre constant = like-for-like (apples to apples).', 'À périmètre constant = comparaison à base égale.'),
      b('Distinguish seasonal / one-off dips (ponctuel) from structural shifts (structurel).', 'Séparez toujours l’effet ponctuel de la tendance structurelle.'),
      b('Use « compensé / contrebalancé par » to show the full net picture.', 'Utilisez « compensé par » pour montrer l’équilibre global.'),
    ],
    [['à périmètre constant', b('like-for-like', 'sur une base comparable')], ['un décrochage', b('a sudden dip, drop', 'baisse marquée')], ['contrebalancer', b('to offset, counterbalance', 'compenser un effet')]],
  ),
  lesson(C, 3, ['defending-recommendations', 'defendre-ses-recommandations'],
    b('Defending data-backed recommendations', 'Défendre des recommandations chiffrées'),
    b('Turn data findings into clear scenarios, ROI arguments and action plans.', 'Transformer les données en scénarios, calcul de ROI et plan d’action.'),
    [b('Compare options with ROI and opportunity cost', 'Comparer options avec ROI et coût d’opportunité'), b('Structure recommendations from insight to action', 'Relier constat chiffré et action prioritaire'), b('Write an executive data recommendation note', 'Rédiger une note de recommandation fondée sur les chiffres')],
    13,
    [
      card(b('From insight to recommendation', 'Du constat à la recommandation'), b('Structure consulting prose cleanly: **Constat** (*Les données montrent que…*) → **Option recommandée** (*Nous préconisons de prioriser…*) → **Impact attendu / ROI** (*Ce scénario permettrait un retour sur investissement sous 6 mois, contre un coût d’opportunité élevé si l’on reporte…*) → **Prochaine étape**.', '**Constat** → **Préconisation** (*Nous recommandons de prioriser…*) → **Impact / ROI** (*retour sur investissement sous 6 mois*, *coût d’opportunité*) → **Prochaine étape**.')),
      mc(P.best, ['Compte tenu de la hausse de 18 % du panier sur mobile, nous préconisons d’allouer 60 % du budget T4 à l’optimisation du tunnel d’achat mobile.', 'Achetez plein de publicités partout sans mesurer.', 'Les chiffres sont jolis sur les graphiques.', 'Peut-être qu’on pourrait ne rien changer pendant deux ans.'], { fr: 'Quelle recommandation relie le mieux donnée chiffrée et décision ?' }),
      pairs(P.match, [['préconiser', b('to recommend formally', 'recommander avec arguments')], ['le retour sur investissement', b('return on investment (ROI)', 'gain rapporté au coût')], ['le coût d’opportunité', b('opportunity cost', 'ce qu’on perd en n’agissant pas')], ['allouer un budget', b('to allocate a budget', 'affecter des fonds')]]),
      gap(P.complete, 'Nous ___ de prioriser le canal mobile, dont le retour sur ___ est estimé à quatre mois.', ['préconisons', 'investissement']),
      write(b('Data recommendation brief', 'Note de recommandation chiffrée'), b('Write a crisp consulting recommendation note (65–105 words) based on Q3 data: state two key facts (+11% revenue, -2 points gross margin due to express shipping), recommend two concrete actions (renegotiating carrier rates and raising the free-shipping threshold from 50 € to 70 €), and give the expected margin gain (+1.5 points within 6 months).', 'Rédigez une note de recommandation (65–105 mots) à partir du bilan T3 : rappelez deux constats (+11 % de CA, -2 points de marge brute liés aux envois express), préconisez deux leviers (renégocier le contrat transporteur et relever le seuil de franco de port de 50 € à 70 €), et indiquez l’impact attendu (+1,5 point de marge sous 6 mois).'), 65, 105, [
        b('Two Q3 figures accurately cited', 'Deux chiffres du T3 rappelés avec exactitude'),
        b('Two concrete levers recommended', 'Deux actions concrètes préconisées'),
        b('Expected margin gain and timeframe stated', 'Gain de marge attendu et horizon précisés'),
      ], 'Objet : Plan d’action marge brute — T4\n\nAu T3, notre chiffre d’affaires a progressé de 11 % en glissement annuel, mais notre marge brute a reculé de 2 points sous l’effet des coûts logistiques et des envois express.\n\nPour redresser cet indicateur sans freiner la croissance, nous préconisons deux leviers prioritaires : renégocier les tarifs avec notre transporteur principal et relever le seuil de livraison gratuite de 50 € à 70 €.\n\nSelon nos simulations, ce plan permettrait de regagner 1,5 point de marge brute dans un délai de six mois, avec un retour sur investissement immédiat.'),
      say('Nous préconisons de relever le seuil de livraison gratuite afin de regagner un point et demi de marge.', 'We recommend raising the free-shipping threshold in order to win back one and a half margin points.'),
    ],
    [
      b('Always bridge: figure → driver → concrete action → quantified impact.', 'Reliez toujours : chiffre → facteur → action → impact chiffré.'),
      b('Préconiser = recommend professionally; levier = actionable lever.', 'Préconiser = recommander ; levier = moyen d’action concret.'),
      b('Show opportunity cost or payback window to justify budget choices.', 'Appuyez vos choix sur le délai de retour sur investissement.'),
    ],
    [['préconiser', b('to recommend, advise', 'recommander formellement')], ['un levier', b('a lever, driver for action', 'moyen d’action efficace')], ['le franco de port', b('free-shipping threshold', 'livraison offerte dès un montant')]],
  ),
];
