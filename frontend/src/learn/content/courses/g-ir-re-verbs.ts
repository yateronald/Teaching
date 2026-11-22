import type { CourseAbout } from '../../types';
import { b, card, conj, dict, gap, lesson, mc, ord, P, pairs, say, sort, tip, trap } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Most French verbs end in -er, yet dozens of essential daily verbs end in -ir or -re: finir, choisir, partir, dormir, vendre, attendre, prendre. Unlike -er verbs, they follow distinct patterns in the present tense — some add -iss- in the plural (nous finissons), some drop a consonant in the singular (je pars, ils partent), and -re verbs keep -ds / -d or change their stem in the plural (nous prenons, ils prennent). This A2 course breaks all three groups down so you conjugate them reliably.',
    'La majorité des verbes français finissent en -er, mais des dizaines de verbes indispensables finissent en -ir ou en -re : finir, choisir, partir, dormir, vendre, attendre, prendre. Contrairement aux verbes en -er, ils suivent des modèles précis au présent : les uns ajoutent -iss- au pluriel (nous finissons), d’autres perdent une consonne au singulier (je pars, ils partent), et les verbes en -re gardent le d ou changent de radical. Ce cours A2 les classe clairement pour vous éviter toute hésitation.',
  ),
  outcomes: [
    b('Conjugate regular -ir verbs with -iss- (finir, choisir, réussir)', 'Conjuguer les verbes réguliers en -ir avec -iss- (finir, choisir, réussir)'),
    b('Conjugate two-stem -ir verbs (partir, sortir, dormir)', 'Conjuguer les verbes en -ir à deux radicaux (partir, sortir, dormir)'),
    b('Conjugate regular -re verbs (vendre, attendre, répondre)', 'Conjuguer les verbes réguliers en -re (vendre, attendre, répondre)'),
    b('Master prendre, apprendre and comprendre in the present', 'Maîtriser prendre, apprendre et comprendre au présent'),
  ],
};

const C = 'g-ir-re-verbs';
export default [
  lesson(C, 1, ['regular-ir-verbs', 'verbes-reguliers-en-ir'],
    b('Regular -ir verbs: finir, choisir, réussir', 'Les verbes réguliers en -ir : finir, choisir, réussir'),
    b('Master the -is, -is, -it, -issons, -issez, -issent pattern.', 'Maîtriser le modèle en -is, -is, -it, -issons, -issez, -issent.'),
    [b('Conjugate finir-type verbs', 'Conjuguer les verbes du type finir'), b('Hear the -iss- in the plural', 'Entendre le -iss- au pluriel'), b('Use choisir, réussir, réfléchir, grandir', 'Employer choisir, réussir, réfléchir, grandir')],
    13,
    [
      card(b('The -iss- family (2nd group)', 'La famille en -iss- (2e groupe)'), b('Regular **-ir** verbs drop **-ir** and add **-is, -is, -it, -issons, -issez, -issent**. In speech, the three singular forms sound identical (**[fini]**), while the three plural forms all show **-iss-** (**[finisɔ̃, finise, finis]**). Key verbs: **finir, choisir, réussir, grandir, réfléchir, obéir, remplir**.', 'Les verbes réguliers en **-ir** ajoutent **-is, -is, -it, -issons, -issez, -issent**. À l’oral, les trois formes du singulier se prononcent pareil (**[fini]**), tandis que tout le pluriel fait entendre **-iss-** (**[finisɔ̃, finise, finis]**). Verbes clés : **finir, choisir, réussir, grandir, réfléchir, obéir, remplir**.'), {
        ex: [['Je finis mon travail à dix-sept heures.', 'I finish work at 5 p.m.'], ['Nous choisissons les desserts ensemble.', 'We’re choosing the desserts together.'], ['Les enfants grandissent vite !', 'The children are growing fast!']],
      }),
      conj('finir', b('present', 'présent'), [['je', 'finis'], ['tu', 'finis'], ['il / elle', 'finit'], ['nous', 'finissons'], ['vous', 'finissez'], ['ils / elles', 'finissent']], { given: [0] }),
      pairs(P.match, [['réussir un examen', b('to pass an exam', 'obtenir un examen')], ['réfléchir avant de parler', b('to think before speaking', 'penser attentivement')], ['remplir un formulaire', b('to fill in a form', 'compléter un document')], ['choisir un menu', b('to choose a set menu', 'faire un choix')]]),
      mc(P.form, ['choisissent', 'choisent', 'choisissons', 'choisit'], { fr: 'Mes parents ___ toujours une table près de la fenêtre.' }),
      mc(P.form, ['réfléchissons', 'réfléchons', 'réfléchis', 'réfléchissent'], { fr: 'Nous ___ encore à cette proposition.' }),
      gap(P.complete, 'Tu ___ (finir) le dossier, et nous ___ (remplir) les dernières fiches.', ['finis', 'remplissons']),
      dict('Ils finissent le repas, puis ils choisissent un bon film.', { voice: 'f' }),
    ],
    [
      b('Regular -ir endings: -is, -is, -it, -issons, -issez, -issent.', 'Terminaisons régulières en -ir : -is, -is, -it, -issons, -issez, -issent.'),
      b('All plural forms carry -iss- (finissons, finissez, finissent).', 'Tout le pluriel comporte -iss- (finissons, finissez, finissent).'),
      b('Main verbs: finir, choisir, réussir, réfléchir, grandir, remplir.', 'Verbes fréquents : finir, choisir, réussir, réfléchir, grandir, remplir.'),
    ],
    [['réussir', b('to succeed, pass', 'parvenir à un résultat')], ['réfléchir', b('to think over', 'méditer, peser')], ['remplir', b('to fill in / up', 'compléter')]],
  ),
  lesson(C, 2, ['irregular-ir-partir-dormir', 'verbes-en-ir-partir-dormir'],
    b('Two-stem -ir verbs: partir, sortir, dormir', 'Les verbes en -ir sans -iss- : partir, sortir, dormir'),
    b('Drop the stem consonant in the singular and bring it back in the plural.', 'Supprimer la consonne finale du radical au singulier et la retrouver au pluriel.'),
    [b('Spot verbs without -iss-', 'Repérer les verbes sans -iss-'), b('Conjugate partir, sortir, dormir, servir', 'Conjuguer partir, sortir, dormir, servir'), b('Avoid adding -iss- by mistake', 'Éviter d’ajouter -iss- par erreur')],
    13,
    [
      card(b('No -iss-! Two stems', 'Pas de -iss- ! Deux radicaux'), b('Frequent **-ir** verbs like **partir, sortir, dormir, servir, sentir, mentir** do **not** take **-iss-**. Instead, the **final consonant of the stem disappears in the singular** (**par-**) and **returns in the plural** (**part-**): **je pars, tu pars, il part, nous partons, vous partez, ils partent**. Same for **dormir**: **je dors / nous dormons / ils dorment**.', 'Des verbes fréquents comme **partir, sortir, dormir, servir, sentir, mentir** ne prennent **pas de -iss-**. La **consonne finale du radical tombe au singulier** (**par-**) et **revient au pluriel** (**part-**) : **je pars, tu pars, il part, nous partons, vous partez, ils partent**. Même chose pour **dormir** : **je dors / nous dormons / ils dorment**.'), {
        ex: [['Le train part dans cinq minutes.', 'The train leaves in five minutes.'], ['Vous sortez ce soir ?', 'Are you going out tonight?'], ['Les bébés dorment encore.', 'The babies are still sleeping.']],
      }),
      trap(b('Never « ils partissent »!', 'Jamais « ils partissent » !'), b('A common slip is treating **partir** or **dormir** like **finir**. Remember: **ils partent** (not « partissent »), **nous sortons** (not « sortissons »), **vous dormez** (not « dormissez »).', 'Erreur fréquente : conjuguer **partir** ou **dormir** comme **finir**. Retenez : **ils partent** (et non « partissent »), **nous sortons** (et non « sortissons »), **vous dormez**.')),
      conj('partir', b('present', 'présent'), [['je', 'pars'], ['tu', 'pars'], ['il / elle', 'part'], ['nous', 'partons'], ['vous', 'partez'], ['ils / elles', 'partent']], { given: [0] }),
      sort(b('With -iss- or without -iss-?', 'Avec -iss- ou sans -iss- ?'), [b('with -iss- (finir)', 'avec -iss- (finir)'), b('no -iss- (partir)', 'sans -iss- (partir)')], [['choisir', 0], ['dormir', 1], ['réussir', 0], ['sortir', 1], ['réfléchir', 0], ['servir', 1]]),
      mc(P.form, ['dorment', 'dormissent', 'dors', 'dormont'], { fr: 'Les chats ___ souvent l’après-midi.' }),
      mc(P.form, ['sert', 'servent', 'servit', 'ser'], { fr: 'Ce restaurant ___ des plats végétariens.' }),
      gap(P.complete, 'Tu ___ (sortir) maintenant ? – Oui, nous ___ (partir) rejoindre Marc.', ['sors', 'partons']),
      say('Je pars tôt demain matin, alors je dors déjà à dix heures.', 'I’m leaving early tomorrow morning, so I’m already asleep at ten.'),
    ],
    [
      b('partir, sortir, dormir, servir, sentir drop the stem consonant in the singular: je pars, je dors.', 'partir, sortir, dormir, servir, sentir perdent la consonne finale au singulier : je pars, je dors.'),
      b('The consonant returns in the plural, without -iss-: nous partons, ils dorment.', 'La consonne revient au pluriel, sans -iss- : nous partons, ils dorment.'),
      b('Endings: -s, -s, -t, -ons, -ez, -ent.', 'Terminaisons : -s, -s, -t, -ons, -ez, -ent.'),
    ],
    [['partir', b('to leave', 'quitter un lieu')], ['servir', b('to serve', 'apporter à table, être utile')], ['sentir', b('to smell, to feel', 'percevoir une odeur ou sensation')]],
  ),
  lesson(C, 3, ['re-verbs-and-prendre', 'verbes-en-re-et-prendre'],
    b('-re verbs and the prendre family', 'Les verbes en -re et la famille de prendre'),
    b('Conjugate regular -re verbs (vendre, attendre, répondre) and prendre / apprendre / comprendre.', 'Conjuguer les verbes en -re (vendre, attendre, répondre) et prendre / apprendre / comprendre.'),
    [b('Conjugate vendre, attendre, répondre', 'Conjuguer vendre, attendre, répondre'), b('Keep the silent d in the 3rd person singular', 'Garder le d muet à la 3e personne du singulier'), b('Conjugate prendre, apprendre, comprendre', 'Conjuguer prendre, apprendre, comprendre')],
    13,
    [
      card(b('Regular -re verbs: keep the d', 'Les verbes en -re : le d reste'), b('For **vendre, attendre, répondre, entendre, perdre, descendre**, remove **-re** and add **-s, -s, —, -ons, -ez, -ent**: **je vends, tu vends, il vend** (no **-t** after **d**!), **nous vendons, vous vendez, ils vendent**.', 'Pour **vendre, attendre, répondre, entendre, perdre, descendre**, on enlève **-re** et on ajoute **-s, -s, —, -ons, -ez, -ent** : **je vends, tu vends, il vend** (pas de **-t** après **d** !), **nous vendons, vous vendez, ils vendent**.'), {
        ex: [['Elle attend le bus devant la mairie.', 'She is waiting for the bus in front of town hall.'], ['Vous entendez la musique ?', 'Do you hear the music?'], ['Ils répondent toujours rapidement.', 'They always reply quickly.']],
      }),
      tip(b('The prendre family', 'La famille de prendre'), b('**Prendre, apprendre, comprendre** keep **d** in the singular (**je prends, tu prends, il prend**), drop **d** in **nous / vous** (**nous prenons, vous prenez**), and double the **n** in **ils / elles prennent** (**[pʁɛn]**).', '**Prendre, apprendre, comprendre** gardent le **d** au singulier (**je prends, tu prends, il prend**), le perdent avec **nous / vous** (**nous prenons, vous prenez**), et doublent le **n** avec **ils / elles prennent** (**[pʁɛn]**).')),
      conj('prendre', b('present', 'présent'), [['je', 'prends'], ['tu', 'prends'], ['il / elle', 'prend'], ['nous', 'prenons'], ['vous', 'prenez'], ['ils / elles', 'prennent']], { given: [0] }),
      mc(P.spelling, ['Il répond à tous ses messages.', 'Il réponds à tous ses messages.', 'Il répondt à tous ses messages.', 'Il répont à tous ses messages.']),
      mc(P.form, ['comprennent', 'comprendent', 'comprenent', 'comprend'], { fr: 'Les touristes ___ très bien le guide.' }),
      gap(P.complete, 'Paul ___ (attendre) son frère et ses amis ___ (prendre) le métro.', ['attend', 'prennent']),
      ord(P.order, 'Nous attendons le train depuis dix minutes.', { tr: 'We have been waiting for the train for ten minutes.' }),
      dict('Elle vend des fleurs au marché et comprend plusieurs langues.', { voice: 'm' }),
    ],
    [
      b('Regular -re: -s, -s, — (il vend, il répond — no -t), -ons, -ez, -ent.', 'Verbes en -re réguliers : -s, -s, — (il vend, il répond — sans -t), -ons, -ez, -ent.'),
      b('prendre, apprendre, comprendre: je prends / il prend, nous prenons, ils prennent.', 'prendre, apprendre, comprendre : je prends / il prend, nous prenons, ils prennent.'),
      b('Drop the d in nous prenons / vous prenez; double n in ils prennent.', 'Pas de d dans nous prenons / vous prenez ; double n dans ils prennent.'),
    ],
    [['attendre', b('to wait for', 'patienter jusqu’à l’arrivée de')], ['répondre', b('to answer', 'donner une réponse')], ['comprendre', b('to understand', 'saisir le sens')]],
  ),
];
