type RateLimitResult =
    | { allowed: true }
    | { allowed: false; retryAfterMs: number };

/** Limits commands from a Discord server within a rolling time window. */
export class GuildRateLimiter {
    private readonly requestsByGuild = new Map<string, number[]>();

    constructor(
        private readonly maxRequests: number,
        private readonly windowMs: number,
    ) {}

    take(guildId: string, now = Date.now()): RateLimitResult {
        const windowStart = now - this.windowMs;
        const recentRequests = (this.requestsByGuild.get(guildId) ?? [])
            .filter((requestTime) => requestTime > windowStart);

        if (recentRequests.length >= this.maxRequests) {
            this.requestsByGuild.set(guildId, recentRequests);
            return {
                allowed: false,
                retryAfterMs: recentRequests[0] + this.windowMs - now,
            };
        }

        recentRequests.push(now);
        this.requestsByGuild.set(guildId, recentRequests);
        return { allowed: true };
    }
}
