import { AuthHttpClient } from "@bogdanovmn/ssofw"


export type ApplictionsOverview = {
    id: number;
    name: string;
    roles: RoleStat[]
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
}