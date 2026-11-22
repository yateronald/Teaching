import type { CourseAbout } from '../../types';
import { b, card, dlg, doc, exam, gap, lesson, mc, ord, P, pairs, say, sort, tip, trap } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'In TCF speaking, time runs fast: Task 1 lasts 2 minutes with no prep, Task 2 gives you just 2 minutes of preparation for a 3.5-minute interaction, and Task 3 asks for 4.5 minutes of structured opinion with zero prep. Candidates rarely run out of French — they run out of planning method or freeze after 90 seconds. This course gives you second-by-second pacing routines, quick-note templates and smooth recovery phrases.',
    'À l’oral du TCF, le chrono file vite : la tâche 1 dure 2 minutes sans préparation, la tâche 2 accorde 2 minutes de préparation pour 3 min 30 d’interaction, et la tâche 3 exige 4 min 30 d’argumentation sans préparation. Les candidats manquent rarement de français : ils manquent de méthode pour planifier vite ou se figent après 90 secondes. Ce cours propose des routines chronométrées, des grilles de notes rapides et des formules de rebond.',
  ),
  outcomes: [
    b('Turn 2 minutes of Task 2 prep into 8+ varied questions', 'Transformer 2 minutes de préparation en 8+ questions variées'),
    b('Structure a 4.5-minute Task 3 answer with zero prep', 'Structurer 4 min 30 de tâche 3 sans préparation'),
    b('Buy thinking time naturally instead of going silent', 'Gagner du temps naturellement sans longs silences'),
    b('Recover smoothly when stuck or finishing early', 'Relancer l’échange avec aisance en cas de blocage'),
  ],
};

const C = 'tcf-eo-timing';
export default [
  lesson(C, 1, ['task-2-two-minute-prep', 'preparation-en-2-minutes'],
    b('Optimising the 2-minute Task 2 prep', 'Optimiser les 2 minutes de préparation (tâche 2)'),
    b('Use a 120-second grid to script keywords, angles and an opening hook.', 'Utiliser une grille en 120 secondes pour noter mots clés, angles et accroche.'),
    [b('Split the 2 minutes into 3 timed phases', 'Découper les 2 minutes en 3 phases précises'), b('Write keyword prompts instead of full sentences', 'Noter des mots clés plutôt que des phrases entières'), b('Keep the 3.5-minute interaction flowing', 'Maintenir le rythme pendant 3 min 30')],
    13,
    [
      exam(b('The 120-second prep grid', 'La grille des 120 secondes'), b('In Task 2 (**2 min prep + 3 min 30 talk**), never write full sentences — you will barely finish three! Instead: **0–30 s**: spot **tu/vous** and underline given facts. **30–90 s**: jot 8 keywords across **prix, horaires, conditions, accès, annulation**. **90–120 s**: plan your opening line + one polite inversion.', 'En tâche 2 (**2 min de préparation + 3 min 30 d’échange**), n’écrivez pas de phrases entières ! **0–30 s** : repérez **tu/vous** et les infos déjà données. **30–90 s** : notez 8 mots clés sur **prix, horaires, conditions, accès, annulation**. **90–120 s** : préparez la phrase d’ouverture + une inversion.')),
      doc({ look: 'page', title: b('Task 2 prompt card', 'Sujet de tâche 2'), text: 'Vous souhaitez réserver une salle de coworking pour organiser une formation d’équipe d’une journée avec dix collègues. Vous appelez la responsable du centre pour obtenir des renseignements.' }, b('Which 2-minute keyword note covers the widest missing ground?', 'Quelle prise de notes en 2 minutes couvre le mieux les informations manquantes ?'), [b('tarif journée / projecteur / pauses café / accès métro / annulation', 'tarif journée / projecteur / pauses café / accès métro / annulation'), b('dix collègues / formation d’une journée / salle de coworking', 'dix collègues / formation d’une journée / salle de coworking'), b('Bonjour Madame, comment allez-vous aujourd’hui ? Je travaille dans…', 'Bonjour Madame, comment allez-vous aujourd’hui ? Je travaille dans…'), b('Combien coûte la salle ? C’est grand ? Où est la salle ?', 'Combien coûte la salle ? C’est grand ? Où est la salle ?')]),
      sort(b('Write on your scratch paper or skip?', 'À noter au brouillon ou à éviter ?'), [b('smart 2-minute note', 'note efficace en 2 min'), b('wastes precious seconds', 'fait perdre du temps')], [['tarif + TVA ? / remise groupe ?', 0], ['écrire 6 phrases complètes mot à mot', 1], ['matériel : micro / tableau ?', 0], ['recopier la consigne entière', 1], ['annulation gratuite jusqu’à quand ?', 0], ['rédiger le « au revoir » en entier', 1]]),
      gap(P.complete, 'Bonjour Madame, j’organise une formation pour dix collègues et j’aimerais ___ si votre grande salle est libre. Pourriez-vous ___ les équipements inclus et les conditions ___ ?', ['savoir', 'm’indiquer', 'd’annulation'], { choices: [['savoir', 'dire', 'parler'], ['m’indiquer', 'savoir', 'réserver'], ['d’annulation', 'de journée', 'd’équipe']] }),
      dlg(b('Keeping momentum in Task 2', 'Garder le rythme en tâche 2'), undefined, [['Responsable', 'f'], ['Vous', 'm']], [
        [0, 'Oui, la salle est disponible vendredi pour 380 euros la journée.', 'Yes, the room is available Friday for 380 euros for the day.'],
        [1, { options: ['Très bien, je note ce tarif. Ce prix inclut-il le vidéoprojecteur, la connexion wifi et les pauses café ?', 'D’accord. Merci beaucoup, au revoir.', 'C’est cher ! Bon, j’ai fini.'] }],
        [0, 'Le wifi et le projecteur sont compris, mais le café est en supplément.', 'Wifi and projector are included, but coffee is extra.'],
        [1, { options: ['Entendu. Et en cas d’imprévu, jusqu’à combien de jours avant pouvons-nous annuler sans frais ?', 'Ah bon ? D’accord.', 'Ok, merci pour tout.'] }],
      ], true),
      say('Très bien, je note. Et dans l’hypothèse où nous serions douze au lieu de dix, la salle resterait-elle adaptée ?', 'Very well, I note that. And in the event we were twelve instead of ten, would the room still be suitable?'),
    ],
    [
      b('Split 2 minutes: 30 s target check + 60 s keyword grid + 30 s opening.', 'Découpez 2 minutes : 30 s repérage + 60 s mots clés + 30 s ouverture.'),
      b('Use short slash keywords (matériel ? / annulation ?) instead of full sentences.', 'Notez des mots clés courts (matériel ? / annulation ?), jamais des phrases entières.'),
      b('React briefly (je note, entendu) and chain straight to your next angle.', 'Réagissez brièvement (je note, entendu) puis enchaînez aussitôt sur l’angle suivant.'),
    ],
    [['un imprévu', b('an unforeseen event', 'changement inattendu')], ['en supplément', b('at extra cost', 'à payer en plus')], ['enchaîner', b('to follow right up / chain', 'passer tout de suite à la suite')]],
  ),
  lesson(C, 2, ['thinking-aloud-task-3', 'reflechir-a-voix-haute-tache-3'],
    b('Task 3: thinking aloud for 4.5 minutes', 'Tâche 3 : réfléchir en parlant (4 min 30)'),
    b('Structure an impromptu 4.5-minute opinion without preparation time or awkward pauses.', 'Structurer une réponse de 4 min 30 sans préparation ni blancs gênants.'),
    [b('Pace your 4.5 minutes across four phases', 'Répartir les 4 min 30 en quatre étapes'), b('Use natural French thinking-time formulas', 'Employer des formules naturelles pour réfléchir'), b('Announce a simple two-angle plan in 15 seconds', 'Annoncer un plan en deux angles en 15 secondes')],
    13,
    [
      card(b('The 4.5-minute Task 3 clock', 'Le rythme des 4 min 30 en tâche 3'), b('With **zero prep**, divide the 4.5 minutes: **0:00–0:30**: rephrase the question + pick a clear stance + announce two angles. **0:30–2:30**: Angle 1 + concrete example, then Angle 2 + example. **2:30–3:00**: nuance + wrap-up. **3:00–4:30**: examiner follow-ups.', 'Avec **zéro préparation**, découpez les 4 min 30 : **0:00–0:30** : reformulez + prenez position + annoncez deux angles. **0:30–2:30** : Angle 1 + exemple concret, puis Angle 2 + exemple. **2:30–3:00** : nuance + conclusion. **3:00–4:30** : relances de l’examinateur.')),
      trap(b('Silence vs natural buying-time phrases', 'Silences gênants et formules de réflexion'), b('Ten seconds of « euh… euh… » hurts fluency. Buy 5–10 seconds naturally while organising your ideas: **C’est une question d’autant plus intéressante que… · À première vue, on pourrait penser que… · Pour y répondre clairement, je distinguerai deux aspects…**', 'Dix secondes de « euh… euh… » pénalisent l’aisance. Gagnez 5 à 10 secondes naturellement pour organiser vos idées : **C’est une question d’autant plus intéressante que… · À première vue, on pourrait penser que… · Pour y répondre clairement, je distinguerai deux aspects…**')),
      mc(P.best, ['C’est une question essentielle aujourd’hui. Je pense que limiter les vols courts est utile pour l’écologie, à condition que le train soit rapide et abordable : j’aborderai d’abord l’aspect environnemental, puis l’accessibilité pour les régions.', 'Oui, il faut interdire tous les avions parce que ça pollue beaucoup et voilà.', 'Euh… les vols courts… c’est difficile… peut-être oui, peut-être non.', 'D’abord, je ne prends jamais l’avion donc je n’ai pas grand-chose à dire.'], { fr: '— Faut-il interdire les vols intérieurs lorsqu’un trajet en train de moins de trois heures existe ?' }),
      sort(b('Which timing role?', 'Quel rôle dans le chrono ?'), [b('buys thinking time', 'donne du temps pour réfléchir'), b('transitions to next point', 'passe au point suivant'), b('signals wrap-up', 'annonce la fin')], [['C’est une question qui mérite qu’on s’y arrête.', 0], ['Passons maintenant à un second aspect…', 1], ['Pour résumer ma position, je dirais que…', 2], ['À première vue, on pourrait hésiter, mais…', 0], ['Au-delà de cet aspect économique, il faut voir…', 1], ['C’est pourquoi une solution équilibrée s’impose.', 2]]),
      say('C’est une question d’actualité qui soulève deux enjeux majeurs : d’un côté l’efficacité écologique, et de l’autre la réalité des territoires.', 'It is a topical question that raises two major issues: on the one hand environmental effectiveness, and on the other hand regional reality.'),
      ord(P.order, 'Pour y répondre clairement, je vais aborder deux points essentiels.', { tr: 'To answer clearly, I am going to address two essential points.' }),
    ],
    [
      b('Spend the first 25–30 seconds rephrasing and announcing two angles while your brain builds examples.', 'Utilisez les 25–30 premières secondes pour reformuler et annoncer deux angles.'),
      b('Replace « euh » with natural bridging openers (C’est une question qui…, À première vue…).', 'Remplacez « euh » par des amorces naturelles (C’est une question qui…, À première vue…).'),
      b('Save 90 seconds at the end for a lively exchange with the examiner.', 'Gardez 90 secondes de dialogue actif avec l’examinateur en fin d’épreuve.'),
    ],
    [['à première vue', b('at first sight', 'au premier abord')], ['un enjeu', b('a key issue / stake', 'point important en jeu')], ['abordable', b('affordable', 'à prix raisonnable')]],
  ),
  lesson(C, 3, ['pacing-and-recovery', 'rythme-et-relances'],
    b('Pacing, stretching and smooth recovery', 'Rythme, relances et récupération rapide'),
    b('Recover cleanly when you finish early, forget a word or face an abrupt interruption.', 'Rebondir quand on finit trop tôt, qu’on cherche un mot ou qu’on est interrompu.'),
    [b('Stretch a short answer cleanly with a second example', 'Prolonger une réponse courte avec un second exemple'), b('Paraphrase instantly when forgetting a French word', 'Reformuler vite quand un mot manque'), b('React calmly to time pressure and examiner prompts', 'Répondre avec calme aux interruptions et relances')],
    13,
    [
      card(b('Two pacing emergencies solved', 'Deux imprévus gérés sans panique'), b('**Finished after 90 seconds?** Add a **contrast angle** (**À l’inverse, dans un pays voisin…**), a **concrete example**, or a **nuanced condition**. **Forgot a word?** Never pause 10 seconds or switch to English — describe its function: **l’outil qui sert à… / disons, le fait de…**', '**Fini après 90 secondes ?** Ajoutez un **angle contrasté** (**À l’inverse, dans un pays voisin…**), un **exemple concret**, ou une **condition**. **Mot oublié ?** Ne bloquez pas et ne parlez pas anglais — décrivez la fonction : **l’outil qui sert à… / disons, le fait de…**')),
      dlg(b('When the examiner challenges your pace', 'Quand l’examinateur pousse l’échange'), undefined, [['Examinatrice', 'f'], ['Vous', 'm']], [
        [0, 'Vous avez déjà terminé ? Il nous reste deux minutes sur la gratuité des musées.', 'Have you already finished? We still have two minutes on free museums.'],
        [1, { options: ['À cela s’ajoute un autre point auquel je pensais : l’impact sur les musées locaux, qui attirent un public familial le week-end quand l’entrée est gratuite.', 'Oui, j’ai tout dit, désolé.', 'Euh… je ne sais plus quoi ajouter, posez-moi une question.'] }],
        [0, 'Très bien. Et si l’examinateur vous interrompt en plein milieu d’une phrase, est-ce mauvais signe ?', 'Very well. And if the examiner interrupts you mid-sentence, is that a bad sign?'],
        [1, { options: ['Pas du tout : c’est souvent pour tester ma capacité à réagir spontanément, alors j’écoute l’objection et j’y réponds tout de suite.', 'Oui, cela prouve que mon niveau est trop faible.', 'Je dois couper le dialogue et finir mon monologue.'] }],
      ]),
      mc(P.best, ['Ce que je veux dire, c’est cet appareil qui permet de mesurer la qualité de l’air en temps réel.', 'Euh… comment on dit « sensor » déjà ? Ah, j’ai oublié, zut.', 'C’est le « sensor », vous voyez le mot anglais.', '… (long silence de 12 secondes) …'], { fr: 'Vous cherchez le mot « capteur » en pleine tâche 3. Quel réflexe garde votre fluidité ?' }),
      pairs(P.match, [['à cela s’ajoute', b('to that is added (extending)', 'pour ajouter un point')], ['ce que je veux dire, c’est', b('what I mean is (paraphrasing)', 'pour reformuler')], ['à titre d’illustration', b('by way of illustration (example)', 'pour donner un exemple')], ['pour être tout à fait juste', b('to be completely fair (nuance)', 'pour nuancer')]]),
      gap(P.completeText, '___ un exemple concret tiré de mon expérience. ___ , il convient de nuancer ce point : ___ , la réussite dépend surtout du budget local.', ['À titre d’illustration, voici', 'À cela s’ajoute qu’', 'pour être tout à fait juste'], { choices: [['À titre d’illustration, voici', 'Au revoir', 'Enfin bref'], ['À cela s’ajoute qu’', 'Malgré', 'Avant'], ['pour être tout à fait juste', 'jamais', 'pourtant']] }),
      tip(b('The 12-minute composure rule', 'Garder le cap sur 12 minutes'), b('The examiner watches your **clock awareness and calm**. If you are interrupted, smile and pivot to their point immediately; if you run short, launch your **À cela s’ajoute…** extension.', 'L’examinateur observe votre **aisance et votre calme**. S’il vous coupe, rebondissez aussitôt sur son objection ; s’il reste du temps, lancez votre extension **À cela s’ajoute…**.')),
    ],
    [
      b('If you finish early, extend smoothly with À cela s’ajoute… or À titre d’illustration…', 'Si vous finissez tôt, prolongez avec À cela s’ajoute… ou À titre d’illustration…'),
      b('If you forget a word, paraphrase cleanly in French rather than pausing or switching languages.', 'Si un mot manque, décrivez-le en français sans silence ni mot étranger.'),
      b('Examiner interruptions in Task 3 test spontaneous interaction — pivot immediately.', 'Une interruption en tâche 3 teste votre réactivité : répondez-y directement.'),
    ],
    [['rebondir', b('to bounce back / pick up', 'reprendre avec vivacité')], ['un capteur', b('a sensor', 'appareil de mesure')], ['à titre d’illustration', b('as an example', 'pour illustrer')]],
  ),
];
