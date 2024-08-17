import type { StringOptions } from "@sinclair/typebox";
import { String } from "./String";

export function Hostname(options?: StringOptions & { nullable?: boolean }) {
	return String({
		...options,
		format: "hostname",
		maxLength: 253,
		minLength: 1,
	});
}
