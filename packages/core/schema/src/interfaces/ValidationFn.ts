import type { TSchema } from "@sinclair/typebox";

export type ValidationFn = <Schema extends TSchema, T extends Readonly<any>>(
	schema: Schema,
	value: T,
) => Promise<void>;
