import {Link} from "@/components/Link/Link";

require('dotenv').config()

import { useEffect, useLayoutEffect, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'

import { Box, Button, Group, Select, Text } from '@mantine/core'
import { useOs } from '@mantine/hooks'
import {
    IconBrandAndroid,
    IconBrandApple, IconBrandWindows,
    IconDeviceDesktop,
    IconExternalLink
} from '@tabler/icons-react'

import {IAppConfig, ISubscriptionPageAppConfig, TEnabledLocales, TPlatform} from '@/types/appList'
import { BaseInstallationGuideWidget } from '@/components/BaseInstallationGuideWidget/BaseInstallationGuideWidget'
import { GetSubscriptionInfoByShortUuidCommand } from '@remnawave/backend-contract'

export const InstallationGuideWidget = ({
    appsConfig,
    user,
    isCryptoLinkEnabled,
    redirectLink,
    enabledLocales
}: {
    appsConfig: ISubscriptionPageAppConfig['platforms']
    user: GetSubscriptionInfoByShortUuidCommand.Response['response']
    isCryptoLinkEnabled: boolean | undefined
    redirectLink: string | undefined
    enabledLocales: TEnabledLocales[]
}) => {
    const t = useTranslations()
    const lang = useLocale()

    const os = useOs()

    const [currentLang, setCurrentLang] = useState<TEnabledLocales>('en')
    const [defaultTab, setDefaultTab] = useState('pc')

    // Filter apps with URL schemes starting with 'happ' if isCryptoLinkEnabled is true
    // Otherwise use the full appsConfig
    const filteredConfig = isCryptoLinkEnabled
        ? {
        ...appsConfig,
              ios: appsConfig.ios.filter((app) => app.urlScheme.startsWith('happ')),
              android: appsConfig.android.filter((app) => app.urlScheme.startsWith('happ')),
              pc: appsConfig.windows.filter((app) => app.urlScheme.startsWith('happ')),
              macos: appsConfig.macos.filter((app) => app.urlScheme.startsWith('happ')),
              linux: appsConfig.windows.filter((app) => app.urlScheme.startsWith('happ'))

        }
        : appsConfig

    useEffect(() => {
        if (lang) {

        if (lang.startsWith('en')) {
            setCurrentLang('en')
        } else if (lang.startsWith('fa') && enabledLocales.includes('fa')) {
            setCurrentLang('fa')
        } else if (lang.startsWith('ru') && enabledLocales.includes('ru')) {
            setCurrentLang('ru')
        } else if (lang.startsWith('zh') && enabledLocales.includes('zh')) {
            setCurrentLang('zh')
        } else {
            setCurrentLang('en')
        }

        }

    }, [lang])

    useLayoutEffect(() => {
        switch (os) {
            case 'android':
                setDefaultTab('android')
                break
            case 'ios':
                setDefaultTab('ios')
                break
            case 'linux':
                setDefaultTab('linux')
                break
            case 'macos':
                setDefaultTab('macos')
                break
            case 'windows':
                setDefaultTab('windows')
                break
            default:
                setDefaultTab('windows')
                break
        }
    }, [os])

    if (!user) return null

    const hasPlatformApps = {
        ios: appsConfig.ios && appsConfig.ios.length > 0,
        android: appsConfig.android && appsConfig.android.length > 0,
        linux: appsConfig.linux && appsConfig.linux.length > 0,
        macos: appsConfig.macos && appsConfig.macos.length > 0,
        windows: appsConfig.windows && appsConfig.windows.length > 0,
        androidTV: appsConfig.androidTV && appsConfig.androidTV.length > 0,
        appleTV: appsConfig.appleTV && appsConfig.appleTV.length > 0
    }


    const { subscriptionUrl } = user

    const openDeepLink = (urlScheme: string, isNeedBase64Encoding: boolean | undefined) => {
        if (isNeedBase64Encoding) {
            const encoded = btoa(`${subscriptionUrl}`)
            const encodedUrl = `${urlScheme}${encoded}`
            window.open(encodedUrl, '_blank')
        } else if (urlScheme.startsWith('happ') && isCryptoLinkEnabled) {
            // return os === 'windows' || os === 'linux' || os === 'macos'
                return window.open(`${redirectLink}${user.happ.cryptoLink}`, '_blank')
                // : window.open(user.happ.cryptoLink, '_blank')
        } else {
            // return os === 'windows' || os === 'linux' || os === 'macos'
                return window.open(`${redirectLink}${urlScheme}${subscriptionUrl}`, '_blank')
                // : window.open(`${urlScheme}${subscriptionUrl}`)
        }
    }

    const availablePlatforms = [
        hasPlatformApps.android && {
            value: 'android',
            label: 'Android',
            icon: <IconBrandAndroid />
        },
        hasPlatformApps.ios && {
            value: 'ios',
            label: 'iOS',
            icon: <IconBrandApple />
        },
        hasPlatformApps.macos && {
            value: 'macos',
            label: 'macOS',
            icon: <IconBrandApple />
        },
        hasPlatformApps.windows && {
            value: 'windows',
            label: 'Windows',
            icon: <IconBrandWindows />
        },
        hasPlatformApps.linux && {
            value: 'linux',
            label: 'Linux',
            icon: <IconDeviceDesktop />
        },
        hasPlatformApps.androidTV && {
            value: 'androidTV',
            label: 'Android TV',
            icon: <IconBrandAndroid />
        },
        hasPlatformApps.appleTV && {
            value: 'appleTV',
            label: 'Apple TV',
            icon: <IconBrandApple />
        }
    ].filter(Boolean) as {
        icon: React.ReactNode
        label: string
        value: string
    }[]

    if (
        !hasPlatformApps[defaultTab as keyof typeof hasPlatformApps] &&
        availablePlatforms.length > 0
    ) {
        setDefaultTab(availablePlatforms[0].value)
    }

    const getAppsForPlatform = (platform: TPlatform) => {
        return appsConfig[platform] || []
    }

    const getSelectedAppForPlatform = (platform: TPlatform) => {
        const apps = getAppsForPlatform(platform)
        if (apps.length === 0) return null
        return apps[0]
    }

    const renderFirstStepButton = (app: IAppConfig) => {
        if (app.installationStep.buttons.length > 0) {
            return (
                <Group>
                    {app.installationStep.buttons.map((button, index) => {
                        const buttonText = button.buttonText[currentLang] || button.buttonText.en

                        return (
                            <Button
                                component={Link}
                                href={button.buttonLink}
                                key={index}
                                leftSection={<IconExternalLink size={16} />}
                                target="_blank"
                                variant="light"
                            >
                                {buttonText}
                            </Button>
                        )
                    })}
                </Group>
            )
        }

        return null
    }

    const getPlatformTitle = (platform: 'android' | 'ios' | 'pc') => {
        if (platform === 'android') {
            return t('installation-guide.android.widget.install-and-open-app', {
                appName: '{appName}'
            })
        }
        if (platform === 'ios') {
            return t('installation-guide.ios.widget.install-and-open-app', {
                appName: '{appName}'
            })
        }
        return t('installation-guide.pc.widget.download-app', {
            appName: '{appName}'
        })
    }

    return (
        <Box>
            <Group justify="space-between" mb="md">
                <Text fw={700} size="xl">
                    {t('installation-guide.widget.installation')}
                </Text>

                {availablePlatforms.length > 1 && (
                    <Select
                        allowDeselect={false}
                        data={availablePlatforms.map((opt) => ({
                            value: opt.value,
                            label: opt.label
                        }))}
                        leftSection={
                            availablePlatforms.find((opt) => opt.value === defaultTab)?.icon
                        }
                        onChange={(value) => setDefaultTab(value || '')}
                        placeholder={t('installation-guide.widget.select-device')}
                        radius="md"
                        size="sm"
                        style={{ width: 140 }}
                        value={defaultTab}
                    />
                )}
            </Group>

            <BaseInstallationGuideWidget
                appsConfig={filteredConfig}
                currentLang={currentLang}
                firstStepTitle={getPlatformTitle(defaultTab as 'android' | 'ios' | 'pc')}
                getAppsForPlatform={getAppsForPlatform}
                getSelectedAppForPlatform={getSelectedAppForPlatform}
                openDeepLink={openDeepLink}
                isCryptoLinkEnabled={isCryptoLinkEnabled}
                platform={defaultTab as TPlatform}
                renderFirstStepButton={renderFirstStepButton}
            />
        </Box>
    )
}
