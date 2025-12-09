import type { PropsWithChildren } from 'react';
import type { Metadata } from 'next';
import { getLocale } from 'next-intl/server';

import { Root } from '@/components/Root/Root';
import {mantineHtmlProps} from "@mantine/core";
import { I18nProvider } from '@/core/i18n/provider';

import './_assets/globals.css';

export const metadata: Metadata = {
  title: 'Subscription Mini App',
  description: 'Subscription Mini App',
};

export default async function RootLayout({ children }: PropsWithChildren) {
  const locale = await getLocale();

  return (
    <html lang={locale} {...mantineHtmlProps} data-mantine-color-scheme='dark'>
    <body>
      <I18nProvider>
        <Root>
          {children}
        </Root>
      </I18nProvider>
    </body>
    </html>
  );
}
