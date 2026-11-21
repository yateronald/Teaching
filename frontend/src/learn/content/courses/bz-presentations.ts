import type { CourseAbout } from '../../types';
import { b, card, dlg, doc, gap, hear, lesson, mc, ord, P, pairs, say, sort, tip, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Presenting a project, a quarterly result or a proposal in French requires a clear structure, the right signposting, the ability to comment on figures and charts, and the confidence to handle questions. This course trains each part of a business presentation: the introduction and plan, describing trends and charts (hausse, baisse, stagnation), and managing the Q&A, including questions you cannot answer.',
    'Présenter un projet, un résultat trimestriel ou une proposition en français exige une structure claire, des transitions adaptées, la capacité de commenter des chiffres et des graphiques, et l’assurance nécessaire pour gérer les questions. Ce cours entraîne chaque partie d’une présentation professionnelle : l’introduction et le plan, la description des tendances et des graphiques (hausse, baisse, stagnation), et la séance de questions, y compris celles auxquelles vous ne savez pas répondre.',
  ),
  outcomes: [
    b('Open and structure a presentation', 'Ouvrir et structurer une présentation'),
    b('Describe figures, trends and charts', 'Décrire chiffres, tendances et graphiques'),
    b('Handle questions confidently', 'Gérer les questions avec assurance'),
    b('Conclude with a clear message', 'Conclure par un message clair'),
  ],
};

const C = 'bz-presentations';
export default [
  lesson(C, 1, ['opening-and-structure', 'ouverture-et-structure'],
    b('Opening and structure', 'Ouverture et structure'),
    b('Open with a hook, state your objective and announce your plan.', 'Ouvrir par une accroche, annoncer l’objectif et le plan.'),
    [b('Open with a hook', 'Ouvrir par une accroche'), b('State the objective', 'Énoncer l’objectif'), b('Announce the plan', 'Annoncer le plan')],
    13,
    [
      card(b('A strong opening', 'Une ouverture solide'), b('**Hook**: a figure or a question: **Saviez-vous que 40 % de nos clients abandonnent leur panier ?** **Objective**: **L’objectif de cette présentation est de vous proposer…** **Plan**: **Je commencerai par…, puis je présenterai…, et je terminerai par…** **Timing**: **J’en ai pour quinze minutes, et je répondrai à vos questions à la fin.**', '**Accroche** : un chiffre ou une question : **Saviez-vous que 40 % de nos clients abandonnent leur panier ?** **Objectif** : **L’objectif de cette présentation est de vous proposer…** **Plan** : **Je commencerai par…, puis je présenterai…, et je terminerai par…** **Durée** : **J’en ai pour quinze minutes, et je répondrai à vos questions à la fin.**')),
      sort(b('Hook, objective or plan?', 'Accroche, objectif ou plan ?'), [b('hook', 'accroche'), b('objective', 'objectif'), b('plan', 'plan')], [['Saviez-vous que la moitié de nos appels restent sans réponse ?', 0], ['L’objectif est de valider le budget 2026.', 1], ['Je commencerai par le contexte, puis…', 2], ['Imaginez un client qui attend vingt minutes.', 0], ['Je souhaite vous convaincre d’ouvrir un bureau à Lyon.', 1], ['Je terminerai par nos recommandations.', 2]]),
      mc(P.best, ['Bonjour à tous. Saviez-vous que 40 % de nos clients abandonnent leur panier ? L’objectif de cette présentation est de vous proposer trois solutions.', 'Bon, alors, euh, on va parler du site.', 'Je n’ai pas eu le temps de préparer, désolé.', 'Voilà les diapositives, lisez-les.'], { fr: 'Quelle ouverture est la plus efficace ?' }),
      ord(P.order, 'Je commencerai par le contexte, puis je présenterai nos résultats.', { tr: 'I’ll start with the context, then present our results.' }),
      gap(P.complete, 'J’en ai ___ vingt minutes, et je ___ à vos questions à la fin.', ['pour', 'répondrai']),
      say('L’objectif de cette présentation est de vous proposer trois solutions. Je commencerai par le contexte, puis je présenterai nos résultats.', 'The aim of this presentation is to propose three solutions. I’ll start with the context, then present our results.'),
    ],
    [
      b('Hook: Saviez-vous que… ? Imaginez…', 'Accroche : Saviez-vous que… ? Imaginez…'),
      b('Objective: L’objectif de cette présentation est de…', 'Objectif : L’objectif de cette présentation est de…'),
      b('Plan: Je commencerai par…, puis…, et je terminerai par…', 'Plan : Je commencerai par…, puis…, et je terminerai par…'),
    ],
    [['abandonner son panier', b('to abandon one’s cart', 'quitter sans acheter')], ['une diapositive', b('a slide', 'page de présentation')], ['valider', b('to approve', 'accepter officiellement')]],
  ),
  lesson(C, 2, ['figures-and-charts', 'chiffres-et-graphiques'],
    b('Figures, trends and charts', 'Chiffres, tendances et graphiques'),
    b('Describe rises, falls and stability, and comment on a chart.', 'Décrire hausses, baisses et stabilité, et commenter un graphique.'),
    [b('Describe trends with verbs and nouns', 'Décrire les tendances avec verbes et noms'), b('Qualify the change', 'Qualifier l’évolution'), b('Comment on a chart', 'Commenter un graphique')],
    13,
    [
      card(b('Describing trends', 'Décrire les tendances'), b('Rise: **augmenter, progresser, une hausse, une augmentation**. Fall: **baisser, diminuer, reculer, une baisse, un recul**. Stable: **rester stable, stagner, une stagnation**. Qualify: **légèrement, nettement, fortement, de 12 % , passer de… à…, atteindre un pic, chuter**. Chart: **Comme vous pouvez le voir sur ce graphique, … · La courbe bleue représente…**', 'Hausse : **augmenter, progresser, une hausse, une augmentation**. Baisse : **baisser, diminuer, reculer, une baisse, un recul**. Stabilité : **rester stable, stagner, une stagnation**. Qualifier : **légèrement, nettement, fortement, de 12 %, passer de… à…, atteindre un pic, chuter**. Graphique : **Comme vous pouvez le voir sur ce graphique, … · La courbe bleue représente…**')),
      doc({ look: 'page', title: b('Quarterly sales (thousands of euros)', 'Ventes trimestrielles (milliers d’euros)'), text: 'Trimestre | 2024 | 2025\nT1 | 420 | 460\nT2 | 480 | 470\nT3 | 510 | 610\nT4 | 530 | 530' }, b('Which comment is accurate?', 'Quel commentaire est exact ?'), [b('Sales rose sharply in Q3 2025 (from 510 to 610 compared with 2024).', 'Les ventes ont nettement progressé au T3 2025 (de 510 à 610 par rapport à 2024).'), b('Sales fell in every quarter.', 'Les ventes ont baissé à chaque trimestre.'), b('Q4 2025 shows a strong rise.', 'Le T4 2025 montre une forte hausse.'), b('Q2 2025 grew by 20%.', 'Le T2 2025 a progressé de 20 %.')]),
      sort(b('Rise, fall or stable?', 'Hausse, baisse ou stabilité ?'), [b('rise', 'hausse'), b('fall', 'baisse'), b('stable', 'stabilité')], [['progresser', 0], ['reculer', 1], ['stagner', 2], ['atteindre un pic', 0], ['chuter', 1], ['rester au même niveau', 2]]),
      hear('Comme vous pouvez le voir sur ce graphique, notre chiffre d’affaires est passé de deux à deux virgule six millions d’euros en un an, soit une hausse de trente pour cent.', b('By how much did turnover rise?', 'De combien le chiffre d’affaires a-t-il augmenté ?'), [b('30% (from 2 to 2.6 million)', '30 % (de 2 à 2,6 millions)'), b('6%', '6 %'), b('2.6%', '2,6 %'), b('it fell', 'il a baissé')], { voice: 'm' }),
      pairs(P.match, [['nettement', b('significantly', 'de façon marquée')], ['légèrement', b('slightly', 'un peu')], ['un recul', b('a decline', 'une baisse')], ['soit', b('i.e., that is', 'c’est-à-dire')]]),
      say('Comme vous pouvez le voir, les ventes ont nettement progressé au troisième trimestre, avant de se stabiliser.', 'As you can see, sales rose significantly in the third quarter before levelling off.'),
    ],
    [
      b('Rise: augmenter, progresser; fall: baisser, reculer; stable: stagner.', 'Hausse : augmenter, progresser ; baisse : baisser, reculer ; stabilité : stagner.'),
      b('Qualify: légèrement, nettement, fortement; passer de… à…', 'Qualifier : légèrement, nettement, fortement ; passer de… à…'),
      b('Comme vous pouvez le voir sur ce graphique…', 'Comme vous pouvez le voir sur ce graphique…'),
    ],
    [['un trimestre', b('a quarter', 'trois mois')], ['une courbe', b('a curve, a line (chart)', 'ligne d’un graphique')], ['le chiffre d’affaires', b('turnover', 'total des ventes')]],
  ),
  lesson(C, 3, ['questions-and-conclusion', 'questions-et-conclusion'],
    b('Questions and conclusion', 'Questions et conclusion'),
    b('Conclude with a key message and handle questions, including difficult ones.', 'Conclure par un message clé et gérer les questions, même difficiles.'),
    [b('Conclude with a key message', 'Conclure par un message clé'), b('Welcome and rephrase questions', 'Accueillir et reformuler les questions'), b('Handle a question you can’t answer', 'Gérer une question sans réponse')],
    13,
    [
      card(b('Concluding and Q&A', 'Conclure et répondre'), b('Conclude: **Pour conclure, je retiendrai trois points : … · Je vous propose donc de… · Merci de votre attention, je suis à votre disposition pour vos questions.** Questions: **Merci pour cette question. · Si je comprends bien, vous me demandez si… · Je n’ai pas le chiffre exact en tête, je vous l’enverrai cet après-midi. · C’est un point important, on pourrait en reparler après la réunion.**', 'Conclure : **Pour conclure, je retiendrai trois points : … · Je vous propose donc de… · Merci de votre attention, je suis à votre disposition pour vos questions.** Questions : **Merci pour cette question. · Si je comprends bien, vous me demandez si… · Je n’ai pas le chiffre exact en tête, je vous l’enverrai cet après-midi. · C’est un point important, on pourrait en reparler après la réunion.**')),
      tip(b('Never bluff', 'Ne bluffez jamais'), b('If you don’t know, say so and promise a follow-up: **Je préfère vérifier pour vous donner une réponse exacte.** It builds more trust than an invented answer.', 'Si vous ne savez pas, dites-le et promettez un suivi : **Je préfère vérifier pour vous donner une réponse exacte.** Cela inspire plus confiance qu’une réponse inventée.')),
      mc(P.best, ['Merci pour cette question. Je n’ai pas le chiffre exact en tête ; je préfère vérifier et je vous l’envoie cet après-midi.', 'Environ 50 %, je crois, ou 30 %.', 'Ce n’est pas important.', 'Je ne sais pas. Question suivante.'], { fr: '— Quel est le taux de retour exact au Québec ?' }),
      dlg(b('Q&A', 'Questions-réponses'), undefined, [['Directrice', 'f'], ['Vous', 'm']], [
        [0, 'Votre projet est intéressant, mais combien coûterait le recrutement de deux personnes ?', 'Your project is interesting, but how much would hiring two people cost?'],
        [1, { options: ['Merci pour cette question. Si je comprends bien, vous voulez le coût total sur un an ? Il est d’environ 110 000 euros, charges comprises.', 'Beaucoup.', 'On verra plus tard.'] }],
        [0, 'Et le retour sur investissement ?', 'And the return on investment?'],
        [1, { options: ['Nous l’estimons à dix-huit mois. Je peux vous envoyer le détail du calcul.', 'Rapide, je pense.', 'Aucune idée.'] }],
      ]),
      write(b('Your conclusion', 'Votre conclusion'), b('Write the conclusion of a presentation (40–70 words): three key points, a proposal and an invitation to ask questions.', 'Rédigez la conclusion d’une présentation (40–70 mots) : trois points clés, une proposition et une invitation aux questions.'), 40, 70, [
        b('Three key points', 'Trois points clés'),
        b('A concrete proposal', 'Une proposition concrète'),
        b('Invitation to questions', 'Invitation aux questions'),
      ], 'Pour conclure, je retiendrai trois points : nos ventes en ligne progressent fortement, nos clients demandent une livraison plus rapide, et nos concurrents s’organisent déjà. Je vous propose donc de tester la livraison en 24 heures à Montréal dès septembre. Merci de votre attention, je suis à votre disposition pour vos questions.'),
    ],
    [
      b('Conclude: Pour conclure, je retiendrai trois points…', 'Conclure : Pour conclure, je retiendrai trois points…'),
      b('Questions: thank, rephrase, answer briefly.', 'Questions : remercier, reformuler, répondre brièvement.'),
      b('Don’t know? Promise to check and follow up.', 'Vous ne savez pas ? Promettez de vérifier et de revenir vers la personne.'),
    ],
    [['les charges', b('employer costs', 'cotisations patronales')], ['le retour sur investissement', b('return on investment', 'gain par rapport au coût')], ['un concurrent', b('a competitor', 'entreprise rivale')]],
  ),
];
