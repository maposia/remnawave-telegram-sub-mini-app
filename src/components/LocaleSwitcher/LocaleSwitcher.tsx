'use client';

import { useLocale } from 'next-intl';
import {FC, useState} from 'react';

import {ActionIcon, Flex, Menu, Text} from "@mantine/core";
import { localesMap } from '@/core/i18n/config';
import { setLocale } from '@/core/i18n/locale';
import { Locale } from '@/core/i18n/types';
import {IconLanguage} from "@tabler/icons-react";



export const LocaleSwitcher: FC = () => {
  const locale = useLocale();

  const [opened, setOpened] = useState(false)

  const changeLanguage = (value: string) => {
    const locale = value as Locale;
    setLocale(locale);

  }

  const items = localesMap.map((item) => (
      <Menu.Item
          key={item.value}
          style={(theme) => ({
            backgroundColor: item.value === locale
             ? 'light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-5))' : '',
          })}
          leftSection={<Text>{item.emoji}</Text>}
          onClick={() => changeLanguage(item.value)}
      >
        {item.label}
      </Menu.Item>
  ))

  return (
      <Flex justify="center" mt={24}>
          <Menu position="bottom-end" width={150} withinPortal
                onClose={() => setOpened(false)}
                onOpen={() => setOpened(true)}>
              <Menu.Target>
                  <ActionIcon
                      color="gray"
                      size="xl"
                      radius="md"
                      variant="default"
                      style={{
                          background: 'rgba(255, 255, 255, 0.02)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          transition: 'all 0.2s ease'
                      }}
                  >
                      <IconLanguage size={22} />
                  </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>{items}</Menu.Dropdown>
          </Menu>
      </Flex>
  );
};
