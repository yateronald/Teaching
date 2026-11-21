import type { CourseAbout, Doc } from '../../types';
import { b, card, doc, gap, lesson, mc, P, pairs, say, sort, tip, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'An invitation to a birthday party, a message from your landlord, a confirmation from the dentist, an email from a colleague: everyday emails mix practical information and social conventions. This course teaches you to find the essentials (who, what, when, what to do), to recognise the level of formality from the greeting and the closing, and to answer an invitation politely, accepting or declining.',
    'Une invitation à un anniversaire, un message du propriétaire, une confirmation du dentiste, un courriel d’un collègue : les courriels du quotidien mêlent informations pratiques et codes sociaux. Ce cours vous apprend à trouver l’essentiel (qui, quoi, quand, que faire), à reconnaître le niveau de formalité grâce aux formules d’appel et de fin, et à répondre poliment à une invitation, pour accepter ou refuser.',
  ),
  outcomes: [
    b('Find the key information in an email', 'Trouver l’information essentielle dans un courriel'),
    b('Recognise formal and informal emails', 'Reconnaître un courriel formel ou informel'),
    b('Understand an invitation and its practical details', 'Comprendre une invitation et ses détails pratiques'),
    b('Accept or decline an invitation in writing', 'Accepter ou refuser une invitation par écrit'),
  ],
};

const INVITE: Doc = { look: 'email', title: b('An invitation', 'Une invitation'), text: 'Objet : Les 40 ans de Marc !\n\nSalut tout le monde,\nPour les 40 ans de Marc, on organise une petite fête surprise le samedi 22 février à partir de 19 h, chez nous (45, rue des Érables). Chacun apporte un plat ou une boisson. Surtout, ne dites rien à Marc !\nMerci de me répondre avant le 15.\n\nÀ bientôt,\nIsabelle' };
const LANDLORD: Doc = { look: 'email', title: b('From the landlord', 'Du propriétaire'), text: 'Objet : Travaux dans l’immeuble\n\nMadame, Monsieur,\nNous vous informons que des travaux de peinture auront lieu dans les couloirs du 3 au 7 mars, de 8 h à 17 h. Merci de ne rien laisser devant votre porte pendant cette période. Nous nous excusons pour le dérangement.\n\nCordialement,\nLa gestion de l’immeuble' };
const DENTIST: Doc = { look: 'email', title: b('An appointment', 'Un rendez-vous'), text: 'Objet : Confirmation de rendez-vous\n\nBonjour M. Nguyen,\nNous vous confirmons votre rendez-vous avec la Dre Côté le mardi 11 mars à 10 h 15. Merci d’arriver dix minutes à l’avance avec votre carte d’assurance. En cas d’empêchement, prévenez-nous au moins 24 heures à l’avance.\n\nClinique dentaire du Plateau' };

const C = 'r-emails-invitations';
export default [
  lesson(C, 1, ['personal-invitations', 'invitations-personnelles'],
    b('Personal invitations', 'Les invitations personnelles'),
    b('Understand an invitation: the event, the date, the place and what to bring.', 'Comprendre une invitation : l’événement, la date, le lieu et ce qu’il faut apporter.'),
    [b('Find the 5 W’s of an invitation', 'Trouver les informations clés d’une invitation'), b('Understand chacun apporte, à partir de', 'Comprendre chacun apporte, à partir de'), b('Find what you must do', 'Repérer ce qu’il faut faire')],
    13,
    [
      tip(b('The essentials first', 'L’essentiel d’abord'), b('In any practical email, look for **who** writes, **what** happens, **when**, **where** and **what you must do**. The **Objet** (subject) line already tells you a lot.', 'Dans tout courriel pratique, cherchez **qui** écrit, **quoi**, **quand**, **où** et **ce que vous devez faire**. La ligne **Objet** en dit déjà beaucoup.')),
      doc(INVITE, b('What kind of party is it?', 'De quel type de fête s’agit-il ?'), [b('A surprise birthday party', 'Une fête d’anniversaire surprise'), b('A wedding', 'Un mariage'), b('A work party', 'Une fête de bureau'), b('A housewarming', 'Une pendaison de crémaillère')]),
      doc(INVITE, b('What must the guests bring?', 'Que doivent apporter les invités ?'), [b('A dish or a drink', 'Un plat ou une boisson'), b('A present for Isabelle', 'Un cadeau pour Isabelle'), b('Nothing', 'Rien'), b('Chairs', 'Des chaises')]),
      doc(INVITE, b('What must they not do?', 'Que ne doivent-ils pas faire ?'), [b('Tell Marc about it', 'En parler à Marc'), b('Arrive after 7 p.m.', 'Arriver après 19 h'), b('Reply to Isabelle', 'Répondre à Isabelle'), b('Bring a drink', 'Apporter une boisson')]),
      pairs(P.match, [['à partir de 19 h', b('from 7 p.m. onwards', 'dès 19 h')], ['chacun apporte', b('everyone brings', 'tout le monde apporte')], ['une fête surprise', b('a surprise party', 'fête secrète')], ['avant le 15', b('before the 15th', 'au plus tard le 14')]]),
      gap(P.complete, 'La fête aura lieu ___ Isabelle, le samedi ___ février.', ['chez', '22']),
      say('Merci pour l’invitation ! Je viendrai avec plaisir et j’apporterai un dessert.', 'Thanks for the invitation! I’ll be happy to come and I’ll bring a dessert.'),
    ],
    [
      b('Find who, what, when, where and what to do.', 'Repérez qui, quoi, quand, où, et ce qu’il faut faire.'),
      b('à partir de = from… onwards; chacun apporte = everyone brings.', 'à partir de = dès ; chacun apporte = tout le monde apporte.'),
      b('The Objet line summarises the email.', 'La ligne Objet résume le courriel.'),
    ],
    [['un invité', b('a guest', 'personne invitée')], ['apporter', b('to bring', 'venir avec')], ['l’objet', b('the subject (of an email)', 'le titre du courriel')]],
  ),
  lesson(C, 2, ['practical-emails', 'courriels-pratiques'],
    b('Practical emails: landlord, clinic, services', 'Courriels pratiques : propriétaire, clinique, services'),
    b('Understand practical information and instructions in formal emails.', 'Comprendre les informations et les consignes des courriels formels.'),
    [b('Recognise formal greetings and closings', 'Reconnaître les formules formelles'), b('Find dates, times and instructions', 'Trouver les dates, heures et consignes'), b('Understand a cancellation policy', 'Comprendre une politique d’annulation')],
    13,
    [
      card(b('Formal or informal?', 'Formel ou informel ?'), b('**Formal**: Madame, Monsieur, / Bonjour M. Dupont, … Cordialement, / Veuillez agréer… **Informal**: Salut, / Coucou, … Bises, / À +. The greeting tells you the relationship.', '**Formel** : Madame, Monsieur, / Bonjour M. Dupont, … Cordialement, / Veuillez agréer… **Informel** : Salut, / Coucou, … Bises, / À +. La formule d’appel révèle la relation.')),
      doc(LANDLORD, b('What will happen in March?', 'Que va-t-il se passer en mars ?'), [b('The corridors will be painted.', 'Les couloirs seront repeints.'), b('The rent will go up.', 'Le loyer va augmenter.'), b('The water will be cut.', 'L’eau sera coupée.'), b('The building will be sold.', 'L’immeuble sera vendu.')]),
      doc(LANDLORD, b('What are tenants asked to do?', 'Que demande-t-on aux locataires ?'), [b('Leave nothing in front of their door', 'Ne rien laisser devant leur porte'), b('Paint their apartment', 'Peindre leur appartement'), b('Stay at home', 'Rester chez eux'), b('Call the management', 'Appeler la gestion')]),
      doc(DENTIST, b('When should Mr Nguyen arrive?', 'À quelle heure M. Nguyen doit-il arriver ?'), ['10 h 05', '10 h 15', '10 h', '9 h 15']),
      doc(DENTIST, b('What must he do if he cannot come?', 'Que doit-il faire s’il ne peut pas venir ?'), [b('Tell the clinic at least 24 hours before', 'Prévenir la clinique au moins 24 heures avant'), b('Come the next day', 'Venir le lendemain'), b('Pay a fine', 'Payer une amende'), b('Nothing', 'Rien')]),
      sort(b('Formal or informal?', 'Formel ou informel ?'), [b('formal', 'formel'), b('informal', 'informel')], [['Madame, Monsieur,', 0], ['Coucou !', 1], ['Cordialement,', 0], ['Bises,', 1], ['Veuillez agréer…', 0], ['À +', 1]]),
      pairs(P.match, [['en cas d’empêchement', b('if you cannot make it', 'si vous ne pouvez pas venir')], ['à l’avance', b('in advance', 'avant le moment prévu')], ['le dérangement', b('the inconvenience', 'la gêne')], ['un locataire', b('a tenant', 'personne qui loue')]]),
    ],
    [
      b('Formal: Madame, Monsieur / Cordialement. Informal: Salut / Bises.', 'Formel : Madame, Monsieur / Cordialement. Informel : Salut / Bises.'),
      b('en cas d’empêchement = if you cannot come.', 'en cas d’empêchement = si vous ne pouvez pas venir.'),
      b('Find the instruction: Merci de…, prévenez-nous…', 'Repérez la consigne : Merci de…, prévenez-nous…'),
    ],
    [['les travaux', b('construction work', 'réparations, rénovation')], ['la gestion', b('the management', 'l’administration')], ['prévenir', b('to let know', 'avertir')]],
  ),
  lesson(C, 3, ['accepting-and-declining', 'accepter-et-refuser'],
    b('Accepting and declining in writing', 'Accepter et refuser par écrit'),
    b('Answer an invitation with the right phrases and register.', 'Répondre à une invitation avec les bonnes formules et le bon registre.'),
    [b('Accept warmly', 'Accepter chaleureusement'), b('Decline politely with a reason', 'Refuser poliment en donnant une raison'), b('Write a short reply email', 'Écrire un court courriel de réponse')],
    13,
    [
      card(b('Useful phrases', 'Formules utiles'), b('**Accept**: Avec plaisir ! / Je serai ravi(e) de venir. / Je confirme ma présence. **Decline**: Malheureusement, je ne pourrai pas venir, car… / Je suis désolé(e), j’ai déjà un engagement. / Merci beaucoup pour l’invitation.', '**Accepter** : Avec plaisir ! / Je serai ravi(e) de venir. / Je confirme ma présence. **Refuser** : Malheureusement, je ne pourrai pas venir, car… / Je suis désolé(e), j’ai déjà un engagement. / Merci beaucoup pour l’invitation.')),
      sort(b('Accept or decline?', 'Accepter ou refuser ?'), [b('accept', 'accepter'), b('decline', 'refuser')], [['Avec plaisir !', 0], ['Malheureusement, je ne pourrai pas…', 1], ['Je confirme ma présence.', 0], ['J’ai déjà un engagement.', 1], ['Compte sur moi !', 0], ['Ce sera pour une prochaine fois.', 1]]),
      mc(P.best, ['Merci pour l’invitation ! Malheureusement, je ne pourrai pas venir, car je travaille ce soir-là.', 'Non. Je ne viens pas.', 'Je refuse votre fête.', 'Pas possible. Bisous.'], { fr: 'Vous refusez poliment l’invitation d’Isabelle :' }),
      mc(P.best, ['Madame, je vous confirme ma présence au rendez-vous du 11 mars.', 'Coucou ! J’arrive le 11, bises !', 'Salut la clinique ! À +', 'OK pour mardi. Mdr.'], { fr: 'Vous répondez à la clinique :' }),
      gap(P.completeText, 'Chère Isabelle, merci beaucoup pour ton ___ ! Je serai ___ de venir et j’___ une salade. À samedi !', ['invitation', 'ravie', 'apporterai']),
      write(b('Reply to the invitation.', 'Répondez à l’invitation.'), b('Answer Isabelle’s email. Say thank you, accept or decline, give a reason or say what you will bring, and close in a friendly way.', 'Répondez au courriel d’Isabelle. Remerciez, acceptez ou refusez, donnez une raison ou dites ce que vous apporterez, et terminez de façon amicale.'), 30, 60,
        [b('A greeting (Chère Isabelle, / Salut Isabelle,)', 'Une formule d’appel (Chère Isabelle, / Salut Isabelle,)'), b('Thank her for the invitation', 'Remercier pour l’invitation'), b('Accept or decline with a reason', 'Accepter ou refuser avec une raison'), b('A friendly closing', 'Une formule de fin amicale')],
        'Salut Isabelle,\nMerci beaucoup pour l’invitation ! Je serai ravie de venir fêter les 40 ans de Marc. J’apporterai une tarte aux pommes. Et promis, je ne dirai rien !\nÀ samedi,\nCamille',
        { phrases: ['Merci pour l’invitation', 'Avec plaisir', 'Malheureusement…', 'J’apporterai…', 'À samedi', 'Bises'] }),
      say('Je suis désolé, je ne pourrai pas venir, mais merci beaucoup pour l’invitation.', 'I’m sorry, I won’t be able to come, but thank you very much for the invitation.'),
    ],
    [
      b('Accept: Avec plaisir ! Je serai ravi(e) de venir. Je confirme ma présence.', 'Accepter : Avec plaisir ! Je serai ravi(e) de venir. Je confirme ma présence.'),
      b('Decline: Malheureusement, je ne pourrai pas…, car… / J’ai déjà un engagement.', 'Refuser : Malheureusement, je ne pourrai pas…, car… / J’ai déjà un engagement.'),
      b('Always thank: Merci pour l’invitation.', 'Remerciez toujours : Merci pour l’invitation.'),
    ],
    [['ravi', b('delighted', 'très content')], ['un engagement', b('a prior commitment', 'une obligation prévue')], ['compter sur', b('to count on', 'faire confiance à')]],
  ),
];
