// A1 · Postcard. Léa writes to her grandmother from Marseille: the hotel,
// the beach, the food and the weather. Talking about the weather.
import { b } from '../../types';
import type { ReadingText } from '../types';

const text: ReadingText = {
  id: 'une-carte-postale-de-marseille',
  warmup: b(
    'You are on holiday and you write a postcard. What do you say about the place, your days and the weather?',
    'Vous êtes en vacances et vous écrivez une carte postale. Que racontez-vous sur le lieu, vos journées et la météo ?',
  ),
  paras: [
    { s: [['Chère Mamie,', 'Dear Grandma,']] },
    { s: [
      ['Je suis à Marseille avec Paul depuis lundi.', 'I have been in Marseille with Paul since Monday.'],
      ['Notre hôtel est petit, mais il est très joli et il est à côté de la mer.', 'Our hotel is small, but it is very pretty and it is next to the sea.'],
      ['Il fait beau et chaud : il fait vingt-huit degrés !', 'The weather is nice and hot: it is twenty-eight degrees!'],
    ] },
    { s: [
      ['Le matin, nous allons à la plage et nous nageons.', 'In the morning, we go to the beach and we swim.'],
      ['L’après-midi, nous visitons la ville à pied.', 'In the afternoon, we visit the town on foot.'],
      ['Le soir, nous mangeons du poisson au Vieux-Port.', 'In the evening, we eat fish at the Old Port.'],
      ['C’est délicieux !', 'It’s delicious!'],
    ] },
    { s: [
      ['Aujourd’hui, il y a du vent et il pleut un peu, alors nous allons au musée.', 'Today it is windy and raining a little, so we are going to the museum.'],
    ] },
    { s: [
      ['Nous rentrons à Paris dimanche.', 'We are going back to Paris on Sunday.'],
      ['Je t’embrasse très fort.', 'Lots of love.'],
    ] },
    { lines: true, s: [['Léa', 'Léa']] },
  ],
  glossary: [
    { fr: 'Chère Mamie', tr: b('Dear Grandma', 'pour commencer une carte à sa grand-mère') },
    { fr: 'depuis lundi', tr: b('since Monday', 'à partir de lundi, et encore aujourd’hui') },
    { fr: 'à côté de', tr: b('next to', 'tout près de') },
    { fr: 'Il fait beau', tr: b('the weather is nice', 'il y a du soleil, le temps est agréable') },
    { fr: 'chaud', tr: b('hot, warm', 'le contraire de froid') },
    { fr: 'degrés', tr: b('degrees (temperature)', 'l’unité de la température') },
    { fr: 'nous nageons', tr: b('we swim', 'nous allons dans l’eau et nous avançons avec les bras et les jambes') },
    { fr: 'à pied', tr: b('on foot', 'en marchant') },
    { fr: 'délicieux', tr: b('delicious', 'très bon') },
    { fr: 'il y a du vent', tr: b('it is windy', 'l’air bouge fort') },
    { fr: 'il pleut', tr: b('it is raining', 'l’eau tombe du ciel') },
    { fr: 'Je t’embrasse', tr: b('lots of love (to end a card)', 'pour finir une carte à une personne proche') },
  ],
  questions: [
    {
      q: 'Qui écrit cette carte, et à qui ?',
      qEn: 'Who is writing this card, and to whom?',
      options: ['Léa, à sa grand-mère', 'Paul, à sa mère', 'La grand-mère, à Léa', 'Léa, à une amie'],
      answer: 0,
      evidence: ['Chère Mamie,', 'Léa'],
      explain: b(
        'The card starts with “Chère Mamie” (grandma) and is signed “Léa”.',
        'La carte commence par « Chère Mamie » et elle est signée « Léa ».',
      ),
      skill: 'global',
    },
    {
      q: 'Depuis quand Léa est-elle à Marseille ?',
      qEn: 'Since when has Léa been in Marseille?',
      options: ['Depuis dimanche', 'Depuis lundi', 'Depuis une semaine', 'Depuis hier'],
      answer: 1,
      evidence: 'depuis lundi',
      explain: b(
        '“Je suis à Marseille avec Paul depuis lundi.” Depuis + day: she arrived on Monday and she is still there.',
        '« Je suis à Marseille avec Paul depuis lundi. » Depuis + jour : elle est arrivée lundi et elle est encore là.',
      ),
      skill: 'detail',
    },
    {
      q: 'Où est l’hôtel ?',
      qEn: 'Where is the hotel?',
      options: ['Au centre de Paris', 'À côté de la mer', 'À côté du musée', 'Loin de la plage'],
      answer: 1,
      evidence: 'il est à côté de la mer',
      explain: b(
        '“Notre hôtel est petit, mais il est très joli et il est à côté de la mer.”',
        '« Notre hôtel est petit, mais il est très joli et il est à côté de la mer. »',
      ),
      skill: 'detail',
    },
    {
      q: 'Que font Léa et Paul le matin ?',
      qEn: 'What do Léa and Paul do in the morning?',
      options: ['Ils visitent la ville', 'Ils vont à la plage', 'Ils mangent du poisson', 'Ils vont au musée'],
      answer: 1,
      evidence: 'Le matin, nous allons à la plage et nous nageons.',
      explain: b(
        'Morning: the beach. Afternoon: the town. Evening: fish at the Old Port.',
        'Le matin : la plage. L’après-midi : la ville. Le soir : du poisson au Vieux-Port.',
      ),
      skill: 'detail',
    },
    {
      q: 'Quel temps fait-il aujourd’hui ?',
      qEn: 'What is the weather like today?',
      options: ['Il fait beau et chaud', 'Il neige', 'Il y a du vent et il pleut un peu', 'Il fait très froid'],
      answer: 2,
      evidence: 'il y a du vent et il pleut un peu',
      explain: b(
        'Careful: “il fait beau et chaud” is about the first days. Today, “il y a du vent et il pleut un peu”.',
        'Attention : « il fait beau et chaud », ce sont les premiers jours. Aujourd’hui, « il y a du vent et il pleut un peu ».',
      ),
      skill: 'detail',
    },
    {
      q: 'Pourquoi Léa et Paul vont-ils au musée aujourd’hui ?',
      qEn: 'Why are Léa and Paul going to the museum today?',
      options: ['Parce qu’il fait mauvais', 'Parce que la plage est fermée', 'Parce qu’ils rentrent à Paris', 'Parce que Mamie aime les musées'],
      answer: 0,
      evidence: 'alors nous allons au musée',
      explain: b(
        '“Alors” gives the consequence: it is windy and raining, so they go to the museum and not to the beach.',
        '« Alors » donne la conséquence : il y a du vent et il pleut, donc ils vont au musée et pas à la plage.',
      ),
      skill: 'inference',
    },
  ],
  focus: {
    title: b('Talking about the weather', 'Parler de la météo'),
    body: b(
      'French uses the impersonal __il__: __il fait__ + adjective (il fait **beau**, **chaud**, **froid**), __il y a__ + du / de la (il y a **du vent**, **du soleil**), and a verb for rain and snow: __il pleut__, __il neige__. The temperature: __il fait vingt-huit degrés__.',
      'Le français utilise le __il__ impersonnel : __il fait__ + adjectif (il fait **beau**, **chaud**, **froid**), __il y a__ + du / de la (il y a **du vent**, **du soleil**), et un verbe pour la pluie et la neige : __il pleut__, __il neige__. La température : __il fait vingt-huit degrés__.',
    ),
    examples: [
      { fr: 'Il fait beau et chaud.', tr: 'The weather is nice and hot.' },
      { fr: 'Il y a du vent.', tr: 'It is windy.' },
      { fr: 'Il pleut un peu.', tr: 'It is raining a little.' },
    ],
  },
};

export default text;
