import type { CourseAbout } from '../../types';
import { b, card, doc, hear, lesson, mc, P, say, sort, tip, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'For Canadian immigration, the TEF Canada result is converted into NCLC levels for each skill; NCLC 7, roughly the B2 threshold, is a key target for many programs. This course focuses on what makes the difference between B1 and B2 in the TEF-specific tasks: the number and quality of questions in speaking section A, the strength of persuasion in section B, the coherence of the news story in writing section A and the depth of argument in section B. Always check IRCC’s current equivalence table.',
    'Pour l’immigration canadienne, le résultat du TEF Canada est converti en niveaux NCLC pour chaque compétence ; le NCLC 7, à peu près le seuil du B2, est un objectif clé pour de nombreux programmes. Ce cours se concentre sur ce qui fait la différence entre B1 et B2 dans les tâches propres au TEF : le nombre et la qualité des questions en section A de l’oral, la force de persuasion en section B, la cohérence du fait divers en section A de l’écrit et la profondeur de l’argumentation en section B. Vérifiez toujours le tableau d’équivalence en vigueur d’IRCC.',
  ),
  outcomes: [
    b('Know what B2 means in each TEF task', 'Savoir ce que signifie B2 dans chaque tâche du TEF'),
    b('Upgrade your speaking sections A and B', 'Améliorer ses sections A et B à l’oral'),
    b('Upgrade your writing sections A and B', 'Améliorer ses sections A et B à l’écrit'),
    b('Plan your progress to NCLC 7', 'Planifier sa progression vers le NCLC 7'),
  ],
};

const C = 'tef-nclc7';
export default [
  lesson(C, 1, ['speaking-b1-to-b2', 'oral-du-b1-au-b2'],
    b('Speaking: from B1 to B2', 'L’oral : du B1 au B2'),
    b('See what B2 looks like in speaking sections A and B.', 'Voir à quoi ressemble le B2 dans les sections A et B de l’oral.'),
    [b('B2 in section A', 'Le B2 en section A'), b('B2 in section B', 'Le B2 en section B'), b('Fluency and correction', 'Aisance et correction')],
    13,
    [
      card(b('B2 speaking in the TEF', 'L’oral B2 au TEF'), b('**Section A**: about **10 relevant questions**, **varied structures** (inversion, indirect questions), **follow-ups** that react to answers, natural phone routines. **Section B**: a **real persuasion strategy** (arguments adapted to the friend), **every objection answered**, nuance (je te comprends, mais…), **precise vocabulary**. In both: few long pauses, good control of basic grammar.', '**Section A** : environ **10 questions pertinentes**, **structures variées** (inversion, questions indirectes), **relances** qui réagissent aux réponses, routines téléphoniques naturelles. **Section B** : une **vraie stratégie de persuasion** (arguments adaptés à l’ami), **chaque objection traitée**, de la nuance (je te comprends, mais…), un **lexique précis**. Dans les deux : peu de longues pauses, bonne maîtrise de la grammaire de base.')),
      sort(b('B1 or B2 question in section A?', 'Question B1 ou B2 en section A ?'), [b('B1', 'B1'), b('B2', 'B2')], [['C’est combien ?', 0], ['Pourriez-vous m’indiquer si le tarif inclut l’assurance ?', 1], ['Il y a parking ?', 0], ['Le stationnement est-il gratuit pour les participants ?', 1], ['C’est quand ?', 0], ['Dans le cas où je devrais annuler, serais-je remboursé ?', 1]]),
      mc(P.best, ['Je te comprends, mais justement, c’est l’occasion de te reposer vraiment, loin des écrans. Et si tu as peur de t’ennuyer, il y a des activités tous les jours.', 'Viens, c’est bien.', 'Tu dis toujours non.', 'Bon, tant pis.'], { fr: 'Section B — votre ami dit : « Je suis trop fatigué pour partir ce week-end. » Quelle réponse est de niveau B2 ?' }),
      say('Dans le cas où je devrais annuler ma réservation, serais-je remboursé intégralement ?', 'If I had to cancel my booking, would I be fully refunded?'),
      tip(b('Measure yourself', 'Mesurez-vous'), b('Record a section A: count your **questions** (target 10), **structures** (at least 3 kinds) and **follow-ups** (at least 2). Record a section B: did you answer **every** objection?', 'Enregistrez une section A : comptez vos **questions** (objectif 10), vos **structures** (au moins 3 types) et vos **relances** (au moins 2). Enregistrez une section B : avez-vous répondu à **chaque** objection ?')),
    ],
    [
      b('Section A B2: ~10 varied questions, follow-ups, phone routines.', 'Section A B2 : ~10 questions variées, relances, routines du téléphone.'),
      b('Section B B2: adapted arguments, every objection answered, nuance.', 'Section B B2 : arguments adaptés, chaque objection traitée, nuance.'),
      b('Self-measure with recordings.', 'Mesurez-vous avec des enregistrements.'),
    ],
    [['inclure', b('to include', 'comprendre')], ['intégralement', b('in full', 'en totalité')], ['s’ennuyer', b('to be bored', 'trouver le temps long')]],
  ),
  lesson(C, 2, ['writing-b1-to-b2', 'ecrit-du-b1-au-b2'],
    b('Writing: from B1 to B2', 'L’écrit : du B1 au B2'),
    b('Upgrade a news-story continuation and an opinion letter to B2.', 'Faire passer au B2 une suite de fait divers et une lettre d’opinion.'),
    [b('B2 in section A', 'Le B2 en section A'), b('B2 in section B', 'Le B2 en section B'), b('Upgrade a B1 paragraph', 'Améliorer un paragraphe B1')],
    13,
    [
      card(b('B2 writing in the TEF', 'L’écrit B2 au TEF'), b('**Section A** (fait divers): **consistent** with the beginning, **varied past tenses** (incl. plus-que-parfait), **journalistic vocabulary** (intervenir, se rendre sur les lieux, selon un témoin), a real **ending**. **Section B** (opinion): **three developed arguments** (idea + explanation + example), **concession**, **precise connectors**, **formal register**, **200+ words**.', '**Section A** (fait divers) : **cohérent** avec le début, **temps du passé variés** (dont le plus-que-parfait), **lexique journalistique** (intervenir, se rendre sur les lieux, selon un témoin), un vrai **dénouement**. **Section B** (opinion) : **trois arguments développés** (idée + explication + exemple), **concession**, **connecteurs précis**, **registre soutenu**, **200 mots ou plus**.')),
      sort(b('B1 or B2 sentence?', 'Phrase B1 ou B2 ?'), [b('B1', 'B1'), b('B2', 'B2')], [['Les pompiers sont venus.', 0], ['Les pompiers se sont rapidement rendus sur les lieux.', 1], ['Il y avait un problème avec la voiture.', 0], ['Le conducteur avait perdu le contrôle de son véhicule.', 1], ['C’est bien pour les gens.', 0], ['Cette mesure profiterait à l’ensemble des habitants.', 1]]),
      write(b('Upgrade to B2', 'Passez au B2'), b('Rewrite at B2 level (50–90 words): « Les gens disent que le vélo en ville c’est dangereux. Mais c’est bien. C’est bon pour la santé. Et ça pollue pas. Donc je suis pour. »', 'Réécrivez au niveau B2 (50–90 mots) : « Les gens disent que le vélo en ville c’est dangereux. Mais c’est bien. C’est bon pour la santé. Et ça pollue pas. Donc je suis pour. »'), 50, 90, [
        b('Concession', 'Concession'),
        b('Two developed arguments', 'Deux arguments développés'),
        b('Formal register, precise words', 'Registre soutenu, mots précis'),
      ], 'Certes, de nombreux citadins jugent le vélo dangereux en ville, et cette crainte n’est pas infondée. Il n’en reste pas moins que ses avantages sont considérables. D’une part, il favorise une activité physique régulière, bénéfique pour la santé. D’autre part, il ne rejette aucun gaz polluant, contrairement à la voiture. C’est pourquoi je suis favorable à son développement, à condition que les villes aménagent davantage de pistes protégées.'),
      tip(b('Your B2 checklist', 'Votre liste B2'), b('For each text: **one concession, three different connector functions, one complex sentence (subjonctif, relative, gérondif), no « les gens », « c’est bien », « chose »**.', 'Pour chaque texte : **une concession, trois fonctions de connecteurs, une phrase complexe (subjonctif, relative, gérondif), pas de « les gens », « c’est bien », « chose »**.')),
    ],
    [
      b('Section A B2: consistency, varied past tenses, journalistic words.', 'Section A B2 : cohérence, temps du passé variés, lexique journalistique.'),
      b('Section B B2: 3 developed arguments, concession, formal register.', 'Section B B2 : 3 arguments développés, concession, registre soutenu.'),
      b('Banish vague words.', 'Bannissez les mots vagues.'),
    ],
    [['un citadin', b('a city dweller', 'habitant de la ville')], ['infondé', b('unfounded', 'sans fondement')], ['se rendre sur les lieux', b('to go to the scene', 'aller à l’endroit')]],
  ),
  lesson(C, 3, ['comprehension-and-plan', 'comprehension-et-plan'],
    b('Comprehension, and your plan', 'La compréhension, et votre plan'),
    b('Target B2 comprehension questions and build a realistic plan to NCLC 7.', 'Cibler les questions de compréhension B2 et construire un plan réaliste vers le NCLC 7.'),
    [b('Target B2 question types', 'Cibler les types de questions B2'), b('Use practice tests wisely', 'Bien utiliser les tests blancs'), b('Plan your weeks', 'Planifier ses semaines')],
    13,
    [
      card(b('B2 comprehension', 'Compréhension B2'), b('B2 questions ask about **opinions, attitudes, purpose, implicit meaning, the logic of a text**. Train with **radio interviews, opinion articles and professional letters**, under time pressure. After each practice test, classify your mistakes: **vocabulary? speed? trap? implicit?** and work on the main category.', 'Les questions B2 portent sur **opinions, attitudes, objectifs, implicite, logique du texte**. Entraînez-vous avec des **interviews radio, des articles d’opinion et des lettres professionnelles**, en temps limité. Après chaque test blanc, classez vos erreurs : **vocabulaire ? vitesse ? piège ? implicite ?** et travaillez la catégorie principale.')),
      hear('Il faut saluer l’initiative, bien sûr. Mais on aurait aimé que les habitants soient consultés avant que les travaux ne commencent, et non après.', b('What does the speaker regret?', 'Que regrette la locutrice ?'), [b('that residents were not consulted before the works', 'que les habitants n’aient pas été consultés avant les travaux'), b('the initiative itself', 'l’initiative elle-même'), b('that the works are finished', 'que les travaux soient finis'), b('nothing', 'rien')], { voice: 'f' }),
      sort(b('Type of mistake', 'Type d’erreur'), [b('vocabulary', 'vocabulaire'), b('trap / distractor', 'piège / distracteur'), b('implicit meaning', 'implicite')], [['Je ne connaissais pas le mot « consulter ».', 0], ['J’ai choisi l’option qui répétait un mot entendu.', 1], ['Je n’ai pas compris l’ironie.', 2], ['Le mot « travaux » m’a bloqué.', 0], ['Je n’ai pas entendu la négation.', 1], ['Je n’ai pas saisi le reproche sous-entendu.', 2]]),
      doc({ look: 'page', title: b('A 6-week plan (example)', 'Un plan sur 6 semaines (exemple)'), text: 'Semaine 1 : test blanc complet + classement des erreurs\nSemaines 2–3 : compréhension B2 (opinions, implicite) 30 min/jour + vocabulaire\nSemaine 4 : écrit (sections A et B) — 3 textes corrigés\nSemaine 5 : oral (sections A et B) — enregistrements quotidiens\nSemaine 6 : nouveau test blanc + révision ciblée' }, b('When should you take the second practice test?', 'Quand faut-il passer le second test blanc ?'), [b('in week 6', 'la semaine 6'), b('in week 1', 'la semaine 1'), b('never', 'jamais'), b('every day', 'tous les jours')]),
    ],
    [
      b('B2 comprehension: opinions, attitudes, purpose, implicit.', 'Compréhension B2 : opinions, attitudes, objectifs, implicite.'),
      b('Classify your errors after each practice test.', 'Classez vos erreurs après chaque test blanc.'),
      b('Plan: test → targeted work → test again.', 'Plan : test → travail ciblé → nouveau test.'),
    ],
    [['saluer', b('to welcome, praise', 'féliciter')], ['consulter', b('to consult', 'demander l’avis')], ['un classement', b('a classification', 'tri par catégorie')]],
  ),
];
