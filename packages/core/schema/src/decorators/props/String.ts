import { type StringOptions, Type } from "@sinclair/typebox";
import { limitSettings } from "../../settings";
import { Prop } from "./Prop";

export function String(options?: StringOptions & { nullable?: boolean }) {
	return Prop(() => Type.String(), {
		maxLength: limitSettings.stringMaxLength,
		minLength: options?.nullable ? 0 : 1,
		...options,
	});
}
