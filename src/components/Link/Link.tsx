'use client'

import { openLink } from '@telegram-apps/sdk-react';
import { type FC, type MouseEventHandler, type JSX, useCallback } from 'react';
import { type LinkProps as NextLinkProps, default as NextLink } from 'next/link';

export interface LinkProps extends NextLinkProps, Omit<JSX.IntrinsicElements['a'], 'href'> {}

export const Link: FC<LinkProps> = ({ className, onClick: propsOnClick, href, ...rest }) => {
    const onClick = useCallback<MouseEventHandler<HTMLAnchorElement>>(
        (e) => {
            propsOnClick?.(e);

            // Проверяем, что мы находимся на клиентской стороне
            if (typeof window === 'undefined') {
                return;
            }

            // Compute if target path is external. In this case we would like to open link using
            // TMA method.
            let path: string;
            if (typeof href === 'string') {
                path = href;
            } else {
                const { search = '', pathname = '', hash = '' } = href;
                path = `${pathname}?${search}#${hash}`;
            }

            const targetUrl = new URL(path, window.location.toString());
            const currentUrl = new URL(window.location.toString());
            const isExternal =
                targetUrl.protocol !== currentUrl.protocol || targetUrl.host !== currentUrl.host;

            if (isExternal) {
                e.preventDefault();
                openLink(targetUrl.toString());
            }
        },
        [href, propsOnClick],
    );

    return <NextLink {...rest} href={href} onClick={onClick} className={className} />;
};
