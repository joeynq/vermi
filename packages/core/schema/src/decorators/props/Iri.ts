import type { StringOptions } from "@sinclair/typebox";
import { String } from "./String";

export function Iri(options?: StringOptions & { nullable?: boolean }) {
	return String({ ...options, format: "iri", maxLength: 2083, minLength: 1 });
}
