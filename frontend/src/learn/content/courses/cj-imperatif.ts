import type { CourseAbout } from '../../types';
import { b, card, conj, dict, dlg, doc, gap, hear, lesson, mc, ord, P, say, sort, tip, trap, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Entrez ! Ne t’inquiète pas. Prenez la deuxième à droite. The imperative gives instructions, advice and invitations. It looks simple (three persons, no subject) but it has three traps: the missing s with -er verbs, four irregular verbs, and pronouns that move after the verb. This course takes them one at a time, then puts everything together in directions, recipes and advice.',
    'Entrez ! Ne t’inquiète pas. Prenez la deuxième à droite. L’impératif sert à donner des consignes, des conseils et des invitations. Il paraît simple (trois personnes, pas de sujet) mais il cache trois pièges : le s qui disparaît avec les verbes en -er, quatre verbes irréguliers, et des pronoms qui passent après le verbe. Ce cours les prend un par un, puis réunit tout dans des itinéraires, des recettes et des conseils.',
  ),
  outcomes: [
    b('Form the imperative at tu, nous and vous', 'Former l’impératif à tu, nous et vous'),
    b('Use the irregular être, avoir, savoir, vouloir', 'Employer les irréguliers être, avoir, savoir, vouloir'),
    b('Place pronouns in affirmative and negative orders', 'Placer les pronoms dans un ordre affirmatif ou négatif'),
    b('Give directions, instructions and advice', 'Donner un itinéraire, des consignes et des conseils'),
  ],
};

const C = 'cj-imperatif';
const IMP = b('impératif', 'impératif');

export default [
  lesson(C, 1, ['forming-the-imperative', 'former-l-imperatif'],
    b('Three persons, no subject', 'Trois personnes, pas de sujet'),
    b('Take the present, remove the pronoun, and watch the -er verbs.', 'Prenez le présent, enlevez le pronom, et attention aux verbes en -er.'),
    [b('Form the imperative from the present', 'Former l’impératif à partir du présent'), b('Drop the s with -er verbs', 'Supprimer le s des verbes en -er'), b('Choose tu, nous or vous', 'Choisir tu, nous ou vous')],
    13,
    [
      card(b('From the present', 'À partir du présent'), b('The imperative has only three persons: **tu, nous, vous**. Take the present and remove the subject: **tu finis → Finis !**, **nous partons → Partons !**, **vous prenez → Prenez !** The nous form means « let’s »: **Partons !** = Let’s go!', 'L’impératif n’a que trois personnes : **tu, nous, vous**. Prenez le présent et enlevez le sujet : **tu finis → Finis !**, **nous partons → Partons !**, **vous prenez → Prenez !** La forme nous invite à agir ensemble : **Partons !**'), {
        table: {
          head: ['', 'finir', 'prendre', 'attendre'],
          rows: [['(tu)', 'Finis !', 'Prends !', 'Attends !'], ['(nous)', 'Finissons !', 'Prenons !', 'Attendons !'], ['(vous)', 'Finissez !', 'Prenez !', 'Attendez !']],
        },
        ex: [['Prenez la deuxième rue à droite.', 'Take the second street on the right.'], ['Attendez ici, s’il vous plaît.', 'Wait here, please.']],
      }),
      trap(b('The -er trap: no s with tu', 'Le piège des verbes en -er : pas de s avec tu'), b('With **-er** verbs, and with **aller, ouvrir, offrir**, the tu form loses its s: **tu parles → Parle !**, **tu vas → Va !**, **tu ouvres → Ouvre !** The s comes back before **y** and **en**, for the sound: **Vas-y !**, **Manges-en !**', 'Avec les verbes en **-er**, et avec **aller, ouvrir, offrir**, la forme tu perd son s : **tu parles → Parle !**, **tu vas → Va !**, **tu ouvres → Ouvre !** Le s revient devant **y** et **en**, pour le son : **Vas-y !**, **Manges-en !**')),
      conj('écouter', IMP, [['(tu)', 'écoute'], ['(nous)', 'écoutons'], ['(vous)', 'écoutez']]),
      conj('choisir', IMP, [['(tu)', 'choisis'], ['(nous)', 'choisissons'], ['(vous)', 'choisissez']]),
      mc(P.form, ['regarde', 'regardes', 'regardé', 'regardait'], { fr: 'Léo, ___ par la fenêtre : il neige !' }),
      mc(P.form, ['Allons', 'Allez-nous', 'Vont', 'Allant'], { fr: '___ au cinéma ce soir, qu’en penses-tu ?' }),
      gap(P.complete, '___ (tu, ouvrir) la fenêtre, s’il te plaît. ___ (vous, attendre) une minute. ___ (nous, partir) avant la pluie !', [['Ouvre'], ['Attendez'], ['Partons']]),
      sort(b('Tu, nous or vous?', 'Tu, nous ou vous ?'), ['tu', 'nous', 'vous'], [['Mange !', 0], ['Mangeons !', 1], ['Mangez !', 2], ['Finis !', 0], ['Sortons !', 1], ['Répondez !', 2]]),
      hear('Fermez la porte, s’il vous plaît.', b('Who is spoken to?', 'À qui parle-t-on ?'), [b('vous: one person politely, or several people', 'vous : une personne poliment, ou plusieurs personnes'), b('tu: a friend or a child', 'tu : un ami ou un enfant'), b('nous: the speaker and others', 'nous : la personne qui parle et d’autres')]),
      say('Prends ton manteau, il fait froid.', 'Take your coat, it’s cold.'),
    ],
    [
      b('Three persons: tu, nous, vous, without a subject pronoun.', 'Trois personnes : tu, nous, vous, sans pronom sujet.'),
      b('-er verbs, aller, ouvrir, offrir: no s with tu (Parle ! Va !).', 'Verbes en -er, aller, ouvrir, offrir : pas de s avec tu (Parle ! Va !).'),
      b('The s comes back before y and en: Vas-y ! Manges-en !', 'Le s revient devant y et en : Vas-y ! Manges-en !'),
    ],
    [['ouvrir', b('to open', 'rendre accessible')], ['neiger', b('to snow', 'tomber de la neige')], ['avant la pluie', b('before the rain', 'avant qu’il pleuve')]],
  ),

  lesson(C, 2, ['irregular-imperatives', 'imperatifs-irreguliers'],
    b('Être, avoir, savoir, vouloir', 'Être, avoir, savoir, vouloir'),
    b('Four verbs with special forms: Sois sage, N’ayez pas peur, Sachez que, Veuillez patienter.', 'Quatre verbes aux formes particulières : Sois sage, N’ayez pas peur, Sachez que, Veuillez patienter.'),
    [b('Know the four irregular imperatives', 'Connaître les quatre impératifs irréguliers'), b('Use veuillez in formal writing', 'Employer veuillez à l’écrit soutenu'), b('Encourage and reassure someone', 'Encourager et rassurer quelqu’un')],
    13,
    [
      card(b('Four special verbs', 'Quatre verbes particuliers'), b('These four verbs do not take their imperative from the present. You hear them every day: **Sois sage !**, **N’ayez pas peur !**, **Sachez que…**, and the very polite **Veuillez patienter.**', 'Ces quatre verbes ne forment pas leur impératif à partir du présent. On les entend tous les jours : **Sois sage !**, **N’ayez pas peur !**, **Sachez que…**, et le très poli **Veuillez patienter.**'), {
        table: {
          head: ['', 'être', 'avoir', 'savoir', 'vouloir'],
          rows: [['(tu)', 'sois', 'aie', 'sache', 'veuille'], ['(nous)', 'soyons', 'ayons', 'sachons', 'veuillons'], ['(vous)', 'soyez', 'ayez', 'sachez', 'veuillez']],
        },
        ex: [['Soyez à l’heure demain, s’il vous plaît.', 'Please be on time tomorrow.'], ['N’aie pas peur, le chien est gentil.', 'Don’t be afraid, the dog is friendly.']],
      }),
      tip(b('Veuillez, the formal one', 'Veuillez, le plus soutenu'), b('**Veuillez** + infinitive is used in letters, emails and announcements: **Veuillez patienter**, **Veuillez trouver ci-joint…**. In conversation, prefer **Pouvez-vous…** or **Merci de…**.', '**Veuillez** + infinitif s’emploie dans les lettres, les courriels et les annonces : **Veuillez patienter**, **Veuillez trouver ci-joint…**. À l’oral, préférez **Pouvez-vous…** ou **Merci de…**.')),
      conj('être', IMP, [['(tu)', 'sois'], ['(nous)', 'soyons'], ['(vous)', 'soyez']]),
      conj('avoir', IMP, [['(tu)', 'aie'], ['(nous)', 'ayons'], ['(vous)', 'ayez']]),
      mc(P.form, ['Soyez', 'Êtes', 'Soyiez', 'Soient'], { fr: '___ prudents sur la route !' }),
      mc(P.form, ['aie', 'as', 'aies', 'ai'], { fr: 'N’___ pas honte, tout le monde fait des erreurs.' }),
      mc(P.form, ['Veuillez', 'Voulez', 'Veuillent', 'Vouliez'], { fr: '___ fermer la porte en sortant.' }),
      gap(P.complete, '___ (tu, être) gentil avec ta sœur. ___ (vous, savoir) que le magasin ferme à dix-neuf heures. N’___ (nous, avoir) pas peur.', [['Sois'], ['Sachez'], ['ayons']]),
      dict('Soyez patients et ayez confiance : tout va bien se passer.'),
      say('Veuillez patienter, un conseiller va vous répondre.', 'Please hold, an adviser will answer you.'),
    ],
    [
      b('être: sois, soyons, soyez; avoir: aie, ayons, ayez.', 'être : sois, soyons, soyez ; avoir : aie, ayons, ayez.'),
      b('savoir: sache, sachons, sachez; vouloir: veuillez (formal).', 'savoir : sache, sachons, sachez ; vouloir : veuillez (soutenu).'),
      b('Veuillez + infinitive in letters and announcements.', 'Veuillez + infinitif dans les lettres et les annonces.'),
    ],
    [['avoir honte', b('to be ashamed', 'se sentir gêné')], ['prudent', b('careful', 'qui fait attention')], ['patienter', b('to wait, to hold', 'attendre')]],
  ),

  lesson(C, 3, ['pronouns-and-negation', 'pronoms-et-negation'],
    b('Pronouns and the negative imperative', 'Les pronoms et l’impératif négatif'),
    b('Lève-toi ! Ne te lève pas ! Dis-le-moi. Ne me le dis pas.', 'Lève-toi ! Ne te lève pas ! Dis-le-moi. Ne me le dis pas.'),
    [b('Put pronouns after the verb in affirmative orders', 'Placer les pronoms après le verbe à l’affirmatif'), b('Put them back before the verb in negative orders', 'Les replacer avant le verbe au négatif'), b('Use pronominal verbs in the imperative', 'Employer les verbes pronominaux à l’impératif')],
    13,
    [
      card(b('After the verb, or before it', 'Après le verbe, ou avant'), b('In an **affirmative** order, the pronoun goes **after** the verb with a hyphen, and **me, te** become **moi, toi**: **Regarde-moi !**, **Lève-toi !**, **Donne-le-lui.** In a **negative** order, it goes back **before** the verb: **Ne me regarde pas.**, **Ne te lève pas.**, **Ne le lui donne pas.**', 'Dans un ordre **affirmatif**, le pronom se place **après** le verbe avec un trait d’union, et **me, te** deviennent **moi, toi** : **Regarde-moi !**, **Lève-toi !**, **Donne-le-lui.** Dans un ordre **négatif**, il revient **avant** le verbe : **Ne me regarde pas.**, **Ne te lève pas.**, **Ne le lui donne pas.**'), {
        table: {
          head: ['', b('affirmative', 'affirmatif'), b('negative', 'négatif')],
          rows: [['se lever (tu)', 'Lève-toi !', 'Ne te lève pas !'], ['le dire (vous)', 'Dites-le !', 'Ne le dites pas !'], ['me téléphoner (tu)', 'Téléphone-moi !', 'Ne me téléphone pas !'], ['y aller (nous)', 'Allons-y !', 'N’y allons pas !']],
        },
        ex: [['Dis-moi la vérité.', 'Tell me the truth.'], ['Ne t’inquiète pas, je m’en occupe.', 'Don’t worry, I’ll take care of it.']],
      }),
      trap(b('Lève-toi, never « lève-te »', 'Lève-toi, jamais « lève-te »'), b('After the verb, **te** always becomes **toi** and **me** becomes **moi**: **Assieds-toi**, **Excusez-moi**. With two pronouns, the order is verb + direct + indirect: **Donne-le-moi**, **Envoyez-la-lui**.', 'Après le verbe, **te** devient toujours **toi** et **me** devient **moi** : **Assieds-toi**, **Excusez-moi**. Avec deux pronoms, l’ordre est verbe + direct + indirect : **Donne-le-moi**, **Envoyez-la-lui**.')),
      mc(P.form, ['Assieds-toi', 'Assieds-te', 'Toi assieds', 'Te assieds'], { fr: '___, le médecin arrive.' }),
      mc(P.form, ['Ne t’inquiète pas', 'Ne inquiète pas', 'Ne t’inquiètes pas', 'Ne inquiète-toi pas'], { fr: '___ : le train a juste dix minutes de retard.' }),
      mc(P.form, ['Prête-la-moi', 'Prête-moi-la', 'Me la prête', 'Prête-la-me'], { fr: 'Ta voiture ? ___ pour le week-end, s’il te plaît !' }),
      gap(P.complete, '___ (tu, se dépêcher) : le film commence ! ___ (vous, ne pas s’asseoir) ici, c’est réservé.', [['Dépêche-toi'], ['Ne vous asseyez pas']]),
      ord(P.order, 'Ne te couche pas trop tard ce soir.', { tr: 'Don’t go to bed too late tonight.' }),
      sort(b('Where is the pronoun?', 'Où est le pronom ?'), [b('after the verb: affirmative', 'après le verbe : affirmatif'), b('before the verb: negative', 'avant le verbe : négatif')], [['Lève-toi !', 0], ['Ne te lève pas !', 1], ['Prends-le !', 0], ['Ne le prends pas !', 1], ['Parlez-lui !', 0], ['Ne lui parlez pas !', 1]]),
      dict('Ne t’inquiète pas et appelle-moi quand tu arrives.'),
      say('Dépêche-toi, on va rater le bus !', 'Hurry up, we’re going to miss the bus!'),
    ],
    [
      b('Affirmative: verb-pronoun with a hyphen (Dis-moi, Lève-toi).', 'Affirmatif : verbe-pronom avec un trait d’union (Dis-moi, Lève-toi).'),
      b('Negative: ne + pronoun + verb + pas (Ne te lève pas).', 'Négatif : ne + pronom + verbe + pas (Ne te lève pas).'),
      b('Two pronouns: Donne-le-moi / Ne me le donne pas.', 'Deux pronoms : Donne-le-moi / Ne me le donne pas.'),
    ],
    [['s’asseoir', b('to sit down', 'prendre un siège')], ['se dépêcher', b('to hurry', 'aller vite')], ['prêter', b('to lend', 'donner pour un temps')]],
  ),

  lesson(C, 4, ['instructions-and-review', 'consignes-et-bilan'],
    b('Directions, instructions and advice', 'Itinéraires, consignes et conseils'),
    b('The imperative in real life: a notice, a recipe, directions and advice to a friend.', 'L’impératif dans la vie réelle : une affiche, une recette, un itinéraire et des conseils à un ami.'),
    [b('Read and follow written instructions', 'Lire et suivre des consignes écrites'), b('Give directions', 'Indiquer un chemin'), b('Give advice politely', 'Donner des conseils avec politesse')],
    13,
    [
      card(b('What the imperative is for', 'À quoi sert l’impératif'), b('It gives instructions (**Tournez à gauche.**), advice (**Bois de l’eau.**), invitations (**Entrez !**) and warnings (**Attention, ne touche pas !**). To soften an order, add **s’il te plaît** or **s’il vous plaît**, or turn it into a question: **Tu peux fermer la porte ?**', 'Il sert à donner des consignes (**Tournez à gauche.**), des conseils (**Bois de l’eau.**), des invitations (**Entrez !**) et des mises en garde (**Attention, ne touche pas !**). Pour adoucir un ordre, ajoutez **s’il te plaît** ou **s’il vous plaît**, ou posez une question : **Tu peux fermer la porte ?**'), {
        ex: [['Continuez tout droit jusqu’au feu, puis tournez à droite.', 'Go straight on to the lights, then turn right.'], ['Bois de l’eau et repose-toi.', 'Drink some water and rest.']],
      }),
      doc({ title: 'Avant votre première séance', text: 'Arrivez dix minutes en avance.\nApportez une pièce d’identité.\nNe mangez pas dans les deux heures qui précèdent la séance.\nEn cas d’absence, prévenez-nous la veille.', look: 'notice' }, b('What must you do before your first session?', 'Que devez-vous faire avant votre première séance ?'), [b('Arrive early and bring an ID', 'Arriver en avance et apporter une pièce d’identité'), b('Eat just before the session', 'Manger juste avant la séance'), b('Call on the day if you are absent', 'Appeler le jour même en cas d’absence'), b('Bring a friend', 'Venir avec un ami')]),
      gap(P.completeText, 'Pour la pâte, ___ (vous, mélanger) la farine et le sucre. ___ (vous, ajouter) les œufs, puis ___ (vous, ne pas battre) trop longtemps.', [['mélangez'], ['Ajoutez'], ['ne battez pas']]),
      mc(P.best, ['Tournez à gauche au deuxième feu.', 'Tournez gauche au deuxième feu.', 'Tourne-vous à gauche au deuxième feu.', 'Vous tournez-y à gauche au deuxième feu.']),
      hear('Allez-y, je vous écoute.', b('What does the person mean?', 'Que veut dire la personne ?'), [b('Go ahead, I’m listening', 'Allez-y, je vous écoute : parlez'), b('Leave, I don’t want to hear you', 'Partez, je ne veux pas vous entendre'), b('Go there and listen', 'Allez là-bas pour écouter')]),
      dlg(b('Asking the way', 'Demander son chemin'), b('A visitor looks for the museum.', 'Un visiteur cherche le musée.'), [['Visiteuse', 'f'], ['Passant', 'm']], [
        [0, 'Excusez-moi, monsieur, le musée, c’est loin ?', 'Excuse me, sir, is the museum far?'],
        [1, { options: ['Non. Prenez la rue à gauche et continuez tout droit.', 'Non. Prenez-vous la rue à gauche et continuez tout droit.', 'Non. Prends-vous la rue à gauche et continue-vous tout droit.'] }],
        [0, 'Et après le pont ?', 'And after the bridge?'],
        [1, { options: ['Tournez à droite, il est juste là. Ne traversez pas le parc, c’est plus long.', 'Tournez à droite, il est juste là. Traversez pas ne le parc, c’est plus long.', 'Tourner à droite, il est juste là. Ne traversez le parc pas.'] }],
        [0, 'Merci beaucoup, bonne journée !', 'Thank you very much, have a nice day!'],
      ]),
      write(b('Advice to a friend', 'Des conseils à un ami'), b('A friend has an important exam tomorrow. In 35 to 60 words, give advice with at least four imperatives, including one negative and one with a pronoun (couche-toi, ne t’inquiète pas…).', 'Un ami passe un examen important demain. En 35 à 60 mots, donnez-lui des conseils avec au moins quatre impératifs, dont un négatif et un avec un pronom (couche-toi, ne t’inquiète pas…).'), 35, 60, [
        b('Four imperatives at the tu form', 'Quatre impératifs à la forme tu'),
        b('One negative order', 'Un ordre négatif'),
        b('One pronominal verb (couche-toi…)', 'Un verbe pronominal (couche-toi…)'),
      ], 'Prépare ton sac la veille et couche-toi tôt. Le matin, prends un bon petit-déjeuner et pars en avance. Ne regarde pas tes notes dans le train : écoute de la musique et respire. Pendant l’examen, lis bien les consignes. Et surtout, ne t’inquiète pas : tu es prêt !'),
      say('Tournez à droite au feu, puis continuez tout droit.', 'Turn right at the lights, then go straight on.'),
    ],
    [
      b('Instructions and directions often use vous: Tournez, Prenez, Continuez.', 'Consignes et itinéraires emploient souvent vous : Tournez, Prenez, Continuez.'),
      b('Soften with s’il vous plaît, or ask a question instead.', 'Adoucir avec s’il vous plaît, ou poser une question à la place.'),
      b('Negative advice: Ne mangez pas, Ne t’inquiète pas.', 'Conseil négatif : Ne mangez pas, Ne t’inquiète pas.'),
    ],
    [['une pièce d’identité', b('an ID document', 'un papier qui prouve qui on est')], ['prévenir', b('to let (someone) know', 'informer à l’avance')], ['traverser', b('to cross', 'passer d’un côté à l’autre')]],
  ),
];
