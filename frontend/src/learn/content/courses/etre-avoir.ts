import type { CourseAbout } from '../../types';
import { b, card, conj, dict, dlg, gap, lesson, mc, ord, P, pairs, say, sort, tip, trap } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Être (to be) and avoir (to have) are the two pillars of French: you need them to say who you are, how old you are, how you feel, and later to build every past tense. This course teaches both verbs in context, the expressions where French uses avoir where English uses “to be” (avoir faim, avoir 20 ans), and the difference between c’est and il est.',
    'Être et avoir sont les deux piliers du français : ils servent à dire qui l’on est, son âge, ce que l’on ressent, et plus tard à construire tous les temps du passé. Ce cours présente les deux verbes en contexte, les expressions où le français emploie avoir là où l’anglais dit « to be » (avoir faim, avoir 20 ans), et la différence entre c’est et il est.',
  ),
  outcomes: [
    b('Conjugate être and avoir in the present', 'Conjuguer être et avoir au présent'),
    b('Use avoir faim, soif, froid, peur and avoir + age', 'Employer avoir faim, soif, froid, peur et avoir + âge'),
    b('Choose between c’est and il / elle est', 'Choisir entre c’est et il / elle est'),
    b('Describe yourself and someone else', 'Vous décrire et décrire quelqu’un'),
  ],
};

const C = 'etre-avoir';
export default [
  lesson(C, 1, ['the-verb-etre', 'le-verbe-etre'],
    b('The verb être: who and how you are', 'Le verbe être : qui vous êtes, comment vous êtes'),
    b('Conjugate être and use it for identity, nationality, profession and description.', 'Conjuguer être et l’employer pour l’identité, la nationalité, la profession et la description.'),
    [b('Conjugate être', 'Conjuguer être'), b('Say your nationality and job', 'Dire sa nationalité et son métier'), b('Describe with adjectives', 'Décrire avec des adjectifs')],
    12,
    [
      card(b('Être in the present', 'Être au présent'), b('**Être** is irregular: **je suis, tu es, il / elle / on est, nous sommes, vous êtes, ils / elles sont**. With a job or a nationality, French uses **no article**: **Je suis infirmière**, not « je suis une infirmière ».', '**Être** est irrégulier : **je suis, tu es, il / elle / on est, nous sommes, vous êtes, ils / elles sont**. Avec un métier ou une nationalité, **pas d’article** : **Je suis infirmière**, et non « je suis une infirmière ».'), {
        ex: [['Je suis canadienne.', 'I am Canadian.'], ['Vous êtes étudiant ?', 'Are you a student?'], ['Nous sommes à Montréal.', 'We are in Montréal.'], ['Ils sont très gentils.', 'They are very kind.']],
      }),
      conj('être', b('present', 'présent'), [['je', 'suis'], ['tu', 'es'], ['il / elle', 'est'], ['nous', 'sommes'], ['vous', 'êtes'], ['ils / elles', 'sont']], { given: [0] }),
      mc(P.form, ['sommes', 'sont', 'êtes', 'est'], { fr: 'Nous ___ en retard.' }),
      mc(P.form, ['es', 'est', 'suis', 'êtes'], { fr: 'Tu ___ française ?' }),
      mc(P.best, ['Elle est médecin.', 'Elle est une médecin.', 'Elle a médecin.', 'Elle est la médecin.'], { explain: b('No article after être with a profession.', 'Pas d’article après être devant un métier.') }),
      gap(P.complete, 'Je ___ ingénieur et ma femme ___ professeure. Nous ___ à Québec.', ['suis', 'est', 'sommes']),
      ord(P.order, 'Vous êtes de quelle ville ?', { tr: 'Which city are you from?' }),
      dlg(b('At a welcome evening', 'À une soirée d’accueil'), b('Two newcomers meet in Montréal.', 'Deux nouveaux arrivants se rencontrent à Montréal.'), [['Inès', 'f'], ['Vous', 'm']], [
        [0, 'Bonsoir ! Vous êtes nouveau ici ?', 'Good evening! Are you new here?'],
        [1, { options: ['Oui, je suis brésilien, je suis arrivé lundi.', 'Oui, j’ai brésilien.', 'Oui, je suis un nouveau brésilien lundi.'] }],
        [0, 'Bienvenue ! Et vous êtes dans quel domaine ?', 'Welcome! And what field are you in?'],
        [1, { options: ['Je suis informaticien. Et vous ?', 'Je suis un informaticien de domaine.', 'J’ai informaticien.'] }],
        [0, 'Moi, je suis infirmière à l’hôpital Sainte-Justine.', 'I’m a nurse at Sainte-Justine hospital.'],
      ]),
      say('Je suis étudiante, je suis colombienne et je suis à Montréal depuis un mois.', 'I’m a student, I’m Colombian and I’ve been in Montréal for a month.'),
    ],
    [
      b('Être: je suis, tu es, il est, nous sommes, vous êtes, ils sont.', 'Être : je suis, tu es, il est, nous sommes, vous êtes, ils sont.'),
      b('No article before a job or a nationality: Je suis avocat.', 'Pas d’article devant un métier ou une nationalité : Je suis avocat.'),
      b('Être + adjective agrees: il est content, elle est contente.', 'Être + adjectif s’accorde : il est content, elle est contente.'),
    ],
    [['un nouvel arrivant', b('a newcomer', 'une personne qui vient d’arriver')], ['le domaine', b('the field (of work)', 'le secteur')], ['infirmier, infirmière', b('nurse', 'personne qui soigne')]],
  ),
  lesson(C, 2, ['the-verb-avoir', 'le-verbe-avoir'],
    b('The verb avoir: having, age and feelings', 'Le verbe avoir : posséder, l’âge et les sensations'),
    b('Conjugate avoir and use it where English says “to be”: age, hunger, cold, fear.', 'Conjuguer avoir et l’employer là où l’anglais dit « to be » : l’âge, la faim, le froid, la peur.'),
    [b('Conjugate avoir', 'Conjuguer avoir'), b('Give your age with avoir', 'Dire son âge avec avoir'), b('Use avoir faim, soif, chaud, froid, peur, raison', 'Employer avoir faim, soif, chaud, froid, peur, raison')],
    13,
    [
      card(b('Avoir in the present', 'Avoir au présent'), b('**J’ai, tu as, il / elle / on a, nous avons, vous avez, ils / elles ont**. Before a vowel, **je** becomes **j’**. Careful: **ils ont** [ɔ̃] (have) is not **ils sont** [sɔ̃] (are).', '**J’ai, tu as, il / elle / on a, nous avons, vous avez, ils / elles ont**. Devant une voyelle, **je** devient **j’**. Attention : **ils ont** [ɔ̃] (avoir) n’est pas **ils sont** [sɔ̃] (être).'), {
        ex: [['J’ai deux enfants.', 'I have two children.'], ['Vous avez une minute ?', 'Do you have a minute?'], ['Ils ont une grande maison.', 'They have a big house.'], ['Ils sont à la maison.', 'They are at home.']],
      }),
      tip(b('Where English uses “to be”', 'Là où l’anglais dit « to be »'), b('Age and physical sensations take **avoir**: **avoir 30 ans**, **avoir faim / soif**, **avoir chaud / froid**, **avoir peur**, **avoir sommeil**, **avoir raison / tort**, **avoir besoin de**.', 'L’âge et les sensations se disent avec **avoir** : **avoir 30 ans**, **avoir faim / soif**, **avoir chaud / froid**, **avoir peur**, **avoir sommeil**, **avoir raison / tort**, **avoir besoin de**.'), {
        ex: [['J’ai trente-deux ans.', 'I am thirty-two.'], ['Tu as froid ? Prends mon écharpe.', 'Are you cold? Take my scarf.'], ['Vous avez raison.', 'You are right.']],
      }),
      conj('avoir', b('present', 'présent'), [['j’', 'ai'], ['tu', 'as'], ['il / elle', 'a'], ['nous', 'avons'], ['vous', 'avez'], ['ils / elles', 'ont']], { given: [0] }),
      mc(P.best, ['J’ai vingt-cinq ans.', 'Je suis vingt-cinq ans.', 'J’ai vingt-cinq années.', 'Je suis vingt-cinq.'], { explain: b('Age: avoir + number + ans.', 'L’âge : avoir + nombre + ans.') }),
      mc(P.word, ['faim', 'affamé', 'la faim', 'faimé'], { fr: 'Il est midi, j’ai ___ !' }),
      sort(b('Être or avoir?', 'Être ou avoir ?'), [b('with être', 'avec être'), b('with avoir', 'avec avoir')], [['… fatigué', 0], ['… 40 ans', 1], ['… en retard', 0], ['… soif', 1], ['… peur du noir', 1], ['… content', 0]]),
      gap(P.complete, 'Nous ___ faim et les enfants ___ sommeil.', ['avons', 'ont']),
      pairs(P.match, [['avoir chaud', b('to be hot', 'ressentir la chaleur')], ['avoir tort', b('to be wrong', 'se tromper')], ['avoir besoin de', b('to need', 'nécessiter')], ['avoir sommeil', b('to be sleepy', 'vouloir dormir')]]),
      dict('Ma fille a six ans et elle a peur des chiens.', { voice: 'f' }),
    ],
    [
      b('Avoir: j’ai, tu as, il a, nous avons, vous avez, ils ont.', 'Avoir : j’ai, tu as, il a, nous avons, vous avez, ils ont.'),
      b('Age: J’ai 30 ans (never « je suis 30 »).', 'L’âge : J’ai 30 ans (jamais « je suis 30 »).'),
      b('Sensations: avoir faim, soif, chaud, froid, peur, sommeil, raison, tort.', 'Sensations : avoir faim, soif, chaud, froid, peur, sommeil, raison, tort.'),
      b('ils ont [ɔ̃] ≠ ils sont [sɔ̃].', 'ils ont [ɔ̃] ≠ ils sont [sɔ̃].'),
    ],
    [['avoir besoin de', b('to need', 'nécessiter')], ['avoir raison', b('to be right', 'dire vrai')], ['une écharpe', b('a scarf', 'un foulard chaud')]],
  ),
  lesson(C, 3, ['cest-or-il-est', 'cest-ou-il-est'],
    b('C’est or il est? Describing people and things', 'C’est ou il est ? Décrire les gens et les choses'),
    b('Choose between c’est and il / elle est, and describe a person with être and avoir.', 'Choisir entre c’est et il / elle est, et décrire une personne avec être et avoir.'),
    [b('Use c’est + noun with a determiner', 'Employer c’est + nom avec déterminant'), b('Use il / elle est + adjective or job', 'Employer il / elle est + adjectif ou métier'), b('Describe someone with être and avoir', 'Décrire quelqu’un avec être et avoir')],
    13,
    [
      card(b('The rule', 'La règle'), b('**C’est** + a determiner + noun: **C’est mon frère. C’est un bon médecin.** **Il / elle est** + an adjective or a bare job: **Il est grand. Elle est médecin.** To react to a situation: **C’est super !**', '**C’est** + déterminant + nom : **C’est mon frère. C’est un bon médecin.** **Il / elle est** + adjectif ou métier sans article : **Il est grand. Elle est médecin.** Pour réagir à une situation : **C’est super !**'), {
        ex: [['C’est ma collègue, Amina. Elle est très sympa.', 'This is my colleague, Amina. She is very nice.'], ['C’est un excellent restaurant.', 'It’s an excellent restaurant.'], ['Il est architecte.', 'He is an architect.']],
        table: { head: [b('C’est…', 'C’est…'), b('Il / elle est…', 'Il / elle est…')], rows: [['un / une / mon / le + nom', b('adjective', 'adjectif')], ['un bon avocat', 'avocat'], [b('a name: C’est Paul.', 'un nom : C’est Paul.'), b('a nationality: Il est suisse.', 'une nationalité : Il est suisse.')]] },
      }),
      trap(b('The classic mistake', 'L’erreur classique'), b('« Il est un ami » is wrong in normal French: say **C’est un ami**. But **Il est ami avec Marc** (friends with) is fine.', '« Il est un ami » est fautif en français courant : dites **C’est un ami**. Mais **Il est ami avec Marc** est correct.')),
      mc(P.best, ['C’est mon voisin.', 'Il est mon voisin.', 'Il est voisin mon.', 'C’est voisin.']),
      mc(P.best, ['Elle est pharmacienne.', 'C’est pharmacienne.', 'Elle est une pharmacienne.', 'C’est elle pharmacienne.']),
      mc(P.best, ['C’est une ville magnifique.', 'Elle est une ville magnifique.', 'Il est une ville magnifique.', 'C’est ville magnifique.']),
      gap(P.complete, 'Voici Lucas. ___ mon cousin. ___ très drôle et il ___ trois enfants.', [['C’est', 'c’est'], ['Il est', 'il est'], 'a'], { choices: [['C’est', 'Il est'], ['C’est', 'Il est'], ['a', 'est']] }),
      ord(P.order, 'C’est une femme très patiente.', { tr: 'She is a very patient woman.' }),
      dlg(b('Showing a photo', 'Montrer une photo'), undefined, [['Paul', 'm'], ['Vous', 'f']], [
        [0, 'C’est qui, sur la photo ?', 'Who is that in the photo?'],
        [1, { options: ['C’est ma sœur. Elle est avocate à Ottawa.', 'Elle est ma sœur. C’est avocate.', 'Il est ma sœur avocate.'] }],
        [0, 'Elle a l’air sympa ! Elle a quel âge ?', 'She looks nice! How old is she?'],
        [1, { options: ['Elle a vingt-huit ans.', 'Elle est vingt-huit ans.', 'C’est vingt-huit ans.'] }],
      ]),
      say('C’est mon meilleur ami. Il est grand, il a les yeux verts et il est très drôle.', 'This is my best friend. He is tall, he has green eyes and he is very funny.'),
    ],
    [
      b('C’est + determiner + noun (C’est un ami, c’est ma sœur).', 'C’est + déterminant + nom (C’est un ami, c’est ma sœur).'),
      b('Il / elle est + adjective or bare job (Il est grand, elle est médecin).', 'Il / elle est + adjectif ou métier sans article (Il est grand, elle est médecin).'),
      b('Describe: être + adjective, avoir + physical features (avoir les yeux bleus).', 'Décrire : être + adjectif, avoir + traits physiques (avoir les yeux bleus).'),
    ],
    [['avoir l’air', b('to look, to seem', 'sembler')], ['drôle', b('funny', 'amusant')], ['un voisin, une voisine', b('a neighbour', 'personne qui habite à côté')]],
  ),
];
