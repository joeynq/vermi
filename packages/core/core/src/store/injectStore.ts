import { createStore } from "../utils";

export const InjectMetadataKey: unique symbol = Symbol("Inject");

export type InjectStoreAPI = {
	addEventHandler(name: string): void;
};

export const injectStore = createStore<string[], InjectStoreAPI>(
	InjectMetadataKey,
	(target, get, set) => ({
		addEventHandler(name: string) {
			const store = get() || [];
			store.push(name);
			set(store);
		},
	}),
	() => [],
);
