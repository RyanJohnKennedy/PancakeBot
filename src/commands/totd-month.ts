import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { config } from "../config";

type TotdMonthLeaderboardResponse = {
    month: string;
    results: TotdMonthResult[];
};

type TotdMonthResult = {
    rank: number;
    playerName: string;
    pointsAwarded: number;
    firstPlaceCount: number;
    secondPlaceCount: number;
    thirdPlaceCount: number;
};

function formatMedals(result: TotdMonthResult): string {
    return [
        { emoji: "🥇", count: result.firstPlaceCount },
        { emoji: "🥈", count: result.secondPlaceCount },
        { emoji: "🥉", count: result.thirdPlaceCount },
    ]
        .filter(({ count }) => count > 0)
        .map(({ emoji, count }) => `${emoji}x${count}`)
        .join(" ");
}

function formatLeaderboard(results: TotdMonthResult[]): string {
    const nameWidth = Math.min(
        18,
        Math.max(...results.map((result) => result.playerName.length), "Player".length)
    );
    const pointsWidth = Math.max(...results.map((result) => result.pointsAwarded.toString().length), "Pts".length);
    const rows = results.map((result) => {
        const name = result.playerName.replace(/`/g, "'").slice(0, nameWidth);
        const points = result.pointsAwarded.toString();

        return `${`${result.rank}.`.padEnd(3)}${name.padEnd(nameWidth)}  ${points.padStart(pointsWidth)} pts  ${formatMedals(result) || "—"}`;
    });

    return [
        `${"#".padEnd(3)}${"Player".padEnd(nameWidth)}  ${"Pts".padStart(pointsWidth + 4)}  Podiums`,
        ...rows,
    ].join("\n");
}

export const totdMonth = {
    data: new SlashCommandBuilder()
        .setName("totd-month")
        .setDescription("Shows this month's Track of the Day points leaderboard."),

    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply();

        try {
            const response = await fetch(`${config.API_BASE_URL}/api/trackmania/totd-month/leaderboard`, {
                headers: { "X-API-KEY": config.API_KEY },
            });

            if (!response.ok) {
                throw new Error(`Monthly TOTD API request failed with status ${response.status}`);
            }

            const leaderboard = (await response.json()) as TotdMonthLeaderboardResponse;
            const date = new Date(`${leaderboard.month}T00:00:00Z`);
            const month = date.toLocaleDateString("en-GB", {
                month: "long",
                year: "numeric",
                timeZone: "UTC",
            });

            if (leaderboard.results.length === 0) {
                await interaction.editReply(`No Track of the Day results have been saved for ${month} yet.`);
                return;
            }

            const embed = new EmbedBuilder()
                .setColor(0xf5a623)
                .setTitle(`Track of the Day — ${month}`)
                .setDescription(`\`\`\`\n${formatLeaderboard(leaderboard.results)}\n\`\`\``);

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error("Failed to fetch monthly TOTD results", error);
            await interaction.editReply("I couldn't retrieve this month's Track of the Day leaderboard. Please try again shortly.");
        }
    },
};
