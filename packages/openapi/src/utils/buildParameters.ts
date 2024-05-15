import { type TSchema, Type } from "@sinclair/typebox";
import type { Parameter } from "@vermi/router";
import type { ParameterObject } from "openapi3-ts/oas31";

export const buildParameters = (parameters: Parameter[]) => {
	const result: ParameterObject[] = [];
	for (const arg of parameters) {
		const inKey = arg.in;
		const params: ParameterObject[] = Object.entries(arg.schema.properties).map(
			([key, value]) => {
				const schema = value as TSchema;

				const param: ParameterObject = {
					name: key,
					in: inKey,
					required: arg.schema.required?.includes(key),
					schema: schema.$id ? Type.Ref(schema) : schema,
				};

				return param;
			},
		);

		result.push(...params);
	}

	return result;
};
