import { HttpException } from "@vermi/core";
import { ValidationException } from "typebox-validators";
import { BadRequest, InternalServerError } from "../exceptions";
import type { RouteMatch } from "../interfaces";
import { Res } from "./Res";

export const defaultErrorHandler = (error: Error) => {
	if (error instanceof ValidationException) {
		return Res.error(new BadRequest(error.message, error));
	}
	if (error instanceof HttpException) {
		return Res.error(error);
	}

	return Res.error(new InternalServerError(error.message, error));
};

export const defaultResponseHandler = <T>(
	result: T,
	responses: RouteMatch["responses"],
) => {
	if (result instanceof Response) {
		return result;
	}

	if (responses?.get(204)) {
		return Res.empty();
	}

	if (responses?.get(201)) {
		// biome-ignore lint/style/noNonNullAssertion: <explanation>
		const { content } = responses.get(201)!;
		const contentType = content.keys().next().value;
		return Res.created(result, { "Content-Type": contentType });
	}
	if (responses?.get(200)) {
		// biome-ignore lint/style/noNonNullAssertion: <explanation>
		const { content } = responses.get(200)!;
		const contentType = content.keys().next().value;
		return Res.ok(result, { "Content-Type": contentType });
	}

	return Res.ok(result);
};
