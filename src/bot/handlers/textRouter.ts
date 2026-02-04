import { Context } from 'grammy';
import { getUser, setFlag, saveFeedback, getFlag } from '../../services/userService';
import { generateReply, isAIAvailable } from '../../services/aiService';
import { t } from '../middlewares/i18n';
import { SupportedLanguage, DEFAULT_LANGUAGE, USER_FLAGS } from '../../config/constants';

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
 * Handle regular text messages (non-commands)
 * Routes based on user state (feedback mode, AI mode, etc.)
 */
export async function handleTextMessage(ctx: Context): Promise<void> {
    const userId = ctx.from?.id;
    const text = ctx.message?.text;

    if (!userId || !text) return;

    const lang = getUserLanguage(ctx);

    // Check if user is in feedback mode
    if (getFlag(userId, USER_FLAGS.FEEDBACK_MODE)) {
        // Save feedback
        saveFeedback(userId, text);

        // Clear feedback mode
        setFlag(userId, USER_FLAGS.FEEDBACK_MODE, false);

        await ctx.reply(t('feedback.received', lang));
        return;
    }

    // Check if AI chat is enabled for this user
    if (getFlag(userId, USER_FLAGS.AI_ENABLED) && isAIAvailable()) {
        try {
            const reply = await generateReply(userId, text);
            await ctx.reply(reply);
        } catch (error) {
            console.error('AI reply error:', error);
            await ctx.reply(t('error.generic', lang));
        }
        return;
    }

    // Default: show hint
    await ctx.reply(t('hint.use_open', lang));
}
