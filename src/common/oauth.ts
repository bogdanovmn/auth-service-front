import { t } from '../i18n'

export type OAuthProvider = 'github' | 'vk'

const RETURN_URL_KEY = 'oauth.return-url'

function apiBaseUrl(): string {
    const base = (import.meta.env.VITE_SSO_SERVICE_URL as string | undefined) ?? ''
    return base.endsWith('/') ? base.slice(0, -1) : base
}

export function startOAuthLogin(provider: OAuthProvider, from: string | null | undefined): void {
    rememberReturnUrl(from)
    const url = new URL(
        `${apiBaseUrl()}/oauth2/authorization/${provider}`,
        window.location.origin
    )
    window.location.href = url.toString()
}

export function oauthErrorMessage(code: string): string {
    switch (code) {
        case 'access_denied':
            return t('login.oauthAccessDenied')
        case 'email_required':
            return t('login.oauthEmailRequired')
        case 'invalid_state':
            return t('login.oauthInvalidState')
        case 'unknown_provider':
            return t('login.oauthUnknownProvider')
        case 'account_unavailable':
            return t('login.oauthAccountUnavailable')
        default:
            return t('login.oauthFailed')
    }
}

export function storedReturnUrl(): string | null {
    return sessionStorage.getItem(RETURN_URL_KEY)
}

export function takeReturnUrl(): string | null {
    const url = storedReturnUrl()
    sessionStorage.removeItem(RETURN_URL_KEY)
    return url
}

export function redirectWithCode(url: string, code: string): void {
    sessionStorage.removeItem(RETURN_URL_KEY)
    const target = new URL(url)
    target.searchParams.append('code', code)
    window.location.href = target.toString()
}

function rememberReturnUrl(from: string | null | undefined): void {
    if (from) {
        sessionStorage.setItem(RETURN_URL_KEY, from)
    } else {
        sessionStorage.removeItem(RETURN_URL_KEY)
    }
}
