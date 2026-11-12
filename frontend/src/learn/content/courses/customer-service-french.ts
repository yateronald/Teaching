// Français du service à la clientèle: welcoming, helping, handling a
// complaint, the phone and the checkout. For shop, restaurant and call-centre jobs.
import { b, type Lesson } from '../../types';
import { card, listen, pick } from '../kit';

const lessons: Lesson[] = [
  {
    id: 'customer-service-french-1',
    slug: { en: 'welcoming-a-customer', fr: 'accueillir-un-client' },
    title: b('Welcoming a customer', 'Accueillir un client'),
    summary: b('Greet, offer your help, ask what the customer needs and give simple information.', 'Saluer, proposer votre aide, demander ce que le client cherche et donner une information simple.'),
    objectives: [b('Greet and offer help', 'Saluer et proposer votre aide'), b('Ask what the customer needs', 'Demander ce que cherche le client'), b('Give directions inside a shop', 'Orienter le client dans le magasin')],
    minutes: 13,
    steps: [
      card(b('The first ten seconds', 'Les dix premières secondes'), b('In customer service, always **vous**, always **bonjour**. Three openers: **Bonjour, je peux vous aider ?** · **Vous cherchez quelque chose en particulier ?** · **Bienvenue ! N’hésitez pas si vous avez des questions.**', 'En service à la clientèle, toujours **vous**, toujours **bonjour**. Trois formules d’accueil : **Bonjour, je peux vous aider ?** · **Vous cherchez quelque chose en particulier ?** · **Bienvenue ! N’hésitez pas si vous avez des questions.**'), {
        examples: [{ fr: 'Bonjour, je peux vous aider ?', tr: 'Hello, can I help you?' }, { fr: 'Vous cherchez quelque chose en particulier ?', tr: 'Are you looking for something in particular?' }, { fr: 'N’hésitez pas si vous avez des questions.', tr: 'Don’t hesitate if you have any questions.' }],
      }),
      pick('A2', b('A customer walks in. Which greeting is professional?', 'Un client entre. Quel accueil est professionnel ?'), ['Bonjour, madame. Je peux vous aider ?', 'Salut ! Tu veux quoi ?', 'Oui ?', 'C’est pour quoi ?']),
      listen('A2', 'f', 'Bonjour. Je cherche un cadeau pour ma mère, mais je ne sais pas trop quoi prendre.', 'Que veut la cliente ?', ['Un cadeau pour sa mère', 'Un cadeau pour sa fille', 'Échanger un cadeau', 'Un remboursement']),
      card(b('Checking and guiding', 'Vérifier et orienter'), b('**Un instant, je vérifie.** · **Je regarde si nous l’avons en stock.** · **C’est au fond du magasin, à droite.** · **Suivez-moi, je vous montre.** · **Malheureusement, nous n’en avons plus.**', '**Un instant, je vérifie.** · **Je regarde si nous l’avons en stock.** · **C’est au fond du magasin, à droite.** · **Suivez-moi, je vous montre.** · **Malheureusement, nous n’en avons plus.**'), {
        examples: [{ fr: 'Un instant, je vérifie si nous l’avons en stock.', tr: 'One moment, I’ll check if we have it in stock.' }, { fr: 'Suivez-moi, je vous montre.', tr: 'Follow me, I’ll show you.' }, { fr: 'Malheureusement, nous n’en avons plus.', tr: 'Unfortunately, we don’t have any left.' }],
      }),
      pick('A2', b('You do not have the product. What do you say?', 'Vous n’avez pas le produit. Que dites-vous ?'), ['Malheureusement, nous n’en avons plus, mais je peux vous le commander.', 'Non.', 'Il n’y a pas. Au revoir.', 'Cherchez vous-même.'], { explain: b('Announce the bad news gently, then offer a solution.', 'Annoncez la mauvaise nouvelle avec tact, puis proposez une solution.') }),
      { kind: 'match', prompt: b('Match each phrase with its use.', 'Associez chaque formule à son emploi.'), pairs: [['Je peux vous aider ?', b('offer help', 'proposer son aide')], ['Un instant, je vérifie.', b('ask to wait', 'faire patienter')], ['Suivez-moi.', b('guide', 'orienter')], ['Nous n’en avons plus.', b('out of stock', 'rupture de stock')], ['Avec plaisir !', b('answer thanks', 'répondre à un merci')]] },
      { kind: 'dialogue', title: b('In a sports shop', 'Dans un magasin de sport'), scene: b('You are the employee. Choose your best replies.', 'Vous êtes l’employé. Choisissez vos meilleures répliques.'), speakers: [{ name: 'Client', voice: 'm', side: 'l' }, { name: 'Vous', voice: 'f', side: 'r' }], lines: [
        { s: 0, fr: 'Bonjour, vous avez des bottes d’hiver en pointure quarante-trois ?', tr: 'Hello, do you have winter boots in size 43?' },
        { s: 1, choose: { options: ['Bonjour, monsieur. Un instant, je vérifie en stock.', 'Je ne sais pas.', 'Regardez là-bas.'], answer: 0 } },
        { s: 0, fr: 'Merci, c’est gentil.', tr: 'Thank you, that’s kind.' },
        { s: 1, choose: { options: ['Oui, nous les avons. Suivez-moi, je vous montre les modèles.', 'Oui.', 'On a. Là.'], answer: 0 } },
      ] },
      { kind: 'speak', prompt: b('Say it aloud.', 'Dites-le à voix haute.'), text: 'Bonjour, je peux vous aider ? Vous cherchez quelque chose en particulier ?', tr: 'Hello, can I help you? Are you looking for something in particular?' },
    ],
    notes: {
      points: [
        b('Always vous and bonjour. Openers: Je peux vous aider ? / Vous cherchez quelque chose en particulier ?', 'Toujours vous et bonjour. Accueil : Je peux vous aider ? / Vous cherchez quelque chose en particulier ?'),
        b('Ask to wait: **Un instant, je vérifie.**', 'Faire patienter : **Un instant, je vérifie.**'),
        b('Guide: C’est au fond, à droite. / Suivez-moi, je vous montre.', 'Orienter : C’est au fond, à droite. / Suivez-moi, je vous montre.'),
        b('Bad news + solution: Malheureusement…, mais je peux…', 'Mauvaise nouvelle + solution : Malheureusement…, mais je peux…'),
      ],
      vocab: [['en stock', b('in stock', 'disponible dans le magasin')], ['la pointure', b('shoe size', 'taille des chaussures')], ['au fond', b('at the back', 'tout au bout')], ['commander', b('to order', 'demander qu’on fasse venir un produit')], ['malheureusement', b('unfortunately', 'par malchance')]],
    },
  },
  {
    id: 'customer-service-french-2',
    slug: { en: 'requests-and-complaints', fr: 'demandes-et-plaintes' },
    title: b('Handling a request and a complaint', 'Gérer une demande et une plainte'),
    summary: b('Listen, apologise, propose a solution: the three moves that calm an unhappy customer.', 'Écouter, s’excuser, proposer une solution : les trois gestes qui apaisent un client mécontent.'),
    objectives: [b('Show that you are listening', 'Montrer que vous écoutez'), b('Apologise professionally', 'Présenter des excuses de façon professionnelle'), b('Offer an exchange or a refund', 'Proposer un échange ou un remboursement')],
    minutes: 13,
    steps: [
      card(b('Listen, apologise, solve', 'Écouter, s’excuser, résoudre'), b('**1. Listen**: Je comprends. / Je vois. **2. Apologise**: Je suis désolé(e) pour ce désagrément. **3. Solve**: Je vais voir ce que je peux faire. / Nous pouvons l’échanger ou vous rembourser.', '**1. Écouter** : Je comprends. / Je vois. **2. S’excuser** : Je suis désolé(e) pour ce désagrément. **3. Résoudre** : Je vais voir ce que je peux faire. / Nous pouvons l’échanger ou vous rembourser.'), {
        examples: [{ fr: 'Je comprends, je suis désolée pour ce désagrément.', tr: 'I understand, I am sorry for the inconvenience.' }, { fr: 'Je vais voir ce que je peux faire.', tr: 'I will see what I can do.' }, { fr: 'Nous pouvons l’échanger ou vous rembourser.', tr: 'We can exchange it or give you a refund.' }],
      }),
      listen('B1', 'm2', 'J’ai acheté ce grille-pain il y a trois jours et il ne fonctionne déjà plus. C’est inacceptable !', 'Quel est le problème du client ?', ['Un appareil acheté récemment est en panne', 'Le prix était trop élevé', 'La livraison est en retard', 'Il a perdu son reçu']),
      pick('B1', b('What is the best first reaction?', 'Quelle est la meilleure première réaction ?'), ['Je comprends, monsieur. Je suis désolé pour ce désagrément.', 'Ce n’est pas ma faute.', 'Calmez-vous !', 'C’est normal, c’est un vieux modèle.']),
      card(b('Words to avoid', 'Les mots à éviter'), b('Avoid **“Calmez-vous”** (it makes people angrier), **“Ce n’est pas possible”** without an alternative, and **“C’est la politique du magasin”** as your only answer. Prefer **“Voici ce que je peux vous proposer…”**', 'Évitez **« Calmez-vous »** (cela énerve davantage), **« Ce n’est pas possible »** sans solution de rechange, et **« C’est la politique du magasin »** comme seule réponse. Préférez **« Voici ce que je peux vous proposer… »**'), { variant: 'trap' }),
      pick('B1', b('Choose the right word.', 'Choisissez le bon mot.'), ['rembourser', 'rembourse', 'remboursé', 'remboursez'], { fr: 'Avec votre reçu, nous pouvons vous ___.' }),
      listen('B1', 'f2', 'Avez-vous votre reçu ? Avec le reçu, je peux vous faire un échange ou un remboursement complet.', 'De quoi l’employée a-t-elle besoin ?', ['Du reçu', 'De la carte de crédit', 'De l’emballage', 'D’une pièce d’identité']),
      { kind: 'categorize', prompt: b('Professional or to avoid?', 'Professionnel ou à éviter ?'), buckets: [b('Professional', 'Professionnel'), b('To avoid', 'À éviter')], items: [{ text: 'Je comprends votre situation.', bucket: 0 }, { text: 'Calmez-vous.', bucket: 1 }, { text: 'Voici ce que je peux vous proposer.', bucket: 0 }, { text: 'Ce n’est pas mon problème.', bucket: 1 }, { text: 'Je vais vérifier tout de suite.', bucket: 0 }, { text: 'Vous auriez dû lire le contrat.', bucket: 1 }] },
      { kind: 'dialogue', title: b('An unhappy customer', 'Une cliente mécontente'), scene: b('You are the employee. Choose your best replies.', 'Vous êtes l’employé. Choisissez vos meilleures répliques.'), speakers: [{ name: 'Cliente', voice: 'f', side: 'l' }, { name: 'Vous', voice: 'm', side: 'r' }], lines: [
        { s: 0, fr: 'J’attends ma commande depuis deux semaines. Personne ne répond à mes courriels !', tr: 'I have been waiting for my order for two weeks. Nobody answers my emails!' },
        { s: 1, choose: { options: ['Je comprends, madame, et je suis désolé pour ce retard. Puis-je avoir votre numéro de commande ?', 'Ce n’est pas moi qui réponds aux courriels.', 'Il faut être patiente.'], answer: 0 } },
        { s: 0, fr: 'C’est le numéro quatre mille deux cent dix.', tr: 'It is number four thousand two hundred and ten.' },
        { s: 1, choose: { options: ['Merci. Je vérifie tout de suite… Votre colis sera livré demain, et je vous offre les frais de livraison.', 'D’accord. Au revoir.', 'Je ne trouve rien.'], answer: 0, explain: b('Give a clear answer and a gesture: that is what turns a complaint into loyalty.', 'Donnez une réponse claire et faites un geste : c’est ce qui transforme une plainte en fidélité.') } },
      ] },
    ],
    notes: {
      points: [
        b('Three moves: listen (Je comprends), apologise (Je suis désolé pour ce désagrément), solve (Voici ce que je peux vous proposer).', 'Trois gestes : écouter (Je comprends), s’excuser (Je suis désolé pour ce désagrément), résoudre (Voici ce que je peux vous proposer).'),
        b('Avoid “Calmez-vous” and “Ce n’est pas possible” without an alternative.', 'Évitez « Calmez-vous » et « Ce n’est pas possible » sans solution de rechange.'),
        b('Exchange: un échange. Refund: un remboursement. Proof: le reçu.', 'Échange : un échange. Remboursement : un remboursement. Preuve : le reçu.'),
        b('Ask for information politely: Puis-je avoir votre numéro de commande ?', 'Demandez une information poliment : Puis-je avoir votre numéro de commande ?'),
      ],
      vocab: [['le désagrément', b('inconvenience', 'ennui causé à quelqu’un')], ['la plainte', b('complaint', 'expression d’un mécontentement')], ['le remboursement', b('refund', 'argent rendu')], ['les frais de livraison', b('delivery charges', 'coût de l’envoi')], ['mécontent', b('unhappy', 'pas satisfait')]],
    },
  },
  {
    id: 'customer-service-french-3',
    slug: { en: 'on-the-phone-and-at-the-checkout', fr: 'au-telephone-et-a-la-caisse' },
    title: b('On the phone and at the checkout', 'Au téléphone et à la caisse'),
    summary: b('Answer the phone for a business, put a caller on hold, and run a checkout in French.', 'Répondre au téléphone pour une entreprise, mettre un appel en attente et tenir une caisse en français.'),
    objectives: [b('Answer the phone professionally', 'Répondre au téléphone de façon professionnelle'), b('Put on hold and transfer a call', 'Mettre en attente et transférer un appel'), b('Handle payment at the checkout', 'Gérer le paiement à la caisse')],
    minutes: 13,
    steps: [
      card(b('Answering the phone', 'Répondre au téléphone'), b('**Name of the business + bonjour + your name + offer**: “Boutique Soleil, bonjour, Amina à l’appareil. Comment puis-je vous aider ?” Then: **Un instant, je vous prie.** · **Je vous mets en attente.** · **Je vous transfère au service…** · **Merci d’avoir patienté.**', '**Nom de l’entreprise + bonjour + votre prénom + offre** : « Boutique Soleil, bonjour, Amina à l’appareil. Comment puis-je vous aider ? » Puis : **Un instant, je vous prie.** · **Je vous mets en attente.** · **Je vous transfère au service…** · **Merci d’avoir patienté.**'), {
        examples: [{ fr: 'Boutique Soleil, bonjour, Amina à l’appareil. Comment puis-je vous aider ?', tr: 'Boutique Soleil, hello, Amina speaking. How can I help you?' }, { fr: 'Un instant, je vous mets en attente.', tr: 'One moment, I’ll put you on hold.' }, { fr: 'Merci d’avoir patienté.', tr: 'Thank you for holding.' }],
      }),
      pick('A2', b('How do you answer the phone at work?', 'Comment répondez-vous au téléphone au travail ?'), ['Boutique Soleil, bonjour. Comment puis-je vous aider ?', 'Allô ? C’est qui ?', 'Oui, j’écoute.', 'Boutique Soleil. Parlez.']),
      listen('A2', 'm', 'Bonjour, j’appelle pour savoir si vous êtes ouverts dimanche.', 'Que veut savoir le client ?', ['Si le magasin est ouvert dimanche', 'Le prix d’un produit', 'L’adresse du magasin', 'S’il peut parler au gérant']),
      pick('A2', b('You need to check something. What do you say?', 'Vous devez vérifier une information. Que dites-vous ?'), ['Un instant, je vous prie, je vérifie.', 'Attendez.', 'Je ne sais pas, rappelez.', 'Une seconde, bouge pas.']),
      card(b('At the checkout', 'À la caisse'), b('**Vous avez trouvé tout ce que vous cherchiez ?** · **Ça fait vingt-quatre dollars quatre-vingt-quinze.** · **Vous payez comment ? Par débit, par crédit ou en argent comptant ?** · **Voulez-vous votre reçu ?** · **Merci et bonne journée !**', '**Vous avez trouvé tout ce que vous cherchiez ?** · **Ça fait vingt-quatre dollars quatre-vingt-quinze.** · **Vous payez comment ? Par débit, par crédit ou en argent comptant ?** · **Voulez-vous votre reçu ?** · **Merci et bonne journée !**'), {
        examples: [{ fr: 'Vous payez par débit, par crédit ou en argent comptant ?', tr: 'Are you paying by debit, credit or cash?' }, { fr: 'Voulez-vous votre reçu ?', tr: 'Would you like your receipt?' }],
      }),
      listen('A2', 'f2', 'Ça fait trente-sept dollars cinquante. Vous payez par débit ou par crédit ?', 'Quel est le montant ?', ['37,50 $', '27,50 $', '37,15 $', '47,50 $']),
      { kind: 'order', prompt: b('Build the checkout question.', 'Construisez la question de la caisse.'), words: ['Voulez-vous', 'votre', 'reçu', 'dans', 'le', 'sac', '?'], tr: 'Would you like your receipt in the bag?' },
      { kind: 'match', prompt: b('Match each phone phrase with its meaning.', 'Associez chaque formule à son sens.'), pairs: [['Je vous mets en attente.', b('I’ll put you on hold.', 'Le client patiente en ligne.')], ['Je vous transfère.', b('I’ll transfer you.', 'Un collègue va répondre.')], ['Merci d’avoir patienté.', b('Thanks for holding.', 'Après une attente.')], ['La ligne est occupée.', b('The line is busy.', 'La personne est déjà en ligne.')], ['Puis-je prendre un message ?', b('May I take a message?', 'La personne est absente.')]] },
      { kind: 'speak', prompt: b('Say it aloud.', 'Dites-le à voix haute.'), text: 'Vous payez par débit, par crédit ou en argent comptant ?', tr: 'Are you paying by debit, credit or cash?' },
    ],
    notes: {
      points: [
        b('Phone: business name + bonjour + your name + Comment puis-je vous aider ?', 'Téléphone : nom de l’entreprise + bonjour + votre prénom + Comment puis-je vous aider ?'),
        b('Hold: Un instant, je vous prie. / Je vous mets en attente. / Merci d’avoir patienté.', 'Attente : Un instant, je vous prie. / Je vous mets en attente. / Merci d’avoir patienté.'),
        b('Checkout: Ça fait… / Vous payez comment ? / Voulez-vous votre reçu ?', 'Caisse : Ça fait… / Vous payez comment ? / Voulez-vous votre reçu ?'),
        b('Canada: par débit, par crédit, en argent comptant.', 'Canada : par débit, par crédit, en argent comptant.'),
      ],
      vocab: [['à l’appareil', b('speaking (on the phone)', 'au téléphone')], ['patienter', b('to wait, to hold', 'attendre calmement')], ['transférer', b('to transfer', 'passer l’appel à quelqu’un')], ['le gérant', b('manager', 'responsable du magasin')], ['le montant', b('amount', 'somme à payer')]],
    },
  },
];

export default lessons;
