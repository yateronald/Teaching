import type { CourseAbout } from '../../types';
import { b, card, dict, dlg, gap, hear, lesson, mc, ord, P, pairs, say, sort, tip, trap } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'In French, subject pronouns (je, tu, il, ils) can only stand right before a conjugated verb. Everywhere else — after a preposition (avec moi, chez eux), alone in a short answer (Qui ? — Lui !), for emphasis (Moi, j’adore ça !), or after que in comparisons (plus grand que toi) — you switch to stressed pronouns (pronoms toniques): moi, toi, lui, elle, nous, vous, eux, elles. This A2 course teaches all their uses in natural conversation.',
    'En français, les pronoms sujets (je, tu, il, ils) ne peuvent se placer que devant un verbe conjugué. Partout ailleurs — après une préposition (avec moi, chez eux), dans une réponse courte (Qui ? — Lui !), pour insister (Moi, j’adore ça !) ou après que dans une comparaison (plus grand que toi) — on emploie les pronoms toniques : moi, toi, lui, elle, nous, vous, eux, elles. Ce cours A2 vous fait pratiquer tous leurs emplois.',
  ),
  outcomes: [
    b('Choose the right stressed pronoun after any preposition', 'Choisir le bon pronom tonique après toute préposition'),
    b('Answer short questions and add emphasis with moi, toi, lui, eux', 'Répondre brièvement et insister avec moi, toi, lui, eux'),
    b('Use c’est moi / ce sont eux and moi aussi / moi non plus', 'Employer c’est moi / ce sont eux et moi aussi / moi non plus'),
    b('Compare with que + stressed pronoun and use -même / soi', 'Comparer avec que + pronom tonique et employer -même / soi'),
  ],
};

const C = 'g-stressed-pronouns';
export default [
  lesson(C, 1, ['after-prepositions', 'apres-une-preposition'],
    b('Moi, toi, lui, eux after prepositions', 'Moi, toi, lui, eux après une préposition'),
    b('Learn the eight stressed pronouns and use them after avec, pour, chez, sans, devant.', 'Apprendre les huit pronoms toniques et les employer après avec, pour, chez, sans, devant.'),
    [b('Match subject and stressed pronouns', 'Relier pronoms sujets et pronoms toniques'), b('Use stressed pronouns after prepositions', 'Employer les pronoms toniques après préposition'), b('Express ownership with être à + pronoun', 'Exprimer l’appartenance avec être à + pronom')],
    13,
    [
      card(b('The eight forms', 'Les huit formes'), b('After prepositions (**avec, pour, chez, sans, devant, contre, grâce à, à côté de**), never use **je, tu, il, ils**. Use **moi, toi, lui, elle, nous, vous, eux, elles**. Notice only **nous** and **vous** stay the same; **il → lui** and **ils → eux**!', 'Après une préposition (**avec, pour, chez, sans, devant, contre, grâce à, à côté de**), on n’emploie jamais **je, tu, il, ils**, mais **moi, toi, lui, elle, nous, vous, eux, elles**. Seuls **nous** et **vous** ne changent pas ; **il → lui** et **ils → eux** !'), {
        table: { head: [b('subject', 'sujet'), b('stressed', 'tonique'), b('example', 'exemple')], rows: [['je / tu', 'moi / toi', 'avec moi, pour toi'], ['il / elle', 'lui / elle', 'chez lui, sans elle'], ['nous / vous', 'nous / vous', 'devant nous, avec vous'], ['ils / elles', 'eux / elles', 'grâce à eux, chez elles']] },
      }),
      pairs(P.match, [['chez moi', b('at my place', 'à mon domicile')], ['pour lui', b('for him', 'à son intention')], ['avec eux', b('with them (m.)', 'en leur compagnie')], ['sans elles', b('without them (f.)', 'en leur absence')]]),
      mc(P.word, ['eux', 'ils', 'leur', 'lui'], { fr: 'Mes cousins arrivent : je dîne chez ___ ce soir.' }),
      mc(P.word, ['lui', 'il', 'le', 'eux'], { fr: 'C’est l’anniversaire de Léo, ce cadeau est pour ___.' }),
      mc(P.best, ['Ce sac est à moi.', 'Ce sac est à je.', 'Ce sac est moi.', 'Ce sac est mon.'], { explain: b('Possession with être à + stressed pronoun.', 'Appartenance avec être à + pronom tonique.') }),
      gap(P.complete, 'Tu pars avec ___ (Paul et Marc) ? – Non, je reste avec ___ (Claire).', ['eux', 'elle']),
      ord(P.order, 'Tu viens chez moi avec eux ?', { tr: 'Are you coming to my place with them?' }),
      say('Viens chez nous samedi, on ne veut pas fêter sans toi !', 'Come to our place on Saturday, we don’t want to celebrate without you!'),
    ],
    [
      b('Stressed pronouns: moi, toi, lui, elle, nous, vous, eux, elles.', 'Pronoms toniques : moi, toi, lui, elle, nous, vous, eux, elles.'),
      b('Always use them after prepositions: avec moi, chez lui, pour eux.', 'Toujours après une préposition : avec moi, chez lui, pour eux.'),
      b('Ownership: Ce livre est à toi.', 'Appartenance : Ce livre est à toi.'),
    ],
    [['chez lui', b('at his place', 'à son domicile')], ['grâce à', b('thanks to', 'par l’aide de')], ['sans eux', b('without them (m.)', 'en leur absence')]],
  ),
  lesson(C, 2, ['emphasis-and-short-answers', 'insistance-et-reponses-courtes'],
    b('Short answers, emphasis & c’est moi', 'Réponses courtes, insistance et c’est moi'),
    b('Answer without a verb, highlight a contrast and use c’est / ce sont + stressed pronoun.', 'Répondre sans verbe, marquer un contraste et employer c’est / ce sont + pronom tonique.'),
    [b('Use stressed pronouns alone', 'Employer les pronoms toniques seuls'), b('Contrast two people: Moi, je… et toi ?', 'Opposer deux personnes : Moi, je… et toi ?'), b('Use c’est moi / ce sont eux', 'Employer c’est moi / ce sont eux')],
    13,
    [
      card(b('Alone, for contrast, and after c’est', 'Seuls, pour insister et après c’est'), b('Without a verb, always use a stressed pronoun: **Qui veut du café ? — Moi !** **Moi aussi / moi non plus** (agreement). To contrast or insist: **Moi, je préfère le thé ; lui, il prend du café.** After **c’est**: **C’est moi, c’est toi, c’est lui**, and plural **c’est eux** (spoken) or **ce sont eux** (standard).', 'Sans verbe, employez toujours le pronom tonique : **Qui veut du café ? — Moi !** **Moi aussi / moi non plus.** Pour insister ou opposer : **Moi, je préfère le thé ; lui, il prend du café.** Après **c’est** : **C’est moi, c’est toi, c’est lui**, et au pluriel **ce sont eux** (standard) ou **c’est eux** (oral).'), {
        ex: [['— Qui a téléphoné ? — C’est lui !', '“Who called?” “It’s him!”'], ['Toi, tu rentres en métro ?', 'Are you going home by metro?'], ['— Je n’aime pas ce film. — Moi non plus.', '“I don’t like this film.” “Me neither.”']],
      }),
      tip(b('Moi aussi vs moi non plus', 'Moi aussi ou moi non plus'), b('Agree with an **affirmative** statement using **moi aussi** (*me too*). Agree with a **negative** statement using **moi non plus** (*me neither*): **— Je ne fume pas. — Moi non plus.**', 'Approuvez une phrase **affirmative** avec **moi aussi**. Approuvez une phrase **négative** avec **moi non plus** : **— Je ne fume pas. — Moi non plus.**')),
      hear('— Je n’ai pas encore dîné. — Moi non plus, on mange ensemble ?', P.listen, [b('Neither speaker has had dinner yet.', 'Aucune des deux personnes n’a encore dîné.'), b('Both speakers have already eaten.', 'Les deux personnes ont déjà mangé.'), b('Only the second speaker is hungry.', 'Seule la deuxième personne a faim.'), b('They decide to eat separately.', 'Elles décident de manger séparément.')]),
      mc(P.best, ['Moi aussi !', 'Moi non plus !', 'Je aussi !', 'Moi même !'], { fr: '— J’adore la cuisine italienne ! — ___' }),
      mc(P.best, ['C’est moi qui prépare le repas.', 'C’est je qui prépare le repas.', 'Je c’est qui prépare le repas.', 'C’est me qui prépare le repas.']),
      gap(P.complete, '___, je travaille le samedi, mais ___, ils ont leur week-end.', ['Moi', 'eux']),
      dlg(b('Meeting at the station', 'Rendez-vous à la gare'), b('Two friends spot each other and greet a couple.', 'Deux amis se retrouvent et accueillent un couple.'), [['Camille', 'f'], ['Vous', 'm']], [
        [0, 'Salut ! Tu attends Paul et Sarah ?', 'Hi! Are you waiting for Paul and Sarah?'],
        [1, { options: ['Oui, ce sont eux qui arrivent par le train de Lyon.', 'Oui, ce sont ils qui arrivent.', 'Oui, c’est leur qui arrive.'] }],
        [0, 'Super ! Moi, je n’ai pas encore acheté de fleurs pour Sarah.', 'Great! I haven’t bought flowers for Sarah yet.'],
        [1, { options: ['Moi non plus ! On passe chez le fleuriste ensemble ?', 'Moi aussi ! On passe chez le fleuriste ?', 'Je non plus ! On passe chez le fleuriste ?'] }],
      ]),
      dict('Eux, ils habitent à Nice, mais moi, je vis à Lyon.', { voice: 'm' }),
    ],
    [
      b('Short answers without a verb: Moi ! Pas lui ! Eux aussi !', 'Réponses sans verbe : Moi ! Pas lui ! Eux aussi !'),
      b('Moi aussi (affirmative) vs moi non plus (negative).', 'Moi aussi (affirmatif) ou moi non plus (négatif).'),
      b('c’est moi / toi / lui / elle / nous / vous, and ce sont eux / elles.', 'c’est moi / toi / lui / elle / nous / vous, et ce sont eux / elles.'),
    ],
    [['moi non plus', b('me neither', 'pas moi non plus')], ['le fleuriste', b('the florist', 'boutique de fleurs')], ['ensemble', b('together', 'l’un avec l’autre')]],
  ),
  lesson(C, 3, ['comparisons-and-moi-meme', 'comparaisons-et-moi-meme'],
    b('Comparisons, -même and soi', 'Comparaisons, -même et soi'),
    b('Use stressed pronouns after que in comparisons, add -même, and use soi for general statements.', 'Employer les pronoms toniques après que dans les comparaisons, ajouter -même et utiliser soi.'),
    [b('Compare using plus / moins / aussi… que + stressed pronoun', 'Comparer avec que + pronom tonique'), b('Add -même for emphasis', 'Ajouter -même pour insister'), b('Use soi after on / chacun / tout le monde', 'Employer soi après on / chacun / tout le monde')],
    13,
    [
      card(b('Comparisons, -même and soi', 'Comparaisons, -même et soi'), b('In comparisons without a second verb, use a stressed pronoun after **que**: **Il est plus grand que moi. Elle court aussi vite que lui.** Add **-même(s)** for *myself / yourself / themselves*: **Je l’ai fait moi-même. Ils l’ont réparé eux-mêmes.** For general subjects (**on, chacun, tout le monde, il faut**), use **soi**: **On est bien chez soi.**', 'Dans une comparaison sans deuxième verbe, utilisez le pronom tonique après **que** : **Il est plus grand que moi. Elle court aussi vite que lui.** Ajoutez **-même(s)** pour insister : **Je l’ai fait moi-même. Ils l’ont réparé eux-mêmes.** Avec un sujet général (**on, chacun, tout le monde, il faut**), utilisez **soi** : **On est bien chez soi.**'), {
        ex: [['Ma sœur parle mieux anglais que moi.', 'My sister speaks English better than I do.'], ['Prenez soin de vous, chacun doit penser à soi.', 'Take care of yourselves, everyone must look after themselves.'], ['Tu as peint ce tableau toi-même ?', 'Did you paint this picture yourself?']],
      }),
      trap(b('« Soi » vs « lui / eux »', '« Soi » ou « lui / eux »'), b('Use **soi** only when the subject is **indefinite or general** (**on, chacun, personne**): **Chacun travaille pour soi.** With a **specific** person, use **lui, elle, eux**: **Paul travaille pour lui** (not « pour soi »).', 'N’employez **soi** qu’avec un sujet **indéfini ou général** (**on, chacun, personne**) : **Chacun travaille pour soi.** Avec une personne **précise**, dites **lui, elle, eux** : **Paul travaille pour lui.**')),
      sort(b('Soi or lui / eux?', 'Soi ou lui / eux ?'), ['soi', 'lui / eux'], [['On est bien chez …', 0], ['Marc rentre chez …', 1], ['Chacun pour …', 0], ['Les joueurs ont confiance en …', 1], ['Il faut avoir confiance en …', 0], ['Paul ne pense qu’à …', 1]]),
      mc(P.word, ['toi', 'tu', 'te', 'ton'], { fr: 'Ton collègue est arrivé plus tôt que ___.' }),
      mc(P.form, ['elles-mêmes', 'elles-même', 'eux-mêmes', 'elle-même'], { fr: 'Elles ont préparé tout le dîner ___.' }),
      gap(P.complete, 'Tu parles plus vite que ___, mais j’ai écrit ce texte ___-même.', ['lui', 'moi']),
      ord(P.order, 'On est toujours bien chez soi.', { tr: 'There’s no place like home.' }),
      say('Mon frère est plus patient que moi, mais j’ai réparé le vélo moi-même.', 'My brother is more patient than me, but I fixed the bike myself.'),
    ],
    [
      b('Comparison without a verb: plus / moins / aussi… que + stressed pronoun.', 'Comparaison sans verbe : plus / moins / aussi… que + pronom tonique.'),
      b('-même(s) adds “myself / themselves”: moi-même, nous-mêmes, eux-mêmes.', '-même(s) renforce le pronom : moi-même, nous-mêmes, eux-mêmes.'),
      b('soi refers back to on, chacun, tout le monde, personne.', 'soi renvoie à on, chacun, tout le monde, personne.'),
    ],
    [['avoir confiance en', b('to trust', 'croire en quelqu’un')], ['réparer', b('to fix, repair', 'remettre en état')], ['chez soi', b('at home (in general)', 'dans son propre logement')]],
  ),
];
