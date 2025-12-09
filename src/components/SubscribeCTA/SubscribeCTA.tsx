import {Box, Button, Stack} from "@mantine/core";
import classes from "@/app/app.module.css";
import Lottie from "lottie-react";
import noSubAnimate from "@public/assets/anamations/no-sub.json";
import {useTranslations} from "next-intl";
import {Link} from "@/components/Link/Link";

export function SubscribeCta({buyLink}: {buyLink: string | undefined}) {
    const t = useTranslations();

    return (
        <Stack gap="xl">
            <Box className={classes.animateBox} w={200}>
                <Lottie animationData={noSubAnimate} loop={true} />
            </Box>
            {buyLink ? (
                <Button component={Link} href={buyLink} target="_blank" color="cyan">
                    {t('main.page.component.buy')}
                </Button>
            ) : (
                <Button disabled color="gray">
                    {t('main.page.component.buy')}
                </Button>
            )}
        </Stack>
    );
}
