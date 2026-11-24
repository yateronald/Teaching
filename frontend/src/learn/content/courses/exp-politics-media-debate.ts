import type { CourseAbout, Lesson } from '../../types';
import { P, b, card, culture, dict, dlg, flash, gap, hear, lesson, mc, ord, pairs, say, sort, tip, trap, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Read and decode French political commentary, press editorials and live broadcasts at C1 level. Master fifteen high-value idioms covering rhetorical evasion, media storms, investigative breakthroughs and decisive power shifts—and deploy them with analytical poise in DALF C1 essays and oral debates.',
    'Lisez et décodez les éditoriaux, la presse politique et les débats télévisés au niveau C1. Maîtrisez quinze expressions majeures — esquive oratoire, polémiques médiatiques, révélations d’enquête et retournements de pouvoir — et maniez-les avec justesse dans vos synthèses, essais et oraux DALF C1.',
  ),
  outcomes: [
    b('Identify and critique rhetorical evasion and doublespeak in debates', 'Repérer et qualifier la langue de bois et les esquives rhétoriques en débat'),
    b('Distinguish genuine revelations from media hype and escalation', 'Distinguer véritable révélation médiatique, surenchère et polémique amplifiée'),
    b('Analyse policy reversals, power shifts and stalemates with C1 editorial precision', 'Analyser revirements, rapports de force et impasses avec la précision du C1'),
  ],
};

const C = 'exp-politics-media-debate';

const lessons: Lesson[] = [
  lesson(
    C,
    1,
    ['evading-answers', 'esquiver-les-questions'],
    b('Evading Answers & Political Doublespeak', 'Langue de bois et esquives oratoires'),
    b('Spot and name the classic ways politicians and spokespeople dodge tough questions in interviews and parliamentary debates.', 'Repérer et nommer les procédés par lesquels responsables et porte-paroles esquivent les questions gênantes en interview ou en débat.'),
    [
      b('Distinguish empty doublespeak from deliberate distraction or refusal', 'Distinguer langue de bois, diversion verbale et refus poli de répondre'),
      b('Use five core debate-analysis idioms accurately', 'Employer cinq expressions clés de l’analyse politique et médiatique'),
      b('Recognise evasion cues in fast C1 audio commentary', 'Identifier les indices d’esquive dans un extrait audio C1'),
    ],
    13,
    [
      card(
        b('How speakers dodge a direct question', 'L’art d’éviter la question qui fâche'),
        b(
          'French political journalism is quick to call out evasion. Rather than merely saying *il ne répond pas*, C1 commentators name the exact tactic: hiding behind hollow formulas (**pratiquer la langue de bois**), drowning the issue in digressions (**noyer le poisson**), or punting responsibility elsewhere (**botter en touche**).\nHollow jargon: **pratiquer la langue de bois**.\nDiversion & avoidance: **noyer le poisson, botter en touche, tourner autour du pot, éluder la question**.',
          'La presse francophone nomme avec mordant l’esquive politique. Plutôt que de dire *il ne répond pas*, l’analyse de niveau C1 distingue les procédés : formules creuses (**pratiquer la langue de bois**), digression confuse (**noyer le poisson**) ou renvoi de balle (**botter en touche**).\nDiscours creux : **pratiquer la langue de bois**.\nDiversion et évitement : **noyer le poisson, botter en touche, tourner autour du pot, éluder la question**.',
        ),
        {
          table: {
            head: [b('Expression', 'Expression'), b('Tactic', 'Procédé'), b('Meaning', 'Sens')],
            rows: [
              ['pratiquer la langue de bois', b('hollow bureaucratic jargon', 'jargon figé et creux'), b('to use political doublespeak', 'parler par formules vagues et convenues')],
              ['noyer le poisson', b('excess details & digression', 'digressions et détails confus'), b('to muddy the waters / bury the issue', 'noyer l’essentiel sous un flot de paroles')],
              ['botter en touche', b('deflecting elsewhere (rugby)', 'renvoyer hors du terrain'), b('to punt / dodge responsibility', 'esquiver en renvoyant à plus tard ou à autrui')],
              ['tourner autour du pot', b('delaying the core point', 'différer le cœur du sujet'), b('to beat around the bush', 'éviter d’aborder directement un point sensible')],
              ['éluder la question', b('formal refusal / sidestep', 'contournement soutenu'), b('to evade / sidestep the question', 'éviter adroitement de répondre')],
            ],
          },
          ex: [
            ['Plutôt que de chiffrer la réforme, le porte-parole a pratiqué la langue de bois pendant dix minutes.', 'Instead of giving figures for the reform, the spokesperson used doublespeak for ten minutes.'],
            ['À force de citer des annexes techniques, l’invité cherche manifestement à noyer le poisson.', 'By citing technical appendices endlessly, the guest is clearly trying to muddy the waters.'],
            ['Interrogée sur son vote futur, la sénatrice a botté en touche en invoquant un calendrier encore incertain.', 'Asked about her upcoming vote, the senator punted by citing a still uncertain schedule.'],
          ],
        },
      ),
      culture(
        b('French interview culture & calling out evasion', 'Culture du débat télévisé et chasse à la langue de bois'),
        b(
          'On French political programmes and parliamentary broadcasts, journalists openly interrupt guests to reject **la langue de bois** or accuse them of **botter en touche** (a rugby metaphor: kicking the ball out of play to stop an attack). Notice register: **éluder la question** is high-formal and analytical, whereas **tourner autour du pot** is everyday standard.',
          'Sur les plateaux de débat et dans les chroniques parlementaires, les journalistes n’hésitent pas à dénoncer **la langue de bois** ou à reprocher à un invité de **botter en touche** (image venue du rugby). Notez le registre : **éluder la question** est très soutenu, tandis que **tourner autour du pot** appartient au registre courant.',
        ),
      ),
      flash(
        b('Five political evasion expressions', 'Cinq expressions d’esquive en débat'),
        [
          ['pratiquer la langue de bois', b('to speak in doublespeak / hollow buzzwords', 'tenir un discours figé, vague et convenu')],
          ['noyer le poisson', b('to muddy the waters / overwhelm with digressions', 'embrouiller le propos pour faire oublier l’essentiel')],
          ['botter en touche', b('to punt / sidestep responsibility', 'esquiver une question en renvoyant à plus tard ou à un tiers')],
          ['tourner autour du pot', b('to beat around the bush', 'hésiter à aborder directement le sujet qui gêne')],
          ['éluder la question', b('to evade / sidestep the question', 'éviter adroitement de répondre au point précis')],
        ],
      ),
      mc(
        P.meaning,
        [
          b('The minister deliberately buried the real budget issue under confusing technicalities.', 'Le ministre a volontairement noyé le vrai débat budgétaire sous des détails techniques confus.'),
          b('The minister promised to protect coastal fisheries immediately.', 'Le ministre a promis de protéger aussitôt la pêche côtière.'),
          b('The minister answered with remarkable brevity and clarity.', 'Le ministre a répondu avec une clarté et une concision remarquables.'),
          b('The minister walked out of the studio before the interview began.', 'Le ministre a quitté le studio avant même le début de l’entretien.'),
        ],
        {
          fr: '« Interrogé sur le déficit réel, le ministre a noyé le poisson pendant un quart d’heure à grand renfort de moyennes statistiques. »',
          explain: b('Noyer le poisson means drowning the core issue in excess detail or irrelevant remarks so listeners lose track.', 'Noyer le poisson signifie noyer l’enjeu principal sous un flot de détails pour détourner l’attention.'),
        },
      ),
      mc(
        P.best,
        [
          'Plutôt que de répondre sur les coupes budgétaires, l’élue a botté en touche en renvoyant la balle au comité européen.',
          'Plutôt que de répondre sur les coupes budgétaires, l’élue a tiré le poisson dans le pot.',
          'Plutôt que de répondre sur les coupes budgétaires, l’élue a pratiqué la touche en bois.',
          'Plutôt que de répondre sur les coupes budgétaires, l’élue a tourné la question dans l’eau.',
        ],
        {
          fr: 'Dans une analyse DALF C1, vous relevez qu’une responsable politique renvoie la responsabilité à une autre instance :',
          explain: b('Botter en touche precisely captures deflecting a difficult question onto someone else or delaying it.', 'Botter en touche décrit avec justesse le fait d’esquiver une question embarrassante en la renvoyant ailleurs.'),
        },
      ),
      pairs(
        P.match,
        [
          ['pratiquer la langue de bois', b('to rely on hollow political jargon', 'enchaîner les formules creuses et convenues')],
          ['noyer le poisson', b('to confuse the issue with digressions', 'embrouiller la discussion par trop de détails')],
          ['botter en touche', b('to punt / deflect a tough question', 'esquiver en renvoyant la décision ailleurs')],
          ['tourner autour du pot', b('to beat around the bush', 'éviter d’aller droit au fait')],
          ['éluder la question', b('to evade the question cleanly', 'éviter habilement de répondre')],
        ],
      ),
      gap(
        P.complete,
        'À trois reprises, l’éditorialiste a reproché au candidat de ___ et de ___ au lieu d’assumer un chiffrage précis.',
        [['pratiquer la langue de bois'], ['botter en touche']],
        {
          choices: [
            ['pratiquer la langue de bois', 'lever un lièvre', 'faire volte-face'],
            ['botter en touche', 'jeter un pavé', 'tenir le haut du pavé'],
          ],
          explain: b('Using vague clichés (pratiquer la langue de bois) and deflecting specifics (botter en touche) both capture refusal to commit to numbers.', 'Pratiquer la langue de bois et botter en touche traduisent tous deux le refus de s’engager sur un chiffrage précis.'),
        },
      ),
      hear(
        'Madame la députée, vous éludez la question depuis dix minutes en tournant autour du pot : êtes-vous oui ou non favorable au maintien de cette taxe locale ?',
        b('What criticism is the journalist making on air?', 'Quel reproche le journaliste adresse-t-il à l’antenne ?'),
        [
          b('The MP keeps sidestepping the question without giving a clear yes or no.', 'La députée évite de répondre directement sans assumer un oui ou un non.'),
          b('The MP spoke too concisely and skipped necessary background.', 'La députée a répondu trop brièvement sans contextualiser.'),
          b('The MP already voted in favour of abolishing the local tax.', 'La députée a déjà voté pour la suppression de la taxe locale.'),
          b('The MP accused another panel guest of leaking confidential figures.', 'La députée a accusé un autre invité d’avoir divulgué des chiffres.'),
        ],
      ),
      dict('Cessez de pratiquer la langue de bois et de noyer le poisson : cessez d’éluder la question.', {
        hint: b('Watch silent final -s on cessez and single-s vs double-s in poisson.', 'Attention au -z final de cessez et au double s de poisson.'),
      }),
      say(
        'Ne tournons pas autour du pot : à force de botter en touche, ce porte-parole alimente la méfiance.',
        'Let’s not beat around the bush: by constantly punting, this spokesperson fuels distrust.',
      ),
    ],
    [
      b('pratiquer la langue de bois = use hollow jargon; noyer le poisson = bury the point in fluff.', 'pratiquer la langue de bois = jargon creux ; noyer le poisson = embrouiller sous un flot de paroles.'),
      b('botter en touche = deflect/punt; tourner autour du pot = beat around the bush.', 'botter en touche = renvoyer la balle ailleurs ; tourner autour du pot = tarder à aborder le vrai sujet.'),
      b('éluder la question = formally evade answering a direct question.', 'éluder la question = éviter habilement une réponse attendue (registre soutenu).'),
    ],
    [
      ['pratiquer la langue de bois', b('to use political doublespeak', 'tenir un discours creux et convenu')],
      ['noyer le poisson', b('to muddy the waters', 'noyer l’essentiel sous des digressions')],
      ['botter en touche', b('to punt / deflect a question', 'esquiver en renvoyant à plus tard ou à autrui')],
      ['tourner autour du pot', b('to beat around the bush', 'éviter d’aborder directement un point')],
      ['éluder la question', b('to evade the question', 'contourner adroitement une question précise')],
    ],
  ),

  lesson(
    C,
    2,
    ['headlines-and-controversy', 'actualites-et-polemiques'],
    b('Headlines, Scandals & Media Storms', 'Gros titres, révélations et polémiques'),
    b('Distinguish uncovering a real flaw from blowing an incident out of proportion, sparking fierce debate or stoking public anger.', 'Distinguer révélation d’une faille cachée, exagération médiatique, débat vif et surenchère polémique.'),
    [
      b('Contrast investigative breakthroughs (lever un lièvre) with sensationalism (monter en épingle)', 'Opposer découverte d’une anomalie (lever un lièvre) et exagération (monter en épingle)'),
      b('Avoid preposition traps in jeter un pavé dans la mare and monter en épingle', 'Maîtriser les prépositions exactes (dans la mare, en épingle, sur les braises)'),
      b('Build and analyse complex C1 press headlines', 'Construire et décoder des phrases de presse de niveau C1'),
    ],
    13,
    [
      card(
        b('Breaking news & fanning flames', 'Révéler un scandale ou souffler sur les braises'),
        b(
          'Press commentary carefully separates **uncovering truth**, **shocking complacency**, **generating endless commentary**, and **sensationalising or inflaming tensions**.\nShock & discovery: **jeter un pavé dans la mare, lever un lièvre**.\nBuzz & inflammation: **faire couler beaucoup d’encre, monter en épingle, souffler sur les braises**.',
          'La presse distingue finement la **mise au jour d’une faille**, le **choc salutaire**, le **retentissement durable** et la **surenchère polémique**.\nChoc et enquête : **jeter un pavé dans la mare, lever un lièvre**.\nÉcho et escalade : **faire couler beaucoup d’encre, monter en épingle, souffler sur les braises**.',
        ),
        {
          table: {
            head: [b('Idiom', 'Expression'), b('Journalistic tone', 'Nuance'), b('Meaning', 'Sens')],
            rows: [
              ['jeter un pavé dans la mare', b('Disruptive / candid', 'Franchise brutale'), b('to drop a bombshell / stir complacency', 'provoquer un scandale en disant une vérité gênante')],
              ['lever un lièvre', b('Investigative', 'Enquête'), b('to uncover a hidden flaw or scandal', 'découvrir une anomalie ou un problème caché')],
              ['monter en épingle', b('Critical of hype', 'Sensationalisme'), b('to blow out of proportion', 'exagérer un fait mineur pour faire scandale')],
              ['faire couler beaucoup d’encre', b('Analytical', 'Débat durable'), b('to generate intense debate / press', 'susciter d’innombrables articles et réactions')],
              ['souffler sur les braises', b('Critical of incitement', 'Surenchère'), b('to fan the flames', 'raviver ou attiser un conflit latent')],
            ],
          },
          ex: [
            ['Cet ancien haut fonctionnaire a jeté un pavé dans la mare en dénonçant le coût réel du projet.', 'That former senior official dropped a bombshell by exposing the project’s real cost.'],
            ['En vérifiant les factures municipales, les journalistes ont levé un sérieux lièvre.', 'By checking city invoices, journalists uncovered a serious hidden flaw.'],
            ['Ce décret sur le temps scolaire a déjà fait couler beaucoup d’encre dans la presse.', 'This decree on school hours has already generated massive press commentary.'],
          ],
        },
      ),
      trap(
        b('Do not confuse lever un lièvre with monter en épingle', 'Ne confondez pas lever un lièvre et monter en épingle'),
        b(
          '**Lever un lièvre** means uncovering a *real, hidden problem* through sharp scrutiny (credit to the investigator). **Monter en épingle** is critical: it accuses someone or a media outlet of blowing a *minor incident* out of proportion. Also lock in the exact prepositions: **jeter un pavé dans la mare** (never *sur*), **monter en épingle** (never *sur*), and **souffler sur les braises** (plural *les braises*).',
          '**Lever un lièvre** salue la mise au jour d’un *problème réel et caché*. À l’inverse, **monter en épingle** reproche à un média ou à un adversaire de gonfler un *incident mineur*. Respectez les prépositions : **dans la mare** (jamais *sur*), **en épingle** et **sur les braises** (au pluriel).',
        ),
      ),
      flash(
        b('Five press & controversy idioms', 'Cinq expressions de presse et de polémique'),
        [
          ['jeter un pavé dans la mare', b('to drop a bombshell / shake complacency', 'dire une vérité choc qui trouble un consensus')],
          ['lever un lièvre', b('to uncover a hidden flaw or scandal', 'découvrir par hasard ou enquête une anomalie grave')],
          ['monter en épingle', b('to blow out of proportion / sensationalise', 'amplifier abusivement un fait mineur')],
          ['faire couler beaucoup d’encre', b('to spark endless commentary / ink', 'provoquer de nombreux débats et articles')],
          ['souffler sur les braises', b('to fan the flames of conflict', 'attiser une colère ou un conflit déjà latent')],
        ],
      ),
      mc(
        P.meaning,
        [
          b('Commentators blew a minor phrasing slip wildly out of proportion.', 'Des commentateurs ont exagéré à l’excès une maladresse mineure.'),
          b('Journalists discovered a major hidden accounting fraud.', 'Des journalistes ont découvert une fraude comptable majeure et cachée.'),
          b('The editorial settled the dispute calmly in one paragraph.', 'L’éditorial a réglé le différend calmement en un paragraphe.'),
          b('The press completely ignored the candidate’s speech.', 'La presse a totalement ignoré le discours du candidat.'),
        ],
        {
          fr: '« À la veille du scrutin, plusieurs chaînes ont monté en épingle une phrase anodine sortie de son contexte. »',
          explain: b('Monter en épingle means exaggerating a minor detail or remark to manufacture outrage.', 'Monter en épingle signifie amplifier artificiellement un détail secondaire pour créer une polémique.'),
        },
      ),
      mc(
        P.best,
        [
          'Au lieu d’apaiser la grève, ces déclarations provocatrices n’ont fait que souffler sur les braises.',
          'Au lieu d’apaiser la grève, ces déclarations provocatrices ont levé un lièvre dans l’encre.',
          'Au lieu d’apaiser la grève, ces déclarations provocatrices ont botté l’épingle dans la mare.',
          'Au lieu d’apaiser la grève, ces déclarations provocatrices ont noyé la touche.',
        ],
        {
          fr: 'Dans une synthèse C1, vous critiquez des propos qui ravivent une colère sociale déjà vive :',
          explain: b('Souffler sur les braises means deliberately or recklessly reigniting simmering tension.', 'Souffler sur les braises signifie attiser une tension ou une colère déjà prête à s’enflammer.'),
        },
      ),
      sort(
        b('Sort each expression by its primary effect in public debate.', 'Classez chaque expression selon son effet dans le débat public.'),
        [b('Revelation or wide debate', 'Révélation ou fort retentissement'), b('Evasion or inflammatory hype', 'Esquive ou surenchère polémique')],
        [
          ['lever un lièvre', 0],
          ['monter en épingle', 1],
          ['jeter un pavé dans la mare', 0],
          ['souffler sur les braises', 1],
          ['faire couler beaucoup d’encre', 0],
          ['noyer le poisson', 1],
        ],
      ),
      gap(
        P.complete,
        'En publiant cet audit confidentiel, la journaliste a levé un ___ majeur et jeté un ___ dans la mare.',
        ['lièvre', 'pavé'],
        {
          tr: 'By publishing this confidential audit, the journalist uncovered a major hidden flaw and dropped a bombshell.',
          hint: b('Two single nouns: lever un ___ / jeter un ___ dans la mare.', 'Deux noms simples : lever un ___ / jeter un ___ dans la mare.'),
        },
      ),
      ord(
        P.order,
        'Cette loi controversée va encore faire couler beaucoup d’encre dans la presse.',
        {
          tr: 'This controversial law is going to spark a great deal more debate in the press.',
          extra: ['braises', 'lièvre'],
          explain: b('Notice infinitive faire couler beaucoup d’encre following va encore.', 'Notez la suite verbale va encore faire couler beaucoup d’encre.'),
        },
      ),
      hear(
        'Le rapport de la Cour des comptes a véritablement jeté un pavé dans la mare : en relevant une erreur de calcul vieille de cinq ans, il a levé un lièvre qui risque de faire couler beaucoup d’encre jusqu’aux élections.',
        b('What did the audit report accomplish?', 'Qu’a provoqué le rapport de la Cour des comptes ?'),
        [
          b('It shook public debate by uncovering a five-year-old calculation error that will draw intense coverage.', 'Il a secoué le débat en révélant une erreur vieille de cinq ans qui suscitera de nombreux articles.'),
          b('It blew a trivial scheduling detail out of proportion to help one candidate.', 'Il a monté en épingle un détail sans importance pour aider un candidat.'),
          b('It buried the budgetary flaw under vague bureaucratic clichés.', 'Il a noyé la faille budgétaire sous des formules administratives vagues.'),
          b('It went unnoticed by both journalists and opposition parties.', 'Il est passé totalement inaperçu dans la presse et chez les élus.'),
        ],
        { voice: 'm' },
      ),
      say(
        'Loin de vouloir souffler sur les braises, cette enquête indépendante a surtout levé un lièvre essentiel.',
        'Far from wishing to fan the flames, this independent investigation primarily uncovered an essential hidden flaw.',
      ),
    ],
    [
      b('jeter un pavé dans la mare = drop a bombshell; lever un lièvre = uncover a real hidden flaw.', 'jeter un pavé dans la mare = provoquer un choc salutaire ; lever un lièvre = révéler une faille cachée.'),
      b('monter en épingle = blow out of proportion; souffler sur les braises = fan the flames.', 'monter en épingle = exagérer un détail ; souffler sur les braises = attiser un conflit.'),
      b('faire couler beaucoup d’encre = spark extensive press commentary and debate.', 'faire couler beaucoup d’encre = susciter de très nombreux articles et commentaires.'),
    ],
    [
      ['jeter un pavé dans la mare', b('to drop a bombshell / shake complacency', 'provoquer un émoi en révélant une vérité gênante')],
      ['lever un lièvre', b('to uncover a hidden flaw or scandal', 'découvrir un problème caché ou une anomalie')],
      ['monter en épingle', b('to blow out of proportion', 'exagérer abusivement un fait secondaire')],
      ['faire couler beaucoup d’encre', b('to generate intense press debate', 'susciter de très nombreux commentaires écrits')],
      ['souffler sur les braises', b('to fan the flames', 'raviver un conflit ou une colère latente')],
    ],
  ),

  lesson(
    C,
    3,
    ['power-and-turning-points', 'pouvoir-et-tournants'],
    b('Power Shifts, U-Turns & Dead Letters', 'Rapports de force, volte-face et impasses'),
    b('Analyse dominant voices, abrupt U-turns, unenforced laws, equal dismissals and contrarian stances in C1 editorials.', 'Analyser positions dominantes, revirements brusques, textes inappliqués, renvois dos à dos et contre-pieds argumentatifs.'),
    [
      b('Control the syntax of rester lettre morte and renvoyer dos à dos', 'Maîtriser la syntaxe exacte de rester lettre morte et renvoyer dos à dos'),
      b('Evaluate political commentary in a live broadcast dialogue', 'Interpréter et poursuivre un débat médiatique en dialogue C1'),
      b('Write a crisp C1 editorial paragraph combining course idioms seamlessly', 'Rédiger un paragraphe éditorial C1 intégrant plusieurs expressions avec sobriété'),
    ],
    13,
    [
      card(
        b('Dominance, reversals & rhetorical pivots', 'Domination, volte-face et renversements'),
        b(
          'High-level French editorials rely on compact idioms to judge who leads the debate, whether a promise actually took effect, or how a speaker broke with consensus.\nDominance & U-turn: **tenir le haut du pavé, faire volte-face**.\nDeadlocks & stance: **rester lettre morte, renvoyer dos à dos, prendre le contre-pied**.',
          'Les éditoriaux de niveau C1 s’appuient sur des locutions denses pour qualifier qui domine la scène, si une réforme s’applique ou comment un orateur rompt avec l’opinion courante.\nDomination et revirement : **tenir le haut du pavé, faire volte-face**.\nImpasse et contre-pied : **rester lettre morte, renvoyer dos à dos, prendre le contre-pied**.',
        ),
        {
          table: {
            head: [b('Idiom', 'Expression'), b('Grammar frame', 'Construction'), b('Meaning', 'Sens')],
            rows: [
              ['tenir le haut du pavé', b('subject + tenir…', 'sujet + tenir…'), b('to hold sway / dominate the scene', 'occuper le premier rang, dominer')],
              ['faire volte-face', b('invariable noun', 'locution invariable'), b('to do a complete U-turn', 'changer brusquement d’avis ou de camp')],
              ['rester lettre morte', b('NO article before lettre', 'sans article devant lettre'), b('to remain a dead letter / unenforced', 'rester sans effet ni application')],
              ['renvoyer dos à dos', b('renvoyer A et B dos à dos', 'renvoyer A et B dos à dos'), b('to put both sides on a par / dismiss equally', 'rejeter deux camps adverses à égalité')],
              ['prendre le contre-pied', b('prendre le contre-pied de X', 'prendre le contre-pied de X'), b('to take the exact opposite view', 'soutenir l’opposé exact d’une thèse')],
            ],
          },
          ex: [
            ['Malgré deux chartes ambitieuses, les engagements de transparence sont restés lettre morte.', 'Despite two ambitious charters, the transparency pledges remained a dead letter.'],
            ['Après avoir défendu la taxe carbone, le parti a fait volte-face en pleine campagne.', 'After defending the carbon tax, the party made an abrupt U-turn mid-campaign.'],
            ['L’essayiste prend le contre-pied du consensus en défendant une semaine scolaire plus étalée.', 'The essayist challenges consensus by arguing for a more spread-out school week.'],
          ],
        },
      ),
      tip(
        b('C1 grammar locks: no article & exact agreement', 'Points de grammaire C1 : zéro article et accord'),
        b(
          'Never insert *une* in **rester lettre morte**—write *ces lois sont restées lettre morte* (note *lettre morte* stays singular even with a plural subject!). Likewise, **faire volte-face** takes no article and no hyphen shift (*ils ont fait volte-face*). With **renvoyer dos à dos**, place both opposing parties as direct objects: *elle renvoie les deux camps dos à dos*.',
          'Ne mettez jamais d’article devant **lettre morte** : écrivez *ces promesses sont restées lettre morte* (toujours au singulier même avec un sujet pluriel !). De même, **faire volte-face** reste invariable. Enfin, **renvoyer dos à dos** se construit avec un objet pluriel : *il renvoie gouvernement et opposition dos à dos*.',
        ),
      ),
      mc(
        P.best,
        [
          'Vingt ans après leur adoption, plusieurs directives municipales sont malheureusement restées lettre morte.',
          'Vingt ans après leur adoption, plusieurs directives municipales sont restées une lettre morte.',
          'Vingt ans après leur adoption, plusieurs directives municipales ont resté lettres mortes.',
          'Vingt ans après leur adoption, plusieurs directives municipales sont tournées lettre morte.',
        ],
        {
          fr: 'Dans une synthèse DALF C1, quelle phrase respecte parfaitement la syntaxe de « rester lettre morte » ?',
          explain: b('Rester takes auxiliary être (sont restées) and lettre morte has no article and stays singular.', 'Rester se conjugue avec être (sont restées) et lettre morte s’emploie sans article et au singulier.'),
        },
      ),
      pairs(
        P.match,
        [
          ['tenir le haut du pavé', b('to dominate / hold the top spot', 'occuper la place dominante dans un domaine')],
          ['faire volte-face', b('to make an abrupt U-turn', 'changer brusquement de position')],
          ['rester lettre morte', b('to remain unenforced / ignored', 'n’avoir aucun effet concret')],
          ['renvoyer dos à dos', b('to dismiss two opposing sides equally', 'juger deux adversaires aussi fautifs l’un que l’autre')],
          ['prendre le contre-pied', b('to argue the exact opposite view', 'adopter la position inverse d’une idée reçue')],
        ],
      ),
      hear(
        'Dans son dernier essai, l’historienne prend le contre-pied des idées reçues : loin d’opposer syndicats et patronat, elle les renvoie dos à dos et montre pourquoi leurs pactes successifs sont restés lettre morte.',
        b('How does the historian structure her argument?', 'Comment l’historienne construit-elle sa thèse ?'),
        [
          b('She challenges common views, faults both unions and employers equally, and explains why agreements went unenforced.', 'Elle contredit les idées reçues, juge syndicats et patronat à égalité et explique l’inefficacité de leurs pactes.'),
          b('She reverses her own earlier position to praise every union agreement.', 'Elle change d’avis pour saluer l’application exemplaire de tous les accords.'),
          b('She defends the dominant employers’ federation while ignoring workers.', 'Elle soutient uniquement le patronat dominant sans évoquer les accords.'),
          b('She argues that recent laws were enforced immediately across every sector.', 'Elle affirme que les lois récentes ont été appliquées sans délai.'),
        ],
        { voice: 'f2' },
      ),
      dlg(
        b('Post-debate debrief in the newsroom', 'Débriefing après le débat en rédaction'),
        b('An anchor and a senior political columnist prepare their five-minute radio analysis.', 'Une présentatrice et un éditorialiste préparent leur chronique radio après un débat vif.'),
        [['Hélène', 'f'], ['Bastien', 'm']],
        [
          [0, 'Quel retournement à la vingtième minute ! Tu t’attendais à ce que le rapporteur défende soudain le péage urbain ?', 'What a twist twenty minutes in! Did you expect the rapporteur to suddenly defend the urban toll?'],
          [1, {
            options: [
              'Pas du tout : il a fait volte-face en direct alors qu’il tenait le haut du pavé chez les opposants la semaine dernière.',
              'Oui, il a botté la lettre morte dans la mare.',
              'Non, il a soufflé le poisson dans l’encre.',
            ],
            explain: b('Faire volte-face highlights his sudden U-turn after holding sway (tenir le haut du pavé) among opponents.', 'Faire volte-face souligne son revirement brutal alors qu’il dominait encore le camp adverse.'),
          }],
          [0, 'Et face à ses deux contradicteurs, comment as-tu trouvé la stratégie de l’économiste invitée ?', 'And facing her two opponents, how did you find the guest economist’s strategy?'],
          [1, {
            options: [
              'Très habile : elle les a renvoyés dos à dos sur les chiffres et a pris le contre-pied du débat en parlant de gouvernance.',
              'Elle a monté le pavé en touche sans répondre.',
              'Elle est restée dos à dos avec sa langue de bois.',
            ],
          }],
          [0, 'Exactement, et elle a rappelé que sans contrôle indépendant, la réforme précédente était restée lettre morte.', 'Exactly, and she reminded viewers that without independent oversight, the previous reform had remained a dead letter.'],
        ],
      ),
      dict('Elle a renvoyé les deux partis dos à dos avant de prendre le contre-pied du débat.', {
        voice: 'm2',
        hint: b('Notice renvoyé agrees before nothing here because COD (les deux partis) follows, or stays invariable before COD; hyphen in contre-pied.', 'Vérifiez l’accord (COD après le verbe → invariable) et le trait d’union de contre-pied.'),
      }),
      write(
        b('C1 press commentary on a public U-turn', 'Chronique C1 sur un revirement public'),
        b('Write 80–140 words as a French press columnist analysing a controversial municipal or national decision: mention an earlier promise that failed to take effect, an abrupt reversal or media storm, and a sharp conclusion using at least four expressions from this course.', 'Rédigez 80 à 140 mots dans le style d’un chroniqueur de presse analysant une décision publique controversée : évoquez une promesse restée sans suite, un revirement ou une polémique médiatique, puis concluez avec mordant en intégrant au moins quatre expressions du cours.'),
        80,
        140,
        [
          b('Authoritative C1 journalistic tone (no informal slang)', 'Ton éditorial soutenu de niveau C1 sans familiarité'),
          b('At least four idioms from this course used with exact syntax', 'Au moins quatre expressions du cours employées avec exactitude syntaxique'),
          b('Cohesive analytical flow from diagnosis to conclusion', 'Progression argumentative cohérente du constat à la conclusion'),
        ],
        'Depuis des mois, la charte municipale sur les transports gratuits tenait le haut du pavé dans les discours officiels, mais ses engagements concrets étaient restés lettre morte faute de budget voté. En décidant soudain d’instaurer un péage urbain dès l’automne, la majorité a fait volte-face et jeté un pavé dans la mare. L’annonce a aussitôt fait couler beaucoup d’encre : tandis que certains éditorialistes soufflent sur les braises en montant chaque détail en épingle, un rapport indépendant renvoie gouvernement et mairie dos à dos pour leur manque de transparence. Reste à savoir si le prochain exécutif osera prendre le contre-pied de ces esquives et renoncer enfin à la langue de bois.',
        {
          phrases: ['restés lettre morte', 'fait volte-face', 'jeté un pavé dans la mare', 'renvoie… dos à dos', 'prendre le contre-pied'],
        },
      ),
    ],
    [
      b('tenir le haut du pavé = hold sway; faire volte-face = make an abrupt U-turn.', 'tenir le haut du pavé = occuper le devant de la scène ; faire volte-face = changer brusquement de camp.'),
      b('rester lettre morte = remain unenforced (no article, singular lettre morte).', 'rester lettre morte = demeurer sans application (sans article, toujours au singulier).'),
      b('renvoyer dos à dos = fault both sides equally; prendre le contre-pied = argue the opposite stance.', 'renvoyer dos à dos = renvoyer deux camps à égalité ; prendre le contre-pied = défendre la thèse inverse.'),
    ],
    [
      ['tenir le haut du pavé', b('to hold sway / dominate the scene', 'occuper le premier rang')],
      ['faire volte-face', b('to do a complete U-turn', 'changer brusquement d’attitude ou d’opinion')],
      ['rester lettre morte', b('to remain a dead letter / unenforced', 'demeurer sans effet ni application')],
      ['renvoyer dos à dos', b('to dismiss both sides equally', 'mettre deux adversaires sur un pied d’égalité critique')],
      ['prendre le contre-pied', b('to take the exact opposite view', 'adopter la position inverse d’une opinion')],
    ],
  ),
];

export default lessons;
