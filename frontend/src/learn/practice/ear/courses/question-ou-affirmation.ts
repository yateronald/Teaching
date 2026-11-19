// A2 · Intonation: the same words make a question or a statement; only the melody changes.
import { ear, ex, fill, pick, situation } from '../authoring';

const QA: [string, string] = ['Question ou affirmation ?', 'Question or statement?'];
const OPTS = ['Une question', 'Une affirmation'];
const MAGASIN = 'Le magasin est fermé ? Ah bon. Il ouvre demain à neuf heures.';

export default ear('question-ou-affirmation', {
  rule: [
    ['La mélodie de la question', 'The melody of a question'],
    [
      'À l’oral, une question a souvent **les mêmes mots** qu’une affirmation : __Tu viens.__ / __Tu viens ?__ Seule la **mélodie** change : la voix **monte** à la fin d’une question (↗) et **descend** à la fin d’une affirmation (↘).\n\nAvec un mot interrogatif (quand, où, combien), la question peut aussi descendre : le mot suffit. Et dans une conversation rapide, « est-ce que » se dit presque [ɛskə].',
      'In speech, a question often has **the same words** as a statement: __Tu viens.__ / __Tu viens ?__ Only the **melody** changes: the voice **rises** at the end of a question (↗) and **falls** at the end of a statement (↘).\n\nWith a question word (quand, où, combien), the question can also fall: the word is enough. And in fast conversation, « est-ce que » sounds almost like [ɛskə].',
    ],
  ],
  goal: ['Reconnaître une question à la seule mélodie.', 'Recognise a question from the melody alone.'],
  examples: [
    ex('Tu viens.', 'Tu viens. ↘', ['La voix descend : c’est une affirmation.', 'The voice falls: a statement.']),
    ex('Tu viens ?', 'Tu viens ? ↗', ['La voix monte : c’est une question.', 'The voice rises: a question.']),
    ex('Est-ce que tu viens ?', '{Est-ce que} tu viens ? ↗', ['« Est-ce que » se dit vite, presque [ɛskə].', '« Est-ce que » is said fast, almost [ɛskə].']),
  ],
  items: [
    pick('Tu as faim ?', OPTS, 0, 'Tu as faim ? ↗', ['La voix monte sur « faim » : c’est une question.', 'The voice rises on « faim »: a question.'], QA),
    pick('Il pleut encore.', OPTS, 1, 'Il pleut encore. ↘', ['La voix descend à la fin : c’est une affirmation.', 'The voice falls at the end: a statement.'], QA),
    pick('Vous habitez ici ?', OPTS, 0, 'Vous habitez ici ? ↗', ['La voix monte sur « ici » : on demande une information.', 'The voice rises on « ici »: someone is asking.'], QA),
    pick('On part à huit heures.', OPTS, 1, 'On part à huit heures. ↘', ['La voix descend : on donne une information.', 'The voice falls: information is given.'], QA),
    pick('Elle a fini ?', OPTS, 0, 'Elle a fini ? ↗', ['Mêmes mots que « Elle a fini. », mais la voix monte : c’est une question.', 'Same words as « Elle a fini. », but the voice rises: a question.'], QA),
    fill('Tu pars quand ?', 'Tu pars ___ ?', 'quand', 'Tu pars {quand} ?', [
      '« Quand » à la fin : à l’oral, le mot interrogatif se place souvent après le verbe.',
      '« Quand » at the end: in speech, the question word often comes after the verb.',
    ]),
    fill('Est-ce que tu viens avec nous ?', '___ tu viens avec nous ?', ['est-ce que', 'est ce que'], '{Est-ce que} tu viens avec nous ? ↗', [
      'Dit vite, « est-ce que » ressemble à [ɛskə]. Il annonce une question à laquelle on répond par oui ou non.',
      'Said fast, « est-ce que » sounds like [ɛskə]. It starts a yes-or-no question.',
    ]),
    fill('C’est combien, ce pull ?', 'C’est ___, ce pull ?', 'combien', 'C’est {combien}, ce pull ?', [
      '« Combien » demande un prix. Avec ce mot, pas besoin que la voix monte beaucoup.',
      '« Combien » asks for a price. With it, the voice need not rise much.',
    ]),
    situation('Alors, tu viens ce soir ? Paul vient aussi. Il apporte le dessert.', 'Combien de questions la personne pose-t-elle ?', ['Une', 'Deux', 'Trois'], 0,
      'Alors, tu viens ce soir ? ↗ Paul vient aussi. ↘ Il apporte le dessert. ↘', [
        'Seule la première phrase monte. « Paul vient aussi » ressemble à « tu viens », mais la voix descend : c’est une information.',
        'Only the first sentence rises. « Paul vient aussi » looks like « tu viens », but the voice falls: it is information.',
      ]),
    situation(MAGASIN, 'Qu’apprend la personne ?', ['Le magasin ouvre demain à neuf heures.', 'Le magasin est ouvert maintenant.', 'Le magasin ferme à neuf heures.'], 0,
      'Le magasin est fermé ? ↗ Ah bon. ↘ Il ouvre demain à neuf heures. ↘', [
        'La première phrase est une question (la voix monte) ; la réponse arrive ensuite : il ouvre demain à neuf heures.',
        'The first sentence is a question (the voice rises); the answer comes next: it opens tomorrow at nine.',
      ]),
  ],
  takeaway: [
    'Mêmes mots, autre mélodie : la voix qui monte fait une question, la voix qui descend une affirmation. Écoutez la dernière syllabe.',
    'Same words, different melody: a rising voice makes a question, a falling voice a statement. Listen to the last syllable.',
  ],
});
