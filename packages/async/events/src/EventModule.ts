import {
	type AppContext,
	AppHook,
	Config,
	Configuration,
	Module,
	VermiModule,
	asClass,
	asValue,
	registerHooks,
	registerProviders,
} from "@vermi/core";
import type { Class } from "@vermi/utils";
import { EventEmitter } from "tseep";
import type { ConsumerAdapter } from "./interfaces";
import { EventHandlerService, TseepConsumer } from "./services";

export interface DefaultEventModuleConfig {
	traceId?: <Payload>(payload: Payload) => string;
	subscribers: Class<any>[];
}

export interface WithConsumerConfig<Client> extends DefaultEventModuleConfig {
	consumer: {
		group: string;
		adapter: Class<ConsumerAdapter<Client>>;
		client: Client | ((ctx: AppContext) => Client);
	};
}

export type EventModuleConfig<Client> =
	| WithConsumerConfig<Client>
	| DefaultEventModuleConfig;

@Module({ deps: [EventHandlerService] })
export class EventModule extends VermiModule<EventModuleConfig<any>[]> {
	@Config() public config!: EventModuleConfig<any>[];

	constructor(
		protected configuration: Configuration,
		protected eventHandler: EventHandlerService,
	) {
		super();
	}

	@AppHook("app:init")
	async init(ctx: AppContext) {
		const config = this.config;

		const defaultClient = new EventEmitter();
		ctx.register("events:emitter", asValue(defaultClient));

		for (const item of config) {
			const { subscribers } = item;
			const adapterClass =
				"consumer" in item ? item.consumer.adapter : TseepConsumer;
			const group = "consumer" in item ? item.consumer.group : "default";

			const resolver = asClass(adapterClass).disposer((instance) =>
				instance.destroy(),
			);
			const adapter = ctx.build(resolver);
			"consumer" in item && (await adapter.init(ctx, item.consumer));

			ctx.register(`events:consumer:${group}`, asValue(adapter));

			registerProviders(...subscribers);
			registerHooks(ctx, ...subscribers);
			for (const subscriber of subscribers) {
				this.eventHandler.buildHandlers(item, adapter, subscriber);
			}
		}
	}
}
