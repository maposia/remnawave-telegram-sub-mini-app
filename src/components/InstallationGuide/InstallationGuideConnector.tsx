import { useState } from 'react'
import clsx from 'clsx'
import {
    TSubscriptionPageAppConfig,
    TSubscriptionPageButtonConfig,
    TSubscriptionPagePlatformKey
} from '@remnawave/subscription-page-types'
import {
    Box,
    Button,
    ButtonVariant,
    Card,
    Group,
    NativeSelect,
    Stack,
    Title,
    UnstyledButton
} from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { useClipboard } from '@mantine/hooks'

import { IBlockRendererProps } from './components/blocks/rendererBlock.interface'
import classes from './InstallationGuide.module.css'
import { useSubscriptionConfig } from '@/store/subscriptionConfig'
import { useSubscription } from '@/store/subscriptionInfo'
import { getIconFromLibrary } from '@/utils/configParser'
import { TemplateEngine } from '@/utils/templateEngine'
import { vibrate } from '@/utils/vibrate'
import { useTranslation } from '@/hooks/useTranslations'
import { useAppConfigStoreInfo } from '@/store/appConfig'
import { retrieveLaunchParams } from '@telegram-apps/sdk-react'
import { Link } from '@/components/Link/Link'

export type TBlockVariant = 'accordion' | 'cards' | 'minimal' | 'timeline'

interface IProps {
    BlockRenderer: React.ComponentType<IBlockRendererProps>
    hasPlatformApps: Record<TSubscriptionPagePlatformKey, boolean>
    platform: TSubscriptionPagePlatformKey | undefined
}

export const InstallationGuideConnector = (props: IProps) => {
    const { hasPlatformApps, BlockRenderer, platform } = props

    const { t, currentLang, baseTranslations } = useTranslation()

    const { platforms, svgLibrary } = useSubscriptionConfig()
    const { copy } = useClipboard({ timeout: 2_000 })
    const subscription = useSubscription()
    const { appConfig } = useAppConfigStoreInfo()
    const launchParams = retrieveLaunchParams()
    const { tgWebAppPlatform: tgPlatform } = launchParams
    const isTDesktop = tgPlatform === 'tdesktop'

    const [selectedAppIndex, setSelectedAppIndex] = useState(0)
    const [selectedPlatform, setSelectedPlatform] = useState<TSubscriptionPagePlatformKey>(() => {
        if (platform && hasPlatformApps[platform]) {
            return platform
        }

        const firstAvailable = (
            Object.keys(hasPlatformApps) as TSubscriptionPagePlatformKey[]
        ).find((key) => hasPlatformApps[key])
        return firstAvailable!
    })

    const platformApps = platforms[selectedPlatform]!.apps
    const selectedApp = platformApps[selectedAppIndex] ?? platformApps[0]

    const availablePlatforms = (
        Object.entries(hasPlatformApps) as [TSubscriptionPagePlatformKey, boolean][]
    )
        .filter(([_, hasApps]) => hasApps)
        .map(([platform]) => {
            const platformConfig = platforms[platform]!
            return {
                value: platform,
                label: t(platformConfig.displayName),
                icon: getIconFromLibrary(platformConfig.svgIconKey, svgLibrary)
            }
        })

    const subscriptionUrl = subscription.subscriptionUrl

    const getRedirectUrl = (formattedUrl?: string) => {
        if (!formattedUrl) return undefined

        if (appConfig?.redirectLink) {
            return `${appConfig.redirectLink}${formattedUrl}`
        }

        return `/redirect?formattedUrl=${encodeURIComponent(formattedUrl)}`
    }

    const renderBlockButtons = (
        buttons: TSubscriptionPageButtonConfig[],
        variant: ButtonVariant
    ) => {
        if (buttons.length === 0) return null

        return (
            <Group gap="xs" wrap="wrap">
                {buttons.map((button, index) => {
                    let formattedUrl: string | undefined
                    if (button.type === 'subscriptionLink' || button.type === 'copyButton') {
                        const isCryptoActive = selectedApp.name === 'Happ' && appConfig?.cryptoLink
                        if (isCryptoActive) {
                            formattedUrl = subscriptionUrl
                        } else {
                            formattedUrl = TemplateEngine.formatWithMetaInfo(button.link, {
                                username: subscription.user.username,
                                subscriptionUrl
                            })
                        }
                    } else {
                        formattedUrl = button.link
                    }

                    const isCopy = button.type === 'copyButton'
                    const isExternal = button.type === 'external'

                    const leftSection = (
                        <span
                            dangerouslySetInnerHTML={{
                                __html: getIconFromLibrary(button.svgIconKey, svgLibrary)
                            }}
                            style={{ display: 'flex', alignItems: 'center' }}
                        />
                    )

                    if (isCopy) {
                        return (
                            <Button
                                key={index}
                                leftSection={leftSection}
                                onClick={() => {
                                    if (!formattedUrl) return

                                    copy(formattedUrl)
                                    notifications.show({
                                        title: t(baseTranslations.linkCopied),
                                        message: t(baseTranslations.linkCopiedToClipboard),
                                        color: 'cyan'
                                    })
                                }}
                                radius="md"
                                variant={variant}
                            >
                                {t(button.text)}
                            </Button>
                        )
                    }

                    if (isExternal) {
                        return (
                            <Button
                                key={index}
                                component={Link}
                                href={button.link}
                                leftSection={leftSection}
                                target="_blank"
                                radius="md"
                                variant={variant}
                            >
                                {t(button.text)}
                            </Button>
                        )
                    }

                    // hack-fix for telegram desktop client app. Doesn't support deeplink

                    return (
                        <Button
                            key={index}
                            onClick={() => {
                                console.log(getRedirectUrl(formattedUrl))
                                const targetUrl = isTDesktop
                                    ? getRedirectUrl(formattedUrl)
                                    : formattedUrl

                                if (!targetUrl) return

                                window.open(targetUrl, '_blank')
                            }}
                            leftSection={leftSection}
                            radius="md"
                            variant={variant}
                        >
                            {t(button.text)}
                        </Button>
                    )
                })}
            </Group>
        )
    }

    const getIcon = (iconKey: string) => getIconFromLibrary(iconKey, svgLibrary)

    return (
        <Card
            className="glass-card"
            p={{ base: 'sm', xs: 'md', sm: 'lg', md: 'xl' }}
            radius="lg"
            style={{ zIndex: 3 }}
        >
            <Stack gap="md">
                <Group gap="sm" justify="space-between">
                    <Title c="white" fw={600} order={4}>
                        {t(baseTranslations.installationGuideHeader)}
                    </Title>

                    {availablePlatforms.length > 1 && (
                        <NativeSelect
                            data={availablePlatforms.map((opt) => ({
                                value: opt.value,
                                label: opt.label
                            }))}
                            leftSection={
                                <span
                                    dangerouslySetInnerHTML={{
                                        __html: availablePlatforms.find(
                                            (opt) => opt.value === selectedPlatform
                                        )!.icon
                                    }}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        width: 20,
                                        height: 20
                                    }}
                                />
                            }
                            onChange={(event) => {
                                vibrate([80])
                                const value = event.target
                                    .value as unknown as TSubscriptionPagePlatformKey
                                setSelectedPlatform(value)
                                setSelectedAppIndex(0)
                            }}
                            radius="md"
                            size="sm"
                            value={selectedPlatform}
                            w={150}
                        />
                    )}
                </Group>

                {platformApps.length > 0 && (
                    <Box>
                        <div className={classes.appsGrid}>
                            {platformApps.map((app: TSubscriptionPageAppConfig, index: number) => {
                                const isActive = index === selectedAppIndex
                                const hasIcon = Boolean(app.svgIconKey)

                                return (
                                    <UnstyledButton
                                        className={clsx(
                                            classes.appButton,
                                            isActive && classes.appButtonActive,
                                            app.featured && classes.appButtonFeatured
                                        )}
                                        key={app.name}
                                        onClick={() => {
                                            vibrate('toggle')
                                            setSelectedAppIndex(index)
                                        }}
                                    >
                                        {app.featured && <span className={classes.featuredBadge} />}
                                        {hasIcon && (
                                            <span
                                                className={clsx(
                                                    classes.bgIcon,
                                                    isActive && classes.bgIconActive
                                                )}
                                                dangerouslySetInnerHTML={{
                                                    __html: getIconFromLibrary(
                                                        app.svgIconKey!,
                                                        svgLibrary
                                                    )
                                                }}
                                            />
                                        )}
                                        <span className={classes.appName}>{app.name}</span>
                                    </UnstyledButton>
                                )
                            })}
                        </div>

                        {selectedApp && (
                            <BlockRenderer
                                blocks={selectedApp.blocks}
                                currentLang={currentLang}
                                getIconFromLibrary={getIcon}
                                renderBlockButtons={renderBlockButtons}
                                svgLibrary={svgLibrary}
                            />
                        )}
                    </Box>
                )}
            </Stack>
        </Card>
    )
}
