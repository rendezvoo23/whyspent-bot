import { InlineKeyboard } from 'grammy';
import { env } from '../config/env';

/**
 * Get the Mini App URL with optional start parameter
 */
export function getMiniAppUrl(startParam?: string): string {
    let url = env.MINIAPP_URL;

    if (startParam) {
        // Append start parameter for deep linking
        const separator = url.includes('?') ? '&' : '?';
        url += `${separator}startapp=${encodeURIComponent(startParam)}`;
    }

    return url;
}

/**
 * Create an inline keyboard with Mini App button
 */
export function getMiniAppButton(
    text: string = '🚀 Open WhySpent',
    startParam?: string
): InlineKeyboard {
    const keyboard = new InlineKeyboard();

    // Add Mini App button (web_app for HTTPS URLs, or url for t.me links)
    if (env.MINIAPP_URL.startsWith('https://t.me/')) {
        // It's a t.me link, use as URL button
        keyboard.url(text, getMiniAppUrl(startParam));
    } else {
        // It's a web app URL
        keyboard.webApp(text, getMiniAppUrl(startParam));
    }

    return keyboard;
}

/**
 * Create onboarding keyboard with multiple buttons
 */
export function getOnboardingKeyboard(): InlineKeyboard {
    const keyboard = new InlineKeyboard();

    // Add Mini App button
    if (env.MINIAPP_URL.startsWith('https://t.me/')) {
        keyboard.url('🚀 Open WhySpent', env.MINIAPP_URL);
    } else {
        keyboard.webApp('🚀 Open WhySpent', env.MINIAPP_URL);
    }

    keyboard.row();

    // Add updates channel if configured
    if (env.UPDATES_CHANNEL_URL) {
        keyboard.url('📢 Join Updates', env.UPDATES_CHANNEL_URL);
        keyboard.row();
    }

    return keyboard;
}

/**
 * Create language selection keyboard
 */
export function getLanguageKeyboard(): InlineKeyboard {
    return new InlineKeyboard()
        .text('🇺🇸 English', 'lang:en')
        .text('🇷🇺 Русский', 'lang:ru');
}
