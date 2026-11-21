import type { CourseAbout } from '../../types';
import { b, card, dlg, gap, lesson, mc, ord, P, pairs, say, sort, tip } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Ça te dirait de venir souper samedi ? Inviting, accepting and declining are delicate: you want to be warm, honest and polite at the same time. This course teaches the phrases to invite (formal and informal), to accept with enthusiasm, to decline without offending and to suggest another time, with the social codes of France and Québec (what to bring, how late to arrive).',
    'Ça te dirait de venir souper samedi ? Inviter, accepter et refuser sont des exercices délicats : on veut être chaleureux, honnête et poli à la fois. Ce cours présente les formules pour inviter (registre formel et familier), accepter avec enthousiasme, refuser sans vexer et proposer un autre moment, avec les codes sociaux de France et du Québec (quoi apporter, à quelle heure arriver).',
  ),
  outcomes: [
    b('Invite someone formally and informally', 'Inviter quelqu’un de façon formelle et familière'),
    b('Accept with enthusiasm', 'Accepter avec enthousiasme'),
    b('Decline politely with a reason', 'Refuser poliment avec une raison'),
    b('Suggest another time', 'Proposer un autre moment'),
  ],
};

const C = 'c-invitations';
export default [
  lesson(C, 1, ['inviting', 'inviter'],
    b('Inviting', 'Inviter'),
    b('Invite friends and colleagues in the right register.', 'Inviter amis et collègues dans le bon registre.'),
    [b('Invite informally', 'Inviter de façon familière'), b('Invite formally', 'Inviter de façon formelle'), b('Give the details: day, time, place', 'Donner les détails : jour, heure, lieu')],
    13,
    [
      card(b('Inviting', 'Inviter'), b('Informal: **Ça te dirait de… ?**, **Tu veux venir… ?**, **On se fait un resto ?** Formal: **Seriez-vous disponible pour… ?**, **J’aimerais vous inviter à…**, **Nous serions ravis de vous recevoir…**', 'Familier : **Ça te dirait de… ?**, **Tu veux venir… ?**, **On se fait un resto ?** Formel : **Seriez-vous disponible pour… ?**, **J’aimerais vous inviter à…**, **Nous serions ravis de vous recevoir…**'), {
        ex: [['Ça te dirait de venir souper samedi ?', 'Would you like to come for dinner on Saturday?'], ['Seriez-vous disponible pour un café mardi ?', 'Would you be available for a coffee on Tuesday?']],
      }),
      sort(b('Informal or formal invitation?', 'Invitation familière ou formelle ?'), [b('informal', 'familière'), b('formal', 'formelle')], [['Ça te dirait de… ?', 0], ['Seriez-vous disponible… ?', 1], ['On se fait un ciné ?', 0], ['J’aimerais vous inviter à…', 1], ['Tu viens ?', 0], ['Nous serions ravis de vous recevoir.', 1]]),
      mc(P.best, ['Seriez-vous disponible pour un dîner d’équipe vendredi midi ?', 'Tu viens bouffer vendredi ?', 'Vendredi, resto, OK ?', 'On se fait un truc ?'], { fr: 'Vous invitez votre directrice :' }),
      ord(P.order, 'Ça te dirait de venir prendre un verre ce soir ?', { tr: 'Would you like to come for a drink tonight?' }),
      gap(P.complete, 'Ça te ___ de venir au cinéma ce soir ? Le film commence à vingt heures. On se retrouve ___ du cinéma ?', ['dirait', ['en face', 'à côté', 'près']]),
      pairs(P.match, [['Ça te dirait de… ?', b('Would you like to…?', 'invitation familière')], ['prendre un verre', b('to have a drink', 'boire quelque chose')], ['souper', b('to have dinner (Québec)', 'repas du soir')], ['Seriez-vous disponible… ?', b('Would you be available…?', 'invitation polie')]]),
      say('Ça te dirait de venir souper chez nous samedi soir ?', 'Would you like to come for dinner at our place on Saturday evening?'),
    ],
    [
      b('Informal: Ça te dirait de… ? Tu veux venir… ? On se fait… ?', 'Familier : Ça te dirait de… ? Tu veux venir… ? On se fait… ?'),
      b('Formal: Seriez-vous disponible… ? J’aimerais vous inviter à…', 'Formel : Seriez-vous disponible… ? J’aimerais vous inviter à…'),
      b('Give day, time and place.', 'Donnez le jour, l’heure et le lieu.'),
    ],
    [['un verre', b('a drink', 'une boisson')], ['recevoir', b('to host, to receive', 'accueillir chez soi')], ['disponible', b('available', 'libre')]],
  ),
  lesson(C, 2, ['accepting-and-declining', 'accepter-et-refuser'],
    b('Accepting and declining', 'Accepter et refuser'),
    b('Accept warmly or decline gently, with a reason.', 'Accepter chaleureusement ou refuser avec douceur, en donnant une raison.'),
    [b('Accept with enthusiasm', 'Accepter avec enthousiasme'), b('Decline with a reason', 'Refuser avec une raison'), b('Soften a refusal', 'Adoucir un refus')],
    13,
    [
      card(b('Accept or decline', 'Accepter ou refuser'), b('Accept: **Avec plaisir !**, **Bonne idée !**, **Ça me ferait très plaisir.**, **Compte sur moi !** Decline: **C’est gentil, mais je ne peux pas, j’ai déjà…**, **Malheureusement, je ne suis pas libre.**, **Dommage, ce soir je travaille.**', 'Accepter : **Avec plaisir !**, **Bonne idée !**, **Ça me ferait très plaisir.**, **Compte sur moi !** Refuser : **C’est gentil, mais je ne peux pas, j’ai déjà…**, **Malheureusement, je ne suis pas libre.**, **Dommage, ce soir je travaille.**')),
      tip(b('Thank, then decline', 'Remerciez, puis refusez'), b('A refusal sounds kinder in three steps: **thanks** (C’est gentil / Merci de penser à moi), **reason** (mais j’ai déjà un rendez-vous), **regret** (C’est dommage !).', 'Un refus paraît plus aimable en trois temps : **remerciement** (C’est gentil / Merci de penser à moi), **raison** (mais j’ai déjà un rendez-vous), **regret** (C’est dommage !).')),
      mc(P.best, ['C’est gentil, mais je ne peux pas, j’ai déjà un souper de famille. Dommage !', 'Non.', 'Je ne veux pas venir.', 'Pas intéressé.'], { fr: 'Vous refusez poliment l’invitation d’une amie :' }),
      mc(P.best, ['Avec plaisir ! J’apporte quelque chose ?', 'D’accord, mais je reste dix minutes.', 'Peut-être, on verra.', 'Si je n’ai rien d’autre.'], { fr: 'Vous acceptez avec enthousiasme :' }),
      dlg(b('An invitation', 'Une invitation'), undefined, [['Camille', 'f'], ['Vous', 'm']], [
        [0, 'On organise une petite fête samedi pour l’anniversaire de Marc. Tu viens ?', 'We’re having a little party on Saturday for Marc’s birthday. Are you coming?'],
        [1, { options: ['Avec plaisir ! À quelle heure ? J’apporte quelque chose ?', 'Non merci, bye.', 'Je sais pas, peut-être pas, on verra.'] }],
        [0, 'Vers dix-neuf heures. Si tu veux, apporte un dessert !', 'Around 7 p.m. If you like, bring a dessert!'],
        [1, { options: ['Parfait, je ferai une tarte. Merci pour l’invitation !', 'Je n’aime pas les desserts.', 'Dix-neuf heures, c’est trop tôt, je refuse.'] }],
      ]),
      sort(b('Accept or decline?', 'Accepter ou refuser ?'), [b('accept', 'accepter'), b('decline', 'refuser')], [['Avec plaisir !', 0], ['Malheureusement, je ne suis pas libre.', 1], ['Compte sur moi !', 0], ['C’est gentil, mais je ne peux pas.', 1], ['Ça me ferait très plaisir.', 0], ['Dommage, je travaille ce soir-là.', 1]]),
      say('C’est très gentil, mais je ne peux pas samedi, j’ai déjà un engagement. C’est dommage !', 'That’s very kind, but I can’t on Saturday, I already have a commitment. What a shame!'),
    ],
    [
      b('Accept: Avec plaisir !, Compte sur moi !, Ça me ferait très plaisir.', 'Accepter : Avec plaisir !, Compte sur moi !, Ça me ferait très plaisir.'),
      b('Decline: thanks + reason + regret.', 'Refuser : remerciement + raison + regret.'),
      b('Ask: J’apporte quelque chose ?', 'Demander : J’apporte quelque chose ?'),
    ],
    [['un engagement', b('a commitment', 'obligation prévue')], ['dommage', b('a pity', 'regrettable')], ['apporter', b('to bring', 'venir avec')]],
  ),
  lesson(C, 3, ['another-time-and-social-codes', 'autre-moment-et-codes-sociaux'],
    b('Another time, and social codes', 'Un autre moment, et les codes sociaux'),
    b('Suggest a new date and follow the social codes of an invitation.', 'Proposer une autre date et respecter les codes sociaux d’une invitation.'),
    [b('Suggest another time', 'Proposer un autre moment'), b('Ask what to bring', 'Demander quoi apporter'), b('Know when to arrive', 'Savoir à quelle heure arriver')],
    13,
    [
      card(b('Suggesting another time', 'Proposer un autre moment'), b('**Ce soir, ce n’est pas possible, mais demain, ça te va ?** · **Et si on remettait ça à la semaine prochaine ?** · **Tu serais libre jeudi plutôt ?** · **On se reprend ?** (Québec: let’s do it another time).', '**Ce soir, ce n’est pas possible, mais demain, ça te va ?** · **Et si on remettait ça à la semaine prochaine ?** · **Tu serais libre jeudi plutôt ?** · **On se reprend ?** (Québec).')),
      card(b('Social codes', 'Les codes sociaux'), b('At a private dinner, arrive **10 to 15 minutes late** in France (never early!). Bring **a bottle of wine, flowers or a dessert**. In Québec, people often bring their own wine to a restaurant **« apportez votre vin »**. Always thank the next day.', 'À un dîner chez quelqu’un, arrivez **avec 10 à 15 minutes de retard** en France (jamais en avance !). Apportez **une bouteille de vin, des fleurs ou un dessert**. Au Québec, on apporte souvent son vin au restaurant **« apportez votre vin »**. Remerciez toujours le lendemain.'), { variant: 'culture' }),
      mc(P.best, ['Ce soir, je ne peux pas, mais jeudi, ça te va ?', 'Ce soir non. Jamais.', 'Demain peut-être, ou pas.', 'On verra un jour.'], { fr: 'Vous refusez mais proposez un autre jour :' }),
      mc(P.best, ['Merci encore pour hier soir, c’était délicieux !', 'Hier, c’était correct.', 'Je n’ai pas aimé le dessert.', 'Rien.'], { fr: 'Le lendemain d’un souper, vous écrivez à vos hôtes :' }),
      dlg(b('Rescheduling', 'Reporter un rendez-vous'), undefined, [['Inès', 'f'], ['Vous', 'm']], [
        [0, 'On va toujours au cinéma ce soir ?', 'Are we still going to the cinema tonight?'],
        [1, { options: ['Je suis désolé, je dois finir un rapport. Et si on remettait ça à samedi ?', 'Non, je ne viens plus. Salut.', 'Ce soir, peut-être, ou demain, je ne sais pas.'] }],
        [0, 'Samedi, parfait ! Même heure ?', 'Saturday, perfect! Same time?'],
        [1, { options: ['Oui, même heure, même endroit. Merci de ta compréhension !', 'Non, à minuit.', 'On verra.'] }],
      ]),
      pairs(P.match, [['remettre à', b('to postpone to', 'reporter')], ['Ça te va ?', b('Does that suit you?', 'tu es d’accord ?')], ['On se reprend ?', b('Another time? (Québec)', 'on fixe une autre date')], ['les hôtes', b('the hosts', 'ceux qui reçoivent')]]),
      say('Ce soir, ce n’est pas possible, mais tu serais libre jeudi plutôt ?', 'Tonight isn’t possible, but would you be free on Thursday instead?'),
    ],
    [
      b('Another time: Et si on remettait ça à… ? Tu serais libre… plutôt ?', 'Autre moment : Et si on remettait ça à… ? Tu serais libre… plutôt ?'),
      b('Arrive 10–15 min late at a private dinner in France.', 'Arrivez avec 10–15 min de retard à un dîner chez quelqu’un en France.'),
      b('Bring wine, flowers or dessert; thank the next day.', 'Apportez vin, fleurs ou dessert ; remerciez le lendemain.'),
    ],
    [['la compréhension', b('understanding', 'indulgence')], ['le lendemain', b('the next day', 'le jour suivant')], ['un endroit', b('a place', 'lieu')]],
  ),
];
