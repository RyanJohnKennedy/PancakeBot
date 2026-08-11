import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { config } from "../config";

type TotdLeaderboardResponse = {
    mapName: string | null;
    totdDate: string;
    results: TotdResult[];
};

type TotdResult = {
    rank: number;
    playerName: string;
    score: number;
    pointsAwarded: number;
};

function formatTime(milliseconds: number): string {
    const minutes = Math.floor(milliseconds / 60_000);
    const seconds = Math.floor((milliseconds % 60_000) / 1_000);
    const remainingMilliseconds = milliseconds % 1_000;

    return `${minutes}:${seconds.toString().padStart(2, "0")}.${remainingMilliseconds
        .toString()
        .padStart(3, "0")}`;
}

export const totd = {
    data: new SlashCommandBuilder()
        .setName("totd")
        .setDescription("Shows yesterday's Track of the Day results."),

    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply();

        try {
            const response = await fetch(`${config.API_BASE_URL}/api/trackmania/totd`, {
                headers: { "X-API-KEY": config.API_KEY },
            });

            if (response.status === 404) {
                await interaction.editReply("Yesterday's Track of the Day results are not available yet.");
                return;
            }

            if (!response.ok) {
                throw new Error(`TOTD API request failed with status ${response.status}`);
            }

            const leaderboard = (await response.json()) as TotdLeaderboardResponse;
            if (leaderboard.results.length === 0) {
                await interaction.editReply(`No results were found for ${leaderboard.mapName ?? "yesterday's TOTD"}.`);
                return;
            }

            const title = leaderboard.mapName ?? "Track of the Day";
            const lines = leaderboard.results.map(
                (result) =>
                    `**${result.rank}.** ${result.playerName} — ${formatTime(result.score)} (${result.pointsAwarded} pts)`
            );

            await interaction.editReply(`**Yesterday's TOTD — ${title}**\n${lines.join("\n")}`);
        } catch (error) {
            console.error("Failed to fetch yesterday's TOTD results", error);
            await interaction.editReply("I couldn't retrieve yesterday's Track of the Day results. Please try again shortly.");
        }
    },
};
