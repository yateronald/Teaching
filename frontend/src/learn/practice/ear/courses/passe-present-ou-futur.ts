// B1 · The tense carried by one small sound: je fais / j'ai fait / je faisais, partons / partirons.
import { ear, ex, fill, pick, situation } from '../authoring';

const METIER = 'L’an dernier, je travaillais dans une banque. Maintenant, je suis professeur, et l’année prochaine, j’ouvrirai ma propre école.';
const METIER_SHOW = 'L’an dernier, je {travaillais} dans une banque. Maintenant, je {suis} professeur, et l’année prochaine, j’{ouvrirai} ma propre école.';

export default ear('passe-present-ou-futur', {
  rule: [
    ['Un petit son pour changer d’époque', 'One small sound to change the time'],
    [
      'Le temps du verbe tient souvent à **un seul son**. __je fais__ [ʒəfɛ] / __j’ai fait__ [ʒefɛ] : le passé composé ajoute seulement [e], le son de « ai ». __je parle__ / __j’ai parlé__ / __je parlais__ : écoutez le petit mot avant le verbe et la fin du verbe.\n\nL’imparfait finit par **[ɛ]** : __je sais__ / __je savais__. Le futur ajoute un **[ʁ]** : __nous partons__ / __nous partirons__. Les mots de temps (hier, demain, maintenant) aident à confirmer.',
      'The tense often depends on **a single sound**. __je fais__ [ʒəfɛ] / __j’ai fait__ [ʒefɛ]: the passé composé only adds [e], the sound of « ai ». __je parle__ / __j’ai parlé__ / __je parlais__: listen to the little word before the verb and to the verb’s ending.\n\nThe imparfait ends in **[ɛ]**: __je sais__ / __je savais__. The future adds an **[ʁ]**: __nous partons__ / __nous partirons__. Time words (hier, demain, maintenant) help confirm.',
    ],
  ],
  goal: ['Entendre si l’action est passée, présente ou future.', 'Hear whether the action is past, present or future.'],
  examples: [
    ex('Je fais les courses.', 'Je {fais} les courses.', ['Présent : [ʒə fɛ].', 'Present: [ʒə fɛ].']),
    ex('J’ai fait les courses.', 'J’{ai} {fait} les courses.', ['Passé composé : [ʒe fɛ], le « ai » se dit [e].', 'Passé composé: [ʒe fɛ], « ai » sounds like [e].']),
    ex('Je faisais les courses.', 'Je {faisais} les courses.', ['Imparfait : [fəzɛ], une syllabe de plus.', 'Imparfait: [fəzɛ], one more syllable.']),
  ],
  items: [
    pick('J’ai fait les courses.', ['Je fais les courses.', 'J’ai fait les courses.'], 1, 'J’{ai} fait les courses.', [
      '[ʒe] : « j’ai », donc passé composé. Le présent « je fais » commence par [ʒə].',
      '[ʒe]: « j’ai », so passé composé. The present « je fais » starts with [ʒə].',
    ]),
    pick('Je mange à midi.', ['Je mange à midi.', 'J’ai mangé à midi.'], 0, 'Je {mange} à midi.', [
      '[ʒəmɑ̃ʒ] : présent. Au passé composé, on entendrait [ʒemɑ̃ʒe].',
      '[ʒəmɑ̃ʒ]: present. In the passé composé you would hear [ʒemɑ̃ʒe].',
    ]),
    pick('Il travaillait à Lyon.', ['Il travaille à Lyon.', 'Il travaillait à Lyon.'], 1, 'Il {travaillait} à Lyon.', [
      '[tʁavajɛ] : la terminaison [ɛ] de l’imparfait. Au présent : [tʁavaj].',
      '[tʁavajɛ]: the imparfait ending [ɛ]. In the present: [tʁavaj].',
    ]),
    pick('Nous partirons demain.', ['Nous partons demain.', 'Nous partirons demain.'], 1, 'Nous {partirons} demain.', [
      '[paʁtiʁɔ̃] : le [ʁ] du futur. Au présent : [paʁtɔ̃].',
      '[paʁtiʁɔ̃]: the future [ʁ]. In the present: [paʁtɔ̃].',
    ]),
    pick('Je le savais.', ['Je le sais.', 'Je le savais.'], 1, 'Je le {savais}.', [
      '[savɛ] : l’imparfait, une syllabe de plus que « sais » [sɛ].',
      '[savɛ]: the imparfait, one syllable more than « sais » [sɛ].',
    ]),
    fill('Hier, j’ai pris le train.', 'Hier, ___ pris le train.', ['j’ai', 'j ai'], 'Hier, {j’ai} pris le train.', [
      '[ʒe] : « j’ai ». « Hier » annonçait déjà le passé.',
      '[ʒe]: « j’ai ». « Hier » already pointed to the past.',
    ]),
    fill('Quand j’étais petit, je jouais au foot.', 'Quand j’étais petit, je ___ au foot.', 'jouais', 'Quand j’étais petit, je {jouais} au foot.', [
      '[ʒwɛ] : l’imparfait, pour une habitude du passé.',
      '[ʒwɛ]: the imparfait, for a past habit.',
    ]),
    fill('Demain, il fera beau.', 'Demain, il ___ beau.', 'fera', 'Demain, il {fera} beau.', [
      '[fəʁa] : le futur de faire, avec son [ʁ].',
      '[fəʁa]: the future of faire, with its [ʁ].',
    ]),
    situation(METIER, 'Quel est son métier aujourd’hui ?', ['Employé de banque', 'Professeur', 'Directeur d’école'], 1, METIER_SHOW, [
      '« Maintenant, je suis professeur » : le présent. La banque, c’était avant (imparfait).',
      '« Maintenant, je suis professeur »: the present. The bank was before (imparfait).',
    ]),
    situation(METIER, 'Qu’est-ce qui est encore un projet ?', ['Travailler dans une banque', 'Être professeur', 'Ouvrir une école'], 2, METIER_SHOW, [
      '« J’ouvrirai » [ʒuvʁiʁe] : le futur, l’année prochaine. C’est un projet.',
      '« J’ouvrirai » [ʒuvʁiʁe]: the future, next year. It is a plan.',
    ]),
  ],
  takeaway: [
    'Écoutez le petit mot avant le verbe et sa fin : j’ai [ʒe] = passé composé, [ɛ] final = imparfait, [ʁ] ajouté = futur.',
    'Listen to the little word before the verb and to its ending: j’ai [ʒe] = passé composé, final [ɛ] = imparfait, added [ʁ] = future.',
  ],
});
