// B1 · The second half of the negation carries the meaning: ne… pas / plus / jamais / rien, and ne… que (= only).
import { ear, ex, fill, pick, situation } from '../authoring';

const MEAN: [string, string] = ['Que veut dire la phrase ?', 'What does the sentence mean?'];
const RESA = 'Désolé, il ne reste que deux places pour ce soir, et on n’accepte plus les réservations par téléphone.';
const RESA_SHOW = 'Désolé, il ne reste {que} deux places pour ce soir, et on n’accepte {plus} les réservations par téléphone.';

export default ear('ne-que', {
  rule: [
    ['Ne… pas, ne… plus, ne… que : écoutez la fin', 'Ne… pas, ne… plus, ne… que: listen to the end'],
    [
      'Une négation française a deux parties, et c’est **la deuxième** qui donne le sens : __je ne mange pas__ (pas du tout), __je ne mange plus__ (avant oui, maintenant non), __je ne mange jamais__ (à aucun moment), __je ne mange rien__ (aucune chose).\n\nAttention : __ne… que__ n’est **pas une négation**. __Je n’ai que dix euros__ = j’ai **seulement** dix euros. Et à l’oral, le « ne » disparaît souvent : il ne reste que la deuxième partie à entendre.',
      'A French negation has two parts, and **the second one** carries the meaning: __je ne mange pas__ (not at all), __je ne mange plus__ (no longer), __je ne mange jamais__ (never), __je ne mange rien__ (nothing).\n\nCareful: __ne… que__ is **not a negation**. __Je n’ai que dix euros__ = I **only** have ten euros. And in speech, « ne » often disappears: only the second part is left to hear.',
    ],
  ],
  goal: ['Comprendre le sens exact d’une négation, et ne pas confondre ne… que avec « pas ».', 'Understand the exact meaning of a negation, and not mistake ne… que for « not ».'],
  examples: [
    ex('Je n’ai que dix euros.', 'Je n’ai {que} dix euros.', ['Ne… que = seulement : j’ai dix euros.', 'Ne… que = only: I have ten euros.']),
    ex('Je n’ai plus d’argent.', 'Je n’ai {plus} d’argent.', ['Ne… plus : avant j’en avais, maintenant non.', 'Ne… plus: I had some, now I have none.']),
    ex('Il ne boit jamais de café.', 'Il ne boit {jamais} de café.', ['Ne… jamais : à aucun moment.', 'Ne… jamais: never.']),
  ],
  items: [
    pick('Elle n’a que deux enfants.', ['Elle a deux enfants.', 'Elle n’a pas d’enfants.'], 0, 'Elle n’a {que} deux enfants.', [
      'Ne… que = seulement : elle a deux enfants, pas plus.', 'Ne… que = only: she has two children, no more.',
    ], MEAN),
    pick('Il ne fume plus.', ['Il a arrêté de fumer.', 'Il n’a jamais fumé.', 'Il fume encore.'], 0, 'Il ne fume {plus}.', [
      'Ne… plus : il fumait avant, il a arrêté.', 'Ne… plus: he used to smoke and has stopped.',
    ], MEAN),
    pick('Je ne regarde jamais la télé.', ['Je ne la regarde à aucun moment.', 'Je la regarde parfois.', 'Je la regarde seulement le soir.'], 0, 'Je ne regarde {jamais} la télé.', [
      'Ne… jamais : à aucun moment.', 'Ne… jamais: at no time.',
    ], MEAN),
    pick('On n’a rien compris.', ['On n’a compris aucune chose.', 'On a tout compris.', 'On a compris un peu.'], 0, 'On n’a {rien} compris.', [
      'Ne… rien : aucune chose. Le contraire de « tout ».', 'Ne… rien: nothing. The opposite of « tout ».',
    ], MEAN),
    pick('Le magasin n’ouvre que le samedi.', ['Il ouvre seulement le samedi.', 'Il est fermé le samedi.', 'Il ouvre tous les jours sauf le samedi.'], 0, 'Le magasin n’ouvre {que} le samedi.', [
      'Ne… que : seulement. Le piège : croire que c’est « il n’ouvre pas le samedi ».', 'Ne… que: only. The trap: thinking it means « it does not open on Saturday ».',
    ], MEAN),
    fill('Il n’y a plus de lait.', 'Il n’y a ___ de lait.', 'plus', 'Il n’y a {plus} de lait.', [
      '[ply] : il n’y en a plus, tout a été bu.', '[ply]: there is none left.',
    ]),
    fill('Je n’ai que cinq minutes.', 'Je n’ai ___ cinq minutes.', 'que', 'Je n’ai {que} cinq minutes.', [
      '[kə] : ne… que, seulement cinq minutes.', '[kə]: ne… que, only five minutes.',
    ]),
    fill('Nous ne sommes jamais allés au Japon.', 'Nous ne sommes ___ allés au Japon.', 'jamais', 'Nous ne sommes {jamais} allés au Japon.', [
      '[ʒamɛ] : jamais, même pas une fois.', '[ʒamɛ]: never, not even once.',
    ]),
    situation(RESA, 'Combien de places reste-t-il ?', ['Deux places', 'Aucune place', 'Beaucoup de places'], 0, RESA_SHOW, [
      '« Il ne reste que deux places » : seulement deux, mais il en reste.', '« Il ne reste que deux places »: only two, but there are some left.',
    ]),
    situation(RESA, 'Peut-on réserver par téléphone ?', ['Non, plus maintenant.', 'Oui, seulement ce soir.', 'Oui, toujours.'], 0, RESA_SHOW, [
      '« On n’accepte plus » : avant c’était possible, maintenant non.', '« On n’accepte plus »: it used to be possible, not any more.',
    ]),
  ],
  takeaway: [
    'Écoutez la deuxième partie : pas, plus, jamais, rien… et ne… que, qui veut dire « seulement », pas « ne pas ».',
    'Listen to the second part: pas, plus, jamais, rien… and ne… que, which means « only », not « not ».',
  ],
});
