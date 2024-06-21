import { HttpErrorCodes } from "@vermi/core";
import { RouterException } from "./RouterException";

export class InternalServerError extends RouterException {
	code = "router:internal_server_error";

	constructor(message: string, cause?: Error) {
		super(HttpErrorCodes.InternalServerError, message, cause);
	}
}
