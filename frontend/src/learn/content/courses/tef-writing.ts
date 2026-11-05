// TEF Canada · Expression écrite, A1 → C2. From forms and notes to the two
// TEF sections: continuing a news story (A) and arguing in a letter (B).
import { b, type Lesson } from '../../types';
import { card, pick } from '../kit';

const lessons: Lesson[] = [
  // ── A1 ──
  {
    id: 'tef-writing-1',
    level: 'A1',
    slug: { en: 'a1-forms-notes-and-short-messages', fr: 'a1-formulaires-mots-et-messages-courts' },
    title: b('A1 · Forms, notes and short messages', 'A1 · Formulaires, mots et messages courts'),
    summary: b('Fill in a form correctly and write a short practical message.', 'Remplir correctement un formulaire et écrire un court message pratique.'),
    objectives: [b('Fill in a form without mistakes', 'Remplir un formulaire sans erreur'), b('Write the date, the time and an address in French', 'Écrire la date, l’heure et une adresse en français'), b('Write a practical message of 3–4 sentences', 'Écrire un message pratique de 3 ou 4 phrases')],
    minutes: 14,
    steps: [
      card(b('Writing numbers, dates and times', 'Écrire nombres, dates et heures'), b('In French: **le 3 mai 2025** (no capital for months), **14 h 30** (24-hour clock), **1 250,50 $** (space for thousands, comma for decimals). Days and months take **no capital letter**: lundi, juillet.', 'En français : **le 3 mai 2025** (pas de majuscule aux mois), **14 h 30**, **1 250,50 $** (espace pour les milliers, virgule pour les décimales). Jours et mois **sans majuscule** : lundi, juillet.')),
      pick('A1', b('Which date is written correctly in French?', 'Quelle date est bien écrite en français ?'), ['le 3 mai', 'le 3 Mai', 'Mai 3', 'le Mai 3']),
      pick('A1', b('Which time is written the French way?', 'Quelle heure est écrite à la française ?'), ['18 h 15', '6:15 PM', '18.15h', '6 h 15 PM']),
      pick('A1', b('Choose the right word.', 'Choisissez le bon mot.'), ['suis', 'ai', 'est', 'es'], { fr: 'Bonjour, je ___ votre nouvelle voisine.' }),
      pick('A1', b('Which message is complete and polite?', 'Quel message est complet et poli ?'), ['Bonjour, je suis malade aujourd’hui. Je ne viens pas au cours. Merci, Sara', 'Malade. Pas cours.', 'Je viens pas.', 'Cours non.']),
      { kind: 'fill', prompt: b('Complete the note.', 'Complétez le mot.'), text: 'Bonjour, le plombier vient ___ 10 h. Laissez la porte ouverte, ___ plaît.', answers: [['à'], ['s’il vous', 's\'il vous']], choices: [['à', 'en', 'au'], ['s’il vous', 's’il te', 'merci']] },
      { kind: 'order', prompt: b('Build the sentence.', 'Construisez la phrase.'), words: ['Je', 'ne', 'peux', 'pas', 'venir', 'lundi.'], tr: 'I can’t come on Monday.' },
      { kind: 'write', prompt: b('Write a note to your neighbour.', 'Écrivez un mot à votre voisin.'), task: 'Vous partez en voyage une semaine. Écrivez un mot à votre voisin : demandez-lui de récupérer votre courrier et d’arroser vos plantes. Donnez la date de votre retour. (30 à 50 mots)', min: 30, max: 50, checklist: [b('A greeting and a signature', 'Une salutation et une signature'), b('The two requests', 'Les deux demandes'), b('The return date', 'La date de retour'), b('Polite: s’il vous plaît, merci', 'Politesse : s’il vous plaît, merci')], phrases: ['Est-ce que vous pouvez…', 'Je reviens le…', 'Merci beaucoup !'], model: 'Bonjour Monsieur Gagnon,\nJe pars en voyage demain. Est-ce que vous pouvez récupérer mon courrier et arroser mes plantes, s’il vous plaît ? La clé est dans votre boîte aux lettres. Je reviens le samedi 14 juin.\nMerci beaucoup !\nFatou' },
    ],
    notes: {
      points: [
        b('No capital letter for days and months: lundi, le 3 mai.', 'Pas de majuscule aux jours et aux mois : lundi, le 3 mai.'),
        b('Times: 18 h 15. Amounts: 1 250,50 $.', 'Heures : 18 h 15. Montants : 1 250,50 $.'),
        b('A practical message: greeting → request / information → thanks → signature.', 'Un message pratique : salutation → demande / information → remerciement → signature.'),
        b('Polite request: Est-ce que vous pouvez…, s’il vous plaît ?', 'Demande polie : Est-ce que vous pouvez…, s’il vous plaît ?'),
      ],
      vocab: [['le courrier', b('mail', 'lettres reçues')], ['arroser', b('to water', 'donner de l’eau aux plantes')], ['la boîte aux lettres', b('mailbox', 'boîte du courrier')], ['le plombier', b('plumber', 'répare l’eau')]],
    },
  },

  // ── A2 ──
  {
    id: 'tef-writing-2',
    level: 'A2',
    slug: { en: 'a2-simple-emails-request-inform', fr: 'a2-courriels-simples-demander-informer' },
    title: b('A2 · Simple emails: request and inform', 'A2 · Courriels simples : demander et informer'),
    summary: b('Write short emails to a service or an employer: request information, inform of a problem, confirm.', 'Écrire de courts courriels à un service ou à un employeur : demander une information, signaler un problème, confirmer.'),
    objectives: [b('Use the structure of a formal email', 'Employer la structure d’un courriel formel'), b('Request information politely', 'Demander une information poliment'), b('Report a problem clearly', 'Signaler clairement un problème')],
    minutes: 15,
    steps: [
      card(b('The formal email', 'Le courriel formel'), b('**Objet** (subject line) → **Bonjour Madame / Monsieur,** → reason (Je vous écris pour…) → details → request (Pourriez-vous… ?) → **Merci d’avance. Cordialement,** → first name + family name.', '**Objet** → **Bonjour Madame / Monsieur,** → raison (Je vous écris pour…) → détails → demande (Pourriez-vous… ?) → **Merci d’avance. Cordialement,** → prénom + nom.')),
      pick('A2', b('Which subject line is best for a request about class schedules?', 'Quel objet convient le mieux à une demande d’horaires de cours ?'), ['Demande d’information – horaires des cours du soir', 'Bonjour', 'Question', 'Urgent !!!']),
      pick('A2', b('Which sentence explains the reason for writing?', 'Quelle phrase explique la raison du courriel ?'), ['Je vous écris pour signaler un problème de chauffage dans mon appartement.', 'Il fait froid.', 'Chauffage.', 'Je suis Paul.']),
      pick('A2', b('Choose the right word.', 'Choisissez le bon mot.'), ['depuis', 'il y a', 'pendant', 'pour'], { fr: 'Le chauffage ne fonctionne pas ___ trois jours.', explain: b('Depuis + duration: an action that started in the past and is still going on.', 'Depuis + durée : une situation commencée dans le passé qui continue.') }),
      pick('A2', b('Which closing is formal?', 'Quelle formule de fin est formelle ?'), ['Merci d’avance. Cordialement, Paul Martin', 'Bisous, Paul', 'À plus !', 'Salut !']),
      { kind: 'categorize', prompt: b('Put each sentence in the right part of the email.', 'Placez chaque phrase dans la bonne partie du courriel.'), buckets: [b('Opening', 'Ouverture'), b('Body', 'Corps'), b('Closing', 'Clôture')], items: [{ text: 'Bonjour Madame,', bucket: 0 }, { text: 'Je vous écris au sujet de ma facture du mois de mai.', bucket: 1 }, { text: 'Le montant me semble trop élevé.', bucket: 1 }, { text: 'Merci d’avance pour votre aide.', bucket: 2 }, { text: 'Cordialement,', bucket: 2 }] },
      { kind: 'write', prompt: b('Report a problem to your landlord.', 'Signalez un problème à votre propriétaire.'), task: 'Votre machine à laver, fournie avec l’appartement, ne fonctionne plus. Écrivez un courriel à votre propriétaire : décrivez le problème, depuis quand il existe, et demandez une réparation. Proposez des disponibilités. (60 à 80 mots)', min: 60, max: 80, checklist: [b('A subject line and a formal greeting', 'Un objet et une salutation formelle'), b('The problem and since when (depuis)', 'Le problème et depuis quand (depuis)'), b('A polite request (Pourriez-vous…)', 'Une demande polie (Pourriez-vous…)'), b('Your availability', 'Vos disponibilités')], phrases: ['Je vous écris pour…', 'depuis', 'Pourriez-vous…', 'Je suis disponible…', 'Cordialement,'], model: 'Objet : Machine à laver en panne\n\nBonjour Monsieur Lavoie,\nJe vous écris pour vous signaler un problème. La machine à laver de l’appartement ne fonctionne plus depuis samedi : elle se remplit d’eau, mais le tambour ne tourne pas. Pourriez-vous envoyer un technicien pour la réparer ? Je suis disponible le matin avant 9 h et tous les jours après 17 h.\nMerci d’avance.\nCordialement,\nLina Haddad, appartement 4' },
    ],
    notes: {
      points: [
        b('Formal email: subject → Bonjour Madame / Monsieur → reason → details → request → Cordialement.', 'Courriel formel : objet → Bonjour Madame / Monsieur → raison → détails → demande → Cordialement.'),
        b('Reason: **Je vous écris pour / au sujet de…**', 'Raison : **Je vous écris pour / au sujet de…**'),
        b('**Depuis** + duration: the problem started in the past and continues.', '**Depuis** + durée : le problème a commencé dans le passé et continue.'),
        b('Request: **Pourriez-vous…? Serait-il possible de…?**', 'Demande : **Pourriez-vous… ? Serait-il possible de… ?**'),
      ],
      vocab: [['l’objet (m.)', b('subject line', 'titre du courriel')], ['signaler', b('to report', 'informer d’un problème')], ['le tambour', b('drum (washing machine)', 'partie qui tourne')], ['les disponibilités', b('availability', 'moments libres')], ['la facture', b('bill', 'document à payer')]],
    },
  },

  // ── B1 ──
  {
    id: 'tef-writing-3',
    level: 'B1',
    slug: { en: 'b1-narrate-an-event-in-the-past', fr: 'b1-raconter-un-evenement-au-passe' },
    title: b('B1 · Narrate an event in the past', 'B1 · Raconter un événement au passé'),
    summary: b('Learn to tell an event like a journalist: third person, past tenses, chronology, witnesses.', 'Apprendre à raconter un événement comme un journaliste : troisième personne, temps du passé, chronologie, témoins.'),
    objectives: [b('Narrate in the third person with past tenses', 'Raconter à la troisième personne avec les temps du passé'), b('Organise events chronologically', 'Organiser les événements chronologiquement'), b('Report what a witness said', 'Rapporter les paroles d’un témoin')],
    minutes: 15,
    steps: [
      card(b('Toward section A: the news story', 'Vers la section A : le fait divers'), b('TEF writing section A gives you the **beginning of a news story**; you write the **continuation** (at least 80 words) in 25 minutes. Before tackling it, you must master narrating an event: **who, what, where, when, how**, in the third person and in the past.', 'La section A de l’expression écrite du TEF donne le **début d’un fait divers** ; vous écrivez la **suite** (au moins 80 mots) en 25 minutes. Avant de l’aborder, il faut maîtriser le récit d’un événement : **qui, quoi, où, quand, comment**, à la troisième personne et au passé.'), { variant: 'exam' }),
      card(b('Journalist tenses', 'Les temps du journaliste'), b('**Passé composé** for events (les pompiers sont arrivés), **imparfait** for circumstances (il faisait nuit), **plus-que-parfait** for what happened before (le conducteur avait bu). Witnesses: **selon un témoin**, **d’après la police**, **un passant raconte que…**', '**Passé composé** pour les événements (les pompiers sont arrivés), **imparfait** pour les circonstances (il faisait nuit), **plus-que-parfait** pour l’antériorité (le conducteur avait bu). Témoins : **selon un témoin**, **d’après la police**, **un passant raconte que…**'), { variant: 'tip' }),
      pick('B1', b('Choose the right tense.', 'Choisissez le bon temps.'), ['avait oublié', 'a oublié', 'oubliait', 'oubliera'], { fr: 'Le propriétaire est rentré tard : il ___ ses clés au bureau.', explain: b('An action before another past action: plus-que-parfait.', 'Une action antérieure à une autre action passée : plus-que-parfait.') }),
      pick('B1', b('Which sentence reports a witness’s words?', 'Quelle phrase rapporte les paroles d’un témoin ?'), ['Selon une voisine, l’homme semblait très calme.', 'L’homme est calme.', 'Je pense que l’homme est calme.', 'Calme, l’homme.']),
      pick('B1', b('Which connector shows a later moment?', 'Quel connecteur marque un moment ultérieur ?'), ['Quelques minutes plus tard,', 'Auparavant,', 'La veille,', 'Au même moment,']),
      pick('B1', b('Choose the right tense.', 'Choisissez le bon temps.'), ['neigeait', 'a neigé', 'neigera', 'neige'], { fr: 'Ce soir-là, il ___ abondamment sur Québec.' }),
      { kind: 'order', prompt: b('Put the events in order.', 'Remettez les événements dans l’ordre.'), words: ['Les', 'pompiers', 'sont', 'arrivés', 'rapidement', 'et', 'ont', 'éteint', 'le', 'feu.'], tr: 'The firefighters arrived quickly and put out the fire.' },
      { kind: 'write', prompt: b('Narrate an event in the past.', 'Racontez un événement au passé.'), task: 'Racontez, comme dans un journal local, un événement inhabituel qui s’est produit dans votre quartier (une fête improvisée, une panne d’électricité, un animal perdu…). Utilisez la troisième personne et précisez qui, quoi, où, quand et comment. (90 à 110 mots)', min: 90, max: 110, checklist: [b('Third person and past tenses', 'Troisième personne et temps du passé'), b('Who, what, where, when, how', 'Qui, quoi, où, quand, comment'), b('At least one witness', 'Au moins un témoin'), b('Time connectors', 'Des connecteurs de temps')], phrases: ['Mardi soir,', 'Selon un témoin,', 'Quelques minutes plus tard,', 'Finalement,'], model: 'Mardi soir, une panne d’électricité a plongé le quartier Saint-Roch dans le noir pendant trois heures. Il était environ dix-neuf heures et beaucoup de familles préparaient le souper. Selon un résident, la panne avait commencé par un bruit sourd près du poste électrique. Quelques minutes plus tard, les voisins sont sortis dans la rue avec des lampes de poche. Certains ont même apporté des chaises et des boissons : une véritable fête improvisée ! Finalement, les techniciens d’Hydro-Québec ont rétabli le courant vers vingt-deux heures. « On ne se parlait jamais, maintenant on se connaît tous », raconte une voisine en souriant.' },
    ],
    notes: {
      points: [
        b('TEF section A: continue a news story, at least 80 words, 25 minutes.', 'TEF section A : continuer un fait divers, au moins 80 mots, 25 minutes.'),
        b('Passé composé (events), imparfait (circumstances), plus-que-parfait (earlier actions).', 'Passé composé (événements), imparfait (circonstances), plus-que-parfait (antériorité).'),
        b('Witnesses: selon un témoin, d’après la police, un passant raconte que…', 'Témoins : selon un témoin, d’après la police, un passant raconte que…'),
        b('Chronology: ce soir-là, quelques minutes plus tard, peu après, finalement.', 'Chronologie : ce soir-là, quelques minutes plus tard, peu après, finalement.'),
      ],
      vocab: [['la panne', b('outage, breakdown', 'arrêt de fonctionnement')], ['rétablir', b('to restore', 'remettre en marche')], ['le témoin', b('witness', 'personne qui a vu')], ['improvisé', b('impromptu', 'non prévu')], ['éteindre', b('to put out', 'arrêter un feu')]],
    },
  },

  // ── B2 ──
  {
    id: 'tef-writing-4',
    level: 'B2',
    slug: { en: 'b2-section-a-continue-a-news-story', fr: 'b2-section-a-ecrire-la-suite-d-un-fait-divers' },
    title: b('B2 · Section A: continue a news story', 'B2 · Section A : écrire la suite d’un fait divers'),
    summary: b('Write the continuation of a news story in the style of a journalist: coherent with the beginning, precise and lively.', 'Écrire la suite d’un fait divers dans le style d’un journaliste : cohérente avec le début, précise et vivante.'),
    objectives: [b('Stay consistent with the given beginning', 'Rester cohérent avec le début donné'), b('Develop the story: event, consequences, reactions', 'Développer l’histoire : événement, conséquences, réactions'), b('Use a neutral journalistic style', 'Employer un style journalistique neutre')],
    minutes: 16,
    steps: [
      card(b('The method in four moves', 'La méthode en quatre temps'), b('1. **Reread the beginning**: who, where, which tense? Keep them. 2. **Develop the event**: what happened next? 3. **Consequences**: injured, damage, measures taken. 4. **Reactions and ending**: a witness, an official, a final sentence that closes the story.', '1. **Relisez le début** : qui, où, quel temps ? Gardez-les. 2. **Développez l’événement** : que s’est-il passé ensuite ? 3. **Conséquences** : blessés, dégâts, mesures prises. 4. **Réactions et fin** : un témoin, un responsable, une phrase finale qui clôt l’histoire.'), { variant: 'exam' }),
      pick('B2', b('The story begins: “Hier matin, un camion de livraison s’est renversé sur l’autoroute 20.” Which continuation is consistent?', 'Le fait divers commence : « Hier matin, un camion de livraison s’est renversé sur l’autoroute 20. » Quelle suite est cohérente ?'), ['Sa cargaison de pommes s’est répandue sur la chaussée, provoquant un embouteillage de plusieurs kilomètres.', 'Demain, je vais acheter un camion.', 'Le camion est un véhicule à quatre roues.', 'J’aime beaucoup les autoroutes.']),
      pick('B2', b('Which sentence has a neutral journalistic style?', 'Quelle phrase a un style journalistique neutre ?'), ['Aucun blessé n’est à déplorer, selon les services d’urgence.', 'Heureusement, personne n’a eu bobo !', 'C’était trop fou, personne blessé !', 'Moi je trouve que c’est grave.']),
      pick('B2', b('Choose the right word.', 'Choisissez le bon mot.'), ['dont', 'que', 'qui', 'où'], { fr: 'Le conducteur, ___ le camion transportait des fruits, a été légèrement blessé.' }),
      pick('B2', b('Which sentence closes a news story well?', 'Quelle phrase conclut bien un fait divers ?'), ['La circulation a été entièrement rétablie en début d’après-midi.', 'Voilà, c’est la fin de mon texte.', 'Et ensuite ?', 'Je ne sais pas comment finir.']),
      { kind: 'match', prompt: b('Match each journalistic phrase with its meaning.', 'Associez chaque tournure journalistique à son sens.'), pairs: [['aucun blessé n’est à déplorer', b('no one was injured', 'personne n’a été blessé')], ['une enquête a été ouverte', b('an investigation has begun', 'la police cherche la cause')], ['les secours sont intervenus', b('emergency services arrived', 'les pompiers / ambulanciers sont venus')], ['plus de peur que de mal', b('more fear than harm', 'pas de conséquence grave')], ['sur les lieux', b('at the scene', 'à l’endroit de l’événement')]] },
      { kind: 'write', prompt: b('TEF section A: continue the news story.', 'TEF section A : écrivez la suite du fait divers.'), task: 'Début de l’article : « Samedi après-midi, les clients d’un centre commercial de Laval ont assisté à une scène inattendue : un chevreuil est entré dans le magasin de vêtements par la porte principale… »\nÉcrivez la suite de cet article. (80 à 120 mots)', min: 80, max: 120, checklist: [b('Consistent with the beginning (place, time, past tense)', 'Cohérent avec le début (lieu, moment, temps du passé)'), b('Event → consequences → reactions → ending', 'Événement → conséquences → réactions → fin'), b('A witness quoted', 'Un témoin cité'), b('Neutral journalistic style', 'Style journalistique neutre')], phrases: ['Selon un employé,', 'les secours sont intervenus', 'plus de peur que de mal', 'sur les lieux'], model: 'Affolé, l’animal a traversé les rayons en renversant plusieurs présentoirs, sous les yeux des clients stupéfaits. Un employé a rapidement fermé les portes pour éviter qu’il ne se blesse dans le stationnement. « Il cherchait la sortie, il avait plus peur que nous », raconte une vendeuse. Les agents de protection de la faune, arrivés sur les lieux vingt minutes plus tard, ont réussi à endormir le chevreuil avant de le relâcher dans un boisé voisin. Aucun blessé n’est à déplorer, mais les dégâts dans le magasin sont importants. Selon la direction, la boutique rouvrira dès lundi matin. Plus de peur que de mal, donc, pour cette visite pour le moins inhabituelle.' },
    ],
    notes: {
      points: [
        b('Section A method: reread the beginning → develop → consequences → reactions and ending.', 'Méthode section A : relire le début → développer → conséquences → réactions et fin.'),
        b('Keep the place, the characters and the past tense of the beginning.', 'Gardez le lieu, les personnages et le temps du passé du début.'),
        b('Journalistic phrases: aucun blessé n’est à déplorer, les secours sont intervenus, sur les lieux, une enquête a été ouverte.', 'Tournures journalistiques : aucun blessé n’est à déplorer, les secours sont intervenus, sur les lieux, une enquête a été ouverte.'),
        b('Quote a witness with « … » and a reporting verb: raconte, explique, confie.', 'Citez un témoin avec « … » et un verbe introducteur : raconte, explique, confie.'),
      ],
      vocab: [['le chevreuil', b('deer (Québec)', 'cerf de Virginie')], ['affolé', b('panicked', 'pris de panique')], ['le présentoir', b('display stand', 'meuble d’exposition')], ['relâcher', b('to release', 'remettre en liberté')], ['la chaussée', b('roadway', 'partie de la route')]],
    },
  },

  // ── C1 ──
  {
    id: 'tef-writing-5',
    level: 'C1',
    slug: { en: 'c1-section-b-argued-letter', fr: 'c1-section-b-lettre-argumentee' },
    title: b('C1 · Section B: the argued letter', 'C1 · Section B : la lettre argumentée'),
    summary: b('Write the letter of section B: react to a statement, defend your position with structured arguments, at least 200 words.', 'Rédiger la lettre de la section B : réagir à une affirmation, défendre votre position avec des arguments structurés, au moins 200 mots.'),
    objectives: [b('Structure an argued letter', 'Structurer une lettre argumentée'), b('Develop three arguments with examples', 'Développer trois arguments avec des exemples'), b('Refute the opposite view', 'Réfuter le point de vue opposé')],
    minutes: 17,
    steps: [
      card(b('Section B in brief', 'La section B en bref'), b('In 35 minutes, you react to a statement (often published in a newspaper or on a forum) by writing a letter of **at least 200 words** that defends your point of view. Graders check the **structure**, the **quality of arguments** and the **range of language**.', 'En 35 minutes, vous réagissez à une affirmation (souvent publiée dans un journal ou sur un forum) en écrivant une lettre d’**au moins 200 mots** qui défend votre point de vue. Les correcteurs évaluent la **structure**, la **qualité des arguments** et la **richesse de la langue**.'), { variant: 'exam' }),
      card(b('The plan', 'Le plan'), b('**Opening** (Madame, Monsieur,) + reference to the statement → **thesis** → **3 arguments**, each with an example → **refutation** of the opposite view → **conclusion** (summary + proposal) → **formal closing**.', '**Ouverture** (Madame, Monsieur,) + rappel de l’affirmation → **thèse** → **3 arguments** avec chacun un exemple → **réfutation** du point de vue opposé → **conclusion** (bilan + proposition) → **formule de politesse**.'), { variant: 'tip' }),
      pick('C1', b('Which opening refers clearly to the statement?', 'Quelle ouverture fait clairement référence à l’affirmation ?'), ['Madame, Monsieur, c’est avec un vif intérêt que j’ai lu, dans votre édition du 3 mars, l’affirmation selon laquelle le travail à domicile nuirait à la productivité.', 'Bonjour, ça va ?', 'Je vais écrire une lettre.', 'Voici ma lettre de 200 mots.']),
      pick('C1', b('Which sentence refutes the opposite view?', 'Quelle phrase réfute le point de vue opposé ?'), ['Certains objecteront que les employés se dispersent à la maison ; or, plusieurs études montrent l’inverse.', 'Les autres ont tort.', 'Je n’aime pas cette idée.', 'Tout le monde pense comme moi.']),
      pick('C1', b('Choose the right connector.', 'Choisissez le bon connecteur.'), ['Par ailleurs', 'Pourtant', 'Bref', 'Car'], { fr: 'Le télétravail réduit les déplacements. ___, il permet de mieux concilier vie familiale et vie professionnelle.' }),
      pick('C1', b('Which formal closing is correct?', 'Quelle formule de politesse est correcte ?'), ['Je vous prie d’agréer, Madame, Monsieur, l’expression de mes salutations distinguées.', 'Je vous prie d’agréer mes bisous.', 'Salutations, à plus.', 'Merci, bye.']),
      { kind: 'categorize', prompt: b('Where does each sentence go?', 'Où se place chaque phrase ?'), buckets: [b('Thesis', 'Thèse'), b('Argument', 'Argument'), b('Refutation', 'Réfutation'), b('Conclusion', 'Conclusion')], items: [{ text: 'Je suis convaincu que la gratuité des transports est une mesure d’avenir.', bucket: 0 }, { text: 'D’abord, elle réduirait la pollution en ville.', bucket: 1 }, { text: 'On m’objectera son coût ; il est pourtant inférieur à celui des embouteillages.', bucket: 2 }, { text: 'Pour toutes ces raisons, j’invite les élus à tenter l’expérience.', bucket: 3 }] },
      { kind: 'write', prompt: b('TEF section B: an argued letter.', 'TEF section B : une lettre argumentée.'), task: 'Vous lisez dans un journal : « Les enfants devraient commencer à utiliser un téléphone intelligent le plus tôt possible : c’est l’outil de leur avenir. » Vous n’êtes pas d’accord. Écrivez une lettre au journal pour défendre votre point de vue avec au moins trois arguments. (200 à 250 mots)', min: 200, max: 250, checklist: [b('Formal opening referring to the statement', 'Ouverture formelle qui rappelle l’affirmation'), b('A clear thesis', 'Une thèse claire'), b('Three arguments with examples', 'Trois arguments avec exemples'), b('A refutation and a conclusion with a proposal', 'Une réfutation et une conclusion avec une proposition'), b('Formal closing', 'Formule de politesse')], phrases: ['C’est avec un vif intérêt que j’ai lu…', 'Je ne partage pas cette opinion.', 'Certains objecteront que… ; or…', 'Par ailleurs,', 'Je vous prie d’agréer…'], model: 'Madame, Monsieur,\n\nC’est avec un vif intérêt que j’ai lu, dans votre dernière édition, qu’il faudrait équiper les enfants d’un téléphone intelligent le plus tôt possible. Je ne partage pas du tout cette opinion.\n\nD’abord, de nombreux pédiatres rappellent que l’usage précoce des écrans nuit au sommeil et à la concentration. Un enfant de huit ans qui consulte son téléphone le soir s’endort plus tard et apprend moins bien le lendemain.\n\nEnsuite, le téléphone expose les plus jeunes à des contenus et à des rencontres qu’ils ne sont pas en mesure de gérer. Le cyberharcèlement, par exemple, touche aujourd’hui des élèves dès l’école primaire.\n\nPar ailleurs, un enfant a surtout besoin de jouer dehors, de lire et de parler avec ses proches : autant d’activités que l’écran remplace trop souvent.\n\nCertains objecteront que le téléphone est l’outil de l’avenir et qu’il faut s’y habituer tôt ; or, apprendre à s’en servir prend quelques semaines, alors que les habitudes de sommeil et d’attention se construisent pendant des années.\n\nC’est pourquoi je propose plutôt d’attendre l’entrée au secondaire et d’accompagner cette première utilisation par une véritable éducation au numérique, à l’école comme à la maison.\n\nJe vous prie d’agréer, Madame, Monsieur, l’expression de mes salutations distinguées.\n\nNadia Benali' },
    ],
    notes: {
      points: [
        b('Section B: a letter of at least 200 words in 35 minutes, defending your view.', 'Section B : une lettre d’au moins 200 mots en 35 minutes, qui défend votre point de vue.'),
        b('Plan: opening + reference → thesis → 3 arguments + examples → refutation → conclusion + proposal → closing.', 'Plan : ouverture + rappel → thèse → 3 arguments + exemples → réfutation → conclusion + proposition → formule de politesse.'),
        b('Refutation: **Certains objecteront que… ; or…** / **On m’opposera que… ; pourtant…**', 'Réfutation : **Certains objecteront que… ; or…** / **On m’opposera que… ; pourtant…**'),
        b('Closing: Je vous prie d’agréer, Madame, Monsieur, l’expression de mes salutations distinguées.', 'Formule : Je vous prie d’agréer, Madame, Monsieur, l’expression de mes salutations distinguées.'),
      ],
      vocab: [['le cyberharcèlement', b('cyberbullying', 'harcèlement en ligne')], ['précoce', b('early', 'qui arrive tôt')], ['objecter', b('to object', 'opposer un argument')], ['or', b('yet, however (in reasoning)', 'pourtant')], ['concilier', b('to reconcile, balance', 'accorder')]],
    },
  },

  // ── C2 ──
  {
    id: 'tef-writing-6',
    level: 'C2',
    slug: { en: 'c2-persuasive-writing-with-style', fr: 'c2-ecrire-pour-persuader-avec-style' },
    title: b('C2 · Persuasive writing with style', 'C2 · Écrire pour persuader, avec style'),
    summary: b('Write a C2 letter: a strong thesis, elegant transitions, rhetorical devices and impeccable register.', 'Écrire une lettre de niveau C2 : une thèse forte, des transitions élégantes, des procédés rhétoriques et un registre impeccable.'),
    objectives: [b('Write elegant transitions between paragraphs', 'Rédiger des transitions élégantes entre les paragraphes'), b('Use rhetorical devices in writing', 'Employer des procédés rhétoriques à l’écrit'), b('Keep an impeccable formal register', 'Garder un registre soutenu impeccable')],
    minutes: 17,
    steps: [
      card(b('Transitions, not just connectors', 'Des transitions, pas seulement des connecteurs'), b('At C2, paragraphs are linked by **sentences**, not only by words: “**Si cet argument est de poids, il n’est pas le seul.**” / “**Reste une objection, plus sérieuse.**” / “**Encore faut-il s’entendre sur ce que l’on entend par…**”', 'Au C2, les paragraphes sont liés par des **phrases**, pas seulement par des mots : « **Si cet argument est de poids, il n’est pas le seul.** » / « **Reste une objection, plus sérieuse.** » / « **Encore faut-il s’entendre sur ce que l’on entend par…** »')),
      pick('C2', b('Which is an elegant transition to a second argument?', 'Quelle est une transition élégante vers un deuxième argument ?'), ['Si l’argument économique est de poids, il n’est pas le seul à plaider en faveur de cette réforme.', 'Deuxième argument :', 'Et puis aussi,', 'Maintenant je passe à autre chose.']),
      pick('C2', b('Which sentence uses a rhetorical question effectively?', 'Quelle phrase emploie efficacement une question rhétorique ?'), ['Comment prétendre défendre l’environnement tout en subventionnant les énergies fossiles ?', 'Est-ce que vous aimez l’environnement ?', 'L’environnement, c’est quoi ?', 'Pourquoi pas ?']),
      pick('C2', b('Choose the correct form.', 'Choisissez la forme correcte.'), ['Reste', 'Restent', 'Il reste que', 'Resté'], { fr: '___ une objection, plus sérieuse : celle du coût.', explain: b('“Reste une objection” = there remains an objection (inverted subject, formal).', '« Reste une objection » = il reste une objection (sujet inversé, soutenu).') }),
      pick('C2', b('Which conclusion has a C2 style?', 'Quelle conclusion a un style C2 ?'), ['Loin d’être une utopie, cette réforme apparaît dès lors comme une nécessité, pour peu qu’on veuille bien s’en donner les moyens.', 'Donc voilà, c’est une bonne réforme.', 'En conclusion, je pense que c’est bien.', 'Pour finir, j’ai fini.']),
      { kind: 'match', prompt: b('Match each formal structure with its meaning.', 'Associez chaque structure soutenue à son sens.'), pairs: [['pour peu que', b('provided that', 'à condition que')], ['loin de', b('far from', 'au contraire de')], ['dès lors', b('consequently', 'par conséquent')], ['quand bien même', b('even if', 'même si')], ['si tant est que', b('assuming that', 'à supposer que')]] },
      { kind: 'write', prompt: b('A C2 letter to the editor.', 'Une lettre au journal de niveau C2.'), task: 'Un éditorial affirme : « Apprendre une langue étrangère est devenu inutile à l’heure de la traduction automatique. » Rédigez une lettre au journal qui réfute cette affirmation avec élégance et précision. (220 à 260 mots)', min: 220, max: 260, checklist: [b('A strong, nuanced thesis', 'Une thèse forte et nuancée'), b('Sentence-level transitions between paragraphs', 'Des transitions par des phrases entre les paragraphes'), b('At least one rhetorical device', 'Au moins un procédé rhétorique'), b('Formal register throughout', 'Registre soutenu du début à la fin')], phrases: ['Si cet argument…, il n’est pas le seul.', 'Reste une objection…', 'Comment prétendre… ?', 'pour peu que', 'Loin de…'], model: 'Madame, Monsieur,\n\nVotre éditorial du 12 avril affirme qu’apprendre une langue étrangère serait devenu inutile à l’heure de la traduction automatique. Permettez-moi d’en douter vivement.\n\nCertes, les outils de traduction ont accompli des progrès spectaculaires : ils permettent aujourd’hui de lire un menu, de déchiffrer un courriel ou de demander son chemin. Mais comment prétendre qu’une langue se réduit à ces échanges utilitaires ? Parler la langue de l’autre, c’est saisir l’humour d’une conversation, la nuance d’une hésitation, l’émotion d’un silence : autant de subtilités qu’aucun algorithme ne restitue.\n\nSi cet argument culturel est de poids, il n’est pas le seul. Apprendre une langue exerce la mémoire, la concentration et la souplesse intellectuelle ; de nombreuses études en neurosciences le confirment. Renoncer à cet apprentissage, ce serait priver les jeunes d’une gymnastique de l’esprit précieuse.\n\nReste une objection, plus pragmatique : le temps consacré aux langues ne serait-il pas mieux employé ailleurs ? Ce serait oublier que, sur le marché du travail, la maîtrise d’une langue demeure un atout décisif, précisément parce qu’elle permet ce que la machine ne sait pas faire : créer la confiance.\n\nLoin d’être obsolète, l’apprentissage des langues apparaît dès lors plus nécessaire que jamais, pour peu que l’on veuille bien voir dans la traduction automatique un outil, et non un substitut.\n\nJe vous prie d’agréer, Madame, Monsieur, l’expression de mes salutations distinguées.\n\nMarc-André Leclerc' },
    ],
    notes: {
      points: [
        b('Link paragraphs with sentences: “Si cet argument est de poids, il n’est pas le seul.” “Reste une objection…”', 'Liez les paragraphes par des phrases : « Si cet argument est de poids, il n’est pas le seul. » « Reste une objection… »'),
        b('Rhetoric in writing: rhetorical question, rule of three, “Ce serait oublier que…”.', 'Rhétorique à l’écrit : question rhétorique, rythme ternaire, « Ce serait oublier que… ».'),
        b('Formal structures: pour peu que, si tant est que (+ subj.), quand bien même (+ cond.), loin de.', 'Structures soutenues : pour peu que, si tant est que (+ subj.), quand bien même (+ cond.), loin de.'),
        b('A C2 conclusion opens a perspective rather than repeating the thesis.', 'Une conclusion C2 ouvre une perspective plutôt que de répéter la thèse.'),
      ],
      vocab: [['déchiffrer', b('to decipher', 'comprendre avec effort')], ['restituer', b('to render, convey', 'rendre fidèlement')], ['un atout', b('an asset', 'un avantage')], ['obsolète', b('obsolete', 'dépassé')], ['un substitut', b('a substitute', 'un remplaçant')]],
    },
  },
];

export default lessons;
