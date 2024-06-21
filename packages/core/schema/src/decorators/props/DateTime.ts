import type { StringOptions } from "@sinclair/typebox";
import { String } from "./String";

export function DateTime(options?: StringOptions & { nullable?: boolean }) {
	return String({
		...options,
		format: "date-time",
		maxLength: 29,
		minLength: 29,
	});
}
