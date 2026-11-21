import type { CourseAbout } from '../../types';
import { b, card, dict, gap, lesson, mc, ord, P, pairs, say, sort, tip, trap } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Les personnes souhaitant s’inscrire… Un travail fatigant… Ayant terminé ses études, elle… The present participle and the verbal adjective belong to careful written French: job ads, official letters, reports and the press. This course shows how to form and use the present participle, the compound participle (ayant fini, étant parti), and the spelling traps of the verbal adjective (fatiguant / fatigant, convainquant / convaincant).',
    'Les personnes souhaitant s’inscrire… Un travail fatigant… Ayant terminé ses études, elle… Le participe présent et l’adjectif verbal appartiennent à l’écrit soigné : offres d’emploi, lettres officielles, rapports et presse. Ce cours montre comment former et employer le participe présent, le participe composé (ayant fini, étant parti), et les pièges orthographiques de l’adjectif verbal (fatiguant / fatigant, convainquant / convaincant).',
  ),
  outcomes: [
    b('Use the present participle instead of qui + verb', 'Employer le participe présent à la place de qui + verbe'),
    b('Use ayant / étant + past participle', 'Employer ayant / étant + participe passé'),
    b('Distinguish participle and verbal adjective', 'Distinguer participe et adjectif verbal'),
    b('Spell fatigant, convaincant, négligent correctly', 'Écrire correctement fatigant, convaincant, négligent'),
  ],
};

const C = 'participles';
export default [
  lesson(C, 1, ['the-present-participle', 'le-participe-present'],
    b('The present participle in formal writing', 'Le participe présent à l’écrit soutenu'),
    b('Replace qui + verb or a cause clause with an invariable -ant form.', 'Remplacer qui + verbe ou une proposition de cause par une forme en -ant invariable.'),
    [b('Form the present participle', 'Former le participe présent'), b('Use it instead of qui + verb', 'L’employer à la place de qui + verbe'), b('Use it to express a cause', 'L’employer pour exprimer une cause')],
    13,
    [
      card(b('Same form as the gerund, without en', 'Même forme que le gérondif, sans en'), b('**nous parlons → parlant**. It is **invariable** and replaces **qui + verb** or a cause, mostly in writing: **Les candidats parlant espagnol sont prioritaires.** **Ne sachant pas quoi faire, il a appelé sa mère.**', '**nous parlons → parlant**. Il est **invariable** et remplace **qui + verbe** ou une cause, surtout à l’écrit : **Les candidats parlant espagnol sont prioritaires.** **Ne sachant pas quoi faire, il a appelé sa mère.**'), {
        ex: [['Nous recherchons une personne maîtrisant Excel.', 'We are looking for someone proficient in Excel.'], ['Étant malade, je ne pourrai pas assister à la réunion.', 'Being ill, I will not be able to attend the meeting.']],
      }),
      mc(P.best, ['Les étudiants souhaitant participer doivent s’inscrire.', 'Les étudiants souhaitants participer doivent s’inscrire.', 'Les étudiants en souhaitant participer doivent s’inscrire.', 'Les étudiants souhaités participer doivent s’inscrire.']),
      mc(P.meaning, [b('Because the shop was closed…', 'Comme le magasin était fermé…'), b('While the shop was closing…', 'Pendant que le magasin fermait…'), b('If the shop closes…', 'Si le magasin ferme…'), b('So that the shop closes…', 'Pour que le magasin ferme…')], { fr: 'Le magasin étant fermé, nous sommes allés ailleurs.' }),
      sort(b('Participle or gerund?', 'Participe ou gérondif ?'), [b('participle (no en)', 'participe (sans en)'), b('gerund (en + -ant)', 'gérondif (en + -ant)')], [['les clients ayant réservé', 0], ['il chante en conduisant', 1], ['une offre expirant lundi', 0], ['elle s’est blessée en tombant', 1], ['ne connaissant personne', 0], ['on apprend en pratiquant', 1]]),
      gap(P.complete, 'Avis : les personnes ___ (désirer) un rendez-vous doivent appeler le secrétariat.', ['désirant']),
      ord(P.order, 'Ne parlant pas français, il a pris des cours du soir.', { tr: 'Not speaking French, he took evening classes.' }),
      say('Nous recherchons une personne bilingue, aimant le contact avec le public.', 'We are looking for a bilingual person who enjoys contact with the public.'),
    ],
    [
      b('Present participle = nous stem + -ant, invariable.', 'Participe présent = radical de nous + -ant, invariable.'),
      b('Replaces qui + verb (les personnes souhaitant…) or a cause (étant malade…).', 'Remplace qui + verbe (les personnes souhaitant…) ou une cause (étant malade…).'),
      b('Mostly written, formal style.', 'Surtout à l’écrit soutenu.'),
    ],
    [['maîtriser', b('to master, to be proficient in', 'bien connaître')], ['prioritaire', b('given priority', 'qui passe en premier')], ['le secrétariat', b('the office, the administration', 'service administratif')]],
  ),
  lesson(C, 2, ['ayant-fini-etant-parti', 'ayant-fini-etant-parti'],
    b('Ayant fini, étant parti: the compound participle', 'Ayant fini, étant parti : le participe composé'),
    b('Express an action completed before another one.', 'Exprimer une action accomplie avant une autre.'),
    [b('Form ayant / étant + past participle', 'Former ayant / étant + participe passé'), b('Agree the participle after étant', 'Accorder le participe après étant'), b('Write formal sentences', 'Rédiger des phrases soutenues')],
    13,
    [
      card(b('Completed first', 'Accompli avant'), b('**ayant + participle** (avoir verbs) or **étant + participle** (être verbs) = an action **completed before** the main one, often with a causal nuance: **Ayant terminé ses études, elle a créé son entreprise.** **Étant arrivés en retard, ils ont manqué le début.**', '**ayant + participe** (verbes avec avoir) ou **étant + participe** (verbes avec être) = une action **accomplie avant** la principale, souvent avec une nuance de cause : **Ayant terminé ses études, elle a créé son entreprise.** **Étant arrivés en retard, ils ont manqué le début.**'), {
        ex: [['Ayant perdu ses clés, il a dû appeler un serrurier.', 'Having lost his keys, he had to call a locksmith.'], ['Étant née au Québec, elle parle français couramment.', 'Having been born in Québec, she speaks French fluently.']],
      }),
      trap(b('Agreement after étant', 'Accord après étant'), b('After **étant**, the participle agrees with the subject: **Étant partie tôt, Julie…** After **ayant**, it does not agree with the subject.', 'Après **étant**, le participe s’accorde avec le sujet : **Étant partie tôt, Julie…** Après **ayant**, pas d’accord avec le sujet.')),
      mc(P.form, ['Ayant obtenu', 'Étant obtenu', 'Ayant obtenue', 'En ayant obtenu'], { fr: '___ son diplôme, Sara a trouvé un poste à Ottawa.' }),
      mc(P.form, ['Étant arrivées', 'Ayant arrivé', 'Étant arrivé', 'Ayant arrivées'], { fr: '___ à l’aéroport très tôt, mes sœurs ont attendu trois heures.' }),
      pairs(P.match, [['Ayant lu votre annonce, …', b('Having read your ad, …', 'formule de lettre de motivation')], ['N’ayant pas reçu de réponse, …', b('Not having received an answer, …', 'relance')], ['Étant donné que…', b('Given that…', 'cause connue')], ['Compte tenu de…', b('Taking into account…', 'considérant')]]),
      gap(P.complete, '___ ___ (ne pas recevoir) votre paiement, nous suspendons votre abonnement.', ['N’ayant', 'pas reçu']),
      dict('Ayant lu votre annonce avec intérêt, je me permets de vous proposer ma candidature.', { voice: 'f' }),
    ],
    [
      b('ayant / étant + past participle = completed before (often a cause).', 'ayant / étant + participe passé = accompli avant (souvent une cause).'),
      b('Étant + participle agrees with the subject.', 'Étant + participe s’accorde avec le sujet.'),
      b('Letters: Ayant lu votre annonce… N’ayant pas reçu de réponse…', 'Lettres : Ayant lu votre annonce… N’ayant pas reçu de réponse…'),
    ],
    [['un serrurier', b('a locksmith', 'artisan des serrures')], ['un abonnement', b('a subscription', 'contrat d’accès régulier')], ['la candidature', b('the application', 'demande d’emploi')]],
  ),
  lesson(C, 3, ['participle-or-verbal-adjective', 'participe-ou-adjectif-verbal'],
    b('Fatiguant or fatigant? The verbal adjective', 'Fatiguant ou fatigant ? L’adjectif verbal'),
    b('Distinguish the invariable participle from the agreeing verbal adjective, and their spellings.', 'Distinguer le participe invariable de l’adjectif verbal qui s’accorde, et leurs orthographes.'),
    [b('Recognise a verbal adjective', 'Reconnaître un adjectif verbal'), b('Agree the verbal adjective', 'Accorder l’adjectif verbal'), b('Spell the tricky pairs', 'Orthographier les paires difficiles')],
    13,
    [
      card(b('Action or quality?', 'Action ou qualité ?'), b('The **participle** expresses an action, is invariable and can take a complement: **des enfants obéissant à leurs parents**. The **verbal adjective** expresses a quality and **agrees**: **des enfants obéissants**.', 'Le **participe** exprime une action, est invariable et peut avoir un complément : **des enfants obéissant à leurs parents**. L’**adjectif verbal** exprime une qualité et **s’accorde** : **des enfants obéissants**.'), {
        ex: [['Une histoire passionnante.', 'A fascinating story.'], ['Les rues glissantes sont dangereuses.', 'Slippery streets are dangerous.']],
      }),
      tip(b('Spelling pairs', 'Les paires orthographiques'), b('Some verbal adjectives change spelling: **fatiguant / fatigant, convainquant / convaincant, provoquant / provocant, négligeant / négligent, différant / différent, précédant / précédent, excellant / excellent**.', 'Certains adjectifs verbaux changent d’orthographe : **fatiguant / fatigant, convainquant / convaincant, provoquant / provocant, négligeant / négligent, différant / différent, précédant / précédent, excellant / excellent**.')),
      pairs(b('Match the participle with its verbal adjective.', 'Associez le participe à son adjectif verbal.'), [['fatiguant', 'fatigant'], ['convainquant', 'convaincant'], ['négligeant', 'négligent'], ['précédant', 'précédent']], true),
      mc(P.spelling, ['fatigant', 'fatiguant', 'fatigants', 'fatiguante'], { fr: 'Ce travail de nuit est très ___.' }),
      mc(P.spelling, ['convainquant', 'convaincant', 'convaincants', 'convainquants'], { fr: 'C’est en ___ les clients un par un qu’il a réussi.', explain: b('An action with a complement: participle.', 'Une action avec un complément : participe.') }),
      mc(P.spelling, ['différents', 'différants', 'différent', 'différentes'], { fr: 'Nous avons des avis ___.' }),
      gap(P.complete, 'Les arguments de l’avocate étaient très ___, et la semaine ___, elle avait gagné un autre procès.', ['convaincants', 'précédente'], { strict: true }),
      dict('Les jours précédant les examens sont souvent fatigants.', { voice: 'm', strict: true }),
    ],
    [
      b('Participle: action, invariable, can have a complement.', 'Participe : action, invariable, peut avoir un complément.'),
      b('Verbal adjective: quality, agrees with the noun.', 'Adjectif verbal : qualité, s’accorde avec le nom.'),
      b('fatigant, convaincant, provocant, négligent, différent, précédent, excellent.', 'fatigant, convaincant, provocant, négligent, différent, précédent, excellent.'),
    ],
    [['glissant', b('slippery', 'où l’on risque de glisser')], ['un procès', b('a trial', 'affaire jugée au tribunal')], ['obéissant', b('obedient', 'qui obéit')]],
  ),
];
