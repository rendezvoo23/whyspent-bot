import { User } from 'grammy/types';
import { execute, query, queryOne } from '../db/client';
import { DEFAULT_LANGUAGE, SupportedLanguage, USER_FLAGS } from '../config/constants';

/**
 * User record from database
 */
export interface DbUser {
    user_id: number;
    username: string | null;
    first_name: string | null;
    language: SupportedLanguage;
    joined_at: string;
    last_active_at: string;
    flags: string; // JSON string
}

/**
 * Parsed user flags
 */
export interface UserFlags {
    [USER_FLAGS.FEEDBACK_MODE]?: boolean;
    [USER_FLAGS.AI_ENABLED]?: boolean;
}

/**
 * Create or update a user in the database
 */
export function upsertUser(telegramUser: User): DbUser {
    const now = new Date().toISOString();

    const existing = queryOne<DbUser>(
        'SELECT * FROM users WHERE user_id = ?',
        [telegramUser.id]
    );

    if (existing) {
        // Update existing user
        execute(
            `UPDATE users SET 
        username = ?, 
        first_name = ?,
        last_active_at = ?
      WHERE user_id = ?`,
            [
                telegramUser.username || null,
                telegramUser.first_name || null,
                now,
                telegramUser.id
            ]
        );
        return { ...existing, last_active_at: now };
    }

    // Create new user
    execute(
        `INSERT INTO users (user_id, username, first_name, language, joined_at, last_active_at, flags)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
            telegramUser.id,
            telegramUser.username || null,
            telegramUser.first_name || null,
            DEFAULT_LANGUAGE,
            now,
            now,
            '{}'
        ]
    );

    return {
        user_id: telegramUser.id,
        username: telegramUser.username || null,
        first_name: telegramUser.first_name || null,
        language: DEFAULT_LANGUAGE,
        joined_at: now,
        last_active_at: now,
        flags: '{}'
    };
}

/**
 * Get a user by ID
 */
export function getUser(userId: number): DbUser | undefined {
    return queryOne<DbUser>('SELECT * FROM users WHERE user_id = ?', [userId]);
}

/**
 * Update user's last active timestamp
 */
export function updateLastActive(userId: number): void {
    execute(
        'UPDATE users SET last_active_at = ? WHERE user_id = ?',
        [new Date().toISOString(), userId]
    );
}

/**
 * Set user's language preference
 */
export function setLanguage(userId: number, language: SupportedLanguage): void {
    execute(
        'UPDATE users SET language = ? WHERE user_id = ?',
        [language, userId]
    );
}

/**
 * Get all users (for broadcast)
 */
export function getAllUsers(): DbUser[] {
    return query<DbUser>('SELECT * FROM users');
}

/**
 * Get users by language (for targeted broadcast)
 */
export function getUsersByLanguage(language: SupportedLanguage): DbUser[] {
    return query<DbUser>('SELECT * FROM users WHERE language = ?', [language]);
}

/**
 * Get user count
 */
export function getUserCount(): number {
    const result = queryOne<{ count: number }>('SELECT COUNT(*) as count FROM users');
    return result?.count || 0;
}

/**
 * Parse user flags from JSON string
 */
export function parseFlags(flagsJson: string): UserFlags {
    try {
        return JSON.parse(flagsJson);
    } catch {
        return {};
    }
}

/**
 * Get a specific flag value
 */
export function getFlag(userId: number, flag: string): boolean {
    const user = getUser(userId);
    if (!user) return false;
    const flags = parseFlags(user.flags);
    return flags[flag as keyof UserFlags] || false;
}

/**
 * Set a specific flag value
 */
export function setFlag(userId: number, flag: string, value: boolean): void {
    const user = getUser(userId);
    if (!user) return;

    const flags = parseFlags(user.flags);
    flags[flag as keyof UserFlags] = value;

    execute(
        'UPDATE users SET flags = ? WHERE user_id = ?',
        [JSON.stringify(flags), userId]
    );
}

/**
 * Save user feedback
 */
export function saveFeedback(userId: number, message: string): void {
    execute(
        'INSERT INTO feedback (user_id, message, created_at) VALUES (?, ?, ?)',
        [userId, message, new Date().toISOString()]
    );
}

/**
 * Get feedback count
 */
export function getFeedbackCount(): number {
    const result = queryOne<{ count: number }>('SELECT COUNT(*) as count FROM feedback');
    return result?.count || 0;
}
