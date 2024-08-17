import type { StringOptions } from "@sinclair/typebox";
import { String } from "./String";

export function UriReference(options?: StringOptions & { nullable?: boolean }) {
	return String({
		...options,
		format: "uri-reference",
		maxLength: 2083,
		minLength: 1,
	});
}
