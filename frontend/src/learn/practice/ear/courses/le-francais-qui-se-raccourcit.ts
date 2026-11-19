// B1 · Shortened everyday speech: the dropped ne, the falling e (j'sais pas), t'es, t'as, y a.
import { ear, ex, fill, pick, situation } from '../authoring';

const MEAN: [string, string] = ['Que veut dire la phrase ?', 'What does the sentence mean?'];
const BUS = 'Allô ? Ouais, j’suis dans le bus, là. Y a des bouchons, j’vais être en retard. T’inquiète pas, j’arrive !';
const BUS_SHOW = 'Allô ? Ouais, j~e~ suis dans le bus, là. ~Il~ y a des bouchons, j~e~ vais être en retard. ~Ne~ t’inquiète pas, j’arrive !';

export default ear('le-francais-qui-se-raccourcit', {
  rule: [
    ['À l’oral, les mots raccourcissent', 'In speech, words get shorter'],
    [
      'Dans la conversation de tous les jours, le français se raccourcit : le **ne** de la négation disparaît (__je sais pas__), le **e** tombe (__j’sais pas__, __p’tit__), __tu es__ devient __t’es__, __tu as__ devient __t’as__, __il y a__ devient __y a__.\n\nLa négation reste, portée par **pas**, **plus**, **jamais** ou **personne** : ce sont eux qu’il faut entendre.',
      'In everyday conversation, French gets shorter: the **ne** of the negation disappears (__je sais pas__), the **e** drops (__j’sais pas__, __p’tit__), __tu es__ becomes __t’es__, __tu as__ becomes __t’as__, __il y a__ becomes __y a__.\n\nThe negation stays, carried by **pas**, **plus**, **jamais** or **personne**: those are the words to listen for.',
    ],
  ],
  goal: ['Comprendre les formes courtes du français parlé.', 'Understand the short forms of spoken French.'],
  examples: [
    ex('Je ne sais pas.', 'J~e~ ~ne~ sais pas', ['Le e et le ne tombent : on entend presque [ʃɛpa].', 'The e and the ne drop: it sounds almost like [ʃɛpa].'], 'J’sais pas.'),
    ex('Tu es où ?', 'T~u~ es où ?', ['« Tu es » devient « t’es » [tɛ].', '« Tu es » becomes « t’es » [tɛ].'], 'T’es où ?'),
    ex('Il y a un problème.', '~Il~ y a un problème.', ['« Il y a » devient « y a » [ja].', '« Il y a » becomes « y a » [ja].'], 'Y a un problème.'),
  ],
  items: [
    pick('J’aime pas trop ça.', ['J’aime bien ça.', 'Je n’aime pas trop ça.'], 1, 'J~e n’~aime pas trop ça.', [
      'Pas de « ne », mais « pas » est là : c’est une négation. La personne n’aime pas trop ça.',
      'No « ne », but « pas » is there: it is a negation. The person does not really like it.',
    ], MEAN),
    pick('T’es sûr ?', ['Tu es sûr ?', 'Tu étais sûr ?'], 0, 'T~u~ es sûr ?', [
      '[tɛ] : « t’es », la forme courte de « tu es », au présent.',
      '[tɛ]: « t’es », the short form of « tu es », in the present.',
    ], MEAN),
    pick('Y a personne ici.', ['Il n’y a personne ici.', 'Il y a quelqu’un ici.'], 0, '~Il n’~ y a personne ici.', [
      '« Personne » porte la négation, même sans « ne » : il n’y a personne.',
      '« Personne » carries the negation, even without « ne »: there is nobody.',
    ], MEAN),
    pick('J’suis fatigué.', ['Je suis fatigué.', 'J’étais fatigué.'], 0, 'J~e~ suis fatigué.', [
      '« J’suis » se dit presque [ʃɥi] : c’est « je suis », au présent.',
      '« J’suis » sounds almost like [ʃɥi]: it is « je suis », in the present.',
    ], MEAN),
    pick('J’te rappelle demain.', ['Je te rappelle demain.', 'Je le rappelle demain.'], 0, 'J~e~ t~e~ rappelle demain.', [
      'On entend [ʃtə] : « je te ». Avec « le », on entendrait un [l].',
      'You hear [ʃtə]: « je te ». With « le », you would hear an [l].',
    ], MEAN),
    fill('J’sais pas où il est.', 'Je ne ___ pas où il est.', 'sais', 'J~e~ ~ne~ {sais} pas où il est.', [
      'Forme complète : « je ne sais pas ». À l’oral, il ne reste que « j’sais pas ».',
      'Full form: « je ne sais pas ». In speech, only « j’sais pas » remains.',
    ]),
    fill('T’as vu l’heure ?', '___ as vu l’heure ?', 'tu', 'T~u~ as vu l’heure ?', [
      '[ta] : « t’as » = « tu as ».',
      '[ta]: « t’as » = « tu as ».',
    ]),
    fill('Y a plus de pain.', 'Il n’y a ___ de pain.', 'plus', '~Il n’~ y a {plus} de pain.', [
      '« Plus » [ply] : il n’y en a plus. Sans le « ne », c’est lui qui porte la négation.',
      '« Plus » [ply]: there is none left. Without « ne », it carries the negation.',
    ]),
    situation(BUS, 'Pourquoi la personne sera-t-elle en retard ?', ['Il y a des embouteillages.', 'Elle a raté le bus.', 'Elle est fatiguée.'], 0, BUS_SHOW, [
      '« Y a des bouchons » = il y a des embouteillages, les voitures et le bus avancent lentement.',
      '« Y a des bouchons » = there are traffic jams; the traffic is moving slowly.',
    ]),
    situation(BUS, '« T’inquiète pas » veut dire :', ['Ne t’inquiète pas.', 'Tu t’inquiètes.', 'Je m’inquiète.'], 0, BUS_SHOW, [
      'Le « ne » est tombé, mais « pas » reste : c’est l’impératif négatif, « ne t’inquiète pas ».',
      'The « ne » dropped, but « pas » remains: it is the negative imperative, « ne t’inquiète pas ».',
    ]),
  ],
  takeaway: [
    'À l’oral, ne, e et il disparaissent souvent : j’sais pas, t’es, y a. Gardez l’oreille sur pas, plus, jamais, personne : ils portent la négation.',
    'In speech, ne, e and il often disappear: j’sais pas, t’es, y a. Keep your ear on pas, plus, jamais, personne: they carry the negation.',
  ],
});
