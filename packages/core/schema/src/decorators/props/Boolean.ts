import { type SchemaOptions, Type } from "@sinclair/typebox";
import { Prop } from "./Prop";

export interface BooleanOptions extends SchemaOptions {
	nullable?: boolean;
}

export function Boolean(options?: BooleanOptions) {
	return Prop(() => Type.Boolean(), options);
}
