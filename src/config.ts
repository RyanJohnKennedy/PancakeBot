import dotenv from "dotenv";

dotenv.config();

const { DISCORD_TOKEN, DISCORD_CLIENT_ID, API_BASE_URL, API_KEY } = process.env;

if (!DISCORD_TOKEN || !DISCORD_CLIENT_ID || !API_BASE_URL || !API_KEY) {
    throw new Error("Missing environment variables");
}

export const config = {
    DISCORD_TOKEN,
    DISCORD_CLIENT_ID,
    API_BASE_URL: API_BASE_URL.replace(/\/$/, ""),
    API_KEY,
    GUILD_RATE_LIMIT_MAX_REQUESTS: parsePositiveInteger(process.env.GUILD_RATE_LIMIT_MAX_REQUESTS, 5),
    GUILD_RATE_LIMIT_WINDOW_SECONDS: parsePositiveInteger(process.env.GUILD_RATE_LIMIT_WINDOW_SECONDS, 60),
};

function parsePositiveInteger(value: string | undefined, fallback: number): number {
    if (value === undefined) return fallback;

    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed <= 0) {
        throw new Error("Rate limit environment variables must be positive integers");
    }

    return parsed;
}
