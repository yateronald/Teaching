// Le mystère du Vieux-Québec (A2 → B1): a detective story in six chapters. The
// learner is the inspector's assistant: every clue is heard, the suspects are
// questioned, and the last chapter asks who stole the painting. The story is
// fiction; the places are real streets of Québec City.
import { b, type DialogueStep, type Lesson, type McqStep, type T, type Voice } from '../../types';
import { card } from '../kit';

const hear = (voice: Voice, audio: string, prompt: T, options: T[], explain?: T): McqStep =>
  ({ kind: 'mcq', voice, audio, listen: true, prompt, options, answer: 0, ...(explain ? { explain } : {}) });
const ask = (prompt: T, options: T[], explain?: T, image?: string): McqStep =>
  ({ kind: 'mcq', prompt, options, answer: 0, ...(explain ? { explain } : {}), ...(image ? { image } : {}) });

type Speaker = DialogueStep['speakers'][number];
const DIANE: Speaker = { name: 'Diane Roy', voice: 'f2', side: 'l' };
const JULIEN: Speaker = { name: 'Julien Morin', voice: 'm', side: 'l' };
const LEA: Speaker = { name: 'Léa Bouchard', voice: 'f', side: 'l' };
const VICTOR: Speaker = { name: 'Victor Lambert', voice: 'm2', side: 'l' };

const lessons: Lesson[] = [
  {
    id: 'quebec-mystery-1',
    slug: { en: 'the-painting-has-disappeared', fr: 'le-tableau-a-disparu' },
    title: b('Chapters 1 and 2: the painting has disappeared', 'Chapitres 1 et 2 : le tableau a disparu'),
    summary: b('A painting worth 800,000 dollars vanishes from a gallery in Old Québec. Listen to the first witness and collect the clues.', 'Un tableau de 800 000 dollars disparaît d’une galerie du Vieux-Québec. Écoutez le premier témoin et rassemblez les indices.'),
    objectives: [b('Understand times and places in a statement', 'Comprendre des heures et des lieux dans un témoignage'), b('Learn the words of an investigation', 'Apprendre les mots de l’enquête'), b('Draw a conclusion from two clues', 'Tirer une conclusion de deux indices')],
    minutes: 13,
    steps: [
      card(b('Chapter 1. A cold morning on rue Saint-Louis', 'Chapitre 1. Un matin froid, rue Saint-Louis'), b('February, Old Québec. You are the new assistant of **Inspector Diane Roy**. At 8 a.m. her phone rings: at the **Galerie Morin**, the most famous painting of the season, *Le Port en hiver* by Clémence Lavoie, has disappeared. It is worth **800,000 dollars**, and it was to be sold at auction **tomorrow at 10 a.m.** Your job: listen carefully, note every detail, and find the thief.', 'Février, dans le Vieux-Québec. Vous êtes le nouvel assistant de l’**inspectrice Diane Roy**. À 8 h, son téléphone sonne : à la **Galerie Morin**, le tableau le plus célèbre de la saison, *Le Port en hiver* de Clémence Lavoie, a disparu. Il vaut **800 000 dollars** et devait être vendu aux enchères **demain à 10 h**. Votre mission : écouter attentivement, noter chaque détail et trouver le voleur.'), { image: 'mystery-gallery' }),
      { kind: 'flashcards', title: b('The words of the investigation', 'Les mots de l’enquête'), cards: [
        { fr: 'un indice', tr: b('a clue', 'un élément qui aide à trouver la vérité'), ex: 'La police cherche des indices.' },
        { fr: 'un témoin', tr: b('a witness', 'une personne qui a vu ou entendu quelque chose'), ex: 'Le témoin a vu un homme sortir.' },
        { fr: 'un suspect', tr: b('a suspect', 'une personne qui a peut-être commis le crime'), ex: 'Il y a trois suspects.' },
        { fr: 'une effraction', tr: b('a break-in', 'entrer en forçant une porte ou une fenêtre'), ex: 'Il n’y a aucune trace d’effraction.' },
        { fr: 'un alibi', tr: b('an alibi', 'la preuve qu’on était ailleurs'), ex: 'Son alibi est solide.' },
        { fr: 'le voleur', tr: b('the thief', 'la personne qui vole'), ex: 'Le voleur connaissait le code.' },
      ] },
      {
        kind: 'dialogue',
        title: b('At the gallery, 8:30 a.m.', 'À la galerie, 8 h 30'),
        scene: b('Léa Bouchard, the young restorer, found the empty frame.', 'Léa Bouchard, la jeune restauratrice, a découvert le cadre vide.'),
        speakers: [DIANE, LEA],
        lines: [
          { s: 0, fr: 'Bonjour, madame. Inspectrice Diane Roy. C’est vous qui avez découvert le vol ?', tr: 'Hello. Inspector Diane Roy. Are you the one who discovered the theft?' },
          { s: 1, fr: 'Oui. Je suis arrivée à sept heures et demie, comme tous les matins. Le cadre était vide.', tr: 'Yes. I arrived at half past seven, as every morning. The frame was empty.' },
          { s: 0, fr: 'La porte était fermée à clé ?', tr: 'Was the door locked?' },
          { s: 1, fr: 'Oui, la porte de devant et la porte de derrière. Rien n’était cassé.', tr: 'Yes, the front door and the back door. Nothing was broken.' },
          { s: 0, choose: { options: ['Et l’alarme, elle a sonné ?', 'Et le tableau, il est où ?', 'Et vous, vous avez faim ?'], answer: 0, explain: b('The alarm is the next logical question: if nothing was broken, how did the thief get in?', 'L’alarme est la question logique : si rien n’est cassé, comment le voleur est-il entré ?') } },
          { s: 1, fr: 'Non, elle n’a pas sonné. C’est ça que je ne comprends pas.', tr: 'No, it did not go off. That is what I do not understand.' },
        ],
      },
      hear('f', 'Je suis arrivée à sept heures et demie, comme tous les matins. Le cadre était vide.', b('When did Léa arrive at the gallery?', 'À quelle heure Léa est-elle arrivée à la galerie ?'), [b('At 7:30', 'À 7 h 30'), b('At 7:00', 'À 7 h'), b('At 8:30', 'À 8 h 30')], b('“Sept heures et demie” = 7:30. The inspector arrives later, at 8:30.', '« Sept heures et demie » = 7 h 30. L’inspectrice arrive plus tard, à 8 h 30.')),
      hear('f', 'Oui, la porte de devant et la porte de derrière. Rien n’était cassé.', b('What does Léa say about the doors?', 'Que dit Léa des portes ?'), [b('Both were locked and nothing was broken', 'Les deux étaient fermées et rien n’était cassé'), b('The back door was open', 'La porte de derrière était ouverte'), b('The front door was broken', 'La porte de devant était cassée')]),
      card(b('Chapter 2. The clues', 'Chapitre 2. Les indices'), b('The inspector looks at the alarm system and walks around the gallery. Listen to what she tells you: two clues, and one conclusion.', 'L’inspectrice consulte le système d’alarme et fait le tour de la galerie. Écoutez ce qu’elle vous dit : deux indices et une conclusion.'), { image: 'mystery-street' }),
      hear('f2', 'Regardez : l’alarme a été désactivée à vingt-trois heures quarante, avec le bon code. Puis elle a été réactivée à minuit cinq.', b('When was the alarm turned off?', 'À quelle heure l’alarme a-t-elle été désactivée ?'), [b('At 11:40 p.m.', 'À 23 h 40'), b('At 12:05 a.m.', 'À 0 h 05'), b('At 10:40 p.m.', 'À 22 h 40')], b('Vingt-trois heures quarante = 11:40 p.m. Minuit cinq (12:05 a.m.) is when it was turned back on.', 'Vingt-trois heures quarante = 23 h 40. Minuit cinq, c’est l’heure de la réactivation.')),
      ask(b('“Avec le bon code”: what does this tell you about the thief?', '« Avec le bon code » : qu’est-ce que cela vous apprend sur le voleur ?'), [b('The thief knew the alarm code', 'Le voleur connaissait le code de l’alarme'), b('The thief broke the alarm', 'Le voleur a cassé l’alarme'), b('The alarm did not work', 'L’alarme ne fonctionnait pas')], b('No break-in and the right code: the thief either works at the gallery or found the code somewhere. Note it down!', 'Pas d’effraction et le bon code : le voleur travaille à la galerie, ou il a trouvé le code quelque part. Notez-le !')),
      hear('f2', 'Derrière la galerie, il y a des traces de grosses bottes dans la neige. Or, il a commencé à neiger à minuit.', b('Where are the footprints?', 'Où sont les traces de pas ?'), [b('Behind the gallery, in the snow', 'Derrière la galerie, dans la neige'), b('In front of the gallery', 'Devant la galerie'), b('Inside the gallery', 'Dans la galerie')]),
      ask(b('It started to snow at midnight, and there are footprints in the fresh snow. So the thief left the gallery…', 'Il a commencé à neiger à minuit et il y a des traces dans la neige fraîche. Donc le voleur a quitté la galerie…'), [b('after midnight', 'après minuit'), b('before midnight', 'avant minuit'), b('in the morning, with Léa', 'le matin, avec Léa')], b('Footprints in fresh snow can only be made after the snow fell: after midnight. It fits the alarm, turned back on at 12:05.', 'Des traces dans la neige fraîche ne peuvent être faites qu’après la chute de neige : après minuit. Cela correspond à l’alarme, réactivée à 0 h 05.')),
      { kind: 'match', prompt: b('Match each word with its meaning.', 'Associez chaque mot à son sens.'), pairs: [['un indice', b('a clue', 'ce qui aide à trouver la vérité')], ['un témoin', b('a witness', 'une personne qui a vu quelque chose')], ['une effraction', b('a break-in', 'entrer en forçant une porte')], ['désactiver', b('to turn off', 'arrêter un système')], ['des traces', b('marks, footprints', 'ce qu’on laisse derrière soi')]] },
      card(b('Your investigation notebook', 'Votre carnet d’enquête'), b('Keep these facts in mind: you will need them in chapter 6.', 'Gardez ces faits en tête : vous en aurez besoin au chapitre 6.'), { variant: 'exam', points: [
        b('No break-in: the doors were locked, nothing broken.', 'Pas d’effraction : les portes étaient fermées, rien de cassé.'),
        b('Alarm turned off at 11:40 p.m. **with the right code**, back on at 12:05 a.m.', 'Alarme désactivée à 23 h 40 **avec le bon code**, réactivée à 0 h 05.'),
        b('Big boot prints in the fresh snow behind the gallery: the thief left after midnight.', 'Traces de grosses bottes dans la neige fraîche derrière la galerie : le voleur est parti après minuit.'),
      ] }),
      { kind: 'dictation', prompt: b('Write the inspector’s sentence.', 'Écrivez la phrase de l’inspectrice.'), text: 'Le voleur connaissait le code.', voice: 'f2' },
    ],
    notes: {
      points: [
        b('Times in French are often said on the 24-hour clock: vingt-trois heures quarante = 11:40 p.m.', 'L’heure se dit souvent sur 24 heures : vingt-trois heures quarante = 23 h 40.'),
        b('“Aucune trace d’effraction” = nobody forced a door or a window.', '« Aucune trace d’effraction » = personne n’a forcé de porte ni de fenêtre.'),
        b('In a statement, listen for the anchors: time (à…), place (derrière, devant), action (verb).', 'Dans un témoignage, écoutez les repères : l’heure (à…), le lieu (derrière, devant), l’action (le verbe).'),
        b('“Or” at the start of a sentence introduces a new fact that matters (“now, it started to snow…”).', '« Or » en début de phrase introduit un fait nouveau qui compte (« or, il a commencé à neiger… »).'),
      ],
      vocab: [['un indice', b('a clue', 'ce qui aide à trouver la vérité')], ['un témoin', b('a witness', 'une personne qui a vu')], ['une effraction', b('a break-in', 'entrer en forçant')], ['un cadre', b('a frame', 'ce qui entoure un tableau')], ['une vente aux enchères', b('an auction', 'une vente au plus offrant')], ['désactiver', b('to turn off', 'arrêter un système')]],
    },
  },
  {
    id: 'quebec-mystery-2',
    slug: { en: 'the-suspects-speak', fr: 'les-suspects-parlent' },
    title: b('Chapters 3 and 4: the suspects speak', 'Chapitres 3 et 4 : les suspects parlent'),
    summary: b('Question the gallery owner, the restorer and a rich collector, then check an alibi by phone. One of them is lying.', 'Interrogez le galeriste, la restauratrice et un riche collectionneur, puis vérifiez un alibi au téléphone. L’un d’eux ment.'),
    objectives: [b('Understand an alibi told in the past', 'Comprendre un alibi raconté au passé'), b('Compare two versions of the same evening', 'Comparer deux versions de la même soirée'), b('Follow a phone call without the text', 'Suivre un appel sans le texte')],
    minutes: 14,
    steps: [
      card(b('Chapter 3. Three people, three evenings', 'Chapitre 3. Trois personnes, trois soirées'), b('Only two people know the alarm code: **Julien Morin**, the gallery owner, and **Léa Bouchard**, the restorer. But a third name comes up: **Victor Lambert**, a collector who wanted to buy the painting before the auction. The inspector questions all three. Listen for **where** they were and **at what time**.', 'Seules deux personnes connaissent le code de l’alarme : **Julien Morin**, le galeriste, et **Léa Bouchard**, la restauratrice. Mais un troisième nom apparaît : **Victor Lambert**, un collectionneur qui voulait acheter le tableau avant la vente. L’inspectrice interroge les trois. Écoutez **où** ils étaient et **à quelle heure**.')),
      {
        kind: 'dialogue',
        title: b('Julien Morin, the gallery owner', 'Julien Morin, le galeriste'),
        speakers: [DIANE, JULIEN],
        lines: [
          { s: 0, fr: 'Monsieur Morin, où étiez-vous hier soir ?', tr: 'Mr. Morin, where were you last night?' },
          { s: 1, fr: 'J’ai dîné au restaurant avec ma sœur jusqu’à vingt-trois heures. Ensuite, je suis rentré chez moi et je me suis couché.', tr: 'I had dinner at a restaurant with my sister until 11 p.m. Then I went home and went to bed.' },
          { s: 0, fr: 'Seul ?', tr: 'Alone?' },
          { s: 1, fr: 'Oui, seul. Mais je n’ai jamais donné le code à personne, je vous le jure.', tr: 'Yes, alone. But I have never given the code to anyone, I swear.' },
          { s: 0, fr: 'Le tableau était assuré pour combien ?', tr: 'What was the painting insured for?' },
          { s: 1, fr: 'Pour un million. Mais je préfère le vendre demain, croyez-moi.', tr: 'For a million. But I would rather sell it tomorrow, believe me.' },
        ],
      },
      hear('m', 'J’ai dîné au restaurant avec ma sœur jusqu’à vingt-trois heures. Ensuite, je suis rentré chez moi et je me suis couché.', b('What did Julien do after 11 p.m.?', 'Qu’a fait Julien après 23 h ?'), [b('He went home and went to bed', 'Il est rentré chez lui et s’est couché'), b('He went back to the gallery', 'Il est retourné à la galerie'), b('He stayed with his sister', 'Il est resté avec sa sœur')], b('After 11 p.m. Julien was alone: nobody can confirm it. Note it.', 'Après 23 h, Julien était seul : personne ne peut le confirmer. Notez-le.')),
      {
        kind: 'dialogue',
        title: b('Léa Bouchard, the restorer', 'Léa Bouchard, la restauratrice'),
        speakers: [DIANE, LEA],
        lines: [
          { s: 0, fr: 'Et vous, madame Bouchard, à quelle heure êtes-vous partie hier ?', tr: 'And you, Ms. Bouchard, what time did you leave yesterday?' },
          { s: 1, fr: 'À neuf heures et demie. J’ai pris le bus de vingt et une heures quarante-cinq pour Limoilou.', tr: 'At half past nine. I took the 9:45 p.m. bus to Limoilou.' },
          { s: 0, fr: 'Pour aller où ?', tr: 'To go where?' },
          { s: 1, fr: 'À l’anniversaire de mon amie Camille. Je suis restée chez elle jusqu’à une heure du matin. Il y avait vingt personnes.', tr: 'To my friend Camille’s birthday party. I stayed at her place until 1 a.m. There were twenty people.' },
        ],
      },
      hear('f', 'À l’anniversaire de mon amie Camille. Je suis restée chez elle jusqu’à une heure du matin. Il y avait vingt personnes.', b('Why is Léa’s alibi strong?', 'Pourquoi l’alibi de Léa est-il solide ?'), [b('Twenty people saw her at a party until 1 a.m.', 'Vingt personnes l’ont vue à une fête jusqu’à 1 h du matin'), b('She was asleep at home', 'Elle dormait chez elle'), b('She was at the gallery with Julien', 'Elle était à la galerie avec Julien')], b('The alarm was turned off at 11:40 p.m.: Léa was at the party, with twenty witnesses.', 'L’alarme a été désactivée à 23 h 40 : Léa était à la fête, avec vingt témoins.')),
      {
        kind: 'dialogue',
        title: b('Victor Lambert, the collector', 'Victor Lambert, le collectionneur'),
        scene: b('He is staying at a hotel two streets from the gallery.', 'Il loge dans un hôtel à deux rues de la galerie.'),
        speakers: [DIANE, VICTOR],
        lines: [
          { s: 0, fr: 'Monsieur Lambert, vous vouliez acheter ce tableau, n’est-ce pas ?', tr: 'Mr. Lambert, you wanted to buy this painting, didn’t you?' },
          { s: 1, fr: 'Oui. J’ai proposé six cent mille dollars hier après-midi. Morin a refusé.', tr: 'Yes. I offered six hundred thousand dollars yesterday afternoon. Morin refused.' },
          { s: 0, fr: 'Et hier soir ?', tr: 'And last night?' },
          { s: 1, fr: 'Je n’ai pas quitté ma chambre. J’ai lu un peu et je me suis couché vers vingt-deux heures.', tr: 'I did not leave my room. I read a little and went to bed around 10 p.m.' },
        ],
      },
      hear('m2', 'Je n’ai pas quitté ma chambre. J’ai lu un peu et je me suis couché vers vingt-deux heures.', b('According to Victor, what did he do last night?', 'D’après Victor, qu’a-t-il fait hier soir ?'), [b('He stayed in his room and went to bed around 10 p.m.', 'Il est resté dans sa chambre et s’est couché vers 22 h'), b('He went for a walk in the snow', 'Il s’est promené dans la neige'), b('He had dinner with Julien', 'Il a dîné avec Julien')]),
      card(b('Passé composé or imparfait?', 'Passé composé ou imparfait ?'), b('In an alibi, the **passé composé** tells the actions, one after the other: *j’ai dîné, je suis rentré, je me suis couché*. The **imparfait** describes the background: *il y avait vingt personnes, la porte était fermée*. Listen to both: the actions give you the timeline.', 'Dans un alibi, le **passé composé** raconte les actions, l’une après l’autre : *j’ai dîné, je suis rentré, je me suis couché*. L’**imparfait** décrit le décor : *il y avait vingt personnes, la porte était fermée*. Écoutez les deux : les actions vous donnent la chronologie.'), { variant: 'tip' }),
      { kind: 'categorize', prompt: b('Action (passé composé) or description (imparfait)?', 'Action (passé composé) ou description (imparfait) ?'), buckets: [b('Action', 'Action'), b('Description', 'Description')], items: [{ text: 'je suis rentré', bucket: 0 }, { text: 'j’ai pris le bus', bucket: 0 }, { text: 'Morin a refusé', bucket: 0 }, { text: 'il y avait vingt personnes', bucket: 1 }, { text: 'la porte était fermée', bucket: 1 }, { text: 'il faisait froid', bucket: 1 }] },
      card(b('Chapter 4. A phone call to the hotel', 'Chapitre 4. Un appel à l’hôtel'), b('The inspector calls the hotel where Victor Lambert is staying, and puts the call on speaker. You only hear the voices: listen well, the text appears at the end.', 'L’inspectrice appelle l’hôtel où loge Victor Lambert et met le haut-parleur. Vous n’entendez que les voix : écoutez bien, le texte apparaît à la fin.'), { image: 'mystery-hotel' }),
      {
        kind: 'dialogue',
        call: true,
        title: b('Hôtel Belle-Neige, reception', 'Hôtel Belle-Neige, réception'),
        speakers: [DIANE, { name: 'Sophie, réception', voice: 'f', side: 'r' }],
        lines: [
          { s: 1, fr: 'Hôtel Belle-Neige, bonjour, Sophie à l’appareil.', tr: 'Hôtel Belle-Neige, good morning, Sophie speaking.' },
          { s: 0, fr: 'Bonjour, inspectrice Roy, police de Québec. Vous travailliez cette nuit ?', tr: 'Hello, Inspector Roy, Québec police. Were you working last night?' },
          { s: 1, fr: 'Oui, de vingt heures à six heures.', tr: 'Yes, from 8 p.m. to 6 a.m.' },
          { s: 0, fr: 'Est-ce que monsieur Lambert est sorti de l’hôtel ?', tr: 'Did Mr. Lambert leave the hotel?' },
          { s: 1, fr: 'Oui, vers vingt-trois heures quinze. Il est revenu vers minuit et demi, avec de la neige plein les bottes.', tr: 'Yes, around 11:15 p.m. He came back around half past midnight, with his boots full of snow.' },
          { s: 1, fr: 'Et il portait un grand sac noir, tout plat. Je me suis dit : c’est bizarre, à cette heure-là.', tr: 'And he was carrying a big black bag, completely flat. I thought: that is strange, at that time of night.' },
        ],
      },
      hear('f', 'Oui, vers vingt-trois heures quinze. Il est revenu vers minuit et demi, avec de la neige plein les bottes.', b('When was Victor outside the hotel?', 'Quand Victor était-il hors de l’hôtel ?'), [b('From about 11:15 p.m. to 12:30 a.m.', 'De 23 h 15 environ à minuit et demi'), b('From 10 p.m. to 11 p.m.', 'De 22 h à 23 h'), b('He never left', 'Il n’est jamais sorti')]),
      ask(b('Compare Victor’s alibi with the receptionist’s call. Who is lying?', 'Comparez l’alibi de Victor et l’appel de la réceptionniste. Qui ment ?'), [b('Victor Lambert', 'Victor Lambert'), b('Léa Bouchard', 'Léa Bouchard'), b('Sophie, the receptionist', 'Sophie, la réceptionniste')], b('Victor said: “je n’ai pas quitté ma chambre”. The receptionist saw him go out at 11:15 p.m. and come back at 12:30 a.m. with snow on his boots and a big flat bag, the size of a painting.', 'Victor a dit : « je n’ai pas quitté ma chambre ». La réceptionniste l’a vu sortir à 23 h 15 et revenir à minuit et demi, avec de la neige sur les bottes et un grand sac plat, de la taille d’un tableau.')),
      card(b('Your investigation notebook', 'Votre carnet d’enquête'), b('Where we are:', 'Où nous en sommes :'), { variant: 'exam', points: [
        b('**Léa**: at a party until 1 a.m., twenty witnesses. Solid alibi.', '**Léa** : à une fête jusqu’à 1 h du matin, vingt témoins. Alibi solide.'),
        b('**Julien**: alone at home after 11 p.m. No witness. The painting is insured for a million.', '**Julien** : seul chez lui après 23 h. Aucun témoin. Le tableau est assuré pour un million.'),
        b('**Victor**: says he stayed in his room, but went out from 11:15 p.m. to 12:30 a.m. with a big flat bag. He lied.', '**Victor** : dit qu’il est resté dans sa chambre, mais il est sorti de 23 h 15 à minuit et demi avec un grand sac plat. Il a menti.'),
        b('The question left: how could Victor know the alarm code?', 'La question qui reste : comment Victor pouvait-il connaître le code de l’alarme ?'),
      ] }),
    ],
    notes: {
      points: [
        b('An alibi is told in the passé composé (actions) and the imparfait (description).', 'Un alibi se raconte au passé composé (actions) et à l’imparfait (description).'),
        b('“Jusqu’à vingt-trois heures” = until 11 p.m.; “vers minuit et demi” = around 12:30 a.m.', '« Jusqu’à vingt-trois heures » = jusqu’à 23 h ; « vers minuit et demi » = autour de 0 h 30.'),
        b('On the phone: “X à l’appareil” = X speaking.', 'Au téléphone : « X à l’appareil » = c’est X qui parle.'),
        b('To check a statement, compare the times given by two different people.', 'Pour vérifier un témoignage, comparez les heures données par deux personnes différentes.'),
      ],
      vocab: [['le galeriste', b('the gallery owner', 'il dirige une galerie d’art')], ['la restauratrice', b('the (art) restorer', 'elle répare les tableaux anciens')], ['assuré', b('insured', 'protégé par une assurance')], ['mentir', b('to lie', 'ne pas dire la vérité')], ['un sac plat', b('a flat bag', 'un sac peu épais')]],
    },
  },
  {
    id: 'quebec-mystery-3',
    slug: { en: 'the-code-and-the-culprit', fr: 'le-code-et-le-coupable' },
    title: b('Chapters 5 and 6: the code and the culprit', 'Chapitres 5 et 6 : le code et le coupable'),
    summary: b('Find out how the thief got the alarm code, name the culprit, and lead the final interview until he confesses.', 'Découvrez comment le voleur a obtenu le code de l’alarme, désignez le coupable et menez le dernier interrogatoire jusqu’aux aveux.'),
    objectives: [b('Combine clues to reach a conclusion', 'Combiner des indices pour conclure'), b('Ask the right questions in an interview', 'Poser les bonnes questions dans un interrogatoire'), b('Write a short report in the past', 'Rédiger un court rapport au passé')],
    minutes: 13,
    steps: [
      card(b('Chapter 5. The yellow note', 'Chapitre 5. Le papier jaune'), b('Back at the gallery, the inspector asks Léa and Julien one last question: where is the alarm code written?', 'De retour à la galerie, l’inspectrice pose une dernière question à Léa et à Julien : où le code de l’alarme est-il écrit ?'), { image: 'mystery-office' }),
      hear('f', 'Le code change tous les mois. Julien ne s’en souvient jamais, alors il l’écrit sur un papier jaune, collé sous la lampe de son bureau.', b('Where does Julien keep the code?', 'Où Julien garde-t-il le code ?'), [b('On a yellow note under his desk lamp', 'Sur un papier jaune sous la lampe de son bureau'), b('In his phone', 'Dans son téléphone'), b('He knows it by heart', 'Il le connaît par cœur')], b('“Il ne s’en souvient jamais” = he never remembers it. A dangerous habit.', '« Il ne s’en souvient jamais » : une habitude dangereuse.')),
      hear('m', 'Hier, vers seize heures, j’ai montré le tableau à monsieur Lambert. Ensuite, je l’ai laissé seul cinq minutes dans mon bureau : je suis allé chercher le certificat dans le coffre-fort.', b('What happened yesterday at 4 p.m.?', 'Que s’est-il passé hier à 16 h ?'), [b('Victor was left alone in Julien’s office for five minutes', 'Victor est resté seul cinq minutes dans le bureau de Julien'), b('Julien gave the code to Victor', 'Julien a donné le code à Victor'), b('Léa showed the painting to Victor', 'Léa a montré le tableau à Victor')]),
      ask(b('So how did the thief know the alarm code?', 'Alors, comment le voleur connaissait-il le code de l’alarme ?'), [b('He read it on the note while he was alone in the office', 'Il l’a lu sur le papier quand il était seul dans le bureau'), b('Léa told him at the party', 'Léa le lui a dit à la fête'), b('The receptionist gave it to him', 'La réceptionniste le lui a donné')], b('Five minutes alone in the office, and the code written under the lamp: that was enough.', 'Cinq minutes seul dans le bureau et le code écrit sous la lampe : cela suffisait.')),
      ask(b('Chapter 6. Time to decide: who stole the painting?', 'Chapitre 6. L’heure de décider : qui a volé le tableau ?'), [b('Victor Lambert', 'Victor Lambert'), b('Julien Morin', 'Julien Morin'), b('Léa Bouchard', 'Léa Bouchard')], b('Every clue points to Victor: he wanted the painting and was refused; he saw the code in the office; he lied about his evening; he was outside from 11:15 p.m. to 12:30 a.m. (alarm off at 11:40, footprints after midnight); he came back with snowy boots and a flat bag. Julien had a motive (the insurance), but no clue places him at the gallery.', 'Tous les indices désignent Victor : il voulait le tableau et on le lui a refusé ; il a vu le code dans le bureau ; il a menti sur sa soirée ; il était dehors de 23 h 15 à minuit et demi (alarme coupée à 23 h 40, traces après minuit) ; il est revenu avec des bottes pleines de neige et un sac plat. Julien avait un mobile (l’assurance), mais aucun indice ne le place à la galerie.'), 'mystery-gallery'),
      {
        kind: 'dialogue',
        title: b('The last interview', 'Le dernier interrogatoire'),
        scene: b('You lead the questions. Choose what you say to Victor Lambert.', 'C’est vous qui posez les questions. Choisissez ce que vous dites à Victor Lambert.'),
        speakers: [VICTOR, { name: 'Vous', voice: 'f2', side: 'r' }],
        lines: [
          { s: 0, fr: 'Je vous l’ai déjà dit : je n’ai pas quitté ma chambre.', tr: 'I have already told you: I did not leave my room.' },
          { s: 1, choose: { options: ['La réceptionniste vous a vu sortir à vingt-trois heures quinze.', 'Vous aimez la neige, monsieur Lambert ?', 'Très bien, merci pour votre temps.'], answer: 0, explain: b('Confront him with a precise fact: the time he went out.', 'Confrontez-le à un fait précis : l’heure de sa sortie.') } },
          { s: 0, fr: 'Bon… je suis sorti prendre l’air. C’est interdit ?', tr: 'Well… I went out for some fresh air. Is that forbidden?' },
          { s: 1, choose: { options: ['Avec un grand sac plat, à minuit et demi ?', 'Vous avez raison, ce n’est pas interdit.', 'Il faisait beau hier soir ?'], answer: 0, explain: b('The flat bag is the clue he cannot explain.', 'Le sac plat est l’indice qu’il ne peut pas expliquer.') } },
          { s: 0, fr: 'Ce sac… c’était pour mes affaires.', tr: 'That bag… it was for my things.' },
          { s: 1, choose: { options: ['Et le code de l’alarme, vous l’avez lu sous la lampe du bureau, n’est-ce pas ?', 'D’accord, je vous crois.', 'Où avez-vous acheté ce sac ?'], answer: 0 } },
          { s: 0, fr: 'D’accord, d’accord… C’est moi. Ce tableau appartenait à mon grand-père. Il a dû le vendre quand il était pauvre. Je voulais seulement le ramener dans la famille.', tr: 'All right, all right… It was me. This painting belonged to my grandfather. He had to sell it when he was poor. I only wanted to bring it back into the family.' },
          { s: 0, fr: 'Il est dans ma chambre, derrière l’armoire.', tr: 'It is in my room, behind the wardrobe.' },
        ],
      },
      hear('m2', 'Ce tableau appartenait à mon grand-père. Il a dû le vendre quand il était pauvre. Je voulais seulement le ramener dans la famille.', b('Why did Victor steal the painting?', 'Pourquoi Victor a-t-il volé le tableau ?'), [b('It once belonged to his grandfather', 'Il appartenait autrefois à son grand-père'), b('To sell it for a million', 'Pour le vendre un million'), b('To help Julien with the insurance', 'Pour aider Julien avec l’assurance')]),
      { kind: 'fill', prompt: b('Complete the inspector’s report with the right tense.', 'Complétez le rapport de l’inspectrice avec le bon temps.'), text: 'Hier soir, M. Lambert ___ (sortir) de l’hôtel à 23 h 15. Il ___ (faire) très froid et il ___ (neiger) depuis minuit quand il est revenu.', answers: [['est sorti'], ['faisait'], ['neigeait']], choices: [['est sorti', 'sortait'], ['a fait', 'faisait'], ['a neigé', 'neigeait']], explain: b('He went out (an action: passé composé). It was cold, it had been snowing (the background: imparfait).', 'Il est sorti (une action : passé composé). Il faisait froid, il neigeait (le décor : imparfait).') },
      { kind: 'order', prompt: b('Build the last sentence of the case.', 'Construisez la dernière phrase de l’affaire.'), words: ['Le', 'tableau', 'était', 'derrière', 'l’armoire', 'de', 'sa', 'chambre.'], tr: 'The painting was behind the wardrobe in his room.' },
      { kind: 'write', prompt: b('Write the short report of the case.', 'Rédigez le court rapport de l’affaire.'), task: b('In 50 to 80 words, say what was stolen, when, how the thief got the code, and how you found him. Use the passé composé and the imparfait.', 'En 50 à 80 mots, dites ce qui a été volé, quand, comment le voleur a obtenu le code et comment vous l’avez trouvé. Utilisez le passé composé et l’imparfait.'), min: 50, max: 80, checklist: [b('What and when', 'Quoi et quand'), b('How the thief knew the code', 'Comment le voleur connaissait le code'), b('The clue that proved he lied', 'L’indice qui prouve qu’il a menti'), b('Passé composé + imparfait', 'Passé composé + imparfait')], phrases: ['Dans la nuit du…', 'Le voleur a lu le code…', 'Il a menti, car…', 'Finalement, il a avoué.'], model: 'Dans la nuit de lundi à mardi, le tableau Le Port en hiver a disparu de la Galerie Morin. L’alarme a été coupée à 23 h 40 avec le bon code. Victor Lambert avait lu ce code sous la lampe du bureau, l’après-midi. Il a dit qu’il était dans sa chambre, mais la réceptionniste l’a vu sortir avec un grand sac plat. Il a finalement avoué : le tableau était derrière son armoire.', modelNote: b('Notice how each sentence answers one question: what, how, why we knew, the end.', 'Remarquez comme chaque phrase répond à une question : quoi, comment, comment on a su, la fin.') },
    ],
    notes: {
      points: [
        b('To conclude, combine the clues: motive + opportunity + a lie + material evidence.', 'Pour conclure, combinez les indices : mobile + occasion + mensonge + preuve matérielle.'),
        b('In an interview, confront a lie with a precise fact (a time, an object).', 'Dans un interrogatoire, confrontez un mensonge à un fait précis (une heure, un objet).'),
        b('A report: passé composé for what happened, imparfait for the circumstances.', 'Un rapport : passé composé pour ce qui s’est passé, imparfait pour les circonstances.'),
        b('“Avouer” = to confess; “un mobile” = a motive.', '« Avouer » = reconnaître sa faute ; « un mobile » = la raison d’un crime.'),
      ],
      vocab: [['le coupable', b('the culprit', 'la personne qui a commis la faute')], ['avouer', b('to confess', 'reconnaître ce qu’on a fait')], ['un mobile', b('a motive', 'la raison d’un crime')], ['le coffre-fort', b('the safe', 'une boîte blindée pour les objets précieux')], ['l’armoire', b('the wardrobe', 'un grand meuble pour les vêtements')]],
    },
  },
];

export default lessons;
