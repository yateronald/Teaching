import type { CourseAbout } from '../../types';
import { b, card, dict, hear, lesson, mc, P, say, sort } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Ah bon ? Ah bon. Ah bon ! The same two words can express surprise, indifference or disbelief: the difference is entirely in the melody. This course trains the main French intonation patterns: rising and falling questions, statements, lists and continuation, and the expressive melodies of surprise, irony, doubt, enthusiasm, anger and politeness, so you understand the real message and convey your own.',
    'Ah bon ? Ah bon. Ah bon ! Les deux mêmes mots peuvent exprimer la surprise, l’indifférence ou l’incrédulité : la différence est entièrement dans la mélodie. Ce cours entraîne les principales intonations du français : questions montantes et descendantes, affirmations, énumérations et continuation, et les mélodies expressives de la surprise, de l’ironie, du doute, de l’enthousiasme, de la colère et de la politesse, pour comprendre le vrai message et faire passer le vôtre.',
  ),
  outcomes: [
    b('Use rising and falling melodies correctly', 'Employer correctement les mélodies montantes et descendantes'),
    b('Mark continuation and lists', 'Marquer la continuation et l’énumération'),
    b('Express emotions with melody', 'Exprimer des émotions par la mélodie'),
    b('Interpret the speaker’s attitude', 'Interpréter l’attitude du locuteur'),
  ],
};

const C = 'p-expressive-intonation';
export default [
  lesson(C, 1, ['basic-melodies', 'les-melodies-de-base'],
    b('The basic melodies', 'Les mélodies de base'),
    b('Rise for yes/no questions and continuation, fall for statements and wh-questions.', 'Monter pour les questions fermées et la continuation, descendre pour les affirmations et les questions ouvertes.'),
    [b('Make a statement fall', 'Faire descendre une affirmation'), b('Make a yes/no question rise', 'Faire monter une question fermée'), b('Rise for continuation', 'Monter pour la continuation')],
    13,
    [
      card(b('Up or down', 'Monter ou descendre'), b('**Statement**: falls at the end ↘ **Il vient demain.** **Yes/no question**: rises ↗ **Il vient demain ?** **Wh-question**: starts high and falls ↘ **Quand est-ce qu’il vient ?** **Continuation**: each group rises ↗, only the last falls ↘: **J’ai acheté du pain ↗, du fromage ↗ et du vin ↘.**', '**Affirmation** : descend à la fin ↘ **Il vient demain.** **Question fermée** : monte ↗ **Il vient demain ?** **Question ouverte** : part haut et descend ↘ **Quand est-ce qu’il vient ?** **Continuation** : chaque groupe monte ↗, seul le dernier descend ↘ : **J’ai acheté du pain ↗, du fromage ↗ et du vin ↘.**'), {
        ex: [['Il vient demain.', '↘'], ['Il vient demain ?', '↗'], ['Quand est-ce qu’il vient ?', '↘']],
      }),
      hear('Tu as faim ?', b('Listen. Statement or question?', 'Écoutez. Affirmation ou question ?'), [b('question (rising)', 'question (montante)'), b('statement (falling)', 'affirmation (descendante)')]),
      hear('Elle habite à Lyon.', b('Listen. Statement or question?', 'Écoutez. Affirmation ou question ?'), [b('statement (falling)', 'affirmation (descendante)'), b('question (rising)', 'question (montante)')], { voice: 'm' }),
      hear('Dans mon sac, il y a mes clés, mon téléphone, un livre et une pomme.', b('Listen. Where does the melody fall?', 'Écoutez. Où la mélodie descend-elle ?'), [b('only at the end (pomme)', 'seulement à la fin (pomme)'), b('after every item', 'après chaque élément'), b('at the beginning', 'au début'), b('nowhere', 'nulle part')]),
      sort(b('Rising or falling at the end?', 'Montante ou descendante à la fin ?'), [b('rising ↗', 'montante ↗'), b('falling ↘', 'descendante ↘')], [['Tu viens ce soir ?', 0], ['Je viens ce soir.', 1], ['C’est prêt ?', 0], ['Où est-ce que tu habites ?', 1], ['Vous êtes française ?', 0], ['Pourquoi tu ris ?', 1]]),
      say('Tu viens ce soir ? Oui, je viens ce soir. Et tu apportes du pain, du fromage et du vin.', 'Are you coming tonight? Yes, I’m coming tonight. And you’re bringing bread, cheese and wine.', { tip: b('Rise on the question and on pain, fromage; fall on the statement and on vin.', 'Montez sur la question et sur pain, fromage ; descendez sur l’affirmation et sur vin.') }),
    ],
    [
      b('Statement ↘, yes/no question ↗, wh-question ↘.', 'Affirmation ↘, question fermée ↗, question ouverte ↘.'),
      b('Lists: rise on each item, fall on the last.', 'Énumération : montée sur chaque élément, descente sur le dernier.'),
      b('Rising = « I haven’t finished » or « I’m asking ».', 'Monter = « je n’ai pas fini » ou « je demande ».'),
    ],
    [['avoir faim', b('to be hungry', 'vouloir manger')], ['apporter', b('to bring', 'venir avec')], ['une énumération', b('a list', 'suite d’éléments')]],
  ),
  lesson(C, 2, ['emotions-in-melody', 'les-emotions-dans-la-melodie'],
    b('Emotions in the melody', 'Les émotions dans la mélodie'),
    b('Express surprise, enthusiasm, doubt and annoyance with your voice.', 'Exprimer surprise, enthousiasme, doute et agacement avec la voix.'),
    [b('Express surprise and enthusiasm', 'Exprimer surprise et enthousiasme'), b('Express doubt', 'Exprimer le doute'), b('Express annoyance', 'Exprimer l’agacement')],
    13,
    [
      card(b('Melody and emotion', 'Mélodie et émotion'), b('**Surprise**: very high, sharp rise: **Ah bon ?!** · **C’est vrai ?!** **Enthusiasm**: high, wide, energetic: **C’est génial !** **Doubt**: slow, rise-fall, stretched: **Mouais… peut-être…** **Indifference**: low, flat: **Ah bon.** **Annoyance**: low, hammered syllables: **Ça suffit, maintenant.**', '**Surprise** : très haut, montée brusque : **Ah bon ?!** · **C’est vrai ?!** **Enthousiasme** : haut, ample, énergique : **C’est génial !** **Doute** : lent, monte-descend, étiré : **Mouais… peut-être…** **Indifférence** : bas, plat : **Ah bon.** **Agacement** : bas, syllabes martelées : **Ça suffit, maintenant.**')),
      sort(b('Which attitude?', 'Quelle attitude ?'), [b('surprise / enthusiasm', 'surprise / enthousiasme'), b('doubt / indifference', 'doute / indifférence'), b('annoyance', 'agacement')], [['C’est vrai ?! Génial !', 0], ['Mouais… on verra.', 1], ['Ça suffit, maintenant.', 2], ['Non ?! Incroyable !', 0], ['Bof, si tu veux.', 1], ['Je te l’ai déjà dit trois fois.', 2]]),
      mc(P.meaning, [b('The speaker doubts it.', 'La personne en doute.'), b('The speaker is delighted.', 'La personne est ravie.'), b('The speaker is angry.', 'La personne est en colère.'), b('The speaker agrees completely.', 'La personne est tout à fait d’accord.')], { fr: '— On finira le projet vendredi. — Mouais… si tu le dis… (lentement, voix traînante)' }),
      mc(P.meaning, [b('Indifference: not interested', 'Indifférence : pas intéressé'), b('Great surprise', 'Grande surprise'), b('Anger', 'Colère'), b('Enthusiasm', 'Enthousiasme')], { fr: '« Ah bon. » (voix basse, plate, sans montée)' }),
      say('C’est vrai ?! Mais c’est génial !', 'Really?! But that’s great!', { tip: b('High, energetic, wide melody.', 'Mélodie haute, énergique, ample.') }),
      say('Mouais… peut-être… on verra.', 'Hmm… maybe… we’ll see.', { tip: b('Slow, stretched, rise-fall.', 'Lent, étiré, monte-descend.') }),
    ],
    [
      b('Surprise/enthusiasm: high, wide, energetic.', 'Surprise/enthousiasme : haut, ample, énergique.'),
      b('Doubt: slow, stretched; indifference: low and flat.', 'Doute : lent, étiré ; indifférence : bas et plat.'),
      b('Annoyance: low, hammered syllables.', 'Agacement : bas, syllabes martelées.'),
    ],
    [['mouais', b('meh, hmm (doubt)', 'oui avec doute')], ['martelé', b('hammered', 'fort et séparé')], ['traînant', b('drawling', 'lent et étiré')]],
  ),
  lesson(C, 3, ['irony-and-politeness', 'ironie-et-politesse'],
    b('Irony and politeness in the voice', 'Ironie et politesse dans la voix'),
    b('Hear irony through melody and soften requests with a polite intonation.', 'Entendre l’ironie dans la mélodie et adoucir les demandes par une intonation polie.'),
    [b('Spot ironic melody', 'Repérer la mélodie ironique'), b('Use a polite rising melody', 'Utiliser une mélodie polie montante'), b('Avoid sounding curt', 'Éviter de paraître sec')],
    13,
    [
      card(b('Irony and politeness', 'Ironie et politesse'), b('**Irony**: exaggerated, sing-song melody, stretched words: **Bravo… quel talent…** (after a mistake). **Politeness**: a **soft rise** at the end of a request softens it: **Vous pourriez fermer la porte ↗, s’il vous plaît ?** The same words with a **flat, falling** melody sound like an order: **Fermez la porte ↘.**', '**Ironie** : mélodie exagérée, chantante, mots étirés : **Bravo… quel talent…** (après une erreur). **Politesse** : une **légère montée** à la fin d’une demande l’adoucit : **Vous pourriez fermer la porte ↗, s’il vous plaît ?** Les mêmes mots avec une mélodie **plate et descendante** sonnent comme un ordre : **Fermez la porte ↘.**')),
      mc(P.meaning, [b('Irony: he means the opposite.', 'Ironie : il pense le contraire.'), b('Sincere congratulations.', 'Des félicitations sincères.'), b('A question.', 'Une question.'), b('Indifference.', 'De l’indifférence.')], { fr: 'Après avoir renversé son café sur le clavier, son collègue dit lentement, en chantant presque : « Braaavo… très réussi… »' }),
      sort(b('Polite request or curt order?', 'Demande polie ou ordre sec ?'), [b('polite (soft rise)', 'polie (légère montée)'), b('curt (flat fall)', 'sèche (descente plate)')], [['Vous pourriez m’aider, s’il vous plaît ?', 0], ['Aidez-moi.', 1], ['Tu me passes le sel ?', 0], ['Le sel.', 1], ['Ça vous dérangerait d’attendre un instant ?', 0], ['Attendez.', 1]]),
      mc(P.best, ['Vous pourriez parler un peu moins fort, s’il vous plaît ?', 'Moins fort.', 'Chut.', 'Arrêtez de crier.'], { fr: 'Au cinéma, vos voisins parlent fort : vous restez poli.' }),
      dict('Vous pourriez fermer la fenêtre, s’il vous plaît ? Il fait un peu froid.', { hint: b('A polite request.', 'Une demande polie.') }),
      say('Vous pourriez fermer la porte, s’il vous plaît ? Merci beaucoup !', 'Could you close the door, please? Thank you very much!', { tip: b('Soft rise on « porte » and « plaît », warm « merci ».', 'Légère montée sur « porte » et « plaît », « merci » chaleureux.') }),
    ],
    [
      b('Irony: exaggerated, sing-song, stretched melody.', 'Ironie : mélodie exagérée, chantante, étirée.'),
      b('Polite request: soft rise at the end.', 'Demande polie : légère montée à la fin.'),
      b('Flat falling melody on a request sounds like an order.', 'Une mélodie plate et descendante sur une demande sonne comme un ordre.'),
    ],
    [['renverser', b('to spill', 'faire tomber un liquide')], ['un clavier', b('a keyboard', 'touches de l’ordinateur')], ['sec', b('curt, dry', 'peu aimable')]],
  ),
];
