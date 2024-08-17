import { Integer, type IntegerOptions } from "@sinclair/typebox";

export function BigInt(options?: IntegerOptions & { nullable: boolean }) {
	return Integer({ ...options, format: "int64" });
}

export { BigInt as Long };
