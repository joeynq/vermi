import { Injectable } from "@vermi/core";
import { EventEmitter } from "tseep";
import { AbstractConsumer } from "./AbstractConsumer";

@Injectable("SINGLETON")
export class TseepConsumer extends AbstractConsumer<EventEmitter> {
	client!: EventEmitter;

	subscribe<Payload>(event: string, handler: (payload: Payload) => void): void {
		this.client.on(event, handler);
	}
}
