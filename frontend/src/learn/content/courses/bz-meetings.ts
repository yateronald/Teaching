import type { CourseAbout } from '../../types';
import { b, card, dlg, doc, hear, lesson, mc, P, pairs, say, sort, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Meetings are where your voice counts at work. This course trains you to follow the agenda, give your opinion and ask for clarification, interrupt politely, agree on decisions and actions (qui fait quoi, pour quand ?), and take part in video calls, with the expressions French-speaking colleagues use every day in team meetings, project reviews and calls.',
    'C’est en réunion que votre voix compte au travail. Ce cours vous entraîne à suivre l’ordre du jour, donner votre avis et demander des précisions, interrompre poliment, vous mettre d’accord sur les décisions et les actions (qui fait quoi, pour quand ?), et participer aux visioconférences, avec les expressions que les collègues francophones utilisent chaque jour en réunion d’équipe, en point projet et en appel.',
  ),
  outcomes: [
    b('Follow the agenda and the discussion', 'Suivre l’ordre du jour et la discussion'),
    b('Give an opinion and ask for clarification', 'Donner son avis et demander des précisions'),
    b('Interrupt and take the floor politely', 'Interrompre et prendre la parole poliment'),
    b('Agree on actions and deadlines', 'Se mettre d’accord sur les actions et échéances'),
  ],
};

const C = 'bz-meetings';
export default [
  lesson(C, 1, ['agenda-and-opinions', 'ordre-du-jour-et-avis'],
    b('The agenda and giving your opinion', 'L’ordre du jour et donner son avis'),
    b('Follow the points of a meeting and say what you think clearly.', 'Suivre les points d’une réunion et dire clairement ce que vous pensez.'),
    [b('Understand meeting vocabulary', 'Comprendre le vocabulaire de la réunion'), b('Give your opinion', 'Donner son avis'), b('Ask for clarification', 'Demander des précisions')],
    13,
    [
      card(b('Meeting language', 'La langue de la réunion'), b('**L’ordre du jour, le premier point, passer au point suivant, le compte rendu, un tour de table.** Opinion: **À mon avis… · Je pense qu’on devrait… · Je suis plutôt favorable à… · J’ai une réserve sur…** Clarification: **Pourriez-vous préciser ? · Qu’entendez-vous par… ? · Si je comprends bien, …**', '**L’ordre du jour, le premier point, passer au point suivant, le compte rendu, un tour de table.** Avis : **À mon avis… · Je pense qu’on devrait… · Je suis plutôt favorable à… · J’ai une réserve sur…** Précisions : **Pourriez-vous préciser ? · Qu’entendez-vous par… ? · Si je comprends bien, …**')),
      doc({ look: 'page', title: b('Agenda', 'Ordre du jour'), text: 'Réunion d’équipe — lundi 9 h 30\n1. Bilan des ventes du mois\n2. Lancement du nouveau site web\n3. Organisation des congés d’été\n4. Questions diverses' }, b('When will you talk about summer holidays?', 'Quand parlera-t-on des vacances d’été ?'), [b('point 3', 'au point 3'), b('point 1', 'au point 1'), b('point 2', 'au point 2'), b('not at all', 'pas du tout')]),
      mc(P.best, ['Je suis plutôt favorable au lancement en mai, mais j’ai une réserve sur le budget.', 'Mai, oui, non, je sais pas.', 'C’est nul, ce projet.', 'Faites ce que vous voulez.'], { fr: 'On vous demande votre avis sur la date de lancement :' }),
      mc(P.best, ['Pardon, qu’entendez-vous par « optimiser les process » ?', 'Je n’ai rien compris, c’est trop compliqué.', 'Quoi ?', 'Ça ne veut rien dire.'], { fr: 'Votre directeur parle d’« optimiser les process » et vous ne comprenez pas :' }),
      pairs(P.match, [['l’ordre du jour', b('the agenda', 'liste des points')], ['un tour de table', b('a round-table (everyone speaks)', 'chacun parle à son tour')], ['avoir une réserve', b('to have a reservation', 'un doute')], ['les questions diverses', b('any other business', 'derniers points libres')]]),
      say('À mon avis, on devrait lancer le site en mai. Mais pourriez-vous préciser le budget ?', 'In my opinion, we should launch the site in May. But could you clarify the budget?'),
    ],
    [
      b('Agenda words: ordre du jour, point, tour de table, compte rendu.', 'Vocabulaire : ordre du jour, point, tour de table, compte rendu.'),
      b('Opinion: À mon avis… Je suis plutôt favorable à… J’ai une réserve sur…', 'Avis : À mon avis… Je suis plutôt favorable à… J’ai une réserve sur…'),
      b('Clarify: Pourriez-vous préciser ? Qu’entendez-vous par… ?', 'Préciser : Pourriez-vous préciser ? Qu’entendez-vous par… ?'),
    ],
    [['un bilan', b('a review, an assessment', 'résultat d’une période')], ['le lancement', b('the launch', 'début officiel')], ['les congés', b('leave, holidays', 'jours de vacances')]],
  ),
  lesson(C, 2, ['interrupting-and-taking-the-floor', 'interrompre-et-prendre-la-parole'],
    b('Interrupting and taking the floor', 'Interrompre et prendre la parole'),
    b('Get in, keep the floor and bring the meeting back to the point.', 'Prendre la parole, la garder et ramener la réunion au sujet.'),
    [b('Interrupt politely', 'Interrompre poliment'), b('Resist an interruption', 'Résister à une interruption'), b('Bring back to the point', 'Ramener au sujet')],
    13,
    [
      card(b('Taking and keeping the floor', 'Prendre et garder la parole'), b('Interrupt: **Excusez-moi de vous interrompre, mais… · Juste une petite remarque… · Si je peux me permettre…** Keep: **Je termine juste mon idée. · Laissez-moi finir, s’il vous plaît.** Refocus: **Pour revenir à notre sujet… · On s’éloigne un peu de l’ordre du jour. · On pourrait en parler en dehors de la réunion ?**', 'Interrompre : **Excusez-moi de vous interrompre, mais… · Juste une petite remarque… · Si je peux me permettre…** Garder : **Je termine juste mon idée. · Laissez-moi finir, s’il vous plaît.** Recentrer : **Pour revenir à notre sujet… · On s’éloigne un peu de l’ordre du jour. · On pourrait en parler en dehors de la réunion ?**')),
      sort(b('Interrupt, keep or refocus?', 'Interrompre, garder ou recentrer ?'), [b('interrupt', 'interrompre'), b('keep the floor', 'garder la parole'), b('refocus', 'recentrer')], [['Si je peux me permettre…', 0], ['Je termine juste mon idée.', 1], ['Pour revenir à notre sujet…', 2], ['Juste une petite remarque…', 0], ['Laissez-moi finir, s’il vous plaît.', 1], ['On s’éloigne de l’ordre du jour.', 2]]),
      mc(P.best, ['C’est intéressant, mais on s’éloigne un peu de l’ordre du jour. On pourrait en parler après la réunion ?', 'Ça ne nous intéresse pas.', 'Tais-toi, on n’a pas le temps.', 'Bon, on s’en fiche.'], { fr: 'Un collègue parle depuis dix minutes de ses vacances :' }),
      dlg(b('Getting a word in', 'Placer un mot'), undefined, [['Directeur', 'm'], ['Vous', 'f']], [
        [0, 'Donc on augmente les prix de dix pour cent dès janvier, et ensuite…', 'So we raise prices by ten per cent from January, and then…'],
        [1, { options: ['Excusez-moi de vous interrompre, mais nos deux principaux clients ont des contrats à prix fixe jusqu’en juin.', 'Non ! C’est une mauvaise idée !', 'Hum… rien.'] }],
        [0, 'Ah, bonne remarque. Il faut vérifier ça.', 'Ah, good point. We need to check that.'],
        [1, { options: ['Je peux m’en charger et vous faire un retour vendredi.', 'C’est votre problème.', 'Je ne sais pas.'] }],
      ]),
      say('Excusez-moi de vous interrompre, mais j’ai une petite remarque sur le calendrier.', 'Sorry to interrupt, but I have a small remark about the schedule.'),
    ],
    [
      b('Interrupt: Excusez-moi de vous interrompre, mais…', 'Interrompre : Excusez-moi de vous interrompre, mais…'),
      b('Keep: Je termine juste mon idée.', 'Garder : Je termine juste mon idée.'),
      b('Refocus: Pour revenir à notre sujet…', 'Recentrer : Pour revenir à notre sujet…'),
    ],
    [['une remarque', b('a remark, a point', 'observation')], ['s’éloigner', b('to drift away', 'aller loin de')], ['faire un retour', b('to report back', 'donner une réponse')]],
  ),
  lesson(C, 3, ['actions-and-video-calls', 'actions-et-visioconferences'],
    b('Actions, deadlines and video calls', 'Actions, échéances et visioconférences'),
    b('Close a meeting with clear actions, and handle typical video-call situations.', 'Conclure une réunion par des actions claires et gérer les situations typiques des visios.'),
    [b('Assign actions: who, what, when', 'Répartir les actions : qui, quoi, quand'), b('Summarise decisions', 'Résumer les décisions'), b('Handle video-call problems', 'Gérer les problèmes de visio')],
    13,
    [
      card(b('Closing and video calls', 'Conclure et visioconférence'), b('Actions: **Qui s’en occupe ? · Je m’en charge. · Pour quand ? D’ici vendredi. · Je récapitule les décisions : …** Video: **Vous m’entendez ? · Je crois que vous êtes en sourdine / Votre micro est coupé. · Vous figez, je vous perds. · Je partage mon écran. · Je vous entends mal, je vais me reconnecter.**', 'Actions : **Qui s’en occupe ? · Je m’en charge. · Pour quand ? D’ici vendredi. · Je récapitule les décisions : …** Visio : **Vous m’entendez ? · Je crois que vous êtes en sourdine / Votre micro est coupé. · Vous figez, je vous perds. · Je partage mon écran. · Je vous entends mal, je vais me reconnecter.**')),
      hear('Je récapitule : Julie s’occupe du devis d’ici mercredi, Ahmed contacte le fournisseur demain, et on refait un point lundi prochain à dix heures.', b('Who contacts the supplier, and when?', 'Qui contacte le fournisseur, et quand ?'), [b('Ahmed, tomorrow', 'Ahmed, demain'), b('Julie, Wednesday', 'Julie, mercredi'), b('everyone, Monday', 'tout le monde, lundi'), b('Ahmed, next Monday', 'Ahmed, lundi prochain')], { voice: 'm' }),
      mc(P.best, ['Je crois que votre micro est coupé, on ne vous entend pas.', 'On n’entend rien, c’est nul.', 'Parlez plus fort !', 'Votre ordinateur est cassé.'], { fr: 'En visio, votre collègue parle mais on ne l’entend pas :' }),
      sort(b('Action or video problem?', 'Action ou problème de visio ?'), [b('action / decision', 'action / décision'), b('video problem', 'problème de visio')], [['Je m’en charge d’ici jeudi.', 0], ['Vous figez.', 1], ['Qui s’occupe du budget ?', 0], ['Votre micro est coupé.', 1], ['On refait un point lundi.', 0], ['Je vous entends mal.', 1]]),
      write(b('Action list', 'Liste d’actions'), b('Write the closing summary of a meeting (40–70 words): three decisions, each with who, what and when.', 'Rédigez le résumé de fin de réunion (40–70 mots) : trois décisions, chacune avec qui, quoi et quand.'), 40, 70, [
        b('Three actions', 'Trois actions'),
        b('Who, what, when for each', 'Qui, quoi, quand pour chacune'),
        b('Next meeting date', 'Date de la prochaine réunion'),
      ], 'Je récapitule les décisions. Premièrement, Léa prépare la nouvelle offre commerciale d’ici jeudi. Deuxièmement, Karim contacte les trois clients prioritaires avant la fin de la semaine. Enfin, je m’occupe de valider le budget avec la direction lundi. Nous referons un point mardi prochain à 10 h. Merci à tous !'),
    ],
    [
      b('Every action: qui, quoi, pour quand.', 'Chaque action : qui, quoi, pour quand.'),
      b('Close: Je récapitule les décisions…', 'Conclure : Je récapitule les décisions…'),
      b('Video: micro coupé, vous figez, je partage mon écran.', 'Visio : micro coupé, vous figez, je partage mon écran.'),
    ],
    [['d’ici vendredi', b('by Friday', 'avant vendredi')], ['en sourdine', b('muted', 'son coupé')], ['se reconnecter', b('to reconnect', 'se connecter à nouveau')]],
  ),
];
