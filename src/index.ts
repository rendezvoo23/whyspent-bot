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

        // 5. Register Commands (Async, don't block startup if possible)
        bot.api.setMyCommands(BOT_COMMANDS).catch(err => {
            console.warn('⚠️ Warning: Could not register bot commands:', err.message);
        });

        // 6. Shutdown Handlers (Cleanup only on signal)
        const gracefulShutdown = async (signal: string) => {
            console.log(`\n👋 Received ${signal}. Closing bot and database...`);
            try {
                await bot.stop();
                closeDb();
            } catch (err) {
                console.error('Error during shutdown:', err);
            }
            process.exit(0);
        };

        process.on('SIGINT', () => gracefulShutdown('SIGINT'));
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

        // 7. Start the Server (Webhook vs Polling)
        const PORT = process.env.PORT;

        if (PORT) {
            // WEBHOOK MODE (Production / Render)
            const app = express();
            app.use(express.json());

            // Health Check for Render
            app.get('/', (req, res) => res.send('WhySpent Bot Status: Online 🚀'));

            // Webhook Endpoint
            app.post('/telegram/webhook', (req, res, next) => {
                console.log('📩 Incoming Telegram update:', req.body?.update_id || 'unknown');
                next();
            }, webhookCallback(bot, 'express'));

            app.listen(PORT, () => {
                console.log("Listening on port", PORT);
                console.log(`📡 Webhook endpoint active at /telegram/webhook`);
            });
        } else {
            // POLLING MODE (Local Development)
            console.log('✅ Port not found, starting in long polling mode...');
            bot.start({
                onStart: () => {
                    console.log('🤖 Bot started successfully via polling!');
                },
            });
        }

        console.log(`📊 Admin IDs: ${env.ADMIN_IDS.join(', ') || 'none configured'}`);
        console.log(`🔗 Mini App URL: ${env.MINIAPP_URL}`);

    } catch (error) {
        console.error('❌ Fatal error during startup:', error);
        process.exit(1);
    }
}

// Start the application
bootstrap();
