import { FrenchLevel } from '../types/enums';

/** Niveaux de français supportés (A1 à C2) */
export const FRENCH_LEVELS = Object.values(FrenchLevel);

/** Taille maximale d'un fichier téléversé (50 Mo) */
export const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;

/** Types de fichiers acceptés pour les ressources */
export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

/** Extensions de fichiers acceptées */
export const ALLOWED_FILE_EXTENSIONS = [
  '.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx',
];

/** Durée du cache Redis pour le branding tenant (1 heure) */
export const CACHE_TTL_BRANDING = 3600;

/** Durée du cache Redis pour la résolution de tenant (5 minutes) */
export const CACHE_TTL_TENANT_RESOLVE = 300;

/** Durée de la période de grâce en jours */
export const GRACE_PERIOD_DAYS = 15;

/** Nombre maximum de tentatives de connexion avant verrouillage */
export const MAX_LOGIN_ATTEMPTS = 5;

/** Durée du verrouillage de compte en minutes */
export const ACCOUNT_LOCK_DURATION_MINUTES = 30;

/** Durée de validité du mot de passe en jours */
export const PASSWORD_EXPIRY_DAYS = 90;

/** Facteur de coût bcrypt */
export const BCRYPT_COST_FACTOR = 12;

/** Nombre maximum d'éléments par page */
export const MAX_PAGE_SIZE = 50;

/** Taille de page par défaut */
export const DEFAULT_PAGE_SIZE = 20;

/** Durée de validité du code OTP en minutes */
export const OTP_VALIDITY_MINUTES = 15;

/** Nombre maximum de tentatives OTP */
export const MAX_OTP_ATTEMPTS = 3;

/** Longueur du code d'accès de présence */
export const DEFAULT_ACCESS_CODE_LENGTH = 6;
