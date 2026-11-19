// C1 · Liaisons in careful speech, and the forbidden ones (h aspiré, et).
import { ear, ex, fill, pick, situation } from '../authoring';

const ACCUEIL = 'Mesdames et messieurs, nous sommes heureux de vous accueillir. Les auteurs invités sont arrivés ce matin, et ils ont déjà visité les hauteurs de la ville.';
const ACCUEIL_SHOW = 'Mesdames et messieurs, nous sommes‿heureux de vous‿accueillir. Les‿{auteurs} invités sont‿arrivés ce matin, et ils‿ont déjà visité les {hauteurs} de la ville.';

export default ear('les-liaisons-du-discours-soigne', {
  rule: [
    ['Les liaisons du discours soigné', 'Liaisons in careful speech'],
    [
      'Dans un discours, une conférence ou les informations, on fait plus de liaisons qu’au quotidien : __ils sont‿arrivés__, __je suis‿allé__, __pas‿encore__, __nous sommes‿heureux__. Ces liaisons facultatives ne changent pas le sens, mais elles signalent un registre soigné.\n\nCertaines liaisons, en revanche, sont **interdites**, et les entendre ou non change le mot : devant un __h aspiré__, on ne lie jamais (__les / héros__ [leeʁo], mais __les‿zéros__ [lezeʁo] ; __les / hauteurs__ ≠ __les‿auteurs__). Jamais de liaison non plus après __et__.',
      'In speeches, lectures or the news, people make more liaisons than in daily life: __ils sont‿arrivés__, __je suis‿allé__, __pas‿encore__, __nous sommes‿heureux__. These optional liaisons do not change the meaning, but they signal a careful register.\n\nSome liaisons, however, are **forbidden**, and hearing one or not changes the word: before an __h aspiré__ you never link (__les / héros__ [leeʁo], but __les‿zéros__ [lezeʁo]; __les / hauteurs__ ≠ __les‿auteurs__). Never a liaison after __et__ either.',
    ],
  ],
  goal: ['Reconnaître les liaisons soignées, et les mots que l’absence de liaison distingue.', 'Recognise careful liaisons, and the words told apart by a missing liaison.'],
  examples: [
    ex('Je ne suis pas encore prêt.', 'Je ne suis pas‿encore prêt.', ['Liaison facultative en [z], fréquente dans un discours soigné.', 'Optional [z] liaison, frequent in careful speech.']),
    ex('Les héros sont fatigués.', 'Les / {héros} sont fatigués.', ['H aspiré : aucune liaison.', 'H aspiré: no liaison.']),
    ex('Les auteurs sont arrivés.', 'Les‿{auteurs} sont‿arrivés.', ['Liaison en [z] devant une voyelle.', '[z] liaison before a vowel.']),
  ],
  items: [
    pick('Les héros du film sont célèbres.', ['Les zéros du film sont célèbres.', 'Les héros du film sont célèbres.'], 1, 'Les / {héros} du film sont célèbres.', [
      'Pas de [z] : c’est « héros », avec un h aspiré.', 'No [z]: it is « héros », with an h aspiré.',
    ]),
    pick('Il admire les hauteurs de la ville.', ['Il admire les hauteurs de la ville.', 'Il admire les auteurs de la ville.'], 0, 'Il admire les / {hauteurs} de la ville.', [
      'Pas de liaison : « hauteurs ». Avec [z], ce serait « les auteurs ».', 'No liaison: « hauteurs ». With [z] it would be « les auteurs ».',
    ]),
    pick('Ce sont des auteurs connus.', ['Ce sont des hauteurs connues.', 'Ce sont des auteurs connus.'], 1, 'Ce sont des‿{auteurs} connus.', [
      'On entend [dezotœʁ] : la liaison montre que c’est « auteurs ».', 'You hear [dezotœʁ]: the liaison shows it is « auteurs ».',
    ]),
    pick('On se promène sous les hêtres.', ['On se promène sous les hêtres.', 'On se promène sous les êtres.'], 0, 'On se promène sous les / {hêtres}.', [
      'Sans liaison : les hêtres, des arbres.', 'No liaison: les hêtres, beech trees.',
    ]),
    pick('Les prix sont en hausse.', ['Ils augmentent', 'Ils baissent'], 0, 'Les prix sont en / {hausse}.', [
      'En hausse = en augmentation. H aspiré : pas de liaison.', 'En hausse = rising. H aspiré: no liaison.',
    ], ['Que font les prix ?', 'What are prices doing?']),
    fill('Je ne suis pas encore allé à Rome.', 'Je ne suis pas ___ allé à Rome.', 'encore', 'Je ne suis pas‿{encore} allé à Rome.', [
      'Pas‿encore : liaison facultative en [z].', 'Pas‿encore: optional [z] liaison.',
    ]),
    fill('Ils sont arrivés en avance.', 'Ils sont ___ en avance.', 'arrivés', 'Ils sont‿{arrivés} en avance.', [
      'Sont‿arrivés : liaison en [t] dans le discours soigné.', 'Sont‿arrivés: [t] liaison in careful speech.',
    ]),
    fill('Les haricots sont prêts.', 'Les ___ sont prêts.', 'haricots', 'Les / {haricots} sont prêts.', [
      'Haricot a un h aspiré : jamais de liaison.', 'Haricot has an h aspiré: never a liaison.',
    ]),
    situation(ACCUEIL, 'Qui est arrivé ce matin ?', ['Les habitants', 'Les auteurs invités', 'Les héros du festival'], 1, ACCUEIL_SHOW, [
      '« Les‿auteurs invités sont‿arrivés » : liaison en [z].', '« The guest authors have arrived »: [z] liaison.',
    ]),
    situation(ACCUEIL, 'Qu’ont-ils déjà visité ?', ['Les hauteurs de la ville', 'Les auteurs de la ville', 'Le port'], 0, ACCUEIL_SHOW, [
      '« Les / hauteurs » : sans liaison, le haut de la ville.', '« Les / hauteurs »: no liaison, the high part of town.',
    ]),
  ],
  takeaway: [
    'Le discours soigné multiplie les liaisons facultatives (pas‿encore, sont‿arrivés). Devant un h aspiré, jamais de liaison : les / héros, les / hauteurs, les / haricots.',
    'Careful speech adds optional liaisons (pas‿encore, sont‿arrivés). Before an h aspiré, never a liaison: les / héros, les / hauteurs, les / haricots.',
  ],
});
