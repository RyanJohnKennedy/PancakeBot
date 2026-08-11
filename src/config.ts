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
};
