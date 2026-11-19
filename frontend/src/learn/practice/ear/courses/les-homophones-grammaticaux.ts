// C1 · Grammatical homophones: c’est / s’est / ses / ces, quelle / qu’elle, sans / s’en, quand / quant.
import { ear, ex, fill, pick, situation } from '../authoring';

const CLES = 'Quand elle est arrivée, elle s’est rendu compte qu’elle avait oublié ses clés. Quant à son frère, il s’en moquait complètement.';
const CLES_SHOW = '{Quand} elle est arrivée, elle {s’est} rendu compte {qu’elle} avait oublié {ses} clés. {Quant} à son frère, il {s’en} moquait complètement.';

export default ear('les-homophones-grammaticaux', {
  rule: [
    ['Même son, autre grammaire', 'Same sound, different grammar'],
    [
      'Certains petits mots se prononcent exactement pareil : seule la grammaire permet de les écrire.\n\n__c’est__ (cela est) / __s’est__ (verbe pronominal : il s’est trompé) / __ses__ (les siens) / __ces__ (ceux-là) ; __quelle__ (quelle belle journée) / __qu’elle__ (que + elle) ; __sans__ (sans sucre) / __s’en__ (il s’en va) ; __quand__ (le moment) / __quant à__ (en ce qui concerne) / __qu’en__ ; __peu__ (un peu) / __peut__ (il peut) ; __où__ (le lieu) / __ou__ (ou bien).\n\nPour bien écrire ce que vous entendez, demandez-vous quel rôle joue le mot dans la phrase.',
      'Some little words sound exactly the same: only grammar tells you how to write them.\n\n__c’est__ (it is) / __s’est__ (reflexive verb: il s’est trompé) / __ses__ (his, her) / __ces__ (these); __quelle__ (what a…) / __qu’elle__ (que + elle); __sans__ (without) / __s’en__ (il s’en va); __quand__ (when) / __quant à__ (as for) / __qu’en__; __peu__ (little) / __peut__ (can); __où__ (where) / __ou__ (or).\n\nTo write what you hear correctly, ask what role the word plays in the sentence.',
    ],
  ],
  goal: ['Écrire correctement un petit mot qui a plusieurs homophones.', 'Write correctly a little word that has several homophones.'],
  examples: [
    ex('Il s’est trompé de route.', 'Il {s’est} trompé de route.', ['Verbe se tromper : s’est.', 'The verb se tromper: s’est.']),
    ex('Je crois qu’elle viendra.', 'Je crois {qu’elle} viendra.', ['Que + elle.', 'Que + elle.']),
    ex('Quant à moi, je reste.', '{Quant} à moi, je reste.', ['Quant à = en ce qui concerne.', 'Quant à = as for.']),
  ],
  items: [
    pick('Il s’est trompé de route.', ['c’est', 's’est', 'ses'], 1, 'Il {s’est} trompé de route.', [
      'Se tromper → il s’est trompé.', 'Se tromper → il s’est trompé.',
    ], ['Quel mot entendez-vous avant « trompé » ?', 'Which word do you hear before « trompé »?']),
    pick('Je pense qu’elle viendra.', ['quelle', 'qu’elle'], 1, 'Je pense {qu’elle} viendra.', [
      'Que + elle (je pense que elle…).', 'Que + elle.',
    ], ['Comment s’écrit le mot après « je pense » ?', 'How is the word after « je pense » written?']),
    pick('Il est parti sans dire au revoir.', ['sans', 's’en', 'sent'], 0, 'Il est parti {sans} dire au revoir.', [
      'Sans = l’absence de quelque chose.', 'Sans = without.',
    ], ['Quel mot entendez-vous après « parti » ?', 'Which word do you hear after « parti »?']),
    pick('Quant à moi, je reste ici.', ['Quand', 'Qu’en', 'Quant'], 2, '{Quant} à moi, je reste ici.', [
      'Quant à = en ce qui concerne.', 'Quant à = as for.',
    ], ['Comment s’écrit le premier mot ?', 'How is the first word written?']),
    pick('Il peut venir demain.', ['peu', 'peut', 'peux'], 1, 'Il {peut} venir demain.', [
      'Verbe pouvoir, avec il : peut.', 'Pouvoir with il: peut.',
    ], ['Comment s’écrit le mot après « il » ?', 'How is the word after « il » written?']),
    fill('Quelle belle journée !', '___ belle journée !', ['Quelle', 'quelle'], '{Quelle} belle journée !', [
      'Quelle : une exclamation devant un nom féminin.', 'Quelle: an exclamation before a feminine noun.',
    ]),
    fill('Il s’en va demain.', 'Il ___ va demain.', ['s’en', "s'en"], 'Il {s’en} va demain.', [
      'S’en aller : il s’en va.', 'S’en aller: il s’en va.',
    ]),
    fill('Je ne sais pas où il est.', 'Je ne sais pas ___ il est.', 'où', 'Je ne sais pas {où} il est.', [
      'Où (avec accent) : le lieu.', 'Où (with accent): the place.',
    ]),
    situation(CLES, 'Qu’a-t-elle oublié ?', ['Les clés de son frère', 'Ses propres clés', 'Son téléphone'], 1, CLES_SHOW, [
      '« Ses clés » = les siennes.', '« Ses clés » = her own keys.',
    ]),
    situation(CLES, 'Comment a réagi son frère ?', ['Il était inquiet', 'Il est allé chercher les clés', 'Ça lui était égal'], 2, CLES_SHOW, [
      '« Il s’en moquait complètement » = ça lui était égal.', '« He did not care at all ».',
    ]),
  ],
  takeaway: [
    'C’est / s’est / ses / ces, quelle / qu’elle, sans / s’en, quand / quant, peu / peut, où / ou : le son est le même, la grammaire choisit l’orthographe.',
    'C’est / s’est / ses / ces, quelle / qu’elle, sans / s’en, quand / quant, peu / peut, où / ou: the sound is the same, grammar chooses the spelling.',
  ],
});
