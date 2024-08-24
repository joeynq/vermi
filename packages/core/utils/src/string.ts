import {
	type Options as CaseOptions,
	camelCase,
	constantCase,
	kebabCase,
	pascalCase,
	snakeCase,
} from "change-case";
import pupa, { type Options } from "pupa";
import { deburr } from "./internal/deburr";

export const uuid = () => {
	return crypto.randomUUID();
};

export function slugify(text: string, separator = "-") {
	return deburr(text.normalize("NFKD"))
		.toLowerCase() // Convert the string to lowercase letters
		.replace(/[^\w-]+/g, " ") // Remove all non-word chars
		.trim() // Trim leading/trailing spaces
		.replace(/\s+/g, separator) // Replace spaces with -
		.replace(/--+/g, separator); // Replace multiple - with single -
}

// e.g. "/sad/:cardId/ses/:userId/sss" --> { cardId: string, userId: string }
export type ExtractParams<T extends string> =
	T extends `${string}:${infer P}/${infer R}`
		? { [K in P]: string } & ExtractParams<R>
		: T extends `${string}:${infer P}`
			? { [K in P]: string }
			: {};

export const format = (
	text: string,
	data: unknown[] | Record<string, any>,
	options?: Options,
) => {
	return pupa(text, data, {
		ignoreMissing: true,
		...options,
	});
};

export * from "change-case";

const changeCaseWithDelimiter = <
	Options extends CaseOptions,
	CaseFn extends (input: string, options?: Options) => string,
>(
	caseFn: CaseFn,
	input: string,
	delimiter: string,
	options?: Parameters<CaseFn>[1],
) => {
	const splitted = input.split(delimiter);
	return splitted.map((part) => caseFn(part, options)).join(delimiter);
};

export const extendedCamelCase = (
	input: string,
	delimiter = ":",
	options?: Parameters<typeof camelCase>[1],
) => {
	return changeCaseWithDelimiter(camelCase, input, delimiter, options);
};

export const extendedPascalCase = (
	input: string,
	delimiter = ":",
	options?: Parameters<typeof pascalCase>[1],
) => {
	return changeCaseWithDelimiter(pascalCase, input, delimiter, options);
};

export const extendedKebabCase = (
	input: string,
	delimiter = ":",
	options?: Parameters<typeof kebabCase>[1],
) => {
	return changeCaseWithDelimiter(kebabCase, input, delimiter, options);
};

export const extendedConstantCase = (
	input: string,
	delimiter = ":",
	options?: Parameters<typeof constantCase>[1],
) => {
	return changeCaseWithDelimiter(constantCase, input, delimiter, options);
};

export const extendedSnakeCase = (
	input: string,
	delimiter = ":",
	options?: Parameters<typeof snakeCase>[1],
) => {
	return changeCaseWithDelimiter(snakeCase, input, delimiter, options);
};
