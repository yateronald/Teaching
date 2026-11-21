import type { CourseAbout } from '../../types';
import { b, card, conj, dict, gap, lesson, mc, P, sort } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Nous mangeons, nous commençons, il paie or il paye, j’envoie, il peint, il résout: some verbs change their stem to keep the right sound or follow old patterns. This course covers the spelling changes of verbs in -cer and -ger, -yer, e/é + consonant + er (lever, céder), and the irregular endings of -indre, -soudre and -dre verbs, so your conjugations are spelled perfectly.',
    'Nous mangeons, nous commençons, il paie ou il paye, j’envoie, il peint, il résout : certains verbes modifient leur radical pour garder le bon son ou suivent d’anciens modèles. Ce cours couvre les changements orthographiques des verbes en -cer et -ger, en -yer, en e/é + consonne + er (lever, céder), et les terminaisons irrégulières des verbes en -indre, -soudre et -dre, pour des conjugaisons parfaitement écrites.',
  ),
  outcomes: [
    b('Write -cer and -ger verbs correctly', 'Écrire correctement les verbes en -cer et -ger'),
    b('Conjugate -yer verbs', 'Conjuguer les verbes en -yer'),
    b('Change e/é to è when needed', 'Changer e/é en è quand il le faut'),
    b('Spell -indre, -soudre and -dre verbs', 'Écrire les verbes en -indre, -soudre et -dre'),
  ],
};

const C = 'sp-tricky-verbs';
export default [
  lesson(C, 1, ['cer-and-ger', 'cer-et-ger'],
    b('-cer and -ger verbs', 'Les verbes en -cer et -ger'),
    b('Add ç and e before a and o to keep the soft sound.', 'Ajouter ç et e devant a et o pour garder le son doux.'),
    [b('-cer: c → ç before a, o', '-cer : c → ç devant a, o'), b('-ger: g → ge before a, o', '-ger : g → ge devant a, o'), b('Apply in present, imparfait, passé simple', 'Appliquer au présent, à l’imparfait, au passé simple')],
    13,
    [
      card(b('Keep the soft sound', 'Garder le son doux'), b('**c** before **a, o** sounds [k]; to keep [s], write **ç**: **nous commençons, il commençait, en commençant**. **g** before **a, o** sounds [g]; to keep [ʒ], add **e**: **nous mangeons, je mangeais, en nageant, il partagea**. Before **e, i**, nothing changes: **vous commencez, nous mangions**.', '**c** devant **a, o** se prononce [k] ; pour garder [s], on écrit **ç** : **nous commençons, il commençait, en commençant**. **g** devant **a, o** se prononce [g] ; pour garder [ʒ], on ajoute **e** : **nous mangeons, je mangeais, en nageant, il partagea**. Devant **e, i**, rien ne change : **vous commencez, nous mangions**.')),
      conj('commencer', b('present', 'présent'), [['je', 'commence'], ['tu', 'commences'], ['il/elle', 'commence'], ['nous', 'commençons'], ['vous', 'commencez'], ['ils/elles', 'commencent']], { given: [0, 1] }),
      mc(P.spelling, ['nous voyageons', 'nous voyagons', 'nous voyajons', 'nous voyageont']),
      gap(P.complete, 'Quand il pla___ait ses économies, il man___ait peu.', ['ç', 'ge'], { strict: true }),
      mc(P.spelling, ['Elle lançait la balle en avançant.', 'Elle lancait la balle en avancant.', 'Elle lançait la balle en avancant.', 'Elle lancait la balle en avançant.']),
      dict('Nous commençons à huit heures et nous mangeons en partageant nos repas.', { strict: true }),
    ],
    [
      b('-cer: ç before a, o (commençons, commençait).', '-cer : ç devant a, o (commençons, commençait).'),
      b('-ger: ge before a, o (mangeons, mangeait).', '-ger : ge devant a, o (mangeons, mangeait).'),
      b('No change before e, i.', 'Aucun changement devant e, i.'),
    ],
    [['les économies', b('savings', 'argent mis de côté')], ['partager', b('to share', 'diviser entre plusieurs')], ['lancer', b('to throw', 'jeter')]],
  ),
  lesson(C, 2, ['yer-and-accent-changes', 'yer-et-changements-d-accent'],
    b('-yer verbs and e → è', 'Les verbes en -yer et e → è'),
    b('Change y to i before a silent e, and e/é to è before a silent syllable.', 'Changer y en i devant un e muet, et e/é en è devant une syllabe muette.'),
    [b('-oyer, -uyer: y → i', '-oyer, -uyer : y → i'), b('-ayer: two options', '-ayer : deux possibilités'), b('lever → lève; céder → cède', 'lever → lève ; céder → cède')],
    13,
    [
      card(b('-yer verbs', 'Les verbes en -yer'), b('**-oyer, -uyer**: **y → i** before a silent **e**: **j’envoie, il nettoie, ils essuient** (but **nous envoyons, vous nettoyez**). **-ayer**: both accepted: **il paie / il paye, j’essaie / j’essaye**. Futur: **j’enverrai** (irregular), **je nettoierai**, **je paierai / payerai**.', '**-oyer, -uyer** : **y → i** devant un **e** muet : **j’envoie, il nettoie, ils essuient** (mais **nous envoyons, vous nettoyez**). **-ayer** : les deux sont admis : **il paie / il paye, j’essaie / j’essaye**. Futur : **j’enverrai** (irrégulier), **je nettoierai**, **je paierai / payerai**.')),
      card(b('e and é become è', 'e et é deviennent è'), b('Before a **silent syllable**, **e** and **é** of the stem become **è**: **lever → je lève, nous levons**; **acheter → j’achète**; **céder → je cède, nous cédons**; **préférer → je préfère**. Future of é-verbs (1990): **je céderai** or **je cèderai**.', 'Devant une **syllabe muette**, le **e** ou le **é** du radical devient **è** : **lever → je lève, nous levons** ; **acheter → j’achète** ; **céder → je cède, nous cédons** ; **préférer → je préfère**. Futur des verbes en é (1990) : **je céderai** ou **je cèderai**.')),
      conj('nettoyer', b('present', 'présent'), [['je', 'nettoie'], ['tu', 'nettoies'], ['il/elle', 'nettoie'], ['nous', 'nettoyons'], ['vous', 'nettoyez'], ['ils/elles', 'nettoient']], { given: [3] }),
      mc(P.spelling, ['Je préfère le thé, mais nous préférons le café.', 'Je préfére le thé, mais nous préfèrons le café.', 'Je prèfère le thé, mais nous préférons le café.', 'Je préfère le thé, mais nous préfèrons le café.']),
      gap(P.complete, 'Il ___ (essuyer) la table, puis il ___ (envoyer) un message et ___ (acheter) du pain.', ['essuie', 'envoie', 'achète'], { strict: true }),
      dict('J’envoie ce colis demain ; nous nettoyons la maison et j’achète des fleurs.', { strict: true }),
    ],
    [
      b('-oyer, -uyer: y → i before silent e (j’envoie, ils essuient).', '-oyer, -uyer : y → i devant e muet (j’envoie, ils essuient).'),
      b('-ayer: paie or paye.', '-ayer : paie ou paye.'),
      b('e/é → è before a silent syllable (je lève, je cède).', 'e/é → è devant une syllabe muette (je lève, je cède).'),
    ],
    [['essuyer', b('to wipe', 'sécher avec un tissu')], ['céder', b('to give in, to give up', 'abandonner')], ['un colis', b('a parcel', 'paquet')]],
  ),
  lesson(C, 3, ['indre-soudre-dre', 'indre-soudre-dre'],
    b('-indre, -soudre and -dre verbs', 'Les verbes en -indre, -soudre et -dre'),
    b('Drop the d of -indre and -soudre in the singular, keep it for -dre verbs like prendre.', 'Faire tomber le d de -indre et -soudre au singulier, le garder pour les verbes en -dre comme prendre.'),
    [b('-indre: je peins, il peint', '-indre : je peins, il peint'), b('-soudre: je résous, il résout', '-soudre : je résous, il résout'), b('-dre: il prend, il vend (d kept)', '-dre : il prend, il vend (d gardé)')],
    13,
    [
      card(b('-d or -t?', '-d ou -t ?'), b('Verbs in **-indre** (peindre, craindre, joindre, éteindre) and **-soudre** (résoudre, absoudre) **lose the d** in the singular: **je peins, tu peins, il peint**; **je crains, il craint**; **je résous, il résout**. Other **-dre** verbs **keep the d**: **il prend, il vend, il répond, il perd, il coud**. Plural: **nous peignons, ils craignent, nous résolvons**.', 'Les verbes en **-indre** (peindre, craindre, joindre, éteindre) et en **-soudre** (résoudre, absoudre) **perdent le d** au singulier : **je peins, tu peins, il peint** ; **je crains, il craint** ; **je résous, il résout**. Les autres verbes en **-dre** **gardent le d** : **il prend, il vend, il répond, il perd, il coud**. Pluriel : **nous peignons, ils craignent, nous résolvons**.')),
      sort(b('-d or -t at the 3rd person singular?', '-d ou -t à la 3e personne du singulier ?'), [b('-d (il prend)', '-d (il prend)'), b('-t (il peint)', '-t (il peint)')], [['il rend', 0], ['il éteint', 1], ['il répond', 0], ['il rejoint', 1], ['il descend', 0], ['il résout', 1]]),
      conj('craindre', b('present', 'présent'), [['je', 'crains'], ['tu', 'crains'], ['il/elle', 'craint'], ['nous', 'craignons'], ['vous', 'craignez'], ['ils/elles', 'craignent']], { given: [0] }),
      mc(P.spelling, ['Elle éteint la lumière et résout le problème.', 'Elle éteind la lumière et résoud le problème.', 'Elle éteint la lumière et résoud le problème.', 'Elle éteind la lumière et résout le problème.']),
      gap(P.complete, 'Il ___ (prendre) son pinceau et ___ (peindre) la porte ; il ___ (craindre) la pluie.', ['prend', 'peint', 'craint'], { strict: true }),
      dict('Il éteint la radio, répond au téléphone et résout enfin le problème qu’il craint depuis hier.', { strict: true }),
    ],
    [
      b('-indre, -soudre: singular in -s, -s, -t (il peint, il résout).', '-indre, -soudre : singulier en -s, -s, -t (il peint, il résout).'),
      b('Other -dre verbs keep the d (il prend, il répond).', 'Les autres verbes en -dre gardent le d (il prend, il répond).'),
      b('Plural stems: peign-, craign-, résolv-.', 'Radicaux du pluriel : peign-, craign-, résolv-.'),
    ],
    [['un pinceau', b('a paintbrush', 'outil pour peindre')], ['craindre', b('to fear', 'avoir peur de')], ['éteindre', b('to switch off', 'arrêter la lumière')]],
  ),
];
