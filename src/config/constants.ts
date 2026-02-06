/**
 * Application constants
 */

// Rate limiting
export const BROADCAST_RATE_LIMIT = 30; // messages per second
export const BROADCAST_DELAY_MS = Math.ceil(1000 / BROADCAST_RATE_LIMIT); // ~34ms between messages
export const USER_RATE_LIMIT = 30; // messages per minute per user

// Supported languages
export const SUPPORTED_LANGUAGES = ['en', 'ru'] as const;
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];
export const DEFAULT_LANGUAGE: SupportedLanguage = 'en';

// Bot commands for BotFather
// Bot commands for BotFather
export const BOT_COMMANDS = [
    { command: 'start', description: 'Start the bot' },
    { command: 'donate', description: 'Support development' },
] as const;

// User flags
export const USER_FLAGS = {
    FEEDBACK_MODE: 'feedback_mode',
    AI_ENABLED: 'ai_enabled',
} as const;
