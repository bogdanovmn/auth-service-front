import axios from 'axios'

type JwtResponse = {
    token: string
    refreshToken: string
}

class AuthToken {
    private authServiceUrl: string
    private token!: string
    private refreshToken!: string

    constructor(authServiceUrl: string) {
        this.authServiceUrl = authServiceUrl
    }

    public header(): object {
        if (!this.token) {
            throw new Error("Can't find a JWT token")
        }
        return {
            'Authorization': `Bearer ${this.token}`
        }
    }

    public createNewJwtTokenByCredentials(email: string, password: string): void {
        axios.post<JwtResponse>(
            this.authServiceUrl + "/jwt",
            { email: email, password: password }
        ).then((response: any) => {
            this.token = response.data.token;
            this.refreshToken = response.data.refreshToken;
            localStorage.setItem("token", this.token)
            localStorage.setItem("refreshToken", this.refreshToken)
            console.log("Token creating success")
        }).catch((error: any) => {
            console.log(`Can't get JWT using email "${email}"`)
            console.log(error)
        })
    }

    public refreshJwtToken(): void {
        axios.put(
            this.authServiceUrl + "/jwt",
            { refreshToken: this.refreshJwtToken }
        ).then((response: any) => {
            this.token = response.data.token;
            this.refreshToken = response.data.refreshToken;
            localStorage.setItem("token", this.token)
            localStorage.setItem("refreshToken", this.refreshToken)
            console.log("Token refreshing success")
        }).catch((error: any) => {
            console.log(`Can't get JWT using refreshToken`)
            console.log(error.response.data)
        })
    }
}

export default AuthToken