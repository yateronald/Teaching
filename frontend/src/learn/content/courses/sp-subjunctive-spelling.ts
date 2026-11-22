import type { CourseAbout } from '../../types';
import { b, card, conj, dict, gap, hear, lesson, mc, P, pairs, say, sort, tip, trap } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'In spoken French, nous voyons and nous voyions sound almost alike, while il voit and qu’il voie, il conclut and qu’il conclue, or il travaille and qu’il travaille sound completely identical. Spelling them correctly depends on spotting the grammatical mood and tense from context. This B1 course trains your ear for the -ions / -iez glide, drills singular subjunctive endings (-e, -es, -e) and gives you fast context tests to avoid verb homophone errors.',
    'À l’oral, nous voyons et nous voyions sont proches, tandis que il voit et qu’il voie, il conclut et qu’il conclue, ou il travaille et qu’il travaille se prononcent de façon identique. Bien les écrire suppose d’identifier le mode et le temps grâce au contexte. Ce cours B1 exerce votre oreille sur -ions / -iez, fixe les terminaisons du subjonctif singulier et vous donne des tests rapides pour déjouer ces homophones verbaux.',
  ),
  outcomes: [
    b('Distinguish -ons / -ez (present) from -ions / -iez (imperfect & subjunctive)', 'Distinguer -ons / -ez (présent) de -ions / -iez (imparfait et subjonctif)'),
    b('Spell double-i forms cleanly (nous étudiions, nous riions, vous oubliiez)', 'Écrire sans erreur les formes en -ii- (nous étudiions, nous riions, vous oubliiez)'),
    b('Contrast silent indicative (-t, -d, -s) vs subjunctive (-e, -es) endings', 'Opposer les finales muettes de l’indicatif (-t, -d, -s) et du subjonctif (-e, -es)'),
    b('Use sentence triggers (il faut que, bien que vs pendant que) to pick the right spelling', 'Utiliser les déclencheurs de phrase pour choisir la bonne orthographe'),
  ],
};

const C = 'sp-subjunctive-spelling';
export default [
  lesson(C, 1, ['nous-vous-present-vs-imperfect-subjunctive', 'nous-et-vous-present-imparfait-subjonctif'],
    b('Nous voyons vs nous voyions (-ons / -ions)', 'Nous voyons ou nous voyions (-ons / -ions)'),
    b('Hear and spell the extra i of the imperfect and subjunctive with nous and vous.', 'Entendre et écrire le i de l’imparfait et du subjonctif avec nous et vous.'),
    [b('Write -yions / -yiez for croire, voir, payer, nettoyer', 'Écrire -yions / -yiez pour croire, voir, payer, nettoyer'), b('Write double i (-iions / -iiez) for -ier verbs and rire', 'Écrire double i (-iions / -iiez) pour les verbes en -ier et rire'), b('Use tense and mood cues to choose -ons vs -ions', 'Utiliser le temps et le mode pour choisir -ons ou -ions')],
    13,
    [
      card(b('Never drop the « i » after y, i or ill!', 'Ne supprimez jamais le « i » après y, i ou ill !'), b('With **nous** and **vous**, both the **imparfait** (*hier, autrefois*) and the **subjonctif présent** (*il faut que, bien que*) ALWAYS end in **-ions** and **-iez**. After **y** (*voir, croire, payer*) that makes **nous voyions, vous croyiez, nous payions**. After **i** (*étudier, oublier, crier, rire*) that gives **two i’s**: **nous étudiions, vous oubliiez, nous riions**. After **-ill-** (*travailler*), keep **-ions / -iez**: **nous travaillions**.', 'Avec **nous** et **vous**, l’**imparfait** et le **subjonctif présent** finissent TOUJOURS par **-ions** et **-iez**. Après **y** : **nous voyions, vous croyiez, nous payions**. Après **i** (*étudier, oublier, rire*) : **deux i** (**nous étudiions, vous oubliiez, nous riions**). Après **-ill-** (*travailler*) : **nous travaillions**.'), {
        table: { head: [b('verb', 'verbe'), b('present indicative', 'présent de l’indicatif'), b('imperfect / subjunctive', 'imparfait / subjonctif')], rows: [['voir', 'nous voyons', 'nous voyions'], ['croire', 'vous croyez', 'vous croyiez'], ['étudier', 'nous étudions', 'nous étudiions'], ['rire', 'nous rions', 'nous riions']] },
      }),
      tip(b('The « prendre » / « venir » test!', 'Le test avec « prendre » ou « venir »'), b('Unsure whether **nous étudions** or **nous étudiions** is needed? Temporarily replace the verb with **prendre** (*nous prenons* vs *nous prenions / prenions*) or **finir** (*nous finissons* vs *nous finissions*)! If you hear **-ions**, you MUST write **-iions** or **-yions**.', 'Vous hésitez entre **nous étudions** et **nous étudiions** ? Remplacez mentalement par **prendre** (*nous prenons* contre *nous prenions*) ! Si vous entendez **-ions**, écrivez **-iions** ou **-yions**.')),
      hear('Il faut absolument que nous voyions ce film ensemble ce week-end.', P.listen, [b('« nous voyions » (subjunctive after il faut que)', '« nous voyions » (subjonctif après il faut que)'), b('« nous voyons » (present indicative)', '« nous voyons » (présent de l’indicatif)'), b('« nous verrons » (future)', '« nous verrons » (futur)'), b('« nous avons vu » (passé composé)', '« nous avons vu » (passé composé)')]),
      mc(P.spelling, ['L’an dernier, nous étudiions ensemble et vous oubliiez toujours vos cahiers.', 'L’an dernier, nous étudions ensemble et vous oubliez toujours vos cahiers.', 'L’an dernier, nous étudiions ensemble et vous oubliez toujours vos cahiers.', 'L’an dernier, nous étudions ensemble et vous oubliiez toujours vos cahiers.']),
      mc(P.spelling, ['Bien que nous croyions à ce projet, il faut que vous payiez l’acompte.', 'Bien que nous croyons à ce projet, il faut que vous payez l’acompte.', 'Bien que nous croyions à ce projet, il faut que vous payez l’acompte.', 'Bien que nous croyons à ce projet, il faut que vous payiez l’acompte.']),
      gap(P.complete, 'Maintenant, nous ___ (voir) la mer ; il faut pourtant que nous ___ (payer) l’addition et que nous ___ (remercier) le serveur.', ['voyons', 'payions', 'remerciions'], { strict: true }),
      dict('Autrefois, nous riions souvent quand vous nous envoyiez des cartes postales.', { voice: 'f', strict: true }),
    ],
    [
      b('With nous / vous, imperfect and present subjunctive always keep -ions / -iez.', 'Avec nous / vous, imparfait et subjonctif présent gardent toujours -ions / -iez.'),
      b('y + i → nous voyions, vous croyiez; i + i → nous étudiions, nous riions, vous oubliiez.', 'y + i → nous voyions, vous croyiez ; i + i → nous étudiions, nous riions, vous oubliiez.'),
      b('Test with prendre: nous prenons → -ons; nous prenions → -yions / -iions.', 'Test avec prendre : nous prenons → -ons ; nous prenions → -yions / -iions.'),
    ],
    [['un acompte', b('a deposit (partial payment)', 'somme versée d’avance')], ['autrefois', b('in the past, formerly', 'dans le passé')], ['remercier', b('to thank', 'dire merci')]],
  ),
  lesson(C, 2, ['singular-subjunctive-homophones', 'homophones-du-subjonctif-singulier'],
    b('Qu’il voie vs il voit: singular endings', 'Qu’il voie ou il voit : les finales au singulier'),
    b('Spell verbs whose indicative ends in -t and whose subjunctive ends in -e.', 'Écrire les verbes dont l’indicatif finit en -t et le subjonctif en -e.'),
    [b('Conjugate voir / croire in the present subjunctive', 'Conjuguer voir / croire au subjonctif présent'), b('Distinguish il voit / croit / rit / conclut from qu’il voie / croie / rie / conclue', 'Distinguer il voit / croit / rit / conclut de qu’il voie / croie / rie / conclue'), b('Spell il fuit / qu’il fuie and il envoie / qu’il envoie', 'Écrire il fuit / qu’il fuie et il envoie / qu’il envoie')],
    13,
    [
      card(b('Silent -t vs silent -e', 'Un -t muet contre un -e muet'), b('Several vowel-stem verbs sound identical in the indicative and the subjunctive singular, yet change spelling: **il voit → qu’il voie**, **il croit → qu’il croie**, **il rit → qu’il rie**, **il fuit → qu’il fuie**, **il conclut → qu’il conclue**, **il crée → qu’il crée** (1st group keeps *-e*). Remember: subjunctive singular endings are **always -e, -es, -e** (except *avoir: ait* and *être: soit*).', 'Plusieurs verbes dont le radical finit par une voyelle ont la même prononciation aux deux modes, mais une orthographe différente : **il voit → qu’il voie**, **il croit → qu’il croie**, **il rit → qu’il rie**, **il fuit → qu’il fuie**, **il conclut → qu’il conclue**. Au singulier, le subjonctif finit **toujours par -e, -es, -e** (sauf *avoir : ait* et *être : soit*).'), {
        ex: [['Il voit le problème, mais je doute qu’il voie la solution.', 'He sees the problem, but I doubt he sees the solution.'], ['Elle croit à sa chance ; il faut qu’elle y croie encore.', 'She believes in her luck; she must still believe in it.'], ['Il conclut son discours avant qu’elle ne conclue le sien.', 'He finishes his speech before she finishes hers.']],
      }),
      conj('voir', b('present subjunctive', 'subjonctif présent'), [['que je', 'voie'], ['que tu', 'voies'], ['qu’il / elle', 'voie'], ['que nous', 'voyions'], ['que vous', 'voyiez'], ['qu’ils / elles', 'voient']], { given: [0] }),
      pairs(P.match, [['il voit', 'qu’il voie'], ['il croit', 'qu’il croie'], ['il rit', 'qu’il rie'], ['il conclut', 'qu’il conclue']], true),
      mc(P.spelling, ['Je veux qu’il croie en lui et qu’il voie ses progrès.', 'Je veux qu’il croit en lui et qu’il voit ses progrès.', 'Je veux qu’il croie en lui et qu’il voit ses progrès.', 'Je veux qu’il croit en lui et qu’il voie ses progrès.']),
      mc(P.spelling, ['Il faut qu’elle sourie davantage, même si elle fuit les caméras.', 'Il faut qu’elle sourit davantage, même si elle fuie les caméras.', 'Il faut qu’elle sourie davantage, même si elle fuie les caméras.', 'Il faut qu’elle sourit davantage, même si elle fuit les caméras.']),
      gap(P.complete, 'Marc ___ (conclure, ind.) l’accord aujourd’hui, pourvu qu’Anne le ___ (conclure, subj.) aussi et qu’il ___ (rire, subj.) enfin.', ['conclut', 'conclue', 'rie'], { strict: true }),
      dict('Je doute qu’elle voie la sortie avant qu’il ne conclue la réunion.', { voice: 'm', strict: true }),
    ],
    [
      b('Indicative singular: il voit, il croit, il rit, il fuit, il conclut (-t).', 'Indicatif singulier : il voit, il croit, il rit, il fuit, il conclut (-t).'),
      b('Subjunctive singular: qu’il voie, qu’il croie, qu’il rie, qu’il fuie, qu’il conclue (-e).', 'Subjonctif singulier : qu’il voie, qu’il croie, qu’il rie, qu’il fuie, qu’il conclue (-e).'),
      b('-er verbs already end in -e: il envoie / qu’il envoie.', 'Verbes en -er : -e aux deux modes (il envoie / qu’il envoie).'),
    ],
    [['conclure', b('to conclude, wrap up', 'terminer un accord ou discours')], ['fuir', b('to flee, avoid', 's’échapper, éviter')], ['davantage', b('more', 'plus')]],
  ),
  lesson(C, 3, ['context-test-indicative-vs-subjunctive', 'reperer-le-mode-par-le-contexte'],
    b('Context tests: qu’il ait vs il est, sois vs soit', 'Tests de contexte : qu’il ait ou il est, sois ou soit'),
    b('Use sentence clues to spell verb homophones accurately in full sentences.', 'Utiliser les indices de la phrase pour orthographier sans erreur les homophones verbaux.'),
    [b('Distinguish il est from qu’il ait', 'Distinguer il est de qu’il ait'), b('Spell je sois / tu sois / qu’il soit / imperative sois', 'Écrire je sois / tu sois / qu’il soit / impératif sois'), b('Use replacement with prendre / venir to verify mood in context', 'Vérifier le mode par le remplacement avec prendre / venir')],
    13,
    [
      card(b('Context always gives the answer', 'Le contexte donne toujours la clé'), b('Many verb pairs sound identical: **il est** (indicative of *être*) vs **qu’il ait** (subjunctive of *avoir*, both often **[ɛ]** before a consonant!). Replace with **imparfait** (*il était* vs *il avait*) to verify! Same trick for **tu es** (*tu étais*) vs **que tu aies** (*que tu aies eu*), and **il sait** vs **c’est / s’est**: replace *il sait* with *il savait*, *c’est* with *c’était*.', 'Beaucoup de formes sont homophones : **il est** (*être*) et **qu’il ait** (*avoir*), **tu es** et **que tu aies**. Test infaillible : passez à l’**imparfait** ! **il est → il était** (*être*) ; **qu’il ait → qu’il avait** (*avoir*). De même, pour vérifier le **subjonctif** après une conjonction, remplacez par **venir** (*qu’il vienne* vs *il vient*).'), {
        ex: [['Bien qu’il ait froid, il est sorti sans manteau.', 'Although he is cold, he went out without a coat.'], ['Sois patient : il faut que tu sois prêt à huit heures.', 'Be patient: you must be ready at eight.'], ['Je sais qu’il voit tout, mais je crains qu’il n’ait tort.', 'I know he sees everything, but I fear he is wrong.']],
      }),
      trap(b('Qu’il ait vs il est; sois vs soit vs soie', 'Qu’il ait ou il est ; sois, soit ou soie'), b('Check subject and meaning: **qu’il ait raison** = *avoir* (*il avait raison*); **il est content** = *être* (*il était content*). For **[swa]**: **que je sois, que tu sois, sois !** (imperative = *-s*), **qu’il soit** (*-t*), **la soie** (silk = *-e*).', 'Vérifiez auxiliaire et personne : **qu’il ait raison** (*avoir* → *il avait*) contre **il est content** (*être* → *il était*). Pour **[swa]** : **que je sois, que tu sois, sois !** (impératif = *-s*), **qu’il soit** (*-t*), **la soie** (tissu = *-e*).')),
      sort(b('Indicative (est / voit / étudions) or subjunctive (ait / voie / étudiions)?', 'Indicatif ou subjonctif ?'), [b('indicative', 'indicatif'), b('subjunctive', 'subjonctif')], [['Je suis sûr qu’il … raison.', 0], ['Bien qu’il … tort, il insiste.', 1], ['Pendant que nous … ce texte…', 0], ['Pour que nous … ce texte…', 1], ['On sait qu’elle … clair.', 0], ['Je veux qu’elle … clair.', 1]]),
      mc(P.spelling, ['Bien qu’il ait beaucoup de travail, il est toujours ponctuel.', 'Bien qu’il est beaucoup de travail, il ait toujours ponctuel.', 'Bien qu’il ait beaucoup de travail, il ait toujours ponctuel.', 'Bien qu’il est beaucoup de travail, il est toujours ponctuel.']),
      mc(P.spelling, ['Sois prudent et attends que ton frère soit rentré.', 'Soit prudent et attends que ton frère sois rentré.', 'Sois prudent et attends que ton frère soie rentré.', 'Soit prudent et attends que ton frère soit rentré.']),
      gap(P.complete, 'Tu ___ (être, ind.) ravi qu’il ___ (avoir, subj.) réussi, mais ___ (être, impér.) sûr qu’il ___ (voir, subj.) ton message.', ['es', 'ait', 'sois', 'voie'], { strict: true }),
      dict('Bien qu’il ait peu de temps, il est certain que nous voyions nos amis demain.', { voice: 'f', strict: true }),
      say('Il est patient, bien qu’il ait beaucoup de travail avant que l’équipe ne voie les résultats.', 'He is patient, although he has a lot of work before the team sees the results.'),
    ],
    [
      b('il est (était) ≠ qu’il ait (avait): test with the imperfect!', 'il est (était) ≠ qu’il ait (avait) : testez avec l’imparfait !'),
      b('je sois / tu sois / impérative sois (-s); qu’il soit (-t).', 'je sois / tu sois / impératif sois (-s) ; qu’il soit (-t).'),
      b('When unsure between present and subjunctive, swap in venir (il vient vs qu’il vienne).', 'En cas de doute entre indicatif et subjonctif, remplacez par venir (il vient / qu’il vienne).'),
    ],
    [['ponctuel', b('punctual, on time', 'qui arrive à l’heure')], ['avoir tort', b('to be wrong', 'se tromper')], ['la soie', b('silk', 'tissu précieux')]],
  ),
];
