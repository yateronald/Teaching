import type { CourseAbout } from '../../types';
import { b, card, conj, dict, dlg, gap, hear, lesson, mc, ord, P, pairs, say, sort, tip, trap, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Je parle, nous finissons, ils prennent. The present is the first tense you need and the one you use most. This course goes through every verb family, one lesson at a time: the -er verbs and their spelling changes, the -ir verbs like finir and partir, the -re and -oir verbs, the irregular verbs you hear all day, then the pronominal verbs with negation and questions. Each lesson ends with sentences you can use right away.',
    'Je parle, nous finissons, ils prennent. Le présent est le premier temps dont vous avez besoin et celui que vous utilisez le plus. Ce cours passe en revue toutes les familles de verbes, une leçon à la fois : les verbes en -er et leurs particularités d’orthographe, les verbes en -ir comme finir et partir, les verbes en -re et en -oir, les irréguliers que l’on entend toute la journée, puis les verbes pronominaux avec la négation et les questions. Chaque leçon se termine par des phrases utilisables tout de suite.',
  ),
  outcomes: [
    b('Conjugate any -er verb, spelling changes included', 'Conjuguer tout verbe en -er, particularités comprises'),
    b('Tell the -ir, -re and -oir families apart', 'Distinguer les familles en -ir, -re et -oir'),
    b('Use être, avoir, aller, faire and the key irregulars', 'Employer être, avoir, aller, faire et les irréguliers clés'),
    b('Describe a routine with pronominal verbs', 'Décrire une routine avec les verbes pronominaux'),
  ],
};

const C = 'cj-present';
const PRESENT = b('présent', 'présent');

export default [
  lesson(C, 1, ['er-verbs', 'verbes-en-er'],
    b('The -er verbs: one stem, six endings', 'Les verbes en -er : un radical, six terminaisons'),
    b('Nine French verbs out of ten end in -er, and they all follow the same model.', 'Neuf verbes français sur dix se terminent en -er, et ils suivent tous le même modèle.'),
    [b('Find the stem of an -er verb', 'Trouver le radical d’un verbe en -er'), b('Add the six endings', 'Ajouter les six terminaisons'), b('Hear which forms sound the same', 'Entendre les formes qui se prononcent pareil')],
    13,
    [
      card(b('Stem + ending', 'Radical + terminaison'), b('Remove **-er** from the infinitive to find the stem: **parler → parl-**. Then add the ending of each person. Endings: **-e, -es, -e, -ons, -ez, -ent**. Good news for your ear: **parle, parles, parlent** all sound the same.', 'Enlevez **-er** à l’infinitif pour trouver le radical : **parler → parl-**. Ajoutez ensuite la terminaison de chaque personne. Terminaisons : **-e, -es, -e, -ons, -ez, -ent**. Bonne nouvelle pour l’oreille : **parle, parles, parlent** se prononcent de la même façon.'), {
        table: {
          head: ['', 'parler', 'aimer', 'habiter'],
          rows: [['je / j’', 'parle', 'aime', 'habite'], ['tu', 'parles', 'aimes', 'habites'], ['il / elle / on', 'parle', 'aime', 'habite'], ['nous', 'parlons', 'aimons', 'habitons'], ['vous', 'parlez', 'aimez', 'habitez'], ['ils / elles', 'parlent', 'aiment', 'habitent']],
        },
        ex: [['Je parle français et un peu d’espagnol.', 'I speak French and a little Spanish.'], ['Nous habitons à Montréal depuis deux ans.', 'We have lived in Montreal for two years.']],
      }),
      tip(b('Je or j’?', 'Je ou j’ ?'), b('**Je** becomes **j’** before a vowel or a silent h: **j’aime, j’habite, j’écoute**. With **ils** and **elles**, a vowel creates a liaison you can hear: **ils‿aiment**, **elles‿habitent**.', '**Je** devient **j’** devant une voyelle ou un h muet : **j’aime, j’habite, j’écoute**. Avec **ils** et **elles**, une voyelle crée une liaison audible : **ils‿aiment**, **elles‿habitent**.')),
      conj('parler', PRESENT, [['je', 'parle'], ['tu', 'parles'], ['il / elle', 'parle'], ['nous', 'parlons'], ['vous', 'parlez'], ['ils / elles', 'parlent']], { given: [0] }),
      conj('écouter', PRESENT, [['j’', 'écoute'], ['tu', 'écoutes'], ['il / elle', 'écoute'], ['nous', 'écoutons'], ['vous', 'écoutez'], ['ils / elles', 'écoutent']], { given: [0, 3] }),
      mc(P.form, ['regardons', 'regardez', 'regardent', 'regarde'], { fr: 'Le soir, nous ___ un film ensemble.' }),
      mc(P.form, ['aimez', 'aimes', 'aimons', 'aiment'], { fr: 'Vous ___ le café sans sucre ?' }),
      gap(P.complete, 'Tu ___ (chercher) un appartement ? Mes amis ___ (louer) un studio près du centre.', [['cherches'], ['louent']]),
      sort(b('Who is it? Sort by person.', 'Qui est-ce ? Classez par personne.'), ['tu', 'nous', 'vous'], [['chantes', 0], ['dansons', 1], ['jouez', 2], ['restes', 0], ['arrivons', 1], ['pensez', 2]]),
      hear('Ils aiment le jazz.', b('One person or several?', 'Une personne ou plusieurs ?'), [b('Several: you hear the liaison « ils‿aiment »', 'Plusieurs : on entend la liaison « ils‿aiment »'), b('Only one person', 'Une seule personne'), b('You cannot tell', 'On ne peut pas savoir')]),
      dict('Nous habitons près de la gare et nous travaillons au centre-ville.'),
      say('J’aime marcher le matin avant le travail.', 'I like walking in the morning before work.'),
    ],
    [
      b('Stem = infinitive minus -er; endings -e, -es, -e, -ons, -ez, -ent.', 'Radical = infinitif sans -er ; terminaisons -e, -es, -e, -ons, -ez, -ent.'),
      b('Je, tu, il and ils sound the same: only nous and vous change the sound.', 'Je, tu, il et ils se prononcent pareil : seuls nous et vous changent le son.'),
      b('Je becomes j’ before a vowel or a silent h.', 'Je devient j’ devant une voyelle ou un h muet.'),
    ],
    [['habiter', b('to live (somewhere)', 'vivre (quelque part)')], ['louer', b('to rent', 'prendre en location')], ['chercher', b('to look for', 'essayer de trouver')]],
  ),

  lesson(C, 2, ['er-verbs-spelling-changes', 'verbes-en-er-particularites'],
    b('-er verbs that change their spelling', 'Les verbes en -er qui changent d’orthographe'),
    b('Manger, commencer, acheter, appeler, payer: same endings, small changes in the stem.', 'Manger, commencer, acheter, appeler, payer : les mêmes terminaisons, de petits changements dans le radical.'),
    [b('Keep the sound with -ger and -cer', 'Garder le son avec -ger et -cer'), b('Add an accent or double the consonant', 'Ajouter un accent ou doubler la consonne'), b('Change y into i', 'Changer y en i')],
    13,
    [
      card(b('Keep the sound: -ger and -cer', 'Garder le son : -ger et -cer'), b('Only the **nous** form is affected. To keep the soft sound before **-ons**, **-ger** verbs keep an e and **-cer** verbs take a cedilla. With nous: **nous mangeons, nous voyageons, nous commençons, nous avançons**.', 'Seule la forme **nous** est concernée. Pour garder le son doux devant **-ons**, les verbes en **-ger** gardent un e et les verbes en **-cer** prennent une cédille. Avec nous : **nous mangeons, nous voyageons, nous commençons, nous avançons**.'), {
        ex: [['Nous commençons à huit heures.', 'We start at eight o’clock.'], ['Nous mangeons souvent au restaurant le vendredi.', 'We often eat out on Fridays.']],
      }),
      card(b('An accent or a double consonant', 'Un accent ou une consonne double'), b('When the ending is silent (je, tu, il, ils), some verbs change their stem. Accent: **j’achète, je préfère, je me lève**. Double consonant: **j’appelle, je jette**. With **nous** and **vous**, the stem goes back to the infinitive: **nous achetons, nous appelons**.', 'Quand la terminaison est muette (je, tu, il, ils), certains verbes changent de radical. Accent : **j’achète, je préfère, je me lève**. Consonne double : **j’appelle, je jette**. Avec **nous** et **vous**, le radical redevient celui de l’infinitif : **nous achetons, nous appelons**.'), {
        table: {
          head: ['', 'acheter', 'préférer', 'appeler'],
          rows: [['je / j’', 'achète', 'préfère', 'appelle'], ['tu', 'achètes', 'préfères', 'appelles'], ['il / elle', 'achète', 'préfère', 'appelle'], ['nous', 'achetons', 'préférons', 'appelons'], ['vous', 'achetez', 'préférez', 'appelez'], ['ils / elles', 'achètent', 'préfèrent', 'appellent']],
        },
      }),
      tip(b('-yer verbs: y becomes i', 'Les verbes en -yer : y devient i'), b('Before a silent ending, **y** becomes **i**: **j’envoie, tu nettoies, ils essaient**, but **nous envoyons**. With **payer** and **essayer**, both spellings are correct: **je paie** or **je paye**.', 'Devant une terminaison muette, **y** devient **i** : **j’envoie, tu nettoies, ils essaient**, mais **nous envoyons**. Avec **payer** et **essayer**, les deux orthographes sont correctes : **je paie** ou **je paye**.')),
      conj('acheter', PRESENT, [['j’', 'achète'], ['tu', 'achètes'], ['il / elle', 'achète'], ['nous', 'achetons'], ['vous', 'achetez'], ['ils / elles', 'achètent']], { given: [3] }),
      conj('appeler', PRESENT, [['j’', 'appelle'], ['tu', 'appelles'], ['il / elle', 'appelle'], ['nous', 'appelons'], ['vous', 'appelez'], ['ils / elles', 'appellent']], { given: [3] }),
      mc(P.spelling, ['nous mangeons', 'nous mangons', 'nous manjons', 'nous mangeont'], { fr: 'Le dimanche, ___ chez mes parents.' }),
      mc(P.spelling, ['préfère', 'préfére', 'prèfère', 'préferes'], { fr: 'Je ___ le thé au café.' }),
      gap(P.complete, 'Nous ___ (commencer) le cours à neuf heures. Tu ___ (envoyer) le message ? Ils ___ (jeter) le papier dans la poubelle bleue.', [['commençons'], ['envoies'], ['jettent']], { strict: true }),
      sort(b('Accent or double consonant?', 'Accent ou consonne double ?'), [b('accent: j’achète', 'accent : j’achète'), b('double letter: j’appelle', 'lettre double : j’appelle')], [['acheter', 0], ['jeter', 1], ['se lever', 0], ['appeler', 1], ['se promener', 0], ['épeler', 1]]),
      dict('Nous voyageons en train et nous achetons nos billets en ligne.', { strict: true, hint: b('Watch the e in voyageons.', 'Attention au e de voyageons.') }),
      say('J’achète du pain et je paie par carte.', 'I buy bread and pay by card.'),
    ],
    [
      b('-ger: nous mangeons; -cer: nous commençons.', '-ger : nous mangeons ; -cer : nous commençons.'),
      b('acheter, préférer, se lever take an accent; appeler, jeter double the consonant.', 'acheter, préférer, se lever prennent un accent ; appeler, jeter doublent la consonne.'),
      b('-yer: y becomes i before a silent ending (j’envoie, nous envoyons).', '-yer : y devient i devant une terminaison muette (j’envoie, nous envoyons).'),
    ],
    [['voyager', b('to travel', 'faire un voyage')], ['épeler', b('to spell (aloud)', 'dire les lettres d’un mot')], ['nettoyer', b('to clean', 'rendre propre')]],
  ),

  lesson(C, 3, ['ir-re-oir-verbs', 'verbes-en-ir-re-oir'],
    b('The -ir, -re and -oir verbs', 'Les verbes en -ir, -re et -oir'),
    b('Two kinds of -ir verbs, the attendre and prendre models, and the verbs pouvoir, vouloir, devoir.', 'Deux sortes de verbes en -ir, les modèles attendre et prendre, et les verbes pouvoir, vouloir, devoir.'),
    [b('Tell finir and partir apart', 'Distinguer finir et partir'), b('Conjugate attendre and prendre', 'Conjuguer attendre et prendre'), b('Use pouvoir, vouloir and devoir', 'Employer pouvoir, vouloir et devoir')],
    13,
    [
      card(b('Two kinds of -ir verbs', 'Deux sortes de verbes en -ir'), b('The **finir** model adds **-iss-** in the plural: **je finis, nous finissons, ils finissent**. Like finir: **choisir, réussir, grandir, réfléchir**. The **partir** model drops the last consonant of the stem in the singular: **je pars, il part, nous partons**. Like partir: **sortir, dormir, sentir, servir**.', 'Le modèle **finir** ajoute **-iss-** au pluriel : **je finis, nous finissons, ils finissent**. Comme finir : **choisir, réussir, grandir, réfléchir**. Le modèle **partir** perd la dernière consonne du radical au singulier : **je pars, il part, nous partons**. Comme partir : **sortir, dormir, sentir, servir**.'), {
        table: {
          head: ['', 'finir', 'partir', 'dormir'],
          rows: [['je', 'finis', 'pars', 'dors'], ['tu', 'finis', 'pars', 'dors'], ['il / elle', 'finit', 'part', 'dort'], ['nous', 'finissons', 'partons', 'dormons'], ['vous', 'finissez', 'partez', 'dormez'], ['ils / elles', 'finissent', 'partent', 'dorment']],
        },
      }),
      card(b('-re and -oir verbs', 'Les verbes en -re et en -oir'), b('The **attendre** model keeps its d and adds no ending with il: **j’attends, il attend, nous attendons**. Like attendre: **vendre, répondre, entendre, perdre**. **Prendre** loses its d in the plural and doubles the n with ils: **nous prenons, ils prennent**. The three modal verbs change their stem: **je peux, je veux, je dois** but **nous pouvons, nous voulons, nous devons**.', 'Le modèle **attendre** garde son d et n’ajoute rien avec il : **j’attends, il attend, nous attendons**. Comme attendre : **vendre, répondre, entendre, perdre**. **Prendre** perd son d au pluriel et double le n avec ils : **nous prenons, ils prennent**. Les trois verbes modaux changent de radical : **je peux, je veux, je dois** mais **nous pouvons, nous voulons, nous devons**.'), {
        table: {
          head: ['', 'attendre', 'prendre', 'pouvoir', 'vouloir'],
          rows: [['je / j’', 'attends', 'prends', 'peux', 'veux'], ['tu', 'attends', 'prends', 'peux', 'veux'], ['il / elle', 'attend', 'prend', 'peut', 'veut'], ['nous', 'attendons', 'prenons', 'pouvons', 'voulons'], ['vous', 'attendez', 'prenez', 'pouvez', 'voulez'], ['ils / elles', 'attendent', 'prennent', 'peuvent', 'veulent']],
        },
      }),
      conj('choisir', PRESENT, [['je', 'choisis'], ['tu', 'choisis'], ['il / elle', 'choisit'], ['nous', 'choisissons'], ['vous', 'choisissez'], ['ils / elles', 'choisissent']], { given: [0] }),
      conj('comprendre', PRESENT, [['je', 'comprends'], ['tu', 'comprends'], ['il / elle', 'comprend'], ['nous', 'comprenons'], ['vous', 'comprenez'], ['ils / elles', 'comprennent']], { given: [0] }),
      mc(P.form, ['finissons', 'finons', 'finisons', 'finissont'], { fr: 'Nous ___ toujours le travail avant dix-huit heures.' }),
      mc(P.form, ['sors', 'sort', 'sorts', 'sortes'], { fr: 'Ce soir, je ___ avec des amis.' }),
      mc(P.form, ['peuvent', 'pouvent', 'peuent', 'peuvont'], { fr: 'Les enfants ___ jouer dehors jusqu’à midi.' }),
      gap(P.complete, 'J’___ (attendre) le bus depuis dix minutes. Vous ___ (prendre) un café ? Ils ___ (vouloir) partir tôt.', [['attends'], ['prenez'], ['veulent']]),
      sort(b('Which model?', 'Quel modèle ?'), [b('like finir (-iss-)', 'comme finir (-iss-)'), b('like partir', 'comme partir')], [['choisir', 0], ['dormir', 1], ['réussir', 0], ['sortir', 1], ['grandir', 0], ['servir', 1]]),
      hear('Ils finissent à cinq heures.', b('One person or several?', 'Une personne ou plusieurs ?'), [b('Several: you hear « -issent »', 'Plusieurs : on entend « -issent »'), b('Only one person', 'Une seule personne'), b('You cannot tell', 'On ne peut pas savoir')]),
      dict('Nous prenons le métro, mais ils prennent toujours leur vélo.'),
      say('Je ne peux pas venir ce soir, je dois travailler.', 'I can’t come tonight, I have to work.'),
    ],
    [
      b('finir model: -is, -is, -it, -issons, -issez, -issent.', 'Modèle finir : -is, -is, -it, -issons, -issez, -issent.'),
      b('partir model: je pars, nous partons (no -iss-).', 'Modèle partir : je pars, nous partons (sans -iss-).'),
      b('prendre: nous prenons, ils prennent; pouvoir, vouloir, devoir change their stem.', 'prendre : nous prenons, ils prennent ; pouvoir, vouloir, devoir changent de radical.'),
    ],
    [['réfléchir', b('to think (it over)', 'penser avec attention')], ['grandir', b('to grow up', 'devenir plus grand')], ['servir', b('to serve', 'donner à manger ou à boire')]],
  ),

  lesson(C, 4, ['key-irregular-verbs', 'irreguliers-essentiels'],
    b('The irregular verbs you hear all day', 'Les irréguliers que l’on entend toute la journée'),
    b('Être, avoir, aller, faire, then venir, voir, savoir and dire.', 'Être, avoir, aller, faire, puis venir, voir, savoir et dire.'),
    [b('Know être, avoir, aller and faire by heart', 'Connaître être, avoir, aller et faire par cœur'), b('Conjugate venir, voir, savoir and dire', 'Conjuguer venir, voir, savoir et dire'), b('Avoid the classic mistakes with vous and ils', 'Éviter les erreurs classiques avec vous et ils')],
    13,
    [
      card(b('The four pillars', 'Les quatre piliers'), b('**Être, avoir, aller** and **faire** follow no model, and you use them in almost every sentence. Learn them as a song, person by person. Watch the plural: **nous sommes, vous êtes, ils sont**, **ils ont, ils vont, ils font**.', '**Être, avoir, aller** et **faire** ne suivent aucun modèle, et on les emploie dans presque chaque phrase. Apprenez-les comme une chanson, personne par personne. Attention au pluriel : **nous sommes, vous êtes, ils sont**, **ils ont, ils vont, ils font**.'), {
        table: {
          head: ['', 'être', 'avoir', 'aller', 'faire'],
          rows: [['je / j’', 'suis', 'ai', 'vais', 'fais'], ['tu', 'es', 'as', 'vas', 'fais'], ['il / elle / on', 'est', 'a', 'va', 'fait'], ['nous', 'sommes', 'avons', 'allons', 'faisons'], ['vous', 'êtes', 'avez', 'allez', 'faites'], ['ils / elles', 'sont', 'ont', 'vont', 'font']],
        },
      }),
      card(b('Venir, voir, savoir, dire', 'Venir, voir, savoir, dire'), b('Four more verbs to know by heart. The verbs built on venir follow it: **devenir, revenir, se souvenir**, and so do **tenir** and **obtenir**: **je viens, je reviens, je tiens**.', 'Quatre autres verbes à connaître par cœur. Les verbes construits sur venir le suivent : **devenir, revenir, se souvenir**, ainsi que **tenir** et **obtenir** : **je viens, je reviens, je tiens**.'), {
        table: {
          head: ['', 'venir', 'voir', 'savoir', 'dire'],
          rows: [['je', 'viens', 'vois', 'sais', 'dis'], ['tu', 'viens', 'vois', 'sais', 'dis'], ['il / elle', 'vient', 'voit', 'sait', 'dit'], ['nous', 'venons', 'voyons', 'savons', 'disons'], ['vous', 'venez', 'voyez', 'savez', 'dites'], ['ils / elles', 'viennent', 'voient', 'savent', 'disent']],
        },
      }),
      trap(b('Three classic mistakes', 'Trois erreurs classiques'), b('Say **vous faites** and **vous dites**, never « vous faisez » or « vous disez ». Say **ils font**, never « ils faisent ». And with avoir, **ils ont** has a liaison [z]: **ils‿ont**, while **ils sont** has an [s].', 'On dit **vous faites** et **vous dites**, jamais « vous faisez » ni « vous disez ». On dit **ils font**, jamais « ils faisent ». Et avec avoir, **ils ont** a une liaison [z] : **ils‿ont**, alors que **ils sont** a un [s].')),
      conj('être', PRESENT, [['je', 'suis'], ['tu', 'es'], ['il / elle', 'est'], ['nous', 'sommes'], ['vous', 'êtes'], ['ils / elles', 'sont']], { given: [0] }),
      conj('faire', PRESENT, [['je', 'fais'], ['tu', 'fais'], ['il / elle', 'fait'], ['nous', 'faisons'], ['vous', 'faites'], ['ils / elles', 'font']], { given: [0] }),
      mc(P.form, ['font', 'faisent', 'fasent', 'faitent'], { fr: 'Le week-end, mes voisins ___ du vélo.' }),
      mc(P.form, ['dites', 'disez', 'dizez', 'disiez'], { fr: 'Comment ___-vous « thank you » en français ?' }),
      mc(P.form, ['vont', 'allent', 'vas', 'allont'], { fr: 'Mes parents ___ en vacances en Bretagne.' }),
      gap(P.complete, 'Je ___ (savoir) nager, mais j’___ (avoir) peur de l’eau froide. Nous ___ (venir) de Lyon.', [['sais'], ['ai'], ['venons']]),
      pairs(b('Match each form with its infinitive.', 'Associez chaque forme à son infinitif.'), [['ils sont', 'être'], ['ils ont', 'avoir'], ['ils font', 'faire'], ['ils vont', 'aller'], ['ils voient', 'voir'], ['ils viennent', 'venir']], true),
      hear('Ils ont deux enfants.', b('Which verb do you hear?', 'Quel verbe entendez-vous ?'), ['avoir', 'être', 'aller', 'faire']),
      dict('Ils font les courses le samedi et ils vont au marché à pied.'),
      say('Vous savez où est la gare ? Je ne sais pas, je ne suis pas d’ici.', 'Do you know where the station is? I don’t know, I’m not from here.'),
    ],
    [
      b('être: suis, es, est, sommes, êtes, sont; avoir: ai, as, a, avons, avez, ont.', 'être : suis, es, est, sommes, êtes, sont ; avoir : ai, as, a, avons, avez, ont.'),
      b('aller: vais, vas, va, allons, allez, vont; faire: fais, fais, fait, faisons, faites, font.', 'aller : vais, vas, va, allons, allez, vont ; faire : fais, fais, fait, faisons, faites, font.'),
      b('vous faites, vous dites, vous êtes: the only vous forms without -ez.', 'vous faites, vous dites, vous êtes : les seules formes en vous sans -ez.'),
    ],
    [['avoir peur de', b('to be afraid of', 'craindre')], ['faire les courses', b('to do the shopping', 'acheter à manger')], ['d’ici', b('from here, local', 'de cet endroit')]],
  ),

  lesson(C, 5, ['pronominal-verbs-and-review', 'verbes-pronominaux-et-bilan'],
    b('Pronominal verbs, negation and questions', 'Verbes pronominaux, négation et questions'),
    b('Je me lève, je ne me lève pas, est-ce que tu te lèves ? Then a full routine with every family.', 'Je me lève, je ne me lève pas, est-ce que tu te lèves ? Puis toute une routine avec chaque famille.'),
    [b('Conjugate pronominal verbs', 'Conjuguer les verbes pronominaux'), b('Make the present negative', 'Mettre le présent à la forme négative'), b('Ask questions three ways', 'Poser une question de trois façons')],
    13,
    [
      card(b('Verbs with me, te, se', 'Les verbes avec me, te, se'), b('A pronominal verb carries a pronoun that matches its subject: **je me lève, tu te lèves, il se lève, nous nous levons, vous vous levez, ils se lèvent**. Before a vowel: **je m’appelle, tu t’habilles, il s’amuse**.', 'Un verbe pronominal porte un pronom qui correspond à son sujet : **je me lève, tu te lèves, il se lève, nous nous levons, vous vous levez, ils se lèvent**. Devant une voyelle : **je m’appelle, tu t’habilles, il s’amuse**.'), {
        ex: [['Je me réveille à six heures et je me douche tout de suite.', 'I wake up at six and shower straight away.'], ['Vous vous appelez comment ?', 'What’s your name?']],
      }),
      conj('se lever', PRESENT, [['je', 'me lève'], ['tu', 'te lèves'], ['il / elle', 'se lève'], ['nous', 'nous levons'], ['vous', 'vous levez'], ['ils / elles', 'se lèvent']], { given: [0] }),
      card(b('Negation and questions', 'La négation et les questions'), b('The negation goes around the verb: **je ne parle pas**, **je n’aime pas**. With a pronominal verb, it goes around the pronoun and the verb: **je ne me lève pas**. Three ways to ask: **Tu parles anglais ?**, **Est-ce que tu parles anglais ?**, **Parles-tu anglais ?** With il or elle and a vowel, add -t-: **Parle-t-elle anglais ?**', 'La négation entoure le verbe : **je ne parle pas**, **je n’aime pas**. Avec un verbe pronominal, elle entoure le pronom et le verbe : **je ne me lève pas**. Trois façons de demander : **Tu parles anglais ?**, **Est-ce que tu parles anglais ?**, **Parles-tu anglais ?** Avec il ou elle et une voyelle, on ajoute -t- : **Parle-t-elle anglais ?**')),
      mc(P.form, ['Je ne me couche pas tard.', 'Je me ne couche pas tard.', 'Je ne couche me pas tard.', 'Je ne me couche tard pas.']),
      mc(P.form, ['Habite-t-elle à Paris ?', 'Habite-elle à Paris ?', 'Habites-elle à Paris ?', 'Elle habite-t-à Paris ?']),
      ord(P.order, 'Est-ce que vous vous levez tôt le dimanche ?', { tr: 'Do you get up early on Sundays?' }),
      gap(P.completeText, 'Le matin, je ___ (se réveiller) à sept heures. Mon frère ___ (ne pas se lever) avant neuf heures. Nous ___ (prendre) le petit-déjeuner ensemble.', [['me réveille'], ['ne se lève pas'], ['prenons']]),
      dlg(b('A new flatmate', 'Une nouvelle colocataire'), b('Inès asks Tom about his habits.', 'Inès pose des questions à Tom sur ses habitudes.'), [['Inès', 'f'], ['Tom', 'm']], [
        [0, 'Tu te lèves à quelle heure le matin ?', 'What time do you get up in the morning?'],
        [1, { options: ['Je me lève vers sept heures, et toi ?', 'Je lève vers sept heures, et toi ?', 'Je me lèves vers sept heures, et toi ?'] }],
        [0, 'Moi, je pars au travail à huit heures. Tu prends le métro ?', 'I leave for work at eight. Do you take the metro?'],
        [1, { options: ['Non, je prends mon vélo. Je n’aime pas le métro.', 'Non, je prenons mon vélo. Je n’aime pas le métro.', 'Non, je prend mon vélo. Je aime pas le métro.'] }],
        [0, 'Et le soir, vous faites quoi, toi et ta sœur ?', 'And in the evening, what do you and your sister do?'],
        [1, { options: ['Nous faisons du sport ou nous regardons une série.', 'Nous faisez du sport ou nous regardons une série.', 'Nous font du sport ou nous regardons une série.'] }],
      ]),
      write(b('Your weekday routine', 'Votre routine en semaine'), b('Describe a normal weekday in 40 to 70 words: when you get up, what you do, when you go to bed. Use verbs from at least three families (-er, -ir, -re, irregular).', 'Décrivez une journée de semaine ordinaire en 40 à 70 mots : quand vous vous levez, ce que vous faites, quand vous vous couchez. Employez des verbes d’au moins trois familles (-er, -ir, -re, irréguliers).'), 40, 70, [
        b('At least two pronominal verbs (je me lève…)', 'Au moins deux verbes pronominaux (je me lève…)'),
        b('One negative sentence', 'Une phrase négative'),
        b('Verbs from three families', 'Des verbes de trois familles'),
      ], 'Je me réveille à six heures et demie, mais je me lève à sept heures. Je prends un café et je pars au travail à vélo. Je finis à dix-sept heures. Le soir, je fais les courses ou je vais à la salle de sport. Mes enfants font leurs devoirs. Nous mangeons ensemble et je ne me couche jamais après vingt-trois heures.'),
    ],
    [
      b('Pronominal verbs: me, te, se, nous, vous, se + verb.', 'Verbes pronominaux : me, te, se, nous, vous, se + verbe.'),
      b('Negation: je ne me lève pas (ne… pas around pronoun + verb).', 'Négation : je ne me lève pas (ne… pas autour du pronom et du verbe).'),
      b('Questions: intonation, est-ce que, or inversion with -t- if needed.', 'Questions : intonation, est-ce que, ou inversion avec -t- si besoin.'),
    ],
    [['se réveiller', b('to wake up', 'sortir du sommeil')], ['se coucher', b('to go to bed', 'aller au lit')], ['un colocataire', b('a flatmate', 'une personne qui partage le logement')]],
  ),
];
