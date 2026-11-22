import type { CourseAbout, Lesson } from '../../types';
import { P, b, card, dict, dlg, gap, hear, lesson, mc, ord, pairs, say, sort, tip, trap, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Resolve C1 agreement puzzles cleanly: collective nouns with de, fractions and percentages, gens, tout adverb vs. adjective, and compound subjects joined by ou, ni, or comme.',
    'Résoudre avec sûreté les accords délicats du niveau C1 : collectifs suivis de de, fractions et pourcentages, gens, tout adverbe ou adjectif, et sujets coordonnés par ou, ni ou comme.',
  ),
  outcomes: [
    b('Choose singular or plural verb agreement with collectives (la plupart, une foule, nombre de) based on focus and meaning.', 'Accorder le verbe avec les collectifs (la plupart, une foule, nombre de) selon l’intention et le sens.'),
    b('Control adjective agreement before and after gens, and invariability vs. agreement of tout, chaque, nul, and aucun.', 'Maîtriser l’accord autour de gens ainsi que les règles de tout, chaque, nul et aucun.'),
    b('Apply accurate verb agreement with coordinated subjects (l’un ou l’autre, ni… ni, ainsi que) in formal C1 writing.', 'Accorder justement le verbe avec les sujets coordonnés (l’un ou l’autre, ni… ni, ainsi que) à l’écrit C1.'),
  ],
};

const lessons: Lesson[] = [
  lesson(
    'gr-double-agreement-traps',
    1,
    ['collective-nouns-and-fractions', 'noms-collectifs-et-fractions'],
    b('Collective Nouns, Fractions & Percentages', 'Noms collectifs, fractions et pourcentages'),
    b('Decide whether the verb agrees with the collective wrapper or the plural complement after de.', 'Choisir si le verbe s’accorde avec le nom collectif ou avec son complément pluriel.'),
    [
      b('Agree always in the plural with la plupart, nombre de, quantité de, et beaucoup de.', 'Toujours accorder au pluriel avec la plupart, nombre de, quantité de et beaucoup de.'),
      b('Distinguish meaning-driven singular vs. plural agreement with la majorité, une foule, une dizaine.', 'Distinguer l’accord au singulier ou au pluriel selon le sens avec la majorité, une foule, une dizaine.'),
    ],
    13,
    [
      card(
        b('Collective noun + de + plural: who controls the verb?', 'Nom collectif + de + pluriel : qui commande le verbe ?'),
        b(
          'With **la plupart des**, **bon nombre de**, **nombre de**, and **quantité de** (without article), plural agreement with the noun after **de** is mandatory. With **la majorité de**, **une foule de**, **une minorité de**, or percentages, look at whether the sentence emphasises the group as a single block (singular) or the individuals acting inside it (plural).\nAlways plural: **la plupart, nombre de, quantité de, bon nombre de**.\nMeaning-driven choice: **la majorité de, une foule de, un ensemble de, 30 % des**.',
          'Après **la plupart des**, **bon nombre de**, **nombre de** et **quantité de** (sans article), l’accord au pluriel avec le complément s’impose. Après **la majorité de**, **une foule de**, **une minorité de** ou un pourcentage, on regarde si la phrase insiste sur l’ensemble (singulier) ou sur les individus (pluriel).\nToujours au pluriel : **la plupart, nombre de, quantité de, bon nombre de**.\nSelon l’intention : **la majorité de, une foule de, un ensemble de, 30 % des**.',
        ),
        {
          table: {
            head: [b('Subject pattern', 'Sujet'), b('Verb number', 'Nombre du verbe'), b('Logic', 'Logique')],
            rows: [
              ['La plupart des députés…', b('plural', 'pluriel'), b('majority of individuals', 'pluralité explicite')],
              ['Nombre d’experts…', b('plural', 'pluriel'), b('indefinite determiner', 'locution déterminative')],
              ['La majorité des électeurs…', b('singular or plural', 'singulier ou pluriel'), b('bloc vote vs. individual voters', 'bloc global ou individus')],
              ['La moitié du budget…', b('singular', 'singulier'), b('singular complement after de', 'complément singulier')],
            ],
          },
          ex: [
            ['La plupart des candidats ont réussi l’épreuve orale.', 'Most of the candidates passed the oral exam.'],
            ['La foule des manifestants avançait calmement vers la place.', 'The crowd of protesters moved calmly toward the square.'],
            ['La majorité des chercheurs souhaitent davantage de transparence.', 'Most researchers want greater transparency.'],
            ['Plus des deux tiers du rapport restent encore à relire.', 'More than two thirds of the report still remain to be proofread.'],
          ],
        },
      ),
      trap(
        b('La plupart alone still requires the plural', 'La plupart employé seul exige le pluriel'),
        b(
          'When **la plupart** appears without **de + noun**, French retains the implied plural of people: **La plupart sont partis**. Only if it clearly refers back to an explicit singular mass noun in the immediate context (**Quant au beurre, la plupart a fondu**) does it stay singular.',
          'Employé seul, **la plupart** renvoie implicitement à des personnes au pluriel : **La plupart sont partis**. Il ne reste au singulier que s’il reprend explicitement un nom massif singulier immédiat.',
        ),
        {
          ex: [
            ['On attendait vingt personnes ; la plupart sont déjà arrivées.', 'We expected twenty people; most have already arrived.'],
          ],
        },
      ),
      mc(
        P.choose,
        [b('La plupart des dossiers ont été traités avant midi.', 'La plupart des dossiers ont été traités avant midi.'), b('La plupart des dossiers a été traitée avant midi.', 'La plupart des dossiers a été traitée avant midi.'), b('La plupart des dossiers ont été traité avant midi.', 'La plupart des dossiers ont été traité avant midi.')],
        { explain: b('La plupart des + plural noun always triggers plural verb and plural masculine participle agreement.', 'La plupart des + nom masculin pluriel impose l’auxiliaire pluriel et l’accord masculin pluriel.') },
      ),
      gap(
        b('Conjugate in the present or passé composé as indicated.', 'Accordez au présent ou au passé composé selon l’indice.'),
        'Nombre de témoins ___ (confirmer, présent) cette version, mais la moitié de l’assemblée ___ (rester, présent) sceptique.',
        ['confirment', ['reste', 'restent']],
        {
          hint: b('Nombre de → always plural; la moitié de l’assemblée (singular noun) → singular.', 'Nombre de → toujours pluriel ; la moitié de l’assemblée (singulier) → singulier.'),
          explain: b('Notice how nombre de triggers plural while la moitié de + singular noun governs singular.', 'Nombre de entraîne le pluriel, alors que la moitié de + nom singulier commande le singulier.'),
        },
      ),
      hear(
        'Vingt pour cent de la population vit dans une zone littorale.',
        P.listen,
        [
          b('The verb agrees with la population (singular).', 'Le verbe s’accorde avec la population (singulier).'),
          b('The verb must be plural because vingt is greater than one.', 'Le verbe doit être au pluriel car vingt dépasse un.'),
          b('Pour cent is feminine plural here.', 'Pour cent est féminin pluriel ici.'),
        ],
        { explain: b('With a percentage + singular noun (la population), singular verb agreement (vit) is natural.', 'Avec un pourcentage suivi d’un singulier (la population), le singulier vit est attendu.') },
      ),
      sort(
        P.sort,
        [b('Plural required', 'Pluriel obligatoire'), b('Singular focus possible / natural', 'Singulier possible / naturel')],
        [
          ['Bon nombre de citoyens', 0],
          ['Une majorité écrasante', 1],
          ['La plupart d’entre nous', 0],
          ['Le tiers du public', 1],
          ['Quantité d’erreurs', 0],
          ['Un ensemble de facteurs cohérent', 1],
        ],
        { explain: b('Quantité de (without article) = beaucoup de (plural), whereas la quantité de (with le/la/un) focuses on the singular noun.', 'Quantité de sans article équivaut à beaucoup de (pluriel), alors qu’un collectif déterminé comme le tiers ou une majorité permet le singulier.') },
      ),
      ord(
        P.order,
        'La totalité des fonds recueillis servira à financer la recherche.',
        {
          tr: 'All of the collected funds will serve to finance research.',
          extra: ['serviront'],
          explain: b('La totalité focuses on the unified sum → singular servira.', 'La totalité insiste sur la somme globale, d’où le singulier servira.'),
        },
      ),
      dict('Trente pour cent des élèves ont choisi cette option.', {
        hint: b('Watch plural agreement on ont choisi after des élèves.', 'Attention à l’accord au pluriel après des élèves.'),
      }),
    ],
    [
      b('La plupart, nombre de, bon nombre de, and articleless quantité de always trigger plural agreement.', 'La plupart, nombre de, bon nombre de et quantité de (sans article) imposent le pluriel.'),
      b('With fractions and percentages, follow the grammatical number of the complement and whether unity or multiplicity is highlighted.', 'Avec les fractions et pourcentages, on suit le nombre du complément et la mise en relief de l’ensemble ou des membres.'),
    ],
    [
      ['la plupart', 'most (almost always plural)'],
      ['nombre de', 'a great many'],
      ['quantité de', 'scores of, plenty of'],
      ['la totalité de', 'the entirety of'],
    ],
  ),

  lesson(
    'gr-double-agreement-traps',
    2,
    ['gens-tout-and-distributives', 'gens-tout-et-distributifs'],
    b('Gens, Tout (Adjective vs. Adverb) & Distributives', 'Gens, tout (adjectif ou adverbe) et distributifs'),
    b('Control the famous before/after rule for gens and the phonetic exception of adverbial tout.', 'Maîtriser l’accord avant/après gens et la règle phonétique de tout adverbe.'),
    [
      b('Place feminine plural adjectives immediately before gens, unless an invariable or epicene adjective precedes.', 'Accorder au féminin pluriel l’épithète placée devant gens, sauf si un adjectif épicène l’en sépare.'),
      b('Distinguish pronominal/adjectival tout from adverbial tout before consonant/aspirate-h feminine adjectives.', 'Distinguer tout déterminant/pronom de tout adverbe devant consonne ou h aspiré féminin.'),
    ],
    13,
    [
      card(
        b('Two historic traps: gens and tout', 'Deux classiques du français soutenu : gens et tout'),
        b(
          '1) **Gens** is masculine plural after itself (**des gens sérieux, ils sont partis**), but an adjective standing **immediately before** gens (or separated only by another variable adjective) takes the **feminine plural** (**de bonnes vieilles gens**). If an epicene adjective ending in *-e* (like **honnêtes**, **jeunes**, **braves**) stands between the determiner and gens, everything stays masculine plural!\n2) Adverbial **tout** (= completely) is invariable **except** before a feminine adjective starting with a **consonant or aspirate h** (**elle était toute surprise**, **toutes honteuses**, vs. **tout heureuse**).\nBefore gens: **de vieilles gens, toutes ces bonnes gens, d’honnêtes gens**.\nAdverbial tout: **tout étonnée, toute contente, toutes honteuses**.',
          '1) **Gens** est masculin pluriel pour tout ce qui le suit (**des gens curieux**), mais l’adjectif à forme féminine distincte placé **juste devant** gens prend le **féminin pluriel** (**de vieilles gens**). Si l’adjectif immédiatement devant gens est épicène (terminé par un *-e* muet au masculin : **braves, jeunes, honnêtes**), l’ensemble reste au masculin.\n2) **Tout** adverbe (« tout à fait ») reste invariable sauf devant un adjectif féminin commençant par une **consonne ou un h aspiré** (**toute pâle**, **toutes honteuses**, contre **tout heureuse**).\nDevant gens : **de vieilles gens, toutes ces bonnes gens, d’honnêtes gens**.\nTout adverbe : **tout étonnée, toute contente, toutes honteuses**.',
        ),
        {
          table: {
            head: [b('Expression', 'Expression'), b('Reason', 'Raison')],
            rows: [
              ['De bonnes gens attentifs', b('fem. before gens, masc. after', 'féminin avant gens, masculin après')],
              ['Tous ces braves gens', b('braves ends in -e at masc., so tous stays masc.', 'braves est épicène : tous reste masculin')],
              ['Elle est tout émue.', b('vowel after adverb tout → invariable', 'voyelle après tout adverbe → invariable')],
              ['Elles sont toutes honteuses.', b('aspirate h + fem. → tout agrees', 'h aspiré féminin → accord euphonique')],
            ],
          },
          ex: [
            ['Ce sont de braves gens très accueillants.', 'They are good-hearted, very welcoming people.'],
            ['Toutes ces bonnes vieilles gens se souviennent de ce quartier.', 'All those kind old folk remember this neighbourhood.'],
            ['La lauréate semblait tout émue et toute fière de son équipe.', 'The winner seemed completely moved and thoroughly proud of her team.'],
          ],
        },
      ),
      tip(
        b('Chaque, nul, aucun, and maint', 'Chaque, nul, aucun et maint'),
        b(
          '**Chaque**, **nul**, and **aucun** (except with nouns lacking a singular like *frais*, *archives*, *funérailles*) always govern the **singular**. Double **maint et maint / mainte et mainte** remains singular in standard literary style (**à maintes reprises** is the plural set phrase).',
          '**Chaque**, **nul** et **aucun** (sauf devant les noms toujours pluriels comme *frais* ou *archives*) commandent toujours le **singulier**. Notez la locution figée **à maintes reprises**.',
        ),
      ),
      mc(
        P.choose,
        [b('Toutes ces bonnes gens étaient convaincus du contraire.', 'Toutes ces bonnes gens étaient convaincus du contraire.'), b('Tous ces bonnes gens étaient convaincues du contraire.', 'Tous ces bonnes gens étaient convaincues du contraire.'), b('Toutes ces braves gens étaient convaincues du contraire.', 'Toutes ces braves gens étaient convaincues du contraire.')],
        { explain: b('Bonnes has a distinct feminine form right before gens → Toutes ces bonnes… then masculine after gens → convaincus.', 'Bonnes précède gens avec une marque féminine distincte (d’où toutes), puis l’attribut qui suit revient au masculin (convaincus).') },
      ),
      gap(
        b('Complete with tout, toute, tous, or toutes.', 'Complétez avec tout, toute, tous ou toutes.'),
        'Ses réponses étaient ___ intelligentes mais ___ différentes de ce que j’imaginais ; ___ les observatrices étaient ___ surprises.',
        ['tout', 'toutes', 'toutes', 'toutes'],
        {
          choices: [['tout', 'toutes'], ['toutes', 'tout'], ['toutes', 'tous'], ['toutes', 'tout']],
          explain: b('tout intelligentes (vowel), toutes différentes (consonant), toutes les observatrices (determiner), toutes surprises (consonant s + feminine plural).', 'tout intelligentes (voyelle), toutes différentes (consonne), toutes les observatrices (déterminant), toutes surprises (consonne s au féminin pluriel).'),
        },
      ),
      pairs(
        P.match,
        [
          ['d’honnêtes gens prévenus', b('honnêtes is epicene → d’honnêtes / prévenus (m.pl.)', 'adjectif épicène → masculin pluriel partout')],
          ['de vraies bonnes gens', b('distinct feminine form right before gens', 'adjectifs à forme féminine distincte avant gens')],
          ['tout heureuse', b('adverbial tout before vowel → invariable', 'tout adverbe devant voyelle : invariable')],
          ['toutes surprises', b('adverbial tout before consonant + fem.', 'tout adverbe devant consonne féminine')],
        ],
      ),
      mc(
        P.best,
        [
          b('Ces jeunes chercheuses sont tout enthousiastes et toutes ravies.', 'Ces jeunes chercheuses sont tout enthousiastes et toutes ravies.'),
          b('Ces jeunes chercheuses sont toutes enthousiastes et tout ravies.', 'Ces jeunes chercheuses sont toutes enthousiastes et tout ravies.'),
          b('Ces jeunes chercheuses sont toutes enthousiastes et toutes ravies.', 'Ces jeunes chercheuses sont toutes enthousiastes et toutes ravies.'),
        ],
        { explain: b('Enthousiastes starts with a vowel (tout), whereas ravies starts with the consonant r (toutes).', 'Enthousiastes commence par une voyelle (tout invariable) ; ravies commence par une consonne au féminin pluriel (toutes).') },
      ),
      ord(
        P.order,
        'Nul candidat ne saura éviter toutes ces questions sans préparation.',
        {
          tr: 'No candidate will manage to avoid all these questions without preparation.',
          extra: ['sauront', 'touts'],
          explain: b('Nul takes a singular verb (saura), while toutes agrees before plural questions.', 'Nul commande le singulier (saura), et toutes précède un féminin pluriel.'),
        },
      ),
      say('Elle est sortie de l’entretien tout heureuse mais toute pâle.', 'She came out of the interview completely happy yet utterly pale.'),
    ],
    [
      b('Adjectives before gens take feminine plural only if the adjective immediately before gens has a distinct feminine form.', 'Devant gens, le féminin pluriel ne s’applique que si l’adjectif immédiatement voisin distingue masculin et féminin.'),
      b('Adverbial tout agrees solely for sound before feminine words starting with a consonant or aspirate h.', 'Tout adverbe ne varie qu’à l’oral/écrit par euphonie devant une consonne ou un h aspiré féminin.'),
    ],
    [
      ['de braves gens', 'good-natured people (m.pl. epicene)'],
      ['de vieilles gens', 'old folk (f.pl. before gens)'],
      ['tout heureuse', 'thoroughly happy (vowel → invariable)'],
      ['à maintes reprises', 'on numerous occasions'],
    ],
  ),

  lesson(
    'gr-double-agreement-traps',
    3,
    ['coordinated-subjects-ou-ni-comme', 'sujets-coordones-ou-ni-ainsi-que'],
    b('Coordinated Subjects: ou, ni, ainsi que, comme', 'Sujets coordonnés : ou, ni, ainsi que, comme'),
    b('Choose singular or plural verbs accurately when two subjects are joined by ou, ni, comme, or ainsi que.', 'Choisir le nombre du verbe lorsque deux sujets sont reliés par ou, ni, comme ou ainsi que.'),
    [
      b('Separate exclusive ou/ni (singular) from cumulative ou/ni (plural).', 'Distinguer l’exclusion (singulier) de l’addition possible avec ou et ni (pluriel).'),
      b('Notice when commas turn ainsi que / comme into a parenthetical comparison (verb agrees with first subject only).', 'Repérer la valeur comparative ou parenthétique de ainsi que / comme entre virgules (accord avec le premier sujet).'),
    ],
    13,
    [
      card(
        b('Exclusion vs. accumulation in C1 syntax', 'Exclusion ou cumul en syntaxe C1'),
        b(
          'With **ou** and **ni… ni…**, ask whether **both subjects can act or apply together** (plural) or **mutually exclude each other** (singular). With **comme**, **ainsi que**, and **avec**, punctuation tells the grammar: without commas and meaning “and”, the verb is plural; between commas as a parenthetical comparison, the verb agrees strictly with the first subject.\nMutually exclusive (singular): **l’un ou l’autre gagne, le frère ou la sœur héritera**.\nCumulative/both (plural): **ni le gel ni le vent n’ont ralenti, la peur ou la fatigue expliquent**.',
          'Avec **ou** et **ni… ni…**, demandez-vous si les deux sujets peuvent **s’additionner** (pluriel) ou **s’excluent l’un l’autre** (singulier). Avec **comme**, **ainsi que** et **avec**, la ponctuation éclaire l’analyse : entre virgules (incise comparative), seul le premier sujet régit le verbe.\nExclusion (singulier) : **l’un ou l’autre gagnera, la présidente ou son adjoint signera**.\nCumul possible (pluriel) : **ni le froid ni la pluie ne l’ont arrêté, la colère ou l’impatience mènent**.',
        ),
        {
          ex: [
            ['Ni Marie ni Paul n’ont pu rejoindre la visioconférence à temps.', 'Neither Marie nor Paul could join the video call on time.'],
            ['L’un ou l’autre candidat remportera la bourse ce soir.', 'Either one candidate or the other will win the grant tonight.'],
            ['La ministre, ainsi que ses conseillers, s’est exprimée brièvement.', 'The minister, along with her advisors, spoke briefly.'],
          ],
        },
      ),
      trap(
        b('Watch l’un et l’autre vs. ni l’un ni l’autre', 'Attention à l’un et l’autre contre ni l’un ni l’autre'),
        b(
          '**L’un et l’autre** allows plural (**se sont tus**, most common today) or literary singular. **Ni l’un ni l’autre** favours plural when neither performs the action jointly, and singular when only one could logically hold the role (**Ni l’un ni l’autre n’est mon père**).',
          '**L’un et l’autre** admet surtout le pluriel (**ont accepté**). Avec **ni l’un ni l’autre**, on préfère le pluriel si les deux auraient pu agir ensemble, et le singulier s’il y a exclusion logique.',
        ),
      ),
      mc(
        P.best,
        [
          b('L’ambassadeur, tout comme sa délégation, a salué l’accord.', 'L’ambassadeur, tout comme sa délégation, a salué l’accord.'),
          b('L’ambassadeur, tout comme sa délégation, ont salué l’accord.', 'L’ambassadeur, tout comme sa délégation, ont salué l’accord.'),
          b('L’ambassadeur tout comme sa délégation a salués l’accord.', 'L’ambassadeur tout comme sa délégation a salués l’accord.'),
        ],
        { explain: b('Placed between commas, tout comme sa délégation is an aside; the verb agrees solely with singular L’ambassadeur.', 'Placé entre virgules, tout comme sa délégation forme une incise comparative : le verbe s’accorde avec L’ambassadeur.') },
      ),
      gap(
        b('Conjugate in the present or passé composé as required.', 'Conjuguez au temps indiqué en respectant le bon accord.'),
        'Seul un arbitre ou son suppléant ___ (pouvoir, présent) annuler le match ; en revanche, la fatigue et le bruit ___ (peser, passé composé) sur tout le monde.',
        ['peut', ['ont pesé']],
        {
          explain: b('Only one person can hold the deciding vote → peut. Fatigue and noise accumulate → ont pesé.', 'Une seule personne exerce la décision (exclusion → peut), alors que fatigue et bruit s’additionnent (ont pesé).'),
        },
      ),
      hear(
        'Le maire ainsi que son équipe ont présenté le plan climat ce matin.',
        P.listen,
        [
          b('No commas around ainsi que: both act together (plural verb).', 'Absence de virgules : addition de sujets (verbe au pluriel).'),
          b('The verb is wrong because le maire is singular.', 'Le verbe est fautif car le maire est singulier.'),
          b('Ainsi que requires the subjunctive.', 'Ainsi que exige le subjonctif.'),
        ],
      ),
      sort(
        P.sort,
        [b('Singular agreement expected', 'Accord au singulier attendu'), b('Plural agreement expected / preferred', 'Accord au pluriel attendu / préféré')],
        [
          ['Ni l’un ni l’autre n’est le directeur de ce service.', 0],
          ['Ni la pluie ni le grésil n’ont découragé les bénévoles.', 1],
          ['La directrice, comme ses deux adjoints, arrive demain.', 0],
          ['La clarté ou la rigueur caractérisent souvent ses articles.', 1],
        ],
      ),
      dict('La présidente, comme ses collègues, est restée optimiste.', {
        hint: b('Notice commas around comme ses collègues → feminine singular est restée.', 'Repérez l’incise entre virgules qui impose le féminin singulier est restée.'),
      }),
    ],
    [
      b('Exclusion with ou/ni takes singular; shared or joint action takes plural.', 'L’exclusion logique impose le singulier ; le cumul appelle le pluriel.'),
      b('When comme / ainsi que is framed by commas, it becomes a parenthetical aside and no longer makes the subject plural.', 'Encadré par des virgules, comme ou ainsi que devient une incise qui laisse le verbe s’accorder avec le premier sujet.'),
    ],
    [
      ['tout comme (entre virgules)', 'just like (aside → agrees with 1st subject)'],
      ['ni l’un ni l’autre', 'neither one nor the other'],
      ['l’un ou l’autre', 'either one (usually exclusive singular)'],
    ],
  ),

  lesson(
    'gr-double-agreement-traps',
    4,
    ['compound-adjectives-and-participles', 'adjectifs-composes-et-participes-c1'],
    b('Compound Adjectives, Colours & Invariable Modifiers', 'Adjectifs composés, couleurs et tournures invariables'),
    b('Synthesise C1 agreement rules across colour adjectives, compound adjectives, demi/nu/ci-joint, and synthesis writing.', 'Maîtriser couleurs, adjectifs composés, demi/nu/ci-joint et les réinvestir à l’écrit C1.'),
    [
      b('Apply compound adjective agreement (short-sighted vs. wide-open vs. adverbial first elements).', 'Accorder justement les adjectifs composés et repérer le premier élément adverbial.'),
      b('Distinguish invariable noun-derived or dual colour adjectives (des yeux marron / bleu clair).', 'Appliquer l’invariabilité des couleurs issues de noms (marron, orange) ou nuancées (bleu clair).'),
    ],
    13,
    [
      card(
        b('Colours, ci-joint, demi, and compound adjectives', 'Couleurs, ci-joint, demi et adjectifs composés'),
        b(
          'Colour adjectives derived from **nouns** (**marron, orange, kaki, crème, turquoise**) stay invariable, **except rose, mauve, pourpre, fauve, écarlate, incarnat** which act as true variable adjectives. Two-word colour phrases (**des yeux bleu foncé, des vestes vert pomme**) never vary.\nBefore a noun, **demi-**, **nu-**, and **mi-** are invariable with a hyphen (**une demi-heure, nu-pieds**); **ci-joint** and **ci-inclus** are invariable at sentence start or directly before a determinerless noun.\nTrue agreeing colours: **roses, mauves, pourpres, écarlates**.\nAlways invariable colours: **marron, orange, olive, bleu clair**.\nInvariable before noun: **demi-heure, nu-tête, ci-joint copie**.',
          'Les couleurs issues de **noms** (**marron, orange, kaki, crème, turquoise**) restent invariables, **sauf rose, mauve, pourpre, fauve, écarlate, incarnat** qui s’accordent. Toute nuance à deux mots (**des yeux bleu foncé, des robes vert pâle**) est invariable.\nDevant le nom, **demi-**, **nu-** et **mi-** s’écrivent sans accord avec trait d’union (**une demi-journée, nu-pieds**) ; **ci-joint** reste invariable en tête de phrase ou devant un nom sans déterminant.\nCouleurs variables : **roses, mauves, pourpres, écarlates**.\nCouleurs invariables : **marron, orange, olive, bleu clair**.\nInvariables devant nom : **demi-heure, nu-tête, ci-joint copie**.',
        ),
        {
          ex: [
            ['Nous avons étudié deux dossiers ci-joints dès l’ouverture.', 'We reviewed two attached files as soon as we opened.'],
            ['Ci-joint les pièces justificatives demandées par le comité.', 'Attached are the supporting documents requested by the committee.'],
            ['Ses remarques sont pour le moins avant-gardistes et bienveillantes.', 'His or her remarks are forward-looking and benevolent to say the least.'],
          ],
        },
      ),
      pairs(
        P.match,
        [
          ['des écharpes bleu nuit', b('two-word shade → both words invariable', 'couleur nuancée en deux mots → invariable')],
          ['des fleurs mauves', b('assimilated colour adjective → agrees', 'couleur assimilée → accord en nombre')],
          ['une heure et demie', b('after noun → agrees in gender only', 'après le nom → accord au féminin uniquement')],
          ['des fenêtres grandes ouvertes', b('true adjectival adverb-like stress → both agree', 'les deux éléments varient avec ouvertes')],
        ],
      ),
      mc(
        P.spelling,
        [
          b('Elle portait des gants gris foncé et des bottines marron.', 'Elle portait des gants gris foncé et des bottines marron.'),
          b('Elle portait des gants gris foncés et des bottines marrons.', 'Elle portait des gants gris foncés et des bottines marrons.'),
          b('Elle portait des gants grises foncé et des bottines marrons.', 'Elle portait des gants grises foncé et des bottines marrons.'),
        ],
        { explain: b('Dual shade gris foncé and noun-derived marron remain invariable.', 'Gris foncé (deux mots) et marron (nom d’arbre/fruit) restent invariables.') },
      ),
      dlg(
        b('At the editorial proof desk', 'À la relecture éditoriale'),
        b('Two copy editors settle three final agreement checks before going to press.', 'Deux secrétaires de rédaction tranchent trois ultimes accords avant le bouclage.'),
        [['Camille', 'f2'], ['Bastien', 'm']],
        [
          [0, 'Regarde cette note en bas de page : « ci-joint la liste des intervenants ». On accorde ou pas ?', 'Look at this footnote: “ci-joint la liste des intervenants”. Do we make it agree or not?'],
          [1, {
            options: [
              'Non, en tête d’énoncé avant le nom, « ci-joint » joue un rôle adverbial et reste invariable.',
              'Oui, il faut écrire « ci-jointe » devant « la liste » dans tous les cas.',
              'Non, « ci-joint » ne s’accorde jamais, même après le nom « les pièces ».',
            ],
            explain: b('At the start of a phrase (ci-joint la liste), ci-joint is invariable; after a plural/feminine noun (les pièces ci-jointes), it agrees.', 'En tête de phrase, ci-joint est invariable ; placé après un nom comme épithète (les pièces ci-jointes), il s’accorde.'),
          }],
          [0, 'Et pour « des propos aigres-doux » dans le troisième paragraphe ?', 'And for “des propos aigres-doux” in paragraph three?'],
          [1, {
            options: [
              'Les deux adjectifs s’accordent au masculin pluriel : « aigres-doux ».',
              'Seul le second élément varie, jamais le premier.',
              'C’est invariable comme une couleur composée.',
            ],
            explain: b('Both halves express qualities of the noun, so both agree unless the first clearly ends in -o (franco-belge) or functions strictly as an adverb.', 'Lorsque les deux éléments qualifient le nom (aigres-doux, sourds-muets), les deux s’accordent.'),
          }],
        ],
      ),
      write(
        b('Write a formal C1 correction note (55–85 words) to a colleague explaining two agreement fixes in a draft report.', 'Rédigez une note de relecture C1 (55–85 mots) à un collègue pour justifier deux corrections d’accord dans un rapport.'),
        b('Use at least two structures from this course (a collective like la plupart / nombre de, tout, gens, or a compound/colour agreement).', 'Employez au moins deux règles de ce cours (collectif, tout, gens, ou accord composé/couleur).'),
        55,
        85,
        [
          b('Justify a collective agreement such as la plupart or la majorité', 'Justifier un accord de collectif (la plupart ou la majorité)'),
          b('Explain an invariable or euphonic form (tout, ci-joint, or colour)', 'Expliquer une forme invariable ou euphonique (tout, ci-joint ou couleur)'),
          b('Keep a courteous, analytical C1 editorial register', 'Garder un ton courtois, précis et analytique de niveau C1'),
        ],
        'Bonjour Julien, merci pour cette première version très claire. Je me permets deux retouches mineures avant l’envoi : dans la synthèse, la plupart des partenaires ont déjà validé le calendrier, donc le pluriel s’impose. Par ailleurs, la formule ci-joint les annexes reste invariable en tête de phrase, tandis que nos brochures vert olive ne prennent pas la marque du pluriel. Tout étonnée par la qualité du dossier, la direction devrait approuver ces ajustements.',
        { phrases: ['la plupart des', 'ci-joint les annexes', 'demeurent invariables', 'le pluriel s’impose'] },
      ),
    ],
    [
      b('Colour nouns (marron, orange) and two-word colour phrases (bleu clair) stay invariable; rose/mauve/pourpre agree.', 'Marron, orange et les couleurs en deux mots (bleu clair) sont invariables ; rose, mauve et pourpre s’accordent.'),
      b('Demi-/nu- before a noun take a hyphen and stay invariable; ci-joint stays invariable before a determinerless noun or sentence-initially.', 'Demi- et nu- devant le nom restent invariables avec trait d’union ; ci-joint reste invariable en tête de phrase.'),
    ],
    [
      ['ci-joint (en tête)', 'attached (invariable initially)'],
      ['des teintes vert olive', 'olive-green shades (invariable)'],
      ['une demi-heure', 'half an hour (invariable before noun)'],
      ['à demi-mot', 'by half-hints / subtly'],
    ],
  ),
];

export default lessons;
