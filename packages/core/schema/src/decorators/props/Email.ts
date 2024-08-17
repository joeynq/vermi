import type { StringOptions } from "@sinclair/typebox";
import { String } from "./String";

export function Email(options?: StringOptions & { nullable?: boolean }) {
	return String({ ...options, format: "email", maxLength: 320, minLength: 6 });
}
