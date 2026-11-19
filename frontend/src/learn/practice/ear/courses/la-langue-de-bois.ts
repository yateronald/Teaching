// C1 · Official euphemisms: ajustement tarifaire, réduction des effectifs, mouvement social.
import { ear, ex, fill, pick, situation } from '../authoring';

const ANNONCE = 'Dans un contexte économique exigeant, l’entreprise engage une transformation de son organisation, qui passera par une optimisation de ses effectifs et un ajustement de ses tarifs.';
const ANNONCE_SHOW = 'Dans un contexte économique exigeant, l’entreprise engage une transformation de son organisation, qui passera par une {optimisation de ses effectifs} et un {ajustement de ses tarifs}.';

export default ear('la-langue-de-bois', {
  rule: [
    ['Décoder la langue de bois', 'Decoding doublespeak'],
    [
      'La « langue de bois » emploie des mots neutres ou techniques pour adoucir une mauvaise nouvelle. Quelques équivalences utiles :\n\n__un ajustement tarifaire__ = une hausse des prix ; __une réduction__ ou __une optimisation des effectifs__ = des suppressions de postes ; __un plan de sauvegarde de l’emploi__ = un plan de licenciements ; __une croissance négative__ = une récession ; __un mouvement social__ = une grève ; __une phase de consolidation__ = des difficultés, des économies.\n\nComprendre ces formules, c’est savoir ce qui va réellement se passer.',
      '« Langue de bois » uses neutral or technical words to soften bad news. Some useful equivalents:\n\n__un ajustement tarifaire__ = a price rise; __une réduction__ or __une optimisation des effectifs__ = job cuts; __un plan de sauvegarde de l’emploi__ = a redundancy plan; __une croissance négative__ = a recession; __un mouvement social__ = a strike; __une phase de consolidation__ = difficulties, cost-cutting.\n\nUnderstanding these phrases means knowing what is really going to happen.',
    ],
  ],
  goal: ['Comprendre ce que cache une formule officielle.', 'Understand what an official phrase hides.'],
  examples: [
    ex('Un ajustement tarifaire est prévu.', 'Un {ajustement tarifaire} est prévu.', ['= Les prix vont augmenter.', '= Prices will go up.']),
    ex('Un plan de sauvegarde de l’emploi.', 'Un {plan de sauvegarde de l’emploi}.', ['= Un plan de licenciements.', '= A redundancy plan.']),
    ex('En raison d’un mouvement social.', 'En raison d’un {mouvement social}.', ['= À cause d’une grève.', '= Because of a strike.']),
  ],
  items: [
    pick('La direction annonce une réduction des effectifs.', ['Des embauches', 'Des suppressions de postes'], 1, 'La direction annonce une {réduction des effectifs}.', [
      'Réduire les effectifs = supprimer des emplois.', 'To cut staff numbers.',
    ], ['Qu’annonce la direction ?', 'What is management announcing?']),
    pick('Un ajustement tarifaire aura lieu en janvier.', ['Les prix vont augmenter', 'Les prix vont baisser'], 0, 'Un {ajustement tarifaire} aura lieu en janvier.', [
      '« Ajustement » cache presque toujours une hausse.', '« Adjustment » almost always hides a rise.',
    ], ['Que va-t-il se passer ?', 'What will happen?']),
    pick('L’économie a connu une croissance négative.', ['Elle a progressé lentement', 'Elle a reculé'], 1, 'L’économie a connu une {croissance négative}.', [
      'Une croissance négative = une baisse de l’activité.', 'Negative growth = a contraction.',
    ], ['Qu’est-il arrivé à l’économie ?', 'What happened to the economy?']),
    pick('En raison d’un mouvement social, le trafic est perturbé.', ['Une fête', 'Une grève', 'Un accident'], 1, 'En raison d’un {mouvement social}, le trafic est perturbé.', [
      'Mouvement social = grève.', 'Mouvement social = strike.',
    ], ['Quelle est la cause ?', 'What is the cause?']),
    pick('Nous traversons une phase de consolidation.', ['Des difficultés, des économies à faire', 'Une forte croissance'], 0, 'Nous traversons une {phase de consolidation}.', [
      'La formule rassure, mais annonce souvent des restrictions.', 'The phrase reassures, but often announces cuts.',
    ], ['Que cache souvent cette formule ?', 'What does this phrase often hide?']),
    fill('Un plan de sauvegarde de l’emploi a été présenté.', 'Un plan de ___ de l’emploi a été présenté.', 'sauvegarde', 'Un plan de {sauvegarde} de l’emploi a été présenté.', [
      'Malgré son nom, il organise des licenciements.', 'Despite its name, it organises redundancies.',
    ]),
    fill('Le nombre de demandeurs d’emploi augmente.', 'Le nombre de ___ d’emploi augmente.', 'demandeurs', 'Le nombre de {demandeurs} d’emploi augmente.', [
      'Demandeur d’emploi = chômeur, terme administratif.', 'Job seeker: the official word for unemployed.',
    ]),
    fill('On déplore des dommages collatéraux.', 'On déplore des dommages ___.', 'collatéraux', 'On déplore des dommages {collatéraux}.', [
      'Dommages collatéraux = victimes ou dégâts non visés.', 'Collateral damage.',
    ]),
    situation(ANNONCE, 'Que va-t-il arriver aux salariés ?', ['Ils vont être augmentés', 'Des postes vont être supprimés', 'Rien ne va changer'], 1, ANNONCE_SHOW, [
      '« Optimisation de ses effectifs » = suppressions de postes.', '« Optimising its workforce » = job cuts.',
    ]),
    situation(ANNONCE, 'Et pour les clients ?', ['Les prix vont baisser', 'De nouveaux services gratuits', 'Les prix vont augmenter'], 2, ANNONCE_SHOW, [
      '« Ajustement de ses tarifs » = hausse des prix.', '« Adjusting its prices » = price rises.',
    ]),
  ],
  takeaway: [
    'Ajustement tarifaire = hausse ; réduction ou optimisation des effectifs = suppressions de postes ; mouvement social = grève ; croissance négative = récession. Traduisez toujours en clair.',
    'Ajustement tarifaire = rise; reduction or optimisation of staff = job cuts; mouvement social = strike; croissance négative = recession. Always translate into plain words.',
  ],
});
