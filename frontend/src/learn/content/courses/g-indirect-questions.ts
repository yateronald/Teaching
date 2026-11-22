import type { CourseAbout } from '../../types';
import { b, card, dict, dlg, gap, lesson, mc, ord, P, pairs, say, sort, tip, trap } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Direct questions like « Est-ce que tu viens ? » or « Qu’est-ce que tu fais ? » sound abrupt when embedded inside a sentence. Indirect questions let you ask politely (Pourriez-vous me dire si… ?) and report questions smoothly (Je me demande ce qu’il fait, elle m’a demandé où j’habitais). This B1 course explains how est-ce que disappears, how qu’est-ce qui / qu’est-ce que turn into ce qui / ce que, and how tenses shift after a past verb.',
    'Les questions directes comme « Est-ce que tu viens ? » ou « Qu’est-ce que tu fais ? » ne s’intègrent pas telles quelles dans une phrase complexe. L’interrogation indirecte permet de demander poliment (Pourriez-vous me dire si… ?) et de rapporter une question (Je me demande ce qu’il fait, elle m’a demandé où j’habitais). Ce cours B1 montre comment disparaît est-ce que, comment qu’est-ce qui / que deviennent ce qui / ce que, et comment les temps s’accordent au passé.',
  ),
  outcomes: [
    b('Turn yes/no questions into indirect questions with si', 'Transformer une question fermée avec si'),
    b('Keep question words (où, quand, comment, pourquoi) in subject–verb order', 'Garder les mots interrogatifs (où, quand, comment, pourquoi) dans l’ordre sujet–verbe'),
    b('Choose accurately between ce qui and ce que', 'Choisir avec précision entre ce qui et ce que'),
    b('Use polite openings and past-tense backshift', 'Employer les formules polies et la concordance des temps au passé'),
  ],
};

const C = 'g-indirect-questions';
export default [
  lesson(C, 1, ['yes-no-and-question-words', 'si-et-les-mots-interrogatifs'],
    b('Si, où, quand, comment: basic indirect questions', 'Si, où, quand, comment : les bases'),
    b('Use si for yes/no questions and restore normal subject–verb order.', 'Employer si pour les questions oui/non et rétablir l’ordre sujet–verbe.'),
    [b('Use si (never est-ce que) for yes/no questions', 'Employer si (jamais est-ce que) pour les questions oui/non'), b('Keep où, quand, comment, pourquoi, combien, qui', 'Garder où, quand, comment, pourquoi, combien, qui'), b('Drop inversion and check the final punctuation', 'Supprimer l’inversion et vérifier la ponctuation finale')],
    13,
    [
      card(b('Three rules for indirect questions', 'Trois règles d’or'), b('1. **Yes/no question** (*Est-ce que tu viens ?*) → **si**: **Je me demande si tu viens.** (Never « si est-ce que » and never **s’il** → **si il**? Careful: **si + il = s’il**, **si + elle = si elle**!). 2. **Question word** (*Où habite-t-il ?*) → **subject + verb** order: **Dis-moi où il habite.** 3. **No question mark** when the main clause is a statement: **Je ne sais pas quand il arrive.**', '1. **Question oui/non** (*Est-ce que tu viens ?*) → **si** : **Je me demande si tu viens.** (Jamais « si est-ce que » ; **si + il = s’il**, mais **si + elle = si elle**). 2. **Mot interrogatif** (*Où habite-t-il ?*) → ordre **sujet + verbe** : **Dis-moi où il habite.** 3. **Pas de point d’interrogation** si la phrase principale est déclarative : **Je ne sais pas quand il arrive.**'), {
        ex: [['Est-ce que le musée est ouvert ? → Je voudrais savoir si le musée est ouvert.', 'Is the museum open? → I’d like to know if the museum is open.'], ['À quelle heure part le train ? → Savez-vous à quelle heure le train part ?', 'What time does the train leave? → Do you know what time the train leaves?']],
      }),
      trap(b('Never keep « est-ce que » or inversion!', 'Jamais « est-ce que » ni inversion !'), b('In an indirect question, **est-ce que** and **verb–subject inversion** both disappear. Write **Je me demande pourquoi elle rit**, never « pourquoi rit-elle » or « pourquoi est-ce qu’elle rit ».', 'Dans l’interrogation indirecte, **est-ce que** et l’**inversion sujet–verbe** disparaissent. Écrivez **Je me demande pourquoi elle rit**, et non « pourquoi rit-elle » ni « pourquoi est-ce qu’elle rit ».')),
      sort(b('Direct or indirect question?', 'Question directe ou indirecte ?'), [b('direct', 'directe'), b('indirect', 'indirecte')], [['Où travailles-tu ?', 0], ['Dis-moi où tu travailles.', 1], ['Est-ce qu’il vient ?', 0], ['Je ne sais pas s’il vient.', 1], ['Pourquoi partent-ils ?', 0], ['Il demande pourquoi ils partent.', 1]]),
      mc(P.best, ['Je me demande s’il pleuvra demain.', 'Je me demande si est-ce qu’il pleuvra demain.', 'Je me demande s’il pleuvra demain ?', 'Je me demande que il pleuvra demain.']),
      mc(P.best, ['Dis-moi comment tu as trouvé cette adresse.', 'Dis-moi comment as-tu trouvé cette adresse.', 'Dis-moi comment est-ce que tu as trouvé cette adresse.', 'Dis-moi si comment tu as trouvé cette adresse.']),
      gap(P.complete, 'Je ne sais pas ___ le bureau est ouvert ni ___ je dois appeler.', ['si', 'qui'], { choices: [['si', 'que', 'est-ce que'], ['qui', 's’il', 'est-ce qui']] }),
      ord(P.order, 'Je me demande si elle vient ce soir.', { tr: 'I wonder if she is coming tonight.', extra: ['que'] }),
      say('Je ne sais pas encore si j’irai à la conférence ni à quelle heure elle commence.', 'I don’t know yet whether I’ll go to the conference or what time it starts.'),
    ],
    [
      b('Yes/no direct question → si (s’il before il / ils, si elle before elle).', 'Question oui/non → si (s’il devant il / ils, si elle devant elle).'),
      b('Drop est-ce que and inversion; keep subject + verb order.', 'Supprimez est-ce que et l’inversion ; gardez l’ordre sujet + verbe.'),
      b('No question mark after a declarative opening (Je me demande…, Dis-moi…).', 'Pas de point d’interrogation après une principale déclarative (Je me demande…).'),
    ],
    [['se demander', b('to wonder', 'se poser la question')], ['une adresse', b('an address', 'lieu où habite quelqu’un')], ['ouvert', b('open', 'accessible au public')]],
  ),
  lesson(C, 2, ['ce-qui-and-ce-que', 'ce-qui-et-ce-que'],
    b('Qu’est-ce qui / que → ce qui / ce que', 'Qu’est-ce qui / que → ce qui / ce que'),
    b('Choose accurately between ce qui, ce que and à / de quoi in indirect questions.', 'Choisir avec précision entre ce qui, ce que et à / de quoi dans l’interrogation indirecte.'),
    [b('Turn qu’est-ce qui into ce qui (subject)', 'Transformer qu’est-ce qui en ce qui (sujet)'), b('Turn qu’est-ce que into ce que (direct object)', 'Transformer qu’est-ce que en ce que (COD)'), b('Keep quoi after a preposition', 'Garder quoi après une préposition')],
    13,
    [
      card(b('What = ce qui or ce que', 'Ce qui ou ce que'), b('Direct **Qu’est-ce qui… ?** (asking about the **subject**, followed straight by a verb) becomes **ce qui**: *Qu’est-ce qui se passe ?* → **Dis-moi ce qui se passe.** Direct **Qu’est-ce que… ?** (asking about the **object**, followed by a subject + verb) becomes **ce que / ce qu’**: *Qu’est-ce que tu cherches ?* → **Dis-moi ce que tu cherches.** After a **preposition**, use **quoi**: *De quoi parles-tu ?* → **Dis-moi de quoi tu parles.**', '**Qu’est-ce qui… ?** (sujet, suivi d’un verbe) devient **ce qui** : *Qu’est-ce qui se passe ?* → **Dis-moi ce qui se passe.** **Qu’est-ce que… ?** (COD, suivi d’un sujet + verbe) devient **ce que / ce qu’** : *Qu’est-ce que tu cherches ?* → **Dis-moi ce que tu cherches.** Après une **préposition**, gardez **quoi** : *De quoi parles-tu ?* → **Dis-moi de quoi tu parles.**'), {
        table: { head: [b('direct', 'direct'), b('indirect', 'indirect'), b('what follows', 'ce qui suit')], rows: [['Qu’est-ce qui… ?', 'ce qui', b('verb', 'verbe')], ['Qu’est-ce que… ?', 'ce que / ce qu’', b('subject + verb', 'sujet + verbe')], ['À / De / Pour quoi… ?', 'à / de / pour quoi', b('subject + verb', 'sujet + verbe')]] },
      }),
      tip(b('Never « qu’est-ce que » or bare « que »!', 'Jamais « qu’est-ce que » ni « que » seul !'), b('Never say « Je ne sais pas qu’est-ce que tu veux » or « Dis-moi que tu fais ». Always insert **ce**: **Dis-moi ce que tu fais.** (Except before an infinitive: **Je ne sais pas quoi faire** = *I don’t know what to do*.)', 'Ne dites jamais « Je ne sais pas qu’est-ce que tu veux » ni « Dis-moi que tu fais ». Ajoutez toujours **ce** : **Dis-moi ce que tu fais.** (Devant un infinitif : **Je ne sais pas quoi faire.**)')),
      mc(P.form, ['ce qui', 'ce que', 'qu’est-ce qui', 'que'], { fr: 'Personne ne comprend ___ s’est passé pendant la réunion.' }),
      mc(P.form, ['ce que', 'ce qui', 'qu’est-ce que', 'quoi'], { fr: 'J’aimerais savoir ___ vous proposez comme solution.' }),
      mc(P.form, ['à quoi', 'à ce que', 'à que', 'ce à quoi'], { fr: 'Explique-moi ___ sert cet appareil.', explain: b('Servir à quoi → à quoi after a preposition.', 'Servir à quoi → à quoi après préposition.') }),
      gap(P.complete, 'Je me demande ___ t’inquiète autant, mais dis-moi ___ je peux faire pour t’aider.', ['ce qui', 'ce que'], { choices: [['ce qui', 'ce que', 'quoi'], ['ce que', 'ce qui', 'que']] }),
      ord(P.order, 'Dis-moi ce que tu préfères manger.', { tr: 'Tell me what you prefer to eat.', extra: ['qui'] }),
      dict('Je veux savoir ce qui te plaît et ce que tu décides.', { voice: 'f' }),
    ],
    [
      b('Qu’est-ce qui → ce qui + verb (subject).', 'Qu’est-ce qui → ce qui + verbe (sujet).'),
      b('Qu’est-ce que → ce que + subject + verb (object).', 'Qu’est-ce que → ce que + sujet + verbe (COD).'),
      b('After a preposition: à quoi, de quoi, avec quoi; before infinitive: quoi faire.', 'Après préposition : à quoi, de quoi, avec quoi ; devant infinitif : quoi faire.'),
    ],
    [['se passer', b('to happen', 'avoir lieu')], ['proposer', b('to suggest, propose', 'soumettre une idée')], ['un appareil', b('a device, appliance', 'machine, instrument')]],
  ),
  lesson(C, 3, ['polite-indirect-questions-and-tense', 'questions-polies-et-concordance'],
    b('Polite requests & past reporting', 'Demandes polies et discours passé'),
    b('Ask politely in public places and adjust tenses when reporting a past question.', 'Poser des questions polies en public et ajuster les temps après un verbe au passé.'),
    [b('Use Pourriez-vous me dire… and Je voudrais savoir…', 'Employer Pourriez-vous me dire… et Je voudrais savoir…'), b('Put the right punctuation (? vs .)', 'Mettre la bonne ponctuation (? ou .)'), b('Shift tenses after Il m’a demandé…', 'Adapter les temps après Il m’a demandé…')],
    13,
    [
      card(b('Polite questions and past backshift', 'Politesse et concordance des temps'), b('At a desk or on the phone, open with **Pourriez-vous me dire… ?** or **Savez-vous… ?** (ends with **?**) or **Je voudrais savoir…** (ends with **.**). When reporting a **past** question (**Il m’a demandé…**), shift the tense back: **present → imparfait** (*« Tu viens ? »* → **Il m’a demandé si je venais**), **passé composé → plus-que-parfait**, **futur → conditionnel présent**.', 'À un guichet ou au téléphone, commencez par **Pourriez-vous me dire… ?** ou **Savez-vous… ?** (avec **?**) ou **Je voudrais savoir…** (avec **.**). Pour rapporter une question au **passé** (**Il m’a demandé…**), le temps recule : **présent → imparfait** (*« Tu viens ? »* → **Il m’a demandé si je venais**), **passé composé → plus-que-parfait**, **futur → conditionnel présent**.'), {
        ex: [['Pourriez-vous me dire où se trouve le quai 4 ?', 'Could you tell me where platform 4 is?'], ['Elle m’a demandé ce que j’avais fait la veille.', 'She asked me what I had done the day before.'], ['Il voulait savoir si nous partirions tôt.', 'He wanted to know if we would leave early.']],
      }),
      pairs(P.match, [['« Tu es prêt ? »', b('Il m’a demandé si j’étais prêt.', 'présent → imparfait')], ['« Qu’as-tu choisi ? »', b('Il m’a demandé ce que j’avais choisi.', 'passé composé → plus-que-parfait')], ['« Quand reviendras-tu ? »', b('Il m’a demandé quand je reviendrais.', 'futur → conditionnel présent')], ['« Qui a appelé ? »', b('Il m’a demandé qui avait appelé.', 'qui reste sujet')]]),
      mc(P.best, ['Pourriez-vous me dire si le train a du retard ?', 'Pourriez-vous me dire est-ce que le train a du retard ?', 'Pourriez-vous me dire si a-t-il du retard ?', 'Pourriez-vous me dire que le train a du retard ?']),
      mc(P.form, ['habitait', 'habite', 'habitera', 'avait habité'], { fr: 'L’employé m’a demandé où mon frère ___ l’année précédente.' }),
      gap(P.complete, '« Que feras-tu demain ? » → Elle m’a demandé ___ je ___ le lendemain.', ['ce que', 'ferais'], { choices: [['ce que', 'ce qui', 'si'], ['ferais', 'ferai', 'faisais']] }),
      dlg(b('At the station desk', 'Au guichet de la gare'), b('Asking politely for travel information.', 'Demander un renseignement poliment.'), [['Vous', 'm'], ['Agent', 'f']], [
        [0, { options: ['Bonjour madame, pourriez-vous me dire à quelle heure part le prochain train pour Lyon ?', 'Bonjour madame, pourriez-vous me dire à quelle heure est-ce qu’il part ?', 'Bonjour madame, je demande à quelle heure part-il ?'] }],
        [1, 'Le prochain TGV part à 14 h 12, voie C.', 'The next TGV leaves at 2:12 p.m., platform C.'],
        [0, { options: ['Merci ! Savez-vous s’il reste des places en seconde classe ?', 'Merci ! Savez-vous est-ce qu’il reste des places ?', 'Merci ! Savez-vous ce qu’il reste des places ?'] }],
        [1, 'Oui, il en reste encore plusieurs. Vous voulez un billet ?', 'Yes, there are still several left. Would you like a ticket?'],
      ]),
      say('Excusez-moi, savez-vous si cette ligne dessert la gare centrale ?', 'Excuse me, do you know if this line serves the central station?'),
    ],
    [
      b('Polite openers: Pourriez-vous me dire… ?, Savez-vous… ?, Je voudrais savoir… .', 'Formules polies : Pourriez-vous me dire… ?, Savez-vous… ?, Je voudrais savoir… .'),
      b('Main clause is a question → keep ?; main clause is a statement → end with .', 'Principale interrogative → ? ; principale déclarative → .'),
      b('After a past verb: present → imparfait, passé composé → plus-que-parfait, futur → conditionnel.', 'Après un verbe au passé : présent → imparfait, passé composé → plus-que-parfait, futur → conditionnel.'),
    ],
    [['le lendemain', b('the next day', 'le jour suivant')], ['la veille', b('the day before', 'le jour précédent')], ['desservir', b('to serve (a stop)', 's’arrêter à une station')]],
  ),
];
