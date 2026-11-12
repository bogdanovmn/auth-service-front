import axios from 'axios'
import { tokenStorage } from '@bogdanovmn/ssofw'
import { apiBaseUrl } from './api-base'

type TemporaryCodeResponse = {
    code: string
}

export function exchangeCredentialsToCode(
    email: string,
    password: string,
    clientUrl: string | null
): Promise<string> {
    return axios.post<TemporaryCodeResponse>(
        `${apiBaseUrl()}/sso/code`,
        { email, password, clientUrl }
    ).then(response => response.data.code)
}

export function exchangeJwtToCode(
    clientUrl: string | null,
    provider: string | null
): Promise<string> {
    return axios.put<TemporaryCodeResponse>(
        `${apiBaseUrl()}/sso/jwt`,
        {},
        {
            headers: tokenStorage.header(),
            params: {
                ...(clientUrl ? { clientUrl } : {}),
                ...(provider ? { provider } : {})
            }
        }
    ).then(response => response.data.code)
}
