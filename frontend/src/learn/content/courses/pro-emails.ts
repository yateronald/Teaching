import { b, type Lesson } from '../../types';

const lessons: Lesson[] = [
  {
    id: 'pro-emails-1',
    slug: { en: 'structure-and-formulas', fr: 'structure-et-formules' },
    title: b('Structure and formulas of a professional email', 'Structure et formules d’un e-mail professionnel'),
    summary: b('Subject line, greeting, body and closing: the conventions French speakers expect in a work email.', 'Objet, formule d’appel, corps et formule finale : les codes attendus dans un courriel professionnel en français.'),
    objectives: [b('Write a clear subject line', 'Rédiger un objet clair'), b('Choose the right greeting and closing', 'Choisir la bonne formule d’appel et la bonne formule finale'), b('Organise the body in short paragraphs', 'Organiser le corps en courts paragraphes')],
    minutes: 13,
    steps: [
      {
        kind: 'concept',
        title: b('The anatomy of a work email', 'L’anatomie d’un courriel professionnel'),
        table: {
          head: [b('Part', 'Partie'), b('Example', 'Exemple')],
          rows: [[b('Subject', 'Objet'), 'Demande de rendez-vous – projet Alpha'], [b('Greeting', 'Formule d’appel'), 'Bonjour Madame Dupuis, / Madame, Monsieur,'], [b('Purpose', 'Objet du message'), 'Je me permets de vous écrire afin de…'], [b('Details', 'Développement'), 'Pourriez-vous… ? Vous trouverez ci-joint…'], [b('Closing', 'Formule finale'), 'Je vous remercie par avance. Cordialement,'], [b('Signature', 'Signature'), 'Nom, poste, entreprise, téléphone']],
        },
      },
      {
        kind: 'categorize',
        prompt: b('Greeting or closing?', 'Formule d’appel ou formule finale ?'),
        buckets: [b('Greeting', 'Formule d’appel'), b('Closing', 'Formule finale')],
        items: [{ text: 'Madame, Monsieur,', bucket: 0 }, { text: 'Bonjour Monsieur Tremblay,', bucket: 0 }, { text: 'Chère Sophie,', bucket: 0 }, { text: 'Cordialement,', bucket: 1 }, { text: 'Bien à vous,', bucket: 1 }, { text: 'Je vous prie d’agréer mes salutations distinguées.', bucket: 1 }],
      },
      {
        kind: 'concept',
        variant: 'culture',
        title: b('France vs Québec', 'France et Québec'),
        body: b('In France, emails often stay formal (**Madame, Monsieur**, **Cordialement**). In Québec, people quickly use **Bonjour + first name** and close with **Merci et bonne journée !** or **Salutations**. Mirror the style of the person who writes to you.', 'En France, les courriels restent souvent formels (**Madame, Monsieur**, **Cordialement**). Au Québec, on passe vite à **Bonjour + prénom** et on termine par **Merci et bonne journée !** ou **Salutations**. Reprenez le style de votre interlocuteur.'),
      },
      {
        kind: 'mcq',
        prompt: b('Which subject line is the most effective?', 'Quel objet est le plus efficace ?'),
        options: ['Envoi du rapport mensuel – mars 2025', 'Bonjour', 'Important !!!', 'Message'],
        answer: 0,
      },
      {
        kind: 'order',
        prompt: b('Rebuild the opening sentence.', 'Reconstituez la phrase d’ouverture.'),
        tr: 'I am writing to you to request information about your training courses.',
        words: ['Je', 'me', 'permets', 'de', 'vous', 'écrire', 'afin', 'd’obtenir', 'des', 'informations', 'sur', 'vos', 'formations.'],
      },
      {
        kind: 'match',
        prompt: b('Useful email phrases.', 'Tournures utiles dans un courriel.'),
        pairs: [['Vous trouverez ci-joint…', b('Please find attached…', 'je joins un document')], ['Je reste à votre disposition…', b('I remain available…', 'je peux aider si besoin')], ['Suite à notre conversation…', b('Following our conversation…', 'après notre échange')], ['Je vous remercie par avance.', b('Thank you in advance.', 'merci d’avance')]],
      },
      {
        kind: 'write',
        prompt: b('Write a professional email.', 'Rédigez un courriel professionnel.'),
        task: b('You want to sign up for a professional French course at a language school in Montréal. Write an email (80–120 words) to ask about dates, prices and the level test.', 'Vous souhaitez vous inscrire à une formation de français professionnel dans une école de langues à Montréal. Écrivez un courriel (80 à 120 mots) pour demander les dates, les tarifs et les modalités du test de niveau.'),
        min: 80,
        max: 120,
        checklist: [b('A clear subject line', 'Un objet clair'), b('Greeting and purpose', 'Formule d’appel et raison du courriel'), b('Three questions (dates, prices, level test)', 'Trois questions (dates, tarifs, test de niveau)'), b('Closing formula and signature', 'Formule finale et signature')],
        phrases: ['Objet :', 'Madame, Monsieur,', 'Je me permets de vous écrire afin de', 'Pourriez-vous m’indiquer', 'Je vous remercie par avance', 'Cordialement,'],
        model: 'Objet : Demande d’informations – formation en français professionnel\n\nMadame, Monsieur,\n\nJe me permets de vous écrire afin d’obtenir des informations sur votre formation en français professionnel. Je travaille comme analyste financier à Montréal et je souhaiterais améliorer mon français écrit et oral au travail.\n\nPourriez-vous m’indiquer les dates des prochaines sessions ainsi que les tarifs ? J’aimerais également savoir comment se déroule le test de niveau et s’il est possible de le passer en ligne.\n\nJe vous remercie par avance de votre réponse.\n\nCordialement,\nArjun Patel\nAnalyste financier\n514 555-0198',
      },
    ],
    notes: {
      points: [
        b('Structure: subject → greeting → purpose → details → closing → signature.', 'Structure : objet → formule d’appel → raison → développement → formule finale → signature.'),
        b('Formal: Madame, Monsieur / Cordialement / Je vous prie d’agréer… Québec: Bonjour + first name / Merci et bonne journée.', 'Formel : Madame, Monsieur / Cordialement / Je vous prie d’agréer… Québec : Bonjour + prénom / Merci et bonne journée.'),
        b('Key phrases: je me permets de vous écrire afin de…, vous trouverez ci-joint…, je reste à votre disposition.', 'Tournures clés : je me permets de vous écrire afin de…, vous trouverez ci-joint…, je reste à votre disposition.'),
      ],
      vocab: [['l’objet', b('subject line', 'titre du courriel')], ['ci-joint', b('attached', 'en pièce jointe')], ['cordialement', b('kind regards', 'formule finale courante')], ['les modalités', b('the arrangements, terms', 'conditions pratiques')]],
    },
  },
  {
    id: 'pro-emails-2',
    slug: { en: 'requesting-following-up-apologising', fr: 'demander-relancer-s-excuser' },
    title: b('Requesting, following up and apologising', 'Demander, relancer et s’excuser'),
    summary: b('Make polite requests, follow up without sounding pushy, and apologise professionally for a delay or a mistake.', 'Formuler des demandes polies, relancer sans paraître insistant, et vous excuser professionnellement pour un retard ou une erreur.'),
    objectives: [b('Soften requests with the conditional', 'Adoucir les demandes avec le conditionnel'), b('Write a polite follow-up', 'Rédiger une relance polie'), b('Apologise and propose a solution', 'S’excuser et proposer une solution')],
    minutes: 13,
    steps: [
      {
        kind: 'concept',
        title: b('Softening a request', 'Adoucir une demande'),
        table: {
          head: [b('Direct (too abrupt)', 'Direct (trop brusque)'), b('Professional', 'Professionnel')],
          rows: [['Envoyez-moi le rapport.', 'Pourriez-vous m’envoyer le rapport ?'], ['Je veux une réponse.', 'Je souhaiterais avoir votre retour.'], ['Rappelez-moi.', 'Auriez-vous la possibilité de me rappeler ?']],
        },
      },
      {
        kind: 'mcq',
        prompt: b('Which request is the most professional?', 'Quelle demande est la plus professionnelle ?'),
        options: ['Serait-il possible de recevoir le devis d’ici vendredi ?', 'Le devis, vendredi, merci.', 'Je veux le devis vendredi.', 'Envoie le devis.'],
        answer: 0,
      },
      {
        kind: 'concept',
        variant: 'tip',
        title: b('Following up without being pushy', 'Relancer sans insister lourdement'),
        examples: [{ fr: 'Je me permets de revenir vers vous concernant ma demande du 3 mai.', tr: 'I’m getting back to you about my request of 3 May.' }, { fr: 'Sauf erreur de ma part, je n’ai pas encore reçu votre réponse.', tr: 'Unless I’m mistaken, I haven’t received your reply yet.' }, { fr: 'Auriez-vous pu avancer sur ce dossier ?', tr: 'Have you been able to make progress on this file?' }],
      },
      {
        kind: 'fill',
        prompt: b('Complete the follow-up.', 'Complétez la relance.'),
        text: 'Je me permets de ___ vers vous concernant la facture n° 245. Sauf ___ de ma part, elle n’a pas encore été réglée.',
        answers: [['revenir'], ['erreur']],
        choices: [['revenir', 'retourner', 'rentrer'], ['erreur', 'faute', 'problème']],
      },
      {
        kind: 'concept',
        title: b('Apologising professionally', 'S’excuser de façon professionnelle'),
        body: b('Acknowledge, explain briefly (without excuses), and **propose a solution**.', 'Reconnaître, expliquer brièvement (sans se justifier longuement), et **proposer une solution**.'),
        examples: [{ fr: 'Je vous prie de m’excuser pour ce retard.', tr: 'Please accept my apologies for this delay.' }, { fr: 'Suite à une erreur de notre part, la commande n’a pas été expédiée.', tr: 'Due to an error on our part, the order was not shipped.' }, { fr: 'Nous vous la ferons parvenir dès demain, sans frais supplémentaires.', tr: 'We will send it to you tomorrow at no extra cost.' }],
      },
      {
        kind: 'order',
        prompt: b('Build the apology.', 'Construisez l’excuse.'),
        words: ['Je', 'vous', 'prie', 'de', 'm’excuser', 'pour', 'ce', 'contretemps.'],
      },
      {
        kind: 'write',
        prompt: b('Apologise and propose a solution.', 'Excusez-vous et proposez une solution.'),
        task: b('You promised a client to send a quote on Monday, but it is now Wednesday. Write an email (60–100 words) to apologise, send the quote and propose a call.', 'Vous aviez promis à un client de lui envoyer un devis lundi, mais nous sommes mercredi. Écrivez un courriel (60 à 100 mots) pour vous excuser, envoyer le devis et proposer un appel.'),
        min: 60,
        max: 100,
        checklist: [b('An apology', 'Une excuse'), b('A brief explanation', 'Une brève explication'), b('The quote attached', 'Le devis en pièce jointe'), b('A proposal for a call', 'Une proposition d’appel')],
        phrases: ['Je vous prie de m’excuser pour', 'Vous trouverez ci-joint', 'Seriez-vous disponible', 'Je reste à votre disposition', 'Cordialement,'],
        model: 'Objet : Devis – rénovation de vos bureaux\n\nBonjour Monsieur Lefebvre,\n\nJe vous prie de m’excuser pour ce retard : nous avons dû vérifier certains prix auprès de nos fournisseurs. Vous trouverez ci-joint le devis détaillé pour la rénovation de vos bureaux.\n\nSeriez-vous disponible jeudi ou vendredi pour un court appel afin d’en discuter ?\n\nJe reste à votre disposition pour toute question.\n\nCordialement,\nNadia Benali',
      },
    ],
    notes: {
      points: [
        b('Soften requests: pourriez-vous…, je souhaiterais…, serait-il possible de… ?', 'Adoucir : pourriez-vous…, je souhaiterais…, serait-il possible de… ?'),
        b('Follow up: je me permets de revenir vers vous…, sauf erreur de ma part…', 'Relancer : je me permets de revenir vers vous…, sauf erreur de ma part…'),
        b('Apologise: je vous prie de m’excuser…, brief explanation, solution.', 'S’excuser : je vous prie de m’excuser…, brève explication, solution.'),
      ],
      vocab: [['un devis', b('a quote', 'estimation de prix')], ['relancer', b('to follow up', 'reprendre contact')], ['un contretemps', b('a setback, hitch', 'imprévu')], ['régler une facture', b('to pay an invoice', 'payer')]],
    },
  },
  {
    id: 'pro-emails-3',
    slug: { en: 'adapting-your-register', fr: 'adapter-son-registre' },
    title: b('Adapting your register: colleague, manager, client', 'Adapter son registre : collègue, responsable, client'),
    summary: b('The same message in three registers: when to use tu or vous, and how to stay professional but warm.', 'Le même message dans trois registres : quand employer tu ou vous, et comment rester professionnel mais chaleureux.'),
    objectives: [b('Choose tu or vous at work', 'Choisir tu ou vous au travail'), b('Adapt vocabulary and formulas to the recipient', 'Adapter vocabulaire et formules au destinataire'), b('Keep a professional and warm tone', 'Garder un ton professionnel et chaleureux')],
    minutes: 12,
    steps: [
      {
        kind: 'concept',
        variant: 'culture',
        title: b('Tu or vous at work?', 'Tu ou vous au travail ?'),
        body: b('In Québec and in many start-ups, colleagues use **tu** quickly, even with managers. In traditional French companies and with clients, **vous** remains the rule. If unsure, start with **vous** and follow the other person’s lead.', 'Au Québec et dans beaucoup de jeunes entreprises, on se tutoie vite, même avec un responsable. Dans les entreprises françaises traditionnelles et avec les clients, le **vous** reste la règle. Dans le doute, commencez par **vous** et suivez votre interlocuteur.'),
      },
      {
        kind: 'categorize',
        prompt: b('Colleague (informal) or client (formal)?', 'Collègue (informel) ou client (formel) ?'),
        buckets: [b('Colleague', 'Collègue'), b('Client', 'Client')],
        items: [{ text: 'Salut Julie,', bucket: 0 }, { text: 'Tu peux jeter un œil ?', bucket: 0 }, { text: 'Merci et à plus tard !', bucket: 0 }, { text: 'Madame Roy,', bucket: 1 }, { text: 'Pourriez-vous valider ce document ?', bucket: 1 }, { text: 'Je vous prie d’agréer…', bucket: 1 }],
      },
      {
        kind: 'mcq',
        prompt: b('You write to a new client for the first time. Which opening fits?', 'Vous écrivez pour la première fois à un nouveau client. Quelle ouverture convient ?'),
        options: ['Bonjour Madame Gagnon,', 'Salut !', 'Coucou Madame,', 'Yo,'],
        answer: 0,
      },
      {
        kind: 'match',
        prompt: b('Same idea, two registers.', 'Même idée, deux registres.'),
        pairs: [['Tu peux m’envoyer ça ?', b('Pourriez-vous me transmettre ce document ?', 'Pourriez-vous me transmettre ce document ?')], ['Désolé pour le retard !', b('Je vous prie d’excuser ce retard.', 'Je vous prie d’excuser ce retard.')], ['On en parle demain ?', b('Pourrions-nous en discuter demain ?', 'Pourrions-nous en discuter demain ?')], ['Merci beaucoup !', b('Je vous remercie vivement.', 'Je vous remercie vivement.')]],
      },
      {
        kind: 'speak',
        prompt: b('Say the formal version aloud.', 'Dites la version formelle à voix haute.'),
        text: 'Pourrions-nous fixer une réunion la semaine prochaine pour faire le point sur le projet ?',
        tr: 'Could we set up a meeting next week to review the project?',
      },
      {
        kind: 'write',
        prompt: b('One message, two registers.', 'Un message, deux registres.'),
        task: b('Write the same information twice (about 30 words each): “The meeting is moved to Thursday at 2 p.m., please confirm.” First to a colleague you know well, then to a client.', 'Écrivez deux fois la même information (environ 30 mots chacune) : « La réunion est déplacée à jeudi 14 h, merci de confirmer. » D’abord à un collègue proche, puis à un client.'),
        min: 40,
        max: 90,
        checklist: [b('Informal version: tu, first name, short', 'Version informelle : tu, prénom, phrases courtes'), b('Formal version: vous, title, polite conditional', 'Version formelle : vous, titre, conditionnel de politesse'), b('Same information in both', 'La même information dans les deux')],
        model: 'Salut Thomas,\n\nPetit changement : la réunion est déplacée à jeudi 14 h. Tu peux me confirmer que ça te va ? Merci !\n\nBonjour Madame Martin,\n\nJe vous informe que notre réunion est reportée au jeudi 14 h. Pourriez-vous me confirmer votre disponibilité ? Je vous remercie par avance.\n\nCordialement,',
      },
    ],
    notes: {
      points: [
        b('Tu at work: frequent in Québec and start-ups; vous with clients and in traditional companies.', 'Tu au travail : fréquent au Québec et dans les jeunes entreprises ; vous avec les clients et dans les entreprises traditionnelles.'),
        b('In doubt, start with vous and follow the other person.', 'Dans le doute, commencez par vous et suivez votre interlocuteur.'),
        b('Formal: conditional (pourriez-vous), precise verbs (transmettre, discuter), formal closing.', 'Formel : conditionnel (pourriez-vous), verbes précis (transmettre, discuter), formule finale soutenue.'),
      ],
      vocab: [['tutoyer', b('to use “tu”', 'dire tu')], ['vouvoyer', b('to use “vous”', 'dire vous')], ['faire le point', b('to review progress', 'faire un bilan')], ['transmettre', b('to send / pass on', 'envoyer')]],
    },
  },
];

export default lessons;
