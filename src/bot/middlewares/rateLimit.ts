import { Context, NextFunction } from 'grammy';
import { USER_RATE_LIMIT } from '../../config/constants';
import { isAdmin } from './authAdmin';

/**
 * Simple in-memory rate limiter
 * For production, consider using Redis or similar
 */
const userRequests: Map<number, { count: number; resetAt: number }> = new Map();

/**
 * Rate limit middleware
 * Limits requests per user per minute
 */
export async function rateLimit(ctx: Context, next: NextFunction): Promise<void> {
    const userId = ctx.from?.id;

    if (!userId) {
        await next();
        return;
    }

    // Skip rate limiting for admins
    if (isAdmin(userId)) {
        await next();
        return;
    }

    const now = Date.now();
    const userData = userRequests.get(userId);

    if (!userData || now > userData.resetAt) {
        // Reset counter
        userRequests.set(userId, {
            count: 1,
            resetAt: now + 60 * 1000 // 1 minute window
        });
        await next();
        return;
    }

    if (userData.count >= USER_RATE_LIMIT) {
        // Rate limited
        console.warn(`Rate limited user ${userId}`);
        await ctx.reply('⚠️ Too many requests. Please wait a moment.');
        return;
    }

    // Increment counter
    userData.count++;
    await next();
}

/**
 * Clean up old entries periodically
 */
export function startRateLimitCleanup(): void {
    setInterval(() => {
        const now = Date.now();
        for (const [userId, data] of userRequests.entries()) {
            if (now > data.resetAt) {
                userRequests.delete(userId);
            }
        }
    }, 5 * 60 * 1000); // Clean up every 5 minutes
}
