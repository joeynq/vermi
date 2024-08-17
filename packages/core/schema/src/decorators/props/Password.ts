import { type StringOptions, Type } from "@sinclair/typebox";
import { limitSettings } from "../../settings";
import { AllOf } from "./AllOf";

export function Password(
	patterns: (string | RegExp)[],
	options?: StringOptions & { nullable?: boolean },
) {
	const { nullable, ...rest } = options || {};

	if (patterns.length === 0) {
		throw new Error("At least one pattern must be provided");
	}

	if (patterns.length === 1) {
		const pattern = patterns[0];
		return Type.String({
			pattern: pattern instanceof RegExp ? pattern.source : pattern,
			format: "password",
			...rest,
			maxLength: limitSettings.passwordMaxLength,
			minLength: limitSettings.passwordMinLength,
			nullable,
		});
	}

	const patternStrings = patterns.map((pattern) => {
		if (pattern instanceof RegExp) {
			return pattern.source;
		}
		return pattern;
	});

	return AllOf(
		patternStrings.map((pattern) =>
			Type.String({
				pattern,
				format: "password",
				...rest,
				maxLength: limitSettings.passwordMaxLength,
				minLength: limitSettings.passwordMinLength,
			}),
		),
		{ nullable },
	);
}
