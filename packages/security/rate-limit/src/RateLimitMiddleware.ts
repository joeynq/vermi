import { Middleware, type RequestContext, asValue } from "@vermi/core";
import { AfterRoute, BeforeRoute } from "@vermi/router";

interface RateLimitOptions {
	keyPrefix: string;
	points: number;
	duration: number;
	blockDuration: number;
}

@Middleware()
export class RateLimitMiddleware {
	private options: RateLimitOptions;

	constructor(options?: Partial<RateLimitOptions>) {
		this.options = {
			keyPrefix: options?.keyPrefix ?? "rlflx",
			points: options?.points ?? 4,
			duration: options?.duration ?? 1,
			blockDuration: options?.blockDuration ?? 0,
		};
	}

	@BeforeRoute()
	public async rateLimit(ctx: RequestContext) {
		const limit = await ctx.store.rateLimitHandler(ctx);

		ctx.register({ rateLimit: asValue(limit) });
	}

	@AfterRoute()
	public async rateLimitAfter(ctx: RequestContext, response: Response) {
		const limit = ctx.store.rateLimit;

		response.headers.set("Retry-After", (limit.msBeforeNext / 1000).toString());
		response.headers.set("X-RateLimit-Limit", this.options.points.toString());
		response.headers.set(
			"X-RateLimit-Remaining",
			limit.remainingPoints.toString(),
		);
		response.headers.set(
			"X-RateLimit-Reset",
			(new Date(Date.now() + limit.msBeforeNext).getTime() / 1000).toString(),
		);
	}
}
