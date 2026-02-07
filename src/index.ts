import { Bot, GrammyError, HttpError, webhookCallback } from 'grammy';
import express from 'express';
import { env, validateEnv } from './config/env';
import { BOT_COMMANDS } from './config/constants';
import { rateLimit, startRateLimitCleanup } from './bot/middlewares/rateLimit';
import { handleStart } from './bot/handlers/start';
import { handleChannel } from './bot/handlers/channel';

/**
 * Main entry point for the WhySpent Bot
 */
async function bootstrap() {
    try {
        console.log('🚀 Initializing WhySpent Bot...');

        // 1. Environment Validation
        validateEnv();

        // 2. Bot Instance Setup
        const bot = new Bot(env.BOT_TOKEN);

        // Register Bot Middleware & Handlers
        bot.use(rateLimit);
        bot.command('start', handleStart);
        bot.command('channel', handleChannel);

        // Global Error Handler
        bot.catch((err) => {
            const ctx = err.ctx;
            console.error(`Error while handling update ${ctx.update.update_id}:`);
            const e = err.error;
            if (e instanceof GrammyError) console.error('Grammy Error:', e.description);
            else if (e instanceof HttpError) console.error('HTTP Error:', e);
            else console.error('Unknown Error:', e);
        });

        // 3. Background Tasks
        startRateLimitCleanup();

        // 4. Register Commands (Async)
        bot.api.setMyCommands(BOT_COMMANDS).catch(err => {
            console.warn('⚠️ Warning: Could not register bot commands:', err.message);
        });

        // 5. Shutdown Handlers
        const cleanup = async (signal: string) => {
            console.log(`\n👋 Received ${signal}. Shutting down...`);
            // Add any other cleanup logic here
        };

        process.on('SIGINT', () => cleanup('SIGINT'));
        process.on('SIGTERM', () => cleanup('SIGTERM'));

        // 6. Start the Server (Webhook vs Polling)
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
