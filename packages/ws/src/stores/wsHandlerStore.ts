import type { TSchema } from "@sinclair/typebox";
import { createStore } from "@vermi/core";
import type { Class } from "@vermi/utils";

export const WsHandlerStoreKey = Symbol("WsHandlerStoreKey");

export interface WsHandlerStore {
	channel: `/${string}`;
	className: string;
	events: Map<string, WsHandler>;
	args: WsArg[];
}

export interface WsArg {
	parameterIndex: number;
	schema: TSchema;
	propertyKey: string | symbol;
	required?: boolean;
	pipes?: Class<any>[];
}

export interface WsHandler {
	event: string;
	propertyKey: string | symbol;
	handlerId: string;
}

export interface ArgOptions {
	required?: boolean;
	pipes?: Array<Class<any>>;
}

type WsHandlerStoreAPI = {
	addHandler(event: string, propertyKey: string | symbol): void;
	setChannel(channel: string): void;
	addArg(
		propertyKey: string | symbol,
		parameterIndex: number,
		schema: TSchema,
		options?: ArgOptions,
	): void;
};

export const wsHandlerStore = createStore<WsHandlerStore, WsHandlerStoreAPI>(
	WsHandlerStoreKey,
	(target, get, set) => ({
		addHandler(event, propertyKey) {
			const current = get();

			const events = new Map(current.events);

			events.set(event, {
				event,
				propertyKey,
				handlerId: `${target.name}.${String(propertyKey)}`,
			});
			set({ ...current, events });
		},
		addArg(
			propertyKey: string | symbol,
			parameterIndex: number,
			schema: TSchema,
			{ required, pipes }: ArgOptions = {},
		) {
			const current = get();

			const existing = current.args.find(
				(arg) =>
					arg.parameterIndex === parameterIndex &&
					arg.propertyKey === propertyKey,
			);

			if (!existing) {
				current.args.push({
					parameterIndex,
					schema,
					propertyKey,
					required,
					pipes,
				});
				set(current);
			}
		},
		setChannel(channel: `/${string}`) {
			const current = get();
			set({ ...current, channel, className: target.name });
		},
	}),
	() => ({
		channel: "/",
		className: "",
		events: new Map<string, WsHandler>(),
		args: [],
	}),
);

export interface WsMessageObject {
	propertyKey: string | symbol;
	handlerId: string;
	className: string;
	event: string;
	args: {
		parameterIndex: number;
		schema: TSchema;
		required?: boolean;
		name?: string | symbol;
	}[];
}

const globalEvents = new Map<`/${string}`, WsMessageObject[]>();

export const addWsEvents = (store: WsHandlerStore) => {
	const { channel, className, events, args } = store;
	const handlers = Array.from(events.values());

	const messages: WsMessageObject[] = handlers.map(
		({ event, propertyKey, handlerId }) => {
			return {
				propertyKey,
				handlerId,
				className,
				event,
				args: args
					.filter((arg) => arg.propertyKey === propertyKey)
					.map(({ parameterIndex, schema, required }) => ({
						parameterIndex,
						schema,
						required,
						propertyKey,
					})),
			};
		},
	);

	globalEvents.set(channel, messages);
};

export const getWsEvents = () => globalEvents;
