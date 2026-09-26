import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

export type Lang = 'en' | 'fr';

/** The app's current language (the one the sign-in page switcher sets), as en or fr. */
export const currentLang = (language?: string): Lang => (String(language || '').toLowerCase().startsWith('fr') ? 'fr' : 'en');

/**
 * Bilingual text for the company space and the learner space: `tr('Learners', 'Apprenants')`.
 * Both languages sit side by side where the text is used, and follow the same
 * language as the rest of the app (i18next, remembered in localStorage).
 */
export function useTr() {
    const { i18n } = useTranslation();
    const lang = currentLang(i18n.language);
    const tr = useCallback((en: string, fr: string) => (lang === 'fr' ? fr : en), [lang]);
    const setLang = useCallback((next: Lang) => {
        if (currentLang(i18n.language) === next) return;
        i18n.changeLanguage(next);
        try { localStorage.setItem('i18n_lang', next); } catch { /* private mode */ }
    }, [i18n]);
    /** Dates and numbers in the current language. */
    const locale = lang === 'fr' ? 'fr-FR' : 'en-GB';
    return { tr, lang, setLang, locale };
}

/** "3 learners" / "1 learner" in the current language. */
export const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
