import { b, type Lesson } from '../../types';
import { card, pick } from '../kit';

const lessons: Lesson[] = [
  {
    id: 'hobbies-likes-1',
    slug: { en: 'likes-and-dislikes', fr: 'aimer-adorer-detester' },
    title: b('Likes and dislikes', 'Aimer, adorer, détester'),
    summary: b('Say what you like and dislike, from adorer to détester, with the right article.', 'Dire ce que vous aimez et n’aimez pas, d’adorer à détester, avec le bon article.'),
    objectives: [b('Use the verbs of taste on a scale', 'Employer les verbes de goût sur une échelle'), b('Use le / la / les after aimer', 'Employer le / la / les après aimer'), b('Use aimer + infinitive', 'Employer aimer + infinitif')],
    minutes: 12,
    steps: [
      card(b('From love to hate', 'De l’amour à la haine'), b('**J’adore** ❤️❤️ → **j’aime beaucoup** → **j’aime bien** → **je n’aime pas beaucoup** → **je n’aime pas** → **je déteste**. After these verbs, use **le / la / les** (general idea): j’aime **le** chocolat, je déteste **les** araignées. Or an **infinitive**: j’aime **lire**.', '**J’adore** → **j’aime beaucoup** → **j’aime bien** → **je n’aime pas beaucoup** → **je n’aime pas** → **je déteste**. Après ces verbes : **le / la / les** (idée générale) : j’aime **le** chocolat, je déteste **les** araignées. Ou un **infinitif** : j’aime **lire**.'), {
        examples: [{ fr: 'J’adore la musique, mais je déteste le bruit.', tr: 'I love music, but I hate noise.' }, { fr: 'J’aime bien cuisiner le dimanche.', tr: 'I quite like cooking on Sundays.' }, { fr: 'Je n’aime pas beaucoup le sport.', tr: 'I don’t like sport much.' }],
      }),
      { kind: 'categorize', prompt: b('Positive or negative?', 'Positif ou négatif ?'), buckets: [b('I like it', 'J’aime'), b('I don’t like it', 'Je n’aime pas')], items: [{ text: 'J’adore ça !', bucket: 0 }, { text: 'Je déteste ça.', bucket: 1 }, { text: 'J’aime bien.', bucket: 0 }, { text: 'Ce n’est pas mon truc.', bucket: 1 }, { text: 'C’est génial !', bucket: 0 }, { text: 'Je n’aime pas du tout.', bucket: 1 }] },
      pick('A1', b('Choose the right article.', 'Choisissez le bon article.'), ['le', 'du', 'un', 'de'], { fr: 'J’aime beaucoup ___ fromage.' }),
      pick('A1', b('Choose the right article.', 'Choisissez le bon article.'), ['les', 'des', 'de', 'mes'], { fr: 'Je déteste ___ films d’horreur.' }),
      pick('A1', b('Choose the right form.', 'Choisissez la bonne forme.'), ['danser', 'danse', 'dansez', 'dansé'], { fr: 'Elle adore ___.' }),
      pick('A1', b('Which sentence is the strongest?', 'Quelle phrase est la plus forte ?'), ['J’adore le café.', 'J’aime bien le café.', 'J’aime le café.', 'Le café, ça va.']),
      { kind: 'speak', prompt: b('Say it aloud.', 'Dites-le à voix haute.'), text: 'J’adore la musique, mais je déteste le bruit.', tr: 'I love music, but I hate noise.' },
    ],
    notes: {
      points: [
        b('Scale: adorer > aimer beaucoup > aimer bien > ne pas aimer > détester.', 'Échelle : adorer > aimer beaucoup > aimer bien > ne pas aimer > détester.'),
        b('After taste verbs: le / la / les (general): j’aime le thé.', 'Après les verbes de goût : le / la / les (général) : j’aime le thé.'),
        b('Or an infinitive: j’aime lire, je déteste attendre.', 'Ou un infinitif : j’aime lire, je déteste attendre.'),
        b('“J’aime bien” is weaker than “j’aime” for things.', '« J’aime bien » est plus faible que « j’aime » pour les choses.'),
      ],
      vocab: [['le bruit', b('noise', 'son désagréable')], ['l’araignée (f.)', b('spider', 'petite bête à huit pattes')], ['cuisiner', b('to cook', 'faire à manger')], ['attendre', b('to wait', 'rester jusqu’à…')]],
    },
  },
  {
    id: 'hobbies-likes-2',
    slug: { en: 'sports-and-hobbies', fr: 'sports-et-loisirs' },
    title: b('Sports and hobbies: jouer à, faire de', 'Sports et loisirs : jouer à, faire de'),
    summary: b('Talk about your hobbies with jouer à (games, team sports) and faire de (activities).', 'Parler de vos loisirs avec jouer à (jeux, sports d’équipe) et faire de (activités).'),
    objectives: [b('Use jouer au / à la / aux', 'Employer jouer au / à la / aux'), b('Use faire du / de la / de l’', 'Employer faire du / de la / de l’'), b('Say how often: souvent, parfois, jamais', 'Dire la fréquence : souvent, parfois, jamais')],
    minutes: 13,
    steps: [
      card(b('Jouer à or faire de?', 'Jouer à ou faire de ?'), b('**Jouer à** + games and ball sports: jouer **au** football, **au** hockey, **aux** cartes, **à la** pétanque. **Faire de** + activities: faire **du** vélo, **de la** natation, **du** yoga, **de l’**escalade. Music: jouer **du** piano, **de la** guitare.', '**Jouer à** + jeux et sports de ballon : jouer **au** football, **au** hockey, **aux** cartes. **Faire de** + activités : faire **du** vélo, **de la** natation, **du** yoga, **de l’**escalade. Musique : jouer **du** piano, **de la** guitare.'), {
        examples: [{ fr: 'Le samedi, je joue au hockey avec mes amis.', tr: 'On Saturdays I play hockey with my friends.' }, { fr: 'Elle fait de la natation deux fois par semaine.', tr: 'She goes swimming twice a week.' }, { fr: 'Mon fils joue de la guitare.', tr: 'My son plays the guitar.' }],
      }),
      { kind: 'categorize', prompt: b('Jouer à or faire de?', 'Jouer à ou faire de ?'), buckets: [b('jouer à…', 'jouer à…'), b('faire de…', 'faire de…')], items: [{ text: 'le soccer', bucket: 0 }, { text: 'le vélo', bucket: 1 }, { text: 'les échecs', bucket: 0 }, { text: 'la randonnée', bucket: 1 }, { text: 'le basketball', bucket: 0 }, { text: 'le yoga', bucket: 1 }] },
      pick('A1', b('Choose the right words.', 'Choisissez les bons mots.'), ['joue au', 'fais du', 'joue du', 'fais au'], { fr: 'Je ___ tennis le dimanche.' }),
      pick('A1', b('Choose the right words.', 'Choisissez les bons mots.'), ['fait de la', 'joue à la', 'fait du', 'joue de la'], { fr: 'Elle ___ danse depuis dix ans.' }),
      pick('A1', b('Choose the right words.', 'Choisissez les bons mots.'), ['joue du', 'joue au', 'fait au', 'fait le'], { fr: 'Il ___ piano très bien.' }),
      card(b('How often?', 'À quelle fréquence ?'), b('**toujours** (always), **souvent** (often), **parfois / de temps en temps** (sometimes), **rarement** (rarely), **ne… jamais** (never). Or a precise rhythm: **une fois par semaine**, **tous les jours**, **le samedi** (every Saturday).', '**toujours**, **souvent**, **parfois / de temps en temps**, **rarement**, **ne… jamais**. Ou un rythme précis : **une fois par semaine**, **tous les jours**, **le samedi** (chaque samedi).'), { variant: 'tip' }),
      { kind: 'fill', prompt: b('Complete.', 'Complétez.'), text: 'Je fais ___ vélo tous les jours, mais je ne joue ___ au golf.', answers: [['du'], ['jamais']] },
      { kind: 'speak', prompt: b('Say it aloud.', 'Dites-le à voix haute.'), text: 'Le samedi, je joue au hockey et le dimanche, je fais du yoga.', tr: 'On Saturdays I play hockey and on Sundays I do yoga.' },
    ],
    notes: {
      points: [
        b('Jouer à + games / ball sports: jouer au soccer, aux cartes.', 'Jouer à + jeux / sports de ballon : jouer au soccer, aux cartes.'),
        b('Faire de + activities: faire du vélo, de la natation, de l’escalade.', 'Faire de + activités : faire du vélo, de la natation, de l’escalade.'),
        b('Instruments: jouer du piano, de la guitare, du violon.', 'Instruments : jouer du piano, de la guitare, du violon.'),
        b('Frequency: toujours, souvent, parfois, rarement, ne… jamais; le samedi = every Saturday.', 'Fréquence : toujours, souvent, parfois, rarement, ne… jamais ; le samedi = chaque samedi.'),
      ],
      vocab: [['le soccer (Canada)', b('soccer, football', 'le football (France)')], ['la randonnée', b('hiking', 'longue marche')], ['les échecs (m.)', b('chess', 'jeu de stratégie')], ['l’escalade (f.)', b('climbing', 'monter sur un mur ou un rocher')]],
    },
  },
  {
    id: 'hobbies-likes-3',
    slug: { en: 'invite-accept-refuse', fr: 'inviter-accepter-refuser' },
    title: b('Invite, accept and refuse', 'Inviter, accepter et refuser'),
    summary: b('Invite someone to an activity, accept with enthusiasm or refuse politely with a reason.', 'Inviter quelqu’un à une activité, accepter avec enthousiasme ou refuser poliment avec une raison.'),
    objectives: [b('Make an invitation', 'Faire une invitation'), b('Accept or refuse politely', 'Accepter ou refuser poliment'), b('Suggest another time', 'Proposer un autre moment')],
    minutes: 13,
    steps: [
      card(b('Inviting', 'Inviter'), b('**Tu veux** venir au cinéma ? **Ça te dit** d’aller au parc ? **On va** boire un café ? **Tu es libre** samedi ? To accept: **Avec plaisir !**, **Bonne idée !**, **Oui, volontiers.** To refuse: **Désolé(e), je ne peux pas, je travaille.** **Une autre fois ?**', '**Tu veux** venir au cinéma ? **Ça te dit** d’aller au parc ? **On va** boire un café ? **Tu es libre** samedi ? Accepter : **Avec plaisir !**, **Bonne idée !**, **Oui, volontiers.** Refuser : **Désolé(e), je ne peux pas, je travaille.** **Une autre fois ?**'), {
        examples: [{ fr: 'Tu es libre samedi ? Ça te dit d’aller au cinéma ?', tr: 'Are you free on Saturday? Fancy going to the cinema?' }, { fr: 'Avec plaisir ! À quelle heure ?', tr: 'With pleasure! What time?' }, { fr: 'Désolée, je ne peux pas, je travaille. Dimanche, peut-être ?', tr: 'Sorry, I can’t, I’m working. Sunday, maybe?' }],
      }),
      { kind: 'categorize', prompt: b('Accept or refuse?', 'Accepter ou refuser ?'), buckets: [b('Accept', 'Accepter'), b('Refuse', 'Refuser')], items: [{ text: 'Avec plaisir !', bucket: 0 }, { text: 'Désolé, je ne peux pas.', bucket: 1 }, { text: 'Bonne idée !', bucket: 0 }, { text: 'Ce n’est pas possible pour moi.', bucket: 1 }, { text: 'Oui, volontiers.', bucket: 0 }, { text: 'Une autre fois, peut-être.', bucket: 1 }] },
      pick('A1', b('Which sentence is an invitation?', 'Quelle phrase est une invitation ?'), ['Ça te dit d’aller au restaurant ce soir ?', 'Je vais au restaurant ce soir.', 'Le restaurant est fermé ce soir.', 'J’ai mangé au restaurant.']),
      pick('A1', b('Which refusal is polite?', 'Quel refus est poli ?'), ['Merci, c’est gentil, mais je ne suis pas libre.', 'Non.', 'Pas envie.', 'Je refuse.']),
      pick('A1', b('Choose the right form.', 'Choisissez la bonne forme.'), ['peux', 'peut', 'pouvons', 'pouvoir'], { fr: 'Désolé, je ne ___ pas venir.' }),
      { kind: 'dialogue', title: b('An invitation', 'Une invitation'), scene: b('Choose the best reply.', 'Choisissez la meilleure réponse.'), speakers: [{ name: 'Léa', voice: 'f', side: 'l' }, { name: 'Vous', voice: 'm', side: 'r' }], lines: [
        { s: 0, fr: 'Salut ! On va faire du vélo dimanche. Tu veux venir ?', tr: 'Hi! We’re going cycling on Sunday. Do you want to come?' },
        { s: 1, choose: { options: ['Oh, j’adorerais, mais dimanche je travaille. Samedi, ça vous va ?', 'Non.', 'Je fais du vélo.'], answer: 0 } },
        { s: 0, fr: 'Samedi ? D’accord, je demande aux autres !', tr: 'Saturday? OK, I’ll ask the others!' },
      ] },
      { kind: 'speak', prompt: b('Say it aloud.', 'Dites-le à voix haute.'), text: 'Tu es libre samedi ? Ça te dit d’aller au cinéma ?', tr: 'Are you free on Saturday? Fancy going to the cinema?' },
    ],
    notes: {
      points: [
        b('Invite: Tu veux… ? Ça te dit de… ? Tu es libre… ? On va… ?', 'Inviter : Tu veux… ? Ça te dit de… ? Tu es libre… ? On va… ?'),
        b('Accept: Avec plaisir ! Bonne idée ! Oui, volontiers.', 'Accepter : Avec plaisir ! Bonne idée ! Oui, volontiers.'),
        b('Refuse: Désolé(e), je ne peux pas + reason. Une autre fois ?', 'Refuser : Désolé(e), je ne peux pas + raison. Une autre fois ?'),
        b('Always give a reason when you refuse, and suggest another time.', 'Donnez toujours une raison quand vous refusez, et proposez un autre moment.'),
      ],
      vocab: [['volontiers', b('gladly', 'avec plaisir')], ['libre', b('free, available', 'disponible')], ['une autre fois', b('another time', 'plus tard')], ['ça te dit ?', b('fancy it?', 'tu as envie ?')]],
    },
  },
];

export default lessons;
