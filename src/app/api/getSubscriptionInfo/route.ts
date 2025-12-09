import {
    GetSubscriptionInfoByShortUuidCommand,
    GetUserByTelegramIdCommand
} from '@remnawave/backend-contract'
import axios, { AxiosError } from 'axios'
import {consola} from "consola/browser";
import { isValid, parse } from '@telegram-apps/init-data-node';


const baseUrl = process.env.REMNAWAVE_PANEL_URL
const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN!
const isHappCryptoLinkEnabled = process.env.CRYPTO_LINK === 'true'

const instance = axios.create({
    baseURL: baseUrl,
    headers: {
        Authorization: `Bearer ${process.env.REMNAWAVE_TOKEN}`
    }
})

if (baseUrl ? baseUrl.startsWith('http://') : false) {
    instance.defaults.headers.common['x-forwarded-for'] = '127.0.0.1'
    instance.defaults.headers.common['x-forwarded-proto'] = 'https'
}

if (process.env.AUTH_API_KEY) {
    instance.defaults.headers.common['X-Api-Key'] = `${process.env.AUTH_API_KEY}`
}

export async function POST(request: Request) {

    const parsedBody = await request.json()
    const initData = parsedBody.initData


    try {

        const isDataValid = isValid(initData, telegramBotToken);
        if (!isDataValid) return new Response(JSON.stringify({ error: 'Invalid initData' }), { status: 400 });

        const { user } = parse(initData);
        if (!user || !user.id) return new Response(JSON.stringify({ error: 'Invalid user data' }), { status: 400 });

        const result = await instance.request<GetUserByTelegramIdCommand.Response>({
            method: GetUserByTelegramIdCommand.endpointDetails.REQUEST_METHOD,
            url: GetUserByTelegramIdCommand.url(user.id.toString())
        })

        if (result.status !== 200) {
            consola.error(`Error API: ${result.status} ${result.data}`)
            return new Response(JSON.stringify({ error: result.data }), {
                status: result.status === 404 ? 422 : result.status
            })
        }

        if (result.data.response.length === 0) {
            return new Response(JSON.stringify({ error: 'Users not found' }), {
                status: 422
            })
        }

        const shortUuid = result.data.response[0].shortUuid

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

        if (isHappCryptoLinkEnabled) {
            // we need to remove links, ssConfLinks and subscriptionUrl from response
            response.links = []
            response.ssConfLinks = {}
            response.subscriptionUrl = response.happ.cryptoLink
        }

        return new Response(JSON.stringify(response), { status: 200 })
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

            return new Response(JSON.stringify({ error: 'Failed to get subscription info' }), {
                status: 500
            })
        }

        consola.error('Unexpected error:', error)
        return new Response(JSON.stringify({ error: 'An unexpected error occurred' }), {
            status: 500
        })
    }
}
