import {
    IconBrandDiscord,
    IconBrandTelegram,
    IconBrandVk,
    IconLink,
    IconMessageChatbot
} from '@tabler/icons-react'
import {ActionIcon, Button, Group, Image, Modal, Stack, Text} from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { useClipboard } from '@mantine/hooks'
import { renderSVG } from 'uqr'

import {useTranslations} from "next-intl";
import {useState} from "react";

export const SubscriptionLinkWidget = ({subscription, supportUrl }: {subscription: string, supportUrl?: string }) => {
    const t = useTranslations();
    const clipboard = useClipboard({ timeout: 10000 })
    const subscriptionQrCode = renderSVG(subscription, {
        whiteColor: '#161B22',
        blackColor: '#3CC9DB'
    })

    const [open, setOpen] = useState(false)

    if (!subscription) return null


    const handleCopy = () => {
        notifications.show({
            title: t('subscription-link.widget.link-copied'),
            message: t('subscription-link.widget.link-copied-to-clipboard'),
            color: 'teal'
        })
        clipboard.copy(subscription)
    }

    const renderSupportLink = (supportUrl: string) => {
        const iconConfig = {
            't.me': { icon: IconBrandTelegram, color: '#0088cc' },
            'discord.com': { icon: IconBrandDiscord, color: '#5865F2' },
            'vk.com': { icon: IconBrandVk, color: '#0077FF' }
        }

        const matchedPlatform = Object.entries(iconConfig).find(([domain]) =>
            supportUrl.includes(domain)
        )

        const { icon: Icon, color } = matchedPlatform
            ? matchedPlatform[1]
            : { icon: IconMessageChatbot, color: 'teal' }

        return (
            <ActionIcon
                c={color}
                component="a"
                href={supportUrl}
                rel="noopener noreferrer"
                size="xl"
                target="_blank"
                variant="default"
            >
                <Icon />
            </ActionIcon>
        )
    }

    return (

        <>

            <Modal opened={open} onClose={()=> setOpen(false)} title={t('subscription-link.widget.get-link')}>
                {subscriptionQrCode && (
                    <Stack align="center">
                        <Image
                            src={`data:image/svg+xml;utf8,${encodeURIComponent(subscriptionQrCode)}`}
                        />
                        <Text fw={600} size="lg" ta="center">
                            {t('subscription-link.widget.scan-qr-code')}
                        </Text>
                        <Text c="dimmed" size="sm" ta="center">
                            {t('subscription-link.widget.line-1')}
                        </Text>

                        <Button fullWidth onClick={handleCopy} variant="filled">
                            {t('subscription-link.widget.copy-link')}
                        </Button>
                    </Stack>
                )}

            </Modal>
        <Group gap="xs">
            <ActionIcon
                onClick={() => {
                    setOpen(true)
                }}
                size="xl"
                variant="default"
            >
                <IconLink />
            </ActionIcon>
            {supportUrl && renderSupportLink(supportUrl)}
        </Group>

        </>

    )
}
