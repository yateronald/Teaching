// A2 · Dialogue at the doctor’s: saying what is wrong (avoir mal à,
// depuis), understanding advice and a prescription (the imperative).
import { b } from '../../types';
import type { ReadingText } from '../types';

const DOCTOR = 0;
const PATIENT = 1;

const text: ReadingText = {
  id: 'chez-le-medecin',
  speakers: [{ name: 'La médecin', voice: 'f' }, { name: 'Monsieur Leroy', voice: 'm' }],
  warmup: b(
    'You are ill and you see a doctor. What will the doctor ask you? What will you answer?',
    'Vous êtes malade et vous allez chez le médecin. Que va-t-il vous demander ? Qu’allez-vous répondre ?',
  ),
  paras: [
    { who: DOCTOR, s: [
      ['Bonjour monsieur Leroy, asseyez-vous.', 'Hello, Mr Leroy, please sit down.'],
      ['Qu’est-ce qui ne va pas ?', 'What seems to be the problem?'],
    ] },
    { who: PATIENT, s: [
      ['Bonjour docteure.', 'Hello, doctor.'],
      ['J’ai mal à la gorge et j’ai de la fièvre.', 'I have a sore throat and a fever.'],
    ] },
    { who: DOCTOR, s: [
      ['Depuis quand ?', 'Since when?'],
    ] },
    { who: PATIENT, s: [
      ['Depuis trois jours.', 'For three days.'],
      ['Et hier soir, j’avais aussi très mal à la tête.', 'And last night I also had a bad headache.'],
    ] },
    { who: DOCTOR, s: [
      ['Vous toussez ?', 'Are you coughing?'],
    ] },
    { who: PATIENT, s: [
      ['Oui, un peu, surtout la nuit.', 'Yes, a little, especially at night.'],
    ] },
    { who: DOCTOR, s: [
      ['Je vais regarder votre gorge.', 'I am going to look at your throat.'],
      ['Elle est très rouge.', 'It is very red.'],
      ['C’est une infection de la gorge, mais ce n’est pas grave.', 'It is a throat infection, but it is not serious.'],
    ] },
    { who: PATIENT, s: [
      ['Est-ce que je dois prendre des médicaments ?', 'Do I need to take any medicine?'],
    ] },
    { who: DOCTOR, s: [
      ['Oui, je vous fais une ordonnance.', 'Yes, I am writing you a prescription.'],
      ['Prenez ce sirop trois fois par jour, après les repas, pendant une semaine.', 'Take this syrup three times a day, after meals, for a week.'],
    ] },
    { who: PATIENT, s: [
      ['D’accord.', 'All right.'],
      ['Et pour le travail ?', 'And what about work?'],
    ] },
    { who: DOCTOR, s: [
      ['Restez à la maison deux jours, buvez beaucoup d’eau et reposez-vous.', 'Stay at home for two days, drink plenty of water and rest.'],
      ['Si la fièvre ne baisse pas, revenez me voir vendredi.', 'If the fever does not go down, come back to see me on Friday.'],
    ] },
    { who: PATIENT, s: [
      ['Merci beaucoup, docteure.', 'Thank you very much, doctor.'],
      ['Au revoir !', 'Goodbye!'],
    ] },
    { who: DOCTOR, s: [
      ['Au revoir, et soignez-vous bien !', 'Goodbye, and take good care of yourself!'],
    ] },
  ],
  glossary: [
    { fr: 'asseyez-vous', tr: b('sit down', 'prenez une chaise') },
    { fr: 'Qu’est-ce qui ne va pas ?', tr: b('what is wrong?', 'quel est votre problème ?') },
    { fr: 'de la fièvre', tr: b('a fever', 'une température du corps trop haute') },
    { fr: 'Vous toussez', tr: b('you are coughing', 'l’air sort fort de votre gorge, avec du bruit') },
    { fr: 'une ordonnance', tr: b('a prescription', 'le papier du médecin pour acheter des médicaments') },
    { fr: 'sirop', tr: b('syrup (liquid medicine)', 'un médicament liquide et sucré') },
    { fr: 'reposez-vous', tr: b('rest', 'ne travaillez pas, dormez') },
    { fr: 'baisse', tr: b('goes down', 'devient plus basse') },
    { fr: 'soignez-vous bien', tr: b('take good care of yourself', 'prenez soin de votre santé') },
  ],
  questions: [
    {
      q: 'Quels sont les problèmes de monsieur Leroy ?',
      qEn: 'What are Mr Leroy’s problems?',
      options: ['Il a mal au dos et au ventre.', 'Il a mal à la gorge et de la fièvre.', 'Il a mal aux yeux.', 'Il s’est cassé la jambe.'],
      answer: 1,
      evidence: 'J’ai mal à la gorge et j’ai de la fièvre.',
      explain: b(
        '“J’ai mal à la gorge et j’ai de la fièvre.” He also had a headache last night.',
        '« J’ai mal à la gorge et j’ai de la fièvre. » Il avait aussi mal à la tête hier soir.',
      ),
      skill: 'detail',
    },
    {
      q: 'Depuis combien de temps est-il malade ?',
      qEn: 'How long has he been ill?',
      options: ['Depuis hier soir', 'Depuis trois jours', 'Depuis une semaine', 'Depuis vendredi'],
      answer: 1,
      evidence: 'Depuis trois jours.',
      explain: b(
        'To “Depuis quand ?” he answers “Depuis trois jours.” Hier soir is only when his head hurt.',
        'À « Depuis quand ? », il répond « Depuis trois jours. » Hier soir, c’est seulement quand il avait mal à la tête.',
      ),
      skill: 'detail',
    },
    {
      q: 'Quand tousse-t-il surtout ?',
      qEn: 'When does he cough most?',
      options: ['Le matin', 'Après les repas', 'La nuit', 'Au travail'],
      answer: 2,
      evidence: 'surtout la nuit',
      explain: b(
        '“Oui, un peu, surtout la nuit.” After meals is when he must take the syrup.',
        '« Oui, un peu, surtout la nuit. » Après les repas, c’est quand il doit prendre le sirop.',
      ),
      skill: 'detail',
    },
    {
      q: 'Selon la médecin, la maladie est…',
      qEn: 'According to the doctor, the illness is…',
      options: ['très grave', 'pas grave', 'inconnue', 'très contagieuse'],
      answer: 1,
      evidence: 'ce n’est pas grave',
      explain: b(
        '“C’est une infection de la gorge, mais ce n’est pas grave.”',
        '« C’est une infection de la gorge, mais ce n’est pas grave. »',
      ),
      skill: 'detail',
    },
    {
      q: 'Combien de fois par jour doit-il prendre le sirop ?',
      qEn: 'How many times a day must he take the syrup?',
      options: ['Une fois', 'Deux fois', 'Trois fois', 'Quand il a mal'],
      answer: 2,
      evidence: 'Prenez ce sirop trois fois par jour',
      explain: b(
        '“Prenez ce sirop trois fois par jour, après les repas, pendant une semaine.” Prenez is an order: the imperative.',
        '« Prenez ce sirop trois fois par jour, après les repas, pendant une semaine. » Prenez est un ordre : c’est l’impératif.',
      ),
      skill: 'detail',
    },
    {
      q: 'Que doit-il faire si la fièvre ne baisse pas ?',
      qEn: 'What must he do if the fever does not go down?',
      options: ['Aller tout de suite à l’hôpital', 'Retourner au travail', 'Revenir voir la médecin vendredi', 'Prendre plus de sirop'],
      answer: 2,
      evidence: 'revenez me voir vendredi',
      explain: b(
        '“Si la fièvre ne baisse pas, revenez me voir vendredi.” Si introduces the condition.',
        '« Si la fièvre ne baisse pas, revenez me voir vendredi. » Si introduit la condition.',
      ),
      skill: 'inference',
    },
  ],
  focus: {
    title: b('Saying where it hurts: avoir mal à', 'Dire où on a mal : avoir mal à'),
    body: b(
      'To say where it hurts: **avoir mal à** + the body part, with its article: __j’ai mal à la gorge__, __j’ai mal à la tête__. With le and les, à contracts: à + le = **au** (__j’ai mal au ventre__), à + les = **aux** (__j’ai mal aux dents__). To say for how long: **depuis** + a duration: __depuis trois jours__.',
      'Pour dire où on a mal : **avoir mal à** + la partie du corps, avec son article : __j’ai mal à la gorge__, __j’ai mal à la tête__. Avec le et les, à se contracte : à + le = **au** (__j’ai mal au ventre__), à + les = **aux** (__j’ai mal aux dents__). Pour dire depuis combien de temps : **depuis** + une durée : __depuis trois jours__.',
    ),
    examples: [
      { fr: 'J’ai mal à la gorge.', tr: 'I have a sore throat.' },
      { fr: 'J’avais très mal à la tête.', tr: 'I had a bad headache.' },
      { fr: 'Depuis trois jours.', tr: 'For three days.' },
    ],
  },
};

export default text;
