import type { StringOptions } from "@sinclair/typebox";
import { String } from "./String";

export function UriTemplate(options?: StringOptions & { nullable?: boolean }) {
	return String({
		...options,
		format: "uri-template",
		maxLength: 2083,
		minLength: 1,
	});
}
