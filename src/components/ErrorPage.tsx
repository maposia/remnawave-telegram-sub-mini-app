import { useEffect } from 'react';
import Image from "next/image";
import {Center, Flex, Title} from "@mantine/core";
import {consola} from "consola/browser";

export function ErrorPage({
  error,
}: {
  error: Error & { digest?: string }
  reset?: () => void
}) {
  useEffect(() => {
    consola.error(error);
  }, [error]);

  return (
    <div>
        <Center style={{ height: '100vh'}}>
            <Flex justify='center' align='center' direction='column' gap='xl'>
        <Title ta='center' order={1} size={20}>The app must be opened through Telegram</Title>
            <Image
                alt="Telegram sticker"
                src="/assets/telegram.gif"
                width={144}
                height={144}
            />
            </Flex>
        </Center>
    </div>
  );
}
