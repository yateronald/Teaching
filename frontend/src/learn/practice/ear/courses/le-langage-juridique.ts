// C2 · Legal French: le cas échéant, de plein droit, sous peine de, à titre gracieux, à l’amiable.
import { ear, ex, fill, pick, situation } from '../authoring';

const BAIL = 'Le locataire doit restituer les clés au plus tard le trente juin, sous peine d’indemnités. Le cas échéant, le dépôt de garantie sera restitué dans un délai de deux mois.';
const BAIL_SHOW = 'Le locataire doit restituer les clés au plus tard le trente juin, {sous peine d’}indemnités. {Le cas échéant}, le dépôt de garantie sera restitué {dans un délai de} deux mois.';

export default ear('le-langage-juridique', {
  rule: [
    ['Les formules du droit', 'The phrases of the law'],
    [
      'Contrats, baux, règlements et notaires emploient des formules qu’on entend aussi lues à voix haute :\n\n__le cas échéant__ (si cela se produit), __de plein droit__ (automatiquement, sans formalité), __sous peine de__ (sinon, avec une sanction), __à titre gracieux__ (gratuitement), __à l’amiable__ (par accord, sans procès), __en tout état de cause__ (de toute façon), __dans un délai de__ (au plus tard après), __un vice caché__ (un défaut invisible à l’achat), __nul n’est censé ignorer la loi__ (personne ne peut dire qu’il ne la connaissait pas).',
      'Contracts, leases, regulations and notaries use phrases you also hear read aloud:\n\n__le cas échéant__ (should the case arise), __de plein droit__ (automatically, as of right), __sous peine de__ (or else, under penalty of), __à titre gracieux__ (free of charge), __à l’amiable__ (by agreement, out of court), __en tout état de cause__ (in any event), __dans un délai de__ (within), __un vice caché__ (a hidden defect), __nul n’est censé ignorer la loi__ (ignorance of the law is no excuse).',
    ],
  ],
  goal: ['Comprendre les formules juridiques courantes.', 'Understand common legal phrases.'],
  examples: [
    ex('Le cas échéant, vous serez prévenu.', '{Le cas échéant}, vous serez prévenu.', ['= Si cela arrive.', '= Should it happen.']),
    ex('Le contrat est résilié de plein droit.', 'Le contrat est résilié {de plein droit}.', ['= Automatiquement.', '= Automatically.']),
    ex('Nul n’est censé ignorer la loi.', '{Nul n’est censé ignorer la loi}.', ['Personne ne peut invoquer son ignorance.', 'Ignorance is no excuse.']),
  ],
  items: [
    pick('Le cas échéant, vous serez remboursé.', ['Vous serez remboursé de toute façon', 'Si cela se produit, vous serez remboursé'], 1, '{Le cas échéant}, vous serez remboursé.', [
      'Le cas échéant = si la situation se présente.', 'Should the case arise.',
    ], ['Que veut dire la phrase ?', 'What does the sentence mean?']),
    pick('Le contrat est résilié de plein droit.', ['Automatiquement, sans autre formalité', 'Après un procès'], 0, 'Le contrat est résilié {de plein droit}.', [
      'De plein droit = par l’effet de la loi, sans démarche.', 'As of right, with no formality.',
    ], ['Comment est-il résilié ?', 'How is it terminated?']),
    pick('Vous devez payer avant le trente, sous peine de pénalités.', ['Avec des pénalités dans tous les cas', 'Sinon, vous aurez des pénalités'], 1, 'Vous devez payer avant le trente, {sous peine de} pénalités.', [
      'Sous peine de = sinon, sanction.', 'Or else, a penalty.',
    ], ['Que se passe-t-il en cas de retard ?', 'What happens if late?']),
    pick('Cette prestation est offerte à titre gracieux.', ['Contre paiement', 'Gratuitement'], 1, 'Cette prestation est offerte {à titre gracieux}.', [
      'À titre gracieux = gratuitement.', 'Free of charge.',
    ], ['À quel prix ?', 'At what price?']),
    pick('Ils ont réglé le litige à l’amiable.', ['Sans aller au tribunal', 'Devant un juge'], 0, 'Ils ont réglé le litige {à l’amiable}.', [
      'À l’amiable = par un accord entre les parties.', 'By mutual agreement.',
    ], ['Comment ont-ils réglé le litige ?', 'How did they settle the dispute?']),
    fill('En tout état de cause, la date est fixée.', 'En tout état de ___, la date est fixée.', 'cause', 'En tout état de {cause}, la date est fixée.', [
      'En tout état de cause = de toute façon.', 'In any event.',
    ]),
    fill('Nul n’est censé ignorer la loi.', 'Nul n’est ___ ignorer la loi.', 'censé', 'Nul n’est {censé} ignorer la loi.', [
      'Censé (avec un c) = supposé.', 'Censé = supposed to.',
    ]),
    fill('La maison avait un vice caché.', 'La maison avait un vice ___.', 'caché', 'La maison avait un vice {caché}.', [
      'Un vice caché : un défaut qu’on ne pouvait pas voir à l’achat.', 'A hidden defect.',
    ]),
    situation(BAIL, 'Que se passe-t-il si les clés ne sont pas rendues le 30 juin ?', ['Rien', 'Le locataire devra payer des indemnités', 'Le dépôt est doublé'], 1, BAIL_SHOW, [
      '« Sous peine d’indemnités ».', '« Under penalty of compensation ».',
    ]),
    situation(BAIL, 'Dans quel délai le dépôt de garantie est-il restitué ?', ['Deux semaines', 'Six mois', 'Deux mois'], 2, BAIL_SHOW, [
      '« Dans un délai de deux mois ».', '« Within two months ».',
    ]),
  ],
  takeaway: [
    'Le cas échéant (si cela arrive), de plein droit (automatiquement), sous peine de (sinon), à titre gracieux (gratuit), à l’amiable (sans procès), en tout état de cause (de toute façon).',
    'Le cas échéant (should it arise), de plein droit (automatically), sous peine de (or else), à titre gracieux (free), à l’amiable (out of court), en tout état de cause (in any event).',
  ],
});
