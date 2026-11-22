import type { CourseAbout } from '../../types';
import { b, dict, doc, exam, gap, hear, lesson, mc, P, pairs, sort, tip } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'In the DELF A1 exam, listening and reading together represent half the total score (50 points out of 100). This focused training course gives you targeted practice with the exact document types you meet on exam day: public announcements, voicemails, shop notices, menus, invitations, postcards and registration forms, so you catch every number, time, place and instruction under real exam conditions.',
    'Au DELF A1, les compréhensions orale et écrite représentent à elles seules la moitié de la note totale (50 points sur 100). Ce cours d’entraînement ciblé vous exerce aux documents exacts du jour de l’examen : annonces publiques, messages vocaux, affiches de commerces, menus, invitations, cartes postales et fiches d’inscription, pour saisir chaque chiffre, heure, lieu et consigne en conditions réelles.',
  ),
  outcomes: [
    b('Catch numbers, times, dates and prices in A1 recordings', 'Saisir nombres, heures, dates et prix dans les enregistrements A1'),
    b('Decode announcements, voicemails and simple dialogues', 'Comprendre annonces, messages vocaux et dialogues simples'),
    b('Scan signs, menus, emails and instructions quickly', 'Repérer vite l’information dans affiches, menus et messages'),
    b('Avoid classic A1 traps like closed days or negated details', 'Éviter les pièges classiques du A1 comme les jours de fermeture'),
  ],
};

const C = 'delf-a1-comprehension';
export default [
  lesson(C, 1, ['listening-numbers-announcements', 'ecouter-chiffres-et-annonces'],
    b('Listening: announcements and messages', 'Écoute : annonces publiques et messages'),
    b('Identify key numbers, places and times in stations, shops and voicemails.', 'Repérer nombres, lieux et heures clés dans les gares, magasins et messages vocaux.'),
    [b('Spot key words before listening', 'Repérer les mots clés avant l’écoute'), b('Catch exact times and prices', 'Saisir heures et prix exacts'), b('Identify why someone is calling', 'Identifier le motif d’un appel')],
    13,
    [
      exam(b('Four short recordings at A1', 'Quatre courts exercices au DELF A1'), b('In DELF A1 listening, you hear **three short messages/announcements** and **one series of mini-dialogues** twice. Between the two playings, you have time to check **numbers, days, places and prices**.', 'À l’oral du DELF A1, vous entendez **trois courts messages ou annonces** et **une série de mini-dialogues** deux fois. Entre les deux écoutes, vérifiez **nombres, jours, lieux et prix**.')),
      hear('Bonjour Léa, c’est Marc. Le cours de natation de ce soir est annulé, la piscine est fermée. On se retrouve vendredi à dix-huit heures quinze devant le cinéma !', b('Where and when does Marc suggest meeting?', 'Où et quand Marc propose-t-il de se retrouver ?'), [b('Friday at 6:15 p.m. in front of the cinema', 'vendredi à 18 h 15 devant le cinéma'), b('tonight at the swimming pool', 'ce soir à la piscine'), b('Friday at 8:15 p.m. at the pool', 'vendredi à 20 h 15 à la piscine'), b('Thursday at 6:15 p.m. at Léa’s place', 'jeudi à 18 h 15 chez Léa')], { voice: 'm' }),
      hear('Chers clients, notre supermarché ferme ses portes dans quinze minutes. Les caisses quatre et cinq restent ouvertes au rez-de-chaussée. Merci et bonne soirée.', b('What should customers do soon?', 'Que doivent faire les clients bientôt ?'), [b('Go to checkouts 4 and 5 on the ground floor', 'Aller aux caisses 4 et 5 au rez-de-chaussée'), b('Wait thirty minutes before paying', 'Attendre trente minutes avant de payer'), b('Go upstairs to checkout 2', 'Monter à l’étage à la caisse 2'), b('Come back tomorrow morning for bread', 'Revenir demain matin pour le pain')], { voice: 'f2' }),
      hear('Allô, ici le cabinet dentaire Saint-Paul. Je confirme votre rendez-vous avec le docteur Moreau jeudi 14 mai à 9 h 30. N’oubliez pas votre carte de santé.', b('What must the patient bring on May 14?', 'Que doit apporter le patient le 14 mai ?'), [b('Their health card', 'Sa carte de santé'), b('A cash deposit', 'Un paiement en espèces'), b('Past X-rays', 'D’anciennes radios'), b('A family member', 'Un membre de sa famille')], { voice: 'f' }),
      pairs(P.match, [['annulé', b('cancelled', 'qui n’a pas lieu')], ['le rez-de-chaussée', b('the ground floor', 'niveau 0')], ['confirmer un rendez-vous', b('to confirm an appointment', 'valider l’heure')], ['dans quinze minutes', b('in fifteen minutes', 'un quart d’heure plus tard')]]),
      dict('Le magasin ferme dans quinze minutes, passez aux caisses quatre et cinq.', { voice: 'f' }),
    ],
    [
      b('Underline question words first: qui, quoi, où, quand, combien.', 'Soulignez d’abord les mots interrogatifs : qui, quoi, où, quand, combien.'),
      b('Listen for negation like « fermé » or « annulé » before choosing a place or time.', 'Attention aux négations comme « fermé » ou « annulé » avant de choisir un lieu ou une heure.'),
      b('Use the second playing to double-check every number.', 'Servez-vous de la seconde écoute pour vérifier chaque chiffre.'),
    ],
    [['une caisse', b('a checkout', 'là où on paie')], ['un cabinet dentaire', b('a dental clinic', 'lieu du dentiste')], ['retrouver quelqu’un', b('to meet up with someone', 'rejoindre')]],
  ),
  lesson(C, 2, ['reading-signs-menus-forms', 'lire-affiches-menus-formulaires'],
    b('Reading: menus, signs and simple notices', 'Lecture : menus, affiches et avis'),
    b('Scan everyday public documents to find prices, opening days and rules quickly.', 'Parcourir vite les documents du quotidien pour repérer tarifs, jours d’ouverture et consignes.'),
    [b('Read menus and daily specials', 'Lire menus et formules du jour'), b('Spot exceptions on schedules', 'Repérer les exceptions sur un horaire'), b('Distinguish included vs extra', 'Distinguer compris et en supplément')],
    13,
    [
      tip(b('Scan by keyword, don’t translate every word', 'Cherchez le mot clé, sans tout traduire'), b('In A1 reading, read **the question**, look for the same category in the text (price → €, schedule → h, days → lundi–dimanche), and verify **before answering**.', 'En lecture A1, lisez **la question**, cherchez la bonne zone du document (prix → €, horaire → h, jours → lundi–dimanche) et vérifiez **avant de cocher**.')),
      doc({ look: 'menu', title: b('Bistro du Parc', 'Bistro du Parc'), text: 'MENU DU MIDI — 16 €\nEntrée + Plat OU Plat + Dessert\n(Boisson non comprise — Café : 2 €)\n\nEntrées : Salade verte · Soupe de carottes\nPlats : Poulet rôti avec frites · Pâtes aux légumes\nDesserts : Tarte aux pommes · Yaourt nature\nServi du lundi au vendredi de 12 h à 14 h 30.' }, b('How much do you pay for the lunch menu plus a coffee?', 'Combien payez-vous pour le menu du midi avec un café ?'), [b('18 euros', '18 euros'), b('16 euros', '16 euros'), b('14 euros', '14 euros'), b('20 euros', '20 euros')]),
      doc({ look: 'notice', title: b('Piscine des Lilas', 'Piscine des Lilas'), text: 'HORAIRES D’ÉTÉ\nOuvert du mardi au dimanche : 9 h – 19 h\nFermé le lundi pour nettoyage.\nTarif adulte : 5 € · Enfant (-12 ans) : 3 €\nBonnet de bain obligatoire dans tous les bassins.' }, b('What is required to swim here?', 'Qu’est-il obligatoire de porter pour nager ici ?'), [b('A swimming cap', 'Un bonnet de bain'), b('Swimming goggles', 'Des lunettes de natation'), b('Sandals', 'Des sandales'), b('A towel on the deck', 'Une serviette sur le bord')]),
      doc({ look: 'notice', title: b('Mairie — Atelier cuisine', 'Mairie — Atelier cuisine'), text: 'COURS DE PÂTISSERIE POUR DÉBUTANTS\nSamedi 10 octobre, de 14 h à 16 h 30\nSalle culturelle, 12 rue Victor-Hugo\nGratuit — Inscription obligatoire avant jeudi soir.\nNombre de places limité à 10 personnes.' }, b('Why do you need to register early?', 'Pourquoi faut-il s’inscrire tôt ?'), [b('Only ten spots are available, before Thursday evening.', 'Il n’y a que dix places, et il faut s’inscrire avant jeudi soir.'), b('The class costs extra after Thursday.', 'Le cours coûte plus cher après jeudi.'), b('It takes place at night.', 'Le cours a lieu la nuit.'), b('You have to bring your own oven.', 'Il faut apporter son propre four.')]),
      sort(b('Where do you look for each detail?', 'Où chercher chaque information ?'), [b('menu / prices', 'menu / tarifs'), b('rules / schedule', 'règles / horaires')], [['boisson non comprise', 0], ['fermé le lundi', 1], ['bonnet obligatoire', 1], ['tarif enfant : 3 €', 0], ['inscription avant jeudi', 1], ['entrée + plat : 16 €', 0]]),
      mc(P.meaning, [b('drinks are not included', 'les boissons ne sont pas incluses'), b('drinks are free', 'les boissons sont gratuites'), b('no drinks are sold', 'on ne vend pas de boissons'), b('only water is extra', 'seule l’eau est payante')], { fr: 'Que signifie « boisson non comprise » sur un menu ?' }),
    ],
    [
      b('Scan numbers (€, h), days and bold rules like « obligatoire » or « gratuit ».', 'Repérez chiffres (€, h), jours et règles en gras comme « obligatoire » ou « gratuit ».'),
      b('Always check whether drinks or extras are included in a fixed menu.', 'Vérifiez toujours si les boissons ou suppléments sont compris dans un menu.'),
      b('Note closed days (« fermé le lundi ») and registration deadlines.', 'Notez les jours de fermeture et dates limites d’inscription.'),
    ],
    [['compris', b('included', 'inclus dans le tarif')], ['obligatoire', b('required, mandatory', 'qu’on doit respecter')], ['limité à', b('limited to', 'maximum')]],
  ),
  lesson(C, 3, ['messages-postcards-dialogues', 'messages-cartes-et-dialogues'],
    b('Messages, emails and short A1 dialogues', 'Messages, courriels et courts dialogues A1'),
    b('Identify sender intent, feelings and next steps in short letters and spoken exchanges.', 'Repérer l’intention, les émotions et la suite attendue dans messages courts et dialogues.'),
    [b('Find who writes and why', 'Trouver qui écrit et pourquoi'), b('Follow a simple request in an email', 'Comprendre une demande simple dans un courriel'), b('Match spoken dialogues to situations', 'Associer un dialogue à sa situation')],
    13,
    [
      doc({ look: 'sms', title: b('Message from Sophie', 'Message de Sophie'), text: 'Salut ! Je viens d’arriver à Lyon sous le soleil ! Mon hôtel est près de la gare, la chambre est calme. Demain matin je visite le musée des Confluences, et je rentre dimanche soir. À lundi au bureau !' }, b('Where is Sophie when she writes this message?', 'Où se trouve Sophie quand elle écrit ce message ?'), [b('At her hotel or in Lyon', 'À Lyon'), b('At the office', 'Au bureau'), b('On her way back home', 'Dans le train du retour'), b('Inside the museum', 'Au musée')]),
      doc({ look: 'email', title: b('Invitation — Pendaison de crémaillère', 'Invitation — Pendaison de crémaillère'), text: 'De : Karim Benali\nObjet : Samedi chez moi !\n\nCoucou tout le monde,\nJ’organise un dîner samedi 22 novembre à 20 h dans mon nouvel appartement (4e étage, code 4829). Apportez seulement quelque chose à boire, je prépare le couscous ! Confirmez-moi avant vendredi.\nKarim' }, b('What does Karim ask his guests to bring?', 'Que demande Karim d’apporter ?'), [b('Something to drink', 'Quelque chose à boire'), b('Dessert', 'Un dessert'), b('Couscous', 'Du couscous'), b('Nothing at all', 'Rien du tout')]),
      hear('— Excusez-moi, je cherche la poste, s’il vous plaît ?\n— C’est tout simple : allez tout droit jusqu’au feu rouge, puis tournez à gauche. La poste est en face de la boulangerie.', b('Where is the post office?', 'Où se trouve la poste ?'), [b('Opposite the bakery, left after the traffic light', 'En face de la boulangerie, à gauche au feu rouge'), b('Right before the bakery', 'À droite avant la boulangerie'), b('Behind the station', 'Derrière la gare'), b('On the right after two bridges', 'À droite après deux ponts')], { voice: 'f' }),
      hear('— Bonjour, vous avez ce pull en bleu, taille M ?\n— Je regarde… Désolée, en M il ne me reste que du gris et du noir. Le bleu arrive mardi prochain.', b('What can the customer buy today in size M?', 'Que peut acheter le client aujourd’hui en taille M ?'), [b('A grey or black sweater', 'Un pull gris ou noir'), b('A blue sweater', 'Un pull bleu'), b('No sweaters are left', 'Il n’y a plus aucun pull'), b('A red coat', 'Un manteau rouge')], { voice: 'f2' }),
      gap(P.complete, 'Je suis ___ Lyon et je ___ dimanche soir. À ___ au bureau !', ['à', 'rentre', 'lundi']),
      pairs(P.match, [['en face de', b('opposite, across from', 'de l’autre côté')], ['pendaison de crémaillère', b('housewarming party', 'fête dans un nouveau logement')], ['tout droit', b('straight ahead', 'sans tourner')], ['il me reste…', b('I still have… left', 'disponible en stock')]]),
    ],
    [
      b('In emails and texts, check the sender’s request (« Apportez… », « Confirmez avant… »).', 'Dans courriels et textos, repérez la demande (« Apportez… », « Confirmez avant… »).'),
      b('In shopping and direction dialogues, listen closely for « désolé, il ne reste que… ».', 'Dans les dialogues en magasin ou dans la rue, écoutez bien « désolé, il ne reste que… ».'),
      b('Notice future plans with present tense (« demain je visite », « je rentre dimanche »).', 'Notez l’emploi du présent pour un programme proche (« demain je visite »).'),
    ],
    [['le feu rouge', b('the traffic light', 'signal lumineux de la rue')], ['confirmer', b('to confirm', 'dire oui ou non')], ['calme', b('quiet', 'sans bruit')]],
  ),
];
