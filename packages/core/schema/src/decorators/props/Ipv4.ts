import type { StringOptions } from "@sinclair/typebox";
import { String } from "./String";

export function IpV4(options?: StringOptions & { nullable?: boolean }) {
	return String({ ...options, format: "ipv4", maxLength: 15, minLength: 7 });
}
