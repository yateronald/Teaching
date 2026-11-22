import type { CourseAbout } from '../../types';
import { b, card, conj, dict, dlg, gap, hear, lesson, mc, ord, P, say, sort, tip, trap, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Je viens de finir, je suis en train de cuisiner, le film est sur le point de commencer. Three short constructions place an action just before, during or just after the present moment. They use verbs you already know (venir, être) and they are everywhere in conversation, on the phone and in messages. This course trains each one, then places them on a timeline with the near future.',
    'Je viens de finir, je suis en train de cuisiner, le film est sur le point de commencer. Trois constructions courtes situent une action juste avant, pendant ou juste après le moment présent. Elles emploient des verbes que vous connaissez déjà (venir, être) et on les entend partout : en conversation, au téléphone, dans les messages. Ce cours entraîne chacune d’elles, puis les place sur une ligne du temps avec le futur proche.',
  ),
  outcomes: [
    b('Say what has just happened with venir de', 'Dire ce qui vient de se passer avec venir de'),
    b('Describe an action in progress with être en train de', 'Décrire une action en cours avec être en train de'),
    b('Say what is about to happen with être sur le point de', 'Dire ce qui va arriver avec être sur le point de'),
    b('Place actions on a timeline around now', 'Situer des actions sur une ligne du temps autour du présent'),
  ],
};

const C = 'cj-passe-recent';

export default [
  lesson(C, 1, ['venir-de', 'venir-de'],
    b('Venir de + infinitive: the recent past', 'Venir de + infinitif : le passé récent'),
    b('Je viens de manger: something happened a moment ago.', 'Je viens de manger : quelque chose s’est passé il y a un instant.'),
    [b('Conjugate venir in the present', 'Conjuguer venir au présent'), b('Form the recent past', 'Former le passé récent'), b('Tell it apart from venir de + place', 'Le distinguer de venir de + lieu')],
    13,
    [
      card(b('Just happened', 'Vient de se passer'), b('To say that something has **just** happened, use **venir** in the present + **de** + infinitive. Forms: **je viens de manger, tu viens de partir, il vient d’arriver, nous venons de finir, vous venez de voir, ils viennent d’appeler**. Before a vowel, de becomes **d’**.', 'Pour dire que quelque chose **vient** de se passer, employez **venir** au présent + **de** + infinitif. Formes : **je viens de manger, tu viens de partir, il vient d’arriver, nous venons de finir, vous venez de voir, ils viennent d’appeler**. Devant une voyelle, de devient **d’**.'), {
        ex: [['Je viens de recevoir ton message.', 'I’ve just got your message.'], ['Le train vient de partir !', 'The train has just left!'], ['Nous venons d’emménager.', 'We’ve just moved in.']],
      }),
      trap(b('Origin or recent past?', 'Origine ou passé récent ?'), b('**Je viens de Paris** gives an origin (I come from Paris). **Je viens de manger** is the recent past (I have just eaten). What follows de makes the difference: a place, or an infinitive.', '**Je viens de Paris** indique une origine. **Je viens de manger** est le passé récent. Ce qui suit de fait la différence : un lieu, ou un infinitif.')),
      conj('finir', b('passé récent', 'passé récent'), [['je', 'viens de finir'], ['tu', 'viens de finir'], ['il / elle', 'vient de finir'], ['nous', 'venons de finir'], ['vous', 'venez de finir'], ['ils / elles', 'viennent de finir']], { given: [0] }),
      mc(P.form, ['vient d’arriver', 'vient arriver', 'viens d’arriver', 'vient de arriver'], { fr: 'Ne pars pas, ta sœur ___ !' }),
      mc(P.meaning, [b('They have just moved house', 'Ils ont déménagé il y a très peu de temps'), b('They are going to move house', 'Ils vont déménager'), b('They come from a removal company', 'Ils viennent d’une entreprise de déménagement'), b('They moved house a long time ago', 'Ils ont déménagé il y a longtemps')], { fr: 'Ils viennent de déménager.' }),
      gap(P.complete, 'Je ___ (venir de + terminer) mon rapport. Vous ___ (venir de + rater) le bus de dix heures.', [['viens de terminer'], ['venez de rater']]),
      sort(b('Origin or recent past?', 'Origine ou passé récent ?'), [b('venir de + place: origin', 'venir de + lieu : origine'), b('venir de + infinitive: recent past', 'venir de + infinitif : passé récent')], [['Elle vient de Lyon.', 0], ['Elle vient de sortir.', 1], ['Je viens du Maroc.', 0], ['Je viens de comprendre.', 1], ['Ils viennent d’Italie.', 0], ['Ils viennent d’arriver.', 1]]),
      hear('Je viens de te l’envoyer.', P.meaning, [b('I have just sent it to you', 'Je te l’ai envoyé il y a un instant'), b('I am going to send it to you', 'Je vais te l’envoyer'), b('I sent it to you last week', 'Je te l’ai envoyé la semaine dernière')]),
      dict('Le film vient de commencer, dépêche-toi !'),
      say('Je viens d’apprendre la bonne nouvelle !', 'I’ve just heard the good news!'),
    ],
    [
      b('Recent past = venir (present) + de + infinitive.', 'Passé récent = venir (présent) + de + infinitif.'),
      b('viens, viens, vient, venons, venez, viennent.', 'viens, viens, vient, venons, venez, viennent.'),
      b('venir de + place = origin; venir de + infinitive = just happened.', 'venir de + lieu = origine ; venir de + infinitif = vient de se passer.'),
    ],
    [['emménager', b('to move in', 's’installer dans un logement')], ['rater', b('to miss (a bus, a train)', 'arriver trop tard pour')], ['une nouvelle', b('a piece of news', 'une information')]],
  ),

  lesson(C, 2, ['en-train-de-and-sur-le-point-de', 'en-train-de-et-sur-le-point-de'],
    b('Être en train de, être sur le point de', 'Être en train de, être sur le point de'),
    b('An action in progress, and an action about to happen.', 'Une action en cours, et une action sur le point d’arriver.'),
    [b('Describe an action in progress', 'Décrire une action en cours'), b('Say what is about to happen', 'Dire ce qui va arriver tout de suite'), b('Explain why you are busy', 'Expliquer que l’on est occupé')],
    13,
    [
      card(b('Right now, and any second now', 'En ce moment, et dans un instant'), b('**Être en train de** + infinitive shows an action in progress right now: **je suis en train de cuisiner**. **Être sur le point de** + infinitive shows something about to happen: **le film est sur le point de commencer**. Only être is conjugated.', '**Être en train de** + infinitif montre une action en cours en ce moment : **je suis en train de cuisiner**. **Être sur le point de** + infinitif montre ce qui va arriver tout de suite : **le film est sur le point de commencer**. Seul être se conjugue.'), {
        table: {
          head: ['', 'en train de', 'sur le point de'],
          rows: [['je', 'suis en train de lire', 'suis sur le point de partir'], ['tu', 'es en train de lire', 'es sur le point de partir'], ['il / elle', 'est en train de lire', 'est sur le point de partir'], ['nous', 'sommes en train de lire', 'sommes sur le point de partir'], ['vous', 'êtes en train de lire', 'êtes sur le point de partir'], ['ils / elles', 'sont en train de lire', 'sont sur le point de partir']],
        },
      }),
      tip(b('Why not just the present?', 'Pourquoi pas le présent ?'), b('**Je cuisine** is correct too. **Je suis en train de cuisiner** insists that you are busy with it at this very moment. It is useful to explain why you cannot do something: **Je ne peux pas répondre, je suis en train de conduire.**', '**Je cuisine** est correct aussi. **Je suis en train de cuisiner** insiste sur le fait que l’on est occupé à cela en ce moment même. C’est utile pour expliquer pourquoi on ne peut pas faire autre chose : **Je ne peux pas répondre, je suis en train de conduire.**')),
      conj('travailler', b('être en train de', 'être en train de'), [['je', 'suis en train de travailler'], ['tu', 'es en train de travailler'], ['il / elle', 'est en train de travailler'], ['nous', 'sommes en train de travailler'], ['vous', 'êtes en train de travailler'], ['ils / elles', 'sont en train de travailler']], { given: [0] }),
      mc(P.form, ['sommes en train de', 'avons en train de', 'sommes train de', 'venons en train de'], { fr: 'Ne nous dérange pas, nous ___ réviser.' }),
      mc(P.form, ['est sur le point de', 'est sur le point', 'va sur le point de', 'est au point de'], { fr: 'Vite, le magasin ___ fermer !' }),
      gap(P.complete, 'Chut ! Le bébé ___ (être en train de + dormir). Elles ___ (être sur le point de + partir).', [['est en train de dormir'], ['sont sur le point de partir']]),
      ord(P.order, 'Je suis en train de préparer le dîner.', { tr: 'I’m making dinner.' }),
      hear('Il est sur le point de signer le contrat.', b('When will he sign?', 'Quand va-t-il signer ?'), [b('Very soon, any moment now', 'Très bientôt, dans un instant'), b('He signed it yesterday', 'Il l’a signé hier'), b('In a year', 'Dans un an')]),
      dict('Nous sommes en train de repeindre la cuisine et nous sommes sur le point de finir.'),
      say('Désolée, je ne peux pas parler, je suis en train de conduire.', 'Sorry, I can’t talk, I’m driving.'),
    ],
    [
      b('Être en train de + infinitive: in progress right now.', 'Être en train de + infinitif : en cours en ce moment.'),
      b('Être sur le point de + infinitive: about to happen.', 'Être sur le point de + infinitif : sur le point d’arriver.'),
      b('Only être is conjugated; the infinitive never changes.', 'Seul être se conjugue ; l’infinitif ne change jamais.'),
    ],
    [['réviser', b('to revise, to study', 'revoir ses leçons')], ['repeindre', b('to repaint', 'peindre de nouveau')], ['signer', b('to sign', 'mettre son nom')]],
  ),

  lesson(C, 3, ['timeline-and-review', 'ligne-du-temps-et-bilan'],
    b('On the timeline: review', 'Sur la ligne du temps : bilan'),
    b('Just before, right now, very soon, later: and the same ideas told in the past.', 'Juste avant, en ce moment, bientôt, plus tard : et les mêmes idées racontées au passé.'),
    [b('Place actions on a timeline', 'Situer des actions sur une ligne du temps'), b('Use venais de and étais en train de in a story', 'Employer venais de et étais en train de dans un récit'), b('Explain your situation in a message', 'Expliquer sa situation dans un message')],
    13,
    [
      card(b('Around the present moment', 'Autour du moment présent'), b('Five constructions place an action around now. Before: **je viens de manger**. Now: **je suis en train de manger**. Very soon: **je suis sur le point de manger**. Later: **je vais manger**. In general: **je mange**.', 'Cinq constructions situent une action autour de maintenant. Avant : **je viens de manger**. Maintenant : **je suis en train de manger**. Très bientôt : **je suis sur le point de manger**. Plus tard : **je vais manger**. En général : **je mange**.')),
      sort(b('Place each sentence on the timeline.', 'Placez chaque phrase sur la ligne du temps.'), [b('just before', 'juste avant'), b('right now', 'en ce moment'), b('very soon', 'très bientôt'), b('later', 'plus tard')], [['je viens de finir', 0], ['elle est en train d’écrire', 1], ['ils sont sur le point de partir', 2], ['nous allons déménager l’an prochain', 3], ['tu viens d’arriver', 0], ['on est en train de manger', 1], ['le spectacle est sur le point de commencer', 2], ['vous allez adorer ce livre', 3]]),
      tip(b('The same ideas in a past story', 'Les mêmes idées dans un récit au passé'), b('In a story, put venir and être in the **imparfait**: **je venais de rentrer** (I had just come home), **j’étais en train de lire** (I was reading). Then the passé composé tells the event: **Je venais de rentrer quand tu as appelé.**', 'Dans un récit, mettez venir et être à l’**imparfait** : **je venais de rentrer**, **j’étais en train de lire**. Le passé composé raconte ensuite l’événement : **Je venais de rentrer quand tu as appelé.**')),
      mc(P.form, ['venais de', 'viens de', 'suis venu de', 'venir de'], { fr: 'Je ___ m’endormir quand le téléphone a sonné.' }),
      mc(P.form, ['était en train de', 'est en train de', 'a été en train de', 'sera en train de'], { fr: 'Quand je suis entrée, mon fils ___ jouer aux jeux vidéo.' }),
      dlg(b('A call at the wrong moment', 'Un appel au mauvais moment'), b('Lucas calls Nadia.', 'Lucas appelle Nadia.'), [['Lucas', 'm'], ['Nadia', 'f']], [
        [0, 'Allô Nadia ? Tu es libre ?', 'Hello Nadia? Are you free?'],
        [1, { options: ['Pas vraiment, je suis en train de cuisiner.', 'Pas vraiment, je suis en train cuisiner.', 'Pas vraiment, je viens en train de cuisiner.'] }],
        [0, 'D’accord. Tu as vu mon message ?', 'OK. Did you see my message?'],
        [1, { options: ['Oui, je viens de le lire.', 'Oui, je viens le lire de.', 'Oui, je viens de lire le.'] }],
        [0, 'Super. On se rappelle plus tard ?', 'Great. Shall we talk later?'],
        [1, { options: ['Oui, je suis sur le point de passer à table. À tout à l’heure !', 'Oui, je suis sur le point passer à table. À tout à l’heure !', 'Oui, je suis au point de passer à table. À tout à l’heure !'] }],
      ]),
      write(b('A message to a friend', 'Un message à un ami'), b('A friend invites you out tonight. In 30 to 55 words, answer: say what you have just done, what you are doing now, and what is about to happen.', 'Un ami vous invite à sortir ce soir. En 30 à 55 mots, répondez : dites ce que vous venez de faire, ce que vous êtes en train de faire et ce qui est sur le point d’arriver.'), 30, 55, [
        b('One sentence with venir de', 'Une phrase avec venir de'),
        b('One sentence with être en train de', 'Une phrase avec être en train de'),
        b('One sentence with être sur le point de', 'Une phrase avec être sur le point de'),
      ], 'Salut Inès ! Je viens de rentrer du travail et je suis en train de préparer le dîner. Mes enfants viennent de finir leurs devoirs. Mon mari est sur le point d’arriver, alors je ne peux pas sortir ce soir. On se voit demain ?'),
      say('Je venais de m’asseoir quand on a sonné à la porte.', 'I had just sat down when someone rang the doorbell.'),
    ],
    [
      b('Before: venir de; now: être en train de; soon: être sur le point de; later: aller.', 'Avant : venir de ; maintenant : être en train de ; bientôt : être sur le point de ; plus tard : aller.'),
      b('In a story: je venais de…, j’étais en train de… (imparfait).', 'Dans un récit : je venais de…, j’étais en train de… (imparfait).'),
      b('Then the passé composé for the event: quand tu as appelé.', 'Puis le passé composé pour l’événement : quand tu as appelé.'),
    ],
    [['s’endormir', b('to fall asleep', 'commencer à dormir')], ['passer à table', b('to sit down to eat', 'commencer le repas')], ['à tout à l’heure', b('see you later', 'à bientôt aujourd’hui')]],
  ),
];
