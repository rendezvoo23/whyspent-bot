/**
 * Simple Telegram Webhook Server
 * 
 * This minimal Express server receives Telegram bot updates via webhook.
 * Deploy to Render and set your Telegram bot webhook to:
 * https://your-app.onrender.com/telegram/webhook
 */

import express, { Request, Response } from 'express';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Create Express app
const app = express();

// Middleware to parse JSON request bodies (required for Telegram updates)
app.use(express.json());

// Health check endpoint (useful for Render health checks)
app.get('/', (_req: Request, res: Response) => {
    res.send('WhySpent Bot Webhook is running!');
});

// Main webhook endpoint - receives all Telegram updates
app.post('/telegram/webhook', (req: Request, res: Response) => {
    // Log the incoming update for debugging
    console.log('📩 Received Telegram update:', JSON.stringify(req.body, null, 2));

    // Always respond with 200 OK to acknowledge receipt
    // Telegram will retry if it doesn't receive 200
    res.sendStatus(200);
});

// Get port from environment (Render provides PORT automatically)
const PORT = process.env.PORT || 3000;

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Webhook server running on port ${PORT}`);
    console.log(`📡 Webhook endpoint: /telegram/webhook`);
});
