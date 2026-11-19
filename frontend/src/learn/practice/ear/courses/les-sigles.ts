// B2 · Acronyms: spelled out (la SNCF, un SMS) or read as words (l’ONU, l’OTAN).
import { ear, ex, fill, pick, situation } from '../authoring';

const INFO = 'Grève à la SNCF demain : la direction annonce un TGV sur deux. Les usagers peuvent se faire rembourser en ligne, et un SMS sera envoyé à chaque voyageur concerné.';
const INFO_SHOW = 'Grève à la {SNCF} demain : la direction annonce un {TGV} sur deux. Les usagers peuvent se faire rembourser en ligne, et un {SMS} sera envoyé à chaque voyageur concerné.';

export default ear('les-sigles', {
  rule: [
    ['Les sigles : épelés ou lus ?', 'Acronyms: spelled out or read?'],
    [
      'Certains sigles s’épellent, lettre par lettre : __la SNCF__ [ɛsɛnseɛf], __un SMS__, __le PDG__, __un CDI__. D’autres se lisent comme un mot : __l’ONU__ [lɔny], __l’OTAN__, __l’Unesco__, __le SAMU__.\n\nLe genre vient du premier mot : __la SNCF__ (la Société nationale…), __le PDG__ (le président-directeur général). Pour comprendre une information, il faut reconnaître le sigle et savoir ce qu’il désigne.',
      'Some acronyms are spelled out, letter by letter: __la SNCF__ [ɛsɛnseɛf], __un SMS__, __le PDG__, __un CDI__. Others are read as a word: __l’ONU__ [lɔny], __l’OTAN__, __l’Unesco__, __le SAMU__.\n\nThe gender comes from the first word: __la SNCF__ (la Société nationale…), __le PDG__ (le président-directeur général). To follow the news you must recognise the acronym and know what it stands for.',
    ],
  ],
  goal: ['Reconnaître un sigle, épelé ou lu, et ce qu’il désigne.', 'Recognise an acronym, spelled or read, and what it stands for.'],
  examples: [
    ex('Elle a signé un CDI.', 'Elle a signé un {CDI}.', ['Épelé : un contrat à durée indéterminée.', 'Spelled: a permanent contract.']),
    ex('L’ONU a voté une résolution.', 'L’{ONU} a voté une résolution.', ['Lu comme un mot : l’Organisation des Nations unies.', 'Read as a word: the United Nations.']),
    ex('Le PDG a démissionné.', 'Le {PDG} a démissionné.', ['Épelé : le président-directeur général.', 'Spelled: the chief executive.']),
  ],
  items: [
    pick('Elle a enfin trouvé un CDI.', ['Un contrat de travail sans date de fin', 'Un diplôme universitaire', 'Un appartement'], 0, 'Elle a enfin trouvé un {CDI}.', [
      'Un CDI = un contrat à durée indéterminée.', 'Un CDI = a permanent contract.',
    ], ['Qu’a-t-elle trouvé ?', 'What has she found?']),
    pick('Il faut appeler le SAMU.', ['La police', 'Les urgences médicales', 'Les pompiers'], 1, 'Il faut appeler le {SAMU}.', [
      'Le SAMU = le service d’aide médicale urgente, le 15.', 'Le SAMU = emergency medical services, number 15.',
    ], ['Qui faut-il appeler ?', 'Who must be called?']),
    pick('Le PDG a présenté les résultats.', ['Le patron de l’entreprise', 'Le porte-parole du gouvernement', 'Le professeur'], 0, 'Le {PDG} a présenté les résultats.', [
      'Le PDG dirige l’entreprise.', 'The PDG runs the company.',
    ], ['Qui a présenté les résultats ?', 'Who presented the results?']),
    pick('Je t’envoie un SMS.', ['Un message écrit sur le téléphone', 'Un courrier postal', 'Un colis'], 0, 'Je t’envoie un {SMS}.', [
      'Un SMS = un message texte.', 'Un SMS = a text message.',
    ], ['Qu’envoie-t-il ?', 'What is he sending?']),
    pick('L’Unesco a classé ce site.', ['Il a été inscrit au patrimoine mondial', 'Il a été fermé au public', 'Il a été vendu'], 0, 'L’{Unesco} a classé ce site.', [
      'L’Unesco, lu comme un mot, inscrit des sites au patrimoine mondial.', 'UNESCO, read as a word, lists World Heritage sites.',
    ], ['Que s’est-il passé pour ce site ?', 'What happened to this site?']),
    fill('Le TGV arrive à Lyon à midi.', 'Le ___ arrive à Lyon à midi.', 'TGV', 'Le {TGV} arrive à Lyon à midi.', [
      'Le TGV = le train à grande vitesse, épelé.', 'Le TGV = the high-speed train, spelled out.',
    ]),
    fill('Il travaille dans une PME.', 'Il travaille dans une ___.', 'PME', 'Il travaille dans une {PME}.', [
      'Une PME = une petite ou moyenne entreprise (féminin).', 'Une PME = a small or medium-sized company (feminine).',
    ]),
    fill('Elle a passé son bac l’an dernier.', 'Elle a passé son ___ l’an dernier.', 'bac', 'Elle a passé son {bac} l’an dernier.', [
      'Le bac, raccourci du baccalauréat, se lit comme un mot.', 'Le bac, short for baccalauréat, is read as a word.',
    ]),
    situation(INFO, 'Combien de trains à grande vitesse circuleront demain ?', ['Un sur deux', 'Aucun', 'Tous'], 0, INFO_SHOW, [
      '« Un TGV sur deux » : la moitié des trains.', '« One TGV in two »: half the trains.',
    ]),
    situation(INFO, 'Comment les voyageurs concernés seront-ils prévenus ?', ['Par un message sur leur téléphone', 'Par courrier', 'Par une annonce à la radio seulement'], 0, INFO_SHOW, [
      '« Un SMS sera envoyé à chaque voyageur concerné. »', '« A text will be sent to each traveller affected. »',
    ]),
  ],
  takeaway: [
    'Un sigle s’épelle (la SNCF, un CDI, le PDG) ou se lit comme un mot (l’ONU, le SAMU, l’Unesco). Son genre est celui de son premier mot.',
    'An acronym is spelled out (la SNCF, un CDI, le PDG) or read as a word (l’ONU, le SAMU, l’Unesco). Its gender is that of its first word.',
  ],
});
