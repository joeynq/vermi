import type { StringOptions } from "@sinclair/typebox";
import { String } from "./String";

export function Uuid(options?: StringOptions) {
	return String({ ...options, format: "uuid", minLength: 36, maxLength: 36 });
}
