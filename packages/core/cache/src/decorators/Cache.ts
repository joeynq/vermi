import { Inject } from "@vermi/core";
import type { CacheAdapter } from "../interfaces";

export const Cache = (
	name = "default",
	noPrefix = false,
): PropertyDecorator => {
	const prefix = noPrefix ? "" : "cache.";
	return Inject<CacheAdapter<any>>(`${prefix}${name}`);
};
