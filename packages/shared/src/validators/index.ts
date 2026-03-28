/** Regex pour valider un slug de tenant */
export const SLUG_REGEX = /^[a-z0-9-]+$/;

/** Regex pour valider un mot de passe (min 8 chars, 1 majuscule, 1 minuscule, 1 chiffre) */
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

/** Regex pour valider une couleur hexadécimale */
export const HEX_COLOR_REGEX = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

/** Valide un slug de tenant */
export function isValidSlug(slug: string): boolean {
  return SLUG_REGEX.test(slug) && slug.length >= 3 && slug.length <= 63;
}

/** Valide un mot de passe selon les critères de complexité */
export function isValidPassword(password: string): boolean {
  return PASSWORD_REGEX.test(password);
}

/** Valide une couleur hexadécimale */
export function isValidHexColor(color: string): boolean {
  return HEX_COLOR_REGEX.test(color);
}

/** Valide un email */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
