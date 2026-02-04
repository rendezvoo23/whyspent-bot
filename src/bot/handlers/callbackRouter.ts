import { Context } from 'grammy';
import { getUser, setLanguage } from '../../services/userService';
import { t, isValidLanguage } from '../middlewares/i18n';
import { SupportedLanguage, DEFAULT_LANGUAGE } from '../../config/constants';

/**
 * Handle callback queries from inline buttons
 */
export async function handleCallbackQuery(ctx: Context): Promise<void> {
    const userId = ctx.from?.id;
    const data = ctx.callbackQuery?.data;

    if (!userId || !data) {
        await ctx.answerCallbackQuery();
        return;
    }

    // Handle language selection: lang:en, lang:ru
    if (data.startsWith('lang:')) {
        const lang = data.slice('lang:'.length);

        if (isValidLanguage(lang)) {
            setLanguage(userId, lang);

            await ctx.answerCallbackQuery({
                text: lang === 'en' ? '✅ Language: English' : '✅ Язык: Русский'
            });

            // Update the message
            await ctx.editMessageText(t('settings.language_changed', lang));
        } else {
            await ctx.answerCallbackQuery({ text: 'Invalid language' });
        }
        return;
    }

    // Handle donate info button
    if (data === 'donate_info') {
        const user = getUser(userId);
        const lang = (user?.language as SupportedLanguage) || DEFAULT_LANGUAGE;

        await ctx.answerCallbackQuery();
        await ctx.reply([
            t('donate.title', lang),
            '',
            t('donate.message', lang)
        ].join('\n'));
        return;
    }

    // Unknown callback
    await ctx.answerCallbackQuery();
}
