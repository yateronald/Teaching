import type { CourseAbout } from '../../types';
import { b, card, dict, doc, gap, lesson, mc, P, sort, trap } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Aujourd’hui, beaucoup, quelqu’un, parce que, d’accord, toujours, malgré, longtemps: a small number of everyday words account for a large share of spelling mistakes in emails, messages and exam papers, from learners and native speakers alike. This course groups these words by trap (apostrophes, words in two parts, silent letters, accents) and fixes them with memory tricks and short dictations.',
    'Aujourd’hui, beaucoup, quelqu’un, parce que, d’accord, toujours, malgré, longtemps : un petit nombre de mots courants concentre une grande part des fautes dans les courriels, les messages et les copies d’examen, chez les apprenants comme chez les natifs. Ce cours regroupe ces mots par type de piège (apostrophes, mots en deux parties, lettres muettes, accents) et les fixe avec des moyens mnémotechniques et de courtes dictées.',
  ),
  outcomes: [
    b('Write words with apostrophes and hyphens correctly', 'Écrire correctement les mots avec apostrophe et trait d’union'),
    b('Separate or join words correctly', 'Séparer ou souder les mots correctement'),
    b('Remember silent letters in frequent words', 'Retenir les lettres muettes des mots fréquents'),
    b('Proofread a short message', 'Relire un court message'),
  ],
};

const C = 'sp-common-words';
export default [
  lesson(C, 1, ['apostrophes-and-hyphens', 'apostrophes-et-traits-d-union'],
    b('Apostrophes and hyphens', 'Apostrophes et traits d’union'),
    b('Write aujourd’hui, quelqu’un, d’accord, peut-être, c’est-à-dire.', 'Écrire aujourd’hui, quelqu’un, d’accord, peut-être, c’est-à-dire.'),
    [b('Place apostrophes', 'Placer les apostrophes'), b('Place hyphens', 'Placer les traits d’union'), b('Distinguish peut-être / peut être', 'Distinguer peut-être / peut être')],
    13,
    [
      card(b('Words with an apostrophe or a hyphen', 'Mots avec apostrophe ou trait d’union'), b('Apostrophe: **aujourd’hui, quelqu’un, quelqu’une, d’accord, presqu’île, entr’ouvert** (old). Hyphen: **peut-être, c’est-à-dire, là-bas, au-dessus, au-dessous, celui-ci, après-midi, grand-mère, vingt-deux, dis-moi, est-ce que**.', 'Apostrophe : **aujourd’hui, quelqu’un, quelqu’une, d’accord, presqu’île**. Trait d’union : **peut-être, c’est-à-dire, là-bas, au-dessus, au-dessous, celui-ci, après-midi, grand-mère, vingt-deux, dis-moi, est-ce que**.')),
      trap(b('peut-être or peut être?', 'peut-être ou peut être ?'), b('**peut-être** (hyphen) = maybe: you can replace it by **sans doute**: **Il viendra peut-être.** **peut être** (two words) = can be: **Il peut être en retard** (→ il pourrait être).', '**peut-être** (trait d’union) = adverbe, remplaçable par **sans doute** : **Il viendra peut-être.** **peut être** (deux mots) = verbe pouvoir + être : **Il peut être en retard** (→ il pourrait être).')),
      mc(P.spelling, ['aujourd’hui', 'aujourdhui', 'aujour d’hui', 'aujourd’huit']),
      mc(P.spelling, ['quelqu’un', 'quelquun', 'quelque un', 'quel qu’un']),
      gap(P.complete, 'Il viendra ___ cet après-midi, mais il ___ en retard.', ['peut-être', 'peut être'], { strict: true }),
      dict('D’accord, je passerai peut-être cet après-midi, c’est-à-dire vers trois heures.', { strict: true }),
    ],
    [
      b('Apostrophe: aujourd’hui, quelqu’un, d’accord.', 'Apostrophe : aujourd’hui, quelqu’un, d’accord.'),
      b('Hyphen: peut-être, c’est-à-dire, là-bas, après-midi.', 'Trait d’union : peut-être, c’est-à-dire, là-bas, après-midi.'),
      b('peut-être = sans doute; peut être = pourrait être.', 'peut-être = sans doute ; peut être = pourrait être.'),
    ],
    [['une presqu’île', b('a peninsula', 'terre presque entourée d’eau')], ['là-bas', b('over there', 'à cet endroit lointain')], ['au-dessus', b('above', 'plus haut')]],
  ),
  lesson(C, 2, ['one-word-or-two', 'en-un-ou-deux-mots'],
    b('One word or two?', 'En un mot ou en deux ?'),
    b('Know which common expressions are written in one word and which in two.', 'Savoir quelles expressions courantes s’écrivent en un mot et lesquelles en deux.'),
    [b('Write parce que, tout à coup, tout de suite', 'Écrire parce que, tout à coup, tout de suite'), b('Write quelquefois, longtemps, autrefois', 'Écrire quelquefois, longtemps, autrefois'), b('Distinguish quelquefois / quelques fois', 'Distinguer quelquefois / quelques fois')],
    13,
    [
      card(b('Joined or separate', 'Soudé ou séparé'), b('**In two (or more) words**: **parce que, tout à coup, tout de suite, tout à fait, à peu près, d’abord, en fait, au revoir, s’il vous plaît, bien sûr**. **In one word**: **quelquefois, longtemps, autrefois, toujours, beaucoup, aujourd’hui, davantage, dorénavant, plutôt, bientôt**.', '**En deux mots (ou plus)** : **parce que, tout à coup, tout de suite, tout à fait, à peu près, d’abord, en fait, au revoir, s’il vous plaît, bien sûr**. **En un mot** : **quelquefois, longtemps, autrefois, toujours, beaucoup, aujourd’hui, davantage, dorénavant, plutôt, bientôt**.')),
      trap(b('plutôt / plus tôt', 'plutôt / plus tôt'), b('**plutôt** = rather: **Je préfère plutôt le thé.** **plus tôt** = earlier (opposite: plus tard): **Viens plus tôt demain.**', '**plutôt** = de préférence : **Je préfère plutôt le thé.** **plus tôt** = contraire de plus tard : **Viens plus tôt demain.**')),
      sort(b('One word or several?', 'Un mot ou plusieurs ?'), [b('one word', 'un mot'), b('several words', 'plusieurs mots')], [['longtemps', 0], ['parce que', 1], ['quelquefois', 0], ['tout à coup', 1], ['davantage', 0], ['bien sûr', 1]]),
      gap(P.complete, 'Je suis parti ___ que j’étais fatigué, mais demain je viendrai ___ , vers huit heures.', [['parce', 'alors'], 'plus tôt'], { strict: true }),
      mc(P.spelling, ['Il est arrivé tout à coup.', 'Il est arrivé toutacoup.', 'Il est arrivé tout-à-coup.', 'Il est arrivé tous à coup.']),
      dict('Autrefois, je venais quelquefois ici ; maintenant, je préfère plutôt rester longtemps à la maison.', { strict: true }),
    ],
    [
      b('Two words: parce que, tout à coup, tout de suite, bien sûr.', 'Deux mots : parce que, tout à coup, tout de suite, bien sûr.'),
      b('One word: quelquefois, longtemps, autrefois, davantage.', 'Un mot : quelquefois, longtemps, autrefois, davantage.'),
      b('plutôt (rather) / plus tôt (earlier).', 'plutôt (de préférence) / plus tôt (contraire de plus tard).'),
    ],
    [['davantage', b('more', 'plus')], ['dorénavant', b('from now on', 'à partir de maintenant')], ['autrefois', b('in the past', 'dans le passé')]],
  ),
  lesson(C, 3, ['silent-letters-and-accents', 'lettres-muettes-et-accents'],
    b('Silent letters and accents in frequent words', 'Lettres muettes et accents des mots fréquents'),
    b('Remember the hidden letters and the accents of everyday words.', 'Retenir les lettres cachées et les accents des mots du quotidien.'),
    [b('Remember silent letters', 'Retenir les lettres muettes'), b('Place accents on frequent words', 'Placer les accents des mots fréquents'), b('Proofread a message', 'Relire un message')],
    13,
    [
      card(b('Hidden letters', 'Les lettres cachées'), b('Use **word families** to find silent letters: **long → longue, longtemps** (g); **temps → temporaire** (p); **grand → grande** (d); **beaucoup** (p, like coup); **toujours** (s); **malgré** (é); **déjà** (é, à); **voilà** (à); **très** (è); **après** (è); **où** (ù, place) / **ou** (or).', 'Utilisez les **familles de mots** pour trouver les lettres muettes : **long → longue, longtemps** (g) ; **temps → temporaire** (p) ; **grand → grande** (d) ; **beaucoup** (p, comme coup) ; **toujours** (s) ; **malgré** (é) ; **déjà** (é, à) ; **voilà** (à) ; **très** (è) ; **après** (è) ; **où** (lieu) / **ou** (ou bien).')),
      mc(P.spelling, ['Merci beaucoup, à très bientôt !', 'Merci beaucou, à tres bientot !', 'Merci boucoup, a très bientôt !', 'Merci beaucoups, à trés bientôt !']),
      mc(P.spelling, ['J’ai déjà fini, voilà !', 'J’ai deja fini, voila !', 'J’ai déja fini, voilà !', 'J’ai dejà fini, voila !']),
      doc({ look: 'sms', text: 'Salut ! Je suis deja la-bas, mais je pars bientot. Ou es-tu ? Tu viens quand meme ? Merci beaucou !' }, b('How many spelling mistakes are there in this message?', 'Combien de fautes d’orthographe y a-t-il dans ce message ?'), [b('six: déjà, là-bas, bientôt, Où, même, beaucoup', 'six : déjà, là-bas, bientôt, Où, même, beaucoup'), b('two', 'deux'), b('none', 'aucune'), b('ten', 'dix')]),
      gap(P.complete, 'Il est ___ en retard ! ___ es-tu ? Je t’attends ___ longtemps.', [['toujours', 'encore', 'déjà'], 'Où', 'depuis'], { strict: true }),
      dict('Malgré la pluie, je t’ai attendu longtemps ; où étais-tu ? Merci beaucoup quand même.', { strict: true }),
    ],
    [
      b('Use families: long → longtemps; temps → temporaire.', 'Utilisez les familles : long → longtemps ; temps → temporaire.'),
      b('Accents to remember: déjà, voilà, très, après, malgré, où.', 'Accents à retenir : déjà, voilà, très, après, malgré, où.'),
      b('Proofread every message: accents and silent letters first.', 'Relisez chaque message : accents et lettres muettes d’abord.'),
    ],
    [['malgré', b('despite', 'en dépit de')], ['quand même', b('anyway, still', 'malgré tout')], ['temporaire', b('temporary', 'pour un temps')]],
  ),
];
