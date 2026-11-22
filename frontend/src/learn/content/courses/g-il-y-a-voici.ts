import type { CourseAbout } from '../../types';
import { b, card, dict, dlg, gap, hear, lesson, mc, ord, P, pairs, say, sort, tip, trap } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Il y a, voici, voilà and impersonal il are among the first structures you hear every day in French. With il y a you say what exists in a room, a street or a bag, and with il n’y a pas de you say what is missing. Voici and voilà let you introduce people, hand over an object or point something out. Finally, impersonal il covers the weather, the time and necessity (il pleut, il est midi, il faut) — three essentials for A1.',
    'Il y a, voici, voilà et le il impersonnel font partie des premières tournures que l’on entend chaque jour en français. Avec il y a, vous dites ce qui se trouve dans une pièce, une rue ou un sac, et avec il n’y a pas de ce qui manque. Voici et voilà permettent de présenter quelqu’un, de tendre un objet ou de montrer quelque chose. Enfin, le il impersonnel exprime la météo, l’heure et la nécessité (il pleut, il est midi, il faut).',
  ),
  outcomes: [
    b('Say what exists or is missing with il y a / il n’y a pas de', 'Dire ce qui existe ou manque avec il y a / il n’y a pas de'),
    b('Introduce people and hand over objects with voici and voilà', 'Présenter quelqu’un et tendre un objet avec voici et voilà'),
    b('Give the time and talk about the weather with impersonal il', 'Donner l’heure et parler de la météo avec le il impersonnel'),
    b('Express simple needs with il faut', 'Exprimer un besoin simple avec il faut'),
  ],
};

const C = 'g-il-y-a-voici';
export default [
  lesson(C, 1, ['there-is-il-y-a', 'il-y-a-et-il-n-y-a-pas'],
    b('Saying what exists: il y a', 'Dire ce qui existe : il y a'),
    b('Use il y a for both singular and plural, ask questions and form the negative.', 'Employer il y a au singulier comme au pluriel, poser des questions et former la négation.'),
    [b('Use il y a + singular or plural', 'Employer il y a + singulier ou pluriel'), b('Form il n’y a pas de', 'Former il n’y a pas de'), b('Ask Est-ce qu’il y a… ?', 'Demander Est-ce qu’il y a… ?')],
    13,
    [
      card(b('One form for singular and plural', 'Une seule forme pour singulier et pluriel'), b('**Il y a** means both *there is* and *there are*: **a** never changes (**il y a un parc**, **il y a deux cafés**). Question: **Est-ce qu’il y a un métro près d’ici ?** or **Il y a du pain ?** Negative: **il n’y a pas de** (or **d’** before a vowel), with **de** instead of **un / une / des / du**.', '**Il y a** ne change jamais au pluriel : **il y a un parc**, **il y a deux cafés**. Question : **Est-ce qu’il y a un métro près d’ici ?** ou **Il y a du pain ?** Négation : **il n’y a pas de** (ou **d’** devant voyelle), avec **de** à la place de **un / une / des / du**.'), {
        ex: [['Il y a une boulangerie au coin de la rue.', 'There is a bakery on the corner.'], ['Il y a trois chaises dans la cuisine.', 'There are three chairs in the kitchen.'], ['Il n’y a pas d’ascenseur ici.', 'There is no lift here.']],
      }),
      trap(b('No « ont » and keep « de » after pas', 'Jamais « ils y ont » et toujours « de » après pas'), b('Never say « il y ont » for plural: always **il y a**. After **il n’y a pas**, drop **des / un / une** and use **de / d’**: **Il n’y a pas de problème** (not « pas des problèmes »).', 'Ne dites jamais « il y ont » au pluriel : toujours **il y a**. Après **il n’y a pas**, on remplace **un / une / des** par **de / d’** : **Il n’y a pas de problème** (et non « pas des problèmes »).')),
      mc(P.best, ['Il y a beaucoup de touristes aujourd’hui.', 'Il y ont beaucoup de touristes aujourd’hui.', 'Ils y a beaucoup de touristes aujourd’hui.', 'Il a beaucoup de touristes aujourd’hui.']),
      mc(P.form, ['de', 'des', 'les', 'du'], { fr: 'Désolé, il n’y a plus ___ croissants.', explain: b('Negative + de: il n’y a plus de croissants.', 'Négation + de : il n’y a plus de croissants.') }),
      mc(P.best, ['Est-ce qu’il y a une pharmacie ouverte ?', 'Est-ce qu’il y ont une pharmacie ouverte ?', 'Est-ce qu’il est une pharmacie ouverte ?', 'Y a-t-il des une pharmacie ouverte ?']),
      gap(P.complete, 'Dans le salon, il ___ a un canapé, mais il n’y a pas ___ télévision.', ['y', 'de']),
      ord(P.order, 'Il n’y a pas de lait dans le frigo.', { tr: 'There is no milk in the fridge.', extra: ['des'] }),
      say('Dans mon quartier, il y a un parc et deux cafés, mais il n’y a pas de cinéma.', 'In my neighbourhood, there is a park and two cafés, but there is no cinema.'),
    ],
    [
      b('il y a works for both singular and plural (never il y ont).', 'il y a s’emploie au singulier comme au pluriel (jamais il y ont).'),
      b('Negative: il n’y a pas de / d’ + noun (no un, une, des).', 'Négation : il n’y a pas de / d’ + nom (sans un, une, des).'),
      b('Question: Est-ce qu’il y a… ? or Y a-t-il… ?', 'Question : Est-ce qu’il y a… ? ou Y a-t-il… ?'),
    ],
    [['une boulangerie', b('a bakery', 'magasin où on vend du pain')], ['un ascenseur', b('a lift, an elevator', 'appareil pour monter aux étages')], ['un quartier', b('a neighbourhood', 'partie d’une ville')]],
  ),
  lesson(C, 2, ['voici-and-voila', 'voici-et-voila'],
    b('Pointing and presenting: voici & voilà', 'Montrer et présenter : voici et voilà'),
    b('Use voici and voilà to introduce someone, hand over items and conclude.', 'Employer voici et voilà pour présenter quelqu’un, tendre un objet et conclure.'),
    [b('Use voici / voilà + noun or pronoun', 'Employer voici / voilà + nom ou pronom'), b('Hand over things politely', 'Tendre quelque chose poliment'), b('Contrast il y a and voici / voilà', 'Distinguer il y a et voici / voilà')],
    13,
    [
      card(b('Voici and voilà', 'Voici et voilà'), b('**Voici** (literally *see here*) and **voilà** (*see there*) point directly at someone or something present: **Voici mon passeport. Voilà votre café.** Both work with a pronoun before them: **Me voici ! Le voilà !** In everyday speech, **voilà** is often used for both near and far, and to say *here you go / that’s it*.', '**Voici** et **voilà** désignent directement une personne ou une chose présente : **Voici mon passeport. Voilà votre café.** Avec un pronom, celui-ci se place avant : **Me voici ! Le voilà !** À l’oral, **voilà** s’emploie très souvent pour présenter, tendre quelque chose ou conclure.'), {
        ex: [['Voici ma collègue, Nadia.', 'Here is my colleague, Nadia.'], ['Voilà vos clés, monsieur.', 'Here are your keys, sir.'], ['Ah, te voilà enfin !', 'Oh, there you are at last!']],
      }),
      tip(b('Il y a vs voici / voilà', 'Il y a ou voici / voilà'), b('**Il y a** states that something **exists** somewhere: **Il y a un stylo sur la table.** **Voici / voilà** **shows or hands over** something: **Voici le stylo que tu cherches !** Never say « Voici il y a ».', '**Il y a** indique qu’une chose **existe** quelque part : **Il y a un stylo sur la table.** **Voici / voilà** **montre ou tend** quelque chose : **Voici le stylo que tu cherches !** On ne dit jamais « Voici il y a ».')),
      pairs(P.match, [['Voici mon billet.', b('Here is my ticket.', 'Tendre un billet')], ['Me voici !', b('Here I am!', 'Annoncer son arrivée')], ['Les voilà qui arrivent.', b('Here they come.', 'Montrer des gens qui arrivent')], ['Et voilà le travail !', b('And there you go, all done!', 'Conclure une action')]]),
      mc(P.best, ['Le voilà !', 'Voilà il !', 'Il voilà !', 'Voici il !'], { fr: 'Tu cherches ton manteau ? Regarde sur la chaise : ___' }),
      hear('Bonjour ! Voici votre café et un verre d’eau. Bonne journée !', P.listen, [b('The speaker hands over a coffee and a glass of water.', 'La personne sert un café et un verre d’eau.'), b('The speaker says there is no coffee left.', 'La personne dit qu’il n’y a plus de café.'), b('The speaker asks for the bill.', 'La personne demande l’addition.'), b('The speaker is looking for a glass.', 'La personne cherche un verre.')]),
      dlg(b('At reception', 'À la réception'), b('Checking into a small hotel in Nice.', 'Arrivée dans un petit hôtel à Nice.'), [['Réceptionniste', 'f'], ['Vous', 'm']], [
        [0, 'Bonjour ! Vous avez une réservation ?', 'Hello! Do you have a booking?'],
        [1, { options: ['Oui, voici ma carte d’identité et ma confirmation.', 'Oui, il y a voici ma carte.', 'Oui, voilà suis-je la carte.'] }],
        [0, 'Parfait. Voilà la clé de la chambre 12, au deuxième étage.', 'Perfect. Here is the key to room 12, on the second floor.'],
        [1, { options: ['Merci ! Est-ce qu’il y a un ascenseur ?', 'Merci ! Voici est un ascenseur ?', 'Merci ! Voilà il a un ascenseur ?'] }],
        [0, 'Oui, il est juste là, à gauche. Bon séjour !', 'Yes, it’s right over there, on the left. Enjoy your stay!'],
      ]),
      dict('Voici mon amie Claire et voilà son mari Paul.', { voice: 'f' }),
    ],
    [
      b('Voici / voilà point out or hand over something; no verb follows.', 'Voici / voilà montrent ou tendent quelque chose ; aucun verbe ne suit.'),
      b('Pronouns go before: Me voici, le voilà, les voilà.', 'Les pronoms se placent avant : Me voici, le voilà, les voilà.'),
      b('Voilà also means “here you go” or “that’s all”.', 'Voilà sert aussi à tendre un objet ou à conclure.'),
    ],
    [['une confirmation', b('a booking confirmation', 'preuve d’une réservation')], ['un manteau', b('a coat', 'vêtement chaud')], ['un séjour', b('a stay', 'temps passé quelque part')]],
  ),
  lesson(C, 3, ['impersonal-il-weather-time', 'le-il-impersonnel'],
    b('Impersonal il: weather, time and il faut', 'Le il impersonnel : météo, heure et il faut'),
    b('Use impersonal il for weather, clock time and general necessity.', 'Employer le il impersonnel pour la météo, l’heure et l’obligation générale.'),
    [b('Talk about the weather with il fait / il pleut', 'Parler de la météo avec il fait / il pleut'), b('Tell the time with il est…', 'Donner l’heure avec il est…'), b('Say what is needed with il faut', 'Dire ce qui est nécessaire avec il faut')],
    13,
    [
      card(b('An empty subject « il »', 'Un sujet « il » impersonnel'), b('In impersonal phrases, **il** does not refer to a person — it works like English *it* or *there* and only exists in the 3rd-person singular. **Weather**: **il fait beau, il fait froid, il fait 20 degrés, il pleut, il neige**. **Time**: **il est huit heures, il est midi, il est minuit**. **Necessity**: **il faut** + noun or infinitive (**il faut un billet**, **il faut partir**).', 'Dans les tournures impersonnelles, **il** ne désigne personne : il n’existe qu’au singulier. **Météo** : **il fait beau, il fait froid, il fait 20 degrés, il pleut, il neige**. **Heure** : **il est huit heures, il est midi, il est minuit**. **Nécessité** : **il faut** + nom ou infinitif (**il faut un billet**, **il faut partir**).'), {
        table: { head: [b('use', 'usage'), b('structure', 'structure'), b('example', 'exemple')], rows: [[b('weather', 'météo'), 'il fait / il + verbe', 'Il fait doux. Il pleut.'], [b('time', 'heure'), 'il est + heure', 'Il est neuf heures et demie.'], [b('necessity', 'nécessité'), 'il faut + nom / infinitif', 'Il faut attendre ici.']] },
      }),
      tip(b('Il fait vs il y a for weather', 'Il fait ou il y a pour la météo'), b('Use **il fait** + adjective (**il fait chaud, il fait gris**) and **il y a** + noun (**il y a du vent, il y a du soleil, il y a des nuages**). For rain and snow, use the verbs: **il pleut**, **il neige**.', 'Employez **il fait** + adjectif (**il fait chaud, il fait gris**) et **il y a** + nom (**il y a du vent, il y a du soleil, il y a des nuages**). Pour la pluie et la neige, utilisez les verbes : **il pleut**, **il neige**.')),
      sort(b('Il fait, il y a or il est?', 'Il fait, il y a ou il est ?'), ['il fait', 'il y a', 'il est'], [['… beau aujourd’hui', 0], ['… du soleil', 1], ['… dix heures', 2], ['… très froid', 0], ['… beaucoup de vent', 1], ['… midi et quart', 2]]),
      mc(P.best, ['Il est quatorze heures.', 'Il fait quatorze heures.', 'C’est quatorze heures.', 'Il y a quatorze heures.'], { fr: '— Quelle heure est-il ?' }),
      mc(P.best, ['Il faut prendre un parapluie, il pleut.', 'Il faut prends un parapluie, il pleut.', 'Il faut que prendre un parapluie.', 'Il fais prendre un parapluie, il pleut.']),
      gap(P.complete, 'Aujourd’hui, il ___ froid et il ___ beaucoup de vent, mais il ne ___ pas.', ['fait', 'y a', 'pleut'], { choices: [['fait', 'est', 'faut'], ['y a', 'fait', 'pleut'], ['pleut', 'fait', 'faut']] }),
      ord(P.order, 'Quel temps fait-il à Lyon aujourd’hui ?', { tr: 'What is the weather like in Lyon today?' }),
      say('Il est huit heures, il fait un peu frais, mais il y a du soleil.', 'It’s eight o’clock, it’s a bit chilly, but it’s sunny.'),
    ],
    [
      b('Time always starts with Il est (Il est midi, il est trois heures).', 'L’heure commence toujours par Il est (Il est midi, il est trois heures).'),
      b('Weather: il fait + adjective, il y a du + noun, il pleut / il neige.', 'Météo : il fait + adjectif, il y a du + nom, il pleut / il neige.'),
      b('il faut + infinitive or noun = it is necessary to / you need.', 'il faut + infinitif ou nom = il est nécessaire de.'),
    ],
    [['un parapluie', b('an umbrella', 'objet pour se protéger de la pluie')], ['du vent', b('wind', 'air en mouvement')], ['il faut', b('one must, you need', 'c’est nécessaire')]],
  ),
];
