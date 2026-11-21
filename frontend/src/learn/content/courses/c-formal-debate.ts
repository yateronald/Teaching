import type { CourseAbout } from '../../types';
import { b, card, gap, hear, lesson, mc, ord, P, pairs, say, sort } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'A formal debate (a university panel, a council meeting, the DALF C1 oral) has its own rules: you take the floor, you build on or refute what was said, you reframe the question and you conclude, all in a sustained, courteous register. This course trains the rituals and the moves of debate: asking for and keeping the floor, refuting an argument point by point, pointing out a fallacy, reframing and summing up.',
    'Un débat formel (table ronde universitaire, conseil municipal, oral du DALF C1) a ses propres règles : on prend la parole, on rebondit sur ce qui a été dit ou on le réfute, on recadre la question et on conclut, le tout dans un registre soutenu et courtois. Ce cours entraîne les rituels et les mouvements du débat : demander et garder la parole, réfuter un argument point par point, dénoncer un raisonnement fallacieux, recadrer et synthétiser.',
  ),
  outcomes: [
    b('Take, keep and give the floor', 'Prendre, garder et céder la parole'),
    b('Refute an argument point by point', 'Réfuter un argument point par point'),
    b('Point out a weak reasoning', 'Dénoncer un raisonnement faible'),
    b('Reframe and conclude', 'Recadrer et conclure'),
  ],
};

const C = 'c-formal-debate';
export default [
  lesson(C, 1, ['taking-the-floor', 'prendre-la-parole'],
    b('Taking and keeping the floor', 'Prendre et garder la parole'),
    b('Use the courteous rituals of a formal debate.', 'Employer les rituels courtois du débat formel.'),
    [b('Ask for the floor', 'Demander la parole'), b('Keep it when interrupted', 'La garder quand on est interrompu'), b('Build on a previous speaker', 'Rebondir sur un intervenant')],
    13,
    [
      card(b('Debate rituals', 'Les rituels du débat'), b('Ask: **Si vous me permettez d’intervenir…** · **J’aimerais apporter une précision.** Keep: **Permettez-moi de terminer.** · **Si vous me laissez finir…** Build on: **Pour rebondir sur ce que disait Mme Durand, …** · **Je rejoins tout à fait M. Ba sur ce point.** Give: **Je vous laisse la parole.**', 'Demander : **Si vous me permettez d’intervenir…** · **J’aimerais apporter une précision.** Garder : **Permettez-moi de terminer.** · **Si vous me laissez finir…** Rebondir : **Pour rebondir sur ce que disait Mme Durand, …** · **Je rejoins tout à fait M. Ba sur ce point.** Céder : **Je vous laisse la parole.**')),
      sort(b('What is the speaker doing?', 'Que fait l’intervenant ?'), [b('asking for the floor', 'demander la parole'), b('keeping the floor', 'garder la parole'), b('building on someone', 'rebondir')], [['Si vous me permettez d’intervenir…', 0], ['Permettez-moi de terminer.', 1], ['Pour rebondir sur ce que disait…', 2], ['J’aimerais apporter une précision.', 0], ['Si vous me laissez finir…', 1], ['Je rejoins M. Ba sur ce point.', 2]]),
      mc(P.best, ['Permettez-moi de terminer, je vous laisserai la parole ensuite.', 'Taisez-vous, c’est mon tour !', 'Vous êtes impoli.', 'Bon, d’accord, parlez.'], { fr: 'Un autre intervenant vous coupe la parole :' }),
      mc(P.best, ['Pour rebondir sur ce que disait Mme Leroy, j’ajouterais que le coût n’est pas le seul critère.', 'Mme Leroy a dit quelque chose, je crois.', 'Moi, je pense autre chose, point.', 'Comme d’habitude, Mme Leroy se trompe.'], { fr: 'Vous voulez prolonger l’idée d’une collègue :' }),
      ord(P.order, 'Si vous me permettez d’intervenir, j’aimerais apporter une précision.', { tr: 'If I may come in, I’d like to clarify one point.' }),
      pairs(P.match, [['intervenir', b('to speak up, intervene', 'prendre la parole')], ['rebondir sur', b('to build on', 'prolonger une idée')], ['rejoindre qqn', b('to agree with someone', 'partager son avis')], ['couper la parole', b('to interrupt', 'interrompre')]]),
      say('Si vous me permettez d’intervenir, j’aimerais rebondir sur ce que disait M. Ba.', 'If I may come in, I’d like to build on what Mr Ba was saying.'),
    ],
    [
      b('Ask: Si vous me permettez d’intervenir… J’aimerais apporter une précision.', 'Demander : Si vous me permettez d’intervenir… J’aimerais apporter une précision.'),
      b('Keep: Permettez-moi de terminer. Give: Je vous laisse la parole.', 'Garder : Permettez-moi de terminer. Céder : Je vous laisse la parole.'),
      b('Build on: Pour rebondir sur… Je rejoins… sur ce point.', 'Rebondir : Pour rebondir sur… Je rejoins… sur ce point.'),
    ],
    [['un intervenant', b('a speaker, panellist', 'personne qui parle')], ['une précision', b('a clarification', 'détail exact')], ['un critère', b('a criterion', 'élément d’évaluation')]],
  ),
  lesson(C, 2, ['refuting', 'refuter'],
    b('Refuting an argument', 'Réfuter un argument'),
    b('Contest an argument point by point and expose a weak reasoning.', 'Contester un argument point par point et dénoncer un raisonnement faible.'),
    [b('Refute courteously', 'Réfuter avec courtoisie'), b('Contest the facts or the logic', 'Contester les faits ou la logique'), b('Point out a fallacy', 'Dénoncer un sophisme')],
    13,
    [
      card(b('Refuting', 'Réfuter'), b('**Je me permets de contester ce chiffre : …** · **Cet argument ne tient pas, pour deux raisons.** · **Vous confondez corrélation et causalité.** · **C’est un raccourci un peu rapide.** · **Vous généralisez à partir d’un cas isolé.** · **Ce n’est pas parce que… que…**', '**Je me permets de contester ce chiffre : …** · **Cet argument ne tient pas, pour deux raisons.** · **Vous confondez corrélation et causalité.** · **C’est un raccourci un peu rapide.** · **Vous généralisez à partir d’un cas isolé.** · **Ce n’est pas parce que… que…**')),
      mc(P.best, ['Vous généralisez à partir d’un cas isolé : un exemple ne fait pas une tendance.', 'Votre cousin ment.', 'Je ne vous crois pas.', 'Ce n’est pas sérieux, monsieur.'], { fr: '— Mon cousin a perdu son emploi à cause des robots, donc les robots détruisent l’emploi.' }),
      mc(P.best, ['Ce n’est pas parce que les deux augmentent ensemble que l’un cause l’autre : vous confondez corrélation et causalité.', 'C’est vrai, les glaces provoquent les noyades.', 'Les glaces sont dangereuses.', 'Je ne mange jamais de glace.'], { fr: '— Les ventes de glaces et les noyades augmentent en même temps ; les glaces provoquent donc les noyades.' }),
      sort(b('Which weakness?', 'Quelle faiblesse ?'), [b('generalisation', 'généralisation'), b('correlation ≠ causation', 'corrélation ≠ causalité'), b('false dilemma', 'faux dilemme')], [['Un cas suffit à prouver la règle.', 0], ['Ils arrivent en même temps, donc l’un cause l’autre.', 1], ['Soit on interdit tout, soit c’est le chaos.', 2], ['Tous les jeunes pensent comme mon neveu.', 0], ['Depuis la nouvelle loi, il pleut plus : c’est sa faute.', 1], ['Vous êtes avec nous ou contre nous.', 2]]),
      gap(P.complete, 'Cet argument ne ___ pas, pour deux raisons. ___ , les chiffres sont anciens ; ensuite, ils concernent un autre pays.', ['tient', ['D’abord', 'Premièrement', 'Tout d’abord']]),
      pairs(P.match, [['un sophisme', b('a fallacy', 'raisonnement trompeur')], ['un raccourci', b('a shortcut, oversimplification', 'simplification excessive')], ['un cas isolé', b('an isolated case', 'exemple unique')], ['ne pas tenir', b('not to hold up', 'être faible')]]),
      say('Je me permets de contester ce raisonnement : ce n’est pas parce que deux phénomènes coïncident que l’un explique l’autre.', 'I must challenge this reasoning: just because two phenomena coincide doesn’t mean one explains the other.'),
    ],
    [
      b('Je me permets de contester… Cet argument ne tient pas.', 'Je me permets de contester… Cet argument ne tient pas.'),
      b('Name the flaw: généralisation, corrélation/causalité, faux dilemme.', 'Nommez le défaut : généralisation, corrélation/causalité, faux dilemme.'),
      b('Ce n’est pas parce que… que…', 'Ce n’est pas parce que… que…'),
    ],
    [['une noyade', b('a drowning', 'mort dans l’eau')], ['la causalité', b('causality', 'rapport de cause')], ['une tendance', b('a trend', 'évolution générale')]],
  ),
  lesson(C, 3, ['reframing-and-concluding', 'recadrer-et-conclure'],
    b('Reframing and concluding', 'Recadrer et conclure'),
    b('Bring the debate back to the real question and sum up the positions fairly.', 'Ramener le débat à la vraie question et synthétiser honnêtement les positions.'),
    [b('Reframe the question', 'Recadrer la question'), b('Sum up the positions', 'Synthétiser les positions'), b('Conclude with an opening', 'Conclure par une ouverture')],
    13,
    [
      card(b('Reframing and concluding', 'Recadrer et conclure'), b('Reframe: **Revenons à la question de départ : …** · **La vraie question n’est pas de savoir si…, mais comment…** · **Le débat ne porte pas sur…, mais sur…** Conclude: **En définitive, …** · **Si l’on résume, deux visions s’opposent : …** · **Reste à savoir si…** (opening)', 'Recadrer : **Revenons à la question de départ : …** · **La vraie question n’est pas de savoir si…, mais comment…** · **Le débat ne porte pas sur…, mais sur…** Conclure : **En définitive, …** · **Si l’on résume, deux visions s’opposent : …** · **Reste à savoir si…** (ouverture)')),
      mc(P.best, ['La vraie question n’est pas de savoir s’il faut des écrans à l’école, mais comment apprendre aux élèves à s’en servir.', 'Les écrans, c’est mal.', 'On en a assez parlé.', 'Je n’ai pas d’avis.'], { fr: 'Le débat sur les écrans à l’école tourne en rond :' }),
      hear('Si l’on résume, deux visions s’opposent : pour les uns, la gratuité des transports est une mesure sociale et écologique ; pour les autres, elle coûte trop cher aux contribuables. Reste à savoir qui doit payer, et comment.', b('How does the speaker conclude?', 'Comment l’orateur conclut-il ?'), [b('With an open question: who should pay, and how', 'Par une question ouverte : qui doit payer, et comment'), b('By siding with free transport', 'En prenant parti pour la gratuité'), b('By rejecting both positions', 'En rejetant les deux positions'), b('By cancelling the debate', 'En annulant le débat')], { voice: 'f' }),
      gap(P.complete, 'Le débat ne ___ pas sur le coût, mais sur l’utilité du projet. En ___ , c’est un choix de société.', ['porte', 'définitive']),
      ord(P.order, 'Revenons à la question de départ, si vous le voulez bien.', { tr: 'Let’s go back to the original question, if you will.' }),
      pairs(P.match, [['recadrer', b('to reframe, refocus', 'ramener au sujet')], ['En définitive', b('Ultimately', 'pour finir')], ['un contribuable', b('a taxpayer', 'qui paie des impôts')], ['Reste à savoir si…', b('It remains to be seen whether…', 'question ouverte')]]),
      say('En définitive, deux visions s’opposent. Reste à savoir laquelle répondra le mieux aux besoins des citoyens.', 'Ultimately, two visions clash. It remains to be seen which will best meet citizens’ needs.'),
    ],
    [
      b('Reframe: La vraie question n’est pas…, mais… Le débat porte sur…', 'Recadrer : La vraie question n’est pas…, mais… Le débat porte sur…'),
      b('Sum up fairly: deux visions s’opposent : pour les uns…, pour les autres…', 'Synthétiser honnêtement : deux visions s’opposent : pour les uns…, pour les autres…'),
      b('Open: Reste à savoir si…', 'Ouvrir : Reste à savoir si…'),
    ],
    [['la gratuité', b('being free of charge', 'fait d’être gratuit')], ['tourner en rond', b('to go round in circles', 'ne pas avancer')], ['un choix de société', b('a societal choice', 'décision collective')]],
  ),
];
