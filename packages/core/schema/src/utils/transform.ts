import type { TSchema } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";

export const transform = <T>(schema: TSchema, value: any): T => {
	return Value.Convert(schema, value) as T;
};
