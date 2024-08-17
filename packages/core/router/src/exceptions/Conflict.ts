import { HttpErrorCodes } from "@vermi/core";
import { RouterException } from "./RouterException";

export class Conflict extends RouterException {
	code = "router:conflict";

	constructor(message: string, cause?: Error) {
		super(HttpErrorCodes.Conflict, message, cause);
	}
}
