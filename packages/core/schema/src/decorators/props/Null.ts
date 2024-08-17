import { type SchemaOptions, Type } from "@sinclair/typebox";
import { Prop } from "./Prop";

export function Null(options?: SchemaOptions & { nullable?: boolean }) {
	return Prop(() => Type.Null(), options);
}
