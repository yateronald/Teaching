// C1 · Registers: formal, standard, informal — who is speaking to whom.
import { ear, ex, fill, pick, situation } from '../authoring';

const LETTRE = 'Monsieur le directeur, je me permets de vous solliciter afin d’obtenir un entretien. Je reste à votre entière disposition pour convenir d’une date.';
const LETTRE_SHOW = 'Monsieur le directeur, {je me permets de vous solliciter} afin d’obtenir un entretien. {Je reste à votre entière disposition} pour convenir d’une date.';

export default ear('les-registres', {
  rule: [
    ['Soutenu, courant, familier', 'Formal, standard, informal'],
    [
      'La même idée se dit de trois façons selon la situation :\n\n**soutenu** : __Je vous saurais gré de bien vouloir me répondre__ ; __Veuillez patienter__ ; __Je me rendrai à Paris__.\n**courant** : __Pourriez-vous me répondre ?__ ; __Merci de patienter__ ; __J’irai à Paris__.\n**familier** : __Tu peux me répondre ?__ ; __Attends deux secondes__ ; __Je monte à Paris__.\n\nLe registre vous renseigne sur la relation (un supérieur, un client, un ami) et sur le ton (respect, distance, agacement).',
      'The same idea is said three ways depending on the situation:\n\n**formal**: __Je vous saurais gré de bien vouloir me répondre__; __Veuillez patienter__; __Je me rendrai à Paris__.\n**standard**: __Pourriez-vous me répondre ?__; __Merci de patienter__; __J’irai à Paris__.\n**informal**: __Tu peux me répondre ?__; __Attends deux secondes__; __Je monte à Paris__.\n\nThe register tells you about the relationship (a boss, a client, a friend) and the tone (respect, distance, annoyance).',
    ],
  ],
  goal: ['Reconnaître le registre et ce qu’il dit de la situation.', 'Recognise the register and what it says about the situation.'],
  examples: [
    ex('Je vous saurais gré de bien vouloir me répondre.', 'Je vous {saurais gré} de bien vouloir me répondre.', ['Soutenu : une lettre officielle.', 'Formal: an official letter.']),
    ex('Pourriez-vous me répondre ?', '{Pourriez-vous} me répondre ?', ['Courant et poli.', 'Standard and polite.']),
    ex('Tu peux me répondre, oui ?', '{Tu peux} me répondre, oui ?', ['Familier, un peu agacé.', 'Informal, a bit annoyed.']),
  ],
  items: [
    pick('Je vous prie d’agréer mes salutations distinguées.', ['Entre amis', 'À la fin d’une lettre officielle', 'Au marché'], 1, 'Je vous prie d’agréer mes salutations distinguées.', [
      'La formule de politesse des lettres administratives.', 'The closing formula of official letters.',
    ], ['Où entend-on cette phrase ?', 'Where would you hear this?']),
    pick('Tu me prêtes ton bouquin ?', ['Familier', 'Soutenu', 'Courant'], 0, 'Tu me prêtes ton {bouquin} ?', [
      'Un bouquin = un livre (familier). Courant : un livre ; soutenu : un ouvrage.', 'Un bouquin = a book (informal).',
    ], ['Quel est le registre ?', 'What is the register?']),
    pick('Veuillez patienter, un conseiller va prendre votre appel.', ['Familier', 'Soutenu'], 1, '{Veuillez} patienter, un conseiller va prendre votre appel.', [
      'Veuillez + infinitif : formule soutenue des messages officiels.', 'Veuillez + infinitive: formal wording of official messages.',
    ], ['Quel est le registre ?', 'What is the register?']),
    pick('Je me rendrai à la préfecture demain.', ['Familier', 'Soutenu ou soigné'], 1, 'Je {me rendrai} à la préfecture demain.', [
      'Se rendre = aller, en registre soigné.', 'Se rendre = to go, in a careful register.',
    ], ['Quel est le registre ?', 'What is the register?']),
    pick('J’ai pas le temps, là.', ['Soutenu', 'Familier'], 1, 'J’ai pas le temps, {là}.', [
      'Sans « ne », avec « là » : familier.', 'No « ne », plus « là »: informal.',
    ], ['Quel est le registre ?', 'What is the register?']),
    fill('Je vous prie de m’excuser.', 'Je vous ___ de m’excuser.', 'prie', 'Je vous {prie} de m’excuser.', [
      'Je vous prie de : soutenu.', 'Je vous prie de: formal.',
    ]),
    fill('Veuillez fermer la porte.', '___ fermer la porte.', ['Veuillez', 'veuillez'], '{Veuillez} fermer la porte.', [
      'Veuillez : l’impératif soutenu de vouloir.', 'Veuillez: the formal imperative of vouloir.',
    ]),
    fill('Il bosse dans une banque.', 'Il ___ dans une banque.', 'bosse', 'Il {bosse} dans une banque.', [
      'Bosser = travailler (familier).', 'Bosser = to work (informal).',
    ]),
    situation(LETTRE, 'À qui parle la personne ?', ['À un ami', 'À un supérieur, de façon très formelle', 'À un enfant'], 1, LETTRE_SHOW, [
      '« Monsieur le directeur », « je me permets de vous solliciter » : très soutenu.', 'Very formal register.',
    ]),
    situation(LETTRE, 'Que demande-t-elle ?', ['Un rendez-vous', 'Une augmentation', 'Des excuses'], 0, LETTRE_SHOW, [
      '« Afin d’obtenir un entretien » = un rendez-vous.', '« In order to obtain a meeting ».',
    ]),
  ],
  takeaway: [
    'Soutenu (veuillez, je me permets, se rendre), courant (pourriez-vous, aller), familier (tu peux, bosser, bouquin) : le registre dit qui parle à qui, et sur quel ton.',
    'Formal (veuillez, je me permets, se rendre), standard (pourriez-vous, aller), informal (tu peux, bosser, bouquin): the register tells who is speaking to whom, and how.',
  ],
});
