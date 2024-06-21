import { type ObjectOptions, Type } from "@sinclair/typebox";
import { type Class, pascalCase } from "@vermi/utils";
import { modelStore, propsStore, saveSchemas } from "../stores";

export const SchemaKey = Symbol("Schema");

export interface ModelOptions {
	name?: string;
	abstract?: boolean;
}

export const Model = <T>(
	schemaOptions?: ObjectOptions,
	options?: ModelOptions,
) => {
	return (target: Class<T>) => {
		const props = propsStore.apply(target).get();
		const schema = Type.Object(props, {
			additionalProperties: false,
			...schemaOptions,
			$id: `#/components/schemas/${pascalCase(options?.name || target.name)}`,
		});

		const store = modelStore.apply(target);
		store.addSchema(schema);

		if (!options?.abstract) {
			saveSchemas(store.get());
		}

		Object.defineProperty(target, SchemaKey, {
			value: schema,
		});
		return target;
	};
};
