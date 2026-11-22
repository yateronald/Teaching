import type { CourseAbout, Lesson } from '../../types';
import { P, b, card, dict, dlg, gap, hear, lesson, mc, ord, pairs, sort } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Move effortlessly across sociolinguistic registers at C2: transpose identical ideas across spontaneous spoken French, clean neutral journalism, formal administrative/academic style, and literary prose.',
    'Naviguer avec aisance entre les registres du français au niveau C2 : transposer une même pensée du français oral spontané au style courant, soutenu ou littéraire sans faute de ton.',
  ),
  outcomes: [
    b('Identify subtle register clashes (mismatching slang vocabulary with passé simple or est-ce que in formal briefs).', 'Repérer les ruptures de registre (mélanger oral spontané et syntaxe soutenue dans un même énoncé).'),
    b('Transpose questions, negations, relatives, and passives fluidly across three or four registers.', 'Transposer questions, négations, relatifs et tournures passives d’un registre à l’autre avec justesse.'),
    b('Choose natural contemporary spoken vs. formal phrasing depending on audience and medium.', 'Adapter syntaxe et lexique à l’auditoire (conversation vive, note professionnelle, discours officiel).'),
  ],
};

const lessons: Lesson[] = [
  lesson(
    'gr-register-syntax-shifts',
    1,
    ['oral-neutral-and-formal-questions-negation', 'registres-interrogation-et-negation-c2'],
    b('Questions, Negations & Pronouns Across Registers', 'Interrogation, négation et pronoms selon le registre'),
    b('See how spoken, standard, and high-formal French reshape questions, ne-drop, ça vs. cela, and on vs. nous.', 'Maîtriser les écarts syntaxiques systématiques entre oral spontané, français standard et style soutenu.'),
    [
      b('Contrast spoken omission of ne / in-situ question words against neutral est-ce que and formal inversion.', 'Opposer l’oral spontané (omission de ne, mot final) au standard et à l’inversion soutenue.'),
      b('Avoid jarring hybrids like mixing *t’as* or *le mec* with formal *dont il s’agit* or subjunctive inversions.', 'Éviter les fautes d’homogénéité stylistique (télescopages de registres).'),
    ],
    13,
    [
      card(
        b('French grammar transforms deeply by register', 'Quand le niveau de langue transforme la syntaxe'),
        b(
          'At C2, register is **structural**, not merely lexical (*bagnole* vs. *voiture*). Spoken French drops **ne**, prefers **ça** over **cela**, places question words *in situ* (**Tu rentres quand ?**), and relies on **on**. Neutral journalism restores **ne**, uses **est-ce que** or clean SVO, and uses **cela**. Formal/literary style inverts questions (**Quand part-il ?**), favours **nous** or **l’on**, and retains **ne… guère / ne seul**.\nSpoken syntax: **J’en sais rien, Tu fais quoi ?, C’est qui qui vient ?, Faut voir**.\nNeutral standard: **Je n’en sais rien, Qu’est-ce que tu fais ?, Qui vient ?, Il faut voir**.\nElevated formal: **Je l’ignore, Que faites-vous ?, Qui donc viendra ?, Il convient d’examiner**.',
          'Au niveau C2, le registre est avant tout **syntaxique**. L’oral courant élide **ne**, dit **ça**, laisse le mot interrogatif en fin de phrase (**Tu pars où ?**) et généralise **on**. Le registre standard rétablit **ne**, **cela** et **est-ce que**. Le registre soutenu préfère l’**inversion**, **nous / l’on** et des verbes synthétiques.\nOral spontané : **T’as vu ça ?, C’est quoi ce truc ?, Faut pas croire**.\nFrançais standard : **As-tu vu cela ?, Qu’est-ce que c’est ?, Il ne faut pas croire**.\nStyle soutenu : **Avez-vous observé ce fait ?, De quoi s’agit-il ?, Garde-toi de croire**.',
        ),
        {
          table: {
            head: [b('Feature', 'Trait'), b('Spoken (Familier)', 'Oral spontané'), b('Neutral (Courant)', 'Courant'), b('Formal (Soutenu / C2)', 'Soutenu / C2')],
            rows: [
              [b('Question', 'Question'), 'Tu viens pourquoi ?', 'Pourquoi est-ce que tu viens ?', 'Pour quelle raison venez-vous ?'],
              [b('Negation', 'Négation'), 'J’y comprends rien.', 'Je n’y comprends rien.', 'Je n’en saisis nullement le sens.'],
              [b('Demonstrative', 'Démonstratif'), 'Ça change pas mal de choses.', 'Cela change beaucoup de choses.', 'Ce fait modifie profondément la donne.'],
              [b('Subject', 'Sujet'), 'On s’y perd un peu.', 'Nous nous y perdons un peu.', 'L’on s’y égare aisément.'],
            ],
          },
          ex: [
            ['Tu sais pas où ils sont passés, par hasard ?', 'You don’t happen to know where they went, do you?'],
            ['Savez-vous où ils ont bien pu se rendre ?', 'Do you happen to know where they could have gone?'],
            ['L’on ignore encore vers quelle issue s’orientent les pourparlers.', 'One still does not know toward what outcome the talks are heading.'],
          ],
        },
      ),
      mc(
        P.best,
        [
          b('Qu’est-ce qu’il vous a répondu ? (courant) ↔ Quelle fut sa réponse ? (soutenu)', 'Qu’est-ce qu’il vous a répondu ? (courant) ↔ Quelle fut sa réponse ? (soutenu)'),
          b('Qu’est-ce que tu lui as répondu, toi ? (soutenu) ↔ Répondis-je quoi ? (oral)', 'Qu’est-ce que tu lui as répondu, toi ? (soutenu) ↔ Répondis-je quoi ? (oral)'),
          b('L’on ne comprend guère ça (oral) ↔ T’as pigé ce dont il s’agit ? (littéraire)', 'L’on ne comprend guère ça (oral) ↔ T’as pigé ce dont il s’agit ? (littéraire)'),
        ],
        { explain: b('Never mix informal ça or t’as pigé with literary l’on ne… guère or ce dont.', 'Veillez à ne jamais croiser un lexique ou une syntaxe familière (ça, t’as) avec des marques littéraires (l’on, guère).') },
      ),
      sort(
        P.sort,
        [b('Spontaneous oral', 'Oral spontané'), b('Standard neutral', 'Français standard'), b('Formal / Literary', 'Soutenu / Littéraire')],
        [
          ['T’as pas vu mon dossier par hasard ?', 0],
          ['Est-ce que tu as vu mon dossier ?', 1],
          ['Aurais-tu par hasard aperçu mon dossier ?', 2],
          ['C’est pas possible de faire autrement.', 0],
          ['Il n’est guère possible d’agir autrement.', 2],
          ['On ne peut pas agir autrement.', 1],
        ],
      ),
      gap(
        b('Transpose the informal spoken line into clean C2 formal French.', 'Transposez la réplique familière en style soutenu homogène.'),
        'Oral : « Ça sert à rien d’insister, ils veulent rien entendre. » → Soutenu : « ___ (Cela / Il) ___ (être) vain d’insister, car ils ___ (rester, pluriel) sourds à tout argument. »',
        ['Il', 'est', 'demeurent'],
        {
          choices: [['Il', 'Ça', 'On'], ['est', 'sert', 'va'], ['demeurent', 'veulent rien', 'disent']],
        },
      ),
    ],
    [
      b('Maintain strict syntactic consistency within a single sentence: never mix dropped ne or ça with l’on or guère.', 'Maintenez une stricte homogénéité : ne mélangez jamais élision orale et formes littéraires.'),
      b('Spoken French shifts interrogatives rightwards; neutral uses est-ce que; formal relies on inversion.', 'La question se place en fin d’énoncé à l’oral, passe par est-ce que en courant et par l’inversion en soutenu.'),
    ],
    [
      ['l’on (euphonique / soutenu)', 'one (elevated form of on)'],
      ['demeurer sourd à', 'to turn a deaf ear to'],
      ['il est vain de', 'it is futile to'],
    ],
  ),

  lesson(
    'gr-register-syntax-shifts',
    2,
    ['relatives-and-subordination-across-registers', 'relatives-et-subordonnees-selon-registre'],
    b('Relatives, Spoken Parataxis vs. Formal Subordination', 'Relatives, parataxe orale et subordination soutenue'),
    b('Recognise spoken “que omnibus” pitfalls while mastering elegant C2 syntactic alternatives.', 'Repérer les écueils du relatif oral et savoir choisir entre parataxe vivante et subordination fluide.'),
    [
      b('Correct spoken non-standard relatives (*la fille que je te parle* ❌ → *la fille dont je te parle* ✅) cleanly.', 'Corriger les relatives décumulées familières grâce à dont, auquel et où.'),
      b('Know when spoken French prefers short juxtaposed clauses (parataxis) where formal prose builds tight participles or infinitives.', 'Savoir quand opposer parataxe orale vive et participe/infinitif synthétique à l’écrit.'),
    ],
    13,
    [
      card(
        b('How spoken and formal French link clauses differently', 'Parataxe orale ou hiérarchie soutenue ?'),
        b(
          'In rapid speech, French prefers **juxtaposition** (**Il a plu ; on est rentrés**) or **que** as a universal filler (**Le jour que je suis venu** ❌ instead of **où**; **La personne que j’ai besoin** ❌ instead of **dont**). Standard and formal prose replace that informal shortcut with **dont / auquel / où**, and condense side actions via **participles** or **préposition + infinitive**.\nSpoken shortcut to fix: **c’est ça que j’ai peur, le gars que je lui ai parlé**.\nNeutral correction: **c’est de cela que j’ai peur, la personne à qui j’ai parlé**.\nFormal synthesis: **ce que je redoute par-dessus tout, l’interlocuteur auquel je me suis adressé**.',
          'À l’oral rapide, on juxtapose sans connecteur (*J’ai appelé, il répondait pas*) ou l’on recourt au **que passe-partout** (*le moment que je l’ai vu* ❌ au lieu de **où** ; *le livre que j’ai besoin* ❌ au lieu de **dont**). En standard et en soutenu, on rétablit la relative exacte (**dont, auquel, où**) et l’on condense par **infinitif** ou **participe**.\nRaccourci oral à corriger : **la ville que je viens, le moment que j’arrive**.\nCorrection standard : **la ville d’où je viens, le moment où j’arrive**.\nSynthèse C2 : **ma ville d’origine, dès mon arrivée sur place**.',
        ),
        {
          ex: [
            ['La question dont il est fait mention figure en annexe.', 'The issue that is mentioned appears in the appendix.'],
            ['L’année où nous avons lancé cette revue reste mémorable.', 'The year when we launched this journal remains memorable.'],
            ['À peine arrivé à destination, il s’est mis au travail.', 'Hardly had he arrived at his destination than he set to work.'],
          ],
        },
      ),
      hear(
        'Le projet auquel nous tenons le plus n’a pas encore obtenu l’agrément.',
        P.listen,
        [
          b('Correct standard/formal relative replacing spoken *le projet qu’on y tient*.', 'Forme soignée remplaçant la tournure relâchée « le projet qu’on tient beaucoup ».'),
          b('An informal regional idiom used only in dialogue.', 'Expression exclusivement familière à éviter à l’écrit.'),
          b('An ungrammatical sentence requiring dont.', 'Phrase fautive où il faudrait remplacer auquel par dont.'),
        ],
      ),
      pairs(
        P.match,
        [
          ['Le dossier qu’on en a besoin (oral relâché)', b('Le dossier dont nous avons besoin (standard)', 'Le dossier dont nous avons besoin (standard)')],
          ['La personne que je lui ai écrit (oral relâché)', b('La personne à qui / à laquelle j’ai écrit', 'La personne à qui / à laquelle j’ai écrit')],
          ['L’époque qu’on vivait là-bas (oral relâché)', b('L’époque où nous vivions là-bas', 'L’époque où nous vivions là-bas')],
          ['J’arrive à la gare, le train partait déjà (parataxe)', b('À mon arrivée en gare, le train s’ébranlait déjà.', 'À mon arrivée en gare, le train s’ébranlait déjà.')],
        ],
      ),
      mc(
        P.best,
        [
          b('Voici l’argument sur lequel repose toute sa démonstration.', 'Voici l’argument sur lequel repose toute sa démonstration.'),
          b('Voici l’argument que toute sa démonstration repose dessus.', 'Voici l’argument que toute sa démonstration repose dessus.'),
          b('Voici l’argument dont toute sa démonstration repose sur lui.', 'Voici l’argument dont toute sa démonstration repose sur lui.'),
        ],
      ),
      gap(
        b('Elevate the spoken sentence cleanly into neutral or formal written French.', 'Transposez vers un français écrit irréprochable.'),
        'Oral : « Le collègue que je t’ai parlé, il part demain. » → Écrit : « Le collègue ___ je t’ai entretenu ___ demain. »',
        ['dont', 'part'],
        {
          choices: [['dont', 'que', 'duquel'], ['part', 'il part', 'partent']],
          explain: b('Entretenir quelqu’un de → dont ; remove redundant spoken pronoun il after the subject noun.', 'On entretient quelqu’un de quelque chose (dont) et l’on supprime le pronom de reprise superflu il.'),
        },
      ),
    ],
    [
      b('Replace informal *que… dessus / que… en / que… lui* with standard **sur lequel / dont / à qui**.', 'Remplacez toujours le que familier décumulé par dont, où, à qui ou sur lequel.'),
      b('Drop redundant spoken subject pronouns (*Mon frère, il…*) in standard and formal writing.', 'Supprimez la reprise pronominale superflue (Mon frère, il…) hors du dialogue familier.'),
    ],
    [
      ['la parataxe', 'juxtaposition without explicit subordinator'],
      ['le décumul du relatif', 'colloquial “que + pronoun” relative pattern'],
      ['entretenir quelqu’un de', 'to speak with someone about (formal)'],
    ],
  ),

  lesson(
    'gr-register-syntax-shifts',
    3,
    ['register-matching-and-tone-calibration', 'adaptation-registre-et-justesse-c2'],
    b('Matching Syntax to Medium: Dialogue vs. Speech vs. Brief', 'Justesse du registre : dialogue vivant, discours et note écrite'),
    b('Avoid sounding stiff in dialogue or casual in briefs: calibrate French syntax seamlessly to context at C2.', 'Éviter autant le pédantisme hors de propos que le relâchement dans une note ou une prise de parole C2.'),
    [
      b('Recognise where overly literary grammar (*nous partîmes*, *eussiez-vous souhaité*) rings comic or pompous in everyday speech.', 'Sentir quand un tour trop littéraire devient déplacé ou affecté à l’oral contemporain.'),
      b('Select the precise medium-fit formulation across podcast interview, workplace email, and diplomatic speech.', 'Choisir la tournure exacte selon le support : entretien oral, courriel pro ou allocution.'),
    ],
    13,
    [
      card(
        b('C2 mastery means hitting the right key — not always the highest key', 'Le niveau C2, c’est la justesse, pas l’emphase'),
        b(
          'True C2 fluency is **register agility**: knowing both **what belongs in an official report** AND **what sounds natural over dinner**. Using *passé simple* or *nous fûmes* at a café sounds ironic or absurd; conversely, writing *du coup, c’est un peu chaud* in an executive brief ruins authority.\nSpoken authentic (podcast/café): **Franchement, je ne m’y attendais pas ; on verra comment ça évolue**.\nProfessional / diplomatic email: **Cette évolution nous surprend quelque peu ; nous resterons attentifs à la suite**.\nSolemn / literary essay: **Nul n’eût prédit un tel infléchissement, dont l’avenir dira s’il perdure**.',
          'Maîtriser le niveau C2 ne signifie pas parler comme un manuel du XIXe siècle en toute circonstance ! C’est savoir **ajuster la syntaxe** au contexte : dire *Nous partîmes* au bistrot prête à rire, mais glisser *du coup* ou *genre* dans un mémoire universitaire ruine la crédibilité.\nOral authentique (débat/café) : **Honnêtement, je ne pensais pas que ça irait si vite ; on va voir**.\nCourriel pro / note soignée : **Cette accélération nous surprend ; nous suivrons l’évolution avec attention**.\nEssai / discours solennel : **Nul n’avait mesuré une telle accélération, dont l’issue demeure ouverte**.',
        ),
        {
          ex: [
            ['On se tient au courant dès qu’on a du nouveau, ça marche ?', 'We’ll keep each other posted as soon as there’s news, sound good?'],
            ['Nous ne manquerons pas de vous informer dès réception des éléments définitifs.', 'We will be sure to inform you upon receipt of the final details.'],
            ['Il appartiendra à l’histoire de juger la portée véritable de ce renoncement.', 'It will be for history to judge the true significance of this renunciation.'],
          ],
        },
      ),
      dlg(
        b('Calibrating tone for three audiences', 'Adapter son registre à trois auditoires'),
        b('A communications director checks three versions of one message before release.', 'Un directeur de la communication vérifie trois versions d’une même annonce.'),
        [['Chloé', 'f2'], ['Antoine', 'm2']],
        [
          [0, 'Pour le message interne informel sur la messagerie d’équipe, on écrit « Il sied que nous reportions l’atelier » ?', 'For the casual internal team chat, should we write “Il sied que nous reportions l’atelier”?'],
          [1, {
            options: [
              'Surtout pas, ce serait grotesque ! Mets plutôt : « On va décaler l’atelier à jeudi, ça arrange tout le monde ? »',
              'Oui, « il sied que » met de la bonne humeur dans un chat d’équipe.',
              'Non, mets plutôt le passé simple « nous reportâmes ».',
            ],
            explain: b('Il sied que + subjunctive and passé simple sound archaic or mock-heroic in workplace chat; clean conversational on + futur proche fits naturally.', 'Il sied que ou le passé simple sonnent affectés dans une messagerie ; l’oral courant soigné est de mise.'),
          }],
          [0, 'Et pour le courrier formel adressé aux partenaires institutionnels ?', 'And for the formal letter sent to institutional partners?'],
          [1, {
            options: [
              '« En raison de contraintes d’agenda, nous sommes amenés à reporter notre séance de travail à jeudi. »',
              '« Du coup, la réunion de demain, on la décale à jeudi parce que ça coince. »',
              '« Eussions-nous disposé d’un jour de plus, nous ne l’eussions point reportée. »',
            ],
            explain: b('Clear professional passive/participial wording hits the exact right institutional note without archaic flourish.', 'Une tournure administrative claire et courtoise trouve exactement le ton juste.'),
          }],
        ],
      ),
      mc(
        P.best,
        [
          b('Tout porte à croire que le calendrier initial devra être ajusté.', 'Tout porte à croire que le calendrier initial devra être ajusté.'),
          b('Tout porte à croire que le calendrier initial va grave devoir bouger.', 'Tout porte à croire que le calendrier initial va grave devoir bouger.'),
          b('Du coup, tout porte à croire que, genre, le calendrier ne tiendra guère.', 'Du coup, tout porte à croire que, genre, le calendrier ne tiendra guère.'),
        ],
        { explain: b('Option 1 maintains seamless C1/C2 neutrality without conversational fillers (grave, du coup, genre).', 'La première phrase garde une parfaite unité de registre soutenu sans tics oraux.') },
      ),
      ord(
        P.order,
        'Il convient d’adapter votre syntaxe à l’auditoire sans jamais forcer le trait.',
        {
          tr: 'It is fitting to adapt your syntax to the audience without ever overdoing it.',
          extra: ['pas'],
        },
      ),
      dict('Il convient d’adapter son ton sans jamais tomber dans l’affectation.'),
    ],
    [
      b('C2 competence is precision across registers — formal where required, natural and lively in conversation.', 'La maîtrise C2 réside dans l’adéquation au contexte, non dans une préciosité permanente.'),
      b('Avoid jarring clashes (du coup / grave next to literary subjunctives, or passé simple in workplace chat).', 'Évitez tout télescopage entre tics oraux familiers et formes livresques.'),
    ],
    [
      ['sans forcer le trait', 'without overdoing it / hamming it up'],
      ['l’affectation (f.)', 'stiltedness, affectation'],
      ['nous sommes amenés à', 'we find it necessary to (polite official)'],
    ],
  ),
];

export default lessons;
