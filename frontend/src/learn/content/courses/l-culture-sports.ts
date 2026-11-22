import type { CourseAbout } from '../../types';
import { b, card, culture, dict, dlg, hear, lesson, P, pairs, sort } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'On French-language radio, cultural columns and sports bulletins pack lively adjectives, festival dates and match scores into thirty seconds. Critics praise with nuance, and commentators jump from kick-off to league standings at high speed. This course trains your ear on film and book reviews, festival schedules and sports recaps.',
    'À la radio francophone, les chroniques culturelles et les bulletins sportifs condensent adjectifs imagés, dates de festival et scores de matchs en trente secondes. Les critiques nuancent leurs éloges, et les commentateurs passent du coup d’envoi au classement général à toute allure. Ce cours vous entraîne sur les critiques de cinéma, les festivals et les résumés sportifs.',
  ),
  outcomes: [
    b('Interpret praise, nuance and reservations in cinema and arts reviews', 'Interpréter éloges, nuances et réserves dans les critiques'),
    b('Catch dates, venues, tickets and sold-out alerts for festivals', 'Saisir dates, lieux, tarifs et alertes de guichet fermé'),
    b('Follow live-style sports recaps, scores and turning points', 'Suivre résumés de matchs, scores et tournants décisifs'),
    b('Recognise common idioms of cultural and sports journalism', 'Reconnaître les expressions clés du journalisme culturel et sportif'),
  ],
};

const C = 'l-culture-sports';
export default [
  lesson(C, 1, ['cinema-and-book-reviews', 'critiques-de-cinema-et-livres'],
    b('Cinema and arts reviews on the radio', 'Critiques de cinéma et d’arts à la radio'),
    b('Distinguish enthusiastic praise from polite disappointment in arts bulletins.', 'Distinguer l’enthousiasme sincère de la réserve polie dans les chroniques culturelles.'),
    [b('Spot glowing praise (coup de cœur, bluffant)', 'Repérer les éloges francs (coup de cœur, bluffant)'), b('Recognise mixed reviews (en demi-teinte, convenu)', 'Reconnaître un avis mitigé (en demi-teinte, convenu)'), b('Identify what a critic liked or disliked', 'Identifier ce qui a plu ou déçu')],
    13,
    [
      card(b('Reading a critic’s tone', 'Décoder le ton d’un critique'), b('French critics rarely just say « good » or « bad ». Look for enthusiastic cues: **un coup de cœur** (a favourite), **un jeu d’acteur bluffant** (stunning acting), **une mise en scène maîtrisée** (assured directing). Mixed cues: **en demi-teinte** (mixed/lukewarm), **un scénario convenu** (predictable plot), **ça manque de souffle** (it lacks energy).', 'Les critiques disent rarement juste « bon » ou « mauvais ». Repérez les éloges : **un coup de cœur**, **un jeu d’acteur bluffant**, **une mise en scène maîtrisée**. Les réserves : **en demi-teinte**, **un scénario convenu**, **ça manque de souffle**.'), {
        ex: [['Malgré une première moitié un peu lente, la fin est bouleversante.', 'Despite a slightly slow first half, the ending is deeply moving.'], ['Le roman reste prévisible, faute de véritable suspense.', 'The novel remains predictable for lack of real suspense.']],
      }),
      hear('C’est mon grand coup de cœur de la semaine : la photographie est splendide et l’actrice principale livre une performance bluffante.', b('What is the critic’s verdict?', 'Quel est l’avis de la critique ?'), [b('Very enthusiastic, praising cinematography and the lead actress', 'Très enthousiaste, saluant l’image et l’actrice principale'), b('Mixed, saying the plot is dull', 'Mitigé, trouvant l’histoire ennuyeuse'), b('Disappointed by the lead actress', 'Déçue par l’actrice principale'), b('Indifferent, refusing to recommend it', 'Indifférente, refusant de le recommander')], { voice: 'f' }),
      hear('On attendait beaucoup de ce polar, mais le résultat est en demi-teinte : des décors soignés, certes, mais un scénario beaucoup trop convenu.', b('What weakened the crime film according to him?', 'Qu’est-ce qui affaiblit ce polar selon lui ?'), [b('A plot that is far too predictable', 'Un scénario beaucoup trop convenu'), b('Ugly sets and bad lighting', 'Des décors ratés et un mauvais éclairage'), b('A runtime that is too short', 'Une durée trop courte'), b('Too many unexpected twists', 'Trop de rebondissements imprévus')], { voice: 'm' }),
      hear('Sans être un chef-d’œuvre, cette comédie légère fait passer un bon moment grâce à des dialogues vifs.', b('How does she judge the comedy?', 'Comment juge-t-elle cette comédie ?'), [b('Enjoyable with lively dialogue, though not a masterpiece', 'Agréable avec de bons dialogues, sans être un chef-d’œuvre'), b('A masterpiece that will win every prize', 'Un chef-d’œuvre promis à tous les prix'), b('Completely boring from start to finish', 'Totalement ennuyeuse du début à la fin'), b('Too tragic for a general audience', 'Trop tragique pour le grand public')], { voice: 'f2' }),
      sort(b('Praise or criticism / reservation?', 'Éloge ou réserve / critique ?'), [b('praise', 'éloge'), b('reservation / criticism', 'réserve / critique')], [['un vrai coup de cœur', 0], ['un scénario convenu', 1], ['une mise en scène brillante', 0], ['un rythme en demi-teinte', 1], ['une interprétation bluffante', 0], ['ça manque de souffle', 1]], { listen: true }),
      pairs(P.match, [['un coup de cœur', b('a favourite / top pick', 'œuvre très aimée')], ['en demi-teinte', b('mixed, lukewarm', 'ni tout à fait réussi ni raté')], ['convenu', b('predictable, cliché', 'sans surprise, classique')], ['la mise en scène', b('directing, staging', 'façon de filmer ou monter')]]),
      dict('Malgré un début un peu lent, ce film est un vrai coup de cœur.', { voice: 'm2' }),
    ],
    [
      b('coup de cœur / bluffant = strong praise; chef-d’œuvre = masterpiece.', 'coup de cœur / bluffant = grand éloge ; chef-d’œuvre = œuvre majeure.'),
      b('en demi-teinte / convenu = mixed or predictable.', 'en demi-teinte / convenu = mitigé ou prévisible.'),
      b('certes…, mais… acknowledges a quality before a flaw.', 'certes…, mais… reconnaît une qualité avant une critique.'),
    ],
    [['bluffant', b('stunning, remarkable', 'très impressionnant')], ['convenu', b('predictable, formulaic', 'trop classique, sans surprise')], ['la mise en scène', b('the directing', 'réalisation artistique')]],
  ),
  lesson(C, 2, ['festivals-concerts-and-exhibitions', 'festivals-concerts-et-expositions'],
    b('Festivals, concerts and exhibition highlights', 'Festivals, concerts et expositions'),
    b('Catch cultural dates, venues, ticket availability and festival highlights.', 'Saisir dates, lieux, billetterie et temps forts des festivals à la radio.'),
    [b('Understand ticket status (guichet fermé, entrée libre)', 'Comprendre la billetterie (guichet fermé, entrée libre)'), b('Catch festival dates and extensions (prolongation)', 'Repérer dates et prolongations'), b('Follow a radio cultural preview', 'Suivre un aperçu culturel à la radio')],
    13,
    [
      card(b('Cultural calendar cues', 'Repères de l’agenda culturel'), b('In event bulletins, listen for: **à l’affiche** (playing/featured), **en tête d’affiche** (headlining), **à guichets fermés** (sold out), **entrée libre** (free admission), **une rétrospective** (retrospective), **une prolongation jusqu’au…** (extended until…).', 'Dans les agendas culturels, repérez : **à l’affiche**, **en tête d’affiche**, **à guichets fermés**, **entrée libre**, **une rétrospective**, **une prolongation jusqu’au…**.'), {
        ex: [['L’exposition est prolongée jusqu’au 30 septembre.', 'The exhibition is extended until September 30.'], ['Les deux concerts affichent complet.', 'Both concerts are sold out.']],
      }),
      culture(b('La billetterie francophone', 'La billetterie francophone'), b('From France’s **Fête de la musique** (June 21) to Montréal’s **Festival de jazz**, outdoor stages are often **en accès libre** (free entry), while indoor shows sell fast—watch for **dernières places disponibles** (last seats available).', 'De la **Fête de la musique** en France au **Festival de jazz** de Montréal, les scènes extérieures sont souvent **en accès libre**, tandis que les salles partent vite : guettez **dernières places disponibles**.')),
      hear('Bonne nouvelle pour les amateurs de photo : la rétrospective consacrée aux rues de Québec bénéficie d’une prolongation exceptionnelle jusqu’au dix-huit novembre. L’entrée est gratuite le premier dimanche du mois.', b('When is the exhibition free?', 'Quand l’exposition est-elle gratuite ?'), [b('On the first Sunday of the month', 'Le premier dimanche du mois'), b('Every Friday evening until November 18', 'Chaque vendredi soir jusqu’au 18 novembre'), b('Only on opening night', 'Uniquement le soir du vernissage'), b('Never, tickets must be bought online', 'Jamais, les billets sont obligatoires')], { voice: 'f2' }),
      hear('Le festival ouvre vendredi avec une grande soirée en plein air. Attention, le concert de clôture joue déjà à guichets fermés, mais il reste des places pour les ateliers de samedi.', b('Which event is still open for booking?', 'Pour quel événement reste-t-il des places ?'), [b('Saturday’s workshops', 'Les ateliers de samedi'), b('The closing concert', 'Le concert de clôture'), b('Sunday’s private dinner', 'Le dîner privé de dimanche'), b('None, everything is sold out', 'Aucun, tout est complet')], { voice: 'm2' }),
      dlg(b('Radio arts column', 'Chronique culturelle à la radio'), b('A radio host interviews the culture columnist about this weekend.', 'L’animateur interroge la chroniqueuse culture sur le programme du week-end.'), [['Animateur', 'm'], ['Chroniqueuse', 'f']], [
        [0, 'Léa, qu’est-ce qu’on retient dans l’agenda culturel de ce week-end ?', 'Léa, what stands out in this weekend’s cultural calendar?'],
        [1, 'D’abord, la Nuit des musées samedi : plus de quarante lieux ouvrent en entrée libre jusqu’à minuit.', 'First, Museum Night on Saturday: over 40 venues open free until midnight.'],
        [0, 'Et côté musique, des places encore disponibles ?', 'And on the music side, any tickets left?'],
        [1, { options: ['Oui, pour les scènes en plein air, mais la grande salle affiche complet.', 'Oui, le guichet ferme toutes les têtes.', 'Non, les musées ferment à midi.'] }],
        [0, 'Merci Léa ! On se retrouve lundi pour le bilan.', 'Thanks Léa! See you Monday for the wrap-up.'],
      ]),
      pairs(P.match, [['à guichets fermés', b('sold out', 'sans aucune place restante')], ['entrée libre', b('free admission', 'accès gratuit')], ['tête d’affiche', b('headliner', 'artiste principal')], ['une prolongation', b('an extension (of run)', 'durée ajoutée')]]),
      dict('Le concert de samedi joue déjà à guichets fermés.', { voice: 'f' }),
    ],
    [
      b('à guichets fermés / affiche complet = sold out.', 'à guichets fermés / affiche complet = plus de places.'),
      b('entrée libre = free entry; prolongation = extended dates.', 'entrée libre = gratuit ; prolongation = dates ajoutées.'),
      b('en plein air = outdoors; tête d’affiche = headliner.', 'en plein air = dehors ; tête d’affiche = vedette principale.'),
    ],
    [['à guichets fermés', b('sold out', 'toutes les places vendues')], ['le vernissage', b('exhibition opening', 'inauguration d’exposition')], ['une prolongation', b('an extension', 'prolongement des dates')]],
  ),
  lesson(C, 3, ['sports-match-recaps', 'resumes-et-chroniques-sportives'],
    b('Sports bulletins and match recaps', 'Bulletins et résumés sportifs'),
    b('Follow scores, turning points, extra time and rankings in sports bulletins.', 'Suivre scores, actions décisives, prolongations et classements sportifs.'),
    [b('Track scores, halves and turning points', 'Suivre scores, mi-temps et actions clés'), b('Understand victories, draws and defeats', 'Comprendre victoires, matchs nuls et défaites'), b('Catch injury and ranking updates', 'Saisir blessures, forfaits et classements')],
    13,
    [
      card(b('Sports bulletin essentials', 'Les clés du bulletin sportif'), b('Sports flashes move fast: **s’imposer 2 à 1** (to win 2–1), **s’incliner** (to lose), **un match nul** (a draw), **à la mi-temps** (at half-time), **en prolongation** (in overtime), **aux tirs au but** (on penalties), **déclarer forfait** (to withdraw due to injury).', 'Les flashes sportifs vont vite : **s’imposer 2 à 1**, **s’incliner**, **un match nul**, **à la mi-temps**, **en prolongation**, **aux tirs au but**, **déclarer forfait**.'), {
        ex: [['Lyon s’est imposé trois buts à un à l’extérieur.', 'Lyon won 3–1 away from home.'], ['Les deux équipes restent à égalité en tête du classement.', 'Both teams remain tied at the top of the table.']],
      }),
      hear('Menés un à zéro à la pause, les Bleus ont renversé le match en seconde période et se sont imposés deux buts à un grâce à un but inscrit à la quatre-vingt-huitième minute.', b('How did the match unfold?', 'Comment le match s’est-il déroulé ?'), [b('Down 1–0 at half-time, they came back to win 2–1 near the end', 'Menés 1–0 à la pause, ils ont renversé le score pour gagner 2–1 à la fin'), b('They lost 2–1 after leading at half-time', 'Ils ont perdu 2–1 après avoir mené à la pause'), b('The match ended in a 1–1 draw', 'Le match s’est terminé sur un nul 1–1'), b('They won on penalties after overtime', 'Ils ont gagné aux tirs au but après prolongation')], { voice: 'm' }),
      hear('Coup dur en tennis : touchée au genou gauche, la tenante du titre a dû déclarer forfait avant les quarts de finale.', b('What happened to the defending champion?', 'Qu’est-il arrivé à la tenante du titre ?'), [b('She withdrew before the quarter-finals due to a left knee injury', 'Elle a déclaré forfait avant les quarts pour blessure au genou'), b('She won the quarter-final easily', 'Elle a remporté le quart de finale facilement'), b('She received a penalty for arriving late', 'Elle a reçu une pénalité de retard'), b('Her match was moved indoors because of rain', 'Son match a été déplacé à cause de la pluie')], { voice: 'f' }),
      hear('Au classement général, Toulouse conserve trois points d’avance malgré son match nul zéro à zéro sur le terrain de Nantes.', b('What is Toulouse’s situation in the standings?', 'Quelle est la situation de Toulouse au classement ?'), [b('Still leading by 3 points despite a 0–0 away draw', 'Toujours en tête avec 3 points d’avance malgré un nul 0–0'), b('They dropped three places after losing away', 'Ils ont perdu trois places après une défaite'), b('They are tied on points with Nantes', 'Ils sont à égalité de points avec Nantes'), b('They played at home and scored three goals', 'Ils ont joué à domicile et marqué trois buts')], { voice: 'm2' }),
      sort(b('Match action or standings / schedule?', 'Action du match ou classement / calendrier ?'), [b('match action / score', 'action / score'), b('standings / schedule', 'classement / calendrier')], [['un tir au but décisif', 0], ['en tête du classement', 1], ['égaliser à la pause', 0], ['trois points d’avance', 1], ['marquer en prolongation', 0], ['prochaine journée samedi', 1]], { listen: true }),
      pairs(P.match, [['s’imposer', b('to win (a match)', 'remporter la victoire')], ['s’incliner', b('to lose, bow out', 'perdre le match')], ['un match nul', b('a draw, tie', 'score à égalité')], ['déclarer forfait', b('to withdraw / forfeit', 'renoncer à jouer')]]),
      dict('Menés à la pause, ils se sont imposés trois buts à deux.', { voice: 'f2' }),
    ],
    [
      b('s’imposer = win; s’incliner = lose; match nul = draw.', 's’imposer = gagner ; s’incliner = perdre ; match nul = égalité.'),
      b('à la pause / mi-temps = half-time; prolongation = overtime.', 'à la pause / mi-temps ; prolongation.'),
      b('déclarer forfait = withdraw (often due to injury).', 'déclarer forfait = se retirer avant ou pendant la compétition.'),
    ],
    [['s’imposer', b('to win, prevail', 'gagner la rencontre')], ['la mi-temps', b('half-time', 'pause au milieu du match')], ['le classement', b('the standings, rankings', 'ordre des équipes')]],
  ),
];
