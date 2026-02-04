import { Api, RawApi } from 'grammy';
import { execute } from '../db/client';
import { BROADCAST_DELAY_MS } from '../config/constants';
import { getAllUsers, getUsersByLanguage, DbUser } from './userService';
import { SupportedLanguage } from '../config/constants';

/**
 * Broadcast result statistics
 */
export interface BroadcastResult {
    total: number;
    success: number;
    failed: number;
    duration: number;
}

/**
 * Delay helper for rate limiting
 */
function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Send a broadcast message to specified users with rate limiting
 */
export async function broadcast(
    api: Api<RawApi>,
    message: string,
    users: DbUser[]
): Promise<BroadcastResult> {
    const startTime = Date.now();
    let success = 0;
    let failed = 0;

    for (const user of users) {
        try {
            await api.sendMessage(user.user_id, message, {
                parse_mode: 'HTML',
            });
            success++;
        } catch (error) {
            console.error(`Failed to send to ${user.user_id}:`, error);
            failed++;
        }

        // Rate limiting: wait between messages
        await delay(BROADCAST_DELAY_MS);
    }

    const duration = Date.now() - startTime;

    return { total: users.length, success, failed, duration };
}

/**
 * Broadcast to all users
 */
export async function broadcastToAll(
    api: Api<RawApi>,
    message: string,
    adminId: number
): Promise<BroadcastResult> {
    const users = getAllUsers();
    const result = await broadcast(api, message, users);

    // Log broadcast
    logBroadcast(adminId, message, 'all', result);

    return result;
}

/**
 * Broadcast to users by language
 */
export async function broadcastByLanguage(
    api: Api<RawApi>,
    message: string,
    language: SupportedLanguage,
    adminId: number
): Promise<BroadcastResult> {
    const users = getUsersByLanguage(language);
    const result = await broadcast(api, message, users);

    // Log broadcast
    logBroadcast(adminId, message, `lang:${language}`, result);

    return result;
}

/**
 * Preview broadcast (send only to admin)
 */
export async function previewBroadcast(
    api: Api<RawApi>,
    adminId: number,
    message: string
): Promise<void> {
    await api.sendMessage(adminId, `📋 <b>Broadcast Preview:</b>\n\n${message}`, {
        parse_mode: 'HTML',
    });
}

/**
 * Log broadcast to database
 */
function logBroadcast(
    adminId: number,
    message: string,
    targetFilter: string,
    result: BroadcastResult
): void {
    execute(
        `INSERT INTO broadcast_logs (admin_id, message, target_filter, success_count, fail_count, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
        [
            adminId,
            message,
            targetFilter,
            result.success,
            result.failed,
            new Date().toISOString()
        ]
    );
}

/**
 * Parse broadcast command
 * Formats:
 * - /broadcast text:<message> - send to all
 * - /broadcast all:<message> - send to all
 * - /broadcast lang:en:<message> - send to English users
 * - /broadcast preview:<message> - preview only
 */
export function parseBroadcastCommand(text: string): {
    type: 'all' | 'lang' | 'preview';
    language?: SupportedLanguage;
    message: string;
} | null {
    // Remove /broadcast prefix
    const content = text.replace(/^\/broadcast\s*/, '').trim();

    if (content.startsWith('preview:')) {
        return {
            type: 'preview',
            message: content.slice('preview:'.length).trim()
        };
    }

    if (content.startsWith('all:')) {
        return {
            type: 'all',
            message: content.slice('all:'.length).trim()
        };
    }

    if (content.startsWith('text:')) {
        return {
            type: 'all',
            message: content.slice('text:'.length).trim()
        };
    }

    if (content.startsWith('lang:')) {
        const rest = content.slice('lang:'.length);
        const langMatch = rest.match(/^(en|ru):/);
        if (langMatch) {
            return {
                type: 'lang',
                language: langMatch[1] as SupportedLanguage,
                message: rest.slice(langMatch[0].length).trim()
            };
        }
    }

    return null;
}
