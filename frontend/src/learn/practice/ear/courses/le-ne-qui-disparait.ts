// C1 · Negation without « ne »: c’est pas grave, j’ai rien vu, y a personne.
import { ear, ex, fill, pick, situation } from '../authoring';

const PLAINTE = 'Franchement, j’ai rien contre lui, mais il répond jamais aux messages, et ce matin, y avait personne pour ouvrir la boutique. Ça peut plus durer.';
const PLAINTE_SHOW = 'Franchement, j’ai {rien} contre lui, mais il répond {jamais} aux messages, et ce matin, y avait {personne} pour ouvrir la boutique. Ça peut {plus} durer.';

export default ear('le-ne-qui-disparait', {
  rule: [
    ['La négation sans « ne »', 'Negation without « ne »'],
    [
      'À l’oral courant, le __ne__ de la négation disparaît presque toujours : __je sais pas__, __c’est pas grave__, __j’ai rien vu__, __y a personne__. Toute la négation repose alors sur le deuxième mot : **pas, rien, jamais, personne, plus**.\n\nC’est là qu’il faut tendre l’oreille : __j’ai rien compris__ et __j’ai tout compris__ ne diffèrent que d’un mot, et __y a personne__ ne veut pas dire « il y a une personne ».',
      'In everyday speech, the __ne__ of negation is almost always dropped: __je sais pas__, __c’est pas grave__, __j’ai rien vu__, __y a personne__. The whole negation then rests on the second word: **pas, rien, jamais, personne, plus**.\n\nThat is where you must listen closely: __j’ai rien compris__ and __j’ai tout compris__ differ by one word, and __y a personne__ does not mean « there is one person ».',
    ],
  ],
  goal: ['Entendre la négation quand le « ne » a disparu.', 'Hear the negation when « ne » has gone.'],
  examples: [
    ex('Je ne sais pas.', 'Je ~ne~ sais {pas}.', ['À l’oral : « je sais pas ».', 'In speech: « je sais pas ».'], 'Je sais pas.'),
    ex('Ce n’est pas grave.', 'C’est {pas} grave.', ['Le « ne » disparaît ; « pas » porte la négation.', '« Ne » disappears; « pas » carries the negation.'], 'C’est pas grave.'),
    ex('Il n’y a personne.', 'Y a {personne}.', ['« Il n’y a » devient « y a ».', '« Il n’y a » becomes « y a ».'], 'Y a personne.'),
  ],
  items: [
    pick('J’ai rien compris.', ['J’ai tout compris.', 'J’ai rien compris.'], 1, 'J’ai {rien} compris.', [
      'Sans « ne », la négation est dans « rien » : il n’a rien compris.', 'Without « ne », the negation is in « rien »: he understood nothing.',
    ]),
    pick('Il vient plus le mardi.', ['Il vient plus le mardi.', 'Il vient le mardi.'], 0, 'Il vient {plus} le mardi.', [
      '« Plus » [ply] = il ne vient plus : il a arrêté.', '« Plus » [ply] = he no longer comes.',
    ]),
    pick('Je fume jamais.', ['Je fume souvent.', 'Je fume jamais.'], 1, 'Je fume {jamais}.', [
      '« Jamais » : il ne fume pas du tout.', '« Jamais »: he never smokes.',
    ]),
    pick('Y a personne à l’accueil.', ['Oui, une personne', 'Non, personne', 'Oui, plusieurs personnes'], 1, 'Y a {personne} à l’accueil.', [
      '« Y a personne » = il n’y a personne. Ce n’est pas « une personne ».', '« Y a personne » = there is nobody, not « one person ».',
    ], ['Y a-t-il quelqu’un à l’accueil ?', 'Is anyone at reception?']),
    pick('T’inquiète, c’est pas grave.', ['Ce n’est pas grave', 'C’est grave'], 0, 'T’inquiète, c’est {pas} grave.', [
      'C’est pas grave = ce n’est pas grave. « T’inquiète » = ne t’inquiète pas.', 'C’est pas grave = it does not matter. « T’inquiète » = don’t worry.',
    ], ['Que veut dire la personne ?', 'What does the speaker mean?']),
    fill('Je sais pas où il est.', 'Je sais ___ où il est.', 'pas', 'Je sais {pas} où il est.', [
      'Je sais pas = je ne sais pas.', 'Je sais pas = I don’t know.',
    ]),
    fill('On a jamais vu ça.', 'On a ___ vu ça.', 'jamais', 'On a {jamais} vu ça.', [
      'On a jamais vu ça = on n’a jamais vu ça.', 'We have never seen that.',
    ]),
    fill('J’en peux plus.', 'J’en peux ___.', 'plus', 'J’en peux {plus}.', [
      'J’en peux plus = je n’en peux plus : je suis épuisé.', 'J’en peux plus = I can’t take any more.',
    ]),
    situation(PLAINTE, 'Que reproche-t-on à cet homme ?', ['Il répond trop vite', 'Il ne répond jamais aux messages', 'Il arrive trop tôt'], 1, PLAINTE_SHOW, [
      '« Il répond jamais aux messages » = il ne répond jamais.', '« Il répond jamais » = he never answers.',
    ]),
    situation(PLAINTE, 'Que s’est-il passé ce matin ?', ['Personne n’a ouvert la boutique', 'Une personne a ouvert la boutique', 'Il a ouvert la boutique en retard'], 0, PLAINTE_SHOW, [
      '« Y avait personne pour ouvrir » = il n’y avait personne.', '« Y avait personne » = there was nobody.',
    ]),
  ],
  takeaway: [
    'À l’oral, le « ne » tombe : toute la négation est dans pas, rien, jamais, personne ou plus. Écoutez ce mot-là, c’est lui qui change le sens.',
    'In speech, « ne » drops: the whole negation is in pas, rien, jamais, personne or plus. Listen for that word: it changes the meaning.',
  ],
});
