import type { CourseAbout } from '../../types';
import { b, card, dict, dlg, doc, flash, gap, hear, lesson, mc, ord, P, pairs, say, sort, tip } from '../dsl';

export const about: CourseAbout = {
  description: b(
    'Talking about the people closest to you is one of the first real conversations you have in French. This beginner course teaches you to introduce parents, siblings, grandparents and extended family with the right possessive (mon, ma, mes), state ages naturally with avoir, talk about marital status and children, and introduce close friends warmly.',
    'Parler des personnes les plus proches de vous est l’une des toutes premières vraies conversations en français. Ce cours pour débutants vous apprend à présenter parents, frères, sœurs, grands-parents et famille élargie avec le bon possessif (mon, ma, mes), à dire l’âge avec avoir, à parler de situation familiale et d’enfants, et à présenter vos amis avec chaleur.',
  ),
  outcomes: [
    b('Name immediate and extended family members', 'Nommer la famille proche et élargie'),
    b('Choose mon, ma, mes without vowel traps', 'Choisir mon, ma, mes sans piège de voyelle'),
    b('Say ages and marital status naturally', 'Dire l’âge et la situation familiale naturellement'),
    b('Introduce close friends and describe them', 'Présenter ses amis proches et les décrire'),
  ],
};

const C = 'b-my-family';
export default [
  lesson(C, 1, ['immediate-and-extended-family', 'famille-proche-et-elargie'],
    b('Immediate & extended family', 'La famille proche et élargie'),
    b('Name relatives and use mon, ma, mes correctly.', 'Nommer ses proches et employer correctement mon, ma, mes.'),
    [b('Name family members', 'Nommer les membres de la famille'), b('Use mon, ma, mes correctly', 'Utiliser mon, ma, mes correctement'), b('Understand simple family descriptions', 'Comprendre une présentation familiale')],
    13,
    [
      card(b('Relatives & possessives', 'Les proches et les possessifs'), b('Family: **le père / la mère, le frère / la sœur, le fils / la fille, le grand-père / la grand-mère, l’oncle / la tante, le cousin / la cousine, le neveu / la nièce**. Use **mon** (masculine singular), **ma** (feminine singular), **mes** (plural).', 'Famille : **le père / la mère, le frère / la sœur, le fils / la fille, le grand-père / la grand-mère, l’oncle / la tante, le cousin / la cousine, le neveu / la nièce**. Employez **mon** (masculin singulier), **ma** (féminin singulier), **mes** (pluriel).'), {
        table: { head: [b('type', 'type'), b('form', 'forme'), b('example', 'exemple')], rows: [['masculine sg.', 'mon', 'mon père, mon frère'], ['feminine sg.', 'ma', 'ma mère, ma sœur'], ['vowel / silent h', 'mon', 'mon amie, mon épouse'], ['plural', 'mes', 'mes parents, mes cousins']] },
      }),
      tip(b('Watch the vowel rule!', 'Attention à la voyelle !'), b('Before a feminine word starting with a vowel or silent h, **ma** becomes **mon** so it flows smoothly: **mon amie Clara**, **mon épouse**, **mon adorable nièce**.', 'Devant un mot féminin commençant par une voyelle ou un h muet, **ma** devient **mon** pour la liaison : **mon amie Clara**, **mon épouse**, **mon adorable nièce**.')),
      sort(b('Masculine or feminine?', 'Masculin ou féminin ?'), [b('masculine', 'masculin'), b('feminine', 'féminin')], [['mon grand-père', 0], ['ma petite sœur', 1], ['mon cousin', 0], ['ma tante', 1], ['mon neveu', 0], ['ma grand-mère', 1]]),
      gap(P.complete, 'Voici ma famille : j’ai un ___ plus âgé, une petite ___ et deux grands-parents à Lyon.', ['frère', 'sœur'], { choices: [['frère', 'sœur', 'tante'], ['sœur', 'frère', 'oncle']] }),
      hear('Je vous présente mes parents : ma mère s’appelle Claire et mon père s’appelle Marc. J’ai aussi deux sœurs.', b('How many sisters does she have?', 'Combien de sœurs a-t-elle ?'), [b('two', 'deux'), b('one', 'une'), b('three', 'trois'), b('none', 'aucune')], { voice: 'f' }),
      pairs(P.match, [['le neveu', b('the nephew', 'fils du frère ou de la sœur')], ['la nièce', b('the niece', 'fille du frère ou de la sœur')], ['les beaux-parents', b('parents-in-law', 'parents du conjoint')], ['un enfant unique', b('an only child', 'sans frère ni sœur')]]),
      say('J’ai un grand frère et une petite sœur. Mes parents habitent à Toulouse.', 'I have an older brother and a younger sister. My parents live in Toulouse.'),
    ],
    [
      b('mon (masc. or vowel), ma (fem.), mes (plural).', 'mon (masc. ou voyelle), ma (fém.), mes (pluriel).'),
      b('mon amie, mon épouse (never ma amie).', 'mon amie, mon épouse (jamais ma amie).'),
      b('le neveu / la nièce · le cousin / la cousine.', 'le neveu / la nièce · le cousin / la cousine.'),
    ],
    [['un fils', b('a son', 'enfant garçon')], ['une tante', b('an aunt', 'sœur du père ou de la mère')], ['un neveu', b('a nephew', 'fils du frère ou de la sœur')]],
  ),
  lesson(C, 2, ['ages-and-marital-status', 'ages-et-situation-familiale'],
    b('Ages & marital status', 'Âges et situation familiale'),
    b('Ask and give ages with avoir, and talk about marriage, partners and children.', 'Demander et dire l’âge avec avoir, et parler de couple, mariage et enfants.'),
    [b('Give ages with avoir', 'Dire l’âge avec avoir'), b('Talk about marital status', 'Parler de sa situation familiale'), b('Name partners accurately', 'Nommer son ou sa partenaire')],
    13,
    [
      card(b('Ages and status', 'Âges et situation'), b('Age always uses **avoir**: **Quel âge as-tu ? — J’ai vingt-huit ans. Ma fille a cinq ans.** Marital status: **je suis célibataire, en couple, marié(e), pacsé(e), divorcé(e)**. Partners: **mon mari, ma femme, mon compagnon, ma compagne, mon copain, ma copine**.', 'L’âge utilise toujours **avoir** : **Quel âge as-tu ? — J’ai vingt-huit ans. Ma fille a cinq ans.** Situation : **je suis célibataire, en couple, marié(e), pacsé(e), divorcé(e)**. Partenaire : **mon mari, ma femme, mon compagnon, ma compagne, mon copain, ma copine**.'), {
        ex: [['Mon frère est marié et il a trente-quatre ans.', 'My brother is married and he is thirty-four.'], ['Je vous présente ma compagne, Nadia.', 'Let me introduce my partner, Nadia.']],
      }),
      mc(P.best, ['Elle a quel âge, ta fille ?', 'Elle est quel âge, ta fille ?', 'Combien ans elle est ?', 'Quel an a ta fille ?'], { fr: 'Vous demandez l’âge de l’enfant d’une amie :' }),
      dlg(b('Catching up over coffee', 'Nouvelles autour d’un café'), undefined, [['Nadia', 'f'], ['Vous', 'm']], [
        [0, 'Tu as des nouvelles de ton frère ? Il habite toujours à Bordeaux ?', 'Any news from your brother? Does he still live in Bordeaux?'],
        [1, { options: ['Oui ! Il est marié maintenant, et sa fille a déjà quatre ans.', 'Oui, il est quatre ans.', 'Non, sa fille est mariée à Bordeaux.'] }],
        [0, 'Déjà quatre ans ? Le temps passe vite ! Et toi, tu es toujours en couple avec Léa ?', 'Four already? Time flies! And you, are you still together with Léa?'],
        [1, { options: ['Oui, nous sommes pacsés depuis l’année dernière.', 'Oui, je suis pacsé avec quatre ans.', 'Non, je suis mon copain.'] }],
      ]),
      ord(P.order, 'Ma petite fille a quatre ans et elle adore dessiner.', { tr: 'My little daughter is four years old and she loves drawing.', extra: ['est'] }),
      dict('Mon frère est marié depuis trois ans et il a deux enfants.', { voice: 'm2' }),
      say('J’ai trente-deux ans, je suis en couple et j’ai un fils de cinq ans.', 'I’m thirty-two, I’m in a relationship and I have a five-year-old son.'),
    ],
    [
      b('Age uses avoir: J’ai trente ans (never je suis).', 'L’âge emploie avoir : J’ai trente ans (jamais je suis).'),
      b('célibataire, en couple, marié(e), pacsé(e), divorcé(e).', 'célibataire, en couple, marié(e), pacsé(e), divorcé(e).'),
      b('mon compagnon / ma compagne = partner.', 'mon compagnon / ma compagne = partenaire de vie.'),
    ],
    [['pacsé', b('in a civil partnership (PACS)', 'uni par un PACS')], ['célibataire', b('single', 'qui n’est pas en couple')], ['une compagne', b('a partner (female)', 'partenaire de couple')]],
  ),
  lesson(C, 3, ['introducing-friends', 'presenter-ses-amis'],
    b('Introducing close friends', 'Présenter ses amis proches'),
    b('Introduce friends, say how long you have known each other and describe personality.', 'Présenter des amis, dire depuis quand on se connaît et décrire leur caractère.'),
    [b('Introduce a friend warmly', 'Présenter un ami chaleureusement'), b('Say how long you have known them', 'Dire depuis quand on se connaît'), b('Use simple personality adjectives', 'Employer des adjectifs simples')],
    13,
    [
      card(b('Introducing friends', 'Présenter ses amis'), b('**Je te présente… · Voici… · C’est mon meilleur ami / ma meilleure amie.** How long: **On se connaît depuis dix ans. · C’est mon ami d’enfance. · On s’est rencontrés au travail.** Character: **il est drôle, généreux, calme, timide, toujours à l’écoute**.', '**Je te présente… · Voici… · C’est mon meilleur ami / ma meilleure amie.** Durée : **On se connaît depuis dix ans. · C’est mon ami d’enfance. · On s’est rencontrés au travail.** Caractère : **il est drôle, généreux, calme, timide, toujours à l’écoute**.'), {
        ex: [['Voici Samira, c’est ma meilleure amie.', 'This is Samira, she’s my best friend.'], ['On se connaît depuis le lycée.', 'We’ve known each other since high school.']],
      }),
      doc({ look: 'sms', title: b('Message from Paul', 'Message de Paul'), text: 'Salut ! Samedi soir, je fais un dîner chez moi pour mon anniversaire.\nTu peux venir avec ta sœur ou un ami si tu veux !\nIl y aura aussi Sarah, mon amie d’enfance, et son compagnon Léo.\nRendez-vous à 19 h 30. À samedi !' }, b('Who is Sarah?', 'Qui est Sarah ?'), [b('Paul’s childhood friend', 'l’amie d’enfance de Paul'), b('Paul’s sister', 'la sœur de Paul'), b('Léo’s mother', 'la mère de Léo'), b('a neighbour from work', 'une collègue de travail')]),
      mc(P.best, ['Je vous présente Samira, c’est ma meilleure amie depuis le lycée.', 'Elle est Samira, lycée.', 'Voici meilleure amie ma.', 'C’est une amie je suis.'], { fr: 'Vous présentez votre amie à vos parents :' }),
      pairs(P.match, [['drôle', b('funny', 'qui fait rire')], ['généreux', b('generous', 'qui donne volontiers')], ['un ami d’enfance', b('a childhood friend', 'ami depuis petit')], ['se connaître depuis…', b('to have known each other for…', 'durée d’une relation')]]),
      flash(b('Quick revision', 'Révision express'), [['Je te présente mon frère.', b('Let me introduce my brother.', 'présentation familière')], ['Mon père a soixante ans.', b('My father is sixty years old.', 'âge avec avoir')], ['Je suis mariée et j’ai deux enfants.', b('I’m married and have two children.', 'situation familiale')], ['C’est mon meilleur ami.', b('He is my best friend.', 'ami très proche')], ['On se connaît depuis cinq ans.', b('We’ve known each other for five years.', 'durée avec depuis')]]),
      gap(P.complete, 'Voici Lucas, c’est mon ___ ami. On se ___ depuis l’école primaire.', ['meilleur', 'connaît'], { choices: [['meilleur', 'petit', 'vieux'], ['connaît', 'sait', 'voit']] }),
      say('Je te présente Karim, c’est mon meilleur ami. On se connaît depuis huit ans.', 'Let me introduce Karim, my best friend. We’ve known each other for eight years.'),
    ],
    [
      b('Je te / vous présente… · C’est mon meilleur ami / ma meilleure amie.', 'Je te / vous présente… · C’est mon meilleur ami / ma meilleure amie.'),
      b('On se connaît depuis… = We’ve known each other for…', 'On se connaît depuis… = durée jusqu’à aujourd’hui.'),
      b('drôle, généreux, calme, timide.', 'drôle, généreux, calme, timide.'),
    ],
    [['se connaître', b('to know each other', 'être amis ou proches')], ['un ami d’enfance', b('a childhood friend', 'ami de longue date')], ['généreux', b('generous', 'qui partage volontiers')]],
  ),
];
