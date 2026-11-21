import type { CourseAbout } from '../../types';
import { b, card, dlg, doc, exam, lesson, mc, P, say, sort, tip } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Section B of the TEF speaking test lasts about 10 minutes: from a short document (an ad for an activity, an event, a trip, a service), you must convince a friend, played by the examiner, to take part. The examiner raises objections; you answer each one with arguments. This course trains persuasive structures, answering objections and keeping a friendly, natural tone.',
    'La section B de l’expression orale du TEF dure environ 10 minutes : à partir d’un court document (une annonce d’activité, d’événement, de voyage, de service), vous devez convaincre un ami, joué par l’examinateur, d’y participer. L’examinateur oppose des objections ; vous répondez à chacune avec des arguments. Ce cours entraîne les structures de persuasion, la réponse aux objections et un ton amical et naturel.',
  ),
  outcomes: [
    b('Present an activity attractively', 'Présenter une activité de façon attrayante'),
    b('Use persuasive structures', 'Employer les structures de persuasion'),
    b('Answer objections one by one', 'Répondre aux objections une par une'),
    b('Keep a friendly register (tu)', 'Garder un registre amical (tu)'),
  ],
};

const C = 'tef-eo-b';
export default [
  lesson(C, 1, ['presenting-and-persuading', 'presenter-et-persuader'],
    b('Presenting and persuading', 'Présenter et persuader'),
    b('Present the document to your friend and give attractive reasons.', 'Présenter le document à son ami et donner des raisons attrayantes.'),
    [b('Know section B', 'Connaître la section B'), b('Present the activity', 'Présenter l’activité'), b('Use persuasive phrases', 'Employer les formules persuasives')],
    13,
    [
      exam(b('Section B', 'Section B'), b('About **10 minutes**. You read **a document** (e.g. an ad for a weekend course, a festival, a volunteering programme). The examiner plays **a friend** who hesitates. Goal: **convince** him/her, answering every **objection** (prix, temps, intérêt, fatigue…). Use **tu**. Assessed: **argumentation, interaction, vocabulary, grammar, fluency**.', 'Environ **10 minutes**. Vous lisez **un document** (par ex. une annonce de stage de week-end, de festival, de programme de bénévolat). L’examinateur joue **un ami** qui hésite. Objectif : le/la **convaincre**, en répondant à chaque **objection** (prix, temps, intérêt, fatigue…). Employez **tu**. Critères : **argumentation, interaction, lexique, grammaire, aisance**.')),
      card(b('Persuasive phrases', 'Formules persuasives'), b('**Tu sais quoi ? J’ai vu une annonce géniale… · Imagine : … · Ça te ferait du bien de… · Ce serait l’occasion de… · Tu ne le regretteras pas ! · En plus, … · Et le meilleur, c’est que…** Personalise: **Toi qui adores la nature, …**', '**Tu sais quoi ? J’ai vu une annonce géniale… · Imagine : … · Ça te ferait du bien de… · Ce serait l’occasion de… · Tu ne le regretteras pas ! · En plus, … · Et le meilleur, c’est que…** Personnalisez : **Toi qui adores la nature, …**')),
      doc({ look: 'ad', title: b('Ad', 'Annonce'), text: 'WEEK-END « NATURE ET PHOTO » EN GASPÉSIE\nRandonnées guidées, initiation à la photo de paysage\nHébergement en gîte, repas compris\nPetits groupes (8 personnes)\n2 jours — 340 $' }, b('Which opening is the most persuasive?', 'Quelle ouverture est la plus persuasive ?'), [b('Tu sais quoi ? J’ai trouvé un week-end parfait pour toi qui adores la photo et la nature !', 'Tu sais quoi ? J’ai trouvé un week-end parfait pour toi qui adores la photo et la nature !'), b('Il y a un week-end. C’est 340 dollars.', 'Il y a un week-end. C’est 340 dollars.'), b('Je vais en Gaspésie, toi tu fais ce que tu veux.', 'Je vais en Gaspésie, toi tu fais ce que tu veux.'), b('Lisez cette annonce, monsieur.', 'Lisez cette annonce, monsieur.')]),
      sort(b('Persuasive or not?', 'Persuasif ou non ?'), [b('persuasive', 'persuasif'), b('not persuasive', 'peu persuasif')], [['Ça te ferait du bien de changer d’air.', 0], ['Fais ce que tu veux.', 1], ['Ce serait l’occasion d’apprendre la photo.', 0], ['Bof, c’est un week-end.', 1], ['Toi qui adores la nature, tu vas adorer !', 0], ['C’est cher, mais bon.', 1]]),
      say('Tu sais quoi ? J’ai trouvé un week-end parfait pour toi. Imagine : des randonnées en Gaspésie et un cours de photo !', 'You know what? I found a perfect weekend for you. Imagine: hikes in Gaspésie and a photo class!'),
    ],
    [
      b('About 10 min; convince a friend (tu); answer objections.', 'Environ 10 min ; convaincre un ami (tu) ; répondre aux objections.'),
      b('Imagine…, Ça te ferait du bien de…, Ce serait l’occasion de…', 'Imagine…, Ça te ferait du bien de…, Ce serait l’occasion de…'),
      b('Personalise: Toi qui adores…', 'Personnalisez : Toi qui adores…'),
    ],
    [['un gîte', b('a guesthouse', 'petit hébergement')], ['changer d’air', b('to get a change of scene', 'partir ailleurs')], ['une initiation', b('an introduction (course)', 'première découverte')]],
  ),
  lesson(C, 2, ['answering-objections', 'repondre-aux-objections'],
    b('Answering objections', 'Répondre aux objections'),
    b('Acknowledge each objection and answer it with a concrete argument.', 'Reconnaître chaque objection et y répondre par un argument concret.'),
    [b('Acknowledge the objection', 'Reconnaître l’objection'), b('Answer price, time and interest objections', 'Répondre aux objections de prix, temps et intérêt'), b('Propose a solution', 'Proposer une solution')],
    13,
    [
      card(b('The 3-step answer', 'La réponse en 3 temps'), b('1. **Acknowledge**: **Je te comprends · C’est vrai que…** 2. **Counter**: **mais pense à… · justement…** 3. **Solution**: **On pourrait… · Et si on… ?** Typical objections: **C’est trop cher. · Je n’ai pas le temps. · Je ne connais personne. · Je suis nul en… · C’est trop loin.**', '1. **Reconnaître** : **Je te comprends · C’est vrai que…** 2. **Contrer** : **mais pense à… · justement…** 3. **Solution** : **On pourrait… · Et si on… ?** Objections typiques : **C’est trop cher. · Je n’ai pas le temps. · Je ne connais personne. · Je suis nul en… · C’est trop loin.**')),
      mc(P.best, ['Je te comprends, mais pense que les repas et l’hébergement sont compris. En plus, si on partage la voiture, on économise l’essence.', 'Tant pis pour toi.', 'Non, ce n’est pas cher.', 'Alors ne viens pas.'], { fr: '— 340 dollars, c’est trop cher pour moi.' }),
      mc(P.best, ['Justement, c’est en petit groupe de huit : c’est idéal pour rencontrer des gens sympas. Et je serai là, moi !', 'Ce n’est pas grave.', 'Moi non plus, je ne connais personne.', 'Tu es timide, c’est ton problème.'], { fr: '— Je ne connais personne, je vais me sentir seul.' }),
      dlg(b('Convincing a friend', 'Convaincre un ami'), undefined, [['Examinateur (ami)', 'm'], ['Vous', 'f']], [
        [0, 'Un week-end photo ? Je n’y connais rien en photo, moi.', 'A photo weekend? I know nothing about photography.'],
        [1, { options: ['Justement, c’est une initiation ! C’est fait pour les débutants, et un guide t’apprend tout sur place.', 'Alors reste chez toi.', 'Moi non plus.'] }],
        [0, 'Et je suis crevé en ce moment, j’ai besoin de repos.', 'And I’m worn out at the moment, I need rest.'],
        [1, { options: ['Je te comprends. Mais deux jours en pleine nature, loin des écrans, c’est le meilleur repos qui soit ! Et les randonnées sont faciles.', 'Tu es toujours fatigué.', 'Ok, tant pis.'] }],
        [0, 'Hmm… Tu marques un point. Ce serait quand ?', 'Hmm… You have a point. When would it be?'],
      ]),
      sort(b('Acknowledge, counter or solution?', 'Reconnaître, contrer ou solution ?'), [b('acknowledge', 'reconnaître'), b('counter', 'contrer'), b('solution', 'solution')], [['Je te comprends.', 0], ['Justement, c’est fait pour les débutants.', 1], ['On pourrait partager la voiture.', 2], ['C’est vrai que c’est loin.', 0], ['Mais pense au paysage !', 1], ['Et si on partait vendredi soir ?', 2]]),
    ],
    [
      b('Acknowledge → counter → solution.', 'Reconnaître → contrer → solution.'),
      b('Justement… turns the objection into an argument.', 'Justement… transforme l’objection en argument.'),
      b('Prepare answers to price, time, interest, people, distance.', 'Préparez des réponses : prix, temps, intérêt, personnes, distance.'),
    ],
    [['crevé', b('worn out (informal)', 'très fatigué')], ['marquer un point', b('to have a point', 'avoir un bon argument')], ['qui soit', b('there is (emphatic)', 'qui existe')]],
  ),
  lesson(C, 3, ['full-simulation', 'simulation-complete'],
    b('Full simulation', 'Simulation complète'),
    b('Practise a complete section B on a new document.', 'S’entraîner à une section B complète sur un nouveau document.'),
    [b('Prepare arguments from a new document', 'Préparer des arguments à partir d’un nouveau document'), b('Handle a series of objections', 'Gérer une série d’objections'), b('Conclude by securing agreement', 'Conclure en obtenant l’accord')],
    13,
    [
      doc({ look: 'ad', title: b('Ad', 'Annonce'), text: 'DEVENEZ BÉNÉVOLE AU FESTIVAL DE JAZZ !\n4 heures par semaine pendant le festival\nT-shirt, repas et accès gratuit aux concerts\nAucune expérience requise — formation offerte' }, b('Which argument is the strongest for a jazz-loving friend?', 'Quel argument est le plus fort pour un ami qui aime le jazz ?'), [b('free access to all the concerts', 'l’accès gratuit à tous les concerts'), b('a free T-shirt', 'un t-shirt gratuit'), b('only 4 hours', 'seulement 4 heures'), b('training is offered', 'la formation est offerte')]),
      dlg(b('Volunteering at the festival', 'Bénévole au festival'), undefined, [['Examinatrice (amie)', 'f'], ['Vous', 'm']], [
        [0, 'Bénévole ? Travailler gratuitement pendant mes vacances ? Non merci !', 'Volunteer? Work for free during my holidays? No thanks!'],
        [1, { options: ['Je te comprends, mais ce n’est que quatre heures par semaine. Et toi qui adores le jazz, tu aurais accès gratuitement à tous les concerts !', 'Tant pis.', 'Tu ne comprends rien.'] }],
        [0, 'Mais je n’ai aucune expérience.', 'But I have no experience.'],
        [1, { options: ['Justement, aucune expérience n’est requise, et ils offrent une formation. En plus, on pourrait s’inscrire ensemble !', 'Ce n’est pas grave.', 'Moi non plus.'] }],
        [0, 'Bon… si on y va ensemble, pourquoi pas.', 'Well… if we go together, why not.'],
        [1, { options: ['Super ! Je nous inscris ce soir, tu ne le regretteras pas !', 'Ok.', 'Je savais.'] }],
      ]),
      say('Je te comprends, mais ce n’est que quatre heures par semaine. Et toi qui adores le jazz, imagine : tous les concerts gratuitement !', 'I get it, but it’s only four hours a week. And you who love jazz, imagine: all the concerts for free!'),
      tip(b('Keep it a conversation', 'Gardez un vrai dialogue'), b('Don’t deliver a monologue: **ask your friend questions** (Qu’est-ce qui te fait hésiter ? Tu préférerais quel jour ?), react to each answer, and **end with a clear agreement** (Alors, c’est d’accord ?).', 'Ne faites pas un monologue : **posez des questions à votre ami** (Qu’est-ce qui te fait hésiter ? Tu préférerais quel jour ?), réagissez à chaque réponse et **terminez par un accord clair** (Alors, c’est d’accord ?).')),
    ],
    [
      b('Choose the arguments that match your friend’s tastes.', 'Choisissez les arguments adaptés aux goûts de votre ami.'),
      b('Answer each objection: acknowledge, counter, propose.', 'Répondez à chaque objection : reconnaître, contrer, proposer.'),
      b('Ask questions and end with an agreement.', 'Posez des questions et terminez par un accord.'),
    ],
    [['un bénévole', b('a volunteer', 'qui aide sans être payé')], ['requis', b('required', 'exigé')], ['s’inscrire', b('to sign up', 'donner son nom')]],
  ),
];
