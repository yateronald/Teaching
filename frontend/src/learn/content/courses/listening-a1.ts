// Premières écoutes (A1): short, slow, everyday recordings. The questions are
// shown in the learner's language; the audio is always French.
import { b, type Lesson, type McqStep, type T, type Voice } from '../../types';
import { card } from '../kit';

const hear = (voice: Voice, audio: string, prompt: T, options: T[], explain?: T): McqStep =>
  ({ kind: 'mcq', level: 'A1', voice, audio, listen: true, prompt, options, answer: 0, ...(explain ? { explain } : {}) });

const lessons: Lesson[] = [
  {
    id: 'listening-a1-1',
    slug: { en: 'who-is-speaking', fr: 'qui-parle' },
    title: b('Who is speaking? Names, countries and jobs', 'Qui parle ? Prénoms, pays et métiers'),
    summary: b('Understand people introducing themselves: their name, where they come from, what they do.', 'Comprendre des personnes qui se présentent : leur prénom, leur origine, leur métier.'),
    objectives: [b('Catch a name and a nationality', 'Saisir un prénom et une nationalité'), b('Understand a job and a city', 'Comprendre un métier et une ville'), b('Recognise je, il and elle', 'Reconnaître je, il et elle')],
    minutes: 12,
    steps: [
      card(b('Listen for the anchors', 'Écoutez les mots repères'), b('You do not need every word. In an introduction, three anchors carry the message: **je m’appelle** (name), **je viens de / du** (origin), **je suis** (job). Everything else is detail.', 'Vous n’avez pas besoin de tous les mots. Dans une présentation, trois repères portent le message : **je m’appelle** (prénom), **je viens de / du** (origine), **je suis** (métier). Le reste est du détail.'), {
        examples: [{ fr: 'Je m’appelle Nadia.', tr: 'My name is Nadia.' }, { fr: 'Je viens du Maroc.', tr: 'I come from Morocco.' }, { fr: 'Je suis infirmière.', tr: 'I am a nurse.' }],
      }),
      hear('f', 'Bonjour ! Je m’appelle Nadia. Je viens du Maroc et j’habite à Montréal.', b('Where does Nadia live?', 'Où habite Nadia ?'), [b('In Montréal', 'À Montréal'), b('In Morocco', 'Au Maroc'), b('In Paris', 'À Paris')], b('“Je viens du Maroc” is her origin; “j’habite à Montréal” is where she lives now.', '« Je viens du Maroc » est son origine ; « j’habite à Montréal », c’est là où elle vit maintenant.')),
      hear('m', 'Salut, moi c’est Lucas. Je suis étudiant. J’ai vingt-deux ans.', b('What does Lucas do?', 'Que fait Lucas ?'), [b('He is a student', 'Il est étudiant'), b('He is a teacher', 'Il est professeur'), b('He is a doctor', 'Il est médecin')]),
      hear('f2', 'Voici mon collègue. Il s’appelle Omar. Il est cuisinier dans un restaurant italien.', b('What is Omar’s job?', 'Quel est le métier d’Omar ?'), [b('Cook', 'Cuisinier'), b('Waiter', 'Serveur'), b('Driver', 'Chauffeur')]),
      card(b('Il or elle?', 'Il ou elle ?'), b('**Il** [il] is for a man, **elle** [ɛl] for a woman. The job often changes too: il est **vendeur**, elle est **vendeuse**; il est **étudiant**, elle est **étudiante** (you hear the final t).', '**Il** pour un homme, **elle** pour une femme. Le métier change souvent aussi : il est **vendeur**, elle est **vendeuse** ; il est **étudiant**, elle est **étudiante** (on entend le t final).'), { variant: 'tip' }),
      hear('m2', 'Ma sœur s’appelle Julie. Elle est vendeuse dans un magasin de chaussures.', b('Who is the man talking about?', 'De qui parle l’homme ?'), [b('His sister, a shop assistant', 'Sa sœur, qui est vendeuse'), b('His brother, a shop assistant', 'Son frère, qui est vendeur'), b('His mother, a teacher', 'Sa mère, qui est professeure')]),
      hear('f', 'Je m’appelle Ana, A, N, A. Je viens du Brésil et je parle portugais, anglais et un peu français.', b('How many languages does Ana speak?', 'Combien de langues parle Ana ?'), [b('Three', 'Trois'), b('Two', 'Deux'), b('One', 'Une')]),
      { kind: 'dictation', prompt: b('Write what you hear.', 'Écrivez ce que vous entendez.'), text: 'Je m’appelle Paul.', voice: 'm' },
      { kind: 'speak', prompt: b('Now you: say it aloud.', 'À vous : dites-le à voix haute.'), text: 'Je m’appelle Nadia et je viens du Maroc.', tr: 'My name is Nadia and I come from Morocco.' },
    ],
    notes: {
      points: [
        b('Three anchors: **je m’appelle** (name), **je viens de** (origin), **je suis** (job).', 'Trois repères : **je m’appelle** (prénom), **je viens de** (origine), **je suis** (métier).'),
        b('“J’habite à…” = where you live now; “je viens de…” = where you are from.', '« J’habite à… » = où l’on vit ; « je viens de… » = d’où l’on vient.'),
        b('Il (man) / elle (woman); the job often changes: vendeur / vendeuse.', 'Il (homme) / elle (femme) ; le métier change souvent : vendeur / vendeuse.'),
        b('Do not try to understand every word: catch the anchors.', 'N’essayez pas de tout comprendre : saisissez les repères.'),
      ],
      vocab: [['le collègue', b('colleague', 'personne qui travaille avec vous')], ['le cuisinier', b('cook', 'il prépare les repas')], ['la vendeuse', b('shop assistant', 'elle vend dans un magasin')], ['un peu', b('a little', 'pas beaucoup')]],
    },
  },
  {
    id: 'listening-a1-2',
    slug: { en: 'in-shops-and-cafes', fr: 'au-magasin-et-au-cafe' },
    title: b('In shops and cafés: orders and prices', 'Au magasin et au café : commandes et prix'),
    summary: b('Understand what people order, how much it costs and what the server asks.', 'Comprendre ce que les gens commandent, combien ça coûte et ce que demande le serveur.'),
    objectives: [b('Understand an order', 'Comprendre une commande'), b('Catch a price', 'Saisir un prix'), b('Understand the server’s questions', 'Comprendre les questions du serveur')],
    minutes: 13,
    steps: [
      card(b('The words of a café', 'Les mots du café'), b('A few phrases come back in every café and shop: **Je voudrais…** (I would like), **Ça fait…** (that comes to), **Sur place ou à emporter ?** (eat in or take away?), **Et avec ceci ?** (anything else?).', 'Quelques tournures reviennent dans tous les cafés et magasins : **Je voudrais…**, **Ça fait…**, **Sur place ou à emporter ?**, **Et avec ceci ?**'), {
        examples: [{ fr: 'Je voudrais un café, s’il vous plaît.', tr: 'I would like a coffee, please.' }, { fr: 'Sur place ou à emporter ?', tr: 'Eat in or take away?' }, { fr: 'Ça fait quatre dollars cinquante.', tr: 'That comes to four fifty.' }],
      }),
      hear('m', 'Bonjour ! Je voudrais un café et un croissant, s’il vous plaît.', b('What does the man order?', 'Que commande l’homme ?'), [b('A coffee and a croissant', 'Un café et un croissant'), b('A tea and a croissant', 'Un thé et un croissant'), b('Two coffees', 'Deux cafés')]),
      hear('f2', 'Voilà. Ça fait six dollars vingt-cinq.', b('How much is it?', 'Combien ça coûte ?'), ['6,25 $', '6,05 $', '16,25 $']),
      hear('f', 'C’est sur place ou à emporter ?', b('What does the server want to know?', 'Que veut savoir la serveuse ?'), [b('If you eat here or take it away', 'Si vous mangez ici ou si vous emportez'), b('If you want milk', 'Si vous voulez du lait'), b('How you want to pay', 'Comment vous voulez payer')]),
      hear('m2', 'Deux baguettes et une tarte aux pommes, s’il vous plaît. C’est pour un anniversaire.', b('What does the man buy?', 'Qu’achète l’homme ?'), [b('Two baguettes and an apple tart', 'Deux baguettes et une tarte aux pommes'), b('Two tarts and a baguette', 'Deux tartes et une baguette'), b('Twelve baguettes', 'Douze baguettes')]),
      card(b('Deux or douze?', 'Deux ou douze ?'), b('Close numbers are the classic trap: **deux** (2) / **douze** (12), **trois** (3) / **treize** (13), **six** (6) / **seize** (16). Listen for the **z** sound at the end: dou**ze**, trei**ze**, sei**ze**.', 'Les nombres proches sont le piège classique : **deux** (2) / **douze** (12), **trois** (3) / **treize** (13), **six** (6) / **seize** (16). Écoutez le son **z** à la fin : dou**ze**, trei**ze**, sei**ze**.'), { variant: 'trap' }),
      hear('f', 'Ce pull coûte treize dollars, pas trente !', b('How much is the jumper?', 'Combien coûte le pull ?'), ['13 $', '30 $', '3 $']),
      hear('m', 'Je prends la soupe du jour et une eau minérale. Pas de dessert, merci.', b('What does the man NOT want?', 'Que ne veut PAS l’homme ?'), [b('Dessert', 'Un dessert'), b('Soup', 'La soupe'), b('Water', 'De l’eau')]),
      { kind: 'dictation', prompt: b('Write what you hear.', 'Écrivez ce que vous entendez.'), text: 'Je voudrais un café.', voice: 'f' },
    ],
    notes: {
      points: [
        b('Order: **Je voudrais… / Je prends…**. Price: **Ça fait…**', 'Commander : **Je voudrais… / Je prends…**. Prix : **Ça fait…**'),
        b('**Sur place ou à emporter ?** = eat in or take away?', '**Sur place ou à emporter ?** = manger ici ou partir avec.'),
        b('Close numbers: deux / douze, trois / treize, six / seize (listen for the z).', 'Nombres proches : deux / douze, trois / treize, six / seize (écoutez le z).'),
        b('“Pas de…” tells you what the person does not want.', '« Pas de… » indique ce que la personne ne veut pas.'),
      ],
      vocab: [['sur place', b('eat in', 'manger ici')], ['à emporter', b('take away', 'pour partir avec')], ['la soupe du jour', b('soup of the day', 'la soupe préparée aujourd’hui')], ['l’anniversaire', b('birthday', 'jour de naissance')]],
    },
  },
  {
    id: 'listening-a1-3',
    slug: { en: 'out-and-about', fr: 'en-ville' },
    title: b('Out and about: directions and times', 'En ville : directions et horaires'),
    summary: b('Understand simple directions, opening hours and short announcements.', 'Comprendre des directions simples, des horaires et de courtes annonces.'),
    objectives: [b('Understand left, right and straight on', 'Comprendre à gauche, à droite et tout droit'), b('Catch a time and a day', 'Saisir une heure et un jour'), b('Understand a short announcement', 'Comprendre une courte annonce')],
    minutes: 13,
    steps: [
      card(b('Three directions', 'Trois directions'), b('**À gauche** (left), **à droite** (right), **tout droit** (straight on). Careful: **droite** and **tout droit** sound alike! “Tournez à droite” ends with a **t** sound; “continuez tout droit” does not.', '**À gauche**, **à droite**, **tout droit**. Attention : **droite** et **tout droit** se ressemblent ! « Tournez à droite » se termine par le son **t** ; « continuez tout droit », non.'), {
        examples: [{ fr: 'Tournez à gauche.', tr: 'Turn left.' }, { fr: 'Tournez à droite.', tr: 'Turn right.' }, { fr: 'Continuez tout droit.', tr: 'Go straight on.' }],
      }),
      hear('f2', 'La pharmacie ? Continuez tout droit, puis tournez à gauche. C’est à côté de la banque.', b('Where is the pharmacy?', 'Où est la pharmacie ?'), [b('Straight on, then left, next to the bank', 'Tout droit, puis à gauche, à côté de la banque'), b('Straight on, then right, next to the bank', 'Tout droit, puis à droite, à côté de la banque'), b('On the left, opposite the bank', 'À gauche, en face de la banque')]),
      hear('m', 'Le métro est à cinq minutes à pied. Prenez la première rue à droite.', b('How far is the metro?', 'Le métro est à quelle distance ?'), [b('Five minutes on foot', 'À cinq minutes à pied'), b('Five minutes by bus', 'À cinq minutes en bus'), b('Fifteen minutes on foot', 'À quinze minutes à pied')]),
      hear('f', 'La bibliothèque est ouverte du mardi au samedi, de dix heures à dix-huit heures.', b('When is the library closed?', 'Quand la bibliothèque est-elle fermée ?'), [b('On Sunday and Monday', 'Le dimanche et le lundi'), b('On Saturday', 'Le samedi'), b('On Tuesday', 'Le mardi')], b('Open “du mardi au samedi”: so it is closed on Sunday and Monday.', 'Ouverte « du mardi au samedi » : elle est donc fermée le dimanche et le lundi.')),
      hear('m2', 'Attention, le magasin ferme dans dix minutes. Merci de vous diriger vers les caisses.', b('What is happening?', 'Que se passe-t-il ?'), [b('The shop is closing soon', 'Le magasin ferme bientôt'), b('The shop is opening', 'Le magasin ouvre'), b('There is a sale', 'Il y a des soldes')]),
      hear('f2', 'Le prochain autobus arrive dans trois minutes.', b('When does the bus arrive?', 'Quand arrive l’autobus ?'), [b('In three minutes', 'Dans trois minutes'), b('In thirteen minutes', 'Dans treize minutes'), b('At three o’clock', 'À trois heures')]),
      { kind: 'match', prompt: b('Match each phrase with its meaning.', 'Associez chaque expression à son sens.'), pairs: [['à gauche', b('on the left', 'du côté gauche')], ['à droite', b('on the right', 'du côté droit')], ['tout droit', b('straight on', 'sans tourner')], ['à côté de', b('next to', 'tout près de')], ['en face de', b('opposite', 'de l’autre côté')]] },
      { kind: 'speak', prompt: b('Ask your way aloud.', 'Demandez votre chemin à voix haute.'), text: 'Excusez-moi, où est le métro, s’il vous plaît ?', tr: 'Excuse me, where is the metro, please?' },
    ],
    notes: {
      points: [
        b('**À gauche** (left), **à droite** (right), **tout droit** (straight on).', '**À gauche**, **à droite**, **tout droit**.'),
        b('“Du mardi au samedi” = Tuesday to Saturday (the other days are closed).', '« Du mardi au samedi » : les autres jours, c’est fermé.'),
        b('“Dans trois minutes” = in three minutes; “à trois heures” = at three o’clock.', '« Dans trois minutes » = bientôt ; « à trois heures » = l’heure.'),
        b('Announcements start with “Attention” and often end with “merci de…”.', 'Les annonces commencent par « Attention » et finissent souvent par « merci de… ».'),
      ],
      vocab: [['à pied', b('on foot', 'en marchant')], ['la caisse', b('checkout', 'où l’on paie')], ['prochain', b('next', 'qui vient juste après')], ['ouvert / fermé', b('open / closed', 'on peut entrer / on ne peut pas')]],
    },
  },
];

export default lessons;
