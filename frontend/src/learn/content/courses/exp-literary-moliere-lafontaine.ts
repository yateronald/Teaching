import type { CourseAbout, Lesson } from '../../types';
import { P, b, card, culture, dict, dlg, flash, gap, hear, lesson, mc, ord, pairs, say, sort, tip, trap, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Master the literary idioms woven into educated French from La Fontaine, Molière and classical prose. Catch fable allusions (la mouche du coche, lâcher la proie pour l’ombre, tirer les marrons du feu), Molière’s comic archetypes (un tartuffe, faire de la prose sans le savoir, galère) and enduring 17th–19th-century expressions (le jeu n’en vaut pas la chandelle, jeter le manche après la cognée).',
    'Maîtrisez les expressions littéraires héritées de La Fontaine, de Molière et des classiques du XVIIe au XIXe siècle. Saisissez les allusions des fables (la mouche du coche, lâcher la proie pour l’ombre, tirer les marrons du feu), les traits moliéresques (un tartuffe, faire de la prose sans le savoir, galère) et les formules classiques (le jeu n’en vaut pas la chandelle, jeter le manche après la cognée).',
  ),
  outcomes: [
    b('Interpret La Fontaine fable idioms accurately, including modern semantic shifts', 'Interpréter avec finesse les expressions des Fables et leurs glissements de sens modernes'),
    b('Recognise Molière’s famous lines and theatrical metaphors in live debate', 'Repérer et employer les répliques célèbres et métaphores théâtrales de Molière'),
    b('Deploy classical 17th–19th-century formulas with exact gender and syntax', 'Manier les tournures classiques avec leur genre exact et leur syntaxe figée'),
  ],
};

const C = 'exp-literary-moliere-lafontaine';

const lessons: Lesson[] = [
  lesson(
    C,
    1,
    ['la-fontaine-fables-idioms', 'expressions-fables-de-la-fontaine'],
    b('La Fontaine’s Fables & classic comic imagery', 'Fables de La Fontaine et verve classique'),
    b('Spot meddlesome busybodies, risky pawns, hollow illusions and premature triumph.', 'Démasquer les faux actifs, les dupes, les illusions flatteuses et les victoires prématurées.'),
    [
      b('Use la mouche du coche, lâcher la proie pour l’ombre and partager la peau de l’ours', 'Employer la mouche du coche, lâcher la proie pour l’ombre et partager la peau de l’ours'),
      b('Distinguish the original fable sense of tirer les marrons du feu from its modern shift', 'Distinguer le sens classique et le glissement moderne de tirer les marrons du feu'),
      b('Identify who ends up être le dindon de la farce in negotiations', 'Repérer qui risque d’être le dindon de la farce dans une négociation'),
    ],
    13,
    [
      card(
        b('Fables turned into everyday shorthand', 'Des fables devenues des raccourcis moraux'),
        b(
          'Jean de La Fontaine’s *Fables* live on inside modern French editorials: **la mouche du coche** (the bustling nuisance claiming credit for others’ sweat), **lâcher la proie pour l’ombre** (dropping something real for a mirage), **partager la peau de l’ours** (celebrating or dividing spoils before the catch is secured), and **tirer les marrons du feu** (taking the burns for someone else’s gain—or, in newer usage, pulling off a win). Paired with **être le dindon de la farce** from classical French comedy, they dissect ambition and gullibility in seconds.\nIllusion & haste: **lâcher la proie pour l’ombre · partager la peau de l’ours**.\nVanity & dupes: **la mouche du coche · tirer les marrons du feu · être le dindon de la farce**.',
          'Les *Fables* de La Fontaine irriguent encore la langue soutenue : **la mouche du coche** (l’importun qui s’agite et s’attribue le mérite du travail d’autrui), **lâcher la proie pour l’ombre** (sacrifier un bien réel pour un mirage), **partager la peau de l’ours** (compter sur un gain encore incertain) et **tirer les marrons du feu** (se brûler pour le profit d’un autre — ou, au sens moderne, en retirer un avantage). Avec **être le dindon de la farce**, hérité de la tradition comique, ces images croquent vanité et naïveté.\nIllusion et précipitation : **lâcher la proie pour l’ombre · partager la peau de l’ours**.\nVanité et duperie : **la mouche du coche · tirer les marrons du feu · être le dindon de la farce**.',
        ),
        {
          table: {
            head: [b('Expression', 'Expression'), b('Meaning', 'Sens'), b('Literary source', 'Source littéraire')],
            rows: [
              ['la mouche du coche', b('meddlesome busybody claiming credit', 'importun s’agitant sans aider mais s’attribuant le succès'), b('La Fontaine, VII, 9 (Le Coche et la Mouche)', 'La Fontaine, VII, 9 (Le Coche et la Mouche)')],
              ['tirer les marrons du feu', b('originally: do risky work for another’s profit; modern: snatch a benefit', 'à l’origine : se brûler pour autrui ; sens récent : profiter habilement'), b('La Fontaine, IX, 17 (Le Singe et le Chat)', 'La Fontaine, IX, 17 (Le Singe et le Chat)')],
              ['lâcher la proie pour l’ombre', b('to give up something real for an illusion', 'abandonner un acquis sûr pour une promesse illusoire'), b('La Fontaine, VI, 17 (Le Chien…)', 'La Fontaine, VI, 17 (Le Chien…)')],
              ['partager la peau de l’ours', b('to count chickens before they hatch', 'disposer d’un succès avant même de l’avoir obtenu'), b('La Fontaine, V, 20 (L’Ours et les Deux Compagnons)', 'La Fontaine, V, 20 (L’Ours…)')],
              ['être le dindon de la farce', b('to be the dupe / fall guy of the scheme', 'être la victime naïve d’une tromperie'), b('classical comic theatre & farce tradition', 'tradition théâtrale et comique classique')],
            ],
          },
          ex: [
            ['Il n’a rédigé aucune page du rapport, mais il joue la mouche du coche devant les journalistes.', 'He hasn’t written a single page of the report, yet he plays the busybody taking credit in front of journalists.'],
            ['Quitter un poste stable pour une promesse verbale, ce serait lâcher la proie pour l’ombre.', 'Leaving a steady post for a verbal promise would be dropping substance for a shadow.'],
            ['L’appel d’offres n’est pas signé : ne partageons pas la peau de l’ours trop vite !', 'The tender isn’t signed yet: let’s not divide the bearskin too soon!'],
          ],
        },
      ),
      culture(
        b('The curious evolution of « tirer les marrons du feu »', 'Le curieux glissement de « tirer les marrons du feu »'),
        b(
          'In La Fontaine’s *Le Singe et le Chat*, the clever monkey Bertrand flatters the cat Raton into pulling roasting chestnuts out of the embers—then eats them all while Raton gets burned. So classically, **tirer les marrons du feu** meant taking the risks so another person reaps the prize (often paired with *être le dindon de la farce*). Over the 20th century, speakers began using it positively to mean *snatching a reward from a tricky situation*; at C2, know **both** meanings!',
          'Dans *Le Singe et le Chat*, Bertrand flatte Raton pour qu’il retire les châtaignes des braises — et les croque toutes pendant que le chat se brûle la patte. Au sens classique, **tirer les marrons du feu** signifie donc prendre les risques pour le profit d’autrui. Par glissement moderne, on l’emploie parfois positivement (« tirer avantage d’une crise ») ; au C2, connaissez les **deux** sens !',
        ),
      ),
      flash(
        b('La Fontaine & comic fables', 'Fables et comédie classique'),
        [
          ['la mouche du coche', b('meddlesome busybody claiming credit', 'personne inutile qui s’agite et s’attribue le mérite')],
          ['tirer les marrons du feu', b('to take the risks for someone else’s gain (or snatch an advantage)', 'prendre les risques pour autrui (ou en retirer profit)')],
          ['lâcher la proie pour l’ombre', b('to trade real certainty for an illusion', 'perdre un bien concret en poursuivant un mirage')],
          ['partager la peau de l’ours', b('to divide spoils before winning them', 'escompter un gain avant d’avoir réussi')],
          ['être le dindon de la farce', b('to be the dupe / laughing stock', 'être la victime naïve d’une manœuvre')],
        ],
      ),
      mc(
        P.meaning,
        [
          b('She hovers around everyone else’s work, getting in the way while claiming credit.', 'Elle s’agite autour du travail des autres et s’en attribue le mérite sans aider.'),
          b('She quietly carries the heaviest load while everyone else rests.', 'Elle accomplit seule la part la plus pénible du travail.'),
          b('She resolves a transport strike efficiently behind the scenes.', 'Elle règle efficacement une crise de transport en toute discrétion.'),
          b('She refuses to get involved in any team project.', 'Elle refuse de participer aux projets collectifs.'),
        ],
        {
          fr: 'Dans ce projet, Julien joue toujours la mouche du coche.',
          explain: b('In La Fontaine’s fable, the fly buzzes around the horses’ ears and boasts of driving the coach uphill.', 'Dans la fable, la mouche bourdonne autour de l’attelage puis s’attribue l’effort de la montée.'),
        },
      ),
      mc(
        P.complete,
        [
          'être le dindon de la farce',
          'lâcher l’ombre pour la proie',
          'jouer la mouche du coche',
          'partager la peau du singe',
        ],
        {
          fr: 'Tous ses partenaires ont touché les primes tandis que lui seul assumait les pertes : il a fini par ___ .',
          explain: b('Being left holding the bag while partners take the gains is être le dindon de la farce.', 'Assumer seul les pertes pendant que les autres encaissent, c’est être le dindon de la farce.'),
        },
      ),
      pairs(
        P.match,
        [
          ['la mouche du coche', b('meddlesome busybody claiming credit', 'personne inutile qui s’agite et s’attribue le mérite')],
          ['tirer les marrons du feu', b('to take the risks for someone else’s gain (or snatch an advantage)', 'prendre les risques pour autrui (ou en retirer profit)')],
          ['lâcher la proie pour l’ombre', b('to trade real certainty for an illusion', 'perdre un bien concret en poursuivant un mirage')],
          ['partager la peau de l’ours', b('to divide spoils before winning them', 'escompter un gain avant d’avoir réussi')],
          ['être le dindon de la farce', b('to be the dupe / laughing stock', 'être la victime naïve d’une manœuvre')],
        ],
      ),
      gap(
        P.complete,
        'Tant que l’accord n’est pas ratifié, évitons de partager la ___ de l’ours, et gardons-nous surtout de ___ la proie pour l’___ en courant après une promesse vague.',
        ['peau', 'lâcher', 'ombre'],
        {
          choices: [
            ['peau', 'farce', 'mouche'],
            ['lâcher', 'tirer', 'partager'],
            ['ombre', 'proie', 'coche'],
          ],
          explain: b('partager la peau de l’ours; lâcher la proie pour l’ombre.', 'partager la peau de l’ours ; lâcher la proie pour l’ombre.'),
        },
      ),
      hear(
        'Dans cette négociation, le grand groupe a habilement laissé la jeune entreprise essuyer toutes les critiques réglementaires : c’est elle qui a tiré les marrons du feu pour son rival.',
        b('What happened to the start-up in this negotiation?', 'Qu’est-il arrivé à la jeune entreprise dans cette négociation ?'),
        [
          b('It took all the heat and risk while the larger rival reaped the benefit.', 'Elle a assumé tous les risques et critiques au profit de son rival.'),
          b('It withdrew from the talks early without losing anything.', 'Elle s’est retirée à temps sans subir aucun dommage.'),
          b('It shared the chestnuts evenly with all competitors.', 'Elle a partagé équitablement les bénéfices avec ses concurrents.'),
        ],
        {
          voice: 'm',
          explain: b('Here the speaker uses the classical La Fontaine meaning: taking the burns for someone else’s gain.', 'Ici, le sens classique de la fable prévaut : subir les risques au bénéfice d’un autre.'),
        },
      ),
      dict(
        'Ne lâchons pas la proie pour l’ombre et ne partageons pas la peau de l’ours.',
        {
          voice: 'f',
          hint: b('First-person plural imperative on lâcher and partager (-eons after g).', 'Impératif à la 1re personne du pluriel : lâchons, partageons (avec e après g).'),
        },
      ),
      say(
        'Au lieu de jouer la mouche du coche, vérifions que nous ne sommes pas le dindon de la farce.',
        'Instead of playing the meddlesome busybody, let’s make sure we aren’t the fall guy.',
      ),
    ],
    [
      b('La mouche du coche = bustling busybody claiming credit; être le dindon de la farce = being the dupe.', 'La mouche du coche = l’importun qui s’attribue le mérite ; être le dindon de la farce = être berné.'),
      b('Lâcher la proie pour l’ombre = trading certainty for an illusion; partager la peau de l’ours = counting spoils early.', 'Lâcher la proie pour l’ombre = céder le sûr pour l’illusoire ; partager la peau de l’ours = vendre la victoire trop tôt.'),
      b('Tirer les marrons du feu: classical (take risks for another) vs modern (snatch a tricky win).', 'Tirer les marrons du feu : sens classique (se brûler pour autrui) vs sens moderne (en tirer profit).'),
    ],
    [
      ['la mouche du coche', b('meddlesome busybody claiming credit', 'personne inutile qui s’agite et s’attribue le mérite')],
      ['tirer les marrons du feu', b('to take the risks for someone else’s gain (or snatch an advantage)', 'prendre les risques pour autrui (ou en retirer profit)')],
      ['lâcher la proie pour l’ombre', b('to trade real certainty for an illusion', 'perdre un bien concret en poursuivant un mirage')],
      ['partager la peau de l’ours', b('to divide spoils before winning them', 'escompter un gain avant d’avoir réussi')],
      ['être le dindon de la farce', b('to be the dupe / laughing stock', 'être la victime naïve d’une manœuvre')],
    ],
  ),

  lesson(
    C,
    2,
    ['moliere-theatre-idioms', 'expressions-moliere-et-theatre'],
    b('Molière & the French stage', 'Molière et la scène classique'),
    b('Quote Scapin and Monsieur Jourdain effortlessly and unmask pious hypocrisy and dramatic twists.', 'Citer Scapin et Monsieur Jourdain à propos, démasquer les tartuffes et nommer les coups de théâtre.'),
    [
      b('Quote que diable allait-il faire dans cette galère and faire de la prose sans le savoir', 'Employer que diable allait-il faire dans cette galère et faire de la prose sans le savoir'),
      b('Use un tartuffe (lowercase noun) and un coup de théâtre naturally', 'Manier un tartuffe (nom commun) et un coup de théâtre avec justesse'),
      b('Avoid confusing ménager la chèvre et le chou with financial thrift', 'Éviter toute confusion sur ménager la chèvre et le chou'),
    ],
    13,
    [
      card(
        b('Molière and classical stagecraft in living French', 'Molière et la scène au cœur de la langue'),
        b(
          'Molière shaped French wit so deeply that two of his lines are spoken daily without attribution: **« Que diable allait-il faire dans cette galère ? »** (*Les Fourberies de Scapin*—why on earth did he get into that hopeless mess?) and **faire de la prose sans le savoir** (*Le Bourgeois gentilhomme*—exercising a refined skill or method unconsciously). Alongside **un tartuffe** (a pious hypocrite, from *Tartuffe*), **un coup de théâtre** (a sudden plot reversal) and **ménager la chèvre et le chou** (trying to placate two incompatible sides), they animate political satire and everyday banter alike.\nMolière’s stage: **que diable allait-il faire dans cette galère · faire de la prose sans le savoir · un tartuffe**.\nDrama & balancing acts: **un coup de théâtre · ménager la chèvre et le chou**.',
          'Molière a laissé deux répliques passées dans l’usage quotidien : **« Que diable allait-il faire dans cette galère ? »** (*Les Fourberies de Scapin* — quelle folie l’a poussé dans ce guêpier ?) et **faire de la prose sans le savoir** (*Le Bourgeois gentilhomme* — pratiquer une méthode savante d’instinct). Avec **un tartuffe** (faux dévot hypocrite), **un coup de théâtre** (renversement brusque) et **ménager la chèvre et le chou** (chercher à contenter deux camps inconciliables), le théâtre éclaire le réel.\nHéritage de Molière : **que diable allait-il faire dans cette galère · faire de la prose sans le savoir · un tartuffe**.\nScène et compromis : **un coup de théâtre · ménager la chèvre et le chou**.',
        ),
        {
          table: {
            head: [b('Expression', 'Expression'), b('Meaning', 'Sens'), b('Literary / usage note', 'Repère littéraire et usage')],
            rows: [
              ['que diable allait-il faire dans cette galère', b('what on earth got him into that mess?', 'pourquoi diable s’est-il lancé dans cette affaire ?'), b('Les Fourberies de Scapin (II, 7)', 'Les Fourberies de Scapin (II, 7)')],
              ['faire de la prose sans le savoir', b('to use a sophisticated technique unknowingly', 'appliquer une règle savante sans en avoir conscience'), b('Le Bourgeois gentilhomme (II, 4)', 'Le Bourgeois gentilhomme (II, 4)')],
              ['ménager la chèvre et le chou', b('to try to keep two opposing sides happy at once', 'tenter de satisfaire deux intérêts contraires'), b('ménager = handle carefully, NOT save money', 'ménager = traiter avec tact, pas économiser')],
              ['un tartuffe', b('a sanctimonious hypocrite', 'un hypocrite jouant la vertu ou la dévotion'), b('lowercase common noun; cf. la tartuferie (1 f)', 'nom commun minuscule ; cf. tartuferie (un seul f)')],
              ['un coup de théâtre', b('a sudden, dramatic reversal of events', 'un rebondissement spectaculaire et imprévu'), b('17th-century drama, now general press/speech', 'né au XVIIe s., usuel dans la presse')],
            ],
          },
          ex: [
            ['Il a voulu diriger trois filiales en faillite : mais que diable allait-il faire dans cette galère ?', 'He insisted on running three bankrupt subsidiaries: what on earth got him into that mess?'],
            ['Cet artisan applique déjà les principes du design circulaire — il fait de la prose sans le savoir !', 'That craftsman already applies circular design principles—he speaks prose without knowing it!'],
            ['Coup de théâtre en séance plénière : le rapporteur a retiré son propre amendement.', 'Dramatic twist in the plenary session: the rapporteur withdrew his own amendment.'],
          ],
        },
      ),
      trap(
        b('Watch « ménager » and « tartuffe » vs « tartuferie »', 'Pièges sur « ménager » et « tartuffe » / « tartuferie »'),
        b(
          'In **ménager la chèvre et le chou**, the verb **ménager** means *to spare / treat gently* (from the old ferry riddle: keep the hungry goat from eating the cabbage!), never “to manage a budget” or “to clean house” (*faire le ménage*). And check spelling: **un tartuffe** (the person) takes **ff**, whereas the abstract noun **la tartuferie** (*hypocrisy*) traditionally takes only **one f**!',
          'Dans **ménager la chèvre et le chou**, **ménager** signifie *épargner, traiter avec prudence* (et non « nettoyer » ni « gérer »). Côté orthographe, **un tartuffe** (l’individu hypocrite) prend **deux f**, mais le nom abstrait **la tartuferie** s’écrit avec **un seul f** !',
        ),
      ),
      flash(
        b('Molière & the stage', 'Molière et la scène'),
        [
          ['que diable allait-il faire dans cette galère', b('what on earth made him get into that mess?', 'pourquoi s’est-il fourré dans une pareille impasse ?')],
          ['faire de la prose sans le savoir', b('to do something refined without realising it', 'pratiquer un art ou une méthode d’instinct')],
          ['ménager la chèvre et le chou', b('to try to please two conflicting sides', 'concilier deux parties aux intérêts opposés')],
          ['un tartuffe', b('a sanctimonious hypocrite', 'un faux dévot, un imposteur moral')],
          ['un coup de théâtre', b('a sudden dramatic turn of events', 'un revirement brutal et spectaculaire')],
        ],
      ),
      mc(
        P.meaning,
        [
          b('She already uses advanced statistical reasoning instinctively without knowing the formal term.', 'Elle applique instinctivement des méthodes savantes sans connaître leur nom technique.'),
          b('She writes dull novels instead of poetry by mistake.', 'Elle rédige des romans médiocres en pensant écrire des vers.'),
          b('She hides her literary manuscripts from her philosophy tutor.', 'Elle dissimule ses manuscrits littéraires à son professeur.'),
          b('She refuses to speak eloquently in public.', 'Elle refuse de s’exprimer de façon soignée en public.'),
        ],
        {
          fr: 'En négociant de la sorte, elle fait de la prose sans le savoir.',
          explain: b('Echoing Monsieur Jourdain, the idiom praises someone naturally practising a concept they have never formally studied.', 'Comme Monsieur Jourdain, elle pratique sans s’en douter une discipline savante.'),
        },
      ),
      mc(
        P.complete,
        [
          'un coup de théâtre',
          'une galère sans savoir',
          'la chèvre et le chou',
          'un tartuffe littéraire',
        ],
        {
          fr: 'Alors que chacun tenait la réélection pour acquise, le retrait du candidat favori à minuit a provoqué ___ .',
          explain: b('A sudden, stunning reversal at the eleventh hour is un coup de théâtre.', 'Un revirement spectaculaire de dernière minute constitue un coup de théâtre.'),
        },
      ),
      sort(
        b('Direct Molière allusion, or broader stage/social idiom?', 'Allusion directe à Molière, ou image théâtrale / sociale générale ?'),
        [b('Directly from a Molière play', 'Issu directement d’une pièce de Molière'), b('Classical theatrical or social idiom', 'Image scénique ou morale plus large')],
        [
          ['que diable allait-il faire dans cette galère', 0],
          ['ménager la chèvre et le chou', 1],
          ['faire de la prose sans le savoir', 0],
          ['un coup de théâtre', 1],
          ['un tartuffe', 0],
          ['concilier deux camps adverses sans froisser personne', 1],
        ],
        { explain: b('Scapin (galère), Le Bourgeois gentilhomme (prose) and Tartuffe come straight from Molière; coup de théâtre and la chèvre et le chou belong to wider classical tradition.', 'Scapin, Monsieur Jourdain et Tartuffe viennent tout droit de Molière ; coup de théâtre et la chèvre et le chou relèvent d’un fonds plus vaste.') },
      ),
      gap(
        P.complete,
        'Pour éviter de passer pour un ___, cessez enfin de vouloir ménager la ___ et le ___ face à deux camps irréconciliables.',
        ['tartuffe', 'chèvre', 'chou'],
        {
          tr: 'To avoid coming across as a sanctimonious hypocrite, finally stop trying to please both the goat and the cabbage when facing two irreconcilable camps.',
          hint: b('Three nouns: Molière’s hypocrite (double f), an animal (with grave accent), and a vegetable.', 'Trois noms : l’hypocrite de Molière (ff), un animal (accent grave) et un légume.'),
          explain: b('un tartuffe; ménager la chèvre et le chou.', 'un tartuffe ; ménager la chèvre et le chou.'),
        },
      ),
      ord(
        P.order,
        'Monsieur Jourdain faisait de la prose sans le savoir.',
        {
          tr: 'Monsieur Jourdain was speaking prose without knowing it.',
          extra: ['savoirs', 'vers'],
          explain: b('Imparfait faisait + de la prose + sans le savoir (infinitive preceded by pronoun le).', 'Imparfait faisait + de la prose + sans le savoir.'),
        },
      ),
      hear(
        'Le directeur s’était porté volontaire pour arbitrer cette fusion impossible ; trois mois plus tard, les deux équipes lui reprochent tout : que diable allait-il faire dans cette galère ?',
        b('What tone does the speaker take toward the director’s choice?', 'Quel regard porte la locutrice sur l’initiative du directeur ?'),
        [
          b('Amused disbelief that he walked willingly into an obvious nightmare.', 'Un étonnement amusé devant un guêpier dans lequel il s’est jeté volontairement.'),
          b('Deep admiration for his profitable maritime investment.', 'Une vive admiration pour un investissement maritime rentable.'),
          b('Anger that he resigned without trying to mediate.', 'De la colère parce qu’il a démissionné sans tenter de négocier.'),
        ],
        {
          voice: 'f2',
          explain: b('Géronte’s famous question expresses baffled amusement at someone walking into avoidable trouble.', 'La célèbre exclamation de Géronte exprime une stupéfaction ironique devant un piège prévisible.'),
        },
      ),
      say(
        'À force de ménager la chèvre et le chou, ce tartuffe a fini par provoquer un vrai coup de théâtre.',
        'By trying to keep both sides happy, that hypocrite ended up triggering a real dramatic twist.',
      ),
    ],
    [
      b('Que diable allait-il faire dans cette galère = why get into that mess (Scapin); faire de la prose sans le savoir (Bourgeois gentilhomme).', 'Que diable allait-il faire dans cette galère (Scapin) ; faire de la prose sans le savoir (Bourgeois gentilhomme).'),
      b('Un tartuffe (double f) = pious hypocrite, vs la tartuferie (single f).', 'Un tartuffe (deux f) = hypocrite moral, contre la tartuferie (un seul f).'),
      b('Ménager la chèvre et le chou = satisfy opposing sides; un coup de théâtre = sudden plot twist.', 'Ménager la chèvre et le chou = contenter deux camps contraires ; un coup de théâtre = revirement soudain.'),
    ],
    [
      ['que diable allait-il faire dans cette galère', b('what on earth made him get into that mess?', 'pourquoi s’est-il fourré dans une pareille impasse ?')],
      ['faire de la prose sans le savoir', b('to do something refined without realising it', 'pratiquer un art ou une méthode d’instinct')],
      ['ménager la chèvre et le chou', b('to try to please two conflicting sides', 'concilier deux parties aux intérêts opposés')],
      ['un tartuffe', b('a sanctimonious hypocrite', 'un faux dévot, un imposteur moral')],
      ['un coup de théâtre', b('a sudden dramatic turn of events', 'un revirement brutal et spectaculaire')],
    ],
  ),

  lesson(
    C,
    3,
    ['classical-prose-and-proverbs', 'classiques-xviie-xixe'],
    b('17th–19th-century classics & lively resilience', 'Classiques XVIIe–XIXe : retour au sujet, mesure et ténacité'),
    b('Refocus rambling debates, weigh whether effort pays and resist giving up after one setback.', 'Recentrer un débat dispersé, peser si l’enjeu mérite l’effort et ne pas abandonner au premier revers.'),
    [
      b('Use revenir à ses moutons and chercher une aiguille dans une botte de foin naturally', 'Employer revenir à ses moutons et chercher une aiguille dans une botte de foin avec aisance'),
      b('Keep en in le jeu n’en vaut pas la chandelle and distinguish le manche vs la manche', 'Maintenir en dans le jeu n’en vaut pas la chandelle et distinguer le manche de la manche'),
      b('Weigh optimism and realism with à quelque chose malheur est bon', 'Nuancer optimisme et réalisme grâce à à quelque chose malheur est bon'),
    ],
    13,
    [
      card(
        b('Timeless classics from Pathelin to Voltaire and Balzac', 'De Pathelin à Voltaire et Balzac : des formules intactes'),
        b(
          'Five classical turns remain indispensable in cultivated C2 speech: **revenir à ses moutons** (returning to the true topic after a tangent), **chercher une aiguille dans une botte de foin** (an almost hopeless search), **à quelque chose malheur est bon** (something good can spring from misfortune), **le jeu n’en vaut pas la chandelle** (the prize isn’t worth the cost/effort), and **jeter le manche après la cognée** (giving up completely out of discouragement after one mishap).\nFocus & realism: **revenir à ses moutons · chercher une aiguille dans une botte de foin**.\nCost, setback & resilience: **à quelque chose malheur est bon · le jeu n’en vaut pas la chandelle · jeter le manche après la cognée**.',
          'Cinq tournures classiques demeurent irremplaçables au niveau C2 : **revenir à ses moutons** (retrouver le sujet principal après une digression), **chercher une aiguille dans une botte de foin** (mener une recherche quasi vaine), **à quelque chose malheur est bon** (un revers peut produire un bien), **le jeu n’en vaut pas la chandelle** (le profit ne compense pas les frais ou l’effort) et **jeter le manche après la cognée** (renoncer à tout par découragement).\nRecentrer et mesurer : **revenir à ses moutons · chercher une aiguille dans une botte de foin**.\nRevers et ténacité : **à quelque chose malheur est bon · le jeu n’en vaut pas la chandelle · jeter le manche après la cognée**.',
        ),
        {
          table: {
            head: [b('Expression', 'Expression'), b('Meaning', 'Sens'), b('Literary & grammar note', 'Origine et grammaire')],
            rows: [
              ['revenir à ses moutons', b('to get back to the main subject', 'revenir au sujet principal après un écart'), b('Farce de Maître Pathelin, echoed by Rabelais', 'Farce de Maître Pathelin (XVe s.), reprise ensuite')],
              ['chercher une aiguille dans une botte de foin', b('to look for a needle in a haystack', 'rechercher une chose introuvable dans une masse'), b('classic 17th-c. image; also meule de foin', 'image attestée dès le XVIIe s.')],
              ['à quelque chose malheur est bon', b('every cloud has a silver lining', 'un mal peut entraîner un bien inattendu'), b('famous in Voltaire and 19th-c. prose', 'cher à Voltaire et aux romanciers du XIXe s.')],
              ['le jeu n’en vaut pas la chandelle', b('the game isn’t worth the candle (not worth it)', 'l’enjeu ne justifie pas la peine ni la dépense'), b('Montaigne / Corneille; never drop en!', 'Montaigne / Corneille ; toujours garder en !')],
              ['jeter le manche après la cognée', b('to throw up one’s hands and quit entirely', 'abandonner la partie par découragement'), b('Rabelais & La Fontaine; masculine le manche!', 'Rabelais & La Fontaine ; masculin le manche !')],
            ],
          },
          ex: [
            ['Pardonnez cette digression, mais revenons à nos moutons : que devient le vote budgétaire ?', 'Forgive that digression, but let’s get back to our subject: what happens to the budget vote?'],
            ['Corriger cent pages d’annexes pour gagner deux points de marge ? Le jeu n’en vaut pas la chandelle.', 'Editing a hundred appendix pages to gain two margin points? The game isn’t worth the candle.'],
            ['L’expérience pilote a échoué, mais ne jetons pas le manche après la cognée : le protocole reste solide.', 'The pilot test failed, yet let’s not throw in the towel completely: the protocol remains sound.'],
          ],
        },
      ),
      tip(
        b('Two C2 accuracy checks: « le manche » (m.) and « en »', 'Deux vérifications C2 : « le manche » et « en »'),
        b(
          'In **jeter le manche après la cognée**, **le manche** (*wooden tool handle*, masculine!) must never become *la manche* (*sleeve* or *match leg*): *le manche* slipped off when the iron axe head (*la cognée*) fell into the water in Rabelais and La Fontaine’s fable! And in **le jeu n’en vaut pas la chandelle**, always keep the pronoun **en** (*of it*), even in affirmative variants like *Le jeu en vaut-il vraiment la chandelle ?*',
          'Dans **jeter le manche après la cognée**, **le manche** (la poignée en bois de l’outil) est **masculin** — ne dites jamais *la manche* ! Chez Rabelais puis La Fontaine (*Le Bûcheron et Mercure*), le bûcheron découragé risque de jeter le manche après la perte du fer (*la cognée*). Quant à **le jeu n’en vaut pas la chandelle**, le pronom **en** demeure obligatoire, y compris à l’interrogatif (*Le jeu en vaut-il la chandelle ?*).',
        ),
      ),
      mc(
        P.meaning,
        [
          b('She abandoned the entire project in despair after one initial setback.', 'Elle a renoncé à toute l’entreprise par découragement dès le premier accroc.'),
          b('She repaired a broken axe carefully before returning to the forest.', 'Elle a réparé soigneusement son outil avant de reprendre le travail.'),
          b('She spent months hunting through archives for a single lost receipt.', 'Elle a fouillé des archives immenses à la recherche d’un seul reçu.'),
          b('She kept working quietly until the setback turned into a triumph.', 'Elle a persévéré calmement jusqu’à transformer l’échec en réussite.'),
        ],
        {
          fr: 'Après le refus d’un premier éditeur, Léon a failli jeter le manche après la cognée.',
          explain: b('Throwing the handle after the lost axe blade means giving up altogether after an initial setback.', 'Jeter le manche après la cognée signifie abandonner tout espoir après une première déconvenue.'),
        },
      ),
      pairs(
        P.match,
        [
          ['revenir à ses moutons', b('to return to the main topic', 'reprendre le fil du sujet principal')],
          ['chercher une aiguille dans une botte de foin', b('to hunt for a needle in a haystack', 'mener une recherche presque impossible')],
          ['à quelque chose malheur est bon', b('every cloud has a silver lining', 'une déconvenue peut avoir un effet positif')],
          ['le jeu n’en vaut pas la chandelle', b('it isn’t worth the effort or cost', 'l’enjeu ne justifie pas la peine prise')],
          ['jeter le manche après la cognée', b('to throw in the towel completely', 'tout abandonner par découragement')],
        ],
      ),
      hear(
        'Le procès coûterait trois ans de procédures et des honoraires astronomiques pour récupérer à peine deux mille euros : honnêtement, le jeu n’en vaut pas la chandelle.',
        b('Why does the speaker advise against going to court?', 'Pourquoi le locuteur déconseille-t-il d’intenter un procès ?'),
        [
          b('The time and legal fees far outweigh the tiny amount at stake.', 'Le coût et la durée dépassent de loin la modeste somme en jeu.'),
          b('The courtroom lacks adequate lighting for reviewing contracts.', 'La salle d’audience manque d’éclairage pour lire les contrats.'),
          b('They are certain to win millions within a few weeks.', 'Ils sont assurés de remporter une somme immense en quelques semaines.'),
        ],
        {
          voice: 'm2',
          explain: b('Historically, card players stopped when winnings wouldn’t cover the cost of the candles lighting the table.', 'À l’origine, aux jeux de cartes, les gains ne couvraient même plus le prix des bougies.'),
        },
      ),
      dlg(
        b('Sorting out an archive crisis', 'Crise aux archives du musée'),
        b('Camille and Henri search for a missing 18th-century letter after an initial scare.', 'Camille et Henri cherchent une lettre introuvable du XVIIIe siècle après un incident de classement.'),
        [['Camille', 'f'], ['Henri', 'm']],
        [
          [0, 'Quatre mille cartons non inventoriés… Retrouver ce brouillon de Diderot, c’est chercher une aiguille dans une botte de foin !', 'Four thousand uncatalogued boxes… Finding that Diderot draft is looking for a needle in a haystack!'],
          [1, {
            options: [
              'Courage, ne jetons pas le manche après la cognée : commençons par les registres de 1773.',
              'Tu as raison, revenons à nos moutons et fermons les réserves.',
              'Oui, faisons de la prose sans le savoir en jetant les cartons.',
            ],
            explain: b('Encouraging someone not to give up completely in despair uses ne pas jeter le manche après la cognée.', 'Refuser d’abandonner par découragement correspond à ne pas jeter le manche après la cognée.'),
          }],
          [0, 'D’ailleurs, à quelque chose malheur est bon : ce tri forcé nous permettra enfin de numériser les manuscrits oubliés !', 'Besides, every cloud has a silver lining: this forced sorting will finally let us digitise forgotten manuscripts!'],
          [1, {
            options: [
              'Tout à fait ! Mais revenons à nos moutons pour aujourd’hui : vérifions d’abord les trois caisses de la salle nord.',
              'Exactement, donc le jeu n’en vaut pas la chandelle et restons chez nous.',
              'Oui, mais restons sur notre Aventin plutôt que d’ouvrir la caisse.',
            ],
            explain: b('Steering the conversation back to today’s concrete goal is revenons à nos moutons.', 'Recentrer l’échange sur l’objectif immédiat correspond à revenir à nos moutons.'),
          }],
          [0, 'Bonne idée : si la lettre s’y trouve, toute cette enquête en aura largement valu la chandelle.', 'Good idea: if the letter is in there, this whole search will have been well worth the candle.'],
        ],
      ),
      dict(
        'Le jeu n’en vaut pas la chandelle, mais ne jetons pas le manche après la cognée.',
        {
          voice: 'f',
          hint: b('Watch masculine le manche and feminine la cognée (-ée).', 'Attention au masculin le manche et au féminin la cognée (-ée).'),
        },
      ),
      write(
        b('Literary-idiom critical essay paragraph', 'Paragraphe critique aux expressions classiques'),
        b('In 100–160 words, write a polished literary or cultural reflection discussing an ambitious artistic, scholarly or entrepreneurial venture that ran into unexpected obstacles. Use at least four idioms from this course naturally.', 'En 100 à 160 mots, rédigez une réflexion soignée évoquant une entreprise artistique, savante ou éditoriale confrontée à des obstacles imprévus. Intégrez avec naturel au moins quatre expressions de ce cours.'),
        100,
        160,
        [
          b('At least four literary idioms used with exact syntax and gender', 'Au moins quatre expressions littéraires avec syntaxe et genre exacts'),
          b('Natural argumentative movement from setback to discernment', 'Progression claire du revers au discernement'),
          b('Cultivated C2 tone without stilted listing', 'Style C2 fluide sans accumulation artificielle'),
        ],
        'Lorsqu’une maison d’édition entreprend de publier une correspondance inédite du XVIIIe siècle, les sceptiques murmurent vite que le jeu n’en vaut pas la chandelle. Il faut dire que retrouver des feuillets dispersés chez des héritiers revient parfois à chercher une aiguille dans une botte de foin, tandis que certains commentateurs jouent volontiers la mouche du coche dès que le volume paraît. Pourtant, même si un premier refus de subvention fait hésiter, il serait absurde de jeter le manche après la cognée. À quelque chose malheur est bon : cette contrainte oblige à resserrer l’appareil critique et à revenir à nos moutons, c’est-à-dire aux textes eux-mêmes, loin des vains effets d’annonce.',
        {
          phrases: ['le jeu n’en vaut pas la chandelle', 'chercher une aiguille dans une botte de foin', 'la mouche du coche', 'jeter le manche après la cognée', 'À quelque chose malheur est bon'],
          modelNote: b('Notice how the idioms punctuate the argument naturally—cost, difficulty, vanity, resilience and focus—without crowding any single sentence.', 'Remarquez l’équilibre du rythme : chaque expression éclaire une étape précise du raisonnement.'),
        },
      ),
    ],
    [
      b('Revenir à ses moutons = return to the subject (Pathelin); chercher une aiguille dans une botte de foin = near-impossible search.', 'Revenir à ses moutons = reprendre le fil du sujet ; chercher une aiguille dans une botte de foin = quête quasi impossible.'),
      b('Le jeu n’en vaut pas la chandelle always keeps en; à quelque chose malheur est bon = silver lining.', 'Le jeu n’en vaut pas la chandelle garde toujours en ; à quelque chose malheur est bon = un mal peut mener à un bien.'),
      b('Jeter le manche après la cognée uses masculine le manche (tool handle, never la manche).', 'Jeter le manche après la cognée emploie le masculin le manche (poignée d’outil).'),
    ],
    [
      ['revenir à ses moutons', b('to return to the main topic', 'reprendre le fil du sujet principal')],
      ['chercher une aiguille dans une botte de foin', b('to hunt for a needle in a haystack', 'mener une recherche presque impossible')],
      ['à quelque chose malheur est bon', b('every cloud has a silver lining', 'un mal peut avoir un effet positif')],
      ['le jeu n’en vaut pas la chandelle', b('it isn’t worth the effort or cost', 'l’enjeu ne justifie pas la peine prise')],
      ['jeter le manche après la cognée', b('to throw in the towel completely', 'tout abandonner par découragement')],
    ],
  ),
];

export default lessons;
