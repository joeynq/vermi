import type { StringOptions } from "@sinclair/typebox";
import { String } from "./String";

export function IdnHostname(options?: StringOptions & { nullable?: boolean }) {
	return String({
		...options,
		format: "idn-hostname",
		maxLength: 253,
		minLength: 1,
	});
}
