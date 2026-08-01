import {
    IconAlertCircle,
    IconArrowsUpDown,
    IconCalendar,
    IconCheck,
    IconUserScan,
    IconX
} from '@tabler/icons-react'
import { Card, Group, SimpleGrid, Stack, Text, ThemeIcon } from '@mantine/core'
import { useTranslation } from '@/hooks/useTranslations'
import { useSubscription } from '@/store/subscriptionInfo'
import { getColorGradientSolid } from '@/utils/colorParser'
import { getExpirationTextUtil } from '@/utils/configParser'
import { InfoBlock } from '@/components/InfoBlock/InfoBlock'
import { formatDate } from '@/utils/configParser'
import { ProfileSwitcher } from '@/components/ProfileSwitcher'

export const SubscriptionInfoExpanded = () => {
    const { t, currentLang, baseTranslations } = useTranslation()
    const subscription = useSubscription()

    const { user } = subscription
    const isActive = user.isActive
    const isLimited = user.userStatus === 'LIMITED'

    const getStatusAndIcon = (): {
        color: string
        icon: React.ReactNode
        status: string
    } => {
        if (isActive && user.daysLeft > 3) {
            return {
                color: 'teal',
                icon: <IconCheck size={18} />,
                status: t(baseTranslations.active)
            }
        }
        if (isActive && user.daysLeft >= 0) {
            return {
                color: 'orange',
                icon: <IconAlertCircle size={18} />,
                status: t(baseTranslations.active)
            }
        }
        return {
            color: 'red',
            icon: <IconX size={18} />,
            status: t(baseTranslations.inactive)
        }
    }

    const statusInfo = getStatusAndIcon()
    const gradientColor = getColorGradientSolid(statusInfo.color)

    return (
        <Card
            className="glass-card"
            p={{ base: 'sm', xs: 'md', sm: 'lg', md: 'xl' }}
            radius="lg"
            style={{ zIndex: 3 }}
        >
            <Stack gap="sm">
                <Group gap="sm" justify="space-between">
                    <Group gap="xs" style={{ minWidth: 0, flex: 1 }} wrap="nowrap">
                        <ThemeIcon
                            color={statusInfo.color}
                            radius="xl"
                            size="36"
                            style={{
                                background: gradientColor.background,
                                border: gradientColor.border,
                                boxShadow: gradientColor.boxShadow,
                                flexShrink: 0
                            }}
                            variant="light"
                        >
                            {statusInfo.icon}
                        </ThemeIcon>

                        <Stack gap={2} style={{ minWidth: 0, flex: 1 }}>
                            <ProfileSwitcher size="md" />
                            <Text c={user.daysLeft === 0 ? 'red' : 'dimmed'} fw={600} size="xs">
                                {getExpirationTextUtil(
                                    user.expiresAt,
                                    currentLang,
                                    baseTranslations
                                )}
                            </Text>
                        </Stack>
                    </Group>
                </Group>

                <SimpleGrid cols={{ base: 2, xs: 2, sm: 2 }} spacing="xs" verticalSpacing="xs">
                    <InfoBlock
                        color="blue"
                        icon={<IconUserScan size={16} />}
                        title={t(baseTranslations.name)}
                        value={user.username}
                    />

                    <InfoBlock
                        color={isActive ? 'green' : 'red'}
                        icon={isActive ? <IconCheck size={16} /> : <IconX size={16} />}
                        title={t(baseTranslations.status)}
                        value={isActive ? t(baseTranslations.active) : t(baseTranslations.inactive)}
                    />

                    <InfoBlock
                        color="red"
                        icon={<IconCalendar size={16} />}
                        title={t(baseTranslations.expires)}
                        value={formatDate(user.expiresAt, currentLang, baseTranslations)}
                    />

                    <InfoBlock
                        color={isLimited ? 'red' : 'yellow'}
                        icon={<IconArrowsUpDown size={16} />}
                        title={t(baseTranslations.bandwidth)}
                        value={`${user.trafficUsed} / ${user.trafficLimit === '0' ? '∞' : user.trafficLimit}`}
                    />
                </SimpleGrid>
            </Stack>
        </Card>
    )
}
