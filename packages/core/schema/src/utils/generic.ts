import type { ArrayOptions, TSchema } from "@sinclair/typebox";
import type { Class } from "@vermi/utils";
import { SchemaKey } from "../decorators";
import { saveSchemas } from "../stores";

export type GenericBuilder = <T extends TSchema>(
	T: T,
	name: string,
	arrayOptions?: ArrayOptions,
) => TSchema;

export const generic = (model: Class<any>, arrayOptions?: ArrayOptions) => {
	const genericBuilder = Reflect.getMetadata(
		"generic:builder",
		model,
	) as GenericBuilder;
	return {
		of(type: Class<any>) {
			const T = (type as any)[SchemaKey] as TSchema;

			const typeName = T.$id?.split("/").pop();

			const name = `${model.name}Of${typeName || type.name}`;
			const schema = genericBuilder(T, name, arrayOptions);

			saveSchemas([schema, T]);

			return schema;
		},
	};
};
