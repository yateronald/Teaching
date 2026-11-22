import type { CourseAbout } from '../../types';
import { b, card, culture, dict, dlg, doc, flash, gap, hear, lesson, mc, ord, P, pairs, say, sort, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Talking about a film you saw last night, a novel you could not put down or an album on repeat is one of the richest ways to connect in French. This B1 conversation course helps you pitch a plot without giving away the ending (sans divulgâcher), express nuanced praise and reservations about pacing, acting or writing style, and tailor sharp recommendations to your friends’ tastes.',
    'Parler d’un film vu la veille, d’un roman impossible à lâcher ou d’un album qui tourne en boucle est l’un des meilleurs moyens d’échanger en français. Ce cours de conversation B1 vous apprend à résumer une intrigue sans révéler la fin (sans divulgâcher), à formuler éloges et réserves nuancées sur le rythme, le jeu d’acteurs ou le style, et à recommander avec justesse selon les goûts de chacun.',
  ),
  outcomes: [
    b('Summarise a story or film without spoilers', 'Résumer une histoire ou un film sans divulgâcher'),
    b('Express nuanced praise and constructive criticism', 'Formuler éloges et critiques nuancées'),
    b('Discuss acting, pacing, writing and music', 'Commenter jeu d’acteurs, rythme, style et musique'),
    b('Tailor cultural recommendations to a friend', 'Recommander une œuvre selon les goûts de son ami'),
  ],
};

const C = 'c-talking-culture';
export default [
  lesson(C, 1, ['summarising-without-spoilers', 'resumer-sans-divulgacher'],
    b('Summarising without spoilers', 'Résumer sans divulgâcher'),
    b('Present the genre, setting and premise of a film or book without giving away the ending.', 'Présenter le genre, le cadre et l’intrigue d’un film ou livre sans révéler la fin.'),
    [b('Set the genre, place and time', 'Situer le genre, le lieu et l’époque'), b('Pitch a plot with Ça raconte l’histoire de…', 'Présenter une intrigue sans tout dire'), b('Avoid spoilers naturally', 'Éviter de divulgâcher naturellement')],
    13,
    [
      card(b('Pitching an intrigue', 'Présenter une intrigue'), b('**C’est un roman policier / un drame familial / un album folk. · L’action se passe à Montréal dans les années 1990. · Ça raconte l’histoire d’une journaliste qui… · Sans rien dévoiler, disons que… · Ne me dis pas la fin !**', '**C’est un roman policier / un drame familial / un album folk. · L’action se passe à Montréal dans les années 1990. · Ça raconte l’histoire d’une journaliste qui… · Sans rien dévoiler, disons que… · Ne me dis pas la fin !**'), {
        ex: [['L’action se déroule dans un petit village côtier en hiver.', 'The story takes place in a small coastal village in winter.'], ['Sans divulgâcher, un secret de famille bouleverse tout.', 'Without spoiling it, a family secret turns everything upside down.']],
      }),
      culture(b('Divulgâcher vs spoiler', 'Divulgâcher ou spoiler'), b('In **Québec**, **divulgâcher** (from *divulguer* + *gâcher*, to spoil) is widely used in conversation and media. In France, people often say **spoiler**, or simply **ne pas révéler la fin / sans rien dévoiler**.', 'Au **Québec**, **divulgâcher** (*divulguer* + *gâcher*) est très courant à l’oral et dans les médias. En France, on entend souvent **spoiler**, ou tout simplement **ne pas révéler la fin / sans rien dévoiler**.'), { variant: 'culture' }),
      hear('C’est un film belge très touchant qui se passe dans une petite boulangerie de Bruxelles. Sans rien dévoiler, disons qu’un secret de famille va tout bouleverser.', b('How does the speaker avoid spoilers?', 'Comment la personne évite-t-elle de divulgâcher ?'), [b('by teasing only that a family secret changes everything', 'en évoquant seulement un secret de famille sans détails'), b('by explaining the final scene at the bakery', 'en racontant la dernière scène à la boulangerie'), b('by refusing to name the country', 'en refusant de nommer le pays'), b('by reading the full plot summary', 'en lisant tout le résumé du film')], { voice: 'f' }),
      ord(P.order, 'Ça raconte l’histoire d’un musicien qui perd la mémoire.', { tr: 'It tells the story of a musician who loses his memory.', extra: ['chanteuse'] }),
      pairs(P.match, [['divulgâcher', b('to spoil (a plot)', 'révéler la fin d’une histoire')], ['le personnage principal', b('the main character', 'héros ou héroïne')], ['l’intrigue', b('the plot', 'suite des événements')], ['se dérouler', b('to take place', 'se passer dans un lieu')]]),
      gap(P.complete, 'L’action se ___ à Marseille et le roman ___ l’histoire de deux sœurs très différentes.', ['passe', 'raconte'], { choices: [['passe', 'voit', 'lit'], ['raconte', 'regarde', 'chante']] }),
      say('Sans rien dévoiler, ça raconte l’histoire d’un chef qui ouvre un restaurant dans un village.', 'Without giving anything away, it’s about a chef who opens a restaurant in a village.'),
    ],
    [
      b('Ça raconte l’histoire de… · L’action se passe à…', 'Ça raconte l’histoire de… · L’action se passe à…'),
      b('Sans rien dévoiler / sans divulgâcher.', 'Sans rien dévoiler / sans divulgâcher.'),
      b('le personnage principal, l’intrigue, le suspense.', 'le personnage principal, l’intrigue, le suspense.'),
    ],
    [['divulgâcher', b('to spoil (a story)', 'gâcher la surprise en révélant la fin')], ['l’intrigue (f)', b('the plot', 'histoire principale d’une œuvre')], ['bouleverser', b('to turn upside down, move deeply', 'changer profondément')]],
  ),
  lesson(C, 2, ['nuanced-praise-and-criticism', 'louer-et-critiquer-avec-nuance'],
    b('Nuanced praise & criticism', 'Louer et critiquer avec nuance'),
    b('Go beyond « c’est super » or « c’est nul » by commenting on rhythm, style and acting.', 'Dépasser « c’est super » ou « c’est nul » en parlant de rythme, style et jeu d’acteurs.'),
    [b('Comment on acting, writing and music', 'Commenter jeu, écriture et musique'), b('Balance a positive remark with a reservation', 'Nuancer un éloge par une réserve'), b('Sort praise from mild criticism', 'Distinguer éloge et réserve')],
    13,
    [
      card(b('Sharper cultural opinions', 'Avis plus précis'), b('Praise: **J’ai été bluffé(e) par le jeu des acteurs. · La mise en scène est sublime. · Les paroles sont pleines de poésie. · Je n’ai plus pu le lâcher.** Reservations: **J’ai trouvé le scénario un peu prévisible / tiré par les cheveux. · Le rythme traîne un peu au milieu.**', 'Éloges : **J’ai été bluffé(e) par le jeu des acteurs. · La mise en scène est sublime. · Les paroles sont pleines de poésie. · Je n’ai plus pu le lâcher.** Réserves : **J’ai trouvé le scénario un peu prévisible / tiré par les cheveux. · Le rythme traîne un peu au milieu.**'), {
        ex: [['J’ai eu du mal à entrer dans le livre, mais ensuite je l’ai dévoré.', 'I struggled to get into the book at first, then I devoured it.'], ['La bande originale est magnifique, même si la fin paraît un peu bâclée.', 'The soundtrack is gorgeous, even if the ending feels a bit rushed.']],
      }),
      sort(b('Praise or reservation?', 'Éloge ou réserve ?'), [b('praise', 'éloge'), b('reservation', 'réserve')], [['C’est un véritable coup de cœur.', 0], ['La fin m’a semblé un peu bâclée.', 1], ['La bande originale m’a donné des frissons.', 0], ['Le rythme traîne un peu au milieu.', 1], ['L’écriture est à la fois fine et drôle.', 0], ['Les dialogues sonnent parfois artificiels.', 1]]),
      dlg(b('After the book club', 'Après le club de lecture'), undefined, [['Samir', 'm'], ['Vous', 'f']], [
        [0, 'Alors, tu as pensé quoi du roman de ce mois-ci ?', 'So, what did you think of this month’s novel?'],
        [1, { options: ['J’ai adoré l’écriture et les personnages, même si j’ai trouvé le milieu un peu lent.', 'Livre nul, pas lu.', 'Oui, c’est du papier.'] }],
        [0, 'Je suis assez d’accord ! Et la fin, tu l’as vue venir ?', 'I quite agree! And the ending, did you see it coming?'],
        [1, { options: ['Un peu, oui : c’était légèrement prévisible, mais le style reste très touchant.', 'Non, je n’ai pas d’yeux.', 'Bof, tout est parfait et mauvais.'] }],
      ]),
      mc(P.best, ['Cet album me touche énormément, surtout les arrangements acoustiques et la voix du chanteur.', 'La musique fait du bruit bien.', 'J’aime beaucoup très bien cette chanson.', 'C’est le meilleur album du monde parce que oui.'], { fr: 'Vous expliquez pourquoi un album récent vous plaît vraiment :' }),
      dict('J’ai trouvé la mise en scène remarquable, même si le milieu du film manque un peu de rythme.', { voice: 'm' }),
      say('J’ai eu du mal au début, mais ensuite je n’ai plus pu lâcher ce roman.', 'I had a hard time at first, but afterwards I couldn’t put this novel down.'),
    ],
    [
      b('la mise en scène, le jeu des acteurs, la bande originale, les paroles.', 'la mise en scène, le jeu des acteurs, la bande originale, les paroles.'),
      b('Bluffant, bouleversant vs prévisible, bâclé, tiré par les cheveux.', 'Bluffant, bouleversant / prévisible, bâclé, tiré par les cheveux.'),
      b('J’ai adoré…, même si… = nuanced balance.', 'J’ai adoré…, même si… = avis nuancé.'),
    ],
    [['la mise en scène', b('directing / staging', 'façon de filmer ou monter une pièce')], ['prévisible', b('predictable', 'qu’on devine à l’avance')], ['bâclé', b('rushed, sloppy', 'fait trop vite sans soin')]],
  ),
  lesson(C, 3, ['recommending-your-favourites', 'recommander-ses-coups-de-coeur'],
    b('Recommending your favourites', 'Recommander ses coups de cœur'),
    b('Match recommendations to a friend’s taste and write a vivid review.', 'Adapter ses conseils aux goûts d’un ami et rédiger un avis vivant.'),
    [b('Read cultural picks and blurbs', 'Lire de courtes critiques culturelles'), b('Recommend based on taste', 'Conseiller selon les goûts de l’autre'), b('Write a balanced cultural recommendation', 'Rédiger une recommandation sans divulgâcher')],
    13,
    [
      card(b('Tailored recommendations', 'Recommander avec justesse'), b('**C’est mon grand coup de cœur de l’année. · Si tu as aimé…, tu vas adorer… · C’est pile dans tes goûts ! · Ce n’est peut-être pas ton style habituel, mais laisse-lui une chance. · Je te le prête dès que je l’ai fini.**', '**C’est mon grand coup de cœur de l’année. · Si tu as aimé…, tu vas adorer… · C’est pile dans tes goûts ! · Ce n’est peut-être pas ton style habituel, mais laisse-lui une chance. · Je te le prête dès que je l’ai fini.**'), {
        ex: [['Si tu aimes les polars bien construits, fonce !', 'If you like well-crafted crime thrillers, go for it!'], ['C’est un album idéal pour écouter le soir au calme.', 'It’s an ideal album to listen to in the quiet of the evening.']],
      }),
      doc({ look: 'article', title: b('Culture picks of the week', 'Coups de cœur de la semaine'), text: 'CINÉMA — « L’Hiver à Montréal »\nUn drame lumineux porté par deux actrices formidables. À ne pas manquer si vous aimez les récits familiaux réalistes.\n\nMUSIQUE — Nouvel EP de Clara V.\nCinq titres acoustiques intimes, parfaits pour une écoute au casque le soir.\n\nLIVRE — « La Clé du verger »\nUn roman court et nerveux dont on ne devine la chute qu’à la dernière page.' }, b('Why is the book « La Clé du verger » recommended?', 'Pourquoi recommande-t-on le livre « La Clé du verger » ?'), [b('it is short, gripping and unpredictable until the end', 'il est court, tendu et imprévisible jusqu’à la fin'), b('it has five acoustic tracks included', 'il contient cinq morceaux acoustiques'), b('it is a slow family drama set in winter', 'c’est un drame familial lent en hiver'), b('it features two great actresses', 'il est porté par deux actrices formidables')]),
      mc(P.best, ['Si tu aimes les chansons à texte un peu mélancoliques, cet album va te plaire à coup sûr.', 'Écoute cet album, c’est obligatoire.', 'Moi j’aime, donc toi aussi.', 'C’est de la musique avec des notes.'], { fr: 'Vous recommandez un disque à une amie dont vous connaissez les goûts :' }),
      write(b('Recommend a favourite', 'Conseiller un coup de cœur'), b('Write a short message (55–85 words) recommending a film, book or album to a friend: give the genre and setup without spoilers, mention one strength and one small reservation, and explain why it suits them.', 'Écrivez un court message (55–85 mots) pour conseiller un film, un livre ou un album à un ami : donnez genre et point de départ sans divulgâcher, un point fort et une petite réserve, et pourquoi cela lui plaira.'), 55, 85, [
        b('Genre and plot setup without spoilers', 'Genre et point de départ sans divulgâcher'),
        b('One strength + one mild reservation', 'Un point fort + une petite réserve'),
        b('Reason it matches your friend’s taste', 'Lien avec les goûts de votre ami'),
      ], 'Salut Karim ! Si tu cherches un bon roman pour le week-end, je te conseille « La Clé du verger ». Sans rien divulgâcher, ça raconte l’histoire d’un libraire qui découvre une lettre oubliée dans un vieux livre. Le début est un peu lent, mais l’écriture est très fine et on ne peut plus le lâcher dès la moitié. Comme tu adores les intrigues familiales pleines de suspense, fonce !', { phrases: ['Sans rien divulgâcher…', 'Le début est un peu…, mais…', 'Comme tu adores…'] }),
      flash(b('Quick revision', 'Révision express'), [['Un vrai coup de cœur !', b('A real favourite!', 'œuvre adorée')], ['Sans divulgâcher…', b('Without spoiling…', 'sans révéler la fin')], ['Le scénario est un peu prévisible.', b('The script is a bit predictable.', 'réserve nuancée')], ['Je n’ai plus pu le lâcher.', b('I couldn’t put it down.', 'livre captivant')], ['Si tu as aimé ça, fonce !', b('If you liked that, go for it!', 'recommandation enthousiaste')]]),
      say('C’est mon coup de cœur de l’année : si tu aimes les polars bien écrits, fonce !', 'It’s my favourite of the year: if you like well-written crime fiction, go for it!'),
    ],
    [
      b('un coup de cœur · un incontournable · pile dans tes goûts.', 'un coup de cœur · un incontournable · pile dans tes goûts.'),
      b('Si tu aimes…, fonce ! / laisse-lui une chance.', 'Si tu aimes…, fonce ! / laisse-lui une chance.'),
      b('Lier la recommandation aux goûts de l’ami convainc mieux.', 'Lier la recommandation aux goûts de l’ami convainc mieux.'),
    ],
    [['un coup de cœur', b('a firm favourite', 'quelque chose qu’on adore')], ['un polar', b('a crime novel / thriller', 'roman ou film policier')], ['la chute', b('the ending / twist', 'fin surprenante d’un récit')]],
  ),
];
