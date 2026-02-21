'use client'

import { type PropsWithChildren, useEffect, useState } from 'react'

import '@mantine/core/styles.layer.css'
import '@mantine/dates/styles.layer.css'
import '@mantine/notifications/styles.layer.css'
import '@mantine/nprogress/styles.layer.css'

initDayjs()

import {
    Box,
    Center,
    Container,
    DirectionProvider,
    MantineProvider,
    Stack,
    Title
} from '@mantine/core'

import {
    initData,
    useLaunchParams,
    miniApp,
    viewport,
    useSignal,
    initDataRaw as _initDataRaw
} from '@telegram-apps/sdk-react'

import { ErrorBoundary } from '@/components/ErrorBoundary'
import { ErrorPage } from '@/components/ErrorPage'
import { Loading } from '@/components/Loading/Loading'
import { useDidMount } from '@/hooks/useDidMount'
import { setLocale } from '@/core/i18n/locale'
import { theme } from '@/config/theme'
import { fetchUserByTelegramId } from '@/api/fetchUserByTgId'
import { consola } from 'consola/browser'
import {
    useSubscriptionInfoStoreActions,
    useSubscriptionInfoStoreInfo
} from '@/store/subscriptionInfo'
import {
    SubscriptionPageRawConfigSchema,
    TSubscriptionPageRawConfig
} from '@remnawave/subscription-page-types'
import {
    useSubscriptionConfigStoreActions,
    useIsConfigLoaded,
    useCurrentLang,
    useSubscriptionConfig
} from '@/store/subscriptionConfig'
import { ofetch } from 'ofetch'
import { ErrorConnection } from '@/components/ErrorConnection/ErrorConnection'
import { initDayjs } from '@/utils/initDayjs'
import { fetchAppEnv } from '@/api/fetchAppEnv'
import { useAppConfigStoreActions } from '@/store/appConfig'
import { SubscribeCta } from '@/components/SubscribeCTA/SubscribeCTA'
import { LanguagePicker } from '@/components/LanguagePicker/LanguagePicker'
import { useTranslations } from 'next-intl'
import { AxiosError } from 'axios'

type TConfigsMap = Record<string, TSubscriptionPageRawConfig>

function RootInner({ children }: PropsWithChildren) {
    const lp = useLaunchParams()
    const t = useTranslations()
    const debug = lp.startParam === 'debug'
    const initDataRaw = useSignal(_initDataRaw)
    const subscriptionActions = useSubscriptionInfoStoreActions()
    const configActions = useSubscriptionConfigStoreActions()
    const appConfigActions = useAppConfigStoreActions()
    const config = useSubscriptionConfig()
    const currentLang = useCurrentLang()
    const { setLanguage } = useSubscriptionConfigStoreActions()

    const { subscription } = useSubscriptionInfoStoreInfo()
    const isConfigLoaded = useIsConfigLoaded()

    const [errorConnect, setErrorConnect] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    if (miniApp.mount.isAvailable()) {
        miniApp.mount()
    }
    if (miniApp.setHeaderColor.isAvailable()) {
        miniApp.setHeaderColor('#161b22')
        miniApp.headerColor()
    }

    if (miniApp.setBackgroundColor.isAvailable()) {
        miniApp.setBackgroundColor('#161b22')
        miniApp.backgroundColor()
    }

    const initDataUser = useSignal(initData.user)
    // Set the user locale.
    useEffect(() => {
        if (initDataUser) {
            setLocale(initDataUser.language_code)
        }
    }, [initDataUser])

    const activeSubscription =
        subscription?.user?.userStatus && subscription?.user?.userStatus === 'ACTIVE'

    useEffect(() => {
        setIsLoading(true)

        if (initDataRaw) {
            const fetchSubscription = async () => {
                try {
                    const subscription = await fetchUserByTelegramId(initDataRaw as string)
                    if (subscription) {
                        subscriptionActions.setSubscriptionInfo({
                            subscription
                        })
                    }
                } catch (error) {
                    if (error instanceof AxiosError && error.code === 'ERR_GET_SUB_LINK') {
                        setErrorConnect('ERR_GET_SUB_LINK')
                        consola.error('Failed to fetch sub link:', error)
                        return
                    }

                    const errorMessage =
                        error instanceof Error ? error.message : 'Unknown error occurred'
                    if (errorMessage !== 'Users not found') {
                        setErrorConnect('ERR_FATCH_USER')
                    }
                    consola.error('Failed to fetch subscription:', error)
                } finally {
                    setIsLoading(false)
                }
            }

            fetchSubscription()
        }
    }, [initDataRaw])

    useEffect(() => {
        const targetUuid = '00000000-0000-0000-0000-000000000000'
        let retryCount = 0
        const maxRetries = 3

        const fetchConfig = async () => {
            try {
                const configs = await ofetch<TConfigsMap>(`/api/app-config`, {
                    query: { v: Date.now() }
                })

                const configId = subscription?.subpageConfigUuid || targetUuid
                const tempConfig = configs[configId]

                if (!tempConfig) {
                    if (retryCount < maxRetries) {
                        retryCount++
                        consola.warn(`Config ${configId} not found, retrying... (${retryCount})`)
                        setTimeout(fetchConfig, 2000)
                        return
                    }
                    throw new Error(`Config with UUID ${configId} not found in app-data`)
                }

                const parsedConfig =
                    await SubscriptionPageRawConfigSchema.safeParseAsync(tempConfig)

                if (!parsedConfig.success) {
                    setErrorConnect('ERR_PARSE_APPCONFIG')
                    consola.error('Failed to parse app config:', parsedConfig.error.format())
                    return
                }

                configActions.setConfig(parsedConfig.data)
            } catch (error: any) {
                if (error.response?.status === 404 && retryCount < maxRetries) {
                    retryCount++
                    setTimeout(fetchConfig, 2000)
                    return
                }

                setErrorConnect('ERR_PARSE_APPCONFIG')
                consola.error('Failed to fetch app config:', error)
            }
        }

        fetchConfig()
    }, [subscription])

    useEffect(() => {
        const fetchAppConfig = async () => {
            try {
                const appConfig = await fetchAppEnv()

                if (appConfig) {
                    appConfigActions.setAppConfig(appConfig)
                }
            } catch (error) {
                consola.error('Failed to fetch app config:', error)
            }
        }

        fetchAppConfig()
    }, [])

    if (errorConnect)
        return (
            <Container my="xl" size="xl">
                <Center>
                    <Stack gap="xl">
                        <Title style={{ textAlign: 'center' }} order={4}>
                            {errorConnect === 'ERR_FATCH_USER'
                                ? 'Error get user'
                                : errorConnect === 'ERR_GET_SUB_LINK'
                                  ? 'Error get sub link'
                                : errorConnect === 'ERR_PARSE_APPCONFIG'
                                  ? 'Error parsing app config'
                                  : JSON.stringify(errorConnect)}
                        </Title>
                        <ErrorConnection />
                    </Stack>
                </Center>
            </Container>
        )

    if (isLoading || !isConfigLoaded) return <Loading />

    if (!activeSubscription) {
        // @ts-ignore
        return (
            <Box
                style={{
                    height: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}
            >
                <Container size="xl">
                    <Stack gap="xl">
                        <Title style={{ textAlign: 'center' }} order={4}>
                            {t('main.page.component.no-sub')}
                        </Title>
                        <SubscribeCta />

                        <Center mt={20}>
                            <LanguagePicker
                                currentLang={currentLang}
                                locales={config.locales ?? []}
                                onLanguageChange={setLanguage}
                            />
                        </Center>
                    </Stack>
                </Container>
            </Box>
        )
    }

    return <>{children}</>
}

export function Root(props: PropsWithChildren) {
    // Unfortunately, Telegram Mini Apps does not allow us to use all features of
    // the Server Side Rendering. That's why we are showing loader on the server
    // side.
    const didMount = useDidMount()

    return didMount ? (
        <DirectionProvider>
            <MantineProvider defaultColorScheme="dark" theme={theme}>
                <ErrorBoundary fallback={ErrorPage}>
                    <RootInner {...props} />
                </ErrorBoundary>
            </MantineProvider>
        </DirectionProvider>
    ) : (
        <DirectionProvider>
            <MantineProvider defaultColorScheme="dark" theme={theme}>
                <Loading />
            </MantineProvider>
        </DirectionProvider>
    )
}
