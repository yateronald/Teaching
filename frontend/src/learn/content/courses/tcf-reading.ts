// TCF Canada · Compréhension écrite, A1 → C2. One lesson per level: the
// vocabulary and reading techniques of that level, then exam-style questions.
import { b, type Lesson } from '../../types';
import { card, read } from '../kit';

const lessons: Lesson[] = [
  // ── A1 ──
  {
    id: 'tcf-reading-1',
    level: 'A1',
    slug: { en: 'a1-signs-notices-timetables', fr: 'a1-panneaux-affiches-horaires' },
    title: b('A1 · Signs, notices and timetables', 'A1 · Panneaux, affiches et horaires'),
    summary: b('Read the very short documents of daily life and find one piece of information: a time, a day, a price, a rule.', 'Lire les documents très courts du quotidien et trouver une information : une heure, un jour, un prix, une règle.'),
    objectives: [b('Recognise the words of signs and notices', 'Reconnaître les mots des panneaux et des affiches'), b('Read opening hours and prices', 'Lire des horaires d’ouverture et des prix'), b('Understand simple rules: interdit, obligatoire', 'Comprendre des règles simples : interdit, obligatoire')],
    minutes: 13,
    steps: [
      card(b('The words of signs', 'Les mots des panneaux'), b('A few words come back on every sign: **ouvert / fermé**, **entrée / sortie**, **poussez / tirez**, **interdit**, **obligatoire**, **complet**, **soldes**. Learn them once and you read half the city.', 'Quelques mots reviennent sur tous les panneaux : **ouvert / fermé**, **entrée / sortie**, **poussez / tirez**, **interdit**, **obligatoire**, **complet**, **soldes**. Apprenez-les une fois et vous lisez la moitié de la ville.')),
      { kind: 'match', prompt: b('Match each sign with its meaning.', 'Associez chaque panneau à son sens.'), pairs: [['Défense de fumer', b('No smoking', 'On ne peut pas fumer')], ['Tirez', b('Pull', 'Il faut tirer la porte')], ['Complet', b('Full / sold out', 'Il n’y a plus de place')], ['Sortie de secours', b('Emergency exit', 'Sortie en cas de danger')], ['Soldes', b('Sale', 'Prix réduits')]] },
      card(b('Days and opening hours', 'Jours et horaires'), b('Timetables use abbreviations: **lun.**, **mar.**, **mer.**, **jeu.**, **ven.**, **sam.**, **dim.** “Du lundi au vendredi” = Monday to Friday. **Fermé le dimanche et les jours fériés** = closed on Sundays and public holidays. **h** replaces the colon: 9 h 30.', 'Les horaires utilisent des abréviations : **lun.**, **mar.**, **mer.**, **jeu.**, **ven.**, **sam.**, **dim.** « Du lundi au vendredi ». **Fermé le dimanche et les jours fériés**. On écrit 9 h 30.'), { variant: 'tip' }),
      read('A1', { title: 'Boulangerie Dupain', text: 'Ouvert du mardi au dimanche, de 7 h à 19 h 30.\nFermé le lundi.' }, 'Quel jour la boulangerie est-elle fermée ?', ['Le lundi', 'Le dimanche', 'Le mardi', 'Le samedi']),
      read('A1', { title: 'Piscine municipale', text: 'Bonnet de bain obligatoire.\nInterdit de manger au bord du bassin.' }, 'Qu’est-ce qui est obligatoire ?', ['Porter un bonnet de bain', 'Manger avant de nager', 'Payer en espèces', 'Apporter une serviette']),
      read('A1', { title: 'Message', text: 'Salut Tom,\nJe suis au parc avec les enfants. Le dîner est dans le frigo.\nÀ ce soir,\nNadia' }, 'Où est Nadia ?', ['Au parc', 'À la maison', 'Au travail', 'Au supermarché']),
      read('A1', { title: 'Cinéma Lumière', text: 'Tarif normal : 12 $\nÉtudiants : 9 $\nMoins de 12 ans : 7 $' }, 'Combien paie un étudiant ?', ['9 $', '12 $', '7 $', '21 $']),
      read('A1', { title: 'Bibliothèque', text: 'Silence, s’il vous plaît.\nLes téléphones doivent être éteints.' }, 'Que faut-il faire dans la bibliothèque ?', ['Éteindre son téléphone', 'Parler à voix basse au téléphone', 'Rendre les livres', 'Payer l’entrée']),
      read('A1', { title: 'Petite annonce', text: 'À vendre : vélo bleu, très bon état, 80 $.\nAppeler Marc au 514 555 0192.' }, 'Que vend Marc ?', ['Un vélo', 'Une voiture', 'Un téléphone', 'Un appartement']),
      { kind: 'fill', prompt: b('Complete the notice.', 'Complétez l’affiche.'), text: 'Magasin ___ pour travaux du 3 au 10 mars.', answers: [['fermé']], choices: [['fermé', 'ouvert', 'complet']] },
    ],
    notes: {
      points: [
        b('Sign words: ouvert / fermé, entrée / sortie, poussez / tirez, interdit, obligatoire, complet, soldes.', 'Mots des panneaux : ouvert / fermé, entrée / sortie, poussez / tirez, interdit, obligatoire, complet, soldes.'),
        b('“Du mardi au dimanche” = from Tuesday to Sunday. “Fermé le lundi” = closed on Mondays.', '« Du mardi au dimanche ». « Fermé le lundi » = chaque lundi.'),
        b('In French, 9 h 30 = 9:30; prices: 12 $ (Canada), 12 € (France).', 'En français, on écrit 9 h 30 ; prix : 12 $ (Canada), 12 € (France).'),
        b('Find the key word of the question (quel jour, combien, où) in the document.', 'Cherchez dans le document le mot clé de la question (quel jour, combien, où).'),
      ],
      vocab: [['interdit', b('forbidden', 'pas permis')], ['obligatoire', b('compulsory', 'qu’on doit faire')], ['les soldes', b('the sales', 'prix réduits')], ['le jour férié', b('public holiday', 'jour de fête officiel')], ['à vendre', b('for sale', 'qu’on peut acheter')]],
    },
  },

  // ── A2 ──
  {
    id: 'tcf-reading-2',
    level: 'A2',
    slug: { en: 'a2-emails-ads-instructions', fr: 'a2-courriels-annonces-consignes' },
    title: b('A2 · Emails, ads and instructions', 'A2 · Courriels, annonces et consignes'),
    summary: b('Read short personal emails, classified ads and instructions, and understand their purpose.', 'Lire des courriels personnels courts, des petites annonces et des consignes, et comprendre leur but.'),
    objectives: [b('Understand the purpose of a short email', 'Comprendre le but d’un courriel court'), b('Read classified ads: housing, jobs, services', 'Lire des petites annonces : logement, emploi, services'), b('Follow simple instructions', 'Suivre des consignes simples')],
    minutes: 14,
    steps: [
      card(b('Ask: why was this written?', 'Demandez-vous : pourquoi ce texte ?'), b('A2 questions often ask for the **purpose** of a message: inviter, remercier, s’excuser, demander un service, informer d’un changement. The purpose is usually in the first or the last sentence.', 'Les questions A2 portent souvent sur le **but** d’un message : inviter, remercier, s’excuser, demander un service, informer d’un changement. Le but se trouve souvent dans la première ou la dernière phrase.')),
      card(b('Abbreviations of ads', 'Les abréviations des annonces'), b('Housing ads are compressed: **4 ½** (Québec: 2 bedrooms + living room + kitchen + bathroom), **meublé** (furnished), **chauffé** (heating included), **libre le 1er juillet**. Job ads: **temps plein / partiel**, **CV + lettre**.', 'Les annonces sont condensées : **4 ½** (Québec : 2 chambres + salon + cuisine + salle de bains), **meublé**, **chauffé** (chauffage inclus), **libre le 1er juillet**. Emploi : **temps plein / partiel**, **CV + lettre**.'), { variant: 'culture' }),
      { kind: 'match', prompt: b('Match the ad abbreviation with its meaning.', 'Associez l’abréviation à son sens.'), pairs: [['meublé', b('furnished', 'avec des meubles')], ['chauffé', b('heating included', 'chauffage compris')], ['temps partiel', b('part-time', 'quelques heures par semaine')], ['libre immédiatement', b('available now', 'disponible tout de suite')], ['animaux acceptés', b('pets allowed', 'on peut avoir un animal')]] },
      read('A2', { title: 'Courriel', text: 'Bonjour Mme Leblanc,\nJe suis désolé, je ne pourrai pas venir au cours de jeudi : mon fils est malade. Est-ce que je peux rattraper la leçon lundi prochain ?\nCordialement,\nPaulo Silva' }, 'Pourquoi Paulo écrit-il ?', ['Pour s’excuser et demander une autre date', 'Pour annuler son inscription', 'Pour inviter Mme Leblanc', 'Pour demander un remboursement']),
      read('A2', { title: 'À louer', text: 'Rosemont — 4 ½ meublé, chauffé, près du métro. 1 350 $/mois. Libre le 1er juillet. Non-fumeurs seulement.' }, 'Quelle information est vraie ?', ['Le chauffage est compris dans le loyer', 'L’appartement est libre immédiatement', 'Les fumeurs sont acceptés', 'L’appartement est vide']),
      read('A2', { title: 'Offre d’emploi', text: 'Café Le Matin cherche serveur ou serveuse, temps partiel, fins de semaine. Expérience non nécessaire. Envoyez votre CV à emploi@cafelematin.ca' }, 'Que faut-il pour ce poste ?', ['Être disponible le week-end', 'Avoir de l’expérience', 'Travailler à temps plein', 'Se présenter au café']),
      read('A2', { title: 'Mode d’emploi', text: 'Pour recharger votre carte de transport : 1. Posez la carte sur le lecteur. 2. Choisissez le titre. 3. Payez par carte ou en espèces. Gardez votre reçu.' }, 'Que faut-il faire en premier ?', ['Poser la carte sur le lecteur', 'Payer', 'Choisir le titre', 'Prendre le reçu']),
      read('A2', { title: 'Invitation', text: 'Chers voisins,\nNous organisons une fête de quartier le samedi 14 juin, dans la cour de l’immeuble, à partir de 17 h. Chacun apporte un plat ou une boisson !\nLe comité des locataires' }, 'Que doivent apporter les voisins ?', ['Un plat ou une boisson', 'De l’argent', 'Des chaises', 'Un cadeau']),
      read('A2', { title: 'Avis aux résidents', text: 'L’eau sera coupée mardi de 9 h à 13 h en raison de travaux sur les canalisations. Merci de prévoir des réserves d’eau.' }, 'Que conseille l’avis ?', ['Garder de l’eau en réserve', 'Quitter l’immeuble mardi', 'Appeler un plombier', 'Fermer les fenêtres']),
      { kind: 'order', prompt: b('Put the email back in order.', 'Remettez le courriel dans l’ordre.'), words: ['Bonjour,', 'merci', 'pour', 'votre', 'invitation', 'à', 'la', 'fête.'], tr: 'Hello, thank you for your invitation to the party.' },
    ],
    notes: {
      points: [
        b('The purpose of a message is usually in its first or last sentence.', 'Le but d’un message se trouve souvent dans la première ou la dernière phrase.'),
        b('Ads: meublé, chauffé, libre le…, temps plein / partiel, animaux acceptés.', 'Annonces : meublé, chauffé, libre le…, temps plein / partiel, animaux acceptés.'),
        b('Instructions are numbered and use the imperative: posez, choisissez, payez.', 'Les consignes sont numérotées et à l’impératif : posez, choisissez, payez.'),
        b('“Vrai” questions: check every word of the option against the text.', 'Questions « vrai » : vérifiez chaque mot de la proposition dans le texte.'),
      ],
      vocab: [['rattraper', b('to make up (a missed class)', 'refaire ce qu’on a manqué')], ['le loyer', b('rent', 'prix de la location')], ['le reçu', b('receipt', 'preuve de paiement')], ['le locataire', b('tenant', 'personne qui loue')], ['en raison de', b('because of', 'à cause de')]],
    },
  },

  // ── B1 ──
  {
    id: 'tcf-reading-3',
    level: 'B1',
    slug: { en: 'b1-articles-main-idea-reformulation', fr: 'b1-articles-idee-principale-reformulation' },
    title: b('B1 · Short articles: main idea and reformulation', 'B1 · Articles courts : idée principale et reformulation'),
    summary: b('Read short articles and letters, find the main idea and recognise it when the answer uses other words.', 'Lire des articles et des lettres courts, trouver l’idée principale et la reconnaître quand la réponse utilise d’autres mots.'),
    objectives: [b('Find the main idea of a short article', 'Trouver l’idée principale d’un article court'), b('Recognise synonyms and reformulations', 'Reconnaître synonymes et reformulations'), b('Avoid the “same word” trap', 'Éviter le piège du « même mot »')],
    minutes: 14,
    steps: [
      card(b('The answer is reformulated', 'La réponse est reformulée'), b('From B1, the right option rarely repeats the words of the text. It **reformulates**: “les prix ont doublé” → “les prix ont fortement augmenté”. An option that copies words from the text is often a trap.', 'À partir du B1, la bonne réponse reprend rarement les mots du texte. Elle **reformule** : « les prix ont doublé » → « les prix ont fortement augmenté ». Une proposition qui recopie les mots du texte est souvent un piège.'), { variant: 'trap' }),
      { kind: 'match', prompt: b('Match each phrase with its reformulation.', 'Associez chaque expression à sa reformulation.'), pairs: [['a été annulé', 'n’aura pas lieu'], ['est en hausse', 'augmente'], ['gratuitement', 'sans payer'], ['à l’étranger', 'dans un autre pays'], ['dès l’an prochain', 'à partir de l’année suivante']] },
      card(b('Where is the main idea?', 'Où est l’idée principale ?'), b('In a short article: the **title**, the **first paragraph** (the “chapeau”) and the **conclusion** carry the main idea. Read them first, then the details.', 'Dans un article court, le **titre**, le **premier paragraphe** (le chapeau) et la **conclusion** portent l’idée principale. Lisez-les d’abord, puis les détails.'), { variant: 'tip' }),
      read('B1', { title: 'Les cafés-réparation font des émules', text: 'Grille-pain, lampes, vélos : dans les cafés-réparation, des bénévoles aident les habitants à réparer eux-mêmes leurs objets au lieu de les jeter. Lancés il y a dix ans, ces ateliers sont aujourd’hui plus de deux cents au Québec.' }, 'Quel est le principe des cafés-réparation ?', ['Apprendre à réparer ses objets avec l’aide de bénévoles', 'Vendre des objets d’occasion', 'Jeter les objets cassés', 'Boire un café pendant qu’un technicien répare']),
      read('B1', { title: 'Courrier des lecteurs', text: 'J’habite à la campagne depuis cinq ans. Je ne regrette pas la ville, mais l’absence de transports en commun me complique la vie : sans voiture, impossible d’aller au travail ou chez le médecin.\nAline, Sherbrooke' }, 'De quoi Aline se plaint-elle ?', ['Du manque de transports publics', 'De la vie à la campagne en général', 'Du prix de l’essence', 'De son médecin']),
      read('B1', { title: 'Nouvelle règle à la bibliothèque', text: 'À partir du 1er septembre, la durée de prêt passera de trois à quatre semaines. En revanche, le nombre de documents empruntables sera limité à dix par personne.' }, 'Que change la nouvelle règle ?', ['On garde les livres plus longtemps, mais on en emprunte moins', 'On peut emprunter plus de livres', 'Le prêt devient payant', 'La bibliothèque ferme en septembre']),
      read('B1', { title: 'Santé', text: 'Selon une étude récente, marcher trente minutes par jour réduirait de vingt pour cent le risque de maladies cardiaques. Nul besoin de courir un marathon : la régularité compte davantage que l’intensité.' }, 'Quelle est l’idée principale ?', ['Une activité modérée mais régulière est bénéfique', 'Il faut courir un marathon pour être en forme', 'Les maladies cardiaques augmentent', 'La marche est dangereuse pour le cœur']),
      read('B1', { title: 'Entreprise', text: 'Pour attirer de jeunes employés, l’entreprise Novatek propose désormais la semaine de quatre jours, sans baisse de salaire. Les premiers résultats sont encourageants : moins d’absences et autant de production.' }, 'Quels sont les premiers résultats ?', ['Moins d’absentéisme et la même productivité', 'Une baisse des salaires', 'Plus de production mais plus d’absences', 'Le départ des jeunes employés']),
      read('B1', { title: 'Annonce', text: 'Le festival de jazz déménage ! Après quinze ans au parc Lafontaine, il se tiendra cette année sur les quais du Vieux-Port, qui offrent davantage d’espace et un meilleur accès en transports.' }, 'Pourquoi le festival change-t-il de lieu ?', ['Le nouveau lieu est plus grand et plus accessible', 'Le parc est fermé pour travaux', 'Le festival a quinze ans', 'Les voisins se sont plaints']),
      { kind: 'fill', prompt: b('Choose the reformulation.', 'Choisissez la reformulation.'), text: '« La réunion est repoussée » signifie que la réunion est ___.', answers: [['retardée']], choices: [['retardée', 'annulée', 'avancée']] },
    ],
    notes: {
      points: [
        b('The right option reformulates; an option that copies the text is often a trap.', 'La bonne réponse reformule ; une proposition qui recopie le texte est souvent un piège.'),
        b('Main idea: title + first paragraph + conclusion.', 'Idée principale : titre + premier paragraphe + conclusion.'),
        b('“En revanche” announces a contrast: read what follows carefully.', '« En revanche » annonce un contraste : lisez bien la suite.'),
        b('Common reformulations: en hausse = augmente; annulé = n’aura pas lieu; gratuit = sans payer.', 'Reformulations courantes : en hausse = augmente ; annulé = n’aura pas lieu ; gratuit = sans payer.'),
      ],
      vocab: [['le bénévole', b('volunteer', 'personne non payée')], ['emprunter', b('to borrow', 'prendre pour un temps')], ['désormais', b('from now on', 'à partir de maintenant')], ['l’absentéisme', b('absenteeism', 'absences au travail')], ['déménager', b('to move (place)', 'changer de lieu')]],
    },
  },

  // ── B2 ──
  {
    id: 'tcf-reading-4',
    level: 'B2',
    slug: { en: 'b2-opinion-articles-argument', fr: 'b2-articles-opinion-argumentation' },
    title: b('B2 · Opinion articles and argument', 'B2 · Articles d’opinion et argumentation'),
    summary: b('Follow an argument, separate facts from opinions and identify the author’s position.', 'Suivre une argumentation, séparer les faits des opinions et identifier la position de l’auteur.'),
    objectives: [b('Separate facts from opinions', 'Séparer les faits des opinions'), b('Follow the logic of an argument', 'Suivre la logique d’une argumentation'), b('Identify the author’s position and purpose', 'Identifier la position et le but de l’auteur')],
    minutes: 14,
    steps: [
      card(b('Fact or opinion?', 'Fait ou opinion ?'), b('A **fact** can be checked (figures, dates, events). An **opinion** is signalled by judgement words (**regrettable**, **essentiel**, **il faut**), by **selon moi / à mon sens**, or by the conditional of advice (**on devrait**).', 'Un **fait** se vérifie (chiffres, dates, événements). Une **opinion** se reconnaît aux mots de jugement (**regrettable**, **essentiel**, **il faut**), à **selon moi / à mon sens**, ou au conditionnel de conseil (**on devrait**).')),
      { kind: 'categorize', prompt: b('Fact or opinion?', 'Fait ou opinion ?'), buckets: [b('Fact', 'Fait'), b('Opinion', 'Opinion')], items: [{ text: 'Le prix du loyer moyen a augmenté de 8 % en un an.', bucket: 0 }, { text: 'Il est scandaleux que les loyers augmentent autant.', bucket: 1 }, { text: 'La ville compte 1,8 million d’habitants.', bucket: 0 }, { text: 'On devrait limiter les locations touristiques.', bucket: 1 }, { text: 'La loi est entrée en vigueur en 2023.', bucket: 0 }, { text: 'Cette mesure est, à mon sens, insuffisante.', bucket: 1 }] },
      card(b('The author’s purpose', 'Le but de l’auteur'), b('Questions like “Dans ce texte, l’auteur cherche surtout à…” offer verbs: **dénoncer**, **informer**, **convaincre**, **mettre en garde**, **nuancer**, **défendre**. Look at the conclusion: it often reveals the purpose.', 'Les questions du type « Dans ce texte, l’auteur cherche surtout à… » proposent des verbes : **dénoncer**, **informer**, **convaincre**, **mettre en garde**, **nuancer**, **défendre**. Regardez la conclusion : elle révèle souvent le but.'), { variant: 'exam' }),
      read('B2', { title: 'Tribune', text: 'On présente souvent le télétravail comme une liberté retrouvée. Il l’est, pour une partie des salariés. Mais pour ceux qui vivent dans un petit logement, il signifie aussi l’impossibilité de séparer vie privée et vie professionnelle. Avant de le généraliser, il faudrait donc garantir à chacun des conditions de travail décentes.' }, 'Quelle est la position de l’auteur ?', ['Le télétravail a des avantages, mais ne doit pas être imposé sans conditions', 'Le télétravail doit être interdit', 'Le télétravail est une liberté pour tous', 'Les petits logements doivent disparaître']),
      read('B2', { title: 'Éditorial', text: 'Chaque année, des tonnes de vêtements presque neufs finissent à la décharge. La mode éphémère nous a habitués à acheter vite et à jeter tout aussi vite. Il est temps de changer nos habitudes : réparer, échanger, acheter moins mais mieux.' }, 'Dans ce texte, l’auteur cherche surtout à…', ['inciter les lecteurs à consommer autrement', 'informer sur les nouvelles tendances', 'défendre la mode éphémère', 'expliquer le recyclage des tissus']),
      read('B2', { title: 'Société', text: 'Les applications de rencontre ont-elles tué la rencontre « au hasard » ? Les chiffres invitent à la prudence : si un couple sur quatre s’est formé en ligne, la majorité se rencontre encore par des amis, au travail ou pendant les études.' }, 'Que montrent les chiffres ?', ['La plupart des couples se forment encore hors d’internet', 'La majorité des couples se rencontrent en ligne', 'Les rencontres au travail ont disparu', 'Un couple sur deux s’est formé en ligne']),
      read('B2', { title: 'Urbanisme', text: 'La piétonnisation du centre-ville a d’abord suscité la colère des commerçants, qui redoutaient une baisse de fréquentation. Deux ans plus tard, le constat est inverse : le chiffre d’affaires des boutiques a progressé, car les passants flânent davantage.' }, 'Que s’est-il passé après la piétonnisation ?', ['Les craintes des commerçants se sont révélées infondées', 'Les commerces ont fermé', 'Les passants sont moins nombreux', 'Les commerçants ont obtenu le retour des voitures']),
      read('B2', { title: 'Éducation', text: 'Interdire le téléphone portable à l’école ne réglera pas, à lui seul, le problème de la concentration des élèves. Encore faut-il leur apprendre à gérer leur attention, y compris en dehors de la classe.' }, 'Que pense l’auteur de l’interdiction du portable ?', ['C’est insuffisant à elle seule', 'C’est inutile et dangereux', 'C’est la solution parfaite', 'Il faut l’étendre à la maison']),
      read('B2', { title: 'Environnement', text: 'Planter des arbres en ville ne sert pas qu’à embellir les rues. Ils rafraîchissent l’air de plusieurs degrés pendant les canicules, absorbent les eaux de pluie et améliorent le moral des habitants.' }, 'Que fait ce texte ?', ['Il énumère les avantages des arbres en ville', 'Il critique la plantation d’arbres', 'Il décrit une canicule', 'Il compare deux villes']),
      { kind: 'fill', prompt: b('Complete the argument with the right connector.', 'Complétez l’argumentation avec le bon connecteur.'), text: 'Le projet est coûteux ; ___, il créera trois cents emplois.', answers: [['néanmoins']], choices: [['néanmoins', 'donc', 'car']] },
    ],
    notes: {
      points: [
        b('Facts can be checked; opinions use judgement words, “selon moi”, “il faut”, “on devrait”.', 'Les faits se vérifient ; les opinions utilisent des mots de jugement, « selon moi », « il faut », « on devrait ».'),
        b('Purpose verbs: dénoncer, informer, convaincre, mettre en garde, nuancer, inciter.', 'Verbes de but : dénoncer, informer, convaincre, mettre en garde, nuancer, inciter.'),
        b('Concession then position: “Il l’est… Mais…” → the position follows “mais”.', 'Concession puis position : « Il l’est… Mais… » → la position suit « mais ».'),
        b('Watch quantities: un sur quatre ≠ la majorité; la plupart ≠ tous.', 'Attention aux quantités : un sur quatre ≠ la majorité ; la plupart ≠ tous.'),
      ],
      vocab: [['la mode éphémère', b('fast fashion', 'vêtements vite jetés')], ['la décharge', b('landfill', 'lieu où l’on jette les déchets')], ['flâner', b('to stroll', 'se promener sans but')], ['infondé', b('unfounded', 'sans raison réelle')], ['inciter à', b('to encourage to', 'pousser à')]],
    },
  },

  // ── C1 ──
  {
    id: 'tcf-reading-5',
    level: 'C1',
    slug: { en: 'c1-essays-implicit-intention', fr: 'c1-essais-implicite-intention' },
    title: b('C1 · Essays: implicit meaning and intention', 'C1 · Essais : implicite et intention'),
    summary: b('Read demanding argumentative texts and infer what the author implies, criticises or suggests.', 'Lire des textes argumentatifs exigeants et déduire ce que l’auteur sous-entend, critique ou suggère.'),
    objectives: [b('Infer what is implied', 'Déduire ce qui est sous-entendu'), b('Recognise irony and criticism in formal writing', 'Reconnaître l’ironie et la critique à l’écrit soutenu'), b('Understand complex logical relations', 'Comprendre des relations logiques complexes')],
    minutes: 14,
    steps: [
      card(b('Reading between the lines', 'Lire entre les lignes'), b('A C1 author criticises without saying “I criticise”. Watch **quotation marks** (distance), **rhetorical questions** (an answer is implied), **so-called** words (**prétendu**, **dit**), and **litotes** (“ce n’est pas sans risque” = it is risky).', 'Un auteur C1 critique sans dire « je critique ». Repérez les **guillemets** (prise de distance), les **questions rhétoriques** (la réponse est sous-entendue), les mots comme **prétendu**, **dit**, et la **litote** (« ce n’est pas sans risque » = c’est risqué).')),
      { kind: 'match', prompt: b('What does each sentence imply?', 'Que sous-entend chaque phrase ?'), pairs: [['Ce n’est pas sans conséquences.', b('It has serious consequences.', 'Cela a des conséquences importantes.')], ['Faut-il vraiment s’en étonner ?', b('It is not surprising.', 'Ce n’est pas surprenant.')], ['Cette « réforme » n’a rien changé.', b('It is not a real reform.', 'Ce n’est pas une vraie réforme.')], ['On aurait pu espérer mieux.', b('It is disappointing.', 'C’est décevant.')]] },
      card(b('Complex logical links', 'Les liens logiques complexes'), b('C1 texts use **quand bien même** (even if), **pour autant** (for all that), **dès lors** (consequently), **à défaut de** (for lack of), **sous prétexte que** (on the pretext that, critical!).', 'Les textes C1 utilisent **quand bien même**, **pour autant**, **dès lors**, **à défaut de**, **sous prétexte que** (critique !).'), { variant: 'tip' }),
      read('C1', { title: 'Essai', text: 'On nous promettait que les écrans libéreraient du temps. Jamais pourtant nous n’avons eu le sentiment d’en manquer autant. Faut-il s’en étonner, quand chaque minute libre est aussitôt captée par une notification ?' }, 'Que sous-entend l’auteur ?', ['Les écrans nous prennent le temps qu’ils devaient libérer', 'Les écrans nous ont fait gagner beaucoup de temps', 'Les notifications sont utiles', 'Il faut supprimer les écrans au travail']),
      read('C1', { title: 'Chronique', text: 'Sous prétexte de moderniser le service, la compagnie a supprimé les guichets. Les voyageurs âgés, eux, apprécieront sans doute de devoir télécharger trois applications pour acheter un billet.' }, 'Quel est le ton de la dernière phrase ?', ['Ironique', 'Admiratif', 'Neutre', 'Inquiet'], { explain: b('“Apprécieront sans doute” says the opposite of what is meant: elderly travellers will suffer.', '« Apprécieront sans doute » dit le contraire de ce qui est pensé : les voyageurs âgés vont souffrir.') }),
      read('C1', { title: 'Économie', text: 'Quand bien même la croissance reviendrait l’an prochain, rien ne garantit que les ménages modestes en verraient les effets. Dès lors, se contenter d’attendre la reprise serait une erreur.' }, 'Quelle conclusion tire l’auteur ?', ['Il ne faut pas compter uniquement sur la reprise économique', 'La croissance profitera à tous', 'La croissance ne reviendra jamais', 'Les ménages modestes s’enrichissent']),
      read('C1', { title: 'Culture', text: 'Le musée se félicite d’avoir doublé sa fréquentation. On aurait pu s’en réjouir si cette hausse n’était pas due, pour l’essentiel, à une exposition de selfies géants, dont la valeur artistique reste à démontrer.' }, 'Quelle est l’attitude de l’auteur ?', ['Réservée, voire critique', 'Enthousiaste', 'Indifférente', 'Admirative']),
      read('C1', { title: 'Société', text: 'Il ne s’agit pas de nier les progrès accomplis en matière d’égalité salariale. Il n’en demeure pas moins qu’à poste égal, l’écart persiste, et que le rythme actuel nous mènerait à la parité dans plusieurs décennies.' }, 'Quel est l’objectif principal du texte ?', ['Souligner que les progrès restent insuffisants', 'Nier les progrès accomplis', 'Annoncer la fin des inégalités', 'Décrire un poste de travail']),
      read('C1', { title: 'Science', text: 'Une corrélation n’est pas une causalité : que les buveurs de café vivent plus longtemps ne prouve pas que le café prolonge la vie. Peut-être sont-ils simplement plus actifs, ou mieux entourés.' }, 'Que veut montrer l’auteur ?', ['Un lien statistique ne prouve pas une cause', 'Le café prolonge la vie', 'Les buveurs de café sont plus actifs', 'Il faut boire plus de café']),
      { kind: 'fill', prompt: b('Choose the connector.', 'Choisissez le connecteur.'), text: 'Les résultats sont encourageants ; il ne faut pas ___ crier victoire.', answers: [['pour autant']], choices: [['pour autant', 'dès lors', 'quand bien même']] },
    ],
    notes: {
      points: [
        b('Implicit criticism: quotation marks, rhetorical questions, litotes, “sous prétexte que”.', 'Critique implicite : guillemets, questions rhétoriques, litote, « sous prétexte que ».'),
        b('Irony: praise that the facts contradict (“apprécieront sans doute…”).', 'Ironie : un éloge que les faits contredisent (« apprécieront sans doute… »).'),
        b('C1 connectors: quand bien même, pour autant, dès lors, à défaut de, il n’en demeure pas moins que.', 'Connecteurs C1 : quand bien même, pour autant, dès lors, à défaut de, il n’en demeure pas moins que.'),
        b('“Il ne s’agit pas de nier… / Il n’en demeure pas moins…” → the second part is the thesis.', '« Il ne s’agit pas de nier… / Il n’en demeure pas moins… » → la thèse est la seconde partie.'),
      ],
      vocab: [['la litote', b('understatement', 'dire moins pour suggérer plus')], ['se féliciter de', b('to be pleased with oneself about', 'être fier de')], ['la parité', b('equality (gender)', 'égalité hommes-femmes')], ['la corrélation', b('correlation', 'lien statistique')], ['dès lors', b('consequently', 'par conséquent')]],
    },
  },

  // ── C2 ──
  {
    id: 'tcf-reading-6',
    level: 'C2',
    slug: { en: 'c2-literary-and-academic-texts', fr: 'c2-textes-litteraires-et-savants' },
    title: b('C2 · Literary and academic texts', 'C2 · Textes littéraires et savants'),
    summary: b('Read literary extracts and academic prose, grasp style, register and the finest nuances of vocabulary.', 'Lire des extraits littéraires et des textes savants, saisir le style, le registre et les nuances les plus fines du vocabulaire.'),
    objectives: [b('Understand figurative language and style', 'Comprendre le langage figuré et le style'), b('Distinguish very close words', 'Distinguer des mots très proches'), b('Grasp the exact thesis of an academic text', 'Saisir la thèse exacte d’un texte savant')],
    minutes: 15,
    steps: [
      card(b('Near-synonyms are not synonyms', 'Les quasi-synonymes ne sont pas des synonymes'), b('At C2, options differ by a shade: **éviter** (to avoid) vs **esquiver** (to dodge, with skill or cowardice); **soupçonner** (to suspect) vs **pressentir** (to sense in advance); **ironique** vs **sarcastique** (more aggressive).', 'Au C2, les propositions diffèrent par une nuance : **éviter** / **esquiver** (avec habileté ou lâcheté) ; **soupçonner** / **pressentir** (sentir à l’avance) ; **ironique** / **sarcastique** (plus agressif).')),
      { kind: 'match', prompt: b('Match each word with its precise meaning.', 'Associez chaque mot à son sens précis.'), pairs: [['pressentir', b('to sense before it happens', 'deviner à l’avance')], ['esquiver', b('to dodge skilfully', 'éviter adroitement')], ['sarcastique', b('mocking and hurtful', 'moqueur et blessant')], ['laconique', b('using very few words', 'qui parle très peu')], ['fallacieux', b('deceptive', 'trompeur')]] },
      card(b('Figurative language', 'Le langage figuré'), b('Literary extracts rely on **metaphors** (“la ville dormait sous sa couverture de neige”), **personification**, and **free indirect speech** (a character’s thoughts in the narrator’s voice). Ask: what feeling does the image create?', 'Les extraits littéraires reposent sur la **métaphore** (« la ville dormait sous sa couverture de neige »), la **personnification** et le **discours indirect libre** (les pensées d’un personnage dans la voix du narrateur). Demandez-vous : quel sentiment l’image crée-t-elle ?'), { variant: 'tip' }),
      read('C2', { title: 'Extrait de roman', text: 'Elle referma la porte avec une douceur excessive, de celles qui annoncent les tempêtes. Dans la cuisine, la vaisselle de la veille attendait encore, témoin muet de la dispute qu’aucun des deux n’avait voulu terminer.' }, 'Quelle atmosphère l’extrait installe-t-il ?', ['Une tension contenue', 'Une joie paisible', 'Une indifférence totale', 'Une réconciliation']),
      read('C2', { title: 'Essai', text: 'L’argument selon lequel la technologie serait neutre, et que seul compterait l’usage qu’on en fait, est pour le moins fallacieux : tout outil, par sa conception même, rend certains usages faciles et d’autres presque impossibles.' }, 'Que soutient l’auteur ?', ['La conception d’un outil oriente déjà son usage', 'La technologie est parfaitement neutre', 'Seul l’usage compte', 'Les outils rendent tous les usages possibles']),
      read('C2', { title: 'Critique littéraire', text: 'Le romancier, si prolixe d’ordinaire, se fait ici laconique : trois cents pages à peine, des phrases sèches, presque nues. Ce dépouillement, loin d’appauvrir le récit, en accroît la charge émotionnelle.' }, 'Que pense le critique du style de ce roman ?', ['Sa sobriété renforce l’émotion', 'Il est trop long et bavard', 'Sa pauvreté nuit au récit', 'Il ressemble aux romans précédents']),
      read('C2', { title: 'Article savant', text: 'Si l’on ne saurait réduire l’exode rural à des causes strictement économiques, force est de constater que la fermeture des services publics en a constitué un puissant accélérateur.' }, 'Quelle est la thèse exacte de l’auteur ?', ['La fermeture des services publics a fortement accéléré l’exode rural, parmi d’autres causes', 'L’exode rural a une cause uniquement économique', 'Les services publics n’ont joué aucun rôle', 'L’exode rural a été stoppé par les services publics'], { explain: b('“Ne saurait réduire… à” rules out a single cause; “force est de constater” asserts a strong but partial role.', '« Ne saurait réduire… à » exclut une cause unique ; « force est de constater » affirme un rôle fort mais partiel.') }),
      read('C2', { title: 'Extrait de roman', text: 'Il avait toujours pressenti que cette maison finirait par le trahir. Ce matin-là, en découvrant la fissure qui courait du plafond au plancher, il n’éprouva pas de surprise, seulement une lassitude ancienne.' }, 'Que ressent le personnage ?', ['Une fatigue résignée', 'Une grande surprise', 'Une colère violente', 'Un soulagement']),
      read('C2', { title: 'Chronique', text: 'On loue volontiers l’« agilité » des entreprises qui licencient en un après-midi. Curieuse vertu que celle qui consiste à faire porter aux salariés tout le poids de l’incertitude.' }, 'Quelle figure l’auteur utilise-t-il dans la deuxième phrase ?', ['L’ironie, pour critiquer une prétendue qualité', 'La comparaison, pour admirer les entreprises', 'L’énumération des avantages', 'La métaphore de la nature']),
      { kind: 'fill', prompt: b('Choose the most precise word.', 'Choisissez le mot le plus précis.'), text: 'Interrogé sur ses comptes, le ministre a habilement ___ la question.', answers: [['esquivé']], choices: [['esquivé', 'évité', 'refusé']], explain: b('“Habilement” points to esquiver: to dodge with skill.', '« Habilement » appelle esquiver : éviter avec adresse.') },
    ],
    notes: {
      points: [
        b('C2 options differ by a nuance: check the exact strength and connotation of each word.', 'Au C2, les propositions diffèrent par une nuance : vérifiez la force et la connotation exactes de chaque mot.'),
        b('Literary devices: metaphor, personification, free indirect speech. Ask what feeling they create.', 'Procédés littéraires : métaphore, personnification, discours indirect libre. Demandez-vous quel sentiment ils créent.'),
        b('Formal markers: **force est de constater**, **on ne saurait**, **pour le moins**, **loin de**.', 'Marqueurs soutenus : **force est de constater**, **on ne saurait**, **pour le moins**, **loin de**.'),
        b('“Curieuse vertu que…” = ironic inversion: the author criticises.', '« Curieuse vertu que… » = inversion ironique : l’auteur critique.'),
      ],
      vocab: [['prolixe', b('verbose', 'qui écrit trop longuement')], ['le dépouillement', b('starkness, sobriety', 'simplicité extrême')], ['la lassitude', b('weariness', 'fatigue morale')], ['force est de constater', b('one has to admit', 'on doit reconnaître')], ['fallacieux', b('misleading', 'trompeur')]],
    },
  },
];

export default lessons;
