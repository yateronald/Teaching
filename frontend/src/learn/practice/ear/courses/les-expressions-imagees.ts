// C1 · Idioms in context: poser un lapin, avoir le cafard, coûter les yeux de la tête.
import { ear, ex, fill, pick, situation } from '../authoring';

const AMI = 'Tu ne vas pas en faire tout un fromage ! Il t’a posé un lapin une fois, d’accord, mais il ne raconte pas de salades : il était vraiment malade.';
const AMI_SHOW = 'Tu ne vas pas {en faire tout un fromage} ! Il t’a {posé un lapin} une fois, d’accord, mais il ne {raconte pas de salades} : il était vraiment malade.';

export default ear('les-expressions-imagees', {
  rule: [
    ['Les expressions imagées', 'Idioms'],
    [
      'Le français parlé est plein d’images qu’il ne faut pas prendre au pied de la lettre : __poser un lapin__ (ne pas venir à un rendez-vous), __avoir le cafard__ (être triste), __coûter les yeux de la tête__ (coûter très cher), __mettre les pieds dans le plat__ (aborder maladroitement un sujet délicat), __donner sa langue au chat__ (renoncer à deviner), __en faire tout un fromage__ (exagérer l’importance de quelque chose), __raconter des salades__ (mentir).\n\nLe contexte aide presque toujours : si l’on parle d’un rendez-vous manqué, un lapin n’a rien d’un animal.',
      'Spoken French is full of images not to be taken literally: __poser un lapin__ (to stand someone up), __avoir le cafard__ (to feel down), __coûter les yeux de la tête__ (to cost an arm and a leg), __mettre les pieds dans le plat__ (to put your foot in it), __donner sa langue au chat__ (to give up guessing), __en faire tout un fromage__ (to make a fuss), __raconter des salades__ (to tell lies).\n\nThe context nearly always helps: if a missed date is being discussed, the rabbit is no animal.',
    ],
  ],
  goal: ['Comprendre une expression imagée dans son contexte.', 'Understand an idiom in its context.'],
  examples: [
    ex('Il m’a posé un lapin.', 'Il m’a {posé un lapin}.', ['Il n’est pas venu au rendez-vous.', 'He stood me up.']),
    ex('Ça coûte les yeux de la tête.', 'Ça {coûte les yeux de la tête}.', ['C’est très cher.', 'It costs a fortune.']),
    ex('J’ai un peu le cafard.', 'J’ai un peu {le cafard}.', ['Je suis un peu triste.', 'I feel a bit low.']),
  ],
  items: [
    pick('Il m’a posé un lapin hier soir.', ['Il m’a offert un cadeau', 'Il n’est pas venu au rendez-vous', 'Il est arrivé en retard'], 1, 'Il m’a {posé un lapin} hier soir.', [
      'Poser un lapin = ne pas venir, sans prévenir.', 'Poser un lapin = to stand someone up.',
    ], ['Que s’est-il passé ?', 'What happened?']),
    pick('Cette voiture coûte les yeux de la tête.', ['Elle est très chère', 'Elle est bon marché', 'Elle est dangereuse'], 0, 'Cette voiture {coûte les yeux de la tête}.', [
      'Coûter les yeux de la tête = coûter très cher.', 'To cost an arm and a leg.',
    ], ['Que dit-on de la voiture ?', 'What is said about the car?']),
    pick('Depuis la rentrée, elle a le cafard.', ['Elle est malade', 'Elle est très occupée', 'Elle est triste, déprimée'], 2, 'Depuis la rentrée, elle a {le cafard}.', [
      'Avoir le cafard = avoir le moral bas.', 'Avoir le cafard = to feel down.',
    ], ['Comment va-t-elle ?', 'How is she?']),
    pick('Il a mis les pieds dans le plat.', ['Il a renversé le repas', 'Il a abordé maladroitement un sujet délicat', 'Il est parti sans payer'], 1, 'Il a {mis les pieds dans le plat}.', [
      'Mettre les pieds dans le plat = parler sans délicatesse d’un sujet gênant.', 'To blurt out an awkward subject.',
    ], ['Qu’a-t-il fait ?', 'What did he do?']),
    pick('Je donne ma langue au chat.', ['J’abandonne, donne-moi la réponse', 'Je ne veux plus parler', 'J’ai un chat'], 0, 'Je {donne ma langue au chat}.', [
      'Donner sa langue au chat = renoncer à trouver la réponse.', 'To give up guessing.',
    ], ['Que veut dire la personne ?', 'What does the speaker mean?']),
    fill('Arrête de me casser les pieds !', 'Arrête de me casser les ___ !', 'pieds', 'Arrête de me {casser les pieds} !', [
      'Casser les pieds = ennuyer, agacer.', 'Casser les pieds = to annoy.',
    ]),
    fill('Il a toujours la tête dans les nuages.', 'Il a toujours la tête dans les ___.', 'nuages', 'Il a toujours {la tête dans les nuages}.', [
      'Avoir la tête dans les nuages = être distrait, rêveur.', 'To have your head in the clouds.',
    ]),
    fill('Elle est tombée dans les pommes.', 'Elle est tombée dans les ___.', 'pommes', 'Elle est {tombée dans les pommes}.', [
      'Tomber dans les pommes = s’évanouir.', 'Tomber dans les pommes = to faint.',
    ]),
    situation(AMI, 'Que reproche-t-on à la personne qui écoute ?', ['D’avoir menti', 'De faire toute une histoire pour peu de chose', 'D’être malade'], 1, AMI_SHOW, [
      '« En faire tout un fromage » = exagérer l’importance d’un fait.', '« To make a whole cheese of it » = to make a fuss.',
    ]),
    situation(AMI, 'Selon l’orateur, l’ami a-t-il menti ?', ['Oui', 'On ne sait pas', 'Non, il était vraiment malade'], 2, AMI_SHOW, [
      '« Il ne raconte pas de salades » = il ne ment pas.', '« He is not telling tales » = he is not lying.',
    ]),
  ],
  takeaway: [
    'Une expression imagée ne se comprend pas mot à mot : poser un lapin, avoir le cafard, coûter les yeux de la tête, raconter des salades. Cherchez le sens dans la situation.',
    'An idiom cannot be understood word by word: poser un lapin, avoir le cafard, coûter les yeux de la tête, raconter des salades. Look for the meaning in the situation.',
  ],
});
