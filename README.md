# WhySpent Bot

Production-ready Telegram bot backend for the WhySpent Mini App.

## Features

- 🚀 Welcome/onboarding with Mini App integration
- 💬 Full command system (/help, /open, /settings, /feedback, /privacy, /donate)
- 📢 Admin broadcast system with rate limiting
- 🌍 Multi-language support (English, Russian)
- 🗄️ SQLite database for user management
- 🤖 AI chat integration (stub, ready for implementation)

## Quick Start

### 1. Create Your Bot

1. Message [@BotFather](https://t.me/BotFather) on Telegram
2. Send `/newbot` and follow the prompts
3. Copy the bot token

### 2. Configure Environment

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your values
```

Required variables:
```
BOT_TOKEN=your_bot_token_here
ADMIN_IDS=your_telegram_id
MINIAPP_URL=https://t.me/your_bot/app
```

### 3. Set Bot Commands (Optional)

Message @BotFather and send:
```
/setcommands
```

Then paste:
```
start - Start the bot
help - Show available commands
open - Open WhySpent app
feedback - Send feedback
settings - Bot settings
privacy - Privacy information
donate - Support development
```

### 4. Run Locally

```bash
# Install dependencies
npm install

# Run in development mode (with hot reload)
npm run dev

# Or build and run production
npm run build
npm start
```

## Deployment on Render

### Web Service Setup

1. Create a new **Web Service** on [Render](https://render.com)
2. Connect your GitHub repository
3. Configure:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: Free (or Starter for reliability)

### Environment Variables

Add these in Render's Environment settings:

| Variable | Value |
|----------|-------|
| `BOT_TOKEN` | Your bot token from BotFather |
| `ADMIN_IDS` | Comma-separated admin Telegram IDs |
| `MINIAPP_URL` | Your Mini App URL |
| `UPDATES_CHANNEL_URL` | (Optional) Your updates channel |
| `NODE_ENV` | `production` |

### Persistent Storage (Important!)

For SQLite to persist between deploys:
1. Add a **Disk** to your service
2. Mount path: `/data`
3. Set `SQLITE_PATH=/data/db.sqlite`

## Project Structure

```
src/
├── bot/
│   ├── handlers/        # Command handlers
│   │   ├── start.ts     # /start command
│   │   ├── help.ts      # /help command
│   │   ├── commands.ts  # Other commands
│   │   ├── textRouter.ts     # Text message routing
│   │   └── callbackRouter.ts # Inline button handling
│   └── middlewares/
│       ├── rateLimit.ts # Rate limiting
│       ├── i18n.ts      # Localization
│       └── authAdmin.ts # Admin authentication
├── services/
│   ├── userService.ts      # User CRUD
│   ├── broadcastService.ts # Broadcast with rate limiting
│   ├── miniAppLinks.ts     # Mini App button helpers
│   └── aiService.ts        # AI chat stub
├── db/
│   ├── client.ts    # SQLite client
│   └── schema.sql   # Database schema
├── config/
│   ├── env.ts       # Environment config
│   └── constants.ts # App constants
└── index.ts         # Entry point
```

## Commands Reference

| Command | Description | Admin Only |
|---------|-------------|------------|
| `/start` | Welcome message with Mini App button | No |
| `/help` | Show all commands | No |
| `/open` | Open Mini App button | No |
| `/feedback` | Enter feedback mode | No |
| `/settings` | Language selection | No |
| `/privacy` | Privacy information | No |
| `/donate` | Donation information | No |
| `/broadcast` | Send message to users | Yes |
| `/stats` | Bot statistics | Yes |
| `/ai on\|off` | Toggle AI chat | No |

### Broadcast Usage

```
/broadcast text:Your message here
/broadcast all:Same as text
/broadcast lang:en:Message for English users
/broadcast preview:Preview before sending
```

## Next Steps

### Webhook (Production)
For better reliability, switch from long polling to webhooks:
```typescript
// In index.ts, replace bot.start() with:
app.use(webhookCallback(bot, "express"));
```

### AI Integration
Implement the `generateReply` function in `aiService.ts`:
```typescript
// Add OpenAI or Claude integration
import OpenAI from 'openai';
const openai = new OpenAI({ apiKey: env.AI_API_KEY });
```

### PostgreSQL
For production scale:
1. Install Prisma: `npm install prisma @prisma/client`
2. Migrate schema to Prisma format
3. Update `client.ts` to use Prisma

### Analytics
Consider adding:
- Daily active users tracking
- Command usage analytics
- Broadcast engagement metrics

## License

MIT
