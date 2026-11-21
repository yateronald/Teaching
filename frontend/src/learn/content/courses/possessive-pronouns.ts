import type { CourseAbout } from '../../types';
import { b, card, dict, dlg, gap, lesson, mc, ord, P, pairs, say, sort, tip, trap } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'C’est le mien. Ta voiture est plus récente que la mienne. Possessive pronouns replace a possessive + noun and make comparisons and discussions fluent. This course teaches the full table (le mien, la tienne, les siens, le nôtre, les leurs), the circumflex that distinguishes le nôtre from notre, the contractions au mien and du sien, and the everyday alternatives à moi, à toi.',
    'C’est le mien. Ta voiture est plus récente que la mienne. Les pronoms possessifs remplacent un possessif + nom et rendent les comparaisons et les échanges plus fluides. Ce cours présente le tableau complet (le mien, la tienne, les siens, le nôtre, les leurs), l’accent circonflexe qui distingue le nôtre de notre, les contractions au mien et du sien, et les alternatives courantes à moi, à toi.',
  ),
  outcomes: [
    b('Use le mien, le tien, le sien and their forms', 'Employer le mien, le tien, le sien et leurs formes'),
    b('Use le nôtre, le vôtre, le leur with the accent', 'Employer le nôtre, le vôtre, le leur avec l’accent'),
    b('Contract with à and de: au mien, du sien', 'Contracter avec à et de : au mien, du sien'),
    b('Compare your situation with someone else’s', 'Comparer sa situation avec celle d’un autre'),
  ],
};

const C = 'possessive-pronouns';
export default [
  lesson(C, 1, ['le-mien-le-tien-le-sien', 'le-mien-le-tien-le-sien'],
    b('Le mien, le tien, le sien', 'Le mien, le tien, le sien'),
    b('Replace mon / ton / son + noun with a possessive pronoun.', 'Remplacer mon / ton / son + nom par un pronom possessif.'),
    [b('Learn the forms for one owner', 'Retenir les formes pour un possesseur'), b('Agree with the thing owned', 'Accorder avec l’objet possédé'), b('Use them to compare', 'Les employer pour comparer')],
    13,
    [
      card(b('One owner', 'Un seul possesseur'), b('The pronoun agrees with the **thing owned**: **le mien / la mienne / les miens / les miennes**, same pattern for **tien** and **sien**. **C’est ton stylo ? – Non, le mien est bleu.**', 'Le pronom s’accorde avec la **chose possédée** : **le mien / la mienne / les miens / les miennes**, de même pour **tien** et **sien**. **C’est ton stylo ? – Non, le mien est bleu.**'), {
        table: { head: ['', b('m. sing.', 'm. sing.'), b('f. sing.', 'f. sing.'), b('m. pl.', 'm. pl.'), b('f. pl.', 'f. pl.')], rows: [['je', 'le mien', 'la mienne', 'les miens', 'les miennes'], ['tu', 'le tien', 'la tienne', 'les tiens', 'les tiennes'], ['il / elle', 'le sien', 'la sienne', 'les siens', 'les siennes']] },
        ex: [['Ma voiture est en panne, je peux prendre la tienne ?', 'My car has broken down, can I take yours?'], ['Ses enfants et les miens sont à la même école.', 'His children and mine go to the same school.']],
      }),
      mc(P.word, ['la mienne', 'le mien', 'les miens', 'la mien'], { fr: 'Ta maison est grande, ___ est toute petite.' }),
      mc(P.word, ['les siens', 'les siennes', 'le sien', 'les leurs'], { fr: 'Paul ne trouve pas ses gants : il a perdu ___.' }),
      sort(b('Which pronoun?', 'Quel pronom ?'), ['le mien', 'la mienne', 'les miens', 'les miennes'], [['mon passeport', 0], ['ma valise', 1], ['mes bagages', 2], ['mes clés', 3], ['mon idée ?', 1], ['mes amis', 2]]),
      gap(P.complete, 'Ton chien est calme, ___ aboie tout le temps !', [['le mien']]),
      ord(P.order, 'Ce n’est pas ton parapluie, c’est le sien.', { tr: 'It’s not your umbrella, it’s his / hers.' }),
      say('Ton téléphone est plus récent que le mien.', 'Your phone is newer than mine.'),
    ],
    [
      b('le mien, la mienne, les miens, les miennes (same for tien, sien).', 'le mien, la mienne, les miens, les miennes (de même pour tien, sien).'),
      b('Agreement with the thing owned, not the owner.', 'Accord avec l’objet possédé, pas avec le possesseur.'),
      b('mon idée → la mienne (idée is feminine).', 'mon idée → la mienne (idée est féminin).'),
    ],
    [['aboyer', b('to bark', 'crier, pour un chien')], ['prêter', b('to lend', 'donner pour un temps')], ['récent', b('recent, new', 'nouveau')]],
  ),
  lesson(C, 2, ['le-notre-le-votre-le-leur', 'le-notre-le-votre-le-leur'],
    b('Le nôtre, le vôtre, le leur', 'Le nôtre, le vôtre, le leur'),
    b('Use the pronouns for several owners and their circumflex accent.', 'Employer les pronoms de plusieurs possesseurs et leur accent circonflexe.'),
    [b('Learn le nôtre / le vôtre / le leur', 'Retenir le nôtre / le vôtre / le leur'), b('Distinguish notre and le nôtre', 'Distinguer notre et le nôtre'), b('Hear the open and closed o', 'Entendre le o ouvert et fermé')],
    13,
    [
      card(b('Several owners', 'Plusieurs possesseurs'), b('**le nôtre / la nôtre / les nôtres**, **le vôtre / la vôtre / les vôtres**, **le leur / la leur / les leurs**. The pronoun takes a **circumflex**: **notre maison** (adjective) / **la nôtre** (pronoun), and its o is closed [o].', '**le nôtre / la nôtre / les nôtres**, **le vôtre / la vôtre / les vôtres**, **le leur / la leur / les leurs**. Le pronom prend un **accent circonflexe** : **notre maison** (déterminant) / **la nôtre** (pronom), avec un o fermé [o].'), {
        ex: [['Votre jardin est plus grand que le nôtre.', 'Your garden is bigger than ours.'], ['Ce ne sont pas nos valises, ce sont les leurs.', 'They’re not our suitcases, they’re theirs.']],
      }),
      trap(b('Notre or nôtre?', 'Notre ou nôtre ?'), b('With a noun: **notre, votre** (no accent). Alone with an article: **le nôtre, la vôtre** (accent).', 'Devant un nom : **notre, votre** (sans accent). Seul avec un article : **le nôtre, la vôtre** (avec accent).')),
      mc(P.spelling, ['la nôtre', 'la notre', 'le nôtre', 'notre'], { fr: 'Leur voiture est électrique, ___ roule à l’essence.' }),
      mc(P.spelling, ['votre', 'vôtre', 'le vôtre', 'la vôtre'], { fr: 'Voici ___ chambre, madame.' }),
      mc(P.word, ['les leurs', 'leurs', 'les leur', 'les siens'], { fr: 'Nos enfants jouent avec ___.' }),
      gap(P.complete, 'Notre équipe a gagné, mais ___ ___ a très bien joué aussi.', ['la', 'vôtre'], { strict: true }),
      dlg(b('Comparing neighbourhoods', 'Comparer les quartiers'), undefined, [['Voisin', 'm'], ['Vous', 'f']], [
        [0, 'Votre quartier est calme ?', 'Is your neighbourhood quiet?'],
        [1, { options: ['Oui, très. Et le vôtre ?', 'Oui, très. Et votre ?', 'Oui, très. Et le votre de vous ?'] }],
        [0, 'Le nôtre est plus animé, il y a beaucoup de restaurants.', 'Ours is livelier, there are lots of restaurants.'],
        [1, { options: ['Vous avez de la chance ! Chez nous, il n’y en a aucun.', 'Vous avez de la chance ! Le notre n’a rien.', 'Vous avez de la chance ! Les nôtres a rien.'] }],
      ]),
      dict('Leur appartement est plus grand, mais le nôtre est plus lumineux.', { voice: 'm', strict: true }),
    ],
    [
      b('le nôtre, le vôtre (accent, closed o) ≠ notre, votre + noun.', 'le nôtre, le vôtre (accent, o fermé) ≠ notre, votre + nom.'),
      b('le leur, la leur, les leurs.', 'le leur, la leur, les leurs.'),
      b('Plural: les nôtres, les vôtres, les leurs.', 'Pluriel : les nôtres, les vôtres, les leurs.'),
    ],
    [['animé', b('lively', 'plein de vie')], ['lumineux', b('bright, full of light', 'plein de lumière')], ['l’essence', b('petrol, gas', 'carburant')]],
  ),
  lesson(C, 3, ['au-mien-du-sien', 'au-mien-du-sien'],
    b('Au mien, du sien, and à moi', 'Au mien, du sien, et à moi'),
    b('Contract the article with à and de, and choose between le mien and à moi.', 'Contracter l’article avec à et de, et choisir entre le mien et à moi.'),
    [b('Contract à + le mien = au mien', 'Contracter à + le mien = au mien'), b('Contract de + le sien = du sien', 'Contracter de + le sien = du sien'), b('Choose c’est le mien or c’est à moi', 'Choisir c’est le mien ou c’est à moi')],
    13,
    [
      card(b('Contractions', 'Les contractions'), b('The article **le / les** contracts with **à** and **de**: **à + le mien = au mien**, **à + les leurs = aux leurs**, **de + le sien = du sien**, **de + les nôtres = des nôtres**.', 'L’article **le / les** se contracte avec **à** et **de** : **à + le mien = au mien**, **à + les leurs = aux leurs**, **de + le sien = du sien**, **de + les nôtres = des nôtres**.'), {
        ex: [['Je pense à mon projet et toi au tien.', 'I’m thinking about my project and you about yours.'], ['Il parle de ses enfants, et elle des siens.', 'He talks about his children, and she about hers.'], ['Tu seras des nôtres ?', 'Will you join us?']],
      }),
      tip(b('C’est le mien or c’est à moi?', 'C’est le mien ou c’est à moi ?'), b('To say who owns something, everyday French prefers **c’est à moi / à toi / à elle**. **Le mien** is used to compare or to avoid repeating: **Ton vélo est rouge, le mien est noir.**', 'Pour dire à qui appartient un objet, le français courant préfère **c’est à moi / à toi / à elle**. **Le mien** sert à comparer ou à éviter une répétition : **Ton vélo est rouge, le mien est noir.**')),
      mc(P.word, ['aux miens', 'à les miens', 'au mien', 'des miens'], { fr: 'Elle téléphone à ses parents, et moi ___.' }),
      mc(P.word, ['du sien', 'de le sien', 'au sien', 'de sien'], { fr: 'Je m’occupe de mon jardin, et mon voisin s’occupe ___.' }),
      mc(P.best, ['Oui, c’est à moi, merci !', 'Oui, c’est mien, merci !', 'Oui, c’est le moi, merci !', 'Oui, c’est à le mien !'], { fr: '— Ce sac, c’est à vous ?' }),
      pairs(P.match, [['être des nôtres', b('to join us', 'participer avec nous')], ['à la vôtre !', b('cheers! (to your health)', 'formule pour trinquer')], ['y mettre du sien', b('to do one’s bit', 'faire des efforts')], ['chacun le sien', b('to each his own', 'chacun ce qui lui revient')]]),
      gap(P.complete, 'Pense à ton avenir, je pense ___ ___.', ['au', 'mien']),
      say('Merci pour l’invitation, je serai des vôtres samedi !', 'Thanks for the invitation, I’ll join you on Saturday!'),
    ],
    [
      b('au mien, aux leurs, du sien, des nôtres.', 'au mien, aux leurs, du sien, des nôtres.'),
      b('Ownership in speech: C’est à moi / à toi / à lui.', 'Appartenance à l’oral : C’est à moi / à toi / à lui.'),
      b('Expressions: À la vôtre ! Tu seras des nôtres ? Il faut y mettre du sien.', 'Expressions : À la vôtre ! Tu seras des nôtres ? Il faut y mettre du sien.'),
    ],
    [['s’occuper de', b('to take care of', 'prendre soin de')], ['trinquer', b('to clink glasses', 'boire à la santé de quelqu’un')], ['l’avenir', b('the future', 'le futur')]],
  ),
];
