import { type TSchema } from "@sinclair/typebox";
import { createStore } from "@vermi/core";

export const ModelStoreKey = Symbol("ModelStore");

export type ModelStoreAPI = {
	addSchema: (schema: TSchema) => void;
	getSchema: (name: string) => TSchema | undefined;
};

export const modelStore = createStore<TSchema[], ModelStoreAPI>(
	ModelStoreKey,
	(_, get, set) => ({
		addSchema: (schema) => {
			const current = get() || [];
			if (current.find((s) => s.$id === schema.$id)) return;
			set([...current, schema]);
		},
		getSchema: (name) =>
			get()?.find((s) => s.$id === `#/components/schemas/${name}`),
	}),
	() => [],
);

const schemaStore: TSchema[] = [];

export const saveSchemas = (schemas: TSchema[]) => {
	for (const schema of schemas) {
		if (schemaStore.find((s) => s.$id === schema.$id)) continue;
		schemaStore.push(schema);
	}
};

export const getSchemas = () => schemaStore;
