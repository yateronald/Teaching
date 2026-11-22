import type { CourseAbout, Lesson } from '../../types';
import { b, card, dict, dlg, gap, hear, lesson, mc, ord, P, pairs, say, sort, tip, trap, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Replace heavy relative and adverbial clauses with crisp participle structures. Master the gérondif versus the participe présent, express anteriority with the participe composé, build absolute participle clauses with their own subject, and spell tricky verbal adjective pairs like fatigant/fatiguant.',
    'Remplacez les subordonnées lourdes par des propositions participiales élégantes. Maîtrisez la différence entre gérondif et participe présent, exprimez l’antériorité avec le participe composé, construisez des propositions participiales absolues à sujet propre et déjouez les pièges entre adjectif verbal et participe présent (fatigant / fatiguant).',
  ),
  outcomes: [
    b('Distinguish the gérondif (simultaneity, means, condition) from the participe présent (cause, characterization)', 'Distinguer le gérondif (simultanéité, manière, condition) du participe présent (cause, caractérisation)'),
    b('Express anteriority and cause cleanly with the participe composé (ayant / étant)', 'Exprimer l’antériorité et la cause avec le participe composé (ayant / étant)'),
    b('Build absolute participle clauses with their own subject (La séance levée…)', 'Construire des propositions participiales absolues à sujet propre (La séance levée…)'),
    b('Tell verbal adjectives from present participles in both agreement and spelling', 'Distinguer l’adjectif verbal du participe présent par l’accord et l’orthographe'),
  ],
};

const C = 'gr-participle-clauses';

const lessons: Lesson[] = [
  lesson(
    C,
    1,
    ['gerondif-vs-participe-present', 'gerondif-et-participe-present'],
    b('Gérondif vs. participe présent', 'Gérondif et participe présent'),
    b('Both end in -ant and are invariable, yet their syntax and roles are completely distinct.', 'Tous deux se terminent en -ant et sont invariables, mais leurs rôles syntaxiques diffèrent nettement.'),
    [
      b('Use en + -ant for simultaneity, manner, means or condition', 'Employer en + -ant pour la simultanéité, la manière, le moyen ou la condition'),
      b('Use the participe présent to express cause or replace qui + verb', 'Utiliser le participe présent pour exprimer la cause ou remplacer qui + verbe'),
      b('Enforce the same-subject rule to avoid dangling participles', 'Respecter la règle d’identité des sujets pour éviter les phrases bancales'),
    ],
    13,
    [
      card(
        b('One ending (-ant), two distinct tools', 'Une terminaison (-ant), deux outils distincts'),
        b(
          'Take the **nous** stem in the present tense and add **-ant** (only three irregular stems: **étant, ayant, sachant**). Without *en*, the **participe présent** behaves like a compressed relative clause (**qui…**) or expresses **cause**. With **en**, the **gérondif** expresses **simultaneity**, **manner/means** (“by …-ing”), **condition**, or (with **tout en**) **concession**.\n\nParticipe présent: **exprimant la cause, remplaçant qui**.\nGérondif (en + -ant): **simultanéité, moyen, condition**.\nConcessive gérondif: **tout en reconnaissant · tout en sachant**.',
          'On forme le radical sur **nous** au présent + **-ant** (trois irréguliers seulement : **étant, ayant, sachant**). Sans *en*, le **participe présent** remplace une relative (**qui…**) ou exprime la **cause**. Avec **en**, le **gérondif** exprime la **simultanéité**, la **manière / le moyen**, la **condition**, ou la **concession** avec **tout en**.\n\nParticipe présent : **cause, caractérisation, équivalent de qui**.\nGérondif (en + -ant) : **simultanéité, moyen, condition**.\nGérondif concessif : **tout en reconnaissant · tout en sachant**.',
        ),
        {
          table: {
            head: [b('Form', 'Forme'), b('Main values', 'Valeurs principales'), b('Example', 'Exemple')],
            rows: [
              ['gérondif (en + -ant)', b('simultaneity, means, condition', 'simultanéité, moyen, condition'), 'En lisant la presse, on progresse vite.'],
              ['tout en + -ant', b('concession (“while still”)', 'concession (« même si »)'), 'Tout en doutant, il a signé l’accord.'],
              ['participe présent (-ant)', b('cause, qui-clause replacement', 'cause, remplace qui + verbe'), 'Les candidats parlant trois langues sont favorisés.'],
            ],
          },
          ex: [
            ['En réduisant la vitesse, on diminue nettement la consommation.', 'By reducing speed, one clearly lowers fuel consumption.'],
            ['Étant malade ce matin-là, Paul n’a pas assisté au vote.', 'Being ill that morning, Paul did not attend the vote.'],
            ['Nous cherchons un ingénieur sachant programmer en Python.', 'We are looking for an engineer who knows how to program in Python.'],
          ],
        },
      ),
      trap(
        b('The dangling gérondif trap', 'Le piège du gérondif sans sujet commun'),
        b(
          'A **gérondif** must almost always share its implied subject with the **main clause subject**. Writing *En sortant du métro, l’averse a commencé* implies that the downpour came out of the metro! Rewrite so the person exiting the metro is the subject of the main verb.\n\nIncorrect: **En arrivant, le bureau était fermé**.\nCorrect: **En arrivant, j’ai trouvé le bureau fermé**.',
          'Le **gérondif** doit renvoyer au **sujet du verbe principal**. Écrire *En sortant du métro, l’averse a commencé* laisse entendre que l’averse sortait du métro ! Faites de l’auteur de l’action le sujet principal.\n\nÀ éviter : **En arrivant, le bureau était fermé**.\nCorrect : **En arrivant, j’ai trouvé le bureau fermé**.',
        ),
      ),
      mc(
        P.best,
        [
          'En comparant les deux offres, nous avons économisé mille euros.',
          'En comparant les deux offres, mille euros ont été économisés.',
          'Comparants les deux offres, nous avons économisé mille euros.',
          'En comparé les deux offres, nous avons économisé mille euros.',
        ],
        {
          fr: 'Which sentence avoids a dangling participle and wrong agreement?',
          explain: b('The gérondif is invariable and must share its subject (nous) with the main clause.', 'Le gérondif est invariable et doit partager son sujet (nous) avec la principale.'),
        },
      ),
      mc(
        P.meaning,
        [
          b('Concession (even though she appreciates their boldness)', 'Concession (bien qu’elle apprécie leur audace)'),
          b('Pure means (by appreciating their boldness)', 'Moyen (au moyen d’apprécier leur audace)'),
          b('Condition (if she appreciates their boldness)', 'Condition (si elle apprécie leur audace)'),
        ],
        {
          fr: 'Tout en appréciant leur audace, la directrice a rejeté le devis.',
          explain: b('Tout en + -ant introduces a simultaneous contrast or concession (“while still / even though”).', 'Tout en + -ant marque une concession simultanée (« bien que / tout en reconnaissant »).'),
        },
      ),
      gap(
        P.complete,
        'N’___ (avoir) aucune preuve formelle, l’enquêteur a suspendu l’audition. On apprend beaucoup ___ (en / voyager) seul.',
        [['ayant'], ['en voyageant']],
        { hint: b('Use the irregular present participle of avoir, then en + -ant for the gérondif.', 'Utilisez le participe présent irrégulier d’avoir, puis en + -ant pour le gérondif.') },
      ),
      sort(
        b('Gérondif or participe présent?', 'Gérondif ou participe présent ?'),
        [
          b('Gérondif (means / simultaneity / concession)', 'Gérondif (moyen, simultanéité, concession)'),
          b('Participe présent (cause / characterization)', 'Participe présent (cause, caractérisation)'),
        ],
        [
          ['En travaillant régulièrement, il progresse.', 0],
          ['Ne sachant pas répondre, elle s’est tue.', 1],
          ['Tout en souriant, il restait ferme.', 0],
          ['Les personnes souhaitant participer doivent s’inscrire.', 1],
          ['Elle révise en écoutant de la musique.', 0],
          ['Étant absent vendredi, Marc m’a délégué sa voix.', 1],
        ],
      ),
      ord(
        P.order,
        'Ne sachant comment réagir, les témoins ont appelé la mairie.',
        { tr: 'Not knowing how to react, the witnesses called the town hall.' },
      ),
      dict('Tout en respectant les délais, l’équipe a amélioré la qualité du dossier.'),
      say('En relisant votre texte à voix haute, vous repérerez chaque répétition.', 'By reading your text aloud, you will spot every repetition.'),
    ],
    [
      b('Both gérondif and participe présent are invariable; only être (étant), avoir (ayant) and savoir (sachant) have irregular stems.', 'Gérondif et participe présent sont invariables ; seuls être (étant), avoir (ayant) et savoir (sachant) sont irréguliers.'),
      b('The gérondif (en + -ant) expresses simultaneity, means, condition or concession (tout en).', 'Le gérondif (en + -ant) exprime la simultanéité, le moyen, la condition ou la concession (tout en).'),
      b('The gérondif must refer to the subject of the main verb to avoid a dangling clause.', 'Le gérondif doit renvoyer au sujet de la proposition principale.'),
    ],
    [
      ['tout en', b('while still, even though', 'tout en (+ gérondif de concession)')],
      ['sachant', b('knowing (participle of savoir)', 'participe présent de savoir')],
      ['en revanche', b('on the other hand', 'par opposition')],
      ['en agissant ainsi', b('by acting this way', 'de cette manière')],
    ],
  ),

  lesson(
    C,
    2,
    ['participe-compose-anteriority', 'participe-compose-anteriorite'],
    b('The compound participle: ayant fini, étant arrivé', 'Le participe composé : ayant fini, étant arrivé'),
    b('Show that one event happened before another—and often caused it—with the participe composé.', 'Exprimer l’antériorité et la cause grâce au participe composé.'),
    [
      b('Build active compound participles with ayant or étant + past participle', 'Former le participe composé actif avec ayant ou étant + participe passé'),
      b('Apply standard past participle agreement with étant and pronominals', 'Accorder le participe passé avec étant et les verbes pronominaux'),
      b('Condense passive or stative clauses into a bare past participle', 'Condenser les propositions passives par le participe passé seul'),
    ],
    13,
    [
      card(
        b('Anteriority and cause: ayant / étant + past participle', 'Antériorité et cause : ayant / étant + participe passé'),
        b(
          'To show that an action happened **before** the main verb (often explaining *why* the main action happened), use the **participe composé**: **ayant** or **étant** + past participle. For pronominal verbs, use **s’étant** + past participle. Notice that **ayant** and **étant** stay invariable, while the past participle follows normal **avoir/être** agreement rules.\n\nWith avoir: **ayant compris, ayant achevé, l’ayant vue**.\nWith être: **étant partie, étant revenus, s’étant aperçue**.\nReduced passive: **convaincue par, surprise par, informés de**.',
          'Pour indiquer qu’une action s’est produite **avant** le verbe principal (et en donne souvent la **cause**), on emploie le **participe composé** : **ayant** ou **étant** + participe passé (ou **s’étant** pour un verbe pronominal). **Ayant** et **étant** restent invariables, tandis que le participe passé suit les règles d’accord usuelles.\n\nAvec avoir : **ayant compris, ayant achevé, l’ayant vue**.\nAvec être : **étant partie, étant revenus, s’étant aperçue**.\nPassif réduit : **convaincue par, surprise par, informés de**.',
        ),
        {
          table: {
            head: [b('Full clause', 'Subordonnée complète'), b('Compound participle', 'Participe composé')],
            rows: [
              ['Comme il avait perdu ses clés…', 'Ayant perdu ses clés…'],
              ['Comme elle était arrivée tôt…', 'Étant arrivée tôt…'],
              ['Comme ils s’étaient trompés…', 'S’étant trompés…'],
              ['Comme elle avait été avertie…', '(Ayant été) avertie…'],
            ],
          },
          ex: [
            ['Ayant terminé son stage en juin, Lucas a postulé dès juillet.', 'Having finished his internship in June, Lucas applied in July.'],
            ['Étant rentrées tard d’un déplacement, elles ont travaillé à distance.', 'Having returned late from a trip, they worked remotely.'],
            ['Émue par cet accueil, la chercheuse a remercié l’assemblée.', 'Moved by this welcome, the researcher thanked the assembly.'],
          ],
        },
      ),
      tip(
        b('Dropping ayant été in passive openings', 'Alléger le passif en supprimant ayant été'),
        b(
          'In formal French, you rarely need *étant* or *ayant été* before a passive past participle at the start of a sentence. Simply start with the agreed past participle: **Prévenue à temps, l’équipe a réagi** instead of *Ayant été prévenue à temps…*.\n\nHeavy: **Ayant été nommé directeur, il réorganisa le pôle**.\nCrisp B2 style: **Nommé directeur, il réorganisa le pôle**.',
          'En français soutenu, on omet volontiers *étant* ou *ayant été* devant un participe passé passif en début de phrase : **Prévenue à temps, l’équipe a réagi** plutôt que *Ayant été prévenue à temps…*.\n\nLourd : **Ayant été nommé directeur, il réorganisa le pôle**.\nStyle B2 fluide : **Nommé directeur, il réorganisa le pôle**.',
        ),
      ),
      mc(
        P.spelling,
        ['étant descendues', 'étant descendu', 'ayant descendu', 'descendant'],
        {
          fr: 'Les voyageuses, ___ trop tôt du train, ont dû attendre une heure.',
          explain: b('Descendre takes être here, so the participle agrees with les voyageuses (feminine plural).', 'Descendre se conjugue avec être ici : le participe s’accorde avec les voyageuses (féminin pluriel).'),
        },
      ),
      mc(
        P.form,
        ['S’étant rendu compte', 'S’étant rendue compte', 'S’ayant rendu compte', 'Se rendant compte'],
        {
          fr: '___ de son retard, Claire a immédiatement prévenu le client.',
          explain: b('In se rendre compte, compte is the direct object after the verb, so rendu stays invariable (no feminine -e).', 'Dans se rendre compte, compte est COD placé après le verbe : rendu reste invariable.'),
        },
      ),
      gap(
        P.complete,
        'N’___ (recevoir) aucune confirmation, nous avons relancé le fournisseur. ___ (Informer — f. pl.) de la panne, les usagères ont emprunté la ligne B.',
        [['ayant reçu'], ['Informées']],
        { hint: b('Use the compound participle with avoir first, then a reduced passive participle agreeing with les usagères.', 'Employez d’abord le participe composé avec avoir, puis un participe passif accordé avec les usagères.') },
      ),
      hear(
        'Ayant relu le procès-verbal, la présidente l’a signé.',
        b('Which relation between the two actions do you hear?', 'Quel rapport entre les deux actions entendez-vous ?'),
        [
          b('Anteriority: she reread the minutes before signing them', 'Antériorité : elle a relu le procès-verbal avant de le signer'),
          b('Simultaneity: she reread while signing', 'Simultanéité : elle relisait en même temps qu’elle signait'),
          b('Future intention: she plans to reread it later', 'Intention future : elle prévoit de le relire plus tard'),
        ],
      ),
      ord(
        P.order,
        'Étant parvenue à convaincre le jury, elle a obtenu la bourse.',
        { tr: 'Having managed to convince the panel, she received the grant.' },
      ),
      pairs(
        P.match,
        [
          ['Ayant refusé l’offre…', b('Because they had refused the offer…', 'Comme il ou elle avait refusé l’offre…')],
          ['En refusant l’offre…', b('By / while refusing the offer…', 'Au moment où il ou elle refuse l’offre…')],
          ['Étant partie plus tôt…', b('Because she had left earlier…', 'Comme elle était partie plus tôt…')],
          ['S’étant excusés…', b('Having apologized…', 'Après qu’ils se sont excusés…')],
        ],
      ),
      dict('Ayant analysé chaque variable, les chercheurs ont publié leurs conclusions.'),
      say('S’étant aperçue de l’oubli, elle a renvoyé la pièce jointe.', 'Having noticed the oversight, she sent the attachment again.'),
    ],
    [
      b('The participe composé (ayant / étant / s’étant + past participle) expresses anteriority and cause.', 'Le participe composé (ayant / étant / s’étant + participe passé) exprime l’antériorité et la cause.'),
      b('Past participles with étant and pronominals agree according to standard rules (Étant arrivée, S’étant trompés, but S’étant rendu compte).', 'Les participes avec étant et pronominaux s’accordent selon les règles habituelles (Étant arrivée, S’étant trompés, mais S’étant rendu compte).'),
      b('In passive openings, drop ayant été and start directly with the agreed past participle.', 'Au passif en tête de phrase, on omet souvent ayant été pour garder le seul participe passé accordé.'),
    ],
    [
      ['ayant achevé', b('having completed', 'après avoir terminé')],
      ['étant parvenu(e) à', b('having managed to', 'après avoir réussi à')],
      ['se rendre compte de', b('to realize (invariable rendu)', 'prendre conscience de')],
      ['un procès-verbal', b('official minutes (of a meeting)', 'le compte rendu officiel d’une séance')],
    ],
  ),

  lesson(
    C,
    3,
    ['absolute-participle-clauses', 'proposition-participiale-absolue'],
    b('Absolute participle clauses: Le soleil couché…', 'La proposition participiale absolue : Le soleil couché…'),
    b('Introduce an independent background event with its own grammatical subject.', 'Introduire une circonstance autonome dotée de son propre sujet grammatical.'),
    [
      b('Build [Own Subject + Participle] clauses without a shared main subject', 'Construire [Sujet propre + Participe] sans sujet commun avec la principale'),
      b('Agree the past participle with its own subject inside the clause', 'Accorder le participe passé avec son propre sujet dans la participiale'),
      b('Use absolute clauses naturally for time, cause or condition at B2/C1', 'Employer la participiale absolue pour le temps, la cause ou la condition'),
    ],
    13,
    [
      card(
        b('A participle clause with its own subject', 'Une proposition participiale à sujet propre'),
        b(
          'Unlike the *gérondif*, an **absolute participle clause** (*proposition participiale*) has **its own explicit subject**, completely different from the main clause subject. Structure: **[Own Subject] + [Participle (past, present, or compound)], [Main Clause]**. It concisely expresses **time** (“once…”, “when…”), **cause** (“since…”), or **condition** (“assuming…”).\n\nTime (once done): **la réunion terminée, le soleil couché, la nuit tombée**.\nCause / context: **les conditions étant réunies, le délai expirant demain**.\nFormal opening: **ce point réglé · tout bien pesé · cela dit**.',
          'Contrairement au *gérondif*, la **proposition participiale absolue** possède **son propre sujet exprimé**, distinct de celui de la principale. Structure : **[Sujet propre] + [Participe (passé, présent ou composé)], [Principale]**. Elle condense le **temps**, la **cause** ou la **condition**.\n\nTemps (fait accompli) : **la réunion terminée, le soleil couché, la nuit tombée**.\nCause / contexte : **les conditions étant réunies, le délai expirant demain**.\nOuverture formelle : **ce point réglé · tout bien pesé · cela dit**.',
        ),
        {
          table: {
            head: [b('Participle clause', 'Proposition participiale'), b('Equivalent finite clause', 'Équivalent complet')],
            rows: [
              ['La réunion terminée, chacun est rentré.', 'Quand la réunion a été terminée, chacun est rentré.'],
              ['Les prix augmentant, les achats reculent.', 'Comme les prix augmentent, les achats reculent.'],
              ['Le soleil couché, la fraîcheur est revenue.', 'Une fois que le soleil s’est couché, la fraîcheur est revenue.'],
              ['Toutes vérifications faites, le bilan est sain.', 'Quand toutes les vérifications ont été faites, le bilan est sain.'],
            ],
          },
          ex: [
            ['La séance levée, les délégués ont quitté l’hémicycle.', 'Once the session was adjourned, the delegates left the chamber.'],
            ['Les ressources manquant, la municipalité a dû prioriser.', 'With resources lacking, the municipality had to prioritize.'],
            ['L’orage passé, le trafic ferroviaire a repris progressivement.', 'Once the storm had passed, rail traffic gradually resumed.'],
          ],
        },
      ),
      tip(
        b('Agreeing the participle inside an absolute clause', 'Accorder le participe avec son propre sujet'),
        b(
          'Inside an absolute participle clause, the **past participle agrees in gender and number with its own subject** right before it (never with the main verb’s subject): **Les portes fermées**, les visiteurs ne peuvent plus entrer. **Le contrat signé**, nous lancerons la production.\n\nFeminine singular: **la décision prise, l’enquête close**.\nPlural: **les travaux achevés, les mesures adoptées**.',
          'Dans une participiale absolue, le **participe passé s’accorde en genre et en nombre avec son propre sujet** placé juste devant lui : **Les portes fermées**, les visiteurs ne peuvent plus entrer. **Le contrat signé**, nous lancerons la production.\n\nFéminin singulier : **la décision prise, l’enquête close**.\nPluriel : **les travaux achevés, les mesures adoptées**.',
        ),
      ),
      mc(
        P.spelling,
        ['prises', 'prise', 'pris', 'prenant'],
        {
          fr: 'Toutes les précautions ___, l’équipe a autorisé le redémarrage.',
          explain: b('Prises agrees with its own subject Toutes les précautions (feminine plural).', 'Prises s’accorde avec son sujet propre Toutes les précautions (féminin pluriel).'),
        },
      ),
      mc(
        P.best,
        [
          'Le dossier étant complet, le jury peut délibérer.',
          'Étant complet, le jury peut délibérer le dossier.',
          'En étant complet, le jury peut délibérer.',
          'Le dossier étant complètes, le jury peut délibérer.',
        ],
        {
          fr: 'Which sentence correctly expresses “Since the file is complete, the board can deliberate”?',
          explain: b('Le dossier is a distinct subject from le jury, so you must keep it explicitly in the absolute participle clause.', 'Le dossier est un sujet distinct de le jury : il doit être exprimé dans la participiale absolue.'),
        },
      ),
      gap(
        P.complete,
        'La nuit ___ (tomber), le refuge s’est illuminé. Les comptes ___ (vérifier — m. pl.), la trésorière a remis son rapport.',
        [['tombée'], ['vérifiés']],
      ),
      sort(
        b('Same subject or different subject?', 'Même sujet ou sujet différent ?'),
        [
          b('Same subject (gérondif / simple participle)', 'Même sujet (gérondif / participe simple)'),
          b('Own different subject (absolute clause)', 'Sujet propre distinct (participiale absolue)'),
        ],
        [
          ['La cloche ayant sonné, les élèves sortirent.', 1],
          ['En entendant la cloche, les élèves sortirent.', 0],
          ['Les négociations achevées, le texte fut signé.', 1],
          ['Ayant achevé les négociations, ils signèrent.', 0],
          ['Le train parti, la gare redevint calme.', 1],
          ['Partis tôt, nous évitâmes les bouchons.', 0],
        ],
      ),
      ord(
        P.order,
        'Les conditions étant réunies, le chantier peut débuter.',
        { tr: 'With the conditions met, construction can begin.' },
      ),
      dict('La réunion terminée, les participants ont échangé leurs coordonnées.'),
      say('Ce malentendu dissipé, la collaboration a repris sur de bonnes bases.', 'Once that misunderstanding was cleared up, collaboration resumed on a solid footing.'),
    ],
    [
      b('An absolute participle clause pairs an independent subject with a participle before the main clause.', 'La participiale absolue associe un sujet indépendant et un participe devant la proposition principale.'),
      b('The past participle in an absolute clause agrees with its own subject (Les mesures adoptées…).', 'Le participe passé de la participiale absolue s’accorde avec son propre sujet (Les mesures adoptées…).'),
      b('Present participles (étant, manquant, augmentant) remain invariable even inside an absolute clause.', 'Les participes présents (étant, manquant, augmentant) restent invariables même en participiale absolue.'),
    ],
    [
      ['la séance levée', b('once the session was adjourned', 'une fois la séance terminée')],
      ['tout bien pesé', b('all things considered', 'après mûre réflexion')],
      ['ce point réglé', b('with this point settled', 'une fois ce point résolu')],
      ['à huis clos', b('behind closed doors', 'sans public')],
    ],
  ),

  lesson(
    C,
    4,
    ['verbal-adjectives-spelling', 'adjectifs-verbaux-et-orthographe'],
    b('Verbal adjectives vs. present participles: fatigant / fatiguant', 'Adjectifs verbaux et participes présents : fatigant / fatiguant'),
    b('Tell invariable present participles from agreeing verbal adjectives—and nail their spelling shifts.', 'Distinguer le participe présent invariable de l’adjectif verbal accordé et maîtriser leurs changements d’orthographe.'),
    [
      b('Test whether an -ant word takes an object or modifier (participle) or describes a quality (adjective)', 'Reconnaître un participe (complément d’objet, négation, adverbe après) d’un adjectif (état, accord)'),
      b('Spell the -gant/-guant, -cant/-quant and -ent/-ant pairs accurately', 'Orthographier sans faute les paires en -gant/-guant, -cant/-quant et -ent/-ant'),
      b('Combine all B2 participle forms smoothly in a summary paragraph', 'Réinvestir toutes les propositions participiales dans un texte B2'),
    ],
    13,
    [
      card(
        b('Invariable action vs. agreeing quality', 'Action invariable contre qualité accordée'),
        b(
          'A **present participle** expresses an action and stays **strictly invariable**. Spot it when it has a **direct/indirect object**, **ne… pas**, or an **adverb after it** (*des propos convainquant tout le monde*). A **verbal adjective** describes a lasting quality, agrees in gender and number (**convaincante, fatigantes**), and can follow *être* or take *très* before it. For dozens of verbs, the spelling itself changes!\n\nShift gu to g: **fatiguant / fatigant · naviguant / navigant · intriguant / intrigant**.\nShift qu to c: **convainquant / convaincant · provoquant / provocant · suffoquant / suffocant**.\nShift ant to ent: **précédant / précédent · différant / différent · excellant / excellent**.',
          'Le **participe présent** exprime une action et reste **toujours invariable**. On le reconnaît s’il a un **complément d’objet**, une négation (**ne… pas**) ou un **adverbe placé après** (*des arguments convainquant l’auditoire*). L’**adjectif verbal** exprime une qualité, s’accorde (**convaincante, fatigantes**) et accepte *très* devant lui. Plusieurs verbes changent alors d’orthographe !\n\nChangement gu en g : **fatiguant / fatigant · naviguant / navigant · intriguant / intrigant**.\nChangement qu en c : **convainquant / convaincant · provoquant / provocant · suffoquant / suffocant**.\nChangement ant en ent : **précédant / précédent · différant / différent · excellant / excellent**.',
        ),
        {
          table: {
            head: [b('Verb', 'Verbe'), b('Present participle (invariable)', 'Participe présent (invariable)'), b('Verbal adjective (agrees)', 'Adjectif verbal (s’accorde)')],
            rows: [
              ['fatiguer', 'fatiguant (les joueurs)', 'fatigant / fatigante / fatigants'],
              ['convaincre', 'convainquant (le jury)', 'convaincant / convaincante'],
              ['provoquer', 'provoquant (un débat)', 'provocant / provocante'],
              ['précéder', 'précédant (le vote)', 'précédent / précédente'],
              ['différer', 'différant (de ce modèle)', 'différent / différente'],
              ['négliger', 'négligeant (les détails)', 'négligent / négligente'],
              ['équivaloir', 'équivalant (à dix euros)', 'équivalent / équivalente'],
            ],
          },
          ex: [
            ['Ce trajet quotidien est vraiment fatigant.', 'This daily commute is really tiring.'],
            ['Ces tâches répétitives, fatiguant toute l’équipe, ont été automatisées.', 'These repetitive tasks, tiring out the whole team, have been automated.'],
            ['Elle a présenté des preuves convaincantes devant la commission.', 'She presented convincing evidence before the committee.'],
          ],
        },
      ),
      trap(
        b('The three quick tests that never fail', 'Trois tests simples infaillibles'),
        b(
          '1. Try replacing the word with **très + word**: if it works (*une voix très convaincante*), it is an **adjective**. 2. Look right after the word: if there is a **direct object** (*des mots provoquant la foule*), it is a **participle** and stays invariable. 3. Check for **ne… pas** around it: only a participle takes *ne… pas*.\n\nParticiple clues: **complément d’objet · ne… pas · adverbe après**.\nAdjective clues: **très devant · attribut après être · accord féminin ou pluriel**.',
          '1. Essayez **très** devant le mot : si cela marche (*une preuve très convaincante*), c’est un **adjectif**. 2. Regardez juste après : s’il y a un **COD** (*des propos provoquant la foule*), c’est un **participe** invariable. 3. Vérifiez **ne… pas** : seul le participe accepte la négation verbale.\n\nIndices du participe : **complément d’objet · ne… pas · adverbe après**.\nIndices de l’adjectif : **très devant · attribut après être · accord féminin ou pluriel**.',
        ),
      ),
      mc(
        P.spelling,
        ['convaincantes', 'convainquantes', 'convaincant', 'convainquant'],
        {
          fr: 'Malgré des explications très ___, le doute subsiste.',
          explain: b('Preceded by très and modifying explications (feminine plural), this is the verbal adjective convaincantes.', 'Précédé de très et épithète d’explications (féminin pluriel), c’est l’adjectif verbal convaincantes.'),
        },
      ),
      mc(
        P.spelling,
        ['précédant', 'précédent', 'précédante', 'précédents'],
        {
          fr: 'Les semaines ___ l’ouverture du salon ont été intenses.',
          explain: b('Précédant has a direct object (l’ouverture du salon), so it is the invariable present participle.', 'Précédant a un COD (l’ouverture du salon) : c’est donc le participe présent invariable.'),
        },
      ),
      gap(
        P.complete,
        'Les résultats ___ (différer) de nos prévisions nous ont surpris. La version ___ (précédent) comportait une erreur, mais cette nouvelle mouture reste ___ (convaincant) et moins ___ (fatigant).',
        [['différant'], ['précédente'], ['convaincante'], ['fatigante']],
        {
          strict: true,
          hint: b('Watch out: only the first one has a complement (de nos prévisions) and stays an invariable present participle!', 'Attention : seul le premier possède un complément (de nos prévisions) et reste un participe présent invariable !'),
        },
      ),
      dlg(
        b('Reviewing a draft policy', 'Relire un projet de rapport'),
        b('Hélène and Bastien polish an editorial before publication.', 'Hélène et Bastien relisent un éditorial avant publication.'),
        [['Hélène', 'f'], ['Bastien', 'm']],
        [
          [0, 'Le premier paragraphe est très solide, avec des données vraiment convaincantes.', 'The first paragraph is very solid, with truly convincing data.'],
          [1, { options: ['Oui, mais attention : les arguments précédant la conclusion manquent un peu de lien logique.', 'Oui, mais attention : les arguments précédent la conclusion manquent un peu de lien.', 'Oui, mais attention : les arguments précédents la conclusion manquent un peu de lien.'] }],
          [0, 'Tu as raison. L’analyse terminée, il faudra aussi alléger les phrases trop longues.', 'You’re right. Once the analysis is finished, we’ll also need to trim the overly long sentences.'],
          [1, { options: ['En remplaçant deux relatives par des participes, tout deviendra plus fluide.', 'En remplaçants deux relatives par des participes, tout deviendra plus fluide.', 'Ayant remplacées deux relatives par des participes, tout deviendra plus fluide.'] }],
        ],
      ),
      ord(
        P.order,
        'Des mesures négligeant les réalités locales restent inefficaces.',
        { tr: 'Measures that neglect local realities remain ineffective.' },
      ),
      say('Ces consignes, équivalant à un refus déguisé, ont provoqué un débat animé.', 'These instructions, amounting to a disguised refusal, sparked a lively debate.'),
      write(
        b('Summarize an event using participle clauses', 'Rédiger un bilan avec des participes'),
        b(
          'In 50 to 80 words, write a brief report on a busy conference or team project. Include one gérondif (en + -ant), one compound participle (ayant or étant + past participle), one absolute participle clause, and one correctly spelled verbal adjective (such as convaincante, fatigante or précédente).',
          'En 50 à 80 mots, rédigez un bref compte rendu d’un colloque ou d’un projet d’équipe. Intégrez un gérondif (en + -ant), un participe composé (ayant ou étant + participe passé), une participiale absolue et un adjectif verbal correctement orthographié (convaincante, fatigante, précédente…).',
        ),
        50,
        80,
        [
          b('One gérondif (en + -ant) sharing the main subject', 'Un gérondif (en + -ant) à sujet commun'),
          b('One compound participle (ayant / étant + past participle)', 'Un participe composé (ayant / étant + participe passé)'),
          b('One absolute clause with its own subject + one verbal adjective', 'Une participiale absolue à sujet propre + un adjectif verbal'),
        ],
        'Ayant préparé l’événement pendant trois mois, l’équipe a accueilli deux cents participants vendredi. En multipliant les ateliers pratiques, nous avons rendu cette journée particulièrement dynamique et convaincante. La séance plénière achevée, chaque groupe a rédigé ses priorités pour l’année suivante. Tout en étant exigeante, l’organisation a tenu ses promesses sans fausse note.',
        {
          phrases: ['Ayant préparé', 'En multipliant', 'La séance plénière achevée', 'convaincante', 'Tout en étant'],
        },
      ),
    ],
    [
      b('Present participles take objects/modifiers and stay invariable; verbal adjectives express qualities and agree.', 'Le participe présent accepte un complément ou une négation et reste invariable ; l’adjectif verbal exprime une qualité et s’accorde.'),
      b('Key spelling shifts: fatiguant/fatigant, convainquant/convaincant, précédant/précédent, négligeant/négligent, différant/différent.', 'Changements clés : fatiguant/fatigant, convainquant/convaincant, précédant/précédent, négligeant/négligent, différant/différent.'),
      b('Use the très test before the word: if très fits naturally, agree the verbal adjective.', 'Testez très devant le mot : s’il convient, accordez l’adjectif verbal.'),
    ],
    [
      ['convaincant(e)', b('convincing (verbal adjective)', 'persuasif (adjectif verbal)')],
      ['fatigant(e)', b('tiring (verbal adjective)', 'qui fatigue (adjectif verbal)')],
      ['précédent(e)', b('previous, preceding', 'qui précède (adjectif)')],
      ['équivalant à', b('amounting to (participle)', 'qui équivaut à (participe)')],
    ],
  ),
];

export default lessons;
