import type { AdapterMethods } from "@vermi/core";

export abstract class CacheAdapter<Connection>
	implements AdapterMethods<Connection>
{
	type = "cache" as const;
	provider!: Connection;
	init?: () => Promise<void>;

	abstract get<Data>(key: string): Promise<Data | undefined>;
	abstract set<Data>(key: string, value: Data, ttl?: number): Promise<void>;
	abstract delete(key: string): Promise<void>;
	abstract clear(): Promise<void>;
}
