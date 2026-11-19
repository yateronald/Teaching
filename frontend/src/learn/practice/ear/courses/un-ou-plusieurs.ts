// A2 · The silent plural: le / les, ce / ces, son / ses, and the verbs that change (finit / finissent).
import { ear, ex, fill, pick, situation } from '../authoring';

export default ear('un-ou-plusieurs', {
  rule: [
    ['Le pluriel s’entend surtout dans l’article', 'The plural is heard mostly in the article'],
    [
      'À l’écrit, le pluriel ajoute un **s** ; à l’oral, ce s est muet. __le chat__ et __les chats__ ne se distinguent que par l’article : [lə] ou [le]. Même chose pour __ce__ [sə] / __ces__ [se] et __sa__ / __ses__.\n\nLes verbes en -er ne changent pas : __il parle__ et __ils parlent__ se prononcent pareil. Mais certains verbes changent à l’oral : __il finit__ / __ils finissent__, __il prend__ / __ils prennent__, __il est__ / __ils sont__.',
      'In writing, the plural adds an **s**; in speech, that s is silent. __le chat__ and __les chats__ differ only by the article: [lə] or [le]. The same goes for __ce__ [sə] / __ces__ [se] and __sa__ / __ses__.\n\n-er verbs do not change: __il parle__ and __ils parlent__ sound the same. But some verbs do change in speech: __il finit__ / __ils finissent__, __il prend__ / __ils prennent__, __il est__ / __ils sont__.',
    ],
  ],
  goal: ['Entendre si l’on parle d’une chose ou de plusieurs.', 'Hear whether one thing or several are meant.'],
  examples: [
    ex('Le livre.', '{le} livre [lə]', ['Une seule chose.', 'One thing.']),
    ex('Les livres.', '{les} livre~s~ [le]', ['Plusieurs : seul l’article change à l’oral.', 'Several: only the article changes in speech.']),
    ex('Ils finissent tard.', 'Ils {finissent} tard.', ['Avec finir, le pluriel s’entend aussi dans le verbe : [finis].', 'With finir, the plural is heard in the verb too: [finis].']),
  ],
  items: [
    pick('Je prends le livre.', ['Je prends le livre.', 'Je prends les livres.'], 0, 'Je prends {le} livre.', [
      '[lə] : un seul livre. Pour plusieurs, on entendrait [le].',
      '[lə]: one book. For several, you would hear [le].',
    ]),
    pick('Elle range les dossiers.', ['Elle range le dossier.', 'Elle range les dossiers.'], 1, 'Elle range {les} dossier~s~.', [
      '[le] : plusieurs dossiers. Le s final de « dossiers » ne s’entend pas.',
      '[le]: several files. The final s of « dossiers » is silent.',
    ]),
    pick('Ils finissent à cinq heures.', ['Il finit à cinq heures.', 'Ils finissent à cinq heures.'], 1, 'Ils {finissent} à cinq heures.', [
      'On entend [finis] : c’est le pluriel. Au singulier, « il finit » se dit [fini].',
      'You hear [finis]: plural. In the singular, « il finit » is [fini].',
    ]),
    pick('Il prend le métro.', ['Il prend le métro.', 'Ils prennent le métro.'], 0, 'Il {prend} le métro.', [
      '[pʁɑ̃] : singulier. Au pluriel, « ils prennent » se dit [pʁɛn].',
      '[pʁɑ̃]: singular. In the plural, « ils prennent » is [pʁɛn].',
    ]),
    pick('Tu as vu ce film ?', ['Tu as vu ce film ?', 'Tu as vu ces films ?'], 0, 'Tu as vu {ce} film ?', [
      '[sə] : un seul film. « Ces films » se dirait [se].',
      '[sə]: one film. « Ces films » would be [se].',
    ]),
    fill('Les voisins sont très gentils.', '___ voisins sont très gentils.', 'les', '{Les} voisin~s~ {sont} très gentil~s~.', [
      '[le] et « sont » : deux indices du pluriel. Les s de « voisins » et « gentils » sont muets.',
      '[le] and « sont »: two clues of the plural. The s of « voisins » and « gentils » is silent.',
    ]),
    fill('Elles viennent demain.', 'Elles ___ demain.', 'viennent', 'Elles {viennent} demain.', [
      '« Viennent » [vjɛn] : le pluriel s’entend. Au singulier, « vient » se dit [vjɛ̃].',
      '« Viennent » [vjɛn]: the plural can be heard. In the singular, « vient » is [vjɛ̃].',
    ]),
    fill('Il a perdu ses clés.', 'Il a perdu ___ clés.', 'ses', 'Il a perdu {ses} clé~s~.', [
      '[se] : « ses », donc plusieurs clés. « Sa clé » se dirait [sa].',
      '[se]: « ses », so several keys. « Sa clé » would be [sa].',
    ]),
    situation('Bonjour, je cherche le sac que j’ai vu en vitrine. Il est en solde ?', 'Que cherche la cliente ?', ['Un sac', 'Plusieurs sacs'], 0,
      'Bonjour, je cherche {le} sac que j’ai vu en vitrine. {Il est} en solde ?', [
        '« Le sac » [lə] et « il est » : un seul sac. Au pluriel, on entendrait « les sacs… ils sont ».',
        '« Le sac » [lə] and « il est »: one bag. In the plural you would hear « les sacs… ils sont ».',
      ]),
    situation('Mes collègues partent tôt le vendredi, mais mon chef reste jusqu’à vingt heures.', 'Qui reste tard ?', ['Le chef', 'Les collègues', 'Tout le monde'], 0,
      '{Mes} collègue~s~ partent tôt le vendredi, mais {mon} chef reste jusqu’à vingt heures.', [
        '« Mes collègues » (plusieurs) partent ; « mon chef » (un seul) reste : c’est le chef.',
        '« Mes collègues » (several) leave; « mon chef » (one) stays: it is the boss.',
      ]),
  ],
  takeaway: [
    'Le s du pluriel est muet : écoutez l’article (le / les, ce / ces, sa / ses) et les verbes qui changent (finit / finissent, est / sont).',
    'The plural s is silent: listen to the article (le / les, ce / ces, sa / ses) and to the verbs that change (finit / finissent, est / sont).',
  ],
});
