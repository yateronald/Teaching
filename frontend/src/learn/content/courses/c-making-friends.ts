import type { CourseAbout } from '../../types';
import { b, card, dlg, doc, flash, gap, hear, lesson, mc, ord, P, pairs, say, sort, trap, write } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Turning a friendly chat at a workshop, café or party into a real friendship takes a few warm, low-pressure phrases. This A2 conversation course teaches you how to discover shared hobbies, agree and disagree naturally (moi aussi vs moi non plus vs moi si), swap phone numbers or social handles, write a casual follow-up message and catch up effortlessly with someone you have not seen in months.',
    'Transformer une discussion sympathique lors d’un atelier, d’un café ou d’une fête en vraie amitié demande quelques phrases simples et naturelles. Ce cours de conversation A2 vous apprend à trouver des centres d’intérêt communs, à réagir avec moi aussi, moi non plus et moi si, à échanger vos coordonnées, à envoyer un premier message et à reprendre contact après une longue pause.',
  ),
  outcomes: [
    b('Discover shared hobbies and agree naturally', 'Trouver des passions communes et réagir naturellement'),
    b('Master moi aussi, moi non plus and moi si', 'Maîtriser moi aussi, moi non plus et moi si'),
    b('Exchange contacts and suggest a meet-up', 'Échanger ses coordonnées et proposer un café'),
    b('Catch up warmly after weeks or months apart', 'Reprendre contact avec chaleur après une longue pause'),
  ],
};

const C = 'c-making-friends';
export default [
  lesson(C, 1, ['finding-common-interests', 'trouver-des-points-communs'],
    b('Finding common interests', 'Trouver des points communs'),
    b('Talk about hobbies and react cleanly with moi aussi, moi non plus and moi si.', 'Parler de loisirs et réagir juste avec moi aussi, moi non plus et moi si.'),
    [b('Ask about hobbies and weekends', 'Questionner sur loisirs et week-ends'), b('Use moi aussi, moi non plus and moi si', 'Employer moi aussi, moi non plus et moi si'), b('Express polite differences', 'Exprimer une différence avec le sourire')],
    13,
    [
      card(b('Finding common ground', 'Les points communs'), b('Ask: **Qu’est-ce que tu aimes faire le week-end ? · Tu fais du sport ou de la musique ?** React: **Moi aussi !** (to a positive sentence), **Moi non plus !** (to a negative sentence), **Moi si !** (when you DO like a negative item), **Pas moi !**', 'Demander : **Qu’est-ce que tu aimes faire le week-end ? · Tu fais du sport ou de la musique ?** Réagir : **Moi aussi !** (phrase positive), **Moi non plus !** (phrase négative), **Moi si !** (contredire une négation), **Pas moi !**'), {
        table: { head: [b('friend says', 'l’ami dit'), b('same', 'pareil'), b('different', 'différent')], rows: [['J’aime cuisiner.', 'Moi aussi !', 'Pas moi.'], ['Je n’aime pas courir.', 'Moi non plus !', 'Moi si !']] },
      }),
      trap(b('Never answer « Moi aussi » to a negative!', 'Jamais « Moi aussi » sur une phrase négative !'), b('If a friend says *« Je ne regarde pas beaucoup la télé »* and you feel the same, say **« Moi non plus »** — never *« Moi aussi »*. To say you DO watch it, say **« Moi si ! »**.', 'Si un ami dit *« Je ne regarde pas beaucoup la télé »* et que c’est pareil pour vous, dites **« Moi non plus »** — jamais *« Moi aussi »*. Si vous la regardez, dites **« Moi si ! »**.')),
      sort(b('Positive match, negative match or contrast?', 'Accord positif, négatif ou différence ?'), [b('positive match', 'accord positif'), b('negative match', 'accord négatif'), b('difference', 'différence')], [['Moi aussi, j’adore la photo !', 0], ['Moi non plus, je ne sors jamais tard.', 1], ['Ah, moi si, j’y vais souvent !', 2], ['Pareil pour moi, j’y vais chaque été.', 0], ['Non plus, je préfère le thé.', 1], ['Ah bon ? Moi, pas du tout.', 2]]),
      dlg(b('At a cooking workshop', 'À l’atelier cuisine'), undefined, [['Yasmine', 'f'], ['Vous', 'm']], [
        [0, 'J’adore cuisiner le dimanche, mais je ne suis pas très forte en pâtisserie.', 'I love cooking on Sundays, though I’m not very good at baking.'],
        [1, { options: ['Moi non plus ! Je réussis mieux les plats salés que les gâteaux.', 'Moi aussi, je ne suis pas bon.', 'C’est mauvais la cuisine.'] }],
        [0, 'Haha, on fait équipe ! Et à part la cuisine, tu aimes la randonnée ?', 'Haha, we make a team! Apart from cooking, do you like hiking?'],
        [1, { options: ['Oui, carrément ! On a vraiment plein de points communs.', 'Non plus !', 'Moi aussi, je n’aime pas.'] }],
      ]),
      mc(P.best, ['Moi non plus, sinon je n’arrive pas à dormir !', 'Moi aussi, jamais !', 'Moi oui, pas de café !', 'Non, je ne bois pas moi aussi.'], { fr: '— Je ne bois jamais de café le soir.' }),
      say('Ah, tu fais aussi de la randonnée ? Moi aussi, j’y vais presque tous les dimanches !', 'Oh, you go hiking too? Me too, I go almost every Sunday!'),
    ],
    [
      b('Positive → Moi aussi / Pas moi.', 'Positif → Moi aussi / Pas moi.'),
      b('Negative → Moi non plus / Moi si !', 'Négatif → Moi non plus / Moi si !'),
      b('On a plein de points communs !', 'On a plein de points communs !'),
    ],
    [['un point commun', b('something in common', 'goût ou intérêt partagé')], ['moi non plus', b('me neither', 'accord avec une négation')], ['carrément', b('totally, definitely (informal)', 'tout à fait')]],
  ),
  lesson(C, 2, ['exchanging-contacts', 'echanger-ses-coordonnees'],
    b('Exchanging contacts', 'Échanger ses coordonnées'),
    b('Ask for a number or handle, send a friendly message and suggest meeting up.', 'Demander un numéro, envoyer un premier message et proposer de se revoir.'),
    [b('Offer to stay in touch naturally', 'Proposer de garder le contact'), b('Suggest a casual coffee or activity', 'Proposer un café sans pression'), b('Write a warm first follow-up message', 'Écrire un premier message amical')],
    13,
    [
      card(b('Staying in touch', 'Garder le contact'), b('**On reste en contact ? · Tu as WhatsApp ou Instagram ? · Je te note mon numéro. · Envoie-moi un message quand tu es libre ! · Ça te dit qu’on prenne un café la semaine prochaine ?**', '**On reste en contact ? · Tu as WhatsApp ou Instagram ? · Je te note mon numéro. · Envoie-moi un message quand tu es libre ! · Ça te dit qu’on prenne un café la semaine prochaine ?**'), {
        ex: [['Ça m’a fait super plaisir de te rencontrer ! On reste en contact ?', 'It was really nice meeting you! Shall we stay in touch?'], ['Dis-moi quand tu es libre pour un café.', 'Let me know when you’re free for a coffee.']],
      }),
      hear('C’était vraiment sympa de discuter avec toi ! Je te note mon numéro, envoie-moi un petit message quand tu es libre pour prendre un café !', b('What does she ask you to do?', 'Que vous demande-t-elle de faire ?'), [b('message her when free for a coffee', 'lui écrire quand vous êtes libre pour un café'), b('call her office tomorrow morning', 'appeler son bureau demain matin'), b('send your home address by email', 'envoyer votre adresse par courriel'), b('meet again tonight at eight', 'vous revoir ce soir à vingt heures')], { voice: 'f2' }),
      pairs(P.match, [['rester en contact', b('to stay in touch', 'continuer à se parler')], ['les coordonnées', b('contact details', 'numéro, courriel, adresse')], ['être libre', b('to be free / available', 'avoir du temps')], ['ça te dit de… ?', b('do you feel like…?', 'proposer une idée')]]),
      ord(P.order, 'On échange nos numéros pour aller boire un café bientôt ?', { tr: 'Shall we swap numbers to go get a coffee soon?', extra: ['courriel'] }),
      mc(P.best, ['Ça m’a fait super plaisir de discuter avec toi ! On reste en contact sur WhatsApp ?', 'Donne ton téléphone.', 'Tu es mon ami maintenant.', 'Écris-moi obligatoirement demain.'], { fr: 'À la fin d’une soirée, vous voulez garder le contact avec quelqu’un de sympa :' }),
      write(b('First follow-up text', 'Premier message après une rencontre'), b('Write a friendly follow-up message (30–55 words) to someone you met at a workshop or party yesterday: remind them of your name, mention what you talked about and suggest a coffee next week.', 'Écrivez un message amical (30–55 mots) à quelqu’un rencontré hier à un atelier ou une fête : rappelez votre prénom, évoquez votre discussion et proposez un café la semaine prochaine.'), 30, 55, [
        b('Warm greeting and your name', 'Salutation chaleureuse et votre prénom'),
        b('Reference to yesterday’s chat', 'Rappel de la rencontre d’hier'),
        b('Simple, low-pressure invitation', 'Proposition simple pour la semaine prochaine'),
      ], 'Salut Yasmine ! C’était vraiment sympa de discuter avec toi à l’atelier cuisine hier soir. Moi, c’est Alex ! Comme on habite tous les deux dans le quartier, ça te dirait qu’on prenne un café la semaine prochaine ? Dis-moi quand tu es libre !', { phrases: ['C’était vraiment sympa de…', 'Ça te dirait qu’on… ?', 'Dis-moi quand tu es libre.'] }),
      say('On reste en contact ? Je te donne mon numéro, envoie-moi un message quand tu veux.', 'Shall we stay in touch? I’ll give you my number, message me whenever you like.'),
    ],
    [
      b('On reste en contact ? · On échange nos numéros ?', 'On reste en contact ? · On échange nos numéros ?'),
      b('Ça te dit qu’on prenne un café… ? · Dis-moi quand tu es libre.', 'Ça te dit qu’on prenne un café… ? · Dis-moi quand tu es libre.'),
      b('Un message court qui rappelle le contexte met à l’aise.', 'Un message court qui rappelle le contexte met à l’aise.'),
    ],
    [['les coordonnées (f)', b('contact details', 'numéro, courriel ou compte')], ['être libre', b('to be free', 'être disponible')], ['le quartier', b('the neighbourhood', 'zone de la ville')]],
  ),
  lesson(C, 3, ['catching-up-after-a-break', 'reprendre-contact'],
    b('Catching up after a break', 'Reprendre contact'),
    b('Reconnect warmly after months without news and share life updates.', 'Reprendre des nouvelles avec chaleur après plusieurs mois sans se voir.'),
    [b('Open a catch-up warmly', 'Relancer un échange avec naturel'), b('Ask Quoi de neuf ? and Qu’est-ce que tu deviens ?', 'Employer Quoi de neuf ? et Qu’est-ce que tu deviens ?'), b('Read and respond to a catch-up text', 'Lire et répondre à un message de retrouvailles')],
    13,
    [
      card(b('After a long break', 'Après une longue pause'), b('**Ça fait une éternité ! · Ça fait tellement longtemps ! · Qu’est-ce que tu deviens ? · Quoi de neuf de ton côté ? · Je pensais justement à toi l’autre jour. · Désolé pour ce long silence. · Il faut absolument qu’on se rattrape !**', '**Ça fait une éternité ! · Ça fait tellement longtemps ! · Qu’est-ce que tu deviens ? · Quoi de neuf de ton côté ? · Je pensais justement à toi l’autre jour. · Désolé pour ce long silence. · Il faut absolument qu’on se rattrape !**'), {
        ex: [['Salut Inès, ça fait une éternité ! Qu’est-ce que tu deviens ?', 'Hi Inès, it’s been ages! What have you been up to?'], ['Il faut absolument qu’on se voie bientôt pour se rattraper.', 'We definitely have to meet up soon to catch up.']],
      }),
      doc({ look: 'sms', title: b('Message from Thomas', 'Message de Thomas'), text: 'Coucou ! Ça fait tellement longtemps qu’on ne s’est pas vus !\nJe suis de passage à Nantes vendredi et samedi pour le travail.\nTu es dans le coin vendredi soir ? Ça me ferait vraiment plaisir de dîner avec toi et de savoir ce que tu deviens !' }, b('Why is Thomas writing?', 'Pourquoi Thomas écrit-il ?'), [b('he is visiting Nantes and wants to meet for dinner', 'il passe à Nantes et propose de dîner ensemble'), b('he needs a place to stay for a month', 'il cherche un logement pour un mois'), b('he has moved to Nantes permanently', 'il a déménagé à Nantes pour toujours'), b('he wants to cancel Friday’s dinner', 'il veut annuler le dîner de vendredi')]),
      dlg(b('Running into an old friend', 'Croiser une ancienne amie'), undefined, [['Inès', 'f'], ['Vous', 'm']], [
        [0, 'Oh, mais c’est toi ! Ça fait une éternité ! Qu’est-ce que tu deviens ?', 'Oh, it’s you! It’s been ages! How have things been?'],
        [1, { options: ['Inès ! Quelle bonne surprise ! J’ai changé de travail en janvier, et toi, quoi de neuf ?', 'Bonjour, au revoir.', 'Je suis une éternité.'] }],
        [0, 'Super ! Moi je viens de rentrer d’un an à Montréal. Il faut qu’on se rattrape autour d’un dîner !', 'Great! I just got back from a year in Montréal. We must catch up over dinner!'],
        [1, { options: ['Avec grand plaisir ! Tu es libre la semaine prochaine ?', 'Non, c’est trop loin.', 'Pourquoi Montréal ?'] }],
      ]),
      gap(P.complete, 'Ça fait tellement longtemps ! Qu’est-ce que tu ___ ? On se ___ la semaine prochaine ?', ['deviens', 'voit'], { choices: [['deviens', 'fais', 'es'], ['voit', 'parle', 'dit']] }),
      flash(b('Quick revision', 'Révision express'), [['Quoi de neuf ?', b('What’s new?', 'demander les nouvelles')], ['Qu’est-ce que tu deviens ?', b('What have you been up to?', 'demander ce que l’autre fait')], ['On reste en contact ?', b('Shall we stay in touch?', 'garder le lien')], ['Il faut qu’on se rattrape !', b('We have to catch up!', 'rattraper le temps perdu')], ['Je pensais justement à toi.', b('I was just thinking about you.', 'belle reprise de contact')]]),
      say('Ça fait une éternité ! Qu’est-ce que tu deviens ? Il faut qu’on prenne un café bientôt.', 'It’s been ages! What have you been up to? We must grab a coffee soon.'),
    ],
    [
      b('Quoi de neuf ? · Qu’est-ce que tu deviens ?', 'Quoi de neuf ? · Qu’est-ce que tu deviens ?'),
      b('Ça fait une éternité ! · Il faut qu’on se rattrape !', 'Ça fait une éternité ! · Il faut qu’on se rattrape !'),
      b('être de passage · être dans le coin.', 'être de passage · être dans le coin.'),
    ],
    [['devenir', b('to become / be up to (in questions)', 'évoluer, faire de sa vie')], ['se rattraper', b('to catch up', 'rattraper le temps sans se voir')], ['être de passage', b('to be passing through / visiting briefly', 'venir pour un court séjour')]],
  ),
];
