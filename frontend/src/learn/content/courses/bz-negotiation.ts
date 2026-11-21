import type { CourseAbout } from '../../types';
import { b, card, culture, dlg, gap, hear, lesson, mc, ord, P, pairs, say, sort, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Negotiating a contract, a price, a deadline or a salary in French requires precise language: making an offer with the conditional, conditioning a concession (« si vous…, nous pourrions… »), refusing without breaking the relationship, and summarising the agreement. This B2 course trains each phase of a negotiation, with the cultural nuances of French and Québec business (relationship, formality, written confirmation).',
    'Négocier un contrat, un prix, un délai ou un salaire en français exige une langue précise : faire une offre au conditionnel, conditionner une concession (« si vous…, nous pourrions… »), refuser sans rompre la relation et récapituler l’accord. Ce cours de niveau B2 entraîne chaque phase de la négociation, avec les nuances culturelles des affaires en France et au Québec (relation, formalité, confirmation écrite).',
  ),
  outcomes: [
    b('Make and counter offers', 'Faire des offres et des contre-propositions'),
    b('Trade concessions with conditions', 'Échanger des concessions sous condition'),
    b('Refuse firmly and politely', 'Refuser fermement et poliment'),
    b('Summarise and confirm the deal', 'Récapituler et confirmer l’accord'),
  ],
};

const C = 'bz-negotiation';
export default [
  lesson(C, 1, ['offers-and-counter-offers', 'offres-et-contre-propositions'],
    b('Offers and counter-offers', 'Offres et contre-propositions'),
    b('Open the negotiation, state your position and make a counter-offer.', 'Ouvrir la négociation, énoncer sa position et faire une contre-proposition.'),
    [b('State your position', 'Énoncer sa position'), b('Make an offer with the conditional', 'Faire une offre au conditionnel'), b('Counter an offer', 'Faire une contre-proposition')],
    13,
    [
      card(b('Positions and offers', 'Positions et offres'), b('**Notre objectif est de… · Ce qui compte pour nous, c’est… · Nous serions prêts à proposer… · Nous pourrions envisager un prix de… · Votre offre est intéressante, mais elle reste au-dessus de notre budget. · Nous vous proposerions plutôt…**', '**Notre objectif est de… · Ce qui compte pour nous, c’est… · Nous serions prêts à proposer… · Nous pourrions envisager un prix de… · Votre offre est intéressante, mais elle reste au-dessus de notre budget. · Nous vous proposerions plutôt…**')),
      culture(b('Negotiation styles', 'Styles de négociation'), b('In **France**, negotiation often includes **debate and argument**; disagreement is not personal. In **Québec**, the tone is usually **more direct and friendly**, with a focus on the relationship and a win-win solution. Everywhere, **confirm in writing** after the meeting.', 'En **France**, la négociation comporte souvent du **débat et de l’argumentation** ; le désaccord n’est pas personnel. Au **Québec**, le ton est généralement **plus direct et cordial**, axé sur la relation et une solution gagnant-gagnant. Partout, **confirmez par écrit** après la rencontre.'), { variant: 'culture' }),
      mc(P.best, ['Votre offre est intéressante, mais elle reste au-dessus de notre budget. Nous pourrions envisager 42 € l’unité.', 'C’est du vol !', 'D’accord, 50 €.', 'Non. Au revoir.'], { fr: '— Nous vous proposons 50 € l’unité.' }),
      sort(b('Position, offer or counter-offer?', 'Position, offre ou contre-proposition ?'), [b('position', 'position'), b('offer', 'offre'), b('counter-offer', 'contre-proposition')], [['Ce qui compte pour nous, c’est la qualité.', 0], ['Nous serions prêts à proposer un contrat de deux ans.', 1], ['Nous vous proposerions plutôt dix-huit mois.', 2], ['Notre priorité, ce sont les délais.', 0], ['Nous pourrions envisager une remise de 5 %.', 1], ['Pour nous, 8 % serait plus réaliste.', 2]]),
      gap(P.complete, 'Nous ___ prêts à signer un contrat d’un an, et nous ___ envisager une option de renouvellement.', ['serions', 'pourrions']),
      say('Votre offre est intéressante, mais elle reste au-dessus de notre budget. Nous vous proposerions plutôt quarante-deux euros.', 'Your offer is interesting, but it is still above our budget. We would rather propose forty-two euros.'),
    ],
    [
      b('Position: Ce qui compte pour nous, c’est…', 'Position : Ce qui compte pour nous, c’est…'),
      b('Offer with the conditional: Nous serions prêts à… Nous pourrions envisager…', 'Offre au conditionnel : Nous serions prêts à… Nous pourrions envisager…'),
      b('Counter: …mais… Nous vous proposerions plutôt…', 'Contre-proposition : …mais… Nous vous proposerions plutôt…'),
    ],
    [['une remise', b('a discount', 'réduction de prix')], ['l’unité', b('per unit', 'pour un article')], ['le renouvellement', b('renewal', 'prolongation')]],
  ),
  lesson(C, 2, ['conditional-concessions', 'les-concessions-sous-condition'],
    b('Conditional concessions', 'Les concessions sous condition'),
    b('Never give without getting: link every concession to a condition.', 'Ne jamais donner sans recevoir : lier chaque concession à une condition.'),
    [b('Use si + présent / imparfait', 'Employer si + présent / imparfait'), b('Use à condition que + subjunctive', 'Employer à condition que + subjonctif'), b('Trade variables: price, volume, delay', 'Échanger les variables : prix, volume, délai')],
    13,
    [
      card(b('If you…, we could…', 'Si vous…, nous pourrions…'), b('**Si vous augmentez le volume, nous pouvons baisser le prix.** · **Si vous acceptiez un paiement à 30 jours, nous pourrions livrer plus tôt.** · **Nous acceptons cette remise, à condition que vous signiez pour deux ans.** · **En échange, nous aimerions…** Variables: **le prix, le volume, le délai de livraison, les conditions de paiement, la durée du contrat, le service après-vente**.', '**Si vous augmentez le volume, nous pouvons baisser le prix.** · **Si vous acceptiez un paiement à 30 jours, nous pourrions livrer plus tôt.** · **Nous acceptons cette remise, à condition que vous signiez pour deux ans.** · **En échange, nous aimerions…** Variables : **le prix, le volume, le délai de livraison, les conditions de paiement, la durée du contrat, le service après-vente**.')),
      mc(P.form, ['Si vous commandiez 500 pièces, nous pourrions vous accorder 8 %.', 'Si vous commanderiez 500 pièces, nous pourrions vous accorder 8 %.', 'Si vous commandez 500 pièces, nous pourrions vous accorderons 8 %.', 'Si vous auriez commandé 500 pièces, nous pouvons 8 %.']),
      mc(P.form, ['Nous acceptons, à condition que la livraison soit faite avant mars.', 'Nous acceptons, à condition que la livraison est faite avant mars.', 'Nous acceptons, à condition que la livraison sera faite avant mars.', 'Nous acceptons, à condition de la livraison soit faite avant mars.']),
      dlg(b('Trading concessions', 'Échanger des concessions'), undefined, [['Acheteuse', 'f'], ['Vous (fournisseur)', 'm']], [
        [0, 'Il nous faudrait une remise de 10 %.', 'We would need a 10% discount.'],
        [1, { options: ['Une remise de 10 %, c’est envisageable si vous passiez à une commande annuelle plutôt que trimestrielle.', 'D’accord, 10 %, sans condition.', 'Impossible, au revoir.'] }],
        [0, 'Une commande annuelle… à condition de pouvoir être livrés en quatre fois.', 'An annual order… provided we can be delivered in four instalments.'],
        [1, { options: ['Cela nous convient. En échange, nous aimerions un paiement à trente jours.', 'Non, tout en une fois.', 'On verra.'] }],
      ]),
      ord(P.order, 'En échange, nous aimerions un engagement sur deux ans.', { tr: 'In return, we would like a two-year commitment.' }),
      say('Si vous signiez pour deux ans, nous pourrions vous accorder une remise de huit pour cent.', 'If you signed for two years, we could grant you an eight per cent discount.'),
    ],
    [
      b('Si + présent → présent/futur; si + imparfait → conditionnel.', 'Si + présent → présent/futur ; si + imparfait → conditionnel.'),
      b('à condition que + subjonctif; à condition de + infinitif.', 'à condition que + subjonctif ; à condition de + infinitif.'),
      b('Every concession gets something in return: En échange…', 'Chaque concession obtient une contrepartie : En échange…'),
    ],
    [['accorder', b('to grant', 'donner')], ['une contrepartie', b('something in return', 'ce qu’on reçoit en échange')], ['le service après-vente', b('after-sales service', 'aide après l’achat')]],
  ),
  lesson(C, 3, ['refusing-and-closing', 'refuser-et-conclure'],
    b('Refusing and closing the deal', 'Refuser et conclure l’accord'),
    b('Say no without breaking the relationship, then summarise and confirm the agreement.', 'Dire non sans rompre la relation, puis récapituler et confirmer l’accord.'),
    [b('Refuse firmly and politely', 'Refuser fermement et poliment'), b('Propose an alternative', 'Proposer une alternative'), b('Summarise and confirm in writing', 'Récapituler et confirmer par écrit')],
    13,
    [
      card(b('Refusing and closing', 'Refuser et conclure'), b('Refuse: **Je comprends votre position, mais nous ne pouvons pas descendre en dessous de… · Ce serait difficile pour nous, en revanche nous pourrions… · C’est notre dernière offre.** Close: **Si je récapitule, nous sommes d’accord sur… · Je vous envoie une confirmation écrite d’ici demain. · Je suis ravi(e) que nous soyons parvenus à un accord.**', 'Refuser : **Je comprends votre position, mais nous ne pouvons pas descendre en dessous de… · Ce serait difficile pour nous, en revanche nous pourrions… · C’est notre dernière offre.** Conclure : **Si je récapitule, nous sommes d’accord sur… · Je vous envoie une confirmation écrite d’ici demain. · Je suis ravi(e) que nous soyons parvenus à un accord.**')),
      mc(P.best, ['Je comprends votre position, mais nous ne pouvons pas descendre en dessous de 40 €. En revanche, nous pourrions offrir la livraison.', 'Vous rêvez !', 'Non, c’est ridicule.', 'D’accord, 35 €, comme vous voulez.'], { fr: '— Nous ne paierons pas plus de 35 € l’unité.' }),
      hear('Si je récapitule, nous sommes d’accord sur un prix de quarante-deux euros l’unité, une commande annuelle livrée en quatre fois, et un paiement à trente jours. Je vous envoie la confirmation écrite d’ici demain midi.', b('What was agreed about delivery?', 'Qu’a-t-on décidé pour la livraison ?'), [b('four deliveries over the year', 'quatre livraisons dans l’année'), b('one single delivery', 'une seule livraison'), b('delivery in 30 days', 'livraison sous 30 jours'), b('free express delivery', 'livraison express gratuite')], { voice: 'm' }),
      sort(b('Refusing or closing?', 'Refuser ou conclure ?'), [b('refusing', 'refuser'), b('closing', 'conclure')], [['C’est notre dernière offre.', 0], ['Si je récapitule, …', 1], ['Ce serait difficile pour nous.', 0], ['Je vous envoie une confirmation écrite.', 1], ['Nous ne pouvons pas aller plus loin.', 0], ['Ravi que nous soyons parvenus à un accord.', 1]]),
      pairs(P.match, [['en revanche', b('on the other hand', 'par contre')], ['parvenir à un accord', b('to reach an agreement', 'se mettre d’accord')], ['descendre en dessous de', b('to go below', 'baisser sous')], ['récapituler', b('to sum up', 'résumer')]]),
      write(b('Confirmation email', 'Courriel de confirmation'), b('Write the confirmation email after the negotiation (50–80 words): thank, list the three agreed points, next step.', 'Rédigez le courriel de confirmation après la négociation (50–80 mots) : remerciement, les trois points convenus, prochaine étape.'), 50, 80, [
        b('Thanks', 'Remerciement'),
        b('Three agreed points', 'Trois points convenus'),
        b('Next step', 'Prochaine étape'),
      ], 'Bonjour Madame Bélanger,\n\nMerci pour notre rencontre de ce matin. Comme convenu, voici les points de notre accord : un prix de 42 € l’unité, une commande annuelle livrée en quatre fois, et un paiement à 30 jours. Je vous fais parvenir le contrat d’ici vendredi pour signature.\n\nBien cordialement,\nJulien Morel'),
    ],
    [
      b('Refuse: Je comprends…, mais… En revanche, nous pourrions…', 'Refuser : Je comprends…, mais… En revanche, nous pourrions…'),
      b('Close: Si je récapitule, nous sommes d’accord sur…', 'Conclure : Si je récapitule, nous sommes d’accord sur…'),
      b('Always confirm in writing.', 'Confirmez toujours par écrit.'),
    ],
    [['comme convenu', b('as agreed', 'selon l’accord')], ['faire parvenir', b('to send', 'envoyer')], ['la signature', b('the signature', 'action de signer')]],
  ),
];
