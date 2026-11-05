import { b, type Lesson } from '../../types';
import { card, pick } from '../kit';

const choose = b('Choose the right answer.', 'Choisissez la bonne réponse.');

const lessons: Lesson[] = [
  {
    id: 'adjectives-comparison-1',
    slug: { en: 'position-of-adjectives', fr: 'la-place-des-adjectifs' },
    title: b('Where adjectives go', 'La place des adjectifs'),
    summary: b('Most adjectives follow the noun; a short list comes before. Learn beau, nouveau, vieux.', 'La plupart des adjectifs suivent le nom ; une petite liste se place avant. Apprenez beau, nouveau, vieux.'),
    objectives: [b('Place adjectives after the noun', 'Placer les adjectifs après le nom'), b('Know the BAGS adjectives that go before', 'Connaître les adjectifs qui se placent avant'), b('Use bel, nouvel, vieil before a vowel', 'Employer bel, nouvel, vieil devant une voyelle')],
    minutes: 13,
    steps: [
      card(b('After the noun, usually', 'Après le nom, en général'), b('Most adjectives go **after** the noun: une voiture **rouge**, un film **intéressant**, une ville **canadienne**. A short list goes **before**: **beau, joli, bon, mauvais, grand, petit, jeune, vieux, nouveau, gros**: une **petite** maison, un **bon** restaurant.', 'La plupart des adjectifs se placent **après** le nom : une voiture **rouge**, un film **intéressant**. Une petite liste se place **avant** : **beau, joli, bon, mauvais, grand, petit, jeune, vieux, nouveau, gros** : une **petite** maison, un **bon** restaurant.'), {
        examples: [{ fr: 'C’est un bon restaurant italien.', tr: 'It’s a good Italian restaurant.' }, { fr: 'Elle habite dans une petite maison blanche.', tr: 'She lives in a small white house.' }],
      }),
      pick('A2', choose, ['une jolie robe noire', 'une robe jolie noire', 'une noire jolie robe', 'une robe noire jolie'], {}),
      pick('A2', choose, ['un livre intéressant', 'un intéressant livre', 'une livre intéressante', 'un livre intéressante'], {}),
      card(b('Bel, nouvel, vieil', 'Bel, nouvel, vieil'), b('Before a **masculine noun starting with a vowel or h**, three adjectives change: **beau → bel**, **nouveau → nouvel**, **vieux → vieil**: un **bel** appartement, un **nouvel** ami, un **vieil** homme. Feminine: belle, nouvelle, vieille.', 'Devant un **nom masculin commençant par une voyelle ou un h**, trois adjectifs changent : **beau → bel**, **nouveau → nouvel**, **vieux → vieil** : un **bel** appartement, un **nouvel** ami, un **vieil** homme. Féminin : belle, nouvelle, vieille.'), { variant: 'tip' }),
      pick('A2', choose, ['nouvel', 'nouveau', 'nouvelle', 'nouveaux'], { fr: 'J’ai un ___ emploi depuis lundi.' }),
      pick('A2', choose, ['vieille', 'vieux', 'vieil', 'vieilles'], { fr: 'C’est une ___ église.' }),
      { kind: 'fill', prompt: b('Complete.', 'Complétez.'), text: 'Un ___ (beau) hôtel et une ___ (beau) plage.', answers: [['bel'], ['belle']] },
      { kind: 'speak', prompt: b('Say it aloud.', 'Dites-le à voix haute.'), text: 'Nous avons trouvé un bel appartement dans un vieux quartier.', tr: 'We found a beautiful flat in an old neighbourhood.' },
    ],
    notes: {
      points: [
        b('Most adjectives go after the noun: un film intéressant.', 'La plupart des adjectifs suivent le nom : un film intéressant.'),
        b('Before: beau, joli, bon, mauvais, grand, petit, jeune, vieux, nouveau, gros.', 'Avant : beau, joli, bon, mauvais, grand, petit, jeune, vieux, nouveau, gros.'),
        b('Before a vowel (masc.): bel, nouvel, vieil.', 'Devant une voyelle (masc.) : bel, nouvel, vieil.'),
        b('Colours and nationalities always go after.', 'Couleurs et nationalités se placent toujours après.'),
      ],
      vocab: [['le quartier', b('neighbourhood', 'partie de la ville')], ['l’emploi (m.)', b('job', 'travail')], ['gros', b('big, fat', 'volumineux')]],
    },
  },
  {
    id: 'adjectives-comparison-2',
    slug: { en: 'comparatives', fr: 'le-comparatif' },
    title: b('Comparing: plus, moins, aussi', 'Comparer : plus, moins, aussi'),
    summary: b('Compare people and things with plus… que, moins… que, aussi… que, and know meilleur and mieux.', 'Comparer avec plus… que, moins… que, aussi… que, et connaître meilleur et mieux.'),
    objectives: [b('Use the three comparatives', 'Employer les trois comparatifs'), b('Use meilleur (adjective) and mieux (adverb)', 'Employer meilleur (adjectif) et mieux (adverbe)'), b('Compare quantities: plus de, moins de', 'Comparer des quantités : plus de, moins de')],
    minutes: 13,
    steps: [
      card(b('Plus, moins, aussi', 'Plus, moins, aussi'), b('**plus** + adjective + **que** (more … than), **moins** + adjective + **que** (less … than), **aussi** + adjective + **que** (as … as). The adjective agrees: Montréal est **plus grande que** Québec. Ma sœur est **aussi grande que** moi.', '**plus** + adjectif + **que**, **moins** + adjectif + **que**, **aussi** + adjectif + **que**. L’adjectif s’accorde : Montréal est **plus grande que** Québec. Ma sœur est **aussi grande que** moi.'), {
        examples: [{ fr: 'Le train est plus rapide que l’autobus.', tr: 'The train is faster than the bus.' }, { fr: 'Cet appartement est moins cher que l’autre.', tr: 'This flat is cheaper than the other one.' }, { fr: 'Il est aussi drôle que son père.', tr: 'He is as funny as his father.' }],
      }),
      pick('A2', choose, ['plus chaud qu’', 'plus chaud que', 'chaud plus qu’', 'plus de chaud qu’'], { fr: 'En juillet, il fait ___ en avril.' }),
      card(b('Meilleur or mieux?', 'Meilleur ou mieux ?'), b('Never “plus bon” or “plus bien”. **Bon** (adjective, with a noun) → **meilleur(e)**: Ce café est **meilleur**. **Bien** (adverb, with a verb) → **mieux**: Elle chante **mieux** que moi.', 'Jamais « plus bon » ni « plus bien ». **Bon** (adjectif, avec un nom) → **meilleur(e)** : Ce café est **meilleur**. **Bien** (adverbe, avec un verbe) → **mieux** : Elle chante **mieux** que moi.'), { variant: 'trap' }),
      pick('A2', choose, ['meilleure', 'mieux', 'plus bonne', 'meilleur'], { fr: 'Cette pizza est ___ que l’autre.' }),
      pick('A2', choose, ['mieux', 'meilleur', 'plus bien', 'meilleure'], { fr: 'Tu parles ___ français que l’an dernier !' }),
      pick('A2', choose, ['plus de', 'plus', 'plus que', 'de plus'], { fr: 'Il y a ___ neige à Québec qu’à Toronto.', explain: b('With a noun: plus de / moins de / autant de.', 'Avec un nom : plus de / moins de / autant de.') }),
      { kind: 'fill', prompt: b('Complete the comparison.', 'Complétez la comparaison.'), text: 'Le métro est ___ rapide ___ la voiture aux heures de pointe.', answers: [['plus'], ['que']] },
      { kind: 'speak', prompt: b('Say it aloud.', 'Dites-le à voix haute.'), text: 'Mon nouveau travail est mieux payé et moins stressant que l’ancien.', tr: 'My new job is better paid and less stressful than the old one.' },
    ],
    notes: {
      points: [
        b('plus / moins / aussi + adjective + que.', 'plus / moins / aussi + adjectif + que.'),
        b('bon → meilleur (adjective); bien → mieux (adverb).', 'bon → meilleur (adjectif) ; bien → mieux (adverbe).'),
        b('With nouns: plus de, moins de, autant de + noun.', 'Avec un nom : plus de, moins de, autant de + nom.'),
        b('que → qu’ before a vowel.', 'que → qu’ devant une voyelle.'),
      ],
      vocab: [['rapide', b('fast', 'qui va vite')], ['cher', b('expensive', 'qui coûte beaucoup')], ['autant de', b('as much / many', 'la même quantité de')], ['l’ancien', b('the former one', 'celui d’avant')]],
    },
  },
  {
    id: 'adjectives-comparison-3',
    slug: { en: 'superlatives', fr: 'le-superlatif' },
    title: b('The superlative: le plus, le moins', 'Le superlatif : le plus, le moins'),
    summary: b('Say the best, the biggest, the least expensive, and use de after the superlative.', 'Dire le meilleur, le plus grand, le moins cher, et employer de après le superlatif.'),
    objectives: [b('Form the superlative with le / la / les plus', 'Former le superlatif avec le / la / les plus'), b('Use le meilleur and le mieux', 'Employer le meilleur et le mieux'), b('Use de after a superlative', 'Employer de après un superlatif')],
    minutes: 13,
    steps: [
      card(b('Le plus, le moins', 'Le plus, le moins'), b('**le / la / les + plus / moins + adjective**: C’est **la plus belle** ville. The scope uses **de**: C’est la plus grande ville **du** Canada. If the adjective goes after the noun, repeat the article: la ville **la plus** chère.', '**le / la / les + plus / moins + adjectif** : C’est **la plus belle** ville. Le cadre s’exprime avec **de** : C’est la plus grande ville **du** Canada. Si l’adjectif suit le nom, on répète l’article : la ville **la plus** chère.'), {
        examples: [{ fr: 'Toronto est la plus grande ville du Canada.', tr: 'Toronto is the biggest city in Canada.' }, { fr: 'C’est le restaurant le moins cher du quartier.', tr: 'It’s the cheapest restaurant in the neighbourhood.' }],
      }),
      pick('B1', choose, ['du', 'dans le', 'en', 'au'], { fr: 'Le Saint-Laurent est l’un des plus longs fleuves ___ monde.' }),
      pick('B1', choose, ['la plus chère', 'plus chère', 'la plus cher', 'le plus chère'], { fr: 'C’est la robe ___ du magasin.' }),
      card(b('The best', 'Le meilleur, le mieux'), b('**le meilleur / la meilleure** (adjective): C’est **le meilleur** café de la ville. **le mieux** (adverb): C’est elle qui chante **le mieux**. **Le pire** = the worst.', '**le meilleur / la meilleure** (adjectif) : C’est **le meilleur** café de la ville. **le mieux** (adverbe) : C’est elle qui chante **le mieux**. **Le pire** = le plus mauvais.'), { variant: 'tip' }),
      pick('B1', choose, ['la meilleure', 'la mieux', 'la plus bonne', 'le meilleur'], { fr: 'C’est ___ boulangerie du quartier.' }),
      pick('B1', choose, ['le mieux', 'le meilleur', 'la meilleure', 'mieux que'], { fr: 'De tous les élèves, c’est Amir qui parle ___.' }),
      { kind: 'fill', prompt: b('Complete.', 'Complétez.'), text: 'C’est le jour ___ plus froid ___ l’année.', answers: [['le'], ['de']] },
      { kind: 'speak', prompt: b('Say it aloud.', 'Dites-le à voix haute.'), text: 'C’est le meilleur café de la ville, et le moins cher !', tr: 'It’s the best coffee in town, and the cheapest!' },
    ],
    notes: {
      points: [
        b('le / la / les + plus / moins + adjective (+ de + scope).', 'le / la / les + plus / moins + adjectif (+ de + cadre).'),
        b('After the noun: la ville la plus chère (article repeated).', 'Après le nom : la ville la plus chère (article répété).'),
        b('le meilleur (adjective), le mieux (adverb), le pire (the worst).', 'le meilleur (adjectif), le mieux (adverbe), le pire.'),
        b('Scope with de: du Canada, de la ville, du monde.', 'Cadre avec de : du Canada, de la ville, du monde.'),
      ],
      vocab: [['le fleuve', b('river', 'grande rivière')], ['le pire', b('the worst', 'le plus mauvais')], ['l’élève', b('pupil, student', 'personne qui apprend')]],
    },
  },
];

export default lessons;
