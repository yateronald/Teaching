import type { CourseAbout } from '../../types';
import { b, card, dict, doc, gap, lesson, mc, P, pairs, sort, tip, trap, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Peut-être viendra-t-il. Je crains qu’il ne pleuve. Rares sont ceux qui… At C2, mastery shows in the details: the stylistic inversion after certain adverbs, the expletive ne after verbs of fear and some conjunctions, the absolute participle, the omission of pas after a few verbs (je ne saurais dire), and the choice of the right register. This course explains these fine points with clear rules and authentic examples.',
    'Peut-être viendra-t-il. Je crains qu’il ne pleuve. Rares sont ceux qui… Au niveau C2, la maîtrise se lit dans les détails : l’inversion stylistique après certains adverbes, le ne explétif après les verbes de crainte et certaines conjonctions, la proposition participiale, l’omission de pas avec quelques verbes (je ne saurais dire) et le choix du bon registre. Ce cours explique ces subtilités avec des règles claires et des exemples authentiques.',
  ),
  outcomes: [
    b('Use stylistic inversion after peut-être, sans doute, ainsi', 'Employer l’inversion stylistique après peut-être, sans doute, ainsi'),
    b('Use and recognise the expletive ne', 'Employer et reconnaître le ne explétif'),
    b('Use ne without pas in formal style', 'Employer ne sans pas en style soutenu'),
    b('Adapt your register precisely', 'Adapter précisément son registre'),
  ],
};

const C = 'fine-points-style';
export default [
  lesson(C, 1, ['stylistic-inversion', 'inversion-stylistique'],
    b('Stylistic inversion', 'L’inversion stylistique'),
    b('Invert the subject after peut-être, sans doute, ainsi, aussi, à peine and in attributive openings.', 'Inverser le sujet après peut-être, sans doute, ainsi, aussi, à peine et dans les tournures attributives en tête.'),
    [b('Invert after peut-être and sans doute', 'Inverser après peut-être et sans doute'), b('Use aussi = therefore with inversion', 'Employer aussi = par conséquent avec inversion'), b('Use Rares sont… and Telle est…', 'Employer Rares sont… et Telle est…')],
    13,
    [
      card(b('After certain adverbs', 'Après certains adverbes'), b('In formal writing, **peut-être, sans doute, ainsi, aussi (= therefore), à peine, du moins, encore (= however)** at the start trigger inversion: **Peut-être viendra-t-il.** **Aussi avons-nous décidé de reporter la réunion.** **À peine était-il arrivé qu’il repartait.** In speech: **Peut-être qu’il viendra.**', 'À l’écrit soutenu, **peut-être, sans doute, ainsi, aussi (= par conséquent), à peine, du moins, encore (= cependant)** en tête entraînent l’inversion : **Peut-être viendra-t-il.** **Aussi avons-nous décidé de reporter la réunion.** **À peine était-il arrivé qu’il repartait.** À l’oral : **Peut-être qu’il viendra.**'), {
        ex: [['Sans doute a-t-elle raison.', 'She is no doubt right.'], ['Ainsi s’achève notre enquête.', 'Thus ends our investigation.']],
      }),
      tip(b('Attribute first', 'L’attribut en tête'), b('**Rares sont ceux qui** ont lu ce livre. **Telle est** la question. **Grande fut** sa surprise. **Nombreux sont** les candidats qui…', '**Rares sont ceux qui** ont lu ce livre. **Telle est** la question. **Grande fut** sa surprise. **Nombreux sont** les candidats qui…')),
      trap(b('Aussi at the start = therefore', 'Aussi en tête = par conséquent'), b('At the start of a sentence with inversion, **aussi** means **therefore**, not “also”: **Le budget est limité ; aussi faut-il faire des choix.**', 'En tête de phrase avec inversion, **aussi** signifie **par conséquent**, et non « également » : **Le budget est limité ; aussi faut-il faire des choix.**')),
      mc(P.best, ['Peut-être a-t-il oublié notre rendez-vous.', 'Peut-être il a-t-il oublié notre rendez-vous.', 'Peut-être a il oublié notre rendez-vous.', 'Peut-être qu’a-t-il oublié notre rendez-vous.'], { fr: 'Dans une lettre soutenue :' }),
      mc(P.meaning, [b('Therefore we had to cut costs.', 'Par conséquent, nous avons dû réduire les coûts.'), b('We also had to cut costs.', 'Nous avons également dû réduire les coûts.'), b('We should never cut costs.', 'Il ne faut jamais réduire les coûts.'), b('We cut costs as much as possible.', 'Nous avons réduit les coûts autant que possible.')], { fr: 'Les ventes ont chuté ; aussi avons-nous dû réduire les coûts.' }),
      sort(b('Spoken or formal?', 'Oral ou soutenu ?'), [b('spoken', 'oral'), b('formal', 'soutenu')], [['Peut-être qu’il pleuvra.', 0], ['Peut-être pleuvra-t-il.', 1], ['Il a sans doute raison.', 0], ['Sans doute a-t-il raison.', 1], ['Il y a peu de gens qui…', 0], ['Rares sont ceux qui…', 1]]),
      gap(P.complete, 'À ___ ___-il franchi la porte que le téléphone a sonné.', ['peine', 'avait']),
      dict('Telle est la question à laquelle nous tenterons de répondre.', { voice: 'm' }),
    ],
    [
      b('Formal inversion after peut-être, sans doute, ainsi, aussi (= therefore), à peine.', 'Inversion soutenue après peut-être, sans doute, ainsi, aussi (= par conséquent), à peine.'),
      b('Spoken alternative: Peut-être qu’il viendra.', 'Alternative orale : Peut-être qu’il viendra.'),
      b('Attribute first: Rares sont…, Telle est…, Nombreux sont…', 'Attribut en tête : Rares sont…, Telle est…, Nombreux sont…'),
    ],
    [['s’achever', b('to come to an end', 'se terminer')], ['franchir', b('to cross, to go through', 'passer')], ['chuter', b('to fall sharply', 'baisser fortement')]],
  ),
  lesson(C, 2, ['expletive-ne', 'ne-expletif'],
    b('The expletive ne', 'Le ne explétif'),
    b('Recognise and use the ne that does not negate, after fear, avant que, à moins que and comparisons.', 'Reconnaître et employer le ne qui ne nie pas, après la crainte, avant que, à moins que et les comparaisons.'),
    [b('Use ne after craindre, avoir peur que', 'Employer ne après craindre, avoir peur que'), b('Use ne after avant que, à moins que', 'Employer ne après avant que, à moins que'), b('Use ne in comparisons of inequality', 'Employer ne dans les comparaisons d’inégalité')],
    13,
    [
      card(b('A ne that does not negate', 'Un ne qui ne nie pas'), b('In careful French, an optional **ne** appears after **craindre que, avoir peur que, éviter que, empêcher que**, after **avant que, à moins que**, and in comparisons: **Je crains qu’il ne pleuve** (= I fear it will rain). **C’est plus difficile que je ne le pensais.** It does **not** make the sentence negative.', 'En français soigné, un **ne** facultatif apparaît après **craindre que, avoir peur que, éviter que, empêcher que**, après **avant que, à moins que**, et dans les comparaisons : **Je crains qu’il ne pleuve** (= j’ai peur qu’il pleuve). **C’est plus difficile que je ne le pensais.** Il ne rend **pas** la phrase négative.'), {
        ex: [['Partons avant qu’il ne soit trop tard.', 'Let’s leave before it’s too late.'], ['À moins qu’il ne change d’avis, la réunion aura lieu.', 'Unless he changes his mind, the meeting will take place.']],
      }),
      trap(b('Ne explétif vs real negation', 'Ne explétif ou vraie négation'), b('**Je crains qu’il ne vienne** = I fear he **will** come. **Je crains qu’il ne vienne pas** = I fear he **won’t** come.', '**Je crains qu’il ne vienne** = j’ai peur qu’il vienne. **Je crains qu’il ne vienne pas** = j’ai peur qu’il ne vienne pas.')),
      mc(P.meaning, [b('I’m afraid he will be late.', 'J’ai peur qu’il soit en retard.'), b('I’m afraid he won’t be late.', 'J’ai peur qu’il ne soit pas en retard.'), b('He is never late.', 'Il n’est jamais en retard.'), b('I hope he will be late.', 'J’espère qu’il sera en retard.')], { fr: 'Je crains qu’il ne soit en retard.' }),
      mc(P.meaning, [b('The film was better than I thought.', 'Le film était meilleur que ce que je pensais.'), b('The film was not as good as I thought.', 'Le film était moins bon que prévu.'), b('I didn’t think about the film.', 'Je n’ai pas pensé au film.'), b('I never think about films.', 'Je ne pense jamais aux films.')], { fr: 'Le film était meilleur que je ne le pensais.' }),
      sort(b('Expletive ne or real negation?', 'Ne explétif ou vraie négation ?'), [b('expletive (not negative)', 'explétif (non négatif)'), b('real negation', 'vraie négation')], [['avant qu’il ne parte', 0], ['il ne part pas', 1], ['de peur qu’elle ne tombe', 0], ['elle ne tombe jamais', 1], ['plus tard que je ne pensais', 0], ['je ne pensais rien', 1]]),
      gap(P.complete, 'Fermez la fenêtre de peur que le chat ___ s’échappe.', ['ne']),
      doc({ title: b('Formal letter', 'Lettre soutenue'), text: 'Madame, je crains que votre demande ne puisse être traitée avant la fin du mois. À moins que vous ne nous fassiez parvenir les pièces manquantes d’ici vendredi, votre dossier sera mis en attente.' }, P.read, [b('The request may not be processed before the end of the month.', 'La demande risque de ne pas être traitée avant la fin du mois.'), b('The request has already been processed.', 'La demande a déjà été traitée.'), b('No documents are missing.', 'Aucune pièce ne manque.'), b('The file will be closed on Friday.', 'Le dossier sera fermé vendredi.')]),
    ],
    [
      b('Expletive ne: after craindre / avoir peur que, avant que, à moins que, comparisons.', 'Ne explétif : après craindre / avoir peur que, avant que, à moins que, comparaisons.'),
      b('Optional, formal, not negative.', 'Facultatif, soutenu, non négatif.'),
      b('Real negation needs pas: qu’il ne vienne pas.', 'La vraie négation exige pas : qu’il ne vienne pas.'),
    ],
    [['s’échapper', b('to escape', 's’enfuir')], ['les pièces manquantes', b('missing documents', 'documents qui manquent')], ['mettre en attente', b('to put on hold', 'suspendre')]],
  ),
  lesson(C, 3, ['ne-without-pas-and-register', 'ne-sans-pas-et-registre'],
    b('Ne without pas, and choosing your register', 'Ne sans pas, et le choix du registre'),
    b('Use the literary negation without pas and adapt a text to its audience.', 'Employer la négation littéraire sans pas et adapter un texte à son destinataire.'),
    [b('Use je ne saurais, je n’ose, je ne cesse de', 'Employer je ne saurais, je n’ose, je ne cesse de'), b('Use the absolute participle', 'Employer la proposition participiale'), b('Rewrite a text in three registers', 'Réécrire un texte dans trois registres')],
    13,
    [
      card(b('Ne alone', 'Ne employé seul'), b('With **savoir, pouvoir, oser, cesser** (+ infinitive), formal French can drop **pas**: **Je ne saurais vous dire** (I couldn’t tell you). **Il ne cesse de pleuvoir. Je n’ose y croire. Si je ne me trompe…**', 'Avec **savoir, pouvoir, oser, cesser** (+ infinitif), le français soutenu peut omettre **pas** : **Je ne saurais vous dire. Il ne cesse de pleuvoir. Je n’ose y croire. Si je ne me trompe…**'), {
        ex: [['Je ne saurais trop vous remercier.', 'I cannot thank you enough.'], ['Elle ne cesse de progresser.', 'She keeps improving.']],
      }),
      card(b('The absolute participle', 'La proposition participiale'), b('A participle with its own subject, at the start: **La réunion terminée, chacun est rentré chez soi. Le contrat signé, les travaux ont commencé.** Elegant and concise in reports and narratives.', 'Un participe avec son propre sujet, en tête : **La réunion terminée, chacun est rentré chez soi. Le contrat signé, les travaux ont commencé.** Élégante et concise dans les rapports et les récits.')),
      pairs(b('Match each register.', 'Associez chaque registre.'), [['Je ne sais pas.', b('standard', 'courant')], ['Je sais pas.', b('informal (no ne)', 'familier (sans ne)')], ['Je ne saurais le dire.', b('formal', 'soutenu')], ['J’en sais rien, moi !', b('very informal', 'très familier')]]),
      mc(P.meaning, [b('I can’t thank you enough.', 'Je vous remercie infiniment.'), b('I don’t know how to thank you, so I won’t.', 'Je ne vous remercierai pas.'), b('I won’t thank you.', 'Je refuse de vous remercier.'), b('You don’t need to thank me.', 'Inutile de me remercier.')], { fr: 'Je ne saurais trop vous remercier.' }),
      mc(P.best, ['Le dossier complété, vous recevrez une réponse sous dix jours.', 'Le dossier complétant, vous recevrez une réponse.', 'En dossier complété, vous recevrez une réponse.', 'Le dossier est complété, recevrez une réponse.'], { fr: 'Version concise et soutenue :' }),
      sort(b('Which register?', 'Quel registre ?'), [b('informal', 'familier'), b('standard', 'courant'), b('formal', 'soutenu')], [['T’inquiète !', 0], ['Ne t’inquiète pas.', 1], ['Soyez sans inquiétude.', 2], ['C’est super cher.', 0], ['C’est très cher.', 1], ['Le coût en est fort élevé.', 2]]),
      write(b('Rewrite in a formal register.', 'Réécrivez dans un registre soutenu.'), b('Rewrite this message to a client in a formal register: « Salut, on n’a pas encore reçu vos papiers, donc on peut pas avancer. Envoyez-les vite, sinon on va devoir fermer le dossier. Merci ! »', 'Réécrivez ce message à un client dans un registre soutenu : « Salut, on n’a pas encore reçu vos papiers, donc on peut pas avancer. Envoyez-les vite, sinon on va devoir fermer le dossier. Merci ! »'), 40, 90,
        [b('A formal greeting and closing', 'Une formule d’appel et une formule finale soutenues'), b('Full negation (ne… pas) or ne alone', 'Négation complète (ne… pas) ou ne seul'), b('A polite request (veuillez, nous vous saurions gré de)', 'Une demande polie (veuillez, nous vous saurions gré de)'), b('A formal connector (faute de quoi, à défaut de)', 'Un connecteur soutenu (faute de quoi, à défaut de)')],
        'Madame, Monsieur,\nNous n’avons pas encore reçu les documents requis ; aussi ne pouvons-nous poursuivre le traitement de votre dossier. Nous vous saurions gré de bien vouloir nous les faire parvenir dans les meilleurs délais, faute de quoi nous serions contraints de le clore.\nVeuillez agréer, Madame, Monsieur, l’expression de nos salutations distinguées.',
        { phrases: ['Nous vous saurions gré de…', 'Veuillez…', 'faute de quoi…', 'dans les meilleurs délais', 'aussi ne pouvons-nous…'] }),
    ],
    [
      b('ne alone with savoir, pouvoir, oser, cesser: je ne saurais dire.', 'ne seul avec savoir, pouvoir, oser, cesser : je ne saurais dire.'),
      b('Absolute participle: La réunion terminée, chacun est parti.', 'Proposition participiale : La réunion terminée, chacun est parti.'),
      b('Formal requests: Nous vous saurions gré de…, Veuillez…', 'Demandes soutenues : Nous vous saurions gré de…, Veuillez…'),
    ],
    [['savoir gré', b('to be grateful', 'être reconnaissant')], ['clore', b('to close', 'fermer définitivement')], ['dans les meilleurs délais', b('as soon as possible', 'au plus vite')]],
  ),
];
