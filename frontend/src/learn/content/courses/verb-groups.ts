import { b, card, conj, gap, lesson, mc, ord, pairs, P, sort, trap } from '../dsl';

const id = 'verb-groups';
const first = b('Group 1', '1er groupe');
const second = b('Group 2', '2e groupe');
const third = b('Group 3', '3e groupe');
const aux = b('Auxiliaries', 'Auxiliaires');

export default [
  lesson(id, 1, ['infinitive-and-group-one', 'infinitif-et-premier-groupe'], b('Find the verb and its infinitive', 'Repérer le verbe et son infinitif'),
    b('Recognise a conjugated form and the most frequent -er pattern.', 'Reconnaître une forme conjuguée et le modèle le plus fréquent en -er.'),
    [b('Identify the dictionary form', 'Repérer la forme du dictionnaire'), b('Use the parler pattern', 'Employer le modèle de parler')], 10, [
      card(b('Start with a sentence', 'Partez d’une phrase'), b('In « Mina parle français », parle is a conjugated form. Parler is the infinitive, the form you look up in a dictionary.', 'Dans « Mina parle français », parle est une forme conjuguée. Parler est l’infinitif, la forme à chercher dans le dictionnaire.'), {
        ex: [['Mina parle français.', 'Mina speaks French.'], ['Nous parlons de notre voyage.', 'We’re talking about our trip.'], ['Vous aimez le thé ?', 'Do you like tea?']],
      }),
      card(first, b('The usual group 1 endings in the present are -e, -es, -e, -ons, -ez, -ent. There can be spelling adjustments, as in « nous mangeons ».', 'Les terminaisons habituelles du premier groupe au présent sont -e, -es, -e, -ons, -ez, -ent. L’orthographe peut s’ajuster, comme dans « nous mangeons ».')),
      mc(b('Which word is the infinitive?', 'Quel mot est à l’infinitif ?'), ['écouter', 'écoute', 'écoutons'], { fr: 'Tu écoutes la radio le matin.', explain: b('Écoutes is the tu form. The infinitive is écouter.', 'Écoutes est la forme de tu. L’infinitif est écouter.') }),
      pairs(b('Link each form to its infinitive.', 'Associez chaque forme à son infinitif.'), [['parlons', 'parler'], ['jouent', 'jouer'], ['aimes', 'aimer'], ['cherchez', 'chercher']], true),
      gap(P.complete, 'Nous ___ le bus devant la gare. (chercher)', ['cherchons'], { explain: b('The ending for nous is -ons.', 'La terminaison de nous est -ons.') }),
      conj('parler', b('Present', 'Présent'), [['je', 'parle'], ['tu', 'parles'], ['elle', 'parle'], ['nous', 'parlons'], ['vous', 'parlez'], ['ils', 'parlent']], { given: [0, 2, 3] }),
      ord(P.order, 'Nous parlons souvent de nos voyages', { tr: 'We often talk about our trips.' }),
      mc(b('Which verb is in group 1?', 'Quel verbe appartient au premier groupe ?'), ['parler', 'aller', 'finir'], { explain: b('Aller has its own patterns. Finir is a group 2 verb.', 'Aller suit des modèles particuliers. Finir est du deuxième groupe.') }),
    ], [b('Use the infinitive to look up the verb.', 'Cherchez le verbe à l’infinitif dans le dictionnaire.'), b('Learn parler as the model for the regular -er family.', 'Retenez parler comme modèle des verbes réguliers en -er.')]),
  lesson(id, 2, ['group-two-or-three', 'deuxieme-ou-troisieme-groupe'], b('Tell finir and partir apart', 'Distinguer finir de partir'),
    b('Listen for and look for the -iss- pattern when classifying -ir verbs.', 'Repérez le radical en -iss- pour classer les verbes en -ir.'),
    [b('Test -ir verbs with the nous form', 'Tester les verbes en -ir avec nous'), b('Recognise common group 3 patterns', 'Reconnaître des modèles fréquents du troisième groupe')], 10, [
      card(second, b('An -ir verb follows group 2 if its present participle ends in -issant, like finissant. A quick clue: nous finissons.', 'Un verbe en -ir est du deuxième groupe si son participe présent se termine en -issant, comme finissant. Un indice rapide : nous finissons.'), {
        ex: [['Nous finissons le travail à cinq heures.', 'We finish work at five.'], ['Nous choisissons un cadeau.', 'We’re choosing a gift.']],
      }),
      trap(third, b('The ending -ir alone is insufficient. Compare « nous partons » and « en partant ». Group 3 also includes verbs such as prendre and pouvoir.', 'La terminaison -ir seule ne suffit pas. Comparez « nous partons » et « en partant ». Le troisième groupe comprend aussi des verbes comme prendre et pouvoir.'), {
        ex: [['Nous partons tôt demain.', 'We’re leaving early tomorrow.'], ['Nous prenons le bus.', 'We’re taking the bus.']],
      }),
      sort(b('Sort the verbs by group.', 'Classez les verbes par groupe.'), [first, second, third], [
        ['parler', 0], ['aimer', 0], ['finir', 1], ['choisir', 1], ['grandir', 1], ['partir', 2], ['venir', 2], ['prendre', 2], ['voir', 2], ['aller', 2],
      ]),
      mc(b('Which form identifies this group 2 verb?', 'Quelle forme indique que ce verbe est du deuxième groupe ?'), ['nous choisissons', 'nous choisons', 'nous choisirons'], { explain: b('Choisissons is the present form with -iss-. Choisirons is a future form.', 'Choisissons est la forme du présent avec -iss-. Choisirons est une forme du futur.') }),
      gap(P.complete, 'Nous ___ le repas. (finir, présent)', ['finissons']),
      gap(P.complete, 'Nous ___ à six heures. (partir, présent)', ['partons']),
      mc(b('What do partir and finir share?', 'Qu’est-ce que partir et finir ont en commun ?'), [
        b('Their infinitive ending', 'Leur terminaison à l’infinitif'),
        b('Their verb group', 'Leur groupe'), b('Their nous stem', 'Leur radical avec nous'),
      ]),
    ], [b('Use nous and the present participle to distinguish finir from partir.', 'Servez-vous de nous et du participe présent pour distinguer finir de partir.')]),
  lesson(id, 3, ['special-verbs-and-auxiliaries', 'verbes-particuliers-et-auxiliaires'], b('Aller, être and avoir', 'Aller, être et avoir'),
    b('Recognise three special verbs and the two auxiliaries.', 'Reconnaître trois verbes particuliers et les deux auxiliaires.'),
    [b('Recognise aller despite its ending', 'Reconnaître aller malgré sa terminaison'), b('Separate the auxiliary and participle', 'Séparer l’auxiliaire et le participe')], 10, [
      trap(b('The -er exception you meet every day', 'L’exception en -er du quotidien'), b('Aller belongs to group 3. Learn « je vais », « nous allons » and « ils vont » as frequent forms.', 'Aller est du troisième groupe. Retenez « je vais », « nous allons » et « ils vont », trois formes fréquentes.'), {
        ex: [['Je vais chez Lina.', 'I’m going to Lina’s place.'], ['Nous allons partir.', 'We’re going to leave.']],
      }),
      card(aux, b('Être and avoir have special conjugations. They can carry meaning themselves or be auxiliaries, as in « j’ai parlé » and « elle est partie ».', 'Être et avoir se conjuguent à part. Ils peuvent avoir un sens propre ou servir d’auxiliaires, comme dans « j’ai parlé » et « elle est partie ».'), {
        ex: [['J’ai un billet.', 'I have a ticket.'], ['J’ai pris un billet.', 'I bought a ticket.'], ['Elle est à la gare.', 'She is at the station.'], ['Elle est partie.', 'She left.']],
      }),
      mc(b('Which is the auxiliary?', 'Quel mot est l’auxiliaire ?'), ['est', 'partie', 'elle'], { fr: 'Elle est partie.', explain: b('Est is a form of être. Partie is the past participle.', 'Est est une forme de être. Partie est le participe passé.') }),
      mc(b('Which is the past participle?', 'Quel mot est le participe passé ?'), ['pris', 'ai', 'billet'], { fr: 'J’ai pris un billet.' }),
      gap(P.complete, 'Nous ___ bien, merci. (aller, présent)', ['allons']),
      gap(P.complete, 'J’___ trente ans. (avoir, présent)', ['ai']),
      mc(b('Which sentence uses avoir as an auxiliary?', 'Dans quelle phrase avoir est-il auxiliaire ?'), ['J’ai parlé à Lina.', 'J’ai un rendez-vous.', 'Je parle à Lina.'], { explain: b('Ai combines with the past participle parlé.', 'Ai se combine avec le participe passé parlé.') }),
      ord(P.order, 'Elle est partie à huit heures', { tr: 'She left at eight o’clock.' }),
    ], [b('Être and avoir can work as verbs or as auxiliaries.', 'Être et avoir peuvent servir de verbes ou d’auxiliaires.'), b('Aller is a group 3 verb.', 'Aller est un verbe du troisième groupe.')]),
];
