import type { AppContext } from "@vermi/core";
import type { WithConsumerConfig } from "../EventModule";
import type { ConsumerAdapter, EventHandler } from "../interfaces";

export abstract class AbstractConsumer<Client>
	implements ConsumerAdapter<Client>
{
	abstract client: Client;

	async init(
		context: AppContext,
		{ client, group }: WithConsumerConfig<Client>["consumer"],
	): Promise<void> {}
	async destroy(): Promise<void> {}

	abstract subscribe(event: string, handler: EventHandler): void;
}
