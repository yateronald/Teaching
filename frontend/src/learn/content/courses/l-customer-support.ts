import type { CourseAbout } from '../../types';
import { b, card, dict, dlg, hear, lesson, mc, P, pairs, sort, tip, trap } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Calling a bank, internet provider, courier or online shop in French starts with an automated voice menu and moves quickly through verification questions, troubleshooting and compensation terms. Without visual cues, every digit and polite condition matters. This course trains your ear on automated hotlines, live support calls, refunds and delivery rescheduling.',
    'Appeler une banque, un fournisseur d’accès, un transporteur ou une boutique en ligne en français commence par un serveur vocal et enchaîne vite questions d’identité, dépannage et conditions de remboursement. Sans repères visuels, chaque chiffre et chaque formule comptent. Ce cours vous entraîne sur les serveurs vocaux, échanges avec un conseiller, remboursements et livraisons.',
  ),
  outcomes: [
    b('Navigate automated French voice menus (serveur vocal)', 'Naviguer dans un serveur vocal automatisé'),
    b('Handle identity checks and explain billing or technical issues', 'Répondre aux vérifications d’identité et expliquer un problème'),
    b('Catch refund timelines, store credits and return labels', 'Comprendre délais de remboursement, avoirs et étiquettes de retour'),
    b('Confirm redelivery dates and pick-up points (point relais)', 'Confirmer une relivraison ou un retrait en point relais'),
  ],
};

const C = 'l-customer-support';
export default [
  lesson(C, 1, ['automated-phone-menus', 'serveurs-vocaux-et-attente'],
    b('Navigating automated phone menus', 'Naviguer dans un serveur vocal'),
    b('Understand IVR keypad prompts, hold announcements and privacy notices.', 'Comprendre les choix du clavier, les annonces d’attente et les mentions légales.'),
    [b('Press the right key (tapez 1, dièse, étoile)', 'Appuyer sur la bonne touche (tapez 1, dièse, étoile)'), b('Understand recording and waiting-time notices', 'Comprendre les annonces d’enregistrement et d’attente'), b('Prepare your customer or order number', 'Préparer son numéro client ou de commande')],
    13,
    [
      card(b('Automated menu vocabulary', 'Le vocabulaire du serveur vocal'), b('Hotlines use standard phrases: **Tapez 1 / Appuyez sur la touche 1** (Press 1), **la touche dièse** (#), **la touche étoile** (*), **Cet appel est susceptible d’être enregistré** (This call may be recorded), **Votre temps d’attente est estimé à…** (Estimated wait time…).', 'Les serveurs vocaux utilisent des formules fixes : **Tapez 1 / Appuyez sur la touche 1**, **la touche dièse** (#), **la touche étoile** (*), **Cet appel est susceptible d’être enregistré**, **Votre temps d’attente est estimé à…**.'), {
        ex: [['Pour le suivi de commande, tapez 2.', 'For order tracking, press 2.'], ['Composez votre numéro client suivi de dièse.', 'Enter your customer ID followed by pound.']],
      }),
      tip(b('Stay on the line', 'Rester en ligne'), b('Watch out for **Ne raccrochez pas** / **Restez en ligne** (Stay on the line) vs **Vous pouvez rappeler aux heures d’ouverture** (Call back during opening hours).', 'Repérez **Ne raccrochez pas** / **Restez en ligne** contre **Vous pouvez rappeler aux heures d’ouverture**.')),
      hear('Bienvenue au service client. Pour une réclamation ou un remboursement, tapez 1. Pour modifier une livraison, tapez 2. Pour parler à un conseiller, tapez 0.', b('Which key should you press to change a delivery?', 'Sur quelle touche appuyer pour modifier une livraison ?'), [b('Key 2', 'La touche 2'), b('Key 1', 'La touche 1'), b('Key 0', 'La touche 0'), b('The star key', 'La touche étoile')], { voice: 'f' }),
      hear('Afin d’améliorer la qualité de nos services, cet appel est susceptible d’être enregistré. Veuillez saisir votre numéro de dossier à huit chiffres suivi de la touche dièse.', b('What must you enter on your keypad?', 'Que devez-vous saisir sur votre clavier ?'), [b('Your 8-digit file number followed by #', 'Votre numéro de dossier à 8 chiffres suivi de dièse'), b('Your date of birth followed by *', 'Votre date de naissance suivie d’étoile'), b('Your postal code followed by 0', 'Votre code postal suivi de 0'), b('Nothing, just wait silently', 'Rien, attendre en silence')], { voice: 'm2' }),
      sort(b('Menu choice or hold/legal notice?', 'Choix du menu ou message d’attente/légal ?'), [b('keypad choice', 'choix sur le clavier'), b('hold / legal notice', 'attente / mention légale')], [['Pour le suivi de colis, tapez 3.', 0], ['Cet appel peut être enregistré.', 1], ['Validez avec la touche dièse.', 0], ['Temps d’attente estimé : quatre minutes.', 1], ['Pour un conseiller, tapez 0.', 0], ['Tous nos agents sont occupés.', 1]], { listen: true }),
      pairs(P.match, [['la touche dièse', b('the pound / hash key (#)', 'touche # du téléphone')], ['le numéro de dossier', b('the case / file number', 'référence de votre demande')], ['suivi de commande', b('order tracking', 'état d’avancement d’un achat')], ['susceptible d’être enregistré', b('may be recorded', 'peut être enregistré')]]),
      dict('Pour parler à un conseiller, ne quittez pas la ligne.', { voice: 'f2' }),
    ],
    [
      b('tapez X = press X; dièse = #; étoile = *.', 'tapez X ; touche dièse = # ; touche étoile = *.'),
      b('susceptible d’être enregistré = may be recorded.', 'susceptible d’être enregistré = peut être enregistré.'),
      b('numéro de dossier / numéro client = case / customer ID.', 'numéro de dossier / client = référence à préparer.'),
    ],
    [['la touche dièse', b('hash / pound key (#)', 'touche # du clavier')], ['un conseiller', b('an adviser, support agent', 'agent du service client')], ['un dossier', b('a case file', 'ensemble des informations d’une demande')]],
  ),
  lesson(C, 2, ['explaining-an-issue-with-an-agent', 'expliquer-un-probleme-au-conseiller'],
    b('Talking to an agent: billing and technical issues', 'Parler au conseiller : facturation et pannes'),
    b('Follow live agent questions on billing errors, outages and verification.', 'Suivre les questions d’un conseiller sur une erreur de facture ou une panne.'),
    [b('Pass phone security verification', 'Répondre aux vérifications d’identité'), b('Understand billing error explanations', 'Comprendre les explications d’erreur de facturation'), b('Follow remote troubleshooting steps', 'Suivre un dépannage à distance')],
    13,
    [
      card(b('Resolving a call live', 'Résoudre un problème en direct'), b('An agent checks your file: **Pouvez-vous me confirmer votre adresse courriel ?** (Confirm your email?), **Je constate un prélèvement en double** (I see a double charge), **Avez-vous redémarré votre équipement ?** (Have you restarted your device?), **Je fais remonter le ticket au service technique** (I’m escalating the ticket).', 'Le conseiller vérifie le dossier : **Pouvez-vous me confirmer votre adresse courriel ?**, **Je constate un prélèvement en double**, **Avez-vous redémarré votre équipement ?**, **Je fais remonter le ticket au service technique**.'), {
        ex: [['Il y a bien eu un doublon sur votre facture de mars.', 'There was indeed a duplicate charge on your March bill.'], ['Débranchez la box trente secondes, puis rebranchez-la.', 'Unplug the router for 30 seconds, then plug it back in.']],
      }),
      hear('Je vois bien que vous avez été débité deux fois le quatorze avril. Je lance immédiatement la régularisation sur votre compte.', b('What does the agent confirm?', 'Que confirme le conseiller ?'), [b('You were charged twice on April 14 and an adjustment is being started', 'Vous avez été débité deux fois le 14 avril et il lance la régularisation'), b('The payment was declined on April 14', 'Le paiement a été refusé le 14 avril'), b('Your account is closed for non-payment', 'Votre compte est fermé pour impayé'), b('You must send a cheque by post', 'Vous devez envoyer un chèque par courrier')], { voice: 'm' }),
      hear('Le voyant rouge clignote toujours ? Dans ce cas, ce n’est pas un souci chez vous, c’est une panne sur la ligne dans votre quartier.', b('Where is the internet outage?', 'D’où vient la panne internet ?'), [b('From a line outage in your neighbourhood', 'D’une panne sur la ligne du quartier'), b('From a broken cable inside your flat', 'D’un câble cassé chez vous'), b('From an unpaid monthly bill', 'D’une facture mensuelle impayée'), b('From a router update you cancelled', 'D’une mise à jour annulée')], { voice: 'f2' }),
      dlg(b('Hotline call: double charge', 'Appel au support : double débit'), b('You call customer support about two identical charges on your bank statement.', 'Vous appelez le service client pour deux prélèvements identiques sur votre relevé.'), [['Conseillère', 'f'], ['Vous', 'm2']], [
        [0, 'Service client bonjour, Camille à l’appareil. Quel est votre numéro de contrat ?', 'Customer service hello, Camille speaking. What is your contract number?'],
        [1, 'Bonjour, c’est le 48 92 10. J’ai été prélevé deux fois ce mois-ci.', 'Hello, it’s 48 92 10. I was charged twice this month.'],
        [0, { options: ['Pour votre sécurité, pouvez-vous me confirmer votre code postal ?', 'Pour votre sécurité, achetez un autre contrat.', 'Le prélèvement est votre adresse.'] }],
        [1, 'Bien sûr, c’est le 69003, à Lyon.', 'Sure, it’s 69003, in Lyon.'],
        [0, { options: ['Merci. Je vois le doublon : je vous envoie une confirmation par courriel tout de suite.', 'Merci, rappelez le mois dernier.', 'Votre contrat est en double chez le facteur.'] }],
      ], true),
      mc(P.meaning, [b('I am escalating your request to the technical team.', 'Je transmets votre demande au niveau supérieur technique.'), b('I am deleting your file permanently.', 'Je supprime votre dossier définitivement.'), b('You have to climb up to the roof.', 'Vous devez monter sur le toit.'), b('Your bill is going up next month.', 'Votre facture augmente le mois prochain.')], { fr: '« Je fais remonter votre dossier au service technique. »' }),
      pairs(P.match, [['un prélèvement en double', b('a duplicate charge', 'somme retirée deux fois')], ['la régularisation', b('billing adjustment / correction', 'correction du montant')], ['le voyant clignote', b('the indicator light is blinking', 'lumière qui s’allume et s’éteint')], ['faire remonter', b('to escalate (an issue)', 'transmettre au service compétent')]]),
      dict('Je constate un prélèvement en double sur votre facture d’avril.', { voice: 'm' }),
    ],
    [
      b('prélèvement en double / doublon = duplicate charge.', 'prélèvement en double / doublon = double débit.'),
      b('faire remonter un dossier = escalate a case.', 'faire remonter un dossier = transmettre au service supérieur.'),
      b('débrancher / redémarrer = unplug / restart.', 'débrancher / redémarrer = couper puis relancer.'),
    ],
    [['un prélèvement', b('a direct debit / charge', 'somme prélevée sur un compte')], ['un doublon', b('a duplicate', 'élément compté deux fois')], ['un voyant', b('an indicator light', 'petite lumière d’appareil')]],
  ),
  lesson(C, 3, ['refunds-returns-and-deliveries', 'remboursements-retours-et-livraisons'],
    b('Solutions, refunds and delivery dates', 'Solutions, remboursements et dates de livraison'),
    b('Catch refund conditions, store credits, prepaid returns and delivery schedules.', 'Saisir modalités de remboursement, avoirs, étiquettes de retour et livraisons.'),
    [b('Distinguish a refund from a store credit (avoir)', 'Distinguer remboursement et avoir'), b('Catch working-day timelines (jours ouvrés)', 'Comprendre les délais en jours ouvrés'), b('Follow delivery rescheduling options', 'Suivre les options de relivraison')],
    13,
    [
      card(b('Refunds and deliveries', 'Remboursements et livraisons'), b('Agents propose clear solutions: **un bon de retour prépayé** (prepaid return label), **un remboursement sur votre carte** (card refund), **un avoir valable un an** (store credit valid for one year), **sous cinq jours ouvrés** (within 5 business days), **déposé en point relais** (dropped at a parcel pick-up shop).', 'Les conseillers proposent des solutions précises : **un bon de retour prépayé**, **un remboursement sur votre carte**, **un avoir valable un an**, **sous cinq jours ouvrés**, **déposé en point relais**.'), {
        ex: [['Vous recevrez le virement sous trois à cinq jours ouvrés.', 'You will receive the transfer within 3 to 5 business days.'], ['Le colis est disponible en point relais jusqu’à vendredi.', 'The parcel is available at the pick-up point until Friday.']],
      }),
      trap(b('Un avoir vs un remboursement', 'Un avoir ou un remboursement'), b('**Un remboursement** puts money back on your bank card. **Un avoir** is store credit: you can only spend it with the same merchant! Always listen carefully to which one is offered.', '**Un remboursement** rend l’argent sur votre carte. **Un avoir** est un bon d’achat utilisable uniquement chez le même vendeur ! Écoutez bien lequel on vous propose.')),
      hear('Je viens de vous envoyer une étiquette de retour prépayée. Dès réception du colis à l’entrepôt, le remboursement sera effectué sous cinq jours ouvrés.', b('When will the refund be issued?', 'Quand le remboursement sera-t-il effectué ?'), [b('Within 5 business days after the warehouse receives the parcel', 'Sous 5 jours ouvrés après réception du colis à l’entrepôt'), b('Immediately while you are still on the phone', 'Immédiatement pendant l’appel'), b('Only as a store voucher next month', 'Uniquement en avoir le mois prochain'), b('After you pay return shipping yourself', 'Après avoir payé les frais de retour')], { voice: 'f' }),
      hear('Le livreur n’a pas pu accéder à votre immeuble ce matin. Souhaitez-vous une nouvelle présentation demain entre huit heures et midi, ou un dépôt en point relais ?', b('What two options does the courier offer?', 'Quelles deux options le livreur propose-t-il ?'), [b('Redelivery tomorrow morning or drop-off at a pick-up point', 'Relivraison demain matin ou dépôt en point relais'), b('Picking it up at the airport or cancelling', 'Retrait à l’aéroport ou annulation'), b('Leaving it outside in the rain or next week', 'Dépôt dans la rue ou la semaine prochaine'), b('Paying double shipping or waiting a month', 'Payer double port ou attendre un mois')], { voice: 'm2' }),
      dlg(b('Choosing a refund or credit', 'Choisir entre remboursement et avoir'), b('Your damaged parcel was returned and the agent calls with options.', 'Votre colis abîmé a été renvoyé et le conseiller vous propose des options.'), [['Conseiller', 'm'], ['Vous', 'f2']], [
        [0, 'Votre colis est bien arrivé chez nous. Préférez-vous un avoir majoré de dix pour cent, ou un remboursement intégral ?', 'Your parcel reached us. Do you prefer store credit plus 10%, or a full refund?'],
        [1, 'Je préfère un remboursement sur ma carte bancaire, s’il vous plaît.', 'I prefer a refund to my bank card, please.'],
        [0, { options: ['C’est noté : le virement apparaîtra sous quatre jours ouvrés.', 'C’est noté : votre colis repart en point relais.', 'D’accord, l’avoir est bloqué dans l’entrepôt.'] }],
        [1, 'Parfait. Vais-je recevoir un reçu par courriel ?', 'Perfect. Will I receive a receipt by email?'],
        [0, { options: ['Oui, dans quelques minutes, avec votre numéro de suivi.', 'Oui, par téléphone dans quatre ans.', 'Non, le livreur garde votre carte.'] }],
      ], true),
      pairs(P.match, [['un avoir', b('store credit / voucher', 'bon d’achat chez le vendeur')], ['jours ouvrés', b('business / working days', 'jours travaillés hors week-end')], ['un point relais', b('parcel pick-up shop', 'commerce où retirer un colis')], ['une étiquette prépayée', b('a prepaid return label', 'étiquette de retour déjà payée')]]),
      dict('Le remboursement sera effectué sous cinq jours ouvrés.', { voice: 'f' }),
    ],
    [
      b('remboursement = money back; avoir = store credit.', 'remboursement = argent rendu ; avoir = crédit boutique.'),
      b('jours ouvrés = working days (usually Mon–Fri).', 'jours ouvrés = jours travaillés.'),
      b('point relais = local shop holding parcels for pick-up.', 'point relais = commerce de dépôt de colis.'),
    ],
    [['un avoir', b('store credit', 'somme à dépenser dans le même magasin')], ['ouvré', b('working, business (day)', 'jour travaillé')], ['un entrepôt', b('a warehouse', 'bâtiment de stockage')]],
  ),
];
