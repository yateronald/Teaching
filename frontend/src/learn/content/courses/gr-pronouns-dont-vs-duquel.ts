import type { CourseAbout, Lesson } from '../../types';
import { b, card, dict, dlg, gap, hear, lesson, mc, ord, P, pairs, say, sort, trap, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Relative pronouns are one of the sharpest markers of B2 accuracy. Master when dont replaces de cleanly—and why you must never write dont son—then learn when prepositional phrases force duquel, de laquelle, auquel, par lequel, parmi lesquels and ce à quoi.',
    'Les pronoms relatifs composés signent la maîtrise du niveau B2. Comprenez quand dont remplace de sans tomber dans le pléonasme dont son, puis quand les locutions prépositives imposent duquel, de laquelle, auquel, par lequel, parmi lesquels ou ce à quoi.',
  ),
  outcomes: [
    b('Use qui, que, où and dont accurately and eliminate the dont son / dont leur pleonasm', 'Employer qui, que, où et dont sans faute et bannir le pléonasme dont son'),
    b('Switch to duquel, de laquelle, desquels, desquelles inside prepositional phrases ending in de', 'Passer à duquel, de laquelle, desquels, desquelles après une locution prépositive en de'),
    b('Build formal relatives with auquel, grâce auquel, par lequel and parmi lesquels', 'Construire des relatives soutenues avec auquel, grâce auquel, par lequel et parmi lesquels'),
    b('Handle indefinite antecedents cleanly with ce dont and ce à quoi', 'Maîtriser les antécédents indéfinis avec ce dont et ce à quoi'),
  ],
};

const C = 'gr-pronouns-dont-vs-duquel';

const lessons: Lesson[] = [
  lesson(
    C,
    1,
    ['dont-vs-qui-que-ou', 'dont-et-les-relatifs-de-base'],
    b('Dont and the core relatives: avoiding dont son', 'Dont et les relatifs de base : éviter dont son'),
    b('Use dont for any complement introduced by de, without repeating possessive adjectives.', 'Employer dont pour tout complément introduit par de, sans répéter le possessif.'),
    [
      b('Distinguish qui (subject), que (direct object), où (place/time) and dont (de complement)', 'Distinguer qui (sujet), que (COD), où (lieu/temps) et dont (complément en de)'),
      b('Recognize all three uses of dont: verb + de, adjective + de, noun + de', 'Reconnaître les trois emplois de dont : verbe + de, adjectif + de, nom + de'),
      b('Eliminate the classic dont son / dont sa / dont leur pleonasm', 'Éliminer le pléonasme classique dont son / dont sa / dont leur'),
    ],
    13,
    [
      card(
        b('Three reasons to use dont', 'Trois raisons d’employer dont'),
        b(
          'While **qui** replaces a subject, **que** a direct object, and **où** a place or time, **dont** replaces **de + noun/person** in three situations: (1) a verb constructed with *de* (**parler de, se souvenir de, avoir besoin de**), (2) an adjective constructed with *de* (**être fier de, responsable de, ravi de**), or (3) a noun complement indicating possession or part (**le toit de la maison → la maison dont le toit**).\n\nVerb + de: **parler de, dépendre de, disposer de**.\nAdjective + de: **fier de, satisfait de, conscient de**.\nPossession / part: **le directeur dont l’équipe · la ville dont le centre**.',
          'Alors que **qui** remplace un sujet, **que** un COD et **où** un lieu ou un temps, **dont** remplace **de + nom/personne** dans trois cas : (1) un verbe suivi de *de* (**parler de, se souvenir de, avoir besoin de**), (2) un adjectif suivi de *de* (**être fier de, responsable de, ravi de**), ou (3) un complément du nom marquant l’appartenance (**la maison dont le toit**).\n\nVerbe + de : **parler de, dépendre de, disposer de**.\nAdjectif + de : **fier de, satisfait de, conscient de**.\nAppartenance : **le directeur dont l’équipe · la ville dont le centre**.',
        ),
        {
          table: {
            head: [b('Pronoun', 'Pronom'), b('Replaces', 'Remplace'), b('Example', 'Exemple')],
            rows: [
              ['qui', b('subject', 'sujet'), 'Le rapport qui vient de paraître…'],
              ['que / qu’', b('direct object', 'COD'), 'Le rapport que j’ai rédigé…'],
              ['où', b('place / time', 'lieu / temps'), 'L’année où nous avons ouvert…'],
              ['dont', b('de + noun / person', 'complément en de'), 'Le rapport dont je vous parlais…'],
            ],
          },
          ex: [
            ['Voici l’outil dont nos équipes avaient justement besoin.', 'Here is the tool that our teams precisely needed.'],
            ['C’est une réforme dont les effets se feront sentir dès l’automne.', 'It is a reform whose effects will be felt starting in autumn.'],
            ['Nous avons recruté une juriste dont l’expérience est reconnue.', 'We recruited a lawyer whose experience is recognized.'],
          ],
        },
      ),
      trap(
        b('Never write dont son, dont sa, or dont leur', 'Jamais de dont son, dont sa ou dont leur'),
        b(
          'Because **dont** already contains **de** (“whose / of which”), adding *son, sa, ses, leur* creates a pleonasm—saying “of whom his” twice! Always keep the **definite article (le, la, les)** before the possessed noun: *la collègue **dont le** projet a gagné*, NEVER *la collègue dont son projet a gagné*.\n\nAlso remember: when **dont** modifies a direct object inside the relative clause, keep normal French word order (**dont + Subject + Verb + Object**): *l’auteur **dont j’ai lu le dernier livre***.\n\nWrong (pleonasm): **dont son idée · dont leur budget**.\nCorrect (article): **dont l’idée · dont le budget**.',
          'Comme **dont** contient déjà **de**, ajouter *son, sa, ses, leur* crée un pléonasme ! Gardez toujours l’**article défini (le, la, les)** devant le nom possédé : *la collègue **dont le** projet a gagné*, jamais *dont son projet*.\n\nDe même, si le nom possédé est COD dans la relative, gardez l’ordre **dont + Sujet + Verbe + COD** : *l’auteur **dont j’ai lu le dernier livre***.\n\nPléonasme fautif : **dont son idée · dont leur budget**.\nCorrect : **dont l’idée · dont le budget**.',
        ),
      ),
      mc(
        P.best,
        [
          'C’est une chercheuse dont j’admire beaucoup les travaux.',
          'C’est une chercheuse dont j’admire beaucoup ses travaux.',
          'C’est une chercheuse que j’admire beaucoup les travaux.',
          'C’est une chercheuse de qui j’admire les ses travaux.',
        ],
        {
          fr: 'Which sentence correctly means “She is a researcher whose work I greatly admire”?',
          explain: b('Dont already expresses “of whom”; pair it with the definite article les travaux, keeping standard Subject + Verb + Object order.', 'Dont contient déjà de ; gardez l’article défini les travaux et l’ordre Sujet + Verbe + COD.'),
        },
      ),
      mc(
        P.word,
        ['dont', 'que', 'où', 'qui'],
        {
          fr: 'Les chiffres ___ dispose le ministère restent confidentiels.',
          explain: b('Disposer takes de (disposer de chiffres), so the relative pronoun must be dont.', 'On dit disposer de chiffres : le relatif est donc dont.'),
        },
      ),
      gap(
        P.complete,
        'Voici l’article ___ (that / que) tu m’as conseillé et ___ (whose / dont) ___ (the / l’) analyse m’a particulièrement convaincu.',
        [['que'], ['dont'], ['l’']],
        { hint: b('Use que for the direct object of conseiller, then dont + definite article l’ for “whose analysis”.', 'Employez que (COD de conseiller), puis dont + article défini l’ pour « dont l’analyse ».') },
      ),
      hear(
        'Le musée dont nous venons de visiter la nouvelle aile ferme à dix-neuf heures.',
        b('What does « dont » refer to in this sentence?', 'À quoi « dont » renvoie-t-il dans cette phrase ?'),
        [
          b('The museum (we visited the new wing of the museum)', 'Le musée (nous avons visité la nouvelle aile du musée)'),
          b('The new wing (we visited it)', 'La nouvelle aile (nous l’avons visitée)'),
          b('The closing time (seven p.m.)', 'L’heure de fermeture (dix-neuf heures)'),
        ],
      ),
      ord(
        P.order,
        'L’association dont elle assure la présidence fête ses vingt ans.',
        { tr: 'The association whose presidency she holds is celebrating its twentieth anniversary.' },
      ),
      dict('C’est un détail dont nous sommes conscients mais dont personne ne parle.'),
      say('Nous cherchons un partenaire dont les valeurs correspondent aux nôtres.', 'We are looking for a partner whose values match our own.'),
    ],
    [
      b('Use dont whenever a verb, adjective, or noun takes de (parler de, fier de, le toit de).', 'Employez dont dès qu’un verbe, un adjectif ou un nom est construit avec de.'),
      b('Never write dont son/sa/ses/leur; replace the possessive with le/la/l’/les.', 'N’écrivez jamais dont son/sa/ses/leur : remplacez le possessif par le/la/l’/les.'),
      b('With a direct-object possessed noun, keep Subject + Verb + Article + Noun after dont.', 'Si le nom possédé est COD, gardez l’ordre Sujet + Verbe + Article + Nom après dont.'),
    ],
    [
      ['disposer de', b('to have at one’s disposal', 'avoir à sa disposition')],
      ['être conscient de', b('to be aware of', 'avoir conscience de')],
      ['un pléonasme', b('a redundant repetition', 'une répétition superflue')],
      ['assumer la présidence', b('to hold the presidency', 'exercer la fonction de président(e)')],
    ],
  ),

  lesson(
    C,
    2,
    ['duquel-in-prepositional-phrases', 'duquel-dans-les-locutions-prepositives'],
    b('When duquel is mandatory: à côté de, au sujet de, en raison de', 'Quand duquel est obligatoire : à côté de, au sujet de, en raison de'),
    b('Inside any prepositional phrase ending in de, dont becomes impossible—switch to duquel or de qui.', 'Dans une locution prépositive terminée par de, dont est impossible : passez à duquel ou de qui.'),
    [
      b('Identify prepositional phrases ending in de that block dont', 'Repérer les locutions prépositives en de qui interdisent dont'),
      b('Agree duquel, de laquelle, desquels, desquelles with the antecedent', 'Accorder duquel, de laquelle, desquels, desquelles avec l’antécédent'),
      b('Know when de qui works for people vs. duquel for things and people', 'Savoir quand employer de qui (personnes) ou duquel (choses et personnes)'),
    ],
    13,
    [
      card(
        b('Inside a prepositional phrase, dont is forbidden', 'Dans une locution prépositive, dont est interdit'),
        b(
          'Students often try to use *dont* everywhere there is a *de*. Yet **dont CANNOT follow a preposition**! When the noun is introduced by a **compound preposition ending in de** (**à côté de, au sujet de, en raison de, au cours de, près de, loin de, à la fin de, autour de, en face de**), you MUST keep the first part of the preposition and replace **de + antecedent** with **duquel / de laquelle / desquels / desquelles** (matching the antecedent’s gender and number). For **people**, **de qui** is also natural (and often preferred).\n\nMandatory duquel phrases: **à côté duquel, au sujet duquel, en raison duquel**.\nFeminine & plural forms: **de laquelle, desquels, desquelles**.\nFor people: **à côté de qui · au sujet de qui · à côté duquel**.',
          'On a souvent envie de mettre *dont* partout où apparaît *de*. Or **dont ne peut JAMAIS suivre une préposition** ! Quand le nom dépend d’une **locution prépositive en de** (**à côté de, au sujet de, en raison de, au cours de, près de, loin de, à la fin de, autour de, en face de**), gardez la locution et remplacez **de + antécédent** par **duquel / de laquelle / desquels / desquelles** (accordé à l’antécédent). Pour une **personne**, **de qui** est aussi courant.\n\nLocutions imposant duquel : **à côté duquel, au sujet duquel, en raison duquel**.\nAccords obligatoires : **de laquelle, desquels, desquelles**.\nPour des personnes : **à côté de qui · au sujet de qui · à côté duquel**.',
        ),
        {
          table: {
            head: [b('Antecedent', 'Antécédent'), b('Form after locution in de', 'Forme après locution en de'), b('Example', 'Exemple')],
            rows: [
              [b('masc. sing.', 'masc. sing.'), 'duquel', 'le dossier au sujet duquel nous débattons'],
              [b('fem. sing.', 'fém. sing.'), 'de laquelle', 'la gare en face de laquelle il habite'],
              [b('masc. plur.', 'masc. plur.'), 'desquels', 'les motifs en raison desquels il part'],
              [b('fem. plur.', 'fém. plur.'), 'desquelles', 'les tables autour desquelles on s’assoit'],
            ],
          },
          ex: [
            ['Voici la place au milieu de laquelle se dresse la fontaine.', 'Here is the square in the middle of which the fountain stands.'],
            ['Ce sont des incidents en raison desquels la ligne a été fermée.', 'These are incidents due to which the line was closed.'],
            ['C’est une collègue à côté de laquelle j’ai appris l’essentiel du métier.', 'She is a colleague beside whom I learned the core of the trade.'],
          ],
        },
      ),
      trap(
        b('Spot the difference: simple verb + de vs. prepositional phrase + de', 'Verbe en de contre locution en de'),
        b(
          'Compare two close sentences:\n- *le sujet **dont** je parle* (verb *parler de* → simple *de*, so **dont** ✅)\n- *le sujet **à propos duquel** je vous écris* (preposition *à propos de* → **duquel** ✅, NEVER *à propos dont* ❌)\nAlso check **grâce à** vs **à cause de**: *à cause de* ends in **de** (*à cause duquel*), whereas *grâce à* ends in **à** (*grâce auquel*).\n\nSimple verb + de (dont): **dont je parle, dont je me souviens, dont j’ai peur**.\nPreposition + de (duquel): **au sujet duquel, en dépit duquel, à l’issue de laquelle**.',
          'Comparez ces deux constructions proches :\n- *le sujet **dont** je parle* (verbe *parler de* → **dont** ✅)\n- *le sujet **à propos duquel** je vous écris* (locution *à propos de* → **duquel** ✅, JAMAIS *à propos dont* ❌)\nAttention aussi : *à cause de* se termine par **de** (*à cause duquel*), mais *grâce à* se termine par **à** (*grâce auquel*).\n\nVerbe simple + de (dont) : **dont je parle, dont je me souviens, dont j’ai peur**.\nLocution en de (duquel) : **au sujet duquel, en dépit duquel, à l’issue de laquelle**.',
        ),
      ),
      mc(
        P.form,
        ['de laquelle', 'duquel', 'dont', 'desquelles'],
        {
          fr: 'La réunion au cours ___ cette mesure a été votée a duré trois heures.',
          explain: b('La réunion is feminine singular and au cours de is a prepositional phrase, so use de laquelle.', 'La réunion est féminin singulier après la locution au cours de : employez de laquelle.'),
        },
      ),
      mc(
        P.form,
        ['desquels', 'de laquelle', 'dont', 'duquel'],
        {
          fr: 'Les critères en fonction ___ les candidatures sont classées sont publics.',
          explain: b('Les critères is masculine plural after en fonction de, requiring desquels.', 'Les critères est masculin pluriel après en fonction de : employez desquels.'),
        },
      ),
      gap(
        P.complete,
        'Le projet ___ (dont / duquel) je m’occupe avance bien. C’est la clause en raison ___ (duquel / de laquelle) le contrat a été suspendu. Voici les témoins en présence ___ (desquels / dont) l’acte a été signé.',
        [['dont'], ['de laquelle'], ['desquels']],
        {
          choices: [
            ['dont', 'duquel'],
            ['de laquelle', 'duquel', 'dont'],
            ['desquels', 'dont', 'de laquelle'],
          ],
        },
      ),
      sort(
        b('Dont or duquel / de laquelle / desquels?', 'Dont ou duquel / de laquelle / desquels ?'),
        [
          b('Requires dont', 'Demande dont'),
          b('Requires duquel / de laquelle / desquels', 'Demande duquel / de laquelle / desquels'),
        ],
        [
          ['le livre ___ j’ai besoin', 0],
          ['le parc en face ___ j’habite', 1],
          ['la décision ___ je suis fier', 0],
          ['les règles en vertu ___ il agit', 1],
          ['le film ___ tu m’as parlé', 0],
          ['la loi au nom ___ ils protestent', 1],
        ],
      ),
      ord(
        P.order,
        'Voici les raisons à cause desquelles le chantier a pris du retard.',
        { tr: 'Here are the reasons because of which the construction site fell behind schedule.' },
      ),
      dict('La forêt au bord de laquelle se trouve le chalet est classée réserve naturelle.'),
      say('C’est un principe au nom duquel je ne ferai aucune concession.', 'It is a principle in the name of which I will make no concession.'),
    ],
    [
      b('Dont can NEVER follow a preposition; prepositional phrases ending in de require duquel / de laquelle / desquels / desquelles.', 'Dont ne peut jamais suivre une préposition ; les locutions en de exigent duquel / de laquelle / desquels / desquelles.'),
      b('Always match duquel to the gender and number of the antecedent (la réunion au cours de laquelle).', 'Accordez toujours duquel en genre et en nombre avec son antécédent (la réunion au cours de laquelle).'),
      b('For people after a compound preposition in de, de qui is a natural alternative to duquel.', 'Pour des personnes après une locution en de, de qui est une alternative naturelle à duquel.'),
    ],
    [
      ['à l’issue de', b('at the close / end of', 'à la fin de (réunion, débat)')],
      ['en vertu de', b('by virtue of, under', 'conformément à (une loi)')],
      ['à propos de', b('regarding, about', 'au sujet de')],
      ['en dépit de', b('in spite of', 'malgré')],
    ],
  ),

  lesson(
    C,
    3,
    ['auquel-lequel-and-ce-a-quoi', 'auquel-par-lequel-et-ce-a-quoi'],
    b('Auquel, par lequel, parmi lesquels & ce à quoi', 'Auquel, par lequel, parmi lesquels et ce à quoi'),
    b('Connect prepositions other than de—and handle abstract ideas with ce à quoi and ce dont.', 'Relier les prépositions autres que de et reprendre une idée abstraite avec ce à quoi et ce dont.'),
    [
      b('Use auquel, à laquelle, auxquels, auxquelles when a verb or phrase takes à', 'Employer auquel, à laquelle, auxquels, auxquelles après à'),
      b('Use simple prepositions (avec, pour, par, sans, parmi) + lequel / qui', 'Employer les prépositions (avec, pour, par, sans, parmi) + lequel / qui'),
      b('Use ce à quoi and ce dont when the antecedent is a vague idea or whole clause', 'Utiliser ce à quoi et ce dont avec un antécédent neutre ou toute une phrase'),
    ],
    13,
    [
      card(
        b('Prepositions + lequel, auquel, and ce à quoi', 'Prépositions + lequel, auquel et ce à quoi'),
        b(
          'Whenever a verb or phrase introduces a thing with **à** (**penser à, s’intéresser à, faire face à, grâce à**), contract **à + lequel** into **auquel / à laquelle / auxquels / auxquelles**. After any other preposition (**avec, pour, par, sur, sans, dans, parmi, selon**), use **lequel / laquelle / lesquels / lesquelles** for things (and **qui** or **lequel** for people). Finally, when referring back to “what / the thing that” (no concrete noun), use **ce à quoi** (with *à*) or **ce dont** (with *de*).\n\nContracted with à: **auquel, à laquelle, auxquels, auxquelles**.\nAfter prepositions: **par lequel, avec laquelle, parmi lesquels**.\nNeutral antecedent: **ce à quoi · ce dont · ce sur quoi**.',
          'Quand un verbe ou une locution introduit une chose avec **à** (**penser à, s’intéresser à, faire face à, grâce à**), contractez **à + lequel** en **auquel / à laquelle / auxquels / auxquelles**. Après toute autre préposition (**avec, pour, par, sur, sans, dans, parmi, selon**), employez **lequel / laquelle / lesquels / lesquelles** pour les choses (et **qui** ou **lequel** pour les personnes). Pour reprendre « la chose à laquelle / de laquelle », employez **ce à quoi** ou **ce dont**.\n\nContractions avec à : **auquel, à laquelle, auxquels, auxquelles**.\nAprès préposition : **par lequel, avec laquelle, parmi lesquels**.\nAntécédent neutre : **ce à quoi · ce dont · ce sur quoi**.',
        ),
        {
          table: {
            head: [b('Trigger', 'Préposition'), b('Masc. Sg. / Fem. Sg.', 'Masc. Sg. / Fém. Sg.'), b('Masc. Pl. / Fem. Pl.', 'Masc. Pl. / Fém. Pl.')],
            rows: [
              ['à (+ chose)', 'auquel / à laquelle', 'auxquels / auxquelles'],
              ['avec / par / pour / sur', 'lequel / laquelle', 'lesquels / lesquelles'],
              ['parmi (pluriel)', '—', 'parmi lesquels / parmi lesquelles'],
              [b('indefinite (ce)', 'neutre (ce)'), 'ce à quoi / ce sur quoi / ce dont', '—'],
            ],
          },
          ex: [
            ['C’est une difficulté majeure à laquelle nous ne nous attendions pas.', 'This is a major difficulty that we did not expect.'],
            ['Les méthodes par lesquelles ils obtiennent ce résultat restent secrètes.', 'The methods by which they obtain this result remain secret.'],
            ['Voilà précisément ce à quoi je voulais faire allusion.', 'That is precisely what I wanted to allude to.'],
          ],
        },
      ),
      trap(
        b('Parmi takes plural; ce takes quoi (never lequel)', 'Parmi exige le pluriel ; ce exige quoi'),
        b(
          'Watch two reliable checks: **parmi** (“among”) can only pair with plural forms (**parmi lesquels** / **parmi lesquelles**). And after **ce** (referring to a whole idea or clause), **lequel** is impossible—always use **quoi** after a preposition (**ce à quoi, ce sur quoi, ce sans quoi**) and **dont** for *de* (**ce dont**). Note: **à qui** stays normal for people (*la personne à qui j’écris*).\n\nRight after ce: **ce à quoi il songe, ce dont elle rêve, ce sans quoi rien ne marche**.\nWrong after ce: **ce auquel · ce de quoi (prefer ce dont)**.',
          'Retenez deux réflexes sûrs : **parmi** impose toujours le pluriel (**parmi lesquels / parmi lesquelles**). Et après **ce** (qui reprend une idée), *lequel* est impossible : employez **quoi** après préposition (**ce à quoi, ce sur quoi, ce sans quoi**) et **dont** pour *de* (**ce dont**). Pour une personne après *à*, **à qui** reste naturel.\n\nCorrect après ce : **ce à quoi il songe, ce dont elle rêve, ce sans quoi rien ne marche**.\nÀ éviter après ce : **ce auquel · ce de quoi (préférez ce dont)**.',
        ),
      ),
      mc(
        P.form,
        ['grâce auquel', 'grâce duquel', 'grâce à qui', 'grâce dont'],
        {
          fr: 'C’est un dispositif innovant ___ l’hôpital réduit ses délais.',
          explain: b('Grâce à + masculine singular thing (un dispositif) contracts to grâce auquel.', 'Grâce à + nom masculin singulier de chose (un dispositif) se contracte en grâce auquel.'),
        },
      ),
      mc(
        P.form,
        ['ce à quoi', 'ce auquel', 'ce dont', 'ce qui'],
        {
          fr: 'L’autonomie financière est ___ aspirent la plupart des étudiants.',
          explain: b('Aspirer takes à; with neutral ce (“that which”), use ce à quoi.', 'On dit aspirer à quelque chose ; après l’antécédent neutre ce, on emploie ce à quoi.'),
        },
      ),
      gap(
        P.completeText,
        'J’ai reçu cinquante dossiers, parmi ___ (lesquels / lesquelles) dix viennent de l’étranger. La méthode par ___ (lequel / laquelle) elle vérifie les calculs est fiable, contrairement à ___ (ce dont / ce à quoi) je m’attendais.',
        [['lesquels'], ['laquelle'], ['ce à quoi']],
        {
          choices: [
            ['lesquels', 'lesquelles', 'auxquels'],
            ['laquelle', 'lequel', 'duquel'],
            ['ce à quoi', 'ce dont', 'ce auquel'],
          ],
        },
      ),
      dlg(
        b('Debating a municipal transit plan', 'Débattre d’un plan de mobilité'),
        b('Élodie and Thomas review a proposal for new tram lines.', 'Élodie et Thomas examinent un projet de nouvelles lignes de tramway.'),
        [['Élodie', 'f'], ['Thomas', 'm']],
        [
          [0, 'Les quartiers auxquels cette ligne donnera accès sont aujourd’hui très isolés.', 'The neighborhoods to which this line will give access are very isolated today.'],
          [1, { options: ['Oui, mais le coût en raison duquel la mairie hésite reste élevé.', 'Oui, mais le coût en raison dont la mairie hésite reste élevé.', 'Oui, mais le coût en raison auquel la mairie hésite reste élevé.'] }],
          [0, 'C’est justement ce sur quoi la commission des finances doit trancher vendredi.', 'That is precisely what the finance committee has to rule on Friday.'],
          [1, { options: ['Espérons qu’elle trouve une solution grâce à laquelle le projet verra le jour.', 'Espérons qu’elle trouve une solution grâce duquel le projet verra le jour.', 'Espérons qu’elle trouve une solution grâce dont le projet verra le jour.'] }],
        ],
      ),
      ord(
        P.order,
        'Les obstacles auxquels nous faisons face restent surmontables.',
        { tr: 'The obstacles that we face remain surmountable.' },
      ),
      pairs(
        P.match,
        [
          ['dont', b('replaces verb/noun + de', 'remplace un complément simple en de')],
          ['duquel', b('inside a phrase ending in de', 'après une locution prépositive en de')],
          ['auquel', b('replaces à + masculine singular noun', 'remplace à + nom masculin singulier')],
          ['ce à quoi', b('what (with a verb taking à)', 'la chose à laquelle')],
        ],
      ),
      say('Parmi les options sur lesquelles nous travaillons, celle-ci est la plus réaliste.', 'Among the options we are working on, this one is the most realistic.'),
      write(
        b('Write a formal project summary using compound relatives', 'Rédiger une note avec des relatifs composés'),
        b(
          'In 50 to 80 words, describe a tool, reform, or cultural project you support. Include at least one dont without pleonasm, one duquel/de laquelle/desquels after a prepositional phrase, one auquel/auxquelles or par lequel, and ce à quoi or ce dont.',
          'En 50 à 80 mots, présentez un outil, une réforme ou un projet culturel que vous soutenez. Intégrez au moins un dont sans pléonasme, un duquel/de laquelle/desquels après locution prépositive, un auquel/auxquelles ou par lequel, et ce à quoi ou ce dont.',
        ),
        50,
        80,
        [
          b('One dont clause without possessive pleonasm', 'Un dont correct sans pléonasme possessif'),
          b('One duquel / de laquelle / desquels after a de-phrase', 'Un duquel / de laquelle / desquels après une locution en de'),
          b('One auquel / par lequel + one ce à quoi or ce dont', 'Un auquel / par lequel + un ce à quoi ou ce dont'),
        ],
        'Nous soutenons la création d’une médiathèque municipale dont l’utilité est évidente. C’est un lieu au sein duquel les étudiants trouveront des salles calmes et des archives numériques. Le budget grâce auquel le bâtiment sera rénové provient d’une subvention régionale. Voilà précisément ce à quoi la ville doit consacrer ses efforts pour favoriser l’accès à la culture.',
        {
          phrases: ['dont l’utilité', 'au sein duquel', 'grâce auquel', 'ce à quoi'],
        },
      ),
    ],
    [
      b('Contract à + lequel into auquel / à laquelle / auxquels / auxquelles (grâce auquel, faire face auxquels).', 'Contractez à + lequel en auquel / à laquelle / auxquels / auxquelles (grâce auquel, faire face auxquels).'),
      b('Use lequel/laquelle/lesquels/lesquelles after simple prepositions like par, avec, pour, sur, sans, parmi.', 'Employez lequel/laquelle/lesquels/lesquelles après les prépositions simples comme par, avec, pour, sur, sans, parmi.'),
      b('Use ce à quoi and ce dont (never ce auquel) when referring back to an idea or whole clause.', 'Employez ce à quoi et ce dont (jamais ce auquel) pour reprendre une idée générale.'),
    ],
    [
      ['auquel / auxquels', b('to which (+ masc. thing)', 'à lequel / à lesquels')],
      ['parmi lesquels', b('among which (plural)', 'au nombre desquels')],
      ['grâce auquel', b('thanks to which', 'par l’action positive duquel')],
      ['ce à quoi', b('what (+ verb taking à)', 'la chose à laquelle')],
    ],
  ),
];

export default lessons;
