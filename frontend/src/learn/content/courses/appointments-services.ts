import { b, type Lesson } from '../../types';
import { card, pick } from '../kit';

const lessons: Lesson[] = [
  {
    id: 'appointments-services-1',
    slug: { en: 'on-the-phone', fr: 'au-telephone' },
    title: b('On the phone', 'Au téléphone'),
    summary: b('Answer and make a phone call, ask for someone and leave a message.', 'Répondre et passer un appel, demander quelqu’un et laisser un message.'),
    objectives: [b('Use the phone formulas', 'Employer les formules du téléphone'), b('Ask for someone and say who is calling', 'Demander quelqu’un et dire qui appelle'), b('Leave a simple message', 'Laisser un message simple')],
    minutes: 12,
    steps: [
      card(b('Phone formulas', 'Les formules du téléphone'), b('**Allô ?** (only on the phone). **C’est de la part de qui ?** (Who’s calling?). **Ne quittez pas** (Hold on). **Il / Elle n’est pas là.** **Vous voulez laisser un message ?** **Je peux parler à… ?** **Je rappellerai plus tard.**', '**Allô ?** (seulement au téléphone). **C’est de la part de qui ?** **Ne quittez pas.** **Il / Elle n’est pas là.** **Vous voulez laisser un message ?** **Je peux parler à… ?** **Je rappellerai plus tard.**'), {
        examples: [{ fr: 'Allô, bonjour. Je peux parler à Madame Dubois, s’il vous plaît ?', tr: 'Hello. May I speak to Ms Dubois, please?' }, { fr: 'C’est de la part de qui ?', tr: 'Who’s calling?' }, { fr: 'Ne quittez pas, je vous la passe.', tr: 'Hold on, I’ll put you through to her.' }],
      }),
      { kind: 'match', prompt: b('Match each formula with its meaning.', 'Associez chaque formule à son sens.'), pairs: [['Ne quittez pas.', 'Hold on.'], ['C’est de la part de qui ?', 'Who’s calling?'], ['Je vous la passe.', 'I’ll put you through to her.'], ['Elle n’est pas là.', 'She’s not here.'], ['Je rappellerai.', 'I’ll call back.']] },
      { kind: 'dialogue', title: b('A phone call', 'Un appel'), scene: b('Choose the caller’s best reply.', 'Choisissez la meilleure réponse.'), speakers: [{ name: 'Secrétaire', voice: 'f2', side: 'l' }, { name: 'Vous', voice: 'm', side: 'r' }], lines: [
        { s: 0, fr: 'Cabinet Martin, bonjour !', tr: 'Martin office, hello!' },
        { s: 1, choose: { options: ['Bonjour, je peux parler à Monsieur Martin, s’il vous plaît ?', 'Allô, Martin ?', 'Martin, oui ?'], answer: 0 } },
        { s: 0, fr: 'C’est de la part de qui ?', tr: 'Who’s calling?' },
        { s: 1, choose: { options: ['De la part de Samuel Okoye.', 'C’est une part.', 'Oui, c’est moi.'], answer: 0 } },
        { s: 0, fr: 'Désolée, il est en réunion. Vous voulez laisser un message ?', tr: 'Sorry, he’s in a meeting. Would you like to leave a message?' },
        { s: 1, choose: { options: ['Oui, pouvez-vous lui dire de me rappeler au 514 555 0123 ?', 'Non, au revoir.', 'Un message ? Quoi ?'], answer: 0 } },
      ] },
      pick('A2', b('The person is not available. You say:', 'La personne n’est pas disponible. Vous dites :'), ['Je rappellerai plus tard, merci.', 'Ne quittez pas.', 'C’est de la part de qui ?', 'Je vous la passe.']),
      pick('A2', b('“Allô” is used…', '« Allô » s’emploie…'), [b('only on the phone', 'seulement au téléphone'), b('in the street', 'dans la rue'), b('in a letter', 'dans une lettre'), b('to say goodbye', 'pour dire au revoir')]),
      pick('A2', b('Choose the right word.', 'Choisissez le bon mot.'), ['lui', 'le', 'la', 'leur'], { fr: 'Pouvez-vous ___ dire de me rappeler ? (à Monsieur Martin)' }),
      { kind: 'speak', prompt: b('Say it aloud.', 'Dites-le à voix haute.'), text: 'Bonjour, je peux parler à Madame Dubois, s’il vous plaît ?', tr: 'Hello, may I speak to Ms Dubois, please?' },
    ],
    notes: {
      points: [
        b('Allô ? is only used on the phone.', 'Allô ? s’emploie seulement au téléphone.'),
        b('Je peux parler à… ? C’est de la part de qui ? Ne quittez pas.', 'Je peux parler à… ? C’est de la part de qui ? Ne quittez pas.'),
        b('Message: Pouvez-vous lui dire de me rappeler au… ?', 'Message : Pouvez-vous lui dire de me rappeler au… ?'),
        b('Numbers by pairs in France (06 45…); by groups in Canada (514 555 0123).', 'Numéros par deux en France (06 45…) ; par groupes au Canada (514 555 0123).'),
      ],
      vocab: [['le cabinet', b('office (doctor, lawyer)', 'bureau professionnel')], ['la réunion', b('meeting', 'rencontre de travail')], ['rappeler', b('to call back', 'téléphoner de nouveau')], ['laisser un message', b('to leave a message', 'enregistrer un message')]],
    },
  },
  {
    id: 'appointments-services-2',
    slug: { en: 'making-an-appointment', fr: 'prendre-rendez-vous' },
    title: b('Making an appointment', 'Prendre rendez-vous'),
    summary: b('Make, change and cancel an appointment: suggest a day, accept a time, confirm.', 'Prendre, déplacer et annuler un rendez-vous : proposer un jour, accepter une heure, confirmer.'),
    objectives: [b('Ask for an appointment', 'Demander un rendez-vous'), b('Suggest and accept a time', 'Proposer et accepter un horaire'), b('Move or cancel an appointment', 'Déplacer ou annuler un rendez-vous')],
    minutes: 13,
    steps: [
      card(b('The appointment phrases', 'Les tournures du rendez-vous'), b('**Je voudrais prendre rendez-vous.** **Vous êtes disponible quand ?** **Mardi à 10 h, ça vous convient ?** **C’est parfait.** To change: **Je dois déplacer / reporter mon rendez-vous.** To cancel: **Je dois annuler mon rendez-vous.**', '**Je voudrais prendre rendez-vous.** **Vous êtes disponible quand ?** **Mardi à 10 h, ça vous convient ?** **C’est parfait.** Changer : **Je dois déplacer / reporter mon rendez-vous.** Annuler : **Je dois annuler mon rendez-vous.**'), {
        examples: [{ fr: 'Je voudrais prendre rendez-vous pour une coupe de cheveux.', tr: 'I’d like to book a haircut.' }, { fr: 'Jeudi à quinze heures, ça vous convient ?', tr: 'Does Thursday at 3 p.m. suit you?' }, { fr: 'Je suis désolé, je dois annuler mon rendez-vous de demain.', tr: 'I’m sorry, I have to cancel my appointment tomorrow.' }],
      }),
      pick('A2', b('“Ça vous convient ?” means…', '« Ça vous convient ? » signifie…'), [b('Does that suit you?', 'C’est bon pour vous ?'), b('Are you coming?', 'Vous venez ?'), b('Is it expensive?', 'C’est cher ?'), b('Do you agree to pay?', 'Vous payez ?')]),
      pick('A2', b('You cannot come anymore. You say:', 'Vous ne pouvez plus venir. Vous dites :'), ['Je dois annuler mon rendez-vous.', 'Je dois prendre mon rendez-vous.', 'Je dois confirmer mon rendez-vous.', 'Je dois convenir mon rendez-vous.']),
      pick('A2', b('Choose the right word.', 'Choisissez le bon mot.'), ['à', 'en', 'pour', 'dans'], { fr: 'Mon rendez-vous est jeudi ___ 15 h.' }),
      { kind: 'mcq', prompt: b('Listen. When is the new appointment?', 'Écoutez. Quand est le nouveau rendez-vous ?'), audio: 'Bonjour, c’est le salon de coiffure. Nous devons déplacer votre rendez-vous de mardi. Est-ce que jeudi à onze heures vous conviendrait ?', listen: true, voice: 'f2', options: [b('Thursday at 11', 'Jeudi à 11 h'), b('Tuesday at 11', 'Mardi à 11 h'), b('Thursday at 7', 'Jeudi à 7 h'), b('Tuesday at 1', 'Mardi à 13 h')], answer: 0 },
      { kind: 'fill', prompt: b('Complete.', 'Complétez.'), text: 'Je voudrais ___ rendez-vous avec le dentiste. Mercredi matin, ça vous ___ ?', answers: [['prendre'], ['convient', 'va']] },
      { kind: 'speak', prompt: b('Say it aloud.', 'Dites-le à voix haute.'), text: 'Je voudrais prendre rendez-vous. Jeudi à quinze heures, ça vous convient ?', tr: 'I’d like to book an appointment. Does Thursday at 3 p.m. suit you?' },
    ],
    notes: {
      points: [
        b('Prendre rendez-vous (avec / chez quelqu’un).', 'Prendre rendez-vous (avec / chez quelqu’un).'),
        b('Propose: Mardi à 10 h, ça vous convient / ça vous va ?', 'Proposer : Mardi à 10 h, ça vous convient / ça vous va ?'),
        b('Change: déplacer / reporter. Cancel: annuler. Confirm: confirmer.', 'Changer : déplacer / reporter. Annuler. Confirmer.'),
        b('Times: à 15 h, le matin, l’après-midi, en fin de journée.', 'Horaires : à 15 h, le matin, l’après-midi, en fin de journée.'),
      ],
      vocab: [['convenir', b('to suit', 'être pratique pour')], ['annuler', b('to cancel', 'supprimer')], ['déplacer', b('to move', 'changer de moment')], ['le salon de coiffure', b('hair salon', 'chez le coiffeur')]],
    },
  },
  {
    id: 'appointments-services-3',
    slug: { en: 'bank-and-post-office', fr: 'banque-et-bureau-de-poste' },
    title: b('At the bank and the post office', 'À la banque et au bureau de poste'),
    summary: b('Open an account, withdraw money, send a parcel and understand the questions of the staff.', 'Ouvrir un compte, retirer de l’argent, envoyer un colis et comprendre les questions du personnel.'),
    objectives: [b('Handle basic banking requests', 'Faire des démarches bancaires simples'), b('Send a letter or parcel', 'Envoyer une lettre ou un colis'), b('Understand which documents are needed', 'Comprendre quels documents sont demandés')],
    minutes: 13,
    steps: [
      card(b('At the bank', 'À la banque'), b('**ouvrir un compte** (open an account), **déposer / retirer de l’argent** (deposit / withdraw), **une carte de débit / de crédit**, **le guichet automatique** (ATM, Québec) / **le distributeur** (France), **une pièce d’identité**, **un justificatif de domicile** (proof of address).', '**ouvrir un compte**, **déposer / retirer de l’argent**, **une carte de débit / de crédit**, **le guichet automatique** (Québec) / **le distributeur** (France), **une pièce d’identité**, **un justificatif de domicile**.'), {
        examples: [{ fr: 'Je voudrais ouvrir un compte, s’il vous plaît.', tr: 'I’d like to open an account, please.' }, { fr: 'Vous avez une pièce d’identité et un justificatif de domicile ?', tr: 'Do you have ID and proof of address?' }],
      }),
      card(b('At the post office', 'Au bureau de poste'), b('**envoyer** une lettre / un colis, **un timbre** (stamp), **une enveloppe**, **en recommandé** (registered), **le tarif** (rate), **le délai de livraison** (delivery time). **Ça arrivera quand ?**', '**envoyer** une lettre / un colis, **un timbre**, **une enveloppe**, **en recommandé**, **le tarif**, **le délai de livraison**. **Ça arrivera quand ?**'), {
        examples: [{ fr: 'Je voudrais envoyer ce colis au Sénégal.', tr: 'I’d like to send this parcel to Senegal.' }, { fr: 'Ça arrivera dans combien de jours ?', tr: 'How many days will it take to arrive?' }],
      }),
      pick('A2', b('To take money from your account, you…', 'Pour prendre de l’argent sur votre compte, vous…'), ['retirez de l’argent', 'déposez de l’argent', 'ouvrez un compte', 'envoyez un colis']),
      pick('A2', b('What is “un timbre”?', 'Qu’est-ce qu’« un timbre » ?'), [b('a stamp', 'ce qu’on colle sur une lettre'), b('a parcel', 'un paquet'), b('a bank card', 'une carte bancaire'), b('an envelope', 'une enveloppe')]),
      pick('A2', b('The bank asks for “un justificatif de domicile”. You bring…', 'La banque demande « un justificatif de domicile ». Vous apportez…'), [b('a bill or lease with your address', 'une facture ou un bail à votre adresse'), b('your passport only', 'seulement votre passeport'), b('a photo', 'une photo'), b('your work contract', 'votre contrat de travail')]),
      { kind: 'match', prompt: b('Match each word with its meaning.', 'Associez chaque mot à son sens.'), pairs: [['le guichet automatique', b('ATM', 'machine à billets')], ['en recommandé', b('registered mail', 'envoi avec preuve')], ['déposer', b('to deposit', 'mettre de l’argent sur le compte')], ['le tarif', b('the rate, price', 'le prix')], ['la pièce d’identité', b('ID', 'passeport, carte')]] },
      { kind: 'speak', prompt: b('Say it aloud.', 'Dites-le à voix haute.'), text: 'Bonjour, je voudrais envoyer ce colis au Sénégal. Ça arrivera quand ?', tr: 'Hello, I’d like to send this parcel to Senegal. When will it arrive?' },
    ],
    notes: {
      points: [
        b('Bank: ouvrir un compte, déposer / retirer de l’argent, une carte de débit.', 'Banque : ouvrir un compte, déposer / retirer de l’argent, une carte de débit.'),
        b('Documents: une pièce d’identité, un justificatif de domicile.', 'Documents : une pièce d’identité, un justificatif de domicile.'),
        b('Post: envoyer une lettre / un colis, un timbre, en recommandé.', 'Poste : envoyer une lettre / un colis, un timbre, en recommandé.'),
        b('Québec: guichet automatique; France: distributeur (de billets).', 'Québec : guichet automatique ; France : distributeur (de billets).'),
      ],
      vocab: [['le compte', b('account', 'compte bancaire')], ['le timbre', b('stamp', 'pour affranchir une lettre')], ['le colis', b('parcel', 'paquet')], ['le domicile', b('home address', 'lieu où l’on habite')]],
    },
  },
];

export default lessons;
