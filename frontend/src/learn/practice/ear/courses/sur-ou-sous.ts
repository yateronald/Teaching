// A2 · Two vowels to tell apart: [y] (u) and [u] (ou): sur / sous, rue / roue, sûr / sourd.
import { ear, ex, fill, pick, situation } from '../authoring';

export default ear('sur-ou-sous', {
  rule: [
    ['Deux voyelles à ne pas confondre : [y] et [u]', 'Two vowels not to mix up: [y] and [u]'],
    [
      'Le son **[y]** (écrit **u**) n’existe pas dans beaucoup de langues : lèvres arrondies et en avant, langue en avant, comme pour dire « i ». Le son **[u]** (écrit **ou**) se fait avec la langue en arrière.\n\nLes confondre change le sens : __sur__ / __sous__, __dessus__ / __dessous__, __rue__ / __roue__, __sûr__ / __sourd__, __vu__ / __vous__.',
      'The **[y]** sound (written **u**) does not exist in many languages: lips rounded and pushed forward, tongue forward, as if saying « i ». The **[u]** sound (written **ou**) is made with the tongue back.\n\nMixing them up changes the meaning: __sur__ / __sous__, __dessus__ / __dessous__, __rue__ / __roue__, __sûr__ / __sourd__, __vu__ / __vous__.',
    ],
  ],
  goal: ['Distinguer [y] et [u] dans des mots du quotidien.', 'Tell [y] from [u] in everyday words.'],
  examples: [
    ex('Sur la table.', '{sur} la table [syʁ]', ['[y] : lèvres en avant, langue en avant.', '[y]: lips forward, tongue forward.']),
    ex('Sous la table.', '{sous} la table [su]', ['[u] : lèvres en avant, langue en arrière.', '[u]: lips forward, tongue back.']),
    ex('Tu as tout vu.', '{Tu} as {tout} {vu}.', ['[y], [u], [y] dans la même phrase.', '[y], [u], [y] in one sentence.']),
  ],
  items: [
    pick('Mets-le dessus.', ['Mets-le dessus.', 'Mets-le dessous.'], 0, 'Mets-le {dessus}.', [
      '[dəsy] : « dessus », au-dessus. « Dessous » se dit [dəsu].',
      '[dəsy]: « dessus », on top. « Dessous » is [dəsu].',
    ]),
    pick('Il a changé de roue.', ['Il a changé de rue.', 'Il a changé de roue.'], 1, 'Il a changé de {roue}.', [
      '[ʁu] : la roue (d’un vélo, d’une voiture). « La rue » se dit [ʁy].',
      '[ʁu]: the wheel (of a bike, a car). « La rue » is [ʁy].',
    ]),
    pick('Il est sourd.', ['Il est sûr.', 'Il est sourd.'], 1, 'Il est {sourd}.', [
      '[suʁ] : il n’entend pas. « Sûr » (certain) se dit [syʁ].',
      '[suʁ]: he cannot hear. « Sûr » (certain) is [syʁ].',
    ]),
    pick('C’est la Russe, à gauche.', ['C’est la Russe, à gauche.', 'C’est la rousse, à gauche.'], 0, 'C’est la {Russe}, à gauche.', [
      '[ʁys] : une femme de Russie. « La rousse » (aux cheveux roux) se dit [ʁus].',
      '[ʁys]: a woman from Russia. « La rousse » (the red-haired woman) is [ʁus].',
    ]),
    pick('C’est doux.', ['C’est doux.', 'C’est dû.'], 0, 'C’est {doux}.', [
      '[du] : doux, agréable au toucher. « C’est dû » (il faut le payer) se dit [dy].',
      '[du]: soft, gentle. « C’est dû » (it is owed) is [dy].',
    ]),
    fill('Le chat dort sous la table.', 'Le chat dort ___ la table.', 'sous', 'Le chat dort {sous} la table.', [
      '[su] : sous. La paire sur / sous est la plus utile à bien entendre.',
      '[su]: under. The pair sur / sous is the most useful one to hear well.',
    ]),
    fill('Le livre est sur l’étagère.', 'Le livre est ___ l’étagère.', 'sur', 'Le livre est {sur} l’étagère.', [
      '[syʁ] : sur, posé dessus.',
      '[syʁ]: on, resting on top.',
    ]),
    fill('Nous avons vu un très beau film.', 'Nous avons ___ un très beau film.', 'vu', 'Nous avons {vu} un très beau film.', [
      '[vy] : « vu », le participe de voir. « Vous » se dit [vu].',
      '[vy]: « vu », the participle of voir. « Vous » is [vu].',
    ]),
    situation('Vos clés ? Je les ai posées sur la table, pas sous le canapé.', 'Où sont les clés ?', ['Sur la table', 'Sous la table', 'Sous le canapé'], 0,
      'Vos clés ? Je les ai posées {sur} la table, pas {sous} le canapé.', [
        '« Sur la table » [syʁ], puis « pas sous le canapé » [su] : les clés sont sur la table.',
        '« Sur la table » [syʁ], then « pas sous le canapé » [su]: the keys are on the table.',
      ]),
    situation('Pour aller à la gare, prenez la rue Pasteur, puis continuez tout droit jusqu’au pont.', 'Que faut-il faire après la rue Pasteur ?',
      ['Continuer tout droit jusqu’au pont', 'Passer sous le pont', 'Prendre une autre rue'], 0,
      'Pour aller à la gare, prenez la {rue} Pasteur, puis continuez {tout} droit jusqu’au pont.', [
        '« Tout droit » [tu] : continuer sans tourner, jusqu’au pont.',
        '« Tout droit » [tu]: go straight on, as far as the bridge.',
      ]),
  ],
  takeaway: [
    '[y] (u) : langue en avant, comme pour « i » ; [u] (ou) : langue en arrière. Sur / sous, rue / roue, sûr / sourd : un seul son change le mot.',
    '[y] (u): tongue forward, as for « i »; [u] (ou): tongue back. Sur / sous, rue / roue, sûr / sourd: one sound changes the word.',
  ],
});
