import type { StringOptions } from "@sinclair/typebox";
import { String } from "./String";

export function IriReference(options?: StringOptions & { nullable?: boolean }) {
	return String({
		...options,
		format: "iri-reference",
		maxLength: 2083,
		minLength: 1,
	});
}
