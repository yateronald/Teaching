// Level B2 — 10 upper-intermediate French dictations (~115–145 words each).
// Targets: pronominal past participles, verbal adjective vs present participle,
// advanced homophones (quoique/quoi que, plutôt/plus tôt, censé/sensé, quand/quant,
// davantage/d’avantage), quelque/quel que, adverb tout, compound nouns,
// participle + infinitive, collective agreements, DELF B2 / TCF precision.
import { b } from '../../types';
import type { DictationCourse } from './types';

export const B2_DICTATIONS: DictationCourse[] = [
  {
    id: 'la-semaine-de-quatre-jours',
    slug: 'la-semaine-de-quatre-jours',
    title: 'La semaine de quatre jours',
    subtitle: b(
      'As more companies experiment with a four-day week, managers weigh productivity against employee wellbeing.',
      'De plus en plus d’entreprises testent la semaine de quatre jours, entre gains de concentration et défis d’organisation.',
    ),
    level: 'B2',
    theme: b('Work & economy', 'Économie & travail'),
    focus: [
      b('Verbal adjective vs present participle', 'Adjectif verbal ou participe présent'),
      b('Subtle business agreements', 'Accords de synthèse B2'),
      b('Editorial vocabulary', 'Lexique économique'),
    ],
    image: 'text-four-day-week',
    minutes: 8,
    text: 'Depuis quelques années, l’expérimentation de la semaine de quatre jours suscite des débats passionnés dans le monde professionnel. Les premiers bilans publiés en Europe se montrent souvent convaincants, convainquant même des dirigeants autrefois sceptiques. En allégeant les réunions jugées superflues, de nombreuses équipes parviennent à maintenir un niveau d’exigence équivalent tout en réduisant l’épuisement chronique. Néanmoins, cette organisation exigeante ne convient pas uniformément à tous les secteurs : dans les hôpitaux ou les commerces de proximité, répartir les horaires sans négliger l’accueil du public demeure un exercice délicat. Plus qu’un simple aménagement du calendrier, cette réforme interroge notre rapport collectif à la performance et au temps libéré.',
    translation: 'Over the past few years, trials of the four-day week have sparked lively debate in the professional world. The first reports published in Europe often prove convincing, even persuading once-sceptical executives. By trimming meetings deemed unnecessary, many teams manage to maintain an equivalent standard while reducing chronic exhaustion. Nevertheless, this demanding arrangement does not suit every sector uniformly: in hospitals or neighbourhood shops, spreading shifts without neglecting customer service remains a delicate balancing act. More than a mere scheduling tweak, this reform questions our collective relationship to performance and free time.',
    blanks: ['expérimentation', 'passionnés', 'convaincants', 'convainquant', 'allégeant', 'superflues', 'épuisement', 'exigeante', 'hôpitaux', 'aménagement'],
    traps: [
      { word: 'convaincants / convainquant', note: b('Adjective convaincants uses c and agrees; present participle convainquant uses qu and stays invariable.', 'Adjectif verbal « convaincants » (c + accord) ; participe présent « convainquant » (qu, invariable).') },
      { word: 'exigeante / négliger', note: b('Feminine adjective exigeante keeps the e after g; infinitive négliger.', 'L’adjectif « exigeante » garde le e après le g pour le son [ʒ].') },
      { word: 'allégeant / réduisant', note: b('Gérondif en + -ant is invariable (keep e after g in allégeant).', 'Le gérondif est invariable ; gardez le e dans « allégeant ».') },
      { word: 'sceptiques / chronique', note: b('sc- in sceptiques; ch [k] in chronique.', 'sc- initial dans « sceptiques » ; ch prononcé [k] dans « chronique ».') },
      { word: 'hôpitaux / superflues', note: b('Circumflex ô and plural -aux in hôpitaux; feminine plural -ues on superflues.', 'Accent circonflexe et pluriel -aux dans « hôpitaux » ; féminin pluriel « superflues ».') },
    ],
    rules: [
      {
        title: b('Verbal adjective (-cant) vs present participle (-quant)', 'Adjectif verbal ou participe présent (-cant / -quant)'),
        body: b(
          'A verbal adjective describes a quality and agrees (des bilans convaincants); a present participle expresses an action with an object and stays invariable (convainquant même des dirigeants).',
          'L’adjectif verbal s’accorde et prend souvent -c- (convaincants) ; le participe présent reste invariable et garde le radical verbal (convainquant).',
        ),
        examples: [
          { fr: 'Des arguments convaincants, convainquant tout le jury.', note: b('Adjective agrees (-cants); participle is invariable (-quant).', 'Adjectif accordé vs participe présent invariable.') },
        ],
      },
      {
        title: b('Adjective exigeant vs participle exigeant', 'Garder le « e » dans « exigeant / exigeante »'),
        body: b(
          'Unlike négligent (adjective) vs négligeant (participle), exigeant keeps its e in both forms and agrees as an adjective: une organisation exigeante.',
          '« Exigeant » garde le e dans tous les cas et s’accorde au féminin : une organisation exigeante.',
        ),
        examples: [
          { fr: 'Une organisation particulièrement exigeante.', note: b('Keep e after g + feminine -e.', 'e après g + accord au féminin.') },
        ],
      },
    ],
  },
  {
    id: 'le-droit-a-la-deconnexion',
    slug: 'le-droit-a-la-deconnexion',
    title: 'Le droit à la déconnexion',
    subtitle: b(
      'Smartphones have blurred the line between work and private life; teams now agree on clear digital rules.',
      'Les smartphones ont brouillé la frontière entre vie pro et vie privée : les équipes fixent enfin des règles claires.',
    ),
    level: 'B2',
    theme: b('Digital life', 'Numérique'),
    focus: [
      b('Pronominal past participles', 'Participes passés pronominaux'),
      b('se sont rendu compte', 'Invariabilité de « rendu compte »'),
      b('Accents & prefixes (dé-, ré-)', 'Préfixes et orthographe B2'),
    ],
    image: 'listen-le-droit-a-la-deconnexion',
    minutes: 8,
    text: 'En quelques décennies, les messageries instantanées se sont imposées jusque dans nos soirées et nos week-ends. Peu à peu, de nombreux salariés se sont habitués à consulter leurs courriels avant même de prendre leur petit-déjeuner. Ce n’est que tardivement qu’ils se sont rendu compte des effets de cette hyperconnexion sur leur attention et leur sommeil. Dans plusieurs entreprises, les équipes se sont donc fixé une charte précise : aucun message non urgent ne doit recevoir de réponse après dix-neuf heures. Les collaborateurs qui se sont permis de couper leurs notifications le vendredi soir affirment avoir retrouvé un esprit plus clair et une créativité renouvelée dès le lundi.',
    translation: 'Within a few decades, instant messaging has found its way right into our evenings and weekends. Gradually, many employees got used to checking their emails even before eating breakfast. It was only belatedly that they realised the effects of this hyperconnectivity on their focus and sleep. In several companies, teams have therefore set themselves a clear charter: no non-urgent message should receive a reply after seven p.m. Staff who have allowed themselves to mute notifications on Friday evening report regaining a clearer mind and renewed creativity come Monday.',
    blanks: ['décennies', 'imposées', 'habitués', 'courriels', 'rendu', 'hyperconnexion', 'fixé', 'charte', 'permis', 'renouvelée'],
    traps: [
      { word: 'se sont imposées / se sont habitués', note: b('Direct reflexive object se → participle agrees (messageries → imposées; salariés → habitués).', 'Le pronom « se » est COD : accord avec « messageries » (imposées) et « salariés » (habitués).') },
      { word: 'se sont rendu compte', note: b('NEVER agree rendu in se rendre compte (compte is the direct object, placed after!).', 'Dans « se rendre compte », « rendu » reste toujours invariable (COD = « compte » placé après).') },
      { word: 'se sont fixé une charte / se sont permis de couper', note: b('No agreement when the direct object follows the verb (fixé quoi ? une charte; permis quoi ? de couper).', 'Pas d’accord quand le COD est placé après : « fixé une charte », « permis de couper ».') },
      { word: 'décennies / hyperconnexion', note: b('Double n in décennies; double n and x in hyperconnexion.', 'Deux n dans « décennies » ; « connexion » prend x et deux n.') },
      { word: 'créativité renouvelée', note: b('Single l in renouvelée (from renouveler), feminine -ée.', 'Un seul l dans « renouvelée » + accord féminin.') },
    ],
    rules: [
      {
        title: b('Pronominal verbs: agree or leave invariable?', 'Participe passé des verbes pronominaux'),
        body: b(
          'Replace être with avoir mentally! If the direct object precedes (elles se sont imposées = imposé elles-mêmes), agree. If the direct object follows (elles se sont fixé une charte; ils se sont rendu compte), leave invariable.',
          'Testez avec « avoir » : COD avant → accord (elles se sont imposées) ; COD après → invariable (elles se sont fixé une charte, ils se sont rendu compte).',
        ),
        examples: [
          { fr: 'Elles se sont rendu compte du problème et se sont fixé des règles.', note: b('Both rendu and fixé stay invariable.', '« rendu » et « fixé » restent invariables (COD après).') },
        ],
      },
      {
        title: b('French spelling of connexion (not connection)', 'L’orthographe française de « connexion »'),
        body: b(
          'Unlike English “connection”, French always writes -xion: connexion, déconnexion, hyperconnexion.',
          'En français, on écrit toujours -xion : connexion, déconnexion, hyperconnexion.',
        ),
        examples: [
          { fr: 'Le droit à la déconnexion protège l’attention.', note: b('-xion in déconnexion.', 'Terminaison -xion en français.') },
        ],
      },
    ],
  },
  {
    id: 'traduire-a-l-heure-des-machines',
    slug: 'traduire-a-l-heure-des-machines',
    title: 'Traduire à l’heure des machines',
    subtitle: b(
      'Automatic translation tools deliver rapid drafts, yet literary nuance still relies on a human ear.',
      'Les traducteurs automatiques progressent vite, mais la finesse d’une voix ou d’un sous-entendu reste humaine.',
    ),
    level: 'B2',
    theme: b('Languages & AI', 'Langues & technologie'),
    focus: [
      b('quoique vs quoi que', 'Homophones quoique et quoi que'),
      b('plutôt vs plus tôt', 'Homophones plutôt et plus tôt'),
      b('davantage vs d’avantage', 'davantage ou d’avantage'),
    ],
    image: 'listen-traduire-a-l-heure-des-machines',
    minutes: 8,
    text: 'Quoique les logiciels de traduction automatique aient accompli des progrès spectaculaires, ils ne saisissent pas encore toutes les subtilités d’un texte vivant. Quoi que l’on pense de leur rapidité, un traducteur humain cherche plutôt à restituer un rythme, une ironie ou un silence qu’à aligner des équivalents littéraux. Quelques années plus tôt, certains observateurs annonçaient la disparition prochaine de ce métier ; aujourd’hui, on mesure davantage tout ce que l’oreille et la culture apportent à une œuvre. Loin de tirer moins d’avantage des outils numériques, les professionnels les utilisent comme un premier brouillon qu’ils réécrivent patiemment afin que chaque phrase sonne juste dans la langue d’arrivée.',
    translation: 'Although automatic translation software has made spectacular progress, it does not yet grasp all the subtleties of a living text. Whatever one thinks of its speed, a human translator aims rather to recreate a rhythm, an irony or a silence than to line up literal equivalents. A few years earlier, some observers predicted the imminent disappearance of this profession; today, we better appreciate everything a trained ear and cultural knowledge bring to a work. Far from gaining less benefit from digital tools, professionals use them as a rough first draft that they patiently rewrite so that every sentence rings true in the target language.',
    blanks: ['Quoique', 'accompli', 'subtilités', 'plutôt', 'équivalents', 'littéraux', 'davantage', 'brouillon', 'réécrivent', 'patiemment'],
    traps: [
      { word: 'Quoique / Quoi que', note: b('Quoique (one word) = although (bien que); quoi que (two words) = whatever (quelle que soit la chose que).', '« Quoique » (en un mot) = bien que ; « quoi que » (en deux mots) = quelle que soit la chose que.') },
      { word: 'plutôt / plus tôt', note: b('plutôt (one word) = rather/instead; plus tôt (two words) = earlier (opposite of plus tard).', '« plutôt » = de préférence ; « plus tôt » = contraire de « plus tard ».') },
      { word: 'davantage / moins d’avantage', note: b('davantage (one word) = more (adverb); d’avantage (two words) = benefit/advantage (noun).', '« davantage » (en un mot) = plus ; « d’avantage » (en deux mots) = de bénéfice.') },
      { word: 'patiemment / subtilités', note: b('Adverb from patient → patiemment (-emment); silent b in subtilités? Actually b is pronounced, watch -bt-.', 'Formé sur « patient » → « patiemment » (-emment) ; -bt- dans « subtilités ».') },
      { word: 'aient accompli', note: b('Subjunctive past after quoique: qu’ils aient accompli.', 'Subjonctif passé après « quoique » : « aient accompli ».') },
    ],
    rules: [
      {
        title: b('Quoique (although) vs quoi que (whatever)', 'Distinguer « quoique » et « quoi que »'),
        body: b(
          'Replace with bien que: if it works, write quoique in one word. Replace with quelle que soit la chose que: write quoi que in two words. Both take the subjunctive!',
          'Remplacez par « bien que » → quoique (1 mot). Remplacez par « quelle que soit la chose que » → quoi que (2 mots).',
        ),
        examples: [
          { fr: 'Quoique l’outil soit rapide, quoi qu’on en dise, l’oreille reste essentielle.', note: b('Quoique = bien que; quoi que = whatever.', '« Quoique » = bien que ; « quoi que » = quelle que soit la chose.') },
        ],
      },
      {
        title: b('plutôt (rather) vs plus tôt (earlier)', 'Distinguer « plutôt » et « plus tôt »'),
        body: b(
          'If you can replace it with plus tard (later), write plus tôt in two words. If it marks a preference (“rather”), write plutôt in one word.',
          'Si le contraire est « plus tard », écrivez « plus tôt ». Pour une préférence, écrivez « plutôt ».',
        ),
        examples: [
          { fr: 'Arrivé plus tôt, il préfère plutôt relire son texte.', note: b('plus tôt = earlier; plutôt = rather.', '« plus tôt » (temps) vs « plutôt » (préférence).') },
        ],
      },
    ],
  },
  {
    id: 'les-transports-gratuits',
    slug: 'les-transports-gratuits',
    title: 'Le pari des transports gratuits',
    subtitle: b(
      'Several medium-sized French cities have abolished bus fares — with surprising effects on civic life.',
      'Plusieurs villes moyennes ont rendu leurs bus gratuits, transformant autant les trajets que la vie de quartier.',
    ),
    level: 'B2',
    theme: b('Urbanism', 'Urbanisme'),
    focus: [
      b('quelque / quelques / quel que', 'quelque, quelques ou quel que'),
      b('Concession & subjunctive', 'Concession et subjonctif'),
      b('Civic & urban vocabulary', 'Vocabulaire citoyen'),
    ],
    image: 'listen-les-transports-gratuits',
    minutes: 8,
    text: 'Quelle que soit la taille d’une agglomération, la gratuité des transports publics provoque toujours des discussions animées. Quelques municipalités françaises ont pourtant tenté l’expérience, persuadées que l’accès libre aux bus encouragerait les habitants à délaisser leur voiture. Quelque coûteuse que paraisse cette mesure à première vue, ses partisans soulignent qu’elle redonne de la vitalité aux commerces du centre-ville et qu’elle allège le budget des ménages modestes. Pourvu que la fréquence des lignes reste suffisante aux heures de pointe, la fréquentation augmente rapidement. Quels que soient les arbitrages financiers à venir, ce modèle incite de nombreux élus à repenser la mobilité comme un véritable service commun.',
    translation: 'Whatever the size of an urban area, free public transport always sparks lively discussion. Several French municipalities have nonetheless tried the experiment, convinced that open access to buses would encourage residents to leave their cars behind. However costly this measure may appear at first sight, its supporters point out that it revitalises city-centre shops and eases the budget of modest households. Provided line frequency remains sufficient during rush hour, ridership grows quickly. Whatever financial trade-offs lie ahead, this model prompts many elected officials to rethink mobility as a genuine public good.',
    blanks: ['agglomération', 'gratuité', 'municipalités', 'persuadées', 'coûteuse', 'paraisse', 'allège', 'fréquentation', 'arbitrages', 'mobilité'],
    traps: [
      { word: 'Quelle que soit / Quels que soient', note: b('Two words before verb être (subjunctive): quel/quelle/quels/quelles agrees with the subject!', 'En deux mots devant « être » au subjonctif : « quel » s’accorde avec le sujet (taille → quelle ; arbitrages → quels).') },
      { word: 'Quelque coûteuse que paraisse', note: b('Before an adjective + que (“however costly”), quelque is an adverb and stays INVARIABLE!', 'Devant un adjectif + « que » (= si… que), « quelque » est adverbe et reste INVARIABLE.') },
      { word: 'Quelques municipalités', note: b('Before a plural noun (“several”), quelques takes an -s.', 'Devant un nom pluriel (= plusieurs), « quelques » prend un -s.') },
      { word: 'agglomération / allège', note: b('Double g in agglomération; double l and grave è in allège.', 'Deux g dans « agglomération » ; deux l et un è dans « allège ».') },
      { word: 'Pourvu que… reste', note: b('Pourvu que always triggers the subjunctive.', '« Pourvu que » demande toujours le subjonctif.') },
    ],
    rules: [
      {
        title: b('Mastering quel que, quelque and quelques', 'Maîtriser « quel que », « quelque » et « quelques »'),
        body: b(
          'Before être (subjunctive): quel que in 2 words, agreeing with the subject (Quelle que soit la taille, Quels que soient les arbitrages). Before an adjective + que: quelque invariable. Before a plural noun: quelques (-s).',
          'Devant « être » : « quel que » (2 mots, accordé). Devant un adjectif + « que » : « quelque » (invariable). Devant un nom pluriel : « quelques » (-s).',
        ),
        examples: [
          { fr: 'Quelle que soit la ville, quelques bus suffisent parfois.', note: b('Quelle que + soit; quelques + plural noun.', '« Quelle que » (sujet féminin) et « quelques » (pluriel).') },
        ],
      },
      {
        title: b('Invariable quelque before an adjective', '« Quelque » invariable devant un adjectif'),
        body: b(
          'In the formal B2 structure quelque + adjective + que + subjunctive (“however …”), quelque never takes -s: quelque coûteuse que paraisse cette mesure.',
          'Dans la tournure « quelque + adjectif + que + subjonctif », « quelque » signifie « si » et reste invariable.',
        ),
        examples: [
          { fr: 'Quelque coûteuse que paraisse cette mesure, elle convainc.', note: b('quelque stays invariable before coûteuse.', '« Quelque » reste invariable devant l’adjectif.') },
        ],
      },
    ],
  },
  {
    id: 'le-gout-de-la-nostalgie',
    slug: 'le-gout-de-la-nostalgie',
    title: 'Le goût de la nostalgie',
    subtitle: b(
      'Why does a childhood scent or an old song suddenly transport us back in time — and soothe us?',
      'Pourquoi une odeur d’enfance ou une vieille mélodie nous ramène-t-elle soudain dans le passé tout en nous apaisant ?',
    ),
    level: 'B2',
    theme: b('Essay & psychology', 'Essai & psychologie'),
    focus: [
      b('Adverb tout (toute / toutes / tout)', 'L’adverbe « tout » (règle d’euphonie)'),
      b('Literary accents & spelling', 'Orthographe littéraire'),
      b('Subtle adjective agreements', 'Accords fins'),
    ],
    image: 'listen-la-nostalgie',
    minutes: 8,
    text: 'Une simple odeur de bois humide ou quelques notes entendues par hasard suffisent parfois à raviver une mémoire que l’on croyait tout effacée. Longtemps considérée comme une mélancolie stérile, la nostalgie se révèle pourtant tout autre lorsqu’on l’observe attentivement. Des psychologues ont montré que ces souvenirs, même lorsqu’ils semblent teintés de tristesse, procurent une chaleur toute particulière. Une personne toute surprise par l’écho d’une chanson d’enfance se sent souvent plus reliée à son histoire et aux siens. Les émotions qui nous traversent alors, toutes contradictoires qu’elles paraissent, nous aident en réalité à affronter l’incertitude du présent avec une douceur inattendue.',
    translation: 'A simple scent of damp wood or a few notes heard by chance are sometimes enough to revive a memory we thought completely erased. Long regarded as a sterile melancholy, nostalgia nonetheless turns out to be quite different when examined closely. Psychologists have shown that these memories, even when tinged with sadness, bring a very special warmth. Someone wholly surprised by the echo of a childhood song often feels more connected to their own story and loved ones. The emotions that pass through us then, however contradictory they may seem, actually help us face the uncertainty of the present with an unexpected gentleness.',
    blanks: ['hasard', 'raviver', 'mélancolie', 'stérile', 'psychologues', 'teintés', 'particulière', 'contradictoires', 'affronter', 'incertitude'],
    traps: [
      { word: 'tout effacée / tout autre vs toute particulière / toute surprise / toutes contradictoires', note: b('Adverb tout (“completely”) is normally invariable — EXCEPT before a feminine adjective starting with a consonant or aspirated h!', 'L’adverbe « tout » (= tout à fait) est invariable, SAUF devant un adjectif féminin commençant par une consonne ou un h aspiré !') },
      { word: 'hasard / mélancolie', note: b('Silent h and silent final -d in hasard; ch [k] is NOT used in mélancolie (just c!).', 'h muet et -d final dans « hasard » ; un simple c dans « mélancolie ».') },
      { word: 'psychologues', note: b('ps + y + ch [k] in psychologues.', 'Orthographe savante : « psychologues ».') },
      { word: 'teintés de tristesse', note: b('Masculine plural agreement with ces souvenirs → teintés.', 'Accord au masculin pluriel avec « ces souvenirs ».') },
      { word: 'incertitude / affronter', note: b('Single t in incertitude; double f in affronter.', 'Deux f dans « affronter ».') },
    ],
    rules: [
      {
        title: b('The famous adverb tout rule (euphony)', 'La règle célèbre de l’adverbe « tout »'),
        body: b(
          'Meaning “completely/very”, tout stays invariable before masculine adjectives and feminine vowels (tout effacée, tout autre), BUT agrees before a feminine consonant or aspirated h (toute particulière, toute surprise, toutes contradictoires).',
          'Au sens de « tout à fait », « tout » reste invariable devant voyelle (tout effacée), mais s’accorde par euphonie devant une consonne féminine (toute surprise, toutes contradictoires).',
        ),
        examples: [
          { fr: 'Une mémoire tout effacée, mais une émotion toute particulière.', note: b('Vowel effacée → tout; consonant particulière → toute.', 'Voyelle → « tout » ; consonne féminine → « toute ».') },
        ],
      },
      {
        title: b('The spelling of hasard and mélancolie', 'Deux pièges classiques : « hasard » et « mélancolie »'),
        body: b(
          'Remember: par hasard (h + s + final d, never z) and la mélancolie (simple c, unlike chronique or psychologue).',
          'Retenez « par hasard » (avec s et d final) et « mélancolie » (un simple c, sans h).',
        ),
        examples: [
          { fr: 'Par hasard, une chanson chasse la mélancolie.', note: b('hasard (s, d) and mélancolie (c).', '« hasard » (s, d) et « mélancolie » (c).') },
        ],
      },
    ],
  },
  {
    id: 'le-sommeil-et-les-ecrans',
    slug: 'le-sommeil-et-les-ecrans',
    title: 'Le sommeil face aux écrans',
    subtitle: b(
      'Sleep specialists explain why late-night scrolling disrupts our biological clock — and how simple habits help.',
      'Les spécialistes du sommeil expliquent comment la lumière bleue décale notre horloge interne et comment y remédier.',
    ),
    level: 'B2',
    theme: b('Health & science', 'Santé & sciences'),
    focus: [
      b('censé vs sensé', 'Homophones censé et sensé'),
      b('quand / quant / qu’en', 'Homophones quand, quant et qu’en'),
      b('Compound noun plurals', 'Pluriel des noms composés'),
    ],
    image: 'listen-bien-dormir-ca-s-apprend',
    minutes: 8,
    text: 'Chaque soir, des millions d’utilisateurs consultent leur téléphone au lit alors qu’ils sont censés préparer leur organisme au repos. Pourtant, il paraît tout à fait sensé d’éteindre les écrans une heure avant de s’endormir : la lumière bleue retarde la sécrétion naturelle de l’hormone du sommeil et entretient une vigilance artificielle. Quant aux réveille-matin traditionnels, ils reviennent discrètement sur les tables de chevet afin d’éloigner les smartphones de la chambre. Quand les médecins rappellent ces gestes simples, certains patients demandent ce qu’en disent vraiment les études récentes. Toutes confirment que quelques coupe-circuit numériques le soir améliorent nettement la mémoire, l’humeur et la résistance à la fatigue.',
    translation: 'Every evening, millions of users check their phone in bed when they are supposed to be preparing their body for rest. Yet it seems entirely sensible to switch off screens an hour before falling asleep: blue light delays the natural secretion of the sleep hormone and sustains artificial alertness. As for traditional alarm clocks, they are quietly returning to bedside tables in order to keep smartphones out of the bedroom. When doctors remind patients of these simple habits, some ask what recent studies really say about it. All confirm that a few digital cut-offs in the evening markedly improve memory, mood and resistance to fatigue.',
    blanks: ['censés', 'organisme', 'sensé', 'sécrétion', 'vigilance', 'artificielle', 'réveille-matin', 'discrètement', 'coupe-circuit', 'nettement'],
    traps: [
      { word: 'censés préparer / tout à fait sensé', note: b('censé (c) = supposed to (+ infinitive); sensé (s) = sensible, full of good sense.', '« censé » (c) = supposé (+ infinitif) ; « sensé » (s) = qui a du bon sens.') },
      { word: 'Quant aux / Quand les médecins / ce qu’en disent', note: b('Quant à (t) = as for; Quand (d) = when; qu’en = que + en (about it).', '« Quant à » (t) = en ce qui concerne ; « Quand » (d) = lorsque ; « qu’en » = que + en.') },
      { word: 'réveille-matin / coupe-circuit', note: b('Verb + noun compound nouns: verb stays invariable; singular concept (matin, circuit) stays invariable.', 'Noms composés verbe + nom : le verbe est invariable (réveille-matin, coupe-circuit).') },
      { word: 'sécrétion / discrètement', note: b('Two acute é in sécrétion; grave accent è in discrètement (from discret/discrète).', 'Deux accents aigus dans « sécrétion » ; accent grave dans « discrètement ».') },
      { word: 'artificielle / nettement', note: b('Double l in feminine artificielle; double t in nettement (from net/nette).', 'Deux l dans « artificielle » ; deux t dans « nettement ».') },
    ],
    rules: [
      {
        title: b('Distinguishing censé (supposed) and sensé (sensible)', 'Distinguer « censé » et « sensé »'),
        body: b(
          'Think of bon sens (good sense) → sensé with an s! Followed by an infinitive meaning “supposed to”, always write censé with a c.',
          'Pensez à « bon sens » → sensé (s). Suivi d’un infinitif au sens de « supposé », écrivez « censé » (c).',
        ),
        examples: [
          { fr: 'Il est censé dormir : c’est un conseil sensé.', note: b('censé = supposed to; sensé = sensible.', '« censé » (supposé) vs « sensé » (plein de bon sens).') },
        ],
      },
      {
        title: b('Quant à, quand and qu’en', 'Distinguer « quant à », « quand » et « qu’en »'),
        body: b(
          'Write quant (with -t) ONLY before à/au/aux (“as for”). Write quand (with -d) for time (“when”). Write qu’en for que + en (“what … about it”).',
          'Écrivez « quant » (t) uniquement devant à / au / aux ; « quand » (d) pour le temps ; « qu’en » pour « que + en ».',
        ),
        examples: [
          { fr: 'Quant aux écrans, quand faut-il les éteindre ?', note: b('Quant aux = as for; quand = when.', '« Quant aux » (t) et « quand » (d).') },
        ],
      },
    ],
  },
  {
    id: 'reparer-plutot-que-remplacer',
    slug: 'reparer-plutot-que-remplacer',
    title: 'Réparer plutôt que remplacer',
    subtitle: b(
      'In a crowded repair café, broken toasters and vintage lamps get a second life instead of ending up in landfill.',
      'Dans un café de réparation, grille-pain en panne et vieilles lampes retrouvent une seconde vie grâce à l’entraide.',
    ),
    level: 'B2',
    theme: b('Ecology', 'Environnement'),
    focus: [
      b('Participle + infinitive (fait, laissé, vu)', 'Participe passé suivi d’un infinitif'),
      b('Colour adjectives (invariable)', 'Adjectifs de couleur invariables'),
      b('Sustainability vocabulary', 'Lexique écologique'),
    ],
    image: 'listen-reparer-plutot-que-remplacer',
    minutes: 8,
    text: 'Autour de grandes tables couvertes de tournevis et de fils multicolores, les appareils que leurs propriétaires avaient laissés dormir au grenier reprennent vie. Cette cafetière que Paul avait fait vérifier en vain dans un grand magasin ne demandait finalement qu’un joint neuf. À côté de lui, une couturière ajuste les rideaux marron et les coussins bleu marine qu’une voisine lui a apportés dès l’ouverture. Les objets que nous avons vus passer de main en main témoignent d’un changement profond : l’obsolescence programmée n’est plus acceptée comme une fatalité. En partageant un savoir-faire concret, ces ateliers transforment un geste écologique en un rendez-vous chaleureux où chacun repart plus autonome.',
    translation: 'Around large tables covered in screwdrivers and multicoloured wires, appliances that their owners had left sitting in the attic come back to life. This coffee maker that Paul had had checked in vain at a department store ultimately needed only a new seal. Beside him, a seamstress alters the brown curtains and navy-blue cushions that a neighbour brought her right at opening time. The objects we watched pass from hand to hand bear witness to a deep shift: planned obsolescence is no longer accepted as inevitable. By sharing hands-on know-how, these workshops turn an ecological act into a warm gathering where everyone leaves more self-reliant.',
    blanks: ['tournevis', 'laissés', 'cafetière', 'vérifier', 'couturière', 'marron', 'apportés', 'obsolescence', 'fatalité', 'savoir-faire'],
    traps: [
      { word: 'les appareils qu’ils avaient laissés dormir / que Paul avait fait vérifier', note: b('fait + infinitive is ALWAYS invariable! laissés/vus agree when the preceding COD performs the infinitive action (les appareils dorment → laissés; les objets passent → vus).', '« fait » suivi d’un infinitif est TOUJOURS invariable ! « laissés » et « vus » s’accordent quand le COD fait l’action de l’infinitif.') },
      { word: 'rideaux marron / coussins bleu marine', note: b('Fruit/object colours (marron, orange) and compound colours (bleu marine) NEVER take -s!', 'Les couleurs issues d’un nom (marron, orange) et les couleurs composées (bleu marine) sont INVARIABLES.') },
      { word: 'obsolescence programmée', note: b('Watch -sc- in obsolescence and double m in programmée.', 'Graphie -sc- dans « obsolescence » et deux m dans « programmée ».') },
      { word: 'savoir-faire / tournevis', note: b('Hyphen in savoir-faire; tournevis always ends in -s.', 'Trait d’union dans « savoir-faire » ; « tournevis » garde son -s.') },
      { word: 'en vain / témoigner', note: b('vain (a-i-n, not vin); -gn- in témoignent.', '« en vain » (ain) ; -gn- dans « témoignent ».') },
    ],
    rules: [
      {
        title: b('fait + infinitive is ALWAYS invariable', '« fait » suivi d’un infinitif est toujours invariable'),
        body: b(
          'Even if a feminine or plural direct object precedes it, fait + infinitive NEVER agrees: la cafetière qu’il avait fait vérifier. With voir/entendre/laisser, agree if the COD performs the action (les objets que nous avons vus passer).',
          '« fait » + infinitif ne s’accorde jamais : la cafetière qu’il avait fait vérifier. Avec « voir » ou « laisser », on accorde si le COD fait l’action.',
        ),
        examples: [
          { fr: 'La lampe qu’elle a fait réparer fonctionne encore.', note: b('fait + infinitive stays invariable.', '« fait » reste invariable devant un infinitif.') },
        ],
      },
      {
        title: b('Invariable colour adjectives (marron, bleu marine)', 'Les adjectifs de couleur invariables'),
        body: b(
          'Colours named after objects (marron, orange, turquoise) and two-word colours (bleu marine, vert foncé) never agree in gender or number.',
          'Les couleurs issues d’un nom (marron, orange) et les couleurs composées (bleu marine) ne prennent ni -e ni -s.',
        ),
        examples: [
          { fr: 'Des rideaux marron et des coussins bleu marine.', note: b('Both marron and bleu marine stay invariable.', '« marron » et « bleu marine » restent invariables.') },
        ],
      },
    ],
  },
  {
    id: 'le-repas-gastronomique',
    slug: 'le-repas-gastronomique',
    title: 'L’art du repas à la française',
    subtitle: b(
      'Recognised as intangible heritage, the French festive meal is less about luxury than about taking time together.',
      'Inscrit au patrimoine culturel immatériel, le repas gastronomique célèbre avant tout le temps partagé autour d’une table.',
    ),
    level: 'B2',
    theme: b('Culture & heritage', 'Patrimoine'),
    focus: [
      b('Past subjunctive', 'Subjonctif passé'),
      b('Invariable words & hyphens', 'Mots invariables et traits d’union'),
      b('Gastronomic & cultural prose', 'Prose culturelle B2'),
    ],
    image: 'listen-le-repas-gastronomique-des-francais',
    minutes: 8,
    text: 'Bien que le repas gastronomique des Français ait été inscrit au patrimoine immatériel de l’humanité, il ne se résume nullement aux grandes tables étoilées. Il s’agit avant tout d’une pratique sociale festive qui rassemble familles et amis lors des moments marquants de l’existence. De la sélection minutieuse des produits jusqu’à l’accord mets et vins, chaque étape obéit à un art de vivre transmis de génération en génération. On commence volontiers par un apéritif convivial, avant de savourer une entrée, un plat principal, un plateau de fromages affinés puis un dessert. Qu’il s’agisse d’un dîner modeste ou d’un banquet d’hiver, l’essentiel réside dans la conversation qui prolonge le plaisir bien au-delà de la dernière bouchée.',
    translation: 'Although the gastronomic meal of the French has been inscribed as intangible heritage of humanity, it is by no means limited to Michelin-starred restaurants. Above all, it is a festive social practice bringing families and friends together for life’s milestones. From the careful selection of ingredients to food-and-wine pairings, every step follows an art of living passed down from generation to generation. One gladly begins with a convivial aperitif before enjoying a starter, a main course, a board of aged cheeses and then a dessert. Whether it is a modest dinner or a winter banquet, what matters most lies in the conversation that extends the pleasure well beyond the final bite.',
    blanks: ['gastronomique', 'immatériel', 'nullement', 'minutieuse', 'apéritif', 'convivial', 'affinés', 'banquet', 'réside', 'au-delà'],
    traps: [
      { word: 'ait été inscrit', note: b('Passive past subjunctive after bien que: ait été inscrit.', 'Subjonctif passé passif après « bien que » : « ait été inscrit ».') },
      { word: 'immatériel / affinés / nullement', note: b('Double consonants: mm in immatériel, ff in affinés, ll in nullement.', 'Consonnes doubles : immatériel (mm), affinés (ff), nullement (ll).') },
      { word: 'volontiers / mets', note: b('Invariable adverb volontiers (silent -s); un mets (dish) always ends in -s even in the singular.', 'Adverbe invariable « volontiers » (-s) ; « mets » prend toujours un -s.') },
      { word: 'au-delà', note: b('Hyphen and grave accent à in au-delà.', 'Trait d’union et accent grave dans « au-delà ».') },
      { word: 'Qu’il s’agisse', note: b('Present subjunctive of s’agir (impersonal): qu’il s’agisse.', 'Subjonctif présent du verbe impersonnel « s’agir » : « qu’il s’agisse ».') },
    ],
    rules: [
      {
        title: b('Invariable words with silent -s (volontiers, nullement)', 'Les adverbes et mots invariables classiques'),
        body: b(
          'Watch silent final letters in formal connectors: volontiers (-s), au-delà (hyphen + à), nullement (double l).',
          'Surveillez les adverbes courants à l’écrit : volontiers (avec -s), au-delà (trait d’union et à), nullement (deux l).',
        ),
        examples: [
          { fr: 'On prolonge volontiers la soirée bien au-delà de minuit.', note: b('volontiers (-s) and au-delà (hyphen + à).', '« volontiers » (-s) et « au-delà ».') },
        ],
      },
      {
        title: b('The passive subjunctive after bien que', 'Le subjonctif passé passif après « bien que »'),
        body: b(
          'For a completed passive action after bien que, use ait été + past participle: bien que le repas ait été inscrit.',
          'Pour un fait accompli à la voix passive après « bien que », utilisez « ait été » + participe passé.',
        ),
        examples: [
          { fr: 'Bien qu’il ait été inscrit au patrimoine, cet art reste simple.', note: b('ait été inscrit = passive past subjunctive.', 'Subjonctif passé passif : « ait été inscrit ».') },
        ],
      },
    ],
  },
  {
    id: 'au-fil-du-canal-du-midi',
    slug: 'au-fil-du-canal-du-midi',
    title: 'Au fil du canal du Midi',
    subtitle: b(
      'Built in the seventeenth century between Toulouse and the Mediterranean, the canal still charms cyclists and boaters.',
      'Creusé au XVIIe siècle entre Toulouse et la Méditerranée, le canal du Midi séduit toujours cyclistes et plaisanciers.',
    ),
    level: 'B2',
    theme: b('History & heritage', 'Histoire & patrimoine'),
    focus: [
      b('Collective subjects (la plupart)', 'Accords collectifs (la plupart, une foule)'),
      b('Past participle with en', 'Participe passé avec « en »'),
      b('Historical & landscape prose', 'Prose historique'),
    ],
    image: 'listen-le-canal-du-midi',
    minutes: 8,
    text: 'Reliant la Garonne à la Méditerranée sur plus de deux cents kilomètres, le canal du Midi demeure un chef-d’œuvre d’ingénierie conçu au dix-septième siècle. Une foule de promeneurs et de cyclistes empruntent aujourd’hui ses chemins de halage bordés de platanes centenaires. La plupart des visiteurs ignorent cependant les prouesses techniques qu’a nécessitées la construction de ses écluses et de ses ponts-canaux. Des ouvrages aussi audacieux, l’époque en a rarement vu naître d’aussi durables. Au printemps, tandis que les péniches glissent lentement d’un bassin à l’autre, l’ombre fraîche des arbres offre une parenthèse hors du temps que les voyageurs n’oublient guère.',
    translation: 'Linking the Garonne to the Mediterranean over more than two hundred kilometres, the Canal du Midi remains a masterpiece of engineering designed in the seventeenth century. Crowds of walkers and cyclists today follow its towpaths lined with centuries-old plane trees. Most visitors are unaware, however, of the technical feats required to build its locks and aqueduct bridges. Such bold works were rarely built to last so well in that era. In spring, as barges glide slowly from one basin to the next, the cool shade of the trees offers a timeless interlude that travellers seldom forget.',
    blanks: ['Méditerranée', 'chef-d’œuvre', 'ingénierie', 'conçu', 'centenaires', 'prouesses', 'nécessitées', 'écluses', 'péniches', 'parenthèse'],
    traps: [
      { word: 'deux cents kilomètres', note: b('cent takes -s when multiplied and NOT followed by another number: deux cents kilomètres.', '« cent » prend un -s lorsqu’il est multiplié et non suivi d’un autre nombre.') },
      { word: 'La plupart des visiteurs ignorent', note: b('La plupart (alone or + plural noun) ALWAYS triggers a plural verb!', '« La plupart » entraîne toujours l’accord du verbe au pluriel.') },
      { word: 'les prouesses qu’a nécessitées la construction', note: b('Watch the inverted subject (la construction) and preceding COD (les prouesses, f. pl.) → nécessitées!', 'Sujet inversé « la construction » + COD « les prouesses » avant le verbe → nécessitées !') },
      { word: 'l’époque en a rarement vu', note: b('With pronoun en as direct object, the past participle stays INVARIABLE (vu).', 'Quand « en » est COD, le participe passé reste invariable : « en a vu ».') },
      { word: 'chef-d’œuvre / parenthèse', note: b('Hyphen + apostrophe + œ in chef-d’œuvre; th + è in parenthèse.', 'Trait d’union et œ dans « chef-d’œuvre » ; th + è dans « parenthèse ».') },
    ],
    rules: [
      {
        title: b('Agreement with la plupart and une foule de', 'L’accord avec « la plupart »'),
        body: b(
          'La plupart always takes a plural verb (la plupart ignorent). With une foule de + plural noun, you agree with whichever idea dominates — here the walkers/cyclists (empruntent).',
          '« La plupart » impose toujours le pluriel au verbe : la plupart des visiteurs ignorent.',
        ),
        examples: [
          { fr: 'La plupart des voyageurs admirent les écluses.', note: b('Plural verb admirent after la plupart.', 'Verbe au pluriel après « la plupart ».') },
        ],
      },
      {
        title: b('Past participle with pronoun en', 'Le participe passé précédé de « en »'),
        body: b(
          'When pronoun en represents the direct object (“of them”), the past participle with avoir stays invariable: des ouvrages, on en a rarement vu.',
          'Lorsque le pronom « en » est COD, le participe passé reste invariable : des ouvrages, on en a vu.',
        ),
        examples: [
          { fr: 'Des chefs-d’œuvre comme celui-ci, on en a rarement vu.', note: b('vu stays invariable with en.', '« vu » reste invariable avec « en ».') },
        ],
      },
    ],
  },
  {
    id: 'une-ville-sans-voiture',
    slug: 'une-ville-sans-voiture',
    title: 'Imaginer une sortie sans voiture',
    subtitle: b(
      'What happens when a weekend getaway is planned purely by train, bus and foot? A calmer pace takes over.',
      'Et si l’on organisait une escapade entière en train, en bus et à pied ? Un tout autre rythme s’installe.',
    ),
    level: 'B2',
    theme: b('Mobility & society', 'Mobilité & société'),
    focus: [
      b('Past conditional', 'Conditionnel passé'),
      b('tâche vs tache & aussitôt', 'Homophones (tâche / tache, aussitôt)'),
      b('nu / demi / ci-joint', 'Accords particuliers (demi, ci-joint)'),
    ],
    image: 'mission-une-sortie-sans-voiture',
    minutes: 8,
    text: 'Il y a dix ans, nous aurions jugé la tâche presque impossible : partir un week-end entier à la campagne sans jamais tourner la clé d’une voiture. Aujourd’hui, pour peu que l’on consulte les horaires à l’avance, l’itinéraire se révèle bien plus fluide qu’on ne l’aurait imaginé. Aussitôt descendus du train régional, nous avons rejoint un sentier balisé qui longeait la rivière sur une demi-heure de marche. Ci-joint sur notre carnet de route, une carte locale indiquait les fermes ouvertes et les correspondances du soir. Le dimanche, nous sommes rentrés plus tôt que prévu, l’esprit léger, persuadés que cette lenteur choisie ne laisse aucune tache sur le plaisir du voyage : au contraire, elle le décuple.',
    translation: 'Ten years ago, we would have judged the task almost impossible: going away for a whole weekend in the countryside without ever turning a car key. Today, provided you check timetables in advance, the route turns out to be far smoother than one would have imagined. As soon as we stepped off the regional train, we joined a signposted trail running along the river for a half-hour walk. Attached inside our travel notebook, a local map showed open farms and evening connections. On Sunday, we got back earlier than planned, light-headed with calm, convinced that this chosen slowness leaves no blemish on the joy of travel: on the contrary, it multiplies it tenfold.',
    blanks: ['tâche', 'horaires', 'fluide', 'Aussitôt', 'balisé', 'demi-heure', 'Ci-joint', 'correspondances', 'tache', 'décuple'],
    traps: [
      { word: 'la tâche (work) / aucune tache (stain)', note: b('tâche (â) = task/chore; tache (no accent) = stain/blemish!', '« tâche » (â) = travail à accomplir ; « tache » (sans accent) = marque ou salissure.') },
      { word: 'Aussitôt descendus / rentrés plus tôt', note: b('Aussitôt (one word) = immediately/as soon as; plus tôt (two words) = earlier.', '« Aussitôt » (1 mot) = dès que ; « plus tôt » (2 mots) = contraire de « plus tard ».') },
      { word: 'une demi-heure / Ci-joint', note: b('demi- before a noun is invariable (hyphen); Ci-joint at the start of a sentence is invariable.', '« demi- » avant le nom et « ci-joint » en tête de phrase restent invariables.') },
      { word: 'nous aurions jugé / on ne l’aurait imaginé', note: b('Past conditional (conditional of avoir + past participle); expletive ne after plus… que.', 'Conditionnel passé et « ne » explétif après un comparatif (« plus fluide qu’on ne… »).') },
      { word: 'correspondances / balisé', note: b('Double r and -ance in correspondances; single l in balisé.', 'Deux r et -ance dans « correspondances ».') },
    ],
    rules: [
      {
        title: b('Distinguishing tâche (task) and tache (stain)', 'Distinguer « tâche » et « tache »'),
        body: b(
          'Only one accent changes the entire meaning: une tâche difficile (a difficult task, with â) vs aucune tache (not a single stain/blemish, no accent).',
          'L’accent circonflexe change le sens : « la tâche » (le travail) vs « la tache » (la marque).',
        ),
        examples: [
          { fr: 'Une tâche accomplie sans aucune tache.', note: b('tâche (â) = task; tache = stain.', '« tâche » (travail) vs « tache » (marque).') },
        ],
      },
      {
        title: b('Ci-joint and demi- before a noun', 'Invariabilité de « ci-joint » et « demi- »'),
        body: b(
          'Placed before a noun, demi- is hyphenated and invariable (une demi-heure). Placed at the beginning of a sentence without a verb, ci-joint also stays invariable.',
          'Avant un nom, « demi- » est invariable. En tête de phrase sans verbe, « ci-joint » reste invariable.',
        ),
        examples: [
          { fr: 'Ci-joint la carte pour cette demi-heure de marche.', note: b('Both ci-joint and demi- stay invariable.', '« Ci-joint » et « demi- » restent invariables.') },
        ],
      },
    ],
  },
];
