import type { CourseAbout } from '../../types';
import { b, card, gap, lesson, mc, ord, P, pairs, say, sort, trap } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'At C1, what distinguishes you is no longer what you say but how precisely you say it. Educated French speakers rarely assert bluntly: they qualify, soften, express degrees of certainty and leave room for discussion. This course trains the tools of nuance: modal verbs and adverbs (sans doute, a priori, plutôt), the conditional of caution, concessive structures, restrictive phrases and the art of saying no without saying it.',
    'Au niveau C1, ce qui vous distingue n’est plus ce que vous dites, mais la précision avec laquelle vous le dites. Les francophones cultivés affirment rarement de façon tranchée : ils nuancent, atténuent, expriment des degrés de certitude et laissent place à la discussion. Ce cours entraîne les outils de la nuance : verbes et adverbes modaux (sans doute, a priori, plutôt), conditionnel de prudence, structures concessives, restrictions et l’art de dire non sans le dire.',
  ),
  outcomes: [
    b('Express precise degrees of certainty', 'Exprimer des degrés précis de certitude'),
    b('Soften a statement or a criticism', 'Atténuer une affirmation ou une critique'),
    b('Use the conditional of caution', 'Employer le conditionnel de prudence'),
    b('Qualify and restrict a statement', 'Nuancer et restreindre une affirmation'),
  ],
};

const C = 'c-nuance-hedging';
export default [
  lesson(C, 1, ['degrees-of-certainty', 'degres-de-certitude'],
    b('Degrees of certainty', 'Les degrés de certitude'),
    b('Move precisely from certainty to doubt.', 'Passer avec précision de la certitude au doute.'),
    [b('Rank certainty markers', 'Classer les marqueurs de certitude'), b('Use the right mood after each', 'Employer le bon mode après chacun'), b('Beware of « sans doute »', 'Se méfier de « sans doute »')],
    13,
    [
      card(b('From certain to doubtful', 'Du certain au douteux'), b('**Il est certain / indéniable que** (indicatif) → **Il est fort probable que** (indicatif) → **Il est vraisemblable que** → **Il se pourrait que** (subjonctif) → **Il est peu probable que** (subjonctif) → **Il est exclu que** (subjonctif).', '**Il est certain / indéniable que** (indicatif) → **Il est fort probable que** (indicatif) → **Il est vraisemblable que** → **Il se pourrait que** (subjonctif) → **Il est peu probable que** (subjonctif) → **Il est exclu que** (subjonctif).')),
      trap(b('« Sans doute » is not « without doubt »', '« Sans doute » ne veut pas dire « sans aucun doute »'), b('**Sans doute** = probably. To mean certainty, say **sans aucun doute** or **à coup sûr**. « Il viendra sans doute » = he’ll probably come.', '**Sans doute** = probablement. Pour la certitude, dites **sans aucun doute** ou **à coup sûr**. « Il viendra sans doute » = il viendra probablement.')),
      sort(b('Rank the certainty', 'Classez la certitude'), [b('high', 'élevée'), b('medium', 'moyenne'), b('low', 'faible')], [['Il est indéniable que…', 0], ['Il se pourrait que…', 1], ['Il est peu probable que…', 2], ['À coup sûr, …', 0], ['Sans doute…', 1], ['Ça m’étonnerait que…', 2]]),
      mc(P.form, ['Il est peu probable que la réforme soit adoptée avant l’été.', 'Il est peu probable que la réforme sera adoptée avant l’été.', 'Il est peu probable que la réforme est adoptée avant l’été.', 'Il est peu probable de la réforme soit adoptée.']),
      mc(P.meaning, [b('She will probably accept.', 'Elle acceptera probablement.'), b('She will certainly accept.', 'Elle acceptera certainement, c’est sûr.'), b('She will refuse.', 'Elle refusera.'), b('She has no doubts.', 'Elle n’a aucun doute.')], { fr: '« Elle acceptera sans doute notre proposition. »' }),
      pairs(P.match, [['indéniable', b('undeniable', 'qu’on ne peut contester')], ['vraisemblable', b('likely, plausible', 'qui semble vrai')], ['à coup sûr', b('for sure', 'certainement')], ['exclu', b('out of the question', 'impossible')]]),
      say('Il est fort probable que le projet soit retardé, mais il est exclu qu’il soit abandonné.', 'It is very likely that the project will be delayed, but it is out of the question that it will be abandoned.'),
    ],
    [
      b('Certain / probable + indicatif; possible / unlikely / excluded + subjonctif.', 'Certain / probable + indicatif ; possible / peu probable / exclu + subjonctif.'),
      b('Sans doute = probably; sans aucun doute = certainly.', 'Sans doute = probablement ; sans aucun doute = certainement.'),
      b('Choose the exact degree you mean.', 'Choisissez le degré exact que vous visez.'),
    ],
    [['une réforme', b('a reform', 'changement de loi')], ['retarder', b('to delay', 'repousser')], ['abandonner', b('to abandon', 'renoncer à')]],
  ),
  lesson(C, 2, ['softening-and-caution', 'attenuer-et-prudence'],
    b('Softening and caution', 'Atténuer et parler avec prudence'),
    b('Soften criticism and present unconfirmed information carefully.', 'Atténuer une critique et présenter une information non confirmée avec prudence.'),
    [b('Soften with adverbs and litotes', 'Atténuer avec adverbes et litotes'), b('Use the conditional of caution', 'Employer le conditionnel de prudence'), b('Criticise constructively', 'Critiquer de façon constructive')],
    13,
    [
      card(b('Softeners', 'Les atténuateurs'), b('**plutôt, un peu, assez, relativement, quelque peu** · **a priori** (as far as I can tell) · **il me semble que** · **j’ai l’impression que** · **si je ne m’abuse** (if I’m not mistaken). Litote: **ce n’est pas tout à fait ce que j’attendais** (= disappointed).', '**plutôt, un peu, assez, relativement, quelque peu** · **a priori** · **il me semble que** · **j’ai l’impression que** · **si je ne m’abuse**. Litote : **ce n’est pas tout à fait ce que j’attendais** (= déçu).')),
      card(b('The conditional of caution', 'Le conditionnel de prudence'), b('Journalists and professionals use the conditional for unconfirmed facts: **Selon nos informations, le directeur aurait démissionné.** (= reportedly resigned) · **L’accident aurait fait trois blessés.** · **Il s’agirait d’une erreur technique.**', 'Journalistes et professionnels emploient le conditionnel pour les faits non confirmés : **Selon nos informations, le directeur aurait démissionné.** · **L’accident aurait fait trois blessés.** · **Il s’agirait d’une erreur technique.**')),
      mc(P.best, ['Le rapport est intéressant, mais il me semble que la conclusion est un peu rapide.', 'Votre rapport est nul.', 'La conclusion est fausse, recommencez.', 'Je n’ai rien compris, c’est mal écrit.'], { fr: 'Vous commentez le rapport d’un collègue :' }),
      mc(P.meaning, [b('It is reported, but not confirmed, that the minister resigned.', 'On rapporte, sans confirmation, que la ministre a démissionné.'), b('The minister will resign tomorrow.', 'La ministre démissionnera demain.'), b('The minister would like to resign.', 'La ministre aimerait démissionner.'), b('It is certain that she resigned.', 'Il est certain qu’elle a démissionné.')], { fr: '« Selon plusieurs sources, la ministre aurait présenté sa démission. »' }),
      gap(P.complete, 'D’après les premiers témoignages, l’incendie ___ été provoqué par un court-circuit.', ['aurait']),
      sort(b('Blunt or nuanced?', 'Brutal ou nuancé ?'), [b('blunt', 'brutal'), b('nuanced', 'nuancé')], [['C’est faux.', 0], ['Ce n’est pas tout à fait exact.', 1], ['Votre plan ne marchera pas.', 0], ['A priori, ce plan me semble risqué.', 1], ['C’est trop cher.', 0], ['C’est relativement coûteux.', 1]]),
      say('A priori, l’idée me semble bonne, mais j’ai l’impression que le calendrier est un peu serré.', 'As far as I can tell, the idea seems good, but I have the impression that the schedule is a bit tight.'),
    ],
    [
      b('Soften: plutôt, un peu, relativement, a priori, il me semble que.', 'Atténuer : plutôt, un peu, relativement, a priori, il me semble que.'),
      b('Conditional of caution: le directeur aurait démissionné (unconfirmed).', 'Conditionnel de prudence : le directeur aurait démissionné (non confirmé).'),
      b('Litote softens disappointment: pas tout à fait ce que j’attendais.', 'La litote adoucit la déception : pas tout à fait ce que j’attendais.'),
    ],
    [['démissionner', b('to resign', 'quitter son poste')], ['un témoignage', b('a testimony, an account', 'récit d’un témoin')], ['serré', b('tight', 'avec peu de marge')]],
  ),
  lesson(C, 3, ['qualifying-and-saying-no', 'nuancer-et-dire-non'],
    b('Qualifying, and saying no without saying it', 'Nuancer, et dire non sans le dire'),
    b('Restrict a general statement and refuse diplomatically.', 'Restreindre une affirmation générale et refuser avec diplomatie.'),
    [b('Restrict a generalisation', 'Restreindre une généralisation'), b('Concede and qualify', 'Concéder et nuancer'), b('Refuse diplomatically', 'Refuser avec diplomatie')],
    13,
    [
      card(b('Qualifying', 'Nuancer'), b('Restrict: **dans une certaine mesure** · **jusqu’à un certain point** · **du moins en partie** · **dans la plupart des cas** · **pas forcément** · **ça dépend des cas**. Concede: **Sans nier que…, il faut reconnaître que…** · **S’il est vrai que…, il n’en reste pas moins que…**', 'Restreindre : **dans une certaine mesure** · **jusqu’à un certain point** · **du moins en partie** · **dans la plupart des cas** · **pas forcément** · **ça dépend des cas**. Concéder : **Sans nier que…, il faut reconnaître que…** · **S’il est vrai que…, il n’en reste pas moins que…**')),
      card(b('Saying no diplomatically', 'Dire non avec diplomatie'), b('**Ça me paraît difficile dans l’immédiat.** · **Je ne suis pas certain(e) que ce soit le bon moment.** · **Laissez-moi y réfléchir.** · **C’est une piste intéressante, mais…** · **En l’état, ce ne sera pas possible.**', '**Ça me paraît difficile dans l’immédiat.** · **Je ne suis pas certain(e) que ce soit le bon moment.** · **Laissez-moi y réfléchir.** · **C’est une piste intéressante, mais…** · **En l’état, ce ne sera pas possible.**')),
      mc(P.best, ['C’est une piste intéressante, mais en l’état, cela me paraît difficile dans l’immédiat.', 'Non.', 'Jamais de la vie.', 'C’est une idée absurde.'], { fr: 'Un client propose de doubler le projet sans augmenter le budget :' }),
      mc(P.best, ['Dans une certaine mesure, oui, mais pas forcément dans les petites entreprises.', 'Oui, toujours, partout.', 'Non, jamais.', 'Je ne sais pas, ça m’est égal.'], { fr: '— Le télétravail améliore la productivité, non ?' }),
      gap(P.complete, 'S’il est vrai que le projet coûte cher, il n’en ___ pas moins qu’il est indispensable.', ['reste']),
      ord(P.order, 'Je ne suis pas certaine que ce soit le bon moment.', { tr: 'I’m not sure it’s the right time.' }),
      say('S’il est vrai que la proposition est séduisante, il n’en reste pas moins qu’elle est difficile à financer en l’état.', 'While it’s true that the proposal is attractive, the fact remains that it’s hard to fund as it stands.'),
    ],
    [
      b('Restrict: dans une certaine mesure, pas forcément, ça dépend des cas.', 'Restreindre : dans une certaine mesure, pas forcément, ça dépend des cas.'),
      b('S’il est vrai que…, il n’en reste pas moins que…', 'S’il est vrai que…, il n’en reste pas moins que…'),
      b('Diplomatic no: Ça me paraît difficile dans l’immédiat. En l’état…', 'Non diplomatique : Ça me paraît difficile dans l’immédiat. En l’état…'),
    ],
    [['en l’état', b('as it stands', 'dans la situation actuelle')], ['une piste', b('a lead, an avenue', 'idée à explorer')], ['séduisant', b('attractive, appealing', 'qui plaît')]],
  ),
];
