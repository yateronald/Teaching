import type { CourseAbout } from '../../types';
import { b, card, conj, dict, dlg, gap, lesson, mc, ord, P, pairs, say, sort, tip } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Prenez la deuxième à droite. Ne touche pas ! Allons-y ! The imperative is everywhere: directions, recipes, instructions at work, advice to a friend. This course teaches its three forms, the irregular verbs (sois, aie, sache, veuille), where pronouns go (dis-le-moi, ne le dis pas), and how to soften an order with s’il vous plaît, the conditional or an infinitive.',
    'Prenez la deuxième à droite. Ne touche pas ! Allons-y ! L’impératif est partout : indications, recettes, consignes au travail, conseils à un ami. Ce cours présente ses trois formes, les verbes irréguliers (sois, aie, sache, veuille), la place des pronoms (dis-le-moi, ne le dis pas), et les façons d’adoucir un ordre avec s’il vous plaît, le conditionnel ou l’infinitif.',
  ),
  outcomes: [
    b('Form the imperative of regular and irregular verbs', 'Former l’impératif des verbes réguliers et irréguliers'),
    b('Give directions and instructions', 'Donner des indications et des consignes'),
    b('Place pronouns in positive and negative orders', 'Placer les pronoms à l’impératif affirmatif et négatif'),
    b('Soften a request politely', 'Adoucir une demande avec politesse'),
  ],
};

const C = 'imperative';
export default [
  lesson(C, 1, ['forming-the-imperative', 'former-l-imperatif'],
    b('Forming the imperative', 'Former l’impératif'),
    b('Three forms, no subject: tu, nous, vous. And the -er verbs that lose their s.', 'Trois formes, sans sujet : tu, nous, vous. Et les verbes en -er qui perdent leur s.'),
    [b('Form the imperative from the present', 'Former l’impératif à partir du présent'), b('Drop the s of -er verbs with tu', 'Supprimer le s des verbes en -er avec tu'), b('Use the irregular forms', 'Employer les formes irrégulières')],
    13,
    [
      card(b('From the present, without the subject', 'À partir du présent, sans sujet'), b('Take the present of **tu, nous, vous** and remove the pronoun: **tu prends → prends**, **nous partons → partons**, **vous venez → venez**. For **-er verbs** (and aller), the tu form loses its **s**: **tu parles → parle**, **tu vas → va**.', 'Prenez le présent de **tu, nous, vous** sans le pronom : **tu prends → prends**, **nous partons → partons**, **vous venez → venez**. Pour les **verbes en -er** (et aller), la forme tu perd son **s** : **tu parles → parle**, **tu vas → va**.'), {
        ex: [['Écoute bien !', 'Listen carefully!'], ['Partons tout de suite.', 'Let’s leave right away.'], ['Fermez la porte, s’il vous plaît.', 'Close the door, please.']],
      }),
      tip(b('Four irregular verbs', 'Quatre verbes irréguliers'), b('**être**: sois, soyons, soyez · **avoir**: aie, ayons, ayez · **savoir**: sache, sachons, sachez · **vouloir**: veuillez (very formal: **Veuillez patienter.**)', '**être** : sois, soyons, soyez · **avoir** : aie, ayons, ayez · **savoir** : sache, sachons, sachez · **vouloir** : veuillez (très soutenu : **Veuillez patienter.**)'), {
        ex: [['Sois prudent !', 'Be careful!'], ['N’ayez pas peur.', 'Don’t be afraid.'], ['Veuillez patienter.', 'Please wait.']],
      }),
      conj('finir', b('imperative', 'impératif'), [['(tu)', 'finis'], ['(nous)', 'finissons'], ['(vous)', 'finissez']], { given: [0] }),
      mc(P.form, ['Mange', 'Manges', 'Mangez-tu', 'Tu manges'], { fr: '___ tes légumes, Lucas !' }),
      mc(P.form, ['Soyez', 'Êtes', 'Soyons', 'Sois'], { fr: '___ à l’heure demain, s’il vous plaît.' }),
      mc(P.form, ['Va', 'Vas', 'Allez-tu', 'Aller'], { fr: '___ au lit, il est tard !' }),
      gap(P.complete, '___ (prendre, vous) le bus 24 et ___ (descendre, vous) à la gare.', ['Prenez', 'descendez']),
      ord(P.order, 'N’oublie pas ton parapluie !', { tr: 'Don’t forget your umbrella!' }),
      say('Asseyez-vous, je vous en prie, et faites comme chez vous.', 'Please sit down and make yourself at home.'),
    ],
    [
      b('Imperative = present of tu / nous / vous without the subject.', 'Impératif = présent de tu / nous / vous sans le sujet.'),
      b('-er verbs and aller lose the s with tu: parle, va.', 'Les verbes en -er et aller perdent le s avec tu : parle, va.'),
      b('Irregular: sois, aie, sache, veuillez.', 'Irréguliers : sois, aie, sache, veuillez.'),
    ],
    [['prudent', b('careful', 'qui fait attention')], ['patienter', b('to wait', 'attendre un peu')], ['descendre', b('to get off; to go down', 'quitter un véhicule ; aller en bas')]],
  ),
  lesson(C, 2, ['directions-and-instructions', 'indications-et-consignes'],
    b('Giving directions and instructions', 'Donner des indications et des consignes'),
    b('Use the imperative to guide someone in town, in a recipe and at work.', 'Employer l’impératif pour guider en ville, dans une recette et au travail.'),
    [b('Give directions in town', 'Indiquer un chemin en ville'), b('Follow and give a recipe', 'Suivre et donner une recette'), b('Give safety instructions', 'Donner des consignes de sécurité')],
    13,
    [
      card(b('Directions', 'Indiquer le chemin'), b('**Allez tout droit. Tournez à gauche. Prenez la deuxième rue à droite. Traversez le pont. Continuez jusqu’au feu.**', '**Allez tout droit. Tournez à gauche. Prenez la deuxième rue à droite. Traversez le pont. Continuez jusqu’au feu.**'), {
        ex: [['Allez tout droit jusqu’au rond-point.', 'Go straight on to the roundabout.'], ['Tournez à droite après la banque.', 'Turn right after the bank.']],
      }),
      hearDir(),
      pairs(P.match, [['Épluchez les pommes.', b('Peel the apples.', 'enlever la peau')], ['Coupez en dés.', b('Dice it.', 'couper en petits cubes')], ['Faites cuire 20 minutes.', b('Cook for 20 minutes.', 'cuire')], ['Laissez refroidir.', b('Leave to cool.', 'attendre que ce soit froid')]]),
      mc(P.best, ['Ne courez pas dans les escaliers.', 'Ne courez dans les escaliers pas.', 'Pas courez dans les escaliers.', 'Courez ne pas dans les escaliers.']),
      sort(b('Recipe or safety instruction?', 'Recette ou consigne de sécurité ?'), [b('recipe', 'recette'), b('safety', 'sécurité')], [['Ajoutez le sucre.', 0], ['Portez des gants.', 1], ['Mélangez bien.', 0], ['N’utilisez pas l’ascenseur.', 1], ['Servez chaud.', 0], ['Gardez la sortie libre.', 1]]),
      gap(P.complete, '___ (tourner, vous) à gauche, puis ___ (continuer, vous) jusqu’à la pharmacie.', ['Tournez', 'continuez']),
      dlg(b('Lost in town', 'Perdu en ville'), undefined, [['Passant', 'm'], ['Vous', 'f']], [
        [1, 'Pardon, monsieur, pour aller à la gare, s’il vous plaît ?', 'Excuse me, sir, how do I get to the station, please?'],
        [0, 'Allez tout droit, puis prenez la première rue à gauche. La gare est au bout.', 'Go straight on, then take the first street on the left. The station is at the end.'],
        [1, { options: ['Tout droit, puis la première à gauche. Merci beaucoup !', 'Tout droit, puis prendre première gauche. Merci !', 'Allé tout droit. Merci !'] }],
      ]),
      dict('Traversez la place et prenez la rue en face.', { voice: 'm' }),
    ],
    [
      b('Directions: allez tout droit, tournez à gauche / à droite, prenez la première rue, traversez.', 'Chemin : allez tout droit, tournez à gauche / à droite, prenez la première rue, traversez.'),
      b('Recipes: épluchez, coupez, mélangez, faites cuire, laissez refroidir.', 'Recettes : épluchez, coupez, mélangez, faites cuire, laissez refroidir.'),
      b('Negative imperative: Ne courez pas.', 'Impératif négatif : Ne courez pas.'),
    ],
    [['le feu', b('the traffic light', 'signal lumineux')], ['le rond-point', b('the roundabout', 'carrefour circulaire')], ['traverser', b('to cross', 'passer de l’autre côté')]],
  ),
  lesson(C, 3, ['pronouns-and-politeness', 'pronoms-et-politesse'],
    b('Dis-le-moi: pronouns and politeness', 'Dis-le-moi : pronoms et politesse'),
    b('Place pronouns after the verb (and before it in the negative), and soften your requests.', 'Placer les pronoms après le verbe (et devant à la forme négative), et adoucir ses demandes.'),
    [b('Place pronouns in a positive order', 'Placer les pronoms à l’impératif affirmatif'), b('Use moi and toi', 'Employer moi et toi'), b('Soften an order', 'Adoucir un ordre')],
    13,
    [
      card(b('Positive: after the verb, with a hyphen', 'Affirmatif : après le verbe, avec un trait d’union'), b('**Prends-le. Appelle-moi. Asseyez-vous. Donne-le-moi.** **me** and **te** become **moi** and **toi**. In the negative, the normal order comes back: **Ne le prends pas. Ne m’appelle pas.**', '**Prends-le. Appelle-moi. Asseyez-vous. Donne-le-moi.** **me** et **te** deviennent **moi** et **toi**. À la forme négative, l’ordre habituel revient : **Ne le prends pas. Ne m’appelle pas.**'), {
        ex: [['Dépêche-toi !', 'Hurry up!'], ['Dites-le-moi franchement.', 'Tell me frankly.'], ['Ne t’inquiète pas.', 'Don’t worry.']],
      }),
      tip(b('Softening', 'Adoucir'), b('An imperative can sound abrupt. Soften it: **s’il vous plaît**, **Pourriez-vous… ?** (conditional), **Merci de…** + infinitive, or **Veuillez…** in writing.', 'L’impératif peut sembler brusque. Adoucissez-le : **s’il vous plaît**, **Pourriez-vous… ?** (conditionnel), **Merci de…** + infinitif, ou **Veuillez…** à l’écrit.'), {
        ex: [['Pourriez-vous fermer la fenêtre ?', 'Could you close the window?'], ['Merci de ne pas fumer.', 'Thank you for not smoking.']],
      }),
      mc(P.best, ['Appelle-moi ce soir.', 'Appelle-me ce soir.', 'M’appelle ce soir.', 'Appelle moi-le ce soir.']),
      mc(P.best, ['Ne le touche pas !', 'Touche-le pas !', 'Ne touche-le pas !', 'Le ne touche pas !']),
      mc(P.best, ['Pourriez-vous m’envoyer le document ?', 'Envoyez-moi le document, vite.', 'Tu m’envoies le document.', 'Envoie-le-moi maintenant !'], { explain: b('The conditional makes the request polite.', 'Le conditionnel rend la demande polie.') }),
      gap(P.complete, 'Tu es en retard : dépêche-___ ! Et ne ___ inquiète pas, je t’attends.', ['toi', 't’']),
      ord(P.order, 'Asseyez-vous et attendez-moi ici.', { tr: 'Sit down and wait for me here.' }),
      dlg(b('At the office', 'Au bureau'), undefined, [['Cheffe d’équipe', 'f'], ['Vous', 'm']], [
        [0, 'Le rapport est prêt ?', 'Is the report ready?'],
        [1, { options: ['Presque. Laissez-moi dix minutes, s’il vous plaît.', 'Presque. Laisse-me dix minutes.', 'Presque. Me laissez dix minutes.'] }],
        [0, 'D’accord. Envoyez-le-moi avant midi.', 'All right. Send it to me before noon.'],
        [1, { options: ['Pas de problème, je vous l’envoie tout de suite après.', 'Pas de problème, envoyez-moi-le.', 'Pas de problème, ne l’envoyez pas.'] }],
      ]),
      say('Ne t’inquiète pas et dis-moi la vérité.', 'Don’t worry and tell me the truth.'),
    ],
    [
      b('Positive: verb-pronoun (Prends-le, Asseyez-vous, Donne-le-moi).', 'Affirmatif : verbe-pronom (Prends-le, Asseyez-vous, Donne-le-moi).'),
      b('me / te → moi / toi after the verb.', 'me / te → moi / toi après le verbe.'),
      b('Negative: normal order (Ne le prends pas).', 'Négatif : ordre habituel (Ne le prends pas).'),
      b('Soften: Pourriez-vous… ? Merci de… Veuillez…', 'Adoucir : Pourriez-vous… ? Merci de… Veuillez…'),
    ],
    [['se dépêcher', b('to hurry', 'aller vite')], ['s’inquiéter', b('to worry', 'se faire du souci')], ['franchement', b('frankly', 'sincèrement')]],
  ),
];

function hearDir() {
  return mc(P.listen, [b('turn left after the bank', 'tourner à gauche après la banque'), b('turn right before the bank', 'tourner à droite avant la banque'), b('go straight past the bank', 'passer devant la banque tout droit'), b('cross at the bank', 'traverser à la banque')], { audio: 'Tournez à gauche juste après la banque.', listen: true });
}
