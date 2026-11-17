// B1 · Article. Remote work, for and against: reading an argument and
// expressing contrast (en revanche, pourtant, alors que, même si).
import { b } from '../../types';
import type { ReadingText } from '../types';

const text: ReadingText = {
  id: 'le-teletravail-liberte-ou-isolement',
  warmup: b(
    'Would you like to work from home every day? Note one advantage and one drawback, then read.',
    'Aimeriez-vous travailler à la maison tous les jours ? Notez un avantage et un inconvénient, puis lisez.',
  ),
  paras: [
    { lead: true, s: [
      ['Travailler depuis sa cuisine, en pantoufles, sans prendre le métro : pour beaucoup de salariés, le télétravail est devenu une habitude.', 'Working from your kitchen, in slippers, without taking the metro: for many employees, working from home has become a habit.'],
      ['Mais est-ce vraiment un progrès ?', 'But is it really progress?'],
    ] },
    { s: [
      ['Les avantages sont nombreux.', 'The advantages are many.'],
      ['D’abord, on gagne du temps : plus besoin de passer une heure dans les transports chaque matin.', 'First, you save time: no more spending an hour commuting every morning.'],
      ['Ensuite, beaucoup de télétravailleurs disent qu’ils se concentrent mieux à la maison, loin du bruit des bureaux ouverts.', 'Then, many remote workers say they concentrate better at home, far from the noise of open-plan offices.'],
      ['Enfin, les parents peuvent plus facilement aller chercher leurs enfants à l’école.', 'Finally, parents can more easily pick up their children from school.'],
    ] },
    { s: [
      ['En revanche, travailler seul a aussi ses inconvénients.', 'On the other hand, working alone also has its drawbacks.'],
      ['« Au début, j’étais ravie, raconte Sarah, graphiste à Lyon.', '“At first I was delighted,” says Sarah, a graphic designer in Lyon.'],
      ['Pourtant, après quelques mois, mes collègues me manquaient : on ne se parlait plus que par écran. »', '“Yet after a few months I missed my colleagues: we only talked to each other through a screen.”'],
      ['D’autres ont du mal à s’arrêter de travailler le soir, alors qu’au bureau, ils partaient à dix-huit heures.', 'Others find it hard to stop working in the evening, whereas at the office they left at six.'],
    ] },
    { s: [
      ['Pour beaucoup d’entreprises, la solution se trouve au milieu : deux ou trois jours à la maison, le reste au bureau.', 'For many companies, the answer lies in the middle: two or three days at home, the rest at the office.'],
      ['Ce modèle hybride permet de garder les avantages du télétravail, même s’il demande une bonne organisation.', 'This hybrid model keeps the advantages of remote work, even if it requires good organisation.'],
    ] },
    { s: [
      ['Finalement, le télétravail n’est ni une liberté totale ni une prison : tout dépend de la façon dont on l’organise.', 'In the end, remote work is neither total freedom nor a prison: it all depends on how you organise it.'],
    ] },
  ],
  glossary: [
    { fr: 'en pantoufles', tr: b('in slippers', 'avec des chaussures d’intérieur') },
    { fr: 'salariés', tr: b('employees', 'les personnes payées par une entreprise') },
    { fr: 'on gagne du temps', tr: b('you save time', 'on a plus de temps libre') },
    { fr: 'les transports', tr: b('commuting, public transport', 'le bus, le métro, le train pour aller au travail') },
    { fr: 'se concentrent', tr: b('concentrate', 'font attention à une seule chose') },
    { fr: 'En revanche', tr: b('on the other hand', 'de l’autre côté, au contraire') },
    { fr: 'inconvénients', tr: b('drawbacks', 'les aspects négatifs') },
    { fr: 'ravie', tr: b('delighted', 'très contente') },
    { fr: 'Pourtant', tr: b('yet, however', 'malgré cela') },
    { fr: 'alors qu’au bureau', tr: b('whereas at the office', 'tandis qu’au bureau (alors que oppose deux situations)') },
  ],
  questions: [
    {
      q: 'Quel est le but principal de cet article ?',
      qEn: 'What is the main aim of this article?',
      options: ['Présenter les avantages et les inconvénients du télétravail', 'Expliquer comment trouver un emploi', 'Critiquer les transports en commun', 'Raconter la vie de Sarah'],
      answer: 0,
      evidence: ['Les avantages sont nombreux.', 'travailler seul a aussi ses inconvénients'],
      explain: b(
        'One paragraph for the advantages, one for the drawbacks, then a balanced conclusion: a typical argumentative article. Sarah is only an example.',
        'Un paragraphe pour les avantages, un pour les inconvénients, puis une conclusion équilibrée : un article argumentatif typique. Sarah n’est qu’un exemple.',
      ),
      skill: 'global',
    },
    {
      q: 'Selon l’article, pourquoi certains télétravailleurs se concentrent-ils mieux ?',
      qEn: 'According to the article, why do some remote workers concentrate better?',
      options: ['Ils dorment plus.', 'Il y a moins de bruit qu’au bureau.', 'Ils ont un meilleur ordinateur.', 'Leur patron les surveille.'],
      answer: 1,
      evidence: 'loin du bruit des bureaux ouverts',
      explain: b(
        '“… loin du bruit des bureaux ouverts”: open-plan offices are noisy.',
        '« … loin du bruit des bureaux ouverts » : les bureaux ouverts sont bruyants.',
      ),
      skill: 'detail',
    },
    {
      q: 'Qu’est-ce qui manquait à Sarah ?',
      qEn: 'What did Sarah miss?',
      options: ['Son salaire', 'Ses collègues', 'Son ancien appartement', 'Les transports'],
      answer: 1,
      evidence: 'mes collègues me manquaient',
      explain: b(
        'Careful: “mes collègues me manquaient” means Sarah missed her colleagues. With manquer à, the subject is what is missed.',
        'Attention : « mes collègues me manquaient » veut dire que Sarah regrettait de ne plus les voir. Avec manquer à, le sujet est ce qui manque.',
      ),
      skill: 'vocab',
    },
    {
      q: 'Quel problème ont d’autres télétravailleurs ?',
      qEn: 'What problem do other remote workers have?',
      options: ['Ils n’ont pas Internet.', 'Ils ont du mal à s’arrêter de travailler le soir.', 'Ils habitent trop loin.', 'Ils n’aiment pas leur cuisine.'],
      answer: 1,
      evidence: 'ont du mal à s’arrêter de travailler le soir',
      explain: b(
        '“D’autres ont du mal à s’arrêter de travailler le soir, alors qu’au bureau, ils partaient à dix-huit heures.” Alors que contrasts the two situations.',
        '« D’autres ont du mal à s’arrêter de travailler le soir, alors qu’au bureau, ils partaient à dix-huit heures. » Alors que oppose les deux situations.',
      ),
      skill: 'detail',
    },
    {
      q: 'Le « modèle hybride », c’est :',
      qEn: 'What is the “hybrid model”?',
      options: ['Travailler seulement à la maison', 'Travailler en partie à la maison, en partie au bureau', 'Travailler la nuit', 'Changer souvent d’entreprise'],
      answer: 1,
      evidence: 'deux ou trois jours à la maison, le reste au bureau',
      explain: b(
        'The sentence before defines it: “deux ou trois jours à la maison, le reste au bureau”. Hybride means a mix of two things.',
        'La phrase d’avant le définit : « deux ou trois jours à la maison, le reste au bureau ». Hybride veut dire : un mélange de deux choses.',
      ),
      skill: 'inference',
    },
    {
      q: 'Quelle est la conclusion de l’article ?',
      qEn: 'What is the article’s conclusion?',
      options: ['Le télétravail est une mauvaise idée.', 'Tout dépend de la façon dont on l’organise.', 'Le télétravail est une liberté totale.', 'Le bureau est toujours meilleur.'],
      answer: 1,
      evidence: 'tout dépend de la façon dont on l’organise',
      explain: b(
        '“Ni une liberté totale ni une prison”: the author rejects both extremes. The conclusion of an argument is often in its last sentence.',
        '« Ni une liberté totale ni une prison » : l’auteur refuse les deux extrêmes. La conclusion d’une argumentation se trouve souvent dans la dernière phrase.',
      ),
      skill: 'inference',
    },
  ],
  focus: {
    title: b('Expressing contrast: en revanche, pourtant, alors que, même si', 'Exprimer l’opposition : en revanche, pourtant, alors que, même si'),
    body: b(
      '**En revanche** (on the other hand) opens the other side of an argument. **Pourtant** (yet) introduces something surprising after what was just said. **Alors que** (whereas) compares two opposite situations in one sentence. **Même si** (even if) admits a fact without changing the conclusion. These words are the backbone of a B1 argument.',
      '**En revanche** ouvre l’autre côté d’un argument. **Pourtant** introduit quelque chose d’inattendu après ce qui vient d’être dit. **Alors que** compare deux situations opposées dans une même phrase. **Même si** admet un fait sans changer la conclusion. Ces mots sont la colonne vertébrale d’une argumentation de niveau B1.',
    ),
    examples: [
      { fr: 'En revanche, travailler seul a aussi ses inconvénients.', tr: 'On the other hand, working alone also has its drawbacks.' },
      { fr: 'Pourtant, mes collègues me manquaient.', tr: 'Yet I missed my colleagues.' },
      { fr: 'Ce modèle est pratique, même s’il demande une bonne organisation.', tr: 'This model is practical, even if it requires good organisation.' },
    ],
  },
};

export default text;
