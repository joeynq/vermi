import {
	ContextService,
	type EnhancedContainer,
	Injectable,
	aliasTo,
	asValue,
} from "@vermi/core";
import { type Class, ensure, uuid } from "@vermi/utils";
import type { EventModuleConfig } from "../EventModule";
import type {
	ConsumerAdapter,
	EventHandler,
	EventType,
	_EventContext,
} from "../interfaces";
import { type EventStore, type HandlerMetadata, eventStore } from "../stores";

@Injectable("SINGLETON")
export class EventHandlerService {
	get context() {
		ensure(this.contextService.context);
		return this.contextService.context as EnhancedContainer<
			_EventContext<any, any>
		>;
	}

	constructor(private contextService: ContextService) {}

	#createEvent<Payload>(
		group: string,
		payload: Payload,
		traceId?: string,
	): EventType<Payload> {
		return {
			traceId: traceId ?? uuid(),
			group,
			payload,
			timestamp: Date.now(),
		};
	}

	#prepareContext<Payload>(group: string, payload: Payload, traceId?: string) {
		const context = this.context.createEnhancedScope();
		context.register({
			consumer: aliasTo(`events:consumer:${group}`),
			event: asValue(this.#createEvent(group, payload, traceId)),
			group: asValue(group),
		});
		return context;
	}

	#buildHandler(
		config: EventModuleConfig<any>,
		store: EventStore,
		metadata: HandlerMetadata,
	) {
		const { propertyKey, handlerId } = metadata;
		const handler: EventHandler = async (payload: any) => {
			if (!metadata.filter(payload)) {
				return;
			}
			return new Promise((resolve, reject) => {
				this.contextService.runInContext<_EventContext<any, any>, any>(
					this.#prepareContext(store.group, payload, config.traceId?.(payload)),
					async (ctx) => {
						await ctx.cradle.hooks.invoke("events:beforeHandle", [ctx], {
							when: (scope) => scope === handlerId,
						});
						try {
							const instance = ctx.resolve(store.target.name) as any;
							const result = await instance[propertyKey](ctx);
							await ctx.cradle.hooks.invoke(
								"events:afterHandle",
								[ctx, result],
								{
									when: (scope) => scope === handlerId,
								},
							);
							resolve(result);
						} catch (err) {
							await ctx.cradle.hooks.invoke("events:error", [ctx, err], {
								when: (scope) => scope === handlerId,
							});
							reject(err);
						}
					},
				);
			});
		};

		handler.name = metadata.handlerId;
		return handler;
	}

	buildHandlers(
		config: EventModuleConfig<any>,
		adapter: ConsumerAdapter<any>,
		subscriber: Class<any>,
	) {
		const group = "consumer" in config ? config.consumer.group : "default";
		const store = eventStore.apply(subscriber).get();
		for (const { handlerId, propertyKey, filter } of store.events) {
			const handler = this.#buildHandler(config, store, {
				handlerId,
				propertyKey,
				filter,
			});
			adapter.subscribe(group, handler);
		}
	}
}
