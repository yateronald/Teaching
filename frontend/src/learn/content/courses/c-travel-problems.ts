import type { CourseAbout } from '../../types';
import { b, card, dlg, gap, hear, lesson, mc, ord, P, pairs, say } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'A missed connection, a suitcase that never came out on the belt, a hotel booking that does not exist: travel problems happen, and they always happen in French at the worst time. This course prepares you to explain the situation at a counter or on the phone, to understand the options you are offered, and to get a practical solution: rebooking, compensation, a lost-luggage report.',
    'Une correspondance ratée, une valise jamais sortie sur le tapis, une réservation d’hôtel introuvable : les imprévus de voyage arrivent, et toujours au pire moment. Ce cours vous prépare à expliquer la situation à un guichet ou au téléphone, à comprendre les options proposées et à obtenir une solution concrète : nouveau billet, indemnisation, déclaration de bagage perdu.',
  ),
  outcomes: [
    b('Explain a travel problem clearly', 'Expliquer clairement un imprévu de voyage'),
    b('Understand the options offered', 'Comprendre les options proposées'),
    b('Report lost luggage', 'Déclarer un bagage perdu'),
    b('Sort out a booking problem', 'Régler un problème de réservation'),
  ],
};

const C = 'c-travel-problems';
export default [
  lesson(C, 1, ['missed-train-or-flight', 'train-ou-vol-rate'],
    b('A missed train or flight', 'Un train ou un vol raté'),
    b('Explain what happened and ask for the next solution.', 'Expliquer ce qui s’est passé et demander la solution suivante.'),
    [b('Explain a missed connection', 'Expliquer une correspondance ratée'), b('Ask for the next departure', 'Demander le prochain départ'), b('Understand the options', 'Comprendre les options')],
    13,
    [
      card(b('At the counter', 'Au guichet'), b('**J’ai raté ma correspondance, mon premier train avait quarante minutes de retard.** · **Est-ce que je peux prendre le prochain train avec ce billet ?** · **Il y a des frais ?** · **Mon vol a été annulé. Quelles sont mes options ?**', '**J’ai raté ma correspondance, mon premier train avait quarante minutes de retard.** · **Est-ce que je peux prendre le prochain train avec ce billet ?** · **Il y a des frais ?** · **Mon vol a été annulé. Quelles sont mes options ?**'), {
        ex: [['J’ai raté ma correspondance à cause du retard.', 'I missed my connection because of the delay.'], ['Quel est le prochain vol pour Lyon ?', 'What is the next flight to Lyon?']],
      }),
      hear('Votre billet reste valable. Le prochain train pour Bordeaux part à quinze heures douze, voie sept. Vous n’avez rien à payer, mais la place n’est pas garantie.', b('What does the agent say?', 'Que dit l’agent ?'), [b('The ticket is still valid; no seat is guaranteed.', 'Le billet reste valable ; la place n’est pas garantie.'), b('You must buy a new ticket.', 'Il faut acheter un nouveau billet.'), b('There is no train today.', 'Il n’y a plus de train aujourd’hui.'), b('The next train leaves from platform 15.', 'Le prochain train part de la voie 15.')], { voice: 'f' }),
      mc(P.best, ['Mon vol a été annulé. Quelles sont mes options, s’il vous plaît ?', 'Avion cassé, je fais quoi ?', 'C’est un scandale, je veux un avion maintenant !', 'Annulé. Bon.'], { fr: 'Au comptoir de la compagnie aérienne :' }),
      ord(P.order, 'Est-ce que je peux prendre le prochain train avec ce billet ?', { tr: 'Can I take the next train with this ticket?' }),
      gap(P.complete, 'J’ai ___ ma correspondance parce que mon premier train avait du ___ .', ['raté', 'retard']),
      pairs(P.match, [['une correspondance', b('a connection', 'changement de train ou d’avion')], ['annulé', b('cancelled', 'supprimé')], ['valable', b('valid', 'encore utilisable')], ['les frais', b('fees, charges', 'ce qu’il faut payer en plus')]]),
      say('Bonjour, j’ai raté ma correspondance à cause du retard. Quel est le prochain train pour Bordeaux ?', 'Hello, I missed my connection because of the delay. What is the next train to Bordeaux?'),
    ],
    [
      b('J’ai raté ma correspondance. Mon vol a été annulé.', 'J’ai raté ma correspondance. Mon vol a été annulé.'),
      b('Quel est le prochain… ? Quelles sont mes options ?', 'Quel est le prochain… ? Quelles sont mes options ?'),
      b('Check: valable, frais, place garantie.', 'Vérifiez : valable, frais, place garantie.'),
    ],
    [['la voie', b('the platform, track', 'quai du train')], ['un retard', b('a delay', 'arrivée tardive')], ['garanti', b('guaranteed', 'assuré')]],
  ),
  lesson(C, 2, ['lost-luggage', 'bagage-perdu'],
    b('Lost luggage', 'Un bagage perdu'),
    b('Report a missing suitcase and describe it precisely.', 'Déclarer une valise manquante et la décrire précisément.'),
    [b('Report a missing bag', 'Signaler un bagage manquant'), b('Describe a suitcase', 'Décrire une valise'), b('Ask about delivery and compensation', 'Demander la livraison et l’indemnisation')],
    13,
    [
      card(b('Reporting lost luggage', 'Déclarer un bagage perdu'), b('**Ma valise n’est pas arrivée.** · **Je voudrais faire une déclaration de perte.** Describe: **C’est une grande valise rigide, bleu marine, à roulettes, avec une étiquette à mon nom.** Ask: **Vous pourrez la livrer à mon hôtel ?** · **Je peux être indemnisé(e) pour les achats de première nécessité ?**', '**Ma valise n’est pas arrivée.** · **Je voudrais faire une déclaration de perte.** Décrire : **C’est une grande valise rigide, bleu marine, à roulettes, avec une étiquette à mon nom.** Demander : **Vous pourrez la livrer à mon hôtel ?** · **Je peux être indemnisé(e) pour les achats de première nécessité ?**')),
      mc(P.best, ['C’est une petite valise rouge, souple, avec un ruban vert sur la poignée.', 'Elle est belle, ma valise.', 'Une valise normale.', 'Je ne me souviens pas, une valise.'], { fr: '— Vous pouvez décrire votre bagage ?' }),
      dlg(b('At the baggage desk', 'Au comptoir des bagages'), undefined, [['Agente', 'f'], ['Vous', 'm']], [
        [0, 'Bonjour, je vous écoute.', 'Hello, how can I help?'],
        [1, { options: ['Bonjour, ma valise n’est pas arrivée sur le tapis. Je viens de Montréal, vol 342.', 'Où est ma valise ?! Vous l’avez perdue !', 'Valise. Pas là.'] }],
        [0, 'Je suis désolée. Vous avez votre talon d’enregistrement ?', 'I’m sorry. Do you have your baggage tag stub?'],
        [1, { options: ['Oui, le voici. C’est une grande valise noire à roulettes.', 'Non, c’est quoi ?', 'Pourquoi faire ?'] }],
        [0, 'Merci. En général, on la retrouve sous quarante-huit heures. On vous la livrera à votre adresse.', 'Thank you. Usually we find it within 48 hours. We’ll deliver it to your address.'],
        [1, { options: ['Parfait. Et si j’ai besoin d’acheter des vêtements en attendant ?', 'Quarante-huit heures ? Jamais !', 'D’accord, gardez-la.'] }],
      ]),
      hear('Gardez bien tous vos tickets de caisse. Les achats de première nécessité, comme une brosse à dents ou des vêtements de rechange, vous seront remboursés jusqu’à cent euros.', b('What will be refunded?', 'Qu’est-ce qui sera remboursé ?'), [b('Essential purchases up to 100 euros, with receipts', 'Les achats essentiels jusqu’à 100 euros, avec reçus'), b('All purchases, with no limit', 'Tous les achats, sans limite'), b('Only the suitcase', 'Seulement la valise'), b('Nothing at all', 'Rien du tout')], { voice: 'f' }),
      pairs(P.match, [['le tapis à bagages', b('the baggage carousel', 'où sortent les valises')], ['à roulettes', b('with wheels', 'qui roule')], ['une étiquette', b('a tag, a label', 'petit papier avec le nom')], ['de première nécessité', b('essential', 'indispensable')]]),
      say('Ma valise n’est pas arrivée. C’est une grande valise noire, à roulettes, avec une étiquette à mon nom.', 'My suitcase hasn’t arrived. It’s a big black suitcase with wheels and a tag with my name.'),
    ],
    [
      b('Ma valise n’est pas arrivée. Je voudrais faire une déclaration.', 'Ma valise n’est pas arrivée. Je voudrais faire une déclaration.'),
      b('Describe: size, colour, material, wheels, tag.', 'Décrire : taille, couleur, matière, roulettes, étiquette.'),
      b('Keep receipts for essential purchases.', 'Gardez les reçus des achats essentiels.'),
    ],
    [['rigide / souple', b('hard / soft (case)', 'dur / mou')], ['la poignée', b('the handle', 'partie pour tenir')], ['en attendant', b('in the meantime', 'pendant ce temps')]],
  ),
  lesson(C, 3, ['booking-problems', 'probleme-de-reservation'],
    b('A booking problem', 'Un problème de réservation'),
    b('At the hotel or the car-rental desk: prove your booking and find an alternative.', 'À l’hôtel ou à l’agence de location : prouver sa réservation et trouver une alternative.'),
    [b('Show and explain your booking', 'Montrer et expliquer sa réservation'), b('Refuse an unsuitable option politely', 'Refuser poliment une option inadaptée'), b('Ask for an equivalent or better solution', 'Demander une solution équivalente ou meilleure')],
    13,
    [
      card(b('Proving your booking', 'Prouver sa réservation'), b('**J’ai réservé une chambre double pour trois nuits, voici la confirmation.** · **J’ai payé d’avance.** If there is no room: **Qu’est-ce que vous pouvez me proposer ?** · **Est-ce que vous pourriez me trouver un hôtel équivalent, à vos frais ?**', '**J’ai réservé une chambre double pour trois nuits, voici la confirmation.** · **J’ai payé d’avance.** S’il n’y a pas de chambre : **Qu’est-ce que vous pouvez me proposer ?** · **Est-ce que vous pourriez me trouver un hôtel équivalent, à vos frais ?**')),
      mc(P.best, ['Je comprends, mais j’ai payé d’avance. Qu’est-ce que vous pouvez me proposer ?', 'Ce n’est pas mon problème, donnez-moi une chambre.', 'Ah bon, tant pis, je dors dehors.', 'Votre hôtel est une arnaque !'], { fr: '— Désolé, l’hôtel est complet ce soir.' }),
      mc(P.best, ['Merci, mais j’avais réservé une voiture automatique. Vous en auriez une autre ?', 'Je ne sais pas conduire.', 'D’accord, n’importe quoi.', 'Je prends le bus alors.'], { fr: 'L’agence de location vous propose une voiture manuelle :' }),
      dlg(b('At the hotel reception', 'À la réception de l’hôtel'), undefined, [['Réceptionniste', 'm'], ['Vous', 'f']], [
        [0, 'Je ne trouve pas votre réservation dans le système, madame.', 'I can’t find your booking in the system, madam.'],
        [1, { options: ['Voici l’e-mail de confirmation, avec le numéro de réservation.', 'C’est votre faute !', 'Ah, alors au revoir.'] }],
        [0, 'En effet… Il y a eu une erreur. Il ne nous reste qu’une chambre simple.', 'Indeed… there was an error. We only have a single room left.'],
        [1, { options: ['J’avais réservé une chambre double. Vous pourriez me trouver un hôtel équivalent à proximité ?', 'Une chambre simple ? Vous plaisantez !', 'D’accord, je prends le placard.'] }],
        [0, 'Bien sûr. Notre hôtel partenaire à deux rues a de la place, et nous prenons le taxi en charge.', 'Of course. Our partner hotel two streets away has room, and we’ll pay for the taxi.'],
      ]),
      pairs(P.match, [['complet', b('full, fully booked', 'plus de place')], ['payer d’avance', b('to pay in advance', 'payer avant')], ['à vos frais', b('at your expense', 'c’est vous qui payez')], ['prendre en charge', b('to cover (costs)', 'payer pour')]]),
      say('J’ai réservé une chambre double pour trois nuits. Voici la confirmation. Qu’est-ce que vous pouvez me proposer ?', 'I booked a double room for three nights. Here is the confirmation. What can you offer me?'),
    ],
    [
      b('Show proof: Voici la confirmation, le numéro de réservation.', 'Montrez la preuve : Voici la confirmation, le numéro de réservation.'),
      b('Ask: Qu’est-ce que vous pouvez me proposer ?', 'Demandez : Qu’est-ce que vous pouvez me proposer ?'),
      b('Equivalent solution, at their expense: à vos frais, pris en charge.', 'Solution équivalente, à leurs frais : à vos frais, pris en charge.'),
    ],
    [['une agence de location', b('a rental agency', 'loue des voitures')], ['à proximité', b('nearby', 'pas loin')], ['une arnaque', b('a scam', 'tromperie')]],
  ),
];
