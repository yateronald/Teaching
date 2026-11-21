import type { CourseAbout } from '../../types';
import { b, card, dict, dlg, doc, hear, lesson, mc, ord, P, say, sort, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'The phone is the hardest place to speak a foreign language: no gestures, no lips to read, and often background noise. This course gives you the professional phone routines in French: answering in a company’s name, identifying the caller, transferring or putting on hold, taking a precise message (names, numbers, spelling), calling back and leaving a clear voicemail.',
    'Le téléphone est l’endroit le plus difficile pour parler une langue étrangère : pas de gestes, pas de lèvres à lire, et souvent du bruit. Ce cours vous donne les routines téléphoniques professionnelles en français : répondre au nom de l’entreprise, identifier l’interlocuteur, transférer ou mettre en attente, prendre un message précis (noms, numéros, épellation), rappeler et laisser un message vocal clair.',
  ),
  outcomes: [
    b('Answer professionally', 'Répondre de façon professionnelle'),
    b('Transfer a call or put it on hold', 'Transférer un appel ou le mettre en attente'),
    b('Take an accurate message', 'Prendre un message exact'),
    b('Leave a clear voicemail', 'Laisser un message vocal clair'),
  ],
};

const C = 'bz-phone';
export default [
  lesson(C, 1, ['answering-and-transferring', 'repondre-et-transferer'],
    b('Answering and transferring', 'Répondre et transférer'),
    b('Answer in the company’s name, identify the caller and transfer the call.', 'Répondre au nom de l’entreprise, identifier l’interlocuteur et transférer l’appel.'),
    [b('Answer in a professional way', 'Répondre professionnellement'), b('Ask who is calling', 'Demander qui appelle'), b('Transfer or put on hold', 'Transférer ou mettre en attente')],
    13,
    [
      card(b('Phone routines', 'Les routines téléphoniques'), b('**Société Durand, bonjour, Léa à l’appareil. · C’est de la part de qui ? · Pouvez-vous me rappeler votre nom ? · Ne quittez pas, je vous le passe. · Je vous mets en attente un instant. · Sa ligne est occupée, vous patientez ou vous préférez laisser un message ?**', '**Société Durand, bonjour, Léa à l’appareil. · C’est de la part de qui ? · Pouvez-vous me rappeler votre nom ? · Ne quittez pas, je vous le passe. · Je vous mets en attente un instant. · Sa ligne est occupée, vous patientez ou vous préférez laisser un message ?**')),
      dlg(b('An incoming call', 'Un appel entrant'), undefined, [['Vous', 'f'], ['Appelant', 'm']], [
        [0, { options: ['Agence Horizon, bonjour, Nadia à l’appareil.', 'Allô ? Qui c’est ?', 'Oui ?'] }],
        [1, 'Bonjour, je voudrais parler à monsieur Girard, s’il vous plaît.', 'Hello, I’d like to speak to Mr Girard, please.'],
        [0, { options: ['C’est de la part de qui ?', 'Pourquoi ?', 'Il n’est pas là, au revoir.'] }],
        [1, 'Thomas Leduc, de la société Bati-Plus.', 'Thomas Leduc, from Bati-Plus.'],
        [0, { options: ['Ne quittez pas, monsieur Leduc, je vous le passe.', 'Attendez.', 'Je ne connais pas.'] }],
      ], true),
      mc(P.meaning, [b('Please hold, don’t hang up.', 'Restez en ligne, ne raccrochez pas.'), b('Don’t leave the building.', 'Ne quittez pas le bâtiment.'), b('Don’t leave me.', 'Ne me quittez pas.'), b('Call back later.', 'Rappelez plus tard.')], { fr: '« Ne quittez pas. »' }),
      sort(b('Receptionist or caller?', 'Standardiste ou appelant ?'), [b('receptionist', 'standardiste'), b('caller', 'appelant')], [['C’est de la part de qui ?', 0], ['Je voudrais parler à madame Roy.', 1], ['Ne quittez pas.', 0], ['Pourriez-vous me passer le service comptable ?', 1], ['Sa ligne est occupée.', 0], ['Je rappellerai plus tard.', 1]]),
      say('Société Durand, bonjour, Léa à l’appareil. Ne quittez pas, je vous le passe.', 'Durand company, hello, Léa speaking. Please hold, I’ll put you through.'),
    ],
    [
      b('Answer: Nom de l’entreprise, bonjour, [prénom] à l’appareil.', 'Répondre : Nom de l’entreprise, bonjour, [prénom] à l’appareil.'),
      b('C’est de la part de qui ? · Ne quittez pas, je vous le passe.', 'C’est de la part de qui ? · Ne quittez pas, je vous le passe.'),
      b('Busy line: Vous patientez ou vous laissez un message ?', 'Ligne occupée : Vous patientez ou vous laissez un message ?'),
    ],
    [['à l’appareil', b('speaking (on the phone)', 'qui parle au téléphone')], ['une ligne occupée', b('a busy line', 'déjà en communication')], ['patienter', b('to hold, to wait', 'attendre')]],
  ),
  lesson(C, 2, ['taking-a-message', 'prendre-un-message'],
    b('Taking a message', 'Prendre un message'),
    b('Write down name, company, number and reason, and check by spelling and repeating.', 'Noter nom, société, numéro et motif, et vérifier en épelant et en répétant.'),
    [b('Ask for the details', 'Demander les informations'), b('Spell names', 'Épeler les noms'), b('Read back numbers', 'Relire les numéros')],
    13,
    [
      card(b('A complete message', 'Un message complet'), b('**Souhaitez-vous laisser un message ? · Pouvez-vous épeler votre nom ? · Quel est votre numéro ? · C’est à quel sujet ? · Je répète : 06 12 45 78 90. · Je lui transmets votre message dès son retour.** To spell: **D comme Denise, U comme Ursule** or simply **D, U, R…**', '**Souhaitez-vous laisser un message ? · Pouvez-vous épeler votre nom ? · Quel est votre numéro ? · C’est à quel sujet ? · Je répète : 06 12 45 78 90. · Je lui transmets votre message dès son retour.** Pour épeler : **D comme Denise, U comme Ursule** ou simplement **D, U, R…**')),
      hear('Oui, c’est Hélène Kowalski, du cabinet Lumière. Mon numéro, c’est le 01 43 27 88 15. C’est au sujet de la réunion de jeudi, qui doit être déplacée.', b('Why is she calling?', 'Pourquoi appelle-t-elle ?'), [b('Thursday’s meeting must be moved', 'la réunion de jeudi doit être déplacée'), b('to order a product', 'pour commander un produit'), b('to cancel a contract', 'pour annuler un contrat'), b('to ask for a job', 'pour demander un emploi')], { voice: 'f' }),
      hear('Mon numéro, c’est le 01 43 27 88 15.', b('Which number?', 'Quel numéro ?'), [b('01 43 27 88 15', '01 43 27 88 15'), b('01 43 27 98 15', '01 43 27 98 15'), b('01 34 27 88 15', '01 34 27 88 15'), b('01 43 37 88 50', '01 43 37 88 50')], { voice: 'f' }),
      doc({ look: 'label', title: b('Phone message', 'Message téléphonique'), text: 'Pour : M. Girard\nDe : Hélène Kowalski — Cabinet Lumière\nTél. : 01 43 27 88 15\nObjet : réunion de jeudi à déplacer\nÀ rappeler : avant 17 h\nPris par : Nadia, 10 h 40' }, b('What must Mr Girard do?', 'Que doit faire M. Girard ?'), [b('call her back before 5 p.m.', 'la rappeler avant 17 h'), b('go to the meeting on Thursday', 'aller à la réunion jeudi'), b('send an email', 'envoyer un courriel'), b('nothing', 'rien')]),
      dict('Pouvez-vous épeler votre nom, s’il vous plaît ? Je lui transmets votre message dès son retour.', { hint: b('A message-taking routine.', 'Une routine de prise de message.') }),
      say('Souhaitez-vous laisser un message ? Pouvez-vous épeler votre nom et me donner votre numéro ?', 'Would you like to leave a message? Can you spell your name and give me your number?'),
    ],
    [
      b('Take: nom, société, numéro, objet, heure de rappel.', 'Noter : nom, société, numéro, objet, heure de rappel.'),
      b('Check: Pouvez-vous épeler ? Je répète…', 'Vérifier : Pouvez-vous épeler ? Je répète…'),
      b('Close: Je lui transmets votre message.', 'Conclure : Je lui transmets votre message.'),
    ],
    [['épeler', b('to spell', 'dire lettre par lettre')], ['un cabinet', b('a firm (law, consulting)', 'bureau professionnel')], ['transmettre', b('to pass on', 'faire passer')]],
  ),
  lesson(C, 3, ['calling-and-voicemail', 'appeler-et-messagerie'],
    b('Making calls and leaving voicemails', 'Passer des appels et laisser un message vocal'),
    b('Introduce yourself, state the reason, and leave a short clear voicemail.', 'Se présenter, annoncer le motif et laisser un message vocal court et clair.'),
    [b('Open an outgoing call', 'Ouvrir un appel sortant'), b('State the reason briefly', 'Annoncer brièvement le motif'), b('Leave a structured voicemail', 'Laisser un message vocal structuré')],
    13,
    [
      card(b('Calling and voicemail', 'Appeler et laisser un message'), b('Call: **Bonjour, Paul Mensah, de la société Ecoflux. Je vous appelle au sujet de votre commande. Vous avez deux minutes ?** Voicemail in 4 steps: **who** (Bonjour, c’est Paul Mensah, d’Ecoflux) · **why** (je vous appelle au sujet de…) · **what next** (pourriez-vous me rappeler…) · **number, twice, slowly** (au 06… je répète…).', 'Appeler : **Bonjour, Paul Mensah, de la société Ecoflux. Je vous appelle au sujet de votre commande. Vous avez deux minutes ?** Message vocal en 4 étapes : **qui** (Bonjour, c’est Paul Mensah, d’Ecoflux) · **pourquoi** (je vous appelle au sujet de…) · **suite** (pourriez-vous me rappeler…) · **numéro, deux fois, lentement** (au 06… je répète…).')),
      mc(P.best, ['Bonjour, c’est Paul Mensah, d’Ecoflux. Je vous appelle au sujet de la livraison de lundi. Pourriez-vous me rappeler au 06 22 18 45 90 ? Je répète : 06 22 18 45 90. Merci, bonne journée.', 'Salut, c’est moi, rappelle-moi.', 'Bonjour… euh… je rappellerai… ou pas… au revoir.', 'C’est Paul. Livraison. Rappelez.'], { fr: 'Quel message vocal est le plus professionnel ?' }),
      ord(P.order, 'Je vous appelle au sujet de votre commande du douze mars.', { tr: 'I’m calling about your order of 12 March.' }),
      hear('Bonjour, ici Claire Fontaine, de la mairie de Gatineau. Je vous appelle au sujet de votre demande de permis. Il manque un document. Pourriez-vous me rappeler au 819 555 0147 ? Je répète : 819 555 0147. Merci et bonne journée.', b('What is the problem?', 'Quel est le problème ?'), [b('a document is missing from the permit application', 'il manque un document à la demande de permis'), b('the permit is refused', 'le permis est refusé'), b('the office is closed', 'le bureau est fermé'), b('the fee is unpaid', 'les frais ne sont pas payés')], { voice: 'f' }),
      write(b('Your voicemail', 'Votre message vocal'), b('Write a voicemail (35–60 words) to a supplier: you are calling about a late delivery; ask them to call you back today and give your number twice.', 'Rédigez un message vocal (35–60 mots) pour un fournisseur : vous appelez au sujet d’une livraison en retard ; demandez-lui de vous rappeler aujourd’hui et donnez votre numéro deux fois.'), 35, 60, [
        b('Who you are and your company', 'Qui vous êtes et votre entreprise'),
        b('Reason for the call', 'Motif de l’appel'),
        b('Request to call back + number twice', 'Demande de rappel + numéro deux fois'),
      ], 'Bonjour, c’est Inès Haddad, de la boutique Verte Saison. Je vous appelle au sujet de notre commande du 3 avril, qui n’est toujours pas arrivée. Pourriez-vous me rappeler aujourd’hui au 06 41 27 83 09 ? Je répète : 06 41 27 83 09. Merci d’avance, bonne journée.'),
    ],
    [
      b('Open: Bonjour, [nom], de [société]. Je vous appelle au sujet de…', 'Ouvrir : Bonjour, [nom], de [société]. Je vous appelle au sujet de…'),
      b('Voicemail: qui, pourquoi, suite, numéro deux fois.', 'Message vocal : qui, pourquoi, suite, numéro deux fois.'),
      b('Speak slowly when giving numbers.', 'Parlez lentement en donnant les numéros.'),
    ],
    [['un fournisseur', b('a supplier', 'entreprise qui fournit')], ['la mairie', b('the town hall', 'administration de la ville')], ['un permis', b('a permit', 'autorisation officielle')]],
  ),
];
