import axios, {AxiosError} from 'axios'
import { AuthToken } from './auth-token'


type ErrorResponse = {
    code: number
    message: string
    exception: string
}

class UnauthenticatedError extends Error {
}

class AuthRequest {
    private authToken: AuthToken;

    constructor(authToken: AuthToken) {
        this.authToken = authToken
    }

    get<ResponseType>(url: string): ResponseType {
        return this.httpRequest<ResponseType>(() => this.directHttpRequest("GET", url))
    }

    logout(): Promise<void> {
        return this.httpRequest<Promise<void>>(() => this.authToken.revoke())
    }

    httpRequest<ResponseType>(requestFunction: () => ResponseType): ResponseType {
        try {
            return this.httpRequestTry<ResponseType>(requestFunction)
        } catch (error: any) {
            if (error instanceof UnauthenticatedError) {
                console.log("Try to refresh token")
                this.authToken.refreshJwtToken()
                console.log("Re-sending the request")
                return this.httpRequestTry<ResponseType>(requestFunction)
            }
        }
    }

    private httpRequestTry<ResponseType>(requestFunction: () => ResponseType): ResponseType {
        try {
            return requestFunction()
        } catch (error: any) {
            if (this.errorResponseCode(error) == 401 || this.errorResponseCode(error) == 403) {
                throw new UnauthenticatedError()
            } else {
                throw new Error(`Request error: ${this.errorResponseMessage(error)}`)
            }
        }
    }

    private directHttpRequest<ResponseType>(method: string, url: string): ResponseType {
        return axios<ResponseType>({
            method: method,
            url: url,
            headers: this.authToken.header()
        })
    }

    private errorResponseMessage(error: any): string {
        let errorMsg = 'An unexpected error occurred'
        if (axios.isAxiosError(error)) {
            errorMsg = error.response.data
        }
        return errorMsg
    }

    private errorResponseCode(error: any): number {
        let code = 0
        if (axios.isAxiosError(error)) {
            code = error.response.code
        }
        return code
    }

}

export default AuthRequest;