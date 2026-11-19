// C2 · Rhetoric: rhetorical questions, preterition, anaphora, antithesis.
import { ear, ex, fill, pick, situation } from '../authoring';

const MEETING = 'Je ne rappellerai pas ici les promesses non tenues de mon adversaire. Qui, d’ailleurs, pourrait encore les croire ? Moi, je ne promets pas : je m’engage.';
const MEETING_SHOW = '{Je ne rappellerai pas ici} les promesses non tenues de mon adversaire. {Qui, d’ailleurs, pourrait encore les croire} ? Moi, {je ne promets pas : je m’engage}.';

export default ear('la-rhetorique', {
  rule: [
    ['Entendre la stratégie de l’orateur', 'Hearing the speaker’s strategy'],
    [
      'Un discours persuade par des procédés qu’il faut savoir reconnaître :\n\n**la question rhétorique** n’attend pas de réponse : __Qui peut croire que cela suffira ?__ = personne ne peut le croire ;\n**la prétérition** dit ce qu’elle prétend taire : __Je ne parlerai pas de ses retards__… et l’orateur vient d’en parler ;\n**l’anaphore** répète un début de phrase pour marteler : __Nous ne céderons pas. Nous ne reculerons pas.__ ;\n**l’antithèse** oppose deux termes pour redéfinir : __Ce n’est pas une dépense, c’est un investissement.__',
      'A speech persuades through devices you need to recognise:\n\n**the rhetorical question** expects no answer: __Qui peut croire que cela suffira ?__ = nobody can;\n**preterition** says what it claims to leave out: __Je ne parlerai pas de ses retards__… and the speaker has just mentioned them;\n**anaphora** repeats an opening to hammer home: __Nous ne céderons pas. Nous ne reculerons pas.__;\n**antithesis** sets two terms against each other to redefine: __Ce n’est pas une dépense, c’est un investissement.__',
    ],
  ],
  goal: ['Reconnaître un procédé rhétorique et son effet.', 'Recognise a rhetorical device and its effect.'],
  examples: [
    ex('Qui peut sérieusement croire que cela suffira ?', '{Qui peut sérieusement croire} que cela suffira ?', ['Question rhétorique : personne.', 'Rhetorical question: nobody.']),
    ex('Je ne reviendrai pas sur ses erreurs passées.', '{Je ne reviendrai pas} sur ses erreurs passées.', ['Prétérition : il les évoque quand même.', 'Preterition: he mentions them anyway.']),
    ex('Ce n’est pas une dépense, c’est un investissement.', 'Ce n’est pas {une dépense}, c’est {un investissement}.', ['Antithèse : on redéfinit.', 'Antithesis: redefining.']),
  ],
  items: [
    pick('Faut-il rappeler que ce projet a coûté des millions ?', ['Oui, il ne connaît pas le coût', 'Non, il affirme que le coût est connu et important'], 1, '{Faut-il rappeler} que ce projet a coûté des millions ?', [
      'Question rhétorique : il souligne le coût, il ne demande rien.', 'A rhetorical question: he stresses the cost.',
    ], ['L’orateur attend-il une réponse ?', 'Does the speaker expect an answer?']),
    pick('Je ne parlerai pas de ses nombreux retards.', ['Il refuse vraiment d’en parler', 'Il évoque les retards tout en prétendant ne pas en parler'], 1, '{Je ne parlerai pas} de ses nombreux retards.', [
      'Prétérition : dire qu’on ne parlera pas, c’est déjà en parler.', 'Preterition: saying you won’t mention it is mentioning it.',
    ], ['Que fait réellement l’orateur ?', 'What is the speaker really doing?']),
    pick('Qui, ici, veut payer plus d’impôts ?', ['Personne, selon l’orateur', 'Tout le monde'], 0, '{Qui, ici, veut} payer plus d’impôts ?', [
      'La réponse attendue est implicite : personne.', 'The implied answer: nobody.',
    ], ['Que suggère l’orateur ?', 'What is the speaker suggesting?']),
    pick('Ce n’est pas une dépense, c’est un investissement.', ['Une question', 'Une opposition qui redéfinit les choses'], 1, 'Ce n’est pas {une dépense}, c’est {un investissement}.', [
      'Antithèse : on remplace un mot négatif par un mot positif.', 'Antithesis: a negative word replaced by a positive one.',
    ], ['Quel procédé ?', 'Which device?']),
    pick('Nous ne céderons pas. Nous ne reculerons pas. Nous ne renoncerons pas.', ['Elle renforce la détermination', 'Elle montre l’hésitation'], 0, '{Nous ne} céderons pas. {Nous ne} reculerons pas. {Nous ne} renoncerons pas.', [
      'Anaphore : la répétition martèle la résolution.', 'Anaphora: repetition hammers home resolve.',
    ], ['Quel effet produit la répétition ?', 'What effect does the repetition have?']),
    fill('Est-il besoin de rappeler les faits ?', 'Est-il ___ de rappeler les faits ?', 'besoin', 'Est-il {besoin} de rappeler les faits ?', [
      'Question rhétorique : les faits sont connus.', 'Rhetorical: the facts are known.',
    ]),
    fill('Je passerai sous silence ses erreurs.', 'Je passerai sous ___ ses erreurs.', 'silence', 'Je passerai sous {silence} ses erreurs.', [
      'Passer sous silence : prétérition classique.', 'A classic preterition.',
    ]),
    fill('Qui peut croire une chose pareille ?', 'Qui peut ___ une chose pareille ?', 'croire', 'Qui peut {croire} une chose pareille ?', [
      'Personne ne peut le croire.', 'Nobody can believe it.',
    ]),
    situation(MEETING, 'L’orateur parle-t-il des promesses de son adversaire ?', ['Non, pas du tout', 'Oui, en prétendant ne pas le faire', 'Il les félicite'], 1, MEETING_SHOW, [
      'Prétérition : « je ne rappellerai pas »… mais il les rappelle.', 'Preterition: « I won’t recall »… but he does.',
    ]),
    situation(MEETING, 'Que veut dire « Qui pourrait encore les croire ? »', ['Il demande l’avis du public', 'Tout le monde les croit', 'Personne ne peut plus les croire'], 2, MEETING_SHOW, [
      'Question rhétorique : la réponse est « personne ».', 'Rhetorical question: the answer is « nobody ».',
    ]),
  ],
  takeaway: [
    'Question rhétorique (pas de réponse attendue), prétérition (dire en prétendant taire), anaphore (répéter pour marteler), antithèse (opposer pour redéfinir) : entendez la stratégie, pas seulement les mots.',
    'Rhetorical question (no answer expected), preterition (saying while claiming not to), anaphora (repeating to hammer home), antithesis (contrasting to redefine): hear the strategy, not just the words.',
  ],
});
