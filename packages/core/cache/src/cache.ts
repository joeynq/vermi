import {
	type AdapterConfig,
	CommonModule,
	type ModuleConfig,
	type WithAdapter,
	withAdapter,
} from "@vermi/core";
import { LRUCache } from "lru-cache";
import { LruAdapter } from "./adapters/LruAdapter";
import type { CacheAdapter } from "./interfaces";

export interface CacheOptions<Adapter extends CacheAdapter<any>>
	extends Omit<AdapterConfig<Adapter>, "adapter"> {
	adapter?: Omit<WithAdapter<Adapter>["adapter"], "name">;
	clearOnStart?: boolean;
	ttl?: number;
}

interface CacheModuleConfig<Adapter extends CacheAdapter<any>>
	extends AdapterConfig<Adapter> {
	clearOnStart?: boolean;
}

export function cache<Adapter extends CacheAdapter<any> = CacheAdapter<any>>(
	options: CacheOptions<Adapter> = {},
): ModuleConfig<CommonModule<any>> {
	const { clearOnStart = false, adapter, ttl = 6000, ...rest } = options;

	return withAdapter<CacheModuleConfig<Adapter>, Adapter>({
		adapter: {
			class: LruAdapter as any,
			...options.adapter,
			name: "cache",
			provider:
				adapter?.provider ||
				new LRUCache({ ttl } as LRUCache.Options<any, any, any>),
			onInit: async (instance) => {
				await instance.init?.();
				if (clearOnStart) {
					await instance.clear();
				}
			},
		},
		clearOnStart: clearOnStart,
		...rest,
		hooks: rest.hooks as CacheModuleConfig<Adapter>["hooks"],
	});
}
