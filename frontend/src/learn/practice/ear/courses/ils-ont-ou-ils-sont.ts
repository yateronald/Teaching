// A1 · The liaison in [z]: it tells avoir from être (ils‿ont / ils sont) and
// the plural from the singular (ils‿arrivent / il arrive).
import { ear, ex, fill, pick, situation } from '../authoring';

export default ear('ils-ont-ou-ils-sont', {
  rule: [
    ['La liaison : un petit son qui change le sens', 'The liaison: a small sound that changes the meaning'],
    [
      'En français, la consonne finale d’un mot est souvent muette : __les__ se dit [le]. Mais devant une voyelle, elle se prononce et se lie au mot suivant : __les‿amis__ se dit [lezami]. Le **s** devient un son **[z]**.\n\nCe petit [z] change le sens : __ils‿ont__ [ilzɔ̃] vient du verbe **avoir**, __ils sont__ [ilsɔ̃] du verbe **être**. Il montre aussi le pluriel : __il arrive__ et __ils‿arrivent__ ne se distinguent que par lui.',
      'In French, a word’s final consonant is often silent: __les__ is said [le]. But before a vowel it is pronounced and linked to the next word: __les‿amis__ is said [lezami]. The **s** becomes a **[z]** sound.\n\nThis little [z] changes the meaning: __ils‿ont__ [ilzɔ̃] comes from **avoir**, __ils sont__ [ilsɔ̃] from **être**. It also shows the plural: __il arrive__ and __ils‿arrivent__ differ only by it.',
    ],
  ],
  goal: ['Entendre la liaison en [z] et ce qu’elle change.', 'Hear the [z] liaison and what it changes.'],
  examples: [
    ex('Ils ont faim.', 'Ils{‿}ont faim.', ['Un [z] : c’est le verbe avoir.', 'A [z]: the verb avoir.']),
    ex('Ils sont là.', 'Ils {s}ont là.', ['Un [s] : c’est le verbe être.', 'An [s]: the verb être.']),
    ex('Les enfants arrivent.', 'Les{‿}enfants arrivent.', ['Le [z] de « les‿enfants » dit qu’ils sont plusieurs.', 'The [z] in « les‿enfants » tells you there are several.']),
  ],
  items: [
    pick('Vous avez l’heure ?', ['Vous avez l’heure ?', 'Vous savez l’heure ?'], 0, 'Vous{‿}avez l’heure ?', [
      'On entend [vuzave] : le [z] de la liaison, donc « vous avez ». « Vous savez » se dit avec un [s] : [vusave].',
      'You hear [vuzave]: the [z] of the liaison, so « vous avez ». « Vous savez » has an [s]: [vusave].',
    ]),
    pick('Nous savons tout.', ['Nous avons tout.', 'Nous savons tout.'], 1, 'Nous {s}avons tout.', [
      'Un [s] net, sans liaison : « nous savons ». Avec « nous avons », on entendrait [nuzavɔ̃].',
      'A clear [s] and no liaison: « nous savons ». With « nous avons » you would hear [nuzavɔ̃].',
    ]),
    pick('Ils s’aiment beaucoup.', ['Ils aiment beaucoup.', 'Ils s’aiment beaucoup.'], 1, 'Ils {s’}aiment beaucoup.', [
      'On entend [ilsɛm] avec un [s] : « ils s’aiment » (l’un l’autre). « Ils aiment » se dirait [ilzɛm].',
      'You hear [ilsɛm] with an [s]: « ils s’aiment » (each other). « Ils aiment » would be [ilzɛm].',
    ]),
    pick('C’est une amie.', ['C’est un ami.', 'C’est une amie.'], 1, 'C’est {une}‿amie.', [
      'On entend [yn] : « une amie », une femme. « Un ami » se dit [œ̃nami].',
      'You hear [yn]: « une amie », a woman. « Un ami » is said [œ̃nami].',
    ]),
    pick('Ils arrivent ce soir.', ['Il arrive ce soir.', 'Ils arrivent ce soir.'], 1, 'Ils{‿}arrivent ce soir.', [
      '« Arrive » et « arrivent » se prononcent pareil : seul le [z] de « ils‿arrivent » montre le pluriel.',
      '« Arrive » and « arrivent » sound the same: only the [z] in « ils‿arrivent » shows the plural.',
    ]),
    fill('Mes amis habitent à Lyon.', 'Mes ___ habitent à Lyon.', 'amis', 'Mes{‿}amis habitent à Lyon.', [
      'Le [z] appartient à « mes », pas au mot suivant : on n’entend pas « zamis », mais « mes‿amis ».',
      'The [z] belongs to « mes », not to the next word: it is not « zamis » but « mes‿amis ».',
    ]),
    fill('Nous allons au cinéma ce soir.', 'Nous ___ au cinéma ce soir.', 'allons', 'Nous{‿}allons au cinéma ce soir.', [
      '[nuzalɔ̃] : « nous » et « allons » reliés par un [z].',
      '[nuzalɔ̃]: « nous » and « allons » joined by a [z].',
    ]),
    fill('Elles ont un nouvel appartement.', 'Elles ___ un nouvel appartement.', 'ont', 'Elles{‿}ont un nouvel appartement.', [
      'Le [z] annonce le verbe avoir : « elles‿ont ». Avec être, on entendrait [ɛlsɔ̃] : « elles sont ».',
      'The [z] signals avoir: « elles‿ont ». With être you would hear [ɛlsɔ̃]: « elles sont ».',
    ]),
    situation(
      'Bonjour ! Mes enfants ont six ans et ils adorent les animaux. Vous avez des activités pour eux ?',
      'Combien d’enfants cette personne a-t-elle ?',
      ['Un seul enfant', 'Plusieurs enfants', 'On ne peut pas savoir'], 1,
      'Bonjour ! Mes{‿}enfants ont six{‿}ans et ils{‿}adorent les{‿}animaux. Vous{‿}avez des{‿}activités pour eux ?',
      [
        '« Mes‿enfants », « ils‿adorent » : les liaisons en [z] montrent qu’il y a plusieurs enfants, et « ont » est le pluriel de « a ».',
        '« Mes‿enfants », « ils‿adorent »: the [z] liaisons show there are several children, and « ont » is the plural of « a ».',
      ],
    ),
    situation(
      'Il entend le train, mais il ne le voit pas.',
      'De combien de personnes parle-t-on ?',
      ['D’une seule personne', 'De plusieurs personnes'], 0,
      'Il entend le train, mais il ne le voit pas.',
      [
        'Aucun [z] entre « il » et « entend » : c’est le singulier. Au pluriel, on entendrait « ils‿entendent » [ilzɑ̃tɑ̃d].',
        'No [z] between « il » and « entend »: it is singular. In the plural you would hear « ils‿entendent » [ilzɑ̃tɑ̃d].',
      ],
    ),
  ],
  takeaway: [
    'Écoutez le petit [z] entre deux mots : il distingue avoir et être (ils‿ont / ils sont) et le pluriel du singulier (ils‿arrivent / il arrive).',
    'Listen for the little [z] between two words: it tells avoir from être (ils‿ont / ils sont) and plural from singular (ils‿arrivent / il arrive).',
  ],
});
