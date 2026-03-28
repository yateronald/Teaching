"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HEX_COLOR_REGEX = exports.PASSWORD_REGEX = exports.SLUG_REGEX = void 0;
exports.isValidSlug = isValidSlug;
exports.isValidPassword = isValidPassword;
exports.isValidHexColor = isValidHexColor;
exports.isValidEmail = isValidEmail;
/** Regex pour valider un slug de tenant */
exports.SLUG_REGEX = /^[a-z0-9-]+$/;
/** Regex pour valider un mot de passe (min 8 chars, 1 majuscule, 1 minuscule, 1 chiffre) */
exports.PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
/** Regex pour valider une couleur hexadécimale */
exports.HEX_COLOR_REGEX = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
/** Valide un slug de tenant */
function isValidSlug(slug) {
    return exports.SLUG_REGEX.test(slug) && slug.length >= 3 && slug.length <= 63;
}
/** Valide un mot de passe selon les critères de complexité */
function isValidPassword(password) {
    return exports.PASSWORD_REGEX.test(password);
}
/** Valide une couleur hexadécimale */
function isValidHexColor(color) {
    return exports.HEX_COLOR_REGEX.test(color);
}
/** Valide un email */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
//# sourceMappingURL=index.js.map