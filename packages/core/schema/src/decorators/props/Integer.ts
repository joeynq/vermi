import { type IntegerOptions, Type } from "@sinclair/typebox";
import { limitSettings } from "../../settings";
import { Prop } from "./Prop";

export function Integer(options?: IntegerOptions & { nullable?: boolean }) {
	return Prop(() => Type.Integer({ format: "int32" }), {
		minimum: limitSettings.numberMinimum,
		maximum: limitSettings.numberMaximum,
		...options,
	});
}
