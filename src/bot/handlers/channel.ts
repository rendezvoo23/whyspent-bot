import { Context, InlineKeyboard } from 'grammy';
import { t, isValidLanguage } from '../middlewares/i18n';
import { DEFAULT_LANGUAGE, SupportedLanguage } from '../../config/constants';

/**
 * Handle /channel command
 * Leads users to the Telegram channel
 */
export async function handleChannel(ctx: Context): Promise<void> {
    const user = ctx.from;

    // Simple language detection
    let lang: SupportedLanguage = DEFAULT_LANGUAGE;
    if (user?.language_code && isValidLanguage(user.language_code)) {
        lang = user.language_code;
    }

    const message = [
        t('channel.title', lang),
        '',
        t('channel.message', lang),
        '',
        t('channel.cta', lang)
    ].join('\n');

    const keyboard = new InlineKeyboard()
        .url(t('channel.button', lang), 'https://t.me/whyspentjournal');

    await ctx.reply(message, {
        reply_markup: keyboard
    });
}
