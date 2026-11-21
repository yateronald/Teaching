import type { CourseAbout } from '../../types';
import { b, card, dict, hear, lesson, P, pairs, sort, tip } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'A mayor’s address, a graduation speech, a tribute, a call to action: public speeches use rhetoric to move and persuade. This course trains you on original speech extracts to recognise the structure (opening, development, call to action), the rhetorical devices (anaphora, tripling, rhetorical questions) and the intention of the speaker, and to understand the formal register of official addresses.',
    'Le discours d’une mairesse, une allocution de remise de diplômes, un hommage, un appel à agir : les discours publics emploient la rhétorique pour émouvoir et convaincre. Ce cours vous entraîne sur des extraits originaux pour reconnaître la structure (ouverture, développement, appel à l’action), les procédés rhétoriques (anaphore, rythme ternaire, questions rhétoriques) et l’intention de l’orateur, et pour comprendre le registre soutenu des allocutions officielles.',
  ),
  outcomes: [
    b('Recognise the structure of a speech', 'Reconnaître la structure d’un discours'),
    b('Recognise rhetorical devices', 'Reconnaître les procédés rhétoriques'),
    b('Identify the speaker’s intention', 'Identifier l’intention de l’orateur'),
    b('Understand formal addresses', 'Comprendre les allocutions officielles'),
  ],
};

const C = 'l-speeches';
export default [
  lesson(C, 1, ['official-addresses', 'allocutions-officielles'],
    b('Official addresses', 'Les allocutions officielles'),
    b('Understand the formal opening, the announcement and the thanks of an official speech.', 'Comprendre l’ouverture formelle, l’annonce et les remerciements d’un discours officiel.'),
    [b('Recognise formal openings', 'Reconnaître les ouvertures formelles'), b('Catch the main announcement', 'Saisir l’annonce principale'), b('Recognise thanks and tributes', 'Reconnaître remerciements et hommages')],
    13,
    [
      card(b('Formal formulas', 'Les formules officielles'), b('Opening: **Mesdames et Messieurs, chers concitoyens, chers collègues…** Announcement: **J’ai l’honneur de vous annoncer…, C’est avec fierté que…** Thanks: **Je tiens à remercier…, Permettez-moi de saluer…**', 'Ouverture : **Mesdames et Messieurs, chers concitoyens, chers collègues…** Annonce : **J’ai l’honneur de vous annoncer…, C’est avec fierté que…** Remerciements : **Je tiens à remercier…, Permettez-moi de saluer…**')),
      hear('Mesdames et Messieurs, chers concitoyens, c’est avec une immense fierté que je vous annonce l’ouverture de notre nouveau centre communautaire.', b('What is announced?', 'Qu’est-ce qui est annoncé ?'), [b('The opening of a new community centre', 'L’ouverture d’un nouveau centre communautaire'), b('An election', 'Une élection'), b('A new tax', 'Une nouvelle taxe'), b('The mayor’s resignation', 'La démission de la mairesse')]),
      hear('Je tiens à remercier chaleureusement les bénévoles, sans qui ce projet n’aurait jamais vu le jour.', b('Who is thanked, and why?', 'Qui est remercié, et pourquoi ?'), [b('The volunteers, without whom the project would not exist', 'Les bénévoles, sans qui le projet n’existerait pas'), b('The government, for the money', 'Le gouvernement, pour l’argent'), b('The architects', 'Les architectes'), b('Nobody', 'Personne')]),
      hear('Permettez-moi enfin de saluer la mémoire de Madame Gagnon, qui a consacré sa vie à ce quartier.', b('What is this part of the speech?', 'Quelle est cette partie du discours ?'), [b('A tribute to a deceased person', 'Un hommage à une personne disparue'), b('A joke', 'Une plaisanterie'), b('A criticism', 'Une critique'), b('An announcement', 'Une annonce')]),
      sort(b('Opening, announcement or thanks?', 'Ouverture, annonce ou remerciements ?'), [b('opening', 'ouverture'), b('announcement', 'annonce'), b('thanks / tribute', 'remerciements / hommage')], [['Mesdames et Messieurs,', 0], ['J’ai l’honneur de vous annoncer…', 1], ['Je tiens à remercier…', 2], ['Chers concitoyens,', 0], ['C’est avec fierté que…', 1], ['Permettez-moi de saluer…', 2]], { listen: true }),
      pairs(P.match, [['chers concitoyens', b('fellow citizens', 'habitants de la ville')], ['voir le jour', b('to come into being', 'naître')], ['saluer la mémoire de', b('to pay tribute to (a deceased person)', 'rendre hommage à')], ['consacrer', b('to devote', 'dédier')]]),
      dict('Je tiens à remercier chaleureusement tous les bénévoles.', { voice: 'f' }),
    ],
    [
      b('Opening: Mesdames et Messieurs, chers concitoyens.', 'Ouverture : Mesdames et Messieurs, chers concitoyens.'),
      b('Announcement: J’ai l’honneur de…, C’est avec fierté que…', 'Annonce : J’ai l’honneur de…, C’est avec fierté que…'),
      b('Thanks: Je tiens à remercier…, Permettez-moi de saluer…', 'Remerciements : Je tiens à remercier…, Permettez-moi de saluer…'),
    ],
    [['un centre communautaire', b('a community centre', 'lieu de rencontre du quartier')], ['la fierté', b('pride', 'satisfaction')], ['chaleureusement', b('warmly', 'avec chaleur')]],
  ),
  lesson(C, 2, ['rhetorical-devices', 'procedes-rhetoriques'],
    b('Rhetorical devices', 'Les procédés rhétoriques'),
    b('Recognise anaphora, tripling and rhetorical questions.', 'Reconnaître l’anaphore, le rythme ternaire et la question rhétorique.'),
    [b('Recognise anaphora', 'Reconnaître l’anaphore'), b('Recognise tripling', 'Reconnaître le rythme ternaire'), b('Recognise rhetorical questions', 'Reconnaître la question rhétorique')],
    13,
    [
      card(b('Three classic devices', 'Trois procédés classiques'), b('**Anaphore**: repeating words at the start of sentences (**Nous voulons… Nous voulons… Nous voulons…**). **Rythme ternaire**: groups of three (**plus juste, plus vert, plus solidaire**). **Question rhétorique**: a question that expects no answer (**Pouvons-nous rester les bras croisés ?**).', '**Anaphore** : répétition en tête de phrases (**Nous voulons… Nous voulons…**). **Rythme ternaire** : groupes de trois (**plus juste, plus vert, plus solidaire**). **Question rhétorique** : question sans réponse attendue (**Pouvons-nous rester les bras croisés ?**).')),
      hear('Nous voulons une ville plus juste. Nous voulons une ville plus verte. Nous voulons une ville où chacun a sa place.', b('Which device is used?', 'Quel procédé est employé ?'), [b('Anaphora (repetition of « Nous voulons »)', 'L’anaphore (répétition de « Nous voulons »)'), b('A rhetorical question', 'Une question rhétorique'), b('Litote', 'La litote'), b('Irony', 'L’ironie')]),
      hear('Ce projet est plus ambitieux, plus durable et plus solidaire que tout ce que nous avons fait jusqu’ici.', b('Which device is used?', 'Quel procédé est employé ?'), [b('Tripling (three adjectives)', 'Le rythme ternaire (trois adjectifs)'), b('Anaphora', 'L’anaphore'), b('A rhetorical question', 'Une question rhétorique'), b('Understatement', 'L’atténuation')]),
      hear('Face à la crise du logement, pouvons-nous vraiment rester les bras croisés ?', b('What is the purpose of this question?', 'Quel est le but de cette question ?'), [b('To make the audience feel they must act', 'Faire sentir au public qu’il faut agir'), b('To ask for information', 'Demander une information'), b('To start a debate', 'Lancer un débat'), b('To change the subject', 'Changer de sujet')]),
      pairs(P.match, [['l’anaphore', b('anaphora (repetition at the start)', 'répétition en début de phrase')], ['le rythme ternaire', b('tripling', 'groupe de trois')], ['rester les bras croisés', b('to sit back and do nothing', 'ne rien faire')], ['solidaire', b('supportive, caring', 'qui s’entraide')]]),
      sort(b('Which device?', 'Quel procédé ?'), [b('anaphora', 'anaphore'), b('tripling', 'rythme ternaire'), b('rhetorical question', 'question rhétorique')], [['Nous voulons… Nous voulons…', 0], ['plus juste, plus vert, plus solidaire', 1], ['Pouvons-nous attendre encore ?', 2], ['C’est le moment… C’est le moment…', 0], ['écouter, comprendre, agir', 1], ['Qui peut l’accepter ?', 2]]),
      dict('Pouvons-nous vraiment rester les bras croisés ?', { voice: 'm' }),
    ],
    [
      b('Anaphora: repetition at the start of sentences.', 'Anaphore : répétition en début de phrase.'),
      b('Tripling: three words or groups.', 'Rythme ternaire : trois mots ou groupes.'),
      b('Rhetorical question: expects no answer, pushes to act.', 'Question rhétorique : sans réponse attendue, pousse à agir.'),
    ],
    [['ambitieux', b('ambitious', 'qui vise haut')], ['durable', b('sustainable, lasting', 'qui dure')], ['la crise du logement', b('the housing crisis', 'manque de logements')]],
  ),
  lesson(C, 3, ['call-to-action', 'appel-a-l-action'],
    b('Intention and call to action', 'Intention et appel à l’action'),
    b('Identify what the speaker wants the audience to feel, think or do.', 'Identifier ce que l’orateur veut faire ressentir, penser ou faire au public.'),
    [b('Identify the intention', 'Identifier l’intention'), b('Recognise the call to action', 'Reconnaître l’appel à l’action'), b('Understand a graduation speech', 'Comprendre un discours de remise de diplômes')],
    13,
    [
      tip(b('Persuade, move, mobilise', 'Convaincre, émouvoir, mobiliser'), b('Ask: does the speaker want to **convince** (arguments), **move** (emotions, personal story) or **mobilise** (imperative, nous: **Ensemble, agissons !**)? The ending usually reveals the intention.', 'Demandez-vous : l’orateur veut-il **convaincre** (arguments), **émouvoir** (émotions, récit personnel) ou **mobiliser** (impératif, nous : **Ensemble, agissons !**) ? La fin révèle en général l’intention.')),
      hear('Chers diplômés, il y a quatre ans, vous êtes arrivés ici pleins de doutes. Aujourd’hui, vous repartez pleins de projets.', b('What kind of speech is it?', 'De quel type de discours s’agit-il ?'), [b('A graduation speech', 'Un discours de remise de diplômes'), b('A political debate', 'Un débat politique'), b('A news report', 'Un reportage'), b('A business meeting', 'Une réunion d’affaires')]),
      hear('Alors osez ! Osez vous tromper, osez recommencer, osez changer le monde, même un tout petit peu.', b('What is the intention?', 'Quelle est l’intention ?'), [b('To encourage and mobilise the graduates', 'Encourager et mobiliser les diplômés'), b('To criticise them', 'Les critiquer'), b('To inform them about exams', 'Les informer sur les examens'), b('To say goodbye forever', 'Leur dire adieu pour toujours')]),
      hear('Ensemble, inscrivons-nous dès aujourd’hui au programme de plantation d’arbres. Chaque geste compte.', b('What does the speaker ask?', 'Que demande l’orateur ?'), [b('To sign up today for the tree-planting programme', 'S’inscrire dès aujourd’hui au programme de plantation d’arbres'), b('To cut trees', 'Couper des arbres'), b('To give money only', 'Donner seulement de l’argent'), b('To wait for the government', 'Attendre le gouvernement')]),
      sort(b('Convince, move or mobilise?', 'Convaincre, émouvoir ou mobiliser ?'), [b('convince', 'convaincre'), b('move', 'émouvoir'), b('mobilise', 'mobiliser')], [['Les chiffres le prouvent : …', 0], ['Je pense à ma mère, qui…', 1], ['Ensemble, agissons !', 2], ['Trois raisons justifient…', 0], ['Ce jour-là, j’ai pleuré…', 1], ['Inscrivez-vous dès aujourd’hui !', 2]]),
      pairs(P.match, [['oser', b('to dare', 'avoir le courage de')], ['un diplômé', b('a graduate', 'personne qui obtient un diplôme')], ['chaque geste compte', b('every action counts', 'tout effort est utile')], ['s’inscrire', b('to sign up', 'donner son nom')]]),
      dict('Osez vous tromper, osez recommencer, osez changer le monde.', { voice: 'f' }),
    ],
    [
      b('Intention: convince (arguments), move (emotions), mobilise (imperative, nous).', 'Intention : convaincre (arguments), émouvoir (émotions), mobiliser (impératif, nous).'),
      b('Call to action: Ensemble, agissons ! Inscrivez-vous !', 'Appel à l’action : Ensemble, agissons ! Inscrivez-vous !'),
      b('Osez + infinitive, repeated = anaphora.', 'Osez + infinitif, répété = anaphore.'),
    ],
    [['un doute', b('a doubt', 'incertitude')], ['recommencer', b('to start again', 'refaire')], ['une plantation', b('a planting', 'fait de planter')]],
  ),
];
