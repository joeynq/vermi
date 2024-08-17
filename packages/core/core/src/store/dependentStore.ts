import type { Class } from "@vermi/utils";
import { createStore } from "../utils";

export const DependentMetadataKey: unique symbol = Symbol("Dependent");

export type DependentStoreAPI = {
	addDependents(...deps: Class<any>[]): void;
};

export const dependentStore = createStore<Class<any>[], DependentStoreAPI>(
	DependentMetadataKey,
	(_, get, set) => ({
		addDependents(...deps: Class<any>[]) {
			const store = get() || [];
			store.push(...deps);
			set(store);
		},
	}),
	() => [],
);
