import type { StringOptions } from "@sinclair/typebox";
import { String } from "./String";

export function Byte(options?: StringOptions & { nullable?: boolean }) {
	return String({ ...options, format: "byte" });
}
