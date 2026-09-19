import { AuthHttpClient } from "@bogdanovmn/ssofw"
import axios from "axios"


export type ApplictionsOverview = {
    id: number;
    name: string;
    shortDescription: string | null;
    url: string | null;
    roles: RoleStat[]
}

export type AvailableService = {
    name: string;
    shortDescription: string | null;
    url: string;
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

export type UserActivityEvent = {
    id: string;
    type: string;
    ip: string | null;
    userAgent: string | null;
    createdAt: string;
}

export type UserActivity = {
    account: {
        id: string;
        name: string;
        email: string;
    }
    events: UserActivityEvent[]
}

export type LoginAttempt = {
    id: string;
    email: string;
    ip: string | null;
    userAgent: string | null;
    createdAt: string;
}

type RoleStat = {
    name: string;
    usersCount: number;
}

export type UpdateApplicationRequest = {
    name: string;
    shortDescription: string | null;
    url: string | null;
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

    public availableServices(): Promise<AvailableService[]> {
        return this.retryableClient.get<AvailableService[]>(
            '/applications/public'
        )
    }

    public updateApplication(id: number, app: UpdateApplicationRequest): Promise<void> {
        return this.retryableClient.put<void>(
            `/applications/${id}`,
            app
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

    public userActivity(userId: string): Promise<UserActivity> {
        return this.retryableClient.get<UserActivity>(
            `/users/${userId}/activity`
        )
    }

    public loginAttempts(): Promise<LoginAttempt[]> {
        return this.retryableClient.get<LoginAttempt[]>(
            '/login-attempts'
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