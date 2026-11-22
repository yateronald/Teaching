import type { CourseAbout, Lesson } from '../../types';
import { P, b, card, dict, dlg, gap, hear, lesson, mc, ord, pairs, say, sort, tip, trap, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Talk about when things happen with confidence. Learn when French uses à for clock times, when days and parts of the day drop prepositions altogether, why months and seasons take en except au printemps, and how dans, pendant, and depuis divide future waits, durations, and ongoing actions.',
    'Situez vos actions dans le temps avec précision. Voyez quand le français emploie à pour l’heure, pourquoi les jours et moments de la journée se passent de préposition, pourquoi mois et saisons prennent en sauf au printemps, et comment distinguer dans, pendant et depuis.',
  ),
  outcomes: [
    b('Express clock times with à and days/parts of the day without prepositions', 'Indiquer l’heure avec à et les jours ou moments sans préposition'),
    b('Use en with months, years, and seasons—and remember au printemps', 'Employer en avec les mois, années et saisons—et retenir au printemps'),
    b('Choose accurately between dans (future), pendant (duration), and depuis (still going)', 'Distinguer dans (futur), pendant (durée) et depuis (toujours en cours)'),
  ],
};

const C = 'gr-prepositions-time-a1';

const lessons: Lesson[] = [
  lesson(
    C,
    1,
    ['at-exact-hours-and-parts-of-day', 'a-avec-l-heure-et-moments-de-la-journee'],
    b('À for exact hours & parts of the day', 'À pour l’heure et les moments de la journée'),
    b('Use à for clock times and ranges, and drop prepositions before days of the week and parts of the day.', 'Utilisez à pour l’heure exacte, et n’ajoutez aucune préposition devant les jours de la semaine et les moments de la journée.'),
    [
      b('State exact clock times and time ranges with à and de … à', 'Donner l’heure exacte avec à et les horaires avec de … à'),
      b('Distinguish lundi (one Monday) from le lundi (every Monday)', 'Distinguer lundi (un lundi précis) de le lundi (tous les lundis)'),
      b('Use le matin, l’après-midi, and le soir without à or en', 'Employer le matin, l’après-midi et le soir sans à ni en'),
    ],
    13,
    [
      card(
        b('Exact hours vs. days and parts of day', 'L’heure exacte vs jours et moments'),
        b(
          'Use **à** for any **clock time** (*à neuf heures*, *à midi*, *à minuit*), and **de … à …** for opening hours (*de 8 h à 18 h*). By contrast, days of the week and parts of the day take **no preposition**—use bare **lundi** for one day, **le lundi** for every Monday, and **le matin / l’après-midi / le soir**.\nClock time: **à huit heures, à midi, à minuit**.\nNo preposition: **le lundi, samedi soir, le matin**.',
          'Employez **à** pour toute **heure précise** (*à neuf heures*, *à midi*, *à minuit*), et **de … à …** pour une plage horaire (*de 8 h à 18 h*). En revanche, les jours et les moments de la journée n’ont **pas de préposition** : **lundi** pour un jour précis, **le lundi** pour chaque lundi, et **le matin / l’après-midi / le soir**.\nAvec à : **à huit heures, à midi, à minuit**.\nSans préposition : **le lundi, samedi soir, le matin**.',
        ),
        {
          table: {
            head: [b('Time type', 'Repère'), b('French form', 'Forme française'), b('Example', 'Exemple')],
            rows: [
              [b('Exact hour', 'Heure exacte'), 'à + hour', 'Le film commence à vingt heures.'],
              [b('Time range', 'Plage horaire'), 'de … à …', 'La poste ouvre de 9 h à 17 h.'],
              [b('Specific day', 'Un jour précis'), 'day alone', 'Nous partons mardi.'],
              [b('Repeated day / part of day', 'Habitude / moment'), 'le / l’ + noun', 'Je cours le samedi matin.'],
            ],
          },
          ex: [
            ['Le rendez-vous est à dix heures et demie.', 'The appointment is at ten thirty.'],
            ['Le matin, je bois toujours un grand verre d’eau.', 'In the morning, I always drink a tall glass of water.'],
            ['La librairie est fermée le lundi.', 'The bookstore is closed on Mondays.'],
          ],
        },
      ),
      trap(
        b('Never say *sur lundi* or *dans le matin*', 'Jamais *sur lundi* ni *au matin*'),
        b(
          'English uses *on* before days and *in* before parts of the day, so learners often invent *sur lundi* or *en matin*. In French, simply say **lundi**, **le lundi**, **le matin**, **l’après-midi**, **le soir**, or **la nuit**.\nNatural forms: **mercredi matin, le jeudi, cet après-midi**.',
          'Ne traduisez jamais « on Monday » ou « in the morning » mot à mot par *sur lundi* ou *en matin*. En français, dites simplement **lundi**, **le lundi**, **le matin**, **l’après-midi**, **le soir** ou **la nuit**.\nFormes naturelles : **mercredi matin, le jeudi, cet après-midi**.',
        ),
      ),
      mc(
        b('How do you say "Every Tuesday, the museum is closed"?', 'Comment dit-on « Every Tuesday, the museum is closed » ?'),
        [
          'Le mardi, le musée est fermé.',
          'À mardi, le musée est fermé.',
          'En mardi, le musée est fermé.',
          'Sur mardi, le musée est fermé.',
        ],
        {
          explain: b('Use le + day (le mardi) for a recurring weekly habit, with no preposition.', 'Utilisez le + jour (le mardi) pour une habitude hebdomadaire, sans préposition.'),
        },
      ),
      hear(
        'La pharmacie est ouverte de huit heures trente à dix-neuf heures.',
        b('When is the pharmacy open?', 'Quels sont les horaires de la pharmacie ?'),
        [
          b('From 8:30 a.m. to 7:00 p.m.', 'De 8 h 30 à 19 h 00'),
          b('Only at 8:30 a.m.', 'Seulement à 8 h 30'),
          b('From 7:00 a.m. to 8:30 p.m.', 'De 7 h 00 à 20 h 30'),
        ],
      ),
      gap(
        P.complete,
        'Demain, mon train part ___ sept heures quinze. ___ soir, je dîne avec ma tante, mais ___ mercredi, je reste toujours chez moi.',
        [['à'], ['Ce'], ['le']],
        {
          choices: [
            ['à', 'en', 'au'],
            ['Ce', 'À', 'Dans'],
            ['le', 'à', 'en'],
          ],
        },
      ),
      sort(
        b('Sort each time reference: takes à, or uses le / no preposition.', 'Classez chaque repère temporel selon qu’il prend à ou le / aucune préposition.'),
        [b('Takes à', 'Prend à'), b('Uses le / no preposition', 'Prend le / sans préposition')],
        [
          ['midi', 0],
          ['vendredi soir', 1],
          ['quatorze heures', 0],
          ['le dimanche', 1],
          ['minuit', 0],
          ['l’après-midi', 1],
        ],
      ),
      ord(
        P.order,
        'Le magasin ouvre le matin à neuf heures.',
        {
          tr: 'The store opens in the morning at nine o’clock.',
          extra: ['en'],
        },
      ),
      dict('Je prends le bus à huit heures et je rentre le soir.'),
      say('Le samedi après-midi, nous allons souvent au cinéma.', 'On Saturday afternoons, we often go to the movies.'),
    ],
    [
      b('Use à before exact clock times (à neuf heures, à midi) and de … à … for ranges.', 'Employez à devant l’heure exacte (à neuf heures, à midi) et de … à … pour une plage.'),
      b('Never put à, en, or sur before days of the week (lundi, le lundi).', 'Ne mettez ni à, ni en, ni sur devant les jours (lundi, le lundi).'),
      b('Parts of the day take le / l’ / ce with no preposition (le matin, ce soir).', 'Les moments de la journée prennent le / l’ / ce sans préposition (le matin, ce soir).'),
    ],
    [
      ['midi', b('noon', 'douze heures en plein jour')],
      ['minuit', b('midnight', 'douze heures la nuit')],
      ['et demie', b('half past', 'trente minutes')],
      ['le rendez-vous', b('appointment', 'rencontre prévue à une heure précise')],
    ],
  ),

  lesson(
    C,
    2,
    ['en-with-months-seasons-years', 'en-avec-mois-saisons-annees'],
    b('En for months, seasons & years (and au printemps)', 'En avec les mois, saisons et années'),
    b('Use en for months, years, and three of the four seasons—and remember why spring takes au printemps.', 'Employez en pour les mois, les années et trois saisons sur quatre—et retenez pourquoi le printemps prend au.'),
    [
      b('Use en before all months and years', 'Employer en devant tous les mois et les années'),
      b('Use en for été, automne, hiver and au for printemps', 'Utiliser en pour été, automne, hiver et au pour printemps'),
      b('Use au mois de when naming the word mois', 'Utiliser au mois de quand on dit le mot mois'),
    ],
    13,
    [
      card(
        b('Months, seasons, and years', 'Mois, saisons et années'),
        b(
          'Put **en** before **all twelve months** (*en janvier, en août*), **all years** (*en 2026*), and three seasons starting with a vowel or silent h: **en été, en automne, en hiver**. Only **printemps** starts with a consonant sound, so it takes **au**: **au printemps**!\nWith en: **en mai, en été, en 2026**.\nWith au: **au printemps, au mois de juin, au mois d’août**.',
          'Mettez **en** devant **tous les mois** (*en janvier, en août*), **toutes les années** (*en 2026*) et les trois saisons commençant par une voyelle ou un h muet : **en été, en automne, en hiver**. Seul **printemps** commence par une consonne et prend **au** : **au printemps** !\nAvec en : **en mai, en été, en 2026**.\nAvec au : **au printemps, au mois de juin, au mois d’août**.',
        ),
        {
          table: {
            head: [b('Category', 'Catégorie'), b('Preposition', 'Préposition'), b('Examples', 'Exemples')],
            rows: [
              [b('Months', 'Mois'), 'en', 'en mars, en septembre, en décembre'],
              [b('Months with « mois »', 'Avec le mot « mois »'), 'au mois de / d’', 'au mois de mars, au mois d’août'],
              [b('Summer, autumn, winter', 'Été, automne, hiver'), 'en', 'en été, en automne, en hiver'],
              [b('Spring', 'Printemps'), 'au', 'au printemps'],
              [b('Years', 'Années'), 'en', 'en 2020, en 2026'],
            ],
          },
          ex: [
            ['Nous partons en vacances en juillet.', 'We are going on holiday in July.'],
            ['Les jardins sont magnifiques au printemps.', 'The gardens are gorgeous in spring.'],
            ['Mon frère a commencé son travail en 2024.', 'My brother started his job in 2024.'],
          ],
        },
      ),
      tip(
        b('A quick sound trick for the four seasons', 'L’astuce sonore des quatre saisons'),
        b(
          '**Été, automne, hiver** all start with a vowel sound, so **en** links smoothly (*en‿été, en‿automne, en‿hiver*). **Printemps** starts with *p-*, so French uses **au** (*au printemps*).\nFour seasons: **au printemps, en été, en automne, en hiver**.',
          '**Été, automne, hiver** commencent tous par une voyelle ou un h muet : **en** fait une liaison fluide (*en‿été, en‿automne, en‿hiver*). **Printemps** commence par *p-*, donc on dit **au printemps**.\nLes quatre saisons : **au printemps, en été, en automne, en hiver**.',
        ),
      ),
      mc(
        P.word,
        ['au', 'en', 'à', 'du'],
        {
          fr: 'Les fleurs poussent vite ___ printemps.',
          explain: b('Printemps is the one season that takes au (au printemps), never en.', 'Printemps est la seule saison qui prend au (au printemps), jamais en.'),
        },
      ),
      mc(
        P.word,
        ['en', 'au', 'à', 'le'],
        {
          fr: 'La rentrée scolaire commence ___ septembre.',
          explain: b('All months take en directly (en septembre), or au mois de septembre.', 'Tous les mois prennent en directement (en septembre), ou au mois de septembre.'),
        },
      ),
      gap(
        P.complete,
        'J’aime skier ___ hiver, mais je préfère marcher ___ printemps. Chaque année, nous voyageons ___ août ou ___ mois d’octobre.',
        [['en'], ['au'], ['en'], ['au']],
        {
          choices: [
            ['en', 'au', 'à'],
            ['au', 'en', 'à'],
            ['en', 'au', 'à'],
            ['au', 'en', 'de'],
          ],
        },
      ),
      pairs(
        b('Match each time noun with its correct French preposition.', 'Associez chaque repère de temps à la bonne préposition.'),
        [
          ['printemps', 'au printemps'],
          ['hiver', 'en hiver'],
          ['janvier', 'en janvier'],
          ['neuf heures', 'à neuf heures'],
        ],
        true,
      ),
      sort(
        b('Sort each time expression into en, au, or à.', 'Classez chaque expression selon qu’elle utilise en, au ou à.'),
        ['en', 'au', 'à'],
        [
          ['automne', 0],
          ['printemps', 1],
          ['huit heures', 2],
          ['2026', 0],
          ['mois de mai', 1],
          ['midi', 2],
        ],
      ),
      ord(
        P.order,
        'Il neige souvent en janvier et en février.',
        {
          tr: 'It often snows in January and in February.',
          extra: ['au'],
        },
      ),
      dict('Mon amie arrive au printemps et reste en France en été.'),
    ],
    [
      b('Months and years always take en (en avril, en 2025).', 'Les mois et les années prennent toujours en (en avril, en 2025).'),
      b('Three seasons take en (en été, en automne, en hiver); only spring takes au (au printemps).', 'Trois saisons prennent en (en été, en automne, en hiver) ; seul le printemps prend au (au printemps).'),
      b('If you add the word mois, say au mois de + month (au mois de juin).', 'Si vous ajoutez le mot mois, dites au mois de + mois (au mois de juin).'),
    ],
    [
      ['la rentrée', b('back-to-school / start of term', 'reprise des cours en septembre')],
      ['pousser', b('to grow (plants)', 'grandir, sortir de terre')],
      ['le printemps', b('spring', 'la saison entre l’hiver et l’été')],
      ['l’automne (m.)', b('autumn / fall', 'la saison après l’été')],
    ],
  ),

  lesson(
    C,
    3,
    ['dans-pendant-depuis', 'dans-pendant-et-depuis'],
    b('Dans, pendant, and depuis', 'Dans, pendant et depuis'),
    b('Keep future countdowns (dans), closed durations (pendant), and ongoing actions (depuis) clearly separated.', 'Distinguez nettement l’attente future (dans), la durée limitée (pendant) et l’action qui dure encore (depuis).'),
    [
      b('Use dans for how long until a future event starts', 'Employer dans pour le délai avant une action future'),
      b('Use pendant for the total duration of a bounded event', 'Employer pendant pour la durée totale d’une action limitée'),
      b('Use depuis + present tense for actions still continuing now', 'Employer depuis + présent pour une action toujours en cours'),
    ],
    13,
    [
      card(
        b('Three timelines: dans, pendant, depuis', 'Trois repères : dans, pendant, depuis'),
        b(
          'These three prepositions all take a duration, but point in opposite directions! **Dans** counts forward from *now* to when something will happen (*Le train part dans dix minutes*). **Pendant** measures a **complete block** of time (*J’étudie pendant deux heures*). **Depuis** + **present tense** says when something started and shows it is **still happening now** (*J’habite ici depuis trois ans*).\nTime prepositions: **dans (future), pendant (duration), depuis (still now)**.',
          'Ces trois prépositions accompagnent une durée, mais ne regardent pas dans la même direction ! **Dans** compte à partir de *maintenant* vers le futur (*Le train part dans dix minutes*). **Pendant** mesure un **bloc de durée complet** (*J’étudie pendant deux heures*). **Depuis** + **présent** indique une action commencée avant qui **continue encore maintenant** (*J’habite ici depuis trois ans*).\nTrois repères : **dans (futur), pendant (durée), depuis (toujours vrai)**.',
        ),
        {
          table: {
            head: [b('Preposition', 'Préposition'), b('Meaning', 'Sens'), b('Example', 'Exemple')],
            rows: [
              ['dans', b('in (from now to future)', 'dans un délai à venir'), 'Nous dînons dans une heure.'],
              ['pendant', b('for / during (closed block)', 'durant tout un moment'), 'Il dort pendant huit heures.'],
              ['depuis', b('for / since (still ongoing)', 'commencé avant, dure encore'), 'Elle travaille ici depuis mai.'],
            ],
          },
          ex: [
            ['Le bus arrive dans cinq minutes.', 'The bus is arriving in five minutes.'],
            ['Nous marchons pendant une heure tous les matins.', 'We walk for one hour every morning.'],
            ['J’étudie le français depuis six mois.', 'I have been studying French for six months.'],
          ],
        },
      ),
      trap(
        b('Depuis takes the PRESENT tense in French', 'Depuis s’utilise avec le PRÉSENT en français'),
        b(
          'English says *“I have lived here for two years”*, which tempts learners toward *pendant* or the past tense. In French, if you **still** live there now, ALWAYS use **depuis + present**: **J’habite ici depuis deux ans**, never *pendant deux ans*. And never use *depuis* for a future countdown (**dans 5 minutes**).\nOngoing now: **depuis un an, depuis lundi, depuis 2022**.',
          'Si l’action continue **encore maintenant**, utilisez TOUJOURS **depuis + présent** : **J’habite ici depuis deux ans**, et non *pendant deux ans*. N’utilisez pas non plus *depuis* pour le futur (**dans 5 minutes**).\nToujours en cours : **depuis un an, depuis lundi, depuis 2022**.',
        ),
      ),
      mc(
        P.word,
        ['depuis', 'dans', 'pendant', 'en'],
        {
          fr: 'Mon collègue travaille dans cette entreprise ___ quatre ans et il adore son poste.',
          explain: b('He started four years ago and still works there now → depuis + present tense.', 'Il a commencé il y a quatre ans et y travaille encore → depuis + présent.'),
        },
      ),
      hear(
        'Le cours de musique commence dans quinze minutes.',
        b('What does this sentence tell you about the music class?', 'Que vous indique cette phrase sur le cours de musique ?'),
        [
          b('It has not started yet—it begins 15 minutes from now.', 'Il n’a pas commencé : il débute dans 15 minutes.'),
          b('It lasts 15 minutes from start to finish.', 'Il dure 15 minutes au total.'),
          b('It started 15 minutes ago and is still going.', 'Il a commencé il y a 15 minutes.'),
        ],
      ),
      gap(
        P.complete,
        'J’attends le train ___ vingt minutes, mais le panneau annonce un départ ___ dix minutes. Heureusement, je lis mon roman ___ le trajet.',
        [['depuis'], ['dans'], ['pendant']],
        {
          choices: [
            ['depuis', 'dans', 'pendant'],
            ['dans', 'depuis', 'en'],
            ['pendant', 'dans', 'depuis'],
          ],
        },
      ),
      sort(
        b('Sort each sentence by whether it expresses a future delay (dans), a bounded duration (pendant), or an ongoing state (depuis).', 'Classez chaque phrase selon qu’elle indique un délai futur (dans), une durée limitée (pendant) ou une action toujours en cours (depuis).'),
        ['dans', 'pendant', 'depuis'],
        [
          ['Le film commence ___ dix minutes.', 0],
          ['Je nage ___ quarante minutes.', 1],
          ['Il pleut ___ ce matin.', 2],
          ['On part en vacances ___ deux jours.', 0],
          ['Elle habite à Nice ___ trois ans.', 2],
          ['Nous discutons ___ la pause.', 1],
        ],
      ),
      ord(
        P.order,
        'Nous habitons près de la mer depuis deux ans.',
        {
          tr: 'We have lived near the sea for two years.',
          extra: ['pendant'],
        },
      ),
      dlg(
        b('Waiting for a friend at the café', 'En attendant un ami au café'),
        b('Sarah joins Sami on the terrace after work.', 'Sarah retrouve Sami en terrasse après le travail.'),
        [['Sarah', 'f'], ['Sami', 'm']],
        [
          [0, 'Tu es là depuis longtemps ?', 'Have you been here for long?'],
          [1, {
            options: [
              'Non, je suis arrivé... enfin, j’attends depuis dix minutes seulement.',
              'Non, j’attends dans dix minutes seulement.',
              'Non, j’attends pendant dix minutes demain.',
            ],
          }],
          [0, 'Tu veux commander ? Le serveur arrive dans deux minutes.', 'Want to order? The waiter is coming in two minutes.'],
          [1, {
            options: [
              'Volontiers ! En plus, j’ai travaillé pendant neuf heures sans pause.',
              'Volontiers ! En plus, je travaille dans neuf heures sans pause.',
              'Volontiers ! En plus, j’ai travaillé depuis neuf heures dans la pause.',
            ],
          }],
        ],
      ),
      dict('Mon frère joue du piano depuis cinq ans et il répète pendant une heure chaque soir.'),
      write(
        b('Describe your schedule and timeline.', 'Décrivez votre emploi du temps dans le temps.'),
        b('Write 3–4 sentences using depuis (something still true now), en or au (a month or season), à (an exact hour), and dans or pendant.', 'Écrivez 3 ou 4 phrases en employant depuis (une situation actuelle), en ou au (un mois ou une saison), à (une heure précise), et dans ou pendant.'),
        24,
        44,
        [
          b('Use depuis + present tense for an ongoing habit or stay', 'Employer depuis + présent pour une durée toujours en cours'),
          b('Include en or au with a month or season', 'Utiliser en ou au avec un mois ou une saison'),
          b('Use à + clock time and either dans or pendant', 'Employer à + heure et dans ou pendant'),
        ],
        'J’habite à Toulouse depuis deux ans. En juillet, je pars en vacances en Bretagne. Le matin, je prends mon café à huit heures. Demain, mon train arrive dans vingt minutes et je travaille pendant trois jours.',
      ),
    ],
    [
      b('dans + duration points to the future (starting X time from now).', 'dans + durée annonce le futur (délai à partir de maintenant).'),
      b('pendant + duration measures a complete block of time.', 'pendant + durée mesure une durée délimitée du début à la fin.'),
      b('depuis + present tense links a past start to an action still continuing now.', 'depuis + présent indique une action commencée dans le passé qui dure encore.'),
    ],
    [
      ['le panneau', b('display board / sign', 'écran ou affiche d’information')],
      ['répéter', b('to practice / rehearse', 's’entraîner encore')],
      ['la pause', b('break', 'moment d’arrêt pendant le travail')],
      ['volontiers', b('gladly', 'avec plaisir')],
    ],
  ),
];

export default lessons;
