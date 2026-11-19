// C2 · Impersonal phrases: il s’agit de, il en va de, il importe que, il reste que, il se trouve que.
import { ear, ex, fill, pick, situation } from '../authoring';

const CRISE = 'Il ne s’agit pas de chercher un coupable. Il importe avant tout de comprendre ce qui s’est passé, car il en va de la confiance de nos clients.';
const CRISE_SHOW = '{Il ne s’agit pas de} chercher un coupable. {Il importe} avant tout de comprendre ce qui s’est passé, car {il en va de} la confiance de nos clients.';

export default ear('les-tournures-impersonnelles', {
  rule: [
    ['Le « il » qui ne désigne personne', 'The « il » that refers to no one'],
    [
      'Dans ces tournures, __il__ ne désigne personne : il sert à présenter un enjeu, une obligation ou une nuance.\n\n__il s’agit de__ (c’est une question de, il faut), __il en va de__ / __il y va de__ (… est en jeu : il en va de notre avenir), __il importe que__ + subjonctif (il est important que), __il reste que__ / __il n’en demeure pas moins que__ (malgré tout), __il est question de__ (on envisage, on parle de), __il se trouve que__ (par hasard, en fait).\n\nAttention : __il est question de fermer l’usine__ ne veut pas dire qu’elle est fermée, seulement qu’on l’envisage.',
      'In these phrases, __il__ refers to no one: it introduces a stake, an obligation or a nuance.\n\n__il s’agit de__ (it is a matter of, one must), __il en va de__ / __il y va de__ (… is at stake: il en va de notre avenir), __il importe que__ + subjunctive (it is important that), __il reste que__ / __il n’en demeure pas moins que__ (nevertheless), __il est question de__ (there is talk of), __il se trouve que__ (as it happens).\n\nCareful: __il est question de fermer l’usine__ does not mean it is closed, only that closing it is being considered.',
    ],
  ],
  goal: ['Comprendre ce qu’annoncent les tournures impersonnelles.', 'Understand what impersonal phrases announce.'],
  examples: [
    ex('Il en va de notre avenir.', '{Il en va de} notre avenir.', ['= Notre avenir est en jeu.', '= Our future is at stake.']),
    ex('Il s’agit de rester calme.', '{Il s’agit de} rester calme.', ['= Il faut rester calme.', '= The thing is to stay calm.']),
    ex('Il reste que rien n’est décidé.', '{Il reste que} rien n’est décidé.', ['= Malgré tout, rien n’est décidé.', '= Nevertheless, nothing is decided.']),
  ],
  items: [
    pick('Il en va de la sécurité de tous.', ['La sécurité de tous est garantie', 'La sécurité de tous est en jeu'], 1, '{Il en va de} la sécurité de tous.', [
      'Il en va de = c’est ce qui est en jeu.', 'At stake.',
    ], ['Que signifie la phrase ?', 'What does the sentence mean?']),
    pick('Il s’agit de trouver une solution rapide.', ['Il faut trouver une solution rapide', 'Une solution a été trouvée'], 0, '{Il s’agit de} trouver une solution rapide.', [
      'Il s’agit de + infinitif = il faut.', 'The point is to.',
    ], ['Que signifie la phrase ?', 'What does the sentence mean?']),
    pick('Il reste que le problème n’est pas réglé.', ['Le problème est réglé', 'Malgré tout, le problème n’est pas réglé'], 1, '{Il reste que} le problème n’est pas réglé.', [
      'Il reste que = malgré tout.', 'Nevertheless.',
    ], ['Que signifie la phrase ?', 'What does the sentence mean?']),
    pick('Il est question de fermer l’usine.', ['On envisage de fermer l’usine', 'L’usine est fermée'], 0, '{Il est question de} fermer l’usine.', [
      'Il est question de = on en parle, on l’envisage.', 'There is talk of.',
    ], ['Que sait-on ?', 'What do we know?']),
    pick('Il se trouve que je connais la directrice.', ['Je cherche la directrice', 'Il se trouve que, en fait, je la connais'], 1, '{Il se trouve que} je connais la directrice.', [
      'Il se trouve que = en fait, par hasard.', 'As it happens.',
    ], ['Que veut dire la personne ?', 'What does the speaker mean?']),
    fill('Il importe que chacun soit informé.', 'Il ___ que chacun soit informé.', 'importe', 'Il {importe} que chacun soit informé.', [
      'Il importe que + subjonctif.', 'Il importe que + subjunctive.',
    ]),
    fill('Il n’en demeure pas moins que c’est risqué.', 'Il n’en ___ pas moins que c’est risqué.', 'demeure', 'Il n’en {demeure} pas moins que c’est risqué.', [
      'Il n’en demeure pas moins que = malgré tout.', 'Nonetheless.',
    ]),
    fill('Il y va de notre réputation.', 'Il y ___ de notre réputation.', 'va', 'Il y {va} de notre réputation.', [
      'Il y va de = c’est en jeu.', 'At stake.',
    ]),
    situation(CRISE, 'Quel est le but, selon l’orateur ?', ['Trouver un coupable', 'Comprendre ce qui s’est passé', 'Rassurer la presse'], 1, CRISE_SHOW, [
      '« Il importe avant tout de comprendre ».', '« Above all we must understand ».',
    ]),
    situation(CRISE, 'Qu’est-ce qui est en jeu ?', ['Le salaire des employés', 'Le prix des produits', 'La confiance des clients'], 2, CRISE_SHOW, [
      '« Il en va de la confiance de nos clients ».', '« Our clients’ trust is at stake ».',
    ]),
  ],
  takeaway: [
    'Il s’agit de (il faut), il en va de / il y va de (en jeu), il importe que (il est important), il reste que (malgré tout), il est question de (on l’envisage), il se trouve que (en fait).',
    'Il s’agit de (one must), il en va de / il y va de (at stake), il importe que (it matters that), il reste que (nevertheless), il est question de (there is talk of), il se trouve que (as it happens).',
  ],
});
