import type { CourseAbout } from '../../types';
import { b, card, dict, gap, hear, lesson, mc, P, say, sort, tip } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Vent, vin, vont: three different words that differ only by their nasal vowel. French has three main nasal vowels, [ɑ̃] (an), [ɔ̃] (on) and [ɛ̃] (in), and each has several spellings. This course trains your ear with minimal pairs, shows you how to place your mouth for each one, teaches the many spellings (an, en, am, em / on, om / in, ain, ein, un, im) and the key rule: when does the n come back?',
    'Vent, vin, vont : trois mots différents qui ne se distinguent que par leur voyelle nasale. Le français a trois voyelles nasales principales, [ɑ̃] (an), [ɔ̃] (on) et [ɛ̃] (in), et chacune a plusieurs graphies. Ce cours entraîne votre oreille avec des paires minimales, vous montre comment placer la bouche pour chacune, présente les nombreuses graphies (an, en, am, em / on, om / in, ain, ein, un, im) et la règle clé : quand le n revient-il ?',
  ),
  outcomes: [
    b('Hear the three nasal vowels apart', 'Distinguer à l’oreille les trois voyelles nasales'),
    b('Produce each one with the right mouth shape', 'Produire chacune avec la bonne forme de bouche'),
    b('Recognise their spellings', 'Reconnaître leurs graphies'),
    b('Know when the n is pronounced', 'Savoir quand le n se prononce'),
  ],
};

const W = b('Listen. Which word do you hear?', 'Écoutez. Quel mot entendez-vous ?');
const C = 'p-nasal-vowels';
export default [
  lesson(C, 1, ['an-on-in', 'an-on-in'],
    b('Three nasal vowels: an, on, in', 'Trois voyelles nasales : an, on, in'),
    b('Hear and produce [ɑ̃], [ɔ̃] and [ɛ̃] without pronouncing the n.', 'Entendre et produire [ɑ̃], [ɔ̃] et [ɛ̃] sans prononcer le n.'),
    [b('Hear the three nasal vowels', 'Entendre les trois voyelles nasales'), b('Place the mouth for each', 'Placer la bouche pour chacune'), b('Never pronounce the n', 'Ne jamais prononcer le n')],
    13,
    [
      card(b('Air through the nose', 'L’air passe par le nez'), b('For a nasal vowel, the air goes out through the **mouth and the nose** at the same time, and the **n is not pronounced**: the tongue never touches the palate. **an** [ɑ̃]: mouth wide open, like in « ah ». **on** [ɔ̃]: lips rounded, small circle. **in** [ɛ̃]: lips spread, as for a smile.', 'Pour une voyelle nasale, l’air sort par **la bouche et le nez** en même temps, et **le n ne se prononce pas** : la langue ne touche jamais le palais. **an** [ɑ̃] : bouche grande ouverte, comme dans « ah ». **on** [ɔ̃] : lèvres arrondies, petit cercle. **in** [ɛ̃] : lèvres étirées, comme pour sourire.'), {
        ex: [['le vent, le temps, la France', '[ɑ̃]'], ['le bon pont, ils vont', '[ɔ̃]'], ['le vin, le pain, demain', '[ɛ̃]']],
      }),
      hear('le vent', W, ['le vent', 'le vin', 'ils vont']),
      hear('ils vont', W, ['ils vont', 'le vent', 'le vin'], { voice: 'm' }),
      hear('le vin', W, ['le vin', 'le vent', 'ils vont']),
      sort(b('Listen and sort by sound.', 'Écoutez et classez selon le son.'), [b('an [ɑ̃]', 'an [ɑ̃]'), b('on [ɔ̃]', 'on [ɔ̃]'), b('in [ɛ̃]', 'in [ɛ̃]')], [['blanc', 0], ['long', 1], ['lapin', 2], ['enfant', 0], ['maison', 1], ['jardin', 2]], { listen: true }),
      hear('C’est très lent.', W, ['lent', 'long', 'lin']),
      say('Un bon vin blanc', 'A good white wine', { tip: b('Three nasal vowels in a row: in, on, an, in, an. Never touch the palate with your tongue.', 'Trois voyelles nasales à la suite. La langue ne touche jamais le palais.') }),
    ],
    [
      b('Nasal vowel = air through mouth and nose; the n is silent.', 'Voyelle nasale = air par la bouche et le nez ; le n est muet.'),
      b('an: wide open · on: rounded · in: spread lips.', 'an : grande ouverture · on : arrondi · in : lèvres étirées.'),
      b('Vent / vont / vin are three different words.', 'Vent / vont / vin sont trois mots différents.'),
    ],
    [['le vent', b('the wind', 'air qui souffle')], ['un pont', b('a bridge', 'passage au-dessus de l’eau')], ['un lapin', b('a rabbit', 'petit animal aux longues oreilles')]],
  ),
  lesson(C, 2, ['spellings', 'les-graphies'],
    b('One sound, many spellings', 'Un son, plusieurs graphies'),
    b('Recognise the spellings of each nasal vowel, including m before p and b.', 'Reconnaître les graphies de chaque voyelle nasale, y compris m devant p et b.'),
    [b('Spell [ɑ̃]: an, en, am, em', 'Écrire [ɑ̃] : an, en, am, em'), b('Spell [ɛ̃]: in, ain, ein, im, un', 'Écrire [ɛ̃] : in, ain, ein, im, un'), b('Apply the m before p, b rule', 'Appliquer la règle du m devant p, b')],
    13,
    [
      card(b('The spellings', 'Les graphies'), b('[ɑ̃]: **an, en, am, em** (enfant, temps, chambre). [ɔ̃]: **on, om** (bonbon, nom). [ɛ̃]: **in, ain, ein, im, un, ien** (vin, pain, plein, simple, un, bien). Rule: **m before p and b**: **jambe, tomber, simple, emporter**.', '[ɑ̃] : **an, en, am, em** (enfant, temps, chambre). [ɔ̃] : **on, om** (bonbon, nom). [ɛ̃] : **in, ain, ein, im, un, ien** (vin, pain, plein, simple, un, bien). Règle : **m devant p et b** : **jambe, tomber, simple, emporter**.'), {
        table: { head: [b('sound', 'son'), b('spellings', 'graphies'), b('examples', 'exemples')], rows: [['[ɑ̃]', 'an, en, am, em', 'blanc, vent, lampe, temps'], ['[ɔ̃]', 'on, om', 'pont, nombre'], ['[ɛ̃]', 'in, ain, ein, im, un', 'fin, main, peinture, timbre, lundi']] },
      }),
      tip(b('« un » and « in »', '« un » et « in »'), b('In most of France today, **un** [œ̃] is pronounced like **in** [ɛ̃]: **brun** and **brin** sound alike. Some speakers (and Québec, Belgium, the south of France) keep a distinct, rounder **un**. Both are correct.', 'Dans une grande partie de la France aujourd’hui, **un** [œ̃] se prononce comme **in** [ɛ̃] : **brun** et **brin** se confondent. Certains locuteurs (et le Québec, la Belgique, le sud de la France) gardent un **un** plus arrondi. Les deux sont corrects.')),
      mc(P.spelling, ['la chambre', 'la chanbre', 'la chembre', 'la chombre'], { fr: 'Le son [ɑ̃] devant b :' }),
      gap(P.complete, 'Le matin, je prends du p___ avec de la confiture. Il fait beau, le t___ est magnifique.', ['ain', 'emps']),
      sort(b('Which sound do these spellings make?', 'Quel son font ces graphies ?'), [b('[ɑ̃] (an)', '[ɑ̃] (an)'), b('[ɛ̃] (in)', '[ɛ̃] (in)')], [['enfant', 0], ['peinture', 1], ['tempête', 0], ['simple', 1], ['ambulance', 0], ['demain', 1]]),
      dict('Demain, mon enfant prend le train de onze heures.', { hint: b('Five nasal vowels: listen for an, on, in.', 'Cinq voyelles nasales : écoutez an, on, in.') }),
      say('Mon enfant prend le train demain matin.', 'My child takes the train tomorrow morning.'),
    ],
    [
      b('[ɑ̃] an, en, am, em · [ɔ̃] on, om · [ɛ̃] in, ain, ein, im, un.', '[ɑ̃] an, en, am, em · [ɔ̃] on, om · [ɛ̃] in, ain, ein, im, un.'),
      b('m before p and b: jambe, tomber, simple.', 'm devant p et b : jambe, tomber, simple.'),
      b('un and in often sound the same in France.', 'un et in se confondent souvent en France.'),
    ],
    [['une tempête', b('a storm', 'vent et pluie violents')], ['une jambe', b('a leg', 'partie du corps')], ['un timbre', b('a stamp', 'pour envoyer une lettre')]],
  ),
  lesson(C, 3, ['when-the-n-comes-back', 'quand-le-n-revient'],
    b('When the n comes back', 'Quand le n revient'),
    b('Hear the difference between bon / bonne, an / anne, and nasal vowels before a vowel.', 'Entendre la différence entre bon / bonne, an / anne, et les nasales devant une voyelle.'),
    [b('Denasalise in the feminine', 'Dénasaliser au féminin'), b('Spot double n and n + vowel', 'Repérer nn et n + voyelle'), b('Hear masculine vs feminine', 'Entendre masculin et féminin')],
    13,
    [
      card(b('The rule', 'La règle'), b('A vowel + n is nasal **only if the n is followed by a consonant or ends the word**: **bon, bonté**. If **n is doubled** or **followed by a vowel**, the vowel is oral and the **n is pronounced**: **bonne, bonheur, une, Anne, fine, image**.', 'Une voyelle + n est nasale **seulement si le n est suivi d’une consonne ou termine le mot** : **bon, bonté**. Si **le n est doublé** ou **suivi d’une voyelle**, la voyelle est orale et **le n se prononce** : **bonne, bonheur, une, Anne, fine, image**.'), {
        ex: [['bon / bonne', 'nasal / oral + n'], ['américain / américaine', 'nasal / oral + n'], ['plein / pleine', 'nasal / oral + n']],
      }),
      hear('Camille est italienne.', W, ['italienne', 'italien']),
      hear('Dominique est canadien.', W, ['canadien', 'canadienne'], { voice: 'm' }),
      hear('Claude est américaine.', W, ['américaine', 'américain']),
      sort(b('Nasal vowel or pronounced n?', 'Voyelle nasale ou n prononcé ?'), [b('nasal vowel', 'voyelle nasale'), b('n pronounced', 'n prononcé')], [['un voisin', 0], ['une voisine', 1], ['le matin', 0], ['la semaine', 1], ['un cousin', 0], ['une cousine', 1]], { listen: true }),
      mc(P.choose, [b('The n is followed by a vowel, so it is pronounced.', 'Le n est suivi d’une voyelle, donc il se prononce.'), b('The n is always silent.', 'Le n est toujours muet.'), b('« ine » is a nasal vowel.', '« ine » est une voyelle nasale.'), b('The final e is pronounced.', 'Le e final se prononce.')], { fr: 'Pourquoi entend-on le n dans « voisine » ?' }),
      say('Mon voisin est canadien, ma voisine est italienne.', 'My (male) neighbour is Canadian, my (female) neighbour is Italian.'),
    ],
    [
      b('n + consonant or end of word → nasal vowel (bon).', 'n + consonne ou fin de mot → voyelle nasale (bon).'),
      b('nn or n + vowel → oral vowel + n pronounced (bonne, une).', 'nn ou n + voyelle → voyelle orale + n prononcé (bonne, une).'),
      b('Masculine/feminine often differ by this: voisin / voisine.', 'Masculin et féminin diffèrent souvent ainsi : voisin / voisine.'),
    ],
    [['le bonheur', b('happiness', 'état heureux')], ['un voisin', b('a neighbour', 'personne d’à côté')], ['la bonté', b('kindness', 'qualité d’être bon')]],
  ),
];
