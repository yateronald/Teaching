import type { CourseAbout } from '../../types';
import { b, card, dict, doc, gap, lesson, mc, ord, P, pairs, say, sort, tip, trap } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'When expressing a goal, a precaution or a condition in French, choosing between an infinitive, the subjunctive, the conditional or the indicative depends on two things: the conjunction itself and whether both clauses share the same subject. This B2 course contrasts pour / pour que, de peur de / de peur que, à condition de / à condition que, à moins que, pourvu que and au cas où, so your complex sentences are always grammatically accurate.',
    'Pour exprimer un but, une précaution ou une condition, le choix entre l’infinitif, le subjonctif, le conditionnel ou l’indicatif dépend de la locution employée et de l’identité des sujets. Ce cours B2 compare pour / pour que, de peur de / de peur que, à condition de / à condition que, à moins que, pourvu que et au cas où, pour maîtriser chaque phrase complexe sans faute de mode.',
  ),
  outcomes: [
    b('Choose between pour / afin de + infinitive and pour que / afin que + subjunctive', 'Choisir entre pour / afin de + infinitif et pour que / afin que + subjonctif'),
    b('Express fear and precaution with de peur de / de peur que (ne)', 'Exprimer la crainte et la précaution avec de peur de / de peur que (ne)'),
    b('Use à condition que, pourvu que and à moins que + subjunctive', 'Employer à condition que, pourvu que et à moins que + subjonctif'),
    b('Use au cas où + conditional and avoid si + conditional errors', 'Employer au cas où + conditionnel et éviter si + conditionnel'),
  ],
};

const C = 'g-purpose-condition';
export default [
  lesson(C, 1, ['expressing-purpose', 'exprimer-le-but'],
    b('Purpose: pour / afin de vs pour que / afin que', 'Le but : pour / afin de ou pour que / afin que'),
    b('Match same-subject infinitives and different-subject subjunctive clauses to express goals.', 'Associer infinitif (même sujet) et subjonctif (sujets différents) pour exprimer le but.'),
    [b('Use pour / afin de / de façon à + infinitive', 'Employer pour / afin de / de façon à + infinitif'), b('Use pour que / afin que / de sorte que + subjunctive', 'Employer pour que / afin que / de sorte que + subjonctif'), b('Check whether both clauses share one subject', 'Vérifier si les deux propositions ont le même sujet')],
    13,
    [
      card(b('One subject → infinitive; two subjects → subjunctive', 'Un sujet → infinitif ; deux sujets → subjonctif'), b('When the **same person** performs both actions, use **pour, afin de, de façon à, de manière à, en vue de + infinitive**: **Je révise pour réussir.** When the **subjects are different**, use **pour que, afin que, de façon que, de sorte que + subjunctive**: **Je t’aide pour que tu réussisses.**', 'Quand le **même sujet** fait les deux actions, employez **pour, afin de, de façon à, de manière à + infinitif** : **Je révise pour réussir.** Quand les **sujets sont différents**, employez **pour que, afin que, de façon que, de sorte que + subjonctif** : **Je t’aide pour que tu réussisses.**'), {
        ex: [['Nous partons tôt afin d’éviter les embouteillages.', 'We’re leaving early in order to avoid traffic jams.'], ['Le professeur parle clairement afin que tout le monde comprenne.', 'The teacher speaks clearly so that everyone understands.'], ['Organisons la salle de manière à accueillir trente personnes.', 'Let’s arrange the room so as to seat thirty people.']],
      }),
      trap(b('Never « pour que je réussisse » when you are the subject!', 'Pas de « pour que je… » avec un seul sujet !'), b('In French, **Je travaille pour que je réussisse** is clumsy and incorrect: when both subjects match, switch to the infinitive (**Je travaille pour réussir**). Reserve **pour que** for a switch of subject (**Je travaille pour que mes enfants réussissent**).', 'Évitez la répétition du sujet avec **pour que** : dites **Je travaille pour réussir** (et non « pour que je réussisse »). Réservez **pour que** au changement de sujet : **Je travaille pour que mes enfants réussissent.**')),
      sort(b('Infinitive or subjunctive?', 'Infinitif ou subjonctif ?'), [b('+ infinitive (same subject)', '+ infinitif (même sujet)'), b('+ subjunctive (two subjects)', '+ subjonctif (deux sujets)')], [['afin de mieux voir', 0], ['pour que tu voies', 1], ['de manière à gagner du temps', 0], ['afin qu’il puisse répondre', 1], ['pour ne pas déranger', 0], ['de sorte qu’ils soient prêts', 1]]),
      mc(P.form, ['compreniez', 'comprenez', 'comprendrez', 'comprenais'], { fr: 'J’ai ajouté des schémas afin que vous ___ plus vite.' }),
      mc(P.best, ['Elle note tout pour ne rien oublier.', 'Elle note tout pour qu’elle n’oublie rien.', 'Elle note tout afin qu’elle ne rien oublie.', 'Elle note tout de façon qu’elle n’oublie.']),
      gap(P.complete, 'Nous avons baissé le chauffage ___ (économiser) l’énergie et ___ (la facture soit) moins élevée.', ['pour économiser', 'pour que la facture soit'], { choices: [['pour économiser', 'pour que nous économisions'], ['pour que la facture soit', 'pour la facture être']] }),
      ord(P.order, 'Je parle lentement pour que vous compreniez.', { tr: 'I’m speaking slowly so that you understand.' }),
      say('Je prends des notes précises afin de pouvoir tout résumer pour que l’équipe gagne du temps.', 'I’m taking detailed notes in order to summarise everything so that the team saves time.'),
    ],
    [
      b('Same subject: pour / afin de / de façon à + infinitive.', 'Même sujet : pour / afin de / de façon à + infinitif.'),
      b('Different subjects: pour que / afin que / de sorte que + subjunctive.', 'Sujets différents : pour que / afin que / de sorte que + subjonctif.'),
      b('Negative goal with same subject: pour ne pas / afin de ne pas + infinitive.', 'But négatif (même sujet) : pour ne pas / afin de ne pas + infinitif.'),
    ],
    [['un embouteillage', b('a traffic jam', 'file de voitures bloquées')], ['afin de', b('in order to', 'dans le but de')], ['baisser', b('to lower, turn down', 'diminuer')]],
  ),
  lesson(C, 2, ['expressing-fear-and-precaution', 'exprimer-la-crainte-et-la-precaution'],
    b('Fear & avoidance: de peur de / de peur que', 'La crainte et l’évitement : de peur de / de peur que'),
    b('Prevent unwanted outcomes with de peur de, de crainte que and the optional expletive ne.', 'Éviter un résultat redouté avec de peur de, de crainte que et le ne explétif.'),
    [b('Use de peur de / de crainte de + infinitive', 'Employer de peur de / de crainte de + infinitif'), b('Use de peur que / de crainte que + subjunctive', 'Employer de peur que / de crainte que + subjonctif'), b('Recognise the non-negative expletive ne', 'Reconnaître le ne explétif non négatif')],
    13,
    [
      card(b('Negative goals and precautions', 'Éviter ce qu’on redoute'), b('To avoid a negative outcome with the **same subject**, use **pour ne pas, afin de ne pas, de peur de, de crainte de + infinitive**: **Elle marche doucement de peur de glisser.** With **different subjects**, use **de peur que / de crainte que (+ ne) + subjunctive**: **Ferme la porte de peur que le chien (ne) sorte.** Note that this formal **ne** does **not** make the clause negative!', 'Pour éviter un incident avec le **même sujet**, employez **pour ne pas, de peur de, de crainte de + infinitif** : **Elle marche doucement de peur de glisser.** Avec **deux sujets**, employez **de peur que / de crainte que (+ ne) + subjonctif** : **Ferme la porte de peur que le chien (ne) sorte.** Ce **ne** explétif ne rend **pas** la phrase négative !'), {
        ex: [['J’ai mis un rappel de peur d’oublier le rendez-vous.', 'I set a reminder for fear of forgetting the appointment.'], ['Il chuchote de crainte que le bébé ne se réveille.', 'He’s whispering lest the baby wake up.'], ['Nous gardons une copie pour qu’aucun document ne se perde.', 'We keep a copy so that no document gets lost.']],
      }),
      trap(b('De peur qu’il ne… ≠ real negation', 'De peur qu’il ne… ≠ négation'), b('**Il part tôt de peur qu’il ne pleuve** means *for fear it WILL rain* (the **ne** is stylistic). If you want real negation (*for fear he WON’T come*), add **pas**: **de peur qu’il ne vienne pas**.', '**Il part tôt de peur qu’il ne pleuve** signifie *de peur qu’il pleuve* (**ne** explétif). Pour une vraie négation, il faut **pas** : **de peur qu’il ne vienne pas**.')),
      pairs(P.match, [['de peur de tomber', b('for fear of falling', 'même sujet, infinitif')], ['de peur qu’il ne tombe', b('for fear he might fall', 'deux sujets, ne explétif')], ['de peur qu’il ne vienne pas', b('for fear he won’t come', 'vraie négation avec pas')], ['afin de ne pas déranger', b('so as not to disturb', 'but négatif, infinitif')]]),
      mc(P.meaning, [b('She is speaking quietly lest the neighbours hear.', 'Elle parle bas pour éviter que les voisins entendent.'), b('She wants the neighbours to hear.', 'Elle veut que les voisins l’entendent.'), b('She is afraid the neighbours cannot hear.', 'Elle craint que les voisins n’entendent rien.'), b('The neighbours asked her not to speak.', 'Les voisins lui ont interdit de parler.')], { fr: 'Elle parle à voix basse de peur que les voisins n’entendent.' }),
      mc(P.form, ['de manquer', 'que je manque', 'à manquer', 'de ne pas manquer'], { fr: 'Je suis arrivé vingt minutes en avance de crainte ___ mon train.' }),
      gap(P.complete, 'Éteins la bougie de peur ___ la nappe ___ prenne feu.', ['que', 'ne']),
      dict('Il a noté l’adresse de crainte d’oublier et fermé le portail de peur que le chat ne sorte.', { voice: 'm' }),
    ],
    [
      b('de peur de / de crainte de + infinitive (same subject).', 'de peur de / de crainte de + infinitif (même sujet).'),
      b('de peur que / de crainte que (ne) + subjunctive (different subjects).', 'de peur que / de crainte que (ne) + subjonctif (sujets différents).'),
      b('Expletive ne adds no negative meaning; real negation needs pas.', 'Le ne explétif n’est pas négatif ; la vraie négation exige pas.'),
    ],
    [['chuchoter', b('to whisper', 'parler tout bas')], ['glisser', b('to slip', 'perdre l’équilibre sur une surface lisse')], ['de crainte de', b('for fear of', 'de peur de (plus soutenu)')]],
  ),
  lesson(C, 3, ['expressing-condition', 'exprimer-la-condition'],
    b('Conditions: à condition que, pourvu que, à moins que, au cas où', 'La condition : à condition que, pourvu que, à moins que, au cas où'),
    b('Choose the right mood after condition conjunctions and apply the au cas où + conditional rule.', 'Choisir le bon mode après les conjonctions de condition et employer au cas où + conditionnel.'),
    [b('Use à condition de / que and pourvu que + subjunctive', 'Employer à condition de / que et pourvu que + subjonctif'), b('Use à moins que (ne) + subjunctive', 'Employer à moins que (ne) + subjonctif'), b('Use au cas où + conditional', 'Employer au cas où + conditionnel')],
    13,
    [
      card(b('Condition conjunctions and their moods', 'Conjonctions de condition et modes'), b('**Subjunctive**: **à condition que** (*provided that*), **pourvu que** (*as long as / let’s hope*), **à moins que (+ ne)** (*unless*), **en admettant que / en supposant que** (*assuming that*). **Infinitive** (same subject): **à condition de**, **à moins de**. **Conditional**: **au cas où** (*in case*) ALWAYS takes the **conditional** (never *si* or subjunctive): **Prends un pull au cas où il ferait frais.**', '**Subjonctif** : **à condition que**, **pourvu que**, **à moins que (+ ne)** (*sauf si*), **en admettant que / en supposant que**. **Infinitif** (même sujet) : **à condition de**, **à moins de**. **Conditionnel** : **au cas où** est toujours suivi du **conditionnel** : **Prends un pull au cas où il ferait frais.**'), {
        table: { head: [b('expression', 'locution'), b('mood', 'mode'), b('example', 'exemple')], rows: [['à condition que / pourvu que', b('subjunctive', 'subjonctif'), 'à condition que tu viennes'], ['à moins que (+ ne)', b('subjunctive', 'subjonctif'), 'à moins qu’il ne pleuve'], ['au cas où', b('conditional', 'conditionnel'), 'au cas où tu aurais faim'], ['à condition de / à moins de', b('infinitive', 'infinitif'), 'à condition d’accepter']] },
      }),
      tip(b('Si vs au cas où', 'Si ou au cas où'), b('Remember **si** NEVER takes the future or conditional (*si tu viendrais* is wrong → **si tu venais**). By contrast, **au cas où** ALWAYS takes the conditional (**au cas où tu viendrais**), and **selon que / suivant que** takes the **indicative**.', 'Rappel : **si** ne prend jamais le futur ni le conditionnel (**si tu venais**). À l’inverse, **au cas où** exige le **conditionnel** (**au cas où tu viendrais**), et **selon que** prend l’**indicatif**.')),
      sort(b('Which mood follows?', 'Quel mode suit ?'), ['+ subjunctive', '+ conditional', '+ infinitive'], [['à condition que…', 0], ['au cas où…', 1], ['à moins de…', 2], ['pourvu que…', 0], ['à condition de…', 2], ['à moins qu’il ne…', 0]]),
      mc(P.form, ['ferait', 'fasse', 'fait', 'fera'], { fr: 'J’ai pris une batterie externe au cas où mon téléphone n’aurait plus de batterie ou qu’il ___ froid.' }),
      mc(P.form, ['soit', 'est', 'sera', 'serait'], { fr: 'Nous pique-niquerons au parc, à moins que la météo ne ___ mauvaise.' }),
      gap(P.complete, 'Tu peux emprunter ma voiture à condition ___ (faire) le plein, et ___ tu te perdrais, garde mon numéro.', ['de faire', 'au cas où'], { choices: [['de faire', 'que tu fasses', 'faire'], ['au cas où', 'à moins que', 'pourvu que']] }),
      doc({ look: 'notice', title: b('Conditions de location', 'Conditions de location'), text: 'Le matériel est prêté gratuitement à condition qu’il soit rendu propre avant 18 h. Aucune pénalité ne sera facturée, à moins qu’une pièce ne manque au retour. En cas d’imprévu, appelez le bureau au cas où le magasin fermerait plus tôt.' }, P.read, [b('The gear is free if returned clean before 6 p.m. and complete.', 'Le matériel est gratuit s’il est rendu propre avant 18 h et complet.'), b('You always pay a fee even if nothing is missing.', 'On paie toujours une pénalité même si rien ne manque.'), b('The shop never closes early.', 'Le magasin ne ferme jamais plus tôt.'), b('Dirty gear is accepted without conditions.', 'Le matériel sale est accepté sans condition.')]),
      say('Je viendrai volontiers, pourvu que la réunion finisse à l’heure et à moins qu’un client n’appelle.', 'I’ll gladly come, provided the meeting ends on time and unless a client calls.'),
    ],
    [
      b('à condition que, pourvu que, à moins que (ne), en supposant que + subjunctive.', 'à condition que, pourvu que, à moins que (ne), en supposant que + subjonctif.'),
      b('Same subject: à condition de / à moins de + infinitive.', 'Même sujet : à condition de / à moins de + infinitif.'),
      b('au cas où ALWAYS takes the conditional (au cas où il pleuvrait).', 'au cas où prend toujours le conditionnel (au cas où il pleuvrait).'),
    ],
    [['pourvu que', b('provided that, let’s hope', 'à la seule condition que')], ['à moins que', b('unless', 'sauf si')], ['au cas où', b('in case', 'dans l’éventualité où')]],
  ),
];
