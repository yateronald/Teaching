// B2 · Adjectives with a linking form: vieil, bel, nouvel, cet.
import { ear, ex, fill, pick, situation } from '../authoring';

const NOUVELLE = 'Tu te souviens de Paul ? C’est un vieil ami de mon père. Il vient d’acheter un bel appartement dans le nouvel immeuble, en face du parc.';
const NOUVELLE_SHOW = 'Tu te souviens de Paul ? C’est un {vieil}‿ami de mon père. Il vient d’acheter un {bel}‿appartement dans le {nouvel}‿immeuble, en face du parc.';

export default ear('un-vieil-ami', {
  rule: [
    ['Vieil, bel, nouvel, cet', 'Vieil, bel, nouvel, cet'],
    [
      'Devant un nom masculin qui commence par une voyelle, cinq mots changent de forme pour se lier : __vieux → vieil__, __beau → bel__, __nouveau → nouvel__, __fou → fol__ (rare), __ce → cet__. On entend alors [vjɛj], [bɛl], [nuvɛl], [sɛt] : __un vieil‿ami__, __un bel‿été__, __cet‿hôtel__.\n\nÀ l’oral, __cet ami__ et __cette amie__ se prononcent pareil [sɛtami] : seul le contexte dit si c’est un homme ou une femme.',
      'Before a masculine noun starting with a vowel, five words change form to link: __vieux → vieil__, __beau → bel__, __nouveau → nouvel__, __fou → fol__ (rare), __ce → cet__. You then hear [vjɛj], [bɛl], [nuvɛl], [sɛt]: __un vieil‿ami__, __un bel‿été__, __cet‿hôtel__.\n\nIn speech, __cet ami__ and __cette amie__ sound the same [sɛtami]: only the context tells whether it is a man or a woman.',
    ],
  ],
  goal: ['Reconnaître vieil, bel, nouvel et cet, et le nom qu’ils accompagnent.', 'Recognise vieil, bel, nouvel and cet, and the noun they go with.'],
  examples: [
    ex('C’est un vieil ami.', 'C’est un {vieil}‿ami.', ['Vieil [vjɛj] devant une voyelle.', 'Vieil [vjɛj] before a vowel.']),
    ex('On a eu un bel été.', 'On a eu un {bel}‿été.', ['Bel [bɛl], comme « belle ».', 'Bel [bɛl], like « belle ».']),
    ex('Cet hôtel est complet.', '{Cet}‿hôtel est complet.', ['Cet [sɛt] : le h ne se prononce pas.', 'Cet [sɛt]: the h is silent.']),
  ],
  items: [
    pick('Il habite dans un nouvel immeuble.', ['Il habite dans un nouvel immeuble.', 'Il habite dans un nouveau quartier.'], 0, 'Il habite dans un {nouvel}‿immeuble.', [
      'On entend [nuvɛlimœbl] : nouvel se lie à immeuble.', 'You hear [nuvɛlimœbl]: nouvel links to immeuble.',
    ]),
    pick('C’est un bel homme.', ['C’est un bel homme.', 'C’est un beau garçon.'], 0, 'C’est un {bel}‿homme.', [
      'Bel [bɛl] devant homme : le h est muet.', 'Bel [bɛl] before homme: the h is silent.',
    ]),
    pick('Cet ami, je le connais depuis l’école.', ['Un homme', 'Une femme'], 0, '{Cet}‿ami, je {le} connais depuis l’école.', [
      'Cet ami et cette amie sonnent pareil : c’est le pronom « le » qui montre qu’il s’agit d’un homme.', 'Cet ami and cette amie sound alike: the pronoun « le » shows it is a man.',
    ], ['Parle-t-on d’un homme ou d’une femme ?', 'Is it a man or a woman?']),
    pick('Mon vieil oncle vit à la campagne.', ['Mon vieil oncle vit à la campagne.', 'Mon vieux voisin vit à la campagne.'], 0, 'Mon {vieil}‿oncle vit à la campagne.', [
      '[vjɛjɔ̃kl] : vieil devant oncle.', '[vjɛjɔ̃kl]: vieil before oncle.',
    ]),
    pick('Quel bel endroit !', ['Quel bel endroit !', 'Quelle belle entrée !'], 0, 'Quel {bel}‿endroit !', [
      'Bel endroit [bɛlɑ̃dʁwa] : endroit est masculin.', 'Bel endroit [bɛlɑ̃dʁwa]: endroit is masculine.',
    ]),
    fill('Cet été, on part en Grèce.', '___ été, on part en Grèce.', ['Cet', 'cet'], '{Cet}‿été, on part en Grèce.', [
      'Été est masculin et commence par une voyelle : cet.', 'Été is masculine and starts with a vowel: cet.',
    ]),
    fill('C’est un nouvel outil très pratique.', 'C’est un ___ outil très pratique.', 'nouvel', 'C’est un {nouvel}‿outil très pratique.', [
      'Nouvel devant une voyelle : nouvel outil.', 'Nouvel before a vowel: nouvel outil.',
    ]),
    fill('Il a un vieil appareil photo.', 'Il a un ___ appareil photo.', 'vieil', 'Il a un {vieil}‿appareil photo.', [
      'Vieil [vjɛj] devant appareil.', 'Vieil [vjɛj] before appareil.',
    ]),
    situation(NOUVELLE, 'Qui est Paul ?', ['Un ami de longue date de son père', 'Un nouveau voisin', 'Un ami très âgé de la personne'], 0, NOUVELLE_SHOW, [
      'Un vieil ami = un ami depuis longtemps (pas forcément âgé).', 'Un vieil ami = a long-standing friend (not necessarily old).',
    ]),
    situation(NOUVELLE, 'Qu’a-t-il acheté ?', ['Un bel appartement dans un immeuble récent', 'Une vieille maison', 'Un appartement dans un vieil immeuble'], 0, NOUVELLE_SHOW, [
      '« Un bel appartement dans le nouvel immeuble ».', '« A fine flat in the new building ».',
    ]),
  ],
  takeaway: [
    'Devant une voyelle (ou un h muet) : vieil, bel, nouvel, cet, qui se lient au nom. Un vieil ami est un ami de longue date. Cet ami et cette amie se prononcent pareil.',
    'Before a vowel (or silent h): vieil, bel, nouvel, cet, which link to the noun. Un vieil ami is a long-standing friend. Cet ami and cette amie sound the same.',
  ],
});
