import type { StringOptions } from "@sinclair/typebox";
import { limitSettings } from "../../settings";
import { String } from "./String";

export function File(options?: StringOptions & { nullable?: boolean }) {
	return String({
		...options,
		format: "binary",
		maxLength: limitSettings.maxFileLength,
		minLength: 1,
	});
}

export { File as Binary };
