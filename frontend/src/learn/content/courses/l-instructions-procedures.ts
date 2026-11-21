import type { CourseAbout } from '../../types';
import { b, card, dict, hear, lesson, P, pairs, sort, tip } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'A safety briefing on the first day of work, a nurse explaining a treatment, a technician guiding you on the phone, a teacher giving exam rules: spoken instructions must be understood and followed in the right order, often only once. This course trains you to catch the steps, the conditions (si…, sauf si…), the warnings and the deadlines in original spoken procedures.',
    'Une séance de sécurité le premier jour de travail, une infirmière qui explique un traitement, un technicien qui vous guide au téléphone, un enseignant qui donne les règles d’un examen : les consignes orales doivent être comprises et suivies dans le bon ordre, souvent en une seule écoute. Ce cours vous entraîne à saisir les étapes, les conditions (si…, sauf si…), les avertissements et les échéances dans des procédures orales originales.',
  ),
  outcomes: [
    b('Follow spoken steps in order', 'Suivre des étapes orales dans l’ordre'),
    b('Catch conditions and exceptions', 'Saisir les conditions et les exceptions'),
    b('Catch warnings', 'Saisir les avertissements'),
    b('Follow technical help on the phone', 'Suivre une assistance technique au téléphone'),
  ],
};

const C = 'l-instructions-procedures';
export default [
  lesson(C, 1, ['safety-briefings', 'consignes-de-securite'],
    b('Safety briefings', 'Les consignes de sécurité'),
    b('Understand a safety briefing at work and its obligations.', 'Comprendre une séance de sécurité au travail et ses obligations.'),
    [b('Catch obligations (il faut, vous devez)', 'Saisir les obligations (il faut, vous devez)'), b('Catch prohibitions', 'Saisir les interdictions'), b('Catch what to do in an emergency', 'Saisir quoi faire en cas d’urgence')],
    13,
    [
      card(b('Spoken obligations', 'Les obligations à l’oral'), b('**Il faut / vous devez / il est obligatoire de** + infinitive. Prohibitions: **il est interdit de**, **ne… jamais**, **surtout pas**. Emergency: **en cas de…, rendez-vous au…, prévenez…**.', '**Il faut / vous devez / il est obligatoire de** + infinitif. Interdictions : **il est interdit de**, **ne… jamais**, **surtout pas**. Urgence : **en cas de…, rendez-vous au…, prévenez…**.')),
      hear('Sur le chantier, le casque et les bottes de sécurité sont obligatoires en tout temps.', b('What must you wear?', 'Que faut-il porter ?'), [b('A helmet and safety boots at all times', 'Un casque et des bottes de sécurité en tout temps'), b('Only boots', 'Seulement des bottes'), b('Gloves only in winter', 'Des gants seulement en hiver'), b('Nothing special', 'Rien de spécial')]),
      hear('Ne touchez jamais une machine en marche. Si elle bloque, arrêtez-la avec le bouton rouge et appelez le contremaître.', b('If a machine jams, what should you do?', 'Si une machine se bloque, que faut-il faire ?'), [b('Stop it with the red button and call the foreman', 'L’arrêter avec le bouton rouge et appeler le contremaître'), b('Repair it yourself', 'La réparer soi-même'), b('Keep working', 'Continuer à travailler'), b('Leave the site', 'Quitter le chantier')]),
      hear('En cas d’évacuation, sortez par la porte la plus proche et rendez-vous au stationnement est.', b('Where is the meeting point?', 'Où est le point de rassemblement ?'), [b('The east car park', 'Le stationnement est'), b('The west car park', 'Le stationnement ouest'), b('The cafeteria', 'La cafétéria'), b('The nearest door', 'La porte la plus proche')]),
      sort(b('Obligation or prohibition?', 'Obligation ou interdiction ?'), [b('obligation', 'obligation'), b('prohibition', 'interdiction')], [['Le casque est obligatoire.', 0], ['Ne touchez jamais une machine en marche.', 1], ['Vous devez signer le registre.', 0], ['Il est interdit de fumer.', 1]], { listen: true }),
      pairs(P.match, [['un chantier', b('a construction site', 'lieu de travaux')], ['en tout temps', b('at all times', 'toujours')], ['le contremaître', b('the foreman', 'chef d’équipe')], ['en marche', b('running, on', 'en fonctionnement')]]),
      dict('Le casque et les bottes de sécurité sont obligatoires en tout temps.', { voice: 'm' }),
    ],
    [
      b('Obligation: il faut, vous devez, obligatoire.', 'Obligation : il faut, vous devez, obligatoire.'),
      b('Prohibition: interdit, ne… jamais, surtout pas.', 'Interdiction : interdit, ne… jamais, surtout pas.'),
      b('Emergency: en cas de…, rendez-vous au…', 'Urgence : en cas de…, rendez-vous au…'),
    ],
    [['un casque', b('a helmet', 'protection de la tête')], ['l’évacuation', b('evacuation', 'sortie d’urgence')], ['bloquer', b('to jam', 'se coincer')]],
  ),
  lesson(C, 2, ['medical-instructions', 'consignes-medicales'],
    b('Medical instructions', 'Consignes médicales'),
    b('Understand a treatment explained by a nurse or a doctor.', 'Comprendre un traitement expliqué par une infirmière ou un médecin.'),
    [b('Catch dosage and duration', 'Saisir dose et durée'), b('Catch conditions (si…, sauf si…)', 'Saisir les conditions (si…, sauf si…)'), b('Catch warning signs', 'Saisir les signes d’alerte')],
    13,
    [
      tip(b('Conditions change everything', 'Les conditions changent tout'), b('Medical instructions often depend on **conditions**: **si la fièvre dépasse 39 degrés…**, **sauf si vous avez mal au ventre…**, **tant que…** (as long as), **dès que…** (as soon as).', 'Les consignes médicales dépendent souvent de **conditions** : **si la fièvre dépasse 39 degrés…**, **sauf si vous avez mal au ventre…**, **tant que…**, **dès que…**.')),
      hear('Prenez un comprimé toutes les huit heures pendant cinq jours, même si vous vous sentez mieux.', b('What is important?', 'Qu’est-ce qui est important ?'), [b('Continue for 5 days even if you feel better', 'Continuer 5 jours même si l’on se sent mieux'), b('Stop when you feel better', 'Arrêter quand on se sent mieux'), b('Take 8 tablets a day', 'Prendre 8 comprimés par jour'), b('Take it for 8 days', 'Le prendre 8 jours')]),
      hear('Si la fièvre dépasse trente-neuf degrés ou dure plus de trois jours, revenez nous voir.', b('When should the patient come back?', 'Quand le patient doit-il revenir ?'), [b('If the fever exceeds 39 °C or lasts more than 3 days', 'Si la fièvre dépasse 39 °C ou dure plus de 3 jours'), b('Tomorrow, in any case', 'Demain, dans tous les cas'), b('In 39 days', 'Dans 39 jours'), b('Never', 'Jamais')]),
      hear('Ne mangez rien après minuit, sauf un peu d’eau. Présentez-vous à sept heures pour la prise de sang.', b('What can you have after midnight?', 'Que peut-on prendre après minuit ?'), [b('A little water only', 'Un peu d’eau seulement'), b('A light breakfast', 'Un petit-déjeuner léger'), b('Coffee', 'Du café'), b('Nothing at all, not even water', 'Rien du tout, même pas d’eau')]),
      pairs(P.match, [['toutes les huit heures', b('every eight hours', 'trois fois par jour')], ['une prise de sang', b('a blood test', 'prélèvement sanguin')], ['dépasser', b('to exceed', 'aller au-delà de')], ['sauf', b('except', 'à l’exception de')]]),
      sort(b('Do or don’t?', 'À faire ou à éviter ?'), [b('do', 'à faire'), b('don’t', 'à éviter')], [['continuer le traitement 5 jours', 0], ['manger après minuit', 1], ['revenir si la fièvre dure', 0], ['arrêter dès qu’on va mieux', 1]]),
      dict('Prenez un comprimé toutes les huit heures pendant cinq jours.', { voice: 'f' }),
    ],
    [
      b('Dosage: un comprimé toutes les X heures pendant X jours.', 'Posologie : un comprimé toutes les X heures pendant X jours.'),
      b('Conditions: si…, sauf si…, même si…, tant que…', 'Conditions : si…, sauf si…, même si…, tant que…'),
      b('Fasting: ne mangez rien après minuit (à jeun).', 'À jeun : ne mangez rien après minuit.'),
    ],
    [['à jeun', b('fasting, on an empty stomach', 'sans avoir mangé')], ['se présenter', b('to report, to show up', 'venir')], ['durer', b('to last', 'se prolonger')]],
  ),
  lesson(C, 3, ['technical-help', 'assistance-technique'],
    b('Technical help on the phone', 'L’assistance technique au téléphone'),
    b('Follow step-by-step technical instructions in real time.', 'Suivre des consignes techniques pas à pas, en temps réel.'),
    [b('Follow steps one at a time', 'Suivre les étapes une à une'), b('Understand computer vocabulary', 'Comprendre le vocabulaire informatique'), b('Confirm each step', 'Confirmer chaque étape')],
    13,
    [
      card(b('Tech support language', 'La langue de l’assistance'), b('**Débranchez / rebranchez** (unplug / plug back in), **redémarrez** (restart), **cliquez sur**, **tapez** (type), **le mot de passe**, **le voyant** (indicator light), **attendez que le voyant devienne vert**. Confirm: **C’est fait. Ça clignote. Ça ne marche toujours pas.**', '**Débranchez / rebranchez**, **redémarrez**, **cliquez sur**, **tapez**, **le mot de passe**, **le voyant**, **attendez que le voyant devienne vert**. Confirmer : **C’est fait. Ça clignote. Ça ne marche toujours pas.**')),
      hear('D’abord, débranchez le modem pendant trente secondes, puis rebranchez-le et attendez que le voyant devienne vert.', b('What is the last step?', 'Quelle est la dernière étape ?'), [b('Wait for the light to turn green', 'Attendre que le voyant devienne vert'), b('Unplug the modem', 'Débrancher le modem'), b('Wait 30 minutes', 'Attendre 30 minutes'), b('Call back', 'Rappeler')]),
      hear('Allez dans « Paramètres », cliquez sur « Réseau », puis choisissez votre réseau et tapez le mot de passe.', b('What do you click on after « Paramètres »?', 'Sur quoi cliquez-vous après « Paramètres » ?'), [b('« Réseau » (network)', '« Réseau »'), b('The password', 'Le mot de passe'), b('« Aide »', '« Aide »'), b('Nothing', 'Rien')]),
      hear('Si le voyant clignote en rouge, c’est que la ligne est coupée dans votre secteur. Dans ce cas, on vous enverra un technicien.', b('What does a blinking red light mean?', 'Que signifie un voyant rouge qui clignote ?'), [b('The line is cut in your area; a technician will come.', 'La ligne est coupée dans votre secteur ; un technicien viendra.'), b('Everything works.', 'Tout fonctionne.'), b('You must buy a new modem.', 'Il faut acheter un nouveau modem.'), b('The password is wrong.', 'Le mot de passe est faux.')]),
      tip(b('Confirm each step', 'Confirmez chaque étape'), b('On the phone, say **C’est fait** after each step, and describe what you see: **Le voyant clignote en orange.** Ask: **Je dois cliquer où exactement ?**', 'Au téléphone, dites **C’est fait** après chaque étape, et décrivez ce que vous voyez : **Le voyant clignote en orange.** Demandez : **Je dois cliquer où exactement ?**')),
      pairs(P.match, [['redémarrer', b('to restart', 'relancer')], ['le voyant', b('the indicator light', 'petite lumière')], ['clignoter', b('to blink, flash', 's’allumer et s’éteindre')], ['le mot de passe', b('the password', 'code secret')]]),
      dict('Débranchez le modem, attendez trente secondes, puis rebranchez-le.', { voice: 'm' }),
    ],
    [
      b('débrancher / rebrancher, redémarrer, cliquer sur, taper.', 'débrancher / rebrancher, redémarrer, cliquer sur, taper.'),
      b('attendez que + subjunctive (attendez que le voyant devienne vert).', 'attendez que + subjonctif (attendez que le voyant devienne vert).'),
      b('Confirm: C’est fait. Ça clignote. Ça ne marche toujours pas.', 'Confirmer : C’est fait. Ça clignote. Ça ne marche toujours pas.'),
    ],
    [['un modem', b('a modem', 'appareil de connexion')], ['le réseau', b('the network', 'connexion')], ['un secteur', b('an area', 'zone')]],
  ),
];
