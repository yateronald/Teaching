import type { CourseAbout } from '../../types';
import { b, card, dict, gap, hear, lesson, mc, P, pairs, say, sort } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Chuis pas sûr. T’as vu ? Y a personne. J’sais pas. Real spoken French compresses words in ways textbooks rarely show: the ne disappears, tu becomes t’, il becomes i’, je suis becomes chuis. This course explains these reductions sound by sound, trains you to understand them at natural speed, and shows when it is appropriate to use some of them yourself (with friends) and when to keep the full forms (at work, in exams, in writing).',
    'Chuis pas sûr. T’as vu ? Y a personne. J’sais pas. Le français parlé réel compresse les mots d’une façon que les manuels montrent rarement : le ne disparaît, tu devient t’, il devient i’, je suis devient chuis. Ce cours explique ces réductions son par son, vous entraîne à les comprendre à vitesse naturelle, et montre quand il est approprié d’en utiliser certaines (entre amis) et quand garder les formes complètes (au travail, aux examens, à l’écrit).',
  ),
  outcomes: [
    b('Understand the most common reductions', 'Comprendre les réductions les plus courantes'),
    b('Restore the full written form', 'Restituer la forme écrite complète'),
    b('Use some reductions naturally with friends', 'Utiliser certaines réductions naturellement entre amis'),
    b('Know when to avoid them', 'Savoir quand les éviter'),
  ],
};

const C = 'p-spoken-reductions';
export default [
  lesson(C, 1, ['dropping-ne-and-short-pronouns', 'chute-du-ne-et-pronoms-courts'],
    b('Dropping ne, and short pronouns', 'La chute du ne et les pronoms raccourcis'),
    b('Understand je sais pas, t’as, i’ vient, y a.', 'Comprendre je sais pas, t’as, i’ vient, y a.'),
    [b('Understand negation without ne', 'Comprendre la négation sans ne'), b('Understand t’, i’, y a', 'Comprendre t’, i’, y a'), b('Restore the full form', 'Restituer la forme complète')],
    13,
    [
      card(b('The most common reductions', 'Les réductions les plus fréquentes'), b('**ne** drops in almost all casual speech: **Je sais pas. C’est pas grave. J’ai rien vu.** · **tu + vowel → t’**: **T’as faim ? T’es où ?** · **il(s) → i’** before a consonant: **I’ vient demain** [ivjɛ̃]. · **il y a → y a** [ja]: **Y a personne.** · **il faut → faut**: **Faut y aller.**', 'Le **ne** tombe dans presque tout l’oral familier : **Je sais pas. C’est pas grave. J’ai rien vu.** · **tu + voyelle → t’** : **T’as faim ? T’es où ?** · **il(s) → i’** devant une consonne : **I’ vient demain** [ivjɛ̃]. · **il y a → y a** [ja] : **Y a personne.** · **il faut → faut** : **Faut y aller.**'), {
        ex: [['T’as vu ? Y a personne.', 'Tu as vu ? Il n’y a personne.'], ['Faut pas s’inquiéter.', 'Il ne faut pas s’inquiéter.']],
      }),
      hear('T’as vu ? Y a plus de pain.', b('Listen. What is the full form?', 'Écoutez. Quelle est la forme complète ?'), [b('Tu as vu ? Il n’y a plus de pain.', 'Tu as vu ? Il n’y a plus de pain.'), b('Tu vas voir ? Il y a du pain.', 'Tu vas voir ? Il y a du pain.'), b('T’avais vu ? Il y avait du pain.', 'Tu avais vu ? Il y avait du pain.'), b('Ta vue ? Il a plus de pain.', 'Ta vue ? Il a plus de pain.')]),
      hear('Faut pas t’inquiéter, i’ va venir.', b('Listen. What is the full form?', 'Écoutez. Quelle est la forme complète ?'), [b('Il ne faut pas t’inquiéter, il va venir.', 'Il ne faut pas t’inquiéter, il va venir.'), b('Il faut t’inquiéter, il ne va pas venir.', 'Il faut t’inquiéter, il ne va pas venir.'), b('Tu ne t’inquiètes pas, il vient.', 'Tu ne t’inquiètes pas, il vient.'), b('Il faut pas inquiéter Yves.', 'Il faut pas inquiéter Yves.')], { voice: 'm' }),
      pairs(P.match, [['Y a personne.', 'Il n’y a personne.'], ['T’es où ?', 'Tu es où ?'], ['Faut y aller.', 'Il faut y aller.'], ['J’ai rien dit.', 'Je n’ai rien dit.']], true),
      gap(P.complete, 'Oral : « Y a pas de problème. » → Écrit : « Il n’___ a ___ de problème. »', ['y', 'pas']),
      say('T’es où ? Y a personne ici. Faut pas être en retard !', 'Where are you? There’s nobody here. Mustn’t be late!', { tip: b('Casual style, with friends only.', 'Style familier, entre amis seulement.') }),
    ],
    [
      b('ne drops in casual speech: je sais pas, c’est pas grave.', 'Le ne tombe à l’oral familier : je sais pas, c’est pas grave.'),
      b('t’as, t’es; i’ vient; y a; faut.', 't’as, t’es ; i’ vient ; y a ; faut.'),
      b('Always write the full form.', 'Écrivez toujours la forme complète.'),
    ],
    [['s’inquiéter', b('to worry', 'se faire du souci')], ['plus de', b('no more', 'il n’en reste pas')], ['personne', b('nobody', 'aucune personne')]],
  ),
  lesson(C, 2, ['chuis-and-other-fusions', 'chuis-et-autres-fusions'],
    b('Chuis, chais pas and other fusions', 'Chuis, chais pas et autres fusions'),
    b('Recognise fusions created by dropped vowels: chuis, chais pas, j’te, d’la.', 'Reconnaître les fusions créées par la chute des voyelles : chuis, chais pas, j’te, d’la.'),
    [b('Understand je suis → chuis', 'Comprendre je suis → chuis'), b('Understand je sais → chais', 'Comprendre je sais → chais'), b('Understand pronoun chains', 'Comprendre les chaînes de pronoms')],
    13,
    [
      card(b('Fusions', 'Les fusions'), b('When **je** loses its e before s or ch, j + s becomes **[ʃ]**: **je suis → chuis** [ʃɥi], **je sais pas → chais pas** [ʃepa], **je cherche → [ʃʃɛʁʃ]**. Pronoun chains: **je te l’ai dit → j’te l’ai dit** [ʃtəlɛdi], **tu le veux → tu l’veux**. Articles: **de la → d’la**, **qu’est-ce que tu fais → [kɛsktyfɛ]**.', 'Quand **je** perd son e devant s ou ch, j + s devient **[ʃ]** : **je suis → chuis** [ʃɥi], **je sais pas → chais pas** [ʃepa]. Chaînes de pronoms : **je te l’ai dit → j’te l’ai dit** [ʃtəlɛdi], **tu le veux → tu l’veux**. Articles : **de la → d’la**, **qu’est-ce que tu fais → [kɛsktyfɛ]**.')),
      hear('Chuis pas sûr, chais pas.', b('Listen. What is the full form?', 'Écoutez. Quelle est la forme complète ?'), [b('Je ne suis pas sûr, je ne sais pas.', 'Je ne suis pas sûr, je ne sais pas.'), b('Tu n’es pas sûr, tu ne sais pas.', 'Tu n’es pas sûr, tu ne sais pas.'), b('Je suis sûr, je sais.', 'Je suis sûr, je sais.'), b('Ce n’est pas sûr, c’est pas ça.', 'Ce n’est pas sûr, c’est pas ça.')]),
      hear('J’te l’ai dit hier.', b('Listen. What is the full form?', 'Écoutez. Quelle est la forme complète ?'), [b('Je te l’ai dit hier.', 'Je te l’ai dit hier.'), b('Je l’ai dit hier.', 'Je l’ai dit hier.'), b('Tu me l’as dit hier.', 'Tu me l’as dit hier.'), b('Je te dis hier.', 'Je te dis hier.')], { voice: 'm' }),
      sort(b('Which full form?', 'Quelle forme complète ?'), [b('je suis', 'je suis'), b('je sais', 'je sais'), b('je te', 'je te')], [['chuis fatigué', 0], ['chais pas', 1], ['j’te rappelle', 2], ['chuis là', 0], ['chais bien', 1], ['j’te crois', 2]]),
      dict('Je ne sais pas, je suis fatigué, je te rappelle demain.', { hint: b('You hear chais pas, chuis, j’te: write the full forms.', 'Vous entendez chais pas, chuis, j’te : écrivez les formes complètes.') }),
      mc(P.best, ['Je ne sais pas encore, je vous confirme demain.', 'Chais pas encore, j’vous confirme d’main.', 'Sais pas.', 'Chuis pas au courant, quoi.'], { fr: 'Vous répondez à un client au téléphone :' }),
    ],
    [
      b('je suis → chuis; je sais → chais; je te → j’te.', 'je suis → chuis ; je sais → chais ; je te → j’te.'),
      b('Understand them; use them only in very casual contexts.', 'Comprenez-les ; employez-les seulement en contexte très familier.'),
      b('With clients, in exams and in writing: full forms.', 'Avec un client, aux examens et à l’écrit : formes complètes.'),
    ],
    [['rappeler', b('to call back', 'téléphoner à nouveau')], ['confirmer', b('to confirm', 'rendre sûr')], ['fatigué', b('tired', 'qui a besoin de repos')]],
  ),
  lesson(C, 3, ['choosing-your-register', 'choisir-son-registre-a-l-oral'],
    b('Choosing your spoken register', 'Choisir son registre à l’oral'),
    b('Decide how much to reduce depending on who you are talking to.', 'Décider jusqu’où réduire selon votre interlocuteur.'),
    [b('Recognise three spoken levels', 'Reconnaître trois niveaux d’oral'), b('Adapt to the situation', 'S’adapter à la situation'), b('Stay natural without being sloppy', 'Rester naturel sans être relâché')],
    13,
    [
      card(b('Three levels of speech', 'Trois niveaux d’oral'), b('**Careful** (presentation, exam, client): **Je ne sais pas, il n’y a pas de problème.** **Standard everyday** (colleagues): **Je sais pas, y a pas de problème.** — dropping ne is normal and accepted. **Very casual** (close friends): **Chais pas, y a pas d’souci.** Learners sound most natural at the **standard** level: drop the ne, keep the rest clear.', '**Soigné** (présentation, examen, client) : **Je ne sais pas, il n’y a pas de problème.** **Courant** (collègues) : **Je sais pas, y a pas de problème.** — la chute du ne est normale et acceptée. **Très familier** (amis proches) : **Chais pas, y a pas d’souci.** Les apprenants paraissent le plus naturels au niveau **courant** : laissez tomber le ne, gardez le reste clair.')),
      sort(b('Which level?', 'Quel niveau ?'), [b('careful', 'soigné'), b('standard', 'courant'), b('very casual', 'très familier')], [['Je ne sais pas.', 0], ['Je sais pas.', 1], ['Chais pas.', 2], ['Il n’y a personne.', 0], ['Y a personne.', 1], ['Y a pers’.', 2]]),
      mc(P.best, ['Je ne suis pas certain, mais il me semble que le budget est suffisant.', 'Chuis pas sûr, mais j’crois qu’ça passe.', 'Chais pas, quoi.', 'Ouais, bof, peut-être.'], { fr: 'Pendant une réunion avec la direction :' }),
      mc(P.best, ['Je sais pas, t’as une idée ?', 'Je ne le sais point, auriez-vous une idée ?', 'Je l’ignore, monsieur.', 'Il ne m’est pas possible de le savoir.'], { fr: 'Avec un ami qui vous demande où aller manger :' }),
      hear('Bon, j’sais pas, t’as qu’à venir chez moi, y a d’la place.', b('Listen. Who is the speaker probably talking to?', 'Écoutez. À qui parle probablement la personne ?'), [b('a close friend', 'un ami proche'), b('a job interviewer', 'un recruteur'), b('a customer', 'un client'), b('an audience at a conference', 'un public de colloque')], { voice: 'f' }),
      say('Je sais pas trop, mais y a pas de problème, on trouvera une solution.', 'I don’t really know, but no problem, we’ll find a solution.', { tip: b('Standard everyday level: no ne, but clear words.', 'Niveau courant : pas de ne, mais des mots clairs.') }),
    ],
    [
      b('Careful: full forms (exams, clients, presentations).', 'Soigné : formes complètes (examens, clients, présentations).'),
      b('Standard: drop ne, y a — normal with colleagues.', 'Courant : sans ne, y a — normal entre collègues.'),
      b('Very casual: chuis, chais pas — close friends only.', 'Très familier : chuis, chais pas — amis proches seulement.'),
    ],
    [['t’as qu’à', b('just… (you only have to)', 'tu n’as qu’à, suggestion familière')], ['la place', b('room, space', 'espace libre')], ['suffisant', b('sufficient', 'assez')]],
  ),
];
