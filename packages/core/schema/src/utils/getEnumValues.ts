import { type SchemaOptions, type TEnumKey, Type } from "@sinclair/typebox";

type KeyTypeName = "number" | "string";

type KeyType<T extends KeyTypeName> = T extends "number" ? number : string;

export const getEnumValues = <
	N extends KeyTypeName,
	V extends KeyType<N>,
	K extends TEnumKey,
	T extends Record<K, V>,
>(
	type: N,
	value: T,
	options?: SchemaOptions & { nullable?: boolean },
) => {
	const values: V[] = [];
	for (const n in value) {
		if (type === "number" && typeof value[n] === "number")
			values.push(value[n]);
		if (type === "string" && typeof value[n] === "string")
			values.push(value[n]);
	}

	const returns = type === "number" ? Type.Number : Type.String;

	return returns({
		enum: values,
		...options,
	});
};
