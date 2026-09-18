import { AuthHttpClient } from "@bogdanovmn/ssofw"
import axios from "axios"


export type ApplictionsOverview = {
    id: number;
    name: string;
    roles: RoleStat[]
}

export type UserRecord = {
    id: string;
    name: string;
    email: string;
    status: string;
    createdAt: string;
    updatedAt: string;
}

export type PasswordResetLink = {
    token: string;
    expiresAt: string;
    ttlInMinutes: number;
}

type RoleStat = {
    name: string;
    usersCount: number;
}


export class SsoResourcesService {
    private retryableClient: AuthHttpClient

    constructor(retryableClient: AuthHttpClient) {
        this.retryableClient = retryableClient
    }

    public applicationsOverview(): Promise<ApplictionsOverview[]> {
        return this.retryableClient.get<ApplictionsOverview[]>(
            '/applications'
        )
    }

    public users(): Promise<UserRecord[]> {
        return this.retryableClient.get<UserRecord[]>(
            '/users'
        )
    }

    public createPasswordResetLink(userId: string): Promise<PasswordResetLink> {
        return this.retryableClient.post<PasswordResetLink>(
            `/users/${userId}/password-reset`
        )
    }

    public changePasswordByResetToken(token: string, newPassword: string): Promise<void> {
        return axios.put(
            `${import.meta.env.VITE_SSO_SERVICE_URL}/password-reset`,
            {
                token: token,
                password: newPassword
            }
        )
    }
}