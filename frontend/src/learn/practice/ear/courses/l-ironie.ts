// C1 · Irony: words that say the opposite (bravo, génial, encore heureux).
import { ear, ex, fill, pick, situation } from '../authoring';

const REUNION = 'Ah, formidable : la réunion est reportée pour la troisième fois, et on l’apprend à neuf heures moins cinq. On peut dire que l’organisation, c’est leur point fort.';
const REUNION_SHOW = 'Ah, {formidable} : la réunion est reportée pour la troisième fois, et on l’apprend à neuf heures moins cinq. On peut dire que l’organisation, {c’est leur point fort}.';

export default ear('l-ironie', {
  rule: [
    ['Quand les mots disent le contraire', 'When words say the opposite'],
    [
      'L’ironie dit le contraire de ce qu’elle pense. Trois indices permettent de la repérer : **la situation** (on dit « génial » après une mauvaise nouvelle), **le ton** (plat, traînant, ou exagéré) et **l’exagération** (__vraiment, vraiment bravo__).\n\nCertaines formules sont presque toujours ironiques : __Bravo, c’est malin !__ (c’est stupide), __Il ne manquait plus que ça !__ (un problème de plus), __Merci du cadeau !__ (c’est une charge), __Encore heureux !__ (c’est le minimum).',
      'Irony says the opposite of what it means. Three clues give it away: **the situation** (« great » after bad news), **the tone** (flat, drawn out or exaggerated) and **exaggeration** (__really, really well done__).\n\nSome phrases are almost always ironic: __Bravo, c’est malin !__ (that was stupid), __Il ne manquait plus que ça !__ (one more problem), __Merci du cadeau !__ (thanks for nothing), __Encore heureux !__ (that is the least they could do).',
    ],
  ],
  goal: ['Repérer l’ironie et comprendre ce que la personne pense vraiment.', 'Spot irony and understand what the speaker really thinks.'],
  examples: [
    ex('Tu as cassé mon téléphone ? Bravo, c’est malin !', 'Tu as cassé mon téléphone ? {Bravo, c’est malin} ! ↘', ['Un reproche : ce n’est pas malin du tout.', 'A reproach: not clever at all.']),
    ex('Encore une panne. Génial…', 'Encore une panne. {Génial}… ↘', ['Il est contrarié.', 'He is annoyed.']),
    ex('Il ne manquait plus que ça !', '{Il ne manquait plus que ça} !', ['Un problème de plus.', 'One more problem.']),
  ],
  items: [
    pick('Le train est annulé. Super, vraiment super.', ['Ravie', 'Contrariée'], 1, 'Le train est annulé. {Super, vraiment super}.', [
      'Une bonne formule après une mauvaise nouvelle, répétée : c’est ironique.', 'A positive word after bad news, repeated: irony.',
    ], ['Comment se sent la personne ?', 'How does the speaker feel?']),
    pick('Il pleut, et j’ai oublié mon parapluie. Il ne manquait plus que ça !', ['C’est un problème de plus', 'Tout va bien maintenant'], 0, 'Il pleut, et j’ai oublié mon parapluie. {Il ne manquait plus que ça} !', [
      'Un ennui s’ajoute aux autres.', 'One more nuisance on top of the others.',
    ], ['Que veut dire « il ne manquait plus que ça » ?', 'What does « il ne manquait plus que ça » mean?']),
    pick('Tu m’as remboursé ? Encore heureux !', ['Elle est très reconnaissante', 'C’est la moindre des choses'], 1, 'Tu m’as remboursé ? {Encore heureux} !', [
      'Encore heureux = c’était bien le minimum.', 'Encore heureux = that was the least you could do.',
    ], ['Que veut dire la personne ?', 'What does the speaker mean?']),
    pick('Tu me laisses tout le ménage ? Merci du cadeau !', ['Non, c’est ironique', 'Oui, sincèrement'], 0, 'Tu me laisses tout le ménage ? {Merci du cadeau} !', [
      'Un « cadeau » qui est une corvée : ironie.', 'A « gift » that is a chore: irony.',
    ], ['Est-elle reconnaissante ?', 'Is she grateful?']),
    pick('Bravo, vraiment bravo, tu as encore oublié son anniversaire.', ['Oui, elle le félicite', 'Non, elle lui fait un reproche'], 1, '{Bravo, vraiment bravo}, tu as encore oublié son anniversaire.', [
      'Des félicitations pour un oubli : c’est un reproche.', 'Congratulations for forgetting: a reproach.',
    ], ['La personne félicite-t-elle vraiment ?', 'Is she really congratulating?']),
    fill('Bravo, c’est malin !', 'Bravo, c’est ___ !', 'malin', 'Bravo, c’est {malin} !', [
      'C’est malin ! = ce n’était pas intelligent.', 'C’est malin ! = that was not clever.',
    ]),
    fill('Il ne manquait plus que ça !', 'Il ne manquait plus que ___ !', 'ça', 'Il ne manquait plus que {ça} !', [
      'La formule figée de l’agacement.', 'The set phrase of exasperation.',
    ]),
    fill('Encore heureux qu’il soit venu !', 'Encore ___ qu’il soit venu !', 'heureux', 'Encore {heureux} qu’il soit venu !', [
      'Encore heureux = c’était bien le minimum.', 'Encore heureux = it was the least he could do.',
    ]),
    situation(REUNION, 'Que pense la personne de l’organisation ?', ['Elle la trouve excellente', 'Elle la trouve très mauvaise', 'Elle n’a pas d’avis'], 1, REUNION_SHOW, [
      '« Leur point fort » après trois reports : c’est ironique.', '« Their strong point » after three postponements: irony.',
    ]),
    situation(REUNION, 'Combien de fois la réunion a-t-elle été reportée ?', ['Une fois', 'Deux fois', 'Trois fois'], 2, REUNION_SHOW, [
      '« Reportée pour la troisième fois ».', '« Postponed for the third time ».',
    ]),
  ],
  takeaway: [
    'Mot positif + mauvaise situation + ton traînant = ironie. Bravo, c’est malin ; il ne manquait plus que ça ; merci du cadeau ; encore heureux : comprenez le contraire.',
    'Positive word + bad situation + drawn-out tone = irony. Bravo, c’est malin; il ne manquait plus que ça; merci du cadeau; encore heureux: understand the opposite.',
  ],
});
