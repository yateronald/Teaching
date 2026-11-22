import type { CourseAbout, Lesson } from '../../types';
import { P, b, card, dict, dlg, gap, hear, lesson, mc, ord, pairs, say, sort, trap } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Tighten long C1 sentences without losing clarity: master apposition (headless noun phrases), clean verb/article ellipsis in comparisons and parallels, and rhetorical highlighting.',
    'Alléger et densifier la phrase C1 sans perdre en clarté : apposition détachée, ellipses verbales ou d’article dans les parallèles et mises en relief stylistiques.',
  ),
  outcomes: [
    b('Use detached nominal and participial appositions accurately while avoiding dangling-modifier errors.', 'Employer l’apposition nominale ou participe détachée sans jamais commettre d’anacoluthe.'),
    b('Cut redundant verbs and determiners cleanly through grammatical ellipsis across parallel structures.', 'Supprimer verbes et articles redondants par l’ellipse maîtrisée dans les symétries.'),
    b('Focus arguments cleanly with clefts (C’est… qui, Ce dont… c’est…) and fronted appositions.', 'Mettre un élément en relief grâce aux présentatifs (C’est… qui, Ce qui…) et détachements soignés.'),
  ],
};

const lessons: Lesson[] = [
  lesson(
    'gr-ellipsis-apposition',
    1,
    ['apposition-and-dangling-modifiers', 'apposition-et-anacoluthe-c1'],
    b('Apposition & Avoiding Dangling Modifiers', 'L’apposition détachée et l’écueil de l’anacoluthe'),
    b('Condense relative clauses into crisp noun or participle appositions whose implied subject matches the main clause.', 'Remplacer des relatives pesantes par une apposition juste, reliée au sujet exact de la proposition.'),
    [
      b('Drop articles naturally in bare descriptive appositions (Professeur respecté, il…).', 'Supprimer l’article dans l’apposition descriptive (Auteur reconnu, elle…).'),
      b('Check subject identity strictly so initial adjectives/participles never float unattached (anacoluthe).', 'Vérifier l’identité stricte du sujet pour éviter toute rupture syntaxique en tête de phrase.'),
    ],
    13,
    [
      card(
        b('Compact background in one breath before the main verb', 'Condenser le contexte avant le verbe principal'),
        b(
          'An **apposition** turns a clumsy relative (*qui était autrefois un simple port de pêche…*) into an articleless noun phrase placed right before or after the noun it qualifies (**Ancien port de pêche, la ville attire désormais…**). Crucially, if the apposition stands at the very start of the sentence, its implied subject **must be the grammatical subject of the main clause** — otherwise you create a classic *anacoluthe* (dangling modifier)!\nNominal apposition: **Romancière engagée, Fruit d’un long travail, Chef-d’œuvre oublié**.\nParticipial / adjectival: **Convaincu de l’urgence, Épuisée par le voyage, Privé de soutiens**.\nClassic trap to avoid: **Parti tôt, le train était vide** (*the train* didn’t leave early alone — *nous* did!).',
          'L’**apposition** remplace une relative lourde (*qui était autrefois un village isolé*) par un groupe nominal **sans article** placé en tête ou juste après le nom (**Ancien village isolé, la station attire aujourd’hui…**). Règle impérative en début de phrase : le groupe détaché doit se rapporter exactement au **sujet grammatical** du verbe principal, sous peine d’**anacoluthe** !\nApposition nominale : **Historienne reconnue, Fruit d’une longue enquête, Cité maritime**.\nApposition adjective : **Conscient des risques, Affaiblie par la crise, Privée de ressources**.\nRupture à éviter : **En arrivant à la gare, le train partait déjà**.',
        ),
        {
          ex: [
            ['Pionnière de l’astronomie moderne, elle a publié ses travaux dès 1925.', 'A pioneer of modern astronomy, she published her work as early as 1925.'],
            ['Bâti sur un promontoire rocheux, le phare domine toute la baie.', 'Built on a rocky headland, the lighthouse overlooks the whole bay.'],
            ['Consciente de la difficulté, l’équipe a néanmoins accepté le défi.', 'Aware of the difficulty, the team nevertheless accepted the challenge.'],
          ],
        },
      ),
      trap(
        b('Always match the implied subject of the opening phrase', 'Toujours relier le début de phrase au sujet principal'),
        b(
          'Faulty: *Soucieux d’équité, une réforme a été lancée* (a reform cannot be *soucieux*!). Correct: *Soucieux d’équité, le ministère a lancé une réforme* — or *Animée par un souci d’équité, la direction…*.',
          'Fautif : *Soucieux d’équité, une loi fut votée* (une loi n’a pas de souci !). Correct : *Soucieux d’équité, le Parlement a voté une loi*.',
        ),
      ),
      mc(
        P.best,
        [
          b('Consciente de ces limites, la commission propose trois correctifs.', 'Consciente de ces limites, la commission propose trois correctifs.'),
          b('Conscients de ces limites, trois correctifs sont proposés.', 'Conscients de ces limites, trois correctifs sont proposés.'),
          b('Une commission consciente de ces limites, il propose trois correctifs.', 'Une commission consciente de ces limites, il propose trois correctifs.'),
        ],
        { explain: b('La commission (feminine singular) is both capable of awareness and the grammatical subject of propose.', 'La commission est le sujet grammatical réel capable d’être consciente.') },
      ),
      gap(
        b('Supply the agreeing opening apposition.', 'Accordez l’apposition d’ouverture avec le sujet exact.'),
        '___ (Convaincre, f.pl.) par l’argumentaire, les déléguées ont voté le texte ; ___ (Priver, m.sg.) de quorum, le conseil a reporté la décision.',
        ['Convaincues', 'Privé'],
        {
          hint: b('First main subject: les déléguées (f.pl.); second main subject: le conseil (m.sg.).', 'Premier sujet : les déléguées (f.pl.) ; second sujet : le conseil (m.sg.).'),
        },
      ),
      pairs(
        P.match,
        [
          ['Témoin privilégié des débats, il…', b('noun apposition without un/le', 'apposition nominale sans article')],
          ['Arrivés en avance, les invités…', b('matched plural participle subject', 'participe en tête accordé au sujet')],
          ['En ouvrant le dossier, la porte…', b('anacoluthe: mismatched subject', 'anacoluthe fautive : sujet discordant')],
          ['Ville portuaire, Marseille accueille…', b('noun apposition classifying a place', 'apposition caractérisant un lieu')],
        ],
      ),
      ord(
        P.order,
        'Ancienne capitale industrielle, cette cité réinvente aujourd’hui son économie.',
        {
          tr: 'A former industrial capital, this city is today reinventing its economy.',
          extra: ['une', 'qui'],
        },
      ),
    ],
    [
      b('Drop the article in qualifying nominal appositions placed before the noun (Auteur prolifique, …).', 'On supprime l’article dans l’apposition nominale qualificative placée devant le sujet.'),
      b('An opening apposition must always describe the grammatical subject of the main clause (avoid anacoluthe).', 'Le terme détaché en tête de phrase doit obligatoirement renvoyer au sujet principal.'),
    ],
    [
      ['anacoluthe (f.)', 'dangling modifier / syntactic break'],
      ['sans article', 'articleless (compact apposition)'],
      ['conscient(e) de', 'aware of'],
    ],
  ),

  lesson(
    'gr-ellipsis-apposition',
    2,
    ['verbal-and-determiner-ellipsis', 'ellipse-du-verbe-et-determinant-c1'],
    b('Syntactic Ellipsis in Parallels & Comparisons', 'Ellipse du verbe, du pronom et symétries C1'),
    b('Cut repetitive verbs and determiners cleanly across parallel contrasts without introducing grammatical errors.', 'Alléger les comparaisons et symétries en évitant les répétitions lourdes ou fautives.'),
    [
      b('Elide repeated conjugated verbs cleanly after comma or semicolon (Pierre choisit l’histoire ; Claire, la chimie).', 'Pratiquer l’ellipse élégante du verbe avec virgule dans les oppositions parallèles.'),
      b('Know when French allows vs. forbids dropping prepositions/determiners in coordinated complements.', 'Savoir quand on doit répéter à, de ou l’article avant un second nom.'),
    ],
    13,
    [
      card(
        b('Saying more by deleting redundant verbs cleanly', 'Dire davantage en supprimant le verbe répété'),
        b(
          'In crisp French prose, a comma marks the **ellipsis** of a repeated verb in contrasted pairs (**L’un privilégie la vitesse ; l’autre, la précision**). Similarly, avoid repeating heavy nouns in comparisons using **que celui de / que celle de** or dropping repeated *à*/*de* only when nouns form a single tight pair — keep distinct **determiners** when two separate people or objects are meant (**son frère et son collègue** vs. **son frère et collègue** = one person!).\nGapped verb ellipsis: **Paul lit les chiffres ; Léa, les graphiques**.\nSame person vs. two people: **mon ami et mentor** (1) vs. **mon ami et mon mentor** (2).\nComparative ellipsis: **plus coûteux qu’efficace, moins riche qu’annoncé**.',
          'Dans une phrase symétrique, une simple virgule signale l’**ellipse** du verbe déjà exprimé (**L’un vise le court terme ; l’autre, la durée**). Attention aux déterminants coordonnés : les supprimer fusionne deux rôles en **une seule entité** (**mon ami et conseiller** = 1 personne, contre **mon ami et mon conseiller** = 2). En comparaison, l’ellipse après **que** resserre la formule (**plus ambitieux que réaliste**).\nEllipse verbale : **Les uns applaudissent ; les autres, sceptiques, se taisent**.\nUn ou deux référents : **notre directrice et fondatrice** (1) / **notre directrice et notre fondatrice** (2).\nEllipse comparative : **mieux conçu qu’exécuté, plus long que prévu**.',
        ),
        {
          ex: [
            ['La presse locale salue le compromis ; la presse nationale, la prudence du calendrier.', 'The local press praises the compromise; the national press, the caution of the schedule.'],
            ['Cette démarche paraît plus généreuse qu’efficace à long terme.', 'This approach appears more generous than effective in the long run.'],
            ['Nous avons reçu le maire et conseiller départemental.', 'We welcomed the mayor and departmental councillor (one person).'],
          ],
        },
      ),
      hear(
        'Le premier rapport mise sur la sobriété ; le second, sur l’innovation technique.',
        P.listen,
        [
          b('Both clauses share the verb mise (omitted via comma in the second clause).', 'Le verbe mise est sous-entendu après le second par ellipse.'),
          b('The second report does not mention technique.', 'Le second rapport rejette l’innovation technique.'),
          b('The second clause is grammatically incomplete and broken.', 'La seconde proposition comporte un oubli involontaire.'),
        ],
      ),
      mc(
        P.best,
        [
          b('J’ai remercié ma tutrice et ma professeure — elles étaient deux à relire ma thèse.', 'J’ai remercié ma tutrice et ma professeure — elles étaient deux à relire ma thèse.'),
          b('J’ai remercié ma tutrice et professeure — elles étaient deux à relire ma thèse.', 'J’ai remercié ma tutrice et professeure — elles étaient deux à relire ma thèse.'),
          b('Les uns préfèrent Paris ; les autres préfèrent Lyon préfèrent aussi.', 'Les uns préfèrent Paris ; les autres préfèrent Lyon préfèrent aussi.'),
        ],
        { explain: b('Repeating ma signals two distinct people (elles étaient deux); omitting ma fuses both titles into one person.', 'Répéter le déterminant ma indique deux personnes distinctes ; l’omettre désignerait une seule personne cumulant deux fonctions.') },
      ),
      gap(
        b('Tighten each comparison using clean comparative ellipsis.', 'Allégez chaque comparaison par une ellipse juste.'),
        'Ce dispositif est moins complexe ___ redouté ; certains applaudissent la forme ; d’autres, ___ le fond.',
        ['qu’on ne l’avait', ['le fond', 'pas']],
        {
          choices: [['qu’on ne l’avait', 'plus', 'comme'], ['le fond', 'applaudissent le fond', 'pas']],
          explain: b('Note the crisp rhythm: L’un critique la forme ; d’autres, le fond.', 'La virgule après d’autres remplace élégamment le verbe déjà posé.'),
        },
      ),
      sort(
        P.sort,
        [b('One entity (article dropped)', 'Une seule personne/réalité'), b('Two separate entities (article repeated)', 'Deux personnes/réalités distinctes')],
        [
          ['Son collègue et ami depuis vingt ans', 0],
          ['Son collègue et son ami d’enfance', 1],
          ['Une mesure urgente et nécessaire', 0],
          ['Le président et le rapporteur du jury', 1],
        ],
      ),
      dict('La théorie promet beaucoup ; la pratique, beaucoup moins.'),
    ],
    [
      b('A comma can elide a repeated verb cleanly in parallel balanced clauses.', 'Une virgule remplace avec élégance le verbe déjà énoncé dans une symétrie.'),
      b('Keep or omit the second determiner intentionally: repeating it counts two separate individuals/things.', 'Répéter ou omettre le second déterminant change le nombre de référents désignés.'),
    ],
    [
      ['l’ellipse verbale', 'verbal ellipsis (gapping)'],
      ['son ami et collègue', 'his/her friend and colleague (1 person)'],
      ['son ami et son collègue', 'his/her friend and colleague (2 people)'],
    ],
  ),

  lesson(
    'gr-ellipsis-apposition',
    3,
    ['cleft-emphasis-and-compact-syntax', 'mise-en-relief-et-phrase-compacte-c1'],
    b('Clefts, Nominalisation & C1 Concision', 'Mise en relief, nominalisation et concision C1'),
    b('Synthesise C1 focus patterns: contrast C’est… que, Ce dont… c’est…, and verbless headlines/summaries.', 'Maîtriser la mise en relief soutenue et la concision nominale des synthèses C1.'),
    [
      b('Focus on prepositional complements cleanly with C’est de… dont / que vs. Ce à quoi… c’est à… (avoid dont after c’est de!).', 'Éviter le solécisme C’est de cela dont… grâce à la syntaxe correcte C’est de cela que….'),
      b('Condense heavy subordination into tight nominal headlines and concise executive bullets.', 'Condenser les subordonnées en groupes nominaux denses pour les titres et synthèses C1.'),
    ],
    13,
    [
      card(
        b('C’est de cela QUE (never dont!) + crisp focalisation', 'C’est de cela QUE (jamais dont !) et focalisation'),
        b(
          'One classic C1 trap in cleft emphasis: once a preposition already stands inside **C’est…**, you **must follow with que**, never repeat the preposition in *dont*! Write **C’est de rigueur qu’il s’agit** (NOT *C’est de rigueur dont il s’agit*). Likewise, **Ce dont il s’agit, c’est de rigueur**.\nPreposition already present: **C’est de cela que je parle, C’est à lui que je pense**.\nPreposition delayed to second half: **Ce dont je parle, c’est de cela ; Ce à quoi j’aspire, c’est à la paix**.\nVerbless concise headlines: **Fermeture annoncée, Maintien du cap, Retour sur une polémique**.',
          'Erreur classique même chez les natifs : si la préposition figure déjà dans **C’est…**, la suite emploie **que**, jamais *dont* ! On écrit **C’est de méthode dont** ❌ → **C’est de méthode qu’il s’agit** ✅ (ou bien **Ce dont il s’agit, c’est de méthode**). De même pour les intitulés de synthèse : préférez des **phrases nominales sans verbe**.\nPréposition en tête : **C’est d’eux que je parle, C’est pour cela que nous agissons**.\nReprise par ce dont / ce à quoi : **Ce dont nous manquons, c’est de temps ; Ce à quoi il tient, c’est à son autonomie**.\nStyle nominal condensé : **Baisse durable des rejets, Refus d’un compromis hâtif**.',
        ),
        {
          ex: [
            ['C’est précisément de ce biais méthodologique qu’il convient de se méfier.', 'It is precisely this methodological bias that one ought to guard against.'],
            ['Ce dont le secteur manque avant tout, c’est de visibilité pluriannuelle.', 'What the sector lacks above all is multi-year visibility.'],
            ['Suspension immédiate de la mesure faute de garanties suffisantes.', 'Immediate suspension of the measure for lack of sufficient guarantees.'],
          ],
        },
      ),
      trap(
        b('Double-preposition error: C’est de ça dont ❌', 'Le pléonasme C’est de ça dont ❌'),
        b(
          'Say **either** *C’est de ça que…* (preposition once, at the front) **or** *Ce dont…, c’est…* (relative *dont* carries *de*, or repeat *de* cleanly before the highlighted noun). Never stack *de* AND *dont* in one cleft!',
          'Choisissez **soit** *C’est de cela que…* (une seule marque *de*), **soit** *Ce dont il s’agit, c’est…* — sans jamais empiler *de* et *dont* ensemble dans le premier membre.',
        ),
      ),
      mc(
        P.best,
        [
          b('C’est d’une refonte globale que ce service a besoin.', 'C’est d’une refonte globale que ce service a besoin.'),
          b('C’est d’une refonte globale dont ce service a besoin.', 'C’est d’une refonte globale dont ce service a besoin.'),
          b('Ce dont ce service a besoin, c’est que d’une refonte globale.', 'Ce dont ce service a besoin, c’est que d’une refonte globale.'),
        ],
        { explain: b('With de already in C’est d’une refonte, use que (not dont).', 'Puisque de est déjà présent après C’est, on enchaîne obligatoirement avec que.') },
      ),
      gap(
        b('Correct the cleft structure.', 'Complétez avec la bonne particule de mise en relief.'),
        'C’est ___ cette clause ___ les juristes s’opposent ; en somme, ce ___ ils tiennent, c’est ___ clarté des critères.',
        ['à', 'que', 'à quoi', 'à la'],
        {
          choices: [['à', 'contre', 'pour'], ['que', 'à laquelle', 'dont'], ['à quoi', 'dont', 'où'], ['à la', 'la', 'de la']],
          explain: b('On s’oppose à → C’est à cette clause que… ; on tient à → ce à quoi ils tiennent, c’est à la…', 'S’opposer à donne C’est à cette clause que… ; tenir à donne ce à quoi ils tiennent, c’est à la….'),
        },
      ),
      dlg(
        b('Preparing concise section headings', 'Rédiger les intertitres d’une note C1'),
        b('Two colleagues turn long full-sentence headings into crisp nominal C1 subheadings.', 'Deux collègues transforment des titres lourds en intertitres nominaux concis.'),
        [['Yasmine', 'f'], ['Éric', 'm2']],
        [
          [0, 'Mon premier titre dit « Comment les villes adaptent les transports quand il fait chaud ». C’est trop long.', 'My first heading says “How cities adapt transport when it is hot”. It is too long.'],
          [1, {
            options: [
              'Nominalise sans verbe : « L’adaptation des transports urbains aux épisodes de chaleur ».',
              'Mets simplement « C’est de la chaleur dont les transports souffrent ».',
              'Garde le verbe conjugué et ajoute trois adverbes.',
            ],
            explain: b('Verbless nominalisation compresses a 12-word clause into an authoritative 8-word section header.', 'La nominalisation sans verbe condense efficacement un titre analytique.'),
          }],
          [0, 'Et si je veux insister dans le texte sur l’absence de coordination ?', 'And if I want to emphasise the lack of coordination in the body text?'],
          [1, {
            options: [
              'Écris : « C’est précisément d’un défaut de coordination que souffre le réseau. »',
              'Écris : « C’est précisément d’un défaut de coordination dont souffre le réseau. »',
              'Écris : « Souffrant du réseau, la coordination manque. »',
            ],
            explain: b('C’est d’un défaut… que avoids the dont pleonasm and cleanly highlights the root cause.', 'C’est de… que met en relief la cause sans pléonasme.'),
          }],
        ],
      ),
      ord(
        P.order,
        'Ce dont cette filière manque cruellement, c’est de visibilité réglementaire.',
        {
          tr: 'What this sector sorely lacks is regulatory visibility.',
          extra: ['que', 'laquelle'],
        },
      ),
      say('C’est de méthode, plus encore que de moyens, que dépend la réussite.', 'Success depends on method even more than on resources.'),
    ],
    [
      b('In C’est [prep + noun] que…, always use que — never dont.', 'Dans C’est + préposition + nom + que…, n’employez jamais dont après la préposition.'),
      b('Turn clunky verb clauses into nominal headers and paired summaries for executive C1 clarity.', 'Transformez les titres verbaux en formules nominales sans verbe pour gagner en densité.'),
    ],
    [
      ['c’est de cela que', 'that is what (after prep., never dont)'],
      ['ce à quoi il tient', 'what he/she insists upon'],
      ['une phrase nominale', 'a verbless nominal sentence'],
    ],
  ),
];

export default lessons;
