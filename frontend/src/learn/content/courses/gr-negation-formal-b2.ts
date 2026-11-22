import type { CourseAbout, Lesson } from '../../types';
import { b, card, dict, dlg, gap, hear, lesson, mc, ord, P, pairs, say, sort, tip, trap, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Move beyond everyday ne… pas into refined B2/C1 negation. Temper statements with ne… guère (“hardly”), deny emphatically with ne… nullement and ne… aucunement, use nul and sans aucun cleanly before singular nouns, and handle formal double negations like ne pas ignorer and ne pas être sans savoir.',
    'Dépassez le simple ne… pas pour maîtriser la négation soutenue. Nuancez un propos avec ne… guère, niez fermement avec ne… nullement et ne… aucunement, employez nul et sans aucun devant un nom singulier et maniez les litotes formelles comme ne pas ignorer ou ne pas être sans savoir.',
  ),
  outcomes: [
    b('Nuance negation with ne… guère, ne… nullement, ne… aucunement and ne… point', 'Nuancer la négation avec ne… guère, ne… nullement, ne… aucunement et ne… point'),
    b('Use nul as a subject pronoun and nul / sans aucun as singular determiners', 'Employer nul comme pronom sujet et nul / sans aucun comme déterminants au singulier'),
    b('Avoid double-pas errors with sans, guère, nul and aucun', 'Éviter l’ajout fautif de pas avec sans, guère, nul et aucun'),
    b('Interpret and write formal litotes such as ne pas ignorer and ne pas être sans savoir', 'Comprendre et rédiger des litotes soutenues comme ne pas ignorer ou ne pas être sans savoir'),
  ],
};

const C = 'gr-negation-formal-b2';

const lessons: Lesson[] = [
  lesson(
    C,
    1,
    ['formal-adverbial-negations', 'negations-formelles-guere-point'],
    b('Formal negative adverbs: ne… guère, nullement, point', 'Adverbes négatifs soutenus : ne… guère, nullement, point'),
    b('Replace ne… pas with precise adverbs that express degree, absolute refusal, or literary tone.', 'Remplacer ne… pas par des adverbes qui nuancent le degré, le rejet catégorique ou le registre soutenu.'),
    [
      b('Distinguish ne… guère (“hardly”) from absolute negations', 'Distinguer ne… guère (« presque pas ») des négations absolues'),
      b('Use ne… nullement, ne… aucunement and ne… point in formal speech and writing', 'Employer ne… nullement, ne… aucunement et ne… point à l’écrit et à l’oral soutenu'),
      b('Recognize optional pas omission with savoir, pouvoir, oser and cesser', 'Reconnaître l’omission élégante de pas avec savoir, pouvoir, oser et cesser'),
    ],
    13,
    [
      card(
        b('Nuancing negation in formal French', 'Nuancer la négation en français soutenu'),
        b(
          'Everyday French relies on *ne… pas* or *presque pas*. At B2/C1, negative adverbs replace **pas** completely to convey exact nuance: **ne… guère** means “hardly / scarcely” (almost not, very little); **ne… nullement** and **ne… aucunement** mean “not at all / in no way”; **ne… point** is a literary or emphatic equivalent of *ne… pas*.\n\nPartial (“hardly”): **ne… guère**.\nCategorical (“not at all”): **ne… nullement · ne… aucunement**.\nLiterary (“not at all”): **ne… point**.',
          'Le français courant s’appuie sur *ne… pas* ou *presque pas*. Au niveau B2/C1, des adverbes négatifs remplacent **pas** pour préciser la nuance : **ne… guère** signifie « presque pas / peu » ; **ne… nullement** et **ne… aucunement** signifient « absolument pas / en aucune façon » ; **ne… point** équivaut à un *ne… pas* littéraire ou appuyé.\n\nAtténuée (« peu ») : **ne… guère**.\nCatégorique : **ne… nullement · ne… aucunement**.\nLittéraire : **ne… point**.',
        ),
        {
          table: {
            head: [b('Structure', 'Structure'), b('Meaning', 'Sens'), b('Example', 'Exemple')],
            rows: [
              ['ne… guère', b('hardly, scarcely', 'presque pas, peu'), 'Il n’a guère le choix.'],
              ['ne… nullement', b('in no way, not at all', 'en aucune manière'), 'Cela ne me gêne nullement.'],
              ['ne… aucunement', b('not in the least', 'd’aucune façon'), 'Je n’en doute aucunement.'],
              ['ne… point', b('not (literary / emphatic)', 'pas (littéraire / appuyé)'), 'Je ne le regrette point.'],
            ],
          },
          ex: [
            ['Nous n’avons guère de temps devant nous avant la séance.', 'We have hardly any time left before the session.'],
            ['Ce retard ne compromet nullement la réussite du projet.', 'This delay in no way jeopardizes the project’s success.'],
            ['L’autrice n’a aucunement modifié la fin de son roman.', 'The author did not alter the ending of her novel in the least.'],
          ],
        },
      ),
      trap(
        b('Never combine pas with guère, nullement, or point—and watch de', 'Jamais de pas avec guère, nullement ou point'),
        b(
          'These adverbs **replace** *pas*; never stack them together (*Il n’est pas guère…* ❌). With a direct object noun after **ne… guère** or **ne… point**, the indefinite/partitive article (*un, du, des*) shifts to **de / d’**, just as after *pas*: **Il n’a guère d’expérience**.\n\nAlso note four verbs that can drop **pas** in formal style: **je ne sais (où aller), je ne puis (= je ne peux), je n’ose (l’espérer), il ne cesse de (progresser)**.\n\nWith partitive de: **guère de temps, guère d’espoir, point de doute**.\nPas omitted (formal): **je ne puis · je n’ose · il ne cesse de**.',
          'Ces adverbes **remplacent** *pas* ; ne les cumulez jamais (*Il n’est pas guère…* ❌). Devant un nom COD après **ne… guère** ou **ne… point**, l’article indéfini ou partitif (*un, du, des*) devient **de / d’** : **Il n’a guère d’expérience**.\n\nQuatre verbes peuvent aussi omettre **pas** dans un registre soutenu : **je ne sais, je ne puis, je n’ose, il ne cesse de**.\n\nAvec de partitif : **guère de temps, guère d’espoir, point de doute**.\nSans pas (soutenu) : **je ne puis · je n’ose · il ne cesse de**.',
        ),
      ),
      mc(
        P.meaning,
        [
          b('She has hardly any spare time.', 'Elle n’a presque pas de temps libre.'),
          b('She has no spare time whatsoever.', 'Elle n’a absolument aucun temps libre.'),
          b('She has plenty of spare time.', 'Elle a beaucoup de temps libre.'),
        ],
        {
          fr: 'Elle n’a guère de temps libre ces semaines-ci.',
          explain: b('Ne… guère means “hardly / scarcely / very little”, not an absolute zero.', 'Ne… guère signifie « presque pas / très peu », et non un zéro absolu.'),
        },
      ),
      mc(
        P.form,
        ['n’a nullement l’intention', 'n’a pas nullement l’intention', 'a nullement pas l’intention', 'n’a guère l’intention pas'],
        {
          fr: 'La direction ___ de fermer ce site industriel.',
          explain: b('Nullement replaces pas completely; putting pas beside it is incorrect.', 'Nullement remplace pas entièrement : il ne se combine jamais avec pas.'),
        },
      ),
      gap(
        P.complete,
        'Cette remarque ne me surprend ___ (not at all / nullement). Il n’y a ___ (hardly / guère) ___ (of / d’) espoir de conclure avant vendredi.',
        [['nullement', 'aucunement'], ['guère'], ['d’']],
        { hint: b('Remember the elided preposition d’ before espoir after guère.', 'N’oubliez pas l’élision d’ devant espoir après guère.') },
      ),
      hear(
        'Nous n’avons guère avancé depuis la réunion de mardi.',
        b('What does the speaker mean?', 'Que veut dire la personne qui parle ?'),
        [
          b('We have barely made any progress since Tuesday.', 'Nous avons à peine avancé depuis mardi.'),
          b('We have made tremendous progress since Tuesday.', 'Nous avons énormément avancé depuis mardi.'),
          b('We have no intention of continuing on Tuesday.', 'Nous n’avons aucune intention de continuer mardi.'),
        ],
      ),
      ord(
        P.order,
        'Ce témoignage ne prouve aucunement sa responsabilité.',
        { tr: 'This testimony in no way proves his responsibility.' },
      ),
      pairs(
        P.match,
        [
          ['ne… guère', b('hardly, scarcely', 'presque pas, très peu')],
          ['ne… nullement', b('in no way, not at all', 'pas du tout, en aucune façon')],
          ['ne… point', b('not (literary)', 'pas (registre soutenu)')],
          ['je ne puis', b('I cannot (formal)', 'je ne peux pas (registre soutenu)')],
        ],
      ),
      dict('La ville ne cesse de se transformer, mais on n’y entend guère de plaintes.'),
      say('Je ne suis nullement convaincu par cette explication improvisée.', 'I am in no way convinced by this improvised explanation.'),
    ],
    [
      b('ne… guère means “hardly / very little”; ne… nullement and ne… aucunement mean “not at all / in no way”.', 'ne… guère signifie « presque pas / peu » ; ne… nullement et ne… aucunement signifient « en aucune façon ».'),
      b('Never combine pas with guère, nullement, aucunement, or point.', 'Ne cumulez jamais pas avec guère, nullement, aucunement ou point.'),
      b('Use de / d’ before a noun after ne… guère or ne… point (guère d’espoir).', 'Employez de / d’ devant un nom après ne… guère ou ne… point (guère d’espoir).'),
    ],
    [
      ['n’avoir guère de', b('to have hardly any', 'n’avoir presque pas de')],
      ['ne… nullement', b('not at all, in no way', 'en aucune manière')],
      ['ne… aucunement', b('not in the least', 'd’aucune façon')],
      ['je ne puis', b('I cannot (formal)', 'je ne peux pas (soutenu)')],
    ],
  ),

  lesson(
    C,
    2,
    ['nul-and-sans-aucun', 'nul-et-sans-aucun'],
    b('Nul, nulle and sans aucun before nouns or as subject', 'Nul, nulle et sans aucun devant un nom ou comme sujet'),
    b('Use formal nul and sans aucun cleanly—always in the singular, never paired with pas.', 'Employer nul et sans aucun avec précision, toujours au singulier et sans jamais ajouter pas.'),
    [
      b('Use nul as a formal subject pronoun (“nobody / no one”)', 'Employer nul comme pronom sujet soutenu (« personne »)'),
      b('Contrast nul(le) + noun and aucun(e) + noun in singular expressions', 'Distinguer nul(le) + nom et aucun(e) + nom au singulier'),
      b('Use sans + bare noun vs. sans aucun(e) + singular noun without pas', 'Employer sans + nom nu et sans aucun(e) + nom singulier sans pas'),
    ],
    13,
    [
      card(
        b('Nul and sans aucun: singular precision', 'Nul et sans aucun : la précision du singulier'),
        b(
          '**Nul** (masculine singular pronoun) means “nobody / no one” in legal, academic, or formal prose: **Nul n’est censé ignorer la loi**. As a determiner before a noun, **nul / nulle** and **aucun / aucune** always keep the noun in the **singular** (unless the noun exists only in the plural, like *frais* or *archives*): **en aucun cas**, **sans nul doute**, **sans aucune hésitation**. Notice that **sans** already carries negative force, so **sans aucun** never uses *ne* or *pas*.\n\nPronoun (“no one”): **nul ne sait, nul n’ignore, nul ne peut**.\nDeterminer + singular: **sans nul doute, en aucun cas, sans aucune preuve**.\nBare noun after sans: **sans délai, sans hésitation, sans condition**.',
          '**Nul** (pronom masculin singulier) signifie « personne » dans les textes juridiques, académiques ou soutenus : **Nul n’est censé ignorer la loi**. Comme déterminants, **nul / nulle** et **aucun / aucune** maintiennent le nom au **singulier** (sauf nom exclusivement pluriel comme *frais* ou *archives*) : **en aucun cas**, **sans nul doute**, **sans aucune hésitation**. Comme **sans** est déjà négatif, **sans aucun** ne prend ni *ne* ni *pas*.\n\nPronom (« personne ») : **nul ne sait, nul n’ignore, nul ne peut**.\nDéterminant au singulier : **sans nul doute, en aucun cas, sans aucune preuve**.\nNom nu après sans : **sans délai, sans hésitation, sans condition**.',
        ),
        {
          table: {
            head: [b('Form', 'Forme'), b('Role', 'Fonction'), b('Example', 'Exemple')],
            rows: [
              ['nul ne + verb', b('subject pronoun (“no one”)', 'pronom sujet (« personne »)'), 'Nul n’est à l’abri d’une erreur.'],
              ['nul / nulle + sing. noun', b('determiner (“no”)', 'déterminant (« aucun »)'), 'Nous n’avons nulle envie de céder.'],
              ['sans + bare noun', b('general absence', 'absence générale'), 'Il a répondu sans hésitation.'],
              ['sans aucun(e) + sing. noun', b('emphatic zero (“no… whatsoever”)', 'absence catégorique'), 'Il a répondu sans aucune hésitation.'],
            ],
          },
          ex: [
            ['Nul ne saurait contester l’importance de cette découverte.', 'No one could dispute the importance of this discovery.'],
            ['En aucun cas ce règlement ne pourra être contourné.', 'Under no circumstances may this regulation be bypassed.'],
            ['L’accord a été signé sans aucun retard ni réserve.', 'The agreement was signed without any delay or reservation.'],
          ],
        },
      ),
      trap(
        b('Always singular after aucun and nul—and beware the adjective nul', 'Toujours le singulier après aucun et nul'),
        b(
          'Even when English says “without any delays” or “no reasons”, French keeps the noun **singular** after **aucun / aucune** and **nul / nulle**: **sans aucune raison** (NOT *sans aucunes raisons*). Also distinguish the determiner **nul** placed **before** the noun (*nulle part*, *sans nul doute* = “no”) from the adjective **nul / nulle** placed **after** the noun or *être* (*un devoir nul* = “worthless / zero”).\n\nDeterminer (before noun): **nulle trace, nul besoin, sans aucun motif**.\nAdjective (after verb/noun): **un résultat nul · une clause nulle**.',
          'Même quand on pense au pluriel, le nom reste **singulier** après **aucun / aucune** et **nul / nulle** : **sans aucune raison** (et NON *sans aucunes raisons*). Distinguez aussi le déterminant **nul** placé **avant** le nom (*nulle part*, *sans nul doute* = « aucun ») de l’adjectif **nul / nulle** placé **après** (*un score nul* = « égal à zéro »).\n\nDéterminant (avant le nom) : **nulle trace, nul besoin, sans aucun motif**.\nAdjectif (après verbe/nom) : **un résultat nul · une clause nulle**.',
        ),
      ),
      mc(
        P.spelling,
        ['sans aucune difficulté', 'sans aucunes difficultés', 'sans pas de difficulté', 'sans nulle difficultés'],
        {
          fr: 'Elle a résolu ce problème complexe ___.',
          explain: b('After sans aucun(e), countable nouns stay singular (sans aucune difficulté).', 'Après sans aucun(e), le nom reste au singulier (sans aucune difficulté).'),
        },
      ),
      mc(
        P.best,
        [
          'Nul n’est autorisé à pénétrer dans le laboratoire sans badge.',
          'Nuls ne sont autorisés à pénétrer dans le laboratoire sans badge.',
          'Nul n’est pas autorisé à pénétrer dans le laboratoire sans badge.',
          'Aucun ne sont autorisés à pénétrer dans le laboratoire.',
        ],
        {
          fr: 'Which formal rule sign is grammatically accurate?',
          explain: b('As a subject pronoun, nul is singular, takes ne without pas, and pairs with a singular verb (est).', 'Pronom sujet, nul est toujours singulier, prend ne sans pas et commande le verbe au singulier (est).'),
        },
      ),
      gap(
        P.complete,
        '___ (Nul / Nuls) n’ignore les risques climatiques. Nous n’avons ___ (aucun / aucune) preuve tangible, mais le projet avancera sans ___ (nul / nulle) ambiguïté.',
        [['Nul'], ['aucune'], ['nulle']],
        {
          choices: [
            ['Nul', 'Nuls', 'Aucunement'],
            ['aucune', 'aucun', 'aucunes'],
            ['nulle', 'nul', 'nulles'],
          ],
        },
      ),
      sort(
        b('Pronoun “no one”, determiner “no…”, or adjective “zero”?', 'Pronom, déterminant ou adjectif ?'),
        [
          b('Pronoun (“no one”)', 'Pronom (« personne »)'),
          b('Determiner (“no / without any”)', 'Déterminant (« aucun »)'),
          b('Adjective (“zero / void”)', 'Adjectif (« égal à zéro »)'),
        ],
        [
          ['Nul ne l’avait prévu.', 0],
          ['Nulle trace n’a été retrouvée.', 1],
          ['Ce contrat est déclaré nul.', 2],
          ['Sans nul doute, il réussira.', 1],
          ['Nul n’est parfait.', 0],
          ['L’impact reste nul.', 2],
        ],
      ),
      ord(
        P.order,
        'En aucun cas cette donnée ne doit être divulguée.',
        { tr: 'Under no circumstances must this piece of data be disclosed.' },
      ),
      dict('Nul n’est censé ignorer la loi, même sans aucun conseil juridique.'),
      say('Nous n’avons nul besoin d’intervenir tant que la situation reste calme.', 'We have no need to intervene as long as the situation stays calm.'),
    ],
    [
      b('Nul ne + singular verb means “no one” in formal, legal and academic prose.', 'Nul ne + verbe au singulier signifie « personne » dans un registre soutenu ou juridique.'),
      b('Nul(le) and aucun(e) as determiners keep countable nouns in the singular (sans aucune erreur).', 'Nul(le) et aucun(e) déterminants maintiennent les noms comptables au singulier (sans aucune erreur).'),
      b('Never add pas after sans aucun or nul ne.', 'N’ajoutez jamais pas après sans aucun ou nul ne.'),
    ],
    [
      ['nul n’est censé', b('no one is supposed to', 'personne n’est supposé')],
      ['en aucun cas', b('under no circumstances', 'jamais, dans aucune situation')],
      ['sans nul doute', b('undoubtedly, without a doubt', 'indubitablement')],
      ['nulle part', b('nowhere', 'en aucun endroit')],
    ],
  ),

  lesson(
    C,
    3,
    ['double-negations-and-litotes', 'doubles-negations-et-litotes'],
    b('Double negations and formal litotes: ne pas ignorer, sans rien', 'Doubles négations et litotes : ne pas ignorer, sans rien'),
    b('Master high-level litotes and combine sans with negative pronouns like rien, jamais, or personne.', 'Maîtriser les litotes soutenues et combiner sans avec rien, jamais ou personne.'),
    [
      b('Interpret and write formal litotes (ne pas ignorer, ne pas être sans savoir)', 'Comprendre et employer des litotes soutenues (ne pas ignorer, ne pas être sans savoir)'),
      b('Combine sans with rien, jamais, personne and plus without adding pas or ne', 'Combiner sans avec rien, jamais, personne et plus sans ajouter pas ni ne'),
      b('Use ne… ni… ni and non sans in formal B2 writing', 'Employer ne… ni… ni et non sans à l’écrit B2'),
    ],
    13,
    [
      card(
        b('Litotes: saying yes with two negatives', 'La litote : affirmer avec force par deux négations'),
        b(
          'Formal French loves **litotes**—a double negation that softens tone while emphasizing certainty. Saying **Vous n’êtes pas sans savoir que…** (“You are not unaware that…”) politely reminds the reader of an obvious fact. Likewise, **Je n’ignore pas que…** means “I know full well that…”, and **non sans difficulté** means “with real difficulty”.\n\nDouble-negative litotes: **ne pas ignorer que, ne pas être sans savoir, non sans mal**.\nSans + negative word: **sans rien dire, sans jamais céder, sans voir personne**.\nPaired negation: **ni… ni…**.',
          'Le français soutenu affectionne la **litote** : deux négations qui nuancent le ton tout en renforçant le propos. Dire **Vous n’êtes pas sans savoir que…** rappelle poliment une évidence. De même, **Je n’ignore pas que…** signifie « je sais parfaitement que… », et **non sans difficulté** signifie « avec beaucoup de peine ».\n\nLitotes soutenues : **ne pas ignorer que, ne pas être sans savoir, non sans mal**.\nSans + mot négatif : **sans rien dire, sans jamais céder, sans voir personne**.\nDouble exclusion : **ni… ni…**.',
        ),
        {
          table: {
            head: [b('Litote / Construction', 'Tournure'), b('Actual meaning', 'Sens réel'), b('Following mood', 'Mode après que')],
            rows: [
              ['ne pas ignorer que', b('to know full well that', 'savoir très bien que'), b('indicative', 'indicatif')],
              ['ne pas être sans savoir que', b('to be well aware that', 'savoir pertinemment que'), b('indicative', 'indicatif')],
              ['non sans + noun', b('with considerable…', 'avec beaucoup de…'), b('—', '—')],
              ['il n’est pas rare que', b('it happens fairly often', 'il arrive assez souvent'), b('subjunctive', 'subjonctif')],
            ],
          },
          ex: [
            ['Vous n’êtes pas sans savoir que le délai expire demain.', 'You are well aware that the deadline expires tomorrow.'],
            ['Nous n’ignorons pas les obstacles que ce projet soulève.', 'We are fully aware of the obstacles this project raises.'],
            ['Il a accepté le poste, non sans une certaine appréhension.', 'He accepted the post, not without a certain apprehension.'],
          ],
        },
      ),
      tip(
        b('Sans replaces ne before rien, jamais, personne, aucun', 'Sans remplace ne devant rien, jamais, personne, aucun'),
        b(
          'Never write *sans ne rien dire* or *sans pas jamais revenir*. Because **sans** is already negative, negative words follow it directly: **sans rien dire**, **sans jamais hésiter**, **sans prévenir personne**, **sans plus attendre**. Notice **sans rien + infinitive**, whereas **sans personne** puts *personne* after the infinitive: **sans déranger personne**.\n\nBefore infinitive: **sans rien faire, sans jamais douter, sans plus tarder**.\nAfter infinitive: **sans voir personne, sans aucun regret**.',
          'N’écrivez jamais *sans ne rien dire* ni *sans jamais pas revenir*. Comme **sans** porte déjà la négation, les mots négatifs le suivent directement : **sans rien dire**, **sans jamais hésiter**, **sans prévenir personne**, **sans plus attendre**. Notez l’ordre : **sans rien faire**, mais **sans déranger personne**.\n\nAvant l’infinitif : **sans rien faire, sans jamais douter, sans plus tarder**.\nAprès l’infinitif : **sans voir personne, sans aucun regret**.',
        ),
      ),
      mc(
        P.meaning,
        [
          b('The committee knows full well that costs have risen.', 'La commission sait parfaitement que les coûts ont augmenté.'),
          b('The committee has no idea that costs have risen.', 'La commission ignore totalement la hausse des coûts.'),
          b('The committee refuses to examine the costs.', 'La commission refuse d’examiner les coûts.'),
        ],
        {
          fr: 'La commission n’ignore pas que les coûts ont augmenté.',
          explain: b('Ne pas ignorer = to be fully aware of (litotes), followed by the indicative.', 'Ne pas ignorer est une litote qui signifie « savoir parfaitement », suivie de l’indicatif.'),
        },
      ),
      mc(
        P.best,
        [
          'Il a traversé la crise sans rien dire ni compromettre personne.',
          'Il a traversé la crise sans ne rien dire ni compromettre personne.',
          'Il a traversé la crise sans dire rien ni pas compromettre personne.',
          'Il a traversé la crise sans personne compromettre ni rien.',
        ],
        {
          fr: 'Which sentence has natural French word order after sans?',
          explain: b('Sans takes no ne/pas; rien precedes the infinitive (sans rien dire), while personne follows it (compromettre personne).', 'Sans ne prend ni ne ni pas ; rien précède l’infinitif (sans rien dire) tandis que personne le suit (compromettre personne).'),
        },
      ),
      gap(
        P.completeText,
        'Vous n’êtes pas ___ (without / sans) savoir que ce contrat est urgent. Nous avons réussi, ___ (not without / non sans) peine, à boucler le budget sans ___ (ever / jamais) dépasser le plafond.',
        [['sans'], ['non sans'], ['jamais']],
      ),
      dlg(
        b('Diplomacy at a board meeting', 'Diplomatie en conseil d’administration'),
        b('Claire and Antoine discuss a delayed software migration.', 'Claire et Antoine évoquent le retard d’une migration informatique.'),
        [['Claire', 'f'], ['Antoine', 'm']],
        [
          [0, 'Vous n’ignorez pas que plusieurs services attendent ce nouvel outil depuis janvier.', 'You are well aware that several departments have been waiting for this new tool since January.'],
          [1, { options: ['Je ne le nie nullement, mais nous n’avions guère d’autre choix que de sécuriser les données.', 'Je ne le nie pas nullement, mais nous n’avions guère d’autre choix.', 'Je le nie guère, mais nous n’avions pas d’autre choix nullement.'] }],
          [0, 'Certes, mais peut-on lancer la phase deux sans compromettre la continuité ?', 'True, but can we launch phase two without compromising continuity?'],
          [1, { options: ['Sans aucun doute : nos tests sont achevés et ne présentent plus aucune faille.', 'Sans aucunes doutes : nos tests sont achevés et ne présentent pas aucune faille.', 'Sans doute aucunement : nos tests sont achevés sans ne rien perdre.'] }],
        ],
      ),
      ord(
        P.order,
        'Elle a quitté la salle sans plus attendre ni saluer personne.',
        { tr: 'She left the room without waiting any longer or greeting anyone.' },
      ),
      say('Je n’ignore pas la complexité du dossier, mais ce délai ne saurait être prolongé.', 'I am well aware of the file’s complexity, yet this deadline cannot be extended.'),
      write(
        b('Write a diplomatic response using formal negation', 'Rédiger une réponse diplomatique avec négation soutenue'),
        b(
          'In 50 to 80 words, reply to a client or partner who complains about a slight delivery delay. Acknowledge their concern politely using a litote (ne pas ignorer / ne pas être sans savoir), reassure them with ne… nullement or sans aucun, and temper the issue with ne… guère.',
          'En 50 à 80 mots, répondez à un client ou partenaire qui s’inquiète d’un léger retard de livraison. Montrez votre écoute avec une litote (ne pas ignorer / ne pas être sans savoir), rassurez-le avec ne… nullement ou sans aucun, et nuancez la situation avec ne… guère.',
        ),
        50,
        80,
        [
          b('One litote (ne pas ignorer or ne pas être sans savoir)', 'Une litote (ne pas ignorer ou ne pas être sans savoir)'),
          b('One categorical negation (ne… nullement or sans aucun)', 'Une négation catégorique (ne… nullement ou sans aucun)'),
          b('One softening negation with ne… guère', 'Une atténuation avec ne… guère'),
        ],
        'Nous n’ignorons pas l’importance de ce calendrier pour votre équipe. Toutefois, ce léger décalage ne compromet nullement la qualité de votre commande. En cette période de forte activité, notre atelier n’a guère de marge sur les transports, mais l’expédition partira sans aucun retard supplémentaire dès demain matin, non sans un contrôle qualité complet avant le départ.',
        {
          phrases: ['Nous n’ignorons pas', 'ne compromet nullement', 'n’a guère de', 'sans aucun', 'non sans'],
        },
      ),
    ],
    [
      b('Double negatives like ne pas ignorer que and ne pas être sans savoir que act as polite, emphatic affirmations.', 'Les doubles négations comme ne pas ignorer que et ne pas être sans savoir que servent d’affirmations polies et appuyées.'),
      b('After sans, use rien / jamais / personne / aucun directly—never insert ne or pas.', 'Après sans, employez directement rien / jamais / personne / aucun, sans ne ni pas.'),
      b('Notice the order after sans: sans rien faire / sans plus attendre, but sans voir personne.', 'Notez l’ordre après sans : sans rien faire / sans plus attendre, mais sans voir personne.'),
    ],
    [
      ['ne pas ignorer que', b('to be well aware that', 'savoir parfaitement que')],
      ['ne pas être sans savoir', b('to know full well', 'être parfaitement informé')],
      ['non sans', b('not without (considerable)', 'non sans, avec une réelle')],
      ['sans plus attendre', b('without further delay', 'immédiatement, tout de suite')],
    ],
  ),
];

export default lessons;
