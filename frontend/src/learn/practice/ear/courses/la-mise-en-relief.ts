// C1 · Emphasis: c’est… qui / que, ce qui… c’est, and dislocated subjects.
import { ear, ex, fill, pick, situation } from '../authoring';

const CLES = 'Non, non, ce n’est pas moi qui ai oublié les clés. C’est toi qui les avais en dernier ! Ce qui m’agace, c’est que tu ne t’en souviens jamais.';
const CLES_SHOW = 'Non, non, ce n’est pas {moi} qui ai oublié les clés. C’est {toi} qui les avais en dernier ! Ce qui m’agace, c’est {que tu ne t’en souviens jamais}.';

export default ear('la-mise-en-relief', {
  rule: [
    ['La mise en relief', 'Emphasis'],
    [
      'À l’oral, on met une idée en avant de trois façons :\n\n**C’est… qui / que** : __C’est Paul qui a cassé le vase__ (Paul, et pas un autre).\n**Ce qui / ce que… c’est** : __Ce qui me gêne, c’est le bruit__ (on garde l’essentiel pour la fin).\n**Le détachement** : on annonce le sujet, puis on le reprend par un pronom : __Le café, j’adore__, __Moi, je reste__, __Je l’ai adoré, ce film__.\n\nCes structures servent souvent à **opposer** : __c’est lui qui l’a dit__ sous-entend « pas moi ».',
      'In speech, an idea is brought forward in three ways:\n\n**C’est… qui / que**: __C’est Paul qui a cassé le vase__ (Paul, no one else).\n**Ce qui / ce que… c’est**: __Ce qui me gêne, c’est le bruit__ (the key point is kept for the end).\n**Detachment**: you announce the topic, then pick it up with a pronoun: __Le café, j’adore__, __Moi, je reste__, __Je l’ai adoré, ce film__.\n\nThese structures often **contrast**: __c’est lui qui l’a dit__ implies « not me ».',
    ],
  ],
  goal: ['Repérer ce qui est mis en avant, et ce qui est opposé.', 'Spot what is being stressed, and what it is contrasted with.'],
  examples: [
    ex('C’est Paul qui a cassé le vase.', 'C’est {Paul} qui a cassé le vase.', ['Paul, et pas quelqu’un d’autre.', 'Paul, and nobody else.']),
    ex('Le café, j’adore.', '{Le café}, j’adore.', ['On annonce le sujet.', 'The topic is announced first.']),
    ex('Ce qui me gêne, c’est le bruit.', 'Ce qui me gêne, c’est {le bruit}.', ['L’essentiel arrive à la fin.', 'The key point comes last.']),
  ],
  items: [
    pick('C’est Marie qui a appelé, pas sa sœur.', ['Sa sœur', 'Marie'], 1, 'C’est {Marie} qui a appelé, pas sa sœur.', [
      'C’est… qui met Marie en avant, par opposition à sa sœur.', 'C’est… qui stresses Marie, as opposed to her sister.',
    ], ['Qui a appelé ?', 'Who called?']),
    pick('C’est à Lyon qu’ils se sont rencontrés.', ['La date de la rencontre', 'Le lieu de la rencontre', 'Les personnes'], 1, 'C’est {à Lyon} qu’ils se sont rencontrés.', [
      'Ce qui est entre « c’est » et « que » est mis en avant : le lieu.', 'What sits between « c’est » and « que » is stressed: the place.',
    ], ['Qu’est-ce qui est mis en avant ?', 'What is being stressed?']),
    pick('Moi, je préfère le thé.', ['Pour poser une question', 'Pour opposer son goût à celui des autres', 'Pour parler à quelqu’un d’autre'], 1, '{Moi}, je préfère le thé.', [
      '« Moi » détaché marque le contraste : les autres, peut-être pas.', 'A detached « moi » marks a contrast: others may not.',
    ], ['Pourquoi dire « moi » ?', 'Why say « moi »?']),
    pick('Ce qui m’inquiète, c’est son silence.', ['Son silence', 'Ses paroles', 'Son absence'], 0, 'Ce qui m’inquiète, c’est {son silence}.', [
      'L’essentiel vient après « c’est ».', 'The key point follows « c’est ».',
    ], ['Qu’est-ce qui inquiète la personne ?', 'What worries the speaker?']),
    pick('Je l’ai adoré, ce film.', ['Un livre', 'Un film', 'Une pièce'], 1, 'Je l’ai adoré, {ce film}.', [
      'Le sujet est annoncé à la fin, repris par « l’ ».', 'The topic comes at the end, picked up by « l’ ».',
    ], ['De quoi parle-t-on ?', 'What is being talked about?']),
    fill('C’est lui qui me l’a dit.', 'C’est ___ qui me l’a dit.', 'lui', 'C’est {lui} qui me l’a dit.', [
      'C’est lui qui… : lui, et pas un autre.', 'It was him, not someone else.',
    ]),
    fill('Ce que je veux, c’est du calme.', 'Ce ___ je veux, c’est du calme.', 'que', 'Ce {que} je veux, c’est du calme.', [
      'Ce que… c’est : « que » car « je veux quelque chose ».', 'Ce que… c’est: « que » because « I want something ».',
    ]),
    fill('Les vacances, on en a besoin.', 'Les vacances, on ___ a besoin.', 'en', 'Les vacances, on {en} a besoin.', [
      '« En » reprend « les vacances » (avoir besoin de).', '« En » picks up « les vacances » (avoir besoin de).',
    ]),
    situation(CLES, 'Qui avait les clés en dernier, selon la personne ?', ['Elle-même', 'Personne', 'L’autre personne'], 2, CLES_SHOW, [
      '« C’est toi qui les avais en dernier ! »', '« You were the last one to have them! »',
    ]),
    situation(CLES, 'Qu’est-ce qui l’agace ?', ['Que les clés soient perdues', 'Que l’autre ne s’en souvienne jamais', 'Qu’il soit en retard'], 1, CLES_SHOW, [
      '« Ce qui m’agace, c’est que tu ne t’en souviens jamais. »', '« What annoys me is that you never remember. »',
    ]),
  ],
  takeaway: [
    'C’est X qui / que met X en avant, souvent contre autre chose. Ce qui…, c’est… garde l’essentiel pour la fin. Le sujet détaché (le café, j’adore) annonce le thème.',
    'C’est X qui / que stresses X, often against something else. Ce qui…, c’est… keeps the key point for the end. A detached subject (le café, j’adore) announces the topic.',
  ],
});
