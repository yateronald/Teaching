import type { CourseAbout } from '../../types';
import { b, card, dlg, doc, gap, hear, lesson, mc, P, pairs, say, sort } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Working in a shop in a French-speaking country means helping customers find products, describing sizes, colours and prices, checking the stock, handling the till and payments, and managing returns. This course gives you the language of the shop floor, from « Je peux vous aider ? » to « Vous voulez un sac ? », with the polite formulas customers expect.',
    'Travailler dans un magasin en pays francophone, c’est aider les clients à trouver un produit, décrire tailles, couleurs et prix, vérifier le stock, tenir la caisse et les paiements, et gérer les retours. Ce cours vous donne la langue de la surface de vente, de « Je peux vous aider ? » à « Vous voulez un sac ? », avec les formules de politesse attendues par les clients.',
  ),
  outcomes: [
    b('Greet and help customers', 'Accueillir et aider les clients'),
    b('Describe products, sizes and prices', 'Décrire produits, tailles et prix'),
    b('Handle the till and payments', 'Tenir la caisse et les paiements'),
    b('Manage exchanges and returns', 'Gérer les échanges et les retours'),
  ],
};

const C = 'bz-retail';
export default [
  lesson(C, 1, ['helping-customers', 'aider-les-clients'],
    b('Helping customers', 'Aider les clients'),
    b('Approach a customer, find out what they want and guide them.', 'Aborder un client, comprendre ce qu’il veut et l’orienter.'),
    [b('Offer help politely', 'Proposer son aide poliment'), b('Ask about needs', 'Interroger sur les besoins'), b('Give directions in the shop', 'Orienter dans le magasin')],
    13,
    [
      card(b('On the shop floor', 'En surface de vente'), b('**Bonjour, je peux vous aider ? · Vous cherchez quelque chose en particulier ? · C’est pour offrir ? · Quelle taille faites-vous ? · Les pantalons sont au fond, à droite. · Je vais vérifier en réserve.** If the customer is just looking: **Je vous laisse regarder, n’hésitez pas si vous avez besoin.**', '**Bonjour, je peux vous aider ? · Vous cherchez quelque chose en particulier ? · C’est pour offrir ? · Quelle taille faites-vous ? · Les pantalons sont au fond, à droite. · Je vais vérifier en réserve.** Si le client regarde seulement : **Je vous laisse regarder, n’hésitez pas si vous avez besoin.**')),
      mc(P.best, ['Très bien, je vous laisse regarder. N’hésitez pas si vous avez besoin.', 'Alors pourquoi vous êtes là ?', 'Il faut acheter quelque chose.', 'D’accord. Au revoir.'], { fr: '— Non merci, je regarde seulement.' }),
      dlg(b('A customer looking for a jacket', 'Une cliente cherche une veste'), undefined, [['Vous', 'm'], ['Cliente', 'f']], [
        [0, { options: ['Bonjour, je peux vous aider ?', 'Vous voulez quoi ?', 'Oui ?'] }],
        [1, 'Oui, je cherche une veste imperméable, en taille 38.', 'Yes, I’m looking for a waterproof jacket, size 38.'],
        [0, { options: ['Elles sont juste ici. On a ce modèle en bleu et en vert. Je vais vérifier s’il reste du 38 en réserve.', 'Pas de 38. Au revoir.', 'Cherchez vous-même.'] }],
        [1, 'Merci, c’est gentil !', 'Thanks, that’s kind!'],
      ]),
      sort(b('Question to the customer or direction?', 'Question au client ou indication ?'), [b('question', 'question'), b('direction', 'indication')], [['Quelle taille faites-vous ?', 0], ['C’est au fond, à droite.', 1], ['C’est pour offrir ?', 0], ['Les cabines sont près des caisses.', 1], ['Vous cherchez une couleur précise ?', 0], ['C’est au rayon chaussures.', 1]]),
      pairs(P.match, [['la réserve', b('the stockroom', 'stock du magasin')], ['une cabine d’essayage', b('a fitting room', 'pour essayer')], ['un rayon', b('a department, an aisle', 'section du magasin')], ['C’est pour offrir ?', b('Is it a gift?', 'cadeau ?')]]),
      say('Bonjour, je peux vous aider ? Vous cherchez quelque chose en particulier ?', 'Hello, can I help you? Are you looking for anything in particular?'),
    ],
    [
      b('Je peux vous aider ? Vous cherchez quelque chose en particulier ?', 'Je peux vous aider ? Vous cherchez quelque chose en particulier ?'),
      b('If they are browsing: Je vous laisse regarder.', 'S’il regarde : Je vous laisse regarder.'),
      b('Directions: au fond, à droite, au rayon…, près des caisses.', 'Indications : au fond, à droite, au rayon…, près des caisses.'),
    ],
    [['imperméable', b('waterproof', 'qui ne laisse pas passer l’eau')], ['essayer', b('to try on', 'mettre pour voir')], ['un modèle', b('a model, a style', 'version d’un produit')]],
  ),
  lesson(C, 2, ['the-till-and-payment', 'la-caisse-et-le-paiement'],
    b('The till and payment', 'La caisse et le paiement'),
    b('Announce the total, handle cards and cash, offer a bag and a receipt.', 'Annoncer le total, gérer carte et espèces, proposer un sac et un ticket.'),
    [b('Announce prices clearly', 'Annoncer clairement les prix'), b('Handle payment methods', 'Gérer les moyens de paiement'), b('Close the sale politely', 'Conclure la vente poliment')],
    13,
    [
      card(b('At the till', 'À la caisse'), b('**Ça vous fait 34,90 €. · Vous payez par carte ou en espèces ? · Vous pouvez insérer / approcher votre carte. · Vous avez la carte de fidélité ? · Vous voulez un sac ? Il est à 10 centimes. · Je vous mets le ticket dans le sac ? · Merci, bonne journée !**', '**Ça vous fait 34,90 €. · Vous payez par carte ou en espèces ? · Vous pouvez insérer / approcher votre carte. · Vous avez la carte de fidélité ? · Vous voulez un sac ? Il est à 10 centimes. · Je vous mets le ticket dans le sac ? · Merci, bonne journée !**')),
      hear('Alors, ça vous fait quarante-deux euros cinquante. Vous avez la carte de fidélité ? Avec, vous avez cinq pour cent de réduction.', b('What does the cashier offer?', 'Que propose la caissière ?'), [b('5% off with the loyalty card', '5 % de réduction avec la carte de fidélité'), b('a free bag', 'un sac gratuit'), b('to pay later', 'de payer plus tard'), b('a 50% discount', 'une réduction de 50 %')], { voice: 'f' }),
      mc(P.best, ['Ça vous fait 18,40 €. Vous payez par carte ou en espèces ?', 'Donnez-moi 18,40 €.', 'C’est 18,40, vite.', 'Payez.'], { fr: 'Vous annoncez le total :' }),
      gap(P.complete, 'Vous voulez un ___ ? Je vous mets le ___ de caisse dedans ?', ['sac', 'ticket'], { strict: false }),
      sort(b('Cashier or customer?', 'Caissier ou client ?'), [b('cashier', 'caissier'), b('customer', 'client')], [['Vous avez la carte de fidélité ?', 0], ['Je peux payer sans contact ?', 1], ['Approchez votre carte.', 0], ['Vous acceptez les chèques ?', 1], ['Je vous rends la monnaie.', 0], ['Je n’ai pas de monnaie, désolé.', 1]]),
      say('Ça vous fait trente-quatre euros quatre-vingt-dix. Vous voulez un sac ? Merci, bonne journée !', 'That comes to thirty-four euros ninety. Would you like a bag? Thank you, have a nice day!'),
    ],
    [
      b('Ça vous fait… · Par carte ou en espèces ?', 'Ça vous fait… · Par carte ou en espèces ?'),
      b('Carte de fidélité, sac, ticket de caisse.', 'Carte de fidélité, sac, ticket de caisse.'),
      b('Close: Merci, bonne journée !', 'Conclure : Merci, bonne journée !'),
    ],
    [['en espèces', b('in cash', 'avec des billets et pièces')], ['la monnaie', b('change (coins)', 'petites pièces rendues')], ['sans contact', b('contactless', 'paiement en approchant la carte')]],
  ),
  lesson(C, 3, ['exchanges-and-returns', 'echanges-et-retours'],
    b('Exchanges and returns', 'Échanges et retours'),
    b('Explain the return policy, offer an exchange or a credit note, stay pleasant.', 'Expliquer la politique de retour, proposer un échange ou un avoir, rester aimable.'),
    [b('Ask for the receipt and the reason', 'Demander le ticket et la raison'), b('Explain the return policy', 'Expliquer la politique de retour'), b('Offer an exchange, refund or credit note', 'Proposer échange, remboursement ou avoir')],
    13,
    [
      card(b('Returns', 'Les retours'), b('**Vous avez le ticket de caisse ? · Qu’est-ce qui ne va pas avec l’article ? · Vous pouvez l’échanger sous 30 jours. · Je peux vous proposer un échange, un remboursement ou un avoir. · Les articles soldés ne sont ni repris ni échangés. · Je suis désolé(e), je ne peux pas le reprendre sans ticket.**', '**Vous avez le ticket de caisse ? · Qu’est-ce qui ne va pas avec l’article ? · Vous pouvez l’échanger sous 30 jours. · Je peux vous proposer un échange, un remboursement ou un avoir. · Les articles soldés ne sont ni repris ni échangés. · Je suis désolé(e), je ne peux pas le reprendre sans ticket.**')),
      doc({ look: 'notice', title: b('Return policy', 'Politique de retour'), text: 'ÉCHANGES ET REMBOURSEMENTS\nLes articles peuvent être échangés ou remboursés sous 30 jours, sur présentation du ticket de caisse.\nLes articles doivent être en parfait état, avec leur étiquette.\nLes articles soldés ne sont ni repris ni échangés.\nSans ticket : un avoir valable 6 mois peut être proposé.' }, b('A customer has no receipt. What can you offer?', 'Un client n’a pas de ticket. Que pouvez-vous proposer ?'), [b('a credit note valid for 6 months', 'un avoir valable 6 mois'), b('a full refund in cash', 'un remboursement en espèces'), b('nothing at all', 'rien du tout'), b('an exchange for a sale item', 'un échange contre un article soldé')]),
      dlg(b('A return', 'Un retour'), undefined, [['Client', 'm'], ['Vous', 'f']], [
        [0, 'Bonjour, j’ai acheté ce pull la semaine dernière, mais il est trop petit.', 'Hello, I bought this sweater last week, but it’s too small.'],
        [1, { options: ['Pas de problème. Vous avez le ticket de caisse ? Je peux vous l’échanger contre une taille au-dessus.', 'C’est votre faute, il fallait l’essayer.', 'On ne reprend rien.'] }],
        [0, 'Oui, le voici. Mais je préférerais être remboursé.', 'Yes, here it is. But I’d rather have a refund.'],
        [1, { options: ['Bien sûr, je vous rembourse sur votre carte. Ce sera visible sous trois à cinq jours.', 'Non, un échange ou rien.', 'Remboursé ? Jamais.'] }],
      ]),
      pairs(P.match, [['un avoir', b('a credit note', 'bon d’achat du magasin')], ['soldé', b('on sale', 'à prix réduit')], ['reprendre', b('to take back', 'accepter un retour')], ['sous 30 jours', b('within 30 days', 'avant 30 jours')]]),
      say('Je suis désolée, sans ticket je ne peux pas vous rembourser, mais je peux vous proposer un avoir.', 'I’m sorry, without a receipt I can’t refund you, but I can offer you a credit note.'),
    ],
    [
      b('Ask: Vous avez le ticket ? Qu’est-ce qui ne va pas ?', 'Demander : Vous avez le ticket ? Qu’est-ce qui ne va pas ?'),
      b('Offer: échange, remboursement ou avoir.', 'Proposer : échange, remboursement ou avoir.'),
      b('Refuse politely: Je suis désolé(e), je ne peux pas…, mais je peux…', 'Refuser poliment : Je suis désolé(e), je ne peux pas…, mais je peux…'),
    ],
    [['un article', b('an item', 'produit vendu')], ['une étiquette', b('a tag, a label', 'petit papier avec le prix')], ['être en parfait état', b('to be in perfect condition', 'sans défaut')]],
  ),
];
