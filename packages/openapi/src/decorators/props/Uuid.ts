import { type TString, Type } from "@sinclair/typebox";
import { Prop } from "./Prop";

export function Uuid(options?: TString & { nullable?: boolean }) {
	return Prop(() => Type.String({ format: "uuid" }), options);
}
