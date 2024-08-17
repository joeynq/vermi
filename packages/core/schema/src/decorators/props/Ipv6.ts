import type { StringOptions } from "@sinclair/typebox";
import { String } from "./String";

export function Ipv6(options?: StringOptions & { nullable?: boolean }) {
	return String({ ...options, format: "ipv6", maxLength: 39, minLength: 3 });
}
