import { Client } from "discord.js";
import { config } from "./config";
import { commands } from "./commands";
import { deployCommands } from "./deploy-commands";
import { GuildRateLimiter } from "./guild-rate-limiter";

const client = new Client({
    intents: ["Guilds", "GuildMessages", "DirectMessages"],
});

const guildRateLimiter = new GuildRateLimiter(
    config.GUILD_RATE_LIMIT_MAX_REQUESTS,
    config.GUILD_RATE_LIMIT_WINDOW_SECONDS * 1_000,
);

client.once("ready", async () => {
    console.log("Discord bot is ready! 🤖");

    for (const guild of client.guilds.cache.values()) {
        await deployCommands({ guildId: guild.id });
    }
});


client.on("guildCreate", async (guild) => {
    await deployCommands({ guildId: guild.id });
});

client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = commands[interaction.commandName as keyof typeof commands];
    if (!command) return;

    if (interaction.guildId) {
        const rateLimit = guildRateLimiter.take(interaction.guildId);
        if (!rateLimit.allowed) {
            const retryAfterSeconds = Math.max(1, Math.ceil(rateLimit.retryAfterMs / 1_000));
            await interaction.reply({
                content: `This server has reached its command limit. Please try again in ${retryAfterSeconds} seconds.`,
                ephemeral: true,
            });
            return;
        }
    }

    await command.execute(interaction);
});


client.login(config.DISCORD_TOKEN);
