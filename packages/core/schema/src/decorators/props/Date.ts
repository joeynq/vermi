import type { StringOptions } from "@sinclair/typebox";
import { String } from "./String";

export function Date(options?: StringOptions & { nullable?: boolean }) {
	return String({ ...options, format: "date", maxLength: 10, minLength: 10 });
}
