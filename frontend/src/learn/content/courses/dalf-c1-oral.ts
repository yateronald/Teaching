import type { CourseAbout } from '../../types';
import { b, card, dlg, doc, exam, gap, lesson, mc, P, say, sort, tip } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'In the DALF C1 speaking test, you prepare for about one hour with a file of several documents, then you give a structured presentation (exposé) of about 8–10 minutes and discuss it with the examiners. This course trains the C1 method: reading a document file efficiently, finding a problématique, building a two- or three-part plan, introducing and concluding with style, and handling a demanding discussion.',
    'À l’oral du DALF C1, vous préparez pendant environ une heure un dossier de plusieurs documents, puis vous présentez un exposé structuré d’environ 8 à 10 minutes et en discutez avec le jury. Ce cours entraîne la méthode du C1 : lire efficacement un dossier, dégager une problématique, construire un plan en deux ou trois parties, introduire et conclure avec élégance, et gérer une discussion exigeante.',
  ),
  outcomes: [
    b('Exploit a document file in one hour', 'Exploiter un dossier en une heure'),
    b('Build a structured exposé', 'Construire un exposé structuré'),
    b('Introduce and conclude effectively', 'Introduire et conclure efficacement'),
    b('Handle the discussion with the examiners', 'Gérer la discussion avec le jury'),
  ],
};

const C = 'dalf-c1-oral';
export default [
  lesson(C, 1, ['the-file-and-the-plan', 'le-dossier-et-le-plan'],
    b('The document file and the plan', 'Le dossier et le plan'),
    b('Read a file of documents and build a plan in the preparation time.', 'Lire un dossier de documents et construire un plan pendant la préparation.'),
    [b('Manage the preparation time', 'Gérer le temps de préparation'), b('Find the problématique', 'Dégager la problématique'), b('Build a 2–3 part plan', 'Construire un plan en 2 ou 3 parties')],
    13,
    [
      exam(b('The C1 oral', 'L’oral du C1'), b('**About 1 hour of preparation** with a **file of documents** (articles, figures, short texts) on a topic, then about **30 minutes**: **exposé** (8–10 min) presenting a **problématique** and a **personal, argued answer** using the documents, then **discussion** with the examiners. Unlike the synthesis, **your opinion is expected** here.', '**Environ 1 heure de préparation** avec un **dossier de documents** (articles, chiffres, textes courts) sur un thème, puis environ **30 minutes** : **exposé** (8 à 10 min) présentant une **problématique** et une **réponse personnelle argumentée** appuyée sur les documents, puis **discussion** avec le jury. Contrairement à la synthèse, **votre opinion est attendue** ici.')),
      card(b('Time management', 'Gestion du temps'), b('**10–15 min**: read the documents, note key ideas and figures. **10 min**: problématique + plan. **25 min**: develop each part in **notes** (not full sentences), with examples from the documents **and your own knowledge**. **5 min**: write the introduction and conclusion more fully, check timing.', '**10 à 15 min** : lire les documents, noter idées et chiffres clés. **10 min** : problématique + plan. **25 min** : développer chaque partie en **notes** (pas de phrases complètes), avec des exemples tirés des documents **et de vos connaissances**. **5 min** : rédiger plus complètement l’introduction et la conclusion, vérifier le minutage.')),
      doc({ look: 'page', title: b('Document file (summary)', 'Dossier (résumé)'), text: 'Doc. 1 : Les ventes de vêtements d’occasion ont doublé en cinq ans.\nDoc. 2 : La « fast fashion » produit plus de 100 milliards de vêtements par an.\nDoc. 3 : Témoignage d’une étudiante qui n’achète plus que d’occasion.\nDoc. 4 : Une marque lance la location de vêtements pour les enfants.' }, b('Which problématique fits the file?', 'Quelle problématique convient au dossier ?'), [b('Can new consumption habits really change the fashion industry?', 'Les nouvelles habitudes de consommation peuvent-elles vraiment transformer l’industrie de la mode ?'), b('How many clothes do students buy?', 'Combien de vêtements les étudiants achètent-ils ?'), b('Is fashion beautiful?', 'La mode est-elle belle ?'), b('Who invented second-hand shops?', 'Qui a inventé les friperies ?')]),
      sort(b('Which part of the plan?', 'Quelle partie du plan ?'), [b('I. A real change', 'I. Un vrai changement'), b('II. Its limits', 'II. Ses limites')], [['les ventes d’occasion ont doublé', 0], ['la fast fashion produit toujours plus', 1], ['la location de vêtements se développe', 0], ['les prix bas attirent toujours', 1], ['les jeunes changent leurs habitudes', 0], ['l’occasion reste minoritaire', 1]]),
      tip(b('Your knowledge counts', 'Vos connaissances comptent'), b('At C1, the examiners expect you to **go beyond the documents**: add an example from your country, a recent event, a personal experience. Mention the documents briefly (**comme le montre le document 2…**), don’t read them.', 'Au C1, le jury attend que vous **dépassiez les documents** : ajoutez un exemple de votre pays, un événement récent, une expérience personnelle. Mentionnez les documents brièvement (**comme le montre le document 2…**), ne les lisez pas.')),
    ],
    [
      b('About 1 h preparation; exposé 8–10 min; discussion.', 'Environ 1 h de préparation ; exposé 8 à 10 min ; discussion.'),
      b('Problématique + 2–3 part plan + your opinion.', 'Problématique + plan en 2 ou 3 parties + votre opinion.'),
      b('Notes, not sentences; add your own examples.', 'Des notes, pas des phrases ; ajoutez vos propres exemples.'),
    ],
    [['d’occasion', b('second-hand', 'déjà porté')], ['une friperie', b('a second-hand clothes shop', 'magasin de vêtements usagés')], ['le minutage', b('timing', 'gestion du temps')]],
  ),
  lesson(C, 2, ['introduction-and-conclusion', 'introduction-et-conclusion'],
    b('Introducing and concluding with style', 'Introduire et conclure avec élégance'),
    b('Open with a hook, announce the problématique and plan, and conclude with an opening.', 'Ouvrir par une accroche, annoncer problématique et plan, et conclure par une ouverture.'),
    [b('Open with a hook', 'Ouvrir par une accroche'), b('Announce the plan clearly', 'Annoncer clairement le plan'), b('Conclude and open the debate', 'Conclure et ouvrir le débat')],
    13,
    [
      card(b('Introduction and conclusion', 'Introduction et conclusion'), b('**Introduction**: hook (a figure, a fact, a question) → topic → **problématique** → **plan**: **Selon le dossier qui m’a été remis, les ventes d’occasion ont doublé en cinq ans. Ce phénomène pose une question : … Dans un premier temps, j’analyserai…, puis j’examinerai…** **Conclusion**: summary + **your answer** + **opening**: **En définitive… Reste à savoir si…**', '**Introduction** : accroche (un chiffre, un fait, une question) → thème → **problématique** → **plan** : **Selon le dossier qui m’a été remis, les ventes d’occasion ont doublé en cinq ans. Ce phénomène pose une question : … Dans un premier temps, j’analyserai…, puis j’examinerai…** **Conclusion** : bilan + **votre réponse** + **ouverture** : **En définitive… Reste à savoir si…**')),
      say('Selon le dossier qui m’a été remis, les ventes de vêtements d’occasion ont doublé en cinq ans. Ce phénomène soulève une question : les consommateurs peuvent-ils réellement transformer l’industrie de la mode ? Dans un premier temps, j’analyserai les signes d’un changement, puis j’en examinerai les limites.', 'According to the file I was given, second-hand clothing sales have doubled in five years. This phenomenon raises a question: can consumers really transform the fashion industry? First I will analyse the signs of change, then I will examine its limits.'),
      sort(b('Introduction or conclusion?', 'Introduction ou conclusion ?'), [b('introduction', 'introduction'), b('conclusion', 'conclusion')], [['Ce phénomène soulève une question…', 0], ['En définitive, …', 1], ['Dans un premier temps, j’analyserai…', 0], ['Reste à savoir si…', 1], ['Selon le dossier qui m’a été remis…', 0], ['Au terme de cette analyse…', 1]]),
      mc(P.best, ['En définitive, si les habitudes évoluent, elles restent minoritaires face à la puissance de la fast fashion. Reste à savoir si la réglementation accélérera ce mouvement.', 'Voilà, c’est fini.', 'Je n’ai plus rien à dire.', 'Bref, la mode, c’est compliqué.'], { fr: 'Quelle conclusion est la meilleure ?' }),
      gap(P.complete, 'Ce phénomène ___ une question essentielle. Dans un premier ___ , j’analyserai les causes ; dans un ___ temps, j’en examinerai les conséquences.', [['soulève', 'pose'], 'temps', 'second']),
    ],
    [
      b('Introduction: hook → topic → problématique → plan.', 'Introduction : accroche → thème → problématique → plan.'),
      b('Conclusion: summary → your answer → opening (Reste à savoir si…).', 'Conclusion : bilan → votre réponse → ouverture (Reste à savoir si…).'),
      b('Announce transitions clearly during the exposé.', 'Annoncez clairement les transitions pendant l’exposé.'),
    ],
    [['soulever une question', b('to raise a question', 'poser une question')], ['une réglementation', b('regulation', 'ensemble de règles')], ['au terme de', b('at the end of', 'à la fin de')]],
  ),
  lesson(C, 3, ['the-discussion', 'la-discussion-avec-le-jury'],
    b('The discussion with the examiners', 'La discussion avec le jury'),
    b('Defend, clarify and deepen your ideas under questioning.', 'Défendre, préciser et approfondir ses idées face aux questions.'),
    [b('Clarify a point', 'Préciser un point'), b('Defend your thesis with nuance', 'Défendre sa thèse avec nuance'), b('Broaden the debate', 'Élargir le débat')],
    13,
    [
      card(b('C1 discussion', 'La discussion au C1'), b('Clarify: **Ce que je voulais dire, c’est que… · Permettez-moi de préciser ma pensée.** Defend: **Je maintiens néanmoins que… · Cet argument me semble discutable dans la mesure où…** Concede: **C’est un point que je n’avais pas envisagé, et il est pertinent.** Broaden: **Cette question dépasse d’ailleurs le cadre de la mode : …**', 'Préciser : **Ce que je voulais dire, c’est que… · Permettez-moi de préciser ma pensée.** Défendre : **Je maintiens néanmoins que… · Cet argument me semble discutable dans la mesure où…** Concéder : **C’est un point que je n’avais pas envisagé, et il est pertinent.** Élargir : **Cette question dépasse d’ailleurs le cadre de la mode : …**')),
      dlg(b('Discussion', 'Discussion'), undefined, [['Examinatrice', 'f'], ['Vous', 'm']], [
        [0, 'Vous dites que les consommateurs changent. Mais les plus modestes peuvent-ils vraiment se permettre des vêtements durables, souvent plus chers ?', 'You say consumers are changing. But can those on low incomes really afford durable, often more expensive clothes?'],
        [1, { options: ['C’est un point pertinent. Justement, l’occasion offre une réponse : elle permet d’acheter de la qualité à petit prix. Mais je reconnais que cela demande du temps.', 'Oui, tout le monde peut.', 'Je n’ai pas parlé de ça.'] }],
        [0, 'Et l’État a-t-il un rôle à jouer ?', 'And does the state have a role to play?'],
        [1, { options: ['À mon sens, oui : on pourrait taxer davantage les vêtements bon marché à fort impact environnemental. Cette question dépasse d’ailleurs la mode : elle concerne toute la consommation.', 'Non, l’État ne sert à rien.', 'Je ne sais pas.'] }],
      ]),
      sort(b('Clarify, defend or broaden?', 'Préciser, défendre ou élargir ?'), [b('clarify', 'préciser'), b('defend', 'défendre'), b('broaden', 'élargir')], [['Permettez-moi de préciser ma pensée.', 0], ['Je maintiens néanmoins que…', 1], ['Cette question dépasse le cadre de…', 2], ['Ce que je voulais dire, c’est que…', 0], ['Cet argument me semble discutable.', 1], ['On pourrait aussi l’appliquer à…', 2]]),
      say('C’est un point que je n’avais pas envisagé, et il est pertinent. Je maintiens néanmoins que les habitudes évoluent.', 'That’s a point I hadn’t considered, and it’s relevant. I nevertheless maintain that habits are changing.'),
    ],
    [
      b('Clarify: Permettez-moi de préciser ma pensée.', 'Préciser : Permettez-moi de préciser ma pensée.'),
      b('Defend: Je maintiens néanmoins que…', 'Défendre : Je maintiens néanmoins que…'),
      b('Concede gracefully, then broaden the debate.', 'Concédez avec élégance, puis élargissez le débat.'),
    ],
    [['pertinent', b('relevant', 'juste et utile')], ['se permettre', b('to afford', 'avoir les moyens')], ['à mon sens', b('in my view', 'à mon avis')]],
  ),
];
