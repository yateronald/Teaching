import { b, card, conj, gap, lesson, mc, ord, P, pairs, trap, write } from '../dsl';
import type { T, Step } from '../../types';
import { VERB_LESSON_MINUTES, VERB_ROWS, type VerbId } from '../../verbCatalog';
import { conjugation, type FormId } from './forms';
import { examples, moreScenes, type Scene } from './examples';

const TENSES = {
  present: [b('Present indicative', 'Présent de l’indicatif'), b('Use it for routines, facts and actions in progress.', 'Employez-le pour les habitudes, les faits et les actions en cours.')],
  imperfect: [b('Imparfait', 'Imparfait'), b('Set the scene or describe a repeated past action. Start from the present nous stem, except for être.', 'Posez le décor ou décrivez une habitude passée. Partez du radical de nous au présent, sauf pour être.')],
  perfect: [b('Passé composé', 'Passé composé'), b('Report a completed event. Use the auxiliary in the present plus the past participle.', 'Racontez un événement accompli. Employez l’auxiliaire au présent suivi du participe passé.')],
  pluperfect: [b('Plus-que-parfait', 'Plus-que-parfait'), b('Describe what had already happened. Use the auxiliary in the imparfait plus the past participle.', 'Indiquez ce qui s’était déjà passé. Employez l’auxiliaire à l’imparfait suivi du participe passé.')],
  recent: [b('Recent past', 'Passé récent'), b('Use venir de + infinitive for something that just happened.', 'Employez venir de suivi de l’infinitif pour une action qui vient de se produire.')],
  near: [b('Near future', 'Futur proche'), b('Use aller in the present + infinitive to announce a plan or something about to happen.', 'Employez aller au présent suivi de l’infinitif pour un projet ou un événement imminent.')],
  future: [b('Futur simple', 'Futur simple'), b('Add the future endings to the stem for a prediction, promise or future event.', 'Ajoutez les terminaisons du futur au radical pour une prévision, une promesse ou un événement à venir.')],
  futurePerfect: [b('Futur antérieur', 'Futur antérieur'), b('Use the future of the auxiliary to show that an action will already be complete at a future point.', 'Mettez l’auxiliaire au futur pour exprimer une action qui sera déjà accomplie à un moment à venir.')],
  conditional: [b('Present conditional', 'Conditionnel présent'), b('Use the future stem with the imparfait endings for a wish, polite request or hypothetical outcome.', 'Ajoutez les terminaisons de l’imparfait au radical du futur pour un souhait, une demande polie ou une conséquence hypothétique.')],
  conditionalPast: [b('Past conditional', 'Conditionnel passé'), b('Put the auxiliary in the present conditional for what would have happened under different circumstances.', 'Mettez l’auxiliaire au conditionnel présent pour ce qui se serait produit dans d’autres circonstances.')],
  subjunctive: [b('Present subjunctive', 'Subjonctif présent'), b('Use it after expressions such as il faut que or je doute que, depending on the construction.', 'Employez-le après des expressions comme il faut que ou je doute que, selon la construction.')],
  subjunctivePast: [b('Past subjunctive', 'Subjonctif passé'), b('Use the subjunctive of the auxiliary plus the participle for an action already accomplished: Je doute qu’il ait fini.', 'Employez l’auxiliaire au subjonctif suivi du participe pour une action accomplie. Exemple : Je doute qu’il ait fini.')],
  imperative: [b('Present imperative', 'Impératif présent'), b('Give advice or an instruction without writing the subject pronoun. The three forms correspond to tu, nous and vous.', 'Donnez un conseil ou une consigne sans écrire le pronom sujet. Les trois formes correspondent à tu, nous et vous.')],
  imperativePast: [b('Past imperative', 'Impératif passé'), b('This rare form asks for a task to be done by a deadline, as in « ayez fini avant midi ».', 'Cette forme rare demande qu’une tâche soit terminée à un moment donné, comme dans « ayez fini avant midi ».')],
  infinitive: [b('Present infinitive', 'Infinitif présent'), b('The dictionary form can follow a verb such as pouvoir.', 'La forme du dictionnaire peut suivre un verbe comme pouvoir.')],
  infinitivePast: [b('Past infinitive', 'Infinitif passé'), b('Use the auxiliary in the infinitive plus the past participle, for example after après.', 'Employez l’auxiliaire à l’infinitif suivi du participe passé, par exemple après la préposition après.')],
  presentParticiple: [b('Present participle', 'Participe présent'), b('A verbal form ending in -ant that can describe an action linked to a noun.', 'Forme verbale en -ant qui peut exprimer une action liée à un nom.')],
  pastParticiple: [b('Past participle', 'Participe passé'), b('The form used in compound tenses. It may agree according to the construction.', 'Forme employée aux temps composés. Son accord dépend de la construction.')],
  compoundParticiple: [b('Compound participle', 'Participe composé'), b('Ayant or étant + past participle can introduce a completed action in written French.', 'Ayant ou étant suivi du participe passé peut introduire une action déjà accomplie à l’écrit.')],
  gerund: [b('Present gerund', 'Gérondif présent'), b('En + present participle can show simultaneous actions or how something is done.', 'En suivi du participe présent peut montrer la simultanéité ou la manière.')],
  gerundPast: [b('Past gerund', 'Gérondif passé'), b('En + compound participle can mark an earlier action. This form is uncommon.', 'En suivi du participe composé peut signaler une action antérieure. Cette forme est peu courante.')],
  simplePast: [b('Passé simple', 'Passé simple'), b('It moves a written narrative forward. In ordinary conversation, the passé composé usually does this job.', 'Il fait avancer un récit écrit. À l’oral courant, le passé composé remplit généralement cette fonction.')],
  pastAnterior: [b('Passé antérieur', 'Passé antérieur'), b('Use the passé simple of the auxiliary for a completed event that precedes another event in a written narrative.', 'Employez l’auxiliaire au passé simple pour une action accomplie qui précède une autre action dans un récit écrit.')],
  literarySubjunctive: [b('Imperfect subjunctive', 'Subjonctif imparfait'), b('Recognise it after past verbs in formal or literary texts. Modern French usually uses the present subjunctive there.', 'Repérez-le après un verbe au passé dans un texte soutenu ou littéraire. Le français actuel emploie généralement le subjonctif présent dans ce contexte.')],
  literarySubjunctivePast: [b('Pluperfect subjunctive', 'Subjonctif plus-que-parfait'), b('Recognise this earlier action in literary texts. The same forms can serve as the second form of the past conditional.', 'Reconnaissez cette forme d’antériorité littéraire. Les mêmes formes peuvent servir de conditionnel passé deuxième forme.')],
} satisfies Record<FormId, [T, T]>;

const GROUPS = {
  1: b('Group 1 · regular -er pattern', '1er groupe · modèle en -er'),
  2: b('Group 2 · finir pattern', '2e groupe · modèle de finir'),
  3: b('Group 3 · other patterns', '3e groupe · autres modèles'),
  aux: b('Auxiliary · a special conjugation', 'Auxiliaire · conjugaison à part'),
};

export function verbLessons(id: VerbId) {
  const [, verb, meaning] = VERB_ROWS.find(row => row[0] === id)!;
  const { group, agrees, forms } = conjugation(id);
  const { use, tip, scenes } = examples[id];
  const [first, second, past, future, subj, literary] = scenes;
  const [background, earlier, deadline, hypothetical] = moreScenes[id];
  const agreement = agrees
    ? b('Use être. The participle agrees with the subject: add -e for the feminine and -s for the plural. Tables use masculine forms where the subject is marked (m.).', 'Employez être. Accordez le participe avec le sujet : ajoutez -e au féminin et -s au pluriel. Les indications (m.) et (m. pl.) signalent les formes masculines demandées.')
    : b('Use avoir. The participle normally stays unchanged here. It agrees with a direct object placed before the verb.', 'Employez avoir. Le participe reste généralement invariable ici. Il s’accorde avec un complément direct placé avant le verbe.');
  const form = (key: FormId, scene: Scene) => forms[key][scene[1]][1];
  const phrase = (key: FormId, scene: Scene) => scene[0].replace('___', form(key, scene)).replace(/^\p{L}/u, c => c.toUpperCase());
  const example = (key: FormId, scene: Scene): [string, string] => [phrase(key, scene), scene[2]];
  const inContext = (key: FormId, scene: Scene) => gap(
    b(`Complete in the ${TENSES[key][0].en}.`, `Complétez au temps indiqué : ${TENSES[key][0].fr}.`),
    scene[0], [form(key, scene)], { tr: scene[2], explain: TENSES[key][1] },
  );
  const chooseTense = (key: FormId, scene: Scene, alternatives: FormId[]) => mc(
    b('Which tense is used here?', 'Quel temps est employé dans cette phrase ?'),
    [key, ...alternatives].map(k => TENSES[k][0]),
    { fr: phrase(key, scene), explain: TENSES[key][1] },
  );
  const reorder = (key: FormId, scene: Scene) => ord(P.order, phrase(key, scene).replace(/\s*[.?!]$/, ''), { tr: scene[2] });
  const table = (key: FormId, scenesForTense: Scene[] = []): Step[] => {
    const [title, rule] = TENSES[key];
    const rows = forms[key];
    if (!rows.length) return [];
    return [
      card(title, rule, {
        table: { head: [b('Subject', 'Sujet'), b('Form', 'Forme')], rows: rows.map(([subject, value]) => [b(subject, subject), b(value, value)]) },
        ex: scenesForTense.map(scene => example(key, scene)),
      }),
      conj(verb, title, rows, { given: rows.length === 6 ? [0, 2, 3] : [0], explain: rule }),
    ];
  };

  const nonFinite: FormId[] = ['infinitive', 'infinitivePast', 'presentParticiple', 'pastParticiple', 'compoundParticiple', 'gerund', 'gerundPast'];
  const noImperative = trap(
    b('No imperative', 'Pas d’impératif'),
    b('Pouvoir has no imperative forms. To request an action, use a question such as « Pourriez-vous fermer la porte ? ».', 'Pouvoir n’a pas de formes à l’impératif. Pour demander une action, posez par exemple la question « Pourriez-vous fermer la porte ? ».'),
  );
  const set = (index: number, slug: [string, string], title: T, keys: FormId[], steps: Step[], notes: T[] = []) => lesson(
    `verb-${id}`, index + 1, slug, title,
    keys.map(key => TENSES[key][0]).reduce((a, label, i) => i === 0 ? label : b(`${a.en} · ${label.en}`, `${a.fr} · ${label.fr}`), b('', '')),
    keys.map(key => TENSES[key][1]), VERB_LESSON_MINUTES[index], steps, notes.length ? notes : keys.map(key => TENSES[key][1]),
  );

  return [
    set(0, ['meaning-and-present', 'sens-et-present'], b(`${verb} in everyday French`, `${verb} au quotidien`), ['present', 'infinitive'], [
      card(GROUPS[group], use, { points: [b(`${verb} means ${meaning}.`, `Le verbe étudié est « ${verb} ».`)] }),
      ...table('present', [first, second]),
      trap(b('Form or construction to remember', 'Forme ou construction à retenir'), tip),
      inContext('present', first), inContext('present', second), reorder('present', second),
    ], [use, tip]),
    set(1, ['past-tenses', 'les-temps-du-passe'], b('Narrating past events', 'Raconter au passé'), ['perfect', 'imperfect', 'pluperfect', 'recent'], [
      card(b('Choosing the auxiliary', 'Choisir l’auxiliaire'), agreement),
      ...table('perfect', [past]), inContext('perfect', past),
      ...table('imperfect', [background]), chooseTense('perfect', past, ['pluperfect', 'imperfect']),
      ...table('pluperfect', [earlier]), inContext('pluperfect', earlier), ...table('recent'),
    ], [agreement, TENSES.imperfect[1], TENSES.pluperfect[1], TENSES.recent[1]]),
    set(2, ['future-tenses', 'les-temps-du-futur'], b('Plans, forecasts and deadlines', 'Projets, prévisions et échéances'), ['near', 'future', 'futurePerfect'], [
      ...table('near'), ...table('future', [future]), inContext('future', future),
      ...table('futurePerfect', [deadline]), inContext('futurePerfect', deadline),
      chooseTense('future', future, ['near', 'futurePerfect']), reorder('future', future),
    ]),
    set(3, ['conditional-and-subjunctive', 'conditionnel-et-subjonctif'], b('Wishes, conditions and uncertainty', 'Souhaits, conditions et incertitude'), ['conditional', 'conditionalPast', 'subjunctive', 'subjunctivePast'], [
      ...table('conditional', [hypothetical]), inContext('conditional', hypothetical), ...table('conditionalPast'),
      ...table('subjunctive', [subj]), inContext('subjunctive', subj),
      ...table('subjunctivePast'), chooseTense('subjunctive', subj, ['subjunctivePast', 'conditionalPast']),
      write(b('Put the verb to work', 'Employez le verbe en situation'),
        b(`Write two sentences with ${verb}. State an everyday fact, then choose a context that calls for the subjunctive, such as a wish or a doubt.`, `Écrivez deux phrases avec ${verb}. Énoncez un fait du quotidien, puis choisissez un contexte qui appelle le subjonctif, comme un souhait ou un doute.`),
        8, 65, [b('Present indicative for the fact', 'Présent de l’indicatif pour le fait'), b('Present subjunctive in the second sentence', 'Subjonctif présent dans la deuxième phrase')], `${phrase('present', first)} ${phrase('subjunctive', subj)}`),
    ]),
    set(4, ['instructions-and-nonfinite-forms', 'imperatif-et-formes-impersonnelles'], b('Instructions and non-finite forms', 'Consignes et formes impersonnelles'), [
      ...(forms.imperative.length ? ['imperative' as const] : []), 'infinitivePast', 'presentParticiple', 'gerund',
    ], [
      ...(forms.imperative.length ? [...table('imperative'), ...table('imperativePast')] : [
        noImperative,
        mc(b('How can you ask to pay by card?', 'Comment demander à payer par carte ?'),
          ['Pourrais-je payer par carte ?', 'Peux payer par carte !', 'Puisses payer par carte !'],
          { explain: b('Pourrais-je is the conditional in an inverted question. Pouvoir has no imperative.', 'Pourrais-je est un conditionnel dans une question avec inversion. Pouvoir n’a pas d’impératif.') }),
      ]),
      card(b('Forms without a grammatical person', 'Formes sans personne grammaticale'), agreement, {
        table: {
          head: [b('Name', 'Nom'), b('Form', 'Forme')],
          rows: nonFinite.map(key => [TENSES[key][0], b(forms[key][0][1], forms[key][0][1])]),
        },
        points: (['infinitivePast', 'presentParticiple', 'compoundParticiple', 'gerund', 'gerundPast'] as const).map(key => TENSES[key][1]),
      }),
      pairs(b('Match each form to its name.', 'Associez chaque forme à son nom.'),
        (['infinitivePast', 'presentParticiple', 'compoundParticiple', 'gerund', 'gerundPast'] as const).map(key => [forms[key][0][1], TENSES[key][0]]), true),
      mc(b('Which form shows a completed action after « après »?', 'Quelle forme marque une action accomplie après « après » ?'),
        (['infinitivePast', 'compoundParticiple', 'gerundPast'] as const).map(key => b(forms[key][0][1], forms[key][0][1])),
        { explain: TENSES.infinitivePast[1] }),
      mc(b('Which form is the present gerund?', 'Quelle est la forme du gérondif présent ?'),
        (['gerund', 'presentParticiple', 'gerundPast'] as const).map(key => b(forms[key][0][1], forms[key][0][1])),
        { explain: TENSES.gerund[1] }),
    ]),
    set(5, ['literary-tenses', 'les-temps-litteraires'], b('Advanced reading · Literary tenses', 'Lecture avancée · Temps littéraires'), ['simplePast', 'pastAnterior', 'literarySubjunctive', 'literarySubjunctivePast'], [
      ...table('simplePast', [literary]), inContext('simplePast', literary),
      ...table('pastAnterior'), ...table('literarySubjunctive'), ...table('literarySubjunctivePast'),
      chooseTense('simplePast', literary, ['pastAnterior', 'imperfect']),
    ]),
  ];
}
