import type { CourseAbout } from '../../types';
import { b, card, dlg, gap, lesson, mc, ord, P, pairs, say, sort, trap } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'French conversation loves debate, but disagreeing well is an art: you can contradict someone and still keep the relationship warm. This course teaches you to give your opinion, to agree fully or partly, to disagree with tact, and to find common ground, with the key structures je pense que / je ne pense pas que + subjunctive.',
    'La conversation française adore le débat, mais savoir être en désaccord est un art : on peut contredire quelqu’un tout en gardant une relation chaleureuse. Ce cours vous apprend à donner votre avis, à être entièrement ou partiellement d’accord, à exprimer un désaccord avec tact et à trouver un terrain d’entente, avec les structures clés je pense que / je ne pense pas que + subjonctif.',
  ),
  outcomes: [
    b('Give your opinion', 'Donner son opinion'),
    b('Agree fully or partly', 'Être entièrement ou partiellement d’accord'),
    b('Disagree politely', 'Exprimer un désaccord poliment'),
    b('Find common ground', 'Trouver un terrain d’entente'),
  ],
};

const C = 'c-agree-disagree';
export default [
  lesson(C, 1, ['giving-your-opinion', 'donner-son-avis'],
    b('Giving your opinion', 'Donner son avis'),
    b('Express an opinion and ask for someone else’s.', 'Exprimer une opinion et demander celle des autres.'),
    [b('Use je pense que, à mon avis', 'Utiliser je pense que, à mon avis'), b('Use subjunctive after je ne pense pas que', 'Employer le subjonctif après je ne pense pas que'), b('Ask for an opinion', 'Demander un avis')],
    13,
    [
      card(b('Opinion phrases', 'Les formules d’opinion'), b('**Je pense que / Je trouve que / Je crois que** + indicatif. **À mon avis, …** · **Pour moi, …** · **Selon moi, …** Negative: **Je ne pense pas que ce soit une bonne idée** (subjonctif). Ask: **Qu’est-ce que tu en penses ? Tu es pour ou contre ?**', '**Je pense que / Je trouve que / Je crois que** + indicatif. **À mon avis, …** · **Pour moi, …** · **Selon moi, …** Négatif : **Je ne pense pas que ce soit une bonne idée** (subjonctif). Demander : **Qu’est-ce que tu en penses ? Tu es pour ou contre ?**')),
      mc(P.form, ['Je ne pense pas que ce soit possible.', 'Je ne pense pas que c’est possible demain.', 'Je ne pense pas que ce sera possible hier.', 'Je ne pense pas que ce être possible.']),
      gap(P.complete, 'À mon ___ , le télétravail est une bonne chose. Et toi, qu’est-ce que tu en ___ ?', ['avis', 'penses']),
      mc(P.best, ['Pour moi, c’est une excellente idée : les enfants pourront aller à l’école à vélo.', 'Oui.', 'Je ne sais pas, je m’en fiche.', 'C’est quoi, une piste cyclable ?'], { fr: '— Qu’est-ce que tu penses de la nouvelle piste cyclable ?' }),
      ord(P.order, 'Qu’est-ce que tu en penses, toi ?', { tr: 'What do you think about it?' }),
      pairs(P.match, [['À mon avis', b('In my opinion', 'selon moi')], ['Tu es pour ou contre ?', b('Are you for or against?', 'question d’opinion')], ['le télétravail', b('working from home', 'travailler à distance')], ['une piste cyclable', b('a bike lane', 'voie pour vélos')]]),
      say('À mon avis, c’est une bonne idée. Mais je ne pense pas que ce soit facile à organiser.', 'In my opinion, it’s a good idea. But I don’t think it’s easy to organise.'),
    ],
    [
      b('Je pense / trouve / crois que + indicatif.', 'Je pense / trouve / crois que + indicatif.'),
      b('Je ne pense pas que + subjonctif.', 'Je ne pense pas que + subjonctif.'),
      b('Ask: Qu’est-ce que tu en penses ?', 'Demander : Qu’est-ce que tu en penses ?'),
    ],
    [['un avis', b('an opinion', 'une opinion')], ['être pour', b('to be in favour', 'approuver')], ['être contre', b('to be against', 'désapprouver')]],
  ),
  lesson(C, 2, ['agreeing-fully-or-partly', 'accord-total-ou-partiel'],
    b('Agreeing fully or partly', 'Accord total ou partiel'),
    b('Show strong agreement or agree with a reservation.', 'Marquer un accord fort ou un accord avec une réserve.'),
    [b('Agree strongly', 'Approuver fortement'), b('Agree with a reservation', 'Approuver avec une réserve'), b('Use oui, mais…', 'Utiliser oui, mais…')],
    13,
    [
      card(b('Degrees of agreement', 'Les degrés d’accord'), b('Full: **Tout à fait ! Exactement ! Je suis entièrement d’accord. Tu as complètement raison.** Partial: **Oui, en partie.** · **C’est vrai, mais…** · **Je suis d’accord sur le principe, mais…** · **Je vois ce que tu veux dire, cependant…**', 'Total : **Tout à fait ! Exactement ! Je suis entièrement d’accord. Tu as complètement raison.** Partiel : **Oui, en partie.** · **C’est vrai, mais…** · **Je suis d’accord sur le principe, mais…** · **Je vois ce que tu veux dire, cependant…**')),
      sort(b('Full or partial agreement?', 'Accord total ou partiel ?'), [b('full', 'total'), b('partial', 'partiel')], [['Tout à fait !', 0], ['C’est vrai, mais…', 1], ['Exactement !', 0], ['D’accord sur le principe, mais…', 1], ['Tu as complètement raison.', 0], ['Oui, en partie.', 1]]),
      mc(P.best, ['Je suis d’accord sur le principe, mais ce sera difficile pour les petits commerces.', 'Tout à fait, rien à ajouter.', 'Non, jamais.', 'Je ne comprends pas.'], { fr: '— Il faudrait interdire les voitures au centre-ville. (accord partiel)' }),
      dlg(b('A discussion at work', 'Une discussion au travail'), undefined, [['Marion', 'f'], ['Vous', 'm']], [
        [0, 'Je trouve qu’on fait beaucoup trop de réunions.', 'I think we have far too many meetings.'],
        [1, { options: ['Tout à fait ! On perd un temps fou.', 'Je ne pense pas que tu as raison.', 'Réunion.'] }],
        [0, 'On pourrait les supprimer toutes, non ?', 'We could cancel all of them, couldn’t we?'],
        [1, { options: ['Je vois ce que tu veux dire, mais une réunion par semaine, c’est utile.', 'Exactement, plus jamais de réunions !', 'Tu dis n’importe quoi.'] }],
        [0, 'C’est vrai. Une seule, mais courte !', 'True. Just one, but short!'],
      ]),
      ord(P.order, 'Je vois ce que tu veux dire, mais ce n’est pas si simple.', { tr: 'I see what you mean, but it’s not that simple.' }),
      pairs(P.match, [['Tout à fait !', b('Absolutely!', 'accord total')], ['en partie', b('partly', 'pas complètement')], ['sur le principe', b('in principle', 'en théorie')], ['un temps fou', b('a crazy amount of time', 'énormément de temps')]]),
      say('C’est vrai, je suis d’accord sur le principe. Mais il faut aussi penser au budget.', 'True, I agree in principle. But we also have to think about the budget.'),
    ],
    [
      b('Full: Tout à fait ! Exactement ! Tu as complètement raison.', 'Total : Tout à fait ! Exactement ! Tu as complètement raison.'),
      b('Partial: C’est vrai, mais… D’accord sur le principe, mais…', 'Partiel : C’est vrai, mais… D’accord sur le principe, mais…'),
      b('Je vois ce que tu veux dire, cependant…', 'Je vois ce que tu veux dire, cependant…'),
    ],
    [['supprimer', b('to cancel, remove', 'enlever')], ['un petit commerce', b('a small shop', 'boutique de quartier')], ['interdire', b('to ban', 'défendre')]],
  ),
  lesson(C, 3, ['disagreeing-with-tact', 'le-desaccord-avec-tact'],
    b('Disagreeing with tact', 'Le désaccord avec tact'),
    b('Disagree without hurting, then look for common ground.', 'Exprimer un désaccord sans blesser, puis chercher un terrain d’entente.'),
    [b('Soften a disagreement', 'Adoucir un désaccord'), b('Avoid aggressive phrases', 'Éviter les formules agressives'), b('Find common ground', 'Trouver un terrain d’entente')],
    13,
    [
      card(b('Softening a disagreement', 'Adoucir le désaccord'), b('**Je ne suis pas tout à fait d’accord.** · **Je ne vois pas les choses comme ça.** · **Je comprends ton point de vue, mais je pense plutôt que…** · **Tu ne crois pas que… ?** Common ground: **On est au moins d’accord sur un point : …** · **On pourrait trouver un compromis.**', '**Je ne suis pas tout à fait d’accord.** · **Je ne vois pas les choses comme ça.** · **Je comprends ton point de vue, mais je pense plutôt que…** · **Tu ne crois pas que… ?** Terrain d’entente : **On est au moins d’accord sur un point : …** · **On pourrait trouver un compromis.**')),
      trap(b('Too direct', 'Trop direct'), b('**« Tu as tort. »**, **« C’est faux. »**, **« N’importe quoi ! »** can sound very aggressive. Prefer **« Je ne suis pas sûr(e) que ce soit vrai »** or **« Je ne vois pas les choses comme ça. »**', '**« Tu as tort. »**, **« C’est faux. »**, **« N’importe quoi ! »** peuvent paraître très agressifs. Préférez **« Je ne suis pas sûr(e) que ce soit vrai »** ou **« Je ne vois pas les choses comme ça. »**')),
      sort(b('Tactful or aggressive?', 'Avec tact ou agressif ?'), [b('tactful', 'avec tact'), b('aggressive', 'agressif')], [['Je ne vois pas les choses comme ça.', 0], ['N’importe quoi !', 1], ['Je comprends, mais je pense plutôt que…', 0], ['Tu as complètement tort.', 1], ['Tu ne crois pas que… ?', 0], ['C’est ridicule.', 1]]),
      mc(P.best, ['Je comprends ton point de vue, mais je pense plutôt que les jeunes lisent autrement, sur écran.', 'N’importe quoi, tu as tort.', 'C’est ridicule, ce que tu dis.', 'Tais-toi.'], { fr: '— Les jeunes ne lisent plus du tout.' }),
      dlg(b('Holidays: sea or mountains?', 'Vacances : mer ou montagne ?'), undefined, [['Paul', 'm'], ['Vous', 'f']], [
        [0, 'Cet été, on va à la mer, c’est décidé. La montagne, c’est ennuyeux.', 'This summer we’re going to the seaside, it’s decided. The mountains are boring.'],
        [1, { options: ['Je ne vois pas les choses comme ça. En montagne, il fait moins chaud et il y a moins de monde.', 'Tu as tort, comme toujours.', 'D’accord, comme tu veux, je m’en fiche.'] }],
        [0, 'Mmm, c’est vrai qu’en août, les plages sont bondées.', 'Hmm, it’s true that in August the beaches are packed.'],
        [1, { options: ['On est au moins d’accord sur un point ! Et si on faisait une semaine de chaque ?', 'Voilà, j’ai gagné.', 'Donc la mer, c’est nul.'] }],
      ]),
      pairs(P.match, [['un point de vue', b('a point of view', 'une opinion')], ['un compromis', b('a compromise', 'solution intermédiaire')], ['bondé', b('packed, crowded', 'plein de monde')], ['avoir tort', b('to be wrong', 'ne pas avoir raison')]]),
      say('Je comprends ton point de vue, mais je ne vois pas les choses comme ça. On pourrait trouver un compromis ?', 'I understand your point of view, but I don’t see things that way. Could we find a compromise?'),
    ],
    [
      b('Je ne suis pas tout à fait d’accord. Je ne vois pas les choses comme ça.', 'Je ne suis pas tout à fait d’accord. Je ne vois pas les choses comme ça.'),
      b('Avoid: Tu as tort, N’importe quoi, C’est ridicule.', 'À éviter : Tu as tort, N’importe quoi, C’est ridicule.'),
      b('Common ground: On est au moins d’accord sur un point.', 'Terrain d’entente : On est au moins d’accord sur un point.'),
    ],
    [['ennuyeux', b('boring', 'pas intéressant')], ['un terrain d’entente', b('common ground', 'point d’accord')], ['décidé', b('decided', 'choisi')]],
  ),
];
