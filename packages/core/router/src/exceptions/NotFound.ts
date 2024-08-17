import { HttpErrorCodes } from "@vermi/core";
import { RouterException } from "./RouterException";

export class NotFound extends RouterException {
	code = "router:not_found";

	constructor(message: string, cause?: Error) {
		super(HttpErrorCodes.NotFound, message, cause);
	}
}
