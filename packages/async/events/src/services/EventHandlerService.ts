import {
	ContextService,
	type EnhancedContainer,
	Injectable,
	aliasTo,
	asValue,
} from "@vermi/core";
import { type Class, ensure, extendedCamelCase, uuid } from "@vermi/utils";
import type {
	ConsumerAdapter,
	ContextWithPayload,
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

	#prepareContext<Payload>(
		group: string,
		{ payload, ...rest }: ContextWithPayload<Payload>,
		traceId?: string,
	) {
		const context = this.context.createEnhancedScope();
		context.register({
			consumer: aliasTo(`events:consumer:${group}`),
			event: asValue(this.#createEvent(group, payload, traceId)),
			group: asValue(group),
			traceId: asValue(traceId),
		});
		for (const [key, value] of Object.entries(rest)) {
			context.register({ [key]: asValue(value) });
		}
		return context;
	}

	#buildHandler(
		config: { group: string; traceId?: (payload: any) => string },
		store: EventStore,
		metadata: HandlerMetadata,
	) {
		const { propertyKey, handlerId } = metadata;
		const handler: EventHandler = async (
			context: ContextWithPayload<EventType<any>>,
		) => {
			if (!metadata.filter(context.payload)) {
				return;
			}
			return new Promise((resolve, reject) => {
				this.contextService.runInContext<_EventContext<any, any>, any>(
					this.#prepareContext(
						store.group,
						context,
						config.traceId?.(context.payload),
					),
					async (ctx) => {
						try {
							await ctx.cradle.hooks.invoke("events:guard", [ctx.expose()], {
								when: (scope) => scope === handlerId,
							});

							await ctx.cradle.hooks.invoke(
								"events:beforeHandle",
								[ctx.expose()],
								{
									when: (scope) => scope === handlerId,
								},
							);

							ctx.register({ event: asValue(context.payload) });

							const instance = ctx.resolve(
								extendedCamelCase(store.target.name),
							) as any;
							const result = await instance[propertyKey](ctx.expose());
							await ctx.cradle.hooks.invoke(
								"events:afterHandle",
								[ctx.expose(), result],
								{
									when: (scope) => scope === handlerId,
								},
							);
							resolve(result);
						} catch (err) {
							await ctx.cradle.hooks.invoke(
								"events:error",
								[ctx.expose(), err],
								{
									when: (scope) => scope === handlerId,
								},
							);
							reject(err);
						}
					},
				);
			});
		};

		Object.defineProperty(handler, "name", { value: handlerId });

		return handler;
	}

	buildHandlers(
		config: { group: string; traceId?: (payload: any) => string },
		adapter: ConsumerAdapter<any>,
		subscriber: Class<any>,
	) {
		const store = eventStore.apply(subscriber).get();
		for (const { handlerId, propertyKey, filter } of store.events) {
			const handler = this.#buildHandler(config, store, {
				handlerId,
				propertyKey,
				filter,
			});
			adapter.subscribe(config.group, handler);
		}
	}
}
