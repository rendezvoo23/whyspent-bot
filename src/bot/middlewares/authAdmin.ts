import { Context, NextFunction } from 'grammy';
import { env } from '../../config/env';

/**
 * Check if a user ID is in the admin list
 */
export function isAdmin(userId: number): boolean {
    return env.ADMIN_IDS.includes(userId);
}

/**
 * Middleware that checks if the user is an admin
 * If not, sends an error message and stops processing
 */
export async function requireAdmin(ctx: Context, next: NextFunction): Promise<void> {
    const userId = ctx.from?.id;

    if (!userId || !isAdmin(userId)) {
        await ctx.reply('⛔ This command is for administrators only.');
        return;
    }

    await next();
}

/**
 * Function wrapper for admin-only handlers
 */
export function adminOnly<T extends Context>(
    handler: (ctx: T) => Promise<void>
): (ctx: T) => Promise<void> {
    return async (ctx: T) => {
        const userId = ctx.from?.id;

        if (!userId || !isAdmin(userId)) {
            await ctx.reply('⛔ This command is for administrators only.');
            return;
        }

        await handler(ctx);
    };
}
