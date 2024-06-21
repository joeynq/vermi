export interface CacheAdapter<Data, Connection> {
	connection?: Connection;
	init?(): Promise<void>;
	get(key: string): Promise<Data | undefined>;
	set(key: string, value: Data, ttl?: number): Promise<void>;
	delete(key: string): Promise<void>;
	clear(): Promise<void>;
}
