// TEF Canada · Compréhension écrite, A1 → C2. Practical and professional
// documents: forms, notices, ads, workplace emails, press and opinion.
import { b, type Lesson } from '../../types';
import { card, read } from '../kit';

const lessons: Lesson[] = [
  // ── A1 ──
  {
    id: 'tef-reading-1',
    level: 'A1',
    slug: { en: 'a1-forms-and-practical-notices', fr: 'a1-formulaires-et-avis-pratiques' },
    title: b('A1 · Forms and practical notices', 'A1 · Formulaires et avis pratiques'),
    summary: b('Read forms, labels and short notices, and find the information you need.', 'Lire des formulaires, des étiquettes et des avis courts, et y trouver l’information utile.'),
    objectives: [b('Understand the fields of a form', 'Comprendre les rubriques d’un formulaire'), b('Read labels and practical notices', 'Lire des étiquettes et des avis pratiques'), b('Find a date, an amount or a place', 'Trouver une date, un montant ou un lieu')],
    minutes: 13,
    steps: [
      card(b('The words of forms', 'Les mots des formulaires'), b('Forms always ask for the same things: **nom** (family name), **prénom** (first name), **date de naissance**, **adresse**, **courriel**, **téléphone**, **signature**. **Cochez** = tick; **en lettres moulées** (Québec) = in block capitals.', 'Les formulaires demandent toujours la même chose : **nom**, **prénom**, **date de naissance**, **adresse**, **courriel**, **téléphone**, **signature**. **Cochez** une case ; **en lettres moulées** (Québec) = en majuscules.')),
      { kind: 'match', prompt: b('Match each field with what you write.', 'Associez chaque rubrique à ce que vous écrivez.'), pairs: [['prénom', b('first name', 'Sara')], ['nom', b('family name', 'Benali')], ['date de naissance', b('date of birth', '14/03/1990')], ['courriel', b('email', 'sara@exemple.ca')], ['lieu de naissance', b('place of birth', 'Alger')]] },
      read('A1', { title: 'Formulaire d’inscription', text: 'Nom : DUBOIS\nPrénom : Léa\nDate de naissance : 05/09/1998\nVille : Gatineau' }, 'Quel est le prénom de la personne ?', ['Léa', 'Dubois', 'Gatineau', 'Septembre']),
      read('A1', { title: 'Étiquette', text: 'Lait 2 %\nÀ consommer avant le : 12 AVRIL\nGarder au froid.' }, 'Jusqu’à quand peut-on boire ce lait ?', ['Le 12 avril', 'Le 2 avril', 'Le 12 août', 'Il n’y a pas de date']),
      read('A1', { title: 'Avis', text: 'Collecte des ordures : le lundi.\nRecyclage : le jeudi.\nSortez vos bacs la veille après 19 h.' }, 'Quel jour est le recyclage ?', ['Le jeudi', 'Le lundi', 'Le mercredi', 'Tous les jours']),
      read('A1', { title: 'Reçu', text: 'Pharmacie Santé Plus\nSirop pour la toux : 9,99 $\nTaxes : 1,50 $\nTotal : 11,49 $' }, 'Combien la personne a-t-elle payé au total ?', ['11,49 $', '9,99 $', '1,50 $', '19,99 $']),
      read('A1', { title: 'Affiche', text: 'Clinique sans rendez-vous\nLundi au vendredi : 8 h à 20 h\nSamedi : 9 h à 12 h\nDimanche : fermé' }, 'Quand la clinique est-elle fermée ?', ['Le dimanche', 'Le samedi', 'Le lundi soir', 'Tous les matins']),
      read('A1', { title: 'Note', text: 'M. Kumar,\nVotre colis est chez le voisin, appartement 3.\nLe concierge' }, 'Où est le colis ?', ['Chez le voisin de l’appartement 3', 'Chez le concierge', 'À la poste', 'Devant la porte']),
      { kind: 'fill', prompt: b('Complete the form instruction.', 'Complétez la consigne du formulaire.'), text: '___ la case correspondant à votre situation.', answers: [['Cochez']], choices: [['Cochez', 'Coupez', 'Couchez']] },
    ],
    notes: {
      points: [
        b('Forms: nom (family name), prénom (first name), date de naissance, courriel, signature.', 'Formulaires : nom, prénom, date de naissance, courriel, signature.'),
        b('Dates are written day / month / year: 05/09/1998 = 5 September 1998.', 'Les dates s’écrivent jour / mois / année : 05/09/1998 = 5 septembre 1998.'),
        b('Labels: à consommer avant le…, garder au froid, sans rendez-vous.', 'Étiquettes : à consommer avant le…, garder au froid, sans rendez-vous.'),
        b('Prices in Canada: 11,49 $ (comma for decimals, $ after the number).', 'Prix au Canada : 11,49 $ (virgule pour les décimales, $ après le nombre).'),
      ],
      vocab: [['la collecte', b('collection', 'ramassage')], ['le bac', b('bin', 'poubelle')], ['la veille', b('the day before', 'le jour précédent')], ['le concierge', b('caretaker', 'gardien de l’immeuble')], ['sans rendez-vous', b('walk-in', 'on peut venir sans réserver')]],
    },
  },

  // ── A2 ──
  {
    id: 'tef-reading-2',
    level: 'A2',
    slug: { en: 'a2-ads-schedules-simple-letters', fr: 'a2-annonces-horaires-lettres-simples' },
    title: b('A2 · Ads, schedules and simple letters', 'A2 · Annonces, horaires et lettres simples'),
    summary: b('Read job and housing ads, schedules and simple letters from services.', 'Lire des annonces d’emploi et de logement, des horaires et des lettres simples de services.'),
    objectives: [b('Compare ads and choose the right one', 'Comparer des annonces et choisir la bonne'), b('Read a schedule and its exceptions', 'Lire un horaire et ses exceptions'), b('Understand what a letter asks you to do', 'Comprendre ce qu’une lettre vous demande de faire')],
    minutes: 14,
    steps: [
      card(b('Matching a need with an ad', 'Associer un besoin à une annonce'), b('A frequent TEF question: “Marc cherche… Quelle annonce lui convient ?” List Marc’s **conditions** (price, place, schedule) and eliminate the ads that fail **one** of them.', 'Question fréquente au TEF : « Marc cherche… Quelle annonce lui convient ? » Listez les **conditions** de Marc (prix, lieu, horaire) et éliminez les annonces qui en ratent **une**.'), { variant: 'exam' }),
      read('A2', { title: 'Offres d’emploi', text: 'A. Caissier(ère), temps plein, jour, 17 $/h.\nB. Livreur(euse), soirs et fins de semaine, permis de conduire exigé.\nC. Commis d’entrepôt, nuit, 19 $/h.\nD. Réceptionniste, temps partiel, bilingue.' }, 'Ana étudie le jour et n’a pas de permis de conduire. Elle veut travailler le soir. Quelle offre peut lui convenir ?', ['Aucune des offres A, B et D ; seule C est possible la nuit', 'L’offre B', 'L’offre A', 'L’offre D'], { explain: b('B needs a licence, A is daytime, D is not said to be in the evening; only C (night) fits her schedule.', 'B exige un permis, A est de jour, D ne précise pas le soir ; seule C (nuit) est compatible.') }),
      read('A2', { title: 'Horaire de la piscine', text: 'Bain libre : lundi, mercredi, vendredi de 18 h à 20 h.\nCours d’aquaforme : mardi et jeudi à 10 h.\nFermé les jours fériés.' }, 'Quand peut-on nager librement ?', ['Le lundi, le mercredi et le vendredi soir', 'Le mardi et le jeudi matin', 'Tous les jours', 'Les jours fériés']),
      read('A2', { title: 'Lettre', text: 'Madame,\nVotre carte d’assurance maladie expire le 30 juin. Pour la renouveler, présentez-vous à un de nos bureaux avec une preuve de résidence et une photo récente.\nLa Régie' }, 'Que doit faire la personne ?', ['Renouveler sa carte en se présentant au bureau', 'Envoyer une photo par courriel', 'Payer une amende', 'Changer d’adresse']),
      read('A2', { title: 'À louer', text: '3 ½ à Laval, non meublé, 1 100 $/mois, électricité non incluse. Stationnement disponible. Animaux refusés.' }, 'Quelle information est vraie ?', ['L’électricité est en plus du loyer', 'L’appartement est meublé', 'Les chats sont acceptés', 'Il n’y a pas de stationnement']),
      read('A2', { title: 'Courriel', text: 'Bonjour à tous,\nLa réunion d’équipe de lundi est déplacée à mardi, même heure, salle B. Merci d’apporter vos rapports de la semaine.\nSophie' }, 'Qu’est-ce qui change ?', ['Le jour de la réunion', 'L’heure de la réunion', 'La salle', 'Les participants']),
      read('A2', { title: 'Promotion', text: 'Cette semaine seulement : 2 pizzas pour le prix d’une, du lundi au jeudi, à emporter uniquement.' }, 'Quelle est la condition de la promotion ?', ['Les pizzas doivent être emportées', 'Il faut manger sur place', 'Elle est valable le week-end', 'Il faut acheter trois pizzas']),
      { kind: 'match', prompt: b('Match each ad word with its meaning.', 'Associez chaque mot d’annonce à son sens.'), pairs: [['exigé', b('required', 'obligatoire')], ['non incluse', b('not included', 'à payer en plus')], ['à emporter', b('takeaway', 'pour manger ailleurs')], ['commis', b('clerk', 'employé')], ['bilingue', b('bilingual', 'qui parle deux langues')]] },
    ],
    notes: {
      points: [
        b('Ad-matching: list the person’s conditions and eliminate any ad that fails one.', 'Associer une annonce : listez les conditions de la personne et éliminez toute annonce qui en rate une.'),
        b('Schedules: watch exceptions (fermé les jours fériés, sauf le…).', 'Horaires : attention aux exceptions (fermé les jours fériés, sauf le…).'),
        b('Letters from services: find the action requested (présentez-vous, envoyez, renouvelez).', 'Lettres de services : trouvez l’action demandée (présentez-vous, envoyez, renouvelez).'),
        b('Ad words: exigé, inclus / non inclus, à emporter, temps plein / partiel.', 'Mots d’annonces : exigé, inclus / non inclus, à emporter, temps plein / partiel.'),
      ],
      vocab: [['le permis de conduire', b('driving licence', 'autorisation de conduire')], ['renouveler', b('to renew', 'refaire pour une nouvelle période')], ['la preuve de résidence', b('proof of address', 'document qui prouve l’adresse')], ['le stationnement', b('parking', 'place pour la voiture')], ['déplacer', b('to move (an event)', 'changer de moment')]],
    },
  },

  // ── B1 ──
  {
    id: 'tef-reading-3',
    level: 'B1',
    slug: { en: 'b1-workplace-emails-and-letters', fr: 'b1-courriels-et-lettres-professionnels' },
    title: b('B1 · Workplace emails and letters', 'B1 · Courriels et lettres professionnels'),
    summary: b('Understand professional emails, complaint letters and official replies: the request, the reason, the answer.', 'Comprendre des courriels professionnels, des lettres de réclamation et des réponses officielles : la demande, la raison, la réponse.'),
    objectives: [b('Identify the purpose of a professional email', 'Identifier le but d’un courriel professionnel'), b('Understand the formulas of formal letters', 'Comprendre les formules des lettres formelles'), b('Distinguish request, reason and response', 'Distinguer demande, raison et réponse')],
    minutes: 14,
    steps: [
      card(b('Formal formulas', 'Les formules formelles'), b('Professional writing has codes: **Suite à** (following), **Je me permets de** (I am writing to), **Veuillez trouver ci-joint** (please find attached), **Dans l’attente de votre réponse**, **Je vous prie d’agréer…** (closing). Recognising them helps you skip to the real content.', 'L’écrit professionnel a ses codes : **Suite à**, **Je me permets de**, **Veuillez trouver ci-joint**, **Dans l’attente de votre réponse**, **Je vous prie d’agréer…** Les reconnaître vous permet d’aller directement à l’essentiel.')),
      { kind: 'match', prompt: b('Match each formula with its function.', 'Associez chaque formule à sa fonction.'), pairs: [['Veuillez trouver ci-joint…', b('announce an attachment', 'annoncer une pièce jointe')], ['Suite à notre conversation…', b('refer to a previous exchange', 'rappeler un échange')], ['Je me permets de vous relancer…', b('send a reminder', 'relancer')], ['Dans l’attente de votre réponse…', b('ask for a reply', 'demander une réponse')], ['Nous sommes au regret de…', b('announce bad news', 'annoncer une mauvaise nouvelle')]] },
      read('B1', { title: 'Courriel', text: 'Bonjour Monsieur Chen,\nSuite à votre entrevue du 3 mars, nous avons le plaisir de vous proposer le poste d’agent administratif. Veuillez trouver ci-joint votre contrat. Merci de nous le retourner signé avant le 15 mars.\nService des ressources humaines' }, 'Que doit faire M. Chen ?', ['Signer et renvoyer le contrat avant le 15 mars', 'Passer une deuxième entrevue', 'Appeler les ressources humaines', 'Commencer à travailler le 3 mars']),
      read('B1', { title: 'Lettre de réclamation', text: 'Madame, Monsieur,\nLe 10 mai, j’ai commandé une table sur votre site. Elle m’a été livrée avec un pied cassé. Je vous demande donc de procéder à son remplacement dans les meilleurs délais, ou à défaut, à son remboursement.\nAgnès Morel' }, 'Que demande Agnès Morel en priorité ?', ['Le remplacement de la table', 'Le remboursement immédiat', 'Une réduction de prix', 'Des excuses écrites']),
      read('B1', { title: 'Réponse', text: 'Madame Morel,\nNous sommes au regret de vous informer que ce modèle n’est plus disponible. Nous procéderons donc au remboursement intégral de votre commande sous cinq jours ouvrables.' }, 'Que va-t-il se passer ?', ['La cliente sera entièrement remboursée', 'La table sera remplacée', 'La cliente recevra un autre modèle', 'La commande est annulée sans remboursement']),
      read('B1', { title: 'Note de service', text: 'À tous les employés :\nEn raison des travaux dans le stationnement, nous vous invitons à privilégier les transports en commun du 4 au 15 juin. Des laissez-passer d’autobus gratuits sont disponibles à l’accueil.' }, 'Que propose l’entreprise ?', ['Des titres de transport gratuits', 'Du télétravail pendant les travaux', 'Un stationnement temporaire', 'Des horaires plus souples']),
      read('B1', { title: 'Courriel', text: 'Bonjour Karine,\nJe me permets de vous relancer au sujet de ma demande de congé pour la semaine du 20 juillet, envoyée il y a deux semaines. Pourriez-vous me confirmer si elle est acceptée ?\nMerci,\nOmar' }, 'Pourquoi Omar écrit-il ?', ['Pour obtenir une réponse à une demande déjà faite', 'Pour demander un congé pour la première fois', 'Pour annuler son congé', 'Pour remercier Karine']),
      read('B1', { title: 'Avis', text: 'Le service à la clientèle sera exceptionnellement fermé le vendredi 1er juillet. Pour toute urgence, utilisez notre formulaire en ligne : une réponse vous sera donnée sous 24 heures.' }, 'Que faire en cas d’urgence le 1er juillet ?', ['Remplir le formulaire en ligne', 'Appeler le service client', 'Venir en personne', 'Attendre le lundi']),
      { kind: 'fill', prompt: b('Complete the email.', 'Complétez le courriel.'), text: 'Veuillez trouver ___ mon curriculum vitae.', answers: [['ci-joint']], choices: [['ci-joint', 'ci-dessous', 'ci-après']] },
    ],
    notes: {
      points: [
        b('Formulas: suite à, je me permets de, veuillez trouver ci-joint, nous sommes au regret de, dans l’attente de votre réponse.', 'Formules : suite à, je me permets de, veuillez trouver ci-joint, nous sommes au regret de, dans l’attente de votre réponse.'),
        b('Find three things: the request, the reason, the deadline.', 'Repérez trois éléments : la demande, la raison, la date limite.'),
        b('“À défaut” introduces the second choice: the first request is the priority.', '« À défaut » introduit le second choix : la première demande est prioritaire.'),
        b('“Relancer” = to remind someone who has not replied.', '« Relancer » = rappeler quelqu’un qui n’a pas répondu.'),
      ],
      vocab: [['l’entrevue (f.)', b('interview (Québec)', 'entretien d’embauche')], ['jours ouvrables', b('working days', 'jours de travail')], ['le laissez-passer', b('pass', 'titre de transport')], ['le congé', b('leave, time off', 'vacances autorisées')], ['intégral', b('full', 'complet')]],
    },
  },

  // ── B2 ──
  {
    id: 'tef-reading-4',
    level: 'B2',
    slug: { en: 'b2-press-articles-details-and-structure', fr: 'b2-articles-de-presse-details-et-structure' },
    title: b('B2 · Press articles: details and structure', 'B2 · Articles de presse : détails et structure'),
    summary: b('Read news and society articles, understand their structure and answer precise questions on details.', 'Lire des articles d’actualité et de société, comprendre leur structure et répondre à des questions précises sur les détails.'),
    objectives: [b('Find a precise detail quickly', 'Trouver vite un détail précis'), b('Understand the role of each paragraph', 'Comprendre le rôle de chaque paragraphe'), b('Recognise causes, consequences and solutions', 'Reconnaître causes, conséquences et solutions')],
    minutes: 14,
    steps: [
      card(b('Scan, then read', 'Repérer, puis lire'), b('For a detail question, **scan** for the key word (a name, a number, a date), then **read carefully** the sentence around it. Do not read the whole article word by word: the TEF rewards speed.', 'Pour une question de détail, **repérez** le mot clé (un nom, un chiffre, une date), puis **lisez attentivement** la phrase qui l’entoure. Ne lisez pas tout l’article mot à mot : le TEF récompense la rapidité.'), { variant: 'tip' }),
      read('B2', { title: 'Société', text: 'Face à la pénurie de main-d’œuvre, plusieurs entreprises de la Beauce recrutent désormais directement à l’étranger. L’une d’elles, spécialisée dans la fabrication de portes, a ainsi accueilli quarante travailleurs venus du Maroc et de Tunisie. Pour faciliter leur intégration, elle finance leurs cours de français et les aide à trouver un logement.' }, 'Comment l’entreprise facilite-t-elle l’intégration des travailleurs ?', ['Elle paie leurs cours de français et les aide à se loger', 'Elle leur offre une voiture', 'Elle double leur salaire', 'Elle les forme au Maroc']),
      read('B2', { title: 'Environnement', text: 'Depuis l’interdiction des sacs de plastique à usage unique, les commerçants constatent une hausse de l’utilisation des sacs réutilisables. Toutefois, certains experts nuancent ce succès : un sac en coton doit être utilisé plusieurs centaines de fois pour avoir un meilleur bilan environnemental qu’un sac de plastique.' }, 'Quelle nuance les experts apportent-ils ?', ['Les sacs réutilisables doivent servir très longtemps pour être écologiques', 'L’interdiction n’a eu aucun effet', 'Les sacs de plastique sont meilleurs', 'Les commerçants refusent les sacs en coton']),
      read('B2', { title: 'Santé', text: 'Le ministère lance une campagne pour rappeler que les urgences doivent être réservées aux situations graves. Pour un problème de santé mineur, les citoyens sont invités à appeler la ligne Info-Santé, accessible jour et nuit, ou à consulter une pharmacie, où les pharmaciens peuvent désormais prescrire certains médicaments.' }, 'Quel est l’objectif de la campagne ?', ['Désengorger les urgences', 'Recruter des pharmaciens', 'Fermer les urgences la nuit', 'Vendre des médicaments']),
      read('B2', { title: 'Économie', text: 'Les ventes de voitures électriques ont bondi de 40 % en un an. Cette hausse s’explique par les subventions gouvernementales et par la baisse du prix des batteries. Le manque de bornes de recharge en région freine cependant leur adoption hors des grandes villes.' }, 'Qu’est-ce qui ralentit l’achat de voitures électriques en région ?', ['Le manque de bornes de recharge', 'Le prix des batteries', 'La fin des subventions', 'Le climat']),
      read('B2', { title: 'Éducation', text: 'Une école secondaire de Sherbrooke a remplacé les devoirs à la maison par des périodes d’étude encadrées en fin de journée. Résultat après un an : moins d’inégalités entre les élèves, car tous bénéficient de l’aide d’un enseignant, y compris ceux dont les parents ne peuvent pas les accompagner.' }, 'Selon l’article, pourquoi les inégalités ont-elles diminué ?', ['Tous les élèves reçoivent la même aide à l’école', 'Les devoirs sont plus faciles', 'Les parents participent davantage', 'Les élèves ont plus de cours']),
      read('B2', { title: 'Ville', text: 'La Ville a annoncé la transformation d’un ancien stationnement en parc de quartier. Le projet, qui comprend des jeux pour enfants, des jardins collectifs et une patinoire l’hiver, sera inauguré au printemps prochain. Les commerçants voisins, d’abord inquiets, y voient maintenant une occasion d’attirer de nouveaux clients.' }, 'Comment a évolué l’opinion des commerçants ?', ['D’inquiets, ils sont devenus favorables', 'Ils ont toujours été contre', 'Ils sont restés indifférents', 'Ils ont demandé l’annulation du projet']),
      { kind: 'categorize', prompt: b('Cause, consequence or solution?', 'Cause, conséquence ou solution ?'), buckets: [b('Cause', 'Cause'), b('Consequence', 'Conséquence'), b('Solution', 'Solution')], items: [{ text: 'la pénurie de main-d’œuvre', bucket: 0 }, { text: 'des urgences débordées', bucket: 1 }, { text: 'appeler Info-Santé', bucket: 2 }, { text: 'la baisse du prix des batteries', bucket: 0 }, { text: 'recruter à l’étranger', bucket: 2 }, { text: 'moins d’inégalités entre les élèves', bucket: 1 }] },
    ],
    notes: {
      points: [
        b('Detail questions: scan for the key word, then read its sentence carefully.', 'Questions de détail : repérez le mot clé, puis lisez attentivement sa phrase.'),
        b('Press articles: fact → cause → consequence → solution or nuance.', 'Articles de presse : fait → cause → conséquence → solution ou nuance.'),
        b('“Toutefois / cependant” introduce the nuance: often the target of a question.', '« Toutefois / cependant » introduisent la nuance : souvent la cible d’une question.'),
        b('Opinion changes: “d’abord inquiets, … maintenant…”.', 'Changements d’avis : « d’abord inquiets, … maintenant… ».'),
      ],
      vocab: [['la pénurie', b('shortage', 'manque')], ['la main-d’œuvre', b('workforce', 'travailleurs')], ['la borne de recharge', b('charging station', 'point de recharge')], ['freiner', b('to slow down', 'ralentir')], ['bondir', b('to jump (figures)', 'augmenter brusquement')]],
    },
  },

  // ── C1 ──
  {
    id: 'tef-reading-5',
    level: 'C1',
    slug: { en: 'c1-opinion-pieces-tone-and-intention', fr: 'c1-tribunes-ton-et-intention' },
    title: b('C1 · Opinion pieces: tone and intention', 'C1 · Tribunes : ton et intention'),
    summary: b('Analyse opinion columns and letters to the editor: the thesis, the tone, the intention and the implicit.', 'Analyser des tribunes et des lettres ouvertes : la thèse, le ton, l’intention et l’implicite.'),
    objectives: [b('Identify the thesis of an opinion piece', 'Identifier la thèse d’une tribune'), b('Recognise the tone: ironic, indignant, measured', 'Reconnaître le ton : ironique, indigné, mesuré'), b('Understand the author’s implicit intention', 'Comprendre l’intention implicite de l’auteur')],
    minutes: 14,
    steps: [
      card(b('Tone words', 'Les mots du ton'), b('C1 questions use precise tone adjectives: **mesuré** (balanced), **indigné** (outraged), **ironique**, **alarmiste** (exaggerating the danger), **nostalgique**, **militant** (campaigning), **conciliant** (seeking agreement). Learn them: they are the options.', 'Les questions C1 emploient des adjectifs de ton précis : **mesuré**, **indigné**, **ironique**, **alarmiste**, **nostalgique**, **militant**, **conciliant**. Apprenez-les : ce sont les propositions.')),
      { kind: 'match', prompt: b('Match each tone with its description.', 'Associez chaque ton à sa description.'), pairs: [['alarmiste', b('exaggerates the danger', 'exagère le danger')], ['conciliant', b('seeks agreement', 'cherche l’accord')], ['mesuré', b('balanced, moderate', 'équilibré, modéré')], ['militant', b('campaigns for a cause', 'défend une cause')], ['nostalgique', b('regrets the past', 'regrette le passé')]] },
      read('C1', { title: 'Lettre ouverte', text: 'Monsieur le Maire,\nVous affirmez vouloir une ville « à échelle humaine ». Permettez-moi de m’étonner, dès lors, que le seul espace vert de notre quartier doive céder sa place à un stationnement de six étages. Nos enfants joueront sans doute avec plaisir entre les voitures.' }, 'Quel est le ton de la dernière phrase ?', ['Ironique', 'Enthousiaste', 'Conciliant', 'Nostalgique']),
      read('C1', { title: 'Tribune', text: 'Il ne s’agit pas de diaboliser l’intelligence artificielle, qui rend déjà d’immenses services en médecine. Mais confier à des algorithmes la sélection des candidats à un emploi, sans contrôle humain ni transparence, revient à automatiser nos préjugés.' }, 'Quelle est la thèse de l’auteur ?', ['L’IA est utile, mais son usage dans le recrutement doit être encadré', 'L’IA doit être interdite', 'L’IA ne fait aucune erreur', 'Les recruteurs humains sont inutiles']),
      read('C1', { title: 'Chronique', text: 'Autrefois, on se parlait sur le perron, on se prêtait une tondeuse, on savait le nom du voisin. Aujourd’hui, on échange des messages dans le groupe de l’immeuble sans jamais s’être croisés. Progrès, paraît-il.' }, 'Quel sentiment domine dans ce texte ?', ['La nostalgie teintée d’ironie', 'L’enthousiasme pour la technologie', 'La colère contre les voisins', 'L’indifférence']),
      read('C1', { title: 'Éditorial', text: 'Les deux camps ont des arguments légitimes : les agriculteurs défendent leur survie économique, les écologistes la qualité de l’eau. Plutôt que de les opposer, pourquoi ne pas financer la transition des fermes vers des pratiques moins polluantes ?' }, 'Quelle est l’attitude de l’éditorialiste ?', ['Conciliante', 'Alarmiste', 'Militante pour un seul camp', 'Indifférente']),
      read('C1', { title: 'Tribune', text: 'On nous répète que la hausse des loyers est la conséquence naturelle du marché. Curieuse « nature », qui permet à certains de quadrupler leurs profits pendant que des familles dorment dans leur voiture. Il est urgent que l’État reprenne la main.' }, 'Que souhaite l’auteur ?', ['Une intervention de l’État sur les loyers', 'La libéralisation complète du marché', 'La construction de stationnements', 'La baisse des impôts']),
      read('C1', { title: 'Analyse', text: 'Prétendre que le télétravail tue les centres-villes relève du raccourci. Les commerces de bureau souffrent, certes ; mais les quartiers résidentiels voient s’ouvrir cafés et boutiques. L’activité ne disparaît pas : elle se déplace.' }, 'Que veut montrer l’auteur ?', ['Le télétravail déplace l’activité plus qu’il ne la détruit', 'Le télétravail détruit l’économie', 'Les centres-villes se portent mieux que jamais', 'Les quartiers résidentiels se vident']),
    ],
    notes: {
      points: [
        b('Tone adjectives: mesuré, indigné, ironique, alarmiste, nostalgique, militant, conciliant.', 'Adjectifs de ton : mesuré, indigné, ironique, alarmiste, nostalgique, militant, conciliant.'),
        b('Irony signals: quotation marks (« nature »), “paraît-il”, “sans doute avec plaisir”.', 'Signaux d’ironie : guillemets (« nature »), « paraît-il », « sans doute avec plaisir ».'),
        b('“Il ne s’agit pas de… Mais…” → the thesis follows “mais”.', '« Il ne s’agit pas de… Mais… » → la thèse suit « mais ».'),
        b('“Relève du raccourci” = is an oversimplification.', '« Relève du raccourci » = est une simplification abusive.'),
      ],
      vocab: [['diaboliser', b('to demonise', 'présenter comme mauvais')], ['le perron', b('front steps', 'marches devant la porte')], ['reprendre la main', b('to take back control', 'reprendre le contrôle')], ['les préjugés (m.)', b('prejudice', 'idées toutes faites')], ['légitime', b('legitimate', 'justifié')]],
    },
  },

  // ── C2 ──
  {
    id: 'tef-reading-6',
    level: 'C2',
    slug: { en: 'c2-complex-texts-subtle-arguments', fr: 'c2-textes-complexes-arguments-subtils' },
    title: b('C2 · Complex texts and subtle arguments', 'C2 · Textes complexes et arguments subtils'),
    summary: b('Read dense essays and specialised texts, follow subtle reasoning and grasp the exact scope of each claim.', 'Lire des essais denses et des textes spécialisés, suivre un raisonnement subtil et saisir la portée exacte de chaque affirmation.'),
    objectives: [b('Follow a subtle line of reasoning', 'Suivre un raisonnement subtil'), b('Grasp the exact scope of a claim', 'Saisir la portée exacte d’une affirmation'), b('Understand specialised vocabulary in context', 'Comprendre un vocabulaire spécialisé en contexte')],
    minutes: 15,
    steps: [
      card(b('The scope of a claim', 'La portée d’une affirmation'), b('C2 texts qualify every claim: **tendanciellement** (as a trend), **à certains égards** (in some respects), **sous réserve de** (subject to), **a fortiori** (all the more), **a contrario** (conversely). The right option has exactly the same scope as the text.', 'Les textes C2 nuancent chaque affirmation : **tendanciellement**, **à certains égards**, **sous réserve de**, **a fortiori**, **a contrario**. La bonne réponse a exactement la même portée que le texte.')),
      { kind: 'match', prompt: b('Match each expression with its meaning.', 'Associez chaque expression à son sens.'), pairs: [['a fortiori', b('all the more so', 'à plus forte raison')], ['a contrario', b('conversely', 'à l’inverse')], ['sous réserve de', b('subject to', 'à condition de')], ['à certains égards', b('in some respects', 'sur certains points')], ['de facto', b('in practice', 'dans les faits')]] },
      read('C2', { title: 'Essai', text: 'Que la croissance économique ait, dans l’ensemble, réduit la pauvreté absolue ne fait guère de doute. Il serait néanmoins hâtif d’en conclure qu’elle réduit mécaniquement les inégalités : celles-ci peuvent, a contrario, se creuser au sein même d’une société qui s’enrichit.' }, 'Quelle est la position exacte de l’auteur ?', ['La croissance réduit la pauvreté, mais pas forcément les inégalités', 'La croissance augmente la pauvreté', 'La croissance réduit toujours les inégalités', 'Les inégalités ont disparu']),
      read('C2', { title: 'Texte juridique vulgarisé', text: 'Le locataire peut sous-louer son logement, sous réserve de l’accord écrit du propriétaire. Ce dernier ne peut toutefois refuser sans motif sérieux ; a fortiori, un refus fondé sur l’origine du sous-locataire serait illégal.' }, 'Que dit le texte du refus du propriétaire ?', ['Il doit être justifié, et ne peut jamais reposer sur l’origine', 'Il est toujours libre', 'Il est interdit dans tous les cas', 'Il doit être oral']),
      read('C2', { title: 'Article scientifique vulgarisé', text: 'Les données suggèrent que l’exposition précoce à plusieurs langues favorise, à certains égards, la flexibilité cognitive. Les effets sur l’intelligence générale, en revanche, restent statistiquement non significatifs dans la plupart des études.' }, 'Que montrent les données ?', ['Un effet sur certaines capacités, mais pas sur l’intelligence générale', 'Le bilinguisme rend plus intelligent', 'Le bilinguisme n’a aucun effet', 'Le bilinguisme nuit à l’apprentissage']),
      read('C2', { title: 'Critique', text: 'L’auteur se défend de toute nostalgie ; il n’en dresse pas moins, au fil des pages, un tableau si idéalisé du village de son enfance que le lecteur peine à y voir autre chose qu’un paradis perdu.' }, 'Que pense le critique ?', ['Que l’auteur est nostalgique malgré ce qu’il prétend', 'Que l’auteur déteste son village', 'Que le livre est objectif', 'Que l’auteur n’a pas d’enfance']),
      read('C2', { title: 'Éditorial', text: 'Rien n’interdit, en droit, aux plateformes de location de courte durée d’opérer dans les quartiers centraux. De facto, pourtant, leur concentration y a fait disparaître une part notable des logements destinés aux résidents permanents.' }, 'Quel contraste l’éditorial souligne-t-il ?', ['Entre ce que permet la loi et les effets réels sur le logement', 'Entre deux quartiers', 'Entre les touristes et les propriétaires', 'Entre deux lois contradictoires']),
      read('C2', { title: 'Essai', text: 'On aurait tort de lire dans le déclin des syndicats la preuve d’un désintérêt pour l’action collective. Celle-ci, loin de s’éteindre, se recompose ailleurs : collectifs informels, pétitions, mobilisations ponctuelles en ligne.' }, 'Que soutient l’auteur ?', ['L’action collective change de forme plutôt qu’elle ne disparaît', 'L’action collective est en train de disparaître', 'Les syndicats sont plus forts que jamais', 'Les pétitions sont inutiles']),
    ],
    notes: {
      points: [
        b('Latin and formal markers: a fortiori, a contrario, de facto, sous réserve de, à certains égards.', 'Marqueurs latins et soutenus : a fortiori, a contrario, de facto, sous réserve de, à certains égards.'),
        b('Check the scope: “dans l’ensemble” ≠ “toujours”; “à certains égards” ≠ “totalement”.', 'Vérifiez la portée : « dans l’ensemble » ≠ « toujours » ; « à certains égards » ≠ « totalement ».'),
        b('“Il se défend de X; il n’en … pas moins…” → he is X despite his denial.', '« Il se défend de X ; il n’en … pas moins… » → il est X malgré ses dénégations.'),
        b('“On aurait tort de…” introduces the author’s correction of a common idea.', '« On aurait tort de… » introduit la correction d’une idée reçue par l’auteur.'),
      ],
      vocab: [['hâtif', b('hasty', 'trop rapide')], ['se creuser', b('to widen (gap)', 's’agrandir')], ['sous-louer', b('to sublet', 'louer à un autre ce qu’on loue')], ['dresser un tableau', b('to paint a picture', 'décrire')], ['ponctuel', b('one-off', 'occasionnel')]],
    },
  },
];

export default lessons;
