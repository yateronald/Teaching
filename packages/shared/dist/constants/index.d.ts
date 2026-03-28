import { FrenchLevel } from '../types/enums';
/** Niveaux de français supportés (A1 à C2) */
export declare const FRENCH_LEVELS: FrenchLevel[];
/** Taille maximale d'un fichier téléversé (50 Mo) */
export declare const MAX_FILE_SIZE_BYTES: number;
/** Types de fichiers acceptés pour les ressources */
export declare const ALLOWED_FILE_TYPES: string[];
/** Extensions de fichiers acceptées */
export declare const ALLOWED_FILE_EXTENSIONS: string[];
/** Durée du cache Redis pour le branding tenant (1 heure) */
export declare const CACHE_TTL_BRANDING = 3600;
/** Durée du cache Redis pour la résolution de tenant (5 minutes) */
export declare const CACHE_TTL_TENANT_RESOLVE = 300;
/** Durée de la période de grâce en jours */
export declare const GRACE_PERIOD_DAYS = 15;
/** Nombre maximum de tentatives de connexion avant verrouillage */
export declare const MAX_LOGIN_ATTEMPTS = 5;
/** Durée du verrouillage de compte en minutes */
export declare const ACCOUNT_LOCK_DURATION_MINUTES = 30;
/** Durée de validité du mot de passe en jours */
export declare const PASSWORD_EXPIRY_DAYS = 90;
/** Facteur de coût bcrypt */
export declare const BCRYPT_COST_FACTOR = 12;
/** Nombre maximum d'éléments par page */
export declare const MAX_PAGE_SIZE = 50;
/** Taille de page par défaut */
export declare const DEFAULT_PAGE_SIZE = 20;
/** Durée de validité du code OTP en minutes */
export declare const OTP_VALIDITY_MINUTES = 15;
/** Nombre maximum de tentatives OTP */
export declare const MAX_OTP_ATTEMPTS = 3;
/** Longueur du code d'accès de présence */
export declare const DEFAULT_ACCESS_CODE_LENGTH = 6;
//# sourceMappingURL=index.d.ts.map