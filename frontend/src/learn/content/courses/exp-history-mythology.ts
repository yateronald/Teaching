import type { CourseAbout, Lesson } from '../../types';
import { P, b, card, culture, dict, dlg, flash, gap, hear, lesson, mc, ord, pairs, say, sort, trap, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Decode C2 French idioms rooted in Greek myth, Roman antiquity and European history. Master literary allusions from Homer and Alexander (le fil d’Ariane, trancher le nœud gordien, tomber de Charybde en Scylla), Roman turning points (franchir le Rubicon, une victoire à la Pyrrhus) and enduring historical metaphors (aller à Canossa, c’est la Bérézina, rester sur son Aventin).',
    'Maîtrisez les expressions C2 issues de la mythologie grecque, de l’Antiquité romaine et de l’histoire européenne. Déchiffrez les allusions d’Homère et d’Alexandre (le fil d’Ariane, trancher le nœud gordien, tomber de Charybde en Scylla), les grands tournants antiques (franchir le Rubicon, une victoire à la Pyrrhus) et les métaphores historiques (aller à Canossa, c’est la Bérézina, rester sur son Aventin).',
  ),
  outcomes: [
    b('Deploy Greek mythological metaphors cleanly in C2 essays and commentary', 'Employer les images mythologiques grecques avec justesse dans l’analyse'),
    b('Distinguish Roman and classical allusions accurately without common semantic slips', 'Distinguer les allusions antiques sans confusion de sens ni d’orthographe'),
    b('Understand rare historical expressions (Canossa, Bérézina, Aventin, chapitre) in press and debate', 'Comprendre et manier les expressions historiques rares de la presse et du débat C2'),
  ],
};

const C = 'exp-history-mythology';

const lessons: Lesson[] = [
  lesson(
    C,
    1,
    ['greek-mythology-idioms', 'expressions-mythologie-grecque'],
    b('Greek mythology: knots, threads & fatal flaws', 'Mythologie grecque : nœuds, labyrinthes et failles'),
    b('Navigate complexity with Ariadne’s thread, spot an Achilles’ heel and avoid falling from Charybdis into Scylla.', 'S’orienter avec le fil d’Ariane, cerner le talon d’Achille et éviter de tomber de Charybde en Scylla.'),
    [
      b('Use trancher le nœud gordien and le fil d’Ariane accurately', 'Employer trancher le nœud gordien et le fil d’Ariane avec précision'),
      b('Distinguish ouvrir la boîte de Pandore from tomber de Charybde en Scylla', 'Distinguer ouvrir la boîte de Pandore et tomber de Charybde en Scylla'),
      b('Master the spelling and pronunciation of Charybde, Scylla and nœud', 'Maîtriser l’orthographe et la prononciation de Charybde, Scylla et nœud'),
    ],
    13,
    [
      card(
        b('Greek myth in modern French prose', 'La mythologie grecque dans la langue soutenue'),
        b(
          'High-level French journalism, philosophy and criticism constantly condense whole crises into Greek allusions: **trancher le nœud gordien** (cutting an insoluble tangle with one bold stroke), **tomber de Charybde en Scylla** (escaping one peril only to plunge into a worse one), **ouvrir la boîte de Pandore** (unleashing uncontrollable troubles), **le talon d’Achille** (a fatal weak spot), and **le fil d’Ariane** (the guiding clue through complexity).\nDecisive cuts & guides: **trancher le nœud gordien · le fil d’Ariane**.\nPerils & flaws: **tomber de Charybde en Scylla · ouvrir la boîte de Pandore · le talon d’Achille**.',
          'La presse analytique, le droit et l’essai concentrent des situations complexes en cinq images grecques : **trancher le nœud gordien** (résoudre net un imbroglio jugé insoluble), **tomber de Charybde en Scylla** (aller de mal en pis en voulant éviter un écueil), **ouvrir la boîte de Pandore** (déclencher une cascade de maux), **le talon d’Achille** (le point vulnérable décisif) et **le fil d’Ariane** (le repère conducteur).\nRésolution et guide : **trancher le nœud gordien · le fil d’Ariane**.\nPérils et failles : **tomber de Charybde en Scylla · ouvrir la boîte de Pandore · le talon d’Achille**.',
        ),
        {
          table: {
            head: [b('Expression', 'Expression'), b('Meaning', 'Sens'), b('Mythological source', 'Source mythologique')],
            rows: [
              ['trancher le nœud gordien', b('to solve an impossible deadlock with a bold act', 'résoudre d’un coup tranchant un problème inextricable'), b('Alexander slicing the knot of Gordium', 'Alexandre tranchant le nœud de Gordias')],
              ['tomber de Charybde en Scylla', b('to jump from the frying pan into the fire', 'échapper à un péril pour tomber dans un pire'), b('Odysseus sailing between whirlpool and monster', 'Ulysse pris entre le gouffre et le monstre')],
              ['ouvrir la boîte de Pandore', b('to open Pandora’s box, unleash unforeseen evils', 'libérer une suite incontrôlable de conflits'), b('Pandora releasing all ills (saving only hope)', 'Pandore ouvrant le récipient des maux')],
              ['le talon d’Achille', b('Achilles’ heel, single fatal vulnerability', 'point faible unique d’un ensemble puissant'), b('Achilles dipped in the Styx by his heel', 'Achille tenu par le talon dans le Styx')],
              ['le fil d’Ariane', b('guiding thread through a labyrinth or argument', 'repère qui permet de ne pas se perdre'), b('Ariadne’s thread guiding Theseus out', 'le fil donné par Ariane à Thésée')],
            ],
          },
          ex: [
            ['En réformant le scrutin d’un seul décret, le législateur a tranché le nœud gordien.', 'By reforming the voting system in a single decree, lawmakers cut the Gordian knot.'],
            ['Remplacer cette taxe obscure par trois formulaires reviendrait à tomber de Charybde en Scylla.', 'Replacing that obscure tax with three new forms would amount to jumping from the frying pan into the fire.'],
            ['L’idée de souveraineté numérique constitue le véritable fil d’Ariane de son essai.', 'The idea of digital sovereignty forms the true guiding thread of her essay.'],
          ],
        },
      ),
      culture(
        b('Pronunciation, spelling and Erasmus’s “box”', 'Prononciation, graphie et la « boîte » d’Érasme'),
        b(
          'Three C2 details to keep crisp: pronounce **Charybde** with a hard **[k]** (*[kaʁibd]*) and **Scylla** with **[s]** (*[sila]*); always keep the **œ** ligature in **nœud** (lower-case *gordien*); and remember that Hesiod originally wrote of a clay storage jar (*pithos*)—Renaissance humanist Erasmus translated it into Latin *pyxis* (“box”), giving modern French **la boîte de Pandore**!',
          'Trois repères C2 précieux : prononcez **Charybde** avec un **[k]** dur (*[kaʁibd]*) et **Scylla** avec **[s]** (*[sila]*) ; veillez à la ligature **œ** dans **nœud** (minuscule à *gordien*) ; enfin, Hésiode parlait d’une jarre (*pithos*), devenue « boîte » sous la plume latine d’Érasme.',
        ),
      ),
      flash(
        b('Greek mythology idioms', 'Allusions mythologiques grecques'),
        [
          ['trancher le nœud gordien', b('to cut the Gordian knot, solve boldly', 'résoudre d’un geste audacieux un blocage complexe')],
          ['tomber de Charybde en Scylla', b('to go from the frying pan into the fire', 'quitter un danger pour tomber dans un pire')],
          ['ouvrir la boîte de Pandore', b('to open Pandora’s box', 'déclencher une chaîne de problèmes imprévus')],
          ['le talon d’Achille', b('Achilles’ heel, fatal weak spot', 'faille décisive d’une personne ou d’un système')],
          ['le fil d’Ariane', b('guiding thread through complexity', 'fil conducteur qui oriente dans un ensemble complexe')],
        ],
      ),
      mc(
        P.meaning,
        [
          b('Avoiding one serious problem only to land in an equally terrible or worse one.', 'Éviter un grave danger pour aussitôt se jeter dans un danger plus grand encore.'),
          b('Escaping a naval blockade thanks to calm diplomacy.', 'Échapper à un blocus maritime grâce à une médiation habile.'),
          b('Returning safely to harbour after a long sea voyage.', 'Rentrer sain et sauf au port après une longue traversée.'),
          b('Choosing the easiest compromise between two minor issues.', 'Opter pour le compromis le plus confortable entre deux détails.'),
        ],
        {
          fr: 'En abandonnant ce fournisseur peu fiable pour un monopole inflexible, l’usine est tombée de Charybde en Scylla.',
          explain: b('Charybdis (whirlpool) and Scylla (monster) embody two symmetrical perils where dodging one delivers you to the other.', 'Charybde et Scylla symbolisent deux périls symétriques où éviter l’un précipite dans l’autre.'),
        },
      ),
      mc(
        P.complete,
        [
          'ouvrir la boîte de Pandore',
          'suivre le fil d’Ariane',
          'trancher le nœud gordien',
          'protéger son talon d’Achille',
        ],
        {
          fr: 'Modifier un seul article de ce traité fédéral risquerait d’___ et de raviver vingt revendications régionales.',
          explain: b('Unleashing a chain reaction of dormant disputes is ouvrir la boîte de Pandore.', 'Déclencher une cascade de revendications imprévues correspond à ouvrir la boîte de Pandore.'),
        },
      ),
      pairs(
        P.match,
        [
          ['trancher le nœud gordien', b('to cut the Gordian knot, solve boldly', 'résoudre d’un geste audacieux un blocage complexe')],
          ['tomber de Charybde en Scylla', b('to go from the frying pan into the fire', 'quitter un danger pour tomber dans un pire')],
          ['ouvrir la boîte de Pandore', b('to open Pandora’s box', 'déclencher une chaîne de problèmes imprévus')],
          ['le talon d’Achille', b('Achilles’ heel, fatal weak spot', 'faille décisive d’une personne ou d’un système')],
          ['le fil d’Ariane', b('guiding thread through complexity', 'fil conducteur qui oriente dans un ensemble complexe')],
        ],
      ),
      gap(
        P.complete,
        'Si la logistique reste le ___ d’Achille de cette plateforme, le nouvel index offre enfin un ___ d’Ariane clair pour ___ le nœud gordien des archives.',
        ['talon', 'fil', 'trancher'],
        {
          choices: [
            ['talon', 'bras', 'front'],
            ['fil', 'cœur', 'nœud'],
            ['trancher', 'ouvrir', 'tomber'],
          ],
          explain: b('le talon d’Achille (weak spot), le fil d’Ariane (guiding thread), trancher le nœud gordien (resolve decisively).', 'le talon d’Achille, le fil d’Ariane, trancher le nœud gordien.'),
        },
      ),
      hear(
        'Le rapport d’audit souligne que le réseau électrique est exemplaire, mais que la sécurité des sous-traitants demeure son talon d’Achille.',
        b('What does the audit report identify?', 'Que met en lumière le rapport d’audit ?'),
        [
          b('Subcontractor security is the system’s critical weak point.', 'La sécurité des sous-traitants constitue la vulnérabilité majeure du système.'),
          b('Subcontractors outshine the main power grid in reliability.', 'Les sous-traitants sont plus fiables que le réseau principal.'),
          b('The audit found no flaws anywhere in the infrastructure.', 'L’audit n’a relevé aucune faille dans l’infrastructure.'),
        ],
        {
          voice: 'f',
          explain: b('Le talon d’Achille pinpoints the one vulnerable spot inside an otherwise strong structure.', 'Le talon d’Achille désigne le point faible précis d’un édifice pourtant solide.'),
        },
      ),
      dict(
        'En voulant éviter ce conflit, ils sont tombés de Charybde en Scylla.',
        {
          voice: 'm',
          hint: b('Capitalised Greek names: Charybde (Ch-) and Scylla (Sc- + double l).', 'Majuscules aux noms propres : Charybde et Scylla.'),
        },
      ),
      say(
        'Ce principe simple constitue le fil d’Ariane qui permet de trancher le nœud gordien.',
        'This simple principle forms the guiding thread that lets us cut the Gordian knot.',
      ),
    ],
    [
      b('Trancher le nœud gordien = decisive breakthrough; le fil d’Ariane = guiding thread.', 'Trancher le nœud gordien = solution radicale ; le fil d’Ariane = fil conducteur.'),
      b('Le talon d’Achille = single fatal flaw; ouvrir la boîte de Pandore = unleashing unforeseen chaos.', 'Le talon d’Achille = faille unique ; ouvrir la boîte de Pandore = déchaîner une suite de maux.'),
      b('Tomber de Charybde en Scylla = escaping one trap into a worse one (pronounce [kaʁibd] and [sila]).', 'Tomber de Charybde en Scylla = aller de mal en pis (prononcer [kaʁibd] et [sila]).'),
    ],
    [
      ['trancher le nœud gordien', b('to cut the Gordian knot, solve boldly', 'résoudre d’un geste audacieux un blocage complexe')],
      ['tomber de Charybde en Scylla', b('to go from the frying pan into the fire', 'quitter un danger pour tomber dans un pire')],
      ['ouvrir la boîte de Pandore', b('to open Pandora’s box', 'déclencher une chaîne de problèmes imprévus')],
      ['le talon d’Achille', b('Achilles’ heel, fatal weak spot', 'faille décisive d’une personne ou d’un système')],
      ['le fil d’Ariane', b('guiding thread through complexity', 'fil conducteur qui oriente dans un ensemble complexe')],
    ],
  ),

  lesson(
    C,
    2,
    ['antiquity-and-rome-idioms', 'antiquite-et-rome'],
    b('Antiquity & Rome: Rubicon, Pyrrhus & Damocles', 'Antiquité et Rome : Rubicon, Pyrrhus et Damoclès'),
    b('Point-of-no-return leaps, ruinously costly wins, looming threats and giving Caesar his due.', 'Décisions irréversibles, triomphes ruineux, menaces suspendues et reconnaissance méritée.'),
    [
      b('Contrast franchir le Rubicon with brûler ses vaisseaux', 'Distinguer franchir le Rubicon et brûler ses vaisseaux'),
      b('Use une victoire à la Pyrrhus and une épée de Damoclès accurately', 'Employer une victoire à la Pyrrhus et une épée de Damoclès avec rigueur'),
      b('Invoke rendre à César ce qui appartient à César in secular French arguments', 'Placer rendre à César ce qui appartient à César à propos'),
    ],
    13,
    [
      card(
        b('Ancient turning points in C2 rhetoric', 'Grands tournants antiques dans la rhétorique C2'),
        b(
          'Roman and Hellenistic history supply French with vivid metaphors for irreversible choices and precarious power: **franchir le Rubicon** (crossing the point of no return), **brûler ses vaisseaux** (destroying any means of retreat), **une victoire à la Pyrrhus** (winning at such ruinous cost that it equals defeat), **une épée de Damoclès** (an ever-present threat hanging overhead), and **rendre à César ce qui appartient à César** (giving credit where credit is truly due).\nIrreversible commitment: **franchir le Rubicon · brûler ses vaisseaux**.\nPrecarious triumph & fairness: **une victoire à la Pyrrhus · une épée de Damoclès · rendre à César ce qui appartient à César**.',
          'L’histoire antique nourrit le français soutenu d’images saisissantes sur la décision et le pouvoir : **franchir le Rubicon** (commettre l’acte irréversible), **brûler ses vaisseaux** (se couper toute retraite), **une victoire à la Pyrrhus** (succès obtenu au prix de pertes ruineuses), **une épée de Damoclès** (péril permanent suspendu au-dessus d’une réussite) et **rendre à César ce qui appartient à César** (reconnaître à chacun son dû).\nEngagement sans retour : **franchir le Rubicon · brûler ses vaisseaux**.\nVictoire coûteuse et justice : **une victoire à la Pyrrhus · une épée de Damoclès · rendre à César ce qui appartient à César**.',
        ),
        {
          table: {
            head: [b('Expression', 'Expression'), b('Meaning', 'Sens'), b('Historical note', 'Repère historique')],
            rows: [
              ['franchir le Rubicon', b('to cross the Rubicon, take an irreversible step', 'poser un acte audacieux et irréversible'), b('Caesar crossing into Italy (49 BCE)', 'César franchissant la frontière (49 av. J.-C.)')],
              ['une victoire à la Pyrrhus', b('a Pyrrhic victory, won at devastating cost', 'succès si coûteux qu’il équivaut à une perte'), b('Pyrrhus at Asculum (279 BCE); say [piʁys]', 'Pyrrhus à Asculum ; prononcer le -s [piʁys]')],
              ['une épée de Damoclès', b('sword of Damocles, constant overhanging threat', 'menace constante pesant sur une situation'), b('sword hung by a horsehair over Damocles', 'épée suspendue par un crin chez Denys')],
              ['rendre à César ce qui appartient à César', b('to give credit where credit is due', 'reconnaître à quelqu’un son mérite réel'), b('Gospel formula used broadly in secular French', 'formule devenue laïque pour saluer un mérite')],
              ['brûler ses vaisseaux', b('to burn one’s boats, eliminate any retreat', 'se retirer volontairement toute possibilité de repli'), b('distinct from couper les ponts (social rift)', 'différent de couper les ponts (rupture)')],
            ],
          },
          ex: [
            ['En publiant son rapport dissident, la magistrate a franchi le Rubicon.', 'By publishing her dissenting report, the magistrate crossed the Rubicon.'],
            ['Remporter ce procès après dix ans d’endettement s’apparente à une victoire à la Pyrrhus.', 'Winning this lawsuit after ten years of debt looks like a Pyrrhic victory.'],
            ['Rendons à César ce qui appartient à César : cette réforme repose sur les travaux de notre prédécesseur.', 'Let us give credit where credit is due: this reform rests on our predecessor’s work.'],
          ],
        },
      ),
      trap(
        b('« Brûler ses vaisseaux » ≠ « couper les ponts »; « victoire à la Pyrrhus » ≠ defeat', '« Brûler ses vaisseaux » ≠ « couper les ponts »'),
        b(
          'Do not confuse **brûler ses vaisseaux** (deliberately destroying your own escape route so you must succeed—Agathocles, William the Conqueror, Cortés) with **couper les ponts** (breaking off ties with people). Likewise, **une victoire à la Pyrrhus** IS technically a victory, not an immediate defeat—yet its losses undermine the winner’s future! And always pronounce the final **-s** in **Pyrrhus** (*[piʁys]*).',
          'Ne confondez pas **brûler ses vaisseaux** (détruire ses propres moyens de repli pour s’obliger à vaincre) avec **couper les ponts** (rompre une relation). De même, **une victoire à la Pyrrhus** est bel et bien une victoire sur le papier, mais si coûteuse qu’elle ruine le vainqueur. Prononcez toujours le **-s** final de **Pyrrhus** (*[piʁys]*).',
        ),
      ),
      flash(
        b('Antiquity & Rome', 'Antiquité et Rome'),
        [
          ['franchir le Rubicon', b('to cross the point of no return', 'prendre une décision irréversible et décisive')],
          ['une victoire à la Pyrrhus', b('a victory won at ruinous cost', 'un succès si coûteux qu’il affaiblit le vainqueur')],
          ['une épée de Damoclès', b('a constant overhanging threat', 'un danger permanent suspendu au-dessus de soi')],
          ['rendre à César ce qui appartient à César', b('to give credit where credit is due', 'reconnaître honnêtement le mérite de chacun')],
          ['brûler ses vaisseaux', b('to burn one’s boats, cut off retreat', 's’ôter tout moyen de recul pour aller jusqu’au bout')],
        ],
      ),
      mc(
        P.meaning,
        [
          b('A triumph achieved at such devastating cost that the winner is left crippled.', 'Un succès acquis au prix de pertes si lourdes qu’il fragilise le vainqueur.'),
          b('A swift, bloodless conquest celebrated across the entire empire.', 'Une conquête fulgurante remportée sans la moindre perte.'),
          b('A crushing defeat suffered before the battle even began.', 'Une défaite cuisante essuyée avant même le début des combats.'),
          b('A tie in which both armies withdraw peacefully.', 'Un match nul où les deux camps se retirent sans dommage.'),
        ],
        {
          fr: 'Pour l’opposition, cette réélection obtenue en fracturant la coalition est une victoire à la Pyrrhus.',
          explain: b('Pyrrhus won the battle of Asculum, yet lost so many key troops that another such win would have ruined him.', 'Pyrrhus remporta la bataille d’Asculum mais y perdit tant de forces qu’un autre succès semblable l’eût perdu.'),
        },
      ),
      mc(
        P.complete,
        [
          'brûlé ses vaisseaux',
          'rendu à César',
          'subi une victoire à la Pyrrhus',
          'suspendu une épée de Damoclès',
        ],
        {
          fr: 'En démissionnant de son poste titulaire avant même d’avoir trouvé de mécène pour son laboratoire, cette chercheuse a littéralement ___ .',
          explain: b('Resigning a tenured post before securing funding eliminates any fallback route: brûler ses vaisseaux.', 'Quitter un poste sûr sans plan de repli, c’est se couper toute retraite : brûler ses vaisseaux.'),
        },
      ),
      sort(
        b('Act of commitment, or precarious situation / fairness?', 'Acte sans retour, ou menace et juste reconnaissance ?'),
        [b('Irreversible leap / commitment', 'Décision sans retour'), b('Costly win, threat or fair credit', 'Menace, coût caché ou mérite')],
        [
          ['franchir le Rubicon', 0],
          ['une épée de Damoclès', 1],
          ['brûler ses vaisseaux', 0],
          ['une victoire à la Pyrrhus', 1],
          ['rendre à César ce qui appartient à César', 1],
          ['signer sa démission publique sans retour', 0],
        ],
        { explain: b('Franchir le Rubicon and brûler ses vaisseaux express irreversible commitment; the others evaluate threat, cost or due credit.', 'Franchir le Rubicon et brûler ses vaisseaux marquent l’engagement irrévocable ; les autres évaluent risque, coût ou mérite.') },
      ),
      gap(
        P.complete,
        'En signant ce manifeste, le ministre a franchi le ___ malgré l’épée de ___ qui pèse sur sa coalition ; il faut toutefois rendre à ___ ce qui lui appartient.',
        ['Rubicon', 'Damoclès', 'César'],
        {
          tr: 'By signing this manifesto, the minister crossed the Rubicon despite the sword of Damocles hanging over his coalition; still, one must give Caesar his due.',
          hint: b('Three proper names from antiquity (don’t forget the grave accent on Damoclès).', 'Trois noms propres antiques (n’oubliez pas l’accent grave de Damoclès).'),
          explain: b('franchir le Rubicon, une épée de Damoclès, rendre à César ce qui appartient à César.', 'franchir le Rubicon, une épée de Damoclès, rendre à César ce qui appartient à César.'),
        },
      ),
      ord(
        P.order,
        'Il convient de rendre à César ce qui appartient à César.',
        {
          tr: 'It is right to give credit where credit is due.',
          extra: ['Damoclès', 'appartiennent'],
          explain: b('Singular relative ce qui takes singular verb appartient.', 'Le pronom singulier ce qui appelle le verbe au singulier appartient.'),
        },
      ),
      hear(
        'Le bail arrive à échéance dans six mois et le propriétaire refuse toute garantie de renouvellement : cette incertitude plane sur l’atelier comme une épée de Damoclès.',
        b('How does the speaker describe the lease situation?', 'Comment le locuteur décrit-il la situation du bail ?'),
        [
          b('An ever-present threat hanging over the workshop’s survival.', 'Une menace constante qui pèse sur l’avenir de l’atelier.'),
          b('A decisive victory that secured the workshop for decades.', 'Une victoire décisive garantissant l’atelier pour longtemps.'),
          b('A sudden, clean break initiated by the workshop itself.', 'Une rupture volontaire décidée par les artisans eux-mêmes.'),
        ],
        {
          voice: 'm',
          explain: b('Une épée de Damoclès evokes imminent danger hanging by a thread over normal activity.', 'Une épée de Damoclès évoque un péril permanent prêt à s’abattre à tout instant.'),
        },
      ),
      say(
        'En quittant ce ministère sans filet, elle a brûlé ses vaisseaux et franchi le Rubicon.',
        'By leaving that ministry without a safety net, she burned her boats and crossed the Rubicon.',
      ),
    ],
    [
      b('Franchir le Rubicon = irreversible step; brûler ses vaisseaux = cutting off one’s own retreat.', 'Franchir le Rubicon = acte irréversible ; brûler ses vaisseaux = se couper toute retraite.'),
      b('Une victoire à la Pyrrhus (pronounce [piʁys]) = win whose losses undo its gain.', 'Une victoire à la Pyrrhus (prononcer [piʁys]) = triomphe si coûteux qu’il affaiblit le vainqueur.'),
      b('Une épée de Damoclès = constant overhanging threat; rendre à César… = giving fair credit.', 'Une épée de Damoclès = menace suspendue ; rendre à César… = reconnaître le mérite d’autrui.'),
    ],
    [
      ['franchir le Rubicon', b('to cross the point of no return', 'prendre une décision irréversible et décisive')],
      ['une victoire à la Pyrrhus', b('a victory won at ruinous cost', 'un succès si coûteux qu’il affaiblit le vainqueur')],
      ['une épée de Damoclès', b('a constant overhanging threat', 'un danger permanent suspendu au-dessus de soi')],
      ['rendre à César ce qui appartient à César', b('to give credit where credit is due', 'reconnaître honnêtement le mérite de chacun')],
      ['brûler ses vaisseaux', b('to burn one’s boats, cut off retreat', 's’ôter tout moyen de recul pour aller jusqu’au bout')],
    ],
  ),

  lesson(
    C,
    3,
    ['european-history-and-legacy', 'histoire-et-memoire-c2'],
    b('History & political memory: Canossa to Aventin', 'Histoire et mémoire politique : de Canossa à l’Aventin'),
    b('Decode rare C2 historical idioms heard in French editorials, parliamentary debates and literary criticism.', 'Décrypter les expressions historiques rares des éditoriaux, débats parlementaires et essais C2.'),
    [
      b('Use aller à Canossa and rester sur son Aventin with exact political nuance', 'Manier aller à Canossa et rester sur son Aventin avec précision politique'),
      b('Distinguish c’est la Bérézina from un chant du cygne', 'Opposer c’est la Bérézina et un chant du cygne'),
      b('Use avoir voix au chapitre in institutional and personal contexts', 'Employer avoir voix au chapitre dans des cadres formels ou personnels'),
    ],
    13,
    [
      card(
        b('From medieval chapters to modern retreats', 'Des chapitres médiévaux aux joutes contemporaines'),
        b(
          'Five historical expressions give C2 French remarkable compactness: **aller à Canossa** (making a humiliating climb-down before an opponent), **c’est la Bérézina** (a chaotic disaster or rout), **un chant du cygne** (a final masterwork or luminous farewell before decline), **avoir voix au chapitre** (holding real influence in a decision-making body), and **rester sur son Aventin** (sulking in proud, stubborn abstention rather than engaging).\nSubmission & rout: **aller à Canossa · c’est la Bérézina**.\nInfluence, protest & finale: **avoir voix au chapitre · rester sur son Aventin · un chant du cygne**.',
          'Cinq expressions historiques donnent au français C2 une densité remarquable : **aller à Canossa** (céder avec humiliation devant un adversaire), **c’est la Bérézina** (une déroute ou catastrophe totale), **un chant du cygne** (une ultime œuvre éclatante avant de s’effacer), **avoir voix au chapitre** (peser réellement dans une décision) et **rester sur son Aventin** (bouder à l’écart par orgueil ou protestation).\nCapitulation et désastre : **aller à Canossa · c’est la Bérézina**.\nInfluence, retrait et ultime éclat : **avoir voix au chapitre · rester sur son Aventin · un chant du cygne**.',
        ),
        {
          table: {
            head: [b('Expression', 'Expression'), b('Meaning', 'Sens'), b('Historical origin', 'Origine historique')],
            rows: [
              ['aller à Canossa', b('to eat humble pie, submit to a rival', 'se soumettre humblement à un adversaire'), b('Emperor Henry IV before Gregory VII (1077)', 'Henri IV implorant Grégoire VII (1077)')],
              ['c’est la Bérézina', b('it’s a complete disaster / total rout', 'c’est un fiasco, une déroute complète'), b('Napoleon’s 1812 retreat across the Berezina', 'passage catastrophique de la Bérézina (1812)')],
              ['un chant du cygne', b('a swan song, brilliant final work', 'dernière création majeure avant la fin'), b('ancient belief that swans sing before dying', 'croyance antique sur l’ultime chant du cygne')],
              ['avoir voix au chapitre', b('to have a real say in decisions', 'avoir le droit de peser sur une décision'), b('monastic chapter assembly (chapitre)', 'assemblée capitulaire des chanoines ou moines')],
              ['rester sur son Aventin', b('to sulk on the sidelines in proud protest', 'se tenir à l’écart par bouderie ou fierté'), b('Roman plebeians withdrawing to the Aventine (494 BCE)', 'retraite de la plèbe sur le mont Aventin')],
            ],
          },
          ex: [
            ['Après avoir juré de ne jamais négocier, le syndicat a dû aller à Canossa devant le ministère.', 'After vowing never to negotiate, the union had to make a humiliating climb-down before the ministry.'],
            ['Ce dernier recueil, d’une beauté crépusculaire, fut le véritable chant du cygne du poète.', 'That final collection, of a twilight beauty, was the poet’s true swan song.'],
            ['Tant que les jeunes chercheuses n’auront pas voix au chapitre, la réforme restera incomplète.', 'As long as junior researchers have no say in decisions, the reform will remain incomplete.'],
          ],
        },
      ),
      culture(
        b('Canossa, chapitre and Aventin in French political journalism', 'Canossa, chapitre et Aventin dans le journalisme français'),
        b(
          'French political commentary treats medieval and Roman history as living shorthand. **Avoir voix au chapitre** comes from the monastery *chapitre* (chapter house) where only full members held a vote—notice **voix** (voice/vote), never *voie* (way)! Meanwhile, **rester (or se retirer) sur son Aventin** recalls the plebeians’ 494 BCE strike on Rome’s Aventine Hill: refusing to negotiate while watching from your high horse.',
          'La presse politique française mobilise l’histoire médiévale et romaine comme un raccourci vivant. **Avoir voix au chapitre** vient du *chapitre* monastique où seuls les membres titulaires avaient droit de vote — notez **voix** (et jamais *voie*) ! Quant à **rester sur son Aventin**, il évoque la sécession de la plèbe romaine en 494 av. J.-C., campant dans une bouderie hautaine.',
        ),
      ),
      mc(
        P.meaning,
        [
          b('He withdrew into proud, sulky abstention rather than joining the debate.', 'Il s’est enfermé dans une bouderie hautaine au lieu de prendre part au débat.'),
          b('He travelled to Rome to sign a historic peace treaty.', 'Il s’est rendu à Rome pour signer un traité de paix historique.'),
          b('He changed sides enthusiastically mid-campaign.', 'Il a changé de camp avec enthousiasme en pleine campagne.'),
          b('He delivered a brilliant final speech before retiring.', 'Il a prononcé un ultime discours éclatant avant son départ.'),
        ],
        {
          fr: 'Au lieu de proposer des amendements constructifs, le sénateur préfère rester sur son Aventin.',
          explain: b('Rester sur son Aventin means holding aloof in proud protest or sulking rather than engaging.', 'Rester sur son Aventin signifie bouder à l’écart par fierté au lieu de négocier.'),
        },
      ),
      pairs(
        P.match,
        [
          ['aller à Canossa', b('to make a humiliating climb-down', 's’incliner humblement devant un rival')],
          ['c’est la Bérézina', b('it’s a total fiasco or rout', 'c’est un désastre complet')],
          ['un chant du cygne', b('a swan song, brilliant final act', 'ultime œuvre éclatante avant le retrait')],
          ['avoir voix au chapitre', b('to have a real say in a decision', 'peser réellement dans une délibération')],
          ['rester sur son Aventin', b('to sulk aloof in proud protest', 'rester à l’écart par bouderie hautaine')],
        ],
      ),
      hear(
        'Le lancement du nouveau logiciel comptable devait simplifier nos bilans ; dès la première semaine, ce fut la Bérézina : factures doublées, archives illisibles et clients furieux.',
        b('How did the software launch turn out?', 'Comment s’est déroulé le lancement du logiciel ?'),
        [
          b('It turned into an utter, chaotic disaster.', 'Il a tourné au fiasco total et désorganisé.'),
          b('It achieved a narrow, expensive victory over competitors.', 'Il a permis une victoire coûteuse sur les concurrents.'),
          b('It marked the developer’s acclaimed final masterpiece.', 'Il a représenté l’ultime chef-d’œuvre acclamé de l’éditeur.'),
        ],
        {
          voice: 'f2',
          explain: b('C’est la Bérézina describes an overwhelming disaster or chaotic breakdown.', 'C’est la Bérézina qualifie un échec massif et chaotique.'),
        },
      ),
      dlg(
        b('Editorial board post-mortem', 'Bilan au comité de rédaction'),
        b('Claire and Julien review a difficult cultural festival edition and its aftermath.', 'Claire et Julien tirent le bilan d’une édition mouvementée d’un festival culturel.'),
        [['Claire', 'f'], ['Julien', 'm2']],
        [
          [0, 'Franchement, entre les pannes de son et l’annulation des deux têtes d’affiche, cette ouverture a été difficile…', 'Honestly, between the sound failures and both headliners cancelling, that opening night was rough…'],
          [1, {
            options: [
              'Disons les choses net : côté organisation, ç’a été la Bérézina ! Et le fondateur refuse encore de reconnaître ses torts.',
              'Oui, c’était le chant du cygne dès la première minute de répétition.',
              'Heureusement, nous avons eu voix au chapitre sur la météo.',
            ],
            explain: b('A chaotic logistical collapse is c’est la Bérézina (note ç’a été in formal past speech).', 'Un naufrage logistique se dit c’est la Bérézina.'),
          }],
          [0, 'C’est précisément ce que je lui reproche : il reste sur son Aventin au lieu de réunir les techniciens.', 'That is exactly what I blame him for: he stays aloof on his high horse instead of meeting the crew.'],
          [1, {
            options: [
              'Il finira par aller à Canossa si les mécènes exigent que toute l’équipe ait désormais voix au chapitre.',
              'Il faudra qu’il ouvre son chant du cygne pour rester sur son Aventin.',
              'Le Rubicon appartient déjà à César, donc personne ne négociera.',
            ],
            explain: b('Being forced to climb down humbly = aller à Canossa; giving the crew a say = avoir voix au chapitre.', 'Céder sous la pression = aller à Canossa ; associer l’équipe aux décisions = avoir voix au chapitre.'),
          }],
          [0, 'Pourtant, le concert final de dimanche soir avait quelque chose d’un chant du cygne magnifique.', 'Still, Sunday night’s closing concert felt like a magnificent swan song.'],
          [1, 'Espérons plutôt que ce ne soit pas la fin du festival, mais un rebond pour l’an prochain.', 'Let’s hope instead that it isn’t the end of the festival, just a rebound for next year.'],
        ],
      ),
      dict(
        'Plutôt que de rester sur son Aventin, mieux vaut avoir voix au chapitre.',
        {
          voice: 'm2',
          hint: b('Capitalise Aventin and spell voix with -x (voice/vote).', 'Majuscule à Aventin et orthographe voix avec un -x.'),
        },
      ),
      write(
        b('C2 historical-metaphor commentary', 'Chronique C2 aux allusions historiques'),
        b('In 100–160 words, write a crisp editorial paragraph analysing a political, institutional or artistic crisis (real or imagined). Weave at least four mythological or historical expressions from this course accurately into your argument.', 'En 100 à 160 mots, rédigez une chronique analysant une crise politique, institutionnelle ou artistique (réelle ou fictive). Tissez avec justesse au moins quatre expressions mythologiques ou historiques de ce cours.'),
        100,
        160,
        [
          b('At least four expressions from the course used accurately', 'Au moins quatre expressions du cours employées avec exactitude'),
          b('Seamless analytical flow without forced accumulation', 'Intégration fluide au service d’une thèse claire'),
          b('Controlled C2 syntax, punctuation and spelling of proper nouns', 'Syntaxe C2, ponctuation et orthographe irréprochable des noms propres'),
        ],
        'Longtemps, la direction du théâtre a refusé d’associer les metteurs en scène aux choix budgétaires, oubliant qu’à force de ne pas avoir voix au chapitre, les artistes finissent par s’éloigner. La saison dernière fut la Bérézina : salles clairsemées, déficit record et démissions en chaîne. Pourtant, le président du conseil a d’abord choisi de rester sur son Aventin, persuadé qu’un changement de programmation suffirait. C’était méconnaître le talon d’Achille de l’institution : une gouvernance coupée du plateau. Sous la pression des tutelles publiques, il vient enfin d’aller à Canossa en ouvrant les statuts à une codirection artistique. Espérons que cette réforme tranche le nœud gordien avant que la maison n’entonne son chant du cygne.',
        {
          phrases: ['Longtemps…', 'avoir voix au chapitre', 'rester sur son Aventin', 'le talon d’Achille', 'trancher le nœud gordien'],
          modelNote: b('Notice how the historical idioms reinforce one another logically: exclusion → disaster → proud aloofness → root flaw → climb-down → breakthrough.', 'Remarquez la progression logique : exclusion → fiasco → bouderie → faille centrale → reculade → sursaut.'),
        },
      ),
    ],
    [
      b('Aller à Canossa = humiliating climb-down; rester sur son Aventin = sulking aloof in proud protest.', 'Aller à Canossa = reculade humiliante ; rester sur son Aventin = bouder à l’écart par fierté.'),
      b('C’est la Bérézina = complete rout/disaster; un chant du cygne = brilliant final work.', 'C’est la Bérézina = désastre complet ; un chant du cygne = ultime création éclatante.'),
      b('Avoir voix au chapitre (with -x!) = having real weight in collective decisions.', 'Avoir voix au chapitre (avec -x !) = peser réellement dans une décision.'),
    ],
    [
      ['aller à Canossa', b('to make a humiliating climb-down', 's’incliner humblement devant un rival')],
      ['c’est la Bérézina', b('it’s a total fiasco or rout', 'c’est un désastre complet')],
      ['un chant du cygne', b('a swan song, brilliant final act', 'ultime œuvre éclatante avant le retrait')],
      ['avoir voix au chapitre', b('to have a real say in a decision', 'peser réellement dans une délibération')],
      ['rester sur son Aventin', b('to sulk aloof in proud protest', 'rester à l’écart par bouderie hautaine')],
    ],
  ),
];

export default lessons;
