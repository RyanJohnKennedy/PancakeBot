import { Client } from "discord.js";
import { config } from "./config";
import { commands } from "./commands";
import { deployCommands } from "./deploy-commands";

const client = new Client({
    intents: ["Guilds", "GuildMessages", "DirectMessages"],
});

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

    await command.execute(interaction);
});


client.login(config.DISCORD_TOKEN);