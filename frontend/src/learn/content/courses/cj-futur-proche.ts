import type { CourseAbout } from '../../types';
import { b, card, conj, dict, dlg, gap, hear, lesson, mc, ord, P, say, sort, tip, trap, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Je vais partir, il va pleuvoir, nous allons déménager. The near future is the easiest future tense and the one French speakers use most in conversation. You only need aller in the present and an infinitive. This course trains the forms, then the placement of the negation and of pronouns, and ends with your own plans for the weekend.',
    'Je vais partir, il va pleuvoir, nous allons déménager. Le futur proche est le futur le plus simple et celui que les francophones emploient le plus à l’oral. Il suffit de aller au présent et d’un infinitif. Ce cours entraîne les formes, puis la place de la négation et des pronoms, et se termine par vos propres projets pour le week-end.',
  ),
  outcomes: [
    b('Form the near future at every person', 'Former le futur proche à toutes les personnes'),
    b('Tell it apart from aller in the present', 'Le distinguer de aller au présent'),
    b('Place the negation and pronouns correctly', 'Placer correctement la négation et les pronoms'),
    b('Talk about your plans', 'Parler de ses projets'),
  ],
};

const C = 'cj-futur-proche';
const FP = b('futur proche', 'futur proche');

export default [
  lesson(C, 1, ['aller-plus-infinitive', 'aller-plus-infinitif'],
    b('Aller in the present + infinitive', 'Aller au présent + infinitif'),
    b('Two words are enough to talk about what is coming: je vais + an infinitive.', 'Deux mots suffisent pour parler de ce qui arrive : je vais + un infinitif.'),
    [b('Conjugate aller in the present', 'Conjuguer aller au présent'), b('Build the near future', 'Construire le futur proche'), b('Tell it apart from aller + place', 'Le distinguer de aller + lieu')],
    13,
    [
      card(b('Aller + infinitive', 'Aller + infinitif'), b('Conjugate **aller** in the present and add an **infinitive** that never changes. The six forms: **je vais partir, tu vas partir, il va partir, nous allons partir, vous allez partir, ils vont partir**.', 'Conjuguez **aller** au présent et ajoutez un **infinitif** qui ne change jamais. Les six formes : **je vais partir, tu vas partir, il va partir, nous allons partir, vous allez partir, ils vont partir**.'), {
        ex: [['Ce soir, je vais regarder un film.', 'Tonight, I’m going to watch a film.'], ['Attention, il va pleuvoir !', 'Careful, it’s going to rain!'], ['Nous allons déménager en juin.', 'We’re going to move in June.']],
      }),
      tip(b('The infinitive never changes', 'L’infinitif ne change jamais'), b('Only aller is conjugated: **elles vont partir**, never « elles vont partent ». And **je vais aller** is correct and very common: **Je vais aller à la plage.**', 'Seul aller se conjugue : **elles vont partir**, jamais « elles vont partent ». Et **je vais aller** est correct et très courant : **Je vais aller à la plage.**')),
      conj('partir', FP, [['je', 'vais partir'], ['tu', 'vas partir'], ['il / elle', 'va partir'], ['nous', 'allons partir'], ['vous', 'allez partir'], ['ils / elles', 'vont partir']], { given: [0] }),
      mc(P.form, ['va pleuvoir', 'va pleut', 'vas pleuvoir', 'aller pleuvoir'], { fr: 'Prends ton parapluie : il ___.' }),
      mc(P.form, ['allons visiter', 'allons visitons', 'vont visiter', 'allez visiter'], { fr: 'Cet été, nous ___ le Québec.' }),
      gap(P.complete, 'Demain, je ___ (aller + appeler) le médecin. Mes amis ___ (aller + venir) dîner samedi.', [['vais appeler'], ['vont venir']]),
      sort(b('Aller in the present, or near future?', 'Aller au présent, ou futur proche ?'), [b('aller + place: present', 'aller + lieu : présent'), b('aller + infinitive: near future', 'aller + infinitif : futur proche')], [['je vais au marché', 0], ['je vais acheter du pain', 1], ['ils vont à l’école', 0], ['ils vont arriver', 1], ['elle va à Paris', 0], ['elle va partir', 1]]),
      hear('Je vais finir à six heures.', b('When does it happen?', 'Quand est-ce que cela se passe ?'), [b('Later, in the future', 'Plus tard, dans le futur'), b('Right now', 'En ce moment'), b('In the past', 'Dans le passé')]),
      dict('Samedi, nous allons faire une randonnée et nous allons pique-niquer au bord du lac.'),
      say('Ce week-end, je vais me reposer.', 'This weekend, I’m going to rest.'),
    ],
    [
      b('Near future = aller in the present + infinitive.', 'Futur proche = aller au présent + infinitif.'),
      b('vais, vas, va, allons, allez, vont: only aller changes.', 'vais, vas, va, allons, allez, vont : seul aller change.'),
      b('aller + place is the present; aller + verb is the near future.', 'aller + lieu, c’est le présent ; aller + verbe, c’est le futur proche.'),
    ],
    [['déménager', b('to move house', 'changer de logement')], ['pleuvoir', b('to rain', 'tomber de la pluie')], ['une randonnée', b('a hike', 'une longue marche')]],
  ),

  lesson(C, 2, ['negation-and-pronouns', 'negation-et-pronoms'],
    b('Negation, pronouns and questions', 'Négation, pronoms et questions'),
    b('Je ne vais pas partir, je vais le faire, tu vas te lever ?', 'Je ne vais pas partir, je vais le faire, tu vas te lever ?'),
    [b('Make the near future negative', 'Mettre le futur proche à la forme négative'), b('Place object pronouns', 'Placer les pronoms compléments'), b('Use pronominal verbs in the near future', 'Employer les verbes pronominaux au futur proche')],
    13,
    [
      card(b('Around aller, before the infinitive', 'Autour de aller, avant l’infinitif'), b('The negation goes around **aller**: **je ne vais pas partir**, **il ne va pas pleuvoir**. Object pronouns go **before the infinitive**: **je vais le faire**, **tu vas lui téléphoner**, **nous allons y aller**.', 'La négation entoure **aller** : **je ne vais pas partir**, **il ne va pas pleuvoir**. Les pronoms compléments se placent **avant l’infinitif** : **je vais le faire**, **tu vas lui téléphoner**, **nous allons y aller**.'), {
        ex: [['Je ne vais pas rester longtemps.', 'I’m not going to stay long.'], ['Le dossier ? Je vais le finir ce soir.', 'The file? I’m going to finish it tonight.'], ['On va se retrouver devant le cinéma.', 'We’re going to meet in front of the cinema.']],
      }),
      trap(b('Me, te, se: they follow the subject', 'Me, te, se : ils suivent le sujet'), b('A pronominal verb keeps a pronoun that matches the subject, placed before the infinitive: **je vais me coucher, tu vas te coucher, nous allons nous coucher**. Never « je vais se coucher ».', 'Un verbe pronominal garde un pronom qui correspond au sujet, placé avant l’infinitif : **je vais me coucher, tu vas te coucher, nous allons nous coucher**. Jamais « je vais se coucher ».')),
      mc(P.form, ['Je ne vais pas sortir ce soir.', 'Je ne pas vais sortir ce soir.', 'Je ne vais sortir pas ce soir.', 'Je vais pas ne sortir ce soir.']),
      mc(P.form, ['Je vais te rappeler demain.', 'Je te vais rappeler demain.', 'Je vais rappeler te demain.', 'Je vais toi rappeler demain.']),
      mc(P.form, ['me', 'se', 'te', 'nous'], { fr: 'Je suis fatiguée, je vais ___ coucher.' }),
      conj('se préparer', FP, [['je', 'vais me préparer'], ['tu', 'vas te préparer'], ['il / elle', 'va se préparer'], ['nous', 'allons nous préparer'], ['vous', 'allez vous préparer'], ['ils / elles', 'vont se préparer']], { given: [0] }),
      ord(P.order, 'Est-ce que tu vas leur écrire ?', { tr: 'Are you going to write to them?' }),
      gap(P.complete, 'Elle ___ (ne pas aller + venir) à la fête. Nous ___ (aller + se lever) à six heures.', [['ne va pas venir'], ['allons nous lever']]),
      dict('On ne va pas les attendre : le film va commencer.'),
      say('Je vais lui expliquer la situation.', 'I’m going to explain the situation to him.'),
    ],
    [
      b('Negation around aller: je ne vais pas venir.', 'Négation autour de aller : je ne vais pas venir.'),
      b('Pronouns before the infinitive: je vais le faire.', 'Pronoms avant l’infinitif : je vais le faire.'),
      b('Pronominal verbs: je vais me lever, nous allons nous lever.', 'Verbes pronominaux : je vais me lever, nous allons nous lever.'),
    ],
    [['rappeler', b('to call back', 'téléphoner de nouveau')], ['se retrouver', b('to meet up', 'se rejoindre')], ['un dossier', b('a file', 'un ensemble de documents')]],
  ),

  lesson(C, 3, ['plans-and-review', 'projets-et-bilan'],
    b('Talking about your plans', 'Parler de ses projets'),
    b('Time markers, a conversation about the weekend and your own plans in writing.', 'Les indicateurs de temps, une conversation sur le week-end et vos propres projets à l’écrit.'),
    [b('Use time markers for the future', 'Employer les indicateurs de temps du futur'), b('Make plans in a conversation', 'Faire des projets dans une conversation'), b('Write about your weekend', 'Écrire sur son week-end')],
    13,
    [
      card(b('The everyday future', 'Le futur de tous les jours'), b('In conversation, the near future is the usual way to talk about plans and about what is about to happen. Time markers: **ce soir, demain, ce week-end, la semaine prochaine, dans deux jours, bientôt**.', 'À l’oral, le futur proche est la façon habituelle de parler de ses projets et de ce qui va arriver. Indicateurs de temps : **ce soir, demain, ce week-end, la semaine prochaine, dans deux jours, bientôt**.'), {
        ex: [['La semaine prochaine, je vais commencer un nouveau travail.', 'Next week, I’m going to start a new job.'], ['Dans deux jours, ils vont rentrer de vacances.', 'In two days, they’re going to come back from holiday.']],
      }),
      tip(b('Near future or future tense?', 'Futur proche ou futur simple ?'), b('Both are correct for plans. The near future (**je vais partir**) is more common in speech. The future tense (**je partirai**) sounds more formal or more distant, and you will meet it in the next courses.', 'Les deux sont corrects pour les projets. Le futur proche (**je vais partir**) est plus courant à l’oral. Le futur simple (**je partirai**) paraît plus soutenu ou plus lointain, et vous le verrez dans les cours suivants.')),
      mc(P.best, ['Je vais prendre le train de huit heures.', 'Je vais prends le train de huit heures.', 'Je vais pris le train de huit heures.', 'Je prendre le train de huit heures.']),
      gap(P.completeText, 'Ce week-end, nous ___ (aller + rendre) visite à mes grands-parents. Ma sœur ___ (aller + préparer) un gâteau et mon père ___ (ne pas aller + travailler).', [['allons rendre'], ['va préparer'], ['ne va pas travailler']]),
      hear('On va se voir bientôt ?', b('What is the person asking?', 'Que demande la personne ?'), [b('If you will meet soon', 'Si vous allez vous voir bientôt'), b('If you met recently', 'Si vous vous êtes vus récemment'), b('Where you are going now', 'Où vous allez maintenant')]),
      dlg(b('Plans for the weekend', 'Les projets du week-end'), b('Two friends compare their plans.', 'Deux amis comparent leurs projets.'), [['Sofia', 'f'], ['Malik', 'm']], [
        [0, 'Tu fais quoi samedi ?', 'What are you doing on Saturday?'],
        [1, { options: ['Je vais aller au marché, puis je vais cuisiner pour des amis.', 'Je vais aller au marché, puis je vais cuisine pour des amis.', 'Je vais aller au marché, puis je va cuisiner pour des amis.'] }],
        [0, 'Super ! Et dimanche, tu vas te reposer ?', 'Great! And on Sunday, are you going to rest?'],
        [1, { options: ['Non, je vais faire une longue randonnée avec mon frère.', 'Non, je vais fais une longue randonnée avec mon frère.', 'Non, je allons faire une longue randonnée avec mon frère.'] }],
        [0, 'Il va faire beau, profitez-en !', 'The weather is going to be nice, enjoy it!'],
      ]),
      write(b('Your plans for next weekend', 'Vos projets pour le week-end prochain'), b('In 35 to 60 words, say what you are going to do next weekend. Use the near future at least four times, including one negative sentence.', 'En 35 à 60 mots, dites ce que vous allez faire le week-end prochain. Employez le futur proche au moins quatre fois, dont une phrase négative.'), 35, 60, [
        b('Four verbs in the near future', 'Quatre verbes au futur proche'),
        b('One negative sentence (je ne vais pas…)', 'Une phrase négative (je ne vais pas…)'),
        b('Two time markers', 'Deux indicateurs de temps'),
      ], 'Samedi matin, je vais faire le marché avec ma fille. L’après-midi, nous allons nous promener au parc et je vais lire un peu. Le soir, mes amis vont venir dîner à la maison. Dimanche, je ne vais pas travailler : je vais me reposer et je vais appeler mes parents.'),
      say('La semaine prochaine, je vais m’inscrire à un cours de danse.', 'Next week, I’m going to sign up for a dance class.'),
    ],
    [
      b('Time markers: ce soir, demain, la semaine prochaine, dans deux jours.', 'Indicateurs : ce soir, demain, la semaine prochaine, dans deux jours.'),
      b('The near future is the usual future in conversation.', 'Le futur proche est le futur habituel à l’oral.'),
      b('Negative: je ne vais pas travailler.', 'Négatif : je ne vais pas travailler.'),
    ],
    [['rendre visite à', b('to visit (someone)', 'aller voir quelqu’un')], ['s’inscrire', b('to sign up', 'donner son nom pour participer')], ['profiter de', b('to make the most of', 'tirer avantage de')]],
  ),
];
