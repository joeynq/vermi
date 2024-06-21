import type { StringOptions } from "@sinclair/typebox";
import { String } from "./String";

export function RelativeJsonPointer(
	options?: StringOptions & { nullable?: boolean },
) {
	return String({
		...options,
		format: "relative-json-pointer",
		maxLength: 256,
		minLength: 1,
	});
}
