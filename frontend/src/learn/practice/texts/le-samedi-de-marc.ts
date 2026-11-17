// A1 · Story. A student’s Saturday in Bordeaux: leisure activities with
// faire du / de la, jouer au and jouer du, and the times of the day.
import { b } from '../../types';
import type { ReadingText } from '../types';

const text: ReadingText = {
  id: 'le-samedi-de-marc',
  warmup: b(
    'What do you do on Saturdays? Read Marc’s day and compare it with yours.',
    'Et vous, que faites-vous le samedi ? Lisez la journée de Marc et comparez-la avec la vôtre.',
  ),
  paras: [
    { s: [
      ['Marc est étudiant à Bordeaux.', 'Marc is a student in Bordeaux.'],
      ['Pendant la semaine, il travaille beaucoup, mais le samedi, c’est son jour préféré.', 'During the week he works a lot, but Saturday is his favourite day.'],
    ] },
    { s: [
      ['Le matin, il se réveille à neuf heures.', 'In the morning, he wakes up at nine.'],
      ['Il prend son petit-déjeuner, puis il fait du vélo au bord de la Garonne, le grand fleuve de Bordeaux.', 'He has breakfast, then he goes cycling along the Garonne, Bordeaux’s big river.'],
      ['Il roule pendant une heure.', 'He rides for an hour.'],
    ] },
    { s: [
      ['À midi, il mange avec ses amis dans un petit restaurant.', 'At noon, he eats with his friends in a small restaurant.'],
      ['L’après-midi, ils jouent au football dans le parc.', 'In the afternoon, they play football in the park.'],
      ['Marc n’est pas très bon, mais il s’amuse beaucoup !', 'Marc is not very good, but he has a lot of fun!'],
    ] },
    { s: [
      ['Vers dix-huit heures, il rentre chez lui.', 'Around six p.m., he goes home.'],
      ['Il fait de la cuisine : ce soir, il prépare des pâtes pour sa sœur Julie.', 'He cooks: tonight he is making pasta for his sister Julie.'],
      ['Après le dîner, Julie joue du piano et Marc écoute.', 'After dinner, Julie plays the piano and Marc listens.'],
    ] },
    { s: [
      ['Et le dimanche ?', 'And on Sundays?'],
      ['Marc dort, il lit et… il fait ses devoirs !', 'Marc sleeps, reads and… does his homework!'],
    ] },
  ],
  glossary: [
    { fr: 'son jour préféré', tr: b('his favourite day', 'le jour qu’il aime le plus') },
    { fr: 'il se réveille', tr: b('he wakes up', 'il ouvre les yeux, il ne dort plus') },
    { fr: 'il fait du vélo', tr: b('he goes cycling', 'il roule à bicyclette') },
    { fr: 'le grand fleuve', tr: b('the big river', 'une grande rivière qui va jusqu’à la mer') },
    { fr: 'il s’amuse', tr: b('he has fun', 'il passe un bon moment') },
    { fr: 'il rentre chez lui', tr: b('he goes home', 'il retourne à son appartement') },
    { fr: 'Il fait de la cuisine', tr: b('he cooks', 'il prépare un repas') },
    { fr: 'joue du piano', tr: b('plays the piano', 'fait de la musique au piano') },
    { fr: 'ses devoirs', tr: b('his homework', 'le travail de l’école ou de l’université à faire à la maison') },
  ],
  questions: [
    {
      q: 'Quel est le jour préféré de Marc ?',
      qEn: 'What is Marc’s favourite day?',
      options: ['Le lundi', 'Le vendredi', 'Le samedi', 'Le dimanche'],
      answer: 2,
      evidence: 'le samedi, c’est son jour préféré',
      explain: b(
        '“Le samedi, c’est son jour préféré.” On Sundays, he does his homework.',
        '« Le samedi, c’est son jour préféré. » Le dimanche, il fait ses devoirs.',
      ),
      skill: 'detail',
    },
    {
      q: 'Que fait Marc le samedi matin ?',
      qEn: 'What does Marc do on Saturday morning?',
      options: ['Il joue au football.', 'Il fait du vélo.', 'Il fait ses devoirs.', 'Il joue du piano.'],
      answer: 1,
      evidence: 'il fait du vélo au bord de la Garonne',
      explain: b(
        'In the morning, after breakfast, “il fait du vélo au bord de la Garonne”. Football is in the afternoon.',
        'Le matin, après le petit-déjeuner, « il fait du vélo au bord de la Garonne ». Le football, c’est l’après-midi.',
      ),
      skill: 'detail',
    },
    {
      q: 'Avec qui Marc joue-t-il au football ?',
      qEn: 'Who does Marc play football with?',
      options: ['Avec sa sœur', 'Avec ses amis', 'Avec son père', 'Tout seul'],
      answer: 1,
      evidence: ['il mange avec ses amis', 'ils jouent au football dans le parc'],
      explain: b(
        '“Ils jouent au football”: ils stands for Marc and his friends, mentioned in the sentence before.',
        '« Ils jouent au football » : ils remplace Marc et ses amis, cités dans la phrase d’avant.',
      ),
      skill: 'inference',
    },
    {
      q: 'Marc est-il très bon au football ?',
      qEn: 'Is Marc very good at football?',
      options: ['Oui, c’est le meilleur.', 'Non, mais il s’amuse beaucoup.', 'Non, il n’aime pas le football.', 'Le texte ne le dit pas.'],
      answer: 1,
      evidence: 'Marc n’est pas très bon, mais il s’amuse beaucoup !',
      explain: b(
        '“Marc n’est pas très bon, mais il s’amuse beaucoup !” Mais introduces the positive side.',
        '« Marc n’est pas très bon, mais il s’amuse beaucoup ! » Mais introduit le côté positif.',
      ),
      skill: 'detail',
    },
    {
      q: 'Qui joue du piano ?',
      qEn: 'Who plays the piano?',
      options: ['Marc', 'Julie, la sœur de Marc', 'Les amis de Marc', 'Personne'],
      answer: 1,
      evidence: 'Julie joue du piano et Marc écoute',
      explain: b(
        '“Julie joue du piano et Marc écoute.” Marc cooks the pasta, his sister plays.',
        '« Julie joue du piano et Marc écoute. » Marc prépare les pâtes, sa sœur joue.',
      ),
      skill: 'detail',
    },
  ],
  focus: {
    title: b('Leisure: faire du, jouer au, jouer du', 'Les loisirs : faire du, jouer au, jouer du'),
    body: b(
      'For a sport or an activity, French uses **faire de**: __faire du vélo__, __faire de la cuisine__. For a game or a team sport, **jouer à**: __jouer au football__. For a musical instrument, **jouer de**: __jouer du piano__. Remember the contractions: de + le = **du**, à + le = **au**.',
      'Pour un sport ou une activité, on dit **faire de** : __faire du vélo__, __faire de la cuisine__. Pour un jeu ou un sport d’équipe, **jouer à** : __jouer au football__. Pour un instrument de musique, **jouer de** : __jouer du piano__. Attention aux contractions : de + le = **du**, à + le = **au**.',
    ),
    examples: [
      { fr: 'Il fait du vélo.', tr: 'He goes cycling.' },
      { fr: 'Ils jouent au football.', tr: 'They play football.' },
      { fr: 'Julie joue du piano.', tr: 'Julie plays the piano.' },
    ],
  },
};

export default text;
