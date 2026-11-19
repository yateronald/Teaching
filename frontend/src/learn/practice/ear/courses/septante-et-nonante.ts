// C2 · French around the world: septante, nonante, le dîner, magasiner, courriel, une drache.
import { ear, ex, fill, pick, situation } from '../authoring';

const MATCH = 'Bon, je t’attends au souper vers dix-neuf heures, et après, on ira voir le match. Les places sont à septante francs, ce n’est pas donné.';
const MATCH_SHOW = 'Bon, je t’attends au {souper} vers dix-neuf heures, et après, on ira voir le match. Les places sont à {septante} francs, ce n’est pas donné.';

export default ear('septante-et-nonante', {
  rule: [
    ['Le français d’ailleurs', 'French from elsewhere'],
    [
      'Le français se parle sur plusieurs continents, avec des mots différents.\n\n**Belgique et Suisse** : __septante__ (70), __nonante__ (90), et en Suisse romande souvent __huitante__ (80). Les repas : __le déjeuner__ (le matin), __le dîner__ (à midi), __le souper__ (le soir). En Belgique, __savoir__ peut vouloir dire « pouvoir » (__je ne sais pas venir__ = je ne peux pas venir) et __une drache__ est une grosse averse.\n\n**Québec** : __un courriel__ (un e-mail), __magasiner__ (faire du shopping), __la fin de semaine__ (le week-end), __le déjeuner__ (le petit-déjeuner), __un char__ (une voiture).',
      'French is spoken on several continents, with different words.\n\n**Belgium and Switzerland**: __septante__ (70), __nonante__ (90), and in French-speaking Switzerland often __huitante__ (80). Meals: __le déjeuner__ (morning), __le dîner__ (midday), __le souper__ (evening). In Belgium, __savoir__ can mean « to be able » (__je ne sais pas venir__ = I can’t come) and __une drache__ is a downpour.\n\n**Quebec**: __un courriel__ (an e-mail), __magasiner__ (to go shopping), __la fin de semaine__ (the weekend), __le déjeuner__ (breakfast), __un char__ (a car).',
    ],
  ],
  goal: ['Comprendre les mots de Belgique, de Suisse et du Québec.', 'Understand words from Belgium, Switzerland and Quebec.'],
  examples: [
    ex('Il a septante-deux ans.', 'Il a {septante-deux} ans.', ['= 72 ans.', '= 72.']),
    ex('On se voit au dîner, à midi.', 'On se voit au {dîner}, à midi.', ['En Belgique et en Suisse, le dîner est le repas de midi.', 'In Belgium and Switzerland, le dîner is lunch.']),
    ex('Je vais magasiner en fin de semaine.', 'Je vais {magasiner} en {fin de semaine}.', ['Québec : faire du shopping le week-end.', 'Quebec: shopping at the weekend.']),
  ],
  items: [
    pick('J’ai septante-cinq ans.', ['65 ans', '75 ans', '57 ans'], 1, 'J’ai {septante-cinq} ans.', [
      'Septante = soixante-dix.', 'Septante = 70.',
    ], ['Quel âge a la personne ?', 'How old is the speaker?']),
    pick('Ça coûte nonante euros.', ['90 €', '19 €', '80 €'], 0, 'Ça coûte {nonante} euros.', [
      'Nonante = quatre-vingt-dix.', 'Nonante = 90.',
    ], ['Combien ça coûte ?', 'How much is it?']),
    pick('On se voit pour le dîner, à midi ?', ['Le repas du soir', 'Le repas de midi'], 1, 'On se voit pour le {dîner}, à midi ?', [
      'Dîner = repas de midi ; souper = repas du soir.', 'Dîner = lunch; souper = dinner.',
    ], ['En Belgique ou en Suisse, le dîner, c’est…', 'In Belgium or Switzerland, le dîner is…']),
    pick('Je vais magasiner en fin de semaine.', ['Travailler en fin de semaine', 'Faire du shopping le week-end'], 1, 'Je vais {magasiner} en {fin de semaine}.', [
      'Magasiner = faire les magasins ; la fin de semaine = le week-end.', 'Shopping at the weekend.',
    ], ['Au Québec, que va faire la personne ?', 'In Quebec, what is the speaker going to do?']),
    pick('Je ne sais pas venir demain.', ['Je ne peux pas venir demain', 'Je ne sais pas si je viendrai'], 0, 'Je ne {sais} pas venir demain.', [
      'En Belgique, savoir = pouvoir, être en mesure de.', 'In Belgium, savoir = can.',
    ], ['En Belgique, cela veut dire…', 'In Belgium, this means…']),
    fill('Il y avait nonante personnes.', 'Il y avait ___ personnes.', ['nonante', '90'], 'Il y avait {nonante} personnes.', [
      'Nonante = 90.', 'Nonante = 90.',
    ]),
    fill('Envoie-moi un courriel.', 'Envoie-moi un ___.', 'courriel', 'Envoie-moi un {courriel}.', [
      'Courriel : le mot québécois, aussi recommandé en France.', 'Courriel: the Quebec word, also recommended in France.',
    ]),
    fill('Quelle drache ce matin !', 'Quelle ___ ce matin !', 'drache', 'Quelle {drache} ce matin !', [
      'Une drache : une grosse averse, en Belgique.', 'A downpour, in Belgium.',
    ]),
    situation(MATCH, 'À quel repas est-il invité ?', ['Au repas de midi', 'Au repas du soir', 'Au petit-déjeuner'], 1, MATCH_SHOW, [
      'Le souper, vers dix-neuf heures : le repas du soir.', 'Le souper: the evening meal.',
    ]),
    situation(MATCH, 'Combien coûtent les places ?', ['Soixante francs', 'Dix-sept francs', 'Soixante-dix francs'], 2, MATCH_SHOW, [
      'Septante = soixante-dix.', 'Septante = 70.',
    ]),
  ],
  takeaway: [
    'Belgique et Suisse : septante (70), nonante (90), huitante (80 en Suisse) ; déjeuner, dîner, souper. Québec : courriel, magasiner, fin de semaine. Le contexte dit d’où vient la personne.',
    'Belgium and Switzerland: septante (70), nonante (90), huitante (80 in Switzerland); déjeuner, dîner, souper. Quebec: courriel, magasiner, fin de semaine. Context tells you where the speaker is from.',
  ],
});
