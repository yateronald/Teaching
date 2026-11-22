import type { CourseAbout } from '../../types';
import { b, card, culture, dict, hear, lesson, mc, P, pairs, say, sort, trap } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Tu [tsy], dîner [dzine], vite [vɪt], fête [faɛt], pâte [pɑɔt]: Québec French follows crisp, systematic phonetic rules—not random slang. Once you hear why t and d assibilate before i and u, why closed-syllable high vowels relax, and why Québec preserves classic vowel contrasts like pâte vs patte, Montréal conversations and broadcasts open right up. This B2 course maps Québec phonetics clearly.',
    'Tu [tsy], dîner [dzine], vite [vɪt], fête [faɛt], pâte [pɑɔt] : le français québécois obéit à des règles phonétiques précises et régulières. Dès qu’on comprend pourquoi t et d s’affriquent devant i et u, pourquoi les voyelles hautes se relâchent en syllabe fermée et quelles oppositions vocaliques le Québec conserve, conversations et médias montréalais deviennent limpides.',
  ),
  outcomes: [
    b('Predict exactly when t and d assibilate to [ts] and [dz] in Québec', 'Prédire exactement quand t et d s’affriquent en [ts] et [dz]'),
    b('Recognise lax high vowels [ɪ, ʏ, ʊ] in closed syllables (vite, lune, route)', 'Reconnaître le relâchement de i, u, ou en syllabe fermée (vite, lune, route)'),
    b('Hear Québec diphthongisation in long closed syllables (fête, neige, chaud)', 'Entendre la diphtongaison québécoise en syllabe fermée longue'),
    b('Notice vowel contrasts preserved in Québec (pâte/patte, brin/brun)', 'Repérer les contrastes vocaliques conservés au Québec (pâte/patte, brin/brun)'),
  ],
};

const C = 'p-quebec-phonetics';
export default [
  lesson(C, 1, ['assibilation-t-and-d-before-i-u', 'affrication-de-t-et-d-devant-i-u'],
    b('Assibilation: tu [tsy], dîner [dzine], petit [pətsi]', 'L’affrication : tu [tsy], dîner [dzine], petit [pətsi]'),
    b('Understand the exact condition that turns t and d into [ts] and [dz] across Québec.', 'Comprendre la règle précise qui transforme t et d en [ts] et [dz] au Québec.'),
    [b('Apply the « before i, u, or ui » trigger rule', 'Repérer le déclencheur : devant i, u ou ui'), b('Know when t and d do NOT assibilate (table, tout, dos)', 'Savoir quand t et d ne s’affriquent PAS (table, tout, dos)'), b('Decode natural Québec speech containing [ts] and [dz]', 'Décoder des phrases québécoises avec [ts] et [dz]')],
    13,
    [
      card(b('One clean rule: t/d + i, u, ui', 'Une règle simple : t/d + i, u, ui'), b('In Québec, **t** becomes **[ts]** and **d** becomes **[dz]** **only before the high front vowels i and u** (and the glide **ui**): **tu** → *[tsy]*, **petit** → *[pətsi]*, **voiture** → *[vwatsyʁ]*, **dîner** → *[dzine]*, **mardi** → *[maʁdzi]*, **du** → *[dzy]*, **étudiant** → *[etsydzjɑ̃]*. Notice it is a soft dental release, just like every Québec speaker uses—never exaggerated!', 'Au Québec, **t** devient **[ts]** et **d** devient **[dz]** **uniquement devant les voyelles hautes i et u** (et **ui**) : **tu** → *[tsy]*, **petit** → *[pətsi]*, **voiture** → *[vwatsyʁ]*, **dîner** → *[dzine]*, **mardi** → *[maʁdzi]*, **du** → *[dzy]*. C’est une détente douce et naturelle dans tout le Québec !'), {
        ex: [['tu, petit, voiture, partir', 't + i/u → [ts]'], ['mardi, dîner, du, conduire', 'd + i/u → [dz]'], ['la table, tout le monde, le dos', 'no i/u → plain [t], [d]']],
      }),
      trap(b('Never before ou, o, a, é, è!', 'Jamais devant ou, o, a, é, è !'), b('A common myth says Québec speakers put *ts/dz* everywhere. False! Before **ou, o, a, é, è**, **t** and **d** stay completely plain: **tout, dos, table, deux, été, théâtre** never assibilate.', 'Idée reçue : non, le Québec ne met pas *ts/dz* partout ! Devant **ou, o, a, é, è**, **t** et **d** restent ordinaires : **tout, dos, table, deux, été, théâtre** ne s’affriquent jamais.')),
      hear('Tu prends ta petite voiture mardi matin pour aller dîner en ville ?', b('Which words in this sentence assibilate in Québec French?', 'Quels mots de cette phrase s’affriquent au Québec ?'), [b('tu, petite, voiture, mardi, dîner (all before i or u)', 'tu, petite, voiture, mardi, dîner (tous devant i ou u)'), b('ta, matin, aller (before a and é)', 'ta, matin, aller (devant a et é)'), b('tu and ta only', 'tu et ta uniquement'), b('Every word except ville', 'Tous les mots sauf ville')], { voice: 'm' }),
      sort(b('Assibilates in Québec ([ts]/[dz]) or stays plain ([t]/[d])?', 'S’affrique au Québec ([ts]/[dz]) ou reste normal ([t]/[d]) ?'), [b('assibilates ([ts] / [dz])', 's’affrique ([ts] / [dz])'), b('stays plain ([t] / [d])', 'reste normal ([t] / [d])')], [['le petit', 0], ['la table', 1], ['mardi', 0], ['le dos', 1], ['la voiture', 0], ['tout le monde', 1]], { listen: true }),
      mc(P.choose, [b('« du pain » (d before u → [dz]) and « l’étudiant » (t before u, d before i)', '« du pain » (d devant u) et « l’étudiant » (t devant u, d devant i)'), b('« deux » and « douze » (before eu and ou)', '« deux » et « douze » (devant eu et ou)'), b('« temps » and « tard » (before an and a)', '« temps » et « tard » (devant an et a)'), b('« théâtre » and « tomber » (before é and on)', '« théâtre » et « tomber » (devant é et on)')], { fr: 'Dans quels mots entend-on l’affrication québécoise ?' }),
      dict('Tu gares ta petite voiture devant le bureau mardi matin.', { voice: 'f' }),
      say('Mardi midi, tu pars dîner avec ta petite voiture près de l’université.', 'Tuesday noon, you drive your little car to lunch near the university.', { tip: b('Spot the triggers: mar-di, mi-di, tu, dîner, pe-tite, voi-ture, u-ni-ver-si-té.', 'Repérez les déclencheurs devant i/u : mardi, midi, tu, dîner, petite, voiture, université.') }),
    ],
    [
      b('Rule: t → [ts] and d → [dz] ONLY before i, u or ui.', 'Règle : t → [ts] et d → [dz] UNIQUEMENT devant i, u ou ui.'),
      b('Before a, o, ou, é, è: plain [t] and [d] (table, tout, dos, deux).', 'Devant a, o, ou, é, è : [t] et [d] normaux (table, tout, dos, deux).'),
      b('Assibilation is universal across Québec—from casual talk to radio news.', 'L’affrication existe partout au Québec, de la rue aux bulletins radio.'),
    ],
    [['l’affrication', b('assibilation / affrication', 'passage de t/d à ts/dz')], ['le dîner', b('lunch (in Québec)', 'repas du midi au Québec')], ['un étudiant', b('a student', 'personne qui étudie')]],
  ),
  lesson(C, 2, ['lax-high-vowels-i-u-ou', 'relachement-de-i-u-ou'],
    b('Lax high vowels in closed syllables: vite, lune, route', 'Relâchement de i, u, ou en syllabe fermée'),
    b('Hear why vite, lune and route sound slightly looser in Québec than vie, rue and loup.', 'Entendre pourquoi vite, lune et route sont plus relâchés au Québec que vie, rue et loup.'),
    [b('Distinguish open syllables (vie, rue, loup) from closed ones (vite, jupe, route)', 'Distinguer syllabes ouvertes et fermées pour i, u, ou'), b('Know which consonants keep vowels tense (r, z, j, v: livre, rouge)', 'Savoir quelles consonnes gardent la voyelle tendue (r, z, j, v)'), b('Recognise Québec minimal pairs like petite vs pâte in context', 'Reconnaître ces timbres en écoute réelle')],
    13,
    [
      card(b('Laxing in closed syllables', 'Le relâchement en syllabe fermée'), b('In Québec, the high vowels **i, u, ou** stay tight and crisp in **open syllables** (**la vie, la rue, le loup**) and before **lengthening consonants r, z, j, v** (**le livre, rouge, la juge, la rive**). But in a **closed syllable** ending in most other consonants (**p, t, k, l, n, s…**), they relax slightly toward **[ɪ, ʏ, ʊ]**: **vite** (almost like English *fit*), **la jupe**, **la route**, **la soupe**.', 'Au Québec, **i, u, ou** restent très tendus en **syllabe ouverte** (**la vie, la rue, le loup**) et devant **r, z, j, v** (**le livre, rouge, la juge, la rive**). En **syllabe fermée** devant les autres consonnes (**p, t, k, l, n, s…**), ils se relâchent vers **[ɪ, ʏ, ʊ]** : **vite**, **la jupe**, **la route**, **la soupe**.'), {
        ex: [['la vie, la rue, le loup', 'open syllable → tense [i, y, u]'], ['vite, la jupe, la route', 'closed syllable → lax [ɪ, ʏ, ʊ]'], ['le livre, rouge, la juge', 'before r, j, z, v → stays tense']],
      }),
      culture(b('Why foreigners mishear « petite » or « route »', 'Pourquoi on confond parfois « petite » ou « route »'), b('If you expect Parisian tight [i] in **petite** or [u] in **route**, a Québec speaker’s relaxed **[pətsɪt]** or **[ʁʊt]** can briefly catch you off guard—yet the **consonant frame** makes the word crystal clear once you know the rule!', 'Si l’on attend un [i] très serré dans **petite** ou un [u] dans **route**, le timbre relâché québécois surprend au début, mais le contexte et la règle le rendent aussitôt reconnaissable !')),
      hear('La petite fille court vite sur la route avec sa jupe bleue.', b('In Québec pronunciation, which words have a laxed high vowel?', 'Dans cette phrase au Québec, quels mots subissent le relâchement ?'), [b('petite, vite, route, jupe (all closed by t or p)', 'petite, vite, route, jupe (syllabes fermées par t ou p)'), b('Only « fille » and « bleue »', 'Seulement « fille » et « bleue »'), b('None, every vowel stays tense here', 'Aucun, toutes les voyelles restent tendues'), b('Only « sur » because it ends in r', 'Seulement « sur » parce qu’il finit par r')], { voice: 'f2' }),
      sort(b('Tense in Québec (open / before r,j,v,z) or laxed (closed)?', 'Tendu au Québec (ouvert / devant r,j,v,z) ou relâché (fermé) ?'), [b('tense [i, y, u]', 'tendu [i, y, u]'), b('laxed [ɪ, ʏ, ʊ]', 'relâché [ɪ, ʏ, ʊ]')], [['la vie', 0], ['vite', 1], ['la rue', 0], ['la jupe', 1], ['le loup', 0], ['la route', 1]], { listen: true }),
      mc(P.choose, [b('« le livre » and « la valise » (before r and z, which keep the vowel tense)', '« le livre » et « la valise » (devant r et z, la voyelle reste tendue)'), b('« la minute » and « la soupe » (before t and p)', '« la minute » et « la soupe » (devant t et p)'), b('« la lune » and « la boucle » (before n and cl)', '« la lune » et « la boucle » (devant n et cl)'), b('« la musique » and « le groupe » (before k and p)', '« la musique » et « le groupe » (devant k et p)')], { fr: 'Dans quels mots québécois i, u ou ou restent-ils tendus malgré la consonne finale ?' }),
      dict('La route est calme ce soir, mais la soupe refroidit vite.', { voice: 'm2' }),
      say('La vie dans la rue est calme, mais la voiture roule vite sur la route.', 'Life in the street is calm, but the car drives fast on the road.', { tip: b('Notice open vie, rue vs closed vite, route (and assibilated voiture!).', 'Observez vie, rue ouverts face à vite, route fermés (et l’affrication de voiture !).') }),
    ],
    [
      b('Open syllables (vie, rue, loup) keep tense [i, y, u] everywhere.', 'Syllabes ouvertes (vie, rue, loup) : voyelles tendues [i, y, u] partout.'),
      b('Closed by p, t, k, l, n, s…: Québec relaxes i, u, ou → [ɪ, ʏ, ʊ].', 'Fermées par p, t, k, l, n, s… : i, u, ou se relâchent au Québec.'),
      b('Before r, z, j, v (livre, juge, valise, rive): vowels stay tense and long.', 'Devant r, z, j, v (livre, juge, valise, rive) : voyelles tendues et longues.'),
    ],
    [['la syllabe fermée', b('a closed syllable (ends in consonant sound)', 'syllabe terminée par une consonne')], ['le relâchement', b('vowel laxing', 'articulation plus détendue')], ['la jupe', b('the skirt', 'vêtement')]],
  ),
  lesson(C, 3, ['diphthongs-and-open-vowels-quebec', 'diphtongaison-et-voyelles-quebecoises'],
    b('Diphthongisation and preserved contrasts: fête, pâte, brin/brun', 'Diphtongaison et contrastes conservés : fête, pâte, brin/brun'),
    b('Hear Québec long-vowel glides (fête [faɛt], chaud) and classic contrasts lost in Paris.', 'Entendre les diphtongues québécoises et les contrastes perdus à Paris.'),
    [b('Hear diphthongisation on long closed syllables (fête, neige, pâte)', 'Entendre la diphtongaison en syllabe fermée longue (fête, neige, pâte)'), b('Recognise Québec’s preserved pâte/patte and brin/brun pairs', 'Reconnaître les paires conservées pâte/patte et brin/brun'), b('Distinguish informal moi [mwɛ] from formal [mwa]', 'Situer le registre entre [mwɛ] familier et [mwa] soutenu')],
    13,
    [
      card(b('Rich vowels preserved in Québec', 'Des timbres conservés au Québec'), b('In Québec, **long vowels inside closed syllables** often glide smoothly through two shades (**diphthongisation**): **la fête** → *[faɛt]*, **la neige** → *[naɛʒ]*, **le père** → *[paɛʁ]*, **la pâte** → *[pɑɔt]*, **il fait chaud** → *[ʃoʊ]*. Even better, Québec **preserves** contrasts that merged in Paris: **la patte** [a] vs **la pâte** [ɑ], **la tache** vs **la tâche**, and **un brin** [ɛ̃] vs **un fil brun** [œ̃]!', 'Au Québec, les **voyelles longues en syllabe fermée** glissent souvent sur deux nuances (**diphtongaison**) : **la fête** → *[faɛt]*, **la neige** → *[naɛʒ]*, **le père** → *[paɛʁ]*, **la pâte** → *[pɑɔt]*, **chaud** → *[ʃoʊ]*. De plus, le Québec **conserve** des distinctions perdues à Paris : **la patte / la pâte**, **la tache / la tâche**, **un brin / un fil brun** !'), {
        ex: [['la fête, la neige, le père', 'long stressed ê/è glides in Québec'], ['la patte / la pâte', 'front [a] vs back [ɑ] kept distinct'], ['un brin d’herbe / un fil brun', '[ɛ̃] vs [œ̃] kept distinct']],
      }),
      trap(b('Moi: [mwɛ] vs [mwa]', 'Moi : [mwɛ] contre [mwa]'), b('In casual Montréal talk, **moi, toi, froid** often sound like *[mwɛ, twɛ, fʁwɛ]* (actually the older royal pronunciation!). On TV news or in formal meetings, speakers use standard **[wa]** (*moi, froid*). Understand both; aim for **[wa]** when speaking.', 'En parler familier au Québec, **moi, toi, froid** sonnent souvent *[mwɛ, twɛ, fʁwɛ]*. À la télévision ou en réunion formelle, on emploie **[wa]**. Comprenez les deux, et gardez **[wa]** pour parler.')),
      hear('Il fait froid pendant la fête d’hiver, mais la tarte à la pâte maison est chaude.', b('Which two words in Québec commonly show diphthongisation in a closed syllable?', 'Quels mots peuvent diphtonguer en syllabe fermée au Québec ?'), [b('fête and pâte (plus chaude)', 'fête et pâte (ainsi que chaude)'), b('il and est only', 'il et est uniquement'), b('à and la only', 'à et la uniquement'), b('maison and d’hiver only', 'maison et d’hiver uniquement')], { voice: 'm2' }),
      pairs(b('Match each pair that Québec French keeps clearly distinct by vowel.', 'Associez chaque paire dont le Québec distingue encore nettement les voyelles.'), [['la patte', 'la pâte'], ['la tache', 'la tâche'], ['mettre', 'le maître'], ['un brin d’herbe', 'un fil brun']], true),
      mc(P.choose, [b('« un » [œ̃] (rounded lips, like brun) vs « in » [ɛ̃] (spread lips, like brin)', '« un » [œ̃] (lèvres arrondies, brun) contre « in » [ɛ̃] (lèvres étirées, brin)'), b('Both merged completely into [ɛ̃] in Québec', 'Les deux ont totalement fusionné en [ɛ̃] au Québec'), b('« un » became oral [y] in Québec', '« un » est devenu oral [y] au Québec'), b('« in » became [ɔ̃] before consonants', '« in » est devenu [ɔ̃] devant les consonnes')], { fr: 'Quelle distinction nasale le Québec maintient-il nettement ?' }),
      dict('La fête d’hiver approche : prépare la pâte et vérifie la neige dehors.', { voice: 'f2' }),
      say('Pendant la fête d’hiver, mon père prépare une pâte chaude pendant qu’il neige.', 'During the winter festival, my father makes a warm dough while it snows.', { tip: b('Keep clear French [wa] in froid/moi while listening openly to regional glides.', 'Gardez un [wa] clair en parlant tout en reconnaissant les diphtongues québécoises.') }),
    ],
    [
      b('Long closed syllables (fête, neige, pâte) often diphthongise in Québec.', 'Les syllabes fermées longues (fête, neige, pâte) diphtonguent souvent au Québec.'),
      b('Québec keeps classic contrasts alive: patte/pâte, tache/tâche, brin/brun.', 'Le Québec garde patte/pâte, tache/tâche et brin/brun distincts.'),
      b('Casual [mwɛ] (moi) coexists with formal [mwa]—understand both, speak [wa].', '[mwɛ] familier coexiste avec [mwa] soutenu : comprenez les deux.'),
    ],
    [['la pâte', b('dough, pastry', 'mélange de farine et d’eau')], ['la patte', b('paw, animal leg', 'membre d’un animal')], ['la diphtongaison', b('diphthongisation', 'glissement d’une voyelle vers deux timbres')]],
  ),
];
