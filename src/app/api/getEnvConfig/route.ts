import {consola} from "consola/browser";

export async function POST() {
    try {
        const isHappCryptoLinkEnabled = process.env.CRYPTO_LINK === 'true'
        const isSnowflakeEnabled = process.env.FORCE_SNOWFLAKES === 'true'
        const buyLink = process.env.BUY_LINK
        const redirectLink = process.env.REDIRECT_LINK || 'https://maposia.github.io/redirect-page/?redirect_to='


        return new Response(JSON.stringify({cryptoLink: isHappCryptoLinkEnabled, buyLink, redirectLink, isSnowflakeEnabled}), { status: 200 });

    } catch (error) {
        consola.error('Error:', error);
        return new Response(JSON.stringify({ error: 'Server error.' }), { status: 500 });
    }
}
