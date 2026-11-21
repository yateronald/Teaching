import type { CourseAbout } from '../../types';
import { b, card, dict, gap, lesson, mc, P, sort, trap, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'J’ai acheté des fleurs, but les fleurs que j’ai achetées. The agreement of the past participle with avoir is the most famous rule of French spelling, and the one that most often appears in exams. This course teaches it step by step: no agreement with the subject, agreement with the direct object only when it comes before the verb (que, la, les, l’, combien de, quel), and a reliable method to find that object every time.',
    'J’ai acheté des fleurs, mais les fleurs que j’ai achetées. L’accord du participe passé avec avoir est la règle la plus célèbre de l’orthographe française, et celle qui apparaît le plus souvent aux examens. Ce cours l’enseigne pas à pas : pas d’accord avec le sujet, accord avec le complément d’objet direct seulement s’il est placé avant le verbe (que, la, les, l’, combien de, quel), et une méthode fiable pour trouver ce complément à chaque fois.',
  ),
  outcomes: [
    b('Never agree with the subject after avoir', 'Ne jamais accorder avec le sujet après avoir'),
    b('Find the direct object (COD)', 'Trouver le complément d’objet direct (COD)'),
    b('Agree when the COD comes before', 'Accorder quand le COD est placé avant'),
    b('Handle que, la, les, l’ and quel', 'Gérer que, la, les, l’ et quel'),
  ],
};

const C = 'sp-pp-avoir';
export default [
  lesson(C, 1, ['the-basic-rule', 'la-regle-de-base'],
    b('The basic rule', 'La règle de base'),
    b('With avoir, no agreement with the subject; agreement with the COD placed before.', 'Avec avoir, pas d’accord avec le sujet ; accord avec le COD placé avant.'),
    [b('Never agree with the subject', 'Ne jamais accorder avec le sujet'), b('Find the COD with « quoi ? »', 'Trouver le COD avec « quoi ? »'), b('Check its position', 'Vérifier sa position')],
    13,
    [
      card(b('The rule in three steps', 'La règle en trois étapes'), b('1. With **avoir**, the participle **never** agrees with the **subject**: **Elles ont mangé.** 2. Find the **COD**: ask **« avoir mangé quoi ? »**. 3. If the COD is **after** the verb → **no agreement**: **Elle a mangé les pommes.** If it is **before** → agreement: **Les pommes qu’elle a mangées.** · **Ces pommes, elle les a mangées.**', '1. Avec **avoir**, le participe ne s’accorde **jamais** avec le **sujet** : **Elles ont mangé.** 2. Cherchez le **COD** : demandez **« a mangé quoi ? »**. 3. Si le COD est **après** le verbe → **pas d’accord** : **Elle a mangé les pommes.** S’il est **avant** → accord : **Les pommes qu’elle a mangées.** · **Ces pommes, elle les a mangées.**'), {
        table: { head: [b('COD position', 'place du COD'), b('example', 'exemple'), b('agreement', 'accord')], rows: [[b('no COD', 'pas de COD'), 'Elles ont dormi.', b('no', 'non')], [b('after', 'après'), 'Il a lu ces lettres.', b('no', 'non')], [b('before', 'avant'), 'Les lettres qu’il a lues.', b('yes: -es', 'oui : -es')]] },
      }),
      mc(P.form, ['Mes amies ont beaucoup voyagé.', 'Mes amies ont beaucoup voyagées.', 'Mes amies ont beaucoup voyagés.', 'Mes amies ont beaucoup voyager.']),
      mc(P.form, ['Voici la robe que j’ai achetée.', 'Voici la robe que j’ai acheté.', 'Voici la robe que j’ai achetées.', 'Voici la robe que j’ai acheter.']),
      sort(b('Agreement or not?', 'Accord ou pas ?'), [b('agreement', 'accord'), b('no agreement', 'pas d’accord')], [['les photos que tu as prises', 0], ['tu as pris les photos', 1], ['cette lettre, je l’ai écrite', 0], ['j’ai écrit cette lettre', 1], ['les films qu’ils ont vus', 0], ['elles ont ri', 1]]),
      gap(P.complete, 'Elle a lu ___ livres. Les livres qu’elle a ___ étaient passionnants.', ['les', 'lus'], { strict: true }),
      dict('Les lettres que ma grand-mère a écrites sont dans la boîte qu’elle m’a donnée.', { strict: true, hint: b('Two agreements: écrites (lettres), donnée (boîte).', 'Deux accords : écrites (lettres), donnée (boîte).') }),
    ],
    [
      b('avoir: never agree with the subject.', 'avoir : jamais d’accord avec le sujet.'),
      b('Agree with the COD only if it comes before the verb.', 'Accord avec le COD seulement s’il est placé avant le verbe.'),
      b('COD before = que, la, les, l’, or a fronted noun.', 'COD avant = que, la, les, l’, ou un nom placé avant.'),
    ],
    [['un COD', b('a direct object', 'complément d’objet direct')], ['passionnant', b('fascinating', 'très intéressant')], ['une boîte', b('a box', 'contenant')]],
  ),
  lesson(C, 2, ['pronouns-la-les', 'les-pronoms-la-les-l'],
    b('With la, les, l’', 'Avec la, les, l’'),
    b('Agree with the object pronoun placed before avoir.', 'Accorder avec le pronom complément placé avant avoir.'),
    [b('Find what the pronoun replaces', 'Trouver ce que remplace le pronom'), b('Agree in gender and number', 'Accorder en genre et en nombre'), b('Handle l’ (masculine or feminine?)', 'Gérer l’ (masculin ou féminin ?)')],
    13,
    [
      card(b('Pronoun before the verb', 'Le pronom avant le verbe'), b('**la, les, l’, me, te, nous, vous** before **avoir** are CODs placed before: the participle agrees with **what they represent**. **Tes clés ? Je les ai trouvées.** · **Ta sœur ? Je l’ai vue hier.** (l’ = ta sœur → feminine) · **Ton frère ? Je l’ai vu.** · **Marie, je t’ai attendue !**', '**la, les, l’, me, te, nous, vous** devant **avoir** sont des COD placés avant : le participe s’accorde avec **ce qu’ils représentent**. **Tes clés ? Je les ai trouvées.** · **Ta sœur ? Je l’ai vue hier.** (l’ = ta sœur → féminin) · **Ton frère ? Je l’ai vu.** · **Marie, je t’ai attendue !**')),
      trap(b('« en » blocks agreement', '« en » bloque l’accord'), b('With **en**, the participle usually stays invariable: **Des pommes ? J’en ai mangé trois.** (not « mangées »).', 'Avec **en**, le participe reste en général invariable : **Des pommes ? J’en ai mangé trois.** (pas « mangées »).')),
      mc(P.form, ['Ta voiture ? Je l’ai garée devant la maison.', 'Ta voiture ? Je l’ai garé devant la maison.', 'Ta voiture ? Je l’ai garés devant la maison.', 'Ta voiture ? Je l’ai garer devant la maison.']),
      mc(P.form, ['Des cerises ? J’en ai acheté deux kilos.', 'Des cerises ? J’en ai achetées deux kilos.', 'Des cerises ? J’en ai achetés deux kilos.', 'Des cerises ? J’en ai achetée deux kilos.']),
      gap(P.complete, 'Tes chaussures ? Je les ai ___ (ranger) dans le placard. Et ta veste, je l’ai ___ (laver).', ['rangées', 'lavée'], { strict: true }),
      sort(b('Which ending?', 'Quelle terminaison ?'), [b('-é', '-é'), b('-ée', '-ée'), b('-és / -ées', '-és / -ées')], [['Paul ? Je l’ai appel…', 0], ['Julie ? Je l’ai appel…', 1], ['Tes parents ? Je les ai appel…', 2], ['Le gâteau ? Je l’ai mang…', 0], ['La tarte ? Je l’ai mang…', 1], ['Les crêpes ? Je les ai mang…', 2]]),
      dict('Tes lunettes ? Je les ai cherchées partout, puis je les ai trouvées sur la table.', { strict: true }),
    ],
    [
      b('la, les, l’, me, te, nous, vous + avoir → agree with what they replace.', 'la, les, l’, me, te, nous, vous + avoir → accord avec ce qu’ils remplacent.'),
      b('l’ can be masculine or feminine: check the noun.', 'l’ peut être masculin ou féminin : vérifiez le nom.'),
      b('With en: no agreement (j’en ai mangé).', 'Avec en : pas d’accord (j’en ai mangé).'),
    ],
    [['ranger', b('to put away', 'mettre en ordre')], ['garer', b('to park', 'stationner')], ['un placard', b('a cupboard', 'armoire murale')]],
  ),
  lesson(C, 3, ['que-and-quel', 'avec-que-et-quel'],
    b('With que and quel', 'Avec que et quel'),
    b('Find the antecedent of que and apply the rule in questions with quel.', 'Trouver l’antécédent de que et appliquer la règle dans les questions avec quel.'),
    [b('Find the antecedent of que', 'Trouver l’antécédent de que'), b('Agree after quel / quelle', 'Accorder après quel / quelle'), b('Agree after combien de', 'Accorder après combien de')],
    13,
    [
      card(b('que, quel, combien de', 'que, quel, combien de'), b('**que** stands for the noun before it (antecedent): **les chansons que j’ai écoutées** (que = les chansons). In questions, **quel(s)/quelle(s) + noun** placed before: **Quelles villes as-tu visitées ?** **Combien de photos as-tu prises ?** (agreement accepted and recommended).', '**que** remplace le nom qui le précède (antécédent) : **les chansons que j’ai écoutées** (que = les chansons). Dans les questions, **quel(s)/quelle(s) + nom** placé avant : **Quelles villes as-tu visitées ?** **Combien de photos as-tu prises ?** (accord admis et recommandé).')),
      mc(P.form, ['Quelles villes avez-vous visitées cet été ?', 'Quelles villes avez-vous visité cet été ?', 'Quelles villes avez-vous visités cet été ?', 'Quelles villes avez-vous visitée cet été ?']),
      mc(P.form, ['Les efforts qu’il a faits ont payé.', 'Les efforts qu’il a fait ont payés.', 'Les efforts qu’il a faites ont payé.', 'Les efforts qu’il a fait ont payé.']),
      gap(P.complete, 'La maison que nous avons ___ (louer) était belle, et les voisins que nous avons ___ (rencontrer) très gentils.', ['louée', 'rencontrés'], { strict: true }),
      sort(b('What does que replace?', 'Que remplace quoi ?'), [b('feminine plural → -ées', 'féminin pluriel → -ées'), b('masculine plural → -és', 'masculin pluriel → -és')], [['les fleurs que j’ai cueill…', 0], ['les livres que j’ai achet…', 1], ['les lettres que tu as envoy…', 0], ['les gâteaux qu’elle a prépar…', 1]]),
      dict('Quelles chansons as-tu écoutées ? Celles que tu m’as conseillées hier.', { strict: true }),
      write(b('Write about your holiday.', 'Racontez vos vacances.'), b('Write 4–6 sentences (40–70 words) about a trip, using at least three relative clauses with que + passé composé (les villes que j’ai visitées…).', 'Écrivez 4 à 6 phrases (40–70 mots) sur un voyage, avec au moins trois relatives en que + passé composé (les villes que j’ai visitées…).'), 40, 70, [
        b('At least three « que + avoir + participle »', 'Au moins trois « que + avoir + participe »'),
        b('Correct agreement each time', 'Accord correct à chaque fois'),
      ], 'L’été dernier, je suis parti en Bretagne. Les villes que j’ai visitées étaient magnifiques, surtout Saint-Malo. Les crêpes que nous avons mangées étaient délicieuses, et les gens que nous avons rencontrés nous ont donné de bonnes adresses. Les photos que j’ai prises sont maintenant dans un album.'),
    ],
    [
      b('que = the noun before it: agree with that noun.', 'que = le nom qui le précède : accord avec ce nom.'),
      b('Quelles villes as-tu visitées ? Combien de photos as-tu prises ?', 'Quelles villes as-tu visitées ? Combien de photos as-tu prises ?'),
      b('Always ask: COD? before or after?', 'Demandez-vous toujours : COD ? avant ou après ?'),
    ],
    [['cueillir', b('to pick (flowers)', 'ramasser des fleurs')], ['conseiller', b('to recommend', 'recommander')], ['un antécédent', b('an antecedent', 'mot remplacé par le pronom')]],
  ),
];
