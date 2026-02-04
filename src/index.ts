import { Bot, GrammyError, HttpError, webhookCallback } from 'grammy';
import express from 'express';
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
async function bootstrap() {
    try {
        console.log('🚀 Initializing WhySpent Bot...');

        // 1. Environment Validation
        validateEnv();

        // 2. Database Connection - MUST stay open
        await initDb();

        // 3. Bot Instance Setup
        const bot = new Bot(env.BOT_TOKEN);

        // Register Bot Middleware & Handlers
        bot.use(rateLimit);
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
        bot.on('callback_query:data', handleCallbackQuery);
        bot.on('message:text', handleTextMessage);

        // Global Error Handler
        bot.catch((err) => {
            const ctx = err.ctx;
            console.error(`Error while handling update ${ctx.update.update_id}:`);
            const e = err.error;
            if (e instanceof GrammyError) console.error('Grammy Error:', e.description);
            else if (e instanceof HttpError) console.error('HTTP Error:', e);
            else console.error('Unknown Error:', e);
        });

        // 4. Background Tasks
        startRateLimitCleanup();

        // 5. Register Commands (Async)
        bot.api.setMyCommands(BOT_COMMANDS).catch(err => {
            console.warn('⚠️ Warning: Could not register bot commands:', err.message);
        });

        // 6. Shutdown Handlers (Do NOT call process.exit)
        const cleanup = async (signal: string) => {
            console.log(`\n👋 Received ${signal}. Closing database...`);
            try {
                closeDb();
            } catch (err) {
                console.error('Error during cleanup:', err);
            }
        };

        process.on('SIGINT', () => cleanup('SIGINT'));
        process.on('SIGTERM', () => cleanup('SIGTERM'));

        // 7. Start the Server (Webhook vs Polling)
        const PORT = process.env.PORT;

        if (PORT) {
            // WEBHOOK MODE (Production / Render)
            const app = express();
            app.use(express.json());

            // Health Check for Render
            app.get('/', (req, res) => res.send('WhySpent Bot is Online 🚀'));

            // Webhook Endpoint
            app.post('/telegram/webhook', webhookCallback(bot, 'express'));

            app.listen(PORT, () => {
                console.log("Listening on port", PORT);
            });
        } else {
            // POLLING MODE (Local Development)
            console.log('✅ Port not found, starting in long polling mode...');
            await bot.start({
                onStart: () => {
                    console.log('🤖 Bot started successfully via polling!');
                },
            });
        }

    } catch (error) {
        console.error('❌ Fatal error during startup:', error);
        // We avoid process.exit even here as per instructions, 
        // but normally a fatal startup error would warrant it.
    }
}

// Start the application
bootstrap();
