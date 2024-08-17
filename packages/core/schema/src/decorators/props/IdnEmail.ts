import type { StringOptions } from "@sinclair/typebox";
import { String } from "./String";

export function IdnEmail(options?: StringOptions & { nullable?: boolean }) {
	return String({
		...options,
		format: "idn-email",
		maxLength: 254,
		minLength: 3,
	});
}
