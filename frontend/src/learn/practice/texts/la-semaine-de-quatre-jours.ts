// B2 · Opinion article. The four-day week: the arguments in favour, the
// traps of a compressed week, the jobs where it does not fit, and the
// conditions for it to work. Expressing cause and consequence.
import { b } from '../../types';
import type { ReadingText } from '../types';

const text: ReadingText = {
  id: 'la-semaine-de-quatre-jours',
  warmup: b(
    'Would you like to work four days a week instead of five? What could be the advantages, and the problems?',
    'Aimeriez-vous travailler quatre jours par semaine au lieu de cinq ? Quels pourraient être les avantages, et les problèmes ?',
  ),
  paras: [
    { lead: true, s: [
      ['Travailler quatre jours au lieu de cinq, sans perdre de salaire : l’idée séduit de plus en plus d’entreprises.', 'Working four days instead of five, without losing pay: the idea appeals to more and more companies.'],
      ['Mais derrière ce slogan se cachent des réalités très différentes.', 'But behind this slogan lie very different realities.'],
    ] },
    { s: [
      ['Les partisans de la semaine de quatre jours avancent d’abord un argument de santé.', 'Supporters of the four-day week first put forward a health argument.'],
      ['Grâce à un jour de repos supplémentaire, les salariés seraient moins fatigués et moins souvent malades.', 'Thanks to an extra day off, employees would be less tired and less often ill.'],
      ['Plusieurs expériences menées à l’étranger auraient d’ailleurs montré une baisse des arrêts maladie, si bien que certaines entreprises ont décidé de garder ce rythme.', 'Several trials abroad are even said to have shown a drop in sick leave, so much so that some companies decided to keep this rhythm.'],
    ] },
    { s: [
      ['Encore faut-il s’entendre sur les mots.', 'Still, we need to agree on what the words mean.'],
      ['Dans certains cas, les heures de travail sont simplement concentrées sur quatre jours : on travaille alors neuf ou dix heures par jour.', 'In some cases, working hours are simply squeezed into four days: people then work nine or ten hours a day.'],
      ['Faute de temps pour récupérer le soir, ces journées à rallonge peuvent produire l’effet inverse de celui qu’on recherchait, en raison de la fatigue accumulée.', 'For lack of time to recover in the evening, these extra-long days can produce the opposite effect to the one intended, because of the accumulated fatigue.'],
    ] },
    { s: [
      ['Le modèle ne convient pas non plus à tous les métiers.', 'Nor does the model suit every job.'],
      ['Dans un hôpital, une école ou un commerce, il faut assurer une présence chaque jour ; réduire le temps de travail suppose donc d’embaucher, ce que toutes les structures ne peuvent pas se permettre.', 'In a hospital, a school or a shop, someone has to be there every day; cutting working time therefore means hiring, which not every organisation can afford.'],
      ['À cause de cette contrainte, ce sont souvent les bureaux qui adoptent la formule, et rarement les métiers de terrain.', 'Because of this constraint, it is often offices that adopt the scheme, and rarely jobs on the ground.'],
    ] },
    { s: [
      ['Pour les spécialistes, la question n’est donc pas de savoir si la semaine de quatre jours est une bonne idée en soi, mais à quelles conditions elle peut fonctionner.', 'For experts, then, the question is not whether the four-day week is a good idea in itself, but under what conditions it can work.'],
      ['Elle exige une réorganisation profonde : moins de réunions, des tâches mieux réparties et des objectifs clairs.', 'It requires a deep reorganisation: fewer meetings, better-shared tasks and clear objectives.'],
      ['Sans ce travail préalable, elle risque de n’être qu’un changement d’affichage.', 'Without this groundwork, it risks being nothing more than a change of label.'],
    ] },
  ],
  glossary: [
    { fr: 'séduit', tr: b('appeals to, attracts', 'plaît, attire') },
    { fr: 'derrière ce slogan se cachent', tr: b('behind this slogan lie (inverted subject)', 'ce slogan cache (le sujet est placé après le verbe)') },
    { fr: 'Les partisans', tr: b('the supporters', 'les personnes qui sont pour une idée') },
    { fr: 'avancent', tr: b('put forward (an argument)', 'proposent, présentent') },
    { fr: 'supplémentaire', tr: b('extra, additional', 'en plus') },
    { fr: 'arrêts maladie', tr: b('sick leave', 'jours où un salarié malade ne travaille pas, sur avis du médecin') },
    { fr: 'si bien que', tr: b('so much so that (consequence)', 'de sorte que, avec pour résultat que') },
    { fr: 'Encore faut-il s’entendre sur les mots', tr: b('still, we need to agree on what the words mean', 'il faut cependant être d’accord sur le sens des mots') },
    { fr: 'concentrées', tr: b('squeezed, concentrated', 'réunies sur une période plus courte') },
    { fr: 'Faute de', tr: b('for lack of', 'parce qu’il manque') },
    { fr: 'journées à rallonge', tr: b('extra-long days', 'journées de travail très longues') },
    { fr: 'l’effet inverse', tr: b('the opposite effect', 'le résultat contraire') },
    { fr: 'en raison de', tr: b('because of, due to (neutral, formal)', 'à cause de (registre soutenu)') },
    { fr: 'ne convient pas', tr: b('does not suit', 'n’est pas adapté') },
    { fr: 'embaucher', tr: b('to hire', 'engager de nouveaux salariés') },
    { fr: 'se permettre', tr: b('to afford', 'avoir les moyens de faire') },
    { fr: 'les métiers de terrain', tr: b('jobs on the ground, hands-on jobs', 'les métiers où on travaille sur place, au contact des gens') },
    { fr: 'en soi', tr: b('in itself', 'par sa nature, sans regarder le contexte') },
    { fr: 'préalable', tr: b('preliminary, done beforehand', 'qui doit être fait avant') },
    { fr: 'un changement d’affichage', tr: b('a change of label, a cosmetic change', 'un changement d’apparence, pas de fond') },
  ],
  questions: [
    {
      q: 'Quelle est la position générale de l’article ?',
      qEn: 'What is the article’s overall position?',
      options: [
        'La semaine de quatre jours est toujours une excellente idée',
        'La semaine de quatre jours ne marche jamais',
        'Elle peut fonctionner, mais seulement à certaines conditions',
        'Elle est réservée aux hôpitaux et aux écoles',
      ],
      answer: 2,
      evidence: 'à quelles conditions elle peut fonctionner',
      explain: b(
        'The article weighs both sides and concludes that the real question is the conditions: a reorganisation of work.',
        'L’article pèse le pour et le contre et conclut que la vraie question, ce sont les conditions : une réorganisation du travail.',
      ),
      skill: 'global',
    },
    {
      q: 'Quel est le premier argument des partisans ?',
      qEn: 'What is the supporters’ first argument?',
      options: ['La productivité', 'La santé des salariés', 'L’écologie', 'Les économies pour l’entreprise'],
      answer: 1,
      evidence: 'un argument de santé',
      explain: b(
        '“Les partisans avancent d’abord un argument de santé”: less fatigue and fewer sick days.',
        '« Les partisans avancent d’abord un argument de santé » : moins de fatigue et moins d’arrêts maladie.',
      ),
      skill: 'detail',
    },
    {
      q: 'Pourquoi l’auteur écrit-il « les salariés seraient moins fatigués » au conditionnel ?',
      qEn: 'Why does the author write “les salariés seraient moins fatigués” in the conditional?',
      options: [
        'Pour parler du futur',
        'Pour rapporter une affirmation qu’il ne prend pas à son compte',
        'Pour exprimer un souhait personnel',
        'Pour donner un ordre poli',
      ],
      answer: 1,
      evidence: ['les salariés seraient moins fatigués', 'auraient d’ailleurs montré'],
      explain: b(
        'In journalism, the conditional reports what others claim without confirming it: seraient, auraient montré.',
        'Dans la presse, le conditionnel rapporte ce que d’autres affirment, sans le confirmer : seraient, auraient montré.',
      ),
      skill: 'inference',
    },
    {
      q: 'Que se passe-t-il quand les heures sont simplement concentrées sur quatre jours ?',
      qEn: 'What happens when the hours are simply squeezed into four days?',
      options: [
        'On travaille neuf ou dix heures par jour, ce qui fatigue',
        'On travaille moins d’heures au total',
        'Le salaire baisse',
        'Les réunions disparaissent',
      ],
      answer: 0,
      evidence: ['on travaille alors neuf ou dix heures par jour', 'en raison de la fatigue accumulée'],
      explain: b(
        'The same hours in fewer days make very long days: the fatigue can cancel the expected benefit.',
        'Les mêmes heures en moins de jours donnent des journées très longues : la fatigue peut annuler le bénéfice attendu.',
      ),
      skill: 'detail',
    },
    {
      q: 'Que signifie « Faute de temps pour récupérer » ?',
      qEn: 'What does “Faute de temps pour récupérer” mean?',
      options: [
        'Par erreur de calcul des heures',
        'Parce qu’on n’a pas assez de temps pour se reposer',
        'Grâce au temps libre du soir',
        'Malgré un long repos',
      ],
      answer: 1,
      evidence: 'Faute de temps pour récupérer',
      explain: b(
        'Faute de + noun gives a cause that is a lack: here, not enough time to rest. It has nothing to do with a mistake.',
        'Faute de + nom donne une cause qui est un manque : ici, pas assez de temps pour se reposer. Rien à voir avec une erreur.',
      ),
      skill: 'vocab',
    },
    {
      q: 'Pourquoi ce modèle est-il difficile à appliquer dans un hôpital ?',
      qEn: 'Why is this model hard to apply in a hospital?',
      options: [
        'Parce que les soignants ne le veulent pas',
        'Parce qu’il faut une présence chaque jour, donc embaucher davantage',
        'Parce que les hôpitaux ferment le week-end',
        'Parce que la loi l’interdit',
      ],
      answer: 1,
      evidence: ['il faut assurer une présence chaque jour', 'suppose donc d’embaucher'],
      explain: b(
        'Someone must be there every day; working fewer days means hiring more people, which costs money.',
        'Il faut quelqu’un chaque jour ; travailler moins de jours suppose d’embaucher, ce qui coûte cher.',
      ),
      skill: 'inference',
    },
    {
      q: 'Selon la conclusion, que risque une semaine de quatre jours sans réorganisation ?',
      qEn: 'According to the conclusion, what does a four-day week risk without reorganisation?',
      options: [
        'De coûter trop cher',
        'D’être un changement de façade, sans transformation réelle',
        'De supprimer tous les objectifs',
        'D’augmenter les salaires',
      ],
      answer: 1,
      evidence: 'elle risque de n’être qu’un changement d’affichage',
      explain: b(
        'Un changement d’affichage changes the label, not the reality: without fewer meetings and clear objectives, nothing really changes.',
        'Un changement d’affichage change l’étiquette, pas la réalité : sans moins de réunions et des objectifs clairs, rien ne change vraiment.',
      ),
      skill: 'inference',
    },
  ],
  focus: {
    title: b('Expressing cause and consequence', 'Exprimer la cause et la conséquence'),
    body: b(
      'Cause + noun: __grâce à__ (a good result), __à cause de__ (a bad result), __en raison de__ (neutral, formal), __faute de__ (a lack). Consequence: __si bien que__ + indicative, __donc__, __c’est pourquoi__, or a verb: **produire**, **entraîner**, **provoquer**. Compare: grâce à un jour de repos (good) / à cause de cette contrainte (bad) / faute de temps (lack).',
      'Cause + nom : __grâce à__ (résultat positif), __à cause de__ (résultat négatif), __en raison de__ (neutre, soutenu), __faute de__ (un manque). Conséquence : __si bien que__ + indicatif, __donc__, __c’est pourquoi__, ou un verbe : **produire**, **entraîner**, **provoquer**. Comparez : grâce à un jour de repos (positif) / à cause de cette contrainte (négatif) / faute de temps (manque).',
    ),
    examples: [
      { fr: 'Grâce à un jour de repos supplémentaire, les salariés sont moins fatigués.', tr: 'Thanks to an extra day off, employees are less tired.' },
      { fr: 'Faute de temps pour récupérer, la fatigue s’accumule.', tr: 'For lack of time to recover, fatigue builds up.' },
      { fr: 'Les arrêts maladie ont baissé, si bien que l’entreprise a gardé ce rythme.', tr: 'Sick leave fell, so much so that the company kept this rhythm.' },
    ],
  },
};

export default text;
