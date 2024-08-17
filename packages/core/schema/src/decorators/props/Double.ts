import type { NumberOptions } from "@sinclair/typebox";
import { Number } from "./Number";

export function Double(options?: NumberOptions & { nullable?: boolean }) {
	return Number({ ...options, format: "double" });
}
