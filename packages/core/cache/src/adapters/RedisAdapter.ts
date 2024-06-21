import { ensure, stringify } from "@vermi/utils";
import { Redis } from "ioredis";
import type { CacheAdapter } from "../interfaces";

export class RedisAdapter<Data = any> implements CacheAdapter<Data, Redis> {
	connection!: Redis;

	async get(key: string) {
		const value = await this.connection.get(key);
		return value ? JSON.parse(value) : null;
	}

	async set(key: string, value: any, ttl?: number) {
		const val = value ? stringify(value) : undefined;
		ensure(val, new Error("Value must be defined"));

		if (ttl) {
			await this.connection.set(key, val, "EX", ttl);
		}
		await this.connection.set(key, val);
	}

	async delete(key: string) {
		await this.connection.del(key);
	}

	async clear() {
		await this.connection.flushall();
	}
}
