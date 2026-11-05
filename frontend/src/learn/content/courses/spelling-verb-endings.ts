import { b, type Lesson } from '../../types';
import { card, pick } from '../kit';

const choose = b('Choose the right ending.', 'Choisissez la bonne terminaison.');

const lessons: Lesson[] = [
  {
    id: 'spelling-verb-endings-1',
    slug: { en: 'present-tense-endings', fr: 'terminaisons-du-present' },
    title: b('Present tense endings: -e, -es, -s, -t', 'Les terminaisons du présent : -e, -es, -s, -t'),
    summary: b('Write the silent endings of the present: tu always takes -s, il takes -e or -t.', 'Écrire les terminaisons muettes du présent : tu prend toujours -s, il prend -e ou -t.'),
    objectives: [b('Write -er verb endings', 'Écrire les terminaisons des verbes en -er'), b('Write -ir / -re verb endings', 'Écrire les terminaisons des verbes en -ir / -re'), b('Never forget the s of tu', 'Ne jamais oublier le s de tu')],
    minutes: 12,
    steps: [
      card(b('Two families of endings', 'Deux familles de terminaisons'), b('**-er verbs**: -e, -es, -e, -ons, -ez, -ent (je parle, tu parles, il parle). **Most other verbs**: -s, -s, -t, -ons, -ez, -ent (je finis, tu finis, il finit; je pars, il part). The golden rule: **tu → always -s** (or -x: tu peux).', '**Verbes en -er** : -e, -es, -e, -ons, -ez, -ent (je parle, tu parles, il parle). **La plupart des autres** : -s, -s, -t, -ons, -ez, -ent (je finis, tu finis, il finit ; je pars, il part). Règle d’or : **tu → toujours -s** (ou -x : tu peux).')),
      pick('A2', choose, ['finit', 'finis', 'fini', 'finie'], { fr: 'Le film ___ à vingt-deux heures.' }),
      pick('A2', choose, ['manges', 'mange', 'mangent', 'manger'], { fr: 'Tu ___ avec nous ce soir ?' }),
      pick('A2', choose, ['pars', 'part', 'parts', 'pare'], { fr: 'Je ___ en vacances demain.' }),
      pick('A2', choose, ['peux', 'peut', 'peus', 'peu'], { fr: 'Tu ___ m’aider ?' }),
      { kind: 'categorize', prompt: b('Which ending for “il / elle”?', 'Quelle terminaison pour « il / elle » ?'), buckets: [b('-e', '-e'), b('-t', '-t'), b('-d', '-d')], items: [{ text: 'parl…', bucket: 0 }, { text: 'fini…', bucket: 1 }, { text: 'pren…', bucket: 2 }, { text: 'dor…', bucket: 1 }, { text: 'aim…', bucket: 0 }, { text: 'atten…', bucket: 2 }] },
      { kind: 'fill', prompt: b('Write the endings.', 'Écrivez les terminaisons.'), text: 'Tu parl___ bien ! Elle chois___ une robe. Il atten___ le bus.', answers: [['es'], ['it'], ['d']], explain: b('Attendre: il attend (verbs in -dre keep the d).', 'Attendre : il attend (les verbes en -dre gardent le d).') },
    ],
    notes: {
      points: [
        b('-er verbs: -e, -es, -e, -ons, -ez, -ent.', 'Verbes en -er : -e, -es, -e, -ons, -ez, -ent.'),
        b('Most -ir / -re / -oir verbs: -s, -s, -t, -ons, -ez, -ent.', 'La plupart des verbes en -ir / -re / -oir : -s, -s, -t, -ons, -ez, -ent.'),
        b('Verbs in -dre keep d: il prend, il attend, il répond.', 'Les verbes en -dre gardent le d : il prend, il attend, il répond.'),
        b('Tu always ends in -s (or -x: tu peux, tu veux).', 'Tu se termine toujours par -s (ou -x : tu peux, tu veux).'),
      ],
      vocab: [['choisir', b('to choose', 'sélectionner')], ['partir', b('to leave', 's’en aller')], ['attendre', b('to wait', 'rester jusqu’à…')]],
    },
  },
  {
    id: 'spelling-verb-endings-2',
    slug: { en: 'imparfait-endings', fr: 'terminaisons-de-l-imparfait' },
    title: b('Imparfait endings: -ais, -ait, -aient', 'Les terminaisons de l’imparfait : -ais, -ait, -aient'),
    summary: b('Five forms sound the same: write -ais, -ait or -aient according to the subject.', 'Cinq formes se prononcent pareil : écrivez -ais, -ait ou -aient selon le sujet.'),
    objectives: [b('Write the six imparfait endings', 'Écrire les six terminaisons de l’imparfait'), b('Match the ending to the subject', 'Accorder la terminaison au sujet'), b('Avoid confusion with the participle -é', 'Éviter la confusion avec le participe -é')],
    minutes: 13,
    steps: [
      card(b('One sound, three spellings', 'Un son, trois écritures'), b('Imparfait: je parl**ais**, tu parl**ais**, il parl**ait**, nous parl**ions**, vous parl**iez**, ils parl**aient**. The forms with **-ais, -ait, -aient** all sound [ɛ]: only the subject tells you which one to write.', 'Imparfait : je parl**ais**, tu parl**ais**, il parl**ait**, nous parl**ions**, vous parl**iez**, ils parl**aient**. Les formes en **-ais, -ait, -aient** se prononcent toutes [ɛ] : seul le sujet vous dit laquelle écrire.')),
      { kind: 'conjugate', prompt: b('Conjugate habiter in the imparfait.', 'Conjuguez habiter à l’imparfait.'), verb: 'habiter', tense: b('imparfait', 'imparfait'), forms: [['j’', 'habitais'], ['tu', 'habitais'], ['il / elle', 'habitait'], ['nous', 'habitions'], ['vous', 'habitiez'], ['ils / elles', 'habitaient']], given: [0] },
      pick('A2', choose, ['jouaient', 'jouait', 'jouais', 'jouai'], { fr: 'Quand ils étaient petits, mes enfants ___ dehors.' }),
      pick('A2', choose, ['faisait', 'faisais', 'faisaient', 'fesait'], { fr: 'Ce jour-là, il ___ très froid.' }),
      pick('A2', choose, ['allais', 'allait', 'allaient', 'aller'], { fr: 'Avant, j’___ au travail à pied.' }),
      card(b('-ait or -é?', '-ait ou -é ?'), b('Don’t confuse **il parlait** (imparfait, ongoing) and **il a parlé** (passé composé, with an auxiliary). Test: is there **avoir / être** before? → -é. No auxiliary → -ait.', 'Ne confondez pas **il parlait** (imparfait) et **il a parlé** (passé composé, avec auxiliaire). Test : y a-t-il **avoir / être** avant ? → -é. Pas d’auxiliaire → -ait.'), { variant: 'trap' }),
      { kind: 'fill', prompt: b('Write -ait or -é.', 'Écrivez -ait ou -é.'), text: 'Il pleuv___ quand elle est arriv___.', answers: [['ait'], ['ée']], strict: true },
      { kind: 'dictation', prompt: b('Write what you hear.', 'Écrivez ce que vous entendez.'), text: 'Mes parents habitaient à Dakar quand j’étais petit.', voice: 'm', strict: true },
    ],
    notes: {
      points: [
        b('Imparfait: -ais, -ais, -ait, -ions, -iez, -aient.', 'Imparfait : -ais, -ais, -ait, -ions, -iez, -aient.'),
        b('je / tu → -ais; il / elle / on → -ait; ils / elles → -aient.', 'je / tu → -ais ; il / elle / on → -ait ; ils / elles → -aient.'),
        b('Faire: je faisais (pronounced “fe-”, written “fai-”).', 'Faire : je faisais (prononcé « fe- », écrit « fai- »).'),
        b('With avoir / être before: participle -é (il a parlé); without: -ait (il parlait).', 'Avec avoir / être avant : participe -é (il a parlé) ; sans : -ait (il parlait).'),
      ],
      vocab: [['dehors', b('outside', 'à l’extérieur')], ['à pied', b('on foot', 'en marchant')], ['autrefois', b('in the past', 'avant')]],
    },
  },
  {
    id: 'spelling-verb-endings-3',
    slug: { en: 'future-or-conditional', fr: 'futur-ou-conditionnel' },
    title: b('-rai or -rais? Future or conditional', '-rai ou -rais ? Futur ou conditionnel'),
    summary: b('Je parlerai and je parlerais sound almost the same: learn the test to choose.', 'Je parlerai et je parlerais se prononcent presque pareil : apprenez le test pour choisir.'),
    objectives: [b('Distinguish future and conditional endings', 'Distinguer les terminaisons du futur et du conditionnel'), b('Use the “nous” test', 'Employer le test du « nous »'), b('Write si + imparfait → conditionnel', 'Écrire si + imparfait → conditionnel')],
    minutes: 13,
    steps: [
      card(b('The nous test', 'Le test du nous'), b('With **je**, the future (-**rai**) and the conditional (-**rais**) sound almost the same. Replace **je** with **nous**: future → nous parler**ons**; conditional → nous parler**ions**. If “-ons” fits → **-rai**; if “-ions” fits → **-rais**.', 'Avec **je**, le futur (-**rai**) et le conditionnel (-**rais**) se prononcent presque pareil. Remplacez **je** par **nous** : futur → nous parler**ons** ; conditionnel → nous parler**ions**. Si « -ons » convient → **-rai** ; si « -ions » convient → **-rais**.'), {
        examples: [{ fr: 'Demain, je partirai tôt. (nous partirons)', tr: 'Tomorrow I will leave early.' }, { fr: 'Si j’avais le temps, je partirais. (nous partirions)', tr: 'If I had time, I would leave.' }, { fr: 'Je voudrais un café. (nous voudrions)', tr: 'I would like a coffee.' }],
      }),
      pick('B1', choose, ['viendrai', 'viendrais', 'viendrait', 'viendrez'], { fr: 'Demain, je ___ te chercher à la gare.' }),
      pick('B1', choose, ['achèterais', 'achèterai', 'achetais', 'achèterait'], { fr: 'Si j’étais riche, j’___ une maison au bord de la mer.' }),
      pick('B1', choose, ['aimerais', 'aimerai', 'aimais', 'aimait'], { fr: 'J’___ réserver une table pour deux, s’il vous plaît.', explain: b('Polite request = conditional (nous aimerions).', 'Demande polie = conditionnel (nous aimerions).') }),
      pick('B1', choose, ['serai', 'serais', 'sera', 'serait'], { fr: 'Je te promets que je ___ à l’heure.' }),
      { kind: 'fill', prompt: b('Write -rai or -rais.', 'Écrivez -rai ou -rais.'), text: 'L’an prochain, je trouve___ un emploi. À ta place, je cherche___ à Montréal.', answers: [['rai'], ['rais']], strict: true },
      { kind: 'dictation', prompt: b('Write what you hear (conditional).', 'Écrivez ce que vous entendez (conditionnel).'), text: 'Si j’avais le temps, je voyagerais plus souvent.', voice: 'f', strict: true },
    ],
    notes: {
      points: [
        b('Future: -rai (je parlerai). Conditional: -rais (je parlerais).', 'Futur : -rai (je parlerai). Conditionnel : -rais (je parlerais).'),
        b('Test: nous parlerons (future) / nous parlerions (conditional).', 'Test : nous parlerons (futur) / nous parlerions (conditionnel).'),
        b('Conditional after si + imparfait, and for polite requests (je voudrais).', 'Conditionnel après si + imparfait, et pour la politesse (je voudrais).'),
        b('Future for promises and certain plans: je serai là.', 'Futur pour les promesses et les projets sûrs : je serai là.'),
      ],
      vocab: [['promettre', b('to promise', 'donner sa parole')], ['à l’heure', b('on time', 'ponctuel')], ['au bord de la mer', b('by the sea', 'près de la mer')]],
    },
  },
];

export default lessons;
