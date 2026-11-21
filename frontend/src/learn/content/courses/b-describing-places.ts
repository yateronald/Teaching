import type { CourseAbout } from '../../types';
import { b, card, culture, dict, dlg, gap, hear, lesson, mc, ord, P, say, sort, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Where do you live? Is it a big city or a small village? Quiet or lively? This beginner course teaches you to describe your city and neighbourhood with adjectives (grand, petit, calme, animé, moderne, ancien), with il y a and il n’y a pas de, and to compare where you live now with where you come from. Very useful for first conversations and for the DELF A1/A2 oral.',
    'Où habitez-vous ? Une grande ville ou un petit village ? Calme ou animé ? Ce cours pour débutants vous apprend à décrire votre ville et votre quartier avec des adjectifs (grand, petit, calme, animé, moderne, ancien), avec il y a et il n’y a pas de, et à comparer votre lieu de vie actuel avec votre lieu d’origine. Très utile pour les premières conversations et pour l’oral du DELF A1/A2.',
  ),
  outcomes: [
    b('Describe a city with adjectives', 'Décrire une ville avec des adjectifs'),
    b('Use il y a / il n’y a pas de', 'Employer il y a / il n’y a pas de'),
    b('Talk about your neighbourhood', 'Parler de son quartier'),
    b('Compare two places', 'Comparer deux lieux'),
  ],
};

const C = 'b-describing-places';
export default [
  lesson(C, 1, ['my-city', 'ma-ville'],
    b('My city', 'Ma ville'),
    b('Say where you live and describe your city with adjectives.', 'Dire où l’on habite et décrire sa ville avec des adjectifs.'),
    [b('Say where you live', 'Dire où l’on habite'), b('Describe with adjectives', 'Décrire avec des adjectifs'), b('Agree adjectives with ville (feminine)', 'Accorder les adjectifs avec ville (féminin)')],
    13,
    [
      card(b('Describing a city', 'Décrire une ville'), b('**J’habite à Lyon. C’est une grande ville, très animée.** Adjectives: **grand(e), petit(e), calme, animé(e), moderne, ancien(ne), joli(e), touristique, propre, bruyant(e), cher / chère**. Remember: **une ville** is feminine → **une ville animée, une petite ville**; **un village** → **un petit village calme**.', '**J’habite à Lyon. C’est une grande ville, très animée.** Adjectifs : **grand(e), petit(e), calme, animé(e), moderne, ancien(ne), joli(e), touristique, propre, bruyant(e), cher / chère**. Attention : **une ville** est féminin → **une ville animée, une petite ville** ; **un village** → **un petit village calme**.'), {
        ex: [['J’habite à Québec. C’est une jolie ville ancienne.', 'I live in Québec City. It’s a pretty old town.'], ['Mon village est petit et très calme.', 'My village is small and very quiet.']],
      }),
      sort(b('Positive or negative for most people?', 'Positif ou négatif pour la plupart des gens ?'), [b('positive', 'positif'), b('negative', 'négatif')], [['propre', 0], ['bruyant', 1], ['joli', 0], ['sale', 1], ['calme', 0], ['trop cher', 1]]),
      gap(P.complete, 'J’habite à Montréal. C’est une ___ (grand) ville très ___ (animé).', ['grande', 'animée']),
      mc(P.form, ['C’est une ville ancienne et touristique.', 'C’est une ville ancien et touristique.', 'C’est un ville ancienne et touristique.', 'C’est une ville anciens et touristiques.']),
      hear('J’habite à Annecy, dans les Alpes. C’est une petite ville très jolie, avec un lac magnifique, mais c’est assez cher.', b('What is the negative point?', 'Quel est le point négatif ?'), [b('it is quite expensive', 'c’est assez cher'), b('it is noisy', 'c’est bruyant'), b('it is ugly', 'c’est laid'), b('there is no lake', 'il n’y a pas de lac')], { voice: 'f' }),
      say('J’habite à Lyon. C’est une grande ville, très animée et assez moderne.', 'I live in Lyon. It’s a big city, very lively and quite modern.'),
    ],
    [
      b('J’habite à + city. C’est une ville… / un village…', 'J’habite à + ville. C’est une ville… / un village…'),
      b('Adjectives: grand, petit, calme, animé, ancien, moderne, joli.', 'Adjectifs : grand, petit, calme, animé, ancien, moderne, joli.'),
      b('ville = feminine: une grande ville animée.', 'ville = féminin : une grande ville animée.'),
    ],
    [['animé', b('lively', 'plein de vie')], ['bruyant', b('noisy', 'qui fait du bruit')], ['ancien', b('old, historic', 'qui date d’avant')]],
  ),
  lesson(C, 2, ['my-neighbourhood', 'mon-quartier'],
    b('My neighbourhood', 'Mon quartier'),
    b('Say what there is and isn’t in your neighbourhood.', 'Dire ce qu’il y a et ce qu’il n’y a pas dans son quartier.'),
    [b('Use il y a + places', 'Employer il y a + lieux'), b('Use il n’y a pas de', 'Employer il n’y a pas de'), b('Say what you like about it', 'Dire ce qu’on aime dans son quartier')],
    13,
    [
      card(b('Il y a / il n’y a pas de', 'Il y a / il n’y a pas de'), b('**Dans mon quartier, il y a une boulangerie, un parc, deux écoles et beaucoup de cafés.** Negative: **Il n’y a pas de cinéma. · Il n’y a pas d’hôpital.** (un, une, des → **de / d’**). Places: **une boulangerie, une pharmacie, un supermarché, un marché, une bibliothèque, une station de métro, un arrêt de bus**.', '**Dans mon quartier, il y a une boulangerie, un parc, deux écoles et beaucoup de cafés.** Négation : **Il n’y a pas de cinéma. · Il n’y a pas d’hôpital.** (un, une, des → **de / d’**). Lieux : **une boulangerie, une pharmacie, un supermarché, un marché, une bibliothèque, une station de métro, un arrêt de bus**.')),
      mc(P.form, ['Il n’y a pas de piscine dans mon quartier.', 'Il n’y a pas une piscine dans mon quartier.', 'Il y a pas piscine dans mon quartier.', 'Il n’y a pas des piscines dans mon quartier.']),
      gap(P.complete, 'Dans mon quartier, il y a ___ parc, mais il n’y a pas ___ cinéma.', ['un', 'de']),
      dlg(b('Talking about neighbourhoods', 'Parler du quartier'), undefined, [['Amira', 'f'], ['Vous', 'm']], [
        [0, 'Il est comment, ton quartier ?', 'What’s your neighbourhood like?'],
        [1, { options: ['Il est calme. Il y a un grand parc et une boulangerie, mais il n’y a pas de métro.', 'Il est quartier.', 'Il y a pas de rien.'] }],
        [0, 'Ah, et pour aller au travail ?', 'Oh, and to get to work?'],
        [1, { options: ['Je prends le bus, l’arrêt est juste à côté.', 'Je ne sais pas.', 'Il n’y a pas de travail.'] }],
      ]),
      ord(P.order, 'Il y a beaucoup de cafés et une jolie bibliothèque.', { tr: 'There are lots of cafés and a pretty library.' }),
      say('Dans mon quartier, il y a un parc et une boulangerie, mais il n’y a pas de cinéma.', 'In my neighbourhood there is a park and a bakery, but there is no cinema.'),
    ],
    [
      b('Il y a un / une / des…', 'Il y a un / une / des…'),
      b('Il n’y a pas de / d’…', 'Il n’y a pas de / d’…'),
      b('Places: boulangerie, pharmacie, parc, bibliothèque, arrêt de bus.', 'Lieux : boulangerie, pharmacie, parc, bibliothèque, arrêt de bus.'),
    ],
    [['un quartier', b('a neighbourhood', 'partie de la ville')], ['une bibliothèque', b('a library', 'lieu des livres')], ['un arrêt de bus', b('a bus stop', 'où le bus s’arrête')]],
  ),
  lesson(C, 3, ['comparing-places', 'comparer-deux-lieux'],
    b('Comparing two places', 'Comparer deux lieux'),
    b('Compare where you live now with where you come from.', 'Comparer votre lieu de vie actuel avec votre lieu d’origine.'),
    [b('Use plus… que, moins… que, aussi… que', 'Employer plus… que, moins… que, aussi… que'), b('Use meilleur / pire', 'Employer meilleur / pire'), b('Express a preference', 'Exprimer une préférence')],
    13,
    [
      card(b('Comparing', 'Comparer'), b('**Montréal est plus grande que ma ville natale.** · **Ici, la vie est moins chère qu’à Paris.** · **L’hiver est aussi long qu’en Russie.** · **Le climat est meilleur ici.** · **Je préfère vivre ici parce que c’est plus calme.** Before a vowel: **qu’à, qu’en, qu’ici**.', '**Montréal est plus grande que ma ville natale.** · **Ici, la vie est moins chère qu’à Paris.** · **L’hiver est aussi long qu’en Russie.** · **Le climat est meilleur ici.** · **Je préfère vivre ici parce que c’est plus calme.** Devant une voyelle : **qu’à, qu’en, qu’ici**.')),
      mc(P.form, ['Lyon est plus petite que Paris.', 'Lyon est plus petite de Paris.', 'Lyon est plus petit que Paris.', 'Lyon est la plus petite que Paris.']),
      culture(b('Ma ville natale', 'Ma ville natale'), b('Talking about **where you come from** is a classic first-conversation topic in France and Québec: **Tu viens d’où ? · C’est comment, là-bas ?** People are usually curious and happy to hear comparisons, as long as they are friendly.', 'Parler de **son lieu d’origine** est un sujet classique des premières conversations en France et au Québec : **Tu viens d’où ? · C’est comment, là-bas ?** Les gens sont généralement curieux et contents d’entendre des comparaisons, tant qu’elles sont bienveillantes.'), { variant: 'culture' }),
      gap(P.complete, 'Ici, la vie est ___ chère ___ dans ma ville natale, mais l’hiver est plus froid.', ['moins', 'que']),
      dict('Montréal est plus grande que ma ville natale, mais la vie y est moins chère qu’à Paris.', {}),
      write(b('Two places', 'Deux lieux'), b('Compare where you live now with where you come from (30–50 words). Use at least two comparisons and say which you prefer.', 'Comparez votre lieu de vie actuel et votre lieu d’origine (30–50 mots). Utilisez au moins deux comparaisons et dites ce que vous préférez.'), 30, 50, [
        b('At least two comparisons', 'Au moins deux comparaisons'),
        b('il y a / il n’y a pas de', 'il y a / il n’y a pas de'),
        b('A preference with parce que', 'Une préférence avec parce que'),
      ], 'Je viens de Dakar et j’habite maintenant à Québec. Québec est plus petite et beaucoup plus froide que Dakar ! Il y a moins de bruit, et la ville est très propre. Je préfère vivre ici parce que c’est plus calme, mais la mer me manque.'),
    ],
    [
      b('plus / moins / aussi + adjective + que.', 'plus / moins / aussi + adjectif + que.'),
      b('bon → meilleur; que + vowel → qu’.', 'bon → meilleur ; que + voyelle → qu’.'),
      b('Je préfère… parce que…', 'Je préfère… parce que…'),
    ],
    [['natal', b('native, of birth', 'où l’on est né')], ['le climat', b('the climate', 'temps habituel')], ['manquer (à qqn)', b('to be missed (by someone)', 'on regrette son absence')]],
  ),
];
