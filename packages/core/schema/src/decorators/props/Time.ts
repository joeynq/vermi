import type { StringOptions } from "@sinclair/typebox";
import { String } from "./String";

export function Time(options?: StringOptions & { nullable?: boolean }) {
	return String({ ...options, format: "time", maxLength: 8, minLength: 8 });
}
