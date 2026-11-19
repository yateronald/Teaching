// B2 · Discourse markers at natural speed: du coup, en fait, bref, enfin, genre, ben, quoi.
import { ear, ex, fill, pick, situation } from '../authoring';

const fn = (word: string): [string, string] => [`Que montre « ${word} » ?`, `What does « ${word} » show?`];
const WEEKEND = 'Alors samedi, bon, on devait aller à la plage. Mais en fait, il a plu toute la matinée. Du coup, on est allés au cinéma. Le film était nul… enfin, pas nul, mais un peu long, quoi. Bref, on rentre dimanche.';
const WEEKEND_SHOW = 'Alors samedi, {bon}, on devait aller à la plage. Mais {en fait}, il a plu toute la matinée. {Du coup}, on est allés au cinéma. Le film était nul… {enfin}, pas nul, mais un peu long, {quoi}. {Bref}, on rentre dimanche.';

export default ear('les-petits-mots-de-l-oral', {
  rule: [
    ['Les petits mots qui organisent l’oral', 'The little words that organise speech'],
    [
      'À l’oral, de petits mots guident l’auditeur : __du coup__ annonce une **conséquence**, __en fait__ une **précision ou une correction**, __bref__ un **résumé**, __enfin__ une **rectification** (« enfin, pas exactement »), __genre__ une **approximation** (familier), __bon__ une **pause ou un changement de sujet**, __ben__ ou __bah__ une **hésitation ou une évidence**, et __quoi__, en fin de phrase, **insiste**.\n\nIls n’ont pas toujours de traduction, mais ils montrent où va la pensée : les repérer, c’est suivre la logique de celui qui parle.',
      'In speech, little words guide the listener: __du coup__ introduces a **consequence**, __en fait__ a **clarification or correction**, __bref__ a **summary**, __enfin__ a **rectification** (« enfin, not exactly »), __genre__ an **approximation** (informal), __bon__ a **pause or change of subject**, __ben__ or __bah__ **hesitation or obviousness**, and __quoi__, at the end of a sentence, **insists**.\n\nThey do not always translate, but they show where the thought is going: spotting them means following the speaker’s logic.',
    ],
  ],
  goal: ['Suivre la logique d’un locuteur natif grâce aux marqueurs de l’oral.', 'Follow a native speaker’s logic through spoken discourse markers.'],
  examples: [
    ex('Le train était annulé. Du coup, j’ai pris le bus.', 'Le train était annulé. {Du coup}, j’ai pris le bus.', ['Du coup = donc : la conséquence.', 'Du coup = so: the consequence.']),
    ex('Je croyais qu’il était médecin. En fait, il est infirmier.', 'Je croyais qu’il était médecin. {En fait}, il est infirmier.', ['En fait = en réalité : la correction.', 'En fait = actually: the correction.']),
    ex('On a beaucoup marché, beaucoup mangé… Bref, c’était génial.', 'On a beaucoup marché, beaucoup mangé… {Bref}, c’était génial.', ['Bref = pour résumer.', 'Bref = to sum up.']),
  ],
  items: [
    pick('Il pleuvait. Du coup, on est restés à la maison.', ['une conséquence', 'une opposition', 'une hésitation'], 0, 'Il pleuvait. {Du coup}, on est restés à la maison.', [
      'Il pleuvait, donc on est restés : « du coup » introduit la conséquence.',
      'It was raining, so they stayed in: « du coup » introduces the consequence.',
    ], fn('du coup')),
    pick('Je pensais que c’était loin. En fait, c’est à cinq minutes.', ['une correction', 'une conséquence', 'un exemple'], 0, 'Je pensais que c’était loin. {En fait}, c’est à cinq minutes.', [
      'La personne corrige ce qu’elle pensait : « en fait » = en réalité.',
      'The speaker corrects what they thought: « en fait » = actually.',
    ], fn('en fait')),
    pick('On a visité trois musées, on a marché des heures, on a très bien mangé… Bref, c’était parfait.', ['un résumé', 'une question', 'une cause'], 0,
      'On a visité trois musées, on a marché des heures, on a très bien mangé… {Bref}, c’était parfait.', [
        'Après une liste, « bref » résume tout en une phrase.',
        'After a list, « bref » sums it all up in one sentence.',
      ], fn('bref')),
    pick('Il est arrivé, genre, vers minuit.', ['une approximation', 'une conséquence', 'une opposition'], 0, 'Il est arrivé, {genre}, vers minuit.', [
      '« Genre » (familier) = à peu près. Il est arrivé autour de minuit.',
      '« Genre » (informal) = roughly. He arrived around midnight.',
    ], fn('genre')),
    pick('C’était bien, enfin, pas génial, mais bien.', ['une rectification', 'une conclusion', 'une conséquence'], 0, 'C’était bien, {enfin}, pas génial, mais bien.', [
      'Ici, « enfin » ne veut pas dire « finalement » : la personne nuance ce qu’elle vient de dire.',
      'Here « enfin » does not mean « at last »: the speaker qualifies what they just said.',
    ], fn('enfin')),
    fill('J’ai raté mon train, du coup je suis arrivé en retard.', 'J’ai raté mon train, ___ je suis arrivé en retard.', 'du coup', 'J’ai raté mon train, {du coup} je suis arrivé en retard.', [
      '« Du coup » relie la cause (le train raté) et la conséquence (le retard).',
      '« Du coup » links the cause (the missed train) and the consequence (being late).',
    ]),
    fill('En fait, je préfère rester à la maison ce soir.', '___, je préfère rester à la maison ce soir.', 'en fait', '{En fait}, je préfère rester à la maison ce soir.', [
      '« En fait » annonce que la personne change d’avis ou précise sa pensée.',
      '« En fait » signals that the speaker changes their mind or clarifies.',
    ]),
    fill('Le film était bien, mais un peu long, quoi.', 'Le film était bien, mais un peu long, ___.', 'quoi', 'Le film était bien, mais un peu long, {quoi}.', [
      '« Quoi » en fin de phrase n’est pas une question : il insiste, comme « voilà » ou « tu vois ».',
      '« Quoi » at the end of a sentence is not a question: it insists, like « you know ».',
    ]),
    situation(WEEKEND, 'Pourquoi sont-ils allés au cinéma ?', ['Parce qu’il a plu.', 'Parce que la plage était fermée.', 'Parce que le film était célèbre.'], 0, WEEKEND_SHOW, [
      '« En fait, il a plu… Du coup, on est allés au cinéma » : la pluie est la cause, le cinéma la conséquence.',
      '« En fait, il a plu… Du coup, on est allés au cinéma »: rain is the cause, the cinema the consequence.',
    ]),
    situation(WEEKEND, 'Finalement, que pense la personne du film ?', ['Il était un peu long.', 'Il était excellent.', 'Il était vraiment nul.'], 0, WEEKEND_SHOW, [
      '« Nul… enfin, pas nul, mais un peu long » : « enfin » corrige le premier avis. Son vrai avis : un peu long.',
      '« Nul… enfin, pas nul, mais un peu long »: « enfin » corrects the first opinion. Their real view: a bit long.',
    ]),
  ],
  takeaway: [
    'Du coup = conséquence, en fait = correction, bref = résumé, enfin = rectification, genre = à peu près, bon = pause, ben = évidence, quoi = insistance. Ils montrent la logique de l’oral.',
    'Du coup = consequence, en fait = correction, bref = summary, enfin = rectification, genre = roughly, bon = pause, ben = obviousness, quoi = emphasis. They show the logic of speech.',
  ],
});
