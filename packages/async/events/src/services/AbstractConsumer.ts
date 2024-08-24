import type {
	ConsumerAdapter,
	EventHandler,
	EventInitOptions,
} from "../interfaces";

export abstract class AbstractConsumer<Client>
	implements ConsumerAdapter<Client>
{
	readonly type = "consumer" as const;
	provider!: Client;

	async init(config: EventInitOptions<this>): Promise<void> {}

	abstract subscribe(event: string, handler: EventHandler): void;
}
