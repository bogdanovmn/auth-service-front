import { t } from '../i18n';

export function retryAfterSeconds(err: any): number | null {
    const headers = err?.response?.headers;
    const raw = headers?.['retry-after'] ?? headers?.['Retry-After'];
    const seconds = Number(raw);
    return Number.isFinite(seconds) && seconds > 0 ? Math.ceil(seconds) : null;
}

export function tooManyAttemptsMessage(err: any): string {
    const seconds = retryAfterSeconds(err);
    return seconds
        ? t('errors.tooManyAttempts', { seconds })
        : t('errors.tooManyAttempts');
}
