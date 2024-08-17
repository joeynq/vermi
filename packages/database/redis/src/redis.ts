import type { ConfigureModule } from "@vermi/core";
import type { RedisOptions } from "ioredis";
import { RedisModule } from "./RedisModule";

export const redis = (
	options: RedisOptions,
	name = "default",
): ConfigureModule<RedisModule> => {
	return [RedisModule, [{ name, options }]];
};
