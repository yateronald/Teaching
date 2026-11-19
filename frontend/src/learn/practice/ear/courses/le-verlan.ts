// C1 · Verlan and slang: ouf, relou, chelou, vénère, teuf, zarbi.
import { ear, ex, fill, pick, situation } from '../authoring';

const TEUF = 'Hier, la teuf chez Karim, c’était ouf ! Par contre, son voisin était trop relou : il est venu se plaindre trois fois, complètement vénère.';
const TEUF_SHOW = 'Hier, la {teuf} chez Karim, c’était {ouf} ! Par contre, son voisin était trop {relou} : il est venu se plaindre trois fois, complètement {vénère}.';

export default ear('le-verlan', {
  rule: [
    ['Le verlan : des mots à l’envers', 'Verlan: words inside out'],
    [
      'Le verlan (de « à l’envers ») inverse les syllabes d’un mot : __fou → ouf__, __lourd → relou__ (pénible), __louche → chelou__ (bizarre, suspect), __énervé → vénère__, __fête → teuf__, __bizarre → zarbi__, __femme → meuf__. Certains mots sont si courants qu’ils sont entrés dans le langage de tous les jours : __c’est ouf__ s’entend partout.\n\nPour décoder, remettez les syllabes dans l’ordre, et aidez-vous du contexte. Comme pour le familier : à comprendre, à employer avec prudence.',
      'Verlan (from « à l’envers », backwards) swaps the syllables of a word: __fou → ouf__, __lourd → relou__ (annoying), __louche → chelou__ (weird, dodgy), __énervé → vénère__, __fête → teuf__, __bizarre → zarbi__, __femme → meuf__. Some are so common they have entered everyday speech: __c’est ouf__ is heard everywhere.\n\nTo decode, put the syllables back in order and use the context. As with informal words: understand them, use them carefully.',
    ],
  ],
  goal: ['Décoder les mots de verlan les plus courants.', 'Decode the most common verlan words.'],
  examples: [
    ex('C’est ouf !', 'C’est {ouf} !', ['Ouf = fou : incroyable.', 'Ouf = fou: crazy, amazing.']),
    ex('Il est relou.', 'Il est {relou}.', ['Relou = lourd : pénible.', 'Relou = lourd: annoying.']),
    ex('C’est chelou, ce bruit.', 'C’est {chelou}, ce bruit.', ['Chelou = louche : bizarre.', 'Chelou = louche: weird.']),
  ],
  items: [
    pick('Elle est vénère.', ['Elle est vénérée', 'Elle est énervée', 'Elle est vieille'], 1, 'Elle est {vénère}.', [
      'Vénère = énervé, en colère.', 'Vénère = angry.',
    ], ['Comment est-elle ?', 'How is she?']),
    pick('On fait une teuf samedi.', ['Une fête', 'Une tête', 'Une tarte'], 0, 'On fait une {teuf} samedi.', [
      'Teuf = fête.', 'Teuf = party.',
    ], ['Qu’organisent-ils ?', 'What are they organising?']),
    pick('Ce type est chelou.', ['Très gentil', 'Très grand', 'Bizarre, louche'], 2, 'Ce type est {chelou}.', [
      'Chelou = louche, étrange.', 'Chelou = dodgy, odd.',
    ], ['Comment est ce type ?', 'What is this guy like?']),
    pick('Arrête, t’es relou !', ['Drôle', 'Pénible', 'Rouge'], 1, 'Arrête, t’es {relou} !', [
      'Relou = lourd, pénible.', 'Relou = annoying.',
    ], ['Que reproche-t-on ?', 'What is the complaint?']),
    pick('C’est zarbi, ce truc.', ['Bizarre', 'Joli', 'Cher'], 0, 'C’est {zarbi}, ce truc.', [
      'Zarbi = bizarre.', 'Zarbi = weird.',
    ], ['Comment est ce truc ?', 'What is this thing like?']),
    fill('Ce concert était ouf !', 'Ce concert était ___ !', 'ouf', 'Ce concert était {ouf} !', [
      'Ouf = fou, incroyable.', 'Ouf = amazing.',
    ]),
    fill('Sa meuf arrive ce soir.', 'Sa ___ arrive ce soir.', 'meuf', 'Sa {meuf} arrive ce soir.', [
      'Meuf = femme, ici sa compagne.', 'Meuf = woman, here his girlfriend.',
    ]),
    fill('Laisse béton, c’est pas grave.', 'Laisse ___, c’est pas grave.', 'béton', 'Laisse {béton}, c’est pas grave.', [
      'Laisse béton = laisse tomber (verlan ancien, toujours connu).', 'Laisse béton = forget it (old verlan, still known).',
    ]),
    situation(TEUF, 'Comment était la fête ?', ['Ennuyeuse', 'Géniale', 'Annulée'], 1, TEUF_SHOW, [
      '« C’était ouf » = c’était génial.', '« It was amazing ».',
    ]),
    situation(TEUF, 'Que faisait le voisin ?', ['Il dansait', 'Il a apporté à manger', 'Il venait se plaindre, énervé'], 2, TEUF_SHOW, [
      'Relou, vénère : pénible et énervé.', 'Relou, vénère: annoying and angry.',
    ]),
  ],
  takeaway: [
    'Verlan = syllabes inversées : ouf (fou), relou (lourd), chelou (louche), vénère (énervé), teuf (fête), zarbi (bizarre). Remettez-les à l’endroit.',
    'Verlan = swapped syllables: ouf (fou), relou (lourd), chelou (louche), vénère (énervé), teuf (fête), zarbi (bizarre). Turn them the right way round.',
  ],
});
