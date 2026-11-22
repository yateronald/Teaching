import type { CourseAbout } from '../../types';
import { b, card, conj, dict, dlg, gap, lesson, mc, ord, P, pairs, say, sort, trap } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Pouvoir, vouloir, devoir and savoir are the four engine verbs of everyday French. Paired directly with an infinitive — with no extra preposition — they let you say what you can do, what you would like, what you must do and what you know how to do. This A1 course covers their present conjugations, polite requests with je voudrais, negative devoir vs il faut, and the key difference between savoir and pouvoir.',
    'Pouvoir, vouloir, devoir et savoir sont les quatre verbes moteurs du français quotidien. Suivis directement d’un infinitif — sans préposition —, ils permettent d’exprimer la capacité, le souhait, l’obligation et le savoir-faire. Ce cours A1 présente leurs conjugaisons au présent, la politesse avec je voudrais, la différence entre devoir et il faut, et l’opposition entre savoir et pouvoir.',
  ),
  outcomes: [
    b('Conjugate pouvoir, vouloir, devoir and savoir in the present', 'Conjuguer pouvoir, vouloir, devoir et savoir au présent'),
    b('Make polite requests with je voudrais and je peux', 'Formuler des demandes polies avec je voudrais et je peux'),
    b('Express obligation and prohibition with devoir', 'Exprimer l’obligation et l’interdiction avec devoir'),
    b('Distinguish savoir, pouvoir and connaître', 'Distinguer savoir, pouvoir et connaître'),
  ],
};

const C = 'g-modal-verbs';
export default [
  lesson(C, 1, ['pouvoir-and-vouloir', 'pouvoir-et-vouloir'],
    b('Pouvoir & vouloir: ability and wishes', 'Pouvoir et vouloir : capacité et volonté'),
    b('Conjugate pouvoir and vouloir, ask permission and soften requests with je voudrais.', 'Conjuguer pouvoir et vouloir, demander la permission et adoucir avec je voudrais.'),
    [b('Conjugate pouvoir and vouloir', 'Conjuguer pouvoir et vouloir'), b('Link modal + direct infinitive', 'Enchaîner verbe modal + infinitif direct'), b('Use je voudrais to be polite', 'Employer je voudrais pour être poli')],
    13,
    [
      card(b('Two key verbs + infinitive', 'Deux verbes clés + infinitif'), b('**Pouvoir** (can, may): **je peux, tu peux, il peut, nous pouvons, vous pouvez, ils peuvent**. **Vouloir** (want): **je veux, tu veux, il veut, nous voulons, vous voulez, ils veulent**. Notice the same endings (**-x, -x, -t, -ons, -ez, -ent**) and no preposition before the second verb: **Je veux partir** (not « je veux de partir »).', '**Pouvoir** : **je peux, tu peux, il peut, nous pouvons, vous pouvez, ils peuvent**. **Vouloir** : **je veux, tu veux, il veut, nous voulons, vous voulez, ils veulent**. Mêmes terminaisons (**-x, -x, -t, -ons, -ez, -ent**) et pas de préposition devant l’infinitif : **Je veux partir** (pas « de partir »).'), {
        ex: [['Tu peux m’aider une minute ?', 'Can you help me a minute?'], ['Nous voulons réserver une table.', 'We want to book a table.'], ['Je voudrais un thé vert, s’il vous plaît.', 'I would like a green tea, please.']],
      }),
      conj('pouvoir', b('present', 'présent'), [['je', 'peux'], ['tu', 'peux'], ['il / elle', 'peut'], ['nous', 'pouvons'], ['vous', 'pouvez'], ['ils / elles', 'peuvent']], { given: [0] }),
      mc(P.best, ['Je voudrais deux croissants, s’il vous plaît.', 'Je veux deux croissants maintenant.', 'Je peux de deux croissants.', 'J’ai vouloir deux croissants.'], { fr: 'Dans une boulangerie, la formule la plus polie :' }),
      mc(P.form, ['peuvent', 'peut', 'pouvons', 'pouvent'], { fr: 'Mes amis ne ___ pas venir ce soir.' }),
      gap(P.complete, 'Tu ___ (vouloir) aller au cinéma ? – Oui, mais je ne ___ (pouvoir) pas ce soir.', ['veux', 'peux']),
      dlg(b('At a café terrace', 'À la terrasse d’un café'), b('Ordering politely with a friend.', 'Commander poliment avec un ami.'), [['Serveur', 'm'], ['Vous', 'f']], [
        [0, 'Bonjour ! Vous avez choisi ?', 'Hello! Have you decided?'],
        [1, { options: ['Oui, je voudrais un café allongé, s’il vous plaît.', 'Oui, je peux un café allongé.', 'Oui, je veux de prendre un café.'] }],
        [0, 'Très bien. Et pour votre ami ?', 'Very good. And for your friend?'],
        [1, { options: ['Est-ce qu’il peut avoir un verre d’eau aussi ?', 'Est-ce qu’il veut de boire de l’eau ?', 'Est-ce qu’il peux un verre d’eau ?'] }],
        [0, 'Bien sûr, j’arrive tout de suite.', 'Of course, I’ll be right back.'],
      ]),
      say('Excusez-moi, est-ce que je peux ouvrir la fenêtre ?', 'Excuse me, may I open the window?'),
    ],
    [
      b('pouvoir / vouloir share the same pattern: -x, -x, -t, -ons, -ez, -ent.', 'pouvoir / vouloir ont le même modèle : -x, -x, -t, -ons, -ez, -ent.'),
      b('Follow directly with an infinitive (no à or de): je peux venir.', 'Infinitif direct sans à ni de : je peux venir.'),
      b('In shops and cafés, say Je voudrais… rather than Je veux…', 'Dans les commerces, dites Je voudrais… plutôt que Je veux…'),
    ],
    [['réserver', b('to book', 'retenir une place')], ['un café allongé', b('an americano', 'expresso avec plus d’eau')], ['ouvrir', b('to open', 'rendre ouvert')]],
  ),
  lesson(C, 2, ['devoir-obligation', 'devoir-et-l-obligation'],
    b('Devoir: obligation and rules', 'Devoir : obligation et règles'),
    b('Conjugate devoir in the present and understand what ne pas devoir means.', 'Conjuguer devoir au présent et comprendre le sens de ne pas devoir.'),
    [b('Conjugate devoir in the present', 'Conjuguer devoir au présent'), b('Use devoir + infinitive for obligation', 'Employer devoir + infinitif pour l’obligation'), b('Contrast ne doit pas and n’est pas obligé de', 'Opposer ne doit pas et n’est pas obligé de')],
    13,
    [
      card(b('Devoir in the present', 'Devoir au présent'), b('**Devoir** (*must / have to*): **je dois, tu dois, il / elle / on doit, nous devons, vous devez, ils / elles doivent**. Notice the stem shifts from **doi-** to **dev-** in **nous devons, vous devez**, then **doiv-** in **ils doivent**.', '**Devoir** : **je dois, tu dois, il / elle / on doit, nous devons, vous devez, ils / elles doivent**. Le radical passe de **doi-** à **dev-** pour **nous / vous**, puis **doiv-** pour **ils / elles**.'), {
        ex: [['Je dois finir ce rapport avant midi.', 'I have to finish this report before noon.'], ['Vous devez valider votre ticket.', 'You must validate your ticket.'], ['Ils doivent partir tôt demain.', 'They have to leave early tomorrow.']],
      }),
      trap(b('« Tu ne dois pas » = don’t!', '« Tu ne dois pas » = interdiction !'), b('Careful: **Tu ne dois pas fumer ici** means *You must not smoke here* (prohibition), NOT *you don’t have to*. To say *you don’t have to*, use **Tu n’es pas obligé(e) de…** or **Ce n’est pas nécessaire de…**', 'Attention : **Tu ne dois pas fumer ici** signifie *c’est interdit*, et non *tu n’es pas obligé*. Pour dire qu’une chose est facultative, dites **Tu n’es pas obligé(e) de…**')),
      conj('devoir', b('present', 'présent'), [['je', 'dois'], ['tu', 'dois'], ['il / elle', 'doit'], ['nous', 'devons'], ['vous', 'devez'], ['ils / elles', 'doivent']], { given: [0] }),
      mc(P.meaning, [b('You must not park here (it is forbidden).', 'C’est interdit de se garer ici.'), b('You don’t have to park here.', 'Vous n’êtes pas obligé de vous garer ici.'), b('You can park here if you want.', 'Vous pouvez vous garer ici.'), b('You parked here yesterday.', 'Vous vous êtes garé ici hier.')], { fr: 'Vous ne devez pas vous garer devant cette porte.' }),
      mc(P.form, ['doivent', 'doit', 'devons', 'devent'], { fr: 'Les étudiants ___ rendre le devoir vendredi.' }),
      gap(P.complete, 'Nous ___ prendre le train de 8 heures ; je ___ acheter les billets maintenant.', ['devons', 'dois']),
      ord(P.order, 'Vous devez montrer votre passeport à l’entrée.', { tr: 'You must show your passport at the entrance.', extra: ['de'] }),
      dict('Il doit travailler samedi, mais nous devons partir en voyage.', { voice: 'm' }),
    ],
    [
      b('devoir: je dois, tu dois, il doit, nous devons, vous devez, ils doivent.', 'devoir : je dois, tu dois, il doit, nous devons, vous devez, ils doivent.'),
      b('ne pas devoir = prohibition (must not), not lack of necessity.', 'ne pas devoir = interdiction, jamais absence d’obligation.'),
      b('For “not required”, use ne pas être obligé de.', 'Pour « facultatif », employez ne pas être obligé de.'),
    ],
    [['valider', b('to validate (a ticket)', 'composter, enregistrer')], ['rendre', b('to hand in, give back', 'remettre')], ['une entrée', b('an entrance', 'porte d’accès')]],
  ),
  lesson(C, 3, ['savoir-and-pouvoir', 'savoir-ou-pouvoir'],
    b('Savoir, pouvoir & connaître', 'Savoir, pouvoir et connaître'),
    b('Use savoir + infinitive for skills, contrast it with pouvoir, and meet connaître.', 'Employer savoir + infinitif pour un savoir-faire, le distinguer de pouvoir et découvrir connaître.'),
    [b('Conjugate savoir in the present', 'Conjuguer savoir au présent'), b('Use savoir + infinitive for learned skills', 'Employer savoir + infinitif pour un savoir-faire'), b('Distinguish savoir and connaître', 'Distinguer savoir et connaître')],
    13,
    [
      card(b('Savoir in the present', 'Savoir au présent'), b('**Savoir** (*to know* a fact or *know how to*): **je sais, tu sais, il sait, nous savons, vous savez, ils savent**. Followed by an infinitive, **savoir** expresses a **learned skill**: **Je sais nager** (I know how to swim). **Pouvoir** expresses **physical ability or permission right now**: **Je ne peux pas nager aujourd’hui, la piscine est fermée.**', '**Savoir** : **je sais, tu sais, il sait, nous savons, vous savez, ils savent**. Suivi d’un infinitif, **savoir** indique un **savoir-faire** : **Je sais nager.** **Pouvoir** exprime la **possibilité ou la permission sur le moment** : **Je ne peux pas nager aujourd’hui, la piscine est fermée.**'), {
        ex: [['Elle sait parler trois langues.', 'She knows how to speak three languages.'], ['Tu sais où est la gare ?', 'Do you know where the station is?'], ['Je sais jouer du piano, mais je ne peux pas jouer ce soir.', 'I can play the piano, but I can’t play tonight.']],
      }),
      trap(b('Savoir vs connaître', 'Savoir ou connaître'), b('**Savoir** goes with a **verb** or a **clause** (**que, où, si, comment**): **Je sais que tu viens.** **Connaître** (*je connais, nous connaissons*) goes with a **noun** (a person, a place, a book): **Je connais bien Lyon.** Never « je connais que ».', '**Savoir** s’emploie devant un **verbe** ou une **proposition** (**que, où, si**) : **Je sais que tu viens.** **Connaître** (*je connais, nous connaissons*) s’emploie devant un **nom** (personne, lieu, œuvre) : **Je connais bien Lyon.** Jamais « je connais que ».')),
      sort(b('Savoir or connaître?', 'Savoir ou connaître ?'), ['savoir', 'connaître'], [['… nager', 0], ['… ce restaurant', 1], ['… à quelle heure il arrive', 0], ['… la sœur de Paul', 1], ['… conduire', 0], ['… bien Montréal', 1]]),
      pairs(P.match, [['Je sais conduire.', b('I know how to drive.', 'Savoir-faire acquis')], ['Je ne peux pas conduire ce soir.', b('I can’t drive tonight.', 'Impossibilité ponctuelle')], ['Je connais cette route.', b('I know this road.', 'Lieu connu')], ['Je sais où il habite.', b('I know where he lives.', 'Fait ou information')]]),
      mc(P.word, ['sais', 'connais', 'peux', 'dois'], { fr: 'Ma petite sœur ___ déjà lire toute seule.' }),
      mc(P.word, ['connaissez', 'savez', 'pouvez', 'devez'], { fr: 'Vous ___ un bon médecin dans le quartier ?' }),
      gap(P.complete, 'Je ___ (savoir) faire la cuisine, mais ce soir je ne ___ (pouvoir) pas préparer le dîner.', ['sais', 'peux']),
      say('Je sais parler un peu français et je connais quelques mots d’espagnol.', 'I can speak a little French and I know a few words of Spanish.'),
    ],
    [
      b('savoir: je sais, tu sais, il sait, nous savons, vous savez, ils savent.', 'savoir : je sais, tu sais, il sait, nous savons, vous savez, ils savent.'),
      b('savoir + infinitive = learned skill; pouvoir + infinitive = possibility/permission.', 'savoir + infinitif = savoir-faire ; pouvoir + infinitif = possibilité/permission.'),
      b('savoir + clause/verb; connaître + noun (person, place, thing).', 'savoir + verbe/phrase ; connaître + nom (personne, lieu, chose).'),
    ],
    [['nager', b('to swim', 'se déplacer dans l’eau')], ['conduire', b('to drive', 'piloter une voiture')], ['connaître', b('to know (a person/place)', 'avoir l’expérience de')]],
  ),
];
