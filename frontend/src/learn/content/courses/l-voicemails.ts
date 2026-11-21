import type { CourseAbout } from '../../types';
import { b, card, dict, dlg, hear, lesson, P, pairs, say, tip } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'A message from the dentist, a colleague who will be late, a delivery that could not be made: voicemails pack a lot of information into thirty seconds, without any image to help. This course teaches you to listen with a grid (qui, pourquoi, quoi faire, quand, numéro), to catch the purpose of the call, and to leave a clear message yourself.',
    'Un message du dentiste, un collègue qui sera en retard, une livraison qui n’a pas pu être faite : les messages vocaux concentrent beaucoup d’informations en trente secondes, sans image pour aider. Ce cours vous apprend à écouter avec une grille (qui, pourquoi, quoi faire, quand, numéro), à saisir le but de l’appel, et à laisser vous-même un message clair.',
  ),
  outcomes: [
    b('Identify who calls and why', 'Identifier qui appelle et pourquoi'),
    b('Find what you must do and by when', 'Trouver ce qu’il faut faire et pour quand'),
    b('Note a callback number', 'Noter un numéro de rappel'),
    b('Leave a clear voicemail', 'Laisser un message vocal clair'),
  ],
};

const C = 'l-voicemails';
export default [
  lesson(C, 1, ['listening-with-a-grid', 'ecouter-avec-une-grille'],
    b('Listening with a grid', 'Écouter avec une grille'),
    b('Use a 5-question grid to understand any voicemail.', 'Utiliser une grille de 5 questions pour comprendre n’importe quel message.'),
    [b('Identify the caller', 'Identifier l’appelant'), b('Identify the purpose', 'Identifier le but'), b('Find the action required', 'Trouver l’action demandée')],
    13,
    [
      card(b('The 5-question grid', 'La grille des 5 questions'), b('1. **Qui** appelle ? 2. **Pourquoi** ? 3. **Que** dois-je faire ? 4. **Quand** ? 5. Quel **numéro** ? Messages usually follow this order: greeting, name, reason, request, number, goodbye.', '1. **Qui** appelle ? 2. **Pourquoi** ? 3. **Que** dois-je faire ? 4. **Quand** ? 5. Quel **numéro** ? Les messages suivent souvent cet ordre : salutation, nom, raison, demande, numéro, au revoir.')),
      hear('Bonjour, c’est Julie de la clinique dentaire. J’appelle pour confirmer votre rendez-vous de jeudi à quinze heures. Merci de nous rappeler si vous ne pouvez pas venir.', b('Why does Julie call?', 'Pourquoi Julie appelle-t-elle ?'), [b('To confirm an appointment on Thursday at 3 p.m.', 'Pour confirmer un rendez-vous jeudi à 15 h'), b('To cancel an appointment', 'Pour annuler un rendez-vous'), b('To ask for payment', 'Pour demander un paiement'), b('To change the time to 5 p.m.', 'Pour changer l’heure à 17 h')]),
      hear('Salut, c’est Marc. Je suis coincé dans les bouchons, je vais avoir une demi-heure de retard. Commencez la réunion sans moi.', b('What must you do?', 'Que devez-vous faire ?'), [b('Start the meeting without Marc', 'Commencer la réunion sans Marc'), b('Wait for Marc', 'Attendre Marc'), b('Call Marc back', 'Rappeler Marc'), b('Cancel the meeting', 'Annuler la réunion')]),
      hear('Bonjour, ici le service de livraison. Nous sommes passés à dix heures, mais il n’y avait personne. Votre colis est disponible au bureau de poste de la rue Rachel.', b('Where is the parcel?', 'Où est le colis ?'), [b('At the post office on rue Rachel', 'Au bureau de poste de la rue Rachel'), b('In front of the door', 'Devant la porte'), b('At the neighbour’s', 'Chez le voisin'), b('Back at the warehouse', 'Retourné à l’entrepôt')]),
      tip(b('The purpose comes early', 'Le but arrive tôt'), b('Listen carefully after the name: **J’appelle pour…, Je vous appelle au sujet de…, C’est pour…** gives you the reason.', 'Écoutez bien après le nom : **J’appelle pour…, Je vous appelle au sujet de…, C’est pour…** donne la raison.')),
      pairs(P.match, [['J’appelle pour…', b('I’m calling to…', 'but de l’appel')], ['être coincé', b('to be stuck', 'être bloqué')], ['il n’y avait personne', b('nobody was in', 'absence')], ['au sujet de', b('about, regarding', 'concernant')]]),
      dict('J’appelle pour confirmer votre rendez-vous de jeudi.', { voice: 'f' }),
    ],
    [
      b('Grid: qui, pourquoi, quoi faire, quand, numéro.', 'Grille : qui, pourquoi, quoi faire, quand, numéro.'),
      b('Purpose: J’appelle pour…, au sujet de…', 'But : J’appelle pour…, au sujet de…'),
      b('Order: name → reason → request → number → goodbye.', 'Ordre : nom → raison → demande → numéro → au revoir.'),
    ],
    [['une livraison', b('a delivery', 'remise d’un colis')], ['un colis', b('a parcel', 'paquet')], ['les bouchons', b('traffic jams', 'embouteillages')]],
  ),
  lesson(C, 2, ['callback-numbers-and-deadlines', 'numeros-et-delais'],
    b('Callback numbers and deadlines', 'Numéros de rappel et délais'),
    b('Catch numbers, extensions and deadlines in professional messages.', 'Saisir numéros, postes et délais dans des messages professionnels.'),
    [b('Note a number and an extension', 'Noter un numéro et un poste'), b('Catch a deadline', 'Saisir un délai'), b('Understand a polite request', 'Comprendre une demande polie')],
    13,
    [
      card(b('Professional messages', 'Les messages professionnels'), b('**Vous pouvez me joindre au…** (you can reach me at…), **poste 214** (extension), **avant vendredi midi** (deadline), **dans les plus brefs délais** (as soon as possible), **n’hésitez pas à…** (feel free to…).', '**Vous pouvez me joindre au…**, **poste 214**, **avant vendredi midi**, **dans les plus brefs délais**, **n’hésitez pas à…**.')),
      hear('Bonjour, Sophie Gagnon des ressources humaines. Vous pouvez me joindre au cinq un quatre, cinq cinq cinq, zéro deux, trente, poste deux cent quatorze.', b('What is the extension?', 'Quel est le poste ?'), ['214', '240', '204', '230']),
      hear('Il nous manque une copie de votre permis de travail. Merci de nous l’envoyer avant vendredi midi.', b('What is the deadline?', 'Quel est le délai ?'), [b('Before Friday noon', 'Avant vendredi midi'), b('Before Monday', 'Avant lundi'), b('Today at 6 p.m.', 'Aujourd’hui à 18 h'), b('No deadline', 'Aucun délai')]),
      hear('Votre voiture est prête, vous pouvez venir la chercher à partir de seize heures. Le garage ferme à dix-huit heures.', b('When can you pick up your car?', 'Quand pouvez-vous récupérer votre voiture ?'), [b('Between 4 and 6 p.m.', 'Entre 16 h et 18 h'), b('Before 4 p.m.', 'Avant 16 h'), b('After 6 p.m.', 'Après 18 h'), b('Tomorrow', 'Demain')]),
      hear('Je vous rappelle au sujet de votre candidature. Pourriez-vous me rappeler dans les plus brefs délais ?', b('What does the caller want?', 'Que veut l’appelant ?'), [b('A call back as soon as possible about the application', 'Un rappel au plus vite au sujet de la candidature'), b('To cancel the application', 'Annuler la candidature'), b('A new CV', 'Un nouveau CV'), b('An email next month', 'Un courriel le mois prochain')]),
      pairs(P.match, [['joindre quelqu’un', b('to reach someone', 'contacter')], ['le poste', b('the extension', 'numéro interne')], ['dans les plus brefs délais', b('as soon as possible', 'au plus vite')], ['une candidature', b('an application', 'demande d’emploi')]]),
      dict('Vous pouvez me joindre au poste deux cent quatorze.', { voice: 'm' }),
    ],
    [
      b('Vous pouvez me joindre au… poste…', 'Vous pouvez me joindre au… poste…'),
      b('Deadlines: avant vendredi midi, dans les plus brefs délais.', 'Délais : avant vendredi midi, dans les plus brefs délais.'),
      b('à partir de… = from… (onwards).', 'à partir de… = dès…'),
    ],
    [['un permis de travail', b('a work permit', 'autorisation de travailler')], ['les ressources humaines', b('human resources', 'service du personnel')], ['récupérer', b('to pick up, collect', 'reprendre')]],
  ),
  lesson(C, 3, ['leaving-a-message', 'laisser-un-message'],
    b('Leaving a clear message', 'Laisser un message clair'),
    b('Use the same structure to leave a short, clear voicemail.', 'Reprendre la même structure pour laisser un message court et clair.'),
    [b('Structure your message', 'Structurer son message'), b('Say a number clearly', 'Dire un numéro clairement'), b('End politely', 'Terminer poliment')],
    13,
    [
      card(b('A model message', 'Un message modèle'), b('**Bonjour, c’est [nom]. J’appelle au sujet de… Pourriez-vous me rappeler au… ? Je suis disponible… Merci, bonne journée !** Say the number **slowly**, in groups, and repeat it.', '**Bonjour, c’est [nom]. J’appelle au sujet de… Pourriez-vous me rappeler au… ? Je suis disponible… Merci, bonne journée !** Dites le numéro **lentement**, par groupes, et répétez-le.')),
      hear('Bonjour, c’est Ana Ruiz. J’appelle au sujet de l’appartement de la rue Fullum. Est-ce qu’il est encore disponible ? Mon numéro est le quatre trois huit, cinq cinq cinq, dix-sept, vingt. Merci !', b('What does Ana want to know?', 'Que veut savoir Ana ?'), [b('If the apartment is still available', 'Si l’appartement est encore disponible'), b('The price of the rent', 'Le prix du loyer'), b('The landlord’s address', 'L’adresse du propriétaire'), b('If pets are allowed', 'Si les animaux sont acceptés')]),
      tip(b('Be brief', 'Soyez bref'), b('A good message lasts **20 to 30 seconds**. One reason, one request, one number. Avoid details: they will ask if needed.', 'Un bon message dure **20 à 30 secondes**. Une raison, une demande, un numéro. Évitez les détails : on vous les demandera si besoin.')),
      dlg(b('Answering machine', 'Répondeur'), b('You call a garage and get the voicemail.', 'Vous appelez un garage et tombez sur le répondeur.'), [['Répondeur', 'm'], ['Vous', 'f']], [
        [0, 'Vous êtes bien au Garage Fortin. Laissez votre message après le bip.', 'You have reached Garage Fortin. Leave your message after the beep.'],
        [1, { options: ['Bonjour, c’est Marie Lavoie. J’appelle au sujet de ma voiture, une Honda grise. Pourriez-vous me rappeler au cinq un quatre, cinq cinq cinq, quarante, douze ? Merci !', 'Allô ? Allô ? Il y a quelqu’un ?', 'Bonjour. Voiture. Merci.'] }],
      ], true),
      pairs(P.match, [['Laissez votre message après le bip.', b('Leave your message after the beep.', 'consigne du répondeur')], ['Pourriez-vous me rappeler ?', b('Could you call me back?', 'demande de rappel')], ['Je suis disponible…', b('I’m available…', 'disponibilité')], ['le répondeur', b('the answering machine', 'appareil qui enregistre')]]),
      say('Bonjour, c’est Paul Martin. J’appelle au sujet de ma commande. Pourriez-vous me rappeler au cinq un quatre, cinq cinq cinq, zéro deux, trente ? Merci, bonne journée !', 'Hello, this is Paul Martin. I’m calling about my order. Could you call me back at 514 555 02 30? Thanks, have a good day!'),
    ],
    [
      b('Model: Bonjour, c’est… J’appelle au sujet de… Pourriez-vous me rappeler au… ? Merci.', 'Modèle : Bonjour, c’est… J’appelle au sujet de… Pourriez-vous me rappeler au… ? Merci.'),
      b('Say the number slowly, in groups.', 'Dites le numéro lentement, par groupes.'),
      b('20–30 seconds: one reason, one request, one number.', '20–30 secondes : une raison, une demande, un numéro.'),
    ],
    [['le bip', b('the beep', 'signal sonore')], ['une commande', b('an order', 'achat demandé')], ['disponible', b('available', 'libre')]],
  ),
];
