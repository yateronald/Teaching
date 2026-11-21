import type { CourseAbout } from '../../types';
import { b, card, dict, dlg, gap, lesson, mc, ord, P, pairs, say, sort, tip, trap } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'C’est toi qui as raison. Ce qui m’inquiète, c’est le délai. Moi, je ne suis pas d’accord. French rarely stresses a word with the voice the way English does: it moves it to the front or frames it. This course teaches the main tools of emphasis (c’est… qui / que, ce qui… c’est, ce que… c’est, stressed pronouns, dislocation) and how to use them to argue, correct a misunderstanding and highlight the key point in a presentation.',
    'C’est toi qui as raison. Ce qui m’inquiète, c’est le délai. Moi, je ne suis pas d’accord. Le français met rarement un mot en valeur par la seule voix, comme l’anglais : il le déplace en tête ou l’encadre. Ce cours présente les principaux outils de mise en relief (c’est… qui / que, ce qui… c’est, ce que… c’est, pronoms toniques, dislocation) et la façon de s’en servir pour argumenter, corriger un malentendu et souligner l’essentiel dans un exposé.',
  ),
  outcomes: [
    b('Use c’est… qui and c’est… que', 'Employer c’est… qui et c’est… que'),
    b('Use ce qui… c’est and ce que… c’est', 'Employer ce qui… c’est et ce que… c’est'),
    b('Detach an element with a stressed pronoun', 'Détacher un élément avec un pronom tonique'),
    b('Highlight the key point when you argue', 'Souligner l’essentiel quand on argumente'),
  ],
};

const C = 'emphasis';
export default [
  lesson(C, 1, ['cest-qui-cest-que', 'cest-qui-cest-que'],
    b('C’est… qui, c’est… que', 'C’est… qui, c’est… que'),
    b('Frame the element you want to highlight, and agree the verb correctly.', 'Encadrer l’élément à mettre en valeur, et accorder correctement le verbe.'),
    [b('Highlight the subject with c’est… qui', 'Mettre en relief le sujet avec c’est… qui'), b('Highlight other elements with c’est… que', 'Mettre en relief les autres éléments avec c’est… que'), b('Agree the verb after c’est moi qui', 'Accorder le verbe après c’est moi qui')],
    13,
    [
      card(b('Framing', 'L’encadrement'), b('**C’est + subject + qui**: **C’est Léa qui a gagné.** **C’est + other element + que**: **C’est demain que je pars. C’est à Paris qu’ils se sont rencontrés. C’est pour toi que je fais ça.**', '**C’est + sujet + qui** : **C’est Léa qui a gagné.** **C’est + autre élément + que** : **C’est demain que je pars. C’est à Paris qu’ils se sont rencontrés. C’est pour toi que je fais ça.**'), {
        ex: [['C’est le directeur qui a pris la décision.', 'It’s the director who made the decision.'], ['C’est en lisant qu’on apprend.', 'It’s by reading that you learn.']],
      }),
      trap(b('C’est moi qui suis', 'C’est moi qui suis'), b('The verb after **qui** agrees with the stressed pronoun: **C’est moi qui suis responsable. C’est nous qui avons appelé. C’est vous qui décidez.**', 'Le verbe après **qui** s’accorde avec le pronom tonique : **C’est moi qui suis responsable. C’est nous qui avons appelé. C’est vous qui décidez.**')),
      mc(P.form, ['ai', 'a', 'as', 'avons'], { fr: 'C’est moi qui ___ organisé la fête.' }),
      mc(P.best, ['C’est en hiver que nous partons au Mexique.', 'C’est en hiver qui nous partons au Mexique.', 'C’est en hiver dont nous partons.', 'C’est l’hiver où que nous partons.']),
      mc(P.best, ['Non, c’est Paul qui l’a cassé.', 'Non, c’est Paul que l’a cassé.', 'Non, Paul c’est qui l’a cassé.', 'Non, c’est Paul l’a cassé.'], { fr: '— C’est toi qui as cassé le vase ?' }),
      gap(P.complete, 'C’est vous ___ ___ (avoir) raison, et c’est pour cette raison ___ je vous soutiens.', ['qui', 'avez', 'que']),
      ord(P.order, 'C’est grâce à toi que j’ai trouvé ce travail.', { tr: 'It’s thanks to you that I found this job.' }),
      say('Ce n’est pas moi qui ai choisi, c’est mon équipe qui a voté.', 'It wasn’t me who chose, it was my team who voted.'),
    ],
    [
      b('C’est + subject + qui; c’est + other element + que.', 'C’est + sujet + qui ; c’est + autre élément + que.'),
      b('Agreement: c’est moi qui suis, c’est nous qui avons.', 'Accord : c’est moi qui suis, c’est nous qui avons.'),
      b('Plural in formal style: ce sont eux qui…', 'Pluriel soutenu : ce sont eux qui…'),
    ],
    [['casser', b('to break', 'briser')], ['soutenir', b('to support', 'appuyer')], ['voter', b('to vote', 'exprimer son choix')]],
  ),
  lesson(C, 2, ['ce-qui-cest', 'ce-qui-cest'],
    b('Ce qui…, c’est… / Ce que…, c’est…', 'Ce qui…, c’est… / Ce que…, c’est…'),
    b('Announce what matters first and reveal it after c’est.', 'Annoncer ce qui compte d’abord, et le révéler après c’est.'),
    [b('Use ce qui… c’est (subject)', 'Employer ce qui… c’est (sujet)'), b('Use ce que / ce dont / ce à quoi… c’est', 'Employer ce que / ce dont / ce à quoi… c’est'), b('Present the key point of an argument', 'Présenter le point essentiel d’un argument')],
    13,
    [
      card(b('Suspense structure', 'Une structure à suspense'), b('Start with **ce qui / ce que / ce dont / ce à quoi**, then reveal with **c’est**: **Ce qui me plaît, c’est l’ambiance. Ce que je veux, c’est du calme. Ce dont j’ai besoin, c’est de temps. Ce à quoi je pense, c’est à l’avenir.**', 'Commencez par **ce qui / ce que / ce dont / ce à quoi**, puis révélez avec **c’est** : **Ce qui me plaît, c’est l’ambiance. Ce que je veux, c’est du calme. Ce dont j’ai besoin, c’est de temps. Ce à quoi je pense, c’est à l’avenir.**'), {
        ex: [['Ce qui m’inquiète, c’est le coût du projet.', 'What worries me is the cost of the project.'], ['Ce que je retiens, c’est votre motivation.', 'What I remember is your motivation.']],
      }),
      tip(b('Keep the preposition', 'Gardez la préposition'), b('With ce dont / ce à quoi, the preposition comes back after c’est: **Ce dont il parle, c’est de son voyage. Ce à quoi je tiens, c’est à ma liberté.**', 'Avec ce dont / ce à quoi, la préposition revient après c’est : **Ce dont il parle, c’est de son voyage. Ce à quoi je tiens, c’est à ma liberté.**')),
      mc(P.word, ['Ce qui', 'Ce que', 'Ce dont', 'Ce à quoi'], { fr: '___ me fait peur, c’est l’hiver québécois.' }),
      mc(P.word, ['Ce dont', 'Ce que', 'Ce qui', 'Ce à quoi'], { fr: '___ nous avons besoin, c’est d’un plan clair.' }),
      sort(b('Which opening?', 'Quelle ouverture ?'), ['ce qui', 'ce que', 'ce dont'], [['… m’intéresse, c’est…', 0], ['… j’aime, c’est…', 1], ['… je rêve, c’est de…', 2], ['… compte, c’est…', 0], ['… vous proposez, c’est…', 1], ['… il se plaint, c’est de…', 2]]),
      gap(P.complete, '___ ___ je préfère dans ce métier, c’est le contact humain.', ['Ce', 'que']),
      dlg(b('A job interview', 'Un entretien d’embauche'), undefined, [['Recruteur', 'm'], ['Vous', 'f']], [
        [0, 'Qu’est-ce qui vous attire dans ce poste ?', 'What attracts you to this position?'],
        [1, { options: ['Ce qui m’attire, c’est la dimension internationale de l’équipe.', 'Ce que m’attire, c’est l’équipe.', 'Ce dont m’attire, c’est l’équipe.'] }],
        [0, 'Et qu’est-ce que vous attendez de nous ?', 'And what do you expect from us?'],
        [1, { options: ['Ce que j’attends, c’est la possibilité d’évoluer.', 'Ce qui j’attends, c’est d’évoluer.', 'Ce dont j’attends, c’est évoluer.'] }],
      ]),
      say('Ce qui compte pour moi, c’est d’apprendre tous les jours.', 'What matters to me is learning every day.'),
    ],
    [
      b('Ce qui (subject) / ce que (object) / ce dont (de) / ce à quoi (à) …, c’est …', 'Ce qui (sujet) / ce que (COD) / ce dont (de) / ce à quoi (à) …, c’est …'),
      b('Repeat the preposition: Ce dont j’ai besoin, c’est de temps.', 'Répétez la préposition : Ce dont j’ai besoin, c’est de temps.'),
      b('Ideal to present the key point.', 'Idéal pour présenter l’essentiel.'),
    ],
    [['tenir à', b('to value, to care about', 'être attaché à')], ['évoluer', b('to progress (in a career)', 'progresser')], ['attirer', b('to attract', 'intéresser fortement')]],
  ),
  lesson(C, 3, ['dislocation-and-stressed-pronouns', 'dislocation-et-pronoms-toniques'],
    b('Moi, je…: dislocation and stressed pronouns', 'Moi, je… : dislocation et pronoms toniques'),
    b('Detach an element to the front or the end, as in natural speech.', 'Détacher un élément en tête ou en fin de phrase, comme à l’oral naturel.'),
    [b('Use moi, toi, lui, elle, nous, vous, eux', 'Employer moi, toi, lui, elle, nous, vous, eux'), b('Detach a noun and resume it with a pronoun', 'Détacher un nom et le reprendre par un pronom'), b('Contrast two opinions', 'Opposer deux opinions')],
    13,
    [
      card(b('Stressed pronouns', 'Les pronoms toniques'), b('**moi, toi, lui, elle, nous, vous, eux, elles** stress or contrast the subject: **Moi, je préfère le thé. Lui, il ne vient jamais. Eux, ils sont partis tôt.**', '**moi, toi, lui, elle, nous, vous, eux, elles** soulignent ou opposent le sujet : **Moi, je préfère le thé. Lui, il ne vient jamais. Eux, ils sont partis tôt.**'), {
        ex: [['Toi, tu as toujours raison !', 'You’re always right!'], ['Nous, on a adoré.', 'We loved it.']],
      }),
      card(b('Dislocation', 'La dislocation'), b('Very common in speech: detach a noun at the start or the end and resume it with a pronoun: **Ce film, je l’ai adoré. Je l’ai adoré, ce film. Le Québec, j’y vais chaque été. Des problèmes, on en a tous.**', 'Très fréquente à l’oral : détachez un nom en tête ou en fin de phrase et reprenez-le par un pronom : **Ce film, je l’ai adoré. Je l’ai adoré, ce film. Le Québec, j’y vais chaque été. Des problèmes, on en a tous.**')),
      mc(P.best, ['Ce livre, je l’ai lu deux fois.', 'Ce livre, je ai lu deux fois.', 'Ce livre, je lui ai lu deux fois.', 'Ce livre, je l’en ai lu.']),
      mc(P.best, ['Moi, je ne suis pas d’accord.', 'Me, je ne suis pas d’accord.', 'Je, moi ne suis pas d’accord.', 'Moi, ne suis pas d’accord.'], { fr: 'Pour marquer votre désaccord :' }),
      mc(P.best, ['Le chocolat, j’en mange tous les jours.', 'Le chocolat, je le mange de tous les jours.', 'Le chocolat, j’y mange tous les jours.', 'Le chocolat, je lui mange.']),
      pairs(P.match, [['Ce film, je l’ai adoré.', b('I loved that film.', 'reprise par le')], ['Paris, j’y vais demain.', b('I’m going to Paris tomorrow.', 'reprise par y')], ['Du temps, on n’en a jamais assez.', b('You never have enough time.', 'reprise par en')], ['Ta sœur, je lui ai parlé.', b('I spoke to your sister.', 'reprise par lui')]]),
      gap(P.complete, 'Mes parents, je ___ appelle tous les dimanches. Mon frère, je ___ écris plutôt.', ['les', 'lui']),
      dict('Moi, je pense que ce projet, il faut le lancer tout de suite.', { voice: 'm' }),
      say('Les réunions du lundi, franchement, je les trouve trop longues.', 'Monday meetings, frankly, I find them too long.'),
    ],
    [
      b('Stressed pronouns: moi, toi, lui, elle, nous, vous, eux, elles (Moi, je…).', 'Pronoms toniques : moi, toi, lui, elle, nous, vous, eux, elles (Moi, je…).'),
      b('Dislocation: Ce film, je l’ai adoré / Je l’ai adoré, ce film.', 'Dislocation : Ce film, je l’ai adoré / Je l’ai adoré, ce film.'),
      b('Resume with le, la, les, lui, leur, y or en.', 'Reprise avec le, la, les, lui, leur, y ou en.'),
    ],
    [['franchement', b('frankly', 'sincèrement')], ['le désaccord', b('disagreement', 'absence d’accord')], ['lancer', b('to launch', 'démarrer')]],
  ),
];
