// C1 · Official announcements: jusqu’à nouvel ordre, à compter du, sous réserve de.
import { ear, ex, fill, pick, situation } from '../authoring';

const GARE = 'Mesdames et messieurs, en raison d’un incident technique, le train à destination de Bordeaux est supprimé. Les voyageurs sont invités à emprunter le train de dix-huit heures, sous réserve de places disponibles.';
const GARE_SHOW = 'Mesdames et messieurs, {en raison d’}un incident technique, le train {à destination de} Bordeaux est {supprimé}. Les voyageurs sont invités à emprunter le train de dix-huit heures, {sous réserve de} places disponibles.';

export default ear('les-annonces-officielles', {
  rule: [
    ['Les mots clés des annonces', 'The key words of announcements'],
    [
      'Gares, mairies, administrations emploient des formules précises, qu’il faut comprendre du premier coup :\n\n__jusqu’à nouvel ordre__ (pour une durée inconnue), __à compter du__ (à partir du), __sous réserve de__ (à condition que, s’il y a), __à l’exception de__ ou __hormis__ (sauf), __en raison de__ (à cause de), __en provenance de__ (qui vient de) / __à destination de__ (qui va à), __maintenu__ (qui a bien lieu) / __supprimé__ (qui n’a pas lieu), __dans les meilleurs délais__ (le plus vite possible).',
      'Stations, town halls and administrations use precise formulas you must understand first time:\n\n__jusqu’à nouvel ordre__ (until further notice), __à compter du__ (from), __sous réserve de__ (subject to, if there are), __à l’exception de__ or __hormis__ (except), __en raison de__ (because of), __en provenance de__ (coming from) / __à destination de__ (going to), __maintenu__ (still going ahead) / __supprimé__ (cancelled), __dans les meilleurs délais__ (as soon as possible).',
    ],
  ],
  goal: ['Comprendre exactement ce qu’annonce un message officiel.', 'Understand exactly what an official message announces.'],
  examples: [
    ex('Le parc est fermé jusqu’à nouvel ordre.', 'Le parc est fermé {jusqu’à nouvel ordre}.', ['Pour une durée inconnue.', 'Until further notice.']),
    ex('À compter du premier mars, les horaires changent.', '{À compter du} premier mars, les horaires changent.', ['= À partir du 1er mars.', '= From 1 March.']),
    ex('Sous réserve de places disponibles.', '{Sous réserve de} places disponibles.', ['= S’il reste des places.', '= If places remain.']),
  ],
  items: [
    pick('Le pont est fermé jusqu’à nouvel ordre.', ['Jusqu’à demain', 'Pour une durée inconnue', 'Pour une heure'], 1, 'Le pont est fermé {jusqu’à nouvel ordre}.', [
      'Jusqu’à nouvel ordre = on ne sait pas quand il rouvrira.', 'Until further notice.',
    ], ['Pour combien de temps ?', 'For how long?']),
    pick('À compter du premier juin, la piscine ouvre à sept heures.', ['À partir du 1er juin', 'Jusqu’au 1er juin'], 0, '{À compter du} premier juin, la piscine ouvre à sept heures.', [
      'À compter du = à partir du.', 'À compter du = from.',
    ], ['Depuis quand ?', 'From when?']),
    pick('Tous les trains circulent, à l’exception du TER de huit heures.', ['Aucun', 'Tous', 'Celui de huit heures'], 2, 'Tous les trains circulent, {à l’exception du} TER de huit heures.', [
      'À l’exception de = sauf.', 'À l’exception de = except.',
    ], ['Quel train ne circule pas ?', 'Which train is not running?']),
    pick('Inscription gratuite, sous réserve de places disponibles.', ['Pour tout le monde, sans condition', 'S’il reste des places'], 1, 'Inscription gratuite, {sous réserve de} places disponibles.', [
      'Sous réserve de = à condition qu’il y ait.', 'Subject to availability.',
    ], ['À quelle condition ?', 'On what condition?']),
    pick('Le train en provenance de Lyon arrive voie trois.', ['Il vient de Lyon', 'Il va à Lyon'], 0, 'Le train {en provenance de} Lyon arrive voie trois.', [
      'En provenance de = qui vient de.', 'En provenance de = coming from.',
    ], ['D’où vient le train ?', 'Where does the train come from?']),
    fill('Le magasin est fermé en raison de travaux.', 'Le magasin est fermé en ___ de travaux.', 'raison', 'Le magasin est fermé en {raison} de travaux.', [
      'En raison de = à cause de.', 'Because of.',
    ]),
    fill('Merci de répondre dans les meilleurs délais.', 'Merci de répondre dans les meilleurs ___.', 'délais', 'Merci de répondre dans les meilleurs {délais}.', [
      'Dans les meilleurs délais = le plus vite possible.', 'As soon as possible.',
    ]),
    fill('Le marché est maintenu malgré la pluie.', 'Le marché est ___ malgré la pluie.', 'maintenu', 'Le marché est {maintenu} malgré la pluie.', [
      'Maintenu = il a bien lieu.', 'Maintenu = it still goes ahead.',
    ]),
    situation(GARE, 'Pourquoi le train est-il supprimé ?', ['Une grève', 'Un incident technique', 'La météo'], 1, GARE_SHOW, [
      '« En raison d’un incident technique ».', '« Because of a technical incident ».',
    ]),
    situation(GARE, 'Que peuvent faire les voyageurs ?', ['Prendre le train de 18 h, place garantie', 'Seulement se faire rembourser', 'Prendre le train de 18 h, s’il reste des places'], 2, GARE_SHOW, [
      '« Sous réserve de places disponibles » : ce n’est pas garanti.', '« Subject to availability »: not guaranteed.',
    ]),
  ],
  takeaway: [
    'Jusqu’à nouvel ordre (durée inconnue), à compter du (à partir du), sous réserve de (à condition), à l’exception de (sauf), en provenance de / à destination de, maintenu / supprimé.',
    'Jusqu’à nouvel ordre (until further notice), à compter du (from), sous réserve de (subject to), à l’exception de (except), en provenance de / à destination de, maintenu / supprimé.',
  ],
});
