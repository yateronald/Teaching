// TCF Canada · Compréhension orale, A1 → C2. One lesson per level: the French
// you need to understand at that level, then questions in the style of the
// exam (heard once, four options).
import { b, type Lesson } from '../../types';
import { card, listen } from '../kit';

const once = b('In the exam each recording is heard only once. Here too: answer after the first listening, then use the speaker button to check.', 'À l’examen, chaque enregistrement ne passe qu’une fois. Ici aussi : répondez après la première écoute, puis réécoutez pour vérifier.');

const lessons: Lesson[] = [
  // ── A1 ──
  {
    id: 'tcf-listening-1',
    level: 'A1',
    slug: { en: 'a1-numbers-times-prices-places', fr: 'a1-nombres-heures-prix-lieux' },
    title: b('A1 · Numbers, times, prices and places', 'A1 · Nombres, heures, prix et lieux'),
    summary: b('Understand the key information of very short messages: a time, a price, a day, a place.', 'Comprendre l’information clé de messages très courts : une heure, un prix, un jour, un lieu.'),
    objectives: [b('Understand numbers up to 100 and prices', 'Comprendre les nombres jusqu’à 100 et les prix'), b('Understand the time in official and everyday form', 'Comprendre l’heure officielle et courante'), b('Recognise places and days in a short message', 'Reconnaître lieux et jours dans un message court')],
    minutes: 13,
    steps: [
      card(b('Numbers: the tricky ones', 'Les nombres : les difficiles'), b('From 70, French counts in twenties: **soixante-dix** (60 + 10), **quatre-vingts** (4 × 20), **quatre-vingt-dix** (4 × 20 + 10). In Belgium and Switzerland you also hear septante and nonante, but not in the TCF recordings from France or Canada.', 'À partir de 70, le français compte par vingt : **soixante-dix** (60 + 10), **quatre-vingts** (4 × 20), **quatre-vingt-dix** (4 × 20 + 10). En Belgique et en Suisse, on entend aussi septante et nonante.'), {
        examples: [
          { fr: 'soixante-quinze', tr: '75' },
          { fr: 'quatre-vingt-deux', tr: '82' },
          { fr: 'quatre-vingt-dix-neuf', tr: '99' },
          { fr: 'Ça fait trois euros cinquante.', tr: 'That’s €3.50.' },
        ],
      }),
      { kind: 'match', prompt: b('Match each number with its figure.', 'Associez chaque nombre à son chiffre.'), pairs: [['soixante-dix', '70'], ['quatre-vingts', '80'], ['quatre-vingt-dix', '90'], ['seize', '16'], ['soixante-six', '66']] },
      card(b('The time, two ways', 'L’heure, de deux façons'), b('Announcements use the **24-hour clock**: dix-sept heures quinze (17:15). In conversation, people say **cinq heures et quart**, **midi et demi**, **six heures moins le quart**. Both refer to the same times.', 'Les annonces utilisent l’**heure officielle** : dix-sept heures quinze (17 h 15). En conversation, on dit **cinq heures et quart**, **midi et demi**, **six heures moins le quart**.'), {
        examples: [
          { fr: 'Le train part à dix-huit heures trente.', tr: 'The train leaves at 18:30.' },
          { fr: 'On se retrouve à midi et demi ?', tr: 'Shall we meet at half past twelve?' },
          { fr: 'Le cours finit à six heures moins le quart.', tr: 'The class ends at a quarter to six.' },
        ],
      }),
      card(b('Before each recording', 'Avant chaque enregistrement'), b('Read the question first: it tells you **what to listen for**. “Quand ?” → a day or a time. “Combien ?” → a number or a price. “Où ?” → a place.', 'Lisez d’abord la question : elle vous dit **quoi écouter**. « Quand ? » → un jour ou une heure. « Combien ? » → un nombre ou un prix. « Où ? » → un lieu.'), { variant: 'exam', points: [once] }),
      listen('A1', 'm', 'Bonjour, une baguette et deux croissants, s’il vous plaît. — Voilà. Ça fait deux euros quatre-vingts.', 'Combien paie le client ?', ['2,80 €', '2,20 €', '1,80 €', '4,80 €']),
      listen('A1', 'f2', 'Mesdames et messieurs, le train à destination de Lyon partira à dix-sept heures vingt, voie quatre.', 'À quelle heure part le train ?', ['17 h 20', '17 h 04', '16 h 20', '7 h 20']),
      listen('A1', 'f', 'Salut Marc, c’est Julie. Je suis à la pharmacie, à côté de la poste. J’arrive dans dix minutes.', 'Où est Julie ?', ['À la pharmacie', 'À la poste', 'Chez Marc', 'À la gare']),
      listen('A1', 'm2', 'Bonjour, ici le cabinet du docteur Martin. Votre rendez-vous est confirmé pour jeudi, à neuf heures.', 'Quel jour est le rendez-vous ?', ['Jeudi', 'Mardi', 'Vendredi', 'Lundi']),
      listen('A1', 'f2', 'Bienvenue au musée ! L’entrée coûte huit euros, et c’est gratuit pour les enfants.', 'Qui ne paie pas ?', ['Les enfants', 'Les étudiants', 'Les personnes âgées', 'Tout le monde paie']),
      listen('A1', 'm', 'Mon numéro, c’est le zéro six, quarante-cinq, soixante-douze, dix-huit, quatre-vingt-trois.', 'Quel est le numéro ?', ['06 45 72 18 83', '06 45 62 18 83', '06 54 72 18 93', '06 45 72 80 83']),
      { kind: 'dictation', prompt: b('Write what you hear.', 'Écrivez ce que vous entendez.'), text: 'Le magasin ouvre à neuf heures.', voice: 'f' },
    ],
    notes: {
      points: [
        b('From 70: **soixante-dix**, **quatre-vingts**, **quatre-vingt-dix** (counting in twenties).', 'À partir de 70 : **soixante-dix**, **quatre-vingts**, **quatre-vingt-dix** (on compte par vingt).'),
        b('Announcements: 24-hour clock (dix-sept heures). Conversation: **et quart**, **et demie**, **moins le quart**.', 'Annonces : heure officielle (dix-sept heures). Conversation : **et quart**, **et demie**, **moins le quart**.'),
        b('Prices: **deux euros quatre-vingts** = €2.80. “Ça fait…” announces the total.', 'Prix : **deux euros quatre-vingts** = 2,80 €. « Ça fait… » annonce le total.'),
        b('Read the question before listening: quand / combien / où tells you what to catch.', 'Lisez la question avant l’écoute : quand / combien / où vous dit quoi saisir.'),
      ],
      vocab: [['la voie', b('platform (train)', 'quai du train')], ['le rendez-vous', b('appointment', 'rencontre fixée')], ['gratuit', b('free of charge', 'sans payer')], ['ça fait…', b('that comes to… (price)', 'le total est…')], ['à côté de', b('next to', 'près de')]],
    },
  },

  // ── A2 ──
  {
    id: 'tcf-listening-2',
    level: 'A2',
    slug: { en: 'a2-messages-announcements-changes', fr: 'a2-messages-annonces-changements' },
    title: b('A2 · Messages, announcements and changes of plan', 'A2 · Messages, annonces et changements de programme'),
    summary: b('Understand voicemails and announcements, and catch what has changed: a new time, a new place, a cancellation.', 'Comprendre messages et annonces, et repérer ce qui change : une nouvelle heure, un nouveau lieu, une annulation.'),
    objectives: [b('Understand voicemails and public announcements', 'Comprendre messages vocaux et annonces publiques'), b('Spot change markers: au lieu de, finalement, plutôt', 'Repérer les marqueurs de changement : au lieu de, finalement, plutôt'), b('Understand simple requests and instructions', 'Comprendre des demandes et des consignes simples')],
    minutes: 14,
    steps: [
      card(b('The A2 trap: two pieces of information', 'Le piège A2 : deux informations'), b('At A2, a message often gives **an old and a new** piece of information. The question asks for the new one. Listen for the words that signal a change.', 'Au niveau A2, un message donne souvent **une ancienne et une nouvelle** information. La question porte sur la nouvelle. Écoutez les mots qui signalent un changement.'), {
        examples: [
          { fr: 'La réunion est à dix heures au lieu de neuf heures.', tr: 'The meeting is at ten instead of nine.' },
          { fr: 'Finalement, on se retrouve chez moi.', tr: 'In the end, we’re meeting at my place.' },
          { fr: 'Le cours de mardi est annulé, il est reporté à jeudi.', tr: 'Tuesday’s class is cancelled; it is moved to Thursday.' },
        ],
      }),
      { kind: 'categorize', prompt: b('Old information or new information?', 'Ancienne ou nouvelle information ?'), buckets: [b('Introduces the NEW info', 'Annonce la NOUVELLE info'), b('Refers to the OLD info', 'Renvoie à l’ANCIENNE info')], items: [{ text: 'finalement', bucket: 0 }, { text: 'au lieu de', bucket: 1 }, { text: 'est reporté à', bucket: 0 }, { text: 'n’est plus', bucket: 1 }, { text: 'plutôt', bucket: 0 }, { text: 'était prévu', bucket: 1 }] },
      card(b('The voicemail pattern', 'Le schéma du message vocal'), b('Almost every voicemail follows the same order: **who** is calling → **why** → **what you must do** → how to call back. Catch the verb of the request: rappeler, confirmer, apporter, passer.', 'Presque tous les messages suivent le même ordre : **qui** appelle → **pourquoi** → **ce que vous devez faire** → comment rappeler. Saisissez le verbe de la demande : rappeler, confirmer, apporter, passer.'), { variant: 'tip', points: [once] }),
      listen('A2', 'f2', 'Bonjour madame Diallo, c’est le garage Lemaire. Votre voiture n’est pas prête aujourd’hui, il nous manque une pièce. Vous pourrez la récupérer demain après-midi.', 'Quand la cliente peut-elle récupérer sa voiture ?', ['Demain après-midi', 'Aujourd’hui', 'Demain matin', 'Dans une semaine'], { explain: b('“Aujourd’hui” is the original plan; the new information follows “vous pourrez”.', '« Aujourd’hui » est le plan initial ; la nouvelle information suit « vous pourrez ».') }),
      listen('A2', 'm', 'Salut Léa, c’est Karim. Pour samedi, on ne va plus au cinéma : il y a un concert gratuit au parc. On se retrouve devant l’entrée à vingt heures ?', 'Où vont-ils samedi ?', ['À un concert au parc', 'Au cinéma', 'Au restaurant', 'Chez Karim']),
      listen('A2', 'f', 'Attention, la piscine municipale sera fermée du premier au quinze août pour des travaux de nettoyage. Merci de votre compréhension.', 'Pourquoi la piscine ferme-t-elle ?', ['Pour des travaux', 'Pour les vacances du personnel', 'À cause d’une grève', 'Pour une compétition']),
      listen('A2', 'm2', 'Bonjour, c’est l’agence immobilière. Pour la visite de l’appartement, n’oubliez pas d’apporter une pièce d’identité et vos trois dernières fiches de paie.', 'Que doit apporter la personne ?', ['Une pièce d’identité et des fiches de paie', 'Un chèque de caution', 'Une lettre de son employeur', 'Une photo d’identité']),
      listen('A2', 'f2', 'Chers clients, notre magasin vous accueille exceptionnellement ce dimanche de dix heures à dix-huit heures. Profitez de nos promotions de printemps !', 'Qu’est-ce qui est exceptionnel ?', ['Le magasin ouvre un dimanche', 'Le magasin ferme plus tôt', 'Tout est gratuit', 'Le magasin change d’adresse']),
      listen('A2', 'm', 'Allô Sophie ? Je suis désolé, je vais être en retard : mon bus est en panne. Commence la réunion sans moi, j’arrive dans vingt minutes.', 'Que demande l’homme ?', ['De commencer sans lui', 'D’annuler la réunion', 'De venir le chercher', 'De le rappeler']),
      { kind: 'fill', prompt: b('Complete the message with the word you would hear.', 'Complétez le message avec le mot que vous entendriez.'), text: 'Le rendez-vous de lundi est ___ à mercredi.', answers: [['reporté']], choices: [['reporté', 'rapporté', 'reparti']], explain: b('**Reporter** un rendez-vous = to postpone it.', '**Reporter** un rendez-vous = le déplacer à plus tard.') },
    ],
    notes: {
      points: [
        b('A2 messages often contain an old and a new piece of information: the question asks for the new one.', 'Les messages A2 contiennent souvent une ancienne et une nouvelle information : la question porte sur la nouvelle.'),
        b('Change markers: **au lieu de**, **finalement**, **ne… plus**, **plutôt**, **est reporté / annulé**.', 'Marqueurs de changement : **au lieu de**, **finalement**, **ne… plus**, **plutôt**, **est reporté / annulé**.'),
        b('A voicemail: who → why → what to do → how to call back.', 'Un message vocal : qui → pourquoi → que faire → comment rappeler.'),
        b('Catch the verb of the request: rappeler, apporter, confirmer, passer.', 'Saisissez le verbe de la demande : rappeler, apporter, confirmer, passer.'),
      ],
      vocab: [['reporter', b('to postpone', 'déplacer à plus tard')], ['annuler', b('to cancel', 'supprimer')], ['la fiche de paie', b('payslip', 'bulletin de salaire')], ['être en panne', b('to have broken down', 'ne plus fonctionner')], ['exceptionnellement', b('as an exception', 'de façon inhabituelle')]],
    },
  },

  // ── B1 ──
  {
    id: 'tcf-listening-3',
    level: 'B1',
    slug: { en: 'b1-conversations-intentions-opinions', fr: 'b1-conversations-intentions-opinions' },
    title: b('B1 · Conversations: intentions and simple opinions', 'B1 · Conversations : intentions et opinions simples'),
    summary: b('Understand what a speaker wants (to suggest, refuse, complain, advise) and what they think.', 'Comprendre ce que veut un locuteur (proposer, refuser, se plaindre, conseiller) et ce qu’il pense.'),
    objectives: [b('Identify the intention behind a sentence', 'Identifier l’intention derrière une phrase'), b('Understand a simple opinion and its reason', 'Comprendre une opinion simple et sa raison'), b('Follow a conversation between two people', 'Suivre une conversation entre deux personnes')],
    minutes: 14,
    steps: [
      card(b('Intention questions', 'Les questions d’intention'), b('From B1, the TCF asks **why** someone speaks: “Que fait la femme ?” → elle propose, elle refuse, elle s’excuse, elle se plaint. Learn the typical phrases of each intention.', 'À partir du B1, le TCF demande **pourquoi** quelqu’un parle : « Que fait la femme ? » → elle propose, elle refuse, elle s’excuse, elle se plaint. Apprenez les tournures de chaque intention.'), {
        examples: [
          { fr: 'Ça te dirait d’aller au marché demain ?', tr: 'Would you like to go to the market tomorrow? (suggesting)' },
          { fr: 'C’est gentil, mais je ne peux vraiment pas.', tr: 'That’s kind, but I really can’t. (refusing)' },
          { fr: 'Ce n’est pas normal, j’attends depuis une heure !', tr: 'This isn’t right, I’ve been waiting for an hour! (complaining)' },
          { fr: 'À ta place, je prendrais le train.', tr: 'If I were you, I’d take the train. (advising)' },
        ],
      }),
      { kind: 'match', prompt: b('Match each sentence with its intention.', 'Associez chaque phrase à son intention.'), pairs: [['Et si on allait au cinéma ?', b('suggest', 'proposer')], ['Je regrette, ce n’est pas possible.', b('refuse', 'refuser')], ['Vous devriez consulter un médecin.', b('advise', 'conseiller')], ['Je suis vraiment désolé pour hier.', b('apologise', 's’excuser')], ['C’est inadmissible !', b('complain', 'se plaindre')]] },
      card(b('Opinion + reason', 'Opinion + raison'), b('A B1 opinion is often built as **opinion + parce que / car / comme + reason**. The question may ask for the reason rather than the opinion.', 'Une opinion B1 se construit souvent ainsi : **opinion + parce que / car / comme + raison**. La question peut porter sur la raison plutôt que sur l’opinion.'), { variant: 'tip' }),
      listen('B1', 'f', 'Écoute, je sais que tu veux acheter une voiture, mais à ta place, j’attendrais un peu. Avec le métro juste en bas de chez toi, tu n’en as pas vraiment besoin.', 'Que fait la femme ?', ['Elle donne un conseil', 'Elle propose de vendre sa voiture', 'Elle refuse de l’aider', 'Elle se plaint du métro']),
      listen('B1', 'm', 'Moi, le télétravail, j’adore. Je ne perds plus deux heures dans les transports, et je suis beaucoup plus concentré à la maison.', 'Pourquoi l’homme aime-t-il le télétravail ?', ['Il gagne du temps et se concentre mieux', 'Il gagne plus d’argent', 'Il voit plus ses collègues', 'Il peut voyager']),
      listen('B1', 'f2', 'Bonjour, j’ai acheté cet aspirateur la semaine dernière et il ne marche déjà plus. Je voudrais être remboursée, pas qu’on me le répare.', 'Que veut la cliente ?', ['Être remboursée', 'Faire réparer l’aspirateur', 'Échanger l’aspirateur', 'Acheter un autre modèle'], { explain: b('“Pas qu’on me le répare” rules out the repair: she wants a refund.', '« Pas qu’on me le répare » exclut la réparation : elle veut un remboursement.') }),
      listen('B1', 'm2', '— Tu as vu le nouveau restaurant libanais ? — Oui, j’y suis allé hier. Franchement, la cuisine est excellente, mais c’est un peu cher pour ce que c’est. — Ah bon ? Alors on ira pour une occasion spéciale.', 'Quel est l’avis de l’homme sur le restaurant ?', ['Bon, mais un peu cher', 'Mauvais et cher', 'Bon et pas cher', 'Il ne l’a pas encore essayé']),
      listen('B1', 'f', 'Je t’appelle parce que je ne pourrai pas venir à ton anniversaire samedi. Ma sœur se marie le même jour, je ne peux pas manquer ça. Mais on fête ça la semaine prochaine, promis !', 'Pourquoi la femme ne vient-elle pas ?', ['Elle va au mariage de sa sœur', 'Elle est malade', 'Elle travaille samedi', 'Elle a oublié l’anniversaire']),
      listen('B1', 'm', 'Pour réduire vos factures d’électricité cet hiver, baissez le chauffage d’un degré la nuit et fermez les volets dès la tombée du jour. Ces petits gestes font une vraie différence.', 'De quoi parle ce document ?', ['De conseils pour économiser l’énergie', 'D’une hausse des prix de l’électricité', 'D’une panne de chauffage', 'De la météo de l’hiver']),
      { kind: 'dialogue', title: b('At the travel agency', 'À l’agence de voyages'), scene: b('Choose the client’s best reply.', 'Choisissez la meilleure réponse du client.'), speakers: [{ name: 'Agente', voice: 'f2', side: 'l' }, { name: 'Client', voice: 'm', side: 'r' }], lines: [
        { s: 0, fr: 'Je peux vous proposer un vol direct à six cents dollars, ou un vol avec escale à quatre cent cinquante.', tr: 'I can offer you a direct flight at $600, or one with a stopover at $450.' },
        { s: 1, choose: { options: ['Je préférerais le vol avec escale, si la correspondance n’est pas trop longue.', 'Je préfère à six cents.', 'Merci, au revoir.'], answer: 0, explain: b('A full, polite B1 answer: preference + condition.', 'Une réponse B1 complète et polie : préférence + condition.') } },
        { s: 0, fr: 'L’escale à Paris dure deux heures. C’est très raisonnable.', tr: 'The stopover in Paris lasts two hours. That’s very reasonable.' },
      ] },
    ],
    notes: {
      points: [
        b('Intention questions: proposer, refuser, conseiller, s’excuser, se plaindre, remercier.', 'Questions d’intention : proposer, refuser, conseiller, s’excuser, se plaindre, remercier.'),
        b('Suggesting: **Ça te dirait de…? Et si on…?** Advising: **À ta place, je…; Vous devriez…**', 'Proposer : **Ça te dirait de… ? Et si on… ?** Conseiller : **À ta place, je… ; Vous devriez…**'),
        b('Opinion + reason: parce que, car, comme. The question may target the reason.', 'Opinion + raison : parce que, car, comme. La question peut viser la raison.'),
        b('“Mais” often introduces the speaker’s real point.', '« Mais » introduit souvent la vraie idée du locuteur.'),
      ],
      vocab: [['ça te dirait de…', b('would you like to…', 'as-tu envie de…')], ['à ta place', b('if I were you', 'si j’étais toi')], ['rembourser', b('to refund', 'rendre l’argent')], ['l’escale (f.)', b('stopover', 'arrêt pendant un vol')], ['inadmissible', b('unacceptable', 'qu’on ne peut accepter')]],
    },
  },

  // ── B2 ──
  {
    id: 'tcf-listening-4',
    level: 'B2',
    slug: { en: 'b2-interviews-radio-reports', fr: 'b2-interviews-et-reportages-radio' },
    title: b('B2 · Interviews and radio reports', 'B2 · Interviews et reportages radio'),
    summary: b('Follow longer documents: identify the main idea, the speaker’s position and the logical links.', 'Suivre des documents plus longs : identifier l’idée principale, la position du locuteur et les liens logiques.'),
    objectives: [b('Distinguish the main idea from details', 'Distinguer l’idée principale des détails'), b('Follow logical connectors: cause, consequence, opposition', 'Suivre les connecteurs logiques : cause, conséquence, opposition'), b('Understand a speaker’s nuanced position', 'Comprendre la position nuancée d’un locuteur')],
    minutes: 14,
    steps: [
      card(b('Connectors are signposts', 'Les connecteurs sont des panneaux'), b('In a radio report, connectors announce what comes next. **Pourtant**, **cependant**, **en revanche** announce an opposition; **c’est pourquoi**, **si bien que**, **d’où** a consequence; **en effet**, **puisque**, **étant donné que** a cause.', 'Dans un reportage, les connecteurs annoncent la suite. **Pourtant**, **cependant**, **en revanche** annoncent une opposition ; **c’est pourquoi**, **si bien que**, **d’où**, une conséquence ; **en effet**, **puisque**, **étant donné que**, une cause.'), {
        examples: [
          { fr: 'Le projet coûte cher ; pourtant, la mairie l’a validé.', tr: 'The project is expensive; yet the town hall approved it.' },
          { fr: 'Les loyers ont augmenté, si bien que beaucoup de familles partent en banlieue.', tr: 'Rents have risen, so many families are moving to the suburbs.' },
        ],
      }),
      { kind: 'categorize', prompt: b('Sort the connectors.', 'Classez les connecteurs.'), buckets: [b('Opposition', 'Opposition'), b('Consequence', 'Conséquence'), b('Cause', 'Cause')], items: [{ text: 'en revanche', bucket: 0 }, { text: 'cependant', bucket: 0 }, { text: 'si bien que', bucket: 1 }, { text: 'c’est pourquoi', bucket: 1 }, { text: 'étant donné que', bucket: 2 }, { text: 'puisque', bucket: 2 }] },
      card(b('Main idea or detail?', 'Idée principale ou détail ?'), b('A B2 question like “Quel est le sujet du reportage ?” needs the **whole** document. Wrong options are often true details taken out of context. Ask yourself: what is the document **for**?', 'Une question B2 comme « Quel est le sujet du reportage ? » porte sur **tout** le document. Les mauvaises propositions sont souvent des détails vrais sortis de leur contexte. Demandez-vous : à **quoi** sert ce document ?'), { variant: 'trap' }),
      listen('B2', 'f2', 'De plus en plus de Montréalais choisissent le vélo pour aller travailler, même en hiver. La ville a en effet déneigé quatre cents kilomètres de pistes cyclables. Les commerçants, eux, restent partagés : certains craignent de perdre des places de stationnement.', 'Quel est le sujet principal du reportage ?', ['Le développement du vélo en hiver à Montréal', 'Le manque de places de stationnement', 'Le déneigement des routes', 'La colère des commerçants'], { explain: b('Parking spaces and shopkeepers are details; the report is about cycling in winter.', 'Le stationnement et les commerçants sont des détails ; le reportage porte sur le vélo en hiver.') }),
      listen('B2', 'm2', 'Je ne suis pas contre la semaine de quatre jours, loin de là. Mais si on garde la même charge de travail en moins de temps, on risque surtout d’épuiser les salariés.', 'Quelle est la position de l’homme ?', ['Favorable, mais avec une réserve importante', 'Totalement opposé', 'Enthousiaste sans réserve', 'Indifférent'], { explain: b('“Loin de là” = far from it (he is not against). “Mais” introduces his reservation.', '« Loin de là » : il n’est pas contre. « Mais » introduit sa réserve.') }),
      listen('B2', 'f', 'Les ventes de livres papier, qu’on disait condamnées par le numérique, ont progressé de trois pour cent l’an dernier. Les éditeurs y voient l’effet des réseaux sociaux, où les jeunes lecteurs partagent leurs coups de cœur.', 'Comment les éditeurs expliquent-ils cette hausse ?', ['Par l’influence des réseaux sociaux', 'Par la baisse du prix des livres', 'Par la fin des livres numériques', 'Par l’ouverture de librairies']),
      listen('B2', 'm', 'Étant donné la hausse du prix des fruits et légumes, de plus en plus de ménages se tournent vers les jardins communautaires. Résultat : les listes d’attente dépassent souvent deux ans.', 'Quelle est la conséquence décrite ?', ['De longues listes d’attente', 'Une baisse des prix', 'La fermeture des jardins', 'Moins de ménages intéressés']),
      listen('B2', 'f2', '— Docteure Roy, faut-il vraiment dormir huit heures par nuit ? — Il n’y a pas de chiffre magique. Certains adultes se portent très bien avec sept heures. L’essentiel, c’est la régularité : se coucher et se lever à heures fixes.', 'Selon la médecin, qu’est-ce qui compte le plus ?', ['La régularité des horaires', 'Dormir huit heures exactement', 'Se coucher tôt', 'Faire la sieste']),
      listen('B2', 'm2', 'Si les vols intérieurs sont aussi chers au Canada, c’est d’abord une question de distances et de faible densité de population. Cela dit, le manque de concurrence entre les compagnies joue aussi un rôle.', 'Combien de causes l’homme mentionne-t-il ?', ['Deux : les distances et la faible concurrence', 'Une seule : les distances', 'Une seule : le prix du carburant', 'Trois : distances, carburant, taxes']),
      { kind: 'fill', prompt: b('Choose the connector that fits.', 'Choisissez le connecteur qui convient.'), text: 'Le musée est gratuit le dimanche ; ___, il y a toujours beaucoup de monde.', answers: [['c’est pourquoi']], choices: [['c’est pourquoi', 'pourtant', 'puisque']] },
    ],
    notes: {
      points: [
        b('Opposition: pourtant, cependant, en revanche, alors que. Consequence: c’est pourquoi, si bien que, d’où.', 'Opposition : pourtant, cependant, en revanche, alors que. Conséquence : c’est pourquoi, si bien que, d’où.'),
        b('Cause: en effet, puisque, étant donné que, comme.', 'Cause : en effet, puisque, étant donné que, comme.'),
        b('“Quel est le sujet ?” = the whole document, not a true detail.', '« Quel est le sujet ? » = tout le document, pas un détail vrai.'),
        b('Nuanced positions: **loin de là**, **cela dit**, **certes… mais**.', 'Positions nuancées : **loin de là**, **cela dit**, **certes… mais**.'),
      ],
      vocab: [['déneiger', b('to clear snow', 'enlever la neige')], ['partagé', b('divided (opinion)', 'qui hésite entre deux avis')], ['épuiser', b('to exhaust', 'fatiguer énormément')], ['le ménage', b('household', 'foyer')], ['cela dit', b('that said', 'néanmoins')]],
    },
  },

  // ── C1 ──
  {
    id: 'tcf-listening-5',
    level: 'C1',
    slug: { en: 'c1-debates-implicit-meaning', fr: 'c1-debats-et-implicite' },
    title: b('C1 · Debates, implicit meaning and attitude', 'C1 · Débats, implicite et attitude'),
    summary: b('Understand what is suggested without being said: doubt, irony, criticism, concession.', 'Comprendre ce qui est suggéré sans être dit : doute, ironie, critique, concession.'),
    objectives: [b('Infer a speaker’s attitude from tone and wording', 'Déduire l’attitude d’un locuteur du ton et des mots'), b('Understand concession and reservations', 'Comprendre la concession et les réserves'), b('Follow a debate between several speakers', 'Suivre un débat entre plusieurs intervenants')],
    minutes: 14,
    steps: [
      card(b('Attitude lives in the wording', 'L’attitude est dans les mots'), b('At C1, the question is often “Quelle est l’attitude de… ?” → sceptique, ironique, enthousiaste, inquiet, réservé, indigné. The answer is rarely stated: listen to modal words (**soi-disant**, **prétendument**, **à en croire**), conditionals and intonation.', 'Au C1, la question est souvent « Quelle est l’attitude de… ? » → sceptique, ironique, enthousiaste, inquiet, réservé, indigné. La réponse est rarement dite : écoutez les mots qui modalisent (**soi-disant**, **prétendument**, **à en croire**), le conditionnel et l’intonation.'), {
        examples: [
          { fr: 'Cette réforme, soi-disant destinée à simplifier les démarches, les a rendues plus longues.', tr: 'This reform, supposedly meant to simplify procedures, made them longer. (sceptical)' },
          { fr: 'Le ministre aurait été informé dès janvier.', tr: 'The minister was reportedly informed as early as January. (unconfirmed)' },
          { fr: 'Bravo, encore un projet livré avec deux ans de retard !', tr: 'Well done, yet another project two years late! (ironic)' },
        ],
      }),
      { kind: 'match', prompt: b('Match each sentence with the attitude it shows.', 'Associez chaque phrase à l’attitude qu’elle exprime.'), pairs: [['Génial, encore une réunion qui aurait pu être un courriel.', b('ironic', 'ironique')], ['Je demande à voir les résultats avant d’y croire.', b('sceptical', 'sceptique')], ['C’est une avancée historique, enfin !', b('enthusiastic', 'enthousiaste')], ['Ce qui m’inquiète, c’est l’après.', b('worried', 'inquiet')], ['C’est tout bonnement scandaleux.', b('indignant', 'indigné')]] },
      card(b('Concession: “certes… mais”', 'La concession : « certes… mais »'), b('A C1 speaker often **admits** a point before contesting it: **certes**, **il est vrai que**, **on ne peut nier que**, **même si**… followed by **mais / toutefois / il n’en reste pas moins que**. The real opinion is the second part.', 'Un locuteur C1 **admet** souvent un point avant de le contester : **certes**, **il est vrai que**, **on ne peut nier que**, **même si**… suivi de **mais / toutefois / il n’en reste pas moins que**. L’opinion réelle est la seconde partie.'), { variant: 'tip' }),
      listen('C1', 'm2', 'On nous présente cette application comme la solution miracle contre la solitude des personnes âgées. Permettez-moi d’en douter : rien ne remplace une visite, une main sur l’épaule.', 'Quelle est l’attitude de l’homme envers l’application ?', ['Sceptique', 'Enthousiaste', 'Indifférente', 'Neutre et descriptive']),
      listen('C1', 'f', 'Certes, le nouveau tramway a coûté plus cher que prévu, et les travaux ont exaspéré les riverains. Il n’en reste pas moins qu’il transporte aujourd’hui cinquante mille voyageurs par jour.', 'Que pense finalement la femme du tramway ?', ['Que c’est un succès malgré ses défauts', 'Que c’est un échec coûteux', 'Qu’il faut arrêter le projet', 'Qu’elle n’a pas d’avis'], { explain: b('“Il n’en reste pas moins que” introduces her real opinion after the concession.', '« Il n’en reste pas moins que » introduit son opinion réelle après la concession.') }),
      listen('C1', 'm', 'Ah, la fameuse « simplification administrative » ! Trois formulaires au lieu de deux, et un site internet qui plante une fois sur deux. On n’arrête pas le progrès.', 'Sur quel ton l’homme parle-t-il ?', ['Ironique', 'Admiratif', 'Inquiet', 'Hésitant']),
      listen('C1', 'f2', 'Selon plusieurs sources, l’entreprise envisagerait de fermer son usine de Trois-Rivières d’ici deux ans. La direction, contactée, n’a pas souhaité commenter.', 'Que sait-on de la fermeture de l’usine ?', ['C’est une information non confirmée', 'Elle est officielle', 'Elle a déjà eu lieu', 'Elle a été démentie par la direction'], { explain: b('The conditional “envisagerait” marks unconfirmed information.', 'Le conditionnel « envisagerait » marque une information non confirmée.') }),
      listen('C1', 'm2', '— Pour vous, l’intelligence artificielle menace-t-elle les traducteurs ? — Elle transforme le métier plus qu’elle ne le menace. La traduction de notices, oui, elle s’en charge déjà. Mais adapter un roman ou un slogan, c’est une autre histoire.', 'Que pense le traducteur de l’intelligence artificielle ?', ['Elle change le métier sans le faire disparaître', 'Elle va remplacer tous les traducteurs', 'Elle n’a aucun effet sur son travail', 'Elle traduit mieux les romans que les notices']),
      listen('C1', 'f', 'Que les jeunes lisent moins de journaux, c’est un fait. Mais en conclure qu’ils se désintéressent de l’actualité serait un raccourci : ils s’informent autrement, en vidéo et en podcast.', 'Que critique la femme ?', ['Une conclusion trop rapide', 'Le manque d’intérêt des jeunes', 'La qualité des podcasts', 'Les journaux papier']),
      { kind: 'speak', prompt: b('Repeat with the intonation of irony.', 'Répétez avec l’intonation de l’ironie.'), text: 'On n’arrête pas le progrès.', tr: 'You can’t stop progress. (often ironic)', tip: b('Stretch “progrès” and let your voice fall: the irony is in the tone.', 'Allongez « progrès » et laissez tomber la voix : l’ironie est dans le ton.') },
    ],
    notes: {
      points: [
        b('Attitude words: sceptique, ironique, réservé, indigné, enthousiaste, inquiet.', 'Mots d’attitude : sceptique, ironique, réservé, indigné, enthousiaste, inquiet.'),
        b('Distance markers: **soi-disant**, **prétendu**, **à en croire**, conditional (**aurait**, **envisagerait**).', 'Marqueurs de distance : **soi-disant**, **prétendu**, **à en croire**, conditionnel (**aurait**, **envisagerait**).'),
        b('Concession: **certes / il est vrai que** + **mais / il n’en reste pas moins que** → the opinion follows.', 'Concession : **certes / il est vrai que** + **mais / il n’en reste pas moins que** → l’opinion suit.'),
        b('Irony says the opposite of what is meant: praise + negative facts.', 'L’ironie dit le contraire de ce qu’elle pense : éloge + faits négatifs.'),
      ],
      vocab: [['soi-disant', b('so-called, supposedly', 'prétendument')], ['les riverains', b('local residents', 'habitants du quartier')], ['un raccourci', b('an oversimplification', 'une conclusion trop rapide')], ['démentir', b('to deny', 'dire que c’est faux')], ['il n’en reste pas moins que', b('the fact remains that', 'malgré tout')]],
    },
  },

  // ── C2 ──
  {
    id: 'tcf-listening-6',
    level: 'C2',
    slug: { en: 'c2-fast-speech-idioms-registers', fr: 'c2-debit-rapide-expressions-registres' },
    title: b('C2 · Fast speech, idioms and registers', 'C2 · Débit rapide, expressions et registres'),
    summary: b('Understand spontaneous, idiomatic and very formal French, and the finest shades of meaning.', 'Comprendre le français spontané, idiomatique et très soutenu, et les nuances les plus fines.'),
    objectives: [b('Understand reductions of spontaneous speech', 'Comprendre les réductions de l’oral spontané'), b('Understand idiomatic expressions in context', 'Comprendre les expressions idiomatiques en contexte'), b('Grasp the precise point of an elaborate argument', 'Saisir le point précis d’une argumentation élaborée')],
    minutes: 15,
    steps: [
      card(b('Spontaneous speech drops sounds', 'L’oral spontané avale des sons'), b('In fast speech, natives drop the **ne**, reduce **il y a** to “y a”, **je suis** to “chuis”, **tu es** to “t’es”, and **je ne sais pas** to “chais pas”. At C2, you must understand them without thinking.', 'À l’oral rapide, on supprime le **ne**, on réduit **il y a** en « y a », **je suis** en « chuis », **tu es** en « t’es » et **je ne sais pas** en « chais pas ». Au C2, il faut les comprendre sans réfléchir.'), {
        examples: [
          { fr: 'J’sais pas trop, faut voir.', tr: 'I don’t really know, we’ll see.' },
          { fr: 'T’as vu l’heure ? On va être à la bourre.', tr: 'Have you seen the time? We’re going to be late.' },
        ],
      }),
      { kind: 'match', prompt: b('Match each idiom with its meaning.', 'Associez chaque expression à son sens.'), pairs: [['tomber des nues', b('to be astonished', 'être très surpris')], ['jeter l’éponge', b('to give up', 'abandonner')], ['avoir du pain sur la planche', b('to have a lot of work', 'avoir beaucoup de travail')], ['couper la poire en deux', b('to compromise', 'faire un compromis')], ['ne pas y aller par quatre chemins', b('to be blunt', 'parler franchement')]] },
      card(b('The finest question: what exactly is claimed?', 'La question la plus fine : qu’affirme-t-on exactement ?'), b('C2 options are all close to the document. Only one matches its **exact strength**: “il est possible que” is not “il est certain que”; “la plupart” is not “tous”. Check the degree of certainty and of quantity.', 'Au C2, toutes les propositions ressemblent au document. Une seule correspond à sa **force exacte** : « il est possible que » n’est pas « il est certain que » ; « la plupart » n’est pas « tous ». Vérifiez le degré de certitude et de quantité.'), { variant: 'exam' }),
      listen('C2', 'm', 'Franchement, quand ils m’ont annoncé la fusion des deux services, je suis tombé des nues. Personne n’avait rien vu venir, même pas les chefs d’équipe.', 'Comment l’homme a-t-il réagi à l’annonce ?', ['Il a été stupéfait', 'Il s’y attendait', 'Il était soulagé', 'Il était en colère contre ses chefs']),
      listen('C2', 'f2', 'Bon, on va pas y aller par quatre chemins : le budget est bouclé, y a plus un sou. Soit on reporte le festival, soit on trouve un mécène d’ici la fin du mois.', 'Que dit la femme ?', ['Sans argent, il faut reporter ou trouver un financeur', 'Le festival est annulé définitivement', 'Le budget du festival a augmenté', 'Un mécène a déjà été trouvé']),
      listen('C2', 'm2', 'Il serait pour le moins hasardeux d’affirmer que la mesure a échoué : ses effets, s’ils existent, ne sauraient se manifester avant plusieurs années.', 'Quelle est la position du locuteur ?', ['Il est trop tôt pour juger la mesure', 'La mesure a clairement échoué', 'La mesure a réussi', 'La mesure n’aura jamais d’effet'], { explain: b('“Il serait hasardeux d’affirmer” = it would be risky to claim. He refuses to conclude.', '« Il serait hasardeux d’affirmer » : il refuse de conclure trop tôt.') }),
      listen('C2', 'f', 'On a longtemps cru que le multitâche nous rendait plus efficaces. Les études récentes nuancent sérieusement ce constat : la plupart des gens perdent en précision ce qu’ils pensent gagner en vitesse.', 'Que montrent les études récentes ?', ['La plupart des gens perdent en précision en faisant plusieurs choses à la fois', 'Tout le monde est plus efficace en multitâche', 'Personne ne peut faire deux choses à la fois', 'Le multitâche rend plus rapide et plus précis']),
      listen('C2', 'm', '— T’as fini le dossier Bertrand ? — Tu rigoles ? J’ai encore du pain sur la planche, chuis même pas à la moitié. — Bon, on coupe la poire en deux : tu me donnes la partie budget, je m’en occupe.', 'Que propose finalement le deuxième homme ?', ['De partager le travail', 'De rendre le dossier en retard', 'D’abandonner le dossier', 'De demander de l’aide au chef']),
      listen('C2', 'f2', 'Que l’on se rassure : il ne s’agit nullement de supprimer les bibliothèques de quartier, mais de repenser leur rôle, à l’heure où le prêt de livres n’est plus leur seule raison d’être.', 'Quel est le but de cette déclaration ?', ['Rassurer en précisant un projet', 'Annoncer la fermeture des bibliothèques', 'Critiquer les lecteurs', 'Demander plus de livres']),
      { kind: 'dictation', prompt: b('Write the sentence in standard written French.', 'Écrivez la phrase en français écrit standard.'), text: 'Je ne sais pas s’il y a encore des places.', voice: 'm', hint: b('Spoken, it sounds like “chais pas s’il y a…”: write the full form.', 'À l’oral, on entend « chais pas s’il y a… » : écrivez la forme complète.') },
    ],
    notes: {
      points: [
        b('Spontaneous reductions: (ne) dropped, **y a** = il y a, **chuis** = je suis, **t’as** = tu as, **chais pas** = je ne sais pas.', 'Réductions de l’oral : (ne) supprimé, **y a** = il y a, **chuis** = je suis, **t’as** = tu as, **chais pas** = je ne sais pas.'),
        b('Idioms: tomber des nues, jeter l’éponge, avoir du pain sur la planche, couper la poire en deux.', 'Expressions : tomber des nues, jeter l’éponge, avoir du pain sur la planche, couper la poire en deux.'),
        b('Formal hedging: **il serait hasardeux de**, **ne sauraient**, **nullement**, **pour le moins**.', 'Prudence soutenue : **il serait hasardeux de**, **ne sauraient**, **nullement**, **pour le moins**.'),
        b('C2 answers match the exact strength of the claim: possible ≠ certain, la plupart ≠ tous.', 'Au C2, la réponse a la force exacte de l’affirmation : possible ≠ certain, la plupart ≠ tous.'),
      ],
      vocab: [['être à la bourre', b('to be late (informal)', 'être en retard (familier)')], ['un mécène', b('a sponsor, patron', 'personne qui finance')], ['boucler un budget', b('to finalise a budget', 'terminer un budget')], ['hasardeux', b('risky', 'risqué')], ['la raison d’être', b('purpose', 'justification')]],
    },
  },
];

export default lessons;
