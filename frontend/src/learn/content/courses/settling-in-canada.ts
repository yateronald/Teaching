// S’installer au Canada: the French of the first weeks — housing, papers,
// health and school. Practical vocabulary and the phrases to use at a counter.
import { b, type Lesson } from '../../types';
import { card, listen, pick, read } from '../kit';

const lessons: Lesson[] = [
  {
    id: 'settling-in-canada-1',
    slug: { en: 'finding-a-home-and-signing-a-lease', fr: 'trouver-un-logement-et-signer-un-bail' },
    title: b('Finding a home and signing a lease', 'Trouver un logement et signer un bail'),
    summary: b('Read a rental ad, call the landlord, visit the apartment and understand your lease.', 'Lire une annonce, appeler le propriétaire, visiter le logement et comprendre votre bail.'),
    objectives: [b('Understand the vocabulary of rental ads', 'Comprendre le vocabulaire des annonces de location'), b('Ask the right questions during a visit', 'Poser les bonnes questions pendant une visite'), b('Understand the key terms of a lease', 'Comprendre les termes essentiels d’un bail')],
    minutes: 14,
    steps: [
      card(b('The words of housing', 'Les mots du logement'), b('**le bail** (lease), **le loyer** (rent), **le / la propriétaire** (landlord), **le / la locataire** (tenant), **chauffé** (heating included), **meublé** (furnished), **les électros** (appliances, Québec), **un 4 ½** (two bedrooms, Québec).', '**le bail**, **le loyer**, **le / la propriétaire**, **le / la locataire**, **chauffé** (chauffage compris), **meublé**, **les électros** (électroménagers, Québec), **un 4 ½** (deux chambres, Québec).'), {
        examples: [{ fr: 'Le loyer est de mille deux cents dollars par mois.', tr: 'The rent is $1,200 a month.' }, { fr: 'Est-ce que le chauffage est compris ?', tr: 'Is heating included?' }, { fr: 'Je voudrais visiter l’appartement.', tr: 'I would like to visit the apartment.' }],
      }),
      { kind: 'match', prompt: b('Match each word with its meaning.', 'Associez chaque mot à son sens.'), pairs: [['le bail', b('lease', 'contrat de location')], ['le loyer', b('rent', 'somme payée chaque mois')], ['le locataire', b('tenant', 'personne qui loue')], ['meublé', b('furnished', 'avec des meubles')], ['chauffé', b('heating included', 'chauffage compris')]] },
      read('A2', { title: b('Rental ad', 'Annonce'), text: 'À louer, Rosemont : 4 ½ lumineux, 3e étage, chauffé, électros inclus. 1 450 $/mois. Libre le 1er juillet. Animaux acceptés. Visites sur rendez-vous.' }, 'Quelle information est vraie ?', ['Le chauffage est compris dans le loyer.', 'L’appartement est meublé.', 'Les animaux sont interdits.', 'On peut visiter sans rendez-vous.']),
      listen('A2', 'm2', 'Bonjour, c’est pour l’appartement. Oui, il est encore libre. Vous pouvez venir le visiter demain à dix-huit heures.', 'Quand la visite est-elle possible ?', ['Demain à 18 h', 'Aujourd’hui à 18 h', 'Demain à 8 h', 'La semaine prochaine']),
      card(b('Good to know in Québec', 'Bon à savoir au Québec'), b('Most leases run from **1 July to 30 June**: 1 July is moving day. The landlord **cannot ask for a security deposit**; only the first month’s rent may be requested in advance. Disputes go to the **Tribunal administratif du logement**. Rules differ in other provinces.', 'La plupart des baux vont du **1er juillet au 30 juin** : le 1er juillet est le jour des déménagements. Le propriétaire **ne peut pas exiger de dépôt de garantie** ; seul le premier mois de loyer peut être demandé d’avance. Les litiges se règlent au **Tribunal administratif du logement**. Les règles diffèrent dans les autres provinces.'), { variant: 'culture' }),
      pick('A2', b('During the visit, which question is the most useful?', 'Pendant la visite, quelle question est la plus utile ?'), ['Est-ce que l’électricité et internet sont compris dans le loyer ?', 'Vous aimez votre appartement ?', 'Pourquoi le loyer existe ?', 'Est-ce que je suis le loyer ?']),
      pick('A2', b('Choose the right word.', 'Choisissez le bon mot.'), ['signer', 'signe', 'signez', 'signé'], { fr: 'Avant d’emménager, il faut ___ le bail.' }),
      { kind: 'dialogue', title: b('Calling about an ad', 'Appeler pour une annonce'), scene: b('Choose your best replies.', 'Choisissez vos meilleures répliques.'), speakers: [{ name: 'Propriétaire', voice: 'f2', side: 'l' }, { name: 'Vous', voice: 'm', side: 'r' }], lines: [
        { s: 0, fr: 'Allô, bonjour ?', tr: 'Hello?' },
        { s: 1, choose: { options: ['Bonjour, madame. J’appelle au sujet de l’appartement à louer. Est-il encore disponible ?', 'Allô, appartement ?', 'Bonjour, je veux votre maison.'], answer: 0 } },
        { s: 0, fr: 'Oui, il est disponible. Vous voulez le visiter ?', tr: 'Yes, it is available. Would you like to visit it?' },
        { s: 1, choose: { options: ['Oui, avec plaisir. Seriez-vous libre samedi matin ?', 'Oui.', 'Non, je veux signer maintenant.'], answer: 0 } },
        { s: 0, fr: 'Samedi à dix heures, c’est parfait. À samedi !', tr: 'Saturday at ten is perfect. See you Saturday!' },
      ] },
      { kind: 'speak', prompt: b('Say it aloud.', 'Dites-le à voix haute.'), text: 'Est-ce que le chauffage est compris dans le loyer ?', tr: 'Is heating included in the rent?' },
    ],
    notes: {
      points: [
        b('Housing words: le bail, le loyer, le / la propriétaire, le / la locataire, chauffé, meublé.', 'Mots du logement : le bail, le loyer, le / la propriétaire, le / la locataire, chauffé, meublé.'),
        b('Ask what is included: **Est-ce que… est compris dans le loyer ?**', 'Demandez ce qui est inclus : **Est-ce que… est compris dans le loyer ?**'),
        b('Québec: leases often run 1 July – 30 June; no security deposit can be required.', 'Québec : les baux vont souvent du 1er juillet au 30 juin ; aucun dépôt de garantie ne peut être exigé.'),
        b('Always read the lease before you sign: rent, duration, what is included.', 'Lisez toujours le bail avant de signer : loyer, durée, ce qui est inclus.'),
      ],
      vocab: [['emménager', b('to move in', 'entrer dans un nouveau logement')], ['déménager', b('to move out / house', 'changer de logement')], ['disponible', b('available', 'libre')], ['les électros', b('appliances (Québec)', 'réfrigérateur, cuisinière…')], ['le rendez-vous', b('appointment', 'rencontre fixée à l’avance')]],
    },
  },
  {
    id: 'settling-in-canada-2',
    slug: { en: 'papers-and-official-steps', fr: 'les-papiers-et-les-demarches' },
    title: b('Papers and official steps', 'Les papiers et les démarches'),
    summary: b('Social insurance number, health card, driving licence, bank: what to say at the counter.', 'Numéro d’assurance sociale, carte d’assurance maladie, permis de conduire, banque : quoi dire au guichet.'),
    objectives: [b('Name the main documents', 'Nommer les principaux documents'), b('Ask what is needed for an application', 'Demander ce qu’il faut pour une demande'), b('Understand instructions at a counter', 'Comprendre les consignes au guichet')],
    minutes: 14,
    steps: [
      card(b('The first documents', 'Les premiers documents'), b('**le NAS** (numéro d’assurance sociale), needed to work: you apply at **Service Canada**. **La carte d’assurance maladie**: each province has its own (the **RAMQ** in Québec). **Le permis de conduire**: also provincial (the **SAAQ** in Québec). A waiting period may apply for health coverage, depending on your situation.', '**le NAS** (numéro d’assurance sociale), nécessaire pour travailler : on le demande à **Service Canada**. **La carte d’assurance maladie** : chaque province a la sienne (la **RAMQ** au Québec). **Le permis de conduire** : provincial aussi (la **SAAQ** au Québec). Un délai d’attente peut s’appliquer pour l’assurance maladie, selon votre situation.'), { variant: 'culture' }),
      card(b('At the counter', 'Au guichet'), b('Three phrases do most of the work: **Je voudrais faire une demande de…** (I would like to apply for), **Quels documents faut-il apporter ?**, **Combien de temps ça prend ?** You will hear: **Prenez un numéro**, **Remplissez ce formulaire**, **Signez ici**.', 'Trois tournures font l’essentiel : **Je voudrais faire une demande de…**, **Quels documents faut-il apporter ?**, **Combien de temps ça prend ?** Vous entendrez : **Prenez un numéro**, **Remplissez ce formulaire**, **Signez ici**.'), {
        examples: [{ fr: 'Je voudrais faire une demande de carte d’assurance maladie.', tr: 'I would like to apply for a health card.' }, { fr: 'Quels documents faut-il apporter ?', tr: 'Which documents do I need to bring?' }, { fr: 'Remplissez ce formulaire et signez ici.', tr: 'Fill in this form and sign here.' }],
      }),
      listen('A2', 'f2', 'Bonjour. Prenez un numéro et attendez dans la salle. On va vous appeler.', 'Que devez-vous faire ?', ['Prendre un numéro et attendre', 'Revenir demain', 'Remplir un formulaire', 'Payer à la caisse']),
      listen('A2', 'm', 'Pour votre numéro d’assurance sociale, il me faut votre passeport et votre permis de travail.', 'Quels documents faut-il ?', ['Le passeport et le permis de travail', 'Le passeport et le bail', 'Une photo et le permis de conduire', 'Le bail et une facture']),
      pick('A2', b('Which sentence is polite and correct?', 'Quelle phrase est polie et correcte ?'), ['Bonjour, je voudrais faire une demande de permis de conduire.', 'Je veux un permis.', 'Donnez-moi la carte.', 'Bonjour, je faire une demande.']),
      pick('A2', b('Choose the right word.', 'Choisissez le bon mot.'), ['remplir', 'rempli', 'remplis', 'remplissez'], { fr: 'Vous devez ___ ce formulaire en lettres majuscules.' }),
      read('A2', { title: b('Notice', 'Avis'), text: 'Votre carte sera envoyée par la poste à l’adresse indiquée dans votre demande, dans un délai de 4 à 6 semaines. Si vous déménagez, avisez-nous de votre nouvelle adresse.' }, 'Que faut-il faire si vous déménagez ?', ['Donner votre nouvelle adresse', 'Refaire une demande complète', 'Venir chercher la carte au bureau', 'Attendre six semaines de plus']),
      { kind: 'match', prompt: b('Match each instruction with its meaning.', 'Associez chaque consigne à son sens.'), pairs: [['Prenez un numéro.', b('Take a number.', 'Attendez votre tour.')], ['Remplissez le formulaire.', b('Fill in the form.', 'Écrivez vos informations.')], ['Signez ici.', b('Sign here.', 'Mettez votre signature.')], ['Une pièce d’identité', b('A piece of ID', 'Passeport, permis…')], ['Une preuve d’adresse', b('A proof of address', 'Bail, facture…')]] },
      { kind: 'speak', prompt: b('Say it aloud.', 'Dites-le à voix haute.'), text: 'Quels documents faut-il apporter, s’il vous plaît ?', tr: 'Which documents do I need to bring, please?' },
    ],
    notes: {
      points: [
        b('NAS: to work (Service Canada). Health card and driving licence: provincial.', 'NAS : pour travailler (Service Canada). Carte d’assurance maladie et permis : provinciaux.'),
        b('**Je voudrais faire une demande de…** + document.', '**Je voudrais faire une demande de…** + document.'),
        b('Ask: Quels documents faut-il apporter ? Combien de temps ça prend ?', 'Demandez : Quels documents faut-il apporter ? Combien de temps ça prend ?'),
        b('Counter instructions: prenez un numéro, remplissez, signez, patientez.', 'Consignes au guichet : prenez un numéro, remplissez, signez, patientez.'),
      ],
      vocab: [['la demande', b('application', 'formulaire pour obtenir quelque chose')], ['le formulaire', b('form', 'document à remplir')], ['le délai', b('waiting time', 'temps d’attente')], ['aviser', b('to notify', 'informer')], ['le permis de travail', b('work permit', 'autorisation de travailler')]],
    },
  },
  {
    id: 'settling-in-canada-3',
    slug: { en: 'health-school-and-daycare', fr: 'sante-ecole-et-garderie' },
    title: b('Health, school and daycare', 'La santé, l’école et la garderie'),
    summary: b('Find a doctor, use walk-in clinics, enrol a child at school and talk to the daycare.', 'Trouver un médecin, utiliser les cliniques sans rendez-vous, inscrire un enfant à l’école et parler à la garderie.'),
    objectives: [b('Know where to go for health care', 'Savoir où aller pour se faire soigner'), b('Enrol a child at school', 'Inscrire un enfant à l’école'), b('Understand messages from school and daycare', 'Comprendre les messages de l’école et de la garderie')],
    minutes: 14,
    steps: [
      card(b('Where to go when you are ill', 'Où aller quand on est malade'), b('**Le médecin de famille** follows you over time (there is often a waiting list). **La clinique sans rendez-vous** takes you the same day. **Les urgences** are for serious cases. In Québec, **le 811 (Info-Santé)** gives advice by phone, day and night. Emergency: **911**.', '**Le médecin de famille** vous suit dans le temps (il y a souvent une liste d’attente). **La clinique sans rendez-vous** vous reçoit le jour même. **Les urgences** sont pour les cas graves. Au Québec, **le 811 (Info-Santé)** donne des conseils par téléphone, jour et nuit. Urgence : **911**.'), { variant: 'culture' }),
      pick('A2', b('Your child has a light fever on a Saturday. Where do you call first in Québec?', 'Votre enfant a une légère fièvre un samedi. Qui appelez-vous d’abord au Québec ?'), [b('811 (Info-Santé)', 'Le 811 (Info-Santé)'), b('911', 'Le 911'), b('The school', 'L’école'), b('The bank', 'La banque')]),
      listen('A2', 'f', 'Clinique du Parc, bonjour. Aujourd’hui, nous sommes complets. Vous pouvez venir demain matin dès huit heures, sans rendez-vous.', 'Que propose la clinique ?', ['De venir demain matin sans rendez-vous', 'De venir aujourd’hui à huit heures', 'D’aller aux urgences', 'De rappeler la semaine prochaine']),
      card(b('School and daycare', 'L’école et la garderie'), b('**inscrire un enfant** (to enrol), **la garderie / le CPE** (daycare, Québec), **la maternelle** (kindergarten), **le primaire**, **le secondaire**, **le service de garde** (before and after school), **la boîte à lunch**, **une journée pédagogique** (no school for pupils).', '**inscrire un enfant**, **la garderie / le CPE** (Québec), **la maternelle**, **le primaire**, **le secondaire**, **le service de garde** (avant et après l’école), **la boîte à lunch**, **une journée pédagogique** (pas de classe pour les élèves).'), {
        examples: [{ fr: 'Je voudrais inscrire ma fille à l’école.', tr: 'I would like to enrol my daughter at school.' }, { fr: 'Vendredi, c’est une journée pédagogique.', tr: 'Friday is a teacher training day (no school).' }],
      }),
      read('A2', { title: b('Message from the school', 'Message de l’école'), text: 'Chers parents,\nVendredi 14 novembre sera une journée pédagogique : il n’y aura pas de classe. Le service de garde sera ouvert de 7 h à 18 h pour les enfants inscrits.\nLa direction' }, 'Que se passe-t-il vendredi ?', ['Il n’y a pas de classe, mais le service de garde est ouvert', 'L’école est fermée toute la journée pour tous', 'Les parents doivent venir à l’école', 'Les cours finissent à 18 h']),
      listen('A2', 'f2', 'Bonjour, c’est la garderie. Votre fils a un peu de fièvre. Pouvez-vous venir le chercher avant midi ?', 'Que demande la garderie ?', ['De venir chercher l’enfant avant midi', 'D’apporter un médicament', 'De rappeler après midi', 'De garder l’enfant demain']),
      pick('A2', b('Choose the right word.', 'Choisissez le bon mot.'), ['inscrire', 'écrire', 'décrire', 'souscrire'], { fr: 'Je voudrais ___ mon fils à la maternelle.' }),
      { kind: 'dialogue', title: b('Enrolling at school', 'L’inscription à l’école'), scene: b('Choose your best replies.', 'Choisissez vos meilleures répliques.'), speakers: [{ name: 'Secrétaire', voice: 'f', side: 'l' }, { name: 'Vous', voice: 'm', side: 'r' }], lines: [
        { s: 0, fr: 'Bonjour, je peux vous aider ?', tr: 'Hello, can I help you?' },
        { s: 1, choose: { options: ['Bonjour. Je voudrais inscrire ma fille. Elle a six ans.', 'Ma fille, école.', 'Bonjour. Je voudrais écrire ma fille.'], answer: 0 } },
        { s: 0, fr: 'Très bien. Il me faut son certificat de naissance et une preuve d’adresse.', tr: 'Very good. I need her birth certificate and a proof of address.' },
        { s: 1, choose: { options: ['Voici le certificat de naissance et notre bail.', 'Je n’ai pas d’adresse.', 'Voici ma fille.'], answer: 0 } },
        { s: 0, fr: 'Parfait. Elle pourra commencer lundi.', tr: 'Perfect. She can start on Monday.' },
      ] },
      { kind: 'speak', prompt: b('Say it aloud.', 'Dites-le à voix haute.'), text: 'Je voudrais inscrire ma fille à l’école.', tr: 'I would like to enrol my daughter at school.' },
    ],
    notes: {
      points: [
        b('Health: médecin de famille, clinique sans rendez-vous, urgences; 811 for advice (Québec), 911 for emergencies.', 'Santé : médecin de famille, clinique sans rendez-vous, urgences ; 811 pour un conseil (Québec), 911 pour une urgence.'),
        b('**Inscrire un enfant**: birth certificate and proof of address are usually required.', '**Inscrire un enfant** : on demande en général le certificat de naissance et une preuve d’adresse.'),
        b('School words: maternelle, primaire, secondaire, service de garde, journée pédagogique.', 'Mots de l’école : maternelle, primaire, secondaire, service de garde, journée pédagogique.'),
        b('“Venir chercher” = to pick someone up.', '« Venir chercher » = aller récupérer quelqu’un.'),
      ],
      vocab: [['la clinique sans rendez-vous', b('walk-in clinic', 'on y va sans réserver')], ['les urgences', b('emergency room', 'service des cas graves')], ['la garderie', b('daycare', 'lieu qui garde les jeunes enfants')], ['le certificat de naissance', b('birth certificate', 'document officiel de la naissance')], ['complet', b('full', 'il n’y a plus de place')]],
    },
  },
];

export default lessons;
