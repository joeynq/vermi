import type { TSchema } from "@sinclair/typebox";
import { createStore } from "@vermi/core";

export const PropsStoreKey = Symbol("PropsStore");

export type PropsStoreDto = {
	[key: string]: TSchema;
};

export type PropsStoreAPI = {
	addProperty: (key: string, schema: TSchema) => void;
};

export const propsStore = createStore<PropsStoreDto, PropsStoreAPI>(
	PropsStoreKey,
	(_, get, set) => ({
		addProperty: (key, schema) => {
			const metadata = get() || {};
			metadata[key] = schema;
			set(metadata);
		},
	}),
	() => ({}),
);
