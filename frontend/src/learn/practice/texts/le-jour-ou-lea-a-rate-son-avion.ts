// B1 · Story. Léa misses her flight on a snowy evening: telling a story
// with the passé composé (events) and the imparfait (background).
import { b } from '../../types';
import type { ReadingText } from '../types';

const text: ReadingText = {
  id: 'le-jour-ou-lea-a-rate-son-avion',
  warmup: b(
    'Have you ever been late for something important? Read what happened to Léa one snowy evening.',
    'Avez-vous déjà été en retard pour quelque chose d’important ? Lisez ce qui est arrivé à Léa un soir de neige.',
  ),
  paras: [
    { s: [
      ['C’était un vendredi de décembre.', 'It was a Friday in December.'],
      ['Léa devait prendre l’avion pour Paris à vingt heures : elle allait passer Noël avec sa famille.', 'Léa was supposed to fly to Paris at eight p.m.: she was going to spend Christmas with her family.'],
      ['Ses valises étaient prêtes depuis la veille.', 'Her suitcases had been ready since the day before.'],
    ] },
    { s: [
      ['À seize heures, elle a quitté le bureau et elle a appelé un taxi.', 'At four p.m., she left the office and called a taxi.'],
      ['Il neigeait beaucoup et les rues étaient pleines de voitures.', 'It was snowing hard and the streets were full of cars.'],
      ['Le taxi avançait très lentement.', 'The taxi was moving very slowly.'],
      ['Léa regardait sa montre toutes les deux minutes.', 'Léa kept looking at her watch every two minutes.'],
    ] },
    { s: [
      ['Quand elle est enfin arrivée à l’aéroport, il était dix-neuf heures quarante.', 'When she finally arrived at the airport, it was seven forty.'],
      ['Elle a couru jusqu’au comptoir, mais l’employé lui a dit que l’embarquement était terminé.', 'She ran to the counter, but the agent told her that boarding had closed.'],
      ['Léa a eu envie de pleurer.', 'Léa felt like crying.'],
    ] },
    { s: [
      ['Heureusement, l’employé a été très gentil.', 'Fortunately, the agent was very kind.'],
      ['Il a trouvé une place sur le vol du lendemain matin, sans frais supplémentaires.', 'He found her a seat on the next morning’s flight, at no extra cost.'],
      ['Léa a dormi dans un petit hôtel près de l’aéroport et elle est arrivée à Paris le samedi soir, juste à temps pour le repas de famille.', 'Léa slept in a small hotel near the airport and arrived in Paris on Saturday evening, just in time for the family dinner.'],
    ] },
    { s: [
      ['Depuis ce jour, elle part toujours à l’aéroport avec trois heures d’avance !', 'Since that day, she always leaves for the airport three hours early!'],
    ] },
  ],
  glossary: [
    { fr: 'devait', tr: b('was supposed to', 'avait prévu de') },
    { fr: 'la veille', tr: b('the day before', 'le jour d’avant') },
    { fr: 'elle a quitté le bureau', tr: b('she left the office', 'elle est partie du bureau') },
    { fr: 'avançait', tr: b('was moving forward', 'allait vers l’avant') },
    { fr: 'toutes les deux minutes', tr: b('every two minutes', 'une fois, puis encore deux minutes plus tard, et ainsi de suite') },
    { fr: 'comptoir', tr: b('counter', 'la longue table où travaille l’employé') },
    { fr: 'l’embarquement', tr: b('boarding', 'le moment où les passagers montent dans l’avion') },
    { fr: 'a eu envie de pleurer', tr: b('felt like crying', 'voulait pleurer') },
    { fr: 'Heureusement', tr: b('fortunately', 'par chance') },
    { fr: 'juste à temps', tr: b('just in time', 'au dernier moment, mais pas en retard') },
  ],
  questions: [
    {
      q: 'Pourquoi Léa prenait-elle l’avion ?',
      qEn: 'Why was Léa flying?',
      options: ['Pour un voyage d’affaires', 'Pour passer Noël en famille', 'Pour partir en vacances au soleil', 'Pour déménager à Paris'],
      answer: 1,
      evidence: 'elle allait passer Noël avec sa famille',
      explain: b(
        '“Elle allait passer Noël avec sa famille.” Aller in the imparfait + infinitive: a plan seen from the past.',
        '« Elle allait passer Noël avec sa famille. » Aller à l’imparfait + infinitif : un projet vu du passé.',
      ),
      skill: 'detail',
    },
    {
      q: 'Pourquoi le taxi avançait-il lentement ?',
      qEn: 'Why was the taxi moving slowly?',
      options: ['Le chauffeur était fatigué.', 'Il neigeait et il y avait beaucoup de voitures.', 'Le taxi était en panne.', 'Léa avait demandé de rouler doucement.'],
      answer: 1,
      evidence: 'Il neigeait beaucoup et les rues étaient pleines de voitures.',
      explain: b(
        'The sentence before gives the background, in the imparfait: snow and full streets. The cause is not always introduced by parce que.',
        'La phrase d’avant donne le décor, à l’imparfait : la neige et les rues pleines. La cause n’est pas toujours introduite par parce que.',
      ),
      skill: 'inference',
    },
    {
      q: 'À quelle heure Léa est-elle arrivée à l’aéroport ?',
      qEn: 'What time did Léa arrive at the airport?',
      options: ['À seize heures', 'À dix-neuf heures quarante', 'À vingt heures', 'Le lendemain matin'],
      answer: 1,
      evidence: 'il était dix-neuf heures quarante',
      explain: b(
        'Seven forty, only twenty minutes before her flight. At four p.m. she left the office; eight p.m. was the time of the flight.',
        'Dix-neuf heures quarante, vingt minutes seulement avant le vol. À seize heures, elle a quitté le bureau ; vingt heures, c’était l’heure du vol.',
      ),
      skill: 'detail',
    },
    {
      q: 'Qu’est-ce que l’employé lui a dit ?',
      qEn: 'What did the agent tell her?',
      options: ['Que l’avion avait du retard', 'Que l’embarquement était terminé', 'Que son billet n’était pas valable', 'Qu’il n’y avait plus de vols avant Noël'],
      answer: 1,
      evidence: 'l’embarquement était terminé',
      explain: b(
        '“L’employé lui a dit que l’embarquement était terminé”: too late to get on the plane.',
        '« L’employé lui a dit que l’embarquement était terminé » : trop tard pour monter dans l’avion.',
      ),
      skill: 'detail',
    },
    {
      q: 'Combien Léa a-t-elle payé pour changer de vol ?',
      qEn: 'How much did Léa pay to change flights?',
      options: ['Rien', 'Le prix d’un nouveau billet', 'La moitié du prix', 'Le texte ne le dit pas'],
      answer: 0,
      evidence: 'sans frais supplémentaires',
      explain: b(
        '“Sans frais supplémentaires” means at no extra cost: the change was free.',
        '« Sans frais supplémentaires » veut dire : sans payer plus. Le changement était gratuit.',
      ),
      skill: 'vocab',
    },
    {
      q: 'Quelle leçon Léa a-t-elle tirée de cette histoire ?',
      qEn: 'What lesson did Léa learn from this story?',
      options: ['Ne plus prendre l’avion', 'Partir plus tôt à l’aéroport', 'Toujours prendre le métro', 'Voyager seulement l’été'],
      answer: 1,
      evidence: 'elle part toujours à l’aéroport avec trois heures d’avance',
      explain: b(
        '“Depuis ce jour, elle part toujours à l’aéroport avec trois heures d’avance !” The present tense shows her new habit.',
        '« Depuis ce jour, elle part toujours à l’aéroport avec trois heures d’avance ! » Le présent montre sa nouvelle habitude.',
      ),
      skill: 'inference',
    },
  ],
  focus: {
    title: b('Telling a story: passé composé or imparfait?', 'Raconter : passé composé ou imparfait ?'),
    body: b(
      'In a story, the **passé composé** tells the events, one after the other: __elle a quitté le bureau__, __elle a appelé un taxi__, __elle a couru__. The **imparfait** paints the background and the situation: the weather (__il neigeait__), the description (__les rues étaient pleines__), what was going on (__le taxi avançait lentement__). Ask yourself: is it an event (passé composé) or the scenery (imparfait)?',
      'Dans un récit, le **passé composé** raconte les événements, l’un après l’autre : __elle a quitté le bureau__, __elle a appelé un taxi__, __elle a couru__. L’**imparfait** peint le décor et la situation : la météo (__il neigeait__), la description (__les rues étaient pleines__), ce qui était en cours (__le taxi avançait lentement__). Demandez-vous : est-ce un événement (passé composé) ou le décor (imparfait) ?',
    ),
    examples: [
      { fr: 'Il neigeait beaucoup.', tr: 'It was snowing hard.' },
      { fr: 'Elle a appelé un taxi.', tr: 'She called a taxi.' },
      { fr: 'Le taxi avançait très lentement.', tr: 'The taxi was moving very slowly.' },
    ],
  },
};

export default text;
