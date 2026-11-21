import type { CourseAbout } from '../../types';
import { b, card, dict, hear, lesson, P, pairs, sort, tip } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'The radio news gives you, in two minutes, a dozen pieces of information read fast and clearly: politics, economy, society, sport, weather. This course trains you on original news bulletins to catch the topic of each item, the key facts (who, what, where, how many), the figures and the journalistic expressions that come back every day.',
    'Le journal radio donne, en deux minutes, une douzaine d’informations lues vite et clairement : politique, économie, société, sport, météo. Ce cours vous entraîne sur des bulletins originaux pour saisir le sujet de chaque nouvelle, les faits clés (qui, quoi, où, combien), les chiffres et les expressions journalistiques qui reviennent chaque jour.',
  ),
  outcomes: [
    b('Identify the topic of each news item', 'Identifier le sujet de chaque nouvelle'),
    b('Catch the key facts and figures', 'Saisir les faits et les chiffres clés'),
    b('Understand journalistic expressions', 'Comprendre les expressions journalistiques'),
    b('Summarise a news item in one sentence', 'Résumer une nouvelle en une phrase'),
  ],
};

const C = 'l-radio-news';
export default [
  lesson(C, 1, ['news-topics', 'les-rubriques'],
    b('Identifying news topics', 'Identifier les rubriques'),
    b('Recognise the category of a news item in its first sentence.', 'Reconnaître la rubrique d’une nouvelle dès sa première phrase.'),
    [b('Recognise politics, economy, society, sport', 'Reconnaître politique, économie, société, sport'), b('Use key words to classify', 'Classer grâce aux mots clés'), b('Catch the headline', 'Saisir le titre')],
    13,
    [
      card(b('Key words by topic', 'Mots clés par rubrique'), b('**Politique**: le gouvernement, le ministre, l’élection, le projet de loi. **Économie**: les prix, l’inflation, l’emploi, la Bourse. **Société**: la santé, l’éducation, le logement. **Sport**: le match, la victoire, le championnat.', '**Politique** : le gouvernement, le ministre, l’élection, le projet de loi. **Économie** : les prix, l’inflation, l’emploi, la Bourse. **Société** : la santé, l’éducation, le logement. **Sport** : le match, la victoire, le championnat.')),
      hear('Le gouvernement a présenté ce matin un projet de loi pour encadrer les loyers.', b('Which topic?', 'Quelle rubrique ?'), [b('Politics / housing', 'Politique / logement'), b('Sport', 'Sport'), b('Weather', 'Météo'), b('Culture', 'Culture')]),
      hear('Le taux de chômage a reculé à cinq virgule deux pour cent le mois dernier.', b('What does the news say?', 'Que dit la nouvelle ?'), [b('Unemployment fell to 5.2%', 'Le chômage a baissé à 5,2 %'), b('Unemployment rose to 52%', 'Le chômage a monté à 52 %'), b('Prices fell 5%', 'Les prix ont baissé de 5 %'), b('Inflation is stable', 'L’inflation est stable')]),
      hear('Victoire des Canadiens hier soir, quatre à deux contre Toronto.', b('What was the score?', 'Quel était le score ?'), [b('4–2 for the Canadiens', '4 à 2 pour les Canadiens'), b('2–4 for Toronto', '2 à 4 pour Toronto'), b('4–4', '4 à 4'), b('2–0', '2 à 0')]),
      sort(b('Which topic?', 'Quelle rubrique ?'), [b('politics', 'politique'), b('economy', 'économie'), b('sport', 'sport')], [['le projet de loi', 0], ['l’inflation', 1], ['le championnat', 2], ['le ministre', 0], ['la Bourse', 1], ['la victoire', 2]], { listen: true }),
      pairs(P.match, [['un projet de loi', b('a bill', 'loi proposée')], ['le chômage', b('unemployment', 'absence d’emploi')], ['reculer', b('to fall, decline', 'baisser')], ['encadrer', b('to regulate', 'mettre des règles')]]),
      dict('Le gouvernement a présenté un projet de loi ce matin.', { voice: 'm' }),
    ],
    [
      b('First sentence = topic: listen for key words.', 'Première phrase = rubrique : écoutez les mots clés.'),
      b('Politics: projet de loi, ministre. Economy: chômage, inflation.', 'Politique : projet de loi, ministre. Économie : chômage, inflation.'),
      b('reculer = to fall; progresser = to rise.', 'reculer = baisser ; progresser = monter.'),
    ],
    [['l’inflation', b('inflation', 'hausse générale des prix')], ['une élection', b('an election', 'vote')], ['la Bourse', b('the stock market', 'marché financier')]],
  ),
  lesson(C, 2, ['facts-and-figures', 'faits-et-chiffres'],
    b('Facts and figures', 'Faits et chiffres'),
    b('Catch the who, what, where and how many in news items.', 'Saisir le qui, quoi, où et combien dans les nouvelles.'),
    [b('Catch numbers and percentages', 'Saisir nombres et pourcentages'), b('Catch places and people', 'Saisir lieux et personnes'), b('Understand cause and consequence', 'Comprendre cause et conséquence')],
    13,
    [
      tip(b('Prepare a mini-grid', 'Préparez une mini-grille'), b('For each news item: **Qui ? Quoi ? Où ? Combien ? Pourquoi ?** Note one word per box. The first sentence answers most of them.', 'Pour chaque nouvelle : **Qui ? Quoi ? Où ? Combien ? Pourquoi ?** Notez un mot par case. La première phrase répond à la plupart.')),
      hear('Un incendie a détruit trois maisons cette nuit à Saint-Jérôme. Aucun blessé n’est à déplorer.', b('What happened?', 'Que s’est-il passé ?'), [b('A fire destroyed three houses; nobody was hurt.', 'Un incendie a détruit trois maisons ; aucun blessé.'), b('Three people were injured.', 'Trois personnes ont été blessées.'), b('A house was sold.', 'Une maison a été vendue.'), b('Thirty houses burned.', 'Trente maisons ont brûlé.')]),
      hear('Le prix de l’essence a augmenté de douze cents le litre en une semaine, en raison de la hausse du prix du pétrole.', b('Why did petrol prices rise?', 'Pourquoi le prix de l’essence a-t-il augmenté ?'), [b('Because oil prices went up', 'À cause de la hausse du prix du pétrole'), b('Because of a strike', 'À cause d’une grève'), b('Because of taxes', 'À cause des taxes'), b('Because of the weather', 'À cause de la météo')]),
      hear('Plus de quinze mille personnes ont participé dimanche à la marche pour le climat dans les rues de Montréal.', b('How many people took part?', 'Combien de personnes ont participé ?'), [b('More than 15,000', 'Plus de 15 000'), b('About 1,500', 'Environ 1 500'), b('50,000', '50 000'), b('5,000', '5 000')]),
      pairs(P.match, [['un incendie', b('a fire', 'feu destructeur')], ['aucun blessé', b('no one injured', 'personne de blessé')], ['une marche', b('a march', 'manifestation à pied')], ['l’essence', b('petrol, gas', 'carburant')]]),
      sort(b('Cause or consequence?', 'Cause ou conséquence ?'), [b('cause', 'cause'), b('consequence', 'conséquence')], [['hausse du prix du pétrole', 0], ['essence plus chère', 1], ['tempête de verglas', 0], ['écoles fermées', 1]]),
      dict('Plus de quinze mille personnes ont participé à la marche.', { voice: 'f' }),
    ],
    [
      b('Grid: Qui ? Quoi ? Où ? Combien ? Pourquoi ?', 'Grille : Qui ? Quoi ? Où ? Combien ? Pourquoi ?'),
      b('en raison de / à cause de = cause.', 'en raison de / à cause de = cause.'),
      b('Aucun blessé n’est à déplorer = nobody was injured.', 'Aucun blessé n’est à déplorer = personne n’a été blessé.'),
    ],
    [['détruire', b('to destroy', 'démolir')], ['le pétrole', b('oil (crude)', 'huile minérale')], ['participer', b('to take part', 'prendre part')]],
  ),
  lesson(C, 3, ['journalistic-expressions', 'expressions-journalistiques'],
    b('Journalistic expressions and summaries', 'Expressions journalistiques et résumés'),
    b('Understand the recurring expressions of the news and summarise an item.', 'Comprendre les expressions récurrentes du journal et résumer une nouvelle.'),
    [b('Understand selon, d’après, il semblerait que', 'Comprendre selon, d’après, il semblerait que'), b('Understand the news conditional', 'Comprendre le conditionnel de l’actualité'), b('Summarise an item', 'Résumer une nouvelle')],
    13,
    [
      card(b('Recurring expressions', 'Expressions récurrentes'), b('**selon / d’après** (according to), **il semblerait que** (it seems), **le bilan s’alourdit** (the toll rises), **sur fond de** (against a background of), **en marge de** (on the sidelines of), and the **conditional** for unconfirmed facts (**l’accident aurait fait deux blessés**).', '**selon / d’après**, **il semblerait que**, **le bilan s’alourdit**, **sur fond de**, **en marge de**, et le **conditionnel** pour les faits non confirmés (**l’accident aurait fait deux blessés**).')),
      hear('Selon la police, le conducteur aurait perdu le contrôle de son véhicule à cause de la glace.', b('Is the cause confirmed?', 'La cause est-elle confirmée ?'), [b('No, it is the police’s hypothesis (conditional).', 'Non, c’est l’hypothèse de la police (conditionnel).'), b('Yes, it is certain.', 'Oui, c’est certain.'), b('The driver confirmed it.', 'Le conducteur l’a confirmée.'), b('There was no ice.', 'Il n’y avait pas de glace.')]),
      hear('Le bilan s’alourdit : on compte désormais sept blessés, dont deux graves.', b('What is the new toll?', 'Quel est le nouveau bilan ?'), [b('Seven injured, two seriously', 'Sept blessés, dont deux graves'), b('Two injured', 'Deux blessés'), b('Seven dead', 'Sept morts'), b('No injuries', 'Aucun blessé')]),
      hear('En marge du sommet, la ministre a rencontré des représentants autochtones.', b('When did the meeting take place?', 'Quand la rencontre a-t-elle eu lieu ?'), [b('On the sidelines of the summit', 'En marge du sommet'), b('Before the summit', 'Avant le sommet'), b('Instead of the summit', 'À la place du sommet'), b('After the elections', 'Après les élections')]),
      pairs(P.match, [['selon', b('according to', 'd’après')], ['le bilan', b('the toll, the outcome', 'nombre de victimes')], ['en marge de', b('on the sidelines of', 'à côté de')], ['dont', b('including, of whom', 'parmi lesquels')]]),
      tip(b('One-sentence summary', 'Résumé en une phrase'), b('**Qui + verbe + quoi + où + (combien / pourquoi)**: **Un incendie a détruit trois maisons à Saint-Jérôme, sans faire de blessé.**', '**Qui + verbe + quoi + où + (combien / pourquoi)** : **Un incendie a détruit trois maisons à Saint-Jérôme, sans faire de blessé.**')),
      dict('Selon la police, le conducteur aurait perdu le contrôle de son véhicule.', { voice: 'm' }),
    ],
    [
      b('selon, d’après, il semblerait que = source / uncertainty.', 'selon, d’après, il semblerait que = source / incertitude.'),
      b('Conditional = unconfirmed fact.', 'Conditionnel = fait non confirmé.'),
      b('Summary: who + verb + what + where (+ how many).', 'Résumé : qui + verbe + quoi + où (+ combien).'),
    ],
    [['un sommet', b('a summit', 'réunion de dirigeants')], ['grave', b('serious', 'sérieux')], ['désormais', b('from now on, now', 'maintenant')]],
  ),
];
