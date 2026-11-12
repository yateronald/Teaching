// « Ma première semaine à Montréal »: an interactive story in five episodes.
// The learner plays Alex, who has just landed. Alex's lines never carry a
// gender mark (no “arrivé(e)”, no “content(e)”), so both voices can say them.
import { b, type Gloss, type T, type Voice } from '../types';

export interface Character { name: string; role: T; voice: Voice }

export const CAST: Record<string, Character> = {
  agent: { name: 'L’agent', role: b('Border services officer', 'Agent des services frontaliers'), voice: 'm2' },
  driver: { name: 'Daniel', role: b('Taxi driver', 'Chauffeur de taxi'), voice: 'm' },
  concierge: { name: 'Mme Tremblay', role: b('Building caretaker', 'Concierge de l’immeuble'), voice: 'f2' },
  karim: { name: 'Karim', role: b('Your neighbour', 'Votre voisin'), voice: 'm' },
  cashier: { name: 'La caissière', role: b('Grocery store cashier', 'Caissière à l’épicerie'), voice: 'f' },
  clerk: { name: 'Le commis', role: b('Grocery store clerk', 'Commis de l’épicerie'), voice: 'm2' },
  stm: { name: 'L’agent du métro', role: b('Metro ticket agent', 'Agent de la station de métro'), voice: 'm2' },
  banker: { name: 'Mme Nguyen', role: b('Bank advisor', 'Conseillère à la banque'), voice: 'f2' },
  sophie: { name: 'Sophie', role: b('Your colleague', 'Votre collègue'), voice: 'f' },
  boss: { name: 'M. Gagnon', role: b('Your manager', 'Votre gestionnaire'), voice: 'm2' },
};

export type Beat =
  /** A new place: picture and narration. */
  | { k: 'scene'; image: string; place: T; text: T }
  /** A character speaks (recorded). */
  | { k: 'say'; who: string; fr: string; tr?: Gloss }
  /** The learner answers: exactly one option is right (the first one here; shuffled on screen). */
  | { k: 'choice'; prompt: T; options: [string, string, string]; why: [T, T]; tr?: Gloss }
  /** A character speaks, the text hidden: did the learner understand? Right option first. */
  | { k: 'listen'; who: string; fr: string; prompt: T; options: [T, T, T]; tr?: Gloss }
  /** The learner builds a sentence from its words. */
  | { k: 'build'; prompt: T; words: string[]; extra?: string[]; tr?: Gloss }
  /** A cultural note. */
  | { k: 'note'; title: T; text: T };

export interface Episode { id: string; title: T; summary: T; image: string; beats: Beat[] }

const tooFamiliar = b('Too familiar: with someone you do not know, say “bonjour” and use “vous”.', 'Trop familier : avec une personne inconnue, on dit « bonjour » et on vouvoie.');

export const EPISODES: Episode[] = [
  // ── 1. L’arrivée ──
  {
    id: 'ep1',
    title: b('Episode 1 · The arrival', 'Épisode 1 · L’arrivée'),
    summary: b('Passport control, then a taxi through the snow to your new street.', 'Le contrôle des passeports, puis un taxi sous la neige jusqu’à votre nouvelle rue.'),
    image: 'story-airport',
    beats: [
      { k: 'scene', image: 'story-airport', place: b('Montréal-Trudeau Airport', 'Aéroport Montréal-Trudeau'), text: b('Your plane has just landed. After eight hours of flight, you reach passport control. Your new life in Québec starts here.', 'Votre avion vient d’atterrir. Après huit heures de vol, vous arrivez au contrôle des passeports. Votre nouvelle vie au Québec commence ici.') },
      { k: 'say', who: 'agent', fr: 'Bonjour ! Votre passeport, s’il vous plaît.', tr: 'Hello! Your passport, please.' },
      { k: 'choice', prompt: b('You hand over your passport. What do you say?', 'Vous tendez votre passeport. Que dites-vous ?'), options: ['Bonjour. Voici mon passeport.', 'Salut ! Tiens, mon passeport.', 'Bonne nuit. Mon passeport.'], why: [tooFamiliar, b('“Bonne nuit” is only said before going to bed.', '« Bonne nuit » se dit seulement avant d’aller dormir.')], tr: 'Hello. Here is my passport.' },
      { k: 'listen', who: 'agent', fr: 'Merci. Quel est le but de votre séjour au Canada ?', prompt: b('What does the officer want to know?', 'Que veut savoir l’agent ?'), options: [b('Why you are coming to Canada', 'Pourquoi vous venez au Canada'), b('How long your flight was', 'Combien de temps a duré votre vol'), b('Where your luggage is', 'Où sont vos bagages')], tr: 'Thank you. What is the purpose of your stay in Canada?' },
      { k: 'choice', prompt: b('Answer the officer.', 'Répondez à l’agent.'), options: ['Je viens m’installer ici pour travailler.', 'Je venir ici pour travail.', 'Parce que oui.'], why: [b('The verb must be conjugated: je viens, and “pour travailler”.', 'Le verbe doit être conjugué : je viens, et « pour travailler ».'), b('Too vague, and not polite with an officer: give a real reason.', 'Trop vague, et peu poli avec un agent : donnez une vraie raison.')], tr: 'I am coming to settle here and work.' },
      { k: 'say', who: 'agent', fr: 'Très bien. Bienvenue au Canada, et bonne installation !', tr: 'Very good. Welcome to Canada, and good luck settling in!' },
      { k: 'scene', image: 'story-taxi', place: b('Outside the airport', 'À la sortie de l’aéroport'), text: b('You walk out with your two suitcases. It is minus ten, and it is snowing. A taxi stops in front of you.', 'Vous sortez avec vos deux valises. Il fait moins dix et il neige. Un taxi s’arrête devant vous.') },
      { k: 'say', who: 'driver', fr: 'Bonjour ! Vous allez où ?', tr: 'Hello! Where are you going?' },
      { k: 'build', prompt: b('Tell the driver where you are going.', 'Dites au chauffeur où vous allez.'), words: ['Je', 'vais', 'rue', 'Saint-Denis,', 's’il', 'vous', 'plaît.'], extra: ['suis', 'à la'], tr: 'I am going to Saint-Denis Street, please.' },
      { k: 'listen', who: 'driver', fr: 'Parfait. Avec la neige, ça va prendre environ quarante minutes.', prompt: b('How long will the ride take?', 'Combien de temps va durer le trajet ?'), options: [b('About 40 minutes', 'Environ 40 minutes'), b('About 14 minutes', 'Environ 14 minutes'), b('About 4 hours', 'Environ 4 heures')], tr: 'Perfect. With the snow, it will take about forty minutes.' },
      { k: 'note', title: b('Good to know', 'Bon à savoir'), text: b('In Québec, people often say **“Bienvenue !”** to answer “Merci”. It means “You’re welcome”, not “Welcome”.', 'Au Québec, on répond souvent **« Bienvenue ! »** à « Merci ». Cela veut dire « De rien ».') },
      { k: 'say', who: 'driver', fr: 'Voilà, on est arrivés. Ça fait cinquante-deux dollars.', tr: 'Here we are. That’s fifty-two dollars.' },
      { k: 'choice', prompt: b('You pay the driver. What do you say?', 'Vous payez le chauffeur. Que dites-vous ?'), options: ['Voilà. Merci beaucoup, bonne soirée !', 'Voilà. Merci, bon appétit !', 'C’est cher. Au revoir.'], why: [b('“Bon appétit” is said before a meal, not when leaving a taxi.', '« Bon appétit » se dit avant un repas, pas en quittant un taxi.'), b('A little abrupt: thank the driver and wish him a good evening.', 'Un peu sec : remerciez le chauffeur et souhaitez-lui une bonne soirée.')], tr: 'Here you are. Thank you very much, have a good evening!' },
      { k: 'say', who: 'driver', fr: 'Bienvenue ! Bonne soirée, et bon courage avec la neige !', tr: 'You’re welcome! Good evening, and good luck with the snow!' },
    ],
  },

  // ── 2. L’appartement ──
  {
    id: 'ep2',
    title: b('Episode 2 · The apartment', 'Épisode 2 · L’appartement'),
    summary: b('You get your keys from the caretaker and meet your neighbour.', 'Vous récupérez vos clés auprès de la concierge et rencontrez votre voisin.'),
    image: 'story-apartment',
    beats: [
      { k: 'scene', image: 'story-apartment', place: b('Saint-Denis Street, 7 p.m.', 'Rue Saint-Denis, 19 h'), text: b('A brick building with an outside staircase covered in snow. You ring the bell marked “Concierge”.', 'Un immeuble en briques, avec un escalier extérieur couvert de neige. Vous sonnez à la porte marquée « Concierge ».') },
      { k: 'say', who: 'concierge', fr: 'Oui, bonsoir ! C’est pour quoi ?', tr: 'Yes, good evening! What is it about?' },
      { k: 'choice', prompt: b('Introduce yourself.', 'Présentez-vous.'), options: ['Bonsoir, madame. Je m’appelle Alex, je viens pour l’appartement numéro six.', 'Salut ! C’est moi, Alex. Donne-moi les clés.', 'Bonsoir. Je suis l’appartement six.'], why: [tooFamiliar, b('“Je suis l’appartement” means “I am the apartment”. Say: je viens pour l’appartement.', '« Je suis l’appartement » n’a pas de sens. Dites : je viens pour l’appartement.')], tr: 'Good evening, madam. My name is Alex, I am here for apartment number six.' },
      { k: 'say', who: 'concierge', fr: 'Ah, c’est vous ! Bienvenue. Entrez, il fait froid dehors.', tr: 'Ah, it’s you! Welcome. Come in, it’s cold outside.' },
      { k: 'listen', who: 'concierge', fr: 'Voici vos clés. La grande, c’est pour la porte d’entrée. La petite, c’est pour la boîte aux lettres.', prompt: b('What is the small key for?', 'À quoi sert la petite clé ?'), options: [b('The mailbox', 'La boîte aux lettres'), b('The front door', 'La porte d’entrée'), b('The garage', 'Le garage')], tr: 'Here are your keys. The big one is for the front door. The small one is for the mailbox.' },
      { k: 'build', prompt: b('Ask where the laundry room is.', 'Demandez où se trouve la buanderie.'), words: ['Excusez-moi,', 'où', 'est', 'la', 'buanderie', '?'], extra: ['le', 'quand'], tr: 'Excuse me, where is the laundry room?' },
      { k: 'say', who: 'concierge', fr: 'Au sous-sol, à côté de l’ascenseur. Elle est ouverte de huit heures à vingt-deux heures.', tr: 'In the basement, next to the lift. It is open from 8 a.m. to 10 p.m.' },
      { k: 'note', title: b('Good to know', 'Bon à savoir'), text: b('In Québec, an apartment is described by its number of rooms: a **3 ½** has a bedroom, a living room, a kitchen, and the bathroom is the “½”. A **4 ½** has two bedrooms.', 'Au Québec, on décrit un logement par son nombre de pièces : un **3 ½** a une chambre, un salon et une cuisine, et la salle de bains compte pour « ½ ». Un **4 ½** a deux chambres.') },
      { k: 'scene', image: 'story-neighbor', place: b('Third floor', 'Troisième étage'), text: b('You carry your suitcases up. In front of the next door, a man is looking for his keys with a bag of groceries in his arms.', 'Vous montez vos valises. Devant la porte voisine, un homme cherche ses clés, un sac d’épicerie dans les bras.') },
      { k: 'say', who: 'karim', fr: 'Bonsoir ! Vous êtes la nouvelle personne du six ? Moi, c’est Karim.', tr: 'Good evening! Are you the new person in number six? I’m Karim.' },
      { k: 'choice', prompt: b('Answer your neighbour.', 'Répondez à votre voisin.'), options: ['Bonsoir, Karim. Moi, c’est Alex. C’est un plaisir de vous rencontrer.', 'Bonsoir. Je suis Karim aussi.', 'Oui.'], why: [b('You are Alex! Give your own name.', 'Vous êtes Alex ! Donnez votre propre prénom.'), b('One word is a little cold for a first meeting: introduce yourself.', 'Un seul mot, c’est un peu froid pour une première rencontre : présentez-vous.')], tr: 'Good evening, Karim. I’m Alex. It’s a pleasure to meet you.' },
      { k: 'listen', who: 'karim', fr: 'On peut se tutoyer, non ? Si tu as besoin de quelque chose, frappe à ma porte !', prompt: b('What does Karim suggest?', 'Que propose Karim ?'), options: [b('To use “tu” with each other', 'De se dire « tu »'), b('To have dinner tonight', 'De dîner ensemble ce soir'), b('To carry your suitcases', 'De porter vos valises')], tr: 'We can say “tu” to each other, right? If you need anything, knock on my door!' },
      { k: 'choice', prompt: b('Karim now says “tu”. Thank him the same way.', 'Karim vous tutoie maintenant. Remerciez-le de la même façon.'), options: ['Avec plaisir ! Merci, tu es très gentil.', 'Merci, vous êtes très gentil, monsieur.', 'Merci, je suis très gentil.'], why: [b('He offered “tu”: keeping “vous” and “monsieur” now sounds distant.', 'Il vous a proposé le « tu » : garder « vous » et « monsieur » paraît distant.'), b('“Je suis très gentil” means you are praising yourself!', '« Je suis très gentil » : vous vous faites un compliment à vous-même !')], tr: 'With pleasure! Thank you, you are very kind.' },
      { k: 'say', who: 'karim', fr: 'De rien ! Bonne nuit, et bienvenue dans l’immeuble !', tr: 'You’re welcome! Good night, and welcome to the building!' },
    ],
  },

  // ── 3. L’épicerie ──
  {
    id: 'ep3',
    title: b('Episode 3 · The grocery store', 'Épisode 3 · L’épicerie'),
    summary: b('Your fridge is empty. You find what you need and pay at the checkout.', 'Votre frigo est vide. Vous trouvez ce qu’il vous faut et vous passez à la caisse.'),
    image: 'story-grocery',
    beats: [
      { k: 'scene', image: 'story-grocery', place: b('The corner grocery store', 'L’épicerie du coin'), text: b('First morning. Your fridge is empty. You walk to the grocery store at the end of the street with a short list: bread, milk, eggs, apples.', 'Premier matin. Votre frigo est vide. Vous marchez jusqu’à l’épicerie au bout de la rue avec une courte liste : du pain, du lait, des œufs, des pommes.') },
      { k: 'build', prompt: b('You cannot find the eggs. Ask a clerk.', 'Vous ne trouvez pas les œufs. Demandez à un commis.'), words: ['Bonjour,', 'où', 'sont', 'les', 'œufs,', 's’il', 'vous', 'plaît', '?'], extra: ['est', 'des'], tr: 'Hello, where are the eggs, please?' },
      { k: 'listen', who: 'clerk', fr: 'Les œufs ? Dans la troisième allée, à gauche, juste à côté du lait.', prompt: b('Where are the eggs?', 'Où sont les œufs ?'), options: [b('Aisle 3, on the left, next to the milk', 'Allée 3, à gauche, à côté du lait'), b('Aisle 3, on the right, next to the bread', 'Allée 3, à droite, à côté du pain'), b('Aisle 13, at the back', 'Allée 13, au fond')], tr: 'The eggs? In the third aisle, on the left, right next to the milk.' },
      { k: 'choice', prompt: b('At the bakery counter, ask for bread.', 'Au comptoir de la boulangerie, demandez du pain.'), options: ['Bonjour, je voudrais une baguette, s’il vous plaît.', 'Je veux une baguette.', 'Bonjour, je voudrais un baguette de pain, merci au revoir.'], why: [b('“Je veux” sounds like an order. “Je voudrais… s’il vous plaît” is the polite form.', '« Je veux » sonne comme un ordre. « Je voudrais… s’il vous plaît » est la forme polie.'), b('It is “une baguette” (feminine), and you say goodbye after you are served.', 'On dit « une baguette » (féminin), et on dit au revoir après avoir été servi.')], tr: 'Hello, I would like a baguette, please.' },
      { k: 'note', title: b('Good to know', 'Bon à savoir'), text: b('In Québec, the small shop open late is called **le dépanneur**, the weekend is **la fin de semaine**, and shopping is **magasiner**.', 'Au Québec, le petit magasin ouvert tard s’appelle **le dépanneur**, le week-end se dit **la fin de semaine**, et faire les magasins se dit **magasiner**.') },
      { k: 'scene', image: 'story-checkout', place: b('At the checkout', 'À la caisse'), text: b('Your basket is full. It is your turn at the checkout.', 'Votre panier est plein. C’est votre tour à la caisse.') },
      { k: 'say', who: 'cashier', fr: 'Bonjour ! Vous avez besoin d’un sac ?', tr: 'Hello! Do you need a bag?' },
      { k: 'choice', prompt: b('You brought your own bag.', 'Vous avez apporté votre sac.'), options: ['Non merci, j’ai mon sac.', 'Non, je ne suis pas un sac.', 'Oui, j’ai mon sac, donnez-moi un sac.'], why: [b('“Je ne suis pas un sac” means “I am not a bag”. Use avoir: j’ai mon sac.', '« Je ne suis pas un sac » n’a pas de sens. Utilisez avoir : j’ai mon sac.'), b('That is contradictory: if you have your bag, say “non merci”.', 'C’est contradictoire : si vous avez votre sac, dites « non merci ».')], tr: 'No thank you, I have my bag.' },
      { k: 'listen', who: 'cashier', fr: 'Alors, ça fait dix-huit dollars et soixante-quinze.', prompt: b('How much is it?', 'Combien ça coûte ?'), options: ['18,75 $', '18,65 $', '8,75 $'], tr: 'So, that comes to eighteen dollars seventy-five.' },
      { k: 'say', who: 'cashier', fr: 'Vous payez comment ? Par carte ou en argent comptant ?', tr: 'How are you paying? By card or cash?' },
      { k: 'build', prompt: b('You pay by card.', 'Vous payez par carte.'), words: ['Je', 'vais', 'payer', 'par', 'carte.'], extra: ['en', 'suis'], tr: 'I am going to pay by card.' },
      { k: 'say', who: 'cashier', fr: 'C’est passé. Voici votre reçu. Bonne journée !', tr: 'It went through. Here is your receipt. Have a nice day!' },
      { k: 'choice', prompt: b('Say goodbye.', 'Prenez congé.'), options: ['Merci, bonne journée à vous aussi !', 'Merci, bonne nuit !', 'Bonjour !'], why: [b('It is morning: “bonne nuit” is for bedtime.', 'C’est le matin : « bonne nuit » se dit au moment d’aller dormir.'), b('“Bonjour” is for arriving. When you leave: bonne journée, au revoir.', '« Bonjour » se dit en arrivant. En partant : bonne journée, au revoir.')], tr: 'Thank you, have a nice day too!' },
    ],
  },

  // ── 4. Le métro et la banque ──
  {
    id: 'ep4',
    title: b('Episode 4 · The metro and the bank', 'Épisode 4 · Le métro et la banque'),
    summary: b('You take the metro for the first time and open your bank account.', 'Vous prenez le métro pour la première fois et ouvrez votre compte en banque.'),
    image: 'story-metro',
    beats: [
      { k: 'scene', image: 'story-metro', place: b('Mont-Royal metro station', 'Station de métro Mont-Royal'), text: b('You have an appointment at the bank downtown at 10 a.m. First challenge: the metro. You go to the ticket booth.', 'Vous avez rendez-vous à la banque, au centre-ville, à 10 h. Premier défi : le métro. Vous allez au guichet.') },
      { k: 'choice', prompt: b('Ask for a ticket.', 'Demandez un billet.'), options: ['Bonjour, je voudrais un billet pour le centre-ville, s’il vous plaît.', 'Un billet. Vite.', 'Bonjour, je voudrais un billet de centre-ville à moi.'], why: [b('Without “bonjour” or “s’il vous plaît”, this sounds rude.', 'Sans « bonjour » ni « s’il vous plaît », c’est impoli.'), b('The structure is “un billet pour” + the destination.', 'La structure est « un billet pour » + la destination.')], tr: 'Hello, I would like a ticket to downtown, please.' },
      { k: 'listen', who: 'stm', fr: 'Prenez la ligne orange, direction Côte-Vertu, et descendez à la station Bonaventure.', prompt: b('Where do you get off?', 'À quelle station descendez-vous ?'), options: ['Bonaventure', 'Côte-Vertu', 'Mont-Royal'], tr: 'Take the orange line towards Côte-Vertu, and get off at Bonaventure station.' },
      { k: 'build', prompt: b('Check that you understood: ask if it is direct.', 'Vérifiez que vous avez compris : demandez si c’est direct.'), words: ['C’est', 'direct,', 'ou', 'je', 'dois', 'changer', 'de', 'ligne', '?'], extra: ['du', 'devoir'], tr: 'Is it direct, or do I have to change lines?' },
      { k: 'say', who: 'stm', fr: 'C’est direct. Six stations, environ douze minutes. Bonne journée !', tr: 'It’s direct. Six stops, about twelve minutes. Have a nice day!' },
      { k: 'scene', image: 'story-bank', place: b('At the bank, downtown', 'À la banque, au centre-ville'), text: b('10 a.m. sharp. An advisor welcomes you into her office.', '10 h précises. Une conseillère vous accueille dans son bureau.') },
      { k: 'say', who: 'banker', fr: 'Bonjour ! Asseyez-vous, je vous en prie. Que puis-je faire pour vous ?', tr: 'Hello! Please, have a seat. What can I do for you?' },
      { k: 'choice', prompt: b('Explain why you came.', 'Expliquez pourquoi vous êtes là.'), options: ['Bonjour, madame. Je voudrais ouvrir un compte, s’il vous plaît.', 'Je veux de l’argent.', 'Bonjour. Je voudrais ouvrir une fenêtre.'], why: [b('Oops: that sounds like a hold-up! You want to open an account.', 'Aïe : on dirait un braquage ! Vous voulez ouvrir un compte.'), b('“Une fenêtre” is a window. At the bank, you open “un compte”.', 'On ouvre une fenêtre à la maison. À la banque, on ouvre « un compte ».')], tr: 'Hello, madam. I would like to open an account, please.' },
      { k: 'listen', who: 'banker', fr: 'Bien sûr. J’ai besoin d’une pièce d’identité et d’une preuve d’adresse, par exemple votre bail.', prompt: b('What does the advisor need?', 'De quoi la conseillère a-t-elle besoin ?'), options: [b('An ID and a proof of address', 'Une pièce d’identité et une preuve d’adresse'), b('A photo and a cheque', 'Une photo et un chèque'), b('Your work contract', 'Votre contrat de travail')], tr: 'Of course. I need a piece of ID and a proof of address, for example your lease.' },
      { k: 'choice', prompt: b('You have both documents. Give them.', 'Vous avez les deux documents. Donnez-les.'), options: ['Voici mon passeport et mon bail.', 'Voici mon passeport et ma balle.', 'Je n’ai rien, mais ouvrez le compte.'], why: [b('“Une balle” is a ball! The lease is “le bail”.', '« Une balle », c’est pour jouer ! Le contrat de location, c’est « le bail ».'), b('The bank cannot open an account without documents.', 'La banque ne peut pas ouvrir de compte sans documents.')], tr: 'Here are my passport and my lease.' },
      { k: 'note', title: b('Good to know', 'Bon à savoir'), text: b('In Canada, a cash machine is **un guichet automatique**, and you pay **par débit** (your bank card) or **par crédit**. “Cash” is **argent comptant**.', 'Au Canada, le distributeur de billets s’appelle **un guichet automatique**, et l’on paie **par débit** (carte bancaire) ou **par crédit**. Les espèces se disent **argent comptant**.') },
      { k: 'say', who: 'banker', fr: 'Parfait. Votre compte est ouvert. Vous recevrez votre carte par la poste dans cinq jours.', tr: 'Perfect. Your account is open. You will receive your card by mail in five days.' },
      { k: 'build', prompt: b('Thank her and say goodbye.', 'Remerciez-la et prenez congé.'), words: ['Merci', 'beaucoup', 'pour', 'votre', 'aide.', 'Au', 'revoir', '!'], extra: ['ton', 'bonjour'], tr: 'Thank you very much for your help. Goodbye!' },
    ],
  },

  // ── 5. Le premier jour de travail ──
  {
    id: 'ep5',
    title: b('Episode 5 · First day at work', 'Épisode 5 · Le premier jour de travail'),
    summary: b('You meet your manager and your team, and get your first invitation.', 'Vous rencontrez votre gestionnaire et votre équipe, et recevez votre première invitation.'),
    image: 'story-office',
    beats: [
      { k: 'scene', image: 'story-office', place: b('Monday, 8:55 a.m.', 'Lundi, 8 h 55'), text: b('Your first day. You arrive five minutes early at the office. Your manager is waiting for you at reception.', 'Votre premier jour. Vous arrivez au bureau avec cinq minutes d’avance. Votre gestionnaire vous attend à l’accueil.') },
      { k: 'say', who: 'boss', fr: 'Bonjour, Alex ! Bienvenue dans l’équipe. Vous avez trouvé facilement ?', tr: 'Hello, Alex! Welcome to the team. Did you find the place easily?' },
      { k: 'choice', prompt: b('Answer your manager.', 'Répondez à votre gestionnaire.'), options: ['Bonjour, monsieur Gagnon. Oui, très facilement, merci.', 'Salut, Gagnon ! Ouais, facile.', 'Bonjour. Non, je n’ai pas trouvé.'], why: [b('Far too familiar for a first day with your manager.', 'Beaucoup trop familier pour un premier jour avec votre gestionnaire.'), b('You are standing in the office: you did find it!', 'Vous êtes dans le bureau : vous avez bien trouvé !')], tr: 'Hello, Mr Gagnon. Yes, very easily, thank you.' },
      { k: 'listen', who: 'boss', fr: 'Parfait. Ce matin, vous avez une formation avec Sophie. Cet après-midi, réunion d’équipe à quatorze heures.', prompt: b('What happens at 2 p.m.?', 'Que se passe-t-il à 14 h ?'), options: [b('A team meeting', 'Une réunion d’équipe'), b('Training with Sophie', 'Une formation avec Sophie'), b('Lunch with the manager', 'Un dîner avec le gestionnaire')], tr: 'Perfect. This morning you have training with Sophie. This afternoon, team meeting at 2 p.m.' },
      { k: 'say', who: 'sophie', fr: 'Salut ! Moi, c’est Sophie. Ici, tout le monde se tutoie. Tu veux un café avant de commencer ?', tr: 'Hi! I’m Sophie. Everybody says “tu” here. Do you want a coffee before we start?' },
      { k: 'choice', prompt: b('Accept the coffee.', 'Acceptez le café.'), options: ['Salut, Sophie ! Oui, avec plaisir, merci.', 'Bonjour, madame. Non, je déteste le café.', 'Oui, je veux bien café, toi merci.'], why: [b('She said “tu” and was friendly: “madame” is too distant, and the refusal is abrupt.', 'Elle vous tutoie et vous accueille : « madame » est trop distant, et le refus est sec.'), b('The word order is wrong. Say: oui, avec plaisir, merci.', 'L’ordre des mots est incorrect. Dites : oui, avec plaisir, merci.')], tr: 'Hi, Sophie! Yes, with pleasure, thank you.' },
      { k: 'scene', image: 'story-cafe', place: b('The kitchen, coffee break', 'La cuisinette, à la pause'), text: b('Sophie makes two coffees and introduces you to the others. Everyone wants to know where you come from.', 'Sophie prépare deux cafés et vous présente aux autres. Tout le monde veut savoir d’où vous venez.') },
      { k: 'say', who: 'sophie', fr: 'Alors, tu es à Montréal depuis quand ?', tr: 'So, how long have you been in Montréal?' },
      { k: 'build', prompt: b('You arrived one week ago.', 'Vous êtes à Montréal depuis une semaine.'), words: ['Je', 'suis', 'ici', 'depuis', 'une', 'semaine.'], extra: ['pendant', 'il y a'], tr: 'I have been here for a week.' },
      { k: 'note', title: b('Good to know', 'Bon à savoir'), text: b('**Depuis** is used for something that started in the past and is still going on: je suis ici **depuis** une semaine. In Québec, the midday meal is **le dîner** and the evening meal **le souper**.', '**Depuis** s’emploie pour une situation commencée dans le passé et qui continue : je suis ici **depuis** une semaine. Au Québec, le repas de midi est **le dîner** et celui du soir **le souper**.') },
      { k: 'listen', who: 'sophie', fr: 'Vendredi, on va prendre un verre après le travail avec l’équipe. Ça te tente de venir ?', prompt: b('What is Sophie doing?', 'Que fait Sophie ?'), options: [b('She invites you for a drink on Friday', 'Elle vous invite à prendre un verre vendredi'), b('She asks you to work on Friday evening', 'Elle vous demande de travailler vendredi soir'), b('She offers you a glass of water', 'Elle vous offre un verre d’eau')], tr: 'On Friday, we are going for a drink after work with the team. Do you feel like coming?' },
      { k: 'choice', prompt: b('Accept the invitation.', 'Acceptez l’invitation.'), options: ['Oui, avec plaisir ! C’est une très bonne idée.', 'Non.', 'Oui, je tente un verre le travail.'], why: [b('A bare “non” closes the door. And you would like to go!', 'Un simple « non » ferme la porte. Et vous avez envie d’y aller !'), b('This sentence does not mean anything. Say: oui, avec plaisir !', 'Cette phrase ne veut rien dire. Dites : oui, avec plaisir !')], tr: 'Yes, with pleasure! That is a very good idea.' },
      { k: 'say', who: 'sophie', fr: 'Super ! Tu vas voir, tu vas te plaire ici. Bienvenue à Montréal, Alex !', tr: 'Great! You’ll see, you are going to like it here. Welcome to Montréal, Alex!' },
    ],
  },
];

/** The learner's lines of an episode (recorded in both voices). */
export function playerLines(ep: Episode): string[] {
  return ep.beats.flatMap(bt => (bt.k === 'choice' ? [bt.options[0]] : bt.k === 'build' ? [bt.words.join(' ')] : []));
}
