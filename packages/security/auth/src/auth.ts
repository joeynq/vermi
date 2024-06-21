import type { ConfigureModule } from "@vermi/core";
import type { Class } from "@vermi/utils";
import { AuthModule } from "./AuthModule";
import type { Strategy, StrategyOptions } from "./strategies";

export interface AuthOptions<O> extends Omit<StrategyOptions<O>, "cache"> {
	cache?: string;
}

export const auth = <
	O,
	S extends Class<Strategy<O>>,
	A extends S["prototype"]["config"],
>(
	strategy: S,
	{ cache, ...config }: AuthOptions<A["options"]>,
	name?: string,
): ConfigureModule<AuthModule<O, S>> => {
	return [
		AuthModule,
		[
			{
				strategy,
				config,
				name: name || strategy.name,
				cache,
			},
		],
	];
};
