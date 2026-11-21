import type { CourseAbout } from '../../types';
import { b, card, dict, dlg, gap, hear, lesson, mc, ord, P, pairs, say, sort, tip, trap } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'How long have you lived here? When did you arrive? English uses for, since, ago and in; French uses depuis, il y a, pendant, en and dans, and the choice also changes the tense. This course untangles them one by one: depuis + present for an action that continues, il y a + past for a moment, pendant for a closed duration, en for the time needed and dans for the future.',
    'Depuis combien de temps habitez-vous ici ? Quand êtes-vous arrivé ? L’anglais dit for, since, ago et in ; le français emploie depuis, il y a, pendant, en et dans, et ce choix change aussi le temps du verbe. Ce cours les démêle un à un : depuis + présent pour une action qui continue, il y a + passé pour un moment, pendant pour une durée close, en pour le temps nécessaire et dans pour l’avenir.',
  ),
  outcomes: [
    b('Use depuis with the present for ongoing situations', 'Employer depuis avec le présent pour une situation qui dure'),
    b('Use il y a for a moment in the past', 'Employer il y a pour un moment du passé'),
    b('Distinguish pendant, en and dans', 'Distinguer pendant, en et dans'),
    b('Talk about your life story with the right time words', 'Raconter son parcours avec les bons marqueurs de temps'),
  ],
};

const C = 'time-expressions';
export default [
  lesson(C, 1, ['depuis', 'depuis'],
    b('Depuis: since, for… and still', 'Depuis : une situation qui dure encore'),
    b('Use depuis + present for an action that started in the past and continues.', 'Employer depuis + présent pour une action commencée dans le passé qui continue.'),
    [b('Use depuis + present', 'Employer depuis + présent'), b('Ask Depuis quand ? / Depuis combien de temps ?', 'Demander Depuis quand ? / Depuis combien de temps ?'), b('Avoid the English “I have been” trap', 'Éviter le piège de « I have been »')],
    13,
    [
      card(b('Still true now', 'Encore vrai maintenant'), b('**depuis** + a date or a duration, with the **present**: **J’habite ici depuis 2019. J’apprends le français depuis six mois.** English says “I have been…”, French says **present**.', '**depuis** + une date ou une durée, avec le **présent** : **J’habite ici depuis 2019. J’apprends le français depuis six mois.** L’anglais dit « I have been… », le français emploie le **présent**.'), {
        ex: [['Je travaille chez Desjardins depuis trois ans.', 'I’ve been working at Desjardins for three years.'], ['Il pleut depuis ce matin.', 'It’s been raining since this morning.'], ['Depuis combien de temps vous attendez ?', 'How long have you been waiting?']],
      }),
      trap(b('Not the passé composé', 'Pas le passé composé'), b('« J’ai habité ici depuis 2019 » is wrong if you still live here. Say **J’habite ici depuis 2019**.', '« J’ai habité ici depuis 2019 » est fautif si vous y habitez encore. Dites **J’habite ici depuis 2019**.')),
      mc(P.best, ['Je suis au Canada depuis deux ans.', 'J’ai été au Canada depuis deux ans.', 'Je suis au Canada pour deux ans depuis.', 'J’étais au Canada depuis deux ans.']),
      mc(P.best, ['Depuis combien de temps', 'Il y a combien', 'Pendant quand', 'Dans combien'], { fr: '___ apprenez-vous le français ?' }),
      gap(P.complete, 'Nous ___ (être) mariés ___ dix ans.', ['sommes', 'depuis']),
      ord(P.order, 'Elle travaille ici depuis le mois de mars.', { tr: 'She has been working here since March.' }),
      hear('Je cherche un appartement depuis trois semaines.', b('What is true?', 'Qu’est-ce qui est vrai ?'), [b('The search started three weeks ago and continues.', 'La recherche a commencé il y a trois semaines et continue.'), b('The search lasted three weeks and ended.', 'La recherche a duré trois semaines et elle est finie.'), b('The search will start in three weeks.', 'La recherche commencera dans trois semaines.'), b('The flat costs three weeks of salary.', 'L’appartement coûte trois semaines de salaire.')]),
      say('J’habite à Québec depuis deux ans et je travaille dans un hôpital depuis six mois.', 'I’ve been living in Québec City for two years and working in a hospital for six months.'),
    ],
    [
      b('depuis + present = an action that continues now.', 'depuis + présent = une action qui continue maintenant.'),
      b('Depuis quand ? (since when) / Depuis combien de temps ? (how long).', 'Depuis quand ? / Depuis combien de temps ?'),
      b('Never passé composé with depuis for a situation that continues.', 'Pas de passé composé avec depuis pour une situation qui continue.'),
    ],
    [['chercher', b('to look for', 'essayer de trouver')], ['attendre', b('to wait', 'patienter')], ['être marié(e)', b('to be married', 'avoir épousé quelqu’un')]],
  ),
  lesson(C, 2, ['il-y-a-and-pendant', 'il-y-a-et-pendant'],
    b('Il y a and pendant: a moment and a duration', 'Il y a et pendant : un moment et une durée'),
    b('Use il y a for “ago” and pendant for a closed duration.', 'Employer il y a pour un moment passé et pendant pour une durée close.'),
    [b('Use il y a + duration with a past tense', 'Employer il y a + durée avec un temps du passé'), b('Use pendant for a finished duration', 'Employer pendant pour une durée terminée'), b('Contrast depuis, il y a and pendant', 'Opposer depuis, il y a et pendant')],
    13,
    [
      card(b('Il y a = ago', 'Il y a = moment passé'), b('**il y a** + duration places an event in the past: **Je suis arrivé il y a trois ans.** The action is finished: passé composé.', '**il y a** + durée situe un événement dans le passé : **Je suis arrivé il y a trois ans.** L’action est terminée : passé composé.'), {
        ex: [['Il a appelé il y a dix minutes.', 'He called ten minutes ago.'], ['Nous nous sommes rencontrés il y a longtemps.', 'We met a long time ago.']],
      }),
      card(b('Pendant = for (a closed period)', 'Pendant = une durée fermée'), b('**pendant** + duration measures a period with a beginning and an end: **J’ai vécu à Paris pendant cinq ans** (and I left). Also in the future: **Je pars pendant deux semaines.**', '**pendant** + durée mesure une période avec un début et une fin : **J’ai vécu à Paris pendant cinq ans** (et je suis parti). Aussi au futur : **Je pars pendant deux semaines.**'), {
        ex: [['Il a plu pendant tout le week-end.', 'It rained all weekend.'], ['J’ai travaillé pendant les vacances.', 'I worked during the holidays.']],
      }),
      sort(b('Depuis, il y a or pendant?', 'Depuis, il y a ou pendant ?'), ['depuis', 'il y a', 'pendant'], [['J’habite ici … 2020.', 0], ['Je suis arrivé … deux ans.', 1], ['J’ai dormi … huit heures.', 2], ['Elle est malade … lundi.', 0], ['Il est parti … une heure.', 1], ['On a attendu … vingt minutes.', 2]]),
      mc(P.best, ['J’ai étudié l’anglais pendant trois ans, au lycée.', 'J’étudie l’anglais pendant trois ans, au lycée.', 'J’ai étudié l’anglais depuis trois ans, au lycée.', 'J’ai étudié l’anglais il y a pendant trois ans.']),
      mc(P.meaning, [b('He left an hour ago.', 'Son départ date d’une heure.'), b('He has been gone for an hour and will come back.', 'Il est absent pour une heure.'), b('He will leave in an hour.', 'Il partira dans une heure.'), b('He left for an hour.', 'Il est parti une heure.')], { fr: 'Il est parti il y a une heure.' }),
      gap(P.complete, 'Je l’ai rencontrée ___ dix ans, et nous sommes ensemble ___ ce jour-là.', ['il y a', 'depuis']),
      dlg(b('A job interview', 'Un entretien d’embauche'), undefined, [['Recruteuse', 'f'], ['Vous', 'm']], [
        [0, 'Depuis combien de temps êtes-vous au Canada ?', 'How long have you been in Canada?'],
        [1, { options: ['Depuis un an. Je suis arrivé il y a un an, en novembre.', 'Il y a un an. J’ai arrivé depuis novembre.', 'Pendant un an. Je suis arrivé depuis un an.'] }],
        [0, 'Et avant, vous avez travaillé dans la restauration ?', 'And before that, did you work in catering?'],
        [1, { options: ['Oui, pendant quatre ans, dans un hôtel à Lisbonne.', 'Oui, depuis quatre ans, dans un hôtel.', 'Oui, il y a pendant quatre ans.'] }],
      ]),
      dict('Je suis arrivée il y a deux mois et je cherche du travail depuis trois semaines.', { voice: 'f' }),
    ],
    [
      b('il y a + duration + past tense = ago (Je suis arrivé il y a deux ans).', 'il y a + durée + passé = moment passé (Je suis arrivé il y a deux ans).'),
      b('pendant + duration = a closed period (J’ai vécu à Paris pendant cinq ans).', 'pendant + durée = période close (J’ai vécu à Paris pendant cinq ans).'),
      b('depuis = still going; il y a = a point; pendant = a closed block.', 'depuis = encore en cours ; il y a = un point ; pendant = un bloc fermé.'),
    ],
    [['la restauration', b('the catering / restaurant trade', 'le secteur des restaurants')], ['longtemps', b('a long time', 'une longue durée')], ['vivre', b('to live', 'habiter, exister')]],
  ),
  lesson(C, 3, ['en-and-dans', 'en-et-dans'],
    b('En and dans: time needed and time ahead', 'En et dans : durée nécessaire et délai'),
    b('Use en for the time it takes and dans for the time before something happens.', 'Employer en pour le temps nécessaire et dans pour le délai avant un événement.'),
    [b('Use en + duration for the time needed', 'Employer en + durée pour le temps nécessaire'), b('Use dans + duration for the future', 'Employer dans + durée pour l’avenir'), b('Tell your life story with all the time words', 'Raconter son parcours avec tous les marqueurs')],
    13,
    [
      card(b('En vs dans', 'En ou dans'), b('**en** + duration = the time **needed** to do something: **J’ai lu ce livre en deux jours.** **dans** + duration = **from now**, before something happens: **Le train part dans dix minutes.**', '**en** + durée = le temps **nécessaire** : **J’ai lu ce livre en deux jours.** **dans** + durée = **à partir de maintenant**, avant un événement : **Le train part dans dix minutes.**'), {
        ex: [['On peut faire le trajet en trois heures.', 'You can do the journey in three hours.'], ['Je reviens dans cinq minutes.', 'I’ll be back in five minutes.'], ['Il a appris à nager en une semaine.', 'He learnt to swim in a week.']],
      }),
      tip(b('A trick', 'Une astuce'), b('Ask yourself: **how long did it take?** → **en**. **When will it happen?** → **dans**. And **en** also introduces months, seasons and years: **en juillet, en hiver, en 2027**.', 'Demandez-vous : **combien de temps a-t-il fallu ?** → **en**. **Quand cela arrivera-t-il ?** → **dans**. Et **en** introduit aussi les mois, saisons et années : **en juillet, en hiver, en 2027**.')),
      mc(P.word, ['dans', 'en', 'depuis', 'pendant'], { fr: 'Le magasin ferme ___ un quart d’heure.' }),
      mc(P.word, ['en', 'dans', 'depuis', 'il y a'], { fr: 'Elle a fini le marathon ___ quatre heures.' }),
      mc(P.word, ['en', 'dans', 'au', 'à'], { fr: 'Nous partons au Mexique ___ février.' }),
      gap(P.complete, 'Le repas sera prêt ___ vingt minutes : je le prépare toujours ___ moins d’une demi-heure.', ['dans', 'en']),
      pairs(P.match, [['depuis 2020', b('since 2020 (and still)', 'situation qui continue')], ['il y a deux ans', b('two years ago', 'moment passé')], ['pendant deux ans', b('for two years (closed)', 'durée close')], ['dans deux ans', b('in two years’ time', 'délai futur')]]),
      ord(P.order, 'Je vais finir ce rapport dans une heure.', { tr: 'I’m going to finish this report in an hour.' }),
      say('Je suis arrivé il y a trois ans, j’ai étudié pendant un an et je travaille ici depuis deux ans.', 'I arrived three years ago, studied for a year and have been working here for two years.'),
    ],
    [
      b('en + duration = time needed (en deux jours).', 'en + durée = temps nécessaire (en deux jours).'),
      b('dans + duration = from now (dans dix minutes).', 'dans + durée = à partir de maintenant (dans dix minutes).'),
      b('en + month / season / year: en juillet, en hiver, en 2027.', 'en + mois / saison / année : en juillet, en hiver, en 2027.'),
    ],
    [['le trajet', b('the journey', 'le parcours')], ['un quart d’heure', b('a quarter of an hour', 'quinze minutes')], ['une demi-heure', b('half an hour', 'trente minutes')]],
  ),
];
