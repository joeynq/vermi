import { type NumberOptions, Type } from "@sinclair/typebox";
import { limitSettings } from "../../settings";
import { Prop } from "./Prop";

export function Number(options?: NumberOptions & { nullable?: boolean }) {
	return Prop(() => Type.Number(), {
		minimum: limitSettings.numberMinimum,
		maximum: limitSettings.numberMaximum,
		...options,
	});
}
