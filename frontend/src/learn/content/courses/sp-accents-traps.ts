import type { CourseAbout } from '../../types';
import { b, card, dict, gap, lesson, mc, P, pairs, say, sort, tip, trap } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Why does école have an accent while effort has none? Why do we write je préfère with è but nous préférons with é, and why does forêt wear a little hat? French accents are not decorative — they encode syllable structure and word history. This A2 course teaches three simple visual rules that explain 95 % of French accent traps: the double-consonant rule, the silent-syllable é → è shift, and the historical s behind ê, â and ô.',
    'Pourquoi écrit-on école avec un accent mais effort sans accent ? Pourquoi je préfère avec è mais nous préférons avec é, et pourquoi forêt porte-t-il un accent circonflexe ? En français, les accents suivent des lois précises : pas d’accent devant une consonne double ou x, passage de é à è devant une syllabe muette, et trace d’un ancien s derrière ê, â et ô. Ce cours A2 vous livre ces trois réflexes visuels.',
  ),
  outcomes: [
    b('Avoid adding accents before double consonants, x or closed final syllables', 'Ne pas mettre d’accent devant consonne double, x ou syllabe fermée'),
    b('Choose between é and è using syllable structure', 'Choisir entre é et è grâce au découpage des syllabes'),
    b('Apply the é → è switch in verbs like préférer and répéter', 'Appliquer l’alternance é → è dans préférer et répéter'),
    b('Recognise the circumflex via related words (forêt/forestier, hôpital/hospitalier)', 'Retrouver l’accent circonflexe grâce aux mots de la même famille'),
  ],
};

const C = 'sp-accents-traps';
export default [
  lesson(C, 1, ['no-accent-before-double-consonants', 'pas-d-accent-devant-consonne-double'],
    b('Why effort and exercice have no accent', 'Pourquoi effort et exercice n’ont pas d’accent'),
    b('Spot when an e sounds like [ɛ] or [e] yet never takes a written accent.', 'Repérer quand un e se prononce [ɛ] ou [e] sans jamais prendre d’accent écrit.'),
    [b('Drop accents before double consonants (ff, rr, ss, tt, ll)', 'Supprimer l’accent devant consonne double (ff, rr, ss, tt, ll)'), b('Drop accents before x and in closed final syllables', 'Supprimer l’accent devant x et en syllabe finale fermée'), b('Keep é before consonant + l or r (écran, régler)', 'Garder é devant consonne + l ou r (écran, régler)')],
    13,
    [
      card(b('No accent in a closed syllable', 'Pas d’accent en syllabe fermée'), b('In French, the letter **e** already sounds **[ɛ]** without an accent whenever it is followed by **two consonants** (*effort, erreur, essence, dessert, message, terre, belle, adresse*) or by **x** (*exercice, exemple, examen, exact*). Likewise in a **closed final syllable** ending in a pronounced consonant: **la mer, l’hiver, le sel, le chef, avec, un billet**. Compare with an **open** syllable: **écrire, école, élève, médecin**.', 'En français, la lettre **e** se prononce déjà **[ɛ]** sans accent devant **deux consonnes** (*effort, erreur, essence, dessert, message, terre, belle*) ou devant **x** (*exercice, exemple, examen, exact*). De même en **syllabe finale fermée** : **la mer, l’hiver, le sel, le chef, avec, un billet**. Comparez avec la syllabe **ouverte** : **écrire, école, élève, médecin**.'), {
        ex: [['C’est un excellent exercice d’examen.', 'It’s an excellent exam exercise.'], ['Mon adresse et mon message sont clairs.', 'My address and message are clear.'], ['L’élève écrit une lettre à sa mère.', 'The pupil writes a letter to her mother.']],
      }),
      trap(b('Exception: consonant + l or r!', 'Exception : consonne + l ou r !'), b('When two consonants are **a consonant + l or r** (*écran, étranger, régler, réfléchir, célébrer*), they stay together in the **next** syllable, leaving the **e** open — so you **keep é**! Compare: **es-sence** (no accent) vs **é-cran** (**é**). Also **descendre, respecter, rester** (two different consonants: no accent).', 'Quand les deux consonnes forment un groupe **consonne + l ou r** (*écran, étranger, régler, réfléchir, célébrer*), elles passent dans la syllabe suivante et **é garde son accent**. En revanche : **es-sence, res-ter, des-cendre** (pas d’accent).')),
      sort(b('Needs an accent or stays plain e?', 'Accent obligatoire ou e sans accent ?'), [b('plain e (no accent)', 'e sans accent'), b('accented (é)', 'avec accent (é)')], [['…ffort (effort)', 0], ['…cole (école)', 1], ['…xercice (exercice)', 0], ['…tranger (étranger)', 1], ['…rreur (erreur)', 0], ['r…fléchir (réfléchir)', 1]]),
      mc(P.spelling, ['Cet exercice exige un effort et de l’essence.', 'Cet éxercice exige un éffort et de l’éssence.', 'Cet èxercice exige un èffort et de l’èssence.', 'Cet exercice exige un éffort et de l’éssence.']),
      mc(P.spelling, ['Il faut réfléchir avant d’envoyer ce message.', 'Il faut reflechir avant d’envoyer ce méssage.', 'Il faut réflèchir avant d’envoyer ce message.', 'Il faut réflechir avant d’envoyer ce méssage.']),
      gap(P.complete, 'Pour l’___xamen, j’ai fait un bel ___ffort et ___crit une l___ttre sans ___rreur.', ['e', 'e', 'é', 'e', 'e'], { choices: [['e', 'é', 'è'], ['e', 'é', 'è'], ['é', 'e', 'è'], ['e', 'é', 'è'], ['e', 'é', 'è']], strict: true }),
      dict('Quel excellent dessert après cet exercice difficile !', { voice: 'f', strict: true }),
    ],
    [
      b('No accent before double consonants (effort, terre, dessert, message) or x (exercice, exemple).', 'Jamais d’accent devant consonne double (effort, terre, dessert, message) ni x (exercice, exemple).'),
      b('No accent in closed syllables: mer, hiver, avec, rester, descendre.', 'Pas d’accent en syllabe fermée : mer, hiver, avec, rester, descendre.'),
      b('Keep é before consonant + l / r: écran, étranger, régler, réfléchir.', 'On garde é devant consonne + l / r : écran, étranger, régler, réfléchir.'),
    ],
    [['une erreur', b('a mistake', 'une faute')], ['un effort', b('an effort', 'énergie déployée')], ['un dessert', b('a dessert', 'plat sucré en fin de repas')]],
  ),
  lesson(C, 2, ['acute-vs-grave-accent', 'accent-aigu-ou-grave'],
    b('Acute é vs grave è', 'Accent aigu é ou accent grave è ?'),
    b('Know when e takes é, when it takes è, and how verbs like préférer switch accents.', 'Savoir quand écrire é ou è, et comment alternent les verbes comme préférer.'),
    [b('Use è before a silent final syllable', 'Écrire è devant une syllabe finale muette'), b('Use è before final -s in words like très, après, progrès', 'Écrire è devant -s final (très, après, progrès)'), b('Switch é → è in verbs (préférer → je préfère)', 'Alterner é → è dans les verbes (préférer → je préfère)')],
    13,
    [
      card(b('é vs è: listen to the syllable that follows', 'é ou è : écoutez la syllabe suivante'), b('Write **é** when the **next syllable is sounded** (not silent): **répéter, préférer, médecin, téléphone, cinéma**. Write **è** when the **next syllable ends in silent -e**: **père, mère, frère, crème, poème, règle, problème, chère** — and before a final **-s** in: **très, après, près, procès, succès, progrès, accès**.', 'Écrivez **é** quand la **syllabe suivante est prononcée** : **répéter, préférer, médecin, téléphone**. Écrivez **è** quand la **syllabe suivante a un e muet** : **père, mère, frère, crème, poème, règle, problème, chère** — et devant un **-s** final dans **très, après, près, succès, progrès, accès**.'), {
        ex: [['Mon frère préfère la crème au chocolat.', 'My brother prefers chocolate cream.'], ['Après le concert, quel succès !', 'After the concert, what a success!'], ['Nous répétons toujours la même règle.', 'We always repeat the same rule.']],
      }),
      tip(b('Verbs that switch: préférer, répéter, espérer', 'Les verbes qui changent : préférer, répéter, espérer'), b('In **-é + consonant + er** verbs (**préférer, répéter, espérer, compléter, célébrer**), **é** turns into **è** before a silent ending (**je préfère, tu préfères, il préfère, ils préfèrent**), and stays **é** before a sounded ending (**nous préférons, vous préférez**, plus infinitive **préférer** and past participle **préféré**).', 'Dans les verbes en **-é + consonne + er** (**préférer, répéter, espérer, compléter**), le **é** devient **è** devant une terminaison muette (**je préfère, ils préfèrent**), et reste **é** devant une syllabe sonore (**nous préférons, vous préférez, préféré**).')),
      pairs(P.match, [['préférer', 'je préfère'], ['répéter', 'il répète'], ['espérer', 'ils espèrent'], ['acheter', 'j’achète']], true),
      mc(P.spelling, ['Ma mère espère faire des progrès après ses études.', 'Ma mére éspère faire des progrés aprés ses études.', 'Ma mère espère faire des progrés après ses études.', 'Ma mére espère faire des progrès aprés ses études.']),
      mc(P.spelling, ['Nous répétons la scène, puis ils répètent seuls.', 'Nous répètons la scène, puis ils répétent seuls.', 'Nous répétons la scène, puis ils répétent seuls.', 'Nous répètons la scène, puis ils répètent seuls.']),
      gap(P.complete, 'Mon fr___re pr___f___re le café, mais nous pr___f___rons le thé.', ['è', 'é', 'è', 'é', 'é'], { choices: [['è', 'é', 'e'], ['é', 'è', 'e'], ['è', 'é', 'e'], ['é', 'è', 'e'], ['é', 'è', 'e']], strict: true }),
      dict('Après la pièce, le poète espère un grand succès auprès de ses élèves.', { voice: 'm', strict: true }),
    ],
    [
      b('è before a silent -e syllable: père, mère, frère, crème, règle, problème.', 'è devant une syllabe à e muet : père, mère, frère, crème, règle, problème.'),
      b('è before final -s: très, près, après, progrès, succès, accès.', 'è devant -s final : très, près, après, progrès, succès, accès.'),
      b('Verbs like préférer / répéter switch é → è before silent endings (je préfère, nous préférons).', 'Verbes comme préférer / répéter : é → è devant terminaison muette (je préfère, nous préférons).'),
    ],
    [['le progrès', b('progress', 'avancée, amélioration')], ['le succès', b('success', 'réussite')], ['espérer', b('to hope', 'souhaiter que quelque chose arrive')]],
  ),
  lesson(C, 3, ['circumflex-and-silent-s', 'accent-circonflexe-et-s-disparu'],
    b('The circumflex: forêt, hôpital, sûr', 'L’accent circonflexe : forêt, hôpital, sûr'),
    b('Understand the lost s behind ê, â, ô and distinguish homophones with î and û.', 'Comprendre le s disparu derrière ê, â, ô et distinguer les homophones avec î et û.'),
    [b('Use word families to find the circumflex (forêt → forestier)', 'Retrouver le circonflexe grâce à la famille (forêt → forestier)'), b('Keep ê, â, ô in common words', 'Retenir ê, â, ô dans les mots fréquents'), b('Distinguish sûr/sur, mûr/mur, dû/du, tâche/tache', 'Distinguer sûr/sur, mûr/mur, dû/du, tâche/tache')],
    13,
    [
      card(b('A ghost letter « s »', 'Le fantôme d’un ancien « s »'), b('Most circumflexes (**ê, â, ô, î, û**) replace an ancient **s** that disappeared from French pronunciation — yet often survives in related words and English cognates! **la forêt** (*forestier*), **un hôpital** (*hospitalier*), **une fête** (*festin, festival*), **une fenêtre** (*défenestrer*), **un château** (*castel*), **le goût** (*gustatif*), **une île** (*insulaire*), **la pâte** (*pâtisserie / pasta*).', 'La plupart des accents circonflexes (**ê, â, ô, î, û**) rappellent un ancien **s** disparu, encore visible dans la famille de mots : **la forêt** (*forestier*), **un hôpital** (*hospitalier*), **une fête** (*festin, festival*), **une fenêtre**, **un château** (*castel*), **le goût** (*gustatif*), **une île** (*insulaire*).'), {
        ex: [['La fête a lieu près de la forêt.', 'The celebration takes place near the forest.'], ['J’aime les pâtes et les pâtisseries.', 'I love pasta and pastries.'], ['Ouvrez la fenêtre du château !', 'Open the castle window!']],
      }),
      tip(b('Homophones that always keep the circumflex', 'Les homophones qui gardent toujours le circonflexe'), b('Even under the 1990 spelling rules, the circumflex stays when it separates two words: **sûr** (*sure*) ≠ **sur** (*on*); **mûr** (*ripe*) ≠ **mur** (*wall*); **dû** (*owed*, *had to*) ≠ **du** (*some / of the*); **tâche** (*task*) ≠ **tache** (*stain*); **jeûne** (*fast*) ≠ **jeune** (*young*).', 'Même dans l’orthographe rectifiée de 1990, le circonflexe reste indispensable pour distinguer : **sûr** ≠ **sur**, **mûr** ≠ **mur**, **dû** ≠ **du**, **tâche** ≠ **tache**, **jeûne** ≠ **jeune**.')),
      pairs(P.match, [['la forêt', 'forestier'], ['l’hôpital', 'hospitalier'], ['la fête', 'un festival'], ['l’île', 'insulaire']], true),
      mc(P.spelling, ['Ce fruit sur le mur est déjà bien mûr, j’en suis sûr.', 'Ce fruit sûr le mûr est déjà bien mur, j’en suis sur.', 'Ce fruit sur le mûr est déjà bien mûr, j’en suis sûr.', 'Ce fruit sûr le mur est déjà bien mur, j’en suis sur.']),
      mc(P.spelling, ['Nous avons fêté son anniversaire devant le château, près de la forêt.', 'Nous avons feté son anniversaire devant le chateau, près de la foret.', 'Nous avons fêté son anniversaire devant le chateau, près de la forêt.', 'Nous avons feté son anniversaire devant le château, près de la foret.']),
      gap(P.complete, 'Le b___timent de l’h___pital a une grande fen___tre s___r la for___t.', ['â', 'ô', 'ê', 'u', 'ê'], { choices: [['â', 'a'], ['ô', 'o'], ['ê', 'è', 'é'], ['u', 'û'], ['ê', 'e']], strict: true }),
      dict('Je suis sûr que la fête dans la forêt aura beaucoup de goût.', { voice: 'f', strict: true }),
      say('Ouvre la fenêtre : on voit la forêt et les tours du vieux château.', 'Open the window: you can see the forest and the towers of the old castle.'),
    ],
    [
      b('Circumflex often marks a historical s still visible in related words: forêt/forestier, fête/festival.', 'Le circonflexe rappelle souvent un s ancien : forêt/forestier, fête/festival, hôpital/hospitalier.'),
      b('Always keep the circumflex on homophones: sûr/sur, mûr/mur, dû/du, tâche/tache.', 'Gardez toujours le circonflexe sur les homophones : sûr/sur, mûr/mur, dû/du, tâche/tache.'),
      b('Common â/ê/ô words: château, bâtiment, pâte, gâteau, fenêtre, tête, fête, côté, bientôt.', 'Mots courants à retenir : château, bâtiment, pâte, gâteau, fenêtre, tête, fête, côté, bientôt.'),
    ],
    [['mûr', b('ripe; mature', 'prêt à être mangé')], ['une tâche', b('a task, chore', 'travail à faire')], ['le goût', b('taste, flavour', 'saveur')]],
  ),
];
