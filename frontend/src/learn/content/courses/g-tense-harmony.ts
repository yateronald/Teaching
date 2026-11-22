import type { CourseAbout } from '../../types';
import { b, card, dict, doc, gap, lesson, mc, P, pairs, say, sort, tip, trap, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'At C2 level, expressing time relationships with precision separates fluent speakers from near-native writers. This course brings together three advanced systems: the sequence of tenses in the indicative after a past main clause (imparfait, plus-que-parfait, conditionnel présent and passé), the contrast between present and past subjunctive for simultaneity vs anteriority, and recognising and interpreting the literary imperfect and pluperfect subjunctive.',
    'Au niveau C2, la maîtrise fine des rapports temporels distingue le locuteur avancé du rédacteur accompli. Ce cours réunit trois systèmes exigeants : la concordance des temps à l’indicatif après une principale au passé (imparfait, plus-que-parfait, conditionnel présent et passé), l’opposition entre subjonctif présent et passé selon l’antériorité, et la reconnaissance active du subjonctif imparfait et plus-que-parfait en langue littéraire.',
  ),
  outcomes: [
    b('Express simultaneity, anteriority and posteriority after a past indicative verb', 'Exprimer simultanéité, antériorité et postériorité après un passé à l’indicatif'),
    b('Choose accurately between present and past subjunctive', 'Choisir avec rigueur entre subjonctif présent et subjonctif passé'),
    b('Distinguish the imperfect subjunctive (qu’il fût, qu’il parlât) from the passé simple', 'Distinguer l’imparfait du subjonctif (qu’il fût, qu’il parlât) du passé simple'),
    b('Read and interpret the pluperfect subjunctive (conditionnel passé 2e forme)', 'Lire et interpréter le plus-que-parfait du subjonctif'),
  ],
};

const C = 'g-tense-harmony';
export default [
  lesson(C, 1, ['indicative-sequence-of-tenses', 'concordance-a-l-indicatif'],
    b('Indicative sequence of tenses', 'La concordance des temps à l’indicatif'),
    b('Anchor past reported facts in time: simultaneous, earlier or future-in-the-past.', 'Situer un fait rapporté au passé : simultané, antérieur ou postérieur.'),
    [b('Use imparfait for simultaneity in the past', 'Employer l’imparfait pour la simultanéité au passé'), b('Use plus-que-parfait for anteriority', 'Employer le plus-que-parfait pour l’antériorité'), b('Use conditionnel présent and passé as future-in-the-past', 'Employer les conditionnels comme futurs du passé')],
    13,
    [
      card(b('Three time arrows from a past anchor', 'Trois rapports depuis un repère passé'), b('When the main clause is in the **past** (*Il a dit, il croyait, elle écrivit*), the subordinate clause shifts to show timing relative to that past moment: **simultaneity** → **imparfait** (*qu’il était là*); **anteriority** (earlier still) → **plus-que-parfait** (*qu’il avait déjà lu le dossier*); **posteriority** (still to come) → **conditionnel présent** (*qu’il viendrait*) or **conditionnel passé** for *future anterior* (*qu’il aurait fini avant le soir*).', 'Quand la principale est au **passé** (*Il a dit, il croyait, elle écrivit*), la subordonnée marque le rapport temporel : **simultanéité** → **imparfait** (*qu’il était là*) ; **antériorité** → **plus-que-parfait** (*qu’il avait déjà lu le dossier*) ; **postériorité** → **conditionnel présent** (*qu’il viendrait*) ou **conditionnel passé** pour un futur antérieur du passé (*qu’il aurait fini avant le soir*).'), {
        table: { head: [b('relation', 'rapport'), b('present anchor', 'repère présent'), b('past anchor', 'repère passé')], rows: [[b('simultaneous', 'simultané'), 'Il dit qu’il vient.', 'Il a dit qu’il venait.'], [b('anterior', 'antérieur'), 'Il dit qu’il est venu.', 'Il a dit qu’il était venu.'], [b('posterior', 'postérieur'), 'Il dit qu’il viendra.', 'Il a dit qu’il viendrait.'], [b('future perfect', 'futur antérieur'), 'Il dit qu’il aura fini.', 'Il a dit qu’il aurait fini.']] },
      }),
      tip(b('When the present survives in the past', 'Quand le présent demeure'), b('If the subordinate fact is a **timeless truth** or **still true right now**, keeping the present is accepted: **Le professeur a rappelé que l’eau bout à cent degrés.** **Elle m’a dit qu’elle habite toujours à Lyon.**', 'Pour une **vérité générale** ou un fait **toujours actuel**, le présent reste admis : **Le professeur a rappelé que l’eau bout à cent degrés.** **Elle m’a dit qu’elle habite toujours à Lyon.**')),
      sort(b('Relative timing in the past?', 'Quel rapport dans le passé ?'), [b('simultaneous', 'simultané'), b('anterior', 'antérieur'), b('posterior', 'postérieur')], [['Il savait qu’elle dormait.', 0], ['Il savait qu’elle était partie.', 1], ['Il savait qu’elle reviendrait.', 2], ['Elle comprit qu’il avait menti.', 1], ['Elle promit qu’elle écrirait.', 2], ['Elle voyait qu’il pleuvait.', 0]]),
      mc(P.form, ['aurait remis', 'a remis', 'remettra', 'avait remis'], { fr: 'Le directeur a assuré que l’équipe ___ le rapport avant vendredi prochain.' }),
      mc(P.form, ['avait oublié', 'a oublié', 'oublierait', 'oubliait'], { fr: 'Lorsque nous sommes arrivés, Marc a avoué qu’il ___ les clés la veille.' }),
      gap(P.complete, 'Elle m’a confié qu’elle ___ (préparer) un examen difficile et qu’elle ___ (partir) ensuite en Bretagne.', ['préparait', 'partirait']),
      dict('Il m’avait promis qu’il aurait relu le manuscrit avant que nous nous rencontrions.', { voice: 'm' }),
    ],
    [
      b('Past anchor: imparfait (same time), plus-que-parfait (earlier), conditionnel présent / passé (later).', 'Repère passé : imparfait (simultané), plus-que-parfait (antérieur), conditionnel présent / passé (postérieur).'),
      b('Conditionnel passé expresses a future-perfect-in-the-past: Il assura qu’il aurait terminé avant midi.', 'Le conditionnel passé sert de futur antérieur du passé : Il assura qu’il aurait terminé avant midi.'),
      b('Timeless truths or still-valid facts may keep the present.', 'Les vérités générales ou faits toujours actuels peuvent garder le présent.'),
    ],
    [['l’antériorité', b('anteriority (having happened earlier)', 'fait qui précède un autre')], ['la postériorité', b('posteriority (happening later)', 'fait qui suit un autre')], ['avouer', b('to admit, confess', 'reconnaître un fait')]],
  ),
  lesson(C, 2, ['present-vs-past-subjunctive', 'subjonctif-present-et-passe'],
    b('Present vs past subjunctive', 'Subjonctif présent et subjonctif passé'),
    b('Use the past subjunctive to express an action already completed relative to the main verb.', 'Employer le subjonctif passé pour marquer l’antériorité par rapport au verbe principal.'),
    [b('Build the subjonctif passé with avoir / être', 'Former le subjonctif passé avec avoir / être'), b('Contrast simultaneous vs anterior subjunctive', 'Opposer subjonctif de simultanéité et d’antériorité'), b('Agree past participles correctly inside the past subjunctive', 'Accorder les participes passés au subjonctif passé')],
    13,
    [
      card(b('Modern French uses aspect, not past-tense copying', 'L’aspect prime en français moderne'), b('In modern standard French, even when the main verb is in the past, you do **not** have to switch to the imperfect subjunctive. Choose between **subjonctif présent** (action not yet done / ongoing: *Je regrette qu’il parte / J’ai regretté qu’il parte*) and **subjonctif passé** (*aie / sois + participe passé*, action **already completed before** the main verb or before a future deadline: *Je regrette qu’il soit déjà parti. Il faut que vous ayez fini avant demain.*).', 'En français contemporain, même après une principale au passé, le choix dépend de l’aspect : **subjonctif présent** (simultané ou à venir : *J’ai regretté qu’il parte*) contre **subjonctif passé** (*aie / sois + participe passé*, accompli ou antérieur : *Je regrette qu’il soit déjà parti. Il faut que vous ayez fini avant demain.*).'), {
        ex: [['Bien qu’elle ait beaucoup travaillé, elle hésite encore.', 'Although she worked hard, she is still hesitating.'], ['Je suis ravi que vous soyez venus si nombreux.', 'I am delighted that so many of you came.'], ['Il faudra que nous ayons quitté la salle avant midi.', 'We will have to have left the room before noon.']],
      }),
      trap(b('Participle agreement in the past subjunctive', 'Accords au subjonctif passé'), b('All standard participle rules apply inside **soit / ait + participle**: **Je doute qu’elle soit arrivée** (*être* → *-e*); **Les décisions qu’il regrette qu’elle ait prises** (COD *que = les décisions* before *avoir* → *-es*); **Bien qu’elles se soient parlé** (COI → invariable).', 'Toutes les règles d’accord du participe restent valables : **Je doute qu’elle soit arrivée** (*être* → *-e*) ; **Les décisions qu’il regrette qu’elle ait prises** (COD avant *avoir* → *-es*) ; **Bien qu’elles se soient parlé** (COI → invariable).')),
      pairs(P.match, [['Je doute qu’elle vienne.', b('I doubt she is coming / will come.', 'simultané ou futur')], ['Je doute qu’elle soit venue.', b('I doubt she came.', 'antérieur (accompli)')], ['Il faut qu’il finisse.', b('He must finish.', 'action à venir')], ['Il faut qu’il ait fini à 18 h.', b('He must have finished by 6 p.m.', 'accompli avant une échéance')]]),
      mc(P.form, ['soient parties', 'partent', 'aient parti', 'sont parties'], { fr: 'Je regrette que mes sœurs ___ sans que nous ayons pu les saluer.' }),
      mc(P.form, ['ait réussies', 'ait réussi', 'a réussies', 'soit réussie'], { fr: 'Voici toutes les épreuves que je suis fier qu’elle ___.' }),
      gap(P.complete, 'Bien que tu ___ (envoyer) ta candidature hier, j’espère que tu ___ (garder) courage aujourd’hui.', ['aies envoyé', 'gardes'], { choices: [['aies envoyé', 'envoies', 'as envoyé'], ['gardes', 'aies gardé', 'gardais']] }),
      say('Je suis soulagé que vous soyez bien rentrés, même s’il est dommage que le train ait eu du retard.', 'I’m relieved you got home safely, even though it’s a shame the train was delayed.'),
    ],
    [
      b('Subjonctif présent = ongoing or future relative to the main verb.', 'Subjonctif présent = simultané ou à venir par rapport à la principale.'),
      b('Subjonctif passé = already completed before the main verb or a deadline.', 'Subjonctif passé = antérieur ou accompli avant une échéance.'),
      b('Standard être / avoir / COD participle agreements apply inside the past subjunctive.', 'Les accords habituels du participe s’appliquent au subjonctif passé.'),
    ],
    [['une échéance', b('a deadline, due date', 'date limite')], ['soulagé', b('relieved', 'rassuré')], ['accompli', b('completed', 'déjà achevé')]],
  ),
  lesson(C, 3, ['literary-imperfect-and-pluperfect-subjunctive', 'subjonctif-imparfait-et-plus-que-parfait'],
    b('The literary imperfect & pluperfect subjunctive', 'Subjonctif imparfait et plus-que-parfait'),
    b('Recognise and interpret qu’il fût, qu’il parlât and qu’il eût écrit in literature and formal prose.', 'Reconnaître et interpréter qu’il fût, qu’il parlât et qu’il eût écrit dans les textes littéraires.'),
    [b('Spot the circumflex that marks 3rd-person singular imperfect subjunctive', 'Repérer le circonflexe de la 3e personne du singulier'), b('Distinguish passé simple (il fut) from imperfect subjunctive (qu’il fût)', 'Distinguer passé simple (il fut) et imparfait du subjonctif (qu’il fût)'), b('Understand the pluperfect subjunctive / 2nd conditional past', 'Comprendre le plus-que-parfait du subjonctif')],
    13,
    [
      card(b('Built from the passé simple stem', 'Formé sur le passé simple'), b('Take the **tu** form of the **passé simple** and add **-sse, -sses, -^t, -ssions, -ssiez, -ssent**: *parler* → **qu’il parlât**; *finir* → **qu’il finît**; *venir* → **qu’il vînt**; *être* → **qu’il fût**; *avoir* → **qu’il eût**. In real literary prose and formal C2 essays, the **3rd person singular** (*qu’il fût, qu’il eût, qu’il vînt*) is by far the most common. The **plus-que-parfait du subjonctif** (*qu’il eût / fût + participe*) marks past anteriority or an unreal past hypothesis (*conditionnel passé 2e forme*).', 'On forme l’imparfait du subjonctif sur le **passé simple** : **-sse, -sses, -^t, -ssions, -ssiez, -ssent** (*qu’il parlât, qu’il finît, qu’il vînt, qu’il fût, qu’il eût*). Dans les textes et essais C2, on rencontre surtout la **3e personne du singulier**. Le **plus-que-parfait du subjonctif** (*qu’il eût / fût + participe*) marque l’antériorité dans le passé ou l’irréel du passé (*conditionnel passé 2e forme*).'), {
        ex: [['Il fallait qu’il prît une décision sur-le-champ.', 'He had to make a decision on the spot.'], ['Bien qu’elle eût promis de se taire, la rumeur courut.', 'Although she had promised to keep silent, the rumour spread.'], ['Eût-il insisté, rien n’eût changé.', 'Had he insisted, nothing would have changed.']],
      }),
      trap(b('Il fut vs qu’il fût; il parla vs qu’il parlât', 'Il fut ou qu’il fût ; il parla ou qu’il parlât'), b('Notice the **circumflex** on the vowel before **-t**! **Il fut** (passé simple = *he was*) vs **qu’il fût** (imperfect subjunctive = *that he might be*). **Il parla** vs **qu’il parlât**; **il eut** vs **qu’il eût**.', 'Attention au **circonflexe** devant **-t** ! **Il fut** (passé simple) contre **qu’il fût** (subjonctif imparfait). De même : **il parla** / **qu’il parlât**, **il eut** / **qu’il eût**, **il vint** / **qu’il vînt**.')),
      sort(b('Passé simple or imperfect subjunctive?', 'Passé simple ou imparfait du subjonctif ?'), [b('passé simple (indicative)', 'passé simple (indicatif)'), b('imperfect subjunctive', 'imparfait du subjonctif')], [['elle parla', 0], ['qu’elle parlât', 1], ['il fut surpris', 0], ['bien qu’il fût surpris', 1], ['elle vint tôt', 0], ['avant qu’elle ne vînt', 1]]),
      doc({ look: 'page', title: b('Passage littéraire', 'Passage littéraire'), text: 'Quoiqu’il n’eût jamais visité cette île, le narrateur en parlait comme s’il y eût vécu toute sa vie. Il craignait seulement que l’hiver ne vînt trop tôt et ne gâtât ses promenades.' }, P.read, [b('He had never visited the island, spoke as if he had lived there all his life, and feared winter would come too soon.', 'Il n’avait jamais visité l’île, en parlait comme s’il y avait vécu, et craignait que l’hiver n’arrive trop tôt.'), b('He lived on the island every winter.', 'Il vivait sur l’île chaque hiver.'), b('He hoped winter would arrive early.', 'Il espérait que l’hiver arrive tôt.'), b('He had already walked there in winter.', 'Il s’y était déjà promené en hiver.')]),
      mc(P.form, ['eût oublié', 'a oublié', 'eut oublié', 'ait oubliée'], { fr: 'Dans ce roman du XIXe siècle : « Elle redoutait qu’il n’___ sa promesse. »' }),
      gap(P.complete, 'Avant qu’il ne ___ (partir, subj. imparfait) et bien qu’elle ___ (être, subj. imparfait) bouleversée, il ___ (dire, passé simple) adieu.', ['partît', 'fût', 'dit'], { choices: [['partît', 'partit', 'parte'], ['fût', 'fut', 'soit'], ['dit', 'dît', 'disse']] }),
      write(b('Write a formal C2 paragraph.', 'Rédigez un paragraphe littéraire C2.'), b('Write a short literary or historical paragraph (45–80 words) using at least one sequence-of-tenses structure (plus-que-parfait or conditionnel passé), one subjonctif passé, and one 3rd-person singular imperfect or pluperfect subjunctive (e.g. bien qu’il fût, avant qu’elle n’eût…).', 'Rédigez un court paragraphe littéraire ou historique (45–80 mots) comprenant une concordance au passé (plus-que-parfait ou conditionnel passé), un subjonctif passé et un subjonctif imparfait ou plus-que-parfait (bien qu’il fût, avant qu’elle n’eût…).'), 45, 85, [
        b('Accurate past sequence of tenses', 'Concordance des temps maîtrisée au passé'),
        b('Correct subjonctif passé with agreement', 'Subjonctif passé exact avec accord'),
        b('Proper 3rd-person singular literary subjunctive with circumflex', 'Subjonctif littéraire à la 3e personne avec accent circonflexe'),
      ], 'Bien qu’il fût épuisé par la traversée, le capitaine affirma qu’il aurait remis le journal de bord avant l’aube. Ses officiers doutaient qu’il ait déjà rédigé les dernières pages, mais ils ignoraient qu’il eût travaillé toute la nuit. Ainsi voulut-il que son récit demeurât fidèle à la vérité.'),
    ],
    [
      b('Imperfect subjunctive 3rd singular adds a circumflex before -t: parlât, finît, vînt, fût, eût.', 'La 3e personne du singulier de l’imparfait du subjonctif porte un circonflexe : parlât, finît, vînt, fût, eût.'),
      b('Pluperfect subjunctive (eût / fût + participle) expresses past anteriority or unreal past.', 'Le plus-que-parfait du subjonctif marque l’antériorité passée ou l’irréel du passé.'),
      b('Active mastery means interpreting it effortlessly in literature and using it sparingly at C2.', 'La maîtrise active consiste à le lire aisément et à le doser avec justesse au C2.'),
    ],
    [['sur-le-champ', b('on the spot, immediately', 'immédiatement')], ['redouter', b('to dread, fear', 'craindre vivement')], ['demeurer', b('to remain', 'rester')]],
  ),
];
