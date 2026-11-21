import type { CourseAbout } from '../../types';
import { b, card, doc, exam, gap, lesson, mc, ord, P, sort, tip, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Task 1 of the TCF writing test asks for a short message (about 60 to 120 words) to describe, tell or explain something to one or more people: an invitation, news, a request, practical information. It is the quickest task, but many candidates lose easy points by forgetting part of the instruction or the right register. This course gives you a reliable structure, models and targeted practice.',
    'La tâche 1 de l’expression écrite du TCF demande un court message (environ 60 à 120 mots) pour décrire, raconter ou expliquer quelque chose à une ou plusieurs personnes : une invitation, une nouvelle, une demande, des informations pratiques. C’est la tâche la plus rapide, mais beaucoup de candidats perdent des points faciles en oubliant une partie de la consigne ou le bon registre. Ce cours vous donne une structure fiable, des modèles et un entraînement ciblé.',
  ),
  outcomes: [
    b('Understand the task 1 instruction', 'Comprendre la consigne de la tâche 1'),
    b('Use a reliable message structure', 'Utiliser une structure de message fiable'),
    b('Choose the right register', 'Choisir le bon registre'),
    b('Write within 60–120 words', 'Écrire entre 60 et 120 mots'),
  ],
};

const C = 'tcf-ee-task1';
export default [
  lesson(C, 1, ['the-instruction', 'la-consigne'],
    b('The instruction', 'La consigne'),
    b('Identify the recipient, the purpose and every point to include.', 'Repérer le destinataire, l’objectif et chaque point à inclure.'),
    [b('Know the task 1 format', 'Connaître le format de la tâche 1'), b('List every point required', 'Lister chaque point demandé'), b('Choose tu or vous', 'Choisir tu ou vous')],
    13,
    [
      exam(b('Task 1', 'Tâche 1'), b('**About 60–120 words**. A **message** (courriel, mot, texto) to **describe, tell or explain** to one or more recipients. The three tasks share **about 60 minutes**: spend about **10–15 minutes** on task 1. Assessed: **respect of the instruction**, coherence, vocabulary and grammar adapted to the situation.', '**Environ 60 à 120 mots**. Un **message** (courriel, mot, texto) pour **décrire, raconter ou expliquer** à un ou plusieurs destinataires. Les trois tâches se partagent **environ 60 minutes** : consacrez environ **10 à 15 minutes** à la tâche 1. Critères : **respect de la consigne**, cohérence, lexique et grammaire adaptés à la situation.')),
      doc({ look: 'page', title: b('Instruction', 'Consigne'), text: 'Vous venez d’emménager dans un nouvel appartement. Vous écrivez un message à vos amis pour les inviter à une petite fête. Vous décrivez votre nouveau logement et vous donnez les informations pratiques (date, heure, adresse, accès). (60 mots minimum, 120 mots maximum)' }, b('Which points must the message include?', 'Quels points le message doit-il contenir ?'), [b('invitation + description of the flat + date, time, address, access', 'invitation + description du logement + date, heure, adresse, accès'), b('only the date', 'seulement la date'), b('the rent and the landlord’s name', 'le loyer et le nom du propriétaire'), b('a story about the move', 'un récit du déménagement')]),
      sort(b('tu or vous?', 'tu ou vous ?'), [b('tu (friends, family)', 'tu (amis, famille)'), b('vous (formal or several people)', 'vous (formel ou plusieurs personnes)')], [['un message à ta meilleure amie', 0], ['un courriel à ton propriétaire', 1], ['un texto à ton frère', 0], ['un message aux parents de la classe', 1], ['un mot à un collègue proche', 0], ['une demande au service client', 1]]),
      tip(b('Tick the points', 'Cochez les points'), b('Write the required points as a **mini-checklist** on your draft (invitation ✓ description ✓ date ✓ heure ✓ adresse ✓ accès ✓). A missing point costs more than a small grammar mistake.', 'Notez les points demandés en **mini-liste** sur votre brouillon (invitation ✓ description ✓ date ✓ heure ✓ adresse ✓ accès ✓). Un point oublié coûte plus cher qu’une petite faute de grammaire.')),
      mc(P.choose, [b('vous (plural, friendly)', 'vous (pluriel, amical)'), b('tu', 'tu'), b('il', 'il'), b('nous only', 'seulement nous')], { fr: 'Vous écrivez à « vos amis » (plusieurs personnes). Quel pronom employer ?' }),
    ],
    [
      b('60–120 words; describe, tell or explain to recipients.', '60–120 mots ; décrire, raconter ou expliquer à des destinataires.'),
      b('List every point required and tick them.', 'Listez chaque point demandé et cochez-les.'),
      b('tu for one friend; vous for several people or formal.', 'tu pour un ami ; vous pour plusieurs ou en formel.'),
    ],
    [['emménager', b('to move in', 'arriver dans un logement')], ['l’accès', b('access, how to get there', 'comment venir')], ['un brouillon', b('a draft', 'premier jet')]],
  ),
  lesson(C, 2, ['structure-and-models', 'structure-et-modeles'],
    b('Structure and models', 'Structure et modèles'),
    b('Use a 4-part structure and learn from annotated models.', 'Utiliser une structure en 4 parties et s’inspirer de modèles commentés.'),
    [b('Open and close appropriately', 'Ouvrir et conclure de façon adaptée'), b('Organise the content', 'Organiser le contenu'), b('Use linking words', 'Employer des mots de liaison')],
    13,
    [
      card(b('4-part message', 'Message en 4 parties'), b('1. **Greeting**: Salut tout le monde ! / Bonjour Madame Roy, 2. **Purpose**: Je vous écris pour… / Bonne nouvelle : … 3. **Details** (each required point), linked with **et, mais, parce que, d’abord, ensuite**. 4. **Closing**: J’espère vous voir nombreux ! / Merci d’avance. / À bientôt, + signature.', '1. **Salutation** : Salut tout le monde ! / Bonjour Madame Roy, 2. **Objet** : Je vous écris pour… / Bonne nouvelle : … 3. **Détails** (chaque point demandé), reliés par **et, mais, parce que, d’abord, ensuite**. 4. **Clôture** : J’espère vous voir nombreux ! / Merci d’avance. / À bientôt, + signature.')),
      doc({ look: 'email', title: b('Model (about 100 words)', 'Modèle (environ 100 mots)'), text: 'Salut tout le monde !\n\nBonne nouvelle : j’ai enfin emménagé dans mon nouvel appartement et je vous invite à fêter ça samedi 14 juin, à partir de 19 h ! C’est un 4 ½ lumineux, avec un grand salon et un petit balcon qui donne sur un parc.\n\nL’adresse : 2150, rue Beaubien, appartement 3. C’est à cinq minutes à pied du métro Beaubien. Si vous venez en voiture, il y a du stationnement gratuit dans la rue après 18 h.\n\nApportez juste votre bonne humeur, je m’occupe du reste ! Dites-moi si vous venez.\n\nÀ samedi,\nSamira' }, b('Which required point is in the third paragraph?', 'Quel point demandé se trouve dans le troisième paragraphe ?'), [b('address and access', 'l’adresse et l’accès'), b('description of the flat', 'la description du logement'), b('the date', 'la date'), b('the closing', 'la clôture')]),
      sort(b('Which part of the message?', 'Quelle partie du message ?'), [b('greeting / purpose', 'salutation / objet'), b('details', 'détails'), b('closing', 'clôture')], [['Je vous écris pour vous inviter…', 0], ['C’est à cinq minutes du métro.', 1], ['Dites-moi si vous venez.', 2], ['Bonjour à tous,', 0], ['Il y a un grand salon lumineux.', 1], ['Merci d’avance, à bientôt !', 2]]),
      gap(P.complete, 'Je vous ___ pour vous inviter à mon anniversaire. C’est ___ cinq minutes à pied du métro.', ['écris', 'à']),
      ord(P.order, 'Dites-moi si vous venez, j’espère vous voir nombreux !', { tr: 'Let me know if you’re coming, I hope to see lots of you!' }),
    ],
    [
      b('Greeting → purpose → details → closing + signature.', 'Salutation → objet → détails → clôture + signature.'),
      b('One paragraph per group of points.', 'Un paragraphe par groupe de points.'),
      b('Link with et, mais, parce que, d’abord, ensuite.', 'Reliez avec et, mais, parce que, d’abord, ensuite.'),
    ],
    [['lumineux', b('bright', 'plein de lumière')], ['donner sur', b('to overlook', 'avoir vue sur')], ['le stationnement', b('parking', 'pour garer la voiture')]],
  ),
  lesson(C, 3, ['practice', 'entrainement'],
    b('Practice', 'Entraînement'),
    b('Write two task 1 messages in different registers and check them.', 'Rédiger deux messages de tâche 1 dans des registres différents et les vérifier.'),
    [b('Write a friendly message', 'Rédiger un message amical'), b('Write a formal message', 'Rédiger un message formel'), b('Check length and points', 'Vérifier longueur et points')],
    13,
    [
      write(b('Friendly message', 'Message amical'), b('Instruction: You have just started a new job. Write a message to a friend (60–120 words): describe your workplace and colleagues, say what you like, and suggest meeting to tell them more.', 'Consigne : Vous venez de commencer un nouveau travail. Écrivez à un ami (60–120 mots) : décrivez votre lieu de travail et vos collègues, dites ce qui vous plaît et proposez de vous voir pour en parler.'), 60, 120, [
        b('Workplace and colleagues', 'Lieu de travail et collègues'),
        b('What you like', 'Ce qui vous plaît'),
        b('A suggestion to meet', 'Une proposition de rencontre'),
      ], 'Salut Léo !\n\nÇa y est, j’ai commencé mon nouveau travail lundi ! Je travaille dans une petite agence de voyages au centre-ville, dans un bureau très lumineux. Mes collègues sont super sympas : on mange souvent ensemble le midi et ils m’aident beaucoup. Ce qui me plaît le plus, c’est de conseiller les clients pour leurs voyages en Asie.\n\nOn pourrait se voir samedi pour un café ? Je te raconterai tout !\n\nÀ bientôt,\nMaya'),
      write(b('Formal message', 'Message formel'), b('Instruction: Your child will be absent from school for three days. Write to the teacher (60–120 words): explain the reason, give the dates and ask how to catch up on the lessons.', 'Consigne : Votre enfant sera absent de l’école pendant trois jours. Écrivez à l’enseignante (60–120 mots) : expliquez la raison, donnez les dates et demandez comment rattraper les cours.'), 60, 120, [
        b('Formal greeting and closing', 'Salutation et formule de politesse'),
        b('Reason and dates', 'Raison et dates'),
        b('Question about catching up', 'Question sur le rattrapage'),
      ], 'Bonjour Madame Gagnon,\n\nJe vous informe que mon fils Adam sera absent du mercredi 12 au vendredi 14 mars inclus. Il doit être opéré des amygdales et le médecin lui a demandé de rester à la maison pendant sa convalescence.\n\nPourriez-vous me dire comment il peut rattraper les cours ? S’il y a des devoirs ou des fiches à faire, je peux passer les chercher à l’école mardi.\n\nJe vous remercie de votre compréhension.\n\nCordialement,\nFatima Ouali'),
      tip(b('Final check (2 minutes)', 'Vérification finale (2 minutes)'), b('**All points?** **60–120 words?** **Register consistent** (no tu/vous mix)? **Greeting and closing?** Then verbs, agreements and accents.', '**Tous les points ?** **60–120 mots ?** **Registre cohérent** (pas de mélange tu/vous) ? **Salutation et clôture ?** Puis verbes, accords et accents.')),
    ],
    [
      b('Friendly: tu, informal closing; formal: vous, polite formula.', 'Amical : tu, clôture familière ; formel : vous, formule de politesse.'),
      b('Every point of the instruction, in order.', 'Chaque point de la consigne, dans l’ordre.'),
      b('Stay between 60 and 120 words.', 'Restez entre 60 et 120 mots.'),
    ],
    [['rattraper', b('to catch up', 'récupérer le retard')], ['la convalescence', b('recovery period', 'temps pour guérir')], ['les amygdales', b('the tonsils', 'dans la gorge')]],
  ),
];
