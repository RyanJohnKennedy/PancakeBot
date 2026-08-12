import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";
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

function formatLeaderboard(results: TotdResult[]): string {
    const nameWidth = Math.min(
        24,
        Math.max(...results.map((result) => result.playerName.length), "Player".length)
    );

    const rows = results.map((result) => {
        const name = result.playerName.replace(/`/g, "'").slice(0, nameWidth);
        const points = `${result.pointsAwarded} pts`;

        return `${`${result.rank}.`.padEnd(4)}${name.padEnd(nameWidth)}  ${formatTime(result.score).padStart(9)}  ${points.padStart(5)}`;
    });

    return [
        `#   ${"Player".padEnd(nameWidth)}  ${"Time".padStart(9)}  Pts`,
        ...rows,
    ].join("\n");
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
            const date = new Date(`${leaderboard.totdDate}T00:00:00Z`).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
                timeZone: "UTC",
            });
            const embed = new EmbedBuilder()
                .setColor(0xf5a623)
                .setTitle("Yesterday's Track of the Day")
                .setDescription(`**${title}**\n\n\`\`\`\n${formatLeaderboard(leaderboard.results)}\n\`\`\``)
                .setFooter({ text: date });

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error("Failed to fetch yesterday's TOTD results", error);
            await interaction.editReply("I couldn't retrieve yesterday's Track of the Day results. Please try again shortly.");
        }
    },
};
