import { b, type Lang, type Level, type T } from '../types';
import { readingPath } from './meta';

type MissionDocument = {
  id: string;
  kind: 'email' | 'sms' | 'notice';
  label: T;
  labelDetail: T;
  title: string;
  lines: string[];
  evidence: string;
  takeaway: T;
};

type MissionAnswer = {
  message: string;
  feedback: T;
};

export type ReadingMission = {
  id: string;
  level: Level;
  minutes: number;
  title: T;
  summary: T;
  brief: T;
  documents: MissionDocument[];
  answers: MissionAnswer[];
  correct: number;
  tip: T;
};

export const MISSIONS: ReadingMission[] = [{
  id: 'le-cours-a-change-de-salle',
  level: 'B1',
  minutes: 5,
  title: b('The classroom has changed', 'Le cours a changé de salle'),
  summary: b('A confirmation email, a last-minute text and a notice at the entrance. Which directions should you send?', 'Un courriel de confirmation, un SMS de dernière minute et un avis à l’entrée. Quelles indications envoyer ?'),
  brief: b(
    'Élise is meeting you for a French lesson this evening. She asks where to go and which entrance to use. Check the three documents and send her the most useful message.',
    'Élise vous rejoint pour un cours de français ce soir. Elle vous demande où aller et par quelle entrée passer. Consultez les trois documents et choisissez le message le plus utile à lui envoyer.',
  ),
  documents: [
    {
      id: 'confirmation',
      kind: 'email',
      label: b('Confirmation email', 'Courriel de confirmation'),
      labelDetail: b('Monday · 6:20 p.m. · Language centre', 'Lundi · 18 h 20 · Centre de langues'),
      title: 'Confirmation de votre cours de jeudi',
      lines: [
        'Bonjour, votre cours de français est confirmé pour jeudi à dix-huit heures trente.',
        'Rendez-vous en salle douze. L’entrée principale se trouve rue des Lilas.',
      ],
      evidence: 'jeudi à dix-huit heures trente.',
      takeaway: b('The original email gives the time. The text updates the room but not the time.', 'Le courriel fixe l’heure. Le SMS change la salle, pas l’horaire.'),
    },
    {
      id: 'update',
      kind: 'sms',
      label: b('Text from the centre', 'SMS du centre'),
      labelDetail: b('Thursday · 4:45 p.m. · Language centre', 'Jeudi · 16 h 45 · Centre de langues'),
      title: 'Petit changement pour ce soir',
      lines: [
        'Bonjour ! À cause d’une réunion, le cours de ce soir aura lieu en salle huit, et non en salle douze.',
        'L’horaire ne change pas. À tout à l’heure !',
      ],
      evidence: 'le cours de ce soir aura lieu en salle huit, et non en salle douze.',
      takeaway: b('The same-day update replaces the room in the original email.', 'Le SMS du jour remplace le numéro de salle indiqué dans le courriel.'),
    },
    {
      id: 'entrance',
      kind: 'notice',
      label: b('Notice at the door', 'Avis à l’entrée'),
      labelDetail: b('Posted Thursday · Rue des Lilas', 'Affiché jeudi · rue des Lilas'),
      title: 'Accès au centre ce jeudi',
      lines: [
        'Ce jeudi, l’entrée rue des Lilas ferme à dix-huit heures pour travaux.',
        'Après cette heure, entrez par la cour, rue des Érables.',
      ],
      evidence: 'Après cette heure, entrez par la cour, rue des Érables.',
      takeaway: b('By 6:30 p.m., the main entrance will be closed. Use the courtyard on Rue des Érables.', 'À 18 h 30, l’entrée principale est fermée. Il faut passer par la cour, rue des Érables.'),
    },
  ],
  answers: [
    { message: 'On se retrouve à 18 h 30 en salle 12. Passe par la cour, rue des Érables.', feedback: b('The entrance is right, but room 12 was in the original email. Check the later text.', 'L’entrée est la bonne, mais la salle 12 figure dans le courriel d’origine. Le SMS plus récent indique un changement.') },
    { message: 'On se retrouve à 18 h 30 en salle 8. Entre par la rue des Lilas.', feedback: b('The room is right, but this entrance closes at 6 p.m. Check the notice at the door.', 'La salle est la bonne, mais cette entrée ferme à 18 h. Il faut aussi tenir compte de l’avis à la porte.') },
    { message: 'On se retrouve à 18 h 30 en salle 8. Passe par la cour, rue des Érables.', feedback: b('This message keeps the original time and combines the room update with the entrance notice.', 'Ce message conserve l’heure du courriel et tient compte à la fois du changement de salle et de la fermeture de l’entrée.') },
  ],
  correct: 2,
  tip: b('Before acting on a message, compare the dates and ask what each document changes. A room update does not automatically change the time or entrance.', 'Avant de suivre une consigne, comparez les dates et repérez ce que chaque document modifie. Un changement de salle n’annule pas automatiquement l’horaire ni les autres consignes.'),
}];

export const missionPath = (mission: ReadingMission, lang: Lang) => `${readingPath(lang)}mission/${mission.id}/`;
export const missionAudio = (document: MissionDocument) => document.lines.join(' ');
