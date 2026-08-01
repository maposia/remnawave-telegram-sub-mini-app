import {
    IconAlertCircle,
    IconArrowsUpDown,
    IconCalendar,
    IconCheck,
    IconChevronDown,
    IconUserScan,
    IconX
} from '@tabler/icons-react'
import {
    Card,
    Collapse,
    Box,
    Group,
    SimpleGrid,
    Stack,
    Text,
    ThemeIcon,
    UnstyledButton
} from '@mantine/core'
import { useState } from 'react'
import { useTranslation } from '@/hooks/useTranslations'
import { useSubscription } from '@/store/subscriptionInfo'
import { getColorGradientSolid } from '@/utils/colorParser'
import { vibrate } from '@/utils/vibrate'
import { getExpirationTextUtil } from '@/utils/configParser'
import { InfoBlock } from '@/components/InfoBlock/InfoBlock'
import { formatDate } from '@/utils/configParser'
import { ProfileSwitcher } from '@/components/ProfileSwitcher'

export const SubscriptionInfoCollapsed = () => {
    const { t, currentLang, baseTranslations } = useTranslation()
    const subscription = useSubscription()
    const [isExpanded, setIsExpanded] = useState(false)

    const { user } = subscription
    const isActive = user.isActive
    const isLimited = user.userStatus === 'LIMITED'

    const getStatusConfig = () => {
        if (isActive && user.daysLeft > 3) {
            return { color: 'teal', icon: <IconCheck size={14} /> }
        }
        if (isActive && user.daysLeft >= 0) {
            return { color: 'orange', icon: <IconAlertCircle size={14} /> }
        }
        return { color: 'red', icon: <IconX size={14} /> }
    }

    const status = getStatusConfig()
    const gradientColor = getColorGradientSolid(status.color)

    return (
        <Card className="glass-card" p={0} radius="lg" style={{ overflow: 'hidden', zIndex: 3 }}>
            <Group gap={0} wrap="nowrap">
                <UnstyledButton
                    onClick={() => {
                        vibrate('tap')
                        setIsExpanded(!isExpanded)
                    }}
                    p={{ base: 'xs', sm: 'sm' }}
                    style={{ flex: 1, minWidth: 0 }}
                >
                    <Group gap="sm" justify="space-between" wrap="nowrap">
                        <Group gap="xs" style={{ minWidth: 0, flex: 1 }} wrap="nowrap">
                            <ThemeIcon
                                color={status.color}
                                radius="xl"
                                size={28}
                                style={{
                                    background: gradientColor.background,
                                    border: gradientColor.border,
                                    boxShadow: gradientColor.boxShadow,
                                    flexShrink: 0
                                }}
                                variant="light"
                            >
                                {status.icon}
                            </ThemeIcon>

                            <Stack gap={0} style={{ minWidth: 0, flex: 1 }}>
                                <Text
                                    c="white"
                                    fw={600}
                                    size="sm"
                                    style={{
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                    }}
                                >
                                    {user.username}
                                </Text>
                                <Text c="dimmed" size="xs" style={{ whiteSpace: 'nowrap' }}>
                                    {getExpirationTextUtil(
                                        user.expiresAt,
                                        currentLang,
                                        baseTranslations
                                    )}
                                </Text>
                            </Stack>
                        </Group>

                        <Group gap="xs" style={{ flexShrink: 0 }} wrap="nowrap">
                            <IconChevronDown
                                color="var(--mantine-color-dimmed)"
                                size={18}
                                style={{
                                    transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                    transition: 'transform 150ms ease'
                                }}
                            />
                        </Group>
                    </Group>
                </UnstyledButton>
                <Box pr={{ base: 'xs', sm: 'sm' }}>
                    <ProfileSwitcher actionOnly />
                </Box>
            </Group>

            <Collapse in={isExpanded} keepMounted>
                <Stack gap="xs" pb={{ base: 'xs', sm: 'sm' }} px={{ base: 'xs', sm: 'sm' }}>
                    <SimpleGrid cols={2} spacing="xs" verticalSpacing="xs">
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
                            value={
                                isActive ? t(baseTranslations.active) : t(baseTranslations.inactive)
                            }
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
            </Collapse>
        </Card>
    )
}
