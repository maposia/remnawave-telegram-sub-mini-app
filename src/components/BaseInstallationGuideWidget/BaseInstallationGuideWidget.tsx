import {useEffect, useState} from 'react'
import Lottie from "lottie-react";
import {useTranslations} from "next-intl";
import {Box, Button, Group, Text, ThemeIcon, Timeline} from '@mantine/core'
import {
    IconCheck,
    IconCloudDownload,
    IconDownload,
    IconInfoCircle,
    IconStar
} from '@tabler/icons-react'
import noDataAnimate from "@public/assets/anamations/no-data-config.json";
import {IAppConfig, ILocalizedText, TEnabledLocales, TPlatform} from "@/types/appList";
import {IPlatformGuideProps} from "@/types/platforGuide";


export interface IBaseGuideProps extends IPlatformGuideProps {
    firstStepTitle: string
    platform: TPlatform
    renderFirstStepButton: (app: IAppConfig) => React.ReactNode
    currentLang: TEnabledLocales
    isCryptoLinkEnabled: boolean | undefined
}



export const BaseInstallationGuideWidget = (props: IBaseGuideProps) => {
    const  t = useTranslations()
    const {
        openDeepLink,
        getAppsForPlatform,
        platform,
        firstStepTitle,
        renderFirstStepButton,
        isCryptoLinkEnabled,
        currentLang
    } = props

    const platformApps = getAppsForPlatform(platform)
    const [activeTabId, setActiveTabId] = useState<string>('')

    useEffect(() => {
        if (platformApps?.length > 0) {
            setActiveTabId(platformApps[0].id)
        }
    }, [platform, platformApps])

    const handleTabChange = (appId: string) => {
        setActiveTabId(appId)
    }

    const selectedApp =
        (activeTabId && platformApps.find((app) => app.id === activeTabId)) ||
        (platformApps.length > 0 ? platformApps[0] : null)

    const formattedTitle = selectedApp
        ? firstStepTitle.replace(/{appName}/g, selectedApp.name)
        : firstStepTitle

    const getAppDescription = (
        app: IAppConfig | null,
        step: 'addSubscriptionStep' | 'connectAndUseStep' | 'installationStep'
    ) => {
        if (!app) return ''

        const stepData = app[step]
        if (!stepData) return ''

        return stepData.description[currentLang] || ''
    }


    const getButtonText = (button: { buttonText: ILocalizedText }) => {
        return button.buttonText[currentLang] || ''
    }

    const getStepTitle = (stepData: { title?: ILocalizedText }, defaultTitle: string) => {
        if (!stepData || !stepData.title) return defaultTitle

        return stepData.title[currentLang] || defaultTitle
    }

    return (
        <Box>
            {platformApps?.length > 0 && (
                <Group gap="xs" mb="lg">
                    {platformApps.map((app: IAppConfig) => {
                        const isActive = app.id === activeTabId
                        return (
                            <Button
                                color={isActive ? 'cyan' : 'gray'}
                                key={app.id}
                                leftSection={
                                    app.isFeatured ? <IconStar color="gold" size={16} /> : undefined
                                }
                                onClick={() => handleTabChange(app.id)}
                                styles={{
                                    root: {
                                        padding: '8px 12px',
                                        height: 'auto',
                                        lineHeight: '1.5',
                                        minWidth: 0,
                                        flex: '1 0 auto'
                                    }
                                }}
                                variant={isActive ? 'outline' : 'light'}
                            >
                                {app.name}
                            </Button>
                        )
                    })}
                </Group>
            )}

    {platformApps?.length > 0 ? (
        <Timeline active={1} bulletSize={32} color="teal" lineWidth={2}>
            <Timeline.Item
                bullet={
                    <ThemeIcon color="teal.5" radius="xl" size={26}>
                        <IconDownload size={16} />
                    </ThemeIcon>
                }
                title={formattedTitle}
            >
                <Text c="dimmed" mb={16} size="sm" style={{ whiteSpace: 'pre-line' }}>
                    {selectedApp ? getAppDescription(selectedApp, 'installationStep') : ''}
                </Text>
                {selectedApp && renderFirstStepButton(selectedApp)}
            </Timeline.Item>

            {selectedApp && selectedApp.additionalBeforeAddSubscriptionStep && (
                <Timeline.Item
                    bullet={
                        <ThemeIcon color="teal.5" radius="xl" size={26}>
                            <IconInfoCircle size={20} />
                        </ThemeIcon>
                    }
                    title={getStepTitle(
                        selectedApp.additionalBeforeAddSubscriptionStep,
                        'Additional step title is not set'
                    )}
                >
                    <Text c="dimmed" mb={16} size="sm" style={{ whiteSpace: 'pre-line' }}>
                        {selectedApp.additionalBeforeAddSubscriptionStep.description[
                            currentLang
                            ] || selectedApp.additionalBeforeAddSubscriptionStep.description.en}
                    </Text>
                    <Group>
                        {selectedApp.additionalBeforeAddSubscriptionStep.buttons.map(
                            (button, index) => (
                                <Button
                                    component="a"
                                    href={button.buttonLink}
                                    key={index}
                                    target="_blank"
                                    variant="light"
                                >
                                    {getButtonText(button)}
                                </Button>
                            )
                        )}
                    </Group>
                </Timeline.Item>
            )}

            <Timeline.Item
                bullet={
                    <ThemeIcon color="teal.5" radius="xl" size={26}>
                        <IconCloudDownload size={16} />
                    </ThemeIcon>
                }
                title={t('installation-guide.widget.add-subscription')}
            >
                <Text c="dimmed" mb={16} size="sm" style={{ whiteSpace: 'pre-line' }}>
                    {selectedApp
                        ? getAppDescription(selectedApp, 'addSubscriptionStep')
                        : 'Add subscription description is not set'}
                </Text>
                {selectedApp && (
                    <Button
                        onClick={() =>
                            openDeepLink(
                                selectedApp.urlScheme,
                                selectedApp.isNeedBase64Encoding
                            )
                        }
                        variant="filled"
                    >
                        {t('installation-guide.widget.add-subscription-button')}
                    </Button>
                )}
            </Timeline.Item>

            {selectedApp && selectedApp.additionalAfterAddSubscriptionStep && (
                <Timeline.Item
                    bullet={
                        <ThemeIcon color="teal.5" radius="xl" size={26}>
                            <IconStar size={16} />
                        </ThemeIcon>
                    }
                    title={getStepTitle(
                        selectedApp.additionalAfterAddSubscriptionStep,
                        'Additional step title is not set'
                    )}
                >
                    <Text c="dimmed" mb={16} size="sm" style={{ whiteSpace: 'pre-line' }}>
                        {selectedApp.additionalAfterAddSubscriptionStep.description[
                            currentLang
                            ] || selectedApp.additionalAfterAddSubscriptionStep.description.en}
                    </Text>
                    <Group>
                        {selectedApp.additionalAfterAddSubscriptionStep.buttons.map(
                            (button, index) => (
                                <Button
                                    component="a"
                                    href={button.buttonLink}
                                    key={index}
                                    target="_blank"
                                    variant="light"
                                >
                                    {getButtonText(button)}
                                </Button>
                            )
                        )}
                    </Group>
                </Timeline.Item>
            )}

            <Timeline.Item
                bullet={
                    <ThemeIcon color="teal.5" radius="xl" size={26}>
                        <IconCheck size={16} />
                    </ThemeIcon>
                }
                title={t('installation-guide.widget.connect-and-use')}
            >
                <Text c="dimmed" size="sm" style={{ whiteSpace: 'pre-line' }}>
                    {selectedApp
                        ? getAppDescription(selectedApp, 'connectAndUseStep')
                        : 'Connect and use description is not set'}
                </Text>
            </Timeline.Item>
        </Timeline>
    ) : (
        <Box style={{display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '40px'}}>
        <div>
            <Text ta='center' fw='700' className='mb-3'>
                {t(isCryptoLinkEnabled ? 'installation-guide.widget.no-data-for-cryptolink' : 'installation-guide.widget.no-data-for-app')}            </Text>
            <Lottie animationData={noDataAnimate} loop={true} />
        </div>
        </Box>
    )}
    </Box>
)
}
