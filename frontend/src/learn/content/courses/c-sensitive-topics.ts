import type { CourseAbout } from '../../types';
import { b, card, culture, dlg, lesson, mc, ord, P, pairs, say, sort, tip } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Money, politics, religion, health, a death in the family: some topics require great tact in any language. This course teaches you to recognise which subjects are delicate in French-speaking cultures, to raise or avoid them gracefully, to express sympathy and condolences, and to change the subject politely when a conversation becomes uncomfortable.',
    'Argent, politique, religion, santé, un décès dans la famille : certains sujets demandent beaucoup de tact dans toutes les langues. Ce cours vous apprend à reconnaître les sujets délicats dans les cultures francophones, à les aborder ou les éviter avec élégance, à exprimer votre sympathie et vos condoléances, et à changer de sujet poliment quand la conversation devient gênante.',
  ),
  outcomes: [
    b('Know which topics are delicate', 'Savoir quels sujets sont délicats'),
    b('Raise a sensitive topic carefully', 'Aborder un sujet sensible avec précaution'),
    b('Express sympathy and condolences', 'Exprimer sa sympathie et ses condoléances'),
    b('Change the subject gracefully', 'Changer de sujet avec élégance'),
  ],
};

const C = 'c-sensitive-topics';
export default [
  lesson(C, 1, ['delicate-subjects', 'les-sujets-delicats'],
    b('Delicate subjects and how to avoid them', 'Les sujets délicats et comment les éviter'),
    b('Know what not to ask, and how to decline a question you find too personal.', 'Savoir ce qu’il ne faut pas demander, et comment esquiver une question trop personnelle.'),
    [b('Know the taboo questions', 'Connaître les questions taboues'), b('Decline a personal question', 'Esquiver une question personnelle'), b('Stay polite and light', 'Rester poli et léger')],
    13,
    [
      culture(b('What not to ask', 'Ce qu’on ne demande pas'), b('In France and Québec, asking **« Combien tu gagnes ? »**, **« Tu as payé ta maison combien ? »**, **« Tu votes pour qui ? »** or **« Pourquoi tu n’as pas d’enfants ? »** is generally seen as intrusive, especially with people you don’t know well. Money is particularly discreet in France.', 'En France et au Québec, demander **« Combien tu gagnes ? »**, **« Tu as payé ta maison combien ? »**, **« Tu votes pour qui ? »** ou **« Pourquoi tu n’as pas d’enfants ? »** est généralement jugé indiscret, surtout avec des gens qu’on connaît peu. L’argent est particulièrement discret en France.')),
      card(b('Declining a question', 'Esquiver une question'), b('**Oh, ça, c’est mon petit secret !** (with a smile) · **Disons que je préfère garder ça pour moi.** · **C’est un peu personnel, si ça ne te dérange pas.** · **Vaste question !** (and move on)', '**Oh, ça, c’est mon petit secret !** (avec un sourire) · **Disons que je préfère garder ça pour moi.** · **C’est un peu personnel, si ça ne te dérange pas.** · **Vaste question !** (et on passe à autre chose)')),
      sort(b('Usually fine or delicate with a new acquaintance?', 'Plutôt acceptable ou délicat avec une nouvelle connaissance ?'), [b('usually fine', 'plutôt acceptable'), b('delicate', 'délicat')], [['Tu fais quoi dans la vie ?', 0], ['Tu gagnes combien ?', 1], ['Tu es d’où ?', 0], ['Tu votes pour qui ?', 1], ['Tu as des projets de vacances ?', 0], ['Pourquoi tu n’es pas marié ?', 1]]),
      mc(P.best, ['Disons que je préfère garder ça pour moi, mais je suis content de mon nouveau poste !', 'Ça ne te regarde pas !', 'Et toi, tu gagnes combien, hein ?', 'Je refuse de te parler.'], { fr: 'Un nouveau collègue vous demande combien vous gagnez :' }),
      ord(P.order, 'C’est un peu personnel, si ça ne te dérange pas.', { tr: 'It’s a bit personal, if you don’t mind.' }),
      pairs(P.match, [['indiscret', b('intrusive', 'trop curieux')], ['garder pour soi', b('to keep to oneself', 'ne pas dire')], ['Vaste question !', b('That’s a big question!', 'esquive amusée')], ['Ça ne te regarde pas.', b('It’s none of your business. (rude)', 'réponse sèche')]]),
      say('Oh, ça, c’est mon petit secret ! Disons que je préfère garder ça pour moi.', 'Oh, that’s my little secret! Let’s say I’d rather keep that to myself.'),
    ],
    [
      b('Avoid: salary, prices paid, votes, children, religion with new contacts.', 'À éviter : salaire, prix payés, vote, enfants, religion avec de nouveaux contacts.'),
      b('Decline lightly: Disons que je préfère garder ça pour moi.', 'Esquiver légèrement : Disons que je préfère garder ça pour moi.'),
      b('« Ça ne te regarde pas » is rude: avoid it.', '« Ça ne te regarde pas » est impoli : évitez-le.'),
    ],
    [['un tabou', b('a taboo', 'sujet interdit')], ['gagner (de l’argent)', b('to earn', 'recevoir un salaire')], ['une connaissance', b('an acquaintance', 'personne qu’on connaît un peu')]],
  ),
  lesson(C, 2, ['sympathy-and-condolences', 'sympathie-et-condoleances'],
    b('Sympathy and condolences', 'Sympathie et condoléances'),
    b('Find the right words when someone is ill, has lost a job or a loved one.', 'Trouver les mots justes quand quelqu’un est malade, a perdu son emploi ou un proche.'),
    [b('Show sympathy for an illness or a problem', 'Montrer sa sympathie pour une maladie ou un problème'), b('Offer condolences', 'Présenter ses condoléances'), b('Offer concrete help', 'Proposer une aide concrète')],
    13,
    [
      card(b('Sympathy', 'La sympathie'), b('Illness or difficulty: **Je suis vraiment désolé(e) d’apprendre ça.** · **Je pense bien à toi.** · **Prends soin de toi.** Bereavement: **Toutes mes condoléances.** · **Je suis de tout cœur avec toi.** · **Je partage ta peine.** Help: **Si je peux faire quoi que ce soit, n’hésite pas.** · **Je peux t’apporter un repas cette semaine ?**', 'Maladie ou difficulté : **Je suis vraiment désolé(e) d’apprendre ça.** · **Je pense bien à toi.** · **Prends soin de toi.** Deuil : **Toutes mes condoléances.** · **Je suis de tout cœur avec toi.** · **Je partage ta peine.** Aide : **Si je peux faire quoi que ce soit, n’hésite pas.** · **Je peux t’apporter un repas cette semaine ?**')),
      tip(b('Avoid easy comfort', 'Évitez le réconfort facile'), b('« Ce n’est pas grave », « Il faut voir le bon côté » or « Je sais exactement ce que tu ressens » can hurt. Simple presence works better: **« Je suis là. »**', '« Ce n’est pas grave », « Il faut voir le bon côté » ou « Je sais exactement ce que tu ressens » peuvent blesser. Une présence simple fonctionne mieux : **« Je suis là. »**')),
      mc(P.best, ['Toutes mes condoléances. Je suis de tout cœur avec toi. Si je peux faire quoi que ce soit, dis-le-moi.', 'Ce n’est pas grave, ça arrive à tout le monde.', 'Il faut voir le bon côté des choses.', 'Ah. Tu viens à la réunion demain ?'], { fr: 'Votre collègue vient de perdre son père :' }),
      mc(P.best, ['Je suis vraiment désolée d’apprendre ça. Je pense bien à toi, prends soin de toi.', 'Moi aussi, j’ai eu pire.', 'Tu aurais dû faire plus de sport.', 'Tant mieux, tu vas te reposer.'], { fr: 'Une amie vous annonce qu’elle doit être opérée :' }),
      sort(b('Helpful or hurtful?', 'Aidant ou blessant ?'), [b('helpful', 'aidant'), b('can hurt', 'peut blesser')], [['Je suis là si tu as besoin.', 0], ['Ce n’est pas grave.', 1], ['Je pense bien à toi.', 0], ['Je sais exactement ce que tu ressens.', 1], ['Je peux t’apporter un repas ?', 0], ['Il faut tourner la page.', 1]]),
      pairs(P.match, [['les condoléances', b('condolences', 'sympathie pour un deuil')], ['un deuil', b('a bereavement', 'perte d’un proche')], ['un proche', b('a loved one, a relative', 'membre de la famille ou ami')], ['de tout cœur', b('wholeheartedly', 'sincèrement')]]),
      say('Je suis vraiment désolé d’apprendre ça. Si je peux faire quoi que ce soit, n’hésite surtout pas.', 'I’m really sorry to hear that. If I can do anything at all, please don’t hesitate.'),
    ],
    [
      b('Sympathy: Je suis désolé(e) d’apprendre ça. Je pense bien à toi.', 'Sympathie : Je suis désolé(e) d’apprendre ça. Je pense bien à toi.'),
      b('Bereavement: Toutes mes condoléances. Je suis de tout cœur avec toi.', 'Deuil : Toutes mes condoléances. Je suis de tout cœur avec toi.'),
      b('Offer concrete help; avoid « ce n’est pas grave ».', 'Proposez une aide concrète ; évitez « ce n’est pas grave ».'),
    ],
    [['être opéré', b('to have surgery', 'subir une opération')], ['la peine', b('grief, sorrow', 'tristesse profonde')], ['tourner la page', b('to move on', 'passer à autre chose')]],
  ),
  lesson(C, 3, ['raising-and-changing-the-subject', 'aborder-et-changer-de-sujet'],
    b('Raising a topic carefully, and changing the subject', 'Aborder un sujet avec précaution, et changer de sujet'),
    b('Ask permission before a delicate topic, and steer away from tension.', 'Demander la permission avant un sujet délicat, et s’éloigner des tensions.'),
    [b('Ask before raising a topic', 'Demander avant d’aborder un sujet'), b('Calm a heated discussion', 'Calmer une discussion animée'), b('Change the subject smoothly', 'Changer de sujet en douceur')],
    13,
    [
      card(b('Raising carefully', 'Aborder avec précaution'), b('**Je peux te poser une question un peu personnelle ?** · **Je ne sais pas si tu as envie d’en parler, mais…** · **Tu me dis si je suis indiscret(ète).** Calm: **On ne sera sans doute pas d’accord là-dessus, et ce n’est pas grave.** Change subject: **Bon, parlons de choses plus légères !** · **Au fait, …** · **Ça me fait penser à…**', '**Je peux te poser une question un peu personnelle ?** · **Je ne sais pas si tu as envie d’en parler, mais…** · **Tu me dis si je suis indiscret(ète).** Calmer : **On ne sera sans doute pas d’accord là-dessus, et ce n’est pas grave.** Changer de sujet : **Bon, parlons de choses plus légères !** · **Au fait, …** · **Ça me fait penser à…**')),
      mc(P.best, ['Je ne sais pas si tu as envie d’en parler, mais comment ça se passe avec ta mère ?', 'Alors, ta mère, elle est toujours malade ou quoi ?', 'Raconte-moi tout sur ta mère, maintenant.', 'Et ta mère, elle est toujours à l’hôpital ? Raconte !'], { fr: 'Vous voulez prendre des nouvelles de la mère malade d’un ami :' }),
      mc(P.best, ['On ne sera sans doute pas d’accord là-dessus, et ce n’est pas grave. Bon, parlons de choses plus légères : qui veut du dessert ?', 'Vous êtes tous ignorants.', 'Taisez-vous, c’est mon repas.', 'Celui qui n’est pas d’accord peut partir.'], { fr: 'Au repas de famille, la discussion sur la politique devient tendue :' }),
      dlg(b('A tense dinner', 'Un dîner tendu'), undefined, [['Oncle Gérard', 'm'], ['Vous', 'f']], [
        [0, 'De toute façon, ces nouvelles lois, c’est n’importe quoi, et ceux qui votent pour sont des idiots !', 'Anyway, these new laws are nonsense, and the people who vote for them are idiots!'],
        [1, { options: ['On ne sera sans doute pas d’accord là-dessus, et ce n’est pas grave. Au fait, tu as fini de rénover ta cuisine ?', 'C’est toi l’idiot !', 'Tu as raison, tous des idiots.'] }],
        [0, 'Ah, la cuisine ! Il reste le carrelage, une vraie galère.', 'Oh, the kitchen! The tiles are left, a real hassle.'],
        [1, { options: ['Ça me fait penser : mon voisin est carreleur, je peux te donner son numéro !', 'Bon, et la politique, alors ?', 'Je m’en fiche de ta cuisine.'] }],
      ]),
      pairs(P.match, [['Au fait,…', b('By the way,…', 'pour changer de sujet')], ['Ça me fait penser à…', b('That reminds me of…', 'transition')], ['une galère', b('a hassle (informal)', 'chose pénible')], ['animé', b('heated, lively', 'vif')]]),
      say('Bon, on ne sera pas d’accord là-dessus, et ce n’est pas grave. Parlons de choses plus légères !', 'Well, we won’t agree on that, and that’s fine. Let’s talk about lighter things!'),
    ],
    [
      b('Ask first: Je peux te poser une question un peu personnelle ?', 'Demandez d’abord : Je peux te poser une question un peu personnelle ?'),
      b('Calm: On ne sera pas d’accord, et ce n’est pas grave.', 'Calmer : On ne sera pas d’accord, et ce n’est pas grave.'),
      b('Change: Au fait… Ça me fait penser à… Parlons de choses plus légères.', 'Changer : Au fait… Ça me fait penser à… Parlons de choses plus légères.'),
    ],
    [['le carrelage', b('tiling', 'carreaux au sol ou au mur')], ['rénover', b('to renovate', 'remettre à neuf')], ['tendu', b('tense', 'avec de la tension')]],
  ),
];
