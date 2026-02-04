import { Context } from 'grammy';
import { upsertUser, getUser } from '../../services/userService';
import { getOnboardingKeyboard } from '../../services/miniAppLinks';
import { t } from '../middlewares/i18n';
import { SupportedLanguage } from '../../config/constants';

/**
 * Handle /start command
 * - Saves user in database
 * - Sends welcome message with onboarding buttons
 */
export async function handleStart(ctx: Context): Promise<void> {
    const user = ctx.from;

    if (!user) {
        await ctx.reply('Something went wrong. Please try again.');
        return;
    }

    // Register or update user in database
    const dbUser = upsertUser(user);
    const lang = dbUser.language as SupportedLanguage;

    // Check for start parameter (deep linking)
    const startParam = ctx.match;
    if (startParam) {
        console.log(`User ${user.id} started with parameter: ${startParam}`);
        // Handle deep linking parameters here if needed
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
