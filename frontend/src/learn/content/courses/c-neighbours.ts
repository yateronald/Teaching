import type { CourseAbout } from '../../types';
import { b, card, culture, dlg, lesson, mc, ord, P, pairs, say, sort, tip } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Could you water my plants? Would you have a ladder to lend me? The music is a bit loud tonight… Living in a building or a street means asking for small favours, offering help and sometimes solving a conflict. This course gives you the polite phrases to build good relationships with your neighbours and to raise a problem without starting a war.',
    'Pourriez-vous arroser mes plantes ? Auriez-vous une échelle à me prêter ? La musique est un peu forte ce soir… Vivre dans un immeuble ou une rue, c’est demander de petits services, proposer son aide et parfois régler un conflit. Ce cours vous donne les formules polies pour entretenir de bonnes relations avec vos voisins et soulever un problème sans déclencher une guerre.',
  ),
  outcomes: [
    b('Ask a neighbour for a favour', 'Demander un service à un voisin'),
    b('Offer help and accept thanks', 'Proposer son aide et accepter un remerciement'),
    b('Raise a problem tactfully', 'Soulever un problème avec tact'),
    b('Find an arrangement together', 'Trouver un arrangement ensemble'),
  ],
};

const C = 'c-neighbours';
export default [
  lesson(C, 1, ['asking-a-favour', 'demander-un-service'],
    b('Asking a favour', 'Demander un service'),
    b('Ask for a small service politely and thank warmly.', 'Demander un petit service poliment et remercier chaleureusement.'),
    [b('Ask with « Est-ce que vous pourriez… ? »', 'Demander avec « Est-ce que vous pourriez… ? »'), b('Borrow an object', 'Emprunter un objet'), b('Thank and offer something back', 'Remercier et proposer quelque chose en retour')],
    13,
    [
      card(b('A small favour', 'Un petit service'), b('**Excusez-moi de vous déranger…** **Est-ce que vous pourriez arroser mes plantes pendant mon absence ?** · **Est-ce que vous auriez une perceuse à me prêter ?** · **Ça vous embêterait de récupérer mon colis ?** Thanks: **Merci mille fois ! C’est vraiment gentil. Je vous revaudrai ça !**', '**Excusez-moi de vous déranger…** **Est-ce que vous pourriez arroser mes plantes pendant mon absence ?** · **Est-ce que vous auriez une perceuse à me prêter ?** · **Ça vous embêterait de récupérer mon colis ?** Remercier : **Merci mille fois ! C’est vraiment gentil. Je vous revaudrai ça !**'), {
        ex: [['Est-ce que vous auriez une échelle à me prêter ?', 'Would you have a ladder to lend me?'], ['Merci mille fois, je vous revaudrai ça !', 'Thanks a million, I’ll return the favour!']],
      }),
      tip(b('Prêter or emprunter?', 'Prêter ou emprunter ?'), b('**Prêter** = to lend (give for a while). **Emprunter** = to borrow (take for a while). « Vous pouvez me **prêter** votre échelle ? » = « Je peux **emprunter** votre échelle ? »', '**Prêter** = donner pour un temps. **Emprunter** = prendre pour un temps. « Vous pouvez me **prêter** votre échelle ? » = « Je peux **emprunter** votre échelle ? »')),
      mc(P.word, ['emprunter', 'prêter', 'donner', 'louer'], { fr: 'Excusez-moi, est-ce que je pourrais ___ votre aspirateur pour une heure ?' }),
      mc(P.best, ['Excusez-moi de vous déranger, ça vous embêterait de récupérer mon colis demain ?', 'Prenez mon colis demain.', 'Vous allez prendre mon colis.', 'Colis. Demain. Merci.'], { fr: 'Vous serez absent quand votre colis arrivera :' }),
      ord(P.order, 'Est-ce que vous auriez une perceuse à me prêter ?', { tr: 'Would you have a drill to lend me?' }),
      pairs(P.match, [['arroser', b('to water', 'donner de l’eau aux plantes')], ['une échelle', b('a ladder', 'pour monter en hauteur')], ['Ça vous embêterait de… ?', b('Would you mind…?', 'demande très polie')], ['Je vous revaudrai ça.', b('I’ll return the favour.', 'je vous rendrai service')]]),
      say('Excusez-moi de vous déranger, est-ce que vous pourriez arroser mes plantes ce week-end ?', 'Sorry to bother you, could you water my plants this weekend?'),
    ],
    [
      b('Est-ce que vous pourriez… ? Ça vous embêterait de… ?', 'Est-ce que vous pourriez… ? Ça vous embêterait de… ?'),
      b('Prêter = to lend; emprunter = to borrow.', 'Prêter = donner pour un temps ; emprunter = prendre pour un temps.'),
      b('Merci mille fois ! Je vous revaudrai ça !', 'Merci mille fois ! Je vous revaudrai ça !'),
    ],
    [['une perceuse', b('a drill', 'outil pour faire des trous')], ['un aspirateur', b('a vacuum cleaner', 'appareil de ménage')], ['pendant mon absence', b('while I’m away', 'quand je ne suis pas là')]],
  ),
  lesson(C, 2, ['offering-help', 'proposer-son-aide'],
    b('Offering help', 'Proposer son aide'),
    b('Offer help naturally, accept or refuse an offer, and answer thanks.', 'Proposer son aide naturellement, accepter ou refuser une offre, et répondre à un remerciement.'),
    [b('Offer help', 'Proposer son aide'), b('Accept or decline an offer', 'Accepter ou refuser une offre'), b('Answer « merci »', 'Répondre à « merci »')],
    13,
    [
      card(b('Offering', 'Proposer'), b('**Je peux vous aider ?** · **Vous voulez un coup de main ?** · **Je vous porte vos sacs ?** · **N’hésitez pas si vous avez besoin de quelque chose.** Answer thanks: **De rien ! Avec plaisir ! C’est normal ! Je vous en prie.** (Québec: **Bienvenue !**)', '**Je peux vous aider ?** · **Vous voulez un coup de main ?** · **Je vous porte vos sacs ?** · **N’hésitez pas si vous avez besoin de quelque chose.** Répondre au merci : **De rien ! Avec plaisir ! C’est normal ! Je vous en prie.** (Québec : **Bienvenue !**)')),
      mc(P.best, ['Vous voulez un coup de main ? Je peux porter vos sacs.', 'Vous êtes trop lente.', 'Pourquoi tant de sacs ?', 'Attention, vous bloquez l’escalier.'], { fr: 'Votre voisine âgée monte l’escalier avec trois sacs lourds :' }),
      mc(P.best, ['Je vous en prie, c’est normal entre voisins !', 'Oui, je sais.', 'Vous me devez dix euros.', 'Enfin un merci.'], { fr: '— Merci infiniment pour votre aide !' }),
      dlg(b('A new neighbour', 'Une nouvelle voisine'), b('A new neighbour is moving in with lots of boxes.', 'Une nouvelle voisine emménage avec beaucoup de cartons.'), [['Vous', 'm'], ['Leïla', 'f']], [
        [0, { options: ['Bonjour ! Vous emménagez ? Vous voulez un coup de main avec les cartons ?', 'Bonjour. Vous faites du bruit.', 'Vos cartons sont dans le passage.'] }],
        [1, 'Oh, c’est très gentil ! Mais ça va, mes amis arrivent dans dix minutes.', 'Oh, that’s very kind! But it’s fine, my friends are arriving in ten minutes.'],
        [0, { options: ['D’accord ! N’hésitez pas si vous avez besoin de quelque chose. J’habite au deuxième.', 'Tant pis pour vous.', 'Alors pourquoi vous avez dit oui ?'] }],
        [1, 'Merci beaucoup, c’est vraiment sympa !', 'Thanks a lot, that’s really nice!'],
        [0, { options: ['Avec plaisir ! Bienvenue dans l’immeuble !', 'Oui, je suis sympa.', 'Ça fera cinq euros.'] }],
      ]),
      sort(b('Offering or answering thanks?', 'Proposer ou répondre au merci ?'), [b('offering help', 'proposer son aide'), b('answering thanks', 'répondre au merci')], [['Je peux vous aider ?', 0], ['De rien !', 1], ['Vous voulez un coup de main ?', 0], ['Je vous en prie.', 1], ['Je vous porte ça ?', 0], ['C’est normal !', 1]]),
      pairs(P.match, [['un coup de main', b('a hand (help)', 'une aide rapide')], ['emménager', b('to move in', 'arriver dans un logement')], ['un carton', b('a cardboard box', 'boîte pour déménager')], ['Je vous en prie.', b('You’re welcome. (formal)', 'réponse polie au merci')]]),
      say('Vous voulez un coup de main ? N’hésitez pas si vous avez besoin de quelque chose !', 'Do you want a hand? Don’t hesitate if you need anything!'),
    ],
    [
      b('Offer: Je peux vous aider ? Vous voulez un coup de main ?', 'Proposer : Je peux vous aider ? Vous voulez un coup de main ?'),
      b('Decline an offer kindly: C’est gentil, mais ça va.', 'Refuser une offre gentiment : C’est gentil, mais ça va.'),
      b('Answer thanks: De rien, je vous en prie, avec plaisir.', 'Répondre au merci : De rien, je vous en prie, avec plaisir.'),
    ],
    [['un immeuble', b('a building', 'bâtiment d’appartements')], ['porter', b('to carry', 'tenir en se déplaçant')], ['âgé', b('elderly', 'vieux, poli')]],
  ),
  lesson(C, 3, ['solving-a-small-conflict', 'regler-un-petit-conflit'],
    b('Solving a small conflict', 'Régler un petit conflit'),
    b('Raise a problem (noise, parking, rubbish) tactfully and agree on a solution.', 'Soulever un problème (bruit, stationnement, poubelles) avec tact et s’accorder sur une solution.'),
    [b('Raise a problem without accusing', 'Soulever un problème sans accuser'), b('Suggest an arrangement', 'Proposer un arrangement'), b('Accept an apology', 'Accepter des excuses')],
    13,
    [
      card(b('Raising a problem', 'Soulever un problème'), b('**Je me permets de venir vous voir, parce que…** · **Je ne sais pas si vous vous en rendez compte, mais la musique s’entend beaucoup chez moi.** Suggest: **Est-ce que ce serait possible de baisser un peu après 22 h ?** Accept an apology: **Ce n’est pas grave. Merci de votre compréhension.**', '**Je me permets de venir vous voir, parce que…** · **Je ne sais pas si vous vous en rendez compte, mais la musique s’entend beaucoup chez moi.** Proposer : **Est-ce que ce serait possible de baisser un peu après 22 h ?** Accepter des excuses : **Ce n’est pas grave. Merci de votre compréhension.**')),
      culture(b('Quiet hours', 'Les heures de silence'), b('In France and Québec, many buildings have rules on noise, often **after 22 h**. People first talk face to face; a written note in the lobby is seen as cold, and calling the police is the last resort.', 'En France et au Québec, beaucoup d’immeubles ont des règles sur le bruit, souvent **après 22 h**. On commence par en parler en personne ; un mot écrit dans le hall paraît froid, et appeler la police est le dernier recours.')),
      mc(P.best, ['Je ne sais pas si vous vous en rendez compte, mais on entend beaucoup la musique chez nous le soir.', 'Votre musique est horrible !', 'Arrêtez ou j’appelle la police !', 'Vous êtes vraiment des voisins pénibles.'], { fr: 'Vous parlez au voisin du dessus :' }),
      mc(P.best, ['Ce n’est pas grave, merci de votre compréhension !', 'J’espère bien !', 'Il était temps.', 'La prochaine fois, c’est la police.'], { fr: '— Oh, je suis vraiment désolé, je ne savais pas qu’on entendait autant.' }),
      dlg(b('The parking spot', 'La place de stationnement'), undefined, [['Vous', 'f'], ['Voisin', 'm']], [
        [0, { options: ['Bonjour ! Je me permets de venir vous voir : votre voiture est souvent garée sur ma place.', 'Encore vous sur ma place ! C’est la dernière fois !', 'Bougez votre voiture.'] }],
        [1, 'Ah, vraiment ? Je pensais que c’était une place libre. Je suis désolé.', 'Oh, really? I thought it was a free spot. I’m sorry.'],
        [0, { options: ['Ce n’est pas grave. La vôtre, c’est la 14, juste à côté.', 'Oui, vous devriez être désolé.', 'Tant pis pour vous.'] }],
        [1, 'D’accord, je ferai attention. Merci de me l’avoir dit gentiment.', 'All right, I’ll be careful. Thanks for telling me kindly.'],
      ]),
      ord(P.order, 'Est-ce que ce serait possible de baisser la musique après 22 heures ?', { tr: 'Would it be possible to turn the music down after 10 p.m.?' }),
      say('Je me permets de venir vous voir. Est-ce que ce serait possible de baisser un peu la musique le soir ?', 'I’m taking the liberty of coming to see you. Would it be possible to turn the music down a little in the evening?'),
    ],
    [
      b('Open: Je me permets de venir vous voir, parce que…', 'Ouvrir : Je me permets de venir vous voir, parce que…'),
      b('Soften: Je ne sais pas si vous vous en rendez compte, mais…', 'Adoucir : Je ne sais pas si vous vous en rendez compte, mais…'),
      b('Propose: Est-ce que ce serait possible de… ?', 'Proposer : Est-ce que ce serait possible de… ?'),
    ],
    [['se rendre compte', b('to realise', 'prendre conscience')], ['baisser', b('to turn down', 'diminuer le volume')], ['garé', b('parked', 'stationné')]],
  ),
];
