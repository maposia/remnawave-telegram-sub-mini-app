import {
    GetSubscriptionInfoByShortUuidCommand,
    GetUserByTelegramIdCommand
} from '@remnawave/backend-contract'
import axios, { AxiosError } from 'axios'
import { consola } from 'consola/browser'
import { createHmac, timingSafeEqual } from 'node:crypto'

const baseUrl = process.env.REMNAWAVE_PANEL_URL
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

type TelegramInitDataValidationResult =
    | {
          ok: true
          telegramId: string
      }
    | {
          ok: false
          status: number
          message: string
      }

function validateTelegramInitData(rawInitData: string): TelegramInitDataValidationResult {
    const botToken = process.env.TELEGRAM_BOT_TOKEN

    if (!botToken) {
        consola.error('Missing TELEGRAM_BOT_TOKEN env variable')
        return { ok: false, status: 500, message: 'Server misconfiguration' }
    }

    let params: URLSearchParams

    try {
        params = new URLSearchParams(rawInitData)
    } catch (error) {
        consola.warn('Invalid init data provided:', error)
        return { ok: false, status: 400, message: 'Invalid init data payload' }
    }

    const hash = params.get('hash')

    if (!hash) {
        return { ok: false, status: 401, message: 'Init data hash is missing' }
    }

    const dataCheckString = [...params.entries()]
        .filter(([key]) => key !== 'hash')
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => `${key}=${value}`)
        .join('\n')

    const secretKey = createHmac('sha256', 'WebAppData').update(botToken).digest()
    const computedHash = createHmac('sha256', secretKey).update(dataCheckString).digest()
    const providedHash = Buffer.from(hash, 'hex')

    if (
        providedHash.length !== computedHash.length ||
        !timingSafeEqual(providedHash, computedHash)
    ) {
        consola.warn('Invalid init data hash verification failed')
        return { ok: false, status: 401, message: 'Init data verification failed' }
    }

    const authDate = Number(params.get('auth_date') ?? 0)
    const now = Math.floor(Date.now() / 1000)

    if (!Number.isFinite(authDate) || authDate <= 0 || authDate > now + 60) {
        return { ok: false, status: 401, message: 'Init data auth_date is invalid' }
    }

    const configuredMaxAge = Number(process.env.TELEGRAM_INIT_DATA_TTL_SECONDS)
    const maxAgeSeconds =
        Number.isFinite(configuredMaxAge) && configuredMaxAge > 0 ? configuredMaxAge : 300
    if (now - authDate > maxAgeSeconds) {
        return { ok: false, status: 401, message: 'Init data expired' }
    }

    const userParam = params.get('user')

    if (!userParam) {
        return { ok: false, status: 401, message: 'Init data user is missing' }
    }

    try {
        const user = JSON.parse(userParam)

        if (!user?.id) {
            return { ok: false, status: 401, message: 'Init data user is invalid' }
        }

        return { ok: true, telegramId: String(user.id) }
    } catch (error) {
        consola.warn('Failed to parse init data user param', error)
        return { ok: false, status: 401, message: 'Init data user parsing failed' }
    }
}

export async function GET() {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405
    })
}

export async function POST(request: Request) {
    try {
        const body = await request.json().catch(() => null)
        const initDataRaw = body?.initData

        if (!initDataRaw) {
            return new Response(JSON.stringify({ error: 'initData is required' }), {
                status: 400
            })
        }

        const validationResult = validateTelegramInitData(initDataRaw)

        if (!validationResult.ok) {
            return new Response(JSON.stringify({ error: validationResult.message }), {
                status: validationResult.status
            })
        }

        const result = await instance.request<GetUserByTelegramIdCommand.Response>({
            method: GetUserByTelegramIdCommand.endpointDetails.REQUEST_METHOD,
            url: GetUserByTelegramIdCommand.url(validationResult.telegramId)
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
