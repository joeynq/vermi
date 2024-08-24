import { Injectable } from "@vermi/core";
import { LRUCache } from "lru-cache";
import { CacheAdapter } from "../interfaces";

@Injectable("SINGLETON")
export class LruAdapter extends CacheAdapter<LRUCache<string, any>> {
	provider!: LRUCache<string, any>;

	async get(key: string) {
		return this.provider.get(key);
	}

	async set(key: string, value: any, ttl?: number) {
		this.provider.set(key, value, {
			ttl,
		});
	}

	async delete(key: string) {
		this.provider.delete(key);
	}

	async clear() {
		this.provider.clear();
	}
}
