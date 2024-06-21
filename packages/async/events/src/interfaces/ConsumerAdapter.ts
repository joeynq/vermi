import type { AppContext } from "@vermi/core";
import type { WithConsumerConfig } from "../EventModule";
import type { EventHandler } from "./EventHandler";

export interface ConsumerAdapter<Client> {
	client: Client;
	init(
		context: AppContext,
		{ client, group }: WithConsumerConfig<Client>["consumer"],
	): Promise<void>;
	destroy(): Promise<void>;
	subscribe(event: string, handler: EventHandler): void;
}
