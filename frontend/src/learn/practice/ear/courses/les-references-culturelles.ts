// C2 · Cultural allusions: c’est Byzance, une victoire à la Pyrrhus, le talon d’Achille.
import { ear, ex, fill, pick, situation } from '../authoring';

const REFORME = 'Lancer cette réforme maintenant, c’est ouvrir la boîte de Pandore. Je ne veux pas jouer les Cassandre, mais la dette restera une épée de Damoclès au-dessus de nos têtes.';
const REFORME_SHOW = 'Lancer cette réforme maintenant, c’est {ouvrir la boîte de Pandore}. Je ne veux pas {jouer les Cassandre}, mais la dette restera {une épée de Damoclès} au-dessus de nos têtes.';

export default ear('les-references-culturelles', {
  rule: [
    ['Les allusions que tout le monde comprend', 'Allusions everyone understands'],
    [
      'Le français cultivé puise dans l’histoire, la mythologie et la littérature des images devenues courantes :\n\n__c’est Byzance__ (le luxe, l’abondance), __une victoire à la Pyrrhus__ (une victoire trop coûteuse), __le tonneau des Danaïdes__ (une tâche sans fin), __le talon d’Achille__ (le point faible), __ouvrir la boîte de Pandore__ (déclencher une série de malheurs), __une épée de Damoclès__ (une menace permanente), __jouer les Cassandre__ (prédire des malheurs sans être cru), __franchir le Rubicon__ (prendre une décision irréversible), __une madeleine de Proust__ (une sensation qui fait revivre un souvenir).',
      'Educated French draws on history, mythology and literature for images that have become common:\n\n__c’est Byzance__ (luxury, plenty), __une victoire à la Pyrrhus__ (a victory at too high a cost), __le tonneau des Danaïdes__ (an endless task), __le talon d’Achille__ (the weak spot), __ouvrir la boîte de Pandore__ (to unleash a chain of trouble), __une épée de Damoclès__ (a constant threat), __jouer les Cassandre__ (to predict disaster without being believed), __franchir le Rubicon__ (to cross the point of no return), __une madeleine de Proust__ (a sensation that brings back a memory).',
    ],
  ],
  goal: ['Comprendre une allusion culturelle courante.', 'Understand a common cultural allusion.'],
  examples: [
    ex('Avec ce nouveau bureau, c’est Byzance !', 'Avec ce nouveau bureau, {c’est Byzance} !', ['= C’est le grand luxe.', '= Absolute luxury.']),
    ex('C’est son talon d’Achille.', 'C’est son {talon d’Achille}.', ['= Son point faible.', '= His weak spot.']),
    ex('Il a franchi le Rubicon.', 'Il a {franchi le Rubicon}.', ['= Il a pris une décision sans retour.', '= He crossed the point of no return.']),
  ],
  items: [
    pick('Avec le nouveau budget, c’est Byzance !', ['C’est la crise', 'C’est le luxe, l’abondance'], 1, 'Avec le nouveau budget, {c’est Byzance} !', [
      'Byzance, ville du luxe impérial : l’abondance.', 'Byzantium, a city of imperial luxury: plenty.',
    ], ['Que veut dire la personne ?', 'What does the speaker mean?']),
    pick('Ils ont gagné, mais c’est une victoire à la Pyrrhus.', ['Une victoire facile', 'Une victoire qui coûte trop cher'], 1, 'Ils ont gagné, mais c’est {une victoire à la Pyrrhus}.', [
      'Le roi Pyrrhus gagna, mais perdit presque toute son armée.', 'King Pyrrhus won, but lost nearly all his army.',
    ], ['Quel genre de victoire ?', 'What kind of victory?']),
    pick('Ce dossier, c’est le tonneau des Danaïdes.', ['Une tâche sans fin', 'Un dossier très simple'], 0, 'Ce dossier, c’est {le tonneau des Danaïdes}.', [
      'Les Danaïdes devaient remplir un tonneau percé : un travail sans fin.', 'Filling a leaking barrel: never-ending work.',
    ], ['Que veut dire la personne ?', 'What does the speaker mean?']),
    pick('La défense, c’est le talon d’Achille de cette équipe.', ['Son point fort', 'Son point faible'], 1, 'La défense, c’est {le talon d’Achille} de cette équipe.', [
      'Achille n’était vulnérable qu’au talon.', 'Achilles was vulnerable only at the heel.',
    ], ['Que dit-on de la défense ?', 'What is said about the defence?']),
    pick('Cette odeur de pain chaud, c’est ma madeleine de Proust.', ['Elle me rappelle un souvenir d’enfance', 'Je n’aime pas cette odeur'], 0, 'Cette odeur de pain chaud, c’est {ma madeleine de Proust}.', [
      'Chez Proust, le goût d’une madeleine fait revivre l’enfance.', 'In Proust, the taste of a madeleine revives childhood.',
    ], ['Que veut dire la personne ?', 'What does the speaker mean?']),
    fill('Avec cette loi, on ouvre la boîte de Pandore.', 'Avec cette loi, on ouvre la boîte de ___.', 'Pandore', 'Avec cette loi, on ouvre {la boîte de Pandore}.', [
      'Pandore libère tous les maux du monde en ouvrant une boîte.', 'Pandora released all the world’s evils.',
    ]),
    fill('Cette menace, c’est une épée de Damoclès.', 'Cette menace, c’est une épée de ___.', 'Damoclès', 'Cette menace, c’est {une épée de Damoclès}.', [
      'Une épée suspendue par un crin au-dessus de sa tête : un danger permanent.', 'A sword hanging by a hair: a constant danger.',
    ]),
    fill('En signant, il a franchi le Rubicon.', 'En signant, il a franchi le ___.', 'Rubicon', 'En signant, il a {franchi le Rubicon}.', [
      'César franchit le Rubicon : un acte sans retour.', 'Caesar crossed the Rubicon: no turning back.',
    ]),
    situation(REFORME, 'Que craint l’orateur en lançant la réforme ?', ['De perdre du temps', 'De déclencher une série de problèmes', 'D’oublier la dette'], 1, REFORME_SHOW, [
      '« Ouvrir la boîte de Pandore » = libérer des malheurs en chaîne.', '« Open Pandora’s box ».',
    ]),
    situation(REFORME, 'Que signifie « je ne veux pas jouer les Cassandre » ?', ['Je ne veux pas faire de théâtre', 'Je ne veux pas voter', 'Je ne veux pas annoncer des malheurs à tout prix'], 2, REFORME_SHOW, [
      'Cassandre prédisait des malheurs que personne ne croyait.', 'Cassandra foretold disasters no one believed.',
    ]),
  ],
  takeaway: [
    'Byzance (luxe), Pyrrhus (victoire trop chère), Danaïdes (tâche sans fin), Achille (point faible), Pandore (malheurs en chaîne), Damoclès (menace), Cassandre (prophète de malheur), Rubicon (sans retour).',
    'Byzance (luxury), Pyrrhus (costly victory), Danaïdes (endless task), Achilles (weak spot), Pandora (chain of trouble), Damocles (threat), Cassandra (prophet of doom), Rubicon (no return).',
  ],
});
