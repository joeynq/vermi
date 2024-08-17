import {
	type Class,
	type Dictionary,
	type EnumValues,
	type MaybePromiseFunction,
	isNil,
	tryRun,
} from "@vermi/utils";
import { Injectable } from "../decorators";
import type { AppContext, EventPayload, EventResult } from "../interfaces";
import type { ContextService } from "./Context";

type EventHandler<
	EventType extends { [key: string]: string },
	Event extends EnumValues<EventType>,
	EventMap extends Record<EnumValues<EventType>, MaybePromiseFunction>,
> = (
	...args: EventPayload<EventType, Event, EventMap>
) => EventResult<EventType, Event, EventMap>;

export interface EventObject<
	EventType extends { [key: string]: string },
	Event extends EnumValues<EventType>,
	EventMap extends Record<EnumValues<EventType>, MaybePromiseFunction>,
> {
	scope?: string;
	target?: Class<any>;
	handler: EventHandler<EventType, Event, EventMap>;
}

interface InvokeOptions {
	continueOnError?: boolean;
	breakOn?: "null" | "result" | (<T>(result: T) => boolean);
	when?: (scope: string) => boolean;
}

@Injectable("SINGLETON")
export class Hooks<
	EventType extends { [key: string]: string } = Dictionary<string>,
	EventMap extends Record<EnumValues<EventType>, MaybePromiseFunction> = Record<
		string,
		MaybePromiseFunction
	>,
> {
	#hooks: Map<
		string,
		EventObject<EventType, EnumValues<EventType>, EventMap>[]
	> = new Map();

	debug(event?: string) {
		type WithEvent = {
			event: string;
		} & EventObject<EventType, EnumValues<EventType>, EventMap>;
		const debug: WithEvent[] = [];

		this.#hooks.forEach((handlers, e) => {
			if (event && event !== e) {
				return;
			}
			debug.push(
				...handlers.map((handler) => ({
					...handler,
					event: e,
				})),
			);
		});
		return debug;
	}

	#context?: AppContext;

	constructor(protected contextService: ContextService) {
		this.#context = this.contextService.context?.expose();
	}

	#shouldBreak(
		err: Error | null,
		result: any,
		{ breakOn = "null", continueOnError }: InvokeOptions,
	) {
		if (!continueOnError && err) {
			throw err;
		}

		if (breakOn === "null" && result === null) {
			return true;
		}

		if (breakOn === "result" && !isNil(result)) {
			return true;
		}

		if (typeof breakOn === "function" && breakOn(result)) {
			return true;
		}

		return false;
	}

	register<Event extends EnumValues<EventType>>(
		event: Event,
		eventObject: EventObject<EventType, Event, EventMap>,
	) {
		let handlers = this.#hooks.get(event);
		if (handlers) {
			handlers.push(eventObject);
		} else {
			handlers = [eventObject];
		}
		this.#hooks.set(event, handlers);
	}

	async invoke<Event extends EnumValues<EventType>>(
		event: Event,
		args: EventPayload<EventType, Event, EventMap>,
		options: InvokeOptions = {},
	): Promise<EventResult<EventType, Event, EventMap> | undefined> {
		let handlers = this.#hooks.get(event);
		if (!handlers?.length) {
			return;
		}

		const { when, ...breakOpts } = options;

		if (when) {
			handlers = handlers.filter(
				(handler) => handler.scope && when(handler.scope),
			);
		} else {
			handlers = handlers.filter((handler) => !handler.scope);
		}

		let finalResult: any | undefined = undefined;
		for (const eventObject of handlers) {
			const [err, result] = await tryRun(async () => {
				const handler = eventObject.handler;

				if (eventObject.target && this.#context) {
					const instance = this.#context.resolve(eventObject.target);
					const methodName = handler.name.replace("bound ", "");
					return instance[methodName]?.(...args);
				}
				return handler(...args);
			});
			if (this.#shouldBreak(err, result, breakOpts)) {
				return result;
			}
			finalResult = result;
		}
		return finalResult;
	}
}
