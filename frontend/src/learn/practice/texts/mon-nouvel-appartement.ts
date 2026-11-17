// A2 · Email. Inès tells a friend about her move: the passé composé with
// avoir and être, describing a place, and time markers (hier, samedi dernier,
// jeudi prochain).
import { b } from '../../types';
import type { ReadingText } from '../types';

const text: ReadingText = {
  id: 'mon-nouvel-appartement',
  email: { from: 'Inès Morel', to: 'Paul Girard', subject: 'Enfin dans mon nouvel appartement !' },
  warmup: b(
    'Have you ever moved house? Read Inès’s email: what has changed in her life?',
    'Avez-vous déjà déménagé ? Lisez le courriel d’Inès : qu’est-ce qui a changé dans sa vie ?',
  ),
  paras: [
    { s: [['Salut Paul,', 'Hi Paul,']] },
    { s: [
      ['Comment vas-tu ?', 'How are you?'],
      ['Moi, je vais très bien, parce que j’ai enfin déménagé !', 'I am very well, because I have finally moved!'],
      ['Samedi dernier, mes deux frères sont venus avec un camion.', 'Last Saturday, my two brothers came with a truck.'],
      ['Nous avons porté les cartons toute la journée.', 'We carried the boxes all day.'],
      ['Le soir, nous étions très fatigués, alors nous avons commandé des pizzas.', 'In the evening we were very tired, so we ordered pizzas.'],
    ] },
    { s: [
      ['L’appartement est au troisième étage.', 'The apartment is on the third floor.'],
      ['Il y a deux chambres, un salon très lumineux et une petite cuisine.', 'There are two bedrooms, a very bright living room and a small kitchen.'],
      ['Ce n’est pas très grand, mais j’ai un balcon !', 'It is not very big, but I have a balcony!'],
      ['Le matin, je prends mon café dehors et je regarde le parc en face.', 'In the morning, I have my coffee outside and look at the park across the street.'],
    ] },
    { s: [
      ['Le quartier est calme et pratique.', 'The neighbourhood is quiet and convenient.'],
      ['Il y a une boulangerie au coin de la rue et le métro est à cinq minutes.', 'There is a bakery on the corner and the metro is five minutes away.'],
      ['Hier, je suis allée à la bibliothèque du quartier et j’ai pris ma carte : c’est gratuit !', 'Yesterday, I went to the neighbourhood library and got my card: it is free!'],
    ] },
    { s: [
      ['Mon seul problème : je n’ai pas encore Internet.', 'My only problem: I do not have Internet yet.'],
      ['Le technicien vient jeudi prochain.', 'The technician is coming next Thursday.'],
    ] },
    { s: [
      ['Tu es libre samedi prochain ?', 'Are you free next Saturday?'],
      ['J’organise une petite fête pour pendre la crémaillère.', 'I am having a little party to celebrate my new home.'],
      ['Viens avec ta copine !', 'Come with your girlfriend!'],
    ] },
    { lines: true, s: [
      ['Je t’embrasse,', 'Love,'],
      ['Inès', 'Inès'],
    ] },
  ],
  glossary: [
    { fr: 'déménagé', tr: b('moved (to a new home)', 'changé de logement') },
    { fr: 'un camion', tr: b('a truck, a van', 'un grand véhicule pour transporter des choses') },
    { fr: 'les cartons', tr: b('the (cardboard) boxes', 'les boîtes en carton') },
    { fr: 'lumineux', tr: b('bright, full of light', 'avec beaucoup de lumière') },
    { fr: 'en face', tr: b('opposite, across the street', 'de l’autre côté de la rue') },
    { fr: 'au coin de la rue', tr: b('on the corner of the street', 'là où deux rues se croisent') },
    { fr: 'gratuit', tr: b('free (no charge)', 'qu’on ne paie pas') },
    { fr: 'ta copine', tr: b('your girlfriend (familiar)', 'ta petite amie (familier)') },
  ],
  questions: [
    {
      q: 'Pourquoi Inès écrit-elle à Paul ?',
      qEn: 'Why is Inès writing to Paul?',
      options: ['Pour lui demander de l’aide pour déménager', 'Pour raconter son déménagement et l’inviter', 'Pour vendre son ancien appartement', 'Pour annuler une fête'],
      answer: 1,
      evidence: ['j’ai enfin déménagé', 'Tu es libre samedi prochain ?'],
      explain: b(
        'She tells him about her move (the first paragraphs) and invites him to her party (the end). The beginning and the end of an email usually give its purpose.',
        'Elle lui raconte son déménagement (les premiers paragraphes) et l’invite à sa fête (la fin). Le début et la fin d’un courriel donnent souvent son objectif.',
      ),
      skill: 'global',
    },
    {
      q: 'Qui a aidé Inès à déménager ?',
      qEn: 'Who helped Inès move?',
      options: ['Paul', 'Ses deux frères', 'Le technicien', 'Ses voisins'],
      answer: 1,
      evidence: 'mes deux frères sont venus avec un camion',
      explain: b(
        '“Mes deux frères sont venus avec un camion” and “nous avons porté les cartons”: nous means Inès and her brothers.',
        '« Mes deux frères sont venus avec un camion » et « nous avons porté les cartons » : nous = Inès et ses frères.',
      ),
      skill: 'detail',
    },
    {
      q: 'Qu’est-ce qu’Inès aime surtout dans son appartement ?',
      qEn: 'What does Inès like most about her apartment?',
      options: ['La grande cuisine', 'Le balcon', 'Les trois chambres', 'Le garage'],
      answer: 1,
      evidence: 'mais j’ai un balcon !',
      explain: b(
        '“Ce n’est pas très grand, mais j’ai un balcon !” The exclamation mark shows her joy. The kitchen is small and there are two bedrooms.',
        '« Ce n’est pas très grand, mais j’ai un balcon ! » Le point d’exclamation montre sa joie. La cuisine est petite et il y a deux chambres.',
      ),
      skill: 'inference',
    },
    {
      q: 'Qu’est-ce qu’Inès a fait hier ?',
      qEn: 'What did Inès do yesterday?',
      options: ['Elle a déménagé.', 'Elle est allée à la bibliothèque.', 'Elle a commandé des pizzas.', 'Elle a installé Internet.'],
      answer: 1,
      evidence: 'Hier, je suis allée à la bibliothèque du quartier',
      explain: b(
        'Hier means yesterday. The move and the pizzas were last Saturday, and Internet arrives next Thursday: watch the time markers.',
        'Hier, c’est le jour avant aujourd’hui. Le déménagement et les pizzas, c’était samedi dernier ; Internet arrive jeudi prochain : attention aux indicateurs de temps.',
      ),
      skill: 'detail',
    },
    {
      q: 'Inès a déjà Internet dans son nouvel appartement.',
      qEn: 'Inès already has Internet in her new apartment.',
      options: ['Vrai', 'Faux', 'Le texte ne le dit pas'],
      answer: 1,
      evidence: 'je n’ai pas encore Internet',
      explain: b(
        '“Je n’ai pas encore Internet”: not yet. The technician comes next Thursday.',
        '« Je n’ai pas encore Internet » : pas encore = pas maintenant, mais bientôt. Le technicien vient jeudi prochain.',
      ),
      skill: 'detail',
    },
    {
      q: '« Pendre la crémaillère », c’est :',
      qEn: 'What does “pendre la crémaillère” mean?',
      options: ['Faire une fête dans un nouveau logement', 'Faire des travaux dans un appartement', 'Acheter de nouveaux meubles', 'Rendre les clés de l’ancien appartement'],
      answer: 0,
      evidence: 'J’organise une petite fête pour pendre la crémaillère.',
      explain: b(
        'The context helps: a party (“une petite fête”) for a new apartment. Pendre la crémaillère means having a housewarming party.',
        'Le contexte aide : une fête (« une petite fête ») pour un nouvel appartement. Pendre la crémaillère, c’est faire la fête dans son nouveau logement.',
      ),
      skill: 'vocab',
    },
  ],
  focus: {
    title: b('The passé composé: avoir or être?', 'Le passé composé : avoir ou être ?'),
    body: b(
      'Most verbs form the passé composé with **avoir**: __j’ai déménagé__, __nous avons porté__, __j’ai pris__. A small group of verbs of movement (aller, venir, arriver, partir, rester…) take **être**, and the past participle agrees with the subject like an adjective: __je suis allée__ (Inès is a woman), __mes frères sont venus__.',
      'La plupart des verbes forment le passé composé avec **avoir** : __j’ai déménagé__, __nous avons porté__, __j’ai pris__. Un petit groupe de verbes de mouvement (aller, venir, arriver, partir, rester…) se conjuguent avec **être**, et le participe passé s’accorde avec le sujet comme un adjectif : __je suis allée__ (Inès est une femme), __mes frères sont venus__.',
    ),
    examples: [
      { fr: 'Nous avons porté les cartons.', tr: 'We carried the boxes.' },
      { fr: 'Hier, je suis allée à la bibliothèque.', tr: 'Yesterday, I went to the library.' },
      { fr: 'Mes deux frères sont venus avec un camion.', tr: 'My two brothers came with a truck.' },
    ],
  },
};

export default text;
