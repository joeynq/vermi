import { Injectable } from "@vermi/core";
import { LRUCache } from "lru-cache";
import type { CacheAdapter } from "../interfaces";

@Injectable("SINGLETON")
export class LruAdapter<Data = any>
	implements CacheAdapter<Data, LRUCache.Options<string, any, unknown>>
{
	connection!: LRUCache<string, any>;

	async get(key: string) {
		return this.connection.get(key);
	}

	async set(key: string, value: any, ttl?: number) {
		this.connection.set(key, value, {
			ttl,
		});
	}

	async delete(key: string) {
		this.connection.delete(key);
	}

	async clear() {
		this.connection.clear();
	}
}
