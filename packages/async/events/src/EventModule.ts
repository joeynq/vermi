import {
	type AppContext,
	AppHook,
	Config,
	Configuration,
	Module,
	VermiModule,
	asValue,
	registerAdapter,
	registerHooks,
	registerProviders,
} from "@vermi/core";
import { EventEmitter } from "tseep";
import { EventEmitterKey } from "./consts";
import type { EventConfig } from "./interfaces";
import { AbstractConsumer, EventHandlerService } from "./services";

@Module({ deps: [EventHandlerService] })
export class EventModule<
	Adapter extends AbstractConsumer<any>,
> extends VermiModule<EventConfig<Adapter>> {
	@Config() public config!: EventConfig<Adapter>[];

	constructor(
		protected configuration: Configuration,
		protected eventHandlerService: EventHandlerService,
	) {
		super();
	}

	@AppHook("app:init")
	async init(ctx: AppContext) {
		const config = this.config;

		const defaultClient = new EventEmitter();
		ctx.register(EventEmitterKey, asValue(defaultClient));

		for (const item of config) {
			const { subscribers, group = "default", hooks, traceId } = item;

			const instance = await registerAdapter(ctx, item, (instance) =>
				instance.init({ ...item, group }),
			);

			registerProviders(...subscribers);
			registerHooks(ctx, ...subscribers);
			for (const subscriber of subscribers) {
				this.eventHandlerService.buildHandlers(
					{ group, traceId },
					instance,
					subscriber,
				);
			}

			await hooks?.init?.(ctx, item);
		}
	}

	@AppHook("app:exit")
	async destroy(ctx: AppContext) {
		const config = this.config;

		for (const item of config) {
			await item.hooks?.destroy?.(ctx, item);
		}
	}
}
