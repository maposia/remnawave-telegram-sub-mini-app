import {
    GetExternalSquadByUuidCommand,
    GetSubpageConfigByShortUuidCommand,
    GetSubscriptionInfoByShortUuidCommand,
    GetUsersStreamCommand
} from '@remnawave/backend-contract'
import { createHappCryptoLink } from '@kastov/cryptohapp'
import { AxiosError } from 'axios'
import { consola } from 'consola/browser'
import { isValid, parse } from '@telegram-apps/init-data-node'
import { instance } from '@/axios/instance'

const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN!
const isHappCryptoLinkEnabled = process.env.CRYPTO_LINK === 'true'
const isCustomSubdomain = process.env.CUSTOM_SUB_DOMAIN === 'true'

export async function POST(request: Request) {
    const botTokens = telegramBotToken.split(',')

    const parsedBody = await request.json()
    const initData = parsedBody.initData
    const requestedShortUuid =
        typeof parsedBody.shortUuid === 'string' ? parsedBody.shortUuid : undefined

    try {
        let isDataValid = false

        botTokens.forEach((botToken) => {
            if (isValid(initData, botToken)) {
                isDataValid = true
                return
            }
        })

        if (!isDataValid)
            return new Response(JSON.stringify({ error: 'Invalid initData' }), { status: 400 })

        const { user } = parse(initData)
        if (!user || !user.id)
            return new Response(JSON.stringify({ error: 'Invalid user data' }), { status: 400 })

        const panelUsers: GetUsersStreamCommand.Response['response']['users'] = []
        let cursor: string | undefined
        let hasMore = true

        while (hasMore) {
            const result = await instance.request<GetUsersStreamCommand.Response>({
                method: GetUsersStreamCommand.endpointDetails.REQUEST_METHOD,
                url: GetUsersStreamCommand.url,
                params: {
                    telegramId: user.id.toString(),
                    size: 1000,
                    ...(cursor ? { cursor } : {})
                }
            })

            if (result.status !== 200) {
                consola.error(`Error API: ${result.status} ${result.data}`)
                return new Response(JSON.stringify({ error: result.data }), {
                    status: result.status === 404 ? 422 : result.status
                })
            }

            panelUsers.push(...result.data.response.users)
            cursor = result.data.response.nextCursor ?? undefined
            hasMore = result.data.response.hasMore && Boolean(cursor)
        }

        const matchedUser = requestedShortUuid
            ? panelUsers.find((panelUser) => panelUser.shortUuid === requestedShortUuid)
            : panelUsers.find((panelUser) => panelUser.status === 'ACTIVE') || panelUsers[0]

        if (!matchedUser) {
            if (requestedShortUuid && panelUsers.length > 0) {
                return new Response(JSON.stringify({ message: 'Profile not found' }), {
                    status: 403
                })
            }

            return new Response(JSON.stringify({ message: 'Users not found' }), {
                status: 422
            })
        }

        const shortUuid = matchedUser.shortUuid

        const subpageConfig = await instance.request<GetSubpageConfigByShortUuidCommand.Response>({
            method: GetSubpageConfigByShortUuidCommand.endpointDetails.REQUEST_METHOD,
            url: GetSubpageConfigByShortUuidCommand.url(shortUuid),
            data: {
                requestHeaders: {
                    ...request.headers
                }
            }
        })

        if (subpageConfig.status !== 200) {
            consola.error('Error API:', subpageConfig.data)
            return new Response(JSON.stringify({ error: 'Failed to get subscription UUID' }), {
                status: 500
            })
        }

        const subscriptionInfo =
            await instance.request<GetSubscriptionInfoByShortUuidCommand.Response>({
                method: GetSubscriptionInfoByShortUuidCommand.endpointDetails.REQUEST_METHOD,
                url: GetSubscriptionInfoByShortUuidCommand.url(shortUuid)
            })

        if (subscriptionInfo.status !== 200) {
            consola.error('Error API:', subscriptionInfo.data)
            return new Response(JSON.stringify({ error: 'Failed to get subscription info' }), {
                status: 500
            })
        }

        const response = subscriptionInfo.data.response

        if (isCustomSubdomain) {
            const externalSquadId = matchedUser.externalSquadUuid
            if (externalSquadId) {
                const externalSquad =
                    await instance.request<GetExternalSquadByUuidCommand.Response>({
                        method: GetExternalSquadByUuidCommand.endpointDetails.REQUEST_METHOD,
                        url: GetExternalSquadByUuidCommand.url(externalSquadId)
                    })
                const customSubscriptionDomain =
                    externalSquad.data.response.responseHeadersAdd?.['X-Subscription-Domain']

                if (customSubscriptionDomain) {
                    const url = new URL(response.subscriptionUrl)
                    const customDomain = new URL(customSubscriptionDomain)
                    response.subscriptionUrl = `${customDomain.origin}${url.pathname}`
                }
            }
        }

        if (isHappCryptoLinkEnabled) {
            // // we need to remove links, ssConfLinks and subscriptionUrl from response
            response.links = []
            response.ssConfLinks = {}

            const cryptoLink = createHappCryptoLink(response.subscriptionUrl, 'v4', true)

            if (cryptoLink) {
                response.subscriptionUrl = cryptoLink
            } else {
                return new Response(JSON.stringify({ message: 'Error get sub link' }), {
                    status: 502
                })
            }
        }

        return new Response(
            JSON.stringify({
                ...response,
                subpageConfigUuid: subpageConfig.data.response.subpageConfigUuid,
                availableProfiles: panelUsers.map((panelUser) => ({
                    shortUuid: panelUser.shortUuid,
                    username: panelUser.username
                }))
            }),
            { status: 200 }
        )
    } catch (error) {
        if (error instanceof AxiosError) {
            if (error.response?.status === 404) {
                consola.error(
                    `Error API: ${error.response?.status} ${error.response?.data.message}`
                )
                return new Response(JSON.stringify({ message: 'Users not found' }), {
                    status: 422
                })
            }

            consola.error('Error:', error)

            return new Response(JSON.stringify({ message: 'Failed to get subscription info' }), {
                status: 500
            })
        }

        consola.error('Unexpected error:', error)
        return new Response(JSON.stringify({ message: 'An unexpected error occurred' }), {
            status: 500
        })
    }
}
