import { b, type Lang, type Level, type T, type Voice } from '../types';
import { readingPath } from './meta';
import { additionalMissions } from './missionSeries';

type MissionDocument = {
  id: string;
  kind: 'email' | 'sms' | 'notice';
  label: T;
  labelDetail: T;
  title: string;
  lines: string[];
  voice?: Voice;
  /** The passage to pick; the rest of the document remains available for context. */
  clue: { line: number; highlight: string; question: T; hint: T; retry: T; label: T; value: string; messagePart: string };
  takeaway: T;
};

export type ReadingMission = {
  id: string;
  level: Level;
  minutes: number;
  title: T;
  summary: T;
  brief: T;
  documents: MissionDocument[];
  recipient: string;
  outcome?: { title: T; action: T };
  tip: T;
};

const pilotMission: ReadingMission = {
  id: 'le-cours-a-change-de-salle',
  level: 'B1',
  minutes: 5,
  title: b('The classroom has changed', 'Le cours a changé de salle'),
  summary: b('Find one clue at a time and build a message for Élise.', 'Repérez un indice à la fois et construisez un message pour Élise.'),
  brief: b(
    'Élise is joining you for class tonight. Find the time, the new room and the right entrance for her.',
    'Élise vous rejoint pour le cours de ce soir. Retrouvez l’heure, la nouvelle salle et la bonne entrée pour lui répondre.',
  ),
  recipient: 'Élise',
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
      clue: {
        line: 0, highlight: 'à dix-huit heures trente',
        question: b('Which sentence gives the time of the class?', 'Quelle phrase donne l’heure du cours ?'),
        hint: b('Look for the word « heures » after a number.', 'Cherchez le mot « heures » après un nombre.'),
        retry: b('This sentence gives a place, not a time. Look for when the class starts.', 'Cette phrase donne un lieu, pas une heure. Cherchez à quel moment le cours commence.'),
        label: b('Time', 'Heure'), value: '18 h 30', messagePart: 'Le cours commence à 18 h 30.',
      },
      takeaway: b('« Dix-huit heures trente » means 6:30 p.m. The email gives you the starting time.', '« Dix-huit heures trente », c’est 18 h 30. Vous pouvez noter l’heure du cours.'),
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
      clue: {
        line: 0, highlight: 'en salle huit, et non en salle douze',
        question: b('Which sentence tells you which room to go to now?', 'Quelle phrase indique la nouvelle salle ?'),
        hint: b('Look for « aura lieu ». It indicates where the class is going to take place.', 'Cherchez « aura lieu ». Cette expression indique où le cours va se dérouler.'),
        retry: b('This confirms the time stays the same. Look for what changes in the text message.', 'Cette phrase confirme que l’heure ne change pas. Cherchez ce que le SMS modifie.'),
        label: b('New room', 'Nouvelle salle'), value: 'Salle 8', messagePart: 'On se retrouve en salle 8.',
      },
      takeaway: b('« En salle huit, et non en salle douze » replaces room 12 with room 8. « L’horaire ne change pas » keeps the time from the email.', '« Et non » écarte l’ancienne salle : c’est la salle 8, pas la 12. « L’horaire ne change pas » confirme l’heure du courriel.'),
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
      clue: {
        line: 1, highlight: 'entrez par la cour, rue des Érables',
        question: b('Élise arrives at 6:30 p.m. Which sentence tells her where to enter?', 'Élise arrive à 18 h 30. Quelle phrase lui dit par où entrer ?'),
        hint: b('The first sentence gives the closing time. Look for the instruction that applies after 6 p.m.', 'La première phrase donne l’heure de fermeture. Cherchez la consigne qui s’applique après 18 h.'),
        retry: b('This tells you which entrance closes. Find the sentence that directs Élise to the other one.', 'Cette phrase dit quelle entrée ferme. Cherchez celle qui indique l’autre entrée.'),
        label: b('Entrance', 'Entrée'), value: 'Rue des Érables', messagePart: 'Passe par la cour, rue des Érables.',
      },
      takeaway: b('« Après cette heure » refers to 6 p.m. Since 6:30 p.m. is later, Élise should go through the courtyard.', '« Après cette heure » renvoie à 18 h. À 18 h 30, l’entrée des Lilas est donc fermée : Élise doit passer par la cour.'),
    },
  ],
  tip: b('Before acting on a message, compare the dates and ask what each document changes. A room update does not automatically change the time or entrance.', 'Avant de suivre une consigne, comparez les dates et repérez ce que chaque document modifie. Un changement de salle n’annule pas automatiquement l’horaire ni les autres consignes.'),
};

export const MISSIONS = [pilotMission, ...additionalMissions].sort((a, b) => a.level.localeCompare(b.level));

export const missionPath = (mission: ReadingMission, lang: Lang) => `${readingPath(lang)}mission/${mission.id}/`;
/** Picture key (public/learn/img, scripts/learn-images.json). */
export const missionCoverKey = (mission: ReadingMission) => `mission-${mission.id}`;
export const missionAudio = (document: MissionDocument) => document.lines.join(' ');
export const missionVoice = (document: MissionDocument): Voice => document.voice ?? 'f';
