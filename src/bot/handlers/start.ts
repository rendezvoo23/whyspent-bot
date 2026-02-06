import { Context } from 'grammy';
import { getOnboardingKeyboard } from '../../services/miniAppLinks';
import { t, isValidLanguage } from '../middlewares/i18n';
import { DEFAULT_LANGUAGE, SupportedLanguage } from '../../config/constants';

/**
 * Handle /start command
 * - Sends welcome message with onboarding buttons
 */
export async function handleStart(ctx: Context): Promise<void> {
    const user = ctx.from;

    if (!user) {
        await ctx.reply('Something went wrong. Please try again.');
        return;
    }

    // Simple language detection without database
    let lang: SupportedLanguage = DEFAULT_LANGUAGE;
    if (user.language_code && isValidLanguage(user.language_code)) {
        lang = user.language_code;
    }

    // Check for start parameter (deep linking)
    const startParam = ctx.match;
    if (startParam) {
        console.log(`User ${user.id} started with parameter: ${startParam}`);
    }

    // Build welcome message
    const welcomeMessage = [
        t('welcome.title', lang),
        '',
        t('welcome.message', lang),
        '',
        t('welcome.cta', lang)
    ].join('\n');

    // Send welcome message with inline buttons
    await ctx.reply(welcomeMessage, {
        reply_markup: getOnboardingKeyboard(),
    });
}
