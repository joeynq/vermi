import type { StringOptions } from "@sinclair/typebox";
import { String } from "./String";

export function Pattern(
	pattern: RegExp | string,
	options?: StringOptions & { nullable?: boolean },
) {
	return String({
		...options,
		pattern: typeof pattern === "string" ? pattern : pattern.source,
	});
}
