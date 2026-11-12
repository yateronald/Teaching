// Word lists of the mini-games. Every French phrase here has a recording
// (scripts/learn-media.mjs collects them through mediaSources.ts).

// ── Le ou la ? ── Consonant-initial nouns only (no l’).
/** [noun, gender, English]. */
export const GENDER_NOUNS: [string, 'm' | 'f', string][] = [
  ['pain', 'm', 'bread'], ['maison', 'f', 'house'], ['livre', 'm', 'book'], ['voiture', 'f', 'car'], ['fromage', 'm', 'cheese'],
  ['table', 'f', 'table'], ['chien', 'm', 'dog'], ['porte', 'f', 'door'], ['train', 'm', 'train'], ['chaise', 'f', 'chair'],
  ['bureau', 'm', 'desk, office'], ['fenêtre', 'f', 'window'], ['jardin', 'm', 'garden'], ['cuisine', 'f', 'kitchen'], ['village', 'm', 'village'],
  ['ville', 'f', 'city'], ['garage', 'm', 'garage'], ['plage', 'f', 'beach'], ['voyage', 'm', 'trip'], ['question', 'f', 'question'],
  ['gouvernement', 'm', 'government'], ['situation', 'f', 'situation'], ['bâtiment', 'm', 'building'], ['solution', 'f', 'solution'], ['moment', 'm', 'moment'],
  ['télévision', 'f', 'television'], ['document', 'm', 'document'], ['décision', 'f', 'decision'], ['gâteau', 'm', 'cake'], ['liberté', 'f', 'freedom'],
  ['bateau', 'm', 'boat'], ['santé', 'f', 'health'], ['chapeau', 'm', 'hat'], ['société', 'f', 'society'], ['manteau', 'm', 'coat'],
  ['beauté', 'f', 'beauty'], ['téléphone', 'm', 'telephone'], ['bouteille', 'f', 'bottle'], ['musée', 'm', 'museum'], ['famille', 'f', 'family'],
  ['problème', 'm', 'problem'], ['fille', 'f', 'girl, daughter'], ['système', 'm', 'system'], ['feuille', 'f', 'leaf, sheet'], ['programme', 'm', 'programme'],
  ['baguette', 'f', 'baguette'], ['travail', 'm', 'work'], ['fourchette', 'f', 'fork'], ['soleil', 'm', 'sun'], ['serviette', 'f', 'towel, napkin'],
  ['restaurant', 'm', 'restaurant'], ['différence', 'f', 'difference'], ['magasin', 'm', 'shop'], ['patience', 'f', 'patience'], ['matin', 'm', 'morning'],
  ['chance', 'f', 'luck'], ['cinéma', 'm', 'cinema'], ['culture', 'f', 'culture'], ['métro', 'm', 'metro'], ['nature', 'f', 'nature'],
  ['vélo', 'm', 'bicycle'], ['peinture', 'f', 'paint, painting'], ['parc', 'm', 'park'], ['boulangerie', 'f', 'bakery'], ['sac', 'm', 'bag'],
  ['pharmacie', 'f', 'pharmacy'], ['lac', 'm', 'lake'], ['librairie', 'f', 'bookshop'], ['pays', 'm', 'country'], ['vie', 'f', 'life'],
  ['journal', 'm', 'newspaper'], ['musique', 'f', 'music'], ['cheval', 'm', 'horse'], ['banque', 'f', 'bank'], ['café', 'm', 'coffee, café'],
  ['boutique', 'f', 'shop'], ['marché', 'm', 'market'], ['chambre', 'f', 'bedroom'], ['quartier', 'm', 'neighbourhood'], ['semaine', 'f', 'week'],
  ['cahier', 'm', 'notebook'], ['montagne', 'f', 'mountain'], ['papier', 'm', 'paper'], ['campagne', 'f', 'countryside'], ['salon', 'm', 'living room'],
  ['rue', 'f', 'street'], ['stylo', 'm', 'pen'], ['nuit', 'f', 'night'], ['bras', 'm', 'arm'], ['main', 'f', 'hand'],
  ['dos', 'm', 'back'], ['tête', 'f', 'head'], ['nez', 'm', 'nose'], ['bouche', 'f', 'mouth'], ['pied', 'm', 'foot'],
  ['jambe', 'f', 'leg'], ['mois', 'm', 'month'], ['saison', 'f', 'season'], ['temps', 'm', 'time, weather'], ['pluie', 'f', 'rain'],
];

/** Endings that usually give the gender away (shown after a game). */
export const GENDER_TIPS: { ending: string; g: 'm' | 'f'; ex: string }[] = [
  { ending: '-age', g: 'm', ex: 'le fromage, le voyage (mais : la plage, la page)' },
  { ending: '-ment', g: 'm', ex: 'le moment, le document' },
  { ending: '-eau', g: 'm', ex: 'le gâteau, le bateau (mais : l’eau, la peau)' },
  { ending: '-tion / -sion', g: 'f', ex: 'la question, la décision' },
  { ending: '-té', g: 'f', ex: 'la liberté, la santé' },
  { ending: '-ette / -elle', g: 'f', ex: 'la baguette, la fourchette' },
  { ending: '-ure / -ie', g: 'f', ex: 'la voiture, la pharmacie' },
  { ending: '-ance / -ence', g: 'f', ex: 'la chance, la différence' },
];

export const withArticle = (noun: string, g: 'm' | 'f') => `${g === 'm' ? 'le' : 'la'} ${noun}`;

// ── Le loto des nombres ──
const UNITS = ['zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
const TENS: Record<number, string> = { 2: 'vingt', 3: 'trente', 4: 'quarante', 5: 'cinquante', 6: 'soixante' };

/** 0 to 100 in French words (traditional spelling). */
export function frNumber(n: number): string {
  if (n < 20) return UNITS[n];
  if (n === 100) return 'cent';
  if (n < 70) {
    const t = TENS[Math.floor(n / 10)];
    const u = n % 10;
    return u === 0 ? t : u === 1 ? `${t} et un` : `${t}-${UNITS[u]}`;
  }
  if (n < 80) return n === 71 ? 'soixante et onze' : `soixante-${UNITS[n - 60]}`;
  if (n === 80) return 'quatre-vingts';
  return `quatre-vingt-${UNITS[n - 80]}`;
}

/** What the caller says. A short carrier word keeps the pronunciation natural. */
export const numberCall = (n: number) => `Numéro ${frNumber(n)}.`;

export const BINGO_LEVELS: { id: string; min: number; max: number }[] = [
  { id: '0-20', min: 0, max: 20 },
  { id: '0-69', min: 0, max: 69 },
  { id: '0-100', min: 0, max: 100 },
];

// ── Les paires sonores ──
export interface PairDeck { id: string; name: { en: string; fr: string }; words: [string, string][] }
/** [French with article, English]. Eight words per theme. */
export const PAIR_DECKS: PairDeck[] = [
  { id: 'table', name: { en: 'At the table', fr: 'À table' }, words: [['le pain', 'bread'], ['le fromage', 'cheese'], ['la pomme', 'apple'], ['le poisson', 'fish'], ['le lait', 'milk'], ['la soupe', 'soup'], ['le sucre', 'sugar'], ['la fourchette', 'fork']] },
  { id: 'city', name: { en: 'In town', fr: 'En ville' }, words: [['la rue', 'street'], ['la banque', 'bank'], ['le pont', 'bridge'], ['la gare', 'station'], ['le marché', 'market'], ['la mairie', 'town hall'], ['le musée', 'museum'], ['la pharmacie', 'pharmacy']] },
  { id: 'home', name: { en: 'At home', fr: 'À la maison' }, words: [['la cuisine', 'kitchen'], ['le salon', 'living room'], ['la chambre', 'bedroom'], ['le lit', 'bed'], ['la chaise', 'chair'], ['la fenêtre', 'window'], ['le miroir', 'mirror'], ['la clé', 'key']] },
  { id: 'body', name: { en: 'The body', fr: 'Le corps' }, words: [['la tête', 'head'], ['la main', 'hand'], ['le pied', 'foot'], ['le dos', 'back'], ['la bouche', 'mouth'], ['le nez', 'nose'], ['le genou', 'knee'], ['la jambe', 'leg']] },
  { id: 'clothes', name: { en: 'Clothes', fr: 'Les vêtements' }, words: [['la chemise', 'shirt'], ['le pantalon', 'trousers'], ['la robe', 'dress'], ['le manteau', 'coat'], ['la jupe', 'skirt'], ['le chapeau', 'hat'], ['la veste', 'jacket'], ['le pull', 'jumper']] },
  { id: 'nature', name: { en: 'Nature', fr: 'La nature' }, words: [['le soleil', 'sun'], ['la lune', 'moon'], ['la neige', 'snow'], ['la pluie', 'rain'], ['le vent', 'wind'], ['la forêt', 'forest'], ['le lac', 'lake'], ['la montagne', 'mountain']] },
  { id: 'transport', name: { en: 'Transport', fr: 'Les transports' }, words: [['le train', 'train'], ['le métro', 'metro'], ['le vélo', 'bicycle'], ['la voiture', 'car'], ['le bateau', 'boat'], ['le billet', 'ticket'], ['la valise', 'suitcase'], ['le quai', 'platform']] },
  { id: 'work', name: { en: 'At work', fr: 'Au travail' }, words: [['le bureau', 'office, desk'], ['la réunion', 'meeting'], ['le collègue', 'colleague'], ['le courriel', 'email'], ['la pause', 'break'], ['le contrat', 'contract'], ['le salaire', 'salary'], ['la tâche', 'task']] },
];

// ── Le mot du jour ── Five letters once accents are removed.
export interface DailyWord { w: string; tr: string; def: string; ex: string }
export const DAILY_WORDS: DailyWord[] = [
  { w: 'porte', tr: 'door', def: 'On l’ouvre pour entrer dans une pièce.', ex: 'Ferme la porte, s’il te plaît.' },
  { w: 'livre', tr: 'book', def: 'Des pages reliées, qu’on lit.', ex: 'Je lis un livre avant de dormir.' },
  { w: 'table', tr: 'table', def: 'Meuble sur lequel on mange.', ex: 'Le dîner est sur la table.' },
  { w: 'chien', tr: 'dog', def: 'Animal domestique qui aboie.', ex: 'Mon chien adore la neige.' },
  { w: 'monde', tr: 'world', def: 'La Terre et tous ses habitants.', ex: 'Il y a beaucoup de monde dans le métro.' },
  { w: 'route', tr: 'road', def: 'Voie où roulent les voitures.', ex: 'La route est fermée à cause de la neige.' },
  { w: 'ville', tr: 'city', def: 'Lieu où habitent beaucoup de gens.', ex: 'Montréal est une grande ville.' },
  { w: 'place', tr: 'seat, square', def: 'Endroit où l’on s’assoit, ou espace public.', ex: 'Cette place est libre ?' },
  { w: 'fille', tr: 'girl, daughter', def: 'Enfant de sexe féminin.', ex: 'Ma fille a six ans.' },
  { w: 'frère', tr: 'brother', def: 'Garçon né des mêmes parents.', ex: 'Mon frère habite à Québec.' },
  { w: 'merci', tr: 'thank you', def: 'Mot qu’on dit pour remercier.', ex: 'Merci beaucoup pour votre aide.' },
  { w: 'rouge', tr: 'red', def: 'Couleur du sang et des tomates.', ex: 'Elle porte un manteau rouge.' },
  { w: 'blanc', tr: 'white', def: 'Couleur de la neige.', ex: 'En hiver, tout est blanc.' },
  { w: 'jaune', tr: 'yellow', def: 'Couleur du soleil et du citron.', ex: 'Le taxi est jaune.' },
  { w: 'grand', tr: 'big, tall', def: 'De grande taille.', ex: 'C’est un grand appartement.' },
  { w: 'petit', tr: 'small', def: 'De petite taille.', ex: 'Je prends un petit café.' },
  { w: 'jeune', tr: 'young', def: 'Qui n’est pas vieux.', ex: 'Elle est jeune et très motivée.' },
  { w: 'vieux', tr: 'old', def: 'Qui a beaucoup d’années.', ex: 'J’habite dans un vieux quartier.' },
  { w: 'chaud', tr: 'hot', def: 'Qui a une température élevée.', ex: 'Attention, le café est chaud.' },
  { w: 'froid', tr: 'cold', def: 'Qui a une température basse.', ex: 'Il fait froid ce matin.' },
  { w: 'matin', tr: 'morning', def: 'Début de la journée.', ex: 'Je travaille le matin.' },
  { w: 'heure', tr: 'hour, time', def: 'Soixante minutes.', ex: 'Le cours dure une heure.' },
  { w: 'année', tr: 'year', def: 'Douze mois.', ex: 'Bonne année à tous !' },
  { w: 'jeudi', tr: 'Thursday', def: 'Quatrième jour de la semaine.', ex: 'On se voit jeudi soir.' },
  { w: 'mardi', tr: 'Tuesday', def: 'Deuxième jour de la semaine.', ex: 'La réunion est mardi matin.' },
  { w: 'lundi', tr: 'Monday', def: 'Premier jour de la semaine.', ex: 'Je commence lundi.' },
  { w: 'avril', tr: 'April', def: 'Quatrième mois de l’année.', ex: 'Il pleut souvent en avril.' },
  { w: 'hiver', tr: 'winter', def: 'La saison froide.', ex: 'L’hiver est long au Québec.' },
  { w: 'pluie', tr: 'rain', def: 'Eau qui tombe du ciel.', ex: 'Prends un parapluie, il y a de la pluie.' },
  { w: 'neige', tr: 'snow', def: 'Eau gelée, blanche, qui tombe en hiver.', ex: 'Les enfants jouent dans la neige.' },
  { w: 'nuage', tr: 'cloud', def: 'Masse grise ou blanche dans le ciel.', ex: 'Il n’y a pas un nuage aujourd’hui.' },
  { w: 'fleur', tr: 'flower', def: 'Partie colorée d’une plante.', ex: 'Cette fleur sent très bon.' },
  { w: 'arbre', tr: 'tree', def: 'Grande plante avec un tronc.', ex: 'Il y a un arbre devant la maison.' },
  { w: 'plage', tr: 'beach', def: 'Bord de mer couvert de sable.', ex: 'On va à la plage cet été.' },
  { w: 'océan', tr: 'ocean', def: 'Très grande étendue d’eau salée.', ex: 'L’avion traverse l’océan.' },
  { w: 'ferme', tr: 'farm', def: 'Lieu où l’on élève des animaux.', ex: 'Mes grands-parents ont une ferme.' },
  { w: 'champ', tr: 'field', def: 'Terrain cultivé.', ex: 'Le champ est couvert de neige.' },
  { w: 'poire', tr: 'pear', def: 'Fruit sucré, plus large en bas.', ex: 'Je mange une poire au dessert.' },
  { w: 'pomme', tr: 'apple', def: 'Fruit rond, rouge ou vert.', ex: 'Une pomme par jour, c’est bon pour la santé.' },
  { w: 'sucre', tr: 'sugar', def: 'Ce qu’on met dans le café pour l’adoucir.', ex: 'Un café sans sucre, s’il vous plaît.' },
  { w: 'pâtes', tr: 'pasta', def: 'Spaghettis, macaronis…', ex: 'Ce soir, on mange des pâtes.' },
  { w: 'crêpe', tr: 'crepe', def: 'Galette très fine, sucrée ou salée.', ex: 'Je voudrais une crêpe au chocolat.' },
  { w: 'tarte', tr: 'tart, pie', def: 'Pâtisserie garnie de fruits.', ex: 'Ma mère fait une tarte aux pommes.' },
  { w: 'glace', tr: 'ice, ice cream', def: 'Eau gelée, ou dessert froid.', ex: 'Attention, il y a de la glace sur le trottoir.' },
  { w: 'bière', tr: 'beer', def: 'Boisson alcoolisée à base d’orge.', ex: 'Une bière et un jus d’orange, s’il vous plaît.' },
  { w: 'verre', tr: 'glass', def: 'On y verse de l’eau pour boire.', ex: 'Je voudrais un verre d’eau.' },
  { w: 'tasse', tr: 'cup', def: 'On y boit le café ou le thé.', ex: 'Elle boit une tasse de thé.' },
  { w: 'repas', tr: 'meal', def: 'Ce qu’on mange le matin, le midi ou le soir.', ex: 'Le repas est prêt !' },
  { w: 'avion', tr: 'plane', def: 'Appareil qui vole et transporte des passagers.', ex: 'Mon avion part à midi.' },
  { w: 'train', tr: 'train', def: 'Il roule sur des rails.', ex: 'Je prends le train pour Ottawa.' },
  { w: 'métro', tr: 'metro', def: 'Train souterrain en ville.', ex: 'Le métro arrive dans deux minutes.' },
  { w: 'hôtel', tr: 'hotel', def: 'On y loue une chambre pour la nuit.', ex: 'L’hôtel est près de la gare.' },
  { w: 'lampe', tr: 'lamp', def: 'Objet qui éclaire.', ex: 'Allume la lampe, il fait sombre.' },
  { w: 'salon', tr: 'living room', def: 'Pièce où l’on reçoit les invités.', ex: 'On regarde un film dans le salon.' },
  { w: 'école', tr: 'school', def: 'Lieu où les enfants apprennent.', ex: 'Les enfants sont à l’école.' },
  { w: 'stylo', tr: 'pen', def: 'On l’utilise pour écrire à l’encre.', ex: 'Tu as un stylo ?' },
  { w: 'carte', tr: 'card, map', def: 'Petit rectangle de plastique, ou plan d’un lieu.', ex: 'Je paie par carte.' },
  { w: 'photo', tr: 'photo', def: 'Image prise avec un appareil.', ex: 'Je prends une photo de la ville.' },
  { w: 'piano', tr: 'piano', def: 'Instrument à touches noires et blanches.', ex: 'Elle joue du piano depuis dix ans.' },
  { w: 'radio', tr: 'radio', def: 'On l’écoute pour la musique et les nouvelles.', ex: 'J’écoute la radio dans la voiture.' },
  { w: 'danse', tr: 'dance', def: 'Art de bouger en musique.', ex: 'Elle fait de la danse le mardi.' },
  { w: 'sport', tr: 'sport', def: 'Activité physique.', ex: 'Je fais du sport trois fois par semaine.' },
  { w: 'match', tr: 'match, game', def: 'Rencontre sportive.', ex: 'Le match de hockey commence à sept heures.' },
  { w: 'jouer', tr: 'to play', def: 'S’amuser, ou pratiquer un sport ou un instrument.', ex: 'Les enfants aiment jouer dehors.' },
  { w: 'aimer', tr: 'to like, to love', def: 'Avoir de l’affection ou du goût pour.', ex: 'Je vais aimer cette ville.' },
  { w: 'venir', tr: 'to come', def: 'Se déplacer vers ici.', ex: 'Tu peux venir demain ?' },
  { w: 'faire', tr: 'to do, to make', def: 'Réaliser une action.', ex: 'Qu’est-ce que tu vas faire ce soir ?' },
  { w: 'aller', tr: 'to go', def: 'Se déplacer vers un lieu.', ex: 'Je dois aller à la banque.' },
  { w: 'avoir', tr: 'to have', def: 'Posséder.', ex: 'J’aimerais avoir plus de temps.' },
  { w: 'vivre', tr: 'to live', def: 'Être en vie, habiter.', ex: 'J’adore vivre à Montréal.' },
  { w: 'boire', tr: 'to drink', def: 'Avaler un liquide.', ex: 'Il faut boire beaucoup d’eau.' },
  { w: 'finir', tr: 'to finish', def: 'Terminer.', ex: 'Je dois finir ce rapport aujourd’hui.' },
  { w: 'payer', tr: 'to pay', def: 'Donner de l’argent pour un achat.', ex: 'Je peux payer par carte ?' },
  { w: 'rêver', tr: 'to dream', def: 'Voir des images en dormant, ou souhaiter très fort.', ex: 'Elle continue de rêver de voyages.' },
  { w: 'tenir', tr: 'to hold', def: 'Avoir dans la main.', ex: 'Tu peux tenir mon sac une minute ?' },
  { w: 'après', tr: 'after', def: 'Plus tard dans le temps.', ex: 'On se voit après le travail.' },
  { w: 'avant', tr: 'before', def: 'Plus tôt dans le temps.', ex: 'Lave-toi les mains avant le repas.' },
  { w: 'alors', tr: 'so, then', def: 'Mot qui introduit une conséquence.', ex: 'Il pleut, alors je reste à la maison.' },
  { w: 'aussi', tr: 'also, too', def: 'Également.', ex: 'Moi aussi, j’aime le café.' },
  { w: 'assez', tr: 'enough', def: 'En quantité suffisante.', ex: 'Merci, j’ai assez mangé.' },
  { w: 'moins', tr: 'less', def: 'Le contraire de plus.', ex: 'Il fait moins dix dehors.' },
  { w: 'mieux', tr: 'better', def: 'D’une meilleure façon.', ex: 'Je parle mieux français maintenant.' },
  { w: 'salut', tr: 'hi, bye', def: 'Bonjour ou au revoir, entre amis.', ex: 'Salut, ça va ?' },
  { w: 'super', tr: 'great', def: 'Très bien, formidable.', ex: 'C’est une super idée !' },
  { w: 'calme', tr: 'quiet, calm', def: 'Sans bruit, tranquille.', ex: 'Mon quartier est très calme.' },
  { w: 'drôle', tr: 'funny', def: 'Qui fait rire.', ex: 'Ce film est vraiment drôle.' },
  { w: 'riche', tr: 'rich', def: 'Qui a beaucoup d’argent.', ex: 'Il n’est pas riche, mais il est heureux.' },
  { w: 'libre', tr: 'free, available', def: 'Qui n’est pas occupé.', ex: 'Tu es libre samedi soir ?' },
  { w: 'court', tr: 'short', def: 'Le contraire de long.', ex: 'C’est un trajet très court.' },
  { w: 'large', tr: 'wide', def: 'Le contraire d’étroit.', ex: 'La rue est large et calme.' },
  { w: 'lourd', tr: 'heavy', def: 'Qui pèse beaucoup.', ex: 'Ce sac est trop lourd pour moi.' },
  { w: 'léger', tr: 'light', def: 'Qui pèse peu.', ex: 'Je prends un repas léger le soir.' },
  { w: 'santé', tr: 'health', def: 'État du corps quand tout va bien.', ex: 'Le sport, c’est bon pour la santé.' },
  { w: 'corps', tr: 'body', def: 'L’ensemble de la tête, des bras, des jambes…', ex: 'Le yoga détend tout le corps.' },
  { w: 'jambe', tr: 'leg', def: 'Partie du corps entre le pied et la hanche.', ex: 'J’ai mal à la jambe droite.' },
  { w: 'doigt', tr: 'finger', def: 'Chaque main en a cinq.', ex: 'Je me suis coupé le doigt.' },
  { w: 'dents', tr: 'teeth', def: 'On les brosse matin et soir.', ex: 'Je me brosse les dents.' },
  { w: 'pièce', tr: 'room, coin', def: 'Partie d’un logement, ou monnaie en métal.', ex: 'Le salon est la plus grande pièce.' },
  { w: 'poste', tr: 'post office, position', def: 'Lieu où l’on envoie le courrier, ou emploi.', ex: 'Je vais à la poste envoyer un colis.' },
  { w: 'colis', tr: 'parcel', def: 'Paquet envoyé par la poste.', ex: 'Votre colis est arrivé ce matin.' },
  { w: 'jouet', tr: 'toy', def: 'Objet avec lequel un enfant joue.', ex: 'Il a reçu un nouveau jouet.' },
  { w: 'amour', tr: 'love', def: 'Sentiment très fort pour quelqu’un.', ex: 'C’est une belle histoire d’amour.' },
  { w: 'bisou', tr: 'kiss', def: 'Petit baiser affectueux.', ex: 'Fais un bisou à ta grand-mère.' },
  { w: 'oncle', tr: 'uncle', def: 'Le frère du père ou de la mère.', ex: 'Mon oncle vit à Toronto.' },
  { w: 'tante', tr: 'aunt', def: 'La sœur du père ou de la mère.', ex: 'Ma tante cuisine très bien.' },
  { w: 'maman', tr: 'mum', def: 'Nom affectueux pour la mère.', ex: 'Maman, on mange quoi ce soir ?' },
  { w: 'femme', tr: 'woman, wife', def: 'Personne adulte de sexe féminin.', ex: 'Cette femme est ma voisine.' },
  { w: 'homme', tr: 'man', def: 'Personne adulte de sexe masculin.', ex: 'Cet homme travaille à la mairie.' },
  { w: 'bruit', tr: 'noise', def: 'Son désagréable.', ex: 'Il y a trop de bruit dans la rue.' },
  { w: 'odeur', tr: 'smell', def: 'Ce qu’on sent avec le nez.', ex: 'J’adore l’odeur du pain chaud.' },
  { w: 'chose', tr: 'thing', def: 'Objet ou idée qu’on ne nomme pas.', ex: 'J’ai une chose à te dire.' },
  { w: 'façon', tr: 'way, manner', def: 'Manière de faire.', ex: 'C’est une bonne façon d’apprendre.' },
  { w: 'pause', tr: 'break', def: 'Court arrêt pendant le travail.', ex: 'On fait une pause à dix heures.' },
  { w: 'repos', tr: 'rest', def: 'Moment où l’on ne travaille pas.', ex: 'Dimanche, c’est mon jour de repos.' },
  { w: 'pizza', tr: 'pizza', def: 'Plat italien rond, garni de fromage.', ex: 'On commande une pizza ce soir ?' },
  { w: 'herbe', tr: 'grass', def: 'Plante verte qui couvre le sol.', ex: 'Les enfants courent dans l’herbe.' },
  { w: 'vague', tr: 'wave', def: 'Mouvement de l’eau à la surface de la mer.', ex: 'Une grosse vague arrive sur la plage.' },
  { w: 'sable', tr: 'sand', def: 'Il couvre les plages.', ex: 'Le sable est chaud sous mes pieds.' },
  { w: 'vente', tr: 'sale', def: 'Action de vendre.', ex: 'Cette maison est en vente.' },
  { w: 'achat', tr: 'purchase', def: 'Ce qu’on achète.', ex: 'C’est un très bon achat.' },
  { w: 'banal', tr: 'ordinary', def: 'Sans originalité.', ex: 'Ce film est un peu banal.' },
  { w: 'crème', tr: 'cream', def: 'Partie grasse du lait.', ex: 'Je prends mon café avec de la crème.' },
  { w: 'soupe', tr: 'soup', def: 'Plat liquide et chaud.', ex: 'En hiver, j’adore la soupe.' },
  { w: 'pêche', tr: 'peach, fishing', def: 'Fruit à noyau, ou activité au bord de l’eau.', ex: 'Cette pêche est très sucrée.' },
];

const strip = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase();
/** The word as typed in the grid: five capital letters without accents. */
export const dailyKey = (w: DailyWord) => strip(w.w);
export const stripAccents = strip;

/** Days since 1 January 2026, in the visitor's time zone. */
export function dayNumber(d = new Date()): number {
  return Math.floor((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - Date.UTC(2026, 0, 1)) / 86400000);
}
export const dayStamp = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** Today's word: the list is walked in a fixed scrambled order, so each word comes once per cycle. */
export function wordOfDay(day = dayNumber()): DailyWord {
  const n = DAILY_WORDS.length;
  let step = 37;
  const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);
  while (gcd(step, n) !== 1) step++;
  return DAILY_WORDS[(((day * step + 11) % n) + n) % n];
}
