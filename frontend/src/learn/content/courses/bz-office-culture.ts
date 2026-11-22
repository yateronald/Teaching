import type { CourseAbout } from '../../types';
import { b, card, culture, dlg, doc, gap, hear, lesson, mc, P, pairs, say, sort, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Workplace French happens as much by the coffee machine and at lunch as in formal meetings. Knowing how to chat politely without holding colleagues up, navigating tu and vous across France and Québec, joining or declining a team lunch smoothly, and phrasing everyday requests without sounding abrupt makes daily office life effortless. This A2 course equips you with natural small-talk phrases, cultural cues and polite request templates.',
    'Le français au travail se joue autant à la machine à café et au déjeuner qu’en réunion formelle. Savoir échanger quelques mots sans retenir ses collègues, manier le tu et le vous entre France et Québec, accepter ou décliner un repas d’équipe avec tact et formuler une demande polie transforme le quotidien au bureau. Ce cours de niveau A2 vous donne réflexes culturels, dialogues et formulations justes.',
  ),
  outcomes: [
    b('Handle morning greetings and coffee-break small talk naturally', 'Gérer les salutations du matin et les pauses café avec naturel'),
    b('Navigate tu vs vous norms in France and Québec workplaces', 'Adapter tu et vous selon les usages de France et du Québec'),
    b('Join or decline team lunches and after-work drinks politely', 'Accepter ou décliner un déjeuner d’équipe ou un pot avec tact'),
    b('Make polite spoken and written requests to colleagues', 'Formuler des demandes polies à l’oral et par courriel au bureau'),
  ],
};

const C = 'bz-office-culture';
export default [
  lesson(C, 1, ['coffee-break-and-small-talk', 'pause-cafe-et-petite-conversation'],
    b('Coffee breaks and morning small talk', 'Pauses café et échanges du matin'),
    b('Greet colleagues warmly, make brief small talk and return to work smoothly.', 'Saluer ses collègues, discuter brièvement à la pause et repartir travailler avec tact.'),
    [b('Open and keep a brief coffee chat', 'Lancer une courte conversation autour du café'), b('Ask how work is going without prying', 'Demander comment va le travail avec naturel'), b('Leave a break conversation politely', 'Quitter la pause poliment')],
    13,
    [
      card(b('Coffee-machine essentials', 'À la machine à café'), b('**Bonjour, ça va ? · Tu as passé un bon week-end ? · Tu veux un café ? · Courage pour ta réunion ! · Ça avance bien sur ton dossier ?** Wrap up politely: **Bon, je file en réunion. · Allez, je te laisse, à tout à l’heure ! · Bonne journée de travail !**', '**Bonjour, ça va ? · Tu as passé un bon week-end ? · Tu veux un café ? · Courage pour ta réunion ! · Ça avance bien sur ton dossier ?** Conclure : **Bon, je file en réunion. · Allez, je te laisse, à tout à l’heure ! · Bonne journée de travail !**')),
      hear('Salut Karim ! Tu as passé un bon week-end ? Moi je viens de me faire un café. Bon, je file en réunion, on se voit tout à l’heure à la cantine !', b('Where will the two colleagues meet later?', 'Où les deux collègues vont-ils se retrouver plus tard ?'), [b('At the canteen', 'À la cantine'), b('In a meeting right now', 'En réunion tout de suite'), b('At the train station', 'À la gare'), b('Outside the building', 'Devant l’immeuble')], { voice: 'f' }),
      dlg(b('By the coffee machine', 'Devant la machine à café'), undefined, [['Camille', 'f'], ['Vous', 'm']], [
        [0, 'Salut ! Ça va ce matin ? Pas trop dur le lundi ?', 'Hi! How’s it going this morning? Not too rough for a Monday?'],
        [1, { options: ['Ça va bien, merci ! Un peu fatigué mais prêt pour la semaine. Et toi ?', 'Non, je déteste travailler le lundi.', 'Bonjour Madame, comment allez-vous ?'] }],
        [0, 'Pareil, un grand café s’impose ! Tu as une grosse journée ?', 'Same, a big coffee is a must! Have you got a busy day?'],
        [1, { options: ['Oui, j’ai deux réunions ce matin. Bon, je file, bon courage à toi !', 'Oui, au revoir.', 'Je ne veux pas parler.'] }],
      ]),
      pairs(P.match, [['bon courage !', b('good luck / hang in there!', 'encouragement')], ['je file', b('I’m heading off / rushing off', 'je pars vite')], ['ça avance ?', b('is it going well?', 'ça progresse ?')], ['à tout à l’heure', b('see you later today', 'à plus tard dans la journée')]]),
      gap(P.complete, 'Tu as passé un bon week-end ? Bon, je ___ en réunion, à tout à l’___ !', ['file', 'heure']),
      say('Bonjour ! Tu as passé un bon week-end ? Bon, je file en réunion, bon courage pour ce matin !', 'Hello! Did you have a nice weekend? Well, I’m rushing to a meeting, good luck this morning!'),
    ],
    [
      b('Keep morning small talk warm and brief: weekend, workload, encouragement.', 'Gardez la pause brève et chaleureuse : week-end, charge du jour, encouragement.'),
      b('Exit cleanly with « Bon, je file… » or « Je te laisse, bon courage ! ».', 'Partez naturellement avec « Bon, je file… » ou « Bon courage ! ».'),
      b('Bon courage is friendly support for a task, not just for hard times.', '« Bon courage » encourage gentiment quelqu’un pour sa journée ou sa tâche.'),
    ],
    [['filer', b('to dash off, head off', 'partir rapidement')], ['un dossier', b('a file, project case', 'projet ou affaire en cours')], ['la cantine', b('staff canteen, cafeteria', 'restaurant d’entreprise')]],
  ),
  lesson(C, 2, ['tu-vs-vous-and-team-lunches', 'tu-vous-et-dejeuners'],
    b('Tu vs vous and team lunches', 'Tutoiement, vouvoiement et déjeuners'),
    b('Choose tu or vous smoothly and accept or decline team lunches politely.', 'Choisir tu ou vous avec justesse et gérer les invitations à déjeuner.'),
    [b('Handle the switch from vous to tu', 'Gérer le passage du vous au tu'), b('Notice France vs Québec norms', 'Comparer les usages en France et au Québec'), b('Accept or decline a lunch invite kindly', 'Accepter ou décliner un déjeuner poliment')],
    13,
    [
      culture(b('Tu or vous in the office?', 'Tu ou vous au bureau ?'), b('In **France**, colleagues of the same level usually use **tu**, while **vous** is safer on day one with senior managers or external clients until someone says **« On peut se tutoyer ? »**. In **Québec**, **tu** is widespread across almost all levels, though **vous** stays polite with new clients.', 'En **France**, entre pairs on se dit vite **tu**, mais le **vous** reste prudent au début avec la direction ou les clients, jusqu’à **« On peut se tutoyer ? »**. Au **Québec**, le **tu** est quasi général en interne, mais le **vous** demeure poli avec un nouveau client.')),
      card(b('Lunch invitations', 'Invitations à déjeuner'), b('Invite: **Tu manges avec nous ce midi ? · On va chercher un sandwich à midi ?** Accept: **Avec plaisir ! · Volontiers !** Decline kindly: **Merci, c’est gentil, mais j’ai apporté ma gamelle / mon lunch aujourd’hui. · J’ai un appel à 12 h 30, une prochaine fois avec plaisir !**', 'Inviter : **Tu manges avec nous ce midi ?** Accepter : **Avec plaisir ! · Volontiers !** Décliner : **Merci, c’est gentil, mais j’ai apporté mon repas aujourd’hui. · J’ai un appel à 12 h 30, une prochaine fois avec plaisir !**')),
      doc({ look: 'sms', title: b('Team chat', 'Messagerie interne'), text: 'Lucie : Salut tout le monde ! On réserve une table à la brasserie à 12 h 15 pour fêter l’arrivée de Marc. Qui se joint à nous ? Répondez avant 11 h pour que j’appelle le resto.' }, b('What must colleagues do if they want to join lunch?', 'Que doivent faire les collègues pour participer au déjeuner ?'), [b('Reply before 11 a.m. so Lucie can book', 'Répondre avant 11 h pour que Lucie réserve'), b('Go straight to the restaurant at 11 a.m.', 'Aller directement au restaurant à 11 h'), b('Bring their own packed lunch', 'Apporter leur propre repas'), b('Wait for Marc to call everyone', 'Attendre que Marc appelle chacun')]),
      mc(P.best, ['Avec grand plaisir ! Merci de me le proposer.', 'Oui, tutoyons-nous maintenant !', 'Non, je préfère vous dire vous pour toujours.', 'Je ne sais pas ce que ça veut dire.'], { fr: 'Votre nouvelle cheffe d’équipe en France vous dit : « On peut se tutoyer si vous voulez. »' }),
      mc(P.best, ['Merci pour l’invitation, c’est vraiment sympa, mais j’ai une présentation à finir. Une prochaine fois volontiers !', 'Non, je n’aime pas ce restaurant.', 'Je ne veux pas manger avec vous.', 'Peut-être jamais.'], { fr: 'Des collègues vous invitent au restaurant à midi, mais vous êtes débordé(e) :' }),
      sort(b('Accepting or declining kindly?', 'Accepter ou décliner poliment ?'), [b('accepting', 'accepter'), b('declining kindly', 'décliner poliment')], [['Avec plaisir !', 0], ['Une prochaine fois volontiers !', 1], ['Je me joins à vous !', 0], ['J’ai déjà apporté mon repas aujourd’hui.', 1], ['Super idée, je viens !', 0], ['J’ai un appel à 12 h 30, désolé(e).', 1]]),
      say('Merci pour l’invitation, mais j’ai un appel à midi trente. Une prochaine fois avec plaisir !', 'Thanks for the invite, but I have a call at 12:30. Another time with pleasure!'),
    ],
    [
      b('When a manager proposes « On peut se tutoyer ? », accept warmly.', 'Si un supérieur propose le tutoiement, acceptez chaleureusement.'),
      b('Always add « une prochaine fois avec plaisir » when declining lunch.', 'Ajoutez « une prochaine fois avec plaisir » quand vous déclinez.'),
      b('Québec uses tu very widely internally; France separates internal peers from clients.', 'Le Québec tutoie largement en interne ; la France distingue pairs et clients.'),
    ],
    [['se tutoyer', b('to use tu with each other', 'employer tu mutuellement')], ['volontiers', b('gladly, with pleasure', 'avec plaisir')], ['une gamelle / un lunch', b('a packed lunch', 'repas apporté de la maison')]],
  ),
  lesson(C, 3, ['polite-requests-and-office-emails', 'demandes-polies-au-bureau'],
    b('Polite requests and office messages', 'Demandes polies et messages internes'),
    b('Ask colleagues for help, documents or quick favours without sounding demanding.', 'Demander aide, document ou coup de main sans paraître autoritaire.'),
    [b('Soften requests with conditional and excuses', 'Adoucir une demande avec le conditionnel'), b('Offer something in return or show flexibility', 'Montrer sa souplesse sur le délai'), b('Write a short polite internal message', 'Rédiger un court message interne poli')],
    13,
    [
      card(b('Softening office requests', 'Adoucir une demande au bureau'), b('Avoid bare imperatives with peers. Use: **Désolé(e) de te déranger, est-ce que tu aurais deux minutes ? · Pourrais-tu m’envoyer… ? · Auriez-vous l’amabilité de… ? · Quand tu auras un moment, sans urgence… · Un grand merci d’avance !**', 'Évitez l’impératif sec avec vos collègues. Dites : **Désolé(e) de te déranger, tu aurais deux minutes ? · Pourrais-tu m’envoyer… ? · Auriez-vous la possibilité de… ? · Quand tu auras un moment… · Merci d’avance !**')),
      mc(P.best, ['Coucou Julie, désolé de te déranger : aurais-tu le lien vers le tableau des congés ? Merci d’avance !', 'Envoie-moi le tableau des congés tout de suite.', 'Tu n’as toujours pas envoyé le tableau.', 'Où est le fichier ?'], { fr: 'Vous demandez un document par messagerie à une collègue :' }),
      pairs(P.match, [['désolé de te déranger', b('sorry to bother you', 'excuse polie')], ['aurais-tu deux minutes ?', b('would you have two minutes?', 'as-tu un instant ?')], ['sans urgence', b('whenever you have a moment, no rush', 'pas pressé')], ['merci d’avance', b('thanks in advance', 'remerciement anticipé')]]),
      gap(P.complete, 'Désolée de vous ___, auriez-vous deux ___ pour relire ce message ?', ['déranger', 'minutes']),
      write(b('Polite internal message', 'Message interne poli'), b('Write a short message (35–65 words) to a colleague you tutoyer: apologise for bothering them, ask if they can review two slides before 4 p.m., specify it can wait until after lunch, and thank them.', 'Rédigez un court message (35–65 mots) à un(e) collègue que vous tutoyez : excusez-vous de déranger, demandez une relecture de deux diapositives avant 16 h, précisez que ce n’est pas urgent avant midi, et remerciez.'), 35, 65, [
        b('Polite opening and excuse for interrupting', 'Formule d’excuse polie'),
        b('Clear request using conditional (pourrais-tu / aurais-tu)', 'Demande au conditionnel'),
        b('Flexible timing and warm thanks', 'Précision de délai et remerciement'),
      ], 'Salut Thomas,\n\nDésolée de te déranger ! Aurais-tu cinq minutes cet après-midi pour jeter un œil à mes deux diapositives avant 16 h ? Pas d’urgence avant le déjeuner, bien sûr. Dis-moi si tu es disponible vers 14 h 30. Un grand merci d’avance pour ton aide !'),
      say('Désolé de te déranger, aurais-tu deux minutes pour regarder ce document cet après-midi ?', 'Sorry to bother you, would you have two minutes to look at this document this afternoon?'),
    ],
    [
      b('Use conditional (pourrais-tu, aurais-tu, pourriez-vous) to sound warm and respectful.', 'Employez le conditionnel (pourrais-tu, auriez-vous) pour rester courtois.'),
      b('Add timing flexibility: « quand tu auras un moment », « pas d’urgence ».', 'Donnez de la souplesse : « quand tu auras un moment », « sans urgence ».'),
      b('Close warmly with « Merci d’avance » or « Merci beaucoup pour ton aide ».', 'Terminez avec chaleur : « Merci d’avance » ou « Merci pour ton aide ».'),
    ],
    [['jeter un œil à', b('to take a quick look at', 'regarder rapidement')], ['déranger', b('to bother, disturb', 'interrompre quelqu’un')], ['disponible', b('available', 'libre')]],
  ),
];
