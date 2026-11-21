import type { CourseAbout, Doc } from '../../types';
import { b, card, dict, doc, lesson, mc, P, pairs, say, sort, tip } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'French poetry is music as much as meaning: syllables counted, rhymes, repetitions, images. This course reads famous public-domain poems by Victor Hugo (Demain, dès l’aube), Paul Verlaine (Chanson d’automne), Charles Baudelaire (L’Albatros) and Guillaume Apollinaire (Le Pont Mirabeau), and teaches you the tools to appreciate them: the alexandrine and the mute e, rhyme and rhythm, metaphor and symbol, and how to read a poem aloud.',
    'La poésie française est musique autant que sens : syllabes comptées, rimes, répétitions, images. Ce cours lit des poèmes célèbres du domaine public de Victor Hugo (Demain, dès l’aube), Paul Verlaine (Chanson d’automne), Charles Baudelaire (L’Albatros) et Guillaume Apollinaire (Le Pont Mirabeau), et vous donne les outils pour les apprécier : l’alexandrin et le e muet, la rime et le rythme, la métaphore et le symbole, et la lecture à voix haute.',
  ),
  outcomes: [
    b('Count syllables and recognise the alexandrine', 'Compter les syllabes et reconnaître l’alexandrin'),
    b('Recognise rhyme, repetition and musicality', 'Reconnaître la rime, la répétition et la musicalité'),
    b('Interpret metaphors and symbols', 'Interpréter métaphores et symboles'),
    b('Read a poem aloud with the right rhythm', 'Lire un poème à voix haute avec le bon rythme'),
  ],
};

const HUGO: Doc = { look: 'page', title: b('Victor Hugo, « Demain, dès l’aube » (1856)', 'Victor Hugo, « Demain, dès l’aube » (1856)'), text: 'Demain, dès l’aube, à l’heure où blanchit la campagne,\nJe partirai. Vois-tu, je sais que tu m’attends.\nJ’irai par la forêt, j’irai par la montagne.\nJe ne puis demeurer loin de toi plus longtemps.\n\nJe marcherai les yeux fixés sur mes pensées,\nSans rien voir au dehors, sans entendre aucun bruit,\nSeul, inconnu, le dos courbé, les mains croisées,\nTriste, et le jour pour moi sera comme la nuit.\n\nJe ne regarderai ni l’or du soir qui tombe,\nNi les voiles au loin descendant vers Harfleur,\nEt quand j’arriverai, je mettrai sur ta tombe\nUn bouquet de houx vert et de bruyère en fleur.', source: b('Les Contemplations – public domain', 'Les Contemplations – domaine public') };
const VERLAINE: Doc = { look: 'page', title: b('Paul Verlaine, « Chanson d’automne » (1866), first stanza', 'Paul Verlaine, « Chanson d’automne » (1866), première strophe'), text: 'Les sanglots longs\nDes violons\nDe l’automne\nBlessent mon cœur\nD’une langueur\nMonotone.', source: b('Poèmes saturniens – public domain', 'Poèmes saturniens – domaine public') };
const BAUDELAIRE: Doc = { look: 'page', title: b('Charles Baudelaire, « L’Albatros » (1861), first and last stanzas', 'Charles Baudelaire, « L’Albatros » (1861), première et dernière strophes'), text: 'Souvent, pour s’amuser, les hommes d’équipage\nPrennent des albatros, vastes oiseaux des mers,\nQui suivent, indolents compagnons de voyage,\nLe navire glissant sur les gouffres amers.\n\n[…]\n\nLe Poète est semblable au prince des nuées\nQui hante la tempête et se rit de l’archer ;\nExilé sur le sol au milieu des huées,\nSes ailes de géant l’empêchent de marcher.', source: b('Les Fleurs du mal – public domain', 'Les Fleurs du mal – domaine public') };
const APOLLINAIRE: Doc = { look: 'page', title: b('Guillaume Apollinaire, « Le Pont Mirabeau » (1913), opening', 'Guillaume Apollinaire, « Le Pont Mirabeau » (1913), début'), text: 'Sous le pont Mirabeau coule la Seine\nEt nos amours\nFaut-il qu’il m’en souvienne\nLa joie venait toujours après la peine\n\nVienne la nuit sonne l’heure\nLes jours s’en vont je demeure', source: b('Alcools – public domain', 'Alcools – domaine public') };

const C = 'r-poetry';
export default [
  lesson(C, 1, ['hugo-and-the-alexandrine', 'hugo-et-l-alexandrin'],
    b('Hugo and the alexandrine', 'Hugo et l’alexandrin'),
    b('Read « Demain, dès l’aube », count its syllables and discover its hidden meaning.', 'Lire « Demain, dès l’aube », compter ses syllabes et découvrir son sens caché.'),
    [b('Count the 12 syllables of an alexandrine', 'Compter les 12 syllabes d’un alexandrin'), b('Pronounce the mute e in verse', 'Prononcer le e muet en poésie'), b('Understand the final revelation', 'Comprendre la révélation finale')],
    13,
    [
      card(b('The alexandrine', 'L’alexandrin'), b('The great French line has **12 syllables**, often cut in the middle (6 + 6) by a pause called the **césure**. In verse, the **mute e** is pronounced before a consonant (**ver-te**, **cam-pa-gne**… but not at the end of a line or before a vowel).', 'Le grand vers français compte **12 syllabes**, souvent coupé au milieu (6 + 6) par une pause, la **césure**. En poésie, le **e muet** se prononce devant une consonne (mais pas en fin de vers ni devant une voyelle).'), {
        points: [b('De / main, / dès / l’au / be, / à / l’heu / re où / blan / chit / la / cam / pagne: 12 syllables (the final -gne does not count).', 'De / main, / dès / l’au / be, / à / l’heu / re où / blan / chit / la / cam / pagne : 12 syllabes (le -gne final ne compte pas).')],
      }),
      doc(HUGO, b('Where is the speaker going?', 'Où va le locuteur ?'), [b('To a grave: someone he loved has died.', 'Sur une tombe : un être aimé est mort.'), b('To meet a lover', 'Retrouver une amoureuse'), b('To the sea for a holiday', 'À la mer, en vacances'), b('To Harfleur to work', 'À Harfleur, pour travailler')]),
      doc(HUGO, b('Why does the speaker not look at the evening gold or the sails?', 'Pourquoi le locuteur ne regarde-t-il ni l’or du soir ni les voiles ?'), [b('His grief makes him blind to the world.', 'Son chagrin le rend aveugle au monde.'), b('It is night.', 'Il fait nuit.'), b('He is lost.', 'Il est perdu.'), b('He prefers the forest.', 'Il préfère la forêt.')]),
      tip(b('Context', 'Contexte'), b('Hugo wrote this poem for his daughter **Léopoldine**, drowned in 1843 at Villequier. The poem sounds like a meeting of lovers until the last stanza reveals the **tombe**.', 'Hugo a écrit ce poème pour sa fille **Léopoldine**, noyée en 1843 à Villequier. Le poème ressemble à un rendez-vous amoureux jusqu’à ce que la dernière strophe révèle la **tombe**.')),
      pairs(P.match, [['l’aube', b('dawn', 'lever du jour')], ['demeurer', b('to remain', 'rester')], ['courbé', b('bent, stooped', 'penché en avant')], ['la bruyère', b('heather', 'petite plante des landes')]]),
      say('Demain, dès l’aube, à l’heure où blanchit la campagne, je partirai.', 'Tomorrow, at dawn, when the countryside turns white, I will leave.', { tip: b('Pause slightly after « l’aube » and at the comma.', 'Marquez une légère pause après « l’aube » et à la virgule.') }),
    ],
    [
      b('Alexandrine = 12 syllables, césure after the 6th.', 'Alexandrin = 12 syllabes, césure après la 6e.'),
      b('Mute e counts before a consonant inside a line.', 'Le e muet compte devant une consonne à l’intérieur du vers.'),
      b('The revelation (ta tombe) gives the poem its meaning.', 'La révélation (ta tombe) donne au poème son sens.'),
    ],
    [['blanchir', b('to turn white, to grow pale', 'devenir blanc')], ['une voile', b('a sail', 'toile d’un bateau')], ['le houx', b('holly', 'arbuste à feuilles piquantes')]],
  ),
  lesson(C, 2, ['music-of-verlaine', 'la-musique-de-verlaine'],
    b('Verlaine: music and melancholy', 'Verlaine : musique et mélancolie'),
    b('Hear the sounds, rhymes and rhythm that create the feeling of « Chanson d’automne ».', 'Entendre les sons, rimes et rythmes qui créent l’émotion de « Chanson d’automne ».'),
    [b('Recognise short lines and rhymes', 'Reconnaître les vers courts et les rimes'), b('Hear repeated sounds (assonance)', 'Entendre les sons répétés (assonance)'), b('Interpret a metaphor', 'Interpréter une métaphore')],
    13,
    [
      card(b('Sounds that carry meaning', 'Des sons qui portent le sens'), b('Verlaine wanted « de la musique avant toute chose ». Here, **short lines** (4 and 3 syllables), the rhymes **-ons / -onne** and the nasal sounds **[ɔ̃] [ɑ̃]** (sanglots, longs, violons, monotone) imitate a slow, sad melody.', 'Verlaine voulait « de la musique avant toute chose ». Ici, les **vers courts** (4 et 3 syllabes), les rimes en **-ons / -onne** et les sons nasaux **[ɔ̃] [ɑ̃]** (sanglots, longs, violons, monotone) imitent une mélodie lente et triste.')),
      doc(VERLAINE, b('What are « les violons de l’automne »?', 'Que sont « les violons de l’automne » ?'), [b('A metaphor: the autumn wind sounds like crying violins.', 'Une métaphore : le vent d’automne ressemble à des violons qui pleurent.'), b('A real concert', 'Un vrai concert'), b('A music school', 'Une école de musique'), b('Birds', 'Des oiseaux')]),
      doc(VERLAINE, b('What feeling dominates?', 'Quel sentiment domine ?'), [b('A slow, weary sadness (langueur)', 'Une tristesse lente et lasse (langueur)'), b('Joy', 'La joie'), b('Anger', 'La colère'), b('Fear', 'La peur')]),
      sort(b('Which sound?', 'Quel son ?'), [b('[ɔ̃] as in « violon »', '[ɔ̃] comme dans « violon »'), b('[œʁ] as in « cœur »', '[œʁ] comme dans « cœur »')], [['sanglots', 0], ['longs', 0], ['violons', 0], ['cœur', 1], ['langueur', 1]]),
      pairs(P.match, [['un sanglot', b('a sob', 'pleur bruyant')], ['blesser', b('to wound', 'faire mal')], ['la langueur', b('languor, listlessness', 'faiblesse mélancolique')], ['monotone', b('monotonous', 'sans variation')]]),
      mc(P.meaning, [b('The same sad sounds repeat, like the endless autumn.', 'Les mêmes sons tristes se répètent, comme l’automne sans fin.'), b('The poem is boring.', 'Le poème est ennuyeux.'), b('The violins are out of tune.', 'Les violons sont faux.'), b('Autumn is short.', 'L’automne est court.')], { fr: 'Pourquoi le mot « Monotone » termine-t-il la strophe ?' }),
      dict('Les sanglots longs des violons de l’automne blessent mon cœur.', { voice: 'f' }),
    ],
    [
      b('Short lines and repeated nasal sounds create the music.', 'Vers courts et sons nasaux répétés créent la musique.'),
      b('Assonance = repetition of a vowel sound.', 'Assonance = répétition d’un son vocalique.'),
      b('Metaphor: the autumn wind = crying violins.', 'Métaphore : le vent d’automne = violons qui pleurent.'),
    ],
    [['une strophe', b('a stanza', 'groupe de vers')], ['la mélancolie', b('melancholy', 'tristesse vague')], ['une rime', b('a rhyme', 'retour d’un même son')]],
  ),
  lesson(C, 3, ['symbols-baudelaire-apollinaire', 'symboles-baudelaire-apollinaire'],
    b('Symbols: Baudelaire and Apollinaire', 'Symboles : Baudelaire et Apollinaire'),
    b('Interpret the albatross as a symbol of the poet, and the river as a symbol of passing time.', 'Interpréter l’albatros comme symbole du poète, et le fleuve comme symbole du temps qui passe.'),
    [b('Understand an extended comparison', 'Comprendre une comparaison filée'), b('Interpret a symbol', 'Interpréter un symbole'), b('Notice the absence of punctuation', 'Remarquer l’absence de ponctuation')],
    13,
    [
      doc(BAUDELAIRE, b('What does the poet compare himself to?', 'À quoi le poète se compare-t-il ?'), [b('The albatross: majestic in the sky, clumsy on the ground', 'À l’albatros : majestueux dans le ciel, maladroit au sol'), b('A sailor', 'À un marin'), b('An archer', 'À un archer'), b('A storm', 'À une tempête')]),
      doc(BAUDELAIRE, b('What does « Ses ailes de géant l’empêchent de marcher » mean for the poet?', 'Que signifie pour le poète « Ses ailes de géant l’empêchent de marcher » ?'), [b('His genius makes him unfit for ordinary life and mocked by others.', 'Son génie le rend inadapté à la vie ordinaire et moqué des autres.'), b('He cannot walk because he is ill.', 'Il ne peut pas marcher car il est malade.'), b('He prefers to fly in planes.', 'Il préfère voyager en avion.'), b('He is a giant.', 'C’est un géant.')]),
      doc(APOLLINAIRE, b('What does the Seine symbolise?', 'Que symbolise la Seine ?'), [b('Time and love that flow away', 'Le temps et l’amour qui s’écoulent'), b('Paris tourism', 'Le tourisme à Paris'), b('A flood', 'Une inondation'), b('A journey by boat', 'Un voyage en bateau')]),
      tip(b('No punctuation', 'Pas de ponctuation'), b('Apollinaire removed all **punctuation** from Alcools: the lines **flow** like the river, and the reader chooses the pauses. The refrain **Vienne la nuit sonne l’heure / Les jours s’en vont je demeure** opposes passing time and the poet who stays.', 'Apollinaire a supprimé toute **ponctuation** dans Alcools : les vers **coulent** comme le fleuve, et le lecteur choisit les pauses. Le refrain **Vienne la nuit sonne l’heure / Les jours s’en vont je demeure** oppose le temps qui passe et le poète qui reste.')),
      pairs(P.match, [['l’équipage', b('the crew', 'marins d’un navire')], ['les nuées', b('the clouds (poetic)', 'les nuages')], ['les huées', b('boos, jeers', 'cris de moquerie')], ['s’en aller', b('to go away', 'partir')]]),
      sort(b('Symbol of what?', 'Symbole de quoi ?'), [b('the poet', 'le poète'), b('passing time', 'le temps qui passe')], [['l’albatros', 0], ['la Seine qui coule', 1], ['les ailes de géant', 0], ['les jours s’en vont', 1]]),
      say('Sous le pont Mirabeau coule la Seine, et nos amours.', 'Under the Mirabeau bridge flows the Seine, and our loves.', { tip: b('Read slowly, letting the line flow without a hard stop.', 'Lisez lentement, en laissant couler le vers sans arrêt brutal.') }),
    ],
    [
      b('Extended comparison: the poet is like the albatross (Le Poète est semblable au…).', 'Comparaison filée : le poète est semblable à l’albatros.'),
      b('Symbol: the river = time and love passing.', 'Symbole : le fleuve = le temps et l’amour qui passent.'),
      b('Apollinaire: no punctuation, a flowing refrain.', 'Apollinaire : aucune ponctuation, un refrain qui coule.'),
    ],
    [['indolent', b('lazy, languid', 'nonchalant')], ['un gouffre', b('an abyss', 'précipice')], ['un refrain', b('a refrain', 'vers répété')]],
  ),
];
