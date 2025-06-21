import dayjs from 'dayjs'
import { useTranslations } from 'next-intl'
import 'dayjs/locale/en'
import 'dayjs/locale/ru'
import relativeTime from 'dayjs/plugin/relativeTime'
import prettyBytes from 'pretty-bytes'

export const calculateDaysLeft = (expireAt: string | Date): number => {
    const now = dayjs()
    const expirationDate = dayjs(expireAt)
    const diffInDays = expirationDate.diff(now, 'day')

    return diffInDays > 0 ? diffInDays : 0
}

dayjs.extend(relativeTime)
export function getExpirationTextUtil(
    expireAt: Date | null | string,
    t: ReturnType<typeof useTranslations>,
    locale: string
): string {
    if (!expireAt) {
        return t('get-expiration-text.util.unknown')
    }

    const expiration = dayjs(expireAt).locale(locale)
    const now = dayjs()
    if (expiration.isBefore(now)) {
        return t('get-expiration-text.util.expired', {
            expiration: expiration.fromNow(false)
        })
    }

    if (expiration.isAfter(now.add(50, 'year'))) {
        return t('get-expiration-text.util.infinity')
    }

    return t('get-expiration-text.util.expires-in', {
        expiration: expiration.fromNow(false)
    })
}

export function bytesToGigabytes(bytes: number | string, decimals: number = 2): string {
    if (Number(bytes) < 0) {
        throw new Error('Количество байтов не может быть отрицательным')
    }
    return prettyBytes(Number(bytes), {
        maximumFractionDigits: 2
    })
}
