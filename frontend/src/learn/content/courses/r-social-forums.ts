import type { CourseAbout, Doc } from '../../types';
import { b, card, dict, doc, gap, lesson, mc, P, pairs, sort, tip } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Real everyday French lives on neighbourhood groups, local forums and comment threads. People ask for a trusted mechanic, warn neighbours about roadworks or lost keys, and switch effortlessly between polite requests and relaxed online shorthand. This A2 course trains you to follow multi-reply threads, spot tone and reliability, and decode common abbreviations and spoken-style spellings.',
    'Le français du quotidien vit aussi dans les groupes de quartier, les forums locaux et les fils de discussion. On y demande un bon réparateur, on signale des travaux ou des clés perdues, et l’on mêle demandes polies et abréviations courantes. Ce cours de niveau A2 vous entraîne à suivre des fils à plusieurs réponses, à saisir le ton et les avis, et à décoder l’écrit familier en ligne.',
  ),
  outcomes: [
    b('Follow Q&A threads and weigh community recommendations', 'Suivre un fil de questions et évaluer les recommandations'),
    b('Read local alerts, lost-and-found posts and swaps', 'Lire alertes de quartier, objets trouvés et échanges'),
    b('Decode everyday online abbreviations and informal tone', 'Décoder abréviations courantes et ton familier en ligne'),
    b('Reply naturally to a neighbourhood post', 'Répondre naturellement à une publication de quartier'),
  ],
};

const THREAD_REPAIR: Doc = { look: 'sms', title: b('Neighbourhood group', 'Groupe Entraide Quartier'), text: 'Nadia : Bonjour les voisins ! Quelqu’un connaît un bon réparateur de vélos près de la gare ? Mon frein arrière ne répond plus.\n\nThomas : Perso, je vais chez « Atelier Roue Libre », rue Victor-Hugo. Rapide, pas cher et super sympa !\n\nClaire : Je confirme pour Roue Libre, ils m’ont dépannée hier en 10 min. Par contre, évite la boutique sur le boulevard, c’est hors de prix.\n\nNadia : Top, merci bcp à tous les deux ! J’y passe ce midi.' };
const ALERT_THREAD: Doc = { look: 'notice', title: b('Local alert & comments', 'Alerte quartier et commentaires'), text: 'INFOS QUARTIER — MARDI\n\n1. Travaux avenue Jaurès : coupure d’eau annoncée mercredi de 9 h à 13 h (n° 12 à 44).\n2. Trouvé : un trousseau de trois clés avec un porte-clés rouge devant la boulangerie du Coin. Me contacter en MP !\n3. Vide-grenier dimanche dès 8 h sur la place du Marché (annulé si grosse pluie).' };
const CARPOOL_CHAT: Doc = { look: 'sms', title: b('Community thread', 'Fil covoiturage'), text: 'Samir : Salut ! Qqn est dispo samedi matin pour monter au marché fermier ? J’ai 3 places dans la voiture.\n\nJulie : Moi je suis partante ! Rdv à quelle heure ?\n\nSamir : Vers 8 h 45 devant la mairie, ça te va ?\n\nJulie : Nickel, à samedi ! Tkt, je serai à l’heure :)' };

const C = 'r-social-forums';
export default [
  lesson(C, 1, ['neighbourhood-recommendations', 'recommandations-de-quartier'],
    b('Recommendations and Q&A threads', 'Recommandations et fils de questions'),
    b('Follow who asks, who recommends and who warns in a community thread.', 'Suivre qui demande, qui conseille et qui met en garde dans un fil.'),
    [b('Understand informal praise and warnings', 'Comprendre éloges et mises en garde familiers'), b('Track replies to the right question', 'Relier chaque réponse à la bonne question'), b('Recognise expressions like perso, dépanner, hors de prix', 'Reconnaître perso, dépanner, hors de prix')],
    13,
    [
      card(b('Online recommendation phrases', 'Conseiller ou déconseiller en ligne'), b('Ask: **Quelqu’un connaît un bon… ? · Des avis sur… ?** Praise: **Je confirme · Top · Nickel · Super sympa · Ils m’ont dépanné(e)** (they helped me out). Warn: **Par contre, évite… · À fuir · Hors de prix** (overpriced). **Perso** = personally.', 'Demander : **Quelqu’un connaît… ?** Conseiller : **Je confirme · Top · Nickel · Ils m’ont dépanné(e)**. Déconseiller : **Par contre, évite… · À fuir · Hors de prix**. **Perso** = personnellement.')),
      doc(THREAD_REPAIR, b('Why does Nadia write to the group?', 'Pourquoi Nadia écrit-elle au groupe ?'), [b('She needs a bike repair shop for her brake.', 'Elle cherche un réparateur de vélos pour son frein.'), b('She is selling a bike near the station.', 'Elle vend un vélo près de la gare.'), b('She lost her bike keys.', 'Elle a perdu les clés de son vélo.'), b('She wants to complain about Atelier Roue Libre.', 'Elle veut se plaindre d’Atelier Roue Libre.')]),
      doc(THREAD_REPAIR, b('What do Thomas and Claire agree on?', 'Sur quoi Thomas et Claire sont-ils d’accord ?'), [b('Atelier Roue Libre is a very good place to go.', 'L’Atelier Roue Libre est une très bonne adresse.'), b('The shop on the boulevard is cheap.', 'La boutique du boulevard est bon marché.'), b('Repairing brakes takes two days.', 'Réparer un frein prend deux jours.'), b('Nadia should go tomorrow morning.', 'Nadia doit y aller demain matin.')]),
      doc(THREAD_REPAIR, b('What does « c’est hors de prix » mean?', 'Que signifie « c’est hors de prix » ?'), [b('It is way too expensive.', 'C’est beaucoup trop cher.'), b('It is closed today.', 'C’est fermé aujourd’hui.'), b('It is free of charge.', 'C’est gratuit.'), b('It has no price tag.', 'Il n’y a pas d’étiquette.')]),
      pairs(P.match, [['dépanner quelqu’un', b('to help someone out of trouble', 'aider vite')], ['hors de prix', b('overpriced', 'beaucoup trop cher')], ['je confirme', b('I second that, I agree', 'je suis du même avis')], ['perso', b('personally (informal)', 'pour ma part')]]),
      gap(P.complete, 'Je ___ cette adresse, ils sont rapides ; par contre, ___ le magasin de la gare.', ['recommande', 'évite']),
    ],
    [
      b('Confirming: Je confirme, je valide, top, nickel.', 'Confirmer : Je confirme, je valide, top, nickel.'),
      b('Warning: Par contre, évite…, c’est hors de prix, à fuir.', 'Mettre en garde : Par contre, évite…, c’est hors de prix, à fuir.'),
      b('Dépanner = help out quickly with a problem.', 'Dépanner = aider rapidement face à un souci.'),
    ],
    [['un réparateur', b('a repair technician', 'personne qui répare')], ['un frein', b('a brake', 'système pour s’arrêter')], ['un avis', b('an opinion, review', 'jugement partagé')]],
  ),
  lesson(C, 2, ['lost-and-found-and-local-alerts', 'objets-trouves-et-alertes'],
    b('Local alerts and lost-and-found', 'Alertes locales et objets trouvés'),
    b('Catch practical details in neighbourhood alerts, water cuts and local sales.', 'Saisir les détails pratiques des alertes locales, coupures et brocantes.'),
    [b('Check exact street numbers and hours of alerts', 'Vérifier numéros de rue et horaires d’alerte'), b('Understand lost-and-found posts and MP', 'Comprendre objets trouvés et message privé (MP)'), b('Read neighbourhood event notices', 'Lire les annonces d’événements locaux')],
    13,
    [
      card(b('Neighbourhood board vocabulary', 'Le vocabulaire de quartier'), b('**Une coupure d’eau / de courant** = water / power cut · **Des travaux** = roadworks · **Un trousseau de clés** = a bunch of keys · **En MP** = en message privé (DM) · **Un vide-grenier / une vente de garage** = neighbourhood flea market / garage sale.', '**Une coupure d’eau / de courant** · **Des travaux** · **Un trousseau de clés** · **En MP** (message privé) · **Un vide-grenier / une vente de garage**.')),
      doc(ALERT_THREAD, b('If you live at number 50 avenue Jaurès, will your water be cut?', 'Si vous habitez au 50 avenue Jaurès, aurez-vous une coupure d’eau ?'), [b('No, the cut is only for numbers 12 to 44.', 'Non, la coupure concerne seulement les numéros 12 à 44.'), b('Yes, all day Wednesday.', 'Oui, toute la journée de mercredi.'), b('Yes, from 9 a.m. to 1 p.m.', 'Oui, de 9 h à 13 h.'), b('Only on Tuesday.', 'Seulement mardi.')]),
      doc(ALERT_THREAD, b('What should the owner of the keys do?', 'Que doit faire la personne qui a perdu les clés ?'), [b('Send a private message to the author of the post', 'Envoyer un message privé à l’auteur de la publication'), b('Go to the police station', 'Aller au commissariat'), b('Ask at the bakery on Sunday', 'Demander à la boulangerie dimanche'), b('Wait at the Market Square at 8 a.m.', 'Attendre place du Marché à 8 h')]),
      doc(ALERT_THREAD, b('When is the neighbourhood flea market?', 'Quand a lieu le vide-grenier ?'), [b('Sunday from 8 a.m., unless it rains heavily', 'Dimanche dès 8 h, sauf grosse pluie'), b('Wednesday at 9 a.m.', 'Mercredi à 9 h'), b('Tuesday all day', 'Mardi toute la journée'), b('Every morning on avenue Jaurès', 'Tous les matins avenue Jaurès')]),
      sort(b('Utility alert or community post?', 'Alerte pratique ou vie de quartier ?'), [b('utility / works alert', 'alerte travaux / réseau'), b('lost & found / event', 'objet trouvé / événement')], [['coupure d’eau de 9 h à 13 h', 0], ['trousseau de clés trouvé', 1], ['travaux avenue Jaurès', 0], ['vide-grenier dimanche matin', 1], ['coupure d’électricité prévue', 0], ['chat gris retrouvé près du parc', 1]]),
      dict('La coupure d’eau aura lieu mercredi matin de neuf heures à treize heures.', { voice: 'f' }),
    ],
    [
      b('Check exact street numbers and hours on works notices.', 'Vérifiez toujours les numéros de rue et horaires sur les avis de travaux.'),
      b('MP = message privé (DM).', 'MP = message privé.'),
      b('Vide-grenier (France) / vente de garage (Québec).', 'Vide-grenier (France) / vente de garage (Québec).'),
    ],
    [['une coupure d’eau', b('a water cut', 'arrêt temporaire de l’eau')], ['un trousseau', b('a bunch of keys', 'anneau avec plusieurs clés')], ['un vide-grenier', b('a street flea market', 'vente d’objets par les habitants')]],
  ),
  lesson(C, 3, ['informal-online-french', 'francais-informel-en-ligne'],
    b('Informal online writing and shorthand', 'L’écrit informel et les abréviations'),
    b('Decode everyday chat abbreviations and spoken-style French in threads.', 'Décoder les abréviations des chats et le français familier des forums.'),
    [b('Decode common SMS/chat abbreviations', 'Décoder les abréviations courantes'), b('Understand informal positive replies', 'Comprendre les accords familiers'), b('Distinguish online chat from formal writing', 'Distinguer message en ligne et écrit formel')],
    13,
    [
      tip(b('Common online shortcuts', 'Les raccourcis en ligne'), b('In casual posts, people drop letters or shorten words: **qqn** = quelqu’un · **bcp** = beaucoup · **dispo** = disponible · **rdv** = rendez-vous · **tkt** = t’inquiète (ne t’inquiète pas) · **covoit’** = covoiturage · **ça marche / nickel / je suis partant(e)** = sounds good / I’m in!', 'Dans les messages familiers, on raccourcit : **qqn** (quelqu’un) · **bcp** (beaucoup) · **dispo** (disponible) · **rdv** (rendez-vous) · **tkt** (t’inquiète) · **covoit’** · **ça marche / nickel / je suis partant(e)**.')),
      doc(CARPOOL_CHAT, b('What is Samir offering?', 'Que propose Samir ?'), [b('Three seats in his car to go to the farmers’ market', 'Trois places dans sa voiture pour aller au marché fermier'), b('Selling vegetables on Saturday', 'Vendre des légumes samedi'), b('Borrowing Julie’s car at 8:45', 'Emprunter la voiture de Julie à 8 h 45'), b('Meeting at the bakery on Sunday', 'Un rendez-vous devant la boulangerie dimanche')]),
      doc(CARPOOL_CHAT, b('What does Julie mean by « Je suis partante »?', 'Que veut dire Julie par « Je suis partante » ?'), [b('She agrees and wants to come along.', 'Elle est d’accord et veut venir.'), b('She is leaving town.', 'Elle quitte la ville.'), b('She is already at the market.', 'Elle est déjà au marché.'), b('She refuses politely.', 'Elle refuse poliment.')]),
      doc(CARPOOL_CHAT, b('What does « Tkt » stand for?', 'Que signifie « Tkt » ?'), [b('Do not worry (ne t’inquiète pas)', 'Ne t’inquiète pas'), b('Thank you very much', 'Merci beaucoup'), b('See you soon', 'À tout à l’heure'), b('Where are you?', 'Tu es où ?')]),
      pairs(P.match, [['qqn', b('someone', 'quelqu’un')], ['bcp', b('a lot, many', 'beaucoup')], ['dispo', b('available', 'disponible')], ['rdv', b('appointment, meet-up', 'rendez-vous')]]),
      mc(P.best, ['Salut ! Je suis dispo dimanche matin si vous cherchez encore quelqu’un pour aider.', 'Monsieur, veuillez agréer mes salutations distinguées pour dimanche.', 'Non merci jamais.', 'Dispo ? Quoi ?'], { fr: 'Un voisin demande de l’aide pour déménager des cartons dimanche. Vous répondez sur le groupe :' }),
      gap(P.complete, 'Je suis ___ samedi matin à 9 h, on se donne ___ devant la mairie ?', ['disponible', 'rendez-vous']),
    ],
    [
      b('Abbreviations: qqn, bcp, dispo, rdv, tkt, MP.', 'Abréviations : qqn, bcp, dispo, rdv, tkt, MP.'),
      b('Agreement in chat: ça marche, je suis partant(e), nickel.', 'Accord familier : ça marche, je suis partant(e), nickel.'),
      b('Keep formal phrases for official emails, not neighbourhood chats.', 'Gardez le style formel pour les courriels officiels, pas pour les fils de quartier.'),
    ],
    [['partant', b('keen, up for it', 'prêt à participer')], ['nickel', b('great, spot-on (informal)', 'parfait')], ['un covoiturage', b('a carpool', 'trajet partagé en voiture')]],
  ),
];
