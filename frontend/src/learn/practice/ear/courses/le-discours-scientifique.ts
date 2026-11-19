// C2 · Scientific hedging: semble indiquer, à ce stade, un biais, toutes choses égales par ailleurs.
import { ear, ex, fill, pick, situation } from '../authoring';

const ETUDE = 'Cette étude préliminaire, menée sur cent cinquante volontaires, semble indiquer un lien entre sommeil et mémoire. Mais à ce stade, rien ne permet d’affirmer que l’un est la cause de l’autre.';
const ETUDE_SHOW = 'Cette {étude préliminaire}, menée sur cent cinquante volontaires, {semble indiquer} un lien entre sommeil et mémoire. Mais {à ce stade}, rien ne permet d’affirmer que l’un est la cause de l’autre.';

export default ear('le-discours-scientifique', {
  rule: [
    ['Le degré de certitude', 'How certain is it?'],
    [
      'Un chercheur dose sa certitude avec précision, et c’est ce dosage qu’il faut entendre :\n\n**prudence** : __semble indiquer__, __suggère__, __pourrait__, __une étude préliminaire__, __à ce stade__, __il est trop tôt pour conclure__ ;\n**limites** : __un échantillon de vingt personnes__, __un biais__, __corrélation n’est pas causalité__ (deux faits liés ne prouvent pas que l’un cause l’autre) ;\n**solidité** : __statistiquement significatif__, __un consensus scientifique__, __dans l’état actuel des connaissances__.\n\n__Toutes choses égales par ailleurs__ signifie : si rien d’autre ne change.',
      'A researcher measures certainty precisely, and that is what you must hear:\n\n**caution**: __semble indiquer__, __suggère__, __pourrait__, __une étude préliminaire__, __à ce stade__, __il est trop tôt pour conclure__;\n**limits**: __un échantillon de vingt personnes__, __un biais__, __corrélation n’est pas causalité__ (two linked facts do not prove one causes the other);\n**solidity**: __statistiquement significatif__, __un consensus scientifique__, __dans l’état actuel des connaissances__.\n\n__Toutes choses égales par ailleurs__ means: if nothing else changes.',
    ],
  ],
  goal: ['Entendre le degré de certitude d’un résultat scientifique.', 'Hear how certain a scientific result is.'],
  examples: [
    ex('Ces résultats semblent indiquer un effet.', 'Ces résultats {semblent indiquer} un effet.', ['Prudence : ce n’est pas prouvé.', 'Caution: not proven.']),
    ex('Toutes choses égales par ailleurs.', '{Toutes choses égales par ailleurs}.', ['= Si rien d’autre ne change.', '= All else being equal.']),
    ex('Corrélation n’est pas causalité.', '{Corrélation n’est pas causalité}.', ['Un lien n’est pas une cause.', 'A link is not a cause.']),
  ],
  items: [
    pick('Ces premiers résultats suggèrent un effet positif.', ['Oui, c’est prouvé', 'Non, c’est une indication prudente'], 1, 'Ces premiers résultats {suggèrent} un effet positif.', [
      '« Premiers », « suggèrent » : prudence.', '« First », « suggest »: caution.',
    ], ['Le résultat est-il certain ?', 'Is the result certain?']),
    pick('À ce stade, il est trop tôt pour conclure.', ['La conclusion est évidente', 'On ne peut pas encore tirer de conclusion'], 1, '{À ce stade}, il est trop tôt pour conclure.', [
      'À ce stade = pour l’instant.', 'At this stage = for now.',
    ], ['Que dit le chercheur ?', 'What is the researcher saying?']),
    pick('L’échantillon ne compte que vingt personnes.', ['Pour souligner une limite de l’étude', 'Pour montrer que l’étude est solide'], 0, 'L’échantillon ne compte {que vingt personnes}.', [
      'Ne… que vingt : un petit échantillon, donc une limite.', 'Only twenty: a small sample, so a limit.',
    ], ['Pourquoi le préciser ?', 'Why mention it?']),
    pick('Il existe un consensus scientifique sur ce point.', ['Les scientifiques sont divisés', 'Les scientifiques sont d’accord'], 1, 'Il existe un {consensus scientifique} sur ce point.', [
      'Consensus = accord général.', 'Consensus = general agreement.',
    ], ['Que signifie la phrase ?', 'What does the sentence mean?']),
    pick('Toutes choses égales par ailleurs, le prix augmenterait.', ['Si rien d’autre ne change', 'Dans tous les cas'], 0, '{Toutes choses égales par ailleurs}, le prix augmenterait.', [
      'On isole un seul facteur, les autres restant fixes.', 'One factor is isolated, the others fixed.',
    ], ['Que signifie la formule ?', 'What does the phrase mean?']),
    fill('Corrélation n’est pas causalité.', 'Corrélation n’est pas ___.', 'causalité', 'Corrélation n’est pas {causalité}.', [
      'Deux phénomènes liés ne prouvent pas une cause.', 'Linked does not mean caused.',
    ]),
    fill('L’étude présente un biais.', 'L’étude présente un ___.', 'biais', 'L’étude présente un {biais}.', [
      'Un biais fausse les résultats.', 'A bias skews results.',
    ]),
    fill('Le résultat est statistiquement significatif.', 'Le résultat est statistiquement ___.', 'significatif', 'Le résultat est statistiquement {significatif}.', [
      'Peu probable d’être dû au hasard.', 'Unlikely to be due to chance.',
    ]),
    situation(ETUDE, 'Que montre l’étude ?', ['Que le sommeil cause la mémoire', 'Un lien possible entre sommeil et mémoire', 'Qu’il n’y a aucun lien'], 1, ETUDE_SHOW, [
      '« Semble indiquer un lien » : une association, pas une cause.', 'An association, not a cause.',
    ]),
    situation(ETUDE, 'Quelle prudence exprime le chercheur ?', ['L’étude est fausse', 'Il faut arrêter de dormir', 'On ne peut pas encore parler de cause'], 2, ETUDE_SHOW, [
      '« Rien ne permet d’affirmer que l’un est la cause de l’autre ».', '« Nothing allows us to say one causes the other ».',
    ]),
  ],
  takeaway: [
    'Semble indiquer, suggère, préliminaire, à ce stade = prudence ; échantillon réduit, biais, corrélation = limites ; significatif, consensus = solidité. Écoutez ces mots avant de retenir un chiffre.',
    'Semble indiquer, suggère, préliminaire, à ce stade = caution; small sample, bias, correlation = limits; significant, consensus = solidity. Listen for these words before you trust a figure.',
  ],
});
