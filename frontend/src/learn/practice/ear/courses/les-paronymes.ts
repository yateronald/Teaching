// C2 · Paronyms: éminent / imminent, infraction / effraction, allocution / allocation.
import { ear, ex, fill, pick, situation } from '../authoring';

const ALERTE = 'Un éminent chercheur a averti, lors d’une allocution très suivie, qu’une crise était imminente si rien ne changeait dans la conjoncture actuelle.';
const ALERTE_SHOW = 'Un {éminent} chercheur a averti, lors d’une {allocution} très suivie, qu’une crise était {imminente} si rien ne changeait dans la {conjoncture} actuelle.';

export default ear('les-paronymes', {
  rule: [
    ['Des mots presque pareils', 'Words that sound almost alike'],
    [
      'Les paronymes se ressemblent à une voyelle ou une syllabe près, mais leur sens n’a rien à voir. Les confondre est une erreur fréquente, même chez les francophones :\n\n__éminent__ (remarquable) / __imminent__ (sur le point d’arriver) ; __une infraction__ (une violation de la loi) / __une effraction__ (le fait de forcer une entrée) ; __une allocution__ (un discours) / __une allocation__ (une aide financière) ; __la conjoncture__ (la situation économique) / __une conjecture__ (une hypothèse) ; __une éruption__ (d’un volcan) / __une irruption__ (une entrée brusque) ; __une collision__ (un choc) / __une collusion__ (une entente secrète).',
      'Paronyms differ by one vowel or syllable, but their meanings are unrelated. Mixing them up is common, even among native speakers:\n\n__éminent__ (eminent) / __imminent__ (about to happen); __une infraction__ (an offence) / __une effraction__ (a break-in); __une allocution__ (a speech) / __une allocation__ (an allowance); __la conjoncture__ (the economic situation) / __une conjecture__ (a guess); __une éruption__ (of a volcano) / __une irruption__ (a sudden entry); __une collision__ (a crash) / __une collusion__ (collusion).',
    ],
  ],
  goal: ['Distinguer des mots qui se ressemblent et choisir le bon sens.', 'Tell similar-sounding words apart and pick the right meaning.'],
  examples: [
    ex('Un danger imminent.', 'Un danger {imminent}.', ['Tout proche, sur le point d’arriver.', 'About to happen.']),
    ex('Un éminent spécialiste.', 'Un {éminent} spécialiste.', ['Très reconnu.', 'Highly regarded.']),
    ex('Ils sont entrés par effraction.', 'Ils sont entrés par {effraction}.', ['En forçant l’entrée.', 'By breaking in.']),
  ],
  items: [
    pick('Le danger est imminent.', ['Très important et célèbre', 'Tout proche, sur le point d’arriver'], 1, 'Le danger est {imminent}.', [
      'Imminent [iminɑ̃] : qui va arriver très bientôt.', 'Imminent: about to happen.',
    ], ['Le danger est…', 'The danger is…']),
    pick('C’est un éminent spécialiste du climat.', ['Très reconnu', 'Sur le point d’arriver'], 0, 'C’est un {éminent} spécialiste du climat.', [
      'Éminent [eminɑ̃] : remarquable, réputé.', 'Éminent: distinguished.',
    ], ['Comment est ce spécialiste ?', 'What is this specialist like?']),
    pick('Les cambrioleurs sont entrés par effraction.', ['En commettant une faute de conduite', 'En forçant une porte ou une fenêtre'], 1, 'Les cambrioleurs sont entrés par {effraction}.', [
      'Effraction = le fait de forcer une entrée.', 'Effraction = a break-in.',
    ], ['Comment sont-ils entrés ?', 'How did they get in?']),
    pick('Le président a prononcé une allocution.', ['Un discours', 'Une aide financière'], 0, 'Le président a prononcé une {allocution}.', [
      'On prononce une allocution ; on reçoit une allocation.', 'You deliver an allocution (speech); you receive an allocation (benefit).',
    ], ['Qu’a-t-il prononcé ?', 'What did he deliver?']),
    pick('Dans la conjoncture actuelle, il faut être prudent.', ['Une hypothèse', 'La situation économique du moment'], 1, 'Dans la {conjoncture} actuelle, il faut être prudent.', [
      'La conjoncture = la situation (économique) du moment.', 'The current economic situation.',
    ], ['Que signifie « la conjoncture » ?', 'What does « la conjoncture » mean?']),
    fill('Il a reçu une allocation logement.', 'Il a reçu une ___ logement.', 'allocation', 'Il a reçu une {allocation} logement.', [
      'Allocation = une aide financière.', 'An allowance.',
    ]),
    fill('Il a commis une infraction au code de la route.', 'Il a commis une ___ au code de la route.', 'infraction', 'Il a commis une {infraction} au code de la route.', [
      'Infraction = une violation d’une règle.', 'An offence.',
    ]),
    fill('Le volcan est entré en éruption.', 'Le volcan est entré en ___.', 'éruption', 'Le volcan est entré en {éruption}.', [
      'Éruption (volcan) ≠ irruption (entrée brusque).', 'Eruption ≠ irruption.',
    ]),
    situation(ALERTE, 'Qui a parlé ?', ['Un chercheur débutant', 'Un journaliste', 'Un chercheur très reconnu'], 2, ALERTE_SHOW, [
      '« Un éminent chercheur » : très reconnu.', '« A distinguished researcher ».',
    ]),
    situation(ALERTE, 'Qu’a-t-il annoncé ?', ['Une crise proche si rien ne change', 'Une crise déjà passée', 'Une aide financière'], 0, ALERTE_SHOW, [
      '« Une crise était imminente » : sur le point d’arriver.', '« A crisis was imminent ».',
    ]),
  ],
  takeaway: [
    'Éminent / imminent, infraction / effraction, allocution / allocation, conjoncture / conjecture, éruption / irruption : une syllabe change tout. Le contexte confirme le bon mot.',
    'Éminent / imminent, infraction / effraction, allocution / allocation, conjoncture / conjecture, éruption / irruption: one syllable changes everything. Context confirms the right word.',
  ],
});
