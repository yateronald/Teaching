import { b, type Lesson } from '../../types';
import { card, pick } from '../kit';

const lessons: Lesson[] = [
  {
    id: 'weather-seasons-1',
    slug: { en: 'what-is-the-weather-like', fr: 'quel-temps-fait-il' },
    title: b('What’s the weather like?', 'Quel temps fait-il ?'),
    summary: b('Talk about the weather with il fait, il y a, il pleut, il neige.', 'Parler de la météo avec il fait, il y a, il pleut, il neige.'),
    objectives: [b('Use il fait + adjective', 'Employer il fait + adjectif'), b('Use il y a + noun and weather verbs', 'Employer il y a + nom et les verbes de la météo'), b('Give the temperature', 'Donner la température')],
    minutes: 12,
    steps: [
      card(b('Three structures', 'Trois structures'), b('**Il fait** + adjective: il fait **beau**, **chaud**, **froid**, **gris**, **doux**. **Il y a** + noun: il y a **du soleil**, **du vent**, **des nuages**, **du brouillard**. Verbs: **il pleut** (pleuvoir), **il neige** (neiger).', '**Il fait** + adjectif : il fait **beau**, **chaud**, **froid**, **gris**, **doux**. **Il y a** + nom : il y a **du soleil**, **du vent**, **des nuages**, **du brouillard**. Verbes : **il pleut** (pleuvoir), **il neige** (neiger).'), {
        examples: [{ fr: 'Aujourd’hui, il fait beau et il y a du soleil.', tr: 'Today the weather is nice and it’s sunny.' }, { fr: 'Il pleut depuis ce matin.', tr: 'It’s been raining since this morning.' }, { fr: 'Il fait moins quinze degrés et il neige.', tr: 'It’s minus fifteen degrees and snowing.' }],
      }),
      { kind: 'categorize', prompt: b('Il fait… or il y a… ?', 'Il fait… ou il y a… ?'), buckets: [b('Il fait…', 'Il fait…'), b('Il y a…', 'Il y a…')], items: [{ text: 'chaud', bucket: 0 }, { text: 'du vent', bucket: 1 }, { text: 'froid', bucket: 0 }, { text: 'des nuages', bucket: 1 }, { text: 'beau', bucket: 0 }, { text: 'du soleil', bucket: 1 }] },
      pick('A1', b('Choose the right word.', 'Choisissez le bon mot.'), ['fait', 'est', 'a', 'y a'], { fr: 'En juillet, il ___ très chaud.' }),
      pick('A1', b('Choose the right word.', 'Choisissez le bon mot.'), ['y a', 'fait', 'est', 'a'], { fr: 'Prends ton parapluie, il ___ de gros nuages.' }),
      pick('A1', b('Which sentence means “it is snowing”?', 'Quelle phrase signifie « it is snowing » ?'), ['Il neige.', 'Il pleut.', 'Il fait neige.', 'Il y a neige.']),
      { kind: 'match', prompt: b('Match each sentence with the weather.', 'Associez chaque phrase à la météo.'), pairs: [['Il pleut.', b('rain', 'la pluie')], ['Il neige.', b('snow', 'la neige')], ['Il y a du vent.', b('wind', 'le vent')], ['Il fait beau.', b('nice weather', 'le beau temps')], ['Il y a du brouillard.', b('fog', 'le brouillard')]] },
      { kind: 'speak', prompt: b('Say it aloud.', 'Dites-le à voix haute.'), text: 'Aujourd’hui, il fait beau et il y a du soleil.', tr: 'Today the weather is nice and it’s sunny.' },
    ],
    notes: {
      points: [
        b('Il fait + adjective: beau, chaud, froid, doux, gris, humide.', 'Il fait + adjectif : beau, chaud, froid, doux, gris, humide.'),
        b('Il y a + du / des + noun: du soleil, du vent, des nuages.', 'Il y a + du / des + nom : du soleil, du vent, des nuages.'),
        b('Weather verbs: il pleut, il neige (no other subject possible).', 'Verbes de la météo : il pleut, il neige (pas d’autre sujet possible).'),
        b('Temperature: il fait vingt degrés, il fait moins dix.', 'Température : il fait vingt degrés, il fait moins dix.'),
      ],
      vocab: [['le parapluie', b('umbrella', 'protège de la pluie')], ['le nuage', b('cloud', 'masse grise dans le ciel')], ['doux', b('mild', 'ni chaud ni froid')], ['le degré', b('degree', 'unité de température')], ['la météo', b('weather forecast', 'prévisions du temps')]],
    },
  },
  {
    id: 'weather-seasons-2',
    slug: { en: 'seasons-and-months', fr: 'saisons-et-mois' },
    title: b('Seasons, months and activities', 'Les saisons, les mois et les activités'),
    summary: b('Name the seasons and months and say what you do at each time of year.', 'Nommer les saisons et les mois et dire ce que vous faites à chaque moment de l’année.'),
    objectives: [b('Name the four seasons and twelve months', 'Nommer les quatre saisons et les douze mois'), b('Use en / au with seasons and months', 'Employer en / au avec les saisons et les mois'), b('Talk about seasonal activities', 'Parler des activités de saison')],
    minutes: 13,
    steps: [
      card(b('En été, au printemps', 'En été, au printemps'), b('Seasons: **en été** (summer), **en automne** (autumn), **en hiver** (winter), but **au printemps** (spring). Months: **en janvier** or **au mois de janvier**. Months and seasons take no capital letter.', 'Saisons : **en été**, **en automne**, **en hiver**, mais **au printemps**. Mois : **en janvier** ou **au mois de janvier**. Mois et saisons s’écrivent sans majuscule.'), {
        examples: [{ fr: 'Au printemps, les arbres fleurissent.', tr: 'In spring, the trees blossom.' }, { fr: 'En hiver, on fait du ski.', tr: 'In winter, we go skiing.' }, { fr: 'Mon anniversaire est en octobre.', tr: 'My birthday is in October.' }],
      }),
      { kind: 'flashcards', title: b('The months', 'Les mois'), cards: [{ fr: 'janvier', tr: 'January' }, { fr: 'février', tr: 'February' }, { fr: 'mars', tr: 'March' }, { fr: 'avril', tr: 'April' }, { fr: 'mai', tr: 'May' }, { fr: 'juin', tr: 'June' }, { fr: 'juillet', tr: 'July' }, { fr: 'août', tr: 'August' }, { fr: 'septembre', tr: 'September' }, { fr: 'octobre', tr: 'October' }, { fr: 'novembre', tr: 'November' }, { fr: 'décembre', tr: 'December' }] },
      pick('A1', b('Choose the right word.', 'Choisissez le bon mot.'), ['au', 'en', 'à', 'le'], { fr: '___ printemps, il fait doux.' }),
      pick('A1', b('Choose the right word.', 'Choisissez le bon mot.'), ['en', 'au', 'à la', 'dans'], { fr: '___ hiver, il neige beaucoup au Québec.' }),
      pick('A1', b('Which month comes after “juin”?', 'Quel mois vient après « juin » ?'), ['juillet', 'août', 'mai', 'septembre']),
      { kind: 'categorize', prompt: b('In which season?', 'En quelle saison ?'), buckets: [b('Summer', 'Été'), b('Winter', 'Hiver')], items: [{ text: 'nager à la plage', bucket: 0 }, { text: 'faire du ski', bucket: 1 }, { text: 'faire un barbecue', bucket: 0 }, { text: 'faire un bonhomme de neige', bucket: 1 }, { text: 'patiner sur un lac gelé', bucket: 1 }, { text: 'manger une crème glacée', bucket: 0 }] },
      { kind: 'fill', prompt: b('Complete.', 'Complétez.'), text: '___ automne, les feuilles tombent. ___ printemps, elles repoussent.', answers: [['En'], ['Au']] },
      { kind: 'speak', prompt: b('Say it aloud.', 'Dites-le à voix haute.'), text: 'En hiver, j’aime faire du ski et boire un chocolat chaud.', tr: 'In winter I like skiing and drinking hot chocolate.' },
    ],
    notes: {
      points: [
        b('En été, en automne, en hiver, but au printemps.', 'En été, en automne, en hiver, mais au printemps.'),
        b('Months: en janvier / au mois de janvier.', 'Mois : en janvier / au mois de janvier.'),
        b('No capital letters for months and seasons.', 'Pas de majuscule aux mois ni aux saisons.'),
        b('Activities: faire du ski, faire du vélo, aller à la plage, patiner.', 'Activités : faire du ski, faire du vélo, aller à la plage, patiner.'),
      ],
      vocab: [['la saison', b('season', 'période de l’année')], ['la feuille', b('leaf', 'partie verte de l’arbre')], ['patiner', b('to skate', 'glisser sur la glace')], ['la crème glacée (Québec)', b('ice cream', 'la glace')], ['le bonhomme de neige', b('snowman', 'personnage en neige')]],
    },
  },
  {
    id: 'weather-seasons-3',
    slug: { en: 'the-weather-forecast', fr: 'le-bulletin-meteo' },
    title: b('The weather forecast', 'Le bulletin météo'),
    summary: b('Understand a simple weather forecast and talk about tomorrow’s weather with the future.', 'Comprendre un bulletin météo simple et parler du temps de demain avec le futur.'),
    objectives: [b('Understand a radio forecast', 'Comprendre une météo à la radio'), b('Talk about tomorrow: il va pleuvoir / il fera beau', 'Parler de demain : il va pleuvoir / il fera beau'), b('Plan an activity according to the weather', 'Prévoir une activité selon la météo')],
    minutes: 13,
    steps: [
      card(b('Tomorrow’s weather', 'Le temps de demain'), b('Near future: **il va pleuvoir**, **il va faire froid**. Forecast style (futur simple): **il fera** beau, **il pleuvra**, **il neigera**, **il y aura** du vent. **Des averses** = showers; **une tempête** = a storm; **la canicule** = a heatwave.', 'Futur proche : **il va pleuvoir**, **il va faire froid**. Style du bulletin (futur simple) : **il fera** beau, **il pleuvra**, **il neigera**, **il y aura** du vent. **Des averses**, **une tempête**, **la canicule**.'), {
        examples: [{ fr: 'Demain, il fera beau le matin, mais il y aura des averses l’après-midi.', tr: 'Tomorrow will be sunny in the morning, but there will be showers in the afternoon.' }, { fr: 'Ce week-end, il va neiger dans les Laurentides.', tr: 'This weekend it is going to snow in the Laurentians.' }],
      }),
      { kind: 'mcq', prompt: b('Listen to the forecast. What will the weather be like in the afternoon?', 'Écoutez la météo. Quel temps fera-t-il l’après-midi ?'), audio: 'Bonjour ! Demain matin, du soleil sur toute la région. L’après-midi, les nuages arriveront et il y aura des averses. Températures entre douze et dix-huit degrés.', listen: true, voice: 'f2', options: [b('Showers', 'Des averses'), b('Sunny all day', 'Du soleil toute la journée'), b('Snow', 'De la neige'), b('A heatwave', 'La canicule')], answer: 0 },
      { kind: 'mcq', prompt: b('Listen again. What is the highest temperature?', 'Réécoutez. Quelle est la température maximale ?'), audio: 'Bonjour ! Demain matin, du soleil sur toute la région. L’après-midi, les nuages arriveront et il y aura des averses. Températures entre douze et dix-huit degrés.', listen: true, voice: 'f2', options: ['18 °C', '12 °C', '16 °C', '28 °C'], answer: 0 },
      pick('A1', b('Choose the right form.', 'Choisissez la bonne forme.'), ['fera', 'fait', 'faisait', 'faire'], { fr: 'Demain, il ___ très chaud.' }),
      pick('A1', b('Choose the right form.', 'Choisissez la bonne forme.'), ['va pleuvoir', 'va pleut', 'pleuvoir', 'vas pleuvoir'], { fr: 'Regarde ces nuages : il ___ !' }),
      { kind: 'dialogue', title: b('Plans for Saturday', 'Les projets de samedi'), scene: b('Choose the best reply.', 'Choisissez la meilleure réponse.'), speakers: [{ name: 'Amie', voice: 'f', side: 'l' }, { name: 'Vous', voice: 'm', side: 'r' }], lines: [
        { s: 0, fr: 'On fait un pique-nique samedi ?', tr: 'Shall we have a picnic on Saturday?' },
        { s: 1, choose: { options: ['Bonne idée, mais la météo dit qu’il va pleuvoir. On va au cinéma plutôt ?', 'Il pleut samedi hier.', 'Oui, il neige, super pour un pique-nique.'], answer: 0 } },
        { s: 0, fr: 'D’accord, va pour le cinéma !', tr: 'OK, let’s go to the cinema!' },
      ] },
      { kind: 'speak', prompt: b('Say it aloud.', 'Dites-le à voix haute.'), text: 'Demain, il fera beau le matin, mais il y aura des averses l’après-midi.', tr: 'Tomorrow will be sunny in the morning, but there will be showers in the afternoon.' },
    ],
    notes: {
      points: [
        b('Near future: il va pleuvoir / neiger / faire beau.', 'Futur proche : il va pleuvoir / neiger / faire beau.'),
        b('Forecast future: il fera, il pleuvra, il neigera, il y aura.', 'Futur du bulletin : il fera, il pleuvra, il neigera, il y aura.'),
        b('Forecast words: des averses, une tempête, la canicule, des éclaircies.', 'Mots du bulletin : des averses, une tempête, la canicule, des éclaircies.'),
        b('Temperatures: entre douze et dix-huit degrés.', 'Températures : entre douze et dix-huit degrés.'),
      ],
      vocab: [['une averse', b('a shower (rain)', 'pluie courte')], ['une éclaircie', b('a sunny spell', 'moment de soleil')], ['la canicule', b('heatwave', 'grosse chaleur')], ['la tempête', b('storm', 'vent et pluie forts')], ['la région', b('area, region', 'territoire')]],
    },
  },
];

export default lessons;
