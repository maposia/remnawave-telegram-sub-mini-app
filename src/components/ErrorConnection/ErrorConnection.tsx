import {Box, Button, Stack} from "@mantine/core";
import classes from "@/app/app.module.css";
import Lottie from "lottie-react";
import errorConnect from "@public/assets/anamations/error-connect.json";
import {useTranslations} from "next-intl";

export function ErrorConnection() {
    const t = useTranslations();

    function refreshPage() {
        window.location.reload();
    }

    return (
        <Stack gap="xl">
            <Box className={classes.animateBox} w={200}>
                <Lottie animationData={errorConnect} loop={true} />
            </Box>
            <Button onClick={refreshPage} color="cyan" >{t('main.page.component.refresh')}</Button>
        </Stack>
    );
}
