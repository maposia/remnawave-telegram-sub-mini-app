export const defaultLocale = 'en';

export const timeZone = 'Europe/Amsterdam';

export const locales = [defaultLocale, 'ru', 'cn'] as const;

export const localesMap = [
  { label: 'English', emoji: '🇺🇸', value: 'en' },
  { label: 'Русский', emoji: '🇷🇺', value: 'ru' },
  { label: '简体中文', emoji: '🇨🇳', value: 'cn' },
];
