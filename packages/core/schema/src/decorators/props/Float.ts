import type { NumberOptions } from "@sinclair/typebox";
import { Number } from "./Number";

export function Float(options?: NumberOptions & { nullable?: boolean }) {
	return Number({ ...options, format: "float" });
}
