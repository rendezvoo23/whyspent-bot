import { SupportedLanguage, SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from '../../config/constants';

/**
 * Localization strings for the bot
 */
const translations: Record<SupportedLanguage, Record<string, string>> = {
    en: {
        // Welcome & Start
        'welcome.title': '👋 Welcome to WhySpent!',
        'welcome.message': 'Track your expenses with ease. Simple, visual, and thoughtful.',
        'welcome.cta': 'Tap the button below to open the app.',

        // Commands
        'help.title': '📚 Available Commands',
        'help.commands': `
/start - Start the bot
/channel - Our Telegram channel`,

        'open.message': 'Ready to track your spending?',

        'feedback.prompt': '💬 Please send your feedback as a text message. It helps us improve!',
        'feedback.received': '✅ Thank you for your feedback! We appreciate it.',
        'feedback.cancel': 'Feedback mode cancelled.',

        'settings.title': '⚙️ Settings',
        'settings.language': 'Choose your language:',
        'settings.language_changed': '✅ Language changed to English',

        'privacy.title': '🔒 Privacy',
        'privacy.message': `We store only minimal data needed to operate:

• Your Telegram user ID
• Your username (if public)
• Your language preference
• When you joined and last used the bot

We do not share your data with third parties. Your expense data stays in the app on your device.`,

        'channel.title': '📢 WhySpent Journal',
        'channel.message': 'Stay updated with the latest news, tips, and insights about WhySpent.',
        'channel.cta': 'Tap the button below to join our Telegram channel.',
        'channel.button': '🔗 Join Channel',

        // Misc
        'error.generic': '❌ Something went wrong. Please try again.',
        'error.admin_only': '⛔ This command is for administrators only.',
        'hint.use_open': '💡 Use /open to launch WhySpent, or /help to see all commands.',

        // Broadcast
        'broadcast.no_message': '❌ Please provide a message. Usage:\n/broadcast text:Your message\n/broadcast preview:Preview message',
        'broadcast.started': '📤 Broadcasting message...',
        'broadcast.complete': '✅ Broadcast complete!\n\nTotal: {total}\nSuccess: {success}\nFailed: {failed}\nDuration: {duration}s',
        'broadcast.preview_sent': '👆 Preview sent above.',

        // Stats
        'stats.title': '📊 Bot Statistics',
        'stats.users': 'Total users: {count}',
        'stats.feedback': 'Feedback messages: {count}',

        // AI
        'ai.enabled': '🤖 AI chat enabled.',
        'ai.disabled': '🤖 AI chat disabled.',
        'ai.not_available': '🤖 AI features are not configured yet.',
    },

    ru: {
        // Welcome & Start
        'welcome.title': '👋 Добро пожаловать в WhySpent!',
        'welcome.message': 'Отслеживайте расходы легко. Просто, наглядно и продуманно.',
        'welcome.cta': 'Нажмите кнопку ниже, чтобы открыть приложение.',

        // Commands
        'help.title': '📚 Доступные команды',
        'help.commands': `
/start - Запустить бота
/channel - Наш Telegram канал`,

        'open.message': 'Готовы отслеживать расходы?',

        'feedback.prompt': '💬 Отправьте ваш отзыв текстовым сообщением. Это помогает нам улучшаться!',
        'feedback.received': '✅ Спасибо за отзыв! Мы ценим это.',
        'feedback.cancel': 'Режим отзыва отменён.',

        'settings.title': '⚙️ Настройки',
        'settings.language': 'Выберите язык:',
        'settings.language_changed': '✅ Язык изменён на Русский',

        'privacy.title': '🔒 Конфиденциальность',
        'privacy.message': `Мы храним только минимальные данные:

• Ваш Telegram ID
• Ваш никнейм (если публичный)
• Языковые настройки
• Когда вы присоединились и последний раз использовали бота

Мы не передаём данные третьим лицам. Ваши расходы хранятся в приложении на вашем устройстве.`,

        'channel.title': '📢 WhySpent Journal',
        'channel.message': 'Будьте в курсе последних новостей, советов и инсайтов о WhySpent.',
        'channel.cta': 'Нажмите кнопку ниже, чтобы присоединиться к нашему каналу.',
        'channel.button': '🔗 Перейти в канал',

        // Misc
        'error.generic': '❌ Что-то пошло не так. Попробуйте ещё раз.',
        'error.admin_only': '⛔ Эта команда только для администраторов.',
        'hint.use_open': '💡 Используйте /open чтобы открыть WhySpent, или /help для списка команд.',

        // Broadcast
        'broadcast.no_message': '❌ Укажите сообщение. Использование:\n/broadcast text:Ваше сообщение\n/broadcast preview:Предпросмотр',
        'broadcast.started': '📤 Отправка сообщения...',
        'broadcast.complete': '✅ Рассылка завершена!\n\nВсего: {total}\nУспешно: {success}\nНеудачно: {failed}\nВремя: {duration}с',
        'broadcast.preview_sent': '👆 Предпросмотр отправлен выше.',

        // Stats
        'stats.title': '📊 Статистика бота',
        'stats.users': 'Всего пользователей: {count}',
        'stats.feedback': 'Отзывов: {count}',

        // AI
        'ai.enabled': '🤖 AI чат включён.',
        'ai.disabled': '🤖 AI чат выключен.',
        'ai.not_available': '🤖 AI функции пока не настроены.',
    }
};

/**
 * Get translated string
 * @param key - Translation key
 * @param lang - Language code
 * @param params - Optional parameters to replace in the string
 */
export function t(
    key: string,
    lang: SupportedLanguage = DEFAULT_LANGUAGE,
    params?: Record<string, string | number>
): string {
    // Ensure valid language
    const validLang = SUPPORTED_LANGUAGES.includes(lang) ? lang : DEFAULT_LANGUAGE;

    // Get translation, fallback to English, then to key
    let text = translations[validLang]?.[key]
        ?? translations[DEFAULT_LANGUAGE]?.[key]
        ?? key;

    // Replace parameters
    if (params) {
        for (const [param, value] of Object.entries(params)) {
            text = text.replace(new RegExp(`\\{${param}\\}`, 'g'), String(value));
        }
    }

    return text;
}

/**
 * Check if a language is supported
 */
export function isValidLanguage(lang: string): lang is SupportedLanguage {
    return SUPPORTED_LANGUAGES.includes(lang as SupportedLanguage);
}
