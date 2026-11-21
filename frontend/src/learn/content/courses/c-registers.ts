import type { CourseAbout } from '../../types';
import { b, card, culture, dlg, lesson, mc, P, pairs, say, sort, tip } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Tu or vous? Salut or bonjour? Ouais or oui? Choosing the right register is one of the most important social skills in French, and the rules differ between France, Québec, Belgium and Switzerland, between generations and between workplaces. This course clarifies when to use tu and vous, how to switch, and how to move between familiar, standard and formal French in vocabulary, grammar and pronunciation.',
    'Tu ou vous ? Salut ou bonjour ? Ouais ou oui ? Choisir le bon registre est l’une des compétences sociales les plus importantes en français, et les règles varient entre la France, le Québec, la Belgique et la Suisse, entre générations et entre milieux professionnels. Ce cours clarifie quand employer tu et vous, comment passer de l’un à l’autre, et comment circuler entre français familier, courant et soutenu dans le vocabulaire, la grammaire et la prononciation.',
  ),
  outcomes: [
    b('Choose tu or vous in each situation', 'Choisir tu ou vous selon la situation'),
    b('Propose or accept switching to tu', 'Proposer ou accepter le tutoiement'),
    b('Recognise familiar, standard and formal French', 'Reconnaître les registres familier, courant et soutenu'),
    b('Adapt your French to your listener', 'Adapter son français à son interlocuteur'),
  ],
};

const C = 'c-registers';
export default [
  lesson(C, 1, ['tu-or-vous', 'tu-ou-vous'],
    b('Tu or vous?', 'Tu ou vous ?'),
    b('Know the default rules and their regional and professional variations.', 'Connaître les règles par défaut et leurs variations régionales et professionnelles.'),
    [b('Apply the default rule', 'Appliquer la règle par défaut'), b('Know the variations', 'Connaître les variations'), b('When in doubt, choose', 'Choisir en cas de doute')],
    13,
    [
      card(b('The basic rule', 'La règle de base'), b('**Vous**: strangers, older people, customers, hierarchy, formal settings. **Tu**: family, friends, children, people your age in relaxed settings, often colleagues. **When in doubt, use vous** and let the other person offer **tu**.', '**Vous** : inconnus, personnes plus âgées, clients, hiérarchie, contextes formels. **Tu** : famille, amis, enfants, personnes de votre âge dans un cadre détendu, souvent les collègues. **En cas de doute, dites vous** et laissez l’autre proposer le **tu**.')),
      culture(b('It varies!', 'Ça varie !'), b('In **Québec**, **tu** is much more common, even with strangers in shops or with a boss. In **France**, many companies use **tu** between colleagues (start-ups, tech), but **vous** remains the norm with clients and in administrations. In **Switzerland** and **Belgium**, **vous** is generally kept longer.', 'Au **Québec**, le **tu** est beaucoup plus courant, même avec des inconnus en magasin ou avec un patron. En **France**, beaucoup d’entreprises se tutoient entre collègues (start-up, tech), mais le **vous** reste la norme avec les clients et dans les administrations. En **Suisse** et en **Belgique**, on garde généralement le **vous** plus longtemps.'), { variant: 'culture' }),
      sort(b('Tu or vous by default (France)?', 'Tu ou vous par défaut (France) ?'), [b('tu', 'tu'), b('vous', 'vous')], [['ta petite cousine', 0], ['le médecin', 1], ['un ami d’ami à une fête, même âge', 0], ['la directrice de l’école de ton fils', 1], ['un enfant de huit ans', 0], ['l’agent au guichet de la préfecture', 1]]),
      mc(P.best, ['Bonjour madame, est-ce que vous auriez ce modèle en taille 40 ?', 'Salut, t’as ce modèle en 40 ?', 'Hé, tu l’as en 40, toi ?', 'Ouais, le 40, tu l’as ?'], { fr: 'Dans une boutique à Paris, vous parlez à une vendeuse d’une soixantaine d’années :' }),
      mc(P.best, ['Vous, par défaut, et j’attends qu’on me propose le tu.', 'Tu, toujours, c’est plus sympa.', 'Ni tu ni vous, j’évite de parler.', 'Tu avec le chef, vous avec les autres.'], { fr: 'Premier jour dans une banque traditionnelle à Genève :' }),
      pairs(P.match, [['tutoyer', b('to use « tu »', 'dire tu')], ['vouvoyer', b('to use « vous »', 'dire vous')], ['la hiérarchie', b('the hierarchy', 'les supérieurs')], ['en cas de doute', b('when in doubt', 'si on hésite')]]),
      say('En cas de doute, je vouvoie, et j’attends qu’on me propose de passer au tu.', 'When in doubt, I use vous, and wait to be offered tu.'),
    ],
    [
      b('Vous: strangers, elders, clients, hierarchy. Tu: family, friends, children, peers.', 'Vous : inconnus, aînés, clients, hiérarchie. Tu : famille, amis, enfants, pairs.'),
      b('Québec uses tu more; Switzerland and Belgium keep vous longer.', 'Le Québec tutoie davantage ; la Suisse et la Belgique gardent le vous plus longtemps.'),
      b('When in doubt: vous.', 'En cas de doute : vous.'),
    ],
    [['la préfecture', b('the prefecture (administration)', 'bureau de l’État')], ['un pair', b('a peer', 'personne de même statut')], ['un aîné', b('an elder', 'personne plus âgée')]],
  ),
  lesson(C, 2, ['switching-to-tu', 'passer-au-tu'],
    b('Switching to tu', 'Passer au tu'),
    b('Offer, accept or politely decline the switch from vous to tu.', 'Proposer, accepter ou décliner poliment le passage du vous au tu.'),
    [b('Offer to switch', 'Proposer le tutoiement'), b('Accept the switch', 'Accepter le tutoiement'), b('Handle a mistake', 'Gérer une erreur')],
    13,
    [
      card(b('Switching', 'Passer au tu'), b('Offer: **On peut se tutoyer, si tu veux… euh, si vous voulez !** · **On se dit tu ?** · **Tu peux me tutoyer, hein !** Accept: **Avec plaisir !** · **D’accord, volontiers !** If you slip: **Oh pardon, je vous ai tutoyé !** — **Pas de souci, on peut se tutoyer.**', 'Proposer : **On peut se tutoyer, si tu veux… euh, si vous voulez !** · **On se dit tu ?** · **Tu peux me tutoyer, hein !** Accepter : **Avec plaisir !** · **D’accord, volontiers !** En cas d’erreur : **Oh pardon, je vous ai tutoyé !** — **Pas de souci, on peut se tutoyer.**')),
      tip(b('Who offers?', 'Qui propose ?'), b('Traditionally, the **older** person or the one **higher in the hierarchy** offers **tu**. If your boss says **« Tu peux me tutoyer »**, accept: refusing could seem cold.', 'Traditionnellement, c’est la personne **plus âgée** ou **plus haut placée** qui propose le **tu**. Si votre patron dit **« Tu peux me tutoyer »**, acceptez : refuser pourrait paraître froid.')),
      mc(P.best, ['Avec plaisir ! Alors, tu as passé un bon week-end ?', 'Non, je préfère vous dire vous pour toujours.', 'Pourquoi ?', 'D’accord, mais vous, vous me vouvoyez.'], { fr: 'Votre nouvelle cheffe : « On peut se tutoyer, ce sera plus simple ! »' }),
      mc(P.best, ['Oh pardon, je vous ai tutoyée ! Excusez-moi.', 'Tant pis, je continue.', 'Ce n’est pas grave, tu ne comprends pas.', 'Je dis ce que je veux.'], { fr: 'Vous avez tutoyé par erreur une cliente âgée :' }),
      dlg(b('After the meeting', 'Après la réunion'), undefined, [['M. Lefèvre', 'm'], ['Vous', 'f']], [
        [0, 'Merci pour votre présentation, c’était très clair. Au fait, on travaille ensemble depuis six mois, on peut se tutoyer, non ?', 'Thank you for your presentation, it was very clear. By the way, we’ve worked together for six months, we can use tu, can’t we?'],
        [1, { options: ['Volontiers ! Merci, Jean. Tu as eu le temps de lire mon rapport ?', 'Non merci, monsieur Lefèvre.', 'Si vous voulez, mais je continue à vous vouvoyer.'] }],
        [0, 'Oui, je l’ai lu hier. Bravo !', 'Yes, I read it yesterday. Well done!'],
      ]),
      pairs(P.match, [['On se dit tu ?', b('Shall we use tu?', 'proposer le tutoiement')], ['volontiers', b('gladly', 'avec plaisir')], ['par erreur', b('by mistake', 'sans le vouloir')], ['haut placé', b('senior, high-ranking', 'important dans la hiérarchie')]]),
      say('On travaille ensemble depuis longtemps. On peut se tutoyer, si tu veux… euh, si vous voulez !', 'We’ve worked together for a long time. We can use tu, if you like… er, if you like!'),
    ],
    [
      b('Offer: On peut se tutoyer ? On se dit tu ?', 'Proposer : On peut se tutoyer ? On se dit tu ?'),
      b('The elder or the senior person usually offers.', 'La personne plus âgée ou plus haut placée propose en général.'),
      b('Mistake: Pardon, je vous ai tutoyé(e) !', 'Erreur : Pardon, je vous ai tutoyé(e) !'),
    ],
    [['une présentation', b('a presentation', 'exposé')], ['un rapport', b('a report', 'document de travail')], ['froid', b('cold, distant', 'pas chaleureux')]],
  ),
  lesson(C, 3, ['familiar-standard-formal', 'familier-courant-soutenu'],
    b('Familiar, standard, formal', 'Familier, courant, soutenu'),
    b('Recognise the three registers and choose the right one.', 'Reconnaître les trois registres et choisir le bon.'),
    [b('Recognise familiar French', 'Reconnaître le français familier'), b('Rephrase in standard and formal French', 'Reformuler en courant et en soutenu'), b('Match register to situation', 'Accorder registre et situation')],
    13,
    [
      card(b('Three registers', 'Trois registres'), b('Familiar: **T’as vu ? J’sais pas. C’est ouf. Je bosse.** Standard: **Tu as vu ? Je ne sais pas. C’est fou. Je travaille.** Formal: **Avez-vous vu ? Je l’ignore. C’est extraordinaire. J’exerce une activité professionnelle.**', 'Familier : **T’as vu ? J’sais pas. C’est ouf. Je bosse.** Courant : **Tu as vu ? Je ne sais pas. C’est fou. Je travaille.** Soutenu : **Avez-vous vu ? Je l’ignore. C’est extraordinaire. J’exerce une activité professionnelle.**'), {
        table: { head: [b('familiar', 'familier'), b('standard', 'courant'), b('formal', 'soutenu')], rows: [['bosser', 'travailler', 'exercer'], ['une bagnole', 'une voiture', 'un véhicule'], ['T’es où ?', 'Tu es où ?', 'Où êtes-vous ?'], ['J’sais pas.', 'Je ne sais pas.', 'Je l’ignore.']] },
      }),
      sort(b('Which register?', 'Quel registre ?'), [b('familiar', 'familier'), b('standard', 'courant'), b('formal', 'soutenu')], [['C’est ouf !', 0], ['C’est incroyable.', 1], ['C’est proprement stupéfiant.', 2], ['J’ai la flemme.', 0], ['Je n’ai pas envie.', 1], ['Je n’en éprouve guère le désir.', 2]]),
      mc(P.best, ['Je vous prie de bien vouloir m’excuser pour ce retard.', 'Désolé, j’étais à la bourre.', 'Oups, retard, sorry !', 'J’suis en r’tard, c’est pas ma faute.'], { fr: 'Un courriel à un jury de recrutement :' }),
      mc(P.best, ['T’inquiète, j’arrive dans cinq minutes !', 'Je vous prie de bien vouloir patienter cinq minutes.', 'Veuillez agréer mes salutations, j’arrive.', 'Je l’ignore, mais j’arrive.'], { fr: 'Un SMS à votre meilleur ami :' }),
      pairs(P.match, [['bosser', 'travailler'], ['une bagnole', 'une voiture'], ['avoir la flemme', 'ne pas avoir envie'], ['être à la bourre', 'être en retard']], true),
      say('Je ne sais pas, mais je vais me renseigner et je vous tiens au courant.', 'I don’t know, but I’ll find out and keep you posted.'),
    ],
    [
      b('Familiar: dropped ne, contractions (t’as, j’sais), slang (bosser, ouf).', 'Familier : ne omis, contractions (t’as, j’sais), argot (bosser, ouf).'),
      b('Standard: everyday correct French.', 'Courant : français correct de tous les jours.'),
      b('Formal: inversion, rich vocabulary (je l’ignore, véhicule).', 'Soutenu : inversion, vocabulaire recherché (je l’ignore, véhicule).'),
    ],
    [['ouf', b('crazy (verlan of fou)', 'fou, familier')], ['la flemme', b('laziness (informal)', 'manque d’envie')], ['se renseigner', b('to find out', 'chercher l’information')]],
  ),
];
