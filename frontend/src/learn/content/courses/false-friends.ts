// Faux amis anglais-français: words that look the same and mean something
// else. For English speakers, the fastest way to stop being misunderstood.
import { b, type Lesson } from '../../types';
import { card, pick } from '../kit';

const means = b('What does it mean?', 'Que signifie ce mot ?');

const lessons: Lesson[] = [
  {
    id: 'false-friends-1',
    slug: { en: 'everyday-false-friends', fr: 'faux-amis-du-quotidien' },
    title: b('Everyday false friends', 'Les faux amis du quotidien'),
    summary: b('Actuellement, librairie, attendre, rester, monnaie: ten traps you meet in the first week.', 'Actuellement, librairie, attendre, rester, monnaie : dix pièges que l’on rencontre dès la première semaine.'),
    objectives: [b('Recognise ten everyday false friends', 'Reconnaître dix faux amis du quotidien'), b('Know the right French word for the English idea', 'Connaître le bon mot français pour l’idée anglaise'), b('Use them in a sentence', 'Les employer dans une phrase')],
    minutes: 13,
    steps: [
      card(b('Same look, different meaning', 'Même apparence, autre sens'), b('A **faux ami** looks like an English word but means something else. **Actuellement** is not “actually”: it means **currently**. “Actually” is **en fait**. Learn them in pairs: the French word and what it really means, then how to say the English idea.', 'Un **faux ami** ressemble à un mot anglais mais veut dire autre chose. **Actuellement** ne signifie pas « actually » : il veut dire **en ce moment**. « Actually » se dit **en fait**. Apprenez-les par paires : le mot français et son vrai sens, puis la façon d’exprimer l’idée anglaise.'), {
        examples: [{ fr: 'Actuellement, j’habite à Ottawa.', tr: 'Currently, I live in Ottawa.' }, { fr: 'En fait, je préfère le thé.', tr: 'Actually, I prefer tea.' }],
      }),
      { kind: 'match', prompt: b('Match each French word with its real meaning.', 'Associez chaque mot français à son vrai sens.'), pairs: [['actuellement', b('currently', 'en ce moment')], ['une librairie', b('a bookshop', 'magasin de livres')], ['attendre', b('to wait', 'rester jusqu’à l’arrivée de…')], ['rester', b('to stay', 'ne pas partir')], ['la monnaie', b('change (coins)', 'les pièces rendues')]] },
      card(b('And the English idea?', 'Et l’idée anglaise ?'), b('“library” → **une bibliothèque** · “to attend” → **assister à** · “to rest” → **se reposer** · “money” → **l’argent** · “a location” → **un endroit, un lieu** (**une location** is a rental).', '« library » → **une bibliothèque** · « to attend » → **assister à** · « to rest » → **se reposer** · « money » → **l’argent** · « a location » → **un endroit, un lieu** (**une location**, c’est le fait de louer).'), { variant: 'tip' }),
      pick('A2', means, [b('I am waiting for the bus', 'Je reste jusqu’à l’arrivée du bus'), b('I am attending the bus', 'J’assiste au bus'), b('I am taking the bus', 'Je prends le bus')], { fr: 'J’attends le bus.' }),
      pick('A2', b('You want to borrow a book for free. Where do you go?', 'Vous voulez emprunter un livre gratuitement. Où allez-vous ?'), ['À la bibliothèque', 'À la librairie', 'À la location', 'À la monnaie']),
      pick('A2', b('Choose the right word.', 'Choisissez le bon mot.'), ['me reposer', 'rester', 'me rester', 'reposer'], { fr: 'Je suis fatigué, je vais ___ un peu.' }),
      pick('A2', b('Choose the right word.', 'Choisissez le bon mot.'), ['En fait', 'Actuellement', 'Éventuellement', 'Finalement'], { fr: '___, je ne suis pas d’ici : je viens de Londres.', explain: b('“Actually” = en fait. Actuellement = currently.', '« Actually » = en fait. Actuellement = en ce moment.') }),
      { kind: 'categorize', prompt: b('True friend or false friend?', 'Vrai ami ou faux ami ?'), buckets: [b('True friend (same meaning)', 'Vrai ami (même sens)'), b('False friend', 'Faux ami')], items: [{ text: 'une table', bucket: 0 }, { text: 'une librairie', bucket: 1 }, { text: 'un restaurant', bucket: 0 }, { text: 'la monnaie', bucket: 1 }, { text: 'important', bucket: 0 }, { text: 'une location', bucket: 1 }] },
      { kind: 'fill', prompt: b('Complete with the right word.', 'Complétez avec le bon mot.'), text: 'Vous avez de la ___ pour le parcomètre ? Je n’ai pas d’___ sur moi.', answers: [['monnaie'], ['argent']], choices: [['monnaie', 'location', 'librairie'], ['argent', 'monnaie', 'actuel']] },
    ],
    notes: {
      points: [
        b('actuellement = currently (actually = en fait).', 'actuellement = en ce moment (actually = en fait).'),
        b('une librairie = a bookshop (library = une bibliothèque).', 'une librairie = magasin de livres (library = une bibliothèque).'),
        b('attendre = to wait (to attend = assister à); rester = to stay (to rest = se reposer).', 'attendre = patienter (to attend = assister à) ; rester = ne pas partir (to rest = se reposer).'),
        b('la monnaie = change (money = l’argent); une location = a rental (a location = un endroit).', 'la monnaie = les pièces (money = l’argent) ; une location = le fait de louer (a location = un endroit).'),
      ],
      vocab: [['en fait', b('actually', 'en réalité')], ['la bibliothèque', b('library', 'on y emprunte des livres')], ['se reposer', b('to rest', 'ne rien faire pour récupérer')], ['l’argent', b('money', 'ce qui sert à payer')], ['un endroit', b('a place, location', 'un lieu')]],
    },
  },
  {
    id: 'false-friends-2',
    slug: { en: 'false-friends-at-work-and-school', fr: 'faux-amis-au-travail-et-a-l-ecole' },
    title: b('False friends at work and at school', 'Les faux amis au travail et à l’école'),
    summary: b('Assister, éventuellement, formation, stage, passer un examen: the ones that cause real misunderstandings.', 'Assister, éventuellement, formation, stage, passer un examen : ceux qui créent de vrais malentendus.'),
    objectives: [b('Avoid misunderstandings at work', 'Éviter les malentendus au travail'), b('Talk about studies without traps', 'Parler de ses études sans piège'), b('Use éventuellement and finalement correctly', 'Employer correctement éventuellement et finalement')],
    minutes: 13,
    steps: [
      card(b('At work', 'Au travail'), b('**assister à** une réunion = to **attend** a meeting (not to assist). “To assist” = **aider**. **éventuellement** = **possibly**, if needed (not eventually). “Eventually” = **finalement**. **une formation** = **training**. **un stage** = an **internship**. **réaliser** un projet = to **carry out** a project.', '**assister à** une réunion = y être présent. « To assist » = **aider**. **éventuellement** = **peut-être, si nécessaire**. « Eventually » = **finalement**. **une formation** = un apprentissage professionnel. **un stage** = une période en entreprise. **réaliser** un projet = le mener à bien.'), {
        examples: [{ fr: 'J’assiste à une réunion à dix heures.', tr: 'I am attending a meeting at ten.' }, { fr: 'Je peux éventuellement venir samedi.', tr: 'I can possibly come on Saturday.' }, { fr: 'Elle fait un stage dans une banque.', tr: 'She is doing an internship in a bank.' }],
      }),
      pick('B1', means, [b('I may come, if needed', 'Je viendrai peut-être, si nécessaire'), b('I will come in the end', 'Je finirai par venir'), b('I will never come', 'Je ne viendrai jamais')], { fr: 'Je viendrai éventuellement.' }),
      pick('B1', b('Choose the right word.', 'Choisissez le bon mot.'), ['aidé', 'assisté', 'attendu', 'resté'], { fr: 'Mon collègue m’a beaucoup ___ pendant ma première semaine.', explain: b('To assist someone = aider quelqu’un.', 'Apporter son aide à quelqu’un = aider.') }),
      card(b('At school', 'À l’école'), b('**passer un examen** = to **take** an exam (to pass = **réussir**). **un collège** = a middle school in France (in Québec, a **cégep** comes before university). **une licence** = a bachelor’s degree in France (a licence = **un permis**). **un professeur** teaches at any level.', '**passer un examen** = se présenter à l’examen (to pass = **réussir**). **un collège** = l’école des 11–15 ans en France (au Québec, le **cégep** précède l’université). **une licence** = un diplôme universitaire en France (a licence = **un permis**). **un professeur** enseigne à tous les niveaux.'), { variant: 'culture' }),
      pick('B1', means, [b('I am taking the TCF tomorrow', 'Je me présente au TCF demain'), b('I passed the TCF', 'J’ai réussi le TCF'), b('I am skipping the TCF', 'Je ne vais pas au TCF')], { fr: 'Je passe le TCF demain.' }),
      pick('B1', b('Choose the right word.', 'Choisissez le bon mot.'), ['réussi', 'passé', 'assisté', 'réalisé'], { fr: 'Bonne nouvelle : j’ai ___ mon examen avec 85 % !' }),
      { kind: 'match', prompt: b('Match each French word with the English idea.', 'Associez chaque mot français à l’idée anglaise.'), pairs: [['assister à', 'to attend'], ['aider', 'to assist'], ['finalement', 'eventually'], ['éventuellement', 'possibly'], ['un permis de conduire', 'a driving licence']] },
      { kind: 'fill', prompt: b('Complete with the right word.', 'Complétez avec le bon mot.'), text: 'Après ma ___ en comptabilité, j’ai fait un ___ de six mois dans une entreprise.', answers: [['formation'], ['stage']], choices: [['formation', 'location', 'licence'], ['stage', 'collège', 'examen']] },
      { kind: 'speak', prompt: b('Say it aloud.', 'Dites-le à voix haute.'), text: 'Demain, je passe un examen, et j’espère le réussir.', tr: 'Tomorrow I am taking an exam, and I hope to pass it.' },
    ],
    notes: {
      points: [
        b('assister à = to attend; aider = to assist.', 'assister à = être présent ; aider = apporter son aide.'),
        b('éventuellement = possibly; finalement = eventually.', 'éventuellement = peut-être ; finalement = à la fin.'),
        b('passer un examen = to take it; réussir = to pass it.', 'passer un examen = s’y présenter ; réussir = l’obtenir.'),
        b('une formation = training; un stage = an internship; un permis = a licence.', 'une formation = un apprentissage ; un stage = une période en entreprise ; un permis = une autorisation.'),
      ],
      vocab: [['la réunion', b('meeting', 'rencontre de travail')], ['réussir', b('to pass, to succeed', 'obtenir un bon résultat')], ['le cégep', b('pre-university college (Québec)', 'établissement avant l’université, au Québec')], ['la comptabilité', b('accounting', 'gestion des comptes')]],
    },
  },
  {
    id: 'false-friends-3',
    slug: { en: 'false-friends-feelings-and-awkward-moments', fr: 'faux-amis-sentiments-et-moments-genants' },
    title: b('Feelings and awkward moments', 'Sentiments et moments gênants'),
    summary: b('Excité, sensible, sympathique, blessé, préservatif: the false friends that make people smile, or blush.', 'Excité, sensible, sympathique, blessé, préservatif : les faux amis qui font sourire, ou rougir.'),
    objectives: [b('Express excitement without embarrassment', 'Exprimer l’enthousiasme sans gêne'), b('Describe people correctly', 'Décrire correctement une personne'), b('Avoid three famous embarrassing mistakes', 'Éviter trois erreurs gênantes célèbres')],
    minutes: 13,
    steps: [
      card(b('“I am excited”', '« I am excited »'), b('Careful: **je suis excité(e)** often has a sexual meaning in French. To say you are looking forward to something, use **J’ai hâte !** (very common in Québec), **Je suis impatient(e)** or **Je suis très content(e)**.', 'Attention : **je suis excité(e)** a souvent un sens sexuel en français. Pour dire votre enthousiasme, employez **J’ai hâte !** (très courant au Québec), **Je suis impatient(e)** ou **Je suis très content(e)**.'), {
        variant: 'trap',
        examples: [{ fr: 'J’ai hâte de commencer mon nouveau travail !', tr: 'I am excited to start my new job!' }, { fr: 'Je suis très contente de vous voir.', tr: 'I am very happy to see you.' }],
      }),
      pick('B1', b('You are looking forward to your trip. You say:', 'Vous attendez votre voyage avec impatience. Vous dites :'), ['J’ai hâte de partir en voyage !', 'Je suis excité de partir en voyage !', 'Je suis sensible de partir en voyage !', 'Je suis blessé de partir !']),
      card(b('Describing people', 'Décrire les gens'), b('**sensible** = **sensitive** (sensible = **raisonnable**). **sympathique** = **nice, friendly** (sympathetic = **compatissant**). **blessé** = **injured** (blessed = **béni**). **déçu** = **disappointed** (deceived = **trompé**). **grave** = **serious**.', '**sensible** = qui ressent fortement les émotions (sensible en anglais = **raisonnable**). **sympathique** = agréable, gentil (sympathetic = **compatissant**). **blessé** = qui a une blessure (blessed = **béni**). **déçu** = pas satisfait (deceived = **trompé**). **grave** = sérieux.'), {
        examples: [{ fr: 'Ma voisine est très sympathique.', tr: 'My neighbour is very nice.' }, { fr: 'Il est sensible : il pleure au cinéma.', tr: 'He is sensitive: he cries at the cinema.' }, { fr: 'Ce n’est pas grave !', tr: 'It doesn’t matter!' }],
      }),
      { kind: 'match', prompt: b('Match each French word with its real meaning.', 'Associez chaque mot à son vrai sens.'), pairs: [['sensible', b('sensitive', 'qui ressent beaucoup')], ['sympathique', b('nice, friendly', 'agréable et gentil')], ['blessé', b('injured', 'qui a une blessure')], ['déçu', b('disappointed', 'pas satisfait')], ['raisonnable', b('sensible, reasonable', 'qui agit avec bon sens')]] },
      pick('B1', means, [b('He was injured in the accident', 'Il a eu une blessure dans l’accident'), b('He was blessed in the accident', 'Il a été béni dans l’accident'), b('He was blamed for the accident', 'On l’a accusé de l’accident')], { fr: 'Il a été blessé dans l’accident.' }),
      card(b('Three famous embarrassing ones', 'Trois erreurs gênantes célèbres'), b('**un préservatif** is a **condom** (a preservative in food = **un agent de conservation**). **embrasser** means **to kiss** (to embarrass = **gêner**). **Je suis plein(e)** can mean drunk or pregnant (of an animal): after a meal say **Je n’ai plus faim** or **J’ai bien mangé**.', '**un préservatif** est un moyen de contraception (a preservative = **un agent de conservation**). **embrasser** signifie donner un baiser (to embarrass = **gêner**). **Je suis plein(e)** peut vouloir dire ivre : après un repas, dites **Je n’ai plus faim** ou **J’ai bien mangé**.'), { variant: 'trap' }),
      pick('B1', b('After a big dinner, you say:', 'Après un bon repas, vous dites :'), ['Merci, j’ai très bien mangé, je n’ai plus faim.', 'Merci, je suis plein.', 'Merci, je suis excité.', 'Merci, je suis blessé.']),
      pick('B1', b('Choose the right word.', 'Choisissez le bon mot.'), ['gêné', 'embrassé', 'blessé', 'excité'], { fr: 'J’ai oublié son prénom : j’étais très ___.', explain: b('Embarrassed = gêné. Embrassé = kissed.', 'Mal à l’aise = gêné. Embrassé = qui a reçu un baiser.') }),
      { kind: 'speak', prompt: b('Say it aloud.', 'Dites-le à voix haute.'), text: 'J’ai hâte de rencontrer vos amis, ils ont l’air très sympathiques.', tr: 'I am excited to meet your friends, they seem very nice.' },
    ],
    notes: {
      points: [
        b('“I’m excited” → **J’ai hâte !** / Je suis impatient(e) / Je suis très content(e).', '« I’m excited » → **J’ai hâte !** / Je suis impatient(e) / Je suis très content(e).'),
        b('sensible = sensitive; sympathique = nice; blessé = injured; déçu = disappointed.', 'sensible = qui ressent beaucoup ; sympathique = agréable ; blessé = qui a une blessure ; déçu = pas satisfait.'),
        b('un préservatif = a condom; embrasser = to kiss; gêné = embarrassed.', 'un préservatif = un contraceptif ; embrasser = donner un baiser ; gêné = mal à l’aise.'),
        b('After a meal: J’ai bien mangé / Je n’ai plus faim (not “je suis plein”).', 'Après un repas : J’ai bien mangé / Je n’ai plus faim (pas « je suis plein »).'),
      ],
      vocab: [['avoir hâte', b('to look forward to', 'attendre avec impatience')], ['gêné', b('embarrassed', 'mal à l’aise')], ['compatissant', b('sympathetic', 'qui partage la peine des autres')], ['ce n’est pas grave', b('it doesn’t matter', 'ce n’est pas important')]],
    },
  },
];

export default lessons;
