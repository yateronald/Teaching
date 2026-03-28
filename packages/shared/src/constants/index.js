"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_ACCESS_CODE_LENGTH = exports.MAX_OTP_ATTEMPTS = exports.OTP_VALIDITY_MINUTES = exports.DEFAULT_PAGE_SIZE = exports.MAX_PAGE_SIZE = exports.BCRYPT_COST_FACTOR = exports.PASSWORD_EXPIRY_DAYS = exports.ACCOUNT_LOCK_DURATION_MINUTES = exports.MAX_LOGIN_ATTEMPTS = exports.GRACE_PERIOD_DAYS = exports.CACHE_TTL_TENANT_RESOLVE = exports.CACHE_TTL_BRANDING = exports.ALLOWED_FILE_EXTENSIONS = exports.ALLOWED_FILE_TYPES = exports.MAX_FILE_SIZE_BYTES = exports.FRENCH_LEVELS = void 0;
const enums_1 = require("../types/enums");
/** Niveaux de français supportés (A1 à C2) */
exports.FRENCH_LEVELS = Object.values(enums_1.FrenchLevel);
/** Taille maximale d'un fichier téléversé (50 Mo) */
exports.MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;
/** Types de fichiers acceptés pour les ressources */
exports.ALLOWED_FILE_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];
/** Extensions de fichiers acceptées */
exports.ALLOWED_FILE_EXTENSIONS = [
    '.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx',
];
/** Durée du cache Redis pour le branding tenant (1 heure) */
exports.CACHE_TTL_BRANDING = 3600;
/** Durée du cache Redis pour la résolution de tenant (5 minutes) */
exports.CACHE_TTL_TENANT_RESOLVE = 300;
/** Durée de la période de grâce en jours */
exports.GRACE_PERIOD_DAYS = 15;
/** Nombre maximum de tentatives de connexion avant verrouillage */
exports.MAX_LOGIN_ATTEMPTS = 5;
/** Durée du verrouillage de compte en minutes */
exports.ACCOUNT_LOCK_DURATION_MINUTES = 30;
/** Durée de validité du mot de passe en jours */
exports.PASSWORD_EXPIRY_DAYS = 90;
/** Facteur de coût bcrypt */
exports.BCRYPT_COST_FACTOR = 12;
/** Nombre maximum d'éléments par page */
exports.MAX_PAGE_SIZE = 50;
/** Taille de page par défaut */
exports.DEFAULT_PAGE_SIZE = 20;
/** Durée de validité du code OTP en minutes */
exports.OTP_VALIDITY_MINUTES = 15;
/** Nombre maximum de tentatives OTP */
exports.MAX_OTP_ATTEMPTS = 3;
/** Longueur du code d'accès de présence */
exports.DEFAULT_ACCESS_CODE_LENGTH = 6;
//# sourceMappingURL=index.js.map