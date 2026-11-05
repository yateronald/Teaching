import { b, type Lesson } from '../../types';
import { card, pick } from '../kit';

const lessons: Lesson[] = [
  {
    id: 'town-transport-1',
    slug: { en: 'places-in-town', fr: 'les-lieux-de-la-ville' },
    title: b('Places in town', 'Les lieux de la ville'),
    summary: b('Name the places of a town and say where you are going with à la, au, chez.', 'Nommer les lieux d’une ville et dire où vous allez avec à la, au, chez.'),
    objectives: [b('Name twenty places in town', 'Nommer vingt lieux de la ville'), b('Use aller à la / au / à l’ / aux', 'Employer aller à la / au / à l’ / aux'), b('Use chez with people', 'Employer chez avec les personnes')],
    minutes: 12,
    steps: [
      { kind: 'flashcards', title: b('In town', 'En ville'), cards: [{ fr: 'la banque', tr: 'bank' }, { fr: 'la poste', tr: 'post office' }, { fr: 'la pharmacie', tr: 'pharmacy' }, { fr: 'l’hôpital', tr: 'hospital' }, { fr: 'l’école', tr: 'school' }, { fr: 'la mairie', tr: 'town hall' }, { fr: 'le supermarché', tr: 'supermarket' }, { fr: 'la bibliothèque', tr: 'library' }, { fr: 'le parc', tr: 'park' }, { fr: 'la gare', tr: 'train station' }, { fr: 'l’arrêt d’autobus', tr: 'bus stop' }, { fr: 'le centre commercial', tr: 'shopping mall' }] },
      card(b('Going somewhere: à + article', 'Aller quelque part : à + article'), b('**à la** + feminine (à la banque), **au** = à + le (au parc), **à l’** + vowel (à l’école), **aux** = à + les (aux toilettes). With a person or a shop named after a person: **chez** (chez le médecin, chez Paul, chez moi).', '**à la** + féminin (à la banque), **au** = à + le (au parc), **à l’** + voyelle (à l’école), **aux** = à + les (aux toilettes). Avec une personne : **chez** (chez le médecin, chez Paul, chez moi).'), {
        examples: [{ fr: 'Je vais à la banque, puis au supermarché.', tr: 'I’m going to the bank, then to the supermarket.' }, { fr: 'Les enfants sont à l’école.', tr: 'The children are at school.' }, { fr: 'J’ai rendez-vous chez le dentiste.', tr: 'I have an appointment at the dentist’s.' }],
      }),
      pick('A1', b('Choose the right word.', 'Choisissez le bon mot.'), ['au', 'à la', 'à l’', 'aux'], { fr: 'Je vais ___ parc avec mon chien.' }),
      pick('A1', b('Choose the right word.', 'Choisissez le bon mot.'), ['à l’', 'au', 'à la', 'chez'], { fr: 'Il travaille ___ hôpital.' }),
      pick('A1', b('Choose the right word.', 'Choisissez le bon mot.'), ['chez', 'à la', 'au', 'en'], { fr: 'Ce soir, on mange ___ mes parents.' }),
      { kind: 'match', prompt: b('Where do you go to…?', 'Où allez-vous pour… ?'), pairs: [['envoyer un colis', b('la poste', 'la poste')], ['emprunter un livre', b('la bibliothèque', 'la bibliothèque')], ['acheter des médicaments', b('la pharmacie', 'la pharmacie')], ['prendre le train', b('la gare', 'la gare')], ['retirer de l’argent', b('la banque', 'la banque')]] },
      { kind: 'fill', prompt: b('Complete.', 'Complétez.'), text: 'Le matin, je vais ___ école, puis l’après-midi je vais ___ bibliothèque.', answers: [['à l’'], ['à la']] },
      { kind: 'speak', prompt: b('Say it aloud.', 'Dites-le à voix haute.'), text: 'Je vais à la banque, puis au supermarché.', tr: 'I’m going to the bank, then to the supermarket.' },
    ],
    notes: {
      points: [
        b('à la (fem.), au (à + le), à l’ (vowel), aux (à + les).', 'à la (fém.), au (à + le), à l’ (voyelle), aux (à + les).'),
        b('Chez + person: chez le médecin, chez Paul, chez moi.', 'Chez + personne : chez le médecin, chez Paul, chez moi.'),
        b('Être à / aller à: the same contractions.', 'Être à / aller à : les mêmes contractions.'),
        b('Learn places with their article: la poste, le parc, l’hôpital.', 'Apprenez les lieux avec leur article : la poste, le parc, l’hôpital.'),
      ],
      vocab: [['la mairie', b('town hall', 'bâtiment de la ville')], ['emprunter', b('to borrow', 'prendre pour un temps')], ['retirer de l’argent', b('to withdraw money', 'prendre de l’argent au guichet')], ['le colis', b('parcel', 'paquet')]],
    },
  },
  {
    id: 'town-transport-2',
    slug: { en: 'where-is-it-prepositions', fr: 'c-est-ou-les-prepositions' },
    title: b('Where is it? Prepositions of place', 'C’est où ? Les prépositions de lieu'),
    summary: b('Locate a place: next to, opposite, between, behind, on the corner of.', 'Situer un lieu : à côté de, en face de, entre, derrière, au coin de.'),
    objectives: [b('Use ten prepositions of place', 'Employer dix prépositions de lieu'), b('Contract de + le = du', 'Contracter de + le = du'), b('Describe where a place is', 'Décrire où se trouve un lieu')],
    minutes: 13,
    steps: [
      card(b('Prepositions of place', 'Les prépositions de lieu'), b('**à côté de** (next to), **en face de** (opposite), **près de / loin de** (near / far from), **entre** (between), **derrière / devant** (behind / in front of), **au coin de** (on the corner of), **sur / sous** (on / under). With de: de + le = **du**, de + les = **des**.', '**à côté de**, **en face de**, **près de / loin de**, **entre**, **derrière / devant**, **au coin de**, **sur / sous**. Avec de : de + le = **du**, de + les = **des**.'), {
        examples: [{ fr: 'La pharmacie est à côté de la banque.', tr: 'The pharmacy is next to the bank.' }, { fr: 'La poste est en face du parc.', tr: 'The post office is opposite the park.' }, { fr: 'Le café est entre la gare et l’hôtel.', tr: 'The café is between the station and the hotel.' }],
      }),
      pick('A1', b('Choose the right word.', 'Choisissez le bon mot.'), ['du', 'de le', 'de la', 'des'], { fr: 'La banque est en face ___ supermarché.' }),
      pick('A1', b('Choose the right word.', 'Choisissez le bon mot.'), ['de la', 'du', 'de', 'des'], { fr: 'Le parc est à côté ___ mairie.' }),
      pick('A1', b('“Derrière” is the opposite of…', '« Derrière » est le contraire de…'), ['devant', 'entre', 'sous', 'loin']),
      { kind: 'match', prompt: b('Match each preposition with its meaning.', 'Associez chaque préposition à son sens.'), pairs: [['à côté de', 'next to'], ['en face de', 'opposite'], ['loin de', 'far from'], ['derrière', 'behind'], ['au coin de', 'on the corner of']] },
      { kind: 'mcq', prompt: b('Listen. Where is the pharmacy?', 'Écoutez. Où est la pharmacie ?'), audio: 'La pharmacie ? C’est facile : elle est au coin de la rue, juste en face de l’église.', listen: true, voice: 'm2', options: [b('On the corner, opposite the church', 'Au coin de la rue, en face de l’église'), b('Next to the church', 'À côté de l’église'), b('Behind the church', 'Derrière l’église'), b('Far from the church', 'Loin de l’église')], answer: 0 },
      { kind: 'fill', prompt: b('Complete.', 'Complétez.'), text: 'L’école est près ___ parc et loin ___ gare.', answers: [['du'], ['de la']] },
      { kind: 'speak', prompt: b('Say it aloud.', 'Dites-le à voix haute.'), text: 'La pharmacie est à côté de la banque, en face du parc.', tr: 'The pharmacy is next to the bank, opposite the park.' },
    ],
    notes: {
      points: [
        b('à côté de, en face de, près de, loin de, au coin de + noun.', 'à côté de, en face de, près de, loin de, au coin de + nom.'),
        b('de + le = du; de + les = des; de la, de l’ do not change.', 'de + le = du ; de + les = des ; de la, de l’ ne changent pas.'),
        b('entre, derrière, devant, sur, sous: no de.', 'entre, derrière, devant, sur, sous : sans de.'),
        b('Opposites: devant / derrière, près de / loin de, sur / sous.', 'Contraires : devant / derrière, près de / loin de, sur / sous.'),
      ],
      vocab: [['l’église (f.)', b('church', 'lieu de culte')], ['la rue', b('street', 'voie en ville')], ['juste', b('just, right', 'exactement')], ['le coin', b('corner', 'angle')]],
    },
  },
  {
    id: 'town-transport-3',
    slug: { en: 'public-transport', fr: 'les-transports-en-commun' },
    title: b('Public transport', 'Les transports en commun'),
    summary: b('Take the bus or the metro: buy a ticket, ask which line, understand where to get off.', 'Prendre l’autobus ou le métro : acheter un titre, demander quelle ligne, comprendre où descendre.'),
    objectives: [b('Use en / à with means of transport', 'Employer en / à avec les moyens de transport'), b('Buy a ticket', 'Acheter un titre de transport'), b('Ask which line and where to get off', 'Demander quelle ligne et où descendre')],
    minutes: 13,
    steps: [
      card(b('En or à?', 'En ou à ?'), b('Inside the vehicle: **en** voiture, **en** bus / **en** autobus, **en** métro, **en** train, **en** avion. On top / on foot: **à** vélo, **à** pied. Verbs: **prendre** le métro, **monter** (get on), **descendre** (get off), **changer** de ligne.', 'À l’intérieur : **en** voiture, **en** autobus, **en** métro, **en** train, **en** avion. Dessus / à pied : **à** vélo, **à** pied. Verbes : **prendre** le métro, **monter**, **descendre**, **changer** de ligne.'), {
        examples: [{ fr: 'Je vais au travail en métro.', tr: 'I go to work by metro.' }, { fr: 'Elle va à l’école à pied.', tr: 'She walks to school.' }, { fr: 'Descendez à la station Berri, puis changez pour la ligne orange.', tr: 'Get off at Berri station, then change to the orange line.' }],
      }),
      pick('A1', b('Choose the right word.', 'Choisissez le bon mot.'), ['en', 'à', 'au', 'par'], { fr: 'Je vais à Québec ___ train.' }),
      pick('A1', b('Choose the right word.', 'Choisissez le bon mot.'), ['à', 'en', 'au', 'de'], { fr: 'Il va au parc ___ vélo.' }),
      { kind: 'dialogue', title: b('At the metro ticket office', 'Au guichet du métro'), scene: b('Choose the traveller’s best reply.', 'Choisissez la meilleure réponse du voyageur.'), speakers: [{ name: 'Agente', voice: 'f2', side: 'l' }, { name: 'Voyageur', voice: 'm', side: 'r' }], lines: [
        { s: 0, fr: 'Bonjour, je vous écoute.', tr: 'Hello, how can I help?' },
        { s: 1, choose: { options: ['Bonjour, je voudrais un billet pour aller au Vieux-Port, s’il vous plaît.', 'Un métro.', 'Je veux aller.'], answer: 0 } },
        { s: 0, fr: 'Voilà, c’est trois dollars soixante-quinze. Prenez la ligne orange, direction Côte-Vertu.', tr: 'Here you are, it’s $3.75. Take the orange line, towards Côte-Vertu.' },
        { s: 1, choose: { options: ['Merci. Et je descends à quelle station ?', 'Merci, au revoir, je ne sais pas.', 'Orange ? Je préfère le bleu.'], answer: 0 } },
        { s: 0, fr: 'À Place-d’Armes. C’est la quatrième station.', tr: 'At Place-d’Armes. It’s the fourth station.' },
      ] },
      pick('A1', b('“Descendre” in the metro means…', '« Descendre » dans le métro signifie…'), [b('to get off', 'sortir du train'), b('to get on', 'entrer dans le train'), b('to change lines', 'changer de ligne'), b('to buy a ticket', 'acheter un billet')]),
      pick('A1', b('How do you ask which line to take?', 'Comment demander quelle ligne prendre ?'), ['Quelle ligne je dois prendre pour aller au centre-ville ?', 'Le centre-ville prend quelle ligne ?', 'Je prends où ?', 'Ligne, centre-ville ?']),
      { kind: 'speak', prompt: b('Say it aloud.', 'Dites-le à voix haute.'), text: 'Je voudrais un billet, s’il vous plaît. Je descends à quelle station ?', tr: 'I’d like a ticket, please. Which station do I get off at?' },
    ],
    notes: {
      points: [
        b('Inside: en voiture / autobus / métro / train / avion. On top or walking: à vélo, à pied.', 'À l’intérieur : en voiture / autobus / métro / train / avion. Dessus ou en marchant : à vélo, à pied.'),
        b('Verbs: prendre, monter, descendre, changer de ligne.', 'Verbes : prendre, monter, descendre, changer de ligne.'),
        b('Ask: Quelle ligne pour… ? Je descends à quelle station ?', 'Demander : Quelle ligne pour… ? Je descends à quelle station ?'),
        b('Québec: l’autobus, la carte OPUS (Montréal), la STM.', 'Québec : l’autobus, la carte OPUS (Montréal), la STM.'),
      ],
      vocab: [['le billet', b('ticket', 'titre de transport')], ['la ligne', b('line', 'trajet du métro')], ['la direction', b('direction (terminus)', 'vers quel terminus')], ['la station', b('station (metro)', 'arrêt du métro')], ['le guichet', b('ticket office', 'comptoir de vente')]],
    },
  },
];

export default lessons;
