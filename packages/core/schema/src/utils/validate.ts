import { TypeCompiler } from "@sinclair/typebox/compiler";
import { ValidationException } from "typebox-validators";
import type { ValidationFn } from "../interfaces";

export const validate: ValidationFn = async (schema, value): Promise<void> => {
	const C = TypeCompiler.Compile(schema);

	const errors = [...C.Errors(value)];

	if (errors.length) {
		throw new ValidationException("Validation failed", errors);
	}
};
