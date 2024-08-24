import type { TSchema } from "@sinclair/typebox";
import { createStore } from "@vermi/core";
import type { Class } from "@vermi/utils";

export const EventStoreKey = Symbol("EventStoreKey");

export type EventFilter<Payload = any> = (event: Payload) => boolean;

export interface HandlerMetadata {
	filter: EventFilter;
	propertyKey: string | symbol;
	handlerId: string;
}

export interface EventArg {
	parameterIndex: number;
	schema: TSchema;
	handlerId: string;
	required?: boolean;
	pipes?: Class<any>[];
}

export interface EventStore {
	target: Class<any>;
	group: string;
	events: HandlerMetadata[];
	args: EventArg[];
}

export type EventStoreAPI = {
	addHandler(filter: EventFilter | string, propertyKey: string | symbol): void;
	addArg(
		propertyKey: string | symbol,
		parameterIndex: number,
		schema: TSchema,
		options?: { required?: boolean; pipes?: Array<Class<any>> },
	): void;
	setGroup(group: string): void;
};

export const eventStore = createStore<EventStore, EventStoreAPI>(
	EventStoreKey,
	(target, get, set) => ({
		setGroup(group: string) {
			const current = get();
			set({ ...current, group, target });
		},
		addHandler(filter: EventFilter | string, propertyKey) {
			const current = get();

			const existing = current.events.find(
				(event) => event.propertyKey === propertyKey,
			);
			if (existing) {
				return;
			}

			const eventFilter =
				typeof filter === "string"
					? (event: any) => event.type === filter
					: filter;

			current.events.push({
				filter: eventFilter,
				propertyKey,
				handlerId: `${target.name}.${String(propertyKey)}`,
			});

			set(current);
		},
		addArg(propertyKey, parameterIndex, schema, options) {
			const current = get();

			const args = current.args.slice();
			args.push({
				parameterIndex,
				schema,
				handlerId: `${target.name}.${String(propertyKey)}`,
				...options,
			});

			set({ ...current, args });
		},
	}),
	() => ({
		target: class {},
		group: "default",
		events: [],
		args: [],
	}),
);
