// C2 · Wordplay: double meanings in jokes (« le comble ») and in radio titles.
import { ear, ex, fill, pick, situation } from '../authoring';

const RADIO = 'Ce soir, à la radio, on parle des boulangers en grève. Notre invité nous dira s’ils ont vraiment du pain sur la planche, ou s’ils sont simplement dans le pétrin.';
const RADIO_SHOW = 'Ce soir, à la radio, on parle des boulangers en grève. Notre invité nous dira s’ils ont vraiment {du pain sur la planche}, ou s’ils sont simplement {dans le pétrin}.';

export default ear('les-jeux-de-mots', {
  rule: [
    ['Le double sens', 'Double meanings'],
    [
      'Le calembour joue sur un mot ou une expression qui a deux sens. Il est partout : dans les titres de presse et de radio, les publicités, les blagues. Le jeu classique du __comble__ en est un bon exemple : __Le comble pour un électricien ? Ne pas être au courant.__ (le courant électrique / être informé).\n\nPour comprendre la blague, il faut entendre le **sens propre** (lié au métier ou au sujet) et le **sens figuré** (une expression courante) : __être dans le pétrin__ (le pétrin du boulanger / une situation difficile), __avoir du pain sur la planche__ (beaucoup de travail).',
      'A pun plays on a word or phrase with two meanings. It is everywhere: in newspaper and radio headlines, adverts, jokes. The classic « le comble » game is a good example: __Le comble pour un électricien ? Ne pas être au courant.__ (electric current / being informed).\n\nTo get the joke, hear the **literal meaning** (linked to the job or topic) and the **figurative meaning** (a common idiom): __être dans le pétrin__ (the baker’s kneading trough / being in a fix), __avoir du pain sur la planche__ (to have a lot of work).',
    ],
  ],
  goal: ['Entendre le double sens d’un jeu de mots.', 'Hear the double meaning in a pun.'],
  examples: [
    ex('Le comble pour un électricien ? Ne pas être au courant.', 'Le comble pour un électricien ? Ne pas être {au courant}.', ['Courant électrique / être informé.', 'Electric current / being informed.']),
    ex('Le comble pour un jardinier ? Raconter des salades.', 'Le comble pour un jardinier ? Raconter des {salades}.', ['Les salades du jardin / des mensonges.', 'Garden lettuces / lies.']),
    ex('Le comble pour un boulanger ? Être dans le pétrin.', 'Le comble pour un boulanger ? Être dans le {pétrin}.', ['La cuve à pâte / une situation difficile.', 'The kneading trough / a tight spot.']),
  ],
  items: [
    pick('Le comble pour un électricien ? Ne pas être au courant.', ['Courant d’air / rivière', 'Courant électrique / être informé'], 1, 'Le comble pour un électricien ? Ne pas être {au courant}.', [
      'Être au courant = être informé ; le courant = l’électricité.', 'Être au courant = to be informed; le courant = electricity.',
    ], ['Sur quel double sens joue la blague ?', 'What double meaning does the joke play on?']),
    pick('Le comble pour un astronaute ? Être dans la lune.', ['La lune, l’astre / être distrait', 'La lune / un voyage spatial'], 0, 'Le comble pour un astronaute ? Être {dans la lune}.', [
      'Être dans la lune = être rêveur, distrait.', 'Être dans la lune = to be daydreaming.',
    ], ['Sur quel double sens joue la blague ?', 'What double meaning does the joke play on?']),
    pick('Fête de la musique : la ville donne le la.', ['Elle donne un concert gratuit', 'Elle montre l’exemple, en jouant sur la note de musique'], 1, 'Fête de la musique : la ville {donne le la}.', [
      'Donner le la = donner le ton, montrer l’exemple ; le la est aussi une note.', 'Donner le la = to set the tone; la is also a note.',
    ], ['Que veut dire « donner le la » dans ce titre ?', 'What does « donner le la » mean in this headline?']),
    pick('Le comble pour un pêcheur ? Noyer le poisson.', ['Éviter le sujet, embrouiller / le poisson du pêcheur', 'Pêcher beaucoup de poissons'], 0, 'Le comble pour un pêcheur ? {Noyer le poisson}.', [
      'Noyer le poisson = détourner l’attention, éviter une question.', 'To muddy the waters, dodge a question.',
    ], ['Sur quel double sens joue la blague ?', 'What double meaning does the joke play on?']),
    pick('Ce boulanger a du pain sur la planche.', ['Il a du pain à vendre seulement', 'Il a beaucoup de travail, et du vrai pain'], 1, 'Ce boulanger a {du pain sur la planche}.', [
      'Avoir du pain sur la planche = avoir beaucoup de travail.', 'To have a lot on your plate.',
    ], ['Quel double sens entendez-vous ?', 'What double meaning do you hear?']),
    fill('Le comble pour un couturier ? Perdre le fil.', 'Le comble pour un couturier ? Perdre le ___.', 'fil', 'Le comble pour un couturier ? Perdre le {fil}.', [
      'Perdre le fil = ne plus savoir où l’on en est ; le fil à coudre.', 'To lose the thread; sewing thread.',
    ]),
    fill('Le comble pour un jardinier ? Raconter des salades.', 'Le comble pour un jardinier ? Raconter des ___.', 'salades', 'Le comble pour un jardinier ? Raconter des {salades}.', [
      'Raconter des salades = mentir.', 'To tell tall tales.',
    ]),
    fill('Le comble pour un boulanger ? Être dans le pétrin.', 'Le comble pour un boulanger ? Être dans le ___.', 'pétrin', 'Le comble pour un boulanger ? Être dans le {pétrin}.', [
      'Être dans le pétrin = être en difficulté.', 'To be in a fix.',
    ]),
    situation(RADIO, 'De qui parle-t-on ?', ['Des jardiniers', 'Des électriciens', 'Des boulangers en grève'], 2, RADIO_SHOW, [
      '« On parle des boulangers en grève ».', '« We are talking about striking bakers ».',
    ]),
    situation(RADIO, 'Qu’est-ce qui rend l’annonce amusante ?', ['Les expressions jouent avec le vocabulaire du pain', 'L’invité raconte une blague', 'Le présentateur se trompe'], 0, RADIO_SHOW, [
      'Pain sur la planche, pétrin : deux expressions qui parlent aussi de boulangerie.', 'Two idioms that also refer to baking.',
    ]),
  ],
  takeaway: [
    'Un jeu de mots superpose un sens propre et un sens figuré : être au courant, dans la lune, dans le pétrin, perdre le fil. Cherchez l’expression courante cachée dans le vocabulaire du sujet.',
    'A pun layers a literal and a figurative meaning: être au courant, dans la lune, dans le pétrin, perdre le fil. Look for the common idiom hidden in the topic’s vocabulary.',
  ],
});
