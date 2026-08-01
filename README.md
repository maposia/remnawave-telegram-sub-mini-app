# Remnawave Telegram Subscription Mini App

## Description

This is the **Telegram Subscription App** for Remnawave (https://remna.st/). 
The page allows see their subscriptions directly through Telegram. As a requirement for using the page, the **Telegram ID** must be set in the user's profile to ensure proper identification and linking of subscriptions.


![Mini app](assets/app.png)

## Features

- View your subscriptions in the mini app
- Multi-language support (English, Russian)

## Environment Variables

The application requires the following environment variables to be set:

| Variable          | Description                                                                                                                                                                                               |
|-------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `REMNAWAVE_PANEL_URL`   | Remnawave Panel URL, can be `http://remnawave:3000` or `https://panel.example.com`                                                                                                                        |
| `REMNAWAVE_TOKEN` | Authentication token for Remnawave API                                                                                                                                                                    |
| `BUY_LINK`        | The URL for purchase actions                                                                                                                                                                              |
| `CRYPTO_LINK`     | Allows using encrypted links (currently supported Happ application). If no applications supporting cryptolink are present in app-config.json configuration, these links will not be displayed(true/false) || `REDIRECT_LINK`     | Allows you to specify a **custom redirect page URL** for deep links. Useful for handling protocols like `v2box://` in Telegram Desktop (Windows). For more details and examples, see [Telegram Deep Link Redirect](https://github.com/maposia/redirect-page/tree/main) |
| `AUTH_API_KEY`        | If you use "Caddy with security" or TinyAuth for Nginx addon, you can place here X-Api-Key, which will be applied to requests to Remnawave Panel.                                                         |
| `REDIRECT_LINK`        | Use this link to fix deeplink issues on Windows. It bypasses OS-level restrictions. More details https://github.com/maposia/redirect-page                                                                 |
| `TELEGRAM_BOT_TOKEN`        | Telegram bot token(allow multiple, see .env.example)                                                                                                                                                      |
| `FORCE_SNOWFLAKES`        | Allows snowfall on main page(true/false)                                                                                                                                                                  |
| `CUSTOM_SUB_DOMAIN`       | Enables custom subdomain functionality for subscription links (true/false)                                                                                                                               |


## Version Support

| Remnawave   | MiniApp |
|-------------|---------|
| 1.6 - 2.3.9 | 2.3.4   |
| 2.4.x       | 3.x.x   |
| 3.0.0 and newer | 4.0.0 and newer |
## Plugins and Dependencies

### Remnawave

- [Remnawave-Subscription-Page](https://remna.st/subscription-templating/installation)

### Telegram Bot

- [Telegram Bot API](https://core.telegram.org/bots/api)
- [Telegram Mini App SDK](https://github.com/telegram-mini-apps)

## Setup Instructions

1. Create new directory for mini app

   ```bash
   mkdir /opt/remnawave-telegram-sub-mini-app && cd /opt/remnawave-telegram-sub-mini-app
   ```

2. Download and configure the environment variables.

   ```bash
   curl -o .env https://raw.githubusercontent.com/maposia/remnawave-telegram-mini-bot/refs/heads/main/.env.example
      ```

3. Configure the environment variables.
   ```bash
   nano .env
      ```
   
4. Create docker-compose.yml file

   ```bash
   nano docker-compose.yml
      ```
Example below.

```yaml
services:
   remnawave-mini-app:
      image: ghcr.io/maposia/remnawave-telegram-sub-mini-app:latest
      container_name: remnawave-telegram-mini-app
      hostname: remnawave-telegram-mini-app
      env_file:
         - .env
      restart: always
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

Uncomment if you want to use local connection via single network in docker

```yaml
     networks:
        - remnawave-network

networks:
   remnawave-network:
     name: remnawave-network
      driver: bridge
      external: true
```

5. Run containers.
   ```bash
   docker compose up -d && docker compose logs -f
   ```
6. Mini app is now running on http://127.0.0.1:3020

Now we are ready to move on the Reverse Proxy installation.

## Configuring subscription page (optional)

You can customize the subscription page in the Subpage Builder in Remnawave Dashboard. This allows you to:

Add support for different VPN apps
Customize text and instructions in multiple languages
Add your own branding (logo, company name, support links)
Configure which apps appear as "featured"

## Custom Subdomain Configuration (optional)

When `CUSTOM_SUB_DOMAIN=true`, you can use custom domains for subscription links by configuring response headers in external squads.

### Setup Instructions:

1. Set `CUSTOM_SUB_DOMAIN=true` in your environment variables
2. In the Remnawave Panel, navigate to the external squad configuration
3. Add a response header with the following specifications:
   - **Header Name**: `X-Subscription-Domain`
   - **Header Value**: Your custom domain URL (e.g., `https://custom-domain.com`)

### How it works:

When enabled, the system will:
- Extract the path from the original subscription URL (e.g., `/sSwssdWxe6wPuC`)
- Replace the domain with your custom domain from the header
- Preserve the original path, resulting in URLs like: `https://custom-domain.com/sSwssdWxe6wPuC`

This allows you to serve subscription links through your own domain while maintaining the original subscription paths.

## Update Instructions

1. Pull the latest Docker image:

   ```bash
   docker compose pull
   ```

2. Restart the containers:
   ```bash
   docker compose down && docker compose up -d
   ```

## Contributing

We welcome contributions, especially in making the app accessible to more users!

### Adding New Translations
If you want to add a new language for "no sub or need buy" page :

1.  **Add the translation file:**
    Create a new JSON file in `public/locales/{languageTag}.json` with your translations.

2.  **Register the new locale:**
    Open `src/core/i18n/config.ts` and add your language tag to the `locales` array:
    ```typescript
    export const locales = [defaultLocale, 'ru', '{languageTag}'] as const;
    ```

> [!TIP]
> **Note on Language Tags:** The `{languageTag}` must match the tag used in your **Remnawave Panel** settings under the **Subscription Page** configuration section.
