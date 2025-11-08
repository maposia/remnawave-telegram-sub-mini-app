import { GetSubscriptionInfoByShortUuidCommand } from '@remnawave/backend-contract'

type ApiErrorPayload = {
    error?: string
    message?: string
}

const getErrorMessage = (payload: ApiErrorPayload | null, fallback: string) =>
    payload?.message ?? payload?.error ?? fallback

export async function fetchUserByTelegramId(
    initDataRaw: string
): Promise<GetSubscriptionInfoByShortUuidCommand.Response['response']> {
    try {
        const res = await fetch(`/api/getSubscriptionInfo`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ initData: initDataRaw })
        })

        const payload = (await res.json().catch(() => null)) as
            | GetSubscriptionInfoByShortUuidCommand.Response['response']
            | ApiErrorPayload
            | null

        if (!res.ok) {
            const errorPayload = (payload as ApiErrorPayload | null) ?? null

            if (res.status === 422) {
                throw new Error(getErrorMessage(errorPayload, 'Users not found'))
            }

            if (res.status === 401) {
                throw new Error(getErrorMessage(errorPayload, 'Unauthorized'))
            }

            if (res.status === 500) {
                throw new Error('Connect to server')
            }

            throw new Error(getErrorMessage(errorPayload, 'Failed to fetch subscription info'))
        }

        if (!payload) {
            throw new Error('Empty server response')
        }

        return payload as GetSubscriptionInfoByShortUuidCommand.Response['response']
    } catch (error) {
        throw error
    }
}
