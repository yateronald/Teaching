import type { CourseAbout } from '../../types';
import { b, card, dict, dlg, gap, lesson, mc, ord, P, pairs, say, sort, trap } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'French has two handy constructions that English expresses with tenses: venir de + infinitive for what has just happened (je viens d’arriver) and être en train de + infinitive for what is happening right now (je suis en train de cuisiner). Together with the near future, they form a simple timeline of the present moment. This course practises all three in messages, phone calls and everyday news.',
    'Le français possède deux constructions très pratiques que l’anglais exprime avec des temps : venir de + infinitif pour ce qui vient de se passer (je viens d’arriver) et être en train de + infinitif pour ce qui est en cours (je suis en train de cuisiner). Avec le futur proche, elles forment une ligne du temps simple autour du moment présent. Ce cours les pratique dans des messages, des appels et des nouvelles du quotidien.',
  ),
  outcomes: [
    b('Say what has just happened with venir de', 'Dire ce qui vient de se passer avec venir de'),
    b('Say what is in progress with être en train de', 'Dire ce qui est en cours avec être en train de'),
    b('Place an action before, during or after now', 'Situer une action avant, pendant ou après maintenant'),
    b('Give quick news by phone or text', 'Donner des nouvelles rapides par téléphone ou par message'),
  ],
};

const C = 'recent-past-progressive';
export default [
  lesson(C, 1, ['venir-de', 'venir-de'],
    b('Venir de: it has just happened', 'Venir de : ça vient de se passer'),
    b('Conjugate venir and use venir de + infinitive for the recent past.', 'Conjuguer venir et employer venir de + infinitif pour le passé récent.'),
    [b('Conjugate venir in the present', 'Conjuguer venir au présent'), b('Form venir de + infinitive', 'Former venir de + infinitif'), b('Elide de before a vowel', 'Élider de devant une voyelle')],
    13,
    [
      card(b('Just done', 'Tout juste accompli'), b('**venir** (present) + **de / d’** + infinitive = an action that **has just** happened: **Je viens de finir. Le train vient de partir. Elle vient d’appeler.** Venir: **je viens, tu viens, il vient, nous venons, vous venez, ils viennent**.', '**venir** (présent) + **de / d’** + infinitif = une action qui **vient juste** de se produire : **Je viens de finir. Le train vient de partir. Elle vient d’appeler.** Venir : **je viens, tu viens, il vient, nous venons, vous venez, ils viennent**.'), {
        ex: [['Je viens d’arriver à l’aéroport.', 'I’ve just arrived at the airport.'], ['Nous venons de déménager.', 'We’ve just moved.'], ['Ils viennent de se marier.', 'They’ve just got married.']],
      }),
      trap(b('Venir de + place ≠ venir de + verb', 'Venir de + lieu ≠ venir de + verbe'), b('**Je viens de Lyon** = I come from Lyon. **Je viens de manger** = I have just eaten. Only the infinitive makes it a recent past.', '**Je viens de Lyon** = mon origine. **Je viens de manger** = passé récent. Seul l’infinitif en fait un passé récent.')),
      mc(P.form, ['viennent', 'venons', 'vient', 'venent'], { fr: 'Les invités ___ d’arriver.' }),
      mc(P.meaning, [b('I have just eaten', 'j’ai mangé il y a très peu de temps'), b('I come from eating', 'je viens d’un repas'), b('I am going to eat', 'je vais manger'), b('I am eating', 'je suis en train de manger')], { fr: 'Je viens de manger.' }),
      gap(P.complete, 'Tu as raté Paul : il ___ ___ partir !', ['vient', 'de']),
      ord(P.order, 'Nous venons d’acheter une voiture.', { tr: 'We’ve just bought a car.' }),
      hearQ1(),
      say('Allô ? Je viens d’arriver à la gare, je suis devant l’entrée.', 'Hello? I’ve just arrived at the station, I’m in front of the entrance.'),
    ],
    [
      b('venir de + infinitive = has just (Je viens de finir).', 'venir de + infinitif = passé récent (Je viens de finir).'),
      b('de → d’ before a vowel: Elle vient d’appeler.', 'de → d’ devant une voyelle : Elle vient d’appeler.'),
      b('Venir de + place = origin (Je viens de Lyon).', 'Venir de + lieu = origine (Je viens de Lyon).'),
    ],
    [['rater', b('to miss', 'manquer')], ['se marier', b('to get married', 'épouser quelqu’un')], ['l’entrée', b('the entrance', 'l’accès')]],
  ),
  lesson(C, 2, ['etre-en-train-de', 'etre-en-train-de'],
    b('Être en train de: right now', 'Être en train de : en ce moment même'),
    b('Stress that an action is in progress with être en train de + infinitive.', 'Insister sur une action en cours avec être en train de + infinitif.'),
    [b('Form être en train de + infinitive', 'Former être en train de + infinitif'), b('Contrast it with the simple present', 'L’opposer au présent simple'), b('Explain why you are busy', 'Expliquer pourquoi on est occupé')],
    13,
    [
      card(b('In the middle of it', 'En plein dedans'), b('**être** (present) + **en train de** + infinitive stresses that an action is **in progress**: **Je suis en train de cuisiner.** The simple present can also mean “now”, but **en train de** insists: you are busy, do not disturb.', '**être** (présent) + **en train de** + infinitif insiste sur une action **en cours** : **Je suis en train de cuisiner.** Le présent simple peut aussi désigner le moment présent, mais **en train de** insiste : on est occupé.'), {
        ex: [['Chut, le bébé est en train de dormir.', 'Shh, the baby is sleeping.'], ['Je suis en train de conduire, je te rappelle.', 'I’m driving, I’ll call you back.'], ['Ils sont en train de repeindre la cuisine.', 'They’re repainting the kitchen.']],
      }),
      mc(P.best, ['Je suis en train de travailler.', 'J’ai en train de travailler.', 'Je suis en train travailler.', 'Je suis train de travailler.']),
      mc(P.best, ['Désolé, je suis en train de manger. Je te rappelle ?', 'Désolé, je viens de manger demain.', 'Désolé, je vais être mangé.', 'Désolé, je suis manger.']),
      sort(b('Habit or in progress?', 'Habitude ou action en cours ?'), [b('habit', 'habitude'), b('in progress', 'en cours')], [['Je cours le dimanche.', 0], ['Je suis en train de courir.', 1], ['Elle lit beaucoup.', 0], ['Elle est en train de lire.', 1], ['On regarde la télé le soir.', 0], ['On est en train de regarder un film.', 1]]),
      gap(P.complete, 'Ne les dérange pas, ils ___ en ___ de réviser leur examen.', ['sont', 'train']),
      dlg(b('A phone call at a bad time', 'Un appel au mauvais moment'), undefined, [['Sophie', 'f'], ['Vous', 'm']], [
        [0, 'Salut ! Tu as deux minutes ?', 'Hi! Do you have two minutes?'],
        [1, { options: ['Pas vraiment, je suis en train de faire les courses.', 'Pas vraiment, je viens en train de courses.', 'Pas vraiment, je suis faire les courses.'] }],
        [0, 'Ah, d’accord. Tu me rappelles ce soir ?', 'Oh, OK. Will you call me back tonight?'],
        [1, { options: ['Oui, sans faute. Bonne soirée !', 'Oui, je suis en train de rappeler hier.', 'Oui, je viens de rappeler ce soir.'] }],
      ], true),
      dict('Je suis en train de préparer le dîner.', { voice: 'f' }),
    ],
    [
      b('être en train de + infinitive = action in progress.', 'être en train de + infinitif = action en cours.'),
      b('More insistent than the simple present.', 'Plus insistant que le présent simple.'),
      b('Useful excuse: Je suis en train de…, je te rappelle.', 'Excuse utile : Je suis en train de…, je te rappelle.'),
    ],
    [['déranger', b('to disturb', 'gêner')], ['réviser', b('to revise, to study', 'revoir ses cours')], ['sans faute', b('without fail', 'c’est certain')]],
  ),
  lesson(C, 3, ['before-during-after', 'avant-pendant-apres'],
    b('Before, during, after: the timeline of now', 'Avant, pendant, après : la ligne du temps'),
    b('Combine venir de, être en train de and aller + infinitive.', 'Combiner venir de, être en train de et aller + infinitif.'),
    [b('Choose the right construction', 'Choisir la bonne construction'), b('Report a situation in real time', 'Raconter une situation en direct'), b('Write a quick update message', 'Écrire un message rapide')],
    13,
    [
      card(b('Three steps around now', 'Trois étapes autour du présent'), b('**Je viens de** + infinitive (just before) → **je suis en train de** + infinitive (now) → **je vais** + infinitive (just after). Together they tell a story in real time.', '**Je viens de** + infinitif (juste avant) → **je suis en train de** + infinitif (maintenant) → **je vais** + infinitif (juste après). Ensemble, elles racontent une scène en direct.'), {
        table: { head: [b('just before', 'juste avant'), b('now', 'maintenant'), b('just after', 'juste après')], rows: [['je viens de partir', 'je suis en train de rouler', 'je vais arriver'], ['il vient de manger', 'il est en train de dormir', 'il va se réveiller']] },
        ex: [['Je viens de sortir du travail, je suis en train de marcher vers le métro et je vais arriver dans vingt minutes.', 'I’ve just left work, I’m walking to the metro and I’ll be there in twenty minutes.']],
      }),
      mc(P.best, ['Le film vient de commencer.', 'Le film va de commencer.', 'Le film est en train commencer.', 'Le film vient commencer.'], { fr: 'Dépêche-toi, ___', explain: b('It started a moment ago: venir de.', 'Il a commencé il y a un instant : venir de.') }),
      mc(P.best, ['Il va pleuvoir.', 'Il vient de pleuvoir.', 'Il est en train de pleuvoir hier.', 'Il pleut de venir.'], { fr: 'Le ciel est noir : ___' }),
      sort(b('Just before, now or just after?', 'Juste avant, maintenant ou juste après ?'), [b('just before', 'juste avant'), b('now', 'maintenant'), b('just after', 'juste après')], [['Elle vient de partir.', 0], ['Elle est en train de partir.', 1], ['Elle va partir.', 2], ['On vient de finir.', 0], ['On est en train de finir.', 1], ['On va finir.', 2]]),
      gap(P.completeText, 'Je ___ de rentrer, je suis en ___ de me changer et je ___ venir à la fête.', ['viens', 'train', 'vais']),
      pairs(P.match, [['Je viens de partir.', b('I’ve just left.', 'passé récent')], ['Je suis en route.', b('I’m on my way.', 'déplacement en cours')], ['J’arrive !', b('I’m coming! / Almost there!', 'arrivée imminente')], ['Je vais être en retard.', b('I’m going to be late.', 'prévision')]]),
      ord(P.order, 'Je viens de sortir et je vais prendre un taxi.', { tr: 'I’ve just come out and I’m going to take a taxi.' }),
      say('Je viens de finir ma réunion, je suis en train de marcher et je vais arriver dans dix minutes.', 'I’ve just finished my meeting, I’m walking and I’ll arrive in ten minutes.'),
    ],
    [
      b('Just before: venir de. Now: être en train de. Just after: aller.', 'Juste avant : venir de. Maintenant : être en train de. Juste après : aller.'),
      b('Messages: Je suis en route. J’arrive ! Je vais être en retard.', 'Messages : Je suis en route. J’arrive ! Je vais être en retard.'),
      b('J’arrive can mean “I’m coming” right now.', 'J’arrive peut vouloir dire « je viens tout de suite ».'),
    ],
    [['être en route', b('to be on one’s way', 'être en chemin')], ['rentrer', b('to come back home', 'revenir chez soi')], ['se changer', b('to get changed', 'changer de vêtements')]],
  ),
];

function hearQ1() {
  return mc(P.listen, [b('The meeting has just finished.', 'La réunion vient de finir.'), b('The meeting is about to start.', 'La réunion va commencer.'), b('The meeting is in progress.', 'La réunion est en cours.'), b('The meeting is tomorrow.', 'La réunion est demain.')], { audio: 'La réunion vient de se terminer, je t’appelle dans cinq minutes.', listen: true });
}
