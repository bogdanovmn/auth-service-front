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
    private url: string
    private retryableClient: AuthHttpClient

    constructor(url: string, retryableClient: AuthHttpClient) {
        this.url = url
        this.retryableClient = retryableClient
    }

    public applicationsOverview(): Promise<ApplictionsOverview[]> {
        return this.retryableClient.get<ApplictionsOverview[]>(
            `${this.url}/applications`
        )
    }
}