// A2 · Job advert. A children’s holiday centre recruits for the summer:
// the job, the profile, the contract and how to apply. Expressing obligation.
import { b } from '../../types';
import type { ReadingText } from '../types';

const text: ReadingText = {
  id: 'animateur-ou-animatrice-pour-l-ete',
  warmup: b(
    'You are looking for a summer job. What information do you look for first in a job advert?',
    'Vous cherchez un travail pour l’été. Quelles informations cherchez-vous d’abord dans une offre d’emploi ?',
  ),
  paras: [
    { lead: true, s: [
      ['Le centre de loisirs Les Hirondelles, à Nantes, recherche des animateurs et des animatrices pour les vacances d’été.', 'Les Hirondelles holiday centre in Nantes is looking for activity leaders for the summer holidays.'],
    ] },
    { s: [
      ['Vous allez travailler avec des enfants de six à douze ans, du lundi au vendredi, de huit heures trente à dix-sept heures trente.', 'You will work with children aged six to twelve, Monday to Friday, from 8:30 a.m. to 5:30 p.m.'],
      ['Vous allez organiser des jeux, des activités manuelles et des sorties : piscine, parc, musée.', 'You will organise games, arts and crafts and outings: swimming pool, park, museum.'],
    ] },
    { s: [
      ['Vous devez avoir au moins dix-huit ans et être disponible tout l’été.', 'You must be at least eighteen and available all summer.'],
      ['Vous êtes dynamique, patient et responsable.', 'You are energetic, patient and responsible.'],
      ['Le BAFA est un plus, mais il n’est pas obligatoire : une formation de deux jours est prévue en juin.', 'The BAFA is a plus, but it is not compulsory: a two-day training course is planned in June.'],
    ] },
    { s: [
      ['Le contrat dure huit semaines, du sept juillet au vingt-neuf août.', 'The contract lasts eight weeks, from 7 July to 29 August.'],
      ['Le salaire est de quatre-vingts euros par jour, et le repas de midi est offert.', 'The pay is eighty euros a day, and lunch is provided free.'],
    ] },
    { s: [
      ['Pour postuler, il faut envoyer un CV et une courte lettre de motivation avant le quinze mai.', 'To apply, you need to send a CV and a short cover letter before 15 May.'],
      ['Les entretiens ont lieu à la fin du mois de mai.', 'Interviews take place at the end of May.'],
    ] },
    { lines: true, s: [['Renseignements : Madame Benali, directrice du centre.', 'Information: Ms Benali, head of the centre.']] },
  ],
  glossary: [
    { fr: 'centre de loisirs', tr: b('holiday or after-school activity centre for children', 'lieu où les enfants font des activités pendant les vacances') },
    { fr: 'recherche', tr: b('is looking for (here: is recruiting)', 'veut trouver, veut embaucher') },
    { fr: 'animateurs', tr: b('activity leaders', 'personnes qui organisent les jeux et les activités des enfants') },
    { fr: 'activités manuelles', tr: b('arts and crafts', 'activités où on fabrique quelque chose avec les mains') },
    { fr: 'des sorties', tr: b('outings, trips', 'des visites à l’extérieur du centre') },
    { fr: 'disponible', tr: b('available, free', 'libre, qui peut travailler') },
    { fr: 'responsable', tr: b('responsible, reliable', 'sérieux, à qui on peut faire confiance') },
    { fr: 'Le BAFA', tr: b('the French diploma for leading children’s activities', 'le diplôme pour travailler comme animateur en France') },
    { fr: 'un plus', tr: b('a plus, an advantage', 'un avantage, mais pas une obligation') },
    { fr: 'obligatoire', tr: b('compulsory, required', 'qu’on doit avoir') },
    { fr: 'Le salaire', tr: b('the pay', 'l’argent qu’on reçoit pour son travail') },
    { fr: 'offert', tr: b('free, provided', 'gratuit, payé par le centre') },
    { fr: 'postuler', tr: b('to apply (for a job)', 'proposer sa candidature pour un emploi') },
    { fr: 'lettre de motivation', tr: b('cover letter', 'lettre où on explique pourquoi on veut le poste') },
    { fr: 'Les entretiens', tr: b('the (job) interviews', 'les rencontres avec les candidats') },
  ],
  questions: [
    {
      q: 'Qu’est-ce que ce document ?',
      qEn: 'What is this document?',
      options: ['Une offre d’emploi', 'Une publicité pour des vacances', 'Le programme des enfants', 'Une lettre de motivation'],
      answer: 0,
      evidence: 'recherche des animateurs et des animatrices',
      explain: b(
        'The centre “recherche des animateurs”: it wants to recruit people. The text gives the job, the pay and how to apply.',
        'Le centre « recherche des animateurs » : il veut embaucher. Le texte donne le poste, le salaire et la façon de postuler.',
      ),
      skill: 'global',
    },
    {
      q: 'Quel âge ont les enfants du centre ?',
      qEn: 'How old are the children at the centre?',
      options: ['De trois à six ans', 'De six à douze ans', 'De douze à dix-huit ans', 'Dix-huit ans'],
      answer: 1,
      evidence: 'des enfants de six à douze ans',
      explain: b(
        '“Des enfants de six à douze ans.” Eighteen is the minimum age of the activity leaders, not of the children.',
        '« Des enfants de six à douze ans. » Dix-huit ans, c’est l’âge minimum des animateurs, pas des enfants.',
      ),
      skill: 'detail',
    },
    {
      q: 'Quels sont les horaires de travail ?',
      qEn: 'What are the working hours?',
      options: ['Tous les jours, le matin', 'Du lundi au vendredi, de 8 h 30 à 17 h 30', 'Le week-end seulement', 'Du lundi au samedi, l’après-midi'],
      answer: 1,
      evidence: 'du lundi au vendredi, de huit heures trente à dix-sept heures trente',
      explain: b(
        'Du lundi au vendredi: five days. De huit heures trente à dix-sept heures trente: 8:30 a.m. to 5:30 p.m.',
        'Du lundi au vendredi : cinq jours. De huit heures trente à dix-sept heures trente : de 8 h 30 à 17 h 30.',
      ),
      skill: 'detail',
    },
    {
      q: 'Faut-il avoir le BAFA pour postuler ?',
      qEn: 'Do you need the BAFA to apply?',
      options: ['Oui, c’est obligatoire', 'Non, mais c’est un avantage', 'Oui, avant le quinze mai', 'Non, le BAFA n’existe plus'],
      answer: 1,
      evidence: 'Le BAFA est un plus, mais il n’est pas obligatoire',
      explain: b(
        '“Un plus” is an advantage; “pas obligatoire” means you can apply without it. The centre also offers training in June.',
        '« Un plus », c’est un avantage ; « pas obligatoire » veut dire qu’on peut postuler sans. Le centre propose aussi une formation en juin.',
      ),
      skill: 'vocab',
    },
    {
      q: 'Qu’est-ce que l’animateur reçoit, en plus du salaire ?',
      qEn: 'What does the activity leader get in addition to the pay?',
      options: ['Un logement', 'Le repas de midi', 'Des billets de musée', 'Une voiture'],
      answer: 1,
      evidence: 'le repas de midi est offert',
      explain: b(
        '“Le repas de midi est offert”: lunch is free, paid for by the centre.',
        '« Le repas de midi est offert » : le déjeuner est gratuit, payé par le centre.',
      ),
      skill: 'detail',
    },
    {
      q: 'Que faut-il faire pour postuler ?',
      qEn: 'What do you need to do to apply?',
      options: ['Téléphoner à la directrice', 'Venir au centre en juin', 'Envoyer un CV et une lettre avant le 15 mai', 'Passer un entretien le 7 juillet'],
      answer: 2,
      evidence: 'il faut envoyer un CV et une courte lettre de motivation avant le quinze mai',
      explain: b(
        '“Il faut envoyer un CV et une courte lettre de motivation avant le quinze mai.” The interviews come after, at the end of May.',
        '« Il faut envoyer un CV et une courte lettre de motivation avant le quinze mai. » Les entretiens viennent après, fin mai.',
      ),
      skill: 'detail',
    },
  ],
  focus: {
    title: b('Expressing obligation', 'Exprimer l’obligation'),
    body: b(
      'To say what is necessary: __il faut__ + infinitive (il faut **envoyer** un CV) is impersonal, for everyone; __devoir__ + infinitive (vous **devez avoir** dix-huit ans) addresses a person. __Obligatoire__ means required; __un plus__ is welcome but not required. The negative: __il ne faut pas__ = it is forbidden; __ce n’est pas obligatoire__ = you do not have to.',
      'Pour dire ce qui est nécessaire : __il faut__ + infinitif (il faut **envoyer** un CV) est impersonnel, pour tout le monde ; __devoir__ + infinitif (vous **devez avoir** dix-huit ans) s’adresse à une personne. __Obligatoire__ veut dire exigé ; __un plus__ est apprécié mais pas exigé. Au négatif : __il ne faut pas__ = c’est interdit ; __ce n’est pas obligatoire__ = ce n’est pas nécessaire.',
    ),
    examples: [
      { fr: 'Il faut envoyer un CV avant le quinze mai.', tr: 'You need to send a CV before 15 May.' },
      { fr: 'Vous devez être disponible tout l’été.', tr: 'You must be available all summer.' },
      { fr: 'Le BAFA n’est pas obligatoire.', tr: 'The BAFA is not compulsory.' },
    ],
  },
};

export default text;
