import { b, type Lesson } from '../../types';
import { card, pick } from '../kit';

const choose = b('Choose the right relative pronoun.', 'Choisissez le bon pronom relatif.');

const lessons: Lesson[] = [
  {
    id: 'relative-pronouns-1',
    slug: { en: 'qui-and-que', fr: 'qui-et-que' },
    title: b('Qui and que', 'Qui et que'),
    summary: b('Link two sentences with qui (subject) and que (object), and never confuse them again.', 'Relier deux phrases avec qui (sujet) et que (complément), sans plus jamais les confondre.'),
    objectives: [b('Use qui when a verb follows', 'Employer qui quand un verbe suit'), b('Use que when a subject follows', 'Employer que quand un sujet suit'), b('Elide que but never qui', 'Élider que mais jamais qui')],
    minutes: 13,
    steps: [
      card(b('The quick test', 'Le test rapide'), b('Look at what follows. **qui** + **verb** (qui is the subject): la femme **qui parle**. **que** + **subject + verb** (que is the object): la femme **que je connais**. **Que → qu’** before a vowel; **qui never changes**.', 'Regardez ce qui suit. **qui** + **verbe** (qui est sujet) : la femme **qui parle**. **que** + **sujet + verbe** (que est complément) : la femme **que je connais**. **Que → qu’** devant une voyelle ; **qui ne change jamais**.'), {
        examples: [{ fr: 'J’ai un ami qui habite à Vancouver.', tr: 'I have a friend who lives in Vancouver.' }, { fr: 'C’est le film que j’ai vu hier.', tr: 'It’s the film (that) I saw yesterday.' }, { fr: 'La voisine qu’on a rencontrée est très gentille.', tr: 'The neighbour we met is very nice.' }],
      }),
      pick('B1', choose, ['qui', 'que', 'qu’', 'dont'], { fr: 'Le bus ___ va au centre-ville passe toutes les dix minutes.' }),
      pick('B1', choose, ['que', 'qui', 'où', 'dont'], { fr: 'Le livre ___ tu m’as prêté est passionnant.' }),
      pick('B1', choose, ['qu’', 'qui', 'que', 'où'], { fr: 'C’est la chanson ___ elle préfère.' }),
      pick('B1', choose, ['qui', 'qu’', 'que', 'dont'], { fr: 'J’ai rencontré une femme ___ est arrivée du Liban.' }),
      { kind: 'categorize', prompt: b('Qui or que?', 'Qui ou que ?'), buckets: [b('qui', 'qui'), b('que / qu’', 'que / qu’')], items: [{ text: 'la personne ___ m’a aidé', bucket: 0 }, { text: 'la personne ___ j’ai aidée', bucket: 1 }, { text: 'le train ___ arrive', bucket: 0 }, { text: 'le train ___ nous prenons', bucket: 1 }, { text: 'l’ami ___ habite ici', bucket: 0 }, { text: 'l’ami ___ elle invite', bucket: 1 }] },
      { kind: 'fill', prompt: b('Complete with qui or que.', 'Complétez avec qui ou que.'), text: 'C’est un quartier ___ j’adore et ___ est très calme.', answers: [['que'], ['qui']] },
      { kind: 'speak', prompt: b('Say it aloud.', 'Dites-le à voix haute.'), text: 'J’ai un ami qui habite à Vancouver et que je vois chaque été.', tr: 'I have a friend who lives in Vancouver and whom I see every summer.' },
    ],
    notes: {
      points: [
        b('qui + verb (subject): l’homme qui parle.', 'qui + verbe (sujet) : l’homme qui parle.'),
        b('que + subject + verb (object): l’homme que je vois.', 'que + sujet + verbe (complément) : l’homme que je vois.'),
        b('que → qu’ before a vowel; qui never elides.', 'que → qu’ devant une voyelle ; qui ne s’élide jamais.'),
        b('Qui / que refer to people AND things.', 'Qui / que renvoient aux personnes ET aux choses.'),
      ],
      vocab: [['prêter', b('to lend', 'donner pour un temps')], ['passionnant', b('fascinating', 'très intéressant')], ['calme', b('quiet', 'sans bruit')]],
    },
  },
  {
    id: 'relative-pronouns-2',
    slug: { en: 'ou-and-dont', fr: 'ou-et-dont' },
    title: b('Où and dont', 'Où et dont'),
    summary: b('Use où for places and times, and dont to replace de + noun.', 'Employer où pour les lieux et le temps, et dont pour remplacer de + nom.'),
    objectives: [b('Use où for a place or a moment', 'Employer où pour un lieu ou un moment'), b('Use dont with verbs + de', 'Employer dont avec les verbes + de'), b('Use dont for possession', 'Employer dont pour la possession')],
    minutes: 13,
    steps: [
      card(b('Où: place and time', 'Où : lieu et temps'), b('**où** replaces a **place**: la ville **où** j’habite. It also replaces a **moment** (where English says “when”): le jour **où** je suis arrivé, l’année **où** nous nous sommes mariés.', '**où** remplace un **lieu** : la ville **où** j’habite. Il remplace aussi un **moment** : le jour **où** je suis arrivé, l’année **où** nous nous sommes mariés.'), {
        examples: [{ fr: 'C’est le café où nous nous sommes rencontrés.', tr: 'It’s the café where we met.' }, { fr: 'Je me souviens du jour où je suis arrivé au Canada.', tr: 'I remember the day (when) I arrived in Canada.' }],
      }),
      pick('B1', choose, ['où', 'que', 'qui', 'dont'], { fr: 'La ville ___ je suis né est au bord de la mer.' }),
      pick('B1', choose, ['où', 'que', 'quand', 'dont'], { fr: 'Le jour ___ il a eu son diplôme, il a pleuré de joie.' }),
      card(b('Dont = de + …', 'Dont = de + …'), b('**dont** replaces **de + noun**. With verbs + de: **parler de**, **avoir besoin de**, **se souvenir de**, **avoir peur de**: le livre **dont** je parle (je parle **de** ce livre). And possession: la femme **dont** le fils est médecin (le fils **de** cette femme).', '**dont** remplace **de + nom**. Avec les verbes + de : **parler de**, **avoir besoin de**, **se souvenir de**, **avoir peur de** : le livre **dont** je parle. Et la possession : la femme **dont** le fils est médecin.'), { variant: 'tip' }),
      pick('B1', choose, ['dont', 'que', 'où', 'qui'], { fr: 'C’est l’outil ___ j’ai besoin.' }),
      pick('B1', choose, ['dont', 'que', 'qui', 'où'], { fr: 'Voici le collègue ___ je t’ai parlé.' }),
      pick('B1', choose, ['dont', 'que', 'où', 'qui'], { fr: 'J’ai un voisin ___ la fille joue au hockey.' }),
      { kind: 'fill', prompt: b('Complete with où or dont.', 'Complétez avec où ou dont.'), text: 'C’est le parc ___ je cours le matin, et le chien ___ j’ai peur y est toujours.', answers: [['où'], ['dont']] },
      { kind: 'speak', prompt: b('Say it aloud.', 'Dites-le à voix haute.'), text: 'C’est le café où nous nous sommes rencontrés, le jour dont je me souviens toujours.', tr: 'It’s the café where we met, the day I always remember.' },
    ],
    notes: {
      points: [
        b('où = place (la ville où…) and time (le jour où…).', 'où = lieu (la ville où…) et temps (le jour où…).'),
        b('dont = de + noun: parler de, avoir besoin de, se souvenir de, avoir peur de.', 'dont = de + nom : parler de, avoir besoin de, se souvenir de, avoir peur de.'),
        b('Possession: la femme dont le fils… (= le fils de la femme).', 'Possession : la femme dont le fils… (= le fils de la femme).'),
        b('Never “le jour quand”: say le jour où.', 'Jamais « le jour quand » : dites le jour où.'),
      ],
      vocab: [['avoir besoin de', b('to need', 'nécessiter')], ['l’outil (m.)', b('tool', 'instrument')], ['le diplôme', b('degree, diploma', 'titre d’études')], ['pleurer', b('to cry', 'verser des larmes')]],
    },
  },
  {
    id: 'relative-pronouns-3',
    slug: { en: 'ce-qui-ce-que-lequel', fr: 'ce-qui-ce-que-lequel' },
    title: b('Ce qui, ce que and lequel', 'Ce qui, ce que et lequel'),
    summary: b('Say “what” with ce qui / ce que, and use lequel after a preposition.', 'Dire « ce qui / ce que » pour « la chose qui / que », et employer lequel après une préposition.'),
    objectives: [b('Use ce qui and ce que', 'Employer ce qui et ce que'), b('Use lequel after a preposition', 'Employer lequel après une préposition'), b('Contract auquel and duquel', 'Contracter auquel et duquel')],
    minutes: 13,
    steps: [
      card(b('Ce qui, ce que = what', 'Ce qui, ce que = la chose qui / que'), b('When there is no noun before, use **ce**: **ce qui** + verb, **ce que** + subject: **Ce qui** m’intéresse, c’est l’histoire. Dis-moi **ce que** tu veux. Je ne comprends pas **ce qu’**il dit.', 'Quand il n’y a pas de nom avant, employez **ce** : **ce qui** + verbe, **ce que** + sujet : **Ce qui** m’intéresse, c’est l’histoire. Dis-moi **ce que** tu veux. Je ne comprends pas **ce qu’**il dit.'), {
        examples: [{ fr: 'Ce qui me plaît ici, c’est la nature.', tr: 'What I like here is nature.' }, { fr: 'Fais ce que tu veux !', tr: 'Do what you want!' }],
      }),
      pick('B1', choose, ['ce que', 'ce qui', 'que', 'quoi'], { fr: 'Je ne sais pas ___ je vais faire ce week-end.' }),
      pick('B1', choose, ['Ce qui', 'Ce que', 'Qui', 'Que'], { fr: '___ est important, c’est de pratiquer tous les jours.' }),
      card(b('After a preposition: lequel', 'Après une préposition : lequel'), b('After **avec, pour, sur, dans, sans**, use **lequel / laquelle / lesquels / lesquelles** (for things): la table **sur laquelle** j’ai posé mes clés. With à and de, it contracts: **auquel**, **auxquels**, **duquel**. For people, **qui** is usual: la personne **avec qui** je travaille.', 'Après **avec, pour, sur, dans, sans**, employez **lequel / laquelle / lesquels / lesquelles** (pour les choses) : la table **sur laquelle** j’ai posé mes clés. Avec à et de : **auquel**, **auxquels**, **duquel**. Pour les personnes, on dit plutôt **qui** : la personne **avec qui** je travaille.'), { variant: 'tip' }),
      pick('B1', choose, ['laquelle', 'lequel', 'qui', 'que'], { fr: 'C’est la raison pour ___ je suis venu au Canada.' }),
      pick('B1', choose, ['auquel', 'à lequel', 'duquel', 'lequel'], { fr: 'C’est le projet ___ je pense depuis longtemps.' }),
      pick('B1', choose, ['qui', 'lequel', 'que', 'dont'], { fr: 'La collègue avec ___ je travaille parle quatre langues.' }),
      { kind: 'speak', prompt: b('Say it aloud.', 'Dites-le à voix haute.'), text: 'Ce qui me plaît ici, c’est la nature, et c’est la raison pour laquelle je reste.', tr: 'What I like here is nature, and that’s why I stay.' },
    ],
    notes: {
      points: [
        b('No noun before → ce qui (+ verb), ce que (+ subject).', 'Pas de nom avant → ce qui (+ verbe), ce que (+ sujet).'),
        b('After a preposition (things): lequel, laquelle, lesquels, lesquelles.', 'Après une préposition (choses) : lequel, laquelle, lesquels, lesquelles.'),
        b('à + lequel = auquel; de + lequel = duquel.', 'à + lequel = auquel ; de + lequel = duquel.'),
        b('People after a preposition: avec qui, pour qui.', 'Personnes après une préposition : avec qui, pour qui.'),
      ],
      vocab: [['la raison', b('reason', 'cause')], ['poser', b('to put down', 'placer')], ['plaire à', b('to please', 'être agréable à')]],
    },
  },
];

export default lessons;
