import type { StringOptions } from "@sinclair/typebox";
import { String } from "./String";

export function Uri(options?: StringOptions & { nullable?: boolean }) {
	return String({ ...options, format: "uri", maxLength: 2083, minLength: 1 });
}
