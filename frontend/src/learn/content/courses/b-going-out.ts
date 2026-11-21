import type { CourseAbout } from '../../types';
import { b, card, dict, dlg, doc, gap, hear, lesson, mc, ord, P, pairs, say, sort, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'A film tonight? A concert on Saturday? A museum on Sunday? This beginner course gives you the language to choose an outing, read a programme, buy tickets at the counter or online, and say what you thought of it afterwards (c’était super, j’ai adoré, bof). Short dialogues and real-life documents: cinema times, concert posters, museum opening hours.',
    'Un film ce soir ? Un concert samedi ? Un musée dimanche ? Ce cours pour débutants vous donne la langue pour choisir une sortie, lire un programme, acheter des billets au guichet ou en ligne, et dire ensuite ce que vous en avez pensé (c’était super, j’ai adoré, bof). Courts dialogues et documents authentiques : séances de cinéma, affiches de concert, horaires de musée.',
  ),
  outcomes: [
    b('Choose an outing together', 'Choisir une sortie ensemble'),
    b('Read times and prices', 'Lire les horaires et les prix'),
    b('Buy tickets', 'Acheter des billets'),
    b('Give a simple opinion', 'Donner une opinion simple'),
  ],
};

const C = 'b-going-out';
export default [
  lesson(C, 1, ['choosing-an-outing', 'choisir-une-sortie'],
    b('Choosing an outing', 'Choisir une sortie'),
    b('Suggest a film, a concert or a museum and agree on a time.', 'Proposer un film, un concert ou un musée et s’accorder sur l’heure.'),
    [b('Name types of outings and films', 'Nommer les sorties et les genres de films'), b('Suggest with on va… ?', 'Proposer avec on va… ?'), b('Agree on day and time', 'S’accorder sur le jour et l’heure')],
    13,
    [
      card(b('Going out', 'Sortir'), b('Outings: **aller au cinéma, à un concert, au théâtre, au musée, à une exposition, au restaurant**. Films: **une comédie, un film d’action, un dessin animé, un film d’horreur, un documentaire, une comédie romantique**. Suggest: **On va au cinéma ce soir ? · Ça te dit d’aller voir une expo ?** Agree: **D’accord, à quelle heure ? · On se retrouve devant le cinéma à 19 h 30.**', 'Sorties : **aller au cinéma, à un concert, au théâtre, au musée, à une exposition, au restaurant**. Films : **une comédie, un film d’action, un dessin animé, un film d’horreur, un documentaire, une comédie romantique**. Proposer : **On va au cinéma ce soir ? · Ça te dit d’aller voir une expo ?** S’accorder : **D’accord, à quelle heure ? · On se retrouve devant le cinéma à 19 h 30.**')),
      sort(b('Outing or film genre?', 'Sortie ou genre de film ?'), [b('outing', 'sortie'), b('film genre', 'genre de film')], [['un concert', 0], ['une comédie', 1], ['une exposition', 0], ['un dessin animé', 1], ['le théâtre', 0], ['un documentaire', 1]]),
      dlg(b('Friday evening', 'Vendredi soir'), undefined, [['Tom', 'm'], ['Vous', 'f']], [
        [0, 'On va au cinéma ce soir ?', 'Shall we go to the cinema tonight?'],
        [1, { options: ['Bonne idée ! Qu’est-ce qu’il y a comme film ?', 'Cinéma non.', 'Je suis cinéma.'] }],
        [0, 'Il y a une comédie québécoise à 19 h 30 ou un film d’action à 21 h.', 'There’s a Québec comedy at 7:30 or an action film at 9.'],
        [1, { options: ['Je préfère la comédie. On se retrouve devant le cinéma à 19 h 15 ?', 'Les deux, à minuit.', 'Je ne sais pas, peut-être demain, ou pas.'] }],
      ]),
      gap(P.complete, 'Ça te ___ d’aller voir une expo dimanche ? On se ___ devant le musée à 14 h.', ['dit', 'retrouve']),
      ord(P.order, 'On se retrouve devant le cinéma à huit heures ?', { tr: 'Shall we meet in front of the cinema at eight?' }),
      say('On va au concert samedi ? On se retrouve devant la salle à vingt heures.', 'Shall we go to the concert on Saturday? Let’s meet outside the venue at eight.'),
    ],
    [
      b('aller au cinéma / au musée / à un concert / à une expo.', 'aller au cinéma / au musée / à un concert / à une expo.'),
      b('On va… ? Ça te dit de… ?', 'On va… ? Ça te dit de… ?'),
      b('On se retrouve devant… à…', 'On se retrouve devant… à…'),
    ],
    [['une séance', b('a showing (cinema)', 'horaire d’un film')], ['une expo', b('an exhibition (informal)', 'exposition')], ['se retrouver', b('to meet up', 'se rejoindre')]],
  ),
  lesson(C, 2, ['tickets-and-times', 'billets-et-horaires'],
    b('Tickets and times', 'Billets et horaires'),
    b('Read a programme, understand prices and buy tickets.', 'Lire un programme, comprendre les prix et acheter des billets.'),
    [b('Read times and prices', 'Lire horaires et prix'), b('Ask for tickets and discounts', 'Demander des billets et des réductions'), b('Understand online booking words', 'Comprendre la réservation en ligne')],
    13,
    [
      card(b('At the ticket office', 'Au guichet'), b('**Deux places pour la séance de 20 h, s’il vous plaît. · C’est combien ? · Il y a un tarif réduit pour les étudiants ? · Il reste des places ? · C’est complet.** Online: **réserver, choisir sa place, payer, recevoir son billet par courriel, un billet électronique, en version originale (VO), sous-titré**.', '**Deux places pour la séance de 20 h, s’il vous plaît. · C’est combien ? · Il y a un tarif réduit pour les étudiants ? · Il reste des places ? · C’est complet.** En ligne : **réserver, choisir sa place, payer, recevoir son billet par courriel, un billet électronique, en version originale (VO), sous-titré**.')),
      doc({ look: 'notice', title: b('Museum information', 'Informations du musée'), text: 'MUSÉE DES BEAUX-ARTS\nOuvert du mardi au dimanche, de 10 h à 18 h\nNocturne le jeudi jusqu’à 21 h\nFermé le lundi\nTarif plein : 16 € — Tarif réduit (étudiants, 65 ans et plus) : 9 €\nGratuit pour les moins de 18 ans\nGratuit pour tous le premier dimanche du mois' }, b('When is the museum free for everyone?', 'Quand le musée est-il gratuit pour tous ?'), [b('the first Sunday of the month', 'le premier dimanche du mois'), b('every Monday', 'tous les lundis'), b('Thursday evening', 'le jeudi soir'), b('never', 'jamais')]),
      hear('Bonjour, deux places pour la séance de vingt heures quinze, s’il vous plaît. Une adulte et un étudiant.', b('Which showing?', 'Quelle séance ?'), [b('8:15 p.m.', '20 h 15'), b('8:50 p.m.', '20 h 50'), b('2:15 p.m.', '14 h 15'), b('10:15 p.m.', '22 h 15')], { voice: 'f' }),
      mc(P.best, ['Il y a un tarif réduit pour les étudiants ?', 'C’est moins cher pour moi ?', 'Réduction !', 'Je paie moins.'], { fr: 'Vous êtes étudiant et voulez payer moins :' }),
      pairs(P.match, [['complet', b('sold out', 'plus de place')], ['un tarif réduit', b('a reduced price', 'prix plus bas')], ['en VO', b('in the original language', 'version originale')], ['sous-titré', b('subtitled', 'avec texte en bas')]]),
      say('Bonjour, deux places pour la séance de vingt heures, s’il vous plaît. Il y a un tarif étudiant ?', 'Hello, two tickets for the 8 p.m. showing, please. Is there a student price?'),
    ],
    [
      b('Deux places pour la séance de… · C’est combien ?', 'Deux places pour la séance de… · C’est combien ?'),
      b('tarif plein / réduit, gratuit, complet.', 'tarif plein / réduit, gratuit, complet.'),
      b('VO, sous-titré, billet électronique.', 'VO, sous-titré, billet électronique.'),
    ],
    [['une nocturne', b('a late opening', 'ouverture le soir')], ['le guichet', b('the ticket office', 'où l’on achète les billets')], ['gratuit', b('free (of charge)', 'sans payer')]],
  ),
  lesson(C, 3, ['what-did-you-think', 'c-etait-comment'],
    b('What did you think?', 'C’était comment ?'),
    b('Give a simple opinion on a film, a concert or an exhibition.', 'Donner une opinion simple sur un film, un concert ou une exposition.'),
    [b('Say c’était + adjective', 'Dire c’était + adjectif'), b('Say what you liked', 'Dire ce qu’on a aimé'), b('Recommend or not', 'Recommander ou non')],
    13,
    [
      card(b('Opinions', 'Les opinions'), b('**C’était super / génial / magnifique / drôle / émouvant / ennuyeux / trop long / bof.** **J’ai adoré la musique. · Je n’ai pas aimé la fin. · Les acteurs sont excellents.** Recommend: **Je te le conseille ! · Va le voir ! · Ce n’est pas la peine.**', '**C’était super / génial / magnifique / drôle / émouvant / ennuyeux / trop long / bof.** **J’ai adoré la musique. · Je n’ai pas aimé la fin. · Les acteurs sont excellents.** Recommander : **Je te le conseille ! · Va le voir ! · Ce n’est pas la peine.**')),
      sort(b('Positive or negative?', 'Positif ou négatif ?'), [b('positive', 'positif'), b('negative', 'négatif')], [['C’était génial !', 0], ['C’était ennuyeux.', 1], ['J’ai adoré la musique.', 0], ['C’était trop long.', 1], ['Je te le conseille !', 0], ['Ce n’est pas la peine.', 1]]),
      hear('Alors, le concert ? C’était génial ! La chanteuse a une voix magnifique. Par contre, la salle était trop petite et il faisait très chaud.', b('What was negative?', 'Qu’est-ce qui était négatif ?'), [b('the room was too small and hot', 'la salle était trop petite et il faisait chaud'), b('the singer’s voice', 'la voix de la chanteuse'), b('the music', 'la musique'), b('nothing', 'rien')], { voice: 'm' }),
      mc(P.best, ['C’était drôle, et les acteurs sont excellents. Je te le conseille !', 'Film.', 'C’est un film, voilà.', 'Je ne sais pas.'], { fr: '— Alors, ce film, c’était comment ?' }),
      dict('C’était génial, j’ai adoré la musique, mais la fin était un peu triste.', {}),
      write(b('Your review', 'Votre avis'), b('Write a short review (25–45 words) of a film, concert or exhibition you saw: what it was, what you liked or didn’t like, would you recommend it?', 'Écrivez un court avis (25–45 mots) sur un film, un concert ou une exposition : ce que c’était, ce que vous avez aimé ou non, le recommandez-vous ?'), 25, 45, [
        b('C’était + adjective', 'C’était + adjectif'),
        b('One thing you liked, one you didn’t', 'Une chose aimée, une chose moins aimée'),
        b('A recommendation', 'Une recommandation'),
      ], 'Samedi, j’ai vu une comédie québécoise au cinéma. C’était très drôle et les acteurs sont excellents. Par contre, la fin était un peu longue. Je vous la conseille pour une soirée entre amis !'),
    ],
    [
      b('C’était super / drôle / émouvant / ennuyeux / bof.', 'C’était super / drôle / émouvant / ennuyeux / bof.'),
      b('J’ai adoré… / Je n’ai pas aimé…', 'J’ai adoré… / Je n’ai pas aimé…'),
      b('Je te le conseille ! / Ce n’est pas la peine.', 'Je te le conseille ! / Ce n’est pas la peine.'),
    ],
    [['émouvant', b('moving', 'qui donne de l’émotion')], ['une salle', b('a hall, a venue', 'lieu du spectacle')], ['par contre', b('on the other hand', 'mais')]],
  ),
];
