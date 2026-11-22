import type { CourseAbout } from '../../types';
import { b, dlg, doc, exam, gap, hear, lesson, mc, ord, P, pairs, say, sort, tip, trap, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'In the TCF, listening and reading questions start at A1 and A2 before rising toward B2 and C2. Many candidates lose valuable points on these opening questions through haste, small preposition mistakes or overlooked negative clues. This course trains fast, calm A1–A2 reflexes across listening, reading, grammar and Task 1 writing so you secure every foundation point before the test gets harder.',
    'Au TCF, les épreuves de compréhension commencent aux niveaux A1 et A2 avant de monter vers le B2 et le C2. Beaucoup de candidats perdent des points précieux sur ces premières questions par précipitation, erreur de préposition ou inattention aux négations. Ce cours entraîne des réflexes rapides et sûrs en écoute, lecture, grammaire et tâche 1 écrite pour sécuriser tous les points de base avant la montée en difficulté.',
  ),
  outcomes: [
    b('Catch times, numbers and changes at A1–A2', 'Saisir heures, chiffres et changements au A1–A2'),
    b('Scan everyday signs, messages and emails accurately', 'Lire sans erreur panneaux, textos et courriels'),
    b('Eliminate common A2 gender and preposition slips', 'Éviter les fautes A2 fréquentes de genre et de préposition'),
    b('Write and speak cleanly in simple TCF tasks', 'Produire des réponses propres dans les tâches simples du TCF'),
  ],
};

const C = 'tcf-a2-foundations';
export default [
  lesson(C, 1, ['opening-listening-questions', 'premieres-questions-ecoute'],
    b('Opening listening questions', 'Les premières questions d’écoute'),
    b('Lock in times, prices, places and simple changes on A1–A2 recordings.', 'Sécuriser heures, prix, lieux et changements simples sur les enregistrements A1–A2.'),
    [b('Catch numbers and schedules on one listen', 'Saisir chiffres et horaires en une écoute'), b('Spot polite appointment changes', 'Repérer un changement de rendez-vous'), b('Match everyday A2 announcements', 'Comprendre les annonces simples du quotidien')],
    13,
    [
      exam(b('Why A1–A2 points matter', 'Pourquoi sécuriser le A1–A2'), b('In TCF listening, questions **1 to 10** test A1–A2 French: short dialogues, voicemails and station announcements played **once**. Securing 100 % here builds your score floor and keeps your mind calm for B1–B2.', 'En compréhension orale du TCF, les questions **1 à 10** testent le niveau A1–A2 : courts dialogues, messages vocaux et annonces diffusés **une seule fois**. Réussir 100 % de ce bloc protège votre score et vous garde serein pour le B1–B2.')),
      hear('Mesdames et messieurs, le train en provenance de Lyon entrera en gare voie quatre à quatorze heures quinze, avec dix minutes de retard.', b('Which platform does the train arrive at?', 'Sur quelle voie arrive le train ?'), [b('platform 4', 'voie 4'), b('platform 10', 'voie 10'), b('platform 14', 'voie 14'), b('platform 15', 'voie 15')], { voice: 'm', timer: 30 }),
      hear('Bonjour, c’est le secrétariat du docteur Lemaire. Votre contrôle de mardi à neuf heures est avancé à huit heures trente. Merci de confirmer par SMS.', b('What has changed?', 'Qu’est-ce qui a changé ?'), [b('the time is moved earlier to 8:30', 'l’heure est avancée à 8 h 30'), b('the appointment is moved to Wednesday', 'le rendez-vous passe à mercredi'), b('the appointment is cancelled', 'le rendez-vous est annulé'), b('the doctor is away', 'le médecin est absent')], { voice: 'f', timer: 30 }),
      sort(b('Time, place or price?', 'Heure, lieu ou prix ?'), [b('time / schedule', 'heure / horaire'), b('place', 'lieu'), b('price', 'prix')], [['à partir de midi', 0], ['au guichet deux', 1], ['douze euros l’entrée', 2], ['jusqu’à dix-neuf heures', 0], ['devant la mairie', 1], ['tarif réduit à cinq euros', 2]]),
      gap(P.complete, 'La bibliothèque ouvre ___ neuf heures ___ dix-huit heures, sauf ___ dimanche.', ['à', 'à', 'le'], { choices: [['à', 'en', 'chez'], ['à', 'sur', 'dans'], ['le', 'à', 'en']] }),
      pairs(P.match, [['en provenance de', b('arriving from', 'qui vient de')], ['avancer un rendez-vous', b('to move an appointment earlier', 'mettre plus tôt')], ['le guichet', b('ticket counter', 'comptoir d’accueil')], ['sauf le lundi', b('except on Mondays', 'pas le lundi')]]),
    ],
    [
      b('Listen once for the exact question target: time, platform, price or change.', 'Écoutez une fois pour l’info ciblée : heure, voie, prix ou changement.'),
      b('Watch direction words: avancé (earlier) vs reporté (postponed).', 'Repérez le sens : avancé (plus tôt) vs reporté (plus tard).'),
      b('Use à for exact hours and le for regular days.', 'Employez à pour l’heure et le pour un jour habituel.'),
    ],
    [['la voie', b('platform / track', 'quai du train')], ['le tarif réduit', b('reduced fare', 'prix moins cher')], ['confirmer', b('to confirm', 'dire oui officiellement')]],
  ),
  lesson(C, 2, ['everyday-signs-and-messages', 'panneaux-et-messages'],
    b('Everyday signs and messages', 'Panneaux et messages du quotidien'),
    b('Read A1–A2 notices, text messages and shop signs quickly without missing exceptions.', 'Lire vite panneaux, textos et avis A1–A2 sans manquer les exceptions.'),
    [b('Scan notices for dates and exceptions', 'Repérer dates et exceptions sur un avis'), b('Read friendly SMS exchanges', 'Comprendre les textos amicaux'), b('Distinguish obligation from prohibition', 'Distinguer obligation et interdiction')],
    13,
    [
      tip(b('The 25-second scan', 'Le repérage en 25 secondes'), b('For the first 10 reading questions, read the **question first**, then hunt for the single word or condition (**gratuit pour**, **fermé le**, **avant le**). Watch out for **sauf** and **réservé aux**.', 'Pour les 10 premières questions de lecture, lisez **la question d’abord**, puis cherchez le mot ou la condition (**gratuit pour**, **fermé le**, **avant le**). Méfiez-vous de **sauf** et **réservé aux**.')),
      doc({ look: 'notice', title: b('Museum notice', 'Avis du musée'), text: 'MUSÉE DES BEAUX-ARTS\nOuvert du mardi au dimanche, de 10 h à 18 h.\nFermé le lundi et le 1er mai.\nEntrée gratuite pour les moins de 18 ans et le premier dimanche du mois pour tous.' }, b('When can an adult enter for free?', 'Quand un adulte peut-il entrer gratuitement ?'), [b('on the first Sunday of the month', 'le premier dimanche du mois'), b('every Sunday', 'tous les dimanches'), b('on Mondays', 'le lundi'), b('on 1 May', 'le 1er mai')], { timer: 40 }),
      doc({ look: 'sms', text: 'Coucou Sam ! Finalement, la séance de 19 h est complète. J’ai pris deux places pour celle de 20 h 45 au cinéma Lumière. On mange un sandwich avant vers 19 h 30 ? Réponds-moi vite ! Léa' }, b('What does Léa suggest before the film?', 'Que propose Léa avant le film ?'), [b('eating a sandwich around 7:30 p.m.', 'manger un sandwich vers 19 h 30'), b('going to the 7 p.m. screening', 'aller à la séance de 19 h'), b('having dinner after the film', 'dîner après le film'), b('cancelling the evening', 'annuler la soirée')], { timer: 40 }),
      doc({ look: 'receipt', title: b('Store policy', 'Ticket de caisse'), text: 'LIBRAIRIE DU CENTRE\nÉchange possible sous 15 jours avec le ticket de caisse.\nLes articles soldés ne sont ni repris ni échangés.' }, b('Which item cannot be exchanged?', 'Quel article ne peut pas être échangé ?'), [b('a discounted item on sale', 'un article soldé'), b('a book bought yesterday with the receipt', 'un livre acheté hier avec le ticket'), b('a novel bought last week', 'un roman acheté la semaine dernière'), b('any gift with a receipt', 'tout cadeau avec le ticket')], { timer: 40 }),
      mc(P.meaning, [b('Staff only — visitors may not enter.', 'Réservé au personnel : les visiteurs ne peuvent pas entrer.'), b('Visitors must ring before entering.', 'Les visiteurs doivent sonner avant d’entrer.'), b('The room is open to the public.', 'La salle est ouverte au public.'), b('Staff must leave the building.', 'Le personnel doit quitter le bâtiment.')], { fr: '« Accès strictement réservé au personnel. »' }),
      ord(P.order, 'Le magasin ferme à vingt heures sauf le samedi.', { tr: 'The shop closes at 8 p.m. except on Saturdays.' }),
    ],
    [
      b('Read the question first, then scan for sauf, gratuit, complet or dates.', 'Lisez la question d’abord, puis cherchez sauf, gratuit, complet ou les dates.'),
      b('Ni repris ni échangés means no returns and no exchanges.', 'Ni repris ni échangés signifie aucun retour ni échange.'),
      b('Check who a rule applies to (moins de 18 ans, adultes, personnel).', 'Vérifiez qui est concerné par la règle (moins de 18 ans, adultes, personnel).'),
    ],
    [['complet', b('sold out / full', 'plus de places disponibles')], ['soldé', b('on sale / discounted', 'à prix réduit')], ['le ticket de caisse', b('store receipt', 'preuve d’achat')]],
  ),
  lesson(C, 3, ['clean-a2-accuracy', 'justesse-au-niveau-a2'],
    b('Clean A2 accuracy', 'Justesse grammaticale au niveau A2'),
    b('Avoid easy errors in gender, past tense and Task 1 messages.', 'Éviter les fautes simples de genre, de passé composé et de tâche 1.'),
    [b('Fix frequent A2 noun genders', 'Maîtriser le genre des noms fréquents'), b('Choose avoir or être in passé composé', 'Choisir avoir ou être au passé composé'), b('Write a complete A2 Task 1 message', 'Rédiger un message complet de tâche 1')],
    13,
    [
      trap(b('Four easy A2 points lost', 'Quatre erreurs A2 qui coûtent cher'), b('At A2, examiners penalise repeated slips in: **1. noun gender** (un horaire, un billet, une gare, une adresse), **2. être vs avoir** (je suis allé, j’ai pris), **3. tu/vous mix**, and **4. missing prompt points**.', 'Au A2, les correcteurs sanctionnent les fautes répétées sur : **1. le genre des noms** (un horaire, un billet, une gare, une adresse), **2. être ou avoir** (je suis allé, j’ai pris), **3. le mélange tu/vous**, et **4. l’oubli d’un point de la consigne**.')),
      sort(b('Masculine or feminine?', 'Masculin ou féminin ?'), [b('masculine (un / le)', 'masculin (un / le)'), b('feminine (une / la)', 'féminin (une / la)')], [['horaire', 0], ['gare', 1], ['billet', 0], ['adresse', 1], ['prix', 0], ['carte', 1]]),
      gap(P.completeText, 'Samedi dernier, je ___ allé à la gare avec mes amis. Nous ___ pris le train de neuf heures et nous sommes arrivés ___ temps pour la visite.', ['suis', 'avons', 'à'], { choices: [['suis', 'ai', 'es'], ['avons', 'sommes', 'ont'], ['à', 'en', 'sur']] }),
      dlg(b('At the sports centre desk', 'À l’accueil du centre sportif'), undefined, [['Employé', 'm'], ['Vous', 'f']], [
        [0, 'Bonjour Madame, je peux vous aider ?', 'Hello Madam, can I help you?'],
        [1, { options: ['Bonjour, je voudrais m’inscrire au cours de natation du mercredi soir, s’il vous plaît.', 'Salut, tu me mets à la piscine ?', 'Je veux nager mercredi.'] }],
        [0, 'Bien sûr. Avez-vous une pièce d’identité et un certificat médical ?', 'Of course. Do you have ID and a medical certificate?'],
        [1, { options: ['Oui, voici ma carte d’identité. Pour le certificat, puis-je l’apporter samedi ?', 'Tiens, prends ma carte.', 'Non, j’ai oublié, tant pis.'] }],
      ]),
      say('Bonjour, je m’appelle Youssef, j’habite à Lyon depuis deux ans et je travaille dans une boulangerie.', 'Hello, my name is Youssef, I have lived in Lyon for two years and I work in a bakery.'),
      write(b('Task 1 message (60–110 words)', 'Message de tâche 1 (60–110 mots)'), b('Write to your friend Karim: propose a picnic in the park on Saturday, give the meeting time and place, and ask him to bring fruit and a blanket.', 'Écrivez à votre ami Karim : proposez un pique-nique au parc samedi, donnez l’heure et le lieu de rendez-vous, et demandez-lui d’apporter des fruits et une couverture.'), 60, 110, [
        b('Friendly greeting and closing (tu)', 'Salutation et clôture amicales (tu)'),
        b('Date, time and meeting place', 'Date, heure et lieu de rendez-vous'),
        b('Request for fruit and a blanket', 'Demande pour les fruits et la couverture'),
      ], 'Salut Karim !\n\nBonne nouvelle : il va faire très beau samedi, alors je te propose une sortie au parc Mont-Royal. On pourrait se retrouver à 10 h 30 devant la station de métro Mont-Royal, puis marcher jusqu’au lac des Castors.\n\nPour le pique-nique, j’apporte des sandwichs et de l’eau. Est-ce que tu peux prendre quelques fruits et une petite couverture pour s’asseoir sur l’herbe ? Dis-moi vite si tu es libre samedi matin !\n\nÀ bientôt,\nNora'),
    ],
    [
      b('Keep tu or vous consistent from greeting to signature.', 'Gardez tu ou vous du début à la signature.'),
      b('Remember: un horaire, un billet, une gare, une adresse.', 'Retenez : un horaire, un billet, une gare, une adresse.'),
      b('Use être for movement/reflexive verbs (je suis allé, je me suis inscrit).', 'Employez être pour les verbes de mouvement et pronominaux.'),
    ],
    [['un horaire', b('a timetable / schedule', 'heure d’ouverture ou de départ')], ['la natation', b('swimming', 'sport dans l’eau')], ['à temps', b('on time', 'sans retard')]],
  ),
];
