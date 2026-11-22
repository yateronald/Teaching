import type { CourseAbout } from '../../types';
import { b, card, dlg, doc, gap, hear, lesson, mc, P, pairs, say, sort, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'When a key client threatens to cancel over a missed delivery or service outage, defensive excuses or blunt phrasing make the crisis worse. At B2, de-escalation requires acknowledging frustration calmly, explaining root causes without shifting blame, negotiating fair commercial remedies and setting clear follow-up milestones. This course trains you on live client calls, angry escalation emails and structured apology-and-recovery replies.',
    'Lorsqu’un client majeur menace de résilier après un retard ou une panne, des excuses défensives ou un ton sec aggravent la crise. Au niveau B2, désamorcer la tension exige de reconnaître l’insatisfaction avec calme, d’expliquer la cause sans se défausser, de proposer un geste commercial adapté et de fixer un suivi clair. Ce cours entraîne appels tendus, lecture de réclamations et rédaction de réponses de sortie de crise.',
  ),
  outcomes: [
    b('De-escalate angry calls with calm active listening and clear action', 'Désamorcer un appel tendu par l’écoute active et des actions immédiates'),
    b('Avoid defensive jargon and blame-shifting phrases', 'Éviter jargon défensif et formulations qui rejettent la faute'),
    b('Negotiate proportional remedies (avoir, gestes commerciaux, SLAs)', 'Négocier des compensations justes (avoir, geste commercial, suivi)'),
    b('Write a structured B2 apology and recovery email', 'Rédiger un courriel d’excuses et de remédiation de niveau B2'),
  ],
};

const C = 'bz-crisis-clients';
export default [
  lesson(C, 1, ['de-escalating-live-tension', 'desamorcer-la-tension'],
    b('De-escalating live client tension', 'Désamorcer la tension en direct'),
    b('Listen, validate frustration without false promises and regain control of a call.', 'Écouter, valider la frustration sans fausses promesses et reprendre la main.'),
    [b('Acknowledge impact calmly (vous avez raison de…)', 'Reconnaître l’impact avec calme'), b('Separate empathy from unverified promises', 'Distinguer empathie et promesses impossibles'), b('Steer an angry caller toward immediate steps', 'Orienter le client vers des actions concrètes')],
    13,
    [
      card(b('De-escalation toolkit', 'Phrases pour désamorcer'), b('Validate: **Je comprends tout à fait votre mécontentement. · Vous êtes en droit d’attendre mieux de notre part.** Own the next step: **Laissez-moi vérifier immédiatement ce qui s’est passé. · Voici ce que je peux faire dès cet après-midi.** Avoid: **Ce n’est pas ma faute · Vous avez mal lu · Calmez-vous.**', 'Valider : **Je comprends tout à fait votre mécontentement. · Vous êtes en droit d’attendre mieux.** Agir : **Je vérifie immédiatement la situation. · Voici ce que je mets en place dès aujourd’hui.** À proscrire : **Ce n’est pas ma faute · Calmez-vous.**')),
      dlg(b('Tense call with an account client', 'Appel tendu avec un client clé'), undefined, [['Client (M. Renaud)', 'm'], ['Vous (responsable compte)', 'f']], [
        [0, 'C’est inadmissible ! Notre plateforme est bloquée depuis ce matin et personne ne répond à nos tickets !', 'This is unacceptable! Our platform has been down since morning and nobody answers our tickets!'],
        [1, { options: ['Je comprends tout à fait votre frustration, Monsieur Renaud, et je mesure l’impact pour vos équipes. Je prends ce dossier en main immédiatement.', 'Calmez-vous s’il vous plaît, nos techniciens ont beaucoup de travail.', 'Ce n’est pas notre service, vous devez appeler l’hébergeur.'] }],
        [0, 'Très bien, mais mes conseillers ne peuvent pas travailler. Quand est-ce que ce sera rétabli ?', 'Fine, but my advisers cannot work. When will it be restored?'],
        [1, { options: ['Je vous donne une première réponse technique d’ici trente minutes par téléphone, avec un point horaire jusqu’à la résolution complète.', 'C’est réglé dans deux minutes, c’est promis.', 'Je ne sais pas du tout, attendez demain.'] }],
      ]),
      hear('Bonjour, je vous appelle suite à la coupure de ce matin. Je vous présente nos excuses pour ce délai de réponse anormal. Notre équipe d’astreinte travaille déjà sur le serveur, et je vous tiens informé toutes les heures jusqu’au retour à la normale.', b('What commitment does the speaker make?', 'Quel engagement prend l’interlocuteur ?'), [b('To update the client every hour until service returns to normal', 'Donner des nouvelles toutes les heures jusqu’au rétablissement'), b('To refund an entire year immediately', 'Rembourser une année entière sur-le-champ'), b('To close the account tomorrow', 'Fermer le compte client demain'), b('To blame the external server provider', 'Rejeter la faute sur l’hébergeur')], { voice: 'm' }),
      sort(b('De-escalating or inflammatory?', 'Formule apaisante ou contre-productive ?'), [b('de-escalating', 'apaisante et pro'), b('inflammatory / defensive', 'défensive / irritante')], [['Je mesure l’impact de cet incident.', 0], ['Vous n’avez qu’à relire nos conditions.', 1], ['Je prends personnellement le suivi.', 0], ['Calmez-vous, ce n’est rien.', 1], ['Voici l’heure précise du prochain point.', 0]]),
      pairs(P.match, [['prendre en main', b('to take personal ownership of', 's’occuper directement de')], ['mesurer l’impact', b('to appreciate the impact', 'comprendre les conséquences')], ['rétablir le service', b('to restore the service', 'remettre en marche')], ['un point horaire', b('an hourly update', 'nouvelle chaque heure')]]),
      say('Je comprends tout à fait votre mécontentement et je prends personnellement le dossier en main dès maintenant.', 'I completely understand your dissatisfaction and I am taking personal ownership of the file right now.'),
    ],
    [
      b('Validate frustration + own the follow-up + give a concrete update time.', 'Validez l’impact + prenez le dossier en main + fixez une heure de retour.'),
      b('Never tell an angry client « calmez-vous » or shift blame onto another team.', 'Ne dites jamais « calmez-vous » et ne rejetez pas la faute sur un autre service.'),
      b('Promise reliable communication intervals (point horaire) rather than guesses.', 'Promettez un rythme fiable de nouvelles plutôt qu’une heure de fin incertaine.'),
    ],
    [['le mécontentement', b('dissatisfaction', 'insatisfaction vive')], ['se défausser', b('to pass the buck, shift blame', 'rejeter la faute sur autrui')], ['l’astreinte', b('on-call duty', 'équipe d’urgence disponible')]],
  ),
  lesson(C, 2, ['structured-apology-and-root-cause', 'excuses-et-analyse-des-causes'],
    b('Root-cause explanations without blame', 'Excuses écrites et causes sans se défausser'),
    b('Explain what went wrong factually and show what prevents a repeat.', 'Expliquer la cause avec transparence et présenter les mesures préventives.'),
    [b('Read a sharp client escalation email carefully', 'Analyser tous les griefs d’un courriel de réclamation'), b('Explain root causes factually without weak excuses', 'Expliquer une panne sans excuses faibles'), b('Distinguish preventive action from mere apology', 'Distinguer excuses de mesures correctives durables')],
    13,
    [
      card(b('Four parts of a crisis reply', 'Les quatre temps de la réponse écrite'), b('1. **Accuser réception et s’excuser clairement** (*Nous vous présentons nos sincères excuses pour…*). 2. **Rappeler les faits sans minimiser**. 3. **Expliquer la cause avec sobriété** (*Cet incident est dû à…*, without hiding behind passive vagueness). 4. **Annoncer les mesures correctives** pour éviter toute récidive.', '1. **Accuser réception et s’excuser franchement**. 2. **Reconnaître les faits sans minimiser**. 3. **Expliquer factuellement la cause**. 4. **Préciser les mesures préventives** pour éviter la récidive.')),
      doc({ look: 'email', title: b('Client escalation email', 'Courriel de réclamation'), text: 'Objet : Rupture de service répétée — Contrat #774\n\nBonjour,\n\nC’est la deuxième fois ce trimestre que nos commandes sont bloquées pendant plus de quatre heures. Nos équipes perdent un temps précieux et nos clients finals s’impatientent. Sans réponse précise sur les causes et les mesures engagées d’ici vendredi, nous envisagerons de ne pas renouveler notre contrat.\n\nCordialement,\nSophie Garnier' }, b('What two things does Sophie Garnier demand before Friday?', 'Quelles deux réponses Sophie Garnier exige-t-elle avant vendredi ?'), [b('A clear explanation of root causes and concrete corrective actions', 'L’explication précise des causes et les mesures correctives engagées'), b('Immediate termination of contract #774', 'La résiliation immédiate du contrat #774'), b('A phone call to her end customers', 'Un appel direct à ses clients finals'), b('Hiring new staff in her company', 'Le recrutement d’une nouvelle équipe chez elle')]),
      mc(P.best, ['L’incident résulte d’une mise à jour déployée sans test de charge suffisant ; nous avons déjà instauré une double validation avant toute sortie.', 'Des choses techniques compliquées sont arrivées indépendamment de notre volonté.', 'Ce problème est mineur et ne mérite pas de courriel.', 'Votre équipe a probablement cliqué au mauvais endroit.'], { fr: 'Quelle formulation explique la cause avec professionnalisme ?' }),
      pairs(P.match, [['la récidive', b('a repeat occurrence', 'retour du même incident')], ['une mesure corrective', b('a corrective action', 'action pour réparer durablement')], ['minimiser les faits', b('to downplay the facts', 'réduire la gravité')], ['engager des actions', b('to initiate concrete actions', 'lancer des mesures concrètes')]]),
      gap(P.complete, 'Afin d’éviter toute ___ de cet incident, nous avons déployé une double ___ automatique.', ['récidive', 'vérification']),
      say('Nous assumons pleinement cet incident et nous avons déjà mis en place des mesures préventives durables.', 'We take full responsibility for this incident and have already put lasting preventive measures in place.'),
    ],
    [
      b('Address every point raised by the client (impact, root cause, prevention).', 'Répondez à chaque attente : impact, cause réelle, prévention.'),
      b('Avoid empty phrases like « indépendamment de notre volonté » when your team caused it.', 'Évitez « indépendamment de notre volonté » si la responsabilité est interne.'),
      b('Show how you prevent a repeat (éviter toute récidive).', 'Montrez comment vous évitez la récidive.'),
    ],
    [['la récidive', b('recurrence, repeat', 'répétition d’un problème')], ['assumer', b('to take responsibility for', 'reconnaître sa part')], ['factuel', b('factual, objective', 'fondé sur les faits')]],
  ),
  lesson(C, 3, ['remedies-compensation-and-retention', 'geste-commercial-et-fidelisation'],
    b('Remedies, compensation and keeping trust', 'Geste commercial et fidélisation'),
    b('Propose fair remedies and write a calm, trust-rebuilding crisis response.', 'Proposer une compensation juste et rédiger une réponse B2 qui préserve la confiance.'),
    [b('Offer commercial remedies precisely (avoir, remise, suivi)', 'Proposer un geste commercial clair (avoir, remise, suivi)'), b('Rebuild trust with a concrete follow-up date', 'Rétablir la confiance avec un rendez-vous de suivi'), b('Write a formal client crisis apology email', 'Rédiger un courriel complet de sortie de crise')],
    13,
    [
      card(b('Remedies and retention', 'Geste commercial et reconquête'), b('Offer proportionate remedies cleanly: **À titre de geste commercial, nous établissons un avoir de… · Nous vous offrons les frais d’expédition / un mois d’abonnement. · Je reste votre interlocuteur dédié et vous propose un point de bilan dans dix jours (à J+10).**', 'Proposez une réparation claire : **À titre de geste commercial, nous émettons un avoir de… · Nous prenons en charge les frais de… · Je demeure votre interlocuteur dédié et vous propose un bilan à J+10.**')),
      mc(P.best, ['À titre de geste commercial, nous appliquons un avoir de 15 % sur votre prochaine facture et je vous propose un point de suivi mardi prochain.', 'Voici 5 euros pour acheter un café.', 'Si vous partez, tant pis pour vous.', 'Nous ne faisons jamais de geste commercial par principe.'], { fr: 'Pour retenir un client B2B après une erreur de facturation répétée :' }),
      pairs(P.match, [['un geste commercial', b('goodwill gesture / compensation', 'avantage offert après un souci')], ['un avoir', b('a credit note', 'somme déduite d’une facture future')], ['un interlocuteur dédié', b('a dedicated point of contact', 'personne attitrée')], ['à J+10', b('10 days later', 'dix jours après l’événement')]]),
      gap(P.complete, 'À titre de geste ___, nous émettons un ___ de 20 % sur votre facture mensuelle.', ['commercial', 'avoir']),
      write(b('Crisis apology & remedy email', 'Courriel d’excuses et de solution'), b('Reply (75–115 words) to Sophie Garnier’s escalation email (Contract #774): sincerely apologise for the two outages, state the factual cause (server update) and preventive measure (pre-release load testing), offer a 20% credit note on this month’s invoice, and propose a follow-up call on Friday at 10 a.m.', 'Répondez (75–115 mots) à Sophie Garnier (Contrat #774) : excusez-vous franchement des deux pannes, expliquez la cause factuelle (mise à jour serveur) et la mesure préventive (tests de charge), proposez un avoir de 20 % ce mois-ci, et fixez un appel vendredi à 10 h.'), 75, 115, [
        b('Sincere apology and reference to Contract #774', 'Excuses sincères et référence au contrat #774'),
        b('Root cause + concrete preventive action', 'Cause factuelle et mesure contre la récidive'),
        b('Commercial remedy (20% credit note) + Friday 10 a.m. check-in', 'Avoir de 20 % et point de suivi vendredi à 10 h'),
      ], 'Objet : Réponse suite aux incidents — Contrat #774\n\nBonjour Madame Garnier,\n\nJe vous présente nos sincères excuses pour les deux interruptions de service subies ce trimestre et leur impact sur vos équipes.\n\nL’analyse technique confirme que la panne provenait d’une mise à jour déployée sans test de charge complet. Afin d’éviter toute récidive, nous avons instauré une validation automatique avant chaque déploiement.\n\nÀ titre de geste commercial, nous émettons dès aujourd’hui un avoir de 20 % sur votre facture mensuelle. Je reste votre interlocuteur dédié et vous propose un point téléphonique vendredi à 10 h pour confirmer la stabilité.\n\nBien cordialement,\nJulien Morel'),
      say('À titre de geste commercial, nous établissons un avoir de vingt pour cent et je vous rappelle vendredi.', 'As a goodwill gesture, we are issuing a twenty per cent credit note and I will call you back Friday.'),
    ],
    [
      b('Avoir = credit note deducted from an invoice; geste commercial = goodwill remedy.', 'Avoir = déduction sur facture ; geste commercial = compensation offerte.'),
      b('Assign a single dedicated contact (interlocuteur dédié) during recovery.', 'Désignez un interlocuteur dédié pour sécuriser la relation.'),
      b('Close crisis emails with a dated follow-up check-in to rebuild confidence.', 'Terminez par un point de contrôle daté pour prouver le suivi dans la durée.'),
    ],
    [['un avoir', b('a credit note', 'somme créditée au client')], ['un interlocuteur dédié', b('dedicated contact person', 'référent unique')], ['rétablir la confiance', b('to rebuild trust', 'regagner la confiance')]],
  ),
];
