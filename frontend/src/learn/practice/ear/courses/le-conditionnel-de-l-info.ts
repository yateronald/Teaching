// C1 · The reporting conditional in the news: unconfirmed information.
import { ear, ex, fill, pick, situation } from '../authoring';

const FLASH = 'Flash info. Un incendie s’est déclaré cette nuit dans un entrepôt du port. Il n’y a pas de victime. L’origine du feu serait accidentelle, mais l’enquête ne fait que commencer.';
const FLASH_SHOW = 'Flash info. Un incendie {s’est déclaré} cette nuit dans un entrepôt du port. Il n’y a pas de victime. L’origine du feu {serait} accidentelle, mais l’enquête ne fait que commencer.';

export default ear('le-conditionnel-de-l-info', {
  rule: [
    ['Le conditionnel de l’information', 'The reporting conditional'],
    [
      'Dans les médias, le conditionnel présente une information **non confirmée** : __le ministre aurait démissionné__ = on le dit, mais ce n’est pas vérifié. Comparez __le ministre a démissionné__ : c’est un fait établi.\n\nIl s’accompagne souvent de __selon nos informations__, __d’après une source proche du dossier__, __il semblerait que__. Au présent : __l’usine serait sur le point de fermer__. Pour savoir ce qui est sûr, écoutez le verbe.',
      'In the media, the conditional presents **unconfirmed** information: __le ministre aurait démissionné__ = it is said, but not verified. Compare __le ministre a démissionné__: an established fact.\n\nIt often comes with __selon nos informations__, __d’après une source proche du dossier__, __il semblerait que__. In the present: __l’usine serait sur le point de fermer__. To know what is certain, listen to the verb.',
    ],
  ],
  goal: ['Distinguer une information confirmée d’une information rapportée.', 'Tell confirmed information from reported claims.'],
  examples: [
    ex('Le ministre aurait démissionné.', 'Le ministre {aurait} démissionné.', ['Non confirmé.', 'Unconfirmed.']),
    ex('Le ministre a démissionné.', 'Le ministre {a} démissionné.', ['Fait confirmé.', 'Confirmed fact.']),
    ex('L’usine serait sur le point de fermer.', 'L’usine {serait} sur le point de fermer.', ['Une rumeur, non vérifiée.', 'A rumour, not verified.']),
  ],
  items: [
    pick('Selon nos informations, le joueur aurait signé à Madrid.', ['Oui, elle est confirmée', 'Non, elle n’est pas confirmée'], 1, 'Selon nos informations, le joueur {aurait} signé à Madrid.', [
      '« Aurait signé » + « selon nos informations » : pas encore confirmé.', '« Aurait signé » + « selon nos informations »: not yet confirmed.',
    ], ['L’information est-elle confirmée ?', 'Is the information confirmed?']),
    pick('Le joueur a signé à Madrid.', ['Oui, elle est confirmée', 'Non, elle n’est pas confirmée'], 0, 'Le joueur {a} signé à Madrid.', [
      'Passé composé : c’est un fait.', 'Passé composé: a fact.',
    ], ['L’information est-elle confirmée ?', 'Is the information confirmed?']),
    pick('Le suspect aurait pris la fuite.', ['Le suspect a pris la fuite.', 'Le suspect aurait pris la fuite.'], 1, 'Le suspect {aurait} pris la fuite.', [
      '[ɔʁɛ] : conditionnel, non confirmé.', '[ɔʁɛ]: conditional, unconfirmed.',
    ]),
    pick('L’accident aurait fait trois blessés.', ['Trois, c’est certain', 'Aucun', 'Trois, selon des informations non confirmées'], 2, 'L’accident {aurait} fait trois blessés.', [
      'Le chiffre est donné, mais au conditionnel.', 'The figure is given, but in the conditional.',
    ], ['Combien de blessés, et avec quelle certitude ?', 'How many injured, and how certain?']),
    pick('Le président se serait rendu sur place.', ['On dit qu’il y est allé, sans confirmation', 'Il ira sur place demain', 'Il a refusé d’y aller'], 0, 'Le président {se serait rendu} sur place.', [
      'Conditionnel passé : une information rapportée.', 'Past conditional: a reported claim.',
    ], ['Que sait-on ?', 'What is known?']),
    fill('Le magasin serait en faillite.', 'Le magasin ___ en faillite.', 'serait', 'Le magasin {serait} en faillite.', [
      'Serait : on le dit, sans certitude.', 'Serait: so it is said.',
    ]),
    fill('Les négociations auraient échoué.', 'Les négociations ___ échoué.', 'auraient', 'Les négociations {auraient} échoué.', [
      'Auraient échoué : information non confirmée.', 'Auraient échoué: unconfirmed.',
    ]),
    fill('Le chanteur préparerait un nouvel album.', 'Le chanteur ___ un nouvel album.', 'préparerait', 'Le chanteur {préparerait} un nouvel album.', [
      'Préparerait : une rumeur.', 'Préparerait: a rumour.',
    ]),
    situation(FLASH, 'Quelle information est certaine ?', ['L’incendie est accidentel', 'Un incendie a eu lieu, sans victime', 'L’enquête est terminée'], 1, FLASH_SHOW, [
      '« S’est déclaré », « il n’y a pas de victime » : indicatif, ce sont des faits.', 'Indicative: these are facts.',
    ]),
    situation(FLASH, 'Que sait-on de l’origine du feu ?', ['Elle est criminelle', 'Elle serait accidentelle, sans certitude', 'Elle est connue avec certitude'], 1, FLASH_SHOW, [
      '« Serait accidentelle » : hypothèse non confirmée.', '« Serait accidentelle »: an unconfirmed hypothesis.',
    ]),
  ],
  takeaway: [
    'Dans l’information, aurait, serait, auraient = non confirmé. A, est, ont = fait établi. Écoutez le verbe avant de retenir l’information.',
    'In the news, aurait, serait, auraient = unconfirmed. A, est, ont = established fact. Listen to the verb before you trust the information.',
  ],
});
