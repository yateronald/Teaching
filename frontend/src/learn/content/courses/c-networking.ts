import type { CourseAbout } from '../../types';
import { b, card, dlg, doc, gap, hear, lesson, mc, ord, P, pairs, say, sort } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'A trade fair, a conference cocktail, an alumni evening, a LinkedIn message: professional networking in French requires a clear pitch, natural small talk and a professional follow-up. This course teaches you to introduce yourself in thirty seconds, to start and end conversations with strangers, to find common ground, to exchange contacts and to write the follow-up message that turns a meeting into an opportunity.',
    'Un salon professionnel, un cocktail de colloque, une soirée d’anciens élèves, un message LinkedIn : le réseautage en français exige un pitch clair, une conversation naturelle et un suivi professionnel. Ce cours vous apprend à vous présenter en trente secondes, à engager et conclure une conversation avec des inconnus, à trouver des points communs, à échanger vos coordonnées et à rédiger le message de suivi qui transforme une rencontre en opportunité.',
  ),
  outcomes: [
    b('Deliver a 30-second introduction', 'Se présenter en trente secondes'),
    b('Start and leave a conversation gracefully', 'Engager et quitter une conversation avec aisance'),
    b('Exchange contacts naturally', 'Échanger ses coordonnées naturellement'),
    b('Follow up professionally', 'Assurer un suivi professionnel'),
  ],
};

const C = 'c-networking';
export default [
  lesson(C, 1, ['your-30-second-pitch', 'votre-pitch-de-30-secondes'],
    b('Your 30-second introduction', 'Votre présentation en 30 secondes'),
    b('Introduce yourself professionally: who you are, what you do, what you are looking for.', 'Se présenter professionnellement : qui vous êtes, ce que vous faites, ce que vous cherchez.'),
    [b('Structure your pitch', 'Structurer son pitch'), b('Make it concrete', 'Le rendre concret'), b('End with an opening', 'Finir par une ouverture')],
    13,
    [
      card(b('A three-part pitch', 'Un pitch en trois temps'), b('**Who**: **Je suis Inès Diallo, ingénieure en logistique.** **What**: **J’aide les PME à réduire leurs délais de livraison** (a result, not a job title). **Opening**: **En ce moment, je cherche à rencontrer des acteurs du transport ferroviaire.** · **Et vous, qu’est-ce qui vous amène ici ?**', '**Qui** : **Je suis Inès Diallo, ingénieure en logistique.** **Quoi** : **J’aide les PME à réduire leurs délais de livraison** (un résultat, pas un intitulé de poste). **Ouverture** : **En ce moment, je cherche à rencontrer des acteurs du transport ferroviaire.** · **Et vous, qu’est-ce qui vous amène ici ?**')),
      mc(P.best, ['J’aide les petites entreprises à diviser par deux leurs délais de livraison.', 'Je suis Senior Supply Chain Operations Analyst Level 2.', 'Je travaille dans une boîte, dans un bureau.', 'Je fais plein de choses, c’est compliqué à expliquer.'], { fr: 'Quelle phrase présente le mieux ce que vous faites ?' }),
      sort(b('Who, what or opening?', 'Qui, quoi ou ouverture ?'), [b('who', 'qui'), b('what (result)', 'quoi (résultat)'), b('opening', 'ouverture')], [['Je suis Marc, développeur.', 0], ['J’aide les hôpitaux à mieux gérer leurs stocks.', 1], ['Je cherche des partenaires au Québec.', 2], ['Je m’appelle Sofia, je suis traductrice.', 0], ['Je rends les sites web accessibles aux malvoyants.', 1], ['Et vous, qu’est-ce qui vous amène ici ?', 2]]),
      ord(P.order, 'Et vous, qu’est-ce qui vous amène ici ?', { tr: 'And you, what brings you here?' }),
      hear('Bonjour, Thomas Nguyen. Je dirige une petite agence qui aide les musées à créer des visites en réalité augmentée. En ce moment, je cherche des partenaires dans les pays francophones d’Afrique.', b('What is Thomas looking for?', 'Que cherche Thomas ?'), [b('Partners in French-speaking African countries', 'Des partenaires dans les pays francophones d’Afrique'), b('A job in a museum', 'Un emploi dans un musée'), b('Investors in Asia', 'Des investisseurs en Asie'), b('A new office', 'Un nouveau bureau')], { voice: 'm' }),
      pairs(P.match, [['une PME', b('an SME (small business)', 'petite ou moyenne entreprise')], ['un délai', b('a lead time, a deadline', 'durée prévue')], ['diriger', b('to run, to manage', 'être à la tête de')], ['qu’est-ce qui vous amène ?', b('what brings you here?', 'pourquoi êtes-vous là ?')]]),
      say('Je suis Inès, ingénieure en logistique. J’aide les PME à réduire leurs délais de livraison. Et vous, qu’est-ce qui vous amène ici ?', 'I’m Inès, a logistics engineer. I help SMEs cut their delivery times. And you, what brings you here?'),
    ],
    [
      b('Who + what (a result) + opening.', 'Qui + quoi (un résultat) + ouverture.'),
      b('J’aide… à… is stronger than a job title.', 'J’aide… à… est plus fort qu’un intitulé de poste.'),
      b('Turn it back: Et vous, qu’est-ce qui vous amène ici ?', 'Renvoyez : Et vous, qu’est-ce qui vous amène ici ?'),
    ],
    [['ferroviaire', b('rail (adj.)', 'du train')], ['la réalité augmentée', b('augmented reality', 'technologie numérique')], ['un acteur', b('a player, stakeholder', 'participant d’un secteur')]],
  ),
  lesson(C, 2, ['starting-and-leaving-conversations', 'engager-et-quitter-la-conversation'],
    b('Starting and leaving conversations', 'Engager et quitter une conversation'),
    b('Approach a stranger, find common ground and leave a conversation gracefully.', 'Aborder un inconnu, trouver des points communs et quitter une conversation avec élégance.'),
    [b('Break the ice', 'Briser la glace'), b('Find common ground', 'Trouver des points communs'), b('Leave politely', 'Prendre congé poliment')],
    13,
    [
      card(b('Breaking the ice and leaving', 'Briser la glace et partir'), b('Start: **Bonjour, je peux me joindre à vous ?** · **Vous avez assisté à la conférence de ce matin ? Qu’en avez-vous pensé ?** Common ground: **Ah, vous aussi, vous travaillez avec le Québec ?** Leave: **Je ne vais pas vous accaparer plus longtemps.** · **Je vais aller saluer quelques personnes, mais ravi d’avoir échangé avec vous !**', 'Engager : **Bonjour, je peux me joindre à vous ?** · **Vous avez assisté à la conférence de ce matin ? Qu’en avez-vous pensé ?** Point commun : **Ah, vous aussi, vous travaillez avec le Québec ?** Partir : **Je ne vais pas vous accaparer plus longtemps.** · **Je vais aller saluer quelques personnes, mais ravi d’avoir échangé avec vous !**')),
      mc(P.best, ['Bonjour, je peux me joindre à vous ? Vous avez assisté à la table ronde de ce matin ?', 'Salut, vous faites quoi comme salaire ?', 'Bonjour, achetez mon produit.', 'Je peux vous donner ma carte ? Au revoir.'], { fr: 'Vous abordez un petit groupe au cocktail :' }),
      mc(P.best, ['Je ne vais pas vous accaparer plus longtemps. Ravi d’avoir échangé avec vous !', 'Bon, vous m’ennuyez, je pars.', 'Je dois trouver des gens plus intéressants.', 'Salut.'], { fr: 'Vous voulez quitter la conversation poliment :' }),
      dlg(b('At a trade fair', 'Sur un salon professionnel'), undefined, [['Vous', 'f'], ['Antoine', 'm']], [
        [0, { options: ['Bonjour ! Qu’avez-vous pensé de la conférence sur l’export ?', 'Bonjour, vous êtes qui, vous ?', 'Vous avez du travail pour moi ?'] }],
        [1, 'Très intéressante ! Surtout la partie sur l’Afrique de l’Ouest. Nous venons d’ouvrir un bureau à Dakar.', 'Very interesting! Especially the part on West Africa. We’ve just opened an office in Dakar.'],
        [0, { options: ['Ah, c’est un marché que je connais bien, j’y ai travaillé trois ans. Vous êtes dans quel secteur ?', 'Dakar ? Ah bon.', 'Moi, je n’aime pas l’export.'] }],
        [1, 'L’agroalimentaire. On cherche justement des gens qui connaissent le terrain.', 'Food industry. We’re actually looking for people who know the ground.'],
      ]),
      pairs(P.match, [['briser la glace', b('to break the ice', 'commencer une conversation')], ['accaparer', b('to monopolise (someone)', 'garder pour soi')], ['échanger', b('to talk, exchange', 'discuter')], ['le terrain', b('the field, the ground', 'la réalité locale')]]),
      say('Je ne vais pas vous accaparer plus longtemps, mais j’ai été ravie d’échanger avec vous !', 'I won’t keep you any longer, but I was delighted to talk with you!'),
    ],
    [
      b('Start: Je peux me joindre à vous ? Qu’avez-vous pensé de… ?', 'Engager : Je peux me joindre à vous ? Qu’avez-vous pensé de… ?'),
      b('Look for common ground: Vous aussi… ?', 'Cherchez un point commun : Vous aussi… ?'),
      b('Leave: Je ne vais pas vous accaparer plus longtemps.', 'Partir : Je ne vais pas vous accaparer plus longtemps.'),
    ],
    [['une table ronde', b('a panel discussion', 'débat entre experts')], ['l’agroalimentaire', b('the food industry', 'industrie alimentaire')], ['se joindre à', b('to join', 'rejoindre')]],
  ),
  lesson(C, 3, ['exchanging-contacts-and-following-up', 'echanger-ses-coordonnees-et-relancer'],
    b('Exchanging contacts and following up', 'Échanger ses coordonnées et assurer le suivi'),
    b('Suggest staying in touch and write an effective follow-up message.', 'Proposer de rester en contact et rédiger un message de suivi efficace.'),
    [b('Suggest staying in touch', 'Proposer de rester en contact'), b('Write a follow-up message', 'Rédiger un message de suivi'), b('Suggest a next step', 'Proposer une prochaine étape')],
    13,
    [
      card(b('Staying in touch', 'Rester en contact'), b('**On pourrait rester en contact ?** · **Je vous laisse ma carte.** · **Vous êtes sur LinkedIn ?** · **Je vous envoie un petit message demain.** Follow-up: recall the meeting, a detail, a concrete proposal: **Suite à notre échange au salon, je me permets de vous recontacter… Seriez-vous disponible pour un appel de vingt minutes la semaine prochaine ?**', '**On pourrait rester en contact ?** · **Je vous laisse ma carte.** · **Vous êtes sur LinkedIn ?** · **Je vous envoie un petit message demain.** Suivi : rappeler la rencontre, un détail, une proposition concrète : **Suite à notre échange au salon, je me permets de vous recontacter… Seriez-vous disponible pour un appel de vingt minutes la semaine prochaine ?**')),
      doc({ look: 'email', title: b('Follow-up message', 'Message de suivi'), text: 'Objet : Suite à notre échange au salon Export Plus\n\nBonjour Monsieur Leroux,\n\nNous avons échangé jeudi au salon Export Plus, au sujet de votre nouveau bureau à Dakar. Comme je vous le disais, j’ai travaillé trois ans sur ce marché, notamment avec des coopératives agricoles.\n\nSeriez-vous disponible pour un appel de vingt minutes la semaine prochaine ? Je pourrais vous présenter quelques pistes concrètes.\n\nBien cordialement,\nAïssatou Ba' }, b('What does Aïssatou propose?', 'Que propose Aïssatou ?'), [b('A 20-minute call next week', 'Un appel de vingt minutes la semaine prochaine'), b('A job interview in Dakar', 'Un entretien d’embauche à Dakar'), b('To meet again at the next fair', 'De se revoir au prochain salon'), b('To send her CV', 'D’envoyer son CV')]),
      mc(P.best, ['Suite à notre échange au salon, je me permets de vous recontacter.', 'Salut, tu te souviens de moi ?', 'Je vous écris parce que je n’ai rien à faire.', 'Vous m’avez oublié, je pense.'], { fr: 'Première phrase d’un message de suivi :' }),
      sort(b('Good follow-up or not?', 'Bon suivi ou non ?'), [b('effective', 'efficace'), b('to avoid', 'à éviter')], [['Rappeler où vous vous êtes rencontrés.', 0], ['Envoyer un long CV sans explication.', 1], ['Mentionner un détail de la conversation.', 0], ['Écrire trois semaines plus tard.', 1], ['Proposer un appel court et précis.', 0], ['Demander directement un emploi.', 1]]),
      gap(P.complete, 'Seriez-vous ___ pour un appel de vingt minutes la semaine ___ ?', ['disponible', 'prochaine']),
      pairs(P.match, [['les coordonnées', b('contact details', 'téléphone, courriel')], ['recontacter', b('to get back in touch', 'reprendre contact')], ['une carte de visite', b('a business card', 'carte avec ses coordonnées')], ['une piste', b('an idea, a lead', 'possibilité à explorer')]]),
      say('On pourrait rester en contact ? Je vous laisse ma carte, et je vous envoie un message demain.', 'Could we stay in touch? I’ll leave you my card, and I’ll send you a message tomorrow.'),
    ],
    [
      b('On pourrait rester en contact ? Je vous laisse ma carte.', 'On pourrait rester en contact ? Je vous laisse ma carte.'),
      b('Follow up within 48 h: recall + detail + concrete proposal.', 'Relancez sous 48 h : rappel + détail + proposition concrète.'),
      b('Suite à notre échange…, je me permets de vous recontacter.', 'Suite à notre échange…, je me permets de vous recontacter.'),
    ],
    [['une coopérative', b('a cooperative', 'entreprise collective')], ['Bien cordialement', b('Kind regards', 'formule de fin')], ['un appel', b('a call', 'conversation téléphonique')]],
  ),
];
