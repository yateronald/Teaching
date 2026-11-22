import type { CourseAbout } from '../../types';
import { b, card, culture, dict, dlg, hear, lesson, mc, P, pairs, sort, trap } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Morning satire columns and live French talk radio move at breakneck speed: a deadpan commentator praises a traffic jam, two co-hosts spin a pun out of a ministry’s slogan, and a guest slips in a literary wink mid-sentence. Missing the irony means understanding the exact opposite of what aired. This C2 course trains you to catch deadpan antiphrasis, live wordplay and rapid cultural banter.',
    'Les chroniques satiriques matinales et la radio en direct filent à vive allure : un humoriste vante pince-sans-rire les embouteillages, deux chroniqueurs filent un calembour, un invité glisse un clin d’œil littéraire au vol. Manquer l’ironie, c’est comprendre le contraire exact de l’émission. Ce cours de niveau C2 vous entraîne à saisir antiphrase à froid, doubles sens et reparties culturelles en direct.',
  ),
  outcomes: [
    b('Decode deadpan satire, mock seriousness and antiphrasis on air', 'Décoder satire pince-sans-rire, fausse gravité et antiphrase'),
    b('Catch puns, portmanteaus and double meanings at live radio speed', 'Saisir calembours, mots-valises et doubles sens en direct'),
    b('Follow overlapping banter, comebacks and extended metaphors', 'Suivre échanges vifs, reparties et métaphores filées'),
    b('Recognise implicit cultural, historical and literary allusions', 'Reconnaître allusions culturelles, historiques et littéraires'),
  ],
};

const C = 'l-satire-live-radio';
export default [
  lesson(C, 1, ['deadpan-satire-and-antiphrasis', 'satire-et-antiphrase-a-froid'],
    b('Deadpan satire and antiphrasis on air', 'Satire pince-sans-rire et antiphrase'),
    b('Recognise when a solemn radio voice means the exact opposite of its words.', 'Reconnaître quand une voix grave à la radio signifie l’exact contraire de ses mots.'),
    [b('Spot mock praise and faux bureaucratic tone', 'Repérer faux éloges et pastiche administratif'), b('Catch subtle incongruities in deadpan delivery', 'Capter le décalage dans un ton pince-sans-rire'), b('Separate genuine news from satirical parody', 'Distinguer information réelle et chronique satirique')],
    13,
    [
      card(b('How deadpan radio works', 'Mécanique du pince-sans-rire'), b('A **chroniqueur pince-sans-rire** (deadpan satirist) adopts a perfectly serious newscaster tone while sliding into absurdity: praising a **progrès fulgurant** (meteoric progress) right before describing a broken system, or calling a three-hour delay **une expérience contemplative** (a contemplative experience). The **contrast between register and reality** is your main clue.', 'Le **chroniqueur pince-sans-rire** adopte un ton d’information grave tout en glissant vers l’absurde : saluer un **progrès fulgurant** pour décrire une panne, ou qualifier trois heures d’attente d’**expérience contemplative**. Le **décalage entre registre noble et réalité triviale** est le signal clé.'), {
        ex: [['Saluons ce progrès majeur : l’imprimante du ministère a fonctionné mardi.', 'Let us hail this major breakthrough: the ministry printer worked on Tuesday.'], ['Une panne d’une rare élégance.', 'An outage of rare elegance.']],
      }),
      trap(b('Don’t rely on laughter cues', 'Ne comptez pas sur les rires'), b('French satirical radio often avoids studio laugh tracks. When the host says **C’est admirable** with a straight face, only the absurd detail that follows reveals the **antiphrasis**.', 'La satire radiophonique française évite souvent les rires enregistrés. Quand l’animateur dit **C’est admirable** d’une voix neutre, seul le détail absurde qui suit révèle l’**antiphrase**.')),
      hear('Saluons le génie administratif de notre mairie : pour simplifier la vie des usagers, le formulaire de deux pages vient d’être remplacé par une plateforme en ligne qui exige dix-huit pièces jointes et plante à l’étape dix-sept.', b('What is the columnist actually doing?', 'Que fait réellement le chroniqueur ?'), [b('Mocking a supposed simplification that made the process worse', 'Il se moque d’une prétendue simplification qui complique tout'), b('Congratulating the city hall for an efficient portal', 'Il félicite sincèrement la mairie pour un portail efficace'), b('Explaining how to attach eighteen files properly', 'Il explique sérieusement comment joindre dix-huit fichiers'), b('Announcing the closure of the municipal website', 'Il annonce la fermeture définitive du site municipal')], { voice: 'm' }),
      hear('Quel luxe sur la ligne B ce matin : grâce à la climatisation en panne, chacun a pu profiter gratuitement d’un sauna collectif dès huit heures.', b('What is the real situation on train line B?', 'Quelle est la situation réelle sur la ligne B ?'), [b('The air conditioning broke down and the train was unbearably hot', 'La climatisation est en panne et il fait une chaleur étouffante'), b('The transit authority installed free spa cars', 'La régie a installé de vrais saunas gratuits'), b('The line was closed for maintenance at eight', 'La ligne était fermée pour travaux à huit heures'), b('Passengers received free drinks for the delay', 'Les voyageurs ont reçu des boissons gratuites')], { voice: 'f' }),
      hear('Le ministre assure que la réforme est parfaitement claire : preuve en est qu’il a fallu trois décrets et quarante pages d’annexes pour expliquer la première phrase.', b('Why does she cite « three decrees and forty pages »?', 'Pourquoi cite-t-elle « trois décrets et quarante pages » ?'), [b('To show ironically that the reform is hopelessly convoluted', 'Pour montrer ironiquement que la réforme est incompréhensible'), b('To prove how thorough and concise the text is', 'Pour prouver la clarté et la brièveté du texte'), b('To complain that forty pages is too short', 'Pour regretter que quarante pages soient insuffisantes'), b('To summarise the minister’s biography', 'Pour résumer la biographie du ministre')], { voice: 'f2' }),
      pairs(P.match, [['pince-sans-rire', b('deadpan, straight-faced', 'qui plaisante sans sourire')], ['l’antiphrase', b('saying the opposite of what one means', 'figure disant le contraire du réel')], ['le décalage', b('mismatch, discrepancy', 'écart comique ou absurde')], ['un usager', b('a public-service user', 'personne qui utilise un service')]]),
      dict('Saluons cette simplification qui exige dix-huit pièces jointes.', { voice: 'm2' }),
    ],
    [
      b('Deadpan satire pairs noble/official vocabulary with trivial absurdity.', 'La satire à froid marie style soutenu et réalité absurde.'),
      b('Antiphrasis means the exact opposite of the literal praise.', 'L’antiphrase dit le contraire exact de l’éloge littéral.'),
      b('Listen past the straight face for the absurd factual twist.', 'Guettez le détail absurde qui suit la voix sérieuse.'),
    ],
    [['pince-sans-rire', b('deadpan, tongue-in-cheek', 'moqueur sans en avoir l’air')], ['l’antiphrase', b('ironic opposite phrasing', 'dire oui pour signifier non')], ['fulgurant', b('meteoric, dazzling', 'extrêmement rapide')]],
  ),
  lesson(C, 2, ['double-meanings-and-spoonerisms', 'doubles-sens-et-jeux-sonores'],
    b('Double meanings, zeugma and live wordplay', 'Doubles sens, zeugmes et jeux sonores'),
    b('Catch puns, homophones, portmanteaus and double triggers in radio banter.', 'Saisir calembours, homophones, mots-valises et phrases à double détente.'),
    [b('Unpack homophonic puns and double meanings', 'Décomposer calembours et doubles sens'), b('Recognise zeugma and portmanteau coinages (mot-valise)', 'Reconnaître zeugmes et mots-valises'), b('Catch the second meaning behind a fast punchline', 'Capter le second sens d’une chute rapide')],
    13,
    [
      card(b('Tools of live wordplay', 'Les ressorts du jeu de mots'), b('Live commentators love **le double sens** (one phrase, two meanings: **Il a pris la porte** = he left angrily / he literally stole a door), **le mot-valise** (blending two words: **infox**, **courriel**, **divulgâcher**), and **le zeugme** (linking concrete and abstract with one verb: **Il a posé son manteau et une question embarrassante**).', 'Les chroniqueurs jouent sur **le double sens** (**Il a pris la porte**), **le mot-valise** (fusion de deux mots : **infox**, **divulgâcher**), et **le zeugme** (un seul verbe pour du concret et de l’abstrait : **Il a posé son manteau et une question gênante**).'), {
        ex: [['Le ministre a pris son parapluie et la fuite.', 'The minister took his umbrella and took flight. (zeugma)'], ['Une promesse à double détente.', 'A double-barrelled promise.']],
      }),
      hear('Ce plan d’économies est tellement ambitieux que la commission a perdu à la fois son calme et ses dossiers.', b('What makes this sentence witty?', 'Quel procédé crée l’effet comique ici ?'), [b('A zeugma yoking abstract « calm » and physical « files » to the verb « lost »', 'Un zeugme reliant « son calme » et « ses dossiers » au verbe perdre'), b('A spelling mistake in the committee’s name', 'Une faute d’orthographe sur le nom de la commission'), b('An accent imitation from southern France', 'Une imitation d’accent du Sud'), b('A solemn compliment to the committee’s memory', 'Un hommage sérieux à la mémoire de la commission')], { voice: 'f2' }),
      hear('On nous promet une « sobriété festive » : joli mot-valise pour expliquer qu’il n’y aura ni chauffage ni dessert au banquet.', b('What is she mocking with « sobriété festive »?', 'De quoi se moque-t-elle avec « sobriété festive » ?'), [b('Spinning budget cuts as a cheerful theme', 'D’un habillage positif pour masquer des coupes'), b('A new champagne brand launched at the banquet', 'D’une nouvelle marque de champagne au banquet'), b('A classical poem read before dinner', 'D’un poème classique lu avant le dîner'), b('Overeating at official ceremonies', 'Des excès de table aux cérémonies')], { voice: 'm2' }),
      mc(P.meaning, [b('She literally means both: the budget has no money and no moral backbone.', 'Double sens : ni moyens financiers ni courage.'), b('She is praising the transparency of the ministry’s accounts.', 'Elle salue la transparence comptable du ministère.'), b('She forgot the French word for paper money.', 'Elle a oublié le nom de la monnaie.'), b('She wants to print bills on heavier paper.', 'Elle veut imprimer des billets plus épais.')], { fr: '« Ce budget manque singulièrement de fonds comme de fond. »' }),
      sort(b('Literal statement or double-meaning punchline?', 'Énoncé littéral ou trait à double sens ?'), [b('literal / neutral', 'sens littéral / neutre'), b('double meaning / wordplay', 'double sens / jeu de mots')], [['Il a fermé la porte à clé.', 0], ['Il a pris son chapeau et la porte.', 1], ['La réunion commence à neuf heures.', 0], ['Un discours plein de vide et de vent.', 1], ['Le texte compte quatre articles.', 0], ['Il perd souvent son temps et son train.', 1]], { listen: true }),
      pairs(P.match, [['un mot-valise', b('a portmanteau word', 'mot né de deux mots fusionnés')], ['un zeugme', b('zeugma (concrete + abstract link)', 'alliance d’un sens concret et abstrait')], ['à double détente', b('with a delayed second punchline', 'qui agit en deux temps')], ['la chute', b('the punchline / ending twist', 'dernière phrase qui fait rire')]]),
      dict('La commission a perdu à la fois son calme et ses dossiers.', { voice: 'f' }),
    ],
    [
      b('Zeugma pairs concrete + abstract on one verb (perdre son calme et ses clés).', 'Le zeugme unit concret et abstrait sur un même verbe.'),
      b('Fonds (funds) vs fond (substance/depth) is a classic C2 homophone play.', 'Fonds / fond : jeu classique d’homophones.'),
      b('la chute = the punchline that flips the sentence.', 'la chute = le trait final qui retourne le sens.'),
    ],
    [['un zeugme', b('a zeugma', 'figure joignant concret et abstrait')], ['la chute', b('the punchline', 'fin surprenante d’un trait d’esprit')], ['un mot-valise', b('a portmanteau', 'fusion de deux mots')]],
  ),
  lesson(C, 3, ['rapid-banter-and-allusions', 'reparties-et-allusions-culturelles'],
    b('Rapid banter, interruptions and cultural allusions', 'Reparties rapides et allusions culturelles'),
    b('Follow fast studio banter, word-bouncing and literary or historical winks.', 'Suivre ping-pong verbal en studio, rebonds et clins d’œil culturels.'),
    [b('Track rapid repartee (renvoyer la balle, prendre au mot)', 'Suivre les reparties rapides (renvoyer la balle, prendre au mot)'), b('Spot implicit literary and historical allusions', 'Repérer allusions littéraires et historiques implicites'), b('Stay oriented when hosts talk over each other', 'Garder le fil lors d’échanges vifs en direct')],
    13,
    [
      card(b('Banter and allusions', 'Reparties et clins d’œil'), b('On live French radio, hosts **se renvoient la balle** (bounce jokes back and forth) and **prennent au mot** (take someone literally) within half a second. They also slip in **clins d’œil** (nods) to Molière, La Fontaine, Hugo or cinema—e.g. **C’est l’Arlésienne !** (something talked about endlessly that never arrives) or **un travail de Sisyphe** (endless futile task).', 'En direct, les chroniqueurs **se renvoient la balle** et se **prennent au mot** en une demi-seconde. Ils glissent aussi des **clins d’œil** à Molière, La Fontaine ou au cinéma : **C’est l’Arlésienne !** (ce qu’on attend sans jamais le voir) ou **un rocher de Sisyphe** (tâche interminable).'), {
        ex: [['Cette ligne de métro, c’est vraiment l’Arlésienne du quartier.', 'That metro line is truly the neighbourhood’s phantom promise.'], ['À vouloir tout corriger chaque matin, c’est le tonneau des Danaïdes.', 'Trying to fix it every morning is an endless bottomless pit.']],
      }),
      culture(b('Allusions that carry an entire paragraph', 'Une allusion résume tout un paragraphe'), b('When a host sighs **« Après nous le déluge »** or **« Tout va très bien, madame la marquise »**, one short phrase signals reckless optimism in the face of disaster without spelling it out.', 'Quand un animateur soupire **« Tout va très bien, madame la marquise »**, une seule chanson évoquée suffit à dénoncer un optimisme aveugle face à la catastrophe.')),
      hear('Cette réforme de la gare, on nous la promet depuis 1998 : ce n’est même plus un chantier, c’est devenu l’Arlésienne officielle de la région.', b('What does « l’Arlésienne » mean about the station project?', 'Que signifie « l’Arlésienne » pour ce projet de gare ?'), [b('People have talked about it for decades, yet it never materialises', 'On en parle depuis des décennies sans jamais la voir aboutir'), b('It is inspired by paintings from Arles', 'Il s’inspire des peintures d’Arles'), b('It was finished ahead of schedule in 1998', 'Il a été achevé en avance en 1998'), b('Only tourists from Provence can use it', 'Seuls les touristes provençaux l’utilisent')], { voice: 'm' }),
      hear('— Le président dit que le dossier est bouclé. — Bouclé, oui, mais comme une valise sur laquelle on s’assoit à trois pour la fermer !', b('How does the second speaker twist the word « bouclé »?', 'Comment la seconde voix détourne-t-elle le mot « bouclé » ?'), [b('She implies it was forced shut hastily and barely holds together', 'Elle suggère qu’il a été fermé à la hâte et tient à peine'), b('She confirms the file is ready for travel abroad', 'Elle confirme que le dossier part en voyage'), b('She praises the neatness of the paperwork', 'Elle loue la propreté des documents'), b('She asks where the luggage was lost', 'Elle demande où la valise a été perdue')], { voice: 'f2' }),
      dlg(b('Morning show banter', 'Matinale radio en direct'), b('Host and satirist trade quick lines before the 8 a.m. news.', 'L’animateur et la chroniqueuse échangent en direct avant le journal de 8 h.'), [['Animateur', 'm'], ['Chroniqueuse', 'f']], [
        [0, 'Alors Chloé, ce nouveau rapport sur les retards de train, vous l’avez lu ?', 'So Chloé, did you read that new report on train delays?'],
        [1, 'En entier ! D’ailleurs, je l’ai lu dans le train, ce qui m’a largement laissé le temps de le relire trois fois.', 'Cover to cover! In fact I read it on the train, giving me plenty of time to read it three times.'],
        [0, { options: ['Rien de tel qu’une étude de terrain ! On vous retrouve demain à l’heure… si le train arrive.', 'Bravo, vous aimez lire trois fois les rapports officiels.', 'Dommage que les gares interdisent la lecture en voiture.'] }],
        [1, 'Promis, je partirai dès ce soir par prudence !', 'Promise, I’ll set off tonight just to be safe!'],
      ]),
      pairs(P.match, [['l’Arlésienne', b('something endlessly awaited, never seen', 'ce dont on parle sans jamais le voir')], ['prendre au mot', b('to take at one’s word (often literally)', 'saisir l’expression au pied de la lettre')], ['renvoyer la balle', b('to volley back a retort', 'répliquer vivement dans l’échange')], ['un clin d’œil', b('a nod / subtle allusion', 'référence complice et légère')]]),
      dict('Ce projet attendu depuis vingt ans est devenu une vraie Arlésienne.', { voice: 'f2' }),
    ],
    [
      b('l’Arlésienne = much-discussed project that never appears.', 'l’Arlésienne = projet dont on parle sans jamais le voir.'),
      b('prendre au mot / rebondir sur = twist a co-host’s exact word.', 'prendre au mot / rebondir = détourner le mot exact de l’autre.'),
      b('One cultural allusion condenses an entire critique in two seconds.', 'Une allusion culturelle condense toute une critique en deux secondes.'),
    ],
    [['l’Arlésienne', b('elusive, endlessly delayed thing', 'chose toujours annoncée, jamais venue')], ['une repartie', b('a quick witty comeback', 'réponse vive et spirituelle')], ['boucler', b('to wrap up / buckle shut', 'terminer ou fermer de force')]],
  ),
];
