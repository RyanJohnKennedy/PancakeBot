# PancakeBot Discord Bot

## Run locally

### Prerequisites

- Node.js 18 or later
- A Discord application with a bot user
- The PancakeBot API running locally (required for `/totd` and `/totd-month`)

In the [Discord Developer Portal](https://discord.com/developers/applications), create or select an application, add a bot user, and invite it to your test server with the `bot` and `applications.commands` scopes. Copy the bot token and application ID from the portal.

### Configure environment variables

Install dependencies and copy the example configuration:

```bash
npm install
cp .env.example .env
```

Edit `.env` with your Discord credentials. For the API running with its default local launch profile, use:

```dotenv
DISCORD_TOKEN=your-discord-bot-token
DISCORD_CLIENT_ID=your-discord-application-id
API_BASE_URL=http://localhost:5053
API_KEY=the-same-key-configured-in-the-api
```

`API_KEY` must match the backend's `ApiKey:Key` setting. For local development, you can set it in the API project with:

```bash
dotnet user-secrets set "ApiKey:Key" "your-local-api-key"
```

### Start the API

From the API repository:

```bash
dotnet run
```

The default local API address is `http://localhost:5053`.

### Start the bot

From this repository:

```bash
npm run dev
```

When the bot comes online, it registers its slash commands in every server it belongs to. Run `/totd` to display yesterday's Track of the Day leaderboard, or `/totd-month` to display the current month's cumulative points leaderboard.

## Production-style local run

Build and run the compiled bot instead of the file watcher:

```bash
npm run build
npm start
```

## Troubleshooting

- **The bot exits with `Missing environment variables`:** confirm all four values in `.env` are present.
- **`/totd` cannot retrieve results:** make sure the API is running, `API_BASE_URL` is correct, and `API_KEY` matches the API configuration.
- **`/totd` is not listed:** ensure the bot was invited with the `applications.commands` scope, then restart it while it is a member of the server.
