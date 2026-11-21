import type { CourseAbout } from '../../types';
import { b, card, dict, doc, gap, lesson, mc, ord, P, pairs, say, sort, tip } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Le pont a été construit en 1930. La réunion est annulée. The passive voice puts the focus on what undergoes the action: it is everywhere in news, official notices, reports and history. This course teaches its formation with être in every tense, the agent with par or de, and the alternatives French often prefers: on, and pronominal verbs (ça se vend bien).',
    'Le pont a été construit en 1930. La réunion est annulée. La voix passive met en avant ce qui subit l’action : on la trouve partout dans l’actualité, les avis officiels, les rapports et l’histoire. Ce cours présente sa formation avec être à tous les temps, le complément d’agent avec par ou de, et les tournures que le français préfère souvent : on, et les verbes pronominaux (ça se vend bien).',
  ),
  outcomes: [
    b('Form the passive in the present, past and future', 'Former le passif au présent, au passé et au futur'),
    b('Introduce the agent with par or de', 'Introduire l’agent avec par ou de'),
    b('Agree the past participle', 'Accorder le participe passé'),
    b('Choose between passive, on and the pronominal form', 'Choisir entre passif, on et forme pronominale'),
  ],
};

const C = 'passive-voice';
export default [
  lesson(C, 1, ['forming-the-passive', 'former-le-passif'],
    b('Forming the passive', 'Former le passif'),
    b('Être in the right tense + past participle agreeing with the subject.', 'Être au temps voulu + participe passé accordé avec le sujet.'),
    [b('Turn an active sentence into a passive one', 'Transformer une phrase active en phrase passive'), b('Conjugate être in every tense', 'Conjuguer être à tous les temps'), b('Agree the participle', 'Accorder le participe')],
    13,
    [
      card(b('Active → passive', 'Actif → passif'), b('The object becomes the subject, the verb becomes **être + past participle** (agreeing with the new subject), the old subject becomes the agent with **par**: **La police arrête le voleur.** → **Le voleur est arrêté par la police.**', 'Le complément devient sujet, le verbe devient **être + participe passé** (accordé avec le nouveau sujet), l’ancien sujet devient complément d’agent avec **par** : **La police arrête le voleur.** → **Le voleur est arrêté par la police.**'), {
        ex: [['Les lettres sont distribuées le matin.', 'Letters are delivered in the morning.'], ['La décision a été prise hier.', 'The decision was taken yesterday.'], ['Les résultats seront publiés lundi.', 'The results will be published on Monday.']],
      }),
      tip(b('The tense is carried by être', 'Le temps est porté par être'), b('Present **est construit**, passé composé **a été construit**, imparfait **était construit**, future **sera construit**, conditional **serait construit**.', 'Présent **est construit**, passé composé **a été construit**, imparfait **était construit**, futur **sera construit**, conditionnel **serait construit**.')),
      mc(P.best, ['Le contrat a été signé par les deux parties.', 'Le contrat a signé par les deux parties.', 'Le contrat est été signé par les deux parties.', 'Le contrat a été signée par les deux parties.']),
      mc(P.form, ['seront livrées', 'seront livrés', 'serons livrées', 'sont livré'], { fr: 'Vos commandes ___ demain matin.' }),
      mc(P.form, ['a été élue', 'a été élu', 'est été élue', 'a élue'], { fr: 'La nouvelle mairesse ___ dimanche.' }),
      gap(P.complete, 'Ce tableau ___ ___ (peindre) par Riopelle en 1952.', ['a', ['été peint']], { hint: b('Passé composé of the passive.', 'Passé composé du passif.') }),
      ord(P.order, 'Le vol a été annulé à cause de la neige.', { tr: 'The flight was cancelled because of the snow.' }),
      dict('Les nouveaux employés seront accueillis par la directrice.', { voice: 'f' }),
    ],
    [
      b('Passive = être (any tense) + past participle + (par + agent).', 'Passif = être (au temps voulu) + participe passé + (par + agent).'),
      b('The participle agrees with the subject: la loi a été votée.', 'Le participe s’accorde avec le sujet : la loi a été votée.'),
      b('Passé composé passive: a été + participle.', 'Passé composé passif : a été + participe.'),
    ],
    [['une commande', b('an order', 'achat demandé')], ['élire', b('to elect', 'choisir par un vote')], ['accueillir', b('to welcome', 'recevoir')]],
  ),
  lesson(C, 2, ['par-or-de-and-no-agent', 'par-ou-de-et-sans-agent'],
    b('Par, de, or no agent at all', 'Par, de, ou pas d’agent du tout'),
    b('Introduce the agent with par or de, or leave it out.', 'Introduire l’agent avec par ou de, ou l’omettre.'),
    [b('Use par for an action', 'Employer par pour une action'), b('Use de with feelings and states', 'Employer de avec les sentiments et les états'), b('Read official notices', 'Lire des avis officiels')],
    13,
    [
      card(b('Par or de?', 'Par ou de ?'), b('**par** for a concrete action: **Il a été mordu par un chien.** **de** with verbs of feeling or state: **être aimé de, être respecté de, être entouré de, être couvert de**: **La ville est entourée de montagnes.**', '**par** pour une action concrète : **Il a été mordu par un chien.** **de** avec les verbes de sentiment ou d’état : **être aimé de, être respecté de, être entouré de, être couvert de** : **La ville est entourée de montagnes.**'), {
        ex: [['Ce professeur est apprécié de tous ses élèves.', 'This teacher is appreciated by all his students.'], ['La table était couverte de papiers.', 'The table was covered with papers.']],
      }),
      card(b('No agent: the official style', 'Sans agent : le style officiel'), b('Notices, news and rules often omit the agent: **Il est interdit de fumer. Les animaux ne sont pas admis. Le bureau est fermé le lundi.**', 'Les avis, l’actualité et les règlements omettent souvent l’agent : **Il est interdit de fumer. Les animaux ne sont pas admis. Le bureau est fermé le lundi.**')),
      mc(P.word, ['de', 'par', 'avec', 'à'], { fr: 'Le chalet est entouré ___ forêts.' }),
      mc(P.word, ['par', 'de', 'avec', 'pour'], { fr: 'La lettre a été écrite ___ le directeur lui-même.' }),
      doc({ title: b('Notice', 'Avis'), text: 'AVIS AUX RÉSIDENTS — En raison de travaux, l’eau sera coupée le jeudi 14 mars de 9 h à 15 h. Les véhicules stationnés devant l’immeuble seront remorqués. Merci de votre compréhension. La gestion' }, P.read, [b('Cars parked in front will be towed away.', 'Les voitures garées devant seront remorquées.'), b('Water will be cut all week.', 'L’eau sera coupée toute la semaine.'), b('The residents must do the work.', 'Les résidents doivent faire les travaux.'), b('Parking is free on Thursday.', 'Le stationnement est gratuit jeudi.')]),
      pairs(P.match, [['est interdit', b('is forbidden', 'n’est pas permis')], ['sont admis', b('are allowed', 'sont acceptés')], ['sera coupée', b('will be cut off', 'ne fonctionnera pas')], ['seront remorqués', b('will be towed away', 'seront enlevés par une dépanneuse')]]),
      gap(P.complete, 'Cette chanteuse est adorée ___ son public, mais elle a été critiquée ___ les journalistes.', ['de', 'par']),
      say('Le musée est fermé le lundi et les photos ne sont pas autorisées.', 'The museum is closed on Mondays and photos are not allowed.'),
    ],
    [
      b('par + agent of a concrete action; de + agent with feelings and states.', 'par pour une action concrète ; de avec les sentiments et les états.'),
      b('Official style: agent omitted (Il est interdit de…).', 'Style officiel : agent omis (Il est interdit de…).'),
      b('être entouré de, couvert de, rempli de, aimé de, respecté de.', 'être entouré de, couvert de, rempli de, aimé de, respecté de.'),
    ],
    [['remorquer', b('to tow away', 'enlever un véhicule')], ['la gestion', b('the management', 'l’administration')], ['mordre', b('to bite', 'attaquer avec les dents')]],
  ),
  lesson(C, 3, ['alternatives-to-the-passive', 'alternatives-au-passif'],
    b('On and se: what French often prefers', 'On et se : ce que le français préfère souvent'),
    b('Replace the passive with on or a pronominal verb, and choose the right style.', 'Remplacer le passif par on ou un verbe pronominal, et choisir le bon registre.'),
    [b('Use on instead of a passive', 'Employer on au lieu d’un passif'), b('Use the pronominal passive (ça se dit)', 'Employer le passif pronominal (ça se dit)'), b('Adapt to the register', 'S’adapter au registre')],
    13,
    [
      card(b('On', 'On'), b('Without an agent, spoken French prefers **on**: **On m’a volé mon vélo** (rather than « mon vélo a été volé »). **On a annoncé la nouvelle hier.** Note: verbs like **donner, demander, dire, permettre** cannot have a person as passive subject: **On m’a donné** (not « j’ai été donné »).', 'Sans agent, l’oral préfère **on** : **On m’a volé mon vélo**. **On a annoncé la nouvelle hier.** Attention : avec **donner, demander, dire, permettre**, une personne ne peut pas être sujet d’un passif : **On m’a donné** (et non « j’ai été donné »).'), {
        ex: [['On m’a proposé un poste à Ottawa.', 'I was offered a job in Ottawa.'], ['On parle français ici.', 'French is spoken here.']],
      }),
      card(b('Se + verb: general truths', 'Se + verbe : vérités générales'), b('For habits and general truths: **Ça se dit. Le vin blanc se boit frais. Ce livre se vend bien. Ça ne se fait pas.**', 'Pour les usages et vérités générales : **Ça se dit. Le vin blanc se boit frais. Ce livre se vend bien. Ça ne se fait pas.**'), {
        ex: [['Ce plat se mange chaud.', 'This dish is eaten hot.'], ['Ça ne se fait pas d’arriver en retard.', 'Arriving late is not done.']],
      }),
      sort(b('Spoken style or formal style?', 'Style oral ou style soutenu ?'), [b('everyday (on / se)', 'courant (on / se)'), b('formal (passive)', 'soutenu (passif)')], [['On a réparé la route.', 0], ['La route a été réparée.', 1], ['Ça se vend bien.', 0], ['Ce produit est très demandé.', 1], ['On m’a dit que…', 0], ['Il a été annoncé que…', 1]]),
      mc(P.best, ['On m’a demandé mon passeport.', 'J’ai été demandé mon passeport.', 'Mon passeport m’a été demandé par on.', 'Je me suis demandé mon passeport.']),
      mc(P.meaning, [b('Garlic is not usually eaten raw.', 'L’usage veut qu’on ne mange pas l’ail cru.'), b('Garlic does not eat itself.', 'L’ail ne se nourrit pas.'), b('Garlic was not eaten.', 'L’ail n’a pas été mangé.'), b('Garlic must be eaten raw.', 'L’ail doit être mangé cru.')], { fr: 'L’ail ne se mange pas cru, en général.' }),
      gap(P.complete, 'Ici, ___ parle français et anglais. Ce mot ne ___ dit plus beaucoup.', ['on', 'se']),
      ord(P.order, 'Ce genre de chose ne se fait pas.', { tr: 'That kind of thing isn’t done.' }),
      say('On m’a offert un poste, mais la décision sera prise lundi.', 'I was offered a position, but the decision will be made on Monday.'),
    ],
    [
      b('Spoken French prefers on to the passive: On m’a volé mon vélo.', 'L’oral préfère on au passif : On m’a volé mon vélo.'),
      b('donner, dire, demander: On m’a donné… (never « j’ai été donné »).', 'donner, dire, demander : On m’a donné… (jamais « j’ai été donné »).'),
      b('se + verb for general truths: ça se dit, ça ne se fait pas.', 'se + verbe pour les vérités générales : ça se dit, ça ne se fait pas.'),
    ],
    [['voler', b('to steal; to fly', 'dérober ; se déplacer dans les airs')], ['un poste', b('a position, a job', 'un emploi')], ['cru', b('raw', 'non cuit')]],
  ),
];
