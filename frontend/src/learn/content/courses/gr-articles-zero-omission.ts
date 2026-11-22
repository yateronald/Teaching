import type { CourseAbout, Lesson } from '../../types';
import { b, card, dict, dlg, doc, gap, hear, lesson, mc, ord, P, pairs, say, sort, trap, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Elle est médecin — ou C’est une excellente médecin. Un café sans lait, beaucoup de monde, avoir faim, faire attention. While French normally loves articles, dropping them in specific grammatical slots is mandatory. This course maps every major zero-article rule: bare professions, nationalities and religions (plus when c’est un returns!), sans / avec / ni… ni, quantity adverbs (beaucoup de), and fixed verbal locutions.',
    'Elle est médecin — ou C’est une excellente médecin. Un café sans lait, beaucoup de monde, avoir faim, faire attention. Si le français emploie presque toujours des articles, leur omission est obligatoire dans des cas précis. Ce cours rassemble toutes les règles clés d’article zéro : professions, nationalités et religions (et le retour de c’est un), sans / avec / ni… ni, adverbes de quantité (beaucoup de) et locutions verbales figées.',
  ),
  outcomes: [
    b('Omit the article with bare professions, nationalities and religions—and restore it after c’est or modifiers', 'Supprimer l’article devant profession, nationalité ou religion — et le rétablir avec c’est ou un adjectif'),
    b('Use zero articles cleanly with sans, avec (abstract manner) and ni… ni', 'Maîtriser l’absence d’article avec sans, avec (manière) et ni… ni'),
    b('Replace du/de la/des with bare de after quantity expressions (beaucoup de, un kilo de)', 'Remplacer du/de la/des par de seul après les expressions de quantité'),
    b('Use high-frequency zero-article verbal locutions (avoir faim, prendre soin, faire attention)', 'Employer sans faute les locutions verbales sans article (avoir faim, prendre soin, faire attention)'),
  ],
};

const C = 'gr-articles-zero-omission';

const lessons: Lesson[] = [
  lesson(C, 1, ['professions-nationalities-religions', 'professions-nationalites-religions'],
    b('Professions, nationalities & religions: Elle est médecin vs C’est un…', 'Professions, nationalités et religions : Elle est médecin ou C’est un…'),
    b('Drop the indefinite article after être, devenir and sembler—unless c’est or a modifier brings it back.', 'Supprimez l’article indéfini après être, devenir et sembler — sauf quand c’est ou un adjectif le ramène.'),
    [
      b('Drop un/une after être, devenir, rester, sembler + bare profession/nationality/religion', 'Omettre un/une après être, devenir, rester, sembler + nom nu'),
      b('Restore un/une/des after c’est / ce sont', 'Rétablir un/une/des après c’est / ce sont'),
      b('Switch to c’est un(e) when an adjective or relative clause modifies the noun', 'Passer à c’est un(e) quand le nom est qualifié par un adjectif ou une relative'),
    ],
    13,
    [
      card(b('Bare status = zero article; c’est or modified = article returns', 'Statut nu = article zéro ; c’est ou adjectif = retour de l’article'), b('After **être, devenir, rester, paraître, sembler**, French treats a bare profession, nationality, political/religious identity or family status like an adjective — **no un / une**! The moment you use **c’est / ce sont**, OR add an adjective or relative clause, **un / une / des** comes right back.\nZero-article verbs: **être, devenir, rester, sembler**.\nArticle returns with: **c’est un, ce sont des, un excellent…, un … que j’admire**.', 'Après **être, devenir, rester, paraître, sembler**, le nom nu de profession, de nationalité, de religion ou de statut fonctionne comme un adjectif — **sans un / une** ! Dès qu’on emploie **c’est / ce sont**, OU qu’on ajoute un adjectif ou une relative, **un / une / des** réapparaît aussitôt.\nVerbes à article zéro : **être, devenir, rester, sembler**.\nRetour de l’article : **c’est un, ce sont des, un excellent…, un … que j’admire**.'), {
        table: {
          head: [b('Context', 'Contexte'), b('Article?', 'Article ?'), b('Example', 'Exemple')],
          rows: [
            [b('Bare profession / nationality', 'Métier / nationalité nu'), b('No', 'Non'), 'Mon frère est architecte et ma belle-sœur est suisse.'],
            [b('After devenir / rester / religion', 'Après devenir / rester / religion'), b('No', 'Non'), 'Elle est devenue avocate ; lui, il est bouddhiste.'],
            [b('After c’est / ce sont', 'Après c’est / ce sont'), b('Yes (un/une/des)', 'Oui (un/une/des)'), 'C’est un architecte. Ce sont des avocates.'],
            [b('Modified by adjective / clause', 'Qualifié par adjectif / relative'), b('Yes (c’est un…)', 'Oui (c’est un…)'), 'C’est une excellente médecin.'],
          ],
        },
        ex: [
          ['Ma tante est pharmacienne à Lyon depuis vingt ans.', 'My aunt has been a pharmacist in Lyon for twenty years.'],
          ['C’est un collègue très fiable sur qui tu peux compter.', 'He is a very reliable colleague whom you can count on.'],
          ['Mon voisin est devenu journaliste indépendant l’an dernier.', 'My neighbor became a freelance journalist last year.'],
        ],
      }),
      trap(b('Never say *Il est un médecin* or *C’est médecin*!', 'Ne dites jamais *Il est un médecin* ni *C’est médecin* !'), b('Watch the two classic traps: after **il est / elle est**, a bare profession NEVER takes *un/une* (*Il est ingénieur*). Conversely, after **c’est / ce sont**, an article is **mandatory** (*C’est un ingénieur* — never *C’est ingénieur*!). Also prefer **C’est un bon professeur** over *Il est un bon professeur*.\nCorrect bare: **Elle est infirmière. Il est canadien.**\nCorrect modified: **C’est une infirmière dévouée. C’est un ami d’enfance.**', 'Évitez les deux pièges classiques : après **il est / elle est**, la profession nue ne prend JAMAIS *un/une* (*Il est ingénieur*). À l’inverse, après **c’est / ce sont**, l’article est **obligatoire** (*C’est un ingénieur* — jamais *C’est ingénieur* !). Préférez aussi **C’est un bon professeur** à *Il est un bon professeur*.\nFormes nues justes : **Elle est infirmière. Il est canadien.**\nFormes modifiées justes : **C’est une infirmière dévouée. C’est un ami d’enfance.**')),
      mc(P.word, ['est traductrice', 'est une traductrice', 'c’est traductrice', 'devient une traductrice'], { fr: 'Ma sœur ___ pour une maison d’édition.' }),
      hear('Tu connais Marc ? Il est dentiste, mais c’est aussi un pianiste très talentueux.', P.meaning, [
        b('Marc works as a dentist and is also a very talented pianist.', 'Marc exerce comme dentiste et est aussi un pianiste très doué.'),
        b('Marc used to be a pianist before becoming a dentist.', 'Marc était pianiste avant d’étudier la médecine.'),
        b('Marc teaches piano to dentists.', 'Marc donne des cours de piano à des dentistes.'),
      ]),
      sort(b('Article or zero article?', 'Article ou absence d’article ?'), [
        b('Zero article (bare status after être/devenir)', 'Article zéro (statut nu après être/devenir)'),
        b('Needs un / une / des (c’est or modified)', 'Demande un / une / des (c’est ou qualifié)'),
      ], [
        ['Il est ___ comptable.', 0],
        ['C’est ___ comptable.', 1],
        ['Elle est devenue ___ chercheuse.', 0],
        ['C’est ___ chercheuse reconnue.', 1],
        ['Ils sont ___ étudiants.', 0],
        ['Ce sont ___ étudiants belges.', 1],
      ]),
      gap(P.complete, 'Son mari ___ (être) cuisinier dans un petit bistro : tout le monde dit que ___ (c’est / il est) un chef inventif. Ma cousine, elle, est ___ (devenir) boulangère.', [['est'], ['c’est'], ['devenue']], {
        choices: [
          ['est', 'est un', 'c’est'],
          ['c’est', 'il est', 'il est un'],
          ['devenue', 'devenue une', 'une devenue'],
        ],
      }),
      pairs(P.match, [
        ['Elle est avocate.', b('She is a lawyer (bare status).', 'Sa profession est avocate.')],
        ['C’est une avocate brillante.', b('She is a brilliant lawyer (modified).', 'On précise une qualité avec c’est.')],
        ['Il reste célibataire.', b('He remains single (bare status).', 'Son état civil nu reste sans article.')],
        ['Ce sont des voisins discrets.', b('They are quiet neighbors (c’est/ce sont).', 'Présentation plurielle avec article.')],
      ]),
      ord(P.order, 'Ma nièce est devenue ingénieure, et c’est une excellente musicienne.', {
        tr: b('My niece became an engineer, and she is an excellent musician.', 'Ma nièce est devenue ingénieure, et c’est une très bonne musicienne.'),
        extra: ['un', 'est une ingénieure'],
      }),
      dlg(b('Meeting at a gallery', 'Rencontre dans une galerie'), b('Claire introduces her colleague to Hugo.', 'Claire présente son collègue à Hugo.'), [['Claire', 'f'], ['Hugo', 'm2']], [
        [0, 'Je te présente Mehdi : il est photographe de presse.', 'Let me introduce Mehdi: he’s a photojournalist.'],
        [1, { options: ['Enchanté ! C’est un métier passionnant, et vous êtes belge comme Claire ?', 'Enchanté ! Il est métier passionnant, et vous êtes un belge ?', 'Enchanté ! C’est photographe !'], explain: b('C’est un métier takes the indefinite article; bare nationality after êtes drops it (belge).', 'C’est un métier prend un article ; la nationalité nue après êtes reste sans article.') }],
        [0, 'Oui, nous sommes tous les deux belges, mais nous vivons à Lille.', 'Yes, we’re both Belgian, though we live in Lille.'],
      ]),
      dict('Mon oncle est médecin à Marseille, mais c’est aussi un passionné d’astronomie.'),
      say('Elle est devenue directrice l’an dernier ; c’est une collègue très respectée.', 'She became director last year; she is a very respected colleague.'),
    ],
    [
      b('Drop un/une after être, devenir, rester, sembler + bare profession, nationality or religion.', 'Supprimez un/une après être, devenir, rester, sembler + profession, nationalité ou religion nue.'),
      b('Always use an article after c’est / ce sont (C’est un médecin, Ce sont des artistes).', 'Gardez toujours un article après c’est / ce sont (C’est un médecin, Ce sont des artistes).'),
      b('When an adjective or relative clause modifies the profession, use c’est un(e) + adj. + nom.', 'Quand un adjectif ou une relative qualifie le nom, employez c’est un(e) + adj. + nom.'),
    ],
    [
      ['il est médecin', b('he is a doctor (zero article)', 'sa profession (sans article)')],
      ['c’est un bon médecin', b('he is a good doctor (modified)', 'profession qualifiée (avec c’est un)')],
      ['elle est devenue avocate', b('she became a lawyer', 'elle a embrassé ce métier')],
      ['ce sont des collègues', b('they are colleagues', 'présentation avec ce sont des')],
    ],
  ),

  lesson(C, 2, ['sans-avec-ni-and-quantities', 'sans-avec-ni-et-quantites'],
    b('Sans, avec, ni… ni & expressions of quantity (beaucoup de)', 'Sans, avec, ni… ni et expressions de quantité (beaucoup de)'),
    b('Know when prepositions and quantifiers strip off un, du, de la and des—and when definite articles stay.', 'Repérez quand les prépositions et quantifieurs suppriment un, du, de la et des — et quand le/la/les reste.'),
    [
      b('Omit indefinite/partitive articles after sans, avec (manner) and ni… ni', 'Supprimer l’article indéfini/partitif après sans, avec (manière) et ni… ni'),
      b('Use bare de after adverbs and nouns of quantity (beaucoup de, un kilo de)', 'Employer de seul après les adverbes et noms de quantité'),
      b('Keep definite articles with ni… ni (specific likes) and bien des / la plupart des', 'Garder l’article défini avec ni… ni (goûts généraux) et bien des / la plupart des'),
    ],
    13,
    [
      card(b('Sans, avec (manner) & ni… ni', 'Sans, avec (manière) et ni… ni'), b('Several everyday links drop indefinite (**un/une/des**) and partitive (**du/de la**) articles:\n- **sans + nom général** (*sans sucre, sans erreur*) — though **un** returns if you stress “not even one” (*sans un mot*).\n- **avec + nom abstrait** expressing manner (*avec soin, avec patience* = carefully, patiently).\n- **ne… ni X ni Y** drops *un/du/des* (*Je n’ai ni frère ni sœur*), while **le/la/les** stays for general likes (*Je n’aime ni le thé ni le café*).\nZero-article examples: **sans hésitation, avec courage, ni sel ni poivre**.', 'Plusieurs structures suppriment les articles indéfinis (**un/une/des**) et partitifs (**du/de la**) :\n- **sans + nom général** (*sans sucre, sans erreur*) — sauf pour insister sur l’unité (*sans un mot*).\n- **avec + nom abstrait** indiquant la manière (*avec soin, avec patience*).\n- **ne… ni X ni Y** supprime *un/du/des* (*Je n’ai ni frère ni sœur*), alors que **le/la/les** reste pour les goûts (*Je n’aime ni le thé ni le café*).\nExemples sans article : **sans hésitation, avec courage, ni sel ni poivre**.'), {
        table: {
          head: [b('Trigger', 'Déclencheur'), b('Article dropped', 'Article supprimé'), b('Example', 'Exemple')],
          rows: [
            ['sans + general noun', 'un / du / de la / des', 'Il prend son café sans lait et sans sucre.'],
            ['avec + abstract manner', 'du / de la', 'Elle a répondu avec calme et précision.'],
            ['ni… ni (indef./partitive)', 'un / du / des', 'Il ne porte ni veste ni manteau.'],
            ['quantity + de', 'du / de la / des', 'Il y a beaucoup de monde et peu de bruit.'],
          ],
        },
        ex: [
          ['Nous avons fini la traduction sans difficulté.', 'We finished the translation without difficulty.'],
          ['Il écoute toujours ses collègues avec attention.', 'He always listens to his colleagues attentively.'],
          ['Cet appartement n’a ni balcon ni cave.', 'This apartment has neither a balcony nor a cellar.'],
        ],
      }),
      trap(b('Quantity expressions: bare de — except bien des & la plupart des!', 'Quantités : de seul — sauf bien des et la plupart des !'), b('After **beaucoup de, peu de, trop de, assez de, autant de, combien de**, or container/weight nouns (**un verre de, un kilo de, une boîte de**), ALWAYS use bare **de / d’** — NEVER *beaucoup des* for general quantity! Two famous exceptions keep **des / de la / du**: **bien des** (*bien des gens*) and **la plupart des** (*la plupart des étudiants*).\nBare de: **trop d’erreurs, assez de temps, une tasse de thé**.\nExceptions with article: **la plupart des clients, bien des jours, beaucoup des livres que j’ai lus** (specific!).', 'Après **beaucoup de, peu de, trop de, assez de, autant de, combien de**, ou un nom de mesure (**un verre de, un kilo de, une boîte de**), mettez toujours **de / d’** seul — JAMAIS *beaucoup des* pour une quantité générale ! Deux exceptions gardent **du / de la / des** : **bien des** (*bien des gens*) et **la plupart des** (*la plupart des étudiants*).\nDe seul : **trop d’erreurs, assez de temps, une tasse de thé**.\nExceptions : **la plupart des clients, bien des jours, beaucoup des livres que j’ai lus** (précisés !).')),
      mc(P.word, ['de temps', 'du temps', 'des temps', 'un temps'], { fr: 'Pour ce dossier, nous avons besoin de beaucoup ___.' }),
      mc(P.word, ['ni manteau ni parapluie', 'ni un manteau ni un parapluie', 'ni de manteau ni de parapluie', 'pas manteau pas parapluie'], { fr: 'Il pleut fort, et pourtant il est sorti sans prendre ___.' }),
      sort(b('Bare noun (or bare de) vs article needed?', 'Sans article (ou de seul) ou avec article ?'), [
        b('Zero article / bare de', 'Sans article / de seul'),
        b('Keeps le / la / les / des', 'Garde le / la / les / des'),
      ], [
        ['sans ___ (hésitation)', 0],
        ['la plupart ___ (gens)', 1],
        ['avec ___ (courage)', 0],
        ['ni ___ (thé) ni ___ (café) [Je n’aime…]', 1],
        ['trop ___ (travail)', 0],
        ['bien ___ (problèmes)', 1],
      ]),
      gap(P.complete, 'Dans ce panier, j’ai mis un kilo ___ pommes, une bouteille ___ eau et beaucoup ___ cerises. Par contre, je n’ai acheté ___ beurre ___ crème.', [['de'], ['d’'], ['de'], ['ni'], ['ni']], {
        choices: [
          ['de', 'des', 'du'],
          ['d’', 'de l’', 'de la'],
          ['de', 'des', 'du'],
          ['ni', 'pas de', 'sans'],
          ['ni', 'et', 'ou'],
        ],
      }),
      pairs(P.match, [
        ['avec soin', b('carefully (with care)', 'soigneusement, avec attention')],
        ['sans hésitation', b('without hesitation', 'tout de suite, sans douter')],
        ['la plupart des gens', b('most people', 'la majorité des personnes')],
        ['ni frère ni sœur', b('neither brother nor sister', 'aucun frère ni aucune sœur')],
      ]),
      ord(P.order, 'La plupart des visiteurs sont entrés sans bruit et avec respect.', {
        tr: b('Most visitors entered quietly and respectfully.', 'La majorité des visiteurs sont entrés silencieusement et avec respect.'),
        extra: ['de', 'du'],
      }),
      dict('Il parle avec calme, boit son thé sans sucre et a assez d’énergie pour tout finir.'),
      say('Je n’ai ni clé ni badge, mais heureusement la plupart des collègues sont déjà là.', 'I have neither a key nor a badge, yet fortunately most colleagues are already here.'),
    ],
    [
      b('Drop un/du/des after sans (general), avec (manner) and ne… ni… ni.', 'Supprimez un/du/des après sans (général), avec (manière) et ne… ni… ni.'),
      b('Use bare de / d’ after quantity expressions (beaucoup de, assez de, un litre de).', 'Employez de / d’ seul après les expressions de quantité (beaucoup de, assez de, un litre de).'),
      b('Keep the article after bien des, la plupart des, and ni… ni with verbs of preference (aime).', 'Gardez l’article avec bien des, la plupart des, et ni… ni devant les goûts (aimer).'),
    ],
    [
      ['sans difficulté', b('without difficulty', 'facilement, sans peine')],
      ['avec attention', b('attentively / carefully', 'attentivement')],
      ['beaucoup de monde', b('many people / a big crowd', 'un grand nombre de personnes')],
      ['la plupart des', b('most of the', 'la majorité des')],
    ],
  ),

  lesson(C, 3, ['fixed-verbal-locutions', 'locutions-verbales-sans-article'],
    b('Fixed verbal locutions: avoir faim, faire attention, prendre soin', 'Locutions verbales sans article : avoir faim, faire attention, prendre soin'),
    b('Use high-frequency verb + noun chunks cleanly—and learn when modifiers like très vs beaucoup apply.', 'Employez sans faute les locutions verbales figées — et distinguez très de beaucoup devant ces noms.'),
    [
      b('Master essential zero-article verbal expressions with avoir, faire, prendre and rendre', 'Maîtriser les locutions essentielles avec avoir, faire, prendre et rendre'),
      b('Intensify state locutions with très (avoir très faim, NEVER *beaucoup de faim*)', 'Intensifier avec très (avoir très faim, jamais *beaucoup de faim*)'),
      b('Notice when an adjective restores the article (avoir une faim de loup)', 'Repérer le retour de l’article quand on qualifie le nom (avoir une faim de loup)'),
    ],
    13,
    [
      card(b('High-frequency verb + bare noun expressions', 'Locutions figées verbe + nom nu'), b('French pairs common verbs (**avoir, faire, prendre, rendre, perdre, porter**) directly with an article-free noun to form a single unified action or state. Because the noun acts almost like an adjective, intensify **avoir faim / peur / froid / chaud / raison** with **très**, **bien** or **si** — never *beaucoup*!\nWith avoir: **avoir faim, avoir peur, avoir besoin de, avoir envie de, avoir lieu**.\nWith faire/prendre: **faire attention, faire plaisir, prendre soin de, prendre froid, rendre visite à**.', 'Le français soude des verbes courants (**avoir, faire, prendre, rendre, perdre, porter**) à un nom sans article pour former une expression unique. Comme ce nom fonctionne presque comme un adjectif, on renforce **avoir faim / peur / froid / chaud / raison** avec **très** ou **vraiment** — jamais *beaucoup* !\nAvec avoir : **avoir faim, avoir peur, avoir besoin de, avoir envie de, avoir lieu**.\nAvec faire/prendre : **faire attention, faire plaisir, prendre soin de, prendre froid, rendre visite à**.'), {
        table: {
          head: [b('Verb', 'Verbe'), b('Zero-article locutions', 'Locutions sans article'), b('Example', 'Exemple')],
          rows: [
            ['avoir', 'faim, soif, chaud, froid, peur, raison, tort, envie de, besoin de, lieu', 'La réunion a lieu mardi matin.'],
            ['faire', 'attention, confiance, peur, plaisir, signe, partie de', 'Fais bien attention en traversant !'],
            ['prendre', 'soin de, garde, froid, connaissance de, parti', 'Elle prend soin de ses plantes.'],
            ['rendre / perdre', 'rendre visite à, rendre service, perdre patience, porter plainte', 'Nous rendons visite à nos amis dimanche.'],
          ],
        },
        ex: [
          ['J’ai très faim après cette longue randonnée.', 'I am very hungry after this long hike.'],
          ['Merci de faire confiance à notre équipe.', 'Thank you for trusting our team.'],
          ['Prends bien soin de toi pendant ce voyage.', 'Take good care of yourself during this trip.'],
        ],
      }),
      trap(b('Très faim vs une faim de loup!', 'Très faim… mais une faim de loup !'), b('Say **J’ai très peur** or **J’ai très envie de dormir** (NO *beaucoup de*!). Yet if you add an expressive adjective or complement right on the noun, **un / une** returns: **Il a une peur bleue des araignées**, **Elle a une envie folle de voyager**, **Faites un effort** vs **Faites attention**.\nBare (use très): **avoir très peur, avoir très soif, faire très attention**.\nQualified (article returns): **avoir une faim de loup, avoir une peur bleue, faire un grand effort**.', 'Dites **J’ai très peur** ou **J’ai très envie de dormir** (jamais *beaucoup de* !). Mais dès que vous ajoutez un adjectif ou un complément expressif au nom, **un / une** revient : **Il a une peur bleue des araignées**, **Elle a une envie folle de voyager**.\nNom nu (avec très) : **avoir très peur, avoir très soif, faire très attention**.\nNom qualifié (article) : **avoir une faim de loup, avoir une peur bleue, faire un grand effort**.')),
      mc(P.word, ['très envie', 'beaucoup d’envie', 'une très envie', 'de l’envie'], { fr: 'J’ai ___ de partir au bord de la mer ce week-end.' }),
      doc({
        look: 'sms',
        title: b('Text message from Léa', 'SMS de Léa'),
        text: 'Coucou ! Je rends visite à ma grand-mère cet après-midi, donc je ne peux pas passer avant 18 h.\nPrends soin de ne pas prendre froid sans écharpe !\nFais-moi signe dès que tu as faim pour le dîner.',
      }, b('Which three zero-article locutions appear in Léa’s message?', 'Quelles trois locutions sans article figurent dans le SMS de Léa ?'), [
        b('rendre visite, prendre froid, faire signe (plus prendre soin, avoir faim)', 'rendre visite, prendre froid, faire signe (ainsi que prendre soin, avoir faim)'),
        b('visiter une personne, avoir un froid, faire un signe', 'visiter une personne, avoir un froid, faire un signe'),
        b('prendre un soin, avoir de la faim, passer une visite', 'prendre un soin, avoir de la faim, passer une visite'),
      ]),
      sort(b('Zero article or article required?', 'Sans article ou avec article ?'), [
        b('Zero article (fixed locution)', 'Sans article (locution figée)'),
        b('Needs an article (modified / countable)', 'Prend un article (nom qualifié / dénombrable)'),
      ], [
        ['avoir ___ (lieu) demain', 0],
        ['avoir ___ (peur bleue)', 1],
        ['faire ___ (attention)', 0],
        ['faire ___ (effort important)', 1],
        ['prendre ___ (soin de)', 0],
        ['rendre ___ (service précieux)', 1],
      ]),
      gap(P.complete, 'N’aie pas ___ (peur / de peur) : la cérémonie aura ___ (lieu / un lieu) dans le jardin. Fais seulement ___ (attention / de l’attention) aux marches, et fais-moi ___ (signe / un signe) quand tu arrives.', [['peur'], ['lieu'], ['attention'], ['signe']], {
        choices: [
          ['peur', 'de peur', 'une peur'],
          ['lieu', 'un lieu', 'du lieu'],
          ['attention', 'de l’attention', 'une attention'],
          ['signe', 'un signe', 'du signe'],
        ],
      }),
      pairs(P.match, [
        ['avoir lieu', b('to take place', 'se dérouler, se produire')],
        ['faire partie de', b('to be part of / belong to', 'appartenir à un ensemble')],
        ['perdre patience', b('to lose one’s patience', 's’impatienter')],
        ['rendre visite à', b('to visit (a person)', 'aller voir quelqu’un')],
      ]),
      ord(P.order, 'Nous faisons toujours très attention avant de prendre une décision.', {
        tr: b('We are always very careful before making a decision.', 'Nous restons toujours très attentifs avant de décider.'),
        extra: ['beaucoup', 'des'],
      }),
      dlg(b('Weekend plans', 'Projets de week-end'), b('Nadia and Tom coordinate a family visit.', 'Nadia et Tom organisent une visite familiale.'), [['Tom', 'm'], ['Nadia', 'f2']], [
        [0, 'On rend visite à tes parents demain ? Je sais que ça leur ferait plaisir.', 'Shall we visit your parents tomorrow? I know it would please them.'],
        [1, { options: ['Oui, j’ai très envie de les voir ! Mais fais attention au verglas sur la route.', 'Oui, j’ai beaucoup d’envie de les voir ! Mais fais une attention !', 'Oui, j’ai de l’envie de les visiter !'], explain: b('Use avoir très envie de (never beaucoup d’envie), faire attention, and rendre visite à for people.', 'On dit avoir très envie de, faire attention, et rendre visite à pour une personne.') }],
        [0, 'Promis, je conduirai avec prudence et sans précipitation.', 'Promise, I’ll drive carefully and without rushing.'],
      ]),
      write(
        b('Write a short everyday diary note.', 'Rédigez un court billet de journal quotidien.'),
        b('Write 3–4 sentences using: one bare profession/nationality, one sans/avec/beaucoup de phrase, and two zero-article verbal locutions (avoir faim/envie/lieu, faire attention, prendre soin, rendre visite).', 'Rédigez 3 à 4 phrases contenant : une profession ou nationalité sans article, une tournure avec sans/avec/beaucoup de, et deux locutions verbales sans article (avoir faim/envie/lieu, faire attention, prendre soin, rendre visite).'),
        28, 62,
        [
          b('Include a zero-article profession or nationality', 'Inclure un métier ou une nationalité sans article'),
          b('Include sans, avec (manner) or beaucoup de correctly', 'Utiliser sans, avec (manière) ou beaucoup de sans article superflu'),
          b('Use at least two zero-article verbal locutions', 'Employer au moins deux locutions verbales sans article'),
        ],
        'Mon cousin Thomas est vétérinaire à Annecy. Aujourd’hui, nous lui avons rendu visite avec plaisir après le travail. Comme nous avions très faim, nous avons préparé une grande salade sans mayonnaise, avec beaucoup de tomates et d’herbes fraîches.',
        { phrases: ['est médecin / vétérinaire…', 'avec plaisir / sans…', 'beaucoup de…', 'rendre visite à / avoir très faim / faire attention'] },
      ),
    ],
    [
      b('Drop articles in fixed locutions: avoir faim, faire attention, prendre soin, rendre visite à.', 'Supprimez l’article dans les locutions figées : avoir faim, faire attention, prendre soin, rendre visite à.'),
      b('Intensify bare state nouns with très (avoir très peur), not *beaucoup de*.', 'Renforcez ces noms nus avec très (avoir très peur), jamais avec *beaucoup de*.'),
      b('Restore un / une when adding an expressive adjective (avoir une peur bleue).', 'Rétablissez un / une si le nom est qualifié par un adjectif expressif (avoir une peur bleue).'),
    ],
    [
      ['avoir lieu', b('to take place', 'se tenir (événement)')],
      ['faire attention', b('to pay attention / be careful', 'être vigilant')],
      ['prendre soin de', b('to take care of', 'veiller sur, s’occuper de')],
      ['rendre visite à', b('to visit (someone)', 'aller voir quelqu’un')],
      ['faire partie de', b('to be part of', 'être membre ou élément de')],
    ],
  ),
];

export default lessons;
