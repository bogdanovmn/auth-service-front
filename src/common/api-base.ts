export function apiBaseUrl(): string {
    const base = (import.meta.env.VITE_SSO_SERVICE_URL as string | undefined) ?? ''
    return base.endsWith('/') ? base.slice(0, -1) : base
}
