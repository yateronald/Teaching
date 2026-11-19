// B2 · Approximate numbers: une dizaine, une quinzaine, la cinquantaine, un millier.
import { ear, ex, fill, pick, situation } from '../authoring';

const REUNION = 'Il y avait une petite centaine de personnes à la réunion, la plupart la quarantaine passée. On a parlé une bonne heure, et on se revoit dans une quinzaine.';
const REUNION_SHOW = 'Il y avait une petite {centaine} de personnes à la réunion, la plupart la {quarantaine} passée. On a parlé une bonne heure, et on se revoit dans une {quinzaine}.';

export default ear('les-nombres-approximatifs', {
  rule: [
    ['Les nombres approximatifs', 'Approximate numbers'],
    [
      'Avec **-aine**, un nombre devient approximatif : __une dizaine__ (environ dix), __une vingtaine__, __une centaine__. On dit aussi __un millier__ (environ mille).\n\nAttention aux sens figés : __une quinzaine de jours__ = deux semaines, __la cinquantaine__ = l’âge d’environ cinquante ans, __une douzaine d’œufs__ = exactement douze. Les petits mots changent la quantité : __une petite centaine__ (un peu moins de cent), __une bonne heure__ (un peu plus d’une heure).',
      'With **-aine**, a number becomes approximate: __une dizaine__ (about ten), __une vingtaine__, __une centaine__. You also say __un millier__ (about a thousand).\n\nWatch fixed meanings: __une quinzaine de jours__ = two weeks, __la cinquantaine__ = being about fifty, __une douzaine d’œufs__ = exactly twelve. Little words change the amount: __une petite centaine__ (a bit under a hundred), __une bonne heure__ (a bit over an hour).',
    ],
  ],
  goal: ['Comprendre une quantité approximative et ses nuances.', 'Understand an approximate quantity and its nuances.'],
  examples: [
    ex('Il y avait une vingtaine d’invités.', 'Il y avait une {vingtaine} d’invités.', ['Environ vingt.', 'About twenty.']),
    ex('Je pars une quinzaine de jours.', 'Je pars une {quinzaine} de jours.', ['Deux semaines.', 'Two weeks.']),
    ex('Il a la cinquantaine.', 'Il a la {cinquantaine}.', ['Il a environ cinquante ans.', 'He is about fifty.']),
  ],
  items: [
    pick('On attend un millier de visiteurs.', ['Environ cent', 'Environ mille', 'Exactement mille'], 1, 'On attend un {millier} de visiteurs.', [
      'Un millier = environ mille.', 'Un millier = about a thousand.',
    ], ['Combien de visiteurs attend-on ?', 'How many visitors are expected?']),
    pick('Elle part une quinzaine de jours en Bretagne.', ['Deux semaines', 'Quinze semaines', 'Une semaine'], 0, 'Elle part une {quinzaine} de jours en Bretagne.', [
      'Une quinzaine de jours = deux semaines.', 'Une quinzaine de jours = a fortnight.',
    ], ['Combien de temps part-elle ?', 'How long is she going away?']),
    pick('Il y avait une petite centaine de personnes.', ['Un peu plus de cent', 'Un peu moins de cent', 'Exactement cent'], 1, 'Il y avait une {petite} centaine de personnes.', [
      '« Petite » réduit : un peu moins de cent.', '« Petite » lowers it: a bit under a hundred.',
    ], ['Combien de personnes y avait-il ?', 'How many people were there?']),
    pick('Ça fait une bonne heure que j’attends.', ['Un peu moins d’une heure', 'Un peu plus d’une heure', 'Exactement une heure'], 1, 'Ça fait une {bonne} heure que j’attends.', [
      '« Bonne » augmente : un peu plus d’une heure.', '« Bonne » raises it: a bit over an hour.',
    ], ['Depuis combien de temps attend-il ?', 'How long has he been waiting?']),
    pick('Achète une douzaine d’œufs.', ['Exactement douze', 'Environ dix', 'Une vingtaine'], 0, 'Achète une {douzaine} d’œufs.', [
      'Pour les œufs, une douzaine = exactement douze.', 'For eggs, une douzaine = exactly twelve.',
    ], ['Combien d’œufs faut-il acheter ?', 'How many eggs should be bought?']),
    fill('Ils ont la trentaine, tous les deux.', 'Ils ont la ___, tous les deux.', 'trentaine', 'Ils ont la {trentaine}, tous les deux.', [
      'La trentaine = environ trente ans.', 'La trentaine = about thirty.',
    ]),
    fill('Il y a des centaines de livres chez elle.', 'Il y a des ___ de livres chez elle.', 'centaines', 'Il y a des {centaines} de livres chez elle.', [
      'Des centaines = beaucoup, plusieurs centaines.', 'Des centaines = hundreds.',
    ]),
    fill('J’ai invité une dizaine d’amis.', 'J’ai invité une ___ d’amis.', 'dizaine', 'J’ai invité une {dizaine} d’amis.', [
      'Une dizaine = environ dix.', 'Une dizaine = about ten.',
    ]),
    situation(REUNION, 'Combien de personnes y avait-il à la réunion ?', ['Un peu moins de cent', 'Une quarantaine', 'Une quinzaine'], 0, REUNION_SHOW, [
      '« Une petite centaine » : un peu moins de cent.', '« Une petite centaine »: just under a hundred.',
    ]),
    situation(REUNION, 'Quand se revoient-ils ?', ['Dans deux semaines', 'Dans quinze jours exactement, un lundi', 'Dans une heure'], 0, REUNION_SHOW, [
      '« Dans une quinzaine » = dans deux semaines environ.', '« Dans une quinzaine » = in about two weeks.',
    ]),
  ],
  takeaway: [
    '-aine = environ : une dizaine, une centaine. Un millier = environ mille. « Petite » baisse un peu, « bonne » augmente un peu. Une quinzaine de jours = deux semaines.',
    '-aine = about: une dizaine, une centaine. Un millier = about a thousand. « Petite » lowers a little, « bonne » raises a little. Une quinzaine de jours = two weeks.',
  ],
});
