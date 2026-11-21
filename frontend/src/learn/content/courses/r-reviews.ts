import type { CourseAbout, Doc } from '../../types';
import { b, card, doc, gap, lesson, mc, P, pairs, say, sort, tip, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Should you see this film, read this novel, try this restaurant? Reviews combine description, evaluation and recommendation, with a rich vocabulary of praise and criticism. This course trains you to read film, book and restaurant reviews, to measure the strength of an opinion (correct, réussi, inoubliable), to detect a mixed review and to write a short review of your own.',
    'Faut-il voir ce film, lire ce roman, essayer ce restaurant ? Les critiques combinent description, évaluation et recommandation, avec un riche vocabulaire de l’éloge et de la critique. Ce cours vous entraîne à lire des critiques de films, de livres et de restaurants, à mesurer la force d’une opinion (correct, réussi, inoubliable), à repérer une critique mitigée et à rédiger votre propre critique courte.',
  ),
  outcomes: [
    b('Understand film, book and restaurant reviews', 'Comprendre des critiques de films, de livres et de restaurants'),
    b('Measure the strength of a judgment', 'Mesurer la force d’un jugement'),
    b('Recognise a mixed review', 'Reconnaître une critique mitigée'),
    b('Write a short review', 'Rédiger une courte critique'),
  ],
};

const FILM: Doc = { look: 'article', title: b('Film review', 'Critique de film'), text: 'L’Hiver de Léon – ★★★★☆\n\nDans ce deuxième long métrage, la réalisatrice suit Léon, un vieil agriculteur de la Beauce qui refuse de vendre sa ferme. Porté par un acteur bouleversant, le film évite les clichés et nous offre des images d’hiver d’une beauté saisissante. On regrettera seulement une dernière demi-heure un peu longue. Un film sensible et juste, à voir absolument.' };
const BOOK: Doc = { look: 'article', title: b('Book review', 'Critique de livre'), text: 'La Maison des oubliés – ★★☆☆☆\n\nLe point de départ était prometteur : une famille découvre, en rénovant sa maison, des lettres cachées depuis un siècle. Malheureusement, l’intrigue s’essouffle rapidement et les personnages manquent de profondeur. Le style, souvent lourd, n’aide pas. Restent quelques belles pages sur la mémoire. Une déception, compte tenu du talent de l’autrice.' };
const RESTO: Doc = { look: 'article', title: b('Restaurant review', 'Critique de restaurant'), text: 'Chez Margot – Cuisine du marché\n\nAmbiance : chaleureuse, un peu bruyante le samedi.\nService : attentionné et rapide.\nAssiettes : des produits frais et locaux, joliment présentés. Le canard à l’érable est une réussite ; le dessert au chocolat, en revanche, nous a laissés sur notre faim.\nPrix : environ 45 $ par personne, sans le vin.\nNotre avis : une bonne adresse pour un souper entre amis. Réservation conseillée.' };

const C = 'r-reviews';
export default [
  lesson(C, 1, ['film-reviews', 'critiques-de-films'],
    b('Film reviews', 'Les critiques de films'),
    b('Separate the summary from the judgment and understand the recommendation.', 'Distinguer le résumé du jugement et comprendre la recommandation.'),
    [b('Find the summary and the judgment', 'Trouver le résumé et le jugement'), b('Understand praise vocabulary', 'Comprendre le vocabulaire de l’éloge'), b('Understand the reservation', 'Comprendre la réserve')],
    13,
    [
      card(b('Three parts', 'Trois parties'), b('A review usually has: a **summary** (what it is about), a **judgment** (strengths, weaknesses) and a **recommendation** (à voir absolument, à éviter, pour les amateurs du genre).', 'Une critique comporte en général : un **résumé**, un **jugement** (qualités, défauts) et une **recommandation** (à voir absolument, à éviter, pour les amateurs du genre).')),
      doc(FILM, b('What is the film about?', 'De quoi parle le film ?'), [b('An old farmer who refuses to sell his farm', 'Un vieil agriculteur qui refuse de vendre sa ferme'), b('A young director in Montréal', 'Une jeune réalisatrice à Montréal'), b('A family on holiday', 'Une famille en vacances'), b('A ski champion', 'Un champion de ski')]),
      doc(FILM, b('What is the only weakness?', 'Quel est le seul défaut ?'), [b('The last half hour is a bit long.', 'La dernière demi-heure est un peu longue.'), b('The actor is bad.', 'L’acteur est mauvais.'), b('The images are ugly.', 'Les images sont laides.'), b('It is full of clichés.', 'Il est plein de clichés.')]),
      doc(FILM, b('Does the critic recommend the film?', 'Le critique recommande-t-il le film ?'), [b('Yes, strongly', 'Oui, fortement'), b('No', 'Non'), b('Only for children', 'Seulement pour les enfants'), b('Only on TV', 'Seulement à la télévision')]),
      pairs(P.match, [['bouleversant', b('deeply moving', 'très émouvant')], ['saisissant', b('striking', 'frappant')], ['un long métrage', b('a feature film', 'film de cinéma')], ['à voir absolument', b('a must-see', 'à ne pas manquer')]]),
      sort(b('Positive or negative?', 'Positif ou négatif ?'), [b('positive', 'positif'), b('negative', 'négatif')], [['bouleversant', 0], ['ennuyeux', 1], ['réussi', 0], ['raté', 1], ['saisissant', 0], ['décevant', 1]]),
      say('C’est un film sensible et juste, à voir absolument !', 'It’s a sensitive, truthful film, a must-see!'),
    ],
    [
      b('Review = summary + judgment + recommendation.', 'Critique = résumé + jugement + recommandation.'),
      b('Praise: bouleversant, saisissant, réussi, juste, inoubliable.', 'Éloge : bouleversant, saisissant, réussi, juste, inoubliable.'),
      b('Reservation: On regrettera seulement…', 'Réserve : On regrettera seulement…'),
    ],
    [['un réalisateur, une réalisatrice', b('a film director', 'personne qui réalise un film')], ['un cliché', b('a cliché', 'idée banale')], ['un agriculteur', b('a farmer', 'personne qui cultive la terre')]],
  ),
  lesson(C, 2, ['book-reviews', 'critiques-de-livres'],
    b('A negative book review', 'Une critique de livre négative'),
    b('Understand criticism, its nuances and what is still praised.', 'Comprendre la critique, ses nuances et ce qui est tout de même salué.'),
    [b('Understand criticism vocabulary', 'Comprendre le vocabulaire de la critique'), b('Find the positive points in a negative review', 'Trouver les points positifs d’une critique négative'), b('Understand malheureusement, restent, compte tenu de', 'Comprendre malheureusement, restent, compte tenu de')],
    13,
    [
      tip(b('Criticism is often softened', 'La critique est souvent atténuée'), b('Critics often soften a negative judgment: **malheureusement, un peu, manque de, restent quelques belles pages**. Look for **restent / sauvent / seul point positif** to find what is still good.', 'Les critiques atténuent souvent un jugement négatif : **malheureusement, un peu, manque de, restent quelques belles pages**. Cherchez **restent / sauvent / seul point positif** pour trouver ce qui reste bon.')),
      doc(BOOK, b('What was promising?', 'Qu’est-ce qui était prometteur ?'), [b('The starting point: hidden letters found in a house', 'Le point de départ : des lettres cachées trouvées dans une maison'), b('The characters', 'Les personnages'), b('The style', 'Le style'), b('The ending', 'La fin')]),
      doc(BOOK, b('What is criticised?', 'Qu’est-ce qui est critiqué ?'), [b('The plot runs out of steam and the characters lack depth.', 'L’intrigue s’essouffle et les personnages manquent de profondeur.'), b('The book is too short.', 'Le livre est trop court.'), b('The author has no talent.', 'L’autrice n’a pas de talent.'), b('The letters are boring.', 'Les lettres sont ennuyeuses.')]),
      doc(BOOK, b('Why is it « a disappointment »?', 'Pourquoi est-ce « une déception » ?'), [b('Because the author is talented, so more was expected', 'Parce que l’autrice a du talent : on attendait plus'), b('Because it is expensive', 'Parce qu’il est cher'), b('Because it is her first book', 'Parce que c’est son premier livre'), b('Because there is no plot', 'Parce qu’il n’y a pas d’intrigue')]),
      pairs(P.match, [['s’essouffler', b('to run out of steam', 'perdre son énergie')], ['l’intrigue', b('the plot', 'l’histoire')], ['prometteur', b('promising', 'qui annonce du bon')], ['une déception', b('a disappointment', 'ce qui déçoit')]]),
      gap(P.complete, 'Le début est ___, mais l’intrigue s’___ vite et les personnages ___ de profondeur.', ['prometteur', 'essouffle', 'manquent']),
      mc(P.meaning, [b('given, taking into account', 'en considérant'), b('despite', 'malgré'), b('because of the price', 'à cause du prix'), b('against', 'contre')], { fr: 'compte tenu du talent de l’autrice' }),
    ],
    [
      b('Criticism: s’essouffler, manquer de, lourd, décevant, une déception.', 'Critique : s’essouffler, manquer de, lourd, décevant, une déception.'),
      b('Softening: malheureusement, un peu, restent quelques…', 'Atténuation : malheureusement, un peu, restent quelques…'),
      b('compte tenu de = given, considering.', 'compte tenu de = en considérant.'),
    ],
    [['la profondeur', b('depth', 'complexité')], ['lourd', b('heavy, clumsy (style)', 'peu fluide')], ['rénover', b('to renovate', 'remettre à neuf')]],
  ),
  lesson(C, 3, ['restaurant-reviews', 'critiques-de-restaurants'],
    b('Restaurant reviews and writing your own', 'Critiques de restaurants et rédiger la vôtre'),
    b('Read a mixed review by criteria and write a short review.', 'Lire une critique mitigée critère par critère et rédiger une courte critique.'),
    [b('Read a review by criteria', 'Lire une critique par critères'), b('Spot en revanche and idioms', 'Repérer en revanche et les expressions'), b('Write a short review', 'Rédiger une courte critique')],
    13,
    [
      doc(RESTO, b('Which dish is a success?', 'Quel plat est une réussite ?'), [b('The duck with maple', 'Le canard à l’érable'), b('The chocolate dessert', 'Le dessert au chocolat'), b('The wine', 'Le vin'), b('The salad', 'La salade')]),
      doc(RESTO, b('What does « nous a laissés sur notre faim » mean here?', 'Que signifie ici « nous a laissés sur notre faim » ?'), [b('It was disappointing.', 'Il était décevant.'), b('The portion was huge.', 'La portion était énorme.'), b('It was delicious.', 'Il était délicieux.'), b('It was free.', 'Il était gratuit.')]),
      doc(RESTO, b('What does the critic advise?', 'Que conseille le critique ?'), [b('To book', 'De réserver'), b('To go on Saturday', 'D’y aller le samedi'), b('To avoid the duck', 'D’éviter le canard'), b('To bring your own wine', 'D’apporter son vin')]),
      sort(b('Strength or weakness of Chez Margot?', 'Point fort ou point faible de Chez Margot ?'), [b('strength', 'point fort'), b('weakness', 'point faible')], [['le service attentionné', 0], ['le bruit le samedi', 1], ['les produits frais', 0], ['le dessert au chocolat', 1], ['le canard à l’érable', 0]]),
      card(b('Review phrases', 'Formules de critique'), b('**une bonne adresse, une réussite, valoir le détour** (worth the trip), **laisser sur sa faim** (to disappoint), **un bon rapport qualité-prix** (good value), **à éviter**, **réservation conseillée**.', '**une bonne adresse, une réussite, valoir le détour**, **laisser sur sa faim**, **un bon rapport qualité-prix**, **à éviter**, **réservation conseillée**.')),
      write(b('Write a short review.', 'Rédigez une courte critique.'), b('Write a review of a restaurant, a film or a book you know: summary or description, two strengths, one weakness, a recommendation.', 'Rédigez la critique d’un restaurant, d’un film ou d’un livre que vous connaissez : résumé ou description, deux points forts, un point faible, une recommandation.'), 60, 110,
        [b('A short description or summary', 'Une courte description ou un résumé'), b('Two strengths with precise adjectives', 'Deux points forts avec des adjectifs précis'), b('One weakness (en revanche, malheureusement)', 'Un point faible (en revanche, malheureusement)'), b('A recommendation', 'Une recommandation')],
        'Le Petit Bistro, dans le quartier Saint-Roch, propose une cuisine française simple et généreuse. Le service est souriant et les plats, préparés avec des produits locaux, sont délicieux : la soupe à l’oignon vaut à elle seule le détour. En revanche, la salle est petite et l’attente peut être longue le week-end. Avec un excellent rapport qualité-prix, c’est une adresse que je recommande, à condition de réserver.',
        { phrases: ['propose…', 'vaut le détour', 'En revanche…', 'un bon rapport qualité-prix', 'Je recommande…', 'à condition de réserver'] }),
      say('C’est une bonne adresse, avec un excellent rapport qualité-prix.', 'It’s a good spot, with excellent value for money.'),
    ],
    [
      b('Read by criteria: ambiance, service, food, price, opinion.', 'Lisez par critères : ambiance, service, plats, prix, avis.'),
      b('laisser sur sa faim = to disappoint; valoir le détour = worth the trip.', 'laisser sur sa faim = décevoir ; valoir le détour = mériter le déplacement.'),
      b('un bon rapport qualité-prix = good value for money.', 'un bon rapport qualité-prix = bon équilibre prix / qualité.'),
    ],
    [['attentionné', b('attentive', 'plein d’attention')], ['le souper', b('dinner (Québec)', 'repas du soir')], ['une adresse', b('a place (restaurant, shop)', 'un établissement')]],
  ),
];
