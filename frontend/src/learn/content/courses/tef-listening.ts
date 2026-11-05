// TEF Canada & TEFAQ · Compréhension orale, A1 → C2. The documents of the TEF:
// voicemails, public announcements, services, workplace, radio and debates,
// with Québec French where it naturally appears.
import { b, type Lesson } from '../../types';
import { card, listen } from '../kit';

const lessons: Lesson[] = [
  // ── A1 ──
  {
    id: 'tef-listening-1',
    level: 'A1',
    slug: { en: 'a1-voicemails-names-addresses', fr: 'a1-messages-vocaux-noms-adresses' },
    title: b('A1 · Voicemails: names, numbers and addresses', 'A1 · Messages vocaux : noms, numéros et adresses'),
    summary: b('Understand the simplest TEF documents: who calls, when, where, and a number to call back.', 'Comprendre les documents les plus simples du TEF : qui appelle, quand, où, et le numéro à rappeler.'),
    objectives: [b('Understand spelled names and addresses', 'Comprendre des noms épelés et des adresses'), b('Catch days, dates and times', 'Saisir jours, dates et heures'), b('Find who is calling and why', 'Trouver qui appelle et pourquoi')],
    minutes: 13,
    steps: [
      card(b('The French alphabet on the phone', 'L’alphabet au téléphone'), b('Names are often spelled. Tricky letters: **E** (like “euh”), **I** (like “ee”), **G** (zhé) and **J** (zhee), **H** (ash), **W** (double-vé), **Y** (i grec). Addresses in Canada: number + street: **mille deux cents, rue Sainte-Catherine**.', 'Les noms sont souvent épelés. Lettres difficiles : **E**, **I**, **G** et **J**, **H**, **W** (double-vé), **Y** (i grec). Adresses au Canada : numéro + rue : **mille deux cents, rue Sainte-Catherine**.'), {
        examples: [
          { fr: 'Gagnon, ça s’écrit G, A, G, N, O, N.', tr: 'Gagnon is spelled G-A-G-N-O-N.' },
          { fr: 'J’habite au quatre cent quinze, boulevard Saint-Laurent.', tr: 'I live at 415 Saint-Laurent Boulevard.' },
          { fr: 'Le rendez-vous est le mardi douze mars.', tr: 'The appointment is on Tuesday 12 March.' },
        ],
      }),
      { kind: 'match', prompt: b('Match each day or month with its English equivalent.', 'Associez chaque jour ou mois à son équivalent.'), pairs: [['mercredi', b('Wednesday', 'troisième jour')], ['jeudi', b('Thursday', 'quatrième jour')], ['juin', b('June', 'sixième mois')], ['août', b('August', 'huitième mois')], ['décembre', b('December', 'dernier mois')]] },
      card(b('Who, when, where', 'Qui, quand, où'), b('A short voicemail always gives **who** (Bonjour, c’est…), **when** (lundi, à dix heures) and often **where**. Write these three things in your head as you listen.', 'Un court message vocal donne toujours **qui** (Bonjour, c’est…), **quand** (lundi, à dix heures) et souvent **où**. Notez mentalement ces trois éléments pendant l’écoute.'), { variant: 'tip' }),
      listen('A1', 'f2', 'Bonjour, c’est Isabelle Tremblay, de la clinique dentaire. Votre rendez-vous est mercredi à quatorze heures.', 'Qui appelle ?', ['Une clinique dentaire', 'Une école', 'Une banque', 'Un restaurant']),
      listen('A1', 'm', 'Bonjour, mon nom est Pierre Roy. R, O, Y. Rappelez-moi au cinq, un, quatre, cinq, cinq, cinq, zéro, huit, deux, un.', 'Comment s’écrit le nom de famille ?', ['Roy', 'Roi', 'Roa', 'Rouy']),
      listen('A1', 'f', 'Salut, c’est Marie. La fête est samedi, chez moi, au deux cent dix, rue Laurier. À samedi !', 'Où est la fête ?', ['Chez Marie, rue Laurier', 'Au restaurant', 'Au parc Laurier', 'Chez Pierre']),
      listen('A1', 'm2', 'Bonjour, ici la bibliothèque. Votre livre est arrivé. Vous pouvez venir le chercher jusqu’au vendredi vingt mai.', 'Jusqu’à quand peut-on chercher le livre ?', ['Le vendredi 20 mai', 'Le vendredi 2 mai', 'Le mardi 20 mai', 'Le samedi 21 mai']),
      listen('A1', 'f2', 'Bonjour madame, votre commande est prête. Le magasin est ouvert de neuf heures à dix-sept heures.', 'Le magasin ferme à quelle heure ?', ['17 h', '9 h', '19 h', '7 h']),
      listen('A1', 'm', 'Allô, c’est Ahmed. Je suis à l’arrêt d’autobus devant l’école. Tu viens me chercher ?', 'Où est Ahmed ?', ['À l’arrêt d’autobus', 'Dans l’école', 'Chez lui', 'Au métro']),
      { kind: 'dictation', prompt: b('Write the address you hear.', 'Écrivez l’adresse que vous entendez.'), text: 'Trois cents, rue Sherbrooke.', voice: 'f2', hint: b('Write the number in words, as you hear it.', 'Écrivez le nombre en lettres, comme vous l’entendez.') },
    ],
    notes: {
      points: [
        b('Spelling letters: E, I, G (zhé), J (zhee), H (ash), W (double-vé), Y (i grec).', 'Lettres épelées : E, I, G, J, H (ache), W (double-vé), Y (i grec).'),
        b('Canadian addresses: number + rue / boulevard / avenue + name.', 'Adresses au Canada : numéro + rue / boulevard / avenue + nom.'),
        b('A voicemail gives who → when → where → number to call back.', 'Un message vocal donne qui → quand → où → numéro à rappeler.'),
        b('Dates: le + day + number + month: le mardi douze mars.', 'Dates : le + jour + nombre + mois : le mardi douze mars.'),
      ],
      vocab: [['la commande', b('order', 'ce qu’on a commandé')], ['venir chercher', b('to pick up', 'récupérer')], ['l’arrêt d’autobus (m.)', b('bus stop', 'endroit où l’autobus s’arrête')], ['rappeler', b('to call back', 'téléphoner à nouveau')], ['épeler', b('to spell', 'dire les lettres')]],
    },
  },

  // ── A2 ──
  {
    id: 'tef-listening-2',
    level: 'A2',
    slug: { en: 'a2-public-announcements-instructions', fr: 'a2-annonces-publiques-consignes' },
    title: b('A2 · Public announcements and instructions', 'A2 · Annonces publiques et consignes'),
    summary: b('Understand announcements in transport, shops and public services, and instructions at work.', 'Comprendre les annonces dans les transports, les magasins et les services publics, et les consignes au travail.'),
    objectives: [b('Understand transport and airport announcements', 'Comprendre les annonces des transports et de l’aéroport'), b('Understand what you must or must not do', 'Comprendre ce qu’il faut faire ou ne pas faire'), b('Follow simple workplace instructions', 'Suivre des consignes simples au travail')],
    minutes: 14,
    steps: [
      card(b('The language of announcements', 'La langue des annonces'), b('Announcements use fixed formulas: **en raison de** (because of), **est prié(e) de** (is requested to), **il est interdit de**, **merci de**, **à destination de**, **en provenance de**. Recognise them and you understand the structure at once.', 'Les annonces utilisent des formules fixes : **en raison de**, **est prié(e) de**, **il est interdit de**, **merci de**, **à destination de**, **en provenance de**. Reconnaissez-les et vous comprenez tout de suite la structure.'), {
        examples: [
          { fr: 'En raison d’un incident, le service est interrompu sur la ligne orange.', tr: 'Due to an incident, service is interrupted on the orange line.' },
          { fr: 'Les passagers du vol pour Vancouver sont priés de se présenter à la porte douze.', tr: 'Passengers on the flight to Vancouver are requested to go to gate 12.' },
        ],
      }),
      { kind: 'match', prompt: b('Match each formula with its meaning.', 'Associez chaque formule à son sens.'), pairs: [['en provenance de', b('coming from', 'qui vient de')], ['à destination de', b('going to', 'qui va à')], ['est prié de', b('is requested to', 'doit, poliment')], ['interrompu', b('stopped temporarily', 'arrêté pour un moment')], ['en raison de', b('because of', 'à cause de')]] },
      listen('A2', 'f2', 'Votre attention, s’il vous plaît. En raison d’un incident technique, le service est interrompu entre les stations Berri-UQAM et Longueuil. Des autobus sont mis à votre disposition.', 'Que propose-t-on aux voyageurs ?', ['Des autobus', 'Un remboursement', 'Un taxi gratuit', 'D’attendre une heure']),
      listen('A2', 'm2', 'Le vol AC huit cent quarante, à destination de Calgary, est retardé. Nouvelle heure de départ : quinze heures dix. Embarquement porte vingt-deux.', 'Quelle est la nouvelle heure de départ ?', ['15 h 10', '14 h 40', '15 h 22', '8 h 40']),
      listen('A2', 'f', 'Chers clients, le magasin fermera ses portes dans quinze minutes. Merci de vous diriger vers les caisses.', 'Que doivent faire les clients ?', ['Aller payer', 'Quitter le magasin tout de suite', 'Revenir demain', 'Aller au service client']),
      listen('A2', 'm', 'Bienvenue dans l’équipe ! Avant de commencer, mettez votre casque et vos chaussures de sécurité. Il est interdit d’entrer dans l’entrepôt sans ce matériel.', 'Qu’est-ce qui est obligatoire ?', ['Porter un casque et des chaussures de sécurité', 'Arriver avant huit heures', 'Avoir un badge', 'Parler au chef d’équipe']),
      listen('A2', 'f2', 'Avis aux usagers : à partir du premier juillet, la carte OPUS sera obligatoire pour prendre l’autobus. Les billets papier ne seront plus acceptés.', 'Qu’est-ce qui change le premier juillet ?', ['Les billets papier ne sont plus acceptés', 'L’autobus devient gratuit', 'La carte OPUS est supprimée', 'Les horaires changent']),
      listen('A2', 'm2', 'Bonjour, pour un rendez-vous, tapez un. Pour connaître nos heures d’ouverture, tapez deux. Pour parler à un agent, restez en ligne.', 'Que faut-il faire pour parler à quelqu’un ?', ['Rester en ligne', 'Taper un', 'Taper deux', 'Rappeler plus tard']),
      { kind: 'fill', prompt: b('Complete the announcement.', 'Complétez l’annonce.'), text: 'Les passagers ___ de Toronto peuvent récupérer leurs bagages au carrousel trois.', answers: [['en provenance']], choices: [['en provenance', 'à destination', 'en raison']] },
    ],
    notes: {
      points: [
        b('Formulas: en raison de, est prié(e) de, merci de, il est interdit de, à destination / en provenance de.', 'Formules : en raison de, est prié(e) de, merci de, il est interdit de, à destination / en provenance de.'),
        b('In transport announcements, catch the line, the station, the time and the alternative.', 'Dans les annonces de transport, saisissez la ligne, la station, l’heure et la solution proposée.'),
        b('Phone menus: tapez (press), restez en ligne (stay on the line).', 'Menus téléphoniques : tapez, restez en ligne.'),
        b('Obligation: obligatoire, il faut, vous devez. Prohibition: interdit, il est défendu de.', 'Obligation : obligatoire, il faut, vous devez. Interdiction : interdit, il est défendu de.'),
      ],
      vocab: [['l’embarquement (m.)', b('boarding', 'montée dans l’avion')], ['la caisse', b('checkout', 'endroit où l’on paie')], ['l’entrepôt (m.)', b('warehouse', 'lieu de stockage')], ['l’usager (m.)', b('user (of a service)', 'personne qui utilise un service')], ['mis à disposition', b('made available', 'offert')]],
    },
  },

  // ── B1 ──
  {
    id: 'tef-listening-3',
    level: 'B1',
    slug: { en: 'b1-services-and-workplace-conversations', fr: 'b1-conversations-services-et-travail' },
    title: b('B1 · Conversations at services and at work', 'B1 · Conversations dans les services et au travail'),
    summary: b('Follow conversations at the bank, with a landlord or between colleagues: the problem, the solution, the decision.', 'Suivre des conversations à la banque, avec un propriétaire ou entre collègues : le problème, la solution, la décision.'),
    objectives: [b('Identify a problem and its solution', 'Identifier un problème et sa solution'), b('Understand who decides what', 'Comprendre qui décide quoi'), b('Understand the vocabulary of housing and work', 'Comprendre le vocabulaire du logement et du travail')],
    minutes: 14,
    steps: [
      card(b('Problem → solution → decision', 'Problème → solution → décision'), b('Most B1 TEF conversations follow this pattern. One person has a **problem**, the other proposes **solutions**, and they reach a **decision**. The question often asks for the decision: listen to the end.', 'La plupart des conversations B1 du TEF suivent ce schéma. Une personne a un **problème**, l’autre propose des **solutions**, et ils prennent une **décision**. La question porte souvent sur la décision : écoutez jusqu’au bout.')),
      card(b('Housing in Québec', 'Le logement au Québec'), b('Useful words: **le bail** (lease), **le propriétaire** (landlord), **le locataire** (tenant), **le concierge**, **un dégât d’eau** (water damage), **le chauffage**, **le 1er juillet** (moving day in Québec).', 'Mots utiles : **le bail**, **le propriétaire**, **le locataire**, **le concierge**, **un dégât d’eau**, **le chauffage**, **le 1er juillet** (jour des déménagements au Québec).'), { variant: 'culture' }),
      listen('B1', 'f', '— Bonjour monsieur, le chauffage ne fonctionne plus depuis hier dans mon appartement. — Ah, je suis désolé. Je ne peux pas venir aujourd’hui, mais j’envoie un technicien demain matin. — D’accord, je serai là.', 'Que va-t-il se passer ?', ['Un technicien viendra demain matin', 'Le propriétaire viendra aujourd’hui', 'La locataire va déménager', 'Le chauffage sera remplacé dans une semaine']),
      listen('B1', 'm2', '— J’aimerais ouvrir un compte, mais je viens d’arriver au Canada. — Pas de problème. Il me faut simplement votre passeport et un justificatif d’adresse. — Je n’ai pas encore de facture à mon nom… — Votre bail fera l’affaire.', 'Quel document va servir de justificatif d’adresse ?', ['Le bail', 'Une facture', 'Le passeport', 'Une lettre de l’employeur']),
      listen('B1', 'f2', '— Julien, tu pourrais me remplacer à la réunion de jeudi ? J’ai un rendez-vous chez le médecin. — Jeudi, je suis en formation toute la journée. Demande plutôt à Nadia. — Bonne idée, merci.', 'Qui va probablement remplacer la femme ?', ['Nadia', 'Julien', 'Le médecin', 'Personne']),
      listen('B1', 'm', '— Votre colis n’a pas pu être livré parce que vous étiez absent. — Est-ce que je peux le récupérer ce soir ? — Oui, au bureau de poste de la rue Saint-Denis, jusqu’à dix-huit heures, avec une pièce d’identité.', 'Pourquoi le colis n’a-t-il pas été livré ?', ['La personne était absente', 'L’adresse était fausse', 'Le colis était abîmé', 'Le bureau de poste était fermé']),
      listen('B1', 'f', '— Je voudrais m’inscrire au cours de francisation du soir. — Malheureusement, il est complet. Il reste des places le samedi matin, ou je peux vous mettre sur la liste d’attente du soir. — Je préfère attendre une place le soir, le samedi je travaille.', 'Que choisit la personne ?', ['La liste d’attente du cours du soir', 'Le cours du samedi matin', 'Un cours en ligne', 'Elle abandonne']),
      listen('B1', 'm2', '— Le patron veut le rapport pour vendredi. — Vendredi ? Impossible, il manque encore les chiffres de la comptabilité. — Bon, je vais lui demander un délai jusqu’à mardi.', 'Que va faire l’homme ?', ['Demander plus de temps au patron', 'Finir le rapport vendredi', 'Appeler la comptabilité', 'Annuler le rapport']),
      { kind: 'match', prompt: b('Match each housing word with its meaning.', 'Associez chaque mot du logement à son sens.'), pairs: [['le bail', b('lease', 'contrat de location')], ['le locataire', b('tenant', 'personne qui loue')], ['un dégât d’eau', b('water damage', 'dommage causé par l’eau')], ['le justificatif', b('proof (document)', 'document qui prouve')], ['la francisation', b('French courses for immigrants', 'cours de français pour immigrants')]] },
    ],
    notes: {
      points: [
        b('B1 conversations: problem → solutions → decision. The question often targets the decision.', 'Conversations B1 : problème → solutions → décision. La question vise souvent la décision.'),
        b('Listen to the end: “plutôt”, “finalement”, “je préfère” announce the final choice.', 'Écoutez jusqu’au bout : « plutôt », « finalement », « je préfère » annoncent le choix final.'),
        b('Housing: le bail, le propriétaire, le locataire, un dégât d’eau, le 1er juillet.', 'Logement : le bail, le propriétaire, le locataire, un dégât d’eau, le 1er juillet.'),
        b('Work: un délai (deadline extension), une formation, remplacer quelqu’un.', 'Travail : un délai, une formation, remplacer quelqu’un.'),
      ],
      vocab: [['le colis', b('parcel', 'paquet')], ['faire l’affaire', b('to do (the job)', 'convenir')], ['un délai', b('extra time, deadline', 'temps supplémentaire')], ['la liste d’attente', b('waiting list', 'liste des personnes qui attendent')], ['la formation', b('training', 'cours professionnel')]],
    },
  },

  // ── B2 ──
  {
    id: 'tef-listening-4',
    level: 'B2',
    slug: { en: 'b2-radio-interviews-quebec-french', fr: 'b2-interviews-radio-francais-quebecois' },
    title: b('B2 · Radio interviews and Québec French', 'B2 · Interviews radio et français québécois'),
    summary: b('Understand interviews on everyday topics, the speakers’ arguments, and common Québec expressions.', 'Comprendre des interviews sur des sujets du quotidien, les arguments des intervenants et les expressions québécoises courantes.'),
    objectives: [b('Follow the arguments of an interview', 'Suivre les arguments d’une interview'), b('Recognise common Québec expressions', 'Reconnaître les expressions québécoises courantes'), b('Distinguish the journalist’s and the guest’s views', 'Distinguer l’avis du journaliste et celui de l’invité')],
    minutes: 15,
    steps: [
      card(b('Québec French you will hear', 'Le français québécois que vous entendrez'), b('The TEF and the TEFAQ include Canadian speakers. Common words: **un char** (a car), **magasiner** (to shop), **une fin de semaine** (weekend), **c’est plate** (it’s boring), **pantoute** (not at all), **avoir de la misère à** (to have trouble), **tantôt** (earlier / later), **bienvenue** (you’re welcome).', 'Le TEF et le TEFAQ font entendre des locuteurs canadiens. Mots courants : **un char**, **magasiner**, **une fin de semaine**, **c’est plate**, **pantoute**, **avoir de la misère à**, **tantôt**, **bienvenue** (= de rien).'), {
        examples: [
          { fr: 'J’ai magasiné toute la fin de semaine.', tr: 'I went shopping all weekend.' },
          { fr: 'J’ai de la misère à trouver un logement.', tr: 'I’m having trouble finding a place to live.' },
          { fr: 'C’est pas compliqué pantoute.', tr: 'It’s not complicated at all.' },
        ],
      }),
      { kind: 'match', prompt: b('Match the Québec expression with its standard French equivalent.', 'Associez l’expression québécoise à son équivalent standard.'), pairs: [['un char', 'une voiture'], ['magasiner', 'faire les magasins'], ['c’est plate', 'c’est ennuyeux'], ['pantoute', 'pas du tout'], ['la fin de semaine', 'le week-end']] },
      listen('B2', 'f2', '— Vous avez ouvert une épicerie zéro déchet il y a deux ans. Ça marche ? — Au début, j’avais de la misère à convaincre les clients d’apporter leurs contenants. Aujourd’hui, la moitié de nos ventes se font en vrac.', 'Quel problème la commerçante a-t-elle rencontré au début ?', ['Convaincre les clients d’apporter leurs contenants', 'Trouver des fournisseurs', 'Payer son loyer', 'Recruter du personnel']),
      listen('B2', 'm', 'Moi, l’hiver, je laisse mon char au garage et je prends le métro. C’est plus simple, pis je n’ai pas besoin de déneiger chaque matin. Le seul inconvénient, c’est le monde aux heures de pointe.', 'Quel inconvénient l’homme mentionne-t-il ?', ['La foule aux heures de pointe', 'Le prix du métro', 'Le froid dans les stations', 'Le déneigement de la voiture']),
      listen('B2', 'f', '— Faut-il obliger les nouveaux arrivants à suivre des cours de français ? — Obliger, je ne sais pas. Mais il faut surtout que les cours soient gratuits et offerts le soir, sinon ceux qui travaillent ne peuvent tout simplement pas y aller.', 'Sur quoi l’invitée insiste-t-elle ?', ['L’accessibilité des cours', 'L’obligation de suivre les cours', 'La difficulté du français', 'Le nombre de nouveaux arrivants']),
      listen('B2', 'm2', 'On entend souvent que les jeunes ne veulent plus travailler. C’est faux. Ce qu’ils refusent, c’est un emploi qui n’a pas de sens ou qui empêche toute vie personnelle. Nuance importante.', 'Que corrige le locuteur ?', ['L’idée que les jeunes ne veulent plus travailler', 'L’idée que les emplois manquent', 'Les salaires des jeunes', 'Le sens du mot « travail »']),
      listen('B2', 'f2', '— Le prix des loyers a augmenté de dix pour cent cette année à Montréal. Que conseillez-vous aux locataires ? — De bien lire leur avis d’augmentation : ils ont le droit de la refuser, et c’est alors au Tribunal administratif du logement de fixer le loyer.', 'Que conseille l’experte aux locataires ?', ['Vérifier l’avis d’augmentation et savoir qu’ils peuvent le refuser', 'Déménager immédiatement', 'Payer l’augmentation sans discuter', 'Acheter un logement']),
      listen('B2', 'm', '— Bienvenue ! — Pardon ? Je vous ai dit merci, pas bonjour. — Ici, au Québec, « bienvenue », ça veut dire « de rien ».', 'Que signifie « bienvenue » dans cette situation ?', ['De rien', 'Bonjour', 'Au revoir', 'Entrez']),
      { kind: 'fill', prompt: b('Translate into standard French.', 'Traduisez en français standard.'), text: '« Je vais magasiner tantôt. » = Je vais faire les ___ plus tard.', answers: [['magasins', 'courses']] },
    ],
    notes: {
      points: [
        b('Québec words: char, magasiner, fin de semaine, plate, pantoute, avoir de la misère à, tantôt, bienvenue (= de rien).', 'Mots québécois : char, magasiner, fin de semaine, plate, pantoute, avoir de la misère à, tantôt, bienvenue (= de rien).'),
        b('“Pis” = puis, et (oral Québec). “Le monde” = les gens.', '« Pis » = puis, et (oral québécois). « Le monde » = les gens.'),
        b('Interviews: separate the journalist’s question from the guest’s answer.', 'Interviews : séparez la question du journaliste de la réponse de l’invité.'),
        b('“C’est faux. Ce que…, c’est…” → the speaker corrects a common idea.', '« C’est faux. Ce que…, c’est… » → le locuteur corrige une idée reçue.'),
      ],
      vocab: [['en vrac', b('in bulk (no packaging)', 'sans emballage')], ['le contenant', b('container', 'récipient')], ['l’heure de pointe (f.)', b('rush hour', 'moment de forte affluence')], ['l’avis (m.)', b('notice', 'lettre officielle')], ['le nouvel arrivant', b('newcomer', 'immigrant récent')]],
    },
  },

  // ── C1 ──
  {
    id: 'tef-listening-5',
    level: 'C1',
    slug: { en: 'c1-debates-commentaries', fr: 'c1-debats-et-chroniques' },
    title: b('C1 · Debates and commentaries', 'C1 · Débats et chroniques'),
    summary: b('Follow several speakers in a debate, understand their strategies and the commentator’s tone.', 'Suivre plusieurs intervenants dans un débat, comprendre leurs stratégies et le ton du chroniqueur.'),
    objectives: [b('Follow a debate with several voices', 'Suivre un débat à plusieurs voix'), b('Identify argumentative strategies', 'Identifier les stratégies argumentatives'), b('Understand a commentator’s tone', 'Comprendre le ton d’un chroniqueur')],
    minutes: 15,
    steps: [
      card(b('Argumentative strategies', 'Les stratégies argumentatives'), b('At C1, the question can be about **how** someone argues: **giving an example**, **quoting a figure**, **appealing to experience**, **turning the argument around**, **questioning the source**. Listen to the structure, not only the content.', 'Au C1, la question peut porter sur la **façon** d’argumenter : **donner un exemple**, **citer un chiffre**, **faire appel à l’expérience**, **retourner l’argument**, **mettre en doute la source**. Écoutez la structure, pas seulement le contenu.')),
      { kind: 'match', prompt: b('Match each sentence with its strategy.', 'Associez chaque phrase à sa stratégie.'), pairs: [['Selon Statistique Canada, 22 % des ménages…', b('quoting a figure', 'citer un chiffre')], ['Vous dites que c’est trop cher ? C’est l’inaction qui coûte cher.', b('turning the argument around', 'retourner l’argument')], ['D’où vient ce sondage, au juste ?', b('questioning the source', 'mettre en doute la source')], ['Moi qui enseigne depuis vingt ans, je peux vous dire que…', b('appealing to experience', 'faire appel à l’expérience')]] },
      listen('C1', 'm2', '— Vous dites que la réduction des limites de vitesse va ralentir l’économie. Mais combien coûtent les accidents en soins de santé, en journées de travail perdues ? C’est plutôt l’inaction qui nous coûte cher.', 'Quelle stratégie l’homme utilise-t-il ?', ['Il retourne l’argument économique de son adversaire', 'Il cite une étude précise', 'Il raconte une expérience personnelle', 'Il change de sujet']),
      listen('C1', 'f', '— Ce sondage montre que soixante-dix pour cent des gens sont favorables au projet. — Encore faudrait-il savoir qui l’a commandé, ce sondage, et comment la question était formulée.', 'Comment la deuxième personne réagit-elle ?', ['Elle met en doute la fiabilité du sondage', 'Elle accepte les résultats', 'Elle cite un autre sondage', 'Elle demande le nombre de participants']),
      listen('C1', 'm', 'Chaque printemps, c’est le même rituel : les nids-de-poule se multiplient, la Ville promet un plan d’action, et chaque printemps, nos voitures en paient le prix. Mais rassurez-vous, le plan sera sûrement prêt l’an prochain.', 'Quel est le ton du chroniqueur ?', ['Ironique', 'Optimiste', 'Neutre', 'Admiratif']),
      listen('C1', 'f2', '— La quatre-voies va désengorger le centre-ville. — Toutes les études le montrent : plus on construit de routes, plus il y a de voitures. On ne règle pas un embouteillage en élargissant l’entonnoir.', 'Que pense la femme du projet routier ?', ['Il augmentera la circulation au lieu de la réduire', 'Il réglera les embouteillages', 'Il est trop cher', 'Il est déjà terminé']),
      listen('C1', 'm2', 'Je ne remets pas en question la bonne foi des organisateurs. Je constate simplement que, pour la troisième année consécutive, le festival termine dans le rouge, et que ce sont les contribuables qui épongent la dette.', 'Que reproche l’homme au festival ?', ['Ses déficits répétés payés par les contribuables', 'La malhonnêteté des organisateurs', 'Sa programmation', 'Son manque de public']),
      listen('C1', 'f', 'Moi qui travaille aux urgences depuis quinze ans, je peux vous dire une chose : le problème, ce n’est pas le nombre de médecins, c’est leur répartition sur le territoire.', 'Sur quoi la femme appuie-t-elle son argument ?', ['Sur son expérience professionnelle', 'Sur une étude scientifique', 'Sur un sondage', 'Sur l’avis d’un ministre']),
      { kind: 'fill', prompt: b('Choose the right expression.', 'Choisissez la bonne expression.'), text: 'Pour la troisième année, le festival termine dans le ___.', answers: [['rouge']], choices: [['rouge', 'noir', 'vert']], explain: b('Être dans le rouge = to be in deficit.', 'Être dans le rouge = être en déficit.') },
    ],
    notes: {
      points: [
        b('Strategies: quoting a figure, giving an example, appealing to experience, turning the argument around, questioning the source.', 'Stratégies : citer un chiffre, donner un exemple, faire appel à l’expérience, retourner l’argument, mettre en doute la source.'),
        b('“Encore faudrait-il savoir…” = expresses doubt about a claim.', '« Encore faudrait-il savoir… » = exprime un doute sur une affirmation.'),
        b('“Je ne remets pas en question X. Je constate simplement que Y.” → the criticism is Y.', '« Je ne remets pas en question X. Je constate simplement que Y. » → la critique est Y.'),
        b('Commentaries often end with irony: “rassurez-vous, ce sera sûrement prêt…”.', 'Les chroniques finissent souvent par l’ironie : « rassurez-vous, ce sera sûrement prêt… ».'),
      ],
      vocab: [['le nid-de-poule', b('pothole', 'trou dans la route')], ['désengorger', b('to relieve congestion', 'décongestionner')], ['être dans le rouge', b('to be in deficit', 'perdre de l’argent')], ['éponger une dette', b('to pay off a debt', 'rembourser')], ['la répartition', b('distribution', 'façon dont c’est réparti')]],
    },
  },

  // ── C2 ──
  {
    id: 'tef-listening-6',
    level: 'C2',
    slug: { en: 'c2-lectures-humour-wordplay', fr: 'c2-conferences-humour-jeux-de-mots' },
    title: b('C2 · Lectures, humour and wordplay', 'C2 · Conférences, humour et jeux de mots'),
    summary: b('Understand specialised talks, humour, double meanings and the subtle positions of expert speakers.', 'Comprendre des exposés spécialisés, l’humour, les doubles sens et les positions subtiles des locuteurs experts.'),
    objectives: [b('Understand a specialised talk', 'Comprendre un exposé spécialisé'), b('Catch humour and double meanings', 'Saisir l’humour et les doubles sens'), b('Identify a very subtle position', 'Identifier une position très subtile')],
    minutes: 15,
    steps: [
      card(b('Humour and double meanings', 'L’humour et les doubles sens'), b('C2 documents can play with words: a **jeu de mots** (pun), a **sous-entendu** (innuendo), an **understatement** for comic effect. To answer, ask: what is the speaker **really** saying, and why is it funny?', 'Les documents C2 peuvent jouer avec les mots : un **jeu de mots**, un **sous-entendu**, une **litote** à effet comique. Pour répondre, demandez-vous : que dit **vraiment** le locuteur, et pourquoi est-ce drôle ?'), {
        examples: [
          { fr: 'Cette réunion aurait pu être un courriel. Et ce courriel aurait pu ne pas exister.', tr: 'This meeting could have been an email. And that email didn’t need to exist.' },
          { fr: 'Le budget n’est pas en déficit : il est simplement en avance sur ses dépenses.', tr: 'The budget is not in deficit: its spending is simply ahead of schedule.' },
        ],
      }),
      { kind: 'match', prompt: b('Match each expression with its meaning.', 'Associez chaque expression à son sens.'), pairs: [['avoir plus d’une corde à son arc', b('to have several skills', 'avoir plusieurs compétences')], ['tourner autour du pot', b('to beat around the bush', 'éviter le sujet')], ['ménager la chèvre et le chou', b('to keep both sides happy', 'ne pas choisir entre deux camps')], ['se faire passer un sapin (Québec)', b('to be tricked', 'se faire avoir')], ['être tiguidou (Québec)', b('to be all good', 'être parfait')]] },
      listen('C2', 'm2', 'Le rapport ménage habilement la chèvre et le chou : il reconnaît les inquiétudes des riverains tout en recommandant la poursuite du projet. Bref, tout le monde a raison, et rien ne change.', 'Que pense le locuteur du rapport ?', ['Il évite de trancher pour ne fâcher personne', 'Il soutient clairement les riverains', 'Il demande l’arrêt du projet', 'Il est très innovant']),
      listen('C2', 'f2', 'Le concept de « charge mentale » ne désigne pas la quantité de tâches accomplies, mais le fait de devoir penser à tout, en permanence : anticiper, planifier, se souvenir. C’est ce travail invisible qui épuise.', 'Selon la conférencière, qu’est-ce que la charge mentale ?', ['Le fait de devoir tout anticiper et organiser en permanence', 'Le nombre de tâches ménagères', 'La fatigue physique au travail', 'Le stress des examens']),
      listen('C2', 'm', 'Quand le vendeur m’a dit que la garantie couvrait « presque tout », j’aurais dû me méfier. Le « presque », c’était justement la seule pièce qui a brisé. Je me suis fait passer un sapin.', 'Qu’est-il arrivé au locuteur ?', ['Il a été trompé par une garantie insuffisante', 'Il a obtenu un remboursement complet', 'Il a acheté un sapin', 'Le vendeur l’a aidé']),
      listen('C2', 'f', 'Je ne dirais pas que le projet a échoué. Je dirais plutôt qu’il a brillamment démontré tout ce qu’il ne fallait pas faire, ce qui, en soi, a une certaine valeur pédagogique.', 'Que veut dire la locutrice ?', ['Le projet est un échec dont on peut tirer des leçons', 'Le projet est une grande réussite', 'Le projet n’est pas terminé', 'Le projet était destiné à l’école']),
      listen('C2', 'm2', 'Arrêtez de tourner autour du pot : oui ou non, l’entreprise va-t-elle délocaliser sa production ? Vos salariés méritent une réponse claire, pas un communiqué de trois pages.', 'Que reproche l’homme à son interlocuteur ?', ['D’éviter de répondre clairement', 'De vouloir délocaliser', 'D’avoir écrit un communiqué trop court', 'De mal payer les salariés']),
      listen('C2', 'f2', 'La recherche ne dit pas que les écrans rendent les enfants moins intelligents ; elle suggère que le temps passé devant eux est retiré à d’autres activités, comme le jeu libre ou la lecture, dont les bienfaits sont, eux, bien établis.', 'Quelle est la position exacte de la chercheuse ?', ['Le problème est le temps pris à d’autres activités utiles', 'Les écrans rendent les enfants moins intelligents', 'Les écrans n’ont aucun effet', 'La lecture est inutile']),
      { kind: 'speak', prompt: b('Repeat with ironic intonation.', 'Répétez avec une intonation ironique.'), text: 'Il a brillamment démontré tout ce qu’il ne fallait pas faire.', tr: 'It brilliantly demonstrated everything not to do.' },
    ],
    notes: {
      points: [
        b('Humour: puns, innuendo, comic understatement. Ask what is really said.', 'Humour : jeux de mots, sous-entendus, litote comique. Demandez-vous ce qui est vraiment dit.'),
        b('Expressions: ménager la chèvre et le chou, tourner autour du pot, avoir plus d’une corde à son arc.', 'Expressions : ménager la chèvre et le chou, tourner autour du pot, avoir plus d’une corde à son arc.'),
        b('Québec: se faire passer un sapin (to be tricked), c’est tiguidou (all good).', 'Québec : se faire passer un sapin (se faire avoir), c’est tiguidou (c’est parfait).'),
        b('“Je ne dirais pas que X. Je dirais plutôt que Y.” → the exact position is Y.', '« Je ne dirais pas que X. Je dirais plutôt que Y. » → la position exacte est Y.'),
      ],
      vocab: [['trancher', b('to decide firmly', 'décider nettement')], ['la charge mentale', b('mental load', 'travail invisible d’organisation')], ['se méfier', b('to be wary', 'ne pas faire confiance')], ['délocaliser', b('to relocate abroad', 'déplacer la production à l’étranger')], ['le communiqué', b('press release', 'texte officiel')]],
    },
  },
];

export default lessons;
