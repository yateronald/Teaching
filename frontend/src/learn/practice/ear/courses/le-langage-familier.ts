// C1 · Informal French: bosser, une bagnole, crevé, galérer, se casser.
import { ear, ex, fill, pick, situation } from '../authoring';

const BOULOT = 'Franchement, ce boulot, j’en ai marre : je bosse comme un fou, je suis crevé, et à la fin du mois, j’ai toujours pas de fric. Je crois que je vais me casser.';
const BOULOT_SHOW = 'Franchement, ce {boulot}, j’{en ai marre} : je {bosse} comme un fou, je suis {crevé}, et à la fin du mois, j’ai toujours pas de {fric}. Je crois que je vais {me casser}.';

export default ear('le-langage-familier', {
  rule: [
    ['Le français familier', 'Informal French'],
    [
      'Entre amis, au travail, dans les films, on entend un vocabulaire familier très courant : __bosser__ (travailler), __le boulot__ (le travail), __bouffer__ (manger), __une bagnole__ (une voiture), __le fric__ (l’argent), __crevé__ (très fatigué), __galérer__ (avoir beaucoup de mal), __piger__ (comprendre), __se casser__ (partir), __flipper__ (avoir peur), __râler__ (se plaindre), __en avoir marre__ (en avoir assez).\n\nIl faut les comprendre, mais les employer avec prudence : ils conviennent aux amis, pas à un entretien d’embauche.',
      'Among friends, at work, in films, you hear very common informal words: __bosser__ (to work), __le boulot__ (work), __bouffer__ (to eat), __une bagnole__ (a car), __le fric__ (money), __crevé__ (exhausted), __galérer__ (to struggle), __piger__ (to get it), __se casser__ (to leave), __flipper__ (to be scared), __râler__ (to grumble), __en avoir marre__ (to be fed up).\n\nYou need to understand them, but use them carefully: fine with friends, not in a job interview.',
    ],
  ],
  goal: ['Comprendre le vocabulaire familier le plus courant.', 'Understand the most common informal vocabulary.'],
  examples: [
    ex('Je suis crevé, j’ai bossé toute la journée.', 'Je suis {crevé}, j’ai {bossé} toute la journée.', ['Crevé = très fatigué ; bosser = travailler.', 'Crevé = exhausted; bosser = to work.'], 'J’suis crevé, j’ai bossé toute la journée.'),
    ex('Tu me files ton numéro ?', 'Tu me {files} ton numéro ?', ['Filer = donner.', 'Filer = to give.']),
    ex('J’ai pas pigé.', 'J’ai pas {pigé}.', ['Piger = comprendre.', 'Piger = to get it.']),
  ],
  items: [
    pick('J’ai galéré pour trouver un appart.', ['Il a trouvé facilement', 'Il a eu beaucoup de mal'], 1, 'J’ai {galéré} pour trouver un appart.', [
      'Galérer = avoir beaucoup de difficultés.', 'Galérer = to struggle.',
    ], ['Comment s’est passée sa recherche ?', 'How did his search go?']),
    pick('Il a une nouvelle bagnole.', ['Une voiture', 'Une bague', 'Un bateau'], 0, 'Il a une nouvelle {bagnole}.', [
      'Une bagnole = une voiture.', 'Une bagnole = a car.',
    ], ['Qu’a-t-il de nouveau ?', 'What does he have that is new?']),
    pick('On se casse ?', ['On se dispute ?', 'On s’en va ?', 'On se blesse ?'], 1, 'On {se casse} ?', [
      'Se casser = partir (familier).', 'Se casser = to leave (informal).',
    ], ['Que propose la personne ?', 'What is the speaker suggesting?']),
    pick('Il râle tout le temps.', ['Il se plaint sans arrêt', 'Il rit sans arrêt', 'Il dort sans arrêt'], 0, 'Il {râle} tout le temps.', [
      'Râler = se plaindre, protester.', 'Râler = to grumble.',
    ], ['Que fait-il tout le temps ?', 'What does he do all the time?']),
    pick('J’ai flippé pendant le film.', ['J’ai ri', 'J’ai dormi', 'J’ai eu peur'], 2, 'J’ai {flippé} pendant le film.', [
      'Flipper = avoir peur.', 'Flipper = to be scared.',
    ], ['Qu’a-t-il ressenti ?', 'How did he feel?']),
    fill('Je bosse demain matin.', 'Je ___ demain matin.', 'bosse', 'Je {bosse} demain matin.', [
      'Bosser = travailler.', 'Bosser = to work.',
    ]),
    fill('Passe-moi le truc, là.', 'Passe-moi le ___, là.', 'truc', 'Passe-moi le {truc}, là.', [
      'Un truc = une chose dont on ne dit pas le nom.', 'Un truc = a thing, a whatsit.',
    ]),
    fill('J’en ai marre de ce bruit.', 'J’en ai ___ de ce bruit.', 'marre', 'J’en ai {marre} de ce bruit.', [
      'En avoir marre = en avoir assez.', 'En avoir marre = to be fed up.',
    ]),
    situation(BOULOT, 'Que pense-t-il de son travail ?', ['Il l’adore', 'Il le trouve facile', 'Il en a assez'], 2, BOULOT_SHOW, [
      '« Ce boulot, j’en ai marre » = il en a assez de ce travail.', '« I am fed up with this job ».',
    ]),
    situation(BOULOT, 'Que pense-t-il faire ?', ['Demander une augmentation', 'Partir, quitter ce travail', 'Travailler davantage'], 1, BOULOT_SHOW, [
      '« Je vais me casser » = je vais partir.', '« I am going to leave ».',
    ]),
  ],
  takeaway: [
    'Bosser, le boulot, crevé, galérer, le fric, se casser, en avoir marre : à comprendre partout, à employer entre proches seulement.',
    'Bosser, le boulot, crevé, galérer, le fric, se casser, en avoir marre: understand them everywhere, use them only with people you know well.',
  ],
});
