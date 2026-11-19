// A2 · Automated phone messages: tapez 1, la touche dièse, étoile, veuillez patienter, après le bip.
import { ear, ex, fill, pick, situation } from '../authoring';

const IMPOTS = 'Bienvenue au centre des impôts. Pour une question sur votre déclaration, tapez 1. Pour un paiement, tapez 2. Pour toute autre demande, restez en ligne.';
const IMPOTS_SHOW = 'Bienvenue au centre des impôts. Pour une question sur votre {déclaration}, {tapez 1}. Pour un {paiement}, {tapez 2}. Pour {toute autre demande}, {restez en ligne}.';

export default ear('tapez-1', {
  rule: [
    ['Les messages automatiques : écoutez le service, puis la touche', 'Automated messages: listen for the service, then the key'],
    [
      'Les serveurs vocaux (banque, impôts, médecin, opérateur) utilisent toujours les mêmes formules : __tapez 1__ (appuyez sur la touche 1), __la touche étoile__ (*), __la touche dièse__ (#), __veuillez patienter__ (attendez, s’il vous plaît), __votre correspondant n’est pas joignable__ (la personne ne répond pas), __après le bip sonore__.\n\nLa méthode : repérez d’abord **le service** qui vous concerne, puis **le chiffre** qui le suit. Le chiffre vient presque toujours après le service.',
      'Automated phone lines (bank, tax office, doctor, phone company) always use the same phrases: __tapez 1__ (press key 1), __la touche étoile__ (*), __la touche dièse__ (#), __veuillez patienter__ (please hold), __votre correspondant n’est pas joignable__ (the person cannot be reached), __après le bip sonore__ (after the beep).\n\nThe method: first spot **the service** you need, then **the number** that follows it. The number almost always comes after the service.',
    ],
  ],
  goal: ['Choisir la bonne touche et comprendre les formules d’un serveur vocal.', 'Choose the right key and understand the phrases of a phone menu.'],
  examples: [
    ex('Pour prendre rendez-vous, tapez 1.', 'Pour {prendre rendez-vous}, {tapez 1}.', ['Le service d’abord, puis la touche.', 'The service first, then the key.']),
    ex('Veuillez patienter, un conseiller va vous répondre.', '{Veuillez patienter}, un conseiller va vous répondre.', ['Veuillez patienter = attendez, s’il vous plaît.', 'Veuillez patienter = please hold.']),
    ex('Terminez par la touche dièse.', 'Terminez par {la touche dièse} (#).', ['Dièse = #, étoile = *.', 'Dièse = #, étoile = *.']),
  ],
  items: [
    pick('Pour connaître nos horaires, tapez 2. Pour parler à un conseiller, tapez 3.', ['1', '2', '3'], 2, 'Pour connaître nos horaires, tapez 2. Pour {parler à un conseiller}, {tapez 3}.', [
      'Parler à quelqu’un = « parler à un conseiller » : tapez 3. Le 2, c’est pour les horaires.', 'Talking to someone = « parler à un conseiller »: press 3. Key 2 is for opening hours.',
    ], ['Vous voulez parler à quelqu’un. Quelle touche ?', 'You want to talk to someone. Which key?']),
    pick('Pour prendre rendez-vous, tapez 1. Pour annuler un rendez-vous, tapez 4.', ['1', '4', '9'], 1, 'Pour prendre rendez-vous, tapez 1. Pour {annuler} un rendez-vous, {tapez 4}.', [
      '« Annuler un rendez-vous » : tapez 4. « Prendre rendez-vous », c’est le 1.', '« Annuler un rendez-vous » (cancel): press 4. Booking is 1.',
    ], ['Vous voulez annuler un rendez-vous. Quelle touche ?', 'You want to cancel an appointment. Which key?']),
    pick('Saisissez votre numéro de dossier, puis terminez par la touche dièse.', ['#', '*', '0'], 0, 'Saisissez votre numéro de dossier, puis terminez par {la touche dièse}.', [
      'La touche dièse = #. L’étoile, c’est *.', 'La touche dièse = #. L’étoile is *.',
    ], ['Par quelle touche faut-il terminer ?', 'Which key do you finish with?']),
    pick('Votre correspondant n’est pas joignable. Laissez un message après le bip sonore.', ['La personne ne répond pas.', 'La ligne est coupée.', 'Le numéro n’existe pas.'], 0, 'Votre correspondant {n’est pas joignable}. Laissez un message {après le bip sonore}.', [
      '« N’est pas joignable » : on ne peut pas le joindre, il ne répond pas. Vous pouvez laisser un message.', '« N’est pas joignable »: the person cannot be reached. You can leave a message.',
    ], ['Que se passe-t-il ?', 'What is happening?']),
    pick('Tous nos conseillers sont occupés. Votre temps d’attente est estimé à cinq minutes.', ['5 minutes', '15 minutes', '50 minutes'], 0, 'Tous nos conseillers sont occupés. Votre temps d’attente est estimé à {cinq minutes}.', [
      '« Cinq minutes » [sɛ̃k] : on entend le [k] de cinq devant « minutes ».', '« Cinq minutes » [sɛ̃k]: you hear the [k] of cinq before « minutes ».',
    ], ['Combien de temps faut-il attendre ?', 'How long is the wait?']),
    fill('Pour le service client, tapez le six.', 'Pour le service client, tapez le ___.', ['6', 'six'], 'Pour le service client, tapez le {six}.', [
      '[sis] : six. Écrivez-le en chiffre ou en lettres.', '[sis]: six. Write it as a figure or a word.',
    ]),
    fill('Pour réécouter ce message, appuyez sur la touche étoile.', 'Pour réécouter ce message, appuyez sur la touche ___.', ['étoile', '*'], 'Pour réécouter ce message, appuyez sur la touche {étoile}.', [
      'La touche étoile = *.', 'La touche étoile = *.',
    ]),
    fill('Veuillez patienter, un conseiller va vous répondre.', '___ patienter, un conseiller va vous répondre.', 'veuillez', '{Veuillez} patienter, un conseiller va vous répondre.', [
      '« Veuillez » [vœje] : la forme très polie de « voulez », dans tous les messages officiels.', '« Veuillez » [vœje]: the very polite form of « voulez », in every official message.',
    ]),
    situation(IMPOTS, 'Vous avez une question sur votre déclaration. Que faites-vous ?', ['Je tape 1.', 'Je tape 2.', 'Je reste en ligne.'], 0, IMPOTS_SHOW, [
      '« Pour une question sur votre déclaration, tapez 1. »', '« Pour une question sur votre déclaration, tapez 1. »',
    ]),
    situation(IMPOTS, 'Vous avez une autre question. Que faites-vous ?', ['Je tape 1.', 'Je tape 2.', 'Je reste en ligne.'], 2, IMPOTS_SHOW, [
      '« Pour toute autre demande, restez en ligne » : n’appuyez sur rien, attendez.', '« Pour toute autre demande, restez en ligne »: press nothing, wait.',
    ]),
  ],
  takeaway: [
    'Dans un serveur vocal, attendez votre service, puis retenez le chiffre qui suit. Étoile = *, dièse = #, veuillez patienter = attendez.',
    'In a phone menu, wait for your service, then keep the number that follows. Étoile = *, dièse = #, veuillez patienter = please hold.',
  ],
});
