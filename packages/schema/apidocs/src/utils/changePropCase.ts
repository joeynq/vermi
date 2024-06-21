import { type TSchema, TypeGuard } from "@sinclair/typebox";

export const changePropCase = (
	schema: TSchema,
	caseFn: (str: string) => string,
): TSchema => {
	// if schema is object loop through each key and change the case
	if (TypeGuard.IsObject(schema)) {
		const properties = Object.entries(schema.properties || {}).reduce(
			(acc, [key, value]) => {
				// @ts-expect-error
				acc[caseFn(key)] = changePropCase(value, caseFn);
				return acc;
			},
			{},
		);

		const required = schema.required?.map((key) => caseFn(key));

		return {
			...schema,
			properties,
			required,
		};
	}

	// if schema is array loop through each item and change the case
	if (TypeGuard.IsArray(schema)) {
		return {
			...schema,
			items: changePropCase(schema.items, caseFn),
		};
	}

	return schema;
};
