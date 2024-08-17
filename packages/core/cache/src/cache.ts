import type { ConfigureModule } from "@vermi/core";
import type { Class } from "@vermi/utils";
import { CacheModule, type CacheModuleOptions } from "./CacheModule";
import type { CacheAdapter } from "./interfaces";

export const cache = <
	Connection,
	Adapter extends Class<CacheAdapter<any, any>>,
>(
	adapter: Adapter,
	options?: Omit<CacheModuleOptions<Connection, Adapter>, "adapter"> & {
		name?: string;
	},
): ConfigureModule<CacheModule<Connection, Adapter>> => {
	const { name = "default", connection } = options || {};
	return [
		CacheModule,
		[
			{
				name,
				adapter,
				connection,
				...options,
			},
		],
	];
};
