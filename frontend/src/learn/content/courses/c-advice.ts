import type { CourseAbout } from '../../types';
import { b, card, dlg, gap, lesson, mc, ord, P, pairs, say, sort } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'À ta place, je… · Tu devrais… · Si j’étais toi… Advice is everywhere in daily conversation: choosing a flat, a course, a doctor, handling a difficult boss. This course teaches you to ask for advice, to give it with the right degree of insistence (from a gentle suggestion to a firm warning) and to accept or politely decline advice, with the conditional and the subjunctive after il faut que.',
    'À ta place, je… · Tu devrais… · Si j’étais toi… Les conseils sont partout dans la conversation : choisir un appartement, une formation, un médecin, gérer un patron difficile. Ce cours vous apprend à demander conseil, à en donner avec le bon degré d’insistance (de la suggestion douce à la mise en garde ferme) et à accepter ou décliner poliment un conseil, avec le conditionnel et le subjonctif après il faut que.',
  ),
  outcomes: [
    b('Ask for advice', 'Demander conseil'),
    b('Give advice with the conditional', 'Donner un conseil au conditionnel'),
    b('Warn and insist', 'Mettre en garde et insister'),
    b('Accept or decline advice politely', 'Accepter ou décliner un conseil poliment'),
  ],
};

const C = 'c-advice';
export default [
  lesson(C, 1, ['asking-for-advice', 'demander-conseil'],
    b('Asking for advice', 'Demander conseil'),
    b('Explain your situation and ask what the other person would do.', 'Exposer sa situation et demander ce que l’autre ferait.'),
    [b('Explain a dilemma', 'Exposer un dilemme'), b('Ask « Qu’est-ce que tu ferais ? »', 'Demander « Qu’est-ce que tu ferais ? »'), b('Ask for a recommendation', 'Demander une recommandation')],
    13,
    [
      card(b('Asking for advice', 'Demander conseil'), b('**J’hésite entre… et…** · **Je ne sais pas quoi faire.** · **Qu’est-ce que tu ferais à ma place ?** · **Tu me conseilles quoi ?** · **Tu connais un bon dentiste ?** · **Vous pourriez me recommander un bon restaurant dans le quartier ?**', '**J’hésite entre… et…** · **Je ne sais pas quoi faire.** · **Qu’est-ce que tu ferais à ma place ?** · **Tu me conseilles quoi ?** · **Tu connais un bon dentiste ?** · **Vous pourriez me recommander un bon restaurant dans le quartier ?**'), {
        ex: [['J’hésite entre deux appartements. Qu’est-ce que tu ferais à ma place ?', 'I’m torn between two flats. What would you do in my place?']],
      }),
      mc(P.best, ['J’hésite entre ces deux offres d’emploi. Qu’est-ce que tu ferais à ma place ?', 'Choisis pour moi.', 'Deux offres, quoi faire, toi ?', 'Je fais quoi, moi, hein ?'], { fr: 'Vous demandez conseil à une amie :' }),
      ord(P.order, 'Qu’est-ce que tu ferais à ma place ?', { tr: 'What would you do in my place?' }),
      gap(P.complete, 'Je ne sais pas ___ faire. Tu me ___ quoi ?', ['quoi', 'conseilles']),
      dlg(b('A dilemma', 'Un dilemme'), undefined, [['Vous', 'f'], ['Karim', 'm']], [
        [0, { options: ['J’hésite entre prendre un appartement en ville ou une maison en banlieue. Tu me conseilles quoi ?', 'Ville ou banlieue, réponds.', 'Je déménage. Voilà.'] }],
        [1, 'Ça dépend. Tu as une voiture ?', 'It depends. Do you have a car?'],
        [0, { options: ['Non, je fais tout en transport en commun.', 'Ça dépend de quoi ?', 'Non merci.'] }],
        [1, 'Alors, à ta place, je prendrais l’appartement en ville.', 'Then, in your place, I’d take the flat in town.'],
      ]),
      pairs(P.match, [['hésiter entre', b('to be torn between', 'ne pas savoir choisir')], ['à ma place', b('in my place', 'si tu étais moi')], ['Ça dépend.', b('It depends.', 'pas de réponse unique')], ['la banlieue', b('the suburbs', 'autour de la ville')]]),
      say('J’hésite entre ces deux formations. Qu’est-ce que vous feriez à ma place ?', 'I’m torn between these two courses. What would you do in my place?'),
    ],
    [
      b('J’hésite entre… et… Je ne sais pas quoi faire.', 'J’hésite entre… et… Je ne sais pas quoi faire.'),
      b('Qu’est-ce que tu ferais à ma place ? Tu me conseilles quoi ?', 'Qu’est-ce que tu ferais à ma place ? Tu me conseilles quoi ?'),
      b('Vous pourriez me recommander… ?', 'Vous pourriez me recommander… ?'),
    ],
    [['un dilemme', b('a dilemma', 'choix difficile')], ['une formation', b('a training course', 'programme d’études')], ['le transport en commun', b('public transport', 'bus, métro')]],
  ),
  lesson(C, 2, ['giving-advice', 'donner-un-conseil'],
    b('Giving advice', 'Donner un conseil'),
    b('Suggest gently or recommend firmly with the conditional, il faut que and imperatives.', 'Suggérer doucement ou recommander fermement avec le conditionnel, il faut que et l’impératif.'),
    [b('Suggest with the conditional', 'Suggérer au conditionnel'), b('Recommend with il faut que + subjunctive', 'Recommander avec il faut que + subjonctif'), b('Grade your insistence', 'Doser son insistance')],
    13,
    [
      card(b('From gentle to firm', 'Du plus doux au plus ferme'), b('Gentle: **Tu pourrais peut-être…** · **Et si tu essayais de… ?** Neutral: **Tu devrais…** · **À ta place, je…** · **Si j’étais toi, je…** Firm: **Il faut absolument que tu…** · **Je te conseille vivement de…**', 'Doux : **Tu pourrais peut-être…** · **Et si tu essayais de… ?** Neutre : **Tu devrais…** · **À ta place, je…** · **Si j’étais toi, je…** Ferme : **Il faut absolument que tu…** · **Je te conseille vivement de…**'), {
        table: { head: [b('gentle', 'doux'), b('neutral', 'neutre'), b('firm', 'ferme')], rows: [['Tu pourrais peut-être…', 'Tu devrais…', 'Il faut absolument que tu…'], ['Et si tu essayais… ?', 'À ta place, je…', 'Je te conseille vivement de…']] },
      }),
      sort(b('Gentle or firm?', 'Doux ou ferme ?'), [b('gentle', 'doux'), b('firm', 'ferme')], [['Tu pourrais peut-être l’appeler.', 0], ['Il faut absolument que tu l’appelles.', 1], ['Et si tu en parlais à ton chef ?', 0], ['Je te conseille vivement d’y aller.', 1], ['Ce serait peut-être bien de te reposer.', 0], ['Tu dois consulter un médecin, c’est urgent.', 1]]),
      gap(P.complete, 'Si j’___ toi, je ___ un autre appartement.', ['étais', 'chercherais']),
      mc(P.form, ['Il faut que tu prennes rendez-vous.', 'Il faut que tu prends rendez-vous.', 'Il faut que tu prendras rendez-vous.', 'Il faut que tu prendre rendez-vous.']),
      mc(P.best, ['À ta place, je lui en parlerais calmement.', 'À ta place, je lui en parle hier.', 'Si je suis toi, je parlerais.', 'À ta place, je lui parlerai demain hier.'], { fr: 'Votre ami a un conflit avec son colocataire :' }),
      pairs(P.match, [['Tu devrais…', b('You should…', 'conseil neutre')], ['Si j’étais toi…', b('If I were you…', 'hypothèse')], ['vivement', b('strongly', 'fortement')], ['Et si tu… ?', b('What if you…?', 'suggestion douce')]]),
      say('Si j’étais toi, je prendrais quelques jours de repos. Tu devrais en parler à ton médecin.', 'If I were you, I’d take a few days off. You should talk to your doctor about it.'),
    ],
    [
      b('Gentle: Tu pourrais peut-être… Et si tu essayais… ?', 'Doux : Tu pourrais peut-être… Et si tu essayais… ?'),
      b('Neutral: Tu devrais… À ta place / Si j’étais toi, je + conditionnel.', 'Neutre : Tu devrais… À ta place / Si j’étais toi, je + conditionnel.'),
      b('Firm: Il faut (absolument) que + subjonctif.', 'Ferme : Il faut (absolument) que + subjonctif.'),
    ],
    [['un colocataire', b('a flatmate', 'personne qui partage le logement')], ['se reposer', b('to rest', 'prendre du repos')], ['consulter', b('to see (a doctor)', 'aller voir')]],
  ),
  lesson(C, 3, ['warnings-and-responses', 'mises-en-garde-et-reponses'],
    b('Warnings, and responding to advice', 'Mises en garde, et répondre à un conseil'),
    b('Warn someone tactfully, and accept or decline advice without offending.', 'Mettre quelqu’un en garde avec tact, et accepter ou décliner un conseil sans froisser.'),
    [b('Warn: Fais attention à…', 'Mettre en garde : Fais attention à…'), b('Accept advice', 'Accepter un conseil'), b('Decline advice politely', 'Décliner un conseil poliment')],
    13,
    [
      card(b('Warning', 'Mettre en garde'), b('**Fais attention à…** · **Méfie-toi de…** · **Évite de…** · **Je ne ferais pas ça, à ta place.** · **Ce n’est pas une bonne idée de…** · **Tu risques de…**', '**Fais attention à…** · **Méfie-toi de…** · **Évite de…** · **Je ne ferais pas ça, à ta place.** · **Ce n’est pas une bonne idée de…** · **Tu risques de…**')),
      card(b('Responding to advice', 'Répondre à un conseil'), b('Accept: **Tu as raison, je vais faire ça.** · **Bonne idée, merci du conseil !** Decline: **C’est vrai, mais dans mon cas…** · **Je vais y réfléchir.** · **Merci, mais je préfère essayer autrement.**', 'Accepter : **Tu as raison, je vais faire ça.** · **Bonne idée, merci du conseil !** Décliner : **C’est vrai, mais dans mon cas…** · **Je vais y réfléchir.** · **Merci, mais je préfère essayer autrement.**')),
      mc(P.best, ['Méfie-toi des annonces trop belles : ne paie jamais avant d’avoir visité.', 'Paie vite, avant les autres !', 'Les annonces, c’est toujours bien.', 'Envoie ton passeport au propriétaire.'], { fr: 'Votre ami cherche un logement sur internet :' }),
      mc(P.best, ['C’est vrai, mais dans mon cas, le train est beaucoup plus pratique. Merci quand même !', 'N’importe quoi.', 'Tu ne sais rien.', 'Occupe-toi de tes affaires.'], { fr: '— Tu devrais acheter une voiture, c’est plus pratique.' }),
      dlg(b('Before a trip', 'Avant un voyage'), undefined, [['Lina', 'f'], ['Vous', 'm']], [
        [0, 'Je pars à Montréal en janvier, avec ma veste d’automne.', 'I’m going to Montréal in January, with my autumn jacket.'],
        [1, { options: ['Fais attention ! En janvier, il peut faire moins vingt. Tu risques d’avoir très froid.', 'Super, bonne idée !', 'Moi, je n’aime pas Montréal.'] }],
        [0, 'Moins vingt ? Sérieux ? Tu me conseilles quoi ?', 'Minus twenty? Seriously? What do you recommend?'],
        [1, { options: ['À ta place, j’achèterais un vrai manteau d’hiver, des bottes et une tuque.', 'Rien, reste chez toi.', 'Prends ta veste d’automne.'] }],
        [0, 'Tu as raison, merci du conseil !', 'You’re right, thanks for the advice!'],
      ]),
      pairs(P.match, [['Méfie-toi de…', b('Beware of…', 'fais attention à')], ['Tu risques de…', b('You might…, you risk…', 'danger possible')], ['Je vais y réfléchir.', b('I’ll think about it.', 'réponse prudente')], ['une tuque', b('a winter hat (Québec)', 'bonnet')]]),
      say('Tu as raison, c’est une bonne idée. Merci du conseil, je vais y réfléchir !', 'You’re right, that’s a good idea. Thanks for the advice, I’ll think about it!'),
    ],
    [
      b('Warn: Fais attention à… Méfie-toi de… Tu risques de…', 'Mettre en garde : Fais attention à… Méfie-toi de… Tu risques de…'),
      b('Accept: Tu as raison. Merci du conseil !', 'Accepter : Tu as raison. Merci du conseil !'),
      b('Decline: C’est vrai, mais dans mon cas… Je vais y réfléchir.', 'Décliner : C’est vrai, mais dans mon cas… Je vais y réfléchir.'),
    ],
    [['une annonce', b('an ad, a listing', 'offre publiée')], ['un manteau', b('a coat', 'vêtement chaud')], ['pratique', b('convenient', 'commode')]],
  ),
];
