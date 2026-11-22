import type { CourseAbout } from '../../types';
import { b, card, dict, dlg, doc, gap, hear, lesson, mc, ord, P, pairs, say, sort, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Sharing your life with a dog or cat means daily routines and occasional trips to the clinic. This A2 course gives you practical French for everyday pet care (walks, food, bowls, litter, brushing), booking a vet appointment for a check-up or vaccine, reading clinic reminders, describing common symptoms and following medication instructions accurately.',
    'Vivre avec un chien ou un chat implique des routines quotidiennes et parfois un passage à la clinique. Ce cours A2 vous donne le français concret pour les soins de tous les jours (promenades, croquettes, gamelle, litière, brossage), prendre rendez-vous chez le vétérinaire, lire un rappel de vaccin, décrire des symptômes courants et suivre un traitement.',
  ),
  outcomes: [
    b('Talk about daily care for dogs and cats', 'Parler des soins quotidiens d’un chien ou d’un chat'),
    b('Book a vet appointment by phone', 'Prendre rendez-vous chez le vétérinaire par téléphone'),
    b('Read vet clinic reminders and care instructions', 'Lire rappels vétérinaires et consignes de soins'),
    b('Describe symptoms and follow prescriptions', 'Décrire des symptômes et suivre une ordonnance'),
  ],
};

const C = 'b-pets-vet';
export default [
  lesson(C, 1, ['caring-for-a-pet', 'prendre-soin-de-son-animal'],
    b('Caring for a pet', 'Prendre soin de son animal'),
    b('Talk about walking, feeding, adopting and everyday gear for dogs and cats.', 'Parler des promenades, repas, adoption et accessoires pour chiens et chats.'),
    [b('Name dog and cat care items', 'Nommer le matériel pour chien et chat'), b('Talk about feeding and walking', 'Parler des repas et des promenades'), b('Describe your pet simply', 'Décrire simplement son animal')],
    13,
    [
      card(b('Daily pet care', 'Les soins du quotidien'), b('Food & water: **les croquettes, la pâtée, remplir la gamelle d’eau fraîche**. Dogs: **mettre le collier, attacher la laisse, promener au parc**. Cats: **changer la litière, l’arbre à chat, faire ses griffes**. General: **brosser le poil, adopter en refuge**.', 'Nourriture et eau : **les croquettes, la pâtée, remplir la gamelle d’eau fraîche**. Chiens : **mettre le collier, attacher la laisse, promener au parc**. Chats : **changer la litière, l’arbre à chat, faire ses griffes**. Général : **brosser le poil, adopter en refuge**.'), {
        ex: [['On sort notre chien matin et soir dans le parc.', 'We take our dog out morning and evening in the park.'], ['J’ai adopté un chat très calme au refuge.', 'I adopted a very calm cat from the shelter.']],
      }),
      sort(b('Dog or cat?', 'Chien ou chat ?'), [b('dog', 'chien'), b('cat', 'chat')], [['mettre la laisse pour la promenade', 0], ['nettoyer la litière', 1], ['le promener au parc trois fois par jour', 0], ['installer un arbre à chat', 1], ['porter une muselière dans le train', 0], ['faire ses griffes sur le griffoir', 1]]),
      hear('Notre chienne s’appelle Luna, elle a trois ans. On la sort matin et soir au parc, et elle adore courir après la balle.', b('How often do they walk Luna?', 'À quelle fréquence sortent-ils Luna ?'), [b('morning and evening', 'matin et soir'), b('once a day at noon', 'une fois par jour à midi'), b('only at weekends', 'seulement le week-end'), b('three times a week', 'trois fois par semaine')], { voice: 'f' }),
      pairs(P.match, [['les croquettes', b('dry pet food / kibble', 'nourriture sèche pour animaux')], ['la laisse', b('the leash / lead', 'cordon pour promener')], ['la litière', b('the litter tray', 'bac propre du chat')], ['la gamelle', b('the food / water bowl', 'bol pour manger ou boire')]]),
      gap(P.complete, 'Avant de partir au travail, je remplis sa ___ d’eau fraîche et je lui donne ses ___.', ['gamelle', 'croquettes'], { choices: [['gamelle', 'laisse', 'litière'], ['croquettes', 'griffes', 'puces']] }),
      ord(P.order, 'Je dois promener mon chien avant qu’il ne fasse nuit.', { tr: 'I have to walk my dog before it gets dark.', extra: ['chat'] }),
      say('J’ai adopté un chat de deux ans au refuge : il est très doux et joueur.', 'I adopted a two-year-old cat from the shelter: he’s very gentle and playful.'),
    ],
    [
      b('la gamelle, les croquettes, la laisse, la litière.', 'la gamelle, les croquettes, la laisse, la litière.'),
      b('sortir / promener le chien · nettoyer la litière.', 'sortir / promener le chien · nettoyer la litière.'),
      b('adopter en refuge · brosser le poil.', 'adopter en refuge · brosser le poil.'),
    ],
    [['les croquettes (f)', b('kibble / dry food', 'petits biscuits secs pour chien ou chat')], ['la laisse', b('the leash', 'lien pour tenir le chien')], ['un refuge', b('an animal shelter', 'lieu qui recueille les animaux')]],
  ),
  lesson(C, 2, ['booking-a-vet-visit', 'prendre-rendez-vous-chez-le-veterinaire'],
    b('Booking a vet visit', 'Prendre rendez-vous chez le vétérinaire'),
    b('Call the clinic for a routine vaccine or urgent slot and read vet reminders.', 'Appeler la clinique pour un rappel ou une urgence et lire un avis vétérinaire.'),
    [b('Book a check-up or urgent slot', 'Réserver un bilan ou un créneau urgent'), b('Read a vet clinic reminder', 'Lire un rappel de clinique'), b('Use key terms: puce, vaccin, carnet', 'Employer puce, vaccin et carnet de santé')],
    13,
    [
      card(b('At the vet clinic', 'À la clinique vétérinaire'), b('**Je voudrais prendre rendez-vous pour mon chien / mon chat. · C’est pour le rappel annuel de vaccin. · Il est identifié par puce électronique. · N’oubliez pas le carnet de santé.** In the waiting room: **garder le chien en laisse, utiliser une caisse de transport pour le chat**.', '**Je voudrais prendre rendez-vous pour mon chien / mon chat. · C’est pour le rappel annuel de vaccin. · Il est identifié par puce électronique. · N’oubliez pas le carnet de santé.** En salle d’attente : **garder le chien en laisse, utiliser une caisse de transport pour le chat**.'), {
        ex: [['Mon chien boite depuis ce matin, auriez-vous un créneau aujourd’hui ?', 'My dog has been limping since this morning, would you have a slot today?'], ['Voici son carnet de santé à jour.', 'Here is his up-to-date health booklet.']],
      }),
      dlg(b('Calling the vet clinic', 'Appeler la clinique'), undefined, [['Assistante', 'f2'], ['Vous', 'm']], [
        [0, 'Clinique vétérinaire du Parc, bonjour !', 'Parc Vet Clinic, hello!'],
        [1, { options: ['Bonjour madame, je voudrais prendre rendez-vous pour le rappel de vaccin de mon chien.', 'Chien vaccin demain.', 'Je veux voir le chien.'] }],
        [0, 'Bien sûr. Est-ce que jeudi à quinze heures vous convient ?', 'Of course. Does Thursday at three p.m. suit you?'],
        [1, { options: ['Oui, parfait ! Est-ce que je dois apporter son carnet de santé ?', 'Non, je n’ai pas de chien.', 'Je viens sans animal.'] }],
        [0, 'Oui, merci, et gardez-le bien en laisse dans la salle d’attente.', 'Yes, please, and do keep him on a leash in the waiting room.'],
      ], true),
      doc({ look: 'notice', title: b('Vet clinic — Annual reminder', 'Clinique vétérinaire — Rappel annuel'), text: 'CLINIQUE DU PARC — RAPPEL ANNUEL\nAnimal : Félix (chat européen, 5 ans)\nPuce électronique : 250268712345678\nÀ prévoir ce mois-ci :\n• Rappel de vaccin annuel\n• Traitement antiparasitaire (puces et tiques)\nMerci d’apporter le carnet de santé et d’utiliser une caisse de transport fermée.' }, b('What must you bring for Félix’s visit?', 'Que faut-il apporter pour la visite de Félix ?'), [b('his health booklet and a closed carrier', 'son carnet de santé et une caisse fermée'), b('a muzzle and a leash', 'une muselière et une laisse'), b('a bag of kibble', 'un sac de croquettes'), b('nothing at all', 'rien du tout')]),
      mc(P.best, ['Mon chien boite depuis ce matin, auriez-vous un créneau aujourd’hui ?', 'Mon chien mal, vite !', 'Je viens sans rendez-vous dans cinq minutes.', 'Donnez un médicament au téléphone.'], { fr: 'Votre chien a mal à la patte et vous appelez le matin :' }),
      dict('N’oubliez pas d’apporter son carnet de santé et de le garder en laisse dans la salle d’attente.', { voice: 'f' }),
      say('Bonjour, je voudrais prendre rendez-vous pour le rappel de vaccin de mon chat.', 'Hello, I’d like to book an appointment for my cat’s booster shot.'),
    ],
    [
      b('rappel de vaccin · puce électronique · carnet de santé.', 'rappel de vaccin · puce électronique · carnet de santé.'),
      b('caisse de transport (carrier) · garder en laisse.', 'caisse de transport · garder en laisse.'),
      b('auriez-vous un créneau… ? = would you have a slot…?', 'auriez-vous un créneau… ? = demander une disponibilité.'),
    ],
    [['le carnet de santé', b('health / vaccination booklet', 'livret des vaccins et soins')], ['la puce électronique', b('microchip', 'petite puce d’identification')], ['un créneau', b('an appointment slot', 'heure disponible')]],
  ),
  lesson(C, 3, ['describing-symptoms-and-treatment', 'decrire-les-symptomes-et-le-traitement'],
    b('Symptoms & treatment', 'Symptômes et traitement'),
    b('Explain what is wrong with your pet and understand medicine instructions.', 'Expliquer ce qui ne va pas chez son animal et comprendre l’ordonnance.'),
    [b('Describe common pet symptoms', 'Décrire des symptômes fréquents'), b('Understand doses and duration', 'Comprendre doses et durée'), b('Write a message to a vet or pet-sitter', 'Écrire au vétérinaire ou à un pet-sitter')],
    13,
    [
      card(b('Symptoms & prescription', 'Symptômes et ordonnance'), b('Symptoms: **Il ne mange plus depuis hier. · Il boite de la patte avant. · Il se gratte souvent l’oreille. · Il a vomi deux fois. · Il est tout abattu.** Treatment: **un comprimé dans sa nourriture, deux gouttes dans chaque oreille matin et soir pendant sept jours**.', 'Symptômes : **Il ne mange plus depuis hier. · Il boite de la patte avant. · Il se gratte souvent l’oreille. · Il a vomi deux fois. · Il est tout abattu.** Traitement : **un comprimé dans sa nourriture, deux gouttes dans chaque oreille matin et soir pendant sept jours**.'), {
        ex: [['Mettez deux gouttes matin et soir pendant une semaine.', 'Put two drops morning and evening for one week.'], ['Depuis hier, il reste caché et ne touche plus à sa gamelle.', 'Since yesterday, he stays hidden and hasn’t touched his bowl.']],
      }),
      hear('Rien de grave : c’est une petite otite. Mettez-lui trois gouttes dans l’oreille droite matin et soir pendant sept jours, et évitez qu’il se baigne cette semaine.', b('How long should the ear drops be given?', 'Combien de temps faut-il mettre les gouttes ?'), [b('morning and evening for seven days', 'matin et soir pendant sept jours'), b('once a day for three days', 'une fois par jour pendant trois jours'), b('only when he swims', 'seulement après le bain'), b('for one whole month', 'pendant tout un mois')], { voice: 'm' }),
      pairs(P.match, [['boiter', b('to limp', 'marcher difficilement')], ['se gratter', b('to scratch oneself', 'frotter avec la patte')], ['un comprimé', b('a tablet / pill', 'médicament à avaler')], ['abattu', b('lethargic, low', 'sans énergie, triste')]]),
      mc(P.best, ['Depuis hier soir, il ne touche plus à ses croquettes et reste caché sous le lit.', 'Il est cassé.', 'Mon chat ne marche pas, réparez-le.', 'Je ne sais pas ce qu’il fait dans la vie.'], { fr: 'Le vétérinaire demande comment votre chat se comporte depuis hier :' }),
      write(b('Note to the vet', 'Message au vétérinaire'), b('Write a short message (35–65 words) to a vet clinic: introduce your pet, describe two symptoms clearly, and ask for an appointment.', 'Écrivez un court message (35–65 mots) à une clinique vétérinaire : présentez votre animal, décrivez deux symptômes clairement et demandez un rendez-vous.'), 35, 65, [
        b('Pet’s name, species and age', 'Nom, espèce et âge de l’animal'),
        b('Two clear symptoms with duration', 'Deux symptômes clairs avec la durée'),
        b('Polite request for a slot', 'Demande polie de rendez-vous'),
      ], 'Bonjour docteur, je vous écris au sujet de mon chat Milo, âgé de quatre ans. Depuis hier matin, il ne mange presque plus ses croquettes et il se gratte souvent l’oreille droite. Il est vacciné et identifié par puce électronique. Auriez-vous un créneau disponible demain matin pour une consultation ? Merci d’avance, Paul.', { phrases: ['Depuis hier…', 'il se gratte…', 'Auriez-vous un créneau… ?'] }),
      say('Depuis hier, mon chien boite de la patte gauche et il a moins d’appétit.', 'Since yesterday, my dog has been limping on his left paw and has less of an appetite.'),
    ],
    [
      b('boiter, se gratter, vomir, manquer d’appétit, être abattu.', 'boiter, se gratter, vomir, manquer d’appétit, être abattu.'),
      b('un comprimé · des gouttes · matin et soir pendant… jours.', 'un comprimé · des gouttes · matin et soir pendant… jours.'),
      b('depuis + moment / pendant + durée.', 'depuis + début / pendant + durée.'),
    ],
    [['boiter', b('to limp', 'marcher de travers à cause d’une douleur')], ['une patte', b('a paw / animal’s leg', 'jambe d’un animal')], ['des gouttes (f)', b('drops (medicine)', 'liquide donné goutte à goutte')]],
  ),
];
