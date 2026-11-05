import { b, type Lesson } from '../../types';
import { card, pick } from '../kit';

const lessons: Lesson[] = [
  {
    id: 'body-health-1',
    slug: { en: 'the-body', fr: 'le-corps' },
    title: b('The parts of the body', 'Les parties du corps'),
    summary: b('Name the main parts of the body and use them in simple sentences.', 'Nommer les principales parties du corps et les employer dans des phrases simples.'),
    objectives: [b('Name twenty parts of the body', 'Nommer vingt parties du corps'), b('Use le / la / les with the body', 'Employer le / la / les avec le corps'), b('Describe simple gestures', 'Décrire des gestes simples')],
    minutes: 12,
    steps: [
      { kind: 'flashcards', title: b('The body', 'Le corps'), cards: [{ fr: 'la tête', tr: 'head' }, { fr: 'les yeux', tr: 'eyes' }, { fr: 'le nez', tr: 'nose' }, { fr: 'la bouche', tr: 'mouth' }, { fr: 'les oreilles', tr: 'ears' }, { fr: 'les dents', tr: 'teeth' }, { fr: 'le cou', tr: 'neck' }, { fr: 'le dos', tr: 'back' }, { fr: 'le ventre', tr: 'stomach' }, { fr: 'le bras', tr: 'arm' }, { fr: 'la main', tr: 'hand' }, { fr: 'la jambe', tr: 'leg' }, { fr: 'le pied', tr: 'foot' }, { fr: 'le genou', tr: 'knee' }] },
      card(b('Un œil, des yeux', 'Un œil, des yeux'), b('Some plurals are irregular: **un œil → des yeux**, **un genou → des genoux**. With the body, French uses **le / la / les**, not “my”: Il lève **la** main (He raises his hand). J’ai **les** yeux bleus.', 'Certains pluriels sont irréguliers : **un œil → des yeux**, **un genou → des genoux**. Avec le corps, on emploie souvent **le / la / les** plutôt que le possessif : Il lève **la** main. J’ai **les** yeux bleus.'), {
        examples: [{ fr: 'Elle a les yeux verts et les cheveux longs.', tr: 'She has green eyes and long hair.' }, { fr: 'Levez la main, s’il vous plaît.', tr: 'Raise your hand, please.' }],
      }),
      { kind: 'match', prompt: b('Match each part with its English name.', 'Associez chaque partie à son équivalent.'), pairs: [['la tête', 'head'], ['le dos', 'back'], ['la main', 'hand'], ['le genou', 'knee'], ['le ventre', 'stomach']] },
      pick('A1', b('What is the plural of “un œil”?', 'Quel est le pluriel de « un œil » ?'), ['des yeux', 'des œils', 'des œuils', 'des yeus']),
      pick('A1', b('Choose the right article.', 'Choisissez le bon article.'), ['les', 'mes', 'des', 'la'], { fr: 'Il a ___ cheveux noirs.' }),
      pick('A1', b('What do you hear with?', 'Avec quoi entend-on ?'), [b('les oreilles', 'les oreilles'), b('les yeux', 'les yeux'), b('le nez', 'le nez'), b('la bouche', 'la bouche')]),
      { kind: 'order', prompt: b('Build the sentence.', 'Construisez la phrase.'), words: ['Elle', 'a', 'les', 'yeux', 'bleus.'], tr: 'She has blue eyes.' },
      { kind: 'speak', prompt: b('Say it aloud.', 'Dites-le à voix haute.'), text: 'J’ai les yeux marron et les cheveux courts.', tr: 'I have brown eyes and short hair.' },
    ],
    notes: {
      points: [
        b('Irregular plurals: un œil → des yeux; un genou → des genoux.', 'Pluriels irréguliers : un œil → des yeux ; un genou → des genoux.'),
        b('With the body, French often uses le / la / les: lever la main.', 'Avec le corps, on emploie souvent le / la / les : lever la main.'),
        b('Describe someone: avoir les yeux… / les cheveux…', 'Décrire quelqu’un : avoir les yeux… / les cheveux…'),
        b('Les cheveux (hair) is always plural.', 'Les cheveux est toujours au pluriel.'),
      ],
      vocab: [['les cheveux', b('hair', 'poils de la tête')], ['lever', b('to raise', 'monter')], ['court / long', b('short / long', 'petit / grand en longueur')], ['le visage', b('face', 'figure')]],
    },
  },
  {
    id: 'body-health-2',
    slug: { en: 'saying-where-it-hurts', fr: 'dire-ou-on-a-mal' },
    title: b('Saying where it hurts', 'Dire où on a mal'),
    summary: b('Say that you are ill and where it hurts with avoir mal à, and describe simple symptoms.', 'Dire que vous êtes malade et où vous avez mal avec avoir mal à, et décrire des symptômes simples.'),
    objectives: [b('Use avoir mal au / à la / aux', 'Employer avoir mal au / à la / aux'), b('Describe common symptoms', 'Décrire des symptômes courants'), b('Say since when', 'Dire depuis quand')],
    minutes: 13,
    steps: [
      card(b('Avoir mal à', 'Avoir mal à'), b('To say it hurts: **avoir mal** + **à** + body part. Contractions: à + le = **au**, à + les = **aux**. J’ai mal **à la** tête, **au** ventre, **aux** dents, **à l’**oreille.', 'Pour dire qu’on a mal : **avoir mal** + **à** + partie du corps. Contractions : à + le = **au**, à + les = **aux**. J’ai mal **à la** tête, **au** ventre, **aux** dents, **à l’**oreille.'), {
        examples: [{ fr: 'J’ai mal à la tête.', tr: 'I have a headache.' }, { fr: 'Il a mal au dos depuis hier.', tr: 'He has had back pain since yesterday.' }, { fr: 'Elle a mal aux dents.', tr: 'She has toothache.' }],
      }),
      pick('A1', b('Choose the right word.', 'Choisissez le bon mot.'), ['au', 'à la', 'aux', 'à l’'], { fr: 'J’ai mal ___ ventre.' }),
      pick('A1', b('Choose the right word.', 'Choisissez le bon mot.'), ['aux', 'au', 'à la', 'des'], { fr: 'Elle a mal ___ pieds.' }),
      pick('A1', b('Choose the right word.', 'Choisissez le bon mot.'), ['à la', 'au', 'aux', 'de la'], { fr: 'Tu as mal ___ gorge ?' }),
      card(b('Common symptoms', 'Les symptômes courants'), b('**J’ai de la fièvre** (a temperature), **je tousse** (I’m coughing), **j’ai le rhume** (a cold), **j’ai la grippe** (flu), **je suis fatigué(e)**, **j’ai la nausée**. Since when: **depuis** + time: depuis deux jours.', '**J’ai de la fièvre**, **je tousse**, **j’ai le rhume**, **j’ai la grippe**, **je suis fatigué(e)**, **j’ai la nausée**. Depuis quand : **depuis** + durée : depuis deux jours.'), {
        examples: [{ fr: 'Je tousse et j’ai de la fièvre depuis deux jours.', tr: 'I’ve been coughing and had a temperature for two days.' }, { fr: 'Je crois que j’ai la grippe.', tr: 'I think I have the flu.' }],
      }),
      { kind: 'match', prompt: b('Match each symptom with its meaning.', 'Associez chaque symptôme à son sens.'), pairs: [['J’ai de la fièvre.', b('I have a temperature.', 'Ma température est élevée.')], ['Je tousse.', b('I am coughing.', 'Je fais « keuf keuf ».')], ['J’ai le rhume.', b('I have a cold.', 'J’ai le nez qui coule.')], ['J’ai la nausée.', b('I feel sick.', 'J’ai envie de vomir.')]] },
      { kind: 'fill', prompt: b('Complete.', 'Complétez.'), text: 'J’ai mal ___ tête ___ ce matin.', answers: [['à la'], ['depuis']] },
      { kind: 'speak', prompt: b('Say it aloud.', 'Dites-le à voix haute.'), text: 'Je tousse et j’ai de la fièvre depuis deux jours.', tr: 'I’ve been coughing and had a temperature for two days.' },
    ],
    notes: {
      points: [
        b('Avoir mal à: au (le), à la, à l’, aux (les).', 'Avoir mal à : au (le), à la, à l’, aux (les).'),
        b('J’ai mal à la tête / au dos / aux dents.', 'J’ai mal à la tête / au dos / aux dents.'),
        b('Symptoms: j’ai de la fièvre, je tousse, j’ai le rhume, j’ai la grippe.', 'Symptômes : j’ai de la fièvre, je tousse, j’ai le rhume, j’ai la grippe.'),
        b('Since when: depuis + duration (depuis deux jours).', 'Depuis quand : depuis + durée (depuis deux jours).'),
      ],
      vocab: [['la gorge', b('throat', 'intérieur du cou')], ['la fièvre', b('fever, temperature', 'température élevée')], ['tousser', b('to cough', 'faire sortir l’air brusquement')], ['malade', b('ill, sick', 'pas en bonne santé')], ['la grippe', b('flu', 'infection saisonnière')]],
    },
  },
  {
    id: 'body-health-3',
    slug: { en: 'at-the-doctor-and-pharmacy', fr: 'chez-le-medecin-et-a-la-pharmacie' },
    title: b('At the doctor and the pharmacy', 'Chez le médecin et à la pharmacie'),
    summary: b('Make an appointment, explain your problem and understand the doctor’s and pharmacist’s advice.', 'Prendre rendez-vous, expliquer votre problème et comprendre les conseils du médecin et du pharmacien.'),
    objectives: [b('Make a medical appointment', 'Prendre un rendez-vous médical'), b('Understand simple instructions', 'Comprendre des consignes simples'), b('Ask the pharmacist for help', 'Demander conseil au pharmacien')],
    minutes: 13,
    steps: [
      card(b('Instructions you will hear', 'Les consignes que vous entendrez'), b('The doctor uses the imperative or **il faut**: **Ouvrez la bouche.** **Respirez fort.** **Prenez un comprimé trois fois par jour.** **Il faut vous reposer.** **Buvez beaucoup d’eau.**', 'Le médecin emploie l’impératif ou **il faut** : **Ouvrez la bouche.** **Respirez fort.** **Prenez un comprimé trois fois par jour.** **Il faut vous reposer.** **Buvez beaucoup d’eau.**'), {
        examples: [{ fr: 'Ouvrez la bouche et dites « ah ».', tr: 'Open your mouth and say “ah”.' }, { fr: 'Prenez un comprimé matin et soir pendant cinq jours.', tr: 'Take one tablet morning and evening for five days.' }, { fr: 'Il faut vous reposer et boire beaucoup d’eau.', tr: 'You need to rest and drink plenty of water.' }],
      }),
      { kind: 'dialogue', title: b('At the clinic', 'À la clinique'), scene: b('Choose the patient’s best reply.', 'Choisissez la meilleure réponse de la patiente.'), speakers: [{ name: 'Médecin', voice: 'm2', side: 'l' }, { name: 'Patiente', voice: 'f', side: 'r' }], lines: [
        { s: 0, fr: 'Bonjour madame. Qu’est-ce qui ne va pas ?', tr: 'Hello madam. What’s wrong?' },
        { s: 1, choose: { options: ['J’ai mal à la gorge et j’ai de la fièvre depuis hier.', 'Ça va bien, merci.', 'Je suis la gorge.'], answer: 0 } },
        { s: 0, fr: 'Ouvrez la bouche… Oui, c’est une angine. Vous avez des allergies ?', tr: 'Open your mouth… Yes, it’s tonsillitis. Do you have any allergies?' },
        { s: 1, choose: { options: ['Non, je n’ai pas d’allergies.', 'Oui, j’ai mal.', 'Je ne sais pas, peut-être demain.'], answer: 0 } },
        { s: 0, fr: 'Prenez ce médicament trois fois par jour, et reposez-vous.', tr: 'Take this medicine three times a day, and rest.' },
      ] },
      pick('A1', b('“Prenez un comprimé trois fois par jour” means…', '« Prenez un comprimé trois fois par jour » signifie…'), [b('take one tablet three times a day', 'un comprimé, trois fois chaque jour'), b('take three tablets once a day', 'trois comprimés une fois'), b('take one tablet every three days', 'un comprimé tous les trois jours'), b('buy three tablets', 'acheter trois comprimés')]),
      pick('A1', b('How do you make an appointment?', 'Comment prendre rendez-vous ?'), ['Bonjour, je voudrais prendre rendez-vous avec le docteur Roy.', 'Bonjour, je veux le docteur maintenant.', 'Docteur, rendez-vous.', 'Le docteur est malade ?']),
      pick('A1', b('At the pharmacy, you ask for advice:', 'À la pharmacie, vous demandez conseil :'), ['Qu’est-ce que vous me conseillez pour le rhume ?', 'Je conseille le rhume.', 'Le rhume, c’est où ?', 'Vous avez le rhume ?']),
      card(b('Emergency numbers', 'Les numéros d’urgence'), b('In Canada: **911**. In France: **15** (SAMU), **112** (Europe). In Québec, **811 (Info-Santé)** gives health advice by phone, day and night.', 'Au Canada : **911**. En France : **15** (SAMU), **112** (Europe). Au Québec, le **811 (Info-Santé)** donne des conseils santé par téléphone, jour et nuit.'), { variant: 'culture' }),
      { kind: 'speak', prompt: b('Say it aloud.', 'Dites-le à voix haute.'), text: 'Bonjour, je voudrais prendre rendez-vous avec un médecin, s’il vous plaît.', tr: 'Hello, I’d like to make an appointment with a doctor, please.' },
    ],
    notes: {
      points: [
        b('Doctor’s instructions: imperative (Ouvrez, Respirez, Prenez) or il faut + infinitive.', 'Consignes du médecin : impératif (Ouvrez, Respirez, Prenez) ou il faut + infinitif.'),
        b('Dosage: un comprimé trois fois par jour, pendant cinq jours.', 'Posologie : un comprimé trois fois par jour, pendant cinq jours.'),
        b('Appointment: Je voudrais prendre rendez-vous avec…', 'Rendez-vous : Je voudrais prendre rendez-vous avec…'),
        b('Emergencies: 911 (Canada), 15 / 112 (France); 811 Info-Santé (Québec).', 'Urgences : 911 (Canada), 15 / 112 (France) ; 811 Info-Santé (Québec).'),
      ],
      vocab: [['le comprimé', b('tablet', 'médicament à avaler')], ['l’ordonnance (f.)', b('prescription', 'papier du médecin')], ['se reposer', b('to rest', 'ne rien faire')], ['l’angine (f.)', b('tonsillitis, sore throat', 'infection de la gorge')], ['conseiller', b('to advise', 'recommander')]],
    },
  },
];

export default lessons;
