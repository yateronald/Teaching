import type { CourseAbout } from '../../types';
import { b, card, dict, dlg, doc, gap, hear, lesson, mc, ord, P, pairs, say, sort, tip, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Chasing an application stuck in review, handling a technician who never showed up or contesting a double charge requires calm precision in French. This B1 conversation course trains you to follow up on an administrative file with a reference number, resolve repair delays and billing errors, ask politely for a supervisor, secure written confirmation and draft a clear formal claim email.',
    'Relancer un dossier bloqué, gérer un technicien qui n’est pas venu ou contester un prélèvement en double exige du calme et de la précision en français. Ce cours de conversation B1 vous entraîne à suivre un dossier administratif avec son numéro, résoudre retards d’intervention et erreurs de facture, demander un responsable poliment, obtenir une trace écrite et rédiger un courriel de réclamation efficace.',
  ),
  outcomes: [
    b('Follow up on a file and spot missing documents', 'Suivre un dossier et vérifier les pièces manquantes'),
    b('Report missed repair slots and billing errors', 'Signaler rendez-vous manqués et erreurs de facturation'),
    b('Escalate calmly to a supervisor or mediator', 'Demander un responsable ou saisir le médiateur'),
    b('Secure written confirmation and draft claim emails', 'Obtenir un écrit et rédiger une réclamation formelle'),
  ],
};

const C = 'c-bureaucracy-claims';
export default [
  lesson(C, 1, ['following-up-on-a-file', 'suivre-un-dossier'],
    b('Following up on a file', 'Suivre un dossier administratif'),
    b('Quote your reference number, verify missing papers and get a realistic timeline.', 'Donner son numéro de dossier, vérifier les pièces manquantes et obtenir un délai.'),
    [b('Check the status of an application', 'Vérifier l’avancement d’un dossier'), b('Understand administrative notices', 'Lire un avis de pièce manquante'), b('Follow up politely by phone', 'Relancer poliment par téléphone')],
    13,
    [
      card(b('Checking your file', 'Faire le point sur un dossier'), b('**Je vous appelle pour faire le point sur mon dossier numéro… · J’ai déposé toutes les pièces justificatives le… · Où en est le traitement de ma demande ? · Le dossier est en cours de traitement / en attente de validation. · Pourriez-vous vérifier s’il manque un document ?**', '**Je vous appelle pour faire le point sur mon dossier numéro… · J’ai déposé toutes les pièces justificatives le… · Où en est le traitement de ma demande ? · Le dossier est en cours de traitement / en attente de validation. · Pourriez-vous vérifier s’il manque un document ?**'), {
        ex: [['Pourriez-vous me dire où en est le traitement de mon dossier ?', 'Could you tell me how my application is progressing?'], ['J’ai déjà téléversé mon justificatif de domicile.', 'I already uploaded my proof of address.']],
      }),
      doc({ look: 'email', title: b('Administrative update', 'Suivi de votre dossier'), text: 'Objet : Votre demande n° 2026-4819 — Pièce manquante\n\nMadame, Monsieur,\nVotre dossier est actuellement en attente. La copie de votre justificatif de domicile de moins de trois mois est illisible.\nMerci de téléverser un document net dans votre espace personnel sous huit jours afin d’éviter la clôture du dossier.' }, b('Why is the application on hold?', 'Pourquoi le dossier est-il en attente ?'), [b('the proof of address is unreadable', 'le justificatif de domicile est illisible'), b('the file was closed eight days ago', 'le dossier a été clôturé il y a huit jours'), b('the fee has not been paid', 'les frais n’ont pas été payés'), b('the passport has expired', 'le passeport est expiré')]),
      dlg(b('Calling the administration', 'Appeler le service des dossiers'), undefined, [['Agent', 'm'], ['Vous', 'f']], [
        [0, 'Bonjour, service des demandes en ligne, j’écoute.', 'Hello, online applications desk, speaking.'],
        [1, { options: ['Bonjour monsieur, j’appelle pour faire le point sur mon dossier numéro quarante-huit dix-neuf.', 'Mon dossier est nul.', 'Donnez-moi mon papier.'] }],
        [0, 'Un instant… Oui, il est en attente parce que votre justificatif est illisible.', 'One moment… Yes, it’s on hold because your proof of address is unreadable.'],
        [1, { options: ['D’accord, merci ! Si je le téléverse aujourd’hui, quel sera le délai de validation ?', 'Non, il est très beau !', 'Alors je laisse tomber.'] }],
        [0, 'Comptez environ cinq jours ouvrés.', 'Allow around five working days.'],
      ], true),
      pairs(P.match, [['une pièce justificative', b('supporting document', 'document qui prouve un fait')], ['en cours de traitement', b('being processed', 'dossier à l’étude')], ['relancer', b('to follow up', 'rappeler ou réécrire')], ['téléverser', b('to upload', 'envoyer un fichier en ligne')]]),
      ord(P.order, 'Pourriez-vous me dire où en est le traitement de mon dossier ?', { tr: 'Could you tell me what stage my file is at?', extra: ['courrier'] }),
      say('Bonjour, je vous appelle au sujet du dossier quatre-huit-un-neuf pour savoir s’il manque une pièce.', 'Hello, I’m calling about file 4819 to check whether a document is missing.'),
    ],
    [
      b('faire le point sur · où en est le traitement de… ?', 'faire le point sur · où en est le traitement de… ?'),
      b('une pièce justificative · téléverser · sous huit jours.', 'une pièce justificative · téléverser · sous huit jours.'),
      b('jours ouvrés = working days.', 'jours ouvrés = jours de travail (hors week-end).'),
    ],
    [['une pièce justificative', b('supporting document', 'document exigé pour prouver')], ['téléverser', b('to upload', 'envoyer en ligne')], ['clôturer', b('to close (a file)', 'fermer définitivement')]],
  ),
  lesson(C, 2, ['repairs-and-service-delays', 'retards-de-reparation-et-facturation'],
    b('Repairs, delays & billing errors', 'Retards de réparation et facturation'),
    b('Report a missed appointment, challenge an unfair charge and ask for compensation.', 'Signaler un rendez-vous manqué, contester des frais et demander un geste commercial.'),
    [b('Describe a missed repair appointment', 'Signaler une absence de technicien'), b('Dispute a double or unfair charge', 'Contester un prélèvement injustifié'), b('Ask for fee cancellation or credit', 'Demander annulation de frais ou geste commercial')],
    13,
    [
      card(b('Missed slots & double charges', 'Interventions et factures'), b('Delays: **Le technicien devait passer entre 8 h et 12 h, mais personne ne s’est présenté. · Ça fait trois semaines que j’attends la réparation.** Billing: **J’ai constaté un prélèvement en double. · Je demande l’annulation de ces frais et un geste commercial. · Quel délai me garantissez-vous ?**', 'Retards : **Le technicien devait passer entre 8 h et 12 h, mais personne ne s’est présenté. · Ça fait trois semaines que j’attends la réparation.** Facturation : **J’ai constaté un prélèvement en double. · Je demande l’annulation de ces frais et un geste commercial. · Quel délai me garantissez-vous ?**'), {
        ex: [['J’ai posé une demi-journée pour rien : personne n’est passé.', 'I took half a day off for nothing: nobody came.'], ['Je demande le remboursement de ce prélèvement injustifié.', 'I’m requesting a refund for this unjustified debit.']],
      }),
      hear('Nous sommes sincèrement désolés pour l’absence du technicien ce matin. Je vous propose un nouveau créneau prioritaire demain entre neuf heures et onze heures, et nous vous offrons un mois d’abonnement.', b('What compensation is offered?', 'Quel dédommagement est proposé ?'), [b('a priority slot tomorrow and one free month', 'un créneau prioritaire demain et un mois offert'), b('a refund of the entire year', 'le remboursement de toute l’année'), b('a visit next week with a fee', 'une visite la semaine prochaine payante'), b('only an apology by post', 'seulement des excuses par courrier')], { voice: 'f' }),
      sort(b('Billing issue or repair delay?', 'Facturation ou retard d’intervention ?'), [b('billing issue', 'facturation'), b('repair or delay', 'réparation et délai')], [['un prélèvement en double', 0], ['le technicien ne s’est pas présenté', 1], ['des frais d’annulation injustifiés', 0], ['la pièce détachée est en rupture', 1], ['une erreur sur la facture', 0], ['l’intervention a été reportée deux fois', 1]]),
      mc(P.best, ['Comme l’incident vient de votre réseau et non de mon installation, je demande l’annulation des frais de déplacement.', 'Je refuse tout et je raccroche !', 'Vos techniciens sont tous incapables.', 'Envoyez une facture encore plus grande.'], { fr: 'On vous a facturé des frais de déplacement alors que la panne venait du réseau :' }),
      dict('J’ai posé une demi-journée de congé pour accueillir le technicien, mais personne n’est passé.', { voice: 'm2' }),
      say('J’ai constaté un prélèvement en double sur ma facture de mars ; pouvez-vous le régulariser ?', 'I noticed a double debit on my March bill; could you rectify it?'),
    ],
    [
      b('personne ne s’est présenté · un créneau prioritaire.', 'personne ne s’est présenté · un créneau prioritaire.'),
      b('un prélèvement en double · régulariser une facture.', 'un prélèvement en double · régulariser une facture.'),
      b('un geste commercial = goodwill credit / discount.', 'un geste commercial = remise ou mois offert.'),
    ],
    [['un prélèvement', b('a direct debit / charge', 'somme retirée automatiquement')], ['un geste commercial', b('goodwill gesture / credit', 'compensation offerte au client')], ['régulariser', b('to rectify, settle', 'corriger une erreur comptable')]],
  ),
  lesson(C, 3, ['escalating-firmly-and-formally', 'escalader-et-obtenir-gain-de-cause'],
    b('Escalating calmly & in writing', 'Escalader et confirmer par écrit'),
    b('Ask for a supervisor, demand written proof and write a formal claim email.', 'Demander un responsable, exiger un écrit et rédiger un courriel de réclamation.'),
    [b('Escalate politely to a supervisor', 'Demander un responsable sans agressivité'), b('Insist on written confirmation', 'Exiger un récapitulatif écrit'), b('Write a crisp formal claim email', 'Rédiger un courriel de réclamation précis')],
    13,
    [
      card(b('Escalating with impact', 'Escalader avec fermeté'), b('**Je comprends que vous appliquiez la procédure, mais cette situation dure depuis trop longtemps. · Puis-je parler à votre responsable ou au service réclamations ? · Merci de me confirmer cet engagement par courriel. · Sans réponse sous huit jours, je saisirai le médiateur.**', '**Je comprends que vous appliquiez la procédure, mais cette situation dure depuis trop longtemps. · Puis-je parler à votre responsable ou au service réclamations ? · Merci de me confirmer cet engagement par courriel. · Sans réponse sous huit jours, je saisirai le médiateur.**'), {
        ex: [['Pourriez-vous me transférer à un responsable, s’il vous plaît ?', 'Could you transfer me to a supervisor, please?'], ['Sans solution sous dix jours, je saisirai le médiateur.', 'Without a solution within ten days, I’ll escalate to the ombudsman.']],
      }),
      tip(b('Always get it in writing', 'Gardez toujours une trace écrite'), b('Verbal promises on a hotline are easy to lose. End every call with: **« Pourriez-vous m’envoyer un courriel récapitulatif avec le numéro de suivi ? »**', 'Une promesse orale au téléphone se perd vite. Terminez toujours l’appel par : **« Pourriez-vous m’envoyer un courriel récapitulatif avec le numéro de suivi ? »**')),
      mc(P.best, ['Je comprends vos consignes, mais mon dossier est bloqué depuis six semaines : pourriez-vous me transférer à un responsable ?', 'Vous ne servez à rien, passez-moi le patron !', 'Bon, je raccroche et j’abandonne.', 'Je vais crier jusqu’à ce que vous régliez ça.'], { fr: 'Le conseiller répète qu’il ne peut rien faire de plus :' }),
      gap(P.complete, 'Sans solution sous huit jours, je me verrai ___ de saisir le ___ de la consommation.', [['contraint', 'contrainte', 'obligé', 'obligée'], 'médiateur']),
      write(b('Formal claim email', 'Courriel de réclamation'), b('Write a formal claim email (70–105 words) to your internet provider: give your file number, state two failed technician visits and an unfair charge, demand a fee waiver and urgent appointment within 8 days, and ask for email confirmation.', 'Rédigez un courriel de réclamation (70–105 mots) à votre fournisseur internet : donnez votre numéro de dossier, rappelez deux rendez-vous manqués et des frais injustifiés, exigez l’annulation des frais et un passage sous huit jours, puis demandez confirmation écrite.'), 70, 105, [
        b('File reference number', 'Numéro de dossier'),
        b('Facts: missed appointments and wrong charge', 'Faits : rendez-vous manqués et prélèvement erroné'),
        b('Clear deadline and demand for refund', 'Délai précis et demande d’annulation'),
        b('Request for written confirmation', 'Demande de confirmation par courriel'),
      ], 'Madame, Monsieur, Je vous écris au sujet de mon dossier numéro 2026-412. Malgré deux rendez-vous confirmés les 4 et 11 avril, aucun technicien ne s’est présenté pour rétablir ma ligne internet. De plus, j’ai constaté un prélèvement de 39 euros sur ma dernière facture alors que le service ne fonctionne toujours pas. Je vous demande donc l’annulation immédiate de ces frais et une intervention prioritaire sous huit jours. Merci de me confirmer ces dispositions par courriel. Cordialement, Nadia Diallo', { phrases: ['Je vous écris au sujet de…', 'Malgré…', 'Je vous demande donc…', 'Merci de me confirmer…'] }),
      say('Merci de me confirmer par courriel que le remboursement sera effectué sous dix jours.', 'Thank you for confirming by email that the refund will be processed within ten days.'),
    ],
    [
      b('Je comprends vos consignes, mais… · Puis-je parler à un responsable ?', 'Je comprends vos consignes, mais… · Puis-je parler à un responsable ?'),
      b('confirmer par écrit / par courriel · numéro de suivi.', 'confirmer par écrit / par courriel · numéro de suivi.'),
      b('saisir le médiateur · sous huit jours.', 'saisir le médiateur · sous huit jours.'),
    ],
    [['un responsable', b('a manager / supervisor', 'personne ayant autorité')], ['le médiateur', b('ombudsman / mediator', 'tiers neutre en cas de litige')], ['par écrit', b('in writing', 'trace sur papier ou courriel')]],
  ),
];
