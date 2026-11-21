import type { CourseAbout } from '../../types';
import { b, card, dict, dlg, gap, lesson, mc, ord, P, pairs, say, sort, tip, trap } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Je te le donne, il le lui a dit, donne-le-moi, je vous en prie: when two pronouns meet, French follows a strict order. This course teaches the order in declarative sentences (me / te / se / nous / vous before le / la / les before lui / leur before y before en), in compound tenses and with infinitives, then the different order in the positive imperative, with plenty of everyday examples.',
    'Je te le donne, il le lui a dit, donne-le-moi, je vous en prie : quand deux pronoms se rencontrent, le français suit un ordre strict. Ce cours présente l’ordre dans la phrase déclarative (me / te / se / nous / vous avant le / la / les avant lui / leur avant y avant en), aux temps composés et avec l’infinitif, puis l’ordre différent de l’impératif affirmatif, avec de nombreux exemples du quotidien.',
  ),
  outcomes: [
    b('Order two object pronouns', 'Ordonner deux pronoms compléments'),
    b('Use double pronouns in compound tenses', 'Employer les doubles pronoms aux temps composés'),
    b('Use them with en and y', 'Les employer avec en et y'),
    b('Apply the imperative order', 'Appliquer l’ordre de l’impératif'),
  ],
};

const C = 'double-pronouns';
export default [
  lesson(C, 1, ['the-order-of-pronouns', 'l-ordre-des-pronoms'],
    b('The order of two pronouns', 'L’ordre de deux pronoms'),
    b('Learn the fixed order: me / te / nous / vous → le / la / les → lui / leur.', 'Retenir l’ordre fixe : me / te / nous / vous → le / la / les → lui / leur.'),
    [b('Order me / te + le / la', 'Ordonner me / te + le / la'), b('Order le / la + lui / leur', 'Ordonner le / la + lui / leur'), b('Use double pronouns in the present', 'Employer les doubles pronoms au présent')],
    13,
    [
      card(b('A fixed order', 'Un ordre fixe'), b('Before the verb: **me / te / se / nous / vous** → **le / la / les** → **lui / leur** → **y** → **en**. **Je te le prête. Elle nous les envoie. Je le lui dis. Il leur en parle.**', 'Devant le verbe : **me / te / se / nous / vous** → **le / la / les** → **lui / leur** → **y** → **en**. **Je te le prête. Elle nous les envoie. Je le lui dis. Il leur en parle.**'), {
        table: { head: ['1', '2', '3', '4', '5'], rows: [['me, te, se, nous, vous', 'le, la, les', 'lui, leur', 'y', 'en']] },
        ex: [['Tu me prêtes ton livre ? – Oui, je te le prête.', 'Will you lend me your book? – Yes, I’ll lend it to you.'], ['Tu donnes la clé à Paul ? – Oui, je la lui donne.', 'Are you giving Paul the key? – Yes, I’m giving it to him.']],
      }),
      trap(b('Lui / leur come after le / la / les', 'Lui / leur après le / la / les'), b('With **lui / leur**, the order is reversed compared with me / te: **je te le dis** but **je le lui dis**. Two pronouns of the 3rd person: le / la / les first.', 'Avec **lui / leur**, l’ordre s’inverse par rapport à me / te : **je te le dis** mais **je le lui dis**. Deux pronoms de 3e personne : le / la / les d’abord.')),
      mc(P.best, ['Je vous l’envoie demain.', 'Je l’vous envoie demain.', 'Je le vous envoie demain.', 'Je vous envoie le demain.'], { fr: '— Vous m’envoyez le contrat ?' }),
      mc(P.best, ['Je les leur ai rendus.', 'Je leur les ai rendus.', 'Je les ai leur rendus.', 'Je leur ai rendus les.'], { fr: '— Tu as rendu les livres aux étudiants ?' }),
      mc(P.best, ['Elle le lui explique.', 'Elle lui le explique.', 'Elle l’explique lui.', 'Elle lui l’explique.'], { fr: '— Elle explique le problème au client ?' }),
      sort(b('First or second position?', 'Première ou deuxième position ?'), [b('comes first', 'vient d’abord'), b('comes second', 'vient ensuite')], [['te (in te + le)', 0], ['le (in le + lui)', 0], ['lui (in le + lui)', 1], ['la (in me + la)', 1], ['nous (in nous + les)', 0], ['leur (in les + leur)', 1]]),
      gap(P.complete, 'Ton adresse ? Je ___ ___ demande pour t’envoyer une carte.', ['te', 'la']),
      say('Ta lettre ? Je te la rends demain.', 'Your letter? I’ll give it back to you tomorrow.'),
    ],
    [
      b('Order: me/te/se/nous/vous → le/la/les → lui/leur → y → en.', 'Ordre : me/te/se/nous/vous → le/la/les → lui/leur → y → en.'),
      b('je te le dis, je le lui dis, je les leur donne.', 'je te le dis, je le lui dis, je les leur donne.'),
      b('le, la + vowel → l’ (je vous l’envoie).', 'le, la + voyelle → l’ (je vous l’envoie).'),
    ],
    [['prêter', b('to lend', 'donner pour un temps')], ['rendre', b('to give back', 'restituer')], ['envoyer', b('to send', 'expédier')]],
  ),
  lesson(C, 2, ['compound-tenses-y-en', 'temps-composes-y-en'],
    b('Compound tenses, y and en', 'Temps composés, y et en'),
    b('Place two pronouns before the auxiliary, and combine them with y and en.', 'Placer deux pronoms devant l’auxiliaire, et les combiner avec y et en.'),
    [b('Place pronouns before avoir / être', 'Placer les pronoms devant avoir / être'), b('Agree the participle with le / la / les', 'Accorder le participe avec le / la / les'), b('Use lui en, m’en, il y en a', 'Employer lui en, m’en, il y en a')],
    13,
    [
      card(b('Before the auxiliary', 'Devant l’auxiliaire'), b('In compound tenses, both pronouns go **before the auxiliary**: **Je le lui ai dit. Elle me l’a offerte.** The participle agrees with a preceding **la / les**: **la robe ? Elle me l’a offerte.**', 'Aux temps composés, les deux pronoms se placent **devant l’auxiliaire** : **Je le lui ai dit. Elle me l’a offerte.** Le participe s’accorde avec **la / les** placé avant : **la robe ? Elle me l’a offerte.**'), {
        ex: [['Les photos ? Je te les ai envoyées hier.', 'The photos? I sent them to you yesterday.'], ['La nouvelle ? On la leur a annoncée ce matin.', 'The news? We told them this morning.']],
      }),
      card(b('With en and y: always last', 'Avec en et y : toujours en dernier'), b('**en** comes last: **Je lui en ai parlé. Il m’en reste deux. Donne-m’en.** **Il y en a** = there is / are some. **y** before en: **Il y en a beaucoup.**', '**en** se place en dernier : **Je lui en ai parlé. Il m’en reste deux.** **Il y en a** = il existe une certaine quantité. **y** avant en : **Il y en a beaucoup.**'), {
        ex: [['Des conseils ? Je vous en donnerai.', 'Advice? I’ll give you some.'], ['Du café ? Il n’y en a plus.', 'Coffee? There’s none left.']],
      }),
      mc(P.best, ['Je la lui ai prêtée.', 'Je lui l’ai prêtée.', 'Je l’ai lui prêté.', 'Je la lui ai prêté la.'], { fr: '— Tu as prêté ta voiture à ton frère ?' }),
      mc(P.best, ['Oui, il m’en a parlé.', 'Oui, il en m’a parlé.', 'Oui, il me l’en a parlé.', 'Oui, il m’a parlé en.'], { fr: '— Ton patron t’a parlé de la promotion ?' }),
      mc(P.best, ['Oui, il y en a deux.', 'Oui, il en y a deux.', 'Oui, il y a en deux.', 'Oui, il les y a deux.'], { fr: '— Il y a des chambres libres ?' }),
      gap(P.complete, 'Les clés ? Je te ___ ai ___ (donner) ce matin !', ['les', 'données']),
      pairs(P.match, [['Je vous en prie.', b('You’re welcome. / Please do.', 'formule de politesse')], ['Je m’en occupe.', b('I’ll take care of it.', 'je prends cela en charge')], ['Il n’y en a plus.', b('There’s none left.', 'tout est fini')], ['Je lui en veux.', b('I hold it against him / her.', 'je suis fâché contre lui')]]),
      dict('Les documents ? Je vous les ai envoyés hier soir.', { voice: 'f' }),
    ],
    [
      b('Compound tenses: both pronouns before the auxiliary (je le lui ai dit).', 'Temps composés : les deux pronoms devant l’auxiliaire (je le lui ai dit).'),
      b('Agreement with a preceding la / les: je te les ai envoyées.', 'Accord avec la / les placé avant : je te les ai envoyées.'),
      b('en always last: je lui en ai parlé, il y en a.', 'en toujours en dernier : je lui en ai parlé, il y en a.'),
    ],
    [['la promotion', b('promotion; special offer', 'avancement ; offre spéciale')], ['s’occuper de', b('to take care of', 'prendre en charge')], ['en vouloir à', b('to hold a grudge against', 'garder de la rancune')]],
  ),
  lesson(C, 3, ['the-imperative-order', 'l-ordre-a-l-imperatif'],
    b('Donne-le-moi: the imperative order', 'Donne-le-moi : l’ordre à l’impératif'),
    b('In positive orders the direct pronoun comes first; in negative orders the normal order returns.', 'À l’impératif affirmatif, le pronom COD vient d’abord ; à la forme négative, l’ordre habituel revient.'),
    [b('Order pronouns after the verb', 'Ordonner les pronoms après le verbe'), b('Use moi / toi and m’en / t’en', 'Employer moi / toi et m’en / t’en'), b('Return to the normal order in the negative', 'Revenir à l’ordre habituel au négatif')],
    13,
    [
      card(b('Positive: verb-direct-indirect', 'Affirmatif : verbe-COD-COI'), b('After the verb, with hyphens: **direct (le / la / les)** then **indirect (moi, toi, lui, nous, vous, leur)**, then **y / en**: **Donne-le-moi. Envoyez-les-nous. Rends-la-lui. Donne-m’en.**', 'Après le verbe, avec des traits d’union : **COD (le / la / les)** puis **COI (moi, toi, lui, nous, vous, leur)**, puis **y / en** : **Donne-le-moi. Envoyez-les-nous. Rends-la-lui. Donne-m’en.**'), {
        ex: [['Ce document ? Envoyez-le-moi par courriel.', 'That document? Email it to me.'], ['Des bonbons ? Donne-leur-en un peu.', 'Sweets? Give them a few.']],
      }),
      tip(b('Negative: the normal order', 'Négatif : l’ordre habituel'), b('**Ne me le donne pas. Ne la lui rends pas. Ne m’en parle pas.**', '**Ne me le donne pas. Ne la lui rends pas. Ne m’en parle pas.**')),
      mc(P.best, ['Montre-la-moi !', 'Montre-moi-la !', 'Me la montre !', 'Montre-me-la !'], { fr: 'Ta nouvelle voiture ?' }),
      mc(P.best, ['Ne le lui dis pas !', 'Ne lui le dis pas !', 'Dis-le-lui pas !', 'Ne dis-le-lui pas !'], { fr: 'Le secret ? (négatif)' }),
      mc(P.best, ['Donnez-m’en deux, s’il vous plaît.', 'Donnez-moi-en deux, s’il vous plaît.', 'M’en donnez deux.', 'Donnez-en-moi deux.']),
      sort(b('Positive or negative order?', 'Ordre affirmatif ou négatif ?'), [b('positive', 'affirmatif'), b('negative', 'négatif')], [['Dis-le-moi.', 0], ['Ne me le dis pas.', 1], ['Rends-les-leur.', 0], ['Ne les leur rends pas.', 1], ['Parle-m’en.', 0], ['Ne m’en parle pas.', 1]]),
      ord(P.order, 'Si tu as la réponse, dis-la-moi !', { tr: 'If you have the answer, tell me!' }),
      dlg(b('At the reception desk', 'À l’accueil'), undefined, [['Employé', 'm'], ['Vous', 'f']], [
        [0, 'Votre carte d’assurance maladie, s’il vous plaît.', 'Your health insurance card, please.'],
        [1, { options: ['La voici. Vous me la rendez tout de suite ?', 'La voici. Vous la me rendez ?', 'La voici. Rendez-moi-la tout de suite ?'] }],
        [0, 'Oui, bien sûr. Et le formulaire, remplissez-le et rapportez-le-moi.', 'Yes, of course. And the form: fill it in and bring it back to me.'],
        [1, { options: ['D’accord, je vous le rapporte dans cinq minutes.', 'D’accord, je le vous rapporte.', 'D’accord, rapportez-le-vous.'] }],
      ]),
    ],
    [
      b('Positive imperative: verb-le/la/les-moi/lui/nous/leur-y-en (Donne-le-moi).', 'Impératif affirmatif : verbe-le/la/les-moi/lui/nous/leur-y-en (Donne-le-moi).'),
      b('moi + en → m’en (Donne-m’en).', 'moi + en → m’en (Donne-m’en).'),
      b('Negative imperative: normal order (Ne me le donne pas).', 'Impératif négatif : ordre habituel (Ne me le donne pas).'),
    ],
    [['la carte d’assurance maladie', b('health insurance card', 'carte santé')], ['remplir', b('to fill in', 'compléter')], ['rapporter', b('to bring back', 'ramener')]],
  ),
];
