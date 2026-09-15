import { ref } from 'vue';
import ru from './ru';
import en from './en';

export type Locale = 'ru' | 'en';

export type Messages = typeof ru;

export const messages: Record<Locale, Messages> = { ru, en };

const STORAGE_KEY = 'app-locale';
const DEFAULT_LOCALE: Locale = 'ru';

function getInitialLocale(): Locale {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'ru' || saved === 'en') {
        return saved;
    }
    return DEFAULT_LOCALE;
}

export const locale = ref<Locale>(getInitialLocale());

function applyDocumentLang(lang: Locale) {
    document.documentElement.lang = lang;
}

applyDocumentLang(locale.value);

export function setLocale(loc: Locale) {
    locale.value = loc;
    localStorage.setItem(STORAGE_KEY, loc);
    applyDocumentLang(loc);
}

type TranslationParams = Record<string, string | number>;

export function t(key: string, params?: TranslationParams): string {
    let value: any = messages[locale.value];
    for (const part of key.split('.')) {
        value = value?.[part];
    }
    if (typeof value === 'function') {
        return value(params ?? {});
    }
    if (value == null) {
        return key;
    }
    let result = String(value);
    if (params) {
        for (const [name, val] of Object.entries(params)) {
            result = result.split(`{${name}}`).join(String(val));
        }
    }
    return result;
}