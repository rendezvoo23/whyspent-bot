import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

/**
 * Environment configuration with type-safe access and validation
 */
export const env = {
    // Required
    BOT_TOKEN: process.env.BOT_TOKEN || '',
    ADMIN_IDS: (process.env.ADMIN_IDS || '').split(',').map(id => parseInt(id.trim(), 10)).filter(id => !isNaN(id)),
    MINIAPP_URL: process.env.MINIAPP_URL || 'https://happymonday-ten.vercel.app/',

    // Optional
    UPDATES_CHANNEL_URL: process.env.UPDATES_CHANNEL_URL || '',
    NODE_ENV: process.env.NODE_ENV || 'development',
    SQLITE_PATH: process.env.SQLITE_PATH || './data/db.sqlite',

    // AI Integration (future)
    AI_PROVIDER: process.env.AI_PROVIDER || 'openai',
    AI_API_KEY: process.env.AI_API_KEY || '',

    // Helpers
    isDev: process.env.NODE_ENV === 'development',
    isProd: process.env.NODE_ENV === 'production',
};

/**
 * Validate required environment variables
 */
export function validateEnv(): void {
    const required = ['BOT_TOKEN'];
    const missing = required.filter(key => !process.env[key]);

    if (missing.length > 0) {
        console.error(`❌ Missing required environment variables: ${missing.join(', ')}`);
        console.error('Please check your .env file or environment configuration.');
        process.exit(1);
    }

    if (env.ADMIN_IDS.length === 0) {
        console.warn('⚠️  No ADMIN_IDS configured. Admin commands will be disabled.');
    }

    console.log('✅ Environment configuration validated');
}
