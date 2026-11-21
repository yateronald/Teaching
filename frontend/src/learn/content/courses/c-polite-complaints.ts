import type { CourseAbout } from '../../types';
import { b, card, dlg, gap, lesson, mc, ord, P, pairs, say, sort, tip } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'A cold dish, a wrong bill, a broken heater, a parcel that never arrived: complaining in French is a skill, and the tone matters as much as the words. This course teaches you to explain a problem clearly, stay calm and polite, ask for a concrete solution and insist firmly if needed, in a shop, a restaurant, a hotel or on the phone.',
    'Un plat froid, une addition erronée, un chauffage en panne, un colis jamais arrivé : se plaindre en français est une compétence, et le ton compte autant que les mots. Ce cours vous apprend à exposer un problème clairement, à rester calme et poli, à demander une solution concrète et à insister fermement si nécessaire, en magasin, au restaurant, à l’hôtel ou au téléphone.',
  ),
  outcomes: [
    b('Explain a problem clearly and calmly', 'Exposer un problème clairement et calmement'),
    b('Ask for a refund, an exchange or a repair', 'Demander un remboursement, un échange ou une réparation'),
    b('Insist politely when the answer is no', 'Insister poliment quand la réponse est non'),
    b('Thank and close the exchange', 'Remercier et conclure l’échange'),
  ],
};

const C = 'c-polite-complaints';
export default [
  lesson(C, 1, ['explaining-the-problem', 'exposer-le-probleme'],
    b('Explaining the problem', 'Exposer le problème'),
    b('Open politely, then describe what is wrong in one or two clear sentences.', 'Commencer poliment, puis décrire ce qui ne va pas en une ou deux phrases claires.'),
    [b('Open a complaint politely', 'Ouvrir une réclamation poliment'), b('Describe what is wrong', 'Décrire ce qui ne va pas'), b('Give the key facts', 'Donner les faits essentiels')],
    13,
    [
      card(b('A polite opening', 'Une ouverture polie'), b('Start softly: **Excusez-moi, je crois qu’il y a un problème…** · **Je suis désolé de vous déranger, mais…** Then the fact: **Mon plat est froid.** · **Il y a une erreur sur l’addition.** · **Le chauffage ne marche pas.** · **J’ai acheté ce téléphone hier et il ne s’allume plus.**', 'Commencez en douceur : **Excusez-moi, je crois qu’il y a un problème…** · **Je suis désolé de vous déranger, mais…** Puis le fait : **Mon plat est froid.** · **Il y a une erreur sur l’addition.** · **Le chauffage ne marche pas.** · **J’ai acheté ce téléphone hier et il ne s’allume plus.**'), {
        ex: [['Excusez-moi, je crois qu’il y a une erreur sur l’addition.', 'Excuse me, I think there’s a mistake on the bill.'], ['Le chauffage de ma chambre ne marche pas.', 'The heating in my room doesn’t work.']],
      }),
      tip(b('Facts, not blame', 'Des faits, pas des reproches'), b('Say **what** is wrong, not **who** is wrong. « Vous avez fait une erreur ! » sounds aggressive; **« Il y a une erreur, je crois »** opens the door to a solution.', 'Dites **ce qui** ne va pas, pas **qui** a tort. « Vous avez fait une erreur ! » paraît agressif ; **« Il y a une erreur, je crois »** ouvre la porte à une solution.')),
      mc(P.best, ['Excusez-moi, je crois qu’il y a un problème : on m’a compté deux cafés, mais j’en ai pris un seul.', 'Vous m’avez volé un café !', 'C’est n’importe quoi, cette addition.', 'Je ne paie pas.'], { fr: 'L’addition est fausse :' }),
      mc(P.best, ['Bonsoir, je suis désolée de vous déranger, mais la douche de la chambre 12 ne marche pas.', 'Votre hôtel est nul.', 'Douche cassée, réparez !', 'Je veux parler au patron immédiatement.'], { fr: 'À la réception de l’hôtel :' }),
      ord(P.order, 'Je crois qu’il y a une erreur sur la facture.', { tr: 'I think there’s a mistake on the invoice.' }),
      pairs(P.match, [['ne marche pas', b('doesn’t work', 'est en panne')], ['une erreur', b('a mistake', 'quelque chose de faux')], ['froid', b('cold', 'pas chaud')], ['abîmé', b('damaged', 'en mauvais état')]]),
      say('Excusez-moi, je suis désolé de vous déranger, mais mon plat est froid.', 'Excuse me, I’m sorry to bother you, but my dish is cold.'),
    ],
    [
      b('Open softly: Excusez-moi, je crois qu’il y a un problème…', 'Commencez en douceur : Excusez-moi, je crois qu’il y a un problème…'),
      b('State the fact: … ne marche pas, … est abîmé, il y a une erreur.', 'Énoncez le fait : … ne marche pas, … est abîmé, il y a une erreur.'),
      b('Describe what is wrong, don’t blame.', 'Décrivez ce qui ne va pas, n’accusez pas.'),
    ],
    [['l’addition (f)', b('the bill (restaurant)', 'ce qu’on paie au restaurant')], ['la facture', b('the invoice', 'document de paiement')], ['déranger', b('to bother', 'interrompre')]],
  ),
  lesson(C, 2, ['asking-for-a-solution', 'demander-une-solution'],
    b('Asking for a solution', 'Demander une solution'),
    b('Ask clearly for what you want: a refund, an exchange, a repair or a new dish.', 'Demander clairement ce que vous voulez : remboursement, échange, réparation ou nouveau plat.'),
    [b('Ask for a refund or an exchange', 'Demander un remboursement ou un échange'), b('Ask for a repair or replacement', 'Demander une réparation ou un remplacement'), b('Use the conditional to soften', 'Adoucir avec le conditionnel')],
    13,
    [
      card(b('What do you want?', 'Que voulez-vous ?'), b('**Est-ce que je pourrais être remboursé(e) ?** · **Je voudrais l’échanger.** · **Vous pourriez m’envoyer quelqu’un pour le réparer ?** · **Serait-il possible de changer de chambre ?** · **Vous pourriez le réchauffer, s’il vous plaît ?** The conditional (**pourrais, voudrais, serait**) keeps it polite.', '**Est-ce que je pourrais être remboursé(e) ?** · **Je voudrais l’échanger.** · **Vous pourriez m’envoyer quelqu’un pour le réparer ?** · **Serait-il possible de changer de chambre ?** · **Vous pourriez le réchauffer, s’il vous plaît ?** Le conditionnel (**pourrais, voudrais, serait**) garde la politesse.')),
      sort(b('What is the customer asking for?', 'Que demande le client ?'), [b('a refund', 'un remboursement'), b('an exchange', 'un échange'), b('a repair', 'une réparation')], [['Je voudrais récupérer mon argent.', 0], ['Je peux le changer contre une autre taille ?', 1], ['Vous pourriez envoyer un technicien ?', 2], ['Est-ce que je peux être remboursée ?', 0], ['J’aimerais le même modèle en bleu.', 1], ['Il faudrait réparer la fenêtre.', 2]]),
      mc(P.best, ['Serait-il possible de changer de chambre ? Celle-ci est très bruyante.', 'Changez-moi de chambre.', 'Je veux une autre chambre, sinon je pars sans payer.', 'Chambre bruyante, pas content.'], { fr: 'Votre chambre d’hôtel donne sur une rue très bruyante :' }),
      gap(P.complete, 'Ce pull a un trou. Est-ce que je ___ l’échanger ou être ___ ?', ['pourrais', ['remboursé', 'remboursée']]),
      dlg(b('In a shop', 'Dans un magasin'), b('You bought a kettle yesterday. It leaks.', 'Vous avez acheté une bouilloire hier. Elle fuit.'), [['Vendeur', 'm'], ['Vous', 'f']], [
        [0, 'Bonjour, je peux vous aider ?', 'Hello, can I help you?'],
        [1, { options: ['Oui, j’ai acheté cette bouilloire hier et elle fuit. Est-ce que je pourrais l’échanger ?', 'Votre bouilloire est nulle !', 'Oui. Bouilloire. Fuite.'] }],
        [0, 'Je suis désolé. Vous avez le ticket de caisse ?', 'I’m sorry. Do you have the receipt?'],
        [1, { options: ['Oui, le voici.', 'Non, et alors ?', 'C’est votre problème.'] }],
        [0, 'Parfait. Je vous en donne une neuve tout de suite.', 'Perfect. I’ll give you a new one right away.'],
      ]),
      pairs(P.match, [['être remboursé', b('to get a refund', 'récupérer son argent')], ['échanger', b('to exchange', 'changer contre un autre')], ['le ticket de caisse', b('the receipt', 'preuve d’achat')], ['fuir', b('to leak', 'laisser couler l’eau')]]),
      say('Est-ce que je pourrais l’échanger, ou être remboursée, s’il vous plaît ?', 'Could I exchange it, or get a refund, please?'),
    ],
    [
      b('Refund: Est-ce que je pourrais être remboursé(e) ?', 'Remboursement : Est-ce que je pourrais être remboursé(e) ?'),
      b('Exchange: Je voudrais l’échanger. Repair: Vous pourriez le réparer ?', 'Échange : Je voudrais l’échanger. Réparation : Vous pourriez le réparer ?'),
      b('The conditional keeps a request polite.', 'Le conditionnel garde une demande polie.'),
    ],
    [['une bouilloire', b('a kettle', 'appareil pour chauffer l’eau')], ['bruyant', b('noisy', 'qui fait du bruit')], ['neuf, neuve', b('brand new', 'jamais utilisé')]],
  ),
  lesson(C, 3, ['insisting-politely', 'insister-poliment'],
    b('Insisting politely, and closing', 'Insister poliment et conclure'),
    b('When the answer is no: stay calm, repeat your request, ask for someone else, then thank.', 'Quand la réponse est non : rester calme, répéter la demande, demander quelqu’un d’autre, puis remercier.'),
    [b('Stay calm and repeat', 'Rester calme et répéter'), b('Ask for a manager or a written answer', 'Demander un responsable ou une réponse écrite'), b('Thank and close', 'Remercier et conclure')],
    13,
    [
      card(b('Firm but polite', 'Ferme mais poli'), b('**Je comprends, mais…** · **Je me permets d’insister : le produit est sous garantie.** · **Est-ce que je pourrais parler à un responsable ?** · **Vous pourriez me le confirmer par écrit ?** Close: **Merci de votre aide.** · **Je vous remercie pour votre compréhension.**', '**Je comprends, mais…** · **Je me permets d’insister : le produit est sous garantie.** · **Est-ce que je pourrais parler à un responsable ?** · **Vous pourriez me le confirmer par écrit ?** Conclure : **Merci de votre aide.** · **Je vous remercie pour votre compréhension.**')),
      tip(b('« Je comprends, mais… »', '« Je comprends, mais… »'), b('Acknowledge the other person first, then hold your position. It lowers the tension and makes a solution more likely.', 'Reconnaissez d’abord la position de l’autre, puis maintenez la vôtre. La tension baisse et une solution devient plus probable.')),
      mc(P.best, ['Je comprends, mais je me permets d’insister : il est encore sous garantie.', 'Vous mentez !', 'D’accord, tant pis, au revoir.', 'Je vais tout casser.'], { fr: '— Désolé, on ne fait pas d’échange après sept jours.' }),
      mc(P.best, ['Est-ce que je pourrais parler à un responsable, s’il vous plaît ?', 'Appelez votre chef, vite !', 'Vous ne servez à rien.', 'Je reviendrai jamais.'], { fr: 'L’employé ne peut rien faire pour vous :' }),
      dlg(b('On the phone with a delivery service', 'Au téléphone avec un service de livraison'), undefined, [['Conseiller', 'm'], ['Vous', 'f']], [
        [0, 'Selon notre système, votre colis a été livré hier.', 'According to our system, your parcel was delivered yesterday.'],
        [1, { options: ['Je comprends, mais je ne l’ai pas reçu. Est-ce que vous pourriez ouvrir une enquête ?', 'Votre système est nul.', 'Ah bon. Tant pis.'] }],
        [0, 'Je peux ouvrir une réclamation. La réponse prendra cinq jours.', 'I can open a claim. The answer will take five days.'],
        [1, { options: ['Très bien. Vous pourriez me confirmer le numéro de la réclamation par courriel ?', 'Cinq jours ? C’est ridicule, je raccroche !', 'Non.'] }],
        [0, 'Bien sûr, je vous l’envoie maintenant.', 'Of course, I’m sending it to you now.'],
        [1, { options: ['Merci beaucoup pour votre aide. Bonne journée !', 'Enfin !', 'Il était temps.'] }],
      ], true),
      pairs(P.match, [['sous garantie', b('under warranty', 'couvert par la garantie')], ['un responsable', b('a manager', 'personne en charge')], ['une réclamation', b('a complaint, a claim', 'plainte officielle')], ['par écrit', b('in writing', 'sur papier ou courriel')]]),
      say('Je comprends, mais je me permets d’insister. Est-ce que je pourrais parler à un responsable ?', 'I understand, but I must insist. Could I speak to a manager?'),
    ],
    [
      b('Je comprends, mais… / Je me permets d’insister.', 'Je comprends, mais… / Je me permets d’insister.'),
      b('Ask for a manager or a written confirmation.', 'Demandez un responsable ou une confirmation écrite.'),
      b('Always thank at the end, even if you are unhappy.', 'Remerciez toujours à la fin, même si vous n’êtes pas satisfait.'),
    ],
    [['un colis', b('a parcel', 'paquet envoyé')], ['livrer', b('to deliver', 'apporter un colis')], ['raccrocher', b('to hang up', 'terminer l’appel')]],
  ),
];
