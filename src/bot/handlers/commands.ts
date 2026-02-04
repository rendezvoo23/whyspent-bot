import { Context } from 'grammy';
import { getUser, setFlag, getUserCount, getFeedbackCount, setLanguage } from '../../services/userService';
import { getMiniAppButton, getLanguageKeyboard } from '../../services/miniAppLinks';
import {
    parseBroadcastCommand,
    broadcastToAll,
    broadcastByLanguage,
    previewBroadcast
} from '../../services/broadcastService';
import { isAIAvailable } from '../../services/aiService';
import { t } from '../middlewares/i18n';
import { isAdmin } from '../middlewares/authAdmin';
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
 * Handle /open command
 * Opens the Mini App
 */
export async function handleOpen(ctx: Context): Promise<void> {
    const lang = getUserLanguage(ctx);

    await ctx.reply(t('open.message', lang), {
        reply_markup: getMiniAppButton('🚀 Open WhySpent'),
    });
}

/**
 * Handle /feedback command
 * Enables feedback mode for user
 */
export async function handleFeedback(ctx: Context): Promise<void> {
    const userId = ctx.from?.id;
    if (!userId) return;

    const lang = getUserLanguage(ctx);

    // Set feedback mode flag
    setFlag(userId, USER_FLAGS.FEEDBACK_MODE, true);

    await ctx.reply(t('feedback.prompt', lang));
}

/**
 * Handle /settings command
 * Shows settings with language selection
 */
export async function handleSettings(ctx: Context): Promise<void> {
    const lang = getUserLanguage(ctx);

    const settingsMessage = [
        t('settings.title', lang),
        '',
        t('settings.language', lang)
    ].join('\n');

    await ctx.reply(settingsMessage, {
        reply_markup: getLanguageKeyboard(),
    });
}

/**
 * Handle /privacy command
 * Shows privacy information
 */
export async function handlePrivacy(ctx: Context): Promise<void> {
    const lang = getUserLanguage(ctx);

    const privacyMessage = [
        t('privacy.title', lang),
        '',
        t('privacy.message', lang)
    ].join('\n');

    await ctx.reply(privacyMessage);
}

/**
 * Handle /donate command
 * Shows donation information
 */
export async function handleDonate(ctx: Context): Promise<void> {
    const lang = getUserLanguage(ctx);

    const donateMessage = [
        t('donate.title', lang),
        '',
        t('donate.message', lang)
    ].join('\n');

    await ctx.reply(donateMessage);
}

/**
 * Handle /broadcast command (admin only)
 * Sends message to users
 */
export async function handleBroadcast(ctx: Context): Promise<void> {
    const userId = ctx.from?.id;
    if (!userId) return;

    // Check admin
    if (!isAdmin(userId)) {
        await ctx.reply(t('error.admin_only', DEFAULT_LANGUAGE));
        return;
    }

    const text = ctx.message?.text || '';
    const parsed = parseBroadcastCommand(text);

    if (!parsed || !parsed.message) {
        await ctx.reply(t('broadcast.no_message', DEFAULT_LANGUAGE));
        return;
    }

    // Handle preview
    if (parsed.type === 'preview') {
        await previewBroadcast(ctx.api, userId, parsed.message);
        await ctx.reply(t('broadcast.preview_sent', DEFAULT_LANGUAGE));
        return;
    }

    // Send starting message
    await ctx.reply(t('broadcast.started', DEFAULT_LANGUAGE));

    let result;

    if (parsed.type === 'lang' && parsed.language) {
        // Broadcast to specific language
        result = await broadcastByLanguage(ctx.api, parsed.message, parsed.language, userId);
    } else {
        // Broadcast to all
        result = await broadcastToAll(ctx.api, parsed.message, userId);
    }

    // Send completion message
    await ctx.reply(t('broadcast.complete', DEFAULT_LANGUAGE, {
        total: result.total,
        success: result.success,
        failed: result.failed,
        duration: Math.round(result.duration / 1000)
    }));
}

/**
 * Handle /stats command (admin only)
 * Shows bot statistics
 */
export async function handleStats(ctx: Context): Promise<void> {
    const userId = ctx.from?.id;
    if (!userId) return;

    // Check admin
    if (!isAdmin(userId)) {
        await ctx.reply(t('error.admin_only', DEFAULT_LANGUAGE));
        return;
    }

    const userCount = getUserCount();
    const feedbackCount = getFeedbackCount();

    const statsMessage = [
        t('stats.title', DEFAULT_LANGUAGE),
        '',
        t('stats.users', DEFAULT_LANGUAGE, { count: userCount }),
        t('stats.feedback', DEFAULT_LANGUAGE, { count: feedbackCount }),
    ].join('\n');

    await ctx.reply(statsMessage);
}

/**
 * Handle /ai command (toggle AI mode)
 */
export async function handleAI(ctx: Context): Promise<void> {
    const userId = ctx.from?.id;
    if (!userId) return;

    const lang = getUserLanguage(ctx);
    const text = ctx.message?.text || '';

    // Parse command: /ai on or /ai off
    const match = text.match(/^\/ai\s*(on|off)?$/i);

    if (!match) {
        await ctx.reply('Usage: /ai on | /ai off');
        return;
    }

    const action = match[1]?.toLowerCase();

    // Check if AI is available
    if (!isAIAvailable()) {
        await ctx.reply(t('ai.not_available', lang));
        return;
    }

    if (action === 'on') {
        setFlag(userId, USER_FLAGS.AI_ENABLED, true);
        await ctx.reply(t('ai.enabled', lang));
    } else if (action === 'off') {
        setFlag(userId, USER_FLAGS.AI_ENABLED, false);
        await ctx.reply(t('ai.disabled', lang));
    } else {
        // Toggle current state
        const user = getUser(userId);
        if (user) {
            const flags = JSON.parse(user.flags || '{}');
            const currentState = flags[USER_FLAGS.AI_ENABLED] || false;
            setFlag(userId, USER_FLAGS.AI_ENABLED, !currentState);
            await ctx.reply(!currentState ? t('ai.enabled', lang) : t('ai.disabled', lang));
        }
    }
}
