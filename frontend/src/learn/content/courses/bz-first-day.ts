import type { CourseAbout } from '../../types';
import { b, card, culture, dlg, gap, hear, lesson, mc, ord, P, pairs, say, sort } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Your first day in a French-speaking workplace: you introduce yourself to colleagues, discover the premises, receive your badge and computer access, and learn the unwritten rules (bonjour to everyone, the coffee break, tu or vous). This course prepares you for each moment of that day with the phrases you need and the cultural codes that make a good first impression in France and Québec.',
    'Votre premier jour dans un milieu de travail francophone : vous vous présentez aux collègues, découvrez les locaux, recevez votre badge et vos accès informatiques, et apprenez les règles non écrites (dire bonjour à tout le monde, la pause café, tu ou vous). Ce cours vous prépare à chaque moment de cette journée avec les phrases utiles et les codes culturels qui font bonne impression en France et au Québec.',
  ),
  outcomes: [
    b('Introduce yourself professionally', 'Se présenter de façon professionnelle'),
    b('Understand a tour of the premises', 'Comprendre une visite des locaux'),
    b('Ask practical questions', 'Poser des questions pratiques'),
    b('Follow workplace etiquette', 'Respecter les codes du milieu de travail'),
  ],
};

const C = 'bz-first-day';
export default [
  lesson(C, 1, ['introducing-yourself-at-work', 'se-presenter-au-travail'],
    b('Introducing yourself at work', 'Se présenter au travail'),
    b('Say who you are, your role and your team in a few clear sentences.', 'Dire qui vous êtes, votre poste et votre équipe en quelques phrases claires.'),
    [b('Give name, job and team', 'Donner nom, poste et équipe'), b('Say where you come from professionally', 'Dire d’où vous venez professionnellement'), b('React to introductions', 'Réagir aux présentations')],
    13,
    [
      card(b('A short introduction', 'Une courte présentation'), b('**Bonjour, je m’appelle Aïcha Benali, je suis la nouvelle assistante commerciale.** · **Je viens de rejoindre l’équipe de Marc.** · **Avant, je travaillais dans une agence de voyages.** Answer: **Bienvenue ! Enchanté(e). Si tu as besoin de quoi que ce soit, je suis au bureau d’à côté.**', '**Bonjour, je m’appelle Aïcha Benali, je suis la nouvelle assistante commerciale.** · **Je viens de rejoindre l’équipe de Marc.** · **Avant, je travaillais dans une agence de voyages.** Réponse : **Bienvenue ! Enchanté(e). Si tu as besoin de quoi que ce soit, je suis au bureau d’à côté.**'), {
        ex: [['Je suis le nouveau comptable, je viens de rejoindre le service financier.', 'I’m the new accountant, I’ve just joined the finance department.'], ['Bienvenue parmi nous !', 'Welcome aboard!']],
      }),
      mc(P.best, ['Bonjour, je suis Lucas Martin, le nouveau technicien. Je rejoins l’équipe maintenance.', 'Salut, c’est moi, Lucas.', 'Je suis là. C’est où mon bureau ?', 'Bonjour, vous êtes qui ?'], { fr: 'Vous vous présentez à la réunion d’équipe :' }),
      ord(P.order, 'Je viens de rejoindre l’équipe marketing.', { tr: 'I’ve just joined the marketing team.' }),
      dlg(b('At the coffee machine', 'À la machine à café'), undefined, [['Sophie', 'f'], ['Vous', 'm']], [
        [0, 'Bonjour ! Tu es nouveau, non ?', 'Hello! You’re new, aren’t you?'],
        [1, { options: ['Oui, je suis Karim, le nouveau développeur. Je commence aujourd’hui.', 'Oui. Au revoir.', 'Pourquoi ?'] }],
        [0, 'Bienvenue ! Moi, c’est Sophie, je suis à la compta. Tu travailles avec qui ?', 'Welcome! I’m Sophie, I’m in accounting. Who are you working with?'],
        [1, { options: ['Avec l’équipe de Julien, au deuxième étage. Enchanté !', 'Je ne sais pas, je suis perdu, c’est nul.', 'Avec personne.'] }],
      ]),
      pairs(P.match, [['rejoindre', b('to join', 'intégrer')], ['un poste', b('a position, a job', 'emploi')], ['un service', b('a department', 'partie de l’entreprise')], ['Bienvenue parmi nous !', b('Welcome aboard!', 'accueil')]]),
      say('Bonjour à tous, je suis Aïcha, la nouvelle assistante commerciale. Je suis ravie de vous rejoindre !', 'Hello everyone, I’m Aïcha, the new sales assistant. I’m delighted to join you!'),
    ],
    [
      b('Name + role + team: Je suis…, le/la nouveau/nouvelle…', 'Nom + poste + équipe : Je suis…, le/la nouveau/nouvelle…'),
      b('Je viens de rejoindre… · Avant, je travaillais…', 'Je viens de rejoindre… · Avant, je travaillais…'),
      b('Reply: Bienvenue ! Enchanté(e) !', 'Réponse : Bienvenue ! Enchanté(e) !'),
    ],
    [['la compta', b('accounting (informal)', 'la comptabilité')], ['un étage', b('a floor', 'niveau d’un bâtiment')], ['un développeur', b('a developer', 'programmeur')]],
  ),
  lesson(C, 2, ['the-tour-and-practical-questions', 'la-visite-et-les-questions-pratiques'],
    b('The tour and practical questions', 'La visite et les questions pratiques'),
    b('Understand a tour of the premises and ask about badge, computer and schedules.', 'Comprendre une visite des locaux et poser des questions sur badge, ordinateur et horaires.'),
    [b('Understand directions in a building', 'Comprendre les indications dans un bâtiment'), b('Ask for access and equipment', 'Demander accès et matériel'), b('Ask about schedules and breaks', 'Demander les horaires et les pauses')],
    13,
    [
      card(b('Practical questions', 'Questions pratiques'), b('**Où se trouve la salle de réunion ? · Où est-ce qu’on peut déjeuner ? · À qui dois-je m’adresser pour mon badge / mes accès informatiques ? · Quels sont les horaires ? · Il y a une cantine ou des tickets-restaurant ?** Places: **l’accueil, la salle de pause, l’open space, les toilettes, le service informatique, la photocopieuse**.', '**Où se trouve la salle de réunion ? · Où est-ce qu’on peut déjeuner ? · À qui dois-je m’adresser pour mon badge / mes accès informatiques ? · Quels sont les horaires ? · Il y a une cantine ou des tickets-restaurant ?** Lieux : **l’accueil, la salle de pause, l’open space, les toilettes, le service informatique, la photocopieuse**.')),
      hear('Alors, ici, c’est l’open space. La salle de pause est au fond du couloir, à gauche. Pour ton badge, il faut passer à l’accueil, au rez-de-chaussée. Et le service informatique te donnera ton mot de passe cet après-midi.', b('Where do you get your badge?', 'Où récupère-t-on son badge ?'), [b('at reception, on the ground floor', 'à l’accueil, au rez-de-chaussée'), b('at the IT department', 'au service informatique'), b('in the break room', 'dans la salle de pause'), b('from your manager', 'auprès de son responsable')], { voice: 'f' }),
      mc(P.best, ['Excusez-moi, à qui dois-je m’adresser pour mes accès informatiques ?', 'Donnez-moi un ordinateur.', 'Mon ordinateur, il est où ?', 'L’informatique, c’est votre problème.'], { fr: 'Vous n’avez pas encore d’ordinateur :' }),
      sort(b('Place or question?', 'Lieu ou question ?'), [b('a place', 'un lieu'), b('a question', 'une question')], [['la salle de pause', 0], ['Quels sont les horaires ?', 1], ['l’accueil', 0], ['Où est-ce qu’on déjeune ?', 1], ['le service informatique', 0], ['À qui dois-je m’adresser ?', 1]]),
      gap(P.complete, 'La salle de réunion se ___ au premier étage, au ___ du couloir.', ['trouve', 'fond'], { strict: false }),
      say('Excusez-moi, où se trouve la salle de réunion ? Et à qui dois-je m’adresser pour mon badge ?', 'Excuse me, where is the meeting room? And who should I ask about my badge?'),
    ],
    [
      b('Où se trouve… ? · À qui dois-je m’adresser pour… ?', 'Où se trouve… ? · À qui dois-je m’adresser pour… ?'),
      b('Places: l’accueil, la salle de pause, le service informatique.', 'Lieux : l’accueil, la salle de pause, le service informatique.'),
      b('Ask about horaires, cantine, tickets-restaurant.', 'Demandez les horaires, la cantine, les tickets-restaurant.'),
    ],
    [['le rez-de-chaussée', b('the ground floor', 'niveau de la rue')], ['un mot de passe', b('a password', 'code secret')], ['un ticket-restaurant', b('a meal voucher', 'titre pour payer le repas')]],
  ),
  lesson(C, 3, ['workplace-etiquette', 'les-codes-du-travail'],
    b('Workplace etiquette', 'Les codes du milieu de travail'),
    b('Learn the unwritten rules: greetings, tu or vous, breaks and emails.', 'Apprendre les règles non écrites : salutations, tu ou vous, pauses et courriels.'),
    [b('Greet colleagues the right way', 'Saluer les collègues comme il faut'), b('Choose tu or vous at work', 'Choisir tu ou vous au travail'), b('End your first day well', 'Bien terminer sa première journée')],
    13,
    [
      culture(b('Unwritten rules', 'Les règles non écrites'), b('**France**: say **bonjour** to everyone when you arrive (and **bonne soirée** when you leave); some offices still **shake hands** or **faire la bise** among close colleagues. **Vous** with your manager until they suggest **tu**. **Québec**: **tu** is very common, even with the boss; greetings are more relaxed. Everywhere: lunch is a real break, and colleagues often eat together.', '**France** : dites **bonjour** à tout le monde en arrivant (et **bonne soirée** en partant) ; certains bureaux se **serrent la main** ou **se font la bise** entre collègues proches. **Vous** avec votre responsable jusqu’à ce qu’il propose le **tu**. **Québec** : le **tu** est très courant, même avec le patron ; les salutations sont plus détendues. Partout : le déjeuner est une vraie pause, et les collègues mangent souvent ensemble.'), { variant: 'culture' }),
      mc(P.best, ['Bonjour à tous !', 'Rien, je vais directement à mon bureau.', 'Salut le chef !', 'Coucou tout le monde, ça roule ?'], { fr: 'En France, vous arrivez le matin dans l’open space :' }),
      mc(P.best, ['Vous, jusqu’à ce qu’elle propose le tu.', 'Tu, toujours.', 'Ni tu ni vous : je ne lui parle pas.', 'Tu le matin, vous l’après-midi.'], { fr: 'À Paris, vous parlez à votre directrice le premier jour :' }),
      dlg(b('End of the first day', 'Fin de la première journée'), undefined, [['Marc (responsable)', 'm'], ['Vous', 'f']], [
        [0, 'Alors, cette première journée, ça s’est bien passé ?', 'So, how did the first day go?'],
        [1, { options: ['Très bien, merci ! Tout le monde a été très accueillant. J’ai encore quelques questions sur les outils.', 'Bof. C’était long.', 'Je ne sais pas.'] }],
        [0, 'Normal ! On fera un point demain matin à neuf heures.', 'Normal! We’ll have a catch-up tomorrow at nine.'],
        [1, { options: ['Parfait, à demain ! Bonne soirée !', 'Neuf heures ? C’est trop tôt.', 'D’accord. Salut.'] }],
      ]),
      pairs(P.match, [['faire un point', b('to have a catch-up', 'faire le bilan')], ['accueillant', b('welcoming', 'qui accueille bien')], ['faire la bise', b('to kiss on the cheeks (greeting)', 'salutation par bisous')], ['un outil', b('a tool', 'instrument, logiciel')]]),
      say('Merci pour cette journée, tout le monde a été très accueillant. Bonne soirée et à demain !', 'Thank you for today, everyone was very welcoming. Have a good evening and see you tomorrow!'),
    ],
    [
      b('France: bonjour to everyone; vous with the manager at first.', 'France : bonjour à tous ; vous avec le responsable au début.'),
      b('Québec: tu is common, greetings relaxed.', 'Québec : le tu est courant, salutations détendues.'),
      b('End the day: Bonne soirée, à demain !', 'Finir la journée : Bonne soirée, à demain !'),
    ],
    [['un responsable', b('a manager', 'chef')], ['la pause déjeuner', b('the lunch break', 'pause de midi')], ['serrer la main', b('to shake hands', 'salutation')]],
  ),
];
