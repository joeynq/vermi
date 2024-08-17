import { type Dictionary } from "@vermi/utils";
import type { EventObject } from "../services";
import { createStore } from "../utils";

export const HookMetadataKey: unique symbol = Symbol("Hook");

export type HandlerMetadata = EventObject<
	Dictionary<any>,
	`${any}`,
	Dictionary<any>
>;

export type HookStoreAPI = {
	addHandler(event: string, value: Omit<HandlerMetadata, "propertyKey">): void;
	scoped(
		value: string | ((metadata: HandlerMetadata) => string | undefined),
	): void;
};

export const hookStore = createStore<
	Map<string, HandlerMetadata[]>,
	HookStoreAPI
>(
	HookMetadataKey,
	(target, get, set) => ({
		addHandler: (event, value: Omit<HandlerMetadata, "propertyKey">) => {
			const store = get();
			const handlers = store.get(event) || [];

			handlers.push({
				target: value.target || target,
				handler: value.handler,
				scope: value.scope,
			});

			store.set(event, handlers);

			set(store);
		},
		scoped: (
			value: string | ((metadata: HandlerMetadata) => string | undefined),
		) => {
			const current = get();

			for (const handlers of current.values()) {
				for (const handler of handlers) {
					const scope = typeof value === "function" ? value(handler) : value;
					if (scope) {
						handler.scope = scope;
					}
				}
			}

			set(current);
		},
	}),
	() => new Map(),
);
