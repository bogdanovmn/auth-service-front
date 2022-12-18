import axios, {AxiosError} from 'axios'
import AuthToken from './auth-token'


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

    get<ResponseType>(url: string) {
        return this.httpRequest("GET", url)
    }

    httpRequest<ResponseType>(method: string, url: string): ResponseType {
        try {
            return this.httpRequestTry(method, url)
        } catch (error: any) {
            if (error instanceof UnauthenticatedError) {
                console.log("Try to refresh token")
                this.authToken.refreshJwtToken()
                console.log("Re-sending the request")
                return this.httpRequestTry(method, url)
            }
            throw new Error(`${method} ${url} error: ${this.errorResponseMessage(error)}`)
        }
    }

    createToken(email: string, password: string): void {
        this.authToken.createNewJwtTokenByCredentials(email, password)
    }

    private httpRequestTry<ResponseType>(method: string, url: string): ResponseType {
        try {
            return axios<ResponseType>({
                method: method,
                url: url,
                headers: this.authToken.header()
            })

        } catch (error: any) {
            if (this.errorResponseCode(error) == 401) {
                throw new UnauthenticatedError()
            } else {
                throw new Error(`${method} ${url} error: ${this.errorResponseMessage(error)}`)
            }
        }
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