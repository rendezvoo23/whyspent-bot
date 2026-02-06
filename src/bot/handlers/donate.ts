import { Context } from 'grammy';
import { t, isValidLanguage } from '../middlewares/i18n';
import { DEFAULT_LANGUAGE, SupportedLanguage } from '../../config/constants';

/**
 * Handle /donate command
 * Shows donation information
 */
export async function handleDonate(ctx: Context): Promise<void> {
    const user = ctx.from;

    // Simple language detection without database
    let lang: SupportedLanguage = DEFAULT_LANGUAGE;
    if (user?.language_code && isValidLanguage(user.language_code)) {
        lang = user.language_code;
    }

    const donateMessage = [
        t('donate.title', lang),
        '',
        t('donate.message', lang)
    ].join('\n');

    await ctx.reply(donateMessage);
}
