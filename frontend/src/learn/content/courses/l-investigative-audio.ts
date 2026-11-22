import type { CourseAbout } from '../../types';
import { b, card, dict, dlg, hear, lesson, mc, P, pairs, sort, trap } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Long-form investigative podcasts and radio documentaries weave timelines, conflicting witnesses, leaked audits and careful journalistic hedging into dense narratives. One missed connector or conditional verb changes who knew what and when. This B2 course trains you to reconstruct chronologies, cross-check contradictory testimonies and weigh evidence versus allegations.',
    'Les grands reportages audio et balados d’enquête mêlent chronologies, témoignages contradictoires, audits internes et prudence journalistique. Un seul connecteur ou un conditionnel manqué change qui savait quoi et à quel moment. Ce cours de niveau B2 vous entraîne à reconstruire des chronologies, croiser des témoignages et distinguer preuves et allégations.',
  ),
  outcomes: [
    b('Track non-linear timelines using temporal markers', 'Suivre une chronologie non linéaire grâce aux marqueurs temporels'),
    b('Cross-check testimonies and spot evasion or corroboration', 'Croiser les témoignages et repérer esquive ou corroboration'),
    b('Distinguish verified evidence from journalistic allegations', 'Distinguer preuve vérifiée et allégation au conditionnel'),
    b('Synthesise multi-voice investigative reports accurately', 'Synthétiser avec rigueur un reportage à plusieurs voix'),
  ],
};

const C = 'l-investigative-audio';
export default [
  lesson(C, 1, ['reconstructing-timelines', 'reconstruire-une-chronologie'],
    b('Reconstructing timelines and turning points', 'Reconstruire une chronologie et les faits clés'),
    b('Track causes, warnings and aftermath when a report jumps back and forth in time.', 'Suivre causes, alertes et suites quand un reportage fait des allers-retours dans le temps.'),
    [b('Decode en amont, dans la foulée, entre-temps', 'Décoder en amont, dans la foulée, entre-temps'), b('Order events in a non-linear narrative', 'Ordonner les faits d’un récit non linéaire'), b('Catch turning points and delays', 'Repérer bascules et délais')],
    13,
    [
      card(b('Time-anchor connectors', 'Les repères chronologiques d’enquête'), b('Investigative narration rarely starts at the beginning. Listen for backward jumps: **tout remonte à…** (it all goes back to…), **en amont** (upstream / beforehand), **à l’époque des faits** (at the time). Forward jumps: **dans la foulée** (immediately afterwards), **entre-temps** (meanwhile), **à l’issue de** (at the end of).', 'Un reportage commence rarement par le début. Repérez les retours en arrière : **tout remonte à…**, **en amont**, **à l’époque des faits**. Les avancées : **dans la foulée**, **entre-temps**, **à l’issue de**.'), {
        ex: [['En amont du vote, deux alertes avaient été émises.', 'Ahead of the vote, two warnings had been issued.'], ['Dans la foulée de l’audit, le directeur a démissionné.', 'Right after the audit, the director resigned.']],
      }),
      hear('Si la crise éclate en octobre, nos documents montrent qu’en amont, dès le mois de mars, les ingénieurs avaient déjà signalé une fuite sur le réseau.', b('When did engineers first flag the leak?', 'Quand les ingénieurs ont-ils signalé la fuite pour la première fois ?'), [b('In March, months before the October crisis', 'En mars, bien avant la crise d’octobre'), b('In October, after the crisis broke out', 'En octobre, après le début de la crise'), b('Right after the resignation in December', 'Juste après la démission en décembre'), b('They never flagged any leak', 'Ils n’ont jamais signalé de fuite')], { voice: 'f' }),
      hear('À l’issue de six mois d’enquête interne, la mairie a suspendu le contrat ; entre-temps, l’entreprise avait déjà facturé trois tranches de travaux.', b('What happened while the inquiry was underway?', 'Que s’était-il passé pendant l’enquête interne ?'), [b('The company had already billed three phases of work', 'L’entreprise avait déjà facturé trois tranches de travaux'), b('The city immediately paid a bonus', 'La ville a versé une prime sur-le-champ'), b('The contract had been cancelled six months earlier', 'Le contrat avait été annulé six mois plus tôt'), b('No work had started yet', 'Aucun travail n’avait commencé')], { voice: 'm' }),
      hear('Tout bascule le 12 juin : un courriel fuite dans la presse, et dans la foulée, la commission convoque une audition d’urgence.', b('What triggered the emergency hearing?', 'Qu’est-ce qui a déclenché l’audition d’urgence ?'), [b('A leaked email published on June 12', 'Un courriel ayant fuité le 12 juin'), b('A routine annual meeting', 'Une réunion annuelle ordinaire'), b('A court ruling from the previous year', 'Une décision de justice de l’année précédente'), b('A strike by city drivers', 'Une grève des chauffeurs municipaux')], { voice: 'f2' }),
      sort(b('Before the crisis or after / result?', 'En amont (avant) ou suite / conséquence ?'), [b('earlier / beforehand', 'avant / en amont'), b('aftermath / follow-up', 'suite / après coup')], [['en amont du projet', 0], ['dans la foulée de l’annonce', 1], ['à l’époque des faits', 0], ['à l’issue de l’audition', 1], ['dès l’origine du dossier', 0], ['par la suite, le contrat est rompu', 1]], { listen: true }),
      pairs(P.match, [['en amont', b('upstream, beforehand', 'en préparation, avant')], ['dans la foulée', b('immediately afterwards', 'juste après, dans le même élan')], ['entre-temps', b('meanwhile, in the meantime', 'pendant ce laps de temps')], ['à l’issue de', b('at the end / conclusion of', 'au terme de')]]),
      dict('En amont de la crise, plusieurs alertes avaient déjà été émises.', { voice: 'm2' }),
    ],
    [
      b('en amont / à l’époque des faits = earlier context.', 'en amont / à l’époque des faits = contexte antérieur.'),
      b('dans la foulée = immediately afterwards; entre-temps = meanwhile.', 'dans la foulée = juste après ; entre-temps = pendant ce temps.'),
      b('tout remonte à / tout bascule = origin / turning point.', 'tout remonte à / tout bascule = origine / point de rupture.'),
    ],
    [['en amont', b('upstream, ahead of time', 'avant l’événement principal')], ['dans la foulée', b('immediately after', 'tout de suite après')], ['une audition', b('a formal hearing', 'écoute officielle devant une commission')]],
  ),
  lesson(C, 2, ['cross-checking-testimonies', 'croiser-les-temoignages'],
    b('Cross-checking conflicting testimonies', 'Croiser des témoignages contradictoires'),
    b('Compare witnesses, catch denials and identify cautious or evasive answers.', 'Comparer témoins, saisir les démentis et repérer les réponses évasives.'),
    [b('Distinguish corroboration from contradiction', 'Distinguer corroboration et contradiction'), b('Hear hedging and evasion (botter en touche)', 'Repérer langue de bois et esquive'), b('Understand anonymity and off-the-record caveats', 'Comprendre les réserves de confidentialité')],
    13,
    [
      card(b('Testimony verbs', 'Les verbes du témoignage'), b('Reporters weigh every word: **corroborer** (to back up/confirm), **démentir catégoriquement** (to flatly deny), **botter en touche** (to dodge the question), **sous couvert d’anonymat** (under condition of anonymity), **se renvoyer la balle** (to pass the buck).', 'Les journalistes pèsent chaque mot : **corroborer**, **démentir catégoriquement**, **botter en touche**, **sous couvert d’anonymat**, **se renvoyer la balle**.'), {
        ex: [['Trois anciens salariés corroborent cette version sous couvert d’anonymat.', 'Three former staff back up this account anonymously.'], ['Le porte-parole a préféré botter en touche.', 'The spokesperson chose to dodge the question.']],
      }),
      trap(b('Démentir vs nuancer', 'Démentir ou nuancer'), b('**Démentir** rejects a claim as false (**La direction dément tout retard**). **Nuancer** or **relativiser** admits part of the fact while shrinking its importance (**Il nuance l’ampleur du problème**).', '**Démentir** rejette une information (**La direction dément tout retard**). **Nuancer** ou **relativiser** reconnaît une partie des faits tout en réduisant leur portée.')),
      hear('Sous couvert d’anonymat, deux techniciens affirment avoir reçu l’ordre de ne pas noter les pannes. La direction dément catégoriquement et évoque une simple erreur de procédure.', b('How do the two sides compare?', 'Comment se situent les deux versions ?'), [b('Anonymous technicians allege an order, while management flatly denies it', 'Des techniciens anonymes évoquent un ordre, que la direction dément catégoriquement'), b('Both sides agree it was a deliberate order', 'Les deux camps admettent un ordre volontaire'), b('Management corroborates the technicians’ account', 'La direction corrobore le récit des techniciens'), b('The technicians withdrew their testimony', 'Les techniciens ont retiré leur témoignage')], { voice: 'm2' }),
      hear('Interrogée sur la facture manquante, la responsable a botté en touche, affirmant ne pas avoir le dossier sous les yeux et renvoyant la balle au prestataire.', b('How did the manager react to the question?', 'Comment la responsable a-t-elle réagi à la question ?'), [b('She dodged the question and blamed the contractor', 'Elle a esquivé la question et renvoyé la responsabilité au prestataire'), b('She immediately produced the missing invoice', 'Elle a montré la facture sur-le-champ'), b('She admitted full personal responsibility', 'Elle a reconnu sa responsabilité entière'), b('She confirmed the reporter’s figures', 'Elle a confirmé les chiffres du journaliste')], { voice: 'f' }),
      dlg(b('Press interview with a witness', 'Entretien avec un témoin'), b('A journalist presses a former inspector during an audio report.', 'Une journaliste interroge un ancien inspecteur pour son reportage.'), [['Journaliste', 'f2'], ['Témoin', 'm']], [
        [0, 'Vous confirmez avoir signé le rapport de conformité en mai ?', 'Do you confirm signing the compliance report in May?'],
        [1, 'Je l’ai signé, oui, mais avec trois pages de réserves techniques annexées.', 'I signed it, yes, but with three pages of technical reservations attached.'],
        [0, { options: ['Pourtant, ces réserves ne figurent nulle part dans la version publiée.', 'Pourtant, le prestataire a botanisé dans l’archive.', 'Donc vous démentez votre propre signature ?'] }],
        [1, 'C’est justement ce qui m’a poussé à témoigner aujourd’hui : le document a été tronqué.', 'That’s precisely why I decided to speak up today: the document was cut short.'],
      ]),
      pairs(P.match, [['corroborer', b('to corroborate, back up', 'confirmer un autre témoignage')], ['démentir', b('to deny officially', 'affirmer qu’une info est fausse')], ['botter en touche', b('to dodge a question', 'esquiver, éviter de répondre')], ['tronqué', b('cut short, truncated', 'amputé d’une partie')]]),
      dict('Deux témoins corroborent cette version sous couvert d’anonymat.', { voice: 'f2' }),
    ],
    [
      b('corroborer = confirm; démentir = flatly deny; nuancer = qualify.', 'corroborer = confirmer ; démentir = nier ; nuancer = atténuer.'),
      b('botter en touche = evade; se renvoyer la balle = shift blame.', 'botter en touche = esquiver ; se renvoyer la balle = se rejeter la faute.'),
      b('sous couvert d’anonymat = protecting the source’s name.', 'sous couvert d’anonymat = sans révéler l’identité.'),
    ],
    [['démentir', b('to deny, refute', 'déclarer faux')], ['corroborer', b('to corroborate', 'appuyer par d’autres faits')], ['botter en touche', b('to evade, sidestep', 'éluder une question gênante')]],
  ),
  lesson(C, 3, ['weighing-evidence-and-sources', 'evaluer-preuves-et-sources'],
    b('Weighing evidence, documents and conclusions', 'Évaluer preuves, documents et conclusions'),
    b('Separate verified proof from unconfirmed allegations in investigative conclusions.', 'Distinguer preuves établies et allégations non vérifiées dans une enquête.'),
    [b('Spot journalistic conditional (aurait signé)', 'Repérer le conditionnel journalistique (aurait signé)'), b('Identify solid proof (audit, pièce à conviction)', 'Identifier preuves solides (audit, document comptable)'), b('Evaluate cautious conclusions', 'Évaluer des conclusions prudentes')],
    13,
    [
      card(b('Proof vs allegation', 'Preuve établie ou allégation'), b('French investigative audio marks certainty grammatically. **Indicative + source**: **Un audit indépendant établit que…** (confirmed fact). **Journalistic conditional**: **Le dirigeant aurait validé…** (allegedly approved — not yet proven!). Listen for **un faisceau d’indices** (converging clues) vs **une allégation non étayée** (unsupported claim).', 'Le reportage marque la certitude par la grammaire. **Indicatif + source** : **Un audit indépendant établit que…** (fait établi). **Conditionnel journalistique** : **Le dirigeant aurait validé…** (non encore prouvé !). Repérez **un faisceau d’indices** contre **une allégation non étayée**.'), {
        ex: [['Selon nos informations, la réunion aurait duré deux heures.', 'According to our sources, the meeting allegedly lasted two hours.'], ['Les relevés bancaires attestent de trois versements.', 'The bank statements prove three payments.']],
      }),
      hear('Les factures que nous avons pu consulter attestent d’un surcoût de trente pour cent. En revanche, l’hypothèse d’un accord secret entre les deux sociétés reste à ce stade invérifiable.', b('What is actually proven in this passage?', 'Qu’est-ce qui est réellement prouvé dans cet extrait ?'), [b('A 30% cost overrun shown by invoices', 'Un surcoût de 30 % attesté par les factures'), b('A secret deal between the two companies', 'Un accord secret entre les deux sociétés'), b('Neither the overrun nor any agreement', 'Ni le surcoût ni aucun accord'), b('A criminal conviction of the directors', 'Une condamnation pénale des dirigeants')], { voice: 'f2' }),
      hear('Selon un ancien collaborateur, le ministre aurait pris connaissance du mémo dès janvier, ce que son cabinet refuse pour l’heure de confirmer.', b('Why does the reporter say « aurait pris connaissance »?', 'Pourquoi le journaliste dit-il « aurait pris connaissance » ?'), [b('Because the claim comes from one source and is not yet confirmed', 'Parce que l’information vient d’une source et n’est pas confirmée'), b('Because it is a hypothetical event in the future', 'Parce qu’il s’agit d’une hypothèse dans le futur'), b('Because the minister already confirmed it publicly', 'Parce que le ministre l’a déjà confirmé publiquement'), b('Because the memo was destroyed before January', 'Parce que la note a été détruite avant janvier')], { voice: 'm' }),
      mc(P.best, [b('« L’audit indépendant confirme que les normes n’étaient pas respectées. »', '« L’audit indépendant confirme que les normes n’étaient pas respectées. »'), b('« Un témoin anonyme aurait entendu parler d’un problème. »', '« Un témoin anonyme aurait entendu parler d’un problème. »'), b('« Selon une rumeur de couloir, tout serait truqué. »', '« Selon une rumeur de couloir, tout serait truqué. »'), b('« Il n’est pas exclu que des erreurs aient pu se produire. »', '« Il n’est pas exclu que des erreurs aient pu se produire. »')], { fr: 'Quelle phrase exprime un fait solidement établi ?' }),
      sort(b('Established fact or unverified allegation?', 'Fait établi ou allégation à vérifier ?'), [b('established fact', 'fait établi'), b('unverified allegation', 'allégation / conditionnel')], [['Les relevés attestent le virement.', 0], ['Le contrat aurait été modifié la veille.', 1], ['L’audit officiel confirme l’écart.', 0], ['Selon une source, il serait prêt à partir.', 1], ['Le tribunal a publié sa décision.', 0], ['Des rumeurs évoquent un autre dossier.', 1]], { listen: true }),
      pairs(P.match, [['attester de', b('to prove, attest to', 'prouver par un document')], ['un faisceau d’indices', b('a body of converging clues', 'ensemble d’éléments concordants')], ['étayé', b('substantiated, backed up', 'appuyé par des preuves')], ['pour l’heure', b('for the time being', 'pour le moment')]]),
      dict('Un faisceau d’indices concorde, mais l’allégation reste à vérifier.', { voice: 'f' }),
    ],
    [
      b('Indicative + attester/établir = verified proof.', 'Indicatif + attester/établir = preuve vérifiée.'),
      b('Journalistic conditional (aurait, serait) = unconfirmed allegation.', 'Conditionnel journalistique (aurait, serait) = information à confirmer.'),
      b('faisceau d’indices = converging clues; étayé = backed by evidence.', 'faisceau d’indices ; étayé = appuyé par des preuves.'),
    ],
    [['attester', b('to attest, certify', 'prouver formellement')], ['étayé', b('supported (by proof)', 'fondé sur des éléments')], ['pour l’heure', b('for now, at this stage', 'actuellement')]],
  ),
];
