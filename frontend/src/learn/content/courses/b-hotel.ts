import type { CourseAbout } from '../../types';
import { b, card, culture, dict, dlg, doc, gap, hear, lesson, mc, ord, P, pairs, say } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'From the booking to the check-out, this course gives travellers the French they need at a hotel, a B&B or a hostel: booking a room (single, double, with breakfast), checking in, asking for information and services (wifi, towels, wake-up call), and politely solving a problem (noise, broken shower, wrong bill).',
    'De la réservation au départ, ce cours donne aux voyageurs le français dont ils ont besoin à l’hôtel, dans une chambre d’hôtes ou une auberge de jeunesse : réserver une chambre (simple, double, avec petit-déjeuner), arriver et s’enregistrer, demander des informations et des services (wifi, serviettes, réveil), et régler poliment un problème (bruit, douche en panne, erreur sur la note).',
  ),
  outcomes: [
    b('Book a room by phone or email', 'Réserver une chambre par téléphone ou courriel'),
    b('Check in and ask for information', 'Arriver et demander des informations'),
    b('Ask for services', 'Demander des services'),
    b('Report a problem politely', 'Signaler poliment un problème'),
  ],
};

const C = 'b-hotel';
export default [
  lesson(C, 1, ['booking-a-room', 'reserver-une-chambre'],
    b('Booking a room', 'Réserver une chambre'),
    b('Ask for a room, give dates and number of people, ask the price.', 'Demander une chambre, donner les dates et le nombre de personnes, demander le prix.'),
    [b('Ask for a type of room', 'Demander un type de chambre'), b('Give dates', 'Donner les dates'), b('Ask about price and breakfast', 'Demander le prix et le petit-déjeuner')],
    13,
    [
      card(b('Booking', 'Réserver'), b('**Je voudrais réserver une chambre double pour deux nuits, du 12 au 14 mai. · Vous avez une chambre simple avec salle de bains ? · C’est combien la nuit ? · Le petit-déjeuner est compris ? · Est-ce qu’il y a un parking ?** Rooms: **une chambre simple / double / familiale, avec un grand lit / deux lits, avec vue sur la mer**.', '**Je voudrais réserver une chambre double pour deux nuits, du 12 au 14 mai. · Vous avez une chambre simple avec salle de bains ? · C’est combien la nuit ? · Le petit-déjeuner est compris ? · Est-ce qu’il y a un parking ?** Chambres : **une chambre simple / double / familiale, avec un grand lit / deux lits, avec vue sur la mer**.')),
      dlg(b('A booking by phone', 'Une réservation par téléphone'), undefined, [['Réceptionniste', 'f'], ['Vous', 'm']], [
        [0, 'Hôtel du Port, bonjour !', 'Hôtel du Port, hello!'],
        [1, { options: ['Bonjour, je voudrais réserver une chambre double pour deux nuits, du 12 au 14 mai.', 'Chambre. Mai.', 'Vous avez des lits ?'] }],
        [0, 'Oui, il nous reste une chambre avec vue sur la mer, à 120 euros la nuit.', 'Yes, we have a room with a sea view left, at 120 euros a night.'],
        [1, { options: ['Très bien. Le petit-déjeuner est compris ?', 'C’est trop. Au revoir.', 'La mer, je n’aime pas.'] }],
        [0, 'Non, il est à 14 euros par personne.', 'No, it’s 14 euros per person.'],
      ], true),
      hear('Il nous reste une chambre familiale avec deux lits, à quatre-vingt-quinze euros la nuit, petit-déjeuner compris.', b('What is included?', 'Qu’est-ce qui est compris ?'), [b('breakfast', 'le petit-déjeuner'), b('parking', 'le parking'), b('dinner', 'le dîner'), b('nothing', 'rien')], { voice: 'f' }),
      mc(P.best, ['Je voudrais réserver une chambre simple pour une nuit, le 3 juin.', 'Une nuit chambre le 3.', 'Je veux dormir.', 'Chambre, juin, combien ?'], { fr: 'Vous réservez une chambre pour une personne :' }),
      gap(P.complete, 'Je voudrais ___ une chambre double ___ 12 au 14 mai.', ['réserver', 'du']),
      say('Bonjour, je voudrais réserver une chambre double pour deux nuits. Le petit-déjeuner est compris ?', 'Hello, I’d like to book a double room for two nights. Is breakfast included?'),
    ],
    [
      b('Je voudrais réserver une chambre simple / double pour … nuits.', 'Je voudrais réserver une chambre simple / double pour … nuits.'),
      b('du 12 au 14 mai · C’est combien la nuit ?', 'du 12 au 14 mai · C’est combien la nuit ?'),
      b('Le petit-déjeuner est compris ?', 'Le petit-déjeuner est compris ?'),
    ],
    [['compris', b('included', 'dans le prix')], ['une salle de bains', b('a bathroom', 'pour se laver')], ['la vue', b('the view', 'ce qu’on voit')]],
  ),
  lesson(C, 2, ['check-in-and-services', 'arrivee-et-services'],
    b('Check-in and services', 'L’arrivée et les services'),
    b('Check in, understand hotel information and ask for services.', 'S’enregistrer, comprendre les informations de l’hôtel et demander des services.'),
    [b('Check in', 'S’enregistrer'), b('Understand hotel information', 'Comprendre les informations'), b('Ask for services', 'Demander des services')],
    13,
    [
      card(b('At reception', 'À la réception'), b('**J’ai une réservation au nom de Diallo.** Services: **Quel est le code du wifi ? · Je pourrais avoir une serviette de plus ? · Vous pourriez me réveiller à 6 h ? · Je peux laisser ma valise ici après le départ ? · À quelle heure faut-il libérer la chambre ?**', '**J’ai une réservation au nom de Diallo.** Services : **Quel est le code du wifi ? · Je pourrais avoir une serviette de plus ? · Vous pourriez me réveiller à 6 h ? · Je peux laisser ma valise ici après le départ ? · À quelle heure faut-il libérer la chambre ?**')),
      doc({ look: 'notice', title: b('Hotel information', 'Informations de l’hôtel'), text: 'BIENVENUE À L’HÔTEL DU PORT\nPetit-déjeuner : 7 h – 10 h (salle du rez-de-chaussée)\nWifi : réseau « HotelPort », code à la réception\nDépart : chambres à libérer avant 11 h\nBagagerie gratuite jusqu’à 18 h\nRéception ouverte 24 h / 24' }, b('Until what time can you leave your luggage?', 'Jusqu’à quelle heure peut-on laisser ses bagages ?'), [b('6 p.m.', '18 h'), b('11 a.m.', '11 h'), b('10 a.m.', '10 h'), b('midnight', 'minuit')]),
      pairs(P.match, [['une serviette', b('a towel', 'pour se sécher')], ['un oreiller', b('a pillow', 'pour la tête')], ['une couverture', b('a blanket', 'pour avoir chaud')], ['la bagagerie', b('the luggage room', 'où laisser ses bagages')]]),
      mc(P.best, ['Bonsoir, j’ai une réservation au nom de Tremblay, pour deux nuits.', 'Tremblay. Chambre.', 'Ma chambre ?', 'Je suis arrivé.'], { fr: 'Vous arrivez à la réception :' }),
      ord(P.order, 'Je pourrais avoir une serviette de plus, s’il vous plaît ?', { tr: 'Could I have an extra towel, please?' }),
      say('Bonsoir, j’ai une réservation au nom de Diallo. Quel est le code du wifi, s’il vous plaît ?', 'Good evening, I have a booking under the name Diallo. What is the wifi code, please?'),
    ],
    [
      b('J’ai une réservation au nom de…', 'J’ai une réservation au nom de…'),
      b('Je pourrais avoir… ? Vous pourriez… ?', 'Je pourrais avoir… ? Vous pourriez… ?'),
      b('serviette, oreiller, couverture, wifi, bagagerie.', 'serviette, oreiller, couverture, wifi, bagagerie.'),
    ],
    [['le réseau', b('the network', 'connexion internet')], ['libérer la chambre', b('to vacate the room', 'quitter la chambre')], ['réveiller', b('to wake up (someone)', 'faire sortir du sommeil')]],
  ),
  lesson(C, 3, ['solving-a-problem', 'regler-un-probleme'],
    b('Solving a problem', 'Régler un problème'),
    b('Report a problem in your room or on the bill politely and get a solution.', 'Signaler poliment un problème dans la chambre ou sur la note et obtenir une solution.'),
    [b('Describe a problem', 'Décrire un problème'), b('Ask for a solution', 'Demander une solution'), b('Check the bill', 'Vérifier la note')],
    13,
    [
      card(b('Problems', 'Les problèmes'), b('**Excusez-moi, la douche ne marche pas. · Il n’y a pas d’eau chaude. · La climatisation fait beaucoup de bruit. · La chambre est trop bruyante.** Solution: **Est-ce que vous pourriez envoyer quelqu’un ? · Serait-il possible de changer de chambre ?** Bill: **Je crois qu’il y a une erreur sur la note : je n’ai rien pris au minibar.**', '**Excusez-moi, la douche ne marche pas. · Il n’y a pas d’eau chaude. · La climatisation fait beaucoup de bruit. · La chambre est trop bruyante.** Solution : **Est-ce que vous pourriez envoyer quelqu’un ? · Serait-il possible de changer de chambre ?** Note : **Je crois qu’il y a une erreur sur la note : je n’ai rien pris au minibar.**')),
      culture(b('Stay polite', 'Restez poli'), b('In French-speaking hotels, a calm, polite request (**Excusez-moi…, serait-il possible… ?**) almost always works better than an angry complaint. Staff will try to help.', 'Dans les hôtels francophones, une demande calme et polie (**Excusez-moi…, serait-il possible… ?**) fonctionne presque toujours mieux qu’une plainte en colère. Le personnel cherchera à aider.'), { variant: 'culture' }),
      dlg(b('A noisy room', 'Une chambre bruyante'), undefined, [['Vous', 'f'], ['Réceptionniste', 'm']], [
        [0, { options: ['Excusez-moi, ma chambre donne sur la rue et c’est très bruyant. Serait-il possible de changer de chambre ?', 'Votre hôtel est horrible !', 'Bruit. Changer.'] }],
        [1, 'Je suis désolé, madame. J’ai une chambre plus calme, côté jardin.', 'I’m sorry, madam. I have a quieter room, on the garden side.'],
        [0, { options: ['Parfait, merci beaucoup !', 'Il était temps.', 'Bof.'] }],
      ]),
      mc(P.best, ['Excusez-moi, je crois qu’il y a une erreur : on m’a compté un dîner, mais je n’ai pas dîné à l’hôtel.', 'Vous volez vos clients !', 'Je ne paie pas ça.', 'C’est faux, enlevez tout.'], { fr: 'Il y a une erreur sur votre note :' }),
      dict('Excusez-moi, il n’y a pas d’eau chaude dans ma chambre. Vous pourriez envoyer quelqu’un ?', {}),
      say('Excusez-moi, la douche ne marche pas. Est-ce que vous pourriez envoyer quelqu’un ?', 'Excuse me, the shower doesn’t work. Could you send someone?'),
    ],
    [
      b('Problem: … ne marche pas · il n’y a pas de… · c’est trop bruyant.', 'Problème : … ne marche pas · il n’y a pas de… · c’est trop bruyant.'),
      b('Solution: Vous pourriez… ? Serait-il possible de… ?', 'Solution : Vous pourriez… ? Serait-il possible de… ?'),
      b('Bill: Je crois qu’il y a une erreur sur la note.', 'Note : Je crois qu’il y a une erreur sur la note.'),
    ],
    [['la note', b('the bill (hotel)', 'facture de l’hôtel')], ['la climatisation', b('air conditioning', 'appareil pour rafraîchir')], ['donner sur', b('to look out onto', 'avoir vue sur')]],
  ),
];
