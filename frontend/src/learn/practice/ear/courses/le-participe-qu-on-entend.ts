// C1 · The audible past-participle agreement: écrite, prise, faite, mise, ouverte.
import { ear, ex, fill, pick, situation } from '../authoring';

const VOYAGE = 'Les photos, je les ai prises à Venise, et la vidéo, c’est ma sœur qui l’a faite. Le texte, en revanche, je l’ai écrit moi-même.';
const VOYAGE_SHOW = 'Les photos, je les ai {prises} à Venise, et la vidéo, c’est ma sœur qui l’a {faite}. Le texte, en revanche, je l’ai {écrit} moi-même.';

export default ear('le-participe-qu-on-entend', {
  rule: [
    ['L’accord qu’on entend', 'The agreement you can hear'],
    [
      'Avec __avoir__, le participe passé s’accorde avec le complément placé **avant** : __la lettre qu’il a écrite__. Pour la plupart des verbes, cela ne s’entend pas (__la robe qu’elle a achetée__ sonne comme __acheté__).\n\nMais avec les participes terminés par une consonne muette, l’accord **s’entend** : __écrit / écrite__ [t], __pris / prise__ [z], __fait / faite__ [t], __mis / mise__ [z], __ouvert / ouverte__ [t], __dit / dite__, __offert / offerte__. Ce [t] ou ce [z] vous dit que l’objet dont on parle est féminin.',
      'With __avoir__, the past participle agrees with the object placed **before** it: __la lettre qu’il a écrite__. For most verbs you cannot hear it (__la robe qu’elle a achetée__ sounds like __acheté__).\n\nBut with participles ending in a silent consonant, the agreement **can be heard**: __écrit / écrite__ [t], __pris / prise__ [z], __fait / faite__ [t], __mis / mise__ [z], __ouvert / ouverte__ [t], __dit / dite__, __offert / offerte__. That [t] or [z] tells you the object is feminine.',
    ],
  ],
  goal: ['Entendre l’accord du participe et retrouver de quoi on parle.', 'Hear the participle agreement and work out what is meant.'],
  examples: [
    ex('La lettre qu’il a écrite.', 'La lettre qu’il a {écrite}.', ['On entend le [t] : la lettre est féminine.', 'You hear the [t]: lettre is feminine.']),
    ex('Les décisions qu’ils ont prises.', 'Les décisions qu’ils ont {prises}.', ['[pʁiz] : accord avec « décisions ».', '[pʁiz]: agrees with « décisions ».']),
    ex('Cette porte, qui l’a ouverte ?', 'Cette porte, qui l’a {ouverte} ?', ['[uvɛʁt] : l’ = la porte.', '[uvɛʁt]: l’ = the door.']),
  ],
  items: [
    pick('La table, je l’ai mise dans le salon.', ['Le livre, je l’ai mis dans le salon.', 'La table, je l’ai mise dans le salon.'], 1, 'La table, je l’ai {mise} dans le salon.', [
      '[miz] : l’objet est féminin, la table.', '[miz]: the object is feminine, the table.',
    ]),
    pick('Je l’ai prise hier.', ['Une chose féminine, comme une photo', 'Une chose masculine, comme un livre'], 0, 'Je l’ai {prise} hier.', [
      'On entend [pʁiz] : l’objet est féminin.', 'You hear [pʁiz]: the object is feminine.',
    ], ['De quoi parle-t-on ?', 'What is being talked about?']),
    pick('Il l’a fait tout seul.', ['Une chose féminine, comme une tarte', 'Une chose masculine, comme un gâteau'], 1, 'Il l’a {fait} tout seul.', [
      '[fɛ] sans [t] : l’objet est masculin.', '[fɛ] without [t]: the object is masculine.',
    ], ['De quoi parle-t-on ?', 'What is being talked about?']),
    pick('Elle l’a dite clairement.', ['Le mot', 'La vérité'], 1, 'Elle l’a {dite} clairement.', [
      '[dit] : l’objet est féminin, la vérité.', '[dit]: the object is feminine, the truth.',
    ], ['Qu’a-t-elle dit clairement ?', 'What did she say clearly?']),
    pick('Les fenêtres que tu as ouvertes.', ['Les fenêtres que tu as ouvertes.', 'Les volets que tu as ouverts.'], 0, 'Les fenêtres que tu as {ouvertes}.', [
      '[uvɛʁt] : féminin, les fenêtres.', '[uvɛʁt]: feminine, the windows.',
    ]),
    fill('C’est la décision qu’il a prise.', 'C’est la décision qu’il a ___.', 'prise', 'C’est la décision qu’il a {prise}.', [
      'Accord avec « la décision », placé avant : prise [pʁiz].', 'Agrees with « la décision », placed before: prise.',
    ]),
    fill('Voici la lettre que j’ai écrite.', 'Voici la lettre que j’ai ___.', 'écrite', 'Voici la lettre que j’ai {écrite}.', [
      'Écrite [ekʁit] : la lettre.', 'Écrite [ekʁit]: the letter.',
    ]),
    fill('Il tient la promesse qu’il a faite.', 'Il tient la promesse qu’il a ___.', 'faite', 'Il tient la promesse qu’il a {faite}.', [
      'Faite [fɛt] : la promesse.', 'Faite [fɛt]: the promise.',
    ]),
    situation(VOYAGE, 'Qui a fait la vidéo ?', ['Lui-même', 'Sa sœur', 'Un ami'], 1, VOYAGE_SHOW, [
      '« C’est ma sœur qui l’a faite » : l’ = la vidéo.', '« My sister made it »: l’ = the video.',
    ]),
    situation(VOYAGE, 'Qu’est-ce que la personne a écrit elle-même ?', ['La légende des photos', 'Le texte', 'La lettre'], 1, VOYAGE_SHOW, [
      '« Je l’ai écrit » [ekʁi] sans [t] : un mot masculin, le texte.', '« Je l’ai écrit » without [t]: a masculine word, the text.',
    ]),
  ],
  takeaway: [
    'Écrite, prise, faite, mise, ouverte, dite : quand l’objet féminin est placé avant, on entend [t] ou [z]. Ce son vous dit de quoi l’on parle.',
    'Écrite, prise, faite, mise, ouverte, dite: when a feminine object comes before, you hear [t] or [z]. That sound tells you what is meant.',
  ],
});
