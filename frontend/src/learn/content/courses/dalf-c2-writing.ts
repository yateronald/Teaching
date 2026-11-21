import type { CourseAbout } from '../../types';
import { b, card, doc, exam, gap, lesson, mc, ord, P, pairs, sort, tip, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'The DALF C2 written test lasts about 3 h 30: from a dossier of several documents (around 2,000 words), you write a structured text of about 700 words of a given type (article, editorial, report, speech, letter), defending a position for a specific readership. This course trains the C2 written skills: reading a dossier strategically, choosing an angle and a plan, writing long, coherent paragraphs, mastering the codes of each text type and polishing style.',
    'L’épreuve écrite du DALF C2 dure environ 3 h 30 : à partir d’un dossier de plusieurs documents (environ 2 000 mots), vous rédigez un texte structuré d’environ 700 mots d’un type imposé (article, éditorial, rapport, discours, lettre), en défendant une position pour un lectorat précis. Ce cours entraîne les compétences écrites du C2 : lire stratégiquement un dossier, choisir un angle et un plan, rédiger des paragraphes longs et cohérents, maîtriser les codes de chaque type de texte et soigner le style.',
  ),
  outcomes: [
    b('Read a large dossier strategically', 'Lire stratégiquement un dossier volumineux'),
    b('Choose an angle and a plan for 700 words', 'Choisir un angle et un plan pour 700 mots'),
    b('Master the codes of each text type', 'Maîtriser les codes de chaque type de texte'),
    b('Polish style and coherence', 'Soigner le style et la cohérence'),
  ],
};

const C = 'dalf-c2-writing';
export default [
  lesson(C, 1, ['the-dossier', 'le-dossier'],
    b('Reading the dossier', 'Lire le dossier'),
    b('Manage 3 h 30, read a dossier strategically and select what serves your angle.', 'Gérer 3 h 30, lire un dossier stratégiquement et sélectionner ce qui sert votre angle.'),
    [b('Plan your time', 'Planifier son temps'), b('Read with the instruction in mind', 'Lire en pensant à la consigne'), b('Select and rank information', 'Sélectionner et hiérarchiser les informations')],
    13,
    [
      exam(b('The C2 written test', 'L’écrit du C2'), b('About **3 h 30**, score **/50**. A **dossier** (articles, data, extracts, around 2,000 words) and an **instruction** setting a **role**, a **readership** and a **text type**: **article, éditorial, rapport, compte rendu, discours, lettre ouverte**. Expected: **about 700 words**, a **clear position**, a **structured and coherent text**, **rich and precise language**.', 'Environ **3 h 30**, note **/50**. Un **dossier** (articles, données, extraits, environ 2 000 mots) et une **consigne** fixant un **rôle**, un **lectorat** et un **type de texte** : **article, éditorial, rapport, compte rendu, discours, lettre ouverte**. Attendus : **environ 700 mots**, une **position claire**, un **texte structuré et cohérent**, une **langue riche et précise**.')),
      card(b('Time plan', 'Plan de temps'), b('**45 min**: read the instruction, then the dossier, annotating what serves **your** angle. **30 min**: problématique, plan, choice of examples. **1 h 45**: writing. **30 min**: proofreading (structure, then language). Never start writing before having a full plan.', '**45 min** : lire la consigne, puis le dossier, en annotant ce qui sert **votre** angle. **30 min** : problématique, plan, choix des exemples. **1 h 45** : rédaction. **30 min** : relecture (structure, puis langue). Ne commencez jamais à rédiger sans plan complet.')),
      doc({ look: 'page', title: b('Instruction', 'Consigne'), text: 'Vous êtes membre d’un collectif de citoyens. À partir du dossier, vous rédigez une lettre ouverte, publiée dans la presse régionale, pour convaincre les élus de votre région de développer le train de nuit plutôt que les lignes aériennes intérieures. (700 mots environ)' }, b('Who is the reader and what is the goal?', 'Qui est le lecteur et quel est l’objectif ?'), [b('regional elected officials (via the press); convince them to support night trains', 'les élus régionaux (via la presse) ; les convaincre de soutenir les trains de nuit'), b('travellers; sell them tickets', 'les voyageurs ; leur vendre des billets'), b('airline staff; inform them', 'le personnel aérien ; les informer'), b('students; summarise the dossier', 'des étudiants ; résumer le dossier')]),
      sort(b('Useful for this angle or not?', 'Utile pour cet angle ou non ?'), [b('useful', 'utile'), b('not useful here', 'peu utile ici')], [['le bilan carbone comparé avion / train', 0], ['l’histoire de l’aviation militaire', 1], ['le succès d’une ligne de nuit rouverte', 0], ['les prix des parkings d’aéroport en 1990', 1], ['le coût des subventions publiques', 0], ['la couleur des wagons', 1]]),
      tip(b('Read for your angle', 'Lisez pour votre angle'), b('Don’t try to use **everything**: a C2 text **selects** the strongest facts and figures for its purpose, and may use a counter-argument from the dossier to refute it.', 'N’essayez pas de tout utiliser : un texte de C2 **sélectionne** les faits et chiffres les plus forts pour son objectif, et peut reprendre un contre-argument du dossier pour le réfuter.')),
    ],
    [
      b('3 h 30: read 45 min, plan 30 min, write 1 h 45, proofread 30 min.', '3 h 30 : lecture 45 min, plan 30 min, rédaction 1 h 45, relecture 30 min.'),
      b('Identify role, readership, text type, goal.', 'Repérez rôle, lectorat, type de texte, objectif.'),
      b('Select information that serves your angle.', 'Sélectionnez les informations utiles à votre angle.'),
    ],
    [['un lectorat', b('a readership', 'ensemble des lecteurs')], ['un élu', b('an elected official', 'personne élue')], ['une lettre ouverte', b('an open letter', 'lettre publiée')]],
  ),
  lesson(C, 2, ['text-types-and-codes', 'types-de-textes-et-codes'],
    b('Text types and their codes', 'Les types de textes et leurs codes'),
    b('Respect the specific codes of the editorial, the report, the speech and the open letter.', 'Respecter les codes propres à l’éditorial, au rapport, au discours et à la lettre ouverte.'),
    [b('Know the codes of each type', 'Connaître les codes de chaque type'), b('Adapt tone and address', 'Adapter le ton et l’adresse'), b('Open and close appropriately', 'Ouvrir et clore de façon appropriée')],
    13,
    [
      card(b('Codes', 'Les codes'), b('**Éditorial**: title, strong committed thesis, « nous » of the newspaper, rhetorical figures. **Rapport**: title, objet, neutral then recommending tone, headings, numbered recommendations. **Discours**: address (**Mesdames et Messieurs**), oral rhythm, anaphoras, call to action. **Lettre ouverte**: addressee named (**Monsieur le Président de Région**), « je » or « nous » of the group, public stakes, formal closing.', '**Éditorial** : titre, thèse forte et engagée, « nous » du journal, figures de rhétorique. **Rapport** : titre, objet, ton neutre puis recommandant, intertitres, recommandations numérotées. **Discours** : adresse (**Mesdames et Messieurs**), rythme oral, anaphores, appel à l’action. **Lettre ouverte** : destinataire nommé (**Monsieur le Président de Région**), « je » ou « nous » du collectif, enjeux publics, formule de politesse.')),
      sort(b('Which text type?', 'Quel type de texte ?'), [b('report', 'rapport'), b('speech', 'discours'), b('open letter', 'lettre ouverte')], [['Recommandation n° 2 : …', 0], ['Mesdames et Messieurs, chers amis…', 1], ['Monsieur le Président de Région, …', 2], ['Objet : évaluation des lignes de nuit', 0], ['Nous voulons… Nous voulons… Nous voulons…', 1], ['Veuillez agréer, Monsieur le Président…', 2]]),
      mc(P.best, ['Monsieur le Président de Région, Mesdames et Messieurs les élus, nous, citoyens rassemblés au sein du collectif Rail Vivant, souhaitons attirer votre attention sur une solution à la fois écologique et solidaire : le train de nuit.', 'Salut les élus, faites des trains !', 'Le train de nuit existe depuis le XIXe siècle et circule la nuit.', 'Recommandation 1 : trains.'], { fr: 'Quelle ouverture convient à la lettre ouverte ?' }),
      ord(P.order, 'Nous souhaitons attirer votre attention sur une solution à la fois écologique et solidaire.', { tr: 'We wish to draw your attention to a solution that is both ecological and fair.' }),
      gap(P.complete, 'Nous ___ attirer votre attention sur une solution ___ fois écologique et solidaire.', ['souhaitons', 'à la']),
    ],
    [
      b('Editorial: committed thesis; report: headings and recommendations.', 'Éditorial : thèse engagée ; rapport : intertitres et recommandations.'),
      b('Speech: address and oral rhythm; open letter: named addressee and public stakes.', 'Discours : adresse et rythme oral ; lettre ouverte : destinataire nommé et enjeux publics.'),
      b('Opening and closing follow the type.', 'Ouverture et clôture suivent le type.'),
    ],
    [['un intertitre', b('a subheading', 'titre de section')], ['solidaire', b('fair, inclusive', 'qui profite à tous')], ['attirer l’attention', b('to draw attention', 'faire remarquer')]],
  ),
  lesson(C, 3, ['long-paragraphs-and-style', 'paragraphes-longs-et-style'],
    b('Long paragraphs and style', 'Paragraphes longs et style'),
    b('Write dense, coherent paragraphs and polish style at C2 level.', 'Rédiger des paragraphes denses et cohérents et soigner le style au niveau C2.'),
    [b('Structure a long paragraph', 'Structurer un paragraphe long'), b('Vary syntax and vocabulary', 'Varier syntaxe et vocabulaire'), b('Write a substantial extract', 'Rédiger un extrait substantiel')],
    13,
    [
      card(b('The C2 paragraph', 'Le paragraphe C2'), b('**Topic sentence** → **explanation** → **evidence** from the dossier (reformulated, sometimes a short quotation with source) → **analysis** (why it matters) → **link** to the next idea. Style: **nominalisation** (la réouverture des lignes), **participial clauses** (Conçu pour…, ce dispositif…), **varied connectors**, **precise verbs** (engendrer, pallier, entériner).', '**Idée directrice** → **explication** → **preuve** tirée du dossier (reformulée, parfois une courte citation sourcée) → **analyse** (pourquoi c’est important) → **lien** avec l’idée suivante. Style : **nominalisation** (la réouverture des lignes), **propositions participiales** (Conçu pour…, ce dispositif…), **connecteurs variés**, **verbes précis** (engendrer, pallier, entériner).')),
      pairs(P.match, [['engendrer', b('to generate, cause', 'produire')], ['pallier', b('to compensate for, address', 'remédier à')], ['entériner', b('to ratify, endorse', 'valider officiellement')], ['un dispositif', b('a scheme, a system', 'ensemble de mesures')]]),
      mc(P.form, ['Conçus pour relier les grandes villes sans escale, les trains de nuit permettent de voyager en dormant.', 'Conçu pour relier les grandes villes sans escale, les trains de nuit permettent de voyager en dormant.', 'Concevant pour relier les grandes villes, les trains de nuit permettent de voyager.', 'Conçus pour relier les grandes villes, voyager en dormant est possible.'], { explain: b('The participle agrees with the subject of the main clause (les trains → conçus); the last option has a dangling participle.', 'Le participe s’accorde avec le sujet de la principale (les trains → conçus) ; la dernière option est une construction incorrecte (participe sans sujet commun).') }),
      write(b('A C2 paragraph', 'Un paragraphe C2'), b('Write one long argumentative paragraph (130–180 words) for the open letter: one argument in favour of night trains, with evidence, analysis and a link to the next idea.', 'Rédigez un long paragraphe argumentatif (130–180 mots) pour la lettre ouverte : un argument en faveur des trains de nuit, avec preuve, analyse et transition vers l’idée suivante.'), 130, 180, [
        b('Topic sentence', 'Idée directrice'),
        b('Evidence and analysis', 'Preuve et analyse'),
        b('Link to the next idea', 'Transition vers l’idée suivante'),
      ], 'Le premier argument, et sans doute le plus décisif, tient à l’urgence climatique. Selon les données réunies dans le dossier, un trajet Paris–Nice en avion émet plusieurs dizaines de fois plus de gaz à effet de serre que le même trajet en train de nuit. Or les lignes aériennes intérieures concernées relient précisément des villes que le rail dessert déjà, au prix d’un temps de parcours que la nuit rend presque invisible : on s’endort dans une ville, on se réveille dans une autre. Encourager ce mode de transport ne relève donc pas de la nostalgie, mais d’une politique cohérente avec les engagements climatiques que notre région a elle-même entérinés. Reste toutefois à lever un obstacle de taille, que nous ne saurions ignorer : celui du coût, auquel il convient à présent de répondre.'),
      tip(b('Polish in two passes', 'Peaufinez en deux passages'), b('Pass 1: **structure** (does each paragraph have one idea and a link?). Pass 2: **language** (agreements, subjunctive, repetitions, register). At C2, **one repeated word** or **one register break** stands out.', 'Passage 1 : **structure** (chaque paragraphe a-t-il une idée et une transition ?). Passage 2 : **langue** (accords, subjonctif, répétitions, registre). Au C2, **un mot répété** ou **une rupture de registre** se remarquent.')),
    ],
    [
      b('Paragraph: topic sentence, explanation, evidence, analysis, link.', 'Paragraphe : idée directrice, explication, preuve, analyse, transition.'),
      b('Style: nominalisation, participial clauses, precise verbs.', 'Style : nominalisation, participiales, verbes précis.'),
      b('Proofread structure first, then language.', 'Relisez d’abord la structure, puis la langue.'),
    ],
    [['une escale', b('a stopover', 'arrêt en route')], ['desservir', b('to serve (transport)', 'relier par un service')], ['un obstacle de taille', b('a major obstacle', 'grosse difficulté')]],
  ),
];
