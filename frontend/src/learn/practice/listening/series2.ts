// Ten more listening exercises, one per kind of spoken document the DELF and
// TCF listening papers use: a station announcement and an answering machine
// (A1); a voicemail, a radio events guide and a guided tour (A2); a personal
// account, a health podcast and a message to parents (B1); a radio editorial
// and a lecture excerpt (B2). Same format as a1.ts … b2.ts: the learner hears
// the document first, without the text; each question points to the segment
// that answers it; the transcript only appears with the answers.
import { listening } from './authoring';

export const a1Listening2 = [
  ...listening('A1', 'm2', [
    [
      "changement-de-quai",
      "Changement de quai",
      ["Annonce en gare","Station announcement"],
      ["Retrouvez le bon quai et la nouvelle heure de départ.","Find the right platform and the new departure time."],
      ["Repérer un quai, une heure et un retard.","Pick out a platform, a time and a delay."],
      ["Dans une annonce, l’information importante arrive souvent après « et non » ou après le mot « retard » : écoutez la correction.","In an announcement, the key information often comes after « et non » or after the word « retard »: listen for the correction."],
      [
        "Mesdames et messieurs, votre attention, s’il vous plaît. Le train pour Lyon de dix heures quinze part du quai numéro trois, et non du quai numéro un.",
        "Le train a dix minutes de retard. Il part à dix heures vingt-cinq.",
        "La voiture numéro huit est en tête du train. Merci et bon voyage.",
      ],
      [
        ["Où va le train ?",["À Lyon","À Lille","À Lens"],0,0,["L’annonce parle du « train pour Lyon ».","The announcement is about the « train pour Lyon »."]],
        ["De quel quai part le train ?",["Du quai un","Du quai trois","Du quai huit"],1,0,["« Quai numéro trois, et non du quai numéro un » : « et non » écarte le quai un.","« Quai numéro trois, et non du quai numéro un »: « et non » rules out platform one."]],
        ["À quelle heure part le train maintenant ?",["À dix heures quinze","À dix heures vingt-cinq","À dix heures trente-cinq"],1,1,["Dix heures quinze plus dix minutes de retard : dix heures vingt-cinq.","Ten fifteen plus a ten-minute delay: ten twenty-five."]],
        ["Où se trouve la voiture numéro huit ?",["Au milieu du train","À la fin du train","En tête du train"],2,2,["« En tête du train » veut dire à l’avant.","« En tête du train » means at the front."]],
      ],
    ],
  ]),
  ...listening('A1', 'f2', [
    [
      "le-repondeur-du-cabinet-medical",
      "Le répondeur du cabinet médical",
      ["Message de répondeur","Answering machine message"],
      ["Notez les horaires du cabinet et le numéro d’urgence.","Note the surgery’s opening hours and the emergency number."],
      ["Comprendre des jours, des heures et un numéro.","Understand days, times and a number."],
      ["Pendant l’écoute, faites un petit tableau : ouvert, fermé, rendez-vous, urgence.","While listening, make a small table: open, closed, appointments, emergency."],
      [
        "Bonjour, vous êtes bien au cabinet du docteur Martin. Le cabinet est ouvert du lundi au vendredi, de neuf heures à dix-neuf heures.",
        "Le samedi et le dimanche, le cabinet est fermé.",
        "Pour prendre rendez-vous, appelez entre neuf heures et midi. En cas d’urgence, composez le quinze.",
      ],
      [
        ["Comment s’appelle le médecin ?",["Le docteur Martin","Le docteur Martel","Le docteur Morin"],0,0,["« Le cabinet du docteur Martin ».","« Le cabinet du docteur Martin »."]],
        ["Quand le cabinet est-il fermé ?",["Le lundi","Le week-end","Le vendredi après-midi"],1,1,["Le samedi et le dimanche, c’est le week-end.","Saturday and Sunday are the weekend."]],
        ["Quand faut-il appeler pour un rendez-vous ?",["Entre neuf heures et midi","Après dix-neuf heures","Le samedi matin"],0,2,["« Appelez entre neuf heures et midi. »","« Appelez entre neuf heures et midi. »"]],
        ["Quel numéro faut-il composer en cas d’urgence ?",["Le dix-huit","Le quinze","Le dix-sept"],1,2,["En France, le quinze est le numéro des urgences médicales (le SAMU).","In France, 15 is the number for medical emergencies (the SAMU)."]],
      ],
    ],
  ]),
];

export const a2Listening2 = [
  ...listening('A2', 'f2', [
    [
      "le-plombier-passe-jeudi",
      "Le plombier passe jeudi",
      ["Message vocal","Voicemail"],
      ["Comprenez ce que la propriétaire demande à son locataire.","Understand what the landlady asks her tenant to do."],
      ["Repérer une demande, un rendez-vous et ce qu’il faut faire.","Pick out a request, an appointment and what to do."],
      ["Les actions à faire suivent souvent « vous pouvez », « pensez à » ou un verbe à l’impératif comme « rappelez-moi ».","The actions to take often follow « vous pouvez », « pensez à » or an imperative such as « rappelez-moi »."],
      [
        "Bonjour monsieur Diallo, c’est madame Roux, votre propriétaire. Je vous appelle à propos de la fuite d’eau dans la salle de bains.",
        "Le plombier peut venir jeudi matin, entre huit heures et dix heures. Si vous travaillez, ce n’est pas grave : vous pouvez laisser la clé à madame Petit, votre voisine du deuxième étage.",
        "Pendant la réparation, l’eau sera coupée pendant une heure environ. Pensez à remplir une bouteille avant.",
        "Rappelez-moi avant mercredi soir pour me dire si jeudi vous convient. Merci, et bonne journée !",
      ],
      [
        ["Pourquoi madame Roux appelle-t-elle ?",["Pour une fuite d’eau","Pour augmenter le loyer","Pour une panne d’électricité"],0,0,["Elle appelle « à propos de la fuite d’eau dans la salle de bains ».","She is calling « à propos de la fuite d’eau dans la salle de bains »."]],
        ["Quand le plombier peut-il venir ?",["Jeudi matin","Mercredi soir","Jeudi après-midi"],0,1,["« Jeudi matin, entre huit heures et dix heures ». Mercredi soir, c’est la date limite pour rappeler.","« Jeudi matin, entre huit heures et dix heures ». Wednesday evening is the deadline to call back."]],
        ["Que peut faire monsieur Diallo s’il travaille ?",["Annuler le rendez-vous","Laisser la clé à sa voisine","Laisser la porte ouverte"],1,1,["« Vous pouvez laisser la clé à madame Petit, votre voisine. »","« Vous pouvez laisser la clé à madame Petit, votre voisine. »"]],
        ["Que va-t-il se passer pendant la réparation ?",["Il n’y aura pas d’eau pendant une heure environ","Il n’y aura pas d’électricité","Il faudra quitter l’immeuble"],0,2,["« L’eau sera coupée » : il n’y aura plus d’eau au robinet. D’où le conseil de remplir une bouteille.","« L’eau sera coupée »: there will be no running water. Hence the advice to fill a bottle."]],
        ["Que doit faire monsieur Diallo avant mercredi soir ?",["Payer le plombier","Rappeler sa propriétaire","Acheter une bouteille d’eau"],1,3,["« Rappelez-moi avant mercredi soir » : elle veut savoir si jeudi lui convient.","« Rappelez-moi avant mercredi soir »: she wants to know if Thursday suits him."]],
      ],
    ],
    [
      "ce-week-end-en-ville",
      "Ce week-end en ville",
      ["Agenda radio","Radio events guide"],
      ["Choisissez une sortie pour samedi ou dimanche.","Choose an outing for Saturday or Sunday."],
      ["Associer chaque activité à un jour, un lieu et un prix.","Match each activity with a day, a place and a price."],
      ["Faites trois colonnes, quand, où et combien, et complétez-les activité par activité.","Make three columns, when, where and how much, and fill them in activity by activity."],
      [
        "Bonjour à tous, voici nos idées de sorties pour ce week-end.",
        "Samedi, le marché de Noël ouvre ses portes sur la place de la Mairie, de dix heures à vingt heures. L’entrée est gratuite, et l’après-midi, les enfants peuvent rencontrer le père Noël.",
        "Samedi soir, la chorale de la ville donne un concert à l’église Saint-Pierre, à vingt heures trente. Les places coûtent huit euros, mais c’est gratuit pour les moins de douze ans.",
        "Et dimanche, si vous aimez cuisiner, la bibliothèque propose un atelier de pâtisserie à quinze heures. Attention, il y a seulement quinze places : il faut s’inscrire à l’avance.",
      ],
      [
        ["Où se trouve le marché de Noël ?",["Sur la place de la Mairie","Devant l’église","À la bibliothèque"],0,1,["« Sur la place de la Mairie », de dix heures à vingt heures.","« Sur la place de la Mairie », from ten a.m. to eight p.m."]],
        ["Combien coûte l’entrée du marché de Noël ?",["Huit euros","Rien, elle est gratuite","Quinze euros"],1,1,["« L’entrée est gratuite. » Huit euros, c’est le prix du concert.","« L’entrée est gratuite. » Eight euros is the price of the concert."]],
        ["À quelle heure commence le concert ?",["À vingt heures","À vingt heures trente","À quinze heures"],1,2,["« À vingt heures trente », à l’église Saint-Pierre.","« À vingt heures trente », at Saint-Pierre church."]],
        ["Qui ne paie pas le concert ?",["Les personnes âgées","Les enfants de moins de douze ans","Les membres de la chorale"],1,2,["« C’est gratuit pour les moins de douze ans. »","« C’est gratuit pour les moins de douze ans. »"]],
        ["Pourquoi faut-il s’inscrire à l’atelier ?",["Parce qu’il est payant","Parce que les places sont limitées","Parce qu’il a lieu le soir"],1,3,["« Seulement quinze places » : il faut réserver avant de venir.","« Seulement quinze places »: you have to book before coming."]],
      ],
    ],
  ]),
  ...listening('A2', 'm2', [
    [
      "la-visite-du-chateau",
      "La visite du château",
      ["Visite guidée","Guided tour"],
      ["Suivez le parcours de la visite et retenez les règles.","Follow the route of the tour and remember the rules."],
      ["Comprendre un itinéraire et des interdictions.","Understand a route and what is not allowed."],
      ["« Commencer par », « puis » et « finir par » donnent l’ordre ; « interdit » et « sans » donnent les règles.","« Commencer par », « puis » and « finir par » give the order; « interdit » and « sans » give the rules."],
      [
        "Bonjour à tous et bienvenue au château ! Je m’appelle Hugo et je suis votre guide aujourd’hui. La visite dure une heure et quart.",
        "Nous allons commencer par la cuisine, puis nous monterons au premier étage pour voir les chambres. Nous finirons par le jardin.",
        "Quelques règles, s’il vous plaît : vous pouvez prendre des photos, mais sans flash. Il est interdit de toucher les meubles, et on ne mange pas à l’intérieur.",
        "Si vous vous perdez, le point de rendez-vous est devant la grande fontaine du jardin. Allez, suivez-moi !",
      ],
      [
        ["Combien de temps dure la visite ?",["Une heure","Une heure et quart","Une heure et demie"],1,0,["« Une heure et quart », c’est une heure et quinze minutes.","« Une heure et quart » is an hour and fifteen minutes."]],
        ["Par quelle pièce commence la visite ?",["Par les chambres","Par le jardin","Par la cuisine"],2,1,["« Nous allons commencer par la cuisine. »","« Nous allons commencer par la cuisine. »"]],
        ["Où se termine la visite ?",["Dans la cuisine","Dans le jardin","Au premier étage"],1,1,["« Nous finirons par le jardin » : finir par, c’est la dernière étape.","« Nous finirons par le jardin »: finir par is the last stage."]],
        ["Qu’est-ce qui est permis pendant la visite ?",["Prendre des photos sans flash","Toucher les meubles","Manger dans les chambres"],0,2,["Les photos sont permises, « mais sans flash ». Toucher et manger sont interdits.","Photos are allowed, « mais sans flash ». Touching and eating are not."]],
        ["Où faut-il aller si on se perd ?",["À l’entrée du château","Devant la grande fontaine","Dans la cuisine"],1,3,["« Le point de rendez-vous est devant la grande fontaine du jardin. »","« Le point de rendez-vous est devant la grande fontaine du jardin. »"]],
      ],
    ],
  ]),
];

export const b1Listening2 = [
  ...listening('B1', 'm2', [
    [
      "j-ai-quitte-paris-pour-la-campagne",
      "J’ai quitté Paris pour la campagne",
      ["Témoignage","Personal account"],
      ["Écoutez un Parisien raconter sa nouvelle vie dans un village.","Listen to a Parisian describe his new life in a village."],
      ["Distinguer les raisons, les avantages, les difficultés et le bilan.","Tell apart the reasons, the advantages, the difficulties and the conclusion."],
      ["« Mais » annonce les difficultés et « malgré tout » le bilan : ces mots montrent où va le témoignage.","« Mais » introduces the difficulties and « malgré tout » the conclusion: these words show where the account is going."],
      [
        "Il y a deux ans, avec ma compagne, nous avons quitté notre petit appartement parisien pour une maison dans un village de Bourgogne. Pendant le confinement, nous avions compris que nous passions notre vie dans les transports et que nous ne profitions jamais de notre temps libre.",
        "Le premier avantage, c’est l’espace : nous avons un jardin, et nos enfants jouent dehors tous les jours. Comme je peux travailler à distance trois jours par semaine, je ne vais au bureau, à Dijon, que deux fois par semaine.",
        "Mais tout n’est pas facile. Sans voiture, on ne peut rien faire : le premier supermarché est à quinze kilomètres, et le bus ne passe que deux fois par jour. Et l’hiver, quand il fait nuit à dix-sept heures, le village est très calme… peut-être un peu trop.",
        "Malgré tout, je ne regrette pas notre choix. Nous avons même rejoint l’association du village, qui organise un marché le premier dimanche du mois. C’est comme ça que nous avons rencontré nos voisins.",
      ],
      [
        ["Pourquoi le narrateur a-t-il quitté Paris ?",["Il avait perdu son travail","Il passait trop de temps dans les transports","Son appartement était trop cher"],1,0,["Pendant le confinement, il a compris qu’il passait sa vie dans les transports.","During lockdown, he realised he was spending his life commuting."]],
        ["Combien de fois par semaine va-t-il au bureau ?",["Deux fois","Trois fois","Cinq fois"],0,1,["Il travaille à distance trois jours, donc il ne va au bureau « que deux fois par semaine ». Ne… que veut dire seulement.","He works remotely three days, so he goes to the office « que deux fois par semaine ». Ne… que means only."]],
        ["Quel est le premier avantage de sa nouvelle vie ?",["Le calme","L’espace","Le prix de la maison"],1,1,["« Le premier avantage, c’est l’espace » : un jardin, des enfants qui jouent dehors.","« Le premier avantage, c’est l’espace »: a garden, children playing outside."]],
        ["Quel problème de transport mentionne-t-il ?",["Le bus ne passe que deux fois par jour","Le train est souvent en retard","Il n’y a pas de route vers Dijon"],0,2,["Sans voiture, c’est difficile : le bus ne passe que deux fois par jour.","Without a car, it is hard: the bus only comes twice a day."]],
        ["Que veut-il dire par « peut-être un peu trop » ?",["Le village est parfois trop calme pour lui","Il y a trop de bruit le soir","Les voisins font trop de fêtes"],0,2,["Le calme est un avantage, mais l’hiver, ce calme devient presque trop fort.","The quiet is an advantage, but in winter it becomes almost too much."]],
        ["Comment a-t-il rencontré ses voisins ?",["Au supermarché","Grâce à l’association du village","Au bureau, à Dijon"],1,3,["L’association organise un marché : « c’est comme ça que nous avons rencontré nos voisins ».","The association runs a market: « c’est comme ça que nous avons rencontré nos voisins »."]],
      ],
    ],
  ]),
  ...listening('B1', 'f2', [
    [
      "bien-dormir-ca-s-apprend",
      "Bien dormir, ça s’apprend",
      ["Podcast santé","Health podcast"],
      ["Retenez trois conseils pour mieux dormir, et leur raison.","Remember three tips for sleeping better, and why they work."],
      ["Repérer des conseils et la justification de chacun.","Pick out pieces of advice and the reason for each."],
      ["« Premier conseil », « deuxième conseil » et « enfin » annoncent chaque conseil : écoutez ensuite la raison, souvent donnée par une comparaison ou une conséquence.","« Premier conseil », « deuxième conseil » and « enfin » announce each tip: then listen for the reason, often given as a comparison or a consequence."],
      [
        "Bienvenue dans « Santé au quotidien ». Aujourd’hui, on parle du sommeil. Un adulte a besoin en moyenne de sept à neuf heures de sommeil par nuit, mais beaucoup d’entre nous dorment moins de six heures en semaine.",
        "Premier conseil : couchez-vous et levez-vous à heure fixe, même le week-end. Notre corps fonctionne comme une horloge ; quand on change d’horaire tous les samedis, c’est un peu comme si on partait en voyage à l’autre bout du monde.",
        "Deuxième conseil : évitez les écrans dans l’heure qui précède le coucher. La lumière des téléphones retarde l’endormissement, et les vidéos nous gardent éveillés bien plus longtemps que prévu.",
        "Enfin, si vous n’arrivez pas à dormir au bout de vingt minutes, ne restez pas au lit à regarder l’heure. Levez-vous, lisez quelques pages dans une lumière douce, et recouchez-vous quand le sommeil revient.",
      ],
      [
        ["De combien d’heures de sommeil un adulte a-t-il besoin en moyenne ?",["De cinq à six heures","De sept à neuf heures","De dix heures au moins"],1,0,["« De sept à neuf heures de sommeil par nuit ». Moins de six heures, c’est ce que beaucoup dorment en réalité.","« De sept à neuf heures de sommeil par nuit ». Under six hours is what many people actually get."]],
        ["Pourquoi faut-il garder les mêmes horaires le week-end ?",["Pour avoir plus de temps libre","Parce que le corps fonctionne comme une horloge","Pour se lever plus tôt le lundi"],1,1,["Le corps a un rythme régulier, comme une horloge : changer d’horaire le perturbe.","The body keeps a regular rhythm, like a clock: changing hours disturbs it."]],
        ["Que veut dire la comparaison avec un voyage à l’autre bout du monde ?",["Changer d’horaire perturbe le corps comme le décalage horaire","Il faut voyager pour mieux dormir","On dort mieux en vacances"],0,1,["C’est l’effet du décalage horaire : le corps ne sait plus quand dormir.","It is the effect of jet lag: the body no longer knows when to sleep."]],
        ["Que faut-il éviter avant de se coucher ?",["Le sport du matin","Les écrans dans l’heure qui précède","La lecture"],1,2,["« Évitez les écrans dans l’heure qui précède le coucher. »","« Évitez les écrans dans l’heure qui précède le coucher. »"]],
        ["Quel effet a la lumière des téléphones ?",["Elle aide à s’endormir","Elle retarde l’endormissement","Elle n’a aucun effet"],1,2,["« Retarder l’endormissement », c’est faire qu’on s’endort plus tard.","« Retarder l’endormissement » means you fall asleep later."]],
        ["Que conseille-t-on si on ne dort pas au bout de vingt minutes ?",["Rester au lit et regarder l’heure","Se lever et lire un peu dans une lumière douce","Reprendre son téléphone"],1,3,["« Levez-vous, lisez quelques pages dans une lumière douce », puis recouchez-vous.","« Levez-vous, lisez quelques pages dans une lumière douce », then go back to bed."]],
      ],
    ],
  ]),
  ...listening('B1', 'm2', [
    [
      "jour-de-greve-a-l-ecole",
      "Jour de grève à l’école",
      ["Message aux parents","Message to parents"],
      ["Comprenez qui est concerné par la grève et ce que les parents doivent faire.","Understand who is affected by the strike and what parents must do."],
      ["Repérer les personnes concernées, les solutions proposées et les démarches.","Pick out who is affected, the solutions offered and the steps to take."],
      ["Dans une information officielle, cherchez d’abord qui est concerné, puis les démarches : « vous devez », « pensez à ».","In official information, look first for who is affected, then the steps: « vous devez », « pensez à »."],
      [
        "Bonjour à tous, c’est monsieur Lefèvre, le directeur de l’école Jules-Ferry. Je vous informe que jeudi prochain, plusieurs enseignants seront en grève.",
        "Les élèves de madame Garcia et de monsieur Benoît n’auront pas cours ce jour-là. En revanche, les trois autres classes fonctionneront normalement.",
        "Pour les enfants dont les parents travaillent, la mairie organise un service d’accueil au gymnase, de huit heures trente à seize heures trente. Pour en bénéficier, vous devez inscrire votre enfant sur le site de la mairie avant mardi midi.",
        "Attention : la cantine sera fermée toute la journée. Pensez donc à prévoir un repas froid pour votre enfant. Je vous remercie de votre compréhension.",
      ],
      [
        ["Pourquoi le directeur envoie-t-il ce message ?",["Pour annoncer une sortie scolaire","Pour prévenir d’une grève jeudi","Pour présenter un nouvel enseignant"],1,0,["« Jeudi prochain, plusieurs enseignants seront en grève. »","« Jeudi prochain, plusieurs enseignants seront en grève. »"]],
        ["Quels élèves n’auront pas cours ?",["Tous les élèves de l’école","Les élèves de madame Garcia et de monsieur Benoît","Les élèves des trois autres classes"],1,1,["Seulement deux classes ; les trois autres fonctionnent normalement.","Only two classes; the other three run as usual."]],
        ["Dans ce message, « en revanche » sert à :",["introduire une opposition","donner une cause","annoncer une conclusion"],0,1,["« En revanche » oppose les classes fermées aux classes qui fonctionnent.","« En revanche » contrasts the closed classes with the ones that run."]],
        ["Qui organise l’accueil des enfants ?",["L’école","La mairie","Les parents d’élèves"],1,2,["« La mairie organise un service d’accueil au gymnase. »","« La mairie organise un service d’accueil au gymnase. »"]],
        ["Que faut-il faire pour que l’enfant soit accueilli ?",["L’inscrire avant mardi midi","Téléphoner au directeur jeudi matin","Venir au gymnase à huit heures"],0,2,["« Vous devez inscrire votre enfant sur le site de la mairie avant mardi midi. »","« Vous devez inscrire votre enfant sur le site de la mairie avant mardi midi. »"]],
        ["Pourquoi faut-il prévoir un repas froid ?",["Parce que la cantine sera fermée","Parce que le gymnase n’a pas de cuisine","Parce que la journée sera plus longue"],0,3,["« La cantine sera fermée toute la journée. Pensez donc à prévoir un repas froid. »","« La cantine sera fermée toute la journée. Pensez donc à prévoir un repas froid. »"]],
      ],
    ],
  ]),
];

export const b2Listening2 = [
  ...listening('B2', 'f2', [
    [
      "les-transports-gratuits",
      "Les transports gratuits, une bonne idée ?",
      ["Éditorial radio","Radio editorial"],
      ["Suivez un débat sur la gratuité des bus et repérez la position de la chroniqueuse.","Follow a debate on free buses and identify the commentator’s position."],
      ["Distinguer les arguments des deux camps et la conclusion nuancée.","Tell apart the arguments of both sides and the nuanced conclusion."],
      ["Repérez qui parle : « ses défenseurs », puis « les sceptiques ». L’avis personnel arrive souvent à la fin, après « au fond ».","Notice who is speaking: « ses défenseurs », then « les sceptiques ». The personal view often comes at the end, after « au fond »."],
      [
        "Depuis quelques années, plusieurs villes françaises ont rendu leurs bus gratuits. L’exemple le plus cité est celui de Dunkerque, où la fréquentation a nettement augmenté après la suppression des billets. Faut-il pour autant généraliser cette mesure ?",
        "Ses défenseurs avancent d’abord un argument social : pour les ménages modestes, le coût des transports pèse lourd, et la gratuité leur redonne du pouvoir d’achat. Ils y voient aussi un levier écologique, puisqu’un bus plein remplace des dizaines de voitures.",
        "Les sceptiques rappellent toutefois que les nouveaux passagers ne sont pas toujours d’anciens automobilistes : ce sont souvent des piétons ou des cyclistes qui prennent désormais le bus pour un trajet court. Par ailleurs, les billets ne financent qu’une partie du réseau ; sans eux, c’est le contribuable qui paie, et les investissements risquent d’en pâtir.",
        "Au fond, la gratuité n’est ni une solution miracle ni une erreur en soi. Tout dépend de la taille de la ville et de la qualité du service : un bus gratuit qui passe toutes les quarante minutes convaincra peu de monde de laisser sa voiture au garage.",
      ],
      [
        ["Quelle ville est citée en exemple ?",["Dunkerque","Lyon","Toulouse"],0,0,["« L’exemple le plus cité est celui de Dunkerque. »","« L’exemple le plus cité est celui de Dunkerque. »"]],
        ["Que s’est-il passé à Dunkerque après la suppression des billets ?",["La fréquentation a nettement augmenté","Plusieurs lignes ont été supprimées","Le nombre de voitures a doublé"],0,0,["« La fréquentation a nettement augmenté » : beaucoup plus de personnes prennent le bus.","« La fréquentation a nettement augmenté »: many more people ride the bus."]],
        ["Quel argument social avancent les défenseurs de la gratuité ?",["Elle redonne du pouvoir d’achat aux ménages modestes","Elle rend les bus plus rapides","Elle augmente le salaire des chauffeurs"],0,1,["Pour les ménages modestes, le transport coûte cher : la gratuité leur laisse plus d’argent.","For low-income households, transport is expensive: free buses leave them more money."]],
        ["Selon les sceptiques, qui sont souvent les nouveaux passagers ?",["D’anciens automobilistes","Des piétons ou des cyclistes","Des touristes"],1,2,["Ce ne sont pas toujours d’anciens automobilistes : l’effet écologique est donc plus faible qu’annoncé.","They are not always former drivers: so the environmental effect is smaller than claimed."]],
        ["Que signifie « les investissements risquent d’en pâtir » ?",["Les investissements risquent de souffrir de cette perte de recettes","Les investissements vont augmenter","Les passagers paieront les investissements"],0,2,["Pâtir de quelque chose, c’est en subir les conséquences négatives : sans billets, moins d’argent pour investir.","Pâtir de means to suffer from: without fares, less money to invest."]],
        ["Quelle est la position finale de la chroniqueuse ?",["La gratuité est toujours une erreur","Tout dépend de la ville et de la qualité du service","Il faut rendre tous les transports gratuits"],1,3,["« Ni une solution miracle ni une erreur en soi » : elle refuse les deux positions extrêmes.","« Ni une solution miracle ni une erreur en soi »: she rejects both extreme positions."]],
        ["Pourquoi parle-t-elle d’un bus qui passe toutes les quarante minutes ?",["Pour montrer que la gratuité ne suffit pas sans un bon service","Pour critiquer les chauffeurs","Pour donner les horaires de Dunkerque"],0,3,["Un bus gratuit mais rare ne fait pas changer les habitudes : la qualité du service compte autant que le prix.","A free but infrequent bus will not change habits: the quality of service matters as much as the price."]],
      ],
    ],
  ]),
  ...listening('B2', 'm2', [
    [
      "pourquoi-oublie-t-on",
      "Pourquoi oublie-t-on ce qu’on apprend ?",
      ["Extrait de conférence","Lecture excerpt"],
      ["Comprenez la courbe de l’oubli et ce qu’elle change pour vos révisions.","Understand the forgetting curve and what it means for your revision."],
      ["Suivre une explication scientifique et en tirer une conclusion pratique.","Follow a scientific explanation and draw a practical conclusion."],
      ["Dans une conférence, les reformulations comme « autrement dit » résument l’idée clé : si vous manquez une phrase, la suivante la reprend souvent.","In a lecture, rephrasings such as « autrement dit » sum up the key idea: if you miss a sentence, the next one often repeats it."],
      [
        "À la fin du dix-neuvième siècle, le psychologue allemand Hermann Ebbinghaus a mené une expérience sur lui-même. Il a appris des listes de syllabes sans signification, puis il a mesuré, au fil des jours, ce qu’il en retenait. Ses résultats ont donné ce qu’on appelle aujourd’hui la courbe de l’oubli.",
        "Ce qu’il a observé est frappant : l’essentiel de l’oubli se produit très vite, dans les heures et les jours qui suivent l’apprentissage. Ensuite, la perte ralentit. Autrement dit, si l’on ne revoit pas une information, une grande partie disparaît avant même la fin de la semaine.",
        "Mais Ebbinghaus a aussi montré qu’on peut freiner cet oubli. Chaque fois qu’on revient sur une notion, elle est mieux retenue, et l’on peut attendre plus longtemps avant la révision suivante. C’est le principe de la répétition espacée : revoir un mot le lendemain, puis trois jours plus tard, puis une semaine après.",
        "Pour apprendre une langue, la leçon est claire : mieux vaut réviser dix minutes chaque jour que relire ses notes pendant deux heures la veille d’un examen. Et le plus efficace n’est pas de relire, mais d’essayer de se souvenir sans regarder : c’est cet effort qui consolide la mémoire.",
      ],
      [
        ["Sur qui Ebbinghaus a-t-il fait son expérience ?",["Sur des étudiants","Sur lui-même","Sur des enfants"],1,0,["« Il a mené une expérience sur lui-même. »","« Il a mené une expérience sur lui-même. »"]],
        ["Qu’a-t-il appris pendant l’expérience ?",["Des listes de syllabes sans signification","Des poèmes célèbres","Une langue étrangère"],0,0,["Des syllabes sans signification : ainsi, le sens ne l’aidait pas à se souvenir.","Meaningless syllables: so meaning could not help him remember."]],
        ["Selon la courbe de l’oubli, quand oublie-t-on le plus ?",["Juste après l’apprentissage","Après plusieurs mois","Seulement quand on est fatigué"],0,1,["« L’essentiel de l’oubli se produit très vite », puis la perte ralentit.","« L’essentiel de l’oubli se produit très vite », then the loss slows down."]],
        ["Dans ce passage, « autrement dit » introduit :",["une reformulation","une opposition","un exemple contraire"],0,1,["« Autrement dit » redit la même idée plus simplement.","« Autrement dit » says the same idea in simpler words."]],
        ["Qu’est-ce que la répétition espacée ?",["Revoir une notion à des intervalles de plus en plus longs","Répéter un mot dix fois de suite","Tout réviser la veille de l’examen"],0,2,["Le lendemain, puis trois jours après, puis une semaine après : les intervalles s’allongent.","The next day, then three days later, then a week later: the intervals get longer."]],
        ["Quelle méthode le conférencier recommande-t-il ?",["Relire ses notes deux heures avant l’examen","Réviser un peu chaque jour","Apprendre une seule liste par semaine"],1,3,["« Mieux vaut réviser dix minutes chaque jour » que tout relire la veille.","« Mieux vaut réviser dix minutes chaque jour » rather than rereading everything the night before."]],
        ["Pourquoi vaut-il mieux essayer de se souvenir que relire ?",["Parce que c’est plus rapide","Parce que c’est l’effort de mémoire qui consolide l’apprentissage","Parce qu’on fait moins d’erreurs"],1,3,["« C’est cet effort qui consolide la mémoire » : chercher le mot sans regarder le fixe mieux.","« C’est cet effort qui consolide la mémoire »: searching for the word without looking fixes it better."]],
      ],
    ],
  ]),
];
