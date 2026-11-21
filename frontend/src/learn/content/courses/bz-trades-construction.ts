import type { CourseAbout } from '../../types';
import { b, card, dlg, doc, hear, lesson, mc, ord, P, pairs, say, sort } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Construction, renovation, plumbing, electricity, carpentry: the trades are in high demand in Québec, France and Belgium, and safety depends on understanding instructions perfectly. This course covers the vocabulary of tools and materials, safety rules and protective equipment, instructions on the site (measure, cut, fix, check), and talking to a client about a quote and the progress of the work.',
    'Construction, rénovation, plomberie, électricité, menuiserie : les métiers du bâtiment sont très recherchés au Québec, en France et en Belgique, et la sécurité dépend d’une compréhension parfaite des consignes. Ce cours couvre le vocabulaire des outils et des matériaux, les règles de sécurité et les équipements de protection, les consignes sur le chantier (mesurer, couper, fixer, vérifier), et l’échange avec un client sur un devis et l’avancement des travaux.',
  ),
  outcomes: [
    b('Name common tools and materials', 'Nommer les outils et matériaux courants'),
    b('Understand safety rules and PPE', 'Comprendre les règles de sécurité et les EPI'),
    b('Follow and give instructions on site', 'Suivre et donner des consignes sur le chantier'),
    b('Explain a quote and progress to a client', 'Expliquer un devis et l’avancement à un client'),
  ],
};

const C = 'bz-trades-construction';
export default [
  lesson(C, 1, ['tools-and-materials', 'outils-et-materiaux'],
    b('Tools and materials', 'Outils et matériaux'),
    b('Name the tools and materials you use every day and ask for them.', 'Nommer les outils et matériaux du quotidien et les demander.'),
    [b('Name hand and power tools', 'Nommer outils à main et électroportatifs'), b('Name materials', 'Nommer les matériaux'), b('Ask a colleague for a tool', 'Demander un outil à un collègue')],
    13,
    [
      card(b('On the toolbelt', 'À la ceinture'), b('Hand tools: **un marteau, un tournevis, une clé, une pince, un mètre, un niveau, une scie**. Power tools: **une perceuse, une visseuse, une meuleuse, une scie circulaire**. Materials: **le bois, le béton, le plâtre, une plaque de plâtre (Québec: gypse), une vis, un clou, une cheville, un tuyau, un câble**. Ask: **Tu peux me passer le niveau ? · Il nous faut des vis de 5 cm.**', 'Outils à main : **un marteau, un tournevis, une clé, une pince, un mètre, un niveau, une scie**. Électroportatifs : **une perceuse, une visseuse, une meuleuse, une scie circulaire**. Matériaux : **le bois, le béton, le plâtre, une plaque de plâtre (Québec : gypse), une vis, un clou, une cheville, un tuyau, un câble**. Demander : **Tu peux me passer le niveau ? · Il nous faut des vis de 5 cm.**')),
      pairs(P.match, [['un marteau', b('a hammer', 'pour taper sur un clou')], ['un tournevis', b('a screwdriver', 'pour les vis')], ['un niveau', b('a spirit level', 'pour vérifier l’horizontale')], ['une perceuse', b('a drill', 'pour faire des trous')]]),
      sort(b('Tool or material?', 'Outil ou matériau ?'), [b('tool', 'outil'), b('material', 'matériau')], [['une scie', 0], ['le béton', 1], ['une pince', 0], ['une vis', 1], ['une meuleuse', 0], ['un tuyau', 1]]),
      mc(P.best, ['Tu peux me passer le tournevis, s’il te plaît ?', 'Tournevis !', 'Donne.', 'Où il est, le truc pour visser, là ?'], { fr: 'Vous demandez un outil à un collègue :' }),
      hear('Pour fixer l’étagère, il nous faut quatre chevilles, quatre vis de six centimètres et la perceuse avec une mèche de huit.', b('What drill bit is needed?', 'Quelle mèche faut-il ?'), [b('an 8 mm bit', 'une mèche de 8'), b('a 6 mm bit', 'une mèche de 6'), b('a 4 mm bit', 'une mèche de 4'), b('no drill', 'pas de perceuse')], { voice: 'm' }),
      say('Tu peux me passer le niveau et la perceuse ? Il nous faut aussi des vis de cinq centimètres.', 'Can you pass me the level and the drill? We also need five-centimetre screws.'),
    ],
    [
      b('Hand tools: marteau, tournevis, pince, niveau, mètre, scie.', 'Outils à main : marteau, tournevis, pince, niveau, mètre, scie.'),
      b('Materials: bois, béton, plâtre, vis, clou, cheville, tuyau, câble.', 'Matériaux : bois, béton, plâtre, vis, clou, cheville, tuyau, câble.'),
      b('Ask: Tu peux me passer… ? Il nous faut…', 'Demander : Tu peux me passer… ? Il nous faut…'),
    ],
    [['une cheville', b('a wall plug', 'pour fixer une vis dans le mur')], ['une mèche', b('a drill bit', 'partie qui perce')], ['une étagère', b('a shelf', 'planche de rangement')]],
  ),
  lesson(C, 2, ['safety-on-site', 'la-securite-sur-le-chantier'],
    b('Safety on site', 'La sécurité sur le chantier'),
    b('Understand safety rules, protective equipment and warning signs.', 'Comprendre les règles de sécurité, les équipements de protection et les signaux d’alerte.'),
    [b('Name protective equipment', 'Nommer les équipements de protection'), b('Understand safety rules', 'Comprendre les règles de sécurité'), b('Warn a colleague', 'Alerter un collègue')],
    13,
    [
      card(b('PPE and rules', 'EPI et règles'), b('**Les EPI** (équipements de protection individuelle): **le casque, les lunettes de protection, les gants, les chaussures de sécurité, le gilet haute visibilité, le harnais, les bouchons d’oreilles**. Rules: **Port du casque obligatoire. · Interdit de fumer. · Zone dangereuse : accès réservé.** Warn: **Attention ! · Recule ! · Arrête la machine ! · Ça va tomber !**', '**Les EPI** (équipements de protection individuelle) : **le casque, les lunettes de protection, les gants, les chaussures de sécurité, le gilet haute visibilité, le harnais, les bouchons d’oreilles**. Règles : **Port du casque obligatoire. · Interdit de fumer. · Zone dangereuse : accès réservé.** Alerter : **Attention ! · Recule ! · Arrête la machine ! · Ça va tomber !**')),
      doc({ look: 'notice', title: b('Site safety notice', 'Consignes de sécurité du chantier'), text: 'CHANTIER INTERDIT AU PUBLIC\nPort du casque et des chaussures de sécurité obligatoire.\nGilet haute visibilité obligatoire dans la zone de levage.\nTravail en hauteur : harnais attaché en permanence.\nTout accident doit être signalé immédiatement au chef de chantier.' }, b('What must you wear in the lifting area?', 'Que faut-il porter dans la zone de levage ?'), [b('a high-visibility vest (plus helmet and safety shoes)', 'un gilet haute visibilité (plus casque et chaussures de sécurité)'), b('only gloves', 'seulement des gants'), b('nothing special', 'rien de spécial'), b('a harness only', 'seulement un harnais')]),
      mc(P.best, ['Attention ! Recule, la charge passe au-dessus de toi !', 'Hé, c’est dangereux, peut-être, non ?', 'Bon courage.', 'Tu devrais faire attention un jour.'], { fr: 'Une charge suspendue passe au-dessus d’un collègue :' }),
      pairs(P.match, [['le casque', b('the hard hat', 'protège la tête')], ['le harnais', b('the harness', 'contre les chutes')], ['le gilet haute visibilité', b('the high-vis vest', 'pour être vu')], ['le chef de chantier', b('the site manager', 'responsable du chantier')]]),
      hear('Avant de commencer, je rappelle : on travaille à six mètres de hauteur aujourd’hui, donc harnais obligatoire et attaché en permanence. Si quelqu’un se blesse, vous me prévenez tout de suite.', b('What is the key rule today?', 'Quelle est la règle clé aujourd’hui ?'), [b('the harness must always be attached', 'le harnais doit toujours être attaché'), b('no work above six metres', 'pas de travail au-dessus de six mètres'), b('gloves are optional', 'les gants sont facultatifs'), b('work stops at noon', 'le travail s’arrête à midi')], { voice: 'm' }),
      say('Attention ! Arrête la machine ! Tu as oublié tes lunettes de protection.', 'Watch out! Stop the machine! You forgot your safety glasses.'),
    ],
    [
      b('EPI: casque, gants, lunettes, chaussures de sécurité, gilet, harnais.', 'EPI : casque, gants, lunettes, chaussures de sécurité, gilet, harnais.'),
      b('Signs: obligatoire, interdit, zone dangereuse.', 'Panneaux : obligatoire, interdit, zone dangereuse.'),
      b('Alerts: Attention ! Recule ! Arrête !', 'Alertes : Attention ! Recule ! Arrête !'),
    ],
    [['une charge', b('a load', 'objet lourd soulevé')], ['le levage', b('lifting', 'action de soulever')], ['signaler', b('to report', 'informer')]],
  ),
  lesson(C, 3, ['instructions-and-clients', 'consignes-et-clients'],
    b('Instructions and talking to clients', 'Consignes et échanges avec les clients'),
    b('Follow technical instructions and explain a quote and the progress of work to a client.', 'Suivre des consignes techniques et expliquer un devis et l’avancement des travaux à un client.'),
    [b('Understand step-by-step instructions', 'Comprendre des consignes étape par étape'), b('Explain a quote', 'Expliquer un devis'), b('Report progress or a delay', 'Annoncer l’avancement ou un retard')],
    13,
    [
      card(b('On site and with the client', 'Sur le chantier et avec le client'), b('Instructions: **Mesure deux fois, coupe une fois. · Coupe l’eau avant de démonter. · Coupe le courant au disjoncteur. · Vérifie que c’est de niveau. · Ponce, puis applique deux couches.** Client: **Voici le devis : il comprend la main-d’œuvre et les matériaux. · Les travaux dureront environ trois semaines. · Nous avons un petit retard à cause de la livraison.**', 'Consignes : **Mesure deux fois, coupe une fois. · Coupe l’eau avant de démonter. · Coupe le courant au disjoncteur. · Vérifie que c’est de niveau. · Ponce, puis applique deux couches.** Client : **Voici le devis : il comprend la main-d’œuvre et les matériaux. · Les travaux dureront environ trois semaines. · Nous avons un petit retard à cause de la livraison.**')),
      ord(P.order, 'Coupe le courant au disjoncteur avant de toucher aux fils.', { tr: 'Switch off the power at the breaker before touching the wires.' }),
      mc(P.best, ['Le devis comprend la main-d’œuvre et les matériaux ; les travaux dureront environ trois semaines.', 'C’est cher, mais c’est comme ça.', 'Le prix, vous verrez à la fin.', 'Je ne sais pas combien de temps.'], { fr: 'Vous présentez un devis à une cliente :' }),
      dlg(b('A delay', 'Un retard'), undefined, [['Cliente', 'f'], ['Vous', 'm']], [
        [0, 'Bonjour, la cuisine devait être finie vendredi. Où en êtes-vous ?', 'Hello, the kitchen was supposed to be finished on Friday. Where are you at?'],
        [1, { options: ['Je suis désolé, nous avons deux jours de retard : le plan de travail a été livré en retard. Nous finirons mardi.', 'On verra.', 'Ce n’est pas ma faute.'] }],
        [0, 'Mardi au plus tard ?', 'Tuesday at the latest?'],
        [1, { options: ['Oui, je m’y engage. Je vous appelle lundi soir pour faire le point.', 'Peut-être mercredi, ou jeudi.', 'Je ne promets rien.'] }],
      ]),
      pairs(P.match, [['un devis', b('a quote, an estimate', 'prix proposé avant les travaux')], ['la main-d’œuvre', b('labour', 'travail des ouvriers')], ['le disjoncteur', b('the circuit breaker', 'coupe le courant')], ['poncer', b('to sand', 'rendre lisse')]]),
      say('Voici le devis : il comprend la main-d’œuvre et les matériaux. Les travaux dureront environ trois semaines.', 'Here is the quote: it includes labour and materials. The work will take about three weeks.'),
    ],
    [
      b('Safety first: couper l’eau / le courant avant d’intervenir.', 'Sécurité d’abord : couper l’eau / le courant avant d’intervenir.'),
      b('Quote: main-d’œuvre + matériaux, durée des travaux.', 'Devis : main-d’œuvre + matériaux, durée des travaux.'),
      b('Delay: apologise, explain, give a new date, follow up.', 'Retard : s’excuser, expliquer, donner une nouvelle date, faire le suivi.'),
    ],
    [['un plan de travail', b('a worktop', 'surface de cuisine')], ['une couche', b('a coat (of paint)', 'épaisseur de peinture')], ['s’engager', b('to commit', 'promettre')]],
  ),
];
