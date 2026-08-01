import { GetSubscriptionInfoByShortUuidCommand } from '@remnawave/backend-contract'

export interface SubscriptionProfile {
    shortUuid: string
    username: string
}

export type ExtendedSubscription = GetSubscriptionInfoByShortUuidCommand.Response['response'] & {
    subpageConfigUuid?: string | null
    availableProfiles: SubscriptionProfile[]
}

export interface IState {
    subscription: ExtendedSubscription | null
}
