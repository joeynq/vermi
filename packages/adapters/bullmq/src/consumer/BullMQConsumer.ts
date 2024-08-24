import { Injectable } from "@vermi/core";
import {
	AbstractConsumer,
	type EventHandler,
	type EventInitOptions,
} from "@vermi/events";
import { ensure } from "@vermi/utils";
import { Worker } from "bullmq";
import type { Redis } from "ioredis";

@Injectable("SINGLETON")
export class BullMQConsumer extends AbstractConsumer<Redis> {
	public events: Map<string, Function> = new Map();
	#worker!: Worker;

	async init({ group }: EventInitOptions<any>) {
		ensure(group, "group is required");
		this.provider.options.maxRetriesPerRequest = null;
		if (
			this.provider.status !== "connect" &&
			this.provider.status !== "ready" &&
			this.provider.status !== "connecting"
		) {
			await this.provider.connect();
		}

		this.#worker = new Worker(
			group,
			async (job) => {
				const handler = this.events.get(job.name);
				if (handler) {
					handler(job.data);
				}
			},
			{ connection: this.provider },
		);
	}

	async destroy() {
		await this.#worker.close();
	}

	subscribe(pattern: string, handler: EventHandler) {
		this.events.set(pattern, handler);
	}
}
