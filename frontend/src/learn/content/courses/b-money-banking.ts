import type { CourseAbout } from '../../types';
import { b, card, culture, dict, dlg, doc, gap, hear, lesson, mc, ord, P, pairs, say, sort, trap, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Paying at a market stall, splitting a group bill without confusion, returning a sweater that does not fit and keeping track of monthly expenses all rely on clear everyday French. This A2 course teaches you payment methods (card, contactless, cash, bank transfer), the difference between l’argent and la monnaie, returns and store credit, and how to talk about saving and budgeting.',
    'Payer au marché, partager une addition entre amis, rapporter un vêtement qui ne va pas et suivre ses dépenses mensuelles demandent un français simple et précis. Ce cours A2 vous apprend les moyens de paiement (carte, sans contact, espèces, virement), la différence entre l’argent et la monnaie, les remboursements ou avoirs, et comment parler d’épargne et de budget.',
  ),
  outcomes: [
    b('Pay by card, contactless, transfer or cash', 'Payer par carte, sans contact, virement ou espèces'),
    b('Avoid the l’argent vs la monnaie trap', 'Éviter le piège entre l’argent et la monnaie'),
    b('Split a bill and ask for a refund or credit', 'Partager une addition et demander remboursement ou avoir'),
    b('Discuss fixed expenses and monthly savings', 'Parler de dépenses fixes et d’épargne mensuelle'),
  ],
};

const C = 'b-money-banking';
export default [
  lesson(C, 1, ['cards-cash-and-atm', 'carte-especes-et-distributeur'],
    b('Cards, cash & ATM', 'Carte, espèces et distributeur'),
    b('Pay at a counter, use cash or contactless and handle small change.', 'Payer au comptoir, utiliser espèces ou sans contact et gérer la monnaie.'),
    [b('Name payment methods', 'Nommer les moyens de paiement'), b('Tell l’argent from la monnaie', 'Distinguer l’argent et la monnaie'), b('Use an ATM and break a note', 'Retirer et demander de la monnaie')],
    13,
    [
      card(b('Everyday payments', 'Les paiements du quotidien'), b('Ways to pay: **par carte bancaire, sans contact, en espèces, par virement**. At the till: **composer son code, le paiement est refusé, le plafond de la carte**. At the bank/ATM: **un distributeur automatique, retirer de l’argent, avoir la monnaie sur vingt euros**.', 'Moyens de paiement : **par carte bancaire, sans contact, en espèces, par virement**. À la caisse : **composer son code, le paiement est refusé, le plafond de la carte**. À la banque : **un distributeur automatique, retirer de l’argent, avoir la monnaie sur vingt euros**.'), {
        ex: [['Je n’ai pas d’espèces sur moi, je peux payer sans contact ?', 'I don’t have cash on me, can I pay contactless?'], ['Excusez-moi, vous avez la monnaie sur un billet de vingt euros ?', 'Excuse me, do you have change for a twenty-euro note?']],
      }),
      culture(b('Payment habits across regions', 'Habitudes de paiement'), b('In **France**, small bakeries or cafés sometimes require a minimum (e.g. 5 € or 10 €) for cards, though contactless is now widespread. In **Québec**, **Interac** debit/e-transfers are standard almost everywhere, even for very small amounts.', 'En **France**, certains petits commerces demandent parfois un minimum (5 € ou 10 €) pour la carte, même si le sans-contact est très répandu. Au **Québec**, le paiement et le virement **Interac** fonctionnent presque partout, même pour de très petites sommes.'), { variant: 'culture' }),
      trap(b('L’argent vs la monnaie', 'L’argent ou la monnaie'), b('**L’argent** = money in general (*gagner de l’argent, retirer de l’argent*). **La monnaie** = coins or change given back (*avoir de la monnaie, rendre la monnaie*). Never say *« J’ai besoin de monnaie »* to mean general money!', '**L’argent** = money en général (*gagner de l’argent, retirer de l’argent*). **La monnaie** = pièces ou somme rendue (*avoir de la monnaie, rendre la monnaie*). Ne dites pas *« J’ai besoin de monnaie »* pour parler de revenus !')),
      dlg(b('At the market stall', 'Au stand du marché'), undefined, [['Commerçante', 'f2'], ['Vous', 'm']], [
        [0, 'Ça vous fera six euros cinquante, s’il vous plaît.', 'That will be six euros fifty, please.'],
        [1, { options: ['Je peux payer par carte sans contact ?', 'Je paie pas avec monnaie.', 'Donnez-moi six euros.'] }],
        [0, 'Désolée, je prends la carte seulement à partir de dix euros. Vous avez des espèces ?', 'Sorry, I only take card from ten euros up. Do you have cash?'],
        [1, { options: ['Oui, voici un billet de vingt euros. Vous avez la monnaie ?', 'Non, je garde le billet.', 'Oui, dix euros de plafond.'] }],
        [0, 'Bien sûr ! Et voilà treize euros cinquante de monnaie. Bonne journée !', 'Of course! And here is thirteen euros fifty change. Have a nice day!'],
      ]),
      pairs(P.match, [['en espèces', b('in cash', 'billets et pièces')], ['un virement', b('a bank transfer', 'envoi d’argent entre comptes')], ['un distributeur', b('an ATM / cash machine', 'machine pour retirer')], ['le plafond', b('card spending limit', 'montant maximum autorisé')]]),
      gap(P.complete, 'Désolé, je n’ai pas d’___ sur moi ; je peux payer sans ___ ?', ['espèces', 'contact'], { choices: [['espèces', 'monnaie', 'billet'], ['contact', 'code', 'carte']] }),
      say('Excusez-moi, est-ce que vous avez la monnaie sur un billet de vingt euros ?', 'Excuse me, do you have change for a twenty-euro note?'),
    ],
    [
      b('payer par carte / sans contact / en espèces / par virement.', 'payer par carte / sans contact / en espèces / par virement.'),
      b('l’argent (money) ≠ la monnaie (coins / change).', 'l’argent ≠ la monnaie (pièces / somme rendue).'),
      b('Vous avez la monnaie sur… ? · retirer au distributeur.', 'Vous avez la monnaie sur… ? · retirer au distributeur.'),
    ],
    [['en espèces', b('in cash', 'en billets et en pièces')], ['un virement', b('a bank transfer', 'transfert d’un compte à un autre')], ['retirer', b('to withdraw (cash)', 'prendre des billets au distributeur')]],
  ),
  lesson(C, 2, ['splitting-bills-and-returns', 'partager-et-se-faire-rembourser'],
    b('Splitting bills & returns', 'Partager une note et se faire rembourser'),
    b('Split expenses cleanly and ask for a refund, exchange or store credit.', 'Partager une dépense simplement et demander un remboursement, un échange ou un avoir.'),
    [b('Split a bill evenly or separately', 'Partager une note ou payer séparément'), b('Ask for a refund or credit note', 'Demander un remboursement ou un avoir'), b('Present a receipt politely', 'Présenter un ticket de caisse')],
    13,
    [
      card(b('Splitting & returning', 'Partager et retourner un article'), b('Splitting: **On partage l’addition en deux ? · Chacun paie sa part. · Je règle tout et tu me fais un virement.** Returning an item: **Je voudrais rendre / échanger cet article. · Voici le ticket de caisse. · Est-ce que je peux avoir un remboursement ou un avoir ?**', 'Partager : **On partage l’addition en deux ? · Chacun paie sa part. · Je règle tout et tu me fais un virement.** Retourner un article : **Je voudrais rendre / échanger cet article. · Voici le ticket de caisse. · Est-ce que je peux avoir un remboursement ou un avoir ?**'), {
        ex: [['Vous voulez un remboursement sur votre carte ou un avoir ?', 'Do you want a refund to your card or store credit?'], ['On paie séparément, chacun sa part, s’il vous plaît.', 'We’re paying separately, each our own share, please.']],
      }),
      hear('Bonjour, j’ai acheté ce pull samedi, mais la taille ne convient pas. Comme je n’ai pas vu d’autre modèle, est-ce que je peux être remboursée sur ma carte, s’il vous plaît ?', b('What does the customer ask for?', 'Que demande la cliente ?'), [b('a refund to her card', 'un remboursement sur sa carte'), b('a larger size in blue', 'une taille plus grande en bleu'), b('a gift voucher for a friend', 'un bon cadeau pour une amie'), b('cash back without a receipt', 'des espèces sans ticket')], { voice: 'f' }),
      sort(b('Splitting a bill or returning an item?', 'Partage ou retour en magasin ?'), [b('splitting a bill', 'partager une dépense'), b('return or exchange', 'retour ou échange')], [['On divise par trois ?', 0], ['Je voudrais un avoir.', 1], ['Je te fais un virement ce soir.', 0], ['Vous avez le ticket de caisse ?', 1], ['Chacun règle ce qu’il a pris.', 0], ['Cet article est sous garantie.', 1]]),
      mc(P.best, ['Nous allons payer séparément : chacun sa part, s’il vous plaît.', 'Trois additions différentes ou rien !', 'On ne paie pas ensemble.', 'Divisez tout vous-même.'], { fr: 'Au restaurant, trois amis veulent payer chacun ce qu’ils ont commandé :' }),
      ord(P.order, 'Je règle toute la note et vous me faites un virement demain.', { tr: 'I’ll pay the whole bill and you transfer me your share tomorrow.', extra: ['espèces'] }),
      dict('Vous préférez un remboursement sur votre carte ou un avoir valable six mois ?', { voice: 'm' }),
      say('On partage en deux ? Je paie maintenant et tu me fais un virement ce soir.', 'Shall we split it in half? I’ll pay now and you send me a transfer tonight.'),
    ],
    [
      b('On partage en deux ? · Chacun sa part.', 'On partage en deux ? · Chacun sa part.'),
      b('un remboursement (money back) vs un avoir (store credit).', 'un remboursement (argent rendu) / un avoir (bon d’achat).'),
      b('Garder le ticket de caisse facilite l’échange.', 'Garder le ticket de caisse facilite l’échange.'),
    ],
    [['un avoir', b('a credit note / store credit', 'bon valable en magasin')], ['le ticket de caisse', b('the receipt', 'preuve d’achat')], ['régler', b('to settle, pay', 'payer une note')]],
  ),
  lesson(C, 3, ['managing-a-budget', 'gerer-son-budget'],
    b('Managing a monthly budget', 'Gérer son budget mensuel'),
    b('Read a monthly statement, talk about fixed bills and explain how you save.', 'Lire un récapitulatif mensuel, parler des dépenses fixes et expliquer comment on économise.'),
    [b('Read a monthly budget summary', 'Lire un récapitulatif de budget'), b('Talk about fixed costs and subscriptions', 'Parler des frais fixes et abonnements'), b('Explain how you save money', 'Expliquer comment on met de côté')],
    13,
    [
      card(b('Budget & savings', 'Budget et épargne'), b('Key words: **les revenus, les dépenses fixes** (loyer, électricité, transport), **les abonnements, les courses, le solde**. Actions: **faire ses comptes, respecter son budget, économiser, mettre de l’argent de côté, ouvrir un compte épargne**.', 'Mots clés : **les revenus, les dépenses fixes** (loyer, électricité, transport), **les abonnements, les courses, le solde**. Actions : **faire ses comptes, respecter son budget, économiser, mettre de l’argent de côté, ouvrir un compte épargne**.'), {
        ex: [['Je mets deux cents euros de côté chaque mois.', 'I put two hundred euros aside every month.'], ['J’ai annulé deux abonnements qui coûtaient trop cher.', 'I cancelled two subscriptions that cost too much.']],
      }),
      doc({ look: 'email', title: b('Monthly summary', 'Récapitulatif du mois'), text: 'Bonjour Lucas,\nVotre relevé du mois d’avril est disponible.\n\nRevenus : 2 150 €\nLoyer et charges : 840 € · Alimentation : 340 €\nTransports : 75 € · Abonnements : 45 €\nVirement vers votre compte épargne : 250 €\nSolde disponible le 30 avril : 600 €' }, b('How much did Lucas move into savings?', 'Combien Lucas a-t-il mis sur son compte épargne ?'), [b('250 €', '250 €'), b('340 €', '340 €'), b('600 €', '600 €'), b('840 €', '840 €')]),
      mc(P.best, ['Je mets un peu d’argent de côté chaque mois pour les vacances.', 'Je cache mes pièces dans un verre.', 'Je dépense tout pour le budget.', 'Je suis cher en vacances.'], { fr: 'Vous expliquez comment vous économisez pour un voyage :' }),
      pairs(P.match, [['économiser', b('to save money', 'dépenser moins')], ['un relevé de compte', b('a bank statement', 'document des opérations')], ['les dépenses fixes', b('fixed expenses', 'frais réguliers du mois')], ['le solde', b('the balance', 'ce qu’il reste sur le compte')]]),
      write(b('Your monthly budget', 'Votre budget du mois'), b('Write a short message (35–65 words) explaining how you manage your budget: name two fixed expenses, say how much or how you save each month, and mention one treat you keep.', 'Écrivez un court message (35–65 mots) sur votre gestion du budget : citez deux dépenses fixes, expliquez comment vous mettez de l’argent de côté et gardez un petit plaisir.'), 35, 65, [
        b('Two fixed expenses named', 'Deux dépenses fixes citées'),
        b('How you save (mettre de côté / économiser)', 'Une façon d’économiser'),
        b('One small treat kept in the budget', 'Un petit plaisir conservé'),
      ], 'Pour bien gérer mon budget chaque mois, je paie d’abord mes dépenses fixes : le loyer, l’électricité et le transport. Ensuite, je mets cent cinquante euros de côté sur mon compte épargne. Pour économiser un peu plus, je cuisine à la maison en semaine, mais je garde un petit budget pour un café ou un cinéma le week-end.', { phrases: ['mes dépenses fixes', 'je mets … de côté', 'pour économiser'] }),
      say('J’essaie de mettre deux cents euros de côté chaque mois en cuisinant plus à la maison.', 'I try to put two hundred euros aside each month by cooking more at home.'),
    ],
    [
      b('les revenus, les dépenses fixes, les abonnements, le solde.', 'les revenus, les dépenses fixes, les abonnements, le solde.'),
      b('économiser = mettre de l’argent de côté.', 'économiser = mettre de l’argent de côté.'),
      b('faire ses comptes · respecter son budget.', 'faire ses comptes · respecter son budget.'),
    ],
    [['mettre de côté', b('to put aside, save', 'garder pour plus tard')], ['un abonnement', b('a subscription', 'paiement régulier pour un service')], ['le solde', b('the account balance', 'argent restant disponible')]],
  ),
];
