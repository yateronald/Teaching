import type { CourseAbout } from '../../types';
import { b, card, hear, lesson, mc, ord, P, pairs, say, sort, tip, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'French has a long tradition of eloquence, from the pulpit and the courtroom to political speeches and today’s student eloquence contests. At C2, you can learn its tools: the rhetorical question, anaphora and the rule of three, antithesis, the striking image, rhythm and pauses, and the structure of a speech that moves its audience. This course analyses short original speech excerpts and trains you to compose and deliver your own.',
    'Le français a une longue tradition d’éloquence, de la chaire et du prétoire aux discours politiques et aux concours d’éloquence étudiants d’aujourd’hui. Au niveau C2, vous pouvez en maîtriser les outils : la question rhétorique, l’anaphore et la règle de trois, l’antithèse, l’image frappante, le rythme et les silences, et la structure d’un discours qui émeut son auditoire. Ce cours analyse de courts extraits de discours originaux et vous entraîne à composer et prononcer les vôtres.',
  ),
  outcomes: [
    b('Recognise the main rhetorical figures', 'Reconnaître les principales figures de rhétorique'),
    b('Use anaphora, the rule of three and antithesis', 'Employer l’anaphore, la règle de trois et l’antithèse'),
    b('Structure a persuasive speech', 'Structurer un discours persuasif'),
    b('Work on rhythm, pauses and delivery', 'Travailler le rythme, les silences et le débit'),
  ],
};

const C = 'c-eloquence';
export default [
  lesson(C, 1, ['figures-of-speech', 'les-figures-de-style'],
    b('The figures of eloquence', 'Les figures de l’éloquence'),
    b('Recognise and use anaphora, the rule of three, antithesis and the rhetorical question.', 'Reconnaître et employer l’anaphore, la règle de trois, l’antithèse et la question rhétorique.'),
    [b('Recognise anaphora and the rule of three', 'Reconnaître l’anaphore et la règle de trois'), b('Use antithesis', 'Employer l’antithèse'), b('Ask a rhetorical question', 'Poser une question rhétorique')],
    13,
    [
      card(b('Four key figures', 'Quatre figures clés'), b('**Anaphora**: repeating the opening words: **« Nous voulons une ville qui respire. Nous voulons une ville qui accueille. Nous voulons une ville qui ose. »** **Rule of three**: **« simple, juste et durable »**. **Antithesis**: **« Ce n’est pas la fin du chemin, c’est le début de la route. »** **Rhetorical question**: **« Qui, parmi nous, n’a jamais douté ? »**', '**Anaphore** : répéter les mots du début : **« Nous voulons une ville qui respire. Nous voulons une ville qui accueille. Nous voulons une ville qui ose. »** **Règle de trois** : **« simple, juste et durable »**. **Antithèse** : **« Ce n’est pas la fin du chemin, c’est le début de la route. »** **Question rhétorique** : **« Qui, parmi nous, n’a jamais douté ? »**')),
      sort(b('Which figure?', 'Quelle figure ?'), [b('anaphora', 'anaphore'), b('antithesis', 'antithèse'), b('rhetorical question', 'question rhétorique')], [['Nous avons rêvé. Nous avons lutté. Nous avons gagné.', 0], ['Petits gestes, grands effets.', 1], ['Faut-il vraiment attendre la catastrophe pour agir ?', 2], ['Chaque jour… Chaque nuit… Chaque heure…', 0], ['Hier un rêve, demain une réalité.', 1], ['Qui oserait dire le contraire ?', 2]]),
      mc(P.best, ['Une école ouverte, une école exigeante, une école qui n’abandonne personne.', 'L’école est bien et il faut qu’elle soit mieux.', 'L’école, c’est important, je crois.', 'Il y a beaucoup de choses à dire sur l’école.'], { fr: 'Quelle phrase utilise l’anaphore et la règle de trois ?' }),
      hear('On nous dit que c’est impossible. On nous disait la même chose il y a vingt ans. Alors je vous le demande : qui, ici, veut renoncer avant même d’avoir essayé ? Ce n’est pas le courage qui nous manque, c’est la décision.', b('Which figure closes the excerpt?', 'Quelle figure termine l’extrait ?'), [b('an antithesis (not courage… but decision)', 'une antithèse (pas le courage… mais la décision)'), b('a list of figures', 'une liste de chiffres'), b('a quotation from a poet', 'une citation de poète'), b('a joke', 'une plaisanterie')], { voice: 'f' }),
      pairs(P.match, [['l’anaphore', b('anaphora', 'répétition en début de phrase')], ['l’antithèse', b('antithesis', 'opposition de deux idées')], ['une question rhétorique', b('a rhetorical question', 'question sans réponse attendue')], ['un auditoire', b('an audience', 'ceux qui écoutent')]]),
      say('Nous voulons une ville qui respire. Nous voulons une ville qui accueille. Nous voulons une ville qui ose.', 'We want a city that breathes. We want a city that welcomes. We want a city that dares.'),
    ],
    [
      b('Anaphora: repeat the opening words to build momentum.', 'Anaphore : répéter le début pour créer un élan.'),
      b('Rule of three: three terms feel complete.', 'Règle de trois : trois termes donnent une impression de plénitude.'),
      b('Antithesis and rhetorical questions engage the audience.', 'Antithèse et question rhétorique impliquent l’auditoire.'),
    ],
    [['oser', b('to dare', 'avoir l’audace')], ['renoncer', b('to give up', 'abandonner')], ['l’élan', b('momentum', 'force qui pousse')]],
  ),
  lesson(C, 2, ['images-and-rhythm', 'images-et-rythme'],
    b('Images and rhythm', 'Images et rythme'),
    b('Make your speech memorable with striking images, short sentences and pauses.', 'Rendre son discours mémorable par des images frappantes, des phrases courtes et des silences.'),
    [b('Create a striking image', 'Créer une image frappante'), b('Vary sentence length', 'Varier la longueur des phrases'), b('Use pauses', 'Utiliser les silences')],
    13,
    [
      card(b('Images and rhythm', 'Images et rythme'), b('**Metaphor**: **« La mémoire est un jardin : si on ne l’entretient pas, il disparaît. »** **Concrete figures**: **« chaque minute, l’équivalent d’un terrain de football de forêt disparaît »**. **Rhythm**: a long sentence that builds… then a short one. **Pause** before and after the key word.', '**Métaphore** : **« La mémoire est un jardin : si on ne l’entretient pas, il disparaît. »** **Chiffres concrets** : **« chaque minute, l’équivalent d’un terrain de football de forêt disparaît »**. **Rythme** : une phrase longue qui monte… puis une courte. **Silence** avant et après le mot clé.')),
      tip(b('The power of the short sentence', 'La force de la phrase courte'), b('After a long, flowing sentence, a **very short sentence** strikes: « Nous avons tout essayé, les réunions, les rapports, les promesses, les plans sur dix ans. Rien n’a changé. » Then **pause**.', 'Après une phrase longue et fluide, une **phrase très courte** frappe : « Nous avons tout essayé, les réunions, les rapports, les promesses, les plans sur dix ans. Rien n’a changé. » Puis **silence**.')),
      mc(P.best, ['Une langue, c’est une maison : on y entre par la porte des mots, on y reste pour la chaleur des gens.', 'Une langue est un ensemble de règles grammaticales et lexicales.', 'Les langues sont utiles et intéressantes.', 'Apprendre une langue prend du temps, en général.'], { fr: 'Quelle phrase contient la métaphore la plus frappante ?' }),
      mc(P.best, ['Ils ont promis des écoles, des hôpitaux, des routes, des emplois. Nous attendons toujours.', 'Ils ont promis des choses, et nous attendons toujours ces choses qu’ils ont promises.', 'Il y a eu des promesses non tenues.', 'Les promesses ne sont pas tenues souvent.'], { fr: 'Quelle phrase utilise le mieux le contraste long / court ?' }),
      ord(P.order, 'Nous avons tout essayé. Rien n’a changé.', { tr: 'We have tried everything. Nothing has changed.' }),
      pairs(P.match, [['une métaphore', b('a metaphor', 'image sans « comme »')], ['entretenir', b('to maintain, tend', 'prendre soin de')], ['frappant', b('striking', 'qui marque')], ['le débit', b('the pace of speech', 'vitesse de parole')]]),
      say('La mémoire est un jardin. Si on ne l’entretient pas… il disparaît.', 'Memory is a garden. If you don’t tend it… it disappears.', { tip: b('Pause before « il disparaît ».', 'Marquez un silence avant « il disparaît ».') }),
    ],
    [
      b('One strong image beats ten abstract words.', 'Une image forte vaut mieux que dix mots abstraits.'),
      b('Long sentence that builds, then a short one that strikes.', 'Une phrase longue qui monte, puis une courte qui frappe.'),
      b('Pause before and after the key idea.', 'Silence avant et après l’idée clé.'),
    ],
    [['une promesse', b('a promise', 'engagement')], ['abstrait', b('abstract', 'pas concret')], ['marquer un silence', b('to pause', 's’arrêter de parler')]],
  ),
  lesson(C, 3, ['structuring-a-speech', 'structurer-un-discours'],
    b('Structuring a speech', 'Structurer un discours'),
    b('Build a short speech: hook, problem, vision, call to action and memorable close.', 'Construire un court discours : accroche, problème, vision, appel à l’action et clôture mémorable.'),
    [b('Open with a hook', 'Ouvrir par une accroche'), b('Move from problem to vision', 'Passer du problème à la vision'), b('Close memorably', 'Conclure de façon mémorable')],
    13,
    [
      card(b('The five movements', 'Les cinq mouvements'), b('1. **Hook**: an anecdote, a figure, a question. 2. **Problem**: what is wrong, concretely. 3. **Vision**: what could be. 4. **Call to action**: what we must do, now. 5. **Close**: echo the hook (circular structure) or a short striking sentence.', '1. **Accroche** : une anecdote, un chiffre, une question. 2. **Problème** : ce qui ne va pas, concrètement. 3. **Vision** : ce qui pourrait être. 4. **Appel à l’action** : ce que nous devons faire, maintenant. 5. **Clôture** : écho à l’accroche (structure circulaire) ou phrase courte et frappante.')),
      sort(b('Which movement?', 'Quel mouvement ?'), [b('hook', 'accroche'), b('vision', 'vision'), b('call to action', 'appel à l’action')], [['Il y a dix ans, dans cette salle, une élève de douze ans a posé une question…', 0], ['Imaginez un quartier où chaque enfant a une bibliothèque à cinq minutes.', 1], ['Ce soir, je vous demande de signer cette pétition.', 2], ['Saviez-vous qu’un Français sur dix ne lit jamais ?', 0], ['Demain, nos rues pourraient être des jardins.', 1], ['Rejoignez-nous dès lundi.', 2]]),
      mc(P.best, ['Il y a dix ans, une élève demandait pourquoi sa bibliothèque fermait. Ce soir, j’ai enfin une réponse : elle ne fermera plus.', 'Voilà, c’est tout, merci de votre attention.', 'Je pense avoir tout dit, je crois.', 'Bon, il est tard, on va s’arrêter là.'], { fr: 'Quelle clôture fait écho à l’accroche ?' }),
      write(b('Write a short speech.', 'Rédigez un court discours.'), b('Write a 1-minute speech (90–140 words) to convince your town council to open a public library on Sundays. Follow the five movements and use at least one anaphora and one antithesis.', 'Rédigez un discours d’une minute (90–140 mots) pour convaincre le conseil municipal d’ouvrir la bibliothèque le dimanche. Suivez les cinq mouvements et utilisez au moins une anaphore et une antithèse.'), 90, 140, [
        b('Hook (anecdote, figure or question)', 'Accroche (anecdote, chiffre ou question)'),
        b('Problem and vision', 'Problème et vision'),
        b('At least one anaphora and one antithesis', 'Au moins une anaphore et une antithèse'),
        b('Clear call to action and a memorable close', 'Appel à l’action clair et clôture mémorable'),
      ], 'Dimanche dernier, une petite fille m’a demandé pourquoi la bibliothèque était fermée « le seul jour où maman ne travaille pas ». Je n’ai pas su lui répondre. Aujourd’hui, nos portes sont ouvertes quand les familles travaillent, et fermées quand elles sont libres. Imaginez une bibliothèque ouverte aux parents, ouverte aux enfants, ouverte à tous ceux qui n’ont que le dimanche pour lire. Ce n’est pas une dépense, c’est un investissement dans notre avenir. Je vous demande ce soir de voter une ouverture à l’essai, six mois, dès janvier. Et le jour où cette petite fille poussera la porte un dimanche, nous aurons notre réponse.', { phrases: ['Imaginez…', 'Ce n’est pas…, c’est…', 'Je vous demande ce soir de…'] }),
      pairs(P.match, [['une accroche', b('a hook', 'début qui capte')], ['une structure circulaire', b('a circular structure', 'fin qui rappelle le début')], ['le conseil municipal', b('the town council', 'élus de la ville')], ['une pétition', b('a petition', 'texte signé collectivement')]]),
      say('Ce n’est pas une dépense, c’est un investissement. Je vous demande ce soir de voter pour l’avenir.', 'It is not an expense, it is an investment. I ask you tonight to vote for the future.'),
    ],
    [
      b('Hook → problem → vision → call to action → close.', 'Accroche → problème → vision → appel à l’action → clôture.'),
      b('A circular close echoes the hook.', 'Une clôture circulaire fait écho à l’accroche.'),
      b('End on a short, strong sentence.', 'Terminez sur une phrase courte et forte.'),
    ],
    [['un investissement', b('an investment', 'dépense pour l’avenir')], ['voter', b('to vote', 'décider par un vote')], ['l’avenir', b('the future', 'le futur')]],
  ),
];
