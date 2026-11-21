import type { CourseAbout } from '../../types';
import { b, card, conj, dict, dlg, gap, lesson, mc, ord, P, pairs, say, sort, tip, trap } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'The near future (je vais partir) is the easiest and most common way to talk about the future in spoken French. This course teaches aller in the present, aller + infinitive for plans and predictions, where to put ne… pas and pronouns (je ne vais pas le faire), and the time words that go with it: ce soir, demain, la semaine prochaine, dans deux ans.',
    'Le futur proche (je vais partir) est la façon la plus simple et la plus courante de parler de l’avenir à l’oral. Ce cours présente aller au présent, aller + infinitif pour les projets et les prévisions, la place de ne… pas et des pronoms (je ne vais pas le faire), et les mots de temps qui l’accompagnent : ce soir, demain, la semaine prochaine, dans deux ans.',
  ),
  outcomes: [
    b('Conjugate aller in the present', 'Conjuguer aller au présent'),
    b('Form the near future: aller + infinitive', 'Former le futur proche : aller + infinitif'),
    b('Place the negation and pronouns correctly', 'Placer correctement la négation et les pronoms'),
    b('Talk about your plans and make predictions', 'Parler de vos projets et faire des prévisions'),
  ],
};

const C = 'near-future';
export default [
  lesson(C, 1, ['the-verb-aller', 'le-verbe-aller'],
    b('The verb aller: going places', 'Le verbe aller : se déplacer'),
    b('Conjugate aller and use it with à, au, chez to say where you go.', 'Conjuguer aller et l’employer avec à, au, chez pour dire où l’on va.'),
    [b('Conjugate aller', 'Conjuguer aller'), b('Use à la, au, aux, chez', 'Employer à la, au, aux, chez'), b('Say how you are with aller', 'Dire comment on va avec aller')],
    13,
    [
      card(b('Aller in the present', 'Aller au présent'), b('**Je vais, tu vas, il / elle / on va, nous allons, vous allez, ils / elles vont.** Aller also gives news: **Comment ça va ? – Ça va bien.**', '**Je vais, tu vas, il / elle / on va, nous allons, vous allez, ils / elles vont.** Aller sert aussi à prendre des nouvelles : **Comment ça va ? – Ça va bien.**'), {
        ex: [['Je vais au travail en vélo.', 'I go to work by bike.'], ['Vous allez à la piscine ?', 'Are you going to the pool?'], ['Ils vont chez le dentiste.', 'They’re going to the dentist’s.']],
      }),
      conj('aller', b('present', 'présent'), [['je', 'vais'], ['tu', 'vas'], ['il / elle', 'va'], ['nous', 'allons'], ['vous', 'allez'], ['ils / elles', 'vont']], { given: [0] }),
      tip(b('Where to?', 'Où ?'), b('**à + le = au**, **à + les = aux**: **au cinéma, aux toilettes, à la banque, à l’école**. For a person: **chez**: **chez Paul, chez le médecin, chez moi**.', '**à + le = au**, **à + les = aux** : **au cinéma, aux toilettes, à la banque, à l’école**. Pour une personne : **chez** : **chez Paul, chez le médecin, chez moi**.')),
      mc(P.word, ['au', 'à le', 'à la', 'chez'], { fr: 'Ce soir, nous allons ___ restaurant.' }),
      mc(P.word, ['chez', 'à', 'au', 'dans'], { fr: 'Je vais ___ le coiffeur demain.' }),
      mc(P.form, ['vont', 'vas', 'allons', 'allent'], { fr: 'Les enfants ___ à l’école à pied.' }),
      gap(P.complete, 'Tu ___ où ? – Je ___ à la gare, et ensuite nous ___ chez ma tante.', ['vas', 'vais', 'allons']),
      ord(P.order, 'On va au parc avec les enfants ?', { tr: 'Shall we go to the park with the kids?' }),
      say('Je vais au bureau en métro et le week-end je vais chez mes parents.', 'I go to the office by metro and at weekends I go to my parents’ place.'),
    ],
    [
      b('Aller: je vais, tu vas, il va, nous allons, vous allez, ils vont.', 'Aller : je vais, tu vas, il va, nous allons, vous allez, ils vont.'),
      b('à + le = au, à + les = aux; chez + person.', 'à + le = au, à + les = aux ; chez + personne.'),
      b('Comment ça va ? – Ça va bien, merci.', 'Comment ça va ? – Ça va bien, merci.'),
    ],
    [['le coiffeur', b('the hairdresser', 'personne qui coupe les cheveux')], ['à pied', b('on foot', 'en marchant')], ['ensuite', b('then, next', 'après')]],
  ),
  lesson(C, 2, ['aller-plus-infinitive', 'aller-plus-infinitif'],
    b('Je vais partir: aller + infinitive', 'Je vais partir : aller + infinitif'),
    b('Form the near future for plans, intentions and predictions.', 'Former le futur proche pour les projets, les intentions et les prévisions.'),
    [b('Form aller + infinitive', 'Former aller + infinitif'), b('Use future time markers', 'Employer les indicateurs de temps futurs'), b('Make a prediction', 'Faire une prévision')],
    13,
    [
      card(b('Aller + infinitive', 'Aller + infinitif'), b('Conjugate **aller** + the verb in the **infinitive**: **Je vais travailler. Il va pleuvoir. Nous allons déménager.** It is the everyday future of spoken French, for plans and for what is about to happen.', 'Conjuguez **aller** + le verbe à l’**infinitif** : **Je vais travailler. Il va pleuvoir. Nous allons déménager.** C’est le futur du quotidien à l’oral, pour les projets et ce qui va bientôt arriver.'), {
        ex: [['Ce soir, je vais regarder un film.', 'Tonight I’m going to watch a film.'], ['Attention, tu vas tomber !', 'Careful, you’re going to fall!'], ['L’année prochaine, nous allons visiter le Japon.', 'Next year we’re going to visit Japan.']],
      }),
      card(b('Time markers', 'Les indicateurs de temps'), b('**ce soir, demain, après-demain, ce week-end, la semaine prochaine, le mois prochain, l’année prochaine, dans deux jours, bientôt**.', '**ce soir, demain, après-demain, ce week-end, la semaine prochaine, le mois prochain, l’année prochaine, dans deux jours, bientôt**.'), {
        ex: [['Dans deux jours, je vais commencer mon nouveau travail.', 'In two days I’ll start my new job.']],
      }),
      mc(P.best, ['Nous allons prendre le train.', 'Nous allons prenons le train.', 'Nous allez prendre le train.', 'Nous allons pris le train.']),
      mc(P.meaning, [b('it’s going to rain', 'une prévision de pluie'), b('it rained', 'il a plu'), b('it rains every day', 'il pleut souvent'), b('it stopped raining', 'la pluie a cessé')], { fr: 'Regarde le ciel : il va pleuvoir.' }),
      sort(b('Past, present or near future?', 'Passé, présent ou futur proche ?'), [b('now', 'maintenant'), b('near future', 'futur proche')], [['Je mange.', 0], ['Je vais manger.', 1], ['Ils vont arriver.', 1], ['Ils arrivent.', 0], ['On va voir.', 1], ['On voit.', 0]]),
      gap(P.complete, 'Le mois prochain, mes parents ___ ___ à Montréal.', ['vont', 'venir']),
      ord(P.order, 'Qu’est-ce que tu vas faire ce week-end ?', { tr: 'What are you going to do this weekend?' }),
      dlg(b('Weekend plans', 'Projets de week-end'), undefined, [['Léa', 'f'], ['Vous', 'm']], [
        [0, 'Qu’est-ce que tu vas faire ce week-end ?', 'What are you going to do this weekend?'],
        [1, { options: ['Je vais faire du ski avec des amis. Et toi ?', 'Je vais fais du ski. Et toi ?', 'Je vais allé faire du ski. Et toi ?'] }],
        [0, 'Moi, je vais rester à la maison. Je vais enfin ranger mon appartement !', 'I’m going to stay home. I’m finally going to tidy my flat!'],
        [1, { options: ['Bon courage ! On va se voir lundi ?', 'Bon courage ! On va se voyons lundi ?', 'Bon courage ! On allons se voir ?'] }],
      ]),
      dict('Demain matin, nous allons visiter un appartement.', { voice: 'f' }),
    ],
    [
      b('aller (present) + infinitive: je vais partir, il va pleuvoir.', 'aller (présent) + infinitif : je vais partir, il va pleuvoir.'),
      b('For plans and imminent events.', 'Pour les projets et les événements imminents.'),
      b('Markers: ce soir, demain, la semaine prochaine, dans deux jours.', 'Indicateurs : ce soir, demain, la semaine prochaine, dans deux jours.'),
    ],
    [['déménager', b('to move house', 'changer de logement')], ['ranger', b('to tidy up', 'mettre en ordre')], ['bientôt', b('soon', 'dans peu de temps')]],
  ),
  lesson(C, 3, ['negation-and-pronouns', 'negation-et-pronoms'],
    b('Je ne vais pas le faire: negation and pronouns', 'Je ne vais pas le faire : négation et pronoms'),
    b('Place ne… pas and the pronouns in the near future.', 'Placer ne… pas et les pronoms au futur proche.'),
    [b('Put ne… pas around aller', 'Encadrer aller avec ne… pas'), b('Put the pronoun before the infinitive', 'Placer le pronom devant l’infinitif'), b('Talk about resolutions', 'Parler de bonnes résolutions')],
    13,
    [
      card(b('Negation around aller', 'La négation autour d’aller'), b('**ne… pas** surrounds the conjugated verb **aller**: **Je ne vais pas venir. Ils ne vont pas rester.**', '**ne… pas** encadre le verbe conjugué **aller** : **Je ne vais pas venir. Ils ne vont pas rester.**'), {
        ex: [['Je ne vais pas sortir ce soir.', 'I’m not going to go out tonight.'], ['On ne va pas attendre.', 'We’re not going to wait.']],
      }),
      trap(b('The pronoun goes before the infinitive', 'Le pronom se place devant l’infinitif'), b('The pronoun belongs to the infinitive: **Je vais l’appeler** (not « je le vais appeler »), **Tu vas leur écrire ?**, **Je ne vais pas y aller.**', 'Le pronom dépend de l’infinitif : **Je vais l’appeler** (et non « je le vais appeler »), **Tu vas leur écrire ?**, **Je ne vais pas y aller.**'), {
        ex: [['Ce film ? Je vais le regarder demain.', 'That film? I’ll watch it tomorrow.'], ['Ta mère ? Je vais lui téléphoner.', 'Your mother? I’ll phone her.']],
      }),
      mc(P.best, ['Je ne vais pas travailler demain.', 'Je vais ne pas travailler demain.', 'Je ne vais travailler pas demain.', 'Ne je vais pas travailler demain.']),
      mc(P.best, ['Je vais les inviter.', 'Je les vais inviter.', 'Je vais inviter les.', 'Je vais inviter eux.']),
      mc(P.best, ['Nous n’allons pas y aller.', 'Nous n’y allons pas aller.', 'Nous allons ne pas y aller.', 'Nous n’allons y pas aller.']),
      gap(P.complete, 'Ce livre ? Je ne ___ pas ___ lire, il est trop long !', ['vais', 'le']),
      ord(P.order, 'Tu vas lui dire la vérité ?', { tr: 'Are you going to tell him the truth?' }),
      pairs(P.match, [['Je vais arrêter de fumer.', b('I’m going to quit smoking.', 'une résolution santé')], ['Je vais faire du sport.', b('I’m going to exercise.', 'une résolution sportive')], ['Je ne vais plus arriver en retard.', b('I won’t be late any more.', 'une résolution de ponctualité')], ['Je vais apprendre le français.', b('I’m going to learn French.', 'une résolution d’apprentissage')]]),
      say('Cette année, je vais faire du sport et je ne vais plus manger de sucre.', 'This year I’m going to exercise and I’m not going to eat sugar any more.'),
      dict('Je ne vais pas lui répondre ce soir.', { voice: 'm' }),
    ],
    [
      b('Negation: ne + aller + pas + infinitive (Je ne vais pas venir).', 'Négation : ne + aller + pas + infinitif (Je ne vais pas venir).'),
      b('Pronoun before the infinitive: Je vais l’appeler.', 'Pronom devant l’infinitif : Je vais l’appeler.'),
      b('ne… plus: I won’t any more (Je ne vais plus fumer).', 'ne… plus : arrêt d’une habitude (Je ne vais plus fumer).'),
    ],
    [['une résolution', b('a resolution', 'décision pour l’avenir')], ['arrêter de', b('to stop (doing)', 'cesser de')], ['la vérité', b('the truth', 'ce qui est vrai')]],
  ),
];
