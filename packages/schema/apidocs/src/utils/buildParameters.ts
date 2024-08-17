import { type TSchema, Type } from "@sinclair/typebox";
import type { Parameter } from "@vermi/router";
import type { ParameterObject } from "openapi3-ts/oas31";

export const buildParameters = (path: string, parameters: Parameter[]) => {
	const result: ParameterObject[] = [];

	for (const arg of parameters) {
		const inKey = arg.in;

		if (inKey === "path") {
			continue;
		}

		const params: ParameterObject[] = [];

		if (arg.schema.type === "object") {
			Object.entries(arg.schema.properties).map(([key, value]) => {
				const schema = value as TSchema;

				const param: ParameterObject = {
					name: key,
					in: inKey,
					required: arg.schema.required?.includes(key),
					schema: schema.$id ? Type.Ref(schema) : schema,
				};

				params.push(param);
			});
		} else {
			const param: ParameterObject = {
				name: arg.name || "",
				in: inKey,
				required: arg.required,
				schema: arg.schema,
			};

			params.push(param);
		}

		result.push(...params);
	}

	return result;
};

export const buildPathParams = (
	route: string,
	parameters: Parameter[],
): ParameterObject[] => {
	const pathParams = route.match(/{[^}]+}/g);

	if (!pathParams) {
		return [];
	}

	const result: ParameterObject[] = [];

	for (const param of pathParams) {
		const name = param.slice(1, -1);
		const parameter = parameters.find((p) => p.name === name);
		const schema =
			parameter?.schema ||
			Type.String({
				minLength: 1,
				maxLength: 255,
				pattern: "^[a-zA-Z0-9-_]+$",
			});

		const paramObject: ParameterObject = {
			name,
			in: "path",
			required: true,
			schema,
		};

		result.push(paramObject);
	}

	return result;
};
