// C1 · Very fast speech: chains of little words (j’te l’avais dit, tu t’en souviens).
import { ear, ex, fill, pick, situation } from '../authoring';

const DEPART = 'Écoute, j’te l’avais dit : faut qu’on parte avant six heures, sinon y aura plus de place. Tu t’en souviens pas ?';
const DEPART_SHOW = 'Écoute, {j’te l’avais dit} : {faut qu’on} parte avant six heures, sinon {y aura plus} de place. {Tu t’en souviens pas} ?';

export default ear('l-oral-tres-rapide', {
  rule: [
    ['Les chaînes de petits mots', 'Chains of little words'],
    [
      'À vitesse naturelle, les petits mots se collent et perdent leur __e__ : __je te l’avais dit__ devient [ʃtəlavɛdi], __je me demande__ devient [ʒmədmɑ̃d], __il faut que j’y aille__ devient __faut qu’j’y aille__, __il y en a__ devient __y en a__, __je ne sais pas__ devient __chais pas__.\n\nIl ne faut pas chercher chaque mot séparément, mais reconnaître le bloc entier, comme un seul mot : __tu t’en souviens__ [tytɑ̃suvjɛ̃], __j’te rappelle__ [ʃtəʁapɛl].',
      'At natural speed, little words stick together and lose their __e__: __je te l’avais dit__ becomes [ʃtəlavɛdi], __je me demande__ becomes [ʒmədmɑ̃d], __il faut que j’y aille__ becomes __faut qu’j’y aille__, __il y en a__ becomes __y en a__, __je ne sais pas__ becomes __chais pas__.\n\nDon’t look for each word separately: recognise the whole block, like a single word: __tu t’en souviens__ [tytɑ̃suvjɛ̃], __j’te rappelle__ [ʃtəʁapɛl].',
    ],
  ],
  goal: ['Reconnaître les blocs de petits mots dits très vite.', 'Recognise blocks of little words said very fast.'],
  examples: [
    ex('Je te l’avais dit.', 'J’te l’avais dit.', ['À l’oral : [ʃtəlavɛdi].', 'In speech: [ʃtəlavɛdi].'], 'J’te l’avais dit.'),
    ex('Il faut que j’y aille.', 'Faut qu’j’y aille.', ['« Il » et le « e » disparaissent.', '« Il » and the « e » disappear.'], 'Faut qu’j’y aille.'),
    ex('Je ne sais pas.', 'Chais pas.', ['« Je sais » devient [ʃɛ].', '« Je sais » becomes [ʃɛ].'], 'Chais pas.'),
  ],
  items: [
    pick('J’te l’ai déjà dit.', ['Je l’ai déjà dit.', 'Je te l’ai déjà dit.'], 1, 'J’{te} l’ai déjà dit.', [
      'Le [t] avant « l’ai » : c’est « je te l’ai ».', 'The [t] before « l’ai »: it is « je te l’ai ».',
    ]),
    pick('Tu t’en souviens ?', ['Tu te souviens ?', 'Tu t’en souviens ?'], 1, 'Tu t’{en} souviens ?', [
      'On entend la nasale [ɑ̃] : « t’en ».', 'You hear the nasal [ɑ̃]: « t’en ».',
    ]),
    pick('Y en a plus.', ['Il n’y en a plus', 'Il y en a davantage'], 0, 'Y en a {plus}.', [
      'Y en a plus = il n’y en a plus [ply].', 'Y en a plus = there is none left.',
    ], ['Que veut dire la phrase ?', 'What does the sentence mean?']),
    pick('Faut qu’j’y aille.', ['Il faut que tu partes', 'Il faut que je parte'], 1, 'Faut qu’{j’}y aille.', [
      'Faut qu’j’y aille = il faut que j’y aille, je dois partir.', 'I have to go.',
    ], ['Qui doit partir ?', 'Who has to leave?']),
    pick('J’me d’mande s’il viendra.', ['Je me demande s’il viendra.', 'Je demande s’il viendra.'], 0, 'J’{me} d’mande s’il viendra.', [
      '[ʒmədmɑ̃d] : le [m] de « me » est là.', '[ʒmədmɑ̃d]: the [m] of « me » is there.',
    ]),
    fill('Chais pas où il est.', '___ pas où il est.', ['Chais', 'chais', 'Je sais', 'je sais'], '{Chais} pas où il est.', [
      'Chais = je sais, prononcé très vite.', 'Chais = je sais, said very fast.',
    ]),
    fill('T’en veux encore ?', 'T’___ veux encore ?', 'en', 'T’{en} veux encore ?', [
      'T’en veux = tu en veux.', 'T’en veux = do you want some.',
    ]),
    fill('J’te rappelle demain.', 'J’___ rappelle demain.', 'te', 'J’{te} rappelle demain.', [
      'J’te rappelle = je te rappelle.', 'I’ll call you back.',
    ]),
    situation(DEPART, 'Pourquoi faut-il partir avant six heures ?', ['Pour être à l’heure au travail', 'Sinon il n’y aura plus de place', 'Parce qu’il va pleuvoir'], 1, DEPART_SHOW, [
      '« Sinon y aura plus de place » = il n’y aura plus de place.', '« Otherwise there will be no room left ».',
    ]),
    situation(DEPART, 'Que reproche la personne ?', ['D’avoir pris sa place', 'D’être parti trop tôt', 'De ne pas se souvenir de ce qu’elle avait dit'], 2, DEPART_SHOW, [
      '« J’te l’avais dit… Tu t’en souviens pas ? »', '« I told you… Don’t you remember? »',
    ]),
  ],
  takeaway: [
    'J’te l’avais dit, tu t’en souviens, faut qu’j’y aille, y en a plus, chais pas : reconnaissez le bloc entier plutôt que chaque mot.',
    'J’te l’avais dit, tu t’en souviens, faut qu’j’y aille, y en a plus, chais pas: recognise the whole block rather than each word.',
  ],
});
