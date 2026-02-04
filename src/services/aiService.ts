import { env } from '../config/env';
import { execute, query } from '../db/client';

/**
 * AI Service - Stub for future integration
 * 
 * This service will handle AI-powered chat functionality.
 * Currently implements placeholder methods that can be extended
 * with OpenAI, Claude, or other AI providers.
 * 
 * Environment variables:
 * - AI_PROVIDER: 'openai' | 'claude' | 'custom'
 * - AI_API_KEY: API key for the chosen provider
 */

/**
 * Message role types for chat history
 */
export type MessageRole = 'user' | 'assistant' | 'system';

/**
 * Chat message structure
 */
export interface ChatMessage {
    role: MessageRole;
    content: string;
}

/**
 * Check if AI is configured and available
 */
export function isAIAvailable(): boolean {
    return !!(env.AI_API_KEY && env.AI_PROVIDER);
}

/**
 * Generate AI reply for a user message
 * 
 * TODO: Implement actual AI integration here
 * 
 * @param userId - Telegram user ID
 * @param text - User's message text
 * @returns AI-generated response
 * 
 * Future implementation:
 * 1. Fetch user's message history from database
 * 2. Build context with system prompt
 * 3. Call AI provider API (OpenAI, Claude, etc.)
 * 4. Store response in message history
 * 5. Return generated text
 */
export async function generateReply(userId: number, text: string): Promise<string> {
    // Check if AI is configured
    if (!isAIAvailable()) {
        return "AI features are not configured. Please contact the administrator.";
    }

    // TODO: Implement actual AI call
    // Example structure for OpenAI:
    /*
    const history = getMessageHistory(userId);
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history,
      { role: 'user', content: text }
    ];
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages,
    });
    
    const reply = response.choices[0].message.content;
    saveMessage(userId, 'user', text);
    saveMessage(userId, 'assistant', reply);
    
    return reply;
    */

    // Placeholder response
    console.log(`[AI Stub] Would generate reply for user ${userId}: "${text}"`);
    return "🤖 AI chat is coming soon! This feature is under development.";
}

/**
 * Save a message to the history (for future AI context)
 */
export function saveMessage(userId: number, role: MessageRole, content: string): void {
    execute(
        'INSERT INTO message_history (user_id, role, content, created_at) VALUES (?, ?, ?, ?)',
        [userId, role, content, new Date().toISOString()]
    );
}

/**
 * Get message history for a user
 * @param userId - Telegram user ID
 * @param limit - Maximum number of messages to retrieve
 */
export function getMessageHistory(userId: number, limit: number = 20): ChatMessage[] {
    return query<{ role: MessageRole; content: string }>(
        'SELECT role, content FROM message_history WHERE user_id = ? ORDER BY created_at DESC LIMIT ?',
        [userId, limit]
    ).reverse(); // Reverse to get chronological order
}

/**
 * Clear message history for a user
 */
export function clearMessageHistory(userId: number): void {
    execute('DELETE FROM message_history WHERE user_id = ?', [userId]);
}

/**
 * Get total messages stored for analytics
 */
export function getMessageCount(): number {
    const result = query<{ count: number }>('SELECT COUNT(*) as count FROM message_history');
    return result[0]?.count || 0;
}
