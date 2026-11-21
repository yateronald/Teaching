import type { CourseAbout, Doc } from '../../types';
import { b, card, dict, doc, gap, lesson, mc, P, pairs, say, sort, tip } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'A new library opens, a festival is coming, the snow is causing delays: short local news articles are the perfect bridge between practical texts and the press. This course teaches you how a news brief is built (headline, lead, details), how to answer the key questions (qui, quoi, où, quand, pourquoi), and the vocabulary of everyday news: weather, events, transport and the neighbourhood.',
    'Une nouvelle bibliothèque ouvre, un festival approche, la neige cause des retards : les brèves d’actualité locale sont le pont idéal entre les textes pratiques et la presse. Ce cours vous apprend comment une brève est construite (titre, chapeau, détails), comment répondre aux questions clés (qui, quoi, où, quand, pourquoi), et le vocabulaire de l’actualité du quotidien : météo, événements, transports et quartier.',
  ),
  outcomes: [
    b('Understand the structure of a news brief', 'Comprendre la structure d’une brève'),
    b('Answer qui, quoi, où, quand, pourquoi', 'Répondre à qui, quoi, où, quand, pourquoi'),
    b('Understand local news vocabulary', 'Comprendre le vocabulaire de l’actualité locale'),
    b('Summarise a short article in one sentence', 'Résumer une brève en une phrase'),
  ],
};

const LIBRARY: Doc = { look: 'article', title: b('Local news', 'Actualité locale'), text: 'Une nouvelle bibliothèque à Villeray\n\nLa nouvelle bibliothèque du quartier Villeray ouvrira ses portes le samedi 5 avril. Le bâtiment de trois étages propose 50 000 livres, un espace pour les enfants et une salle informatique. L’inscription est gratuite pour tous les résidents de Montréal. Une fête d’ouverture est prévue de 10 h à 16 h, avec des ateliers et des spectacles.' };
const SNOW: Doc = { look: 'article', title: b('Weather', 'Météo'), text: 'Tempête de neige : écoles fermées\n\nEn raison de la tempête qui a laissé plus de 30 centimètres de neige pendant la nuit, toutes les écoles de la région sont fermées aujourd’hui. Les autobus circulent avec d’importants retards. La Ville demande aux automobilistes d’éviter les déplacements inutiles et de ne pas stationner dans les rues pendant le déneigement.' };
const FESTIVAL: Doc = { look: 'article', title: b('Culture', 'Culture'), text: 'Le Festival des lumières revient\n\nPour sa dixième édition, le Festival des lumières illuminera le Vieux-Québec du 20 au 28 février. Plus de quarante installations lumineuses seront présentées gratuitement, chaque soir de 18 h à 23 h. Les organisateurs attendent 200 000 visiteurs. Nouveauté cette année : une patinoire géante sur la place principale.' };

const C = 'r-short-articles';
export default [
  lesson(C, 1, ['how-a-news-brief-works', 'comment-fonctionne-une-breve'],
    b('How a news brief works', 'Comment fonctionne une brève'),
    b('Use the headline and the first sentence to understand the essentials.', 'Utiliser le titre et la première phrase pour comprendre l’essentiel.'),
    [b('Read the headline and the lead', 'Lire le titre et le chapeau'), b('Answer the 5 key questions', 'Répondre aux 5 questions clés'), b('Understand the future in news', 'Comprendre le futur dans l’actualité')],
    13,
    [
      card(b('Headline, lead, details', 'Titre, chapeau, détails'), b('A news brief starts with a **headline** (often without a verb), then a **first sentence** that answers **qui, quoi, où, quand**. The details come after. Read the start carefully: it contains 80% of the information.', 'Une brève commence par un **titre** (souvent sans verbe), puis une **première phrase** qui répond à **qui, quoi, où, quand**. Les détails viennent ensuite. Lisez bien le début : il contient 80 % de l’information.')),
      doc(LIBRARY, b('What is the article about?', 'De quoi parle l’article ?'), [b('A new library opening', 'L’ouverture d’une nouvelle bibliothèque'), b('A school closing', 'La fermeture d’une école'), b('A book festival in Paris', 'Un festival du livre à Paris'), b('A new computer shop', 'Un nouveau magasin d’informatique')]),
      doc(LIBRARY, b('Who can register for free?', 'Qui peut s’inscrire gratuitement ?'), [b('All Montréal residents', 'Tous les résidents de Montréal'), b('Only children', 'Seulement les enfants'), b('Only Villeray residents', 'Seulement les résidents de Villeray'), b('Nobody', 'Personne')]),
      doc(LIBRARY, b('What happens on 5 April?', 'Que se passe-t-il le 5 avril ?'), [b('An opening party with workshops and shows', 'Une fête d’ouverture avec ateliers et spectacles'), b('The library closes', 'La bibliothèque ferme'), b('A computer class', 'Un cours d’informatique'), b('The construction starts', 'Les travaux commencent')]),
      pairs(P.match, [['ouvrir ses portes', b('to open (for the first time)', 'être inauguré')], ['un atelier', b('a workshop', 'activité pratique')], ['l’inscription', b('registration', 'fait de s’inscrire')], ['un spectacle', b('a show', 'représentation')]]),
      gap(P.complete, 'La bibliothèque ___ ses portes le 5 avril et l’___ sera gratuite.', ['ouvrira', 'inscription']),
      say('La nouvelle bibliothèque ouvrira ses portes samedi et l’inscription est gratuite.', 'The new library opens on Saturday and registration is free.'),
    ],
    [
      b('Headline + first sentence = the essentials (qui, quoi, où, quand).', 'Titre + première phrase = l’essentiel (qui, quoi, où, quand).'),
      b('News announces with the future: ouvrira, sera.', 'L’actualité annonce au futur : ouvrira, sera.'),
      b('ouvrir ses portes = to open (new place).', 'ouvrir ses portes = être inauguré.'),
    ],
    [['un bâtiment', b('a building', 'construction')], ['un résident', b('a resident', 'habitant')], ['gratuit', b('free (of charge)', 'sans payer')]],
  ),
  lesson(C, 2, ['weather-and-transport-news', 'meteo-et-transports'],
    b('Weather and transport news', 'Actualité météo et transports'),
    b('Understand causes, consequences and instructions in a weather alert.', 'Comprendre les causes, les conséquences et les consignes d’une alerte météo.'),
    [b('Find the cause and the consequences', 'Trouver la cause et les conséquences'), b('Understand official recommendations', 'Comprendre les recommandations officielles'), b('Learn winter vocabulary', 'Apprendre le vocabulaire de l’hiver')],
    13,
    [
      tip(b('Cause → consequence', 'Cause → conséquence'), b('Weather news often follows a chain: **en raison de** (cause) → what is closed or delayed (consequences) → what the authorities **ask** you to do (instructions).', 'L’actualité météo suit souvent une chaîne : **en raison de** (cause) → ce qui est fermé ou retardé (conséquences) → ce que les autorités **demandent** (consignes).')),
      doc(SNOW, b('Why are the schools closed?', 'Pourquoi les écoles sont-elles fermées ?'), [b('Because of a snowstorm', 'À cause d’une tempête de neige'), b('Because of a strike', 'À cause d’une grève'), b('Because of a holiday', 'À cause d’un congé'), b('Because of a power cut', 'À cause d’une panne de courant')]),
      doc(SNOW, b('What does the City ask drivers?', 'Que demande la Ville aux automobilistes ?'), [b('Avoid unnecessary trips and not park in the streets', 'Éviter les déplacements inutiles et ne pas stationner dans les rues'), b('Take the bus', 'Prendre l’autobus'), b('Drive faster', 'Rouler plus vite'), b('Stay at work', 'Rester au travail')]),
      doc(SNOW, b('What about the buses?', 'Et les autobus ?'), [b('They are running with long delays.', 'Ils circulent avec de longs retards.'), b('They are free.', 'Ils sont gratuits.'), b('They are cancelled.', 'Ils sont annulés.'), b('They are on time.', 'Ils sont à l’heure.')]),
      pairs(P.match, [['une tempête', b('a storm', 'mauvais temps violent')], ['le déneigement', b('snow removal', 'enlèvement de la neige')], ['un automobiliste', b('a driver', 'personne qui conduit')], ['un déplacement', b('a trip, a journey', 'fait de se déplacer')]]),
      sort(b('Cause or consequence?', 'Cause ou conséquence ?'), [b('cause', 'cause'), b('consequence', 'conséquence')], [['30 cm de neige', 0], ['écoles fermées', 1], ['la tempête', 0], ['retards des autobus', 1], ['le verglas', 0], ['routes fermées', 1]]),
      dict('En raison de la tempête, toutes les écoles sont fermées aujourd’hui.', { voice: 'f' }),
    ],
    [
      b('Chain: en raison de (cause) → closures, delays → instructions.', 'Chaîne : en raison de (cause) → fermetures, retards → consignes.'),
      b('Winter: tempête, déneigement, verglas, chasse-neige.', 'Hiver : tempête, déneigement, verglas, chasse-neige.'),
      b('La Ville demande de… = the City asks you to…', 'La Ville demande de… = consigne officielle.'),
    ],
    [['le verglas', b('black ice', 'glace sur la route')], ['circuler', b('to run, to move (traffic)', 'rouler')], ['éviter', b('to avoid', 'ne pas faire')]],
  ),
  lesson(C, 3, ['culture-news-and-summary', 'actualite-culturelle-et-resume'],
    b('Culture news and summarising', 'Actualité culturelle et résumé'),
    b('Understand an event announcement and summarise it in one sentence.', 'Comprendre l’annonce d’un événement et la résumer en une phrase.'),
    [b('Find dates, prices and novelties', 'Trouver dates, prix et nouveautés'), b('Understand numbers in articles', 'Comprendre les nombres dans les articles'), b('Summarise an article', 'Résumer un article')],
    13,
    [
      doc(FESTIVAL, b('How much does it cost to see the installations?', 'Combien coûte la visite des installations ?'), [b('Nothing, it is free', 'Rien, c’est gratuit'), b('10 dollars', '10 dollars'), b('It depends on the day', 'Cela dépend du jour'), b('20 dollars for children', '20 dollars pour les enfants')]),
      doc(FESTIVAL, b('What is new this year?', 'Quelle est la nouveauté cette année ?'), [b('A giant skating rink', 'Une patinoire géante'), b('Forty installations', 'Quarante installations'), b('Night concerts', 'Des concerts de nuit'), b('A tenth edition', 'Une dixième édition')]),
      doc(FESTIVAL, b('How many visitors are expected?', 'Combien de visiteurs attend-on ?'), ['200 000', '40', '10 000', '28']),
      card(b('Summarise in one sentence', 'Résumer en une phrase'), b('A good summary answers **quoi + où + quand** (+ one key detail): **Le Festival des lumières illuminera gratuitement le Vieux-Québec du 20 au 28 février.**', 'Un bon résumé répond à **quoi + où + quand** (+ un détail clé) : **Le Festival des lumières illuminera gratuitement le Vieux-Québec du 20 au 28 février.**')),
      mc(b('Which sentence is the best summary?', 'Quelle phrase résume le mieux l’article ?'), [b('A free light festival takes place in Old Québec from 20 to 28 February.', 'Un festival des lumières gratuit a lieu dans le Vieux-Québec du 20 au 28 février.'), b('There will be a skating rink.', 'Il y aura une patinoire.'), b('The organisers are happy.', 'Les organisateurs sont contents.'), b('Québec is a beautiful city.', 'Québec est une belle ville.')]),
      pairs(P.match, [['une édition', b('an edition (of an event)', 'chaque année d’un festival')], ['une patinoire', b('a skating rink', 'surface de glace pour patiner')], ['illuminer', b('to light up', 'éclairer')], ['une nouveauté', b('something new', 'ce qui est nouveau')]]),
      gap(P.complete, 'Le festival aura ___ du 20 au 28 février et l’entrée sera ___.', ['lieu', 'gratuite']),
      say('Le Festival des lumières illuminera le Vieux-Québec du vingt au vingt-huit février.', 'The Festival of Lights will light up Old Québec from 20 to 28 February.'),
    ],
    [
      b('Summary = quoi + où + quand (+ one key detail).', 'Résumé = quoi + où + quand (+ un détail clé).'),
      b('avoir lieu = to take place.', 'avoir lieu = se dérouler.'),
      b('Numbers: 200 000 (space for thousands), 10e édition.', 'Nombres : 200 000 (espace pour les milliers), 10e édition.'),
    ],
    [['avoir lieu', b('to take place', 'se dérouler')], ['un visiteur', b('a visitor', 'personne qui visite')], ['les organisateurs', b('the organisers', 'personnes qui organisent')]],
  ),
];
