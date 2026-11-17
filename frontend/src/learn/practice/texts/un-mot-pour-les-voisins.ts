// A2 · Note. New tenants warn their neighbours about renovation work and
// invite them: the near future (aller + infinitive) and polite formulas.
import { b } from '../../types';
import type { ReadingText } from '../types';

const text: ReadingText = {
  id: 'un-mot-pour-les-voisins',
  warmup: b(
    'You find a note on the door of your building. What can a message from neighbours be about?',
    'Vous trouvez un mot sur la porte de votre immeuble. De quoi peut parler un message de voisins ?',
  ),
  paras: [
    { s: [['Chers voisins,', 'Dear neighbours,']] },
    { s: [
      ['Nous sommes les nouveaux locataires de l’appartement 12, au troisième étage.', 'We are the new tenants of apartment 12, on the third floor.'],
      ['Nous allons faire des travaux dans la cuisine la semaine prochaine, du lundi au jeudi.', 'We are going to have some work done in the kitchen next week, from Monday to Thursday.'],
    ] },
    { s: [
      ['Les ouvriers vont arriver à huit heures et ils vont partir vers dix-sept heures.', 'The workers will arrive at eight and leave around five p.m.'],
      ['Il va y avoir un peu de bruit, surtout le mardi et le mercredi.', 'There is going to be some noise, especially on Tuesday and Wednesday.'],
      ['Nous sommes désolés pour le dérangement.', 'We are sorry for the inconvenience.'],
    ] },
    { s: [
      ['Le samedi suivant, nous allons organiser un petit apéritif dans la cour, à partir de dix-sept heures, pour faire votre connaissance.', 'The following Saturday, we are going to host a little get-together in the courtyard, from five p.m., to get to know you.'],
      ['Vous êtes tous invités !', 'You are all invited!'],
    ] },
    { s: [
      ['Si vous avez une question, vous pouvez frapper à notre porte ou glisser un mot dans notre boîte aux lettres.', 'If you have a question, you can knock on our door or slip a note into our mailbox.'],
    ] },
    { lines: true, s: [
      ['Merci de votre compréhension,', 'Thank you for your understanding,'],
      ['Clara et Hugo, appartement 12', 'Clara and Hugo, apartment 12'],
    ] },
  ],
  glossary: [
    { fr: 'locataires', tr: b('tenants', 'les personnes qui louent un logement') },
    { fr: 'des travaux', tr: b('renovation work', 'des réparations ou des changements dans un logement') },
    { fr: 'Les ouvriers', tr: b('the workers', 'les personnes qui font les travaux') },
    { fr: 'bruit', tr: b('noise', 'des sons forts et désagréables') },
    { fr: 'apéritif', tr: b('a drink before dinner, a small get-together', 'un moment pour boire un verre et grignoter ensemble') },
    { fr: 'la cour', tr: b('the courtyard', 'l’espace dehors, au milieu ou derrière l’immeuble') },
    { fr: 'frapper à notre porte', tr: b('knock on our door', 'taper sur la porte pour nous appeler') },
    { fr: 'boîte aux lettres', tr: b('mailbox', 'la boîte où le facteur met le courrier') },
    { fr: 'Merci de votre compréhension', tr: b('thank you for your understanding', 'formule de politesse à la fin d’un message') },
  ],
  questions: [
    {
      q: 'Qui a écrit ce message ?',
      qEn: 'Who wrote this message?',
      options: ['Le propriétaire de l’immeuble', 'Les nouveaux locataires de l’appartement 12', 'Les ouvriers', 'Un voisin qui se plaint du bruit'],
      answer: 1,
      evidence: 'Nous sommes les nouveaux locataires de l’appartement 12',
      explain: b(
        'They introduce themselves in the first sentence, and they sign “Clara et Hugo, appartement 12”.',
        'Ils se présentent dès la première phrase et signent « Clara et Hugo, appartement 12 ».',
      ),
      skill: 'global',
    },
    {
      q: 'Pourquoi écrivent-ils ce message ?',
      qEn: 'Why are they writing this message?',
      options: ['Pour annoncer des travaux et inviter les voisins', 'Pour vendre leur cuisine', 'Pour se plaindre du bruit', 'Pour chercher un appartement'],
      answer: 0,
      evidence: ['Nous allons faire des travaux', 'Vous êtes tous invités !'],
      explain: b(
        'The note has two goals: warning about the work (and the noise) and inviting the neighbours to a get-together.',
        'Le message a deux objectifs : prévenir des travaux (et du bruit) et inviter les voisins à un apéritif.',
      ),
      skill: 'global',
    },
    {
      q: 'Quels jours y aura-t-il le plus de bruit ?',
      qEn: 'Which days will be the noisiest?',
      options: ['Le lundi et le jeudi', 'Le mardi et le mercredi', 'Le samedi et le dimanche', 'Tous les jours de la semaine'],
      answer: 1,
      evidence: 'surtout le mardi et le mercredi',
      explain: b(
        'The work lasts from Monday to Thursday, but “surtout le mardi et le mercredi”: surtout means especially.',
        'Les travaux durent du lundi au jeudi, mais « surtout le mardi et le mercredi » : surtout veut dire plus que les autres jours.',
      ),
      skill: 'detail',
    },
    {
      q: 'À quelle heure les ouvriers vont-ils partir ?',
      qEn: 'What time will the workers leave?',
      options: ['Vers huit heures', 'Vers midi', 'Vers dix-sept heures', 'Le samedi'],
      answer: 2,
      evidence: 'ils vont partir vers dix-sept heures',
      explain: b(
        'They arrive at eight and “vont partir vers dix-sept heures”: aller + infinitive for a planned action.',
        'Ils arrivent à huit heures et « vont partir vers dix-sept heures » : aller + infinitif pour une action prévue.',
      ),
      skill: 'detail',
    },
    {
      q: 'Pourquoi Clara et Hugo organisent-ils un apéritif ?',
      qEn: 'Why are Clara and Hugo hosting a get-together?',
      options: ['Pour fêter la fin des travaux', 'Pour faire la connaissance de leurs voisins', 'Pour leur anniversaire', 'Pour vendre des meubles'],
      answer: 1,
      evidence: 'pour faire votre connaissance',
      explain: b(
        '“Pour faire votre connaissance”: to meet you for the first time. Pour + infinitive gives the purpose.',
        '« Pour faire votre connaissance » : pour vous rencontrer. Pour + infinitif donne le but.',
      ),
      skill: 'detail',
    },
    {
      q: '« Le dérangement », c’est :',
      qEn: 'What is “le dérangement”?',
      options: ['La gêne causée aux autres', 'Un nouveau meuble', 'Le déménagement', 'Une fête'],
      answer: 0,
      evidence: 'Nous sommes désolés pour le dérangement.',
      explain: b(
        'They are sorry (désolés) because of the noise: le dérangement is the trouble caused to others.',
        'Ils sont désolés à cause du bruit : le dérangement, c’est la gêne causée aux autres.',
      ),
      skill: 'vocab',
    },
  ],
  focus: {
    title: b('The near future: aller + infinitive', 'Le futur proche : aller + infinitif'),
    body: b(
      'To talk about a plan or something about to happen, use **aller** in the present + an **infinitive**: __nous allons faire des travaux__, __les ouvriers vont arriver__. For “there will be”: __il va y avoir du bruit__. In the negative, ne… pas goes around aller: __nous n’allons pas travailler le week-end__.',
      'Pour parler d’un projet ou de quelque chose qui va bientôt arriver : **aller** au présent + **infinitif** : __nous allons faire des travaux__, __les ouvriers vont arriver__. Pour « il y aura » : __il va y avoir du bruit__. À la forme négative, ne… pas entoure aller : __nous n’allons pas travailler le week-end__.',
    ),
    examples: [
      { fr: 'Nous allons faire des travaux.', tr: 'We are going to have some work done.' },
      { fr: 'Les ouvriers vont arriver à huit heures.', tr: 'The workers will arrive at eight.' },
      { fr: 'Il va y avoir un peu de bruit.', tr: 'There is going to be some noise.' },
    ],
  },
};

export default text;
