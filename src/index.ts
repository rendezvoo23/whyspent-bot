import { Bot, GrammyError, HttpError } from 'grammy';
import { env, validateEnv } from './config/env';
import { BOT_COMMANDS } from './config/constants';
import { initDb, closeDb } from './db/client';
import { rateLimit, startRateLimitCleanup } from './bot/middlewares/rateLimit';
import { handleStart } from './bot/handlers/start';
import { handleHelp } from './bot/handlers/help';
import {
    handleOpen,
    handleFeedback,
    handleSettings,
    handlePrivacy,
    handleDonate,
    handleBroadcast,
    handleStats,
    handleAI
} from './bot/handlers/commands';
import { handleTextMessage } from './bot/handlers/textRouter';
import { handleCallbackQuery } from './bot/handlers/callbackRouter';

/**
 * Main entry point for the WhySpent Bot
 */
async function main() {
    console.log('🚀 Starting WhySpent Bot...');

    // Validate environment
    validateEnv();

    // Initialize database (async for sql.js)
    await initDb();

    // Create bot instance
    const bot = new Bot(env.BOT_TOKEN);

    // Set bot commands for the menu
    await bot.api.setMyCommands(BOT_COMMANDS);
    console.log('📋 Bot commands registered');

    // Register middleware
    bot.use(rateLimit);

    // Register command handlers
    bot.command('start', handleStart);
    bot.command('help', handleHelp);
    bot.command('open', handleOpen);
    bot.command('feedback', handleFeedback);
    bot.command('settings', handleSettings);
    bot.command('privacy', handlePrivacy);
    bot.command('donate', handleDonate);
    bot.command('broadcast', handleBroadcast);
    bot.command('stats', handleStats);
    bot.command('ai', handleAI);

    // Register callback query handler
    bot.on('callback_query:data', handleCallbackQuery);

    // Register text message handler (for non-command messages)
    bot.on('message:text', handleTextMessage);

    // Error handling
    bot.catch((err) => {
        const ctx = err.ctx;
        console.error(`Error while handling update ${ctx.update.update_id}:`);

        const e = err.error;
        if (e instanceof GrammyError) {
            console.error('Error in request:', e.description);
        } else if (e instanceof HttpError) {
            console.error('Could not contact Telegram:', e);
        } else {
            console.error('Unknown error:', e);
        }
    });

    // Start rate limit cleanup
    startRateLimitCleanup();

    // Graceful shutdown
    process.on('SIGINT', () => {
        console.log('\n👋 Shutting down gracefully...');
        bot.stop();
        closeDb();
        process.exit(0);
    });

    process.on('SIGTERM', () => {
        console.log('\n👋 Shutting down gracefully...');
        bot.stop();
        closeDb();
        process.exit(0);
    });

    // Start long polling
    console.log('✅ Bot is running with long polling...');
    console.log(`📊 Admin IDs: ${env.ADMIN_IDS.join(', ') || 'none configured'}`);
    console.log(`🔗 Mini App URL: ${env.MINIAPP_URL}`);

    await bot.start({
        onStart: () => {
            console.log('🤖 Bot started successfully!');
        },
    });
}

// Run the bot
main().catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
});
