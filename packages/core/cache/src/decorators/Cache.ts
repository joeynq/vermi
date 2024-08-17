import { Inject } from "@vermi/core";
import type { CacheAdapter } from "../interfaces";

export const Cache = (name = "default"): PropertyDecorator => {
	return Inject<CacheAdapter<any, any>>(`cache.${name}`);
};
