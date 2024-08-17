import { AssertionError } from "node:assert";
import { format } from "./string";

type Assert = <E extends Error = AssertionError>(
	condition: unknown,
	message?: string | E,
) => asserts condition;

type AssertValue = <T, E extends Error = AssertionError>(
	condition: unknown,
	value: T,
	message?: string | E,
) => asserts condition is T;

type AssertPromise = <T, E extends Error = Error>(
	value: Promise<T>,
	message?: string | E,
) => Promise<NonNullable<T>>;

const createError = <E extends Error>(error: string | E) => {
	if (typeof error === "string") {
		return new AssertionError({ message: error });
	}
	error.message = format(error.message, { type: error.name });
	return error;
};

export const ensure: Assert = (
	condition: unknown,
	message = "Condition is falsy",
): asserts condition => {
	if (condition === null || condition === undefined) {
		throw createError(message);
	}
};

export const ensureValue: AssertValue = <T, E extends Error = AssertionError>(
	condition: unknown,
	value: T,
	message: E | string = "Condition is not equal to {value}",
): asserts condition is T => {
	if (condition !== value) {
		throw createError(message);
	}
};

export const ensureTruthy: Assert = (
	condition: unknown,
	message = "Condition is not truthy",
): asserts condition => {
	return ensureValue(condition, true, message);
};

export const ensureFalsy: Assert = (
	condition: unknown,
	message = "Condition is not falsy",
): asserts condition => {
	return ensureValue(condition, false, message);
};

export const ensurePromise: AssertPromise = async <T, E extends Error = Error>(
	value: Promise<T>,
	message?: string | E,
): Promise<NonNullable<T>> => {
	const result = await value;
	ensure(result, message);
	return result;
};
