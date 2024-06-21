import type { StringOptions } from "@sinclair/typebox";
import { String } from "./String";

export function JsonPointer(options?: StringOptions & { nullable?: boolean }) {
	return String({
		...options,
		format: "json-pointer",
		maxLength: 256,
		minLength: 1,
	});
}
