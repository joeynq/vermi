import {
	type AppContext,
	AppHook,
	Config,
	HttpException,
	Module,
	type RequestContext,
	VermiModule,
	asValue,
} from "@vermi/core";
import { TooManyRequests } from "@vermi/router";
import { type Class, tryRun } from "@vermi/utils";
import {
	type RateLimiterAbstract,
	RateLimiterDynamo,
	RateLimiterMemcache,
	RateLimiterMemory,
	RateLimiterMongo,
	RateLimiterMySQL,
	RateLimiterPostgres,
	RateLimiterPrisma,
	RateLimiterRedis,
	type RateLimiterRes,
} from "rate-limiter-flexible";

const adapterMap = {
	redis: RateLimiterRedis,
	memory: RateLimiterMemory,
	dynamo: RateLimiterDynamo,
	memcache: RateLimiterMemcache,
	postgres: RateLimiterPostgres,
	mongo: RateLimiterMongo,
	mysql: RateLimiterMySQL,
	prisma: RateLimiterPrisma,
} as const;

export type AdapterMap = {
	[key in keyof typeof adapterMap]: RateLimiterAbstract;
};

export type RateLimitConfig<N extends keyof AdapterMap> = {
	adapter: N;
	options: ConstructorParameters<Class<AdapterMap[N]>>[0];
};

declare module "@vermi/core" {
	interface _RequestContext {
		rateLimit: RateLimiterRes;
	}

	interface _AppContext {
		rateLimitHandler: (context: RequestContext) => Promise<RateLimiterRes>;
	}
}

@Module()
export class RateLimitModule<N extends keyof AdapterMap> extends VermiModule<
	RateLimitConfig<N>
> {
	#rateLimiter: RateLimiterAbstract;

	@Config() public config!: RateLimitConfig<N>;

	constructor() {
		super();
		const { adapter, options } = this.config;
		this.#rateLimiter = new adapterMap[adapter](options);
	}

	async #handle(context: RequestContext) {
		const [error, result] = await tryRun(() => {
			const ip = context.store.userIp;

			if (!ip) {
				throw new Error("IP address not found");
			}

			return this.#rateLimiter.consume(ip.address, 1);
		});

		if (error) {
			if (error instanceof HttpException) {
				throw error;
			}
			throw new TooManyRequests("Rate limit exceeded", error);
		}

		return result;
	}

	@AppHook("app:init")
	async rateLimitInit(context: AppContext) {
		context.register({
			rateLimitHandler: asValue(this.#handle.bind(this)),
		});
	}

	@AppHook("app:request")
	async rateLimitHook(ctx: RequestContext) {
		const limit = await this.#handle(ctx);
		ctx.register({ rateLimit: asValue(limit) });
	}

	@AppHook("app:response")
	async corsHook(context: RequestContext, response: Response) {
		const limit = context.resolve<RateLimiterRes>("rateLimit");

		response.headers.set("Retry-After", (limit.msBeforeNext / 1000).toString());
		response.headers.set(
			"X-RateLimit-Limit",
			this.config.options.points.toString(),
		);
		response.headers.set(
			"X-RateLimit-Remaining",
			limit.remainingPoints.toString(),
		);
		response.headers.set(
			"X-RateLimit-Reset",
			new Date(Date.now() + limit.msBeforeNext).toISOString(),
		);

		return response;
	}
}
