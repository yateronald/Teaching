import type { CourseAbout } from '../../types';
import { b, card, culture, dict, dlg, gap, hear, lesson, mc, ord, P, pairs, say, sort, tip, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'In an emergency, you must be understood immediately. This course prepares you to call for help (112 in Europe, 911 in Canada), to say clearly what happened and where you are, to understand the operator’s questions, to describe a person who is hurt or ill, and to report a theft or a lost document to the police. Short, clear phrases you can rely on under stress.',
    'En cas d’urgence, il faut être compris immédiatement. Ce cours vous prépare à appeler les secours (112 en Europe, 911 au Canada), à dire clairement ce qui s’est passé et où vous êtes, à comprendre les questions de l’opérateur, à décrire une personne blessée ou malade, et à déclarer un vol ou un document perdu à la police. Des phrases courtes et claires, fiables même sous le stress.',
  ),
  outcomes: [
    b('Call emergency services', 'Appeler les services d’urgence'),
    b('Say what happened and where', 'Dire ce qui s’est passé et où'),
    b('Describe an injury or illness', 'Décrire une blessure ou un malaise'),
    b('Report a theft or loss', 'Déclarer un vol ou une perte'),
  ],
};

const C = 'b-emergencies';
export default [
  lesson(C, 1, ['calling-for-help', 'appeler-les-secours'],
    b('Calling for help', 'Appeler les secours'),
    b('Call the right number and give the essential information: what, where, who.', 'Appeler le bon numéro et donner l’essentiel : quoi, où, qui.'),
    [b('Know the emergency numbers', 'Connaître les numéros d’urgence'), b('Say what happened', 'Dire ce qui s’est passé'), b('Give the exact address', 'Donner l’adresse exacte')],
    13,
    [
      card(b('Emergency numbers and phrases', 'Numéros et phrases d’urgence'), b('**112**: European emergency number (works everywhere in the EU). France also: **15** (SAMU, medical), **17** (police), **18** (pompiers, fire). **Canada / Québec: 911**. Shout: **Au secours ! À l’aide ! Appelez une ambulance !** Say: **Il y a eu un accident. · Il y a un incendie. · Une personne a fait un malaise.** · **Je suis au 24 rue Victor-Hugo, au 3e étage.**', '**112** : numéro d’urgence européen (fonctionne partout dans l’UE). En France aussi : **15** (SAMU, médical), **17** (police), **18** (pompiers). **Canada / Québec : 911**. Crier : **Au secours ! À l’aide ! Appelez une ambulance !** Dire : **Il y a eu un accident. · Il y a un incendie. · Une personne a fait un malaise.** · **Je suis au 24 rue Victor-Hugo, au 3e étage.**')),
      tip(b('Where first', 'D’abord le lieu'), b('If the line is cut, the most important information is **where you are**. Say it early and clearly: number, street, city, floor, door code.', 'Si la ligne est coupée, l’information la plus importante est **où vous êtes**. Dites-le tôt et clairement : numéro, rue, ville, étage, code de la porte.')),
      sort(b('Which number in France?', 'Quel numéro en France ?'), [b('15 (medical)', '15 (médical)'), b('17 (police)', '17 (police)'), b('18 (fire)', '18 (pompiers)')], [['une personne inconsciente', 0], ['un cambriolage en cours', 1], ['un feu dans la cuisine', 2], ['une forte douleur à la poitrine', 0], ['une agression dans la rue', 1], ['de la fumée dans l’immeuble', 2]]),
      dlg(b('A call to 112', 'Un appel au 112'), undefined, [['Opératrice', 'f'], ['Vous', 'm']], [
        [0, 'Service des urgences, quelle est votre urgence ?', 'Emergency services, what is your emergency?'],
        [1, { options: ['Il y a eu un accident de vélo. Un homme est blessé à la tête.', 'Bonjour, comment allez-vous ?', 'Euh… je ne sais pas…'] }],
        [0, 'Où êtes-vous exactement ?', 'Where are you exactly?'],
        [1, { options: ['Au coin de la rue Saint-Denis et de la rue Ontario, devant la pharmacie.', 'Dans la rue.', 'En ville.'] }],
        [0, 'Il est conscient ? Il respire ?', 'Is he conscious? Is he breathing?'],
        [1, { options: ['Oui, il est conscient et il respire, mais il saigne.', 'Peut-être.', 'Je ne regarde pas.'] }],
      ], true),
      ord(P.order, 'Je suis au vingt-quatre rue Victor-Hugo, au troisième étage.', { tr: 'I’m at 24 rue Victor-Hugo, on the third floor.' }),
      say('Au secours ! Appelez une ambulance ! Il y a eu un accident.', 'Help! Call an ambulance! There’s been an accident.'),
    ],
    [
      b('112 in Europe; 911 in Canada; France: 15, 17, 18.', '112 en Europe ; 911 au Canada ; France : 15, 17, 18.'),
      b('Say where first: numéro, rue, ville, étage.', 'Dites d’abord où : numéro, rue, ville, étage.'),
      b('Il y a eu un accident / un incendie / un malaise.', 'Il y a eu un accident / un incendie / un malaise.'),
    ],
    [['les secours', b('emergency services', 'aide d’urgence')], ['un incendie', b('a fire', 'grand feu')], ['saigner', b('to bleed', 'perdre du sang')]],
  ),
  lesson(C, 2, ['describing-symptoms', 'decrire-l-etat-d-une-personne'],
    b('Describing someone’s condition', 'Décrire l’état d’une personne'),
    b('Answer the operator’s questions about a person who is hurt or ill.', 'Répondre aux questions de l’opérateur sur une personne blessée ou malade.'),
    [b('Say if the person is conscious and breathing', 'Dire si la personne est consciente et respire'), b('Describe symptoms', 'Décrire les symptômes'), b('Follow instructions', 'Suivre les consignes')],
    13,
    [
      card(b('Condition and symptoms', 'État et symptômes'), b('**Elle est consciente / inconsciente. · Il respire / il ne respire pas. · Elle a du mal à respirer. · Il a très mal à la poitrine. · Elle s’est cogné la tête. · Il saigne beaucoup. · Elle est diabétique / allergique.** Instructions: **Ne le bougez pas. · Mettez-le en position latérale de sécurité. · Appuyez sur la plaie. · Restez en ligne.**', '**Elle est consciente / inconsciente. · Il respire / il ne respire pas. · Elle a du mal à respirer. · Il a très mal à la poitrine. · Elle s’est cogné la tête. · Il saigne beaucoup. · Elle est diabétique / allergique.** Consignes : **Ne le bougez pas. · Mettez-le en position latérale de sécurité. · Appuyez sur la plaie. · Restez en ligne.**')),
      hear('D’accord, l’ambulance est en route. Ne la bougez pas, parlez-lui et restez en ligne avec moi.', b('What must you NOT do?', 'Que ne faut-il PAS faire ?'), [b('move the person', 'bouger la personne'), b('talk to her', 'lui parler'), b('stay on the line', 'rester en ligne'), b('wait for the ambulance', 'attendre l’ambulance')], { voice: 'f' }),
      pairs(P.match, [['inconscient', b('unconscious', 'ne réagit pas')], ['une plaie', b('a wound', 'blessure ouverte')], ['avoir du mal à respirer', b('to have trouble breathing', 'respirer difficilement')], ['Restez en ligne.', b('Stay on the line.', 'ne raccrochez pas')]]),
      mc(P.best, ['Elle est consciente, mais elle a du mal à respirer. Elle est allergique aux arachides.', 'Elle est malade, je crois.', 'Venez vite, c’est grave, au revoir.', 'Je ne sais rien.'], { fr: 'L’opérateur demande l’état de votre amie :' }),
      gap(P.complete, 'Il est ___ (conscious), il ___ (breathes), mais il saigne beaucoup.', ['conscient', 'respire']),
      say('Il est inconscient, mais il respire. Il s’est cogné la tête en tombant.', 'He is unconscious but breathing. He hit his head when he fell.'),
    ],
    [
      b('consciente / inconsciente; respire / ne respire pas.', 'consciente / inconsciente ; respire / ne respire pas.'),
      b('a mal à…, saigne, a du mal à respirer, est allergique à…', 'a mal à…, saigne, a du mal à respirer, est allergique à…'),
      b('Listen: Ne le bougez pas. Restez en ligne.', 'Écoutez : Ne le bougez pas. Restez en ligne.'),
    ],
    [['se cogner', b('to bump, to hit oneself', 'se heurter')], ['les arachides', b('peanuts', 'cacahuètes')], ['la poitrine', b('the chest', 'devant du corps')]],
  ),
  lesson(C, 3, ['theft-and-lost-documents', 'vol-et-documents-perdus'],
    b('Theft and lost documents', 'Vol et documents perdus'),
    b('Report a theft or a lost document to the police and to your consulate.', 'Déclarer un vol ou un document perdu à la police et à votre consulat.'),
    [b('Report a theft', 'Déclarer un vol'), b('Describe what was stolen', 'Décrire ce qui a été volé'), b('Ask for a report and next steps', 'Demander un récépissé et la suite')],
    13,
    [
      card(b('At the police station', 'Au commissariat'), b('**Je voudrais porter plainte pour un vol. · On m’a volé mon portefeuille dans le métro. · J’ai perdu mon passeport.** Describe: **Il y avait ma carte bancaire, ma carte d’identité et 50 €.** Ask: **Je peux avoir un récépissé / une copie de la déclaration ? · Qu’est-ce que je dois faire pour refaire mon passeport ?** Then: **faire opposition** (block your bank card) and contact your **consulat**.', '**Je voudrais porter plainte pour un vol. · On m’a volé mon portefeuille dans le métro. · J’ai perdu mon passeport.** Décrire : **Il y avait ma carte bancaire, ma carte d’identité et 50 €.** Demander : **Je peux avoir un récépissé / une copie de la déclaration ? · Qu’est-ce que je dois faire pour refaire mon passeport ?** Ensuite : **faire opposition** sur sa carte bancaire et contacter son **consulat**.')),
      culture(b('Plainte or déclaration?', 'Plainte ou déclaration ?'), b('For a **theft** you **portez plainte** (file a complaint); for a **loss** you make a **déclaration de perte**. In France, a **pré-plainte en ligne** is possible for some thefts; in Québec, you contact the city or provincial police. Keep the receipt: insurers and consulates ask for it.', 'Pour un **vol**, on **porte plainte** ; pour une **perte**, on fait une **déclaration de perte**. En France, une **pré-plainte en ligne** est possible pour certains vols ; au Québec, on s’adresse au service de police municipal ou à la Sûreté du Québec. Gardez le récépissé : assureurs et consulats le demandent.'), { variant: 'culture' }),
      mc(P.best, ['Bonjour, je voudrais porter plainte : on m’a volé mon sac dans le métro, ligne 4, vers 18 h.', 'Mon sac !', 'Voleur !', 'Retrouvez mon sac maintenant.'], { fr: 'Au commissariat :' }),
      sort(b('Theft or loss?', 'Vol ou perte ?'), [b('theft → porter plainte', 'vol → porter plainte'), b('loss → déclaration de perte', 'perte → déclaration de perte')], [['On m’a arraché mon téléphone.', 0], ['J’ai oublié mon sac dans le train.', 1], ['Ma voiture a été cambriolée.', 0], ['J’ai perdu mon passeport.', 1], ['Un pickpocket a pris mon portefeuille.', 0], ['Mes clés sont tombées quelque part.', 1]]),
      dict('On m’a volé mon portefeuille. Il y avait ma carte bancaire et ma carte d’identité.', {}),
      write(b('Your statement', 'Votre déclaration'), b('Write a short statement for the police (35–60 words): what happened, where, when, what was stolen, what you need.', 'Rédigez une courte déclaration pour la police (35–60 mots) : ce qui s’est passé, où, quand, ce qui a été volé, ce dont vous avez besoin.'), 35, 60, [
        b('What, where, when', 'Quoi, où, quand'),
        b('List of stolen items', 'Liste des objets volés'),
        b('Request (récépissé, help)', 'Demande (récépissé, aide)'),
      ], 'Hier, vers 18 h, dans le métro, ligne 4, quelqu’un m’a volé mon sac à dos noir. À l’intérieur, il y avait mon passeport, mon téléphone et ma carte bancaire. J’ai déjà fait opposition sur la carte. Je voudrais un récépissé pour mon consulat.'),
    ],
    [
      b('Theft: porter plainte. Loss: déclaration de perte.', 'Vol : porter plainte. Perte : déclaration de perte.'),
      b('On m’a volé… · Il y avait…', 'On m’a volé… · Il y avait…'),
      b('Ask for un récépissé; faire opposition; contact the consulate.', 'Demandez un récépissé ; faites opposition ; contactez le consulat.'),
    ],
    [['un commissariat', b('a police station', 'bureau de police')], ['un récépissé', b('a receipt (official)', 'preuve de dépôt')], ['faire opposition', b('to block (a card)', 'bloquer une carte')]],
  ),
];
