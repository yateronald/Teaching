// C2 · Literary subjunctive and the « second past conditional »: il eût fallu, on eût dit, qu’il fût.
import { ear, ex, fill, pick, situation } from '../authoring';

const DEPART = 'Il eût été plus sage d’attendre la fin de l’hiver. Mais, bien qu’il fût prévenu des dangers, il partit dès les premiers jours de janvier.';
const DEPART_SHOW = 'Il {eût été} plus sage d’attendre la fin de l’hiver. Mais, bien qu’il {fût} prévenu des dangers, il partit dès les premiers jours de janvier.';

export default ear('il-eut-fallu', {
  rule: [
    ['Les temps du discours littéraire', 'The tenses of literary speech'],
    [
      'Dans une lecture littéraire, un discours très soutenu ou un registre volontairement ironique, on entend encore l’**imparfait du subjonctif** (__qu’il fût__, __qu’il eût__, __qu’il fît__, __qu’il vînt__) et le **plus-que-parfait du subjonctif** employé comme conditionnel passé : __il eût fallu__ (= il aurait fallu), __on eût dit__ (= on aurait dit), __j’eusse aimé__ (= j’aurais aimé).\n\nPas besoin de les employer : il suffit de les reconnaître. __Eût__ [y] avec un accent circonflexe sonne comme __eut__ ; c’est le sens de la phrase qui dit s’il faut comprendre « aurait ».',
      'In a literary reading, very formal speech or a deliberately ironic register, you still hear the **imperfect subjunctive** (__qu’il fût__, __qu’il eût__, __qu’il fît__, __qu’il vînt__) and the **pluperfect subjunctive** used as a past conditional: __il eût fallu__ (= il aurait fallu), __on eût dit__ (= on aurait dit), __j’eusse aimé__ (= j’aurais aimé).\n\nNo need to use them: just recognise them. __Eût__ [y] sounds like __eut__; the meaning of the sentence tells you to understand « would have ».',
    ],
  ],
  goal: ['Reconnaître les temps littéraires et retrouver leur sens courant.', 'Recognise literary tenses and find their everyday meaning.'],
  examples: [
    ex('Il eût fallu partir plus tôt.', 'Il {eût fallu} partir plus tôt.', ['= Il aurait fallu.', '= It would have been necessary.']),
    ex('On eût dit un tableau.', 'On {eût dit} un tableau.', ['= On aurait dit.', '= It looked like.']),
    ex('Bien qu’il fût tard, il travaillait.', 'Bien qu’il {fût} tard, il travaillait.', ['= Bien qu’il soit tard (au passé).', '= Although it was late.']),
  ],
  items: [
    pick('Il eût fallu le prévenir.', ['Il faudra le prévenir', 'Il aurait fallu le prévenir'], 1, 'Il {eût fallu} le prévenir.', [
      'Eût fallu = aurait fallu : on ne l’a pas prévenu.', 'He should have been told.',
    ], ['Que veut dire la phrase ?', 'What does the sentence mean?']),
    pick('On eût dit un rêve.', ['On aurait dit un rêve', 'On dira un rêve'], 0, 'On {eût dit} un rêve.', [
      'On eût dit = on aurait dit.', 'It was like a dream.',
    ], ['Que veut dire la phrase ?', 'What does the sentence mean?']),
    pick('Bien qu’il fût malade, il vint.', ['Non', 'Oui'], 1, 'Bien qu’il {fût} malade, il {vint}.', [
      'Bien qu’il fût malade = malgré sa maladie.', 'Although he was ill.',
    ], ['Était-il malade ?', 'Was he ill?']),
    pick('J’eusse aimé vous rencontrer plus tôt.', ['Je vous ai rencontré tôt', 'J’aurais aimé vous rencontrer plus tôt'], 1, 'J’{eusse aimé} vous rencontrer plus tôt.', [
      'J’eusse aimé = j’aurais aimé : un regret.', 'I would have liked: a regret.',
    ], ['Que veut dire la personne ?', 'What does the speaker mean?']),
    pick('Il fallait qu’il vînt seul.', ['Venir', 'Vaincre', 'Voir'], 0, 'Il fallait qu’il {vînt} seul.', [
      'Vînt : venir à l’imparfait du subjonctif.', 'Vînt: venir, imperfect subjunctive.',
    ], ['Quel verbe ?', 'Which verb?']),
    fill('Il eût mieux valu se taire.', 'Il eût mieux ___ se taire.', 'valu', 'Il eût mieux {valu} se taire.', [
      'Il eût mieux valu = il aurait mieux valu.', 'It would have been better.',
    ]),
    fill('On eût dit une statue.', 'On ___ dit une statue.', ['eût', 'eut'], 'On {eût} dit une statue.', [
      'On eût dit = on aurait dit.', 'It looked like a statue.',
    ]),
    fill('Bien qu’elle fût jeune, elle dirigeait tout.', 'Bien qu’elle ___ jeune, elle dirigeait tout.', ['fût', 'fut'], 'Bien qu’elle {fût} jeune, elle dirigeait tout.', [
      'Fût : être à l’imparfait du subjonctif.', 'Fût: être, imperfect subjunctive.',
    ]),
    situation(DEPART, 'Qu’aurait-il été plus sage de faire ?', ['Partir en décembre', 'Attendre la fin de l’hiver', 'Ne jamais partir'], 1, DEPART_SHOW, [
      '« Il eût été plus sage » = il aurait été plus sage.', '« It would have been wiser ».',
    ]),
    situation(DEPART, 'Était-il informé des dangers ?', ['Non', 'On ne sait pas', 'Oui'], 2, DEPART_SHOW, [
      '« Bien qu’il fût prévenu » = bien qu’il ait été prévenu.', '« Although he had been warned ».',
    ]),
  ],
  takeaway: [
    'Il eût fallu = il aurait fallu ; on eût dit = on aurait dit ; qu’il fût, qu’il vînt = imparfait du subjonctif. Il suffit de les reconnaître et de les traduire en temps courants.',
    'Il eût fallu = il aurait fallu; on eût dit = on aurait dit; qu’il fût, qu’il vînt = imperfect subjunctive. Just recognise them and translate them into everyday tenses.',
  ],
});
