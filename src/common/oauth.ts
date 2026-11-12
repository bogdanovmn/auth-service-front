import axios from 'axios'
import { t } from '../i18n'
import { apiBaseUrl } from './api-base'

export type OAuthProvider = 'github' | 'vk' | 'yandex'

const OAUTH_PROVIDERS: readonly string[] = ['github', 'vk', 'yandex']

const RETURN_URL_KEY = 'oauth.return-url'
const PROVIDER_KEY = 'oauth.provider'

export function fetchEnabledProviders(): Promise<OAuthProvider[]> {
    return axios.get<string[]>(`${apiBaseUrl()}/oauth2/providers`)
        .then(response => (response.data ?? []).filter(isOAuthProvider))
        .catch(error => {
            console.warn('Failed to load OAuth providers:', error)
            return []
        })
}

function isOAuthProvider(value: unknown): value is OAuthProvider {
    return typeof value === 'string' && OAUTH_PROVIDERS.includes(value)
}

export function startOAuthLogin(provider: OAuthProvider, from: string | null | undefined): void {
    rememberReturnUrl(from)
    sessionStorage.setItem(PROVIDER_KEY, provider)
    const url = new URL(
        `${apiBaseUrl()}/oauth2/authorization/${provider}`,
        window.location.origin
    )
    if (from) {
        url.searchParams.set('clientUrl', from)
    }
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

export function takeOAuthProvider(): string | null {
    const provider = sessionStorage.getItem(PROVIDER_KEY)
    sessionStorage.removeItem(PROVIDER_KEY)
    return provider
}

export function redirectWithCode(url: string, code: string): void {
    sessionStorage.removeItem(RETURN_URL_KEY)
    sessionStorage.removeItem(PROVIDER_KEY)
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
