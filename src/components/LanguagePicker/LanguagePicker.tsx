import { getLanguageInfo, TSubscriptionPageLanguageCode } from '@remnawave/subscription-page-types'
import { ActionIcon, Menu, Text, useDirection } from '@mantine/core'
import { IconLanguage } from '@tabler/icons-react'
import { useEffect } from 'react'
import { vibrate } from '@/utils/vibrate'
import { setLocale } from '@/core/i18n/locale'

interface IProps {
    currentLang: TSubscriptionPageLanguageCode
    locales: TSubscriptionPageLanguageCode[]
    onLanguageChange: (lang: TSubscriptionPageLanguageCode) => void
}

export function LanguagePicker(props: IProps) {
    const { locales, currentLang, onLanguageChange } = props

    const { toggleDirection, dir } = useDirection()

    useEffect(() => {
        if (currentLang === 'fa' && dir === 'ltr') {
            toggleDirection()
        }
        if (currentLang !== 'fa' && dir === 'rtl') {
            toggleDirection()
        }
    }, [currentLang])

    useEffect(() => {
        setLocale(currentLang)
    }, [])

    const changeLanguage = (value: TSubscriptionPageLanguageCode) => {
        onLanguageChange(value)
        setLocale(value)
    }

    const items = locales.map((item) => {
        const localeInfo = getLanguageInfo(item)
        if (!localeInfo) return null
        return (
            <Menu.Item
                key={item}
                leftSection={<Text>{localeInfo.emoji}</Text>}
                onClick={() => {
                    vibrate('doubleTap')
                    changeLanguage(item)
                }}
            >
                {localeInfo.nativeName}
            </Menu.Item>
        )
    })

    if (locales.length === 1) return null

    return (
        <Menu position="bottom" width={150} withArrow={false} withinPortal>
            <Menu.Target>
                <ActionIcon
                    color="gray"
                    radius="md"
                    size="xl"
                    style={{
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}
                    variant="default"
                >
                    <IconLanguage size={22} />
                </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown mah={250} style={{ overflowY: 'auto' }}>
                {items}
            </Menu.Dropdown>
        </Menu>
    )
}
