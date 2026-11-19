// C1 · Nouns whose gender changes the meaning: le tour / la tour, le poste / la poste.
import { ear, ex, fill, pick, situation } from '../authoring';

const VOILE = 'Pour nos vacances, on a fait le tour de la Bretagne en voilier. La voile, c’était génial, mais dès le premier jour, j’ai déchiré la manche de mon pull.';
const VOILE_SHOW = 'Pour nos vacances, on a fait {le tour} de la Bretagne en voilier. {La voile}, c’était génial, mais dès le premier jour, j’ai déchiré {la manche} de mon pull.';

export default ear('le-tour-ou-la-tour', {
  rule: [
    ['Le genre qui change le sens', 'When gender changes the meaning'],
    [
      'Certains noms ont deux sens selon leur genre. Seul l’article, que l’on entend, permet de trancher :\n\n__le tour__ (un voyage, un tour de piste) / __la tour__ (un bâtiment haut) ; __le poste__ (un emploi, un appareil) / __la poste__ ; __le livre__ / __la livre__ (une monnaie, un demi-kilo) ; __le mode__ (une manière) / __la mode__ ; __le manche__ (d’un outil) / __la manche__ (d’un vêtement) ; __le mémoire__ (un travail universitaire) / __la mémoire__ ; __le critique__ (une personne) / __la critique__ ; __le voile__ (un tissu) / __la voile__ (d’un bateau).',
      'Some nouns have two meanings depending on gender. Only the article, which you can hear, settles it:\n\n__le tour__ (a trip, a lap) / __la tour__ (a tall building); __le poste__ (a job, a set) / __la poste__ (post office); __le livre__ (book) / __la livre__ (pound); __le mode__ (a way) / __la mode__ (fashion); __le manche__ (a handle) / __la manche__ (a sleeve); __le mémoire__ (a dissertation) / __la mémoire__ (memory); __le critique__ (a critic) / __la critique__ (criticism); __le voile__ (a veil) / __la voile__ (a sail).',
    ],
  ],
  goal: ['Entendre l’article et choisir le bon sens du nom.', 'Hear the article and pick the right meaning of the noun.'],
  examples: [
    ex('On a fait le tour du lac.', 'On a fait {le tour} du lac.', ['Le tour : une promenade autour.', 'Le tour: a walk around.']),
    ex('La tour Eiffel est éclairée.', '{La tour} Eiffel est éclairée.', ['La tour : un bâtiment.', 'La tour: a building.']),
    ex('Il cherche un poste à Lyon.', 'Il cherche {un poste} à Lyon.', ['Un poste : un emploi.', 'Un poste: a job.']),
  ],
  items: [
    pick('Je vais à la poste.', ['À son emploi', 'Au bureau de poste'], 1, 'Je vais à {la poste}.', [
      'La poste : le bureau où l’on envoie des lettres.', 'La poste: the post office.',
    ], ['Où va-t-il ?', 'Where is he going?']),
    pick('Elle a obtenu le poste.', ['Un emploi', 'Le bureau de poste'], 0, 'Elle a obtenu {le poste}.', [
      'Le poste : un emploi.', 'Le poste: a job.',
    ], ['Qu’a-t-elle obtenu ?', 'What did she get?']),
    pick('Il a soutenu son mémoire en juin.', ['Sa capacité à se souvenir', 'Un travail universitaire écrit'], 1, 'Il a soutenu {son mémoire} en juin.', [
      'Le mémoire (masculin) : un travail de recherche. « Son » cache le genre, mais « soutenir un mémoire » ne laisse pas de doute.', 'Le mémoire: a dissertation. « Soutenir un mémoire » = to defend a dissertation.',
    ], ['Qu’a-t-il soutenu ?', 'What did he defend?']),
    pick('J’ai acheté un moule à tarte.', ['Un ustensile de cuisine', 'Un coquillage'], 0, 'J’ai acheté {un moule} à tarte.', [
      'Un moule : un ustensile. Une moule : un coquillage.', 'Un moule: a baking tin. Une moule: a mussel.',
    ], ['Qu’a-t-il acheté ?', 'What did he buy?']),
    pick('Ils ont fait le tour du monde.', ['Une très haute tour', 'Un voyage autour du monde'], 1, 'Ils ont fait {le tour} du monde.', [
      'Le tour du monde : le voyage.', 'Le tour du monde: the round-the-world trip.',
    ], ['Qu’ont-ils fait ?', 'What did they do?']),
    fill('La mode change chaque saison.', '___ mode change chaque saison.', ['La', 'la'], '{La mode} change chaque saison.', [
      'La mode : les vêtements, les tendances.', 'La mode: fashion.',
    ]),
    fill('Il a perdu la mémoire après l’accident.', 'Il a perdu ___ mémoire après l’accident.', 'la', 'Il a perdu {la mémoire} après l’accident.', [
      'La mémoire : la faculté de se souvenir.', 'La mémoire: memory.',
    ]),
    fill('Le critique a adoré le film.', '___ critique a adoré le film.', ['Le', 'le'], '{Le critique} a adoré le film.', [
      'Le critique : la personne qui écrit la critique.', 'Le critique: the person, the critic.',
    ]),
    situation(VOILE, 'Comment ont-ils voyagé ?', ['En voiture', 'En bateau à voile', 'À pied'], 1, VOILE_SHOW, [
      'Un voilier, la voile : le bateau et sa voile.', 'A sailing boat: la voile = the sail, sailing.',
    ]),
    situation(VOILE, 'Qu’est-ce qui a été déchiré ?', ['La voile du bateau', 'Le manche d’un outil', 'La manche de son pull'], 2, VOILE_SHOW, [
      '« La manche de mon pull » : féminin, la partie du vêtement.', '« La manche »: feminine, the sleeve.',
    ]),
  ],
  takeaway: [
    'Le tour / la tour, le poste / la poste, le mémoire / la mémoire, le manche / la manche : l’article est le seul indice à l’oral. Écoutez-le toujours.',
    'Le tour / la tour, le poste / la poste, le mémoire / la mémoire, le manche / la manche: the article is the only clue in speech. Always listen for it.',
  ],
});
