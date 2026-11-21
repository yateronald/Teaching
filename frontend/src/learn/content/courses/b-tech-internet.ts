import type { CourseAbout } from '../../types';
import { b, card, culture, dict, dlg, doc, gap, lesson, mc, ord, P, pairs, say, sort, tip, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Phones, apps, wifi, passwords: technology is part of every day, and so are its problems. This course gives you the French to buy a phone plan, set up a device, connect to the internet, describe a technical problem to customer support, and protect yourself online (phishing, strong passwords). Includes the official Québec terms (courriel, texto, clavardage).',
    'Téléphones, applis, wifi, mots de passe : la technologie fait partie du quotidien, ses problèmes aussi. Ce cours vous donne le français pour choisir un forfait mobile, configurer un appareil, se connecter à internet, décrire un problème technique au service client et se protéger en ligne (hameçonnage, mots de passe solides). Avec les termes officiels du Québec (courriel, texto, clavardage).',
  ),
  outcomes: [
    b('Use the vocabulary of phones and apps', 'Employer le vocabulaire des téléphones et des applis'),
    b('Choose a phone plan', 'Choisir un forfait mobile'),
    b('Describe a technical problem', 'Décrire un problème technique'),
    b('Stay safe online', 'Rester prudent en ligne'),
  ],
};

const C = 'b-tech-internet';
export default [
  lesson(C, 1, ['phones-and-apps', 'telephones-et-applis'],
    b('Phones and apps', 'Téléphones et applis'),
    b('Talk about your phone, apps and everyday digital actions.', 'Parler de son téléphone, des applis et des gestes numériques du quotidien.'),
    [b('Name devices and parts', 'Nommer les appareils et leurs parties'), b('Use digital action verbs', 'Employer les verbes d’action numériques'), b('Know France vs Québec terms', 'Connaître les termes de France et du Québec')],
    13,
    [
      card(b('Digital vocabulary', 'Vocabulaire numérique'), b('**un téléphone (un portable / un cellulaire au Québec), une tablette, un ordinateur, l’écran, la batterie, le chargeur, une appli (application)**. Verbs: **télécharger, installer, mettre à jour, se connecter, envoyer un texto / un SMS, envoyer un courriel (un e-mail / un mail), recharger, redémarrer, supprimer**.', '**un téléphone (un portable / un cellulaire au Québec), une tablette, un ordinateur, l’écran, la batterie, le chargeur, une appli (application)**. Verbes : **télécharger, installer, mettre à jour, se connecter, envoyer un texto / un SMS, envoyer un courriel (un e-mail / un mail), recharger, redémarrer, supprimer**.')),
      culture(b('Québec terms', 'Les termes du Québec'), b('Québec promotes French terms: **courriel** (email), **texto** (text message), **clavarder** (to chat online), **pourriel** (spam), **cellulaire** (mobile phone). In France you will hear **mail, SMS, portable** more often. Both are understood.', 'Le Québec privilégie des termes français : **courriel**, **texto**, **clavarder**, **pourriel**, **cellulaire**. En France, on entend plus souvent **mail, SMS, portable**. Les deux sont compris.'), { variant: 'culture' }),
      pairs(P.match, [['télécharger', b('to download', 'récupérer un fichier')], ['mettre à jour', b('to update', 'installer la nouvelle version')], ['le chargeur', b('the charger', 'pour la batterie')], ['supprimer', b('to delete', 'effacer')]]),
      sort(b('France or Québec usage?', 'Usage de France ou du Québec ?'), [b('more common in France', 'plus courant en France'), b('more common in Québec', 'plus courant au Québec')], [['un portable', 0], ['un cellulaire', 1], ['un mail', 0], ['un courriel', 1], ['le spam', 0], ['le pourriel', 1]]),
      gap(P.complete, 'Mon téléphone est lent : je dois le mettre à ___ et le ___ (éteindre puis rallumer).', ['jour', 'redémarrer']),
      say('Je dois recharger mon téléphone : la batterie est presque vide.', 'I need to charge my phone: the battery is almost empty.'),
    ],
    [
      b('portable / cellulaire, écran, batterie, chargeur, appli.', 'portable / cellulaire, écran, batterie, chargeur, appli.'),
      b('télécharger, installer, mettre à jour, redémarrer, supprimer.', 'télécharger, installer, mettre à jour, redémarrer, supprimer.'),
      b('Québec: courriel, texto, pourriel, clavarder.', 'Québec : courriel, texto, pourriel, clavarder.'),
    ],
    [['un écran', b('a screen', 'partie qui affiche')], ['vide', b('empty', 'sans rien')], ['lent', b('slow', 'pas rapide')]],
  ),
  lesson(C, 2, ['plans-and-technical-problems', 'forfaits-et-problemes-techniques'],
    b('Phone plans and technical problems', 'Forfaits et problèmes techniques'),
    b('Choose a plan and describe a problem to customer support.', 'Choisir un forfait et décrire un problème au service client.'),
    [b('Understand a phone plan', 'Comprendre un forfait'), b('Describe a problem', 'Décrire un problème'), b('Follow support instructions', 'Suivre les consignes du support')],
    13,
    [
      card(b('Plans and problems', 'Forfaits et problèmes'), b('Plan: **un forfait, sans engagement, les données (la data), les appels illimités, 50 Go, l’itinérance (roaming)**. Problems: **Je n’ai pas de réseau. · Le wifi ne marche pas. · Mon téléphone ne s’allume plus. · L’appli plante. · J’ai oublié mon mot de passe.** Support: **Essayez de redémarrer. · Débranchez la box / le modem.**', 'Forfait : **un forfait, sans engagement, les données (la data), les appels illimités, 50 Go, l’itinérance**. Problèmes : **Je n’ai pas de réseau. · Le wifi ne marche pas. · Mon téléphone ne s’allume plus. · L’appli plante. · J’ai oublié mon mot de passe.** Support : **Essayez de redémarrer. · Débranchez la box / le modem.**')),
      doc({ look: 'ad', title: b('Phone plan', 'Forfait mobile'), text: 'FORFAIT LIBERTÉ\nAppels et textos illimités\n60 Go de données\n10 Go en itinérance en Europe\nSans engagement — 15,99 € / mois' }, b('What does « sans engagement » mean?', 'Que veut dire « sans engagement » ?'), [b('you can cancel at any time', 'on peut résilier à tout moment'), b('it is free', 'c’est gratuit'), b('calls are limited', 'les appels sont limités'), b('there is no internet', 'il n’y a pas d’internet')]),
      dlg(b('Calling support', 'Appeler le support'), undefined, [['Conseillère', 'f'], ['Vous', 'm']], [
        [0, 'Service client, bonjour. Quel est votre problème ?', 'Customer service, hello. What’s your problem?'],
        [1, { options: ['Bonjour, depuis ce matin, le wifi ne marche plus chez moi.', 'Internet. Cassé.', 'Tout est nul.'] }],
        [0, 'D’accord. Est-ce que vous pouvez débrancher votre modem pendant trente secondes, puis le rebrancher ?', 'OK. Can you unplug your modem for thirty seconds, then plug it back in?'],
        [1, { options: ['Je le fais… Voilà, ça remarche ! Merci beaucoup.', 'Non, je ne veux pas.', 'C’est quoi un modem ?'] }],
      ], true),
      mc(P.best, ['Mon téléphone ne s’allume plus depuis hier soir.', 'Téléphone mort.', 'Il est cassé, le truc.', 'Ça ne va pas.'], { fr: 'Vous décrivez le problème au vendeur :' }),
      ord(P.order, 'J’ai oublié mon mot de passe, je ne peux pas me connecter.', { tr: 'I forgot my password, I can’t log in.' }),
      say('Bonjour, je n’ai plus de réseau depuis ce matin. Qu’est-ce que je peux faire ?', 'Hello, I’ve had no network since this morning. What can I do?'),
    ],
    [
      b('Plan: forfait, sans engagement, données, illimité, itinérance.', 'Forfait : forfait, sans engagement, données, illimité, itinérance.'),
      b('Problems: pas de réseau, ne marche pas, ne s’allume plus, plante.', 'Problèmes : pas de réseau, ne marche pas, ne s’allume plus, plante.'),
      b('Support: redémarrer, débrancher, rebrancher.', 'Support : redémarrer, débrancher, rebrancher.'),
    ],
    [['un forfait', b('a plan (phone)', 'offre mensuelle')], ['débrancher', b('to unplug', 'enlever la prise')], ['plante', b('crashes (informal)', 's’arrête')]],
  ),
  lesson(C, 3, ['staying-safe-online', 'rester-prudent-en-ligne'],
    b('Staying safe online', 'Rester prudent en ligne'),
    b('Recognise phishing, create a strong password and protect your data.', 'Reconnaître l’hameçonnage, créer un mot de passe solide et protéger ses données.'),
    [b('Recognise a phishing message', 'Reconnaître un message d’hameçonnage'), b('Talk about passwords and security', 'Parler des mots de passe et de la sécurité'), b('Give safety advice', 'Donner des conseils de sécurité')],
    13,
    [
      card(b('Online safety', 'Sécurité en ligne'), b('**l’hameçonnage** (phishing; France also: **le phishing**), **un lien suspect, une pièce jointe, un mot de passe solide, la double authentification, des données personnelles**. Advice: **Ne cliquez jamais sur un lien suspect. · Ne donnez jamais votre mot de passe. · Activez la double authentification. · Vérifiez l’adresse de l’expéditeur.**', '**l’hameçonnage** (en France aussi : **le phishing**), **un lien suspect, une pièce jointe, un mot de passe solide, la double authentification, des données personnelles**. Conseils : **Ne cliquez jamais sur un lien suspect. · Ne donnez jamais votre mot de passe. · Activez la double authentification. · Vérifiez l’adresse de l’expéditeur.**')),
      doc({ look: 'sms', title: b('Suspicious message', 'Message suspect'), text: 'URGENT ! Votre colis est bloqué. Payez 1,99 € de frais dans les 2 heures, sinon il sera renvoyé : cliquez ici → colis-livraison-paiement.info' }, b('What should you do?', 'Que faut-il faire ?'), [b('not click, delete the message', 'ne pas cliquer, supprimer le message'), b('pay quickly', 'payer vite'), b('send your bank details', 'envoyer ses coordonnées bancaires'), b('forward it to friends', 'le transférer aux amis')]),
      tip(b('Signs of phishing', 'Les signes de l’hameçonnage'), b('**Urgence** (« dans les 2 heures »), **small payment** requested, **strange link**, **spelling mistakes**, a sender you don’t know. A real company never asks for your password by message.', '**Urgence** (« dans les 2 heures »), **petit paiement** demandé, **lien étrange**, **fautes d’orthographe**, expéditeur inconnu. Une vraie entreprise ne demande jamais votre mot de passe par message.')),
      sort(b('Safe or risky?', 'Prudent ou risqué ?'), [b('safe', 'prudent'), b('risky', 'risqué')], [['activer la double authentification', 0], ['cliquer sur un lien inconnu', 1], ['un mot de passe long et unique', 0], ['le même mot de passe partout', 1], ['vérifier l’expéditeur', 0], ['donner son code par texto', 1]]),
      dict('Ne cliquez jamais sur un lien suspect et ne donnez jamais votre mot de passe.', {}),
      write(b('Safety tips', 'Conseils de sécurité'), b('Write three safety tips (25–45 words) for a friend who just got a new phone, using the imperative.', 'Écrivez trois conseils de sécurité (25–45 mots) pour un ami qui vient d’avoir un nouveau téléphone, à l’impératif.'), 25, 45, [
        b('Three tips', 'Trois conseils'),
        b('Imperative (choisis, active, ne clique pas…)', 'Impératif (choisis, active, ne clique pas…)'),
      ], 'Choisis un mot de passe long et différent pour chaque compte. Active la double authentification. Et surtout, ne clique jamais sur un lien dans un texto bizarre : supprime-le tout de suite !'),
    ],
    [
      b('hameçonnage, lien suspect, pièce jointe, double authentification.', 'hameçonnage, lien suspect, pièce jointe, double authentification.'),
      b('Signs: urgency, small payment, odd link, mistakes.', 'Signes : urgence, petit paiement, lien étrange, fautes.'),
      b('Advice with the imperative: Ne cliquez jamais…', 'Conseils à l’impératif : Ne cliquez jamais…'),
    ],
    [['l’expéditeur', b('the sender', 'qui envoie')], ['un compte', b('an account', 'accès personnel')], ['les données', b('data', 'informations')]],
  ),
];
