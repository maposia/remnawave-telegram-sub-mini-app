'use client'

import { useState } from 'react'
import {
    ActionIcon,
    Group,
    Loader,
    Modal,
    ScrollArea,
    Stack,
    Text,
    ThemeIcon,
    Tooltip,
    UnstyledButton
} from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { IconCheck, IconSwitchHorizontal, IconUser } from '@tabler/icons-react'
import { initDataRaw as _initDataRaw, useSignal } from '@telegram-apps/sdk-react'
import { useTranslations } from 'next-intl'

import { fetchUserByTelegramId } from '@/api/fetchUserByTgId'
import { useSubscription, useSubscriptionInfoStoreActions } from '@/store/subscriptionInfo'
import { useSubscriptionConfigStoreActions } from '@/store/subscriptionConfig'
import { vibrate } from '@/utils/vibrate'

interface ProfileSwitcherProps {
    actionOnly?: boolean
    size?: 'sm' | 'md'
}

export function ProfileSwitcher({ actionOnly = false, size = 'sm' }: ProfileSwitcherProps) {
    const t = useTranslations('main.page.component')
    const initDataRaw = useSignal(_initDataRaw)
    const subscription = useSubscription()
    const subscriptionActions = useSubscriptionInfoStoreActions()
    const configActions = useSubscriptionConfigStoreActions()
    const [opened, setOpened] = useState(false)
    const [switchingShortUuid, setSwitchingShortUuid] = useState<string | null>(null)

    const profiles = subscription.availableProfiles ?? []
    const hasMultipleProfiles = profiles.length > 1
    const currentShortUuid = subscription.user.shortUuid

    const handleSelect = async (shortUuid: string) => {
        if (shortUuid === currentShortUuid || switchingShortUuid) return

        if (!initDataRaw) {
            notifications.show({
                color: 'red',
                message: t('profile-switch-error')
            })
            return
        }

        setSwitchingShortUuid(shortUuid)

        try {
            const nextSubscription = await fetchUserByTelegramId(initDataRaw, shortUuid)

            configActions.setConfigLoading()
            subscriptionActions.setSubscriptionInfo({ subscription: nextSubscription })
            setOpened(false)
            vibrate('success')
        } catch {
            notifications.show({
                color: 'red',
                message: t('profile-switch-error')
            })
        } finally {
            setSwitchingShortUuid(null)
        }
    }

    const switchAction = hasMultipleProfiles ? (
        <Tooltip label={t('switch-profile')}>
            <ActionIcon
                aria-label={t('switch-profile')}
                color="cyan"
                onClick={() => {
                    vibrate('tap')
                    setOpened(true)
                }}
                radius="xl"
                size="sm"
                variant="light"
            >
                <IconSwitchHorizontal size={15} />
            </ActionIcon>
        </Tooltip>
    ) : null

    return (
        <>
            {actionOnly ? (
                switchAction
            ) : (
                <Group gap={6} style={{ minWidth: 0 }} wrap="nowrap">
                    <Text
                        c="white"
                        fw={600}
                        size={size}
                        style={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        {subscription.user.username}
                    </Text>
                    {switchAction}
                </Group>
            )}

            {hasMultipleProfiles && (
                <Modal
                    centered
                    onClose={() => !switchingShortUuid && setOpened(false)}
                    opened={opened}
                    title={t('select-profile')}
                >
                    <ScrollArea.Autosize mah="60vh" offsetScrollbars scrollbarSize={6}>
                        <Stack gap="xs" pr="xs">
                            {profiles.map((profile) => {
                                const isCurrent = profile.shortUuid === currentShortUuid
                                const isSwitching = profile.shortUuid === switchingShortUuid

                                return (
                                    <UnstyledButton
                                        disabled={isCurrent || Boolean(switchingShortUuid)}
                                        key={profile.shortUuid}
                                        onClick={() => handleSelect(profile.shortUuid)}
                                        p="sm"
                                        style={{
                                            background: isCurrent
                                                ? 'rgba(34, 211, 238, 0.1)'
                                                : 'rgba(255, 255, 255, 0.03)',
                                            border: `1px solid ${
                                                isCurrent
                                                    ? 'rgba(34, 211, 238, 0.35)'
                                                    : 'rgba(255, 255, 255, 0.08)'
                                            }`,
                                            borderRadius: 'var(--mantine-radius-md)'
                                        }}
                                    >
                                        <Group gap="sm" wrap="nowrap">
                                            <ThemeIcon color="cyan" radius="xl" variant="light">
                                                <IconUser size={17} />
                                            </ThemeIcon>
                                            <Text
                                                fw={600}
                                                style={{ flex: 1, minWidth: 0 }}
                                                truncate
                                            >
                                                {profile.username}
                                            </Text>
                                            {isSwitching ? (
                                                <Loader size="xs" />
                                            ) : isCurrent ? (
                                                <IconCheck
                                                    color="var(--mantine-color-cyan-4)"
                                                    size={18}
                                                />
                                            ) : null}
                                        </Group>
                                    </UnstyledButton>
                                )
                            })}
                        </Stack>
                    </ScrollArea.Autosize>
                </Modal>
            )}
        </>
    )
}
