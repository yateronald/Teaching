import type { CourseAbout, Lesson } from '../../types';
import { b, card, dict, dlg, gap, hear, lesson, mc, ord, P, pairs, say, sort, tip, trap, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'At B2 level, hypotheses go far beyond si. Express precaution with au cas où, restrictive conditions with à condition que and pourvu que, exceptions with à moins que and its optional ne explétif, and clean same-subject reductions with à condition de and à moins de.',
    'Au niveau B2, l’hypothèse dépasse largement le simple « si ». Exprimez la précaution avec au cas où, la condition restrictive avec à condition que et pourvu que, l’exception avec à moins que et son ne explétif facultatif, ainsi que les réductions infinitives avec à condition de et à moins de.',
  ),
  outcomes: [
    b('Choose accurately between the conditional, subjunctive and infinitive in hypotheses', 'Choisir avec précision entre conditionnel, subjonctif et infinitif dans l’hypothèse'),
    b('Use au cas où and dans l’hypothèse où for contingencies', 'Employer au cas où et dans l’hypothèse où pour exprimer l’éventualité'),
    b('Handle à moins que and the optional ne explétif naturally', 'Maîtriser à moins que et le ne explétif facultatif'),
    b('Simplify clauses with à condition de and à moins de when the subject matches', 'Alléger la phrase avec à condition de et à moins de à sujet identique'),
  ],
};

const C = 'gr-hypotheses-without-si';

const lessons: Lesson[] = [
  lesson(
    C,
    1,
    ['contingency-and-condition', 'eventualite-et-condition'],
    b('Precaution and contingency: au cas où, dans l’hypothèse où', 'Précaution et éventualité : au cas où, dans l’hypothèse où'),
    b('Express an imagined eventuality or precaution using the conditional mood.', 'Exprimer une éventualité ou une précaution grâce au conditionnel.'),
    [
      b('Build clauses with au cas où and pour le cas où', 'Construire des phrases avec au cas où et pour le cas où'),
      b('Use dans l’hypothèse où and quand bien même in formal prose', 'Employer dans l’hypothèse où et quand bien même à l’écrit soutenu'),
      b('Avoid the indicative or si mistake after au cas où', 'Éviter l’indicatif et la confusion avec si après au cas où'),
    ],
    13,
    [
      card(
        b('Eventuality takes the conditional', 'L’éventualité appelle le conditionnel'),
        b(
          'To introduce a possible scenario you are preparing for, French uses **au cas où**, **pour le cas où** or **dans l’hypothèse où** followed by the **conditionnel** (present or past). For a strong hypothetical concession (“even if”), **quand bien même** also takes the conditional.\n\nConditional triggers: **au cas où, pour le cas où, dans l’hypothèse où**.\nConcessive hypothesis: **quand bien même · même dans le cas où**.',
          'Pour présenter un scénario possible auquel on se prépare, le français emploie **au cas où**, **pour le cas où** ou **dans l’hypothèse où** suivis du **conditionnel** (présent ou passé). Pour une concession hypothétique forte (« même si »), **quand bien même** appelle aussi le conditionnel.\n\nSuivis du conditionnel : **au cas où, pour le cas où, dans l’hypothèse où**.\nHypothèse concessive : **quand bien même · même dans le cas où**.',
        ),
        {
          table: {
            head: [b('Expression', 'Locution'), b('Mood', 'Mode'), b('Nuance', 'Nuance')],
            rows: [
              ['au cas où', b('conditional', 'conditionnel'), b('precaution, in case', 'précaution, éventualité')],
              ['pour le cas où', b('conditional', 'conditionnel'), b('formal precaution', 'précaution (soutenu)')],
              ['dans l’hypothèse où', b('conditional', 'conditionnel'), b('formal scenario', 'scénario envisagé')],
              ['quand bien même', b('conditional', 'conditionnel'), b('even if (strong)', 'même si (soutenu)')],
            ],
          },
          ex: [
            ['Prends un parapluie au cas où il pleuvrait cet après-midi.', 'Take an umbrella in case it rains this afternoon.'],
            ['Dans l’hypothèse où la réunion serait reportée, nous vous préviendrons.', 'In the event that the meeting is postponed, we will let you know.'],
            ['Quand bien même il refuserait notre offre, nous aurions tenté notre chance.', 'Even if he refused our offer, we would have tried our luck.'],
          ],
        },
      ),
      trap(
        b('Never use si or the future after au cas où', 'Jamais de si ni de futur après au cas où'),
        b(
          'In standard and formal B2 French, **au cas où** is followed by the **conditionnel**, not the present, the future, or *si*. Say **au cas où il appellerait**, never *au cas où s’il appelle* or *au cas où il appellera*.\n\nIncorrect: **au cas où s’il vient · au cas où il viendra**.\nCorrect: **au cas où il viendrait · au cas où il serait venu**.',
          'En français standard et soutenu (B2), **au cas où** est suivi du **conditionnel**, et non du présent, du futur ou de *si*. On dit **au cas où il appellerait**, jamais *au cas où s’il appelle* ni *au cas où il appellera*.\n\nÀ éviter : **au cas où s’il vient · au cas où il viendra**.\nCorrect : **au cas où il viendrait · au cas où il serait venu**.',
        ),
      ),
      mc(
        P.form,
        ['annulerait', 'annule', 'annulera', 'annulait'],
        {
          fr: 'Je garde les billets d’avion au cas où la compagnie ___ le vol.',
          explain: b('Au cas où always calls for the conditional (annulerait) in B2 French.', 'Au cas où demande le conditionnel (annulerait) en français B2.'),
        },
      ),
      mc(
        P.choose,
        ['Dans l’hypothèse où', 'Au cas si', 'Pourvu où', 'En cas que'],
        {
          fr: '___ les travaux prendraient du retard, un plan B a été prévu.',
          explain: b('Dans l’hypothèse où + conditional introduces a formal scenario.', 'Dans l’hypothèse où + conditionnel introduit un scénario formel.'),
        },
      ),
      gap(
        P.complete,
        'Note mon numéro au cas où tu ___ (avoir) besoin d’aide. Dans l’hypothèse où vous ___ (ne pas recevoir) le dossier à temps, contactez le secrétariat.',
        [['aurais'], ['ne recevriez pas']],
        { hint: b('Use the present conditional after both triggers.', 'Employez le conditionnel présent après les deux locutions.') },
      ),
      hear(
        'Au cas où le train aurait du retard, je prendrais le suivant.',
        b('What mood follows « au cas où » in this sentence?', 'Quel mode suit « au cas où » dans cette phrase ?'),
        [
          b('The conditional (aurait)', 'Le conditionnel (aurait)'),
          b('The subjunctive (ait)', 'Le subjonctif (ait)'),
          b('The simple future (aura)', 'Le futur simple (aura)'),
        ],
      ),
      ord(
        P.order,
        'Quand bien même ils partiraient tôt, la route resterait longue.',
        { tr: 'Even if they left early, the journey would still be long.' },
      ),
      pairs(
        P.match,
        [
          ['au cas où', b('just in case (precaution)', 'par précaution, si jamais')],
          ['dans l’hypothèse où', b('in the event that (formal)', 'si ce scénario se réalise')],
          ['quand bien même', b('even if (concessive)', 'même dans l’éventualité où')],
          ['pour le cas où', b('for the eventuality that', 'en prévision du cas où')],
        ],
      ),
      dict('Je laisse les clés chez la gardienne au cas où vous arriveriez avant moi.'),
      say('Dans l’hypothèse où ce poste se libérerait, je présenterais ma candidature.', 'In the event that this position opens up, I would apply.'),
    ],
    [
      b('au cas où, pour le cas où, dans l’hypothèse où + conditional express precaution or scenario.', 'au cas où, pour le cas où, dans l’hypothèse où + conditionnel expriment une précaution ou un scénario.'),
      b('quand bien même + conditional means “even if” in formal prose.', 'quand bien même + conditionnel signifie « même si » dans un registre soutenu.'),
      b('Never add si or use the future tense directly after au cas où.', 'N’ajoutez jamais si et n’employez pas le futur simple juste après au cas où.'),
    ],
    [
      ['au cas où', b('in case (+ conditional)', 'dans l’éventualité où')],
      ['dans l’hypothèse où', b('in the event that', 'si l’on envisage que')],
      ['quand bien même', b('even if (+ conditional)', 'même si, dans tous les cas')],
      ['une éventualité', b('a contingency, possibility', 'un événement possible')],
    ],
  ),

  lesson(
    C,
    2,
    ['restrictive-conditions-subjunctive', 'conditions-restrictives-subjonctif'],
    b('Conditions with the subjunctive: à condition que, à moins que', 'Conditions au subjonctif : à condition que, à moins que'),
    b('Impose conditions, suppose a premise, or state an exception using the subjunctive.', 'Poser une condition, supposer un fait ou exprimer une exception au subjonctif.'),
    [
      b('Distinguish à condition que, pourvu que and à moins que', 'Distinguer à condition que, pourvu que et à moins que'),
      b('Use en admettant que and à supposer que to frame a hypothesis', 'Utiliser en admettant que et à supposer que pour poser une hypothèse'),
      b('Understand the optional ne explétif after à moins que', 'Comprendre le ne explétif facultatif après à moins que'),
    ],
    13,
    [
      card(
        b('Essential conditions and assumptions', 'Conditions indispensables et suppositions'),
        b(
          'When a hypothesis expresses an **indispensable condition**, an **exception**, or a **pure assumption**, French requires the **subjonctif**. Notice how **pourvu que** often carries a note of hope (“as long as / let’s hope”), whereas **à condition que** states a strict requirement.\n\nRequirement: **à condition que, pourvu que, sous réserve que**.\nAssumption: **en admettant que, à supposer que, en supposant que**.\nException or exclusion: **à moins que · sans que**.',
          'Quand une hypothèse exprime une **condition indispensable**, une **exception** ou une **simple supposition**, le français exige le **subjonctif**. Notez que **pourvu que** ajoute souvent une nuance de souhait, tandis que **à condition que** pose une exigence précise.\n\nExigence : **à condition que, pourvu que, sous réserve que**.\nSupposition : **en admettant que, à supposer que, en supposant que**.\nException ou exclusion : **à moins que · sans que**.',
        ),
        {
          table: {
            head: [b('Conjunction', 'Conjonction'), b('Mood', 'Mode'), b('Meaning', 'Sens')],
            rows: [
              ['à condition que', b('subjunctive', 'subjonctif'), b('provided that', 'si et seulement si')],
              ['pourvu que', b('subjunctive', 'subjonctif'), b('as long as (often wish)', 'à condition que, si seulement')],
              ['en admettant que / à supposer que', b('subjunctive', 'subjonctif'), b('assuming that', 'en partant du principe que')],
              ['à moins que (+ ne)', b('subjunctive', 'subjonctif'), b('unless', 'sauf si')],
              ['sans que', b('subjunctive', 'subjonctif'), b('without …-ing', 'sans le fait que')],
            ],
          },
          ex: [
            ['Nous signerons le contrat à condition que chaque clause soit clarifiée.', 'We will sign the contract provided that every clause is clarified.'],
            ['En admettant que le budget suffise, le chantier débutera en mai.', 'Assuming the budget is enough, construction will begin in May.'],
            ['Il a pris cette décision sans que personne en soit informé.', 'He made that decision without anyone being informed of it.'],
          ],
        },
      ),
      trap(
        b('The optional ne explétif after à moins que', 'Le ne explétif facultatif après à moins que'),
        b(
          'In careful written French, **à moins que** often carries a **ne explétif**: **à moins qu’il ne pleuve**. This **ne** is NOT a negation; it means the exact same thing as **à moins qu’il pleuve** (“unless it rains”). Never add **pas** unless you truly mean “unless he does not…”.\n\nSame meaning: **à moins qu’il pleuve · à moins qu’il ne pleuve**.\nTrue negative exception: **à moins qu’il ne vienne pas**.',
          'Dans une langue soignée, **à moins que** s’accompagne souvent d’un **ne explétif** : **à moins qu’il ne pleuve**. Ce **ne** n’est PAS une négation ; la phrase a exactement le même sens que **à moins qu’il pleuve**. N’ajoutez **pas** que si vous voulez vraiment dire « sauf s’il ne… pas ».\n\nSens identique : **à moins qu’il pleuve · à moins qu’il ne pleuve**.\nException négative réelle : **à moins qu’il ne vienne pas**.',
        ),
        {
          ex: [
            ['Nous déjeunerons sur la terrasse, à moins qu’il ne fasse trop froid.', 'We will have lunch on the terrace, unless it is too cold.'],
          ],
        },
      ),
      mc(
        P.form,
        ['soit', 'est', 'sera', 'serait'],
        {
          fr: 'Je te prête ma voiture à condition que tu ___ prudent.',
          explain: b('À condition que always governs the subjunctive (soit).', 'À condition que gouverne toujours le subjonctif (soit).'),
        },
      ),
      mc(
        P.meaning,
        [
          b('Unless the strike continues, the museum will open tomorrow.', 'Sauf si la grève continue, le musée ouvrira demain.'),
          b('Because the strike will not continue, the museum will open.', 'Comme la grève ne continuera pas, le musée ouvrira.'),
          b('Provided the strike continues, the museum will stay open.', 'À condition que la grève continue, le musée restera ouvert.'),
        ],
        {
          fr: 'À moins que la grève ne continue, le musée ouvrira demain.',
          explain: b('The ne in à moins que la grève ne continue is expletive, not negative.', 'Le ne dans à moins que la grève ne continue est explétif, et non négatif.'),
        },
      ),
      gap(
        P.complete,
        'En admettant que nous ___ (pouvoir) partir vendredi, nous réserverons le gîte. Il s’est engagé sans que ses associés le ___ (savoir).',
        [['puissions'], ['sachent']],
      ),
      gap(
        P.complete,
        'Rendez-vous à dix heures devant la gare, à moins que le train ___ (avoir) du retard.',
        [['n’ait', 'ait']],
        {
          choices: [['n’ait', 'a', 'aura', 'aurait']],
          explain: b('À moins que takes the subjunctive, commonly with an optional ne explétif (n’ait).', 'À moins que demande le subjonctif, souvent accompagné du ne explétif (n’ait).'),
        },
      ),
      sort(
        b('Conditional or subjunctive?', 'Conditionnel ou subjonctif ?'),
        [
          b('Takes conditional', 'Suivi du conditionnel'),
          b('Takes subjunctive', 'Suivi du subjonctif'),
        ],
        [
          ['au cas où', 0],
          ['à condition que', 1],
          ['dans l’hypothèse où', 0],
          ['à moins que', 1],
          ['pourvu que', 1],
          ['quand bien même', 0],
        ],
      ),
      ord(
        P.order,
        'À supposer qu’elle accepte, qui dirigera le projet ?',
        { tr: 'Assuming she accepts, who will lead the project?' },
      ),
      dict('Pourvu que la météo reste clémente jusqu’à la fin du festival !'),
      say('À moins qu’un imprévu ne survienne, le rapport sera publié lundi.', 'Unless an unforeseen issue arises, the report will be published on Monday.'),
    ],
    [
      b('à condition que, pourvu que, en admettant que, à supposer que, à moins que and sans que all take the subjunctive.', 'à condition que, pourvu que, en admettant que, à supposer que, à moins que et sans que sont suivis du subjonctif.'),
      b('After à moins que, ne is an optional stylistic ne explétif, not a negation.', 'Après à moins que, ne est un ne explétif facultatif, sans valeur négative.'),
      b('pourvu que often adds a nuance of hope or wish.', 'pourvu que ajoute souvent une nuance de souhait.'),
    ],
    [
      ['à condition que', b('provided that (+ subjunctive)', 'si et seulement si (+ subjonctif)')],
      ['à moins que', b('unless (+ subjunctive)', 'sauf si (+ subjonctif)')],
      ['en admettant que', b('assuming that (+ subjunctive)', 'en supposant que (+ subjonctif)')],
      ['pourvu que', b('as long as, if only', 'à condition que, pourvu seulement que')],
    ],
  ),

  lesson(
    C,
    3,
    ['same-subject-infinitive-synthesis', 'reduction-infinitive-et-bilan'],
    b('Same-subject reductions and full synthesis', 'Réductions infinitives et bilan complet'),
    b('Switch cleanly to à condition de, à moins de and faute de when the subject stays the same.', 'Passer à à condition de, à moins de et faute de lorsque le sujet est identique.'),
    [
      b('Replace que + subjunctive with de + infinitive when subjects match', 'Remplacer que + subjonctif par de + infinitif quand les sujets sont identiques'),
      b('Use sans and faute de + noun or infinitive concisely', 'Employer sans et faute de + nom ou infinitif avec concision'),
      b('Combine all conditional, subjunctive and infinitive hypotheses in writing', 'Combiner hypothèses au conditionnel, au subjonctif et à l’infinitif à l’écrit'),
    ],
    13,
    [
      card(
        b('One subject: switch to the infinitive', 'Un seul sujet : passez à l’infinitif'),
        b(
          'In French, whenever the main clause and the conditional clause share the **same subject**, avoid repeating *que + subject + subjunctive*. Replace **que** with **de + infinitive** (or **sans + infinitive**). **Faute de** (“for lack of / if there isn’t”) works with a noun or an infinitive.\n\nSame subject: **à condition de, à moins de, faute de, sans**.\nTwo different subjects: **à condition que, à moins que, sans que**.',
          'En français, lorsque la proposition principale et la subordonnée ont le **même sujet**, on évite de répéter *que + sujet + subjonctif*. Remplacez **que** par **de + infinitif** (ou **sans + infinitif**). **Faute de** s’emploie avec un nom ou un infinitif.\n\nMême sujet : **à condition de, à moins de, faute de, sans**.\nSujets différents : **à condition que, à moins que, sans que**.',
        ),
        {
          table: {
            head: [b('Different subjects (+ subj.)', 'Sujets différents (+ subj.)'), b('Same subject (+ inf.)', 'Même sujet (+ inf.)')],
            rows: [
              ['à condition que + subj.', 'à condition de + inf.'],
              ['à moins que + subj.', 'à moins de + inf.'],
              ['sans que + subj.', 'sans + inf.'],
              ['sous réserve que + subj.', 'sous réserve de + inf. / nom'],
            ],
          },
          ex: [
            ['Vous pouvez emprunter ce livre à condition de le rapporter vendredi.', 'You may borrow this book provided you return it on Friday.'],
            ['À moins d’avoir une autorisation écrite, vous ne pourrez pas entrer.', 'Unless you have written permission, you will not be able to enter.'],
            ['Faute de trouver un accord ce soir, les négociations reprendront lundi.', 'Failing to reach an agreement tonight, talks will resume on Monday.'],
          ],
        },
      ),
      tip(
        b('Nominal shortcuts with en cas de and faute de', 'Raccourcis nominaux : en cas de, faute de'),
        b(
          'Notice the clean nominal forms that avoid a whole verb clause: **en cas de + noun** replaces *au cas où*, and **faute de + noun** replaces *s’il n’y a pas de*.\n\nNominal forms: **en cas d’urgence, faute de preuves, sous réserve d’acceptation**.',
          'Pensez aux tournures nominales qui évitent toute proposition verbale : **en cas de + nom** remplace *au cas où*, et **faute de + nom** remplace *s’il n’y a pas de*.\n\nTournures nominales : **en cas d’urgence, faute de preuves, sous réserve d’acceptation**.',
        ),
      ),
      mc(
        P.best,
        [
          'à moins de prendre un taxi.',
          'à moins que tu prennes un taxi.',
          'à moins que tu ne prends un taxi.',
          'à moins de prendre que un taxi.',
        ],
        {
          fr: 'Tu vas manquer ton vol, ___',
          explain: b('Both clauses have the subject tu, so à moins de + infinitive is the natural idiomatic choice.', 'Les deux propositions ont le même sujet (tu) : à moins de + infinitif est la tournure naturelle.'),
        },
      ),
      gap(
        P.completeText,
        'L’entreprise financera le projet ___ (à condition que / à condition de) réduire les coûts de dix pour cent. ___ (En cas de / Au cas où) retard de livraison, le client sera indemnisé, ___ (à moins que / à moins de) la force majeure ne soit reconnue.',
        [['à condition de'], ['En cas de'], ['à moins que']],
        {
          choices: [
            ['à condition de', 'à condition que'],
            ['En cas de', 'Au cas où'],
            ['à moins que', 'à moins de'],
          ],
        },
      ),
      sort(
        b('Infinitive, subjunctive or conditional?', 'Infinitif, subjonctif ou conditionnel ?'),
        [
          b('Infinitive', 'Infinitif'),
          b('Subjunctive', 'Subjonctif'),
          b('Conditional', 'Conditionnel'),
        ],
        [
          ['à moins de', 0],
          ['à condition que', 1],
          ['au cas où', 2],
          ['à condition de', 0],
          ['sans que', 1],
          ['dans l’hypothèse où', 2],
        ],
      ),
      dlg(
        b('Negotiating a partnership', 'Négocier un partenariat'),
        b('Camille and Julien finalize an agreement before a deadline.', 'Camille et Julien finalisent un accord avant une échéance.'),
        [['Camille', 'f'], ['Julien', 'm']],
        [
          [0, 'Nous sommes prêts à signer dès demain, à condition que le calendrier soit respecté.', 'We are ready to sign tomorrow, provided the schedule is respected.'],
          [1, { options: ['C’est entendu, à moins qu’un problème technique ne bloque la validation.', 'C’est entendu, à moins qu’un problème technique bloque pas la validation.', 'C’est entendu, à moins de bloquer la validation par un problème technique.'] }],
          [0, 'Et dans l’hypothèse où la livraison prendrait du retard ?', 'And in the event that delivery is delayed?'],
          [1, { options: ['Dans ce cas, nous vous rembourserons l’acompte, à moins de trouver un créneau sous quarante-huit heures.', 'Dans ce cas, nous vous rembourserons, à moins que trouver un créneau.', 'Dans ce cas, nous vous rembourserons, au cas où vous trouvez un créneau.'] }],
        ],
      ),
      ord(
        P.order,
        'Il a réussi ce concours sans que personne l’aide.',
        { tr: 'He passed this competitive exam without anyone helping him.' },
      ),
      say('Nous maintenons l’événement, à moins d’une alerte météo majeure.', 'We are keeping the event on, barring a major weather alert.'),
      write(
        b('Propose a contingency plan', 'Proposer un plan d’action sous conditions'),
        b(
          'In 50 to 80 words, write a short memo to a colleague about organizing an outdoor conference. Include at least one contingency with au cas où or dans l’hypothèse où, one restrictive condition with à condition que or à moins que, and one same-subject infinitive reduction.',
          'En 50 à 80 mots, rédigez une courte note à un collègue pour organiser un colloque en plein air. Intégrez au moins une éventualité avec au cas où ou dans l’hypothèse où, une condition restrictive avec à condition que ou à moins que, et une réduction à l’infinitif.',
        ),
        50,
        80,
        [
          b('One clause with au cas où or dans l’hypothèse où + conditional', 'Une proposition avec au cas où ou dans l’hypothèse où + conditionnel'),
          b('One clause with à condition que or à moins que + subjunctive', 'Une proposition avec à condition que ou à moins que + subjonctif'),
          b('One reduction with à condition de, à moins de or en cas de', 'Une réduction avec à condition de, à moins de ou en cas de'),
        ],
        'Nous maintenons le colloque dans le jardin jeudi, à moins qu’une tempête ne soit annoncée. Au cas où le vent se lèverait, la grande salle du rez-de-chaussée restera réservée. Les intervenants pourront tester les micros dès neuf heures, à condition d’arriver en avance. En cas de changement de lieu, j’enverrai un message à tous les participants avant huit heures.',
        {
          phrases: ['au cas où', 'dans l’hypothèse où', 'à moins que', 'à condition de', 'en cas de'],
        },
      ),
    ],
    [
      b('Use à condition de, à moins de and sans + infinitive whenever both clauses share the same subject.', 'Employez à condition de, à moins de et sans + infinitif quand le sujet est identique.'),
      b('Use en cas de + noun and faute de + noun for crisp, concise B2 prose.', 'Employez en cas de + nom et faute de + nom pour alléger vos phrases.'),
      b('Always check whether the subject changes before picking de + infinitive or que + subjunctive.', 'Vérifiez toujours si le sujet change avant de choisir entre de + infinitif et que + subjonctif.'),
    ],
    [
      ['à condition de', b('provided (one does something)', 'à la condition de (+ infinitif)')],
      ['à moins de', b('unless (one does something)', 'sauf à (+ infinitif)')],
      ['faute de', b('for lack of, failing', 'par manque de')],
      ['en cas de', b('in the event of', 'si cela survient')],
    ],
  ),
];

export default lessons;
