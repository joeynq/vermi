import { type TString, Type } from "@sinclair/typebox";
import { Prop } from "./Prop";

export function RelativeJsonPointer(
	options?: TString & { nullable?: boolean },
) {
	return Prop(() => Type.String({ format: "relative-json-pointer" }), options);
}