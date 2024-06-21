import { ValueErrorType } from "@sinclair/typebox/errors";
import { HttpErrorCodes } from "@vermi/core";
import { getKeyByValue, snakeCase } from "@vermi/utils";
import { ValidationException } from "typebox-validators";
import { RouterException } from "./RouterException";

export class BadRequest extends RouterException {
	code = "router:bad_request";

	constructor(message: string, cause?: Error) {
		super(HttpErrorCodes.BadRequest, message, cause);

		if (this.cause instanceof ValidationException) {
			this.errors = [];

			for (const error of this.cause.details) {
				const errType = snakeCase(getKeyByValue(ValueErrorType, error.type));
				this.errors.push({
					type: errType,
					path: error.path,
					message: error.message,
				});
			}
		}
	}
}
