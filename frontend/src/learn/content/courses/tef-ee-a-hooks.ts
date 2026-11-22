import type { CourseAbout } from '../../types';
import { b, card, doc, gap, lesson, mc, ord, P, pairs, say, sort, tip, trap, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Clearing 80 words in TEF Writing Section A gets you through the task, yet flat B1 summaries rarely break into NCLC 7+. Examiners award B2 scores when your news-story continuation hooks naturally onto the lead, shifts cleanly between background imparfait, decisive passé composé, prior plus-que-parfait and cautious conditionnel, and maintains neutral third-person reporting. This course trains vivid factual details, authentic witness quotes and memorable journalistic endings (la chute).',
    'Atteindre 80 mots en section A de l’écrit du TEF ne suffit pas pour décrocher le B2. Les correcteurs valorisent une suite de fait divers qui accroche dès la première phrase, maîtrise le jeu des temps (imparfait, passé composé, plus-que-parfait et conditionnel d’hypothèse) et garde un style journalistique neutre. Ce cours entraîne détails concrets, citations variées et chutes mémorables.',
  ),
  outcomes: [
    b('Bridge smoothly from the given headline and lead paragraph', 'Enchaîner naturellement après le titre et l’amorce imposés'),
    b('Control past tenses and journalistic conditional for hypotheses', 'Maîtriser les temps du récit et le conditionnel d’hypothèse'),
    b('Weave credible factual details and varied witness quotes', 'Intégrer détails crédibles et verbes introducteurs variés'),
    b('Craft punchy endings (la chute) for complete B2 stories', 'Soigner la chute finale dans une suite complète de niveau B2'),
  ],
};

const C = 'tef-ee-a-hooks';
export default [
  lesson(C, 1, ['hooks-and-tense-shifts', 'accroches-et-temps-du-recit'],
    b('Narrative hooks and clean tense shifts', 'Accroches vives et jeu des temps'),
    b('Connect smoothly to the lead and shift cleanly across four journalistic tenses.', 'Prolonger l’amorce avec naturel et alterner les quatre temps journalistiques.'),
    [b('Open smoothly without repeating the prompt word for word', 'Ouvrir sans recopier mot à mot le début fourni'), b('Coordinate imparfait, passé composé and plus-que-parfait', 'Articuler imparfait, passé composé et plus-que-parfait'), b('Use journalistic conditional for unconfirmed causes', 'Employer le conditionnel pour une cause non confirmée')],
    13,
    [
      card(b('Four tenses that lift Section A to B2', 'Quatre temps pour passer au B2'), b('**1. Imparfait**: atmosphere & scene (**Il pleuvait fort lorsque…**). **2. Passé composé**: decisive twist (**Le gardien a donné l’alerte**). **3. Plus-que-parfait**: backstory (**Le tableau avait disparu en 1982**). **4. Conditionnel**: unverified cause (**L’incident serait dû à un court-circuit**).', '**1. Imparfait** : décor (**Il pleuvait fort lorsque…**). **2. Passé composé** : action décisive (**Le gardien a donné l’alerte**). **3. Plus-que-parfait** : antériorité (**Le tableau avait disparu en 1982**). **4. Conditionnel** : hypothèse non confirmée (**L’incident serait dû à un court-circuit**).')),
      trap(b('Avoid stating speculation as proven fact', 'Attention aux faits non confirmés'), b('In real journalism, before an inquiry finishes, never write « Un court-circuit a causé l’incendie » unless police confirmed it. Use **Selon les premiers éléments, le sinistre serait dû à…** — examiners love this B2 nuance.', 'Dans un vrai article, tant que l’enquête dure, n’affirmez pas « Un court-circuit a causé l’incendie ». Écrivez **Selon les premiers éléments, le sinistre serait dû à…** — ce conditionnel journalistique rapporte des points B2.')),
      mc(P.best, ['Alertée par l’employé du grenier, la directrice du musée a aussitôt vérifié les archives : la toile avait disparu près de quarante ans plus tôt.', 'Un tableau a été trouvé dans un grenier lundi matin à Nantes par un employé.', 'Je vais vous raconter comment la police a trouvé ce tableau très intéressant.', 'Hier, il trouve un vieux tableau et il appelle tout le monde très content.'], { fr: 'Amorce donnée : « Un tableau oublié refait surface dans un grenier à Nantes. » Quelle phrase ouvre le mieux votre suite ?' }),
      gap(P.completeText, 'Le matin de l’incident, le vent ___ violemment sur le port. Un passant ___ les secours dès qu’il a aperçu la barque qui ___ ses amarres pendant la nuit : l’accident ___ dû à une corde usée.', ['soufflait', 'a alerté', 'avait rompu', 'serait'], { choices: [['soufflait', 'a soufflé', 'souffle'], ['a alerté', 'alertait', 'alerte'], ['avait rompu', 'rompait', 'rompra'], ['serait', 'est', 'sera']] }),
      sort(b('Which journalistic tense function?', 'Quel rôle temporel dans le récit ?'), [b('background scene (imparfait)', 'décor / situation (imparfait)'), b('key event (passé composé)', 'action clé (passé composé)'), b('earlier cause / unverified (PQP / cond.)', 'antériorité / hypothèse (PQP / cond.)')], [['La rue était déserte à cette heure.', 0], ['Les pompiers ont évacué l’immeuble.', 1], ['Le propriétaire avait laissé la fenêtre ouverte.', 2], ['Il neigeait abondamment depuis la veille.', 0], ['Un expert a authentifié l’œuvre.', 1], ['Le vol aurait eu lieu durant la tempête.', 2]]),
      ord(P.order, 'Le suspect avait agi seul, selon les premiers témoins entendus sur place.', { tr: 'The suspect had acted alone, according to the first witnesses heard at the scene.' }),
    ],
    [
      b('Start your first sentence right where the prompt ends without copying its headline.', 'Enchaînez dès la première phrase là où l’amorce s’arrête, sans la recopier.'),
      b('Use plus-que-parfait to explain what happened BEFORE the discovery or accident.', 'Servez-vous du plus-que-parfait pour révéler l’antériorité de l’événement.'),
      b('Switch to conditionnel (aurait, serait dû à) whenever an investigation is ongoing.', 'Employez le conditionnel journalistique tant que l’enquête se poursuit.'),
    ],
    [['refaire surface', b('to resurface / turn up again', 'réapparaître après longtemps')], ['un court-circuit', b('a short circuit', 'panne électrique')], ['les amarres', b('mooring lines', 'cordes qui attachent un bateau')]],
  ),
  lesson(C, 2, ['vivid-details-and-quotes', 'details-precis-et-citations'],
    b('Vivid details and authentic quotes', 'Détails concrets et citations variées'),
    b('Replace flat verbs like « a dit » with precise details and properly punctuated witness quotes.', 'Remplacer le plat « a dit » par des détails crédibles et des citations bien ponctuées.'),
    [b('Punctuate French journalistic quotes accurately', 'Ponctuer correctement les citations avec incise'), b('Choose precise reporting verbs beyond « a dit »', 'Varier les verbes introducteurs au-delà de « a dit »'), b('Write a vivid middle scene with details and a quote', 'Rédiger un développement vivant avec détails et citation')],
    13,
    [
      card(b('Show, don’t summarise vaguely', 'Des détails concrets et des voix réelles'), b('Instead of « Beaucoup de gens étaient là et un homme a parlé », write **Près de deux cents voyageurs patientaient sur le quai. « C’est le plus beau concert imprévu de ma vie », a souri Claire Martin, ingénieure de trente-quatre ans.** Place a comma after the closing guillemet and invert the verb (**a-t-elle confié**).', 'Au lieu de « Beaucoup de gens étaient là et un homme a parlé », écrivez **Près de deux cents voyageurs patientaient sur le quai. « C’est le plus beau concert imprévu de ma vie », a souri Claire Martin, ingénieure de trente-quatre ans.** Mettez une virgule après le guillemet fermant et inversez le sujet (**a-t-elle confié**).')),
      mc(P.form, ['« Nous avons cru à une blague au début », a confié le chef de gare.', '« Nous avons cru à une blague au début », le chef de gare a dit.', '« Nous avons cru à une blague au début. » a confié le chef de gare.', 'Le chef de gare a confié que « nous avons cru à une blague au début ».']),
      pairs(P.match, [['a déploré (un retard)', b('regretted / criticised', 'a exprimé son mécontentement')], ['s’est félicité de', b('welcomed / praised', 's’est montré très satisfait de')], ['a précisé', b('clarified / added details', 'a donné une information exacte')], ['a témoigné', b('gave a witness account', 'a raconté ce qu’il a vu')]]),
      gap(P.completeText, '« Les secouristes sont arrivés en cinq minutes », ___ un voisin soulagé. De son côté, le maire ___ la lenteur des travaux précédents, tout en ___ l’efficacité des bénévoles.', ['a témoigné', 'a déploré', 'saluant'], { choices: [['a témoigné', 'a déploré', 'a ignoré'], ['a déploré', 's’est félicité', 'a salué'], ['saluant', 'critiquant', 'refusant']] }),
      write(b('Draft a vivid middle scene (60–95 words)', 'Rédiger un développement vivant (60–95 mots)'), b('A broken-down metro train left 150 passengers stranded when a violinist began playing. Write the middle scene with two concrete details and one properly punctuated witness quote.', 'Une rame de métro en panne bloque 150 voyageurs quand une violoniste commence à jouer. Rédigez le cœur du récit avec deux détails concrets et une citation bien ponctuée.'), 60, 95, [
        b('Two concrete details (duration, setting, age/job)', 'Deux détails concrets (durée, lieu, profession)'),
        b('Properly punctuated French quote with inverted verb', 'Citation entre « … » avec incise inversée'),
        b('Neutral journalistic third person', 'Ton journalistique neutre à la 3e personne'),
      ], 'Immobilisés entre deux stations depuis plus de quarante minutes, près de cent cinquante usagers commençaient à perdre patience dans la rame surchauffée. Soudain, une étudiante du conservatoire a sorti son violon de son étui et entamé un air de Vivaldi. Aussitôt, les conversations ont cessé et plusieurs passagers ont filmé la scène. « On a complètement oublié le retard, c’était magique », a confié Marc Duval, chauffeur de taxi qui rentrait chez lui.'),
      say('« On a complètement oublié le retard, l’ambiance est devenue chaleureuse en quelques secondes », a-t-il confié.', '“We completely forgot the delay; the atmosphere became warm in a few seconds,” he shared.'),
    ],
    [
      b('Punctuate quotes cleanly: « … », a confié / a précisé / a déploré + speaker.', 'Ponctuez les citations : « … », a confié / a précisé / a déploré + témoin.'),
      b('Add two realistic details (minutes, number of people, street, job) to make scenes vivid.', 'Glissez deux détails concrets (durée, nombre, rue, métier) pour ancrer le récit.'),
      b('Match the reporting verb to the emotion: déplorer (criticism), saluer (praise), confier (feeling).', 'Choisissez le verbe juste : déplorer (critique), saluer (éloge), confier (émotion).'),
    ],
    [['une rame de métro', b('a subway train', 'ensemble des wagons du métro')], ['une incise', b('a reporting clause (e.g. , a-t-il dit)', 'courte mention du locuteur dans une citation')], ['entamer', b('to strike up / begin', 'commencer aussitôt')]],
  ),
  lesson(C, 3, ['memorable-endings-la-chute', 'soigner-la-chute'],
    b('Crafting memorable endings (la chute)', 'Soigner la chute et réussir la section A'),
    b('Close your news article with a punchy journalistic ending and complete a full B2 Section A.', 'Terminer votre fait divers par une chute percutante et rédiger une section A complète.'),
    [b('Choose from four reliable journalistic endings', 'Utiliser quatre types de chute efficaces'), b('Avoid moralising or fairytale clichés', 'Éviter les clichés moraux ou naïfs'), b('Write a cohesive 95–145 word B2 Section A story', 'Rédiger une suite complète de 95–145 mots au B2')],
    13,
    [
      card(b('Four reliable Section A endings', 'Quatre chutes journalistiques efficaces'), b('Never end with « Voilà la fin ». Close like a real newspaper: **1. Concrete consequence** (an exhibition, a rule change), **2. Ironic twist / humour** (a second surprise), **3. Community echo** (donations, viral reaction), or **4. Official reminder** (**La police rappelle que…**).', 'Ne finissez jamais par « Voilà l’histoire ». Terminez comme un vrai journal : **1. Conséquence concrète** (exposition, nouvelle règle), **2. Clin d’œil ironique** (petit rebondissement), **3. Écho local** (élan de générosité), ou **4. Rappel officiel** (**La police rappelle que…**).')),
      doc({ look: 'article', title: b('News lead', 'Début d’article'), text: 'Insolite : un livre emprunté en 1974 rendu à la bibliothèque de Sherbrooke avec une lettre d’excuses\nLundi matin, en ouvrant la boîte de retour des livres, une bibliothécaire de Sherbrooke a découvert un roman jauni par le temps accompagné d’un billet manuscrit et d’un chèque de vingt dollars.' }, b('What detail must remain consistent in your continuation?', 'Quel détail doit rester cohérent dans votre suite ?'), [b('a yellowed 1974 novel with a handwritten note and a $20 cheque', 'un roman jauni de 1974, une lettre manuscrite et un chèque de 20 $'), b('a DVD borrowed last month in Montréal', 'un DVD emprunté le mois dernier à Montréal'), b('a package of new textbooks sent by a school', 'un colis de manuels neufs envoyé par une école'), b('a stolen computer returned without a word', 'un ordinateur volé rendu sans explication')]),
      mc(P.best, ['Touchée par ce geste, la bibliothèque a décidé d’exposer le roman dans le hall d’entrée et d’inviter son lecteur anonyme pour un café — sans pénalité de retard.', 'Et depuis ce jour, tout le monde a rendu ses livres et ils vécurent heureux.', 'C’est une histoire très drôle qui montre qu’il faut toujours respecter les règles.', 'Voilà pourquoi il ne faut jamais oublier de rapporter ses livres en retard.'], { fr: 'Quelle chute finale convient le mieux au ton d’un vrai article de presse ?' }),
      sort(b('Strong journalistic chute or weak cliché?', 'Bonne chute ou cliché à éviter ?'), [b('strong journalistic chute', 'chute journalistique réussie'), b('weak cliché / moralising', 'cliché faible ou moralisateur')], [['Depuis, le musée a même consacré une vitrine à l’objet retrouvé.', 0], ['Cette belle histoire prouve qu’il faut toujours être gentil.', 1], ['La mairie a annoncé l’installation de trois nouveaux abris dès l’automne.', 0], ['Et voilà, tout est bien qui finit bien !', 1]]),
      write(b('Full B2 Section A continuation (95–145 words)', 'Rédiger la suite complète (95–145 mots)'), b('Continue the article about the 1974 Sherbrooke library book returned with an apology letter and a $20 cheque: include backstory, a quote from the librarian and a punchy ending.', 'Poursuivez l’article sur le livre emprunté en 1974 à Sherbrooke et rendu avec une lettre d’excuses et un chèque de 20 $ : antériorité, citation et chute soignée (95–145 mots).'), 95, 145, [
        b('Consistent city (Sherbrooke), 1974 book and $20 cheque', 'Cohérent avec Sherbrooke, 1974 et le chèque de 20 $'),
        b('Past tenses including plus-que-parfait + quote', 'Passé composé, imparfait, plus-que-parfait et citation'),
        b('Punchy, neutral journalistic ending (la chute)', 'Chute journalistique vive et neutre'),
      ], 'Intriguée, l’employée a aussitôt lu la lettre signée d’une simple initiale. L’auteur y expliquait qu’il avait emprunté le roman policier en juin 1974, juste avant de déménager précipitamment dans une autre province. Pendant près de cinquante ans, l’ouvrage était resté rangé dans un carton au fond d’un grenier familial.\n\n« En découvrant le tampon de 1974 encore lisible, toute l’équipe a éclaté de rire, mais nous étions surtout très émus », a confié Sophie Gagnon, responsable de la bibliothèque.\n\nPlutôt que d’encaisser le chèque pour solder cinquante ans d’amende, la direction a choisi d’annuler la dette et d’exposer le volume à l’accueil. Seul détail manquant : la date exacte de retour souhaitée pour les prochains emprunts.'),
      tip(b('30-second consistency check', 'Vérification de cohérence en 30 secondes'), b('Re-read the prompt line by line before leaving Section A: verify **city, date, character role and numbers** match your text with zero contradiction.', 'Relisez l’amorce ligne par ligne avant de passer à la section B : vérifiez **ville, dates, personnages et montants** pour éviter toute contradiction.')),
    ],
    [
      b('Close with a concrete follow-up, community reaction or wry journalistic twist — never « c’est fini ».', 'Terminez sur une suite concrète, un écho local ou un clin d’œil journalistique.'),
      b('Keep 100% consistency with every number, place and item stated in the prompt.', 'Gardez une cohérence totale avec chaque lieu, date et objet de l’amorce.'),
      b('Aim for 100–140 words in Section A to show effortless narrative fluency at B2.', 'Visez 100–140 mots en section A pour démontrer une vraie aisance narrative B2.'),
    ],
    [['insolite', b('unusual / quirky', 'surprenant et original')], ['une amende', b('a fine / late fee', 'somme à payer pour retard')], ['solder une dette', b('to settle / pay off a debt', 'régler une somme due')]],
  ),
];
