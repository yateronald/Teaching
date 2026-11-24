import type { CourseAbout, Lesson } from '../../types';
import { P, b, card, culture, dict, dlg, flash, gap, hear, lesson, mc, ord, pairs, say, sort, tip, trap, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Discover rare, vivid C2 idioms drawn from medieval coin disputes, siege warfare, flintlock firearms and classical prose. Master idioms of conflict (avoir maille à partir avec, battre en brèche, monter au créneau), abrupt precision (à brûle-pourpoint, de but en blanc, sans coup férir) and refined traps like the true meaning of faire long feu (to misfire/fail) and faire florès.',
    'Explorez les perles rares et images saisissantes du niveau C2, héritées du droit médiéval, de l’art militaire et de la prose classique. Maîtrisez les tournures du conflit (avoir maille à partir avec, battre en brèche, monter au créneau), de la surprise (à brûle-pourpoint, de but en blanc, sans coup férir) et les subtilités authentiques de faire long feu (échouer) ou faire florès.',
  ),
  outcomes: [
    b('Use medieval and military idioms of conflict with exact prepositions and spelling', 'Employer les expressions de joute et de conflit avec leurs prépositions et graphies exactes'),
    b('Express suddenness, timing and effortless success using rare fixed forms like sans coup férir', 'Nuancer soudaineté, à-propos et victoire sans combat avec des formules rares'),
    b('Avoid the widespread faire long feu trap and wield refined figurative C2 gems cleanly', 'Déjouer le piège classique de faire long feu et manier les tournures C2 les plus fines'),
  ],
};

const C = 'exp-rare-vivid-idioms-c2';

const lessons: Lesson[] = [
  lesson(
    C,
    1,
    ['conflict-and-confrontation-c2', 'conflit-et-joute-c2'],
    b('Conflict, confrontation & pre-emption', 'Conflit, joute et prise à partie'),
    b('Pick a bone, pre-empt a rival, challenge ideas fiercely and step onto the ramparts.', 'Avoir maille à partir, couper l’herbe sous le pied, battre en brèche et monter au créneau.'),
    [
      b('Distinguish prendre quelqu’un à partie (-e!) from prendre parti pour', 'Distinguer prendre quelqu’un à partie (-e !) de prendre parti pour'),
      b('Use avoir maille à partir avec and couper l’herbe sous le pied à quelqu’un accurately', 'Employer avoir maille à partir avec et couper l’herbe sous le pied à quelqu’un'),
      b('Deploy battre en brèche and monter au créneau in institutional debate', 'Manier battre en brèche et monter au créneau dans le débat public'),
    ],
    13,
    [
      card(
        b('Medieval disputes and siege warfare in C2 French', 'Querelles médiévales et art du siège au C2'),
        b(
          'Five muscular C2 idioms turn debate into vivid action: **avoir maille à partir avec** (having a dispute to settle with someone—originally splitting an indivisible tiny coin, *la maille*), **couper l’herbe sous le pied à quelqu’un** (forestalling a rival by snatching their advantage first), **prendre quelqu’un à partie** (attacking or challenging someone directly in public), **battre en brèche** (pounding away at a dogma or claim until it crumbles), and **monter au créneau** (stepping forward onto the battlements to defend a cause).\nDisputes & public clashes: **avoir maille à partir avec · prendre quelqu’un à partie · monter au créneau**.\nUndercutting & refuting: **couper l’herbe sous le pied à quelqu’un · battre en brèche**.',
          'Cinq expressions expressives transforment la controverse en image vive : **avoir maille à partir avec** (avoir un différend avec quelqu’un — littéralement une minuscule pièce, la *maille*, impossible à partager), **couper l’herbe sous le pied à quelqu’un** (devancer un rival en lui ôtant son atout), **prendre quelqu’un à partie** (interpeller vivement quelqu’un), **battre en brèche** (attaquer de front une idée ou un monopole) et **monter au créneau** (intervenir en première ligne pour défendre une cause).\nAffrontement : **avoir maille à partir avec · prendre quelqu’un à partie · monter au créneau**.\nContre-attaque et réfutation : **couper l’herbe sous le pied à quelqu’un · battre en brèche**.',
        ),
        {
          table: {
            head: [b('Expression', 'Expression'), b('Meaning', 'Sens'), b('Origin & grammar check', 'Origine et grammaire')],
            rows: [
              ['avoir maille à partir avec', b('to have a bone to pick / run-in with', 'avoir un démêlé, un différend avec'), b('archaic partir = divide; maille = half-denier', 'partir (diviser) une maille (petite pièce)')],
              ['couper l’herbe sous le pied à quelqu’un', b('to steal a march on, pull the rug out from', 'devancer quelqu’un en lui prenant l’initiative'), b('singular le pied (never *les pieds)!', 'le pied toujours au singulier !')],
              ['prendre quelqu’un à partie', b('to round on, challenge someone publicly', 'interpeller vivement, attaquer directement'), b('feminine partie (-e!); ≠ prendre parti', 'partie féminin (-e !) ; ≠ prendre parti')],
              ['battre en brèche', b('to shatter, challenge fiercely, undermine', 'attaquer avec force jusqu’à ébranler'), b('siege cannon breaching walls; takes en', 'brèche de siège ; toujours en brèche')],
              ['monter au créneau', b('to step into the fray, speak out boldly', 'monter en première ligne pour défendre un camp'), b('medieval battlement / WWI trench parapet', 'créneau de rempart ou de tranchée')],
            ],
          },
          ex: [
            ['Ce journaliste d’investigation a déjà eu maille à partir avec plusieurs cabinets ministériels.', 'That investigative journalist has already had run-ins with several ministerial offices.'],
            ['En annonçant sa propre réforme la veille du vote, l’opposition lui a coupé l’herbe sous le pied.', 'By announcing its own reform the eve of the vote, the opposition stole his thunder.'],
            ['Plusieurs chercheurs sont montés au créneau pour battre en brèche cette étude biaisée.', 'Several researchers stepped forward to tear down that biased study.'],
          ],
        },
      ),
      tip(
        b('Spell « prendre à partie » with -e and keep « le pied » singular', '« Prendre à partie » avec -e et « le pied » au singulier'),
        b(
          'Two sharp grammar rules distinguish C2 writing: write **prendre quelqu’un à partie** with final **-e** (meaning treating someone as the opposing legal *party*, as opposed to *prendre parti pour*, “taking sides for”). Second, **couper l’herbe sous le pied à quelqu’un** always keeps **le pied** singular (unlike English’s two feet under a rug!). And in **avoir maille à partir avec**, *partir* is an old verb meaning “to divide/share”, so never change it to *partager*.',
          'Deux détails qui signent le C2 : écrivez **prendre quelqu’un à partie** avec un **-e** final (traiter quelqu’un en *partie* adverse, à la différence de *prendre parti pour*). Ensuite, **couper l’herbe sous le pied à quelqu’un** garde toujours **le pied** au singulier. Enfin, dans **avoir maille à partir avec**, le vieux verbe *partir* (« partager ») reste figé — ne le remplacez jamais.',
        ),
      ),
      flash(
        b('Conflict & confrontation', 'Conflit et prise à partie'),
        [
          ['avoir maille à partir avec', b('to have a run-in or dispute with', 'avoir un différend, un litige avec')],
          ['couper l’herbe sous le pied à quelqu’un', b('to pre-empt someone, steal their thunder', 'devancer quelqu’un en lui ôtant son avantage')],
          ['prendre quelqu’un à partie', b('to confront or attack someone directly', 'interpeller vivement, accuser quelqu’un')],
          ['battre en brèche', b('to attack and undermine (an idea, dogma)', 'ébranler vivement par la critique ou l’action')],
          ['monter au créneau', b('to step into the fray, speak up boldly', 'prendre publiquement position pour défendre')],
        ],
      ),
      mc(
        P.spelling,
        [
          'Après la conférence, deux auditeurs ont pris l’orateur à partie sur ses sources.',
          'Après la conférence, deux auditeurs ont pris l’orateur à parti sur ses sources.',
          'Après la conférence, deux auditeurs ont pris parti l’orateur sur ses sources.',
          'Après la conférence, deux auditeurs ont pris l’orateur en brèche sur ses sources.',
        ],
        {
          explain: b('Prendre quelqu’un à partie (with -e!) means confronting/attacking someone directly; prendre parti takes no -e and means taking a side.', 'Prendre quelqu’un à partie prend un -e (désigner comme adversaire), contre prendre parti (choisir un camp).'),
        },
      ),
      mc(
        P.meaning,
        [
          b('The competitor pre-empted them by unveiling a nearly identical service first.', 'Le concurrent les a devancés en lançant une offre similaire juste avant eux.'),
          b('The competitor ruined their office lawn as an act of sabotage.', 'Le concurrent a détérioré leurs locaux par vengeance.'),
          b('The competitor quietly stepped aside to let them lead the market.', 'Le concurrent s’est effacé pour leur laisser le champ libre.'),
          b('The competitor disputed every invoice in court for years.', 'Le concurrent a contesté leurs factures devant les tribunaux.'),
        ],
        {
          fr: 'En dévoilant son prototype trois jours avant le salon, le concurrent nous a coupé l’herbe sous le pied.',
          explain: b('Couper l’herbe sous le pied à quelqu’un means stealing someone’s initiative or thunder at the crucial moment.', 'Couper l’herbe sous le pied à quelqu’un signifie devancer habilement quelqu’un et le priver de son effet.'),
        },
      ),
      pairs(
        P.match,
        [
          ['avoir maille à partir avec', b('to have a run-in or dispute with', 'avoir un différend, un litige avec')],
          ['couper l’herbe sous le pied à quelqu’un', b('to pre-empt someone, steal their thunder', 'devancer quelqu’un en lui ôtant son avantage')],
          ['prendre quelqu’un à partie', b('to confront or attack someone directly', 'interpeller vivement, accuser quelqu’un')],
          ['battre en brèche', b('to attack and undermine (an idea, dogma)', 'ébranler vivement par la critique ou l’action')],
          ['monter au créneau', b('to step into the fray, speak up boldly', 'prendre publiquement position pour défendre')],
        ],
      ),
      gap(
        P.complete,
        'Ce syndicaliste, qui a souvent eu ___ à partir avec sa direction, n’hésite jamais à monter au ___ pour ___ en brèche les décisions injustes.',
        ['maille', 'créneau', 'battre'],
        {
          choices: [
            ['maille', 'brèche', 'herbe'],
            ['créneau', 'pied', 'parti'],
            ['battre', 'couper', 'prendre'],
          ],
          explain: b('avoir maille à partir avec; monter au créneau; battre en brèche.', 'avoir maille à partir avec ; monter au créneau ; battre en brèche.'),
        },
      ),
      hear(
        'Pendant des décennies, ce monopole régional paraissait intouchable ; pourtant, deux coopératives citoyennes ont fini par le battre en brèche sur le terrain même des prix.',
        b('What happened to the regional monopoly?', 'Qu’est-il advenu du monopole régional ?'),
        [
          b('Two citizen cooperatives challenged and undermined its dominance on pricing.', 'Deux coopératives citoyennes ont sérieusement ébranlé sa domination par leurs tarifs.'),
          b('The regional monopoly effortlessly bought out both cooperatives.', 'Le monopole a racheté sans peine les deux coopératives.'),
          b('The two cooperatives avoided competing with the monopoly on price.', 'Les deux coopératives ont évité toute concurrence tarifaire.'),
        ],
        {
          voice: 'm',
          explain: b('Battre en brèche means battering down an entrenched power, orthodoxy or monopoly.', 'Battre en brèche signifie attaquer et ébranler une position jusque-là dominante.'),
        },
      ),
      dict(
        'En prenant le rapporteur à partie, elle a battu en brèche toute son argumentation.',
        {
          voice: 'f',
          hint: b('Watch feminine partie (-e) and battu en brèche (accent grave on è).', 'Attention à partie avec -e et à l’accent grave de brèche.'),
        },
      ),
      say(
        'Plutôt que de rester silencieux, il est monté au créneau pour leur couper l’herbe sous le pied.',
        'Instead of staying silent, he stepped into the fray to steal a march on them.',
      ),
    ],
    [
      b('Avoir maille à partir avec = have a quarrel/run-in with; monter au créneau = step forward publicly to defend a cause.', 'Avoir maille à partir avec = avoir un différend avec ; monter au créneau = intervenir en première ligne.'),
      b('Prendre quelqu’un à partie ALWAYS ends in -e (unlike prendre parti).', 'Prendre quelqu’un à partie s’écrit toujours avec -e (à la différence de prendre parti).'),
      b('Couper l’herbe sous le pied (singular pied!) = pre-empt someone; battre en brèche = shatter/undermine.', 'Couper l’herbe sous le pied (singulier !) = devancer ; battre en brèche = ébranler vivement.'),
    ],
    [
      ['avoir maille à partir avec', b('to have a run-in or dispute with', 'avoir un différend, un litige avec')],
      ['couper l’herbe sous le pied à quelqu’un', b('to pre-empt someone, steal their thunder', 'devancer quelqu’un en lui ôtant son avantage')],
      ['prendre quelqu’un à partie', b('to confront or attack someone directly', 'interpeller vivement, accuser quelqu’un')],
      ['battre en brèche', b('to attack and undermine (an idea, dogma)', 'ébranler vivement par la critique ou l’action')],
      ['monter au créneau', b('to step into the fray, speak up boldly', 'prendre publiquement position pour défendre')],
    ],
  ),

  lesson(
    C,
    2,
    ['precision-and-surprise-c2', 'soudainete-et-a-propos-c2'],
    b('Abruptness, timing & effortless triumph', 'Soudaineté, à-propos et victoire sans heurt'),
    b('Describe point-blank questions, blunt announcements, lucky timing and wins without a single blow.', 'Décrire questions à brûle-pourpoint, annonces de but en blanc, heureuses coïncidences et succès sans coup férir.'),
    [
      b('Nuance à brûle-pourpoint vs de but en blanc cleanly', 'Nuancer à brûle-pourpoint et de but en blanc avec justesse'),
      b('Use tomber à pic and prendre au dépourvu for timing and surprise', 'Employer tomber à pic et prendre au dépourvu pour l’à-propos et la surprise'),
      b('Master the spelling and defective-verb rule of sans coup férir', 'Maîtriser la graphie et l’invariabilité de sans coup férir'),
    ],
    13,
    [
      card(
        b('Point-blank abruptness and effortless poise', 'Attaque directe, à-propos et victoire nette'),
        b(
          'Early firearms and chivalry left five crisp C2 idioms for surprise and timing: **à brûle-pourpoint** (firing point-blank—asking or challenging abruptly right in someone’s face), **de but en blanc** (aiming straight at the white mark without a preamble—blurting out bluntly), **tomber à pic** (dropping straight in at the exact ideal moment), **prendre au dépourvu** (catching someone unprepared), and **sans coup férir** (winning without striking a single blow, effortlessly).\nAbrupt & unprepared: **à brûle-pourpoint · de but en blanc · prendre au dépourvu**.\nPerfect timing & ease: **tomber à pic · sans coup férir**.',
          'Les anciennes armes et la chevalerie ont légué cinq expressions ciselées : **à brûle-pourpoint** (si près qu’on brûle le pourpoint — interpeller sans prévenir), **de but en blanc** (tir droit sur le blanc de la cible — annoncer tout net, sans préambule), **tomber à pic** (survenir au moment idéal), **prendre au dépourvu** (surprendre quelqu’un sans préparation) et **sans coup férir** (triompher sans livrer bataille, sans résistance).\nBrusquerie et surprise : **à brûle-pourpoint · de but en blanc · prendre au dépourvu**.\nÀ-propos et aisance : **tomber à pic · sans coup férir**.',
        ),
        {
          table: {
            head: [b('Expression', 'Expression'), b('Meaning', 'Sens'), b('Origin & usage note', 'Origine et remarque')],
            rows: [
              ['à brûle-pourpoint', b('point-blank, abruptly, out of nowhere', 'brusquement, sans ménagement ni détour'), b('scorching the pourpoint (doublet); hyphen + û', 'brûler le pourpoint ; trait d’union + û')],
              ['de but en blanc', b('bluntly, straight out, without preamble', 'sans préambule, tout à coup et sans détour'), b('flat trajectory from sight (but) to target (blanc)', 'tir direct du but au blanc sans parabole')],
              ['tomber à pic', b('to arrive right in the nick of time', 'arriver précisément au bon moment'), b('vertical drop (à pic) hitting the exact mark', 'survenir à l’instant le plus opportun')],
              ['prendre au dépourvu', b('to catch off guard / unprepared', 'surprendre sans ressources ni préparation'), b('agrees when passive: pris(e) au dépourvu', 'accord passif : prise / pris au dépourvu')],
              ['sans coup férir', b('without striking a blow, effortlessly', 'sans rencontrer aucune résistance, sans combat'), b('singular coup; defective verb férir (“strike”)', 'coup au singulier ; verbe défectif férir')],
            ],
          },
          ex: [
            ['La journaliste lui a demandé à brûle-pourpoint s’il comptait démissionner dès le soir même.', 'The journalist asked him point-blank whether he intended to resign that very evening.'],
            ['Votre appel tombe à pic : nous achevions justement la relecture du contrat.', 'Your call comes right in the nick of time: we were just finishing proofreading the contract.'],
            ['Contre toute attente, l’amendement a été adopté sans coup férir en dix minutes.', 'Against all expectations, the amendment passed without a fight in ten minutes.'],
          ],
        },
      ),
      trap(
        b('Singular « coup », defective « férir », and « à brûle-pourpoint » vs « de but en blanc »', 'Singulier à « coup », verbe défectif « férir » et nuance d’attaque'),
        b(
          'Never pluralise **coup** in **sans coup férir** (always singular—without striking *even a single* blow!), and never try to conjugate **férir** (it survives only in this infinitive and the adjective *féru de*). Notice too the fine pairing: **à brûle-pourpoint** typically modifies a sudden question or confrontation aimed directly at someone, whereas **de but en blanc** often describes dropping an unvarnished announcement without polite softening (*Il m’a annoncé de but en blanc qu’il partait*).',
          'Ne mettez jamais **coup** au pluriel dans **sans coup férir** (pas même un seul coup !) et ne cherchez pas à conjuguer **férir**, verbe défectif figé dans cette locution (et dans *féru de*). Notez la nuance : **à brûle-pourpoint** qualifie surtout une question ou interpellation soudaine en face à face, tandis que **de but en blanc** décrit souvent une annonce abrupte lâchée sans préambule.',
        ),
      ),
      flash(
        b('Precision & surprise', 'Soudaineté et à-propos'),
        [
          ['à brûle-pourpoint', b('point-blank, abruptly, without warning', 'de manière soudaine et directe, sans prévenir')],
          ['de but en blanc', b('bluntly, flatly, without preamble', 'sans transition ni précaution oratoire')],
          ['tomber à pic', b('to arrive in the nick of time', 'survenir au moment exactement opportun')],
          ['prendre au dépourvu', b('to catch off guard, unprepared', 'surprendre quelqu’un sans qu’il soit prêt')],
          ['sans coup férir', b('without striking a blow, effortlessly', 'sans combat, sans rencontrer d’opposition')],
        ],
      ),
      mc(
        P.meaning,
        [
          b('The bill passed effortlessly without meeting any real resistance.', 'Le projet a été adopté sans rencontrer la moindre opposition.'),
          b('The bill passed only after violent clashes in the chamber.', 'Le projet a été voté après de vifs affrontements dans l’hémicycle.'),
          b('The bill was rejected repeatedly before any vote could happen.', 'Le projet a été repoussé à plusieurs reprises avant le vote.'),
          b('The bill struck every opponent heavily on the first day.', 'Le projet a frappé durement tous ses adversaires dès le premier jour.'),
        ],
        {
          fr: 'Contre toute prévision, la nouvelle charte a été ratifiée sans coup férir.',
          explain: b('Férir means “to strike”; sans coup férir means achieving something without a single blow or fight.', 'Férir signifie « frapper » ; sans coup férir veut dire sans lutte ni résistance.'),
        },
      ),
      mc(
        P.spelling,
        [
          'Il m’a posé la question à brûle-pourpoint et sans coup férir.',
          'Il m’a posé la question à brule-pourpoing et sans coups férir.',
          'Il m’a posé la question à brûle-pourpoint et sans coups férirs.',
          'Il m’a posé la question de brûle-pourpoint et sans coup férir.',
        ],
        {
          explain: b('Write à brûle-pourpoint (circumflex û, hyphen, final -t) and sans coup férir (singular coup, -ir).', 'Écrivez à brûle-pourpoint (accent circonflexe û, trait d’union, -t final) et sans coup férir (coup singulier).'),
        },
      ),
      sort(
        b('Sudden shock / bluntness, or lucky timing / smooth ease?', 'Choc soudain / brusquerie, ou moment idéal / victoire sans effort ?'),
        [b('Abrupt shock or catching off guard', 'Brusquerie ou surprise'), b('Perfect timing or effortless ease', 'Juste à-propos ou aisance')],
        [
          ['à brûle-pourpoint', 0],
          ['tomber à pic', 1],
          ['de but en blanc', 0],
          ['sans coup férir', 1],
          ['prendre au dépourvu', 0],
          ['survenir précisément quand on a besoin d’aide', 1],
        ],
        { explain: b('Three idioms evoke abruptness or unpreparedness; tomber à pic and sans coup férir convey ideal timing and unopposed ease.', 'Trois locutions expriment la brusquerie ou l’impréparation ; tomber à pic et sans coup férir expriment l’opportunité et la facilité.') },
      ),
      gap(
        P.complete,
        'Il m’a posé cette question à ___-pourpoint, puis a annoncé sa démission de ___ en blanc et s’est imposé sans coup ___.',
        ['brûle', 'but', 'férir'],
        {
          tr: 'He asked me that question point-blank, then announced his resignation bluntly out of nowhere and won without striking a blow.',
          hint: b('Verb stem with circumflex (brûle), sighting noun (but), and archaic infinitive (férir).', 'Verbe avec accent circonflexe (brûle), nom de visée (but) et infinitif archaïque (férir).'),
          explain: b('à brûle-pourpoint, de but en blanc, sans coup férir.', 'à brûle-pourpoint, de but en blanc, sans coup férir.'),
        },
      ),
      ord(
        P.order,
        'Votre arrivée tombe à pic et ne nous prend pas au dépourvu.',
        {
          tr: 'Your arrival comes right in the nick of time and does not catch us off guard.',
          extra: ['dépourvue', 'tombent'],
          explain: b('Singular subject Votre arrivée governs tombe and prend; dépourvu stays masculine in au dépourvu.', 'Le sujet singulier Votre arrivée régit tombe et prend ; au dépourvu reste invariable.'),
        },
      ),
      hear(
        'Le directeur s’attendait à un simple point d’étape ; quand la cliente a exigé de but en blanc une renégociation complète du contrat, il a été manifestement pris au dépourvu.',
        b('How did the director react to the client’s demand?', 'Comment le directeur a-t-il réagi à la demande de la cliente ?'),
        [
          b('He was caught completely off guard because she demanded it abruptly without preamble.', 'Il a été surpris sans y être préparé devant cette exigence brutale et sans préambule.'),
          b('He welcomed her arrival right on schedule with all revised contracts ready.', 'Il a salué son arrivée au moment parfait avec les nouveaux contrats prêts.'),
          b('He settled the renegotiation immediately without any discussion.', 'Il a bouclé la renégociation sur-le-champ sans aucune discussion.'),
        ],
        {
          voice: 'f2',
          explain: b('De but en blanc marks a blunt, sudden demand; pris au dépourvu means caught unprepared.', 'De but en blanc marque la brusquerie sans préambule ; pris au dépourvu signifie surpris sans préparation.'),
        },
      ),
      say(
        'Interrogée à brûle-pourpoint, elle n’a pas été prise au dépourvu et a convaincu le jury sans coup férir.',
        'Questioned point-blank, she wasn’t caught off guard and won the panel over without breaking a sweat.',
      ),
    ],
    [
      b('À brûle-pourpoint (point-blank question/attack) & de but en blanc (blunt, unvarnished announcement).', 'À brûle-pourpoint (interpellation directe) et de but en blanc (annonce abrupte sans préambule).'),
      b('Tomber à pic = arrive in the nick of time; prendre au dépourvu = catch unprepared.', 'Tomber à pic = arriver au moment idéal ; prendre au dépourvu = surprendre sans préparation.'),
      b('Sans coup férir (singular coup, defective verb férir) = without resistance or a fight.', 'Sans coup férir (coup au singulier, verbe défectif férir) = sans combat ni résistance.'),
    ],
    [
      ['à brûle-pourpoint', b('point-blank, abruptly, without warning', 'de manière soudaine et directe, sans prévenir')],
      ['de but en blanc', b('bluntly, flatly, without preamble', 'sans transition ni précaution oratoire')],
      ['tomber à pic', b('to arrive in the nick of time', 'survenir au moment exactement opportun')],
      ['prendre au dépourvu', b('to catch off guard, unprepared', 'surprendre quelqu’un sans qu’il soit prêt')],
      ['sans coup férir', b('without striking a blow, effortlessly', 'sans combat, sans rencontrer d’opposition')],
    ],
  ),

  lesson(
    C,
    3,
    ['refined-figurative-gems-c2', 'perles-rares-et-contresens-c2'],
    b('Refined figurative gems & the « faire long feu » trap', 'Perles rares et le véritable sens de « faire long feu »'),
    b('Spot the classic misfire confusion on faire long feu and master prêter le flanc, tourner court and faire florès.', 'Déjouer le contresens courant sur faire long feu et manier prêter le flanc, tourner court et faire florès.'),
    [
      b('Use faire long feu in its true meaning (“to misfire, fail, come to nothing”)', 'Employer faire long feu dans son vrai sens (« rater, avorter, échouer »)'),
      b('Deploy prêter le flanc à la critique and ménager la susceptibilité with precision', 'Manier prêter le flanc à la critique et ménager la susceptibilité avec tact'),
      b('Distinguish tourner court (fizzle/stop abruptly) from faire florès (enjoy brilliant success)', 'Opposer tourner court (avorter brusquement) et faire florès (connaître un vif succès)'),
    ],
    13,
    [
      card(
        b('Five rare C2 gems — and one famous native trap', 'Cinq perles rares — et un piège célèbre'),
        b(
          'Mastering these five idioms marks true C2 command: **faire long feu** (**to misfire, fail, fizzle out**—NOT to last long!), **prêter le flanc à la critique** (to lay oneself open to criticism), **ménager la susceptibilité** (to spare someone’s touchy pride), **tourner court** (to break off abruptly before reaching fruition), and **faire florès** (to flourish brilliantly, be all the rage).\nFailure & abrupt ends: **faire long feu · tourner court**.\nCriticism, tact & triumph: **prêter le flanc à la critique · ménager la susceptibilité · faire florès**.',
          'Ces cinq tournures signent une maîtrise C2 accomplie : **faire long feu** (**échouer, rater son effet, avorter** — et NON « durer longtemps » !), **prêter le flanc à la critique** (offrir une prise facile aux reproches), **ménager la susceptibilité** (éviter de froisser la fierté d’autrui), **tourner court** (s’interrompre brusquement sans aboutir) et **faire florès** (connaître un succès éclatant, faire recette).\nÉchec et coupure : **faire long feu · tourner court**.\nCritique, tact et éclat : **prêter le flanc à la critique · ménager la susceptibilité · faire florès**.',
        ),
        {
          table: {
            head: [b('Expression', 'Expression'), b('True meaning', 'Sens exact'), b('C2 origin & grammar note', 'Origine et remarque C2')],
            rows: [
              ['faire long feu', b('to misfire, fail, fall flat, fizzle out', 'rater son coup, avorter, échouer'), b('slow-burning flintlock priming = failed shot!', 'amorce lente d’arme à feu = coup raté !')],
              ['prêter le flanc à la critique', b('to lay oneself open to criticism', 'donner prise aux critiques, exposer sa faiblesse'), b('leaving a military flank exposed; also aux soupçons', 'exposer son flanc ; aussi aux soupçons')],
              ['ménager la susceptibilité', b('to spare someone’s sensitivity / touchiness', 'éviter de blesser l’amour-propre de quelqu’un'), b('followed by de + person / group', 'suivi de de + personne ou groupe')],
              ['tourner court', b('to come to an abrupt stop, fall flat', 's’arrêter net avant d’aboutir'), b('court is an invariable adverb here!', 'court reste adverbe invariable ici !')],
              ['faire florès', b('to flourish, be a huge hit, be all the rage', 'connaître un vif succès, faire recette'), b('Latin flores; pronounce final -s [flɔʁɛs]!', 'du latin flores ; prononcer le -s [flɔʁɛs] !')],
            ],
          },
          ex: [
            ['Annoncée à grand bruit, cette mode éphémère a finalement fait long feu en six mois.', 'Heralded with great fanfare, that passing fad ultimately misfired within six months.'],
            ['En publiant des chiffres non vérifiés, le rapport prête inutilement le flanc à la critique.', 'By publishing unverified figures, the report needlessly lays itself open to criticism.'],
            ['L’entretien a tourné court dès que le médiateur a cessé de ménager la susceptibilité des deux parties.', 'The meeting broke off abruptly as soon as the mediator stopped sparing both sides’ touchy pride.'],
          ],
        },
      ),
      culture(
        b('Why « faire long feu » means TO FAIL — NOT “to last long”', 'Pourquoi « faire long feu » veut dire ÉCHOUER'),
        b(
          'In 17th–18th-century firearms, gunpowder had to ignite instantly. When damp priming powder burned slowly—**faisait long feu**—the shot failed or misfired! So **ce projet a fait long feu** strictly means **the project failed / fizzled out**. Modern speakers frequently misuse *ne pas faire long feu* to mean “not last long” (confusing *feu* with duration): the Académie française reminds C2 writers that **faire long feu = to misfire/fail**, whereas “not to last long” is simply *ne pas faire long usage* or *ne pas durer*. Also remember to pronounce the final **-s** in **faire florès** (*[flɔʁɛs]*), and keep **court** invariable in *Les négociations ont tourné court*.',
          'Dans les anciennes armes à feu, la poudre devait s’enflammer d’un coup sec. Si l’amorce brûlait lentement — elle **faisait long feu** —, le coup ratait ! Ainsi, **ce projet a fait long feu** signifie exactement **il a avorté, il a raté son effet**. Beaucoup emploient à tort *ne pas faire long feu* au sens de « ne pas durer longtemps » : l’Académie française rappelle que **faire long feu = échouer**. Prononcez aussi le **-s** final de **faire florès** (*[flɔʁɛs]*), et laissez **court** invariable (*Les discussions ont tourné court*).',
        ),
      ),
      mc(
        P.meaning,
        [
          b('The campaign fizzled out and failed to achieve its goal.', 'La campagne a échoué et n’a pas produit l’effet espéré.'),
          b('The campaign lasted for decades with enduring success.', 'La campagne a duré de longues années avec un succès constant.'),
          b('The campaign provoked a devastating fire in the headquarters.', 'La campagne a déclenché un vaste incendie au siège.'),
          b('The campaign took ages to prepare before launching triumphantly.', 'La campagne a exigé une longue préparation avant de triompher.'),
        ],
        {
          fr: 'Lancée sans préparation sérieuse, cette tentative de boycott a fait long feu.',
          explain: b('In proper C2 French, faire long feu comes from misfiring gunpowder and means to fail or fizzle out—never “to last long”!', 'Au sens propre et soutenu, faire long feu vient d’une amorce qui rate et signifie échouer, faire fiasco !'),
        },
      ),
      pairs(
        P.match,
        [
          ['faire long feu', b('to misfire, fail, fizzle out (NOT last long!)', 'échouer, rater son effet, avorter')],
          ['prêter le flanc à la critique', b('to lay oneself open to criticism', 'donner prise aux reproches')],
          ['ménager la susceptibilité', b('to spare someone’s touchy pride', 'éviter de blesser l’amour-propre')],
          ['tourner court', b('to stop abruptly, come to nothing', 's’interrompre net sans aboutir')],
          ['faire florès', b('to flourish, enjoy dazzling success', 'connaître un succès brillant, être en vogue')],
        ],
      ),
      hear(
        'Alors que son premier roman avait fait florès dans toute la francophonie, sa pièce suivante a prêté le flanc à la critique dès la générale, et la tournée prévue a tourné court.',
        b('How did the author’s second work compare with her first novel?', 'Comment sa deuxième œuvre se compare-t-elle à son premier roman ?'),
        [
          b('After her hit novel, the play drew easy criticism and its tour was cut short.', 'Après le vif succès du roman, la pièce a prêté le flanc aux reproches et la tournée s’est arrêtée net.'),
          b('Both her novel and her play achieved massive international acclaim.', 'Le roman comme la pièce ont connu un triomphe mondial égal.'),
          b('Her first novel failed abruptly while the play succeeded without critics.', 'Son premier roman a tourné court tandis que la pièce a fait florès.'),
        ],
        {
          voice: 'm2',
          explain: b('Faire florès = dazzling hit; prêter le flanc à la critique = open to attack; tourner court = cut short.', 'Faire florès = vif succès ; prêter le flanc à la critique = s’exposer ; tourner court = s’arrêter net.'),
        },
      ),
      dlg(
        b('Post-mortem of a cancelled cultural initiative', 'Bilan d’une initiative culturelle avortée'),
        b('Margaux and Olivier dissect why a promising civic forum collapsed while another thrived.', 'Margaux et Olivier analysent pourquoi un forum prometteur a capoté tandis qu’un autre triomphait.'),
        [['Margaux', 'f'], ['Olivier', 'm2']],
        [
          [0, 'Le premier projet de plateforme citoyenne semblait pourtant promis à un bel avenir… Pourquoi s’est-il arrêté si vite ?', 'Yet the first civic platform project seemed bound for a bright future… Why did it end so fast?'],
          [1, {
            options: [
              'Soyons lucides : sa gouvernance opaque prêtait le flanc à la critique, si bien que l’initiative a fait long feu en trois mois.',
              'Oui, il a fait long feu pendant dix années glorieuses avant de fermer.',
              'Oui, il a fait florès parce que la plateforme a tourné court.',
            ],
            explain: b('Prêter le flanc à la critique + faire long feu accurately expresses drawing fire and fizzling out/failing.', 'Prêter le flanc à la critique et faire long feu expriment exactement la vulnérabilité suivie de l’échec.'),
          }],
          [0, 'Et la réunion de conciliation de mardi avec les élus municipaux, qu’a-t-elle donné ?', 'And Tuesday’s reconciliation meeting with city councillors—how did it go?'],
          [1, {
            options: [
              'Elle a tourné court : personne n’a voulu ménager la susceptibilité du président, qui a claqué la porte.',
              'Elle a pris au dépourvu sans coup férir en ménageant la critique.',
              'Elle a fait florès dès la cinquième minute en coupant la porte.',
            ],
            explain: b('Breaking off abruptly because nobody spared a touchy ego is tourner court + ménager la susceptibilité.', 'S’interrompre net faute d’avoir ménagé l’amour-propre d’un participant = tourner court + ménager la susceptibilité.'),
          }],
          [0, 'À l’inverse, l’atelier voisin mené par les bibliothécaires fait florès depuis l’automne !', 'By contrast, the neighbouring workshop led by the librarians has been thriving brilliantly since autumn!'],
          [1, 'Preuve qu’une méthode transparente et respectueuse ne manque jamais de porter ses fruits.', 'Proof that a transparent, respectful approach never fails to bear fruit.'],
        ],
      ),
      dict(
        'Le projet a fait long feu parce qu’il prêtait le flanc à la critique.',
        {
          voice: 'f',
          hint: b('Watch the circumflex on prêtait and the singular flanc (silent -c).', 'Attention à l’accent circonflexe de prêtait et au -c muet de flanc.'),
        },
      ),
      write(
        b('C2 cultural & institutional review', 'Chronique critique de niveau C2'),
        b('In 100–160 words, write a sharp critical review comparing a public or artistic venture that misfired with one that succeeded brilliantly. Use at least four rare C2 idioms from this course accurately—and make sure faire long feu reflects its true meaning.', 'En 100 à 160 mots, rédigez une chronique critique comparant une initiative publique ou culturelle qui a avorté à une autre qui a triomphé. Employez avec justesse au moins quatre expressions rares de ce cours — dont faire long feu dans son sens authentique.'),
        100,
        160,
        [
          b('At least four C2 idioms from this course used with exact spelling and grammar', 'Au moins quatre expressions C2 du cours sans faute de graphie ni de syntaxe'),
          b('Faire long feu used strictly in its true sense (“misfire / fail”)', 'Faire long feu employé uniquement au sens authentique (« échouer, avorter »)'),
          b('Cohesive C2 contrast between failure and durable success', 'Contraste maîtrisé entre fiasco et réussite éclatante'),
        ],
        'Annoncée à grands renforts de communication, la dernière réforme des musées municipaux a pourtant fait long feu dès le premier semestre. En imposant de but en blanc une tarification uniforme sans consulter les conservateurs, la tutelle a pris les équipes au dépourvu et prêté le flanc à la critique sur la question de l’accès des jeunes publics. Lorsque les syndicats sont montés au créneau, la réunion de médiation a tourné court, faute d’avoir su ménager la susceptibilité des directions locales. À l’inverse, la biennale d’architecture lancée par trois villes voisines fait florès sans coup férir : preuve qu’un projet préparé dans l’écoute résiste mieux aux secousses qu’un coup d’éclat improvisé.',
        {
          phrases: ['a fait long feu', 'de but en blanc', 'prêté le flanc à la critique', 'a tourné court', 'fait florès'],
          modelNote: b('Notice how faire long feu strictly means “fizzled out / misfired”, contrasting crisply with fait florès (“is thriving brilliantly”).', 'Remarquez l’opposition exacte entre faire long feu (échouer, faire long feu) et faire florès (connaître un vif succès).'),
        },
      ),
    ],
    [
      b('Faire long feu means TO FAIL / MISFIRE (from slow-burning gun priming), never “to last long”.', 'Faire long feu signifie ÉCHOUER, rater son effet (jamais « durer longtemps »).'),
      b('Prêter le flanc à la critique = leave oneself open to attack; ménager la susceptibilité = spare touchy pride.', 'Prêter le flanc à la critique = exposer ses faiblesses ; ménager la susceptibilité = épargner l’amour-propre.'),
      b('Tourner court (invariable court) = stop abruptly; faire florès (pronounce -s [flɔʁɛs]) = thrive brilliantly.', 'Tourner court (court invariable) = s’arrêter net ; faire florès (prononcer [flɔʁɛs]) = faire recette.'),
    ],
    [
      ['faire long feu', b('to misfire, fail, fizzle out (NOT last long!)', 'échouer, rater son effet, avorter')],
      ['prêter le flanc à la critique', b('to lay oneself open to criticism', 'donner prise aux reproches')],
      ['ménager la susceptibilité', b('to spare someone’s touchy pride', 'éviter de blesser l’amour-propre')],
      ['tourner court', b('to stop abruptly, come to nothing', 's’interrompre net sans aboutir')],
      ['faire florès', b('to flourish, enjoy dazzling success', 'connaître un succès brillant, être en vogue')],
    ],
  ),
];

export default lessons;
