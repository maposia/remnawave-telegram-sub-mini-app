import { GetSubscriptionInfoByShortUuidCommand } from '@remnawave/backend-contract'

export async function fetchUserByTelegramId(initData: string
): Promise<GetSubscriptionInfoByShortUuidCommand.Response['response']> {
    try {
        const res = await fetch(`/api/getSubscriptionInfo`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ initData })
        })

        if (!res.ok) {
            if (res.status === 422) {
                const error = await res.json()
                throw new Error(error.message)
            }
            if(res.status === 400) {
                throw new Error('Bad request')
            }
            if(res.status === 500) {
                throw new Error('Connect to server')
            }
        }
        return await res.json()
    } catch (error) {
        throw error
    }
}
