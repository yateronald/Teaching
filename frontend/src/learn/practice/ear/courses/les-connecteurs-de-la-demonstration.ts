// C2 · Logical connectors of a demonstration: or, dès lors, il s’ensuit que, a fortiori, a contrario.
import { ear, ex, fill, pick, situation } from '../authoring';

const PME = 'Les petites entreprises ont du mal à recruter. Or, ce sont elles qui créent le plus d’emplois. Il s’ensuit que les aider à recruter, c’est aider, a fortiori, toute l’économie.';
const PME_SHOW = 'Les petites entreprises ont du mal à recruter. {Or}, ce sont elles qui créent le plus d’emplois. {Il s’ensuit que} les aider à recruter, c’est aider, {a fortiori}, toute l’économie.';

export default ear('les-connecteurs-de-la-demonstration', {
  rule: [
    ['La logique d’une démonstration', 'The logic of an argument'],
    [
      'Dans une conférence ou un plaidoyer, les connecteurs logiques sont la colonne vertébrale du raisonnement :\n\n__or__ (introduit une information qui fait avancer le raisonnement, souvent une deuxième prémisse : ce n’est pas toujours une opposition), __dès lors__ (par conséquent ; ou : à partir de ce moment), __il s’ensuit que__ (la conséquence logique est que), __a fortiori__ (à plus forte raison), __a contrario__ (à l’inverse), __en effet__ (justifie ce qui précède), __en somme__ (en résumé), __par conséquent__.\n\nL’exemple classique : __Tous les hommes sont mortels. Or Socrate est un homme. Donc Socrate est mortel.__',
      'In a lecture or a plea, logical connectors are the backbone of the reasoning:\n\n__or__ (brings in information that moves the argument forward, often a second premise: not always opposition), __dès lors__ (consequently; or: from then on), __il s’ensuit que__ (it follows that), __a fortiori__ (all the more so), __a contrario__ (conversely), __en effet__ (justifies what came before), __en somme__ (in short), __par conséquent__ (therefore).\n\nThe classic example: __Tous les hommes sont mortels. Or Socrate est un homme. Donc Socrate est mortel.__',
    ],
  ],
  goal: ['Suivre un raisonnement grâce à ses connecteurs.', 'Follow an argument through its connectors.'],
  examples: [
    ex('Tous les hommes sont mortels. Or, Socrate est un homme.', 'Tous les hommes sont mortels. {Or}, Socrate est un homme.', ['« Or » introduit la deuxième prémisse.', '« Or » introduces the second premise.']),
    ex('Si un adulte s’y perd, a fortiori un enfant.', 'Si un adulte s’y perd, {a fortiori} un enfant.', ['= À plus forte raison.', '= All the more so.']),
    ex('Il n’a pas signé ; dès lors, le contrat n’est pas valable.', 'Il n’a pas signé ; {dès lors}, le contrat n’est pas valable.', ['= Par conséquent.', '= Consequently.']),
  ],
  items: [
    pick('Si un adulte s’y perd, a fortiori un enfant.', ['Un enfant ne s’y perdra pas', 'Un enfant s’y perdra encore plus facilement'], 1, 'Si un adulte s’y perd, {a fortiori} un enfant.', [
      'A fortiori = à plus forte raison.', 'All the more so.',
    ], ['Que veut dire la phrase ?', 'What does the sentence mean?']),
    pick('Il n’a pas signé ; dès lors, le contrat n’est pas valable.', ['Par conséquent', 'Malgré cela'], 0, 'Il n’a pas signé ; {dès lors}, le contrat n’est pas valable.', [
      'Dès lors = par conséquent.', 'Consequently.',
    ], ['Que signifie « dès lors » ?', 'What does « dès lors » mean?']),
    pick('Tous les hommes sont mortels. Or, Socrate est un homme. Donc Socrate est mortel.', ['Il exprime une opposition forte', 'Il introduit une deuxième prémisse', 'Il conclut'], 1, 'Tous les hommes sont mortels. {Or}, Socrate est un homme. {Donc} Socrate est mortel.', [
      '« Or » apporte l’information qui permet de conclure ; « donc » conclut.', '« Or » brings the information needed; « donc » concludes.',
    ], ['Quel est le rôle de « or » ?', 'What is the role of « or »?']),
    pick('A contrario, une baisse des prix relancerait la demande.', ['De la même façon', 'À l’inverse'], 1, '{A contrario}, une baisse des prix relancerait la demande.', [
      'A contrario = en raisonnant à l’inverse.', 'Conversely.',
    ], ['Que signifie « a contrario » ?', 'What does « a contrario » mean?']),
    pick('En somme, le projet est viable.', ['En résumé', 'Au contraire'], 0, '{En somme}, le projet est viable.', [
      'En somme = en résumé, pour conclure.', 'In short.',
    ], ['Que signifie « en somme » ?', 'What does « en somme » mean?']),
    fill('Il s’ensuit que la loi doit changer.', 'Il ___ que la loi doit changer.', ['s’ensuit', "s'ensuit"], 'Il {s’ensuit} que la loi doit changer.', [
      'Il s’ensuit que = la conséquence logique est que.', 'It follows that.',
    ]),
    fill('Par conséquent, nous refusons.', 'Par ___, nous refusons.', 'conséquent', 'Par {conséquent}, nous refusons.', [
      'Par conséquent = donc.', 'Therefore.',
    ]),
    fill('En effet, les chiffres le montrent.', 'En ___, les chiffres le montrent.', 'effet', 'En {effet}, les chiffres le montrent.', [
      'En effet : on justifie ce qui précède.', 'Indeed: justifying what came before.',
    ]),
    situation(PME, 'Quel est le rôle de la phrase qui commence par « or » ?', ['Elle contredit la première phrase', 'Elle conclut', 'Elle ajoute une information décisive pour le raisonnement'], 2, PME_SHOW, [
      '« Or » apporte la deuxième prémisse : ce sont elles qui créent le plus d’emplois.', '« Or » brings the second premise.',
    ]),
    situation(PME, 'Quelle est la conclusion ?', ['Aider ces entreprises à recruter, c’est aider toute l’économie', 'Les petites entreprises doivent fermer', 'Il ne faut pas les aider'], 0, PME_SHOW, [
      '« Il s’ensuit que… a fortiori, toute l’économie ».', '« It follows that… all the more so, the whole economy ».',
    ]),
  ],
  takeaway: [
    'Or (nouvelle prémisse, pas toujours une opposition), dès lors et il s’ensuit que (conséquence), a fortiori (à plus forte raison), a contrario (à l’inverse), en effet (justification), en somme (résumé).',
    'Or (a new premise, not always opposition), dès lors and il s’ensuit que (consequence), a fortiori (all the more so), a contrario (conversely), en effet (justification), en somme (summary).',
  ],
});
