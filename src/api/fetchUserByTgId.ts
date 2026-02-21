import { GetSubscriptionInfoByShortUuidCommand } from '@remnawave/backend-contract'
import { consola } from 'consola'
import { AxiosError } from 'axios'

export async function fetchUserByTelegramId(
    initData: string
): Promise<GetSubscriptionInfoByShortUuidCommand.Response['response']> {
    try {
        const res = await fetch(`/api/getSubscriptionInfo`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ initData })
        })

        if (res.ok) {
            return await res.json()
        } else {
            let errorBody: { message?: string } | null = null
            try {
                errorBody = await res.json()
            } catch {
                errorBody = null
            }

            if (errorBody?.message === 'Error get sub link') {
                throw new AxiosError('Error get sub link', 'ERR_GET_SUB_LINK')
            }

            if (res.status === 422) {
                throw new Error(errorBody?.message ?? 'Users not found')
            }
            if (res.status === 400) {
                throw new Error('Bad request')
            }
            if (res.status === 500) {
                throw new Error('Connect to server')
            }

            throw new AxiosError('Error get sub link', 'ERR_GET_SUB_LINK')
        }
    } catch (error) {
        consola.error('Fail get user by telegram Id:', error)
        throw error
    }
}
