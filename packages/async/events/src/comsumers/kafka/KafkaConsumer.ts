import { Injectable } from "@vermi/core";
import type { Consumer } from "kafkajs";
import type { EventHandler } from "../../interfaces";
import { AbstractConsumer } from "../../services";

@Injectable("SINGLETON")
export class KafkaConsumer extends AbstractConsumer<Consumer> {
	public client!: Consumer;

	async init() {
		return this.client.connect();
	}

	async destroy() {
		return this.client.disconnect();
	}

	subscribe(pattern: string, handler: EventHandler) {
		this.client.subscribe({ topic: pattern });
		this.client.run({
			eachMessage: async ({ message }) => {
				if (!message.value) return;
				const event = JSON.parse(message.value.toString());
				handler(event);
			},
		});
	}
}
