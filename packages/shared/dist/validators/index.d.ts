/** Regex pour valider un slug de tenant */
export declare const SLUG_REGEX: RegExp;
/** Regex pour valider un mot de passe (min 8 chars, 1 majuscule, 1 minuscule, 1 chiffre) */
export declare const PASSWORD_REGEX: RegExp;
/** Regex pour valider une couleur hexadécimale */
export declare const HEX_COLOR_REGEX: RegExp;
/** Valide un slug de tenant */
export declare function isValidSlug(slug: string): boolean;
/** Valide un mot de passe selon les critères de complexité */
export declare function isValidPassword(password: string): boolean;
/** Valide une couleur hexadécimale */
export declare function isValidHexColor(color: string): boolean;
/** Valide un email */
export declare function isValidEmail(email: string): boolean;
//# sourceMappingURL=index.d.ts.map