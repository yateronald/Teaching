import type { CourseAbout } from '../../types';
import { b, card, culture, dlg, doc, gap, hear, lesson, mc, ord, P, say, sort, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Tech teams in Montréal, Paris, Brussels or Geneva work in a mix of French and English. This course gives you the French of software projects: the agile vocabulary (sprint, ticket, mêlée quotidienne), describing a bug and its steps to reproduce, reviewing code politely, explaining a technical choice to non-technical colleagues, and the official French terms promoted in Québec and France (courriel, logiciel, infonuagique).',
    'Les équipes tech de Montréal, Paris, Bruxelles ou Genève travaillent dans un mélange de français et d’anglais. Ce cours vous donne le français des projets logiciels : le vocabulaire agile (sprint, ticket, mêlée quotidienne), la description d’un bogue et des étapes pour le reproduire, la revue de code polie, l’explication d’un choix technique à des collègues non techniques, et les termes français officiels promus au Québec et en France (courriel, logiciel, infonuagique).',
  ),
  outcomes: [
    b('Take part in agile rituals in French', 'Participer aux rituels agiles en français'),
    b('Write a clear bug report', 'Rédiger un rapport de bogue clair'),
    b('Give and receive code review feedback', 'Donner et recevoir des retours de revue de code'),
    b('Explain technical choices simply', 'Expliquer simplement des choix techniques'),
  ],
};

const C = 'bz-it-teams';
export default [
  lesson(C, 1, ['agile-rituals', 'les-rituels-agiles'],
    b('Agile rituals in French', 'Les rituels agiles en français'),
    b('Give your daily update and talk about tickets, sprints and blockers.', 'Faire son point quotidien et parler de tickets, de sprints et de blocages.'),
    [b('Give a daily stand-up update', 'Faire son point de la mêlée quotidienne'), b('Talk about tickets and priorities', 'Parler de tickets et de priorités'), b('Report a blocker', 'Signaler un blocage')],
    13,
    [
      card(b('The daily stand-up', 'La mêlée quotidienne'), b('Three questions: **Hier, j’ai terminé… · Aujourd’hui, je vais travailler sur… · Je suis bloqué(e) par…** Vocabulary: **un ticket, le backlog / carnet de produit, un sprint, une démo, une rétrospective, mettre en production (déployer), une branche, fusionner**.', 'Trois questions : **Hier, j’ai terminé… · Aujourd’hui, je vais travailler sur… · Je suis bloqué(e) par…** Vocabulaire : **un ticket, le backlog / carnet de produit, un sprint, une démo, une rétrospective, mettre en production (déployer), une branche, fusionner**.')),
      culture(b('Official French terms', 'Les termes français officiels'), b('Many teams say « le build », « merger », « débugger ». In Québec, and in official French usage, you will also see **courriel** (email), **logiciel** (software), **infonuagique** (cloud computing, Québec), **mêlée quotidienne** (daily stand-up), **déboguer**. Use what your team uses, but recognise both.', 'Beaucoup d’équipes disent « le build », « merger », « débugger ». Au Québec, et dans l’usage officiel, vous verrez aussi **courriel**, **logiciel**, **infonuagique** (Québec), **mêlée quotidienne**, **déboguer**. Utilisez ce que votre équipe utilise, mais reconnaissez les deux.'), { variant: 'culture' }),
      hear('Hier, j’ai terminé la page de connexion. Aujourd’hui, je m’attaque au formulaire de paiement. Par contre, je suis bloquée : je n’ai toujours pas les accès à l’environnement de test.', b('What is blocking her?', 'Qu’est-ce qui la bloque ?'), [b('no access to the test environment', 'pas d’accès à l’environnement de test'), b('the login page has a bug', 'la page de connexion a un bogue'), b('the payment form is finished', 'le formulaire de paiement est fini'), b('she is ill', 'elle est malade')], { voice: 'f' }),
      sort(b('Yesterday, today or blocker?', 'Hier, aujourd’hui ou blocage ?'), [b('yesterday', 'hier'), b('today', 'aujourd’hui'), b('blocker', 'blocage')], [['J’ai fusionné la branche.', 0], ['Je vais écrire les tests.', 1], ['J’attends la validation du client.', 2], ['J’ai corrigé le bogue de l’export.', 0], ['Je m’attaque à l’API.', 1], ['Le serveur de test est en panne.', 2]]),
      gap(P.complete, 'Hier, j’ai ___ le ticket 42. Aujourd’hui, je ___ travailler sur les tests. Je suis ___ par un problème d’accès.', ['terminé', 'vais', ['bloqué', 'bloquée']]),
      say('Hier, j’ai terminé la page de connexion. Aujourd’hui, je travaille sur le paiement. Je n’ai pas de blocage.', 'Yesterday I finished the login page. Today I’m working on payment. I have no blockers.'),
    ],
    [
      b('Stand-up: Hier, j’ai… · Aujourd’hui, je vais… · Je suis bloqué(e) par…', 'Mêlée : Hier, j’ai… · Aujourd’hui, je vais… · Je suis bloqué(e) par…'),
      b('Words: ticket, sprint, branche, fusionner, déployer.', 'Mots : ticket, sprint, branche, fusionner, déployer.'),
      b('Official terms: courriel, logiciel, déboguer, infonuagique.', 'Termes officiels : courriel, logiciel, déboguer, infonuagique.'),
    ],
    [['un blocage', b('a blocker', 'obstacle')], ['s’attaquer à', b('to tackle', 'commencer à traiter')], ['déployer', b('to deploy', 'mettre en production')]],
  ),
  lesson(C, 2, ['bug-reports-and-code-review', 'bogues-et-revue-de-code'],
    b('Bug reports and code review', 'Rapports de bogue et revue de code'),
    b('Describe a bug precisely and comment on code constructively.', 'Décrire un bogue précisément et commenter du code de façon constructive.'),
    [b('Write steps to reproduce', 'Écrire les étapes de reproduction'), b('Expected vs actual behaviour', 'Comportement attendu et obtenu'), b('Suggest changes politely', 'Suggérer des changements poliment')],
    13,
    [
      card(b('A good bug report', 'Un bon rapport de bogue'), b('**Titre** clear · **Étapes pour reproduire** (1. Se connecter… 2. Cliquer sur…) · **Comportement attendu** · **Comportement obtenu** · **Environnement** (navigateur, version). Code review: **Bien vu pour… · Est-ce qu’on pourrait extraire cette logique dans une fonction ? · Petite suggestion : … · Je ne suis pas sûr de comprendre ce cas, tu peux m’expliquer ?**', '**Titre** clair · **Étapes pour reproduire** (1. Se connecter… 2. Cliquer sur…) · **Comportement attendu** · **Comportement obtenu** · **Environnement** (navigateur, version). Revue de code : **Bien vu pour… · Est-ce qu’on pourrait extraire cette logique dans une fonction ? · Petite suggestion : … · Je ne suis pas sûr de comprendre ce cas, tu peux m’expliquer ?**')),
      doc({ look: 'page', title: b('Bug report', 'Rapport de bogue'), text: 'Titre : Le bouton « Payer » reste grisé après la saisie de la carte\nÉtapes pour reproduire :\n1. Ajouter un article au panier\n2. Aller au paiement\n3. Saisir une carte valide\nComportement attendu : le bouton « Payer » devient actif.\nComportement obtenu : le bouton reste grisé.\nEnvironnement : application mobile, version 3.2, Android 14' }, b('What should happen after entering the card?', 'Que devrait-il se passer après la saisie de la carte ?'), [b('the Pay button should become active', 'le bouton « Payer » devrait devenir actif'), b('the basket should empty', 'le panier devrait se vider'), b('the app should close', 'l’application devrait se fermer'), b('the card should be refused', 'la carte devrait être refusée')]),
      mc(P.best, ['Bien vu pour la gestion des erreurs ! Petite suggestion : on pourrait extraire cette partie dans une fonction pour la réutiliser.', 'Ce code est nul, recommence.', 'Je n’aurais jamais fait comme ça.', 'Pas mal, mais c’est faux.'], { fr: 'Commentaire de revue de code constructif :' }),
      sort(b('Bug report section', 'Rubrique du rapport'), [b('steps', 'étapes'), b('expected', 'attendu'), b('actual', 'obtenu')], [['Cliquer sur « Exporter ».', 0], ['Un fichier PDF est téléchargé.', 1], ['Une page blanche s’affiche.', 2], ['Se connecter avec un compte invité.', 0], ['Le message de bienvenue apparaît.', 1], ['L’application plante.', 2]]),
      ord(P.order, 'Est-ce qu’on pourrait extraire cette logique dans une fonction ?', { tr: 'Could we extract this logic into a function?' }),
      say('Petite suggestion : on pourrait renommer cette variable pour que ce soit plus clair.', 'Small suggestion: we could rename this variable to make it clearer.'),
    ],
    [
      b('Bug report: titre, étapes, attendu, obtenu, environnement.', 'Rapport de bogue : titre, étapes, attendu, obtenu, environnement.'),
      b('Review: praise first, then « petite suggestion ».', 'Revue : d’abord un compliment, puis « petite suggestion ».'),
      b('Ask rather than assert: tu peux m’expliquer ?', 'Questionnez plutôt qu’affirmer : tu peux m’expliquer ?'),
    ],
    [['grisé', b('greyed out', 'inactif')], ['planter', b('to crash (informal)', 'cesser de fonctionner')], ['renommer', b('to rename', 'changer le nom')]],
  ),
  lesson(C, 3, ['explaining-to-non-tech', 'expliquer-aux-non-techniciens'],
    b('Explaining tech to non-technical colleagues', 'Expliquer la technique aux non-spécialistes'),
    b('Use analogies, impact and simple trade-offs to explain technical decisions.', 'Utiliser analogies, impact et compromis simples pour expliquer des décisions techniques.'),
    [b('Use an analogy', 'Utiliser une analogie'), b('Talk about impact, not code', 'Parler d’impact, pas de code'), b('Present a trade-off', 'Présenter un compromis')],
    13,
    [
      card(b('From code to impact', 'Du code à l’impact'), b('Start with **the impact**: **Concrètement, pour les clients, ça veut dire que…** Use **analogies**: **La base de données, c’est un peu comme une bibliothèque : si les livres ne sont pas classés, on met longtemps à trouver.** Present a **trade-off**: **On peut livrer vendredi avec une version simple, ou dans deux semaines avec toutes les options.**', 'Commencez par **l’impact** : **Concrètement, pour les clients, ça veut dire que…** Utilisez des **analogies** : **La base de données, c’est un peu comme une bibliothèque : si les livres ne sont pas classés, on met longtemps à trouver.** Présentez un **compromis** : **On peut livrer vendredi avec une version simple, ou dans deux semaines avec toutes les options.**')),
      mc(P.best, ['Concrètement, les clients ne pourront pas payer pendant environ dix minutes dimanche matin. On a choisi ce moment parce qu’il y a très peu de commandes.', 'On va migrer le cluster vers une nouvelle instance avec un downtime.', 'C’est technique, vous ne comprendriez pas.', 'Il y aura une coupure, c’est tout.'], { fr: 'Vous expliquez une maintenance à l’équipe commerciale :' }),
      dlg(b('A question from marketing', 'Une question du marketing'), undefined, [['Chloé (marketing)', 'f'], ['Vous', 'm']], [
        [0, 'Pourquoi la nouvelle fonctionnalité prend autant de temps ? Ce n’est qu’un bouton !', 'Why is the new feature taking so long? It’s only a button!'],
        [1, { options: ['Le bouton, oui, mais derrière, il faut sécuriser les paiements. C’est un peu comme une porte d’entrée : la poignée est simple, la serrure non.', 'Tu ne peux pas comprendre.', 'Parce que c’est comme ça.'] }],
        [0, 'Ah, je vois. On peut avoir quelque chose pour le salon de mars ?', 'Oh, I see. Can we have something for the March trade fair?'],
        [1, { options: ['On peut livrer une version de démonstration pour mars, et la version complète en avril. Ça te va ?', 'Non, impossible.', 'Peut-être, on verra.'] }],
      ]),
      write(b('Explain a choice', 'Expliquer un choix'), b('Explain in 40–70 words, for a non-technical manager, why your team wants to postpone a release by one week. Use the impact, one analogy and a clear proposal.', 'Expliquez en 40–70 mots, pour une responsable non technique, pourquoi votre équipe veut repousser une mise en production d’une semaine. Utilisez l’impact, une analogie et une proposition claire.'), 40, 70, [
        b('Impact for users or clients', 'Impact pour les utilisateurs ou clients'),
        b('One analogy', 'Une analogie'),
        b('A clear proposal with a date', 'Une proposition claire avec une date'),
      ], 'Nous proposons de repousser la mise en production au 18 mars. Les tests ont révélé un problème qui pourrait bloquer certains paiements. Livrer maintenant, ce serait comme ouvrir un magasin avec une caisse qui tombe parfois en panne. Avec une semaine de plus, nous corrigeons le problème et livrons une version fiable.'),
    ],
    [
      b('Start with impact: Concrètement, pour les clients, …', 'Commencez par l’impact : Concrètement, pour les clients, …'),
      b('Use analogies: c’est un peu comme…', 'Utilisez des analogies : c’est un peu comme…'),
      b('Offer options: version simple maintenant / complète plus tard.', 'Proposez des options : version simple maintenant / complète plus tard.'),
    ],
    [['une fonctionnalité', b('a feature', 'fonction d’un logiciel')], ['repousser', b('to postpone', 'reporter')], ['fiable', b('reliable', 'sûr')]],
  ),
];
