import axios from 'axios'
import jwt_decode from "jwt-decode";

type JwtResponse = {
    token: string
    refreshToken: string
}

export class AuthToken {
    private authServiceUrl: string
    private token?: string
    private refreshToken?: string

    constructor(authServiceUrl: string) {
        this.authServiceUrl = authServiceUrl
        this.token = localStorage.token
        this.refreshToken = localStorage.refreshToken
    }

    public header(): object {
        if (!this.token) {
            throw new Error("Can't find a JWT token")
        }
        return {
            'Authorization': `Bearer ${this.token}`
        }
    }

    public userName(): string {
        return this.defined()
            ? jwt_decode(this.token).userName
            : null
    }

    public defined() {
        return this.token != null
    }

    public createNewJwtTokenByCredentials(email: string, password: string): Promise<void> {
        return axios.post<JwtResponse>(
            this.authServiceUrl + "/jwt",
            { email: email, password: password }
        ).then((response: any) => {
            this.token = response.data.token;
            this.refreshToken = response.data.refreshToken;
            localStorage.setItem("token", this.token!)
            localStorage.setItem("refreshToken", this.refreshToken!)
            console.log("Token creating success")
        }).catch((error: any) => {
            console.log(`Can't get JWT using email "${email}"`)
            console.log(error)
            throw(error)
        })
    }

    public refreshJwtToken(): void {
        axios.put(
            this.authServiceUrl + "/jwt",
            { refreshToken: this.refreshJwtToken }
        ).then((response: any) => {
            this.token = response.data.token;
            this.refreshToken = response.data.refreshToken;
            localStorage.setItem("token", this.token!)
            localStorage.setItem("refreshToken", this.refreshToken!)
            console.log("Token refreshing success")
        }).catch((error: any) => {
            console.log(`Can't get JWT using refreshToken`)
            console.log(error.response.data)
            throw(error)
        })
    }

    public revoke(): Promise<void> {
        return axios.delete(
            this.authServiceUrl + "/jwt",
            { headers: this.header() }
        ).then((response: any) => {
            this.token = undefined
            this.refreshToken = undefined
            localStorage.removeItem("token")
            localStorage.removeItem("refreshToken")
            console.log("Token revoked success")
        }).catch((error: any) => {
            console.log(`Can't revoke refresh token`)
            console.log(error.response.data)
            throw (error)
        })
    }
}

let authTokenInstance: AuthToken

export function createAuthTokenInstance(authServiceUrl: string): AuthToken {
    authTokenInstance = new AuthToken(authServiceUrl)
    return authTokenInstance
}

export function authToken(): AuthToken {
    return authTokenInstance
}