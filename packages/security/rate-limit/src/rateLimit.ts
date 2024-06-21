import type { ConfigureModule } from "@vermi/core";
import {
	type AdapterMap,
	type RateLimitConfig,
	RateLimitModule,
} from "./RateLimitModule";

export const rateLimit = <N extends keyof AdapterMap>(
	adapter: N,
	options: RateLimitConfig<N>["options"],
): ConfigureModule<RateLimitModule<N>> => [
	RateLimitModule,
	{ adapter, options },
];
