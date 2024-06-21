import { type AppContext, Injectable } from "@vermi/core";
import { Worker } from "bullmq";
import type { Redis } from "ioredis";
import type { WithConsumerConfig } from "../../EventModule";
import type { EventHandler } from "../../interfaces";
import { AbstractConsumer } from "../../services";

@Injectable("SINGLETON")
export class BullMQConsumer extends AbstractConsumer<Redis> {
	public client!: Redis;
	public events: Map<string, Function> = new Map();
	#worker!: Worker;

	async init(
		context: AppContext,
		{ client, group }: WithConsumerConfig<Redis>["consumer"],
	) {
		this.client = typeof client === "function" ? client(context) : client;
		if (this.client.status !== "connect") {
			await this.client.connect();
		}
		this.#worker = new Worker(
			group,
			async (job) => {
				const handler = this.events.get(job.name);
				if (handler) {
					handler(job.data);
				}
			},
			{ connection: this.client },
		);
	}

	async destroy() {
		await this.#worker.close();
	}

	subscribe(pattern: string, handler: EventHandler) {
		this.events.set(pattern, handler);
	}
}
