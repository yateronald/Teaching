import type { CourseAbout } from '../../types';
import { b, card, culture, dlg, flash, gap, hear, lesson, mc, ord, P, pairs, say, sort, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Faire la vaisselle, passer l’aspirateur, sortir les poubelles: who does what in your home? This beginner course gives you the vocabulary of household chores with the verb faire, frequency words (toujours, souvent, jamais) and the phrases to share tasks with flatmates or family, and to ask for or offer help.',
    'Faire la vaisselle, passer l’aspirateur, sortir les poubelles : qui fait quoi chez vous ? Ce cours pour débutants vous donne le vocabulaire des tâches ménagères avec le verbe faire, les mots de fréquence (toujours, souvent, jamais) et les phrases pour partager les tâches avec des colocataires ou en famille, demander ou proposer de l’aide.',
  ),
  outcomes: [
    b('Name household chores', 'Nommer les tâches ménagères'),
    b('Use faire and passer correctly', 'Employer correctement faire et passer'),
    b('Say how often you do things', 'Dire à quelle fréquence on fait les choses'),
    b('Share tasks politely', 'Partager les tâches poliment'),
  ],
};

const C = 'b-chores';
export default [
  lesson(C, 1, ['chores-vocabulary', 'le-vocabulaire-du-menage'],
    b('Chores vocabulary', 'Le vocabulaire du ménage'),
    b('Name everyday chores with faire, passer, sortir, ranger.', 'Nommer les tâches quotidiennes avec faire, passer, sortir, ranger.'),
    [b('Use faire + chore', 'Employer faire + tâche'), b('Use other chore verbs', 'Employer les autres verbes'), b('Say what you do at home', 'Dire ce qu’on fait à la maison')],
    13,
    [
      card(b('Household chores', 'Les tâches ménagères'), b('With **faire**: **faire la vaisselle, faire le ménage, faire la lessive, faire les courses, faire la cuisine, faire le lit**. Other verbs: **passer l’aspirateur, sortir les poubelles, ranger sa chambre, repasser, arroser les plantes, mettre la table, débarrasser la table**.', 'Avec **faire** : **faire la vaisselle, faire le ménage, faire la lessive, faire les courses, faire la cuisine, faire le lit**. Autres verbes : **passer l’aspirateur, sortir les poubelles, ranger sa chambre, repasser, arroser les plantes, mettre la table, débarrasser la table**.')),
      flash(b('Chores', 'Les tâches'), [['faire la vaisselle', b('to do the dishes', 'laver les assiettes')], ['faire la lessive', b('to do the laundry', 'laver les vêtements')], ['passer l’aspirateur', b('to vacuum', 'nettoyer le sol')], ['sortir les poubelles', b('to take out the rubbish', 'mettre les déchets dehors')], ['mettre la table', b('to set the table', 'préparer pour le repas')]]),
      sort(b('faire or another verb?', 'faire ou un autre verbe ?'), [b('faire', 'faire'), b('another verb', 'un autre verbe')], [['… la vaisselle', 0], ['… l’aspirateur', 1], ['… la lessive', 0], ['… les poubelles', 1], ['… les courses', 0], ['… la table', 1]]),
      gap(P.complete, 'Après le repas, je ___ la vaisselle et mon frère ___ les poubelles.', ['fais', 'sort']),
      hear('Le samedi matin, je fais le ménage : je passe l’aspirateur, je range ma chambre et je fais la lessive.', b('What does she NOT do on Saturday?', 'Qu’est-ce qu’elle ne fait PAS le samedi ?'), [b('the shopping', 'les courses'), b('vacuuming', 'passer l’aspirateur'), b('tidying her room', 'ranger sa chambre'), b('the laundry', 'la lessive')], { voice: 'f' }),
      say('Le samedi, je fais le ménage et je passe l’aspirateur.', 'On Saturdays I do the cleaning and vacuum.'),
    ],
    [
      b('faire la vaisselle / la lessive / le ménage / les courses.', 'faire la vaisselle / la lessive / le ménage / les courses.'),
      b('passer l’aspirateur, sortir les poubelles, ranger, repasser.', 'passer l’aspirateur, sortir les poubelles, ranger, repasser.'),
      b('mettre / débarrasser la table.', 'mettre / débarrasser la table.'),
    ],
    [['ranger', b('to tidy', 'mettre en ordre')], ['repasser', b('to iron', 'enlever les plis')], ['arroser', b('to water', 'donner de l’eau')]],
  ),
  lesson(C, 2, ['how-often', 'a-quelle-frequence'],
    b('How often?', 'À quelle fréquence ?'),
    b('Say how often you do chores with frequency words.', 'Dire à quelle fréquence on fait les tâches avec les mots de fréquence.'),
    [b('Use toujours, souvent, parfois, rarement, jamais', 'Employer toujours, souvent, parfois, rarement, jamais'), b('Use tous les jours, une fois par semaine', 'Employer tous les jours, une fois par semaine'), b('Place ne… jamais', 'Placer ne… jamais')],
    13,
    [
      card(b('Frequency', 'La fréquence'), b('**toujours > souvent > parfois / de temps en temps > rarement > ne… jamais**. **tous les jours, tous les soirs, le samedi** (every Saturday), **une fois par semaine, deux fois par mois**. Place: **Je fais souvent la cuisine. · Je ne repasse jamais.**', '**toujours > souvent > parfois / de temps en temps > rarement > ne… jamais**. **tous les jours, tous les soirs, le samedi** (chaque samedi), **une fois par semaine, deux fois par mois**. Place : **Je fais souvent la cuisine. · Je ne repasse jamais.**')),
      sort(b('Often or rarely?', 'Souvent ou rarement ?'), [b('often', 'souvent'), b('rarely / never', 'rarement / jamais')], [['tous les jours', 0], ['une fois par an', 1], ['toujours', 0], ['ne… jamais', 1], ['tous les soirs', 0], ['rarement', 1]]),
      mc(P.form, ['Je ne fais jamais la lessive.', 'Je fais jamais ne la lessive.', 'Je ne jamais fais la lessive.', 'Jamais je ne la lessive fais.']),
      gap(P.complete, 'Je passe l’aspirateur une ___ par semaine, et je fais la vaisselle tous les ___ .', ['fois', 'jours']),
      ord(P.order, 'Je ne repasse jamais mes chemises.', { tr: 'I never iron my shirts.' }),
      say('Je fais la cuisine tous les soirs, mais je ne repasse jamais.', 'I cook every evening, but I never iron.'),
    ],
    [
      b('toujours, souvent, parfois, rarement, ne… jamais.', 'toujours, souvent, parfois, rarement, ne… jamais.'),
      b('tous les jours, le samedi, une fois par semaine.', 'tous les jours, le samedi, une fois par semaine.'),
      b('Adverb after the verb: Je fais souvent…', 'Adverbe après le verbe : Je fais souvent…'),
    ],
    [['de temps en temps', b('from time to time', 'parfois')], ['une chemise', b('a shirt', 'vêtement avec boutons')], ['une fois', b('once', 'un seul moment')]],
  ),
  lesson(C, 3, ['sharing-tasks', 'partager-les-taches'],
    b('Sharing tasks', 'Partager les tâches'),
    b('Organise chores with flatmates or family: ask, offer, agree.', 'Organiser les tâches avec des colocataires ou en famille : demander, proposer, se mettre d’accord.'),
    [b('Ask someone to do a chore', 'Demander de faire une tâche'), b('Offer to do a chore', 'Proposer de faire une tâche'), b('Make a rota', 'Faire un planning')],
    13,
    [
      card(b('Sharing', 'Partager'), b('Ask: **Tu peux sortir les poubelles, s’il te plaît ? · Ça te dérange de faire la vaisselle ce soir ?** Offer: **Je m’occupe des courses. · Je fais la cuisine, et toi tu fais la vaisselle ? · Je peux t’aider ?** Plan: **On fait un planning ? · Cette semaine, c’est ton tour.**', 'Demander : **Tu peux sortir les poubelles, s’il te plaît ? · Ça te dérange de faire la vaisselle ce soir ?** Proposer : **Je m’occupe des courses. · Je fais la cuisine, et toi tu fais la vaisselle ? · Je peux t’aider ?** Planifier : **On fait un planning ? · Cette semaine, c’est ton tour.**')),
      culture(b('Who does what?', 'Qui fait quoi ?'), b('Sharing chores fairly is an important topic in French-speaking families and among **colocataires** (flatmates). A **planning des tâches** on the fridge is very common in shared flats.', 'Le partage équitable des tâches est un sujet important dans les familles francophones et entre **colocataires**. Un **planning des tâches** sur le frigo est très courant en colocation.'), { variant: 'culture' }),
      dlg(b('Flatmates', 'Entre colocataires'), undefined, [['Inès', 'f'], ['Vous', 'm']], [
        [0, 'La cuisine est en désordre… On fait un planning ?', 'The kitchen is a mess… Shall we make a rota?'],
        [1, { options: ['Bonne idée ! Je m’occupe des courses et des poubelles. Tu fais la vaisselle ?', 'Non, je ne fais rien.', 'La cuisine, c’est ton problème.'] }],
        [0, 'D’accord, et on passe l’aspirateur chacun son tour ?', 'OK, and we take turns vacuuming?'],
        [1, { options: ['Parfait. Cette semaine, c’est moi, la semaine prochaine, c’est toi.', 'Jamais l’aspirateur.', 'Bof.'] }],
      ]),
      mc(P.best, ['Ça te dérange de sortir les poubelles ce soir ?', 'Poubelles. Maintenant.', 'Toi, poubelles !', 'Tu sors les poubelles ou je me fâche.'], { fr: 'Vous demandez poliment à votre colocataire :' }),
      pairs(P.match, [['Je m’occupe de…', b('I’ll take care of…', 'je fais')], ['C’est ton tour.', b('It’s your turn.', 'à toi de faire')], ['chacun son tour', b('taking turns', 'l’un après l’autre')], ['un colocataire', b('a flatmate', 'personne qui partage l’appartement')]]),
      write(b('Your household rota', 'Votre planning'), b('Write a short weekly rota for your home (20–40 words): who does what and how often.', 'Écrivez un court planning hebdomadaire pour votre logement (20–40 mots) : qui fait quoi et à quelle fréquence.'), 20, 40, [
        b('At least three chores', 'Au moins trois tâches'),
        b('Who and how often', 'Qui et à quelle fréquence'),
      ], 'Lundi et jeudi, Paul fait les courses. Tous les soirs, je fais la vaisselle. Le samedi, Inès passe l’aspirateur et sort les poubelles. Chacun range sa chambre.'),
    ],
    [
      b('Ask: Tu peux… ? Ça te dérange de… ?', 'Demander : Tu peux… ? Ça te dérange de… ?'),
      b('Offer: Je m’occupe de… Je peux t’aider ?', 'Proposer : Je m’occupe de… Je peux t’aider ?'),
      b('Plan: un planning, c’est ton tour, chacun son tour.', 'Planifier : un planning, c’est ton tour, chacun son tour.'),
    ],
    [['en désordre', b('messy', 'pas rangé')], ['le frigo', b('the fridge', 'réfrigérateur')], ['se fâcher', b('to get angry', 'se mettre en colère')]],
  ),
];
