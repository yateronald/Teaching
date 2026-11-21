import type { CourseAbout } from '../../types';
import { b, card, dict, hear, lesson, P, pairs, sort, tip } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'In a radio debate, guests interrupt each other, nuance, concede, attack: at B2, you must follow who defends what and with which arguments. This course trains you on original debate extracts (a speed limit in the city, the four-day school week, banning cars from downtown) to identify positions, arguments, concessions and the moderator’s role.',
    'Dans un débat radio, les invités s’interrompent, nuancent, concèdent, attaquent : au niveau B2, il faut suivre qui défend quoi et avec quels arguments. Ce cours vous entraîne sur des extraits de débats originaux (la vitesse en ville, la semaine de quatre jours à l’école, les voitures au centre-ville) pour repérer positions, arguments, concessions et le rôle de l’animateur.',
  ),
  outcomes: [
    b('Identify each guest’s position', 'Repérer la position de chaque invité'),
    b('Catch arguments and examples', 'Saisir arguments et exemples'),
    b('Recognise concessions and objections', 'Reconnaître concessions et objections'),
    b('Understand the moderator’s interventions', 'Comprendre les interventions de l’animateur'),
  ],
};

const C = 'l-radio-debates';
export default [
  lesson(C, 1, ['positions', 'les-positions'],
    b('Identifying positions', 'Repérer les positions'),
    b('Find out who is for and who is against, and why.', 'Trouver qui est pour, qui est contre, et pourquoi.'),
    [b('Recognise opinion openers', 'Reconnaître les ouvertures d’opinion'), b('Identify for and against', 'Identifier pour et contre'), b('Catch the main argument', 'Saisir l’argument principal')],
    13,
    [
      card(b('Opinion openers', 'Les ouvertures d’opinion'), b('**Pour ma part…, Personnellement…, Je suis convaincu que…, Je suis favorable à… / opposé à…, Je ne partage pas du tout cet avis.** The **first sentence** of each guest usually gives the position.', '**Pour ma part…, Personnellement…, Je suis convaincu que…, Je suis favorable à… / opposé à…, Je ne partage pas du tout cet avis.** La **première phrase** de chaque invité donne en général la position.')),
      hear('Pour ma part, je suis favorable à une limite de trente kilomètres heure dans tous les quartiers résidentiels : les accidents graves baissent de moitié.', b('What is her position and argument?', 'Quelle est sa position et son argument ?'), [b('For 30 km/h: serious accidents drop by half', 'Pour 30 km/h : les accidents graves baissent de moitié'), b('Against: it slows traffic', 'Contre : cela ralentit la circulation'), b('For 50 km/h', 'Pour 50 km/h'), b('No opinion', 'Sans opinion')]),
      hear('Je ne partage pas du tout cet avis. Trente kilomètres heure partout, c’est punir les automobilistes qui n’ont pas d’autre choix, notamment en banlieue.', b('What is his main argument?', 'Quel est son argument principal ?'), [b('It punishes drivers who have no alternative', 'Cela punit les automobilistes sans autre choix'), b('It increases accidents', 'Cela augmente les accidents'), b('It is too expensive', 'Cela coûte trop cher'), b('Cyclists are dangerous', 'Les cyclistes sont dangereux')]),
      hear('Personnellement, je suis plutôt pour, mais à condition d’améliorer d’abord le transport en commun.', b('What is this guest’s position?', 'Quelle est la position de cet invité ?'), [b('For, under a condition', 'Pour, sous condition'), b('Totally against', 'Totalement contre'), b('Totally for, without condition', 'Totalement pour, sans condition'), b('He does not know', 'Il ne sait pas')]),
      sort(b('For or against?', 'Pour ou contre ?'), [b('for', 'pour'), b('against', 'contre')], [['Je suis favorable à…', 0], ['Je ne partage pas cet avis.', 1], ['Je suis convaincu que c’est utile.', 0], ['Je m’y oppose fermement.', 1], ['J’y suis plutôt favorable.', 0], ['C’est une très mauvaise idée.', 1]], { listen: true }),
      pairs(P.match, [['être favorable à', b('to be in favour of', 'soutenir')], ['être opposé à', b('to be against', 'rejeter')], ['pour ma part', b('for my part', 'en ce qui me concerne')], ['notamment', b('in particular', 'surtout')]]),
      dict('Pour ma part, je suis favorable à une limite de trente kilomètres heure.', { voice: 'f' }),
    ],
    [
      b('Openers: Pour ma part, Personnellement, Je suis favorable / opposé à…', 'Ouvertures : Pour ma part, Personnellement, Je suis favorable / opposé à…'),
      b('The first sentence gives the position.', 'La première phrase donne la position.'),
      b('à condition de / que = a nuanced position.', 'à condition de / que = position nuancée.'),
    ],
    [['un automobiliste', b('a driver', 'conducteur')], ['résidentiel', b('residential', 'd’habitation')], ['fermement', b('firmly', 'avec force')]],
  ),
  lesson(C, 2, ['concessions-and-objections', 'concessions-et-objections'],
    b('Concessions and objections', 'Concessions et objections'),
    b('Recognise when a guest concedes a point or objects.', 'Reconnaître quand un invité concède un point ou objecte.'),
    [b('Recognise concessions', 'Reconnaître les concessions'), b('Recognise objections and interruptions', 'Reconnaître objections et interruptions'), b('Follow the logic of an exchange', 'Suivre la logique d’un échange')],
    13,
    [
      card(b('Concede and object', 'Concéder et objecter'), b('Concede: **Je vous accorde que…, C’est vrai que…, Certes…, Vous avez raison sur un point…** Object: **Permettez-moi de vous interrompre…, Justement…, Mais enfin…, Ce n’est pas tout à fait exact.**', 'Concéder : **Je vous accorde que…, C’est vrai que…, Certes…, Vous avez raison sur un point…** Objecter : **Permettez-moi de vous interrompre…, Justement…, Mais enfin…, Ce n’est pas tout à fait exact.**')),
      hear('Je vous accorde que les élèves seraient moins fatigués avec quatre jours. Mais qui va garder les enfants le mercredi ?', b('What does the guest concede?', 'Que concède l’invité ?'), [b('Pupils would be less tired', 'Les élèves seraient moins fatigués'), b('Parents are free on Wednesdays', 'Les parents sont libres le mercredi'), b('Four days are too short', 'Quatre jours, c’est trop court'), b('Nothing', 'Rien')]),
      hear('Permettez-moi de vous interrompre : ce n’est pas tout à fait exact. Plusieurs études montrent le contraire.', b('What is the guest doing?', 'Que fait l’invité ?'), [b('Interrupting to contradict a claim', 'Il interrompt pour contredire une affirmation'), b('Agreeing completely', 'Il est entièrement d’accord'), b('Changing the subject', 'Il change de sujet'), b('Ending the debate', 'Il met fin au débat')]),
      hear('Justement ! C’est parce que les parents travaillent qu’il faut des activités organisées par l’école ce jour-là.', b('How does « Justement » work here?', 'Comment fonctionne « Justement » ici ?'), [b('The speaker uses the other’s argument to support his own', 'L’orateur reprend l’argument de l’autre pour appuyer le sien'), b('He agrees fully', 'Il approuve totalement'), b('He apologises', 'Il s’excuse'), b('He asks a question', 'Il pose une question')]),
      sort(b('Concession or objection?', 'Concession ou objection ?'), [b('concession', 'concession'), b('objection', 'objection')], [['Je vous accorde que…', 0], ['Ce n’est pas tout à fait exact.', 1], ['Vous avez raison sur un point.', 0], ['Permettez-moi de vous interrompre.', 1], ['C’est vrai que…', 0], ['Mais enfin !', 1]]),
      pairs(P.match, [['Je vous accorde que…', b('I grant you that…', 'je reconnais que…')], ['Justement !', b('Precisely! (that’s my point)', 'c’est bien là le point')], ['interrompre', b('to interrupt', 'couper la parole')], ['garder les enfants', b('to look after children', 's’occuper des enfants')]]),
      dict('Je vous accorde que les élèves seraient moins fatigués.', { voice: 'm' }),
    ],
    [
      b('Concede: Je vous accorde que, C’est vrai que, Certes.', 'Concéder : Je vous accorde que, C’est vrai que, Certes.'),
      b('Object: Ce n’est pas tout à fait exact, Permettez-moi de vous interrompre.', 'Objecter : Ce n’est pas tout à fait exact, Permettez-moi de vous interrompre.'),
      b('Justement = turning the other’s point to one’s advantage.', 'Justement = retourner l’argument de l’autre.'),
    ],
    [['une étude', b('a study', 'recherche')], ['le contraire', b('the opposite', 'l’inverse')], ['organiser', b('to organise', 'mettre en place')]],
  ),
  lesson(C, 3, ['the-moderator', 'l-animateur'],
    b('The moderator’s role', 'Le rôle de l’animateur'),
    b('Understand how the moderator gives the floor, reframes and concludes.', 'Comprendre comment l’animateur donne la parole, recadre et conclut.'),
    [b('Recognise giving the floor', 'Reconnaître la prise de parole donnée'), b('Recognise reframing', 'Reconnaître le recadrage'), b('Understand a conclusion', 'Comprendre une conclusion')],
    13,
    [
      tip(b('The moderator’s formulas', 'Les formules de l’animateur'), b('Give the floor: **Je me tourne vers vous, Madame…, Votre réaction ?** Reframe: **Revenons à la question…, Soyons précis…** Time: **Il nous reste une minute.** Conclude: **Un mot de conclusion ?, Merci à nos invités.**', 'Donner la parole : **Je me tourne vers vous, Madame…, Votre réaction ?** Recadrer : **Revenons à la question…, Soyons précis…** Temps : **Il nous reste une minute.** Conclure : **Un mot de conclusion ?, Merci à nos invités.**')),
      hear('Je me tourne vers vous, Monsieur Tremblay : interdire les voitures au centre-ville, est-ce que ça ne risque pas de tuer les commerces ?', b('What does the moderator do?', 'Que fait l’animatrice ?'), [b('She gives the floor to Mr Tremblay with a question', 'Elle donne la parole à M. Tremblay avec une question'), b('She ends the debate', 'Elle termine le débat'), b('She gives her opinion', 'Elle donne son avis'), b('She interrupts', 'Elle interrompt')]),
      hear('Revenons à la question de départ, si vous le voulez bien : qui paiera ces nouvelles pistes cyclables ?', b('Why does the moderator speak?', 'Pourquoi l’animateur intervient-il ?'), [b('To bring the debate back to the initial question', 'Pour ramener le débat à la question de départ'), b('To change the subject', 'Pour changer de sujet'), b('To give a figure', 'Pour donner un chiffre'), b('To thank the guests', 'Pour remercier les invités')]),
      hear('Il nous reste une minute. Un mot de conclusion, chacun, en quinze secondes ?', b('What does the moderator ask?', 'Que demande l’animatrice ?'), [b('A short conclusion from each guest', 'Une courte conclusion de chaque invité'), b('A long explanation', 'Une longue explication'), b('A new topic', 'Un nouveau sujet'), b('A vote', 'Un vote')]),
      pairs(P.match, [['Je me tourne vers vous', b('I turn to you (your turn)', 'je vous donne la parole')], ['Revenons à…', b('Let’s go back to…', 'reprenons…')], ['Il nous reste…', b('We have … left', 'il reste du temps')], ['Un mot de conclusion ?', b('A final word?', 'conclusion brève')]]),
      sort(b('Give the floor, reframe or conclude?', 'Donner la parole, recadrer ou conclure ?'), [b('give the floor', 'donner la parole'), b('reframe', 'recadrer'), b('conclude', 'conclure')], [['Votre réaction ?', 0], ['Soyons précis.', 1], ['Merci à nos invités.', 2], ['Je me tourne vers vous.', 0], ['Revenons à la question.', 1], ['Un mot de conclusion ?', 2]]),
      dict('Revenons à la question de départ, si vous le voulez bien.', { voice: 'f' }),
    ],
    [
      b('Give the floor: Je me tourne vers vous, Votre réaction ?', 'Donner la parole : Je me tourne vers vous, Votre réaction ?'),
      b('Reframe: Revenons à…, Soyons précis.', 'Recadrer : Revenons à…, Soyons précis.'),
      b('Conclude: Un mot de conclusion ?, Merci à nos invités.', 'Conclure : Un mot de conclusion ?, Merci à nos invités.'),
    ],
    [['un commerce', b('a shop, a business', 'magasin')], ['une piste cyclable', b('a cycle lane', 'voie pour vélos')], ['une question de départ', b('the initial question', 'question initiale')]],
  ),
];
