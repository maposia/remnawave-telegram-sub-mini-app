# Remnawave Telegram Subscription Mini App

**[English](README.md)** | **Русский**

## Описание

Это **Telegram Mini App для подписок** Remnawave (https://remna.st/).
Страница позволяет пользователям просматривать свои подписки напрямую через Telegram. Для использования приложения **Telegram ID** должен быть указан в профиле пользователя для корректной идентификации и привязки подписок.

![Mini app](assets/app.png)

## Возможности

- Просмотр подписок в мини-приложении
- Поддержка нескольких языков (английский, русский)

## Переменные окружения

Приложению требуются следующие переменные окружения:

| Переменная          | Описание                                                                                                                                                                                   |
|-------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `REMNAWAVE_PANEL_URL`   | URL панели Remnawave, может быть `http://remnawave:3000` или `https://panel.example.com`                                                                                                            |
| `REMNAWAVE_TOKEN` | Токен аутентификации для Remnawave API                                                                                                                                                        |
| `BUY_LINK`        | URL для покупки                                                                                                                                                                  |
| `CRYPTO_LINK`     | Позволяет использовать зашифрованные ссылки (в настоящее время поддерживается приложение Happ). Если в конфигурации app-config.json нет приложений, поддерживающих cryptolink, эти ссылки отображаться не будут |
| `REDIRECT_LINK`     | Позволяет указать **URL пользовательской страницы перенаправления** для deep links. Полезно для обработки протоколов типа `v2box://` в Telegram Desktop (Windows). Подробности и примеры см. в [Telegram Deep Link Redirect](https://github.com/maposia/redirect-page/tree/main) |
| `AUTH_API_KEY`        | Если вы используете "Caddy with security" или TinyAuth для Nginx, укажите здесь X-Api-Key, который будет применяться к запросам к панели Remnawave.                                             |
| `TELEGRAM_BOT_TOKEN`        | Токен Telegram бота                                                                                                                                                                            |

## Плагины и зависимости

### Remnawave

- [Remnawave-Subscription-Page](https://remna.st/subscription-templating/installation)

### Telegram Bot

- [Telegram Bot API](https://core.telegram.org/bots/api)
- [Telegram Mini App SDK](https://github.com/telegram-mini-apps)

## Инструкция по установке

1. Создайте новую директорию для мини-приложения

   ```bash
   mkdir /opt/remnawave-telegram-sub-mini-app && cd /opt/remnawave-telegram-sub-mini-app
   ```

2. Скачайте и настройте переменные окружения.

   ```bash
   curl -o .env https://raw.githubusercontent.com/maposia/remnawave-telegram-mini-bot/refs/heads/main/.env.example
      ```

3. Отредактируйте переменные окружения.
   ```bash
   nano .env
      ```

4. Создайте файл docker-compose.yml

   ```bash
   nano docker-compose.yml
      ```
Пример ниже.

```yaml
services:
   remnawave-mini-app:
      image: ghcr.io/maposia/remnawave-telegram-sub-mini-app:latest
      container_name: remnawave-telegram-mini-app
      hostname: remnawave-telegram-mini-app
      env_file:
         - .env
      restart: always
      # volumes:
      #   - ./app-config.json:/app/public/assets/app-config.json
      ports:
         - '127.0.0.1:3020:3020'
#      networks:
#         - remnawave-network

#networks:
#   remnawave-network:
#     name: remnawave-network
#      driver: bridge
#      external: true
```

Раскомментируйте, если хотите использовать собственный шаблон, скачанный из панели Remna.
P.S. файл должен находиться в той же директории, что и docker-compose файл

```yaml
      volumes:
        - ./app-config.json:/app/public/assets/app-config.json
```

Раскомментируйте, если хотите использовать локальное подключение через единую сеть в Docker

```yaml
     networks:
        - remnawave-network

networks:
   remnawave-network:
     name: remnawave-network
      driver: bridge
      external: true
```

5. Запустите контейнеры.
   ```bash
   docker compose up -d && docker compose logs -f
   ```
6. Мини-приложение теперь работает на http://127.0.0.1:3020

Теперь можно переходить к установке Reverse Proxy.

## Инструкция по обновлению

1. Скачайте последний Docker образ:

   ```bash
   docker compose pull
   ```

2. Перезапустите контейнеры:
   ```bash
   docker compose down && docker compose up -d
   ```
