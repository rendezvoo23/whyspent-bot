import { Context } from 'grammy';
import { getUser } from '../../services/userService';
import { t } from '../middlewares/i18n';
import { SupportedLanguage, DEFAULT_LANGUAGE } from '../../config/constants';

/**
 * Get user's language from database
 */
function getUserLanguage(ctx: Context): SupportedLanguage {
    const userId = ctx.from?.id;
    if (!userId) return DEFAULT_LANGUAGE;

    const user = getUser(userId);
    return (user?.language as SupportedLanguage) || DEFAULT_LANGUAGE;
}

/**
 * Handle /help command
 * Shows list of available commands
 */
export async function handleHelp(ctx: Context): Promise<void> {
    const lang = getUserLanguage(ctx);

    const helpMessage = [
        t('help.title', lang),
        t('help.commands', lang)
    ].join('\n');

    await ctx.reply(helpMessage);
}
