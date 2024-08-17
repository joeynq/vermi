import { HttpErrorCodes } from "@vermi/core";
import { RouterException } from "./RouterException";

export class Unauthorized extends RouterException {
	code = "router:unauthorized";

	constructor(message: string, cause?: Error) {
		super(HttpErrorCodes.Unauthorized, message, cause);
	}
}
