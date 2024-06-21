import type { StringOptions } from "@sinclair/typebox";
import { String } from "./String";

export function Regex(options?: StringOptions & { nullable?: boolean }) {
	return String({ ...options, format: "regex" });
}
