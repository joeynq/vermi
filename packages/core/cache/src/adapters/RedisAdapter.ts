import { Injectable } from "@vermi/core";
import { ensure, stringify } from "@vermi/utils";
import { Redis } from "ioredis";
import { CacheAdapter } from "../interfaces";

@Injectable("SINGLETON")
export class RedisAdapter extends CacheAdapter<Redis> {
	async get(key: string) {
		const value = await this.provider.get(key);
		return value ? JSON.parse(value) : null;
	}

	async set(key: string, value: any, ttl?: number) {
		const val = value ? stringify(value) : undefined;
		ensure(val, new Error("Value must be defined"));

		if (ttl) {
			await this.provider.set(key, val, "EX", ttl);
		}
		await this.provider.set(key, val);
	}

	async delete(key: string) {
		await this.provider.del(key);
	}

	async clear() {
		await this.provider.flushall();
	}
}
