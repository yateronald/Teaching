// A1 · Dialogue at a train station: buying a ticket, times and prices.
// Language point: asking questions (à quelle heure, combien, quel).
import { b } from '../../types';
import type { ReadingText } from '../types';

const AGENT = 0;
const DANIEL = 1;

const text: ReadingText = {
  id: 'un-billet-pour-quebec',
  speakers: [{ name: 'L’employée', voice: 'f' }, { name: 'Daniel', voice: 'm' }],
  warmup: b(
    'Have you ever bought a train or bus ticket in French? Which questions do you need to ask?',
    'Avez-vous déjà acheté un billet de train ou de bus en français ? Quelles questions faut-il poser ?',
  ),
  paras: [
    { who: AGENT, s: [
      ['Bonjour monsieur, je vous écoute.', 'Hello, sir, how can I help you?'],
    ] },
    { who: DANIEL, s: [
      ['Bonjour madame.', 'Hello, madam.'],
      ['Je voudrais un billet de train pour Québec, s’il vous plaît.', 'I would like a train ticket to Québec, please.'],
    ] },
    { who: AGENT, s: [
      ['Un aller simple ou un aller-retour ?', 'One way or return?'],
    ] },
    { who: DANIEL, s: [
      ['Un aller-retour.', 'A return ticket.'],
      ['Je pars demain matin et je reviens dimanche soir.', 'I leave tomorrow morning and come back on Sunday evening.'],
    ] },
    { who: AGENT, s: [
      ['Très bien.', 'Very well.'],
      ['Demain, il y a un train à huit heures et un autre à onze heures.', 'Tomorrow, there is a train at eight o’clock and another one at eleven.'],
    ] },
    { who: DANIEL, s: [
      ['Le train de huit heures, s’il vous plaît.', 'The eight o’clock train, please.'],
      ['Il arrive à quelle heure à Québec ?', 'What time does it arrive in Québec?'],
    ] },
    { who: AGENT, s: [
      ['Il arrive à onze heures et quart.', 'It arrives at a quarter past eleven.'],
      ['Et dimanche, le dernier train part à dix-huit heures.', 'And on Sunday, the last train leaves at six p.m.'],
    ] },
    { who: DANIEL, s: [
      ['Parfait.', 'Perfect.'],
      ['Ça coûte combien ?', 'How much is it?'],
    ] },
    { who: AGENT, s: [
      ['L’aller-retour coûte quatre-vingt-dix dollars.', 'The return ticket costs ninety dollars.'],
      ['Vous avez une carte étudiante ?', 'Do you have a student card?'],
    ] },
    { who: DANIEL, s: [
      ['Oui, la voici.', 'Yes, here it is.'],
    ] },
    { who: AGENT, s: [
      ['Alors, avec la réduction, c’est soixante-douze dollars.', 'So, with the discount, it is seventy-two dollars.'],
    ] },
    { who: DANIEL, s: [
      ['Super !', 'Great!'],
      ['Et le train part de quel quai ?', 'And which platform does the train leave from?'],
    ] },
    { who: AGENT, s: [
      ['Du quai numéro trois.', 'From platform number three.'],
      ['Bon voyage, monsieur !', 'Have a good trip, sir!'],
    ] },
    { who: DANIEL, s: [
      ['Merci, bonne journée !', 'Thank you, have a good day!'],
    ] },
  ],
  glossary: [
    { fr: 'je vous écoute', tr: b('how can I help you? (literally: I am listening to you)', 'formule pour dire : dites-moi ce que vous voulez') },
    { fr: 'un billet de train', tr: b('a train ticket', 'le document pour voyager en train') },
    { fr: 'Un aller simple', tr: b('a one-way ticket', 'un billet seulement pour aller') },
    { fr: 'un aller-retour', tr: b('a return ticket', 'un billet pour aller et revenir') },
    { fr: 'je reviens', tr: b('I come back', 'je rentre') },
    { fr: 'le dernier train', tr: b('the last train', 'le train après lequel il n’y en a plus') },
    { fr: 'une carte étudiante', tr: b('a student card', 'la carte qui montre qu’on est étudiant') },
    { fr: 'la réduction', tr: b('the discount', 'un prix plus bas') },
    { fr: 'quai', tr: b('platform', 'l’endroit où on monte dans le train') },
    { fr: 'Bon voyage', tr: b('have a good trip', 'formule pour souhaiter un bon trajet') },
  ],
  questions: [
    {
      q: 'Où se passe cette conversation ?',
      qEn: 'Where does this conversation take place?',
      options: ['Dans un aéroport', 'À la gare', 'Dans un hôtel', 'À l’université'],
      answer: 1,
      evidence: 'Je voudrais un billet de train pour Québec',
      explain: b(
        'A train ticket, a platform, departure times: it is a train station.',
        'Un billet de train, un quai, des horaires : c’est une gare.',
      ),
      skill: 'global',
    },
    {
      q: 'Quel billet Daniel achète-t-il ?',
      qEn: 'Which ticket does Daniel buy?',
      options: ['Un aller simple', 'Un aller-retour', 'Deux billets', 'Un abonnement'],
      answer: 1,
      evidence: 'Un aller-retour.',
      explain: b(
        'He leaves tomorrow and comes back on Sunday: “Un aller-retour.”',
        'Il part demain et revient dimanche : « Un aller-retour. »',
      ),
      skill: 'detail',
    },
    {
      q: 'À quelle heure part le train de Daniel ?',
      qEn: 'What time does Daniel’s train leave?',
      options: ['À huit heures', 'À onze heures', 'À onze heures et quart', 'À dix-huit heures'],
      answer: 0,
      evidence: 'Le train de huit heures, s’il vous plaît.',
      explain: b(
        'He chooses “le train de huit heures”. A quarter past eleven is when it arrives, and six p.m. is the last train on Sunday.',
        'Il choisit « le train de huit heures ». Onze heures et quart, c’est l’arrivée ; dix-huit heures, c’est le dernier train de dimanche.',
      ),
      skill: 'detail',
    },
    {
      q: 'Combien Daniel paie-t-il ?',
      qEn: 'How much does Daniel pay?',
      options: ['Quatre-vingt-dix dollars', 'Soixante-douze dollars', 'Dix-huit dollars', 'Rien'],
      answer: 1,
      evidence: 'avec la réduction, c’est soixante-douze dollars',
      explain: b(
        'Ninety dollars is the normal price; with his student card he gets a discount, so he pays seventy-two dollars.',
        'Quatre-vingt-dix dollars, c’est le prix normal ; avec sa carte étudiante, il a une réduction : il paie soixante-douze dollars.',
      ),
      skill: 'inference',
    },
    {
      q: 'Pourquoi Daniel a-t-il une réduction ?',
      qEn: 'Why does Daniel get a discount?',
      options: ['Il voyage le dimanche.', 'Il est étudiant.', 'Il achète deux billets.', 'Il part très tôt.'],
      answer: 1,
      evidence: 'Vous avez une carte étudiante ?',
      explain: b(
        'The agent asks for a student card, Daniel shows it (“la voici”), then she gives the lower price.',
        'L’employée demande une carte étudiante, Daniel la montre (« la voici »), puis elle donne le prix réduit.',
      ),
      skill: 'inference',
    },
    {
      q: 'Le train part de quel quai ?',
      qEn: 'Which platform does the train leave from?',
      options: ['Du quai numéro un', 'Du quai numéro deux', 'Du quai numéro trois', 'Du quai numéro huit'],
      answer: 2,
      evidence: 'Du quai numéro trois.',
      explain: b(
        '“Du quai numéro trois.” Eight is the departure time, not the platform.',
        '« Du quai numéro trois. » Huit, c’est l’heure du départ, pas le quai.',
      ),
      skill: 'detail',
    },
  ],
  focus: {
    title: b('Asking questions: à quelle heure, combien, quel', 'Poser une question : à quelle heure, combien, quel'),
    body: b(
      'To ask the time: __Il arrive à quelle heure ?__ To ask the price: __Ça coûte combien ?__ To ask which one: **quel** (masculine) or **quelle** (feminine), agreeing with the noun: __de quel quai ?__, __à quelle heure ?__ In everyday spoken French, the question word often comes at the end of the sentence, with the voice going up.',
      'Pour demander l’heure : __Il arrive à quelle heure ?__ Pour demander le prix : __Ça coûte combien ?__ Pour choisir : **quel** (masculin) ou **quelle** (féminin), accordé avec le nom : __de quel quai ?__, __à quelle heure ?__ À l’oral, le mot interrogatif se place souvent à la fin de la phrase, avec une voix qui monte.',
    ),
    examples: [
      { fr: 'Il arrive à quelle heure à Québec ?', tr: 'What time does it arrive in Québec?' },
      { fr: 'Ça coûte combien ?', tr: 'How much is it?' },
      { fr: 'Le train part de quel quai ?', tr: 'Which platform does the train leave from?' },
    ],
  },
};

export default text;
