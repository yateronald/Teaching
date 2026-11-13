// Le français au téléphone (A2 → B1): calls are only heard, as in real life.
// The dialogues use the phone-call mode (the text appears at the end), with
// the formulas to answer, spell, give a number, book an appointment and leave
// a voicemail.
import { b, type DialogueStep, type Lesson, type McqStep, type T, type Voice } from '../../types';
import { card } from '../kit';

const hear = (voice: Voice, audio: string, prompt: T, options: T[], explain?: T): McqStep =>
  ({ kind: 'mcq', voice, audio, listen: true, prompt, options, answer: 0, ...(explain ? { explain } : {}) });

type Speaker = DialogueStep['speakers'][number];
const ME: Speaker = { name: 'Vous', voice: 'm', side: 'r' };

const lessons: Lesson[] = [
  {
    id: 'phone-french-1',
    slug: { en: 'answering-spelling-and-numbers', fr: 'repondre-epeler-et-numeros' },
    title: b('Answering, spelling and phone numbers', 'Répondre, épeler et donner un numéro'),
    summary: b('The formulas of every call, how to spell your name and how phone numbers are said in Canada and in France.', 'Les formules de chaque appel, comment épeler son nom et comment se disent les numéros au Canada et en France.'),
    objectives: [b('Use the key phone formulas', 'Utiliser les formules clés du téléphone'), b('Spell your name and understand spelling', 'Épeler son nom et comprendre une épellation'), b('Understand a phone number', 'Comprendre un numéro de téléphone')],
    minutes: 13,
    steps: [
      card(b('Why the phone is hard', 'Pourquoi le téléphone est difficile'), b('On the phone you lose the face, the gestures and the context: only the voice is left, often fast and with noise. The solution is to know the **fixed formulas** by heart, and to dare to say **“Pardon ?”** or **“Pouvez-vous répéter ?”**: nobody minds.', 'Au téléphone, on perd le visage, les gestes et le contexte : il ne reste que la voix, souvent rapide et avec du bruit. La solution : connaître par cœur les **formules fixes** et oser dire **« Pardon ? »** ou **« Pouvez-vous répéter ? »** : personne ne vous en voudra.')),
      { kind: 'flashcards', title: b('The formulas of every call', 'Les formules de chaque appel'), cards: [
        { fr: 'Allô ?', tr: b('Hello? (on the phone only)', 'pour répondre au téléphone') },
        { fr: 'Qui est à l’appareil ?', tr: b('Who is calling?', 'qui parle ?') },
        { fr: 'C’est de la part de qui ?', tr: b('Who shall I say is calling?', 'qui dois-je annoncer ?') },
        { fr: 'Ne quittez pas.', tr: b('Hold the line.', 'restez au téléphone') },
        { fr: 'Je vous la passe.', tr: b('I’ll put you through to her.', 'je vous mets en communication avec elle') },
        { fr: 'Elle est en ligne.', tr: b('She is on another call.', 'elle parle déjà au téléphone') },
        { fr: 'Je vous entends mal.', tr: b('I can’t hear you well.', 'la communication est mauvaise') },
        { fr: 'Pourriez-vous parler plus lentement ?', tr: b('Could you speak more slowly?', 'moins vite, s’il vous plaît') },
      ] },
      {
        kind: 'dialogue',
        call: true,
        title: b('Calling an office', 'Appeler un bureau'),
        scene: b('You call the company Bélanger & Fils to speak to Mrs. Côté.', 'Vous appelez l’entreprise Bélanger et Fils pour parler à madame Côté.'),
        speakers: [{ name: 'Réceptionniste', voice: 'f', side: 'l' }, ME],
        lines: [
          { s: 0, fr: 'Bélanger et Fils, bonjour !', tr: 'Bélanger & Sons, good morning!' },
          { s: 1, choose: { options: ['Bonjour, je voudrais parler à madame Côté, s’il vous plaît.', 'Allô, c’est qui ?', 'Bonjour, vous allez bien, madame Côté ?'], answer: 0, explain: b('Greet, then ask for the person: “je voudrais parler à…”.', 'Saluez, puis demandez la personne : « je voudrais parler à… ».') } },
          { s: 0, fr: 'C’est de la part de qui ?', tr: 'Who shall I say is calling?' },
          { s: 1, choose: { options: ['De la part de Karim Haddad.', 'C’est moi.', 'De la part de madame Côté.'], answer: 0 } },
          { s: 0, fr: 'Ne quittez pas… Je suis désolée, elle est en ligne. Voulez-vous laisser un message ?', tr: 'Hold on… I’m sorry, she is on another call. Would you like to leave a message?' },
          { s: 1, choose: { options: ['Oui, pouvez-vous lui demander de me rappeler ?', 'Non, je ne quitte pas.', 'Oui, je suis en ligne aussi.'], answer: 0 } },
          { s: 0, fr: 'Bien sûr. Quel est votre numéro ?', tr: 'Of course. What is your number?' },
        ],
      },
      hear('f', 'Ne quittez pas… Je suis désolée, elle est en ligne. Voulez-vous laisser un message ?', b('Why can’t you speak to Mrs. Côté?', 'Pourquoi ne pouvez-vous pas parler à madame Côté ?'), [b('She is already on the phone', 'Elle est déjà au téléphone'), b('She has left the company', 'Elle a quitté l’entreprise'), b('She is in a meeting all day', 'Elle est en réunion toute la journée')], b('“Elle est en ligne” = she is on another call. “Ne quittez pas” = hold the line, not “do not leave”.', '« Elle est en ligne » = elle parle déjà au téléphone. « Ne quittez pas » = restez au téléphone.')),
      card(b('Spelling: the letters that confuse', 'Épeler : les lettres qui piègent'), b('Three pairs cause most mistakes: **G** [ʒe] and **J** [ʒi]; **E** [ə] and **I** [i]; **U** [y] and **OU**. To be sure, add a word: **D comme Daniel, M comme Marie**. Double letters: **deux L**. Accents: **E accent aigu** (é), **E accent grave** (è).', 'Trois paires causent la plupart des erreurs : **G** [ʒe] et **J** [ʒi] ; **E** [ə] et **I** [i] ; **U** [y] et **OU**. Pour être sûr, ajoutez un mot : **D comme Daniel, M comme Marie**. Lettres doubles : **deux L**. Accents : **E accent aigu** (é), **E accent grave** (è).'), { variant: 'tip' }),
      hear('m2', 'Mon nom, c’est Girard. G comme Georges, I, R, A, R, D comme Daniel.', b('How is the name spelled?', 'Comment s’écrit le nom ?'), ['GIRARD', 'JIRARD', 'GERARD'], b('“G comme Georges” removes the doubt between G and J.', '« G comme Georges » enlève le doute entre G et J.')),
      card(b('Phone numbers: Canada and France', 'Les numéros : Canada et France'), b('In **Canada**, people say the area code and the number in groups, often digit by digit: *cinq, un, quatre — cinq, cinq, cinq — zéro, un, huit, sept* (514 555-0187). Some say *cinq cent quatorze*. In **France**, numbers have ten digits said **in pairs**: *zéro six, douze, trente-quatre, cinquante-six, soixante-dix-huit* (06 12 34 56 78).', 'Au **Canada**, on dit l’indicatif régional et le numéro par groupes, souvent chiffre par chiffre : *cinq, un, quatre — cinq, cinq, cinq — zéro, un, huit, sept* (514 555-0187). Certains disent *cinq cent quatorze*. En **France**, les numéros ont dix chiffres dits **par paires** : *zéro six, douze, trente-quatre, cinquante-six, soixante-dix-huit* (06 12 34 56 78).'), { variant: 'culture' }),
      hear('f2', 'Vous pouvez me joindre au quatre, un, huit, cinq, cinq, cinq, zéro, un, quatre, deux.', b('Which number do you hear?', 'Quel numéro entendez-vous ?'), ['418 555-0142', '418 555-0124', '481 555-0142']),
      hear('m', 'Mon portable, c’est le zéro six, vingt-deux, quarante-cinq, soixante-dix-huit, quatre-vingt-dix.', b('Which number do you hear?', 'Quel numéro entendez-vous ?'), ['06 22 45 78 90', '06 22 45 68 90', '06 22 54 78 90'], b('Soixante-dix-huit = 78; quatre-vingt-dix = 90.', 'Soixante-dix-huit = 78 ; quatre-vingt-dix = 90.')),
      { kind: 'dictation', prompt: b('Write what the receptionist says.', 'Écrivez ce que dit la réceptionniste.'), text: 'Ne quittez pas, je vous la passe.', voice: 'f' },
      { kind: 'speak', prompt: b('Spell a name the safe way.', 'Épelez un nom de façon sûre.'), text: 'Martin : M comme Marie, A, R, T, I, N.', tr: b('Martin: M as in Marie…', 'Martin : M comme Marie…') },
    ],
    notes: {
      points: [
        b('Ne quittez pas = hold the line; il / elle est en ligne = on another call; je vous le / la passe = I’ll put you through.', 'Ne quittez pas = restez au téléphone ; il / elle est en ligne = déjà au téléphone ; je vous le / la passe = je vous mets en communication.'),
        b('Spelling: G [ʒe] / J [ʒi], E [ə] / I [i]; add “comme + first name” to be sure.', 'Épellation : G [ʒe] / J [ʒi], E [ə] / I [i] ; ajoutez « comme + prénom » pour être sûr.'),
        b('Canada: 514 555-0187 in groups; France: 06 12 34 56 78 in pairs.', 'Canada : 514 555-0187 par groupes ; France : 06 12 34 56 78 par paires.'),
        b('Never be shy to say “Pardon ? Pouvez-vous répéter ?”.', 'N’ayez jamais peur de dire « Pardon ? Pouvez-vous répéter ? ».'),
      ],
      vocab: [['l’appareil', b('the phone (formal)', 'le téléphone')], ['joindre quelqu’un', b('to reach someone', 'réussir à contacter quelqu’un')], ['rappeler', b('to call back', 'téléphoner de nouveau')], ['le portable', b('the mobile phone', 'le cellulaire au Québec')], ['l’indicatif régional', b('the area code', 'les trois premiers chiffres au Canada')]],
    },
  },
  {
    id: 'phone-french-2',
    slug: { en: 'booking-an-appointment-by-phone', fr: 'prendre-rendez-vous-au-telephone' },
    title: b('Booking an appointment by phone', 'Prendre rendez-vous au téléphone'),
    summary: b('Call a clinic and a garage: ask for an appointment, understand the times offered, give your details and confirm.', 'Appelez une clinique et un garage : demandez un rendez-vous, comprenez les créneaux proposés, donnez vos coordonnées et confirmez.'),
    objectives: [b('Ask for an appointment politely', 'Demander un rendez-vous poliment'), b('Understand days, dates and times', 'Comprendre des jours, des dates et des heures'), b('Confirm and repeat the information', 'Confirmer et répéter les informations')],
    minutes: 13,
    steps: [
      card(b('Polite and efficient', 'Poli et efficace'), b('On the phone, the conditional makes you sound polite: **Je voudrais** prendre rendez-vous. **Est-ce que ce serait possible** jeudi ? **Pourriez-vous** me rappeler la date ? Then **repeat** the key information to check it: *Donc, jeudi 12 à 9 h 15, c’est bien ça ?*', 'Au téléphone, le conditionnel rend poli : **Je voudrais** prendre rendez-vous. **Est-ce que ce serait possible** jeudi ? **Pourriez-vous** me rappeler la date ? Puis **répétez** l’information clé pour vérifier : *Donc, jeudi 12 à 9 h 15, c’est bien ça ?*'), { examples: [{ fr: 'Je voudrais prendre rendez-vous avec le docteur Lemieux.', tr: 'I would like to make an appointment with Dr. Lemieux.' }, { fr: 'Est-ce que vous auriez quelque chose plus tôt ?', tr: 'Would you have anything earlier?' }, { fr: 'Donc, jeudi à neuf heures quinze, c’est bien ça ?', tr: 'So, Thursday at 9:15, is that right?' }] }),
      {
        kind: 'dialogue',
        call: true,
        title: b('At the medical clinic', 'À la clinique médicale'),
        speakers: [{ name: 'Clinique', voice: 'f2', side: 'l' }, ME],
        lines: [
          { s: 0, fr: 'Clinique médicale des Pins, bonjour !', tr: 'Des Pins medical clinic, hello!' },
          { s: 1, choose: { options: ['Bonjour, je voudrais prendre rendez-vous avec le docteur Lemieux.', 'Bonjour, je suis malade, au revoir.', 'Bonjour, c’est le docteur ?'], answer: 0 } },
          { s: 0, fr: 'Le docteur Lemieux n’a plus de place cette semaine. Je peux vous proposer mardi prochain à quatorze heures trente.', tr: 'Dr. Lemieux has no more appointments this week. I can offer you next Tuesday at 2:30 p.m.' },
          { s: 1, choose: { options: ['Mardi, je travaille. Est-ce que vous auriez quelque chose le matin ?', 'Mardi, c’est demain ?', 'D’accord, mercredi alors.'], answer: 0, explain: b('Say why it does not suit you and ask for another time with the conditional.', 'Dites pourquoi cela ne vous convient pas et demandez un autre moment au conditionnel.') } },
          { s: 0, fr: 'Jeudi à neuf heures quinze, ça vous conviendrait ?', tr: 'Would Thursday at 9:15 suit you?' },
          { s: 1, choose: { options: ['Parfait. Donc, jeudi à neuf heures quinze, c’est bien ça ?', 'Non merci, j’aime le mardi.', 'Neuf heures quinze, c’est quel jour ?'], answer: 0 } },
          { s: 0, fr: 'C’est bien ça. Votre numéro d’assurance maladie, s’il vous plaît ? Et n’oubliez pas votre carte le jour du rendez-vous.', tr: 'That’s right. Your health insurance number, please? And don’t forget your card on the day.' },
        ],
      },
      hear('f2', 'Le docteur Lemieux n’a plus de place cette semaine. Je peux vous proposer mardi prochain à quatorze heures trente.', b('What does the clinic offer first?', 'Que propose d’abord la clinique ?'), [b('Next Tuesday at 2:30 p.m.', 'Mardi prochain à 14 h 30'), b('This Tuesday at 4:30 p.m.', 'Ce mardi à 16 h 30'), b('Thursday at 9:15 a.m.', 'Jeudi à 9 h 15')]),
      hear('f2', 'C’est bien ça. Votre numéro d’assurance maladie, s’il vous plaît ? Et n’oubliez pas votre carte le jour du rendez-vous.', b('What must you bring to the appointment?', 'Que devez-vous apporter au rendez-vous ?'), [b('Your health insurance card', 'Votre carte d’assurance maladie'), b('Your passport', 'Votre passeport'), b('A letter from your doctor', 'Une lettre de votre médecin')]),
      card(b('Days and dates on the phone', 'Les jours et les dates au téléphone'), b('**Ce mardi** = this Tuesday; **mardi prochain** = next Tuesday; **dans quinze jours** = in two weeks; **le 3** = the 3rd (le trois, but **le premier** for the 1st). A trap: *quatorze heures* (2 p.m.) and *quatre heures* (4 a.m. or 4 p.m.) sound close: ask *de l’après-midi ?* if needed.', '**Ce mardi** = le mardi de cette semaine ; **mardi prochain** = celui de la semaine suivante ; **dans quinze jours** = dans deux semaines ; **le 3** (le trois, mais **le premier** pour le 1er). Piège : *quatorze heures* et *quatre heures* se ressemblent : demandez *de l’après-midi ?* si besoin.'), { variant: 'trap' }),
      {
        kind: 'dialogue',
        call: true,
        title: b('At the garage', 'Au garage'),
        speakers: [{ name: 'Garage', voice: 'm2', side: 'l' }, ME],
        lines: [
          { s: 0, fr: 'Garage Pelletier, Sylvain à l’appareil.', tr: 'Pelletier Garage, Sylvain speaking.' },
          { s: 1, choose: { options: ['Bonjour, je voudrais faire changer mes pneus pour l’hiver.', 'Bonjour, ma voiture est jolie.', 'Bonjour, je voudrais acheter un garage.'], answer: 0 } },
          { s: 0, fr: 'Pas de problème. J’ai une place le samedi deux novembre à huit heures, ou le lundi quatre à treize heures.', tr: 'No problem. I have a slot on Saturday, November 2 at 8 a.m., or on Monday the 4th at 1 p.m.' },
          { s: 1, choose: { options: ['Le samedi à huit heures, c’est parfait. Ça prend combien de temps ?', 'Je préfère dimanche.', 'Le pneu, c’est combien de place ?'], answer: 0 } },
          { s: 0, fr: 'Environ une heure. Vous pouvez attendre ici, il y a du café.', tr: 'About an hour. You can wait here, there is coffee.' },
        ],
      },
      hear('m2', 'Pas de problème. J’ai une place le samedi deux novembre à huit heures, ou le lundi quatre à treize heures.', b('Which two slots does the garage offer?', 'Quels deux créneaux le garage propose-t-il ?'), [b('Sat. Nov. 2 at 8 a.m. or Mon. 4 at 1 p.m.', 'Sam. 2 nov. à 8 h ou lun. 4 à 13 h'), b('Sat. Nov. 2 at 1 p.m. or Mon. 4 at 8 a.m.', 'Sam. 2 nov. à 13 h ou lun. 4 à 8 h'), b('Sun. Nov. 3 at 8 a.m. only', 'Seulement dim. 3 nov. à 8 h')]),
      { kind: 'fill', prompt: b('Make the request polite.', 'Rendez la demande polie.'), text: 'Je ___ prendre rendez-vous. Est-ce que vous ___ quelque chose plus tôt ?', answers: [['voudrais'], ['auriez']], choices: [['voudrais', 'veux'], ['auriez', 'avez eu']], explain: b('The conditional (je voudrais, vous auriez) is the polite form on the phone.', 'Le conditionnel (je voudrais, vous auriez) est la forme polie au téléphone.') },
      { kind: 'order', prompt: b('Build the sentence that confirms the appointment.', 'Construisez la phrase qui confirme le rendez-vous.'), words: ['Donc,', 'jeudi', 'à', 'neuf', 'heures', 'quinze,', 'c’est', 'bien', 'ça ?'], tr: 'So, Thursday at 9:15, is that right?' },
    ],
    notes: {
      points: [
        b('Ask with the conditional: je voudrais, est-ce que vous auriez, ça vous conviendrait ?', 'Demandez au conditionnel : je voudrais, est-ce que vous auriez, ça vous conviendrait ?'),
        b('Always repeat the date and time to check: “Donc…, c’est bien ça ?”', 'Répétez toujours la date et l’heure pour vérifier : « Donc…, c’est bien ça ? »'),
        b('Ce mardi / mardi prochain / dans quinze jours; le premier, le deux, le trois…', 'Ce mardi / mardi prochain / dans quinze jours ; le premier, le deux, le trois…'),
        b('Quatorze heures (2 p.m.) ≠ quatre heures: ask if in doubt.', 'Quatorze heures ≠ quatre heures : demandez en cas de doute.'),
      ],
      vocab: [['un créneau', b('a time slot', 'un moment disponible')], ['convenir', b('to suit', 'aller bien à quelqu’un')], ['la carte d’assurance maladie', b('health insurance card', 'la carte santé')], ['les pneus d’hiver', b('winter tyres', 'des pneus pour la neige')]],
    },
  },
  {
    id: 'phone-french-3',
    slug: { en: 'voicemails-and-automated-menus', fr: 'messageries-et-serveurs-vocaux' },
    title: b('Voicemails and automated menus', 'Messageries et serveurs vocaux'),
    summary: b('Understand an automated menu and the voicemails you receive, then leave a clear message yourself.', 'Comprendre un serveur vocal et les messages que vous recevez, puis laisser vous-même un message clair.'),
    objectives: [b('Choose the right option in an automated menu', 'Choisir la bonne option dans un serveur vocal'), b('Catch the key information of a voicemail', 'Saisir l’information clé d’un message vocal'), b('Leave a structured message', 'Laisser un message structuré')],
    minutes: 13,
    steps: [
      card(b('The robot voice', 'La voix du robot'), b('Banks, phone companies and public services answer with an **automated menu** (un serveur vocal). The key verbs: **faites le 1** or **appuyez sur le 1** (press 1), **le carré / le dièse** (#), **l’étoile** (*), **restez en ligne** (stay on the line), **un agent / un conseiller** (a person).', 'Les banques, les opérateurs et les services publics répondent avec un **serveur vocal**. Les verbes clés : **faites le 1** ou **appuyez sur le 1**, **le carré / le dièse** (#), **l’étoile** (*), **restez en ligne**, **un agent / un conseiller** (une personne).')),
      hear('f', 'Bienvenue. Pour connaître nos heures d’ouverture, faites le un. Pour un problème de facturation, faites le deux. Pour parler à un agent, faites le zéro.', b('You have a problem with your bill. Which key do you press?', 'Vous avez un problème de facture. Sur quelle touche appuyez-vous ?'), ['2', '1', '0'], b('“Facturation” = billing.', '« Facturation » = ce qui concerne les factures.')),
      hear('f', 'Votre appel est important pour nous. Tous nos agents sont présentement occupés. Le temps d’attente estimé est de douze minutes.', b('What does the message say?', 'Que dit le message ?'), [b('All agents are busy: about 12 minutes of waiting', 'Tous les agents sont occupés : environ 12 minutes d’attente'), b('The office is closed for 12 days', 'Le bureau est fermé pendant 12 jours'), b('Call back after 12 o’clock', 'Rappelez après midi')], b('“Présentement” (Québec) = right now. “Le temps d’attente estimé” = estimated waiting time.', '« Présentement » (Québec) = en ce moment. « Le temps d’attente estimé » = la durée prévue.')),
      hear('f2', 'Bonjour, ici Sandra, du cabinet dentaire Lavoie. Je vous appelle pour confirmer votre rendez-vous de demain, à dix heures quinze. Si vous avez un empêchement, merci de nous rappeler au cinq, un, quatre, cinq, cinq, cinq, zéro, un, six, trois. Bonne journée !', b('Why does Sandra call?', 'Pourquoi Sandra appelle-t-elle ?'), [b('To confirm a dental appointment tomorrow at 10:15', 'Pour confirmer un rendez-vous chez le dentiste demain à 10 h 15'), b('To cancel an appointment', 'Pour annuler un rendez-vous'), b('To offer a new appointment', 'Pour proposer un nouveau rendez-vous')]),
      hear('f2', 'Si vous avez un empêchement, merci de nous rappeler au cinq, un, quatre, cinq, cinq, cinq, zéro, un, six, trois.', b('When should you call back, and at what number?', 'Quand devez-vous rappeler, et à quel numéro ?'), [b('Only if you cannot come: 514 555-0163', 'Seulement si vous ne pouvez pas venir : 514 555-0163'), b('In any case: 514 555-0136', 'Dans tous les cas : 514 555-0136'), b('Before 10:15: 514 555-0163', 'Avant 10 h 15 : 514 555-0163')], b('“Un empêchement” = something that prevents you from coming.', '« Un empêchement » = quelque chose qui vous empêche de venir.')),
      hear('m', 'Salut, c’est Antoine. Le match de soccer est déplacé à dimanche, même heure, même terrain. Rappelle-moi si t’as besoin d’un lift !', b('What has changed?', 'Qu’est-ce qui a changé ?'), [b('The day of the match: now Sunday', 'Le jour du match : maintenant dimanche'), b('The time of the match', 'L’heure du match'), b('The place of the match', 'Le lieu du match')], b('“Même heure, même terrain”: only the day changes. “Un lift” (Québec) = a ride.', '« Même heure, même terrain » : seul le jour change. « Un lift » (Québec) = un transport en voiture.')),
      card(b('Leaving a good message', 'Laisser un bon message'), b('A clear voicemail has five parts, in this order. Say your number **slowly**, and **twice**.', 'Un message clair a cinq parties, dans cet ordre. Dites votre numéro **lentement**, et **deux fois**.'), { points: [
        b('1. Greeting and name: *Bonjour, c’est Karim Haddad.*', '1. Salutation et nom : *Bonjour, c’est Karim Haddad.*'),
        b('2. Reason: *Je vous appelle au sujet de…*', '2. Raison : *Je vous appelle au sujet de…*'),
        b('3. Request: *Pourriez-vous me rappeler ?*', '3. Demande : *Pourriez-vous me rappeler ?*'),
        b('4. Number, twice: *au 514 555-0187… je répète…*', '4. Numéro, deux fois : *au 514 555-0187… je répète…*'),
        b('5. Thanks: *Merci, bonne journée.*', '5. Remerciement : *Merci, bonne journée.*'),
      ] }),
      { kind: 'order', prompt: b('Build the reason for your call.', 'Construisez la raison de votre appel.'), words: ['Je', 'vous', 'appelle', 'au', 'sujet', 'de', 'ma', 'facture.'], tr: 'I am calling about my bill.' },
      { kind: 'match', prompt: b('Match the words of automated menus.', 'Associez les mots des serveurs vocaux.'), pairs: [['faites le 1', b('press 1', 'appuyez sur la touche 1')], ['le carré', b('the hash key (#)', 'la touche #')], ['restez en ligne', b('stay on the line', 'ne raccrochez pas')], ['raccrocher', b('to hang up', 'terminer l’appel')], ['un empêchement', b('something that prevents you', 'un imprévu')]] },
      { kind: 'speak', prompt: b('Leave your message.', 'Laissez votre message.'), text: 'Bonjour, c’est Karim Haddad. Je vous appelle au sujet de ma facture. Pourriez-vous me rappeler au cinq, un, quatre, cinq, cinq, cinq, zéro, un, huit, sept ? Merci, bonne journée.', tip: b('Slow down for the number: it is the most important part.', 'Ralentissez pour le numéro : c’est la partie la plus importante.') },
    ],
    notes: {
      points: [
        b('Automated menus: faites le / appuyez sur le 1, le carré (#), l’étoile (*), restez en ligne.', 'Serveurs vocaux : faites le / appuyez sur le 1, le carré (#), l’étoile (*), restez en ligne.'),
        b('In a voicemail, catch: who, why, what to do, the number.', 'Dans un message, saisissez : qui, pourquoi, quoi faire, le numéro.'),
        b('Your message: name, reason (au sujet de), request, number twice, thanks.', 'Votre message : nom, raison (au sujet de), demande, numéro deux fois, remerciement.'),
        b('Québec: présentement (now), un lift (a ride), le cellulaire (mobile).', 'Québec : présentement, un lift, le cellulaire.'),
      ],
      vocab: [['un serveur vocal', b('an automated phone menu', 'un menu téléphonique automatique')], ['la facturation', b('billing', 'le service des factures')], ['raccrocher', b('to hang up', 'terminer l’appel')], ['un empêchement', b('a last-minute problem', 'un imprévu')], ['déplacer', b('to move, reschedule', 'changer la date ou le lieu')]],
    },
  },
];

export default lessons;
