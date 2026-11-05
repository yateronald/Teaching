import { b, type Lesson } from '../../types';
import { card, pick } from '../kit';

const lessons: Lesson[] = [
  {
    id: 'feelings-personality-1',
    slug: { en: 'feelings-and-emotions', fr: 'sentiments-et-emotions' },
    title: b('Feelings and emotions', 'Les sentiments et les émotions'),
    summary: b('Say how you feel with être and avoir: je suis content, j’ai peur.', 'Dire comment vous vous sentez avec être et avoir : je suis content, j’ai peur.'),
    objectives: [b('Name twelve feelings', 'Nommer douze sentiments'), b('Use être + adjective and avoir + noun', 'Employer être + adjectif et avoir + nom'), b('Ask how someone feels', 'Demander comment quelqu’un se sent')],
    minutes: 12,
    steps: [
      card(b('Être or avoir?', 'Être ou avoir ?'), b('**Être** + adjective (agrees): je suis **content(e)**, **triste**, **fatigué(e)**, **stressé(e)**, **fier / fière**. **Avoir** + noun (no agreement): j’ai **peur**, j’ai **faim**, j’ai **soif**, j’ai **honte**, j’ai **hâte** (I can’t wait).', '**Être** + adjectif (accordé) : je suis **content(e)**, **triste**, **fatigué(e)**, **stressé(e)**, **fier / fière**. **Avoir** + nom (sans accord) : j’ai **peur**, j’ai **faim**, j’ai **soif**, j’ai **honte**, j’ai **hâte**.'), {
        examples: [{ fr: 'Je suis très contente de te voir !', tr: 'I’m very happy to see you!' }, { fr: 'Il a peur des chiens.', tr: 'He is afraid of dogs.' }, { fr: 'J’ai hâte de commencer mon nouveau travail.', tr: 'I can’t wait to start my new job.' }],
      }),
      { kind: 'categorize', prompt: b('Être or avoir?', 'Être ou avoir ?'), buckets: [b('je suis…', 'je suis…'), b('j’ai…', 'j’ai…')], items: [{ text: 'triste', bucket: 0 }, { text: 'peur', bucket: 1 }, { text: 'fatigué', bucket: 0 }, { text: 'faim', bucket: 1 }, { text: 'heureux', bucket: 0 }, { text: 'hâte', bucket: 1 }] },
      pick('A2', b('Choose the right verb.', 'Choisissez le bon verbe.'), ['a', 'est', 'fait', 'va'], { fr: 'Ma fille ___ peur du noir.' }),
      pick('A2', b('Choose the right form.', 'Choisissez la bonne forme.'), ['contente', 'content', 'contents', 'contentes'], { fr: 'Marie est très ___ de son résultat.' }),
      pick('A2', b('“J’ai hâte” means…', '« J’ai hâte » signifie…'), [b('I can’t wait', 'j’attends avec impatience'), b('I am in a hurry', 'je suis pressé'), b('I hate', 'je déteste'), b('I am ashamed', 'j’ai honte')]),
      { kind: 'match', prompt: b('Match each feeling with its meaning.', 'Associez chaque sentiment à son sens.'), pairs: [['heureux', 'happy'], ['inquiet', 'worried'], ['déçu', 'disappointed'], ['fier', 'proud'], ['en colère', 'angry']] },
      { kind: 'speak', prompt: b('Say it aloud.', 'Dites-le à voix haute.'), text: 'Je suis un peu stressé, mais j’ai hâte de commencer.', tr: 'I’m a bit stressed, but I can’t wait to start.' },
    ],
    notes: {
      points: [
        b('Être + adjective (agrees): je suis content(e), triste, fatigué(e).', 'Être + adjectif (accordé) : je suis content(e), triste, fatigué(e).'),
        b('Avoir + noun: j’ai peur, faim, soif, honte, hâte.', 'Avoir + nom : j’ai peur, faim, soif, honte, hâte.'),
        b('Avoir peur de + noun / infinitive: j’ai peur des chiens.', 'Avoir peur de + nom / infinitif : j’ai peur des chiens.'),
        b('Ask: Comment tu te sens ? Ça va ?', 'Demander : Comment tu te sens ? Ça va ?'),
      ],
      vocab: [['inquiet / inquiète', b('worried', 'qui se fait du souci')], ['déçu', b('disappointed', 'pas satisfait')], ['fier / fière', b('proud', 'content de soi')], ['la honte', b('shame', 'gêne')], ['en colère', b('angry', 'fâché')]],
    },
  },
  {
    id: 'feelings-personality-2',
    slug: { en: 'describing-personality', fr: 'decrire-la-personnalite' },
    title: b('Describing personality', 'Décrire la personnalité'),
    summary: b('Describe someone’s character with adjectives and their feminine forms.', 'Décrire le caractère de quelqu’un avec des adjectifs et leurs formes féminines.'),
    objectives: [b('Use twenty character adjectives', 'Employer vingt adjectifs de caractère'), b('Form irregular feminines: -eux / -euse, -if / -ive', 'Former les féminins irréguliers : -eux / -euse, -if / -ive'), b('Nuance with très, assez, un peu, trop', 'Nuancer avec très, assez, un peu, trop')],
    minutes: 13,
    steps: [
      card(b('Feminine endings', 'Les terminaisons du féminin'), b('Regular: + **e** (patient → patiente). **-eux → -euse** (sérieux / sérieuse, généreux / généreuse). **-if → -ive** (sportif / sportive, créatif / créative). **-on → -onne** (bon / bonne). **-el → -elle** (naturel / naturelle). Ending in -e: no change (timide, sympathique).', 'Régulier : + **e** (patient → patiente). **-eux → -euse**. **-if → -ive**. **-on → -onne**. **-el → -elle**. Terminé par -e : pas de changement (timide, sympathique).'), {
        examples: [{ fr: 'Mon frère est sérieux, ma sœur est sérieuse aussi.', tr: 'My brother is serious, my sister is serious too.' }, { fr: 'Elle est sportive et très généreuse.', tr: 'She is sporty and very generous.' }],
      }),
      { kind: 'match', prompt: b('Match the masculine with the feminine.', 'Associez le masculin au féminin.'), pairs: [['généreux', 'généreuse'], ['sportif', 'sportive'], ['bon', 'bonne'], ['naturel', 'naturelle'], ['timide', 'timide']] },
      pick('A2', b('Choose the feminine.', 'Choisissez le féminin.'), ['curieuse', 'curieux', 'curieure', 'curieuxe'], { fr: 'Ma fille est très ___.' }),
      pick('A2', b('Choose the feminine.', 'Choisissez le féminin.'), ['active', 'actif', 'activeuse', 'actife'], { fr: 'Ma grand-mère est encore très ___.' }),
      card(b('Nuance', 'Nuancer'), b('**très** (very), **assez** (quite), **un peu** (a bit, often negative), **trop** (too, negative), **pas du tout** (not at all). To be polite: **Il est un peu timide** sounds kinder than **Il est timide**.', '**très**, **assez**, **un peu** (souvent négatif), **trop** (négatif), **pas du tout**. Par politesse : **Il est un peu timide** est plus doux que **Il est timide**.'), { variant: 'tip' }),
      { kind: 'categorize', prompt: b('Positive or negative quality?', 'Qualité ou défaut ?'), buckets: [b('Quality', 'Qualité'), b('Flaw', 'Défaut')], items: [{ text: 'généreux', bucket: 0 }, { text: 'paresseux', bucket: 1 }, { text: 'patient', bucket: 0 }, { text: 'égoïste', bucket: 1 }, { text: 'honnête', bucket: 0 }, { text: 'impoli', bucket: 1 }] },
      { kind: 'fill', prompt: b('Write the feminine.', 'Écrivez le féminin.'), text: 'Mon père est patient et sérieux. Ma mère est ___ et ___ aussi.', answers: [['patiente'], ['sérieuse']] },
      { kind: 'speak', prompt: b('Say it aloud.', 'Dites-le à voix haute.'), text: 'Ma meilleure amie est drôle, généreuse et un peu bavarde.', tr: 'My best friend is funny, generous and a bit talkative.' },
    ],
    notes: {
      points: [
        b('Feminine: + e; -eux → -euse; -if → -ive; -on → -onne; -el → -elle.', 'Féminin : + e ; -eux → -euse ; -if → -ive ; -on → -onne ; -el → -elle.'),
        b('Adjectives ending in -e do not change: timide, sympathique, honnête.', 'Les adjectifs en -e ne changent pas : timide, sympathique, honnête.'),
        b('Nuance: très, assez, un peu, trop, pas du tout.', 'Nuance : très, assez, un peu, trop, pas du tout.'),
        b('“Un peu” softens a flaw: il est un peu timide.', '« Un peu » adoucit un défaut : il est un peu timide.'),
      ],
      vocab: [['bavard', b('talkative', 'qui parle beaucoup')], ['paresseux', b('lazy', 'qui n’aime pas travailler')], ['drôle', b('funny', 'qui fait rire')], ['honnête', b('honest', 'qui ne ment pas')], ['égoïste', b('selfish', 'qui pense seulement à soi')]],
    },
  },
  {
    id: 'feelings-personality-3',
    slug: { en: 'describing-someone', fr: 'decrire-quelqu-un' },
    title: b('Describing someone', 'Décrire quelqu’un'),
    summary: b('Describe a person’s appearance and character in a short portrait.', 'Décrire l’apparence et le caractère d’une personne dans un court portrait.'),
    objectives: [b('Describe physical appearance', 'Décrire l’apparence physique'), b('Combine appearance and character', 'Combiner apparence et caractère'), b('Write a short portrait', 'Écrire un court portrait')],
    minutes: 13,
    steps: [
      card(b('Appearance', 'L’apparence'), b('**Il / Elle est** grand(e), petit(e), mince, de taille moyenne. **Il / Elle a** les cheveux courts / longs / bouclés / blonds / bruns, les yeux bleus / verts / marron, une barbe, des lunettes. **Il / Elle porte** des lunettes.', '**Il / Elle est** grand(e), petit(e), mince, de taille moyenne. **Il / Elle a** les cheveux courts / longs / bouclés / blonds / bruns, les yeux bleus / verts / marron, une barbe, des lunettes. **Il / Elle porte** des lunettes.'), {
        examples: [{ fr: 'Mon voisin est grand et mince. Il a les cheveux gris et une barbe.', tr: 'My neighbour is tall and slim. He has grey hair and a beard.' }, { fr: 'Ma collègue est petite, elle a les cheveux bouclés et elle porte des lunettes.', tr: 'My colleague is short, has curly hair and wears glasses.' }],
      }),
      pick('A2', b('Choose the right verb.', 'Choisissez le bon verbe.'), ['a', 'est', 'fait', 'porte'], { fr: 'Elle ___ les yeux verts.' }),
      pick('A2', b('Choose the right verb.', 'Choisissez le bon verbe.'), ['est', 'a', 'porte', 'fait'], { fr: 'Mon frère ___ très grand.' }),
      pick('A2', b('Which sentence is correct?', 'Quelle phrase est correcte ?'), ['Il a les cheveux longs.', 'Il est les cheveux longs.', 'Il a des longs cheveux.', 'Il a le cheveu long.']),
      { kind: 'mcq', prompt: b('Listen. Who is it?', 'Écoutez. De qui parle-t-on ?'), audio: 'C’est ma tante Fatou. Elle est petite, elle a les cheveux courts et elle porte toujours des lunettes rouges. Elle est très drôle et généreuse.', listen: true, voice: 'f', options: [b('A short, funny woman with red glasses', 'Une femme petite et drôle, avec des lunettes rouges'), b('A tall, serious woman', 'Une femme grande et sérieuse'), b('A man with a beard', 'Un homme barbu'), b('A shy child', 'Un enfant timide')], answer: 0 },
      { kind: 'order', prompt: b('Build the sentence.', 'Construisez la phrase.'), words: ['Elle', 'a', 'les', 'cheveux', 'bouclés', 'et', 'les', 'yeux', 'marron.'], tr: 'She has curly hair and brown eyes.' },
      { kind: 'write', prompt: b('Write a short portrait.', 'Écrivez un court portrait.'), task: 'Décrivez une personne importante pour vous : son apparence physique et son caractère. (30 à 50 mots)', min: 30, max: 50, checklist: [b('Être + size, avoir + hair / eyes', 'Être + taille, avoir + cheveux / yeux'), b('Two or three character adjectives', 'Deux ou trois adjectifs de caractère'), b('Correct feminine agreements', 'Des accords au féminin corrects')], phrases: ['Il / Elle est…', 'Il / Elle a les cheveux…', 'Il / Elle porte…', 'C’est quelqu’un de…'], model: 'Ma grand-mère s’appelle Aïcha. Elle est petite et elle a les cheveux blancs. Elle porte toujours une robe colorée. Elle est très patiente, généreuse et drôle. Quand j’étais petit, elle me racontait des histoires tous les soirs. Je l’adore !' },
    ],
    notes: {
      points: [
        b('Être + size: grand(e), petit(e), mince.', 'Être + taille : grand(e), petit(e), mince.'),
        b('Avoir + les cheveux / les yeux + adjective: elle a les yeux verts.', 'Avoir + les cheveux / les yeux + adjectif : elle a les yeux verts.'),
        b('Porter + glasses, clothes: il porte des lunettes.', 'Porter + lunettes, vêtements : il porte des lunettes.'),
        b('C’est quelqu’un de + adjective (masculine): c’est quelqu’un de généreux.', 'C’est quelqu’un de + adjectif (masculin) : c’est quelqu’un de généreux.'),
      ],
      vocab: [['bouclé', b('curly', 'en boucles')], ['mince', b('slim', 'fin')], ['la barbe', b('beard', 'poils du menton')], ['les lunettes', b('glasses', 'pour mieux voir')], ['la taille', b('height, size', 'grandeur')]],
    },
  },
];

export default lessons;
