// B2 · Formal letter of complaint. A holiday rental did not match its advert:
// the facts, the request for a partial refund and the next step. The formal
// register of a complaint.
import { b } from '../../types';
import type { ReadingText } from '../types';

const text: ReadingText = {
  id: 'une-location-qui-ne-ressemblait-pas-a-l-annonce',
  email: { from: 'Nicolas Ferrand', to: 'Agence Azur Locations', subject: 'Réclamation : location du 3 au 10 août' },
  warmup: b(
    'A service you paid for was not what was promised. How do you write a complaint that is firm but polite?',
    'Un service que vous avez payé ne correspond pas à ce qui était promis. Comment écrire une réclamation ferme mais polie ?',
  ),
  paras: [
    { s: [['Madame, Monsieur,', 'Dear Sir or Madam,']] },
    { s: [
      ['Du trois au dix août, j’ai loué par l’intermédiaire de votre agence un appartement à Hyères, pour un montant de mille deux cents euros.', 'From 3 to 10 August, I rented a flat in Hyères through your agency, for a total of one thousand two hundred euros.'],
      ['Votre annonce décrivait un logement calme, avec vue sur la mer et entièrement équipé.', 'Your advert described a quiet flat, with a sea view and fully equipped.'],
    ] },
    { s: [
      ['Or, à notre arrivée, nous avons constaté que la réalité ne correspondait pas à cette description.', 'However, on our arrival, we found that the reality did not match this description.'],
      ['Un chantier se trouvait juste en face de l’immeuble, si bien que le bruit commençait chaque matin dès sept heures.', 'A building site stood right opposite the building, so that the noise started every morning at seven.'],
      ['Quant à la vue sur la mer, elle n’était visible que depuis un coin du balcon.', 'As for the sea view, it could only be seen from one corner of the balcony.'],
      ['Enfin, le lave-linge était en panne, et le propriétaire, que nous avons prévenu dès le premier jour, n’est jamais venu le réparer.', 'Finally, the washing machine was broken, and the owner, whom we informed on the very first day, never came to repair it.'],
    ] },
    { s: [
      ['Ces désagréments ont considérablement gâché nos vacances.', 'These inconveniences considerably spoiled our holiday.'],
      ['Je vous saurais donc gré de bien vouloir me rembourser une partie du séjour, soit trois cents euros, ce qui me paraît raisonnable au regard du préjudice subi.', 'I would therefore be grateful if you would refund part of the stay, that is three hundred euros, which seems reasonable to me in view of the harm suffered.'],
      ['Vous trouverez ci-joint les photos du chantier ainsi que la copie des messages envoyés au propriétaire.', 'Please find attached the photos of the building site as well as a copy of the messages sent to the owner.'],
    ] },
    { s: [
      ['À défaut de réponse de votre part dans un délai de quinze jours, je me verrai contraint de saisir le médiateur de la consommation.', 'Failing a reply from you within fifteen days, I will be obliged to refer the matter to the consumer ombudsman.'],
      ['Dans l’attente de votre réponse, je vous prie d’agréer, Madame, Monsieur, l’expression de mes salutations distinguées.', 'I look forward to your reply. Yours faithfully,'],
    ] },
    { lines: true, s: [['Nicolas Ferrand', 'Nicolas Ferrand']] },
  ],
  glossary: [
    { fr: 'par l’intermédiaire de', tr: b('through (an intermediary)', 'en passant par') },
    { fr: 'un montant de', tr: b('a sum of, a total of', 'une somme de') },
    { fr: 'entièrement équipé', tr: b('fully equipped', 'avec tout le nécessaire : cuisine, linge, machines') },
    { fr: 'Or', tr: b('however, now (introduces a contrasting fact)', 'mot qui introduit un fait qui contredit ce qui précède') },
    { fr: 'nous avons constaté', tr: b('we found, we noticed', 'nous avons vu et vérifié') },
    { fr: 'ne correspondait pas', tr: b('did not match', 'n’était pas conforme') },
    { fr: 'Un chantier', tr: b('a building site', 'un lieu où on construit ou répare un bâtiment') },
    { fr: 'si bien que', tr: b('so that (consequence)', 'avec pour résultat que') },
    { fr: 'Quant à', tr: b('as for', 'en ce qui concerne') },
    { fr: 'en panne', tr: b('broken, out of order', 'qui ne fonctionne plus') },
    { fr: 'prévenu', tr: b('informed, warned', 'informé à l’avance') },
    { fr: 'Ces désagréments', tr: b('these inconveniences', 'ces problèmes, ces ennuis') },
    { fr: 'gâché', tr: b('spoiled, ruined', 'rendu beaucoup moins agréable') },
    { fr: 'Je vous saurais donc gré de', tr: b('I would therefore be grateful if you would (very formal)', 'je vous serais donc reconnaissant de (très soutenu)') },
    { fr: 'soit', tr: b('that is, namely', 'c’est-à-dire') },
    { fr: 'au regard du préjudice subi', tr: b('in view of the harm suffered', 'compte tenu du tort qu’on a subi') },
    { fr: 'ci-joint', tr: b('attached, enclosed', 'avec cette lettre') },
    { fr: 'À défaut de', tr: b('failing, in the absence of', 'si je n’ai pas') },
    { fr: 'je me verrai contraint de', tr: b('I will be obliged to', 'je serai obligé de') },
    { fr: 'saisir le médiateur de la consommation', tr: b('to refer the matter to the consumer ombudsman', 'demander l’aide d’un médiateur pour régler un litige avec une entreprise') },
  ],
  questions: [
    {
      q: 'Quel est le but de cette lettre ?',
      qEn: 'What is the purpose of this letter?',
      options: ['Réserver un appartement', 'Obtenir un remboursement partiel', 'Remercier l’agence', 'Annuler un séjour'],
      answer: 1,
      evidence: 'me rembourser une partie du séjour',
      explain: b(
        'Nicolas describes the problems, then asks for part of the price back: it is a complaint.',
        'Nicolas décrit les problèmes, puis demande le remboursement d’une partie du prix : c’est une réclamation.',
      ),
      skill: 'global',
    },
    {
      q: 'Que promettait l’annonce ?',
      qEn: 'What did the advert promise?',
      options: [
        'Un appartement calme, avec vue sur la mer et entièrement équipé',
        'Une maison avec piscine',
        'Un appartement en centre-ville',
        'Un logement neuf, à côté d’un chantier',
      ],
      answer: 0,
      evidence: 'un logement calme, avec vue sur la mer et entièrement équipé',
      explain: b(
        'The three promises (calm, sea view, fully equipped) are taken up one by one in the next paragraph.',
        'Les trois promesses (calme, vue sur la mer, entièrement équipé) sont reprises une par une dans le paragraphe suivant.',
      ),
      skill: 'detail',
    },
    {
      q: 'Dans « Or, à notre arrivée… », le mot « Or » sert à :',
      qEn: 'In “Or, à notre arrivée…”, the word “Or” is used to:',
      options: ['parler d’un métal précieux', 'introduire un fait qui contredit ce qui précède', 'conclure la lettre', 'donner un exemple'],
      answer: 1,
      evidence: 'Or, à notre arrivée',
      explain: b(
        'Or opposes the reality to the advert: the advert said one thing, however reality was different. It is typical of formal arguments.',
        'Or oppose la réalité à l’annonce : l’annonce disait une chose, or la réalité était différente. C’est typique de l’argumentation soutenue.',
      ),
      skill: 'vocab',
    },
    {
      q: 'Pourquoi le logement n’était-il pas calme ?',
      qEn: 'Why was the flat not quiet?',
      options: ['À cause des voisins', 'À cause d’un chantier en face', 'À cause de la mer', 'À cause du lave-linge'],
      answer: 1,
      evidence: 'Un chantier se trouvait juste en face de l’immeuble',
      explain: b(
        'A building site opposite the building, so (si bien que) noise every morning from seven o’clock.',
        'Un chantier en face de l’immeuble, si bien que le bruit commençait chaque matin dès sept heures.',
      ),
      skill: 'detail',
    },
    {
      q: '« Elle n’était visible que depuis un coin du balcon » : que comprend-on sur la vue sur la mer ?',
      qEn: '“Elle n’était visible que depuis un coin du balcon”: what do we understand about the sea view?',
      options: ['Elle était magnifique', 'Elle était très limitée', 'Elle n’existait pas du tout', 'Elle était visible de toutes les pièces'],
      answer: 1,
      evidence: 'elle n’était visible que depuis un coin du balcon',
      explain: b(
        'Ne… que means only: you could see the sea, but only from one corner. The view existed, but was very limited.',
        'Ne… que veut dire seulement : on voyait la mer, mais seulement depuis un coin. La vue existait, mais elle était très limitée.',
      ),
      skill: 'inference',
    },
    {
      q: 'Qu’a fait le propriétaire pour le lave-linge ?',
      qEn: 'What did the owner do about the washing machine?',
      options: ['Il l’a réparé le premier jour', 'Il l’a remplacé', 'Rien : il n’est jamais venu', 'Il a remboursé le séjour'],
      answer: 2,
      evidence: 'n’est jamais venu le réparer',
      explain: b(
        'He was told on the first day (“prévenu dès le premier jour”) but “n’est jamais venu le réparer”.',
        'Il a été prévenu dès le premier jour, mais il « n’est jamais venu le réparer ».',
      ),
      skill: 'detail',
    },
    {
      q: 'Combien Nicolas demande-t-il ?',
      qEn: 'How much does Nicolas ask for?',
      options: ['Mille deux cents euros', 'Trois cents euros', 'Six cents euros', 'Quinze euros'],
      answer: 1,
      evidence: 'soit trois cents euros',
      explain: b(
        'Part of the stay, “soit trois cents euros”: soit means that is, namely. Twelve hundred euros was the full price.',
        'Une partie du séjour, « soit trois cents euros » : soit veut dire c’est-à-dire. Mille deux cents euros, c’était le prix total.',
      ),
      skill: 'detail',
    },
    {
      q: 'Que fera Nicolas s’il ne reçoit pas de réponse dans quinze jours ?',
      qEn: 'What will Nicolas do if he gets no reply within fifteen days?',
      options: ['Il réservera une autre location', 'Il fera appel au médiateur de la consommation', 'Il écrira un avis sur internet', 'Il retournera à Hyères'],
      answer: 1,
      evidence: 'je me verrai contraint de saisir le médiateur de la consommation',
      explain: b(
        '“À défaut de réponse… je me verrai contraint de saisir le médiateur”: a polite but firm warning about the next step.',
        '« À défaut de réponse… je me verrai contraint de saisir le médiateur » : un avertissement poli mais ferme sur l’étape suivante.',
      ),
      skill: 'inference',
    },
  ],
  focus: {
    title: b('The formal register of a complaint', 'Le registre soutenu de la réclamation'),
    body: b(
      'A complaint stays polite and precise: facts first (dates, sums), then the request, then the next step. Formal phrases: __je vous saurais gré de__ + infinitive (I would be grateful if you would), __or__ (to oppose a fact), __quant à__ (as for), __soit__ (that is), __ci-joint__ (attached), __à défaut de__ (failing), __je me verrai contraint de__ (I will be obliged to). Compare the everyday “merci de me rembourser” with the formal **je vous saurais gré de bien vouloir me rembourser**.',
      'Une réclamation reste polie et précise : d’abord les faits (dates, sommes), puis la demande, puis l’étape suivante. Formules soutenues : __je vous saurais gré de__ + infinitif, __or__ (pour opposer un fait), __quant à__ (en ce qui concerne), __soit__ (c’est-à-dire), __ci-joint__, __à défaut de__ (si je n’ai pas), __je me verrai contraint de__ (je serai obligé de). Comparez le courant « merci de me rembourser » et le soutenu **je vous saurais gré de bien vouloir me rembourser**.',
    ),
    examples: [
      { fr: 'Je vous saurais gré de bien vouloir me rembourser.', tr: 'I would be grateful if you would refund me.' },
      { fr: 'Quant à la vue sur la mer, elle était très limitée.', tr: 'As for the sea view, it was very limited.' },
      { fr: 'À défaut de réponse, je me verrai contraint de saisir le médiateur.', tr: 'Failing a reply, I will be obliged to refer the matter to the ombudsman.' },
    ],
  },
};

export default text;
