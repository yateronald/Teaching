// C2 · The passé simple in narratives read aloud: il vint, elle chanta, ils firent.
import { ear, ex, fill, pick, situation } from '../authoring';

const NUIT = 'Il était tard. La pluie tombait sur la ville. Soudain, on frappa à la porte. Marie se leva, hésita un instant, puis ouvrit.';
const NUIT_SHOW = 'Il {était} tard. La pluie {tombait} sur la ville. Soudain, on {frappa} à la porte. Marie {se leva}, {hésita} un instant, puis {ouvrit}.';

export default ear('le-passe-simple', {
  rule: [
    ['Le temps du récit', 'The tense of storytelling'],
    [
      'Dans les contes, les romans et les récits historiques lus à voix haute, on entend le **passé simple** : __il chanta__, __elle finit__, __il vint__, __ce fut__, __il eut__, __ils firent__, __nous fûmes__. Il raconte une action terminée, comme le passé composé à l’oral.\n\nL’**imparfait**, lui, peint le décor : __il pleuvait__, __elle était fatiguée__. À l’oral, écoutez la fin du verbe : __il chanta__ [a] (action) n’est pas __il chantait__ [ɛ] (décor ou habitude). Au pluriel : __-èrent__, __-irent__, __-urent__ (__ils arrivèrent__, __ils prirent__, __ils furent__).',
      'In tales, novels and history read aloud, you hear the **passé simple**: __il chanta__, __elle finit__, __il vint__, __ce fut__, __il eut__, __ils firent__, __nous fûmes__. It narrates a completed action, like the passé composé in speech.\n\nThe **imparfait** paints the background: __il pleuvait__, __elle était fatiguée__. By ear, listen to the verb ending: __il chanta__ [a] (an action) is not __il chantait__ [ɛ] (background or habit). Plural: __-èrent__, __-irent__, __-urent__ (__ils arrivèrent__, __ils prirent__, __ils furent__).',
    ],
  ],
  goal: ['Reconnaître le passé simple et le distinguer de l’imparfait.', 'Recognise the passé simple and tell it from the imparfait.'],
  examples: [
    ex('Il ouvrit la porte et sortit.', 'Il {ouvrit} la porte et {sortit}.', ['Deux actions successives.', 'Two successive actions.']),
    ex('Ils vinrent le lendemain.', 'Ils {vinrent} le lendemain.', ['Vinrent : venir au passé simple.', 'Vinrent: venir in the passé simple.']),
    ex('Ce fut un long hiver.', 'Ce {fut} un long hiver.', ['Fut : être au passé simple.', 'Fut: être in the passé simple.']),
  ],
  items: [
    pick('Il vint le lendemain.', ['Il venait le lendemain.', 'Il vint le lendemain.'], 1, 'Il {vint} le lendemain.', [
      '[vɛ̃] : passé simple de venir, une seule fois.', '[vɛ̃]: passé simple of venir, a single time.',
    ]),
    pick('Elle chanta toute la nuit.', ['Elle chanta toute la nuit.', 'Elle chantait toute la nuit.'], 0, 'Elle {chanta} toute la nuit.', [
      'On entend [a] à la fin : passé simple.', 'You hear [a] at the end: passé simple.',
    ]),
    pick('Ils firent un long voyage.', ['Faire', 'Finir', 'Fuir'], 0, 'Ils {firent} un long voyage.', [
      'Firent : passé simple de faire.', 'Firent: passé simple of faire.',
    ], ['Quel est l’infinitif du verbe ?', 'What is the infinitive?']),
    pick('Il prit son manteau et partit.', ['Il prenait son manteau tous les jours', 'Il a pris son manteau et il est parti'], 1, 'Il {prit} son manteau et {partit}.', [
      'Prit, partit : deux actions terminées, l’une après l’autre.', 'Two completed actions, one after the other.',
    ], ['Que s’est-il passé ?', 'What happened?']),
    pick('Nous fûmes surpris.', ['Fuir', 'Être', 'Faire'], 1, 'Nous {fûmes} surpris.', [
      'Fûmes : être au passé simple.', 'Fûmes: être in the passé simple.',
    ], ['Quel verbe ?', 'Which verb?']),
    fill('Elle ouvrit la fenêtre.', 'Elle ___ la fenêtre.', 'ouvrit', 'Elle {ouvrit} la fenêtre.', [
      'Ouvrit : passé simple d’ouvrir.', 'Ouvrit: passé simple of ouvrir.',
    ]),
    fill('Ils arrivèrent à midi.', 'Ils ___ à midi.', 'arrivèrent', 'Ils {arrivèrent} à midi.', [
      '-èrent : le pluriel des verbes en -er.', '-èrent: plural of -er verbs.',
    ]),
    fill('Ce fut un grand jour.', 'Ce ___ un grand jour.', 'fut', 'Ce {fut} un grand jour.', [
      'Fut : être au passé simple.', 'Fut: être.',
    ]),
    situation(NUIT, 'Quel est le rôle de « la pluie tombait » ?', ['C’est une action soudaine', 'C’est le décor de la scène', 'C’est la fin de l’histoire'], 1, NUIT_SHOW, [
      'Imparfait : le décor. Le passé simple raconte les actions.', 'Imparfait: the background. Passé simple tells the actions.',
    ]),
    situation(NUIT, 'Que fit Marie, dans l’ordre ?', ['Elle ouvrit, puis se leva', 'Elle se leva, hésita, puis ouvrit', 'Elle ne fit rien'], 1, NUIT_SHOW, [
      'Trois passés simples : se leva, hésita, ouvrit.', 'Three passés simples: rose, hesitated, opened.',
    ]),
  ],
  takeaway: [
    'Passé simple = action du récit (il chanta, il vint, ils firent) ; imparfait = décor (il chantait, il pleuvait). Écoutez la fin du verbe : [a] ou [ɛ].',
    'Passé simple = narrative action (il chanta, il vint, ils firent); imparfait = background (il chantait, il pleuvait). Listen to the verb ending: [a] or [ɛ].',
  ],
});
