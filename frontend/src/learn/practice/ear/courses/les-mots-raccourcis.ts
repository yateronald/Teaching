// B2 · Clipped words of everyday speech: le resto, la fac, l’appart, l’ordi.
import { ear, ex, fill, pick, situation } from '../authoring';

const SOIR = 'Bon, après la fac, je repasse à l’appart, je me change, et on se retrouve au resto vers huit heures. Par contre, réserve, le vendredi c’est toujours plein.';
const SOIR_SHOW = 'Bon, après la {fac}, je repasse à l’{appart}, je me change, et on se retrouve au {resto} vers huit heures. Par contre, réserve, le vendredi c’est toujours plein.';

export default ear('les-mots-raccourcis', {
  rule: [
    ['Les mots raccourcis', 'Clipped words'],
    [
      'À l’oral, beaucoup de mots perdent leur fin : __le restaurant__ devient __le resto__, __l’université__ (la faculté) devient __la fac__, __l’appartement__ devient __l’appart__, __l’ordinateur__ devient __l’ordi__. Certains prennent un **-o** : le resto, l’apéro, le frigo, le dico.\n\nLe genre ne change pas : __la fac__ parce que __la faculté__. Ces mots ne sont pas fautifs : ils sont simplement familiers, et on les entend partout.',
      'In speech, many words lose their ending: __le restaurant__ becomes __le resto__, __l’université__ (la faculté) becomes __la fac__, __l’appartement__ becomes __l’appart__, __l’ordinateur__ becomes __l’ordi__. Some take an **-o**: le resto, l’apéro, le frigo, le dico.\n\nThe gender stays the same: __la fac__ because __la faculté__. These words are not mistakes: they are just informal, and you hear them everywhere.',
    ],
  ],
  goal: ['Reconnaître les mots raccourcis et retrouver le mot complet.', 'Recognise clipped words and find the full word.'],
  examples: [
    ex('On se retrouve au resto ce soir ?', 'On se retrouve au {resto} ce soir ?', ['Le resto = le restaurant.', 'Le resto = the restaurant.']),
    ex('Elle est encore à la fac.', 'Elle est encore à la {fac}.', ['La fac = l’université.', 'La fac = university.']),
    ex('Mets la clim, il fait trop chaud.', 'Mets la {clim}, il fait trop chaud.', ['La clim = la climatisation.', 'La clim = air conditioning.']),
  ],
  items: [
    pick('Mon ordi est encore en panne.', ['Son ordonnance', 'Son ordinateur', 'Son ordre du jour'], 1, 'Mon {ordi} est encore en panne.', [
      'L’ordi = l’ordinateur.', 'L’ordi = the computer.',
    ], ['Qu’est-ce qui est en panne ?', 'What has broken down?']),
    pick('On va à l’apéro chez Marc ce soir.', ['À l’apéritif', 'Au restaurant', 'À l’appartement'], 0, 'On va à l’{apéro} chez Marc ce soir.', [
      'L’apéro = l’apéritif : un verre, souvent avant le repas.', 'L’apéro = pre-dinner drinks.',
    ], ['Où vont-ils chez Marc ?', 'Where are they going at Marc’s?']),
    pick('Mon petit frère est un ado pénible en ce moment.', ['Un adulte', 'Un bébé', 'Un adolescent'], 2, 'Mon petit frère est un {ado} pénible en ce moment.', [
      'Un ado = un adolescent.', 'Un ado = a teenager.',
    ], ['Qui est son petit frère ?', 'Who is his little brother?']),
    pick('Tu peux regarder dans le dico ?', ['Le dictionnaire', 'Le document', 'Le dossier'], 0, 'Tu peux regarder dans le {dico} ?', [
      'Le dico = le dictionnaire.', 'Le dico = the dictionary.',
    ], ['Où faut-il regarder ?', 'Where should they look?']),
    pick('Ils ont trouvé un appart pas loin de la fac.', ['Un appareil près de la façade', 'Un appartement près de l’université', 'Un apéritif près du café'], 1, 'Ils ont trouvé un {appart} pas loin de la {fac}.', [
      'Deux mots raccourcis : l’appart = l’appartement, la fac = l’université.', 'Two clipped words: l’appart = the flat, la fac = university.',
    ], ['Qu’ont-ils trouvé ?', 'What did they find?']),
    fill('On se fait un ciné ce soir ?', 'On se fait un ___ ce soir ?', 'ciné', 'On se fait un {ciné} ce soir ?', [
      'Un ciné = une séance de cinéma.', 'Un ciné = a film at the cinema.',
    ]),
    fill('Il reste du lait dans le frigo ?', 'Il reste du lait dans le ___ ?', 'frigo', 'Il reste du lait dans le {frigo} ?', [
      'Le frigo = le réfrigérateur.', 'Le frigo = the fridge.',
    ]),
    fill('Je prends juste un petit-déj rapide.', 'Je prends juste un ___ rapide.', ['petit-déj', 'petit déj'], 'Je prends juste un {petit-déj} rapide.', [
      'Le petit-déj = le petit-déjeuner.', 'Le petit-déj = breakfast.',
    ]),
    situation(SOIR, 'Où la personne va-t-elle juste après l’université ?', ['Au restaurant', 'Chez elle, à son appartement', 'Au cinéma'], 1, SOIR_SHOW, [
      '« Après la fac, je repasse à l’appart » : chez elle.', '« After uni, I’ll go back to the flat »: home.',
    ]),
    situation(SOIR, 'Que doit faire l’autre personne ?', ['Réserver une table au restaurant', 'Aller la chercher à la fac', 'Préparer le dîner'], 0, SOIR_SHOW, [
      '« Réserve, le vendredi c’est toujours plein. »', '« Book, it is always full on Fridays. »',
    ]),
  ],
  takeaway: [
    'Un mot raccourci garde son genre et son sens : la fac, l’appart, le resto, l’ordi, le frigo. Écoutez le début du mot, c’est lui qui le fait reconnaître.',
    'A clipped word keeps its gender and meaning: la fac, l’appart, le resto, l’ordi, le frigo. Listen to the start of the word: that is how you recognise it.',
  ],
});
