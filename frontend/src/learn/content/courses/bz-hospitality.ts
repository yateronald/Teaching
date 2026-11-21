import type { CourseAbout } from '../../types';
import { b, card, dlg, doc, hear, lesson, mc, P, pairs, say, sort } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Hotels, restaurants and cafés are among the first employers of newcomers in French-speaking countries. This course trains the key moments of the job: welcoming guests at reception, checking in and out, taking a restaurant order and recommending dishes, explaining allergens, handling special requests and complaints, always with the professional politeness of French hospitality (vous, conditional, « je vous en prie »).',
    'Hôtels, restaurants et cafés comptent parmi les premiers employeurs des nouveaux arrivants dans les pays francophones. Ce cours entraîne les moments clés du métier : accueillir les clients à la réception, gérer arrivées et départs, prendre une commande et recommander des plats, expliquer les allergènes, traiter les demandes spéciales et les réclamations, toujours avec la politesse professionnelle de l’hôtellerie (vous, conditionnel, « je vous en prie »).',
  ),
  outcomes: [
    b('Welcome guests at reception', 'Accueillir les clients à la réception'),
    b('Take an order and recommend dishes', 'Prendre une commande et conseiller des plats'),
    b('Explain allergens and options', 'Expliquer allergènes et options'),
    b('Handle special requests and complaints', 'Gérer demandes spéciales et réclamations'),
  ],
};

const C = 'bz-hospitality';
export default [
  lesson(C, 1, ['hotel-reception', 'la-reception-de-l-hotel'],
    b('At hotel reception', 'À la réception de l’hôtel'),
    b('Check guests in and out and give practical information.', 'Gérer l’arrivée et le départ des clients et donner les informations pratiques.'),
    [b('Welcome and check in', 'Accueillir et enregistrer'), b('Give practical information', 'Donner les informations pratiques'), b('Check out', 'Gérer le départ')],
    13,
    [
      card(b('Reception phrases', 'Les formules de réception'), b('**Bonjour madame, bienvenue à l’hôtel. Vous avez une réservation ? · À quel nom, s’il vous plaît ? · Puis-je avoir une pièce d’identité ? · Voici votre clé, chambre 214, au deuxième étage. · Le petit-déjeuner est servi de 7 h à 10 h. · Le wifi est gratuit, le code est sur la carte.** Check-out: **La chambre doit être libérée avant 11 h. · Avez-vous pris quelque chose dans le minibar ?**', '**Bonjour madame, bienvenue à l’hôtel. Vous avez une réservation ? · À quel nom, s’il vous plaît ? · Puis-je avoir une pièce d’identité ? · Voici votre clé, chambre 214, au deuxième étage. · Le petit-déjeuner est servi de 7 h à 10 h. · Le wifi est gratuit, le code est sur la carte.** Départ : **La chambre doit être libérée avant 11 h. · Avez-vous pris quelque chose dans le minibar ?**')),
      dlg(b('Check-in', 'Arrivée d’un client'), undefined, [['Vous', 'f'], ['Client', 'm']], [
        [0, { options: ['Bonsoir monsieur, bienvenue. Vous avez une réservation ?', 'Oui ? C’est pour quoi ?', 'Nom ?'] }],
        [1, 'Oui, au nom de Tremblay, pour deux nuits.', 'Yes, under the name Tremblay, for two nights.'],
        [0, { options: ['Parfait, monsieur Tremblay. Puis-je avoir une pièce d’identité, s’il vous plaît ?', 'Donnez votre passeport.', 'Deux nuits, c’est court.'] }],
        [1, 'Voilà. Le petit-déjeuner est à quelle heure ?', 'Here you go. What time is breakfast?'],
        [0, { options: ['Il est servi de 7 h à 10 h, au rez-de-chaussée. Voici votre clé, chambre 214.', 'Le matin.', 'Je ne sais pas.'] }],
      ]),
      hear('Je vous rappelle que la chambre doit être libérée avant onze heures. Si vous le souhaitez, vous pouvez laisser vos bagages à la consigne jusqu’à dix-huit heures.', b('What can the guest do?', 'Que peut faire le client ?'), [b('leave luggage until 6 p.m.', 'laisser ses bagages jusqu’à 18 h'), b('keep the room until 6 p.m.', 'garder la chambre jusqu’à 18 h'), b('have breakfast until 11 a.m.', 'prendre le petit-déjeuner jusqu’à 11 h'), b('pay tomorrow', 'payer demain')], { voice: 'f' }),
      pairs(P.match, [['une pièce d’identité', b('an ID document', 'carte d’identité, passeport')], ['libérer la chambre', b('to check out of the room', 'quitter la chambre')], ['la consigne', b('the left-luggage room', 'où laisser ses bagages')], ['au nom de', b('under the name of', 'réservé pour')]]),
      say('Bienvenue à l’hôtel, madame. Voici votre clé, chambre 214. Le petit-déjeuner est servi de sept heures à dix heures.', 'Welcome to the hotel, madam. Here is your key, room 214. Breakfast is served from seven to ten.'),
    ],
    [
      b('À quel nom ? Puis-je avoir une pièce d’identité ?', 'À quel nom ? Puis-je avoir une pièce d’identité ?'),
      b('Give: chambre, étage, petit-déjeuner, wifi.', 'Indiquer : chambre, étage, petit-déjeuner, wifi.'),
      b('Check-out time, consigne, minibar.', 'Heure de départ, consigne, minibar.'),
    ],
    [['le petit-déjeuner', b('breakfast', 'repas du matin')], ['un étage', b('a floor', 'niveau')], ['les bagages', b('luggage', 'valises')]],
  ),
  lesson(C, 2, ['taking-an-order', 'prendre-une-commande'],
    b('Taking an order in a restaurant', 'Prendre une commande au restaurant'),
    b('Seat guests, present the menu, recommend dishes and take the order.', 'Installer les clients, présenter la carte, conseiller et prendre la commande.'),
    [b('Seat and welcome', 'Installer et accueillir'), b('Recommend a dish', 'Recommander un plat'), b('Take and confirm the order', 'Prendre et confirmer la commande')],
    13,
    [
      card(b('Service phrases', 'Les formules de service'), b('**Vous avez réservé ? Une table pour combien ? · Je vous laisse la carte. · Vous avez choisi ? · Je vous recommande le plat du jour : un filet de saumon, purée maison. · Quelle cuisson pour la viande ? Saignant, à point, bien cuit ? · Et comme boisson ? · Je récapitule : deux menus du jour, une carafe d’eau.**', '**Vous avez réservé ? Une table pour combien ? · Je vous laisse la carte. · Vous avez choisi ? · Je vous recommande le plat du jour : un filet de saumon, purée maison. · Quelle cuisson pour la viande ? Saignant, à point, bien cuit ? · Et comme boisson ? · Je récapitule : deux menus du jour, une carafe d’eau.**')),
      doc({ look: 'menu', title: b('Today’s menu', 'Menu du jour'), text: 'MENU DU JOUR — 19 €\nEntrée : velouté de potiron ou salade de chèvre chaud\nPlat : filet de saumon, purée maison ou bavette, frites\nDessert : tarte aux pommes ou mousse au chocolat\nCafé offert' }, b('A guest wants meat. What can you recommend?', 'Un client veut de la viande. Que pouvez-vous recommander ?'), [b('the bavette with fries', 'la bavette frites'), b('the salmon fillet', 'le filet de saumon'), b('the pumpkin soup', 'le velouté de potiron'), b('the chocolate mousse', 'la mousse au chocolat')]),
      mc(P.best, ['Quelle cuisson pour la bavette : saignante, à point ou bien cuite ?', 'Vous la voulez comment, la viande ?', 'Cuite ?', 'Je la fais comme je veux.'], { fr: 'Le client commande une bavette :' }),
      dlg(b('The order', 'La commande'), undefined, [['Vous', 'm'], ['Cliente', 'f']], [
        [0, { options: ['Vous avez choisi ?', 'Alors, ça vient ?', 'Quoi ?'] }],
        [1, 'Oui, le menu du jour, avec la salade de chèvre et le saumon.', 'Yes, today’s menu, with the goat-cheese salad and the salmon.'],
        [0, { options: ['Très bon choix. Et comme boisson ?', 'Le saumon, c’est pas terrible.', 'Ok.'] }],
        [1, 'Une carafe d’eau, s’il vous plaît.', 'A jug of water, please.'],
        [0, { options: ['Je récapitule : un menu du jour, salade de chèvre, saumon, et une carafe d’eau. C’est parfait ?', 'C’est noté. Bye.', 'Pas d’eau gratuite.'] }],
      ]),
      pairs(P.match, [['saignant', b('rare', 'très peu cuit')], ['à point', b('medium', 'cuit moyennement')], ['une carafe d’eau', b('a jug of tap water', 'eau gratuite')], ['le plat du jour', b('today’s special', 'plat proposé ce jour')]]),
      say('Je vous recommande le plat du jour : un filet de saumon avec une purée maison.', 'I recommend today’s special: a salmon fillet with home-made mash.'),
    ],
    [
      b('Une table pour combien ? Vous avez choisi ? Et comme boisson ?', 'Une table pour combien ? Vous avez choisi ? Et comme boisson ?'),
      b('Cuisson: saignant, à point, bien cuit.', 'Cuisson : saignant, à point, bien cuit.'),
      b('Always confirm: Je récapitule…', 'Confirmez toujours : Je récapitule…'),
    ],
    [['la carte', b('the menu', 'liste des plats')], ['une entrée', b('a starter', 'premier plat')], ['récapituler', b('to sum up', 'répéter en résumé')]],
  ),
  lesson(C, 3, ['allergies-requests-complaints', 'allergies-demandes-reclamations'],
    b('Allergies, requests and complaints', 'Allergies, demandes et réclamations'),
    b('Inform about allergens, adapt a dish and respond to a complaint professionally.', 'Informer sur les allergènes, adapter un plat et répondre à une réclamation avec professionnalisme.'),
    [b('Talk about allergens', 'Parler des allergènes'), b('Adapt a dish', 'Adapter un plat'), b('Handle a complaint', 'Traiter une réclamation')],
    13,
    [
      card(b('Allergens and adjustments', 'Allergènes et adaptations'), b('**Avez-vous des allergies ou des intolérances ? · Ce plat contient des fruits à coque / du gluten / des produits laitiers. · Le chef peut le préparer sans sauce. · Nous avons une option végétarienne.** Complaints: **Je suis vraiment désolé(e). Je vous le fais refaire tout de suite. · Je vous offre le dessert / le café pour m’excuser.**', '**Avez-vous des allergies ou des intolérances ? · Ce plat contient des fruits à coque / du gluten / des produits laitiers. · Le chef peut le préparer sans sauce. · Nous avons une option végétarienne.** Réclamations : **Je suis vraiment désolé(e). Je vous le fais refaire tout de suite. · Je vous offre le dessert / le café pour m’excuser.**')),
      mc(P.best, ['Oui, la mousse contient des noisettes. Je vous conseille plutôt la tarte aux pommes, qui n’en contient pas.', 'Je ne sais pas, essayez.', 'Un peu, ce n’est pas grave.', 'Les allergies, ça n’existe pas.'], { fr: '— Je suis allergique aux fruits à coque. La mousse au chocolat en contient ?' }),
      dlg(b('A complaint', 'Une réclamation'), undefined, [['Client', 'm'], ['Vous', 'f']], [
        [0, 'Excusez-moi, j’avais demandé ma viande à point, et elle est bien cuite.', 'Excuse me, I asked for my meat medium, and it’s well done.'],
        [1, { options: ['Je suis vraiment désolée, monsieur. Je vous la fais refaire tout de suite.', 'C’est presque pareil.', 'Le chef ne se trompe jamais.'] }],
        [0, 'Merci, c’est gentil.', 'Thank you, that’s kind.'],
        [1, { options: ['Je vous en prie. Et pour l’attente, je vous offre le café.', 'De rien, mais ça va être long.', 'Bon appétit quand même.'] }],
      ]),
      sort(b('Allergen or adjustment?', 'Allergène ou adaptation ?'), [b('allergen', 'allergène'), b('adjustment', 'adaptation')], [['le gluten', 0], ['sans sauce', 1], ['les fruits à coque', 0], ['option végétarienne', 1], ['les produits laitiers', 0], ['sauce à part', 1]]),
      say('Je suis vraiment désolé. Je vous le fais refaire tout de suite, et je vous offre le dessert.', 'I’m really sorry. I’ll have it remade right away, and the dessert is on us.'),
    ],
    [
      b('Ask: Avez-vous des allergies ? · Ce plat contient…', 'Demander : Avez-vous des allergies ? · Ce plat contient…'),
      b('Adapt: sans…, sauce à part, option végétarienne.', 'Adapter : sans…, sauce à part, option végétarienne.'),
      b('Complaint: apologise, fix it, offer a gesture.', 'Réclamation : s’excuser, corriger, faire un geste.'),
    ],
    [['les fruits à coque', b('tree nuts', 'noix, noisettes, amandes')], ['une intolérance', b('an intolerance', 'réaction à un aliment')], ['refaire', b('to remake', 'préparer de nouveau')]],
  ),
];
