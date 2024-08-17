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
